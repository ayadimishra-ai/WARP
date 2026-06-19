"""
sk.lite — Stationary Combustion Module (Scope 1).

Implements IPCC 2006 Tier 1 method for stationary combustion:
  CO2/CH4/N2O = activity_data_TJ × emission_factor_kg_per_TJ

Supports units: TJ, GJ, MWh, kWh, t, kg, kt, L, kL, m³

EF lookup hierarchy (via ef_store.selector):
  India-specific EFDB factors (rank 1-50) → IPCC 2019 defaults (rank 900)
  → IPCC 2006 defaults (rank 950) → legacy JSON (rank 920)

Process name matches: 'S1 — Stationary combustion (fuel burn)'
"""

from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, MissingEFError, ValidationError
from core.gwp import rollup_co2e, gwp_summary
from core.unit_converter import to_tj
from ef_store.selector import get_ef, get_ef_all_gases, EFResult


class StationaryCombustion(BaseModule):
    """
    Scope 1 stationary combustion.
    Ported from app.py::calc_stationary_combustion() with selector-based EF lookup.
    """

    module_name = "stationary_combustion"

    # Fuel item aliases: map common input strings to canonical fuel_item keys
    FUEL_ALIASES: dict[str, str] = {
        # From emission_factors.json keys
        "natural_gas": "natural_gas",
        "gas": "natural_gas",
        "ng": "natural_gas",
        "diesel": "diesel_oil",
        "diesel_oil": "diesel_oil",
        "hsd": "diesel_oil",
        "petrol": "motor_gasoline",
        "gasoline": "motor_gasoline",
        "motor_gasoline": "motor_gasoline",
        "coal": "other_bituminous_coal",
        "coal_bituminous": "other_bituminous_coal",
        "coal_anthracite": "coal_anthracite",
        "lignite": "lignite",
        "coal_lignite": "lignite",
        "fuel_oil": "fuel_oil",
        "heavy_fuel_oil": "fuel_oil",
        "hfo": "fuel_oil",
        "lpg": "lpg",
        "kerosene": "kerosene",
        "wood": "wood",
        "biomass": "wood",
        "biodiesel": "biodiesel",
        "biogas": "biogas",
        "coking_coal":     "coking_coal",
        "non_coking_coal": "other_bituminous_coal",   # India-specific; uses sub-bituminous EF
        "sub_bituminous_coal": "sub_bituminous_coal",
        "peat": "peat",
    }

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = super().validate(record)
        if not record.fuel_or_item:
            errors.append("fuel_or_item is required for stationary combustion")
        if record.fuel_or_item and record.fuel_or_item not in self.FUEL_ALIASES:
            errors.append(
                f"Unknown fuel '{record.fuel_or_item}'. "
                f"Known fuels: {sorted(self.FUEL_ALIASES.keys())}"
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        # fuel_item_for_ef  — canonical name for EF lookup (after alias resolution)
        # fuel_item_for_ncv — original name for NCV/density lookup so India-specific
        #                     values (e.g. non_coking_coal NCV = 19.63 TJ/Gg) are used
        fuel_item_for_ef  = self.FUEL_ALIASES.get(record.fuel_or_item, record.fuel_or_item)
        fuel_item_for_ncv = record.fuel_or_item
        gwp = record.gwp_ar

        # ── Step 1: Convert activity data to TJ ────────────────────────────
        qty_tj, conversion_steps = to_tj(
            record.quantity, record.unit, fuel_item_for_ncv, record.country, conn
        )

        # ── Step 2: Fetch EFs for CO2, CH4, N2O ────────────────────────────
        gas_efs = get_ef_all_gases(
            conn,
            module=self.module_name,
            fuel_item=fuel_item_for_ef,
            country=record.country,
            year=record.reporting_year,
            technology_process=record.technology_process,
        )

        if "CO2" not in gas_efs:
            raise MissingEFError(self.module_name, fuel_item_for_ef, "CO2", record.country)

        co2_ef: EFResult = gas_efs["CO2"]
        ch4_ef: EFResult | None = gas_efs.get("CH4")
        n2o_ef: EFResult | None = gas_efs.get("N2O")

        # Use the EF fuel name in audit trace
        fuel_item = fuel_item_for_ef

        co2_ef: EFResult = gas_efs["CO2"]
        ch4_ef: EFResult | None = gas_efs.get("CH4")
        n2o_ef: EFResult | None = gas_efs.get("N2O")

        # ── Step 3: Normalise EF units to kg/TJ ────────────────────────────
        # EFs may be in kgCO2/TJ, tCO2/TJ, etc.
        def ef_to_kg_per_tj(ef: EFResult) -> float:
            val = ef.value
            unit_n = ef.unit_numerator.lower()
            if unit_n.startswith("t"):     # tCO2/TJ → kg/TJ
                return val * 1000.0
            if unit_n.startswith("g"):     # gCO2/TJ → kg/TJ
                return val / 1000.0
            return val  # already kg/TJ

        co2_kg_per_tj = ef_to_kg_per_tj(co2_ef)
        ch4_kg_per_tj = ef_to_kg_per_tj(ch4_ef) if ch4_ef else 0.0
        n2o_kg_per_tj = ef_to_kg_per_tj(n2o_ef) if n2o_ef else 0.0

        # ── Step 4: Calculate raw gas emissions ────────────────────────────
        kg_co2 = qty_tj * co2_kg_per_tj
        kg_ch4 = qty_tj * ch4_kg_per_tj
        kg_n2o = qty_tj * n2o_kg_per_tj

        # Handle biogenic fuels (wood, biodiesel, biogas)
        is_biogenic = fuel_item in ("wood", "biodiesel", "biogas")
        kg_co2_biogenic = kg_co2 if is_biogenic else 0.0
        kg_co2_fossil = 0.0 if is_biogenic else kg_co2

        # ── Step 5: GWP conversion ─────────────────────────────────────────
        ch4_type = "CH4_biogenic" if is_biogenic else "CH4_fossil"
        kg_co2e = rollup_co2e(kg_co2_fossil, kg_ch4, kg_n2o, gwp, ch4_type=ch4_type)

        # ── Step 6: Determine fallback level ──────────────────────────────
        # Use the CO2 EF's fallback level as the primary indicator
        fallback_level = co2_ef.fallback_level
        fallback_triggered = co2_ef.fallback_triggered
        confidence = self._confidence_from_fallback(fallback_level)

        # ── Step 7: Build audit trace ──────────────────────────────────────
        gwp_info = gwp_summary(gwp)
        calc_steps = [
            {
                "label": "CO₂ emissions",
                "value": f"{qty_tj:.8f} TJ × {co2_kg_per_tj:.2f} kg/TJ = {kg_co2:.4f} kg CO₂",
                "note": f"{'Biogenic — reported separately, not in total' if is_biogenic else ''}",
            },
            {
                "label": "CH₄ emissions",
                "value": f"{qty_tj:.8f} TJ × {ch4_kg_per_tj:.4f} kg/TJ = {kg_ch4:.6f} kg CH₄",
                "note": f"GWP{gwp} = {gwp_info['CH4_fossil']}",
            },
            {
                "label": "N₂O emissions",
                "value": f"{qty_tj:.8f} TJ × {n2o_kg_per_tj:.4f} kg/TJ = {kg_n2o:.6f} kg N₂O",
                "note": f"GWP{gwp} = {gwp_info['N2O']}",
            },
            {
                "label": "Total CO₂e",
                "value": (
                    f"CO₂: {kg_co2_fossil/1000:.6f} t + "
                    f"CH₄: {kg_ch4/1000:.6f} t × {gwp_info['CH4_fossil']} + "
                    f"N₂O: {kg_n2o/1000:.6f} t × {gwp_info['N2O']} = "
                    f"{kg_co2e:.4f} kg CO₂e ({kg_co2e/1000:.6f} tCO₂e)"
                ),
                "note": f"IPCC AR{gwp} GWP100",
            },
        ]

        ef_lookup_trace = {
            "CO2": {
                "factor_id": co2_ef.factor_id,
                "value": f"{co2_kg_per_tj:.4f} kgCO₂/TJ",
                "source": co2_ef.source,
                "fallback_level": co2_ef.fallback_level,
                "preferred_rank": co2_ef.preferred_rank,
            },
            "CH4": {
                "factor_id": ch4_ef.factor_id if ch4_ef else None,
                "value": f"{ch4_kg_per_tj:.4f} kgCH₄/TJ" if ch4_ef else "0 (no factor found)",
            },
            "N2O": {
                "factor_id": n2o_ef.factor_id if n2o_ef else None,
                "value": f"{n2o_kg_per_tj:.4f} kgN₂O/TJ" if n2o_ef else "0 (no factor found)",
            },
        }

        audit_trace = {
            "inputs": {
                "quantity": record.quantity,
                "unit": record.unit,
                "fuel_item": fuel_item,
                "country": record.country,
                "reporting_year": record.reporting_year,
                "gwp_ar": gwp,
            },
            "conversions": conversion_steps,
            "ef_lookup": ef_lookup_trace,
            "calculation": calc_steps,
            "gwp": gwp_info,
            "result": {
                "kg_CO2_fossil": round(kg_co2_fossil, 6),
                "kg_CO2_biogenic": round(kg_co2_biogenic, 6),
                "kg_CH4": round(kg_ch4, 6),
                "kg_N2O": round(kg_n2o, 6),
                "kg_CO2e": round(kg_co2e, 4),
                "t_CO2e": round(kg_co2e / 1000, 6),
            },
            "methodology": (
                "Stationary combustion per IPCC 2006 Guidelines Vol.2 Ch.2 Tier 1. "
                "Activity data converted to TJ using net calorific value (NCV). "
                "CO₂, CH₄, N₂O calculated separately using gas-specific emission factors. "
                f"CO₂e using IPCC AR{gwp} GWP100 values."
            ),
            "biogenic_note": (
                f"Fuel '{fuel_item}' is biogenic. "
                f"CO₂ ({kg_co2_biogenic/1000:.4f} tCO₂) reported separately under biogenic CO₂ "
                "and excluded from the tCO₂e total per GHG Protocol guidance."
            ) if is_biogenic else None,
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2_fossil, 6),
            kg_CH4=round(kg_ch4, 6),
            kg_N2O=round(kg_n2o, 6),
            kg_CO2e=round(kg_co2e, 4),
            kg_CO2_biogenic=round(kg_co2_biogenic, 6),
            gwp_ar_used=gwp,
            factor_id_used=co2_ef.factor_id,
            ef_value_used=co2_kg_per_tj,
            ef_unit="kgCO₂/TJ",
            ef_source=co2_ef.source,
            ef_source_year=co2_ef.source_year,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=confidence,
            audit_trace=audit_trace,
        )
