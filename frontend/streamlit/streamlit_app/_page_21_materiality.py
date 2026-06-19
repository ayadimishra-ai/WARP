"""
Page 21 — Double Materiality Assessment.

EFRAG simplified methodology:
  Impact materiality  = severity (1-5) × likelihood (1-5) → material if score ≥ 9
  Financial materiality = magnitude (1-5) × likelihood (1-5) → material if score ≥ 9
  A topic is material if EITHER lens is material.

Threshold of 9 = 3×3 (moderate severity/magnitude, likely) — configurable per org.

Outputs:
  - materiality_assessment table (esg_store.sqlite) → one row per topic/IRO/org/year
  - Gates which ESRS topical standards must be disclosed
  - Feeds reporting_status table (which DPs are in scope)
  - Feeds ESG registry tab (which topics to show)

Topics assessed (ESRS framework, 10 substantive topics + General Disclosures always):
  E1 Climate Change, E2 Pollution, E3 Water & Marine,
  E4 Biodiversity, E5 Resource Use & Circular Economy,
  S1 Own Workforce, S2 Value Chain Workers,
  S3 Affected Communities, S4 Consumers & End-users,
  G1 Business Conduct

General Disclosures (ESRS 1/2) are ALWAYS required regardless of materiality.
"""
from __future__ import annotations
import json
import sqlite3
import streamlit as st
from datetime import datetime, timezone
from pathlib import Path


# ── ESRS topic definitions ────────────────────────────────────────────────
ESRS_TOPICS = [
    # (topic_id, label, module, pillar, default_iro_types, impact_hint, financial_hint)
    ("E1", "Climate Change",
     "E1", "E",
     ["Impact", "Risk", "Opportunity"],
     "GHG emissions affect climate system; physical climate impacts on operations.",
     "Carbon pricing, stranded assets, transition costs, energy price volatility."),
    ("E2", "Pollution",
     "E2", "E",
     ["Impact", "Risk"],
     "Air/water/soil pollutant releases from operations and supply chain.",
     "Regulatory fines, remediation costs, licence-to-operate risk."),
    ("E3", "Water & Marine",
     "E3", "E",
     ["Impact", "Risk"],
     "Water withdrawal in stressed areas; wastewater discharge quality.",
     "Water scarcity costs, regulatory shutdowns, insurance exposure."),
    ("E4", "Biodiversity & Land Use",
     "E4", "E",
     ["Impact", "Risk"],
     "Land conversion, habitat loss from operations or supply chain.",
     "Nature-related financial risk, ecosystem services dependency."),
    ("E5", "Resource Use & Circular Economy",
     "E5", "E",
     ["Impact", "Opportunity"],
     "Virgin material consumption, waste generation, product end-of-life.",
     "Raw material price risk, circular economy revenue opportunities."),
    ("S1", "Own Workforce",
     "S1", "S",
     ["Impact", "Risk"],
     "Working conditions, H&S incidents, pay gaps, discrimination.",
     "Talent risk, litigation, productivity loss, reputational damage."),
    ("S2", "Value Chain Workers",
     "S2", "S",
     ["Impact", "Risk"],
     "Labour conditions in supplier operations (Tier 1+).",
     "CSDDD liability, supply disruption, reputational damage."),
    ("S3", "Affected Communities",
     "S3", "S",
     ["Impact", "Risk"],
     "Local community impacts: pollution, displacement, cultural heritage.",
     "Social licence to operate, protest/litigation, project delays."),
    ("S4", "Consumers & End-users",
     "S4", "S",
     ["Impact", "Risk"],
     "Product safety, data privacy, fair marketing.",
     "Product liability, regulatory recalls, consumer trust erosion."),
    ("G1", "Business Conduct",
     "G1", "G",
     ["Impact", "Risk"],
     "Anti-corruption, fair competition, supply chain due diligence.",
     "Fines/sanctions, debarment from public contracts, reputational collapse."),
]

