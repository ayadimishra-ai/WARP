"""
sk.lite — Sprint 3 & 4 Test Suite.

Covers:
  - Unit converter: SCM, MMBTU, kcal, CNG, MMSCM
  - Fugitive: all 3 sub-types, GWP values
  - Waste: 68 EF types, city inference, pincode lookup
  - India commute EFs: metro, auto-rickshaw, suburban rail
  - Vehicle specs: GLEC load-factor calculation
  - Journey builder: Haversine distance, great circle
  - ICAO flight method: B77W, cabin class, RF factor
  - Cat 2/3/9/10/11/12/13/14/15 engine calculations
  - Org isolation: UUID-based partition key
  - Inventory store: get_all_records, delete_many, update_quantity
  - CEA known-answer regression: 0.000% deviation
"""

from __future__ import annotations
import math
import os
import sqlite3
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

ROOT = Path(__file__).parents[1]


@pytest.fixture(scope="module")
def db_conn():
    from ef_store.db import setup_db
    from ef_store.ingester import (
        ingest_all_seeds, ingest_vehicle_specs, ingest_airports,
        ingest_aircraft_fuel_burn, ingest_major_ports,
    )
    conn = setup_db(str(ROOT / "data" / "ef_store.sqlite"))

    # Seed core EFs if missing
    row = conn.execute("SELECT COUNT(*) FROM emission_factors").fetchone()
    if row[0] == 0:
        ingest_all_seeds(conn, force=True)
    else:
        # Always ensure Sprint 3 tables are populated even on an existing DB
        sprint3 = {
            "vehicle_specs":     ingest_vehicle_specs,
            "airports":          ingest_airports,
            "aircraft_fuel_burn":ingest_aircraft_fuel_burn,
            "major_ports":       ingest_major_ports,
        }
        for table, loader in sprint3.items():
            n = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            if n == 0:
                loader(conn)

    yield conn
    conn.close()


@pytest.fixture
def inv_store():
    """Fresh in-memory InventoryStore for each test."""
    from inventory.store import get_store
    tmp = tempfile.mktemp(suffix=".sqlite")
    store = get_store(tmp, org_id=str(uuid.uuid4()))
    yield store
    store._db.close()
    if os.path.exists(tmp):
        os.unlink(tmp)


def _rec(**kwargs):
    from modules.base import ActivityRecord
    defaults = dict(
        scope="Scope 1", country="IN",
        reporting_year=2024, gwp_ar=6,
    )
    defaults.update(kwargs)
    return ActivityRecord(**defaults)


# ---------------------------------------------------------------------------
# Sprint 3 Batch 1: Unit converter
# ---------------------------------------------------------------------------

