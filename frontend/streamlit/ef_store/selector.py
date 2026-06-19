"""
sk.lite — EF Selector.

Queries the emission_factors, grid_ef, and eeio_factors tables using
the preferred_rank fallback ladder. Lower rank = more specific = preferred.

Every query records which fallback level was used so the audit trail is complete.
"""

from __future__ import annotations
import sqlite3
from dataclasses import dataclass
from typing import Optional


# ---------------------------------------------------------------------------
# Result dataclasses
# ---------------------------------------------------------------------------

@dataclass
class EFResult:
    """Result from emission_factors table lookup."""
    factor_id: str
    value: float
    unit_numerator: str
    unit_denominator: str
    source: str
    source_year: Optional[int]
    fallback_level: str       # 'national', 'regional', 'continental', 'global'
    fallback_triggered: bool
    preferred_rank: int
    geography_level: str
    notes: Optional[str] = None


@dataclass
class GridEFResult:
    """Result from grid_ef table lookup."""
    factor_id: str
    ef_value_kgco2e_per_kwh: float
    ef_value_tco2_per_mwh: float
    fiscal_year_used: str
    source: str
    method: str
    exact_year_match: bool
    notes: Optional[str] = None


@dataclass
class EEIOResult:
    """Result from eeio_factors table lookup."""
    factor_id: str
    sector_code: str
    gas_canonical: str
    ef_value: float          # kg gas per USD
    year: int
    geography_code: str
    source: str


class MissingEFError(Exception):
    """Raised when no EF found at any fallback level."""
    def __init__(self, module, fuel_item, gas, country):
        super().__init__(
            f"No EF found: module={module}, fuel={fuel_item}, "
            f"gas={gas}, country={country}"
        )
        self.module = module
        self.fuel_item = fuel_item
        self.gas = gas
        self.country = country


# ---------------------------------------------------------------------------
# Main EF lookup
# ---------------------------------------------------------------------------

def get_ef(
    conn: sqlite3.Connection,
    module: str,
    fuel_item: Optional[str],
    gas: str,
    country: str,
    year: Optional[int] = None,
    technology_process: Optional[str] = None,
) -> EFResult:
    """
    Query emission_factors for the best available EF.

    Fallback order encoded in preferred_rank (lower = better):
      1–9:    supplier-specific
      10–99:  national (country-specific EFDB rows)
      100–499: regional (ASEAN, GCC, EU subregions)
      500–899: continental
      900–959: IPCC 2019 global default
      950–990: IPCC 2006 global default
      990–999: other global average / placeholder

    Automatically falls through country → GLOBAL if no country-specific row.

    Args:
        conn:               sqlite3 connection
        module:             module key ('stationary_combustion', 'mobile_combustion', etc.)
        fuel_item:          fuel/item key (may be None for some S3 lookups)
        gas:                gas name ('CO2', 'CH4', 'N2O', 'CO2e')
        country:            ISO alpha-2 or 'GLOBAL'
        year:               reporting year (for year-matched lookup)
        technology_process: optional tech/process sub-key

    Returns:
        EFResult

    Raises:
        MissingEFError if no row found
    """
    cur = conn.cursor()

    # Build query — try country-specific first, then GLOBAL
    # Country IN (country, 'GLOBAL') with ORDER BY preferred_rank ensures
    # the most specific match wins without needing multiple queries.
    conditions = ["module = ?", "gas = ?", "country IN (?, 'GLOBAL')"]
    params: list = [module, gas, country]

    if fuel_item:
        # When caller specifies a fuel, require exact match.
        # NULL-fuel EFDB rows (generic process EFs without a fuel tag) must NOT
        # substitute for a specific fuel — that produces wrong results.
        conditions.append("fuel_item = ?")
        params.append(fuel_item)
    # Note: when fuel_item is None (caller doesn't know fuel), allow NULL-fuel rows.

    if technology_process:
        conditions.append("(technology_process = ? OR technology_process IS NULL)")
        params.append(technology_process)

    if year:
        conditions.append(
            "(year_start IS NULL OR year_start <= ?) "
            "AND (year_end IS NULL OR year_end >= ?)"
        )
        params.extend([year, year])

    where = " AND ".join(conditions)
    sql = f"""
        SELECT factor_id, factor_value, unit_numerator, unit_denominator,
               source_name, year_start, geography_level, preferred_rank, notes
        FROM emission_factors
        WHERE {where}
        ORDER BY
            CASE country WHEN ? THEN 0 ELSE 1 END,  -- national before global
            preferred_rank ASC
        LIMIT 1
    """
    params.append(country)  # for the CASE in ORDER BY

    row = cur.execute(sql, params).fetchone()

    if row is None:
        raise MissingEFError(module, fuel_item, gas, country)

    geo_level = row["geography_level"] or "global"
    fallback_triggered = (country != "GLOBAL" and geo_level == "global")

    return EFResult(
        factor_id=row["factor_id"],
        value=row["factor_value"],
        unit_numerator=row["unit_numerator"],
        unit_denominator=row["unit_denominator"],
        source=row["source_name"] or "",
        source_year=row["year_start"],
        fallback_level=geo_level,
        fallback_triggered=fallback_triggered,
        preferred_rank=row["preferred_rank"],
        geography_level=geo_level,
        notes=row["notes"],
    )


