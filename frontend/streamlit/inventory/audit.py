"""
audit.py — Immutable AuditEvent log.

Every material action (save, delete, lock, disclose, login, role change)
is written as an INSERT-only row. No UPDATE or DELETE ever touches this table.
Provides the evidence chain needed for assurance and BRSR/CDP audits.
"""
from __future__ import annotations
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

AUDIT_SCHEMA = """
CREATE TABLE IF NOT EXISTS audit_events (
    event_id        TEXT PRIMARY KEY,
    event_type      TEXT NOT NULL,   -- save_record | delete_record | lock_year |
                                     -- unlock_year | login | logout | role_change |
                                     -- export | disclose | supplier_edit | tag_edit
    actor_username  TEXT NOT NULL,
    actor_role      TEXT,
    org_id          TEXT,
    inventory_year  INTEGER,
    entity_id       TEXT,            -- record_id / supplier name / year locked
    entity_type     TEXT,            -- emission_record | supplier | snapshot | user
    summary         TEXT NOT NULL,   -- human-readable one-liner
    detail_json     TEXT,            -- full payload for forensics
    ip_address      TEXT,
    created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_org
    ON audit_events (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_type
    ON audit_events (event_type, created_at DESC);
"""

_DEFAULT_DB = Path(__file__).parents[1] / "data" / "audit.sqlite"


def _get_conn(path: Optional[str] = None) -> sqlite3.Connection:
    p = Path(path) if path else _DEFAULT_DB
    p.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(p), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(AUDIT_SCHEMA)
    conn.commit()
    return conn


def log_event(
    event_type: str,
    summary: str,
    actor_username: str = "system",
    actor_role: Optional[str] = None,
    org_id: Optional[str] = None,
    inventory_year: Optional[int] = None,
    entity_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    detail: Optional[dict] = None,
    db_path: Optional[str] = None,
) -> str:
    """Write one immutable AuditEvent. Returns event_id."""
    conn = _get_conn(db_path)
    event_id = str(uuid.uuid4())
    conn.execute(
        """
        INSERT INTO audit_events (
            event_id, event_type, actor_username, actor_role,
            org_id, inventory_year, entity_id, entity_type,
            summary, detail_json, created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """,
        (
            event_id, event_type, actor_username, actor_role,
            org_id, inventory_year, entity_id, entity_type,
            summary,
            json.dumps(detail or {}, default=str),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()
    return event_id


def get_events(
    org_id: Optional[str] = None,
    event_type: Optional[str] = None,
    actor: Optional[str] = None,
    limit: int = 200,
    db_path: Optional[str] = None,
) -> list[dict]:
    """Return recent audit events, newest first."""
    conn = _get_conn(db_path)
    where, params = [], []
    if org_id:
        where.append("org_id = ?"); params.append(org_id)
    if event_type:
        where.append("event_type = ?"); params.append(event_type)
    if actor:
        where.append("actor_username = ?"); params.append(actor)
    w = ("WHERE " + " AND ".join(where)) if where else ""
    rows = conn.execute(
        f"SELECT * FROM audit_events {w} ORDER BY created_at DESC LIMIT ?",
        params + [limit],
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Streamlit integration helper
# ---------------------------------------------------------------------------

def _actor() -> tuple[str, Optional[str]]:
    """Return (username, role) from Streamlit session state."""
    try:
        import streamlit as st
        u = st.session_state.get("_auth_user")
        if u:
            return u.get("username", "unknown"), u.get("role")
    except Exception:
        pass
    return "system", None


def audit(
    event_type: str,
    summary: str,
    org_id: Optional[str] = None,
    inventory_year: Optional[int] = None,
    entity_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    detail: Optional[dict] = None,
) -> None:
    """One-call audit helper — pulls actor from Streamlit session."""
    username, role = _actor()
    log_event(
        event_type=event_type,
        summary=summary,
        actor_username=username,
        actor_role=role,
        org_id=org_id,
        inventory_year=inventory_year,
        entity_id=entity_id,
        entity_type=entity_type,
        detail=detail,
    )
