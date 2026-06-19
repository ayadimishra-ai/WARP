"""
Page 18 — Risk Dashboard.

Framework: COSO ERM 2026 (Committee of Sponsoring Organisations — Enterprise Risk Management).
The COSO ERM 2026 update emphasises: ESG integration, climate-related risk, supply chain
resilience, and technology/cyber risks as first-class risk categories.

Risk categories mapped to COSO ERM 2026 components:
  - Strategy & Objective-Setting: SBTi alignment, transition risk
  - Performance: Supply chain (Cat 1/4 emissions, ESG scores, spend concentration)
  - Review & Revision: Data quality, coverage gaps, assurance readiness
  - Information & Communication: Regulatory exposure, disclosure risk
  - Governance & Culture: PESTEL, geographical, geopolitical risk

Standalone risk analysis covering:
  - Supply chain risk (supplier-level: E/S/G scores + PESTEL + spend concentration)
  - Operational risk (Scope 1 process-level: regulatory, physical, transition)
  - Internal operations risk (data quality, coverage gaps)
  - Geographical risk (supplier country-level PESTEL)
  - Spend-based risk (which spend categories carry highest emission + supply risk)
  - Verification of risk calculations (show formula + inputs)
"""
from __future__ import annotations
import json
from pathlib import Path

import streamlit as st

SUPPLIER_FILE  = Path(__file__).parents[1] / "data" / "suppliers.json"
LOGISTICS_FILE = Path(__file__).parents[1] / "data" / "logistics.json"


# ── Risk factor weights ───────────────────────────────────────────────────────
SUPPLY_CHAIN_WEIGHTS = {
    "e_score":         {"weight": 0.30, "label": "Environmental score",  "invert": True},
    "s_score":         {"weight": 0.25, "label": "Social score",          "invert": True},
    "g_score":         {"weight": 0.20, "label": "Governance score",      "invert": True},
    "spend_conc":      {"weight": 0.15, "label": "Spend concentration",   "invert": False},
    "geo_risk":        {"weight": 0.10, "label": "Geographical risk",     "invert": False},
}

COUNTRY_RISK = {
    "IN": 35, "CN": 55, "US": 25, "DE": 20, "GB": 20,
    "JP": 22, "VN": 48, "BD": 58, "TR": 52, "KR": 28,
    "TW": 32, "TH": 45, "MX": 50, "BR": 48, "ZA": 55,
}

PESTEL_COUNTRY = {
    "IN": {
        "Political":     (35, "Regulatory policy risk (PAT, BRSR supply chain rules). GST compliance."),
        "Economic":      (45, "Raw material cost inflation, INR volatility, SME credit access."),
        "Social":        (38, "Labour law compliance, gender diversity gaps in manufacturing."),
        "Technological": (42, "Industry 4.0 readiness varies by tier. Digital adoption lagging."),
        "Environmental": (48, "Water stress (Marathwada), air quality non-compliance risk."),
        "Legal":         (44, "Environmental Protection Act, Factories Act, BRSR supply chain."),
    },
    "CN": {
        "Political":     (65, "Geopolitical tensions, US/EU tariff escalation, CCP policy shifts."),
        "Economic":      (42, "Currency controls, real estate drag on domestic demand."),
        "Social":        (68, "Labour rights concerns, Xinjiang supply chain controversy."),
        "Technological": (30, "Advanced manufacturing, IP risk for buyers."),
        "Environmental": (52, "CBAM exposure, coal dependency, water scarcity in north."),
        "Legal":         (60, "Data localisation, compliance opacity for foreign buyers."),
    },
    "US": {
        "Political":     (28, "Policy continuity risk. IRA incentives may shift."),
        "Economic":      (25, "Stable. Strong IP protection. High labour costs."),
        "Social":        (22, "Strong labour rights. DEI reporting increasing."),
        "Technological": (15, "Leading R&D. High automation. Cyber risk elevated."),
        "Environmental": (25, "SEC climate disclosure rules. State-level regulations vary."),
        "Legal":         (20, "Mature legal system. FCPA compliance required."),
    },
}


def _load_suppliers() -> list:
    if SUPPLIER_FILE.exists():
        try: return json.loads(SUPPLIER_FILE.read_text(encoding="utf-8"))
        except Exception: pass
    return []


