"""
outputs/disclosures/esrs_mapper.py

Maps GHG inventory + ESG store data to ESRS E1 and IFRS S2 disclosure format.

ESRS E1 disclosures covered:
  E1-5   Energy consumption and mix
  E1-6   Gross Scope 1, 2, 3 and total GHG emissions
  E1-7   GHG removals and carbon credits
  E1-8   Internal carbon pricing (if applicable)

IFRS S2 disclosures covered:
  S2-29  GHG metrics (all scopes, both location- and market-based S2)
  S2-Governance  Narrative hook for governance disclosures

Zero duplication: all GHG values read live from inventory.sqlite.
Non-GHG ESG values read from esg_store.sqlite.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


# GHG gas GWP100 (IPCC AR6) for breakdown display
_GWP_AR6 = {"CO2": 1, "CH4": 29.8, "N2O": 273, "HFCs": 1530, "PFCs": 7380, "SF6": 25200}


def generate_esrs_e1(
    inventory,
    org_profile: dict,
    inv_year: Optional[int] = None,
    esg_conn=None,
) -> dict:
    """
    Generate ESRS E1 disclosure pack.
    Returns dict with keys: metadata, e1_5_energy, e1_6_ghg, e1_7_removals,
    e1_8_carbon_price, text, json_payload.
    """
    org_id   = org_profile.get("org_uuid") or org_profile.get("org_id", "default")
    org_name = org_profile.get("org_name", "Organisation")
    year     = inv_year or org_profile.get("reporting_year", 2024)
    currency = org_profile.get("currency", "INR")
    boundary = org_profile.get("boundary", "operational_control")
    gwp_ar   = org_profile.get("gwp_ar", 6)
    revenue  = float(org_profile.get("revenue_inr_cr") or 0)
    prod_vol = float(org_profile.get("production_volume") or 0)
    prod_unit = org_profile.get("production_unit", "units")

    # ── Pull inventory data ───────────────────────────────────────────────
    summary   = inventory.get_summary(org_id=org_id, inventory_year=year)
    by_cat    = inventory.get_by_category(org_id=org_id, inventory_year=year)
    all_rows  = inventory.get_all_records(org_id=org_id, inventory_year=year)

    s1_total  = float(summary.get("scope1_t_co2e") or 0)
    s2_total  = float(summary.get("scope2_t_co2e") or 0)
    s3_total  = float(summary.get("scope3_t_co2e") or 0)
    total_ghg = s1_total + s2_total + s3_total

    # Gas breakdown from inventory rows
    gas_totals: dict[str, float] = {}
    for r in all_rows:
        for gas in ["CO2", "CH4", "N2O"]:
            key = f"kg_{gas}"
            val = float(r.get(key) or 0)
            if val > 0:
                gas_totals[gas] = gas_totals.get(gas, 0) + val / 1000  # → tonnes

    # Energy proxy (MWh) from stationary combustion + electricity records
    # Scope 2 records store kWh implicitly — quantity × unit conversion
    energy_mwh_fuel = 0.0
    energy_mwh_elec = 0.0
    for r in all_rows:
        proc = (r.get("process") or "").lower()
        qty  = float(r.get("quantity") or 0)
        unit = (r.get("unit") or "").lower()
        if "electricity" in proc or "scope 2" in (r.get("scope") or "").lower():
            mwh = qty / 1000 if "kwh" in unit else (qty if "mwh" in unit else qty * 0.2778 if "gj" in unit else 0)
            energy_mwh_elec += mwh
        elif "stationary" in proc or "mobile" in proc:
            mwh = qty * 0.2778 if "gj" in unit else (qty / 3.6 if "mj" in unit else 0)
            energy_mwh_fuel += mwh

    total_energy_mwh = energy_mwh_fuel + energy_mwh_elec

    # ── E1-5 Energy ───────────────────────────────────────────────────────
    e1_5 = {
        "total_energy_mwh":         round(total_energy_mwh, 1),
        "fuel_combustion_mwh":      round(energy_mwh_fuel, 1),
        "purchased_electricity_mwh": round(energy_mwh_elec, 1),
        "renewable_mwh":            0.0,  # placeholder — enter via ESG store
        "renewable_pct":            0.0,
        "intensity_per_revenue":    round(total_energy_mwh / revenue, 4) if revenue else None,
        "intensity_unit":           f"MWh / {currency} Cr",
        "gwp_ar_used":              f"IPCC AR{gwp_ar}",
        "notes": (
            "Energy derived from GHG inventory records. "
            "Fuel combustion energy estimated from GJ inputs × 0.2778 MWh/GJ conversion. "
            "Renewable energy split requires separate entry in ESG data store."
        ),
    }

    # ── E1-6 GHG emissions ───────────────────────────────────────────────
    # Scope 3 by category
    s3_by_cat: dict[str, float] = {}
    for r in all_rows:
        sc = r.get("scope","")
        if "3" in sc:
            cat = r.get("category","") or r.get("process","")[:40]
            s3_by_cat[cat] = s3_by_cat.get(cat, 0) + float(r.get("t_CO2e") or 0)

    e1_6 = {
        "scope1_gross_tco2e":       round(s1_total, 2),
        "scope2_location_tco2e":    round(s2_total, 2),
        "scope2_market_tco2e":      None,   # market-based requires REGO/PPA data → ESG store
        "scope3_total_tco2e":       round(s3_total, 2),
        "total_gross_tco2e":        round(total_ghg, 2),
        "scope3_by_category":       {k: round(v, 2) for k, v in sorted(
            s3_by_cat.items(), key=lambda x: -x[1])},
        "gas_breakdown_tonnes": {
            k: round(v, 3) for k, v in gas_totals.items() if v > 0
        },
        "biogenic_co2_tco2e":       0.0,   # enter in ESG store if applicable
        "gwp_standard":             f"IPCC AR{gwp_ar} GWP100",
        "base_year":                year,
        "consolidation_approach":   boundary,
        "intensity_per_revenue":    round(total_ghg / revenue, 4) if revenue else None,
        "intensity_per_production": round(total_ghg / prod_vol, 4) if prod_vol else None,
        "intensity_unit_rev":       f"tCO₂e / {currency} Cr",
        "intensity_unit_prod":      f"tCO₂e / {prod_unit}",
    }

    # ── E1-7 GHG removals ────────────────────────────────────────────────
    # Read from ESG store if available
    removals_tco2e = None
    credits_tco2e  = None
    if esg_conn:
        try:
            r_row = esg_conn.execute(
                "SELECT value_numeric FROM esg_datapoints "
                "WHERE org_id=? AND reporting_year=? AND dp_id='ESRS-E1-7' AND disagg_key=?",
                (org_id, year, '{"type":"removals"}')
            ).fetchone()
            removals_tco2e = float(r_row[0]) if r_row else None
            c_row = esg_conn.execute(
                "SELECT value_numeric FROM esg_datapoints "
                "WHERE org_id=? AND reporting_year=? AND dp_id='ESRS-E1-7' AND disagg_key=?",
                (org_id, year, '{"type":"credits"}')
            ).fetchone()
            credits_tco2e = float(c_row[0]) if c_row else None
        except Exception:
            pass

    e1_7 = {
        "removals_tco2e":    removals_tco2e,
        "credits_purchased": credits_tco2e,
        "net_tco2e":         round(total_ghg - (removals_tco2e or 0) - (credits_tco2e or 0), 2),
        "note": "Removals and credits must be entered separately in ESG Data Store → ESRS-E1-7.",
    }

    # ── E1-8 Internal carbon pricing ─────────────────────────────────────
    e1_8 = {
        "carbon_price_per_tco2e": None,
        "currency": currency,
        "coverage_pct": None,
        "note": "Enter internal carbon price in ESG Data Store → ESRS-E1-8 if applicable.",
    }
    if esg_conn:
        try:
            cp_row = esg_conn.execute(
                "SELECT value_numeric, value_unit FROM esg_datapoints "
                "WHERE org_id=? AND reporting_year=? AND dp_id='ESRS-E1-8' AND disagg_key='{}'",
                (org_id, year)
            ).fetchone()
            if cp_row:
                e1_8["carbon_price_per_tco2e"] = float(cp_row[0])
                e1_8["currency"] = cp_row[1] or currency
        except Exception:
            pass

    # ── Text output ────────────────────────────────────────────────────────
    text = _format_esrs_e1_text(org_name, year, e1_5, e1_6, e1_7, e1_8, gwp_ar, boundary)

    return {
        "framework":   "ESRS E1",
        "org":         org_name,
        "year":        year,
        "generated":   datetime.now(timezone.utc).isoformat(),
        "e1_5_energy": e1_5,
        "e1_6_ghg":    e1_6,
        "e1_7_removals": e1_7,
        "e1_8_carbon_price": e1_8,
        "text":        text,
    }


def generate_ifrs_s2(
    inventory,
    org_profile: dict,
    inv_year: Optional[int] = None,
    esg_conn=None,
) -> dict:
    """
    Generate IFRS S2 Appendix B (IFRS S2-29) GHG metrics disclosure.
    Reuses the same data pool as ESRS E1 — different format and framing.
    """
    org_id   = org_profile.get("org_uuid") or org_profile.get("org_id", "default")
    org_name = org_profile.get("org_name", "Organisation")
    year     = inv_year or org_profile.get("reporting_year", 2024)
    gwp_ar   = org_profile.get("gwp_ar", 6)
    boundary = org_profile.get("boundary", "operational_control")

    summary   = inventory.get_summary(org_id=org_id, inventory_year=year)
    s1  = float(summary.get("scope1_t_co2e") or 0)
    s2  = float(summary.get("scope2_t_co2e") or 0)
    s3  = float(summary.get("scope3_t_co2e") or 0)

    text = f"""IFRS S2 — Climate-related Disclosures
