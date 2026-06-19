"""
Page 07 — Data Manager.

Every saved emission record in one place:
  - Live summary metrics (always reflects latest state)
  - Filter by scope / search text / sort
  - Expand any record to see full details + audit trace
  - Edit quantity inline → engine recalculates → saves → dashboard updates
  - Delete single record
  - Bulk delete all filtered records
  - All mutations call st.rerun() so changes propagate immediately
"""
from __future__ import annotations
import streamlit as st


def render():
    st.title("📋 Data Manager")

    profile = st.session_state.org_profile
    conn    = st.session_state.ef_conn

    # ── Resolve org_id + inventory from auth user first (no session timing dep) ──
    from streamlit_app._org_helper import fix_page
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Please log in first.")
        return

    # Ensure profile has setup_done and correct org fields
    if not profile.get("setup_done"):
        try:
            import json as _j
            from pathlib import Path as _P
            _pf = _P(__file__).parents[1] / "data" / "org_profiles.json"
            _all = _j.loads(_pf.read_text(encoding="utf-8"))
            if org_id in _all:
                _loaded = dict(_all[org_id])
                _loaded["org_uuid"] = org_id
                _loaded["setup_done"] = True
                profile = _loaded
                st.session_state.org_profile.update(profile)
        except Exception:
            pass
    if not profile.get("setup_done"):
        st.warning("Complete ⚙️ Setup first.")
        return

    profile = dict(profile)
    profile["org_uuid"] = org_id
    profile["org_id"]   = org_id

    # ── Multi-year selector (via inventory store) ──────────────────────────
    _base_year = int(profile.get("reporting_year", 2024))
    try:
        _yr_rows = inventory._db.execute(
            "SELECT DISTINCT inventory_year FROM emission_results "
            "WHERE org_id=? ORDER BY inventory_year DESC", (org_id,)
        ).fetchall()
        _available_years = [r[0] for r in _yr_rows] if _yr_rows else [_base_year]
        if _base_year not in _available_years:
            _available_years.insert(0, _base_year)
    except Exception:
        _available_years = [_base_year]

    if len(_available_years) > 1:
        _yr_col, _ = st.columns([2, 5])
        inv_year = _yr_col.selectbox(
            "📅 Viewing year", _available_years, index=0,
            key="inv_mgr_year",
            help="Browse records from any year with data.",
        )
    else:
        inv_year = _base_year

    # ── Live summary (direct DB query) ────────────────────────────────────
    s = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    n_rec = s.get("n_records", 0)

    col = st.columns(5)
    col[0].metric("Records",      n_rec)
    col[1].metric("Total tCO₂e",  f"{s.get('total_t_co2e',0):,.4f}")
    col[2].metric("Scope 1",      f"{s.get('scope1_t_co2e',0):,.4f}")
    col[3].metric("Scope 2",      f"{s.get('scope2_t_co2e',0):,.4f}")
    col[4].metric("Scope 3",      f"{s.get('scope3_t_co2e',0):,.4f}")

    # ── Visual scope breakdown ────────────────────────────────────────────
    if n_rec > 0:
        try:
            import plotly.graph_objects as go
            _s1v = s.get('scope1_t_co2e', 0) or 0
            _s2v = s.get('scope2_t_co2e', 0) or 0
            _s3v = s.get('scope3_t_co2e', 0) or 0
            _tot = _s1v + _s2v + _s3v
            _bc1, _bc2 = st.columns([2, 1])
            with _bc1:
                _fig_bar = go.Figure(go.Bar(
                    x=["Scope 1", "Scope 2", "Scope 3"],
                    y=[_s1v, _s2v, _s3v],
                    marker_color=["#f97316", "#3b82f6", "#8b5cf6"],
                    text=[f"{v:,.0f} t" for v in [_s1v, _s2v, _s3v]],
                    textposition="outside",
                    textfont=dict(size=12, color="#1e293b"),
                ))
                _fig_bar.update_layout(
                    title=dict(text=f"Scope breakdown — {inv_year}", font=dict(size=13, color="#1e293b"), x=0.02),
                    height=260, margin=dict(t=48, b=32, l=16, r=16),
                    yaxis_title="tCO₂e",
                    yaxis=dict(gridcolor="#e2e8f0", color="#1e293b", tickfont=dict(color="#1e293b")),
                    xaxis=dict(color="#1e293b", tickfont=dict(size=13, color="#1e293b")),
                    showlegend=False,
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                    font=dict(color="#1e293b"),
                )
                st.plotly_chart(_fig_bar, use_container_width=True, key="inv_scope_bar")
            with _bc2:
                if _tot > 0:
                    _fig_pie = go.Figure(go.Pie(
                        labels=["Scope 1", "Scope 2", "Scope 3"],
                        values=[_s1v, _s2v, _s3v],
                        marker_colors=["#f97316", "#3b82f6", "#8b5cf6"],
                        hole=0.55,
                        textinfo="label+percent",
                        textfont_size=11,
                        insidetextorientation="radial",
                    ))
                    _fig_pie.update_layout(
                        title=dict(text="Share by scope", font=dict(size=13, color="#1e293b"), x=0.1),
                        height=260, margin=dict(t=48, b=16, l=16, r=16),
                        showlegend=False,
                        paper_bgcolor="rgba(0,0,0,0)",
                        font=dict(color="#1e293b"),
                    )
                    st.plotly_chart(_fig_pie, use_container_width=True, key="inv_scope_pie")
        except ImportError:
            pass

    if n_rec == 0:
        st.info(
            "No records yet for this reporting year.  \n"
            "Go to **Scope 1 / 2 / 3** pages, enter data and press **Save to inventory**."
        )
        return

    st.markdown("---")

    # ── Quick exports ──────────────────────────────────────────────────────
    ex1, ex2, ex3 = st.columns(3)

    # CSV download of all records
    try:
        import pandas as pd
        all_recs = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
        if all_recs:
            df_all = pd.DataFrame(all_recs)
            csv_bytes = df_all.to_csv(index=False).encode("utf-8")
            ex1.download_button(
                "⬇️ Export CSV",
                data=csv_bytes,
                file_name=f"inventory_{inv_year}.csv",
                mime="text/csv",
                use_container_width=True,
            )

            # Excel download
            try:
                import io
                buf = io.BytesIO()
                with pd.ExcelWriter(buf, engine="openpyxl") as writer:
                    df_all.to_excel(writer, index=False, sheet_name="Inventory")
                    # Scope summary sheet
                    summary_rows = []
                    for scope in ["Scope 1", "Scope 2", "Scope 3"]:
                        s_df = df_all[df_all["scope"] == scope]
                        summary_rows.append({
                            "Scope": scope,
                            "Records": len(s_df),
                            "tCO2e": s_df["t_CO2e"].sum() if "t_CO2e" in s_df else 0,
                        })
                    pd.DataFrame(summary_rows).to_excel(writer, index=False, sheet_name="Summary")
                buf.seek(0)
                ex2.download_button(
                    "⬇️ Export Excel",
                    data=buf.read(),
                    file_name=f"inventory_{inv_year}.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    use_container_width=True,
                )
            except Exception:
                pass  # openpyxl not installed

    except ImportError:
        pass

    # Print-ready summary (HTML)
    try:
        org_name = st.session_state.org_profile.get("org_name", "Organisation")
        s_summary = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
        html_lines = [
            f"<html><body style='font-family:Arial;max-width:800px;margin:auto'>",
            f"<h1>{org_name} — GHG Inventory {inv_year}</h1>",
            f"<table border='1' cellpadding='6' style='border-collapse:collapse;width:100%'>",
            f"<tr><th>Scope</th><th>tCO₂e</th></tr>",
            f"<tr><td>Scope 1</td><td>{s_summary.get('scope1_t_co2e',0):,.4f}</td></tr>",
            f"<tr><td>Scope 2</td><td>{s_summary.get('scope2_t_co2e',0):,.4f}</td></tr>",
            f"<tr><td>Scope 3</td><td>{s_summary.get('scope3_t_co2e',0):,.4f}</td></tr>",
            f"<tr><td><strong>Total</strong></td><td><strong>{s_summary.get('total_t_co2e',0):,.4f}</strong></td></tr>",
            f"</table><p>Records: {s_summary.get('n_records',0)} | "
            f"Fallback EFs: {s_summary.get('n_fallback_records',0)} | "
            f"IPCC AR{st.session_state.org_profile.get('gwp_ar',6)} GWP100</p>",
            f"</body></html>",
        ]
        ex3.download_button(
            "🖨️ Print summary",
            data="\n".join(html_lines),
            file_name=f"ghg_summary_{inv_year}.html",
            mime="text/html",
            use_container_width=True,
            help="Open in browser and use Ctrl+P to print",
        )
    except Exception:
        pass

    st.markdown("---")

    # ── Filters ───────────────────────────────────────────────────────────
    fc1, fc2, fc3, fc4 = st.columns([1, 1, 2, 1])
    scope_opt  = fc1.selectbox("Scope", ["All", "Scope 1", "Scope 2", "Scope 3"],
                                key="dm_scope")
    # Build category list from records
    all_recs_raw = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
    cats_available = sorted(set(r.get("category") or r.get("scope","") or ""
                                for r in all_recs_raw if r.get("category")))
    cat_opt    = fc2.selectbox("Category", ["All"] + cats_available, key="dm_cat")
    search     = fc3.text_input("Search", placeholder="fuel, process, country…",
                                 key="dm_search")
    sort_opt   = fc4.selectbox("Sort by",
                                ["tCO₂e (high→low)", "Saved (newest)", "Process A–Z"],
                                key="dm_sort")

    # Site / department filters (Sprint 21)
    sites_available = sorted(set(r.get("site") or "" for r in all_recs_raw if r.get("site")))
    depts_available = sorted(set(r.get("department") or "" for r in all_recs_raw if r.get("department")))
    sups_available = sorted(set(r.get("supplier_name") or "" for r in all_recs_raw
                                   if r.get("supplier_name")))
    if sites_available or depts_available or sups_available:
        sf1, sf2, sf3 = st.columns(3)
        site_opt = sf1.selectbox("Site", ["All"] + sites_available, key="dm_site")
        dept_opt = sf2.selectbox("Department", ["All"] + depts_available, key="dm_dept")
        sup_opt  = sf3.selectbox("Supplier", ["All"] + sups_available, key="dm_sup")
    else:
        site_opt = "All"
        dept_opt = "All"
        sup_opt  = "All"

    # ── Load + filter ─────────────────────────────────────────────────────
    all_recs = all_recs_raw

    def _match(r):
        if scope_opt != "All" and r["scope"] != scope_opt:
            return False
        if cat_opt != "All":
            r_cat = r.get("category") or r.get("scope", "")
            if cat_opt not in (r_cat or ""):
                return False
        if site_opt != "All" and r.get("site") != site_opt:
            return False
        if dept_opt != "All" and r.get("department") != dept_opt:
            return False
        if sup_opt != "All" and r.get("supplier_name") != sup_opt:
            return False
        if search:
            hay = " ".join([
                r.get("process", "") or "",
                r.get("fuel_or_item", "") or "",
                r.get("country", "") or "",
                r.get("category", "") or "",
                r.get("site", "") or "",
                r.get("department", "") or "",
                r.get("supplier_name", "") or "",
            ]).lower()
            if search.lower() not in hay:
                return False
        return True

    recs = [r for r in all_recs if _match(r)]

    if sort_opt == "tCO₂e (high→low)":
        recs.sort(key=lambda r: r["t_CO2e"] or 0, reverse=True)
    elif sort_opt == "Saved (newest)":
        recs.sort(key=lambda r: r["created_at"] or "", reverse=True)
    else:
        recs.sort(key=lambda r: r["process"] or "")

    st.caption(
        f"Showing **{len(recs)}** of {n_rec} records  ·  "
        f"FY {inv_year}  ·  org `{org_id}`"
    )

    if not recs:
        st.info("No records match the current filter.")
        return

    # ── Bulk operations ────────────────────────────────────────────────────
    bop1, bop2 = st.columns(2)

    with bop1.expander("🗑️ Bulk delete filtered records", expanded=False):
        unlocked = [r for r in recs if not r.get("locked")]
        if not unlocked:
            st.caption("All matching records are locked.")
        else:
            st.caption(
                f"{len(unlocked)} unlocked records match the current filter. "
                "Locked records are excluded."
            )
            if st.button(
                f"Delete {len(unlocked)} records",
                key="dm_bulk_del",
                type="secondary",
            ):
                n_del = inventory.delete_many([r["record_id"] for r in unlocked])
                st.success(f"Deleted {n_del} records.")
                st.rerun()

    with bop2.expander("🔄 Recalculate all with latest EFs", expanded=False):
        st.caption(
            "Re-run every unlocked record through the engine using the current "
            "emission factors. Use after updating EFs in the EF Manager."
        )
        unlocked_all = [r for r in recs if not r.get("locked")]
        st.metric("Unlocked records in current filter", len(unlocked_all))
        if st.button("🔄 Recalculate all", key="dm_recalc_all",
                     disabled=not unlocked_all):
            from core.engine import calculate
            from modules.base import ActivityRecord
            import json
            n_ok = n_fail = 0
            prog = st.progress(0)
            for i, row in enumerate(unlocked_all):
                try:
                    rec = ActivityRecord(
                        record_id=row["record_id"],
                        scope=row["scope"],
                        process=row["process"],
                        country=row.get("country", "IN"),
                        quantity=row["quantity"],
                        unit=row["unit"],
                        fuel_or_item=row["fuel_or_item"],
                        reporting_year=row.get("reporting_year", inv_year),
                        inventory_year=inv_year,
                        gwp_ar=profile["gwp_ar"],
                        org_id=org_id,
                    )
                    result = calculate(rec, conn)
                    inventory.persist(result, rec, inv_year)
                    n_ok += 1
                except Exception:
                    n_fail += 1
                prog.progress((i + 1) / len(unlocked_all))
            prog.empty()
            st.success(f"✓ Recalculated {n_ok} records"
                       + (f" · {n_fail} errors" if n_fail else ""))
            st.rerun()


    st.markdown("---")

    # ── Per-scope groups ──────────────────────────────────────────────────
    by_scope: dict[str, list] = {}
    for r in recs:
        by_scope.setdefault(r["scope"], []).append(r)

    for scope_name, scope_recs in sorted(by_scope.items()):
        scope_total = sum(r["t_CO2e"] or 0 for r in scope_recs)
        st.subheader(
            f"{scope_name}  ·  {scope_total:,.4f} tCO₂e  "
            f"({len(scope_recs)} record{'s' if len(scope_recs)!=1 else ''})"
        )
        for r in scope_recs:
            _record_row(r, inventory, conn, profile, inv_year)
        st.markdown("---")


