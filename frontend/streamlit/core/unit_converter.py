"""
sk.lite — Unit Converter.

Converts any activity unit to the canonical unit required by calculation modules:
  - Stationary/mobile combustion → TJ
  - Electricity → kWh
  - Transport → tonne-km
  - Spend → USD (via subroutines.sr_cur_01)
  - Mass → kg (for material-based calculations)

Reads NCV and density from the conversion_constants SQLite table.
Falls back to hardcoded IPCC 2019 Refinement defaults if DB lookup fails.
"""

from __future__ import annotations
import sqlite3
from typing import Optional


# ---------------------------------------------------------------------------
# Hardcoded IPCC 2019 Refinement defaults (fallback if DB not seeded)
# NCV in TJ/Gg (= TJ per 1000 tonnes = MJ/kg)
# ---------------------------------------------------------------------------

_NCV_DEFAULTS_TJ_PER_GG: dict[str, float] = {
    # Key matches fuel_item in emission_factors and conversion_constants tables
    "natural_gas":            48.0,
    "diesel_oil":             43.0,
    "motor_gasoline":         44.3,
    "other_bituminous_coal":  25.8,
    "coal_bituminous":        25.8,
    "coal_anthracite":        26.7,
    "coking_coal":            28.2,
    "non_coking_coal":        19.63,  # India-specific from your seed
    "sub_bituminous_coal":    18.9,
    "lignite":                11.9,
    "fuel_oil":               40.4,
    "lpg":                    47.3,
    "kerosene":               44.1,
    "jet_fuel":               44.1,
    "wood":                   15.6,
    "biodiesel":              27.0,
    "biogas":                 50.4,
    "peat":                    9.76,
    "natural_gas_liquids":    44.2,
    "crude_oil":              42.3,
}

_DENSITY_DEFAULTS_KG_PER_L: dict[str, float] = {
    # Liquids (kg/L at 15°C)
    "diesel_oil":      0.832,   # IPCC 2006 Table 1.2
    "diesel":          0.832,   # alias — same value, overrides legacy 0.845
    "motor_gasoline":  0.740,   # IPCC 2006
    "petrol":          0.740,   # alias
    "fuel_oil":        0.950,   # IPCC 2006 heavy fuel oil
    "kerosene":        0.800,   # ASTM D3699
    "jet_fuel":        0.800,   # ASTM D1655 Jet A/A-1 (range 0.775–0.840)
    "atf":             0.800,   # alias: Aviation Turbine Fuel
    "aviation_fuel":   0.800,   # alias
    "lpg":             0.550,   # IPCC 2006
    "biodiesel":       0.880,   # ASTM D6751
    "crude_oil":       0.850,   # API 40° typical India crude
    # Gaseous fuels stored as compressed liquids (per litre of gas at STP)
    # natural_gas / CNG: 0.717 kg/m³ at STP → per litre = 0.000717 kg/L
    # But for m³ inputs we use the _GAS_DENSITY_KG_PER_M3 table instead (below)
}

# Density of gaseous fuels at STP (15°C, 1 atm) — kg per cubic metre
# Used when unit is m3, scm, Nm3, mmscm, etc.
_GAS_DENSITY_KG_PER_M3: dict[str, float] = {
    "natural_gas":  0.717,   # ISO 13443: 0.717 kg/m³ at 15°C, 1 atm
    "cng":          0.717,   # compressed natural gas — same composition
    "png":          0.717,   # piped natural gas
    "gas":          0.717,   # generic alias
    "biogas":       1.150,   # 60% CH4 / 40% CO2 mix at STP
    "lpg":          2.010,   # propane/butane mix at STP (vapour density)
    "hydrogen":     0.090,   # H2 at STP
}

# Volume unit multipliers to m³ (cubic metres)
# gas volumes are normalised to SCM (= m³ at STP)
_GAS_VOLUME_TO_M3: dict[str, float] = {
    "m3":       1.0,
    "m³":       1.0,
    "scm":      1.0,        # standard cubic metre (India standard)
    "nm3":      1.0,        # normal cubic metre (same at STP)
    "Nm3":      1.0,
    "SCM":      1.0,
    "mcm":      1_000.0,    # thousand cubic metres
    "mmscm":    1_000_000.0,  # million standard cubic metres (bulk gas)
    "MMSCM":    1_000_000.0,
    "bcm":      1_000_000_000.0,  # billion cubic metres (pipeline)
}

