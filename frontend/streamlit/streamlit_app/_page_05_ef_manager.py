"""
Page 05 — Emission Factor Manager.
View seeded EFs, grid EFs, EEIO factors.
Trigger re-ingestion, see update log, add manual overrides.
"""
import streamlit as st


def render():
    st.title("🗄️ Emission Factor Manager")
    st.caption(
        "All emission factors used in calculations. "
        "Lower preferred_rank = more specific = higher priority."
    )

    conn = st.session_state.ef_conn

    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "📋 Emission factors", "⚡ Grid EFs (Scope 2)",
        "🚛 WTT / Upstream", "💰 EEIO factors",
        "📊 Uncertainty ranges", "🔄 Update"
    ])

    with tab1:
        _ef_table(conn)

    with tab2:
        _grid_ef_table(conn)

    with tab3:
        _wtt_ef_table(conn)

    with tab4:
        _eeio_table(conn)

    with tab5:
        _uncertainty_reference()

    with tab6:
        _update_panel(conn)


def _ef_table(conn):
    try:
        import pandas as pd
    except ImportError:
        st.error("pandas required")
        return

    # Filters
    c1, c2, c3 = st.columns(3)
    scope_filter = c1.selectbox("Scope", ["All", "S1", "S2", "S3"], key="ef_scope")
    module_filter = c2.selectbox("Module", ["All", "stationary_combustion",
                                             "mobile_combustion", "purchased_electricity",
                                             "waste_landfill", "other"], key="ef_module")
    country_filter = c3.selectbox("Country", ["All", "IN", "GLOBAL", "US", "GB"],
                                   key="ef_country")

    query = "SELECT factor_id, scope, module, country, geography_level, fuel_item, gas, factor_value, unit_numerator, unit_denominator, preferred_rank, source_name, year_start FROM emission_factors WHERE 1=1"
    params = []
    if scope_filter != "All":
        query += " AND scope=?"; params.append(scope_filter)
    if module_filter != "All":
        query += " AND module=?"; params.append(module_filter)
    if country_filter != "All":
        query += " AND country=?"; params.append(country_filter)
    query += " ORDER BY preferred_rank, country, fuel_item, gas LIMIT 500"

    rows = conn.execute(query, params).fetchall()
    if not rows:
        st.info("No factors match filter.")
        return

    df = pd.DataFrame([dict(r) for r in rows])
    df.columns = [c.replace("_", " ").title() for c in df.columns]
    st.caption(f"{len(df)} factors shown (max 500)")
    st.dataframe(df, use_container_width=True, height=450)

    # Download
    csv = df.to_csv(index=False)
    st.download_button("⬇️ Download CSV", csv, "emission_factors.csv", "text/csv")


def _wtt_ef_table(conn):
    """Well-to-Tank (WTT) upstream fuel emission factors — DEFRA 2024."""
    st.markdown("#### Well-to-Tank (WTT) upstream fuel EFs")
    st.caption(
        "WTT factors cover extraction, processing and transport of fuels before combustion. "
        "These appear as **Scope 3 Cat 3A** in your inventory. Source: DEFRA 2024."
    )
    try:
        rows = conn.execute("""
            SELECT factor_id, fuel_item, gas, factor_value,
                   unit_numerator, unit_denominator, source_name
            FROM emission_factors
            WHERE factor_id LIKE 'WTT%'
            ORDER BY fuel_item, gas
        """).fetchall()

        if not rows:
            st.info("No WTT EFs found. Run 'Re-ingest all seeds' in the Update tab.")
            return

        try:
            import pandas as pd
            df = pd.DataFrame([dict(r) for r in rows])
            df["unit"] = df["unit_numerator"] + "/" + df["unit_denominator"]
            df = df[["factor_id","fuel_item","gas","factor_value","unit","source_name"]]
            df.columns = ["Factor ID","Fuel","Gas","EF value","Unit","Source"]
            st.dataframe(df, use_container_width=True, hide_index=True)
        except ImportError:
            for r in rows:
                d = dict(r)
                st.write(f"**{d['fuel_item']}** — {d['gas']}: "
                         f"{d['factor_value']} {d['unit_numerator']}/{d['unit_denominator']}")

        st.caption(
            f"**{len(rows)} WTT factors** · Applied automatically when Cat 3A "
            "upstream fuel records are calculated."
        )
    except Exception as e:
        st.error(f"WTT EF load failed: {e}")


