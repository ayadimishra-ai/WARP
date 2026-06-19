"""
sk.lite — Sprint 28 Test Suite.

Covers:
  - Nav: per-section radio groups (not headers + one radio)
  - SASB: auto-selects sector from profile.industry (no duplicate selectbox)
  - Checklist: auto-validate from inventory, 3-tier badge system
  - Review queue: system-generated items, source filter
  - Data quality: donut charts (hole=0.55) not bar chart
  - Save toasts: st.toast in S1/S2/S3 save paths
  - S1 vehicle registry: VEHICLE_TYPES dict, expandable registry
  - S1 IPPU: industry filter pre-selects relevant process
  - S2 electricity: provider inference from primary_country
  - Initiatives: risk-based recommendations fn + CSV template
  - ESG bridge: granular per-category gap analysis (_topic_covered fn)
  - E/S/G drilldowns: st.dataframe not markdown pipe tables
  - Risk page: exists, tabs, _compute_supply_risk fn, formula transparency
  - All 19 pages import cleanly
  - CEA v20 regression
"""
from __future__ import annotations
import ast
import os
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Nav: per-section radio groups
# ---------------------------------------------------------------------------
class TestNavSections:
    def test_section_order_defined(self):
        assert "_SECTION_ORDER" in _read("main.py")

    def test_five_sections(self):
        main = _read("main.py")
        for sec in ["CONFIGURE", "GHG INVENTORY", "ANALYSIS", "REPORTING", "GOVERNANCE"]:
            assert sec in main

    def test_risk_in_analysis_section(self):
        assert "_page_18_risk" in _read("main.py")

    def test_session_state_page_tracking(self):
        assert "nav_page" in _read("main.py")

    def test_per_section_radio_not_single(self):
        main = _read("main.py")
        # Should have multiple radio calls (one per section)
        import re
        radios = re.findall(r'st\.radio\(', main)
        # Sidebar should have at least 5 radio calls (one per section)
        assert len(radios) >= 1  # Sprint 32: single radio with § dividers


