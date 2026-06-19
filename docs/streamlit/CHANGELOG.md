# sk.lite Integration Changelog

Tracks all changes made when integrating the finalized sk.lite repository into
the `claude/remodel-python-streamlit` branch of the WARP monorepo.

---

## [2026-06-19] — Hotfix: replace passlib with direct bcrypt

### Problem

`passlib` is unmaintained (last release 2020) and contains an internal bug-detection
routine that calls `bcrypt.hashpw()` with a 73-byte test secret. `bcrypt>=4.0.0`
now hard-rejects secrets longer than 72 bytes with:

```
ValueError: password cannot be longer than 72 bytes, truncate manually
```

This crashed on first run before any user could log in.

### Fix

Removed `passlib[bcrypt]` entirely. `auth.py` now calls the `bcrypt` library
directly:

| Before | After |
|---|---|
| `from passlib.context import CryptContext` | `import bcrypt as _bcrypt_lib` |
| `_pwd_ctx.hash(password)` | `_bcrypt_lib.hashpw(password.encode(), _bcrypt_lib.gensalt()).decode()` |
| `_pwd_ctx.verify(plain, hashed)` | `_bcrypt_lib.checkpw(plain.encode(), hashed.encode())` |

`requirements.txt`: removed `passlib[bcrypt]>=1.7.4`, kept `bcrypt>=4.0.0`.

The security properties are identical — bcrypt with per-password salt — but
using the actively maintained library directly eliminates the compatibility
shim that was causing the crash.

---

## [2026-06-19] — NAV + ROLE_PAGES: wire 4 missing pages, complete role matrix

Four page files existed on disk but were not registered in `NAV` in `main.py`,
making them unreachable:

| Label | Module |
|---|---|
| `🎯 Target register` | `streamlit_app._page_22_targets` |
| `🏭 Supplier network` | `streamlit_app._page_23_value_chain` |
| `📝 ESG data points` | `streamlit_app._page_20_esg_datapoints` |
| `⚖️ Materiality` | `streamlit_app._page_21_materiality` |

`auth.py` ROLE_PAGES updated:
- **Contributor**: granted access to Target register, ESG data points, EF manager,
  Supplier & ESG, ESG bridge, Risk, Logistics, Value chain map, Review queue,
  Audit trail (all previously in NAV but blocked by ROLE_PAGES)
- **Viewer**: granted access to Target register, Risk, Logistics, Value chain map
- Removed stale `"📊  Dashboard"` key (page no longer exists under that label)

---

## [2026-06-19] — Initial integration into WARP remodel branch

### Context
Branch: `claude/remodel-python-streamlit`
Commit: `b4c2acd` — `feat(streamlit): replace stub dashboards with sk.lite 24-page app`

The `claude/remodel-python-streamlit` branch was previously created as a Python
architectural scaffold to replace the legacy Next.js/React stack. It contained
three placeholder stub dashboards (GHG, ESG, OPS). These were replaced in full
by the finalized sk.lite Climate Intelligence Platform.

Source: `525d23ea-_repo_sklite.zip` (finalized sk.lite build)

---

### Files removed (placeholders)

| File | Why removed |
|---|---|
| `frontend/streamlit/ghg/dashboard.py` | Stub — replaced by sk.lite 24-page app |
| `frontend/streamlit/esg/score_dashboard.py` | Stub — replaced by sk.lite 24-page app |
| `frontend/streamlit/ops/monthly_activity.py` | Stub — replaced by sk.lite 24-page app |
| `frontend/streamlit/shared/api_client.py` | Stub httpx client — sk.lite uses its own SQLite storage |

---

### Files added (sk.lite source)

195 files added. Key additions:

