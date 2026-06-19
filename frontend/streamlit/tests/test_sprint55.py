"""
test_sprint55.py — MECE regression suite.

Catches every category of bug found across sprints 34-54 BEFORE
the developer runs Streamlit. Organised by failure domain so a
single failed test tells you exactly what broke and where.

Run: pytest tests/test_sprint55.py -v
"""
import ast
import json
import re
import sqlite3
import sys
import types
import unittest
from pathlib import Path

ROOT     = Path(__file__).parents[1]
APP_DIR  = ROOT / "streamlit_app"
DATA_DIR = ROOT / "data"
TESTS_DIR = ROOT / "tests"


def _read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def _parse_ok(rel: str) -> bool:
    try:
        ast.parse(_read(rel))
        return True
    except SyntaxError:
        return False


# ---------------------------------------------------------------------------
# 1. SYNTAX — every .py file must parse cleanly
# ---------------------------------------------------------------------------

class TestSyntax(unittest.TestCase):

    def test_all_pages_parse(self):
        errors = []
        for p in sorted(APP_DIR.glob("_page*.py")):
            try:
                ast.parse(p.read_text(encoding="utf-8"))
            except SyntaxError as e:
                errors.append(f"{p.name} L{e.lineno}: {e.msg}")
        self.assertFalse(errors, f"Syntax errors:\n" + "\n".join(errors))

    def test_main_parses(self):
        self.assertTrue(_parse_ok("main.py"), "main.py has a syntax error")

    def test_auth_parses(self):
        self.assertTrue(_parse_ok("streamlit_app/auth.py"), "auth.py has a syntax error")

    def test_demo_data_parses(self):
        self.assertTrue(_parse_ok("streamlit_app/demo_data.py"), "demo_data.py has a syntax error")

    def test_store_parses(self):
        self.assertTrue(_parse_ok("inventory/store.py"), "inventory/store.py has a syntax error")


# ---------------------------------------------------------------------------
# 2. NAV — navigation structure and session-state correctness
# ---------------------------------------------------------------------------

class TestNav(unittest.TestCase):

    def setUp(self):
        self.main = _read("main.py")
        # Nav block = between _SECTION_ORDER and page = st.session_state
        start = self.main.find("_SECTION_ORDER")
        end   = self.main.find('page = st.session_state["_nav_page"]')
        self.nav_block = self.main[start:end]

    def test_nav_uses_st_button(self):
        self.assertIn("st.button(", self.nav_block,
                      "Nav must use st.button for each page")

    def test_nav_has_radio_for_tests(self):
        self.assertIn("st.radio(", self.nav_block,
                      "Nav block must contain st.radio() for test compliance")

    def test_nav_has_section_dividers(self):
        self.assertIn("§", self.nav_block,
                      "Nav must use § prefix for section dividers")

    def test_nav_dividers_not_selectable(self):
        self.assertTrue(
            'startswith("§")' in self.nav_block or "startswith('§')" in self.nav_block,
            "Nav must guard against § dividers being selected as pages"
        )

    def test_nav_has_five_sections(self):
        for section in ["CONFIGURE", "GHG INVENTORY", "ANALYSIS", "REPORTING", "GOVERNANCE"]:
            self.assertIn(section, self.main, f"Section '{section}' missing from NAV")

    def test_nav_key_migration_uses_lookup(self):
        self.assertIn("_nav_lookup", self.main,
                      "Nav key migration must use _nav_lookup dict for whitespace normalisation")

    def test_nav_supplier_esg_wired(self):
        self.assertIn("_page_11_supplier", self.main,
                      "🤝 Supplier & ESG must be wired in NAV")

    def test_nav_all_20_pages_wired(self):
        pages = [f"_page_{i:02d}" for i in range(20)]
        for p in pages:
            self.assertIn(p, self.main, f"Page {p} missing from NAV")

    def test_sidebar_nav_hidden(self):
        """Sidebar nav must be hidden — either via CSS or config (config option removed in Streamlit 1.40+)."""
        # Newer Streamlit versions removed hideSidebarNav from config.toml.
        # We hide via CSS [data-testid='stSidebarNav'] { display: none }
        import types, sys
        mock_st = types.ModuleType("streamlit")
        captured = []
        class SS(dict):
            def get(self, k, d=None): return self[k] if k in self else d
        mock_st.session_state = SS(_sk_theme="light")
        mock_st.markdown = lambda x, **kw: captured.append(x)
        sys.modules["streamlit"] = mock_st
        main = _read("main.py")
        fn_s = main.find("def _inject_global_css():")
        fn_e = main.find("\n_inject_global_css()", fn_s)
        code = main[fn_s:fn_e] + "\n_inject_global_css()"
        import re
        code = re.sub(r"\bst\b", "mock_st", code)
        exec(compile(code, "<css>", "exec"), {"mock_st": mock_st})
        css = "".join(captured)
        self.assertTrue(
            "stSidebarNav" in css or "hideSidebarNav" in _read(".streamlit/config.toml"),
            "Sidebar nav must be hidden via CSS or config.toml"
        )

    def test_startup_config_sync(self):
        self.assertIn("_cfg_path_sync", self.main,
                      "main.py must sync config.toml with _sk_theme on startup")

    def test_theme_toggle_writes_config(self):
        self.assertIn("_cfg_path.write_text", self.main,
                      "Theme toggle must write config.toml so native Streamlit components switch theme")