def _load_lanes() -> list:
    if LOGISTICS_FILE.exists():
        try: return json.loads(LOGISTICS_FILE.read_text(encoding="utf-8"))
        except Exception: pass
    return []


def _compute_supply_risk(s: dict, total_spend: float) -> dict:
    """
    Compute composite supply risk score for one supplier.
    Returns dict with: composite (0-100), component scores, formula.
    """
    spend_share = (s.get("spend_cr", 0) / total_spend * 100) if total_spend else 0
    geo_risk    = COUNTRY_RISK.get(s.get("country", "IN"), 40)
    components  = {}

    for key, cfg in SUPPLY_CHAIN_WEIGHTS.items():
        if key == "spend_conc":
            raw = min(spend_share, 50) * 2    # 0-100: capped at 50% spend
        elif key == "geo_risk":
            raw = geo_risk
        else:
            raw = 100 - s.get(key, 50)        # invert: low score = high risk
        components[key] = {
            "raw":    round(raw, 1),
            "weight": cfg["weight"],
            "label":  cfg["label"],
            "contrib": round(raw * cfg["weight"], 2),
        }

    composite = sum(v["contrib"] for v in components.values())
    tier = "High" if composite >= 60 else ("Medium" if composite >= 35 else "Low")

    return {
        "composite":   round(composite, 1),
        "tier":        tier,
        "components":  components,
        "spend_share": round(spend_share, 1),
        "geo_risk":    geo_risk,
    }


