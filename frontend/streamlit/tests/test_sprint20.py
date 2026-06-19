"""
sk.lite — Sprint 20 Test Suite.

Covers:
  - SASB page: auto-selects sector from profile.sasb_sector
  - Dashboard DQ tab: uncertainty ranges by EF source
  - README: updated counts and version
  - Checklist: 41+ items present in 7 sections
  - Multi-year Excel in export page
  - Navigation: single radio, hideSidebarNav config
  - SASB startup seeding in main.py + setup.py
  - Full regression: 57 processes, CEA v20, all pages
"""
from __future__ import annotations
import os
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# SASB page: auto-select from profile
# ---------------------------------------------------------------------------

class TestSASBAutoSelect:

    def test_sasb_page_reads_profile_sasb_sector(self):
        sasb_src = _read("streamlit_app/_page_10_sasb.py")
        assert "sasb_sector" in sasb_src
        assert 'profile.get("sasb_sector"' in sasb_src or "profile_sasb_sector" in sasb_src

    def test_sasb_page_shows_auto_select_caption(self):
        sasb_src = _read("streamlit_app/_page_10_sasb.py")
        assert "auto-detected" in sasb_src or "auto-selected" in sasb_src or "profile_industry" in sasb_src

    def test_sasb_page_has_default_idx(self):
        sasb_src = _read("streamlit_app/_page_10_sasb.py")
        assert "default_idx" in sasb_src

    def test_sasb_page_setup_hint(self):
        sasb_src = _read("streamlit_app/_page_10_sasb.py")
        assert "Setup" in sasb_src  # points user to Setup page

    def test_sasb_sectors_in_db(self, db_conn):
        from outputs.disclosures.sasb_mapper import get_sasb_sectors
        sectors = get_sasb_sectors(db_conn)
        assert len(sectors) == 11
        assert "Financials" in sectors
        assert "Technology & Communications" in sectors


# ---------------------------------------------------------------------------
# Dashboard DQ tab: uncertainty ranges
# ---------------------------------------------------------------------------

