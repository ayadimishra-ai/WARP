from pathlib import Path
import json
"""
Page 02 — Scope 2 Emissions (Purchased Electricity, Steam, Heat, Cooling).
Implements GHG Protocol dual-reporting: location-based + market-based.
"""
import streamlit as st
from modules.base import ActivityRecord
from core.engine import calculate
from streamlit_app.components.calc_trace import calc_trace
from streamlit_app.components.ef_badge import ef_badge, fallback_warning
from streamlit_app.components.activity_form import csv_upload_handler


# Country → ISO for display
COUNTRY_DISPLAY = {
    "IN": "India (CEA)",
    "US": "United States (eGRID)",
    "GB": "United Kingdom (DEFRA)",
    "DE": "Germany",
    "AU": "Australia",
    "JP": "Japan",
    "BR": "Brazil",
    "ZA": "South Africa",
    "ID": "Indonesia",
    "CA": "Canada",
    "FR": "France",
    "CN": "China",
    "GLOBAL": "Global average (IEA)",
}


def render():
    st.title("⚡ Scope 2 — Purchased Energy")
    st.caption(
        "GHG Protocol Scope 2 Guidance requires **dual reporting**: "
        "both location-based and market-based values."
    )

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
            "GHG Protocol Scope 2 — Indirect emissions from purchased energy. "
            "Standard: GHG Protocol Scope 2 Guidance (2015). "
            "Dual reporting required: location-based AND market-based."
        )
        mt1, mt2 = st.tabs(["📍 Location-based", "📜 Market-based"])
        with mt1:
            st.markdown("**Formula:** kWh consumed × grid EF (kgCO₂e/kWh)")
            st.markdown("**India EF:** CEA v20 CO₂ baseline EF (national or state grid)")
            st.caption("CEA fiscal year EFs: 2023-24 national average = 0.7270 kgCO₂/kWh.")
        with mt2:
            st.markdown("**Formula:** kWh consumed × supplier/REC EF (can be zero for RE100)")
            st.markdown("**Instruments:** RECs (I-REC, IREDA), green tariff, PPA with additionality")
            st.caption("Market-based requires bundled certificate matching consumption period.")


    conn = st.session_state.ef_conn

    # ── Organisational tagging ────────────────────────────────────────────
    with st.expander("🏷️ Tag records (site / department / cost centre)", expanded=False):
        st.caption("Optional: tag all S2 records saved this session for site-level reporting.")
        tc1, tc2, tc3 = st.columns(3)
        _s2_site = tc1.text_input("Site / facility", key="s2_tag_site", placeholder="e.g. Mumbai Plant")
        _s2_dept = tc2.text_input("Department",      key="s2_tag_dept", placeholder="e.g. Operations")
        _s2_cc   = tc3.text_input("Cost centre",     key="s2_tag_cc",   placeholder="e.g. CC-4201")
        # Supplier linkage
        sup_file = Path(__file__).parents[1] / "data" / "suppliers.json"
        _sup_names = ["— None —"]
        if sup_file.exists():
            try:
                _sup_names += [s["name"] for s in json.loads(sup_file.read_text(encoding="utf-8"))]
            except Exception:
                pass
        _s2_supplier = st.selectbox(
            "Link to supplier", _sup_names,
            key="s2_tag_supplier",
            help="Links these emissions to a supplier for Cat 1/4 attribution."
        )
        st.session_state["_s2_tags"] = {
            "site": _s2_site or None,
            "department": _s2_dept or None,
            "cost_centre": _s2_cc or None,
            "supplier_name": _s2_supplier if _s2_supplier != "— None —" else None,
        }

    # ── Excel bulk upload ────────────────────────────────────────────────
    
    # ── Template download shortcut ────────────────────────────────────────
    with st.expander("📥 Download upload template", expanded=False):
        from pathlib import Path as _TPath
        _tmpl = _TPath(__file__).parents[1] / 'templates' / 'GHG_Activity_Upload_Template.xlsx'
        if _tmpl.exists():
            try:
                import openpyxl as _ox, io as _io
                _wb = _ox.load_workbook(str(_tmpl))
                _keep = ['INSTRUCTIONS', 'S2_Electricity']
                for _sh in list(_wb.sheetnames):
                    if _sh not in _keep:
                        del _wb[_sh]
                _buf = _io.BytesIO()
                _wb.save(_buf)
                _buf.seek(0)
                st.download_button(
                    "⬇️ Scope 2 template",
                    data=_buf.read(),
                    file_name="Scope_2_template.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    key="dl_tmpl_p__page_02_scope2",
                    help="Pre-formatted Excel template. Fill rows 6+ and upload below.",
                )
            except Exception:
                pass
        else:
            st.caption("Full template available in 📤 Export → Upload templates.")
    
    from streamlit_app.components.excel_upload import excel_bulk_upload
    excel_bulk_upload(conn, inventory, profile,
                      label="Bulk upload from Excel template (S2_Electricity tab)")

    st.markdown("---")
    tab1, tab2, tab3 = st.tabs(["⚡ Electricity", "♨️ Steam / Heat / Cooling", "🟢 RECs / GOs"])

    # ── Tab 1: Electricity ───────────────────────────────────────────────
    with tab1:
        st.markdown("#### Purchased grid electricity")

        # ── Electricity provider inference ────────────────────────────────
        _country = profile.get("primary_country", "IN")
        _ELEC_PROVIDERS = {
            "IN": {
                "name":    "India National Grid (CEA v20, FY 2023-24)",
                "ef":      0.727,
                "ef_unit": "kgCO2e/kWh",
                "source":  "Central Electricity Authority — Ministry of Power",
                "notes":   "CO2 only. State/DISCOM EFs not disaggregated. "
                           "Use location-based by default.",
                "market_available": True,
                "market_note": "RECs (REC India, I-REC) qualify as market-based instrument.",
            },
            "US": {
                "name":    "USA eGRID (EPA)",
                "ef":      0.386, "ef_unit": "kgCO2e/kWh",
                "source":  "EPA eGRID 2022",
                "notes":   "US average. State-level EFs available in EF Manager.",
                "market_available": True,
                "market_note": "RECs (Green-e certified) qualify for market-based.",
            },
            "GB": {
                "name":    "UK National Grid (DEFRA 2024)",
                "ef":      0.207, "ef_unit": "kgCO2e/kWh",
                "source":  "DEFRA / BEIS 2024",
                "notes":   "Includes transmission losses.",
                "market_available": True,
                "market_note": "Renewable Energy Guarantees of Origin (REGO).",
            },
            "DE": {
                "name":    "Germany (UBA / BMWI)",
                "ef":      0.380, "ef_unit": "kgCO2e/kWh",
                "source":  "German Federal Environment Agency",
                "notes":   "2023 grid EF.", "market_available": True,
                "market_note": "Guarantee of Origin (GoO).",
            },
            "CN": {
                "name":    "China National Grid",
                "ef":      0.581, "ef_unit": "kgCO2e/kWh",
                "source":  "IPCC / IEA 2022",
                "notes":   "Regional EFs vary significantly.",
                "market_available": False, "market_note": "",
            },
        }
        _provider = _ELEC_PROVIDERS.get(_country)
        if _provider:
            ep1, ep2, ep3 = st.columns(3)
            ep1.info(
                "**Grid EF (location-based)**\n\n"
                + _provider["name"] + "\n\n"
                "**" + str(_provider["ef"]) + " " + _provider["ef_unit"] + "**"
            )
            ep2.info(
                "**Source**\n\n" + _provider["source"] + "\n\n"
                + _provider["notes"]
            )
            if _provider.get("market_available"):
                ep3.success(
                    "**Market-based available**\n\n"
                    + _provider["market_note"]
                )
            else:
                ep3.warning(
                    "**Market-based**\n\nNo standard market-based instrument available for "
                    + _country + ". Use location-based only."
                )
        else:
            st.info(
                "No electricity provider pre-loaded for country **" + _country + "**. "
                "Select country manually below or add EF in EF Manager."
            )

        mode = st.radio("Input mode", ["Manual entry", "CSV upload"],
                        key="s2_elec_mode", horizontal=True)

        all_pairs = []

        if mode == "Manual entry":
            n_key = "s2_elec_n"
            if n_key not in st.session_state:
                st.session_state[n_key] = 1

            ca, cb = st.columns([1, 4])
            with ca:
                if st.button("＋ Add site", key="s2_add"):
                    st.session_state[n_key] += 1
                    st.rerun()
                if st.button("－ Remove", key="s2_rem",
                             disabled=st.session_state[n_key] <= 1):
                    st.session_state[n_key] -= 1
                    st.rerun()

            # Column headers
            h = st.columns([1.5, 1.2, 0.8, 1.5, 1.5, 1.8])
            for hdr, col in zip(["Site/label", "kWh consumed", "Unit",
                                  "Country", "Fiscal year", "tCO₂e"], h):
                col.caption(hdr)
            st.divider()

            for i in range(st.session_state[n_key]):
                c1, c2, c3, c4, c5, c6 = st.columns([1.5, 1.2, 0.8, 1.5, 1.5, 1.8])

                with c1:
                    site = st.text_input("Site", placeholder=f"Site {i+1}",
                                         key=f"s2_site_{i}", label_visibility="collapsed")
                with c2:
                    qty = st.number_input("kWh", min_value=0.0, value=0.0,
                                          format="%.1f", key=f"s2_qty_{i}",
                                          label_visibility="collapsed")
                with c3:
                    unit = st.selectbox("Unit", ["kWh", "MWh", "GJ", "TJ"],
                                        key=f"s2_unit_{i}", label_visibility="collapsed")
                with c4:
                    country = st.selectbox(
                        "Country",
                        list(COUNTRY_DISPLAY.keys()),
                        format_func=lambda x: COUNTRY_DISPLAY.get(x, x),
                        index=list(COUNTRY_DISPLAY.keys()).index(
                            profile.get("primary_country", "IN")
                            if profile.get("primary_country", "IN") in COUNTRY_DISPLAY
                            else "GLOBAL"
                        ),
                        key=f"s2_country_{i}",
                        label_visibility="collapsed",
                    )
                with c5:
                    fy = st.text_input("FY", value=profile.get("fiscal_year", "2023-24"),
                                       key=f"s2_fy_{i}", label_visibility="collapsed")
                with c6:
                    result_ph = st.empty()

                # Market-based override
                with st.expander(f"Market-based data for site {i+1} (optional)", expanded=False):
                    mb_type = st.radio(
                        "Market-based EF type",
                        ["None (use location-based)", "Supplier EF", "100% RECs/PPAs",
                         "Residual mix"],
                        key=f"s2_mb_type_{i}", horizontal=True,
                    )
                    supplier_ef = None
                    extra = {}
                    if mb_type == "Supplier EF":
                        supplier_ef = st.number_input(
                            "Supplier EF (kgCO₂e/kWh)", min_value=0.0, format="%.4f",
                            key=f"s2_sup_ef_{i}")
                    elif mb_type == "100% RECs/PPAs":
                        extra["rec_covered"] = True
                    elif mb_type == "Residual mix":
                        rm_ef = st.number_input(
                            "Residual mix EF (kgCO₂e/kWh)", min_value=0.0, format="%.4f",
                            key=f"s2_rm_{i}")
                        rm_src = st.text_input("Residual mix source", key=f"s2_rm_src_{i}")
                        extra["residual_mix_ef"] = rm_ef
                        extra["residual_mix_source"] = rm_src

                if qty <= 0:
                    result_ph.caption("Enter kWh →")
                    continue

                record = ActivityRecord(
                    scope="Scope 2",
                    process="S2 — Purchased electricity (grid)",
                    country=country,
                    quantity=qty,
                    unit=unit,
                    fuel_or_item="grid_electricity",
                    reporting_year=profile["reporting_year"],
                    fiscal_year=fy,
                    gwp_ar=profile["gwp_ar"],
                    org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
                    supplier_ef_value=supplier_ef,
                    extra=extra,
                )
                try:
                    result = calculate(record, conn)
                    result_ph.metric("tCO₂e (location)", f"{result.t_CO2e:.4f}")
                    all_pairs.append((record, result))

                    # Show dual reporting
                    dual = result.audit_trace.get("dual_reporting", {})
                    loc = dual.get("location_based_t_co2e", result.t_CO2e)
                    mkt = dual.get("market_based_t_co2e")
                    ef_badge(result.fallback_level, result.factor_id_used, result.ef_source)

                    dc1, dc2 = st.columns(2)
                    dc1.metric("Location-based", f"{loc:.4f} tCO₂e",
                               help="Grid average EF × consumption")
                    if mkt is not None:
                        dc2.metric("Market-based", f"{mkt:.4f} tCO₂e",
                                   delta=f"{mkt - loc:+.4f}",
                                   help="Supplier / REC / residual mix EF")
                    else:
                        dc2.info("Market-based: provide supplier EF or REC data above")

                    calc_trace(result, label=f"Site {i+1} — {site or 'electricity'}")

                except Exception as e:
                    result_ph.error(str(e)[:80])

        else:
            st.markdown(
                "**Required columns:** `quantity`, `unit`, `country`  \n"
                "Optional: `fiscal_year`, `supplier_ef_value`"
            )
            all_pairs = csv_upload_handler(
                key="s2_csv",
                scope="Scope 2",
                process="S2 — Purchased electricity (grid)",
                conn=conn,
                org_profile=profile,
                required_cols=["quantity", "unit"],
                fuel_col="fuel_or_item",
            )

        # ── Scope 2 summary ──────────────────────────────────────────────
        if all_pairs:
            st.markdown("---")
            loc_total = sum(r.t_CO2e for _, r in all_pairs)
            n_fb = sum(1 for _, r in all_pairs if r.fallback_triggered)
            fallback_warning(n_fb, len(all_pairs))

            sc1, sc2 = st.columns(2)
            sc1.metric("Location-based total", f"{loc_total:.3f} tCO₂e")

            # Market-based totals where available
            mb_vals = []
            for _, r in all_pairs:
                dual = r.audit_trace.get("dual_reporting", {})
                mb = dual.get("market_based_t_co2e")
                if mb is not None:
                    mb_vals.append(mb)
            if mb_vals:
                sc2.metric("Market-based (partial)",
                           f"{sum(mb_vals):.3f} tCO₂e",
                           help=f"From {len(mb_vals)} of {len(all_pairs)} sites")

            if st.button("💾 Save Scope 2 to inventory", key="save_s2"):
                inv_year = profile.get("reporting_year", 2024)
                dups = [rec for rec, _ in all_pairs if inventory.find_duplicate(rec, inv_year)]
                if dups and not st.session_state.get("s2_confirm_dup"):
                    st.warning(
                        f"⚠️ {len(dups)} record(s) with identical quantity already exist "
                        f"for {inv_year}. Click **Save again** to add anyway."
                    )
                    st.session_state["s2_confirm_dup"] = True
                else:
                    st.session_state.pop("s2_confirm_dup", None)
                    written = inventory.persist_batch(
                        [r for _, r in all_pairs],
                        [rec for rec, _ in all_pairs],
                        inventory_year=inv_year,
                        tags=st.session_state.get("_s2_tags"),
                    )
                    st.toast(f"✅ {written} record(s) saved to inventory", icon="✅")
                    st.success(f"✓ {written} records saved — visible in 📋 Data manager.")

                # ── Cat 3C T&D auto-calculate and save ───────────────────
                total_kwh = sum(
                    rec.quantity for rec, _ in all_pairs
                    if rec.unit and "kwh" in rec.unit.lower()
                )
                if total_kwh > 0:
                    st.session_state["cat3c_kwh_prefill"] = total_kwh
                    try:
                        cat3c_rec = ActivityRecord(
                            scope="Scope 3",
                            process="S3 Cat 3C — Transmission & distribution (T&D) losses",
                            country=profile.get("primary_country", "IN"),
                            quantity=total_kwh, unit="kWh",
                            fuel_or_item="grid_electricity",
                            reporting_year=profile.get("reporting_year", 2024),
                            gwp_ar=profile.get("gwp_ar", 6),
                            org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
                        )
                        cat3c_result = calculate(cat3c_rec, conn)
                        inventory.persist(cat3c_result, cat3c_rec,
                                          profile.get("reporting_year", 2024))
                        st.success(
                            f"✅ Cat 3C T&D losses auto-calculated: "
                            f"**{cat3c_result.t_CO2e:.4f} tCO₂e** "
                            f"({total_kwh:,.0f} kWh × T&D loss EF) — saved to inventory."
                        )
                    except Exception as e:
                        st.info(
                            f"💡 Cat 3C T&D: {total_kwh:,.0f} kWh entered. "
                            f"Go to **🔗 Scope 3 → Cat 3C** to calculate. ({e})"
                        )
                st.rerun()

    # ── Tab 2: Steam / Heat / Cooling ────────────────────────────────────
    with tab2:
        st.markdown("#### Purchased steam, heat, or cooling")
        st.info(
            "🔧 **Cat 3B upstream emissions** are handled in Scope 3.  \n"
            "Scope 2 steam/heat: enter total GJ consumed and the supplier emission factor "
            "(kgCO₂e/GJ) if available. If not, this will be estimated in Sprint 3."
        )
        c1, c2, c3 = st.columns(3)
        steam_qty = c1.number_input("Purchased steam/heat (GJ)", min_value=0.0,
                                     format="%.2f", key="s2_steam_qty")
        steam_ef = c2.number_input("Supplier EF (kgCO₂e/GJ)", min_value=0.0,
                                    format="%.4f", key="s2_steam_ef",
                                    help="Get from your steam/heat supplier")
        steam_src = c3.text_input("Source note", key="s2_steam_src")
        if steam_qty > 0 and steam_ef > 0:
            steam_t = steam_qty * steam_ef / 1000
            st.metric("Steam/heat tCO₂e", f"{steam_t:.4f}")
            st.caption(f"Manual entry — {steam_src or 'no note'}")

    # ── Tab 3: RECs / GOs ─────────────────────────────────────────────────
    with tab3:
        st.markdown("#### Renewable Energy Certificates (RECs) / Guarantees of Origin (GOs)")
        st.caption(
            "Under the GHG Protocol Scope 2 Guidance (market-based method), "
            "RECs and GOs allow you to claim zero-emission electricity. "
            "In India: RECs issued by NLDC/POSOCO; internationally: GOs, PPAs."
        )
        st.info(
            "**How it works:** If you hold RECs equal to your electricity consumption, "
            "your market-based Scope 2 = 0. The location-based figure still applies for "
            "grid impact reporting."
        )

        r1, r2, r3 = st.columns(3)
        rec_qty_mwh  = r1.number_input("RECs / GOs held (MWh)", min_value=0.0,
                                        format="%.2f", key="rec_qty_mwh",
                                        help="1 REC = 1 MWh of renewable electricity")
        rec_type     = r2.selectbox("Certificate type",
                                    ["India REC (NLDC/POSOCO)", "Guarantee of Origin (GO)",
                                     "PPA (Power Purchase Agreement)", "RECS+ / I-REC",
                                     "Other"],
                                    key="rec_type")
        rec_vintage  = r3.number_input("Vintage year", min_value=2015,
                                        max_value=2035, step=1,
                                        value=int(profile.get("reporting_year", 2024)),
                                        key="rec_vintage")

        r4, r5 = st.columns(2)
        rec_supplier = r4.text_input("Supplier / issuer", key="rec_supplier",
                                      placeholder="e.g. SECI, Greenko, Tata Power")
        rec_registry = r5.text_input("Registry / certificate ID", key="rec_registry",
                                      placeholder="e.g. NLDC-REC-2024-12345")

        if rec_qty_mwh > 0:
            # Calculate market-based S2 net of RECs
            # Load location-based S2 from inventory
            org_id   = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
            inv_year = profile.get("reporting_year", 2024)
            try:
                s2_summary = inventory.get_summary(org_id=org_id,
                                                    inventory_year=inv_year)
                s2_loc = s2_summary.get("scope2_t_co2e", 0)
                # Each MWh of REC offsets the location-based EF
                # Conservative: use CEA FY 2023-24 = 0.727 kgCO2e/kWh = 0.727 tCO2e/MWh
                offset_tco2e = rec_qty_mwh * 0.727   # approx
                s2_market = max(0, s2_loc - offset_tco2e)

                m1, m2, m3 = st.columns(3)
                m1.metric("RECs held", f"{rec_qty_mwh:,.1f} MWh")
                m2.metric("Est. offset", f"{offset_tco2e:,.2f} tCO₂e")
                m3.metric("Market-based S2 (net)", f"{s2_market:,.2f} tCO₂e",
                          delta=f"-{offset_tco2e:,.2f} vs location-based",
                          delta_color="inverse")
                st.caption(
                    f"Location-based S2: {s2_loc:,.2f} tCO₂e | "
                    f"RECs offset: {offset_tco2e:,.2f} tCO₂e | "
                    f"Market-based: {s2_market:,.2f} tCO₂e"
                )
            except Exception:
                st.metric("RECs held", f"{rec_qty_mwh:,.1f} MWh")

        if st.button("💾 Save REC record to profile", key="save_recs",
                     help="Stores for BRSR P6-E4 and GRI 302 market-based reporting"):
            recs = profile.get("_recs", [])
            recs.append({
                "qty_mwh":   rec_qty_mwh,
                "type":      rec_type,
                "vintage":   rec_vintage,
                "supplier":  rec_supplier,
                "registry":  rec_registry,
            })
            profile["_recs"] = recs
            st.session_state.org_profile = profile
            st.success(
                f"✓ Saved {rec_qty_mwh:,.1f} MWh of {rec_type} "
                f"(vintage {rec_vintage}) to profile."
            )

        # Show existing RECs
        existing_recs = profile.get("_recs", [])
        if existing_recs:
            st.markdown("**Recorded RECs / GOs:**")
            total_rec_mwh = sum(r.get("qty_mwh", 0) for r in existing_recs)
            st.caption(f"Total: {total_rec_mwh:,.1f} MWh across {len(existing_recs)} record(s)")
            for i, r in enumerate(existing_recs):
                st.caption(
                    f"  {i+1}. {r.get('qty_mwh',0):,.1f} MWh · "
                    f"{r.get('type','')} · Vintage {r.get('vintage','')} · "
                    f"{r.get('supplier','')} · {r.get('registry','')}"
                )

    # ── Previously saved Scope 2 records ────────────────────────────────────
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
                (_org_id, _inv_yr, "Scope 2")
            ).fetchall()
            _cn.close()
            _recs = [dict(r) for r in _rows]
            if _recs:
                _tot = sum(r["t_CO2e"] for r in _recs)
                with st.expander(
                    f"📋 Saved Scope 2 records — {_inv_yr}  ({len(_recs)} entries · {_tot:,.1f} tCO₂e)",
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
                    f"No saved Scope 2 records for {_inv_yr}. "
                    "Use the tabs above to calculate and press **Save to inventory**."
                )
    except Exception as _ex:
        st.caption(f"(Could not load saved records: {_ex})")

