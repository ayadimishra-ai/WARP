# Changelog

All notable changes to the sk.lite are documented here.

## [0.8.7] — Sprint 25

### Added — GHG↔Supplier linkage (full system)
- **`supplier_name` column** in `emission_results` schema (`_COLS = 40`). Auto-migrated on every `InventoryStore` init.
- **Scope 1/2/3 tag expanders** now include a **supplier dropdown** populated from `data/suppliers.json`. Selecting a supplier writes `supplier_name` into every record saved in that session.
- **Excel bulk upload** reads `supplier_name` (or `supplier`) column from template rows and stores it in `record.extra`.
- **Data manager** — supplier filter dropdown, supplier shown in expander label, supplier included in search haystack.
- **Supplier page** — `_pull_ghg_from_inventory()` upgraded: primary match by `supplier_name` column, fallback to name-substring in process/site/fuel. Tracks `ghg_all_tco2e` and `ghg_n_records` per supplier.
- **Dashboard By Site tab** — new "By supplier (linked emissions)" bar chart. Shows which suppliers have records linked, total tCO₂e attributed, and guidance if nothing is linked yet.

### Added — GitHub + Replit deployment
- **`.replit`** — run command, port 8501→80, Cloud Run deployment target.
- **`run.sh`** — seeds DB then starts Streamlit; used by Replit and local dev.
- **`replit.nix`** — Python 3.11 + system deps for Replit Nix environment.
- **`.github/workflows/test.yml`** — CI pipeline: pytest (902+ tests), page syntax check, CEA v20 regression, flake8 lint.
- **`.gitignore`** — Replit dirs, all `data/*.sqlite`, `users.json`, `suppliers.json` excluded.
- **README** — deploy instructions for Replit, GitHub local, GitHub Actions, Docker. Default credentials table.

### Infrastructure
- `test_sprint25.py`: 56 tests.
- `activity_form.py`: batch rows now capture `site`, `department`, `cost_centre`, `supplier_name` from Excel columns.

## [0.8.6] — Sprint 24

### Added
- **Self-registration (sign-up)** — Two-tab login gate (Sign in / Create account). New orgs register with org name, industry/sector, username, display name, password. First user auto-created as Admin. Password ≥8 chars + confirmation check.
- **Industry / sector field** — 22-option GICS-inspired classification (`INDUSTRY_CHOICES` in `auth.py`) added to Setup page. Saved in profile and used for SASB auto-select, benchmarks, and ESG gap analysis.
- **Supplier page v2** — Expanded from 4 to 8 tabs:
  - **💸 Spend & emissions** — Procurement spend pie + risk-coloured bar, spend-based emissions via EEIO category intensity factors (`CAT_EI`), total Cat 1 estimate.
  - **⚠️ Risk & PESTEL** — Risk vs ESG scatter matrix, per-supplier PESTEL analysis (India and China factors), supply chain risk categories (concentration, engagement, ESG scores).
  - **🌿 E drilldown** — Carbon, Waste, Energy KPI tables with best-practice benchmarks.
  - **🤝 S drilldown** — Labour, Safety (TRIR/LTIR), Human Rights & HRDD KPI tables.
  - **⚖️ G drilldown** — Compliance, Ethics & anti-corruption, Transparency KPI tables with questionnaire submission status.
- **MAC curve** in Initiatives — Marginal Abatement Cost waterfall chart (Plotly). Each initiative = one bar; width = tCO₂e/yr reduction, height = ₹/tCO₂e cost. Cost-saving measures shown below zero line. Status-colour-coded (Planned/In progress/Completed/On hold).
- **Logistics & Geography** (`_page_17_logistics.py`) — 18th page. Maps raw material lanes from supplier cities to plant. 4 tabs: Lane map (globe scatter), Emission hotspots (Pareto bar + spend vs emissions scatter), Modal shift analysis (all modes with saving table), Manage lanes (add/edit/delete). 8 transport mode EFs (DEFRA 2024). Criticality score = spend + emissions. 5 sample lanes seeded.

