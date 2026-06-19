"""
Demo seed data for sk.lite — Acme Manufacturing Pvt Ltd.

Acme dual role:
  - BUYER (upstream):    Scope 3 Cat 4 tagged with supplier_name
  - SUPPLIER (downstream): Scope 3 Cat 11 tagged with buyer_name

Run from repo root:  python streamlit_app/demo_data.py
"""
import sys, json, sqlite3
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))


DEMO_PROFILE = {
    "org_name":         "Acme Manufacturing Pvt Ltd",
    "org_uuid":         "demo-acme-mfg-001",
    "org_id":           "demo-acme-mfg-001",
    "industry":         "Manufacturing \u2014 Auto components",
    "primary_country":  "IN",
    "currency":         "INR",
    "reporting_year":   2024,
    "fiscal_year":      "2023-24",
    "gwp_ar":           6,
    "fx_to_usd":        0.012,
    "boundary":         "operational_control",
    "org_role":         "both",
    "sasb_sector":      "Resource Transformation",
    "revenue_inr_cr":   450.0,
    "employees":        3200,
    "production_unit":  "units (auto parts sets)",
    "production_volume":180000.0,
    "s3_material_cats": ["Cat 1", "Cat 2", "Cat 4", "Cat 6", "Cat 7", "Cat 11"],
    "setup_done":       True,
    "last_updated":     "2025-01-15 09:30",
    "sites": [
        {"name":"Pune Plant",    "type":"Manufacturing plant","city":"Pune",
         "country":"IN","lat":18.520,"lon":73.857,"area_m2":45000},
        {"name":"Chennai Plant", "type":"Manufacturing plant","city":"Chennai",
         "country":"IN","lat":13.083,"lon":80.271,"area_m2":32000},
        {"name":"Delhi DC",      "type":"Warehouse / DC",     "city":"Delhi",
         "country":"IN","lat":28.614,"lon":77.209,"area_m2":12000},
    ],
    "_initiatives_seed": [
        {"id":"INI-001","name":"Rooftop solar — Pune Plant","category":"Renewable energy",
         "scope":"Scope 2","status":"In progress","target_year":2026,
         "target_tco2e":2800.0,"capex_lakh_inr":180.0,"owner":"Energy team"},
        {"id":"INI-002","name":"LED + VFD retrofit","category":"Energy efficiency",
         "scope":"Scope 2","status":"Completed","target_year":2025,
         "target_tco2e":950.0,"capex_lakh_inr":45.0,"owner":"Facilities"},
        {"id":"INI-003","name":"Supplier ESG engagement Tier 1","category":"Supply chain",
         "scope":"Scope 3","status":"Planned","target_year":2027,
         "target_tco2e":3500.0,"capex_lakh_inr":25.0,"owner":"Procurement"},
        {"id":"INI-004","name":"Modal shift — road to rail","category":"Fuel switching",
         "scope":"Scope 3","status":"Planned","target_year":2026,
         "target_tco2e":210.0,"capex_lakh_inr":8.0,"owner":"Logistics"},
        {"id":"INI-005","name":"Natural gas to green H2 pilot","category":"Fuel switching",
         "scope":"Scope 1","status":"Planned","target_year":2028,
         "target_tco2e":1200.0,"capex_lakh_inr":350.0,"owner":"Engineering"},
        {"id":"INI-006","name":"EV truck conversion","category":"Fleet decarbonisation",
         "scope":"Scope 1","status":"Planned","target_year":2027,
         "target_tco2e":420.0,"capex_lakh_inr":120.0,"owner":"Fleet"},
        {"id":"INI-007","name":"Waste heat recovery","category":"Energy efficiency",
         "scope":"Scope 1","status":"In progress","target_year":2025,
         "target_tco2e":680.0,"capex_lakh_inr":95.0,"owner":"Operations"},
        {"id":"INI-008","name":"SBTi target validation","category":"Governance",
         "scope":"All scopes","status":"In progress","target_year":2025,
         "target_tco2e":0.0,"capex_lakh_inr":15.0,"owner":"Sustainability"},
    ],
}