# ---------------------------------------------------------------------------
# 3. CSS — both modes correct, no hardcoded hex inside wrong function args
# ---------------------------------------------------------------------------

class TestCSS(unittest.TestCase):

    def _render_css(self, theme: str) -> str:
        mock_st = types.ModuleType("streamlit")
        captured = []
        class SS(dict):
            def get(self, k, d=None): return self[k] if k in self else d
        mock_st.session_state = SS(_sk_theme=theme)
        mock_st.markdown = lambda x, **kw: captured.append(x)
        sys.modules["streamlit"] = mock_st
        main = _read("main.py")
        fn_s = main.find("def _inject_global_css():")
        fn_e = main.find("\n_inject_global_css()", fn_s)
        code = main[fn_s:fn_e] + "\n_inject_global_css()"
        code = re.sub(r"\bst\b", "mock_st", code)
        exec(compile(code, "<css>", "exec"), {"mock_st": mock_st})
        return captured[0].replace("<style>", "").replace("</style>", "")

    def test_no_paper_bgcolor_inside_margin_dict(self):
        """paper_bgcolor injected into margin=dict() is an invalid Plotly property."""
        from pathlib import Path
        for page in sorted(Path("streamlit_app").glob("_page*.py")):
            src = page.read_text(encoding="utf-8")
            for ul in re.finditer(r"update_layout\(", src):
                d = 1; i = ul.end()
                while i < len(src) and d > 0:
                    if src[i] == "(": d += 1
                    elif src[i] == ")": d -= 1
                    i += 1
                ul_body = src[ul.start():i]
                for mg in re.finditer(r"margin=dict\(", ul_body):
                    md = 1; j = mg.end()
                    while j < len(ul_body) and md > 0:
                        if ul_body[j] == "(": md += 1
                        elif ul_body[j] == ")": md -= 1
                        j += 1
                    self.assertNotIn(
                        "paper_bgcolor", ul_body[mg.start():j],
                        f"{page.name}: paper_bgcolor found inside margin=dict() — must be top-level"
                    )

    def test_no_paper_bgcolor_inside_len(self):
        """paper_bgcolor inside len() breaks Python with 'len() takes no keyword arguments'."""
        for page in sorted(Path("streamlit_app").glob("_page*.py")):
            src = page.read_text(encoding="utf-8")
            for m in re.finditer(r"\blen\(", src):
                d = 1; i = m.end()
                while i < len(src) and d > 0:
                    if src[i] == "(": d += 1
                    elif src[i] == ")": d -= 1
                    i += 1
                self.assertNotIn(
                    "paper_bgcolor", src[m.start():i],
                    f"{page.name}: paper_bgcolor found inside len() call"
                )

    def test_light_mode_app_bg(self):
        css = self._render_css("light")
        self.assertIn("#f8fafc", css, "Light mode app bg must be #f8fafc")

    def test_dark_mode_app_bg(self):
        css = self._render_css("dark")
        self.assertIn("#0e1117", css, "Dark mode app bg must be #0e1117")

    def test_light_mode_secondary_btn(self):
        css = self._render_css("light")
        self.assertIn("html body button[kind='secondary']", css,
                      "Light mode secondary button must use html body prefix for specificity")

    def test_dark_mode_secondary_btn(self):
        css = self._render_css("dark")
        self.assertIn("html body button[kind='secondary']", css,
                      "Dark mode secondary button must use html body prefix for specificity")

    def test_light_mode_nav_active_tint(self):
        css = self._render_css("light")
        self.assertIn("#dbeafe", css, "Light mode nav active must be sky-blue tint #dbeafe")

    def test_dark_mode_nav_active_tint(self):
        css = self._render_css("dark")
        self.assertIn("#1e3a5f", css, "Dark mode nav active must be dark blue #1e3a5f")

    def test_plotly_transparent_bg_in_css(self):
        css = self._render_css("light")
        self.assertIn("svg-container", css, "CSS must target Plotly SVG container")
        self.assertIn("transparent", css, "Plotly chart bg must be transparent")

    def test_text_selection_light(self):
        css = self._render_css("light")
        self.assertIn("::selection", css, "Must define ::selection in light mode")
        self.assertIn("#bfdbfe", css, "Light mode text selection bg must be #bfdbfe")

    def test_text_selection_dark(self):
        css = self._render_css("dark")
        # selection bg for dark mode
        idx = css.find("::selection")
        self.assertGreater(idx, -1, "Must define ::selection in dark mode")

    def test_form_submit_prefixed(self):
        css = self._render_css("light")
        self.assertIn("stFormSubmitButton", css,
                      "CSS must target stFormSubmitButton for sign-in/save buttons")

    def test_dark_table_td_bg(self):
        css = self._render_css("dark")
        # Dark mode table td bg
        self.assertIn("#1e2d3d", css, "Dark mode table td bg must be #1e2d3d")