# Energy unit conversions to TJ
_ENERGY_TO_TJ: dict[str, float] = {
    # SI and IEC
    "TJ":    1.0,
    "GJ":    1e-3,
    "MJ":    1e-6,
    "kJ":    1e-9,
    "J":     1e-12,
    # Electricity
    "MWh":   3.6e-3,
    "kWh":   3.6e-6,
    "Wh":    3.6e-9,
    "GWh":   3.6,
    "TWh":   3_600.0,
    # Traditional / commercial
    "toe":   41.868e-3,      # tonne of oil equivalent (IEA)
    "ktoe":  41.868,         # kilotonne of oil equivalent
    "Mtoe":  41_868.0,
    # US/LNG trade units
    "MMBtu": 1.055056e-3,    # million British thermal units (exact)
    "MMBTU": 1.055056e-3,    # alias (caps variant)
    "MBtu":  1.055056e-6,    # thousand BTU
    "BTU":   1.055056e-9,    # single BTU
    "btu":   1.055056e-9,
    "Mcf":   1.055056,       # thousand cubic feet natural gas (US)
    "MMcf":  1_055.056,      # million cubic feet
    "therm": 1.05505585e-4,  # UK/US therm = 100,000 BTU
    # Indian thermal units
    "kcal":  4.18600e-9,     # kilocalorie (India coal/gas lab reports)
    "kCal":  4.18600e-9,     # alias (mixed caps)
    "Kcal":  4.18600e-9,
    "Mcal":  4.18600e-6,     # megacalorie (some India gas contracts)
    "Gcal":  4.18600e-3,     # gigacalorie (district heating, India steam)
    "Tcal":  4.18600,        # teracalorie
}

# Energy unit conversions to kWh
_ENERGY_TO_KWH: dict[str, float] = {
    "kWh":  1.0,
    "MWh":  1_000.0,
    "GWh":  1_000_000.0,
    "TWh":  1_000_000_000.0,
    "GJ":   1_000.0 / 3.6,
    "TJ":   1_000_000.0 / 3.6,
    "MJ":   1.0 / 3.6,
}

# Mass unit conversions to kg
_MASS_TO_KG: dict[str, float] = {
    "kg":  1.0,
    "g":   1e-3,
    "t":   1_000.0,
    "kt":  1_000_000.0,
    "Mt":  1_000_000_000.0,
    "Gg":  1_000_000.0,   # Gigagram = 1000 tonnes
    "lb":  0.453592,
    "lbs": 0.453592,
    "ton": 907.185,       # US short ton
}

# Distance unit conversions to km
_DIST_TO_KM: dict[str, float] = {
    "km":    1.0,
    "m":     0.001,
    "mile":  1.60934,
    "miles": 1.60934,
    "nmi":   1.852,       # nautical mile
}

# Weight unit for transport to tonnes
_WEIGHT_TO_TONNE: dict[str, float] = {
    "t":      1.0,
    "tonne":  1.0,
    "tonnes": 1.0,
    "kg":     0.001,
    "Mt":     1_000_000.0,
    "lb":     0.000453592,
    "lbs":    0.000453592,
}


# ---------------------------------------------------------------------------
# Fuel item aliases — resolved BEFORE density/NCV lookup
# Ensures "diesel" and "diesel_oil" both use the same canonical density
# ---------------------------------------------------------------------------
_FUEL_ALIASES: dict[str, str] = {
    # Diesel variants
    "diesel":          "diesel_oil",
    "hsd":             "diesel_oil",
    "hsd_premium":     "diesel_oil",
    # Petrol/gasoline
    "petrol":          "motor_gasoline",
    "gasoline":        "motor_gasoline",
    # Natural gas family
    "cng":             "natural_gas",
    "png":             "natural_gas",
    "gas":             "natural_gas",
    "ng":              "natural_gas",
    "natural_gas_grid":"natural_gas",
    # Aviation fuel
    "atf":             "jet_fuel",
    "aviation_fuel":   "jet_fuel",
    "aviation_turbine_fuel": "jet_fuel",
    "avgas":           "jet_fuel",
    # Coal aliases
    "coal":            "other_bituminous_coal",
    "coal_bituminous": "other_bituminous_coal",
    "washery_rejects": "sub_bituminous_coal",
    "coal_washery_rejects": "sub_bituminous_coal",
    # Biomass
    "wood_chips":      "wood",
    "wood_pellets":    "wood",
    "biomass":         "wood",
    "bagasse":         "wood",
}


