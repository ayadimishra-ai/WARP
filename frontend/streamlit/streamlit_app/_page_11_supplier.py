"""
Page 11 — Supplier ESG Scorecard.

Bridges GHG inventory (Cat 1 purchased goods, Cat 4 upstream transport,
Cat 15 investments) with ESG supplier risk.

Features:
  - Supplier registry: add/edit suppliers with spend, material, E/S/G scores
  - GHG linkage: shows Cat 1 / Cat 4 tCO2e from inventory per supplier
  - ESG pillar scores (E / S / G) with KPI drilldown
  - Risk classification (High / Medium / Low)
  - Engagement status and audit trail
  - Downloadable scorecard CSV
"""
from __future__ import annotations

import json
from pathlib import Path

import streamlit as st

# Supplier data is stored in data/suppliers.json
SUPPLIER_FILE = Path(__file__).parents[1] / "data" / "suppliers.json"

_DEFAULT_SUPPLIERS = [
    {
        "name": "Alpha Metals Ltd",
        "category": "Raw materials",
        "spend_cr": 3.2,
        "material": "Steel billets",
        "country": "IN",
        "e_score": 72,
        "s_score": 68,
        "g_score": 80,
        "audit_date": "2024-03-15",
        "engagement": "Active",
        "risk": "Low",
        "notes": "ISO 14001 certified. Committed to RE100 by 2030.",
        "ghg_cat1_tco2e": 0.0,
        "ghg_cat4_tco2e": 0.0,
    },
    {
        "name": "Nova Chemicals",
        "category": "Chemicals",
        "spend_cr": 2.1,
        "material": "Industrial solvents",
        "country": "IN",
        "e_score": 41,
        "s_score": 55,
        "g_score": 52,
        "audit_date": "2023-11-20",
        "engagement": "Needs improvement",
        "risk": "High",
        "notes": "Flagged for effluent violations Q3 2023. CAP issued.",
        "ghg_cat1_tco2e": 0.0,
        "ghg_cat4_tco2e": 0.0,
    },
    {
        "name": "GreenEarth Inputs",
        "category": "Agriculture",
        "spend_cr": 1.8,
        "material": "Bio-based packaging",
        "country": "IN",
        "e_score": 81,
        "s_score": 74,
        "g_score": 70,
        "audit_date": "2024-01-10",
        "engagement": "Active",
        "risk": "Low",
        "notes": "Regenerative agriculture programme underway.",
        "ghg_cat1_tco2e": 0.0,
        "ghg_cat4_tco2e": 0.0,
    },
    {
        "name": "Delta Components",
        "category": "Electronics",
        "spend_cr": 2.8,
        "material": "PCB assemblies",
        "country": "CN",
        "e_score": 61,
        "s_score": 65,
        "g_score": 75,
        "audit_date": "2024-02-28",
        "engagement": "Monitoring",
        "risk": "Medium",
        "notes": "Awaiting updated Scope 2 data.",
        "ghg_cat1_tco2e": 0.0,
        "ghg_cat4_tco2e": 0.0,
    },
    {
        "name": "Zen Polymers",
        "category": "Plastics",
        "spend_cr": 0.9,
        "material": "Packaging films",
        "country": "IN",
        "e_score": 48,
        "s_score": 59,
        "g_score": 61,
        "audit_date": "2023-09-05",
        "engagement": "Inactive",
        "risk": "High",
        "notes": "Overdue for audit. No response to last 3 data requests.",
        "ghg_cat1_tco2e": 0.0,
        "ghg_cat4_tco2e": 0.0,
    },
]


def _load_suppliers() -> list:
    if SUPPLIER_FILE.exists():
        return json.loads(SUPPLIER_FILE.read_text(encoding="utf-8"))
    SUPPLIER_FILE.parent.mkdir(parents=True, exist_ok=True)
    SUPPLIER_FILE.write_text(json.dumps(_DEFAULT_SUPPLIERS, indent=2), encoding="utf-8")
    return _DEFAULT_SUPPLIERS.copy()


def _save_suppliers(suppliers: list) -> None:
    SUPPLIER_FILE.write_text(json.dumps(suppliers, indent=2), encoding="utf-8")


def _composite(s: dict) -> float:
    return round(0.4 * s["e_score"] + 0.35 * s["s_score"] + 0.25 * s["g_score"], 1)


def _risk_color(risk: str) -> str:
    return {"High": "#dc2626", "Medium": "#d97706", "Low": "#16a34a"}.get(risk, "#6b7280")


def _score_color(score: float) -> str:
    if score >= 70: return "#16a34a"
    if score >= 50: return "#d97706"
    return "#dc2626"


def _pull_ghg_from_inventory(suppliers: list, inventory, org_id: str, inv_year: int) -> list:
    """Match tCO2e from inventory to suppliers via supplier_name column (primary)
    or name-matching fallback."""
    try:
        rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
        # Reset
        for s in suppliers:
            s["ghg_cat1_tco2e"] = 0.0
            s["ghg_all_tco2e"]  = 0.0
            s["ghg_n_records"]  = 0

        for r in rows:
            t = float(r.get("t_CO2e") or 0)
            rec_sup = (r.get("supplier_name") or "").strip()
            for s in suppliers:
                # Primary: exact supplier_name match
                if rec_sup and rec_sup.lower() == s["name"].lower():
                    s["ghg_all_tco2e"]  = round(s["ghg_all_tco2e"] + t, 4)
                    s["ghg_n_records"] += 1
                    if "Cat 1" in (r.get("process") or "") or "Cat 4" in (r.get("process") or ""):
                        s["ghg_cat1_tco2e"] = round(s["ghg_cat1_tco2e"] + t, 4)
                    break
                # Fallback: name substring match in process/fuel fields
                elif not rec_sup and (
                    s["name"].lower() in (r.get("process") or "").lower()
                    or s["name"].lower() in (r.get("fuel_or_item") or "").lower()
                    or s["name"].lower() in (r.get("site") or "").lower()
                ):
                    s["ghg_all_tco2e"]  = round(s["ghg_all_tco2e"] + t, 4)
                    s["ghg_n_records"] += 1
                    if "Cat 1" in (r.get("process") or "") or "Cat 4" in (r.get("process") or ""):
                        s["ghg_cat1_tco2e"] = round(s["ghg_cat1_tco2e"] + t, 4)
    except Exception as e:
        pass
    return suppliers


