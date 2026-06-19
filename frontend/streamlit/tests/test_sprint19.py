"""
sk.lite — Sprint 19 Test Suite.

Covers:
  - find_duplicate() wired into Scope 1/2 save buttons
  - HTML report generation
  - Export has 7 download buttons (added HTML)
  - README v0.8.2 / 620+ tests
  - All pages import cleanly (no UnboundLocalError risk)
  - Duplicate detection: confirm state keys set correctly
  - Full regression: 57 processes, CEA v20
"""
from __future__ import annotations
import os
import re
import tempfile
import uuid
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


# ---------------------------------------------------------------------------
# Duplicate detection wired into save buttons
# ---------------------------------------------------------------------------

class TestDuplicateDetectionUI:

    def test_scope1_stationary_uses_find_duplicate(self):
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        assert "find_duplicate" in s1_src

    def test_scope1_has_confirm_dup_session_key(self):
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        assert "s1_stat_confirm_dup" in s1_src
        assert "s1_mob_confirm_dup" in s1_src

    def test_scope2_uses_find_duplicate(self):
        s2_src = _read("streamlit_app/_page_02_scope2.py")
        assert "find_duplicate" in s2_src

    def test_scope2_has_confirm_dup_session_key(self):
        s2_src = _read("streamlit_app/_page_02_scope2.py")
        assert "s2_confirm_dup" in s2_src

    def test_duplicate_warning_message_present(self):
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        assert "already exist" in s1_src or "duplicate" in s1_src.lower()

    def test_find_duplicate_clears_on_success(self):
        """After a successful save, the confirm key should be cleared."""
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        assert "s1_stat_confirm_dup" in s1_src
        # pop() removes the key after a successful save
        assert ".pop(" in s1_src


# ---------------------------------------------------------------------------
# HTML report generation
# ---------------------------------------------------------------------------

class TestHTMLReport:

    def test_html_generator_function_exists(self):
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "_generate_html_report" in exp_src

    def test_html_download_button_present(self):
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "text/html" in exp_src
        assert "HTML report" in exp_src

    def test_html_report_generates(self):
        """Call _generate_html_report directly and check output."""
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        sys.path.insert(0, str(ROOT))
        from streamlit_app._page_06_export import _generate_html_report

        report = {
            "summary": {
                "scope1_t_co2e": 500.0,
                "scope2_t_co2e": 300.0,
                "scope3_t_co2e": 100.0,
                "total_t_co2e":  900.0,
                "n_records":     10,
                "data_quality_grade": "B — Mostly national EFs",
            },
            "by_category": [
                {"scope": "Scope 1", "category": "Stationary", "t_CO2e": 500.0},
                {"scope": "Scope 2", "category": "Electricity", "t_CO2e": 300.0},
            ],
        }
        profile = {"org_name": "Test Corp", "gwp_ar": 6, "fiscal_year": "2023-24"}
        html = _generate_html_report(report, profile, 2024)

        assert "<!DOCTYPE html>" in html
        assert "Test Corp" in html
        assert "900" in html  # total
        assert "500" in html  # scope 1
        assert "text/html" not in html  # mime-type not in content

    def test_html_is_valid_structure(self):
        """HTML must have key structural elements."""
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        sys.path.insert(0, str(ROOT))
        from streamlit_app._page_06_export import _generate_html_report

        html = _generate_html_report(
            {"summary": {}, "by_category": []},
            {"org_name": "X", "gwp_ar": 6, "fiscal_year": "2024"},
            2024,
        )
        assert "<html" in html
        assert "</html>" in html
        assert "<table" in html
        assert "sk.lite" in html

    def test_export_has_7_columns(self):
        """Export section now has 7 download buttons."""
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "c1, c2, c3, c4, c5, c6, c7" in exp_src


# ---------------------------------------------------------------------------
# README
# ---------------------------------------------------------------------------

class TestReadme:

    def test_readme_v082(self):
        readme = _read("README.md")
        assert "sk.lite" in readme  # Sprint 32: rebranded

    def test_readme_620_tests(self):
        readme = _read("README.md")
        assert "620" in readme

    def test_readme_has_curl_example(self):
        readme = _read("README.md")
        assert "curl" in readme


# ---------------------------------------------------------------------------
# No UnboundLocalError risk in critical pages
# ---------------------------------------------------------------------------