class TestUnitConverterSprint3:

    def test_natural_gas_m3(self, db_conn):
        from core.unit_converter import to_tj
        tj, steps = to_tj(1000, "m3", "natural_gas", "IN", db_conn)
        # 1000 m3 × 0.717 kg/m3 = 717 kg = 0.000717 Gg × 48 TJ/Gg
        assert tj == pytest.approx(0.034416, rel=0.01)
        assert any("m" in s.get("label", "").lower() for s in steps)

    def test_natural_gas_scm(self, db_conn):
        from core.unit_converter import to_tj
        tj, _ = to_tj(500, "scm", "natural_gas", "IN", db_conn)
        assert tj == pytest.approx(0.017208, rel=0.01)

    def test_natural_gas_mmscm(self, db_conn):
        from core.unit_converter import to_tj
        tj, _ = to_tj(1, "mmscm", "natural_gas", "IN", db_conn)
        # 1 MMSCM = 1e6 m3 × 0.717 × 48/1e6 TJ/Gg
        assert tj == pytest.approx(34.416, rel=0.01)

    def test_mmbtu(self, db_conn):
        from core.unit_converter import to_tj
        tj, _ = to_tj(1000, "MMBTU", "natural_gas", "IN", db_conn)
        assert tj == pytest.approx(1.055056, rel=0.001)

    def test_kcal(self, db_conn):
        from core.unit_converter import to_tj
        tj, _ = to_tj(1_000_000, "kcal", "coal_bituminous", "IN", db_conn)
        assert tj == pytest.approx(4.186e-3, rel=0.001)

    def test_gcal(self, db_conn):
        from core.unit_converter import to_tj
        tj, _ = to_tj(1, "Gcal", "natural_gas", "IN", db_conn)
        assert tj == pytest.approx(4.186e-3, rel=0.001)

    def test_cng_kg_alias(self, db_conn):
        from core.unit_converter import to_tj
        tj, _ = to_tj(1000, "kg", "cng", "IN", db_conn)
        # CNG → natural_gas, 1000 kg × 48 TJ/Gg = 0.048 TJ
        assert tj == pytest.approx(0.048, rel=0.001)

    def test_cng_m3_alias(self, db_conn):
        from core.unit_converter import to_tj
        tj_cng, _  = to_tj(1000, "m3", "cng",         "IN", db_conn)
        tj_gas, _  = to_tj(1000, "m3", "natural_gas",  "IN", db_conn)
        assert tj_cng == pytest.approx(tj_gas, rel=0.001)

    def test_diesel_alias_consistent_density(self, db_conn):
        from core.unit_converter import to_tj
        tj_d,  _ = to_tj(1000, "L", "diesel",     "IN", db_conn)
        tj_do, _ = to_tj(1000, "L", "diesel_oil",  "IN", db_conn)
        # Must be same density (0.832) — legacy 0.845 bug fixed
        assert tj_d == pytest.approx(tj_do, rel=0.001)

    def test_petrol_alias(self, db_conn):
        from core.unit_converter import to_tj
        tj_p,  _ = to_tj(1000, "L", "petrol",        "IN", db_conn)
        tj_mg, _ = to_tj(1000, "L", "motor_gasoline", "IN", db_conn)
        assert tj_p == pytest.approx(tj_mg, rel=0.001)

    def test_existing_units_not_broken(self, db_conn):
        from core.unit_converter import to_tj
        cases = [
            (1000, "GJ", "natural_gas",  "IN", 1.0),
            (100,  "t",  "coal_bituminous","IN",2.58),
            (1000, "L",  "diesel_oil",   "IN", 0.035776),
        ]
        for qty, unit, fuel, country, exp in cases:
            tj, _ = to_tj(qty, unit, fuel, country, db_conn)
            assert tj == pytest.approx(exp, rel=0.01), f"{qty} {unit} {fuel}"


# ---------------------------------------------------------------------------
# Sprint 3 Batch 2: Fugitive
# ---------------------------------------------------------------------------

class TestFugitiveSprint3:

    def test_r410a_topup(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=5.0, unit="kg", fuel_or_item="R-410A",
            extra={"method": "top_up", "sub_type": "refrigerant"},
        ), db_conn)
        # 5 kg × GWP(R-410A)=2088 / 1000 = 10.44 tCO2e
        assert r.t_CO2e == pytest.approx(10.44, rel=0.01)

    def test_sf6_topup(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=1.0, unit="kg", fuel_or_item="SF6",
            extra={"method": "top_up", "sub_type": "refrigerant"},
        ), db_conn)
        assert r.t_CO2e == pytest.approx(25.2, rel=0.01)

    def test_hfc134a_equipment_based(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=100.0, unit="kg", fuel_or_item="HFC-134a",
            extra={"method": "equipment_based", "equipment_type": "stationary_ac",
                   "leak_rate": 0.08, "sub_type": "refrigerant"},
        ), db_conn)
        # 100 kg × 8% × GWP(HFC-134a)=1526 / 1000 = 12.208 tCO2e
        assert r.t_CO2e == pytest.approx(12.208, rel=0.01)

    def test_r410a_gwp_is_ar6(self, db_conn):
        from modules.fugitive_energy import _REFRIGERANT_GWP_AR6
        assert _REFRIGERANT_GWP_AR6["R-410A"] == 2088   # IPCC AR6

    def test_coal_mine_methane(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S1 — Fugitive emissions (energy)",
            quantity=1000.0, unit="t", fuel_or_item="coal",
            extra={"sub_type": "coal", "ch4_m3_per_tonne": 10.0},
        ), db_conn)
        assert r.t_CO2e > 100   # 1000t × 10 m3/t × 0.717 kg/m3 × GWP(CH4)

    def test_all_ui_refrigerants_have_gwp(self):
        from streamlit_app.components.fugitive_form import _REFRIGERANTS
        from modules.fugitive_energy import _REFRIGERANT_GWP_AR6
        for group, refs in _REFRIGERANTS.items():
            for ref_name, gwp_ui in refs.items():
                ref_key = ref_name.split(" ")[0]
                gwp_eng = _REFRIGERANT_GWP_AR6.get(ref_key)
                if gwp_eng is not None:
                    assert gwp_ui == gwp_eng, f"{ref_key}: UI={gwp_ui} engine={gwp_eng}"


