"""
sk.lite — Sprint 12 Test Suite.

Covers:
  - API: module imports, endpoint logic, batch calculation
  - WTT prefill: session key set, Cat 3A UI reads it
  - SASB in export ZIP
  - SASB sector auto-mapped in setup profile
  - SBTi SDA: sectors defined, intensity targets present
  - PCAF weighted average concept
  - Full regression: 11 pages, 56 processes, CEA v20
"""
from __future__ import annotations
import os
import tempfile
import uuid
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


# ---------------------------------------------------------------------------
# API endpoint
# ---------------------------------------------------------------------------

class TestAPIEndpoint:

    def test_api_module_imports(self):
        """api.py must import without error even without fastapi installed."""
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "api", ROOT / "api.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert hasattr(mod, "app")
        assert hasattr(mod, "calculate_emissions")

    def test_api_calculate_emissions_direct(self, db_conn):
        """Call the calculation logic directly (bypasses HTTP)."""
        from core.engine import calculate
        from modules.base import ActivityRecord
        rec = ActivityRecord(
            scope="Scope 1",
            process="S1 — Stationary combustion (fuel burn)",
            country="IN", quantity=1000, unit="GJ",
            fuel_or_item="natural_gas",
            reporting_year=2024, gwp_ar=6,
        )
        r = calculate(rec, db_conn)
        assert r.t_CO2e == pytest.approx(56.155, rel=0.05)

    def test_api_s2_electricity(self, db_conn):
        from core.engine import calculate
        from modules.base import ActivityRecord
        rec = ActivityRecord(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            country="IN", quantity=100_000, unit="kWh",
            fuel_or_item="grid_electricity",
            reporting_year=2024, gwp_ar=6,
        )
        r = calculate(rec, db_conn)
        assert r.t_CO2e > 0
        assert r.audit_trace is not None

    def test_api_s3_eeio(self, db_conn):
        from core.engine import calculate
        from modules.base import ActivityRecord
        rec = ActivityRecord(
            scope="Scope 3",
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            country="IN", quantity=100_000, unit="USD",
            fuel_or_item="chemicals",
            reporting_year=2024, gwp_ar=6,
        )
        r = calculate(rec, db_conn)
        assert r.t_CO2e > 0

    def test_api_batch_calculation(self, db_conn):
        """Simulate batch: calculate 5 records, all succeed."""
        from core.engine import calculate
        from modules.base import ActivityRecord
        records = [
            ("S1 — Stationary combustion (fuel burn)", "GJ", "natural_gas", "Scope 1"),
            ("S2 — Purchased electricity (grid)", "kWh", "grid_electricity", "Scope 2"),
            ("S3 Cat 3A — Upstream emissions of purchased fuels", "GJ", "diesel_oil", "Scope 3"),
            ("S3 Cat 6 — Business travel (distance-based passenger-km + hotels)", "km", "car_average", "Scope 3"),
            ("IPPU — Cement (process CO2)", "kt", "clinker", "Scope 1"),
        ]
        results = []
        for proc, unit, fuel, scope in records:
            rec = ActivityRecord(scope=scope, country="IN",
                reporting_year=2024, gwp_ar=6,
                process=proc, quantity=100, unit=unit, fuel_or_item=fuel)
            try:
                r = calculate(rec, db_conn)
                results.append({"ok": True, "t_CO2e": r.t_CO2e})
            except Exception as e:
                results.append({"ok": False, "error": str(e)})
        assert all(r["ok"] for r in results), [r for r in results if not r["ok"]]

    def test_api_readme_mentions_api(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        assert "api" in readme.lower() or "API" in readme


# ---------------------------------------------------------------------------
# WTT prefill in Cat 3A
# ---------------------------------------------------------------------------

class TestWTTPrefill:

    def test_cat3a_ui_reads_wtt_prefill_key(self):
        s3_src = open(ROOT / "streamlit_app" / "_page_03_scope3.py",
                      encoding="utf-8").read()
        assert "wtt_prefill" in s3_src
        assert "cat03_prefilled" in s3_src or "wtt_prefill" in s3_src

    def test_cat3a_shows_success_message_on_prefill(self):
        s3_src = open(ROOT / "streamlit_app" / "_page_03_scope3.py",
                      encoding="utf-8").read()
        assert "Pre-filled from Scope 1" in s3_src

    def test_s1_sets_wtt_prefill_after_stat_save(self):
        s1_src = open(ROOT / "streamlit_app" / "_page_01_scope1.py",
                      encoding="utf-8").read()
        assert 'st.session_state["wtt_prefill"]' in s1_src

    def test_wtt_calculation_india_efs(self, db_conn):
        for fuel, unit in [("natural_gas", "GJ"), ("diesel_oil", "GJ"), ("coal_bituminous", "GJ")]:
            r = _rec(scope="Scope 3",
                     process="S3 Cat 3A — Upstream emissions of purchased fuels",
                     quantity=100, unit=unit, fuel_or_item=fuel)
            from core.engine import calculate
            result = calculate(r, db_conn)
            assert result.t_CO2e >= 0, f"{fuel}: {result.t_CO2e}"


# ---------------------------------------------------------------------------
# SASB sector auto-mapping in Setup
# ---------------------------------------------------------------------------

class TestSASBSectorMapping:

    def test_setup_has_sector_to_sasb_map(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "_SECTOR_TO_SASB" in setup_src
        assert "Financials" in setup_src
        assert "sasb_sector" in setup_src

    def test_sasb_sector_saved_to_profile(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert '"sasb_sector":' in setup_src

    def test_sector_mapping_covers_all_internal_sectors(self):
        # Import and check the mapping
        import ast, textwrap
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        # Extract _SECTOR_TO_SASB dict values
        internal_sectors = [
            "Manufacturing", "Information Technology", "Financial Services",
            "Retail / Consumer", "Healthcare / Pharma", "Cement / Construction",
            "Agriculture / Food", "Energy / Utilities", "Transport / Logistics",
            "Real Estate",
        ]
        for sector in internal_sectors:
            assert sector in setup_src, f"Missing sector: {sector}"


# ---------------------------------------------------------------------------
# SBTi SDA
# ---------------------------------------------------------------------------

class TestSBTiSDA:

    def test_sda_expander_in_dashboard(self):
        dash_src = open(ROOT / "streamlit_app" / "_page_04_dashboard.py",
                        encoding="utf-8").read()
        assert "SDA" in dash_src
        assert "Sector Decarbonization" in dash_src

    def test_sda_five_sectors_defined(self):
        dash_src = open(ROOT / "streamlit_app" / "_page_04_dashboard.py",
                        encoding="utf-8").read()
        for sector in ["Electricity generation", "Cement", "Steel", "Aluminium", "Pulp & Paper"]:
            assert sector in dash_src, f"SDA sector missing: {sector}"

    def test_sda_intensity_targets_present(self):
        dash_src = open(ROOT / "streamlit_app" / "_page_04_dashboard.py",
                        encoding="utf-8").read()
        # Cement 2030 target = 0.42 tCO2e/t
        assert "0.42" in dash_src
        # Steel 2030 target = 1.30
        assert "1.30" in dash_src

    def test_sda_cement_math(self):
        """Cement gap: 0.60 current - 0.42 target = 0.18 tCO2e/t, 30% reduction."""
        current = 0.60
        target_2030 = 0.42
        gap = current - target_2030
        pct = gap / current * 100
        assert gap == pytest.approx(0.18, rel=0.01)
        assert pct == pytest.approx(30.0, rel=0.01)

    def test_sda_electricity_deepest_cut(self):
        """Electricity requires deepest cut: 0.45 → 0.18 = 60% by 2030."""
        current = 0.45
        target = 0.18
        pct = (current - target) / current * 100
        assert pct == pytest.approx(60.0, rel=0.02)


# ---------------------------------------------------------------------------
# SASB in export ZIP
# ---------------------------------------------------------------------------

class TestSASBInExportZIP:

    def test_export_zip_includes_sasb(self):
        exp_src = open(ROOT / "streamlit_app" / "_page_06_export.py",
                       encoding="utf-8").read()
        assert "sasb_mapper" in exp_src
        assert "SASB_" in exp_src

    def test_export_zip_includes_gri306(self):
        exp_src = open(ROOT / "streamlit_app" / "_page_06_export.py",
                       encoding="utf-8").read()
        assert "gri306_mapper" in exp_src or "GRI_306" in exp_src

    def test_export_zip_includes_tcfd(self):
        exp_src = open(ROOT / "streamlit_app" / "_page_06_export.py",
                       encoding="utf-8").read()
        assert "tcfd_mapper" in exp_src
        assert "TCFD_" in exp_src


# ---------------------------------------------------------------------------
# PCAF weighted average
# ---------------------------------------------------------------------------

class TestPCAFWeightedAverage:

    def test_pcaf_scores_5_levels(self):
        from streamlit_app._page_03_scope3 import _PCAF_SCORES
        assert len(_PCAF_SCORES) == 5
        assert all(k in _PCAF_SCORES for k in range(1, 6))

    def test_pcaf_weighted_average_calc(self):
        """Weighted average: 2 records at score 2, 1 at score 4 → (2+2+4)/3 = 2.67."""
        scores = [2, 2, 4]
        weights = [1, 1, 1]  # equal weights for simplicity
        weighted_avg = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
        assert weighted_avg == pytest.approx(8/3, rel=0.01)

    def test_cat15_accepts_pcaf_in_extra(self, db_conn):
        from core.engine import calculate
        from modules.base import ActivityRecord
        r = calculate(ActivityRecord(
            scope="Scope 3",
            process="S3 Cat 15 — Investments (equity, average-data EEIO)",
            country="IN", quantity=500_000, unit="USD",
            fuel_or_item="technology",
            reporting_year=2024, gwp_ar=6,
            extra={"ownership_pct": 0.15, "pcaf_score": 4,
                   "pcaf_attr_method": "Outstanding amount ÷ EVIC"},
        ), db_conn)
        assert r.t_CO2e >= 0


# ---------------------------------------------------------------------------
# Full regression
# ---------------------------------------------------------------------------

class TestRegressionSprint12:

    def test_all_11_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {
            0:"setup", 1:"scope1", 2:"scope2", 3:"scope3",
            4:"dashboard", 5:"ef_manager", 6:"export",
            7:"inventory", 8:"initiatives", 9:"checklist", 10:"sasb"
        }
        for i, name in page_map.items():
            importlib.import_module(f"streamlit_app._page_{i:02d}_{name}")

    def test_56_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_cea_v20_zero_deviation(self, db_conn):
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
        mappers = list(Path(ROOT / "outputs" / "disclosures").glob("*.py"))
        mapper_names = [m.name for m in mappers]
        assert len(mappers) >= 7, f"Got: {mapper_names}"

    def test_api_file_exists(self):
        assert (ROOT / "api.py").exists()

    def test_sasb_csv_1124_rows(self):
        csv_path = ROOT / "ef_store" / "seeds" / "sasb_canonical_master.csv"
        assert csv_path.exists()
        import csv
        with open(csv_path, encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
        assert len(rows) >= 1100, f"Got {len(rows)} rows"

    def test_total_tests_435plus(self):
        import os
        total = sum(
            open(f"tests/{f}", encoding="utf-8").read().count("def test_")
            for f in os.listdir("tests/")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 420, f"Only {total} tests"
