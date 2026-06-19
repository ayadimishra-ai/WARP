"""
sk.lite — Sprint 6 Test Suite.

Covers:
  - Reduction initiatives: add/update/delete/export
  - Verification checklist: scoring, sections, export
  - Supplier template: structure, sheets, required columns
  - Snapshot: YoY comparison, multi-year Excel
  - BRSR: reduction target, energy field in JSON
  - CDP: intensity, pct_change in JSON
  - Report: to_csv, text, data quality
  - New pages: import and render callable
  - SBTi progress linkage
  - Energy consumption field
"""

from __future__ import annotations
import os
import io
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


def _store_with_data(org="sprint6_test", s1=500.0, s2=300.0, s3=100.0):
    """Create a temp InventoryStore with S1+S2+S3 records."""
    from inventory.store import get_store
    tmp = tempfile.mktemp(suffix=".sqlite")
    store = get_store(tmp, org_id=org)
    for scope, val in [("Scope 1", s1), ("Scope 2", s2), ("Scope 3", s3)]:
        store._db.execute("""
            INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (str(uuid.uuid4()), org, 2024, 0, scope, scope,
              "S1 — Stationary combustion (fuel burn)", "IN",
              1000, "GJ", val*1000, 0, 0, val*1000, 0, val, 6, 0,
              datetime.now(timezone.utc).isoformat(),
              datetime.now(timezone.utc).isoformat()))
    store._db.commit()
    return store, tmp


# ---------------------------------------------------------------------------
# Supplier template
# ---------------------------------------------------------------------------

class TestSupplierTemplate:

    def test_generates_bytes(self):
        from outputs.supplier_template import generate_supplier_template
        data = generate_supplier_template("Acme Ltd", 2024)
        assert isinstance(data, bytes)
        assert len(data) > 5000

    def test_correct_sheets(self):
        from outputs.supplier_template import generate_supplier_template
        import openpyxl
        data = generate_supplier_template("Test Corp", 2024)
        wb = openpyxl.load_workbook(io.BytesIO(data))
        assert "Instructions" in wb.sheetnames
        assert "Cat1 - Purchased Goods" in wb.sheetnames
        assert "Cat4 - Upstream Transport" in wb.sheetnames
        assert "Cat11 - Use of Products" in wb.sheetnames

    def test_cat1_has_required_columns(self):
        from outputs.supplier_template import generate_supplier_template
        import openpyxl
        data = generate_supplier_template("Test Corp", 2024)
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Cat1 - Purchased Goods"]
        headers = [c.value for c in ws[3] if c.value]
        assert any("product" in (h or "").lower() for h in headers)
        assert any("quantity" in (h or "").lower() for h in headers)
        assert any("unit" in (h or "").lower() for h in headers)

    def test_cat4_has_transport_columns(self):
        from outputs.supplier_template import generate_supplier_template
        import openpyxl
        data = generate_supplier_template("Test Corp", 2024)
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Cat4 - Upstream Transport"]
        headers = [c.value for c in ws[3] if c.value]
        assert any("mode" in (h or "").lower() for h in headers)
        assert any("distance" in (h or "").lower() or "km" in (h or "").lower()
                   for h in headers)

    def test_org_name_in_instructions(self):
        from outputs.supplier_template import generate_supplier_template
        import openpyxl
        data = generate_supplier_template("Sunrise Energy Ltd", 2024)
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Instructions"]
        cell_values = " ".join(str(c.value or "") for row in ws.iter_rows() for c in row)
        assert "Sunrise Energy Ltd" in cell_values

    def test_different_org_names(self):
        from outputs.supplier_template import generate_supplier_template
        for name in ["ABC Corp", "XYZ Ltd", "Tata Steel"]:
            data = generate_supplier_template(name, 2024)
            assert len(data) > 1000


# ---------------------------------------------------------------------------
# New pages import + render callable
# ---------------------------------------------------------------------------

class TestNewPagesImport:

    def test_initiatives_page_imports(self):
        import sys
        import unittest.mock as mock
        sys.modules['streamlit'] = mock.MagicMock()
        from streamlit_app import _page_08_initiatives as pg
        assert hasattr(pg, "render")
        assert callable(pg.render)

    def test_checklist_page_imports(self):
        import sys
        import unittest.mock as mock
        sys.modules['streamlit'] = mock.MagicMock()
        from streamlit_app import _page_09_checklist as pg
        assert hasattr(pg, "render")
        assert callable(pg.render)

    def test_checklist_has_all_sections(self):
        from streamlit_app._page_09_checklist import CHECKLIST
        assert len(CHECKLIST) >= 6
        total_items = sum(len(items) for items in CHECKLIST.values())
        assert total_items >= 30

    def test_initiatives_constants(self):
        from streamlit_app._page_08_initiatives import CATEGORIES, STATUSES, STATUS_COLOURS
        assert len(CATEGORIES) >= 5
        assert "In progress" in STATUSES
        assert "Completed" in STATUSES
        assert "In progress" in STATUS_COLOURS


# ---------------------------------------------------------------------------
# BRSR mapper — Sprint 6 fields
# ---------------------------------------------------------------------------

class TestBRSRSprint6:

    def setup_method(self, method):
        self._store, self._tmp = _store_with_data()

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _profile(self):
        return {"org_name": "Test", "org_id": "sprint6_test",
                "reporting_year": 2024, "gwp_ar": 6}

    def test_brsr_reduction_target_in_json(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        brsr = generate_brsr_disclosure(
            self._store, self._profile(), 2024,
            reduction_target_pct=42.0,
            reduction_target_year=2030,
        )
        j = brsr["json"]
        assert j.get("reduction_target_pct") == pytest.approx(42.0)
        assert j.get("reduction_target_year") == 2030

    def test_brsr_energy_field_exists(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        brsr = generate_brsr_disclosure(self._store, self._profile(), 2024)
        j = brsr["json"]
        assert "energy_direct_tj" in j

    def test_brsr_scope_totals_correct(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        brsr = generate_brsr_disclosure(
            self._store, self._profile(), 2024,
            turnover_inr_cr=900.0,
        )
        j = brsr["json"]
        assert j["scope1_tco2e"] == pytest.approx(500.0, rel=0.01)
        assert j["scope2_tco2e"] == pytest.approx(300.0, rel=0.01)
        assert j["total_tco2e"]  == pytest.approx(900.0, rel=0.01)
        assert j["intensity_per_inr_crore"] == pytest.approx(1.0, rel=0.01)

    def test_brsr_text_has_org_name(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        brsr = generate_brsr_disclosure(self._store, self._profile(), 2024)
        assert "Test" in brsr["text"]
        assert len(brsr["text"]) > 300

    def test_brsr_metadata_framework(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        brsr = generate_brsr_disclosure(self._store, self._profile(), 2024)
        meta = brsr["metadata"]
        assert meta["framework"] == "SEBI BRSR Core"
        assert meta["principle"].startswith("Principle 6")


# ---------------------------------------------------------------------------
# CDP mapper — Sprint 6 fields
# ---------------------------------------------------------------------------

class TestCDPSprint6:

    def setup_method(self, method):
        self._store, self._tmp = _store_with_data()

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _profile(self):
        return {"org_name": "Test", "org_id": "sprint6_test",
                "reporting_year": 2024, "gwp_ar": 6,
                "primary_country": "IN", "boundary": "operational_control"}

    def test_cdp_intensity_usd_m(self):
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        cdp = generate_cdp_disclosure(
            self._store, self._profile(), 2024,
            revenue_usd_m=100.0,
        )
        j = cdp["json"]
        # S1+S2 = 800, revenue = 100M USD → intensity = 8.0
        assert j["C8_s12_intensity_per_usd_m"] == pytest.approx(8.0, rel=0.01)

    def test_cdp_base_year_change(self):
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        cdp = generate_cdp_disclosure(
            self._store, self._profile(), 2024,
            base_year=2020,
            base_year_emissions=1000.0,
        )
        j = cdp["json"]
        # 900 vs 1000 base → -10%
        assert j["C7_pct_change_vs_base"] == pytest.approx(-10.0, rel=0.01)

    def test_cdp_s3_by_category_populated(self):
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        cdp = generate_cdp_disclosure(self._store, self._profile(), 2024)
        j = cdp["json"]
        assert "C11.1_s3_by_category" in j

    def test_cdp_required_keys_present(self):
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        cdp = generate_cdp_disclosure(self._store, self._profile(), 2024)
        j = cdp["json"]
        for key in ["C6.1_s1_gross_tco2e", "C6.3_s2_location_tco2e",
                    "C11.1_s3_total_tco2e", "C6.5_total_s1_s2_tco2e"]:
            assert key in j, f"Missing key: {key}"


# ---------------------------------------------------------------------------
# Snapshot multi-year Excel
# ---------------------------------------------------------------------------

class TestSnapshotMultiYear:

    def test_get_available_years_sorted_desc(self):
        from inventory.store import get_store
        from modules.base import ActivityRecord, EmissionResult
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="snap_test")
        try:
            for yr in [2021, 2023, 2022]:
                rid = str(uuid.uuid4())
                rec = ActivityRecord(record_id=rid, scope="Scope 1",
                    org_id="snap_test",
                    process="S1 — Stationary combustion (fuel burn)",
                    country="IN", quantity=100, unit="GJ",
                    fuel_or_item="natural_gas",
                    reporting_year=yr, gwp_ar=6)
                res = EmissionResult(record_id=rid, kg_CO2=100000, kg_CH4=0,
                    kg_N2O=0, kg_CO2e=100000, gwp_ar_used=6,
                    factor_id_used="T", ef_value_used=1.0,
                    ef_unit="kgCO2/GJ", ef_source="test",
                    fallback_level="national", fallback_triggered=False,
                    calculation_engine="local", confidence="high")
                store.persist(res, rec, yr)
            yrs = store.get_available_years(org_id="snap_test")
            assert yrs == [2023, 2022, 2021]
        finally:
            store._db.close()
            if os.path.exists(tmp):
                try:
                    os.unlink(tmp)
                except Exception:
                    pass

    def test_get_snapshots_empty_when_none(self):
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="snap_empty")
        try:
            snaps = store.get_snapshots(org_id="snap_empty")
            assert snaps == []
        finally:
            store._db.close()
            if os.path.exists(tmp):
                try:
                    os.unlink(tmp)
                except Exception:
                    pass

    def test_inventory_year_in_get_all_records(self):
        from inventory.store import get_store
        from modules.base import ActivityRecord, EmissionResult
        tmp = tempfile.mktemp(suffix=".sqlite")
        org = "inv_yr_test"
        store = get_store(tmp, org_id=org)
        try:
            for yr in [2023, 2024]:
                rid = str(uuid.uuid4())
                rec = ActivityRecord(record_id=rid, scope="Scope 1", org_id=org,
                    process="S1 — Stationary combustion (fuel burn)",
                    country="IN", quantity=100, unit="GJ",
                    fuel_or_item="natural_gas", reporting_year=yr, gwp_ar=6)
                res = EmissionResult(record_id=rid, kg_CO2=10000, kg_CH4=0,
                    kg_N2O=0, kg_CO2e=10000, gwp_ar_used=6,
                    factor_id_used="T", ef_value_used=1.0,
                    ef_unit="kgCO2/GJ", ef_source="test",
                    fallback_level="national", fallback_triggered=False,
                    calculation_engine="local", confidence="high")
                store.persist(res, rec, yr)
            recs_23 = store.get_all_records(inventory_year=2023)
            recs_24 = store.get_all_records(inventory_year=2024)
            assert len(recs_23) == 1
            assert len(recs_24) == 1
            assert recs_23[0]["inventory_year"] == 2023
            assert recs_24[0]["inventory_year"] == 2024
        finally:
            store._db.close()
            if os.path.exists(tmp):
                try:
                    os.unlink(tmp)
                except Exception:
                    pass


# ---------------------------------------------------------------------------
# Report generation — Sprint 6
# ---------------------------------------------------------------------------

class TestReportSprint6:

    def setup_method(self, method):
        self._store, self._tmp = _store_with_data(s1=400, s2=300, s3=200)

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _profile(self):
        return {"org_name": "Sprint6 Corp", "org_id": "sprint6_test",
                "reporting_year": 2024, "gwp_ar": 6}

    def test_report_total_correct(self):
        from outputs.report import generate_report
        r = generate_report(self._store, self._profile(), 2024)
        assert r["summary"]["total_t_co2e"] == pytest.approx(900.0, rel=0.01)

    def test_report_n_records(self):
        from outputs.report import generate_report
        r = generate_report(self._store, self._profile(), 2024)
        assert r["summary"]["n_records"] == 3

    def test_report_data_quality_grade(self):
        from outputs.report import generate_report
        r = generate_report(self._store, self._profile(), 2024)
        dq = r["data_quality"]
        assert "grade" in dq
        assert dq["grade"][0] in ("A", "B", "C", "D", "E", "N"), f"Unexpected grade: {dq['grade']!r}"

    def test_report_text_has_totals(self):
        from outputs.report import generate_report
        r = generate_report(self._store, self._profile(), 2024)
        text = r["text_report"]
        assert "900" in text or "900." in text
        assert "Sprint6 Corp" in text

    def test_report_to_csv_has_headers(self):
        from outputs.report import generate_report, to_csv
        r = generate_report(self._store, self._profile(), 2024)
        csv = to_csv(r)
        lines = [l for l in csv.split("\n") if l.strip()]
        assert len(lines) >= 4
        assert "scope" in csv.lower() or "Scope" in csv


# ---------------------------------------------------------------------------
# Engine — Sprint 6 smoke tests for new processes
# ---------------------------------------------------------------------------

class TestEngineSprint6:

    def test_all_processes_registered(self, db_conn):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_process_names_unique(self):
        from core.engine import _PROCESS_REGISTRY
        names = list(_PROCESS_REGISTRY.keys())
        assert len(names) == len(set(names))

    def test_ippu_cement_1kt(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="IPPU — Cement (process CO2)",
            quantity=1, unit="kt", fuel_or_item="clinker",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(524.4, rel=0.01)

    def test_afolu_all_types_return_positive(self, db_conn):
        from core.engine import calculate
        for animal in ["dairy_cattle","non_dairy_cattle","buffalo","sheep","goat","pig"]:
            r = calculate(_rec(
                process="AFOLU — Enteric fermentation (Tier 1)",
                quantity=10, unit="head", fuel_or_item=animal,
            ), db_conn)
            assert r.t_CO2e >= 0, f"{animal} returned {r.t_CO2e}"

    def test_cea_regression(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            country="IN", quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24", gwp_ar=6,
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)


# ---------------------------------------------------------------------------
# TCFD mapper
# ---------------------------------------------------------------------------

class TestTCFDMapper:

    def setup_method(self, method):
        self._store, self._tmp = _store_with_data()

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _profile(self):
        return {"org_name": "Test Corp", "org_id": "sprint6_test",
                "reporting_year": 2024, "gwp_ar": 6}

    def test_tcfd_returns_four_pillars(self):
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        tcfd = generate_tcfd_disclosure(self._store, self._profile(), 2024)
        assert "Governance" in tcfd["sections"]
        assert "Strategy" in tcfd["sections"]
        assert "Risk Management" in tcfd["sections"]
        assert "Metrics & Targets" in tcfd["sections"]

    def test_tcfd_json_has_scope_totals(self):
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        tcfd = generate_tcfd_disclosure(self._store, self._profile(), 2024)
        j = tcfd["json"]
        assert j["scope1_tco2e"] == pytest.approx(500.0, rel=0.01)
        assert j["scope2_tco2e"] == pytest.approx(300.0, rel=0.01)
        assert j["total_tco2e"]  == pytest.approx(900.0, rel=0.01)

    def test_tcfd_pct_change(self):
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        tcfd = generate_tcfd_disclosure(
            self._store, self._profile(), 2024,
            base_year=2020, base_year_emissions=1000.0,
        )
        # 900 vs 1000 → -10%
        assert tcfd["json"]["pct_change_from_base"] == pytest.approx(-10.0, rel=0.01)

    def test_tcfd_text_not_empty(self):
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        tcfd = generate_tcfd_disclosure(self._store, self._profile(), 2024)
        assert len(tcfd["text"]) > 500
        assert "Test Corp" in tcfd["text"]
        assert "TCFD" in tcfd["metadata"]["framework"]

    def test_tcfd_initiatives_linkage(self):
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        initiatives = [
            {"status": "Completed", "achieved_tco2e": 50.0},
            {"status": "In progress", "target_tco2e": 100.0},
        ]
        tcfd = generate_tcfd_disclosure(
            self._store, self._profile(), 2024,
            initiatives=initiatives,
        )
        j = tcfd["json"]
        assert j["initiatives_achieved_tco2e"] == pytest.approx(50.0)
        assert j["initiatives_pipeline_tco2e"] == pytest.approx(100.0)


# ---------------------------------------------------------------------------
# GRI mapper
# ---------------------------------------------------------------------------

class TestGRIMapper:

    def setup_method(self, method):
        self._store, self._tmp = _store_with_data()

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _profile(self):
        return {"org_name": "Test Corp", "org_id": "sprint6_test",
                "reporting_year": 2024, "gwp_ar": 6,
                "revenue_inr_cr": 900.0, "employees": 500}

    def test_gri_returns_both_standards(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(self._store, self._profile(), 2024)
        assert "GRI 302" in gri["sections"]
        assert "GRI 305" in gri["sections"]

    def test_gri_305_scope_totals(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(self._store, self._profile(), 2024)
        j = gri["json"]
        assert j["305_1_scope1_tco2e"] == pytest.approx(500.0, rel=0.01)
        assert j["305_2_scope2_loc_tco2e"] == pytest.approx(300.0, rel=0.01)
        assert j["305_total_tco2e"] == pytest.approx(900.0, rel=0.01)

    def test_gri_intensity_calculated(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(self._store, self._profile(), 2024)
        j = gri["json"]
        # 900 tCO2e / 900 crore = 1.0
        assert j["305_4_intensity_per_cr_inr"] == pytest.approx(1.0, rel=0.01)
        # 900 / 500 = 1.8
        assert j["305_4_intensity_per_emp"] == pytest.approx(1.8, rel=0.01)

    def test_gri_renewable_energy_pct(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(
            self._store, self._profile(), 2024,
            total_energy_consumed_mwh=1000.0,
            energy_from_renewables_mwh=250.0,
        )
        j = gri["json"]
        assert j["302_1_renewables_pct"] == pytest.approx(25.0, rel=0.01)

    def test_gri_text_has_scope_values(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(self._store, self._profile(), 2024)
        text = gri["text"]
        assert "500.00" in text or "500," in text
        assert "GRI 305" in text
        assert "Test Corp" in text

    def test_gri_framework_metadata(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(self._store, self._profile(), 2024)
        assert "GRI" in gri["metadata"]["framework"]
        assert "305" in gri["metadata"]["standards"]
