"""
_org_helper: single source of truth for org_id resolution across all pages.
Every page that reads or writes inventory imports from here.
"""
import sqlite3
from pathlib import Path

_DATA_DIR = Path(__file__).parents[1] / "data"
_INV_DB   = _DATA_DIR / "inventory.sqlite"


def resolve_org_id(profile: dict = None) -> str:
    """
    Resolve org_id in this order:
      1. profile["org_uuid"]   -- active "view-as" context (Platform Admin can switch)
      2. profile["org_id"]     -- fallback
      3. _auth_user.org_uuid   -- login identity (used when profile not yet loaded)
    """
    if profile:
        org = profile.get("org_uuid") or profile.get("org_id") or ""
        if org and org != "default":
            return org
    try:
        import streamlit as st
        _u = st.session_state.get("_auth_user") or {}
        org = _u.get("org_uuid", "")
        if org and org != "default":
            return org
    except Exception:
        pass
    return ""


def get_inv_store(org_id: str = None, profile: dict = None):
    """Open a fresh InventoryStore for the given org_id."""
    from inventory.store import get_store
    oid = org_id or resolve_org_id(profile) or "default"
    return get_store(path=str(_INV_DB), org_id=oid)


def fix_page(profile: dict, inv_store=None):
    """
    Call at the top of every page render(). Returns (org_id, inventory).
    """
    org_id = resolve_org_id(profile)
    if not org_id or org_id == "default":
        return "", inv_store
    inventory = get_inv_store(org_id)
    return org_id, inventory


def _open_db():
    cn = sqlite3.connect(str(_INV_DB), timeout=30.0)
    try:
        cn.execute("PRAGMA busy_timeout=30000")
    except Exception:
        pass
    return cn


def direct_summary(org_id: str, inv_year: int) -> dict:
    """Direct-SQL summary; works even if InventoryStore session is broken."""
    if not org_id or org_id == "default":
        return {"n_records": 0, "total_t_co2e": 0,
                "scope1_t_co2e": 0, "scope2_t_co2e": 0, "scope3_t_co2e": 0,
                "n_fallback_records": 0, "biogenic_t_co2": 0}
    try:
        cn = _open_db()
        r = cn.execute("""
            SELECT COUNT(*),
                   COALESCE(SUM(t_CO2e), 0),
                   COALESCE(SUM(CASE WHEN scope='Scope 1' THEN t_CO2e ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN scope='Scope 2' THEN t_CO2e ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN scope='Scope 3' THEN t_CO2e ELSE 0 END), 0),
                   COUNT(CASE WHEN fallback_triggered=1 THEN 1 END),
                   COALESCE(SUM(kg_CO2_biogenic)/1000.0, 0)
            FROM emission_results WHERE org_id=? AND inventory_year=?
        """, (org_id, inv_year)).fetchone()
        cn.close()
        if not r:
            return {"n_records": 0}
        return {
            "n_records":          int(r[0] or 0),
            "total_t_co2e":       round(float(r[1] or 0), 4),
            "scope1_t_co2e":      round(float(r[2] or 0), 4),
            "scope2_t_co2e":      round(float(r[3] or 0), 4),
            "scope3_t_co2e":      round(float(r[4] or 0), 4),
            "n_fallback_records": int(r[5] or 0),
            "biogenic_t_co2":     round(float(r[6] or 0), 4),
        }
    except Exception:
        return {"n_records": 0}


def direct_records(org_id: str, inv_year: int, scope: str = None) -> list:
    """Direct-SQL records by scope (kept for backward-compat with older callers)."""
    if not org_id or org_id == "default":
        return []
    try:
        cn = _open_db()
        cn.row_factory = sqlite3.Row
        sql = "SELECT * FROM emission_results WHERE org_id=? AND inventory_year=?"
        params = [org_id, inv_year]
        if scope:
            sql += " AND scope=?"
            params.append(scope)
        rows = cn.execute(sql, params).fetchall()
        cn.close()
        return [dict(r) for r in rows]
    except Exception:
        return []


def direct_all_records(org_id: str, inv_year: int) -> list:
    """All records for this org/year — used by data manager."""
    return direct_records(org_id, inv_year)


def direct_years_available(org_id: str) -> list:
    """List of inventory years that have data for this org."""
    if not org_id or org_id == "default":
        return []
    try:
        cn = _open_db()
        rows = cn.execute(
            "SELECT DISTINCT inventory_year FROM emission_results "
            "WHERE org_id=? ORDER BY inventory_year DESC",
            (org_id,)
        ).fetchall()
        cn.close()
        return [int(r[0]) for r in rows if r[0] is not None]
    except Exception:
        return []


def safe_get_all_records(inventory, org_id: str, inv_year: int) -> list:
    """Try InventoryStore first, fall back to direct SQL if it returns nothing."""
    try:
        if inventory and hasattr(inventory, "get_all_records"):
            recs = inventory.get_all_records(org_id=org_id, inventory_year=inv_year)
            if recs:
                return recs
    except Exception:
        pass
    return direct_all_records(org_id, inv_year)


def safe_get_summary(inventory, org_id: str, inv_year: int) -> dict:
    """Try InventoryStore.get_summary, fall back to direct SQL."""
    try:
        if inventory and hasattr(inventory, "get_summary"):
            s = inventory.get_summary(org_id=org_id, inventory_year=inv_year)
            if s and s.get("n_records", 0) > 0:
                return s
    except Exception:
        pass
    return direct_summary(org_id, inv_year)
