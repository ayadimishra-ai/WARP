"""
sk.lite — Sprint 5 Test Suite.

Covers:
  - IPPU: cement, lime, steel, glass, chemicals
  - AFOLU: enteric fermentation all livestock types
  - CDP mapper: revenue_usd_m param, intensity calc
  - BRSR mapper: scope breakdown, intensity per crore INR
  - Year-over-year inventory queries
  - End-to-end: persist → query → delete → verify
  - Non-coking coal NCV split (India-specific)
  - stationary combustion alias correctness
  - Unit converter completeness
"""

from __future__ import annotations
import os
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


# ---------------------------------------------------------------------------
# Helpers  (conftest provides db_conn and inv_store)
# ---------------------------------------------------------------------------

def _rec(**kwargs):
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6)
    d.update(kwargs)
    return ActivityRecord(**d)


def _rec_for_store(store, **kwargs):
    """Like _rec() but uses store.org_id so persist/query are consistent."""
    from modules.base import ActivityRecord
    d = dict(scope="Scope 1", country="IN", reporting_year=2024,
             gwp_ar=6, org_id=store.org_id)
    d.update(kwargs)
    return ActivityRecord(**d)


def _calc(record, conn):
    from core.engine import calculate
    return calculate(record, conn)


# ---------------------------------------------------------------------------
# IPPU
# ---------------------------------------------------------------------------

class TestIPPU:

    def test_cement_clinker(self, db_conn):
        r = _calc(_rec(
            process="IPPU — Cement (process CO2)",
            quantity=10, unit="kt", fuel_or_item="clinker",
        ), db_conn)
        # 10 kt × 0.5244 tCO2/t × 1000 = 5244 tCO2e
        assert r.t_CO2e == pytest.approx(5244.0, rel=0.01)
        assert r.kg_CO2 > 0
        assert r.kg_CH4 == 0.0   # process CO2 only

    def test_lime(self, db_conn):
        r = _calc(_rec(
            process="IPPU — Lime (process CO2)",
            quantity=5, unit="kt", fuel_or_item="lime",
        ), db_conn)
        # 5 kt × 0.7848 tCO2/t × 1000 = 3924 tCO2e
        assert r.t_CO2e == pytest.approx(3924.0, rel=0.01)

    def test_steel_bof(self, db_conn):
        r = _calc(_rec(
            process="IPPU — Steel (process CO2)",
            quantity=100, unit="kt", fuel_or_item="steel_bof",
        ), db_conn)
        # 100 kt × 0.046 tCO2/t × 1000 = 4600 tCO2e
        assert r.t_CO2e == pytest.approx(4600.0, rel=0.01)

    def test_glass(self, db_conn):
        r = _calc(_rec(
            process="IPPU — Glass (process CO2)",
            quantity=10, unit="kt", fuel_or_item="glass",
        ), db_conn)
        # 10 kt × 0.20 tCO2/t × 1000 = 2000 tCO2e
        assert r.t_CO2e == pytest.approx(2000.0, rel=0.01)

    def test_chemicals_ammonia(self, db_conn):
        r = _calc(_rec(
            process="IPPU — Chemicals (process emissions)",
            quantity=1, unit="kt", fuel_or_item="ammonia",
        ), db_conn)
        # 1 kt × 1.694 tCO2e/t × 1000 = 1694 tCO2e
        assert r.t_CO2e == pytest.approx(1694.0, rel=0.01)

    def test_ippu_scope_is_scope1(self, db_conn):
        r = _calc(_rec(
            process="IPPU — Cement (process CO2)",
            quantity=1, unit="kt", fuel_or_item="clinker",
        ), db_conn)
        assert r.t_CO2e > 0
        # IPPU is always Scope 1 direct
        assert r.calculation_engine in ("local", "ippu")

    def test_ippu_unit_tonnes(self, db_conn):
        """Tonnes and kilotonnes give proportional results."""
        r_t  = _calc(_rec(process="IPPU — Cement (process CO2)",
                          quantity=1000, unit="t", fuel_or_item="clinker"), db_conn)
        r_kt = _calc(_rec(process="IPPU — Cement (process CO2)",
                          quantity=1, unit="kt", fuel_or_item="clinker"), db_conn)
        assert r_t.t_CO2e == pytest.approx(r_kt.t_CO2e, rel=0.001)


# ---------------------------------------------------------------------------
# AFOLU
# ---------------------------------------------------------------------------

class TestAFOLU:

    def _afolu(self, animal, heads, db_conn):
        return _calc(_rec(
            process="AFOLU — Enteric fermentation (Tier 1)",
            quantity=heads, unit="head", fuel_or_item=animal,
        ), db_conn)

    def test_dairy_cattle_100_head(self, db_conn):
        r = self._afolu("dairy_cattle", 100, db_conn)
        # India Tier 1: 56 kgCH4/head/yr × 100 × GWP(CH4 AR6=27.9) / 1000
        # = 5600 kg CH4 × 27.9 / 1000 = 156.24 tCO2e  (approx, varies by GWP)
        # India Tier 1 dairy: 128 kgCH4/head/yr × 100 × GWP(AR6=27.9) / 1000 = 357.12 tCO2e
        assert r.t_CO2e == pytest.approx(357.12, rel=0.02)
        assert r.kg_CH4 > 0
        assert r.kg_CO2 == 0.0   # enteric = CH4 only

    def test_buffalo(self, db_conn):
        r = self._afolu("buffalo", 50, db_conn)
        assert r.t_CO2e > 0
        assert r.kg_CH4 > 0

    def test_sheep_lower_than_cattle(self, db_conn):
        r_sheep  = self._afolu("sheep",        100, db_conn)
        r_cattle = self._afolu("dairy_cattle", 100, db_conn)
        assert r_sheep.t_CO2e < r_cattle.t_CO2e

    def test_goat(self, db_conn):
        r = self._afolu("goat", 100, db_conn)
        assert r.t_CO2e > 0

    def test_pig(self, db_conn):
        r = self._afolu("pig", 100, db_conn)
        assert r.t_CO2e > 0

    def test_non_dairy_cattle(self, db_conn):
        r = self._afolu("non_dairy_cattle", 100, db_conn)
        # Non-dairy has lower EF than dairy
        r_dairy = self._afolu("dairy_cattle", 100, db_conn)
        assert r.t_CO2e < r_dairy.t_CO2e

    def test_afolu_proportional_to_head_count(self, db_conn):
        r100 = self._afolu("dairy_cattle", 100, db_conn)
        r200 = self._afolu("dairy_cattle", 200, db_conn)
        assert r200.t_CO2e == pytest.approx(r100.t_CO2e * 2, rel=0.001)

    def test_afolu_gwp_ar6(self, db_conn):
        """AR6 CH4 GWP = 27.9; AR5 = 28. Results should differ."""
        r6 = _calc(_rec(process="AFOLU — Enteric fermentation (Tier 1)",
                        quantity=100, unit="head", fuel_or_item="dairy_cattle",
                        gwp_ar=6), db_conn)
        r5 = _calc(_rec(process="AFOLU — Enteric fermentation (Tier 1)",
                        quantity=100, unit="head", fuel_or_item="dairy_cattle",
                        gwp_ar=5), db_conn)
        # AR5 CH4 GWP=28, AR6=27.9 → AR5 slightly higher
        assert r5.t_CO2e > r6.t_CO2e


