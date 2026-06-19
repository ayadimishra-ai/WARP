"""
Page 04 — Inventory Dashboard.
Multi-scope charts, intensity metrics, SBTi pathway, data quality workflow.
"""
import streamlit as st


def _cached_summary(_inventory, org_id: str, inv_year: int) -> dict:
    """Get inventory summary - tries direct SQL first for reliability."""
    try:
        from streamlit_app._org_helper import direct_summary
        s = direct_summary(org_id, inv_year)
        if s and s.get("n_records", 0) > 0:
            return s
    except Exception:
        pass
    return _inventory.get_summary(org_id=org_id, inventory_year=inv_year)


def _cached_by_category(_inventory, org_id: str, inv_year: int) -> list:
    return _inventory.get_by_category(org_id=org_id, inventory_year=inv_year)


def _cached_fallback(_inventory, org_id: str, inv_year: int) -> dict:
    return _inventory.get_fallback_report(org_id=org_id, inventory_year=inv_year)


def render():
    st.title("📊 Emissions Dashboard")

    profile = st.session_state.org_profile
    if not profile.get("setup_done"):
        st.warning("Complete Setup first.")
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



    # ── Multi-year selector ───────────────────────────────────────────────
    _base_year = profile["reporting_year"]
    _available_years = [_base_year]
    try:
        _yr_rows = inventory._db.execute(
            "SELECT DISTINCT inventory_year FROM emission_results "
            "WHERE org_id=? ORDER BY inventory_year DESC",
            (org_id,)
        ).fetchall()
        if _yr_rows:
            _available_years = [r[0] for r in _yr_rows]
            if _base_year not in _available_years:
                _available_years.insert(0, _base_year)
    except Exception:
        pass

    if len(_available_years) > 1:
        _yr_col, _info_col = st.columns([2, 6])
        inv_year = _yr_col.selectbox(
            "📅 Viewing year", _available_years, index=0,
            key="dash_inv_year",
            help="Switch between inventory years. All charts and metrics update.",
        )
        _info_col.caption(
            f"Showing **{inv_year}** inventory  ·  "
            f"Data available: {', '.join(str(y) for y in _available_years)}  ·  "
            f"Setup year: **{_base_year}**"
        )
    else:
        inv_year = _base_year

    summary = _cached_summary(inventory, org_id, inv_year)
    if not summary or summary.get("n_records", 0) == 0:
        st.info(
            "No emission records found. "
            "Enter data in Scope 1, 2, 3 pages then save to inventory."
        )
        return

    total = summary.get("total_t_co2e", 0)
    s1    = summary.get("scope1_t_co2e", 0)
    s2    = summary.get("scope2_t_co2e", 0)
    s3    = summary.get("scope3_t_co2e", 0)
    n_rec = summary.get("n_records", 0)
    n_fb  = summary.get("n_fallback_records", 0)
    bio   = summary.get("biogenic_t_co2", 0)

    # ── Previous-year delta ───────────────────────────────────────────────
    _prev_total = None
    _prev_s1 = _prev_s2 = _prev_s3 = None
    try:
        prev_summary = _cached_summary(inventory, org_id, inv_year - 1)
        if prev_summary and prev_summary.get("n_records", 0) > 0:
            _prev_total = prev_summary.get("total_t_co2e", 0)
            _prev_s1    = prev_summary.get("scope1_t_co2e", 0)
            _prev_s2    = prev_summary.get("scope2_t_co2e", 0)
            _prev_s3    = prev_summary.get("scope3_t_co2e", 0)
    except Exception:
        pass

    def _delta(curr, prev):
        """Return delta string like '+12.3%' or None if no prev data."""
        if prev is None or prev == 0:
            return None
        pct = (curr - prev) / prev * 100
        return f"{pct:+.1f}% vs {inv_year - 1}"

    # ── Top metrics ──────────────────────────────────────────────────────
    mc = st.columns(5)
    mc[0].metric("Total tCO₂e", f"{total:,.2f}",
                 delta=_delta(total, _prev_total),
                 delta_color="inverse")
    mc[1].metric("Scope 1", f"{s1:,.2f}",
                 delta=_delta(s1, _prev_s1) if _prev_s1 is not None
                       else (f"{s1/total*100:.1f}%" if total else None),
                 delta_color="inverse" if _prev_s1 is not None else "normal")
    mc[2].metric("Scope 2", f"{s2:,.2f}",
                 delta=_delta(s2, _prev_s2) if _prev_s2 is not None
                       else (f"{s2/total*100:.1f}%" if total else None),
                 delta_color="inverse" if _prev_s2 is not None else "normal")
    mc[3].metric("Scope 3", f"{s3:,.2f}",
                 delta=_delta(s3, _prev_s3) if _prev_s3 is not None
                       else (f"{s3/total*100:.1f}%" if total else None),
                 delta_color="inverse" if _prev_s3 is not None else "normal")
    # Data quality grade in top bar
    _dq_grade = "—"
    try:
        from outputs.report import _quality_grade
        _dq_grade = _quality_grade(n_fb, n_rec)[0]  # first char: A/B/C/D/E
    except Exception:
        pass
    mc[4].metric("DQ grade", _dq_grade,
                 help="A=all national EFs · B=mostly national · C=mixed · D=majority fallback · E=mostly defaults")

    # Last-updated timestamp from most recent record
    _last_updated = ""
    try:
        row = inventory._db.execute(
            "SELECT MAX(updated_at) FROM emission_results WHERE org_id=? AND inventory_year=?",
            (org_id, current_year)
        ).fetchone()
        if row and row[0]:
            _last_updated = f" · Last saved: {row[0][:16].replace('T',' ')} UTC"
    except Exception:
        pass

    if n_rec > 0:
        st.caption(
            f"{n_rec} records | {n_fb} fallback EFs ({n_fb/n_rec*100:.0f}%) | "
            f"Biogenic CO₂: {bio:.2f} t (excl.) | IPCC AR{profile.get('gwp_ar',6)} GWP100"
            f"{_last_updated}"
        )
    else:
        st.info("No records saved yet. Enter data in Scope 1, 2, or 3 pages.")

    # ── Tabs ─────────────────────────────────────────────────────────────
    try:
        import plotly.express as px
        import pandas as pd
        _has_plotly = True
    except ImportError:
        _has_plotly = False
        st.warning("Install plotly for charts: pip install plotly")

    tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9, tab10 = st.tabs([
        "🍩 Scope breakdown",
        "📊 By category",
        "📏 Intensity metrics",
        "⚠️ Data quality",
        "📈 SBTi pathway",
        "📅 Year comparison",
        "🏭 Benchmarks",
        "🏷️ By site",
        "🏢 Suppliers",
        "🔀 Flow",
    ])

    with tab1:
        if _has_plotly:
            _scope_charts(s1, s2, s3, total, bio, inv_year, px, pd)
        else:
            st.write(f"Scope 1: {s1:.2f} | Scope 2: {s2:.2f} | Scope 3: {s3:.2f} tCO₂e")

    with tab2:
        by_cat = _cached_by_category(inventory, org_id, inv_year)
        if _has_plotly:
            _category_chart(by_cat, inv_year, px, pd)
        else:
            for r in by_cat:
                st.write(f"{r['scope']} | {r['category']}: {r['t_CO2e']:.3f} tCO₂e")

    with tab3:
        _intensity_tab(total, s1, s2, s3)

    with tab4:
        by_cat2   = _cached_by_category(inventory, org_id, inv_year)
        fb        = _cached_fallback(inventory, org_id, inv_year)
        all_recs  = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
        if _has_plotly:
            _data_quality_tab(fb, n_rec, by_cat2, px, pd, all_recs)
        else:
            _fb_count = len(fb) if fb else 0
            _total = len(all_recs) if all_recs else n_rec
            st.write(f"{_fb_count} of {_total} records used fallback EFs")

    with tab5:
        _sbti_tab(total, s1, s2, s3, inv_year, _has_plotly)

    with tab6:
        _year_comparison_tab(inventory, org_id, inv_year, _has_plotly)

    with tab7:
        _benchmark_tab(total, s1, s2, s3, profile, _has_plotly)

    with tab8:
        _site_breakdown_tab(inventory, org_id, inv_year, _has_plotly)

    with tab9:
        _supplier_ghg_tab(inventory, org_id, inv_year, _has_plotly)

    with tab10:
        _sankey_flow_tab(total, s1, s2, s3, inventory, org_id, inv_year, _has_plotly)


# ---------------------------------------------------------------------------

