"""
sk.lite — Scope 3 Cat 11: Use of Sold Products.

GHG Protocol definition:
  Emissions from the use of goods and services sold by the reporting
  company. Covers the direct use-phase emissions only -- i.e. energy
  consumed by the product while in use by the end customer.

Sub-processes:
  direct_energy    -- product consumes energy during use (appliances,
                      vehicles, industrial equipment, HVAC, etc.)
                      Emissions = rated_power x hours_used x grid_EF
                                  OR energy_consumed x grid_EF
  fuels_feedstocks -- product IS a fuel/feedstock that will be combusted
                      downstream (sold natural gas, diesel, chemicals).
                      Emissions = quantity_sold x combustion_EF
                      (uses same EFs as Scope 1 stationary combustion)

Calculation inputs:
  For direct_energy:
    quantity     = units sold (for lifetime method)
    unit         = 'units', 'appliances', 'vehicles', etc.
    extra.annual_energy_kwh    = annual energy consumption per unit (kWh/yr)
    extra.product_lifetime_yrs = assumed product lifetime (default 10)
    extra.end_user_country     = country where product is used (default = record.country)
    -- OR --
    quantity     = total kWh consumed by all sold units
    unit         = 'kWh'

  For fuels_feedstocks:
    quantity     = mass/volume/energy of fuel sold
    unit         = 'GJ', 'TJ', 'L', 'kg', 't'
    fuel_or_item = fuel key (natural_gas, diesel_oil, etc.)

Processes:
  'S3 Cat 11 -- Use of sold products (direct, energy consuming products)'
  'S3 Cat 11 -- Use of sold products (direct, fuels & feedstocks combustion)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_grid_ef, MissingEFError
from core.gwp import gwp_summary
from core.unit_converter import to_kwh

# Default product lifetimes (years)
_PRODUCT_LIFETIMES: dict[str, int] = {
    "appliance":        10,
    "washing_machine":  12,
    "refrigerator":     15,
    "air_conditioner":  15,
    "hvac":             15,
    "led_light":         8,
    "laptop":            4,
    "desktop_pc":        5,
    "server":            5,
    "ev_charger":       10,
    "electric_vehicle": 12,
    "industrial_motor": 20,
    "pump":             15,
    "compressor":       15,
    "default":          10,
}

# Default annual energy consumption per unit (kWh/year)
_ANNUAL_ENERGY_KWH: dict[str, float] = {
    "washing_machine":   220.0,
    "refrigerator":      400.0,
    "air_conditioner":  1500.0,
    "hvac":             2000.0,
    "led_light":          30.0,
    "laptop":            150.0,
    "desktop_pc":        400.0,
    "server":           4000.0,
    "ev_charger":        500.0,   # residential charger
    "electric_vehicle": 3000.0,   # annual charging energy
    "industrial_motor": 8760.0,   # 1kW x 8760hr (full load)
    "pump":             2920.0,   # 1kW x 8hr/day
    "compressor":       4380.0,   # 1kW x 12hr/day
    "default":           500.0,
}


class Cat11UseOfSoldProducts(BaseModule):
    module_name = "other"
    PROCESS_ENERGY  = "S3 Cat 11 \u2014 Use of sold products (direct, energy consuming products)"
    PROCESS_FUELS   = "S3 Cat 11 \u2014 Use of sold products (direct, fuels & feedstocks combustion)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        process = record.process or ""
        if "fuels" in process.lower() or "feedstock" in process.lower():
            return self._fuels_feedstocks(record, conn)
        return self._direct_energy(record, conn)

    # ------------------------------------------------------------------ #
    # Direct energy-consuming products
    # ------------------------------------------------------------------ #

    def _direct_energy(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        product = (record.fuel_or_item or "default").lower().strip()
        steps = []

        unit = record.unit.lower()
        end_user_country = record.extra.get("end_user_country", record.country)

        # Path A: direct kWh input
        if unit in ("kwh", "mwh", "gwh", "gj", "tj"):
            try:
                total_kwh, conv = to_kwh(record.quantity, record.unit)
                steps.extend(conv)
            except ValueError:
                total_kwh = record.quantity
            steps.append({"label": "Total energy consumed", "value": f"{total_kwh:,.2f} kWh"})
            method_note = "Direct energy input method"

        # Path B: units sold x annual energy x lifetime
        else:
            units_sold = record.quantity
            annual_kwh = float(record.extra.get(
                "annual_energy_kwh",
                _ANNUAL_ENERGY_KWH.get(product, _ANNUAL_ENERGY_KWH["default"])
            ))
            lifetime = int(record.extra.get(
                "product_lifetime_yrs",
                _PRODUCT_LIFETIMES.get(product, _PRODUCT_LIFETIMES["default"])
            ))
            total_kwh = units_sold * annual_kwh * lifetime
            steps += [
                {"label": "Units sold",      "value": f"{units_sold:,.0f} {record.unit}"},
                {"label": "Annual energy",   "value": f"{annual_kwh} kWh/unit/year"},
                {"label": "Product lifetime","value": f"{lifetime} years"},
                {"label": "Total energy",
                 "value": f"{units_sold:,.0f} x {annual_kwh} x {lifetime} = {total_kwh:,.2f} kWh"},
            ]
            method_note = f"Lifetime energy method: {units_sold:.0f} units x {annual_kwh} kWh/yr x {lifetime} yr"

        # Get end-user grid EF
        try:
            grid = get_grid_ef(conn, end_user_country,
                               fiscal_year=record.fiscal_year,
                               calendar_year=record.reporting_year,
                               method="weighted_avg")
            grid_ef = grid.ef_value_kgco2e_per_kwh
            grid_src = grid.source
            fl, ft = "national", False
        except MissingEFError:
            grid_ef = 0.49   # IEA global average
            grid_src = "IEA global average (fallback -- end-user grid EF not found)"
            fl, ft = "global", True

        kg_co2e = total_kwh * grid_ef
        steps.append({
            "label": "Use-phase emissions",
            "value": f"{total_kwh:,.2f} kWh x {grid_ef} kgCO2e/kWh = {kg_co2e:,.4f} kgCO2e",
            "note": f"End-user grid: {end_user_country} | {grid_src}",
        })

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=f"GRID_{end_user_country}_USE_PHASE",
            ef_value_used=grid_ef, ef_unit="kgCO2e/kWh",
            ef_source=grid_src, fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {
                    "quantity": record.quantity, "unit": record.unit,
                    "product": product, "end_user_country": end_user_country,
                    "annual_energy_kwh": record.extra.get("annual_energy_kwh"),
                    "product_lifetime_yrs": record.extra.get("product_lifetime_yrs"),
                },
                "calculation": steps, "gwp": gwp_info,
                "result": {"total_lifetime_kwh": round(total_kwh, 2),
                           "kg_CO2e": round(kg_co2e, 4),
                           "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    f"Cat 11 use of sold products -- {method_note}. "
                    "End-user electricity emissions from operation of sold product. "
                    f"Grid EF: {end_user_country} {grid_src}. "
                    "GHG Protocol Scope 3 Technical Guidance Category 11."
                ),
            },
        )

    # ------------------------------------------------------------------ #
    # Fuels and feedstocks sold for downstream combustion
    # ------------------------------------------------------------------ #

    def _fuels_feedstocks(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Products sold that will be combusted downstream.
        Uses stationary combustion EFs -- same as Scope 1 but applied to
        sold quantities.
        """
        from modules.stationary_combustion import StationaryCombustion
        fuel_rec = ActivityRecord(
            record_id=record.record_id,
            scope="Scope 3", process=record.process,
            country=record.country,
            quantity=record.quantity, unit=record.unit,
            fuel_or_item=record.fuel_or_item or "natural_gas",
            reporting_year=record.reporting_year,
            gwp_ar=record.gwp_ar, org_id=record.org_id,
        )
        result = StationaryCombustion().calculate(fuel_rec, conn)
        result.audit_trace["methodology"] = (
            "Cat 11 fuels & feedstocks. Sold fuel quantity x combustion EF. "
            "Same EF as Scope 1 stationary combustion applied to downstream use. "
            "GHG Protocol Scope 3 Technical Guidance Category 11."
        )
        return result
