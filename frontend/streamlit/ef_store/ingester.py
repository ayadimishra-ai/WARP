"""
sk.lite — EF Store Ingester.

Loads all seed data into the SQLite EF store on first run.
Diffs on subsequent runs and logs changes to ef_update_log.

Seed files expected in ef_store/seeds/:
  ef_seed_v0.1.0.csv               → emission_factors
  conversion_constants_v0.1.0.csv  → conversion_constants
  EFDB_india.csv                    → emission_factors (parsed from IPCC EFDB format)
  eeio/US_summary_import_factors_exiobase_2019_17sch.csv → eeio_factors

CEA grid EF values are hardcoded from the CEA v20 PDF (December 2024).
"""

from __future__ import annotations
import sqlite3
import csv
import json
import re
import math
from pathlib import Path
from datetime import datetime
from typing import Optional

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SEEDS_DIR = Path(__file__).parent / "seeds"

EF_SEED_CSV = SEEDS_DIR / "ef_seed_v0.1.0.csv"
CC_SEED_CSV = SEEDS_DIR / "conversion_constants_v0.1.0.csv"
EFDB_INDIA_CSV = SEEDS_DIR / "EFDB_india.csv"
EF_JSON_SEED = SEEDS_DIR / "emission_factors_v0.json"
EEIO_CSV = SEEDS_DIR / "eeio" / "US_summary_import_factors_exiobase_2019_17sch.csv"
DEFRA_TRANSPORT_CSV = SEEDS_DIR / "defra_2024_transport.csv"
UPSTREAM_FUEL_CSV = SEEDS_DIR / "upstream_fuel_ef.csv"
VEHICLE_SPECS_CSV = SEEDS_DIR / "vehicle_specs_india.csv"
MAJOR_PORTS_CSV   = SEEDS_DIR / "major_ports.csv"
AIRPORTS_CSV      = SEEDS_DIR / "airports.csv"
AIRCRAFT_FUEL_CSV = SEEDS_DIR / "aircraft_fuel_burn.csv"

# ---------------------------------------------------------------------------
# CEA Grid EF seed — from CEA CO2 Baseline Database v20, December 2024
# Source: Annexure-I and Appendix C, Ministry of Power, Government of India
# ---------------------------------------------------------------------------
CEA_GRID_EF_SEED = [
    # (fiscal_year, calendar_year, weighted_avg, om, bm, cm)
    # Annexure-I: weighted avg including RE, 2013-14 to 2023-24
    # OM/BM/CM for 2013-18 estimated from CEA historical CDM baseline reports
    ("2013-14", 2014, 0.774, 0.935, 0.882, 0.909),
    ("2014-15", 2015, 0.779, 0.940, 0.878, 0.909),
    ("2015-16", 2016, 0.774, 0.936, 0.872, 0.904),
    ("2016-17", 2017, 0.770, 0.932, 0.868, 0.900),
    ("2017-18", 2018, 0.754, 0.918, 0.862, 0.890),
    ("2018-19", 2019, 0.744, 0.948, 0.866, 0.907),
    # Appendix C Table B: including cross-border transfers
    ("2019-20", 2020, 0.713, 0.960, 0.868, 0.911),
    ("2020-21", 2021, 0.703, 0.940, 0.865, 0.903),
    ("2021-22", 2022, 0.715, 0.960, 0.869, 0.915),
    ("2022-23", 2023, 0.716, 0.971, 0.867, 0.919),
    # v20 December 2024 — BM/CM now include RE generation
    ("2023-24", 2024, 0.727, 0.962, 0.552, 0.757),
]

# Grid EF types to load per year
_CEA_METHODS = ["weighted_avg", "om", "bm", "cm"]
_CEA_IDX = {
    "weighted_avg": 2,
    "om": 3,
    "bm": 4,
    "cm": 5,
}

# ---------------------------------------------------------------------------
# EEIO gas normalisation
# ---------------------------------------------------------------------------
_FLOWABLE_TO_GAS = {
    "Carbon dioxide": "CO2",
    "Methane": "CH4",
    "Nitrous oxide": "N2O",
    "Sulfur hexafluoride": "SF6",
    "HFCs and PFCs, unspecified": "HFC_PFC_mix",
    "Nitrogen oxides": "NOx",
    "Sulfur dioxide": "SO2",
}

# Geography level map for ef_seed countries
_COUNTRY_TO_GEO_LEVEL = {
    "GLOBAL": "global",
    "EU": "continental",
    "ASEAN": "regional",
    "GCC": "regional",
    "SOUTH_ASIA": "regional",
    "IN": "national",
    "US": "national",
    "GB": "national",
    "DE": "national",
    "FR": "national",
    "AU": "national",
    "JP": "national",
    "CN": "national",
    "BR": "national",
    "ZA": "national",
    "ID": "national",
    "CA": "national",
}


def _geo_level(country: str) -> str:
    return _COUNTRY_TO_GEO_LEVEL.get(country, "national")


# ---------------------------------------------------------------------------
# Range value parser for EFDB CSV
# ---------------------------------------------------------------------------