def _generate_scorecard_pdf(s: dict, engagement_history: list) -> bytes:
    """Generate a single-supplier PDF scorecard using fpdf2 (falls back to reportlab)."""
    comp = _composite(s)
    risk = s.get("risk", "—")
    risk_color = {"High": (220, 38, 38), "Medium": (217, 119, 6), "Low": (22, 197, 94)}.get(risk, (107, 114, 128))
    score_color = lambda sc: (22, 197, 94) if sc >= 70 else ((217, 119, 6) if sc >= 50 else (220, 38, 38))

    try:
        from fpdf import FPDF

        class _PDF(FPDF):
            def header(self):
                self.set_fill_color(15, 76, 129)
                self.rect(0, 0, 210, 22, "F")
                self.set_font("Helvetica", "B", 14)
                self.set_text_color(255, 255, 255)
                self.set_xy(10, 5)
                self.cell(0, 12, "sk.lite  ·  Supplier ESG Scorecard", ln=True)

            def footer(self):
                self.set_y(-12)
                self.set_font("Helvetica", "", 8)
                self.set_text_color(150, 150, 150)
                self.cell(0, 10, f"Generated by sk.lite  ·  Page {self.page_no()}", align="C")

        pdf = _PDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Supplier name + risk badge
        pdf.set_xy(10, 28)
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 10, s["name"], ln=True)

        pdf.set_x(10)
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, f"{s.get('category','—')}  ·  {s.get('material','—')}  ·  Spend: ₹{s.get('spend_cr',0):.1f} Cr", ln=True)

        # Risk badge
        pdf.set_xy(150, 28)
        pdf.set_fill_color(*risk_color)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(48, 12, f"{risk} Risk", align="C", fill=True, border=1)

        pdf.ln(6)

        # Composite score bar
        pdf.set_x(10)
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 8, f"Composite ESG Score: {comp}/100", ln=True)
        pdf.set_x(10)
        pdf.set_fill_color(226, 232, 240)
        pdf.cell(180, 6, "", fill=True)
        bar_w = int(180 * comp / 100)
        r, g, b = score_color(comp)
        pdf.set_xy(10, pdf.get_y() - 6)
        pdf.set_fill_color(r, g, b)
        pdf.cell(bar_w, 6, "", fill=True)
        pdf.ln(10)

        # E / S / G scores
        pdf.set_x(10)
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 7, "Pillar Scores", ln=True)

        for label, key, weight in [("Environmental (E)", "e_score", 40),
                                    ("Social (S)",        "s_score", 35),
                                    ("Governance (G)",    "g_score", 25)]:
            sc = s.get(key, 0)
            r2, g2, b2 = score_color(sc)
            pdf.set_x(10)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(80, 6, f"{label}  (weight: {weight}%)")
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(r2, g2, b2)
            pdf.cell(0, 6, f"{sc}/100", ln=True)
            # Mini bar
            pdf.set_x(10)
            pdf.set_fill_color(226, 232, 240)
            pdf.cell(140, 4, "", fill=True)
            pdf.set_xy(10, pdf.get_y() - 4)
            pdf.set_fill_color(r2, g2, b2)
            pdf.cell(int(140 * sc / 100), 4, "", fill=True)
            pdf.ln(7)

        pdf.ln(4)

        # Top issues
        top3 = []
        if s.get("e_score", 100) < 60: top3.append("Environmental performance below threshold")
        if s.get("s_score", 100) < 60: top3.append("Social / labour practices need improvement")
        if s.get("g_score", 100) < 60: top3.append("Governance & transparency gaps identified")
        if not top3: top3.append("No critical issues identified — maintain engagement")

        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(30, 41, 59)
        pdf.set_x(10)
        pdf.cell(0, 7, "Key Issues", ln=True)
        for issue in top3:
            pdf.set_x(14)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(0, 6, f"• {issue}", ln=True)

        pdf.ln(4)

        # GHG linkage
        if s.get("ghg_all_tco2e", 0) > 0:
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(30, 41, 59)
            pdf.set_x(10)
            pdf.cell(0, 7, "GHG Linkage (from inventory)", ln=True)
            pdf.set_x(10)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(0, 6,
                     f"Cat 1/4 tCO₂e: {s['ghg_cat1_tco2e']:.2f}  ·  "
                     f"All scopes: {s['ghg_all_tco2e']:.2f}  ·  "
                     f"Records: {s['ghg_n_records']}", ln=True)
            pdf.ln(4)

        # Engagement history
        if engagement_history:
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(30, 41, 59)
            pdf.set_x(10)
            pdf.cell(0, 7, "Engagement History", ln=True)
            for entry in engagement_history[-5:]:
                pdf.set_x(10)
                pdf.set_font("Helvetica", "", 9)
                pdf.set_text_color(71, 85, 105)
                date_ = entry.get("date", "")
                note_ = entry.get("note", "")
                pdf.multi_cell(180, 5, f"[{date_}] {note_}")
                pdf.ln(1)

        return bytes(pdf.output())

    except ImportError:
        pass

    # ── Fallback: reportlab ───────────────────────────────────────────────
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.units import cm
        import io as _io

        buf = _io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
                                 rightMargin=2*cm, leftMargin=2*cm,
                                 topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph(f"<b>Supplier ESG Scorecard — {s['name']}</b>",
                                styles["Title"]))
        story.append(Spacer(1, 0.3*cm))
        story.append(Paragraph(
            f"{s.get('category','—')} · {s.get('material','—')} · "
            f"Risk: <b>{risk}</b> · Composite: <b>{comp}/100</b>",
            styles["Normal"]))
        story.append(Spacer(1, 0.5*cm))

        tdata = [
            ["Pillar", "Score", "Weight"],
            ["Environmental (E)", f"{s.get('e_score',0)}/100", "40%"],
            ["Social (S)",        f"{s.get('s_score',0)}/100", "35%"],
            ["Governance (G)",    f"{s.get('g_score',0)}/100", "25%"],
            ["Composite",         f"{comp}/100",               "100%"],
        ]
        tbl = Table(tdata, colWidths=[9*cm, 4*cm, 3*cm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0f4c81")),
            ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.white]),
            ("GRID",       (0,0), (-1,-1), 0.5, colors.lightgrey),
            ("ALIGN",      (1,0), (-1,-1), "CENTER"),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 0.5*cm))

        for issue in top3:
            story.append(Paragraph(f"• {issue}", styles["Normal"]))
        story.append(Spacer(1, 0.5*cm))

        if engagement_history:
            story.append(Paragraph("<b>Engagement History</b>", styles["Heading3"]))
            for entry in engagement_history[-5:]:
                story.append(Paragraph(
                    f"[{entry.get('date','')}] {entry.get('note','')}",
                    styles["Normal"]))

        doc.build(story)
        return buf.getvalue()

    except ImportError:
        return b""


