"""
Comprehensive page-render simulator. Stubs out streamlit + plotly + pandas
just enough to actually CALL render() in every page module for every org
and surface real Python errors (NameError, IndexError, AttributeError, ...)
before the ZIP ships.

Run:  python3 _harness/sim_pages.py
"""
import sys, traceback, json, importlib, types, builtins
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))


# ── Streamlit shim ─────────────────────────────────────────────────────────────

class _ColumnObj:
    """Column / tab / expander / container — forwards method calls to streamlit shim."""
    _shim_ref = None

    def __init__(self, name="col"):
        self._name = name
    def __enter__(self): return self
    def __exit__(self, *a): return False
    def __getattr__(self, name):
        # Forward to the main shim so multiselect/selectbox/etc return real defaults
        if _ColumnObj._shim_ref is not None and hasattr(_ColumnObj._shim_ref, name):
            return getattr(_ColumnObj._shim_ref, name)
        return lambda *args, **kwargs: None
    def __call__(self, *a, **kw): return None


class _Tab(_ColumnObj):
    pass


class _Container(_ColumnObj):
    pass


class _Expander(_ColumnObj):
    pass


class _SessionState(dict):
    def __getattr__(self, k): return self.get(k)
    def __setattr__(self, k, v): self[k] = v


class StreamlitShim:
    def __init__(self):
        self.session_state = _SessionState()
        # Recorders for data-flow assertions
        self.recorded_metrics: list = []     # [(label, value), ...]
        self.recorded_dataframes: list = []  # [n_rows, ...]
        self.recorded_charts: int = 0        # plotly_chart count
        self.recorded_warnings: list = []
        self.recorded_infos: list = []
    def title(self, *a, **kw): pass
    def header(self, *a, **kw): pass
    def subheader(self, *a, **kw): pass
    def caption(self, *a, **kw): pass
    def markdown(self, *a, **kw): pass
    def write(self, *a, **kw): pass
    def info(self, body="", *a, **kw):
        if body: self.recorded_infos.append(str(body)[:200])
    def warning(self, body="", *a, **kw):
        if body: self.recorded_warnings.append(str(body)[:200])
    def success(self, *a, **kw): pass
    def error(self, *a, **kw): pass
    def text(self, *a, **kw): pass
    def code(self, *a, **kw): pass
    def latex(self, *a, **kw): pass
    def divider(self, *a, **kw): pass
    def progress(self, *a, **kw): pass
    def metric(self, label="", value=None, *a, **kw):
        self.recorded_metrics.append((label, value))
    def plotly_chart(self, *a, **kw):
        self.recorded_charts += 1
    def pyplot(self, *a, **kw): pass
    def dataframe(self, data=None, *a, **kw):
        try:
            n = len(data) if hasattr(data, '__len__') else 0
        except Exception:
            n = 0
        self.recorded_dataframes.append(n)
    def table(self, data=None, *a, **kw):
        try: self.recorded_dataframes.append(len(data))
        except Exception: pass
    def json(self, *a, **kw): pass
    def image(self, *a, **kw): pass
    def video(self, *a, **kw): pass
    def audio(self, *a, **kw): pass
    def stop(self, *a, **kw): raise RuntimeError("st.stop()")
    def rerun(self): pass
    def experimental_rerun(self): pass
    def form_submit_button(self, *a, **kw): return False
    @property
    def sidebar(self):
        # sidebar is a Container in real streamlit — usable via `with st.sidebar:`
        # AND has the same method API (.title, .markdown, .selectbox, ...)
        if not hasattr(self, '_sidebar_obj'):
            self._sidebar_obj = _ColumnObj("sidebar")
        return self._sidebar_obj
    def cache_data(self, *a, **kw):
        # support both @st.cache_data and @st.cache_data()
        if a and callable(a[0]):
            return a[0]
        def deco(f): return f
        return deco
    cache = cache_data
    cache_resource = cache_data
    def columns(self, n_or_spec, **kw):
        n = n_or_spec if isinstance(n_or_spec, int) else len(n_or_spec)
        n = max(1, n)
        return [_ColumnObj(f"col{i}") for i in range(n)]
    def tabs(self, labels):
        return [_Tab(l) for l in labels]
    def expander(self, *a, **kw): return _Expander()
    def container(self, *a, **kw): return _Container()
    def empty(self, *a, **kw): return _Container()
    def form(self, *a, **kw): return _Container()
    def status(self, *a, **kw): return _Container()
    def spinner(self, *a, **kw): return _Container()
    # widgets — return reasonable defaults
    def button(self, *a, **kw): return False
    def download_button(self, *a, **kw): return False
    def link_button(self, *a, **kw): return None
    def page_link(self, *a, **kw): return None
    def checkbox(self, *a, **kw): return kw.get("value", False)
    def toggle(self, *a, **kw): return kw.get("value", False)
    def radio(self, label, options, **kw):
        if not options: return None
        idx = kw.get("index", 0) or 0
        try: return options[idx]
        except Exception: return options[0]
    def selectbox(self, label, options, **kw):
        if not options: return None
        idx = kw.get("index", 0) or 0
        try: return options[idx]
        except Exception: return options[0]
    def multiselect(self, label, options, **kw):
        return kw.get("default", []) or []
    def slider(self, *a, **kw): return kw.get("value", 0) or 0
    def select_slider(self, *a, **kw):
        opts = kw.get("options", [])
        return opts[0] if opts else None
    def text_input(self, *a, **kw): return kw.get("value", "") or ""
    def text_area(self, *a, **kw): return kw.get("value", "") or ""
    def number_input(self, *a, **kw): return kw.get("value", 0) or 0
    def date_input(self, *a, **kw):
        import datetime
        return datetime.date.today()
    def time_input(self, *a, **kw):
        import datetime
        return datetime.time(12, 0)
    def file_uploader(self, *a, **kw): return None
    def color_picker(self, *a, **kw): return kw.get("value", "#000000") or "#000000"
    def camera_input(self, *a, **kw): return None
    # set_page_config no-op
    def set_page_config(self, *a, **kw): pass
    # column_config sub-namespace for st.dataframe
    @property
    def column_config(self):
        if not hasattr(self, '_column_config_obj'):
            class _CC:
                def __getattr__(self, n): return lambda *a, **kw: None
            self._column_config_obj = _CC()
        return self._column_config_obj
    # context-managers via with statements work via columns/tabs/expander above


