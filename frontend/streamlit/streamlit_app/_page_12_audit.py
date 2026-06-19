"""
Page 12 — Audit Trail.

Immutable, append-only log of every material action in the system.
Visible to: Admin (full), Contributor (own actions only), Viewer (hidden).

Event types logged:
  save_record   | delete_record | lock_year | unlock_year
  login | logout | role_change | export | disclose
  supplier_edit | tag_edit | recalculate
"""
from __future__ import annotations
import json
import streamlit as st

from inventory.audit import get_events, audit
from streamlit_app.auth import can, current_role, get_current_user


_TYPE_EMOJI = {
    "save_record":    "💾",
    "delete_record":  "🗑️",
    "lock_year":      "🔒",
    "unlock_year":    "🔓",
    "login":          "🔑",
    "logout":         "🚪",
    "role_change":    "👥",
    "export":         "📤",
    "disclose":       "📋",
    "supplier_edit":  "📦",
    "tag_edit":       "🏷️",
    "recalculate":    "♻️",
}


def render() -> None:
    st.title("📜 Audit Trail")

    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"

    role = current_role()
    if role == "Viewer":
        st.warning("Viewer role cannot access the audit trail.")
        return

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
    org_id    = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
    current_u = get_current_user()
    username  = current_u.get("username", "system") if current_u else "system"

    st.caption(
        "This log is **immutable** — no record can be edited or deleted. "
        "It provides the evidence chain required for GHG assurance audits, "
        "BRSR Principle 6, and CDP C7 verification."
    )

    # ── Filters ──────────────────────────────────────────────────────────
    fc1, fc2, fc3, fc4 = st.columns(4)
    all_types = ["All"] + sorted(_TYPE_EMOJI.keys())
    type_filter  = fc1.selectbox("Event type", all_types, key="audit_type")
    actor_filter = fc2.text_input("Actor (username)", key="audit_actor",
                                  placeholder="filter by username")
    limit        = fc3.selectbox("Show last", [50, 100, 200, 500], key="audit_limit")
    show_detail  = fc4.toggle("Show full detail", value=False, key="audit_detail")

    # Contributors only see their own events
    if role == "Contributor":
        actor_filter = username

    events = get_events(
        org_id=org_id,
        event_type=type_filter if type_filter != "All" else None,
        actor=actor_filter or None,
        limit=int(limit),
    )

    if not events:
        st.info("No audit events recorded yet. Actions taken in the system will appear here.")
        return

    st.markdown(f"**{len(events)} events** (newest first)")
    st.markdown("---")

    for ev in events:
        etype  = ev.get("event_type", "")
        emoji  = _TYPE_EMOJI.get(etype, "📌")
        ts     = (ev.get("created_at") or "")[:19].replace("T", " ")
        actor  = ev.get("actor_username", "?")
        arole  = ev.get("actor_role", "")
        summ   = ev.get("summary", "")
        eid    = ev.get("entity_id", "")

        col1, col2 = st.columns([5, 1])
        col1.markdown(
            f"{emoji} **{summ}**  \n"
            f"<small style='color:{_dim_txt}'>{ts} UTC · "
            f"{actor} ({arole}) · {etype}"
            f"{' · ' + eid[:40] if eid else ''}</small>",
            unsafe_allow_html=True,
        )
        col2.caption(ev.get("inventory_year") or "")

        if show_detail:
            raw = ev.get("detail_json") or "{}"
            try:
                parsed = json.loads(raw)
                if parsed:
                    with st.expander("Detail", expanded=False):
                        st.json(parsed)
            except Exception:
                pass

    # ── Export audit log ─────────────────────────────────────────────────
    st.markdown("---")
    try:
        import pandas as pd, io
        df = pd.DataFrame(events)[
            ["created_at", "event_type", "actor_username", "actor_role",
             "summary", "entity_id", "entity_type", "inventory_year"]
        ].rename(columns={
            "created_at": "Timestamp", "event_type": "Type",
            "actor_username": "Actor", "actor_role": "Role",
            "summary": "Summary", "entity_id": "Entity ID",
            "entity_type": "Entity type", "inventory_year": "Year",
        })
        buf = io.BytesIO()
        df.to_csv(buf, index=False)
        st.download_button(
            "⬇️ Download audit log CSV",
            buf.getvalue(),
            "audit_trail.csv",
            "text/csv",
        )
    except ImportError:
        pass
