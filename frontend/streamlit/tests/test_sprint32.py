"""
sk.lite — Sprint 32 Test Suite.

KEY INSIGHT: Why standard tests miss Streamlit UI bugs
======================================================
`sys.modules['streamlit'] = MagicMock()` means:
  - st.tabs() returns a MagicMock, not real tab objects
  - `with step1:` succeeds regardless of indentation (mocks support __enter__)
  - Content OUTSIDE a `with` block still executes without error
  - So indentation bugs (content in wrong tab) are INVISIBLE to import tests

FIX: Structural tests inspect the SOURCE CODE directly:
  - Parse AST to verify `with` block body contains correct widgets
  - Check indentation levels in raw text to verify isolation
  - Verify that st.* calls appear at correct nesting depth

Sprint 32 covers:
  - Setup wizard: all 6 steps structurally isolated (content at indent ≥8)
  - Nav: § radio dividers, session state routing
  - Branding: no "GHG Calculator" strings anywhere in production code
  - Recommendations engine: why/how/profitability/methodology
  - Supplier portal → ESG auto-update
  - Knowledge base: 5 tabs, SASB primitives, in-use filter
  - CEA v20 regression
"""
from __future__ import annotations
import ast
import os
import re
import sys
import unittest.mock as mock
from pathlib import Path

import pytest

sys.modules.setdefault("streamlit", mock.MagicMock())

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# STRUCTURAL TESTS — these catch UI isolation bugs that import tests miss
# ---------------------------------------------------------------------------

class TestSetupStructural:
    """
    Verify that each Setup wizard tab contains ONLY its own content.
    Tests work by checking raw source indentation — not by mocking Streamlit.

    In Python, content inside `with step1:` must be indented ≥ 8 spaces
    (4 for render() body + 4 for the with block).
    Content at indent < 8 is OUTSIDE the with block and appears in EVERY tab.
    """

    def _get_step_block(self, setup_src: str, step_n: int) -> str:
        """Extract raw source lines belonging to step N (supports up to 8 steps)."""
        tag  = f"    with step{step_n}:\n"
        next_tag = f"    with step{step_n + 1}:\n" if step_n < 8 else None
        start = setup_src.find(tag)
        assert start >= 0, f"with step{step_n}: not found in setup page"
        end = setup_src.find(next_tag) if next_tag else len(setup_src)
        return setup_src[start + len(tag):end]

    def _leaking_lines(self, block: str) -> list[str]:
        """Return lines that are at indent < 8 (outside the with block)."""
        return [
            l.strip()
            for l in block.split("\n")
            if l.strip()
            and not l.strip().startswith("#")
            and (len(l) - len(l.lstrip())) < 8
        ]

    def test_six_steps_exist(self):
        """Setup now has 8 tabs (step1–step8). Verify all 8 exist."""
        setup = _read("streamlit_app/_page_00_setup.py")
        for i in range(1, 9):
            assert f"with step{i}:" in setup, f"Missing with step{i}:"

    def test_step1_organisation_isolated(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 1)
        bad = self._leaking_lines(block)
        assert not bad, f"Step 1 has {len(bad)} lines OUTSIDE the with block: {bad[:3]}"

    def test_step2_reporting_isolated(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 2)
        bad = self._leaking_lines(block)
        assert not bad, f"Step 2 has {len(bad)} lines OUTSIDE the with block: {bad[:3]}"

    def test_step3_boundary_isolated(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 3)
        bad = self._leaking_lines(block)
        assert not bad, f"Step 3 has {len(bad)} lines OUTSIDE the with block: {bad[:3]}"

    def test_step4_suppliers_isolated(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 4)
        bad = self._leaking_lines(block)
        assert not bad, f"Step 4 has {len(bad)} lines OUTSIDE the with block: {bad[:3]}"

    def test_step5_intensity_isolated(self):
        """Step 5 is now Frameworks selection (was Intensity in 6-step layout)."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 5)
        bad = self._leaking_lines(block)
        assert not bad, f"Step 5 has {len(bad)} lines OUTSIDE the with block: {bad[:3]}"

    def test_step6_save_isolated(self):
        """Step 6 is now Sites & plants (was Review/Save in 6-step layout)."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 6)
        bad = self._leaking_lines(block)
        assert not bad, f"Step 6 has {len(bad)} lines OUTSIDE the with block: {bad[:3]}"

    def test_step1_contains_org_name_input(self):
        """Organisation name input must be inside step1, not floating."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 1)
        assert "org_name" in block, "org_name input not found in step1 block"

    def test_step2_contains_reporting_year(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 2)
        assert "reporting_year" in block or "Reporting period" in block

    def test_step3_contains_boundary_radio(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 3)
        assert "boundary" in block or "Consolidation" in block

    def test_step4_contains_org_role(self):
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 4)
        assert "org_role" in block or "supplier" in block.lower()

    def test_step5_contains_revenue_input(self):
        """Step 5 is Frameworks — check for framework content."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 5)
        assert "framework" in block.lower() or "BRSR" in block or "GRI" in block, \
            "Step 5 (Frameworks) missing framework content"

    def test_step6_contains_save_button(self):
        """Step 6 is Sites & plants — check for site/city content."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 6)
        assert "site" in block.lower() or "city" in block.lower() or "plant" in block.lower(), \
            "Step 6 (Sites) missing site/city content"

    def test_step7_contains_intensity_metrics(self):
        """Step 7 is Intensity metrics — check for revenue/employees."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 7)
        assert "revenue" in block.lower() or "intensity" in block.lower() or "employees" in block.lower(), \
            "Step 7 (Intensity) missing revenue/intensity content"

    def test_step8_contains_save_button(self):
        """Step 8 is Review & Save — must have save button and setup_done."""
        setup = _read("streamlit_app/_page_00_setup.py")
        block = self._get_step_block(setup, 8)
        assert "Save profile" in block or "setup_done" in block, \
            "Step 8 (Review & Save) missing Save profile button or setup_done"