def install_shim():
    shim = StreamlitShim()
    _ColumnObj._shim_ref = shim
    sys.modules['streamlit'] = shim
    return shim


# ── Plotly + pandas shim (minimal — pages may call .add_trace, etc.) ──────────

class _PlotlyFig:
    def __init__(self, *a, **kw): self.data = []; self.layout = {}
    def add_trace(self, *a, **kw): self.data.append(a[0] if a else None); return self
    def add_scatter(self, *a, **kw): return self
    def add_bar(self, *a, **kw): return self
    def add_hline(self, *a, **kw): return self
    def add_vline(self, *a, **kw): return self
    def add_hrect(self, *a, **kw): return self
    def add_vrect(self, *a, **kw): return self
    def add_annotation(self, *a, **kw): return self
    def add_shape(self, *a, **kw): return self
    def update_layout(self, *a, **kw): return self
    def update_traces(self, *a, **kw): return self
    def update_xaxes(self, *a, **kw): return self
    def update_yaxes(self, *a, **kw): return self
    def update_geos(self, *a, **kw): return self
    def to_html(self, *a, **kw): return "<div/>"
    def to_image(self, *a, **kw): return b""


class _PlotlyTrace:
    def __init__(self, *a, **kw): self.kw = kw
    def __getattr__(self, n): return None