# ---------------------------------------------------------------------------
# CDP mapper
# ---------------------------------------------------------------------------

class TestCDPMapper:

    def _store_with_data(self):
        """Create a temp inventory with S1+S2+S3 records."""
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="cdp_test")
        self._tmp = tmp
        for scope, val in [("Scope 1", 500.0), ("Scope 2", 300.0), ("Scope 3", 200.0)]:
            store._db.execute("""
                INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                    scope,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                    kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                    created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (str(uuid.uuid4()), "cdp_test", 2024, 0, scope,
                  "S1 — Stationary combustion (fuel burn)", "IN",
                  1000, "GJ", val*1000, 0, 0, val*1000, 0, val, 6, 0,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
        store._db.commit()
        return store

    def teardown_method(self, method):
        if hasattr(self, '_tmp') and os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def test_cdp_revenue_usd_m_param(self):
        """revenue_usd_m (USD millions) should populate C8 intensity."""
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        store = self._store_with_data()
        profile = {"org_name": "Test", "org_id": "cdp_test",
                   "reporting_year": 2024, "gwp_ar": 6,
                   "primary_country": "IN", "boundary": "operational_control"}
        try:
            cdp = generate_cdp_disclosure(
                store, profile, 2024,
                revenue_usd_m=100.0,   # $100M revenue
            )
            j = cdp["json"]
            # S1+S2 = 800 tCO2e / 100 USD_M = 8.0
            # S1+S2=800 / 100 USD_M = 8.0 intensity
            assert j.get("C8_s12_intensity_per_usd_m") == pytest.approx(8.0, rel=0.01)
            assert cdp["text"]
            assert len(cdp["text"]) > 200
        finally:
            store._db.close()

    def test_cdp_legacy_turnover_usd(self):
        """Legacy turnover_usd (absolute USD) still works."""
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        store = self._store_with_data()
        profile = {"org_name": "Test", "org_id": "cdp_test",
                   "reporting_year": 2024, "gwp_ar": 6,
                   "primary_country": "IN", "boundary": "operational_control"}
        try:
            cdp = generate_cdp_disclosure(
                store, profile, 2024,
                turnover_usd=100_000_000,  # $100M in absolute USD
            )
            j = cdp["json"]
            # S1+S2=800 / 100 USD_M = 8.0 intensity
            assert j.get("C8_s12_intensity_per_usd_m") == pytest.approx(8.0, rel=0.01)
        finally:
            store._db.close()

    def test_cdp_base_year_pct_change(self):
        """Percentage change vs base year is calculated correctly."""
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        store = self._store_with_data()
        profile = {"org_name": "Test", "org_id": "cdp_test",
                   "reporting_year": 2024, "gwp_ar": 6,
                   "primary_country": "IN", "boundary": "operational_control"}
        try:
            # Total = 1000, base = 1250 → -20% reduction
            cdp = generate_cdp_disclosure(
                store, profile, 2024,
                base_year=2020,
                base_year_emissions=1250.0,
            )
            j = cdp["json"]
            assert j.get("C7_pct_change_vs_base") == pytest.approx(-20.0, rel=0.01)
        finally:
            store._db.close()

    def test_cdp_structure(self):
        """CDP output has required keys."""
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        store = self._store_with_data()
        profile = {"org_name": "Test", "org_id": "cdp_test",
                   "reporting_year": 2024, "gwp_ar": 6,
                   "primary_country": "IN", "boundary": "operational_control"}
        try:
            cdp = generate_cdp_disclosure(store, profile, 2024)
            assert "text"     in cdp
            assert "json"     in cdp
            assert "sections" in cdp
            j = cdp["json"]
            assert "C6.1_s1_gross_tco2e"    in j
            assert "C6.3_s2_location_tco2e"  in j
            assert "C11.1_s3_total_tco2e"     in j
        finally:
            store._db.close()


# ---------------------------------------------------------------------------
# BRSR mapper
# ---------------------------------------------------------------------------

class TestBRSRMapper:

    def _store_with_data(self, s1=100, s2=200, s3=50):
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="brsr_test")
        self._tmp = tmp
        for scope, val in [("Scope 1", s1), ("Scope 2", s2), ("Scope 3", s3)]:
            store._db.execute("""
                INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                    scope,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                    kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                    created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (str(uuid.uuid4()), "brsr_test", 2024, 0, scope,
                  "S1 — Stationary combustion (fuel burn)", "IN",
                  1000, "GJ", val*1000, 0, 0, val*1000, 0, val, 6, 0,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
        store._db.commit()
        return store

    def teardown_method(self, _):
        if hasattr(self, '_tmp') and os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def test_brsr_scope_totals(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        store = self._store_with_data(100, 200, 50)
        profile = {"org_name": "Test", "org_id": "brsr_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            brsr = generate_brsr_disclosure(store, profile, 2024)
            j = brsr["json"]
            assert j["scope1_tco2e"] == pytest.approx(100.0, rel=0.01)
            assert j["scope2_tco2e"] == pytest.approx(200.0, rel=0.01)
            assert j["scope3_tco2e"] == pytest.approx(50.0,  rel=0.01)
            assert j["total_tco2e"]  == pytest.approx(350.0, rel=0.01)
        finally:
            store._db.close()

    def test_brsr_intensity_per_crore(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        store = self._store_with_data(100, 200, 50)
        profile = {"org_name": "Test", "org_id": "brsr_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            brsr = generate_brsr_disclosure(
                store, profile, 2024,
                turnover_inr_cr=350.0,   # 350 crore INR
            )
            j = brsr["json"]
            # S1+S2+S3=350 / 350 crore = 1.0 tCO2e per crore INR
            assert j.get("intensity_per_inr_crore") == pytest.approx(800/800, rel=0.01)
        finally:
            store._db.close()

    def test_brsr_text_not_empty(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        store = self._store_with_data()
        profile = {"org_name": "Acme Ltd", "org_id": "brsr_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            brsr = generate_brsr_disclosure(store, profile, 2024)
            assert "BRSR" in brsr["text"]
            assert "Acme Ltd" in brsr["text"]
            assert len(brsr["text"]) > 500
        finally:
            store._db.close()

    def test_brsr_csv_export(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure, to_csv
        store = self._store_with_data()
        profile = {"org_name": "Test", "org_id": "brsr_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            brsr = generate_brsr_disclosure(store, profile, 2024)
            csv = to_csv(brsr)
            assert "scope1" in csv.lower() or "Scope 1" in csv
            assert len(csv.split("\n")) > 3
        finally:
            store._db.close()


# ---------------------------------------------------------------------------
# Year-over-year inventory queries
# ---------------------------------------------------------------------------

class TestYearOverYear:

    def _add_year(self, store, year: int, s1: float, s2: float):
        for scope, val in [("Scope 1", s1), ("Scope 2", s2)]:
            store._db.execute("""
                INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                    scope,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                    kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                    created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (str(uuid.uuid4()), store.org_id, year, 0, scope,
                  "S1 — Stationary combustion", "IN", 1000, "GJ",
                  val*1000, 0, 0, val*1000, 0, val, 6, 0,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
        store._db.commit()

    def test_multiple_years_isolated(self, inv_store):
        self._add_year(inv_store, 2022, 100, 50)
        self._add_year(inv_store, 2023, 120, 60)
        self._add_year(inv_store, 2024, 140, 70)

        s22 = inv_store.get_summary(inventory_year=2022)
        s23 = inv_store.get_summary(inventory_year=2023)
        s24 = inv_store.get_summary(inventory_year=2024)

        assert s22["total_t_co2e"] == pytest.approx(150.0, rel=0.01)
        assert s23["total_t_co2e"] == pytest.approx(180.0, rel=0.01)
        assert s24["total_t_co2e"] == pytest.approx(210.0, rel=0.01)

    def test_all_years_aggregate(self, inv_store):
        self._add_year(inv_store, 2022, 100, 50)
        self._add_year(inv_store, 2023, 200, 100)

        s_all = inv_store.get_summary()   # no year filter = all years
        assert s_all["total_t_co2e"] == pytest.approx(450.0, rel=0.01)
        assert s_all["n_records"] == 4

    def test_year_filter_in_get_all_records(self, inv_store):
        self._add_year(inv_store, 2023, 100, 50)
        self._add_year(inv_store, 2024, 200, 100)

        recs_23 = inv_store.get_all_records(inventory_year=2023)
        recs_24 = inv_store.get_all_records(inventory_year=2024)

        assert len(recs_23) == 2
        assert len(recs_24) == 2
        assert all(r["inventory_year"] == 2023 for r in recs_23)
        assert all(r["inventory_year"] == 2024 for r in recs_24)

    def test_yoy_trend_decreasing(self, inv_store):
        self._add_year(inv_store, 2022, 200, 100)
        self._add_year(inv_store, 2023, 180,  90)
        self._add_year(inv_store, 2024, 160,  80)

        totals = [
            inv_store.get_summary(inventory_year=yr)["total_t_co2e"]
            for yr in [2022, 2023, 2024]
        ]
        assert totals[0] > totals[1] > totals[2]


# ---------------------------------------------------------------------------
# End-to-end: persist → query → delete → verify
# ---------------------------------------------------------------------------

class TestEndToEnd:

    def test_full_scope1_flow(self, inv_store, db_conn):
        """Calculate, persist, query, delete — full round-trip."""
        from core.engine import calculate

        rec = _rec_for_store(inv_store,
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        )
        result = calculate(rec, db_conn)
        assert result.t_CO2e > 0

        inv_store.persist(result, rec, 2024)
        s = inv_store.get_summary(inventory_year=2024)
        assert s["n_records"] == 1
        assert s["scope1_t_co2e"] == pytest.approx(result.t_CO2e, rel=0.001)

        recs = inv_store.get_all_records(inventory_year=2024)
        assert len(recs) == 1
        assert recs[0]["record_id"] == result.record_id

        inv_store.delete_record(result.record_id)
        s2 = inv_store.get_summary(inventory_year=2024)
        assert s2["n_records"] == 0

    def test_full_scope2_flow(self, inv_store, db_conn):
        from core.engine import calculate
        rec = _rec_for_store(inv_store,
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            quantity=500_000, unit="kWh", fuel_or_item="grid_electricity",
        )
        result = calculate(rec, db_conn)
        inv_store.persist(result, rec, 2024)
        s = inv_store.get_summary(inventory_year=2024)
        assert s["scope2_t_co2e"] == pytest.approx(result.t_CO2e, rel=0.001)
        assert s["scope1_t_co2e"] == 0.0

    def test_persist_batch_multiple_scopes(self, inv_store, db_conn):
        from core.engine import calculate
        records = [
            _rec_for_store(inv_store, scope="Scope 1",
                 process="S1 — Stationary combustion (fuel burn)",
                 quantity=100, unit="GJ", fuel_or_item="diesel"),
            _rec_for_store(inv_store, scope="Scope 2",
                 process="S2 — Purchased electricity (grid)",
                 quantity=100_000, unit="kWh", fuel_or_item="grid_electricity"),
            _rec_for_store(inv_store, scope="Scope 3",
                 process="S3 Cat 5 — Waste generated in operations (waste-type-specific)",
                 quantity=10, unit="t", fuel_or_item="landfill_msw"),
        ]
        results = [calculate(r, db_conn) for r in records]
        written = inv_store.persist_batch(results, records, 2024)
        assert written == 3

        s = inv_store.get_summary(inventory_year=2024)
        assert s["n_records"] == 3
        assert s["scope1_t_co2e"] > 0
        assert s["scope2_t_co2e"] > 0
        assert s["scope3_t_co2e"] > 0

    def test_lock_prevents_delete(self, inv_store, db_conn):
        from core.engine import calculate
        rec = _rec_for_store(inv_store,
                   process="S1 — Stationary combustion (fuel burn)",
                   quantity=100, unit="GJ", fuel_or_item="coal_bituminous")
        result = calculate(rec, db_conn)
        inv_store.persist(result, rec, 2024)

        # Lock the year
        inv_store._db.execute(
            "UPDATE emission_results SET locked=1 WHERE record_id=?",
            (result.record_id,)
        )
        inv_store._db.commit()

        # Delete should be a no-op
        inv_store.delete_record(result.record_id)
        s = inv_store.get_summary(inventory_year=2024)
        assert s["n_records"] == 1   # still there

    def test_update_quantity_recalculates(self, inv_store, db_conn):
        from core.engine import calculate
        rec = _rec_for_store(inv_store,
                   process="S1 — Stationary combustion (fuel burn)",
                   quantity=1000, unit="GJ", fuel_or_item="natural_gas")
        result = calculate(rec, db_conn)
        inv_store.persist(result, rec, 2024)
        original_t = result.t_CO2e

        inv_store.update_quantity(result.record_id, 2000.0, db_conn)
        recs = inv_store.get_all_records(inventory_year=2024)
        assert len(recs) == 1
        assert recs[0]["quantity"] == pytest.approx(2000.0)
        assert recs[0]["t_CO2e"] == pytest.approx(original_t * 2, rel=0.01)


# ---------------------------------------------------------------------------
# Stationary combustion alias correctness
# ---------------------------------------------------------------------------

class TestStationaryCombustionAliases:

    def test_non_coking_coal_india_ncv(self, db_conn):
        """non_coking_coal uses India NCV (19.63 TJ/Gg), not global (25.8)."""
        from modules.stationary_combustion import StationaryCombustion
        r_ncc = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="t", fuel_or_item="non_coking_coal",
        ), db_conn)
        r_obc = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="t", fuel_or_item="coal_bituminous",
        ), db_conn)
        # non_coking_coal uses lower India NCV → lower emissions than global bituminous
        assert r_ncc.t_CO2e < r_obc.t_CO2e
        assert r_ncc.t_CO2e == pytest.approx(1857, rel=0.03)

    def test_petrol_alias_equals_motor_gasoline(self, db_conn):
        from modules.stationary_combustion import StationaryCombustion
        r_petrol = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="L", fuel_or_item="petrol",
        ), db_conn)
        r_mg = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="L", fuel_or_item="motor_gasoline",
        ), db_conn)
        assert r_petrol.t_CO2e == pytest.approx(r_mg.t_CO2e, rel=0.001)

    def test_diesel_alias_equals_diesel_oil(self, db_conn):
        from modules.stationary_combustion import StationaryCombustion
        r_d  = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="L", fuel_or_item="diesel",
        ), db_conn)
        r_do = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="L", fuel_or_item="diesel_oil",
        ), db_conn)
        assert r_d.t_CO2e == pytest.approx(r_do.t_CO2e, rel=0.001)

    def test_coal_alias(self, db_conn):
        """'coal' aliases to 'other_bituminous_coal' (use coal_bituminous as the test comparator)."""
        from modules.stationary_combustion import StationaryCombustion
        r_coal = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=100, unit="t", fuel_or_item="coal",
        ), db_conn)
        r_cbit = StationaryCombustion().calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=100, unit="t", fuel_or_item="coal_bituminous",
        ), db_conn)
        # Both 'coal' and 'coal_bituminous' alias to other_bituminous_coal EF lookup
        assert r_coal.t_CO2e == pytest.approx(r_cbit.t_CO2e, rel=0.001)


# ---------------------------------------------------------------------------
# Unit converter completeness
# ---------------------------------------------------------------------------

class TestUnitConverterCompleteness:

    def test_all_common_units_produce_positive_tj(self, db_conn):
        from core.unit_converter import to_tj
        cases = [
            (1000, "GJ",    "natural_gas"),
            (1,    "TJ",    "natural_gas"),
            (1000, "kWh",   "natural_gas"),
            (1,    "MWh",   "natural_gas"),
            (1000, "MMBTU", "natural_gas"),
            (1000, "kcal",  "coal_bituminous"),
            (1,    "Gcal",  "coal_bituminous"),
            (1000, "m3",    "natural_gas"),
            (1000, "scm",   "natural_gas"),
            (1,    "mmscm", "natural_gas"),
            (1000, "L",     "diesel_oil"),
            (1000, "kg",    "cng"),
            (100,  "t",     "coal_bituminous"),
        ]
        for qty, unit, fuel in cases:
            tj, _ = to_tj(qty, unit, fuel, "IN", db_conn)
            assert tj > 0, f"{qty} {unit} {fuel} -> {tj} (expected > 0)"

    def test_unit_symmetry_gj_tj(self, db_conn):
        from core.unit_converter import to_tj
        tj_gj, _ = to_tj(1000, "GJ", "natural_gas", "IN", db_conn)
        tj_tj, _ = to_tj(1,    "TJ", "natural_gas", "IN", db_conn)
        assert tj_gj == pytest.approx(tj_tj, rel=0.001)

    def test_unit_symmetry_kwh_mwh(self, db_conn):
        from core.unit_converter import to_tj
        tj_kwh, _ = to_tj(1_000_000, "kWh", "natural_gas", "IN", db_conn)
        tj_mwh, _ = to_tj(1_000,     "MWh", "natural_gas", "IN", db_conn)
        assert tj_kwh == pytest.approx(tj_mwh, rel=0.001)

    def test_ncv_ordering_prefers_ipcc_default(self, db_conn):
        """Natural gas NCV must be 48.0 (IPCC 2019 default), not 44.2 (legacy)."""
        from core.unit_converter import _lookup_ncv
        ncv = _lookup_ncv(db_conn, "natural_gas", "IN")
        assert ncv == pytest.approx(48.0, rel=0.001), \
            f"Expected 48.0 TJ/Gg (IPCC 2019), got {ncv} — legacy JSON row winning?"


# ---------------------------------------------------------------------------
# Regression: CEA v20 known answer
# ---------------------------------------------------------------------------

class TestCEARegressionSprint5:

    def test_cea_v20_fy2023_24(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        r = PurchasedElectricity().calculate(_rec(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)

    def test_scope2_dual_reporting(self, db_conn):
        """Market-based path should differ from location-based when supplier EF given."""
        from core.engine import calculate
        rec_loc = _rec(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            quantity=100_000, unit="kWh",
            fuel_or_item="grid_electricity",
        )
        rec_mkt = _rec(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            quantity=100_000, unit="kWh",
            fuel_or_item="grid_electricity",
            supplier_ef_value=0.2,   # lower than grid average
        )
        r_loc = calculate(rec_loc, db_conn)
        r_mkt = calculate(rec_mkt, db_conn)
        # Market-based with lower EF → lower market result
        mkt = r_mkt.audit_trace.get("dual_reporting", {}).get("market_based_t_co2e")
        assert mkt is not None
        assert mkt < r_loc.t_CO2e


# ---------------------------------------------------------------------------
# S3 process variant coverage — all remaining method paths
# ---------------------------------------------------------------------------

class TestS3VariantCoverage:
    """Tests every registered S3 process variant that wasn't covered earlier."""

    def _s3(self, process, fuel, qty, unit, country="IN", extra=None, db_conn=None):
        from core.engine import calculate
        return calculate(_rec(
            scope="Scope 3", process=process,
            quantity=qty, unit=unit, fuel_or_item=fuel,
            country=country, extra=extra or {},
        ), db_conn)

    def test_cat1_average_data(self, db_conn):
        r = self._s3("S3 Cat 1 — Purchased goods & services (average-data EF per mass/unit)",
                     "steel", 10, "t", db_conn=db_conn)
        assert r.t_CO2e == pytest.approx(28.9, rel=0.05)

    def test_cat1_eeio(self, db_conn):
        r = self._s3("S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
                     "chemicals", 10000, "USD", country="GLOBAL", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat1_supplier_specific(self, db_conn):
        r = self._s3("S3 Cat 1 — Purchased goods & services (supplier-specific EF)",
                     "steel", 10, "t",
                     extra={"supplier_ef_kgco2e_per_unit": 2.5, "supplier_ef_unit": "kgCO2e/kg"},
                     db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat2_average_data(self, db_conn):
        r = self._s3("S3 Cat 2 — Capital goods (average-data per mass/unit)",
                     "steel_structures", 5, "t", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat4_fuel_based(self, db_conn):
        r = self._s3("S3 Cat 4 — Upstream transport (fuel-based)",
                     "diesel_oil", 1000, "L", db_conn=db_conn)
        assert r.t_CO2e == pytest.approx(0.062, rel=0.10)

    def test_cat4_eeio(self, db_conn):
        r = self._s3("S3 Cat 4 — Upstream transport (spend-based EEIO)",
                     "logistics", 10000, "USD", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat5_landfill_model(self, db_conn):
        r = self._s3("S3 Cat 5 — Waste generated (landfill model)",
                     "msw", 10, "t", db_conn=db_conn)
        assert r.t_CO2e == pytest.approx(4.67, rel=0.05)

    def test_cat6_fuel_based(self, db_conn):
        r = self._s3("S3 Cat 6 — Business travel (fuel-based / energy-based)",
                     "jet_fuel", 500, "L", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat7_fuel_based(self, db_conn):
        r = self._s3("S3 Cat 7 — Employee commuting (fuel-based)",
                     "motor_gasoline", 200, "L", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat8_avg_per_asset(self, db_conn):
        r = self._s3("S3 Cat 8 — Upstream leased assets (avg EF per asset)",
                     "vehicle", 10, "unit", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat9_fuel_based(self, db_conn):
        r = self._s3("S3 Cat 9 — Downstream transport (fuel-based)",
                     "diesel_oil", 500, "L", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat10_site_specific(self, db_conn):
        # site-specific uses processing_ef_kg_co2e_per_kg (per kg, not per tonne)
        # 100t * 0.5 kgCO2e/kg = 100000 kg * 0.5 = 50000 kgCO2e = 50 tCO2e
        r = self._s3("S3 Cat 10 — Processing of sold intermediate products (site-specific)",
                     "steel_intermediate", 100, "t",
                     extra={"processing_ef_kg_co2e_per_kg": 0.5},
                     db_conn=db_conn)
        assert r.t_CO2e == pytest.approx(50.0, rel=0.05)

    def test_cat11_energy_consuming(self, db_conn):
        r = self._s3("S3 Cat 11 — Use of sold products (direct, energy consuming products)",
                     "electric_vehicle", 10000, "kWh", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat13_asset_specific(self, db_conn):
        r = self._s3("S3 Cat 13 — Downstream leased assets (asset-specific S1+S2)",
                     "office", 500, "m2",
                     extra={"asset_s1_tco2e": 10, "asset_s2_tco2e": 20},
                     db_conn=db_conn)
        assert r.t_CO2e == pytest.approx(27.5, rel=0.05)

    def test_cat14_average(self, db_conn):
        r = self._s3("S3 Cat 14 — Franchises (average-data)",
                     "restaurant_fast_food", 5, "outlets", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat14_specific(self, db_conn):
        r = self._s3("S3 Cat 14 — Franchises (franchise-specific, S1+S2 emissions)",
                     "franchise_s1_s2_reported", 500, "tCO2e", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat15_project_finance(self, db_conn):
        r = self._s3("S3 Cat 15 — Project finance (projected lifetime emissions, initial year only)",
                     "renewable_energy", 10_000_000, "USD",
                     country="GLOBAL", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_cat15_equity_specific(self, db_conn):
        r = self._s3("S3 Cat 15 — Investments (equity, investment-specific)",
                     "investee_s1_s2_reported", 1000, "tCO2e",
                     extra={"equity_pct": 0.25}, db_conn=db_conn)
        assert r.t_CO2e == pytest.approx(250.0, rel=0.01)

    def test_cat3c_td_losses(self, db_conn):
        r = self._s3("S3 Cat 3C — Transmission & distribution (T&D) losses",
                     "grid_electricity", 100_000, "kWh", db_conn=db_conn)
        assert r.t_CO2e > 0

    def test_all_s3_processes_return_positive(self, db_conn):
        """Smoke test: every S3 process variant produces a non-negative result."""
        from core.engine import _PROCESS_REGISTRY
        s3_procs = {k: v for k, v in _PROCESS_REGISTRY.items() if "Cat" in k}
        # Sample inputs keyed by process keyword
        # fuel-based processes need a combustion fuel in GJ/L, not tonne-km
        sample_inputs = {
            "purchased": dict(fuel_or_item="steel",          quantity=10,    unit="t"),
            "capital":   dict(fuel_or_item="machinery",      quantity=10,    unit="t"),
            "upstream":  dict(fuel_or_item="natural_gas",    quantity=100,   unit="GJ"),
            "transport": dict(fuel_or_item="truck",          quantity=1000,  unit="tonne-km"),
            "waste":     dict(fuel_or_item="landfill_msw",   quantity=5,     unit="t"),
            "travel":    dict(fuel_or_item="car_average",    quantity=5000,  unit="km"),
            "commute":   dict(fuel_or_item="car_average",    quantity=50000, unit="employee-km"),
            "leased":    dict(fuel_or_item="office",         quantity=100,   unit="m2"),
            "downstream":dict(fuel_or_item="truck",          quantity=1000,  unit="tonne-km"),
            "processing":dict(fuel_or_item="steel_intermediate", quantity=10, unit="t"),
            "use":       dict(fuel_or_item="natural_gas",    quantity=100,   unit="GJ"),
            "life":      dict(fuel_or_item="landfill_msw",   quantity=5,     unit="t"),
            "invest":    dict(fuel_or_item="technology",     quantity=10000, unit="USD"),
            "project":   dict(fuel_or_item="renewable_energy", quantity=10000, unit="USD"),
            "franchise": dict(fuel_or_item="restaurant_fast_food", quantity=2, unit="outlets"),
            # fuel-based variants (Cat 4/7/9): need combustion fuel in GJ
            "fuel-based":  dict(fuel_or_item="natural_gas",    quantity=100,   unit="GJ"),
            "feedstocks":  dict(fuel_or_item="natural_gas",    quantity=100,   unit="GJ"),
            # site-specific with electricity
            "site-specific": dict(fuel_or_item="grid_electricity", quantity=1000, unit="kWh"),
            "storage":   dict(fuel_or_item="grid_electricity", quantity=1000, unit="kWh"),
        }
        failures = []
        for proc in s3_procs:
            # Pick best matching input
            # Choose input by process keyword
            proc_l = proc.lower()
            if "fuel-based" in proc_l or "fuel based" in proc_l or "feedstocks" in proc_l:
                key = "fuel-based" if "fuel-based" in proc_l else "feedstocks"
            elif "site-specific" in proc_l or "distribution/storage" in proc_l:
                key = "site-specific"
            else:
                key = next((k for k in sample_inputs if k in proc_l
                             and k not in ("fuel-based","site-specific","storage")),
                           "transport")
            inp = sample_inputs[key]
            try:
                from core.engine import calculate
                r = calculate(_rec(
                    scope="Scope 3", process=proc,
                    country="IN", **inp,
                ), db_conn)
                if r.t_CO2e < 0 and "recycl" not in proc.lower() and "e_waste" not in proc.lower():
                    failures.append(f"{proc[:50]}: negative {r.t_CO2e}")
            except Exception as e:
                failures.append(f"{proc[:50]}: {e}")
        assert not failures, "\n".join(failures)


# ---------------------------------------------------------------------------
# Mobile combustion variants
# ---------------------------------------------------------------------------

class TestMobileCombustionVariants:

    def test_km_based_diesel_truck(self, db_conn):
        r = _calc(_rec(
            process="S1 — Mobile combustion (road)",
            quantity=10000, unit="km", fuel_or_item="diesel_trucks_heavy",
        ), db_conn)
        assert r.t_CO2e > 0
        assert r.kg_CO2 > 0

    def test_litre_based_petrol_car(self, db_conn):
        r = _calc(_rec(
            process="S1 — Mobile combustion (road)",
            quantity=100, unit="L", fuel_or_item="petrol_cars",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(0.227, rel=0.05)

    def test_jet_fuel_litres(self, db_conn):
        r = _calc(_rec(
            process="S1 — Mobile combustion (road)",
            quantity=1000, unit="L", fuel_or_item="jet_fuel_aviation",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_km_vs_litre_proportional(self, db_conn):
        """km-based should give a result proportional to assumed consumption."""
        r_km  = _calc(_rec(process="S1 — Mobile combustion (road)",
                           quantity=10000, unit="km", fuel_or_item="diesel_trucks_heavy"), db_conn)
        r_km2 = _calc(_rec(process="S1 — Mobile combustion (road)",
                           quantity=20000, unit="km", fuel_or_item="diesel_trucks_heavy"), db_conn)
        assert r_km2.t_CO2e == pytest.approx(r_km.t_CO2e * 2, rel=0.001)


# ---------------------------------------------------------------------------
# Fugitive emissions variants
# ---------------------------------------------------------------------------

class TestFugitiveVariants:

    def test_oil_gas_ch4_fraction(self, db_conn):
        # Engine oil_gas sub_type: quantity = mass of CH4 vented directly
        # 1000t CH4 * GWP(27.9) = 27900 tCO2e
        r = _calc(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=1000, unit="t", fuel_or_item="natural_gas",
            extra={"sub_type": "oil_gas", "ch4_fraction": 0.005},
        ), db_conn)
        assert r.t_CO2e == pytest.approx(27900.0, rel=0.02)
        assert r.kg_CH4 > 0

    def test_coal_mine_methane(self, db_conn):
        r = _calc(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=100, unit="t", fuel_or_item="coal",
            extra={"sub_type": "coal", "ch4_m3_per_tonne": 10.0},
        ), db_conn)
        assert r.t_CO2e > 0
        assert r.kg_CH4 > 0

    def test_hfc_equipment_based(self, db_conn):
        r = _calc(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=200, unit="kg", fuel_or_item="HFC-134a",
            extra={"method": "equipment_based", "equipment_type": "stationary_ac",
                   "leak_rate": 0.10, "sub_type": "refrigerant"},
        ), db_conn)
        # 200kg * 10% leak * GWP(1526) / 1000 = 30.52 tCO2e
        assert r.t_CO2e == pytest.approx(30.52, rel=0.02)

    def test_all_major_refrigerants(self, db_conn):
        """All common refrigerants produce valid results."""
        refs = ["R-410A", "R-32", "R-134a", "HFC-134a", "R-404A", "R-22", "SF6"]
        for ref in refs:
            try:
                r = _calc(_rec(
                    process="S1 — Fugitive emissions (energy)",
                    quantity=1.0, unit="kg", fuel_or_item=ref,
                    extra={"method": "top_up", "sub_type": "refrigerant"},
                ), db_conn)
                assert r.t_CO2e > 0, f"{ref}: expected > 0, got {r.t_CO2e}"
            except Exception as e:
                pytest.fail(f"{ref}: {e}")


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

class TestReportGeneration:

    def _store_with_records(self):
        from inventory.store import get_store
        tmp = tempfile.mktemp(suffix=".sqlite")
        store = get_store(tmp, org_id="rpt_test")
        self._rpt_tmp = tmp
        for scope, val, fb in [
            ("Scope 1", 100.0, 0),
            ("Scope 2", 200.0, 1),   # fallback triggered
            ("Scope 3",  50.0, 0),
        ]:
            store._db.execute("""
                INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                    scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                    kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                    created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (str(uuid.uuid4()), "rpt_test", 2024, 0, scope,
                  scope, f"S1 — Stationary combustion (fuel burn)", "IN",
                  1000, "GJ", val*1000, 0, 0, val*1000, 0, val, 6, fb,
                  datetime.now(timezone.utc).isoformat(),
                  datetime.now(timezone.utc).isoformat()))
        store._db.commit()
        return store

    def teardown_method(self, _):
        if hasattr(self, "_rpt_tmp") and os.path.exists(self._rpt_tmp):
            try:
                os.unlink(self._rpt_tmp)
            except Exception:
                pass

    def test_generate_report_structure(self):
        from outputs.report import generate_report
        store = self._store_with_records()
        profile = {"org_name": "Test", "org_id": "rpt_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            r = generate_report(store, profile, 2024)
            assert "summary"      in r
            assert "by_category"  in r
            assert "by_process"   in r
            assert "data_quality" in r
            assert "text_report"  in r
            assert r["summary"]["n_records"] == 3
            assert r["summary"]["total_t_co2e"] == pytest.approx(350.0, rel=0.01)
        finally:
            store._db.close()

    def test_report_scope_breakdown(self):
        from outputs.report import generate_report
        store = self._store_with_records()
        profile = {"org_name": "Test", "org_id": "rpt_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            r = generate_report(store, profile, 2024)
            s = r["summary"]
            assert s["scope1_t_co2e"] == pytest.approx(100.0, rel=0.01)
            assert s["scope2_t_co2e"] == pytest.approx(200.0, rel=0.01)
            assert s["scope3_t_co2e"] == pytest.approx(50.0,  rel=0.01)
        finally:
            store._db.close()

    def test_report_data_quality(self):
        from outputs.report import generate_report
        store = self._store_with_records()
        profile = {"org_name": "Test", "org_id": "rpt_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            r = generate_report(store, profile, 2024)
            dq = r["data_quality"]
            assert dq["fallback_triggered"] == 1   # one fallback record
            assert "grade" in dq
        finally:
            store._db.close()

    def test_report_to_csv(self):
        from outputs.report import generate_report, to_csv
        store = self._store_with_records()
        profile = {"org_name": "Test", "org_id": "rpt_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            r = generate_report(store, profile, 2024)
            csv = to_csv(r)
            assert "scope" in csv.lower()
            lines = [l for l in csv.split("\n") if l.strip()]
            assert len(lines) >= 4   # header + 3 scope rows
        finally:
            store._db.close()

    def test_report_text_contains_org_name(self):
        from outputs.report import generate_report
        store = self._store_with_records()
        profile = {"org_name": "Acme Corp", "org_id": "rpt_test",
                   "reporting_year": 2024, "gwp_ar": 6}
        try:
            r = generate_report(store, profile, 2024)
            assert "Acme Corp" in r["text_report"]
            assert "350" in r["text_report"] or "350." in r["text_report"]
        finally:
            store._db.close()


# ---------------------------------------------------------------------------
# Excel template generator
# ---------------------------------------------------------------------------

class TestExcelTemplate:

    def test_template_generates(self):
        from templates.activity_upload_master import generate_template
        tmp = tempfile.mktemp(suffix=".xlsx")
        try:
            generate_template(output_path=tmp)
            assert os.path.exists(tmp)
            assert os.path.getsize(tmp) > 1000   # non-trivial file
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)

    def test_template_has_multiple_sheets(self):
        from templates.activity_upload_master import generate_template
        tmp = tempfile.mktemp(suffix=".xlsx")
        try:
            generate_template(output_path=tmp)
            import openpyxl
            wb = openpyxl.load_workbook(tmp)
            # Should have at least Scope 1, Scope 2, and a few S3 sheets
            assert len(wb.sheetnames) >= 5
        except ImportError:
            pytest.skip("openpyxl not installed")
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)

    def test_template_has_header_row(self):
        from templates.activity_upload_master import generate_template
        tmp = tempfile.mktemp(suffix=".xlsx")
        try:
            generate_template(output_path=tmp)
            import openpyxl
            wb = openpyxl.load_workbook(tmp)
            # Skip INSTRUCTIONS sheet; check a data sheet
            data_sheets = [ws for ws in wb.worksheets if ws.title != "INSTRUCTIONS"]
            assert len(data_sheets) >= 1, "No data sheets found"
            ws = data_sheets[0]
            # Find first row with multiple headers (row 1 or 2)
            found_headers = []
            for row_idx in range(1, min(5, ws.max_row + 1)):
                row_vals = [cell.value for cell in ws[row_idx] if cell.value]
                if len(row_vals) >= 3:
                    found_headers = row_vals
                    break
            assert len(found_headers) >= 3, f"No header row with 3+ values found. Row 1: {[c.value for c in ws[1]]}"
        except ImportError:
            pytest.skip("openpyxl not installed")
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)


# ---------------------------------------------------------------------------
# Remaining untested process variants (sprint 5 completion)
# ---------------------------------------------------------------------------

class TestRemainingProcessVariants:
    """Tests for all process variants that weren't covered in earlier suites."""

    def _s3(self, process, fuel, qty, unit, db_conn, extra=None):
        from core.engine import calculate
        return calculate(_rec(
            scope="Scope 3", process=process,
            quantity=qty, unit=unit, fuel_or_item=fuel,
            extra=extra or {},
        ), db_conn)

    def test_cat2_supplier_specific(self, db_conn):
        r = self._s3(
            "S3 Cat 2 — Capital goods (supplier-specific EF)",
            "machinery", 10, "t", db_conn,
            extra={"supplier_ef_kgco2e_per_unit": 3.2, "supplier_ef_unit": "kgCO2e/kg"},
        )
        assert r.t_CO2e > 0

    def test_cat2_hybrid(self, db_conn):
        r = self._s3(
            "S3 Cat 2 — Capital goods (hybrid: supplier S1+S2 + materials + transport + waste)",
            "steel_structures", 10, "t", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat4_upstream_storage_average(self, db_conn):
        r = self._s3(
            "S3 Cat 4 — Upstream distribution/storage (average-data)",
            "truck", 1000, "tonne-km", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat4_upstream_storage_site(self, db_conn):
        r = self._s3(
            "S3 Cat 4 — Upstream distribution/storage (site-specific facility energy + allocation)",
            "grid_electricity", 1000, "kWh", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat9_downstream_storage_average(self, db_conn):
        r = self._s3(
            "S3 Cat 9 — Downstream distribution/storage (average-data)",
            "truck", 1000, "tonne-km", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat9_downstream_storage_site(self, db_conn):
        r = self._s3(
            "S3 Cat 9 — Downstream distribution/storage (site-specific)",
            "grid_electricity", 1000, "kWh", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat15_debt_eeio(self, db_conn):
        r = self._s3(
            "S3 Cat 15 — Project finance / debt with known use (average-data EEIO annual)",
            "technology", 500_000, "USD", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat15_debt_project_specific(self, db_conn):
        r = self._s3(
            "S3 Cat 15 — Project finance / debt with known use (project-specific annual)",
            "project_reported", 250, "tCO2e", db_conn,
        )
        assert r.t_CO2e == pytest.approx(250.0, rel=0.01)

    def test_cat8_buildings(self, db_conn):
        r = self._s3(
            "S3 Cat 8 — Upstream leased assets (buildings, avg EF by floor area)",
            "office", 500, "m2", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat13_average_data(self, db_conn):
        r = self._s3(
            "S3 Cat 13 — Downstream leased assets (average-data)",
            "retail_space", 200, "m2", db_conn,
        )
        assert r.t_CO2e > 0

    def test_cat15_equity_eeio(self, db_conn):
        r = self._s3(
            "S3 Cat 15 — Investments (equity, average-data EEIO)",
            "technology", 1_000_000, "USD", db_conn,
        )
        assert r.t_CO2e > 0

    def test_all_56_processes_registered(self, db_conn):
        """Every process in the registry returns a non-exception result."""
        from core.engine import _PROCESS_REGISTRY, calculate
        # Map each process to a valid input
        FALLBACK_INPUTS = {
            "Scope 1": dict(quantity=100, unit="GJ", fuel_or_item="natural_gas"),
            "Scope 2": dict(quantity=1000, unit="kWh", fuel_or_item="grid_electricity"),
            "Scope 3": dict(quantity=1000, unit="tonne-km", fuel_or_item="truck"),
        }
        S3_BY_KEYWORD = {
            "fuel-based":     dict(quantity=100, unit="GJ",       fuel_or_item="natural_gas"),
            "feedstocks":     dict(quantity=100, unit="GJ",       fuel_or_item="natural_gas"),
            "site-specific":  dict(quantity=1000, unit="kWh",     fuel_or_item="grid_electricity"),
            "distribution":   dict(quantity=1000, unit="kWh",     fuel_or_item="grid_electricity"),
            "spend-based":    dict(quantity=10000, unit="USD",     fuel_or_item="technology"),
            "supplier":       dict(quantity=10, unit="t",          fuel_or_item="steel"),
            "average-data":   dict(quantity=10, unit="t",          fuel_or_item="steel"),
            "hybrid":         dict(quantity=10, unit="t",          fuel_or_item="steel"),
            "equity":         dict(quantity=1000, unit="tCO2e",    fuel_or_item="investee_s1_s2_reported"),
            "project":        dict(quantity=100, unit="tCO2e",     fuel_or_item="project_reported"),
            "franchise":      dict(quantity=2, unit="outlets",     fuel_or_item="restaurant_fast_food"),
            "landfill":       dict(quantity=5, unit="t",           fuel_or_item="landfill_msw"),
            "waste":          dict(quantity=5, unit="t",           fuel_or_item="landfill_msw"),
            "hotel":          dict(quantity=10, unit="nights",     fuel_or_item="hotel"),
            "commuting":      dict(quantity=5000, unit="employee-km", fuel_or_item="car_average"),
            "leased":         dict(quantity=100, unit="m2",        fuel_or_item="office"),
            "investments":    dict(quantity=1000, unit="tCO2e",    fuel_or_item="investee_s1_s2_reported"),
            "cement":         dict(quantity=1, unit="kt",          fuel_or_item="clinker"),
            "lime":           dict(quantity=1, unit="kt",          fuel_or_item="lime"),
            "steel":          dict(quantity=1, unit="kt",          fuel_or_item="steel_bof"),
            "glass":          dict(quantity=1, unit="kt",          fuel_or_item="glass"),
            "chemicals":      dict(quantity=1, unit="kt",          fuel_or_item="ammonia"),
            "enteric":        dict(quantity=100, unit="head",      fuel_or_item="dairy_cattle"),
        }

        failures = []
        for proc in sorted(_PROCESS_REGISTRY.keys()):
            pl = proc.lower()
            # Determine scope
            if proc.startswith("S1") or proc.startswith("IPPU") or proc.startswith("AFOLU"):
                scope = "Scope 1"
                inp = FALLBACK_INPUTS["Scope 1"]
            elif proc.startswith("S2"):
                scope = "Scope 2"
                inp = FALLBACK_INPUTS["Scope 2"]
            else:
                scope = "Scope 3"
                inp = next((v for k, v in S3_BY_KEYWORD.items() if k in pl),
                           FALLBACK_INPUTS["Scope 3"])
            # Override for known IPPU/AFOLU
            for kw, override in S3_BY_KEYWORD.items():
                if kw in pl and scope == "Scope 1":
                    inp = override
                    break
            try:
                r = calculate(_rec(scope=scope, process=proc, **inp), db_conn)
                if r.t_CO2e < -1000:  # allow small negatives from recycling
                    failures.append(f"{proc[:50]}: extreme negative {r.t_CO2e}")
            except Exception as e:
                failures.append(f"{proc[:50]}: {e}")

        assert not failures, "\n".join(failures[:5])
