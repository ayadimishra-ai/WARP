"""
sk.lite — Recommendations Engine.

Generates contextual recommendations across all pages:
  - Why: root cause analysis from inventory data
  - How: specific action with validated methodology
  - Impact: estimated tCO2e reduction + profitability benefit
  - Assumptions: data basis and confidence level
  - ESG business case: why this matters for profitability and risk
"""
from __future__ import annotations
from typing import Optional


# ── Profitability impact library ─────────────────────────────────────────────
# Source: CDP 2023, MSCI ESG research, McKinsey Sustainability Value
PROFITABILITY_IMPACTS = {
    "renewable_energy": {
        "roi_pct":       "15–25% IRR (solar PPA/rooftop, India 2024)",
        "payback_yrs":   "3–5 years",
        "risk_reduction":"Eliminates electricity cost volatility; reduces DISCOM dependency",
        "revenue_link":  "Green product premium 3–8% for B2B customers with net-zero commitments",
        "cost_saving":   "Tariff lock-in vs rising grid costs; avoided carbon tax exposure",
        "reference":     "MNRE solar cost data 2024; CDP Supply Chain Report 2023",
    },
    "fuel_switching": {
        "roi_pct":       "20–35% fuel cost reduction (diesel → CNG); near-zero for biogas",
        "payback_yrs":   "2–4 years",
        "risk_reduction":"Reduces exposure to diesel price volatility (±30% annual swings)",
        "revenue_link":  "Required for EV/CNG fleet certification in green logistics tenders",
        "cost_saving":   "CNG: Rs 30–40/L cheaper than diesel equivalent energy",
        "reference":     "CPCB emission factors 2023; SIAM fleet data",
    },
    "modal_shift": {
        "roi_pct":       "10–20% logistics cost reduction (road → rail for >500 km)",
        "payback_yrs":   "Immediate (operational, not capital)",
        "risk_reduction":"Reduces driver shortage exposure; lower accident risk",
        "revenue_link":  "Qualifies for green logistics label in automotive/FMCG supply chain",
        "cost_saving":   "Rail: Rs 1.2–2.5/t·km vs road Rs 3–5/t·km",
        "reference":     "Indian Railways freight tariff 2024; DEFRA modal EFs",
    },
    "supplier_engagement": {
        "roi_pct":       "5–15% procurement cost reduction through supplier efficiency gains",
        "payback_yrs":   "2–3 years (programme cost vs savings)",
        "risk_reduction":"Reduces supply disruption from regulation non-compliance",
        "revenue_link":  "Required for Walmart/Unilever/L&T supplier ESG qualification",
        "cost_saving":   "Avoids rework/recall costs from quality ESG incidents",
        "reference":     "CDP Supply Chain 2023; EcoVadis SME study 2022",
    },
    "energy_efficiency": {
        "roi_pct":       "15–30% energy cost reduction (LED, VFDs, waste heat)",
        "payback_yrs":   "1–3 years",
        "risk_reduction":"Lower carbon tax liability under India's PAT scheme",
        "revenue_link":  "Energy intensity reduction qualifies for BEE star rating",
        "cost_saving":   "LED retrofit: Rs 50–120/kWh saved over lifetime",
        "reference":     "BEE energy audit data 2023; TERI industrial EE study",
    },
    "sbti_target": {
        "roi_pct":       "Cost of capital reduction 0.2–0.5% (ESG-linked financing)",
        "payback_yrs":   "Ongoing (annual interest saving on ESG bonds)",
        "risk_reduction":"Avoids SEBI BRSR greenwashing scrutiny; attracts ESG funds",
        "revenue_link":  "SBTi commitment required for Tier 1 supplier status in EU markets",
        "cost_saving":   "MSCI ESG premium: SBTi-committed firms trade at P/E premium of 2–4x",
        "reference":     "SBTi Corporate Progress Report 2023; MSCI ESG Ratings 2024",
    },
}


