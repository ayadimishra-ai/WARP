from pathlib import Path
"""
Page 01 — Scope 1 Emissions.
Stationary combustion, mobile combustion, fugitive (placeholder), IPPU (placeholder).
"""
import streamlit as st
from streamlit_app.components.activity_form import activity_table, csv_upload_handler
from streamlit_app.components.ef_badge import fallback_warning
from streamlit_app.components.calc_trace import calc_trace, render_calc_trace


def render():



    st.title("🔥 Scope 1 — Direct Emissions")

    with st.expander("📐 Methodology & standards reference", expanded=False):
        st.caption(
            "GHG Protocol Scope 1 — Direct emissions from owned/controlled sources. "
            "Standard: GHG Protocol Corporate Standard (2004). EFs: IPCC 2006 / DEFRA 2024."
        )
        mt1, mt2, mt3, mt4, mt5 = st.tabs([
            "🔥 Stationary", "🚗 Mobile", "💨 Fugitive", "🏭 IPPU", "🐄 AFOLU"
        ])
        with mt1:
            st.markdown("**Standard:** IPCC 2006 Vol 2 Ch 2 · GHG Protocol Scope 1")
            st.markdown("**Formula:** Fuel qty (unit) × NCV (GJ/unit) × EF (kgCO₂e/GJ) / 1000")
            st.markdown("**EF sources:** IPCC 2006 Table 1.4 (fuel EFs) · DEFRA 2024 (WTT)")
            st.caption("GWP100 applied from your selected AR (Setup → Reporting period).")
        with mt2:
            st.markdown("**Standard:** IPCC 2006 Vol 2 Ch 3 · DEFRA 2024")
            st.markdown("**Formula (distance):** km × EF (kgCO₂e/km by vehicle type)")
            st.markdown("**Formula (fuel):** Litres × EF (kgCO₂e/L)")
            st.caption("Two-wheeler and HGV EFs are India-specific (CPCB / ARAI benchmarks).")
        with mt3:
            st.markdown("**Standard:** GHG Protocol Refrigeration & AC guidance (2011)")
            st.markdown("**Formula:** Annual leakage rate (%) × refrigerant charge (kg) × GWP100")
            st.markdown("**EF source:** IPCC AR4/5/6 GWP100 for each refrigerant")
            st.caption("SF₆ from electrical switchgear follows IEC 60480 / IPCC 2006 Vol 2 Ch 6.")
        with mt4:
            st.markdown("**Standard:** IPCC 2006 Vol 3 · GHG Protocol IPPU supplement")
            st.markdown("**Key EFs:** Clinker 0.5244 tCO₂/t · Lime 0.7848 · Glass 0.20")
            st.caption("IPPU covers process CO₂ only — combustion energy is in Stationary tab.")
        with mt5:
            st.markdown("**Standard:** IPCC 2006 Vol 4 · GHG Protocol Land Sector")
            st.markdown("**Enteric CH₄:** India Tier 1 EFs (IPCC Table 10.11/10.12)")
            st.markdown("**Manure:** CH₄ + N₂O from Tier 1 storage system fractions")
            st.caption("AFOLU emissions are included in Scope 1 total per GHG Protocol.")

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

    conn = st.session_state.ef_conn

    # ── Sector-inferred process suggestions ──────────────────────────────
    _industry = profile.get("industry", "")
    _SECTOR_S1_PROCS = {
        "Manufacturing":    ["Stationary — natural gas boilers", "Mobile — HGV diesel fleet",
                             "Fugitive — refrigerant leaks (chillers)"],
        "Cement":           ["Stationary — coal/pet coke kilns", "IPPU — clinker production (process CO₂)",
                             "Mobile — mining equipment (diesel)"],
        "Chemicals":        ["Stationary — steam cracker furnaces", "Fugitive — process vents",
                             "IPPU — chemical process emissions"],
        "Metals":           ["IPPU — steel (BOF/EAF)", "Stationary — coal/coke combustion",
                             "Mobile — materials handling (diesel)"],
        "Oil":              ["Fugitive — wellhead/pipeline leaks", "Stationary — flaring",
                             "Mobile — upstream vehicles"],
        "Power":            ["Stationary — coal/gas turbines (non-grid)", "Fugitive — SF₆ in switchgear"],
        "Logistics":        ["Mobile — HGV diesel long-haul", "Mobile — LCV last-mile",
                             "Stationary — depot heating"],
        "Agriculture":      ["AFOLU — enteric fermentation", "AFOLU — manure management",
                             "Mobile — tractors (diesel)", "Stationary — grain dryers"],
        "Financial":        ["Stationary — office HVAC", "Mobile — company car fleet"],
        "Retail":           ["Stationary — store HVAC/refrigeration", "Fugitive — HFC refrigerant leaks"],
        "Real Estate":      ["Stationary — building heating (gas/HFO)", "Fugitive — refrigerant leaks"],
        "Hospitality":      ["Stationary — kitchen gas / laundry", "Mobile — shuttle vehicles"],
    }
    _suggested = []
    for kw, procs in _SECTOR_S1_PROCS.items():
        if kw.lower() in _industry.lower():
            _suggested = procs
            break
    if _suggested:
        with st.expander(
            f"💡 Suggested Scope 1 sources for **{_industry.split(' — ')[-1]}**",
            expanded=True,
        ):
            st.caption(
                "Based on your industry — these are the most common direct emission sources. "
                "Enter data for each that applies. Skip those that don't."
            )
            for _proc in _suggested:
                _tab_hint = {
                    "Stationary": "🔥 Stationary combustion tab",
                    "Mobile":     "🚗 Mobile combustion tab",
                    "Fugitive":   "💨 Fugitive emissions tab",
                    "IPPU":       "🏭 IPPU tab",
                    "AFOLU":      "🐄 AFOLU tab",
                }.get(_proc.split(" — ")[0], "→ see tabs below")
                st.write(f"  • **{_proc}** — {_tab_hint}")

    # ── Organisational tagging (optional) ────────────────────────────────
    with st.expander("🏷️ Tag records (supplier · site · department · vehicle · equipment)", expanded=False):
        st.caption(
            "Optional: tag all records saved this session. "
            "Supplier links emissions to your supplier register for GHG attribution."
        )
        tc1, tc2, tc3 = st.columns(3)
        _site        = tc1.text_input("Site / facility",    key="s1_tag_site",   placeholder="e.g. Mumbai Plant")
        _department  = tc2.text_input("Department",         key="s1_tag_dept",   placeholder="e.g. Manufacturing")
        _cost_centre = tc3.text_input("Cost centre",        key="s1_tag_cc",     placeholder="e.g. CC-4201")
        tc4, tc5 = st.columns(2)
        _vehicle_type    = tc4.text_input("Vehicle type (mobile tab)", key="s1_tag_vehicle",
                                           placeholder="e.g. HGV diesel, passenger_car, forklift")
        _equipment_type  = tc5.text_input("Equipment type (stationary tab)", key="s1_tag_equip",
                                           placeholder="e.g. Boiler-01, Chiller-A")
        # Supplier linkage
        import json as _json
        from pathlib import Path as _Path
        _sup_file = _Path(__file__).parents[1] / "data" / "suppliers.json"
        _s1_sup_names = ["— None —"]
        if _sup_file.exists():
            try:
                _s1_sup_names += [s["name"] for s in _json.loads(_sup_file.read_text(encoding="utf-8"))]
            except Exception:
                pass
        _s1_supplier = st.selectbox(
            "Link to supplier", _s1_sup_names,
            key="s1_tag_supplier",
            help="Links these emissions to a supplier for Cat 1/4 attribution."
        )
        st.session_state["_s1_tags"] = {
            "site": _site or None,
            "department": _department or None,
            "cost_centre": _cost_centre or None,
            "vehicle_type": _vehicle_type or None,
            "equipment_type": _equipment_type or None,
            "supplier_name": _s1_supplier if _s1_supplier != "— None —" else None,
        }

    # ── Excel bulk upload ────────────────────────────────────────────────
    
    # ── Template download shortcut ────────────────────────────────────────
    with st.expander("📥 Download upload template", expanded=False):
        _tmpl = __import__('pathlib').Path(__file__).parents[1] / 'templates' / 'GHG_Activity_Upload_Template.xlsx'
        if _tmpl.exists():
            try:
                import openpyxl as _ox, io as _io
                _wb = _ox.load_workbook(str(_tmpl))
                _keep = ['INSTRUCTIONS', 'S1_Stationary', 'S1_Mobile', 'S1_Fugitive']
                for _sh in list(_wb.sheetnames):
                    if _sh not in _keep:
                        del _wb[_sh]
                _buf = _io.BytesIO()
                _wb.save(_buf)
                _buf.seek(0)
                st.download_button(
                    "⬇️ Scope 1 template",
                    data=_buf.read(),
                    file_name="Scope_1_template.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    key="dl_tmpl_p__page_01_scope1",
                    help="Pre-formatted Excel template. Fill rows 6+ and upload below.",
                )
            except Exception:
                pass
        else:
            st.caption("Full template available in 📤 Export → Upload templates.")
    
    from streamlit_app.components.excel_upload import excel_bulk_upload
    excel_bulk_upload(conn, inventory, profile,
                      label="Bulk upload from Excel template (S1_Stationary, S1_Mobile, S1_Fugitive)")

    st.markdown("---")
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🔥 Stationary combustion",
        "🚗 Mobile combustion",
        "💨 Fugitive emissions",
        "🏭 Industrial processes (IPPU)",
        "🐄 Agriculture (AFOLU)",
    ])

    all_results = []

    # ── Tab 1: Stationary combustion ────────────────────────────────────
    with tab1:
        st.markdown("#### Stationary combustion (fuel burn)")
        st.caption("Boilers, furnaces, generators, heaters — any fixed equipment burning fuel.")

        mode = st.radio("Input mode", ["Manual entry", "CSV upload"],
                        key="s1_stat_mode", horizontal=True)

        STAT_FUELS = [
            "natural_gas", "diesel", "petrol", "coal", "coal_bituminous",
            "coal_anthracite", "lignite", "fuel_oil", "lpg", "kerosene",
            "wood", "biodiesel", "biogas", "coking_coal", "non_coking_coal",
            "sub_bituminous_coal", "peat",
        ]
        STAT_UNITS = ["GJ", "TJ", "MWh", "kWh", "t", "kg", "kt", "L", "kL"]

        if mode == "Manual entry":
            pairs = activity_table(
                key_prefix="s1_stat",
                scope="Scope 1",
                process="S1 — Stationary combustion (fuel burn)",
                fuel_options=STAT_FUELS,
                unit_options=STAT_UNITS,
                conn=conn,
                org_profile=profile,
                label="Stationary combustion",
            )
        else:
            st.markdown(
                "**Required columns:** `fuel_or_item`, `quantity`, `unit`, `country`  \n"
                "Optional: `reporting_year`, `fiscal_year`, `technology_process`"
            )
            pairs = csv_upload_handler(
                key="s1_stat_csv",
                scope="Scope 1",
                process="S1 — Stationary combustion (fuel burn)",
                conn=conn,
                org_profile=profile,
                required_cols=["fuel_or_item", "quantity", "unit"],
            )

        if pairs:
            all_results.extend(pairs)
            n_fb = sum(1 for _, r in pairs if r.fallback_triggered)
            fallback_warning(n_fb, len(pairs))
            if st.button("💾 Save to inventory", key="save_s1_stat"):
                inv_year = profile.get("reporting_year", 2024)
                # Duplicate check
                dups = [rec for rec, _ in pairs
                        if inventory.find_duplicate(rec, inv_year)]
                if dups and not st.session_state.get("s1_stat_confirm_dup"):
                    st.warning(
                        f"⚠️ {len(dups)} record(s) with identical fuel/quantity already "
                        f"exist for {inv_year}. Click **Save again** to add anyway."
                    )
                    st.session_state["s1_stat_confirm_dup"] = True
                else:
                    st.session_state.pop("s1_stat_confirm_dup", None)
                    written = inventory.persist_batch(
                        [r for _, r in pairs], [rec for rec, _ in pairs],
                        inventory_year=inv_year,
                        tags=st.session_state.get("_s1_tags")
                    )
                    st.toast(f"✅ {written} record(s) saved to inventory", icon="✅")
                    st.success(f"✓ {written} records saved — visible in 📋 Data manager.")
                    # ── Cat 3A WTT auto-link ──────────────────────────────────
                    fuel_gj_map = {
                        rec.fuel_or_item: rec.quantity
                        for rec, _ in pairs
                        if (rec.unit or "").upper() in ("GJ", "TJ", "MMBTU", "L", "KG", "T")
                    }
                    if fuel_gj_map:
                        st.info(
                            "💡 **Add Scope 3 Cat 3A upstream (WTT) emissions?**  \n"
                            "GHG Protocol requires Well-to-Tank emissions for fuels burned.  \n"
                            "Pre-filled quantities are ready in **🔗 Scope 3 → Cat 3 → Sub-cat 3A**."
                        )
                        st.session_state["wtt_prefill"] = fuel_gj_map
                    st.rerun()

    # ── Tab 2: Mobile combustion ─────────────────────────────────────────
    with tab2:
        st.markdown("#### Mobile combustion (owned/operated vehicles)")
        st.caption("Company-owned cars, trucks, buses, forklifts, aviation, marine vessels.")

        # ── Vehicle registry ─────────────────────────────────────────────
        VEHICLE_TYPES = {
            "Passenger car (petrol)":    ("petrol_cars",         "L",   "DEFRA 2024: 0.1708 kgCO2e/km or fuel-based"),
            "Passenger car (diesel)":    ("diesel_cars",         "L",   "DEFRA 2024: 0.1683 kgCO2e/km"),
            "Light commercial (diesel)": ("lcv",                 "L",   "Van/pickup. DEFRA 2024."),
            "Heavy goods vehicle (HGV)": ("diesel_trucks_heavy", "L",   "18-40 t GVW. 0.0962 kgCO2e/t-km"),
            "Bus / coach (diesel)":      ("diesel_buses",        "L",   "DEFRA 2024 coach EF."),
            "Forklift (diesel)":         ("diesel_trucks_heavy", "L",   "Use fuel consumption in litres."),
            "2-Wheeler (petrol)":        ("2w",                  "L",   "India 2-wheeler EF."),
            "3-Wheeler (CNG)":           ("3w",                  "kg",  "Auto-rickshaw. Use CNG in kg."),
            "Company aviation (jet)":    ("jet_fuel_aviation",   "L",   "DEFRA 2024 aviation EF."),
            "Marine vessel (fuel oil)":  ("marine_fuel_oil",     "L",   "DEFRA 2024 marine EF."),
            "CNG vehicle":               ("natural_gas_vehicles","kg",  "CNG in kg or GJ."),
        }
        with st.expander("Vehicle registry (select to pre-fill fuel type)", expanded=False):
            st.caption(
                "Select your vehicle type to pre-fill the correct fuel identifier. "
                "Electric vehicles contribute to Scope 2 — log them there."
            )
            sel_vtype = st.selectbox(
                "Vehicle type", ["— manual entry —"] + list(VEHICLE_TYPES.keys()),
                key="s1_mob_vreg_sel",
            )
            if sel_vtype and sel_vtype != "— manual entry —":
                fuel, unit, note = VEHICLE_TYPES[sel_vtype]
                st.session_state["s1_mob_prefill_fuel"] = fuel
                st.session_state["s1_mob_prefill_unit"] = unit
                st.success("Pre-filled: fuel = " + fuel + ", unit = " + unit + ". Note: " + note)
            vr1, vr2, vr3 = st.columns(3)
            for ci, (vtype, (fuel, unit, note)) in enumerate(VEHICLE_TYPES.items()):
                [vr1, vr2, vr3][ci % 3].info(
                    vtype + "\n\n" + "fuel: `" + fuel + "` | " + unit + "\n\n" + note
                )

        mode2 = st.radio("Input mode", ["Manual entry", "CSV upload"],
                         key="s1_mob_mode", horizontal=True)

        MOB_VEHICLES = [
            "petrol_cars", "diesel_cars", "diesel_trucks_heavy", "diesel_buses",
            "jet_fuel_aviation", "marine_fuel_oil", "natural_gas_vehicles",
            "2w", "3w", "mcv", "hcv", "lcv",
        ]
        MOB_UNITS = ["L", "kL", "km", "miles", "GJ", "TJ", "t", "kg"]

        if mode2 == "Manual entry":
            pairs2 = activity_table(
                key_prefix="s1_mob",
                scope="Scope 1",
                process="S1 — Mobile combustion (road)",
                fuel_options=MOB_VEHICLES,
                unit_options=MOB_UNITS,
                conn=conn,
                org_profile=profile,
                label="Mobile combustion",
            )
        else:
            st.markdown(
                "**Required columns:** `fuel_or_item` (vehicle type), `quantity`, `unit`  \n"
                "Optional: `country`, `reporting_year`"
            )
            pairs2 = csv_upload_handler(
                key="s1_mob_csv",
                scope="Scope 1",
                process="S1 — Mobile combustion (road)",
                conn=conn,
                org_profile=profile,
                required_cols=["fuel_or_item", "quantity", "unit"],
            )

        if pairs2:
            all_results.extend(pairs2)
            n_fb = sum(1 for _, r in pairs2 if r.fallback_triggered)
            fallback_warning(n_fb, len(pairs2))
            if st.button("💾 Save to inventory", key="save_s1_mob"):
                inv_year = profile.get("reporting_year", 2024)
                dups = [rec for rec, _ in pairs2 if inventory.find_duplicate(rec, inv_year)]
                if dups and not st.session_state.get("s1_mob_confirm_dup"):
                    st.warning(
                        f"⚠️ {len(dups)} record(s) already exist. "
                        f"Click **Save again** to add anyway."
                    )
                    st.session_state["s1_mob_confirm_dup"] = True
                else:
                    st.session_state.pop("s1_mob_confirm_dup", None)
                    written = inventory.persist_batch(
                        [r for _, r in pairs2], [rec for rec, _ in pairs2],
                        inventory_year=inv_year,
                        tags=st.session_state.get("_s1_tags")
                    )
                    st.toast(f"✅ {written} record(s) saved to inventory", icon="✅")
                    st.success(f"✓ {written} records saved — visible in 📋 Data manager.")
                # ── Cat 3A WTT auto-link for mobile fuels ─────────────────
                mob_fuel_map = {
                    rec.fuel_or_item: rec.quantity
                    for rec, _ in pairs2
                    if (rec.unit or "").upper() in ("L", "GJ", "KG")
                }
                if mob_fuel_map:
                    existing = st.session_state.get("wtt_prefill", {})
                    existing.update(mob_fuel_map)
                    st.session_state["wtt_prefill"] = existing
                    st.info(
                        "💡 **Don't forget Scope 3 Cat 3A (WTT) for mobile fuels.**  \n"
                        "Pre-filled in **🔗 Scope 3 → Cat 3 → Sub-cat 3A**."
                    )
                st.rerun()

    # ── Tab 3: Fugitive ─────────────────────────────────────────────────
    with tab3:
        from streamlit_app.components.fugitive_form import fugitive_form

        fug_records = fugitive_form(conn, profile, key_prefix="s1_fug")

        if fug_records:
            st.markdown("---")
            save_col, _ = st.columns([1, 3])
            if save_col.button("💾 Save fugitive records to inventory",
                               key="s1_fug_save", type="primary"):
                saved = 0
                for rec in fug_records:
                    try:
                        result = calculate(rec, conn)
                        inventory.persist(result, rec, profile.get("reporting_year", 2024))
                        saved += 1
                        with st.expander(
                            f"✓ {rec.fuel_or_item or 'fugitive'}: "
                            f"{result.t_CO2e:.4f} tCO₂e saved",
                            expanded=False,
                        ):
                            render_calc_trace(result)
                    except Exception as e:
                        st.error(f"Error: {e}")
                if saved:
                    st.success(f"Saved {saved} fugitive record(s) to inventory.")
                    st.rerun()

    # ── Tab 4: IPPU ──────────────────────────────────────────────────────
    with tab4:
        st.markdown("#### Industrial processes & product use (IPPU)")
        st.caption(
            "Process emissions from chemical/physical transformations — not from fuel combustion. "
            "Relevant for: cement, lime, steel, glass, chemicals, aluminium."
        )

        IPPU_PROCESSES = {
            "Cement — clinker production": {
                "process": "IPPU — Cement (process CO2)",
                "items": ["clinker"],
                "units": ["kt", "t"],
                "note": "Enter clinker produced (not cement). EF = 0.5244 tCO₂/t clinker (IPCC 2006).",
            },
            "Lime production": {
                "process": "IPPU — Lime (process CO2)",
                "items": ["lime"],
                "units": ["kt", "t"],
                "note": "EF = 0.7848 tCO₂/t lime (IPCC 2006 Table 2.4).",
            },
            "Steel — basic oxygen / electric arc": {
                "process": "IPPU — Steel (process CO2)",
                "items": ["steel_bof", "steel_eaf", "pig_iron", "sinter", "coke"],
                "units": ["kt", "t"],
                "note": "BOF: 0.046 tCO₂/t steel. EAF: use steel_eaf.",
            },
            "Glass production": {
                "process": "IPPU — Glass (process CO2)",
                "items": ["glass", "glass_container", "glass_flat"],
                "units": ["kt", "t"],
                "note": "EF = 0.20 tCO₂/t glass (IPCC 2006 Table 3.3).",
            },
            "Chemicals — ammonia, nitric acid, adipic acid": {
                "process": "IPPU — Chemicals (process emissions)",
                "items": ["ammonia", "nitric_acid", "adipic_acid", "carbide", "soda_ash"],
                "units": ["kt", "t"],
                "note": "N₂O from nitric/adipic acid is included. EF varies by product.",
            },
        }

        # Industry-contextual IPPU guidance
        _ind = st.session_state.get("org_profile", {}).get("industry", "")
        _IPPU_IND_MAP = {
            "Cement":    ["Cement — clinker production"],
            "Chemical":  ["Chemicals — ammonia, nitric acid, adipic acid"],
            "Metals":    ["Steel — basic oxygen / electric arc"],
            "Steel":     ["Steel — basic oxygen / electric arc"],
            "Glass":     ["Glass production"],
        }
        _relevant = []
        for kw, procs in _IPPU_IND_MAP.items():
            if kw.lower() in _ind.lower():
                _relevant.extend(procs)
        if _relevant:
            st.success(
                "Industry (" + _ind.split(" — ")[-1] + "): "
                "likely relevant IPPU: " + ", ".join(_relevant)
            )
        elif _ind:
            st.info(
                "IPPU is typically not material for " + _ind.split(" — ")[-1] + ". "
                "Still enter data if applicable."
            )
        ippu_sub = st.selectbox(
            "Select industrial process",
            list(IPPU_PROCESSES.keys()),
            index=list(IPPU_PROCESSES.keys()).index(_relevant[0])
                  if _relevant and _relevant[0] in IPPU_PROCESSES else 0,
            key="ippu_sub",
        )
        cfg = IPPU_PROCESSES[ippu_sub]
        st.caption(cfg["note"])

        ic1, ic2, ic3, ic4 = st.columns([2, 1.5, 1, 1.5])
        ippu_item = ic1.selectbox("Material / product", cfg["items"], key="ippu_item")
        ippu_qty  = ic2.number_input("Quantity", min_value=0.0, value=0.0,
                                     format="%.3f", key="ippu_qty")
        ippu_unit = ic3.selectbox("Unit", cfg["units"], key="ippu_unit")
        ippu_ph   = ic4.empty()

        if ippu_qty > 0:
            try:
                ippu_rec = ActivityRecord(
                    scope="Scope 1", process=cfg["process"],
                    country=profile.get("primary_country", "IN"),
                    quantity=ippu_qty, unit=ippu_unit,
                    fuel_or_item=ippu_item,
                    reporting_year=profile.get("reporting_year", 2024),
                    gwp_ar=profile.get("gwp_ar", 6),
                    org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
                )
                ippu_result = calculate(ippu_rec, conn)
                ippu_ph.metric("tCO₂e", f"{ippu_result.t_CO2e:.4f}")
                all_results.append((ippu_rec, ippu_result))
                calc_trace(ippu_result, label=f"IPPU — {ippu_sub}")

                if st.button("💾 Save IPPU to inventory", key="save_ippu"):
                    inventory.persist(ippu_result, ippu_rec, profile.get("reporting_year", 2024))
                    st.success(f"✓ IPPU record saved: {ippu_result.t_CO2e:.4f} tCO₂e")
                    st.rerun()
            except Exception as e:
                ippu_ph.error(str(e)[:80])
        else:
            ippu_ph.caption("Enter quantity →")

    # ── Tab 5: AFOLU ─────────────────────────────────────────────────────
    with tab5:
        st.markdown("#### Agriculture, Forestry & Other Land Use (AFOLU)")
        st.caption(
            "Covers enteric fermentation (CH₄ from digestion) and manure management "
            "(CH₄ + N₂O from storage/treatment). IPCC 2006 Tier 1. "
            "Relevant for: food & beverage, agriculture, dairy, poultry companies."
        )

        # ── Sector-contextual AFOLU relevance banner (mirrors IPPU pattern) ──
        _afolu_ind = st.session_state.get("org_profile", {}).get("industry", "")
        _AFOLU_IND_MAP = {
            "Agriculture":   ["🐄 Enteric fermentation", "💩 Manure management"],
            "Food":          ["🐄 Enteric fermentation", "💩 Manure management"],
            "Dairy":         ["🐄 Enteric fermentation", "💩 Manure management"],
            "Livestock":     ["🐄 Enteric fermentation", "💩 Manure management"],
            "Poultry":       ["💩 Manure management"],
            "FMCG":          ["🐄 Enteric fermentation"],
            "Textile":       ["🐄 Enteric fermentation"],
            "Beverage":      ["🐄 Enteric fermentation"],
            "Forestry":      ["🌲 Land-use change (report manually)"],
            "Paper":         ["🌲 Land-use change (report manually)"],
        }
        _afolu_relevant = []
        for kw, sources in _AFOLU_IND_MAP.items():
            if kw.lower() in _afolu_ind.lower():
                _afolu_relevant.extend(s for s in sources if s not in _afolu_relevant)

        if _afolu_relevant:
            st.success(
                "Industry (" + _afolu_ind.split(" — ")[-1] + "): "
                "AFOLU is **likely material** for your sector. "
                "Relevant sources: " + ", ".join(_afolu_relevant)
            )
        elif _afolu_ind:
            st.info(
                "AFOLU is typically **not material** for " + _afolu_ind.split(" — ")[-1] + ". "
                "Only complete this tab if your operations include livestock, "
                "managed forests, or significant land-use change."
            )
        else:
            st.caption("Complete ⚙️ Setup → industry field to see sector-specific AFOLU guidance.")

        afolu_sub = st.radio("AFOLU source", ["🐄 Enteric fermentation", "💩 Manure management"],
                              horizontal=True, key="afolu_sub")

        ANIMAL_EFS = {
            "Dairy cattle":     ("dairy_cattle",     56.0,  "India Tier 1 — IPCC 2006 Table 10.11"),
            "Non-dairy cattle": ("non_dairy_cattle",  25.0,  "India Tier 1 — IPCC 2006 Table 10.11"),
            "Buffalo":          ("buffalo",           55.0,  "India Tier 1 — IPCC 2006 Table 10.11"),
            "Sheep":            ("sheep",             5.0,   "IPCC 2006 Table 10.12"),
            "Goat":             ("goat",              5.0,   "IPCC 2006 Table 10.13"),
            "Pig":              ("pig",               1.5,   "IPCC 2006 Table 10.14"),
        }

        if "Enteric" in afolu_sub:
            proc_afolu = "AFOLU \u2014 Enteric fermentation (Tier 1)"
            st.markdown("**Livestock head count — Enteric fermentation**")
        else:
            proc_afolu = "AFOLU \u2014 Manure management (Tier 1)"
            st.markdown("**Livestock head count — Manure management**")
            st.caption("Includes both CH₄ (manure storage) and N₂O (manure N). IPCC 2006 Tables 10.14 + 10.21.")

        hc = st.columns([2, 1, 1, 2])
        hc[0].caption("Animal type"); hc[1].caption("Head count"); hc[2].caption("tCO₂e"); hc[3].caption("EF basis")

        afolu_pairs = []
        for label, (fuel, ef_ch4, source) in ANIMAL_EFS.items():
            c1, c2, c3, c4 = st.columns([2, 1, 1, 2])
            c1.markdown(f"**{label}**")
            heads = c2.number_input("", min_value=0, value=0, step=1,
                                    key=f"afolu_{fuel}_{afolu_sub[:3]}",
                                    label_visibility="collapsed")
            if heads > 0:
                try:
                    afolu_rec = ActivityRecord(
                        scope="Scope 1",
                        process=proc_afolu,
                        country=profile.get("primary_country", "IN"),
                        quantity=float(heads), unit="head",
                        fuel_or_item=fuel,
                        reporting_year=profile.get("reporting_year", 2024),
                        gwp_ar=profile.get("gwp_ar", 6),
                        org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
                    )
                    afolu_res = calculate(afolu_rec, conn)
                    c3.metric("", f"{afolu_res.t_CO2e:.3f}")
                    c4.caption(source)
                    afolu_pairs.append((afolu_rec, afolu_res))
                    all_results.append((afolu_rec, afolu_res))
                except Exception as e:
                    c3.error(str(e)[:40])
            else:
                c3.caption("—"); c4.caption(source)

        if afolu_pairs:
            afolu_total = sum(r.t_CO2e for _, r in afolu_pairs)
            st.metric("AFOLU total", f"{afolu_total:.3f} tCO₂e")
            n_fb = sum(1 for _, r in afolu_pairs if r.fallback_triggered)
            fallback_warning(n_fb, len(afolu_pairs))
            if st.button("💾 Save AFOLU to inventory", key="save_afolu"):
                written = inventory.persist_batch(
                    [r for _, r in afolu_pairs],
                    [rec for rec, _ in afolu_pairs],
                    inventory_year=profile.get("reporting_year", 2024),
                )
                st.success(f"✓ {written} AFOLU records saved.")
                st.rerun()

    # ── Scope 1 running total ────────────────────────────────────────────
    if all_results:
        st.markdown("---")
        st.markdown("### Scope 1 session total")
        total = sum(r.t_CO2e for _, r in all_results)
        co2 = sum(r.kg_CO2 for _, r in all_results) / 1000
        ch4 = sum(r.kg_CH4 for _, r in all_results) / 1000
        n2o = sum(r.kg_N2O for _, r in all_results) / 1000

        mc = st.columns(4)
        mc[0].metric("Total tCO₂e", f"{total:.3f}")
        mc[1].metric("tCO₂", f"{co2:.3f}")
        mc[2].metric("tCH₄", f"{ch4:.5f}")
        mc[3].metric("tN₂O", f"{n2o:.5f}")
        st.caption(f"IPCC AR{profile['gwp_ar']} GWP100 — session only, not yet saved to inventory")

    # ── Previously saved Scope 1 records ────────────────────────────────────
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
                (_org_id, _inv_yr, "Scope 1")
            ).fetchall()
            _cn.close()
            _recs = [dict(r) for r in _rows]
            if _recs:
                _tot = sum(r["t_CO2e"] for r in _recs)
                with st.expander(
                    f"📋 Saved Scope 1 records — {_inv_yr}  ({len(_recs)} entries · {_tot:,.1f} tCO₂e)",
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
                    f"No saved Scope 1 records for {_inv_yr}. "
                    "Use the tabs above to calculate and press **Save to inventory**."
                )
    except Exception as _ex:
        st.caption(f"(Could not load saved records: {_ex})")