class TestInitiativesStructural:
    """Verify initiatives tabs contain correct content."""

    def _get_tab_block(self, src: str, tab_var: str, next_tab: str = None) -> str:
        tag      = f"    with {tab_var}:\n"
        next_tag = f"    with {next_tab}:\n" if next_tab else None
        start    = src.find(tag)
        assert start >= 0, f"{tab_var} block not found"
        end = src.find(next_tag) if next_tag else len(src)
        return src[start + len(tag):end]

    def test_three_tabs_defined(self):
        assert "_ini_tab1, _ini_tab2, _ini_tab3" in _read("streamlit_app/_page_08_initiatives.py")

    def test_tab1_contains_filter_not_mac(self):
        src = _read("streamlit_app/_page_08_initiatives.py")
        block = self._get_tab_block(src, "_ini_tab1", "_ini_tab2")
        assert "f_status" in block or "Filter" in block
        assert "MAC" not in block and "Marginal Abatement" not in block

    def test_tab2_contains_mac_curve(self):
        src = _read("streamlit_app/_page_08_initiatives.py")
        block = self._get_tab_block(src, "_ini_tab2", "_ini_tab3")
        assert "MAC" in block or "Marginal Abatement" in block

    def test_tab3_contains_recommendations(self):
        src = _read("streamlit_app/_page_08_initiatives.py")
        block = self._get_tab_block(src, "_ini_tab3")
        assert "inventory_recommendations" in block or "_risk_based_recommendations" in block

    def test_tab3_recommendations_have_why(self):
        assert "Why this is recommended" in _read("streamlit_app/_page_08_initiatives.py")

    def test_tab3_recommendations_have_how(self):
        assert "How to implement" in _read("streamlit_app/_page_08_initiatives.py")

    def test_tab3_recommendations_have_business_case(self):
        assert "Business case" in _read("streamlit_app/_page_08_initiatives.py")