def get_ef_all_gases(
    conn: sqlite3.Connection,
    module: str,
    fuel_item: Optional[str],
    country: str,
    year: Optional[int] = None,
    technology_process: Optional[str] = None,
) -> dict[str, EFResult]:
    """
    Fetch EFs for CO2, CH4, and N2O in one call.
    Returns dict keyed by gas name. Missing gases are omitted (not all
    fuel/process combinations have CH4 and N2O factors).
    """
    results = {}
    for gas in ("CO2", "CH4", "N2O"):
        try:
            results[gas] = get_ef(
                conn, module, fuel_item, gas, country, year, technology_process
            )
        except MissingEFError:
            pass  # Not all gases have EFs for every fuel — that's normal
    return results


# ---------------------------------------------------------------------------
# Grid EF lookup (Scope 2)
# ---------------------------------------------------------------------------

def get_grid_ef(
    conn: sqlite3.Connection,
    country: str,
    fiscal_year: Optional[str] = None,
    calendar_year: Optional[int] = None,
    method: str = "weighted_avg",
    max_year_gap: int = 5,
) -> GridEFResult:
    """
    Query grid_ef for Scope 2 electricity emission factor.

    Args:
        conn:          sqlite3 connection
        country:       ISO alpha-2 ('IN', 'US', etc.)
        fiscal_year:   e.g. '2023-24' (preferred for India)
        calendar_year: fallback if fiscal_year not provided
        method:        'weighted_avg' | 'om' | 'bm' | 'cm' | 'location_based'
        max_year_gap:  max years to look back if exact year not found

    Returns:
        GridEFResult

    Raises:
        MissingEFError if no grid EF found
    """
    cur = conn.cursor()

    # Try exact fiscal year match
    if fiscal_year:
        row = cur.execute(
            """SELECT factor_id, ef_value_kgco2e_per_kwh, ef_value_tco2_per_mwh,
                      fiscal_year, source, source_version, method, notes
               FROM grid_ef
               WHERE geography_code = ? AND method = ? AND fiscal_year = ?
               LIMIT 1""",
            (country, method, fiscal_year)
        ).fetchone()
        if row:
            return _grid_row_to_result(row, exact=True)

    # Try calendar year match (nearest within max_year_gap)
    if calendar_year:
        row = cur.execute(
            """SELECT factor_id, ef_value_kgco2e_per_kwh, ef_value_tco2_per_mwh,
                      fiscal_year, calendar_year, source, source_version, method, notes
               FROM grid_ef
               WHERE geography_code = ? AND method = ?
                 AND calendar_year BETWEEN ? AND ?
               ORDER BY calendar_year DESC
               LIMIT 1""",
            (country, method, calendar_year - max_year_gap, calendar_year)
        ).fetchone()
        if row:
            return _grid_row_to_result(row, exact=(dict(row).get("calendar_year") == calendar_year))

    # Fall back to most recent available for that country
    row = cur.execute(
        """SELECT factor_id, ef_value_kgco2e_per_kwh, ef_value_tco2_per_mwh,
                  fiscal_year, source, source_version, method, notes
           FROM grid_ef
           WHERE geography_code = ? AND method = ?
           ORDER BY fiscal_year DESC
           LIMIT 1""",
        (country, method)
    ).fetchone()

    if row:
        return _grid_row_to_result(row, exact=False)

    # Fall through to emission_factors table (for non-India countries seeded from legacy JSON)
    try:
        ef = get_ef(conn, "purchased_electricity", "grid_electricity", "CO2e", country, calendar_year)
        return GridEFResult(
            factor_id=ef.factor_id,
            ef_value_kgco2e_per_kwh=ef.value,
            ef_value_tco2_per_mwh=ef.value,
            fiscal_year_used=str(calendar_year or "unknown"),
            source=ef.source,
            method=method,
            exact_year_match=False,
            notes=f"Sourced from emission_factors table (no grid_ef row). Fallback={ef.fallback_level}",
        )
    except MissingEFError:
        pass

    raise MissingEFError("grid_ef", "grid_electricity", "CO2e", country)