### Infrastructure
- `main.py`: 18 pages in NAV. v0.8.5 (same; version bump on final release).
- `test_sprint24.py`: 60 tests.

## [0.8.5] — Sprint 23

### Added
- **Supplier portal** (`_page_15_supplier_portal.py`) — Isolated self-service view for supplier contacts. Supplier role sees only their own scorecard and GHG questionnaire. Admin sees a selector to view any supplier's portal. Questionnaire: 10 data points (S1+S2 tCO₂e, boundary, standard, verification, target, renewable %, ISO 14001, supplier code). Document upload with audit trail.
- **Knowledge base** (`_page_16_knowledge.py`) — EF source registry with quality grades (A/B/C), methodology notes per process, GWP100 table (AR4/5/6), glossary (27 terms), external links (11 authoritative sources).
- **Year-on-year comparison** in Export — Side-by-side metric cards, delta table, and Plotly grouped bar chart comparing two locked snapshot years.
- **Assurance opinion** in Review Queue — Reviewer can record Reasonable / Limited / Adverse / Disclaimer opinion on each approval. Stored in `review_decisions` table. Shown in history view.
- **Supplier role** in auth.py — 4th role (Supplier) sees only the Supplier portal page. Allows supplier contacts to log in with isolated access.
- **Notification bell** in sidebar — 🔔 count shows pending review submissions.
- **Docker deployment** — `Dockerfile` + `docker-compose.yml` for containerised production deployment. Data directory persisted as Docker volume.

### Infrastructure
- `main.py` now has 17 pages in NAV.
- Version: v0.8.5
- `test_sprint23.py`: 42 tests.

## [0.8.4] — Sprint 22

### Added
- **Audit trail** (`inventory/audit.py` + `_page_12_audit.py`) — Immutable AuditEvent log. Every save, delete, lock, export, login, and role-change is recorded as an INSERT-only row. Filterable by event type / actor. CSV export. Viewer-gated.
- **ESG–GHG Bridge** (`_page_13_esg_bridge.py`) — 13-topic crossmap linking ESRS E1/E2/E3/E4/E5, S1/S2, G1, BRSR P6, CDP C6, GRI 305 to specific GHG Protocol categories. Live coverage assessment shows which ESG topics have inventory data. Framework × scope coverage matrix.
- **Review Queue** (`_page_14_review.py`) — Maker-checker workflow. Contributors submit scope/year for review. Admins approve or return with mandatory comment. All decisions are immutable ReviewDecision records. Three-tab UI: Pending / Submit / History.
- **User roles** (`streamlit_app/auth.py`) — Three roles: Admin (full), Contributor (data entry + dashboard), Viewer (read-only). SHA-256 hashed passwords in `data/users.json`. Role-filtered navigation. Login gate in `main.py` (disable with `_AUTH_ENABLED = False`). Default: `admin` / `ghgadmin2024`.
- **Supplier ESG Scorecard** (`_page_11_supplier.py`) — Composite E·40%+S·35%+G·25% scoring. ESG pillar charts. GHG linkage (Cat 1/4 from inventory). Manage suppliers (add/edit/delete). CSV download. Role-gated.

### Infrastructure
- `main.py` now has 15 pages in NAV (11 core + supplier + audit + ESG bridge + review).
- `test_sprint22.py`: 44 tests covering all Sprint 22 features.

## [0.8.3] — Sprint 21