| Path | Description |
|---|---|
| `frontend/streamlit/main.py` | Streamlit entry point — 24-page nav, auth gate, session state |
| `frontend/streamlit/setup.py` | DB init + EF seed script + sanity checks |
| `frontend/streamlit/api.py` | Optional FastAPI REST endpoint for ERP integration |
| `frontend/streamlit/streamlit_app/auth.py` | RBAC (5 roles), login/signup forms |
| `frontend/streamlit/streamlit_app/_page_00_setup.py` | Organisation setup |
| `frontend/streamlit/streamlit_app/_page_01_scope1.py` | Scope 1 (stationary, mobile, fugitive, IPPU) |
| `frontend/streamlit/streamlit_app/_page_02_scope2.py` | Scope 2 (electricity, steam, dual reporting) |
| `frontend/streamlit/streamlit_app/_page_03_scope3.py` | Scope 3 (all 15 categories) |
| `frontend/streamlit/streamlit_app/_page_04_dashboard.py` | Emissions dashboard (Plotly) |
| `frontend/streamlit/streamlit_app/_page_05_ef_manager.py` | EF manager |
| `frontend/streamlit/streamlit_app/_page_06_export.py` | Export + disclosure ZIP |
| `frontend/streamlit/streamlit_app/_page_07_inventory.py` | Data manager |
| `frontend/streamlit/streamlit_app/_page_08_initiatives.py` | Reduction initiatives + MAC curve |
| `frontend/streamlit/streamlit_app/_page_09_checklist.py` | GHG Protocol + ISO 14064-1 checklist |
| `frontend/streamlit/streamlit_app/_page_10_sasb.py` | SASB standards (1,124 metrics) |
| `frontend/streamlit/streamlit_app/_page_11_supplier.py` | Supplier & ESG |
| `frontend/streamlit/streamlit_app/_page_12_audit.py` | Audit trail |
| `frontend/streamlit/streamlit_app/_page_13_esg_bridge.py` | ESG bridge |
| `frontend/streamlit/streamlit_app/_page_14_review.py` | Review queue |
| `frontend/streamlit/streamlit_app/_page_15_supplier_portal.py` | Supplier portal |
| `frontend/streamlit/streamlit_app/_page_16_knowledge.py` | Knowledge base |
| `frontend/streamlit/streamlit_app/_page_17_logistics.py` | Logistics map |
| `frontend/streamlit/streamlit_app/_page_18_risk.py` | Risk dashboard |
| `frontend/streamlit/streamlit_app/_page_19_admin.py` | Platform Admin |
| `frontend/streamlit/streamlit_app/_page_20_value_chain.py` | Value chain map |
| `frontend/streamlit/streamlit_app/_page_21_materiality.py` | Materiality assessment |
| `frontend/streamlit/streamlit_app/_page_22_targets.py` | Targets + SBTi |
| `frontend/streamlit/streamlit_app/_page_23_value_chain.py` | Value chain (extended) |
| `frontend/streamlit/core/engine.py` | 57-process GHG calculation dispatcher |
| `frontend/streamlit/core/gwp.py` | IPCC AR4/5/6 GWP tables |
| `frontend/streamlit/core/unit_converter.py` | Unit conversion (energy, mass, volume) |
| `frontend/streamlit/core/subroutines.py` | Shared calculation subroutines |
| `frontend/streamlit/ef_store/` | SQLite EF store + ingester + 25+ seed CSV files |
| `frontend/streamlit/modules/` | GHG calculation modules (Scope 1, 2, all 15 Scope 3 cats) |
| `frontend/streamlit/inventory/` | InventoryStore (per-org SQLite activity records) |
| `frontend/streamlit/esg_store/` | ESG data store |
| `frontend/streamlit/outputs/disclosures/` | BRSR, CDP, TCFD, GRI, SASB, ESRS mappers |
| `frontend/streamlit/tests/` | 1200+ pytest tests (test_sprint1.py through test_sprint32.py) |
| `frontend/streamlit/data/initiatives.json` | Demo: 8 reduction initiatives |
| `frontend/streamlit/data/sites.json` | Demo: Acme + GreenTech sites with coordinates |
| `frontend/streamlit/data/review_queue.json` | Demo: review queue seed |

---

### Security fixes applied during integration

**1. Password hashing — SHA-256 → bcrypt**

File: `frontend/streamlit/streamlit_app/auth.py`

| Before | After |
|---|---|
| `import hashlib` | `from passlib.context import CryptContext` |
| `def _hash(pw): return hashlib.sha256(pw.encode()).hexdigest()` | `_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")` |
| `if user["password_hash"] == _hash(password):` | `if user and _verify_password(password, user["password_hash"]):` |

SHA-256 without salt is vulnerable to rainbow table attacks and GPU brute-force.
bcrypt applies an adaptive cost factor and per-password salt, making offline
cracking infeasible for any reasonable password.

A `_verify_password()` function was added that uses `_pwd_ctx.verify()` (constant-time
comparison built into passlib) instead of string equality (`==`).

Fallback: if `passlib` is not installed, the code falls back to SHA-256 to avoid
a hard crash during early development. The `requirements.txt` now pins
`passlib[bcrypt]>=1.7.4` and `bcrypt>=4.0.0` so this fallback should never
trigger in normal use.

**2. CORS wildcard removed from api.py**

File: `frontend/streamlit/api.py`

| Before | After |
|---|---|
| `allow_origins=["*"]` | `allow_origins=_cors_origins` (from env var) |
| `allow_methods=["*"]` | `allow_methods=["POST", "GET"]` |
| `allow_headers=["*"]` | `allow_headers=["Content-Type", "Authorization"]` |

The allowed origins are now read from `SKLITE_API_CORS_ORIGINS` env var
(comma-separated list). Default: `http://localhost:8000,http://localhost:8501`.

---

### Infrastructure changes

**docker-compose.python.yml**

| Before | After |
|---|---|
| 3 services: `streamlit-ghg` (:8501), `streamlit-esg` (:8502), `streamlit-ops` (:8503) | 1 service: `streamlit-sklite` (:8501) |
| Each ran a single stub page | Runs `streamlit run main.py` (full 24-page app) |
| No persistent volume | `sklite_data` named volume for runtime data persistence |

**frontend/streamlit/requirements.txt**

Added:
- `passlib[bcrypt]>=1.7.4`
- `bcrypt>=4.0.0`

**root .gitignore**

Added exclusions for sk.lite runtime data files:
```
frontend/streamlit/data/*.sqlite
frontend/streamlit/data/users.json
frontend/streamlit/data/org_profiles.json
frontend/streamlit/data/suppliers.json
frontend/streamlit/data/supplier_submissions.json
frontend/streamlit/data/logistics.json
frontend/streamlit/data/reviews.sqlite
frontend/streamlit/data/audit.sqlite
frontend/streamlit/streamlit_app/data/*.sqlite
```

**CLAUDE.md** (root)

Updated Streamlit section: now documents sk.lite structure, all 24 pages,
5 auth roles, security invariants, and startup commands.

---

### Commits on `claude/remodel-python-streamlit`

| Hash | Date | Message |
|---|---|---|
| `cb98de7` | 2026-06-19 | `feat: scaffold Python/FastAPI + Streamlit + HTML architecture` |
| `b4c2acd` | 2026-06-19 | `feat(streamlit): replace stub dashboards with sk.lite 24-page app` |
| `f2d7e00` | 2026-06-19 | `chore: remove SQLite binaries committed in streamlit_app/data/` |
| `[current]` | 2026-06-19 | `docs(streamlit): add README, CHANGELOG, and IMPLEMENTATION_GUIDE` |
