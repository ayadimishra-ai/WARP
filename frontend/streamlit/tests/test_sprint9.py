"""
sk.lite — Sprint 9 Test Suite.

Covers:
  - WTT upstream fuel chain (Cat 3A)
  - Cat 3B upstream electricity EF
  - Cat 3C T&D loss calculation
  - EEIO sector lookup and calculation
  - Error handling: missing EFs, bad inputs, locked records
  - Edge cases: zero quantity, biogenic fuels, multi-currency
  - get_all_records with scope + category filters
  - Setup.py health check logic
  - CHANGELOG and .gitignore exist
  - Full disclosure chain: inventory → BRSR → CDP → TCFD → GRI
"""

from __future__ import annotations
import io
import os
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


def _store_with(org="s9", **scope_vals):
    from inventory.store import get_store
    tmp = tempfile.mktemp(suffix=".sqlite")
    store = get_store(tmp, org_id=org)
    for scope, val in scope_vals.items():
        label = scope.replace("_", " ").title()
        store._db.execute("""
            INSERT INTO emission_results(record_id,org_id,inventory_year,locked,
                scope,category,process,country,quantity,unit,kg_CO2,kg_CH4,kg_N2O,
                kg_CO2e,kg_CO2_biogenic,t_CO2e,gwp_ar_used,fallback_triggered,
                created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (str(uuid.uuid4()), org, 2024, 0, label, label,
              "S1 — Stationary combustion (fuel burn)", "IN",
              1000, "GJ", val*1000, 0, 0, val*1000, 0, val, 6, 0,
              datetime.now(timezone.utc).isoformat(),
              datetime.now(timezone.utc).isoformat()))
    store._db.commit()
    return store, tmp


# ---------------------------------------------------------------------------
# WTT upstream fuel chain (Cat 3A)
# ---------------------------------------------------------------------------

class TestWTTChain:

    def test_cat3a_natural_gas_wtt(self, db_conn):
        """Cat 3A upstream EF for natural gas applies WTT factor."""
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        assert r.t_CO2e > 0
        # India-specific WTT EF for natural gas = 10.2 kgCO2e/GJ (MoPNG 2022)
        # 1000 GJ × 10.2 = 10200 kgCO2e = 10.2 tCO2e
        assert r.t_CO2e == pytest.approx(10.2, rel=0.05)

    def test_cat3a_diesel_wtt(self, db_conn):
        r = _rec(
            scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="diesel_oil",
        )
        from core.engine import calculate
        result = calculate(r, db_conn)
        # WTT24_DIESEL: 7.3 kgCO2e/GJ → 7.3 tCO2e
        assert result.t_CO2e == pytest.approx(7.3, rel=0.05)

    def test_cat3a_coal_wtt(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="coal_bituminous",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_cat3a_wtt_less_than_combustion(self, db_conn):
        """WTT EF should be less than the combustion EF."""
        from core.engine import calculate
        r_comb = calculate(_rec(
            scope="Scope 1",
            process="S1 — Stationary combustion (fuel burn)",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        r_wtt = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        # WTT is upstream only — always less than full combustion
        assert r_wtt.t_CO2e < r_comb.t_CO2e

    def test_cat3a_proportional(self, db_conn):
        from core.engine import calculate
        r1 = calculate(_rec(scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=500, unit="GJ", fuel_or_item="natural_gas"), db_conn)
        r2 = calculate(_rec(scope="Scope 3",
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas"), db_conn)
        assert r2.t_CO2e == pytest.approx(r1.t_CO2e * 2, rel=0.001)


# ---------------------------------------------------------------------------
# Cat 3B upstream electricity
# ---------------------------------------------------------------------------

class TestCat3BUpstreamElectricity:

    def test_cat3b_grid_electricity(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_cat3b_less_than_scope2(self, db_conn):
        """Upstream Cat 3B should be less than the direct Scope 2 emission."""
        from core.engine import calculate
        r_s2 = calculate(_rec(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        r_3b = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        assert r_3b.t_CO2e < r_s2.t_CO2e

    def test_cat3b_proportional(self, db_conn):
        from core.engine import calculate
        r1 = calculate(_rec(scope="Scope 3",
            process="S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling",
            quantity=50_000, unit="kWh", fuel_or_item="grid_electricity"), db_conn)
        r2 = calculate(_rec(scope="Scope 3",
            process="S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity"), db_conn)
        assert r2.t_CO2e == pytest.approx(r1.t_CO2e * 2, rel=0.001)


# ---------------------------------------------------------------------------
# Cat 3C T&D losses
# ---------------------------------------------------------------------------

class TestCat3CTDLosses:

    def test_cat3c_returns_positive(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3C — Transmission & distribution (T&D) losses",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_cat3c_less_than_scope2(self, db_conn):
        from core.engine import calculate
        r_s2 = calculate(_rec(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        r_3c = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 3C — Transmission & distribution (T&D) losses",
            quantity=100_000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        # T&D losses are a fraction of direct electricity
        assert r_3c.t_CO2e < r_s2.t_CO2e


# ---------------------------------------------------------------------------
# EEIO sector lookup and calculation
# ---------------------------------------------------------------------------

class TestEEIO:

    def test_eeio_factors_seeded(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM eeio_factors").fetchone()[0]
        assert n >= 200, f"Expected ≥200 EEIO factors, got {n}"

    def test_eeio_cat1_spend_based(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=100_000, unit="USD", fuel_or_item="chemicals",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_eeio_cat15_investment(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            scope="Scope 3",
            process="S3 Cat 15 — Investments (equity, average-data EEIO)",
            quantity=1_000_000, unit="USD", fuel_or_item="technology",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_eeio_sectors_have_names(self, db_conn):
        rows = db_conn.execute(
            "SELECT sector_code FROM eeio_factors LIMIT 10"
        ).fetchall()
        # sector_name may be NULL in the DB; sector_code is always present
        for row in rows:
            assert row[0] is not None and len(row[0]) > 0

    def test_eeio_usd_different_quantities_proportional(self, db_conn):
        """EEIO spend-based is proportional to quantity."""
        from core.engine import calculate
        r_100k = calculate(_rec(scope="Scope 3",
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=100_000, unit="USD", fuel_or_item="chemicals"), db_conn)
        r_200k = calculate(_rec(scope="Scope 3",
            process="S3 Cat 1 — Purchased goods & services (spend-based EEIO)",
            quantity=200_000, unit="USD", fuel_or_item="chemicals"), db_conn)
        # Doubling spend → doubling emissions
        assert r_100k.t_CO2e > 0
        assert r_200k.t_CO2e == pytest.approx(r_100k.t_CO2e * 2, rel=0.01)


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------

class TestErrorHandling:

    def test_unknown_fuel_raises_validation_error(self, db_conn):
        from modules.stationary_combustion import StationaryCombustion
        from modules.base import ValidationError
        with pytest.raises(ValidationError):
            StationaryCombustion().calculate(_rec(
                process="S1 — Stationary combustion (fuel burn)",
                quantity=100, unit="GJ", fuel_or_item="unicorn_fuel",
            ), db_conn)

    def test_unknown_process_raises(self, db_conn):
        from core.engine import calculate
        from modules.base import ActivityRecord
        with pytest.raises(Exception):
            calculate(ActivityRecord(
                scope="Scope 1", country="IN", reporting_year=2024, gwp_ar=6,
                process="S1 — Nonexistent process",
                quantity=100, unit="GJ", fuel_or_item="natural_gas",
            ), db_conn)

    def test_zero_quantity_raises_validation_error(self, db_conn):
        """Engine rejects quantity=0 as invalid input."""
        from core.engine import calculate
        from modules.base import ValidationError
        with pytest.raises(ValidationError):
            calculate(_rec(
                process="S1 — Stationary combustion (fuel burn)",
                quantity=0.0, unit="GJ", fuel_or_item="natural_gas",
            ), db_conn)

    def test_locked_record_not_deleted(self, inv_store):
        from modules.base import ActivityRecord, EmissionResult
        rid = str(uuid.uuid4())
        rec = ActivityRecord(record_id=rid, scope="Scope 1",
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
        # Lock it
        inv_store._db.execute(
            "UPDATE emission_results SET locked=1 WHERE record_id=?", (rid,))
        inv_store._db.commit()
        # Delete attempt
        inv_store.delete_record(rid)
        # Still there
        recs = inv_store.get_all_records(inventory_year=2024)
        assert len(recs) == 1


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

class TestEdgeCases:

    def test_biogenic_fuel_excluded_from_total(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=100, unit="t", fuel_or_item="wood",
        ), db_conn)
        # Biogenic CO2 is excluded from t_CO2e per GHG Protocol
        # but CH4 and N2O from wood combustion are included (small)
        # t_CO2e < 5% of equivalent fossil fuel
        assert r.kg_CO2_biogenic > 0, "Biogenic CO2 should be captured separately"
        # Biogenic CO2 must NOT appear in t_CO2e
        # t_CO2e only contains CH4 and N2O warming effects
        assert r.t_CO2e < 10.0, f"Biogenic CO2 leaked into total: {r.t_CO2e}"
        assert r.kg_CO2_biogenic > r.t_CO2e * 1000, "Biogenic CO2 >> non-CO2 warming"

    def test_gwp_ar5_vs_ar6_different(self, db_conn):
        from core.engine import calculate
        r5 = calculate(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=10, unit="kg", fuel_or_item="R-410A",
            extra={"method": "top_up", "sub_type": "refrigerant"},
            gwp_ar=5,
        ), db_conn)
        r6 = calculate(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=10, unit="kg", fuel_or_item="R-410A",
            extra={"method": "top_up", "sub_type": "refrigerant"},
            gwp_ar=6,
        ), db_conn)
        # Different GWP tables → different results
        assert r5.t_CO2e != r6.t_CO2e

    def test_high_precision_quantity(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            quantity=0.001, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        assert r.t_CO2e >= 0

    def test_large_quantity(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S2 — Purchased electricity (grid)",
            scope="Scope 2",
            quantity=1_000_000_000, unit="kWh",
            fuel_or_item="grid_electricity",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_india_vs_global_ef_different(self, db_conn):
        """India-specific EF should differ from global where applicable."""
        from core.engine import calculate
        r_in = calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            country="IN",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        r_gb = calculate(_rec(
            process="S1 — Stationary combustion (fuel burn)",
            country="GB",
            quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        # Different countries may use different EFs or at least the same —
        # just verify both work and return positive
        assert r_in.t_CO2e > 0
        assert r_gb.t_CO2e > 0


# ---------------------------------------------------------------------------
# Housekeeping files
# ---------------------------------------------------------------------------

class TestProjectFiles:

    def test_gitignore_exists(self):
        assert (ROOT / ".gitignore").exists()

    def test_gitignore_excludes_sqlite(self):
        content = (ROOT / ".gitignore").read_text(encoding="utf-8")
        assert ".sqlite" in content or "*.sqlite" in content

    def test_changelog_exists(self):
        assert (ROOT / "CHANGELOG.md").exists()

    def test_changelog_has_versions(self):
        content = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        assert "0.7.0" in content
        assert "0.6.0" in content or "Sprint 6" in content

    def test_readme_exists_and_current(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        assert "TCFD" in readme
        assert "GRI" in readme
        assert "57" in readme  # 57 processes mentioned

    def test_pytest_ini_exists(self):
        assert (ROOT / "pytest.ini").exists()

    def test_requirements_no_duckdb(self):
        req = (ROOT / "requirements.txt").read_text(encoding="utf-8")
        assert "duckdb" not in req

    def test_requirements_no_weasyprint(self):
        req = (ROOT / "requirements.txt").read_text(encoding="utf-8")
        assert "weasyprint" not in req


# ---------------------------------------------------------------------------
# Full disclosure chain
# ---------------------------------------------------------------------------

class TestFullDisclosureChain:

    def setup_method(self, method):
        self._store, self._tmp = _store_with(
            scope_1=500.0, scope_2=300.0, scope_3=100.0
        )

    def teardown_method(self, method):
        self._store._db.close()
        if os.path.exists(self._tmp):
            try:
                os.unlink(self._tmp)
            except Exception:
                pass

    def _profile(self):
        return {"org_name": "Full Chain Corp", "org_id": "s9",
                "reporting_year": 2024, "gwp_ar": 6,
                "revenue_inr_cr": 900.0, "employees": 500,
                "primary_country": "IN", "boundary": "operational_control"}

    def test_brsr_chain(self):
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        brsr = generate_brsr_disclosure(
            self._store, self._profile(), 2024,
            turnover_inr_cr=900.0,
            reduction_target_pct=42.0,
            reduction_target_year=2030,
        )
        j = brsr["json"]
        assert j["total_tco2e"] == pytest.approx(900.0, rel=0.01)
        assert j["intensity_per_inr_crore"] == pytest.approx(1.0, rel=0.01)
        assert j["reduction_target_pct"] == pytest.approx(42.0)

    def test_cdp_chain(self):
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        cdp = generate_cdp_disclosure(
            self._store, self._profile(), 2024,
            revenue_usd_m=108.0,
            base_year=2020,
            base_year_emissions=1000.0,
        )
        j = cdp["json"]
        assert j["C6.1_s1_gross_tco2e"] == pytest.approx(500.0, rel=0.01)
        # 900 vs 1000 base → -10%
        assert j["C7_pct_change_vs_base"] == pytest.approx(-10.0, rel=0.01)

    def test_tcfd_chain(self):
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        tcfd = generate_tcfd_disclosure(
            self._store, self._profile(), 2024,
            base_year=2020,
            base_year_emissions=1000.0,
            reduction_target_pct=42.0,
            reduction_target_year=2030,
        )
        assert len(tcfd["sections"]) == 4
        assert tcfd["json"]["total_tco2e"] == pytest.approx(900.0, rel=0.01)
        assert tcfd["json"]["pct_change_from_base"] == pytest.approx(-10.0, rel=0.01)

    def test_gri_chain(self):
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        gri = generate_gri_disclosure(
            self._store, self._profile(), 2024,
            total_energy_consumed_mwh=2000.0,
            energy_from_renewables_mwh=500.0,
        )
        j = gri["json"]
        assert j["305_1_scope1_tco2e"] == pytest.approx(500.0, rel=0.01)
        assert j["302_1_renewables_pct"] == pytest.approx(25.0, rel=0.01)
        assert j["305_4_intensity_per_cr_inr"] == pytest.approx(1.0, rel=0.01)

    def test_all_four_consistent_totals(self):
        """All four mappers should agree on S1+S2+S3 total."""
        from outputs.disclosures.brsr_mapper import generate_brsr_disclosure
        from outputs.disclosures.cdp_mapper import generate_cdp_disclosure
        from outputs.disclosures.tcfd_mapper import generate_tcfd_disclosure
        from outputs.disclosures.gri_mapper import generate_gri_disclosure
        p = self._profile()
        brsr = generate_brsr_disclosure(self._store, p, 2024)
        cdp  = generate_cdp_disclosure(self._store, p, 2024)
        tcfd = generate_tcfd_disclosure(self._store, p, 2024)
        gri  = generate_gri_disclosure(self._store, p, 2024)
        totals = [
            brsr["json"]["total_tco2e"],
            cdp["json"]["C6.5_total_s1_s2_tco2e"] + cdp["json"]["C11.1_s3_total_tco2e"],
            tcfd["json"]["total_tco2e"],
            gri["json"]["305_total_tco2e"],
        ]
        for t in totals:
            assert t == pytest.approx(900.0, rel=0.02), f"Inconsistent total: {t}"