def _resolve_fuel(fuel_item: str) -> str:
    """Resolve fuel alias to canonical fuel_item key."""
    return _FUEL_ALIASES.get(fuel_item, fuel_item)




def _lookup_ncv(conn, fuel_item: str, country: str = "GLOBAL") -> Optional[float]:
    """Query conversion_constants for NCV in TJ/Gg. Country-specific preferred,
    then IPCC 2019/2006 default over legacy Table 2.x rows."""
    cur = conn.cursor()
    for c in [country, "GLOBAL"]:
        cur.execute(
            """
            SELECT property_value FROM conversion_constants
            WHERE fuel_item = ?
              AND country = ?
              AND property_name IN ('ncv_tj_per_gg', 'NCV_TJ_per_kt')
            ORDER BY
                -- Prefer rows whose source explicitly marks them as defaults
                CASE WHEN source_name LIKE '%(default)%' THEN 0 ELSE 1 END,
                -- Then prefer IPCC 2019 over IPCC 2006 over legacy
                CASE
                    WHEN source_name LIKE '%2019%' THEN 0
                    WHEN source_name LIKE '%2006%' THEN 1
                    ELSE 2
                END
            LIMIT 1
            """,
            (fuel_item, c),
        )
        row = cur.fetchone()
        if row:
            return float(row[0])
    return None


def _lookup_density(conn, fuel_item: str) -> Optional[float]:
    """Query conversion_constants for density in kg/litre."""
    cur = conn.cursor()
    cur.execute(
        """
        SELECT property_value FROM conversion_constants
        WHERE fuel_item = ?
          AND property_name = 'density_kg_per_litre'
        LIMIT 1
        """,
        (fuel_item,),
    )
    row = cur.fetchone()
    return float(row[0]) if row else None


def _get_ncv(conn, fuel_item: str, country: str) -> tuple[float, str]:
    """Return (ncv_tj_per_gg, source). Falls back to hardcoded defaults."""
    if conn:
        val = _lookup_ncv(conn, fuel_item, country)
        if val is not None:
            return val, "conversion_constants DB"
    default = _NCV_DEFAULTS_TJ_PER_GG.get(fuel_item)
    if default is not None:
        return default, "IPCC 2019 Refinement default"
    raise ValueError(
        f"No NCV found for fuel '{fuel_item}'. Add to conversion_constants table "
        "or update _NCV_DEFAULTS_TJ_PER_GG."
    )


def _get_density(conn, fuel_item: str) -> tuple[float, str]:
    """Return (density_kg_per_l, source). Resolves aliases first, then falls back."""
    canonical = _resolve_fuel(fuel_item)
    if conn:
        val = _lookup_density(conn, canonical)
        if val is None and canonical != fuel_item:
            val = _lookup_density(conn, fuel_item)   # try original too
        if val is not None:
            return val, "conversion_constants DB"
    default = _DENSITY_DEFAULTS_KG_PER_L.get(canonical) or _DENSITY_DEFAULTS_KG_PER_L.get(fuel_item)
    if default is not None:
        return default, "hardcoded IPCC default"
    raise ValueError(
        f"No density found for fuel '{fuel_item}'. "
        "Add to conversion_constants table or update _DENSITY_DEFAULTS_KG_PER_L."
    )


# ---------------------------------------------------------------------------
# Primary conversion functions
# ---------------------------------------------------------------------------

