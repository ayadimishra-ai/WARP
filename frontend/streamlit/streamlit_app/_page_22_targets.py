"""
Page 22 — Target Register.

Covers:
  - SBTi near-term targets (2030 horizon, 42% S1+2 reduction for 1.5°C)
  - SBTi net-zero targets (2050, 90% absolute reduction + neutralisation)
  - Custom absolute reduction targets (tCO2e)
  - Custom intensity targets (tCO2e / INR Cr revenue, tCO2e / unit)
  - Non-GHG ESG targets (water, waste, diversity, H&S)

ESRS MDR-T, CDP C9, TCFD Metrics, IFRS S2, BRSR P6 all read from this register.
India primary — intensity per INR Cr turnover (BRSR requirement).
EU secondary — SBTi alignment for ESRS E1-3.

All targets are stored in esg_store.targets with a UNIQUE approach per org.
Progress is auto-computed from:
  - GHG targets: live from inventory.sqlite
  - ESG targets: from esg_store.esg_datapoints
"""
from __future__ import annotations
import json
import sqlite3
import streamlit as st
from datetime import datetime, timezone
from pathlib import Path


# ── Predefined target templates ──────────────────────────────────────────
SBTI_NEAR_TERM = {
    "target_name": "SBTi Near-term — Scope 1+2 (1.5°C pathway)",
    "topic": "Climate",
    "metric_description": "Absolute Scope 1 + Scope 2 (market-based) reduction from base year",
    "metric_unit": "tCO2e",
    "target_type": "Absolute",
    "target_year": 2030,
    "reduction_pct": 42.0,
    "sbti_aligned": True,
    "frameworks": ["ESRS", "CDP", "SBTi", "BRSR", "TCFD", "IFRS_S2"],
    "notes": "SBTi 1.5°C pathway: 42% absolute reduction in S1+2 by 2030 from base year.",
}
SBTI_NET_ZERO = {
    "target_name": "SBTi Net-zero — Scope 1+2+3",
    "topic": "Climate",
    "metric_description": "90%+ absolute reduction across all scopes; residuals neutralised",
    "metric_unit": "tCO2e",
    "target_type": "Absolute",
    "target_year": 2050,
    "reduction_pct": 90.0,
    "sbti_aligned": True,
    "frameworks": ["ESRS", "CDP", "SBTi", "TCFD", "IFRS_S2"],
    "notes": "SBTi Corporate Net-Zero Standard: ≥90% reduction by 2050; remainder neutralised.",
}

TARGET_TYPES    = ["Absolute (tCO2e)", "Intensity (tCO2e/INR Cr)", "Intensity (tCO2e/unit)", "% reduction", "Other"]
SBTI_STATUSES   = ["Not started", "Committed", "Submitted", "Validated", "Achieved"]
TOPIC_OPTS      = ["Climate", "Energy", "Water", "Waste", "Biodiversity", "Own Workforce",
                   "Value Chain", "Diversity & Inclusion", "Health & Safety", "Business Conduct"]
FRAMEWORK_OPTS  = ["ESRS", "GRI", "BRSR", "CDP", "TCFD", "IFRS S2", "SBTi", "SASB"]
ON_TRACK_OPTS   = ["On track", "At risk", "Off track", "Achieved", "Not yet assessed"]


def _conn() -> sqlite3.Connection:
    db = Path(__file__).parents[1] / "data" / "esg_store.sqlite"
    c = sqlite3.connect(str(db), check_same_thread=False)
    c.row_factory = sqlite3.Row
    return c


def _load_targets(conn, org_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM targets WHERE org_id=? ORDER BY topic, target_year",
        (org_id,)
    ).fetchall()
    return [dict(r) for r in rows]


