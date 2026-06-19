"""
sk.lite — GWP100 tables for IPCC AR4, AR5, and AR6.

Sources:
  AR4: IPCC Fourth Assessment Report (2007), Table 2.14
  AR5: IPCC Fifth Assessment Report (2013), Table 8.7
  AR6: IPCC Sixth Assessment Report (2021), Table 7.SM.7

GWP values are 100-year time horizon (GWP100).
CH4 values here are for fossil CH4 (thermogenic).
For biogenic CH4, use CH4_biogenic values — same numerically but tracked separately
per GHG Protocol guidance.

Usage:
    from core.gwp import to_co2e, rollup_co2e, GWP_TABLES
    co2e = to_co2e(kg_ch4=5.2, gas='CH4_fossil', gwp_ar=6)
"""

from __future__ import annotations

GWP_TABLES: dict[int, dict[str, float]] = {
    4: {
        # IPCC AR4 (2007) — still used in some legacy regulatory submissions
        "CO2": 1.0,
        "CH4_fossil": 25.0,
        "CH4_biogenic": 25.0,
        "N2O": 298.0,
        "HFC-23": 14800.0,
        "HFC-32": 675.0,
        "HFC-125": 3500.0,
        "HFC-134a": 1430.0,
        "HFC-143a": 4470.0,
        "HFC-152a": 124.0,
        "HFC-227ea": 3220.0,
        "HFC-236fa": 9810.0,
        "HFC-245fa": 1030.0,
        "PFC-14": 7390.0,
        "PFC-116": 12200.0,
        "SF6": 22800.0,
        "NF3": 17200.0,
    },
    5: {
        # IPCC AR5 (2013) — required by many current regulatory frameworks
        "CO2": 1.0,
        "CH4_fossil": 28.0,      # includes climate-carbon feedbacks
        "CH4_biogenic": 28.0,
        "N2O": 265.0,
        "HFC-23": 12400.0,
        "HFC-32": 677.0,
        "HFC-125": 3170.0,
        "HFC-134a": 1300.0,
        "HFC-143a": 4800.0,
        "HFC-152a": 138.0,
        "HFC-227ea": 3350.0,
        "HFC-236fa": 8060.0,
        "HFC-245fa": 858.0,
        "PFC-14": 6630.0,
        "PFC-116": 11100.0,
        "SF6": 23500.0,
        "NF3": 16100.0,
    },
    6: {
        # IPCC AR6 (2021) — current default for GHG Protocol Corporate Standard
        "CO2": 1.0,
        "CH4_fossil": 27.9,
        "CH4_biogenic": 27.9,
        "N2O": 273.0,
        "HFC-23": 14600.0,
        "HFC-32": 771.0,
        "HFC-125": 3740.0,
        "HFC-134a": 1526.0,
        "HFC-143a": 5810.0,
        "HFC-152a": 164.0,
        "HFC-227ea": 3600.0,
        "HFC-236fa": 8690.0,
        "HFC-245fa": 962.0,
        "PFC-14": 7380.0,
        "PFC-116": 12400.0,
        "SF6": 25200.0,
        "NF3": 17400.0,
    },
}

# Gas name normalisation — maps common aliases to canonical keys
_GAS_ALIASES: dict[str, str] = {
    "CO2": "CO2",
    "carbon dioxide": "CO2",
    "CH4": "CH4_fossil",
    "methane": "CH4_fossil",
    "CH4_fossil": "CH4_fossil",
    "CH4_biogenic": "CH4_biogenic",
    "N2O": "N2O",
    "nitrous oxide": "N2O",
    "HFC134a": "HFC-134a",
    "HFC-134a": "HFC-134a",
    "R134a": "HFC-134a",
    "SF6": "SF6",
    "sulphur hexafluoride": "SF6",
    "sulfur hexafluoride": "SF6",
    "NF3": "NF3",
}


def normalise_gas(gas: str) -> str:
    """Normalise gas name to canonical GWP table key."""
    key = _GAS_ALIASES.get(gas, gas)
    return key


def get_gwp(gas: str, gwp_ar: int) -> float:
    """
    Return GWP100 value for a gas at a given AR vintage.

    Args:
        gas:    gas name (e.g. 'CH4_fossil', 'N2O', 'HFC-134a')
        gwp_ar: 4, 5, or 6

    Returns:
        GWP100 value (dimensionless)

    Raises:
        KeyError: if AR or gas not found
    """
    if gwp_ar not in GWP_TABLES:
        raise KeyError(f"GWP AR{gwp_ar} not available. Choose 4, 5, or 6.")
    canonical = normalise_gas(gas)
    table = GWP_TABLES[gwp_ar]
    if canonical not in table:
        raise KeyError(
            f"Gas '{gas}' (→ '{canonical}') not in GWP AR{gwp_ar} table. "
            f"Available: {list(table.keys())}"
        )
    return table[canonical]


def to_co2e(kg_gas: float, gas: str, gwp_ar: int) -> float:
    """
    Convert kg of a gas to kg CO2e.

    Args:
        kg_gas: mass of gas in kg
        gas:    gas name
        gwp_ar: IPCC AR vintage

    Returns:
        kg CO2e
    """
    return kg_gas * get_gwp(gas, gwp_ar)


def rollup_co2e(
    kg_co2: float,
    kg_ch4: float,
    kg_n2o: float,
    gwp_ar: int,
    ch4_type: str = "CH4_fossil",
    additional_gases: dict[str, float] | None = None,
) -> float:
    """
    Sum CO2, CH4, N2O (and any additional gases) into total kg CO2e.

    Args:
        kg_co2:           kg CO2 (not biogenic)
        kg_ch4:           kg CH4
        kg_n2o:           kg N2O
        gwp_ar:           IPCC AR vintage
        ch4_type:         'CH4_fossil' or 'CH4_biogenic'
        additional_gases: {gas_name: kg_gas} for refrigerants, SF6, etc.

    Returns:
        total kg CO2e
    """
    table = GWP_TABLES[gwp_ar]
    total = (
        kg_co2 * table["CO2"]
        + kg_ch4 * table[ch4_type]
        + kg_n2o * table["N2O"]
    )
    if additional_gases:
        for gas, kg in additional_gases.items():
            total += to_co2e(kg, gas, gwp_ar)
    return total


def gwp_summary(gwp_ar: int) -> dict:
    """Return the three primary GWPs for a given AR (used in audit traces)."""
    t = GWP_TABLES[gwp_ar]
    return {
        "ar": gwp_ar,
        "CO2": t["CO2"],
        "CH4_fossil": t["CH4_fossil"],
        "N2O": t["N2O"],
        "source": f"IPCC AR{gwp_ar} GWP100",
    }