def to_tj(
    quantity: float,
    unit: str,
    fuel_item: str,
    country: str = "GLOBAL",
    conn=None,
) -> tuple[float, list[dict]]:
    """
    Convert any fuel quantity to TJ.

    Handles:
      Direct energy:  TJ, GJ, MJ, kJ, MWh, kWh, Wh, GWh, TWh,
                      toe, MMBtu/MMBTU, MBtu, BTU, therm, Mcf, MMcf,
                      kcal, kCal, Kcal, Mcal, Gcal, Tcal
      Mass:           kg, t, kt, Mt, Gg, lb, lbs, ton  (→ NCV lookup)
      Liquid volume:  L, kL  (→ density → mass → NCV)
      Gas volume:     m3, m³, scm, SCM, nm3, Nm3, mmscm, MMSCM, bcm
                      (→ gas density kg/m³ → mass → NCV)
      Energy content: kcal_per_kg (GCV/NCV override for coal lab reports)
                      e.g. quantity=6000 unit='kcal_per_kg' → used as NCV

    Args:
        quantity:  numeric activity quantity
        unit:      unit string (see lists above)
        fuel_item: fuel key (aliases like 'diesel', 'cng' auto-resolved)
        country:   ISO country code for country-specific NCV
        conn:      open sqlite3 connection (None = use hardcoded defaults)

    Returns:
        (qty_tj, steps)  — steps is an audit list of {"label", "value", "note"}

    Raises:
        ValueError: if unit not recognised or no NCV/density available
    """
    steps: list[dict] = []

    # Resolve fuel alias before any lookup (fixes diesel/diesel_oil mismatch)
    canonical_fuel = _resolve_fuel(fuel_item)

    # ── Direct energy units ───────────────────────────────────────────────
    if unit in _ENERGY_TO_TJ:
        factor = _ENERGY_TO_TJ[unit]
        qty_tj = quantity * factor
        if unit != "TJ":
            steps.append({
                "label": f"Convert {unit}\u2192TJ",
                "value": f"{quantity} {unit} \u00d7 {factor} = {qty_tj:.8f} TJ",
                "note": "Direct energy unit conversion",
            })
        else:
            steps.append({
                "label": "Energy input",
                "value": f"{quantity} TJ",
                "note": "Direct energy unit, no conversion needed",
            })
        return qty_tj, steps

    # ── GCV/NCV override: kcal_per_kg input (e.g. India coal lab report) ─
    # Usage: quantity=6000, unit='kcal_per_kg', combined with mass in extra
    # When used standalone: treated as energy content per tonne, quantity=mass_kg
    # This is an unusual path — typically used for coal where lab gives GCV in kcal/kg
    if unit.lower() in ("kcal_per_kg", "kcal/kg", "kj_per_kg", "kj/kg", "mj_per_kg"):
        # quantity here is the GCV value; mass must come from extra via caller
        # Return TJ assuming 1 tonne of fuel at this GCV
        conversions = {
            "kcal_per_kg": 4.186e-6,   # kcal/kg → TJ/t
            "kcal/kg":     4.186e-6,
            "kj_per_kg":   1e-6,        # kJ/kg → TJ/t
            "kj/kg":       1e-6,
            "mj_per_kg":   1e-3,        # MJ/kg → TJ/t
        }
        factor = conversions.get(unit.lower(), 4.186e-6)
        qty_tj = quantity * factor   # TJ per tonne; caller multiplies by mass
        steps.append({
            "label": f"GCV override ({unit})",
            "value": f"{quantity} {unit} \u00d7 {factor} = {qty_tj:.8f} TJ/t",
            "note": "Energy content per unit mass. Multiply by mass for total TJ.",
        })
        return qty_tj, steps

    # ── Mass units (kg, t, kt, Gg…) → TJ via NCV ─────────────────────────
    if unit in _MASS_TO_KG:
        qty_kg = quantity * _MASS_TO_KG[unit]
        qty_gg = qty_kg / 1_000_000.0
        if unit not in ("kg",):
            steps.append({
                "label": f"Convert {unit}\u2192kg",
                "value": f"{quantity} {unit} = {qty_kg:.4f} kg",
                "note": f"1 {unit} = {_MASS_TO_KG[unit]} kg",
            })
        steps.append({
            "label": "Convert kg\u2192Gg",
            "value": f"{qty_kg:.4f} kg / 1,000,000 = {qty_gg:.8f} Gg",
        })
        ncv, ncv_src = _get_ncv(conn, canonical_fuel, country)
        qty_tj = qty_gg * ncv
        steps.append({
            "label": "Apply NCV",
            "value": f"{qty_gg:.8f} Gg \u00d7 {ncv} TJ/Gg = {qty_tj:.8f} TJ",
            "note": f"NCV from {ncv_src}",
        })
        return qty_tj, steps

    # ── Liquid volume (L, kL) → density → mass → NCV ─────────────────────
    liquid_vol_to_l = {"L": 1.0, "l": 1.0, "kL": 1_000.0, "kl": 1_000.0,
                       "litre": 1.0, "litres": 1.0, "liter": 1.0, "liters": 1.0}
    if unit in liquid_vol_to_l:
        qty_l   = quantity * liquid_vol_to_l[unit]
        density, den_src = _get_density(conn, canonical_fuel)
        qty_kg  = qty_l * density
        qty_gg  = qty_kg / 1_000_000.0
        steps.append({
            "label": f"Convert {unit}\u2192kg",
            "value": f"{qty_l:.4f} L \u00d7 {density} kg/L = {qty_kg:.4f} kg",
            "note": f"Density from {den_src}",
        })
        steps.append({
            "label": "Convert kg\u2192Gg",
            "value": f"{qty_kg:.4f} kg / 1,000,000 = {qty_gg:.8f} Gg",
        })
        ncv, ncv_src = _get_ncv(conn, canonical_fuel, country)
        qty_tj = qty_gg * ncv
        steps.append({
            "label": "Apply NCV",
            "value": f"{qty_gg:.8f} Gg \u00d7 {ncv} TJ/Gg = {qty_tj:.8f} TJ",
            "note": f"NCV from {ncv_src}",
        })
        return qty_tj, steps

    # ── Gas volume (m³, SCM, MMSCM…) → kg via gas density → NCV ─────────
    if unit in _GAS_VOLUME_TO_M3:
        qty_m3 = quantity * _GAS_VOLUME_TO_M3[unit]
        # Gas density: kg/m³ at STP
        gas_density = _GAS_DENSITY_KG_PER_M3.get(canonical_fuel) or \
                      _GAS_DENSITY_KG_PER_M3.get(fuel_item)
        if gas_density is None:
            # Try DB density (stored as kg/L → convert to kg/m³ via x1000)
            try:
                d_per_l, _ = _get_density(conn, canonical_fuel)
                gas_density = d_per_l * 1000.0
            except ValueError:
                raise ValueError(
                    f"No gas density (kg/m³) for fuel '{fuel_item}'. "
                    f"Add to _GAS_DENSITY_KG_PER_M3 or conversion_constants table."
                )
        qty_kg = qty_m3 * gas_density
        qty_gg = qty_kg / 1_000_000.0
        unit_label = unit if unit == "m3" else f"{unit} (= {qty_m3:.2f} m\u00b3)"
        steps.append({
            "label": f"Convert {unit}\u2192m\u00b3",
            "value": f"{quantity} {unit} \u00d7 {_GAS_VOLUME_TO_M3[unit]} = {qty_m3:.4f} m\u00b3",
            "note": "1 SCM = 1 m\u00b3 at STP (15\u00b0C, 1 atm)",
        }) if _GAS_VOLUME_TO_M3[unit] != 1.0 else None
        steps.append({
            "label": "Convert m\u00b3\u2192kg",
            "value": f"{qty_m3:.4f} m\u00b3 \u00d7 {gas_density} kg/m\u00b3 = {qty_kg:.4f} kg",
            "note": f"Gas density at STP. Fuel: {canonical_fuel}",
        })
        steps.append({
            "label": "Convert kg\u2192Gg",
            "value": f"{qty_kg:.4f} kg / 1,000,000 = {qty_gg:.8f} Gg",
        })
        ncv, ncv_src = _get_ncv(conn, canonical_fuel, country)
        qty_tj = qty_gg * ncv
        steps.append({
            "label": "Apply NCV",
            "value": f"{qty_gg:.8f} Gg \u00d7 {ncv} TJ/Gg = {qty_tj:.8f} TJ",
            "note": f"NCV from {ncv_src}",
        })
        return qty_tj, steps

    # ── Unrecognised unit ─────────────────────────────────────────────────
    all_units = sorted(
        list(_ENERGY_TO_TJ) + list(_MASS_TO_KG) +
        list(liquid_vol_to_l) + list(_GAS_VOLUME_TO_M3)
    )
    raise ValueError(
        f"Unit '{unit}' not supported for fuel '{fuel_item}'. "
        f"Supported units include: {all_units[:30]}... "
        f"(see unit_converter.py for full list)"
    )