def _scope_charts(s1, s2, s3, total, bio, inv_year, px, pd):
    c1, c2 = st.columns(2)
    with c1:
        df = pd.DataFrame({
            "Scope": ["Scope 1 (Direct)", "Scope 2 (Energy)", "Scope 3 (Value chain)"],
            "tCO₂e": [s1, s2, s3],
        })
        fig = px.pie(df, values="tCO₂e", names="Scope",
                     title=f"Emissions by scope — {inv_year}",
                     color_discrete_sequence=["#EF553B", "#FFA15A", "#636EFA"],
                     hole=0.4)
        fig.update_traces(textposition="inside", textinfo="percent+label")
        fig.update_layout(showlegend=False, margin=dict(t=40, b=10, l=10, r=10))
        st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_1")

    with c2:
        df2 = pd.DataFrame({
            "Scope": ["Scope 1", "Scope 2", "Scope 3"],
            "tCO₂e": [s1, s2, s3],
        })
        fig2 = px.bar(df2, x="Scope", y="tCO₂e",
                      title="tCO₂e by scope",
                      color="Scope",
                      color_discrete_sequence=["#EF553B", "#FFA15A", "#636EFA"],
                      text_auto=".2f")
        fig2.update_layout(showlegend=False, margin=dict(t=40, b=10))
        st.plotly_chart(fig2, use_container_width=True, key="p04dashb_plt_2")

    if bio > 0:
        st.info(
            f"🌿 Biogenic CO₂: **{bio:.4f} tCO₂** from biomass combustion — "
            "reported separately, excluded from total per GHG Protocol."
        )

    # ── Scope 1 sub-breakdown ─────────────────────────────────────────────
    if s1 > 0:
        try:
            inventory = st.session_state.inventory
            profile   = st.session_state.org_profile
            org_id    = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
            by_cat_all = _cached_by_category(inventory, org_id, profile.get("reporting_year", 2024))
            s1_cats = [r for r in by_cat_all if r["scope"] == "Scope 1"
                       and (r.get("t_CO2e") or 0) > 0]
            if len(s1_cats) > 1:
                with st.expander("🔍 Scope 1 breakdown by source", expanded=False):
                    sub_labels = {
                        "Stationary combustion": "#EF553B",
                        "Mobile combustion":     "#FF7F7F",
                        "Fugitive":              "#FFB3B3",
                        "IPPU":                  "#C00000",
                        "AFOLU":                 "#FF4444",
                    }
                    sub_rows = []
                    for r in s1_cats:
                        cat = r.get("category") or r.get("process", "")
                        # Map to sub-category
                        if "stationary" in cat.lower() or "combustion" in cat.lower():
                            sub = "Stationary combustion"
                        elif "mobile" in cat.lower():
                            sub = "Mobile combustion"
                        elif "fugitive" in cat.lower():
                            sub = "Fugitive"
                        elif "ippu" in cat.lower() or "industrial" in cat.lower():
                            sub = "IPPU"
                        elif "afolu" in cat.lower() or "enteric" in cat.lower():
                            sub = "AFOLU"
                        else:
                            sub = cat[:30]
                        sub_rows.append({"Source": sub, "tCO₂e": r["t_CO2e"]})

                    # Aggregate by sub-category
                    agg: dict[str, float] = {}
                    for row in sub_rows:
                        agg[row["Source"]] = agg.get(row["Source"], 0) + row["tCO₂e"]

                    df_sub = pd.DataFrame([{"Source": k, "tCO₂e": v}
                                           for k, v in sorted(agg.items(), key=lambda x: -x[1])])
                    fig_sub = px.bar(df_sub, x="tCO₂e", y="Source",
                                     orientation="h",
                                     title="Scope 1 by source type",
                                     color="Source",
                                     text_auto=".2f")
                    fig_sub.update_layout(showlegend=False,
                                          height=max(200, len(agg) * 50),
                                          margin=dict(t=40, b=10, l=10, r=10))
                    st.plotly_chart(fig_sub, use_container_width=True, key="p04dashb_plt_3")
        except Exception:
            pass  # silently skip if inventory not loaded



def _category_chart(by_cat, inv_year, px, pd):
    if not by_cat:
        st.info("No category data yet.")
        return
    df = pd.DataFrame(by_cat)
    df = df[df["t_CO2e"].abs() > 0.0001].sort_values("t_CO2e")

    fig = px.bar(df, x="t_CO2e", y="category", orientation="h",
                 color="scope",
                 color_discrete_map={"Scope 1": "#EF553B", "Scope 2": "#FFA15A", "Scope 3": "#636EFA"},
                 title=f"Emissions by category — {inv_year}",
                 labels={"t_CO2e": "tCO₂e", "category": ""})
    fig.update_layout(height=max(300, len(df) * 30),
                      margin=dict(l=10, r=10, t=40, b=10))
    st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_4")

    # Add avoided emissions note if any negatives
    neg = df[df["t_CO2e"] < 0]
    if not neg.empty:
        st.info(
            f"ℹ️ {len(neg)} category(ies) show negative values — "
            "these represent **avoided emissions** from recycling."
        )

    st.dataframe(
        df[["scope","category","n_records","t_CO2e","t_CO2","t_CH4","t_N2O"]]
          .rename(columns={"t_CO2e":"tCO₂e","t_CO2":"tCO₂",
                           "t_CH4":"tCH₄","t_N2O":"tN₂O","n_records":"Records"})
          .reset_index(drop=True),
        use_container_width=True,
    )

    # ── S3 gap analysis ────────────────────────────────────────────────────
    profile = st.session_state.org_profile
    material_cats = profile.get("s3_material", [])
    if material_cats:
        cats_with_data = set(
            r["category"] for r in by_cat if r["scope"] == "Scope 3"
            and (r.get("t_CO2e") or 0) != 0
        )
        missing = [c for c in material_cats
                   if not any(c.split("—")[0].strip() in d
                              for d in cats_with_data)]
        if missing:
            st.warning(
                f"**S3 completeness gap:** {len(missing)} of your material "
                f"categories have no data yet:\n\n"
                + "\n".join(f"- {c}" for c in missing)
            )
        else:
            st.success(f"✅ All {len(material_cats)} material Scope 3 categories have data.")



def _intensity_tab(total, s1, s2, s3):
    st.markdown("#### GHG Intensity Metrics")
    st.caption(
        "Intensity ratios normalise emissions by a business metric. "
        "Required for BRSR disclosure and SBTi intensity targets. "
        "Pre-populated from Setup — edit here for this session only."
    )

    # Pre-populate from org_profile (set in Setup)
    profile = st.session_state.org_profile
    default_turnover  = float(profile.get("revenue_inr_cr", 0.0))
    default_employees = int(profile.get("employees", 0))
    default_prod_vol  = float(profile.get("production_volume", 0.0))
    default_prod_unit = profile.get("production_unit", "units") or "units"
    fx                = float(profile.get("fx_to_usd", 0.012))

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Financial intensity**")
        turnover = st.number_input(
            "Annual turnover (INR crore)", min_value=0.0,
            value=default_turnover, format="%.2f", key="dash_turnover",
        )
        if turnover > 0:
            i_s12 = (s1 + s2) / turnover
            i_all = total / turnover
            m1, m2 = st.columns(2)
            m1.metric("tCO₂e / crore INR (S1+S2)",     f"{i_s12:.4f}")
            m2.metric("tCO₂e / crore INR (S1+2+3)",    f"{i_all:.4f}")
            st.caption("BRSR Essential Indicator P6-E4.")

        revenue_usd = turnover * fx * 10  # crore INR → USD million
        if revenue_usd > 0:
            i_cdp = (s1 + s2) / revenue_usd
            st.metric("tCO₂e / USD million revenue (CDP C8)", f"{i_cdp:.4f}")
            st.caption(f"Converted at {fx:.4f} USD/INR × 10 (crore → million)")

    with c2:
        st.markdown("**Operational intensity**")
        employees = st.number_input(
            "Total employees (FTE)", min_value=0,
            value=default_employees, step=1, key="dash_emp",
        )
        if employees > 0:
            m1, m2 = st.columns(2)
            m1.metric("tCO₂e / employee (S1+S2)",    f"{(s1+s2)/employees:.4f}")
            m2.metric("tCO₂e / employee (all scopes)", f"{total/employees:.4f}")

        prod_unit = st.text_input(
            "Production unit label", value=default_prod_unit, key="dash_prod_unit",
        )
        production = st.number_input(
            f"Production volume ({prod_unit})", min_value=0.0,
            value=default_prod_vol, format="%.2f", key="dash_prod",
        )
        if production > 0:
            m1, m2 = st.columns(2)
            m1.metric(f"tCO₂e / {prod_unit} (S1+S2)",    f"{(s1+s2)/production:.4f}")
            m2.metric(f"tCO₂e / {prod_unit} (all scopes)", f"{total/production:.4f}")

    # ── Live intensity summary ───────────────────────────────────────────
    st.markdown("---")
    st.markdown("**Live intensity summary (updates as you change inputs above):**")
    _int_rows = []
    if total > 0:
        if turnover > 0:
            _int_rows.append({"Metric": "tCO₂e / crore INR turnover", "S1+S2": f"{(s1+s2)/turnover:.4f}", "Total": f"{total/turnover:.4f}"})
        if employees > 0:
            _int_rows.append({"Metric": "tCO₂e / FTE employee", "S1+S2": f"{(s1+s2)/employees:.4f}", "Total": f"{total/employees:.4f}"})
        if production > 0:
            _int_rows.append({"Metric": f"tCO₂e / {prod_unit or 'unit'}", "S1+S2": f"{(s1+s2)/production:.4f}", "Total": f"{total/production:.4f}"})
    if _int_rows:
        try:
            import pandas as pd
            st.dataframe(pd.DataFrame(_int_rows), use_container_width=True, hide_index=True)
        except ImportError:
            for r in _int_rows: st.write(r)
    else:
        st.info(
            "Enter values above (turnover, employees, or production volume) to see intensity metrics. "
            "Pre-populate in **⚙️ Setup → Intensity metrics** tab."
        )

    # ── Absolute vs intensity toggle ──────────────────────────────────────
    st.markdown("---")
    st.markdown("**Absolute vs intensity view**")
    view_mode = st.radio("View mode", ["Absolute (tCO₂e)", "Intensity (per unit)"],
                          horizontal=True, key="intensity_toggle")
    denominators = {}
    if turnover > 0:    denominators["Per crore INR"]  = turnover
    if employees > 0:   denominators["Per employee"]   = employees
    if production > 0:  denominators["Per " + (prod_unit or "unit")] = production

    if denominators:
        chosen_denom_label = st.selectbox("Intensity denominator",
                                           list(denominators.keys()),
                                           key="intensity_denom")
        denom = denominators[chosen_denom_label]
        scopes_data = {
            "Scope 1": s1, "Scope 2": s2, "Scope 3": s3, "Total": total
        }
        try:
            import plotly.express as px, pandas as pd
            if view_mode.startswith("Absolute"):
                df = pd.DataFrame([{"Scope": k, "tCO₂e": v} for k, v in scopes_data.items()])
                fig = px.bar(df, x="Scope", y="tCO₂e",
                             title="Absolute emissions by scope",
                             color="Scope", text_auto=".2f",
                             color_discrete_sequence=["#EF553B","#FFA15A","#636EFA","#1F3864"])
            else:
                df = pd.DataFrame([{"Scope": k, "Intensity": v / denom}
                                    for k, v in scopes_data.items()])
                fig = px.bar(df, x="Scope", y="Intensity",
                             title=f"Intensity ({chosen_denom_label})",
                             color="Scope", text_auto=".4f",
                             color_discrete_sequence=["#EF553B","#FFA15A","#636EFA","#1F3864"])
                fig.update_yaxes(title=f"tCO₂e / {chosen_denom_label.split()[-1]}")
            fig.update_layout(showlegend=False, margin=dict(t=50, b=10))
            st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_5")
        except ImportError:
            for scope, val in scopes_data.items():
                if view_mode.startswith("Absolute"):
                    st.write(f"{scope}: **{val:,.4f} tCO₂e**")
                else:
                    st.write(f"{scope}: **{val/denom:.6f}** tCO₂e/{chosen_denom_label.split()[-1]}")