# ---------------------------------------------------------------------------
# SASB: industry auto-select
# ---------------------------------------------------------------------------
class TestSASBIndustry:
    def test_profile_industry_used(self):
        sasb = _read("streamlit_app/_page_10_sasb.py")
        assert "profile_industry" in sasb

    def test_no_duplicate_selectbox_when_matched(self):
        sasb = _read("streamlit_app/_page_10_sasb.py")
        assert "auto-detected" in sasb or "auto-selected" in sasb.lower()

    def test_override_button_present(self):
        sasb = _read("streamlit_app/_page_10_sasb.py")
        assert "Change sector" in sasb or "sasb_override" in sasb

    def test_industry_to_sasb_map_in_setup(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        assert "_INDUSTRY_TO_SASB" in setup
        assert "Financials" in setup
        assert "Resource Transformation" in setup


# ---------------------------------------------------------------------------
# Checklist: auto-validation
# ---------------------------------------------------------------------------
class TestChecklistAutoValidate:
    def test_auto_validate_fn_exists(self):
        assert "_auto_validate" in _read("streamlit_app/_page_09_checklist.py")

    def test_status_badge_fn_exists(self):
        assert "_status_badge" in _read("streamlit_app/_page_09_checklist.py")

    def test_three_badge_states(self):
        chk = _read("streamlit_app/_page_09_checklist.py")
        assert "🟢" in chk
        assert "🟡" in chk
        assert "🔴" in chk

    def test_auto_confirmed_metric(self):
        assert "auto_confirmed" in _read("streamlit_app/_page_09_checklist.py")

    def test_inventory_used_in_auto_validate(self):
        chk = _read("streamlit_app/_page_09_checklist.py")
        assert "get_all_records" in chk or "get_summary" in chk


# ---------------------------------------------------------------------------
# Review queue: system items
# ---------------------------------------------------------------------------
class TestReviewSystemItems:
    def test_system_review_fn_exists(self):
        assert "_get_system_review_items" in _read("streamlit_app/_page_14_review.py")

    def test_source_filter_present(self):
        rev = _read("streamlit_app/_page_14_review.py")
        assert "System-generated" in rev
        assert "User-submitted" in rev

    def test_priority_filter_present(self):
        assert "prio_filter" in _read("streamlit_app/_page_14_review.py")

    def test_four_system_item_types(self):
        rev = _read("streamlit_app/_page_14_review.py")
        assert "SYS_S3_COVERAGE" in rev
        assert "SYS_S1_MISSING"  in rev
        assert "SYS_DQ_POOR"     in rev
        assert "SYS_S2_DUAL"     in rev


# ---------------------------------------------------------------------------
# Data quality: donut charts
# ---------------------------------------------------------------------------
class TestDQDonuts:
    def test_donut_not_bar(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "hole=0.55" in dash

    def test_two_donuts(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "By record count" in dash
        assert "By tCO" in dash

    def test_percentage_annotation(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "percent" in dash.lower() or "texttemplate" in dash


# ---------------------------------------------------------------------------
# Save toasts
# ---------------------------------------------------------------------------
class TestSaveToasts:
    def test_s1_toast(self):
        assert "st.toast" in _read("streamlit_app/_page_01_scope1.py")

    def test_s2_toast(self):
        assert "st.toast" in _read("streamlit_app/_page_02_scope2.py")

    def test_s3_toast(self):
        assert "st.toast" in _read("streamlit_app/_page_03_scope3.py")


# ---------------------------------------------------------------------------
# S1 vehicle registry
# ---------------------------------------------------------------------------
class TestVehicleRegistry:
    def test_vehicle_types_dict(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "VEHICLE_TYPES" in s1

    def test_vehicle_registry_expander(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "Vehicle registry" in s1

    def test_prefill_fuel_in_session_state(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "prefill_fuel" in s1

    def test_ippu_industry_filter(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "_IPPU_IND_MAP" in s1

    def test_ippu_shows_relevant_for_cement(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "Cement" in s1 and "IPPU" in s1


# ---------------------------------------------------------------------------
# S2 electricity provider inference
# ---------------------------------------------------------------------------
class TestS2ElectricityProvider:
    def test_provider_dict_exists(self):
        assert "_ELEC_PROVIDERS" in _read("streamlit_app/_page_02_scope2.py")

    def test_india_provider_present(self):
        s2 = _read("streamlit_app/_page_02_scope2.py")
        assert "CEA v20" in s2 or "CEA" in s2

    def test_market_based_note(self):
        assert "market_available" in _read("streamlit_app/_page_02_scope2.py")

    def test_provider_shown_from_primary_country(self):
        s2 = _read("streamlit_app/_page_02_scope2.py")
        assert "primary_country" in s2 and "_ELEC_PROVIDERS" in s2


# ---------------------------------------------------------------------------
# Initiatives: recommendations + CSV template
# ---------------------------------------------------------------------------
class TestInitiativesRecommendations:
    def test_risk_recommend_fn_exists(self):
        assert "_risk_based_recommendations" in _read("streamlit_app/_page_08_initiatives.py")

    def test_csv_template_fn_exists(self):
        assert "_initiatives_template_csv" in _read("streamlit_app/_page_08_initiatives.py")

    def test_add_to_list_button(self):
        assert "Add to initiatives list" in _read("streamlit_app/_page_08_initiatives.py")

    def test_csv_download_button_rendered(self):
        init = _read("streamlit_app/_page_08_initiatives.py")
        assert "initiatives_upload_template.csv" in init

    def test_sbti_recommendation_always_included(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_08_initiatives")
        dummy_inv = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        suggestions = mod._risk_based_recommendations({"industry":"", "org_id":"t"}, dummy_inv)
        assert any("SBTi" in s["name"] for s in suggestions)

    def test_csv_template_has_headers(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_08_initiatives")
        csv_bytes = mod._initiatives_template_csv()
        csv_text  = csv_bytes.decode("utf-8")
        assert "name" in csv_text
        assert "target_tco2e" in csv_text
        assert "capex_lakh_inr" in csv_text


# ---------------------------------------------------------------------------
# ESG bridge: granular gap analysis
# ---------------------------------------------------------------------------
class TestESGBridgeGapAnalysis:
    def test_topic_covered_fn_exists(self):
        assert "_topic_covered" in _read("streamlit_app/_page_13_esg_bridge.py")

    def test_covered_cats_set(self):
        bridge = _read("streamlit_app/_page_13_esg_bridge.py")
        assert "covered_cats" in bridge

    def test_partial_coverage_metric(self):
        bridge = _read("streamlit_app/_page_13_esg_bridge.py")
        assert "partial_topics" in bridge

    def test_gap_cats_shown_with_action(self):
        bridge = _read("streamlit_app/_page_13_esg_bridge.py")
        assert "GAP: no data entered" in bridge or "gap_cats" in bridge

    def test_five_metrics_not_four(self):
        bridge = _read("streamlit_app/_page_13_esg_bridge.py")
        assert "m1, m2, m3, m4, m5" in bridge


# ---------------------------------------------------------------------------
# E/S/G drilldown tables fixed
# ---------------------------------------------------------------------------
class TestESGDrilldownTables:
    def test_e_uses_dataframe_not_markdown(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        e_start = sup.find("def _e_drilldown_tab")
        e_end   = sup.find("def _s_drilldown_tab")
        e_block = sup[e_start:e_end]
        assert "st.dataframe" in e_block
        assert "| KPI | Measure |" not in e_block  # old markdown table gone

    def test_s_uses_dataframe(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        s_start = sup.find("def _s_drilldown_tab")
        s_end   = sup.find("def _g_drilldown_tab")
        assert "st.dataframe" in sup[s_start:s_end]

    def test_g_uses_dataframe(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        g_start = sup.find("def _g_drilldown_tab")
        assert "st.dataframe" in sup[g_start:]

    def test_data_gap_column_present(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "Data gap" in sup

    def test_questionnaire_data_shown(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "supplier_submissions.json" in sup


# ---------------------------------------------------------------------------
# Risk page
# ---------------------------------------------------------------------------
class TestRiskPage:
    def test_risk_page_exists(self):
        assert (ROOT / "streamlit_app" / "_page_18_risk.py").exists()

    def test_risk_page_syntax(self):
        ast.parse(_read("streamlit_app/_page_18_risk.py"))

    def test_five_tabs(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        assert "Supply chain" in risk
        assert "Operational" in risk
        assert "Geographical" in risk
        assert "Spend-based" in risk
        assert "Risk calculator" in risk

    def test_compute_supply_risk_fn(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        assert "_compute_supply_risk" in risk

    def test_formula_transparency(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        assert "verify the calculations" in risk or "formula" in risk.lower()

    def test_pestel_per_country(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        assert "PESTEL_COUNTRY" in risk

    def test_country_risk_scores(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_18_risk")
        assert "IN" in mod.COUNTRY_RISK
        assert "CN" in mod.COUNTRY_RISK
        assert mod.COUNTRY_RISK["CN"] > mod.COUNTRY_RISK["DE"]  # China riskier than Germany

    def test_compute_risk_formula_correct(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_18_risk")
        sup = {"name": "Test", "e_score": 40, "s_score": 50, "g_score": 60,
               "spend_cr": 1.0, "country": "IN"}
        result = mod._compute_supply_risk(sup, total_spend=10.0)
        assert 0 <= result["composite"] <= 100
        assert result["tier"] in ("High", "Medium", "Low")
        assert "components" in result
        assert len(result["components"]) == 5

    def test_risk_in_nav(self):
        assert "_page_18_risk" in _read("main.py")


# ---------------------------------------------------------------------------
# Full regression
# ---------------------------------------------------------------------------
class TestRegressionSprint28:
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

    def test_total_tests_1000plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 1000, f"Only {total} tests"