def build_recommendation(
    name: str,
    category: str,
    scope: str,
    rationale: str,
    target_tco2e: Optional[float],
    rec_type: str,
    industry: str = "",
    priority: str = "Medium",
    assumptions: str = "",
) -> dict:
    """
    Build a full recommendation dict with why/how/impact/profitability.
    """
    pi = PROFITABILITY_IMPACTS.get(rec_type, {})

    business_case_parts = []
    if pi.get("cost_saving"):
        business_case_parts.append("Cost saving: " + pi["cost_saving"])
    if pi.get("roi_pct"):
        business_case_parts.append("ROI: " + pi["roi_pct"])
    if pi.get("revenue_link"):
        business_case_parts.append("Revenue: " + pi["revenue_link"])
    if pi.get("risk_reduction"):
        business_case_parts.append("Risk: " + pi["risk_reduction"])

    return {
        "name":          name,
        "category":      category,
        "scope":         scope,
        "priority":      priority,
        "why":           rationale,
        "how": {
            "energy_efficiency": "1. Commission energy audit (BEE empanelled auditor). "
                                  "2. Prioritise LED + VFD retrofits (highest ROI). "
                                  "3. Apply for BEE PAT scheme certification.",
            "renewable_energy":  "1. Get rooftop solar feasibility study (MNRE empanelled). "
                                  "2. Issue RFP for PPA (25-yr fixed tariff). "
                                  "3. Register RECs on IEX for market-based Scope 2 reporting.",
            "fuel_switching":    "1. Audit current diesel consumption by vehicle type. "
                                  "2. Map CNG station coverage on key routes. "
                                  "3. Convert high-mileage vehicles first (best payback).",
            "modal_shift":       "1. Map lanes >500 km (rail breakeven distance). "
                                  "2. Request rail freight quote from Indian Railways. "
                                  "3. Pilot one lane; measure lead time impact.",
            "supplier_engagement":"1. Send ESG questionnaire via sk.lite supplier portal. "
                                  "2. Score responses (auto-calculated). "
                                  "3. Set improvement targets for Red-rated suppliers.",
            "sbti_target":       "1. Submit SBTi commitment letter (free, 2-yr validation window). "
                                  "2. Calculate near-term target (42% S1+S2 by 2030). "
                                  "3. Use sk.lite SBTi tab to model pathway.",
        }.get(rec_type, "Consult sustainability advisor for implementation roadmap."),
        "target_tco2e":  target_tco2e,
        "profitability": " | ".join(business_case_parts) if business_case_parts else "",
        "payback":       pi.get("payback_yrs", ""),
        "assumptions":   assumptions or pi.get("reference", ""),
        "methodology":   {
            "energy_efficiency": "IPCC Tier 2 + metered consumption (post-retrofit)",
            "renewable_energy":  "GHG Protocol Scope 2 market-based; IEA renewable EF",
            "fuel_switching":    "IPCC 2006 Vol 2; CPCB emission factors India",
            "modal_shift":       "DEFRA 2024 freight EFs; Indian Railways tonne-km data",
            "supplier_engagement":"GHG Protocol Corporate Value Chain Standard (Cat 1)",
            "sbti_target":       "SBTi Corporate Standard v5; absolute contraction 1.5°C",
        }.get(rec_type, "GHG Protocol Corporate Standard"),
        "status":        "Planned",
    }