def install_plotly_shim():
    pgo = types.ModuleType('plotly.graph_objects')
    pgo.Figure = _PlotlyFig
    pgo.Scattergeo = _PlotlyTrace
    pgo.Scatter = _PlotlyTrace
    pgo.Scatterpolar = _PlotlyTrace
    pgo.Scatter3d = _PlotlyTrace
    pgo.Bar = _PlotlyTrace
    pgo.Sankey = _PlotlyTrace
    pgo.Pie = _PlotlyTrace
    pgo.Heatmap = _PlotlyTrace
    pgo.Indicator = _PlotlyTrace
    pgo.Treemap = _PlotlyTrace
    pgo.Sunburst = _PlotlyTrace
    pgo.Box = _PlotlyTrace
    pgo.Violin = _PlotlyTrace
    pgo.Histogram = _PlotlyTrace
    pgo.Funnel = _PlotlyTrace
    pgo.Waterfall = _PlotlyTrace
    pgo.Choropleth = _PlotlyTrace
    sys.modules['plotly.graph_objects'] = pgo
    pgo_alias = types.ModuleType('plotly.graph_objs')
    for k in dir(pgo):
        if not k.startswith('_'): setattr(pgo_alias, k, getattr(pgo, k))
    sys.modules['plotly.graph_objs'] = pgo_alias
    pmod = types.ModuleType('plotly')
    pmod.graph_objects = pgo
    sys.modules['plotly'] = pmod
    px = types.ModuleType('plotly.express')
    for fn in ('bar','line','scatter','pie','histogram','box','treemap','sunburst',
              'choropleth','imshow','area','funnel'):
        setattr(px, fn, lambda *a, **kw: _PlotlyFig())
    # plotly.express.colors sub-module
    px_colors = types.ModuleType('plotly.express.colors')
    px_colors.qualitative = types.SimpleNamespace(
        Plotly=['#636EFA','#EF553B','#00CC96','#AB63FA','#FFA15A','#19D3F3'],
        Set1=['#E41A1C','#377EB8','#4DAF4A','#984EA3','#FF7F00','#FFFF33'],
        Set2=['#66C2A5','#FC8D62','#8DA0CB','#E78AC3','#A6D854','#FFD92F'],
        Pastel=['#FBB4AE','#B3CDE3','#CCEBC5','#DECBE4'],
    )
    px_colors.sequential = types.SimpleNamespace(
        Viridis=['#440154','#3b528b','#21918c','#5ec962','#fde725'],
        Blues=['#f7fbff','#deebf7','#9ecae1','#3182bd','#08519c'],
    )
    px.colors = px_colors
    sys.modules['plotly.express'] = px
    sys.modules['plotly.express.colors'] = px_colors
    psp = types.ModuleType('plotly.subplots')
    psp.make_subplots = lambda *a, **kw: _PlotlyFig()
    sys.modules['plotly.subplots'] = psp


# ── Test harness ──────────────────────────────────────────────────────────────

PAGE_MAP = {
    "main_NAV":              "main",
    "Setup":                 "streamlit_app._page_00_setup",
    "EF manager":            "streamlit_app._page_05_ef_manager",
    "Scope 1":               "streamlit_app._page_01_scope1",
    "Scope 2":               "streamlit_app._page_02_scope2",
    "Scope 3":               "streamlit_app._page_03_scope3",
    "Data manager":          "streamlit_app._page_07_inventory",
    "Initiatives":           "streamlit_app._page_08_initiatives",
    "Dashboard":             "streamlit_app._page_04_dashboard",
    "Supplier & ESG":        "streamlit_app._page_11_supplier",
    "ESG bridge":            "streamlit_app._page_13_esg_bridge",
    "Risk dashboard":        "streamlit_app._page_18_risk",
    "Logistics map":         "streamlit_app._page_17_logistics",
    "Value chain map":       "streamlit_app._page_20_value_chain",
    "Export":                "streamlit_app._page_06_export",
    "SASB":                  "streamlit_app._page_10_sasb",
    "Checklist":             "streamlit_app._page_09_checklist",
    "Review queue":          "streamlit_app._page_14_review",
    "Audit trail":           "streamlit_app._page_12_audit",
    "Knowledge":             "streamlit_app._page_16_knowledge",
    "Supplier portal":       "streamlit_app._page_15_supplier_portal",
    "Platform Admin":        "streamlit_app._page_19_admin",
}


