"""
Page 06 — Export & Report.

Downloads:
  - Text summary report
  - Category CSV
  - Process-level detail CSV
  - Full JSON inventory
  - Excel upload template

Regulatory disclosures:
  - SEBI BRSR Principle 6 (India listed companies)
  - CDP Climate Change C6/C7/C11 pre-fill

Inventory management:
  - Lock year (immutable snapshot)
"""
import json
import streamlit as st


def render():
    st.title("📤 Export & Report")

    from streamlit_app.auth import can_access as _can_exp, current_role as _exp_role
    if not _can_exp("can_export"):
        st.warning(
            "⚠️ **Export & download disabled** for your role. "
            "Contact your Admin to request export access."
        )
        return

    profile   = st.session_state.org_profile
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

    inventory = st.session_state.inventory
    org_id    = profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default"
    # ── Reliable org_id: bypass session timing ───────────────────────────
    from streamlit_app._org_helper import resolve_org_id, get_inv_store
    org_id = resolve_org_id(profile)
    if org_id and org_id != "default":
        inventory = get_inv_store(org_id)
    # ── Year selector ─────────────────────────────────────────────────────
    available_years = inventory.get_available_years(org_id=org_id)
    default_year    = profile["reporting_year"]
    if available_years:
        if default_year not in available_years:
            available_years = [default_year] + available_years
        inv_year = st.selectbox(
            "Reporting year",
            options=available_years,
            index=available_years.index(default_year) if default_year in available_years else 0,
            key="export_year",
        )
    else:
        inv_year = default_year
    org_name  = profile.get("org_name", "Organisation")

    from outputs.report import generate_report, to_csv, to_detailed_csv

    with st.spinner("Generating report…"):
        report = generate_report(inventory, profile, inv_year, org_id=org_id)

    summary = report.get("summary", {})
    if not summary.get("n_records"):
        st.info("No inventory records found. Enter data in Scope 1/2/3 first.")
        return

    # ── Summary ───────────────────────────────────────────────────────────
    st.markdown(f"### {org_name} — {inv_year}")
    mc = st.columns(5)
    mc[0].metric("Total tCO₂e", f"{summary.get('total_t_co2e',0):,.2f}")
    mc[1].metric("Scope 1",     f"{summary.get('scope1_t_co2e',0):,.2f}")
    mc[2].metric("Scope 2",     f"{summary.get('scope2_t_co2e',0):,.2f}")
    mc[3].metric("Scope 3",     f"{summary.get('scope3_t_co2e',0):,.2f}")
    mc[4].metric("Records",     summary.get("n_records", 0))

    dq = report.get("data_quality", {})
    st.caption(
        f"Data quality: **{dq.get('grade','—')}**  ·  "
        f"{dq.get('fallback_triggered',0)} of {summary.get('n_records',0)} "
        f"records used fallback EFs ({dq.get('fallback_pct',0):.0f}%)  ·  "
        f"IPCC AR{profile['gwp_ar']} GWP100"
    )

    st.markdown("---")

    # ── Downloads tab group ───────────────────────────────────────────────
    tab_dl, tab_disc, tab_tmpl, tab_lock, tab_snap = st.tabs([
        "⬇️ Downloads", "📋 Regulatory disclosures",
        "📥 Upload templates", "🔒 Lock inventory", "🗂️ Locked snapshots",
    ])

    with tab_dl:
        _download_section(report, profile, inv_year)

    with tab_disc:
        _disclosure_section(inventory, profile, inv_year)

    with tab_tmpl:
        _template_download_section(profile)

    with tab_lock:
        _lock_section(inventory, profile, inv_year, org_id)

    with tab_snap:
        _snapshots_section(inventory, org_id)
        st.markdown("---")
        _year_comparison_section(inventory, org_id)


# ---------------------------------------------------------------------------
# Downloads
# ---------------------------------------------------------------------------

