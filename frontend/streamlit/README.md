# sk.lite

Full-stack GHG inventory tool covering Scope 1, 2, and all 15 GHG Protocol Scope 3 categories. Built for India-based companies with CEA v20 grid EFs, multiple disclosure outputs, SASB sector mapping, and a REST API.

**v1.0 · 1200+ tests (from 620+ at v0.8.5) · 57 calculation processes · 19 pages · 6 disclosure mappers · 0.000% CEA v20 deviation**

---

## Quick start

```bash
cd ghg_calculator
pip install -r requirements.txt
python setup.py --force          # initialise DB + seed all EFs + 1,124 SASB metrics
streamlit run main.py            # launch the app
```

### Optional: REST API

```bash
pip install fastapi uvicorn
uvicorn api:app --port 8000      # run from ghg_calculator/
# POST http://localhost:8000/calculate
```

---

## Running tests

```bash
cd ghg_calculator
pytest                           # all 1200+ tests
pytest tests/test_sprint1.py    # core engine (57 tests)
pytest tests/test_sprint11.py   # SASB + GRI 306 + SBTi SDA
pytest -k "PCAF or SASB"
```

---

## Pages (11 total)

| Page | Key features |
|---|---|
| ⚙️ **Setup** | UUID org isolation, sector → SASB auto-mapping, S3 materiality screening, GWP selection |
| 🔥 **Scope 1** | Stationary (27 fuels), mobile (L+km), fugitive (26+ refrigerants/O&G/coal), IPPU, AFOLU, Excel upload. Cat 3A WTT auto-link after save. |
| ⚡ **Scope 2** | Dual reporting (location+market), steam/heat, Cat 3C T&D auto-calculate, REC/GO certificate tracker |
| 🔗 **Scope 3** | All 15 GHG Protocol categories. Cat 4/9 multi-modal journey builder. Cat 6 flight# → ICAO fuel. Cat 3A WTT pre-fill from S1. Cat 15 with PCAF 1–5 scoring. |
| 📊 **Dashboard** | Scope breakdown + S1 sub-breakdown, intensity absolute/intensity toggle, SBTi near-term + long-term + SDA, year-over-year, 12-sector benchmarks. All queries cached (60s). |
| 📋 **Data manager** | Filter scope+category+search, edit→recalculate, bulk delete, recalculate all with latest EFs |
| 🌱 **Initiatives** | Reduction tracker with CapEx, cost/tonne, status. Pipeline vs SBTi gap. |
| ✅ **Checklist** | 42-item GHG Protocol + ISO 14064-1 verification checklist |
| 🏭 **SASB** | 1,124 metrics, 11 sectors, causal chain Sankey, primitive coverage heatmap, downloads |
| 🗄️ **EF manager** | View/filter/add/delete EFs, WTT upstream tab, grid EFs, EEIO |
| 📤 **Export** | Text/CSV/Excel/JSON + full disclosure ZIP (BRSR/CDP/TCFD/GRI 302+305+306/SASB) |

---

## Architecture

```
ghg_calculator/
├── main.py                          ← Entry point (11-page NAV)
├── api.py                           ← FastAPI REST endpoint (optional)
├── setup.py                         ← DB init + seed all EFs
├── requirements.txt
│
├── core/
│   ├── engine.py                    ← 56-process dispatcher
│   ├── unit_converter.py
│   ├── gwp.py                       ← IPCC AR4/5/6 GWP tables
│   └── subroutines.py
│
├── ef_store/
│   ├── db.py                        ← SQLite schema (12 tables incl. sasb_metrics)
│   ├── ingester.py                  ← All seed loaders incl. ingest_sasb_metrics()
│   └── seeds/
│       ├── sasb_canonical_master.csv  ← 1,124 SASB metrics (Sprint 11)
│       └── ...other seed files
│
├── modules/scope3/                  ← All 15 S3 category modules
│
├── inventory/store.py               ← SQLite inventory, UUID org isolation
│
├── outputs/
│   ├── report.py                    ← Text/CSV/Excel report (to_xlsx)
│   ├── supplier_template.py
│   └── disclosures/
│       ├── brsr_mapper.py           ← SEBI BRSR P6 + PCAF weighted avg
│       ├── cdp_mapper.py            ← CDP C6/C7/C8/C11
│       ├── tcfd_mapper.py           ← TCFD 4-pillar
│       ├── gri_mapper.py            ← GRI 302 + 305
│       ├── gri306_mapper.py         ← GRI 306 Waste
│       └── sasb_mapper.py           ← SASB Standards (1,124 metrics)
│
├── streamlit_app/                   ← 11 pages
│
└── tests/                           ← 952+ tests across 8 files
```

