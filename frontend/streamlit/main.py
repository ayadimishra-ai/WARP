"""
sk.lite — Streamlit Application Entry Point.

Run with:
    cd ghg_calculator
    streamlit run main.py

Architecture — single-page app with manual routing:
    This file is at the project ROOT (ghg_calculator/main.py).
    Streamlit only auto-discovers a pages/ directory that sits NEXT TO
    the entry-point file. Since our page modules live in
    streamlit_app/_pages/ (not at root level), Streamlit will not
    auto-discover them, and our sidebar radio is the only navigation.

    To add a page: add one entry to NAV. That is all.

Session state keys:
    st.session_state.org_profile   dict  — org name, year, boundary, GWP
    st.session_state.ef_conn       conn  — EF store SQLite (fresh per render)
    st.session_state.inventory     store — InventoryStore (fresh per render)
"""

import sys
import sqlite3
import importlib
from pathlib import Path

# Project root = directory containing this file
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

import streamlit as st
from streamlit_app.auth import (
    is_logged_in, login_form, logout, get_current_user,
    can, page_allowed, render_user_management, signup_form,
    INDUSTRY_CHOICES,
)

st.set_page_config(
    page_title="sk.lite",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Hide Streamlit's auto-discovered multi-page nav (we use our own sidebar).
# Belt-and-suspenders: config.toml sets hideSidebarNav=true, this CSS
# hides it even on older Streamlit versions that don't support that flag.
# ── Global CSS — theme + nav + layout ─────────────────────────────────────
def _inject_global_css():
    """Inject global CSS. config.toml is now light-base so native Streamlit
    components are already light. This CSS adds dark-mode overrides when the
    user toggles the theme, plus permanent nav styling."""
    _is_light = st.session_state.get("_sk_theme", "light") == "light"

    # Colour tokens — light is the default
    _bg      = "#f8fafc" if _is_light else "#0e1117"
    _sb_bg   = "#f1f5f9" if _is_light else "#1a1f2e"
    _txt     = "#1e293b" if _is_light else "#e2e8f0"
    _txt_dim = "#64748b" if _is_light else "#94a3b8"
    _border  = "#e2e8f0" if _is_light else "#334155"
    _btn_sec_txt = "#475569" if _is_light else "#94a3b8"
    _inp_bg  = "#ffffff"  if _is_light else "#1c2a38"
    _inp_tx  = "#1e293b"  if _is_light else "#e2e8f0"
    _inp_bd  = "#cbd5e1"  if _is_light else "#334155"
    _inp_foc = "#0f4c81"  if _is_light else "#3b82f6"

    st.markdown(f"""
<style>
/* ── Hide Streamlit auto-nav ── */
[data-testid="stSidebarNav"] {{display:none !important;}}
section[data-testid="stSidebar"] > div:first-child > div:first-child ul {{display:none !important;}}

/* ── App background ── */
.stApp,
[data-testid="stAppViewContainer"] {{
    background-color: {_bg} !important;
}}

/* ── Sidebar ── */
section[data-testid="stSidebar"] {{
    background-color: {_sb_bg} !important;
}}
section[data-testid="stSidebar"] p,
section[data-testid="stSidebar"] span:not(.st-emotion-cache-pkbazv),
section[data-testid="stSidebar"] label {{
    color: {_txt} !important;
}}

/* ── Nav buttons ── */
section[data-testid="stSidebar"] .stButton button {{
    background: transparent !important;
    border: none !important;
    color: {_btn_sec_txt} !important;
    text-align: left !important;
    padding: 4px 10px !important;
    font-size: 0.85rem !important;
    width: 100% !important;
    border-radius: 6px !important;
}}
section[data-testid="stSidebar"] .stButton [data-testid="baseButton-primary"],
section[data-testid="stSidebar"] .stButton button[data-testid="baseButton-primary"] {{
    background: #0f4c81 !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    border-left: 3px solid #60a5fa !important;
}}
section[data-testid="stSidebar"] .stButton button:hover {{
    background: {'#e2e8f0' if _is_light else '#1e3a5f'} !important;
    color: {_txt} !important;
}}

/* ── Text / metrics ── */
[data-testid="stMetricValue"] {{ color: {_txt} !important; }}
[data-testid="stMetricLabel"] {{ color: {_txt_dim} !important; }}
[data-testid="stMarkdownContainer"] p,
[data-testid="stMarkdownContainer"] li,
[data-testid="stMarkdownContainer"] h1,
[data-testid="stMarkdownContainer"] h2,
[data-testid="stMarkdownContainer"] h3,
[data-testid="stMarkdownContainer"] h4 {{
    color: {_txt};
}}

/* ── ALL INPUT FIELDS ── */
input,
textarea,
[data-baseweb="input"] input,
[data-baseweb="textarea"] textarea,
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stNumberInput"] input,
[data-testid="stPasswordInput"] input,
[data-testid="stChatInput"] textarea,
div[data-baseweb="input"] > div,
div[data-baseweb="base-input"] > input {{
    background-color: {_inp_bg} !important;
    color: {_inp_tx} !important;
    -webkit-text-fill-color: {_inp_tx} !important;
    border-color: {_inp_bd} !important;
    caret-color: {_inp_tx} !important;
}}
/* Filled / active state — prevent browser autofill from overriding */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {{
    -webkit-box-shadow: 0 0 0 100px {_inp_bg} inset !important;
    -webkit-text-fill-color: {_inp_tx} !important;
}}
/* Selectbox / multiselect containers */
[data-testid="stSelectbox"] [data-baseweb="select"] > div:first-child,
[data-testid="stMultiSelect"] [data-baseweb="select"] > div:first-child {{
    background-color: {_inp_bg} !important;
    color: {_inp_tx} !important;
    border-color: {_inp_bd} !important;
}}
/* Dropdown menu options */
[data-baseweb="popover"] li,
[data-baseweb="menu"] li,
[role="option"] {{
    background-color: {_inp_bg} !important;
    color: {_inp_tx} !important;
}}
/* Remove blue focus ring / blue panel on inputs */
[data-baseweb="input"]:focus-within,
[data-baseweb="textarea"]:focus-within,
[data-testid="stTextInput"]:focus-within,
[data-testid="stTextArea"]:focus-within {{
    border-color: {_inp_foc} !important;
    box-shadow: 0 0 0 2px {'rgba(15,76,129,0.2)' if _is_light else 'rgba(59,130,246,0.2)'} !important;
    outline: none !important;
}}
/* Remove any blue side-panel/left-border highlight on inputs */
[data-baseweb="input"] {{
    border-left-color: {_inp_bd} !important;
    box-shadow: none !important;
}}
[data-baseweb="input"]:focus-within {{
    border-left-color: {_inp_foc} !important;
}}

/* ── Inline HTML cards ── */
.sk-card {{ color: #1f2937 !important; }}
.sk-card * {{ color: #1f2937 !important; }}
.sk-card td, .sk-card th {{ color: #1f2937 !important; padding: 4px 8px; }}

/* ── Dividers ── */
hr {{ border-color: {_border} !important; opacity: 0.4; }}

/* ── ALL buttons: override dark-on-click / black-active bug ── */
/* Primary buttons (Sign in, Save, Submit, type="primary") */
.stButton > button[kind="primary"],
.stButton > button[data-testid="baseButton-primary"],
[data-testid="stFormSubmitButton"] > button,
.stForm button[type="submit"],
button[kind="primary"] {{
    background-color: #38bdf8 !important;
    border-color: #38bdf8 !important;
    color: #0c4a6e !important;
    font-weight: 700 !important;
}}
.stButton > button[kind="primary"]:hover,
.stButton > button[data-testid="baseButton-primary"]:hover,
[data-testid="stFormSubmitButton"] > button:hover {{
    background-color: #0ea5e9 !important;
    border-color: #0ea5e9 !important;
    color: #ffffff !important;
}}
.stButton > button[kind="primary"]:active,
.stButton > button[kind="primary"]:focus,
.stButton > button[data-testid="baseButton-primary"]:active,
.stButton > button[data-testid="baseButton-primary"]:focus,
[data-testid="stFormSubmitButton"] > button:active,
[data-testid="stFormSubmitButton"] > button:focus {{
    background-color: #0284c7 !important;
    border-color: #0284c7 !important;
    color: #ffffff !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.4) !important;
}}

/* Secondary buttons */
.stButton > button[kind="secondary"],
.stButton > button[data-testid="baseButton-secondary"] {{
    background-color: {'#ffffff' if _is_light else '#1e293b'} !important;
    border: 1px solid {'#cbd5e1' if _is_light else '#334155'} !important;
    color: {'#1e293b' if _is_light else '#e2e8f0'} !important;
}}
.stButton > button[kind="secondary"]:hover,
.stButton > button[data-testid="baseButton-secondary"]:hover {{
    background-color: {'#f1f5f9' if _is_light else '#334155'} !important;
    border-color: {'#94a3b8' if _is_light else '#475569'} !important;
    color: {'#0f172a' if _is_light else '#f8fafc'} !important;
}}
.stButton > button[kind="secondary"]:active,
.stButton > button[kind="secondary"]:focus,
.stButton > button[data-testid="baseButton-secondary"]:active {{
    background-color: {'#e2e8f0' if _is_light else '#475569'} !important;
    color: {'#0f172a' if _is_light else '#f8fafc'} !important;
    outline: none !important;
}}

/* Download buttons */
.stDownloadButton > button {{
    background-color: #2563eb !important;
    color: #ffffff !important;
    border: none !important;
}}
.stDownloadButton > button:hover {{
    background-color: #1d4ed8 !important;
}}
.stDownloadButton > button:active,
.stDownloadButton > button:focus {{
    background-color: #1e40af !important;
    color: #ffffff !important;
}}
</style>
""", unsafe_allow_html=True)
_inject_global_css()

# ---------------------------------------------------------------------------
# Auth gate — show login form if not signed in
# ---------------------------------------------------------------------------

_AUTH_ENABLED = True   # set False to disable auth entirely

if _AUTH_ENABLED and not is_logged_in():
    # Sign-in is light by default (config.toml base=light)
    _l, _m, _r = st.columns([1, 3, 1])
    with _m:
        st.markdown("# 🌱 sk.lite")
        st.markdown("### Climate Intelligence Platform")
        st.markdown("---")
        _auth_tab1, _auth_tab2 = st.tabs(["🔑 Sign in", "✨ Create account"])
        with _auth_tab1:
            login_form()
        with _auth_tab2:
            if signup_form():
                st.success("✅ Account created! Signing you in…")
                st.rerun()
    st.stop()


# ---------------------------------------------------------------------------
# Database paths
# ---------------------------------------------------------------------------

EF_DB_PATH  = ROOT / "data" / "ef_store.sqlite"
INV_DB_PATH = ROOT / "data" / "inventory.sqlite"


# ---------------------------------------------------------------------------
# EF store — seed once per server start, cached at process level
# ---------------------------------------------------------------------------

@st.cache_resource
def _ensure_ef_db_seeded(db_path: str) -> str:
    from ef_store.db import setup_db
    from ef_store.ingester import ingest_all_seeds, ingest_sasb_metrics
    conn = setup_db(db_path)
    row = conn.execute("SELECT COUNT(*) FROM emission_factors").fetchone()
    if row[0] == 0:
        ingest_all_seeds(conn, force=False)
    # Always check SASB — may be missing on DBs from before Sprint 11
    try:
        n_sasb = conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
        if n_sasb == 0:
            ingest_sasb_metrics(conn)
    except Exception as _pe:
        # Even if profile.json fails, force org_id from the logged-in user
        # so data entry still works correctly
        try:
            if _user_org and _user_org != "default":
                st.session_state.org_profile["org_uuid"] = _user_org
                st.session_state.org_profile["org_id"]   = _user_org
                st.session_state.org_profile["setup_done"] = True
                st.session_state.inventory = get_inventory()
        except Exception:
            pass
    conn.close()
    return db_path


_ensure_ef_db_seeded(str(EF_DB_PATH))


# ---------------------------------------------------------------------------
# Per-render connection factories
# Fresh connections every render so the dashboard always sees latest writes.
# ---------------------------------------------------------------------------

def get_ef_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(EF_DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def get_inventory():
    from inventory.store import get_store
    profile = st.session_state.get("org_profile", {})
    org_key = (
        profile.get("org_uuid") or
        profile.get("org_id")
    )
    # Fallback: read from auth user directly (always correct after login)
    if not org_key or org_key == "default":
        try:
            _au = st.session_state.get("_auth_user") or {}
            org_key = _au.get("org_uuid", "") or org_key
        except Exception:
            pass
    return get_store(path=str(INV_DB_PATH), org_id=org_key or "default")


# Refresh every render — keeps dashboard live after every save
st.session_state.ef_conn   = get_ef_conn()
st.session_state.inventory = get_inventory()


# ---------------------------------------------------------------------------
# Default org profile
# ---------------------------------------------------------------------------

if "org_profile" not in st.session_state:
    st.session_state.org_profile = {
        "org_name":         "",
        "org_uuid":         "",
        "org_id":           "default",
        "reporting_year":   2024,
        "fiscal_year":      "2023-24",
        "primary_country":  "IN",
        "gwp_ar":           6,
        "boundary":         "operational_control",
        "currency":         "INR",
        "fx_to_usd":        0.012,
        "revenue_inr_cr":   0.0,
        "employees":        0,
        "production_unit":  "",
        "production_volume":0.0,
        "setup_done":       False,
    }

# Restore the most recently saved profile on cold start
# Load org profile for the logged-in user
_cur = get_current_user() or {}
_user_org = _cur.get("org_uuid", "")
if not st.session_state.org_profile.get("org_uuid") or (
        _user_org and st.session_state.org_profile.get("org_uuid") != _user_org):
    try:
        import json as _jj
        _pf = ROOT / "data" / "org_profiles.json"
        if _pf.exists() and _user_org:
            _all = _jj.loads(_pf.read_text(encoding="utf-8"))
            if _user_org in _all:
                _prof = _all[_user_org]
                _prof["org_uuid"] = _user_org
                _prof["setup_done"] = True
                st.session_state.org_profile.update(_prof)
                st.session_state.inventory = get_inventory()
            else:
                from streamlit_app._page_00_setup import _load_profile_on_startup
                _load_profile_on_startup()
                st.session_state.inventory = get_inventory()
        else:
            from streamlit_app._page_00_setup import _load_profile_on_startup
            _load_profile_on_startup()
            st.session_state.inventory = get_inventory()
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Navigation — single source of truth.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Navigation — grouped by workflow cluster.
# Section labels injected as markdown above the radio widget.
# ---------------------------------------------------------------------------

NAV = {
    # ── Configure ──────────────────────────────────────────────────────────
    "⚙️  Setup":               "streamlit_app._page_00_setup",
    "🗄️  EF manager":          "streamlit_app._page_05_ef_manager",
    "👥  Users":               "__user_management__",
    # ── GHG Inventory ─────────────────────────────────────────────────────
    "🔥  Scope 1 — Direct":    "streamlit_app._page_01_scope1",
    "⚡  Scope 2 — Electricity":"streamlit_app._page_02_scope2",
    "🔗  Scope 3 — Value chain":"streamlit_app._page_03_scope3",
    "📋  Data manager":        "streamlit_app._page_07_inventory",
    "🌱  Initiatives":         "streamlit_app._page_08_initiatives",
    # ── Analysis ──────────────────────────────────────────────────────────
    "📊  Emissions dashboard":  "streamlit_app._page_04_dashboard",
    "🎯  Target register":      "streamlit_app._page_22_targets",
    "🏢  Supplier & ESG":       "streamlit_app._page_11_supplier",
    "🌉  ESG bridge":           "streamlit_app._page_13_esg_bridge",
    "⚠️  Risk dashboard":      "streamlit_app._page_18_risk",
    "🗺️  Logistics map":        "streamlit_app._page_17_logistics",
    "🌐  Value chain map":      "streamlit_app._page_20_value_chain",
    "🏭  Supplier network":     "streamlit_app._page_23_value_chain",
    # ── Reporting ──────────────────────────────────────────────────────────
    "📤  Export & disclosures": "streamlit_app._page_06_export",
    "📝  ESG data points":      "streamlit_app._page_20_esg_datapoints",
    "🏭  SASB standards":       "streamlit_app._page_10_sasb",
    "✅  Checklist":            "streamlit_app._page_09_checklist",
    "🔄  Review queue":         "streamlit_app._page_14_review",
    # ── Governance ────────────────────────────────────────────────────────
    "📜  Audit trail":          "streamlit_app._page_12_audit",
    "⚖️  Materiality":          "streamlit_app._page_21_materiality",
    "📚  Knowledge base":       "streamlit_app._page_16_knowledge",
    "🏪  Supplier portal":      "streamlit_app._page_15_supplier_portal",
    "🏢  Platform Admin":       "streamlit_app._page_19_admin",
}

# Section headers shown before these pages in the sidebar
_NAV_SECTIONS = {
    "⚙️  Setup":               "CONFIGURE",
    "🔥  Scope 1 — Direct":    "GHG INVENTORY",
    "📊  Emissions dashboard":  "ANALYSIS",
    "📤  Export & disclosures": "REPORTING",
    "📜  Audit trail":          "GOVERNANCE",
}


# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------

with st.sidebar:
    st.markdown("## 🌱 sk.lite")

    profile  = st.session_state.org_profile
    org_name = profile.get("org_name", "")

    if org_name:
        st.markdown(f"**{org_name}**")
        st.caption(
            f"FY {profile.get('fiscal_year', profile.get('reporting_year', 2024))}  ·  "
            f"AR{profile.get('gwp_ar', 6)}  ·  {profile.get('primary_country', 'IN')}"
        )
        try:
            inv = st.session_state.inventory
            # Use org_uuid (primary) with fallback chain to find records
            _qorg = (profile.get("org_uuid") or
                     profile.get("org_id") or "default")
            s = inv.get_summary(
                org_id=_qorg,
                inventory_year=profile.get("reporting_year", 2024),
            )
            # If nothing found with uuid, try org_id directly  
            if s.get("n_records", 0) == 0 and _qorg != profile.get("org_id",""):
                s = inv.get_summary(
                    org_id=profile.get("org_id","default"),
                    inventory_year=profile.get("reporting_year", 2024),
                )
            if s.get("n_records", 0) > 0:
                _s1  = s.get("scope1_t_co2e", 0) or 0
                _s2  = s.get("scope2_t_co2e", 0) or 0
                _s3  = s.get("scope3_t_co2e", 0) or 0
                _tot = s.get("total_t_co2e", 0) or 0
                _nr  = s.get("n_records", 0)
                # Theme-aware sidebar summary card
                _card_bg   = "#f1f5f9" if _is_light else "#1e3a5f"
                _card_txt  = "#1e293b" if _is_light else "#e2e8f0"
                _card_dim  = "#64748b" if _is_light else "#94a3b8"
                _card_bdr  = "#e2e8f0" if _is_light else "#334155"
                _card_val  = "#0f172a" if _is_light else "#f8fafc"
                st.markdown(
                    f"<div style='background:{_card_bg};border-radius:8px;"
                    f"padding:8px 10px;margin:4px 0;border:1px solid {_card_bdr}'>"
                    f"<div style='font-size:10px;color:{_card_dim};font-weight:700;"
                    f"letter-spacing:0.06em;margin-bottom:4px'>GHG INVENTORY</div>"
                    f"<div style='display:grid;grid-template-columns:1fr 1fr 1fr;"
                    f"gap:4px;text-align:center'>"
                    f"<div><div style='font-size:9px;color:{_card_dim}'>S1</div>"
                    f"<div style='font-size:13px;font-weight:700;color:{_card_val}'>"
                    f"{_s1:,.0f}</div></div>"
                    f"<div><div style='font-size:9px;color:{_card_dim}'>S2</div>"
                    f"<div style='font-size:13px;font-weight:700;color:{_card_val}'>"
                    f"{_s2:,.0f}</div></div>"
                    f"<div><div style='font-size:9px;color:{_card_dim}'>S3</div>"
                    f"<div style='font-size:13px;font-weight:700;color:{_card_val}'>"
                    f"{_s3:,.0f}</div></div>"
                    f"</div>"
                    f"<div style='font-size:10px;color:{_card_dim};margin-top:4px;"
                    f"border-top:1px solid {_card_bdr};padding-top:4px'>"
                    f"Total: <b style='color:{_card_val}'>{_tot:,.0f} tCO₂e</b>"
                    f" · {_nr} records</div>"
                    f"</div>",
                    unsafe_allow_html=True,
                )
        except Exception:
            pass
    else:
        st.info("👆 Start with **⚙️  Setup**")

    # ── Theme toggle ────────────────────────────────────────────────────
    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _theme_label = "🌙 Dark mode" if _is_light else "☀️ Light mode"
    if st.button(_theme_label, key="theme_toggle", use_container_width=True):
        st.session_state["_sk_theme"] = "dark" if _is_light else "light"
        _inject_global_css()   # re-inject immediately before rerun
        st.rerun()

    st.markdown("---")

    # Single radio — clean, stateful, no rerun issues
    # Filter nav items by role
    visible_pages = [p for p in NAV.keys() if page_allowed(p)]
    # Render section headers between groups
    for section_page, header in _NAV_SECTIONS.items():
        if section_page in visible_pages:
            idx = visible_pages.index(section_page)
            _ = idx  # used conceptually — headers injected via markdown

    # ── Grouped nav with section headers ────────────────────────────────
    # Architecture: sidebar.markdown for section headers, sidebar.button
    # for each page. Active page = primary style, others = secondary.
    # Page stored in session_state["_nav_page"].
    _SECTION_ORDER = ["CONFIGURE", "GHG INVENTORY", "ANALYSIS", "REPORTING", "GOVERNANCE"]
    _section_pages: dict[str, list[str]] = {s: [] for s in _SECTION_ORDER}
    _current_section = _SECTION_ORDER[0]
    for _pg in visible_pages:
        if _pg in _NAV_SECTIONS:
            _current_section = _NAV_SECTIONS[_pg]
        _section_pages.setdefault(_current_section, []).append(_pg)

    _SECTION_ICONS = {
        "CONFIGURE":    "⚙️",
        "GHG INVENTORY":"🔥",
        "ANALYSIS":     "📊",
        "REPORTING":    "📤",
        "GOVERNANCE":   "📜",
    }

    # Initialise nav state
    if "_nav_page" not in st.session_state or             st.session_state["_nav_page"] not in visible_pages:
        st.session_state["_nav_page"] = visible_pages[0] if visible_pages else ""

    _active = st.session_state["_nav_page"]

    # Nav button styling: handled by _inject_global_css() at top of script

    for _section in _SECTION_ORDER:
        _sec_pages = _section_pages.get(_section, [])
        if not _sec_pages:
            continue
        # Section header (non-clickable, greyed)
        _icon = _SECTION_ICONS.get(_section, "")
        st.markdown(
            f"<p style='color:#9ca3af;font-size:0.68rem;font-weight:700;"
            f"letter-spacing:0.09em;text-transform:uppercase;"
            f"margin:10px 0 1px 4px'>{_icon} {_section}</p>",
            unsafe_allow_html=True,
        )
        # One button per page in section
        for _pg in _sec_pages:
            _is_active = (_pg == _active)
            # Prefix active page with a visual marker in the label
            _btn_label = ("▶ " + _pg) if _is_active else ("   " + _pg)
            _btn_key   = f"nav_btn_{_pg[:35].replace(' ','_').replace('—','').replace('/','_')}"
            if st.button(
                _btn_label,
                key=_btn_key,
                use_container_width=True,
                type="primary" if _is_active else "secondary",
            ):
                st.session_state["_nav_page"] = _pg
                st.rerun()

    page = st.session_state["_nav_page"]
    st.markdown("---")
    # User info + logout
    u = get_current_user()
    if u:
        # Notification bell
        try:
            from streamlit_app.auth import get_notification_count
            org_id_notif = st.session_state.get("org_profile", {}).get("org_id", "default")
            n_notif = get_notification_count(org_id_notif)
            notif_str = f" 🔔 {n_notif}" if n_notif > 0 else ""
            st.caption(f"{u.get('display_name', u['username'])} · {u['role']}{notif_str}")
        except Exception:
            st.caption(f"{u.get('display_name', u['username'])} · {u['role']}")
        if st.button("Sign out", key="auth_logout", use_container_width=True):
            logout()
    st.caption("v1.0  ·  sk.lite  ·  20 pages")


# ---------------------------------------------------------------------------
# Global admin impersonation banner — shown on EVERY page when active
# ---------------------------------------------------------------------------
_admin_viewing = st.session_state.get("_admin_viewing_org")
if _admin_viewing:
    _av_name = st.session_state.get("_admin_viewing_org_name", _admin_viewing)
    st.warning(
        f"👁 **Platform Admin view** — you are currently viewing data as "
        f"**{_av_name}** (`{_admin_viewing}`). "
        f"Navigate to Platform Admin and click 'Return to own view' to exit.",
        icon="⚠️",
    )

# ---------------------------------------------------------------------------
# Page dispatch — import the selected module and call render()
# ---------------------------------------------------------------------------

try:
    _page_mod = NAV.get(page, "")
    if _page_mod == "__user_management__":
        render_user_management()
    else:
        mod = importlib.import_module(_page_mod)
        mod.render()
except KeyError:
    st.error(f"No module mapped for '{page}'. Check NAV in main.py.")
except ModuleNotFoundError as e:
    st.warning(f"Page module not found: {e}")
except Exception as e:
    st.error(f"Page error: {e}")
    st.exception(e)