def inventory_recommendations(profile: dict, inventory) -> list[dict]:
    """
    Generate data-driven recommendations from live inventory.
    All numbers come from actual recorded emissions. Year references use
    the organisation's own reporting_year and fiscal context.
    """
    recs = []
    industry    = profile.get("industry", "")
    org_id      = profile.get("org_id", "default")
    inv_year    = profile.get("reporting_year", 2024)
    # Target years: near-term = 5 years out, net-zero = 2050
    near_term_year = min(inv_year + 6, 2030)
    # SBTi baseline: use reporting year as proxy if no prior year
    base_year   = profile.get("base_year", inv_year)
    # Years remaining to 2030 target
    yrs_to_2030 = max(1, 2030 - inv_year)
    currency    = profile.get("currency", "INR")
    curr_sym    = {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£"}.get(currency, currency)

    try:
        all_rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
        total_t  = sum(float(r.get("t_CO2e") or 0) for r in all_rows)
        scope_t: dict[str, float] = {}
        proc_t:  dict[str, float] = {}
        for r in all_rows:
            sc = r.get("scope", "Unknown")
            scope_t[sc] = scope_t.get(sc, 0) + float(r.get("t_CO2e") or 0)
            proc = (r.get("process") or "Unknown").split("—")[-1].strip()
            proc_t[proc] = proc_t.get(proc, 0) + float(r.get("t_CO2e") or 0)
        s1 = scope_t.get("Scope 1", 0)
        s2 = scope_t.get("Scope 2", 0)
        s3 = scope_t.get("Scope 3", 0)

        if total_t == 0:
            # No inventory data — return generic recommendations with no numbers
            recs.append(build_recommendation(
                name="Complete your GHG inventory first",
                category="Data quality", scope="All scopes",
                rationale=(
                    f"No inventory data for FY {inv_year}. "
                    "Enter Scope 1, 2, and 3 data to get personalised recommendations "
                    "with actual reduction targets and payback calculations."
                ),
                target_tco2e=None, rec_type="energy_efficiency",
                industry=industry, priority="High",
                assumptions="Recommendations will be quantified once inventory data is entered.",
            ))
        else:
            s2_pct = s2 / total_t * 100 if total_t else 0
            s1_pct = s1 / total_t * 100 if total_t else 0
            s3_pct = s3 / total_t * 100 if total_t else 0
            # Annual reduction needed for 1.5C: 42% by 2030 from base year
            annual_reduction_needed = total_t * 0.42 / yrs_to_2030

            # ── S2 dominant: renewable energy ─────────────────────────────
            if s2_pct > 20:
                recs.append(build_recommendation(
                    name="Switch to renewable electricity (PPA / rooftop solar)",
                    category="Renewable energy", scope="Scope 2",
                    rationale=(
                        f"Your Scope 2 = **{s2:,.0f} tCO₂e** ({s2_pct:.0f}% of total "
                        f"{total_t:,.0f} tCO₂e in FY {inv_year}). "
                        f"Eliminating grid electricity via a solar PPA or rooftop solar "
                        f"would save ~{round(s2*0.8):,.0f} tCO₂e/yr — "
                        f"your single largest available reduction. "
                        f"This contributes {round(s2*0.8/annual_reduction_needed*100):.0f}% "
                        f"of the {total_t*0.42:,.0f} tCO₂e reduction needed by {near_term_year} "
                        f"for 1.5°C alignment."
                    ),
                    target_tco2e=round(s2 * 0.8, 1),
                    rec_type="renewable_energy",
                    industry=industry,
                    priority="High" if s2_pct > 30 else "Medium",
                    assumptions=(
                        f"80% elimination assumes full PPA coverage of {s2:,.0f} tCO₂e; "
                        "20% residual = night load and off-grid equipment. "
                        "CapEx estimate based on Rs 3.5 Cr/MW (2024 MNRE benchmark)."
                    ),
                ))

            # ── S1 dominant: fuel switching ───────────────────────────────
            if s1_pct > 15:
                # Find top S1 process
                top_s1_proc = max(
                    ((p, t) for p, t in proc_t.items() if "scope 1" in p.lower() or
                     any(x in p.lower() for x in ["diesel","combustion","mobile","stationary"])),
                    key=lambda x: x[1], default=("combustion", s1)
                )
                recs.append(build_recommendation(
                    name="Fuel switch: diesel → CNG / biogas for fleet & boilers",
                    category="Fuel switching", scope="Scope 1",
                    rationale=(
                        f"Your Scope 1 = **{s1:,.0f} tCO₂e** ({s1_pct:.0f}% of total in FY {inv_year}). "
                        f"Switching diesel fleet and boilers to CNG saves 25–35% on fuel emissions "
                        f"= ~{round(s1*0.3):,.0f} tCO₂e/yr. "
                        f"CNG is {curr_sym}30–40/L cheaper than diesel equivalent energy, "
                        "improving operating margins immediately."
                    ),
                    target_tco2e=round(s1 * 0.3, 1),
                    rec_type="fuel_switching",
                    industry=industry,
                    priority="High" if s1_pct > 25 else "Medium",
                    assumptions=(
                        f"30% Scope 1 reduction from CNG conversion of top-mileage HGVs "
                        f"({round(s1*0.3):,.0f} tCO₂e). CNG station coverage on key routes assumed. "
                        "Biogas available as drop-in for stationary boilers in some regions."
                    ),
                ))

            # ── S3 dominant: supplier engagement ─────────────────────────
            if s3_pct > 35:
                recs.append(build_recommendation(
                    name="Supplier emissions reduction programme (Cat 1)",
                    category="Supply chain", scope="Scope 3",
                    rationale=(
                        f"Your Scope 3 = **{s3:,.0f} tCO₂e** ({s3_pct:.0f}% of total in FY {inv_year}). "
                        "Cat 1 purchased goods typically = 60–80% of Scope 3 for manufacturers. "
                        f"Engaging your top 10 suppliers to cut their Scope 1+2 by 15% "
                        f"would reduce your Scope 3 by ~{round(s3*0.12):,.0f} tCO₂e/yr — "
                        "without changing any of your own operations."
                    ),
                    target_tco2e=round(s3 * 0.12, 1),
                    rec_type="supplier_engagement",
                    industry=industry, priority="High",
                    assumptions=(
                        f"12% S3 reduction based on CDP 2023 average supplier programme outcome (13.5%). "
                        "Assumes top 10 suppliers represent ~60% of Cat 1 spend. "
                        "3-year programme timeline."
                    ),
                ))

            # ── Energy efficiency (always relevant) ───────────────────────
            ee_saving = round(s2 * 0.25, 1) if s2 > 0 else None
            recs.append(build_recommendation(
                name="LED lighting + VFD motors retrofit across facilities",
                category="Energy efficiency", scope="Scope 2",
                rationale=(
                    f"LED and VFD retrofits consistently deliver 20–60% reduction in "
                    "lighting and motor energy with 1–3 year payback. "
                    + (f"Applied to your Scope 2 of {s2:,.0f} tCO₂e, "
                       f"a 25% improvement = {ee_saving:,.0f} tCO₂e/yr saved." if ee_saving
                       else "Low capital, no process disruption.")
                ),
                target_tco2e=ee_saving,
                rec_type="energy_efficiency",
                industry=industry, priority="Medium",
                assumptions="BEE audit benchmarks: LED retrofit saves Rs 50–120/kWh over lifetime. "
                            "VFD on pumps/fans saves 30–50% motor electricity.",
            ))

            # ── SBTi (always) ─────────────────────────────────────────────
            sbti_near_target = round(total_t * (1 - 0.42), 1)
            sbti_nz_target   = round(total_t * 0.10, 1)
            recs.append(build_recommendation(
                name="Set Science-Based Target (SBTi near-term + net-zero)",
                category="Governance", scope="All scopes",
                rationale=(
                    f"From your FY {inv_year} baseline of **{total_t:,.0f} tCO₂e**: "
                    f"SBTi near-term requires reducing to {sbti_near_target:,.0f} tCO₂e by {near_term_year} "
                    f"(42% absolute cut = {round(total_t*0.42):,.0f} tCO₂e reduction, "
                    f"{round(total_t*0.42/yrs_to_2030):,.0f} tCO₂e/yr). "
                    "SBTi validation signals 1.5°C alignment to investors and major customers."
                ),
                target_tco2e=round(total_t * 0.42, 1),
                rec_type="sbti_target",
                industry=industry, priority="High",
                assumptions=(
                    f"Near-term: 42% absolute reduction in S1+S2+S3 by {near_term_year} "
                    f"from FY {base_year} baseline ({total_t:,.0f} tCO₂e). "
                    "Net-zero: 90% reduction by 2050 + residuals via removals. "
                    "SBTi Corporate Standard v5."
                ),
            ))

    except Exception:
        pass

    # Always include SBTi (even with no data — sets the strategic intent)
    if not any("SBTi" in r["name"] for r in recs):
        recs.append(build_recommendation(
            name="Set Science-Based Target (SBTi near-term + net-zero)",
            category="Governance", scope="All scopes",
            rationale=(
                "SBTi-validated targets signal 1.5°C alignment to investors and "
                "major customers. Required for Tier 1 supplier qualification at "
                "Walmart, Unilever, Tata. Unlocks ESG-linked financing at "
                "0.2–0.5% lower cost of capital."
            ),
            target_tco2e=None, rec_type="sbti_target",
            industry=industry, priority="High",
            assumptions="Target will be quantified once inventory data is entered.",
        ))

    return recs
