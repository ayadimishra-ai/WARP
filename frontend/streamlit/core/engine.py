"""
sk.lite — Calculation Engine.

Routes an ActivityRecord to the correct module. All implemented modules
are imported here so the registry is always complete without needing
external self-registration calls.

Usage:
    from core.engine import calculate, calculate_batch, list_available_processes
"""

from __future__ import annotations
import sqlite3
from typing import Type, Optional

from modules.base import ActivityRecord, EmissionResult, BaseModule, MissingEFError

# ---------------------------------------------------------------------------
# Import all implemented modules
# ---------------------------------------------------------------------------

# Scope 1 core
from modules.stationary_combustion import StationaryCombustion
from modules.mobile_combustion import MobileCombustion
from modules.fugitive_energy import FugitiveEnergy
from modules.ippu_process import IPPUProcess

# Scope 2
from modules.purchased_electricity import PurchasedElectricity

# Scope 3 -- all sprints
from modules.scope3.cat01_purchased_goods    import Cat01PurchasedGoods
from modules.scope3.cat02_capital_goods      import Cat02CapitalGoods
from modules.scope3.cat03_upstream_energy    import Cat03UpstreamEnergy
from modules.scope3.cat04_upstream_transport import Cat04UpstreamTransport
from modules.scope3.cat05_waste              import Cat05Waste
from modules.scope3.cat06_business_travel    import Cat06BusinessTravel
from modules.scope3.cat07_commuting          import Cat07Commuting
from modules.scope3.cat08_upstream_leased    import Cat08UpstreamLeased
from modules.scope3.cat09_downstream_transport import Cat09DownstreamTransport
from modules.scope3.cat11_use_of_sold_products import Cat11UseOfSoldProducts
from modules.scope3.cat12_end_of_life        import Cat12EndOfLife

# ---------------------------------------------------------------------------
# Stub modules for Cat 10, 13, 14, 15 (average-data pass-through)
# These accept a pre-calculated tCO2e value via quantity/unit='tCO2e'
# OR route to a simpler average-data calculation.
# ---------------------------------------------------------------------------

class _Cat10Processing(BaseModule):
    """
    Cat 10 -- Processing of sold intermediate products.
    Site-specific: quantity = energy consumed at processor (kWh/GJ) -> grid EF.
    Average-data: quantity = tonnes of product x processing EF (kgCO2e/t).
    Default EF: 0.5 kgCO2e/kg (chemical processing average).
    """
    module_name = "other"
    _DEFAULT_EF = 0.50   # kgCO2e/kg product processed

    def validate(self, record): return []

    def calculate(self, record, conn):
        from core.gwp import gwp_summary
        gwp = record.gwp_ar
        unit = record.unit.lower()
        if unit in ("kwh","mwh","gj","tj"):
            from modules.purchased_electricity import PurchasedElectricity
            er = ActivityRecord(
                record_id=record.record_id, scope="Scope 3",
                process=record.process, country=record.country,
                quantity=record.quantity, unit=record.unit,
                fuel_or_item="grid_electricity",
                reporting_year=record.reporting_year,
                fiscal_year=record.fiscal_year,
                gwp_ar=gwp, org_id=record.org_id,
            )
            r = PurchasedElectricity().calculate(er, conn)
            r.audit_trace["methodology"] = "Cat 10 site-specific. Processor energy x grid EF."
            return r
        # Average-data: mass x processing EF
        mass_units = {"kg":1.0,"t":1000.0,"tonne":1000.0,"kt":1e6}
        qty_kg = record.quantity * mass_units.get(unit, 1.0)
        ef = record.extra.get("processing_ef_kg_co2e_per_kg", self._DEFAULT_EF)
        kg_co2e = qty_kg * ef
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e,4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e,4), gwp_ar_used=gwp,
            factor_id_used="CAT10_PROCESSING_DEFAULT",
            ef_value_used=ef, ef_unit="kgCO2e/kg",
            ef_source="Industry average (IPCC 2006 Vol.3 / ecoinvent default)",
            fallback_level="global", fallback_triggered=True,
            calculation_engine="local", confidence="low",
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "country": record.country},
                "result": {"kg_CO2e": round(kg_co2e,4), "t_CO2e": round(kg_co2e/1000,6)},
                "methodology": f"Cat 10 average-data. {qty_kg:.2f} kg x {ef} kgCO2e/kg.",
            },
        )