def _data_quality_tab(fb, n_total, by_cat, px, pd, all_recs=None):
    st.markdown("#### Data Quality Report")

    if not fb:
        st.success("✓ All records used national or supplier-specific emission factors.")
        return

    n_fb = len(fb)
    pct  = n_fb / n_total * 100 if n_total else 0

    if pct > 30:
        st.error(
            f"⚠️ **{n_fb} of {n_total} records ({pct:.0f}%) used fallback EFs.** "
            "Inventory accuracy is low. Prioritise data improvements below."
        )
    else:
        st.warning(
            f"ℹ️ {n_fb} of {n_total} records ({pct:.0f}%) used fallback EFs."
        )

    # ── Donut charts: data quality breakdown ─────────────────────────────
    # Use all_recs for full distribution (fb only contains fallback records)
    _quality_source = all_recs if all_recs else fb

    QUALITY_TIERS = {
        "national":     {"label": "National / verified",    "color": "#16a34a"},
        "regional":     {"label": "Regional / government",  "color": "#65a30d"},
        "continental":  {"label": "Continental average",    "color": "#d97706"},
        "global":       {"label": "Global default",         "color": "#dc2626"},
        "supplier":     {"label": "Supplier-specific",      "color": "#0ea5e9"},
        "estimated":    {"label": "Estimated / assumed",    "color": "#9333ea"},
    }
    tier_t  = {t: 0.0 for t in QUALITY_TIERS}
    tier_n  = {t: 0 for t in QUALITY_TIERS}
    total_t = sum(float(r.get("t_CO2e") or 0) for r in _quality_source)
    for r in _quality_source:
        # Records without fallback are national/verified
        if not r.get("fallback_triggered") and not r.get("fallback_level"):
            lvl = "national"
        else:
            lvl = (r.get("fallback_level") or r.get("data_quality") or "global").lower()
        tier = next((t for t in QUALITY_TIERS if t in lvl), "global")
        tier_t[tier] += float(r.get("t_CO2e") or 0)
        tier_n[tier] += 1

    # Summary metrics row
    n_national  = tier_n["national"] + tier_n["supplier"]
    n_fallback  = tier_n["global"] + tier_n["continental"]
    n_partial   = tier_n["regional"] + tier_n["estimated"]
    qa1, qa2, qa3, qa4 = st.columns(4)
    qa1.metric("Total records",        str(n_total))
    qa2.metric("🟢 National/verified", f"{n_national} ({n_national/n_total*100:.0f}%)" if n_total else "0")
    qa3.metric("🟡 Regional/partial",  f"{n_partial} ({n_partial/n_total*100:.0f}%)" if n_total else "0")
    qa4.metric("🔴 Global fallback",   f"{n_fallback} ({n_fallback/n_total*100:.0f}%)" if n_total else "0")

    # Two donuts: by record count and by tCO2e
    col_d1, col_d2 = st.columns(2)

    labels = [QUALITY_TIERS[t]["label"] for t in QUALITY_TIERS if tier_n[t] > 0]
    colors = [QUALITY_TIERS[t]["color"] for t in QUALITY_TIERS if tier_n[t] > 0]

    with col_d1:
        counts_vals = [tier_n[t] for t in QUALITY_TIERS if tier_n[t] > 0]
        fig_n = px.pie(
            names=labels, values=counts_vals,
            hole=0.55,
            title="By record count",
            color_discrete_sequence=colors,
        )
        fig_n.update_traces(
            texttemplate="%{percent:.0%}",
            textposition="outside",
            hovertemplate="<b>%{label}</b><br>%{value} records (%{percent})<extra></extra>",
        )
        fig_n.update_layout(
            margin=dict(t=50, b=20),
            legend=dict(orientation="h", y=-0.15, font=dict(size=10)),
            annotations=[dict(
                text=f"<b>{n_total}</b><br>records",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=12),
            )],
        )
        st.plotly_chart(fig_n, use_container_width=True, key="p04dashb_plt_6")

    with col_d2:
        tco2e_vals = [tier_t[t] for t in QUALITY_TIERS if tier_n[t] > 0]
        fig_t = px.pie(
            names=labels, values=tco2e_vals,
            hole=0.55,
            title="By tCO₂e attributed",
            color_discrete_sequence=colors,
        )
        fig_t.update_traces(
            texttemplate="%{percent:.0%}",
            textposition="outside",
            hovertemplate="<b>%{label}</b><br>%{value:.1f} tCO₂e (%{percent})<extra></extra>",
        )
        pct_national_t = (tier_t["national"]+tier_t["supplier"])/total_t*100 if total_t else 0
        fig_t.update_layout(
            margin=dict(t=50, b=20),
            legend=dict(orientation="h", y=-0.15, font=dict(size=10)),
            annotations=[dict(
                text=f"<b>{pct_national_t:.0f}%</b><br>verified",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=12),
            )],
        )
        st.plotly_chart(fig_t, use_container_width=True, key="p04dashb_plt_7")

    st.caption(
        "**Target:** >80% of tCO₂e should use national or supplier-specific EFs. "
        "Global defaults carry ±50–300% uncertainty and will be flagged in assurance reviews."
    )

    # Priority improvement list
    st.markdown("#### Priority improvements (highest tCO₂e with global/continental EF)")
    _df_fb_temp = pd.DataFrame(_quality_source) if _quality_source else pd.DataFrame()
    priority = _df_fb_temp[_df_fb_temp["fallback_level"].isin(["global", "continental"])] if not _df_fb_temp.empty else pd.DataFrame()
    priority = priority.sort_values("t_CO2e", ascending=False).head(15)
    if not priority.empty:
        st.dataframe(
            priority[["scope","process","country","fuel_or_item","t_CO2e","fallback_level","ef_source"]]
              .rename(columns={"t_CO2e":"tCO₂e","fuel_or_item":"Fuel/item",
                               "fallback_level":"EF level","ef_source":"Source"})
              .reset_index(drop=True),
            use_container_width=True,
        )
        st.caption(
            "**Action:** For each row above, seek a national or supplier-specific "
            "emission factor and upload via the EF Manager page."
        )

    # Data quality grade
    grade_map = [(0,"A — Excellent: all national/supplier EFs"),
                 (10,"B — Good: mostly national EFs"),
                 (30,"C — Acceptable: mixed quality"),
                 (60,"D — Poor: majority fallback"),
                 (101,"E — Very poor: mostly global defaults")]
    grade = next(g for threshold, g in grade_map if pct < threshold)
    st.metric("Overall data quality grade", grade)

    # Uncertainty context by EF source
    st.markdown("---")
    st.markdown("#### Uncertainty ranges by EF source (IPCC 2006)")
    st.caption(
        "Higher uncertainty = higher priority to replace with better data. "
        "Ranges are ±% on the emission factor itself (not activity data)."
    )
    _UNCERTAINTY_GUIDE = {
        "CEA": ("India national grid", "±10–15%", "🟢"),
        "IPCC 2006": ("IPCC Tier 1 combustion", "±1–5%", "🟢"),
        "DEFRA 2024": ("DEFRA UK", "±5–20%", "🟡"),
        "EFDB": ("IPCC EFDB national", "±5–30%", "🟡"),
        "USEEIO": ("US spend-based EEIO", "±50–300%", "🔴"),
        "MoPNG": ("India petroleum ministry", "±15–25%", "🟡"),
        "global": ("Global default/fallback", "±30–200%", "🔴"),
    }
    try:
        # Count records by EF source category
        ef_source_counts: dict = {}
        for rec in fb:
            src = (rec.get("ef_source") or "global").split(" ")[0]
            ef_source_counts[src] = ef_source_counts.get(src, 0) + 1

        for src, count in sorted(ef_source_counts.items(), key=lambda x: -x[1]):
            matched = next(
                ((label, unc, color) for key, (label, unc, color) in _UNCERTAINTY_GUIDE.items()
                 if key.lower() in src.lower()),
                ("Unknown source", "±unknown", "⚪")
            )
            label, unc, color = matched
            st.write(f"{color} **{src}** ({label}) — {count} records — uncertainty {unc}")
    except Exception:
        pass


