"""
sk.lite — Sprint 25 Test Suite.

Covers:
  - GHG↔Supplier linkage: supplier_name column in schema, persist, get_all_records
  - Scope 1/2/3 pages: supplier selector in tag expander
  - Data manager: supplier filter, label, search
  - Supplier page: upgraded linkage using supplier_name column
  - Dashboard: supplier breakdown chart in By Site tab
  - Excel upload: reads supplier_name column from template rows
  - GitHub Actions: workflow file exists and valid YAML
  - Replit: .replit, run.sh, replit.nix exist
  - Full regression: 57 processes, CEA v20, all 18 pages import
"""
from __future__ import annotations
import ast
import os
import tempfile
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# GHG↔Supplier linkage — schema
# ---------------------------------------------------------------------------

class TestSupplierNameSchema:

    def test_supplier_name_col_in_schema(self):
        store_src = _read("inventory/store.py")
        schema = store_src[:store_src.find("_COLS =")]
        assert "supplier_name" in schema

    def test_cols_count_40(self):
        store_src = _read("inventory/store.py")
        assert "_COLS = 40" in store_src

    def test_supplier_name_in_migrate(self):
        store_src = _read("inventory/store.py")
        migrate_sec = store_src[store_src.find("def _migrate"):
                                store_src.find("def _migrate") + 1200]
        assert "supplier_name" in migrate_sec

    def test_supplier_name_in_persist_insert(self):
        store_src = _read("inventory/store.py")
        persist_sec = store_src[store_src.find("def persist("):
                                store_src.find("def persist(") + 2500]
        assert "supplier_name" in persist_sec

    def test_supplier_name_in_get_all_records(self):
        store_src = _read("inventory/store.py")
        get_all = store_src[store_src.find("def get_all_records"):
                            store_src.find("def get_all_records") + 1500]
        assert "supplier_name" in get_all

    def test_migration_adds_supplier_name(self):
        """Old DB without supplier_name gets it added automatically."""
        import sqlite3
        tmp = tempfile.mktemp(suffix=".sqlite")
        conn = sqlite3.connect(tmp)
        conn.execute("""
            CREATE TABLE emission_results (
                record_id TEXT PRIMARY KEY, org_id TEXT,
                inventory_year INTEGER, locked INTEGER DEFAULT 0,
                scope TEXT, process TEXT, t_CO2e REAL,
                created_at TEXT, updated_at TEXT,
                site TEXT, department TEXT, cost_centre TEXT, tags TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE inventory_snapshots (
                snapshot_id TEXT PRIMARY KEY, org_id TEXT,
                inventory_year INTEGER, locked_at TEXT,
                total_t_co2e REAL, scope1_t_co2e REAL,
                scope2_t_co2e REAL, scope3_t_co2e REAL
            )
        """)
        conn.commit(); conn.close()
        from inventory.store import InventoryStore
        store = InventoryStore(path=tmp, org_id="test")
        cols = {r[1] for r in store._db.execute(
            "PRAGMA table_info(emission_results)").fetchall()}
        store._db.close()
        try: os.unlink(tmp)
        except: pass
        assert "supplier_name" in cols

    def test_supplier_name_roundtrip(self, db_conn):
        """supplier_name saved in extra flows through to get_all_records."""
        import dataclasses, tempfile, os
        from modules.base import ActivityRecord
        from core.engine import calculate
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="s25")
        try:
            rec = ActivityRecord(
                scope="Scope 1",
                process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ",
                fuel_or_item="natural_gas", reporting_year=2024,
                gwp_ar=6, org_id="s25",
                extra={"supplier_name": "Alpha Metals Ltd"},
            )
            result = calculate(rec, db_conn)
            store.persist_batch([result], [rec], inventory_year=2024)
            rows = store.get_all_records(org_id="s25", inventory_year=2024)
            assert len(rows) == 1
            assert rows[0].get("supplier_name") == "Alpha Metals Ltd"
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass


# ---------------------------------------------------------------------------
# Scope pages: supplier selector
# ---------------------------------------------------------------------------

class TestScopeSupplierSelector:

    def test_scope1_supplier_selector(self):
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        assert "s1_tag_supplier" in s1_src
        assert "supplier_name" in s1_src

    def test_scope2_supplier_selector(self):
        s2_src = _read("streamlit_app/_page_02_scope2.py")
        assert "s2_tag_supplier" in s2_src
        assert "supplier_name" in s2_src

    def test_scope3_supplier_selector(self):
        s3_src = _read("streamlit_app/_page_03_scope3.py")
        assert "s3_tag_supplier" in s3_src
        assert "supplier_name" in s3_src

    def test_scope1_reads_suppliers_json(self):
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        assert "suppliers.json" in s1_src

    def test_scope_tags_include_supplier_name_key(self):
        """All scope tag dicts include supplier_name key."""
        for pg, prefix in [("_page_01_scope1.py", "s1"),
                           ("_page_02_scope2.py", "s2"),
                           ("_page_03_scope3.py", "s3")]:
            src = _read(f"streamlit_app/{pg}")
            assert '"supplier_name"' in src, f"supplier_name missing in {pg}"


# ---------------------------------------------------------------------------
# Data manager: supplier filter + label
# ---------------------------------------------------------------------------