def to_kwh(quantity: float, unit: str) -> tuple[float, list[dict]]:
    """
    Convert any energy quantity to kWh (for electricity calculations).

    Returns:
        (qty_kwh, steps)
    """
    steps = []
    if unit in _ENERGY_TO_KWH:
        factor = _ENERGY_TO_KWH[unit]
        qty_kwh = quantity * factor
        if unit != "kWh":
            steps.append({
                "label": f"Convert {unit}→kWh",
                "value": f"{quantity} {unit} × {factor} = {qty_kwh:.4f} kWh",
            })
        return qty_kwh, steps
    raise ValueError(
        f"Unit '{unit}' not supported for electricity. "
        f"Supported: {list(_ENERGY_TO_KWH.keys())}"
    )


def to_tonne_km(
    weight: float,
    weight_unit: str,
    distance: float,
    distance_unit: str,
) -> tuple[float, list[dict]]:
    """
    Convert transport activity to tonne-km.

    Returns:
        (tonne_km, steps)
    """
    steps = []

    if weight_unit not in _WEIGHT_TO_TONNE:
        raise ValueError(
            f"Weight unit '{weight_unit}' not supported. "
            f"Supported: {list(_WEIGHT_TO_TONNE.keys())}"
        )
    if distance_unit not in _DIST_TO_KM:
        raise ValueError(
            f"Distance unit '{distance_unit}' not supported. "
            f"Supported: {list(_DIST_TO_KM.keys())}"
        )

    weight_t = weight * _WEIGHT_TO_TONNE[weight_unit]
    distance_km = distance * _DIST_TO_KM[distance_unit]
    tonne_km = weight_t * distance_km

    if weight_unit != "t":
        steps.append({
            "label": f"Convert weight {weight_unit}→t",
            "value": f"{weight} {weight_unit} × {_WEIGHT_TO_TONNE[weight_unit]} = {weight_t:.4f} t",
        })
    if distance_unit != "km":
        steps.append({
            "label": f"Convert distance {distance_unit}→km",
            "value": f"{distance} {distance_unit} × {_DIST_TO_KM[distance_unit]} = {distance_km:.4f} km",
        })
    steps.append({
        "label": "Tonne-km",
        "value": f"{weight_t:.4f} t × {distance_km:.4f} km = {tonne_km:.4f} t·km",
    })
    return tonne_km, steps


