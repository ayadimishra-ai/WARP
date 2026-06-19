"""
sk.lite — Scope 3 Cat 6: Business Travel.

GHG Protocol: emissions from transportation of employees for business activities.
Covers: flights, rail, taxi/car hire, hotel stays.

Methods:
  distance_based: passenger-km × modal EF (primary)
  fuel_based:     fuel used × combustion EF

EF sources:
  DEFRA 2024 passenger transport EFs (seeded via DEFRA CSV in Sprint 3)
  Fallback: IPCC / scope3-emission-tracker global averages

Default EFs (kgCO2e/passenger-km, DEFRA 2024 / ICAO average):
  Short-haul flight (<3700km economy):   0.255
  Long-haul flight (>3700km economy):    0.195
  Long-haul flight business class:       0.429
  Rail (UK average):                     0.0035
  Car (average UK fleet):                0.168  (kgCO2e/km, not pkm)
  Hotel (per night, global average):     20.2   (kgCO2e/night)

Process: 'S3 Cat 6 — Business travel (distance-based passenger-km + hotels)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, MissingEFError
from core.gwp import gwp_summary
from core.unit_converter import to_km


# Default EFs — fallback when DEFRA CSV not seeded
_TRAVEL_EF_DEFAULTS: dict[str, float] = {
    # kgCO2e per passenger-km
    "flight_short_haul_economy":    0.255,
    "flight_short_haul_business":   0.383,
    "flight_long_haul_economy":     0.195,
    "flight_long_haul_business":    0.429,
    "flight_long_haul_first":       0.586,
    "flight_domestic":              0.255,
    "flight_international":         0.195,
    "flight":                       0.225,   # average
    "air":                          0.225,
    "rail":                         0.0035,
    "train":                        0.0035,
    "car_average":                  0.168,
    "car_petrol":                   0.170,
    "car_diesel":                   0.163,
    "taxi":                         0.149,
    "bus":                          0.089,
    "ferry":                        0.019,
    # kgCO2e per hotel night
    "hotel_night":                  20.2,
    "hotel":                        20.2,
    "hotel_uk":                     18.6,
    "hotel_us":                     22.0,
    "hotel_europe":                 17.5,
    "hotel_asia":                   23.0,
}


class Cat06BusinessTravel(BaseModule):
    module_name = "other"
    PROCESS = "S3 Cat 6 — Business travel (distance-based passenger-km + hotels)"
    PROCESS_FUEL = "S3 Cat 6 — Business travel (fuel-based / energy-based)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        if not record.fuel_or_item:
            errors.append(
                "fuel_or_item must specify travel mode "
                f"(e.g. 'flight_long_haul_economy'). "
                f"Options: {list(_TRAVEL_EF_DEFAULTS.keys())[:8]}..."
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        # ── Flight number path (Batch 7) ──────────────────────────────────
        flight_number = record.extra.get("flight_number", "").strip()
        if flight_number:
            return self._icao_fuel_method(record, conn, flight_number)

        mode = (record.fuel_or_item or "flight").lower().strip()
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        steps = []

        # Detect hotel nights vs distance
        is_hotel = "hotel" in mode
        if is_hotel:
            nights = record.quantity
            unit_display = "nights"
            steps.append({"label": "Hotel nights", "value": f"{nights:.0f} nights"})
        else:
            # Convert to km if needed
            if record.unit.lower() in ("km", "kilometre", "kilometers"):
                pkm = record.quantity
            elif record.unit.lower() in ("mile", "miles"):
                pkm, conv = to_km(record.quantity, "miles")
                steps.extend(conv)
            elif record.unit.lower() in ("pkm", "passenger-km", "passenger_km"):
                pkm = record.quantity
            else:
                pkm = record.quantity  # assume km
                steps.append({"label": "Unit assumed as km", "value": f"{pkm:.2f} km"})

            unit_display = "passenger-km"
            steps.append({"label": "Passenger-km", "value": f"{pkm:.2f} pkm"})

        # EF lookup: try DB first (DEFRA CSV), then defaults
        ef_val, ef_src, ef_fid, fallback_level, fallback_triggered = \
            self._get_travel_ef(conn, mode, record.country)

        # Calculate
        activity = nights if is_hotel else pkm
        kg_co2e = activity * ef_val
        unit_label = "kgCO₂e/night" if is_hotel else "kgCO₂e/pkm"

        steps.append({
            "label": f"Emissions ({mode})",
            "value": f"{activity:.2f} {unit_display} × {ef_val} {unit_label} = {kg_co2e:.4f} kgCO₂e",
            "note": f"EF: {ef_src}",
        })

        # Radiative forcing uplift for flights (standard GHG Protocol recommendation)
        rf_note = None
        if "flight" in mode or "air" in mode:
            rf_factor = record.extra.get("rf_factor", 1.0)
            if rf_factor > 1.0:
                steps.append({
                    "label": "Radiative forcing uplift",
                    "value": f"× {rf_factor} = {kg_co2e * rf_factor:.4f} kgCO₂e",
                    "note": "Non-CO₂ warming effects at altitude",
                })
                kg_co2e *= rf_factor
                rf_note = f"Radiative forcing factor {rf_factor} applied."

        audit = {
            "inputs": {"quantity": record.quantity, "unit": record.unit,
                       "mode": mode, "country": record.country},
            "conversions": steps[:-1] if not is_hotel else [],
            "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val} {unit_label}",
                          "source": ef_src, "fallback_level": fallback_level},
            "calculation": [steps[-1]],
            "gwp": gwp_info,
            "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
            "rf_note": rf_note,
            "methodology": (
                "Cat 6 business travel — distance-based. "
                "Passenger-km × modal emission factor. "
                "Hotel nights × per-night emission factor. "
                "GHG Protocol Scope 3 Technical Guidance Category 6."
            ),
        }

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4),
            kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4),
            gwp_ar_used=gwp,
            factor_id_used=ef_fid,
            ef_value_used=ef_val,
            ef_unit=unit_label,
            ef_source=ef_src,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace=audit,
        )

    def _get_travel_ef(
        self, conn, mode: str, country: str
    ) -> tuple[float, str, str, str, bool]:
        # Determine module: hotel nights are in 'other', transport in 'mobile_combustion'
        is_hotel = "hotel" in mode
        lookup_module = "other" if is_hotel else "mobile_combustion"

        # Unit denominators that indicate a valid per-passenger or per-night EF
        valid_denoms = {"pkm", "passenger-km", "passenger_km", "km", "night", "nights"}

        try:
            ef = get_ef(conn, lookup_module, None, "CO2e", country,
                        technology_process=mode)
            if ef.unit_denominator.lower().replace(" ", "-") in valid_denoms or \
               ef.unit_denominator.lower() in valid_denoms:
                return (ef.value, ef.source, ef.factor_id,
                        ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass

        # Hardcoded defaults
        default = _TRAVEL_EF_DEFAULTS.get(mode)
        if default is None:
            for key, val in _TRAVEL_EF_DEFAULTS.items():
                if mode in key or key in mode:
                    default = val
                    break
        if default is None:
            default = 0.225  # average flight

        return (
            default,
            "DEFRA 2024 GHG Conversion Factors / ICAO global average",
            f"TRAVEL_DEFAULT_{mode.upper()[:30]}",
            "global", True,
        )

    def _icao_fuel_method(
        self,
        record: ActivityRecord,
        conn: sqlite3.Connection,
        flight_number: str,
    ) -> EmissionResult:
        """
        ICAO fuel-based calculation from flight number.

        Resolves: flight number → aircraft type → fuel burn → CO2 per passenger.
        Falls back to distance-based if aircraft or route not found.

        extra fields used:
            flight_number:   e.g. 'AI101', 'EK526'
            dep_iata:        departure airport IATA (optional, auto-resolved if not given)
            arr_iata:        arrival airport IATA (optional)
            cabin_class:     'economy'/'business'/'first' (default economy)
            n_passengers:    number of passengers (default 1)
            rf_factor:       radiative forcing multiplier (default 1.0)
            aviationstack_key: API key for live flight lookup (optional)
        """
        from utils.flight_lookup import (
            lookup_flight, icao_fuel_method, airport_distance_km,
            parse_flight_number,
        )
        from core.gwp import gwp_summary

        gwp    = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        extra  = record.extra or {}
        cabin  = extra.get("cabin_class", "economy")
        n_pax  = int(extra.get("n_passengers", 1))
        rf     = float(extra.get("rf_factor", 1.0))
        api_key = extra.get("aviationstack_key", "")

        # 1. Resolve flight → aircraft + route
        flight_info = lookup_flight(flight_number, conn, api_key=api_key or None)
        aircraft_icao = flight_info.get("aircraft_icao") or ""

        # 2. Resolve distance
        dep_iata = extra.get("dep_iata", "") or flight_info.get("dep_iata", "")
        arr_iata = extra.get("arr_iata", "") or flight_info.get("arr_iata", "")
        distance_km = flight_info.get("distance_km")

        if not distance_km and dep_iata and arr_iata:
            distance_km = airport_distance_km(dep_iata, arr_iata, conn)

        # 3. Fallback: use record quantity as distance if nothing resolved
        if not distance_km:
            distance_km = float(record.quantity)
            fallback_dist = True
        else:
            fallback_dist = False

        # 4. ICAO fuel calculation
        if aircraft_icao:
            result_data = icao_fuel_method(
                distance_km=distance_km,
                aircraft_icao=aircraft_icao,
                cabin_class=cabin,
                n_passengers=n_pax,
                rf_factor=rf,
                conn=conn,
            )
            kg_co2e      = result_data["kg_CO2e"]
            ef_src       = f"ICAO fuel method — {flight_number} ({aircraft_icao}) {result_data['ef_source']}"
            ef_fid       = f"ICAO_FUEL_{aircraft_icao}_{cabin.upper()}"
            fl           = "national" if flight_info.get("api_used") else "global"
            ft           = not flight_info.get("api_used", False)
            ef_val       = result_data["co2e_passenger_kg"] / distance_km if distance_km else 0
            methodology  = result_data["note"]
        else:
            # No aircraft type — fall back to distance-based with flight EF
            airline_code, _ = parse_flight_number(flight_number)
            mode = "flight_long_haul_economy"
            ef_val, ef_src, ef_fid, fl, ft = self._get_travel_ef(conn, mode, record.country)
            kg_co2e = distance_km * ef_val * n_pax
            methodology = (
                f"Flight {flight_number}: aircraft type not resolved. "
                f"Fallback to {mode} EF × {distance_km:.0f} km."
            )
            result_data = {}

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid,
            ef_value_used=round(ef_val, 6),
            ef_unit="kgCO₂e/km (ICAO fuel method)",
            ef_source=ef_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {
                    "flight_number": flight_number,
                    "dep_iata": dep_iata, "arr_iata": arr_iata,
                    "aircraft_icao": aircraft_icao,
                    "distance_km": round(distance_km, 1),
                    "distance_source": "user-provided" if fallback_dist else flight_info.get("source",""),
                    "cabin_class": cabin,
                    "n_passengers": n_pax,
                    "rf_factor": rf,
                },
                "flight_lookup": flight_info,
                "icao_calculation": result_data,
                "gwp": gwp_info,
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": methodology,
            },
        )