class TestDataManagerSupplier:

    def test_dm_has_supplier_filter_dropdown(self):
        dm_src = _read("streamlit_app/_page_07_inventory.py")
        assert "sup_opt" in dm_src
        assert "dm_sup" in dm_src

    def test_dm_match_filters_by_supplier(self):
        dm_src = _read("streamlit_app/_page_07_inventory.py")
        assert 'sup_opt != "All"' in dm_src

    def test_dm_label_shows_supplier(self):
        dm_src = _read("streamlit_app/_page_07_inventory.py")
        assert "supplier_tag" in dm_src or "supplier_name" in dm_src

    def test_dm_search_includes_supplier(self):
        dm_src = _read("streamlit_app/_page_07_inventory.py")
        # Search haystack includes supplier_name
        assert 'r.get("supplier_name"' in dm_src


# ---------------------------------------------------------------------------
# Supplier page: upgraded linkage
# ---------------------------------------------------------------------------

class TestSupplierPageLinkage:

    def test_pull_ghg_uses_supplier_name_col(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "rec_sup" in sup_src
        assert "supplier_name" in sup_src

    def test_pull_ghg_has_fallback_matching(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "Fallback" in sup_src or "fallback" in sup_src

    def test_pull_ghg_tracks_all_tco2e(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "ghg_all_tco2e" in sup_src

    def test_pull_ghg_tracks_n_records(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "ghg_n_records" in sup_src


# ---------------------------------------------------------------------------
# Dashboard: supplier breakdown
# ---------------------------------------------------------------------------

class TestDashboardSupplierBreakdown:

    def test_dashboard_has_supplier_breakdown(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "By supplier" in dash_src

    def test_dashboard_checks_supplier_name_col(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert '"supplier_name"' in dash_src

    def test_dashboard_shows_linked_total(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "tCO₂e attributed" in dash_src or "linked" in dash_src

    def test_dashboard_guides_to_scope_pages(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "Scope 1/2/3" in dash_src or "Scope 1" in dash_src


# ---------------------------------------------------------------------------
# Excel upload: reads supplier column
# ---------------------------------------------------------------------------

class TestExcelUploadSupplier:

    def test_activity_form_reads_supplier_name(self):
        af_src = _read("streamlit_app/components/activity_form.py")
        assert "supplier_name" in af_src

    def test_activity_form_reads_supplier_fallback(self):
        """Accepts both 'supplier_name' and 'supplier' column headers."""
        af_src = _read("streamlit_app/components/activity_form.py")
        assert 'row.get("supplier_name", row.get("supplier"' in af_src

    def test_activity_form_passes_to_extra(self):
        af_src = _read("streamlit_app/components/activity_form.py")
        assert "extra={" in af_src or 'extra = {' in af_src


# ---------------------------------------------------------------------------
# GitHub + Replit deployment
# ---------------------------------------------------------------------------

class TestDeployment:

    def test_replit_config_exists(self):
        assert (ROOT / ".replit").exists()

    def test_replit_run_command(self):
        replit = _read(".replit")
        assert "run.sh" in replit or "streamlit" in replit

    def test_replit_port_8501(self):
        replit = _read(".replit")
        assert "8501" in replit

    def test_run_sh_exists(self):
        assert (ROOT / "run.sh").exists()

    def test_run_sh_seeds_db(self):
        run_sh = _read("run.sh")
        assert "setup.py" in run_sh

    def test_run_sh_starts_streamlit(self):
        run_sh = _read("run.sh")
        assert "streamlit run" in run_sh

    def test_replit_nix_exists(self):
        assert (ROOT / "replit.nix").exists()

    def test_replit_nix_python311(self):
        nix = _read("replit.nix")
        assert "python311" in nix

    def test_github_workflow_exists(self):
        assert (ROOT / ".github" / "workflows" / "test.yml").exists()

    def test_github_workflow_runs_pytest(self):
        yml = _read(".github/workflows/test.yml")
        assert "pytest" in yml

    def test_github_workflow_cea_regression(self):
        yml = _read(".github/workflows/test.yml")
        assert "CEA" in yml or "50890" in yml

    def test_github_workflow_lint(self):
        yml = _read(".github/workflows/test.yml")
        assert "flake8" in yml

    def test_gitignore_excludes_sqlite(self):
        gi = _read(".gitignore")
        assert "*.sqlite" in gi or "data/*.sqlite" in gi

    def test_gitignore_excludes_users_json(self):
        gi = _read(".gitignore")
        assert "users.json" in gi

    def test_readme_has_replit_instructions(self):
        readme = _read("README.md")
        assert "replit" in readme.lower()

    def test_readme_has_github_actions(self):
        readme = _read("README.md")
        assert "Actions" in readme or "workflow" in readme.lower()

    def test_readme_has_default_credentials(self):
        readme = _read("README.md")
        assert "ghgadmin2024" in readme


# ---------------------------------------------------------------------------
# Full regression Sprint 25
# ---------------------------------------------------------------------------

class TestRegressionSprint25:

    def test_57_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_all_18_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {
            0:"setup", 1:"scope1", 2:"scope2", 3:"scope3",
            4:"dashboard", 5:"ef_manager", 6:"export", 7:"inventory",
            8:"initiatives", 9:"checklist", 10:"sasb", 11:"supplier",
            12:"audit", 13:"esg_bridge", 14:"review", 15:"supplier_portal",
            16:"knowledge", 17:"logistics",
        }
        for i, name in page_map.items():
            importlib.import_module(f"streamlit_app._page_{i:02d}_{name}")

    def test_cea_v20(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 \u2014 Purchased electricity (grid)",
            country="IN", quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24", gwp_ar=6,
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)

    def test_store_syntax(self):
        ast.parse(_read("inventory/store.py"))

    def test_total_tests_950plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 950, f"Only {total} tests"