# ---------------------------------------------------------------------------
# Individual record row
# ---------------------------------------------------------------------------

def _record_row(
    rec: dict,
    inventory,
    conn,
    profile: dict,
    inv_year: int,
) -> None:
    rid    = rec["record_id"]
    locked = bool(rec.get("locked"))
    t_co2e = rec.get("t_CO2e") or 0.0
    qty    = rec.get("quantity") or 0
    unit   = rec.get("unit") or ""

    # ── Expander label ────────────────────────────────────────────────────
    proc_short = (rec.get("process") or "").split("—")[-1].strip()
    fuel_part  = f"  ·  {rec['fuel_or_item']}" if rec.get("fuel_or_item") else ""
    country    = f"  [{rec['country']}]"       if rec.get("country")     else ""
    badges     = ""
    if rec.get("fallback_triggered"):
        badges += " ⚠️ fallback EF"
    if locked:
        badges += " 🔒"
    # Show EF source concisely
    ef_short = ""
    ef_src = rec.get("ef_source") or ""
    if ef_src:
        # Abbreviate long source names
        ef_abbr = ef_src[:25].replace("Ministry of Petroleum", "MoPNG").replace("IPCC 2006", "IPCC")
        ef_short = f"  ·  _{ef_abbr}_"

    label = (
        f"{proc_short}{fuel_part}{country}"
        f"  →  **{t_co2e:.4f} tCO₂e**"
        f"{ef_short}{badges}"
    )
    # Append site/dept tag if present
    site_tag     = rec.get("site") or ""
    dept_tag     = rec.get("department") or ""
    supplier_tag = rec.get("supplier_name") or ""
    tag_parts = [t for t in [supplier_tag, site_tag, dept_tag] if t]
    if tag_parts:
        label += "  ·  🏷️ " + " / ".join(tag_parts)

    with st.expander(label, expanded=False):

        # Details grid
        d = st.columns(4)
        d[0].metric("tCO₂e",      f"{t_co2e:.6f}")
        d[1].metric("Quantity",    f"{qty} {unit}")
        d[2].metric("EF rank",     rec.get("fallback_level") or "—")
        d[3].metric("Confidence",  rec.get("confidence")     or "—")

        st.caption(
            f"`{rid[:12]}…`  ·  "
            f"{rec.get('process', '')}  ·  "
            f"saved {(rec.get('created_at') or '')[:16]}"
        )
        if rec.get("factor_id_used"):
            st.caption(
                f"EF: `{rec['factor_id_used']}`  ·  "
                f"{rec.get('ef_source') or ''}"
            )

        if locked:
            st.info("🔒 Record is locked — unlock the inventory year to edit.")
            return

        # ── Audit trace ───────────────────────────────────────────────────
        audit_json = rec.get("audit_trace_json") or rec.get("audit_trace")
        if audit_json:
            with st.expander("🔍 Calculation audit trail", expanded=False):
                try:
                    import json
                    trace = json.loads(audit_json) if isinstance(audit_json, str) else audit_json
                    # Methodology
                    if "methodology" in trace:
                        st.caption(f"**Methodology:** {trace['methodology']}")
                    # Inputs
                    if "inputs" in trace:
                        st.caption("**Inputs:**")
                        st.json(trace["inputs"], expanded=False)
                    # Calculation steps
                    if "calculation" in trace and isinstance(trace["calculation"], list):
                        st.caption("**Calculation steps:**")
                        for step in trace["calculation"]:
                            if isinstance(step, dict):
                                st.caption(f"• {step.get('label','')}: {step.get('value','')}")
                    # GWP used
                    if "gwp" in trace:
                        g = trace["gwp"]
                        st.caption(f"**GWP (AR{g.get('ar','?')}):** CO₂={g.get('CO2',1.0)} · "
                                   f"CH₄={g.get('CH4_fossil','?')} · N₂O={g.get('N2O','?')}")
                except Exception:
                    st.code(str(audit_json)[:500])

        st.markdown("---")

        # ── Edit + Delete row ─────────────────────────────────────────────
        ec1, ec2, ec3 = st.columns([3, 1, 1])

        new_qty = ec1.number_input(
            f"Quantity  ({unit})",
            value=float(qty),
            min_value=0.0,
            format="%.4f",
            key=f"dm_qty_{rid}",
            label_visibility="collapsed",
            help=f"Current: {qty} {unit}. Change and click Recalculate.",
        )
        ec1.caption(f"Current: {qty} {unit}")

        if ec2.button("♻️ Recalculate", key=f"dm_recalc_{rid}", type="primary"):
            if new_qty == float(qty):
                st.toast("Quantity unchanged — nothing to recalculate.")
            else:
                with st.spinner("Recalculating…"):
                    try:
                        ok = inventory.update_quantity(rid, new_qty, conn)
                        if ok:
                            st.toast(f"✅ Updated to {new_qty} {unit}")
                            st.rerun()
                        else:
                            st.error("Update failed — record locked or not found.")
                    except Exception as e:
                        st.error(f"Recalculation error: {e}")

        if ec3.button("🗑️ Delete", key=f"dm_del_{rid}", type="secondary"):
            inventory.delete_record(rid)
            st.toast("Record deleted.")
            st.rerun()

        # ── Tag editor ────────────────────────────────────────────────────
        if not locked:
            with st.expander("🏷️ Edit tags", expanded=False):
                te1, te2, te3 = st.columns(3)
                new_site = te1.text_input("Site",        value=rec.get("site") or "",
                                          key=f"dm_tag_site_{rid}")
                new_dept = te2.text_input("Department",  value=rec.get("department") or "",
                                          key=f"dm_tag_dept_{rid}")
                new_cc   = te3.text_input("Cost centre", value=rec.get("cost_centre") or "",
                                          key=f"dm_tag_cc_{rid}")
                if st.button("💾 Save tags", key=f"dm_tag_save_{rid}"):
                    try:
                        inventory._db.execute(
                            "UPDATE emission_results SET site=?, department=?, cost_centre=?,"
                            " updated_at=datetime('now') WHERE record_id=? AND locked=0",
                            (new_site or None, new_dept or None, new_cc or None, rid)
                        )
                        inventory._db.commit()
                        st.toast("✅ Tags saved.")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Tag update failed: {e}")
