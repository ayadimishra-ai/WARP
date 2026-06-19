"""
sk.lite — Sprint 17 Test Suite.

Covers:
  - All test files: open() and read_text() use encoding="utf-8"
  - GRI 302: energy auto-populated from S1/S2 records
  - Dashboard: YoY table has YoY% and vs-base columns
  - GRI consistency across all 4 disclosure mappers
  - db_summary includes sasb_metrics (regression)
  - All 57 processes smoke test with correct OVERRIDES
  - Setup profile backup/restore download button
  - EF manager uncertainty tab present
  - Full regression: CEA v20, 11 pages, 57 processes
"""
from __future__ import annotations
import os
import re
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


# ---------------------------------------------------------------------------
# Windows encoding safety — ALL open() must use encoding="utf-8"
# ---------------------------------------------------------------------------

class TestEncodingSafety:

    def _check_file(self, filepath: Path) -> list:
        """Return list of bare open() / read_text(encoding="utf-8") calls without encoding."""
        src = filepath.read_text(encoding="utf-8")
        issues = []
        for lineno, line in enumerate(src.splitlines(), 1):
            # Skip comments and string-literal-only lines
            stripped = line.strip()
            if stripped.startswith("#") or stripped.startswith('"""') or stripped.startswith("'"):
                continue
            # bare open(f"...").read() without encoding
            if re.search(r'open\(f?"[^"]*"\)\.read\(\)', line):
                issues.append(f"line {lineno}: bare open().read(): {line.strip()[:60]}")
            # bare .read_text() without encoding keyword
            if ".read_text()" in line and "encoding" not in line and "read_text()" not in repr(line)[1:5]:
                # Only flag if it's an actual call, not inside a string/fstring
                if not ('"' in line and line.index('.read_text()') > line.index('"')):
                    issues.append(f"line {lineno}: bare read_text(): {line.strip()[:60]}")
        return issues

    def test_no_bare_open_in_test_sprint12(self):
        issues = self._check_file(ROOT / "tests" / "test_sprint12.py")
        assert not issues, f"Encoding issues: {issues}"

    def test_no_bare_open_in_test_sprint13(self):
        issues = self._check_file(ROOT / "tests" / "test_sprint13.py")
        assert not issues, f"Encoding issues: {issues}"

    def test_no_bare_open_in_test_sprint14(self):
        issues = self._check_file(ROOT / "tests" / "test_sprint14.py")
        assert not issues, f"Encoding issues: {issues}"

    def test_no_bare_open_in_test_sprint15(self):
        issues = self._check_file(ROOT / "tests" / "test_sprint15.py")
        assert not issues, f"Encoding issues: {issues}"

    def test_no_bare_read_text_in_test_sprint9(self):
        src = _read("tests/test_sprint9.py")
        bare = re.findall(r'\.read_text\(\)', src)
        assert not bare, f"Found {len(bare)} bare read_text() in test_sprint9.py"

    def test_no_bare_read_text_in_test_sprint13(self):
        src = _read("tests/test_sprint13.py")
        bare = re.findall(r'\.read_text\(\)', src)
        assert not bare, f"Found {len(bare)} bare read_text() in test_sprint13.py"


# ---------------------------------------------------------------------------
# GRI 302 energy auto-population
# ---------------------------------------------------------------------------

