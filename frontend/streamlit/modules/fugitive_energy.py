"""
sk.lite — Scope 1 Fugitive Emissions (Energy).

IPCC 2006 Vol.2 Chapter 4 / Chapter 7.

Sub-processes:
  refrigerants -- HFC/PFC/SF6 leaks from HVAC, refrigeration, chillers
  oil_gas      -- methane fugitives from upstream O&G operations
  coal_mining  -- methane from coal mines

Refrigerant calculation:
  Method 1 (top-up/purchase): kg_refrigerant_purchased x GWP
  Method 2 (equipment-based): total_charge x annual_leak_rate x GWP

Key refrigerants and GWP (AR6):
  R-134a  (HFC-134a):  1526
  R-410A  (HFC blend): 2088   (60% R-32 + 40% R-125)
  R-32    (HFC-32):     771
  R-404A  (HFC blend): 3922   (44% R-125 + 52% R-143a + 4% R-134a)
  R-407C  (HFC blend): 1774
  R-22    (HCFC-22):   1760   (still used in India; phase-out ongoing)
  R-600a  (Isobutane):    4   (natural refrigerant)
  R-717   (Ammonia):      0   (natural refrigerant)
  R-744   (CO2):          1   (natural refrigerant)
  SF6:                25200
  HFC-23:            14600

Processes:
  'S1 -- Fugitive emissions (energy)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from core.gwp import GWP_TABLES, gwp_summary

# Refrigerant GWP100 (AR6) -- stored locally because these are not in standard GWP table
# Source: IPCC AR6 WGI Chapter 7 Supplementary Table 7.SM.7
_REFRIGERANT_GWP_AR6: dict[str, float] = {
    # Pure HFCs
    "HFC-23":     14600.0,
    "HFC-32":       771.0,
    "HFC-125":     3740.0,
    "HFC-134a":    1526.0,
    "HFC-143a":    5810.0,
    "HFC-152a":     164.0,
    "HFC-227ea":   3600.0,
    "HFC-245fa":    962.0,
    # HFC blends (approximate weighted average AR6)
    "R-410A":      2088.0,   # 50% R-32 + 50% R-125
    "R-404A":      3922.0,   # 44% R-125 + 52% R-143a + 4% R-134a
    "R-407C":      1774.0,   # 23% R-32 + 25% R-125 + 52% R-134a
    "R-507A":      3985.0,   # 50% R-125 + 50% R-143a
    "R-422D":      2729.0,
    "R-438A":      2265.0,
    # HCFCs (transitional -- still used in India)
    "R-22":        1760.0,   # HCFC-22 -- AR6 GWP
    "R-123":         89.0,   # HCFC-123
    # Natural refrigerants
    "R-600a":         4.0,   # Isobutane
    "R-290":          3,     # Propane (IPCC AR6 refrigerant GWP, industry standard)
    "R-717":          0.0,   # Ammonia
    "R-744":          1.0,   # CO2
    "R-1234yf":       1.0,   # HFO (next-gen low-GWP)
    "R-1234ze":       1.0,
    # Industrial gases
    "SF6":         25200.0,
    "NF3":         17400.0,
    "PFC-14":       7380.0,
    "PFC-116":     12400.0,
}

# Default annual leak rates by equipment type (fraction of total charge per year)
# Source: IPCC 2006 Vol.2 Table 7.7
_ANNUAL_LEAK_RATES: dict[str, float] = {
    "stationary_ac":         0.08,   # 8%/yr
    "chillers":              0.02,   # 2%/yr -- hermetic systems
    "industrial_refrigeration": 0.15,
    "commercial_refrigeration": 0.20,
    "residential_ac":        0.06,
    "heat_pump":             0.05,
    "transport_refrigeration": 0.25,
    "fire_suppression":      0.01,
    "sf6_switchgear":        0.005,  # 0.5%/yr
    "sf6_transformers":      0.01,
    "default":               0.10,
}


class FugitiveEnergy(BaseModule):
    module_name = "other"
    PROCESS = "S1 \u2014 Fugitive emissions (energy)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        if not record.fuel_or_item:
            errors.append(
                "fuel_or_item must specify refrigerant name "
                f"(e.g. 'R-410A', 'HFC-134a', 'SF6'). "
                f"Known: {list(_REFRIGERANT_GWP_AR6.keys())[:8]}..."
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        sub = record.extra.get("sub_type", "refrigerant").lower()
        if sub in ("oil_gas", "oil", "gas", "upstream"):
            return self._oil_gas_fugitive(record, conn)
        if sub in ("coal", "coal_mining", "mine"):
            return self._coal_fugitive(record, conn)
        return self._refrigerant(record, conn)

    # ------------------------------------------------------------------ #
    # Refrigerant leaks
    # ------------------------------------------------------------------ #

    def _refrigerant(self, record: ActivityRecord, conn) -> EmissionResult:
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        refrigerant = record.fuel_or_item.strip()

        # Get GWP for this refrigerant
        gwp_value = self._get_refrigerant_gwp(refrigerant, gwp)
        steps = []

        method = record.extra.get("method", "top_up")

        if method == "equipment_based":
            # Method 2: total_charge x leak_rate
            total_charge_kg = record.quantity
            equip_type = record.extra.get("equipment_type", "default")
            leak_rate = float(record.extra.get(
                "leak_rate",
                _ANNUAL_LEAK_RATES.get(equip_type, _ANNUAL_LEAK_RATES["default"])
            ))
            kg_leaked = total_charge_kg * leak_rate
            steps += [
                {"label": "Total refrigerant charge", "value": f"{total_charge_kg:.2f} kg"},
                {"label": "Annual leak rate",
                 "value": f"{leak_rate:.1%} (equipment type: {equip_type})"},
                {"label": "kg leaked/yr", "value": f"{kg_leaked:.4f} kg"},
            ]
            method_note = f"Equipment-based: {total_charge_kg} kg charge x {leak_rate:.1%} leak rate"
        else:
            # Method 1 (default): kg purchased/top-up = kg emitted
            kg_leaked = record.quantity
            steps.append({
                "label": "Refrigerant top-up / purchased",
                "value": f"{kg_leaked:.4f} kg {refrigerant}",
                "note": "Top-up method: kg purchased = kg emitted (most accurate)"
            })
            method_note = "Top-up method: refrigerant purchased assumed fully emitted"

        # GWP conversion
        kg_co2e = kg_leaked * gwp_value
        steps.append({
            "label": f"GWP conversion ({refrigerant})",
            "value": f"{kg_leaked:.4f} kg x {gwp_value} GWP = {kg_co2e:.4f} kgCO2e",
            "note": f"IPCC AR{gwp} GWP100",
        })

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=0.0, kg_CH4=0.0, kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used=f"REFRIGERANT_{refrigerant.replace('-','_')}",
            ef_value_used=gwp_value, ef_unit="kgCO2e/kg (GWP)",
            ef_source=f"IPCC AR{gwp} GWP100",
            fallback_level="global", fallback_triggered=False,
            calculation_engine="local", confidence="high",
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "refrigerant": refrigerant, "method": method},
                "calculation": steps, "gwp": gwp_info,
                "refrigerant_gwp": {refrigerant: gwp_value},
                "result": {"kg_leaked": round(kg_leaked, 4),
                           "kg_CO2e": round(kg_co2e, 4),
                           "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    f"S1 fugitive -- refrigerant leaks. {method_note}. "
                    f"Refrigerant: {refrigerant}, GWP(AR{gwp})={gwp_value}. "
                    "IPCC 2006 Vol.2 Ch.7 / IPCC AR6 Table 7.SM.7."
                ),
            },
        )

    # ------------------------------------------------------------------ #
    # Oil & gas fugitives
    # ------------------------------------------------------------------ #

    def _oil_gas_fugitive(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Methane fugitives from O&G operations.
        quantity = Nm3 of methane vented/leaked
        unit     = 'Nm3', 'm3', 'kg', or 'tonne'
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)

        # Convert to kg CH4
        unit = record.unit.lower()
        if unit in ("nm3", "m3"):
            # CH4 density at NTP: 0.717 kg/m3
            kg_ch4 = record.quantity * 0.717
            conv = [{"label": "Convert m3->kg CH4",
                     "value": f"{record.quantity} m3 x 0.717 kg/m3 = {kg_ch4:.4f} kg"}]
        elif unit in ("kg",):
            kg_ch4 = record.quantity
            conv = []
        elif unit in ("t", "tonne"):
            kg_ch4 = record.quantity * 1000
            conv = [{"label": "Convert t->kg", "value": f"{record.quantity} t = {kg_ch4:.2f} kg"}]
        else:
            kg_ch4 = record.quantity
            conv = [{"label": "Assumed kg CH4", "value": f"{kg_ch4:.4f} kg"}]

        from core.gwp import GWP_TABLES
        ch4_gwp = GWP_TABLES[gwp]["CH4_fossil"]
        kg_co2e = kg_ch4 * ch4_gwp

        steps = conv + [{
            "label": "Fugitive CH4 emissions",
            "value": f"{kg_ch4:.4f} kg CH4 x {ch4_gwp} GWP = {kg_co2e:.4f} kgCO2e",
        }]

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=0.0, kg_CH4=round(kg_ch4, 4), kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used="FUGITIVE_CH4_OIL_GAS",
            ef_value_used=ch4_gwp, ef_unit="kgCO2e/kgCH4 (GWP)",
            ef_source=f"IPCC AR{gwp} GWP100 CH4_fossil={ch4_gwp}",
            fallback_level="global", fallback_triggered=False,
            calculation_engine="local", confidence="medium",
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit},
                "calculation": steps, "gwp": gwp_info,
                "result": {"kg_CH4": round(kg_ch4, 4), "kg_CO2e": round(kg_co2e, 4)},
                "methodology": "S1 fugitive O&G. Methane vented/leaked x CH4 GWP. IPCC 2006 Vol.2 Ch.4.",
            },
        )

    # ------------------------------------------------------------------ #
    # Coal mining fugitives
    # ------------------------------------------------------------------ #

    def _coal_fugitive(self, record: ActivityRecord, conn) -> EmissionResult:
        """
        Methane from coal mines.
        quantity = tonnes of coal mined
        Default CH4 emission factor: 10 m3 CH4/tonne coal (IPCC 2006 Table 4.1.2 default)
        """
        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        ef_m3_per_tonne = float(record.extra.get("ch4_m3_per_tonne", 10.0))

        # Convert to kg coal
        unit = record.unit.lower()
        qty_t = record.quantity * {"kg": 0.001, "t": 1.0, "tonne": 1.0, "kt": 1000.0}.get(unit, 1.0)
        m3_ch4 = qty_t * ef_m3_per_tonne
        kg_ch4 = m3_ch4 * 0.717   # m3 to kg at NTP

        from core.gwp import GWP_TABLES
        ch4_gwp = GWP_TABLES[gwp]["CH4_fossil"]
        kg_co2e = kg_ch4 * ch4_gwp

        steps = [
            {"label": "Coal mined", "value": f"{qty_t:.2f} tonnes"},
            {"label": "CH4 factor", "value": f"{ef_m3_per_tonne} m3 CH4/tonne coal"},
            {"label": "CH4 volume", "value": f"{m3_ch4:.2f} m3"},
            {"label": "CH4 mass", "value": f"{m3_ch4:.2f} m3 x 0.717 = {kg_ch4:.4f} kg"},
            {"label": "CO2e", "value": f"{kg_ch4:.4f} kg x {ch4_gwp} = {kg_co2e:.4f} kgCO2e"},
        ]

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=0.0, kg_CH4=round(kg_ch4, 4), kg_N2O=0.0,
            kg_CO2e=round(kg_co2e, 4), gwp_ar_used=gwp,
            factor_id_used="FUGITIVE_CH4_COAL_MINING",
            ef_value_used=ef_m3_per_tonne, ef_unit="m3 CH4/tonne coal",
            ef_source="IPCC 2006 Vol.2 Table 4.1.2 default",
            fallback_level="global", fallback_triggered=True,
            calculation_engine="local", confidence="low",
            audit_trace={
                "inputs": {"tonnes_coal": round(qty_t, 2), "ef_m3_per_t": ef_m3_per_tonne},
                "calculation": steps, "gwp": gwp_info,
                "result": {"kg_CH4": round(kg_ch4, 4), "kg_CO2e": round(kg_co2e, 4)},
                "methodology": (
                    "S1 fugitive coal mining. Tonnes mined x default CH4 EF. "
                    "IPCC 2006 Vol.2 Ch.4 Table 4.1.2."
                ),
            },
        )

    def _get_refrigerant_gwp(self, refrigerant: str, gwp_ar: int) -> float:
        """Get GWP for a refrigerant. Tries AR6 table first, then standard GWP tables."""
        # Try AR6 refrigerant-specific table
        if gwp_ar == 6:
            val = _REFRIGERANT_GWP_AR6.get(refrigerant)
            if val is not None:
                return val
        # Try standard GWP tables (covers HFC-134a etc)
        try:
            from core.gwp import get_gwp
            return get_gwp(refrigerant, gwp_ar)
        except KeyError:
            pass
        # Last resort: 1500 (roughly average HFC blend)
        return 1500.0