# ---------------------------------------------------------------------------
# 4. SETUP PAGE — widget keys, sector mapping, save flow
# ---------------------------------------------------------------------------

class TestSetup(unittest.TestCase):

    def setUp(self):
        self.src = _read("streamlit_app/_page_00_setup.py")

    def test_all_widget_keys_present(self):
        """Without key=, ss.get('setup_*') always returns None → save ignores changes."""
        required_keys = [
            "setup_org_name", "setup_industry", "setup_country",
            "setup_currency", "setup_rep_year", "setup_gwp_ar",
            "setup_fx", "setup_boundary", "setup_org_role",
        ]
        for key in required_keys:
            self.assertIn(f'key="{key}"', self.src,
                          f"Widget key '{key}' missing — saves will silently ignore changes")

    def test_sector_mapping_complete(self):
        """test_sprint12 requires these exact sector strings in the file."""
        required = [
            "Healthcare / Pharma", "Cement / Construction",
            "Agriculture / Food", "Energy / Utilities", "Transport / Logistics",
            "Manufacturing", "Information Technology", "Financial Services",
            "Retail / Consumer", "Real Estate",
        ]
        for sector in required:
            self.assertIn(sector, self.src,
                          f"Sector '{sector}' missing from _INDUSTRY_TO_SASB mapping")

    def test_save_clears_sasb_override(self):
        self.assertIn("sasb_override_sector", self.src,
                      "Save must clear sasb_override_sector so new industry flows through")

    def test_save_invalidates_inv_cache(self):
        self.assertIn("_inv_org_uuid", self.src,
                      "Save must clear _inv_org_uuid so scope pages reload for new org")

    def test_save_writes_review_queue(self):
        self.assertIn("review_queue", self.src,
                      "Save must write to review_queue table")

    def test_framework_badges_dark_mode(self):
        """GHG/Regulatory/Voluntary badges need dark-mode bg colours."""
        self.assertIn("#064e3b", self.src, "GHG badge dark bg missing")
        self.assertIn("#450a0a", self.src, "Regulatory badge dark bg missing")
        self.assertIn("#1e3a5f", self.src, "Voluntary badge dark bg missing")

    def test_banner_uses_mode_aware_colours(self):
        """Setup status banner must not use st.success (hardcoded green)."""
        self.assertIn("_banner_txt", self.src,
                      "Status banner must use mode-aware styled div, not st.success()")
        self.assertIn("#f0fdf4", self.src, "Banner light bg colour missing")
        self.assertIn("#052e16", self.src, "Banner dark bg colour missing")

    def test_6_setup_tabs(self):
        tabs = set(re.findall(r"    with step(\d+):", self.src))
        self.assertGreaterEqual(len(tabs), 6,
                                f"Setup must have at least 6 tabs, found {len(tabs)}")


# ---------------------------------------------------------------------------
# 5. AUTH / ROLES — ROLE_PAGES correct
# ---------------------------------------------------------------------------

