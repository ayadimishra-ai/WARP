"""
_page_08_initiatives.py — Reduction initiative tracker.

Tracks abatement projects with estimated tCO2e savings,
timeline, status, and cost. Links to GHG Protocol categories.
"""
from __future__ import annotations
import json
from datetime import datetime, timezone

import streamlit as st


# ---------------------------------------------------------------------------
# Initiative store (persisted in org_profile extra JSON)
# ---------------------------------------------------------------------------

def _load(profile: dict) -> list[dict]:
    raw = profile.get("_initiatives", "[]")
    try:
        return json.loads(raw) if isinstance(raw, str) else raw
    except Exception:
        return []


def _save(profile: dict, initiatives: list[dict]) -> None:
    profile["_initiatives"] = json.dumps(initiatives, default=str)
    import json as _json
    from pathlib import Path
    try:
        prof_path = Path(__file__).parents[1] / "data" / "org_profiles.json"
        if prof_path.exists():
            all_profiles = _json.loads(prof_path.read_text(encoding="utf-8"))
            org_id = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
            all_profiles[org_id] = profile
            prof_path.write_text(_json.dumps(all_profiles, indent=2), encoding="utf-8")
    except Exception:
        pass
    st.session_state.org_profile = profile


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CATEGORIES = [
    "Energy efficiency",
    "Fuel switching",
    "Renewable energy",
    "Supply chain",
    "Logistics",
    "Fleet decarbonisation",
    "Process improvement",
    "Behaviour change / travel",
    "Governance",
    "Waste reduction",
    "Carbon capture / removal",
    "Other",
]

SCOPES = ["Scope 1", "Scope 2", "Scope 3", "Cross-scope"]
STATUSES = ["Planned", "In progress", "Completed", "On hold", "Cancelled"]
STATUS_COLOURS = {
    "Planned":     "#636EFA",
    "In progress": "#FFA15A",
    "Completed":   "#00CC96",
    "On hold":     "#EF553B",
    "Cancelled":   "#888888",
}


# ---------------------------------------------------------------------------
# Main render
# ---------------------------------------------------------------------------