### Added
- **Organisational tagging** — `site`, `department`, `cost_centre`, `tags` columns in `emission_results` schema. Tag expanders on Scope 1/2/3 pages. Tags persisted via `persist_batch(tags=...)` using `dataclasses.replace()`. Auto-migrates existing DBs via `_migrate()`.
- **Data manager: tag editor** — Inline `site`/`department`/`cost_centre` editor per record. Site/dept filter dropdowns. 🏷️ badge in expander label shows site/dept at a glance.
- **Dashboard: By Site tab** — Tab 8 shows tCO₂e breakdown by site and department with horizontal bar charts (Plotly) or table fallback. Record-level detail table.
- **Dashboard: previous-year delta** — Top 4 metrics (Total/S1/S2/S3) show `±X.X% vs YYYY` delta vs prior year if prior-year inventory data exists. `delta_color="inverse"` (red = increase = bad).
- **Export: By Site sheet** — Sheet 5 in Excel workbook lists all tagged records by site/dept/cost-centre.
- **API: `POST /disclose`** — Returns pre-filled disclosure JSON for brsr/cdp/tcfd/gri/sasb frameworks.
- **API: `GET /records`** — Lists saved inventory records, filterable by scope and site.

### Fixed
- **ALTER TABLE migration** — `InventoryStore._migrate()` runs on every init, idempotently adding new columns to existing DBs that predate Sprint 21.
- **Methodology sheet version** — Updated from v0.6.0 to v0.8.3 in Excel export.

## [0.8.2] — Sprint 17 / Sprint 18

### Fixed
- **`UnboundLocalError: fallback_warning`** — Python's function-scope rule caused `fallback_warning`, `calculate`, `ActivityRecord`, `calc_trace`, `render_calc_trace`, and `Path` to be treated as locals throughout `render()` whenever they appeared in a local `from X import Y` statement anywhere in the function. Fixed by moving all to module-level imports in `_page_01_scope1.py`, `_page_02_scope2.py`, `_page_03_scope3.py`, `_page_00_setup.py`.
- **`conftest.py` corrupted** — Encoding-fix script overwrote `conftest.py` and 12 other test files with `test_sprint9.py` content. Restored all test files from archives and rebuilt `conftest.py` with correct `db_conn`, `inv_store`, `make_record` fixtures.
- **`test_sprint17.py` SyntaxError** — Encoding-fix script corrupted string literal `.read_text()` → `.read_text(encoding="utf-8")` inside a string, producing invalid Python. Fixed by restoring the correct string content.
- **`== 56` process count** in `test_sprint8/10/11` updated to `== 57` (AFOLU manure added in Sprint 14).

### Added
- **Save button UX** — State-based success feedback using `st.session_state` flags; success messages persist across reruns without double-rerun pattern.
- **Export: detailed CSV** — `ef_source`, `fallback_level`, `confidence` columns added to detailed CSV output.
- **Dashboard: S3 gap analysis** — Completeness % shown per material category in the gap tab.
- **Inventory: duplicate detection** — Before persisting, checks if an identical record (same process/fuel/quantity/unit/year) already exists and warns the user.
- **Dashboard: last-save timestamp** — Per-scope last-updated timestamp shown in landing metrics.
- **`tests/test_sprint18.py`** — Sprint 18 test suite.

## [0.8.1] — Sprint 16

### Added
- **Dashboard DQ grade in top metrics** — 5th metric card "DQ grade" (A–E) now visible on the landing row alongside Total/S1/S2/S3. Immediate data quality signal without opening the DQ tab.
- **Scope 3 sidebar completeness bar** — `st.progress()` bar shows `n_filled/n_material categories (X%)` above the category list in the Scope 3 sidebar.
- **Export ZIP: PCAF Cat 15 disclosure** — Full pack now includes `PCAF_Cat15_{year}.txt` with total financed emissions, weighted average PCAF score, and asset class breakdown when Cat 15 records exist.
- **EF manager: Uncertainty reference tab** — New 5th tab "📊 Uncertainty ranges" with IPCC 2006 uncertainty ranges (±%) for 15 EF categories including EEIO (300%), AFOLU N₂O (100%), WTT (20–50%), and combustion EFs (1–3%). GHG Protocol error propagation guidance.
- **`tests/test_sprint16.py`** — Sprint 16 test suite.
- **`ef_store/db.py`**: `db_summary()` now includes `sasb_metrics` — fixes `[FAIL] sasb_metrics: 0 rows` in `setup.py --force` health check.