def _sbti_tab(total, s1, s2, s3, inv_year, has_plotly):
    st.markdown("#### SBTi-Aligned Reduction Pathway")
    st.caption(
        "Science Based Targets initiative (SBTi) requires **two targets**: "
        "near-term (by 2030) AND long-term net-zero (by 2050). "
        "Both must be validated by SBTi before public commitment."
    )

    # ── Near-term vs long-term tabs ───────────────────────────────────────
    nt_tab, lt_tab = st.tabs(["📅 Near-term (2025–2030)", "🏁 Long-term (Net-zero by 2050)"])

    s12 = s1 + s2

    with nt_tab:
        st.caption(
            "**SBTi 1.5°C near-term standard:** at least 42% absolute reduction in "
            "Scope 1+2 by 2030 from a base year ≤ 2025. Scope 3 must also be included "
            "if ≥ 40% of total emissions."
        )
        c1, c2, c3 = st.columns(3)
        base_year  = c1.number_input("Base year", value=inv_year, min_value=2015,
                                      max_value=2025, step=1, key="sbti_base_nt")
        target_pct = c2.slider("S1+S2 reduction (%)", 20, 90, 42, key="sbti_pct_nt",
                                help="42% = minimum for 1.5°C near-term")
        s3_pct     = c3.slider("S3 reduction (% if material)", 0, 90, 25, key="sbti_s3_nt",
                                help="Required if Scope 3 ≥ 40% of total")

        n_nt = 2030 - base_year
        if n_nt > 0 and s12 > 0:
            annual_nt = 1 - (1 - target_pct / 100) ** (1 / n_nt)
            nt_pathway, e = [], s12
            for yr in range(n_nt + 1):
                nt_pathway.append({"Year": base_year + yr, "Required S1+S2 (tCO₂e)": round(e, 1)})
                e *= (1 - annual_nt)

            # Gap analysis
            current_row = next((r for r in nt_pathway if r["Year"] == inv_year), None)
            if current_row:
                required = current_row["Required S1+S2 (tCO₂e)"]
                gap = s12 - required
                if gap > 0:
                    st.error(
                        f"❌ Current S1+S2: **{s12:,.1f}** | "
                        f"Required {inv_year}: **{required:,.1f}** | "
                        f"Gap: **{gap:,.1f} tCO₂e**"
                    )
                else:
                    st.success(f"✅ On track — S1+S2 {s12:,.1f} ≤ required {required:,.1f}")

            # S3 check
            s3_material = s3 >= total * 0.4 if total > 0 else False
            if s3_material:
                s3_target = s3 * (1 - s3_pct / 100)
                s3_gap = s3 - s3_target
                st.warning(
                    f"⚠️ Scope 3 is {s3/total*100:.0f}% of total (≥40%) — "
                    f"SBTi requires Scope 3 target. "
                    f"Target {s3_pct}% reduction = {s3_target:,.1f} tCO₂e. "
                    f"Gap: {s3_gap:,.1f} tCO₂e."
                )

            if has_plotly:
                import plotly.express as px, pandas as pd
                df = pd.DataFrame(nt_pathway)
                fig = px.area(df, x="Year", y="Required S1+S2 (tCO₂e)",
                              title=f"Near-term: {target_pct}% S1+S2 reduction by 2030",
                              color_discrete_sequence=["#EF553B"])
                fig.add_scatter(x=[inv_year], y=[s12], mode="markers",
                                marker=dict(size=14, color="red", symbol="star"),
                                name=f"Actual {inv_year}")
                fig.update_layout(margin=dict(t=50, b=10))
                st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_8")
            import pandas as pd
            st.dataframe(pd.DataFrame(nt_pathway).set_index("Year"),
                         use_container_width=True)

    with lt_tab:
        st.caption(
            "**SBTi long-term net-zero standard:** 90–95% absolute reduction in "
            "Scope 1+2+3 by 2050 from the same base year, with residual emissions "
            "neutralised by permanent removals (not offsets)."
        )
        c1, c2 = st.columns(2)
        base_year_lt = c1.number_input("Base year", value=inv_year, min_value=2015,
                                        max_value=2025, step=1, key="sbti_base_lt")
        lt_pct       = c2.slider("Total reduction by 2050 (%)", 80, 95, 90,
                                  key="sbti_pct_lt",
                                  help="90% = SBTi minimum for net-zero validation")

        n_lt = 2050 - base_year_lt
        if n_lt > 0 and total > 0:
            annual_lt = 1 - (1 - lt_pct / 100) ** (1 / n_lt)

            # Show milestones: 2030, 2040, 2050
            milestones = {}
            e_lt = total
            for yr in range(n_lt + 1):
                yr_abs = base_year_lt + yr
                if yr_abs in (2030, 2035, 2040, 2045, 2050):
                    milestones[yr_abs] = round(e_lt, 1)
                e_lt *= (1 - annual_lt)

            st.markdown("**Long-term milestones (S1+S2+S3):**")
            cols = st.columns(len(milestones))
            for i, (yr, val) in enumerate(milestones.items()):
                pct_done = round((total - val) / total * 100, 1) if total else 0
                cols[i].metric(str(yr), f"{val:,.0f} tCO₂e",
                               delta=f"−{pct_done}% vs base")

            if has_plotly:
                import plotly.express as px, pandas as pd
                lt_pathway = []
                e_lt = total
                for yr in range(n_lt + 1):
                    lt_pathway.append({
                        "Year": base_year_lt + yr,
                        "S1+S2+S3 required (tCO₂e)": round(e_lt, 1),
                    })
                    e_lt *= (1 - annual_lt)
                df_lt = pd.DataFrame(lt_pathway)
                fig_lt = px.area(df_lt, x="Year", y="S1+S2+S3 required (tCO₂e)",
                                 title=f"Long-term: {lt_pct}% total reduction by 2050",
                                 color_discrete_sequence=["#636EFA"])
                residual = total * (1 - lt_pct / 100)
                fig_lt.add_hline(y=residual, line_dash="dot", line_color="green",
                                 annotation_text=f"Residual 2050: {residual:,.0f} tCO₂e "
                                                 f"(neutralise with removals)")
                fig_lt.update_layout(margin=dict(t=50, b=10))
                st.plotly_chart(fig_lt, use_container_width=True, key="p04dashb_plt_9")

        st.markdown("---")
        st.markdown("**SBTi validation checklist:**")
        checks = [
            ("Near-term target covers Scope 1+2", True),
            ("Near-term target year ≤ 2030",      True),
            ("Scope 3 target if ≥ 40% of total",  s3 >= total * 0.4 if total else False),
            ("Long-term target ≥ 90% by 2050",    True),
            ("Committed to neutralise residuals",  False),
            ("Targets submitted to SBTi",         False),
        ]
        for label, done in checks:
            icon = "✅" if done else "○"
            st.caption(f"{icon} {label}")

    # ── Initiatives linkage (shared across both tabs) ─────────────────────
    try:
        import json
        profile = st.session_state.org_profile
        raw = profile.get("_initiatives", "[]")
        initiatives = json.loads(raw) if isinstance(raw, str) else raw
        if initiatives:
            st.markdown("---")
            st.markdown("**Reduction initiatives vs target**")
            achieved = sum(i.get("achieved_tco2e", 0) for i in initiatives
                           if i.get("status") == "Completed")
            pipeline = sum(i.get("target_tco2e",  0) for i in initiatives
                           if i.get("status") in ("Planned", "In progress"))
            ic = st.columns(3)
            ic[0].metric("Achieved (tCO₂e/yr)", f"{achieved:,.1f}")
            ic[1].metric("In pipeline",          f"{pipeline:,.1f}")
            ic[2].metric("Total", f"{achieved+pipeline:,.1f}")
            nt_gap_approx = max(s12 * 0.42 - achieved - pipeline, 0)
            if nt_gap_approx > 0:
                st.warning(f"⚠️ Still need {nt_gap_approx:,.1f} tCO₂e/yr of initiatives "
                           f"to meet near-term SBTi gap.")
            else:
                st.success("✅ Initiative pipeline sufficient to close near-term SBTi gap.")
    except Exception:
        pass

    # ── SBTi SDA (Sector Decarbonization Approach) ────────────────────────
    st.markdown("---")
    with st.expander("📐 SBTi SDA — Sector Decarbonization Approach", expanded=False):
        st.caption(
            "SBTi requires **intensity-based** targets (not absolute) for companies in "
            "electricity, cement, steel, aluminium, and pulp & paper. "
            "Select your sector to see the IEA-scenario-based intensity pathway."
        )
        # SDA pathways — intensity targets in tCO2e per unit of output
        SDA_SECTORS = {
            "Electricity generation": {
                "unit":         "tCO₂e/MWh",
                "2020_intensity": 0.45,
                "2030_target":    0.18,   # IEA NZE 2023
                "2050_target":    0.0,
                "note": "Grid decarbonisation pathway (IEA NZE 2023). "
                        "Includes Scope 1+2 from generation.",
            },
            "Cement": {
                "unit":         "tCO₂e/t cement",
                "2020_intensity": 0.60,
                "2030_target":    0.42,   # SBTi sector guidance
                "2050_target":    0.10,
                "note": "SBTi Cement Sector Guidance. Includes process + energy CO₂.",
            },
            "Steel": {
                "unit":         "tCO₂e/t steel",
                "2020_intensity": 1.85,
                "2030_target":    1.30,
                "2050_target":    0.35,
                "note": "SBTi Steel Sector Guidance (blast furnace + EAF routes).",
            },
            "Aluminium": {
                "unit":         "tCO₂e/t aluminium",
                "2020_intensity": 16.5,
                "2030_target":    11.5,
                "2050_target":    2.5,
                "note": "Aluminium Stewardship Initiative alignment pathway.",
            },
            "Pulp & Paper": {
                "unit":         "tCO₂e/t product",
                "2020_intensity": 0.80,
                "2030_target":    0.55,
                "2050_target":    0.12,
                "note": "SBTi Forest, Land & Agriculture (FLAG) adjacent guidance.",
            },
        }

        sda_sector = st.selectbox("Your sector (SDA)", ["— not applicable —"] + list(SDA_SECTORS),
                                   key="sda_sector")
        if sda_sector != "— not applicable —":
            sda = SDA_SECTORS[sda_sector]
            sa1, sa2, sa3 = st.columns(3)
            current_intensity = sa1.number_input(
                f"Your current intensity ({sda['unit']})",
                min_value=0.0, format="%.4f", key="sda_current_intensity"
            )
            sa2.metric("2030 target", f"{sda['2030_target']} {sda['unit']}")
            sa3.metric("2050 target", f"{sda['2050_target']} {sda['unit']}")
            st.caption(f"📋 {sda['note']}")
            if current_intensity > 0:
                gap_2030 = current_intensity - sda["2030_target"]
                gap_2050 = current_intensity - sda["2050_target"]
                pct_2030 = gap_2030 / current_intensity * 100
                if gap_2030 > 0:
                    st.error(
                        f"2030 gap: need to reduce intensity by "
                        f"**{gap_2030:.4f} {sda['unit']}** ({pct_2030:.1f}%). "
                        f"Current: {current_intensity:.4f} → Target: {sda['2030_target']}"
                    )
                else:
                    st.success(f"✅ On track for 2030 SDA target ({sda_sector}).")
        else:
            st.info(
                "SDA applies to electricity, cement, steel, aluminium, and pulp & paper. "
                "Other sectors use the absolute reduction pathway (near-term tab above)."
            )

    # ── SBTi Finance tool integration ────────────────────────────────────
    st.markdown("---")
    st.markdown("#### 🔗 SBTi Finance Tool integration")
    st.caption(
        "The SBTi Finance Tool calculates science-based targets for financial institutions "
        "with financed emissions (Scope 3 Cat 15). "
        "[Data requirements →](https://sciencebasedtargets.github.io/SBTi-finance-tool/DataRequirements.html)"
    )

    with st.expander("📋 SBTi Finance Tool data requirements", expanded=False):
        st.markdown("""
**Required inputs for SBTi Finance Tool:**

| Data point | Source in this app | Status |
|---|---|---|
| Organisation name | ⚙️ Setup → Org name | Auto-filled |
| Base year | ⚙️ Setup → Reporting year | Auto-filled |
| S1 absolute emissions (tCO₂e) | 🔥 Scope 1 inventory | — |
| S2 absolute emissions (tCO₂e) | ⚡ Scope 2 inventory | — |
| S3 Cat 15 financed emissions (tCO₂e) | 🔗 Scope 3 → Cat 15 | — |
| Asset class breakdown | 🔗 Scope 3 Cat 15 form | — |
| Revenue or AUM (₹) | ⚙️ Setup → Intensity | — |
| PCAF data quality score (1-5) | 🔗 Scope 3 → Cat 15 → PCAF score | — |
| Temperature alignment | Calculated by Finance Tool | External |

**Steps to use SBTi Finance Tool:**
1. Enter your Cat 15 financed emissions in 🔗 Scope 3 → Cat 15 tab
2. Export your inventory via 📤 Export → Downloads
3. Upload the summary to the SBTi Finance Tool
4. The tool calculates temperature alignment and required reduction trajectory
""")
        st.link_button(
            "Open SBTi Finance Tool",
            "https://sciencebasedtargets.github.io/SBTi-finance-tool/",
        )

    # SBTi near-term target summary export
    if s12 > 0 or total > 0:
        with st.expander("⬇️ Export SBTi target summary", expanded=False):
            import json as _json
            sbti_export = {
                "organisation": st.session_state.get("org_profile", {}).get("org_name", ""),
                "reporting_year": inv_year,
                "scope1_tco2e": round(s1, 2),
                "scope2_tco2e": round(s2, 2),
                "scope3_tco2e": round(s3, 2),
                "total_tco2e": round(total, 2),
                "s1_s2_tco2e": round(s12, 2),
                "sbti_near_term_target": {
                    "standard": "1.5C_absolute_contraction",
                    "min_reduction_pct": 42,
                    "target_year": 2030,
                    "scope": "S1+S2",
                    "s3_required": s3 >= total * 0.4,
                },
                "sbti_net_zero_target": {
                    "standard": "net_zero_v1",
                    "min_reduction_pct": 90,
                    "target_year": 2050,
                    "scope": "S1+S2+S3",
                },
            }
            st.download_button(
                "⬇️ SBTi summary JSON",
                data=_json.dumps(sbti_export, indent=2),
                file_name="sbti_target_summary.json",
                mime="application/json",
                key="dl_sbti_json",
            )
            st.caption(
                "Use this JSON as input to the SBTi Finance Tool or "
                "share with your sustainability advisor."
            )

