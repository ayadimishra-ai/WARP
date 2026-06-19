"""
sk.lite — Scope 3 Cat 9: Downstream Transportation and Distribution.

GHG Protocol definition:
  Emissions from transportation and distribution of sold products after
  the point of sale. Includes transport between the reporting company's
  distribution facilities and the end customer, third-party retailers,
  and any downstream storage.

Boundary distinction from Cat 4:
  Cat 4 = UPSTREAM  -- supplier to reporting company's gate
  Cat 9 = DOWNSTREAM -- reporting company's gate to end customer/retailer

Methodologically identical to Cat 4. Three variants:
  distance_based -- tonne-km x modal EF (primary)
  fuel_based     -- fuel consumed by third-party transport
  spend_based    -- $ spend on logistics x EEIO EF

Downstream storage (warehousing):
  If the company pays for third-party warehousing, those energy emissions
  also belong in Cat 9. Use extra.storage_kwh to add warehouse electricity.

Modal EFs (kgCO2e/tonne-km) -- same defaults as Cat 4:
  truck:     0.062
  rail:      0.022
  ship:      0.008
  air:       0.602
  intermodal: 0.040

Processes:
  'S3 Cat 9 — Downstream transport (distance-based, tonne-km)'
  'S3 Cat 9 — Downstream transport (fuel-based)'
  'S3 Cat 9 — Downstream transport (spend-based EEIO)'
  'S3 Cat 9 — Downstream distribution/storage (site-specific)'
  'S3 Cat 9 — Downstream distribution/storage (average-data)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, MissingEFError, get_eeio_co2e
from core.gwp import gwp_summary
from core.unit_converter import to_tonne_km, to_tj
from core.subroutines import sr_cur_01

# Modal EFs (kgCO2e/tonne-km) -- same as Cat 4
_MODAL_EF: dict[str, float] = {
    "truck":          0.062,
    "road":           0.062,
    "hgv":            0.062,
    "lorry":          0.062,
    "van":            0.176,   # light commercial -- higher per-tonne-km
    "rail":           0.022,
    "train":          0.022,
    "freight_train":  0.022,
    "ship":           0.008,
    "sea":            0.008,
    "ocean":          0.008,
    "container_ship": 0.008,
    "air":            0.602,
    "airfreight":     0.602,
    "courier":        0.180,   # express parcel -- mixed modes
    "intermodal":     0.040,
    "last_mile":      0.150,   # urban delivery, mixed
}

_MODAL_FUEL: dict[str, str] = {
    "truck": "diesel_oil", "road": "diesel_oil", "van": "diesel_oil",
    "rail": "diesel_oil", "ship": "fuel_oil", "ocean": "fuel_oil",
    "air": "jet_fuel",
}


class Cat09DownstreamTransport(BaseModule):
    module_name = "other"
    PROCESS_DIST  = "S3 Cat 9 — Downstream transport (distance-based, tonne-km)"
    PROCESS_FUEL  = "S3 Cat 9 — Downstream transport (fuel-based)"
    PROCESS_SPEND = "S3 Cat 9 — Downstream transport (spend-based EEIO)"
    PROCESS_SITE  = "S3 Cat 9 — Downstream distribution/storage (site-specific)"
    PROCESS_AVG   = "S3 Cat 9 — Downstream distribution/storage (average-data)"

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
        method = record.method_variant or ""

        if "fuel" in method.lower() or "fuel-based" in process.lower():
            return self._fuel_based(record, conn)
        if "spend" in method.lower() or "spend-based" in process.lower() or "eeio" in method.lower():
            return self._spend_based(record, conn)
        if "site-specific" in process.lower():
            return self._site_specific(record, conn)
        if "average-data" in process.lower() and "storage" in process.lower():
            return self._storage_average(record, conn)
        # Default: distance-based
        return self._distance_based(record, conn)

    # ------------------------------------------------------------------ #

    def _distance_based(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        mode = (record.fuel_or_item or "truck").lower().strip()
        steps = []

        # Resolve tonne-km
        if record.unit.lower() in ("tonne-km", "tkm", "t-km", "tonne_km"):
            tkm = record.quantity
            steps.append({"label": "Tonne-km (direct)", "value": f"{tkm:.4f} tonne-km"})
        elif record.extra.get("weight"):
            weight = float(record.extra["weight"])
            w_unit = record.extra.get("weight_unit", "t")
            tkm, conv = to_tonne_km(weight, w_unit, record.quantity, record.unit)
            steps.extend(conv)
        else:
            tkm = record.quantity
            steps.append({"label": "Tonne-km assumed",
                          "value": f"{tkm:.4f} tonne-km (treat unit as tonne-km)"})

        ef_val, ef_src, ef_fid, fl, ft = self._get_modal_ef(conn, mode, record.country)

        # Optional downstream storage electricity
        storage_kwh = record.extra.get("storage_kwh", 0.0)
        storage_co2e = 0.0
        if storage_kwh > 0:
            try:
                from ef_store.selector import get_grid_ef
                grid = get_grid_ef(conn, record.country,
                                   fiscal_year=record.fiscal_year,
                                   calendar_year=record.reporting_year)
                storage_co2e = storage_kwh * grid.ef_value_kgco2e_per_kwh
                steps.append({"label": "Storage electricity",
                               "value": f"{storage_kwh} kWh x {grid.ef_value_kgco2e_per_kwh} = {storage_co2e:.4f} kgCO2e"})
            except Exception:
                pass

        transport_co2e = tkm * ef_val
        kg_co2e = transport_co2e + storage_co2e

        steps.append({
            "label": f"Transport emissions ({mode})",
            "value": f"{tkm:.4f} t-km x {ef_val} kgCO2e/t-km = {transport_co2e:.4f} kgCO2e",
            "note": ef_src,
        })
        if storage_co2e > 0:
            steps.append({"label": "Total (transport + storage)",
                          "value": f"{kg_co2e:.4f} kgCO2e"})

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit="kgCO2e/tonne-km", ef_source=ef_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "mode": mode, "storage_kwh": storage_kwh},
                "calculation": steps, "gwp": gwp_info,
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    "Cat 9 downstream transport -- distance-based. "
                    "Tonne-km x modal EF. GHG Protocol Scope 3 Technical Guidance Category 9."
                ),
            },
        )

    def _fuel_based(self, record: ActivityRecord, conn) -> EmissionResult:
        """Fuel used by third-party transport -- delegates to stationary combustion."""
        from modules.stationary_combustion import StationaryCombustion
        mode = (record.fuel_or_item or "diesel_oil").lower()
        fuel_item = _MODAL_FUEL.get(mode, mode)
        fuel_rec = ActivityRecord(
            record_id=record.record_id, scope="Scope 3",
            process=record.process, country=record.country,
            quantity=record.quantity, unit=record.unit,
            fuel_or_item=fuel_item,
            reporting_year=record.reporting_year,
            gwp_ar=record.gwp_ar, org_id=record.org_id,
        )
        result = StationaryCombustion().calculate(fuel_rec, conn)
        result.audit_trace["methodology"] = (
            "Cat 9 downstream transport -- fuel-based. "
            "Fuel consumption x combustion EF (IPCC 2006 Vol.2)."
        )
        return result

    def _spend_based(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        _FX_TO_USD = {
            "USD": 1.0, "INR": 0.012, "EUR": 1.08, "GBP": 1.27,
            "JPY": 0.0067, "CNY": 0.138, "SGD": 0.74, "AUD": 0.65, "CAD": 0.74,
        }
        unit_upper = (record.unit or "USD").upper()
        fx = record.extra.get("fx_to_usd", _FX_TO_USD.get(unit_upper, 1.0))
        spend_usd = sr_cur_01(record.quantity, fx)
        sector = "484"  # BEA Truck transportation
        try:
            co2e_per_usd, _ = get_eeio_co2e(conn, sector, gwp_ar=gwp)
            ef_src = f"USEEIO v2 sector {sector}"
            fl, ft = "national", False
        except Exception:
            co2e_per_usd = 0.00031
            ef_src = "Global logistics average (fallback)"
            fl, ft = "global", True
        kg_co2e = spend_usd * co2e_per_usd
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=f"USEEIO_{sector}_CO2e",
            ef_value_used=co2e_per_usd, ef_unit="kgCO2e/USD",
            ef_source=ef_src, fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local", confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"spend": record.quantity, "fx": fx, "spend_usd": spend_usd},
                "calculation": [{"label": "Emissions",
                    "value": f"{spend_usd:.2f} USD x {co2e_per_usd:.5f} = {kg_co2e:.4f} kgCO2e"}],
                "methodology": "Cat 9 spend-based. Logistics spend x EEIO sector EF.",
            },
        )

    def _site_specific(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Site-specific downstream warehouse/DC -- energy use x grid EF.
        quantity = kWh consumed at downstream distribution centre.
        """
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
            "Cat 9 downstream storage (site-specific). "
            "Energy consumption at downstream DC x grid EF."
        )
        return result

    def _storage_average(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Average-data storage: floor area x warehouse building EF.
        Reuses Cat 8 building EF logic.
        """
        from modules.scope3.cat08_upstream_leased import Cat08UpstreamLeased
        wh_rec = ActivityRecord(
            record_id=record.record_id, scope="Scope 3",
            process=record.process, country=record.country,
            quantity=record.quantity, unit=record.unit,
            fuel_or_item=record.fuel_or_item or "warehouse",
            reporting_year=record.reporting_year,
            fiscal_year=record.fiscal_year,
            gwp_ar=record.gwp_ar, org_id=record.org_id,
            extra=record.extra,
        )
        result = Cat08UpstreamLeased()._floor_area(wh_rec, conn)
        result.audit_trace["methodology"] = (
            "Cat 9 downstream storage (average-data). "
            "Floor area x warehouse building intensity EF."
        )
        return result

    def _get_modal_ef(self, conn, mode, country):
        try:
            ef = get_ef(conn, "mobile_combustion", None, "CO2e",
                        country, technology_process=mode)
            if ef.unit_denominator.lower() in ("tonne-km", "tkm", "t-km"):
                return (ef.value, ef.source, ef.factor_id,
                        ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        default = _MODAL_EF.get(mode, 0.062)
        return (default, "DEFRA 2024 / scope3-tracker modal defaults",
                f"MODAL9_{mode.upper()[:15]}", "global", True)
