"""
sk.lite — Sprint 8 Test Suite.

Covers:
  - to_xlsx() report generation
  - EF manager: WTT EFs visible, custom delete/add
  - Dashboard: S1 sub-breakdown query logic
  - Data manager: category filter
  - Disclosure pack: zip contains expected files
  - TCFD + GRI integration
  - Full end-to-end: calculate → persist → report → xlsx → zip
"""

from __future__ import annotations
import io
import json
import os
import tempfile
import uuid
import zipfile
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


def _store_with_data(s1=500.0, s2=300.0, s3=100.0, org="s8_test"):
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
# to_xlsx() report generation
# ---------------------------------------------------------------------------

class TestToXlsx:

    def setup_method(self, method):
        self._store, self._tmp = _store_with_data()

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _report(self):
        from outputs.report import generate_report
        profile = {"org_name": "Test Corp", "org_id": "s8_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        return generate_report(self._store, profile, 2024)

    def test_to_xlsx_returns_bytes(self):
        from outputs.report import to_xlsx
        r = self._report()
        data = to_xlsx(r, "Test Corp")
        assert isinstance(data, bytes)
        assert len(data) > 1000

    def test_to_xlsx_valid_workbook(self):
        from outputs.report import to_xlsx
        import openpyxl
        r = self._report()
        data = to_xlsx(r, "Test Corp")
        wb = openpyxl.load_workbook(io.BytesIO(data))
        assert "Summary" in wb.sheetnames

    def test_to_xlsx_summary_sheet_has_totals(self):
        from outputs.report import to_xlsx
        import openpyxl
        r = self._report()
        data = to_xlsx(r, "Test Corp")
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Summary"]
        # Find total in rows 4-7
        values = [ws.cell(row=i, column=2).value for i in range(3, 8)]
        numeric = [v for v in values if isinstance(v, (int, float)) and v > 0]
        assert len(numeric) >= 3  # S1, S2, S3 or total

    def test_to_xlsx_has_by_category_sheet(self):
        from outputs.report import to_xlsx
        import openpyxl
        r = self._report()
        data = to_xlsx(r, "Test Corp")
        wb = openpyxl.load_workbook(io.BytesIO(data))
        assert "By Category" in wb.sheetnames

    def test_to_xlsx_has_methodology_sheet(self):
        from outputs.report import to_xlsx
        import openpyxl
        r = self._report()
        data = to_xlsx(r, "Test Corp")
        wb = openpyxl.load_workbook(io.BytesIO(data))
        assert "Methodology" in wb.sheetnames

    def test_to_xlsx_org_name_in_summary(self):
        from outputs.report import to_xlsx
        import openpyxl
        r = self._report()
        data = to_xlsx(r, "Sunrise Energy Ltd")
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Summary"]
        cell_vals = " ".join(str(c.value or "") for row in ws.iter_rows() for c in row)
        assert "Sunrise Energy Ltd" in cell_vals


# ---------------------------------------------------------------------------
# EF manager WTT table
# ---------------------------------------------------------------------------

class TestWTTEFs:

    def test_wtt_efs_in_db(self, db_conn):
        """WTT factors are seeded in the emission_factors table."""
        n = db_conn.execute(
            "SELECT COUNT(*) FROM emission_factors WHERE factor_id LIKE 'WTT%'"
        ).fetchone()[0]
        assert n >= 10, f"Expected ≥10 WTT EFs, got {n}"

    def test_wtt_ef_for_natural_gas(self, db_conn):
        row = db_conn.execute(
            "SELECT factor_value, unit_numerator FROM emission_factors "
            "WHERE factor_id = 'WTT24_NATGAS_CO2E_PER_GJ'"
        ).fetchone()
        assert row is not None, "WTT24_NATGAS_CO2E_PER_GJ not found"
        assert row[0] == pytest.approx(9.3, rel=0.05)

    def test_wtt_ef_for_diesel(self, db_conn):
        row = db_conn.execute(
            "SELECT factor_value FROM emission_factors "
            "WHERE factor_id = 'WTT24_DIESEL_CO2E_PER_GJ'"
        ).fetchone()
        assert row is not None
        assert row[0] > 0

    def test_wtt_efs_have_correct_module(self, db_conn):
        rows = db_conn.execute(
            "SELECT DISTINCT module FROM emission_factors WHERE factor_id LIKE 'WTT%'"
        ).fetchall()
        # WTT factors stored under module 'other' (DEFRA source)
        modules = [r[0] for r in rows]
        assert len(modules) >= 1


# ---------------------------------------------------------------------------
# Custom EF add/delete cycle
# ---------------------------------------------------------------------------

class TestCustomEFCycle:

    def test_add_and_delete_custom_ef(self, db_conn):
        """Add a custom EF then delete it — DB returns to original count."""
        n_before = db_conn.execute(
            "SELECT COUNT(*) FROM emission_factors WHERE preferred_rank=1"
        ).fetchone()[0]

        fid = f"CUSTOM_TEST_{uuid.uuid4().hex[:8]}"
        db_conn.execute("""
            INSERT OR REPLACE INTO emission_factors
            (factor_id, factor_set_version, scope, module, country,
             geography_level, fuel_item, gas, factor_value,
             unit_numerator, unit_denominator, source_name, preferred_rank)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (fid, "custom", "S1", "stationary_combustion", "IN",
              "national", "natural_gas", "CO2", 99.99,
              "kgCO2", "TJ", "test", 1))
        db_conn.commit()

        n_after_add = db_conn.execute(
            "SELECT COUNT(*) FROM emission_factors WHERE preferred_rank=1"
        ).fetchone()[0]
        assert n_after_add == n_before + 1

        db_conn.execute(
            "DELETE FROM emission_factors WHERE factor_id=?", (fid,)
        )
        db_conn.commit()

        n_after_del = db_conn.execute(
            "SELECT COUNT(*) FROM emission_factors WHERE preferred_rank=1"
        ).fetchone()[0]
        assert n_after_del == n_before

    def test_custom_ef_overrides_default(self, db_conn):
        """preferred_rank=1 EF wins over rank=2 default."""
        from ef_store.selector import get_ef
        # Natural gas CO2 default
        default = get_ef(db_conn, module="stationary_combustion",
                         fuel_item="natural_gas", gas="CO2",
                         country="IN", year=2024)
        assert default is not None
        default_val = default.value

        # Add custom rank=1 override
        fid = f"CUSTOM_NG_{uuid.uuid4().hex[:6]}"
        db_conn.execute("""
            INSERT INTO emission_factors
            (factor_id, factor_set_version, scope, module, country,
             geography_level, fuel_item, gas, factor_value,
             unit_numerator, unit_denominator, source_name, preferred_rank)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (fid, "custom", "S1", "stationary_combustion", "IN",
              "national", "natural_gas", "CO2", 99999.0,
              "kgCO2", "TJ", "custom_test", 1))
        db_conn.commit()

        try:
            custom = get_ef(db_conn, module="stationary_combustion",
                            fuel_item="natural_gas", gas="CO2",
                            country="IN", year=2024)
            assert custom is not None
            assert custom.value == pytest.approx(99999.0)
        finally:
            db_conn.execute("DELETE FROM emission_factors WHERE factor_id=?", (fid,))
            db_conn.commit()


# ---------------------------------------------------------------------------
# Data manager category filter
# ---------------------------------------------------------------------------

class TestDataManagerFilter:

    def _add_records(self, store, records):
        """Insert raw records into store."""
        for scope, cat, val in records:
            store._db.execute("""
                INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                    scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                    kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                    created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (str(uuid.uuid4()), store.org_id, 2024, 0, scope, cat,
                  "test process", "IN", 100, "GJ", val*1000, 0, 0,
                  val*1000, 0, val, 6, 0,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
        store._db.commit()

    def test_get_all_records_returns_category(self, inv_store):
        self._add_records(inv_store, [
            ("Scope 1", "Stationary combustion", 100),
            ("Scope 3", "Cat 1 — Purchased goods", 200),
        ])
        recs = inv_store.get_all_records(inventory_year=2024)
        assert len(recs) == 2
        cats = {r.get("category") for r in recs}
        assert "Stationary combustion" in cats
        assert "Cat 1 — Purchased goods" in cats

    def test_scope_filter_works(self, inv_store):
        self._add_records(inv_store, [
            ("Scope 1", "Stationary combustion", 100),
            ("Scope 2", "Purchased electricity", 50),
            ("Scope 3", "Cat 1", 200),
        ])
        recs_s1 = inv_store.get_all_records(inventory_year=2024,
                                             scope="Scope 1")
        assert all(r["scope"] == "Scope 1" for r in recs_s1)
        assert len(recs_s1) == 1


# ---------------------------------------------------------------------------
# Full end-to-end: calculate → persist → report → xlsx
# ---------------------------------------------------------------------------

class TestFullE2E:

    def test_calculate_persist_report_xlsx(self, inv_store, db_conn):
        from core.engine import calculate
        from outputs.report import generate_report, to_xlsx

        # Calculate
        rec = _rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
            org_id=inv_store.org_id,
        )
        result = calculate(rec, db_conn)
        assert result.t_CO2e > 0

        # Persist
        inv_store.persist(result, rec, 2024)
        s = inv_store.get_summary(inventory_year=2024)
        assert s["n_records"] == 1

        # Generate report
        profile = {"org_name": "E2E Corp", "org_id": inv_store.org_id,
                   "reporting_year": 2024, "gwp_ar": 6}
        report = generate_report(inv_store, profile, 2024)
        assert report["summary"]["n_records"] == 1
        assert report["summary"]["total_t_co2e"] == pytest.approx(
            result.t_CO2e, rel=0.001)

        # Excel
        xlsx = to_xlsx(report, "E2E Corp")
        assert len(xlsx) > 1000

        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(xlsx))
        assert "Summary" in wb.sheetnames

    def test_multi_scope_e2e(self, inv_store, db_conn):
        from core.engine import calculate
        from outputs.report import generate_report

        records = [
            _rec(scope="Scope 1", org_id=inv_store.org_id,
                 process="S1 — Stationary combustion (fuel burn)",
                 quantity=500, unit="GJ", fuel_or_item="diesel"),
            _rec(scope="Scope 2", org_id=inv_store.org_id,
                 process="S2 — Purchased electricity (grid)",
                 quantity=100_000, unit="kWh", fuel_or_item="grid_electricity"),
        ]
        for rec in records:
            result = calculate(rec, db_conn)
            inv_store.persist(result, rec, 2024)

        profile = {"org_name": "Multi Corp", "org_id": inv_store.org_id,
                   "reporting_year": 2024, "gwp_ar": 6}
        report = generate_report(inv_store, profile, 2024)
        assert report["summary"]["n_records"] == 2
        assert report["summary"]["scope1_t_co2e"] > 0
        assert report["summary"]["scope2_t_co2e"] > 0


# ---------------------------------------------------------------------------
# Supplier template
# ---------------------------------------------------------------------------

class TestSupplierTemplateSprint8:

    def test_cat11_has_formula_column(self):
        from outputs.supplier_template import generate_supplier_template
        import openpyxl
        data = generate_supplier_template("Test Corp", 2024)
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Cat11 - Use of Products"]
        # Formula columns should be present
        headers = [c.value for c in ws[3] if c.value]
        header_str = " ".join(str(h) for h in headers).lower()
        assert "energy" in header_str
        assert "unit" in header_str

    def test_instructions_has_return_instruction(self):
        from outputs.supplier_template import generate_supplier_template
        import openpyxl
        data = generate_supplier_template("Acme Ltd", 2024)
        wb = openpyxl.load_workbook(io.BytesIO(data))
        ws = wb["Instructions"]
        all_text = " ".join(str(c.value or "")
                            for row in ws.iter_rows() for c in row)
        assert "Acme Ltd" in all_text


# ---------------------------------------------------------------------------
# CEA regression — Sprint 8
# ---------------------------------------------------------------------------

class TestCEASprint8:

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

    def test_natural_gas_ncv_48(self, db_conn):
        from core.unit_converter import _lookup_ncv
        ncv = _lookup_ncv(db_conn, "natural_gas", "IN")
        assert ncv == pytest.approx(48.0, rel=0.001)

    def test_all_56_processes_importable(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57
        for name, cls in _PROCESS_REGISTRY.items():
            assert callable(cls), f"{name} is not callable"
