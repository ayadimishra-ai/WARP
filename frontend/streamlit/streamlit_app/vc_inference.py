"""
vc_inference.py — Infer implicit supply chain nodes from GHG inventory.

For each emission record that implies an external entity (utility, waste handler,
freight carrier, grid operator), derive a "virtual supplier" entry that can be
shown on the value chain map and due-diligence tracker.

These are NOT counted for CSDDD mandatory due diligence (that requires legal entity
identification) but provide a complete picture of the value chain footprint.

Rules (GHG Protocol boundary):
  S2 electricity → "Grid utility (country)" — at the grid connection point
  S3 Cat 3C T&D → "Grid T&D operator (country)" — same entity as grid, no double-count
  S3 Cat 3B upstream electricity → "Fuel supplier to grid (country)" — fuel supply chain
  S3 Cat 3A upstream fuel → "Fuel supplier (fuel type, country)"
  S3 Cat 4/9 transport → "Freight carrier (mode, lane)" — logistics provider
  S3 Cat 5 waste → "Waste handler (country)"
  S3 Cat 6 travel → "Travel/airline (country)"
  S3 Cat 7 commuting → "Employees (commute, country)"

Double-count protection:
  Cat 3C is auto-calculated FROM S2. Never show both S2 utility and Cat 3C as
  separate entities — they share the same physical electricity flow.
  Cat 3B and Cat 3C are from the SAME electricity purchase but different boundaries:
    Cat 3B = fuel burned to generate the electricity (upstream of meter)
    Cat 3C = losses on the grid (between generator and meter)
  Both are counted — no double count — but they belong to the same "grid supply" node.
"""
from __future__ import annotations
import sqlite3
from pathlib import Path


# Country → approximate grid utility location (lat, lon)
_GRID_LOCS = {
    "IN": (20.5937, 78.9629, "India Grid"),
    "CN": (35.8617, 104.1954, "China Grid"),
    "US": (38.7946, -106.5348, "US Grid"),
    "DE": (51.1657, 10.4515, "Germany Grid"),
    "GB": (55.3781, -3.4360, "UK Grid"),
    "AU": (-25.2744, 133.7751, "Australia Grid"),
    "JP": (36.2048, 138.2529, "Japan Grid"),
    "SG": (1.3521, 103.8198, "Singapore Grid"),
}
_DEFAULT_GRID = (20.5937, 78.9629, "Grid utility")

_WASTE_LOCS = {
    "IN": (22.3511, 78.6677, "Waste handler India"),
}
_DEFAULT_WASTE = (22.3511, 78.6677, "Waste handler")


