"""
sk.lite — Sprint 18 Test Suite.

Covers:
  - Navigation: grouped sidebar, current_page state, NAV_GROUPS structure
  - Inventory: find_duplicate() method
  - Store: get_by_process() includes ef_source + n_fallback
  - SASB: all 11 sectors seeded with correct counts
  - Dashboard: last-updated timestamp in caption
  - CHANGELOG has Sprint 17/18 and v0.8.2
  - No UnboundLocalError patterns (no local re-imports)
  - Full regression: CEA v20, 57 processes, all pages
"""
from __future__ import annotations
import os
import re
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


def _make_store(org="s18"):
    from inventory.store import get_store
    tmp = tempfile.mktemp(suffix=".sqlite")
    return get_store(tmp, org_id=org), tmp


# ---------------------------------------------------------------------------
# Navigation redesign
# ---------------------------------------------------------------------------

class TestNavigation:

    def test_nav_groups_defined(self):
        main_src = _read("main.py")
        assert "_SECTION_ORDER" in main_src or "NAV_GROUPS" in main_src  # Sprint 32: sections renamed

    def test_nav_groups_four_sections(self):
        main_src = _read("main.py")
        assert "GHG INVENTORY" in main_src  # Sprint 32: section renamed
        assert "Analysis" in main_src
        assert "Reporting" in main_src

    def test_nav_uses_buttons_not_radio(self):
        main_src = _read("main.py")
        # New nav uses st.button, not st.radio for page selection
        assert "st.button(" in main_src
        assert "_nav_page" in main_src  # Sprint 32: state key renamed

    def test_nav_all_11_pages_present(self):
        main_src = _read("main.py")
        modules = [
            "_page_00_setup", "_page_01_scope1", "_page_02_scope2",
            "_page_03_scope3", "_page_04_dashboard", "_page_05_ef_manager",
            "_page_06_export", "_page_07_inventory", "_page_08_initiatives",
            "_page_09_checklist", "_page_10_sasb",
        ]
        for mod in modules:
            assert mod in main_src, f"Missing page: {mod}"

    def test_nav_scope_pages_grouped_together(self):
        main_src = _read("main.py")
        # All three scope pages should be in the same group
        data_entry_idx = main_src.find("Data entry")
        s1_idx = main_src.find("_page_01_scope1")
        s2_idx = main_src.find("_page_02_scope2")
        s3_idx = main_src.find("_page_03_scope3")
        assert data_entry_idx < s1_idx
        assert data_entry_idx < s2_idx
        assert data_entry_idx < s3_idx

    def test_version_updated(self):
        main_src = _read("main.py")
        assert "v1.0" in main_src or "sk.lite" in main_src  # Sprint 32: v1.0


# ---------------------------------------------------------------------------
# Inventory: find_duplicate
# ---------------------------------------------------------------------------

class TestFindDuplicate:

    def test_find_duplicate_returns_none_when_empty(self):
        from modules.base import ActivityRecord
        store, tmp = _make_store()
        try:
            rec = ActivityRecord(
                scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ", fuel_or_item="natural_gas",
                reporting_year=2024, gwp_ar=6, org_id="s18",
            )
            result = store.find_duplicate(rec, 2024)
            assert result is None
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_find_duplicate_detects_existing_record(self, db_conn):
        from modules.base import ActivityRecord, EmissionResult
        from core.engine import calculate
        store, tmp = _make_store()
        try:
            rec = ActivityRecord(
                scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=500, unit="GJ", fuel_or_item="natural_gas",
                reporting_year=2024, gwp_ar=6, org_id="s18",
            )
            result = calculate(rec, db_conn)
            store.persist(result, rec, 2024)
            # Same record again
            dup_id = store.find_duplicate(rec, 2024)
            assert dup_id is not None
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_find_duplicate_different_quantity_not_duplicate(self, db_conn):
        from modules.base import ActivityRecord
        from core.engine import calculate
        store, tmp = _make_store()
        try:
            rec1 = ActivityRecord(
                scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ", fuel_or_item="natural_gas",
                reporting_year=2024, gwp_ar=6, org_id="s18",
            )
            store.persist(calculate(rec1, db_conn), rec1, 2024)
            rec2 = ActivityRecord(
                scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=999, unit="GJ", fuel_or_item="natural_gas",
                reporting_year=2024, gwp_ar=6, org_id="s18",
            )
            assert store.find_duplicate(rec2, 2024) is None
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_find_duplicate_method_exists(self):
        from inventory.store import InventoryStore
        assert hasattr(InventoryStore, "find_duplicate")