def _year_comparison_tab(inventory, org_id: str, current_year: int, has_plotly: bool):
    st.markdown("#### Year-over-year comparison")
    st.caption(
        "Compare emissions across multiple reporting years. "
        "Select the years you have data for."
    )

    # Discover which years have data for this org
    try:
        all_years_raw = inventory._db.execute(
            "SELECT DISTINCT inventory_year FROM emission_results "
            "WHERE org_id = ? ORDER BY inventory_year",
            (org_id,),
        ).fetchall()
        available_years = [r[0] for r in all_years_raw]
    except Exception:
        available_years = [current_year]

    if len(available_years) < 2:
        st.info(
            f"Only **{current_year}** has data so far. "
            "Add data for additional reporting years to enable comparison. "
            "Change the reporting year in ⚙️ Setup, enter data, then return here."
        )
        # Still show current year as a single bar
        if available_years:
            s = inventory.get_summary(org_id=org_id, inventory_year=current_year)
            st.metric(f"{current_year} total", f"{s.get('total_t_co2e',0):,.2f} tCO₂e")
        return

    selected_years = st.multiselect(
        "Years to compare",
        options=available_years,
        default=available_years,
        key="yoy_years",
    )
    if not selected_years:
        st.info("Select at least one year above.")
        return

    # Build comparison table
    rows = []
    for yr in sorted(selected_years):
        s = inventory.get_summary(org_id=org_id, inventory_year=yr)
        rows.append({
            "Year":      yr,
            "Scope 1":   s.get("scope1_t_co2e", 0),
            "Scope 2":   s.get("scope2_t_co2e", 0),
            "Scope 3":   s.get("scope3_t_co2e", 0),
            "Total":     s.get("total_t_co2e",  0),
            "Records":   s.get("n_records",      0),
            "Fallbacks": s.get("n_fallback_records", 0),
        })

    if not rows:
        return

    base_year = rows[0]
    base_total = base_year["Total"] or 1  # avoid div/0

    # Headline metrics — delta vs first selected year
    mc = st.columns(len(rows))
    for i, r in enumerate(rows):
        delta = f"{(r['Total'] - base_total) / base_total * 100:+.1f}%" if i > 0 else "base"
        mc[i].metric(
            str(r["Year"]),
            f"{r['Total']:,.2f} tCO₂e",
            delta=delta if i > 0 else None,
            delta_color="inverse",   # down = green
        )

    st.markdown("---")

    # Stacked bar chart
    if has_plotly:
        import pandas as pd
        import plotly.graph_objects as go

        df = pd.DataFrame(rows)
        fig = go.Figure()
        for scope, colour in [("Scope 1","#EF553B"), ("Scope 2","#636EFA"), ("Scope 3","#00CC96")]:
            fig.add_bar(
                x=df["Year"].astype(str),
                y=df[scope],
                name=scope,
                marker_color=colour,
            )
        fig.update_layout(
            barmode="stack",
            title="tCO₂e by scope and year",
            xaxis_title="Reporting year",
            yaxis_title="tCO₂e",
            legend=dict(orientation="h", yanchor="bottom", y=1.02),
            height=380,
            margin=dict(l=40, r=20, t=60, b=40),
        )
        st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_10")

        # Year-over-year % change line
        if len(rows) > 1:
            df["YoY %"] = df["Total"].pct_change() * 100
            fig2 = go.Figure(go.Scatter(
                x=df["Year"].astype(str), y=df["YoY %"].round(1),
                mode="lines+markers+text",
                text=df["YoY %"].apply(lambda v: f"{v:+.1f}%" if pd.notna(v) else ""),
                textposition="top center",
                marker_color=["green" if (v or 0) < 0 else "red" for v in df["YoY %"]],
                line_color="#888",
            ))
            fig2.update_layout(
                title="Year-over-year change (%)",
                yaxis_title="% change",
                height=260,
                margin=dict(l=40, r=20, t=60, b=40),
            )
            fig2.add_hline(y=0, line_dash="dash", line_color="gray")
            st.plotly_chart(fig2, use_container_width=True, key="p04dashb_plt_11")

    # Data table
    st.markdown("#### Summary table")
    try:
        import pandas as pd
        df_show = pd.DataFrame(rows).set_index("Year")
        # Add YoY% and vs-base columns
        if len(rows) > 1:
            totals = [r["Total"] for r in rows]
            yoy_pcts  = [None] + [
                f"{(totals[i]-totals[i-1])/totals[i-1]*100:+.1f}%" if totals[i-1] else "—"
                for i in range(1, len(totals))
            ]
            vs_base = [
                "base" if i == 0 else
                (f"{(totals[i]-totals[0])/totals[0]*100:+.1f}%" if totals[0] else "—")
                for i in range(len(totals))
            ]
            df_show.insert(4, "YoY %",    yoy_pcts)
            df_show.insert(5, "vs base",  vs_base)
        for col in ["Scope 1", "Scope 2", "Scope 3", "Total"]:
            df_show[col] = df_show[col].map("{:,.2f}".format)
        st.dataframe(df_show, use_container_width=True)
    except ImportError:
        for r in rows:
            st.write(f"{r['Year']}: S1={r['Scope 1']:.2f} S2={r['Scope 2']:.2f} "
                     f"S3={r['Scope 3']:.2f} Total={r['Total']:.2f} tCO₂e")

    # CAGR + trend analysis
    if len(rows) >= 2:
        st.markdown("---")
        st.markdown("#### Trend analysis")
        n_years = rows[-1]["Year"] - rows[0]["Year"]
        if n_years > 0 and base_total > 0:
            end_total = rows[-1]["Total"] or 0
            cagr = (end_total / base_total) ** (1 / n_years) - 1
            col1, col2, col3 = st.columns(3)
            col1.metric(
                f"CAGR ({rows[0]['Year']}–{rows[-1]['Year']})",
                f"{cagr*100:+.1f}% / yr",
                help="Compound annual growth rate of total emissions",
            )
            # Project to 2030 at current CAGR
            years_to_2030 = 2030 - rows[-1]["Year"]
            if years_to_2030 > 0:
                proj_2030 = end_total * (1 + cagr) ** years_to_2030
                col2.metric(
                    "Projected 2030 (at current CAGR)",
                    f"{proj_2030:,.1f} tCO₂e",
                    delta=f"{(proj_2030 - end_total):+,.1f} vs today",
                    delta_color="inverse",
                )
            # SBTi-required 2030
            sbti_2030 = base_total * (1 - 0.42)
            col3.metric(
                f"SBTi 1.5°C target 2030",
                f"{sbti_2030:,.1f} tCO₂e",
                delta=f"−42% from {rows[0]['Year']}",
                delta_color="off",
            )