def render() -> None:
    st.title("📦 Supplier ESG Scorecard")

    profile   = st.session_state.get("org_profile", {})

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
    inventory = st.session_state.get("inventory")
    org_id    = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year  = int(profile.get("reporting_year", 2024))  # always defined

    # ── Resolve org_id + inventory directly (bypass session timing) ─────────
    from streamlit_app._org_helper import resolve_org_id, get_inv_store
    _fixed_org = resolve_org_id(profile)
    if _fixed_org and _fixed_org != "default":
        org_id = _fixed_org
        inventory = get_inv_store(_fixed_org)
        inv_year  = int(profile.get("reporting_year", 2024))

    suppliers = _load_suppliers()
    if inventory:
        suppliers = _pull_ghg_from_inventory(suppliers, inventory, org_id, inv_year)

    # ── Top KPI strip ────────────────────────────────────────────────────
    n  = len(suppliers)
    high_risk = sum(1 for s in suppliers if s["risk"] == "High")
    avg_e = round(sum(s["e_score"] for s in suppliers) / n, 1) if n else 0
    avg_s = round(sum(s["s_score"] for s in suppliers) / n, 1) if n else 0
    avg_g = round(sum(s["g_score"] for s in suppliers) / n, 1) if n else 0
    avg_comp = round(sum(_composite(s) for s in suppliers) / n, 1) if n else 0
    total_spend = round(sum(s["spend_cr"] for s in suppliers), 1)

    k1, k2, k3, k4, k5, k6 = st.columns(6)
    k1.metric("Suppliers tracked", n)
    k2.metric("Total spend", f"₹{total_spend} Cr")
    k3.metric("High-risk suppliers", high_risk,
              delta=f"{high_risk/n*100:.0f}%" if n else None,
              delta_color="inverse")
    k4.metric("Avg E score", avg_e)
    k5.metric("Avg S score", avg_s)
    k6.metric("Avg G score", avg_g)

    st.markdown("---")

    # ── Tabs ─────────────────────────────────────────────────────────────
    t1, t2, t3, t4, t5, t6, t7, t8 = st.tabs([
        "📋 Scorecard",
        "📊 ESG pillar analysis",
        "🔗 GHG linkage",
        "💸 Spend & emissions",
        "⚠️ Risk & PESTEL",
        "🌿 E drilldown",
        "🤝 S drilldown",
        "⚖️ G drilldown",
    ])

    # ── Tab 1: Scorecard table ───────────────────────────────────────────
    with t1:
        st.markdown("#### Supplier ESG composite scores")

        # ESG score methodology expander
        with st.expander("ℹ️ How ESG scores are calculated", expanded=False):
            st.markdown("""
**Composite score formula:**
> Composite = (E × 0.40) + (S × 0.35) + (G × 0.25)

**Pillar weights:**

| Pillar | Weight | Why |
|---|---|---|
| 🌿 Environmental (E) | 40% | Climate, waste, energy — directly linked to GHG/ESG reporting obligations |
| 🤝 Social (S) | 35% | Labour rights, safety — high legal risk and reputational exposure |
| ⚖️ Governance (G) | 25% | Compliance, ethics — foundation for reliable data |

**Score input:**
- Scores (0–100) are entered manually in the **Manage suppliers** section below
- Higher score = lower ESG risk. Score < 50 triggers "High" risk classification
- **Risk tier:** Composite ≥ 65 = Low · 40–65 = Medium · < 40 = High
- **Data quality note:** Scores are estimates until backed by supplier questionnaire data (see 🌿 E / 🤝 S / ⚖️ G drilldown tabs)

**To improve accuracy:** request data via the 🏪 Supplier portal and update scores based on responses.
""")
        st.caption("Composite = 40% E · 35% S · 25% G. Click a row to see full profile and score breakdown.")

        # Filter controls
        fc1, fc2, fc3 = st.columns(3)
        risk_filter = fc1.multiselect("Risk", ["High", "Medium", "Low"],
                                      default=["High", "Medium", "Low"],
                                      key="sup_risk_filter")
        eng_filter  = fc2.multiselect("Engagement",
                                      ["Active", "Monitoring", "Needs improvement", "Inactive"],
                                      default=["Active", "Monitoring", "Needs improvement", "Inactive"],
                                      key="sup_eng_filter")
        sort_by     = fc3.selectbox("Sort by", ["Composite ↓", "E score ↓", "Risk", "Spend ↓"],
                                    key="sup_sort")

        filtered = [s for s in suppliers
                    if s["risk"] in risk_filter and s["engagement"] in eng_filter]
        if sort_by == "Composite ↓":
            filtered.sort(key=lambda s: _composite(s), reverse=True)
        elif sort_by == "E score ↓":
            filtered.sort(key=lambda s: s["e_score"], reverse=True)
        elif sort_by == "Risk":
            order = {"High": 0, "Medium": 1, "Low": 2}
            filtered.sort(key=lambda s: order.get(s["risk"], 3))
        elif sort_by == "Spend ↓":
            filtered.sort(key=lambda s: s["spend_cr"], reverse=True)

        for s in filtered:
            comp = _composite(s)
            risk_col = _risk_color(s["risk"])
            e_col = _score_color(s["e_score"])
            s_col = _score_color(s["s_score"])
            g_col = _score_color(s["g_score"])

            with st.expander(
                f"**{s['name']}** · {s['material']} · "
                f"₹{s['spend_cr']} Cr · "
                f"Composite: **{comp}** · "
                f":{s['risk'].lower()}_circle: {s['risk']} risk",
                expanded=False,
            ):
                c1, c2, c3, c4 = st.columns(4)
                c1.metric("🌿 Environment", s["e_score"])
                c2.metric("🤝 Social", s["s_score"])
                c3.metric("⚖️ Governance", s["g_score"])
                c4.metric("⭐ Composite", comp)

                info1, info2 = st.columns(2)
                info1.markdown(f"""
**Category:** {s['category']}  
**Material:** {s['material']}  
**Country:** {s['country']}  
**Last audit:** {s['audit_date']}  
""")
                info2.markdown(f"""
**Spend:** ₹{s['spend_cr']} Cr  
**Engagement:** {s['engagement']}  
**Risk:** :{risk_col.replace('#','')} {s['risk']}  
""")
                if s.get("notes"):
                    st.caption(f"📝 {s['notes']}")
                if s.get("ghg_cat1_tco2e", 0) > 0:
                    st.info(f"🔗 GHG linkage: **{s['ghg_cat1_tco2e']:.2f} tCO₂e** (Cat 1/4 from inventory)")

        # Download
        try:
            import pandas as pd, io
            df = pd.DataFrame([{
                "Supplier": s["name"], "Category": s["category"],
                "Material": s["material"], "Spend (Cr)": s["spend_cr"],
                "E score": s["e_score"], "S score": s["s_score"],
                "G score": s["g_score"], "Composite": _composite(s),
                "Risk": s["risk"], "Engagement": s["engagement"],
                "Last audit": s["audit_date"], "Notes": s.get("notes",""),
            } for s in suppliers])
            buf = io.BytesIO()
            df.to_csv(buf, index=False)
            dl_col1, dl_col2 = st.columns(2)
            dl_col1.download_button("⬇️ Download scorecard CSV", buf.getvalue(),
                               "supplier_scorecard.csv", "text/csv")
        except ImportError:
            dl_col1, dl_col2 = st.columns(2)

        # PDF scorecard for each supplier
        with dl_col2:
            _pdf_sup_options = ["— select supplier —"] + [s["name"] for s in suppliers]
            _pdf_sel = st.selectbox("PDF scorecard for supplier:", _pdf_sup_options,
                                    key="sup_pdf_selector")
            if _pdf_sel and _pdf_sel != "— select supplier —":
                _pdf_sup = next((s for s in suppliers if s["name"] == _pdf_sel), None)
                if _pdf_sup:
                    _eng_hist = st.session_state.get(f"eng_hist_{_pdf_sup.get('id','')}", [])
                    _pdf_bytes = _generate_scorecard_pdf(_pdf_sup, _eng_hist)
                    if _pdf_bytes:
                        st.download_button(
                            "⬇️ Download PDF scorecard",
                            _pdf_bytes,
                            file_name=f"scorecard_{_pdf_sel.replace(' ','_')}.pdf",
                            mime="application/pdf",
                            key="sup_pdf_download",
                        )
                    else:
                        st.caption("⚠️ PDF generation requires `fpdf2` or `reportlab`. "
                                   "Run: `pip install fpdf2`")

    # ── Tab 2: ESG pillar analysis ───────────────────────────────────────
    with t2:
        st.markdown("#### ESG pillar breakdown across suppliers")
        try:
            import pandas as pd
            import plotly.express as px

            df = pd.DataFrame([{
                "Supplier": s["name"],
                "E": s["e_score"], "S": s["s_score"], "G": s["g_score"],
                "Composite": _composite(s), "Risk": s["risk"],
            } for s in suppliers])

            col1, col2 = st.columns(2)
            with col1:
                fig = px.bar(
                    df.melt(id_vars=["Supplier"], value_vars=["E","S","G"],
                            var_name="Pillar", value_name="Score"),
                    x="Supplier", y="Score", color="Pillar",
                    barmode="group",
                    color_discrete_map={"E":"#16a34a","S":"#2563eb","G":"#f59e0b"},
                    title="E / S / G scores by supplier",
                )
                fig.update_layout(margin=dict(t=40,b=20), legend_title="")
                st.plotly_chart(fig, use_container_width=True, key="p11suppl_plt_1")

            with col2:
                fig2 = px.scatter(
                    df, x="E", y="S", size="Composite",
                    color="Risk", text="Supplier",
                    color_discrete_map={"High":"#dc2626","Medium":"#d97706","Low":"#16a34a"},
                    title="E vs S (bubble = composite score)",
                )
                fig2.update_traces(textposition="top center")
                fig2.update_layout(margin=dict(t=40,b=20))
                st.plotly_chart(fig2, use_container_width=True, key="p11suppl_plt_2")

            # Sorted by pillar
            for pillar, label, color in [("E","Environment","#16a34a"),
                                          ("S","Social","#2563eb"),
                                          ("G","Governance","#f59e0b")]:
                st.markdown(f"**{label} pillar ranking**")
                sorted_df = df[["Supplier", pillar, "Risk"]].sort_values(pillar, ascending=True)
                fig3 = px.bar(sorted_df, x=pillar, y="Supplier", orientation="h",
                              color_discrete_sequence=[color])
                fig3.update_layout(height=200, margin=dict(t=10,b=10), yaxis_title="")
                st.plotly_chart(fig3, use_container_width=True, key=f"p11suppl_plt_pillar_{pillar}")

        except ImportError:
            st.info("Install plotly and pandas for visual analysis.")
            for s in suppliers:
                st.write(f"**{s['name']}** — E:{s['e_score']} S:{s['s_score']} G:{s['g_score']}")

    # ── Tab 3: GHG linkage ───────────────────────────────────────────────
    with t3:
        st.markdown("#### GHG linkage — supplier-attributed emissions")
        st.caption(
            "Links Cat 1 (purchased goods) and Cat 4 (upstream transport) "
            "inventory records to suppliers. Tag records with supplier name in "
            "the **site** field of Scope 1/3 pages to auto-populate below."
        )
        st.markdown("**Supplier spend vs attributed tCO₂e**")

        linked = [s for s in suppliers if s.get("ghg_cat1_tco2e", 0) > 0]
        if linked:
            try:
                import plotly.express as px, pandas as pd
                df_link = pd.DataFrame([{
                    "Supplier": s["name"],
                    "Spend (Cr)": s["spend_cr"],
                    "tCO₂e (Cat1/4)": s["ghg_cat1_tco2e"],
                    "Emission intensity (tCO₂e/Cr)": round(
                        s["ghg_cat1_tco2e"] / s["spend_cr"], 3)
                    if s["spend_cr"] > 0 else 0,
                    "Risk": s["risk"],
                } for s in linked])
                st.dataframe(df_link, use_container_width=True, hide_index=True)
            except ImportError:
                for s in linked:
                    st.write(f"**{s['name']}**: {s['ghg_cat1_tco2e']:.2f} tCO₂e")
        else:
            st.info(
                "No GHG records are linked to suppliers yet. "
                "To link: open the Scope 3 Cat 1 or Cat 4 entry form, "
                "enter the exact supplier name in the **Supplier name** field, then save. "
                "3 suppliers are already tagged in the Acme demo data."
            )

        st.markdown("---")
        st.markdown("#### Manual GHG data override")
        st.caption("If a supplier has provided their own Scope 1+2 data, enter it here.")
        with st.form("ghg_override_form"):
            ov1, ov2, ov3 = st.columns(3)
            sup_names = [s["name"] for s in suppliers]
            ov_sup = ov1.selectbox("Supplier", sup_names)
            ov_cat1 = ov2.number_input("Supplier's Scope 1+2 (tCO₂e)", min_value=0.0, step=0.1)
            ov_submit = st.form_submit_button("Save")
            if ov_submit and ov_sup:
                for s in suppliers:
                    if s["name"] == ov_sup:
                        s["ghg_cat1_tco2e"] = ov_cat1
                _save_suppliers(suppliers)
                st.success(f"✅ GHG data saved for {ov_sup}")
                st.rerun()

    # ── Manage suppliers (bottom expander — replaces old tab 4) ─────────
    st.markdown("---")
    with st.expander("➕ Manage suppliers (add / edit / delete)", expanded=False):
      if True:  # scope wrapper
        from streamlit_app.auth import can
        if not can("can_enter_data"):
            st.warning("Contributor or Admin role required to manage suppliers.")
            return

        st.markdown("#### Add / edit suppliers")

        # Add new
        with st.expander("➕ Add new supplier", expanded=False):
            with st.form("add_supplier_form"):
                a1, a2, a3 = st.columns(3)
                a_name  = a1.text_input("Supplier name *")
                a_cat   = a2.text_input("Category (e.g. Raw materials)")
                a_mat   = a3.text_input("Primary material")
                b1, b2, b3 = st.columns(3)
                a_spend = b1.number_input("Annual spend (₹ Cr)", min_value=0.0, step=0.1)
                a_ctry  = b2.text_input("Country", value="IN")
                a_risk  = b3.selectbox("Risk", ["Low", "Medium", "High"])
                c1, c2, c3, c4 = st.columns(4)
                a_e = c1.number_input("E score (0-100)", 0, 100, 65)
                a_s = c2.number_input("S score (0-100)", 0, 100, 65)
                a_g = c3.number_input("G score (0-100)", 0, 100, 65)
                a_eng = c4.selectbox("Engagement",
                                     ["Active","Monitoring","Needs improvement","Inactive"])
                a_notes = st.text_area("Notes")
                a_audit = st.date_input("Last audit date")
                add_sub = st.form_submit_button("Add supplier", type="primary")
                if add_sub and a_name:
                    suppliers.append({
                        "name": a_name, "category": a_cat, "material": a_mat,
                        "spend_cr": a_spend, "country": a_ctry, "risk": a_risk,
                        "e_score": a_e, "s_score": a_s, "g_score": a_g,
                        "engagement": a_eng, "notes": a_notes,
                        "audit_date": str(a_audit),
                        "ghg_cat1_tco2e": 0.0, "ghg_cat4_tco2e": 0.0,
                    })
                    _save_suppliers(suppliers)
                    st.success(f"✅ Added {a_name}")
                    st.rerun()

        # Edit existing
        st.markdown("**Edit existing supplier**")
        edit_name = st.selectbox("Select supplier to edit",
                                 [s["name"] for s in suppliers],
                                 key="edit_sup_select")
        sup = next((s for s in suppliers if s["name"] == edit_name), None)
        if sup:
            with st.form("edit_supplier_form"):
                # E/S/G scores are CALCULATED from questionnaire data, not manually entered
                # Show current scores as read-only metrics with improvement guidance
                sc1, sc2, sc3, sc4 = st.columns(4)
                _comp = round(0.4*sup["e_score"]+0.35*sup["s_score"]+0.25*sup["g_score"],1)
                sc1.metric("🌿 E (calculated)", sup["e_score"])
                sc2.metric("🤝 S (calculated)", sup["s_score"])
                sc3.metric("⚖️ G (calculated)", sup["g_score"])
                sc4.metric("⭐ Composite", _comp)
                st.caption(
                    "ESG scores are calculated from questionnaire responses (🏪 Supplier portal). "
                    "To improve accuracy, request data from the supplier. "
                    "Scores update automatically when the supplier submits their questionnaire."
                )
                st.markdown("---")
                f1, f2, f3 = st.columns(3)
                n_risk = f1.selectbox("Risk", ["Low","Medium","High"],
                                      index=["Low","Medium","High"].index(sup["risk"]))
                n_eng  = f2.selectbox("Engagement",
                                      ["Active","Monitoring","Needs improvement","Inactive"],
                                      index=["Active","Monitoring","Needs improvement","Inactive"].index(
                                          sup.get("engagement","Active")))
                n_spend = f3.number_input("Spend (₹ Cr)", 0.0, step=0.1,
                                          value=float(sup["spend_cr"]))
                # Relationship timeline
                g1, g2 = st.columns(2)
                n_start = g1.text_input(
                    "Relationship start date",
                    value=sup.get("relationship_start", ""),
                    placeholder="YYYY-MM-DD",
                    help="When did you first engage this supplier?",
                )
                n_end = g2.text_input(
                    "Relationship end date (if former supplier)",
                    value=sup.get("end_date", ""),
                    placeholder="YYYY-MM-DD — leave blank if current",
                    help="Set if this supplier is no longer active. They remain in history.",
                )
                n_notes = st.text_area("Notes / engagement log entry", value="",
                    placeholder="Add a new note (appended with date)...",
                    help="Each save appends this note to the supplier's engagement history.")
                edit_sub = st.form_submit_button("Save changes", type="primary")
                del_sub  = st.form_submit_button("🗑️ Delete supplier")
                if edit_sub:
                    from datetime import datetime as _dt
                    # Append note to history
                    _history = sup.get("engagement_history", [])
                    if n_notes.strip():
                        _history.append({
                            "date": _dt.now().strftime("%Y-%m-%d"),
                            "note": n_notes.strip(),
                            "engagement": n_eng,
                            "risk": n_risk,
                        })
                    # Recalculate composite from questionnaire data
                    from pathlib import Path as _SP
                    import json as _sj
                    _sub_f = _SP(__file__).parents[1] / "data" / "supplier_submissions.json"
                    _subs  = _sj.loads(_sub_f.read_text()) if _sub_f.exists() else {}
                    _sub   = _subs.get(sup["name"], {})
                    # Score from questionnaire: each Yes/certified = +10, No = 0, partial = +5
                    def _q_score(sub):
                        e = 50  # base
                        if sub.get("ghg_verified") == "Yes": e += 15
                        if sub.get("ghg_target") == "Yes":   e += 10
                        try: e += min(20, int(sub.get("renewable_pct", 0)) // 5)
                        except: pass
                        if sub.get("iso14001") == "Yes":     e += 5
                        s = 50
                        if sub.get("supplier_code") == "Yes": s += 20
                        g = 50
                        if sub.get("ghg_boundary"):           g += 10
                        if sub.get("ghg_standard"):           g += 10
                        return min(100, e), min(100, s), min(100, g)
                    if _sub:
                        _ne, _ns, _ng = _q_score(_sub)
                    else:
                        _ne, _ns, _ng = sup["e_score"], sup["s_score"], sup["g_score"]
                    sup.update({
                        "e_score": _ne, "s_score": _ns, "g_score": _ng,
                        "risk": n_risk, "engagement": n_eng,
                        "spend_cr": n_spend, "notes": n_notes or sup.get("notes",""),
                        "relationship_start": n_start or sup.get("relationship_start",""),
                        "end_date": n_end,
                        "engagement_history": _history,
                        "is_former": bool(n_end.strip()),
                    })
                    _save_suppliers(suppliers)
                    st.toast("✅ Supplier updated", icon="✅")
                    st.rerun()
                if del_sub:
                    suppliers = [s for s in suppliers if s["name"] != edit_name]
                    _save_suppliers(suppliers)
                    st.toast(f"Deleted {edit_name}")
                    st.rerun()

            # Show engagement history
            _hist = sup.get("engagement_history", [])
            if _hist:
                st.markdown("**Engagement history:**")
                for entry in reversed(_hist[-10:]):
                    eng_icon = {"Active":"🟢","Monitoring":"🟡",
                                "Needs improvement":"🟠","Inactive":"⚫"}.get(entry.get("engagement",""),"⚪")
                    st.caption(
                        f"{entry['date']} · {eng_icon} {entry.get('engagement','—')} · "
                        f"Risk: {entry.get('risk','—')} — {entry['note']}"
                    )

    # ── Tab 4: Spend & emissions breakup ─────────────────────────────────
    with t4:
        _spend_emissions_tab(suppliers, profile)

    # ── Tab 5: Risk & PESTEL ─────────────────────────────────────────────
    with t5:
        _risk_pestel_tab(suppliers)

    # ── Tab 6: E drilldown ───────────────────────────────────────────────
    with t6:
        _e_drilldown_tab(suppliers)

    # ── Tab 7: S drilldown ───────────────────────────────────────────────
    with t7:
        _s_drilldown_tab(suppliers)

    # ── Tab 8: G drilldown ───────────────────────────────────────────────
    with t8:
        _g_drilldown_tab(suppliers)


# ===========================================================================
# Helper tab functions
# ===========================================================================

def _spend_emissions_tab(suppliers: list, profile: dict) -> None:
    """Tab 4: Procurement spend breakup + material-wise + spend-based emissions."""
    st.markdown("#### Procurement spend & emissions")
    total_spend = sum(s["spend_cr"] for s in suppliers)
    st.metric("Total procurement spend", f"₹{total_spend:.1f} Cr")

    # ── Spend breakup by supplier ────────────────────────────────────────
    st.markdown("**Spend by supplier**")
    try:
        import pandas as pd
        import plotly.express as px

        df_spend = pd.DataFrame([{
            "Supplier": s["name"],
            "Material": s["material"],
            "Category": s["category"],
            "Spend (₹ Cr)": s["spend_cr"],
            "Share %": round(s["spend_cr"] / total_spend * 100, 1) if total_spend else 0,
            "Country": s["country"],
            "Risk": s["risk"],
        } for s in suppliers]).sort_values("Spend (₹ Cr)", ascending=False)

        col1, col2 = st.columns(2)
        with col1:
            fig = px.pie(df_spend, values="Spend (₹ Cr)", names="Supplier",
                         title="Spend share by supplier",
                         color_discrete_sequence=px.colors.qualitative.Set2)
            fig.update_traces(textposition="inside", textinfo="percent+label")
            fig.update_layout(margin=dict(t=40, b=10))
            st.plotly_chart(fig, use_container_width=True, key="p11suppl_plt_4")
        with col2:
            fig2 = px.bar(df_spend, x="Spend (₹ Cr)", y="Supplier", orientation="h",
                          color="Risk",
                          color_discrete_map={"High":"#dc2626","Medium":"#d97706","Low":"#16a34a"},
                          title="Spend by supplier (risk-coloured)")
            fig2.update_layout(margin=dict(t=40, b=10), yaxis_title="")
            st.plotly_chart(fig2, use_container_width=True, key="p11suppl_plt_5")
        st.dataframe(df_spend, use_container_width=True, hide_index=True)

        # ── Spend-based emissions (USEEIO-style) ─────────────────────────
        st.markdown("---")
        st.markdown("**Spend-based emissions estimate (Cat 1 — Scope 3)**")
        st.caption(
            "Estimated Scope 3 Cat 1 emissions using spend × category emission intensity. "
            "Replace with supplier-reported data where available (use 🔗 GHG linkage tab)."
        )
        # Category emission intensities (kgCO₂e per USD) from USEEIO v2 / EPA Supply Chain
        # 2022 NAICS-mapped factors, converted to tCO₂e per ₹ Cr (FX: 1 USD = 83 INR, 1 Cr = 10M INR)
        # Source: https://catalog.data.gov/dataset/supply-chain-greenhouse-gas-emission-factors-v1-3-by-naics-6
        # FX factor: 1 USD = 83 INR → 1 tCO₂e/USD = 1.20 tCO₂e per ₹ Cr (approx, 2022 base)
        _FX_FACTOR = 1.20   # tCO₂e per ₹ Cr ≈ kgCO₂e/USD × 1000 / (83 × 10^4) × 10^6
        CAT_EI = {
            # NAICS codes → category name → kgCO₂e/USD × _FX_FACTOR
            "Raw materials":      12.4,   # NAICS 211-213: mining, 10.3 kgCO₂e/USD
            "Chemicals":          18.7,   # NAICS 325: chemical manufacturing, 15.6
            "Agriculture":         6.2,   # NAICS 111-112: crop/livestock, 5.1
            "Electronics":         8.1,   # NAICS 334: computers/electronics, 6.8
            "Plastics":           14.3,   # NAICS 326: plastics, 11.9
            "Textiles":            9.5,   # NAICS 313-316: textile mills, 7.9
            "Machinery":          10.2,   # NAICS 333: machinery manufacturing, 8.5
            "Packaging":          11.8,   # NAICS 322: paper/packaging, 9.8
            "Food processing":     7.4,   # NAICS 311: food manufacturing, 6.2
            "Transport equipment": 8.9,   # NAICS 336: motor vehicles, 7.4
            "Other":               9.0,   # Default: USEEIO average
        }
        # Note: 2022 data available at data.gov — FX adjusted for INR/USD
        # For precise NAICS 6-digit lookup, use the full EPA dataset
        df_ei = pd.DataFrame([{
            "Supplier": s["name"],
            "Category": s["category"],
            "Spend (₹ Cr)": s["spend_cr"],
            "EI (tCO₂e/Cr)": CAT_EI.get(s["category"], 9.0),
            "Est. tCO₂e": round(s["spend_cr"] * CAT_EI.get(s["category"], 9.0), 1),
            "Has GHG data": "✅" if s.get("ghg_cat1_tco2e", 0) > 0 else "⭕",
        } for s in suppliers]).sort_values("Est. tCO₂e", ascending=False)
        df_ei["Est. tCO₂e"] = df_ei["Est. tCO₂e"].where(
            df_ei["Has GHG data"] == "⭕",
            other=pd.Series([s.get("ghg_cat1_tco2e", 0) for s in suppliers],
                            index=df_ei.index)
        )
        st.dataframe(df_ei, use_container_width=True, hide_index=True)

        total_est = df_ei["Est. tCO₂e"].sum()
        st.metric("Total estimated Cat 1 tCO₂e", f"{total_est:,.1f}")

        fig3 = px.bar(df_ei.sort_values("Est. tCO₂e"),
                      x="Est. tCO₂e", y="Supplier", orientation="h",
                      color="Has GHG data",
                      color_discrete_map={"✅":"#16a34a","⭕":"#d97706"},
                      title="Estimated Cat 1 emissions by supplier (✅=reported, ⭕=spend-based)")
        fig3.update_layout(margin=dict(t=50,b=10), yaxis_title="", legend_title="Data source")
        st.plotly_chart(fig3, use_container_width=True, key="p11suppl_plt_6")

    except ImportError:
        st.info("Install pandas and plotly for spend analysis.")


def _risk_pestel_tab(suppliers: list) -> None:
    """Tab 5: Risk matrix + PESTEL analysis per supplier."""
    st.markdown("#### Supply chain risk analysis")

    # ── Risk scatter matrix ──────────────────────────────────────────────
    try:
        import pandas as pd
        import plotly.express as px

        df = pd.DataFrame([{
            "Supplier": s["name"],
            "ESG score": round(0.4*s["e_score"]+0.35*s["s_score"]+0.25*s["g_score"],1),
            "Spend (₹ Cr)": s["spend_cr"],
            "Risk": s["risk"],
            "Country": s["country"],
            "Category": s["category"],
        } for s in suppliers])

        st.markdown("**Risk vs ESG score matrix** (bubble = spend size)")
        risk_order = {"High":1,"Medium":2,"Low":3}
        df["Risk rank"] = df["Risk"].map(risk_order)
        fig = px.scatter(df, x="ESG score", y="Risk rank", size="Spend (₹ Cr)",
                         color="Risk", text="Supplier",
                         color_discrete_map={"High":"#dc2626","Medium":"#d97706","Low":"#16a34a"},
                         title="Supplier risk vs ESG composite (bubble = spend)")
        fig.update_yaxes(tickvals=[1,2,3], ticktext=["High","Medium","Low"],
                         title="Risk level")
        fig.update_traces(textposition="top center")
        fig.update_layout(margin=dict(t=50,b=20))
        st.plotly_chart(fig, use_container_width=True, key="p11suppl_plt_7")

        st.markdown("---")
    except ImportError:
        pass

    # ── PESTEL per supplier ──────────────────────────────────────────────
    st.markdown("**PESTEL risk assessment**")
    st.caption("Select a supplier to see their PESTEL risk factors.")

    PESTEL_FACTORS = {
        "IN": {
            "Political":    "Moderate: regulatory policy risk on emissions standards (BEE PAT scheme). "
                           "GST compliance burden for MSMEs.",
            "Economic":     "High: raw material cost inflation, INR volatility, credit access for SMEs.",
            "Social":       "Medium: labour law compliance, gender diversity gaps in manufacturing.",
            "Technological":"Medium: digital adoption lagging, Industry 4.0 readiness varies by tier.",
            "Environmental":"High: water stress in Marathwada/Vidarbha, air quality non-compliance risk.",
            "Legal":        "High: Environmental Protection Act, Factories Act, upcoming BRSR supply chain rules.",
        },
        "CN": {
            "Political":    "High: geopolitical tensions, US/EU tariff escalation risk, CCP policy shifts.",
            "Economic":     "Medium: currency controls, real estate sector drag on domestic demand.",
            "Social":       "High: labour rights concerns, Xinjiang supply chain controversy.",
            "Technological":"Low: advanced manufacturing, strong IP risk for customers.",
            "Environmental":"High: carbon border adjustment mechanism (CBAM) exposure for EU exports.",
            "Legal":        "High: data localisation laws, compliance opacity for foreign buyers.",
        },
        "OTHER": {
            "Political":    "Assess country-specific political stability index.",
            "Economic":     "Review sovereign risk rating and currency risk.",
            "Social":       "Check ILO compliance and labour rights index.",
            "Technological":"Evaluate digital infrastructure maturity.",
            "Environmental":"Review environmental regulation stringency.",
            "Legal":        "Assess legal system maturity and contract enforcement.",
        },
    }

    sup_names = [s["name"] for s in suppliers]
    sel_sup = st.selectbox("Select supplier for PESTEL", sup_names, key="pestel_sup_sel")
    sup_data = next((s for s in suppliers if s["name"] == sel_sup), None)
    if sup_data:
        country = sup_data.get("country", "OTHER")
        factors = PESTEL_FACTORS.get(country, PESTEL_FACTORS["OTHER"])

        risk_level = sup_data.get("risk","Medium")
        risk_col = {"High":"🔴","Medium":"🟡","Low":"🟢"}.get(risk_level,"⚪")
        st.markdown(f"**{sel_sup}** — {sup_data.get('category','')} · "
                   f"{sup_data.get('material','')} · {country} · {risk_col} {risk_level} risk")

        for dimension, assessment in factors.items():
            icon = {"Political":"🏛️","Economic":"💰","Social":"👥",
                    "Technological":"🔧","Environmental":"🌱","Legal":"⚖️"}.get(dimension,"📌")
            with st.expander(f"{icon} {dimension}", expanded=False):
                st.write(assessment)

        # Supply chain risk categories
        st.markdown("---")
        st.markdown("**Supply chain risk categories**")
        sc_risks = []
        if sup_data["e_score"] < 50:
            sc_risks.append(("🔴 Environmental compliance", "E score below 50 — regulatory violation or reputational risk."))
        if sup_data["s_score"] < 55:
            sc_risks.append(("🔴 Social / labour rights", "S score below 55 — labour rights or safety concerns."))
        if sup_data["g_score"] < 55:
            sc_risks.append(("🔴 Governance / ethics", "G score below 55 — transparency or compliance concerns."))
        if sup_data.get("engagement") in ("Inactive","Needs improvement"):
            sc_risks.append(("🟡 Engagement breakdown", f"Engagement status: {sup_data['engagement']}."))
        if country in ("CN",):
            sc_risks.append(("🟡 Geopolitical concentration", "Single-country dependency with elevated geopolitical risk."))
        if sup_data.get("spend_cr",0) / max(sum(s["spend_cr"] for s in suppliers),1) > 0.3:
            sc_risks.append(("🟡 Spend concentration", "This supplier represents >30% of total spend."))
        if not sc_risks:
            st.success("✅ No material supply chain risks flagged for this supplier.")
        else:
            for label, detail in sc_risks:
                st.warning(f"**{label}**: {detail}")


def _e_drilldown_tab(suppliers: list) -> None:
    """Tab 6: Environmental pillar — Carbon, Waste, Energy KPIs with real data."""
    st.markdown("#### 🌿 Environmental pillar — KPI drilldowns")
    st.caption(
        "E score composition: Carbon 40% · Waste 30% · Energy 30%. "
        "Enter KPI data below to replace the score estimate with actuals."
    )

    # Pull questionnaire submissions
    from pathlib import Path as _Path
    import json as _json
    sub_file = _Path(__file__).parents[1] / "data" / "supplier_submissions.json"
    subs = {}
    if sub_file.exists():
        try: subs = _json.loads(sub_file.read_text(encoding="utf-8"))
        except Exception: pass

    try:
        import pandas as pd
        # ── Carbon KPIs table ─────────────────────────────────────────────
        with st.expander("♻️ Carbon KPIs", expanded=True):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["e_score"]):
                sub  = subs.get(s["name"], {})
                ghg  = s.get("ghg_all_tco2e") or s.get("ghg_cat1_tco2e", 0)
                rev  = s.get("revenue_cr", 0) or 1
                rows.append({
                    "Supplier":          s["name"],
                    "E score":           s["e_score"],
                    "GHG reported":      "✅" if ghg > 0 else "⭕",
                    "Scope 1+2 (tCO₂e)": round(ghg, 1) if ghg else "—",
                    "Verified?":         sub.get("ghg_verified", "—"),
                    "SBTi target?":      sub.get("ghg_target", "—"),
                    "Target year":       sub.get("ghg_target_year", "—"),
                    "Risk":              s.get("risk","—"),
                    "Data gap":          "Enter via Supplier portal" if not sub else "✅ Submitted",
                })
            df_e = pd.DataFrame(rows)
            st.dataframe(df_e, use_container_width=True, hide_index=True)
            st.caption(
                "**Best practice:** All 3 scopes, third-party verified, SBTi-committed. "
                "Request data via 🏪 Supplier portal."
            )

        # ── Waste KPIs table ──────────────────────────────────────────────
        with st.expander("🗑️ Waste KPIs", expanded=False):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["e_score"]):
                sub = subs.get(s["name"], {})
                rows.append({
                    "Supplier":             s["name"],
                    "ISO 14001?":           sub.get("iso14001", "—"),
                    "Hazardous waste (%)":  "—",
                    "Diversion rate (%)":   "—",
                    "Violations (last FY)": "—",
                    "Data gap": "No waste data" if not sub else "Partial — add waste fields to questionnaire",
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            st.info(
                "💡 Add waste KPI fields (hazardous waste %, diversion rate) to the "
                "Supplier portal questionnaire to collect this data."
            )

        # ── Energy KPIs table ─────────────────────────────────────────────
        with st.expander("⚡ Energy KPIs", expanded=False):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["e_score"]):
                sub = subs.get(s["name"], {})
                rows.append({
                    "Supplier":         s["name"],
                    "RE % (reported)":  str(sub.get("renewable_pct", "—")) + ("%" if sub.get("renewable_pct") else ""),
                    "ISO 50001?":       "—",
                    "Energy intensity": "—",
                    "RE100 member?":    "—",
                    "Data gap": "No energy data" if not sub else ("✅ RE% present" if sub.get("renewable_pct") else "RE% missing"),
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            st.caption(
                "**Best practice:** >50% RE, ISO 50001 certified, declining energy intensity. "
                "Target: RE100 (100% renewable electricity)."
            )
    except ImportError:
        st.info("Install pandas to view KPI tables.")


def _s_drilldown_tab(suppliers: list) -> None:
    """Tab 7: Social pillar — Labour, Safety, Human Rights KPIs with real data."""
    st.markdown("#### 🤝 Social pillar — KPI drilldowns")
    st.caption(
        "S score composition: Labour 40% · Safety 35% · Human Rights 25%. "
        "Request data via Supplier portal questionnaire."
    )

    from pathlib import Path as _Path
    import json as _json
    sub_file = _Path(__file__).parents[1] / "data" / "supplier_submissions.json"
    subs = {}
    if sub_file.exists():
        try: subs = _json.loads(sub_file.read_text(encoding="utf-8"))
        except Exception: pass

    try:
        import pandas as pd

        with st.expander("👷 Labour & working conditions", expanded=True):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["s_score"]):
                sub = subs.get(s["name"], {})
                rows.append({
                    "Supplier":         s["name"],
                    "S score":          s["s_score"],
                    "Engagement":       s.get("engagement", "—"),
                    "CoC signed?":      sub.get("supplier_code", "—"),
                    "Living wage?":     "—",
                    "Gender div. %":    "—",
                    "Training hrs/FTE": "—",
                    "Turnover %":       "—",
                    "Data gap": "⭕ Request via portal" if not sub else (
                        "✅ CoC submitted" if sub.get("supplier_code") == "Yes" else "⚠️ CoC not signed"),
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)

        with st.expander("🦺 Health & safety KPIs", expanded=False):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["s_score"]):
                rows.append({
                    "Supplier":      s["name"],
                    "S score":       s["s_score"],
                    "TRIR":          "—",
                    "LTIR":          "—",
                    "Fatalities":    "—",
                    "ISO 45001?":    "—",
                    "Data gap": "⭕ No H&S data — add to supplier questionnaire",
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            st.caption(
                "**Best practice:** TRIR < 0.5 (manufacturing), zero fatalities, ISO 45001 certified. "
                "TRIR = (recordable incidents × 200,000) / total hours worked."
            )

        with st.expander("⚖️ Human rights & HRDD", expanded=False):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["s_score"]):
                sub = subs.get(s["name"], {})
                rows.append({
                    "Supplier":          s["name"],
                    "CoC signed?":       sub.get("supplier_code", "⭕ Not submitted"),
                    "Grievance channel?":"—",
                    "HRDD policy?":      "—",
                    "Tier 2 mapped?":    "—",
                    "Audit date":        s.get("audit_date", "—"),
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            st.info(
                "💡 Supplier Code of Conduct + grievance mechanism + HRDD programme "
                "are three key requirements for S-pillar pass. "
                "Request via 🏪 Supplier portal."
            )
    except ImportError:
        st.info("Install pandas to view KPI tables.")


def _g_drilldown_tab(suppliers: list) -> None:
    """Tab 8: Governance pillar — Compliance, Ethics, Transparency KPIs."""
    st.markdown("#### ⚖️ Governance pillar — KPI drilldowns")
    st.caption(
        "G score composition: Compliance 40% · Ethics 35% · Transparency 25%."
    )

    from pathlib import Path as _Path
    import json as _json
    sub_file = _Path(__file__).parents[1] / "data" / "supplier_submissions.json"
    subs = {}
    if sub_file.exists():
        try: subs = _json.loads(sub_file.read_text(encoding="utf-8"))
        except Exception: pass

    try:
        import pandas as pd

        with st.expander("📋 Regulatory compliance", expanded=True):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["g_score"]):
                sub = subs.get(s["name"], {})
                rows.append({
                    "Supplier":         s["name"],
                    "G score":          s["g_score"],
                    "Risk":             s.get("risk", "—"),
                    "Last audit":       s.get("audit_date", "—"),
                    "ISO 14001?":       sub.get("iso14001", "⭕ Not reported"),
                    "Major violations": "—",
                    "CAP closure %":    "—",
                    "Data gap": "⭕ No compliance data" if not sub else (
                        "✅ ISO 14001 submitted" if sub.get("iso14001") == "Yes" else "⚠️ ISO 14001 not certified"),
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)

        with st.expander("🤝 Ethics & anti-corruption", expanded=False):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["g_score"]):
                sub = subs.get(s["name"], {})
                rows.append({
                    "Supplier":         s["name"],
                    "G score":          s["g_score"],
                    "CoC training?":    "—",
                    "Whistleblower ch.":"—",
                    "Cases closed %":   "—",
                    "FCPA/UKBA diligence": "—",
                    "Data gap": "⭕ Request via audit/portal",
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)

        with st.expander("📢 Transparency & disclosure", expanded=False):
            rows = []
            for s in sorted(suppliers, key=lambda x: -x["g_score"]):
                sub = subs.get(s["name"], {})
                submitted = bool(sub)
                rows.append({
                    "Supplier":           s["name"],
                    "G score":            s["g_score"],
                    "Questionnaire?":     "✅ Submitted" if submitted else "⭕ Not submitted",
                    "Submitted at":       sub.get("submitted_at", "")[:10] if submitted else "—",
                    "GHG disclosed?":     "✅" if sub.get("ghg_scope1_tco2e") else "⭕",
                    "Audit openness":     "—",
                    "Response days":      "—",
                    "Traceability tier":  "—",
                })
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            st.caption(
                "**Best practice:** Full GHG disclosure with assurance, "
                "open-book audits, Tier 2 suppliers mapped, "
                "data requests answered within 14 days."
            )
    except ImportError:
        st.info("Install pandas to view KPI tables.")
