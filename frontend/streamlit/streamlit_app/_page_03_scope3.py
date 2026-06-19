from pathlib import Path
import json
"""
Page 03 — Scope 3 Emissions.
All 15 categories, tabbed. Only material categories shown (from Setup).
"""
import streamlit as st
from modules.base import ActivityRecord
from core.engine import calculate
from streamlit_app.components.calc_trace import calc_trace
from streamlit_app.components.ef_badge import fallback_warning


def render():
    st.title("🔗 Scope 3 — Value Chain Emissions")

    profile = st.session_state.org_profile
    if not profile.get("setup_done"):
        st.warning("Complete ⚙️ Setup first.")
        return

    # ── org_id + inventory resolved from auth user (bypasses session timing) ──
    from streamlit_app._org_helper import fix_page
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Please log in to access this page.")
        return
    # Update local profile copy so forms write to the right org
    profile = dict(profile)
    profile["org_uuid"] = org_id
    profile["org_id"]   = org_id


    with st.expander("📐 Methodology & standards reference", expanded=False):
        st.caption(
            "GHG Protocol Scope 3 — Value chain emissions (15 categories). "
            "Standard: GHG Protocol Corporate Value Chain Standard (2011). "
            "Materiality screening required; quantify all material categories."
        )
        mt1, mt2, mt3, mt4 = st.tabs([
            "Cat 1 Goods", "Cat 4/9 Transport", "Cat 6 Travel", "Cat 15 Finance"
        ])
        with mt1:
            st.markdown("**Method A (spend):** Spend (USD) × EEIO sector EF (kgCO₂e/USD)")
            st.markdown("**Method B (supplier):** Supplier-reported Scope 1+2 × attribution share")
            st.caption("EEIO EFs: US EPA 2016 USEEIO v2.0. Convert INR→USD via FX rate in Setup.")
        with mt2:
            st.markdown("**Cat 4 (upstream):** Freight qty (t) × distance (km) × EF (kgCO₂e/t·km)")
            st.markdown("**Cat 9 (downstream):** Same formula — emissions from customer logistics")
            st.caption("EFs: DEFRA 2024 freight (road diesel: 0.0962, rail: 0.0289, sea: 0.0116 kgCO₂e/t·km).")
        with mt3:
            st.markdown("**Flights:** Passenger-km × haul-based EF (short/long-haul)")
            st.markdown("**Rail/Road:** Passenger-km × mode EF")
            st.caption("EFs: DEFRA 2024 passenger transport. RFI factor 1.9 for aviation radiative forcing (optional).")
        with mt4:
            st.markdown("**PCAF Standard v3 2025** — Attribution factor method")
            st.markdown("**Equity/bonds:** Outstanding amount ÷ EVIC × borrower emissions")
            st.markdown("**Project finance:** Outstanding ÷ project value × project-level EF")
            st.caption("PCAF Data Quality Score 1–5 required for all investment records.")


    conn = st.session_state.ef_conn
    material = set(profile.get("s3_material", []))
    org_id   = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year = profile.get("reporting_year", 2024)

    # ── Organisational tagging ────────────────────────────────────────────
    with st.expander("🏷️ Tag records (site / department / cost centre)", expanded=False):
        st.caption("Optional: tag all S3 records saved this session for site-level reporting.")
        tc1, tc2, tc3 = st.columns(3)
        _s3_site = tc1.text_input("Site / facility", key="s3_tag_site", placeholder="e.g. Mumbai Plant")
        _s3_dept = tc2.text_input("Department",      key="s3_tag_dept", placeholder="e.g. Supply Chain")
        _s3_cc   = tc3.text_input("Cost centre",     key="s3_tag_cc",   placeholder="e.g. CC-4202")
        # Supplier linkage
        sup_file = Path(__file__).parents[1] / "data" / "suppliers.json"
        _sup_names = ["— None —"]
        if sup_file.exists():
            try:
                _sup_names += [s["name"] for s in json.loads(sup_file.read_text(encoding="utf-8"))]
            except Exception:
                pass
        _s3_supplier = st.selectbox(
            "Link to supplier", _sup_names,
            key="s3_tag_supplier",
            help="Links these emissions to a supplier for Cat 1/4 attribution."
        )
        st.session_state["_s3_tags"] = {
            "site": _s3_site or None,
            "department": _s3_dept or None,
            "cost_centre": _s3_cc or None,
            "supplier_name": _s3_supplier if _s3_supplier != "— None —" else None,
        }

    # Import modules to trigger self-registration
    _import_all_s3_modules()

    # ── Running S3 total sidebar ──────────────────────────────────────────
    try:
        s3_summary = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
        s3_total   = s3_summary.get("scope3_t_co2e", 0)
        n_s3_recs  = sum(1 for _ in inventory.get_all_records(
            org_id=org_id, inventory_year=inv_year, scope="Scope 3"))
        if s3_total > 0 or n_s3_recs > 0:
            with st.sidebar:
                st.markdown("---")
                st.markdown("**📊 Scope 3 total (saved)**")
                st.metric("tCO₂e", f"{s3_total:,.4f}")
                st.caption(f"{n_s3_recs} records · {inv_year}")
                # Category breakdown + completeness
                by_cat = inventory.get_by_category(
                    org_id=org_id, inventory_year=inv_year)
                s3_cats = [(r["category"], r["t_CO2e"]) for r in by_cat
                           if r["scope"] == "Scope 3" and r.get("t_CO2e", 0) > 0]
                n_material = len(material) if material else 15
                n_filled   = len(s3_cats)
                completeness_pct = round(n_filled / n_material * 100) if n_material else 0
                st.progress(min(completeness_pct, 100) / 100,
                            text=f"{n_filled}/{n_material} categories ({completeness_pct}%)")
                if s3_cats:
                    for cat, val in sorted(s3_cats, key=lambda x: -x[1])[:5]:
                        st.caption(f"{cat[:28]}: {val:,.2f}")
                    if len(s3_cats) > 5:
                        st.caption(f"+ {len(s3_cats)-5} more categories")
    except Exception:
        pass  # sidebar not critical — silently skip on error

    st.caption(
        f"Showing {len(material) if material else 15} material categories. "
        "Change selection in ⚙️ Setup."
    )

    # ── Excel bulk upload (all S3 categories at once) ────────────────────
    
    # ── Template download shortcut ────────────────────────────────────────
    with st.expander("📥 Download upload template", expanded=False):
        from pathlib import Path as _TPath
        _tmpl = _TPath(__file__).parents[1] / 'templates' / 'GHG_Activity_Upload_Template.xlsx'
        if _tmpl.exists():
            try:
                import openpyxl as _ox, io as _io
                _wb = _ox.load_workbook(str(_tmpl))
                _keep = ['INSTRUCTIONS', 'S3_Cat1_Goods', 'S3_Cat3_Energy', 'S3_Cat4_Transport', 'S3_Cat5_Waste', 'S3_Cat6_Travel', 'S3_Cat7_Commuting', 'S3_Cat8_Leased', 'S3_Cat9_Outbound', 'S3_Cat11_Products', 'S3_Cat15_Finance']
                for _sh in list(_wb.sheetnames):
                    if _sh not in _keep:
                        del _wb[_sh]
                _buf = _io.BytesIO()
                _wb.save(_buf)
                _buf.seek(0)
                st.download_button(
                    "⬇️ Scope 3 template",
                    data=_buf.read(),
                    file_name="Scope_3_template.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    key="dl_tmpl_p__page_03_scope3",
                    help="Pre-formatted Excel template. Fill rows 6+ and upload below.",
                )
            except Exception:
                pass
        else:
            st.caption("Full template available in 📤 Export → Upload templates.")
    
    from streamlit_app.components.excel_upload import excel_bulk_upload
    excel_bulk_upload(conn, inventory, profile,
                      label="Bulk upload from Excel template (all S3 categories)")

    st.markdown("---")

    # All 15 GHG Protocol Scope 3 categories
    # ── Industry materiality crossmap ────────────────────────────────────
    industry = profile.get("industry", "")
    _IND_MATERIAL = {
        "Manufacturing": {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 9","Cat 11","Cat 12"},
        "Automotive":    {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 11","Cat 12"},
        "Cement":        {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 9","Cat 12"},
        "Chemicals":     {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 9","Cat 11"},
        "Electronics":   {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 11","Cat 12"},
        "FMCG":          {"Cat 1","Cat 4","Cat 5","Cat 9","Cat 11","Cat 12"},
        "Consumer":      {"Cat 1","Cat 4","Cat 5","Cat 9","Cat 11","Cat 12"},
        "Metals":        {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 9"},
        "Pharmaceutical":{"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 6","Cat 7"},
        "Textiles":      {"Cat 1","Cat 4","Cat 5","Cat 9","Cat 12"},
        "Oil":           {"Cat 1","Cat 3","Cat 9","Cat 11","Cat 13","Cat 15"},
        "Power":         {"Cat 1","Cat 3","Cat 9","Cat 11","Cat 13","Cat 15"},
        "Renewable":     {"Cat 1","Cat 2","Cat 3","Cat 13","Cat 15"},
        "Energy":        {"Cat 1","Cat 3","Cat 9","Cat 11","Cat 13","Cat 15"},
        "Agriculture":   {"Cat 1","Cat 4","Cat 5","Cat 9","Cat 11","Cat 12","Cat 14"},
        "Food":          {"Cat 1","Cat 4","Cat 5","Cat 9","Cat 11","Cat 12","Cat 14"},
        "Information":   {"Cat 1","Cat 3","Cat 6","Cat 7","Cat 11","Cat 15"},
        "Software":      {"Cat 1","Cat 3","Cat 6","Cat 7","Cat 11","Cat 15"},
        "Technology":    {"Cat 1","Cat 3","Cat 6","Cat 7","Cat 11","Cat 15"},
        "Financial":     {"Cat 3","Cat 6","Cat 7","Cat 15"},
        "Banking":       {"Cat 3","Cat 6","Cat 7","Cat 15"},
        "Insurance":     {"Cat 3","Cat 6","Cat 7","Cat 15"},
        "Asset":         {"Cat 3","Cat 6","Cat 7","Cat 15"},
        "Retail":        {"Cat 1","Cat 4","Cat 5","Cat 9","Cat 11","Cat 12"},
        "Healthcare":    {"Cat 1","Cat 2","Cat 3","Cat 4","Cat 5","Cat 6","Cat 7"},
        "Logistics":     {"Cat 1","Cat 3","Cat 4","Cat 9","Cat 13"},
        "Transport":     {"Cat 1","Cat 3","Cat 4","Cat 9","Cat 13"},
        "Real Estate":   {"Cat 1","Cat 2","Cat 3","Cat 13"},
        "Hospitality":   {"Cat 1","Cat 3","Cat 4","Cat 6","Cat 7","Cat 14"},
    }
    _CAT_WHY = {
        "Cat 1 — Purchased goods":
            "Usually the largest S3 category for product companies. "
            "Covers upstream emissions in raw materials, packaging, and services you buy.",
        "Cat 2 — Capital goods":
            "One-time emissions from equipment, machinery, vehicles, and buildings purchased this year.",
        "Cat 3 — Upstream energy":
            "Well-to-tank (WTT) emissions from producing the fuel and electricity you use. "
            "Required alongside Scope 1/2 by the GHG Protocol.",
        "Cat 4 — Upstream transport":
            "Third-party freight you pay for to bring raw materials and goods to your sites.",
        "Cat 5 — Waste":
            "Treatment and disposal of waste generated in your own operations.",
        "Cat 6 — Business travel":
            "Flights, rail, taxis, and hotels for employee business trips. "
            "Highest for consulting, banking, and professional services.",
        "Cat 7 — Commuting":
            "Employee travel between home and office. Included even if you do not pay for it.",
        "Cat 8 — Upstream leased":
            "Scope 1+2 of assets leased from others and operated by you.",
        "Cat 9 — Downstream transport":
            "Third-party freight to deliver your products to customers.",
        "Cat 10 — Processing":
            "Emissions when intermediate product buyers further process your goods.",
        "Cat 11 — Use of products":
            "Lifetime emissions when customers use your sold products. "
            "Critical for cars, appliances, fuels, and electronics.",
        "Cat 12 — End-of-life":
            "Emissions from disposal or recycling of your products after customers discard them.",
        "Cat 13 — Downstream leased":
            "Scope 1+2 of buildings or assets you own but lease to tenants.",
        "Cat 14 — Franchises":
            "Scope 1+2 of all franchised outlets operating under your brand.",
        "Cat 15 — Investments":
            "Financed emissions from equity stakes, project finance, bonds, and loans "
            "(PCAF standard). Mandatory for banks and asset managers.",
    }

    # Find industry match
    _ind_material_cats: set = set()
    for kw, cats in _IND_MATERIAL.items():
        if kw.lower() in industry.lower():
            _ind_material_cats = cats
            break

    _profile_material   = set(profile.get("s3_material_cats", profile.get("s3_material", [])))
    _effective_material = _profile_material or _ind_material_cats

    def _is_material(cat_name: str) -> bool:
        if not _effective_material:
            return True
        cat_key = cat_name.split("—")[0].strip()
        return any(cat_key in m or m in cat_key for m in _effective_material)

    IMPLEMENTED = {
        "Cat 1 — Purchased goods":      _cat01,
        "Cat 2 — Capital goods":        _cat02,
        "Cat 3 — Upstream energy":      _cat03,
        "Cat 4 — Upstream transport":   _cat04,
        "Cat 5 — Waste":                _cat05,
        "Cat 6 — Business travel":      _cat06,
        "Cat 7 — Commuting":            _cat07,
        "Cat 8 — Upstream leased":      _cat08,
        "Cat 9 — Downstream transport": _cat09,
        "Cat 10 — Processing":          _cat10,
        "Cat 11 — Use of products":     _cat11,
        "Cat 12 — End-of-life":         _cat12,
        "Cat 13 — Downstream leased":   _cat13,
        "Cat 14 — Franchises":          _cat14,
        "Cat 15 — Investments":         _cat15,
    }

    def _tab_label(cat_name: str) -> str:
        short = "C" + cat_name[3:]
        return short if _is_material(cat_name) else ("□ " + short)

    tab_labels = [_tab_label(c) for c in IMPLEMENTED]
    tabs = st.tabs(tab_labels)

    if _effective_material and industry:
        n_mat = sum(1 for c in IMPLEMENTED if _is_material(c))
        ind_short = industry.split(" — ")[-1]
        st.caption(
            "Material for " + ind_short + ": "
            + str(n_mat) + " categories shown normally, "
            + str(15 - n_mat) + " marked □ (usually not required). "
            "Change in ⚙️ Setup."
        )

    for i, cat_name in enumerate(IMPLEMENTED):
        with tabs[i]:
            if not _is_material(cat_name):
                why = _CAT_WHY.get(cat_name, "")
                ind_short = industry.split(" — ")[-1] if industry else "your industry"
                lines = [
                    "□ **" + cat_name + "** is typically **not required** for **"
                    + ind_short + "**.",
                ]
                if why:
                    lines.append("_" + why + "_")
                lines.append(
                    "You can still enter data here if it applies to your operations."
                )
                st.info("  \n\n".join(lines))
            IMPLEMENTED[cat_name](conn, inventory, profile)


# ── Category renderers ───────────────────────────────────────────────────────

def _cat01(conn, inventory, profile):
    st.markdown("#### Cat 1 — Purchased goods & services")
    method = st.radio("Method", [
        "Average-data (mass × cradle-to-gate EF)",
        "Spend-based (EEIO)",
        "Supplier-specific EF",
    ], key="cat1_method", horizontal=True)

    ITEMS = list(["steel", "aluminium", "recycled_steel", "copper", "plastic_general",
                  "glass", "paper", "cardboard", "cement", "electronics",
                  "food_average", "chemicals_general", "wood", "cotton", "other"])

    if "EEIO" in method:
        process = "S3 Cat 1 — Purchased goods & services (spend-based EEIO)"
        units = ["USD", "INR", "EUR", "GBP"]

        # ── EEIO sector selector (fixes zero-output bug: fuel_or_item must be a sector code) ──
        _eeio_sector_code = None
        try:
            rows = conn.execute(
                "SELECT DISTINCT sector_code, sector_name FROM eeio_factors "
                "ORDER BY sector_name LIMIT 220"
            ).fetchall()
            if rows:
                st.caption(
                    f"**{len(rows)} EEIO sectors available** (USEEIO v2). "
                    "Select your procurement sector — this determines the emission factor."
                )
                # Build label→code map for selectbox
                _sector_options = ["— select sector —"] + [
                    f"{name} [{code}]" for code, name in rows
                ]
                _sector_sel = st.selectbox(
                    "EEIO sector (required for spend-based EF)",
                    _sector_options,
                    key="cat1_eeio_sector",
                    help="Pick the sector that best describes what you're buying. "
                         "This maps to a USEEIO v2 emission factor (kgCO₂e / USD)."
                )
                if _sector_sel and _sector_sel != "— select sector —":
                    # Extract code from "Name [CODE]" format
                    _eeio_sector_code = _sector_sel.split("[")[-1].rstrip("]").strip()
                    # Show the EF for the selected sector
                    try:
                        ef_row = conn.execute(
                            "SELECT ef_kgco2e_per_usd FROM eeio_factors "
                            "WHERE sector_code = ? LIMIT 1",
                            (_eeio_sector_code,)
                        ).fetchone()
                        if ef_row:
                            st.caption(
                                f"✓ Sector EF: **{ef_row[0]:.4f} kgCO₂e / USD** "
                                f"for `{_eeio_sector_code}`"
                            )
                    except Exception:
                        pass
                else:
                    st.info("⚠️ Select an EEIO sector above — without a sector the EF lookup returns 0.")
            else:
                st.warning("EEIO factor table is empty. Run EF Manager → Re-ingest seeds.")
        except Exception as _e:
            st.caption(f"Could not load EEIO sectors: {_e}")

        items = [_eeio_sector_code] if _eeio_sector_code else ["general"]

    elif "Supplier" in method:
        process = "S3 Cat 1 — Purchased goods & services (supplier-specific EF)"
        units = ["kg", "t", "unit", "piece"]
        items = ITEMS
        st.caption(
            "Enter supplier-provided cradle-to-gate EF in the 'extra' field, "
            "or use the supplier data request template from the Export page."
        )
    else:
        process = "S3 Cat 1 — Purchased goods & services (average-data EF per mass/unit)"
        units = ["kg", "t", "kt"]
        items = ITEMS

    pairs = _generic_table("cat01", "Scope 3", process, items, units,
                            conn, profile, "Cat 1 purchased goods")
    _save_button("cat01", pairs, inventory, profile)



def _cat04(conn, inventory, profile):
    st.markdown("#### Cat 4 — Upstream transport & distribution")
    st.caption("Third-party freight for purchased goods. Formula: tonnage x distance x mode EF.")

    CAT4_EF = {
        "Road - HGV diesel": 0.0962, "Road - HGV CNG": 0.0712,
        "Road - LCV diesel": 0.1680, "Road - Van (<3.5t)": 0.2340,
        "Rail - diesel": 0.0289,     "Rail - electric": 0.0054,
        "Sea - container": 0.0116,   "Sea - bulk": 0.0078,
        "Air - freight": 0.6026,     "Inland waterway": 0.0311,
    }

    tab_vehicle, tab_simple, tab_journey = st.tabs([
        "Vehicle inventory builder", "Quick entry (tonne-km)", "Multi-modal journey",
    ])

    with tab_vehicle:
        st.caption("Build a lane-by-lane inventory. Enter vehicle type, distance, load, trips/year.")
        if "cat4_rows" not in st.session_state:
            st.session_state.cat4_rows = []

        with st.form("cat4_veh_form"):
            vc1, vc2 = st.columns(2)
            v_sup  = vc1.text_input("Supplier / origin", placeholder="Alpha Metals, Bhilai")
            v_dest = vc2.text_input("Destination site",  placeholder="Pune Plant")
            vc3, vc4, vc5, vc6 = st.columns(4)
            v_mode  = vc3.selectbox("Mode / vehicle type", list(CAT4_EF.keys()))
            v_dist  = vc4.number_input("Distance (km)",    min_value=0.0, format="%.1f")
            v_wt    = vc5.number_input("Load (tonnes)",    min_value=0.0, format="%.2f")
            v_trips = vc6.number_input("Trips / year",     min_value=0, step=1)
            v_ef    = CAT4_EF.get(v_mode, 0.0962)
            v_tkm   = v_dist * v_wt * int(v_trips or 0)
            v_co2   = v_tkm * v_ef / 1000
            st.metric("tCO2e/yr (preview)", f"{v_co2:.3f}")
            v_sub = st.form_submit_button("Add lane", type="primary")
            if v_sub and v_dist > 0 and v_wt > 0 and int(v_trips or 0) > 0:
                st.session_state.cat4_rows.append({
                    "supplier": v_sup,   "destination": v_dest,
                    "mode": v_mode,      "distance_km": v_dist,
                    "weight_t": v_wt,    "trips_yr": int(v_trips),
                    "tonne_km": round(v_tkm, 1),
                    "tco2e": round(v_co2, 4),
                })
                st.rerun()

        rows = st.session_state.cat4_rows
        if rows:
            try:
                import pandas as pd
                df4 = pd.DataFrame(rows)
                st.dataframe(df4[["supplier","destination","mode",
                                  "distance_km","weight_t","trips_yr","tonne_km","tco2e"]],
                             use_container_width=True, hide_index=True)
                total = sum(r["tco2e"] for r in rows)
                st.metric("Total Cat 4 tCO2e/yr", f"{total:.3f}")
            except ImportError:
                for r in rows:
                    st.write(f"{r['supplier']} -> {r['destination']}: {r['tco2e']:.3f} tCO2e")
            sc1, sc2 = st.columns(2)
            if sc1.button("Save all lanes to inventory", type="primary", key="cat4_save"):
                from core.engine import calculate
                saved = 0
                for row in rows:
                    try:
                        ar = ActivityRecord(
                            scope="Scope 3",
                            process="S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
                            country=profile.get("primary_country","IN"),
                            quantity=row["tonne_km"], unit="tonne-km",
                            reporting_year=profile.get("reporting_year",2024),
                            fiscal_year=profile.get("fiscal_year",""),
                            gwp_ar=profile.get("gwp_ar",6),
                        )
                        result = calculate(ar, conn)
                        inventory.persist(result, ar, profile.get("reporting_year",2024))
                        saved += 1
                    except Exception as _e:
                        st.error(f"Lane error: {_e}")
                if saved:
                    st.session_state.cat4_rows = []
                    st.success(f"Saved {saved} Cat 4 lane(s).")
                    st.rerun()
            if sc2.button("Clear all lanes", key="cat4_clear"):
                st.session_state.cat4_rows = []
                st.rerun()

        with st.expander("Cat 4 methodology — DEFRA 2024 / GHG Protocol Cat 4", expanded=False):
            st.markdown("**Standard:** GHG Protocol Corporate Value Chain Standard Cat 4.")
            st.markdown("**Formula:** tonne-km/yr x EF (kgCO2e/tonne-km) / 1000")
            st.markdown("**EF source:** DEFRA 2024 Conversion Factors (freight transport modes).")
            st.caption("Activity-based (Tier 3 GHG Protocol) preferred over spend-based EEIO.")

    MODES = ["truck","rail","ship","container_ship","air","intermodal",
             "truck_rigid","truck_articulated","van","coastal_ship_india"]
    UNITS = ["tonne-km","km","miles"]

    with tab_simple:
        st.caption("Enter total tonne-km if you have aggregated logistics data.")
        pairs = _generic_table("cat04","Scope 3",
                               "S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
                               MODES, UNITS, conn, profile, "Cat 4 transport")
        _save_button("cat04", pairs, inventory, profile)

    with tab_journey:
        try:
            from streamlit_app.components.journey_builder import journey_builder
            jb_records = journey_builder(conn, profile, category="Cat4", key_prefix="cat04_jb")
            if jb_records:
                if st.button("Save journey legs", key="cat04_jb_save", type="primary"):
                    from core.engine import calculate
                    saved = 0
                    for rec in jb_records:
                        try:
                            result = calculate(rec, conn)
                            inventory.persist(result, rec, profile.get("reporting_year",2024))
                            saved += 1
                        except Exception as e:
                            st.error(f"Leg error: {e}")
                    if saved:
                        st.success(f"Saved {saved} leg(s).")
        except ImportError:
            st.info("Journey builder requires the full app environment.")

def _cat05(conn, inventory, profile):
    st.markdown("#### Cat 5 — Waste generated in operations")

    TREATMENTS = [
        "landfill_msw", "landfill_food", "landfill_paper",
        "incineration_msw", "incineration_hazardous",
        "composting", "anaerobic_digestion",
        "recycling_paper", "recycling_plastic", "recycling_metal",
        "recycling_mixed", "open_dump", "india_average_mix",
    ]
    UNITS = ["t", "kg", "kt"]

    pairs = _generic_table("cat05", "Scope 3",
                            "S3 Cat 5 — Waste generated in operations (waste-type-specific)",
                            TREATMENTS, UNITS, conn, profile, "Cat 5 waste")
    _save_button("cat05", pairs, inventory, profile)


def _cat06(conn, inventory, profile):
    st.markdown("#### Cat 6 — Business travel")
    st.caption(
        "Flights, rail, hotel stays. "
        "Enter by flight number (ICAO fuel method) or by distance/mode."
    )

    method = st.radio(
        "Entry method",
        ["✈️ Flight number (ICAO fuel method)", "📏 Distance / mode"],
        key="cat6_method", horizontal=True,
    )

    rf_factor = st.number_input(
        "Radiative forcing multiplier",
        value=1.0, min_value=1.0, max_value=3.0, step=0.1,
        help="1.0 = CO₂ only (GHG Protocol default). 1.9 = full non-CO₂ effects.",
        key="cat6_rf",
    )

    all_pairs = []

    # ── Flight number path ────────────────────────────────────────────────
    if "Flight number" in method:
        st.markdown("**Add flights by flight number or route**")
        st.caption(
            "Enter IATA flight number (e.g. AI101, EK526, 6E1234). "
            "The app resolves the route, aircraft type, and applies the ICAO fuel method."
        )

        n_key = "cat6_fn_n"
        if n_key not in st.session_state:
            st.session_state[n_key] = 1

        ca, cb = st.columns([1, 4])
        with ca:
            if st.button("＋ Flight", key="cat6_fn_add"):
                st.session_state[n_key] += 1
                st.rerun()
            if st.button("－ Flight", key="cat6_fn_rem",
                         disabled=st.session_state[n_key] <= 1):
                st.session_state[n_key] -= 1
                st.rerun()

        # Column headers
        h = st.columns([1.5, 1.2, 1.2, 1, 1.2, 1, 1.5])
        for hdr, col in zip(["Flight no.", "From (IATA)", "To (IATA)",
                              "Pax", "Cabin class", "Trips", "tCO₂e"], h):
            col.caption(hdr)
        st.divider()
        from utils.flight_lookup import parse_flight_number, airport_distance_km

        for i in range(st.session_state[n_key]):
            c1, c2, c3, c4, c5, c6, c7 = st.columns([1.5, 1.2, 1.2, 1, 1.2, 1, 1.5])
            flight_no = c1.text_input("Flight", placeholder="AI101",
                                       key=f"cat6_fn_{i}", label_visibility="collapsed")
            dep = c2.text_input("DEP", placeholder="BOM",
                                 key=f"cat6_dep_{i}", label_visibility="collapsed").upper().strip()
            arr = c3.text_input("ARR", placeholder="LHR",
                                 key=f"cat6_arr_{i}", label_visibility="collapsed").upper().strip()
            pax = c4.number_input("Pax", min_value=1, value=1, step=1,
                                   key=f"cat6_pax_{i}", label_visibility="collapsed")
            cabin = c5.selectbox("Cabin", ["economy","premium_economy","business","first"],
                                  key=f"cat6_cab_{i}", label_visibility="collapsed")
            trips = c6.number_input("×", min_value=1, value=1, step=1,
                                     key=f"cat6_trips_{i}", label_visibility="collapsed",
                                     help="Return = 2")
            result_ph = c7.empty()

            if not dep or not arr or len(dep) != 3 or len(arr) != 3:
                result_ph.caption("Enter DEP/ARR →")
                continue

            try:
                dist = airport_distance_km(dep, arr, conn)
                if dist is None:
                    result_ph.error("Unknown airport code")
                    continue

                airline, fn_num = parse_flight_number(flight_no) if flight_no else ("", "")

                rec = ActivityRecord(
                    scope="Scope 3",
                    process="S3 Cat 6 — Business travel (distance-based passenger-km + hotels)",
                    country=profile.get("primary_country", "IN"),
                    quantity=float(dist * trips),
                    unit="km",
                    fuel_or_item=f"flight_{'long' if dist > 3700 else 'short'}_haul_{cabin}",
                    reporting_year=profile.get("reporting_year", 2024),
                    fiscal_year=profile.get("fiscal_year", ""),
                    gwp_ar=profile.get("gwp_ar", 6),
                    org_id=profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default",
                    extra={
                        "flight_number": flight_no or f"{dep}-{arr}",
                        "dep_iata": dep, "arr_iata": arr,
                        "cabin_class": cabin,
                        "n_passengers": int(pax),
                        "n_trips": int(trips),
                        "rf_factor": rf_factor,
                    },
                )
                result = calculate(rec, conn)
                t = result.t_CO2e
                result_ph.metric("tCO₂e", f"{t:.4f}")
                all_pairs.append((rec, result))

                with st.expander(
                    f"✈️ {dep}→{arr}  {dist:,.0f} km  ×{trips}  {cabin}  {t:.4f} tCO₂e",
                    expanded=False,
                ):
                    d1, d2, d3 = st.columns(3)
                    d1.metric("Distance", f"{dist:,.0f} km")
                    d2.metric("Aircraft method", result.audit_trace.get("aircraft","ICAO"))
                    d3.metric("RF factor", rf_factor)

            except Exception as e:
                result_ph.error(str(e)[:60])

    # ── Distance / mode path ──────────────────────────────────────────────
    else:
        MODES = [
            "flight_short_haul_economy", "flight_short_haul_business",
            "flight_long_haul_economy",  "flight_long_haul_business",
            "flight_long_haul_first",
            "rail", "car_average", "taxi", "bus", "hotel",
        ]
        UNITS = ["km", "miles", "passenger-km", "nights"]
        pairs = _generic_table(
            "cat06", "Scope 3",
            "S3 Cat 6 — Business travel (distance-based passenger-km + hotels)",
            MODES, UNITS, conn, profile, "Cat 6 travel",
            extra={"rf_factor": rf_factor},
        )
        all_pairs.extend(pairs)

    if all_pairs:
        total = sum(r.t_CO2e for _, r in all_pairs)
        st.metric("Cat 6 session total", f"{total:.4f} tCO₂e")
        _save_button("cat06", all_pairs, inventory, profile)



def _cat07(conn, inventory, profile):
    st.markdown("#### Cat 7 — Employee commuting")

    method = st.radio("Method", ["Distance-based", "Average-data"],
                      key="cat7_method", horizontal=True)
    wfh_pct = st.slider("Telework / WFH percentage", 0, 100, 0,
                         key="cat7_wfh",
                         help="% of working days where employees work from home")

    if method == "Distance-based":
        process = "S3 Cat 7 — Employee commuting (distance-based)"
        items = ["car_average", "car_petrol", "car_diesel", "rail", "metro",
                 "bus", "motorcycle", "electric_car", "bicycle", "walk"]
        units = ["employee-km", "km"]
    else:
        process = "S3 Cat 7 — Employee commuting (average-data)"
        items = ["average"]
        units = ["employees"]
        st.caption("Enter number of employees. Uses global average of 1.8 kgCO₂e/employee/working-day.")

    pairs = _generic_table("cat07", "Scope 3", process,
                            items, units, conn, profile, "Cat 7 commuting",
                            extra={"telework_pct": wfh_pct, "working_days": 220})
    _save_button("cat07", pairs, inventory, profile)


def _cat08(conn, inventory, profile):
    st.markdown("#### Cat 8 — Upstream leased assets")
    st.caption("Buildings/offices leased by the company where the lessor controls energy.")

    BLDG_TYPES = ["office", "warehouse", "retail", "data_center",
                  "manufacturing", "hotel", "laboratory", "average"]
    UNITS = ["m2", "m²"]

    time_fraction = st.number_input(
        "Time fraction (fraction of year leased)", value=1.0,
        min_value=0.0, max_value=1.0, step=0.083,
        key="cat8_time",
        help="1.0 = full year; 0.5 = 6 months",
    )

    pairs = _generic_table("cat08", "Scope 3",
                            "S3 Cat 8 — Upstream leased assets (buildings, avg EF by floor area)",
                            BLDG_TYPES, UNITS, conn, profile, "Cat 8 leased",
                            extra={"time_fraction_year": time_fraction})
    _save_button("cat08", pairs, inventory, profile)


# ── Shared helpers ───────────────────────────────────────────────────────────

def _generic_table(key_prefix, scope, process, items, units,
                   conn, profile, label, extra=None):
    n_key = f"{key_prefix}_n"
    if n_key not in st.session_state:
        st.session_state[n_key] = 1

    ca, cb = st.columns([1, 4])
    with ca:
        if st.button("＋ Row", key=f"{key_prefix}_add"):
            st.session_state[n_key] += 1
            st.rerun()
        if st.button("－ Row", key=f"{key_prefix}_rem",
                     disabled=st.session_state[n_key] <= 1):
            st.session_state[n_key] -= 1
            st.rerun()

    h1, h2, h3, h4, h5 = st.columns([2, 1.2, 0.8, 1.2, 1.5])
    for hdr, col in zip(["Item/Type", "Quantity", "Unit", "Country", "tCO₂e"], [h1,h2,h3,h4,h5]):
        col.caption(hdr)
    st.divider()

    completed = []
    for i in range(st.session_state[n_key]):
        c1, c2, c3, c4, c5 = st.columns([2, 1.2, 0.8, 1.2, 1.5])
        with c1:
            item = st.selectbox("Item", items, key=f"{key_prefix}_item_{i}",
                                label_visibility="collapsed")
        with c2:
            qty = st.number_input("Qty", min_value=0.0, value=0.0, format="%.4f",
                                  key=f"{key_prefix}_qty_{i}", label_visibility="collapsed")
        with c3:
            unit = st.selectbox("Unit", units, key=f"{key_prefix}_unit_{i}",
                                label_visibility="collapsed")
        with c4:
            country = st.text_input("Country", value=profile.get("primary_country", "IN"),
                                    key=f"{key_prefix}_country_{i}",
                                    label_visibility="collapsed")
        with c5:
            ph = st.empty()

        if qty <= 0:
            ph.caption("Enter quantity")
            continue

        record = ActivityRecord(
            scope=scope, process=process,
            country=country or profile.get("primary_country", "IN"),
            quantity=qty, unit=unit, fuel_or_item=item,
            reporting_year=profile.get("reporting_year", 2024),
            fiscal_year=profile.get("fiscal_year", ""),
            gwp_ar=profile.get("gwp_ar", 6),
            org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
            extra=extra or {},
        )
        try:
            result = calculate(record, conn)
            ph.metric("tCO₂e", f"{result.t_CO2e:.4f}")
            completed.append((record, result))
            calc_trace(result, label=f"{label} row {i+1}")
        except Exception as e:
            ph.error(str(e)[:60])

    if completed:
        total = sum(r.t_CO2e for _, r in completed)
        st.metric(f"{label} subtotal", f"{total:.4f} tCO₂e")
    return completed


def _save_button(key, pairs, inventory, profile):
    if pairs:
        n_fb = sum(1 for _, r in pairs if r.fallback_triggered)
        fallback_warning(n_fb, len(pairs))
        if st.button("💾 Save to inventory", key=f"save_{key}"):
            inv_year = profile.get("reporting_year", 2024)
            # Duplicate detection
            dupes = [rec for rec, _ in pairs
                     if inventory.find_duplicate(rec, inv_year)]
            if dupes:
                st.warning(
                    f"⚠️ {len(dupes)} record(s) already exist with identical "
                    f"process/fuel/quantity. Saving will add new records alongside existing ones. "
                    f"Check Data manager for duplicates."
                )
            _s3_tags = st.session_state.get("_s3_tags")
            written = inventory.persist_batch(
                [r for _, r in pairs], [rec for rec, _ in pairs],
                inventory_year=inv_year,
                tags=_s3_tags,
            )
            st.toast(f"✅ {written} record(s) saved", icon="✅")
            st.success(f"✓ {written} records saved — visible in 📋 Data manager.")
            st.rerun()


def _import_all_s3_modules():
    try:
        import modules.scope3.cat01_purchased_goods
        import modules.scope3.cat02_capital_goods
        import modules.scope3.cat03_upstream_energy
        import modules.scope3.cat04_upstream_transport
        import modules.scope3.cat05_waste
        import modules.scope3.cat06_business_travel
        import modules.scope3.cat07_commuting
        import modules.scope3.cat08_upstream_leased
        import modules.scope3.cat09_downstream_transport
    except Exception:
        pass


# ── Cat 2: Capital goods ─────────────────────────────────────────────────────

def _cat02(conn, inventory, profile):
    st.markdown("#### Cat 2 — Capital goods")
    st.caption(
        "Emissions from production of capital goods purchased or acquired. "
        "Use average-data or spend-based (EEIO) method."
    )
    method = st.radio("Method", [
        "Average-data (mass × EF)",
        "Spend-based (EEIO)",
        "Supplier-specific EF",
    ], key="cat2_method", horizontal=True)

    ITEMS = ["machinery", "vehicles", "buildings", "computers_servers",
             "electrical_equipment", "steel_structures", "industrial_plant", "other"]

    if "EEIO" in method:
        process = "S3 Cat 2 — Capital goods (spend-based EEIO)"
        units = ["USD", "INR", "EUR", "GBP"]
        items = ["machinery", "vehicles", "computers_servers", "buildings", "general"]
    elif "Supplier" in method:
        process = "S3 Cat 2 — Capital goods (supplier-specific EF)"
        units = ["kg", "t", "unit"]
        items = ITEMS
    else:
        process = "S3 Cat 2 — Capital goods (average-data per mass/unit)"
        units = ["kg", "t", "kt", "unit"]
        items = ITEMS

    pairs = _generic_table("cat02", "Scope 3", process, items, units,
                            conn, profile, "Cat 2 capital goods")
    _save_button("cat02", pairs, inventory, profile)


# ── Cat 3: Upstream energy ────────────────────────────────────────────────────

def _cat03(conn, inventory, profile):
    st.markdown("#### Cat 3 — Fuel & energy-related activities (upstream)")
    st.caption(
        "Well-to-tank (WTT) emissions from fuels and energy purchased. "
        "Includes extraction, refining, and transmission losses."
    )

    sub = st.radio("Sub-category", [
        "3A — WTT of purchased fuels",
        "3B — WTT of purchased electricity/heat",
        "3C — T&D losses (electricity)",
    ], key="cat3_sub", horizontal=True)

    if "3A" in sub:
        process = "S3 Cat 3A — Upstream emissions of purchased fuels"
        items = ["natural_gas", "diesel_oil", "motor_gasoline", "lpg", "fuel_oil",
                 "kerosene", "coal_bituminous", "non_coking_coal", "biodiesel", "biogas"]
        units = ["GJ", "TJ", "t", "kg", "L", "kL", "m3", "scm"]

        # ── WTT pre-fill from Scope 1 save ───────────────────────────────
        wtt_prefill = st.session_state.get("wtt_prefill", {})
        if wtt_prefill:
            st.success(
                f"✅ **Pre-filled from Scope 1 data.** "
                f"Fuels detected: {', '.join(f'{k} ({v:.1f})' for k, v in wtt_prefill.items())}. "
                f"Review and save below to record Cat 3A WTT emissions."
            )
            # Build pre-filled rows for the generic table key
            if "cat03_prefilled" not in st.session_state:
                st.session_state["cat03_prefilled"] = wtt_prefill
        else:
            st.caption(
                "Enter the same fuel quantities as Scope 1 stationary/mobile — "
                "WTT EFs are applied automatically. "
                "**Tip:** Save Scope 1 first; quantities will auto-populate here."
            )
    elif "3B" in sub:
        process = "S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling"
        items = ["grid_electricity", "steam", "heat", "cooling", "natural_gas"]
        units = ["kWh", "MWh", "GJ", "TJ"]
        st.caption("Enter purchased electricity/steam in same units as Scope 2.")
    else:
        process = "S3 Cat 3C — Transmission & distribution (T&D) losses"
        items = ["grid_electricity"]
        units = ["kWh", "MWh", "GJ", "TJ"]
        prefill_kwh = st.session_state.get("cat3c_kwh_prefill")
        if prefill_kwh:
            st.success(
                f"✅ **Auto-calculated from Scope 2:** {prefill_kwh:,.0f} kWh "
                f"— T&D loss record already saved to inventory."
            )
        else:
            st.caption("Enter total electricity purchased. T&D loss factor (typically 5–8%) applied automatically.")

    pairs = _generic_table("cat03", "Scope 3", process, items, units,
                            conn, profile, "Cat 3 upstream energy")
    _save_button("cat03", pairs, inventory, profile)

    # Clear prefill after save
    if pairs and st.session_state.get("wtt_prefill") and "3A" in sub:
        if st.button("✓ Mark WTT as entered (clear prefill)", key="clear_wtt_prefill"):
            del st.session_state["wtt_prefill"]
            if "cat03_prefilled" in st.session_state:
                del st.session_state["cat03_prefilled"]
            st.rerun()


# ── Cat 9: Downstream transport ───────────────────────────────────────────────

def _cat09(conn, inventory, profile):
    st.markdown("#### Cat 9 — Downstream transport & distribution")
    st.caption(
        "Transport of sold products from your facilities to end customers or retailers. "
        "Paid for by the customer but attributable to your sold goods."
    )

    tab_simple, tab_journey = st.tabs(["Simple entry", "🗺️ Multi-modal journey builder"])

    MODES = ["truck", "rail", "ship", "container_ship", "air", "intermodal",
             "van", "coastal_ship_india"]
    UNITS = ["tonne-km", "km", "miles"]

    with tab_simple:
        pairs = _generic_table("cat09", "Scope 3",
                               "S3 Cat 9 — Downstream transport (distance-based, tonne-km)",
                               MODES, UNITS, conn, profile, "Cat 9 transport")
        _save_button("cat09", pairs, inventory, profile)

    with tab_journey:
        try:
            from streamlit_app.components.journey_builder import journey_builder
            jb_records = journey_builder(conn, profile, category="Cat9",
                                         key_prefix="cat09_jb")
            if jb_records:
                st.markdown("---")
                if st.button("💾 Save journey legs to inventory",
                             key="cat09_jb_save", type="primary"):
                    from core.engine import calculate as eng_calc
                    saved = 0
                    for rec in jb_records:
                        try:
                            result = eng_calc(rec, conn)
                            inventory.persist(result, rec, profile.get("reporting_year", 2024))
                            saved += 1
                        except Exception as e:
                            st.error(f"Leg {rec.extra.get('leg_number','?')}: {e}")
                    if saved:
                        st.success(f"✅ Saved {saved} leg(s) to inventory.")
                        st.rerun()
        except ImportError:
            st.info("Journey builder requires the full app environment.")


# ── Cat 10: Processing of sold products ──────────────────────────────────────

def _cat10(conn, inventory, profile):
    st.markdown("#### Cat 10 — Processing of sold products")
    st.caption(
        "Emissions from processing of intermediate products sold to other companies "
        "who process them further before end use. Relevant for: chemicals, metals, plastics."
    )

    method = st.radio("Method", [
        "Average-data (mass of intermediate product × processing EF)",
        "Site-specific data from customers",
    ], key="cat10_method", horizontal=True)

    ITEMS = ["steel_intermediate", "chemical_intermediate", "plastic_resin",
             "aluminium_billet", "paper_pulp", "textile_fibre", "other_intermediate"]
    UNITS = ["t", "kg", "kt"]

    if "Site" in method:
        process = "S3 Cat 10 — Processing of sold intermediate products (site-specific)"
        st.info("Enter customer-reported processing emissions per tonne of your product sold.")
    else:
        process = "S3 Cat 10 — Processing of sold intermediate products (average-data)"

    pairs = _generic_table("cat10", "Scope 3", process, ITEMS, UNITS,
                            conn, profile, "Cat 10 processing")
    _save_button("cat10", pairs, inventory, profile)


# ── Cat 11: Use of sold products ─────────────────────────────────────────────

def _cat11(conn, inventory, profile):
    st.markdown("#### Cat 11 — Use of sold products")
    st.caption(
        "Emissions during customer use of your sold products. "
        "Highly material for: appliances, vehicles, fuels, chemicals, electronics."
    )

    sub = st.radio("Product type", [
        "Direct energy use (appliances, vehicles, machinery)",
        "Fuels & feedstocks (combusted by end user)",
    ], key="cat11_sub", horizontal=True)

    if "Fuels" in sub:
        process = "S3 Cat 11 — Use of sold products (direct, fuels & feedstocks combustion)"
        ITEMS = ["natural_gas", "diesel_oil", "motor_gasoline", "lpg", "coal_bituminous",
                 "fuel_oil", "kerosene", "biodiesel", "biogas"]
        UNITS = ["GJ", "TJ", "t", "kg", "L", "kL"]
        st.caption("Enter total quantity of fuel sold. Combustion EF applied automatically.")
    else:
        process = "S3 Cat 11 — Use of sold products (direct, energy consuming products)"
        ITEMS = ["electric_vehicle", "appliance_electric", "appliance_gas",
                 "laptop", "server", "air_conditioner", "industrial_motor", "other_electrical"]
        UNITS = ["kWh", "GJ", "unit-years"]
        st.caption("Enter lifetime energy consumed per unit × units sold, or total kWh.")

    lifetime = st.number_input(
        "Product lifetime (years, for unit-based calc)",
        min_value=1, max_value=30, value=5,
        key="cat11_lifetime",
    )

    pairs = _generic_table("cat11", "Scope 3", process, ITEMS, UNITS,
                            conn, profile, "Cat 11 use of products",
                            extra={"product_lifetime_years": lifetime})
    _save_button("cat11", pairs, inventory, profile)


# ── Cat 12: End-of-life ───────────────────────────────────────────────────────

def _cat12(conn, inventory, profile):
    st.markdown("#### Cat 12 — End-of-life treatment of sold products")
    st.caption(
        "Emissions from waste treatment of products at end of life. "
        "Based on mass of product sold × end-of-life treatment EF."
    )

    TREATMENTS = [
        "landfill_msw", "landfill_plastic", "landfill_metal", "landfill_inert",
        "incineration_msw", "recycling_mixed", "recycling_plastic",
        "recycling_metal", "recycling_paper", "recycling_glass",
        "composting", "e_waste", "india_average_mix",
    ]
    UNITS = ["t", "kg", "kt"]

    process = "S3 Cat 12 — End-of-life of sold products (waste-treatment mix)"
    st.caption("Select the expected end-of-life treatment path for each product type sold.")

    pairs = _generic_table("cat12", "Scope 3", process, TREATMENTS, UNITS,
                            conn, profile, "Cat 12 end-of-life")
    _save_button("cat12", pairs, inventory, profile)


# ── Cat 13: Downstream leased assets ─────────────────────────────────────────

def _cat13(conn, inventory, profile):
    st.markdown("#### Cat 13 — Downstream leased assets")
    st.caption(
        "Emissions from operation of assets owned by you and leased to others. "
        "Relevant if you lease out buildings, vehicles, or equipment."
    )

    BLDG_TYPES = ["office", "warehouse", "retail", "data_center",
                  "manufacturing", "hotel", "laboratory", "average"]
    UNITS = ["m2", "m²"]

    process = "S3 Cat 13 — Downstream leased assets (average-data)"
    pairs = _generic_table("cat13", "Scope 3", process, BLDG_TYPES, UNITS,
                            conn, profile, "Cat 13 downstream leased")
    _save_button("cat13", pairs, inventory, profile)


# ── Cat 14: Franchises ────────────────────────────────────────────────────────

def _cat14(conn, inventory, profile):
    st.markdown("#### Cat 14 — Franchises")
    st.caption(
        "Emissions from operation of franchises. Relevant for: food & beverage, "
        "retail, hospitality, automotive service chains."
    )

    method = st.radio("Method", [
        "Average-data (franchise floor area × intensity EF)",
        "Franchise-reported S1+S2 data",
    ], key="cat14_method", horizontal=True)

    if "reported" in method.lower():
        process = "S3 Cat 14 — Franchises (franchise-specific, S1+S2 emissions)"
        ITEMS = ["franchise_s1_s2_reported"]
        UNITS = ["tCO2e"]
        st.caption("Enter S1+S2 emissions as reported by franchisee. Unit = tCO₂e directly.")
    else:
        process = "S3 Cat 14 — Franchises (average-data)"
        ITEMS = ["restaurant_fast_food", "hotel", "retail_store", "auto_service",
                 "gym_fitness", "office_franchise", "other"]
        UNITS = ["m2", "m²", "outlets"]

    pairs = _generic_table("cat14", "Scope 3", process, ITEMS, UNITS,
                            conn, profile, "Cat 14 franchises")
    _save_button("cat14", pairs, inventory, profile)


# ── Cat 15: Investments ───────────────────────────────────────────────────────

# PCAF data quality score definitions
_PCAF_SCORES = {
    1: "Verified — audited S1+S2 data from investee",
    2: "Reported — unaudited S1+S2 from investee",
    3: "Estimated — revenue-based EEIO with activity data",
    4: "Estimated — sector/region EF without activity data",
    5: "Default — general sector EF or proxy estimate",
}

def _cat15(conn, inventory, profile):
    st.markdown("#### Cat 15 — Investments (Financed Emissions)")
    st.caption(
        "Financed emissions. Material for: banks, insurance, asset managers, PE/VC. "
        "PCAF standard (v3 2025) is the required methodology for financial institutions."
    )

    sub = st.radio("Investment type", [
        "Listed equity / corporate bonds (EEIO-based)",
        "Project finance (use of proceeds)",
        "Investment-specific reported S1+S2",
    ], key="cat15_sub", horizontal=True)

    if "Project" in sub:
        process = "S3 Cat 15 — Project finance (projected lifetime emissions, initial year only)"
        ITEMS = ["renewable_energy", "fossil_fuel_extraction", "infrastructure",
                 "real_estate", "industrial_project", "other_project"]
        UNITS = ["USD", "INR", "EUR"]
        st.caption("Enter loan/investment amount in currency. Sector EF from EEIO applied.")
    elif "reported" in sub.lower():
        process = "S3 Cat 15 — Investments (equity, investment-specific)"
        ITEMS = ["investee_s1_s2_reported"]
        UNITS = ["tCO2e"]
        st.caption("Enter tCO₂e as reported by investee company. Attribution = ownership share × reported total.")
    else:
        process = "S3 Cat 15 — Investments (equity, average-data EEIO)"
        ITEMS = ["technology", "manufacturing", "energy", "financials",
                 "real_estate", "healthcare", "consumer_goods", "industrials"]
        UNITS = ["USD", "INR", "EUR"]
        st.caption("Enter investment amount. EEIO sector intensity EF applied for attribution.")

    # ── PCAF data quality scoring ─────────────────────────────────────────
    with st.expander("📊 PCAF Data Quality Score (required for SBTi Finance Tool)", expanded=True):
        st.caption(
            "PCAF requires a data quality score (1–5) for every investment record. "
            "Score 1 = best (verified data); Score 5 = worst (generic estimate). "
            "Weighted average score must be disclosed."
        )
        pcaf_score = st.select_slider(
            "PCAF data quality score",
            options=[1, 2, 3, 4, 5],
            value=3,
            key="cat15_pcaf_score",
            format_func=lambda x: f"{x} — {_PCAF_SCORES[x][:35]}",
        )
        st.caption(f"**Score {pcaf_score}:** {_PCAF_SCORES[pcaf_score]}")

        # Attribution method
        attr_method = st.selectbox(
            "Attribution factor method",
            [
                "Outstanding amount ÷ EVIC (listed equity, corporate bonds)",
                "Outstanding amount ÷ total equity + debt (unlisted equity, loans)",
                "Outstanding amount ÷ project value (project finance)",
                "Loan balance ÷ property value (mortgages)",
                "Loan balance ÷ vehicle value (motor vehicles)",
                "100% (full attribution — use only where specified)",
            ],
            key="cat15_attr_method",
        )

        # EVIC / outstanding amount for attribution
        c1, c2 = st.columns(2)
        outstanding = c1.number_input(
            "Outstanding amount (currency)", min_value=0.0, format="%.2f",
            key="cat15_outstanding", help="Your loan/investment balance"
        )
        evic = c2.number_input(
            "EVIC / total company value (currency)", min_value=0.0, format="%.2f",
            key="cat15_evic", help="Enterprise value including cash of investee"
        )
        if outstanding > 0 and evic > 0:
            attr_factor = outstanding / evic
            st.metric("Attribution factor", f"{attr_factor:.4f}",
                      help="Your share of investee emissions = attribution factor × total emissions")

    ownership_pct = st.number_input(
        "Ownership / attribution share (%)",
        min_value=0.0, max_value=100.0, value=100.0,
        format="%.2f", key="cat15_ownership",
        help="Your proportional share of the investee's emissions. 100% = full attribution.",
    )

    pairs = _generic_table("cat15", "Scope 3", process, ITEMS,
                            ["USD", "INR", "EUR", "GBP", "tCO2e"],
                            conn, profile, "Cat 15 investments",
                            extra={"ownership_pct": ownership_pct / 100,
                                   "pcaf_score": pcaf_score,
                                   "pcaf_attr_method": attr_method})
    _save_button("cat15", pairs, inventory, profile)

    # PCAF weighted average disclosure hint
    if pairs:
        st.info(
            f"📋 **PCAF disclosure note:** This record has data quality score **{pcaf_score}** "
            f"({_PCAF_SCORES[pcaf_score]}). "
            "Disclose the weighted average PCAF score across all investment records in your "
            "annual GHG inventory report."
        )

    # ── Previously saved Scope 3 records ────────────────────────────────────
    st.markdown("---")
    try:
        import sqlite3 as _sql
        from pathlib import Path as _P
        _db_path = _P(__file__).parents[1] / "data" / "inventory.sqlite"
        _prof    = st.session_state.get("org_profile", {})
        _org_id  = _prof.get("org_uuid") or _prof.get("org_id") or ""
        _inv_yr  = int(_prof.get("reporting_year", 2024))
        # If org_id is blank or "default", skip (user not logged in / profile not ready)
        if _org_id and _org_id != "default" and _db_path.exists():
            _cn  = _sql.connect(str(_db_path))
            _cn.row_factory = _sql.Row
            _rows = _cn.execute(
                "SELECT process, fuel_or_item, quantity, unit, t_CO2e, site, department "
                "FROM emission_results "
                "WHERE org_id=? AND inventory_year=? AND scope=? "
                "ORDER BY t_CO2e DESC",
                (_org_id, _inv_yr, "Scope 3")
            ).fetchall()
            _cn.close()
            _recs = [dict(r) for r in _rows]
            if _recs:
                _tot = sum(r["t_CO2e"] for r in _recs)
                with st.expander(
                    f"📋 Saved Scope 3 records — {_inv_yr}  ({len(_recs)} entries · {_tot:,.1f} tCO₂e)",
                    expanded=True,
                ):
                    try:
                        import pandas as _pd
                        _df = _pd.DataFrame(_recs)
                        if "t_CO2e" in _df.columns:
                            _df["t_CO2e"] = _df["t_CO2e"].apply(lambda x: f"{float(x):,.3f}")
                        st.dataframe(_df, use_container_width=True, hide_index=True)
                    except Exception:
                        for r in _recs:
                            st.caption(f"{r['process'][:50]} · {r['t_CO2e']:.1f} tCO₂e")
            else:
                st.info(
                    f"No saved Scope 3 records for {_inv_yr}. "
                    "Use the tabs above to calculate and press **Save to inventory**."
                )
    except Exception as _ex:
        st.caption(f"(Could not load saved records: {_ex})")

