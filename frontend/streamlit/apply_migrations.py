"""
apply_migrations.py — run this once from your repo root to apply all EF and inventory updates.

Usage (works on Windows, Mac, Linux):
    python apply_migrations.py

No sqlite3 CLI needed. Pure Python, no extra dependencies.
"""
import sqlite3, sys
from pathlib import Path

ROOT = Path(__file__).parent

def run_sql_file(db_path: Path, sql_path: Path, label: str):
    if not db_path.exists():
        print(f"  SKIP {label}: {db_path} not found")
        return 0
    if not sql_path.exists():
        print(f"  SKIP {label}: {sql_path} not found")
        return 0

    sql = sql_path.read_text(encoding="utf-8")
    # Split on ; but skip comments and empty statements
    statements = [s.strip() for s in sql.split(";") if s.strip() and not s.strip().startswith("--")]

    conn = sqlite3.connect(str(db_path))
    ok = 0
    skipped = 0
    errors = 0
    for stmt in statements:
        if not stmt:
            continue
        try:
            conn.execute(stmt)
            ok += 1
        except sqlite3.IntegrityError:
            skipped += 1   # INSERT OR IGNORE: row already exists
        except Exception as e:
            errors += 1
            if errors <= 3:
                print(f"  WARN: {e!s:.80}")
    conn.commit()
    conn.close()
    print(f"  ✅ {label}: {ok} applied, {skipped} already existed, {errors} errors")
    return ok

print("sk.lite — applying database migrations")
print("=" * 50)

# 1. EF store (main data dir)
run_sql_file(
    ROOT / "data" / "ef_store.sqlite",
    ROOT / "ef_store_migration.sql",
    "EF store (data/)"
)

# 2. EF store (streamlit_app data dir, if it exists)
run_sql_file(
    ROOT / "streamlit_app" / "data" / "ef_store.sqlite",
    ROOT / "ef_store_migration.sql",
    "EF store (streamlit_app/data/)"
)

# 3. Inventory (demo data)
run_sql_file(
    ROOT / "data" / "inventory.sqlite",
    ROOT / "inventory_migration.sql",
    "Inventory demo data"
)

print("=" * 50)
print("Done. You can delete ef_store_migration.sql and inventory_migration.sql after this.")