_PILLAR_COLOR = {"E": "#16a34a", "S": "#2563eb", "G": "#f59e0b"}
_SCORE_COLOR  = lambda s: "#16a34a" if s < 9 else "#dc2626"
_HORIZON_OPTS = ["Short-term (0–3 yr)", "Medium-term (3–10 yr)", "Long-term (10+ yr)"]
_MAT_THRESHOLD = 9   # EFRAG: severity/magnitude × likelihood ≥ 9 → material


# ── DB helpers ────────────────────────────────────────────────────────────
def _get_conn() -> sqlite3.Connection:
    db = Path(__file__).parents[1] / "data" / "esg_store.sqlite"
    conn = sqlite3.connect(str(db), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _load_iros(conn, org_id: str, year: int) -> dict[str, dict]:
    """Load existing IRO records keyed by (topic_id, iro_type)."""
    rows = conn.execute(
        "SELECT * FROM materiality_assessment WHERE org_id=? AND assessment_year=?",
        (org_id, year)
    ).fetchall()
    return {(r["topic"], r["iro_type"]): dict(r) for r in rows}


def _upsert_iro(conn, org_id, year, topic_id, iro_type, desc,
                imp_sev, imp_lik, fin_mag, fin_lik, horizon, assessed_by) -> None:
    """Upsert one IRO row and compute materiality scores."""
    imp_score = imp_sev * imp_lik if (imp_sev and imp_lik) else 0
    fin_score = fin_mag * fin_lik if (fin_mag and fin_lik) else 0
    is_imp_mat = 1 if imp_score >= _MAT_THRESHOLD else 0
    is_fin_mat = 1 if fin_score >= _MAT_THRESHOLD else 0
    is_mat     = 1 if (is_imp_mat or is_fin_mat) else 0
    now        = datetime.now(timezone.utc).isoformat()

    existing = conn.execute(
        "SELECT iro_id FROM materiality_assessment "
        "WHERE org_id=? AND assessment_year=? AND topic=? AND iro_type=?",
        (org_id, year, topic_id, iro_type)
    ).fetchone()

    if existing:
        conn.execute("""
            UPDATE materiality_assessment SET
                iro_description=?, impact_severity=?, impact_likelihood=?,
                impact_score=?, is_impact_material=?,
                fin_magnitude=?, fin_likelihood=?, fin_score=?, is_fin_material=?,
                is_material=?, time_horizon=?, assessed_by=?, updated_at=?
            WHERE iro_id=?
        """, (desc, imp_sev, imp_lik, imp_score, is_imp_mat,
              fin_mag, fin_lik, fin_score, is_fin_mat,
              is_mat, horizon, assessed_by, now, existing[0]))
    else:
        conn.execute("""
            INSERT INTO materiality_assessment
            (org_id, assessment_year, dp_id, topic, iro_type, iro_description,
             impact_severity, impact_likelihood, impact_score, is_impact_material,
             fin_magnitude, fin_likelihood, fin_score, is_fin_material,
             is_material, time_horizon, assessed_by, assessment_method,
             created_at, updated_at)
            VALUES (?,?,NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'EFRAG simplified',?,?)    """, (org_id, year, topic_id, iro_type, desc,
              imp_sev, imp_lik, imp_score, is_imp_mat,
              fin_mag, fin_lik, fin_score, is_fin_mat,
              is_mat, horizon, assessed_by, now, now))
    conn.commit()

    # Propagate to reporting_status for all DPs under this module
    _sync_reporting_status(conn, org_id, year, topic_id, is_mat)


def _sync_reporting_status(conn, org_id, year, topic_id, is_mat) -> None:
    """Update reporting_status for all materiality-gated DPs in this topic's module."""
    # Find the module for this topic
    module_row = conn.execute(
        "SELECT DISTINCT module_section FROM disclosure_points WHERE module_section=?",
        (topic_id,)
    ).fetchone()
    if not module_row:
        return

    dps = conn.execute(
        "SELECT dp_id, always_disclose FROM disclosure_points "
        "WHERE module_section=? AND materiality_req=1",
        (topic_id,)
    ).fetchall()

    status = "In Scope" if is_mat else "Out of Scope (not material)"
    now = datetime.now(timezone.utc).isoformat()

    for dp in dps:
        existing = conn.execute(
            "SELECT status_id FROM reporting_status "
            "WHERE org_id=? AND reporting_year=? AND dp_id=? AND framework='ESRS'",
            (org_id, year, dp["dp_id"])
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE reporting_status SET completion_status=?, updated_at=? WHERE status_id=?",
                (status, now, existing[0])
            )
        else:
            conn.execute("""
                INSERT INTO reporting_status
                (org_id, reporting_year, dp_id, framework, completion_status, updated_at)
                VALUES (?,?,?,'ESRS',?,?)
            """, (org_id, year, dp["dp_id"], status, now))
    conn.commit()


def render() -> None:
    st.title("🎯 Double Materiality Assessment")
    st.caption(
        "EFRAG simplified methodology — assess each ESRS topic across two lenses: "
        "**impact materiality** (effect on people/environment) and "
        "**financial materiality** (effect on enterprise value). "
        "Topics scoring ≥ 9 on either lens are material → those ESRS topical standards apply."
    )

    from streamlit_app._org_helper import fix_page
    profile = st.session_state.get("org_profile", {})
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Complete ⚙️ Setup first.")
        return

    profile  = dict(profile)
    inv_year = profile.get("reporting_year", 2024)
    username = st.session_state.get("username", "user")
    _is_light = st.session_state.get("_sk_theme", "light") == "light"

    conn = _get_conn()
    iros = _load_iros(conn, org_id, inv_year)

    # ── Summary ───────────────────────────────────────────────────────────
    n_assessed = len({k[0] for k in iros})
    n_material = len({k[0] for k, v in iros.items() if v["is_material"]})
    n_topics   = len(ESRS_TOPICS)

    sm1, sm2, sm3 = st.columns(3)
    sm1.metric("Topics to assess", n_topics)
    sm2.metric("Topics assessed",  n_assessed)
    sm3.metric("Material topics",  n_material)

    # Disclosure scope — full expandable list, not truncated metric
    if n_material > 0:
        material_labels = []
        not_material_labels = []
        for tid, label, module, pillar, _, _, _ in ESRS_TOPICS:
            is_mat_topic = any(v["is_material"] for k, v in iros.items() if k[0] == tid)
            if is_mat_topic:
                material_labels.append(f"{module} — {label}")
            elif any(k[0] == tid for k in iros):
                not_material_labels.append(f"{module} — {label}")

        with st.expander(
            f"📋 Disclosure scope: **{n_material}** material topical standards apply "
            f"(click to expand full list)",
            expanded=True,
        ):
            sc1, sc2 = st.columns(2)
            with sc1:
                st.markdown("**🔴 Material — topical standard required:**")
                for m in material_labels:
                    st.markdown(f"  ✅ {m}")
            with sc2:
                st.markdown("**⚪ Assessed, not material:**")
                for m in not_material_labels:
                    st.markdown(f"  ⬜ {m}")
                not_yet = [f"{module} — {label}"
                           for tid, label, module, pillar, _, _, _ in ESRS_TOPICS
                           if not any(k[0] == tid for k in iros)]
                if not_yet:
                    st.markdown("**○ Not yet assessed:**")
                    for m in not_yet:
                        st.markdown(f"  ○ {m}")
    else:
        st.info("No topics assessed yet. Expand each topic below to score it.")

    st.markdown("---")

    # ── Methodology note ─────────────────────────────────────────────────
    with st.expander("📐 Scoring methodology (EFRAG simplified)", expanded=False):
        st.markdown("""
**Impact materiality** — Does this topic have a significant actual or potential impact
on people or the environment?
- **Severity** (1-5): scale/scope of harm × irreversibility
- **Likelihood** (1-5): probability of occurrence
- **Score** = Severity × Likelihood; **material if ≥ 9** (e.g. 3×3 = moderate & likely)

**Financial materiality** — Could this topic create material financial risks or opportunities?
- **Magnitude** (1-5): potential financial effect relative to revenue/assets
- **Likelihood** (1-5): probability that the financial effect materialises
- **Score** = Magnitude × Likelihood; **material if ≥ 9**

**Materiality** = material if EITHER lens scores ≥ 9.
General Disclosures (ESRS 1 & ESRS 2) are **always required** regardless of this assessment.
        """)

    # ── Pillar filter ─────────────────────────────────────────────────────
    pillar_filt = st.radio("Filter", ["All", "E — Environmental", "S — Social", "G — Governance"],
                           horizontal=True, key="mat_pillar")
    show_topics = ESRS_TOPICS if pillar_filt == "All" else [
        t for t in ESRS_TOPICS if f"{t[3]} —" in pillar_filt or pillar_filt.startswith(t[3])
    ]

    # ── Topic cards ───────────────────────────────────────────────────────
    for (tid, label, module, pillar, iro_types, impact_hint, fin_hint) in show_topics:
        p_color = _PILLAR_COLOR[pillar]

        # Check existing assessment status
        topic_iros = {k[1]: v for k, v in iros.items() if k[0] == tid}
        is_mat = any(v["is_material"] for v in topic_iros.values())
        n_iro  = len(topic_iros)

        # Status badge
        if n_iro == 0:
            badge = "○ Not assessed"
            badge_color = "#6b7280"
        elif is_mat:
            badge = "🔴 MATERIAL"
            badge_color = "#dc2626"
        else:
            badge = "⚪ Not material"
            badge_color = "#16a34a"

        # Map badge to plain emoji (st.expander labels don't render HTML)
        _badge_emoji = "🔴 MATERIAL" if is_mat else ("⚪ assessed, not material" if n_iro > 0 else "○ not assessed")
        with st.expander(
            f"{_badge_emoji}  |  **{module} — {label}**  |  {n_iro} IRO(s)",
            expanded=(n_iro == 0),
        ):
            tc1, tc2 = st.columns([3, 1])
            with tc2:
                st.markdown(
                    f"<span style='background:{p_color};color:white;padding:3px 9px;"
                    f"border-radius:4px;font-size:12px;font-weight:700'>Pillar {pillar}</span>",
                    unsafe_allow_html=True,
                )
                # Show DPs unlocked
                dp_count = conn.execute(
                    "SELECT COUNT(*) FROM disclosure_points "
                    "WHERE module_section=? AND materiality_req=1", (tid,)
                ).fetchone()[0]
                st.markdown(f"**{dp_count}** DPs unlock if material")

            with tc1:
                # Show existing IROs
                if topic_iros:
                    for iro_type, iro_data in topic_iros.items():
                        imp_s = iro_data.get("impact_score", 0) or 0
                        fin_s = iro_data.get("fin_score", 0) or 0
                        mat_flag = "🔴 MATERIAL" if iro_data["is_material"] else "⚪ not material"
                        st.markdown(
                            f"**{iro_type}**: Impact={int(iro_data.get('impact_severity',0) or 0)}×"
                            f"{int(iro_data.get('impact_likelihood',0) or 0)}=**{imp_s:.0f}**  "
                            f"Financial={int(iro_data.get('fin_magnitude',0) or 0)}×"
                            f"{int(iro_data.get('fin_likelihood',0) or 0)}=**{fin_s:.0f}**  "
                            f"{mat_flag}  _{iro_data.get('time_horizon','')}_ "
                            f"— _{(iro_data.get('iro_description') or '')[:80]}_"
                        )

                st.markdown("---")
                st.markdown(f"💡 **Impact hint:** {impact_hint}")
                st.markdown(f"💡 **Financial hint:** {fin_hint}")

                # IRO entry form
                st.markdown("**Assess an IRO for this topic:**")
                st.caption(
                    "An IRO (Impact, Risk, or Opportunity) is a specific mechanism through "
                    "which this topic affects your company or stakeholders. "
                    "You can add multiple IROs per topic — e.g. Climate has both a physical "
                    "impact IRO (flooding) and a transition risk IRO (carbon price)."
                )
                # Industry-specific prompts to help assessors
                _industry = profile.get("industry","")
                _prompts = {
                    "E1": {
                        "Impact": f"Does your company's GHG output contribute to climate change? (S1={profile.get('org_name','')} direct; S3=value chain)",
                        "Risk":   "Could carbon pricing (₹500-3000/tCO₂e by 2030) materially increase your operating costs?",
                        "Opportunity": "Can RE procurement or efficiency investments reduce costs and attract green capital?",
                    },
                    "E2": {
                        "Impact": "Do your operations release air/water/soil pollutants beyond regulatory limits?",
                        "Risk":   "Could tightening pollution norms (e.g. CPCB, EU IED) trigger fines or shutdowns?",
                    },
                    "E3": {
                        "Impact": "Do you withdraw water from stressed basins (e.g. Marathwada, Rajasthan)?",
                        "Risk":   "Could water scarcity disrupt operations or increase costs?",
                    },
                    "S1": {
                        "Impact": "Are there health & safety incidents, wage gaps, or precarious work in your direct workforce?",
                        "Risk":   "Could labour disputes, regulatory action, or talent loss affect operations?",
                    },
                    "S2": {
                        "Impact": "Are workers in your supply chain exposed to unsafe conditions or below-living-wage pay?",
                        "Risk":   "Could CSDDD/BRSR P8 liability or supply disruption from T1/T2 ESG failures affect you?",
                    },
                    "G1": {
                        "Impact": "Are there bribery/corruption risks in your market or supply chain?",
                        "Risk":   "Could anti-corruption violations (FCPA, UK Bribery Act, PC Act) result in sanctions?",
                    },
                }.get(tid, {})
                if _prompts.get(iro_types[0] if iro_types else ""):
                    with st.expander("💡 Assessment guidance for this IRO type", expanded=False):
                        for iro_t, prompt in _prompts.items():
                            st.markdown(f"**{iro_t}:** {prompt}")

                fc1, fc2, fc3 = st.columns(3)
                iro_type_sel = fc1.selectbox(
                    "IRO type", iro_types, key=f"iro_type_{tid}"
                )
                horizon_sel = fc2.selectbox(
                    "Time horizon", _HORIZON_OPTS, key=f"horizon_{tid}"
                )
                iro_desc = fc3.text_input(
                    "Description (optional)", key=f"iro_desc_{tid}",
                    placeholder="e.g. Scope 1 combustion emissions increasing global warming"
                )

                fi1, fi2 = st.columns(2)
                with fi1:
                    st.markdown("**Impact materiality**")
                    imp_sev = st.slider(
                        "Severity (1=negligible → 5=catastrophic)",
                        1, 5, 1, key=f"imp_sev_{tid}"
                    )
                    imp_lik = st.slider(
                        "Likelihood (1=rare → 5=certain)",
                        1, 5, 1, key=f"imp_lik_{tid}"
                    )
                    imp_score = imp_sev * imp_lik
                    imp_color = _SCORE_COLOR(imp_score)
                    st.markdown(
                        f"<b>Impact score: <span style='color:{imp_color}'>{imp_score}/25"
                        f"{'  ✅ MATERIAL' if imp_score >= _MAT_THRESHOLD else ''}</span></b>",
                        unsafe_allow_html=True,
                    )

                with fi2:
                    st.markdown("**Financial materiality**")
                    fin_mag = st.slider(
                        "Magnitude (1=immaterial → 5=very significant)",
                        1, 5, 1, key=f"fin_mag_{tid}"
                    )
                    fin_lik = st.slider(
                        "Likelihood (1=rare → 5=certain)",
                        1, 5, 1, key=f"fin_lik_{tid}"
                    )
                    fin_score = fin_mag * fin_lik
                    fin_color = _SCORE_COLOR(fin_score)
                    st.markdown(
                        f"<b>Financial score: <span style='color:{fin_color}'>{fin_score}/25"
                        f"{'  ✅ MATERIAL' if fin_score >= _MAT_THRESHOLD else ''}</span></b>",
                        unsafe_allow_html=True,
                    )

                overall_mat = (imp_score >= _MAT_THRESHOLD) or (fin_score >= _MAT_THRESHOLD)
                st.markdown(
                    f"**Overall: {'🔴 This topic is MATERIAL — topical standard applies' if overall_mat else '⚪ Not material at these scores'}**"
                )

                if st.button(f"💾 Save IRO — {tid} / {iro_type_sel}",
                             key=f"save_iro_{tid}", type="primary",
                             use_container_width=True):
                    _upsert_iro(
                        conn, org_id, inv_year, tid, iro_type_sel,
                        iro_desc.strip(), imp_sev, imp_lik, fin_mag, fin_lik,
                        horizon_sel, username,
                    )
                    st.success(
                        f"✅ Saved — {tid} {iro_type_sel}: "
                        f"impact={imp_score}, financial={fin_score} → "
                        f"{'MATERIAL' if overall_mat else 'not material'}"
                    )
                    st.rerun()

    # ── Materiality matrix heatmap ────────────────────────────────────────
    st.markdown("---")
    st.markdown("### Materiality matrix")
    try:
        import pandas as pd
        import plotly.graph_objects as go

        rows = []
        for (tid, label, module, pillar, iro_types, _, _) in ESRS_TOPICS:
            topic_iros = {k[1]: v for k, v in iros.items() if k[0] == tid}
            max_imp = max((v.get("impact_score") or 0 for v in topic_iros.values()), default=0)
            max_fin = max((v.get("fin_score") or 0 for v in topic_iros.values()), default=0)
            rows.append({
                "Topic": f"{module} {label[:20]}",
                "Impact score": max_imp,
                "Financial score": max_fin,
                "Material": any(v["is_material"] for v in topic_iros.values()),
                "Pillar": pillar,
            })

        df = pd.DataFrame(rows)
        colors = df["Material"].map({True: "#dc2626", False: "#94a3b8"}).tolist()

        fig = go.Figure(go.Scatter(
            x=df["Impact score"], y=df["Financial score"],
            mode="markers+text",
            text=df["Topic"],
            textposition="top center",
            textfont=dict(size=9),
            marker=dict(size=14, color=colors, line=dict(width=1.5, color="white")),
            hovertemplate=("<b>%{text}</b><br>Impact: %{x}<br>Financial: %{y}<extra></extra>"),
        ))
        # Materiality threshold lines
        fig.add_hline(y=_MAT_THRESHOLD, line_dash="dash", line_color="#ef4444",
                      annotation_text=f"Financial threshold ({_MAT_THRESHOLD})")
        fig.add_vline(x=_MAT_THRESHOLD, line_dash="dash", line_color="#ef4444",
                      annotation_text=f"Impact threshold ({_MAT_THRESHOLD})")
        fig.update_layout(
            xaxis=dict(title="Impact materiality score (severity × likelihood)", range=[-1, 26]),
            yaxis=dict(title="Financial materiality score (magnitude × likelihood)", range=[-1, 26]),
            height=500,
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(t=20, b=40),
        )
        st.plotly_chart(fig, use_container_width=True, key="mat_matrix_plot")
    except ImportError:
        st.info("Install plotly and pandas for the materiality matrix.")

    # ── Export IRO register ───────────────────────────────────────────────
    st.markdown("---")
    try:
        import pandas as pd
        iro_rows = conn.execute(
            "SELECT dp_id as Topic, iro_type, impact_score, fin_score, "
            "is_material, time_horizon, iro_description, assessed_by, updated_at "
            "FROM materiality_assessment WHERE org_id=? AND assessment_year=? ORDER BY dp_id",
            (org_id, inv_year)
        ).fetchall()
        if iro_rows:
            df_export = pd.DataFrame([dict(r) for r in iro_rows])
            st.download_button(
                "⬇️ Download IRO register (.csv)",
                df_export.to_csv(index=False),
                file_name=f"IRO_register_{org_id[:10]}_{inv_year}.csv",
                mime="text/csv",
            )
    except ImportError:
        pass

    conn.close()