class _Cat13DownstreamLeased(BaseModule):
    """
    Cat 13 -- Downstream leased assets.
    Reuses Cat 8 floor-area logic (same building EFs) but downstream boundary.
    """
    module_name = "other"

    def validate(self, record): return []

    def calculate(self, record, conn):
        result = Cat08UpstreamLeased()._floor_area(record, conn)
        result.audit_trace["methodology"] = (
            "Cat 13 downstream leased assets -- floor area method. "
            "Same building intensity EFs as Cat 8, downstream boundary."
        )
        return result


class _Cat14Franchises(BaseModule):
    """
    Cat 14 -- Franchises.
    Franchise-specific: franchisee reports S1+S2, company attributes by revenue share.
    Average-data: number of franchise units x average unit emissions.
    """
    module_name = "other"
    _DEFAULT_EF = 25.0   # tCO2e per franchise unit per year (retail default)

    def validate(self, record): return []

    def calculate(self, record, conn):
        gwp = record.gwp_ar
        method = (record.method_variant or "").lower()
        if "specific" in method or record.supplier_ef_value:
            ef = record.supplier_ef_value or self._DEFAULT_EF
            # quantity = franchisee S1+S2 emissions allocated to company
            kg_co2e = record.quantity * 1000.0  # quantity assumed in tCO2e
            ef_src = "Franchisee-reported"
            fl, ft = "supplier", False
        else:
            # Average-data: units x default EF
            units = record.quantity
            ef = record.extra.get("ef_per_unit_t", self._DEFAULT_EF)
            kg_co2e = units * ef * 1000.0
            ef_src = "Industry average per franchise unit"
            fl, ft = "global", True
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e,4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e,4), gwp_ar_used=gwp,
            factor_id_used="CAT14_FRANCHISE",
            ef_value_used=record.extra.get("ef_per_unit_t", self._DEFAULT_EF),
            ef_unit="tCO2e/unit/year", ef_source=ef_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local", confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit},
                "result": {"kg_CO2e": round(kg_co2e,4), "t_CO2e": round(kg_co2e/1000,6)},
                "methodology": "Cat 14 franchises. GHG Protocol Scope 3 Category 14.",
            },
        )


class _Cat15Investments(BaseModule):
    """
    Cat 15 -- Investments.
    Equity-share method: investee_total_emissions x (equity_share / 100).
    Spend-based: investment_spend_usd x EEIO sector EF.
    Project finance: project_annual_emissions (pass-through).
    """
    module_name = "other"

    # fuel_or_item → USEEIO sector code mapping
    # Codes match USEEIO v2 summary sectors
    _SECTOR_MAP: dict = {
        "technology":        "334",    # Computer & electronic products
        "manufacturing":     "33DG",   # Durable goods manufacturing
        "energy":            "22",     # Utilities
        "financials":        "521CI",  # Monetary auth, credit intermediation
        "real_estate":       "531",    # Real estate
        "healthcare":        "621",    # Ambulatory health care
        "consumer_goods":    "311FT",  # Food mfg (as proxy for consumer goods)
        "industrials":       "333",    # Machinery manufacturing
        "transportation":    "48TW",   # Transportation & warehousing
        "materials":         "327",    # Nonmetallic mineral products
        "agriculture":       "111CA",  # Crop & animal production
        "construction":      "23",     # Construction
        "general":           "521CI",  # Default: finance sector
        # Investee-specific aliases
        "investee_s1_s2_reported": None,  # direct pass-through
        "franchise_s1_s2_reported": None,
    }

    def validate(self, record): return []

    def calculate(self, record, conn):
        gwp     = record.gwp_ar
        process = record.process or ""
        extra   = record.extra or {}
        fuel    = (record.fuel_or_item or "general").lower()

        if "spend" in process.lower() or "eeio" in process.lower():
            from core.subroutines import sr_cur_01
            from ef_store.selector import get_eeio_co2e

            fx = extra.get("fx_to_usd", record.extra.get("fx_to_usd", 1.0))
            spend_usd = sr_cur_01(record.quantity, fx)

            # Resolve sector code from fuel_or_item or explicit override
            sector = extra.get("eeio_sector") or self._SECTOR_MAP.get(fuel, "521CI")

            try:
                co2e_per_usd, _ = get_eeio_co2e(conn, sector, gwp_ar=gwp)
                ef_src = f"USEEIO sector {sector} ({fuel})"
                fl, ft = "national", False
            except Exception:
                co2e_per_usd = 0.0002   # 0.2 kgCO2e / USD fallback
                ef_src = "Global finance sector average (fallback)"
                fl, ft = "global", True

            # Apply ownership / attribution share
            ownership = float(extra.get("ownership_pct", 1.0))
            kg_co2e = spend_usd * co2e_per_usd * ownership

        elif "project" in process.lower():
            # Project finance: quantity = annual project emissions in tCO2e
            kg_co2e   = record.quantity * 1000.0
            ef_src    = "Project-reported annual emissions"
            co2e_per_usd = 1.0
            fl, ft    = "supplier", False

        else:
            # Equity share: investee_total_tco2e x equity_pct
            equity_pct = float(extra.get("equity_pct", extra.get("ownership_pct", 1.0)))
            if equity_pct > 1.0:
                equity_pct = equity_pct / 100.0   # accept both 0.25 and 25.0
            kg_co2e   = record.quantity * equity_pct * 1000.0
            ef_src    = f"Investee-reported × {equity_pct:.0%} equity share"
            co2e_per_usd = equity_pct
            fl, ft    = "supplier", False

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used="CAT15_INVESTMENTS",
            ef_value_used=co2e_per_usd, ef_unit="varies",
            ef_source=ef_src, fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local", confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "fuel_or_item": fuel, "extra": extra},
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": f"Cat 15 investments. {ef_src}.",
            },
        )


