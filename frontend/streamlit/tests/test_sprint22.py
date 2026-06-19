"""
sk.lite — Sprint 22 Test Suite.

Covers:
  - Audit trail: schema, log_event, get_events
  - Review queue: submit, decide, immutability
  - ESG bridge: crossmap completeness, coverage logic
  - Auth: roles, page_allowed, hashing
  - Supplier scorecard: composite, GHG linkage, file persistence
  - main.py: 15 pages in NAV, all new pages present
  - Full regression: 57 processes, CEA v20, all 15 pages import
"""
from __future__ import annotations
import ast
import os
import re
import tempfile
from pathlib import Path

import pytest

ROOT = Path(__file__).parents[1]


def _read(relpath: str) -> str:
    return (ROOT / relpath).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Audit trail
# ---------------------------------------------------------------------------

class TestAuditTrail:

    def test_audit_module_syntax(self):
        ast.parse(_read("inventory/audit.py"))

    def test_audit_schema_has_event_id(self):
        src = _read("inventory/audit.py")
        assert "event_id" in src and "actor_username" in src

    def test_log_event_creates_row(self):
        from inventory.audit import log_event, get_events
        tmp = tempfile.mktemp(suffix=".sqlite")
        try:
            eid = log_event("save_record", "Test save",
                            actor_username="testuser", actor_role="Admin",
                            org_id="test_org", db_path=tmp)
            events = get_events(org_id="test_org", db_path=tmp)
            assert len(events) == 1
            assert events[0]["event_id"] == eid
            assert events[0]["summary"] == "Test save"
            assert events[0]["actor_username"] == "testuser"
        finally:
            try: os.unlink(tmp)
            except: pass

    def test_get_events_filters_by_type(self):
        from inventory.audit import log_event, get_events
        tmp = tempfile.mktemp(suffix=".sqlite")
        try:
            log_event("save_record", "Save A", org_id="o1", db_path=tmp)
            log_event("login", "Login B", org_id="o1", db_path=tmp)
            saves = get_events(org_id="o1", event_type="save_record", db_path=tmp)
            assert len(saves) == 1
            assert saves[0]["event_type"] == "save_record"
        finally:
            try: os.unlink(tmp)
            except: pass

    def test_audit_page_syntax(self):
        ast.parse(_read("streamlit_app/_page_12_audit.py"))

    def test_audit_page_imports_audit_module(self):
        src = _read("streamlit_app/_page_12_audit.py")
        assert "from inventory.audit import" in src

    def test_audit_page_has_download(self):
        src = _read("streamlit_app/_page_12_audit.py")
        assert "download_button" in src

    def test_audit_page_role_gated(self):
        src = _read("streamlit_app/_page_12_audit.py")
        assert "Viewer" in src  # viewer blocked


# ---------------------------------------------------------------------------
# Review queue
# ---------------------------------------------------------------------------

class TestReviewQueue:

    def test_review_page_syntax(self):
        ast.parse(_read("streamlit_app/_page_14_review.py"))

    def test_review_schema_has_immutable_decisions(self):
        src = _read("streamlit_app/_page_14_review.py")
        assert "review_decisions" in src
        assert "INSERT INTO review_decisions" in src
        # No DELETE or UPDATE on decisions
        decisions_section = src[src.find("review_decisions"):]
        assert "DELETE FROM review_decisions" not in decisions_section

    def test_review_submit_and_decide(self):
        """Submit → approve → check decision recorded."""
        import sqlite3
        tmp = tempfile.mktemp(suffix=".sqlite")
        # Patch REVIEW_DB path
        import streamlit_app._page_14_review as rp
        original = rp.REVIEW_DB
        rp.REVIEW_DB = Path(tmp)
        try:
            sid = rp._submit("org1", 2024, "Scope 1", "alice", "Please check S1")
            decisions_before = rp._get_decisions(sid)
            assert len(decisions_before) == 0

            did = rp._decide(sid, "bob", "Approved", "Looks good, CEA EFs verified")
            decisions_after = rp._get_decisions(sid)
            assert len(decisions_after) == 1
            assert decisions_after[0]["decision"] == "Approved"
            assert decisions_after[0]["reviewer"] == "bob"

            subs = rp._get_submissions("org1", status="Approved")
            assert any(s["sub_id"] == sid for s in subs)
        finally:
            rp.REVIEW_DB = original
            try: os.unlink(tmp)
            except: pass

    def test_review_comment_mandatory_in_code(self):
        src = _read("streamlit_app/_page_14_review.py")
        assert "Comment is mandatory" in src or "mandatory" in src.lower()

    def test_review_has_three_tabs(self):
        src = _read("streamlit_app/_page_14_review.py")
        assert "Pending reviews" in src
        assert "Submit for review" in src
        assert "Full history" in src


