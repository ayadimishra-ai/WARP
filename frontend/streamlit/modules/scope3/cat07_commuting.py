"""
sk.lite — Scope 3 Cat 7: Employee Commuting.

Methods:
  distance_based: employee-km × modal EF (from survey data)
  average_data:   headcount × days × default EF per employee-day
  fuel_based:     fuel consumed × combustion EF

Teleworking offset: if telework_days provided in extra, reduces total distance.

Default EFs (kgCO2e/employee-km, global averages):
  car_average: 0.168
  car_petrol:  0.170
  car_diesel:  0.163
  rail/metro:  0.0035
  bus:         0.089
  motorcycle:  0.103
  walk/cycle:  0.0

Average-data default (global): 1.8 kgCO2e/employee/working-day
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, MissingEFError
from core.gwp import gwp_summary


_COMMUTE_EF_DEFAULTS: dict[str, float] = {
    # ── Global defaults (DEFRA 2024) ─────────────────────────────────────
    "car_average":        0.168,
    "car_petrol":         0.170,
    "car_diesel":         0.163,
    "car":                0.168,
    "rail":               0.0035,   # DEFRA 2024 national rail UK average
    "metro":              0.0035,   # Generic metro (global average)
    "subway":             0.0035,
    "train":              0.0035,
    "bus":                0.089,
    "motorcycle":         0.103,
    "moped":              0.103,
    "bicycle":            0.0,
    "walk":               0.0,
    "electric_car":       0.053,
    "ev":                 0.053,
    "taxi":               0.149,
    "ferry":              0.019,
    # ── India-specific modes ─────────────────────────────────────────────
    # Auto-rickshaw
    "auto_rickshaw_cng":  0.060,    # MoRTH India 2023. CNG auto, 3 passengers.
    "auto_rickshaw_petrol":0.090,   # CPCB India. Petrol auto, 2 passengers.
    "auto_rickshaw":      0.060,    # Default to CNG (majority India fleet)
    "auto":               0.060,
    "tuk_tuk":            0.060,
    # City metro systems
    "metro_mumbai":       0.012,    # MMRC ESG Report 2023
    "metro_delhi":        0.008,    # DMRC GHG Inventory 2022
    "metro_bangalore":    0.015,    # BMRCL Sustainability Report 2023
    "metro_hyderabad":    0.014,    # HMRL Annual Report 2022
    "metro_chennai":      0.018,    # CMRL Sustainability 2022
    # Suburban rail
    "suburban_rail_mumbai": 0.007,  # Indian Railways ESG 2023 — busiest commuter rail
    "suburban_rail_india":  0.012,  # Indian Railways average electric suburban
    "local_train":          0.012,  # alias
    # City bus services
    "bus_best_mumbai":    0.065,    # BEST CNG fleet Annual Report 2022-23
    "bus_dtc_delhi":      0.055,    # DTC CNG fleet Annual Report 2022
    "bus_bmtc_bangalore": 0.072,    # BMTC diesel/CNG mix
    "bus_india_cng":      0.060,    # India CNG city bus generic
    "bus_india_diesel":   0.080,    # India diesel city bus generic
    # Other India modes
    "cab_aggregator":     0.140,    # Ola/Uber India. OLA ESG Report 2022.
    "ola":                0.140,    # alias
    "uber":               0.140,    # alias
    "electric_2wheeler":  0.040,    # CEA v20 grid + OEM spec (3kWh/100km, 1.5 pass)
    "e_scooter":          0.040,    # alias
    "petrol_2wheeler":    0.089,    # CPCB 2023 BS-VI fleet
    "car_cng":            0.092,    # MoRTH India CNG car, 1.5 occupancy
    "cng_car":            0.092,    # alias
}

_AVERAGE_EF_PER_EMPLOYEE_DAY = 1.8   # kgCO2e — global default
_AVERAGE_EF_PER_EMPLOYEE_DAY_INDIA = 1.5  # India: lower due to higher public transit share


class Cat07Commuting(BaseModule):
    module_name = "other"
    PROCESS_DIST = "S3 Cat 7 — Employee commuting (distance-based)"
    PROCESS_FUEL = "S3 Cat 7 — Employee commuting (fuel-based)"
    PROCESS_AVG  = "S3 Cat 7 — Employee commuting (average-data)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        method = record.method_variant or record.process
        if "average" in method.lower():
            return self._average_data(record, conn)
        if "fuel" in method.lower():
            return self._fuel_based(record, conn)
        return self._distance_based(record, conn)

    def _distance_based(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        mode = (record.fuel_or_item or "car_average").lower()

        # Unit: employee-km, km (total fleet), or pkm
        emp_km = record.quantity

        # Teleworking offset
        telework_pct = record.extra.get("telework_pct", 0.0)
        if telework_pct > 0:
            offset = emp_km * (telework_pct / 100)
            emp_km_net = emp_km - offset
        else:
            emp_km_net = emp_km
            offset = 0.0

        # EF lookup
        ef_val, ef_src, ef_fid, fallback_level, fallback_triggered = \
            self._get_commute_ef(conn, mode, record.country)

        kg_co2e = emp_km_net * ef_val

        steps = [
            {"label": "Employee-km (gross)", "value": f"{record.quantity:.2f} emp-km"},
        ]
        if offset > 0:
            steps.append({
                "label": "Teleworking offset",
                "value": f"−{offset:.2f} emp-km ({telework_pct:.1f}% telework)",
                "note": "GHG Protocol Cat 7 allows telework offset",
            })
            steps.append({"label": "Employee-km (net)", "value": f"{emp_km_net:.2f} emp-km"})
        steps.append({
            "label": "Commuting emissions",
            "value": f"{emp_km_net:.2f} emp-km × {ef_val} kgCO₂e/emp-km = {kg_co2e:.4f} kgCO₂e",
            "note": f"Mode: {mode} | EF: {ef_src}",
        })

        audit = {
            "inputs": {"quantity": record.quantity, "unit": record.unit,
                       "mode": mode, "telework_pct": telework_pct},
            "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val} kgCO₂e/emp-km",
                          "source": ef_src},
            "calculation": steps,
            "gwp": gwp_info,
            "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
            "methodology": (
                "Cat 7 employee commuting — distance-based. "
                "Employee-km × modal EF. Telework offset applied if provided."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit="kgCO₂e/employee-km", ef_source=ef_src,
            fallback_level=fallback_level, fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace=audit,
        )

    def _average_data(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Average-data method:
          quantity = number of employees
          extra.working_days = working days per year (default 220)
        """
        gwp = record.gwp_ar
        employees = record.quantity
        working_days = record.extra.get("working_days", 220)
        telework_pct = record.extra.get("telework_pct", 0.0)

        effective_days = working_days * (1 - telework_pct / 100)
        ef_per_emp_day = record.extra.get(
            "ef_per_employee_day", _AVERAGE_EF_PER_EMPLOYEE_DAY
        )
        kg_co2e = employees * effective_days * ef_per_emp_day

        audit = {
            "inputs": {"employees": employees, "working_days": working_days,
                       "telework_pct": telework_pct, "ef_per_emp_day": ef_per_emp_day},
            "calculation": [{
                "label": "Commuting emissions",
                "value": (
                    f"{employees:.0f} employees × {effective_days:.1f} days "
                    f"× {ef_per_emp_day} kgCO₂e/emp-day = {kg_co2e:.2f} kgCO₂e"
                ),
            }],
            "methodology": (
                "Cat 7 average-data. employees × effective working days × "
                "average kgCO2e per employee-day. "
                f"Default EF = {_AVERAGE_EF_PER_EMPLOYEE_DAY} kgCO2e/emp-day (global average)."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 2), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 2), gwp_ar_used=gwp,
            factor_id_used="AVG_EF_EMPLOYEE_DAY",
            ef_value_used=ef_per_emp_day, ef_unit="kgCO₂e/employee-day",
            ef_source="GHG Protocol Cat 7 average-data / global average",
            fallback_level="global", fallback_triggered=True,
            calculation_engine="local", confidence="low",
            audit_trace=audit,
        )

    def _fuel_based(self, record: ActivityRecord, conn) -> EmissionResult:
        """Fuel consumed in employee vehicles reported by company."""
        from modules.stationary_combustion import StationaryCombustion
        mode = (record.fuel_or_item or "petrol_cars").lower()
        fuel_map = {"car_petrol": "motor_gasoline", "car_diesel": "diesel_oil",
                    "car_average": "motor_gasoline", "motorcycle": "motor_gasoline"}
        fuel_item = fuel_map.get(mode, mode)
        fuel_rec = ActivityRecord(
            record_id=record.record_id, scope="Scope 3",
            process=record.process, country=record.country,
            quantity=record.quantity, unit=record.unit, fuel_or_item=fuel_item,
            reporting_year=record.reporting_year, gwp_ar=record.gwp_ar,
        )
        return StationaryCombustion().calculate(fuel_rec, conn)

    def _get_commute_ef(self, conn, mode, country):
        valid_denoms = {"pkm", "passenger-km", "passenger_km", "emp-km",
                        "employee-km", "km"}
        try:
            ef = get_ef(conn, "mobile_combustion", None, "CO2e", country,
                        technology_process=mode)
            if ef.unit_denominator.lower().replace(" ", "-") in valid_denoms or \
               ef.unit_denominator.lower() in valid_denoms:
                return (ef.value, ef.source, ef.factor_id, ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        default = _COMMUTE_EF_DEFAULTS.get(mode, 0.168)
        return (default, "DEFRA 2024 / global modal average", f"COMMUTE_{mode.upper()[:20]}",
                "global", True)