def _benchmark_tab(total, s1, s2, s3, profile, has_plotly):
    st.markdown("#### Sector benchmarks")
    st.caption(
        "Compare your emissions intensity against published industry averages. "
        "Select your sector and enter your revenue/output to see where you stand."
    )

    # Data completeness warning
    _n_recs = profile.get("_n_records_hint", 0)
    if total == 0:
        st.warning(
            "⚠️ **No inventory data for this year.** "
            "Add Scope 1, 2, and 3 records in the data entry pages. "
            "Benchmark comparisons below are illustrative only."
        )
    elif s3 == 0:
        st.info(
            "📋 **Scope 3 not yet recorded.** "
            "The S1+2+3 intensity shown below underestimates your full footprint. "
            "Complete Scope 3 entry for a valid benchmark comparison."
        )
    elif s1 == 0 and s2 == 0:
        st.info(
            "📋 **Scope 1 and 2 not recorded.** "
            "Only Scope 3 data found. Intensity metrics may be incomplete."
        )

    # Sector benchmark data (tCO2e per crore INR revenue, India averages)
    # Sources: SBTi sector guidance, GHG Protocol, CDP India aggregate data
    BENCHMARKS = {
        "Manufacturing — General": {
            "s12_intensity_cr": 0.85,
            "s123_intensity_cr": 2.10,
            "source": "CDP India 2023 aggregate",
        },
        "Information Technology": {
            "s12_intensity_cr": 0.08,
            "s123_intensity_cr": 0.45,
            "source": "CDP India 2023 aggregate",
        },
        "Cement & Construction": {
            "s12_intensity_cr": 4.20,
            "s123_intensity_cr": 6.80,
            "source": "IPCC WGIII / SBTi cement",
        },
        "Steel": {
            "s12_intensity_cr": 5.10,
            "s123_intensity_cr": 7.20,
            "source": "SBTi steel sector",
        },
        "Chemicals": {
            "s12_intensity_cr": 3.20,
            "s123_intensity_cr": 5.50,
            "source": "IEA Chemicals",
        },
        "Financial Services": {
            "s12_intensity_cr": 0.04,
            "s123_intensity_cr": 0.90,
            "source": "CDP Financial Services 2023",
        },
        "Healthcare & Pharma": {
            "s12_intensity_cr": 0.35,
            "s123_intensity_cr": 1.20,
            "source": "CDP India aggregate",
        },
        "Retail & Consumer": {
            "s12_intensity_cr": 0.12,
            "s123_intensity_cr": 1.80,
            "source": "GHG Protocol retail guidance",
        },
        "Transport & Logistics": {
            "s12_intensity_cr": 2.80,
            "s123_intensity_cr": 3.50,
            "source": "DEFRA / IEA transport",
        },
        "Food & Beverage": {
            "s12_intensity_cr": 0.90,
            "s123_intensity_cr": 4.20,
            "source": "SBTi FLAG + CDP Food",
        },
        "Agriculture": {
            "s12_intensity_cr": 1.20,
            "s123_intensity_cr": 5.80,
            "source": "IPCC AFOLU / FAO",
        },
        "Energy & Utilities": {
            "s12_intensity_cr": 8.50,
            "s123_intensity_cr": 9.20,
            "source": "CEA / IEA India power",
        },
    }

    col_s, col_r = st.columns(2)
    sector = col_s.selectbox(
        "Your sector",
        list(BENCHMARKS.keys()),
        key="bench_sector",
    )
    revenue_cr = col_r.number_input(
        "Your annual revenue (INR crore)",
        min_value=0.0,
        value=float(profile.get("revenue_inr_cr", 0.0)),
        format="%.2f",
        key="bench_rev",
        help="Pre-populated from Setup. Used to calculate your intensity.",
    )

    bench = BENCHMARKS[sector]

    if revenue_cr > 0:
        your_s12_intensity  = (s1 + s2) / revenue_cr
        your_s123_intensity = total / revenue_cr
        peer_s12  = bench["s12_intensity_cr"]
        peer_s123 = bench["s123_intensity_cr"]

        # Metrics
        mc = st.columns(4)
        mc[0].metric(
            "Your S1+S2 intensity",
            f"{your_s12_intensity:.3f}",
            help="tCO₂e per crore INR revenue",
        )
        mc[1].metric(
            f"Sector avg S1+S2",
            f"{peer_s12:.3f}",
            delta=f"{(your_s12_intensity - peer_s12) / peer_s12 * 100:+.0f}% vs peer",
            delta_color="inverse",
        )
        mc[2].metric(
            "Your S1+S2+S3 intensity",
            f"{your_s123_intensity:.3f}",
        )
        mc[3].metric(
            f"Sector avg S1+S2+S3",
            f"{peer_s123:.3f}",
            delta=f"{(your_s123_intensity - peer_s123) / peer_s123 * 100:+.0f}% vs peer",
            delta_color="inverse",
        )

        st.caption(f"Source: {bench['source']} · Units: tCO₂e per crore INR revenue")

        # Gauge chart
        if has_plotly:
            import plotly.graph_objects as go

            ratio_s12 = your_s12_intensity / peer_s12
            fig = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=your_s12_intensity,
                delta={"reference": peer_s12, "relative": True,
                       "valueformat": ".1%",
                       "decreasing": {"color": "green"},
                       "increasing": {"color": "red"}},
                title={"text": f"S1+S2 intensity vs {sector} sector avg"},
                gauge={
                    "axis": {"range": [0, peer_s12 * 2.5]},
                    "bar": {"color": "#636EFA"},
                    "steps": [
                        {"range": [0, peer_s12 * 0.5],  "color": "#00CC96"},
                        {"range": [peer_s12 * 0.5, peer_s12 * 1.0], "color": "#FFA15A"},
                        {"range": [peer_s12 * 1.0, peer_s12 * 2.5], "color": "#EF553B"},
                    ],
                    "threshold": {
                        "line": {"color": "black", "width": 3},
                        "thickness": 0.75,
                        "value": peer_s12,
                    },
                },
                number={"suffix": " tCO₂e/Cr", "valueformat": ".3f"},
            ))
            fig.update_layout(height=300, margin=dict(l=30, r=30, t=60, b=20))
            st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_12")
            st.caption(
                "🟢 Best-in-class (<50% of sector avg)  "
                "🟡 On-par (50–100%)  "
                "🔴 Above average (>100%)"
            )

        # Reduction needed to match sector
        if your_s12_intensity > peer_s12:
            reduction_pct = (1 - peer_s12 / your_s12_intensity) * 100
            reduction_abs = (your_s12_intensity - peer_s12) * revenue_cr
            st.info(
                f"To match the sector average, you need to reduce S1+S2 emissions "
                f"by **{reduction_pct:.1f}%** "
                f"({reduction_abs:,.1f} tCO₂e at your current revenue)."
            )
        else:
            st.success(
                f"✅ Your S1+S2 intensity ({your_s12_intensity:.3f}) is "
                f"**{(1 - your_s12_intensity/peer_s12)*100:.0f}% below** "
                f"the sector average ({peer_s12:.3f}). Best-in-class!"
            )
    else:
        st.info(
            "Enter your annual revenue in the field above (or in ⚙️ Setup) "
            "to see your intensity vs sector benchmarks."
        )

        # Show benchmark table without personalisation
        st.markdown("**Industry intensity benchmarks (tCO₂e per crore INR)**")
        try:
            import pandas as pd
            df_b = pd.DataFrame([
                {"Sector": k, "S1+S2": v["s12_intensity_cr"],
                 "S1+2+3": v["s123_intensity_cr"], "Source": v["source"]}
                for k, v in BENCHMARKS.items()
            ]).sort_values("S1+S2")
            st.dataframe(df_b, use_container_width=True, hide_index=True)
        except ImportError:
            for k, v in BENCHMARKS.items():
                st.write(f"**{k}**: S1+S2={v['s12_intensity_cr']:.2f}  S1+2+3={v['s123_intensity_cr']:.2f}")

    # Legend
    st.markdown("---")
    st.markdown("#### How to read this benchmark")
    lc1, lc2, lc3 = st.columns(3)
    lc1.success("🟢 **Below benchmark** - Your intensity is lower than the sector average. Credible if data quality is A/B.")
    lc2.warning("🟡 **Near benchmark** - Within 20% of sector average. Set targets to move below.")
    lc3.error("🔴 **Above benchmark** - Higher than sector average. Prioritise S1+S2 reductions.")

    with st.expander("Benchmark methodology & data sources", expanded=False):
        st.markdown("**Intensity metric:** tCO2e per crore INR revenue. S1+S2 = direct + electricity. S1+2+3 = full value chain.")
        st.markdown("**Sources:** CDP India 2023, SBTi Sector Pathways, IEA India, DEFRA 2024, IPCC WGIII/FAO, GHG Protocol.")
        st.caption("Directional Indian-context averages only. Not for external reporting.")


