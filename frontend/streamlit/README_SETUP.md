# sk.lite — Setup Guide

## Folder structure (what you extract from the tar)

```
ghg_calculator/           ← ROOT — run everything from here
│
├── main.py               ← ENTRY POINT: streamlit run main.py
│
├── streamlit_app/        ← App module (20 pages + helpers)
│   ├── _page_00_setup.py
│   ├── _page_01_scope1.py
│   ├── ...               (pages 02–19)
│   ├── _page_19_admin.py
│   ├── auth.py
│   ├── demo_data.py      ← run this FIRST to seed demo data
│   └── main.py           ← alternative entry point (forwards to root main.py)
│
├── data/                 ← created by demo_data.py
│   ├── org_profiles.json
│   ├── users.json
│   ├── suppliers.json
│   ├── logistics.json
│   ├── sites.json
│   ├── inventory.sqlite  ← seeded by demo_data.py
│   ├── ef_store.sqlite   ← auto-created by app on first run
│   ├── audit.sqlite      ← seeded by demo_data.py
│   └── review.sqlite     ← seeded by demo_data.py
│
├── .streamlit/
│   └── config.toml       ← disables Streamlit auto-page discovery
│
├── core/, modules/, ef_store/, inventory/, outputs/, utils/
└── tests/
```

## What to DELETE from your machine

You may have an `_repo/` folder — **this is your OLD version, delete it entirely**:

```
DELETE: _repo/               ← old partial codebase, causes conflicts
```

The `_repo/streamlit_app/pages/` and `_repo/streamlit_app/_pages/` folders
inside it are the source of the duplicate sidebar problem.
Streamlit auto-discovers any folder named `pages/` and shows its files
as a second broken navigation. The `_` prefix trick prevents this for `_page_XX_`
files, but a folder literally named `pages/` is always discovered.

## What to KEEP (only one copy needed)

```
KEEP: ghg_calculator/        ← the folder from the sprint tar.gz
```

## First-time setup

```bash
cd ghg_calculator

# 1. Install dependencies (once)
pip install -r requirements.txt

# 2. Seed demo data (once, or whenever you want a fresh reset)
python streamlit_app/demo_data.py

# 3. Run the app
streamlit run main.py
```

## Why the underscore prefix on page files?

Files named `_page_XX_*.py` (with leading underscore) are **ignored** by
Streamlit's native multi-page auto-discovery. Navigation is handled entirely
by `main.py` via the `NAV` dictionary and sidebar buttons — giving us full
control over auth, role-based visibility, and org isolation.

A folder named `pages/` (no underscore) IS auto-discovered by Streamlit.
That is why `_repo/streamlit_app/pages/` was causing a broken duplicate sidebar.

## Demo credentials

| Username | Password | Role |
|---|---|---|
| snowkap | Snowkap@2024 | Platform Admin |
| acme_admin | Acme@2024 | Acme Admin |
| acme_contrib | Acme@2024 | Contributor |
| acme_viewer | Acme@2024 | Viewer |
| greentech_admin | GreenTech@2024 | GreenTech Admin |
| supplier1 | Supplier@2024 | Supplier (Alpha Metals) |
