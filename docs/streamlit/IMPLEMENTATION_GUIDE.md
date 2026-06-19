# sk.lite — Implementation Guide

Complete reference for the sk.lite Climate Intelligence Platform.
This covers the calculation methodology, architecture decisions, page-by-page
feature breakdown, data flows, and extension patterns.

---

## Table of contents

1. [Overview](#1-overview)
2. [Running the app](#2-running-the-app)
3. [Authentication and roles](#3-authentication-and-roles)
4. [Calculation engine](#4-calculation-engine)
5. [Emission factor store](#5-emission-factor-store)
6. [Inventory store](#6-inventory-store)
7. [Page reference](#7-page-reference)
8. [Disclosure outputs](#8-disclosure-outputs)
9. [Data flows](#9-data-flows)
10. [Extension patterns](#10-extension-patterns)
11. [Testing](#11-testing)

---

## 1. Overview

sk.lite is a standalone Streamlit application that implements the full GHG Protocol
Corporate Standard + IPCC 2006 calculation methodology for Scope 1, 2, and all 15
Scope 3 categories. It is designed for India-based manufacturing companies but
supports any country with an IPCC emission factor.

**Technology stack**

| Component | Technology |
|---|---|
| UI | Streamlit ≥1.35 |
| Charts | Plotly ≥5.18 |
| Data processing | Pandas ≥2.0 |
| Emission factor DB | SQLite (via Python `sqlite3`) |
| Inventory DB | SQLite (via Python `sqlite3`) |
| Password hashing | passlib[bcrypt] |
| Report generation | openpyxl (Excel), built-in CSV/JSON |
| Optional API | FastAPI + uvicorn |

**What it does NOT use**

- PostgreSQL (all storage is SQLite, auto-created locally)
- FastAPI backend (optional for ERP integration only)
- Redis, message queues, or external services
- Any cloud dependencies for core operation

---

## 2. Running the app

### Prerequisites

- Python 3.10+ (3.11 or 3.12 recommended)
- No database server required

### Setup (once)

```bash
cd frontend/streamlit          # inside the WARP repo

python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

pip install -r requirements.txt

python setup.py                # creates data/ef_store.sqlite and seeds all EFs
```

### Daily use

```bash
source .venv/bin/activate
streamlit run main.py          # http://localhost:8501
```

### Reset to clean state

```bash
python setup.py --force        # re-ingest all emission factors
# Then delete data/inventory.sqlite, data/users.json to clear user data
```

### Startup sequence (what happens on `streamlit run main.py`)

1. `main.py` runs — sets page config, injects global CSS
2. Auth gate checks `st.session_state._auth_user` — shows login form if not set
3. `_ensure_ef_db_seeded()` runs (`@st.cache_resource`) — opens EF SQLite, seeds if empty
4. `get_inventory()` returns an `InventoryStore` for the logged-in org
5. Org profile is loaded from `data/org_profiles.json` (if saved)
6. Sidebar renders nav buttons for pages the current role can see
7. `importlib.import_module(NAV[page]).render()` loads and renders the selected page

---

## 3. Authentication and roles

### File: `streamlit_app/auth.py`

Credentials are stored in `data/users.json` (bcrypt-hashed, gitignored).
The file is auto-created with demo accounts on first run.

### Five roles

| Role | Who | Pages | Key permissions |
|---|---|---|---|
| **Platform Admin** | Snowkap staff | All pages, all orgs | Cross-org view, impersonate any org, edit EFs, lock inventory |
| **Admin** | Customer IT/sustainability lead | All pages within own org | User management, exports, review approval, EF editing |
| **Contributor** | Sustainability analyst | Data entry + analysis pages | Enter Scope 1/2/3, view dashboard, SASB, checklist |
| **Viewer** | Management / auditor | Dashboard + reports only | Read-only: dashboard, data manager, ESG bridge, knowledge base |
| **Supplier** | External supplier | Supplier portal only | Submit GHG questionnaire, view own score |

### Role-page matrix

```
Page                    Platf  Admin  Contrib  Viewer  Supplier
⚙️  Setup               ✓      ✓      ✓        ✗       ✗
🗄️  EF manager          ✓      ✓      ✗        ✗       ✗
👥  Users               ✓      ✓      ✗        ✗       ✗
🔥  Scope 1             ✓      ✓      ✓        ✗       ✗
⚡  Scope 2             ✓      ✓      ✓        ✗       ✗
🔗  Scope 3             ✓      ✓      ✓        ✗       ✗
📋  Data manager        ✓      ✓      ✓        ✓       ✗
🌱  Initiatives         ✓      ✓      ✓        ✗       ✗
📊  Dashboard           ✓      ✓      ✓        ✓       ✗
🏢  Supplier & ESG      ✓      ✓      ✗        ✗       ✗
🌉  ESG bridge          ✓      ✓      ✗        ✓       ✗
⚠️  Risk                ✓      ✓      ✗        ✗       ✗
🗺️  Logistics           ✓      ✓      ✗        ✗       ✗
🌐  Value chain         ✓      ✓      ✗        ✗       ✗
📤  Export              ✓      ✓      ✗        ✗       ✗
🏭  SASB                ✓      ✓      ✓        ✓       ✗
✅  Checklist           ✓      ✓      ✓        ✓       ✗
🔄  Review queue        ✓      ✓      ✗        ✗       ✗
📜  Audit trail         ✓      ✓      ✗        ✗       ✗
📚  Knowledge base      ✓      ✓      ✓        ✓       ✗
🏪  Supplier portal     ✓      ✗      ✗        ✗       ✓
🏢  Platform Admin      ✓      ✗      ✗        ✗       ✗
```

### Changing a user's password

Admin users can change passwords from the **👥 Users** page.
Passwords are hashed with bcrypt (cost factor 12) via passlib.
The plaintext password is never stored or logged.

---

## 4. Calculation engine

### File: `core/engine.py`

The engine is a dispatcher: given an `ActivityRecord`, it looks up the right
module and returns a `CalculationResult` with `t_CO2e` and a full audit trace.

### ActivityRecord fields

```python
@dataclass
class ActivityRecord:
    record_id:      str       # UUID (generated if blank)
    scope:          str       # "Scope 1", "Scope 2", "Scope 3"
    process:        str       # e.g. "S1 — Stationary combustion (fuel burn)"
    country:        str       # ISO-3166 alpha-2 (e.g. "IN")
    quantity:       float     # amount of activity
    unit:           str       # e.g. "GJ", "kWh", "km", "kg"
    reporting_year: int       # calendar year
    gwp_ar:         int       # 4, 5, or 6 (IPCC AR version)
    fuel_or_item:   str       # fuel key or material/refrigerant identifier
    fiscal_year:    str       # e.g. "2023-24" (for CEA grid EF lookup)
    site:           str       # site/facility name (optional)
    department:     str       # department (optional)
    extra:          dict      # pass-through metadata
```

### 57 calculation processes

**Scope 1 — Direct**

| Process key | Methodology |
|---|---|
| S1 — Stationary combustion (fuel burn) | IPCC 2006 T2.2 · NCV × EF_CO2 + (CH4 + N2O) × GWP |
| S1 — Stationary combustion (mass) | As above, mass-based input |
| S1 — Mobile combustion (distance-based) | DEFRA / IPCC · distance × vehicle EF |
| S1 — Mobile combustion (fuel-based) | IPCC · fuel quantity × combustion EF |
| S1 — Fugitive: refrigerant | IPCC · charge × leak rate × GWP(refrigerant) |
| S1 — Fugitive: natural gas leakage | GHG Protocol · % leakage × CH4 × GWP |
| S1 — Fugitive: coal mine methane | IPCC 2006 T4.1.4 |
| S1 — IPPU: cement clinker | IPCC 2006 T2.1 · clinker × EF_CaO |
| S1 — IPPU: steel (DRI/EAF/BF-BOF) | IPCC 2006 T4.2 |
| S1 — IPPU: aluminium (primary) | IPCC 2006 T4.6 + PFC |
| S1 — IPPU: chemical (specific) | IPCC 2006 process-specific |
| S1 — AFOLU: enteric fermentation | IPCC 2006 T10.10 |
| S1 — AFOLU: manure management | IPCC 2006 T10.16 |

**Scope 2 — Indirect (energy)**

| Process key | Methodology |
|---|---|
| S2 — Purchased electricity (grid) | CEA v20 FY 2023-24: OM/BM/CM methods + historical years |
| S2 — Purchased electricity (market) | Supplier-specific or residual mix EF |
| S2 — Purchased steam/heat | IPCC 2006 heat EF or user-specified |
| S2 — Renewable electricity (PPA/REC) | Zero Scope 2 + optional upstream Scope 3 |

**Scope 3 — Value chain (all 15 categories)**

| Cat | Process key | Methodology |
|---|---|---|
| 1 | S3 Cat1 — Purchased goods (EEIO) | EEIO spend-based: spend × sector intensity factor |
| 1 | S3 Cat1 — Purchased goods (supplier-specific) | Supplier-reported data |
| 2 | S3 Cat2 — Capital goods | EEIO spend-based or mass-based |
| 3 | S3 Cat3 — Upstream energy (WTT) | Pre-combustion EFs for fuels in Scope 1 |
| 3 | S3 Cat3 — T&D losses | CEA T&D loss percentage × Scope 2 |
| 4 | S3 Cat4 — Upstream transport | GLEC v3 / DEFRA 2024 · tonne-km × modal EF |
| 5 | S3 Cat5 — Waste | Waste type × treatment × EF (landfill/incineration/recycling) |
| 6 | S3 Cat6 — Business travel (flight) | ICAO fuel burn method: flight# → aircraft type → fuel × EF |
| 6 | S3 Cat6 — Business travel (road/rail) | DEFRA 2024 passenger-km |
| 7 | S3 Cat7 — Employee commuting | Commuting survey × modal split |
| 8 | S3 Cat8 — Upstream leased assets | Asset type × occupancy × EF |
| 9 | S3 Cat9 — Downstream transport | As Cat 4, downstream direction |
| 11 | S3 Cat11 — Use of sold products | Use-phase energy × product lifetime |
| 12 | S3 Cat12 — End-of-life treatment | Waste fraction × disposal method × EF |
| 15 | S3 Cat15 — Investments (PCAF) | PCAF debt method: financed emissions × attribution fraction × data quality 1–5 |

### GWP tables (`core/gwp.py`)

| AR version | CH4 (fossil) | N2O | Source |
|---|---|---|---|
| AR4 | 25 | 298 | IPCC 2007 |
| AR5 | 28 | 265 | IPCC 2013 |
| AR6 | 29.8 | 273 | IPCC 2021 |

---

## 5. Emission factor store

### Files: `ef_store/`

SQLite database with 12 tables. Seeded from CSV files in `ef_store/seeds/`.

### Tables

| Table | Rows (approx) | Content |
|---|---|---|
| `emission_factors` | 200+ | IPCC 2006 stationary, mobile, fugitive, IPPU EFs |
| `grid_ef` | 44+ | CEA grid EFs: OM/BM/CM method by year (FY2014-15 to FY2023-24) |
| `vehicle_specs` | 15+ | India truck, bus, 2W/3W specs (CMVR categories) |
| `airports` | 40+ | IATA codes with lat/lon for flight distance calculation |
| `aircraft_fuel_burn` | 15+ | ICAO aircraft fuel burn per seat-km by aircraft type |
| `major_ports` | 50+ | Port/city lat/lon for logistics lane distance calculation |
| `eeio_factors` | varies | EEIO sector intensity factors (optional, copy from seeds/eeio/) |
| `sasb_metrics` | 1,124 | SASB canonical metrics across 77 industries, 11 sectors |
| `conversion_constants` | 20+ | Unit conversion constants (energy, mass, volume) |
| `glec_freight_ef` | varies | GLEC v3 freight transport EFs |
| `defra_transport` | varies | DEFRA 2024 passenger + freight transport EFs |
| `wtt_factors` | varies | Well-to-tank upstream fuel EFs |

### Adding a new emission factor

```python
# In ef_store/db.py — add row manually:
conn.execute("""
    INSERT INTO emission_factors
    (source, country, scope, process, fuel_or_item, co2_kg_per_unit, ch4_kg_per_unit, n2o_kg_per_unit, unit, year, gwp_ar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", ("IPCC2006", "IN", "Scope 1", "S1 — Stationary combustion (fuel burn)",
      "new_fuel", 0.0, 0.0, 0.0, "GJ", 2024, 6))
conn.commit()
```

Or use the **🗄️ EF manager** page in the UI.

---

## 6. Inventory store

### Files: `inventory/store.py`, `inventory/audit.py`

`InventoryStore` wraps an SQLite database at `data/inventory.sqlite`.
All records are namespaced by `org_id` (UUID from ⚙️ Setup page).

### Key methods

```python
store = InventoryStore(path="data/inventory.sqlite", org_id="demo-acme-mfg-001")

# Save a calculated record
store.save(record, result)

# Query records
records = store.get_records(org_id=..., inventory_year=2024)

# Aggregate totals
summary = store.get_summary(org_id=..., inventory_year=2024)
# Returns: {"scope1_t_co2e": 0.0, "scope2_t_co2e": 0.0, "scope3_t_co2e": 0.0,
#           "total_t_co2e": 0.0, "n_records": 0}

# Recalculate all records with latest EFs
store.recalculate_all(org_id=..., ef_conn=ef_conn)
```

### Per-org isolation

Every record includes `org_id`. Queries always filter by `org_id` so no org
can see another org's data. The Platform Admin impersonation feature in `main.py`
temporarily swaps the `org_id` used for queries.

---

## 7. Page reference

### ⚙️ Setup (`_page_00_setup.py`)

- Organisation name, UUID (auto-generated), country, fiscal year, reporting year
- GWP AR selection (4, 5, or 6) — applies to all subsequent calculations
- Boundary: operational control / financial control / equity share
- Revenue and headcount (for intensity metrics in dashboard)
- Production unit + volume (for production intensity)
- Multi-site list (populates site dropdowns in Scope 1/2/3)
- Industry/sector → auto-selects SASB sector for 🏭 SASB page
- Saves to `data/org_profiles.json` keyed by org_uuid

### 🔥 Scope 1 (`_page_01_scope1.py`)

Four tabs:

**Stationary combustion**
- 27 fuel types (natural gas, HFO, diesel, coal, biomass, etc.)
- Input: GJ or mass (auto-converted)
- Auto-links Cat 3A WTT record after save

**Mobile combustion**
- Distance-based: vehicle type × km → IPCC/DEFRA EF
- Fuel-based: fuel quantity × combustion EF
- Vehicle types: petrol car, diesel truck, 2W, 3W, railway, shipping

**Fugitive emissions**
- 26+ refrigerants with IPCC AR6 GWP values
- Natural gas leakage: % leak rate × throughput
- Coal mine methane: IPCC 2006 T4.1.4
- O&G venting/flaring

**IPPU / Process**
- Cement clinker production
- Steel (DRI, EAF, BF-BOF routes)
- Aluminium (primary, with PFC emissions)
- Chemical process (user-specified EF)

**Excel bulk upload**
Uses `streamlit_app/components/excel_upload.py` + `templates/GHG_Activity_Upload_Template.xlsx`.
One row per activity record. Columns: scope, process, quantity, unit, fuel_or_item, site,
department, cost_centre, supplier_name, notes.

### ⚡ Scope 2 (`_page_02_scope2.py`)

**Location-based**
- CEA grid EF lookup by country + fiscal year
- Method selection: OM (Operating Margin), BM (Build Margin), CM (Combined Margin)
- Defaults to CM per GHG Protocol recommendation

**Market-based**
- Supplier-specific EF or residual mix EF
- REC / GO certificate tracker (zero-out purchased RECs)

**Steam and heat**
- Direct steam purchase: EF from fuel mix at generation
- District heat: supplier EF or default

**Auto-calculation**
- Cat 3C (T&D losses) auto-calculated after Scope 2 save: applies CEA T&D loss % to kWh consumed

### 🔗 Scope 3 (`_page_03_scope3.py`)

One tab per category, visible based on org's sector and materiality screening.

**Category 1 — Purchased goods and services**
- EEIO spend-based: procurement spend by sector × intensity factor (kgCO₂e/₹)
- Supplier-specific: use reported data from 🏪 Supplier portal

**Category 3 — Fuel- and energy-related (WTT)**
- Auto-populated from Scope 1 fuel consumption
- Pre-combustion EF for each fuel (upstream extraction + processing + transport)

**Category 4 & 9 — Transport (multi-modal journey builder)**
- Build a lane: origin city → destination city
- Add legs: road (truck type), rail, sea (vessel class), air (aircraft type)
- Auto-calculates distance (great-circle for air/sea, road factor applied)
- GLEC v3 EF × tonne-km for each leg

**Category 6 — Business travel**
- Flight number lookup: → ICAO aircraft type → fuel burn per seat-km × GHG EF
- Fallback: DEFRA 2024 short-haul/long-haul EF
- Road/rail: DEFRA 2024 passenger-km EF

**Category 15 — Investments (PCAF)**
- Debt: outstanding amount × attribution fraction × counterparty emissions
- Data quality score 1–5 (PCAF standard) shown on record

### 📋 Data manager (`_page_07_inventory.py`)

- Full table of all records for the org × year
- Filter by: scope, category, site, supplier, keyword search
- Inline edit → triggers recalculation with current EF
- Bulk delete with confirmation
- "Recalculate all" — re-runs engine on every record with latest EFs
- CSV export of filtered view

### 📊 Emissions dashboard (`_page_04_dashboard.py`)

Five tabs:

**Overview**
- Scope 1/2/3 donut chart (Plotly)
- Scope 1 sub-breakdown by combustion type
- Total tCO₂e metric + YoY change

**Intensity**
- Absolute vs revenue intensity vs production intensity toggle
- Intensity denominators from ⚙️ Setup

**SBTi**
- Near-term target (4.2% Scope 1+2 reduction per year, 1.5°C pathway)
- Long-term target (net-zero by 2050)
- Sector Decarbonization Approach (SDA) for heavy industry

**Benchmarks**
- 12-sector peer comparison (tCO₂e/₹Cr revenue)
- Current org positioned on benchmark chart

**By site / supplier**
- Scope 1/2/3 per site (stacked bar)
- Supplier-linked emissions (records with `supplier_name` set)

### 🌱 Initiatives (`_page_08_initiatives.py`)

- Table of reduction initiatives: name, category, scope, target year, target tCO₂e, CapEx, opex savings
- Status: Planned / In progress / Completed / On hold
- MAC (Marginal Abatement Cost) curve — Plotly waterfall:
  - X-axis: cumulative tCO₂e reduction
  - Y-axis: ₹/tCO₂e cost (negative = cost-saving)
  - Width = annual reduction, colour = status
- SBTi gap: total committed reduction vs required SBTi trajectory
- CRUD: add, edit, delete initiatives

### 🏢 Supplier & ESG (`_page_11_supplier.py`)

Eight tabs:
1. **Overview** — supplier list with ESG scores, GHG data linked from inventory
2. **Spend & emissions** — procurement spend pie + EEIO Cat 1 estimate
3. **Risk matrix** — ESG score vs spend scatter, risk quadrant
4. **PESTEL** — India + China supply chain risk factors per supplier
5. **E drilldown** — Carbon, Waste, Energy KPIs vs benchmarks
6. **S drilldown** — Labour, Safety (TRIR/LTIR), Human Rights KPIs
7. **G drilldown** — Compliance, Ethics, Transparency KPIs
8. **Engagement** — Questionnaire completion status, submission history

### 🗺️ Logistics map (`_page_17_logistics.py`)

- Transport lanes from supplier city → plant site, stored in `data/logistics.json`
- Four tabs:
  - **Lane map**: Plotly globe scatter with arc lines for each lane
  - **Hotspots**: emission Pareto (80/20) + spend vs emissions scatter
  - **Modal shift**: current vs optimal modal split, CO₂e saving table
  - **Manage lanes**: add, edit, delete lanes; 8 transport mode EFs (DEFRA 2024)

### 📤 Export & disclosures (`_page_06_export.py`)

- Single record: CSV row
- All records: Excel workbook with scope tabs
- Disclosure ZIP containing:
  - BRSR (Business Responsibility and Sustainability Report) — India SEBI format
  - CDP (Carbon Disclosure Project) — climate questionnaire responses
  - TCFD (Task Force on Climate-related Financial Disclosures)
  - GRI 302 (Energy), GRI 305 (Emissions), GRI 306 (Waste)
  - SASB — sector-specific metrics mapped from inventory

### 🏭 SASB standards (`_page_10_sasb.py`)

- 1,124 metrics from the SASB canonical master (Sprint 11)
- Filter by sector (11 SICS sectors) — auto-set from ⚙️ Setup industry field
- Causal chain Sankey: activity → emission → disclosure metric
- Coverage heatmap: which metrics have inventory data vs gap
- Download: sector metrics as CSV

### 🏪 Supplier portal (`_page_15_supplier_portal.py`)

For users with role = Supplier:
- GHG questionnaire: Scope 1, 2, 3 inputs for their own operations
- Submission: saved to `data/supplier_submissions.json`
- Engagement history: past submissions with status
- Own ESG score: displayed after submission (benchmark vs peers)
- Document upload: certificates, reports (saved locally)

### 🏢 Platform Admin (`_page_19_admin.py`)

For Platform Admin role only (Snowkap staff):
- List of all registered orgs with org_uuid, name, sector, last activity
- **Switch org**: impersonate any customer org — all subsequent pages show that org's data
- **Return to own view**: exits impersonation
- Platform-level config: global EF overrides, feature flags
- Cross-org emissions summary table

---

## 8. Disclosure outputs

### Files: `outputs/disclosures/`

Each mapper takes the `InventoryStore` summary + raw records and returns a
structured dict that is serialised to the disclosure format.

| Mapper | File | Coverage |
|---|---|---|
| BRSR | `brsr_mapper.py` | SEBI BRSR 2023 — Principle 6 (E) disclosures |
| CDP | `cdp_mapper.py` | CDP Climate C1-C12 questionnaire sections |
| TCFD | `tcfd_mapper.py` | TCFD 4 pillars: Governance, Strategy, Risk, Metrics |
| GRI 302/305/306 | `gri_mapper.py`, `gri306_mapper.py` | GRI Standards 2021 |
| SASB | `sasb_mapper.py` | Sector-specific SASB metrics |
| ESRS | `esrs_mapper.py` | EU ESRS E1 (climate), E2 (pollution) |

---

## 9. Data flows

### New activity record (Scope 1 example)

```
User fills form (⚙️ Scope 1 page)
  → ActivityRecord dataclass created
  → core.engine.calculate(record, ef_conn)
       → looks up process in _PROCESS_REGISTRY
       → calls modules.stationary_combustion.calculate(record, ef_conn)
            → ef_store.selector.get_ef(country, fuel, year, gwp_ar)
            → t_CO2e = quantity × ef_co2 + quantity × ef_ch4 × gwp_ch4 + ...
            → returns CalculationResult(t_CO2e=..., trace=...)
  → inventory.store.save(record, result)
       → writes to data/inventory.sqlite (scoped by org_id)
       → writes audit entry to data/audit.sqlite
  → UI shows result + calculation trace (expandable)
```

### Dashboard query

```
User opens 📊 Dashboard
  → inventory.store.get_summary(org_id, year)
       → SQLite GROUP BY scope → scope1/2/3 totals
  → Plotly figures built from summary + raw records
  → @st.cache_data(ttl=60) caches all Plotly figures for 60 seconds
```

### Disclosure export

```
User clicks Export ZIP (📤 Export page)
  → all records fetched from InventoryStore
  → each disclosure mapper called with records + org_profile
  → mappers return structured dicts
  → dicts serialised: BRSR→Excel, CDP→JSON, GRI→CSV, TCFD→PDF placeholder
  → ZIP assembled and streamed as download
```

---

## 10. Extension patterns

### Adding a new page

1. Create `streamlit_app/_page_24_newpage.py` with a `render()` function
2. Add one entry to `NAV` in `main.py`:
   ```python
   "🆕  New page": "streamlit_app._page_24_newpage",
   ```
3. Add the page label to `ROLE_PAGES` in `streamlit_app/auth.py` for the roles that should see it
4. Add a section header entry to `_NAV_SECTIONS` if it starts a new workflow group

### Adding a new emission factor

1. Add a CSV row to the appropriate seed file in `ef_store/seeds/`
2. Add an ingester function in `ef_store/ingester.py`
3. Call it from `ingest_all_seeds()` in the same file
4. Re-run `python setup.py --force`

### Adding a new Scope 3 category module

1. Create `modules/scope3/cat13_downstream_leased.py` implementing `calculate(record, ef_conn)`
2. Register it in `core/engine.py` `_PROCESS_REGISTRY`
3. Add a form tab in `streamlit_app/_page_03_scope3.py`

### Integrating with FastAPI backend (future)

When the FastAPI backend (`backend/`) is ready to issue JWTs:

1. FastAPI auth route issues JWT after DB lookup
2. Streamlit receives JWT via URL: `http://localhost:8501?token=<JWT>&org_id=<UUID>`
3. In `main.py`, add JWT decode before the auth gate:
   ```python
   token = st.query_params.get("token")
   if token:
       payload = decode_token(token)   # from backend.app.core.security
       st.session_state["_auth_user"] = {...payload...}
   ```
4. Remove the file-based `users.json` auth for production orgs
5. Keep the local auth as fallback for standalone demo mode

---

## 11. Testing

### Test suite

1200+ tests across 32 sprint test files (`tests/test_sprint1.py` through `tests/test_sprint32.py`).

```bash
cd frontend/streamlit
pytest                          # full suite
pytest tests/test_sprint1.py    # core engine: 57 processes
pytest tests/test_sprint11.py   # SASB + GRI 306 + SBTi SDA
pytest tests/test_sprint15.py   # PCAF / Cat 15
pytest -k "scope3 or Cat6"      # filter by keyword
pytest --tb=short               # compact tracebacks
```

### Key test coverage

| Sprint | Coverage |
|---|---|
| 1–5 | Core engine: all 57 processes, unit conversion, GWP tables |
| 6–9 | EF store: ingestion, grid EFs, EEIO, WTT |
| 10–11 | SASB + GRI 306 mappers, SBTi SDA, disclosure outputs |
| 12–14 | Inventory store: CRUD, recalculate, audit trail |
| 15–18 | Scope 3 Cat 15 PCAF, logistics, value chain, risk |
| 19–24 | Supplier portal, ESG bridge, review queue, export ZIP |
| 25–32 | Supplier-linked GHG, MAC curve, materiality, targets |

### CI

`.github/workflows/test.yml` runs on every push:
- `pytest` (1200+ tests)
- Page syntax check (imports all `_page_*.py` without Streamlit runtime)
- CEA v20 regression: 70,000 MWh × 0.727 tCO₂/MWh = 50,890 tCO₂ (±1%)
- `flake8` lint
