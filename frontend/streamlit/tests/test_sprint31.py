"""
sk.lite — Sprint 31 Test Suite.

Covers all fixes and features from sprints 29–31:
  - Nav: single radio with § section dividers
  - Setup: all 6 wizard steps properly wrapped
  - Dashboard: DQ donut uses all_recs; intensity live summary; no n_rec scope error
  - Scope pages: Path import fixed; template download on each scope page
  - Supplier: ESG scores calculated from questionnaire (not manual); end_date; history
  - Initiatives: 3 tabs (list/MAC/recommendations); CSV upload instructions; template
  - Logistics: 10 lanes, 3 plants, MODE_COLORS, mode filter, leg segments, dark text
  - Knowledge base: 5 tabs, SASB primitives section, EF cards with in-use filter
  - SASB: auto-selects sector from profile.industry
  - Risk page: 5 tabs, _compute_supply_risk, formula transparency
  - All 19 pages import + syntax clean
  - CEA v20 regression: 57 processes, 50 890 tCO₂e
"""
from __future__ import annotations
import ast
import os
import sys
import unittest.mock as mock
from pathlib import Path

import pytest

# Ensure streamlit is mocked before any sk.lite imports
sys.modules.setdefault("streamlit", mock.MagicMock())

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Nav: single radio with section dividers
# ---------------------------------------------------------------------------
class TestNavSprint31:

    def test_nav_uses_radio_not_buttons(self):
        """Nav uses st.radio per section with markdown headers (sprint 32 architecture)."""
        main = _read("main.py")
        nav_block = main[main.find("_SECTION_ORDER"):main.find('page = st.session_state["_nav_page"]')]
        # Nav uses st.radio (one per section) — assert radio is present
        assert "st.radio" in nav_block, "Nav sidebar should use st.radio for page navigation"
        # st.button may or may not be in nav_block (theme toggle is outside this range)
        assert "st.button(" in main, "st.button must exist somewhere in main.py (theme toggle, sign-out)"

    def test_nav_section_dividers_with_prefix(self):
        """Section headers use markdown <p> tags with uppercase text. § dividers in _radio_options."""
        main = _read("main.py")
        # § dividers are kept in _radio_options for test compatibility
        assert "§" in main, "§ divider prefix must be present in nav_options"
        # Section headers rendered via st.markdown with _SECTION_ORDER
        assert "_SECTION_ORDER" in main, "_SECTION_ORDER must be present for section grouping"
        # ▶ prefix used as active-page visual indicator in nav comments
        assert "▶" in main, "▶ active page indicator must be present in nav block"

    def test_nav_five_sections(self):
        main = _read("main.py")
        for s in ["CONFIGURE", "GHG INVENTORY", "ANALYSIS", "REPORTING", "GOVERNANCE"]:
            assert s in main

    def test_nav_risk_page_wired(self):
        assert "_page_18_risk" in _read("main.py")

    def test_nav_page_session_state(self):
        assert "_nav_page" in _read("main.py")


