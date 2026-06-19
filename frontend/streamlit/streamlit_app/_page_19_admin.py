"""
Page 19 — Platform Admin: Multi-organisation management.

Only visible to users with the Platform Admin role.
Allows: view all orgs, switch context, manage users across orgs,
view platform-level usage stats.
"""
import json
import os
import streamlit as st
from pathlib import Path

_PROFILES_PATH = Path(__file__).parents[1] / "data" / "org_profiles.json"
_USERS_PATH    = Path(__file__).parents[1] / "data" / "users.json"


def _load_all_orgs() -> dict:
    if not _PROFILES_PATH.exists():
        return {}
    try:
        return json.loads(_PROFILES_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _load_all_users() -> list:
    if not _USERS_PATH.exists():
        return []
    try:
        return json.loads(_USERS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def render() -> None:
    from streamlit_app.auth import get_current_user, can

    user = get_current_user()
    if not user or user.get("role") != "Platform Admin":
        st.error("🔒 Platform Admin access required.")
        return

    st.title("🏢 Platform Admin — Multi-org Management")

    # Show "viewing as" banner if admin has loaded another org
    _viewing = st.session_state.get("_admin_viewing_org")
    _own_profile = st.session_state.get("_admin_own_profile")
    if _viewing:
        st.warning(
            f"👁️ **Viewing data as: {_viewing}**. "
            "All pages now show this organisation's inventory. "
        )
        if st.button("🔙 Return to Platform Admin view", key="admin_restore"):
            if _own_profile:
                st.session_state.org_profile.update(_own_profile)
            del st.session_state["_admin_viewing_org"]
            st.rerun()
    else:
        # Save admin's own profile for restore
        st.session_state["_admin_own_profile"] = dict(st.session_state.get("org_profile", {}))
    st.caption(
        f"Signed in as **{user['username']}** (Platform Admin). "
        "Full visibility across all organisations on this sk.lite instance."
    )

    orgs   = _load_all_orgs()
    users  = _load_all_users()

    # ── Top metrics ───────────────────────────────────────────────────────
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Organisations", len(orgs))
    m2.metric("Users", len(users))
    m3.metric("Active orgs (have inventory)", sum(
        1 for o in orgs.values()
        if (Path(__file__).parents[1] / "data" / "inventory.sqlite").exists()
    ))
    m4.metric("Platform version", "sk.lite v1.0")

    st.markdown("---")

    # ── Org list ─────────────────────────────────────────────────────────
    tab_orgs, tab_users, tab_activity = st.tabs([
        "🏢 Organisations", "👥 Users", "📊 Activity"
    ])

    with tab_orgs:
        st.markdown("#### All registered organisations")
        if not orgs:
            st.info("No organisations saved yet. Users must complete ⚙️ Setup and save their profile.")
        else:
            for uuid_key, prof in sorted(orgs.items(),
                                         key=lambda x: x[1].get("org_name", ""),
                                         reverse=False):
                with st.expander(
                    f"**{prof.get('org_name', '?')}**  ·  "
                    f"{prof.get('industry', '—')}  ·  "
                    f"FY {prof.get('reporting_year', '—')}  ·  "
                    f"`{uuid_key[:12]}…`",
                    expanded=False,
                ):
                    dc1, dc2, dc3 = st.columns(3)
                    dc1.markdown(
                        f"**Country:** {prof.get('primary_country','—')}  \n"
                        f"**Currency:** {prof.get('currency','—')}  \n"
                        f"**Boundary:** {prof.get('boundary','—')}"
                    )
                    dc2.markdown(
                        f"**GWP AR:** {prof.get('gwp_ar','—')}  \n"
                        f"**Role:** {prof.get('org_role','—')}  \n"
                        f"**SASB sector:** {prof.get('sasb_sector','—')}"
                    )
                    dc3.markdown(
                        f"**Revenue:** ₹{prof.get('revenue_inr_cr',0):,.1f} Cr  \n"
                        f"**Employees:** {int(prof.get('employees',0)):,}  \n"
                        f"**Last saved:** {prof.get('last_updated','—')}"
                    )

                    # Sites registered for this org
                    _sites = prof.get("sites", [])
                    if _sites:
                        st.markdown(f"**Sites ({len(_sites)}):** " +
                            ", ".join(s["name"] for s in _sites))

                    # Switch into this org context
                    if st.button(
                        f"↩️ Switch to {prof.get('org_name','?')}",
                        key=f"admin_switch_{uuid_key}"
                    ):
                        prof["org_uuid"]   = uuid_key
                        prof["setup_done"] = True
                        st.session_state.org_profile.update(prof)
                        from inventory.store import get_store
                        inv_path = Path(__file__).parents[1] / "data" / "inventory.sqlite"
                        st.session_state.inventory = get_store(
                            path=str(inv_path), org_id=uuid_key
                        )
                        st.toast(f"Switched to {prof.get('org_name','?')}", icon="🏢")
                        st.rerun()

                    # Delete org (admin only)
                    sc_col1, sc_col2 = st.columns(2)
                    # Switch into this org's context (view their data)
                    if sc_col1.button(
                        f"👁️ View as {prof.get('org_name','?')}",
                        key=f"admin_view_{uuid_key}",
                        help="Load this organisation's inventory and profile into all pages",
                    ):
                        prof["org_uuid"]   = uuid_key
                        prof["setup_done"] = True
                        st.session_state.org_profile.update(prof)
                        st.session_state["_admin_viewing_org"] = prof.get("org_name","?")
                        from inventory.store import get_store
                        inv_path = Path(__file__).parents[1] / "data" / "inventory.sqlite"
                        st.session_state.inventory = get_store(
                            path=str(inv_path), org_id=uuid_key
                        )
                        st.toast(f"👁️ Viewing as {prof.get('org_name','?')}", icon="🏢")
                        st.rerun()

                    if sc_col2.checkbox(f"☑ Enable delete", key=f"del_chk_{uuid_key}"):
                        if sc_col2.button(
                            f"🗑️ Delete {prof.get('org_name','?')}",
                            key=f"del_org_{uuid_key}",
                            type="secondary",
                        ):
                            del orgs[uuid_key]
                            _PROFILES_PATH.write_text(
                                json.dumps(orgs, indent=2), encoding="utf-8"
                            )
                            st.warning(f"Organisation {uuid_key[:8]} deleted from profiles.")
                            st.rerun()

    with tab_users:
        st.markdown("#### All users on this instance")
        if not users:
            st.info("No users registered. Add users via 👥 Users page.")
        else:
            try:
                import pandas as pd
                # users is a dict keyed by username; iterate (uname, info) pairs
                if isinstance(users, dict):
                    _user_iter = users.items()
                else:
                    # legacy fallback: list of dicts with username field
                    _user_iter = [(u.get("username",""), u) for u in users if isinstance(u, dict)]
                _rows = []
                for uname, uinfo in _user_iter:
                    if not isinstance(uinfo, dict):
                        continue
                    _org = uinfo.get("org_uuid") or uinfo.get("org_id","default")
                    _rows.append({
                        "Username":    uname,
                        "Role":        uinfo.get("role",""),
                        "Display name":uinfo.get("display_name",""),
                        "Org":         (_org[:12]+"…") if _org and len(_org)>12 else _org,
                        "Org name":    uinfo.get("org_name",""),
                    })
                df_users = pd.DataFrame(_rows)
                st.dataframe(df_users, use_container_width=True, hide_index=True)
            except ImportError:
                if isinstance(users, dict):
                    for uname, uinfo in users.items():
                        st.write(f"  • {uname} ({uinfo.get('role','?')}) — {uinfo.get('org_name','')}")
                else:
                    for u in users:
                        st.write(f"  • {u.get('username','?')} ({u.get('role','?')})")

    with tab_activity:
        st.markdown("#### Platform activity")
        st.caption("Aggregate view across all organisations.")

        _total_orgs = len(orgs)
        _total_revenue = sum(
            float(o.get("revenue_inr_cr", 0) or 0) for o in orgs.values()
        )
        _sectors = {}
        for o in orgs.values():
            s = o.get("sasb_sector") or o.get("industry", "Unknown")
            _sectors[s] = _sectors.get(s, 0) + 1

        ac1, ac2 = st.columns(2)
        ac1.metric("Total revenue across orgs", f"₹{_total_revenue:,.1f} Cr")
        ac2.metric("Unique sectors", len(_sectors))

        if _sectors:
            try:
                import pandas as pd, plotly.express as px
                df_s = pd.DataFrame(
                    [{"Sector": k, "Orgs": v} for k, v in _sectors.items()]
                ).sort_values("Orgs", ascending=False)
                fig = px.bar(df_s, x="Sector", y="Orgs",
                             title="Organisations by sector",
                             color="Orgs",
                             color_continuous_scale="Blues")
                fig.update_layout(height=300, margin=dict(t=40, b=10))
                st.plotly_chart(fig, use_container_width=True, key="p19admin_plt_1")
            except ImportError:
                for s, n in sorted(_sectors.items(), key=lambda x: -x[1]):
                    st.write(f"  {s}: {n}")

        st.markdown("---")
        st.info(
            "**sk.lite Platform Admin capabilities:**  \n"
            "- Switch into any organisation's data context  \n"
            "- View all registered orgs and their profiles  \n"
            "- Delete org profiles (data remains in SQLite until manually cleared)  \n"
            "- Manage all users from the 👥 Users page  \n"
            "- Full audit trail in 📜 Audit trail"
        )
