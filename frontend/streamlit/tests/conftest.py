"""
sk.lite — shared pytest fixtures.

Provides:
  db_conn   — open SQLite connection to the seeded EF store
  inv_store — fresh in-memory-like inventory store (temp file, cleaned up after test)
  make_record — factory helper for ActivityRecord
"""
from __future__ import annotations
import os
import tempfile
import uuid

import pytest


# ---------------------------------------------------------------------------
# db_conn — shared EF database connection
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def db_conn():
    """
    Session-scoped connection to the seeded emission-factor SQLite database.
    Shared across all tests in the session for speed; never written to by tests.
    """
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parents[1]))

    from ef_store.db import setup_db
    db_path = Path(__file__).parents[1] / "data" / "ef_store.sqlite"
    conn = setup_db(str(db_path))
    yield conn
    conn.close()


# ---------------------------------------------------------------------------
# inv_store — fresh per-test inventory store
# ---------------------------------------------------------------------------

@pytest.fixture
def inv_store():
    """
    Function-scoped temporary inventory store.
    Each test gets a clean SQLite file; it is deleted after the test.
    """
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parents[1]))

    from inventory.store import get_store
    tmp = tempfile.mktemp(suffix=".sqlite")
    store = get_store(path=tmp, org_id=str(uuid.uuid4()))
    yield store
    try:
        store._db.close()
    except Exception:
        pass
    try:
        os.unlink(tmp)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# make_record — ActivityRecord factory
# ---------------------------------------------------------------------------

@pytest.fixture
def make_record():
    """
    Returns a factory that creates ActivityRecord instances with sensible defaults.
    """
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parents[1]))

    from modules.base import ActivityRecord

    def _factory(**kwargs):
        defaults = dict(
            scope="Scope 1",
            process="S1 \u2014 Stationary combustion (fuel burn)",
            country="IN",
            quantity=100.0,
            unit="GJ",
            fuel_or_item="natural_gas",
            reporting_year=2024,
            gwp_ar=6,
            org_id="test",
        )
        defaults.update(kwargs)
        return ActivityRecord(**defaults)

    return _factory