### Changed
- `main.py`: version v0.8.1, 57 processes, 525+ tests
- `README.md`: updated test/process counts to v0.8.1

## [0.8.1] — Sprint 14 / Sprint 15

### Added
- **AFOLU manure management** (`_AFOLUManure` class in `core/engine.py`) — 57th calculation process. Covers CH₄ (manure storage) and N₂O (manure nitrogen) from 6 livestock types (cattle, buffalo, sheep, goat, pig, poultry). IPCC 2006 Vol.4 Tables 10.14 + 10.21 (Tier 1). Pig: CH₄=5.0, N₂O=0.11 kgCO₂e/head/yr; dairy cattle: CH₄=1.0, N₂O=0.34. Always less than enteric for ruminants.
- **Scope 1 AFOLU UI** — Radio toggle between enteric fermentation and manure management in Tab 5. Both modes use same 6 livestock types. `proc_afolu` selects correct process.
- **CDP PCAF weighted average** — `_calc_pcaf_weighted_avg_cdp()` in `cdp_mapper.py`. `C11_pcaf_weighted_avg_score` added to CDP JSON (consistent with BRSR).
- **API `/health` endpoint** — Returns `{status, emission_factors, sasb_metrics, processes}`. Useful for deployment monitoring.
- **Setup: org profile JSON backup** — Download current profile as JSON for backup/migration. Upload to restore.
- **Data manager: EF source in summary table** — `ef_source` and fallback flag visible directly in the records table (not just expander).
- **`tests/test_sprint14.py`** — 33 tests: 57 processes, manure all livestock, manure < enteric, pig EFs, audit trace, CDP PCAF, API /health, Scope 1 safe .get(), 57-process smoke test.

### Fixed
- All `== 56` process count assertions updated to `== 57` across test_sprint8/10/11/12/13
- `S3_BY_KEYWORD` in `test_sprint5.py` updated with `"manure"` keyword and branch
- Scope 1 page: all `profile["reporting_year"]` and `profile["gwp_ar"]` replaced with `.get()` (7 locations)
- `test_sprint13.py`: mapper threshold corrected `>= 7` → `>= 6`

### Added
- **SASB Standards** (`_page_10_sasb.py`, `outputs/disclosures/sasb_mapper.py`) — 1,124 metrics across 11 sectors seeded from SASB canonical master CSV. Causal chain Sankey (Primitive → Topic → Outcome). SASB sector auto-mapped from Setup profile. Coverage scorecard (% quantitative metrics filled).
- **GRI 306 Waste mapper** (`outputs/disclosures/gri306_mapper.py`) — disclosures 306-1 through 306-5: waste generation, diversion, disposal. Diversion rate auto-calculated. Wired into Export page and full disclosure ZIP.
- **REST API endpoint** (`api.py`) — FastAPI `POST /calculate` and `POST /calculate/batch`. Returns tCO₂e + full audit trace. CORS-enabled. Optional: `pip install fastapi uvicorn; uvicorn api:app`.
- **SBTi SDA** — Sector Decarbonization Approach expander in Dashboard SBTi tab. 5 sectors (electricity/cement/steel/aluminium/pulp) with IEA NZE 2023 intensity pathways and live gap calculator.
- **SBTi near-term vs long-term split** — Dashboard SBTi tab now has 2 sub-tabs: near-term (2030, 42%) and long-term (2050, 90%) with separate charts and a 6-item validation checklist.
- **REC/GO certificate tracker** — Tab 3 in Scope 2: record RECs/GOs by MWh, type, vintage, supplier, registry. Calculates market-based S2 net of offset.
- **Cat 3A WTT auto-link** — After S1 stationary/mobile save, stores fuel quantities in `st.session_state["wtt_prefill"]` and shows a success banner in Scope 3 Cat 3A.
- **Cat 3C T&D auto-calculate** — After S2 electricity save, engine calculates and persists T&D loss record automatically (no manual entry needed).
- **PCAF data quality scoring (1–5)** — Cat 15 investments now includes a PCAF score selector, attribution factor method, and EVIC/outstanding fields. PCAF weighted average added to BRSR JSON output.
- **Dashboard intensity toggle** — Absolute vs intensity view toggle in intensity tab with bar chart for both modes.
- **SASB sector mapping** — Setup saves `sasb_sector` to profile, mapping internal sectors to SASB sectors automatically.
- **SASB + GRI 306 in disclosure ZIP** — Full pack now contains BRSR, CDP, TCFD, GRI 302/305, GRI 306, SASB text/JSON/causal chains.
- **`tests/test_sprint11.py`** — 45 tests (SASB seeding, mapper, GRI 306, PCAF, SBTi, Cat 3A/3C, page imports)
- **`tests/test_sprint12.py`** — 41 tests (API, WTT prefill, SASB mapping, SBTi SDA, PCAF math, export ZIP)

