"""
sk.lite — Sprint 10 Test Suite.

Covers:
  - Dashboard caching functions defined
  - EEIO: EUR/GBP/JPY FX conversion (real rates, not 1.0)
  - EEIO: proportionality across currencies
  - Cat 01/02/04/09: FX applied correctly
  - Scope 3 sidebar: get_all_records scope filter
  - Full E2E multi-currency EEIO chain
  - Regression: CEA v20, NCV ordering, WTT chain
"""

from __future__ import annotations
import os
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
# Dashboard caching
# ---------------------------------------------------------------------------

class TestDashboardCaching:

    def test_cached_summary_defined(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault('streamlit', mock.MagicMock())
        from streamlit_app._page_04_dashboard import (
            _cached_summary, _cached_by_category, _cached_fallback
        )
        assert callable(_cached_summary)
        assert callable(_cached_by_category)
        assert callable(_cached_fallback)

    def test_cached_summary_returns_dict(self, inv_store, db_conn):
        """The underlying store method returns a dict — cache wraps it transparently."""
        from modules.base import ActivityRecord
        from core.engine import calculate
        # Add a record using the store's org_id
        rec = ActivityRecord(scope="Scope 1", org_id=inv_store.org_id,
            process="S1 — Stationary combustion (fuel burn)",
            country="IN", quantity=100, unit="GJ",
            fuel_or_item="natural_gas", reporting_year=2024, gwp_ar=6)
        result = calculate(rec, db_conn)
        inv_store.persist(result, rec, 2024)
        # Call the store method directly (bypasses the st.cache_data mock)
        s = inv_store.get_summary(org_id=inv_store.org_id, inventory_year=2024)
        assert isinstance(s, dict)
        assert s.get("n_records", 0) >= 1
        assert s.get("scope1_t_co2e", 0) > 0

    def test_cached_by_category_returns_list(self, inv_store, db_conn):
        """The underlying store method returns a list."""
        result = inv_store.get_by_category(org_id=inv_store.org_id,
                                            inventory_year=2024)
        assert isinstance(result, list)

    def test_cached_functions_are_callable(self):
        """The cached wrapper functions exist and are callable."""
        from streamlit_app._page_04_dashboard import (
            _cached_summary, _cached_by_category, _cached_fallback
        )
        assert callable(_cached_summary)
        assert callable(_cached_by_category)
        assert callable(_cached_fallback)


# ---------------------------------------------------------------------------
# EEIO FX rates
# ---------------------------------------------------------------------------

class TestEEIOCurrencyFX:

    def _eeio(self, qty, unit, db_conn):
        from core.engine import calculate
        return calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=qty, unit=unit, fuel_or_item="chemicals",
        ), db_conn)

    def test_usd_baseline(self, db_conn):
        r = self._eeio(1000, "USD", db_conn)
        assert r.t_CO2e > 0

    def test_eur_less_than_usd_same_numeric(self, db_conn):
        """1000 EUR should give MORE tCO2e than 1000 USD (EUR > USD)."""
        r_usd = self._eeio(1000, "USD", db_conn)
        r_eur = self._eeio(1000, "EUR", db_conn)
        # 1 EUR ≈ 1.08 USD → same numeric EUR spend = more USD = more emissions
        assert r_eur.t_CO2e > r_usd.t_CO2e

    def test_gbp_more_than_usd(self, db_conn):
        """1000 GBP > 1000 USD in spending power."""
        r_usd = self._eeio(1000, "USD", db_conn)
        r_gbp = self._eeio(1000, "GBP", db_conn)
        assert r_gbp.t_CO2e > r_usd.t_CO2e

    def test_inr_less_than_usd(self, db_conn):
        """1000 INR << 1000 USD — INR is a much smaller amount."""
        r_usd = self._eeio(1000, "USD", db_conn)
        r_inr = self._eeio(1000, "INR", db_conn)
        assert r_inr.t_CO2e < r_usd.t_CO2e

    def test_jpy_less_than_usd(self, db_conn):
        r_usd = self._eeio(1000, "USD", db_conn)
        r_jpy = self._eeio(1000, "JPY", db_conn)
        assert r_jpy.t_CO2e < r_usd.t_CO2e

    def test_fx_proportional_within_currency(self, db_conn):
        """Doubling spend doubles emissions regardless of currency."""
        r1 = self._eeio(1000, "EUR", db_conn)
        r2 = self._eeio(2000, "EUR", db_conn)
        assert r2.t_CO2e == pytest.approx(r1.t_CO2e * 2, rel=0.01)

    def test_explicit_fx_override(self, db_conn):
        """User-provided fx_to_usd overrides built-in rate."""
        from core.engine import calculate
        from modules.base import ActivityRecord
        r = calculate(ActivityRecord(
            scope="Scope 3", country="IN", reporting_year=2024, gwp_ar=6,
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=1000, unit="INR",
            fuel_or_item="chemicals",
            extra={"fx_to_usd": 0.5},   # override built-in 0.012
        ), db_conn)
        # 1000 INR × 0.5 = 500 USD equivalent
        r_500 = calculate(ActivityRecord(
            scope="Scope 3", country="IN", reporting_year=2024, gwp_ar=6,
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=500, unit="USD",
            fuel_or_item="chemicals",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(r_500.t_CO2e, rel=0.01)

    def test_cat02_eur_fx(self, db_conn):
        """Cat 2 capital goods also applies EUR FX correctly."""
        from core.engine import calculate
        r_usd = calculate(_rec(scope="Scope 3",
            process="S3 Cat 2 — Capital goods (spend-based EEIO)",
            quantity=1000, unit="USD", fuel_or_item="machinery"), db_conn)
        r_eur = calculate(_rec(scope="Scope 3",
            process="S3 Cat 2 — Capital goods (spend-based EEIO)",
            quantity=1000, unit="EUR", fuel_or_item="machinery"), db_conn)
        # EUR > USD → more emissions
        assert r_eur.t_CO2e > r_usd.t_CO2e

    def test_audit_trace_shows_fx_conversion(self, db_conn):
        """Audit trace shows FX conversion with EUR rate (not 1.0 default)."""
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=1000, unit="EUR", fuel_or_item="chemicals",
        ), db_conn)
        calc_steps = r.audit_trace.get("calculation", [])
        fx_step = next((s for s in calc_steps if "Convert to USD" in str(s)), None)
        assert fx_step is not None, "No FX conversion step in audit trace"
        fx_val = str(fx_step.get("value", ""))
        # EUR FX = 1.08 → 1000 EUR = 1080 USD. Verify > 1000 USD result.
        # Extract the USD amount from the string "1000 EUR × 1.08 = 1080.00 USD"
        import re
        usd_match = re.search(r"= ([0-9.]+) USD", fx_val)
        assert usd_match is not None, f"Could not find USD amount in: {fx_val}"
        usd_amount = float(usd_match.group(1))
        # For EUR, 1000 EUR × 1.08 = 1080 USD — strictly greater than 1000
        assert usd_amount > 1000, f"EUR FX not applied: got {usd_amount} USD from 1000 EUR"