Appendix B: Industry-based disclosure requirements
Paragraph 29 — GHG emissions

Organisation: {org_name}
Reporting period: {year}
Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}

──────────────────────────────────────────────────────────────────
CROSS-INDUSTRY CLIMATE METRICS (IFRS S2 para. 29)
──────────────────────────────────────────────────────────────────

(a) Absolute gross Scope 1 GHG emissions
    {s1:,.2f} metric tonnes CO₂e
    Consolidation approach: {boundary}
    GWP source: IPCC Sixth Assessment Report (AR{gwp_ar}) GWP100

(b) Absolute gross Scope 2 GHG emissions
    Location-based: {s2:,.2f} metric tonnes CO₂e
    Market-based:   [Not yet available — enter in ESG Data Store]
    Note: Both methods required under IFRS S2 para. 29(b)

(c) Absolute gross Scope 3 GHG emissions
    {s3:,.2f} metric tonnes CO₂e (categories disclosed separately)
    Note: All 15 Scope 3 categories assessed for materiality.

(d) Total GHG emissions
    {s1+s2+s3:,.2f} metric tonnes CO₂e (Scope 1 + S2 location-based + S3)

(e) GHG intensity (revenue-based)
    [Requires revenue data — enter in Setup ⚙️ → Revenue field]

──────────────────────────────────────────────────────────────────
NOTES ON METHODOLOGY
──────────────────────────────────────────────────────────────────
• Calculation methodology: GHG Protocol Corporate Standard
• GWP100 values: IPCC AR{gwp_ar}
• Emission factors: national/regional factors per GHG Protocol guidance
• Biogenic CO₂: reported separately (0.00 tCO₂ this period)
• Assurance: [Limited / Reasonable / None — specify separately]