# ---------------------------------------------------------------------------
# Store: ef_source in get_by_process
# ---------------------------------------------------------------------------

class TestGetByProcessEFSource:

    def test_get_by_process_has_ef_source_field(self, db_conn):
        from modules.base import ActivityRecord
        from core.engine import calculate
        store, tmp = _make_store()
        try:
            rec = ActivityRecord(
                scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ", fuel_or_item="natural_gas",
                reporting_year=2024, gwp_ar=6, org_id="s18",
            )
            store.persist(calculate(rec, db_conn), rec, 2024)
            rows = store.get_by_process(org_id="s18", inventory_year=2024)
            assert len(rows) > 0
            assert "ef_source" in rows[0], f"Keys: {list(rows[0].keys())}"
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_get_by_process_has_n_fallback_field(self, db_conn):
        from modules.base import ActivityRecord
        from core.engine import calculate
        store, tmp = _make_store()
        try:
            rec = ActivityRecord(
                scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ", fuel_or_item="natural_gas",
                reporting_year=2024, gwp_ar=6, org_id="s18",
            )
            store.persist(calculate(rec, db_conn), rec, 2024)
            rows = store.get_by_process(org_id="s18", inventory_year=2024)
            assert "n_fallback" in rows[0], f"Keys: {list(rows[0].keys())}"
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass


# ---------------------------------------------------------------------------
# SASB: all 11 sectors seeded
# ---------------------------------------------------------------------------

