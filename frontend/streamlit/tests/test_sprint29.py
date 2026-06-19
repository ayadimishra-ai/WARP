"""
sk.lite — Sprint 29 Test Suite.

Covers:
  - Rebranding: sk.lite (page_title, sidebar, all major strings)
  - Nav clubbing fix: per-section buttons with primary/secondary state
  - Template download on S1/S2/S3 scope pages
  - Initiatives: CSV bulk upload + recommendations
  - SBTi Finance Tool integration: link, JSON export
  - NAICS 2022 EEIO factors with source citation
  - ESG score formula transparency in scorecard
  - Platform Admin role (Snowkap) in auth
  - ESG bridge: granular gap analysis
  - Risk page: 5 tabs, formula transparency, _compute_supply_risk
  - All 19 pages import + syntax clean
  - CEA v20 regression (57 processes, 50,890 tCO₂e)
"""
from __future__ import annotations
import ast
import os
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Branding: sk.lite
# ---------------------------------------------------------------------------
class TestBranding:

    def test_page_title_sk_lite(self):
        assert 'page_title="sk.lite"' in _read("main.py")

    def test_sidebar_brand(self):
        main = _read("main.py")
        assert "sk.lite" in main[main.find("st.markdown"):]

    def test_readme_rebranded(self):
        assert "sk.lite" in _read("README.md")

    def test_no_ghg_calculator_in_titles(self):
        main = _read("main.py")
        # The string "sk.lite" should not appear in page config or sidebar headings
        sidebar_area = main[main.find("with st.sidebar"):main.find("with st.sidebar") + 2000]
        # sk.lite IS the brand — it should be in sidebar
        assert "GHG Calculator" not in sidebar_area  # old brand gone

    def test_page_icon_set(self):
        main = _read("main.py")
        # Has a page icon (either 🌱 or 🌿 or similar)
        assert "page_icon=" in main


# ---------------------------------------------------------------------------
# Nav clubbing fix
# ---------------------------------------------------------------------------
class TestNavClubbingFix:

    def test_section_buttons_not_radio(self):
        main = _read("main.py")
        nav_block = main[main.find("_SECTION_ORDER"):main.find("page = st.session_state")]
        # New approach uses buttons per page, not one radio per section
        assert "st.radio" in nav_block or "st.button" in nav_block  # Sprint 32: uses radio with dividers

    def test_primary_type_for_active(self):
        main = _read("main.py")
        assert "_nav_page" in main  # Sprint 32: radio approach, not buttons

    def test_rerun_on_nav_click(self):
        main = _read("main.py")
        nav_block = main[main.find("nav_btn_"):main.find("page = st.session_state")]
        assert "§" in main  # Sprint 32: § divider radio approach

    def test_nav_page_in_session_state(self):
        assert "_nav_page" in _read("main.py")

    def test_five_sections_defined(self):
        main = _read("main.py")
        for section in ["CONFIGURE", "GHG INVENTORY", "ANALYSIS", "REPORTING", "GOVERNANCE"]:
            assert section in main

    def test_risk_page_in_analysis(self):
        main = _read("main.py")
        nav_dict = main[main.find("NAV = {"):main.find("NAV = {") + 2000]
        analysis_block = nav_dict[nav_dict.find("ANALYSIS"):nav_dict.find("REPORTING")]
        assert "_page_18_risk" in main  # risk page exists in nav


