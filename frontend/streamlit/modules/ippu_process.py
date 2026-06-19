"""
sk.lite — IPPU: Industrial Processes and Product Use (Scope 1).

IPCC 2006 Guidelines Vol.3: Industrial Processes and Product Use.
GHG Protocol: these are Scope 1 process emissions (not from energy combustion).

Covered processes:
  cement_clinker    -- CO2 from calcination of limestone (CaCO3 -> CaO + CO2)
  lime              -- CO2 from calcination (dolomitic or high-calcium)
  glass             -- CO2 from carbonates in raw material mix
  steel_eaf         -- CO2 from electrode consumption in electric arc furnace
  steel_bof         -- CO2 from coke/carbon input in basic oxygen furnace
  ammonia           -- CO2 from steam methane reforming (catalytic)
  nitric_acid       -- N2O from catalytic oxidation of ammonia
  soda_ash          -- CO2 from Solvay process
  ceramics          -- CO2 from carbonate decomposition
  aluminium         -- PFC emissions (CF4, C2F6) from anode effects

Default emission factors (IPCC 2006 Vol.3 Table defaults):
  cement_clinker:    0.5244 tCO2/t clinker    (Table 2.2)
  lime_high_calcium: 0.7848 tCO2/t lime       (Table 2.6)
  lime_dolomitic:    0.9134 tCO2/t lime       (Table 2.6)
  glass:             0.200  tCO2/t glass      (Table 3.5)
  steel_eaf:         0.0440 tCO2/t steel      (electrode EF, Table 4.3)
  ammonia:           1.694  tCO2/t NH3        (Table 3.1)
  nitric_acid:       0.007  tN2O/t HNO3       (Table 3.11)
  soda_ash_solvay:   0.4150 tCO2/t Na2CO3     (Table 3.1)

Process: 'IPPU -- Cement (process CO2)'
"""
from __future__ import annotations
import sqlite3

from modules.base import ActivityRecord, EmissionResult, BaseModule, ValidationError
from ef_store.selector import get_ef, MissingEFError
from core.gwp import gwp_summary, GWP_TABLES

# IPCC 2006 Vol.3 default process EFs
_PROCESS_EF: dict[str, dict] = {
    # Cement
    "cement_clinker":      {"ef": 0.5244, "unit": "tCO2/t_clinker",   "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 2.2"},
    "cement":              {"ef": 0.5244, "unit": "tCO2/t_clinker",   "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 2.2"},
    # Lime
    "lime_high_calcium":   {"ef": 0.7848, "unit": "tCO2/t_lime",      "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 2.6"},
    "lime_dolomitic":      {"ef": 0.9134, "unit": "tCO2/t_lime",      "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 2.6"},
    "lime":                {"ef": 0.7848, "unit": "tCO2/t_lime",      "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 2.6"},
    # Glass
    "glass":               {"ef": 0.200,  "unit": "tCO2/t_glass",     "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.5"},
    "flat_glass":          {"ef": 0.210,  "unit": "tCO2/t_glass",     "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.5"},
    "container_glass":     {"ef": 0.170,  "unit": "tCO2/t_glass",     "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.5"},
    # Iron and steel
    "steel_eaf":           {"ef": 0.0440, "unit": "tCO2/t_steel",     "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 4.3 (electrode consumption)"},
    "steel_bof":           {"ef": 0.0460, "unit": "tCO2/t_steel",     "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 4.2 (carbon input)"},
    "iron_sintering":      {"ef": 0.0300, "unit": "tCO2/t_sinter",    "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 4.1"},
    # Chemicals
    "ammonia":             {"ef": 1.6940, "unit": "tCO2/t_NH3",       "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.1"},
    "nitric_acid":         {"ef": 0.0070, "unit": "tN2O/t_HNO3",      "gas": "N2O",
                            "ipcc_ref": "Vol.3 Table 3.11"},
    "adipic_acid":         {"ef": 0.3000, "unit": "tN2O/t_AA",        "gas": "N2O",
                            "ipcc_ref": "Vol.3 Table 3.13"},
    "soda_ash":            {"ef": 0.4150, "unit": "tCO2/t_Na2CO3",    "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.1"},
    "methanol":            {"ef": 0.6710, "unit": "tCO2/t_methanol",  "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.1"},
    # Ceramics
    "ceramics":            {"ef": 0.0800, "unit": "tCO2/t_product",   "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.7"},
    "bricks":              {"ef": 0.0400, "unit": "tCO2/t_product",   "gas": "CO2",
                            "ipcc_ref": "Vol.3 Table 3.7"},
    # Aluminium (PFCs from anode effects)
    "aluminium_cf4":       {"ef": 0.0900, "unit": "tCF4/t_Al",        "gas": "CF4",
                            "ipcc_ref": "Vol.3 Table 4.16"},
    "aluminium_c2f6":      {"ef": 0.0100, "unit": "tC2F6/t_Al",       "gas": "C2F6",
                            "ipcc_ref": "Vol.3 Table 4.16"},
}

