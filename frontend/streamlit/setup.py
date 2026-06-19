"""
sk.lite — Setup Script.

Run once before first use:
    python setup.py

This will:
  1. Create the SQLite EF store (data/ef_store.sqlite)
  2. Ingest all seed CSV files
  3. Run sanity checks (row counts, known-answer tests)
  4. Print a health summary

Options:
    python setup.py --force     Re-ingest all seeds (overwrites existing data)
    python setup.py --check     Run health checks only (no ingestion)
    python setup.py --db PATH   Use a custom DB path
"""

from __future__ import annotations
import sys
import io
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Force UTF-8 stdout on Windows (cp1252 can't print checkmarks / special chars)
# This must happen before any print() calls.
# ---------------------------------------------------------------------------
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True
    )
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ("utf-8", "utf8"):
    sys.stderr = io.TextIOWrapper(
        sys.stderr.buffer, encoding="utf-8", errors="replace", line_buffering=True
    )

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from ef_store.db import setup_db, db_summary
from ef_store.ingester import ingest_all_seeds


# ---------------------------------------------------------------------------
# ASCII-safe symbols (readable on any terminal / code runner)
# ---------------------------------------------------------------------------
OK   = "[OK]"
FAIL = "[FAIL]"
WARN = "[WARN]"
INFO = "[INFO]"


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_DB_PATH = Path(__file__).parent / "data" / "ef_store.sqlite"

EXPECTED_MINIMUMS = {
    "emission_factors":    38,
    "conversion_constants": 20,
    "grid_ef":             44,   # 11 years × 4 methods (Sprint 3: OM/BM/CM added to early years)
    "eeio_factors":         0,   # optional
    "vehicle_specs":       15,   # India truck specs (Sprint 3 Batch 5)
    "major_ports":         50,   # Ports + cities with lat/lon (Sprint 3 Batch 6)
    "airports":            40,   # IATA airport coordinates (Sprint 3 Batch 7)
    "aircraft_fuel_burn":  15,   # Aircraft ICAO fuel burn (Sprint 3 Batch 7)
    "sasb_metrics":       1000,  # SASB canonical master (Sprint 11)
}

KNOWN_ANSWER_TESTS = [
    {
        "name": "S2 India electricity -- CEA v20 example (FY 2023-24)",
        "description": "70,000 MWh x 0.727 tCO2/MWh = 50,890 tCO2",
        "scope": "Scope 2",
        "process": "S2 \u2014 Purchased electricity (grid)",
        "country": "IN",
        "quantity": 70_000_000,
        "unit": "kWh",
        "fiscal_year": "2023-24",
        "reporting_year": 2024,
        "expected_t_co2e": 50_890.0,
        "tolerance_pct": 1.0,
    },
]


# ---------------------------------------------------------------------------
# Main setup
# ---------------------------------------------------------------------------

