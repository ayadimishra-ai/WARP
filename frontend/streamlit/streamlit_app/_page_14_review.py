"""
Page 14 — Review Queue.

Maker-checker workflow for GHG inventory sign-off before disclosure.

Workflow:
  Contributor submits a scope/year for review  →
  Reviewer sees it in the queue               →
  Reviewer approves (creates immutable ReviewDecision) or returns with comment →
  Admin can see full review history

ReviewDecision records are INSERT-only (immutable).
"""
from __future__ import annotations
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import streamlit as st

from streamlit_app.auth import can, can_access, current_role, get_current_user
from inventory.audit import audit

REVIEW_DB = Path(__file__).parents[1] / "data" / "reviews.sqlite"

REVIEW_SCHEMA = """
CREATE TABLE IF NOT EXISTS review_submissions (
    sub_id          TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL,
    inventory_year  INTEGER NOT NULL,
    scope           TEXT NOT NULL,          -- 'Scope 1'|'Scope 2'|'Scope 3'|'All'
    submitted_by    TEXT NOT NULL,
    submitted_at    TEXT NOT NULL,
    notes           TEXT,
    status          TEXT NOT NULL DEFAULT 'Pending'  -- Pending|Approved|Returned
);

CREATE TABLE IF NOT EXISTS review_decisions (
    decision_id       TEXT PRIMARY KEY,
    sub_id            TEXT NOT NULL,
    reviewer          TEXT NOT NULL,
    decision          TEXT NOT NULL,          -- Approved | Returned
    comment           TEXT NOT NULL,          -- mandatory
    assurance_opinion TEXT,                   -- Reasonable | Limited | Adverse | Disclaimer | None
    decided_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rev_org ON review_submissions (org_id, inventory_year);
CREATE INDEX IF NOT EXISTS idx_rev_sub ON review_decisions (sub_id);
"""


def _conn() -> sqlite3.Connection:
    REVIEW_DB.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(str(REVIEW_DB), check_same_thread=False)
    c.row_factory = sqlite3.Row
    c.executescript(REVIEW_SCHEMA)
    c.commit()
    return c


def _submit(org_id, year, scope, username, notes) -> str:
    conn = _conn()
    sid = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO review_submissions VALUES (?,?,?,?,?,?,?,'Pending')",
        (sid, org_id, year, scope, username,
         datetime.now(timezone.utc).isoformat(), notes),
    )
    conn.commit(); conn.close()
    return sid


def _decide(sub_id, reviewer, decision, comment,
             assurance_opinion=None) -> str:
    conn = _conn()
    did = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO review_decisions VALUES (?,?,?,?,?,?,?)",
        (did, sub_id, reviewer, decision, comment,
         assurance_opinion,
         datetime.now(timezone.utc).isoformat()),
    )
    # Update submission status
    conn.execute("UPDATE review_submissions SET status=? WHERE sub_id=?",
                 (decision, sub_id))
    conn.commit(); conn.close()
    return did


