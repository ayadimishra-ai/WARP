"""
sk.lite — CDP Climate Change Questionnaire Mapper.

Maps GHG inventory data to CDP Climate Change 2024 questionnaire sections.

Key sections mapped:
  C1   -- Governance
  C4   -- Targets and performance  
  C6   -- Emissions data (Scope 1 and 2)
  C7   -- Emissions breakdowns
  C11  -- Scope 3 and value chain

Reference: CDP Climate Change Questionnaire 2024
           cdp.net/en/guidance/guidance-for-companies

Usage:
    from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
    report = generate_cdp_disclosure(inventory, org_profile, inv_year=2024)
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


def generate_cdp_disclosure(
    inventory,
    org_profile: dict,
    inventory_year: Optional[int] = None,
    base_year: Optional[int] = None,
    base_year_emissions: Optional[float] = None,
    turnover_usd: Optional[float] = None,    # legacy: total USD
    revenue_usd_m: Optional[float] = None,   # preferred: USD millions
    employees: Optional[int] = None,
) -> dict:
    """
    Generate CDP Climate Change questionnaire pre-fill data.

    Returns:
        dict with keys: text, sections (dict by CDP question ID), json, metadata
    """
    inv_year = inventory_year or org_profile.get("reporting_year", 2024)
    org_id   = org_profile.get("org_id", "default")
    org_name = org_profile.get("org_name", "Organisation")
    gwp_ar   = org_profile.get("gwp_ar", 6)
    country  = org_profile.get("primary_country", "IN")
    boundary = org_profile.get("boundary", "operational_control")

    summary = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    by_cat  = inventory.get_by_category(org_id=org_id, inventory_year=inv_year)

    s1 = summary.get("scope1_t_co2e", 0)
    s2 = summary.get("scope2_t_co2e", 0)
    s3 = summary.get("scope3_t_co2e", 0)
    total = summary.get("total_t_co2e", 0)
    biogenic = summary.get("biogenic_t_co2", 0)

    # Scope 3 breakdown
    s3_cats = {r["category"]: r["t_CO2e"] for r in by_cat if r["scope"] == "Scope 3"}

    # Intensity — support both revenue_usd_m (USD millions, preferred) and legacy turnover_usd
    _rev_usd = None
    if revenue_usd_m and revenue_usd_m > 0:
        _rev_usd = revenue_usd_m * 1_000_000   # convert millions → absolute USD
    elif turnover_usd and turnover_usd > 0:
        _rev_usd = turnover_usd

    intensity_usd = None
    if _rev_usd:
        intensity_usd = round((s1 + s2) / _rev_usd * 1e6, 4)  # tCO2e per $M revenue
    turnover_usd = _rev_usd  # unify name for downstream calls

    # Reduction vs base year
    pct_change = None
    if base_year_emissions and base_year_emissions > 0:
        pct_change = round((total - base_year_emissions) / base_year_emissions * 100, 2)

    sections = _build_cdp_sections(
        org_name=org_name,
        inv_year=inv_year,
        gwp_ar=gwp_ar,
        boundary=boundary,
        country=country,
        s1=s1, s2=s2, s3=s3, total=total, biogenic=biogenic,
        s3_cats=s3_cats,
        base_year=base_year,
        base_year_emissions=base_year_emissions,
        pct_change=pct_change,
        intensity_usd=intensity_usd,
        turnover_usd=turnover_usd,
        employees=employees,
    )

    text = _format_cdp_text(sections, org_name, inv_year)

    return {
        "metadata": {
            "framework": "CDP Climate Change 2024",
            "organisation": org_name,
            "inventory_year": inv_year,
            "gwp_source": f"IPCC AR{gwp_ar} GWP100",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
        "sections": sections,
        "text": text,
        "json": {
            "C6.1_s1_gross_tco2e":      round(s1, 4),
            "C6.3_s2_location_tco2e":   round(s2, 4),
            "C6.5_total_s1_s2_tco2e":   round(s1 + s2, 4),
            "C6.7_biogenic_tco2":        round(biogenic, 4),
            "C11.1_s3_reported":         s3 > 0,
            "C11.1_s3_total_tco2e":      round(s3, 4),
            "C11.1_s3_by_category":      s3_cats,
            "C8_s12_intensity_per_usd_m": intensity_usd,
            "C7_pct_change_vs_base":     pct_change,
            # PCAF financed emissions data quality (C11 Cat 15)
            "C11_pcaf_weighted_avg_score": _calc_pcaf_weighted_avg_cdp(by_cat),
        },
    }


def _calc_pcaf_weighted_avg_cdp(by_cat: list):
    """PCAF weighted average data quality score from Cat 15 records (for CDP C11)."""
    cat15 = [r for r in by_cat if "15" in (r.get("category") or "")]
    if not cat15:
        return None
    total_weight = sum(r.get("t_CO2e", 0) for r in cat15) or 1
    weighted = sum(r.get("t_CO2e", 0) * r.get("pcaf_score", 3) for r in cat15)
    return round(weighted / total_weight, 2)


def _build_cdp_sections(
    org_name, inv_year, gwp_ar, boundary, country,
    s1, s2, s3, total, biogenic, s3_cats,
    base_year, base_year_emissions, pct_change,
    intensity_usd, turnover_usd, employees,
) -> dict:
    """Build CDP question sections as a dict keyed by question ID."""

    gwp_label = {4: "AR4 (IPCC, 2007)", 5: "AR5 (IPCC, 2013)", 6: "AR6 (IPCC, 2021)"}
    boundary_label = {
        "operational_control": "Operational control",
        "financial_control":   "Financial control",
        "equity_share":        "Equity share",
    }

    s = {}

    # C0 -- Introduction
    s["C0.1"] = {
        "question": "Give a general description and introduction to your organisation.",
        "response": f"{org_name}. This CDP disclosure covers GHG emissions for {inv_year}.",
    }

    # C4 -- Targets
    s["C4.1"] = {
        "question": "Did you have an emissions target that was active in the reporting year?",
        "response": "Yes" if base_year else "No -- target not yet set",
    }
    if base_year and pct_change is not None:
        direction = "decreased" if pct_change < 0 else "increased"
        s["C4.2"] = {
            "question": "Provide details of your absolute emissions target(s).",
            "response": (
                f"Base year: {base_year}. "
                f"Base year emissions: {base_year_emissions:,.1f} tCO2e. "
                f"Current year emissions: {total:,.1f} tCO2e. "
                f"Emissions have {direction} by {abs(pct_change):.1f}% vs base year."
            ),
        }

    # C6 -- Scope 1 and 2
    s["C6.1"] = {
        "question": (
            "What were your organisation's gross global Scope 1 emissions in metric tonnes CO2e?"
        ),
        "response": f"{s1:,.2f}",
        "unit": "metric tonnes CO2e",
        "details": {
            "Gross global Scope 1 emissions": f"{s1:,.2f} tCO2e",
            "Methodology": "GHG Protocol Corporate Accounting and Reporting Standard",
            "GWP source": gwp_label.get(gwp_ar, f"AR{gwp_ar}"),
            "Consolidation approach": boundary_label.get(boundary, boundary),
            "Country": country,
        },
    }

    s["C6.3"] = {
        "question": (
            "What were your organisation's gross global Scope 2 emissions in metric tonnes CO2e?"
        ),
        "response": f"{s2:,.2f}",
        "unit": "metric tonnes CO2e",
        "details": {
            "Scope 2 location-based": f"{s2:,.2f} tCO2e",
            "Scope 2 market-based": "See dual reporting in inventory (if market-based data supplied)",
            "Grid EF source": "CEA CO2 Baseline Database v20 (India) / DEFRA 2024 (UK) / other national sources",
        },
    }

    s["C6.5"] = {
        "question": "Account for your organisation's Scope 2 emissions.",
        "response": (
            f"Location-based Scope 2: {s2:,.2f} tCO2e. "
            "Market-based Scope 2: see inventory records for sites with supplier EFs or RECs."
        ),
    }

    s["C6.7"] = {
        "question": (
            "Are carbon dioxide emissions from biologically sequestered carbon "
            "relevant to your organisation?"
        ),
        "response": "Yes" if biogenic > 0 else "No",
        "details": {
            "Biogenic CO2": f"{biogenic:,.4f} tCO2e",
            "Source": "Combustion of biomass fuels (wood, biodiesel, biogas)",
            "Note": "Excluded from total Scope 1 per GHG Protocol guidance",
        },
    }

    # C7 -- Emissions breakdowns
    s["C7.1"] = {
        "question": (
            "Does your organisation break down its Scope 1 emissions by greenhouse gas type?"
        ),
        "response": "Yes -- CO2, CH4, N2O tracked separately per activity record.",
    }

    s["C7.9"] = {
        "question": "How do your gross global emissions (Scope 1 and 2) for the reporting year compare to the previous year?",
        "response": (
            "This is the first year of reporting." if not base_year
            else f"Emissions have {'decreased' if pct_change and pct_change < 0 else 'increased'} "
                 f"by {abs(pct_change):.1f}% vs base year {base_year}."
        ),
    }

    # C8 -- Emissions intensities
    if intensity_usd is not None:
        s["C8.1"] = {
            "question": "Have you intensity figures you would like to report?",
            "response": "Yes",
            "details": {
                "Intensity metric": "tCO2e per USD million revenue (Scope 1+2)",
                "Intensity value": f"{intensity_usd:.4f} tCO2e/USD million",
                "Revenue (USD)": f"{turnover_usd:,.0f}",
            },
        }

    # C11 -- Scope 3
    s["C11.1"] = {
        "question": (
            "Are there any sources of Scope 3 emissions that are relevant to your "
            "organisation but that you do not report on?"
        ),
        "response": (
            f"Scope 3 total: {s3:,.2f} tCO2e across {len(s3_cats)} reported categories."
            if s3 > 0
            else "Scope 3 not yet quantified for this reporting year."
        ),
    }

    if s3_cats:
        cat_details = {}
        for i, (cat, val) in enumerate(
            sorted(s3_cats.items(), key=lambda x: -x[1]), start=1
        ):
            # Map to CDP Scope 3 category numbering
            cdp_cat_no = _guess_cdp_cat_number(cat)
            cat_details[f"Category {cdp_cat_no}: {cat}"] = f"{val:,.3f} tCO2e"
        s["C11.1_breakdown"] = {
            "question": "Scope 3 emissions by category.",
            "response": f"Total: {s3:,.2f} tCO2e",
            "details": cat_details,
        }

    s["C11.3"] = {
        "question": "Do you engage with your value chain on climate-related issues?",
        "response": (
            "Engagement in progress. Supplier-specific emission factors collected for "
            f"{sum(1 for r in s3_cats if 'supplier' in r.lower())} categories."
            if s3_cats
            else "Value chain engagement planned for next reporting cycle."
        ),
    }

    return s


def _guess_cdp_cat_number(cat_str: str) -> str:
    """Map internal category name to CDP Scope 3 category number."""
    mapping = {
        "cat 1": "1", "purchased goods": "1",
        "cat 2": "2", "capital goods": "2",
        "cat 3": "3", "upstream energy": "3", "fuel and energy": "3",
        "cat 4": "4", "upstream transport": "4",
        "cat 5": "5", "waste": "5",
        "cat 6": "6", "business travel": "6",
        "cat 7": "7", "commuting": "7", "employee commuting": "7",
        "cat 8": "8", "leased assets": "8", "upstream leased": "8",
        "cat 9": "9", "downstream transport": "9",
        "cat 10": "10", "processing": "10",
        "cat 11": "11", "use of sold": "11",
        "cat 12": "12", "end-of-life": "12",
        "cat 13": "13", "downstream leased": "13",
        "cat 14": "14", "franchise": "14",
        "cat 15": "15", "investment": "15",
    }
    cat_lower = cat_str.lower()
    for key, num in mapping.items():
        if key in cat_lower:
            return num
    return "?"


def _format_cdp_text(sections: dict, org_name: str, inv_year: int) -> str:
    """Format as readable text for review before CDP submission."""
    lines = [
        "=" * 70,
        "CDP CLIMATE CHANGE QUESTIONNAIRE -- PRE-FILL REPORT",
        f"Organisation: {org_name}",
        f"Reporting Year: {inv_year}",
        "Generated by sk.lite | Review before submission to CDP portal",
        "=" * 70,
        "",
    ]

    for q_id, section in sections.items():
        if "_breakdown" in q_id:
            continue   # included inline
        lines.append(f"\n{q_id}: {section.get('question', '')}")
        lines.append(f"  Response: {section.get('response', '')}")
        if "unit" in section:
            lines.append(f"  Unit: {section['unit']}")
        details = section.get("details", {})
        for k, v in details.items():
            lines.append(f"    {k}: {v}")

    lines += [
        "",
        "=" * 70,
        "NOTE: This is a pre-fill aid. Review all responses before",
        "submitting through the official CDP online portal.",
        "=" * 70,
    ]
    return "\n".join(lines)


def to_csv(cdp_report: dict) -> str:
    """Export CDP sections as CSV."""
    sections = cdp_report["sections"]
    lines = ['"Question ID","Question","Response","Notes"']
    for q_id, section in sections.items():
        q   = section.get("question", "").replace('"', "'")
        r   = section.get("response", "").replace('"', "'")
        det = "; ".join(f"{k}: {v}" for k, v in section.get("details", {}).items())
        lines.append(f'"{q_id}","{q}","{r}","{det}"')
    return "\n".join(lines)