def _save_target(conn, org_id: str, data: dict) -> str:
    now = datetime.now(timezone.utc).isoformat()
    tid = data.get("target_id") or ""
    fws = json.dumps(data.get("frameworks", []))

    if tid:
        conn.execute("""
            UPDATE targets SET target_name=?, topic=?, metric_description=?,
              metric_unit=?, base_year=?, base_value=?, target_year=?, target_value=?,
              target_type=?, sbti_aligned=?, sbti_status=?, current_value=?,
              current_year=?, on_track=?, frameworks=?, updated_at=?
            WHERE target_id=? AND org_id=?
        """, (data["target_name"], data["topic"], data["metric_description"],
              data["metric_unit"], data.get("base_year"), data.get("base_value"),
              data["target_year"], data.get("target_value"),
              data["target_type"], int(data.get("sbti_aligned", 0)),
              data.get("sbti_status",""), data.get("current_value"),
              data.get("current_year"), data.get("on_track","Not yet assessed"),
              fws, now, tid, org_id))
    else:
        import uuid
        tid = str(uuid.uuid4()).replace("-","")[:16]
        conn.execute("""
            INSERT INTO targets (target_id, org_id, dp_id, target_name, topic,
              metric_description, metric_unit, base_year, base_value,
              target_year, target_value, target_type, sbti_aligned, sbti_status,
              current_value, current_year, on_track, frameworks, created_at, updated_at)
            VALUES (?,?,'ESRS-MDR-T',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (tid, org_id, data["target_name"], data["topic"],
              data["metric_description"], data["metric_unit"],
              data.get("base_year"), data.get("base_value"),
              data["target_year"], data.get("target_value"),
              data["target_type"], int(data.get("sbti_aligned", 0)),
              data.get("sbti_status",""), data.get("current_value"),
              data.get("current_year"), data.get("on_track","Not yet assessed"),
              fws, now, now))
    conn.commit()
    return tid


def _delete_target(conn, target_id: str, org_id: str) -> None:
    conn.execute("DELETE FROM targets WHERE target_id=? AND org_id=?", (target_id, org_id))
    conn.commit()


def _get_ghg_progress(inventory, org_id: str, base_year: int, base_scope: str) -> dict:
    """Compute actual GHG vs target from inventory."""
    result = {}
    for year in range(base_year, datetime.now().year + 1):
        try:
            s = inventory.get_summary(org_id=org_id, inventory_year=year)
            total = 0.0
            if "1+2" in base_scope or "all" in base_scope.lower():
                total = float(s.get("scope1_t_co2e") or 0) + float(s.get("scope2_t_co2e") or 0)
            elif "Scope 1" in base_scope:
                total = float(s.get("scope1_t_co2e") or 0)
            elif "Scope 2" in base_scope:
                total = float(s.get("scope2_t_co2e") or 0)
            elif "Scope 3" in base_scope:
                total = float(s.get("scope3_t_co2e") or 0)
            else:
                total = (float(s.get("scope1_t_co2e") or 0)
                         + float(s.get("scope2_t_co2e") or 0)
                         + float(s.get("scope3_t_co2e") or 0))
            if s.get("n_records", 0) > 0:
                result[year] = round(total, 1)
        except Exception:
            pass
    return result


def render() -> None:
    st.title("🎯 Target Register")
    st.caption(
        "Set and track SBTi-aligned and custom reduction targets. "
        "GHG progress auto-populated from inventory. "
        "Feeds ESRS E1-3, MDR-T, CDP C9, TCFD Metrics, IFRS S2, BRSR P6."
    )

    from streamlit_app._org_helper import fix_page
    profile  = st.session_state.get("org_profile", {})
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Complete ⚙️ Setup first.")
        return

    profile  = dict(profile)
    inv_year = profile.get("reporting_year", 2024)
    org_name = profile.get("org_name", org_id)
    revenue  = float(profile.get("revenue_inr_cr") or 0)
    _is_light = st.session_state.get("_sk_theme", "light") == "light"

    conn    = _conn()
    targets = _load_targets(conn, org_id)

    # ── Summary metrics ───────────────────────────────────────────────────
    n_total   = len(targets)
    n_sbti    = sum(1 for t in targets if t.get("sbti_aligned"))
    n_climate = sum(1 for t in targets if t.get("topic") == "Climate")
    n_track   = sum(1 for t in targets if t.get("on_track") == "On track")

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total targets", n_total)
    m2.metric("SBTi-aligned", n_sbti)
    m3.metric("Climate targets", n_climate)
    m4.metric("On track", n_track)

    # GHG context
    try:
        s = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
        s1 = float(s.get("scope1_t_co2e") or 0)
        s2 = float(s.get("scope2_t_co2e") or 0)
        s3 = float(s.get("scope3_t_co2e") or 0)
        st.caption(
            f"Current inventory ({inv_year}): "
            f"**S1** {s1:,.1f} · **S2** {s2:,.1f} · **S3** {s3:,.1f} tCO₂e · "
            f"**Total** {s1+s2+s3:,.1f} tCO₂e"
            + (f" · Revenue ₹{revenue:,.1f} Cr" if revenue else "")
        )
    except Exception:
        pass

    st.markdown("---")
    tab_list, tab_add, tab_sbti, tab_trajectory = st.tabs([
        "📋 Target register",
        "➕ Add target",
        "🏆 SBTi quick-set",
        "📈 Trajectory chart",
    ])

    # ══════════════════════════════════════════════════════════════════════
    # TAB 1 — TARGET LIST
    # ══════════════════════════════════════════════════════════════════════
    with tab_list:
        if not targets:
            st.info("No targets set yet. Use **Add target** or **SBTi quick-set** to begin.")
        else:
            filt_topic = st.selectbox("Filter by topic", ["All"] + TOPIC_OPTS, key="tgt_filt")
            show = [t for t in targets if filt_topic == "All" or t["topic"] == filt_topic]
            for tgt in show:
                sbti_badge = " 🏆 SBTi" if tgt.get("sbti_aligned") else ""
                ot = tgt.get("on_track","?")
                ot_icon = {"On track":"✅","At risk":"🟡","Off track":"🔴","Achieved":"🏅"}.get(ot,"○")
                base_v = tgt.get("base_value")
                tgt_v  = tgt.get("target_value")
                curr_v = tgt.get("current_value")

                # Auto-compute progress for GHG targets
                progress_pct = None
                if base_v and tgt_v and curr_v:
                    if base_v != tgt_v:
                        progress_pct = (base_v - curr_v) / (base_v - tgt_v) * 100

                with st.expander(
                    f"{ot_icon} **{tgt['target_name']}**{sbti_badge}  "
                    f"· {tgt['topic']} · {tgt.get('target_year','')}",
                    expanded=False,
                ):
                    c1, c2, c3 = st.columns(3)
                    c1.markdown(f"**Type:** {tgt.get('target_type','')}")
                    c1.markdown(f"**Metric:** {tgt.get('metric_description','')[:60]}")
                    c1.markdown(f"**Unit:** {tgt.get('metric_unit','')}")

                    c2.metric("Base year value",
                              f"{base_v:,.1f} {tgt.get('metric_unit','')}" if base_v else "—",
                              help=f"Base year: {tgt.get('base_year','?')}")
                    c2.metric("Target value",
                              f"{tgt_v:,.1f} {tgt.get('metric_unit','')}" if tgt_v else "—",
                              help=f"Target year: {tgt.get('target_year','?')}")
                    c2.metric("Current value",
                              f"{curr_v:,.1f} {tgt.get('metric_unit','')}" if curr_v else "—")

                    with c3:
                        if progress_pct is not None:
                            st.metric("Progress", f"{progress_pct:.1f}%")
                            st.progress(min(1.0, max(0.0, progress_pct / 100)))
                        sbti_st = tgt.get("sbti_status","")
                        if sbti_st:
                            st.markdown(f"**SBTi status:** {sbti_st}")
                        try:
                            fws = json.loads(tgt.get("frameworks","[]"))
                            if fws:
                                st.caption("Frameworks: " + " · ".join(fws))
                        except Exception:
                            pass

                    # Inline update
                    with st.expander("✏️ Update progress", expanded=False):
                        up1, up2, up3 = st.columns(3)
                        new_curr = up1.number_input(
                            f"Current value ({tgt.get('metric_unit','')})",
                            value=float(curr_v or base_v or 0),
                            format="%.2f", key=f"curr_{tgt['target_id']}"
                        )
                        new_ot = up2.selectbox("On track?", ON_TRACK_OPTS,
                            index=ON_TRACK_OPTS.index(ot) if ot in ON_TRACK_OPTS else 4,
                            key=f"ot_{tgt['target_id']}")
                        new_sbti = up3.selectbox("SBTi status", SBTI_STATUSES,
                            index=SBTI_STATUSES.index(tgt.get("sbti_status","Not started"))
                            if tgt.get("sbti_status","Not started") in SBTI_STATUSES else 0,
                            key=f"sbti_{tgt['target_id']}")
                        uc1, uc2 = st.columns(2)
                        if uc1.button("💾 Update", key=f"upd_{tgt['target_id']}"):
                            upd = dict(tgt)
                            upd["current_value"] = float(new_curr)
                            upd["current_year"] = inv_year
                            upd["on_track"] = new_ot
                            upd["sbti_status"] = new_sbti
                            _save_target(conn, org_id, upd)
                            st.success("✅ Updated")
                            st.rerun()
                        if uc2.button("🗑️ Delete", key=f"del_{tgt['target_id']}",
                                      type="secondary"):
                            _delete_target(conn, tgt["target_id"], org_id)
                            st.rerun()

    # ══════════════════════════════════════════════════════════════════════
    # TAB 2 — ADD TARGET
    # ══════════════════════════════════════════════════════════════════════
    with tab_add:
        st.markdown("### Add a new target")
        ac1, ac2 = st.columns(2)
        tgt_name = ac1.text_input("Target name *",
                                   placeholder="Scope 1+2 absolute reduction 2030",
                                   key="new_tgt_name")
        tgt_topic = ac2.selectbox("Topic *", TOPIC_OPTS, key="new_tgt_topic")

        ac3, ac4 = st.columns(2)
        tgt_type = ac3.selectbox("Target type *", TARGET_TYPES, key="new_tgt_type")
        tgt_unit = ac4.text_input("Unit", placeholder="tCO2e / INR Cr / headcount",
                                   key="new_tgt_unit")

        tgt_desc = st.text_area("Metric description",
                                 placeholder="What is being reduced/improved and how measured?",
                                 key="new_tgt_desc", height=60)

        bc1, bc2, bc3, bc4 = st.columns(4)
        tgt_base_yr   = bc1.number_input("Base year", 2015, 2030, inv_year - 1, key="new_base_yr")
        tgt_base_val  = bc2.number_input("Base year value", min_value=0.0, format="%.2f",
                                          key="new_base_val")
        tgt_tgt_yr    = bc3.number_input("Target year", 2025, 2060, 2030, key="new_tgt_yr")
        tgt_tgt_val   = bc4.number_input("Target value", min_value=0.0, format="%.2f",
                                          key="new_tgt_val")

        dc1, dc2 = st.columns(2)
        tgt_sbti      = dc1.toggle("SBTi-aligned", key="new_sbti")
        tgt_sbti_st   = dc2.selectbox("SBTi status", SBTI_STATUSES, key="new_sbti_st",
                                       disabled=not tgt_sbti)
        tgt_fws = st.multiselect("Frameworks", FRAMEWORK_OPTS,
                                  default=["ESRS","BRSR","CDP"], key="new_fws")

        if st.button("💾 Save target", key="save_new_tgt", type="primary",
                     use_container_width=True):
            if not tgt_name.strip():
                st.error("Target name is required.")
            else:
                _save_target(conn, org_id, {
                    "target_name": tgt_name.strip(),
                    "topic": tgt_topic,
                    "metric_description": tgt_desc.strip(),
                    "metric_unit": tgt_unit.strip(),
                    "target_type": tgt_type,
                    "base_year": int(tgt_base_yr),
                    "base_value": float(tgt_base_val),
                    "target_year": int(tgt_tgt_yr),
                    "target_value": float(tgt_tgt_val),
                    "sbti_aligned": tgt_sbti,
                    "sbti_status": tgt_sbti_st if tgt_sbti else "",
                    "on_track": "Not yet assessed",
                    "frameworks": tgt_fws,
                })
                st.success(f"✅ Target saved: {tgt_name}")
                st.rerun()

    # ══════════════════════════════════════════════════════════════════════
    # TAB 3 — SBTi QUICK-SET
    # ══════════════════════════════════════════════════════════════════════
    with tab_sbti:
        st.markdown("### SBTi quick-set")
        st.caption(
            "Pre-populate SBTi-aligned targets using your inventory base year data. "
            "Near-term: 42% S1+2 reduction by 2030 (1.5°C). "
            "Net-zero: 90% all-scope reduction by 2050."
        )

        # Get base year inventory
        try:
            base_yr_sel = st.number_input("Base year for SBTi targets",
                                           2015, 2024, inv_year - 1, key="sbti_base_yr")
            sb = inventory.get_summary(org_id=org_id, inventory_year=int(base_yr_sel))
            s1b = float(sb.get("scope1_t_co2e") or 0)
            s2b = float(sb.get("scope2_t_co2e") or 0)
            s3b = float(sb.get("scope3_t_co2e") or 0)
            s12b = s1b + s2b

            st.markdown(f"**Base year {int(base_yr_sel)} inventory:**")
            sq1, sq2, sq3, sq4 = st.columns(4)
            sq1.metric("Scope 1", f"{s1b:,.1f} tCO₂e")
            sq2.metric("Scope 2", f"{s2b:,.1f} tCO₂e")
            sq3.metric("S1+2", f"{s12b:,.1f} tCO₂e")
            sq4.metric("Scope 3", f"{s3b:,.1f} tCO₂e")

            # Near-term target
            nt_target = s12b * (1 - 0.42)
            st.markdown("---")
            st.markdown(f"**SBTi near-term (1.5°C):** reduce S1+2 by 42% → "
                        f"**{nt_target:,.1f} tCO₂e by 2030**")
            if st.button("➕ Add SBTi near-term target", key="add_nt"):
                _save_target(conn, org_id, {
                    **SBTI_NEAR_TERM,
                    "base_year": int(base_yr_sel),
                    "base_value": round(s12b, 1),
                    "target_value": round(nt_target, 1),
                    "sbti_status": "Committed",
                    "on_track": "Not yet assessed",
                })
                st.success("✅ SBTi near-term target added")
                st.rerun()

            # Net-zero target
            nz_target_s12 = s12b * 0.10
            nz_target_all = (s1b + s2b + s3b) * 0.10
            st.markdown("---")
            st.markdown(f"**SBTi net-zero (2050):** 90% reduction all scopes → "
                        f"**{nz_target_all:,.1f} tCO₂e by 2050** (residuals neutralised)")
            if st.button("➕ Add SBTi net-zero target", key="add_nz"):
                _save_target(conn, org_id, {
                    **SBTI_NET_ZERO,
                    "base_year": int(base_yr_sel),
                    "base_value": round(s1b + s2b + s3b, 1),
                    "target_value": round(nz_target_all, 1),
                    "sbti_status": "Committed",
                    "on_track": "Not yet assessed",
                })
                st.success("✅ SBTi net-zero target added")
                st.rerun()

            # BRSR intensity target
            if revenue > 0:
                intensity_base = s12b / revenue
                intensity_tgt  = intensity_base * 0.70  # 30% intensity reduction by 2030
                st.markdown("---")
                st.markdown(f"**BRSR P6 intensity (India):** "
                            f"base = {intensity_base:.3f} tCO₂e/INR Cr → "
                            f"30% reduction → **{intensity_tgt:.3f} by 2030**")
                if st.button("➕ Add BRSR intensity target", key="add_brsr"):
                    _save_target(conn, org_id, {
                        "target_name": "BRSR P6 — GHG intensity reduction 2030",
                        "topic": "Climate",
                        "metric_description": "tCO2e per INR Cr revenue (Scope 1+2)",
                        "metric_unit": "tCO2e/INR Cr",
                        "target_type": "Intensity (tCO2e/INR Cr)",
                        "base_year": int(base_yr_sel),
                        "base_value": round(intensity_base, 4),
                        "target_year": 2030,
                        "target_value": round(intensity_tgt, 4),
                        "sbti_aligned": False,
                        "sbti_status": "",
                        "on_track": "Not yet assessed",
                        "frameworks": ["BRSR", "ESRS"],
                    })
                    st.success("✅ BRSR intensity target added")
                    st.rerun()
        except Exception as ex:
            st.info(f"Could not load inventory data for base year: {ex}")

    # ══════════════════════════════════════════════════════════════════════
    # TAB 4 — TRAJECTORY CHART
    # ══════════════════════════════════════════════════════════════════════
    with tab_trajectory:
        st.markdown("### GHG reduction trajectory")
        st.caption("Actual inventory vs target pathway. Blue = actual, red dashed = target.")
        climate_targets = [t for t in targets if t.get("topic") == "Climate"]
        if not climate_targets:
            st.info("No climate targets set yet.")
        else:
            try:
                import plotly.graph_objects as go

                # Load initiatives for overlay
                try:
                    from streamlit_app._initiatives_store import initiatives_summary
                    _ini_sum_t = initiatives_summary(org_id)
                    _ini_achieved  = _ini_sum_t["completed_tco2e"]
                    _ini_total     = _ini_sum_t["total_potential_tco2e"]
                    _n_initiatives = _ini_sum_t["n_total"]
                except Exception:
                    _ini_achieved = _ini_total = 0.0; _n_initiatives = 0

                fig = go.Figure()
                colors = ["#dc2626","#d97706","#16a34a","#0284c7","#7c3aed"]

                for i, tgt in enumerate(climate_targets):
                    base_yr  = tgt.get("base_year")
                    base_val = tgt.get("base_value")
                    tgt_yr   = tgt.get("target_year")
                    tgt_val  = tgt.get("target_value")
                    col      = colors[i % len(colors)]

                    if base_yr and base_val and tgt_yr and tgt_val:
                        # Target line (straight)
                        fig.add_trace(go.Scatter(
                            x=[base_yr, tgt_yr], y=[base_val, tgt_val],
                            mode="lines", name=f"{tgt['target_name'][:30]} (target)",
                            line=dict(color=col, dash="dash", width=2),
                        ))

                # Actual inventory trajectory
                progress = _get_ghg_progress(
                    inventory, org_id,
                    min((t.get("base_year") or inv_year - 1 for t in climate_targets),
                        default=inv_year - 1),
                    "S1+2",
                )
                if progress:
                    fig.add_trace(go.Scatter(
                        x=list(progress.keys()), y=list(progress.values()),
                        mode="lines+markers", name="Actual S1+2 (inventory)",
                        line=dict(color="#1d4ed8", width=3),
                        marker=dict(size=8),
                    ))

                # Initiative overlay: show net trajectory if initiatives deliver
                if _n_initiatives > 0 and progress:
                    _last_yr   = max(progress.keys())
                    _last_val  = progress[_last_yr]
                    _net_after = max(0, _last_val - _ini_achieved)
                    _net_full  = max(0, _last_val - _ini_total)
                    fig.add_trace(go.Scatter(
                        x=[_last_yr, _last_yr + 5],
                        y=[_net_after, _net_full],
                        mode="lines+markers",
                        name=f"Net after initiatives ({_n_initiatives} projects)",
                        line=dict(color="#16a34a", width=2, dash="dot"),
                        marker=dict(size=8, symbol="diamond"),
                    ))

                fig.update_layout(
                    xaxis=dict(title="Year", dtick=1),
                    yaxis=dict(title="tCO₂e"),
                    height=420,
                    legend=dict(orientation="h", y=-0.25),
                    plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
                    margin=dict(t=10, b=60),
                )
                st.plotly_chart(fig, use_container_width=True, key="tgt_traj_plot")
            except ImportError:
                st.info("Install plotly for trajectory chart.")

        # Export
        try:
            import pandas as pd
            if targets:
                df = pd.DataFrame(targets)
                st.download_button(
                    "⬇️ Download target register (.csv)",
                    df.to_csv(index=False),
                    file_name=f"target_register_{org_id[:10]}_{inv_year}.csv",
                    mime="text/csv",
                )
        except ImportError:
            pass

    conn.close()