def render() -> None:
    st.title("🌱 Reduction Initiatives")

    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _card_bg  = "#f0f9ff" if _is_light else "#1a2235"
    _card_txt = "#1f2937" if _is_light else "#e2e8f0"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"
    _border   = "#e2e8f0" if _is_light else "#334155"
    _line_col = "#374151" if _is_light else "#94a3b8"

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


    # ── Load initiatives directly from disk (most reliable) ───────────────
    initiatives = []
    try:
        import json as _ij
        from pathlib import Path as _iP
        _iprof_path = _iP(__file__).parents[1] / "data" / "org_profiles.json"
        _iuuid = profile.get("org_uuid") or profile.get("org_id", "")
        if _iprof_path.exists() and _iuuid and _iuuid != "default":
            _iall = _ij.loads(_iprof_path.read_text(encoding="utf-8"))
            if _iuuid in _iall:
                _raw = _iall[_iuuid].get("_initiatives", "[]")
                initiatives = _ij.loads(_raw) if isinstance(_raw, str) else (_raw or [])
    except Exception as _ie:
        st.caption(f"Could not load initiatives: {_ie}")
    if not initiatives:
        # Fallback: try session profile
        initiatives = _load(profile)

    # ── Summary metrics ───────────────────────────────────────────────────
    if initiatives:
        total_target   = sum(i.get("target_tco2e", 0)    for i in initiatives)
        total_achieved = sum(i.get("achieved_tco2e", 0)  for i in initiatives
                             if i.get("status") == "Completed")
        in_progress    = sum(i.get("target_tco2e", 0)    for i in initiatives
                             if i.get("status") == "In progress")
        mc = st.columns(4)
        mc[0].metric("Total initiatives",       len(initiatives))
        mc[1].metric("Target reduction (tCO₂e)", f"{total_target:,.1f}")
        mc[2].metric("Achieved (completed)",     f"{total_achieved:,.1f}")
        mc[3].metric("In-progress pipeline",    f"{in_progress:,.1f}")

        # Progress bar
        if total_target > 0:
            pct = min(total_achieved / total_target, 1.0)
            st.progress(pct, text=f"Achieved {pct*100:.0f}% of target reductions")

        st.markdown("---")


    # ── Main tabs ─────────────────────────────────────────────────────────
    _ini_tab1, _ini_tab2, _ini_tab3 = st.tabs([
        "📋 Initiatives list",
        "📈 MAC curve",
        "💡 Recommendations",
    ])

    with _ini_tab1:
        # ── Filter bar ────────────────────────────────────────────────────────
        fc1, fc2, fc3 = st.columns(3)
        f_status   = fc1.multiselect("Status",   STATUSES,   default=STATUSES,   key="ini_status")
        f_scope    = fc2.multiselect("Scope",     SCOPES,     default=SCOPES,     key="ini_scope")
        f_category = fc3.multiselect("Category", CATEGORIES, default=CATEGORIES, key="ini_cat")

        filtered = [i for i in initiatives
                    if (i.get("status", "Planned")  in f_status  or i.get("status")   not in STATUSES)
                    and (i.get("scope", "Scope 1")  in f_scope   or i.get("scope")    not in SCOPES)
                    and (i.get("category", "Other") in f_category or i.get("category") not in CATEGORIES)]

        # ── Add new initiative (always visible at top) ─────────────────────
        with st.expander("➕ Add new initiative", expanded=not initiatives):
            with st.form("add_initiative"):
                c1, c2 = st.columns(2)
                name     = c1.text_input("Initiative name *", placeholder="LED lighting retrofit")
                category = c2.selectbox("Category", CATEGORIES)
                c3, c4, c5 = st.columns(3)
                scope     = c3.selectbox("Scope", SCOPES)
                status    = c4.selectbox("Status", STATUSES)
                target_yr = c5.number_input("Target year", min_value=2024, max_value=2050, value=2025, step=1)
                c6, c7, c8 = st.columns(3)
                target_t   = c6.number_input("Est. reduction (tCO₂e/yr)", min_value=0.0, format="%.2f")
                achieved_t = c7.number_input("Achieved (tCO₂e/yr)",        min_value=0.0, format="%.2f")
                capex      = c8.number_input("CapEx (INR lakh)",               min_value=0.0, format="%.2f")
                description = st.text_area("Description / notes", height=80)
                owner       = st.text_input("Owner / responsible team")
                if st.form_submit_button("💾 Add initiative", type="primary"):
                    if not name:
                        st.error("Name is required.")
                    else:
                        initiatives.append({
                            "id":             f"INI-{len(initiatives)+1:03d}",
                            "name":           name, "category": category,
                            "scope":          scope, "status":   status,
                            "target_year":    int(target_yr),
                            "target_tco2e":   float(target_t),
                            "achieved_tco2e": float(achieved_t),
                            "capex_lakh_inr": float(capex),
                            "description":    description, "owner": owner,
                            "created_at":     datetime.now(timezone.utc).isoformat(),
                        })
                        _save(profile, initiatives)
                        st.success(f"✓ Initiative '{name}' added.")
                        st.rerun()

        # ── Template download ─────────────────────────────────────────────────
        st.markdown("---")
        st.download_button(
            "⬇️ Download CSV template",
            data=_initiatives_template_csv(),
            file_name="initiatives_upload_template.csv",
            mime="text/csv",
            key="dl_ini_tmpl_tab1",
        )

        # ── Bulk CSV upload ───────────────────────────────────────────────────
        with st.expander("📤 Bulk upload initiatives from CSV", expanded=False):
            st.info(
                "How to upload: (1) Download the template below. "
                "(2) Fill rows 2+. (3) Required: name, category, scope, status, target_year. "
                "(4) Upload here."
            )
            uploaded_ini = st.file_uploader("Choose CSV", type=["csv"], key="ini_csv_upload",
                                            label_visibility="collapsed")
            if uploaded_ini:
                try:
                    import pandas as pd, uuid as _uuid
                    df_up = pd.read_csv(uploaded_ini)
                    required = ["name","category","scope","status","target_year"]
                    missing = [c for c in required if c not in df_up.columns]
                    if missing:
                        st.error(f"Missing columns: {missing}")
                    else:
                        st.success(f"Found {len(df_up)} rows. Preview:")
                        st.dataframe(df_up.head(5), use_container_width=True, hide_index=True)
                        if st.button("✅ Import all rows", key="ini_import_btn", type="primary"):
                            ini_list = _load(profile); added = 0
                            for _, row in df_up.iterrows():
                                n_val = str(row.get("name","")).strip()
                                if not n_val: continue
                                ini_list.append({
                                    "id":             str(_uuid.uuid4()),
                                    "name":           n_val,
                                    "category":       str(row.get("category","Other")),
                                    "scope":          str(row.get("scope","Scope 1")),
                                    "status":         str(row.get("status","Planned")),
                                    "target_year":    int(row.get("target_year", 2025)),
                                    "target_tco2e":   float(row.get("target_tco2e",0) or 0),
                                    "achieved_tco2e": float(row.get("achieved_tco2e",0) or 0),
                                    "capex_lakh_inr": float(row.get("capex_lakh_inr",0) or 0),
                                    "owner":          str(row.get("owner","")),
                                    "description":    str(row.get("description","")),
                                })
                                added += 1
                            _save(profile, ini_list)
                            st.toast(f"✅ {added} initiatives imported", icon="✅")
                            st.rerun()
                except Exception as e:
                    st.error(f"Could not read CSV: {e}")

        # ── Initiative cards ──────────────────────────────────────────────────
        if not initiatives:
            st.info("📋 No initiatives yet. Add your first one using the form above.")
        else:
            st.markdown(f"**{len(filtered)} of {len(initiatives)} initiatives** (filtered)")
            for idx, ini in enumerate(filtered):
                colour   = STATUS_COLOURS.get(ini.get("status",""), "#888")
                target   = float(ini.get("target_tco2e") or 0)
                achieved = float(ini.get("achieved_tco2e") or 0)
                pct_done = min(achieved / target, 1.0) if target > 0 else 0
                with st.expander(
                    f"**{ini.get('name','?')}**  ·  "
                    f"🎯 {target:,.1f} tCO₂e  ·  "
                    f"{ini.get('status','?')}",
                    expanded=False,
                ):
                    dc = st.columns(4)
                    dc[0].metric("Target reduction", f"{target:,.2f} tCO₂e/yr")
                    dc[1].metric("Achieved",         f"{achieved:,.2f} tCO₂e/yr")
                    dc[2].metric("CapEx",            f"₹{ini.get('capex_lakh_inr',0):,.1f}L")
                    dc[3].metric("Target year",      str(ini.get("target_year","—")))
                    if target > 0:
                        st.progress(pct_done, text=f"{pct_done*100:.0f}% of target achieved")
                    st.caption(
                        f"Category: {ini.get('category')}  ·  "
                        f"Scope: {ini.get('scope')}  ·  "
                        f"Owner: {ini.get('owner') or '—'}  ·  ID: {ini['id']}"
                    )
                    if ini.get("description"):
                        st.caption(ini["description"])
                    if ini.get("capex_lakh_inr") and target > 0:
                        cost_per_t = float(ini["capex_lakh_inr"]) * 100_000 / target
                        st.caption(f"Abatement cost: ₹{cost_per_t:,.0f}/tCO₂e")
                    bc1, bc2, bc3 = st.columns(3)
                    new_status   = bc1.selectbox("Update status", STATUSES,
                                                 index=STATUSES.index(ini.get("status","Planned")),
                                                 key=f"ini_st_{idx}")
                    new_achieved = bc2.number_input("Update achieved", min_value=0.0,
                                                    value=float(ini.get("achieved_tco2e",0)),
                                                    format="%.2f", key=f"ini_ach_{idx}")
                    if bc3.button("💾 Save", key=f"ini_save_{idx}"):
                        orig_idx = next((j for j, i in enumerate(initiatives) if i["id"] == ini["id"]), None)
                        if orig_idx is not None:
                            initiatives[orig_idx]["status"]        = new_status
                            initiatives[orig_idx]["achieved_tco2e"] = float(new_achieved)
                        _save(profile, initiatives)
                        st.success("Updated.")
                        st.rerun()
                    if bc3.button("🗑️ Delete", key=f"ini_del_{idx}", type="secondary"):
                        initiatives = [i for i in initiatives if i["id"] != ini["id"]]
                        _save(profile, initiatives)
                        st.rerun()

            # Excel export
            try:
                import io, pandas as pd
                if filtered:
                    df = pd.DataFrame(filtered)[["id","name","category","scope","status",
                                                  "target_year","target_tco2e","achieved_tco2e",
                                                  "capex_lakh_inr","owner","description"]]
                    buf = io.BytesIO()
                    df.to_excel(buf, index=False, engine="openpyxl")
                    buf.seek(0)
                    st.download_button(
                        "⬇️ Export initiatives to Excel",
                        data=buf.read(),
                        file_name="ghg_reduction_initiatives.xlsx",
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        key="ini_excel_export",
                    )
            except ImportError:
                pass

    with _ini_tab2:
        st.markdown("#### Marginal Abatement Cost (MAC) Curve")
        st.caption(
            "Each bar = one initiative. Width = tCO2e/yr reduction. "
            "Height = Rs/tCO2e cost. Bars BELOW zero = cost savings. "
            "Ordered cheapest-first = your abatement priority queue."
        )

        _mac_candidates = [i for i in initiatives
                           if float(i.get("target_tco2e") or 0) > 0]

        if not initiatives:
            st.info(
                "No initiatives yet. Add them in the Initiatives list tab "
                "with a Target tCO2e/yr value to see the MAC curve."
            )
        elif not _mac_candidates:
            st.warning(
                "Initiatives exist but none have Target tCO2e/yr set. "
                "Edit your initiatives and add the reduction target."
            )
        else:
            try:
                import pandas as pd
                import plotly.graph_objects as go

                mac_rows = []
                for ini in _mac_candidates:
                    t     = float(ini.get("target_tco2e") or 0)
                    capex = float(ini.get("capex_lakh_inr") or 0)
                    cost_per_t = capex * 100000.0 / t  # Rs/tCO2e: 1 lakh = 100,000 Rs if t > 0 else 0.0
                    mac_rows.append({
                        "name":       ini["name"][:30],
                        "category":   ini.get("category", "Other"),
                        "scope":      ini.get("scope", "Scope 1"),
                        "status":     ini.get("status", "Planned"),
                        "reduction":  t,
                        "cost_per_t": cost_per_t,
                    })

                df_mac = pd.DataFrame(mac_rows).sort_values("cost_per_t")
                _CAT_COLORS = {
                    "Energy efficiency": "#16a34a",
                    "Renewable energy":  "#0ea5e9",
                    "Supply chain":      "#7c3aed",
                    "Fuel switching":    "#f59e0b",
                    "Process change":    "#dc2626",
                    "Governance":        "#6b7280",
                    "Other":             "#94a3b8",
                }
                # Build MAC waterfall: vertical bars sorted cheapest → most expensive
                # X = cumulative midpoint, Y = cost/tonne, width = reduction potential
                _CAT_COLORS_FULL = {
                    "Energy efficiency":        "#16a34a",
                    "Renewable energy":         "#0ea5e9",
                    "Supply chain":             "#7c3aed",
                    "Logistics":                "#f97316",
                    "Fleet decarbonisation":    "#06b6d4",
                    "Fuel switching":           "#f59e0b",
                    "Governance":               "#6b7280",
                    "Behaviour change / travel":"#ec4899",
                    "Process improvement":      "#dc2626",
                    "Nature-based":             "#84cc16",
                    "Other":                    "#94a3b8",
                }

                fig_mac = go.Figure()
                _x_start = 0.0
                _seen_cats = set()
                for _, row in df_mac.iterrows():
                    _cat   = str(row["category"])
                    _col   = _CAT_COLORS_FULL.get(_cat, "#94a3b8")
                    _w     = float(row["reduction"])
                    _cx    = _x_start + _w / 2          # centre of this bar
                    _cost  = float(row["cost_per_t"])
                    _show  = _cat not in _seen_cats     # legend dedupe
                    _seen_cats.add(_cat)
                    fig_mac.add_trace(go.Bar(
                        x=[_cx], y=[_cost],
                        width=[_w],
                        marker_color=_col,
                        marker_line_color="white",
                        marker_line_width=1.5,
                        name=_cat,
                        showlegend=_show,
                        legendgroup=_cat,
                        text=[row["name"][:22]],
                        textposition="inside" if abs(_cost) > 2000 else "outside",
                        insidetextanchor="middle",
                        textfont=dict(size=9, color="white" if _cost != 0 else "#1e293b"),
                        hovertemplate=(
                            f"<b>{row['name']}</b><br>"
                            f"Reduction: {_w:,.0f} tCO₂e/yr<br>"
                            f"Cost: Rs {_cost:,.0f}/tCO₂e<br>"
                            f"Scope: {row['scope']}<br>"
                            f"Status: {row['status']}<extra></extra>"
                        ),
                    ))
                    _x_start += _w

                _max_t = _x_start
                fig_mac.update_layout(
                    title=dict(
                        text="Marginal Abatement Cost Curve — Acme Manufacturing",
                        font=dict(size=14, color="#1e293b"), x=0.01),
                    xaxis=dict(title="Cumulative abatement potential (tCO₂e/yr)",
                               color="#1e293b", showgrid=True, gridcolor="#e2e8f0",
                               range=[0, _max_t * 1.02]),
                    yaxis=dict(title="Cost (Rs / tCO₂e)",
                               color="#1e293b", showgrid=True, gridcolor="#e2e8f0",
                               zeroline=True, zerolinecolor="#64748b", zerolinewidth=2),
                    shapes=[dict(type="line", x0=0, x1=_max_t, y0=0, y1=0,
                                 line=dict(color="#ef4444", width=2, dash="dash"))],
                    legend=dict(orientation="h", y=-0.22, font=dict(color="#1e293b")),
                    barmode="overlay",   # each trace is individually positioned
                    height=460,
                    margin=dict(t=56, b=80, l=60, r=20),
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    font=dict(color="#1e293b"),
                )
                st.plotly_chart(fig_mac, use_container_width=True, key="p08initi_plt_1")

                _total_red  = float(df_mac["reduction"].sum())
                _cost_saves = float(df_mac[df_mac["cost_per_t"] <= 0]["reduction"].sum())
                sc1, sc2, sc3 = st.columns(3)
                sc1.metric("Total potential", f"{_total_red:,.1f} tCO2e/yr")
                sc2.metric("Cost-saving portion", f"{_cost_saves:,.1f} tCO2e/yr")
                sc3.metric("Initiatives on curve", str(len(df_mac)))

            except ImportError:
                st.info("Install plotly and pandas for MAC chart.")

    with _ini_tab3:
        st.markdown("#### 💡 Recommended initiatives")
        st.caption(
            "Personalised from your inventory data — with why, how, "
            "profitability impact, assumptions, and validated methodology."
        )
        _inventory_obj = st.session_state.get("inventory")
        if _inventory_obj:
            try:
                from streamlit_app.recommendations import inventory_recommendations
                _suggestions = inventory_recommendations(profile, _inventory_obj)
            except Exception:
                _suggestions = _risk_based_recommendations(profile, _inventory_obj)
            _prio_icons = {"High": "🔴", "Medium": "🟡", "Low": "🟢"}
            for _sug in _suggestions:
                _picon = _prio_icons.get(_sug.get("priority", ""), "⚪")
                _sug_scope = _sug.get("scope", "")
                _sug_name = _sug.get("name", "")
                with st.expander(
                    f"{_picon} **{_sug_name}** — {_sug_scope}",
                    expanded=False,
                ):
                    # Why
                    st.markdown("**Why this is recommended:**")
                    st.write(_sug.get("why", _sug.get("rationale", "")))
                    # How
                    if _sug.get("how"):
                        st.markdown("**How to implement:**")
                        st.info(_sug["how"])
                    # Impact metrics
                    _rc1, _rc2, _rc3, _rc4 = st.columns(4)
                    if _sug.get("target_tco2e"):
                        _rc1.metric(
                            "Potential saving",
                            f"{_sug['target_tco2e']:,.1f} tCO₂e/yr",
                        )
                    if _sug.get("payback"):
                        _rc2.metric("Payback period", _sug["payback"])
                    _rc3.metric("Priority", _sug.get("priority", "—"))
                    _rc4.metric("Category", _sug.get("category", "—"))
                    # Profitability business case
                    if _sug.get("profitability"):
                        st.success("**Business case:** " + _sug["profitability"])
                    # Assumptions + methodology
                    with st.expander("Assumptions & methodology", expanded=False):
                        if _sug.get("assumptions"):
                            st.caption("**Assumptions:** " + _sug["assumptions"])
                        if _sug.get("methodology"):
                            st.caption(
                                "**Validated methodology:** " + _sug["methodology"]
                            )
                    # Add to list
                    _btn_key = (
                        "add_sug_"
                        + _sug_name[:30].replace(" ", "_").replace("/", "_")
                    )
                    if st.button("➕ Add to initiatives list", key=_btn_key):
                        import uuid as _uuid
                        _new_ini = {
                            "id":             str(_uuid.uuid4()),
                            "name":           _sug_name,
                            "category":       _sug.get("category", "Other"),
                            "scope":          _sug_scope,
                            "status":         "Planned",
                            "target_year":    profile.get("reporting_year", 2024) + 3,
                            "target_tco2e":   _sug.get("target_tco2e") or 0.0,
                            "achieved_tco2e": 0.0,
                            "capex_lakh_inr": 0.0,
                            "owner":          "",
                            "description":    _sug.get("why", _sug.get("rationale", "")),
                        }
                        _ini_list = _load(profile)
                        _ini_list.append(_new_ini)
                        _save(profile, _ini_list)
                        st.toast(f"Added: {_sug_name}", icon="✅")
                        st.rerun()
        else:
            st.info(
                "Complete ⚙️ Setup and save inventory data "
                "to see personalised recommendations."
            )