class TestDashboardStructural:
    """Verify dashboard tabs contain correct widgets."""

    def test_tab4_dq_passes_all_recs(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        # Find tab4 block
        t4 = dash[dash.find("    with tab4:"):dash.find("    with tab5:")]
        assert "all_recs" in t4

    def test_tab5_sbti_in_sbti_tab(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        t5_start = dash.find("    with tab5:")
        t6_start = dash.find("    with tab6:")
        t5 = dash[t5_start:t6_start]
        assert "_sbti_tab" in t5

    def test_dq_function_uses_all_recs_not_just_fb(self):
        dash = _read("streamlit_app/_page_04_dashboard.py")
        assert "_quality_source = all_recs" in dash
        # Must NOT use raw fb for the donuts (which only has fallback records)
        dq_fn = dash[dash.find("def _data_quality_tab"):dash.find("\ndef _year_comparison")]
        assert "_quality_source" in dq_fn


# ---------------------------------------------------------------------------
# Branding: no GHG Calculator in production code
# ---------------------------------------------------------------------------

class TestBrandingComplete:

    PRODUCTION_DIRS = [
        "streamlit_app", "core", "modules", "ef_store",
        "inventory", "outputs", "utils",
    ]

    def _scan_dir(self, dirname: str) -> list[tuple]:
        hits = []
        p = ROOT / dirname
        if not p.exists():
            return hits
        for f in p.rglob("*.py"):
            src = f.read_text(encoding="utf-8", errors="ignore")
            for i, line in enumerate(src.split("\n"), 1):
                if "GHG Calculator" in line:
                    hits.append((str(f.relative_to(ROOT)), i, line.strip()))
        return hits

    def test_no_ghg_calculator_in_streamlit_app(self):
        hits = self._scan_dir("streamlit_app")
        assert not hits, f"GHG Calculator still in streamlit_app: {hits[:3]}"

    def test_no_ghg_calculator_in_core(self):
        hits = self._scan_dir("core")
        assert not hits, f"GHG Calculator still in core: {hits[:3]}"

    def test_no_ghg_calculator_in_modules(self):
        hits = self._scan_dir("modules")
        assert not hits, f"GHG Calculator still in modules: {hits[:3]}"

    def test_no_ghg_calculator_in_outputs(self):
        hits = self._scan_dir("outputs")
        assert not hits, f"GHG Calculator still in outputs: {hits[:3]}"

    def test_page_title_is_sk_lite(self):
        assert 'page_title="sk.lite"' in _read("main.py")

    def test_api_title_is_sk_lite(self):
        if (ROOT / "api.py").exists():
            assert "GHG Calculator" not in _read("api.py")

    def test_readme_mentions_sk_lite(self):
        if (ROOT / "README.md").exists():
            assert "sk.lite" in _read("README.md")

    def test_report_generator_uses_sk_lite(self):
        if (ROOT / "outputs/report.py").exists():
            assert "GHG Calculator" not in _read("outputs/report.py")


# ---------------------------------------------------------------------------
# Nav: structural check
# ---------------------------------------------------------------------------

class TestNavStructural:

    def test_single_radio_with_dividers(self):
        main = _read("main.py")
        nav_block = main[main.find("_SECTION_ORDER"):
                         main.find('page = st.session_state["_nav_page"]')]
        assert "st.radio" in nav_block, "Nav must use st.radio"
        assert "§" in nav_block, "Nav must use § as divider prefix"

    def test_dividers_not_selectable(self):
        main = _read("main.py")
        assert 'startswith("§")' in main or "startswith('§')" in main

    def test_page_tracked_in_session_state(self):
        assert "_nav_page" in _read("main.py")

    def test_five_sections_defined(self):
        main = _read("main.py")
        for sec in ["CONFIGURE", "GHG INVENTORY", "ANALYSIS", "REPORTING", "GOVERNANCE"]:
            assert sec in main


# ---------------------------------------------------------------------------
# Recommendations engine
# ---------------------------------------------------------------------------

class TestRecommendationsEngine:

    def test_engine_module_exists(self):
        assert (ROOT / "streamlit_app" / "recommendations.py").exists()

    def test_engine_imports_cleanly(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        assert hasattr(mod, "inventory_recommendations")
        assert hasattr(mod, "build_recommendation")

    def test_each_recommendation_has_why(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        recs = mod.inventory_recommendations(
            {"industry": "Manufacturing", "org_id": "t", "reporting_year": 2024},
            dummy,
        )
        assert len(recs) >= 2
        for r in recs:
            assert "why" in r, f"Missing 'why' in rec: {r.get('name')}"

    def test_each_recommendation_has_how(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        recs = mod.inventory_recommendations(
            {"industry": "Logistics", "org_id": "t", "reporting_year": 2024}, dummy
        )
        for r in recs:
            assert "how" in r, f"Missing 'how' in rec: {r.get('name')}"

    def test_each_recommendation_has_profitability(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        recs = mod.inventory_recommendations(
            {"industry": "", "org_id": "t", "reporting_year": 2024}, dummy
        )
        for r in recs:
            assert "profitability" in r

    def test_sbti_always_included(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: [],
            "get_summary":     lambda *a, **kw: {},
        })()
        recs = mod.inventory_recommendations({"industry": "", "org_id": "t"}, dummy)
        assert any("SBTi" in r["name"] for r in recs)

    def test_high_s2_triggers_renewable_rec(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        # 80% S2
        rows = [{"scope": "Scope 2", "t_CO2e": 800}] + \
               [{"scope": "Scope 1", "t_CO2e": 200}]
        dummy = type("I", (), {
            "get_all_records": lambda *a, **kw: rows,
            "get_summary":     lambda *a, **kw: {},
        })()
        recs = mod.inventory_recommendations({"industry": "", "org_id": "t"}, dummy)
        assert any("renewable" in r["name"].lower() or "solar" in r["name"].lower()
                   for r in recs)

    def test_profitability_has_roi(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        r = mod.build_recommendation(
            name="Test", category="Energy efficiency", scope="Scope 2",
            rationale="Test", target_tco2e=100.0, rec_type="renewable_energy",
        )
        assert "ROI" in r["profitability"] or "%" in r["profitability"]

    def test_profitability_impact_library_has_six_types(self):
        import importlib
        mod = importlib.import_module("streamlit_app.recommendations")
        assert len(mod.PROFITABILITY_IMPACTS) >= 6


# ---------------------------------------------------------------------------
# Supplier portal → ESG auto-update
# ---------------------------------------------------------------------------

class TestSupplierPortalESGUpdate:

    def test_portal_calculates_e_score(self):
        portal = _read("streamlit_app/_page_15_supplier_portal.py")
        assert "e_score" in portal and ("e = 40" in portal or "e_score" in portal)

    def test_portal_calculates_s_score(self):
        assert "s_score" in _read("streamlit_app/_page_15_supplier_portal.py")

    def test_portal_calculates_g_score(self):
        assert "g_score" in _read("streamlit_app/_page_15_supplier_portal.py")

    def test_portal_updates_risk_tier(self):
        portal = _read("streamlit_app/_page_15_supplier_portal.py")
        assert "risk" in portal and ("High" in portal or "Medium" in portal)

    def test_portal_logs_to_audit(self):
        assert "auto-updated" in _read("streamlit_app/_page_15_supplier_portal.py")


# ---------------------------------------------------------------------------
# Knowledge base: 5 tabs, SASB primitives
# ---------------------------------------------------------------------------

class TestKnowledgeBaseSprint32:

    def test_five_tabs(self):
        assert "kb1, kb2, kb3, kb4, kb5" in _read("streamlit_app/_page_16_knowledge.py")

    def test_tab4_is_sasb_primitives(self):
        kb = _read("streamlit_app/_page_16_knowledge.py")
        # kb4 should contain _sasb_primitives_section call
        t4_start = kb.find("    with kb4:")
        t5_start = kb.find("    with kb5:")
        t4_block = kb[t4_start:t5_start]
        assert "_sasb_primitives_section" in t4_block

    def test_22_primitives_defined(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_16_knowledge")
        assert len(mod._PRIMITIVE_LABELS) == 22

    def test_primitives_include_ge_and_eu(self):
        import importlib
        mod = importlib.import_module("streamlit_app._page_16_knowledge")
        assert "GE" in mod._PRIMITIVE_LABELS  # GHG emissions
        assert "EU" in mod._PRIMITIVE_LABELS  # Energy use

    def test_in_use_filter_present(self):
        assert "show_in_use" in _read("streamlit_app/_page_16_knowledge.py")

    def test_ef_cards_styled(self):
        assert "border-radius:8px" in _read("streamlit_app/_page_16_knowledge.py")


# ---------------------------------------------------------------------------
# Full regression
# ---------------------------------------------------------------------------

class TestRegressionSprint32:

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

    def test_platform_admin_role(self):
        from streamlit_app.auth import ROLES
        assert "Platform Admin" in ROLES

    def test_branding_complete(self):
        main = _read("main.py")
        assert 'page_title="sk.lite"' in main
        assert "GHG Calculator" not in main

    def test_total_tests(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 1200, f"Only {total} tests"
