"""
sk.lite — Inventory Report Generator.

Produces a GHG Protocol Corporate Standard compliant inventory summary.
Outputs: dict (for display), CSV (download), and a plain-text report.
"""
from __future__ import annotations
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

try:
    import pandas as pd
    _PANDAS = True
except ImportError:
    _PANDAS = False


def generate_report(
    inventory,
    org_profile: dict,
    inventory_year: Optional[int] = None,
    org_id: Optional[str] = None,
) -> dict:
    """
    Generate a complete GHG Protocol inventory report.

    Args:
        inventory:       InventoryStore instance
        org_profile:     dict from st.session_state.org_profile
        inventory_year:  if None, uses org_profile['reporting_year']

    Returns:
        dict with keys: summary, by_scope, by_category, by_process,
                        data_quality, metadata, text_report
    """
    inv_year = inventory_year or org_profile.get("reporting_year", 2024)
    # Use explicitly passed org_id first (bypasses profile timing issue)
    org_id = org_id or org_profile.get("org_uuid") or org_profile.get("org_id") or "default"

    summary = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    by_cat  = inventory.get_by_category(org_id=org_id, inventory_year=inv_year)
    by_proc = inventory.get_by_process(org_id=org_id, inventory_year=inv_year)
    fallbacks = inventory.get_fallback_report(org_id=org_id, inventory_year=inv_year)

    metadata = {
        "organisation": org_profile.get("org_name", "Unknown"),
        "org_id": org_id,
        "reporting_year": inv_year,
        "fiscal_year": org_profile.get("fiscal_year", ""),
        "primary_country": org_profile.get("primary_country", ""),
        "boundary": org_profile.get("boundary", "operational_control"),
        "gwp_ar": org_profile.get("gwp_ar", 6),
        "currency": org_profile.get("currency", "INR"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "methodology": "GHG Protocol Corporate Accounting and Reporting Standard (2004, revised 2011)",
        "gwp_source": f"IPCC AR{org_profile.get('gwp_ar',6)} GWP100",
    }

    # Scope-level aggregation
    scope_rows = {}
    for row in by_cat:
        scope = row["scope"]
        if scope not in scope_rows:
            scope_rows[scope] = {"t_CO2e": 0.0, "t_CO2": 0.0, "t_CH4": 0.0, "t_N2O": 0.0}
        scope_rows[scope]["t_CO2e"] += row["t_CO2e"]
        scope_rows[scope]["t_CO2"]  += row.get("t_CO2", 0)
        scope_rows[scope]["t_CH4"]  += row.get("t_CH4", 0)
        scope_rows[scope]["t_N2O"]  += row.get("t_N2O", 0)

    # Data quality metrics
    n_total  = summary.get("n_records", 0)
    n_fb     = summary.get("n_fallback_records", 0)
    n_national = sum(1 for r in fallbacks if r["fallback_level"] == "national")
    n_global   = sum(1 for r in fallbacks if r["fallback_level"] == "global")

    data_quality = {
        "total_records": n_total,
        "fallback_triggered": n_fb,
        "fallback_pct": round(n_fb / n_total * 100, 1) if n_total else 0,
        "n_national_ef": n_total - n_fb,
        "n_regional_ef": n_national,
        "n_global_ef": n_global,
        "biogenic_t_CO2": summary.get("biogenic_t_co2", 0),
        "grade": _quality_grade(n_fb, n_total),
    }

    text_report = _format_text_report(metadata, summary, scope_rows,
                                       by_cat, data_quality)

    return {
        "metadata": metadata,
        "summary": summary,
        "by_scope": scope_rows,
        "by_category": by_cat,
        "by_process": by_proc,
        "data_quality": data_quality,
        "fallback_records": fallbacks,
        "text_report": text_report,
    }


def to_csv(report: dict) -> str:
    """Export inventory by category as CSV string."""
    if not _PANDAS:
        lines = ["scope,category,n_records,t_CO2e,t_CO2,t_CH4,t_N2O"]
        for row in report["by_category"]:
            lines.append(
                f"{row['scope']},{row['category']},{row['n_records']},"
                f"{row['t_CO2e']},{row['t_CO2']},{row['t_CH4']},{row['t_N2O']}"
            )
        return "\n".join(lines)
    df = pd.DataFrame(report["by_category"])
    return df.to_csv(index=False)


def to_detailed_csv(report: dict) -> str:
    """Export by-process detail as CSV string."""
    if not _PANDAS:
        return ""
    df = pd.DataFrame(report["by_process"])
    return df.to_csv(index=False)


def _quality_grade(n_fallback: int, n_total: int) -> str:
    if n_total == 0:
        return "N/A"
    pct = n_fallback / n_total * 100
    if pct == 0:
        return "A — All national/supplier EFs"
    if pct < 10:
        return "B — Mostly national EFs"
    if pct < 30:
        return "C — Mixed EF quality"
    if pct < 60:
        return "D — Majority fallback EFs"
    return "E — Mostly global defaults — seek better data"


def _format_text_report(metadata, summary, scope_rows, by_cat, dq) -> str:
    """Format a plain-text GHG Protocol inventory report."""
    lines = [
        "=" * 70,
        "GHG EMISSIONS INVENTORY REPORT",
        "GHG Protocol Corporate Accounting and Reporting Standard",
        "=" * 70,
        "",
        "ORGANISATION DETAILS",
        "-" * 40,
        f"Organisation:     {metadata['organisation']}",
        f"Reporting year:   {metadata['reporting_year']}",
        f"Fiscal year:      {metadata['fiscal_year']}",
        f"Country:          {metadata['primary_country']}",
        f"Boundary:         {metadata['boundary'].replace('_',' ').title()}",
        f"GWP source:       {metadata['gwp_source']}",
        f"Generated:        {metadata['generated_at']}",
        "",
        "SUMMARY — TOTAL EMISSIONS (tCO₂e)",
        "-" * 40,
        f"Scope 1 (Direct):          {summary.get('scope1_t_co2e', 0):>12,.2f}",
        f"Scope 2 (Purchased energy):{summary.get('scope2_t_co2e', 0):>12,.2f}",
        f"Scope 3 (Value chain):     {summary.get('scope3_t_co2e', 0):>12,.2f}",
        "-" * 40,
        f"TOTAL:                     {summary.get('total_t_co2e', 0):>12,.2f}",
        f"Biogenic CO₂ (reported sep.): {summary.get('biogenic_t_co2', 0):>9,.4f}",
        "",
        "EMISSIONS BY CATEGORY (tCO₂e)",
        "-" * 70,
        f"{'Scope':<12} {'Category':<42} {'tCO₂e':>10}",
        "-" * 70,
    ]

    for row in sorted(by_cat, key=lambda r: (r["scope"], -r["t_CO2e"])):
        cat = row["category"][:40]
        lines.append(f"{row['scope']:<12} {cat:<42} {row['t_CO2e']:>10,.3f}")

    lines += [
        "",
        "DATA QUALITY",
        "-" * 40,
        f"Total records:         {dq['total_records']}",
        f"Fallback EFs used:     {dq['fallback_triggered']} ({dq['fallback_pct']:.1f}%)",
        f"Quality grade:         {dq['grade']}",
        "",
        "METHODOLOGY NOTES",
        "-" * 40,
        "- Calculations per GHG Protocol Corporate Standard (2004, revised 2011)",
        "- Scope 3 categories per GHG Protocol Scope 3 Standard (2011)",
        "- Emission factors from IPCC EFDB, CEA (India), DEFRA 2024, USEEIO v2",
        "- Biogenic CO₂ excluded from total per GHG Protocol guidance",
        "- Scope 2 reported on location-based basis per GHG Protocol Scope 2 Guidance",
        "",
        "=" * 70,
        "END OF REPORT",
        "=" * 70,
    ]

    return "\n".join(lines)


def to_xlsx(report: dict, org_name: str = "Organisation") -> bytes:
    """
    Export the full GHG inventory report to an Excel workbook.

    Returns bytes ready for st.download_button().
    Requires openpyxl.
    """
    try:
        import io
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
    except ImportError:
        raise ImportError("openpyxl required: pip install openpyxl")

    wb = openpyxl.Workbook()

    hdr_fill = PatternFill("solid", fgColor="1F3864")
    hdr_font = Font(bold=True, color="FFFFFF", size=11)
    sub_fill = PatternFill("solid", fgColor="D6E4F0")
    sub_font = Font(bold=True, size=10)
    thin     = Border(
        left=Side(style="thin"), right=Side(style="thin"),
        top=Side(style="thin"),  bottom=Side(style="thin"),
    )

    def hdr_row(ws, row, values):
        for col, val in enumerate(values, 1):
            c = ws.cell(row=row, column=col, value=val)
            c.fill = hdr_fill
            c.font = hdr_font
            c.alignment = Alignment(horizontal="center", wrap_text=True)
            c.border = thin

    def data_row(ws, row, values, bold=False):
        for col, val in enumerate(values, 1):
            c = ws.cell(row=row, column=col, value=val)
            c.border = thin
            if bold:
                c.font = Font(bold=True)

    summary  = report.get("summary", {})
    by_cat   = report.get("by_category", [])
    by_proc  = report.get("by_process", [])
    dq       = report.get("data_quality", {})
    inv_year = summary.get("inventory_year", "")

    # ── Sheet 1: Summary ──────────────────────────────────────────────────
    ws1 = wb.active
    ws1.title = "Summary"
    ws1["A1"] = f"{org_name} — GHG Inventory {inv_year}"
    ws1["A1"].font = Font(bold=True, size=14, color="1F3864")
    ws1.merge_cells("A1:D1")

    hdr_row(ws1, 3, ["Scope", "tCO₂e", "tCO₂", "% of total"])
    total = summary.get("total_t_co2e", 1) or 1
    for row_i, (scope, key) in enumerate([
        ("Scope 1", "scope1_t_co2e"),
        ("Scope 2", "scope2_t_co2e"),
        ("Scope 3", "scope3_t_co2e"),
    ], 4):
        v = summary.get(key, 0)
        data_row(ws1, row_i, [scope, round(v, 4),
                               round(summary.get(key.replace("_t_co2e","_t_co2e"), v), 4),
                               round(v / total * 100, 1)])
    data_row(ws1, 7, ["TOTAL", round(total, 4), "", 100.0], bold=True)

    ws1.cell(row=9, column=1, value="Records").font = Font(bold=True)
    ws1.cell(row=9, column=2, value=summary.get("n_records", 0))
    ws1.cell(row=10, column=1, value="Data quality grade").font = Font(bold=True)
    ws1.cell(row=10, column=2, value=dq.get("grade", "—"))
    ws1.cell(row=11, column=1, value="Fallback EFs").font = Font(bold=True)
    ws1.cell(row=11, column=2, value=f"{dq.get('fallback_triggered',0)} ({dq.get('fallback_pct',0):.1f}%)")

    for col, w in zip("ABCD", [30, 14, 14, 12]):
        ws1.column_dimensions[col].width = w

    # ── Sheet 2: By Category ──────────────────────────────────────────────
    ws2 = wb.create_sheet("By Category")
    hdr_row(ws2, 1, ["Scope", "Category", "Records", "tCO₂e",
                      "tCO₂", "tCH₄", "tN₂O", "% of total"])
    for i, row in enumerate(sorted(by_cat, key=lambda r: (r["scope"], -r["t_CO2e"])), 2):
        v = row.get("t_CO2e", 0)
        data_row(ws2, i, [
            row.get("scope"), row.get("category"),
            row.get("n_records", 0),
            round(v, 4),
            round(row.get("t_CO2", 0), 4),
            round(row.get("t_CH4", 0), 6),
            round(row.get("t_N2O", 0), 6),
            round(v / total * 100, 2),
        ])
    for col, w in zip("ABCDEFGH", [12, 45, 10, 12, 12, 12, 12, 10]):
        ws2.column_dimensions[get_column_letter(ord(col)-64)].width = w

    # ── Sheet 3: By Process ───────────────────────────────────────────────
    if by_proc:
        ws3 = wb.create_sheet("By Process")
        hdr_row(ws3, 1, ["Scope", "Process", "Fuel/item",
                          "tCO₂e", "EF used", "EF source",
                          "Fallback", "Confidence"])
        for i, row in enumerate(sorted(by_proc, key=lambda r: (r["scope"], -r["t_CO2e"])), 2):
            data_row(ws3, i, [
                row.get("scope"),
                (row.get("process") or "")[:60],
                row.get("fuel_or_item"),
                round(row.get("t_CO2e", 0), 6),
                row.get("ef_value_used"),
                (row.get("ef_source") or "")[:40],
                "Yes" if row.get("fallback_triggered") else "No",
                row.get("confidence"),
            ])
        for col_i, w in enumerate([12,60,20,12,12,40,10,12], 1):
            ws3.column_dimensions[get_column_letter(col_i)].width = w

    # ── Sheet 4: Methodology ──────────────────────────────────────────────
    ws4 = wb.create_sheet("Methodology")
    notes = [
        ("Framework",   "GHG Protocol Corporate Standard (2004, revised 2011)"),
        ("Scope 3",     "GHG Protocol Scope 3 Standard (2011)"),
        ("GWP",         "IPCC AR6 GWP100 (default); AR4/AR5 selectable"),
        ("EF sources",  "IPCC EFDB, CEA India v20, DEFRA 2024, USEEIO v2"),
        ("Biogenic CO₂","Reported separately; excluded from Scope 1 total"),
        ("Scope 2",     "Location-based method (CEA India grid EF)"),
        ("Boundary",    "As configured in Setup (operational control default)"),
        ("Generated",   f"sk.lite v1.0 · {inv_year}"),
    ]
    for i, (k, v) in enumerate(notes, 2):
        ws4.cell(row=i, column=1, value=k).font = Font(bold=True)
        ws4.cell(row=i, column=2, value=v)
    ws4.column_dimensions["A"].width = 18
    ws4.column_dimensions["B"].width = 70

    # ── Sheet 5: Site & Department Breakdown ──────────────────────────────
    by_proc = report.get("by_process", [])
    site_rows = [r for r in by_proc if r.get("site") or r.get("department")]
    if site_rows:
        ws5 = wb.create_sheet("By Site")
        hdr5 = ["Site", "Department", "Cost Centre", "Scope", "Process",
                "Fuel/Item", "tCO₂e", "EF Source"]
        for ci, h in enumerate(hdr5, 1):
            c = ws5.cell(row=1, column=ci, value=h)
            c.font = Font(bold=True)
            c.fill = PatternFill("solid", fgColor="17375E")
            c.font = Font(bold=True, color="FFFFFF")
        for ri, row in enumerate(site_rows, 2):
            ws5.cell(row=ri, column=1, value=row.get("site") or "")
            ws5.cell(row=ri, column=2, value=row.get("department") or "")
            ws5.cell(row=ri, column=3, value=row.get("cost_centre") or "")
            ws5.cell(row=ri, column=4, value=row.get("scope") or "")
            ws5.cell(row=ri, column=5, value=row.get("process") or "")
            ws5.cell(row=ri, column=6, value=row.get("fuel_or_item") or "")
            ws5.cell(row=ri, column=7, value=round(float(row.get("t_CO2e") or 0), 4))
            ws5.cell(row=ri, column=8, value=row.get("ef_source") or "")
        for ci, w in enumerate([20, 20, 15, 12, 45, 20, 12, 25], 1):
            ws5.column_dimensions[chr(64+ci)].width = w

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