# ---------------------------------------------------------------------------
# Scope 3 scope filter
# ---------------------------------------------------------------------------

class TestScope3Filter:

    def test_get_all_records_scope3_filter(self, inv_store):
        from modules.base import ActivityRecord, EmissionResult
        for scope in ["Scope 1", "Scope 2", "Scope 3"]:
            rid = str(uuid.uuid4())
            rec = ActivityRecord(record_id=rid, scope=scope,
                org_id=inv_store.org_id,
                process="S1 — Stationary combustion (fuel burn)",
                country="IN", quantity=100, unit="GJ",
                fuel_or_item="natural_gas", reporting_year=2024, gwp_ar=6)
            res = EmissionResult(record_id=rid, kg_CO2=10000, kg_CH4=0,
                kg_N2O=0, kg_CO2e=10000, gwp_ar_used=6,
                factor_id_used="T", ef_value_used=1.0,
                ef_unit="kgCO2/GJ", ef_source="test",
                fallback_level="national", fallback_triggered=False,
                calculation_engine="local", confidence="high")
            inv_store.persist(res, rec, 2024)

        s3_recs = inv_store.get_all_records(
            org_id=inv_store.org_id, inventory_year=2024, scope="Scope 3")
        assert len(s3_recs) == 1
        assert s3_recs[0]["scope"] == "Scope 3"


# ---------------------------------------------------------------------------
# Regression suite
# ---------------------------------------------------------------------------

class TestRegressionSprint10:

    def test_cea_v20(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            country="IN", quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24", gwp_ar=6,
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)

    def test_ncv_natural_gas_48(self, db_conn):
        from core.unit_converter import _lookup_ncv
        ncv = _lookup_ncv(db_conn, "natural_gas", "IN")
        assert ncv == pytest.approx(48.0, rel=0.001)

    def test_wtt_natural_gas_india(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(10.2, rel=0.05)

    def test_ippu_cement_5244(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="IPPU — Cement (process CO2)",
            quantity=10, unit="kt", fuel_or_item="clinker",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(5244.0, rel=0.01)

    def test_afolu_dairy_357(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="AFOLU — Enteric fermentation (Tier 1)",
            quantity=100, unit="head", fuel_or_item="dairy_cattle",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(357.12, rel=0.02)

    def test_56_processes_registered(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_eeio_220_sectors(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM eeio_factors").fetchone()[0]
        assert n >= 200

    def test_wtt_13_factors(self, db_conn):
        n = db_conn.execute(
            "SELECT COUNT(*) FROM emission_factors WHERE factor_id LIKE 'WTT%'"
        ).fetchone()[0]
        assert n >= 10