def _get_submissions(org_id, status=None) -> list[dict]:
    conn = _conn()
    w = "WHERE org_id=?" + (" AND status=?" if status else "")
    params = [org_id] + ([status] if status else [])
    rows = conn.execute(
        f"SELECT * FROM review_submissions {w} ORDER BY submitted_at DESC",
        params,
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def _get_decisions(sub_id) -> list[dict]:
    conn = _conn()
    rows = conn.execute(
        "SELECT * FROM review_decisions WHERE sub_id=? ORDER BY decided_at",
        (sub_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]



def _get_system_review_items(profile: dict, inventory) -> list[dict]:
    """
    Auto-generate review items from inventory state.
    These flag conditions that need attention without a user submitting them.
    """
    items = []
    if not inventory:
        return items
    try:
        org_id   = profile.get("org_uuid") or profile.get("org_id") or "default"
        inv_year = profile.get("reporting_year", 2024)
        summary  = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
        all_rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)

        s1_t = summary.get("scope1_t_co2e", 0) or 0
        s2_t = summary.get("scope2_t_co2e", 0) or 0
        s3_t = summary.get("scope3_t_co2e", 0) or 0
        total = s1_t + s2_t + s3_t

        # Flag: Scope 3 > 50% of total but fewer than 5 categories
        if s3_t > 0 and total > 0:
            s3_cats = set(r.get("category","") for r in all_rows
                          if r.get("scope") == "Scope 3")
            if s3_t / total > 0.5 and len(s3_cats) < 5:
                items.append({
                    "sub_id":       "SYS_S3_COVERAGE",
                    "type":         "system",
                    "scope":        "Scope 3",
                    "inventory_year": inv_year,
                    "submitted_by": "System",
                    "submitted_at": "",
                    "status":       "Pending",
                    "notes":        f"Scope 3 = {s3_t:,.1f} tCO2e ({s3_t/total*100:.0f}% of total) "
                                    f"but only {len(s3_cats)} categories entered. "
                                    "GHG Protocol requires all 15 to be screened.",
                    "priority":     "High",
                })

        # Flag: No S1 data at all
        if s1_t == 0 and all_rows:
            items.append({
                "sub_id":       "SYS_S1_MISSING",
                "type":         "system",
                "scope":        "Scope 1",
                "inventory_year": inv_year,
                "submitted_by": "System",
                "submitted_at": "",
                "status":       "Pending",
                "notes":        "No Scope 1 records found. If you have no direct emissions, "
                                "add a zero-quantity record to document the assessment.",
                "priority":     "Medium",
            })

        # Flag: Records with poor data quality
        poor_dq = [r for r in all_rows
                   if r.get("data_quality") in ("estimated", "fallback", "global_default")]
        if poor_dq:
            poor_t = sum(float(r.get("t_CO2e") or 0) for r in poor_dq)
            pct    = poor_t / total * 100 if total else 0
            if pct > 30:
                items.append({
                    "sub_id":       "SYS_DQ_POOR",
                    "type":         "system",
                    "scope":        "All",
                    "inventory_year": inv_year,
                    "submitted_by": "System",
                    "submitted_at": "",
                    "status":       "Pending",
                    "notes":        f"{len(poor_dq)} records ({pct:.0f}% of tCO2e) use estimated/fallback EFs. "
                                    "Consider improving data quality before disclosure.",
                    "priority":     "Medium",
                })

        # Flag: Scope 2 location-based only (no market-based)
        s2_rows = [r for r in all_rows if r.get("scope") == "Scope 2"]
        has_market_based = any(r.get("extra", {}) and r.get("extra", {}).get("rec_covered")
                               for r in s2_rows)
        if s2_rows and not has_market_based:
            items.append({
                "sub_id":       "SYS_S2_DUAL",
                "type":         "system",
                "scope":        "Scope 2",
                "inventory_year": inv_year,
                "submitted_by": "System",
                "submitted_at": "",
                "status":       "Pending",
                "notes":        "Only location-based Scope 2 detected. "
                                "GHG Protocol requires dual reporting — also complete market-based.",
                "priority":     "Low",
            })

    except Exception:
        pass
    return items


def render() -> None:
    st.title("✅ Review Queue")

    role = current_role()
    u    = get_current_user()
    username = u.get("username", "unknown") if u else "unknown"

    profile  = st.session_state.get("org_profile", {})

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
    org_id   = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year = profile.get("reporting_year", 2024)

    st.caption(
        "Maker-checker workflow — Contributors submit scopes/years for review. "
        "Reviewers (Admin) approve or return with a mandatory comment. "
        "All decisions are immutable."
    )

    tab1, tab2, tab3 = st.tabs([
        "📥 Pending reviews",
        "➕ Submit for review",
        "📋 Full history",
    ])

    # ── Tab 1: Pending queue with system + user filter ────────────────────
    with tab1:
        inv = st.session_state.get("inventory")
        sys_items = _get_system_review_items(profile, inv)
        pending   = _get_submissions(org_id, status="Pending")

        # Filter controls
        fc1, fc2 = st.columns(2)
        src_filter  = fc1.multiselect("Source", ["System-generated","User-submitted"],
                                      default=["System-generated","User-submitted"],
                                      key="rev_src_filter")
        prio_filter = fc2.selectbox("Priority", ["All","High","Medium","Low"],
                                    key="rev_prio_filter")

        show_sys  = "System-generated" in src_filter
        show_user = "User-submitted"   in src_filter

        # Merge and show
        all_pending = []
        if show_sys:
            all_pending += [(item, "system") for item in sys_items
                           if prio_filter == "All" or item.get("priority") == prio_filter]
        if show_user:
            all_pending += [(sub, "user") for sub in pending]

        if not all_pending:
            st.success("✅ No pending items matching current filters.")
        else:
            st.markdown(f"**{len(all_pending)} item(s) awaiting attention**")
            for item, item_type in all_pending:
                prio_icon = {"High":"🔴","Medium":"🟡","Low":"🟢"}.get(item.get("priority",""),"⏳")
                type_tag  = "🤖 System" if item_type == "system" else "👤 User"
                date_str  = item.get("submitted_at","")[:10] if item.get("submitted_at") else ""
                with st.expander(
                    f"{prio_icon} {type_tag} · {item['scope']} · {item['inventory_year']}"
                    + (f" · {date_str}" if date_str else ""),
                    expanded=True,
                ):
                    sub = item  # alias for existing code below
                    if item.get("notes"):
                        if item_type == "system":
                            st.warning(f"⚠️ {item['notes']}")
                        else:
                            st.info(f"Submitter notes: {item['notes']}")
                    if item_type == "system":
                        st.caption("This item was automatically flagged by the system. "
                                   "Dismiss by resolving the underlying issue.")

                    # Show inventory summary for this scope/year
                    try:
                        inv = st.session_state.get("inventory")
                        if inv:
                            rows = inv.get_all_records(
                                org_id=org_id, inventory_year=sub["inventory_year"],
                                scope=sub["scope"] if sub["scope"] != "All" else None,
                            )
                            n = len(rows)
                            total = sum(float(r.get("t_CO2e") or 0) for r in rows)
                            st.metric(f"{sub['scope']} records", n,
                                      delta=f"{total:.2f} tCO₂e")
                    except Exception:
                        pass

                    # Reviewer actions (Admin only)
                    if role == "Admin":
                        st.markdown("**Review decision**")
                        comment = st.text_area(
                            "Comment (mandatory)",
                            key=f"rev_comment_{sub['sub_id']}",
                            placeholder="Describe what you checked and why you approve or return...",
                        )
                        assurance = st.selectbox(
                            "Assurance opinion (optional)",
                            ["None", "Reasonable", "Limited", "Adverse", "Disclaimer"],
                            key=f"rev_assurance_{sub['sub_id']}",
                            help="Select if this submission has been through third-party assurance.",
                        )
                        bc1, bc2 = st.columns(2)
                        if bc1.button("✅ Approve", key=f"approve_{sub['sub_id']}",
                                      type="primary"):
                            if not comment.strip():
                                st.error("Comment is mandatory.")
                            else:
                                _decide(sub["sub_id"], username, "Approved", comment,
                                        assurance if assurance != "None" else None)
                                audit("disclose",
                                      f"Approved {sub['scope']} {sub['inventory_year']} review",
                                      org_id=org_id, inventory_year=sub["inventory_year"],
                                      entity_id=sub["sub_id"], entity_type="review",
                                      detail={"decision": "Approved", "comment": comment})
                                st.success("✅ Approved. Decision recorded.")
                                st.rerun()
                        if bc2.button("↩️ Return for edit", key=f"return_{sub['sub_id']}",
                                      type="secondary",
                                      help="Return to contributor for correction"):
                            if not comment.strip():
                                st.error("Comment is mandatory — explain what needs to change.")
                            else:
                                _decide(sub["sub_id"], username, "Returned", comment)
                                audit("disclose",
                                      f"Returned {sub['scope']} {sub['inventory_year']} for revision",
                                      org_id=org_id, inventory_year=sub["inventory_year"],
                                      entity_id=sub["sub_id"], entity_type="review",
                                      detail={"decision": "Returned", "comment": comment})
                                st.warning("↩️ Returned. Submitter notified.")
                                st.rerun()
                    else:
                        st.info("Admin role required to approve or return.")

    # ── Tab 2: Submit for review ─────────────────────────────────────────
    with tab2:
        if not can("can_enter_data"):
            st.warning("Contributor role required to submit for review.")
        else:
            st.markdown("#### Submit a scope / year for Admin review")
            with st.form("submit_review_form"):
                sc1, sc2 = st.columns(2)
                scope   = sc1.selectbox("Scope", ["All", "Scope 1", "Scope 2", "Scope 3"])
                year    = sc2.number_input("Inventory year", value=inv_year,
                                           min_value=2000, max_value=2100, step=1)
                notes   = st.text_area("Notes for reviewer",
                                       placeholder="What should the reviewer check? Any caveats?")
                sub_btn = st.form_submit_button("📤 Submit for review", type="primary")
                if sub_btn:
                    sid = _submit(org_id, int(year), scope, username, notes)
                    audit("export",
                          f"Submitted {scope} {year} for review",
                          org_id=org_id, inventory_year=int(year),
                          entity_id=sid, entity_type="review",
                          detail={"scope": scope, "notes": notes})
                    st.success(f"✅ Submitted {scope} {year} for review. Admin will be notified.")
                    st.rerun()

    # ── Tab 3: Full history ──────────────────────────────────────────────
    with tab3:
        all_subs = _get_submissions(org_id)
        if not all_subs:
            st.info("No submissions yet.")
        else:
            status_filter = st.selectbox("Filter by status",
                                         ["All", "Pending", "Approved", "Returned"],
                                         key="rev_hist_filter")
            filtered = all_subs if status_filter == "All" else [
                s for s in all_subs if s["status"] == status_filter
            ]
            for sub in filtered:
                status_emoji = {"Pending": "⏳", "Approved": "✅",
                                "Returned": "↩️"}.get(sub["status"], "?")
                with st.expander(
                    f"{status_emoji} {sub['scope']} · {sub['inventory_year']} · "
                    f"{sub['status']} · {sub['submitted_at'][:10]}",
                    expanded=False,
                ):
                    st.write(f"**Submitted by:** {sub['submitted_by']}")
                    if sub.get("notes"):
                        st.write(f"**Notes:** {sub['notes']}")
                    decisions = _get_decisions(sub["sub_id"])
                    if decisions:
                        st.markdown("**Review decisions:**")
                        for d in decisions:
                            icon = "✅" if d["decision"] == "Approved" else "↩️"
                            opinion_str = (f" · Assurance: **{d['assurance_opinion']}**"
                                          if d.get("assurance_opinion") else "")
                            st.write(
                                f"{icon} {d['decision']} by {d['reviewer']} "
                                f"on {d['decided_at'][:10]}: *{d['comment']}*"
                                f"{opinion_str}"
                            )