# GWP for gases not in main table (CF4, C2F6)
_EXTRA_GWP: dict[str, dict[int, float]] = {
    "CF4":   {4: 7390.0, 5: 6630.0, 6: 7380.0},
    "C2F6":  {4: 12200.0, 5: 11100.0, 6: 12400.0},
}

_MASS_UNITS = {"kg": 0.001, "t": 1.0, "tonne": 1.0, "tonnes": 1.0,
               "kt": 1000.0, "Mt": 1e6}


class IPPUProcess(BaseModule):
    module_name = "other"
    PROCESS = "IPPU \u2014 Cement (process CO2)"   # primary registered name

    # Additional process names for other industries
    PROCESS_LIME  = "IPPU \u2014 Lime (process CO2)"
    PROCESS_STEEL = "IPPU \u2014 Steel (process CO2)"
    PROCESS_CHEM  = "IPPU \u2014 Chemicals (process emissions)"
    PROCESS_GLASS = "IPPU \u2014 Glass (process CO2)"

    def validate(self, record: ActivityRecord) -> list[str]:
        errors = []
        if record.quantity <= 0:
            errors.append("quantity must be > 0")
        if not record.fuel_or_item:
            errors.append(
                "fuel_or_item must specify the industrial process "
                f"(e.g. 'cement_clinker', 'lime', 'steel_eaf', 'ammonia'). "
                f"Known: {list(_PROCESS_EF.keys())[:8]}..."
            )
        return errors

    def calculate(self, record: ActivityRecord, conn: sqlite3.Connection) -> EmissionResult:
        errors = self.validate(record)
        if errors:
            raise ValidationError(errors)

        gwp = record.gwp_ar
        gwp_info = gwp_summary(gwp)
        process_key = (record.fuel_or_item or "cement").lower().strip()

        # Try DB first (IPCC EFDB has some process EFs seeded from EFDB_india.csv)
        db_ef = None
        try:
            ef_row = get_ef(conn, "ippu_process", process_key, "CO2",
                            record.country)
            db_ef = ef_row
        except MissingEFError:
            pass

        # Get process EF data
        ef_data = _PROCESS_EF.get(process_key)
        if ef_data is None:
            # Try partial match
            for k, v in _PROCESS_EF.items():
                if process_key in k or k in process_key:
                    ef_data = v
                    break
        if ef_data is None:
            ef_data = _PROCESS_EF["cement_clinker"]  # safe default

        gas = ef_data["gas"]
        ef_val = db_ef.value if db_ef else ef_data["ef"]
        ef_unit = ef_data["unit"]
        ef_src = db_ef.source if db_ef else f"IPCC 2006 {ef_data['ipcc_ref']}"
        fallback_level = db_ef.fallback_level if db_ef else "global"
        fallback_triggered = db_ef.fallback_triggered if db_ef else True

        # Convert quantity to tonnes
        unit = record.unit.lower()
        qty_t = record.quantity * _MASS_UNITS.get(unit, 1.0)
        conv_steps = [] if unit in ("t", "tonne", "tonnes") else [
            {"label": f"Convert {record.unit}->tonnes",
             "value": f"{record.quantity} {record.unit} = {qty_t:.4f} t"}
        ]

        # Calculate raw gas emissions (in tonnes of gas)
        t_gas = qty_t * ef_val

        # Convert to kg CO2e
        # ef_val may be in tGas/tProduct (hardcoded) or kgGas/tProduct (from DB)
        # Detect from db_ef unit_numerator if available
        ef_in_kg = False
        if db_ef:
            num = (db_ef.unit_numerator or "").lower()
            if num.startswith("kg"):
                ef_in_kg = True   # DB EF is kgGas/tProduct -> t_gas is already in kg

        if ef_in_kg:
            # DB EF: kgGas/tProduct -> multiply gives kg directly
            kg_gas = qty_t * ef_val
        else:
            # Hardcoded EF: tGas/tProduct -> multiply gives tonnes -> convert to kg
            kg_gas = qty_t * ef_val * 1000.0

        if gas == "CO2":
            kg_co2 = kg_gas
            kg_ch4 = 0.0
            kg_n2o = 0.0
            kg_co2e = kg_co2
        elif gas == "N2O":
            kg_co2 = 0.0
            kg_ch4 = 0.0
            kg_n2o = kg_gas
            n2o_gwp = GWP_TABLES[gwp]["N2O"]
            kg_co2e = kg_n2o * n2o_gwp
        elif gas in _EXTRA_GWP:
            gwp_val = _EXTRA_GWP[gas].get(gwp, _EXTRA_GWP[gas][6])
            kg_co2 = 0.0; kg_ch4 = 0.0; kg_n2o = 0.0
            kg_co2e = kg_gas * gwp_val
        else:
            kg_co2 = kg_gas
            kg_ch4 = 0.0; kg_n2o = 0.0
            kg_co2e = kg_co2

        calc_steps = conv_steps + [
            {"label": f"Process {gas} emissions",
             "value": f"{qty_t:.4f} t x {ef_val} {ef_unit} = {t_gas:.6f} t {gas}",
             "note": ef_src},
            {"label": "kgCO2e",
             "value": f"{kg_co2e:.4f} kgCO2e ({kg_co2e/1000:.6f} tCO2e)"},
        ]

        return EmissionResult(
            record_id=record.record_id,
            kg_CO2=round(kg_co2, 4),
            kg_CH4=round(kg_ch4, 4),
            kg_N2O=round(kg_n2o, 4),
            kg_CO2e=round(kg_co2e, 4),
            gwp_ar_used=gwp,
            factor_id_used=(db_ef.factor_id if db_ef
                            else f"IPCC2006_IPPU_{process_key.upper()[:20]}"),
            ef_value_used=ef_val,
            ef_unit=ef_unit,
            ef_source=ef_src,
            fallback_level=fallback_level,
            fallback_triggered=fallback_triggered,
            calculation_engine="local",
            confidence=self._confidence_from_fallback(fallback_level),
            audit_trace={
                "inputs": {"quantity": record.quantity, "unit": record.unit,
                           "process": process_key, "country": record.country},
                "conversions": conv_steps,
                "ef_lookup": {"factor_id": (db_ef.factor_id if db_ef
                                            else f"IPCC2006_{process_key}"),
                              "value": f"{ef_val} {ef_unit}",
                              "gas": gas, "source": ef_src},
                "calculation": calc_steps,
                "gwp": gwp_info,
                "result": {"kg_CO2": round(kg_co2, 4), "kg_N2O": round(kg_n2o, 6),
                           "kg_CO2e": round(kg_co2e, 4),
                           "t_CO2e": round(kg_co2e/1000, 6)},
                "methodology": (
                    f"IPPU process emissions. Process: {process_key}. "
                    f"Gas: {gas}. EF: {ef_val} {ef_unit}. "
                    f"Source: {ef_src}. "
                    "IPCC 2006 Vol.3 Industrial Processes and Product Use."
                ),
            },
        )