# Pages where we ALSO want to assert data populates (not just non-crash)
# Mapping: page_module -> list of (org_id, expected_min_metric_calls_with_real_data)
# We instrument st.metric / st.dataframe and check at least N got called with non-zero values
DATA_FLOW_PAGES = {
    # Pages that read inventory and SHOULD show non-empty values for acme/greentech
    "streamlit_app._page_04_dashboard":      ["demo-acme-mfg-001", "demo-greentech-it-002"],
    "streamlit_app._page_13_esg_bridge":     ["demo-acme-mfg-001", "demo-greentech-it-002"],
    "streamlit_app._page_07_inventory":      ["demo-acme-mfg-001", "demo-greentech-it-002"],
    "streamlit_app._page_11_supplier":       ["demo-acme-mfg-001", "demo-greentech-it-002"],
    "streamlit_app._page_17_logistics":      ["demo-acme-mfg-001", "demo-greentech-it-002"],
    "streamlit_app._page_20_value_chain":    ["demo-acme-mfg-001", "demo-greentech-it-002"],
}


ORGS = [
    {"key": "snowkap-platform-admin-000",
     "auth_role": "Platform Admin",
     "auth_user": {"username": "snowkap", "role": "Platform Admin",
                   "org_uuid": "snowkap-platform-admin-000"}},
    {"key": "demo-acme-mfg-001",
     "auth_role": "Admin",
     "auth_user": {"username": "acme_admin", "role": "Admin",
                   "org_uuid": "demo-acme-mfg-001"}},
    {"key": "demo-greentech-it-002",
     "auth_role": "Admin",
     "auth_user": {"username": "greentech_admin", "role": "Admin",
                   "org_uuid": "demo-greentech-it-002"}},
]


def fresh_session(org_meta):
    """Build the session_state expected by render()s."""
    profiles = json.loads((ROOT / "data/org_profiles.json").read_text())
    profile = profiles.get(org_meta["key"], {})
    from inventory.store import get_store
    from ef_store.db import setup_db
    inv = get_store(path=str(ROOT / "data/inventory.sqlite"), org_id=org_meta["key"])
    ef_conn = setup_db(str(ROOT / "data/ef_store.sqlite"))
    state = _SessionState()
    state["org_profile"] = dict(profile)
    state["inventory"] = inv
    state["ef_conn"] = ef_conn
    state["_auth_user"] = org_meta["auth_user"]
    state["nav"] = "Dashboard"
    state["last_page"] = ""
    return state


def _data_flow_ok(shim, page_label):
    """Return (ok, detail). True if metrics/charts/dataframes show non-empty data."""
    # Count metric values that look like real data (non-zero, non-None, non-empty)
    non_zero_metrics = 0
    for label, val in shim.recorded_metrics:
        if val is None: continue
        if isinstance(val, (int, float)) and val != 0: non_zero_metrics += 1
        elif isinstance(val, str):
            sv = val.strip().lower().replace(',', '').replace('.', '').replace('%', '')
            sv = sv.replace('₹', '').replace(' ', '').replace('cr', '').replace('tco₂e', '')
            sv = sv.replace('tco2e', '').replace('-', '').strip()
            if sv and sv not in ('0', '00', '0%', 'na', 'nan', '—', 'none', '?'):
                non_zero_metrics += 1
    n_charts = shim.recorded_charts
    n_dataframes_nonempty = sum(1 for n in shim.recorded_dataframes if n and n > 0)
    n_metrics_total = len(shim.recorded_metrics)
    detail = f"metrics={non_zero_metrics}/{n_metrics_total} charts={n_charts} dfs={n_dataframes_nonempty}"
    # Pass if at least ONE real signal: a non-zero metric, a chart, or a non-empty dataframe
    ok = (non_zero_metrics > 0) or (n_charts > 0) or (n_dataframes_nonempty > 0)
    return ok, detail