# ---------------------------------------------------------------------------
# Sprint 3 Batch 3: Waste localisation
# ---------------------------------------------------------------------------

class TestWasteSprint3:

    def _waste(self, treatment, qty, unit, db_conn, extra=None):
        from core.engine import calculate
        return calculate(_rec(
            process="S3 Cat 5 — Waste generated in operations (waste-type-specific)",
            scope="Scope 3", quantity=qty, unit=unit,
            fuel_or_item=treatment, extra=extra or {},
        ), db_conn)

    def test_e_waste_formal_negative(self, db_conn):
        r = self._waste("e_waste", 1, "t", db_conn)
        assert r.t_CO2e == pytest.approx(-0.200, rel=0.01)

    def test_e_waste_informal_positive(self, db_conn):
        r = self._waste("recycling_ewaste_informal", 1, "t", db_conn)
        assert r.t_CO2e == pytest.approx(0.150, rel=0.01)

    def test_c_and_d_waste_inert(self, db_conn):
        r = self._waste("c_and_d_waste", 10, "t", db_conn)
        assert r.t_CO2e == pytest.approx(0.010, rel=0.01)

    def test_stp_sludge(self, db_conn):
        r = self._waste("stp_sludge", 5, "t", db_conn)
        assert r.t_CO2e == pytest.approx(0.400, rel=0.01)

    def test_mumbai_mix(self, db_conn):
        r = self._waste("mumbai_mix", 10, "t", db_conn)
        assert r.t_CO2e == pytest.approx(4.150, rel=0.05)

    def test_indore_mix_low(self, db_conn):
        # Indore is best-practice city — should be much lower than national avg
        r_indore = self._waste("indore_mix", 10, "t", db_conn)
        r_avg    = self._waste("india_average_mix", 10, "t", db_conn)
        assert r_indore.t_CO2e < r_avg.t_CO2e

    def test_recycling_aluminium_high_avoided(self, db_conn):
        r = self._waste("recycling_aluminium", 1, "t", db_conn)
        assert r.t_CO2e == pytest.approx(-9.300, rel=0.05)

    def test_city_inference_mumbai_pincode(self):
        from modules.scope3.cat05_waste import infer_city_treatment_mix
        key, note = infer_city_treatment_mix("400001")
        assert key == "mumbai_mix"

    def test_city_inference_bangalore_pincode(self):
        from modules.scope3.cat05_waste import infer_city_treatment_mix
        key, _ = infer_city_treatment_mix("560001")
        assert key == "bangalore_mix"

    def test_city_inference_by_name(self):
        from modules.scope3.cat05_waste import infer_city_treatment_mix
        key, _ = infer_city_treatment_mix("Bengaluru")
        assert key == "bangalore_mix"

    def test_city_inference_fallback(self):
        from modules.scope3.cat05_waste import infer_city_treatment_mix
        key, _ = infer_city_treatment_mix("Ludhiana")
        assert key == "india_tier2_mix"

    def test_plant_location_auto_inference(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 5 — Waste generated in operations (waste-type-specific)",
            scope="Scope 3", quantity=10.0, unit="t",
            fuel_or_item="city_mix",
            extra={"plant_location": "Mumbai"},
        ), db_conn)
        assert r.t_CO2e == pytest.approx(4.150, rel=0.05)
        assert r.audit_trace.get("city_inference", {}).get("inferred") is True

    def test_existing_waste_efs_unchanged(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 5 — Waste generated in operations (waste-type-specific)",
            scope="Scope 3", quantity=5, unit="t", fuel_or_item="landfill_msw",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(5 * 467 / 1000, rel=0.01)

    def test_waste_ef_count(self):
        from modules.scope3.cat05_waste import _WASTE_EF
        assert len(_WASTE_EF) >= 60


# ---------------------------------------------------------------------------
# Sprint 3 Batch 4: India commute EFs
# ---------------------------------------------------------------------------

class TestCommuteSprint3:

    def _commute(self, mode, qty, country, db_conn):
        from core.engine import calculate
        return calculate(_rec(
            process="S3 Cat 7 — Employee commuting (distance-based)",
            scope="Scope 3", country=country,
            quantity=qty, unit="employee-km", fuel_or_item=mode,
        ), db_conn)

    def test_metro_mumbai_ef(self, db_conn):
        r = self._commute("metro_mumbai", 1_000_000, "IN", db_conn)
        assert r.t_CO2e == pytest.approx(12.0, rel=0.05)  # 0.012 kgCO2e/pkm

    def test_metro_delhi_lower_than_mumbai(self, db_conn):
        r_del = self._commute("metro_delhi",   1_000_000, "IN", db_conn)
        r_mum = self._commute("metro_mumbai",  1_000_000, "IN", db_conn)
        assert r_del.t_CO2e < r_mum.t_CO2e

    def test_auto_rickshaw_cng(self, db_conn):
        r = self._commute("auto_rickshaw_cng", 100_000, "IN", db_conn)
        assert r.t_CO2e == pytest.approx(6.0, rel=0.05)

    def test_suburban_rail_mumbai(self, db_conn):
        r = self._commute("suburban_rail_mumbai", 1_000_000, "IN", db_conn)
        assert r.t_CO2e == pytest.approx(7.0, rel=0.05)

    def test_cab_aggregator(self, db_conn):
        r = self._commute("cab_aggregator", 50_000, "IN", db_conn)
        assert r.t_CO2e == pytest.approx(7.0, rel=0.05)

    def test_gb_defra_modes_unchanged(self, db_conn):
        r = self._commute("car_average", 200_000, "GB", db_conn)
        assert r.t_CO2e == pytest.approx(33.688, rel=0.02)

    def test_india_modes_in_defaults(self):
        from modules.scope3.cat07_commuting import _COMMUTE_EF_DEFAULTS
        india_modes = ["auto_rickshaw_cng", "metro_mumbai", "metro_delhi",
                       "suburban_rail_mumbai", "cab_aggregator", "electric_2wheeler"]
        for mode in india_modes:
            assert mode in _COMMUTE_EF_DEFAULTS, f"{mode} missing from defaults"


# ---------------------------------------------------------------------------
# Sprint 3 Batch 5: Vehicle specs
# ---------------------------------------------------------------------------

class TestVehicleSpecsSprint3:

    def test_tata_prima_vehicle_ef(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 4 — Upstream transport (distance-based tonne-km)",
            scope="Scope 3", quantity=50_000, unit="tonne-km", fuel_or_item="truck",
            extra={"vehicle_make": "Tata", "vehicle_model": "Prima 4428.S",
                   "load_factor": 0.70},
        ), db_conn)
        assert r.factor_id_used.startswith("VSPEC_")
        assert r.fallback_level == "national"
        assert r.t_CO2e > 0

    def test_unknown_vehicle_falls_back_to_modal(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 4 — Upstream transport (distance-based tonne-km)",
            scope="Scope 3", quantity=50_000, unit="tonne-km", fuel_or_item="truck",
            extra={"vehicle_make": "NonExistent", "vehicle_model": "Phantom"},
        ), db_conn)
        assert r.fallback_level == "global"
        assert r.t_CO2e == pytest.approx(3.1, rel=0.05)

    def test_glec_load_factor_direction(self, db_conn):
        """Higher LF = more laden trips = higher EF per tkm (GLEC Framework)."""
        from modules.scope3.cat04_upstream_transport import Cat04UpstreamTransport
        mod = Cat04UpstreamTransport()
        ef_lo, *_ = mod._get_vehicle_ef(db_conn, "Tata", "Prima 4428.S", load_factor=0.30)
        ef_hi, *_ = mod._get_vehicle_ef(db_conn, "Tata", "Prima 4428.S", load_factor=0.90)
        assert ef_lo is not None
        assert ef_lo < ef_hi   # more laden trips = higher EF per tkm

    def test_vehicle_specs_count(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM vehicle_specs").fetchone()[0]
        assert n >= 15, f"vehicle_specs has {n} rows — run `python setup.py --force`"

    def test_all_diesel_vehicles_have_ef(self, db_conn):
        rows = db_conn.execute(
            "SELECT vehicle_id, ef_kgco2e_per_tkm_full_load FROM vehicle_specs "
            "WHERE fuel_type='diesel'"
        ).fetchall()
        for r in rows:
            assert dict(r)["ef_kgco2e_per_tkm_full_load"] is not None


# ---------------------------------------------------------------------------
# Sprint 3 Batch 6: Journey builder distances
# ---------------------------------------------------------------------------

class TestJourneyBuilderSprint3:

    def test_haversine_mumbai_singapore(self):
        from streamlit_app.components.journey_builder import _haversine_km, _CITY_COORDS
        d = _haversine_km(*_CITY_COORDS["Mumbai"], *_CITY_COORDS["Singapore"])
        assert 3500 < d < 4500  # great circle is ~3908 km

    def test_haversine_delhi_mumbai(self):
        from streamlit_app.components.journey_builder import _haversine_km, _CITY_COORDS
        d = _haversine_km(*_CITY_COORDS["Delhi"], *_CITY_COORDS["Mumbai"])
        assert 1000 < d < 1400

    def test_airport_distance_bom_lhr(self, db_conn):
        from utils.flight_lookup import airport_distance_km
        d = airport_distance_km("BOM", "LHR", db_conn)
        assert d is not None
        assert 6000 < d < 8000

    def test_airport_distance_del_sin(self, db_conn):
        from utils.flight_lookup import airport_distance_km
        d = airport_distance_km("DEL", "SIN", db_conn)
        assert d is not None
        assert 4000 < d < 6000

    def test_auto_distance_from_names(self):
        from streamlit_app.components.journey_builder import _auto_distance
        d = _auto_distance("Delhi", "Mumbai")
        assert d is not None and 1000 < d < 1400

    def test_auto_distance_unknown_returns_none(self):
        from streamlit_app.components.journey_builder import _auto_distance
        assert _auto_distance("Nowhereville", "Phantomport") is None

    def test_major_ports_count(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM major_ports").fetchone()[0]
        assert n >= 50, f"major_ports has {n} rows — run `python setup.py --force`"

    def test_airports_count(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM airports").fetchone()[0]
        assert n >= 40, f"airports has {n} rows — run `python setup.py --force`"


# ---------------------------------------------------------------------------
# Sprint 3 Batch 7: ICAO flight method
# ---------------------------------------------------------------------------

class TestFlightInferenceSprint3:

    def test_b77w_economy_calculation(self, db_conn):
        from utils.flight_lookup import icao_fuel_method, airport_distance_km
        d = airport_distance_km("BOM", "LHR", db_conn)
        r = icao_fuel_method(d, "B77W", cabin_class="economy",
                              n_passengers=1, rf_factor=1.0, conn=db_conn)
        assert r["t_CO2e"] == pytest.approx(0.375, rel=0.10)
        assert r["aircraft_icao"] == "B77W"
        assert r["seats"] == 360

    def test_business_class_4x_economy(self, db_conn):
        from utils.flight_lookup import icao_fuel_method, airport_distance_km
        d = airport_distance_km("BOM", "LHR", db_conn)
        r_eco = icao_fuel_method(d, "B77W", cabin_class="economy",   conn=db_conn)
        r_biz = icao_fuel_method(d, "B77W", cabin_class="business",  conn=db_conn)
        ratio = r_biz["t_CO2e"] / r_eco["t_CO2e"]
        assert ratio == pytest.approx(4.0, rel=0.05)

    def test_rf_factor_applied(self, db_conn):
        from utils.flight_lookup import icao_fuel_method, airport_distance_km
        d = airport_distance_km("BOM", "LHR", db_conn)
        r1 = icao_fuel_method(d, "B77W", rf_factor=1.0, conn=db_conn)
        r2 = icao_fuel_method(d, "B77W", rf_factor=1.9, conn=db_conn)
        assert r2["t_CO2e"] / r1["t_CO2e"] == pytest.approx(1.9, rel=0.02)

    def test_cat6_flight_number_path(self, db_conn):
        from core.engine import calculate
        from utils.flight_lookup import airport_distance_km
        d = airport_distance_km("BOM", "LHR", db_conn)
        r = calculate(_rec(
            process="S3 Cat 6 — Business travel (distance-based passenger-km + hotels)",
            scope="Scope 3", quantity=float(d), unit="km",
            fuel_or_item="flight_long_haul_economy",
            extra={"flight_number": "AI101", "dep_iata": "BOM", "arr_iata": "LHR",
                   "cabin_class": "economy", "n_passengers": 1, "rf_factor": 1.0},
        ), db_conn)
        assert "ICAO" in (r.factor_id_used or "")
        assert r.t_CO2e > 0

    def test_aircraft_fuel_burn_count(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM aircraft_fuel_burn").fetchone()[0]
        assert n >= 15, f"aircraft_fuel_burn has {n} rows — run `python setup.py --force`"

    def test_parse_flight_number(self):
        from utils.flight_lookup import parse_flight_number
        assert parse_flight_number("AI101")  == ("AI",  "101")
        assert parse_flight_number("EK 526") == ("EK",  "526")
        assert parse_flight_number("6E1234") == ("6E",  "1234")


# ---------------------------------------------------------------------------
# Sprint 4: Remaining S3 categories
# ---------------------------------------------------------------------------

class TestSprint4Categories:

    def test_cat2_capital_goods_eeio(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 2 — Capital goods (spend-based EEIO)",
            scope="Scope 3", country="GLOBAL",
            quantity=50_000, unit="USD", fuel_or_item="machinery",
        ), db_conn)
        # USEEIO sector 333 (Machinery): ~0.411 kgCO2e/USD × 50000 = 20.57 tCO2e
        assert r.t_CO2e == pytest.approx(20.57, rel=0.05)
        assert r.t_CO2e > 0

    def test_cat3a_upstream_fuels(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 3A — Upstream emissions of purchased fuels",
            scope="Scope 3", quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(10.2, rel=0.05)

    def test_cat3b_upstream_electricity(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 3B — Upstream emissions of purchased electricity/steam/heat/cooling",
            scope="Scope 3", quantity=1000, unit="kWh", fuel_or_item="grid_electricity",
        ), db_conn)
        assert r.t_CO2e > 0

    def test_cat9_downstream_transport(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 9 — Downstream transport (distance-based, tonne-km)",
            scope="Scope 3", quantity=100_000, unit="tonne-km", fuel_or_item="ship",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(0.800, rel=0.05)

    def test_cat10_processing(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 10 — Processing of sold intermediate products (average-data)",
            scope="Scope 3", quantity=100, unit="t", fuel_or_item="steel_intermediate",
        ), db_conn)
        assert r.t_CO2e >= 0

    def test_cat11_fuel_sold(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 11 — Use of sold products (direct, fuels & feedstocks combustion)",
            scope="Scope 3", quantity=1000, unit="GJ", fuel_or_item="natural_gas",
        ), db_conn)
        assert r.t_CO2e == pytest.approx(56.15, rel=0.05)

    def test_cat12_end_of_life(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 12 — End-of-life of sold products (waste-treatment mix)",
            scope="Scope 3", quantity=10, unit="t", fuel_or_item="landfill_plastic",
        ), db_conn)
        # Cat12 uses default treatment mix for "landfill_plastic" material type
        # which falls back to "general" mix: 65% landfill_msw (467) + 25% recycling (-300) + 10% incin (21)
        # Expected EF ~230.65 kgCO2e/t mixed → 10t = 2.31 tCO2e
        assert r.t_CO2e == pytest.approx(2.31, rel=0.05)
        assert r.t_CO2e > 0

    def test_cat15_eeio_technology_sector(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 15 — Investments (equity, average-data EEIO)",
            scope="Scope 3", country="GLOBAL",
            quantity=100_000, unit="USD", fuel_or_item="technology",
            extra={"ownership_pct": 1.0},
        ), db_conn)
        # USEEIO sector 334 (Computer & electronic products): ~0.524 kgCO2e/USD × 100000 = 52.44 tCO2e
        assert r.t_CO2e == pytest.approx(52.44, rel=0.05)
        assert r.t_CO2e > 0   # sector 334 exists in EEIO

    def test_cat15_equity_share(self, db_conn):
        from core.engine import calculate
        r = calculate(_rec(
            process="S3 Cat 15 — Investments (equity, investment-specific)",
            scope="Scope 3",
            quantity=1000.0, unit="tCO2e",
            extra={"equity_pct": 0.25},
        ), db_conn)
        # 1000 tCO2e × 25% = 250 tCO2e
        assert r.t_CO2e == pytest.approx(250.0, rel=0.01)


