"""
sk.lite — Scope 3 Cat 4: Upstream Transport & Distribution.

GHG Protocol: emissions from transport of purchased goods from supplier to reporting company.
Includes third-party logistics, not company-owned vehicles (those are Scope 1).

Methods implemented:
  distance_based: tonne-km × modal EF (primary)
  fuel_based:     fuel consumed × combustion EF (port from stationary_combustion)
  spend_based:    $ spend × EEIO EF (via USEEIO sector 484 Truck transportation)

EF sources (in selector rank order):
  National EFDB (rank 50) → DEFRA 2024 (rank 60) → global modal defaults (rank 980)

Global modal defaults (from scope3-emission-tracker + DEFRA 2024 averages):
  truck:  0.062 kgCO2e/tonne-km
  rail:   0.022 kgCO2e/tonne-km
  ship:   0.008 kgCO2e/tonne-km
  air:    0.602 kgCO2e/tonne-km

Process names:
  'S3 Cat 4 — Upstream transport (distance-based tonne-km)'
  'S3 Cat 4 — Upstream transport (fuel-based)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, get_eeio_co2e, MissingEFError
from core.gwp import rollup_co2e, gwp_summary
from core.unit_converter import to_tonne_km, to_tj


# Global modal EFs (kgCO2e/tonne-km) — fallback when DB has nothing
_MODAL_EF_DEFAULTS: dict[str, float] = {
    "truck":          0.062,
    "road":           0.062,
    "hgv":            0.062,
    "lorry":          0.062,
    "rail":           0.022,
    "train":          0.022,
    "freight_train":  0.022,
    "ship":           0.008,
    "sea":            0.008,
    "ocean":          0.008,
    "container_ship": 0.008,
    "air":            0.602,
    "airfreight":     0.602,
    "plane":          0.602,
    "intermodal":     0.040,   # weighted average truck+rail+ship
}

_MODAL_FUEL_MAP: dict[str, str] = {
    "truck":  "diesel_oil",
    "road":   "diesel_oil",
    "hgv":    "diesel_oil",
    "rail":   "diesel_oil",
    "ship":   "fuel_oil",
    "ocean":  "fuel_oil",
    "air":    "jet_fuel",
}


class Cat04UpstreamTransport(BaseModule):
    module_name = "other"  # matches catalog module field

    PROCESS_DISTANCE = "S3 Cat 4 — Upstream transport (distance-based tonne-km)"
    PROCESS_FUEL     = "S3 Cat 4 — Upstream transport (fuel-based)"
    PROCESS_SPEND    = "S3 Cat 4 — Upstream transport (spend-based EEIO)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        method = record.method_variant or record.process

        if "distance" in method.lower() or "tonne" in method.lower():
            if not record.extra.get("weight") or not record.extra.get("weight_unit"):
                # Allow tonne-km direct input (quantity IS the tonne-km)
                pass
        return errors

    # ── Distance-based (primary) ─────────────────────────────────────────

    def _distance_based(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        mode = (record.fuel_or_item or "truck").lower()
        steps = []

        # Resolve tonne-km — two input patterns:
        # (a) record.unit == 'tonne-km' → quantity IS the tonne-km
        # (b) extra contains weight+distance separately
        if record.unit.lower() in ("tonne-km", "tkm", "t-km", "tonne_km"):
            tkm = record.quantity
            steps.append({
                "label": "Tonne-km (direct input)",
                "value": f"{tkm:.4f} tonne-km",
            })
        elif record.extra.get("weight"):
            weight = float(record.extra["weight"])
            w_unit = record.extra.get("weight_unit", "t")
            dist = record.quantity
            d_unit = record.unit
            tkm, conv = to_tonne_km(weight, w_unit, dist, d_unit)
            steps.extend(conv)
        else:
            # Treat quantity/unit as tonne-km
            tkm = record.quantity
            steps.append({
                "label": "Tonne-km assumed",
                "value": f"{tkm:.4f} tonne-km",
                "note": "quantity treated as tonne-km. Set unit='tonne-km' to confirm.",
            })

        # EF lookup: try DB first, fall back to hardcoded modal defaults
        ef_val, ef_src, ef_fid, fallback_level, fallback_triggered = \
            self._get_modal_ef(conn, mode, record.country)

        # kgCO2e = tkm × ef (kgCO2e/tonne-km)
        kg_co2e = tkm * ef_val

        steps.append({
            "label": f"Emissions ({mode})",
            "value": f"{tkm:.4f} t·km × {ef_val} kgCO₂e/t·km = {kg_co2e:.4f} kg CO₂e",
            "note": f"EF source: {ef_src}",
        })

        audit = {
            "inputs": {"quantity": record.quantity, "unit": record.unit,
                       "mode": mode, "country": record.country},
            "conversions": steps[:-1],
            "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val} kgCO₂e/t·km",
                          "source": ef_src, "fallback_level": fallback_level},
            "calculation": [steps[-1]],
            "gwp": gwp_info,
            "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
            "methodology": (
                "Cat 4 upstream transport — distance-based. "
                "tonne-km × modal emission factor. "
                "GHG Protocol Scope 3 Technical Guidance Category 4."
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
            ef_unit="kgCO₂e/tonne-km",
            ef_source=ef_src,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace=audit,
        )

    # ── Fuel-based ───────────────────────────────────────────────────────

    def _fuel_based(self, record: ActivityRecord, conn) -> EmissionResult:
        """Fuel consumed by third-party transport → use stationary combustion logic."""
        from modules.stationary_combustion import StationaryCombustion
        mode = (record.fuel_or_item or "diesel_oil").lower()
        fuel_item = _MODAL_FUEL_MAP.get(mode, mode)
        fuel_record = ActivityRecord(
            record_id=record.record_id,
            scope="Scope 3",
            category=record.category,
            process=record.process,
            country=record.country,
            quantity=record.quantity,
            unit=record.unit,
            fuel_or_item=fuel_item,
            reporting_year=record.reporting_year,
            gwp_ar=record.gwp_ar,
            org_id=record.org_id,
        )
        result = StationaryCombustion().calculate(fuel_record, conn)
        result.record_id = record.record_id
        result.audit_trace["methodology"] = (
            "Cat 4 upstream transport — fuel-based. "
            "Fuel consumption × combustion EFs per IPCC 2006 Vol.2."
        )
        return result

    # ── Spend-based (EEIO) ───────────────────────────────────────────────

    def _spend_based(self, record: ActivityRecord, conn) -> EmissionResult:
        """$ spend on transport × EEIO EF."""
        from core.subroutines import sr_cur_01
        _FX_TO_USD = {
            "USD": 1.0, "INR": 0.012, "EUR": 1.08, "GBP": 1.27,
            "JPY": 0.0067, "CNY": 0.138, "SGD": 0.74, "AUD": 0.65, "CAD": 0.74,
        }
        unit_upper = (record.unit or "USD").upper()
        fx = record.extra.get("fx_to_usd", _FX_TO_USD.get(unit_upper, 1.0))
        spend_usd = sr_cur_01(record.quantity, fx)

        sector = "484"   # BEA: Truck transportation (summary level)
        try:
            co2e_per_usd, breakdown = get_eeio_co2e(conn, sector, gwp_ar=record.gwp_ar)
        except Exception:
            co2e_per_usd = 0.00031   # ~0.31 kgCO2e/USD global transport default
            breakdown = {"note": "EEIO lookup failed, using default"}

        kg_co2e = spend_usd * co2e_per_usd

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4),
            gwp_ar_used=record.gwp_ar,
            factor_id_used=f"USEEIO_{sector}_CO2e",
            ef_value_used=co2e_per_usd,
            ef_unit="kgCO₂e/USD",
            ef_source="USEEIO v2 / Exiobase 2019",
            fallback_level="global",
            fallback_triggered=True,
            calculation_engine="local",
            confidence="low",
            audit_trace={
                "inputs": {"spend": record.quantity, "unit": record.unit, "fx": fx},
                "conversions": [{"label": "Convert to USD", "value": f"{spend_usd:.2f} USD"}],
                "ef_lookup": {"sector": sector, "ef_per_usd": co2e_per_usd},
                "calculation": [{"label": "Emissions",
                                  "value": f"{spend_usd:.2f} USD × {co2e_per_usd:.5f} = {kg_co2e:.4f} kgCO₂e"}],
                "methodology": "Cat 4 spend-based. USEEIO sector 484 Truck transportation EF.",
            },
        )

    def _get_modal_ef(
        self, conn, mode: str, country: str
    ) -> tuple[float, str, str, str, bool]:
        """
        Return (ef_value, source, factor_id, fallback_level, fallback_triggered).
        Tries DB first, then hardcoded modal defaults.
        """
        try:
            ef = get_ef(conn, "mobile_combustion", None, "CO2e",
                        country, technology_process=mode)
            if ef.unit_denominator.lower().replace(" ", "-") in (
                "tonne-km", "tkm", "t-km", "tonne_km"
            ):
                return (ef.value, ef.source, ef.factor_id,
                        ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass

        # Hardcoded global defaults
        default = _MODAL_EF_DEFAULTS.get(mode, 0.062)
        return (
            default,
            "scope3-emission-tracker defaults / DEFRA 2024 modal averages",
            f"MODAL_DEFAULT_{mode.upper()}",
            "global",
            True,
        )

    def _get_vehicle_ef(
        self, conn, make: str, model: str, load_factor: float = 0.70
    ) -> tuple[float, str, str, str, bool]:
        """
        Look up EF by vehicle make/model from vehicle_specs table.
        Applies load factor: EF_actual = EF_laden × load + EF_empty × (1 - load).

        GLEC Framework v3: EF_actual = (fuel_laden × LF + fuel_empty × (1-LF)) / payload

        Returns (ef_kgco2e_per_tkm, source, factor_id, fallback_level, triggered).
        """
        try:
            row = conn.execute(
                """
                SELECT vehicle_id, make, model, payload_t,
                       fuel_type, fuel_l_per_100km_laden, fuel_l_per_100km_empty,
                       ef_kgco2e_per_tkm_full_load, source
                FROM vehicle_specs
                WHERE LOWER(make) = LOWER(?) AND LOWER(model) = LOWER(?)
                LIMIT 1
                """,
                (make.strip(), model.strip()),
            ).fetchone()
        except Exception:
            row = None

        if row is None:
            # Try partial make match
            try:
                row = conn.execute(
                    """
                    SELECT vehicle_id, make, model, payload_t,
                           fuel_type, fuel_l_per_100km_laden, fuel_l_per_100km_empty,
                           ef_kgco2e_per_tkm_full_load, source
                    FROM vehicle_specs
                    WHERE LOWER(make) LIKE LOWER(?)
                    ORDER BY gvw_t DESC LIMIT 1
                    """,
                    (f"%{make.strip()}%",),
                ).fetchone()
            except Exception:
                row = None

        if row is None:
            return None, None, None, None, None  # caller falls back to modal EF

        r = dict(row)
        payload_t         = r.get("payload_t") or 1.0
        laden_l_100km     = r.get("fuel_l_per_100km_laden") or 0.0
        empty_l_100km     = r.get("fuel_l_per_100km_empty") or laden_l_100km * 0.5
        fuel_type         = r.get("fuel_type", "diesel").lower()
        ef_full_load      = r.get("ef_kgco2e_per_tkm_full_load")

        if ef_full_load is None or laden_l_100km == 0:
            return None, None, None, None, None

        # GLEC Framework v3 load-factor adjusted EF
        # EF_laden = fuel_laden / 100km / payload * combustion_ef_per_l
        _COMB_EF = {"diesel": 2.010, "electric": 0.0, "cng": 1.890}
        combustion_ef = _COMB_EF.get(fuel_type, 2.010)
        ef_laden = (laden_l_100km / 100.0 / payload_t) * combustion_ef
        ef_empty = (empty_l_100km / 100.0 / payload_t) * combustion_ef

        # Adjusted EF: laden portion + empty portion
        # Denominator = payload_t (assumes empty return adds to per-tonne cost)
        ef_adjusted = ef_laden * load_factor + ef_empty * (1.0 - load_factor)

        vehicle_id = r.get("vehicle_id", f"{make}_{model}")
        source = (f"{r['make']} {r['model']} — {r.get('source','vehicle_specs_india.csv')} "
                  f"| load factor {load_factor:.0%}")
        return (
            round(ef_adjusted, 6),
            source,
            f"VSPEC_{vehicle_id}",
            "national",
            False,
        )

    def _distance_based_with_vehicle(
        self, record: ActivityRecord, conn
    ) -> EmissionResult:
        """
        Distance-based calculation using vehicle make/model EF.
        extra must contain: vehicle_make, vehicle_model.
        Optional: load_factor (default 0.70 India average).
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        make = record.extra.get("vehicle_make", "")
        model = record.extra.get("vehicle_model", "")
        load_factor = float(record.extra.get("load_factor", 0.60))  # India avg 0.60

        # Try vehicle lookup
        ef_val, ef_src, ef_fid, fl, ft = self._get_vehicle_ef(conn, make, model, load_factor)

        if ef_val is None:
            # Fall back to regular distance-based
            return self._distance_based(record, conn)

        # Resolve tonne-km
        if record.unit.lower() in ("tonne-km", "tkm", "t-km", "tonne_km"):
            tkm = record.quantity
        elif record.extra.get("weight"):
            weight = float(record.extra["weight"])
            w_unit = record.extra.get("weight_unit", "t")
            tkm, _ = to_tonne_km(weight, w_unit, record.quantity, record.unit)
        else:
            tkm = record.quantity

        kg_co2e = tkm * ef_val

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit="kgCO₂e/tonne-km (vehicle-specific)",
            ef_source=ef_src, fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "vehicle_make": make, "vehicle_model": model,
                           "load_factor": load_factor},
                "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val:.6f} kgCO₂e/t·km",
                              "source": ef_src,
                              "method": "GLEC Framework v3 load-factor adjusted"},
                "calculation": [{"label": "Emissions",
                                  "value": f"{tkm:.4f} t·km × {ef_val:.6f} = {kg_co2e:.4f} kgCO₂e"}],
                "gwp": gwp_info,
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    f"Cat 4 vehicle make/model EF. {make} {model}. "
                    f"Load factor {load_factor:.0%} (GLEC Framework v3). "
                    "EF = (fuel_laden × LF + fuel_empty × (1-LF)) / payload × combustion_EF."
                ),
            },
        )

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        method = record.method_variant or ""
        # Vehicle make/model path
        if record.extra.get("vehicle_make"):
            return self._distance_based_with_vehicle(record, conn)
        if "fuel" in method.lower():
            return self._fuel_based(record, conn)
        if "spend" in method.lower() or "eeio" in method.lower():
            return self._spend_based(record, conn)
        return self._distance_based(record, conn)


# ── Self-register with engine ─────────────────────────────────────────────