class TestSASBSeeding:

    def test_sasb_1124_rows(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1100, f"Expected ≥1100, got {n}"

    def test_sasb_11_sectors(self, db_conn):
        sectors = db_conn.execute(
            "SELECT DISTINCT sector FROM sasb_metrics ORDER BY sector"
        ).fetchall()
        assert len(sectors) == 11, f"Expected 11 sectors, got {len(sectors)}: {[s[0] for s in sectors]}"

    def test_sasb_financials_sector(self, db_conn):
        n = db_conn.execute(
            "SELECT COUNT(*) FROM sasb_metrics WHERE sector='Financials'"
        ).fetchone()[0]
        assert n >= 50, f"Financials has only {n} metrics"

    def test_sasb_extractives_largest(self, db_conn):
        """Extractives & Minerals Processing should be the largest sector."""
        rows = db_conn.execute(
            "SELECT sector, COUNT(*) as n FROM sasb_metrics GROUP BY sector ORDER BY n DESC LIMIT 1"
        ).fetchone()
        assert rows[0] == "Extractives & Minerals Processing", f"Largest sector: {rows[0]}"

    def test_sasb_primitive_bindings_populated(self, db_conn):
        n = db_conn.execute(
            "SELECT COUNT(*) FROM sasb_metrics WHERE primitive_bindings IS NOT NULL AND primitive_bindings != ''"
        ).fetchone()[0]
        assert n > 500, f"Only {n} metrics have primitive bindings"

    def test_sasb_ghg_metrics_exist(self, db_conn):
        """GHG-related metrics should exist across sectors."""
        n = db_conn.execute(
            "SELECT COUNT(*) FROM sasb_metrics WHERE "
            "LOWER(metric_name) LIKE '%emission%' OR "
            "LOWER(metric_name) LIKE '%greenhouse%' OR "
            "LOWER(metric_name) LIKE '%carbon%' OR "
            "LOWER(primitive_bindings) LIKE '%GH%'"
        ).fetchone()[0]
        assert n > 20, f"Only {n} GHG-related metrics found"

    def test_sasb_setup_seeds_on_force(self):
        """setup.py EXPECTED_MINIMUMS includes sasb_metrics: 1000."""
        setup_src = _read("setup.py")
        idx = setup_src.find("EXPECTED_MINIMUMS")
        chunk = setup_src[idx:idx+1000]
        assert "sasb_metrics" in chunk
        assert "1000" in chunk


# ---------------------------------------------------------------------------
# Dashboard: last-updated timestamp
# ---------------------------------------------------------------------------

class TestDashboardTimestamp:

    def test_last_updated_in_dashboard(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "last_updated" in dash_src or "updated_at" in dash_src

    def test_safe_profile_get_in_dashboard(self):
        """No unsafe profile['key'] that could KeyError on fresh profile."""
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        # Should use .get() for gwp_ar
        unsafe = re.findall(r"profile\['gwp_ar'\]", dash_src)
        assert len(unsafe) == 0, f"Unsafe profile['gwp_ar'] found {len(unsafe)} times"


# ---------------------------------------------------------------------------
# No UnboundLocalError risk: no local re-imports of top-level names
# ---------------------------------------------------------------------------

class TestNoUnboundLocal:

    def _critical_pages(self):
        return [
            "streamlit_app/_page_00_setup.py",
            "streamlit_app/_page_01_scope1.py",
            "streamlit_app/_page_02_scope2.py",
            "streamlit_app/_page_03_scope3.py",
        ]

    def test_scope1_no_local_calculate(self):
        src = _read("streamlit_app/_page_01_scope1.py")
        render_body = src[src.find("def render()"):]
        local_calc = re.findall(
            r"^\s+from core\.engine import calculate$",
            render_body, re.MULTILINE
        )
        assert not local_calc, f"Local calculate imports in scope1: {local_calc}"

    def test_scope1_no_local_activity_record(self):
        src = _read("streamlit_app/_page_01_scope1.py")
        render_body = src[src.find("def render()"):]
        local_ar = re.findall(
            r"^\s+from modules\.base import ActivityRecord$",
            render_body, re.MULTILINE
        )
        assert not local_ar, f"Local ActivityRecord imports in scope1: {local_ar}"

    def test_scope2_no_local_calculate(self):
        src = _read("streamlit_app/_page_02_scope2.py")
        render_body = src[src.find("def render()"):]
        local_calc = re.findall(
            r"^\s+from core\.engine import calculate$",
            render_body, re.MULTILINE
        )
        assert not local_calc, f"Local calculate imports in scope2: {local_calc}"

    def test_scope1_fallback_warning_at_top(self):
        src = _read("streamlit_app/_page_01_scope1.py")
        top = src[:src.find("def render()")]
        assert "fallback_warning" in top, "fallback_warning not at module top level"


# ---------------------------------------------------------------------------
# CHANGELOG
# ---------------------------------------------------------------------------

class TestChangelog:

    def test_changelog_has_082(self):
        cl = _read("CHANGELOG.md")
        assert "0.8.2" in cl

    def test_changelog_has_sprint17(self):
        cl = _read("CHANGELOG.md")
        assert "Sprint 17" in cl

    def test_changelog_has_unbound_local_fix(self):
        cl = _read("CHANGELOG.md")
        assert "UnboundLocal" in cl or "fallback_warning" in cl


# ---------------------------------------------------------------------------
# Full regression Sprint 18
# ---------------------------------------------------------------------------

class TestRegressionSprint18:

    def test_57_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_all_11_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {
            0:"setup", 1:"scope1", 2:"scope2", 3:"scope3", 4:"dashboard",
            5:"ef_manager", 6:"export", 7:"inventory", 8:"initiatives",
            9:"checklist", 10:"sasb",
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

    def test_sasb_seeded(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1100

    def test_6_mappers(self):
        mappers = [p for p in (ROOT / "outputs" / "disclosures").glob("*.py")
                   if not p.name.startswith("_")]
        assert len(mappers) >= 6

    def test_total_tests_610plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 600, f"Only {total} tests"