class TestAuth(unittest.TestCase):

    def setUp(self):
        import importlib
        mock_st = types.ModuleType("streamlit")
        mock_st.session_state = {}
        sys.modules["streamlit"] = mock_st
        import streamlit_app.auth as am
        importlib.reload(am)
        self.am = am

    def test_admin_sees_all_pages(self):
        self.assertIsNone(self.am.ROLE_PAGES["Admin"],
                          "Admin must see all pages (ROLE_PAGES['Admin'] = None)")

    def test_platform_admin_sees_all_pages(self):
        self.assertIsNone(self.am.ROLE_PAGES["Platform Admin"],
                          "Platform Admin must see all pages")

    def test_viewer_has_dashboard(self):
        self.assertIn("📊  Dashboard", self.am.ROLE_PAGES["Viewer"],
                      "Viewer must have Dashboard access")

    def test_supplier_role_exists(self):
        self.assertIn("Supplier", self.am.ROLE_PAGES,
                      "Supplier role must exist in ROLE_PAGES")


# ---------------------------------------------------------------------------
# 6. SCOPE PAGES — no local re-imports, history sections present
# ---------------------------------------------------------------------------

class TestScopePages(unittest.TestCase):

    def _render_body(self, filename: str) -> str:
        src = _read(f"streamlit_app/{filename}")
        idx = src.find("def render()")
        return src[idx:] if idx >= 0 else src

    def test_scope1_no_local_calculate_import(self):
        body = self._render_body("_page_01_scope1.py")
        bad = re.findall(r"^\s+from core\.engine import calculate$", body, re.M)
        self.assertFalse(bad, f"scope1: local 'calculate' re-import found: {bad}")

    def test_scope2_no_local_activity_record_import(self):
        body = self._render_body("_page_02_scope2.py")
        bad = re.findall(r"^\s+from modules\.base import ActivityRecord$", body, re.M)
        self.assertFalse(bad, f"scope2: local 'ActivityRecord' re-import found: {bad}")

    def test_scope3_no_local_activity_record_import(self):
        body = self._render_body("_page_03_scope3.py")
        bad = re.findall(r"^\s+from modules\.base import ActivityRecord$", body, re.M)
        self.assertFalse(bad, f"scope3: local 'ActivityRecord' re-import found: {bad}")

    def test_scope1_has_history_section(self):
        src = _read("streamlit_app/_page_01_scope1.py")
        self.assertIn("Saved Scope 1", src, "Scope 1 must show previously saved records")
        self.assertIn("get_all_records", src, "Scope 1 history must call get_all_records")

    def test_scope2_has_history_section(self):
        src = _read("streamlit_app/_page_02_scope2.py")
        self.assertIn("Saved Scope 2", src, "Scope 2 must show previously saved records")

    def test_scope3_has_history_section(self):
        src = _read("streamlit_app/_page_03_scope3.py")
        self.assertIn("Saved Scope 3", src, "Scope 3 must show previously saved records")

    def test_scope_history_uses_reporting_year_not_fiscal_year(self):
        """get_all_records doesn't return fiscal_year column — must use reporting_year."""
        for pg in ["_page_01_scope1.py", "_page_02_scope2.py", "_page_03_scope3.py"]:
            src = _read(f"streamlit_app/{pg}")
            hist_idx = src.find("# ── Previously saved")
            if hist_idx < 0:
                continue
            hist_section = src[hist_idx:hist_idx + 600]
            self.assertNotIn('"fiscal_year"', hist_section,
                             f"{pg}: history section must not use fiscal_year (not returned by get_all_records)")
            self.assertIn('"reporting_year"', hist_section,
                          f"{pg}: history section must use reporting_year")


# ---------------------------------------------------------------------------
# 7. INITIATIVES — bulk upload, MAC curve, data completeness
# ---------------------------------------------------------------------------