def seed_profile():
    profiles_path = ROOT / "data" / "org_profiles.json"
    profiles = {}
    if profiles_path.exists():
        try:
            profiles = json.loads(profiles_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    # MERGE: preserve existing Acme fields (initiatives, custom edits) and only
    # fill in missing required fields. Other orgs (GreenTech, Snowkap) untouched.
    existing_acme = profiles.get("demo-acme-mfg-001", {})
    merged = dict(DEMO_PROFILE)
    for k, v in existing_acme.items():
        if k not in merged or merged.get(k) in (None, "", []):
            merged[k] = v
    # Critical fields always come from DEMO_PROFILE (so revenue/sites/etc. stay correct)
    for k in ("org_uuid","org_id","sites","revenue_inr_cr","employees",
              "primary_country","industry","setup_done","reporting_year"):
        merged[k] = DEMO_PROFILE[k]
    # Preserve initiatives if present in existing profile
    if "_initiatives" in existing_acme:
        merged["_initiatives"] = existing_acme["_initiatives"]
    profiles["demo-acme-mfg-001"] = merged
    profiles_path.parent.mkdir(parents=True, exist_ok=True)
    profiles_path.write_text(json.dumps(profiles, indent=2), encoding="utf-8")
    (ROOT / "data" / "sites.json").write_text(
        json.dumps(DEMO_PROFILE["sites"], indent=2), encoding="utf-8"
    )
    print(f"  Profile merged (preserved {len(existing_acme)} existing fields)")
    print(f"  Other orgs untouched: {[k for k in profiles if k != 'demo-acme-mfg-001']}")


def _year_records(year, scale):
    """One year of realistic Acme records. scale=1.0 for 2024."""
    return [
        # === SCOPE 1 ===
        dict(scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
             fuel_or_item="natural_gas", quantity=85000 * scale, unit="GJ",
             extra={"site": "Pune Plant", "department": "Utilities"}),
        dict(scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
             fuel_or_item="diesel", quantity=12500 * scale, unit="GJ",
             extra={"site": "Chennai Plant", "department": "Power backup"}),
        dict(scope="Scope 1", process="S1 \u2014 Stationary combustion (fuel burn)",
             fuel_or_item="coal", quantity=8000 * scale, unit="GJ",
             extra={"site": "Pune Plant", "department": "Process heat"}),
        dict(scope="Scope 1", process="S1 \u2014 Mobile combustion (road)",
             fuel_or_item="hgv_diesel", quantity=380000 * scale, unit="km",
             extra={"site": "All sites", "department": "Fleet"}),
        dict(scope="Scope 1", process="S1 \u2014 Mobile combustion (road)",
             fuel_or_item="car_petrol", quantity=290000 * scale, unit="km",
             extra={"site": "All sites", "department": "Fleet"}),
        dict(scope="Scope 1", process="S1 \u2014 Fugitive emissions (energy)",
             fuel_or_item="HFC-134a", quantity=85 * scale, unit="kg",
             extra={"site": "Pune Plant", "department": "Facilities"}),

        # === SCOPE 2 ===
        dict(scope="Scope 2", process="S2 \u2014 Purchased electricity (grid)",
             quantity=18500000 * scale, unit="kWh",
             extra={"site": "Pune Plant", "department": "Operations"}),
        dict(scope="Scope 2", process="S2 \u2014 Purchased electricity (grid)",
             quantity=12200000 * scale, unit="kWh",
             extra={"site": "Chennai Plant", "department": "Operations"}),
        dict(scope="Scope 2", process="S2 \u2014 Purchased electricity (grid)",
             quantity=2800000 * scale, unit="kWh",
             extra={"site": "Delhi DC", "department": "Warehouse"}),

        # === SCOPE 3 UPSTREAM (Acme as buyer) ===
        dict(scope="Scope 3", category="Cat 4 \u2014 Upstream transport",
             process="S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
             quantity=4800000 * scale, unit="tonne-km",
             extra={"site": "Pune Plant", "department": "Logistics",
                    "supplier_name": "Alpha Metals Ltd"}),
        dict(scope="Scope 3", category="Cat 4 \u2014 Upstream transport",
             process="S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
             quantity=1600000 * scale, unit="tonne-km",
             extra={"site": "Chennai Plant", "department": "Logistics",
                    "supplier_name": "GreenEarth Inputs"}),
        dict(scope="Scope 3", category="Cat 4 \u2014 Upstream transport",
             process="S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
             quantity=900000 * scale, unit="tonne-km",
             extra={"site": "Pune Plant", "department": "Logistics",
                    "supplier_name": "Nova Chemicals"}),
        dict(scope="Scope 3", category="Cat 6 \u2014 Business travel",
             process="S3 Cat 6 \u2014 Business travel (distance-based passenger-km + hotels)",
             fuel_or_item="flight_domestic", quantity=180000 * scale, unit="passenger-km",
             extra={"site": "Acme HQ", "department": "Corporate"}),
        dict(scope="Scope 3", category="Cat 7 \u2014 Employee commuting",
             process="S3 Cat 7 \u2014 Employee commuting (average-data)",
             quantity=3200 * scale, unit="employees",
             extra={"site": "All sites", "department": "HR"}),

        # === SCOPE 3 DOWNSTREAM (Acme as supplier) ===
        dict(scope="Scope 3", category="Cat 11 \u2014 Use of sold products",
             process="S3 Cat 11 \u2014 Use of sold products (direct, energy consuming products)",
             fuel_or_item="electricity_lifetime", quantity=600000 * scale, unit="kWh",
             extra={"site": "Acme HQ", "department": "Sales",
                    "buyer_name": "Tata Motors"}),
        dict(scope="Scope 3", category="Cat 11 \u2014 Use of sold products",
             process="S3 Cat 11 \u2014 Use of sold products (direct, energy consuming products)",
             fuel_or_item="electricity_lifetime", quantity=380000 * scale, unit="kWh",
             extra={"site": "Acme HQ", "department": "Sales",
                    "buyer_name": "Mahindra Auto"}),
    ]


def seed_inventory():
    """Seed Acme inventory for 2022, 2023, 2024."""
    import modules.stationary_combustion
    import modules.mobile_combustion
    import modules.fugitive_energy
    import modules.ippu_process
    import modules.purchased_electricity
    import modules.scope3.cat01_purchased_goods
    import modules.scope3.cat04_upstream_transport
    import modules.scope3.cat06_business_travel
    import modules.scope3.cat07_commuting
    import modules.scope3.cat11_use_of_sold_products

    from inventory.store import get_store
    from modules.base import ActivityRecord
    from core.engine import calculate
    from ef_store.db import setup_db

    ORG_ID = "demo-acme-mfg-001"
    INV_DB = ROOT / "data" / "inventory.sqlite"

    cn = sqlite3.connect(str(INV_DB))
    n_del = cn.execute("DELETE FROM emission_results WHERE org_id=?", (ORG_ID,)).rowcount
    cn.commit(); cn.close()
    print(f"  Wiped {n_del} existing Acme records")

    store = get_store(path=str(INV_DB), org_id=ORG_ID)
    conn  = setup_db(str(ROOT / "data" / "ef_store.sqlite"))

    YEAR_SCALES = {2022: 1.08, 2023: 1.04, 2024: 1.00}
    saved, errors = 0, 0
    for year, scale in sorted(YEAR_SCALES.items()):
        for rec in _year_records(year, scale):
            rec["org_id"]         = ORG_ID
            rec["country"]        = "IN"
            rec["reporting_year"] = year
            rec["fiscal_year"]    = f"{year-1}-{str(year)[-2:]}"
            rec["gwp_ar"]         = 6
            try:
                ar = ActivityRecord(**rec)
                result = calculate(ar, conn)
                store.persist(result, ar, year)
                saved += 1
            except Exception as e:
                errors += 1
                print(f"  [ERR] {rec['process'][:50]}: {e}")
    conn.close()

    print(f"\n  Saved {saved} records ({errors} errors)")
    print(f"  {'-'*55}")
    print(f"  {'Year':6s} {'n':>4s}  {'Scope 1':>10s}  {'Scope 2':>10s}  {'Scope 3':>10s}  {'Total':>10s}")
    print(f"  {'-'*55}")
    cnv = sqlite3.connect(str(INV_DB))
    for year in (2024, 2023, 2022):
        s1 = cnv.execute("SELECT COUNT(*), COALESCE(SUM(t_CO2e),0) FROM emission_results WHERE org_id=? AND inventory_year=? AND scope='Scope 1'", (ORG_ID, year)).fetchone()
        s2 = cnv.execute("SELECT COALESCE(SUM(t_CO2e),0) FROM emission_results WHERE org_id=? AND inventory_year=? AND scope='Scope 2'", (ORG_ID, year)).fetchone()
        s3 = cnv.execute("SELECT COALESCE(SUM(t_CO2e),0) FROM emission_results WHERE org_id=? AND inventory_year=? AND scope='Scope 3'", (ORG_ID, year)).fetchone()
        nall = cnv.execute("SELECT COUNT(*) FROM emission_results WHERE org_id=? AND inventory_year=?", (ORG_ID, year)).fetchone()
        print(f"  {year:>6d} {nall[0]:>4d}  {s1[1]:>10,.1f}  {s2[0]:>10,.1f}  {s3[0]:>10,.1f}  {s1[1]+s2[0]+s3[0]:>10,.1f}")
    cnv.close()
    print(f"  {'-'*55}")


if __name__ == "__main__":
    print("=" * 60)
    print(" sk.lite Demo - Acme Manufacturing Pvt Ltd")
    print("=" * 60)
    print("\nSeeding profile...")
    seed_profile()
    print("\nSeeding inventory (3 years: 2022, 2023, 2024)...")
    seed_inventory()
    print("\n[DONE] Log in as acme_admin / Acme@2024")
