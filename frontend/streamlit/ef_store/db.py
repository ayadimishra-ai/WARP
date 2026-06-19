"""
sk.lite — EF Store: Database schema and setup.

Creates four SQLite tables:
  emission_factors      — sourced EFs from ef_seed_v0.1.0.csv + EFDB CSVs
  conversion_constants  — NCV and density values
  grid_ef               — CEA India grid EFs (10-year historical series)
  eeio_factors          — USEEIO sector-level spend-based EFs
  ef_update_log         — audit log for every EF change

Call setup_db(db_path) once on first run. It is idempotent.
"""

from __future__ import annotations
import sqlite3
from pathlib import Path

DB_VERSION = "1.0.0"

SCHEMA_SQL = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS db_meta (
    key   TEXT PRIMARY KEY,
    value TEXT
);

-- ------------------------------------------------------------
-- emission_factors
-- One row per (factor_id). Queried by selector.py.
-- preferred_rank: lower = more specific = preferred
--   1–9:    supplier or measured data
--   10–99:  national sourced (India-specific from EFDB)
--   100–499: regional (South Asia, ASEAN, EU, GCC)
--   500–899: continental
--   900–959: IPCC 2019 global default
--   950–990: IPCC 2006 global default
--   990–999: other global average (IEA, placeholder stubs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emission_factors (
    factor_id           TEXT PRIMARY KEY,
    factor_set_version  TEXT NOT NULL DEFAULT 'v0.1.0',
    scope               TEXT NOT NULL,          -- 'S1', 'S2', 'S3'
    module              TEXT NOT NULL,          -- module family key
    country             TEXT NOT NULL DEFAULT 'GLOBAL', -- ISO alpha-2 or 'GLOBAL'
    geography_level     TEXT NOT NULL DEFAULT 'global', -- 'national','regional','continental','global'
    year_start          INTEGER,
    year_end            INTEGER,
    fuel_item           TEXT,
    technology_process  TEXT,
    gas                 TEXT NOT NULL,          -- 'CO2','CH4','N2O','CO2e','HFC-134a', etc.
    factor_value        REAL NOT NULL,
    unit_numerator      TEXT NOT NULL,          -- e.g. 'kgCO2', 'tCO2', 'kgCO2e'
    unit_denominator    TEXT NOT NULL,          -- e.g. 'TJ', 'kWh', 'litre', 'km', 'USD'
    source_name         TEXT,
    preferred_rank      INTEGER NOT NULL DEFAULT 900,
    efdb_id             TEXT,
    ipcc_table_ref      TEXT,
    notes               TEXT,
    source_reference    TEXT,
    source_url          TEXT,
    ingested_at         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ef_lookup
    ON emission_factors (module, fuel_item, gas, country, preferred_rank);

CREATE INDEX IF NOT EXISTS idx_ef_scope
    ON emission_factors (scope, country);

-- ------------------------------------------------------------
-- conversion_constants
-- NCV and density values for unit conversion.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversion_constants (
    constant_id         TEXT PRIMARY KEY,
    factor_set_version  TEXT NOT NULL DEFAULT 'v0.1.0',
    constant_type       TEXT,                   -- 'NCV (energy content)', 'Density'
    fuel_item           TEXT NOT NULL,
    country             TEXT NOT NULL DEFAULT 'GLOBAL',
    year_start          INTEGER,
    year_end            INTEGER,
    property_name       TEXT NOT NULL,          -- 'ncv_tj_per_gg', 'NCV_TJ_per_kt', 'density_kg_per_litre'
    property_value      REAL NOT NULL,
    unit                TEXT NOT NULL,
    source_name         TEXT,
    efdb_id             TEXT,
    notes               TEXT,
    source_reference    TEXT,
    source_url          TEXT,
    ingested_at         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cc_lookup
    ON conversion_constants (fuel_item, country, property_name);

-- ------------------------------------------------------------
-- grid_ef
-- CEA India grid emission factors. Separate table because:
--   (a) they are published annually, not per IPCC update cycle
--   (b) four distinct EF types (weighted avg, OM, BM, CM)
--   (c) dual-reporting (location-based vs market-based) needs separate lookup
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grid_ef (
    factor_id               TEXT PRIMARY KEY,
    source                  TEXT NOT NULL,      -- 'CEA', 'eGRID', 'AIB_residual_mix'
    source_version          TEXT,               -- 'v20', 'v19', etc.
    geography_code          TEXT NOT NULL,      -- 'IN', 'US', 'EU', etc.
    grid_region             TEXT,               -- 'National', 'Southern', 'Western', etc.
    fiscal_year             TEXT NOT NULL,      -- '2023-24' — Indian fiscal year format
    calendar_year           INTEGER,            -- reporting calendar year equivalent
    method                  TEXT NOT NULL,      -- 'weighted_avg','om','bm','cm','location_based','market_based'
    ef_value_tco2_per_mwh   REAL NOT NULL,      -- tCO2/MWh
    ef_value_kgco2e_per_kwh REAL NOT NULL,      -- kgCO2e/kWh (= ef_value_tco2_per_mwh)
    notes                   TEXT,
    ingested_at             TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_grid_lookup
    ON grid_ef (geography_code, fiscal_year, method);

-- ------------------------------------------------------------
-- eeio_factors
-- USEEIO sector-level EFs for spend-based Cat 1/2/15 calculations.
-- Values: kg of gas per USD of sector output (Basic price, 2019).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eeio_factors (
    factor_id           TEXT PRIMARY KEY,
    source              TEXT NOT NULL,          -- 'USEEIO_v2_summary_exiobase_2019'
    sector_code         TEXT NOT NULL,          -- BEA sector code e.g. '111CA'
    sector_name         TEXT,
    flowable            TEXT NOT NULL,          -- 'Carbon dioxide','Methane','Nitrous oxide', etc.
    gas_canonical       TEXT,                   -- 'CO2','CH4','N2O','SF6'
    context             TEXT,                   -- 'emission/air'
    flow_uuid           TEXT,
    ef_value            REAL NOT NULL,          -- kg gas per USD
    ef_unit             TEXT NOT NULL DEFAULT 'kg/USD',
    ref_currency        TEXT NOT NULL DEFAULT 'USD',
    price_type          TEXT,                   -- 'Basic'
    base_io_level       TEXT,                   -- 'Summary', 'Detail'
    year                INTEGER NOT NULL DEFAULT 2019,
    geography_code      TEXT NOT NULL DEFAULT 'US',
    ingested_at         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_eeio_lookup
    ON eeio_factors (sector_code, gas_canonical, year, geography_code);

-- ------------------------------------------------------------
-- ef_update_log
-- Immutable audit log — every EF change is recorded here.
-- Changes are not applied until approved=1.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ef_update_log (
    log_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name      TEXT NOT NULL,              -- 'emission_factors','grid_ef','eeio_factors'
    factor_id       TEXT NOT NULL,
    field_changed   TEXT NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    changed_at      TEXT DEFAULT (datetime('now')),
    source_file     TEXT,
    change_reason   TEXT,
    applied         INTEGER NOT NULL DEFAULT 0  -- 0=pending, 1=approved
);

-- ------------------------------------------------------------
-- vehicle_specs
-- India commercial vehicle make/model specs for Cat 4/9 EF lookup.
-- EF is computed at ingest: fuel_per_km / payload_t * combustion_EF.
-- Users select make+model; load_factor adjusts per shipment.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_specs (
    vehicle_id                   TEXT PRIMARY KEY,
    make                         TEXT NOT NULL,
    model                        TEXT NOT NULL,
    category                     TEXT,          -- HCV, MCV, LCV, 3W
    gvw_t                        REAL,
    payload_t                    REAL,
    fuel_type                    TEXT,          -- diesel, electric, cng
    fuel_l_per_100km_laden       REAL,
    fuel_l_per_100km_empty       REAL,
    axle_config                  TEXT,
    notes                        TEXT,
    source                       TEXT,
    ef_kgco2e_per_tkm_full_load  REAL,         -- pre-computed at 100% load
    ingested_at                  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vehicle_lookup
    ON vehicle_specs (make, model, fuel_type);

-- ------------------------------------------------------------
-- major_ports
-- Port/city lat/lon for journey builder great circle distance.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS major_ports (
    unlocode    TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    country     TEXT,
    lat         REAL NOT NULL,
    lon         REAL NOT NULL,
    type        TEXT            -- 'sea', 'air', 'inland'
);

CREATE INDEX IF NOT EXISTS idx_ports_name ON major_ports (name);

-- ------------------------------------------------------------
-- airports
-- IATA airport codes with coordinates for flight distance.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS airports (
    iata    TEXT PRIMARY KEY,
    icao    TEXT,
    name    TEXT NOT NULL,
    city    TEXT,
    country TEXT,
    lat     REAL NOT NULL,
    lon     REAL NOT NULL
);

-- ------------------------------------------------------------
-- aircraft_fuel_burn
-- ICAO aircraft type codes with fuel burn kg/km.
-- Used for Cat 6 flight number → ICAO fuel method.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aircraft_fuel_burn (
    icao_code       TEXT PRIMARY KEY,
    iata_code       TEXT,
    name            TEXT,
    manufacturer    TEXT,
    fuel_kg_per_km  REAL NOT NULL,   -- kg jet fuel per km (great circle)
    seats_typical   INTEGER,         -- typical seat count for EF per-seat calc
    cargo_t_typical REAL,            -- cargo capacity (freighters)
    category        TEXT,            -- widebody_pax, narrowbody_pax, etc.
    notes           TEXT,
    source          TEXT
);

CREATE INDEX IF NOT EXISTS idx_aircraft_iata ON aircraft_fuel_burn (iata_code);

CREATE TABLE IF NOT EXISTS sasb_metrics (
    metric_id           TEXT PRIMARY KEY,
    sector              TEXT NOT NULL,
    industry            TEXT,
    metric_name         TEXT NOT NULL,
    metric_description  TEXT,
    quant_qual          TEXT,   -- 'Quantitative' | 'Discussion and Analysis'
    unit                TEXT,
    topic               TEXT,
    topic_description   TEXT,
    primitive_bindings  TEXT,   -- comma-separated codes: GE, EU, WA, WS, CL, ...
    outcome_bindings    TEXT,   -- comma-separated: E:CarbonLiability, R:BrandEquity, ...
    binding_notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_sasb_sector  ON sasb_metrics (sector);
CREATE INDEX IF NOT EXISTS idx_sasb_topic   ON sasb_metrics (topic);
CREATE INDEX IF NOT EXISTS idx_sasb_prims   ON sasb_metrics (primitive_bindings);
"""


def setup_db(db_path: str | Path) -> sqlite3.Connection:
    """
    Create all tables if they don't exist. Idempotent — safe to call repeatedly.

    Args:
        db_path: path to the SQLite file (will be created if missing)

    Returns:
        open sqlite3 connection
    """
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # check_same_thread=False: Streamlit renders pages in different threads.
    # setup_db is only called once at startup; get_ef_conn() in main.py opens
    # a fresh connection per render. This flag is safe because we never share
    # a single connection object across concurrent threads.
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA_SQL)

    # Record DB version
    conn.execute(
        "INSERT OR REPLACE INTO db_meta (key, value) VALUES ('db_version', ?)",
        (DB_VERSION,)
    )
    conn.execute(
        "INSERT OR REPLACE INTO db_meta (key, value) VALUES ('schema_created_at', datetime('now'))"
    )
    conn.commit()

    return conn


def get_conn(db_path: str | Path) -> sqlite3.Connection:
    """
    Open an existing DB. Raises FileNotFoundError if not initialised.

    Always call setup_db() on first run; use get_conn() thereafter.
    """
    db_path = Path(db_path)
    if not db_path.exists():
        raise FileNotFoundError(
            f"EF store not found at {db_path}. "
            "Run `python setup.py` or call setup_db() to initialise."
        )
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def db_summary(conn: sqlite3.Connection) -> dict:
    """Return row counts for all tables — used by setup.py health check."""
    tables = [
        "emission_factors", "conversion_constants", "grid_ef",
        "eeio_factors", "ef_update_log",
        # Sprint 3 additions
        "vehicle_specs", "major_ports", "airports", "aircraft_fuel_burn",
        # Sprint 11 addition
        "sasb_metrics",
    ]
    summary = {}
    for t in tables:
        try:
            row = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()
            summary[t] = row[0]
        except Exception:
            summary[t] = 0   # table may not exist in older DBs
    meta = conn.execute("SELECT key, value FROM db_meta").fetchall()
    summary["meta"] = {r["key"]: r["value"] for r in meta}
    return summary


def setup_vehicle_specs_table(conn: sqlite3.Connection) -> None:
    """Create vehicle_specs table for make/model EF lookup."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS vehicle_specs (
            vehicle_id       TEXT PRIMARY KEY,
            make             TEXT NOT NULL,
            model            TEXT NOT NULL,
            category         TEXT,          -- HCV, MCV, LCV, 3W
            gvw_t            REAL,          -- Gross Vehicle Weight (tonnes)
            payload_t        REAL,          -- Max payload (tonnes)
            fuel_type        TEXT,          -- diesel, electric, cng
            fuel_l_per_100km_laden  REAL,   -- Fuel consumption laden (L/100km or kWh/100km)
            fuel_l_per_100km_empty  REAL,   -- Fuel consumption empty
            axle_config      TEXT,          -- 4x2, 6x4, etc.
            notes            TEXT,
            source           TEXT,
            computed_ef_kgco2e_per_tkm REAL  -- Pre-computed EF at 100% load
        )
    """)
    conn.commit()
