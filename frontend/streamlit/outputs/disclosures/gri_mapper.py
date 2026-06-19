"""
outputs/disclosures/gri_mapper.py

Maps GHG inventory data to GRI Standards disclosures:
  GRI 302 — Energy (2016)
  GRI 305 — Emissions (2016)

Reference: GRI Standards 2021 Universal + Topic Standards
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


def generate_gri_disclosure(
    inventory,
    org_profile: dict,
    inventory_year: Optional[int] = None,
    energy_from_renewables_mwh: Optional[float] = None,
    total_energy_consumed_mwh: Optional[float] = None,
    base_year: Optional[int] = None,
    base_year_emissions: Optional[float] = None,
    reduction_target_pct: Optional[float] = None,
    reduction_target_year: Optional[int] = None,
) -> dict:
    """
    Generate GRI 302 + GRI 305 disclosure pre-fill.

    Returns dict with keys: text, json, sections, metadata
    """
    inv_year  = inventory_year or org_profile.get("reporting_year", 2024)
    org_id    = org_profile.get("org_id", "default")
    org_name  = org_profile.get("org_name", "Organisation")
    gwp_ar    = org_profile.get("gwp_ar", 6)
    employees = org_profile.get("employees", 0)
    revenue   = org_profile.get("revenue_inr_cr", 0)

    summary  = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    by_cat   = inventory.get_by_category(org_id=org_id, inventory_year=inv_year)
    fallback = inventory.get_fallback_report(org_id=org_id, inventory_year=inv_year)

    s1    = summary.get("scope1_t_co2e", 0)
    s2    = summary.get("scope2_t_co2e", 0)
    s3    = summary.get("scope3_t_co2e", 0)
    total = summary.get("total_t_co2e",  0)
    bio   = summary.get("biogenic_t_co2", 0)
    n_rec = summary.get("n_records", 0)
    n_fb  = summary.get("n_fallback_records", 0)

    # S3 category breakdown
    s3_cats = {r["category"]: r["t_CO2e"] for r in by_cat if r["scope"] == "Scope 3"}

    # Intensity
    intensity_rev = round(total / revenue, 4) if revenue else None
    intensity_emp = round(total / employees, 4) if employees else None

    # Base year comparison
    pct_change = None
    if base_year_emissions and base_year_emissions > 0:
        pct_change = round((total - base_year_emissions) / base_year_emissions * 100, 2)

    # Data quality
    fb_pct = round(n_fb / n_rec * 100, 1) if n_rec else 0

    # ── GRI 302 — Energy ──────────────────────────────────────────────────
    # Auto-derive energy from inventory: Scope 2 electricity (kWh→MWh) +
    # Scope 1 stationary/mobile combustion records (quantity in GJ→MWh)
    energy_elec_mwh = total_energy_consumed_mwh  # user-provided override
    if not energy_elec_mwh:
        # Use get_all_records to access per-record quantity and unit
        try:
            all_recs = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
        except Exception:
            all_recs = []
        auto_elec_mwh = 0.0
        auto_fuel_mwh = 0.0
        for r in all_recs:
            proc = (r.get("process") or "").lower()
            unit = (r.get("unit") or "").lower()
            qty  = float(r.get("quantity") or 0)
            if r.get("scope") == "Scope 2" and "electricity" in proc:
                if unit == "kwh":
                    auto_elec_mwh += qty / 1000
                elif unit == "mwh":
                    auto_elec_mwh += qty
                elif unit == "gj":
                    auto_elec_mwh += qty / 3.6
            elif r.get("scope") == "Scope 1" and ("stationary" in proc or "mobile" in proc):
                if unit == "gj":
                    auto_fuel_mwh += qty / 3.6
                elif unit == "tj":
                    auto_fuel_mwh += qty / 3.6 * 1000
                elif unit == "kwh":
                    auto_fuel_mwh += qty / 1000
                elif unit == "mwh":
                    auto_fuel_mwh += qty
        energy_elec_mwh = auto_elec_mwh + auto_fuel_mwh if (auto_elec_mwh + auto_fuel_mwh) > 0 else None
    re_pct = None
    if energy_elec_mwh and energy_from_renewables_mwh:
        re_pct = round(energy_from_renewables_mwh / energy_elec_mwh * 100, 1)

    gri302 = {
        "302-1": {
            "title": "Energy consumption within the organisation",
            "data": {
                "total_energy_consumed_mwh":      energy_elec_mwh,
                "energy_from_renewables_mwh":     energy_from_renewables_mwh,
                "renewable_energy_pct":           re_pct,
                "note": (
                    "Energy data derived from Scope 1 stationary/mobile combustion "
                    "and Scope 2 purchased electricity records. "
                    "Enter total energy and renewable fraction in Setup for full GRI 302-1."
                    if not energy_elec_mwh else
                    f"Total: {energy_elec_mwh:,.1f} MWh | "
                    f"Renewables: {energy_from_renewables_mwh or 0:,.1f} MWh ({re_pct or 0:.1f}%)"
                ),
            },
        },
        "302-3": {
            "title": "Energy intensity",
            "data": {
                "intensity_mwh_per_crore_inr": (
                    round(energy_elec_mwh / revenue, 2)
                    if energy_elec_mwh and revenue else None
                ),
                "intensity_mwh_per_employee": (
                    round(energy_elec_mwh / employees, 2)
                    if energy_elec_mwh and employees else None
                ),
            },
        },
        "302-4": {
            "title": "Reduction of energy consumption",
            "data": {
                "note": "Document specific energy efficiency initiatives in 🌱 Initiatives page."
            },
        },
    }

    # ── GRI 305 — Emissions ───────────────────────────────────────────────
    gri305 = {
        "305-1": {
            "title": "Direct (Scope 1) GHG emissions",
            "data": {
                "gross_scope1_tco2e": round(s1, 4),
                "gases_included": "CO2, CH4, N2O (and HFCs where applicable)",
                "consolidation": org_profile.get("boundary", "operational control"),
                "gwp_source": f"IPCC AR{gwp_ar} GWP100",
                "biogenic_co2_tco2": round(bio, 4),
            },
        },
        "305-2": {
            "title": "Energy indirect (Scope 2) GHG emissions",
            "data": {
                "gross_scope2_location_tco2e": round(s2, 4),
                "gross_scope2_market_tco2e": None,  # available if market-based EF supplied
                "consolidation": org_profile.get("boundary", "operational control"),
                "gwp_source": f"IPCC AR{gwp_ar} GWP100",
            },
        },
        "305-3": {
            "title": "Other indirect (Scope 3) GHG emissions",
            "data": {
                "gross_scope3_tco2e": round(s3, 4),
                "categories_included": list(s3_cats.keys()),
                "category_breakdown": {
                    k: round(v, 4) for k, v in s3_cats.items()
                },
                "gwp_source": f"IPCC AR{gwp_ar} GWP100",
            },
        },
        "305-4": {
            "title": "GHG emissions intensity",
            "data": {
                "intensity_tco2e_per_crore_inr": intensity_rev,
                "intensity_tco2e_per_employee":  intensity_emp,
                "denominator_unit":              "tCO₂e per crore INR / per FTE",
            },
        },
        "305-5": {
            "title": "Reduction of GHG emissions",
            "data": {
                "base_year":                  base_year,
                "base_year_emissions_tco2e":  base_year_emissions,
                "emissions_reduction_pct":    pct_change,
                "reduction_target_pct":       reduction_target_pct,
                "reduction_target_year":      reduction_target_year,
                "current_vs_base": (
                    f"{abs(pct_change):.1f}% {'decrease' if pct_change and pct_change < 0 else 'increase'} "
                    f"vs {base_year}" if pct_change else "Base year not specified"
                ),
            },
        },
        "305-6": {
            "title": "Emissions of ozone-depleting substances (ODS)",
            "data": {
                "note": "ODS data not captured in this inventory. "
                        "Add refrigerant records with CFC/HCFC fuel items to quantify."
            },
        },
        "305-7": {
            "title": "Nitrogen oxides (NOX), sulfur oxides (SOX), etc.",
            "data": {
                "note": "NOX/SOX data not tracked in this GHG-focused inventory."
            },
        },
    }

    # ── Data quality disclosure ───────────────────────────────────────────
    dq = {
        "n_records": n_rec,
        "pct_primary_data": round(100 - fb_pct, 1),
        "pct_secondary_data": fb_pct,
        "verification_status": "Internal review",
        "external_assurance": "Not obtained — see checklist for guidance",
    }

    # ── Text output ────────────────────────────────────────────────────────
    text_lines = [
        f"GRI 302 & 305 Climate Disclosure — {org_name}",
        f"Reporting period: {inv_year}",
        f"GWP basis: IPCC AR{gwp_ar} GWP100",
        f"Generated: {datetime.now(timezone.utc).strftime('%d %b %Y %H:%M UTC')}",
        "",
        "=" * 60,
        "GRI 302 — ENERGY",
        "=" * 60,
        f"302-1 Energy consumption: {energy_elec_mwh or 'Not provided — enter in Setup'} MWh",
        f"  Renewables: {energy_from_renewables_mwh or 0:,.1f} MWh ({re_pct or 0:.1f}%)",
        "",
        "=" * 60,
        "GRI 305 — EMISSIONS",
        "=" * 60,
        f"305-1 Scope 1 (direct):              {s1:>12,.2f} tCO₂e",
        f"305-2 Scope 2 (indirect, loc-based): {s2:>12,.2f} tCO₂e",
        f"305-3 Scope 3 (value chain):         {s3:>12,.2f} tCO₂e",
        f"      TOTAL:                          {total:>12,.2f} tCO₂e",
        f"      Biogenic CO₂ (separate):        {bio:>12,.2f} tCO₂",
        "",
        "305-4 Intensity:",
    ]
    if intensity_rev:
        text_lines.append(f"  {intensity_rev:.4f} tCO₂e per crore INR")
    if intensity_emp:
        text_lines.append(f"  {intensity_emp:.4f} tCO₂e per employee")
    if pct_change is not None:
        text_lines.append(
            f"\n305-5 Reduction vs {base_year}: "
            f"{abs(pct_change):.1f}% {'decrease' if pct_change < 0 else 'increase'}"
        )
    text_lines += [
        "",
        "305-3 Scope 3 category breakdown:",
    ]
    for cat, val in sorted(s3_cats.items(), key=lambda x: -x[1])[:10]:
        text_lines.append(f"  {cat[:45]:<45} {val:>10,.2f} tCO₂e")
    text_lines += [
        "",
        f"Data quality: {100-fb_pct:.0f}% primary/secondary data",
        f"  {n_fb} of {n_rec} records used global fallback EFs",
    ]

    return {
        "metadata": {
            "framework": "GRI Standards",
            "standards": "GRI 302 (Energy 2016) + GRI 305 (Emissions 2016)",
            "organisation": org_name,
            "inventory_year": inv_year,
            "gwp_source": f"IPCC AR{gwp_ar} GWP100",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
        "sections": {"GRI 302": gri302, "GRI 305": gri305},
        "data_quality": dq,
        "text": "\n".join(text_lines),
        "json": {
            "302_1_energy_mwh":          energy_elec_mwh,
            "302_1_renewables_mwh":      energy_from_renewables_mwh,
            "302_1_renewables_pct":      re_pct,
            "305_1_scope1_tco2e":        round(s1,    4),
            "305_2_scope2_loc_tco2e":    round(s2,    4),
            "305_3_scope3_tco2e":        round(s3,    4),
            "305_total_tco2e":           round(total, 4),
            "305_biogenic_tco2":         round(bio,   4),
            "305_4_intensity_per_cr_inr": intensity_rev,
            "305_4_intensity_per_emp":   intensity_emp,
            "305_5_pct_change_vs_base":  pct_change,
            "305_3_by_category":         {k: round(v,4) for k,v in s3_cats.items()},
        },
    }