class _AFOLUEnteric(BaseModule):
    """
    AFOLU -- Enteric fermentation (Tier 1).
    quantity = number of animals
    fuel_or_item = animal_type (cattle, buffalo, sheep, goat, pig, poultry)
    IPCC 2006 Tier 1 CH4 EFs (kg CH4/head/year):
      cattle_dairy:   128, cattle_other: 57, buffalo: 55,
      sheep: 8, goat: 5, pig: 1.5, poultry: 0
    """
    module_name = "other"
    _EF: dict = {
        "cattle_dairy": 128.0, "dairy_cattle": 128.0,
        "cattle": 57.0, "cattle_other": 57.0, "beef_cattle": 57.0,
        "buffalo": 55.0,
        "sheep": 8.0,
        "goat": 5.0,
        "pig": 1.5, "swine": 1.5,
        "poultry": 0.0,
    }

    def validate(self, record): return []

    def calculate(self, record, conn):
        from core.gwp import GWP_TABLES, gwp_summary
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        animal = (record.fuel_or_item or "cattle").lower().strip()
        ef_ch4_kg_head_yr = self._EF.get(animal, 57.0)
        n_animals = record.quantity
        ch4_gwp = GWP_TABLES[gwp]["CH4_fossil"]
        kg_ch4 = n_animals * ef_ch4_kg_head_yr
        kg_co2e = kg_ch4 * ch4_gwp
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=0.0, kg_CH4=round(kg_ch4,4), kg_N2O=0.0,
            kg_CO2e=round(kg_co2e,4), gwp_ar_used=gwp,
            factor_id_used=f"AFOLU_ENTERIC_{animal.upper()[:15]}",
            ef_value_used=ef_ch4_kg_head_yr, ef_unit="kgCH4/head/year",
            ef_source="IPCC 2006 Vol.4 Table 10.10 (Tier 1)",
            fallback_level="global", fallback_triggered=False,
            calculation_engine="local", confidence="medium",
            audit_trace={
                "inputs": {"animals": n_animals, "type": animal},
                "result": {"kg_CH4": round(kg_ch4,4), "kg_CO2e": round(kg_co2e,4),
                           "t_CO2e": round(kg_co2e/1000,6)},
                "methodology": (
                    f"AFOLU enteric fermentation Tier 1. {n_animals:.0f} {animal} "
                    f"x {ef_ch4_kg_head_yr} kgCH4/head/yr x GWP{gwp}={ch4_gwp}."
                ),
            },
        )


