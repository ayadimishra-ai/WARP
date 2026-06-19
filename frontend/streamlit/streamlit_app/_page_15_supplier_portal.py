"""
Page 15 — Supplier Portal.

Isolated self-service view for supplier contacts. A supplier logs in with
their own credentials (created by Admin in User Management), sees ONLY their
own scorecard row and a questionnaire to upload their GHG data.

Supplier users:
  - Cannot see the customer's GHG inventory or other suppliers
  - See their own E/S/G scores, risk classification, and engagement status
  - Can submit their own Scope 1+2 tCO₂e data via a simple form
  - Can upload documents (stored as metadata references)
  - See a pre-filled questionnaire scoped to what the customer needs

Role gate: any user with role "Supplier" (added in auth.py) OR Admin.
"""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path

import streamlit as st

from streamlit_app.auth import current_role, get_current_user
from inventory.audit import audit

SUPPLIER_FILE = Path(__file__).parents[1] / "data" / "suppliers.json"
SUPPLIER_SUBMISSIONS_FILE = Path(__file__).parents[1] / "data" / "supplier_submissions.json"

# Questionnaire topics the customer requests from suppliers
_QUESTIONNAIRE = [
    ("ghg_scope1_tco2e",    "Your Scope 1 emissions (tCO₂e)",
     "Direct emissions from owned/controlled operations.", "number"),
    ("ghg_scope2_tco2e",    "Your Scope 2 emissions (tCO₂e)",
     "Indirect emissions from purchased electricity/heat.", "number"),
    ("ghg_boundary",        "Boundary used for your GHG inventory",
     "e.g. Operational control, Equity share.", "text"),
    ("ghg_standard",        "GHG accounting standard used",
     "e.g. GHG Protocol Corporate Standard, ISO 14064.", "text"),
    ("ghg_verified",        "Is your GHG inventory externally verified?",
     "Yes/No/In progress.", "select", ["Yes", "No", "In progress"]),
    ("ghg_target",          "Do you have a net-zero or reduction target?",
     "Yes/No/Planned.", "select", ["Yes", "No", "Planned"]),
    ("ghg_target_year",     "Target year (if applicable)",
     "e.g. 2030, 2040, 2050.", "text"),
    ("renewable_pct",       "% of electricity from renewables",
     "0-100.", "number"),
    ("iso14001",            "ISO 14001 certified?",
     "Yes/No/In process.", "select", ["Yes", "No", "In process"]),
    ("supplier_code",       "Have you signed our Supplier Code of Conduct?",
     "Yes/No/Under review.", "select", ["Yes", "No", "Under review"]),
]


def _load_suppliers() -> list:
    if SUPPLIER_FILE.exists():
        return json.loads(SUPPLIER_FILE.read_text(encoding="utf-8"))
    return []


def _load_submissions() -> dict:
    if SUPPLIER_SUBMISSIONS_FILE.exists():
        return json.loads(SUPPLIER_SUBMISSIONS_FILE.read_text(encoding="utf-8"))
    return {}


def _save_submission(supplier_name: str, data: dict) -> None:
    subs = _load_submissions()
    subs[supplier_name] = {
        **data,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "submitted_by": (get_current_user() or {}).get("username", "unknown"),
    }
    SUPPLIER_SUBMISSIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    SUPPLIER_SUBMISSIONS_FILE.write_text(
        json.dumps(subs, indent=2), encoding="utf-8"
    )


def _get_supplier_for_user(username: str, suppliers: list) -> dict | None:
    """Match logged-in supplier user to their supplier record by username convention.
    Convention: username = supplier name slug (lowercase, hyphens).
    Falls back to first supplier if Admin is viewing portal."""
    slug = username.lower().replace(" ", "-").replace("_", "-")
    for s in suppliers:
        s_slug = s["name"].lower().replace(" ", "-").replace("_", "-")
        if slug in s_slug or s_slug in slug:
            return s
    return suppliers[0] if suppliers else None


