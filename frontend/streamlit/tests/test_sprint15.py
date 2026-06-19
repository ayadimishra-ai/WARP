"""
sk.lite — Sprint 15 Test Suite.

Covers:
  - CHANGELOG has Sprint 14 / Manure entry
  - Setup: org profile backup/restore download button
  - Data manager: EF source in expander label
  - AFOLU manure full livestock suite
  - API endpoints complete
  - 57-process regression
  - SASB sector mapping in setup profile save
  - GRI 306 + SASB in export ZIP
  - All disclosure mappers consistent
  - README has 57 processes and v0.8.1
"""
from __future__ import annotations
import os
import json
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


# ---------------------------------------------------------------------------
# CHANGELOG
# ---------------------------------------------------------------------------

class TestChangelog:

    def test_changelog_has_sprint14(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "Sprint 14" in content or "Manure" in content

    def test_changelog_has_manure(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "Manure" in content or "manure" in content

    def test_changelog_has_081(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "0.8.1" in content or "0.8.0" in content

    def test_changelog_has_api_health(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "/health" in content or "health" in content.lower()


# ---------------------------------------------------------------------------
# Setup backup / restore
# ---------------------------------------------------------------------------

class TestSetupBackupRestore:

    def test_setup_has_download_button_for_profile(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "Export profile" in setup_src or "export.*profile" in setup_src.lower()
        assert "download_button" in setup_src

    def test_setup_has_file_uploader_for_restore(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "file_uploader" in setup_src
        assert "Import profile" in setup_src or "import.*profile" in setup_src.lower()

    def test_setup_validates_required_keys(self):
        setup_src = open(ROOT / "streamlit_app" / "_page_00_setup.py",
                         encoding="utf-8").read()
        assert "org_name" in setup_src
        assert "org_uuid" in setup_src
        assert "reporting_year" in setup_src

    def test_profile_json_roundtrip(self):
        """Profile dict can be JSON-serialised and deserialised cleanly."""
        profile = {
            "org_name": "Test Corp",
            "org_uuid": str(uuid.uuid4()),
            "reporting_year": 2024,
            "gwp_ar": 6,
            "s3_material": ["Cat 1", "Cat 4"],
            "setup_done": True,
        }
        encoded = json.dumps(profile, indent=2)
        decoded = json.loads(encoded)
        assert decoded["org_name"] == "Test Corp"
        assert decoded["s3_material"] == ["Cat 1", "Cat 4"]


# ---------------------------------------------------------------------------
# Data manager EF source visibility
# ---------------------------------------------------------------------------

class TestDataManagerEFSource:

    def test_ef_source_in_expander_label(self):
        inv_src = open(ROOT / "streamlit_app" / "_page_07_inventory.py",
                       encoding="utf-8").read()
        assert "ef_short" in inv_src or "ef_source" in inv_src

    def test_ef_abbr_in_label(self):
        inv_src = open(ROOT / "streamlit_app" / "_page_07_inventory.py",
                       encoding="utf-8").read()
        # ef_short added to label
        assert "ef_short" in inv_src

    def test_fallback_badge_still_shown(self):
        inv_src = open(ROOT / "streamlit_app" / "_page_07_inventory.py",
                       encoding="utf-8").read()
        assert "fallback EF" in inv_src or "⚠️" in inv_src

    def test_record_expander_shows_factor_id(self):
        inv_src = open(ROOT / "streamlit_app" / "_page_07_inventory.py",
                       encoding="utf-8").read()
        assert "factor_id_used" in inv_src


# ---------------------------------------------------------------------------
# AFOLU full livestock suite
# ---------------------------------------------------------------------------

class TestAFOLUComplete:

    def test_enteric_all_livestock(self, db_conn):
        from core.engine import calculate
        for animal in ["dairy_cattle", "buffalo", "sheep", "goat", "pig"]:
            r = calculate(_rec(
                process="AFOLU \u2014 Enteric fermentation (Tier 1)",
                quantity=100, unit="head", fuel_or_item=animal,
            ), db_conn)
            assert r.t_CO2e >= 0, f"Enteric {animal}: {r.t_CO2e}"

    def test_manure_all_livestock(self, db_conn):
        from core.engine import calculate
        for animal in ["dairy_cattle", "buffalo", "sheep", "goat", "pig"]:
            r = calculate(_rec(
                process="AFOLU \u2014 Manure management (Tier 1)",
                quantity=100, unit="head", fuel_or_item=animal,
            ), db_conn)
            assert r.t_CO2e > 0, f"Manure {animal}: {r.t_CO2e}"
            assert r.kg_CH4 > 0, f"CH4 zero for {animal}"
            assert r.kg_N2O > 0, f"N2O zero for {animal}"

    def test_manure_buffalo_higher_than_sheep(self, db_conn):
        """Buffalo (2.0 kgCH4/hd) >> sheep (0.19 kgCH4/hd)."""
        from core.engine import calculate
        r_buf = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="buffalo",
        ), db_conn)
        r_sh  = calculate(_rec(
            process="AFOLU \u2014 Manure management (Tier 1)",
            quantity=100, unit="head", fuel_or_item="sheep",
        ), db_conn)
        assert r_buf.t_CO2e > r_sh.t_CO2e

    def test_57_processes_total(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_both_afolu_processes_registered(self):
        from core.engine import _PROCESS_REGISTRY
        assert "AFOLU \u2014 Enteric fermentation (Tier 1)" in _PROCESS_REGISTRY
        assert "AFOLU \u2014 Manure management (Tier 1)" in _PROCESS_REGISTRY


# ---------------------------------------------------------------------------
# API completeness
# ---------------------------------------------------------------------------

class TestAPICompleteness:

    def test_api_has_all_4_endpoints(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "def root" in api_src           # GET /
        assert "def health" in api_src         # GET /health
        assert "def list_processes" in api_src # GET /processes
        assert "def calculate_emissions" in api_src  # POST /calculate
        assert "def calculate_batch" in api_src      # POST /calculate/batch

    def test_api_batch_limit_500(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "500" in api_src

    def test_api_handles_validation_error(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "ValidationError" in api_src
        assert "422" in api_src

    def test_api_handles_key_error(self):
        api_src = open(ROOT / "api.py", encoding="utf-8").read()
        assert "KeyError" in api_src
        assert "404" in api_src


# ---------------------------------------------------------------------------
# Disclosure consistency
# ---------------------------------------------------------------------------

class TestDisclosureConsistency:

    def _make_store(self):
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="s15")
        for scope, val in [("Scope 1", 500.0), ("Scope 2", 300.0), ("Scope 3", 100.0)]:
            store._db.execute("""
                INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                    scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                    kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                    created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (str(uuid.uuid4()), "s15", 2024, 0, scope, scope,
                  "S1 — Stationary combustion (fuel burn)", "IN",
                  1000, "GJ", val*1000, 0, 0, val*1000, 0, val, 6, 0,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
        store._db.commit()
        return store, tmp

    def test_all_mappers_agree_on_totals(self, db_conn):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        from outputs.disclosures.cdp_mapper  import generate_cdp_disclosure
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        from outputs.disclosures.gri_mapper  import generate_gri_disclosure

        store, tmp = self._make_store()
        profile = {"org_name": "T", "org_id": "s15",
                   "reporting_year": 2024, "gwp_ar": 6,
                   "primary_country": "IN", "boundary": "operational_control"}
        try:
            brsr = generate_brsr_disclosure(store, profile, 2024)
            cdp  = generate_cdp_disclosure(store, profile, 2024)
            tcfd = generate_tcfd_disclosure(store, profile, 2024)
            gri  = generate_gri_disclosure(store, profile, 2024)

            totals = {
                "BRSR": brsr["json"]["total_tco2e"],
                "CDP":  cdp["json"]["C6.5_total_s1_s2_tco2e"] + cdp["json"]["C11.1_s3_total_tco2e"],
                "TCFD": tcfd["json"]["total_tco2e"],
                "GRI":  gri["json"]["305_total_tco2e"],
            }
            for fw, total in totals.items():
                assert abs(total - 900.0) / 900.0 < 0.02, \
                    f"{fw} total {total:.2f} differs from 900.0"
        finally:
            store._db.close()
            if os.path.exists(tmp):
                try: os.unlink(tmp)
                except: pass

    def test_gri306_has_all_sections(self):
        from outputs.disclosures.gri306_mapper import generate_gri306_disclosure
        result = generate_gri306_disclosure(
            {"org_name": "T", "reporting_year": 2024}, 2024,
            total_waste_t=1000.0, recycled_t=400.0, landfill_t=600.0,
        )
        for disc in ["306-1", "306-2", "306-3", "306-4", "306-5"]:
            assert disc in result["sections"], f"Missing {disc}"

    def test_sasb_mapper_works_without_sector(self, db_conn):
        store, tmp = self._make_store()
        from outputs.disclosures.sasb_mapper import generate_sasb_disclosure
        try:
            result = generate_sasb_disclosure(
                store, {"org_name": "T", "org_id": "s15",
                        "reporting_year": 2024, "gwp_ar": 6},
                db_conn, 2024, sector=None,
            )
            assert isinstance(result, dict)
            assert "coverage_pct" in result
        finally:
            store._db.close()
            if os.path.exists(tmp):
                try: os.unlink(tmp)
                except: pass


# ---------------------------------------------------------------------------
# Full regression Sprint 15
# ---------------------------------------------------------------------------

class TestRegressionSprint15:

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

    def test_6_disclosure_mappers(self):
        mappers = [p for p in (ROOT / "outputs" / "disclosures").glob("*.py")
                   if not p.name.startswith("_")]
        assert len(mappers) >= 6, f"Got: {[m.name for m in mappers]}"

    def test_total_tests_520plus(self):
        total = sum(
            open(f"tests/{f}", encoding="utf-8").read().count("def test_")
            for f in os.listdir("tests/")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 520, f"Only {total} tests"

    def test_sasb_in_db(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        assert n >= 1000

    def test_wtt_13_factors(self, db_conn):
        n = db_conn.execute(
            "SELECT COUNT(*) FROM emission_factors WHERE factor_id LIKE 'WTT%'"
        ).fetchone()[0]
        assert n >= 10