def main():
    install_plotly_shim()

    results = {}  # (org, page) -> (ok, exc_str)
    total = 0; failed = 0

    for org_meta in ORGS:
        for page_label, mod_name in PAGE_MAP.items():
            if mod_name == "main":
                # just import-test main.py
                try:
                    shim = install_shim()
                    shim.session_state.update(fresh_session(org_meta))
                    # remove any cached main module
                    for k in list(sys.modules):
                        if k == "main" or k.startswith("streamlit_app."):
                            del sys.modules[k]
                    importlib.import_module("main")
                    results[(org_meta["key"], page_label)] = ("OK", "")
                except SystemExit:
                    results[(org_meta["key"], page_label)] = ("OK", "(SystemExit)")
                except Exception as e:
                    failed += 1
                    results[(org_meta["key"], page_label)] = ("FAIL", f"{type(e).__name__}: {e}")
                total += 1
                continue

            total += 1
            shim = install_shim()
            shim.session_state.update(fresh_session(org_meta))

            try:
                # Fresh import each call
                if mod_name in sys.modules:
                    del sys.modules[mod_name]
                m = importlib.import_module(mod_name)
                if not hasattr(m, "render"):
                    results[(org_meta["key"], page_label)] = ("SKIP", "no render()")
                    continue
                m.render()
                # Data-flow assertion for marked pages
                if (mod_name in DATA_FLOW_PAGES
                        and org_meta["key"] in DATA_FLOW_PAGES[mod_name]):
                    df_ok, df_detail = _data_flow_ok(shim, page_label)
                    if not df_ok:
                        failed += 1
                        results[(org_meta["key"], page_label)] = (
                            "EMPTY", f"no data shown — {df_detail}"
                        )
                        continue
                    results[(org_meta["key"], page_label)] = (
                        "OK", f"({df_detail})"
                    )
                else:
                    results[(org_meta["key"], page_label)] = ("OK", "")
            except Exception as e:
                failed += 1
                tb_lines = traceback.format_exception(type(e), e, e.__traceback__)
                # find line in our code
                relevant = ""
                for line in tb_lines:
                    if "streamlit_app" in line or "/main.py" in line:
                        relevant = line.strip().split('\n')[0][:160]
                        break
                results[(org_meta["key"], page_label)] = (
                    "FAIL", f"{type(e).__name__}: {str(e)[:120]}  @ {relevant[:120]}"
                )

    # Print report
    print(f"\n{'='*100}")
    print(f"Results: {total - failed}/{total} OK · {failed} FAIL")
    print('='*100)
    print(f"\n{'PAGE':<22} {'snowkap':<28} {'acme':<28} {'greentech':<28}")
    print("-" * 110)
    for page_label in PAGE_MAP:
        row = [page_label]
        for org in ORGS:
            r = results.get((org["key"], page_label), ("?", ""))
            cell = r[0] + (" " + r[1] if r[1] else "")
            row.append(cell[:26])
        print(f"  {row[0]:<22} {row[1]:<28} {row[2]:<28} {row[3]:<28}")

    print(f"\n{'='*100}\nFAILURES:\n")
    for (org, page), (status, msg) in results.items():
        if status == "FAIL":
            print(f"  [{org[:25]}] {page}:")
            print(f"      {msg}")
    return failed


if __name__ == "__main__":
    sys.exit(min(main(), 1))