def run_setup(
    db_path: Path = DEFAULT_DB_PATH,
    force: bool = False,
    check_only: bool = False,
) -> bool:
    print("=" * 60)
    print("sk.lite — Setup")
    print("=" * 60)
    print(f"DB path: {db_path}")
    print()

    # 1. Create DB schema
    print("[1/3] Initialising database schema...")
    t0 = time.time()
    conn = setup_db(db_path)
    print(f"  Schema ready ({time.time()-t0:.2f}s)")

    # 2. Ingest seeds
    if not check_only:
        print("\n[2/3] Ingesting seed data...")
        t0 = time.time()
        results = ingest_all_seeds(conn, force=force)

        # Always ensure Sprint 3 tables are populated even on existing DBs
        # (ingest_all_seeds skips everything when force=False and EFs exist)
        from ef_store.ingester import (
            ingest_vehicle_specs, ingest_airports,
            ingest_aircraft_fuel_burn, ingest_major_ports,
            ingest_sasb_metrics,
        )
        sprint3_loaders = {
            "vehicle_specs":      ingest_vehicle_specs,
            "airports":           ingest_airports,
            "aircraft_fuel_burn": ingest_aircraft_fuel_burn,
            "major_ports":        ingest_major_ports,
        }
        for table, loader in sprint3_loaders.items():
            n = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            if n == 0:
                added = loader(conn)
                print(f"  [AUTO] {table}: seeded {added} rows")
                if isinstance(results, dict):
                    results[table] = added

        # Always ensure SASB metrics are seeded (added in Sprint 11)
        # This runs even on non-force mode since sasb_metrics can be empty
        # on DBs created before Sprint 11.
        try:
            n_sasb = conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        except Exception:
            n_sasb = 0
        if n_sasb == 0:
            added_sasb = ingest_sasb_metrics(conn)
            print(f"  [AUTO] sasb_metrics: seeded {added_sasb} rows")
            if isinstance(results, dict):
                results["sasb"] = added_sasb

        print(f"  Ingestion complete ({time.time()-t0:.2f}s)")
    else:
        print("\n[2/3] Skipping ingestion (--check mode)")
        results = {}

    # 3. Health checks
    print("\n[3/3] Running health checks...")
    summary = db_summary(conn)
    all_pass = True

    print("\n  Row counts:")
    for table, expected_min in EXPECTED_MINIMUMS.items():
        actual = summary.get(table, 0)
        ok = actual >= expected_min
        tag = OK if ok else FAIL
        if not ok:
            all_pass = False
        print(f"    {tag} {table}: {actual} rows (expected >= {expected_min})")

    if summary.get("eeio_factors", 0) == 0:
        print(f"    {WARN} EEIO factors not seeded.")
        print("          Copy US_summary_import_factors_exiobase_2019_17sch.csv")
        print("          into ef_store/seeds/eeio/ and re-run.")

    # Known-answer tests
    print("\n  Known-answer tests:")
    for test in KNOWN_ANSWER_TESTS:
        passed = _run_known_answer_test(conn, test)
        if not passed:
            all_pass = False

    # Module registry
    print("\n  Module registry:")
    from core.engine import list_available_processes
    reg = list_available_processes()
    print(f"    Implemented: {len(reg['implemented'])} processes")
    print(f"    Pending:     {len(reg['pending'])} processes (future sprints)")

    conn.close()

    print("\n" + "=" * 60)
    if all_pass:
        print(f"{OK} All checks passed. sk.lite is ready.")
        print()
        print("  Next steps:")
        print("    streamlit run streamlit_app/main.py")
        print("    python -m pytest tests/")
    else:
        print(f"{FAIL} Some checks failed. Review output above.")
        print("  Tip: python setup.py --force   (re-ingest all seeds)")
    print("=" * 60)

    return all_pass


def _run_known_answer_test(conn, test: dict) -> bool:
    try:
        from modules.base import ActivityRecord
        from core.engine import calculate

        record = ActivityRecord(
            record_id=f"setup_test_{test['name'][:20]}",
            scope=test["scope"],
            process=test["process"],
            country=test["country"],
            quantity=test["quantity"],
            unit=test["unit"],
            reporting_year=test["reporting_year"],
            fiscal_year=test.get("fiscal_year"),
            gwp_ar=6,
        )

        result = calculate(record, conn)
        actual   = result.t_CO2e
        expected = test["expected_t_co2e"]
        pct_diff = abs(actual - expected) / expected

        if pct_diff <= test["tolerance_pct"] / 100.0:
            print(f"    {OK} {test['name']}")
            print(f"       Expected: {expected:,.1f} tCO2e | "
                  f"Got: {actual:,.1f} tCO2e | "
                  f"Diff: {pct_diff*100:.3f}%")
            return True
        else:
            print(f"    {FAIL} {test['name']}")
            print(f"       Expected: {expected:,.1f} tCO2e | "
                  f"Got: {actual:,.1f} tCO2e | "
                  f"Diff: {pct_diff*100:.2f}% > {test['tolerance_pct']}% tolerance")
            return False

    except Exception as e:
        print(f"    {FAIL} {test['name']} -- ERROR: {e}")
        return False


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    args = sys.argv[1:]
    force      = "--force" in args
    check_only = "--check" in args

    db_path = DEFAULT_DB_PATH
    for i, arg in enumerate(args):
        if arg == "--db" and i + 1 < len(args):
            db_path = Path(args[i + 1])

    success = run_setup(db_path=db_path, force=force, check_only=check_only)
    sys.exit(0 if success else 1)