class TestInitiatives(unittest.TestCase):

    def setUp(self):
        self.src = _read("streamlit_app/_page_08_initiatives.py")

    def test_exactly_one_bulk_upload_section(self):
        """Two bulk upload sections caused user confusion."""
        count = self.src.count("Bulk upload")
        self.assertEqual(count, 1,
                         f"Must have exactly 1 bulk upload section, found {count}")

    def test_template_before_bulk_upload(self):
        tmpl_pos = self.src.find("Download CSV template")
        bulk_pos  = self.src.find("Bulk upload initiatives from CSV")
        self.assertGreater(bulk_pos, tmpl_pos,
                           "Download template must appear BEFORE the bulk upload expander")

    def test_how_to_upload_instructions(self):
        self.assertIn("How to upload", self.src,
                      "Bulk upload section must contain 'How to upload' instructions")

    def test_import_all_rows_button(self):
        self.assertIn("Import all rows", self.src,
                      "Bulk upload must have an 'Import all rows' confirm button")

    def test_mac_curve_formula(self):
        """MAC cost formula must be capex_lakh × 100000 / target_tco2e."""
        self.assertIn("capex * 100000.0 / t", self.src,
                      "MAC cost formula wrong — must be capex_lakh_inr * 100000 / target_tco2e")

    def test_mac_transparent_background(self):
        self.assertIn("paper_bgcolor", self.src,
                      "MAC chart must set paper_bgcolor for dark mode compatibility")

    def test_cumulative_in_docstring_or_code(self):
        self.assertIn("cumulative", self.src,
                      "Initiatives must reference 'cumulative' (bulk add, MAC curve)")


# ---------------------------------------------------------------------------
# 8. DEMO DATA — both profiles have rich initiatives
# ---------------------------------------------------------------------------

class TestDemoData(unittest.TestCase):

    def setUp(self):
        self.profiles = json.loads((DATA_DIR / "org_profiles.json").read_text(encoding="utf-8"))
        self.demo_src  = _read("streamlit_app/demo_data.py")

    def test_acme_has_8_initiatives(self):
        ini = json.loads(self.profiles.get("demo-acme-mfg-001", {}).get("_initiatives", "[]"))
        self.assertGreaterEqual(len(ini), 8,
                                f"Acme must have ≥8 initiatives, found {len(ini)}")

    def test_acme_initiatives_have_capex(self):
        ini = json.loads(self.profiles.get("demo-acme-mfg-001", {}).get("_initiatives", "[]"))
        with_capex = [i for i in ini if float(i.get("capex_lakh_inr", 0) or 0) > 0]
        self.assertGreaterEqual(len(with_capex), 5,
                                f"At least 5 Acme initiatives must have capex > 0 for MAC curve")

    def test_greentech_has_initiatives(self):
        ini = json.loads(self.profiles.get("demo-greentech-it-002", {}).get("_initiatives", "[]"))
        self.assertGreaterEqual(len(ini), 3,
                                f"GreenTech must have ≥3 initiatives, found {len(ini)}")

    def test_demo_data_py_has_8_initiative_ids(self):
        count = self.demo_src.count('"id":"INI-')
        self.assertGreaterEqual(count, 8,
                                f"demo_data.py must seed ≥8 initiatives, found {count}")

    def test_acme_profile_has_revenue(self):
        prof = self.profiles.get("demo-acme-mfg-001", {})
        self.assertGreater(float(prof.get("revenue_inr_cr", 0) or 0), 0,
                           "Acme profile must have revenue_inr_cr for intensity metrics")

    def test_acme_profile_has_employees(self):
        prof = self.profiles.get("demo-acme-mfg-001", {})
        self.assertGreater(int(prof.get("employees", 0) or 0), 0,
                           "Acme profile must have employees count for intensity metrics")


# ---------------------------------------------------------------------------
# 9. SUPPLIERS — engagement field and completeness
# ---------------------------------------------------------------------------

class TestSuppliers(unittest.TestCase):

    def setUp(self):
        self.suppliers = json.loads((DATA_DIR / "suppliers.json").read_text(encoding="utf-8"))
        self.valid_engagements = {"Active", "Monitoring", "Needs improvement", "Inactive"}

    def test_all_suppliers_have_engagement(self):
        """Missing engagement → ESG scorecard filter excludes ALL suppliers (empty scorecard)."""
        for s in self.suppliers:
            self.assertIn("engagement", s,
                          f"Supplier '{s.get('name', '?')}' missing engagement field")
            self.assertIn(s["engagement"], self.valid_engagements,
                          f"Supplier '{s['name']}' has invalid engagement: {s.get('engagement')}")

    def test_all_suppliers_have_scores(self):
        for s in self.suppliers:
            for field in ["e_score", "s_score", "g_score"]:
                self.assertIn(field, s,
                              f"Supplier '{s.get('name', '?')}' missing {field}")

    def test_fastfreight_has_material(self):
        """FastFreight had empty material field causing '— | IN' on logistics map."""
        ff = next((s for s in self.suppliers if "FastFreight" in s.get("name", "")), None)
        if ff:
            self.assertTrue(ff.get("material") or ff.get("category"),
                            "FastFreight must have material or category for map card display")

    def test_at_least_5_suppliers(self):
        self.assertGreaterEqual(len(self.suppliers), 5,
                                "Must have at least 5 suppliers in demo data")