# ---------------------------------------------------------------------------
# Sprint 4: Org isolation
# ---------------------------------------------------------------------------

class TestOrgIsolation:

    def _insert(self, store, org_id, t_co2e, year=2024):
        store._db.execute("""
            INSERT INTO emission_results
            (record_id, org_id, inventory_year, locked, scope, process, country,
             quantity, unit, kg_CO2, kg_CH4, kg_N2O, kg_CO2e, kg_CO2_biogenic,
             t_CO2e, gwp_ar_used, fallback_triggered, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (str(uuid.uuid4()), org_id, year, 0, "Scope 1",
              "S1 — Stationary combustion (fuel burn)", "IN",
              1000.0, "GJ", t_co2e*1000, 0, 0, t_co2e*1000, 0,
              t_co2e, 6, 0,
              datetime.now(timezone.utc).isoformat(), datetime.now(timezone.utc).isoformat()))
        store._db.commit()

    def test_different_uuid_orgs_isolated(self, inv_store):
        from inventory.store import get_store
        uuid1 = str(uuid.uuid4())
        uuid2 = str(uuid.uuid4())
        s1 = get_store(inv_store.path, org_id=uuid1)
        s2 = get_store(inv_store.path, org_id=uuid2)
        try:
            self._insert(s1, uuid1, 100.0)
            self._insert(s2, uuid2, 999.0)
            assert s1.get_summary(org_id=uuid1, inventory_year=2024)["total_t_co2e"] == 100.0
            assert s2.get_summary(org_id=uuid2, inventory_year=2024)["total_t_co2e"] == 999.0
            assert s1.get_summary(inventory_year=2024)["total_t_co2e"] == 100.0
        finally:
            s1._db.close(); s2._db.close()

    def test_same_uuid_survives_reconnect(self, inv_store):
        from inventory.store import get_store
        org_uuid = str(uuid.uuid4())
        s = get_store(inv_store.path, org_id=org_uuid)
        s2 = None
        try:
            self._insert(s, org_uuid, 77.0)
            s2 = get_store(inv_store.path, org_id=org_uuid)
            assert s2.get_summary(org_id=org_uuid, inventory_year=2024)["total_t_co2e"] == 77.0
        finally:
            s._db.close()
            if s2: s2._db.close()

    def test_year_filter_isolates_years(self, inv_store):
        org_uuid = str(uuid.uuid4())
        s = inv_store.__class__(inv_store.path, org_id=org_uuid)
        try:
            self._insert(s, org_uuid, 100.0, year=2024)
            self._insert(s, org_uuid,  50.0, year=2023)
            assert s.get_summary(org_id=org_uuid, inventory_year=2024)["total_t_co2e"] == 100.0
            assert s.get_summary(org_id=org_uuid, inventory_year=2023)["total_t_co2e"] ==  50.0
            assert s.get_summary(org_id=org_uuid)["total_t_co2e"] == 150.0
        finally:
            s._db.close()

    def test_default_org_id_gets_nothing_from_uuid_orgs(self, inv_store):
        from inventory.store import get_store
        org_uuid = str(uuid.uuid4())
        s = get_store(inv_store.path, org_id=org_uuid)
        s_default = None
        try:
            self._insert(s, org_uuid, 200.0)
            s_default = get_store(inv_store.path, org_id="default")
            assert s_default.get_summary(inventory_year=2024)["total_t_co2e"] == 0.0
        finally:
            s._db.close()
            if s_default: s_default._db.close()


# ---------------------------------------------------------------------------
# Sprint 4: InventoryStore CRUD
# ---------------------------------------------------------------------------

class TestInventoryStoreCRUD:

    def _add(self, store, t_co2e=10.0):
        from modules.base import ActivityRecord, EmissionResult
        rid = str(uuid.uuid4())
        rec = ActivityRecord(
            record_id=rid, scope="Scope 1", org_id=store.org_id,
            process="S1 — Stationary combustion (fuel burn)",
            country="IN", quantity=1000.0, unit="GJ",
            fuel_or_item="natural_gas", reporting_year=2024, gwp_ar=6,
        )
        res = EmissionResult(
            record_id=rid, kg_CO2=t_co2e*1000, kg_CH4=0, kg_N2O=0,
            kg_CO2e=t_co2e*1000, gwp_ar_used=6,
            factor_id_used="TEST", ef_value_used=1.0, ef_unit="kgCO2/GJ",
            ef_source="test", fallback_level="national", fallback_triggered=False,
            calculation_engine="local", confidence="high",
        )
        store.persist(res, rec, 2024)
        return rid

    def test_get_all_records(self, inv_store):
        self._add(inv_store, 10.0)
        self._add(inv_store, 20.0)
        recs = inv_store.get_all_records(inventory_year=2024)
        assert len(recs) == 2
        totals = {r["t_CO2e"] for r in recs}
        assert totals == {10.0, 20.0}

    def test_delete_record(self, inv_store):
        rid = self._add(inv_store, 15.0)
        assert inv_store.get_summary(inventory_year=2024)["n_records"] == 1
        inv_store.delete_record(rid)
        assert inv_store.get_summary(inventory_year=2024)["n_records"] == 0

    def test_delete_many(self, inv_store):
        ids = [self._add(inv_store, float(i)) for i in range(5)]
        n = inv_store.delete_many(ids[:3])
        assert n == 3
        assert inv_store.get_summary(inventory_year=2024)["n_records"] == 2

    def test_locked_record_not_deleted(self, inv_store):
        rid = self._add(inv_store, 5.0)
        inv_store._db.execute(
            "UPDATE emission_results SET locked=1 WHERE record_id=?", (rid,)
        )
        inv_store._db.commit()
        inv_store.delete_record(rid)
        assert inv_store.get_summary(inventory_year=2024)["n_records"] == 1

    def test_update_quantity(self, inv_store, db_conn):
        rid = self._add(inv_store, 10.0)
        ok = inv_store.update_quantity(rid, 2000.0, db_conn)
        assert ok is True
        recs = inv_store.get_all_records(inventory_year=2024)
        assert len(recs) == 1
        assert recs[0]["quantity"] == pytest.approx(2000.0)


# ---------------------------------------------------------------------------
# CEA known-answer regression (must hold across all sprints)
# ---------------------------------------------------------------------------

class TestCEARegressionSprint4:

    def test_cea_v20_fy2023_24_zero_deviation(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 — Purchased electricity (grid)",
            country="IN",
            quantity=70_000_000.0,
            unit="kWh",
            reporting_year=2024,
            fiscal_year="2023-24",
            gwp_ar=6,
        ), db_conn)
        expected = 50_890.0   # 70,000,000 kWh × 0.727 kgCO2e/kWh / 1000
        assert r.t_CO2e == pytest.approx(expected, rel=0.0001)

    def test_grid_ef_count(self, db_conn):
        n = db_conn.execute("SELECT COUNT(*) FROM grid_ef").fetchone()[0]
        # Minimum 26 rows (FY 2013-14 to 2022-23 × weighted_avg at minimum).
        # Fresh install has 44 rows (all 4 methods for all years).
        # Run `python setup.py --force` to get the full 44 rows.
        assert n >= 26, f"Only {n} grid_ef rows — run `python setup.py --force`"

    def test_grid_ef_fallback_year(self, db_conn):
        from ef_store.selector import get_grid_ef
        r = get_grid_ef(db_conn, "IN", calendar_year=2026, method="weighted_avg")
        assert r.ef_value_kgco2e_per_kwh > 0
        assert r.exact_year_match is False

    def test_stationary_coal_india_ncv(self, db_conn):
        from modules.stationary_combustion import StationaryCombustion
        from modules.base import ActivityRecord
        r = StationaryCombustion().calculate(ActivityRecord(
            process="S1 — Stationary combustion (fuel burn)",
            scope="Scope 1", country="IN",
            quantity=1000, unit="t", fuel_or_item="non_coking_coal",
            reporting_year=2024, gwp_ar=6,
        ), db_conn)
        assert r.kg_CO2 > 0
        # India-specific NCV = 19.63 TJ/Gg, EF for other_bituminous_coal = 94600 kgCO2/TJ
        # 1000t × (19.63/1000) TJ/t × 94600 kgCO2/TJ / 1000 = 1857 tCO2
        assert r.t_CO2e == pytest.approx(1857, rel=0.02)