def parse_efdb_value(raw: str) -> tuple[Optional[float], Optional[float]]:
    """
    Parse EFDB 'Value' field which may contain ranges.

    Examples:
      '56.1'       → (56.1, None)
      '1.8, 6.3'   → (1.8, 6.3)     — take first as point estimate
      '7-19'       → (13.0, 19.0)    — midpoint as point estimate
      '10 (5-15)'  → (10.0, 15.0)    — explicit point + upper bound
      '<0.1'       → (0.05, 0.1)     — conservative midpoint

    Returns:
        (point_estimate, upper_bound_or_None)
    """
    if not raw or str(raw).strip().lower() in ("nan", "", "-", "n/a"):
        return None, None

    raw = str(raw).strip()

    # Pattern: explicit point with parenthetical range e.g. "10 (5-15)"
    m = re.match(r"^([\d.]+)\s*\(([\d.]+)-([\d.]+)\)$", raw)
    if m:
        return float(m.group(1)), float(m.group(3))

    # Pattern: comma-separated list e.g. "1.8, 6.3"
    if "," in raw:
        parts = [p.strip() for p in raw.split(",")]
        try:
            nums = [float(p) for p in parts if p]
            return nums[0], nums[-1]
        except ValueError:
            pass

    # Pattern: simple dash range e.g. "7-19" (not a negative number)
    m = re.match(r"^([\d.]+)-([\d.]+)$", raw)
    if m:
        lo, hi = float(m.group(1)), float(m.group(2))
        return (lo + hi) / 2, hi

    # Pattern: less-than e.g. "<0.1"
    m = re.match(r"^<([\d.]+)$", raw)
    if m:
        hi = float(m.group(1))
        return hi / 2, hi

    # Plain number
    try:
        return float(raw), None
    except ValueError:
        return None, None


# ---------------------------------------------------------------------------
# Ingest: ef_seed CSV
# ---------------------------------------------------------------------------

