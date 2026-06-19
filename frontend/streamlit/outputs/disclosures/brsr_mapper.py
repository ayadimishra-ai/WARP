"""
sk.lite — BRSR Disclosure Mapper.

Maps GHG inventory data to SEBI Business Responsibility and Sustainability
Reporting (BRSR) Core and Extended disclosures.

BRSR framework: SEBI circular SEBI/HO/CFD/CMD-2/P/CIR/2023/00007 (January 2023)
Principle 6: Environment

Key disclosure fields mapped:
  P6-E1:  Energy consumption and intensity
  P6-E2:  Water consumption (not in scope -- placeholder)
  P6-E3:  GHG emissions -- Scope 1, 2, 3 (metric tonnes CO2e)
  P6-E4:  GHG intensity
  P6-E5:  Air pollutants (not in scope)
  P6-E6:  Waste generated (from Cat 5)

Essential indicators (mandatory for all listed companies):
  Total Scope 1, 2, 3 emissions (tCO2e)
  GHG intensity per rupee of turnover
  Reduction targets (if any)

Leadership indicators (voluntary/top 1000 companies):
  Emission by category breakdown
  Life-cycle assessment (if conducted)
  Carbon offsets

Usage:
    from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
    report = generate_brsr_disclosure(inventory, org_profile, inv_year=2024)
    # report["text"]  -> formatted text disclosure
    # report["table"] -> dict suitable for CSV/Excel export
    # report["json"]  -> structured JSON
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


def generate_brsr_disclosure(
    inventory,
    org_profile: dict,
    inventory_year: Optional[int] = None,
    turnover_inr_cr: Optional[float] = None,
    employees: Optional[int] = None,
    reduction_target_pct: Optional[float] = None,
    reduction_target_year: Optional[int] = None,
) -> dict:
    """
    Generate BRSR Principle 6 GHG disclosure.

    Args:
        inventory:             InventoryStore instance
        org_profile:           st.session_state.org_profile dict
        inventory_year:        reporting year (defaults to org_profile year)
        turnover_inr_cr:       annual turnover in INR crore (for intensity ratio)
        employees:             total employee count (for per-employee intensity)
        reduction_target_pct:  % reduction target vs base year
        reduction_target_year: target year for reduction

    Returns:
        dict with keys: text, table, json, metadata
    """
    inv_year = inventory_year or org_profile.get("reporting_year", 2024)
    org_id   = org_profile.get("org_id", "default")
    org_name = org_profile.get("org_name", "Organisation")
    currency = org_profile.get("currency", "INR")
    gwp_ar   = org_profile.get("gwp_ar", 6)

    # Pull from inventory
    summary = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    by_cat  = inventory.get_by_category(org_id=org_id, inventory_year=inv_year)
    fallback = inventory.get_fallback_report(org_id=org_id, inventory_year=inv_year)

    s1 = summary.get("scope1_t_co2e", 0)
    s2 = summary.get("scope2_t_co2e", 0)
    s3 = summary.get("scope3_t_co2e", 0)
    total = summary.get("total_t_co2e", 0)
    biogenic = summary.get("biogenic_t_co2", 0)
    n_records = summary.get("n_records", 0)
    n_fallback = summary.get("n_fallback_records", 0)

    # Intensities
    intensity_turnover = None
    if turnover_inr_cr and turnover_inr_cr > 0:
        intensity_turnover = round(total / turnover_inr_cr, 4)   # tCO2e per crore INR

    intensity_employee = None
    if employees and employees > 0:
        intensity_employee = round(total / employees, 4)    # tCO2e per employee

    # Scope 3 breakdown by category
    s3_cats = [r for r in by_cat if r["scope"] == "Scope 3"]

    # Build disclosure table
    table = _build_brsr_table(
        org_name=org_name,
        inv_year=inv_year,
        gwp_ar=gwp_ar,
        s1=s1, s2=s2, s3=s3, total=total, biogenic=biogenic,
        s3_cats=s3_cats,
        intensity_turnover=intensity_turnover,
        intensity_employee=intensity_employee,
        turnover_inr_cr=turnover_inr_cr,
        employees=employees,
        reduction_target_pct=reduction_target_pct,
        reduction_target_year=reduction_target_year,
        n_records=n_records,
        n_fallback=n_fallback,
        currency=currency,
    )

    # Format text disclosure
    text = _format_brsr_text(table, org_name, inv_year)

    return {
        "metadata": {
            "framework": "SEBI BRSR Core",
            "principle": "Principle 6 -- Environment",
            "regulation": "SEBI/HO/CFD/CMD-2/P/CIR/2023/00007",
            "organisation": org_name,
            "inventory_year": inv_year,
            "gwp_source": f"IPCC AR{gwp_ar} GWP100",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "n_records": n_records,
            "data_quality_pct_fallback": round(n_fallback / n_records * 100, 1)
            if n_records else 0,
        },
        "table": table,
        "text":  text,
        "json":  {
            # P6-E3 GHG emissions
            "scope1_tco2e":            round(s1,     4),
            "scope2_tco2e":            round(s2,     4),
            "scope3_tco2e":            round(s3,     4),
            "total_tco2e":             round(total,  4),
            "biogenic_tco2":           round(biogenic, 4),
            # P6-E4 Intensity
            "intensity_per_inr_crore": intensity_turnover,
            "intensity_per_employee":  intensity_employee,
            # P6-E1 Energy (derived from stationary + mobile combustion)
            "energy_direct_tj": round(
                sum(r.get("t_CO2e", 0) for r in by_cat
                    if "stationary" in (r.get("category") or "").lower()
                    or "mobile" in (r.get("category") or "").lower()
                    or r.get("scope") == "Scope 1") * 0.0  # placeholder: kWh field not yet in store
                , 4),
            # P6-E5 Reduction initiatives
            "reduction_target_pct":  reduction_target_pct,
            "reduction_target_year": reduction_target_year,
            # S3 breakdown
            "scope3_by_category": [
                {"category": r["category"], "t_CO2e": r["t_CO2e"]}
                for r in s3_cats
            ],
            # PCAF financed emissions (Cat 15) — data quality weighted average
            "pcaf_weighted_avg_score": _calc_pcaf_weighted_avg(by_cat),
        },
    }


def _calc_pcaf_weighted_avg(by_cat: list) -> Optional[float]:
    """
    Calculate PCAF weighted average data quality score from Cat 15 records.
    Weight = tCO2e per record. Returns None if no Cat 15 records.
    """
    cat15 = [r for r in by_cat if "15" in (r.get("category") or "")]
    if not cat15:
        return None
    # Default score 3 if not stored — in future, store pcaf_score per record
    total_weight = sum(r.get("t_CO2e", 0) for r in cat15) or 1
    weighted = sum(r.get("t_CO2e", 0) * r.get("pcaf_score", 3) for r in cat15)
    return round(weighted / total_weight, 2)


def _build_brsr_table(
    org_name, inv_year, gwp_ar,
    s1, s2, s3, total, biogenic,
    s3_cats, intensity_turnover, intensity_employee,
    turnover_inr_cr, employees,
    reduction_target_pct, reduction_target_year,
    n_records, n_fallback, currency,
) -> list[dict]:
    """Return list of BRSR disclosure rows."""
    rows = []

    def row(indicator, question, unit, current_yr, prev_yr="", notes=""):
        rows.append({
            "Indicator": indicator,
            "Disclosure Question": question,
            "Unit": unit,
            f"FY {inv_year}": current_yr,
            f"FY {inv_year-1}": prev_yr,
            "Notes / Methodology": notes,
        })

    # Section heading
    row("P6-E3", "GHG Emissions (metric tonnes CO2 equivalent)",
        "", "", "", f"IPCC AR{gwp_ar} GWP100 | Boundary: operational control")

    # Essential indicators
    row("P6-E3-a", "Total Scope 1 emissions",
        "tCO2e", f"{s1:,.2f}", "",
        "Direct emissions from owned/controlled sources. "
        "Includes stationary combustion, mobile combustion, fugitive, and process emissions.")

    row("P6-E3-b", "Total Scope 2 emissions (location-based)",
        "tCO2e", f"{s2:,.2f}", "",
        "Indirect emissions from purchased electricity. "
        "Location-based method using national grid EF (India: CEA CO2 Baseline Database v20).")

    row("P6-E3-c", "Total Scope 3 emissions (material categories)",
        "tCO2e", f"{s3:,.2f}", "",
        "Value chain emissions. "
        + (f"{len(s3_cats)} categories reported." if s3_cats else "Not yet quantified."))

    row("P6-E3-d", "Total GHG emissions (Scope 1 + 2 + 3)",
        "tCO2e", f"{total:,.2f}", "",
        f"GHG Protocol Corporate Standard. {n_records} activity records. "
        f"Biogenic CO2 ({biogenic:.2f} tCO2) excluded per GHG Protocol guidance.")

    row("P6-E3-e", "Biogenic CO2 emissions (reported separately)",
        "tCO2e", f"{biogenic:,.4f}", "",
        "Biomass combustion CO2 -- not included in total per GHG Protocol.")

    # Scope 3 category breakdown
    if s3_cats:
        for cat in sorted(s3_cats, key=lambda x: -x["t_CO2e"]):
            row("P6-E3-S3",
                f"  Scope 3 -- {cat['category']}",
                "tCO2e", f"{cat['t_CO2e']:,.3f}", "",
                f"{cat['n_records']} records")

    # Intensity metrics
    if intensity_turnover is not None:
        row("P6-E4-a",
            "GHG intensity per rupee of turnover (Scope 1+2)",
            f"tCO2e / {currency} crore",
            f"{intensity_turnover:.4f}", "",
            f"Turnover: {turnover_inr_cr:,.0f} {currency} crore")

    if intensity_employee is not None:
        row("P6-E4-b",
            "GHG intensity per employee (Scope 1+2+3)",
            "tCO2e / employee",
            f"{intensity_employee:.4f}", "",
            f"Employees: {employees:,}")

    # Reduction initiatives
    if reduction_target_pct:
        row("P6-E3-f",
            "GHG reduction target",
            "% vs base year",
            f"{reduction_target_pct:.0f}% by {reduction_target_year or 'TBD'}", "",
            "Science-based or internal target. Methodology to be disclosed separately.")
    else:
        row("P6-E3-f",
            "GHG reduction target",
            "", "Not yet established", "",
            "Company is in process of setting reduction targets.")

    # Data quality
    dq_pct = round(n_fallback / n_records * 100, 1) if n_records else 0
    row("P6-E3-g",
        "Data quality -- records using primary/measured data",
        "%",
        f"{100 - dq_pct:.1f}%", "",
        f"{n_records - n_fallback} of {n_records} records used national or measured EFs. "
        f"{n_fallback} records used global default EFs.")

    # Methodology note
    row("P6-E3-h",
        "Methodology and standards used",
        "", "GHG Protocol Corporate Accounting and Reporting Standard (2004, rev 2011)", "",
        "Emission factors: IPCC EFDB, CEA CO2 Baseline Database v20 (India), "
        "DEFRA 2024 GHG Conversion Factors, USEEIO v2 (Scope 3 spend-based).")

    return rows


def _format_brsr_text(table: list[dict], org_name: str, inv_year: int) -> str:
    """Format as text suitable for pasting into BRSR filing."""
    lines = [
        "=" * 70,
        "BUSINESS RESPONSIBILITY AND SUSTAINABILITY REPORT (BRSR)",
        f"Principle 6 -- Environment | GHG Emissions Disclosure",
        f"Organisation: {org_name}",
        f"Reporting Year: FY {inv_year}",
        "=" * 70,
        "",
        "ESSENTIAL INDICATORS -- GHG Emissions",
        "-" * 70,
    ]

    for row in table:
        ind  = row["Indicator"]
        q    = row["Disclosure Question"]
        unit = row["Unit"]
        val  = row.get(f"FY {inv_year}", "")
        note = row.get("Notes / Methodology", "")

        if not q:
            continue
        if not unit and not val:
            lines.append(f"\n{q}")
            lines.append("-" * 50)
        else:
            val_str = f"{val} {unit}".strip() if unit else val
            lines.append(f"\n{ind}: {q}")
            lines.append(f"  Value ({inv_year}): {val_str}")
            if note:
                lines.append(f"  Note: {note}")

    lines += [
        "",
        "=" * 70,
        "END OF BRSR P6 GHG DISCLOSURE",
        "=" * 70,
    ]
    return "\n".join(lines)


def to_csv(brsr_report: dict) -> str:
    """Return the disclosure table as a CSV string."""
    table = brsr_report["table"]
    if not table:
        return ""
    headers = list(table[0].keys())
    lines = [",".join(f'"{h}"' for h in headers)]
    for row in table:
        lines.append(",".join(f'"{str(row.get(h,"")).replace(chr(34),chr(39))}"'
                              for h in headers))
    return "\n".join(lines)