def _generate_html_report(report: dict, profile: dict, inv_year: int) -> str:
    """Generate a self-contained HTML inventory report for download."""
    org   = profile.get("org_name", "Organisation")
    gwp   = profile.get("gwp_ar", 6)
    fy    = profile.get("fiscal_year", str(inv_year))
    summ  = report.get("summary", {})
    s1    = summ.get("scope1_t_co2e", 0)
    s2    = summ.get("scope2_t_co2e", 0)
    s3    = summ.get("scope3_t_co2e", 0)
    total = summ.get("total_t_co2e", 0)
    n_rec = summ.get("n_records", 0)
    grade = summ.get("data_quality_grade", "—")

    by_cat = report.get("by_category", [])
    rows_html = ""
    for r in by_cat:
        rows_html += (
            f"<tr><td>{r.get('scope','')}</td><td>{r.get('category','')}</td>"
            f"<td style='text-align:right'>{r.get('t_CO2e',0):,.4f}</td></tr>\n"
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GHG Inventory — {org} — {fy}</title>
<style>
  body{{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;color:#1a1a1a}}
  h1{{color:#2d6a4f}}h2{{color:#40916c;border-bottom:2px solid #d8f3dc;padding-bottom:4px}}
  .metrics{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}}
  .metric{{background:#f0fdf4;border:1px solid #b7e4c7;border-radius:8px;padding:16px;text-align:center}}
  .metric .val{{font-size:1.6rem;font-weight:700;color:#1b4332}}
  .metric .lbl{{font-size:.8rem;color:#52796f;margin-top:4px}}
  table{{width:100%;border-collapse:collapse;margin:16px 0}}
  th{{background:#2d6a4f;color:#fff;padding:8px 12px;text-align:left}}
  tr:nth-child(even){{background:#f0fdf4}}td{{padding:6px 12px;border-bottom:1px solid #d8f3dc}}
  .footer{{margin-top:40px;font-size:.8rem;color:#888;text-align:center}}
</style>
</head>
<body>
<h1>🌱 GHG Emissions Inventory Report</h1>
<p><strong>{org}</strong> &nbsp;·&nbsp; FY {fy} &nbsp;·&nbsp; IPCC AR{gwp} GWP100</p>

<div class="metrics">
  <div class="metric"><div class="val">{total:,.1f}</div><div class="lbl">Total tCO₂e</div></div>
  <div class="metric"><div class="val">{s1:,.1f}</div><div class="lbl">Scope 1</div></div>
  <div class="metric"><div class="val">{s2:,.1f}</div><div class="lbl">Scope 2</div></div>
  <div class="metric"><div class="val">{s3:,.1f}</div><div class="lbl">Scope 3</div></div>
</div>
<p><strong>Records:</strong> {n_rec} &nbsp;·&nbsp; <strong>Data quality grade:</strong> {grade}</p>

<h2>Emissions by category</h2>
<table>
<thead><tr><th>Scope</th><th>Category</th><th>tCO₂e</th></tr></thead>
<tbody>{rows_html}</tbody>
</table>

<div class="footer">
  Generated by sk.lite v1.0.2 &nbsp;·&nbsp; GHG Protocol Corporate Standard
</div>
</body>
</html>"""


def _download_section(report, profile, inv_year):
    st.markdown("#### Download inventory data")
    org_slug = (profile.get("org_name","org")[:15].replace(" ","_")).lower()

    from outputs.report import to_csv, to_detailed_csv

    c1, c2, c3, c4, c5, c6, c7 = st.columns(7)

    c1.download_button(
        "📄 Text (.txt)",
        report.get("text_report", ""),
        file_name=f"ghg_report_{org_slug}_{inv_year}.txt",
        mime="text/plain",
        use_container_width=True,
    )

    # HTML report
    try:
        html_report = _generate_html_report(report, profile, inv_year)
        c2.download_button(
            "🌐 HTML report",
            html_report,
            file_name=f"ghg_report_{org_slug}_{inv_year}.html",
            mime="text/html",
            use_container_width=True,
        )
    except Exception:
        c2.caption("HTML: unavailable")

    c3.download_button(
        "📊 Category CSV",
        to_csv(report),
        file_name=f"ghg_by_category_{inv_year}.csv",
        mime="text/csv",
        use_container_width=True,
    )

    detail = to_detailed_csv(report)
    if detail:
        c4.download_button(
            "📋 Process CSV",
            detail,
            file_name=f"ghg_by_process_{inv_year}.csv",
            mime="text/csv",
            use_container_width=True,
        )

    # Excel full report
    try:
        from outputs.report import to_xlsx
        xlsx_bytes = to_xlsx(report, profile.get("org_name","Organisation"))
        c5.download_button(
            "📗 Excel report",
            data=xlsx_bytes,
            file_name=f"ghg_report_{org_slug}_{inv_year}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True,
        )
    except Exception:
        c5.caption("Excel: install openpyxl")

    # Data quality / fallback report CSV
    fb_records = report.get("fallback_records", [])
    if fb_records:
        dq_lines = ["record_id,scope,process,country,fuel_or_item,t_CO2e,fallback_level,ef_source"]
        for r in fb_records:
            dq_lines.append(",".join(str(r.get(k,"")) for k in
                ["record_id","scope","process","country","fuel_or_item",
                 "t_CO2e","fallback_level","ef_source"]))
        c6.download_button(
            "⚠️ Fallback CSV",
            "\n".join(dq_lines),
            file_name=f"ghg_data_quality_{inv_year}.csv",
            mime="text/csv",
            use_container_width=True,
            help=f"{len(fb_records)} records used fallback emission factors",
        )
    else:
        c6.success("✓ No fallbacks")

    export_json = {k: v for k, v in report.items() if k != "text_report"}
    c7.download_button(
        "🔗 Full JSON",
        json.dumps(export_json, indent=2, default=str),
        file_name=f"ghg_inventory_{inv_year}.json",
        mime="application/json",
        use_container_width=True,
    )

    # ── One-click full disclosure pack ────────────────────────────────────
    st.markdown("---")
    st.markdown("#### 📦 Full disclosure pack")
    st.caption(
        "Download all disclosures in one ZIP — text report, category CSV, "
        "Excel report, BRSR JSON, CDP JSON, TCFD text, GRI 302/305 text."
    )
    if st.button("📦 Generate full disclosure pack (.zip)", key="gen_pack"):
        try:
            import zipfile, io as _io
            buf = _io.BytesIO()
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
                # Text report
                zf.writestr(f"ghg_report_{inv_year}.txt",
                            report.get("text_report",""))
                # Category CSV
                zf.writestr(f"ghg_by_category_{inv_year}.csv", to_csv(report))
                # Excel report
                try:
                    from outputs.report import to_xlsx
                    zf.writestr(f"ghg_report_{inv_year}.xlsx",
                                to_xlsx(report, profile.get("org_name","Org")))
                except Exception:
                    pass
                # Full JSON
                zf.writestr(f"ghg_inventory_{inv_year}.json",
                            json.dumps(export_json, indent=2, default=str))
                # BRSR
                try:
                    from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
                    inventory = st.session_state.inventory
                    brsr = generate_brsr_disclosure(inventory, profile, inv_year)
                    zf.writestr(f"BRSR_P6_{inv_year}.txt",  brsr["text"])
                    zf.writestr(f"BRSR_P6_{inv_year}.json",
                                json.dumps(brsr["json"], indent=2))
                except Exception:
                    pass
                # CDP
                try:
                    from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
                    cdp = generate_cdp_disclosure(inventory, profile, inv_year)
                    zf.writestr(f"CDP_{inv_year}.json",
                                json.dumps(cdp["json"], indent=2, default=str))
                except Exception:
                    pass
                # TCFD
                try:
                    from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
                    tcfd = generate_tcfd_disclosure(inventory, profile, inv_year)
                    zf.writestr(f"TCFD_{inv_year}.txt", tcfd["text"])
                except Exception:
                    pass
                # GRI 302/305
                try:
                    from outputs.disclosures.gri_mapper import generate_gri_disclosure
                    gri = generate_gri_disclosure(inventory, profile, inv_year)
                    zf.writestr(f"GRI_302_305_{inv_year}.txt", gri["text"])
                except Exception:
                    pass
                # GRI 306 Waste
                try:
                    from outputs.disclosures.gri306_mapper import generate_gri306_disclosure
                    gri306 = generate_gri306_disclosure(profile, inv_year)
                    zf.writestr(f"GRI_306_{inv_year}.txt", gri306["text"])
                except Exception:
                    pass
                # SASB
                try:
                    from outputs.disclosures.sasb_mapper import generate_sasb_disclosure
                    sasb_sector = profile.get("sasb_sector")
                    conn = st.session_state.ef_conn
                    sasb = generate_sasb_disclosure(
                        inventory, profile, conn, inv_year, sector=sasb_sector
                    )
                    zf.writestr(f"SASB_{inv_year}.txt",  sasb["text"])
                    zf.writestr(f"SASB_{inv_year}.json",
                                json.dumps(sasb["json"], indent=2, default=str))
                    if sasb.get("causal_chains"):
                        import csv, io as _io
                        cbuf = _io.StringIO()
                        w = csv.DictWriter(cbuf, fieldnames=list(sasb["causal_chains"][0].keys()))
                        w.writeheader(); w.writerows(sasb["causal_chains"])
                        zf.writestr(f"SASB_causal_chains_{inv_year}.csv", cbuf.getvalue())
                except Exception:
                    pass
                # PCAF Cat 15 summary note
                try:
                    by_cat = inventory.get_by_category(org_id=org_id, inventory_year=inv_year)
                    cat15 = [r for r in by_cat if "15" in (r.get("category") or "")]
                    if cat15:
                        from outputs.disclosures.brsr_mapper import _calc_pcaf_weighted_avg
                        pcaf_avg = _calc_pcaf_weighted_avg(by_cat)
                        lines = [
                            f"PCAF Financed Emissions Summary — {org_name} — {inv_year}",
                            "",
                            f"Cat 15 total: {sum(r.get('t_CO2e',0) for r in cat15):,.4f} tCO₂e",
                            f"PCAF weighted avg data quality score: {pcaf_avg or 'N/A'}",
                            "",
                            "Score key: 1=Verified · 2=Reported · 3=Estimated (activity) · 4=Estimated (sector) · 5=Default",
                            "",
                            "Asset class breakdown:",
                        ]
                        for r in cat15:
                            lines.append(f"  {r.get('category','')} — {r.get('t_CO2e',0):,.4f} tCO₂e")
                        zf.writestr(f"PCAF_Cat15_{inv_year}.txt", "\n".join(lines))
                except Exception:
                    pass
            buf.seek(0)
            st.download_button(
                f"⬇️ Download disclosure pack ({inv_year}).zip",
                data=buf.read(),
                file_name=f"ghg_disclosure_pack_{org_slug}_{inv_year}.zip",
                mime="application/zip",
                use_container_width=True,
            )
        except Exception as e:
            st.error(f"Pack generation failed: {e}")

    # Excel upload template
    st.markdown("---")
    st.markdown("#### Templates")
    st.caption("Download ready-to-use Excel templates.")

    tc1, tc2 = st.columns(2)

    with tc1:
        st.markdown("**Activity data upload template**")
        st.caption("Pre-formatted Excel with one tab per category. Fill in and upload via Scope 1/2/3 pages.")
        if st.button("📥 Generate upload template (.xlsx)", key="gen_template"):
            try:
                from templates.activity_upload_master import generate_template
                import tempfile, os
                with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as f:
                    tmp = f.name
                generate_template(output_path=tmp)
                xlsx = open(tmp, "rb").read()
                os.unlink(tmp)
                st.download_button(
                    "⬇️ Download GHG_Activity_Upload_Template.xlsx",
                    data=xlsx,
                    file_name="GHG_Activity_Upload_Template.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    use_container_width=True,
                )
            except Exception as e:
                st.error(f"Template generation failed: {e}")

    with tc2:
        st.markdown("**Supplier data request template**")
        st.caption("Send to suppliers to collect Cat 1/4/11 data. Returns structured GHG data.")
        if st.button("📥 Generate supplier template (.xlsx)", key="gen_supplier_tmpl"):
            try:
                from outputs.supplier_template import generate_supplier_template
                profile = st.session_state.org_profile
                xlsx = generate_supplier_template(
                    org_name=profile.get("org_name", "Organisation"),
                    inventory_year=profile.get("reporting_year", 2024),
                )
                st.download_button(
                    "⬇️ Download Supplier_GHG_Request.xlsx",
                    data=xlsx,
                    file_name="Supplier_GHG_Data_Request.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    use_container_width=True,
                )
            except Exception as e:
                st.error(f"Supplier template failed: {e}")

    # Report preview
    st.markdown("---")
    with st.expander("📖 View full text report", expanded=False):
        st.text(report.get("text_report", ""))

    # Category table
    by_cat = report.get("by_category", [])
    if by_cat:
        st.markdown("#### Inventory by category")
        try:
            import pandas as pd
            df = pd.DataFrame(by_cat).rename(columns={
                "t_CO2e": "tCO₂e", "t_CO2": "tCO₂",
                "t_CH4": "tCH₄",  "t_N2O": "tN₂O", "n_records": "Records",
            })
            cols = [c for c in ["scope","category","Records","tCO₂e","tCO₂","tCH₄","tN₂O"] if c in df.columns]
            st.dataframe(
                df[cols].sort_values("tCO₂e", ascending=False).reset_index(drop=True),
                use_container_width=True,
            )
        except ImportError:
            for row in by_cat:
                st.markdown(f"- **{row['scope']}** {row.get('category','')}: {row['t_CO2e']:.3f} tCO₂e")


# ---------------------------------------------------------------------------
# Regulatory disclosures
# ---------------------------------------------------------------------------

def _disclosure_section(inventory, profile, inv_year):
    st.markdown("#### Regulatory disclosure mapping")
    st.caption(
        "Pre-populate the BRSR and CDP sections below from your inventory. "
        "Fields marked ✱ are mandatory for listed companies."
    )

    # Pre-fill from profile
    default_turnover = float(profile.get("revenue_inr_cr", 0.0))
    default_emp      = int(profile.get("employees", 0))

    col1, col2 = st.columns(2)

    # ── BRSR ─────────────────────────────────────────────────────────────
    with col1:
        st.markdown("**🇮🇳 SEBI BRSR — Principle 6**")
        st.caption("Mandatory for top 1000 listed companies by market cap")

        turnover = st.number_input(
            "Annual turnover (INR crore) ✱",
            min_value=0.0, value=default_turnover, format="%.2f",
            key="brsr_turnover",
            help="Used for GHG intensity per crore INR (P6-E4)",
        )
        emp_brsr = st.number_input(
            "Total employees", min_value=0, value=default_emp,
            step=1, key="brsr_emp",
        )
        red_target = st.number_input(
            "Reduction target (% vs base)", min_value=0.0, max_value=100.0,
            value=0.0, format="%.1f", key="brsr_target",
        )
        red_year = st.number_input(
            "Target year", min_value=2025, max_value=2050, value=2030, step=1,
            key="brsr_target_yr",
        )

        if st.button("📄 Generate BRSR P6 disclosure", key="gen_brsr", use_container_width=True):
            try:
                from outputs.disclosures.brsr_mapper import (
                    generate_brsr_disclosure, to_csv as brsr_csv,
                )
                brsr = generate_brsr_disclosure(
                    inventory, profile, inv_year,
                    turnover_inr_cr=turnover   if turnover  > 0 else None,
                    employees=emp_brsr         if emp_brsr  > 0 else None,
                    reduction_target_pct=red_target if red_target > 0 else None,
                    reduction_target_year=red_year  if red_target > 0 else None,
                )
                org_slug = profile.get("org_name","org")[:15].replace(" ","_").lower()
                st.download_button(
                    "⬇️ BRSR disclosure (.txt)",
                    brsr["text"],
                    file_name=f"BRSR_P6_{org_slug}_{inv_year}.txt",
                    mime="text/plain", use_container_width=True,
                )
                st.download_button(
                    "⬇️ BRSR table (.csv)",
                    brsr_csv(brsr),
                    file_name=f"BRSR_P6_{inv_year}.csv",
                    mime="text/csv", use_container_width=True,
                )
                j = brsr["json"]
                st.success(
                    f"S1: **{j.get('scope1_tco2e',0):,.1f}**  ·  "
                    f"S2: **{j.get('scope2_tco2e',0):,.1f}**  ·  "
                    f"S3: **{j.get('scope3_tco2e',0):,.1f}** tCO₂e"
                )
                if turnover > 0:
                    total = j.get('total_tco2e', 0)
                    st.caption(f"Intensity: {total/turnover:.4f} tCO₂e / crore INR")
            except Exception as e:
                st.error(f"BRSR generation failed: {e}")

    # ── CDP ──────────────────────────────────────────────────────────────
    with col2:
        st.markdown("**🌍 CDP Climate Change**")
        st.caption("Sections C6 (S1/S2/S3), C7 (emissions breakdown), C11 (targets)")

        base_yr  = st.number_input("Base year (0 = not set)", min_value=0,
                                    value=0, step=1, key="cdp_base_yr")
        base_ems = st.number_input("Base year tCO₂e (0 = not set)", min_value=0.0,
                                    value=0.0, format="%.2f", key="cdp_base_ems")
        emp_cdp  = st.number_input("Total employees", min_value=0,
                                    value=default_emp, step=1, key="cdp_emp")
        rev_cdp  = st.number_input("Revenue (USD million)", min_value=0.0,
                                    value=float(default_turnover) * float(profile.get("fx_to_usd",0.012)) * 10,
                                    format="%.2f", key="cdp_rev")

        if st.button("📄 Generate CDP pre-fill", key="gen_cdp", use_container_width=True):
            try:
                from outputs.disclosures.cdp_mapper import (
                    generate_cdp_disclosure, to_csv as cdp_csv,
                )
                cdp = generate_cdp_disclosure(
                    inventory, profile, inv_year,
                    base_year=base_yr       if base_yr  > 0 else None,
                    base_year_emissions=base_ems if base_ems > 0 else None,
                    employees=emp_cdp       if emp_cdp  > 0 else None,
                    revenue_usd_m=rev_cdp   if rev_cdp  > 0 else None,
                )
                org_slug = profile.get("org_name","org")[:15].replace(" ","_").lower()
                st.download_button(
                    "⬇️ CDP pre-fill (.txt)",
                    cdp["text"],
                    file_name=f"CDP_CC_{org_slug}_{inv_year}.txt",
                    mime="text/plain", use_container_width=True,
                )
                st.download_button(
                    "⬇️ CDP questions (.csv)",
                    cdp_csv(cdp),
                    file_name=f"CDP_CC_{inv_year}.csv",
                    mime="text/csv", use_container_width=True,
                )
                j = cdp["json"]
                st.success(
                    f"C6.1 S1: **{j.get('C6.1_s1_gross_tco2e',0):,.1f}**  ·  "
                    f"C6.3 S2: **{j.get('C6.3_s2_location_tco2e',0):,.1f}** tCO₂e"
                )
            except Exception as e:
                st.error(f"CDP generation failed: {e}")

    st.markdown("---")

    # ── TCFD ─────────────────────────────────────────────────────────────
    st.markdown("**🌐 TCFD — Task Force on Climate-related Financial Disclosures**")
    st.caption("Voluntary framework; increasingly required by regulators and investors.")

    with st.expander("Generate TCFD disclosure", expanded=False):
        tc1, tc2, tc3 = st.columns(3)
        tcfd_base_yr   = tc1.number_input("Base year", min_value=2015, max_value=2030,
                                           value=int(profile.get("reporting_year", 2024))-1,
                                           key="tcfd_base_yr")
        tcfd_base_ems  = tc2.number_input("Base year emissions (tCO₂e)",
                                           min_value=0.0, format="%.2f", key="tcfd_base_ems")
        tcfd_red_pct   = tc3.slider("Reduction target (%)", 0, 90, 42, key="tcfd_red_pct")

        if st.button("Generate TCFD", key="gen_tcfd"):
            try:
                from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
                import json
                initiatives = json.loads(profile.get("_initiatives","[]"))
                tcfd = generate_tcfd_disclosure(
                    inventory, profile, inv_year,
                    base_year=int(tcfd_base_yr),
                    base_year_emissions=float(tcfd_base_ems) if tcfd_base_ems else None,
                    reduction_target_pct=float(tcfd_red_pct),
                    reduction_target_year=2030,
                    initiatives=initiatives,
                )
                st.download_button(
                    "⬇️ TCFD Disclosure (.txt)",
                    data=tcfd["text"],
                    file_name=f"TCFD_disclosure_{inv_year}.txt",
                    mime="text/plain",
                    use_container_width=True,
                )
                st.download_button(
                    "⬇️ TCFD Data (.json)",
                    data=json.dumps(tcfd["json"], indent=2, default=str),
                    file_name=f"TCFD_data_{inv_year}.json",
                    mime="application/json",
                    use_container_width=True,
                )
                for pillar, content in tcfd["sections"].items():
                    with st.expander(f"📋 {pillar}", expanded=False):
                        st.caption(f"*Required:* {content['recommended_disclosure']}")
                        st.text(content["pre_fill"])
            except Exception as e:
                st.error(f"TCFD generation failed: {e}")

    st.markdown("---")

    # ── GRI 302/305 ──────────────────────────────────────────────────────
    st.markdown("**📊 GRI 302 + 305 — Energy & Emissions**")
    st.caption("GRI Standards: globally recognised sustainability reporting framework.")

    with st.expander("Generate GRI 302/305 disclosure", expanded=False):
        gc1, gc2 = st.columns(2)
        gri_energy   = gc1.number_input("Total energy consumed (MWh)",
                                         min_value=0.0, format="%.1f", key="gri_energy",
                                         help="Enter from energy bills or meters")
        gri_renewabl = gc2.number_input("Of which renewables (MWh)",
                                         min_value=0.0, format="%.1f", key="gri_renewabl")
        gd1, gd2, gd3 = st.columns(3)
        gri_base_yr  = gd1.number_input("Base year", min_value=2015, max_value=2030,
                                          value=int(profile.get("reporting_year", 2024))-1,
                                          key="gri_base_yr")
        gri_base_ems = gd2.number_input("Base year emissions (tCO₂e)",
                                          min_value=0.0, format="%.2f", key="gri_base_ems")
        gri_red_pct  = gd3.slider("Reduction target (%)", 0, 90, 42, key="gri_red_pct")

        if st.button("Generate GRI 302/305", key="gen_gri"):
            try:
                from outputs.disclosures.gri_mapper import generate_gri_disclosure
                import json as _json
                gri = generate_gri_disclosure(
                    inventory, profile, inv_year,
                    energy_from_renewables_mwh=float(gri_renewabl) if gri_renewabl else None,
                    total_energy_consumed_mwh=float(gri_energy)   if gri_energy   else None,
                    base_year=int(gri_base_yr),
                    base_year_emissions=float(gri_base_ems) if gri_base_ems else None,
                    reduction_target_pct=float(gri_red_pct),
                    reduction_target_year=2030,
                )
                st.download_button(
                    "⬇️ GRI 302/305 Disclosure (.txt)",
                    data=gri["text"],
                    file_name=f"GRI_302_305_{inv_year}.txt",
                    mime="text/plain",
                    use_container_width=True,
                )
                st.download_button(
                    "⬇️ GRI Data (.json)",
                    data=_json.dumps(gri["json"], indent=2, default=str),
                    file_name=f"GRI_data_{inv_year}.json",
                    mime="application/json",
                    use_container_width=True,
                )
                j = gri["json"]
                st.success(
                    f"305-1 S1: {j.get('305_1_scope1_tco2e',0):,.2f}  ·  "
                    f"305-2 S2: {j.get('305_2_scope2_loc_tco2e',0):,.2f}  ·  "
                    f"305-3 S3: {j.get('305_3_scope3_tco2e',0):,.2f} tCO₂e"
                )
            except Exception as e:
                st.error(f"GRI generation failed: {e}")

    st.markdown("---")

    # ── GRI 306 Waste ─────────────────────────────────────────────────────
    st.markdown("**🗑️ GRI 306 — Waste (2020)**")
    st.caption("Waste generation, diversion from disposal, and directed to disposal.")

    with st.expander("Generate GRI 306 disclosure", expanded=False):
        w1, w2, w3 = st.columns(3)
        gri306_total    = w1.number_input("Total waste generated (t)",   min_value=0.0, format="%.2f", key="gri306_total")
        gri306_haz      = w2.number_input("Hazardous waste (t)",          min_value=0.0, format="%.2f", key="gri306_haz")
        gri306_recycled = w3.number_input("Recycled (t)",                 min_value=0.0, format="%.2f", key="gri306_rec")
        w4, w5, w6 = st.columns(3)
        gri306_reused   = w4.number_input("Reused / prepared for reuse (t)", min_value=0.0, format="%.2f", key="gri306_reuse")
        gri306_landfill = w5.number_input("Landfilled (t)",               min_value=0.0, format="%.2f", key="gri306_land")
        gri306_incin    = w6.number_input("Incinerated (with energy) (t)", min_value=0.0, format="%.2f", key="gri306_incin")

        if st.button("Generate GRI 306", key="gen_gri306"):
            try:
                from outputs.disclosures.gri306_mapper import generate_gri306_disclosure
                gri306 = generate_gri306_disclosure(
                    org_profile=profile,
                    inventory_year=inv_year,
                    total_waste_t=float(gri306_total) if gri306_total else None,
                    hazardous_waste_t=float(gri306_haz) if gri306_haz else None,
                    recycled_t=float(gri306_recycled) if gri306_recycled else None,
                    reused_t=float(gri306_reused)    if gri306_reused   else None,
                    landfill_t=float(gri306_landfill) if gri306_landfill else None,
                    incineration_energy_t=float(gri306_incin) if gri306_incin else None,
                )
                st.download_button(
                    "⬇️ GRI 306 Disclosure (.txt)",
                    data=gri306["text"],
                    file_name=f"GRI_306_{inv_year}.txt",
                    mime="text/plain",
                    use_container_width=True,
                )
                j306 = gri306["json"]
                div_rate = j306.get("306_4_diversion_rate_pct") or 0
                st.success(
                    f"306-3 Total: {j306.get('306_1_total_waste_t') or 0:,.2f} t  ·  "
                    f"306-4 Diverted: {j306.get('306_4_diverted_t',0):,.2f} t ({div_rate:.1f}%)  ·  "
                    f"306-5 Disposed: {j306.get('306_5_disposed_t',0):,.2f} t"
                )
            except Exception as e:
                st.error(f"GRI 306 generation failed: {e}")


# ---------------------------------------------------------------------------
# Lock inventory
# ---------------------------------------------------------------------------

def _lock_section(inventory, profile, inv_year, org_id):
    st.markdown("#### Lock inventory year")
    st.warning(
        "Locking makes all records for this year **immutable** — they cannot be "
        "edited or deleted. Do this after all data is finalised and reviewed. "
        "This action cannot be undone.",
        icon="⚠️",
    )

    # Check if already locked
    n_locked = inventory._db.execute(
        "SELECT COUNT(*) FROM emission_results "
        "WHERE org_id=? AND inventory_year=? AND locked=1",
        (org_id, inv_year),
    ).fetchone()[0]
    n_total = inventory._db.execute(
        "SELECT COUNT(*) FROM emission_results "
        "WHERE org_id=? AND inventory_year=?",
        (org_id, inv_year),
    ).fetchone()[0]

    if n_locked == n_total and n_total > 0:
        st.success(f"✅ Inventory year {inv_year} is fully locked ({n_total} records).")
        return
    elif n_locked > 0:
        st.info(f"{n_locked} of {n_total} records are already locked.")

    lock_note = st.text_input(
        "Lock reason / auditor note",
        placeholder="Final inventory reviewed and approved by sustainability team",
        key="lock_note",
    )
    if st.button("🔒 Lock inventory year", type="primary", key="do_lock"):
        if not lock_note.strip():
            st.error("Provide a reason before locking.")
        else:
            snap = inventory.lock_inventory(
                inventory_year=inv_year,
                org_id=org_id,
                locked_by=profile.get("org_name", "user"),
                notes=lock_note.strip(),
            )
            st.success(
                f"✓ Inventory year {inv_year} locked.  \n"
                f"Snapshot ID: `{snap['snapshot_id']}`  ·  "
                f"{snap.get('n_records',0)} records frozen."
            )
            st.rerun()


# ---------------------------------------------------------------------------
# Snapshots
# ---------------------------------------------------------------------------

def _snapshots_section(inventory, org_id: str) -> None:
    st.markdown("#### Locked inventory snapshots")
    st.caption(
        "Each locked year creates an immutable snapshot — "
        "the audit trail for your GHG inventory."
    )

    snaps = inventory.get_snapshots(org_id=org_id)

    if not snaps:
        st.info(
            "No locked snapshots yet.  \n"
            "Go to **🔒 Lock inventory** tab to lock a year."
        )
        return

    # ── Year-over-year comparison ─────────────────────────────────────────
    if len(snaps) >= 2:
        st.markdown("##### Compare two years")
        years_avail = [s["inventory_year"] for s in snaps]
        cc1, cc2 = st.columns(2)
        yr_a = cc1.selectbox("Year A (base)", years_avail, index=0, key="snap_yr_a")
        yr_b = cc2.selectbox("Year B (compare)", years_avail,
                             index=min(1, len(years_avail)-1), key="snap_yr_b")
        if yr_a != yr_b:
            sa = next((s for s in snaps if s["inventory_year"] == yr_a), {})
            sb = next((s for s in snaps if s["inventory_year"] == yr_b), {})
            ta, tb = sa.get("total_t_co2e") or 0, sb.get("total_t_co2e") or 0
            diff = tb - ta
            pct  = (diff / ta * 100) if ta else 0
            mc = st.columns(4)
            mc[0].metric(f"{yr_a} total", f"{ta:,.2f} tCO₂e")
            mc[1].metric(f"{yr_b} total", f"{tb:,.2f} tCO₂e",
                         delta=f"{diff:+,.2f}", delta_color="inverse")
            mc[2].metric("Change %", f"{pct:+.1f}%", delta_color="off")
            for i, scope_key in enumerate(["scope1","scope2","scope3"], 3):
                va = sa.get(f"{scope_key}_t_co2e") or 0
                vb = sb.get(f"{scope_key}_t_co2e") or 0
                mc[i % 4].metric(f"S{i-2} {yr_b}", f"{vb:,.2f}",
                                  delta=f"{vb-va:+.2f}", delta_color="inverse")
        st.markdown("---")

    # ── Multi-year Excel download ──────────────────────────────────────────
    st.markdown("##### Multi-year report")
    sel_yrs = st.multiselect(
        "Years to include",
        [s["inventory_year"] for s in snaps],
        default=[s["inventory_year"] for s in snaps],
        key="snap_multiyear",
    )
    if sel_yrs:
        try:
            import io, pandas as pd
            buf = io.BytesIO()
            with pd.ExcelWriter(buf, engine="openpyxl") as writer:
                rows = []
                for s in snaps:
                    if s["inventory_year"] in sel_yrs:
                        rows.append({
                            "Year":          s["inventory_year"],
                            "Scope 1 tCO2e": s.get("scope1_t_co2e") or 0,
                            "Scope 2 tCO2e": s.get("scope2_t_co2e") or 0,
                            "Scope 3 tCO2e": s.get("scope3_t_co2e") or 0,
                            "Total tCO2e":   s.get("total_t_co2e")  or 0,
                            "Locked at":     (s.get("locked_at") or "")[:16],
                            "Locked by":     s.get("locked_by") or "",
                        })
                df = pd.DataFrame(rows).sort_values("Year")
                df["YoY %"] = df["Total tCO2e"].pct_change() * 100
                df.to_excel(writer, index=False, sheet_name="Multi-year Summary")
                for yr in sel_yrs:
                    try:
                        recs = inventory.get_all_records(org_id=org_id, inventory_year=yr)
                        if recs:
                            pd.DataFrame(recs).to_excel(writer, index=False, sheet_name=str(yr))
                    except Exception:
                        pass
            buf.seek(0)
            st.download_button(
                f"⬇️ Multi-year Excel ({len(sel_yrs)} years)",
                data=buf.read(),
                file_name="ghg_multiyear_report.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                use_container_width=True,
            )
        except ImportError:
            st.warning("Install pandas and openpyxl for Excel export.")

    st.markdown("---")
    st.markdown("##### Snapshot details")
    for snap in snaps:
        year    = snap.get("inventory_year", "?")
        la      = (snap.get("locked_at") or "")[:16]
        lb      = snap.get("locked_by") or "—"
        total   = snap.get("total_t_co2e") or 0
        snap_id = snap.get("snapshot_id") or ""
        notes   = snap.get("notes") or ""

        with st.expander(
            f"📅 **{year}** — {total:,.2f} tCO₂e  ·  Locked {la}  ·  by {lb}",
            expanded=False,
        ):
            mc = st.columns(4)
            mc[0].metric("Total tCO₂e", f"{total:,.2f}")
            mc[1].metric("Scope 1", f"{snap.get('scope1_t_co2e') or 0:,.2f}")
            mc[2].metric("Scope 2", f"{snap.get('scope2_t_co2e') or 0:,.2f}")
            mc[3].metric("Scope 3", f"{snap.get('scope3_t_co2e') or 0:,.2f}")
            st.caption(f"Snapshot ID: `{snap_id}`")
            if notes:
                st.caption(f"Note: {notes}")
            import json
            st.download_button(
                "⬇️ Download (.json)",
                data=json.dumps(snap, indent=2, default=str),
                file_name=f"snapshot_{year}_{snap_id[:8]}.json",
                mime="application/json",
                use_container_width=True,
                key=f"dl_snap_{snap_id[:8]}",
            )


def _year_comparison_section(inventory, org_id: str) -> None:
    """Side-by-side visual comparison of two locked snapshot years."""
    st.markdown("#### Year-on-year comparison")
    snaps = inventory.get_snapshots(org_id=org_id)
    if len(snaps) < 2:
        st.info("Lock at least 2 inventory years to enable year-on-year comparison.")
        return

    years = sorted([s["inventory_year"] for s in snaps])
    cc1, cc2 = st.columns(2)
    year_a = cc1.selectbox("Base year", years, index=0, key="cmp_year_a")
    year_b = cc2.selectbox("Comparison year", years,
                           index=len(years)-1, key="cmp_year_b")

    snap_a = next((s for s in snaps if s["inventory_year"] == year_a), None)
    snap_b = next((s for s in snaps if s["inventory_year"] == year_b), None)
    if not snap_a or not snap_b or year_a == year_b:
        st.warning("Select two different years.")
        return

    def _pct(a, b):
        if not a or a == 0:
            return None
        return round((b - a) / a * 100, 1)

    def _fmt_delta(pct):
        if pct is None:
            return "—"
        return f"{pct:+.1f}%"

    # Metric cards
    st.markdown(f"**{year_a} → {year_b}**")
    m1, m2, m3, m4 = st.columns(4)
    for col, label, key in [
        (m1, "Total tCO₂e", "total_t_co2e"),
        (m2, "Scope 1",     "scope1_t_co2e"),
        (m3, "Scope 2",     "scope2_t_co2e"),
        (m4, "Scope 3",     "scope3_t_co2e"),
    ]:
        val_a = snap_a.get(key) or 0
        val_b = snap_b.get(key) or 0
        pct   = _pct(val_a, val_b)
        col.metric(
            label,
            f"{val_b:,.1f}",
            delta=_fmt_delta(pct),
            delta_color="inverse",  # emissions increase = red
        )

    # Side-by-side table
    try:
        import pandas as pd
        rows = []
        for key, label in [("scope1_t_co2e","Scope 1"),
                            ("scope2_t_co2e","Scope 2"),
                            ("scope3_t_co2e","Scope 3"),
                            ("total_t_co2e","Total")]:
            va = snap_a.get(key) or 0
            vb = snap_b.get(key) or 0
            rows.append({
                "Scope": label,
                f"{year_a} tCO₂e": round(va, 2),
                f"{year_b} tCO₂e": round(vb, 2),
                "Change tCO₂e":    round(vb - va, 2),
                "Change %":         _fmt_delta(_pct(va, vb)),
            })
        st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
    except ImportError:
        pass

    # Plotly grouped bar
    try:
        import plotly.graph_objects as go
        scopes  = ["Scope 1","Scope 2","Scope 3","Total"]
        vals_a  = [snap_a.get(k) or 0 for k in
                   ["scope1_t_co2e","scope2_t_co2e","scope3_t_co2e","total_t_co2e"]]
        vals_b  = [snap_b.get(k) or 0 for k in
                   ["scope1_t_co2e","scope2_t_co2e","scope3_t_co2e","total_t_co2e"]]
        fig = go.Figure(data=[
            go.Bar(name=str(year_a), x=scopes, y=vals_a, marker_color="#3b82f6"),
            go.Bar(name=str(year_b), x=scopes, y=vals_b, marker_color="#10b981"),
        ])
        fig.update_layout(
            barmode="group", title=f"Emissions comparison: {year_a} vs {year_b}",
            yaxis_title="tCO₂e", margin=dict(t=50, b=20),
        )
        st.plotly_chart(fig, use_container_width=True, key="p06expor_plt_1")
    except ImportError:
        pass


def _template_download_section(profile: dict) -> None:
    """Tab: Download blank upload templates for each scope/category."""
    import io
    from pathlib import Path as _Path

    st.markdown("#### 📥 Download upload templates")
    st.caption(
        "Download a blank template, fill it in Excel, then upload it back on the "
        "Scope 1, 2, or 3 pages. "
        "All templates include tag columns: **supplier_name · site_name · department · cost_centre**."
    )

    # Full template (all sheets)
    tmpl_path = _Path(__file__).parents[1] / "templates" / "GHG_Activity_Upload_Template.xlsx"
    if tmpl_path.exists():
        with open(tmpl_path, "rb") as f:
            tmpl_bytes = f.read()
        st.download_button(
            "⬇️ Full template (all scopes — 14 sheets)",
            data=tmpl_bytes,
            file_name="GHG_Activity_Upload_Template.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            type="primary",
            use_container_width=True,
        )
        st.caption(f"Includes: S1 Stationary · S1 Mobile · S1 Fugitive · S2 Electricity · "
                   f"S3 Cat 1/3/4/5/6/7/8/9/11/15 · INSTRUCTIONS · {tmpl_path.stat().st_size//1024} KB")
    else:
        st.warning("Full template not found. Run `python setup.py --force` to regenerate.")

    st.markdown("---")
    st.markdown("**Or download a focused single-scope template:**")

    # Generate focused templates on the fly from the full template
    try:
        import openpyxl

        FOCUSED = [
            ("Scope 1 — Direct emissions",
             ["INSTRUCTIONS", "S1_Stationary", "S1_Mobile", "S1_Fugitive"],
             "S1_Direct_Template.xlsx"),
            ("Scope 2 — Electricity & heat",
             ["INSTRUCTIONS", "S2_Electricity"],
             "S2_Electricity_Template.xlsx"),
            ("Scope 3 — Upstream (Cat 1/3/4/5)",
             ["INSTRUCTIONS", "S3_Cat1_Goods", "S3_Cat3_Energy", "S3_Cat4_Transport", "S3_Cat5_Waste"],
             "S3_Upstream_Template.xlsx"),
            ("Scope 3 — Travel & commuting (Cat 6/7)",
             ["INSTRUCTIONS", "S3_Cat6_Travel", "S3_Cat7_Commuting"],
             "S3_Travel_Template.xlsx"),
            ("Scope 3 — Downstream (Cat 9/11)",
             ["INSTRUCTIONS", "S3_Cat9_Outbound", "S3_Cat11_Products"],
             "S3_Downstream_Template.xlsx"),
            ("Scope 3 — Finance (Cat 15 PCAF)",
             ["INSTRUCTIONS", "S3_Cat15_Finance"],
             "S3_Finance_PCAF_Template.xlsx"),
            ("Supplier data request",
             ["INSTRUCTIONS", "S3_Cat1_Goods", "S3_Cat4_Transport"],
             "Supplier_Data_Request_Template.xlsx"),
        ]

        if tmpl_path.exists():
            cols = st.columns(2)
            for idx, (label, sheets, filename) in enumerate(FOCUSED):
                wb_full = openpyxl.load_workbook(str(tmpl_path))
                # Keep only wanted sheets
                for shname in list(wb_full.sheetnames):
                    if shname not in sheets:
                        del wb_full[shname]
                buf = io.BytesIO()
                wb_full.save(buf)
                buf.seek(0)
                with cols[idx % 2]:
                    st.download_button(
                        f"⬇️ {label}",
                        data=buf.read(),
                        file_name=filename,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        use_container_width=True,
                        key=f"tmpl_{idx}",
                    )
    except ImportError:
        st.info("Install openpyxl for template generation.")

    st.markdown("---")
    st.markdown("**Template column guide**")
    st.markdown("""
| Column | Required? | Description |
|---|---|---|
| `fuel_or_item` | ✅ | Fuel type, material, or activity (e.g. `natural_gas`, `steel_billets`) |
| `quantity` | ✅ | Numerical amount consumed/purchased |
| `unit` | ✅ | Unit of measure (e.g. `GJ`, `kg`, `kWh`, `km`) |
| `vehicle_type` | Optional | Vehicle category for mobile combustion (e.g. `HGV`, `passenger_car`) |
| `equipment_type` | Optional | Equipment name for stationary/fugitive (e.g. `Boiler-01`) |
| `supplier_name` | Optional | Links record to a supplier — appears in supplier GHG dashboard |
| `site_name` | Optional | Facility/plant for site-level reporting |
| `department` | Optional | Business unit or department |
| `cost_centre` | Optional | Cost centre code |
| `country` | Optional | ISO country code (default: from Setup) |
| `reporting_year` | Optional | Year (default: from Setup) |
""")