def ingest_ef_seed(conn: sqlite3.Connection) -> int:
    """Load ef_seed_v0.1.0.csv into emission_factors. Returns rows inserted."""
    if not EF_SEED_CSV.exists():
        print(f"  [SKIP] {EF_SEED_CSV} not found")
        return 0

    count = 0
    with open(EF_SEED_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row.get("country", "GLOBAL").strip()
            conn.execute(
                """
                INSERT OR REPLACE INTO emission_factors (
                    factor_id, factor_set_version, scope, module,
                    country, geography_level, year_start, year_end,
                    fuel_item, technology_process, gas,
                    factor_value, unit_numerator, unit_denominator,
                    source_name, preferred_rank, efdb_id, ipcc_table_ref,
                    notes, source_reference, source_url
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    row["factor_id"].strip(),
                    row.get("factor_set_version", "v0.1.0"),
                    row["scope"].strip(),
                    row["module"].strip(),
                    country,
                    _geo_level(country),
                    _int_or_none(row.get("year_start")),
                    _int_or_none(row.get("year_end")),
                    _str_or_none(row.get("fuel_item")),
                    _str_or_none(row.get("technology_process")),
                    row["gas"].strip(),
                    float(row["factor_value"]),
                    row["unit_numerator"].strip(),
                    row["unit_denominator"].strip(),
                    _str_or_none(row.get("source_name")),
                    int(row.get("preferred_rank", 900)),
                    _str_or_none(row.get("efdb_id")),
                    _str_or_none(row.get("ipcc_table_ref")),
                    _str_or_none(row.get("notes")),
                    _str_or_none(row.get("source_reference")),
                    _str_or_none(row.get("source_url")),
                ),
            )
            count += 1
    conn.commit()
    print(f"  [OK] ef_seed: {count} rows → emission_factors")
    return count


# ---------------------------------------------------------------------------
# Ingest: conversion constants CSV
# ---------------------------------------------------------------------------

def ingest_conversion_constants(conn: sqlite3.Connection) -> int:
    """Load conversion_constants_v0.1.0.csv → conversion_constants table."""
    if not CC_SEED_CSV.exists():
        print(f"  [SKIP] {CC_SEED_CSV} not found")
        return 0

    count = 0
    with open(CC_SEED_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            conn.execute(
                """
                INSERT OR REPLACE INTO conversion_constants (
                    constant_id, factor_set_version, constant_type,
                    fuel_item, country, year_start, year_end,
                    property_name, property_value, unit,
                    source_name, efdb_id, notes, source_reference, source_url
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    row["constant_id"].strip(),
                    row.get("factor_set_version", "v0.1.0"),
                    _str_or_none(row.get("constant_type")),
                    row["fuel_item"].strip(),
                    row.get("country", "GLOBAL").strip(),
                    _int_or_none(row.get("year_start")),
                    _int_or_none(row.get("year_end")),
                    row["property_name"].strip(),
                    float(row["property_value"]),
                    row["unit"].strip(),
                    _str_or_none(row.get("source_name")),
                    _str_or_none(row.get("efdb_id")),
                    _str_or_none(row.get("notes")),
                    _str_or_none(row.get("source_reference")),
                    _str_or_none(row.get("source_url")),
                ),
            )
            count += 1
    conn.commit()
    print(f"  [OK] conversion_constants: {count} rows → conversion_constants")
    return count


# ---------------------------------------------------------------------------
# Ingest: EFDB India CSV (IPCC EFDB export format)
# ---------------------------------------------------------------------------

def ingest_efdb_india(conn: sqlite3.Connection) -> int:
    """
    Parse EFDB_india.csv (IPCC EFDB export format) → emission_factors.
    Skips rows where value cannot be parsed or gas not mappable.
    """
    if not EFDB_INDIA_CSV.exists():
        print(f"  [SKIP] {EFDB_INDIA_CSV} not found")
        return 0

    # Map EFDB gas names to canonical
    gas_map = {
        "CARBON DIOXIDE": "CO2",
        "METHANE": "CH4",
        "NITROUS OXIDE": "N2O",
        "CO2": "CO2",
        "CH4": "CH4",
        "N2O": "N2O",
    }

    count = 0
    skipped = 0
    with open(EFDB_INDIA_CSV, newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_val = row.get("Value", "").strip()
            point_val, _ = parse_efdb_value(raw_val)
            if point_val is None:
                skipped += 1
                continue

            raw_gas = row.get("Gas", "").strip().upper()
            gas = gas_map.get(raw_gas)
            if not gas:
                skipped += 1
                continue

            efdb_id = row.get("EF ID", "").strip()
            ipcc_cat = row.get("IPCC 2006 Source/Sink Category", "").strip()
            unit = row.get("Unit", "").strip()
            source = row.get("Source of data", "").strip()[:200]
            description = row.get("Description", "").strip()[:300]

            # Determine unit_numerator and unit_denominator from EFDB unit string
            unit_num, unit_den = _parse_efdb_unit(unit, gas)

            # ── Guard: skip rows that are NOT emission factors ──────────
            # NCV rows (TJ/kt, TJ/Gg, GJ/kg) are conversion constants, not EFs
            # LULUCF rows (dm, ha, dm ha) are land-use, not industrial EFs
            # Fraction rows without a usable denominator are ambiguous
            unit_lower = unit.lower()
            skip_units = ("tj/kt", "tj/gg", "gj/kg", "mj/kg", "mj/m3",
                          "dm ha", "dm", " ha", "mg/m", "fraction")
            if any(su in unit_lower for su in skip_units):
                skipped += 1
                continue
            # Skip if denominator is empty or looks like a land unit
            if not unit_den or unit_den.lower() in ("", "ha", "dm", "dm ha"):
                skipped += 1
                continue
            # Skip rows with implausibly large values (likely unit mismatch)
            if point_val and point_val > 500000:
                skipped += 1
                continue

            factor_id = f"EFDB_IN_{efdb_id}_{gas}"

            conn.execute(
                """
                INSERT OR IGNORE INTO emission_factors (
                    factor_id, factor_set_version, scope, module,
                    country, geography_level,
                    gas, factor_value, unit_numerator, unit_denominator,
                    source_name, preferred_rank, efdb_id, ipcc_table_ref,
                    notes
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    factor_id,
                    "v0.1.0_efdb_india",
                    _ipcc_cat_to_scope(ipcc_cat),
                    _ipcc_cat_to_module(ipcc_cat),
                    "IN",
                    "national",
                    gas,
                    point_val,
                    unit_num,
                    unit_den,
                    source,
                    50,   # national EFDB = rank 50 (preferred over IPCC global defaults)
                    efdb_id,
                    ipcc_cat,
                    description,
                ),
            )
            count += 1

    conn.commit()
    print(f"  [OK] EFDB_india: {count} rows → emission_factors ({skipped} skipped/unparseable)")
    return count


# ---------------------------------------------------------------------------
# Ingest: legacy emission_factors.json
# ---------------------------------------------------------------------------

def ingest_ef_json(conn: sqlite3.Connection) -> int:
    """
    Load emission_factors_v0.json (legacy app.py EF store).
    Used to seed global defaults for stationary/mobile combustion not yet
    in ef_seed_v0.1.0.csv. Assigned preferred_rank=920 (worse than IPCC 2019
    seeded rows at rank 900, better than IPCC 2006 at rank 950).
    """
    if not EF_JSON_SEED.exists():
        print(f"  [SKIP] {EF_JSON_SEED} not found")
        return 0

    with open(EF_JSON_SEED, encoding="utf-8") as f:
        d = json.load(f)

    count = 0

    # --- Stationary combustion ---
    for fuel_key, fdata in d.get("stationary_combustion", {}).get("factors", {}).items():
        for gas, ef_field in [("CO2","CO2_kg_per_TJ"), ("CH4","CH4_kg_per_TJ"), ("N2O","N2O_kg_per_TJ")]:
            val = fdata.get(ef_field)
            if val is None:
                continue
            factor_id = f"LEGACY_JSON_S1_STAT_{fuel_key}_{gas}"
            conn.execute(
                """INSERT OR IGNORE INTO emission_factors
                   (factor_id, factor_set_version, scope, module, country, geography_level,
                    fuel_item, gas, factor_value, unit_numerator, unit_denominator,
                    source_name, preferred_rank, notes)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (factor_id, "v0.json_legacy", "S1", "stationary_combustion",
                 "GLOBAL", "global",
                 fuel_key, gas, float(val),
                 f"kg{gas}", "TJ",
                 fdata.get("source", "IPCC 2006"), 920,
                 f"Seeded from legacy emission_factors.json. Verify against IPCC 2019.")
            )
            count += 1

        # Also seed NCV into conversion_constants if not already present
        ncv = fdata.get("ncv_tj_per_gg")
        if ncv:
            const_id = f"LEGACY_JSON_NCV_GLOBAL_{fuel_key}"
            conn.execute(
                """INSERT OR IGNORE INTO conversion_constants
                   (constant_id, constant_type, fuel_item, country,
                    property_name, property_value, unit, source_name, notes)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (const_id, "NCV (energy content)", fuel_key, "GLOBAL",
                 "ncv_tj_per_gg", ncv, "TJ/Gg",
                 fdata.get("source", "IPCC 2006"),
                 "From legacy emission_factors.json")
            )
        density = fdata.get("density_kg_per_litre")
        if density:
            const_id = f"LEGACY_JSON_DENSITY_GLOBAL_{fuel_key}"
            conn.execute(
                """INSERT OR IGNORE INTO conversion_constants
                   (constant_id, constant_type, fuel_item, country,
                    property_name, property_value, unit, source_name, notes)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (const_id, "Density", fuel_key, "GLOBAL",
                 "density_kg_per_litre", density, "kg/litre",
                 fdata.get("source", "IPCC 2006"),
                 "From legacy emission_factors.json")
            )

    # --- Mobile combustion ---
    for veh_key, fdata in d.get("mobile_combustion", {}).get("factors", {}).items():
        val_co2 = fdata.get("CO2_kg_per_TJ")
        if val_co2:
            factor_id = f"LEGACY_JSON_S1_MOB_{veh_key}_CO2"
            conn.execute(
                """INSERT OR IGNORE INTO emission_factors
                   (factor_id, factor_set_version, scope, module, country, geography_level,
                    fuel_item, technology_process, gas, factor_value, unit_numerator, unit_denominator,
                    source_name, preferred_rank, notes)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (factor_id, "v0.json_legacy", "S1", "mobile_combustion",
                 "GLOBAL", "global",
                 None, veh_key, "CO2", float(val_co2),
                 "kgCO2", "TJ",
                 fdata.get("source", "IPCC 2006"), 920,
                 "Seeded from legacy emission_factors.json")
            )
            count += 1
        # CH4 and N2O per-km factors
        for gas, field in [("CH4","CH4_g_per_km"), ("N2O","N2O_g_per_km")]:
            val = fdata.get(field)
            if val:
                factor_id = f"LEGACY_JSON_S1_MOB_{veh_key}_{gas}_PKM"
                conn.execute(
                    """INSERT OR IGNORE INTO emission_factors
                       (factor_id, factor_set_version, scope, module, country, geography_level,
                        fuel_item, technology_process, gas, factor_value, unit_numerator, unit_denominator,
                        source_name, preferred_rank, notes)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (factor_id, "v0.json_legacy", "S1", "mobile_combustion",
                     "GLOBAL", "global",
                     None, veh_key, gas, float(val),
                     f"g{gas}", "km",
                     fdata.get("source", "IPCC 2006"), 920,
                     "Per-km factor from legacy JSON")
                )
                count += 1

    # --- Electricity ---
    country_map = {
        "India": "IN", "China": "CN", "United States of America": "US",
        "United Kingdom": "GB", "Germany": "DE", "Australia": "AU",
        "Japan": "JP", "Brazil": "BR", "South Africa": "ZA",
        "Indonesia": "ID", "Canada": "CA", "France": "FR", "global": "GLOBAL",
    }
    for country_name, fdata in d.get("electricity", {}).get("factors", {}).items():
        iso = country_map.get(country_name, "GLOBAL")
        val = fdata.get("CO2e_kg_per_kWh")
        if val is None:
            continue
        factor_id = f"LEGACY_JSON_S2_ELEC_{iso}"
        year = fdata.get("year", 2022)
        conn.execute(
            """INSERT OR IGNORE INTO emission_factors
               (factor_id, factor_set_version, scope, module, country, geography_level,
                fuel_item, gas, factor_value, unit_numerator, unit_denominator,
                source_name, preferred_rank, year_start, notes)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (factor_id, "v0.json_legacy", "S2", "purchased_electricity",
             iso, _geo_level(iso),
             "grid_electricity", "CO2e", float(val),
             "kgCO2e", "kWh",
             fdata.get("source", "")[:100], 5 if iso != "GLOBAL" else 980,
             year,
             f"From legacy emission_factors.json. {fdata.get('notes','')}")
        )
        count += 1

    conn.commit()
    print(f"  [OK] emission_factors.json legacy: {count} factors → emission_factors + conversion_constants")
    return count


# ---------------------------------------------------------------------------
# Ingest: CEA grid EFs
# ---------------------------------------------------------------------------

def ingest_cea_grid(conn: sqlite3.Connection) -> int:
    """Seed grid_ef table from hardcoded CEA v20 values."""
    count = 0
    for row in CEA_GRID_EF_SEED:
        fy, cy, wavg, om, bm, cm = row
        method_vals = {
            "weighted_avg": wavg,
            "om": om,
            "bm": bm,
            "cm": cm,
        }
        for method, val in method_vals.items():
            if val is None:
                continue
            factor_id = f"CEA_IN_{fy.replace('-','_')}_{method}"
            conn.execute(
                """INSERT OR REPLACE INTO grid_ef (
                    factor_id, source, source_version, geography_code,
                    grid_region, fiscal_year, calendar_year, method,
                    ef_value_tco2_per_mwh, ef_value_kgco2e_per_kwh, notes
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    factor_id,
                    "CEA",
                    "v20" if fy == "2023-24" else "v19",
                    "IN",
                    "National",
                    fy,
                    cy,
                    method,
                    val,
                    val,  # tCO2/MWh = kgCO2e/kWh numerically
                    (
                        "CEA CO2 Baseline Database v20, December 2024, "
                        "Ministry of Power, Government of India. "
                        "BM/CM for 2023-24 includes RE generation (methodology change v20)."
                        if fy == "2023-24"
                        else "CEA CO2 Baseline Database, Government of India."
                    ),
                ),
            )
            count += 1
    conn.commit()
    print(f"  [OK] CEA grid EF: {count} rows → grid_ef (10 fiscal years × up to 4 methods)")
    return count


# ---------------------------------------------------------------------------
# Ingest: USEEIO pre-computed output CSV
# ---------------------------------------------------------------------------

def ingest_eeio(conn: sqlite3.Connection) -> int:
    """Load USEEIO summary import factors (Exiobase 2019) → eeio_factors."""
    if not EEIO_CSV.exists():
        print(f"  [SKIP] {EEIO_CSV} not found — EEIO factors not seeded")
        return 0

    count = 0
    with open(EEIO_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            flowable = row.get("Flowable", "").strip()
            gas_canonical = _FLOWABLE_TO_GAS.get(flowable)
            # Only load GHG gases (skip NOx, SO2, etc. for now)
            if gas_canonical not in ("CO2", "CH4", "N2O", "SF6", "HFC_PFC_mix"):
                continue
            ef_val = row.get("FlowAmount", "").strip()
            if not ef_val:
                continue
            try:
                ef_float = float(ef_val)
            except ValueError:
                continue

            sector = row.get("Sector", "").strip()
            year = row.get("Year", "2019").strip()
            factor_id = f"USEEIO_{sector}_{gas_canonical}_{year}"

            conn.execute(
                """INSERT OR REPLACE INTO eeio_factors (
                    factor_id, source, sector_code, flowable, gas_canonical,
                    context, flow_uuid, ef_value, ef_unit,
                    ref_currency, price_type, base_io_level, year, geography_code
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    factor_id,
                    "USEEIO_v2_summary_exiobase_2019",
                    sector,
                    flowable,
                    gas_canonical,
                    row.get("Context", "").strip(),
                    row.get("FlowUUID", "").strip(),
                    ef_float,
                    "kg/USD",
                    row.get("ReferenceCurrency", "USD"),
                    row.get("PriceType", "Basic"),
                    row.get("BaseIOLevel", "Summary"),
                    int(year),
                    "US",
                ),
            )
            count += 1

    conn.commit()
    print(f"  [OK] USEEIO: {count} rows → eeio_factors")
    return count


# ---------------------------------------------------------------------------
# Generic CSV ingester — for defra_2024_transport.csv and upstream_fuel_ef.csv
# Both share the same column schema as ef_seed_v0.1.0.csv
# ---------------------------------------------------------------------------

def ingest_generic_ef_csv(conn: sqlite3.Connection, csv_path: Path,
                          label: str) -> int:
    """
    Load any CSV that matches the emission_factors column schema.
    Required columns: factor_id, scope, module, country, gas,
                      factor_value, unit_numerator, unit_denominator,
                      preferred_rank, source_name
    Optional: fuel_item, technology_process, year_start, year_end,
              source_reference, source_url, notes
    """
    if not csv_path.exists():
        print(f"  [SKIP] {csv_path.name} not found")
        return 0

    count = 0
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row.get("country", "GLOBAL").strip()
            fuel = _str_or_none(row.get("fuel_item"))
            tech  = _str_or_none(row.get("technology_process"))

            conn.execute(
                """
                INSERT OR REPLACE INTO emission_factors (
                    factor_id, factor_set_version, scope, module,
                    country, geography_level,
                    fuel_item, technology_process,
                    gas, factor_value, unit_numerator, unit_denominator,
                    source_name, preferred_rank,
                    year_start, year_end,
                    notes, source_reference, source_url
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    row["factor_id"].strip(),
                    "v0.2.0",
                    row["scope"].strip(),
                    row["module"].strip(),
                    country,
                    _geo_level(country),
                    fuel,
                    tech,
                    row["gas"].strip(),
                    float(row["factor_value"]),
                    row["unit_numerator"].strip(),
                    row["unit_denominator"].strip(),
                    _str_or_none(row.get("source_name")),
                    int(row.get("preferred_rank", 60)),
                    _int_or_none(row.get("year_start")),
                    _int_or_none(row.get("year_end")),
                    _str_or_none(row.get("notes")),
                    _str_or_none(row.get("source_reference")),
                    _str_or_none(row.get("source_url")),
                ),
            )
            count += 1
    conn.commit()
    print(f"  [OK] {label}: {count} rows -> emission_factors")
    return count


def ingest_airports(conn: sqlite3.Connection) -> int:
    """Load airports.csv into airports table."""
    if not AIRPORTS_CSV.exists():
        print(f"  [SKIP] {AIRPORTS_CSV.name} not found")
        return 0
    count = 0
    with open(AIRPORTS_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                conn.execute(
                    """INSERT OR REPLACE INTO airports
                       (iata, icao, name, city, country, lat, lon)
                       VALUES (?,?,?,?,?,?,?)""",
                    (
                        row["iata"].strip().upper(),
                        row.get("icao", "").strip() or None,
                        row["name"].strip(),
                        row.get("city", "").strip() or None,
                        row.get("country", "").strip() or None,
                        float(row["lat"]),
                        float(row["lon"]),
                    ),
                )
                count += 1
            except (ValueError, KeyError):
                continue
    conn.commit()
    print(f"  [OK] airports: {count} rows -> airports")
    return count


def ingest_aircraft_fuel_burn(conn: sqlite3.Connection) -> int:
    """Load aircraft_fuel_burn.csv into aircraft_fuel_burn table."""
    if not AIRCRAFT_FUEL_CSV.exists():
        print(f"  [SKIP] {AIRCRAFT_FUEL_CSV.name} not found")
        return 0
    count = 0
    with open(AIRCRAFT_FUEL_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                conn.execute(
                    """INSERT OR REPLACE INTO aircraft_fuel_burn
                       (icao_code, iata_code, name, manufacturer,
                        fuel_kg_per_km, seats_typical, cargo_t_typical,
                        category, notes, source)
                       VALUES (?,?,?,?,?,?,?,?,?,?)""",
                    (
                        row["icao_code"].strip().upper(),
                        row.get("iata_code", "").strip() or None,
                        row.get("name", "").strip() or None,
                        row.get("manufacturer", "").strip() or None,
                        float(row["fuel_kg_per_km"]),
                        int(row["seats_typical"]) if row.get("seats_typical","").strip() else None,
                        float(row["cargo_t_typical"]) if row.get("cargo_t_typical","").strip() else None,
                        row.get("category", "").strip() or None,
                        row.get("notes", "").strip() or None,
                        row.get("source", "").strip() or None,
                    ),
                )
                count += 1
            except (ValueError, KeyError):
                continue
    conn.commit()
    print(f"  [OK] aircraft_fuel_burn: {count} rows -> aircraft_fuel_burn")
    return count


def ingest_major_ports(conn: sqlite3.Connection) -> int:
    """Load major_ports.csv into major_ports table."""
    if not MAJOR_PORTS_CSV.exists():
        print(f"  [SKIP] {MAJOR_PORTS_CSV.name} not found")
        return 0
    count = 0
    with open(MAJOR_PORTS_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                conn.execute(
                    """INSERT OR REPLACE INTO major_ports
                       (unlocode, name, country, lat, lon, type)
                       VALUES (?,?,?,?,?,?)""",
                    (
                        row["unlocode"].strip(),
                        row["name"].strip(),
                        row.get("country", "").strip() or None,
                        float(row["lat"]),
                        float(row["lon"]),
                        row.get("type", "sea").strip() or "sea",
                    ),
                )
                count += 1
            except (ValueError, KeyError):
                continue
    conn.commit()
    print(f"  [OK] major_ports: {count} rows -> major_ports")
    return count


def ingest_vehicle_specs(conn: sqlite3.Connection) -> int:
    """
    Load vehicle_specs_india.csv into vehicle_specs table.
    Pre-computes EF at 100% load: (fuel_L/100km / 100 / payload_t) * diesel_EF_kgCO2_per_L.

    Diesel combustion EF used for pre-computation:
      56100 kgCO2/TJ * 43 TJ/Gg * 0.832 kg/L / 1e6 = 2.010 kgCO2/L
      (IPCC 2019 default + IPCC density)
    """
    if not VEHICLE_SPECS_CSV.exists():
        print(f"  [SKIP] {VEHICLE_SPECS_CSV.name} not found")
        return 0

    # Emission factors per litre by fuel type (kgCO2e/L at point of combustion)
    _COMBUSTION_EF_PER_L = {
        "diesel":   2.010,   # 56100 kgCO2/TJ * 43e-3 TJ/Gg * 0.832e-3 Gg/L
        "electric": 0.000,   # zero direct; upstream emissions calculated separately
        "cng":      1.890,   # 56100 * 48e-3 * 0.000717e-3 — per litre equiv gas at STP
    }

    count = 0
    with open(VEHICLE_SPECS_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            make  = row.get("make", "").strip()
            model = row.get("model", "").strip()
            if not make or not model:
                continue

            vehicle_id = f"{make.upper()[:10]}_{model.upper()[:15]}".replace(" ", "_")
            fuel       = row.get("fuel_type", "diesel").strip().lower()
            payload_t  = _float_or_none(row.get("payload_t")) or 1.0
            laden_l    = _float_or_none(row.get("fuel_l_per_100km_laden")) or 0.0

            # Pre-compute EF at 100% load (kgCO2e per tonne-km)
            ef_per_tkm = None
            if laden_l > 0 and payload_t > 0:
                combustion_ef = _COMBUSTION_EF_PER_L.get(fuel, 2.010)
                # laden_l L/100km -> laden_l/100 L/km -> /payload_t L/(km·t)
                # * combustion_ef kgCO2/L = kgCO2/(km·t) = kgCO2/tonne-km
                ef_per_tkm = (laden_l / 100.0 / payload_t) * combustion_ef

            conn.execute("""
                INSERT OR REPLACE INTO vehicle_specs (
                    vehicle_id, make, model, category,
                    gvw_t, payload_t, fuel_type,
                    fuel_l_per_100km_laden, fuel_l_per_100km_empty,
                    axle_config, notes, source,
                    ef_kgco2e_per_tkm_full_load
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                vehicle_id, make, model,
                row.get("category", "").strip() or None,
                _float_or_none(row.get("gvw_t")),
                payload_t,
                fuel,
                laden_l if laden_l > 0 else None,
                _float_or_none(row.get("fuel_l_per_100km_empty")),
                row.get("axle_config", "").strip() or None,
                row.get("notes", "").strip() or None,
                row.get("source", "").strip() or None,
                round(ef_per_tkm, 6) if ef_per_tkm else None,
            ))
            count += 1

    conn.commit()
    print(f"  [OK] vehicle_specs_india: {count} rows -> vehicle_specs")
    return count


def _float_or_none(val) -> float | None:
    if val is None or str(val).strip() in ("", "nan", "None"):
        return None
    try:
        return float(str(val).strip())
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# Master ingestion function
# ---------------------------------------------------------------------------

def ingest_all_seeds(conn: sqlite3.Connection, force: bool = False) -> dict:
    """
    Load all seed files. Idempotent by default (INSERT OR IGNORE/REPLACE).

    Args:
        conn:  open sqlite3 connection (from db.setup_db())
        force: if True, re-run even if data already exists

    Returns:
        dict of {table: rows_inserted}
    """
    print("\n[INGEST] Starting seed data ingestion...")
    print(f"  Seeds directory: {SEEDS_DIR}")

    # Check if already seeded — only skip if ALL tables have data
    if not force:
        ef_rows = conn.execute("SELECT COUNT(*) FROM emission_factors").fetchone()[0]
        sprint3_tables = ["vehicle_specs", "airports", "major_ports", "aircraft_fuel_burn"]
        sprint3_empty = any(
            conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] == 0
            for t in sprint3_tables
        )
        if ef_rows > 0 and not sprint3_empty:
            print(f"  [INFO] All tables already seeded ({ef_rows} EFs). "
                  "Use --force to re-ingest.")
            return {"skipped": True, "existing_rows": ef_rows}
        elif ef_rows > 0 and sprint3_empty:
            # Core EFs are present but Sprint 3 tables are empty — seed them only
            print("  [INFO] Core EFs present. Seeding missing Sprint 3 tables...")
            results = {}
            results["vehicle_specs"] = ingest_vehicle_specs(conn)
            results["major_ports"]   = ingest_major_ports(conn)
            results["airports"]      = ingest_airports(conn)
            results["aircraft"]      = ingest_aircraft_fuel_burn(conn)
            total = sum(v for v in results.values() if isinstance(v, int))
            print(f"[INGEST] Sprint 3 tables seeded: {total} rows")
            return results

    results = {}
    results["ef_seed"] = ingest_ef_seed(conn)
    results["conversion_constants"] = ingest_conversion_constants(conn)
    results["ef_json_legacy"] = ingest_ef_json(conn)
    results["efdb_india"] = ingest_efdb_india(conn)
    results["cea_grid"] = ingest_cea_grid(conn)
    results["eeio"] = ingest_eeio(conn)
    results["defra_transport"] = ingest_generic_ef_csv(
        conn, DEFRA_TRANSPORT_CSV, "DEFRA 2024 transport EFs")
    results["upstream_fuel"] = ingest_generic_ef_csv(
        conn, UPSTREAM_FUEL_CSV, "Upstream fuel WTT EFs")
    results["vehicle_specs"] = ingest_vehicle_specs(conn)
    results["major_ports"]   = ingest_major_ports(conn)
    results["airports"]      = ingest_airports(conn)
    results["aircraft"]      = ingest_aircraft_fuel_burn(conn)
    results["sasb"]          = ingest_sasb_metrics(conn)

    total = sum(v for v in results.values() if isinstance(v, int))
    print(f"\n[INGEST] Complete. Total rows ingested: {total}")
    print(f"  Breakdown: {results}")
    return results


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def ingest_sasb_metrics(conn: sqlite3.Connection) -> int:
    """
    Ingest SASB Canonical Master CSV into sasb_metrics table.
    1,124 metrics across 11 sectors with primitive and outcome bindings.
    """
    csv_path = SEEDS_DIR / "sasb_canonical_master.csv"
    if not csv_path.exists():
        print(f"  [SKIP] SASB CSV not found: {csv_path}")
        return 0

    import csv as _csv
    rows_inserted = 0
    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        reader = _csv.DictReader(f)
        for row in reader:
            metric_id = (row.get("Metric ID") or "").strip()
            if not metric_id:
                continue
            # Normalise quant/qual field
            qq = (row.get("Quantitative / Qualitative") or "").strip()
            if "uanti" in qq:
                qq = "Quantitative"
            elif "iscussion" in qq or "nalysis" in qq:
                qq = "Discussion and Analysis"
            try:
                conn.execute("""
                    INSERT OR REPLACE INTO sasb_metrics
                    (metric_id, sector, industry, metric_name, metric_description,
                     quant_qual, unit, topic, topic_description,
                     primitive_bindings, outcome_bindings, binding_notes)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                """, (
                    metric_id,
                    (row.get("Sector") or "").strip(),
                    (row.get("Industry") or "").strip(),
                    (row.get("Metric Name") or "").strip(),
                    (row.get("Metric Description") or "").strip(),
                    qq,
                    (row.get("Unit") or "").strip(),
                    (row.get("Topic") or "").strip(),
                    (row.get("Topic Description") or "").strip(),
                    (row.get("Primitive Bindings") or "").strip(),
                    (row.get("Outcome Node Bindings") or "").strip(),
                    (row.get("Binding Notes") or "").strip(),
                ))
                rows_inserted += 1
            except Exception as e:
                print(f"  [WARN] SASB row {metric_id}: {e}")

    conn.commit()
    print(f"  [SASB] Ingested {rows_inserted} metrics")
    return rows_inserted

def _int_or_none(val) -> Optional[int]:
    if val is None or str(val).strip() in ("", "nan", "None"):
        return None
    try:
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return None


def _str_or_none(val) -> Optional[str]:
    if val is None or str(val).strip() in ("", "nan", "None"):
        return None
    return str(val).strip()


def _parse_efdb_unit(unit_str: str, gas: str) -> tuple[str, str]:
    """
    Parse EFDB unit string into (unit_numerator, unit_denominator).
    e.g. 'kg/cap/day' → ('kgCH4', 'cap/day')
         'g/m2'       → ('gCH4', 'm2')
         'TJ/kt'      → ('TJ', 'kt')
         'gCO2/MJ'    → ('gCO2', 'MJ')
         'fraction'   → ('fraction', '')
    """
    u = unit_str.strip()
    if "/" in u:
        parts = u.split("/", 1)
        num = parts[0].strip()
        den = parts[1].strip()
        # Add gas suffix to pure unit numerators
        if num.lower() in ("kg", "g", "mg", "t"):
            num = f"{num}{gas}"
        return num, den
    if u.lower() == "fraction":
        return "fraction", ""
    return u, ""


def _ipcc_cat_to_scope(ipcc_cat: str) -> str:
    """Map IPCC 2006 category to S1/S2/S3."""
    cat = ipcc_cat.strip()
    if cat.startswith("1.") or cat.startswith("2.") or cat.startswith("3.") or cat.startswith("4."):
        return "S1"
    if "scope 2" in cat.lower():
        return "S2"
    return "S1"  # EFDB is mostly S1


def _ipcc_cat_to_module(ipcc_cat: str) -> str:
    """Map IPCC 2006 category to module name."""
    cat = ipcc_cat.lower()
    if "1.a" in cat:
        return "stationary_combustion"
    if "1.b" in cat:
        return "fugitive_energy"
    if "1.a.3" in cat or "transport" in cat:
        return "mobile_combustion"
    if "2.a" in cat or "cement" in cat or "2.b" in cat or "chemical" in cat:
        return "ippu_process"
    if "3." in cat or "rice" in cat or "enteric" in cat or "manure" in cat:
        return "afolu"
    if "4." in cat or "waste" in cat or "landfill" in cat:
        return "waste_landfill"
    return "other"


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from ef_store.db import setup_db
    import sys

    db_path = sys.argv[1] if len(sys.argv) > 1 else "data/ef_store.sqlite"
    conn = setup_db(db_path)
    ingest_all_seeds(conn, force="--force" in sys.argv)
    conn.close()