def render() -> None:
    st.title("⚠️ Risk Dashboard")
    st.caption(
        "Unified risk view across supply chain, operations, geography, and data quality. "
        "Risk scores are calculated — click any supplier row to see the full formula."
    )

    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _card_bg  = "#f0f9ff" if _is_light else "#1a2235"
    _card_txt = "#1f2937" if _is_light else "#e2e8f0"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"
    _border   = "#e2e8f0" if _is_light else "#334155"
    _gauge_needle = "#1f2937" if _is_light else "#e2e8f0"

    profile     = st.session_state.get("org_profile", {})
    inventory   = st.session_state.get("inventory")
    suppliers   = _load_suppliers()
    lanes       = _load_lanes()
    org_id      = profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year    = profile.get("reporting_year", 2024)

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

    # COSO ERM 2026 framework header
    with st.expander("📐 COSO ERM 2026 — Framework & methodology", expanded=False):
        st.markdown("**Standard:** COSO ERM 2026 — Integrating ESG & Climate into Enterprise Risk.")
        st.markdown(
            "| COSO Component | Tab | Key metrics |\n"
            "|---|---|---|\n"
            "| Strategy & Objective-Setting | 📐 Risk calculator | SBTi gap, transition risk |\n"
            "| Performance | 🔗 Supply chain | Supplier ESG x spend, Cat 1/4 concentration |\n"
            "| Review & Revision | 📊 Spend-based | Data quality, coverage, fallback rate |\n"
            "| Information & Communication | 🌍 Geographical | Regulatory exposure, TCFD readiness |\n"
            "| Governance & Culture | 🏭 Operational | PESTEL, geopolitical, operational |\n"
        )
        st.caption(
            "Risk score = Inherent risk x (1 - control effectiveness). "
            "Inherent = ESG gap 40% + spend concentration 30% + PESTEL 20% + geo 10%. "
            "Thresholds: Low <30 | Medium 30-60 | High 60-80 | Critical >80."
        )

    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "🔗 Supply chain",
        "🏭 Operational",
        "🌍 Geographical",
        "📊 Spend-based",
        "📐 Risk calculator",
        "📖 Methodology",
    ])

    # ── Tab 1: Supply chain risk ──────────────────────────────────────────
    with tab1:
        st.markdown("#### Supply chain risk — per supplier")
        if not suppliers:
            st.info("No suppliers registered. Add suppliers in ⚙️ Setup → Suppliers tab.")
            return

        total_spend = sum(s.get("spend_cr", 0) for s in suppliers)
        risk_data   = []
        for s in suppliers:
            r = _compute_supply_risk(s, total_spend)
            risk_data.append({
                "name": s["name"], "risk_result": r,
                "e_score": s["e_score"], "s_score": s["s_score"],
                "g_score": s["g_score"], "spend_cr": s.get("spend_cr", 0),
                "country": s.get("country", "IN"),
                "material": s.get("material", "—"),
            })
        risk_data = sorted(risk_data, key=lambda x: -x["risk_result"]["composite"])

        # Summary metrics
        n_high   = sum(1 for r in risk_data if r["risk_result"]["tier"] == "High")
        n_med    = sum(1 for r in risk_data if r["risk_result"]["tier"] == "Medium")
        n_low    = sum(1 for r in risk_data if r["risk_result"]["tier"] == "Low")
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Total suppliers", len(risk_data))
        m2.metric("🔴 High risk",   n_high)
        m3.metric("🟡 Medium risk", n_med)
        m4.metric("🟢 Low risk",    n_low)

        # Risk matrix chart
        try:
            import pandas as pd
            import plotly.express as px

            df = pd.DataFrame([{
                "Supplier":         r["name"],
                "Risk score":       r["risk_result"]["composite"],
                "Spend (₹ Cr)":    r["spend_cr"],
                "ESG composite":   round(0.4*r["e_score"]+0.35*r["s_score"]+0.25*r["g_score"], 1),
                "Risk tier":       r["risk_result"]["tier"],
                "Country":         r["country"],
                "Material":        r["material"],
            } for r in risk_data])

            fig = px.scatter(
                df, x="ESG composite", y="Risk score",
                size="Spend (₹ Cr)", color="Risk tier",
                text="Supplier",
                color_discrete_map={"High":"#dc2626","Medium":"#d97706","Low":"#16a34a"},
                title="Risk vs ESG composite (bubble = spend size)",
                labels={"Risk score": "Supply risk score (0-100)",
                        "ESG composite": "ESG composite score (0-100)"},
            )
            fig.update_traces(textposition="top center")
            fig.add_hline(y=60, line_dash="dot", line_color="#dc2626",
                          annotation_text="High risk threshold")
            fig.add_hline(y=35, line_dash="dot", line_color="#d97706",
                          annotation_text="Medium risk threshold")
            fig.update_layout(margin=dict(t=50, b=20))
            st.plotly_chart(fig, use_container_width=True, key="p18risk_plt_1")

            st.dataframe(
                df.assign(**{"Risk tier": df["Risk tier"]}).sort_values("Risk score", ascending=False),
                use_container_width=True, hide_index=True,
            )
        except ImportError:
            pass

        # PESTEL per supplier (expandable)
        st.markdown("---")
        st.markdown("**PESTEL risk factors by supplier country:**")
        for r in risk_data[:5]:  # top 5 by risk
            country = r["country"]
            pestel  = PESTEL_COUNTRY.get(country)
            if not pestel:
                continue
            tier_icon = {"High":"🔴","Medium":"🟡","Low":"🟢"}.get(r["risk_result"]["tier"],"⚪")
            with st.expander(
                f"{tier_icon} {r['name']} ({country}) — Risk score: {r['risk_result']['composite']:.0f}/100",
                expanded=False,
            ):
                p_cols = st.columns(3)
                for ci, (dim, (score, desc)) in enumerate(pestel.items()):
                    icon = {"Political":"🏛️","Economic":"💰","Social":"👥",
                            "Technological":"🔧","Environmental":"🌱","Legal":"⚖️"}.get(dim,"📌")
                    color = "#dc2626" if score > 55 else ("#d97706" if score > 35 else "#16a34a")
                    p_cols[ci % 3].metric(icon + " " + dim, f"{score}/100")
                    p_cols[ci % 3].caption(desc)

    # ── Tab 2: Operational risk ───────────────────────────────────────────
    with tab2:
        st.markdown("#### Operational & internal risk")

        if inventory:
            try:
                all_rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
                total_t  = sum(float(r.get("t_CO2e") or 0) for r in all_rows)

                op_risks = []
                # S1 regulatory: coal/diesel heavy
                coal_t = sum(float(r.get("t_CO2e") or 0) for r in all_rows
                             if "coal" in (r.get("fuel_or_item") or "").lower())
                if coal_t > 0 and total_t > 0:
                    op_risks.append({
                        "Risk": "Carbon transition — coal dependency",
                        "Category": "Transition",
                        "tCO₂e affected": round(coal_t, 1),
                        "% of total": f"{coal_t/total_t*100:.1f}%",
                        "Severity": "High",
                        "Action": "Phase out coal — switch to gas/biomass/electric",
                    })

                # DQ risk
                poor_dq = [r for r in all_rows
                            if (r.get("data_quality") or "") in
                            ("estimated","fallback","global_default")]
                poor_t  = sum(float(r.get("t_CO2e") or 0) for r in poor_dq)
                if poor_t > 0 and total_t > 0:
                    pct = poor_t / total_t * 100
                    op_risks.append({
                        "Risk": f"Data quality — {len(poor_dq)} records on global/estimated EFs",
                        "Category": "Data quality",
                        "tCO₂e affected": round(poor_t, 1),
                        "% of total": f"{pct:.1f}%",
                        "Severity": "High" if pct > 30 else "Medium",
                        "Action": "Replace global EFs with national/supplier-specific data",
                    })

                # Scope 3 coverage
                s3_cats = set(r.get("category","") for r in all_rows
                              if r.get("scope") == "Scope 3")
                if len(s3_cats) < 5:
                    op_risks.append({
                        "Risk": f"Scope 3 incomplete — only {len(s3_cats)} of 15 categories entered",
                        "Category": "Disclosure",
                        "tCO₂e affected": "—",
                        "% of total": "—",
                        "Severity": "Medium",
                        "Action": "Screen all 15 S3 categories in 🔗 Scope 3 page",
                    })

                if op_risks:
                    try:
                        import pandas as pd
                        df_op = pd.DataFrame(op_risks)
                        st.dataframe(df_op, use_container_width=True, hide_index=True)
                    except ImportError:
                        for r in op_risks:
                            st.write(r)
                else:
                    st.success("✅ No significant operational risks flagged from inventory data.")

            except Exception as e:
                st.error(f"Could not load inventory: {e}")
        else:
            st.info("Complete Setup and enter inventory data to see operational risk analysis.")

    # ── Tab 3: Geographical risk ──────────────────────────────────────────
    with tab3:
        st.markdown("#### Geographical supply risk — by country")
        if not suppliers:
            st.info("No suppliers registered.")
        else:
            country_spend: dict = {}
            for s in suppliers:
                c = s.get("country", "IN")
                country_spend[c] = country_spend.get(c, 0) + s.get("spend_cr", 0)

            try:
                import pandas as pd
                import plotly.express as px
                rows = []
                for country, spend in sorted(country_spend.items(), key=lambda x: -x[1]):
                    risk = COUNTRY_RISK.get(country, 40)
                    rows.append({
                        "Country": country,
                        "Spend (₹ Cr)": round(spend, 1),
                        "Spend share %": round(spend/total_spend*100, 1) if total_spend else 0,
                        "Country risk score": risk,
                        "Risk tier": "High" if risk >= 55 else ("Medium" if risk >= 35 else "Low"),
                    })
                df_geo = pd.DataFrame(rows)
                fig_geo = px.bar(
                    df_geo, x="Country", y="Spend (₹ Cr)",
                    color="Country risk score", color_continuous_scale="RdYlGn_r",
                    text="Spend share %",
                    title="Procurement spend by country (colour = risk score)",
                )
                fig_geo.update_traces(texttemplate="%{text:.0f}%", textposition="outside")
                fig_geo.update_layout(margin=dict(t=50, b=20))
                st.plotly_chart(fig_geo, use_container_width=True, key="p18risk_plt_2")
                st.dataframe(df_geo, use_container_width=True, hide_index=True)
            except ImportError:
                pass

    # ── Tab 4: Spend-based risk ───────────────────────────────────────────
    with tab4:
        st.markdown("#### Spend-based emission & supply risk")
        st.caption(
            "Combines procurement spend with EEIO emission intensities (tCO₂e/₹ Cr) "
            "to show which categories carry the highest combined spend + emission risk."
        )
        CAT_EI = {
            "Raw materials":  12.4, "Chemicals": 18.7,
            "Agriculture": 6.2, "Electronics": 8.1,
            "Plastics": 14.3, "Textiles": 9.5,
            "Machinery": 10.2, "Packaging": 11.8, "Other": 9.0,
        }
        if suppliers:
            try:
                import pandas as pd
                rows = []
                for s in suppliers:
                    cat  = s.get("category", "Other")
                    ei   = CAT_EI.get(cat, 9.0)
                    spend= s.get("spend_cr", 0)
                    est_t= round(spend * ei, 1)
                    actual_t = s.get("ghg_all_tco2e") or s.get("ghg_cat1_tco2e", 0)
                    rows.append({
                        "Supplier":          s["name"],
                        "Category":          cat,
                        "Spend (₹ Cr)":     round(spend, 2),
                        "EI (tCO₂e/₹ Cr)":  ei,
                        "Est. tCO₂e (EEIO)": est_t,
                        "Actual tCO₂e":      round(actual_t, 1) if actual_t else "—",
                        "Data source":       "Reported" if actual_t else "Spend-estimated",
                        "Risk tier":         s.get("risk", "—"),
                    })
                df_sp = pd.DataFrame(rows).sort_values("Est. tCO₂e (EEIO)", ascending=False)
                st.dataframe(df_sp, use_container_width=True, hide_index=True)
                st.caption(
                    "EI = EEIO emission intensity (tCO₂e per ₹ Cr spend). "
                    "**Replace estimated values with supplier-reported data** to improve accuracy. "
                    "Use 🏪 Supplier portal to request actual Scope 1+2 data."
                )
                # ── Spend vs emissions bubble chart ──────────────────────
                try:
                    import plotly.express as px
                    _risk_colors = {"High": "#dc2626", "Medium": "#d97706", "Low": "#16a34a"}
                    df_sp["_color"] = df_sp["Risk tier"].map(lambda r: _risk_colors.get(r, "#6b7280"))
                    fig_sp = px.scatter(
                        df_sp,
                        x="Spend (₹ Cr)",
                        y="Est. tCO₂e (EEIO)",
                        size="EI (tCO₂e/₹ Cr)",
                        color="Risk tier",
                        text="Supplier",
                        color_discrete_map=_risk_colors,
                        title="Spend vs Estimated Emissions by Supplier",
                        labels={"Est. tCO₂e (EEIO)": "Est. tCO₂e"},
                        height=400,
                    )
                    fig_sp.update_traces(textposition="top center", textfont_size=10)
                    fig_sp.update_layout(margin=dict(t=50, b=20))
                    st.plotly_chart(fig_sp, use_container_width=True, key="p18risk_plt_tab4")

                    # Category bar chart
                    df_cat = df_sp.groupby("Category")["Est. tCO₂e (EEIO)"].sum().reset_index()
                    df_cat = df_cat.sort_values("Est. tCO₂e (EEIO)", ascending=True)
                    fig_cat = px.bar(
                        df_cat, x="Est. tCO₂e (EEIO)", y="Category",
                        orientation="h",
                        title="Estimated emissions by procurement category",
                        labels={"Est. tCO₂e (EEIO)": "Est. tCO₂e"},
                        color="Est. tCO₂e (EEIO)",
                        color_continuous_scale="Reds",
                        height=320,
                    )
                    fig_cat.update_layout(margin=dict(t=50, b=20), coloraxis_showscale=False)
                    st.plotly_chart(fig_cat, use_container_width=True, key="p18risk_plt_tab4b")
                except ImportError:
                    pass
            except ImportError:
                pass

    # ── Tab 5: Risk calculator (formula transparency) ─────────────────────
    with tab5:
        st.markdown("#### Risk score calculator — verify the calculations")
        st.caption(
            "Full formula transparency. Select a supplier to see exactly how "
            "the risk score is computed from its inputs."
        )

        if not suppliers:
            st.info("No suppliers registered.")
            return

        total_spend = sum(s.get("spend_cr", 0) for s in suppliers)
        sel_name = st.selectbox(
            "Select supplier",
            [s["name"] for s in suppliers],
            key="risk_calc_sel",
        )
        sel_sup = next(s for s in suppliers if s["name"] == sel_name)
        r       = _compute_supply_risk(sel_sup, total_spend)

        st.markdown(f"### {sel_sup['name']} — composite risk: **{r['composite']:.1f}/100** ({r['tier']})")
        st.markdown("**Formula:** Composite = Σ (component_score × weight)")
        st.markdown("---")

        # ── Gauge chart for composite risk ────────────────────────────────
        try:
            import plotly.graph_objects as go
            _gauge_color = (
                "#dc2626" if r["composite"] >= 60
                else "#d97706" if r["composite"] >= 35
                else "#16a34a"
            )
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number+delta",
                value=r["composite"],
                title={"text": "Composite Risk Score", "font": {"size": 14}},
                gauge={
                    "axis": {"range": [0, 100], "tickwidth": 1},
                    "bar": {"color": _gauge_color},
                    "steps": [
                        {"range": [0,  35], "color": "#dcfce7"},
                        {"range": [35, 60], "color": "#fef9c3"},
                        {"range": [60, 100], "color": "#fee2e2"},
                    ],
                    "threshold": {
                        "line": {"color": _gauge_needle, "width": 3},
                        "thickness": 0.75,
                        "value": r["composite"],
                    },
                },
                number={"suffix": " / 100", "font": {"size": 22}},
            ))
            fig_gauge.update_layout(height=280, margin=dict(t=40, b=10, l=30, r=30))

            # ── Radar chart for component breakdown ───────────────────────
            _comp_labels = [v["label"] for v in r["components"].values()]
            _comp_scores = [v["raw"] for v in r["components"].values()]
            # Close the radar loop
            _comp_labels_closed = _comp_labels + [_comp_labels[0]]
            _comp_scores_closed = _comp_scores + [_comp_scores[0]]
            fig_radar = go.Figure(go.Scatterpolar(
                r=_comp_scores_closed,
                theta=_comp_labels_closed,
                fill="toself",
                fillcolor=f"rgba({','.join(str(int(c)) for c in [220,38,38])},0.2)" if r["composite"] >= 60
                           else "rgba(217,119,6,0.2)" if r["composite"] >= 35
                           else "rgba(22,197,94,0.2)",
                line_color=_gauge_color,
                name="Risk components",
            ))
            fig_radar.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, 100])),
                height=300, margin=dict(t=30, b=10),
                title=dict(text="Risk component radar", font=dict(size=13)),
                showlegend=False,
            )

            g_col, r_col = st.columns(2)
            with g_col:
                st.plotly_chart(fig_gauge, use_container_width=True, key="p18risk_plt_tab5_gauge")
            with r_col:
                st.plotly_chart(fig_radar, use_container_width=True, key="p18risk_plt_tab5_radar")
        except ImportError:
            pass

        try:
            import pandas as pd
            df_formula = pd.DataFrame([{
                "Component":    v["label"],
                "Raw score":    v["raw"],
                "Weight":       f"{v['weight']:.0%}",
                "Contribution": v["contrib"],
                "Interpretation": (
                    f"E score {sel_sup['e_score']} → risk {v['raw']:.0f}" if k == "e_score" else
                    f"S score {sel_sup['s_score']} → risk {v['raw']:.0f}" if k == "s_score" else
                    f"G score {sel_sup['g_score']} → risk {v['raw']:.0f}" if k == "g_score" else
                    f"Spend share {r['spend_share']:.1f}% → risk {v['raw']:.0f}" if k == "spend_conc" else
                    f"Country {sel_sup.get('country','IN')} → risk {v['raw']:.0f}"
                ),
            } for k, v in r["components"].items()])
            df_formula["Contribution"] = df_formula["Contribution"].round(2)
            st.dataframe(df_formula, use_container_width=True, hide_index=True)
            st.markdown(
                f"**Total:** {' + '.join(str(v['contrib']) for v in r['components'].values())} "
                f"= **{r['composite']:.1f}**"
            )
        except ImportError:
            for k, v in r["components"].items():
                st.write(f"{v['label']}: {v['raw']:.1f} × {v['weight']:.0%} = {v['contrib']:.2f}")
            st.write(f"**Composite: {r['composite']:.1f}**")

        st.markdown("---")
        st.markdown("**Notes on methodology:**")
        st.markdown("""
- **E/S/G scores** are inverted (100 − score) so lower ESG = higher risk
- **Spend concentration** is capped at 50% of total spend (scores 0-100)
- **Country risk** uses the PESTEL composite index (custom, 0-100)
- **Weights** are fixed: E 30%, S 25%, G 20%, Spend 15%, Country 10%
- Final score 0-100: **≥60 = High**, **35-60 = Medium**, **<35 = Low**
        """)

    with tab6:
        st.markdown('#### Risk methodology — COSO ERM 2026')

        with st.expander('COSO ERM 2026 — Five components', expanded=True):
            st.markdown(
                'COSO ERM 2026 (Committee of Sponsoring Organisations) integrates '
                'ESG, climate transition risk, and supply chain resilience into '
                'enterprise risk management.'
            )
            _ct1, _ct2, _ct3, _ct4, _ct5 = st.tabs([
                'Strategy', 'Performance', 'Review', 'Information', 'Governance'
            ])
            with _ct1:
                st.markdown('**Strategy & Objective-Setting**')
                st.markdown('Sets risk appetite linked to ESG targets and net-zero commitments.')
                st.markdown('- SBTi alignment gap (tCO₂e vs net-zero pathway)')
                st.markdown('- Transition risk: carbon price on Scope 1+2 footprint')
                st.markdown('- Physical risk: asset exposure in high-risk geographies')
                st.caption('See: Risk calculator tab')
            with _ct2:
                st.markdown('**Performance**')
                st.markdown('Identifies risks that affect strategy execution.')
                st.markdown('- Supplier ESG scores vs spend (Cat 1/4 concentration)')
                st.markdown('- Single-supplier dependency (Herfindahl index)')
                st.markdown('- Scope 3 Cat 1 data quality (fallback rate)')
                st.caption('See: Supply chain tab')
            with _ct3:
                st.markdown('**Review & Revision**')
                st.markdown('Reviews risk performance and revises controls.')
                st.markdown('- Inventory coverage % (filled vs total SASB metrics)')
                st.markdown('- Data quality score (DQ 1-5 per GHG Protocol)')
                st.markdown('- Assurance readiness (review workflow completion)')
                st.caption('See: Spend-based tab')
            with _ct4:
                st.markdown('**Information & Communication**')
                st.markdown('Captures and communicates risk information.')
                st.markdown('- Regulatory exposure: BRSR, SEBI, EU CSRD')
                st.markdown('- TCFD readiness: physical vs transition risk')
                st.markdown('- Country-level climate policy risk')
                st.caption('See: Geographical tab')
            with _ct5:
                st.markdown('**Governance & Culture**')
                st.markdown('Oversees and monitors the ERM framework.')
                st.markdown('- PESTEL macro risk (Political/Economic/Social/Tech/Env/Legal)')
                st.markdown('- Geopolitical conflict exposure')
                st.markdown('- Board-level ESG governance gap')
                st.caption('See: Operational tab')

        with st.expander('Risk score formula', expanded=False):
            st.markdown('**Residual risk = Inherent risk x (1 - Control effectiveness)**')
            st.markdown('Inherent risk = ESG gap 40% + Spend concentration 30% + PESTEL 20% + Geo 10%')
            st.markdown('Control effectiveness starts at 0.5; +0.15 ISO 14001, +0.10 CDP, +0.10 SBTi, +0.10 audit')
            st.markdown('**Thresholds:** Low <30 | Medium 30-60 | High 60-80 | Critical >80')

        with st.expander('Data sources', expanded=False):
            _src_data = [
                ('COSO ERM 2026', 'Framework structure'),
                ('GHG Protocol Corporate Standard', 'Scope 1/2/3 boundaries'),
                ('TCFD 2023', 'Climate risk disclosure'),
                ('CDP Supply Chain', 'Supplier ESG benchmarking'),
                ('SEBI BRSR Core', 'India regulatory reporting'),
                ('SBTi Sector Pathways', 'Net-zero trajectory benchmarks'),
                ('IPCC AR6 WG2', 'Physical climate risk scenarios'),
            ]
            try:
                import pandas as pd
                st.dataframe(pd.DataFrame(_src_data, columns=['Source','Used for']),
                             use_container_width=True, hide_index=True)
            except ImportError:
                for s, u in _src_data:
                    st.markdown(f'**{s}** — {u}')

        with st.expander('Limitations', expanded=False):
            st.markdown('Risk scores are **indicative** and not a substitute for third-party assessment.')
            st.markdown('Supplier ESG scores depend on data entered in the Supplier module.')
            st.markdown('Geographic risk uses static 2024 country scores — update annually.')
            st.markdown('Physical risk requires site lat/lon from Setup → Sites & plants.')