class _AFOLUManure(BaseModule):
    """
    AFOLU — Manure management (Tier 1).
    Covers CH4 and N2O from livestock manure storage and treatment.
    quantity = number of animals
    fuel_or_item = animal type
    IPCC 2006 Vol.4 Table 10.14 (CH4) + Table 10.21 (N2O direct)
    India-specific VS and MCF values where available.
    """
    module_name = "other"
    # CH4 EFs kg CH4/head/year (IPCC 2006 Table 10.14, India Tier 1)
    _EF_CH4: dict = {
        "cattle_dairy": 1.0, "dairy_cattle": 1.0,
        "cattle": 1.0,       "beef_cattle": 1.0,
        "buffalo": 2.0,
        "sheep": 0.19,
        "goat": 0.17,
        "pig": 5.0,          "swine": 5.0,
        "poultry": 0.02,
    }
    # N2O direct EFs kg N2O/head/year (IPCC 2006 Table 10.21)
    _EF_N2O: dict = {
        "cattle_dairy": 0.34, "dairy_cattle": 0.34,
        "cattle": 0.34,       "beef_cattle": 0.34,
        "buffalo": 0.31,
        "sheep": 0.05,
        "goat": 0.04,
        "pig": 0.11,          "swine": 0.11,
        "poultry": 0.02,
    }

    def validate(self, record): return []

    def calculate(self, record, conn):
        from core.gwp import GWP_TABLES, gwp_summary
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        animal    = (record.fuel_or_item or "cattle").lower().strip()
        n_animals = record.quantity
        ch4_gwp   = GWP_TABLES[gwp]["CH4_fossil"]
        n2o_gwp   = GWP_TABLES[gwp]["N2O"]

        ef_ch4 = self._EF_CH4.get(animal, 1.0)
        ef_n2o = self._EF_N2O.get(animal, 0.1)
        kg_ch4  = n_animals * ef_ch4
        kg_n2o  = n_animals * ef_n2o
        kg_co2e = kg_ch4 * ch4_gwp + kg_n2o * n2o_gwp

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=0.0,
            kg_CH4=round(kg_ch4, 4),
            kg_N2O=round(kg_n2o, 4),
            kg_CO2e=round(kg_co2e, 4),
            gwp_ar_used=gwp,
            factor_id_used=f"AFOLU_MANURE_{animal.upper()[:15]}",
            ef_value_used=ef_ch4,
            ef_unit="kgCH4/head/year",
            ef_source="IPCC 2006 Vol.4 Tables 10.14 + 10.21 (Tier 1)",
            fallback_level="global",
            fallback_triggered=False,
            calculation_engine="local",
            confidence="medium",
            audit_trace={
                "inputs": {"animals": n_animals, "type": animal},
                "ef": {
                    "CH4_kgCH4_head_yr": ef_ch4,
                    "N2O_kgN2O_head_yr": ef_n2o,
                },
                "calculation": [
                    {"label": "CH4 from manure",
                     "value": f"{n_animals:.0f} head × {ef_ch4} kgCH4 = {kg_ch4:.4f} kgCH4"},
                    {"label": "N2O from manure",
                     "value": f"{n_animals:.0f} head × {ef_n2o} kgN2O = {kg_n2o:.4f} kgN2O"},
                    {"label": "CO2e total",
                     "value": f"{kg_ch4:.4f}×{ch4_gwp} + {kg_n2o:.4f}×{n2o_gwp} = {kg_co2e:.4f} kgCO2e"},
                ],
                "result": {"kg_CH4": round(kg_ch4,4), "kg_N2O": round(kg_n2o,4),
                           "kg_CO2e": round(kg_co2e,4), "t_CO2e": round(kg_co2e/1000,6)},
                "methodology": (
                    f"AFOLU manure management Tier 1. {n_animals:.0f} {animal}. "
                    f"IPCC 2006 Vol.4 Tables 10.14 (CH4) + 10.21 (N2O direct)."
                ),
            },
        )


# ---------------------------------------------------------------------------
# Master registry -- every process name maps to a class (never None)
# ---------------------------------------------------------------------------