def _site_breakdown_tab(inventory, org_id, inv_year, has_plotly):
    """Tab 8 — breakdown of tCO₂e by site, department, and supplier."""
    st.markdown("#### Emissions by Site, Department & Supplier")
    try:
        rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
    except Exception as e:
        st.error(f"Could not load records: {e}")
        return

    tagged = [r for r in rows if r.get("site") or r.get("department")]
    if not tagged:
        st.info(
            "No records tagged with site or department yet. "
            "Use the 🏷️ tag expander on Scope 1, 2, or 3 pages before saving, "
            "or edit tags in the Data manager."
        )
        return

    try:
        import pandas as pd
        df = pd.DataFrame(tagged)
        df["t_CO2e"] = df["t_CO2e"].astype(float)

        # Site breakdown
        site_df = df.groupby("site", dropna=False)["t_CO2e"].sum().reset_index()
        site_df.columns = ["Site", "tCO₂e"]
        site_df = site_df.sort_values("tCO₂e", ascending=False)

        dept_df = df.groupby("department", dropna=False)["t_CO2e"].sum().reset_index()
        dept_df.columns = ["Department", "tCO₂e"]
        dept_df = dept_df.sort_values("tCO₂e", ascending=False)

        c1, c2 = st.columns(2)
        with c1:
            st.markdown("**By site**")
            if has_plotly:
                import plotly.express as px
                fig = px.bar(site_df, x="tCO₂e", y="Site", orientation="h",
                             color_discrete_sequence=["#1f77b4"])
                fig.update_layout(margin=dict(t=20, b=20), yaxis_title="")
                st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_13")
            else:
                st.dataframe(site_df, use_container_width=True, hide_index=True)

        with c2:
            st.markdown("**By department**")
            if has_plotly:
                fig2 = px.bar(dept_df, x="tCO₂e", y="Department", orientation="h",
                              color_discrete_sequence=["#2ca02c"])
                fig2.update_layout(margin=dict(t=20, b=20), yaxis_title="")
                st.plotly_chart(fig2, use_container_width=True, key="p04dashb_plt_14")
            else:
                st.dataframe(dept_df, use_container_width=True, hide_index=True)

        # Supplier breakdown
        if "supplier_name" in df.columns:
            sup_tagged = df[df["supplier_name"].notna() & (df["supplier_name"] != "")]
            if not sup_tagged.empty:
                st.markdown("**By supplier (linked emissions)**")
                sup_df = sup_tagged.groupby("supplier_name")["t_CO2e"].sum().reset_index()
                sup_df.columns = ["Supplier", "tCO₂e"]
                sup_df = sup_df.sort_values("tCO₂e", ascending=False)
                if has_plotly:
                    import plotly.express as px
                    fig_s = px.bar(sup_df, x="tCO₂e", y="Supplier", orientation="h",
                                   color_discrete_sequence=["#7c3aed"],
                                   title="Attributed emissions by supplier")
                    fig_s.update_layout(margin=dict(t=40,b=10), yaxis_title="")
                    st.plotly_chart(fig_s, use_container_width=True, key="p04dashb_plt_15")
                else:
                    st.dataframe(sup_df, use_container_width=True, hide_index=True)
                total_linked = sup_df["tCO₂e"].sum()
                st.caption(f"✅ {len(sup_df)} suppliers linked · {total_linked:,.1f} tCO₂e attributed")
            else:
                st.info(
                    "No records linked to suppliers yet. "
                    "Select a supplier when saving Scope 1/2/3 data to see breakdown here."
                )

        # Detailed table
        st.markdown("**Record-level detail**")
        show_cols = ["site", "department", "cost_centre", "scope", "process",
                     "fuel_or_item", "t_CO2e"]
        show_cols = [c for c in show_cols if c in df.columns]
        st.dataframe(
            df[show_cols].rename(columns={
                "site": "Site", "department": "Dept",
                "cost_centre": "Cost centre", "scope": "Scope",
                "process": "Process", "fuel_or_item": "Fuel/item",
                "t_CO2e": "tCO₂e"
            }).sort_values("tCO₂e", ascending=False),
            use_container_width=True, hide_index=True,
        )
    except ImportError:
        st.info("Install pandas for site breakdown table.")