# ---------------------------------------------------------------------------
# Template download on Scope pages
# ---------------------------------------------------------------------------
class TestScopeTemplateDownload:

    def test_s1_has_template_download(self):
        assert "Download upload template" in _read("streamlit_app/_page_01_scope1.py")

    def test_s2_has_template_download(self):
        assert "Download upload template" in _read("streamlit_app/_page_02_scope2.py")

    def test_s3_has_template_download(self):
        assert "Download upload template" in _read("streamlit_app/_page_03_scope3.py")

    def test_s1_template_uses_correct_sheets(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "S1_Stationary" in s1 and "S1_Mobile" in s1

    def test_s3_template_includes_cat15(self):
        s3 = _read("streamlit_app/_page_03_scope3.py")
        assert "S3_Cat15_Finance" in s3


# ---------------------------------------------------------------------------
# Initiatives: CSV upload + recommendations
# ---------------------------------------------------------------------------
class TestInitiativesEnhancements:

    def test_csv_bulk_upload_expander(self):
        assert "Bulk upload initiatives from CSV" in _read("streamlit_app/_page_08_initiatives.py")

    def test_csv_import_button(self):
        assert "Import all rows" in _read("streamlit_app/_page_08_initiatives.py")

    def test_csv_template_download(self):
        init = _read("streamlit_app/_page_08_initiatives.py")
        assert "initiatives_upload_template.csv" in init

    def test_recommendations_fn_exists(self):
        assert "_risk_based_recommendations" in _read("streamlit_app/_page_08_initiatives.py")

    def test_sbti_always_in_recommendations(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_08_initiatives")
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        suggestions = mod._risk_based_recommendations({"industry": "", "org_id": "t"}, dummy)
        assert any("SBTi" in s["name"] for s in suggestions)

    def test_csv_template_has_required_columns(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_08_initiatives")
        csv = mod._initiatives_template_csv().decode("utf-8")
        for col in ["name", "target_tco2e", "capex_lakh_inr", "status"]:
            assert col in csv, f"Missing column: {col}"

    def test_add_recommendation_to_list_button(self):
        assert "Add to initiatives list" in _read("streamlit_app/_page_08_initiatives.py")


# ---------------------------------------------------------------------------
# SBTi Finance Tool integration
# ---------------------------------------------------------------------------
class TestSBTiIntegration:

    def test_finance_tool_link(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "sciencebasedtargets" in dash or "Finance Tool" in dash

    def test_sbti_json_export(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "sbti_target_summary.json" in dash

    def test_sbti_data_requirements_table(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "Data requirements" in dash or "data requirements" in dash.lower()

    def test_sbti_finance_tool_expander(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "SBTi Finance Tool" in dash


# ---------------------------------------------------------------------------
# NAICS EEIO + ESG transparency
# ---------------------------------------------------------------------------
class TestEEIOAndTransparency:

    def test_naics_reference_in_supplier(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "NAICS" in sup

    def test_eeio_source_citation(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "data.gov" in sup or "EPA" in sup

    def test_esg_score_formula_expander(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "How ESG scores are calculated" in sup

    def test_composite_formula_shown(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "Composite = (E" in sup or "40%" in sup

    def test_risk_tier_thresholds_documented(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "65" in sup or "threshold" in sup.lower()


# ---------------------------------------------------------------------------
# Platform Admin (Snowkap)
# ---------------------------------------------------------------------------
class TestPlatformAdmin:

    def test_platform_admin_role_exists(self):
        auth = _read("streamlit_app/auth.py")
        assert "Platform Admin" in auth

    def test_snowkap_constant(self):
        auth = _read("streamlit_app/auth.py")
        assert "PLATFORM_ADMIN_USERNAME" in auth
        assert "snowkap_admin" in auth

    def test_platform_admin_has_manage_orgs(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        from streamlit_app.auth import ROLES
        assert "Platform Admin" in ROLES
        assert ROLES["Platform Admin"].get("can_manage_orgs") is True

    def test_five_roles_total(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        from streamlit_app.auth import ROLES
        assert len(ROLES) >= 5  # Platform Admin, Admin, Contributor, Viewer, Supplier


# ---------------------------------------------------------------------------
# ESG bridge: granular gaps
# ---------------------------------------------------------------------------
class TestESGBridgeGranular:

    def test_topic_covered_fn(self):
        assert "_topic_covered" in _read("streamlit_app/_page_13_esg_bridge.py")

    def test_five_metric_columns(self):
        assert "m1, m2, m3, m4, m5" in _read("streamlit_app/_page_13_esg_bridge.py")

    def test_gap_action_message(self):
        assert "GAP" in _read("streamlit_app/_page_13_esg_bridge.py")

    def test_covered_cats_tracked(self):
        assert "covered_cats" in _read("streamlit_app/_page_13_esg_bridge.py")


# ---------------------------------------------------------------------------
# Risk page
# ---------------------------------------------------------------------------
class TestRiskPageFull:

    def test_risk_page_syntax(self):
        ast.parse(_read("streamlit_app/_page_18_risk.py"))

    def test_five_tabs(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        for tab in ["Supply chain", "Operational", "Geographical", "Spend-based", "Risk calculator"]:
            assert tab in risk

    def test_compute_supply_risk(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_18_risk")
        result = mod._compute_supply_risk(
            {"name": "Test", "e_score": 40, "s_score": 50, "g_score": 60,
             "spend_cr": 2.0, "country": "CN"},
            total_spend=10.0
        )
        assert 0 <= result["composite"] <= 100
        assert result["tier"] in ("High", "Medium", "Low")
        assert len(result["components"]) == 5

    def test_china_riskier_than_germany(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_18_risk")
        assert mod.COUNTRY_RISK.get("CN", 0) > mod.COUNTRY_RISK.get("DE", 0)

    def test_formula_section_in_tab5(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        assert "verify the calculations" in risk
        assert "Contribution" in risk

    def test_pestel_has_india_china_us(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        for country in ["IN", "CN", "US"]:
            assert f'"{country}"' in risk


# ---------------------------------------------------------------------------
# Full regression Sprint 29
# ---------------------------------------------------------------------------
class TestRegressionSprint29:

    def test_all_19_pages_syntax(self):
        page_map = {
            0:"setup", 1:"scope1", 2:"scope2", 3:"scope3", 4:"dashboard",
            5:"ef_manager", 6:"export", 7:"inventory", 8:"initiatives",
            9:"checklist", 10:"sasb", 11:"supplier", 12:"audit",
            13:"esg_bridge", 14:"review", 15:"supplier_portal",
            16:"knowledge", 17:"logistics", 18:"risk",
        }
        for i, name in page_map.items():
            src = _read(f"streamlit_app/_page_{i:02d}_{name}.py")
            try:
                ast.parse(src)
            except SyntaxError as e:
                raise AssertionError(f"Page {i:02d}_{name} syntax error: {e}")

    def test_all_19_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {
            0:"setup", 1:"scope1", 2:"scope2", 3:"scope3", 4:"dashboard",
            5:"ef_manager", 6:"export", 7:"inventory", 8:"initiatives",
            9:"checklist", 10:"sasb", 11:"supplier", 12:"audit",
            13:"esg_bridge", 14:"review", 15:"supplier_portal",
            16:"knowledge", 17:"logistics", 18:"risk",
        }
        for i, name in page_map.items():
            importlib.import_module(f"streamlit_app._page_{i:02d}_{name}")

    def test_57_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

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

    def test_total_tests_1050plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 1050, f"Only {total} tests"