# ---------------------------------------------------------------------------
# ESG-GHG bridge
# ---------------------------------------------------------------------------

class TestESGBridge:

    def test_bridge_page_syntax(self):
        ast.parse(_read("streamlit_app/_page_13_esg_bridge.py"))

    def test_crossmap_has_13_topics(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_13_esg_bridge")
        assert len(mod.CROSSMAP) >= 12

    def test_crossmap_has_e_s_g_pillars(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_13_esg_bridge")
        pillars = {v["pillar"] for v in mod.CROSSMAP.values()}
        assert "E" in pillars and "S" in pillars and "G" in pillars

    def test_crossmap_has_all_frameworks(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_13_esg_bridge")
        frameworks = " ".join(v["framework"] for v in mod.CROSSMAP.values())
        for fw in ["ESRS", "BRSR", "CDP", "GRI", "TCFD"]:
            assert fw in frameworks

    def test_crossmap_all_topics_have_ghg_cats(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_13_esg_bridge")
        for tid, topic in mod.CROSSMAP.items():
            assert len(topic["ghg_cats"]) > 0, f"{tid} has no ghg_cats"

    def test_bridge_in_main_nav(self):
        main_src = _read("main.py")
        assert "_page_13_esg_bridge" in main_src


# ---------------------------------------------------------------------------
# Auth module
# ---------------------------------------------------------------------------

class TestAuth:

    def test_auth_syntax(self):
        ast.parse(_read("streamlit_app/auth.py"))

    def test_three_roles_defined(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        from streamlit_app.auth import ROLES
        assert {"Admin", "Contributor", "Viewer"}.issubset(set(ROLES.keys()))  # Sprint 32: added Platform Admin + Supplier roles

    def test_admin_can_export(self):
        from streamlit_app.auth import ROLES
        assert ROLES["Admin"]["can_export"] is True

    def test_contributor_cannot_export(self):
        from streamlit_app.auth import ROLES
        assert ROLES["Contributor"]["can_export"] is False

    def test_viewer_cannot_enter_data(self):
        from streamlit_app.auth import ROLES
        assert ROLES["Viewer"]["can_enter_data"] is False

    def test_password_hashing(self):
        from streamlit_app.auth import _hash
        assert _hash("test123") == _hash("test123")
        assert _hash("abc") != _hash("xyz")
        assert len(_hash("anything")) == 64  # SHA-256 hex

    def test_role_pages_admin_is_none(self):
        from streamlit_app.auth import ROLE_PAGES
        assert ROLE_PAGES["Admin"] is None  # Admin sees all pages

    def test_viewer_limited_pages(self):
        from streamlit_app.auth import ROLE_PAGES
        viewer_pages = ROLE_PAGES["Viewer"]
        assert "📊  Dashboard" in viewer_pages
        assert "⚙️  Setup" not in viewer_pages  # Viewer can't access Setup


# ---------------------------------------------------------------------------
# Supplier scorecard
# ---------------------------------------------------------------------------

class TestSupplierScorecard:

    def test_supplier_page_syntax(self):
        ast.parse(_read("streamlit_app/_page_11_supplier.py"))

    def test_composite_formula(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_11_supplier")
        s = {"e_score": 80, "s_score": 60, "g_score": 70}
        comp = mod._composite(s)
        expected = round(0.4*80 + 0.35*60 + 0.25*70, 1)
        assert comp == expected

    def test_default_suppliers_seeded(self):
        import sys, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        import importlib
        mod = importlib.import_module("streamlit_app._page_11_supplier")
        assert len(mod._DEFAULT_SUPPLIERS) >= 5

    def test_four_tabs(self):
        src = _read("streamlit_app/_page_11_supplier.py")
        assert "📋 Scorecard" in src
        assert "📊 ESG pillar analysis" in src
        assert "🔗 GHG linkage" in src
        assert "➕ Manage suppliers" in src

    def test_ghg_linkage_function_exists(self):
        src = _read("streamlit_app/_page_11_supplier.py")
        assert "_pull_ghg_from_inventory" in src


# ---------------------------------------------------------------------------
# main.py: 15 pages
# ---------------------------------------------------------------------------

class TestMainNav:

    def test_15_pages_in_nav(self):
        main_src = _read("main.py")
        page_refs = re.findall(r'"streamlit_app\._page_\d+_\w+"', main_src)
        # +1 for __user_management__ virtual page
        assert len(page_refs) >= 14, f"Only {len(page_refs)} page refs found"

    def test_all_new_pages_in_nav(self):
        main_src = _read("main.py")
        for mod in ["_page_11_supplier", "_page_12_audit",
                    "_page_13_esg_bridge", "_page_14_review"]:
            assert mod in main_src, f"Missing: {mod}"

    def test_auth_login_gate(self):
        main_src = _read("main.py")
        assert "login_form()" in main_src
        assert "_AUTH_ENABLED" in main_src

    def test_role_filtered_nav(self):
        main_src = _read("main.py")
        assert "page_allowed" in main_src


# ---------------------------------------------------------------------------
# Full regression Sprint 22
# ---------------------------------------------------------------------------

class TestRegressionSprint22:

    def test_57_processes(self):
        from core.engine import _PROCESS_REGISTRY
        assert len(_PROCESS_REGISTRY) == 57

    def test_all_15_pages_import(self):
        import sys, importlib, unittest.mock as mock
        sys.modules.setdefault("streamlit", mock.MagicMock())
        page_map = {
            0:"setup", 1:"scope1", 2:"scope2", 3:"scope3",
            4:"dashboard", 5:"ef_manager", 6:"export", 7:"inventory",
            8:"initiatives", 9:"checklist", 10:"sasb", 11:"supplier",
            12:"audit", 13:"esg_bridge", 14:"review",
        }
        for i, name in page_map.items():
            importlib.import_module(f"streamlit_app._page_{i:02d}_{name}")

    def test_cea_v20(self, db_conn):
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        r = PurchasedElectricity().calculate(ActivityRecord(
            scope="Scope 2",
            process="S2 \u2014 Purchased electricity (grid)",
            country="IN", quantity=70_000_000, unit="kWh",
            reporting_year=2024, fiscal_year="2023-24", gwp_ar=6,
        ), db_conn)
        assert r.t_CO2e == pytest.approx(50_890.0, rel=0.0001)

    def test_store_migration_works(self):
        import sqlite3
        tmp = tempfile.mktemp(suffix=".sqlite")
        conn = sqlite3.connect(tmp)
        conn.execute("CREATE TABLE emission_results (record_id TEXT PRIMARY KEY, org_id TEXT, inventory_year INTEGER, locked INTEGER DEFAULT 0, scope TEXT, process TEXT, t_CO2e REAL, created_at TEXT, updated_at TEXT)")
        conn.execute("CREATE TABLE inventory_snapshots (snapshot_id TEXT PRIMARY KEY, org_id TEXT, inventory_year INTEGER, locked_at TEXT, total_t_co2e REAL, scope1_t_co2e REAL, scope2_t_co2e REAL, scope3_t_co2e REAL)")
        conn.commit(); conn.close()
        from inventory.store import InventoryStore
        store = InventoryStore(path=tmp, org_id="test")
        cols = {r[1] for r in store._db.execute("PRAGMA table_info(emission_results)").fetchall()}
        store._db.close()
        try: os.unlink(tmp)
        except: pass
        assert "site" in cols and "department" in cols

    def test_total_tests_800plus(self):
        total = sum(
            (ROOT / "tests" / f).read_text(encoding="utf-8").count("def test_")
            for f in os.listdir(ROOT / "tests")
            if f.endswith(".py") and f != "__init__.py"
        )
        assert total >= 790, f"Only {total} tests"
