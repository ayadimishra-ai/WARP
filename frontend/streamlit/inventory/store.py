"""
sk.lite — Inventory Store (SQLite-only).

WHY NOT DuckDB:
  DuckDB does not support INSERT OR REPLACE / INSERT OR IGNORE.
  It requires MERGE INTO or INSERT INTO ... ON CONFLICT DO UPDATE,
  which varies by DuckDB version and is not available in all builds.
  At this tool's data volumes (<100k rows), SQLite GROUP BY / SUM queries
  run in milliseconds — DuckDB adds no measurable benefit.
  SQLite ships with Python — zero extra dependency.

THREAD SAFETY:
  Each InventoryStore opens its own sqlite3 connection with
  check_same_thread=False. main.py calls get_store() fresh on every
  Streamlit page render, so no connection object is ever shared between
  concurrent render threads.
"""

from __future__ import annotations
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from modules.base import ActivityRecord, EmissionResult

# pandas imported lazily in to_dataframe() only — avoids 1s startup cost

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

DEFAULT_PATH = Path(__file__).parents[1] / "data" / "inventory.sqlite"

# ---------------------------------------------------------------------------
# Schema  (SQLite-only — no DuckDB types)
# ---------------------------------------------------------------------------

SCHEMA_SQL = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS emission_results (
    record_id           TEXT PRIMARY KEY,
    org_id              TEXT NOT NULL DEFAULT 'default',
    inventory_year      INTEGER NOT NULL,
    locked              INTEGER NOT NULL DEFAULT 0,

    scope               TEXT NOT NULL,
    category            TEXT,
    process             TEXT NOT NULL,
    method_variant      TEXT,
    country             TEXT,
    fuel_or_item        TEXT,
    quantity            REAL,
    unit                TEXT,
    reporting_year      INTEGER,
    fiscal_year         TEXT,
    source_file         TEXT,
    data_quality        TEXT,

    -- Organisational tagging (Sprint 21)
    site                TEXT,           -- facility / plant / office name
    department          TEXT,           -- business unit / department
    cost_centre         TEXT,           -- cost centre code
    tags                TEXT,           -- comma-separated free-text tags
    supplier_name       TEXT,           -- linked supplier (Sprint 25)

    kg_CO2              REAL NOT NULL DEFAULT 0,
    kg_CH4              REAL NOT NULL DEFAULT 0,
    kg_N2O              REAL NOT NULL DEFAULT 0,
    kg_CO2e             REAL NOT NULL DEFAULT 0,
    kg_CO2_biogenic     REAL NOT NULL DEFAULT 0,
    t_CO2e              REAL NOT NULL DEFAULT 0,

    gwp_ar_used         INTEGER,
    factor_id_used      TEXT,
    ef_value_used       REAL,
    ef_unit             TEXT,
    ef_source           TEXT,
    ef_source_year      INTEGER,

    fallback_level      TEXT,
    fallback_triggered  INTEGER NOT NULL DEFAULT 0,
    confidence          TEXT,
    calculation_engine  TEXT,
    audit_trace_json    TEXT,
    created_at          TEXT,
    updated_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_inv_org_year
    ON emission_results (org_id, inventory_year);

CREATE INDEX IF NOT EXISTS idx_inv_scope
    ON emission_results (org_id, inventory_year, scope);

CREATE TABLE IF NOT EXISTS inventory_snapshots (
    snapshot_id         TEXT PRIMARY KEY,
    org_id              TEXT NOT NULL,
    inventory_year      INTEGER NOT NULL,
    locked_at           TEXT NOT NULL,
    locked_by           TEXT,
    total_t_co2e        REAL,
    scope1_t_co2e       REAL,
    scope2_t_co2e       REAL,
    scope3_t_co2e       REAL,
    notes               TEXT
);
"""

_COLS = 40  # total columns in emission_results (Sprint 25: +supplier_name)

# ---------------------------------------------------------------------------
# InventoryStore
# ---------------------------------------------------------------------------

class InventoryStore:
    """SQLite inventory store. One instance per Streamlit render."""

    def __init__(
        self,
        path: Path | str | None = None,
        org_id: str = "default",
    ):
        self.org_id = org_id
        self.path = str(Path(path) if path else DEFAULT_PATH)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)

        # timeout=30s: wait for other processes instead of failing instantly (Windows)
        self._db = sqlite3.connect(self.path, check_same_thread=False, timeout=30.0)
        self._db.row_factory = sqlite3.Row
        # busy_timeout: SQLite-level wait on lock contention
        try:
            self._db.execute("PRAGMA busy_timeout=30000")
        except sqlite3.OperationalError:
            pass
        # Only attempt journal mode switch if needed; ignore lock errors
        try:
            cur_mode = self._db.execute("PRAGMA journal_mode").fetchone()
            if cur_mode and str(cur_mode[0]).lower() != "delete":
                self._db.execute("PRAGMA journal_mode=DELETE")
        except sqlite3.OperationalError:
            pass  # locked by another connection — use whatever mode is active

        # Only run schema creation if the table doesn't exist yet
        _tbl_exists = self._db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='emission_results'"
        ).fetchone()
        if not _tbl_exists:
            self._db.executescript(SCHEMA_SQL)
            self._db.commit()

        self._migrate()  # idempotent schema migrations for existing DBs

    def _migrate(self) -> None:
        """Add new columns to existing DBs that predate the current schema."""
        existing = {row[1] for row in
                    self._db.execute("PRAGMA table_info(emission_results)").fetchall()}
        new_cols = [
            ("site",          "TEXT"),
            ("department",    "TEXT"),
            ("cost_centre",   "TEXT"),
            ("tags",          "TEXT"),
            ("supplier_name", "TEXT"),
            ("buyer_name",    "TEXT"),
        ]
        for col, dtype in new_cols:
            if col not in existing:
                self._db.execute(
                    f"ALTER TABLE emission_results ADD COLUMN {col} {dtype}"
                )
        # Create site index after ensuring column exists
        try:
            self._db.execute(
                "CREATE INDEX IF NOT EXISTS idx_inv_site "
                "ON emission_results (org_id, site)"
            )
        except Exception:
            pass
        self._db.commit()

    def find_duplicate(
        self,
        record: "ActivityRecord",
        inventory_year: Optional[int] = None,
    ) -> Optional[str]:
        """
        Return record_id of an existing record with identical
        scope/process/fuel_or_item/quantity/unit/country/year, or None.
        Used to warn users before saving duplicates.
        """
        inv_year = inventory_year or record.reporting_year
        row = self._db.execute(
            """
            SELECT record_id FROM emission_results
            WHERE org_id=? AND inventory_year=? AND locked=0
              AND scope=? AND process=? AND fuel_or_item=?
              AND ABS(quantity - ?) < 0.0001
              AND unit=? AND country=?
            LIMIT 1
            """,
            (
                record.org_id or self.org_id,
                inv_year,
                record.scope or "",
                record.process or "",
                record.fuel_or_item or "",
                float(record.quantity or 0),
                record.unit or "",
                record.country or "",
            ),
        ).fetchone()
        return row[0] if row else None

    def persist(
        self,
        result: EmissionResult,
        record: ActivityRecord,
        inventory_year: Optional[int] = None,
    ) -> None:
        """Upsert one result. INSERT OR REPLACE is safe SQLite upsert."""
        inv_year = inventory_year or record.reporting_year
        now = datetime.now(timezone.utc).isoformat()
        audit_json = json.dumps(result.audit_trace, default=str)

        self._db.execute(
            """
            INSERT OR REPLACE INTO emission_results (
                record_id, org_id, inventory_year, locked,
                scope, category, process, method_variant,
                country, fuel_or_item, quantity, unit,
                reporting_year, fiscal_year, source_file, data_quality,
                site, department, cost_centre, tags, supplier_name, buyer_name,
                kg_CO2, kg_CH4, kg_N2O, kg_CO2e, kg_CO2_biogenic, t_CO2e,
                gwp_ar_used, factor_id_used, ef_value_used,
                ef_unit, ef_source, ef_source_year,
                fallback_level, fallback_triggered, confidence,
                calculation_engine, audit_trace_json,
                created_at, updated_at
            ) VALUES (
                ?,?,?,?,  ?,?,?,?,  ?,?,?,?,  ?,?,?,?,
                ?,?,?,?,?,?,
                ?,?,?,?,?,?,  ?,?,?,  ?,?,?,  ?,?,?,  ?,?,  ?,?
            )
            """,
            (
                result.record_id,
                record.org_id or self.org_id,
                inv_year,
                0,                                      # locked=False
                record.scope or "",
                record.category,
                record.process or "",
                record.method_variant,
                record.country,
                record.fuel_or_item,
                record.quantity,
                record.unit,
                record.reporting_year,
                record.fiscal_year,
                record.source_file,
                record.data_quality,
                # Organisational tags (Sprint 21)
                record.extra.get("site") if record.extra else None,
                record.extra.get("department") if record.extra else None,
                record.extra.get("cost_centre") if record.extra else None,
                record.extra.get("tags") if record.extra else None,
                # Supplier linkage (Sprint 25) - upstream
                record.extra.get("supplier_name") if record.extra else None,
                # Buyer linkage - downstream
                record.extra.get("buyer_name") if record.extra else None,
                float(result.kg_CO2),
                float(result.kg_CH4),
                float(result.kg_N2O),
                float(result.kg_CO2e),
                float(result.kg_CO2_biogenic),
                float(result.kg_CO2e) / 1000.0,         # t_CO2e
                result.gwp_ar_used,
                result.factor_id_used,
                result.ef_value_used,
                result.ef_unit,
                result.ef_source,
                result.ef_source_year,
                result.fallback_level,
                1 if result.fallback_triggered else 0,  # bool→int
                result.confidence,
                result.calculation_engine,
                audit_json,
                now,
                now,
            ),
        )
        self._db.commit()

    def persist_batch(
        self,
        results: list,
        records: list[ActivityRecord],
        inventory_year: Optional[int] = None,
        tags: Optional[dict] = None,
    ) -> int:
        """Persist a list of results. Skips error dicts. Returns count written.

        Args:
            tags: optional dict with site/department/cost_centre keys to inject
                  into every record's extra before persisting.
        """
        import dataclasses
        count = 0
        for result, record in zip(results, records):
            if isinstance(result, EmissionResult):
                if tags:
                    extra = dict(record.extra or {})
                    extra.update({k: v for k, v in tags.items() if v})
                    record = dataclasses.replace(record, extra=extra)
                self.persist(result, record, inventory_year)
                count += 1
        return count

    def delete_record(self, record_id: str) -> bool:
        self._db.execute(
            "DELETE FROM emission_results WHERE record_id = ? AND locked = 0",
            (record_id,),
        )
        self._db.commit()
        return True

    def delete_many(self, record_ids: list[str]) -> int:
        """Delete multiple unlocked records. Returns count deleted."""
        placeholders = ",".join("?" * len(record_ids))
        cur = self._db.execute(
            f"DELETE FROM emission_results WHERE record_id IN ({placeholders}) AND locked = 0",
            record_ids,
        )
        self._db.commit()
        return cur.rowcount

    def get_all_records(
        self,
        org_id: Optional[str] = None,
        inventory_year: Optional[int] = None,
        scope: Optional[str] = None,
    ) -> list[dict]:
        """Return every individual emission record as a list of dicts."""
        org = org_id or self.org_id
        where, params = ["org_id = ?"], [org]
        if inventory_year:
            where.append("inventory_year = ?")
            params.append(inventory_year)
        if scope:
            where.append("scope = ?")
            params.append(scope)
        w = " AND ".join(where)
        rows = self._db.execute(
            f"""
            SELECT record_id, scope, category, process, country,
                   fuel_or_item, quantity, unit, inventory_year, reporting_year,
                   t_CO2e, kg_CO2, kg_CH4, kg_N2O,
                   factor_id_used, ef_source, fallback_level,
                   fallback_triggered, confidence, locked, created_at,
                   site, department, cost_centre, tags, supplier_name, buyer_name,
                   ef_unit, ef_source_year, updated_at
            FROM emission_results WHERE {w}
            ORDER BY scope, process, created_at DESC
            """,
            params,
        ).fetchall()
        return [dict(r) for r in rows]

    def update_quantity(
        self,
        record_id: str,
        new_quantity: float,
        conn_ef,
    ) -> bool:
        """
        Recalculate a record with a new quantity and replace it.
        Requires the EF store connection to re-run the calculation.
        Returns True on success.
        """
        # Fetch the existing record
        row = self._db.execute(
            "SELECT * FROM emission_results WHERE record_id = ? AND locked = 0",
            (record_id,),
        ).fetchone()
        if row is None:
            return False
        r = dict(row)

        # Reconstruct ActivityRecord
        from modules.base import ActivityRecord
        from core.engine import calculate
        rec = ActivityRecord(
            record_id=record_id,
            scope=r["scope"],
            process=r["process"],
            country=r["country"] or "IN",
            quantity=new_quantity,
            unit=r["unit"],
            fuel_or_item=r["fuel_or_item"],
            reporting_year=r["reporting_year"],
            gwp_ar=r["gwp_ar_used"] or 6,
            org_id=r["org_id"],
            fiscal_year=r.get("fiscal_year"),
        )
        result = calculate(rec, conn_ef)
        self.persist(result, rec, inventory_year=r["inventory_year"])
        return True

    def lock_inventory(
        self,
        inventory_year: int,
        org_id: Optional[str] = None,
        locked_by: str = "user",
        notes: str = "",
    ) -> dict:
        org = org_id or self.org_id
        summary = self.get_summary(org_id=org, inventory_year=inventory_year)
        self._db.execute(
            "UPDATE emission_results SET locked=1 WHERE org_id=? AND inventory_year=?",
            (org, inventory_year),
        )
        snap_id = str(uuid.uuid4())
        self._db.execute(
            "INSERT INTO inventory_snapshots VALUES (?,?,?,?,?,?,?,?,?,?)",
            (snap_id, org, inventory_year, datetime.now(timezone.utc).isoformat(),
             locked_by, summary.get("total_t_co2e"), summary.get("scope1_t_co2e"),
             summary.get("scope2_t_co2e"), summary.get("scope3_t_co2e"), notes),
        )
        self._db.commit()
        return {"snapshot_id": snap_id, **summary}

    # ── Read / aggregation ───────────────────────────────────────────────

    def get_summary(
        self,
        org_id: Optional[str] = None,
        inventory_year: Optional[int] = None,
    ) -> dict:
        org = org_id or self.org_id
        # Always filter by org. Filter by year when provided.
        # Note: do NOT filter locked here — summary should show all records
        # including locked ones so the dashboard reflects the full picture.
        where, params = ["org_id = ?"], [org]
        if inventory_year:
            where.append("inventory_year = ?")
            params.append(inventory_year)
        w = " AND ".join(where)

        r = self._db.execute(
            f"""
            SELECT
                COUNT(*)                                           AS n,
                COALESCE(SUM(t_CO2e), 0)                          AS total,
                COALESCE(SUM(CASE WHEN scope='Scope 1' THEN t_CO2e ELSE 0 END), 0) AS s1,
                COALESCE(SUM(CASE WHEN scope='Scope 2' THEN t_CO2e ELSE 0 END), 0) AS s2,
                COALESCE(SUM(CASE WHEN scope='Scope 3' THEN t_CO2e ELSE 0 END), 0) AS s3,
                COALESCE(SUM(kg_CO2_biogenic), 0) / 1000          AS bio,
                COUNT(CASE WHEN fallback_triggered = 1 THEN 1 END) AS nfb
            FROM emission_results WHERE {w}
            """,
            params,
        ).fetchone()

        if r is None:
            return {}
        return {
            "n_records":          int(r[0] or 0),
            "total_t_co2e":       round(float(r[1] or 0), 4),
            "scope1_t_co2e":      round(float(r[2] or 0), 4),
            "scope2_t_co2e":      round(float(r[3] or 0), 4),
            "scope3_t_co2e":      round(float(r[4] or 0), 4),
            "biogenic_t_co2":     round(float(r[5] or 0), 4),
            "n_fallback_records": int(r[6] or 0),
        }

    def get_by_category(
        self,
        org_id: Optional[str] = None,
        inventory_year: Optional[int] = None,
    ) -> list[dict]:
        org = org_id or self.org_id
        where, params = ["org_id = ?"], [org]
        if inventory_year:
            where.append("inventory_year = ?")
            params.append(inventory_year)
        w = " AND ".join(where)

        rows = self._db.execute(
            f"""
            SELECT scope,
                   COALESCE(category, process)    AS cat,
                   COUNT(*)                       AS n,
                   COALESCE(SUM(t_CO2e),  0)      AS t_co2e,
                   COALESCE(SUM(kg_CO2),  0)/1000 AS t_co2,
                   COALESCE(SUM(kg_CH4),  0)/1000 AS t_ch4,
                   COALESCE(SUM(kg_N2O),  0)/1000 AS t_n2o
            FROM emission_results WHERE {w}
            GROUP BY scope, cat
            ORDER BY scope, t_co2e DESC
            """,
            params,
        ).fetchall()

        return [
            {
                "scope":     r[0], "category": r[1], "n_records": int(r[2]),
                "t_CO2e":    round(float(r[3] or 0), 4),
                "t_CO2":     round(float(r[4] or 0), 4),
                "t_CH4":     round(float(r[5] or 0), 4),
                "t_N2O":     round(float(r[6] or 0), 4),
            }
            for r in rows
        ]

    def get_by_process(
        self,
        org_id: Optional[str] = None,
        inventory_year: Optional[int] = None,
    ) -> list[dict]:
        org = org_id or self.org_id
        where, params = ["org_id = ?"], [org]
        if inventory_year:
            where.append("inventory_year = ?")
            params.append(inventory_year)
        w = " AND ".join(where)

        rows = self._db.execute(
            f"""
            SELECT scope, process, fuel_or_item, country,
                   COUNT(*)                   AS n,
                   COALESCE(SUM(t_CO2e), 0)  AS t_co2e,
                   COALESCE(AVG(t_CO2e), 0)  AS avg,
                   MAX(fallback_level)        AS worst,
                   MAX(ef_source)             AS ef_source,
                   SUM(CASE WHEN fallback_triggered THEN 1 ELSE 0 END) AS n_fallback
            FROM emission_results WHERE {w}
            GROUP BY scope, process, fuel_or_item, country
            ORDER BY t_co2e DESC
            """,
            params,
        ).fetchall()

        return [
            {
                "scope": r[0], "process": r[1], "fuel_or_item": r[2],
                "country": r[3], "n_records": int(r[4]),
                "t_CO2e": round(float(r[5] or 0), 4),
                "avg_t_CO2e": round(float(r[6] or 0), 4),
                "worst_fallback": r[7],
                "ef_source": r[8] or "",
                "n_fallback": int(r[9] or 0),
            }
            for r in rows
        ]

    def get_fallback_report(
        self,
        org_id: Optional[str] = None,
        inventory_year: Optional[int] = None,
    ) -> list[dict]:
        org = org_id or self.org_id
        where, params = ["org_id = ?", "fallback_triggered = 1"], [org]
        if inventory_year:
            where.append("inventory_year = ?")
            params.append(inventory_year)
        w = " AND ".join(where)

        rows = self._db.execute(
            f"""
            SELECT record_id, scope, process, country, fuel_or_item,
                   t_CO2e, fallback_level, ef_source, factor_id_used
            FROM emission_results WHERE {w}
            ORDER BY fallback_level, t_CO2e DESC
            """,
            params,
        ).fetchall()

        return [
            {
                "record_id": r[0], "scope": r[1], "process": r[2],
                "country": r[3], "fuel_or_item": r[4],
                "t_CO2e": round(float(r[5] or 0), 4),
                "fallback_level": r[6], "ef_source": r[7], "factor_id": r[8],
            }
            for r in rows
        ]

    def to_dataframe(
        self,
        org_id: Optional[str] = None,
        inventory_year: Optional[int] = None,
    ):
        try:
            import pandas as pd
        except ImportError:
            raise ImportError("pandas required for to_dataframe()")
        org = org_id or self.org_id
        where, params = ["org_id = ?"], [org]
        if inventory_year:
            where.append("inventory_year = ?")
            params.append(inventory_year)
        w = " AND ".join(where)
        sql = f"""
            SELECT record_id, scope, category, process, country, fuel_or_item,
                   quantity, unit, reporting_year, kg_CO2, kg_CH4, kg_N2O,
                   kg_CO2e, kg_CO2_biogenic, t_CO2e, gwp_ar_used,
                   factor_id_used, ef_source, fallback_level, confidence, created_at
            FROM emission_results WHERE {w} ORDER BY scope, category, process
        """
        return pd.read_sql_query(sql, self._db, params=params)

    def get_snapshots(
        self,
        org_id: Optional[str] = None,
    ) -> list[dict]:
        """Return all locked inventory snapshots for this org."""
        org = org_id or self.org_id
        rows = self._db.execute(
            """
            SELECT snapshot_id, inventory_year, locked_at, locked_by,
                   total_t_co2e, scope1_t_co2e, scope2_t_co2e, scope3_t_co2e, notes
            FROM inventory_snapshots
            WHERE org_id = ?
            ORDER BY inventory_year DESC, locked_at DESC
            """,
            (org,),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_available_years(
        self,
        org_id: Optional[str] = None,
    ) -> list[int]:
        """Return all inventory years that have at least one record."""
        org = org_id or self.org_id
        rows = self._db.execute(
            "SELECT DISTINCT inventory_year FROM emission_results "
            "WHERE org_id = ? ORDER BY inventory_year DESC",
            (org,),
        ).fetchall()
        return [r[0] for r in rows]

    def close(self):
        try:
            self._db.close()
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def get_store(
    path: Path | str | None = None,
    org_id: str = "default",
) -> InventoryStore:
    """Open an InventoryStore. Call once per Streamlit render."""
    return InventoryStore(path=path, org_id=org_id)
