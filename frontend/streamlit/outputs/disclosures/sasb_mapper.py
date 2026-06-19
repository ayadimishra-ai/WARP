"""
outputs/disclosures/sasb_mapper.py

Maps GHG inventory + operational data to SASB Standards metrics,
showing causal chains: Primitive → Metric → Outcome.

Primitive binding codes (from canonical doc):
  GE = GHG emissions          EU = Energy use
  WA = Water withdrawal        WS = Waste generated
  HS = Health & Safety         CL = Compliance / legal risk
  RG = Regulatory constraint   SC = Supply chain disruption
  OX = Operating cost (Opex)   EP = Energy price
  RV = Revenue / demand        CM = Commodity input price
  WF = Workforce availability  DT = Business continuity / downtime
  IR = Interest rates          XW = Extreme weather hazard
  LT = Freight / logistics     CX = Capital expenditure
  CY = Cyber disruption        FR = (sector-specific financial risk)
  LC = Labour cost             FX = FX / currency moves
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional


# ── Primitive code → canonical label ────────────────────────────────────────
PRIMITIVE_LABELS = {
    "GE": "GHG emissions (absolute + intensity)",
    "EU": "Energy use (absolute + intensity)",
    "WA": "Water withdrawal / consumption",
    "WS": "Waste generated / diversion",
    "HS": "Workforce health & safety incidents",
    "CL": "Compliance / legal risk",
    "RG": "Regulatory constraint / enforcement",
    "SC": "Supply chain disruption risk",
    "OX": "Operating cost (Opex)",
    "EP": "Energy price (fuel, electricity tariffs)",
    "RV": "Revenue / demand volume",
    "CM": "Commodity input price shock",
    "WF": "Workforce availability",
    "DT": "Business continuity / downtime",
    "IR": "Interest rates / credit availability",
    "XW": "Extreme weather hazard + asset exposure",
    "LT": "Freight / logistics cost + lead time",
    "CX": "Capital expenditure (Capex)",
    "CY": "Cyber / information security incidents",
    "FR": "Financial risk (sector-specific)",
    "LC": "Labour cost + availability",
    "FX": "FX / currency moves",
}

# ── Outcome prefix → domain label ───────────────────────────────────────────
OUTCOME_DOMAINS = {
    "E": "Financial exposure",
    "R": "Reputational / intangible value",
    "S": "Systemic / societal risk",
    "O": "Operational risk",
}


def _parse_codes(raw: str) -> list[str]:
    return [c.strip() for c in (raw or "").split(",") if c.strip()]


def _outcome_label(code: str) -> str:
    parts = code.split(":", 1)
    if len(parts) == 2:
        domain = OUTCOME_DOMAINS.get(parts[0], parts[0])
        node = parts[1].replace("_", " ")
        return f"{node} ({domain})"
    return code


def generate_sasb_disclosure(
    inventory,
    org_profile: dict,
    ef_conn,
    inventory_year: Optional[int] = None,
    sector: Optional[str] = None,
    energy_mwh: Optional[float] = None,
    water_m3: Optional[float] = None,
    waste_t: Optional[float] = None,
    hazardous_waste_t: Optional[float] = None,
    trir: Optional[float] = None,
    fatalities: Optional[int] = None,
    revenue_usd_m: Optional[float] = None,
) -> dict:
    """
    Generate SASB-aligned disclosure filling applicable quantitative metrics
    from the inventory and supplementary operational inputs.

    Returns:
        {
          metadata, sector, applicable_metrics, filled_metrics,
          causal_chains, text, json, coverage_pct
        }
    """
    inv_year  = inventory_year or org_profile.get("reporting_year", 2024)
    org_id    = org_profile.get("org_id", "default")
    org_name  = org_profile.get("org_name", "Organisation")
    gwp_ar    = org_profile.get("gwp_ar", 6)

    # ── Pull inventory data ─────────────────────────────────────────────────
    summary  = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
    s1       = summary.get("scope1_t_co2e", 0)
    s2       = summary.get("scope2_t_co2e", 0)
    s3       = summary.get("scope3_t_co2e", 0)
    total    = summary.get("total_t_co2e", 0)
    by_cat   = inventory.get_by_category(org_id=org_id, inventory_year=inv_year)

    # Energy from S2 electricity kWh + S1 stationary fuel
    if energy_mwh is None:
        elec_cat = next((r for r in by_cat
                         if "electricity" in (r.get("category") or "").lower()
                         or "Scope 2" in (r.get("scope") or "")), None)
        energy_mwh = 0.0  # requires explicit input for full GRI 302 style

    # ── Load applicable SASB metrics ────────────────────────────────────────
    query = "SELECT * FROM sasb_metrics WHERE 1=1"
    params: list = []
    if sector:
        query += " AND LOWER(sector) = LOWER(?)"
        params.append(sector)
    query += " ORDER BY sector, topic, metric_id"

    try:
        rows = ef_conn.execute(query, params).fetchall()
        metrics = [dict(r) for r in rows]
    except Exception as e:
        metrics = []

    if not metrics:
        # Fallback: try without sector filter
        try:
            metrics = [dict(r) for r in ef_conn.execute(
                "SELECT * FROM sasb_metrics ORDER BY sector, topic, metric_id"
            ).fetchall()]
        except Exception:
            metrics = []

    # ── Fill metrics where we have data ────────────────────────────────────
    # Primitive codes we can fill from inventory
    filled_primitives = set()
    if total > 0:
        filled_primitives.add("GE")
    if energy_mwh and energy_mwh > 0:
        filled_primitives.add("EU")
    if water_m3 and water_m3 > 0:
        filled_primitives.add("WA")
    if waste_t and waste_t > 0:
        filled_primitives.add("WS")
    if trir is not None:
        filled_primitives.add("HS")
    if revenue_usd_m and revenue_usd_m > 0:
        filled_primitives.add("RV")

    filled_metrics = []
    unfilled_metrics = []

    for m in metrics:
        prims = _parse_codes(m.get("primitive_bindings", ""))
        has_data = any(p in filled_primitives for p in prims)
        ghg_metric = "GE" in prims

        entry = {
            "metric_id":    m["metric_id"],
            "sector":       m["sector"],
            "industry":     m.get("industry", ""),
            "topic":        m["topic"],
            "metric_name":  m["metric_name"],
            "unit":         m.get("unit", ""),
            "quant_qual":   m.get("quant_qual", ""),
            "primitives":   prims,
            "outcomes":     _parse_codes(m.get("outcome_bindings", "")),
            "binding_notes":m.get("binding_notes", ""),
        }

        # Fill values where possible
        if ghg_metric and total > 0:
            unit = (m.get("unit") or "").lower()
            if "scope 1" in m["metric_name"].lower():
                entry["value"] = round(s1, 2)
                entry["value_unit"] = "tCO₂e"
                entry["filled"] = True
            elif "scope 2" in m["metric_name"].lower():
                entry["value"] = round(s2, 2)
                entry["value_unit"] = "tCO₂e"
                entry["filled"] = True
            elif "scope 3" in m["metric_name"].lower():
                entry["value"] = round(s3, 2)
                entry["value_unit"] = "tCO₂e"
                entry["filled"] = True
            elif "total" in m["metric_name"].lower() or "gross" in m["metric_name"].lower():
                entry["value"] = round(total, 2)
                entry["value_unit"] = "tCO₂e"
                entry["filled"] = True
            else:
                entry["value"] = round(total, 2)
                entry["value_unit"] = "tCO₂e (total)"
                entry["filled"] = True
        elif "EU" in prims and energy_mwh:
            entry["value"] = round(energy_mwh, 2)
            entry["value_unit"] = "MWh"
            entry["filled"] = True
        elif "WA" in prims and water_m3:
            entry["value"] = round(water_m3, 2)
            entry["value_unit"] = "m³"
            entry["filled"] = True
        elif "WS" in prims and waste_t:
            entry["value"] = round(waste_t, 2)
            entry["value_unit"] = "t"
            entry["filled"] = True
        elif "HS" in prims and trir is not None:
            entry["value"] = round(trir, 4)
            entry["value_unit"] = "rate per 200,000 hours"
            entry["filled"] = True
        else:
            entry["filled"] = False
            entry["value"] = None
            entry["value_unit"] = None

        if entry["filled"]:
            filled_metrics.append(entry)
        else:
            unfilled_metrics.append(entry)

    all_metrics = filled_metrics + unfilled_metrics
    quant_total = sum(1 for m in all_metrics if m["quant_qual"] == "Quantitative")
    quant_filled = sum(1 for m in filled_metrics if m["quant_qual"] == "Quantitative")
    coverage_pct = round(quant_filled / quant_total * 100, 1) if quant_total else 0

    # ── Build causal chains ─────────────────────────────────────────────────
    causal_chains = _build_causal_chains(filled_metrics)

    # ── Text report ─────────────────────────────────────────────────────────
    lines = [
        f"SASB Standards Disclosure — {org_name}",
        f"Sector: {sector or 'All sectors'}",
        f"Reporting year: {inv_year}  |  GWP: IPCC AR{gwp_ar}",
        f"Generated: {datetime.now(timezone.utc).strftime('%d %b %Y %H:%M UTC')}",
        "",
        f"Coverage: {quant_filled}/{quant_total} quantitative metrics filled ({coverage_pct}%)",
        "",
    ]

    # Group by topic
    topics: dict[str, list] = {}
    for m in filled_metrics:
        topics.setdefault(m["topic"], []).append(m)

    for topic, topic_metrics in sorted(topics.items()):
        lines += [f"\n{'─'*60}", f"TOPIC: {topic}", f"{'─'*60}"]
        for m in topic_metrics:
            prims_str = ", ".join(
                f"{p} ({PRIMITIVE_LABELS.get(p, p)})" for p in m["primitives"]
            )
            outcomes_str = " → ".join(_outcome_label(o) for o in m["outcomes"])
            lines += [
                f"\n  [{m['metric_id']}] {m['metric_name'][:70]}",
                f"  Value: {m['value']} {m['value_unit']}",
                f"  Unit:  {m['unit'][:60]}",
                f"  Primitives: {prims_str[:80]}",
                f"  Outcomes: {outcomes_str[:80]}",
            ]

    lines += [
        "",
        f"{'='*60}",
        f"UNFILLED METRICS ({len(unfilled_metrics)} — require additional input)",
        f"{'='*60}",
    ]
    for m in unfilled_metrics[:20]:
        lines.append(f"  ○ [{m['metric_id']}] {m['metric_name'][:60]}")
    if len(unfilled_metrics) > 20:
        lines.append(f"  ... and {len(unfilled_metrics)-20} more")

    return {
        "metadata": {
            "framework":      "SASB Standards",
            "sector":         sector or "All",
            "organisation":   org_name,
            "inventory_year": inv_year,
            "gwp_source":     f"IPCC AR{gwp_ar} GWP100",
            "generated_at":   datetime.now(timezone.utc).isoformat(),
        },
        "sector":            sector,
        "applicable_metrics": len(all_metrics),
        "filled_metrics":    filled_metrics,
        "unfilled_metrics":  unfilled_metrics,
        "causal_chains":     causal_chains,
        "coverage_pct":      coverage_pct,
        "quant_filled":      quant_filled,
        "quant_total":       quant_total,
        "text":              "\n".join(lines),
        "json": {
            "scope1_tco2e":      round(s1, 4),
            "scope2_tco2e":      round(s2, 4),
            "scope3_tco2e":      round(s3, 4),
            "total_tco2e":       round(total, 4),
            "energy_mwh":        energy_mwh,
            "water_m3":          water_m3,
            "waste_t":           waste_t,
            "hazardous_waste_t": hazardous_waste_t,
            "trir":              trir,
            "fatalities":        fatalities,
            "coverage_pct":      coverage_pct,
        },
    }


def _build_causal_chains(metrics: list[dict]) -> list[dict]:
    """Build primitive → metric → outcome causal chains for viz."""
    chains = []
    for m in metrics:
        for prim_code in m["primitives"]:
            for outcome in m["outcomes"]:
                chains.append({
                    "primitive_code":  prim_code,
                    "primitive_label": PRIMITIVE_LABELS.get(prim_code, prim_code),
                    "metric_id":       m["metric_id"],
                    "metric_name":     m["metric_name"][:60],
                    "topic":           m["topic"],
                    "outcome_code":    outcome,
                    "outcome_label":   _outcome_label(outcome),
                    "value":           m.get("value"),
                    "value_unit":      m.get("value_unit"),
                })
    return chains


def get_sasb_sectors(ef_conn) -> list[str]:
    """Return distinct sector names from the SASB metrics table."""
    try:
        rows = ef_conn.execute(
            "SELECT DISTINCT sector FROM sasb_metrics ORDER BY sector"
        ).fetchall()
        return [r[0] for r in rows if r[0]]
    except Exception:
        return []


def get_sasb_topics(ef_conn, sector: Optional[str] = None) -> list[str]:
    """Return distinct topics, optionally filtered by sector."""
    try:
        if sector:
            rows = ef_conn.execute(
                "SELECT DISTINCT topic FROM sasb_metrics WHERE LOWER(sector)=LOWER(?) "
                "ORDER BY topic", (sector,)
            ).fetchall()
        else:
            rows = ef_conn.execute(
                "SELECT DISTINCT topic FROM sasb_metrics ORDER BY topic"
            ).fetchall()
        return [r[0] for r in rows if r[0]]
    except Exception:
        return []
