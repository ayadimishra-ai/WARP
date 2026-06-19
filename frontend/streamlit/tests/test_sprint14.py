"""
sk.lite — Sprint 14 Test Suite.

Covers:
  - 57 processes (manure management added)
  - AFOLU manure: CH4 + N2O calculation, 6 livestock types
  - AFOLU manure vs enteric: different EFs
  - CDP PCAF weighted average in JSON
  - API /health endpoint logic
  - All smoke tests pass with 57 processes
  - Scope 1 safe .get() for profile keys
  - test_sprint13 mapper threshold fixed
  - Full regression: CEA v20, all 11 pages
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
# 57 processes
# ---------------------------------------------------------------------------

class TestProcessRegistry:

    def test_57_processes_registered(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57, (
            f"Expected 57, got {len(_PROCESS_REGISTRY)}. "
            f"Processes: {sorted(_PROCESS_REGISTRY.keys())}"
        )

    def test_manure_process_registered(self):
        from core.engine import _PROCESS_REGISTRY
        assert "AFOLU \u2014 Manure management (Tier 1)" in _PROCESS_REGISTRY

    def test_enteric_process_registered(self):
        from core.engine import _PROCESS_REGISTRY
        assert "AFOLU \u2014 Enteric fermentation (Tier 1)" in _PROCESS_REGISTRY

    def test_manure_process_is_callable(self):
        from core.engine import _PROCESS_REGISTRY
        cls = _PROCESS_REGISTRY["AFOLU \u2014 Manure management (Tier 1)"]
        assert callable(cls)
        assert hasattr(cls(), 'calculate')


# ---------------------------------------------------------------------------
# AFOLU manure management
# ---------------------------------------------------------------------------

class TestAFOLUManure:

    def test_manure_dairy_cattle(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="dairy_cattle",
        ), db_conn)
        assert r.t_CO2e > 0
        # 100 dairy cattle: CH4=1.0 kg/head/yr, N2O=0.34 kg/head/yr
        # kg_CH4 = 100*1.0=100; kg_N2O = 100*0.34=34
        # kg_CO2e (AR6) = 100*27.9 + 34*273 = 2790 + 9282 = 12072 kg = 12.072 tCO2e
        assert r.t_CO2e == pytest.approx(12.072, rel=0.05)

    def test_manure_returns_both_ch4_n2o(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=50, unit="head", fuel_or_item="pig",
        ), db_conn)
        assert r.kg_CH4 > 0, "Manure CH4 should be > 0"
        assert r.kg_N2O > 0, "Manure N2O should be > 0"

    def test_manure_all_livestock_positive(self, db_conn):
        from core.engine import calculate
        for animal in ["dairy_cattle", "buffalo", "sheep", "goat", "pig"]:
            r = calculate(_rec(
                process="AFOLU \u2014 Manure management (Tier 1)",
                quantity=100, unit="head", fuel_or_item=animal,
            ), db_conn)
            assert r.t_CO2e > 0, f"{animal} gave {r.t_CO2e}"

    def test_manure_less_than_enteric_for_cattle(self, db_conn):
        """Manure emissions << enteric fermentation for cattle (different magnitude)."""
        from core.engine import calculate
        r_enteric = calculate(_rec(
            process="AFOLU \u2014 Enteric fermentation (Tier 1)",
            quantity=100, unit="head", fuel_or_item="dairy_cattle",
        ), db_conn)
        r_manure = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="dairy_cattle",
        ), db_conn)
        # Enteric is dominant source for ruminants
        assert r_enteric.t_CO2e > r_manure.t_CO2e

    def test_manure_proportional(self, db_conn):
        from core.engine import calculate
        r1 = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="sheep",
        ), db_conn)
        r2 = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=200, unit="head", fuel_or_item="sheep",
        ), db_conn)
        assert r2.t_CO2e == pytest.approx(r1.t_CO2e * 2, rel=0.001)

    def test_manure_audit_trace_has_inputs(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=50, unit="head", fuel_or_item="buffalo",
        ), db_conn)
        trace = r.audit_trace
        assert "inputs" in trace
        assert trace["inputs"]["animals"] == 50
        assert trace["inputs"]["type"] == "buffalo"

    def test_manure_ef_source_ipcc2006(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=10, unit="head", fuel_or_item="goat",
        ), db_conn)
        assert "IPCC 2006" in r.ef_source

    def test_manure_pig_ch4_ef_5kg(self, db_conn):
        """Pig CH4 EF = 5 kg CH4/head/yr (IPCC 2006 Table 10.14)."""
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=1, unit="head", fuel_or_item="pig",
        ), db_conn)
        # 1 pig: CH4=5 kg, N2O=0.11 kg
        # kg_CO2e (AR6) = 5*27.9 + 0.11*273 = 139.5 + 30.03 = 169.53 kg = 0.1695 tCO2e
        assert r.kg_CH4 == pytest.approx(5.0, rel=0.01)
        assert r.kg_N2O == pytest.approx(0.11, rel=0.01)


# ---------------------------------------------------------------------------
# CDP PCAF weighted average
# ---------------------------------------------------------------------------

class TestCDPPCAF:

    def test_pcaf_helper_defined_in_cdp(self):
        cdp_src = open(ROOT / "outputs" / "disclosures" / "cdp_mapper.py",
                       encoding="utf-8").read()
        assert "_calc_pcaf_weighted_avg_cdp" in cdp_src

    def test_pcaf_field_in_cdp_json(self):
        cdp_src = open(ROOT / "outputs" / "disclosures" / "cdp_mapper.py",
                       encoding="utf-8").read()
        assert "C11_pcaf_weighted_avg_score" in cdp_src

    def test_pcaf_none_when_no_cat15(self):
        from outputs.disclosures.cdp_mapper import _calc_pcaf_weighted_avg_cdp
        by_cat = [{"category": "Scope 1", "t_CO2e": 500}]
        assert _calc_pcaf_weighted_avg_cdp(by_cat) is None

    def test_pcaf_weighted_with_cat15(self):
        from outputs.disclosures.cdp_mapper import _calc_pcaf_weighted_avg_cdp
        by_cat = [
            {"category": "Cat 15 — Investments", "t_CO2e": 100, "pcaf_score": 1},
            {"category": "Cat 15 — Investments", "t_CO2e": 100, "pcaf_score": 5},
        ]
        # Equal weight: avg = (1+5)/2 = 3.0
        result = _calc_pcaf_weighted_avg_cdp(by_cat)
        assert result == pytest.approx(3.0, rel=0.01)


# ---------------------------------------------------------------------------
# API /health endpoint
# ---------------------------------------------------------------------------

class TestAPIHealth:

    def test_health_endpoint_defined(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "/health" in api_src

    def test_health_returns_status_ok_direct(self):
        """Call health logic directly (no HTTP server needed)."""
        import sys
        sys.path.insert(0, str(ROOT))
        from ef_store.db import setup_db
        from core.engine import _PROCESS_REGISTRY
        conn = setup_db(str(ROOT / "data" / "ef_store.sqlite"))
        n_ef   = conn.execute("SELECT COUNT(*) FROM emission_factors").fetchone()[0]
        n_sasb = conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        conn.close()
        assert n_ef > 0
        assert n_sasb >= 1000
        assert len(_PROCESS_REGISTRY) == 57

    def test_api_has_batch_endpoint(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "calculate_batch" in api_src
        assert "500" in api_src  # batch limit

    def test_api_has_processes_endpoint(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "/processes" in api_src


# ---------------------------------------------------------------------------
# All smoke tests with 57 processes
# ---------------------------------------------------------------------------

class TestSmoke57Processes:

    def test_all_57_processes_calculate(self, db_conn):
        """Every registered process must calculate without error."""
        from core.engine import _PROCESS_REGISTRY, calculate
        from modules.base import ActivityRecord

        SAMPLE = {
            "Scope 1": dict(process="S1 \u2014 Stationary combustion (fuel burn)",
                            quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "Scope 2": dict(process="S2 \u2014 Purchased electricity (grid)",
                            quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
            "Scope 3": dict(process="S3 Cat 1 \u2014 Purchased goods & services (average-data EF per mass/unit)",
                            quantity=10, unit="t", fuel_or_item="steel"),
        }
        OVERRIDES = {
            "AFOLU \u2014 Enteric fermentation (Tier 1)":
                dict(scope="Scope 1", quantity=100, unit="head", fuel_or_item="dairy_cattle"),
            "AFOLU \u2014 Manure management (Tier 1)":
                dict(scope="Scope 1", quantity=100, unit="head", fuel_or_item="dairy_cattle"),
            "IPPU \u2014 Cement (process CO2)":
                dict(scope="Scope 1", quantity=1, unit="kt", fuel_or_item="clinker"),
            "IPPU \u2014 Lime (process CO2)":
                dict(scope="Scope 1", quantity=1, unit="kt", fuel_or_item="lime"),
            "IPPU \u2014 Steel (process CO2)":
                dict(scope="Scope 1", quantity=1, unit="kt", fuel_or_item="steel_bof"),
            "IPPU \u2014 Glass (process CO2)":
                dict(scope="Scope 1", quantity=1, unit="kt", fuel_or_item="glass"),
            "IPPU \u2014 Chemicals (process emissions)":
                dict(scope="Scope 1", quantity=1, unit="kt", fuel_or_item="ammonia"),
            # S3 fuel-based processes need combustion fuel, not tonne-km
            "S3 Cat 7 \u2014 Employee commuting (fuel-based)":
                dict(scope="Scope 3", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "S3 Cat 9 \u2014 Downstream transport (fuel-based)":
                dict(scope="Scope 3", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "S3 Cat 11 \u2014 Use of sold products (direct, fuels & feedstocks combustion)":
                dict(scope="Scope 3", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            # Site-specific processes need kWh
            "S3 Cat 9 \u2014 Downstream distribution/storage (site-specific)":
                dict(scope="Scope 3", quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
            "S3 Cat 4 \u2014 Upstream distribution/storage (site-specific facility energy + allocation)":
                dict(scope="Scope 3", quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
        }

        failures = []
        for proc, cls in _PROCESS_REGISTRY.items():
            scope = ("Scope 1" if proc.startswith("S1") or proc.startswith("IPPU") or proc.startswith("AFOLU")
                     else "Scope 2" if proc.startswith("S2")
                     else "Scope 3")
            kw = OVERRIDES.get(proc, SAMPLE.get(scope, SAMPLE["Scope 3"]))
            kw = {**kw, "process": proc, "scope": scope,
                  "country": "IN", "reporting_year": 2024, "gwp_ar": 6}
            try:
                r = calculate(ActivityRecord(**kw), db_conn)
                if r.t_CO2e < -1000:
                    failures.append(f"{proc[:50]}: extreme negative {r.t_CO2e}")
            except Exception as e:
                failures.append(f"{proc[:50]}: {e!s:.60}")

        assert not failures, f"{len(failures)} failures:\n" + "\n".join(failures[:5])

    def test_manure_in_scope1_smoke(self, db_conn):
        """Manure management specifically passes the same smoke test."""
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="dairy_cattle",
        ), db_conn)
        assert r.t_CO2e > 0


# ---------------------------------------------------------------------------
# Scope 1 safe profile access
# ---------------------------------------------------------------------------

class TestScope1SafeAccess:

    def test_scope1_reporting_year_uses_get(self):
        s1_src = open(ROOT / "streamlit_app" / "_page_01_scope1.py",
                      encoding="utf-8").read()
        # Should use .get() not direct bracket access for reporting_year
        import re
        bracket_access = re.findall(r'profile\["reporting_year"\]', s1_src)
        assert len(bracket_access) == 0, (
            f"Found {len(bracket_access)} unsafe profile[\"reporting_year\"] accesses"
        )

    def test_scope1_gwp_uses_get(self):
        s1_src = open(ROOT / "streamlit_app" / "_page_01_scope1.py",
                      encoding="utf-8").read()
        import re
        bracket_access = re.findall(r'profile\["gwp_ar"\]', s1_src)
        assert len(bracket_access) == 0, (
            f"Found {len(bracket_access)} unsafe profile[\"gwp_ar\"] accesses"
        )

    def test_afolu_ui_has_manure_option(self):
        s1_src = open(ROOT / "streamlit_app" / "_page_01_scope1.py",
                      encoding="utf-8").read()
        assert "Manure management" in s1_src
        assert "proc_afolu" in s1_src


# ---------------------------------------------------------------------------
# Full regression
# ---------------------------------------------------------------------------

class TestRegressionSprint14:

    def test_57_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_all_11_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {0:"setup",1:"scope1",2:"scope2",3:"scope3",4:"dashboard",
                    5:"ef_manager",6:"export",7:"inventory",8:"initiatives",
                    9:"checklist",10:"sasb"}
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

    def test_wtt_natural_gas_india(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3A \u2014 Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(10.2, rel=0.05)

    def test_ippu_cement_5244(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="IPPU \u2014 Cement (process CO2)",
            quantity=10, unit="kt", fuel_or_item="clinker",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(5244.0, rel=0.01)

    def test_sasb_1124_in_db(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1000

    def test_test_count_480plus(self):
        total = sum(
            open(f"tests/{f}", encoding="utf-8").read().count("def test_")
            for f in os.listdir("tests/")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 480, f"Only {total} tests"