---

## Emission factor sources

| Source | Coverage |
|---|---|
| IPCC 2006 / 2019 Refinement | S1 stationary/mobile/fugitive/IPPU/AFOLU |
| CEA v20 (India) | Grid EFs FY 2013-14 to 2023-24, 4 methods |
| DEFRA 2024 | Transport, waste, hotel, WTT upstream (13 fuels) |
| USEEIO v2 | 220 spend-based S3 sectors |
| IPCC EFDB India | 78 India-specific EFs |
| SASB Canonical Master | 1,124 metrics, 11 sectors, 22 primitives |

---

## Disclosure outputs (7 mappers)

| Framework | Standard | Coverage |
|---|---|---|
| SEBI BRSR | Principle 6 Essential | E1 energy, E3 emissions, E4 intensity, E5 targets, PCAF score |
| CDP | Climate Change | C6.1/C6.3/C6.5/C6.7 · C7 base year · C8 intensity · C11 S3 |
| TCFD | 2017 + 2021 guidance | All 4 pillars: Governance/Strategy/Risk/Metrics |
| GRI 302 | Energy 2016 | 302-1/3/4 energy consumption and intensity |
| GRI 305 | Emissions 2016 | 305-1 through 305-7 |
| GRI 306 | Waste 2020 | 306-1 through 306-5 |
| SASB | Canonical Standards | 1,124 metrics, 11 sectors, causal chains |

---

## API endpoint

```bash
# Single calculation
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{"scope":"Scope 1","process":"S1 — Stationary combustion (fuel burn)",
       "country":"IN","quantity":1000,"unit":"GJ","fuel_or_item":"natural_gas",
       "reporting_year":2024,"gwp_ar":6}'

# List all processes
curl http://localhost:8000/processes
```

---

## Known-answer benchmark

CEA v20 FY 2023-24: 70,000 MWh × 0.727 = **50,890 tCO₂e** — 0.000% deviation confirmed.

---

## setup.py options

```bash
python setup.py            # seed if empty
python setup.py --force    # re-ingest everything (incl. SASB)
python setup.py --check    # health check: reports row counts for all 12 tables
```

---

## Deployment

### Replit (fastest — zero config)

1. Fork this repo on GitHub
2. Go to [replit.com](https://replit.com) → **Import from GitHub** → paste your repo URL
3. Replit detects `.replit` automatically
4. Click **Run** — databases seed on first start, app opens on port 80
5. Use **Replit Deployments** (top-right) to get a permanent public URL

> Default login: `admin` / `ghgadmin2024` — change immediately via **👥 Users** page

### GitHub + Local

```bash
git clone https://github.com/your-org/ghg-calculator.git
cd ghg-calculator/ghg_calculator
pip install -r requirements.txt
python setup.py --force        # seed databases
streamlit run main.py          # opens http://localhost:8501
```

### GitHub Actions CI

Push to `main` or `develop` — the workflow at `.github/workflows/test.yml` runs:
- Full pytest suite (952+ tests)
- All 18 page syntax checks
- CEA v20 regression (50,890 tCO₂e benchmark)
- Flake8 lint (errors only)

### Docker (alternative)

```bash
docker compose up --build
# App at http://localhost:8501
```

---

## Default credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `ghgadmin2024` | Admin (full access) |

**Change password:** Sign in → 👥 Users → Change password

**Create users:** Sign in → 👥 Users → Add user (or use the ✨ Create account tab on the login screen)

**Disable auth** (local dev): set `_AUTH_ENABLED = False` in `main.py`

---