def _grid_row_to_result(row, exact: bool) -> GridEFResult:
    r = dict(row)
    return GridEFResult(
        factor_id=r["factor_id"],
        ef_value_kgco2e_per_kwh=r["ef_value_kgco2e_per_kwh"],
        ef_value_tco2_per_mwh=r["ef_value_tco2_per_mwh"],
        fiscal_year_used=r["fiscal_year"],
        source=f"{r['source']} {r.get('source_version', '')}".strip(),
        method=r["method"],
        exact_year_match=exact,
        notes=r.get("notes"),
    )


# ---------------------------------------------------------------------------
# EEIO lookup (Scope 3 spend-based)
# ---------------------------------------------------------------------------

def get_eeio_ef(
    conn: sqlite3.Connection,
    sector_code: str,
    gas_canonical: str = "CO2",
    year: int = 2019,
    geography: str = "US",
    base_io_level: str = "Summary",
) -> EEIOResult:
    """
    Query eeio_factors for spend-based emission factor.

    Args:
        conn:          sqlite3 connection
        sector_code:   BEA sector code (e.g. '111CA', '5415', '336111')
        gas_canonical: 'CO2', 'CH4', 'N2O', 'CO2e_combined'
        year:          base year (default 2019)
        geography:     'US' (default; 'EU' when Exiobase loaded)
        base_io_level: 'Summary' or 'Detail'

    Returns:
        EEIOResult

    Raises:
        MissingEFError if sector not found
    """
    cur = conn.cursor()

    # Exact match first
    row = cur.execute(
        """SELECT factor_id, sector_code, gas_canonical, ef_value, year,
                  geography_code, source
           FROM eeio_factors
           WHERE sector_code = ?
             AND gas_canonical = ?
             AND year = ?
             AND geography_code = ?
             AND (base_io_level = ? OR base_io_level IS NULL)
           LIMIT 1""",
        (sector_code, gas_canonical, year, geography, base_io_level)
    ).fetchone()

    if row:
        return EEIOResult(
            factor_id=row["factor_id"],
            sector_code=row["sector_code"],
            gas_canonical=row["gas_canonical"],
            ef_value=row["ef_value"],
            year=row["year"],
            geography_code=row["geography_code"],
            source=row["source"],
        )

    raise MissingEFError(
        "eeio", sector_code, gas_canonical, geography
    )


def get_eeio_co2e(
    conn: sqlite3.Connection,
    sector_code: str,
    year: int = 2019,
    geography: str = "US",
    gwp_ar: int = 6,
) -> tuple[float, dict]:
    """
    Get combined CO2e EEIO factor for a sector, applying GWP to CH4 and N2O.

    Returns:
        (kg_co2e_per_usd, breakdown_dict)
    """
    from core.gwp import rollup_co2e

    gases = {"CO2": 0.0, "CH4": 0.0, "N2O": 0.0}
    sources = {}

    for gas in ("CO2", "CH4", "N2O"):
        try:
            result = get_eeio_ef(conn, sector_code, gas, year, geography)
            gases[gas] = result.ef_value
            sources[gas] = result.factor_id
        except MissingEFError:
            pass

    # GWP weighting: CO2 is 1, CH4 and N2O need GWP conversion
    from core.gwp import GWP_TABLES
    t = GWP_TABLES[gwp_ar]
    total = (
        gases["CO2"] * t["CO2"]
        + gases["CH4"] * t["CH4_fossil"]
        + gases["N2O"] * t["N2O"]
    )

    return total, {"gas_factors": gases, "sources": sources, "gwp_ar": gwp_ar}


# ---------------------------------------------------------------------------
# Conversion constant lookup
# ---------------------------------------------------------------------------

def get_conversion_constant(
    conn: sqlite3.Connection,
    fuel_item: str,
    property_name: str,
    country: str = "GLOBAL",
) -> Optional[float]:
    """
    Fetch a single conversion constant (NCV or density).
    Country-specific preferred over GLOBAL.
    Returns None if not found (caller should use hardcoded defaults).
    """
    cur = conn.cursor()
    row = cur.execute(
        """SELECT property_value FROM conversion_constants
           WHERE fuel_item = ?
             AND property_name = ?
             AND country IN (?, 'GLOBAL')
           ORDER BY CASE country WHEN ? THEN 0 ELSE 1 END
           LIMIT 1""",
        (fuel_item, property_name, country, country)
    ).fetchone()
    return float(row[0]) if row else None