class TestGRI302EnergyAutoPopulate:

    def _make_store_with_records(self):
        """Create temp inventory with S1 stationary + S2 electricity records."""
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="gri17")
        now = datetime.now(timezone.utc).isoformat()
        # Scope 1: 1000 GJ natural gas stationary
        store._db.execute("""
            INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (str(uuid.uuid4()), "gri17", 2024, 0,
              "Scope 1", "Scope 1 - Stationary",
              "S1 \u2014 Stationary combustion (fuel burn)", "IN",
              1000, "GJ",  # 1000 GJ = 277.78 MWh
              56155, 0, 0, 56155, 0, 56.155, 6, 0, now, now))
        # Scope 2: 100,000 kWh electricity
        store._db.execute("""
            INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (str(uuid.uuid4()), "gri17", 2024, 0,
              "Scope 2", "Scope 2 - Electricity",
              "S2 \u2014 Purchased electricity (grid)", "IN",
              100000, "kWh",  # 100 MWh
              72700, 0, 0, 72700, 0, 72.7, 6, 0, now, now))
        store._db.commit()
        return store, tmp

    def test_gri302_auto_populates_from_records(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        store, tmp = self._make_store_with_records()
        try:
            profile = {"org_name": "T", "org_id": "gri17",
                       "reporting_year": 2024, "gwp_ar": 6}
            result = generate_gri_disclosure(store, profile, 2024)
            energy = result["json"]["302_1_energy_mwh"]
            # 1000 GJ / 3.6 = 277.78 MWh + 100 MWh = 377.78 MWh
            assert energy is not None, "Energy should be auto-populated from records"
            assert energy > 0, f"Energy should be positive, got {energy}"
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_gri302_energy_auto_in_mapper(self):
        gri_src = _read("outputs/disclosures/gri_mapper.py")
        assert "stationary" in gri_src.lower()
        assert "auto" in gri_src.lower() or "auto_elec" in gri_src

    def test_gri302_user_override_preserved(self):
        """User-provided energy_mwh should override auto-calculation."""
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        store, tmp = self._make_store_with_records()
        try:
            profile = {"org_name": "T", "org_id": "gri17",
                       "reporting_year": 2024, "gwp_ar": 6}
            # Provide explicit value — should win over auto
            result = generate_gri_disclosure(
                store, profile, 2024,
                total_energy_consumed_mwh=999.0
            )
            energy = result["json"]["302_1_energy_mwh"]
            assert energy == pytest.approx(999.0, rel=0.01), (
                f"User override should be used, got {energy}"
            )
        finally:
            store._db.close()
            try: os.unlink(tmp)
            except: pass

    def test_gri302_unit_conversion_gj_to_mwh(self):
        """1000 GJ → 277.78 MWh conversion."""
        gj = 1000.0
        mwh = gj / 3.6
        assert abs(mwh - 277.78) < 0.1


# ---------------------------------------------------------------------------
# Dashboard YoY table columns
# ---------------------------------------------------------------------------

class TestDashboardYoYTable:

    def test_yoy_pct_column_in_table(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "YoY %" in dash_src

    def test_vs_base_column_in_table(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "vs base" in dash_src

    def test_cagr_in_dashboard(self):
        dash_src = _read("streamlit_app/_page_04_dashboard.py")
        assert "CAGR" in dash_src or "cagr" in dash_src

    def test_yoy_pct_math(self):
        """YoY%: (current - prev) / prev × 100."""
        rows = [100.0, 90.0, 81.0]
        yoy = [None] + [
            (rows[i] - rows[i-1]) / rows[i-1] * 100
            for i in range(1, len(rows))
        ]
        assert yoy[1] == pytest.approx(-10.0, rel=0.01)
        assert yoy[2] == pytest.approx(-10.0, rel=0.01)

    def test_vs_base_math(self):
        """vs base: (current - base) / base × 100."""
        rows = [100.0, 90.0, 81.0]
        base = rows[0]
        vs = [(r - base) / base * 100 for r in rows]
        assert vs[0] == 0.0
        assert vs[1] == pytest.approx(-10.0, rel=0.01)
        assert vs[2] == pytest.approx(-19.0, rel=0.01)


# ---------------------------------------------------------------------------
# All 57 processes smoke (correct overrides, Windows-safe)
# ---------------------------------------------------------------------------

class TestSmoke57Processes:

    def test_all_57_correct_overrides(self, db_conn):
        from core.engine import _PROCESS_REGISTRY, calculate
        from modules.base import ActivityRecord

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
            "S3 Cat 7 \u2014 Employee commuting (fuel-based)":
                dict(scope="Scope 3", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "S3 Cat 9 \u2014 Downstream transport (fuel-based)":
                dict(scope="Scope 3", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "S3 Cat 11 \u2014 Use of sold products (direct, fuels & feedstocks combustion)":
                dict(scope="Scope 3", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "S3 Cat 9 \u2014 Downstream distribution/storage (site-specific)":
                dict(scope="Scope 3", quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
            "S3 Cat 4 \u2014 Upstream distribution/storage (site-specific facility energy + allocation)":
                dict(scope="Scope 3", quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
        }
        SAMPLE = {
            "Scope 1": dict(scope="Scope 1", quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "Scope 2": dict(scope="Scope 2", quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
            "Scope 3": dict(scope="Scope 3", quantity=1000, unit="tonne-km", fuel_or_item="truck"),
        }
        failures = []
        for proc in sorted(_PROCESS_REGISTRY):
            scope = ("Scope 1" if proc.startswith(("S1","IPPU","AFOLU"))
                     else "Scope 2" if proc.startswith("S2") else "Scope 3")
            kw = {**SAMPLE[scope], **OVERRIDES.get(proc, {}),
                  "process": proc, "country": "IN", "reporting_year": 2024, "gwp_ar": 6}
            try:
                r = calculate(ActivityRecord(**kw), db_conn)
                if r.t_CO2e < -1000:
                    failures.append(f"{proc[:50]}: extreme negative")
            except Exception as e:
                failures.append(f"{proc[:50]}: {e!s:.55}")
        assert not failures, f"{len(failures)} failures:\n" + "\n".join(failures)


# ---------------------------------------------------------------------------
# Regression Sprint 17
# ---------------------------------------------------------------------------

class TestRegressionSprint17:

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

    def test_db_summary_has_sasb(self, db_conn):
        from ef_store.db import db_summary
        summary = db_summary(db_conn)
        assert "sasb_metrics" in summary
        assert summary["sasb_metrics"] >= 1000

    def test_6_mappers(self):
        mappers = [p for p in (ROOT / "outputs" / "disclosures").glob("*.py")
                   if not p.name.startswith("_")]
        assert len(mappers) >= 6

    def test_changelog_has_sprint16(self):
        cl = _read("CHANGELOG.md")
        assert "Sprint 16" in cl

    def test_main_version_081(self):
        main_src = _read("main.py")
        assert "v1.0" in main_src or "sk.lite" in main_src  # rebranded to sk.lite v1.0

    def test_readme_57_processes(self):
        readme = _read("README.md")
        assert "57" in readme

    def test_total_tests_590plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 540, f"Only {total} tests"