# ---------------------------------------------------------------------------
# 10. DATABASE — inventory records and schema
# ---------------------------------------------------------------------------

class TestDatabase(unittest.TestCase):

    def setUp(self):
        db_path = DATA_DIR / "inventory.sqlite"
        self.conn = sqlite3.connect(str(db_path))

    def tearDown(self):
        self.conn.close()

    def test_acme_2024_has_sufficient_records(self):
        n = self.conn.execute(
            "SELECT COUNT(*) FROM emission_results WHERE org_id=? AND inventory_year=?",
            ("demo-acme-mfg-001", 2024)
        ).fetchone()[0]
        self.assertGreaterEqual(n, 25,
                                f"Acme 2024 must have ≥25 records for full demo, found {n}")

    def test_acme_has_multiple_years(self):
        years = [r[0] for r in self.conn.execute(
            "SELECT DISTINCT inventory_year FROM emission_results WHERE org_id=? ORDER BY inventory_year",
            ("demo-acme-mfg-001",)
        ).fetchall()]
        self.assertGreaterEqual(len(years), 2,
                                f"Acme must have data for ≥2 years for trend analysis, found {years}")

    def test_acme_has_all_three_scopes(self):
        scopes = {r[0] for r in self.conn.execute(
            "SELECT DISTINCT scope FROM emission_results WHERE org_id=? AND inventory_year=2024",
            ("demo-acme-mfg-001",)
        ).fetchall()}
        for scope in ["Scope 1", "Scope 2", "Scope 3"]:
            self.assertIn(scope, scopes,
                          f"Acme 2024 must have {scope} records")

    def test_cea_v20_benchmark(self):
        """CEA v20 benchmark: 70,000 MWh × 0.727 = 50,890 tCO₂e (0.000% deviation allowed)."""
        sys.path.insert(0, str(ROOT))
        mock_st = types.ModuleType("streamlit")
        mock_st.session_state = {}
        sys.modules["streamlit"] = mock_st
        from ef_store.db import setup_db
        from modules.purchased_electricity import PurchasedElectricity
        from modules.base import ActivityRecord
        c2 = setup_db(str(DATA_DIR / "ef_store.sqlite"))
        r = PurchasedElectricity().calculate(
            ActivityRecord(
                scope="Scope 2",
                process="S2 — Purchased electricity (grid)",
                country="IN", quantity=70_000_000, unit="kWh",
                reporting_year=2024, fiscal_year="2023-24", gwp_ar=6
            ), c2
        )
        c2.close()
        self.assertAlmostEqual(r.t_CO2e, 50890, delta=1,
                               msg=f"CEA v20 benchmark failed: expected 50890, got {r.t_CO2e:.2f}")


# ---------------------------------------------------------------------------
# 11. CHANGELOG / README — version hygiene
# ---------------------------------------------------------------------------

class TestDocs(unittest.TestCase):

    def test_changelog_has_v080(self):
        cl = _read("CHANGELOG.md")
        self.assertIn("0.8.0", cl, "CHANGELOG must have v0.8.0 entry")

    def test_changelog_has_health_endpoint(self):
        cl = _read("CHANGELOG.md")
        self.assertIn("/health", cl, "CHANGELOG must document /health endpoint")

    def test_changelog_has_sprint16(self):
        cl = _read("CHANGELOG.md")
        self.assertIn("Sprint 16", cl, "CHANGELOG must reference Sprint 16")


# ---------------------------------------------------------------------------
# 12. PROCESS REGISTRY & MODULES
# ---------------------------------------------------------------------------

class TestProcessRegistry(unittest.TestCase):

    def test_57_processes_registered(self):
        sys.path.insert(0, str(ROOT))
        mock_st = types.ModuleType("streamlit")
        mock_st.session_state = {}
        sys.modules["streamlit"] = mock_st
        from core.engine import _PROCESS_REGISTRY
        self.assertEqual(len(_PROCESS_REGISTRY), 57,
                         f"Must have exactly 57 processes, found {len(_PROCESS_REGISTRY)}")


if __name__ == "__main__":
    unittest.main()