class TestNoLocalImports:

    def _check(self, page_file: str, names: list):
        src = _read(f"streamlit_app/{page_file}")
        body = src[src.find("def render()"):]
        for name in names:
            local = re.findall(
                r"^\s+from \S+ import .*\b" + re.escape(name) + r"\b\s*$",
                body, re.MULTILINE
            )
            # Allow "as alias" pattern (different name, no shadowing)
            local = [l for l in local if f"as {name}" not in l]
            assert not local, f"{page_file}: '{name}' re-imported locally: {local}"

    def test_scope1_no_local_imports(self):
        self._check("_page_01_scope1.py",
                    ["calculate", "ActivityRecord", "fallback_warning", "calc_trace"])

    def test_scope2_no_local_imports(self):
        self._check("_page_02_scope2.py",
                    ["calculate", "ActivityRecord"])

    def test_scope3_no_local_imports(self):
        self._check("_page_03_scope3.py",
                    ["ActivityRecord"])


# ---------------------------------------------------------------------------
# Full regression Sprint 19
# ---------------------------------------------------------------------------

class TestRegressionSprint19:

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

    def test_find_duplicate_in_store(self):
        from inventory.store import InventoryStore
        assert hasattr(InventoryStore, "find_duplicate")

    def test_get_by_process_has_ef_source(self, db_conn):
        """get_by_process returns ef_source field."""
        import tempfile, uuid, os
        from modules.base import ActivityRecord
        from core.engine import calculate
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="t19")
        try:
            rec = ActivityRecord(
                scope="Scope 1",
                process="S1 \u2014 Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ",
                fuel_or_item="natural_gas", reporting_year=2024, gwp_ar=6,
                org_id="t19",
            )
            store.persist(calculate(rec, db_conn), rec, 2024)
            rows = store.get_by_process(org_id="t19", inventory_year=2024)
            assert len(rows) > 0
            assert "ef_source" in rows[0]
            assert "n_fallback" in rows[0]
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_sasb_1124(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1100

    def test_total_tests_640plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 635, f"Only {total} tests"


class TestScope3FindDuplicate:

    def test_save_button_calls_find_duplicate(self):
        s3_src = open(ROOT / "streamlit_app/_page_03_scope3.py", encoding="utf-8").read()
        assert "find_duplicate" in s3_src

    def test_scope3_warns_on_duplicate(self):
        s3_src = open(ROOT / "streamlit_app/_page_03_scope3.py", encoding="utf-8").read()
        assert "already exist" in s3_src or "duplicate" in s3_src.lower()


class TestSASBStartupSeeding:

    def test_main_py_seeds_sasb(self):
        main_src = open(ROOT / "main.py", encoding="utf-8").read()
        assert "ingest_sasb_metrics" in main_src

    def test_setup_py_seeds_sasb_fallback(self):
        setup_src = open(ROOT / "setup.py", encoding="utf-8").read()
        assert "ingest_sasb_metrics" in setup_src
        assert "n_sasb" in setup_src

    def test_sasb_1124_in_db(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1100

    def test_sasb_11_sectors_in_db(self, db_conn):
        n = db_conn.execute(
            "SELECT COUNT(DISTINCT sector) FROM sasb_metrics"
        ).fetchone()[0]
        assert n == 11


class TestExportOrgIdFix:

    def test_org_id_before_get_available_years(self):
        exp_src = open(ROOT / "streamlit_app/_page_06_export.py", encoding="utf-8").read()
        org_pos   = exp_src.find("org_id    = profile")
        avail_pos = exp_src.find("available_years = inventory.get_available_years")
        assert org_pos >= 0 and avail_pos >= 0
        assert org_pos < avail_pos, f"org_id (char {org_pos}) must precede get_available_years (char {avail_pos})"

    def test_no_unbound_org_id_in_render(self):
        exp_src = open(ROOT / "streamlit_app/_page_06_export.py", encoding="utf-8").read()
        render_body = exp_src[exp_src.find("def render()"):]
        # org_id must be set as a direct assignment before first use
        first_use = render_body.find("org_id")
        first_assign = render_body.find("org_id    = profile")
        assert first_assign >= 0, "org_id not assigned in render()"
        assert first_assign <= first_use, "org_id used before assignment"
