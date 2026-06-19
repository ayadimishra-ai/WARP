"""
outputs/disclosures/tcfd_mapper.py

Generates TCFD (Task Force on Climate-related Financial Disclosures)
pre-fill disclosure text across the four pillars:
  Governance · Strategy · Risk Management · Metrics & Targets

Reference: TCFD Recommendations 2017 + 2021 Guidance
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


def generate_tcfd_disclosure(
    inventory,
    org_profile: dict,
    inventory_year: Optional[int] = None,
    base_year: Optional[int] = None,
    base_year_emissions: Optional[float] = None,
    reduction_target_pct: Optional[float] = None,
    reduction_target_year: Optional[int] = None,
    initiatives: Optional[list] = None,
) -> dict:
    """
    Generate TCFD climate disclosure pre-fill.

    Returns dict with keys: text, json, sections, metadata
    """
    inv_year  = inventory_year or org_profile.get("reporting_year", 2024)
    org_id    = org_profile.get("org_id", "default")
    org_name  = org_profile.get("org_name", "Organisation")
    gwp_ar    = org_profile.get("gwp_ar", 6)
    boundary  = org_profile.get("boundary", "operational control")
    employees = org_profile.get("employees", 0)
    revenue   = org_profile.get("revenue_inr_cr", 0)

    summary = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    s1    = summary.get("scope1_t_co2e", 0)
    s2    = summary.get("scope2_t_co2e", 0)
    s3    = summary.get("scope3_t_co2e", 0)
    total = summary.get("total_t_co2e",  0)

    pct_change = None
    if base_year_emissions and base_year_emissions > 0:
        pct_change = (total - base_year_emissions) / base_year_emissions * 100

    ini_achieved = sum(i.get("achieved_tco2e", 0) for i in (initiatives or [])
                       if i.get("status") == "Completed")
    ini_pipeline = sum(i.get("target_tco2e",  0) for i in (initiatives or [])
                       if i.get("status") in ("Planned", "In progress"))

    sections = {
        "Governance": {
            "recommended_disclosure": "a) Board oversight of climate-related risks/opportunities; "
                                      "b) Management's role in assessing and managing climate risks.",
            "pre_fill": (
                f"{org_name} has established climate governance through board-level oversight of "
                f"sustainability matters. Senior management is responsible for identifying, "
                f"assessing, and managing climate-related risks and opportunities. "
                f"GHG emissions data ({inv_year}) has been reviewed by management prior to disclosure."
            ),
        },
        "Strategy": {
            "recommended_disclosure": "a) Climate-related risks/opportunities over short, medium, long term; "
                                      "b) Impact on business, strategy and financial planning; "
                                      "c) Resilience of strategy under different climate scenarios.",
            "pre_fill": (
                f"{org_name} has identified both physical and transition climate risks. "
                f"Transition risks include carbon pricing, regulatory requirements (SEBI BRSR, "
                f"BIS standards), and changing customer preferences toward low-carbon products. "
                f"Physical risks include extreme weather events affecting operations and supply chains. "
                f"The company's emissions ({total:,.1f} tCO₂e in {inv_year}) create regulatory "
                f"and reputational exposure that is being actively managed."
            ),
        },
        "Risk Management": {
            "recommended_disclosure": "a) Processes for identifying/assessing climate risks; "
                                      "b) Processes for managing climate risks; "
                                      "c) How these processes are integrated into overall risk management.",
            "pre_fill": (
                f"{org_name} integrates climate risk assessment into its enterprise risk management "
                f"framework. A GHG emissions inventory is maintained for {inv_year} covering "
                f"Scopes 1, 2, and 3 under the {boundary} consolidation approach. "
                f"Material Scope 3 categories have been screened and quantified. "
                f"Emission factors are sourced from recognised databases (IPCC, CEA, DEFRA) "
                f"and reviewed annually."
            ),
        },
        "Metrics & Targets": {
            "recommended_disclosure": "a) Metrics used to assess climate risks/opportunities; "
                                      "b) Scope 1, 2, 3 GHG emissions and related risks; "
                                      "c) Targets used to manage climate risks and performance.",
            "pre_fill": _build_metrics_text(
                org_name, inv_year, s1, s2, s3, total, gwp_ar,
                pct_change, base_year, reduction_target_pct, reduction_target_year,
                ini_achieved, ini_pipeline, employees, revenue,
            ),
        },
    }

    text_lines = [
        f"TCFD Climate Disclosure — {org_name}",
        f"Reporting period: {inv_year}",
        f"GWP basis: IPCC AR{gwp_ar} GWP100",
        f"Generated: {datetime.now(timezone.utc).strftime('%d %b %Y %H:%M UTC')}",
        "",
    ]
    for pillar, content in sections.items():
        text_lines += [
            f"\n{'='*60}",
            f"PILLAR: {pillar.upper()}",
            f"{'='*60}",
            f"Recommended disclosure: {content['recommended_disclosure']}",
            "",
            "Pre-filled response:",
            content["pre_fill"],
        ]

    return {
        "metadata": {
            "framework": "TCFD",
            "version": "TCFD Recommendations 2017 + 2021 Guidance",
            "organisation": org_name,
            "inventory_year": inv_year,
            "gwp_source": f"IPCC AR{gwp_ar} GWP100",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
        "sections": sections,
        "text": "\n".join(text_lines),
        "json": {
            "scope1_tco2e":             round(s1,    4),
            "scope2_tco2e":             round(s2,    4),
            "scope3_tco2e":             round(s3,    4),
            "total_tco2e":              round(total, 4),
            "pct_change_from_base":     round(pct_change, 2) if pct_change else None,
            "base_year":                base_year,
            "base_year_emissions":      base_year_emissions,
            "reduction_target_pct":     reduction_target_pct,
            "reduction_target_year":    reduction_target_year,
            "initiatives_achieved_tco2e": round(ini_achieved, 2),
            "initiatives_pipeline_tco2e": round(ini_pipeline, 2),
        },
    }


def _build_metrics_text(
    org_name, inv_year, s1, s2, s3, total, gwp_ar,
    pct_change, base_year, red_pct, red_yr,
    ini_achieved, ini_pipeline, employees, revenue,
) -> str:
    lines = [
        f"{org_name} reports GHG emissions under IPCC AR{gwp_ar} GWP100:",
        f"  • Scope 1 (direct): {s1:,.2f} tCO₂e",
        f"  • Scope 2 (purchased electricity, location-based): {s2:,.2f} tCO₂e",
        f"  • Scope 3 (value chain): {s3:,.2f} tCO₂e",
        f"  • Total: {total:,.2f} tCO₂e",
    ]
    if employees and employees > 0:
        lines.append(f"  • Intensity: {total/employees:.4f} tCO₂e/employee")
    if revenue and revenue > 0:
        lines.append(f"  • Intensity: {total/revenue:.4f} tCO₂e/crore INR revenue")
    if pct_change is not None:
        direction = "decrease" if pct_change < 0 else "increase"
        lines.append(f"  • {abs(pct_change):.1f}% {direction} vs {base_year} base year")
    if red_pct and red_yr:
        lines.append(f"\nTarget: {red_pct:.0f}% reduction in absolute Scope 1+2 by {red_yr}.")
    if ini_achieved or ini_pipeline:
        lines.append(
            f"\nReduction initiatives: {ini_achieved:,.1f} tCO₂e/yr achieved; "
            f"{ini_pipeline:,.1f} tCO₂e/yr in pipeline."
        )
    return "\n".join(lines)
