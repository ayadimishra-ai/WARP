"""
sk.lite — Scope 3 Cat 3: Fuel and Energy-related Activities.

GHG Protocol definition:
  Emissions from the production and transportation of fuels and energy
  purchased and consumed by the reporting company that are NOT included
  in Scope 1 or 2. Three sub-processes:

  3A -- Upstream emissions of purchased fuels:
        Well-to-gate (extraction + processing + transport) of fuels
        consumed in Scope 1. EF is the upstream portion only -- the
        combustion portion is already in Scope 1.

  3B -- Upstream emissions of purchased electricity/steam/heat/cooling:
        Generation losses and transmission losses for purchased
        electricity. Usually ~4-8% addition on top of Scope 2.

  3C -- Transmission and Distribution (T&D) losses:
        Electricity lost in the grid before reaching the meter. For
        India: CEA reports ~17-19% T&D losses nationally (FY2023-24).
        The company accounts for the upstream emissions of the lost
        electricity it effectively paid for.

Well-to-gate upstream EFs (kgCO2e per unit of fuel -- upstream portion only):
  natural_gas:    0.437 kgCO2e/m3  (DEFRA 2024 upstream CH4 + CO2)
  diesel_oil:     0.610 kgCO2e/L   (crude extraction + refining)
  motor_gasoline: 0.530 kgCO2e/L
  coal_bituminous:0.012 kgCO2e/kg  (mining + transport)
  lpg:            0.168 kgCO2e/kg
  kerosene:       0.560 kgCO2e/L
  fuel_oil:       0.780 kgCO2e/L

  Per-energy equivalents (kgCO2e/GJ):
  natural_gas:    9.3  kgCO2e/GJ
  diesel_oil:     7.3  kgCO2e/GJ
  motor_gasoline: 5.6  kgCO2e/GJ
  coal_bituminous:1.7  kgCO2e/GJ
  lpg:            4.4  kgCO2e/GJ

T&D loss rates (% of delivered electricity):
  India national:  18.5%  (CEA Annual Report FY2023-24)
  UK:               6.8%  (DEFRA 2024)
  US average:       5.0%  (EIA 2022)
  Global average:   8.0%

Processes:
  'S3 Cat 3A — Upstream emissions of purchased fuels'
  'S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling'
  'S3 Cat 3C — Transmission & distribution (T&D) losses'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, get_grid_ef, MissingEFError
from core.gwp import gwp_summary
from core.unit_converter import to_tj, to_kwh

# Well-to-gate upstream EFs -- upstream portion only (kgCO2e/GJ)
# Source: DEFRA 2024 WTT (well-to-tank) factors, IPCC 2006 Vol.2 Ch.3
_UPSTREAM_FUEL_EF_KG_PER_GJ: dict[str, float] = {
    "natural_gas":           9.30,
    "diesel_oil":            7.30,
    "diesel":                7.30,
    "motor_gasoline":        5.60,
    "petrol":                5.60,
    "other_bituminous_coal": 1.70,
    "coal_bituminous":       1.70,
    "coal":                  1.70,
    "coking_coal":           2.10,
    "lpg":                   4.40,
    "kerosene":              6.10,
    "jet_fuel":              6.10,
    "fuel_oil":              7.80,
    "biomass_wood":          2.10,   # supply chain emissions only (not combustion)
    "biodiesel":             3.20,
    "biogas":                4.50,
}

# T&D loss rates by country (fraction -- NOT percentage)
_TD_LOSS_RATES: dict[str, float] = {
    "IN": 0.185,    # CEA Annual Report FY2023-24
    "GB": 0.068,    # DEFRA 2024
    "UK": 0.068,
    "US": 0.050,    # EIA 2022
    "DE": 0.040,    # Bundesnetzagentur 2022
    "AU": 0.055,    # AEMO 2023
    "JP": 0.044,    # Agency for Natural Resources & Energy 2022
    "CN": 0.058,    # NEA China 2022
    "BR": 0.152,    # ANEEL Brazil 2022 (high due to non-technical losses)
    "ZA": 0.084,    # Eskom 2022
    "ID": 0.090,    # PLN 2022
    "CA": 0.035,    # NEB Canada 2022
    "FR": 0.026,    # RTE France 2022
    "GLOBAL": 0.080,
}

# Upstream EF for purchased electricity (kgCO2e per kWh of generation losses)
# Approximately 3-6% addition on top of Scope 2 location-based EF
_UPSTREAM_ELEC_FACTOR = 0.050   # fraction of Scope 2 EF (DEFRA 2024 WTT for electricity)


class Cat03UpstreamEnergy(BaseModule):
    module_name = "other"
    PROCESS_3A = "S3 Cat 3A — Upstream emissions of purchased fuels"
    PROCESS_3B = "S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling"
    PROCESS_3C = "S3 Cat 3C — Transmission & distribution (T&D) losses"

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
        if "3A" in process or "fuel" in process.lower():
            return self._upstream_fuel(record, conn)
        if "3B" in process or "electricity" in process.lower() or "steam" in process.lower():
            return self._upstream_electricity(record, conn)
        if "3C" in process or "t&d" in process.lower() or "transmission" in process.lower():
            return self._td_losses(record, conn)
        # Default: upstream fuel
        return self._upstream_fuel(record, conn)

    # ------------------------------------------------------------------ #
    # 3A -- Upstream fuel emissions
    # ------------------------------------------------------------------ #

    def _upstream_fuel(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Well-to-gate upstream EF x fuel quantity.
        Quantity is the same fuel that was burned (Scope 1 activity data).
        Unit can be any fuel unit -- converted to GJ for EF lookup.
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        fuel = (record.fuel_or_item or "diesel_oil").lower().strip()

        # Convert to GJ (reuse to_tj then x1000)
        unit = record.unit
        if unit in ("GJ",):
            qty_gj = record.quantity
            conv_steps = []
        elif unit == "TJ":
            qty_gj = record.quantity * 1000.0
            conv_steps = [{"label": "Convert TJ->GJ", "value": f"{record.quantity} TJ = {qty_gj:.4f} GJ"}]
        else:
            # Try to_tj then convert
            try:
                qty_tj, conv_steps = to_tj(record.quantity, unit, fuel,
                                           record.country, conn)
                qty_gj = qty_tj * 1000.0
                conv_steps.append({"label": "Convert TJ->GJ",
                                   "value": f"{qty_tj:.6f} TJ = {qty_gj:.4f} GJ"})
            except Exception:
                qty_gj = record.quantity   # assume GJ if conversion fails
                conv_steps = [{"label": "Unit assumed GJ", "value": f"{qty_gj:.4f} GJ"}]

        # EF lookup: try DB first, then hardcoded
        ef_val, ef_src, ef_fid, fl, ft = self._get_upstream_fuel_ef(conn, fuel, record.country)
        kg_co2e = qty_gj * ef_val

        steps = conv_steps + [{
            "label": "Upstream fuel emissions",
            "value": f"{qty_gj:.4f} GJ x {ef_val} kgCO2e/GJ = {kg_co2e:.4f} kgCO2e",
            "note": f"Well-to-gate EF only. Combustion CO2 is in Scope 1. Source: {ef_src}",
        }]

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit="kgCO2e/GJ (upstream only)", ef_source=ef_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": unit,
                           "fuel": fuel, "country": record.country},
                "conversions": conv_steps,
                "ef_lookup": {"factor_id": ef_fid, "value": f"{ef_val} kgCO2e/GJ",
                              "source": ef_src, "note": "Upstream (well-to-gate) only"},
                "calculation": steps[-1:],
                "gwp": gwp_info,
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    "Cat 3A upstream fuel emissions. Well-to-gate EF x fuel quantity. "
                    "EF represents extraction, processing, and transport of fuel to site. "
                    "Combustion emissions are reported in Scope 1 -- do not double-count."
                ),
            },
        )

    # ------------------------------------------------------------------ #
    # 3B -- Upstream electricity
    # ------------------------------------------------------------------ #

    def _upstream_electricity(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Upstream emissions associated with generation of purchased electricity.
        Approx 5% addition on Scope 2 EF (generation losses, fuel upstream).
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)

        # Convert to kWh
        try:
            qty_kwh, conv_steps = to_kwh(record.quantity, record.unit)
        except ValueError:
            qty_kwh = record.quantity
            conv_steps = [{"label": "Assumed kWh", "value": f"{qty_kwh:.2f} kWh"}]

        # Get the Scope 2 grid EF, then apply upstream factor
        try:
            grid = get_grid_ef(conn, record.country,
                               fiscal_year=record.fiscal_year,
                               calendar_year=record.reporting_year,
                               method="weighted_avg")
            scope2_ef = grid.ef_value_kgco2e_per_kwh
            grid_src = grid.source
            fl, ft = "national", False
        except Exception:
            scope2_ef = 0.49   # IEA global average
            grid_src = "IEA global average (fallback)"
            fl, ft = "global", True

        upstream_factor = record.extra.get("upstream_elec_factor", _UPSTREAM_ELEC_FACTOR)
        upstream_ef = scope2_ef * upstream_factor
        kg_co2e = qty_kwh * upstream_ef

        steps = conv_steps + [
            {"label": "Scope 2 grid EF", "value": f"{scope2_ef} kgCO2e/kWh ({grid_src})"},
            {"label": "Upstream factor",
             "value": f"x {upstream_factor:.3f} = {upstream_ef:.4f} kgCO2e/kWh"},
            {"label": "Upstream electricity emissions",
             "value": f"{qty_kwh:.2f} kWh x {upstream_ef:.4f} = {kg_co2e:.4f} kgCO2e"},
        ]

        ef_fid = f"UPSTREAM_ELEC_{record.country}_{upstream_factor}"
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=upstream_ef,
            ef_unit="kgCO2e/kWh (upstream)", ef_source=grid_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "country": record.country},
                "conversions": conv_steps,
                "calculation": steps,
                "gwp": gwp_info,
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    "Cat 3B upstream electricity. Scope 2 grid EF x upstream factor. "
                    f"Upstream factor {upstream_factor:.1%} represents fuel extraction and "
                    "generation losses upstream of the power plant. DEFRA 2024 WTT methodology."
                ),
            },
        )

    # ------------------------------------------------------------------ #
    # 3C -- T&D losses
    # ------------------------------------------------------------------ #

    def _td_losses(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Emissions from electricity lost in transmission and distribution.
        The company accounts for upstream emissions of the kWh it paid
        for but never consumed (lost in the grid).

        quantity = electricity DELIVERED to meter (kWh)
        T&D loss = delivered_kwh x loss_rate / (1 - loss_rate)
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)

        try:
            qty_kwh, conv_steps = to_kwh(record.quantity, record.unit)
        except ValueError:
            qty_kwh = record.quantity
            conv_steps = []

        country = record.country
        loss_rate = record.extra.get(
            "td_loss_rate",
            _TD_LOSS_RATES.get(country, _TD_LOSS_RATES["GLOBAL"])
        )
        loss_rate_src = "user-supplied" if "td_loss_rate" in record.extra \
                        else f"{country} national average"

        # kWh lost = delivered x loss_rate / (1 - loss_rate)
        # (because loss_rate is expressed as % of total generation, not delivered)
        kwh_lost = qty_kwh * loss_rate / (1.0 - loss_rate)

        # Grid EF for the lost electricity
        try:
            grid = get_grid_ef(conn, country,
                               fiscal_year=record.fiscal_year,
                               calendar_year=record.reporting_year,
                               method="weighted_avg")
            grid_ef = grid.ef_value_kgco2e_per_kwh
            grid_src = grid.source
            fl, ft = "national", False
        except Exception:
            grid_ef = 0.49
            grid_src = "IEA global average (fallback)"
            fl, ft = "global", True

        kg_co2e = kwh_lost * grid_ef

        steps = conv_steps + [
            {"label": "T&D loss rate",
             "value": f"{loss_rate:.1%} ({loss_rate_src})"},
            {"label": "kWh lost in grid",
             "value": f"{qty_kwh:.2f} kWh x {loss_rate:.4f} / {1-loss_rate:.4f} = {kwh_lost:.4f} kWh lost"},
            {"label": "Grid EF",
             "value": f"{grid_ef} kgCO2e/kWh ({grid_src})"},
            {"label": "T&D loss emissions",
             "value": f"{kwh_lost:.4f} kWh lost x {grid_ef} = {kg_co2e:.4f} kgCO2e"},
        ]

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=f"TD_LOSS_{country}",
            ef_value_used=grid_ef,
            ef_unit="kgCO2e/kWh (grid, lost electricity)",
            ef_source=f"{grid_src} | T&D rate: {loss_rate_src}",
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "country": country, "td_loss_rate": loss_rate},
                "conversions": conv_steps,
                "calculation": steps,
                "gwp": gwp_info,
                "result": {"kwh_lost": round(kwh_lost, 4),
                           "kg_CO2e": round(kg_co2e, 4),
                           "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    f"Cat 3C T&D losses. T&D loss rate {loss_rate:.1%} for {country}. "
                    "Lost kWh = delivered kWh x loss_rate / (1 - loss_rate). "
                    "Emissions = lost kWh x grid average EF. "
                    "Source: CEA Annual Report / DEFRA 2024 / national grid operator data."
                ),
            },
        )

    # ------------------------------------------------------------------ #
    # EF helpers
    # ------------------------------------------------------------------ #

    def _get_upstream_fuel_ef(self, conn, fuel, country):
        """Return (ef_kgco2e_per_gj, source, factor_id, fallback_level, triggered)."""
        try:
            ef = get_ef(conn, "other", fuel, "CO2e", country)
            if ef.unit_denominator.upper() in ("GJ", "MJ"):
                val = ef.value if ef.unit_denominator.upper() == "GJ" else ef.value / 1000
                return (val, ef.source, ef.factor_id, ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        # Hardcoded defaults (kgCO2e/GJ upstream)
        default = _UPSTREAM_FUEL_EF_KG_PER_GJ.get(fuel)
        if default is None:
            for k, v in _UPSTREAM_FUEL_EF_KG_PER_GJ.items():
                if fuel in k or k in fuel:
                    default = v
                    break
        if default is None:
            default = 7.30   # diesel as safe default
        return (default, "DEFRA 2024 WTT / IPCC 2006 Vol.2",
                f"WTT_{fuel.upper()[:20]}", "global", True)
