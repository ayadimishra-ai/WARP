"""
sk.lite — Scope 3 Cat 2: Capital Goods.

GHG Protocol definition:
  Emissions from production of capital goods purchased or acquired by the
  reporting company. Capital goods are long-lived products used by the
  company to manufacture products, provide services, or sell, store, and
  deliver merchandise.

Key difference from Cat 1:
  If a company uses a capital good for more than one year, some
  methodologies amortise the cradle-to-gate emissions over the asset
  lifetime. GHG Protocol allows either full attribution in year of
  purchase (recommended) OR amortisation -- but the choice must be
  documented and applied consistently.

  This module supports both via extra.amortise (bool) and
  extra.asset_lifetime_years (int, default 1 = full attribution).

Methods (identical structure to Cat 1):
  average_data      -- mass/unit x cradle-to-gate EF
  spend_based_eeio  -- $ spend x EEIO sector EF
  supplier_specific -- quantity x supplier EF
  hybrid            -- supplier S1+S2 + residual average-data EF

BEA sector defaults for capital goods spend (USEEIO 2019):
  machinery:          3332OM
  electronics:        3341
  vehicles:           336111
  construction:       23OC
  it_equipment:       3341
  furniture:          3370A
  lab_equipment:      3345
  general:            3332OM

Processes:
  'S3 Cat 2 — Capital goods (average-data per mass/unit)'
  'S3 Cat 2 — Capital goods (spend-based EEIO)'
  'S3 Cat 2 — Capital goods (supplier-specific EF)'
  'S3 Cat 2 — Capital goods (hybrid: supplier S1+S2 + materials + transport + waste)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, get_eeio_co2e, MissingEFError
from core.gwp import gwp_summary
from core.subroutines import sr_cur_01, sr_agg_01

# Cradle-to-gate EFs for capital goods (kgCO2e/kg)
# Sources: ecoinvent 3.9, DEFRA 2024, published LCA databases
_CAPEX_EF: dict[str, float] = {
    # Metals and structures
    "steel":                 2.89,
    "steel_virgin":          2.89,
    "steel_recycled":        0.73,
    "aluminium":            11.46,
    "aluminium_recycled":    0.68,
    "copper":                4.14,
    "stainless_steel":       5.10,
    "cast_iron":             1.51,
    # Machinery and equipment
    "machinery_general":     5.50,   # kgCO2e/kg -- average manufacturing equipment
    "electric_motor":        4.80,
    "pump":                  5.20,
    "compressor":            5.80,
    "boiler":                4.30,
    "turbine":               6.10,
    "hvac":                  5.40,
    # IT and electronics
    "server":              800.0,    # kgCO2e per unit (not per kg)
    "laptop":              350.0,
    "desktop_pc":          300.0,
    "smartphone":           70.0,
    "network_equipment":   150.0,
    "electronics_general":  30.0,   # kgCO2e/kg
    # Vehicles
    "car_ice":            6000.0,   # kgCO2e per vehicle
    "car_ev":             8500.0,   # higher manufacturing due to battery
    "truck_heavy":       30000.0,
    "forklift":          5000.0,
    # Construction / civil
    "concrete":              0.16,
    "cement":                0.83,
    "structural_steel":      2.89,
    "glass":                 0.85,
    "brick":                 0.24,
    "insulation":            3.10,
    # Other
    "solar_panel":           0.50,   # kgCO2e/W (peak) -- typical utility PV
    "wind_turbine":          0.01,   # kgCO2e/kWh (lifetime EF, amortised)
    "battery_liion":        12.50,   # kgCO2e/kg battery
    "general":               5.50,
}

# BEA sector codes for capital goods spend (USEEIO)
_CAPEX_SECTOR_MAP: dict[str, str] = {
    "machinery":      "333",   # Machinery manufacturing (USEEIO summary)
    "electronics":    "334",   # Computer and electronic product manufacturing
    "it_equipment":   "334",
    "vehicles":       "336",   # Transportation equipment manufacturing
    "trucks":         "336",
    "construction":   "23",    # Construction
    "furniture":      "337",   # Furniture and related product manufacturing
    "lab_equipment":  "334",
    "software":       "511",   # Publishing industries (software)
    "general":        "333",
}

_MASS_UNITS = {"kg": 1.0, "t": 1000.0, "tonne": 1000.0, "kt": 1e6, "g": 0.001, "lb": 0.4536}


class Cat02CapitalGoods(BaseModule):
    module_name = "other"
    PROCESS_AVG  = "S3 Cat 2 — Capital goods (average-data per mass/unit)"
    PROCESS_EEIO = "S3 Cat 2 — Capital goods (spend-based EEIO)"
    PROCESS_SUPP = "S3 Cat 2 — Capital goods (supplier-specific EF)"
    PROCESS_HYB  = "S3 Cat 2 — Capital goods (hybrid: supplier S1+S2 + materials + transport + waste)"

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
        if "spend" in method.lower() or "eeio" in method.lower():
            return self._spend_based(record, conn)
        if "supplier" in method.lower() and "hybrid" not in method.lower():
            return self._supplier_specific(record, conn)
        if "hybrid" in method.lower():
            return self._hybrid(record, conn)
        return self._average_data(record, conn)

    # ------------------------------------------------------------------ #

    def _average_data(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        item = (record.fuel_or_item or "general").lower().strip()

        # Convert to kg if mass unit, otherwise treat as unit count
        unit = record.unit.lower()
        if unit in _MASS_UNITS:
            qty_kg = record.quantity * _MASS_UNITS[unit]
            conv = [] if unit == "kg" else [{"label": f"Convert {record.unit}->kg",
                "value": f"{record.quantity} {record.unit} = {qty_kg:.4f} kg"}]
        else:
            qty_kg = record.quantity          # treat as unit count (servers, vehicles)
            conv = [{"label": f"Unit count ({record.unit})",
                     "value": f"{qty_kg:.2f} units"}]

        ef_val, ef_src, ef_fid, fl, ft = self._get_ef(conn, item, record.country)
        kg_co2e_gross = qty_kg * ef_val

        # Amortisation (optional -- GHG Protocol allows but does NOT require)
        amortise = record.extra.get("amortise", False)
        lifetime = record.extra.get("asset_lifetime_years", 1)
        if amortise and lifetime > 1:
            kg_co2e = kg_co2e_gross / lifetime
            amort_note = f"Amortised over {lifetime} years: {kg_co2e_gross:.2f} / {lifetime} = {kg_co2e:.4f} kgCO2e/year"
        else:
            kg_co2e = kg_co2e_gross
            amort_note = "Full attribution in year of acquisition (GHG Protocol recommended approach)"

        steps = conv + [
            {"label": "Cradle-to-gate emissions",
             "value": f"{qty_kg:.4f} unit/kg x {ef_val} kgCO2e = {kg_co2e_gross:.4f} kgCO2e",
             "note": ef_src},
        ]
        if amortise and lifetime > 1:
            steps.append({"label": "Amortisation", "value": amort_note})

        return self._build_result(record, steps, kg_co2e, gwp, gwp_info,
                                  ef_fid, ef_val, "kgCO2e/unit", ef_src, fl, ft,
                                  "Cat 2 average-data. Cradle-to-gate EF x mass/unit. "
                                  + amort_note)

    def _spend_based(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        item = (record.fuel_or_item or "general").lower().strip()
        _FX_TO_USD = {
            "USD": 1.0, "INR": 0.012, "EUR": 1.08, "GBP": 1.27,
            "JPY": 0.0067, "CNY": 0.138, "SGD": 0.74, "AUD": 0.65, "CAD": 0.74,
        }
        unit_upper = (record.unit or "USD").upper()
        fx = record.extra.get("fx_to_usd", _FX_TO_USD.get(unit_upper, 1.0))
        spend_usd = sr_cur_01(record.quantity, fx)

        sector = _CAPEX_SECTOR_MAP.get(item, "333")
        try:
            co2e_per_usd, _ = get_eeio_co2e(conn, sector, gwp_ar=gwp)
            ef_src = f"USEEIO v2 sector {sector}"
            ef_fid = f"USEEIO_{sector}_CO2e"
            fl, ft = "national", False
        except Exception:
            co2e_per_usd = 0.00052
            ef_src = "Global capital goods average (fallback)"
            ef_fid = "CAPEX_GLOBAL_DEFAULT"
            fl, ft = "global", True

        kg_co2e = spend_usd * co2e_per_usd
        steps = [
            {"label": "Convert to USD",
             "value": f"{record.quantity} {record.unit} x {fx} = {spend_usd:.2f} USD"},
            {"label": "EEIO emissions",
             "value": f"{spend_usd:.2f} USD x {co2e_per_usd:.5f} kgCO2e/USD = {kg_co2e:.4f} kgCO2e",
             "note": f"Sector: {sector}"},
        ]
        return self._build_result(record, steps, kg_co2e, gwp, gwp_info,
                                  ef_fid, co2e_per_usd, "kgCO2e/USD", ef_src, fl, ft,
                                  "Cat 2 spend-based (EEIO). Capital goods spend x sector EF.")

    def _supplier_specific(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        ef_val = record.supplier_ef_value
        if ef_val is None:
            return self._average_data(record, conn)
        ef_unit = record.supplier_ef_unit or "kgCO2e/unit"
        kg_co2e = record.quantity * ef_val
        steps = [{"label": "Supplier EF",
                  "value": f"{record.quantity} {record.unit} x {ef_val} {ef_unit} = {kg_co2e:.4f} kgCO2e"}]
        return self._build_result(record, steps, kg_co2e, gwp, gwp_info,
                                  "SUPPLIER_SPECIFIC", ef_val, ef_unit,
                                  record.extra.get("supplier_name", "Supplier"),
                                  "supplier", False,
                                  "Cat 2 supplier-specific. Cradle-to-gate EF from supplier.")

    def _hybrid(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        supplier_s1s2 = record.extra.get("supplier_s1s2_kg_co2e", 0.0)
        item = (record.fuel_or_item or "general").lower()
        residual_ef, _, _, fl, ft = self._get_ef(conn, item, record.country)
        residual_ef_adj = residual_ef * record.extra.get("residual_fraction", 0.5)
        residual_kg = record.quantity * residual_ef_adj
        total = sr_agg_01([supplier_s1s2, residual_kg])
        steps = [
            {"label": "Supplier S1+S2", "value": f"{supplier_s1s2:.4f} kgCO2e"},
            {"label": "Residual EF",
             "value": f"{record.quantity} x {residual_ef_adj:.4f} = {residual_kg:.4f} kgCO2e"},
            {"label": "Total", "value": f"{total:.4f} kgCO2e"},
        ]
        return self._build_result(record, steps, total, gwp, gwp_info,
                                  "HYBRID_CAT2", residual_ef_adj, "kgCO2e/unit",
                                  "Hybrid supplier+residual", fl, ft,
                                  "Cat 2 hybrid. Supplier allocated S1+S2 + residual EF.")

    def _get_ef(self, conn, item, country):
        try:
            ef = get_ef(conn, "other", item, "CO2e", country)
            if "kg" in (ef.unit_denominator or "").lower() or ef.unit_denominator in ("unit",""):
                return (ef.value, ef.source, ef.factor_id, ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        default = _CAPEX_EF.get(item)
        if default is None:
            for k, v in _CAPEX_EF.items():
                if item in k or k in item:
                    default = v
                    break
        if default is None:
            default = 5.50
        return (default, "ecoinvent 3.9 / industry LCA database", f"CAPEX_{item.upper()[:20]}",
                "global", True)

    def _build_result(self, record, steps, kg_co2e, gwp, gwp_info,
                      ef_fid, ef_val, ef_unit, ef_src, fl, ft, methodology):
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit=ef_unit, ef_source=ef_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "item": record.fuel_or_item, "country": record.country,
                           "amortise": record.extra.get("amortise", False),
                           "lifetime_years": record.extra.get("asset_lifetime_years", 1)},
                "calculation": steps, "gwp": gwp_info,
                "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": methodology,
            },
        )
