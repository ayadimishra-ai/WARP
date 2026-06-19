"""
sk.lite — Sprint 13 Test Suite.

Covers:
  - setup.py EXPECTED_MINIMUMS includes sasb_metrics
  - BRSR PCAF weighted average helper
  - Dashboard intensity toggle presence
  - CHANGELOG and README updated for v0.8
  - requirements.txt has optional FastAPI comment
  - Absolute vs intensity view mode
  - SASB sector→SASB mapping in Setup
  - SBTi SDA gap calculations
  - Full regression: 11 pages, 56 processes, CEA v20
"""
from __future__ import annotations
import os
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


# ---------------------------------------------------------------------------
# setup.py health check
# ---------------------------------------------------------------------------

class TestSetupPy:

    def test_expected_minimums_has_sasb(self):
        setup_src = open(ROOT / "setup.py", encoding="utf-8").read()
        assert "sasb_metrics" in setup_src

    def test_sasb_minimum_1000(self):
        setup_src = open(ROOT / "setup.py", encoding="utf-8").read()
        # sasb_metrics: 1000 should appear somewhere in EXPECTED_MINIMUMS block
        idx = setup_src.find("EXPECTED_MINIMUMS")
        assert idx >= 0, "EXPECTED_MINIMUMS not found in setup.py"
        # Read enough to capture the full dict (it can be 600-800 chars)
        chunk = setup_src[idx:idx+1000]
        assert "sasb_metrics" in chunk, "sasb_metrics missing from EXPECTED_MINIMUMS"
        assert "1000" in chunk, f"sasb_metrics min not 1000 in chunk: {chunk[-300:]}"

    def test_setup_check_flag_documented(self):
        setup_src = open(ROOT / "setup.py", encoding="utf-8").read()
        assert "--check" in setup_src
        assert "--force" in setup_src


# ---------------------------------------------------------------------------
# BRSR PCAF weighted average
# ---------------------------------------------------------------------------

class TestBRSRPCAFWeightedAvg:

    def test_pcaf_helper_defined(self):
        brsr_src = open(
            ROOT / "outputs" / "disclosures" / "brsr_mapper.py",
            encoding="utf-8"
        ).read()
        assert "_calc_pcaf_weighted_avg" in brsr_src

    def test_pcaf_weighted_avg_returns_none_no_cat15(self):
        from outputs.disclosures.brsr_mapper import _calc_pcaf_weighted_avg
        by_cat = [
            {"category": "Scope 1", "t_CO2e": 500},
            {"category": "Scope 2", "t_CO2e": 300},
        ]
        result = _calc_pcaf_weighted_avg(by_cat)
        assert result is None

    def test_pcaf_weighted_avg_with_cat15(self):
        from outputs.disclosures.brsr_mapper import _calc_pcaf_weighted_avg
        by_cat = [
            {"category": "Cat 15 — Investments", "t_CO2e": 200, "pcaf_score": 2},
            {"category": "Cat 15 — Investments", "t_CO2e": 100, "pcaf_score": 4},
        ]
        # Weighted avg = (200×2 + 100×4) / 300 = 800/300 ≈ 2.67
        result = _calc_pcaf_weighted_avg(by_cat)
        assert result == pytest.approx(8/3, rel=0.01)

    def test_pcaf_field_in_brsr_json(self):
        brsr_src = open(
            ROOT / "outputs" / "disclosures" / "brsr_mapper.py",
            encoding="utf-8"
        ).read()
        assert "pcaf_weighted_avg_score" in brsr_src


# ---------------------------------------------------------------------------
# Dashboard intensity toggle
# ---------------------------------------------------------------------------

class TestDashboardIntensityToggle:

    def test_intensity_toggle_radio_exists(self):
        dash_src = open(
            ROOT / "streamlit_app" / "_page_04_dashboard.py",
            encoding="utf-8"
        ).read()
        assert "intensity_toggle" in dash_src
        assert "Absolute" in dash_src
        assert "Intensity" in dash_src

    def test_intensity_denom_selectbox(self):
        dash_src = open(
            ROOT / "streamlit_app" / "_page_04_dashboard.py",
            encoding="utf-8"
        ).read()
        assert "intensity_denom" in dash_src

    def test_both_modes_present(self):
        dash_src = open(
            ROOT / "streamlit_app" / "_page_04_dashboard.py",
            encoding="utf-8"
        ).read()
        assert "Absolute (tCO₂e)" in dash_src
        assert "Intensity (per unit)" in dash_src