def _grid_ef_table(conn):
    try:
        import pandas as pd
    except ImportError:
        return

    rows = conn.execute(
        """SELECT factor_id, geography_code, fiscal_year, method,
                  ef_value_kgco2e_per_kwh, ef_value_tco2_per_mwh, source, notes
           FROM grid_ef ORDER BY geography_code, fiscal_year DESC, method"""
    ).fetchall()
    if not rows:
        st.info("No grid EFs seeded.")
        return

    df = pd.DataFrame([dict(r) for r in rows])
    st.dataframe(df, use_container_width=True)

    # Highlight current India EF
    current = [r for r in rows if r["geography_code"] == "IN"
               and r["fiscal_year"] == "2023-24" and r["method"] == "weighted_avg"]
    if current:
        v = current[0]["ef_value_kgco2e_per_kwh"]
        st.info(f"✓ Current India grid EF (FY 2023-24, weighted avg): **{v} kgCO₂e/kWh** — CEA v20")


def _eeio_table(conn):
    try:
        import pandas as pd
    except ImportError:
        return

    search = st.text_input("Search sector", placeholder="e.g. 5415, truck, food")
    query = """SELECT factor_id, sector_code, flowable, gas_canonical, ef_value,
                      ef_unit, year, geography_code, source
               FROM eeio_factors"""
    params = []
    if search:
        query += " WHERE sector_code LIKE ? OR flowable LIKE ?"
        params = [f"%{search}%", f"%{search}%"]
    query += " ORDER BY sector_code, gas_canonical LIMIT 300"

    rows = conn.execute(query, params).fetchall()
    if not rows:
        st.info("No EEIO factors match.")
        return

    df = pd.DataFrame([dict(r) for r in rows])
    st.caption(f"{len(df)} factors (USEEIO v2, Exiobase 2019, US Summary)")
    st.dataframe(df, use_container_width=True, height=400)