# ---------------------------------------------------------------------------
# Risk-based recommendations + CSV template helpers
# ---------------------------------------------------------------------------

def _risk_based_recommendations(profile: dict, inventory) -> list[dict]:
    """Auto-generate initiative suggestions from inventory data + industry."""
    suggestions = []
    industry = profile.get("industry", "")

    try:
        org_id   = profile.get("org_uuid") or profile.get("org_id") or "default"
        inv_year = profile.get("reporting_year", 2024)
        all_rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
        total_t  = sum(float(r.get("t_CO2e") or 0) for r in all_rows)
        scope_t  = {}
        for r in all_rows:
            sc = r.get("scope", "Unknown")
            scope_t[sc] = scope_t.get(sc, 0) + float(r.get("t_CO2e") or 0)

        s1 = scope_t.get("Scope 1", 0)
        s2 = scope_t.get("Scope 2", 0)
        s3 = scope_t.get("Scope 3", 0)

        if total_t > 0:
            if s2 / total_t > 0.25:
                suggestions.append({
                    "name": "Renewable electricity — rooftop solar / PPA",
                    "category": "Renewable energy",
                    "scope": "Scope 2",
                    "rationale": (
                        f"Scope 2 = {s2:,.0f} tCO\u2082e ({s2/total_t*100:.0f}% of total). "
                        "Solar PPA or rooftop solar eliminates grid emissions and locks in low tariff."
                    ),
                    "target_tco2e": round(s2 * 0.75, 1),
                    "capex_lakh_inr": round(s2 * 2.2, 0),
                    "status": "Planned",
                    "priority": "High",
                })
            if s1 / total_t > 0.20:
                suggestions.append({
                    "name": "Fuel switch: diesel \u2192 CNG / biogas",
                    "category": "Fuel switching",
                    "scope": "Scope 1",
                    "rationale": (
                        f"Scope 1 = {s1:,.0f} tCO\u2082e ({s1/total_t*100:.0f}% of total). "
                        "CNG saves ~25\u201335% vs diesel. Biogas can be near-zero."
                    ),
                    "target_tco2e": round(s1 * 0.3, 1),
                    "capex_lakh_inr": round(s1 * 1.5, 0),
                    "status": "Planned",
                    "priority": "High",
                })
            if s3 / total_t > 0.40:
                suggestions.append({
                    "name": "Supplier engagement & Cat 1 reduction programme",
                    "category": "Supply chain",
                    "scope": "Scope 3",
                    "rationale": (
                        f"Scope 3 = {s3:,.0f} tCO\u2082e ({s3/total_t*100:.0f}% of total). "
                        "Cat 1 purchased goods is typically 60\u201380% of S3. "
                        "Engage top 10 suppliers for GHG data + reduction targets."
                    ),
                    "target_tco2e": round(s3 * 0.15, 1),
                    "capex_lakh_inr": None,
                    "status": "Planned",
                    "priority": "High",
                })

        # Energy efficiency — always relevant
        suggestions.append({
            "name": "LED lighting retrofit across all facilities",
            "category": "Energy efficiency",
            "scope": "Scope 2",
            "rationale": (
                "LED retrofit saves 50\u201370% of lighting energy. Payback typically 2\u20134 years. "
                "Low CapEx, no operational disruption."
            ),
            "target_tco2e": None,
            "capex_lakh_inr": None,
            "status": "Planned",
            "priority": "Medium",
        })
    except Exception:
        pass

    # Industry-specific
    IND = {
        "Manufacturing": [
            ("Waste heat recovery", "Energy efficiency", "Scope 1",
             "Capture process exhaust heat to pre-heat inputs. Typical: 15\u201325% fuel reduction."),
            ("VFDs on pumps, fans, compressors", "Energy efficiency", "Scope 2",
             "Variable frequency drives save 20\u201360% motor electricity. High ROI."),
        ],
        "Logistics": [
            ("Modal shift \u2014 road to rail", "Transport", "Scope 1",
             "Rail: 0.029 kgCO\u2082e/t\u00b7km vs road 0.096. 70% saving on long-haul routes."),
            ("Fleet electrification (LCV/MCV)", "Fuel switching", "Scope 1",
             "EVs: zero tailpipe, Scope 2 increases but net saving 40\u201370%."),
        ],
        "Financial": [
            ("Portfolio decarbonisation target (PCAF-aligned)", "Supply chain", "Scope 3",
             "Set Cat 15 financed emission reduction target aligned with IPCC 1.5\u00b0C pathway."),
        ],
        "Retail": [
            ("Supplier Code of Conduct + GHG disclosure requirement", "Supply chain", "Scope 3",
             "Cat 1 typically 60\u201380% of retail footprint. Require Tier 1 GHG disclosure."),
        ],
        "Real Estate": [
            ("Green building retrofit (LEED/IGBC)", "Energy efficiency", "Scope 2",
             "HVAC/lighting/BMS upgrades in owned buildings. EPC improvement of 2+ grades."),
        ],
    }
    for kw, ini_list in IND.items():
        if kw.lower() in industry.lower():
            for name, cat, scope, rationale in ini_list:
                suggestions.append({
                    "name": name, "category": cat, "scope": scope,
                    "rationale": rationale,
                    "target_tco2e": None, "capex_lakh_inr": None,
                    "status": "Planned", "priority": "Medium",
                })

    # SBTi always
    suggestions.append({
        "name": "Set Science-Based Target (SBTi near-term + net-zero)",
        "category": "Governance",
        "scope": "All scopes",
        "rationale": (
            "SBTi-validated targets signal 1.5\u00b0C alignment to investors and customers. "
            "Near-term: 42% absolute S1+S2+S3 reduction by 2030 vs 2019 (1.5\u00b0C). "
            "Net-zero: 90% by 2050 + residuals offset."
        ),
        "target_tco2e": None, "capex_lakh_inr": None,
        "status": "Planned", "priority": "High",
    })

    return suggestions


def _initiatives_template_csv() -> bytes:
    """Return CSV bytes for bulk initiative upload."""
    import io, csv
    buf = io.StringIO()
    w   = csv.writer(buf)
    w.writerow([
        "name", "category", "scope", "status", "target_year",
        "target_tco2e", "achieved_tco2e", "capex_lakh_inr", "owner", "description",
    ])
    w.writerow([
        "LED lighting retrofit", "Energy efficiency", "Scope 2",
        "In progress", 2025, 120.5, 45.0, 8.0, "Facilities",
        "Replace all T8 tube lights with LED across all plants.",
    ])
    w.writerow([
        "Rooftop solar 1 MW", "Renewable energy", "Scope 2",
        "Planned", 2026, 1200.0, 0.0, 85.0, "Energy team",
        "1 MW rooftop solar at Pune plant.",
    ])
    w.writerow([
        "Fuel switch diesel to CNG — HGV fleet", "Fuel switching", "Scope 1",
        "Planned", 2025, 380.0, 0.0, 45.0, "Fleet manager",
        "Convert 12 HGVs to CNG. Payback 3.5 years.",
    ])
    return buf.getvalue().encode("utf-8")
