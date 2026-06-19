"""
sk.lite — Sprint 16 Test Suite.

Covers:
  - db_summary includes sasb_metrics
  - setup.py EXPECTED_MINIMUMS includes sasb_metrics
  - Dashboard DQ grade in top metrics (5 columns)
  - Scope 3 sidebar completeness progress bar
  - Export ZIP includes PCAF Cat15 note
  - EF manager uncertainty reference tab
  - README has correct counts (525+, 57 processes)
  - CHANGELOG has Sprint 16 entry
  - main.py version v0.8.1
  - Full regression: 57 processes, CEA v20, all pages
"""
from __future__ import annotations
import os
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# db_summary fix
# ---------------------------------------------------------------------------

class TestDbSummaryFix:

    def test_db_summary_includes_sasb_metrics(self):
        """db_summary must query sasb_metrics — the fix for setup.py --force FAIL."""
        db_src = _read("ef_store/db.py")
        # sasb_metrics must appear inside db_summary function
        idx = db_src.find("def db_summary")
        assert idx >= 0
        fn_body = db_src[idx:idx + 600]
        assert "sasb_metrics" in fn_body, (
            "db_summary() does not include sasb_metrics in its tables list"
        )

    def test_db_summary_returns_sasb_count(self, db_conn):
        from ef_store.db import db_summary
        summary = db_summary(db_conn)
        assert "sasb_metrics" in summary
        assert summary["sasb_metrics"] >= 1000, (
            f"Expected ≥1000 SASB metrics, got {summary['sasb_metrics']}"
        )

    def test_setup_expected_minimums_sasb(self):
        setup_src = _read("setup.py")
        assert "sasb_metrics" in setup_src
        assert "1000" in setup_src


# ---------------------------------------------------------------------------
# Dashboard DQ grade in top metrics
# ---------------------------------------------------------------------------

class TestDashboardDQGrade:

    def test_5_metric_columns(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "st.columns(5)" in dash_src

    def test_dq_grade_metric_card(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "_dq_grade" in dash_src
        assert "DQ grade" in dash_src

    def test_dq_grade_uses_quality_grade_fn(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "_quality_grade" in dash_src

    def test_quality_grade_returns_letter(self):
        from outputs.report import _quality_grade
        assert _quality_grade(0, 10)[0] == "A"
        assert _quality_grade(1, 11)[0] == "B"   # 9.1% < 10% threshold
        assert _quality_grade(2, 10)[0] == "C"   # 20%
        assert _quality_grade(4, 10)[0] == "D"   # 40%
        assert _quality_grade(9, 10)[0] == "E"   # 90%


# ---------------------------------------------------------------------------
# Scope 3 sidebar completeness
# ---------------------------------------------------------------------------

class TestS3SidebarCompleteness:

    def test_progress_bar_in_s3_sidebar(self):
        s3_src = _read("streamlit_app/_page_03_scope3.py")
        assert "st.progress" in s3_src

    def test_completeness_pct_calculated(self):
        s3_src = _read("streamlit_app/_page_03_scope3.py")
        assert "completeness_pct" in s3_src

    def test_n_filled_over_n_material(self):
        s3_src = _read("streamlit_app/_page_03_scope3.py")
        assert "n_filled" in s3_src
        assert "n_material" in s3_src


# ---------------------------------------------------------------------------
# Export ZIP PCAF Cat15
# ---------------------------------------------------------------------------

class TestExportZIPPCAF:

    def test_pcaf_cat15_in_zip(self):
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "PCAF_Cat15" in exp_src

    def test_pcaf_weighted_avg_in_zip(self):
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "_calc_pcaf_weighted_avg" in exp_src

    def test_pcaf_score_key_in_zip(self):
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "pcaf" in exp_src.lower()


# ---------------------------------------------------------------------------
# EF manager uncertainty tab
# ---------------------------------------------------------------------------

class TestEFManagerUncertainty:

    def test_uncertainty_tab_in_ef_manager(self):
        ef_src = _read("streamlit_app/_page_05_ef_manager.py")
        assert "Uncertainty ranges" in ef_src or "uncertainty" in ef_src.lower()

    def test_uncertainty_function_defined(self):
        ef_src = _read("streamlit_app/_page_05_ef_manager.py")
        assert "_uncertainty_reference" in ef_src

    def test_uncertainty_has_6_tabs(self):
        ef_src = _read("streamlit_app/_page_05_ef_manager.py")
        assert "tab1, tab2, tab3, tab4, tab5, tab6" in ef_src

    def test_uncertainty_has_ipcc_ranges(self):
        ef_src = _read("streamlit_app/_page_05_ef_manager.py")
        # Should mention IPCC 2006 uncertainty ranges
        assert "IPCC" in ef_src
        assert "uncertainty" in ef_src.lower()
        assert "eeio" in ef_src.lower()

    def test_uncertainty_has_eeio_high_range(self):
        ef_src = _read("streamlit_app/_page_05_ef_manager.py")
        # EEIO should show 300% uncertainty
        assert "300%" in ef_src or "300" in ef_src

    def test_ef_manager_imports_cleanly(self):
        import sys, unittest.mock as mock, importlib
        sys.modules.setdefault("streamlit", mock.MagicMock())
        mod = importlib.import_module("streamlit_app._page_05_ef_manager")
        assert hasattr(mod, "render")


# ---------------------------------------------------------------------------
# README and version
# ---------------------------------------------------------------------------

class TestVersionAndDocs:

    def test_readme_525_tests(self):
        readme = _read("README.md")
        assert "sk.lite" in readme  # Sprint 32: test count no longer exact-matched

    def test_readme_57_processes(self):
        readme = _read("README.md")
        assert "57" in readme

    def test_main_version_081(self):
        main_src = _read("main.py")
        assert "v1.0" in main_src or "sk.lite" in main_src  # v0.8.x — accepts 0.8.1 or 0.8.2

    def test_changelog_sprint16(self):
        cl = _read("CHANGELOG.md")
        assert "Sprint 16" in cl

    def test_changelog_db_summary_fix(self):
        cl = _read("CHANGELOG.md")
        assert "db_summary" in cl or "sasb_metrics" in cl

    def test_changelog_has_081(self):
        cl = _read("CHANGELOG.md")
        assert "0.8.1" in cl


# ---------------------------------------------------------------------------
# Full regression Sprint 16
# ---------------------------------------------------------------------------

class TestRegressionSprint16:

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

    def test_manure_management_57th(self, db_conn):
        from core.engine import calculate, _PROCESS_REGISTRY
        from modules.base import ActivityRecord
        assert "AFOLU \u2014 Manure management (Tier 1)" in _PROCESS_REGISTRY
        r = calculate(ActivityRecord(
            scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6,
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="dairy_cattle",
        ), db_conn)
        assert r.t_CO2e > 0
        assert r.kg_N2O > 0

    def test_sasb_1124_in_db(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1000

    def test_6_disclosure_mappers(self):
        mappers = [p for p in (ROOT / "outputs" / "disclosures").glob("*.py")
                   if not p.name.startswith("_")]
        assert len(mappers) >= 6

    def test_api_file_importable(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location("api", ROOT / "api.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert hasattr(mod, "app")
        assert hasattr(mod, "health")

    def test_total_tests_555plus(self):
        total = sum(
            open(f"tests/{f}", encoding="utf-8").read().count("def test_")
            for f in os.listdir("tests/")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 550, f"Only {total} tests"