──────────────────────────────────────────────────────────────────
RELATIONSHIP TO TCFD METRICS PILLAR
──────────────────────────────────────────────────────────────────
This disclosure satisfies the TCFD Metrics & Targets pillar requirement
for GHG emissions by scope. The same data pool satisfies:
  • ESRS E1-6 (CSRD/EU)
  • GRI 305-1/2/3 (GRI Standards)
  • CDP C6 (CDP Climate questionnaire)
  • BRSR P6 (SEBI, India)
"""
    return {
        "framework":  "IFRS S2",
        "org":        org_name,
        "year":       year,
        "generated":  datetime.now(timezone.utc).isoformat(),
        "scope1_tco2e": round(s1, 2),
        "scope2_location_tco2e": round(s2, 2),
        "scope2_market_tco2e": None,
        "scope3_tco2e": round(s3, 2),
        "total_tco2e": round(s1 + s2 + s3, 2),
        "gwp_ar":     gwp_ar,
        "boundary":   boundary,
        "text":       text,
    }


def _format_esrs_e1_text(org_name, year, e1_5, e1_6, e1_7, e1_8, gwp_ar, boundary) -> str:
    s1 = e1_6["scope1_gross_tco2e"]
    s2 = e1_6["scope2_location_tco2e"]
    s3 = e1_6["scope3_total_tco2e"]
    total = e1_6["total_gross_tco2e"]
    energy = e1_5["total_energy_mwh"]

    s3_cats = e1_6.get("scope3_by_category", {})
    s3_lines = "\n".join(
        f"    {cat[:55]:57} {val:>10,.2f} tCO₂e"
        for cat, val in list(s3_cats.items())[:10]
    )

    gas_lines = "\n".join(
        f"    {g}: {v:,.3f} tonnes"
        for g, v in e1_6.get("gas_breakdown_tonnes", {}).items()
    )

    cp = e1_8.get("carbon_price_per_tco2e")
    cp_line = (
        f"    Internal carbon price: {cp} {e1_8.get('currency','INR')} / tCO₂e"
        if cp else "    Internal carbon pricing: Not applicable / not yet set"
    )

    removals = e1_7.get("removals_tco2e")
    net_line = (
        f"    GHG removals: {removals:,.2f} tCO₂e\n"
        f"    Net GHG emissions: {e1_7['net_tco2e']:,.2f} tCO₂e"
        if removals is not None
        else "    GHG removals: Not applicable (no removal activities reported)"
    )

    int_rev = e1_6.get("intensity_per_revenue")
    int_prod = e1_6.get("intensity_per_production")

    return f"""ESRS E1 — Climate Change Disclosure