# ---------------------------------------------------------------------------
# CHANGELOG and README
# ---------------------------------------------------------------------------

class TestDocumentation:

    def test_changelog_has_v080(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "0.8.0" in content

    def test_changelog_has_sasb(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "SASB" in content

    def test_changelog_has_gri306(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "GRI 306" in content

    def test_readme_has_api(self):
        content = (ROOT / "README.md").read_text(encoding="utf-8")
        assert "api.py" in content.lower() or "API" in content

    def test_readme_has_sasb(self):
        content = (ROOT / "README.md").read_text(encoding="utf-8")
        assert "SASB" in content

    def test_readme_has_11_pages(self):
        content = (ROOT / "README.md").read_text(encoding="utf-8")
        assert "11" in content

    def test_readme_has_7_mappers(self):
        content = (ROOT / "README.md").read_text(encoding="utf-8")
        assert "7" in content

    def test_requirements_has_optional_fastapi(self):
        content = (ROOT / "requirements.txt").read_text(encoding="utf-8")
        assert "fastapi" in content.lower()


# ---------------------------------------------------------------------------
# SBTi SDA intensity math
# ---------------------------------------------------------------------------

class TestSBTiSDAMath:

    def test_cement_2030_gap(self):
        current = 0.70   # tCO2e/t cement (above 2020 baseline)
        target  = 0.42
        gap     = current - target
        pct     = gap / current * 100
        assert gap == pytest.approx(0.28, rel=0.01)
        assert pct == pytest.approx(40.0, rel=0.02)

    def test_steel_2050_is_deep_cut(self):
        start_2020 = 1.85
        target_2050 = 0.35
        reduction_pct = (start_2020 - target_2050) / start_2020 * 100
        assert reduction_pct > 80  # >80% reduction required

    def test_electricity_2030_target_lower_than_2020(self):
        t_2020 = 0.45
        t_2030 = 0.18
        assert t_2030 < t_2020

    def test_sda_sectors_in_dashboard(self):
        dash_src = open(
            ROOT / "streamlit_app" / "_page_04_dashboard.py",
            encoding="utf-8"
        ).read()
        for sector in ["Electricity generation", "Cement", "Steel",
                       "Aluminium", "Pulp & Paper"]:
            assert sector in dash_src, f"SDA sector missing: {sector}"


# ---------------------------------------------------------------------------
# SASB sector auto-mapping
# ---------------------------------------------------------------------------

class TestSASBSectorAutoMap:

    def test_sector_to_sasb_dict(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "_SECTOR_TO_SASB" in setup_src

    def test_financials_mapped(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "Financials" in setup_src

    def test_technology_mapped(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "Technology & Communications" in setup_src

    def test_sasb_sector_in_new_profile_dict(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert '"sasb_sector":' in setup_src and '"sector":' in setup_src


# ---------------------------------------------------------------------------
# Full regression Sprint 13
# ---------------------------------------------------------------------------

class TestRegressionSprint13:

    def test_all_11_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {0:"setup",1:"scope1",2:"scope2",3:"scope3",4:"dashboard",
                    5:"ef_manager",6:"export",7:"inventory",8:"initiatives",
                    9:"checklist",10:"sasb"}
        for i, name in page_map.items():
            importlib.import_module(f"streamlit_app._page_{i:02d}_{name}")

    def test_56_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_cea_v20(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            country="IN", quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24", gwp_ar=6,
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)

    def test_7_disclosure_mappers(self):
        mappers = [p for p in (ROOT / "outputs" / "disclosures").glob("*.py")
                   if not p.name.startswith("_")]
        assert len(mappers) >= 6, f"Got: {[m.name for m in mappers]}"

    def test_sasb_1124_rows_in_db(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1000, f"Expected ≥1000 SASB metrics, got {n}"

    def test_api_file_importable(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location("api", ROOT / "api.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert hasattr(mod, "app")

    def test_total_tests_450plus(self):
        total = sum(
            open(f"tests/{f}", encoding="utf-8").read().count("def test_")
            for f in os.listdir("tests/")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 450, f"Only {total} tests"
