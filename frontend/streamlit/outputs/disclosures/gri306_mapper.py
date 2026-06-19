"""
outputs/disclosures/gri306_mapper.py

Maps waste inventory data to GRI 306 — Waste (2020).

GRI 306 disclosures:
  306-1  Waste generation and significant waste-related impacts
  306-2  Management of significant waste-related impacts
  306-3  Waste generated (by type and disposal method)
  306-4  Waste diverted from disposal
  306-5  Waste directed to disposal
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


# Standard waste streams per GRI 306
WASTE_STREAMS = [
    "Hazardous — incineration (with energy recovery)",
    "Hazardous — incineration (without energy recovery)",
    "Hazardous — landfilling",
    "Hazardous — other disposal",
    "Non-hazardous — incineration (with energy recovery)",
    "Non-hazardous — incineration (without energy recovery)",
    "Non-hazardous — landfilling",
    "Non-hazardous — composting",
    "Non-hazardous — other recovery",
]

DIVERSION_METHODS = [
    "Preparation for reuse",
    "Recycling",
    "Other recovery operations",
]


def generate_gri306_disclosure(
    org_profile: dict,
    inventory_year: Optional[int] = None,
    # Waste generated (tonnes)
    total_waste_t: Optional[float] = None,
    hazardous_waste_t: Optional[float] = None,
    non_hazardous_waste_t: Optional[float] = None,
    # Waste diverted from disposal (tonnes)
    recycled_t: Optional[float] = None,
    reused_t: Optional[float] = None,
    composted_t: Optional[float] = None,
    other_recovery_t: Optional[float] = None,
    # Waste directed to disposal (tonnes)
    landfill_t: Optional[float] = None,
    incineration_energy_t: Optional[float] = None,
    incineration_no_energy_t: Optional[float] = None,
    other_disposal_t: Optional[float] = None,
    # Context
    significant_impacts: Optional[str] = None,
    management_approach: Optional[str] = None,
) -> dict:
    """
    Generate GRI 306 Waste disclosure.

    Returns dict with keys: text, json, sections, metadata
    """
    inv_year = inventory_year or org_profile.get("reporting_year", 2024)
    org_name = org_profile.get("org_name", "Organisation")

    # ── Derived totals ────────────────────────────────────────────────────
    # 306-4: Waste diverted
    diverted_total = sum(x for x in [recycled_t, reused_t, composted_t, other_recovery_t]
                         if x is not None)

    # 306-5: Waste to disposal
    disposed_total = sum(x for x in [landfill_t, incineration_energy_t,
                                      incineration_no_energy_t, other_disposal_t]
                         if x is not None)

    # 306-3: Total waste
    if total_waste_t is None:
        total_waste_t = diverted_total + disposed_total if (diverted_total or disposed_total) else None

    # Diversion rate
    diversion_rate = None
    if total_waste_t and total_waste_t > 0 and diverted_total is not None:
        diversion_rate = round(diverted_total / total_waste_t * 100, 2)

    haz = hazardous_waste_t or 0
    non_haz = non_hazardous_waste_t or (
        (total_waste_t - haz) if total_waste_t is not None else None
    )

    # ── Build sections ────────────────────────────────────────────────────
    sections = {
        "306-1": {
            "title": "Waste generation and significant waste-related impacts",
            "data": {
                "total_waste_generated_t": total_waste_t,
                "hazardous_waste_t": haz,
                "non_hazardous_waste_t": non_haz,
                "significant_impacts": significant_impacts or (
                    "Not yet assessed. Conduct waste impact assessment to complete this disclosure."
                ),
            },
        },
        "306-2": {
            "title": "Management of significant waste-related impacts",
            "data": {
                "management_approach": management_approach or (
                    f"{org_name} manages waste in accordance with applicable regulations. "
                    "A formal waste management hierarchy (reduce, reuse, recycle) is applied "
                    "where feasible."
                ),
            },
        },
        "306-3": {
            "title": "Waste generated",
            "data": {
                "total_waste_t": total_waste_t,
                "hazardous_t":   haz,
                "non_hazardous_t": non_haz,
                "diversion_rate_pct": diversion_rate,
                "note": "Tonnes. Report separately by composition where data available.",
            },
        },
        "306-4": {
            "title": "Waste diverted from disposal",
            "data": {
                "total_diverted_t":   diverted_total or 0,
                "recycled_t":         recycled_t,
                "reused_t":           reused_t,
                "composted_t":        composted_t,
                "other_recovery_t":   other_recovery_t,
                "diversion_rate_pct": diversion_rate,
            },
        },
        "306-5": {
            "title": "Waste directed to disposal",
            "data": {
                "total_disposed_t":               disposed_total or 0,
                "landfill_t":                      landfill_t,
                "incineration_with_energy_t":      incineration_energy_t,
                "incineration_without_energy_t":   incineration_no_energy_t,
                "other_disposal_t":                other_disposal_t,
            },
        },
    }

    # ── Text report ────────────────────────────────────────────────────────
    lines = [
        f"GRI 306 Waste Disclosure — {org_name}",
        f"Reporting period: {inv_year}",
        f"Generated: {datetime.now(timezone.utc).strftime('%d %b %Y %H:%M UTC')}",
        "",
    ]
    for disc_id, content in sections.items():
        lines += [
            f"\n{'='*60}",
            f"GRI {disc_id} — {content['title']}",
            f"{'='*60}",
        ]
        for k, v in content["data"].items():
            if v is not None:
                lines.append(f"  {k.replace('_',' ').title()}: {v}")

    if total_waste_t:
        lines += [
            "",
            "SUMMARY",
            f"  Total waste generated:   {total_waste_t:,.2f} t",
            f"  Diverted from disposal:  {diverted_total:,.2f} t  ({diversion_rate or 0:.1f}%)",
            f"  Directed to disposal:    {disposed_total:,.2f} t",
            f"  Hazardous:               {haz:,.2f} t",
        ]

    return {
        "metadata": {
            "framework":      "GRI Standards",
            "standard":       "GRI 306: Waste 2020",
            "organisation":   org_name,
            "inventory_year": inv_year,
            "generated_at":   datetime.now(timezone.utc).isoformat(),
        },
        "sections": sections,
        "text": "\n".join(lines),
        "json": {
            "306_1_total_waste_t":            total_waste_t,
            "306_1_hazardous_t":              haz,
            "306_1_non_hazardous_t":          non_haz,
            "306_4_diverted_t":               diverted_total or 0,
            "306_4_recycled_t":               recycled_t,
            "306_4_reused_t":                 reused_t,
            "306_4_composted_t":              composted_t,
            "306_4_other_recovery_t":         other_recovery_t,
            "306_4_diversion_rate_pct":       diversion_rate,
            "306_5_disposed_t":               disposed_total or 0,
            "306_5_landfill_t":               landfill_t,
            "306_5_incineration_energy_t":    incineration_energy_t,
            "306_5_incineration_no_energy_t": incineration_no_energy_t,
            "306_5_other_disposal_t":         other_disposal_t,
        },
    }