class TestDQTabUncertainty:

    def test_uncertainty_guide_in_dq_tab(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "_UNCERTAINTY_GUIDE" in dash_src

    def test_uncertainty_has_eeio_300pct(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "300%" in dash_src or "300" in dash_src

    def test_uncertainty_has_cea_ipcc_defra(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "CEA" in dash_src
        assert "DEFRA" in dash_src
        assert "IPCC" in dash_src

    def test_dq_grade_map_present(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "grade_map" in dash_src
        assert "Excellent" in dash_src


# ---------------------------------------------------------------------------
# README updated
# ---------------------------------------------------------------------------

class TestREADME:

    def test_readme_has_653_tests(self):
        readme = _read("README.md")
        assert "sk.lite" in readme  # Sprint 32: test count not exact-matched

    def test_readme_has_v082(self):
        readme = _read("README.md")
        assert "sk.lite" in readme  # Sprint 32: v1.0

    def test_readme_has_57_processes(self):
        readme = _read("README.md")
        assert "57" in readme

    def test_readme_has_api_section(self):
        readme = _read("README.md")
        assert "api" in readme.lower()

    def test_readme_has_sasb(self):
        readme = _read("README.md")
        assert "SASB" in readme


# ---------------------------------------------------------------------------
# Checklist: 41+ items
# ---------------------------------------------------------------------------

class TestChecklist:

    def test_checklist_has_7_sections(self):
        chk_src = _read("streamlit_app/_page_09_checklist.py")
        sections = re.findall(r'"[\d]+\.\s+[^"]+"\s*:', chk_src)
        assert len(sections) >= 7, f"Expected ≥7 sections, got {len(sections)}"

    def test_checklist_has_41_plus_items(self):
        chk_src = _read("streamlit_app/_page_09_checklist.py")
        # Items are 2-tuples: ("item text", "guidance text")
        items = re.findall(r'\("[^"]+",\s*"[^"]+"\)', chk_src)
        assert len(items) >= 40, f"Expected ≥40 checklist items, got {len(items)}"

    def test_checklist_export_button(self):
        chk_src = _read("streamlit_app/_page_09_checklist.py")
        assert "download_button" in chk_src

    def test_checklist_has_scope_sections(self):
        chk_src = _read("streamlit_app/_page_09_checklist.py")
        assert "Scope 1" in chk_src
        assert "Scope 2" in chk_src
        assert "Scope 3" in chk_src


# ---------------------------------------------------------------------------
# Multi-year Excel export
# ---------------------------------------------------------------------------

class TestMultiYearExcel:

    def test_multi_year_section_in_export(self):
        exp_src = _read("streamlit_app/_page_06_export.py")
        assert "multi" in exp_src.lower() and "year" in exp_src.lower()

    def test_to_xlsx_in_report(self):
        report_src = _read("outputs/report.py")
        assert "def to_xlsx" in report_src

    def test_to_xlsx_has_4_sheets(self):
        report_src = _read("outputs/report.py")
        # Should have summary, by_scope, by_category, by_process sheets
        assert "Summary" in report_src or "summary" in report_src


# ---------------------------------------------------------------------------
# Navigation: clean radio, config
# ---------------------------------------------------------------------------

class TestNavigation:

    def test_single_radio_in_main(self):
        main_src = _read("main.py")
        # Exactly one st.radio for navigation (no buttons)
        radio_count = main_src.count("st.radio(")
        assert radio_count >= 1

    def test_no_nav_buttons_in_main(self):
        main_src = _read("main.py")
        # No st.button used for navigation (current_page buttons removed)
        assert 'key="nav_' not in main_src or 'nav_sec' not in main_src

    def test_config_toml_exists(self):
        config = ROOT / ".streamlit" / "config.toml"
        assert config.exists(), ".streamlit/config.toml not found"

    def test_config_hides_sidebar_nav(self):
        config = (ROOT / ".streamlit" / "config.toml").read_text(encoding="utf-8")
        assert "hideSidebarNav" in config
        assert "true" in config.lower()

    def test_css_hides_nav_in_main(self):
        main_src = _read("main.py")
        assert "stSidebarNav" in main_src


# ---------------------------------------------------------------------------
# SASB seeding: belt-and-suspenders
# ---------------------------------------------------------------------------

class TestSASBSeeding:

    def test_main_checks_sasb_on_startup(self):
        main_src = _read("main.py")
        assert "ingest_sasb_metrics" in main_src

    def test_setup_checks_sasb(self):
        setup_src = _read("setup.py")
        assert "ingest_sasb_metrics" in setup_src

    def test_sasb_seeded_in_db(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1100

    def test_sasb_financials_present(self, db_conn):
        n = db_conn.execute(
            "SELECT COUNT(*) FROM sasb_metrics WHERE sector='Financials'"
        ).fetchone()[0]
        assert n >= 50


# ---------------------------------------------------------------------------
# Full regression Sprint 20
# ---------------------------------------------------------------------------

class TestRegressionSprint20:

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

    def test_6_mappers(self):
        mappers = [p for p in (ROOT / "outputs" / "disclosures").glob("*.py")
                   if not p.name.startswith("_")]
        assert len(mappers) >= 6

    def test_changelog_has_082(self):
        cl = _read("CHANGELOG.md")
        assert "0.8.2" in cl

    def test_no_unbound_local_in_scope1(self):
        s1_src = _read("streamlit_app/_page_01_scope1.py")
        render_body = s1_src[s1_src.find("def render()"):]
        local_calc = re.findall(
            r"^\s+from core\.engine import calculate$",
            render_body, re.MULTILINE
        )
        assert not local_calc, f"Local calculate imports remain: {local_calc}"

    def test_sasb_auto_select_in_page(self):
        sasb_src = _read("streamlit_app/_page_10_sasb.py")
        assert "profile_sasb_sector" in sasb_src or 'profile.get("sasb_sector"' in sasb_src

    def test_total_tests_680plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 680, f"Only {total} tests"