_PROCESS_REGISTRY: dict[str, Type[BaseModule]] = {

    # ── Scope 1 ──────────────────────────────────────────────────────────
    "S1 \u2014 Stationary combustion (fuel burn)":    StationaryCombustion,
    "S1 \u2014 Mobile combustion (road)":             MobileCombustion,
    "S1 \u2014 Fugitive emissions (energy)":          FugitiveEnergy,

    # IPPU
    "IPPU \u2014 Cement (process CO2)":               IPPUProcess,
    "IPPU \u2014 Lime (process CO2)":                 IPPUProcess,
    "IPPU \u2014 Steel (process CO2)":                IPPUProcess,
    "IPPU \u2014 Chemicals (process emissions)":      IPPUProcess,
    "IPPU \u2014 Glass (process CO2)":                IPPUProcess,

    # AFOLU
    "AFOLU \u2014 Enteric fermentation (Tier 1)":     _AFOLUEnteric,
    "AFOLU \u2014 Manure management (Tier 1)":        _AFOLUManure,

    # ── Scope 2 ──────────────────────────────────────────────────────────
    "S2 \u2014 Purchased electricity (grid)":         PurchasedElectricity,

    # ── Scope 3 Cat 1 ────────────────────────────────────────────────────
    "S3 Cat 1 \u2014 Purchased goods & services (average-data EF per mass/unit)": Cat01PurchasedGoods,
    "S3 Cat 1 \u2014 Purchased goods & services (spend-based EEIO)":              Cat01PurchasedGoods,
    "S3 Cat 1 \u2014 Purchased goods & services (supplier-specific EF)":          Cat01PurchasedGoods,
    "S3 Cat 1 \u2014 Purchased goods & services (hybrid: supplier S1+S2 + materials + transport + waste)": Cat01PurchasedGoods,

    # ── Scope 3 Cat 2 ────────────────────────────────────────────────────
    "S3 Cat 2 \u2014 Capital goods (average-data per mass/unit)":           Cat02CapitalGoods,
    "S3 Cat 2 \u2014 Capital goods (spend-based EEIO)":                     Cat02CapitalGoods,
    "S3 Cat 2 \u2014 Capital goods (supplier-specific EF)":                 Cat02CapitalGoods,
    "S3 Cat 2 \u2014 Capital goods (hybrid: supplier S1+S2 + materials + transport + waste)": Cat02CapitalGoods,

    # ── Scope 3 Cat 3 ────────────────────────────────────────────────────
    "S3 Cat 3A \u2014 Upstream emissions of purchased fuels":                           Cat03UpstreamEnergy,
    "S3 Cat 3B \u2014 Upstream emissions of purchased electricity/steam/heat/cooling":  Cat03UpstreamEnergy,
    "S3 Cat 3C \u2014 Transmission & distribution (T&D) losses":                       Cat03UpstreamEnergy,

    # ── Scope 3 Cat 4 ────────────────────────────────────────────────────
    "S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)":         Cat04UpstreamTransport,
    "S3 Cat 4 \u2014 Upstream transport (fuel-based)":                      Cat04UpstreamTransport,
    "S3 Cat 4 \u2014 Upstream transport (spend-based EEIO)":                Cat04UpstreamTransport,
    "S3 Cat 4 \u2014 Upstream distribution/storage (site-specific facility energy + allocation)": Cat04UpstreamTransport,
    "S3 Cat 4 \u2014 Upstream distribution/storage (average-data)":         Cat04UpstreamTransport,

    # ── Scope 3 Cat 5 ────────────────────────────────────────────────────
    "S3 Cat 5 \u2014 Waste generated (landfill model)":                                    Cat05Waste,
    "S3 Cat 5 \u2014 Waste generated in operations (waste-type-specific)":                 Cat05Waste,
    "S3 Cat 5 \u2014 Waste generated in operations (supplier-specific / waste contractor emissions)": Cat05Waste,
    "S3 Cat 5 \u2014 Waste generated in operations (average-data by treatment mix)":       Cat05Waste,

    # ── Scope 3 Cat 6 ────────────────────────────────────────────────────
    "S3 Cat 6 \u2014 Business travel (distance-based passenger-km + hotels)": Cat06BusinessTravel,
    "S3 Cat 6 \u2014 Business travel (fuel-based / energy-based)":            Cat06BusinessTravel,

    # ── Scope 3 Cat 7 ────────────────────────────────────────────────────
    "S3 Cat 7 \u2014 Employee commuting (distance-based)": Cat07Commuting,
    "S3 Cat 7 \u2014 Employee commuting (fuel-based)":     Cat07Commuting,
    "S3 Cat 7 \u2014 Employee commuting (average-data)":   Cat07Commuting,

    # ── Scope 3 Cat 8 ────────────────────────────────────────────────────
    "S3 Cat 8 \u2014 Upstream leased assets (buildings, avg EF by floor area)": Cat08UpstreamLeased,
    "S3 Cat 8 \u2014 Upstream leased assets (avg EF per asset)":                Cat08UpstreamLeased,

    # ── Scope 3 Cat 9 ────────────────────────────────────────────────────
    "S3 Cat 9 \u2014 Downstream transport (distance-based, tonne-km)":  Cat09DownstreamTransport,
    "S3 Cat 9 \u2014 Downstream transport (fuel-based)":                Cat09DownstreamTransport,
    "S3 Cat 9 \u2014 Downstream transport (spend-based EEIO)":          Cat09DownstreamTransport,
    "S3 Cat 9 \u2014 Downstream distribution/storage (site-specific)":  Cat09DownstreamTransport,
    "S3 Cat 9 \u2014 Downstream distribution/storage (average-data)":   Cat09DownstreamTransport,

    # ── Scope 3 Cat 10 ───────────────────────────────────────────────────
    "S3 Cat 10 \u2014 Processing of sold intermediate products (site-specific)": _Cat10Processing,
    "S3 Cat 10 \u2014 Processing of sold intermediate products (average-data)":  _Cat10Processing,

    # ── Scope 3 Cat 11 ───────────────────────────────────────────────────
    "S3 Cat 11 \u2014 Use of sold products (direct, energy consuming products)":   Cat11UseOfSoldProducts,
    "S3 Cat 11 \u2014 Use of sold products (direct, fuels & feedstocks combustion)": Cat11UseOfSoldProducts,

    # ── Scope 3 Cat 12 ───────────────────────────────────────────────────
    "S3 Cat 12 \u2014 End-of-life of sold products (waste-treatment mix)": Cat12EndOfLife,

    # ── Scope 3 Cat 13 ───────────────────────────────────────────────────
    "S3 Cat 13 \u2014 Downstream leased assets (asset-specific S1+S2)": _Cat13DownstreamLeased,
    "S3 Cat 13 \u2014 Downstream leased assets (average-data)":         _Cat13DownstreamLeased,

    # ── Scope 3 Cat 14 ───────────────────────────────────────────────────
    "S3 Cat 14 \u2014 Franchises (franchise-specific, S1+S2 emissions)": _Cat14Franchises,
    "S3 Cat 14 \u2014 Franchises (average-data)":                        _Cat14Franchises,

    # ── Scope 3 Cat 15 ───────────────────────────────────────────────────
    "S3 Cat 15 \u2014 Investments (equity, investment-specific)":                          _Cat15Investments,
    "S3 Cat 15 \u2014 Investments (equity, average-data EEIO)":                            _Cat15Investments,
    "S3 Cat 15 \u2014 Project finance / debt with known use (project-specific annual)":    _Cat15Investments,
    "S3 Cat 15 \u2014 Project finance / debt with known use (average-data EEIO annual)":   _Cat15Investments,
    "S3 Cat 15 \u2014 Project finance (projected lifetime emissions, initial year only)":  _Cat15Investments,
}