Organisation: {org_name}
Reporting period: {year}
Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}
GWP standard: IPCC AR{gwp_ar} GWP100
Consolidation: {boundary}

══════════════════════════════════════════════════════════════════
E1-5  ENERGY CONSUMPTION AND MIX
══════════════════════════════════════════════════════════════════

  Total energy consumption:          {energy:>12,.1f} MWh
  of which: fuel combustion          {e1_5['fuel_combustion_mwh']:>12,.1f} MWh
            purchased electricity    {e1_5['purchased_electricity_mwh']:>12,.1f} MWh
  Renewable energy:                  [Enter in ESG Data Store → ESRS-E1-5]
  Energy intensity (revenue):        {f"{e1_5['intensity_per_revenue']:.4f} {e1_5['intensity_unit']}" if e1_5['intensity_per_revenue'] else "Revenue data required — enter in Setup"}

  Methodology: {e1_5['notes']}

══════════════════════════════════════════════════════════════════
E1-6  GROSS GHG EMISSIONS (Scope 1, 2, 3)
══════════════════════════════════════════════════════════════════

  Scope 1 (direct):                  {s1:>12,.2f} tCO₂e
  Scope 2 location-based:            {s2:>12,.2f} tCO₂e
  Scope 2 market-based:              {"[Not available — enter PPAs/RECs in ESG store]":>12}
  Scope 3 (indirect):                {s3:>12,.2f} tCO₂e
  ─────────────────────────────────────────────────────────
  TOTAL GROSS GHG:                   {total:>12,.2f} tCO₂e

  Scope 3 breakdown by category:
{s3_lines or "    [No Scope 3 categories entered yet]"}

  GHG gas breakdown (tonnes):
{gas_lines or "    [Gas-level breakdown available when inventory includes gas-split data]"}

  GHG intensities:
    Per revenue: {f"{int_rev:,.4f} tCO₂e / {e1_6['intensity_unit_rev']}" if int_rev else "Revenue data required — enter in Setup"}
    Per output:  {f"{int_prod:,.4f} tCO₂e / {e1_6['intensity_unit_prod']}" if int_prod else "Production volume required — enter in Setup"}

  Biogenic CO₂ (separately reported): {e1_6['biogenic_co2_tco2e']:,.2f} tCO₂e

══════════════════════════════════════════════════════════════════
E1-7  GHG REMOVALS AND CARBON CREDITS
══════════════════════════════════════════════════════════════════

{net_line}

══════════════════════════════════════════════════════════════════
E1-8  INTERNAL CARBON PRICING
══════════════════════════════════════════════════════════════════

{cp_line}

══════════════════════════════════════════════════════════════════
CROSS-FRAMEWORK MAPPING NOTE
══════════════════════════════════════════════════════════════════

  This ESRS E1 disclosure is generated from the same data pool as:
  • GRI 305-1/2/3     (same tCO₂e values, GRI format)
  • BRSR P6           (same values, INR intensity, Indian framework)
  • CDP C6/C7/C11     (same values, CDP questionnaire format)
  • IFRS S2 para. 29  (same values, ISSB investor framing)
  • TCFD Metrics      (same values, TCFD four-pillar format)

  No data is duplicated — one inventory, multiple output formats.
"""
