"""
sk.lite — Mobile Combustion Module (Scope 1).

Implements IPCC 2006 Vol.2 Ch.3 Tier 1 mobile combustion.

Two EF paths:
  Per-TJ: CO2/CH4/N2O in kg/TJ — used when fuel quantity known
  Per-km: CH4/N2O in g/km — used when distance-based and km EFs available
  CO2 always per-TJ (combustion stoichiometry)

Supported units:
  Fuel-based: TJ, GJ, L, kL, t, kg
  Distance-based: km, miles → converted, then fuel estimated via efficiency

Process name matches: 'S1 — Mobile combustion (road)'
"""

from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, MissingEFError, ValidationError
from core.gwp import rollup_co2e, gwp_summary
from core.unit_converter import to_tj, to_km
from ef_store.selector import get_ef, get_ef_all_gases, EFResult


class MobileCombustion(BaseModule):

    module_name = "mobile_combustion"

    # Vehicle/technology aliases → technology_process key used in EF lookup
    VEHICLE_ALIASES: dict[str, str] = {
        # From emission_factors.json mobile factors
        "petrol_cars":          "petrol_cars",
        "petrol_car":           "petrol_cars",
        "car_petrol":           "petrol_cars",
        "gasoline_car":         "petrol_cars",
        "diesel_cars":          "diesel_cars",
        "diesel_car":           "diesel_cars",
        "car_diesel":           "diesel_cars",
        "diesel_trucks_heavy":  "diesel_trucks_heavy",
        "heavy_truck":          "diesel_trucks_heavy",
        "hgv":                  "diesel_trucks_heavy",
        "lgv":                  "diesel_cars",
        "diesel_buses":         "diesel_buses",
        "bus":                  "diesel_buses",
        "aviation":             "jet_fuel_aviation",
        "jet_fuel_aviation":    "jet_fuel_aviation",
        "air":                  "jet_fuel_aviation",
        "marine":               "marine_fuel_oil",
        "ship":                 "marine_fuel_oil",
        "marine_fuel_oil":      "marine_fuel_oil",
        "cng":                  "natural_gas_vehicles",
        "natural_gas_vehicles": "natural_gas_vehicles",
        # India-specific from EFDB
        "2w":                   "2W/3W",    # 2-wheelers
        "3w":                   "2W/3W",
        "2w3w":                 "2W/3W",
        "two_wheeler":          "2W/3W",
        "three_wheeler":        "2W/3W",
        "mcv":                  "MCV/HCV",  # medium/heavy commercial vehicle
        "hcv":                  "MCV/HCV",
        "lcv":                  "LCV",      # light commercial vehicle
    }

    # Fuel associated with each vehicle type (for unit conversion)
    VEHICLE_FUEL_MAP: dict[str, str] = {
        "petrol_cars":          "motor_gasoline",
        "diesel_cars":          "diesel_oil",
        "diesel_trucks_heavy":  "diesel_oil",
        "diesel_buses":         "diesel_oil",
        "jet_fuel_aviation":    "jet_fuel",
        "marine_fuel_oil":      "fuel_oil",
        "natural_gas_vehicles": "natural_gas",
        "2W/3W":                "motor_gasoline",
        "MCV/HCV":              "diesel_oil",
        "LCV":                  "diesel_oil",
    }

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = super().validate(record)
        if not record.fuel_or_item and not record.technology_process:
            errors.append(
                "Either fuel_or_item (vehicle type) or technology_process is required"
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)

        # Resolve vehicle/tech key
        vehicle_input = record.fuel_or_item or record.technology_process or ""
        tech_key = self.VEHICLE_ALIASES.get(vehicle_input, vehicle_input)
        fuel_item = self.VEHICLE_FUEL_MAP.get(tech_key, "motor_gasoline")

        conversion_steps = []

        # ── Step 1: Resolve activity data to TJ ───────────────────────────
        if record.unit in ("km", "miles", "mile"):
            # Distance-based path: estimate fuel consumption via efficiency
            qty_km, km_steps = to_km(record.quantity, record.unit)
            conversion_steps.extend(km_steps)

            # Look up fuel efficiency from DB or use legacy JSON hardcoded values
            fuel_eff = self._get_fuel_efficiency(conn, tech_key)
            # fuel_eff in L/100km
            qty_L = qty_km * fuel_eff / 100.0
            conversion_steps.append({
                "label": "Estimate fuel consumption",
                "value": f"{qty_km:.2f} km × {fuel_eff} L/100km = {qty_L:.4f} L",
                "note": "Default fuel efficiency. Use actual fuel data if available for higher accuracy.",
            })
            qty_tj, tj_steps = to_tj(qty_L, "L", fuel_item, record.country, conn)
            conversion_steps.extend(tj_steps)
            use_km_ef = True   # also calculate per-km CH4/N2O if available
            qty_km_for_ef = qty_km
        else:
            # Fuel-based path: direct TJ conversion
            qty_tj, tj_steps = to_tj(
                record.quantity, record.unit, fuel_item, record.country, conn
            )
            conversion_steps.extend(tj_steps)
            use_km_ef = False
            qty_km_for_ef = None

        # ── Step 2: Fetch EFs ──────────────────────────────────────────────
        # Try technology_process-specific first, then fuel_item only
        gas_efs = {}
        for tp in [tech_key, None]:
            gas_efs = get_ef_all_gases(
                conn,
                module=self.module_name,
                fuel_item=fuel_item,
                country=record.country,
                year=record.reporting_year,
                technology_process=tp,
            )
            if "CO2" in gas_efs:
                break

        if "CO2" not in gas_efs:
            raise MissingEFError(self.module_name, fuel_item, "CO2", record.country)

        co2_ef = gas_efs["CO2"]
        ch4_ef = gas_efs.get("CH4")
        n2o_ef = gas_efs.get("N2O")

        # ── Step 3: CO2 — always from per-TJ EF (combustion stoichiometry) ─
        def ef_to_kg_per_tj(ef: EFResult) -> float:
            unit_n = ef.unit_numerator.lower()
            val = ef.value
            if unit_n.startswith("t"):
                return val * 1000.0
            if unit_n.startswith("g"):
                return val / 1000.0
            return val

        co2_kg_per_tj = ef_to_kg_per_tj(co2_ef)
        kg_co2 = qty_tj * co2_kg_per_tj

        # ── Step 4: CH4 and N2O — per-km if available and distance-based ──
        calc_steps = [{
            "label": "CO₂ emissions",
            "value": f"{qty_tj:.8f} TJ × {co2_kg_per_tj:.2f} kgCO₂/TJ = {kg_co2:.4f} kg CO₂",
            "note": f"EF: {co2_ef.factor_id}",
        }]

        kg_ch4 = 0.0
        kg_n2o = 0.0

        if use_km_ef and qty_km_for_ef is not None:
            # Try per-km EFs for CH4 and N2O (g/km)
            ch4_km = self._get_per_km_ef(conn, fuel_item, tech_key, "CH4", record.country)
            n2o_km = self._get_per_km_ef(conn, fuel_item, tech_key, "N2O", record.country)

            if ch4_km is not None:
                kg_ch4 = qty_km_for_ef * ch4_km / 1000.0   # g/km → kg
                calc_steps.append({
                    "label": "CH₄ (per-km EF)",
                    "value": f"{qty_km_for_ef:.2f} km × {ch4_km} g/km / 1000 = {kg_ch4:.6f} kg CH₄",
                })
            elif ch4_ef:
                kg_ch4 = qty_tj * ef_to_kg_per_tj(ch4_ef)
                calc_steps.append({
                    "label": "CH₄ (per-TJ EF)",
                    "value": f"{qty_tj:.8f} TJ × {ef_to_kg_per_tj(ch4_ef):.4f} kg/TJ = {kg_ch4:.6f} kg CH₄",
                })

            if n2o_km is not None:
                kg_n2o = qty_km_for_ef * n2o_km / 1000.0
                calc_steps.append({
                    "label": "N₂O (per-km EF)",
                    "value": f"{qty_km_for_ef:.2f} km × {n2o_km} g/km / 1000 = {kg_n2o:.6f} kg N₂O",
                })
            elif n2o_ef:
                kg_n2o = qty_tj * ef_to_kg_per_tj(n2o_ef)
                calc_steps.append({
                    "label": "N₂O (per-TJ EF)",
                    "value": f"{qty_tj:.8f} TJ × {ef_to_kg_per_tj(n2o_ef):.4f} kg/TJ = {kg_n2o:.6f} kg N₂O",
                })
        else:
            if ch4_ef:
                kg_ch4 = qty_tj * ef_to_kg_per_tj(ch4_ef)
                calc_steps.append({
                    "label": "CH₄ emissions",
                    "value": f"{qty_tj:.8f} TJ × {ef_to_kg_per_tj(ch4_ef):.4f} kg/TJ = {kg_ch4:.6f} kg CH₄",
                })
            if n2o_ef:
                kg_n2o = qty_tj * ef_to_kg_per_tj(n2o_ef)
                calc_steps.append({
                    "label": "N₂O emissions",
                    "value": f"{qty_tj:.8f} TJ × {ef_to_kg_per_tj(n2o_ef):.4f} kg/TJ = {kg_n2o:.6f} kg N₂O",
                })

        # ── Step 5: GWP rollup ─────────────────────────────────────────────
        kg_co2e = rollup_co2e(kg_co2, kg_ch4, kg_n2o, gwp)
        calc_steps.append({
            "label": "Total CO₂e",
            "value": (
                f"CO₂: {kg_co2/1000:.6f} + "
                f"CH₄: {kg_ch4/1000:.6f} × {gwp_info['CH4_fossil']} + "
                f"N₂O: {kg_n2o/1000:.6f} × {gwp_info['N2O']} = "
                f"{kg_co2e:.4f} kg CO₂e"
            ),
            "note": f"IPCC AR{gwp} GWP100",
        })

        fallback_level = co2_ef.fallback_level
        fallback_triggered = co2_ef.fallback_triggered

        audit_trace = {
            "inputs": {
                "quantity": record.quantity,
                "unit": record.unit,
                "vehicle_type": tech_key,
                "fuel_item": fuel_item,
                "country": record.country,
                "reporting_year": record.reporting_year,
            },
            "conversions": conversion_steps,
            "ef_lookup": {
                "CO2": {"factor_id": co2_ef.factor_id, "value": f"{co2_kg_per_tj:.4f} kgCO₂/TJ",
                         "fallback": co2_ef.fallback_level},
                "CH4": {"factor_id": ch4_ef.factor_id if ch4_ef else None},
                "N2O": {"factor_id": n2o_ef.factor_id if n2o_ef else None},
            },
            "calculation": calc_steps,
            "gwp": gwp_info,
            "result": {
                "kg_CO2": round(kg_co2, 4),
                "kg_CH4": round(kg_ch4, 6),
                "kg_N2O": round(kg_n2o, 6),
                "kg_CO2e": round(kg_co2e, 4),
            },
            "methodology": (
                "Mobile combustion per IPCC 2006 Vol.2 Ch.3 Tier 1. "
                "CO₂ from fuel combustion stoichiometry (per TJ). "
                f"CH₄/N₂O from {'per-km' if use_km_ef else 'per-TJ'} emission factors. "
                f"CO₂e using IPCC AR{gwp} GWP100."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2, 4),
            kg_CH4=round(kg_ch4, 6),
            kg_N2O=round(kg_n2o, 6),
            kg_CO2e=round(kg_co2e, 4),
            gwp_ar_used=gwp,
            factor_id_used=co2_ef.factor_id,
            ef_value_used=co2_kg_per_tj,
            ef_unit="kgCO₂/TJ",
            ef_source=co2_ef.source,
            ef_source_year=co2_ef.source_year,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace=audit_trace,
        )

    def _get_fuel_efficiency(self, conn, tech_key: str) -> float:
        """Fetch fuel efficiency (L/100km) from DB or hardcoded defaults."""
        # Hardcoded defaults from emission_factors.json mobile factors
        defaults = {
            "petrol_cars": 8.0,
            "diesel_cars": 6.5,
            "diesel_trucks_heavy": 28.0,
            "diesel_buses": 22.0,
            "jet_fuel_aviation": 25.0,  # L/100 passenger-km estimate
            "2W/3W": 3.5,
            "MCV/HCV": 18.0,
            "LCV": 10.0,
        }
        return defaults.get(tech_key, 8.0)   # 8 L/100km as safe default

    def _get_per_km_ef(
        self, conn, fuel_item: str, tech_key: str, gas: str, country: str
    ) -> float | None:
        """Fetch per-km EF (g/km) from emission_factors table."""
        from ef_store.selector import get_ef, MissingEFError
        try:
            ef = get_ef(
                conn,
                module=self.module_name,
                fuel_item=fuel_item,
                gas=gas,
                country=country,
                technology_process=tech_key,
            )
            # Check if it's a per-km EF (unit_denominator = 'km')
            if ef.unit_denominator.lower() == "km":
                # unit_numerator is 'gCH4' or 'gN2O' — already in grams
                return ef.value
        except MissingEFError:
            pass

        # Try without technology_process
        try:
            ef = get_ef(
                conn,
                module=self.module_name,
                fuel_item=fuel_item,
                gas=gas,
                country=country,
            )
            if ef.unit_denominator.lower() == "km":
                return ef.value
        except MissingEFError:
            pass

        return None