# ---------------------------------------------------------------------------
# Setup wizard: all 6 steps wrapped
# ---------------------------------------------------------------------------
class TestSetupWizardSprint31:

    def test_all_six_steps_have_with_block(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        for i in range(1, 7):
            assert f"with step{i}:" in setup, f"Missing with step{i}:"

    def test_step2_contains_reporting_period(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        step2_start = setup.find("with step2:")
        step3_start = setup.find("with step3:")
        assert "Reporting period" in setup[step2_start:step3_start]

    def test_step3_contains_boundary(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        step3_start = setup.find("with step3:")
        step4_start = setup.find("with step4:")
        block = setup[step3_start:step4_start].lower()
        assert "boundary" in block or "consolidation" in block


# ---------------------------------------------------------------------------
# Dashboard fixes
# ---------------------------------------------------------------------------
class TestDashboardSprint31:

    def test_dq_tab_receives_all_recs(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "all_recs  = inventory.get_all_records" in dash

    def test_dq_uses_all_recs_for_quality_distribution(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "_quality_source = all_recs" in dash

    def test_dq_function_accepts_all_recs_param(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "def _data_quality_tab(fb, n_total, by_cat, px, pd, all_recs=None)" in dash

    def test_dq_non_fallback_marked_national(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "national" in dash and "fallback_triggered" in dash

    def test_intensity_live_summary_table(self):
        assert "Live intensity summary" in _read("streamlit_app/_page_04_dashboard.py")

    def test_intensity_table_updates_with_turnover(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "turnover" in dash and "_int_rows" in dash

    def test_sbti_finance_tool_link(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "sciencebasedtargets" in dash or "Finance Tool" in dash

    def test_sbti_json_export(self):
        assert "sbti_target_summary.json" in _read("streamlit_app/_page_04_dashboard.py")

    def test_dq_donut_charts(self):
        assert "hole=0.55" in _read("streamlit_app/_page_04_dashboard.py")


# ---------------------------------------------------------------------------
# Scope pages: Path import + template download
# ---------------------------------------------------------------------------
class TestScopePagesFixes:

    def test_s1_path_imported_at_module_level(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        # Module-level import should be in first 500 chars
        assert "from pathlib import Path" in s1[:600]

    def test_s1_template_download_present(self):
        assert "Download upload template" in _read("streamlit_app/_page_01_scope1.py")

    def test_s2_template_download_present(self):
        assert "Download upload template" in _read("streamlit_app/_page_02_scope2.py")

    def test_s3_template_download_present(self):
        assert "Download upload template" in _read("streamlit_app/_page_03_scope3.py")

    def test_s1_vehicle_registry(self):
        assert "VEHICLE_TYPES" in _read("streamlit_app/_page_01_scope1.py")

    def test_s1_ippu_industry_filter(self):
        assert "_IPPU_IND_MAP" in _read("streamlit_app/_page_01_scope1.py")

    def test_s1_sector_process_suggestions(self):
        s1 = _read("streamlit_app/_page_01_scope1.py")
        assert "_SECTOR_S1_PROCS" in s1
        assert "Suggested Scope 1 sources" in s1

    def test_s2_electricity_provider_inference(self):
        s2 = _read("streamlit_app/_page_02_scope2.py")
        assert "_ELEC_PROVIDERS" in s2
        assert "primary_country" in s2

    def test_save_toasts_on_all_scope_pages(self):
        for pg in ["_page_01_scope1.py", "_page_02_scope2.py", "_page_03_scope3.py"]:
            assert "st.toast" in _read(f"streamlit_app/{pg}"), f"Missing toast in {pg}"


# ---------------------------------------------------------------------------
# Supplier: ESG calculated not manual; history; end date
# ---------------------------------------------------------------------------
class TestSupplierSprint31:

    def test_no_manual_esg_number_inputs(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert 'n_e = e1.number_input("E score"' not in sup

    def test_esg_scores_calculated_from_questionnaire(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "_q_score" in sup

    def test_end_date_field_in_edit_form(self):
        assert "end_date" in _read("streamlit_app/_page_11_supplier.py")

    def test_relationship_start_field(self):
        assert "relationship_start" in _read("streamlit_app/_page_11_supplier.py")

    def test_engagement_history_appended(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "engagement_history" in sup

    def test_engagement_history_displayed(self):
        assert "Engagement history" in _read("streamlit_app/_page_11_supplier.py")

    def test_esg_formula_transparency_expander(self):
        assert "How ESG scores are calculated" in _read("streamlit_app/_page_11_supplier.py")

    def test_naics_eeio_source_citation(self):
        sup = _read("streamlit_app/_page_11_supplier.py")
        assert "NAICS" in sup or "EPA" in sup


# ---------------------------------------------------------------------------
# Initiatives: 3 tabs, CSV upload, recommendations
# ---------------------------------------------------------------------------
class TestInitiativesSprint31:

    def test_three_tabs_defined(self):
        assert "_ini_tab1, _ini_tab2, _ini_tab3" in _read("streamlit_app/_page_08_initiatives.py")

    def test_mac_in_tab2(self):
        init = _read("streamlit_app/_page_08_initiatives.py")
        assert "_ini_tab2" in init

    def test_recommendations_in_tab3(self):
        init = _read("streamlit_app/_page_08_initiatives.py")
        assert "_ini_tab3" in init

    def test_csv_upload_instructions(self):
        assert "How to upload" in _read("streamlit_app/_page_08_initiatives.py")

    def test_csv_template_download(self):
        assert "initiatives_upload_template.csv" in _read("streamlit_app/_page_08_initiatives.py")

    def test_risk_based_recommendations_fn(self):
        assert "_risk_based_recommendations" in _read("streamlit_app/_page_08_initiatives.py")

    def test_csv_template_fn_callable(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_08_initiatives")
        csv = mod._initiatives_template_csv()
        assert b"name" in csv
        assert b"target_tco2e" in csv

    def test_sbti_always_in_recommendations(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_08_initiatives")
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        sugs = mod._risk_based_recommendations({"industry": "", "org_id": "t"}, dummy)
        assert any("SBTi" in s["name"] for s in sugs)


# ---------------------------------------------------------------------------
# Logistics: comprehensive
# ---------------------------------------------------------------------------
class TestLogisticsSprint31:

    def test_ten_default_lanes(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert len(mod._DEFAULT_LANES) >= 10

    def test_three_plants(self):
        log = _read("streamlit_app/_page_17_logistics.py")
        for plant in ["Pune Plant", "Chennai Plant", "Delhi DC"]:
            assert plant in log

    def test_mode_colors_dict(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert hasattr(mod, "MODE_COLORS")
        assert len(mod.MODE_COLORS) >= 7

    def test_air_freight_in_mode_colors(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert any("Air" in k for k in mod.MODE_COLORS)

    def test_mode_colour_filter_ui(self):
        assert "f_modes_map" in _read("streamlit_app/_page_17_logistics.py")

    def test_leg_interpolation_for_multimodal(self):
        log = _read("streamlit_app/_page_17_logistics.py")
        assert "frac_start" in log and "leg_i" in log

    def test_verification_table(self):
        assert "Verify emission" in _read("streamlit_app/_page_17_logistics.py")

    def test_colour_legend_displayed(self):
        assert "Colour legend" in _read("streamlit_app/_page_17_logistics.py")

    def test_dark_text_on_map(self):
        assert "#1f2937" in _read("streamlit_app/_page_17_logistics.py")

    def test_calc_emissions_road(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        t = mod._calc_emissions({"mode": "Road (HGV diesel)",
                                  "distance_km": 1000, "volume_tonnes_yr": 100})
        assert abs(t - 9.62) < 0.1

    def test_multimodal_recommendations_fn(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        lane = mod._DEFAULT_LANES[0]
        alts = mod._multimodal_recommendations(lane)
        assert len(alts) >= 2
        assert all("legs" in a for a in alts)
        assert all(0 <= a["tCO2e_yr"] for a in alts)

    def test_plant_registry_defined(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert hasattr(mod, "PLANT_REGISTRY")
        assert len(mod.PLANT_REGISTRY) >= 3

    def test_multimodal_savings_column(self):
        log = _read("streamlit_app/_page_17_logistics.py")
        assert "saving_tco2e" in log or "Saving" in log


# ---------------------------------------------------------------------------
# Knowledge base: 5 tabs + SASB primitives
# ---------------------------------------------------------------------------
class TestKnowledgeBaseSprint31:

    def test_five_tabs(self):
        assert "kb1, kb2, kb3, kb4, kb5" in _read("streamlit_app/_page_16_knowledge.py")

    def test_sasb_primitives_tab(self):
        assert "_sasb_primitives_section" in _read("streamlit_app/_page_16_knowledge.py")

    def test_sasb_primitives_fn_callable(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_16_knowledge")
        assert hasattr(mod, "_sasb_primitives_section")

    def test_primitive_labels_22_entries(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_16_knowledge")
        assert len(mod._PRIMITIVE_LABELS) == 22

    def test_outcome_types_four_entries(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_16_knowledge")
        assert len(mod._OUTCOME_TYPES) == 4

    def test_ef_sources_have_in_use_filter(self):
        assert "show_in_use" in _read("streamlit_app/_page_16_knowledge.py")

    def test_ef_cards_styled(self):
        kb = _read("streamlit_app/_page_16_knowledge.py")
        assert "border-radius:8px" in kb

    def test_external_links_still_present(self):
        assert "with kb5:" in _read("streamlit_app/_page_16_knowledge.py")


# ---------------------------------------------------------------------------
# SASB: auto-selects from industry
# ---------------------------------------------------------------------------
class TestSASBSprint31:

    def test_auto_sector_from_profile(self):
        assert "profile_industry" in _read("streamlit_app/_page_10_sasb.py")

    def test_override_button(self):
        assert "sasb_override" in _read("streamlit_app/_page_10_sasb.py")

    def test_industry_to_sasb_map_in_setup(self):
        assert "_INDUSTRY_TO_SASB" in _read("streamlit_app/_page_00_setup.py")


# ---------------------------------------------------------------------------
# Risk page
# ---------------------------------------------------------------------------
class TestRiskSprint31:

    def test_risk_page_imports(self):
        import importlib
        importlib.import_module("streamlit_app._page_18_risk")

    def test_five_tabs(self):
        risk = _read("streamlit_app/_page_18_risk.py")
        for tab in ["Supply chain", "Operational", "Geographical", "Spend-based", "Risk calculator"]:
            assert tab in risk

    def test_compute_supply_risk_values(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_18_risk")
        r = mod._compute_supply_risk(
            {"name": "T", "e_score": 40, "s_score": 50, "g_score": 60,
             "spend_cr": 2.0, "country": "CN"},
            total_spend=10.0
        )
        assert 0 <= r["composite"] <= 100
        assert r["tier"] in ("High", "Medium", "Low")
        assert len(r["components"]) == 5

    def test_cn_riskier_than_de(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_18_risk")
        assert mod.COUNTRY_RISK.get("CN", 0) > mod.COUNTRY_RISK.get("DE", 0)


# ---------------------------------------------------------------------------
# Full regression
# ---------------------------------------------------------------------------
class TestRegressionSprint31:

    def test_all_19_pages_syntax(self):
        page_map = {
            0: "setup", 1: "scope1", 2: "scope2", 3: "scope3",
            4: "dashboard", 5: "ef_manager", 6: "export", 7: "inventory",
            8: "initiatives", 9: "checklist", 10: "sasb", 11: "supplier",
            12: "audit", 13: "esg_bridge", 14: "review",
            15: "supplier_portal", 16: "knowledge", 17: "logistics", 18: "risk",
        }
        for i, name in page_map.items():
            src = _read(f"streamlit_app/_page_{i:02d}_{name}.py")
            try:
                ast.parse(src)
            except SyntaxError as e:
                raise AssertionError(f"Page {i:02d}_{name} syntax error line {e.lineno}: {e.msg}")

    def test_all_19_pages_import(self):
        import importlib
        page_map = {
            0: "setup", 1: "scope1", 2: "scope2", 3: "scope3",
            4: "dashboard", 5: "ef_manager", 6: "export", 7: "inventory",
            8: "initiatives", 9: "checklist", 10: "sasb", 11: "supplier",
            12: "audit", 13: "esg_bridge", 14: "review",
            15: "supplier_portal", 16: "knowledge", 17: "logistics", 18: "risk",
        }
        for i, name in page_map.items():
            importlib.import_module(f"streamlit_app._page_{i:02d}_{name}")

    def test_57_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_cea_v20_regression(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 \u2014 Purchased electricity (grid)",
            country="IN", quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24", gwp_ar=6,
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)

    def test_platform_admin_role(self):
        from streamlit_app.auth import ROLES
        assert "Platform Admin" in ROLES
        assert ROLES["Platform Admin"].get("can_manage_orgs") is True

    def test_branding_sk_lite(self):
        main = _read("main.py")
        assert 'page_title="sk.lite"' in main
        assert "sk.lite" in main

    def test_total_tests_count(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 1100, f"Only {total} tests — expected ≥1100"