# Common aliases for backwards compatibility
_PROCESS_ALIASES: dict[str, str] = {
    "Stationary combustion":  "S1 \u2014 Stationary combustion (fuel burn)",
    "Mobile combustion":      "S1 \u2014 Mobile combustion (road)",
    "Purchased electricity":  "S2 \u2014 Purchased electricity (grid)",
    "Grid electricity":       "S2 \u2014 Purchased electricity (grid)",
    "Scope 2 electricity":    "S2 \u2014 Purchased electricity (grid)",
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def register_module(process_name: str, module_cls: Type[BaseModule]) -> None:
    """Register or override a module. Used by tests and extensions."""
    _PROCESS_REGISTRY[process_name] = module_cls


def list_available_processes() -> dict:
    """Return all registered processes."""
    return {
        "implemented": sorted(_PROCESS_REGISTRY.keys()),
        "pending": [],
    }


def calculate(record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
    """Route one ActivityRecord to its module and return the result."""
    process = _PROCESS_ALIASES.get(record.process, record.process)

    if process not in _PROCESS_REGISTRY:
        raise ValueError(
            f"Process '{record.process}' not registered. "
            f"Available: {sorted(_PROCESS_REGISTRY.keys())}"
        )

    module = _PROCESS_REGISTRY[process]()
    return module.calculate(record, conn)


def calculate_batch(
    records: list[ActivityRecord],
    conn: sqlite3.Connection,
    stop_on_error: bool = False,
) -> list:
    """Calculate a list of records. Returns EmissionResult or error dict per row."""
    results = []
    for record in records:
        try:
            results.append(calculate(record, conn))
        except Exception as e:
            if stop_on_error:
                raise
            results.append({
                "record_id": record.record_id,
                "error": str(e),
                "error_type": type(e).__name__,
            })
    return results
