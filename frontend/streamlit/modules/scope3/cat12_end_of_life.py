"""
sk.lite — Scope 3 Cat 12: End-of-Life Treatment of Sold Products.

GHG Protocol definition:
  Emissions from the waste disposal and treatment of products sold by
  the reporting company at end of life (after the final customer's use).

Methodology:
  Reuses Cat 5 waste treatment EFs applied to the mass of sold products
  at end of life. The company estimates the likely treatment mix for
  its products in the countries/markets where they are sold.

  Emissions = mass_sold x fraction_per_treatment x EF_per_treatment

Inputs:
  quantity     = total mass of products sold (kg or tonnes)
  fuel_or_item = primary material of product (for default EF lookup)
                 OR treatment type if known (e.g. 'landfill_msw')
  extra.treatment_mix = dict of {treatment: fraction} summing to 1.0
                        e.g. {'landfill_msw': 0.60, 'recycling_mixed': 0.30, 'incineration_msw': 0.10}

If treatment_mix not provided, uses national/regional average mix for
the product material type.

Default treatment mixes (India -- CEA/MoEFCC estimates):
  electronics:  {'landfill_msw': 0.70, 'recycling_mixed': 0.20, 'incineration_msw': 0.10}
  packaging:    {'landfill_msw': 0.55, 'recycling_mixed': 0.35, 'open_dump': 0.10}
  food:         {'landfill_food': 0.50, 'composting': 0.30, 'open_dump': 0.20}
  general:      {'landfill_msw': 0.65, 'recycling_mixed': 0.25, 'incineration_msw': 0.10}
  metal:        {'recycling_metal': 0.70, 'landfill_msw': 0.30}
  paper:        {'recycling_paper': 0.60, 'landfill_paper': 0.30, 'incineration_msw': 0.10}

Processes:
  'S3 Cat 12 -- End-of-life of sold products (waste-treatment mix)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import MissingEFError
from core.gwp import gwp_summary

# Waste treatment EFs (kgCO2e/tonne) -- same as Cat 5
_WASTE_EF: dict[str, float] = {
    "landfill":             467.0,
    "landfill_msw":         467.0,
    "landfill_food":        570.0,
    "landfill_paper":       620.0,
    "landfill_plastic":      40.0,
    "landfill_metal":         0.0,
    "landfill_glass":         0.0,
    "incineration_msw":      21.0,
    "incineration_hazardous":3400.0,
    "composting":            10.0,
    "anaerobic_digestion":  -50.0,
    "recycling":           -300.0,
    "recycling_paper":     -820.0,
    "recycling_plastic":   -430.0,
    "recycling_metal":     -680.0,
    "recycling_glass":     -310.0,
    "recycling_mixed":     -300.0,
    "open_dump":            300.0,
    "open_burning":        1500.0,
    "wastewater_aerobic":    35.0,
}

# Default treatment mixes by product material (India averages)
_DEFAULT_TREATMENT_MIX: dict[str, dict[str, float]] = {
    "electronics":  {"landfill_msw": 0.70, "recycling_mixed": 0.20, "incineration_msw": 0.10},
    "packaging":    {"landfill_msw": 0.55, "recycling_mixed": 0.35, "open_dump": 0.10},
    "food":         {"landfill_food": 0.50, "composting": 0.30, "open_dump": 0.20},
    "metal":        {"recycling_metal": 0.70, "landfill_msw": 0.30},
    "steel":        {"recycling_metal": 0.75, "landfill_msw": 0.25},
    "aluminium":    {"recycling_metal": 0.80, "landfill_msw": 0.20},
    "paper":        {"recycling_paper": 0.60, "landfill_paper": 0.30, "incineration_msw": 0.10},
    "plastic":      {"landfill_plastic": 0.50, "recycling_plastic": 0.30, "open_dump": 0.20},
    "glass":        {"recycling_glass": 0.60, "landfill_glass": 0.40},
    "textile":      {"landfill_msw": 0.80, "recycling_mixed": 0.20},
    "wood":         {"landfill_msw": 0.60, "recycling_mixed": 0.40},
    "general":      {"landfill_msw": 0.65, "recycling_mixed": 0.25, "incineration_msw": 0.10},
}

_MASS_UNITS = {"kg": 1.0, "t": 1000.0, "tonne": 1000.0, "tonnes": 1000.0,
               "kt": 1e6, "g": 0.001, "lb": 0.4536}


class Cat12EndOfLife(BaseModule):
    module_name = "waste_landfill"
    PROCESS = "S3 Cat 12 \u2014 End-of-life of sold products (waste-treatment mix)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        # Validate treatment mix sums to 1 if provided
        mix = record.extra.get("treatment_mix")
        if mix:
            total = sum(mix.values())
            if abs(total - 1.0) > 0.01:
                errors.append(
                    f"treatment_mix fractions must sum to 1.0, got {total:.4f}. "
                    "Check extra.treatment_mix dict."
                )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        material = (record.fuel_or_item or "general").lower().strip()

        # Convert to tonnes
        unit = record.unit.lower()
        if unit in _MASS_UNITS:
            qty_t = record.quantity * _MASS_UNITS[unit] / 1000.0  # to tonnes
            conv_steps = [] if unit in ("t","tonne","tonnes") else [
                {"label": f"Convert {record.unit}->tonnes",
                 "value": f"{record.quantity} {record.unit} = {qty_t:.4f} t"}
            ]
        else:
            qty_t = record.quantity
            conv_steps = [{"label": f"Assumed tonnes", "value": f"{qty_t:.4f} t"}]

        # Get treatment mix
        mix = record.extra.get("treatment_mix")
        if mix is None:
            mix = _DEFAULT_TREATMENT_MIX.get(material, _DEFAULT_TREATMENT_MIX["general"])
            mix_src = f"default mix for {material} (India averages)"
        else:
            mix_src = "user-supplied treatment mix"

        # Calculate emissions per treatment stream
        calc_steps = []
        total_kg_co2e = 0.0
        stream_results = []
        fallback_triggered = False

        for treatment, fraction in mix.items():
            ef = _WASTE_EF.get(treatment, 350.0)   # 350 kgCO2e/t as last resort
            stream_mass_t = qty_t * fraction
            stream_kg_co2e = stream_mass_t * ef
            total_kg_co2e += stream_kg_co2e
            stream_results.append({
                "treatment": treatment, "fraction": fraction,
                "mass_t": round(stream_mass_t, 4),
                "ef_kgco2e_t": ef,
                "kg_co2e": round(stream_kg_co2e, 4),
            })
            calc_steps.append({
                "label": f"{treatment} ({fraction:.0%})",
                "value": (f"{stream_mass_t:.4f} t x {ef} kgCO2e/t = "
                          f"{stream_kg_co2e:.4f} kgCO2e"
                          + (" [avoided]" if ef < 0 else "")),
            })

        calc_steps.append({
            "label": "Total EoL emissions",
            "value": f"{total_kg_co2e:.4f} kgCO2e ({total_kg_co2e/1000:.6f} tCO2e)",
        })

        # Primary EF = weighted average
        weighted_ef = total_kg_co2e / qty_t if qty_t > 0 else 0.0

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(total_kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(total_kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=f"EOL_{material.upper()[:20]}_MIXED",
            ef_value_used=round(weighted_ef, 4),
            ef_unit="kgCO2e/tonne (weighted average)",
            ef_source="IPCC 2006 Vol.5 / DEFRA 2024 waste treatment EFs",
            fallback_level="global", fallback_triggered=True,
            calculation_engine="local", confidence="low",
            audit_trace={
                "inputs": {
                    "quantity": record.quantity, "unit": record.unit,
                    "material": material, "qty_tonnes": round(qty_t, 4),
                },
                "conversions": conv_steps,
                "treatment_mix": {
                    "source": mix_src, "mix": mix,
                    "stream_results": stream_results,
                },
                "calculation": calc_steps,
                "gwp": gwp_info,
                "result": {
                    "kg_CO2e": round(total_kg_co2e, 4),
                    "t_CO2e": round(total_kg_co2e/1000, 6),
                    "weighted_ef_kgco2e_per_t": round(weighted_ef, 4),
                },
                "methodology": (
                    f"Cat 12 end-of-life. Product mass x treatment mix x treatment EF. "
                    f"Material: {material}. Mix source: {mix_src}. "
                    "Negative EF streams = avoided emissions from recycling. "
                    "GHG Protocol Scope 3 Technical Guidance Category 12."
                ),
            },
        )