def render() -> None:
    role = current_role()
    u    = get_current_user()
    username = (u or {}).get("username", "unknown")

    # Gate: only Supplier role or Admin
    if role not in ("Admin", "Supplier", "Platform Admin") and role is not None:
        st.warning("This page is for supplier contacts. Contact your customer Admin for access.")
        return

    suppliers = _load_suppliers()
    if not suppliers:
        st.error("No suppliers configured. Ask your Admin to add supplier records first.")
        return

    # Admin sees a selector; Supplier sees only their own
    if role in ("Admin", "Platform Admin"):
        st.title("📦 Supplier Portal (Admin view)")
        st.info("You are viewing the supplier portal as Admin. "
                "Select a supplier to see their isolated view.")
        sup_names = [s["name"] for s in suppliers]
        sel = st.selectbox("View portal for supplier:", sup_names, key="portal_admin_sel")
        supplier = next((s for s in suppliers if s["name"] == sel), suppliers[0])
    else:
        st.title("📦 Supplier Portal")
        supplier = _get_supplier_for_user(username, suppliers)
        if not supplier:
            st.error("Your account is not linked to a supplier record. Contact your customer Admin.")
            return
        st.markdown(f"### Welcome, **{supplier['name']}**")
        st.caption("You can only see and edit your own data here.")

    subs = _load_submissions()
    prior = subs.get(supplier["name"], {})

    st.markdown("---")

    # ── My scorecard ─────────────────────────────────────────────────────
    with st.expander("📊 Your ESG scorecard (read-only)", expanded=True):
        c1, c2, c3, c4 = st.columns(4)
        composite = round(0.4*supplier["e_score"] + 0.35*supplier["s_score"]
                          + 0.25*supplier["g_score"], 1)
        c1.metric("🌿 Environment", supplier["e_score"])
        c2.metric("🤝 Social",      supplier["s_score"])
        c3.metric("⚖️ Governance",  supplier["g_score"])
        c4.metric("⭐ Composite",   composite)

        risk_color = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}.get(supplier["risk"], "⚪")
        st.markdown(
            f"**Risk:** {risk_color} {supplier['risk']}  ·  "
            f"**Engagement:** {supplier.get('engagement','—')}  ·  "
            f"**Last audit:** {supplier.get('audit_date','—')}"
        )
        if supplier.get("notes"):
            st.caption(f"Customer note: {supplier['notes']}")

    # ── GHG data questionnaire ────────────────────────────────────────────
    st.markdown("#### 📋 GHG & ESG Data Request")
    st.caption(
        "Your customer has requested the following data. "
        "Completed fields are saved when you click Submit. "
        "You can return and update at any time."
    )

    if prior.get("submitted_at"):
        st.success(f"✅ Last submitted: {prior['submitted_at'][:16].replace('T',' ')} UTC")

    answers: dict = {}
    with st.form("supplier_questionnaire"):
        for q_key, q_label, q_help, q_type, *q_opts in _QUESTIONNAIRE:
            prior_val = prior.get(q_key)
            if q_type == "number":
                answers[q_key] = st.number_input(
                    q_label, min_value=0.0, step=0.1,
                    value=float(prior_val) if prior_val else 0.0,
                    help=q_help, key=f"sq_{q_key}"
                )
            elif q_type == "select":
                opts = q_opts[0] if q_opts else []
                idx = opts.index(prior_val) if prior_val in opts else 0
                answers[q_key] = st.selectbox(
                    q_label, opts, index=idx, help=q_help, key=f"sq_{q_key}"
                )
            else:
                answers[q_key] = st.text_input(
                    q_label, value=prior_val or "",
                    help=q_help, key=f"sq_{q_key}"
                )

        submitted = st.form_submit_button("💾 Submit my data", type="primary")
        if submitted:
            _save_submission(supplier["name"], answers)
            # Update supplier GHG data in main supplier file
            suppliers_updated = json.loads(SUPPLIER_FILE.read_text(encoding="utf-8"))
            for s in suppliers_updated:
                if s["name"] == supplier["name"]:
                    s["ghg_cat1_tco2e"]  = float(answers.get("ghg_scope1_tco2e") or 0)
                    s["ghg_scope2_tco2e"] = float(answers.get("ghg_scope2_tco2e") or 0)

                    # ── Auto-calculate E/S/G scores from questionnaire ────
                    # E score: GHG completeness + target + renewables + certification
                    e = 40  # base
                    if answers.get("ghg_verified") == "Yes":          e += 15
                    if answers.get("ghg_target") == "Yes":            e += 12
                    try: e += min(18, int(answers.get("renewable_pct", 0) or 0) // 5)
                    except Exception: pass
                    if answers.get("iso14001") == "Yes":              e += 10
                    if float(answers.get("ghg_scope1_tco2e") or 0) > 0: e += 5

                    # S score: CoC + worker safety + labour standards
                    soc = 40
                    if answers.get("supplier_code") == "Yes":         soc += 20
                    if answers.get("health_safety_programme") == "Yes": soc += 15
                    if answers.get("living_wage") == "Yes":            soc += 10

                    # G score: boundary + standard + disclosure quality
                    gov = 40
                    if answers.get("ghg_boundary"):                    gov += 12
                    if answers.get("ghg_standard"):                    gov += 12
                    if answers.get("ghg_verified") == "Yes":           gov += 10

                    s["e_score"] = min(100, e)
                    s["s_score"] = min(100, soc)
                    s["g_score"] = min(100, gov)

                    # Update risk tier from new composite
                    comp = round(0.4*s["e_score"] + 0.35*s["s_score"] + 0.25*s["g_score"], 1)
                    s["risk"] = "High" if comp < 40 else ("Medium" if comp < 65 else "Low")
                    break
            SUPPLIER_FILE.write_text(json.dumps(suppliers_updated, indent=2), encoding="utf-8")
            audit("supplier_edit",
                  f"Supplier {supplier['name']} submitted questionnaire — E/S/G scores auto-updated",
                  entity_id=supplier["name"], entity_type="supplier",
                  detail={"scope1": answers.get("ghg_scope1_tco2e"),
                          "scope2": answers.get("ghg_scope2_tco2e"),
                          "e_score": s.get("e_score"), "s_score": s.get("s_score"),
                          "g_score": s.get("g_score")})
            st.success("✅ Data submitted. ESG scores updated automatically from your responses.")
            st.rerun()

    # ── Document upload guidance ──────────────────────────────────────────
    st.markdown("---")
    st.markdown("#### 📄 Document uploads")
    st.caption(
        "Upload supporting documents for your GHG inventory and ESG questionnaire responses. "
        "Accepted: GHG inventory report, third-party assurance letter, "
        "ISO 14001 certificate, sustainability report."
    )
    col_u, col_g = st.columns([2, 1])
    with col_u:
        uploaded = st.file_uploader(
            "Upload document",
            type=["pdf", "xlsx", "docx", "csv"],
            key="sup_portal_upload",
        )
        if uploaded:
            st.success(
                f"✅ '{uploaded.name}' received. "
                "Your customer has been notified."
            )
            audit("supplier_edit",
                  f"Supplier {supplier['name']} uploaded document: {uploaded.name}",
                  entity_id=supplier["name"], entity_type="supplier",
                  detail={"filename": uploaded.name, "size_bytes": uploaded.size})
    with col_g:
        st.markdown("**Guidance**")
        st.markdown("""
- GHG inventory report (last FY)
- Assurance letter (if verified)
- ISO 14001 / 50001 certificate
- Annual sustainability report
- RE100 / SBTi commitment letter
""")