def _supplier_ghg_tab(inventory, org_id: str, inv_year: int, has_plotly: bool) -> None:
    """Tab 9 — GHG emissions broken down by linked supplier."""
    st.markdown("#### 🏢 Emissions by Supplier")
    st.caption(
        "Shows tCO₂e attributed to each supplier via the **supplier_name** field. "
        "Tag records in Scope 1/2/3 data entry pages — select a supplier before saving."
    )

    try:
        all_rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
    except Exception as e:
        st.error(f"Could not load records: {e}")
        return

    # Split into linked (has supplier_name) and unlinked
    linked   = [r for r in all_rows if r.get("supplier_name")]
    unlinked = [r for r in all_rows if not r.get("supplier_name")]
    total_t  = sum(float(r.get("t_CO2e") or 0) for r in all_rows)
    linked_t = sum(float(r.get("t_CO2e") or 0) for r in linked)

    # Coverage metrics
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total tCO₂e", f"{total_t:,.1f}")
    m2.metric("Supplier-linked", f"{linked_t:,.1f}",
              delta=f"{linked_t/total_t*100:.0f}% of total" if total_t else None)
    m3.metric("Linked records", len(linked))
    m4.metric("Unlinked records", len(unlinked))

    if not linked:
        st.info(
            "No records are linked to suppliers yet. "
            "When saving data in Scope 1, 2, or 3, select a supplier from the "
            "🏷️ tag expander. Records will appear here automatically."
        )
        return

    try:
        import pandas as pd
        df_linked = pd.DataFrame(linked)
        df_linked["t_CO2e"] = df_linked["t_CO2e"].astype(float)

        # Per-supplier summary
        sup_df = (
            df_linked.groupby("supplier_name")
            .agg(
                tCO2e=("t_CO2e", "sum"),
                n_records=("record_id", "count"),
                scopes=("scope", lambda x: " + ".join(sorted(set(x)))),
            )
            .reset_index()
            .sort_values("tCO2e", ascending=False)
        )
        sup_df.columns = ["Supplier", "tCO₂e", "Records", "Scopes"]
        sup_df["tCO₂e"] = sup_df["tCO₂e"].round(2)

        # Enrich with supplier ESG scores if available
        from pathlib import Path as _Path
        import json as _json
        sup_file = _Path(__file__).parents[1] / "data" / "suppliers.json"
        sup_meta = {}
        if sup_file.exists():
            try:
                for s in _json.loads(sup_file.read_text(encoding="utf-8")):
                    composite = round(0.4*s["e_score"] + 0.35*s["s_score"] + 0.25*s["g_score"], 1)
                    sup_meta[s["name"]] = {
                        "ESG composite": composite,
                        "E": s["e_score"], "S": s["s_score"], "G": s["g_score"],
                        "Spend (₹ Cr)": s.get("spend_cr", 0),
                        "Risk": s.get("risk", "—"),
                    }
            except Exception:
                pass

        if sup_meta:
            sup_df["ESG score"] = sup_df["Supplier"].map(
                lambda x: sup_meta.get(x, {}).get("ESG composite", "—"))
            sup_df["Risk"] = sup_df["Supplier"].map(
                lambda x: sup_meta.get(x, {}).get("Risk", "—"))
            sup_df["Spend (₹ Cr)"] = sup_df["Supplier"].map(
                lambda x: sup_meta.get(x, {}).get("Spend (₹ Cr)", 0))
            # Emission intensity: tCO2e per ₹ Cr spend
            sup_df["tCO₂e/₹ Cr"] = (
                sup_df.apply(
                    lambda r: round(r["tCO₂e"] / r["Spend (₹ Cr)"], 2)
                    if r["Spend (₹ Cr)"] > 0 else "—",
                    axis=1,
                )
            )

        st.dataframe(sup_df, use_container_width=True, hide_index=True)

        # Charts
        if has_plotly:
            import plotly.express as px
            c1, c2 = st.columns(2)
            with c1:
                fig = px.bar(
                    sup_df, x="tCO₂e", y="Supplier", orientation="h",
                    color="Risk" if "Risk" in sup_df.columns else "tCO₂e",
                    color_discrete_map={"High":"#dc2626","Medium":"#d97706","Low":"#16a34a","—":"#6b7280"},
                    title="Linked tCO₂e by supplier (risk-coloured)",
                )
                fig.update_layout(margin=dict(t=40,b=10), yaxis_title="", showlegend=True)
                st.plotly_chart(fig, use_container_width=True, key="p04dashb_plt_16")
            with c2:
                if "ESG score" in sup_df.columns and sup_df["ESG score"].dtype != object:
                    fig2 = px.scatter(
                        sup_df, x="ESG score", y="tCO₂e",
                        size="Spend (₹ Cr)" if "Spend (₹ Cr)" in sup_df.columns else None,
                        text="Supplier", color="Risk" if "Risk" in sup_df.columns else None,
                        color_discrete_map={"High":"#dc2626","Medium":"#d97706","Low":"#16a34a","—":"#6b7280"},
                        title="ESG score vs attributed emissions",
                    )
                    fig2.update_traces(textposition="top center")
                    fig2.update_layout(margin=dict(t=40,b=10), showlegend=False)
                    st.plotly_chart(fig2, use_container_width=True, key="p04dashb_plt_17")
                else:
                    fig2 = px.pie(sup_df, values="tCO₂e", names="Supplier",
                                  title="Emissions share by supplier")
                    st.plotly_chart(fig2, use_container_width=True, key="p04dashb_plt_18")

        # Scope breakdown per supplier
        st.markdown("**Scope breakdown per supplier**")
        scope_df = (
            df_linked.groupby(["supplier_name","scope"])["t_CO2e"]
            .sum().reset_index()
        )
        scope_df.columns = ["Supplier","Scope","tCO₂e"]
        scope_df["tCO₂e"] = scope_df["tCO₂e"].round(2)
        st.dataframe(scope_df, use_container_width=True, hide_index=True)

    except ImportError:
        st.info("Install pandas for supplier breakdown table.")

    # Unlinked summary
    if unlinked:
        st.markdown(f"---")
        st.caption(
            f"**{len(unlinked)} records ({sum(float(r.get('t_CO2e',0)) for r in unlinked):,.1f} tCO₂e) "
            f"not yet linked to any supplier.** "
            "Tag these in Scope 1/2/3 pages to improve supply chain attribution."
        )


# ---------------------------------------------------------------------------
# Tab 10 — Sankey / waterfall emissions flow chart
# ---------------------------------------------------------------------------

def _sankey_flow_tab(total, s1, s2, s3, inventory, org_id, inv_year, has_plotly):
    st.markdown("#### 🔀 Emissions flow")
    st.caption(
        "Sankey diagram: how gross emissions flow from scope sources through "
        "reduction initiatives to a net residual figure."
    )

    if not has_plotly:
        st.info("Install plotly to view the Sankey chart: `pip install plotly`")
        return

    import plotly.graph_objects as go

    # ── Pull initiatives reductions from session state ────────────────────
    _initiatives = st.session_state.get("initiatives", [])
    _total_reduction = sum(
        float(i.get("reduction_tco2e", 0)) for i in _initiatives
        if str(i.get("status", "")).lower() in ("active", "completed", "implemented")
    )
    _net = max(total - _total_reduction, 0)

    # ── Try to get S3 category breakdown ─────────────────────────────────
    _s3_cats = {}
    try:
        rows = inventory._db.execute(
            "SELECT process_name, SUM(t_CO2e) FROM emission_results "
            "WHERE org_id=? AND inventory_year=? AND scope='Scope 3' "
            "GROUP BY process_name ORDER BY SUM(t_CO2e) DESC LIMIT 8",
            (org_id, inv_year)
        ).fetchall()
        for name, val in rows:
            if val and float(val) > 0:
                _s3_cats[name] = float(val)
    except Exception:
        pass

    # ── Build Sankey nodes & links ────────────────────────────────────────
    # Node indices:
    # 0=Scope1, 1=Scope2, 2=Scope3, 3=Total, 4=Reductions, 5=Net residual
    # 6+ = S3 category detail nodes (up to 8)

    node_labels = ["Scope 1", "Scope 2", "Scope 3", "Gross total",
                   "Reductions", "Net residual"]
    node_colors = ["#f97316", "#3b82f6", "#8b5cf6", "#64748b",
                   "#22c55e", "#0ea5e9"]

    s3_offset = len(node_labels)
    s3_cat_list = list(_s3_cats.items())
    for cat_name, _ in s3_cat_list:
        short = cat_name[:35] + "…" if len(cat_name) > 35 else cat_name
        node_labels.append(short)
        node_colors.append("#a78bfa")

    sources, targets, values, link_colors = [], [], [], []

    # S1 → Total
    if s1 > 0:
        sources.append(0); targets.append(3); values.append(s1)
        link_colors.append("rgba(249,115,22,0.4)")
    # S2 → Total
    if s2 > 0:
        sources.append(1); targets.append(3); values.append(s2)
        link_colors.append("rgba(59,130,246,0.4)")
    # S3 → Total
    if s3 > 0:
        sources.append(2); targets.append(3); values.append(s3)
        link_colors.append("rgba(139,92,246,0.4)")

    # S3 category breakdown (Scope3 node → each cat node)
    for i, (cat_name, cat_val) in enumerate(s3_cat_list):
        sources.append(2); targets.append(s3_offset + i); values.append(cat_val)
        link_colors.append("rgba(167,139,250,0.3)")
        # Each cat → Total as well (contribution)
        sources.append(s3_offset + i); targets.append(3); values.append(cat_val)
        link_colors.append("rgba(167,139,250,0.15)")

    # Total → Reductions
    if _total_reduction > 0:
        sources.append(3); targets.append(4); values.append(_total_reduction)
        link_colors.append("rgba(34,197,94,0.5)")
    # Total → Net residual
    sources.append(3); targets.append(5); values.append(max(_net, total * 0.01))
    link_colors.append("rgba(14,165,233,0.5)")

    fig = go.Figure(go.Sankey(
        arrangement="snap",
        node=dict(
            pad=20,
            thickness=24,
            line=dict(color="#334155", width=0.5),
            label=node_labels,
            color=node_colors,
            hovertemplate="%{label}<br>%{value:,.1f} tCO₂e<extra></extra>",
        ),
        link=dict(
            source=sources,
            target=targets,
            value=values,
            color=link_colors,
            hovertemplate="%{source.label} → %{target.label}<br>%{value:,.1f} tCO₂e<extra></extra>",
        ),
    ))

    fig.update_layout(
        height=520,
        margin=dict(t=40, b=20, l=10, r=10),
        title=dict(
            text=f"Emissions flow — {inv_year}  ·  Gross: {total:,.1f} tCO₂e  ·  "
                 f"Reductions: {_total_reduction:,.1f}  ·  Net: {_net:,.1f}",
            font=dict(size=13),
            x=0.5,
        ),
    )
    st.plotly_chart(fig, use_container_width=True, key="p04dashb_sankey_1")

    # ── Summary table beneath chart ───────────────────────────────────────
    st.markdown("**Flow summary**")
    _cols = st.columns(3)
    _cols[0].metric("Gross emissions", f"{total:,.1f} tCO₂e")
    _cols[1].metric("Reduction initiatives",
                    f"−{_total_reduction:,.1f} tCO₂e",
                    delta=f"{_total_reduction/total*100:.1f}% abated" if total else None,
                    delta_color="normal")
    _cols[2].metric("Net residual", f"{_net:,.1f} tCO₂e")

    if not _initiatives:
        st.info(
            "💡 No active reduction initiatives found. "
            "Add initiatives in **🌱 Reduction Initiatives** to see them flow here."
        )

    if not _s3_cats:
        st.caption(
            "ℹ️ Scope 3 category breakdown not shown — save Scope 3 activity records "
            "first to see category-level flows."
        )