def to_kg(quantity: float, unit: str) -> tuple[float, list[dict]]:
    """
    Convert any mass quantity to kg (for material emissions, waste, etc.).

    Returns:
        (qty_kg, steps)
    """
    steps = []
    if unit not in _MASS_TO_KG:
        raise ValueError(
            f"Mass unit '{unit}' not recognised. Supported: {list(_MASS_TO_KG.keys())}"
        )
    qty_kg = quantity * _MASS_TO_KG[unit]
    if unit != "kg":
        steps.append({
            "label": f"Convert {unit}→kg",
            "value": f"{quantity} {unit} × {_MASS_TO_KG[unit]} = {qty_kg:.4f} kg",
        })
    return qty_kg, steps


def to_km(quantity: float, unit: str) -> tuple[float, list[dict]]:
    """
    Convert any distance quantity to km.

    Returns:
        (qty_km, steps)
    """
    steps = []
    if unit not in _DIST_TO_KM:
        raise ValueError(
            f"Distance unit '{unit}' not recognised. Supported: {list(_DIST_TO_KM.keys())}"
        )
    qty_km = quantity * _DIST_TO_KM[unit]
    if unit != "km":
        steps.append({
            "label": f"Convert {unit}→km",
            "value": f"{quantity} {unit} × {_DIST_TO_KM[unit]} = {qty_km:.4f} km",
        })
    return qty_km, steps
