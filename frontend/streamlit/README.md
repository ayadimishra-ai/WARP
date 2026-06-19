# sk.lite — Climate Intelligence Platform

Full-stack GHG inventory and ESG reporting tool. Covers Scope 1, 2, and all 15 GHG Protocol Scope 3 categories. Built for India-based companies with CEA v20 grid EFs, SASB sector mapping, 6 disclosure output formats, and a standalone REST API for ERP integration.

**v1.0 · 1200+ tests · 57 calculation processes · 24 pages · 6 disclosure mappers**

---

## Quick start on Replit

Click **Run** — the `run.sh` script handles everything automatically:
1. Installs dependencies (`pip install -r requirements.txt`)
2. Seeds the emission factor database (`python setup.py`)
3. Launches the app on port 8501

> Replit config: `.replit` → `replit.nix` (Python 3.11)

---

## Quick start (standalone — no backend required)

All commands run from the **`frontend/streamlit/` directory** inside the WARP repo:

```bash
cd frontend/streamlit

# 1. Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialise the emission factor database (run once)
python setup.py

# 4. Launch the app
streamlit run main.py
```

App opens at **http://localhost:8501**

> **Re-seed from scratch:** `python setup.py --force`
> **Health check only:** `python setup.py --check`

---

## Demo credentials

| Username | Password | Role | Access |
|---|---|---|---|
| `snowkap` | `Snowkap@2024` | Platform Admin | All orgs, all pages, cross-org view |
| `acme_admin` | `Acme@2024` | Admin | Full access — Acme Manufacturing |
| `acme_contrib` | `Acme@2024` | Contributor | Data entry + dashboard, no export/admin |
| `acme_viewer` | `Acme@2024` | Viewer | Read-only dashboards and reports |
| `greentech_admin` | `GreenTech@2024` | Admin | Full access — GreenTech Solutions |
| `supplier1` | `Supplier@2024` | Supplier | Supplier portal only |
| `ghg_admin` | `ghgadmin2024` | Admin | Full access (legacy demo credential) |

After sign-in as Admin: go to **⚙️ Setup** to load the Acme profile.
As Platform Admin: go to **🏢 Platform Admin** → Switch org.

---

## Pages (24 total)

### CONFIGURE
| Page | Key features |
|---|---|
| ⚙️ **Setup** | UUID org isolation, sector → SASB auto-mapping, GWP AR4/5/6 selection, multi-site, boundary setting, revenue/employee intensity denominators |
| 🗄️ **EF manager** | View/filter/add/delete emission factors, WTT upstream tab, CEA grid EFs by year, EEIO factors |
| 👥 **Users** | Add/remove users, role assignment, password change (Admin only) |

### GHG INVENTORY
| Page | Key features |
|---|---|
| 🔥 **Scope 1** | Stationary combustion (27 fuels), mobile (distance + fuel-based), fugitive (26+ refrigerants, O&G, coal), IPPU, AFOLU, Excel bulk upload, Cat 3A WTT auto-link |
| ⚡ **Scope 2** | Dual reporting (location-based + market-based), steam/heat, Cat 3C T&D auto-calculate, REC/GO certificate tracker |
| 🔗 **Scope 3** | All 15 GHG Protocol categories. Multi-modal journey builder. Flight number → ICAO fuel lookup. Cat 15 PCAF 1–5 debt scoring. |
| 📋 **Data manager** | Filter by scope/category/supplier, edit → recalculate, bulk delete, recalculate all with latest EFs |
| 🌱 **Initiatives** | Reduction tracker (CapEx, opex savings, ₹/tCO₂e), MAC curve waterfall chart, SBTi gap analysis |

### ANALYSIS
| Page | Key features |
|---|---|
| 📊 **Emissions dashboard** | Scope breakdown donut, absolute/intensity toggle, SBTi SDA, YoY comparison, 12-sector benchmarks, by-site and by-supplier charts |
| 🏢 **Supplier & ESG** | Spend vs emissions, EEIO Cat 1 estimate, ESG risk scatter, PESTEL analysis, E/S/G drilldowns |
| 🌉 **ESG bridge** | GHG → ESG score mapping, ESRS/BRSR/GRI crosswalk, disclosure gap heatmap |
| ⚠️ **Risk dashboard** | Climate risk (physical + transition), sector exposure, scenario analysis |
| 🗺️ **Logistics map** | Supplier-to-plant transport lanes, emission hotspots, modal shift analysis, 8 DEFRA 2024 EFs |
| 🌐 **Value chain map** | Scope 3 category visualisation, upstream/downstream split, hotspot identification |

