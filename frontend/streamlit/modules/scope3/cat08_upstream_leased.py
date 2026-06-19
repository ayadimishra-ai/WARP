"""
sk.lite — Scope 3 Cat 8: Upstream Leased Assets.

GHG Protocol: emissions from operation of assets leased by the reporting company
that are not included in Scope 1 and 2 (i.e., lessor owns and controls the assets).

Methods:
  average_data (floor area): floor_m2 × EF_building_type (kgCO2e/m2/year) × time_fraction
  asset_specific:            lessor-provided Scope 1+2 data allocated to tenant
  lessor_specific:           same as asset_specific, lessor source

Default building EFs (kgCO2e/m2/year, DEFRA 2024 / RICS 2017):
  office:       55.0
  data_center:  700.0
  warehouse:    22.0
  retail:       90.0
  manufacturing: 60.0
  hotel:        130.0
  residential:  35.0
  average:      55.0
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, MissingEFError
from core.gwp import gwp_summary

_BUILDING_EF: dict[str, float] = {
    "office":          55.0,
    "open_plan_office": 52.0,
    "data_center":     700.0,
    "data_centre":     700.0,
    "warehouse":        22.0,
    "distribution_centre": 22.0,
    "retail":           90.0,
    "manufacturing":    60.0,
    "factory":          60.0,
    "hotel":           130.0,
    "residential":      35.0,
    "laboratory":      200.0,
    "average":          55.0,
    "mixed":            55.0,
}


class Cat08UpstreamLeased(BaseModule):
    module_name = "other"
    PROCESS_AREA   = "S3 Cat 8 — Upstream leased assets (buildings, avg EF by floor area)"
    PROCESS_ASSET  = "S3 Cat 8 — Upstream leased assets (avg EF per asset)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        # Detect method from unit or process
        unit = record.unit.lower()
        if "m2" in unit or "sqm" in unit or "floor" in unit or "m²" in unit:
            return self._floor_area(record, conn)
        if unit in ("kwh", "gj", "tj", "mwh"):
            return self._energy_based(record, conn)
        # Default: floor area
        return self._floor_area(record, conn)

    def _floor_area(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Emissions = floor_area_m2 × EF_building (kgCO2e/m2/year) × time_fraction_year
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        bldg_type = (record.fuel_or_item or "office").lower().strip()
        time_fraction = record.extra.get("time_fraction_year", 1.0)
        floor_m2 = record.quantity

        ef_val, ef_src, ef_fid, fallback_level, fallback_triggered = \
            self._get_building_ef(conn, bldg_type, record.country)

        kg_co2e = floor_m2 * ef_val * time_fraction

        steps = [
            {"label": "Floor area", "value": f"{floor_m2:.1f} m²"},
            {"label": "Time fraction", "value": f"{time_fraction:.3f} year"},
            {"label": "Building EF", "value": f"{ef_val} kgCO₂e/m²/year",
             "note": f"Building type: {bldg_type} | Source: {ef_src}"},
            {"label": "Emissions",
             "value": f"{floor_m2:.1f} m² × {ef_val} × {time_fraction:.3f} = {kg_co2e:.4f} kgCO₂e",
             "note": "Includes electricity, heating, cooling (if included in EF)"},
        ]

        # Allocation note
        alloc = record.extra.get("allocation_basis")
        alloc_pct = record.extra.get("allocation_pct", 100.0)
        if alloc and alloc_pct < 100:
            allocated = kg_co2e * alloc_pct / 100
            steps.append({
                "label": f"Allocation ({alloc})",
                "value": f"{kg_co2e:.4f} × {alloc_pct}% = {allocated:.4f} kgCO₂e",
            })
            kg_co2e = allocated

        audit = {
            "inputs": {"floor_m2": floor_m2, "building_type": bldg_type,
                       "time_fraction": time_fraction, "country": record.country},
            "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val} kgCO₂e/m²/year",
                          "source": ef_src},
            "calculation": steps,
            "gwp": gwp_info,
            "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
            "methodology": (
                "Cat 8 upstream leased assets — average-data by floor area. "
                "Floor area × building-type emission intensity × time fraction. "
                "GHG Protocol Scope 3 Technical Guidance Category 8."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit="kgCO₂e/m²/year",
            ef_source=ef_src,
            fallback_level=fallback_level, fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace=audit,
        )

    def _energy_based(self, record: ActivityRecord, conn) -> EmissionResult:
        """Energy consumed in leased space → purchased electricity module."""
        from modules.purchased_electricity import PurchasedElectricity
        elec_rec = ActivityRecord(
            record_id=record.record_id, scope="Scope 3",
            process=record.process, country=record.country,
            quantity=record.quantity, unit=record.unit,
            fuel_or_item="grid_electricity",
            reporting_year=record.reporting_year,
            fiscal_year=record.fiscal_year,
            gwp_ar=record.gwp_ar, org_id=record.org_id,
        )
        result = PurchasedElectricity().calculate(elec_rec, conn)
        result.audit_trace["methodology"] = (
            "Cat 8 upstream leased assets — energy-based. "
            "Energy consumption × grid EF."
        )
        return result

    def _get_building_ef(self, conn, bldg_type, country):
        try:
            ef = get_ef(conn, "other", bldg_type, "CO2e", country)
            if "m2" in ef.unit_denominator or "m²" in ef.unit_denominator:
                return (ef.value, ef.source, ef.factor_id, ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        default = _BUILDING_EF.get(bldg_type)
        if default is None:
            for key, val in _BUILDING_EF.items():
                if bldg_type in key or key in bldg_type:
                    default = val
                    break
        if default is None:
            default = 55.0
        return (default, "DEFRA 2024 / RICS 2017 Building Energy Benchmarks",
                f"BLDG_{bldg_type.upper()[:20]}", "global", True)