def _update_panel(conn):
    st.markdown("### Re-ingest seed data")
    st.warning(
        "Re-ingesting will update all EFs from seed files. "
        "Custom EFs (rank=1) are preserved. "
        "Locked inventory records are not affected."
    )

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 Re-ingest all seeds", key="efmgr_reingest", type="primary"):
            from ef_store.ingester import ingest_all_seeds
            with st.spinner("Ingesting..."):
                results = ingest_all_seeds(conn, force=True)
            st.success(f"✓ Done: {results}")

    with col2:
        if st.button("📊 DB summary", key="efmgr_dbsummary"):
            from ef_store.db import db_summary
            summary = db_summary(conn)
            for k, v in summary.items():
                if k != "meta":
                    st.metric(k, v)

    st.markdown("---")
    st.markdown("### Add / edit custom EF")
    st.caption(
        "Add a supplier-provided or government-issued EF not in the seed files. "
        "Custom EFs get preferred_rank=1 (highest priority, overrides all defaults)."
    )

    with st.form("ef_override"):
        c1, c2, c3 = st.columns(3)
        factor_id = c1.text_input("factor_id", placeholder="CUSTOM_MY_EF_CO2")
        module    = c2.selectbox("Module", ["stationary_combustion", "mobile_combustion",
                                             "purchased_electricity", "waste_landfill",
                                             "fugitive_energy", "other"])
        scope     = c3.selectbox("Scope", ["S1", "S2", "S3"])

        c4, c5, c6 = st.columns(3)
        fuel_item = c4.text_input("fuel_item", placeholder="natural_gas")
        gas       = c5.selectbox("Gas", ["CO2", "CH4", "N2O", "CO2e"])
        country   = c6.text_input("Country", value="IN")

        c7, c8, c9 = st.columns(3)
        value    = c7.number_input("Factor value", format="%.6f")
        unit_num = c8.text_input("Unit numerator", placeholder="kgCO2")
        unit_den = c9.text_input("Unit denominator", placeholder="TJ")

        source    = st.text_input("Source / citation")
        submitted = st.form_submit_button("💾 Save custom EF")

        if submitted and factor_id and value:
            try:
                conn.execute(
                    """INSERT OR REPLACE INTO emission_factors
                       (factor_id, factor_set_version, scope, module, country,
                        geography_level, fuel_item, gas, factor_value,
                        unit_numerator, unit_denominator, source_name, preferred_rank)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (factor_id, "custom", scope, module, country,
                     "national" if country != "GLOBAL" else "global",
                     fuel_item or None, gas, value,
                     unit_num, unit_den, source, 1)
                )
                conn.commit()
                st.success(f"✓ Custom EF '{factor_id}' saved (rank=1 — highest priority).")
                st.rerun()
            except Exception as e:
                st.error(str(e))

    # ── Delete / manage custom EFs ────────────────────────────────────────
    st.markdown("---")
    st.markdown("### Manage custom EFs")

    custom_rows = conn.execute(
        "SELECT factor_id, module, fuel_item, gas, country, factor_value, "
        "unit_numerator, unit_denominator, source_name "
        "FROM emission_factors WHERE factor_set_version='custom' OR preferred_rank=1 "
        "ORDER BY factor_id"
    ).fetchall()

    if not custom_rows:
        st.info("No custom EFs yet. Add one above.")
    else:
        st.caption(f"{len(custom_rows)} custom EF(s) — these override all seed data.")
        for row in custom_rows:
            r = dict(row)
            with st.expander(
                f"`{r['factor_id']}` — {r['fuel_item'] or '—'} · {r['gas']} · "
                f"{r['factor_value']} {r['unit_numerator']}/{r['unit_denominator']}",
                expanded=False,
            ):
                dc = st.columns(4)
                dc[0].metric("Value", f"{r['factor_value']}")
                dc[1].metric("Module", r['module'])
                dc[2].metric("Country", r['country'])
                dc[3].metric("Gas", r['gas'])
                st.caption(f"Source: {r['source_name'] or 'not specified'}")

                bc1, bc2 = st.columns(2)
                if bc1.button("🗑️ Delete this EF", key=f"del_ef_{r['factor_id']}",
                               type="secondary"):
                    try:
                        conn.execute(
                            "DELETE FROM emission_factors WHERE factor_id=? "
                            "AND (factor_set_version='custom' OR preferred_rank=1)",
                            (r["factor_id"],)
                        )
                        conn.commit()
                        st.success(f"Deleted '{r['factor_id']}'.")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

                if bc2.button("📋 Copy ID", key=f"copy_ef_{r['factor_id']}"):
                    st.code(r["factor_id"])


def _uncertainty_reference():
    """IPCC 2006 uncertainty ranges for common EF categories."""
    st.markdown("#### IPCC 2006 Uncertainty Ranges (for reference)")
    st.caption(
        "Source: IPCC 2006 Guidelines Vol.1 Ch.3 — Uncertainties. "
        "These ranges apply to the emission factors themselves (not activity data). "
        "Use ±% when estimating inventory uncertainty for ISO 14064-1 / GHG Protocol reporting."
    )

    _UNCERTAINTY = [
        # (Category, Gas, EF uncertainty ±%, Notes)
        ("Stationary combustion — natural gas",  "CO₂",  "1%",   "IPCC 2006 Table 1.2 — very well characterised"),
        ("Stationary combustion — coal",         "CO₂",  "2–3%", "Depends on coal type and carbon content"),
        ("Stationary combustion — fuel oil/HFO", "CO₂",  "2%",   "IPCC 2006 Table 1.2"),
        ("Stationary combustion — biomass",       "CO₂",  "25–50%","Biogenic; carbon content varies widely"),
        ("Mobile combustion — petrol/diesel",     "CO₂",  "1–2%", "Good fuel quality data in India"),
        ("Mobile combustion — all fuels",         "CH₄",  "150%", "IPCC 2006 — high uncertainty for non-CO₂"),
        ("Mobile combustion — all fuels",         "N₂O",  "200%", "IPCC 2006 — high uncertainty for N₂O"),
        ("Fugitive — HFCs (refrigerants)",        "CO₂e", "50–150%","Activity data uncertainty dominates"),
        ("Purchased electricity (grid)",          "CO₂e", "10–30%","Grid EF varies by method; CEA ±10% typical"),
        ("AFOLU — enteric fermentation",          "CH₄",  "30–50%","IPCC Tier 1; improves to 20% at Tier 2"),
        ("AFOLU — manure management",             "CH₄",  "40–60%","Depends on manure management system"),
        ("AFOLU — manure management",             "N₂O",  "100%", "IPCC 2006 — high uncertainty"),
        ("IPPU — cement (clinker)",               "CO₂",  "5–10%","Clinker content drives uncertainty"),
        ("EEIO spend-based",                      "CO₂e", "300%", "Sector EFs are averages; use primary data where possible"),
        ("WTT upstream fuels",                    "CO₂e", "20–50%","Source: DEFRA 2024; varies by supply chain"),
    ]

    try:
        import pandas as pd
        df = pd.DataFrame(_UNCERTAINTY, columns=["Category", "Gas", "EF uncertainty ±%", "Notes"])
        st.dataframe(df, use_container_width=True, hide_index=True)
    except ImportError:
        for row in _UNCERTAINTY:
            st.write(f"**{row[0]}** ({row[1]}): ±{row[2]} — {row[3]}")

    st.caption(
        "💡 **Tip:** The GHG Protocol recommends quantifying overall inventory uncertainty "
        "using error propagation (square root of sum of squares of individual uncertainties). "
        "High-uncertainty categories (EEIO, fugitives, AFOLU) should be flagged for improvement."
    )
