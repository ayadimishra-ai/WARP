"""
sk.lite — Scope 3 Cat 1: Purchased Goods & Services.

Methods (all four variants from your Notion catalog):
  average_data:      mass × cradle-to-gate EF (kgCO2e/kg or per unit)
  spend_based_eeio:  $ spend × EEIO sector EF (kgCO2e/USD)
  supplier_specific: quantity × supplier-provided EF
  hybrid:            supplier S1+S2 + residual EF for remainder

Key constraint per GHG Protocol:
  EF must be cradle-to-gate boundary.
  Avoid double-counting Cat 4 upstream transport if included separately.

Cradle-to-gate average EFs (kgCO2e/kg, ecoinvent 3.9 / DEFRA 2024):
  steel:            2.89
  aluminium:        11.46
  recycled_steel:   0.73
  recycled_aluminium: 0.68
  copper:           4.14
  plastic_general:  3.14
  plastic_pet:      2.73
  glass:            0.85
  paper:            1.29
  cardboard:        0.79
  cement:           0.83
  concrete:         0.16
  wood_timber:      0.31
  electronics:      30.0   (per kg — high due to manufacturing)
  cotton:           5.89
  food_average:     2.5

Processes:
  'S3 Cat 1 — Purchased goods & services (average-data EF per mass/unit)'
  'S3 Cat 1 — Purchased goods & services (spend-based EEIO)'
  'S3 Cat 1 — Purchased goods & services (supplier-specific EF)'
  'S3 Cat 1 — Purchased goods & services (hybrid: supplier S1+S2 + materials + transport + waste)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, get_eeio_co2e, MissingEFError
from core.gwp import gwp_summary
from core.subroutines import sr_cur_01, sr_agg_01

_CRADLE_TO_GATE_EF: dict[str, float] = {
    # Metals
    "steel":              2.89,
    "steel_virgin":       2.89,
    "steel_recycled":     0.73,
    "aluminium":         11.46,
    "aluminium_virgin":  11.46,
    "aluminium_recycled": 0.68,
    "copper":             4.14,
    "iron":               2.50,
    "zinc":               4.31,
    "nickel":            13.30,
    "titanium":          34.50,
    # Plastics
    "plastic":            3.14,
    "plastic_general":    3.14,
    "plastic_pet":        2.73,
    "plastic_hdpe":       2.10,
    "plastic_pp":         1.95,
    "plastic_pvc":        2.41,
    # Construction
    "glass":              0.85,
    "cement":             0.83,
    "concrete":           0.16,
    "brick":              0.24,
    # Paper / packaging
    "paper":              1.29,
    "cardboard":          0.79,
    "packaging_average":  1.00,
    # Wood
    "wood":               0.31,
    "timber":             0.31,
    "mdf":                0.59,
    # Chemicals
    "chemicals_general":  2.0,
    "fertiliser_nitrogen":4.80,
    "solvent":            2.30,
    # Electronics / IT
    "electronics":        30.0,
    "server":            800.0,   # per unit (kg-equivalent)
    "laptop":            350.0,
    "smartphone":         70.0,
    # Textiles / food
    "cotton":             5.89,
    "wool":              26.0,
    "leather":           17.0,
    "food_average":       2.5,
    "beef":              27.0,
    "chicken":            6.9,
    "vegetables":         2.0,
    # Fuel (purchased for resale, Cat 3 upstream handled separately)
    "fuel_general":       3.2,
}

# BEA sector codes for common spend categories (USEEIO mapping)
_SPEND_SECTOR_MAP: dict[str, str] = {
    "it_services":      "541",   # Professional, scientific, and technical services
    "software":         "511",   # Publishing industries (software)
    "consulting":       "541",
    "legal":            "541",
    "marketing":        "541",
    "logistics":        "484",   # Truck transportation
    "freight":          "484",
    "food_catering":    "722",   # Food services and drinking places
    "office_supplies":  "322",   # Paper manufacturing
    "chemicals":        "325",   # Chemical manufacturing
    "machinery":        "333",   # Machinery manufacturing
    "electronics":      "334",   # Computer and electronic products
    "steel":            "331",   # Primary metal manufacturing
    "aluminium":        "331",
    "paper":            "322",   # Paper manufacturing
    "construction":     "23",    # Construction
    "utilities":        "22",    # Utilities
    "general":          "42",    # Wholesale trade
}


class Cat01PurchasedGoods(BaseModule):
    module_name = "other"
    PROCESS_AVG  = "S3 Cat 1 — Purchased goods & services (average-data EF per mass/unit)"
    PROCESS_EEIO = "S3 Cat 1 — Purchased goods & services (spend-based EEIO)"
    PROCESS_SUPP = "S3 Cat 1 — Purchased goods & services (supplier-specific EF)"
    PROCESS_HYB  = "S3 Cat 1 — Purchased goods & services (hybrid: supplier S1+S2 + materials + transport + waste)"

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

    # ── Average-data ─────────────────────────────────────────────────────

    def _average_data(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        item = (record.fuel_or_item or "general").lower().strip()

        # Mass conversion
        unit = record.unit.lower()
        mass_units = {"kg": 1.0, "t": 1000.0, "tonne": 1000.0, "kt": 1e6, "g": 0.001, "lb": 0.4536}
        if unit in mass_units:
            qty_kg = record.quantity * mass_units[unit]
            conv = [{"label": f"Convert {record.unit}→kg",
                     "value": f"{record.quantity} {record.unit} = {qty_kg:.4f} kg"}] if unit != "kg" else []
        else:
            qty_kg = record.quantity  # treat as kg or unit count
            conv = [{"label": f"Unit {record.unit} treated as kg or count",
                     "value": f"{qty_kg:.4f}"}]

        ef_val, ef_src, ef_fid, fallback_level, fallback_triggered = \
            self._get_avg_ef(conn, item, record.country)

        kg_co2e = qty_kg * ef_val
        steps = conv + [{
            "label": "Cradle-to-gate emissions",
            "value": f"{qty_kg:.4f} kg × {ef_val} kgCO₂e/kg = {kg_co2e:.4f} kgCO₂e",
            "note": f"Cradle-to-gate EF for {item} | {ef_src}",
        }]

        return self._make_result(record, steps, kg_co2e, gwp, gwp_info,
                                 ef_fid, ef_val, "kgCO₂e/kg", ef_src,
                                 fallback_level, fallback_triggered,
                                 "Cat 1 average-data. Mass × cradle-to-gate EF.")

    # ── Spend-based (EEIO) ───────────────────────────────────────────────

    def _spend_based(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        item = (record.fuel_or_item or "general").lower().strip()

        # Built-in FX rates to USD (approximate annual averages, updated periodically)
        _FX_TO_USD = {
            "USD": 1.0,
            "INR": 0.012,   # ~83 INR/USD
            "EUR": 1.08,    # ~0.93 EUR/USD
            "GBP": 1.27,    # ~0.79 GBP/USD
            "JPY": 0.0067,  # ~149 JPY/USD
            "CNY": 0.138,   # ~7.25 CNY/USD
            "SGD": 0.74,    # ~1.35 SGD/USD
            "AUD": 0.65,    # ~1.54 AUD/USD
            "CAD": 0.74,    # ~1.35 CAD/USD
        }
        unit_upper = (record.unit or "USD").upper()
        fx = record.extra.get("fx_to_usd",
              _FX_TO_USD.get(unit_upper, 1.0))
        spend_usd = sr_cur_01(record.quantity, fx)

        sector = _SPEND_SECTOR_MAP.get(item, "42")
        try:
            co2e_per_usd, _ = get_eeio_co2e(conn, sector, gwp_ar=gwp)
            ef_src = f"USEEIO v2 sector {sector}"
            ef_fid = f"USEEIO_{sector}_CO2e"
            fallback_level, fallback_triggered = "national", False
        except Exception:
            co2e_per_usd = 0.0005  # rough global average
            ef_src = "Global EEIO average (fallback)"
            ef_fid = "EEIO_GLOBAL_DEFAULT"
            fallback_level, fallback_triggered = "global", True

        kg_co2e = spend_usd * co2e_per_usd
        steps = [
            {"label": "Convert to USD", "value": f"{record.quantity} {record.unit} × {fx} = {spend_usd:.2f} USD"},
            {"label": "EEIO emissions",
             "value": f"{spend_usd:.2f} USD × {co2e_per_usd:.5f} kgCO₂e/USD = {kg_co2e:.4f} kgCO₂e",
             "note": f"Sector: {sector} | {ef_src}"},
        ]

        return self._make_result(record, steps, kg_co2e, gwp, gwp_info,
                                 ef_fid, co2e_per_usd, "kgCO₂e/USD", ef_src,
                                 fallback_level, fallback_triggered,
                                 "Cat 1 spend-based (EEIO). Spend × sector EF.")

    # ── Supplier-specific ────────────────────────────────────────────────

    def _supplier_specific(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        ef_val = record.supplier_ef_value
        if ef_val is None:
            # No supplier EF provided — fall back to average-data
            return self._average_data(record, conn)

        ef_unit = record.supplier_ef_unit or "kgCO₂e/kg"
        kg_co2e = record.quantity * ef_val
        steps = [{
            "label": "Supplier-specific emissions",
            "value": f"{record.quantity} {record.unit} × {ef_val} {ef_unit} = {kg_co2e:.4f} kgCO₂e",
            "note": "Cradle-to-gate supplier EF (highest priority — preferred method)",
        }]

        return self._make_result(record, steps, kg_co2e, gwp, gwp_info,
                                 "SUPPLIER_SPECIFIC", ef_val, ef_unit,
                                 record.extra.get("supplier_name", "Supplier"),
                                 "supplier", False,
                                 "Cat 1 supplier-specific. Quantity × supplier EF.")

    # ── Hybrid ───────────────────────────────────────────────────────────

    def _hybrid(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Hybrid: supplier S1+S2 (allocated) + residual average-data EF.
        extra must contain: supplier_s1s2_kg_co2e, residual_ef (optional).
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)

        supplier_s1s2 = record.extra.get("supplier_s1s2_kg_co2e", 0.0)
        supplier_waste = record.extra.get("supplier_waste_kg", 0.0)
        waste_ef = record.extra.get("waste_ef_kg_co2e_per_kg", 0.3)

        # Residual: quantity × residual EF (excl supplier S1+S2)
        item = (record.fuel_or_item or "general").lower()
        residual_ef_val, _, _, fl, ft = self._get_avg_ef(conn, item, record.country)
        # Residual EF should exclude supplier S1+S2 — use 50% as proxy
        residual_ef_adj = residual_ef_val * record.extra.get("residual_fraction", 0.5)
        residual_kg = record.quantity * residual_ef_adj

        waste_kg_co2e = supplier_waste * waste_ef
        total_kg_co2e = sr_agg_01([supplier_s1s2, waste_kg_co2e, residual_kg])

        steps = [
            {"label": "Supplier S1+S2 (allocated)", "value": f"{supplier_s1s2:.4f} kgCO₂e"},
            {"label": "Supplier waste", "value": f"{supplier_waste:.2f} kg × {waste_ef} = {waste_kg_co2e:.4f} kgCO₂e"},
            {"label": "Residual (excl. S1+S2)", "value": f"{record.quantity} × {residual_ef_adj:.4f} = {residual_kg:.4f} kgCO₂e"},
            {"label": "Total (hybrid)", "value": f"{total_kg_co2e:.4f} kgCO₂e"},
        ]

        return self._make_result(record, steps, total_kg_co2e, gwp, gwp_info,
                                 "HYBRID_CAT1", residual_ef_adj, "kgCO₂e/kg",
                                 "Hybrid: supplier S1+S2 + residual EF",
                                 fl, ft,
                                 "Cat 1 hybrid. Supplier allocated S1+S2 + residual EF.")

    def _make_result(self, record, steps, kg_co2e, gwp, gwp_info,
                     ef_fid, ef_val, ef_unit, ef_src, fl, ft, methodology):
        audit = {
            "inputs": {"quantity": record.quantity, "unit": record.unit,
                       "item": record.fuel_or_item, "country": record.country},
            "calculation": steps,
            "gwp": gwp_info,
            "result": {"kg_CO2e": round(kg_co2e, 4), "t_CO2e": round(kg_co2e/1000, 6)},
            "methodology": methodology,
        }
        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2e, 4), kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=ef_fid, ef_value_used=ef_val,
            ef_unit=ef_unit, ef_source=ef_src,
            fallback_level=fl, fallback_triggered=ft,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fl),
            audit_trace=audit,
        )

    def _get_avg_ef(self, conn, item, country):
        try:
            ef = get_ef(conn, "other", item, "CO2e", country)
            if "kg" in ef.unit_denominator:
                return (ef.value, ef.source, ef.factor_id, ef.fallback_level, ef.fallback_triggered)
        except MissingEFError:
            pass
        default = _CRADLE_TO_GATE_EF.get(item)
        if default is None:
            for key, val in _CRADLE_TO_GATE_EF.items():
                if item in key or key in item:
                    default = val
                    break
        if default is None:
            default = 2.0
        return (default, "ecoinvent 3.9 / DEFRA 2024 cradle-to-gate", f"CTG_{item.upper()[:20]}",
                "global", True)