### REPORTING
| Page | Key features |
|---|---|
| 📤 **Export & disclosures** | CSV/Excel/JSON + full disclosure ZIP: BRSR, CDP, TCFD, GRI 302+305+306, SASB |
| 🏭 **SASB standards** | 1,124 metrics across 11 sectors, causal chain Sankey, primitive coverage heatmap |
| ✅ **Checklist** | 42-item GHG Protocol + ISO 14064-1 verification checklist |
| 🔄 **Review queue** | Submit inventory for review, approval workflow, status tracking |

### GOVERNANCE
| Page | Key features |
|---|---|
| 📜 **Audit trail** | Immutable log of all data entry, edits, approvals, and exports |
| 📚 **Knowledge base** | GHG methodology reference, IPCC AR6 GWP tables, calculation methodology cards |
| 🏪 **Supplier portal** | Supplier self-reporting: GHG questionnaire, own score, engagement history |
| 🏢 **Platform Admin** | Cross-org view (Snowkap staff only), switch between customer orgs |

---

## Architecture

```
frontend/streamlit/
├── main.py                    ← Entry point (24-page NAV, auth gate, session state)
├── setup.py                   ← DB init + seed all EFs + sanity checks
├── api.py                     ← Optional FastAPI REST endpoint (ERP integration)
│
├── streamlit_app/
│   ├── auth.py                ← RBAC (5 roles), bcrypt password hashing
│   ├── _page_00_setup.py      ← Organisation setup
│   ├── _page_01_scope1.py     ← Scope 1 (stationary, mobile, fugitive, IPPU)
│   ├── _page_02_scope2.py     ← Scope 2 (electricity, steam)
│   ├── _page_03_scope3.py     ← Scope 3 (all 15 categories)
│   ├── _page_04_dashboard.py  ← Emissions dashboard (Plotly)
│   └── ...                    ← pages 05–23
│   └── components/            ← Reusable UI: activity_form, calc_trace, excel_upload
│
├── core/
│   ├── engine.py              ← 57-process calculation dispatcher
│   ├── gwp.py                 ← IPCC AR4/5/6 GWP tables
│   ├── unit_converter.py
│   └── subroutines.py
│
├── ef_store/
│   ├── db.py                  ← SQLite schema (12 tables + sasb_metrics)
│   ├── ingester.py            ← All seed loaders
│   └── seeds/                 ← CSV files (IPCC, DEFRA, CEA, EEIO, SASB, GLEC)
│
├── modules/
│   ├── stationary_combustion.py
│   ├── mobile_combustion.py
│   ├── fugitive_energy.py
│   ├── purchased_electricity.py
│   ├── ippu_process.py
│   └── scope3/                ← All 15 Cat modules (cat01–cat12)
│
├── inventory/                 ← InventoryStore (SQLite, per-org isolation)
├── esg_store/                 ← ESG data store
├── outputs/
│   └── disclosures/           ← BRSR, CDP, TCFD, GRI, SASB, ESRS mappers
│
├── data/                      ← Seed JSON (initiatives, sites, review_queue)
│                                 ⚠ SQLite files + users.json are GITIGNORED
│                                 ⚠ Auto-generated on first run by setup.py
└── tests/                     ← 1200+ pytest tests (test_sprint1.py through test_sprint32.py)
```

---

## Running tests

```bash
cd frontend/streamlit
pytest                           # all 1200+ tests
pytest tests/test_sprint1.py     # core engine (57 tests)
pytest tests/test_sprint11.py    # SASB + GRI 306 + SBTi SDA
pytest -k "PCAF or SASB"
```

---

## Optional REST API (ERP integration)

620+ emission factor records are pre-loaded in the database. The REST API allows ERP integration:

```bash
cd frontend/streamlit
pip install fastapi uvicorn
uvicorn api:app --port 8000
```

Example request with curl:

```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{"process":"stationary_combustion","fuel":"Natural Gas","quantity":100,"unit":"GJ","org_id":"demo-acme-mfg-001"}'
```

CORS origins are controlled via `SKLITE_API_CORS_ORIGINS` env var (comma-separated).
Default: `http://localhost:8000,http://localhost:8501`

---

## Data files that are never committed to git

| Path | What it is | How it is created |
|---|---|---|
| `data/ef_store.sqlite` | Emission factor database | `python setup.py` |
| `data/inventory.sqlite` | Activity records per org | Auto on first save |
| `data/users.json` | User accounts (bcrypt hashed) | Auto on first login |
| `data/org_profiles.json` | Org configuration | ⚙️ Setup page |
| `data/suppliers.json` | Supplier list | 🏢 Supplier page |
| `data/audit.sqlite` | Audit trail | Auto on any write |
| `data/reviews.sqlite` | Review submissions | 🔄 Review queue |