def infer_vc_nodes(
    inventory,
    org_id: str,
    inv_year: int,
    country: str = "IN",
) -> list[dict]:
    """
    Return a list of virtual supplier dicts inferred from GHG inventory.
    These can be merged with registered suppliers for display on the VC map.

    Each returned dict has the same schema as suppliers.json entries, plus:
        "_inferred": True        — marks as auto-derived, not a real legal entity
        "_inferred_from": str    — which emission category generated this node
        "_double_count_note": str — explains boundary / double-count protection
    """
    nodes: list[dict] = []
    seen: set[str] = set()  # deduplicate by node key

    try:
        all_rows = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
    except Exception:
        return []

    for row in all_rows:
        process  = str(row.get("process") or "")
        scope    = str(row.get("scope") or "")
        sup_name = str(row.get("supplier_name") or "")
        t_co2e   = float(row.get("t_CO2e") or 0)
        ctry     = str(row.get("country") or country or "IN")

        # ── Scope 2: grid utility ────────────────────────────────────────
        if "Purchased electricity" in process or ("Scope 2" in scope and "electricity" in process.lower()):
            key = f"grid:{ctry}"
            if key not in seen:
                seen.add(key)
                lat, lon, name = _GRID_LOCS.get(ctry, _DEFAULT_GRID)
                nodes.append(_node(
                    name=f"Grid utility ({ctry})",
                    category="Electricity utility",
                    material="Purchased electricity",
                    lat=lat, lon=lon, country=ctry,
                    t_co2e=t_co2e, tier=1,
                    inferred_from="Scope 2 — Purchased electricity",
                    double_count_note=(
                        "Scope 2 records electricity at the meter. "
                        "Cat 3C (T&D losses) are computed from the same kWh — "
                        "no double-count: they represent different physical flows."
                    ),
                    industry="Energy / Utilities",
                ))

        # ── Cat 3C: T&D operator — same grid node, skip if grid already added ──
        elif "Cat 3C" in process or "T&D" in process:
            key = f"grid:{ctry}"
            if key not in seen:
                seen.add(key)
                lat, lon, name = _GRID_LOCS.get(ctry, _DEFAULT_GRID)
                nodes.append(_node(
                    name=f"Grid T&D operator ({ctry})",
                    category="Grid operator",
                    material="T&D electricity losses",
                    lat=lat, lon=lon, country=ctry,
                    t_co2e=t_co2e, tier=1,
                    inferred_from="S3 Cat 3C — T&D losses (auto from S2)",
                    double_count_note=(
                        "Cat 3C is auto-computed from Scope 2 kWh input. "
                        "It is NOT a separate data entry — no double-count risk. "
                        "The physical flow is: fuel → generator → grid → your meter (S2) "
                        "and grid losses between generator and meter (Cat 3C). "
                        "Cat 3B covers fuel upstream of the generator."
                    ),
                    industry="Energy / Utilities",
                ))

        # ── Cat 3B: fuel supplier to grid ───────────────────────────────
        elif "Cat 3B" in process or "Upstream emissions of purchased electricity" in process:
            key = f"fuel_to_grid:{ctry}"
            if key not in seen:
                seen.add(key)
                lat, lon, _ = _GRID_LOCS.get(ctry, _DEFAULT_GRID)
                # Offset lat slightly so it doesn't overlap the grid utility dot
                nodes.append(_node(
                    name=f"Fuel supplier to grid ({ctry})",
                    category="Fuel supplier",
                    material="Fuel for electricity generation",
                    lat=lat - 1.5, lon=lon + 2.0, country=ctry,
                    t_co2e=t_co2e, tier=2,
                    inferred_from="S3 Cat 3B — Upstream of purchased electricity",
                    double_count_note=(
                        "Cat 3B = well-to-gate emissions of fuel burned to generate the grid electricity. "
                        "Boundary: fuel extraction/processing up to the power plant gate. "
                        "No overlap with Cat 3C (T&D losses) or Scope 2 (at-meter)."
                    ),
                    industry="Fuel / Mining",
                ))

        # ── Cat 3A: upstream fuel supplier ──────────────────────────────
        elif "Cat 3A" in process or "Upstream emissions of purchased fuels" in process:
            key = f"upstream_fuel:{ctry}"
            if key not in seen:
                seen.add(key)
                nodes.append(_node(
                    name=f"Upstream fuel supplier ({ctry})",
                    category="Fuel supplier",
                    material="Upstream fuel extraction/processing",
                    lat=22.0, lon=72.0, country=ctry,
                    t_co2e=t_co2e, tier=2,
                    inferred_from="S3 Cat 3A — Upstream emissions of purchased fuels",
                    double_count_note=(
                        "Cat 3A = WTT (well-to-tank) emissions for fuels you purchase and combust in S1. "
                        "No overlap with S1 combustion — S1 is TTW (tank-to-wheel), "
                        "Cat 3A is the upstream supply chain of that same fuel."
                    ),
                    industry="Fuel / Mining",
                ))

        # ── Cat 5: waste handler ──────────────────────────────────────────
        elif "Cat 5" in process or "Waste generated" in process:
            key = f"waste:{ctry}"
            if key not in seen:
                seen.add(key)
                lat, lon, _ = _WASTE_LOCS.get(ctry, _DEFAULT_WASTE)
                nodes.append(_node(
                    name=f"Waste handler ({ctry})",
                    category="Waste management",
                    material="Operational waste",
                    lat=lat, lon=lon, country=ctry,
                    t_co2e=t_co2e, tier=1,
                    inferred_from="S3 Cat 5 — Waste generated in operations",
                    double_count_note=(
                        "Cat 5 = emissions from waste treatment at third-party facilities. "
                        "Includes landfill, incineration, recycling. "
                        "No overlap with S1 (own combustion) or Cat 12 (end-of-life of sold products)."
                    ),
                    industry="Waste management",
                ))

        # ── Cat 4/9: freight carrier ──────────────────────────────────────
        elif ("Cat 4" in process or "Cat 9" in process) and sup_name and sup_name != "—":
            key = f"freight:{sup_name}"
            if key not in seen:
                seen.add(key)
                # Use supplier lat/lon if available
                nodes.append(_node(
                    name=f"Freight carrier ({sup_name[:20]})",
                    category="Logistics",
                    material="Transport services",
                    lat=20.5, lon=79.0, country=ctry,
                    t_co2e=t_co2e, tier=1,
                    inferred_from="S3 Cat 4/9 — Transport (supplier-linked)",
                    double_count_note=(
                        "Cat 4 = upstream transport (supplier to your facility). "
                        "Cat 9 = downstream transport (your facility to customer). "
                        "These are distinct from Cat 1 (the goods themselves)."
                    ),
                    industry="Logistics / Transport",
                ))

        # ── Cat 6: airline/travel agent ───────────────────────────────────
        elif "Cat 6" in process or "Business travel" in process:
            key = f"travel:{ctry}"
            if key not in seen:
                seen.add(key)
                nodes.append(_node(
                    name=f"Airlines / Travel ({ctry})",
                    category="Travel",
                    material="Business travel (air/rail/hotel)",
                    lat=28.61, lon=77.20, country=ctry,
                    t_co2e=t_co2e, tier=1,
                    inferred_from="S3 Cat 6 — Business travel",
                    double_count_note=(
                        "Cat 6 = emissions from employee business travel. "
                        "Distinct from Cat 7 (employee commuting to/from work)."
                    ),
                    industry="Aviation / Travel",
                ))

    return nodes


def _node(name, category, material, lat, lon, country, t_co2e, tier,
          inferred_from, double_count_note, industry) -> dict:
    return {
        "name":            name,
        "category":        category,
        "material":        material,
        "spend_cr":        0.0,
        "country":         country,
        "industry":        industry,
        "e_score":         50, "s_score": 50, "g_score": 50,
        "composite":       50.0,
        "risk":            "Medium",
        "engagement":      "Inactive",
        "audit_date":      None,
        "questionnaire_submitted": False,
        "cdp_disclosure":  False,
        "sbti":            False,
        "iso14001":        False,
        "ghg_audit":       False,
        "ghg_scope1_tco2e": 0.0,
        "ghg_scope2_tco2e": 0.0,
        "ghg_cat1_tco2e":   0.0,
        "ghg_cat4_tco2e":   t_co2e,
        "ghg_all_tco2e":    t_co2e,
        "ghg_n_records":    1,
        "engagement_history": [],
        "notes": double_count_note,
        "lat":   lat,
        "lon":   lon,
        "city":  "",
        "tier":  tier,
        "parent_supplier":    None,
        "child_suppliers":    [],
        "downstream_customer": False,
        "_inferred":           True,
        "_inferred_from":      inferred_from,
        "_double_count_note":  double_count_note,
    }
