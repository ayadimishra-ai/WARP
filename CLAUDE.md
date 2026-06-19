# CLAUDE.md — Snowkap ESG Platform (Python Remodel Branch)

This branch (`claude/remodel-python-streamlit`) is the full architectural rewrite of the Snowkap stack to Python/FastAPI + Streamlit + HTML.

## New Architecture

| Layer | Technology | Path |
|---|---|---|
| Backend API | FastAPI (Python 3.12) | `backend/` |
| Dashboards | Streamlit | `frontend/streamlit/` |
| Auth / Form UI | HTML + Jinja2 templates | `frontend/templates/` |
| Static assets | Vanilla CSS + JS | `frontend/static/` |
| Database | PostgreSQL via SQLAlchemy + Alembic | `backend/app/db/`, `backend/alembic/` |
| GraphQL (transitional) | Hasura (kept during migration) | `apps/hasura/` |

## Legacy reference code (DO NOT RUN — reference only)

| Path | What it was |
|---|---|
| `apps/` + `packages/` | WARP — Next.js 14 Pages Router |
| `ops/` | OPS — Next.js 15 App Router |
| `spa/` | SPA — React CRA portal shell |
| `monorepo/` | Next-gen unified Next.js 15 App Router |

All security fixes are documented in `docs/warp/`, `docs/ops/`, `docs/spa/`, `docs/monorepo/`. Port those fixes into Python equivalents — do NOT reintroduce the same bugs.

## Backend — FastAPI (`backend/`)

### Commands
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload          # dev server :8000
alembic upgrade head               # run migrations
alembic revision --autogenerate -m "description"
```

### Structure
```
backend/
├── main.py                 ← FastAPI app, CORS, router mounting
├── app/
│   ├── api/
│   │   ├── auth/           ← /api/v1/auth/*
│   │   ├── warp/           ← /api/v1/warp/*
│   │   ├── ops/            ← /api/v1/ops/*
│   │   └── platform/       ← /api/v1/platform/*
│   ├── models/             ← SQLAlchemy ORM models
│   ├── schemas/            ← Pydantic request/response schemas
│   ├── services/           ← Business logic (aws, email, rara)
│   ├── db/session.py       ← Async engine + get_db dependency
│   ├── core/config.py      ← Pydantic Settings
│   └── guards/auth.py      ← JWT bearer guard + role guard
├── alembic/                ← DB migrations
└── requirements.txt
```

### Critical invariants
- **JWT**: always `decode_token()` with full verification — never `jwt.get_unverified_claims()`
- **Secrets**: always `hmac.compare_digest()` — never `==` on secret strings
- **RARA URL/key**: fetch from DB (`GlobalMaster` table) — never from request body (SSRF)
- **CORS**: `allow_origins=[settings.PARENT_ORIGIN]` — never `["*"]`
- **Errors**: `{"detail": "message"}` only — never stack traces or DB internals
- **S3**: verify JWT before any S3 operation
- **OTP**: never include OTP value in API response

### Auth pattern
```python
from app.guards.auth import get_current_user
from fastapi import Depends

@router.post("/endpoint")
async def my_endpoint(user: dict = Depends(get_current_user)) -> dict:
    ...
```

## Streamlit Dashboards (`frontend/streamlit/`)

```bash
cd frontend/streamlit
pip install -r requirements.txt
streamlit run ghg/dashboard.py          # :8501
streamlit run esg/score_dashboard.py    # :8502
streamlit run ops/monthly_activity.py  # :8503
```

Dashboards receive auth token via URL query param `?token=<JWT>&org_id=<UUID>`.

## Docker Compose
```bash
docker-compose -f docker-compose.python.yml up
```
Ports: backend :8000, hasura :8080, postgres :5432, streamlit :8501-8503

## Build backlog (priority order)
1. SQLAlchemy models (from `docs/warp/database-schema.md`)
2. Auth signin — DB lookup + JWT issuance
3. ESG score calculator — port JSONata engine to Python
4. Save answers + submit form endpoints
5. OPS activity CRUD + emission aggregation
6. Email service (aiosmtplib)
7. S3 service (boto3)
8. HTML form templates for assessment pages
