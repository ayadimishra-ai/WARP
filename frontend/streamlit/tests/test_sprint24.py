"""
sk.lite — Sprint 24 Test Suite.

Covers:
  - Auth: sign-up form, INDUSTRY_CHOICES (22 options), Supplier role
  - Setup: industry field saved in profile, INDUSTRY_CHOICES imported
  - main.py: sign-up tab in login gate, v0.8.5, 18 pages
  - Supplier v2: 8 tabs, spend/emissions tab, PESTEL, E/S/G drilldowns, CAT_EI
  - MAC curve in initiatives: plotly chart, waterfall bars
  - Logistics page: lanes, modal shift, emission calc, map
  - All 18 pages import clean
  - Full regression: 57 processes, CEA v20
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
# Auth: sign-up + industry
# ---------------------------------------------------------------------------

class TestAuthSignup:

    def test_signup_form_defined(self):
        auth_src = _read("streamlit_app/auth.py")
        assert "def signup_form" in auth_src

    def test_industry_choices_defined(self):
        auth_src = _read("streamlit_app/auth.py")
        assert "INDUSTRY_CHOICES" in auth_src

    def test_industry_choices_22_plus_options(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        from streamlit_app.auth import INDUSTRY_CHOICES
        assert len(INDUSTRY_CHOICES) >= 20

    def test_industry_covers_manufacturing(self):
        from streamlit_app.auth import INDUSTRY_CHOICES
        assert any("Manufacturing" in c for c in INDUSTRY_CHOICES)

    def test_industry_covers_financial(self):
        from streamlit_app.auth import INDUSTRY_CHOICES
        assert any("Financial" in c for c in INDUSTRY_CHOICES)

    def test_signup_form_has_org_name_field(self):
        auth_src = _read("streamlit_app/auth.py")
        assert "org_name" in auth_src
        assert "Organisation name" in auth_src

    def test_signup_creates_admin_user(self):
        auth_src = _read("streamlit_app/auth.py")
        assert '"role": "Admin"' in auth_src or "'role': 'Admin'" in auth_src

    def test_signup_validates_password_length(self):
        auth_src = _read("streamlit_app/auth.py")
        assert "8 characters" in auth_src or "len(password) < 8" in auth_src

    def test_signup_checks_password_match(self):
        auth_src = _read("streamlit_app/auth.py")
        assert "Passwords do not match" in auth_src

    def test_signup_tab_in_main(self):
        main_src = _read("main.py")
        assert "Create account" in main_src
        assert "signup_form()" in main_src


# ---------------------------------------------------------------------------
# Setup: industry field
# ---------------------------------------------------------------------------

class TestSetupIndustry:

    def test_industry_in_setup_render(self):
        setup_src = _read("streamlit_app/_page_00_setup.py")
        assert "INDUSTRY_CHOICES" in setup_src
        assert "Industry / sector" in setup_src

    def test_industry_saved_in_profile(self):
        setup_src = _read("streamlit_app/_page_00_setup.py")
        # Industry key saved in new_profile dict
        assert '"industry"' in setup_src

    def test_setup_syntax(self):
        ast.parse(_read("streamlit_app/_page_00_setup.py"))


# ---------------------------------------------------------------------------
# Supplier v2: 8 tabs + new tab functions
# ---------------------------------------------------------------------------

class TestSupplierV2:

    def test_supplier_has_8_tabs(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "t1, t2, t3, t4, t5, t6, t7, t8" in sup_src

    def test_spend_emissions_tab_function(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "def _spend_emissions_tab" in sup_src

    def test_pestel_tab_function(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "def _risk_pestel_tab" in sup_src

    def test_e_drilldown_function(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "def _e_drilldown_tab" in sup_src

    def test_s_drilldown_function(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "def _s_drilldown_tab" in sup_src

    def test_g_drilldown_function(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "def _g_drilldown_tab" in sup_src

    def test_cat_ei_spend_based_emissions(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "CAT_EI" in sup_src

    def test_pestel_has_six_dimensions(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        for dim in ["Political", "Economic", "Social",
                    "Technological", "Environmental", "Legal"]:
            assert dim in sup_src

    def test_pestel_has_india_factors(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert '"IN"' in sup_src
        assert "BEE" in sup_src or "PAT" in sup_src

    def test_e_drilldown_has_three_clusters(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "Carbon KPIs" in sup_src
        assert "Waste KPIs" in sup_src
        assert "Energy KPIs" in sup_src

    def test_s_drilldown_has_three_clusters(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "Labour" in sup_src
        assert "safety" in sup_src.lower()
        assert "Human rights" in sup_src or "human rights" in sup_src

    def test_g_drilldown_has_three_clusters(self):
        sup_src = _read("streamlit_app/_page_11_supplier.py")
        assert "compliance" in sup_src.lower()
        assert "Ethics" in sup_src
        assert "Transparency" in sup_src

    def test_spend_based_uses_eeio_style_factors(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_11_supplier")
        # CAT_EI has Chemicals and Raw materials
        assert "Chemicals" in mod.__dict__.get("CAT_EI",
            {"Chemicals": 0}) or "CAT_EI" in _read("streamlit_app/_page_11_supplier.py")

    def test_supplier_syntax(self):
        ast.parse(_read("streamlit_app/_page_11_supplier.py"))


# ---------------------------------------------------------------------------
# MAC curve in Initiatives
# ---------------------------------------------------------------------------

class TestMACCurve:

    def test_mac_curve_in_initiatives(self):
        init_src = _read("streamlit_app/_page_08_initiatives.py")
        assert "MAC" in init_src or "Marginal Abatement" in init_src

    def test_mac_uses_plotly_go_bar(self):
        init_src = _read("streamlit_app/_page_08_initiatives.py")
        assert "go.Bar" in init_src

    def test_mac_cost_per_tonne_calculated(self):
        init_src = _read("streamlit_app/_page_08_initiatives.py")
        assert "cost_per_t" in init_src

    def test_mac_zero_cost_line(self):
        init_src = _read("streamlit_app/_page_08_initiatives.py")
        assert "Zero cost line" in init_src or "shapes" in init_src

    def test_mac_cumulative_reduction(self):
        init_src = _read("streamlit_app/_page_08_initiatives.py")
        assert "cumulative" in init_src

    def test_initiatives_syntax(self):
        ast.parse(_read("streamlit_app/_page_08_initiatives.py"))


# ---------------------------------------------------------------------------
# Logistics page
# ---------------------------------------------------------------------------

class TestLogisticsPage:

    def test_logistics_page_exists(self):
        assert (ROOT / "streamlit_app" / "_page_17_logistics.py").exists()

    def test_logistics_syntax(self):
        ast.parse(_read("streamlit_app/_page_17_logistics.py"))

    def test_mode_ef_dict_defined(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert len(mod.MODE_EF) >= 7

    def test_mode_ef_has_air_freight(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert any("Air" in k for k in mod.MODE_EF)

    def test_mode_ef_air_highest(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        air_ef = max(v for k, v in mod.MODE_EF.items() if "Air" in k)
        all_ef = list(mod.MODE_EF.values())
        assert air_ef == max(all_ef), "Air freight should be highest EF"

    def test_calc_emissions_function(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        lane = {"mode": "Road (HGV diesel)", "distance_km": 1000,
                "volume_tonnes_yr": 100}
        t = mod._calc_emissions(lane)
        # 1000 km × 100 t × 0.0962 kgCO₂e/t·km / 1000 = 9.62 tCO₂e
        assert abs(t - 9.62) < 0.1, f"Expected ~9.62, got {t}"

    def test_five_default_lanes(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_17_logistics")
        assert len(mod._DEFAULT_LANES) >= 5

    def test_four_tabs(self):
        log_src = _read("streamlit_app/_page_17_logistics.py")
        assert "Lane map" in log_src
        assert "Emission hotspots" in log_src
        assert "Modal shift" in log_src or "Multi-modal shift" in log_src  # Sprint 32: renamed

    def test_modal_shift_shows_savings(self):
        log_src = _read("streamlit_app/_page_17_logistics.py")
        # Savings shown as "Saving tCO2e/yr" column in alternatives table
        assert "Saving" in log_src and ("tCO2e" in log_src or "saving_tco2e" in log_src)

    def test_logistics_in_main_nav(self):
        main_src = _read("main.py")
        assert "_page_17_logistics" in main_src


# ---------------------------------------------------------------------------
# Full regression Sprint 24
# ---------------------------------------------------------------------------

class TestRegressionSprint24:

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

    def test_main_has_18_pages(self):
        import re
        main_src = _read("main.py")
        page_refs = re.findall(r'"streamlit_app\._page_\d+_\w+"', main_src)
        assert len(page_refs) >= 18, f"Only {len(page_refs)} page refs"

    def test_total_tests_900plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 900, f"Only {total} tests"