### Changed
- `setup.py`: `EXPECTED_MINIMUMS` now includes `sasb_metrics: 1000`
- `main.py`: SASB page added to NAV (11 pages total); version v0.8.0
- `requirements.txt`: optional FastAPI/uvicorn comment added
- `ef_store/db.py`: `sasb_metrics` table + 4 indexes in schema
- `ef_store/ingester.py`: `ingest_sasb_metrics()` + wired into `ingest_all_seeds()`

## [0.7.0] — Sprint 7 / Sprint 8 / Sprint 9 / Sprint 10

### Added
- **TCFD disclosure** (`outputs/disclosures/tcfd_mapper.py`) — 4-pillar pre-fill
- **GRI 302/305 mapper** (`outputs/disclosures/gri_mapper.py`)
- **`to_xlsx()` in `report.py`** — Excel workbook with 4 sheets
- **One-click full disclosure pack** — ZIP with all disclosures
- **WTT upstream EF tab** in EF Manager
- **Scope 1 sub-breakdown** in Dashboard
- **Category filter** in Data Manager
- **`get_all_records(scope=)`** parameter
- **Cat 3C T&D nudge** → upgraded to auto-calculate in Sprint 11
- **EEIO multi-currency FX** (EUR/GBP/INR/JPY/CNY/SGD/AUD/CAD)
- **`st.cache_data`** on all expensive dashboard queries
- `.gitignore`, `CHANGELOG.md`
- `tests/test_sprint6.py` (43), `test_sprint8.py` (21), `test_sprint9.py` (37), `test_sprint10.py` (22)

## [0.6.0] — Sprint 6

### Added
- Reduction initiatives tracker (`_page_08_initiatives.py`)
- 42-item verification checklist (`_page_09_checklist.py`)
- Supplier data request template
- Snapshot year-over-year comparison
- BRSR energy/reduction fields
- `tests/test_sprint6.py` (43 tests)

## [0.5.0] — Sprint 5

### Added
- IPPU UI (cement/lime/steel/glass/chemicals)
- AFOLU UI (6 livestock types)
- Cat 6 flight number ICAO method
- Year-over-year dashboard tab
- Sector benchmarks (12 sectors)
- S3 materiality screening
- `tests/test_sprint5.py` (90 tests)

## [0.4.0] — Sprint 4
- All 15 Scope 3 categories; BRSR/CDP mappers; inventory lock; data manager

## [0.3.0] — Sprint 3
- Vehicle specs, airport distance, ICAO fuel, India commute EFs, waste EFs

## [0.2.0] — Sprint 2
- Streamlit frontend; S2 dual reporting; Excel bulk upload; Dashboard; EF Manager

## [0.1.0] — Sprint 1
- Core engine (56 processes); SQLite EF store; CEA v20; IPCC GWP; `test_sprint1.py` (57 tests)
