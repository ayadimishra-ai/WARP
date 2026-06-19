"""
Page 00 — Organisation Setup.

org_id isolation design:
    Every organisation gets a stable UUID (org_uuid) generated on FIRST save.
    This UUID is the true DB partition key — it never changes even if the user
    renames the organisation or changes the display name.

    The UUID is persisted to  data/org_profiles.json  so it survives browser
    refreshes and server restarts. On startup, main.py loads this file and
    restores the session.

    The human-readable org_name is only a display label — it has no effect
    on data isolation. Two users can have the same org name and still have
    completely separate data.

    Legacy records with org_id='default' or other free-text slugs are shown
    under a "Legacy data" section and can be migrated.
"""
import json
import uuid
import streamlit as st
from pathlib import Path

_PROFILES_PATH = Path(__file__).parents[1] / "data" / "org_profiles.json"


# ---------------------------------------------------------------------------
# Profile persistence helpers
# ---------------------------------------------------------------------------

def _load_saved_profiles() -> dict:
    """Load all saved org profiles from disk. Returns {org_uuid: profile_dict}."""
    if _PROFILES_PATH.exists():
        try:
            return json.loads(_PROFILES_PATH.read_text())
        except Exception:
            pass
    return {}


def _save_profile_to_disk(org_uuid: str, profile: dict) -> None:
    """Persist one profile to the profiles file."""
    _PROFILES_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = _load_saved_profiles()
    # Store a serialisable copy (exclude non-JSON-safe items)
    existing[org_uuid] = {k: v for k, v in profile.items()
                          if isinstance(v, (str, int, float, bool, list, type(None)))}
    _PROFILES_PATH.write_text(json.dumps(existing, indent=2))


def _load_profile_on_startup() -> None:
    """
    Called once from main.py or here on page load.
    If session has no org_uuid yet, try to restore the most recently used profile.
    """
    if st.session_state.org_profile.get("org_uuid"):
        return  # already loaded
    saved = _load_saved_profiles()
    if not saved:
        return
    # Use the most recently saved profile (last key in JSON)
    last_uuid = list(saved.keys())[-1]
    last_profile = saved[last_uuid]
    last_profile["org_uuid"] = last_uuid
    last_profile["setup_done"] = True
    st.session_state.org_profile.update(last_profile)


# ---------------------------------------------------------------------------
# Page render
# ---------------------------------------------------------------------------


def render():
    st.title("⚙️ Organisation Setup")
    st.caption("Complete once per reporting cycle. All other pages read from this profile.")

    # ── Theme colour tokens (dark/light) ──────────────────────────────────
    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _card_bg  = "#f0f9ff" if _is_light else "#1a2235"
    _card_txt = "#1f2937" if _is_light else "#e2e8f0"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"
    _border   = "#e2e8f0" if _is_light else "#334155"
    _site_bg  = "#f9fafb" if _is_light else "#151d2e"
    _cat_colors_light = {"GHG": "#dcfce7", "Regulatory": "#fee2e2", "Voluntary": "#dbeafe", "Target": "#fef9c3"}
    _cat_colors_dark  = {"GHG": "#14532d",  "Regulatory": "#7f1d1d",  "Voluntary": "#1e3a5f",  "Target": "#713f12"}

    _load_profile_on_startup()

    profile  = st.session_state.org_profile
    saved    = _load_saved_profiles()
    has_orgs = len(saved) > 0

    # ── Org switcher ──────────────────────────────────────────────────────
    if has_orgs:
        with st.expander("🔄 Switch organisation", expanded=False):
            st.caption("All saved organisation profiles on this device:")
            for uuid_key, prof in saved.items():
                sc1, sc2, sc3 = st.columns([3, 2, 1])
                _lupd = prof.get("last_updated", "")
                _lupd_str = f" · {_lupd}" if _lupd else ""
                sc1.markdown(f"**{prof.get('org_name','?')}**  `{uuid_key[:8]}…`")
                sc2.caption(
                    f"FY {prof.get('fiscal_year','?')}  ·  "
                    f"{prof.get('primary_country','?')}"
                    + _lupd_str
                )
                if sc3.button("Load", key=f"load_{uuid_key}"):
                    prof["org_uuid"]   = uuid_key
                    prof["setup_done"] = True
                    st.session_state.org_profile.update(prof)
                    from inventory.store import get_store
                    inv_path = Path(__file__).parents[1] / "data" / "inventory.sqlite"
                    st.session_state.inventory = get_store(path=str(inv_path), org_id=uuid_key)
                    st.rerun()
        # ── Dark-mode-safe card colours ─────────────────────────────────────
    st.markdown(
        f"""
<style>
.sk-card{{color:{_card_txt} !important;background:{_card_bg};}}
.sk-card *{{color:{_card_txt} !important;}}
.sk-card td,.sk-card th{{color:{_card_txt} !important;padding:4px 8px;}}
.sk-card .lbl{{color:{_dim_txt} !important;font-size:12px;}}
.sk-card code{{color:#60a5fa !important;background:#1e3a5f !important;border-radius:3px;padding:1px 4px;}}
</style>
""",
        unsafe_allow_html=True,
    )

    st.markdown("---")

    # ── Tabs ──────────────────────────────────────────────────────────────
    step1, step2, step3, step4, step5, step6, step7, step8 = st.tabs([
        "1️⃣ Organisation",
        "2️⃣ Reporting period",
        "3️⃣ Boundary & S3",
        "4️⃣ Suppliers",
        "5️⃣ Frameworks",
        "6️⃣ Sites & plants",
        "7️⃣ Intensity metrics",
        "8️⃣ Review & save",
    ])

    # ==================================================================
    # STEP 1 — Organisation
    # ==================================================================
    with step1:
        st.markdown("### Organisation details")
        from streamlit_app.auth import INDUSTRY_CHOICES
        _industry_opts = INDUSTRY_CHOICES
        _curr_industry = profile.get("industry", INDUSTRY_CHOICES[0])
        _industry_idx  = (_industry_opts.index(_curr_industry)
                          if _curr_industry in _industry_opts else 0)

        c1, c2 = st.columns(2)
        with c1:
            org_name = st.text_input(
                "Organisation name",
                value=profile.get("org_name", ""),
                placeholder="Acme Manufacturing Pvt Ltd",
                key="setup_org_name",
            )
            current_uuid = profile.get("org_uuid", "")
            if current_uuid:
                st.caption(f"Organisation ID: `{current_uuid}` _(stable, auto-generated)_")
            else:
                st.caption("An Organisation ID will be auto-generated on first save.")
            industry = st.selectbox(
                "Industry / sector",
                _industry_opts,
                index=_industry_idx,
                help="Used for SASB sector auto-selection, benchmarks, and ESG gap analysis.",
                key="setup_industry",
            )
        with c2:
            _COUNTRY_OPTS = ["IN","US","GB","DE","AU","JP","BR","ZA","ID","CA","FR","CN","OTHER"]
            _ctry_raw = str(profile.get("primary_country", "IN") or "IN").strip().upper()
            _CTRY_ALIASES = {
                "INDIA":"IN", "USA":"US", "UNITED STATES":"US", "UK":"GB",
                "UNITED KINGDOM":"GB", "GERMANY":"DE", "AUSTRALIA":"AU",
                "JAPAN":"JP", "BRAZIL":"BR", "SOUTH AFRICA":"ZA",
                "INDONESIA":"ID", "CANADA":"CA", "FRANCE":"FR", "CHINA":"CN",
            }
            _ctry_norm = _CTRY_ALIASES.get(_ctry_raw, _ctry_raw)
            if _ctry_norm not in _COUNTRY_OPTS:
                _ctry_norm = "OTHER"
            primary_country = st.selectbox(
                "Primary operating country",
                _COUNTRY_OPTS,
                index=_COUNTRY_OPTS.index(_ctry_norm),
                key="setup_country",
            )
            _CURR_OPTS = ["INR","USD","EUR","GBP","AUD","JPY"]
            _curr_norm = str(profile.get("currency", "INR") or "INR").strip().upper()
            if _curr_norm not in _CURR_OPTS:
                _curr_norm = "INR"
            currency = st.selectbox(
                "Reporting currency",
                _CURR_OPTS,
                index=_CURR_OPTS.index(_curr_norm),
                key="setup_currency",
            )
        st.caption(
            "Industry selection flows to SASB sector, benchmarks, "
            "ESG bridge, and Scope 1/3 process suggestions — enter it accurately."
        )

    # ==================================================================
    # STEP 2 — Reporting period
    # ==================================================================
    with step2:
        st.markdown("### Reporting period")
        c3, c4 = st.columns(2)
        with c3:
            reporting_year = st.number_input(
                "Reporting year (calendar)",
                value=profile.get("reporting_year", 2024),
                min_value=2000, max_value=2035, step=1,
                key="setup_rep_year",
            )
            fiscal_year = st.text_input(
                "Fiscal year label",
                value=profile.get("fiscal_year", "2023-24"),
                help="e.g. 2023-24. Used for India CEA grid EF lookup.",
            )
        with c4:
            gwp_ar = st.selectbox(
                "GWP vintage (IPCC AR)",
                [6, 5, 4],
                format_func=lambda x: {4:"AR4 (2007)", 5:"AR5 (2013)", 6:"AR6 (2021)"}[x],
                index=[6, 5, 4].index(profile.get("gwp_ar", 6) if profile.get("gwp_ar", 6) in (4,5,6) else 6),
                help="AR6 is the GHG Protocol default.",
                key="setup_gwp_ar",
            )
            fx_to_usd = st.number_input(
                "FX rate (1 local unit → USD)",
                value=float(profile.get("fx_to_usd", 0.012)),
                format="%.6f",
                help="Used for spend-based Scope 3 (EEIO). Annual average rate.",
                key="setup_fx",
            )

    # ==================================================================
    # STEP 3 — Boundary & Scope 3 materiality
    # ==================================================================
    with step3:
        st.markdown("### Boundary & Scope 3 materiality")

        # Normalise boundary value: legacy profiles may have "Operational control" (human-readable)
        # while widget expects "operational_control" (enum key).
        _boundary_raw = profile.get("boundary", "operational_control") or "operational_control"
        _boundary_norm = str(_boundary_raw).strip().lower().replace(" ", "_").replace("-", "_")
        _BOUND_OPTS = ["operational_control", "financial_control", "equity_share"]
        if _boundary_norm not in _BOUND_OPTS:
            _boundary_norm = "operational_control"
        boundary = st.radio(
            "Consolidation approach",
            _BOUND_OPTS,
            format_func={
                "operational_control": "Operational control (recommended)",
                "financial_control":   "Financial control",
                "equity_share":        "Equity share",
            }.get,
            index=_BOUND_OPTS.index(_boundary_norm),
            horizontal=False,
            key="setup_boundary",
        )

        st.markdown("---")
        st.markdown("**Scope 3 materiality screening**")
        st.caption(
            "GHG Protocol requires assessing all 15 categories. "
            "Check those that are material for your organisation. "
            "Only checked categories appear as tabs in the Scope 3 entry page."
        )

        S3_CATS = [
            ("Cat 1",  "Purchased goods & services"),
            ("Cat 2",  "Capital goods"),
            ("Cat 3",  "Fuel & energy activities"),
            ("Cat 4",  "Upstream transport"),
            ("Cat 5",  "Waste in operations"),
            ("Cat 6",  "Business travel"),
            ("Cat 7",  "Employee commuting"),
            ("Cat 8",  "Upstream leased assets"),
            ("Cat 9",  "Downstream transport"),
            ("Cat 10", "Processing of sold products"),
            ("Cat 11", "Use of sold products"),
            ("Cat 12", "End-of-life treatment"),
            ("Cat 13", "Downstream leased assets"),
            ("Cat 14", "Franchises"),
            ("Cat 15", "Investments (financed emissions)"),
        ]
        existing_s3 = set(profile.get("s3_material_cats", [cat for cat, _ in S3_CATS]))
        s3_checked = {}
        cols_s3 = st.columns(3)
        for ci, (cat, label) in enumerate(S3_CATS):
            s3_checked[cat] = cols_s3[ci % 3].checkbox(
                f"**{cat}** — {label}",
                value=cat in existing_s3,
                key=f"s3_mat_{cat.replace(' ','')}",
            )

    # ==================================================================
    # STEP 4 — Suppliers
    # ==================================================================
    with step4:
        st.markdown("### Suppliers")
        st.caption(
            "Tell us about your supply chain. This unlocks supplier-linked GHG tracking, "
            "the Supplier & ESG dashboard, and Cat 1/4 attribution."
        )

        # Normalise org_role: legacy profiles may have "Manufacturer", "SaaS provider",
        # etc. Map to the four enum values the widget expects.
        _ROLE_OPTS = ["buyer", "supplier", "both", "none"]
        _role_raw  = (profile.get("org_role", "buyer") or "buyer").strip().lower()
        _ROLE_ALIASES = {
            # Legacy / human-readable values mapped to enum
            "buyer":          "buyer",
            "supplier":       "supplier",
            "both":           "both",
            "none":           "none",
            "manufacturer":   "both",     # makes & ships
            "producer":       "both",
            "distributor":    "both",
            "retailer":       "buyer",
            "service provider":   "none",
            "saas provider":      "supplier",
            "saas":               "supplier",
            "software":           "supplier",
            "consulting":         "supplier",
            "platform":           "both",
            "trader":             "both",
            "wholesaler":         "buyer",
        }
        _role_norm = _ROLE_ALIASES.get(_role_raw, _role_raw)
        if _role_norm not in _ROLE_OPTS:
            _role_norm = "buyer"
        org_role = st.radio(
            "Your organisation's role in the supply chain",
            _ROLE_OPTS,
            format_func={
                "buyer":    "Buyer — I purchase from suppliers",
                "supplier": "Supplier — I supply to customers",
                "both":     "Both buyer and supplier",
                "none":     "Neither (service provider / government)",
            }.get,
            index=_ROLE_OPTS.index(_role_norm),
            horizontal=False,
            help="Determines which supply chain features are shown. "
                 "Legacy values like 'Manufacturer' or 'SaaS provider' map automatically.",
            key="setup_org_role",
        )

        st.markdown("---")
        st.markdown("**Add your key suppliers** _(optional — you can add more later in 🏢 Supplier & ESG)_")
        st.caption(
            "Registering suppliers here links them to your GHG records and enables "
            "Cat 1/4 attribution, ESG scoring, and the logistics map."
        )

        import json as _json
        from pathlib import Path as _Path
        _sup_file = _Path(__file__).parents[1] / "data" / "suppliers.json"
        _existing_sups = []
        if _sup_file.exists():
            try:
                _existing_sups = _json.loads(_sup_file.read_text(encoding="utf-8"))
            except Exception:
                pass

        if _existing_sups:
            st.markdown(f"**{len(_existing_sups)} suppliers already registered:**")
            for s in _existing_sups[:5]:
                st.write(f"  • {s['name']} — {s.get('category','—')} — {s.get('material','—')}")
            if len(_existing_sups) > 5:
                st.caption(f"+ {len(_existing_sups)-5} more. Edit in 🏢 Supplier & ESG.")

        with st.expander("➕ Add supplier now", expanded=not _existing_sups):
            with st.form("setup_add_supplier"):
                sa1, sa2 = st.columns(2)
                _sup_name     = sa1.text_input("Supplier name *", placeholder="Alpha Metals Ltd")
                _sup_category = sa2.selectbox("Category",
                    ["Raw materials","Chemicals","Electronics","Agriculture","Plastics",
                     "Textiles","Machinery","Packaging","Food processing",
                     "Transport equipment","Other"])
                sb1, sb2, sb3 = st.columns(3)
                _sup_material = sb1.text_input("Primary material / service")
                _sup_country  = sb2.selectbox("Supplier country",
                    ["IN","CN","US","DE","GB","JP","VN","BD","TR","KR","TW","TH","OTHER"])
                _sup_spend    = sb3.number_input("Annual spend (₹ Cr)", min_value=0.0, step=0.1)
                _sup_submit   = st.form_submit_button("Add supplier", type="primary")
                if _sup_submit and _sup_name.strip():
                    import uuid as _uuid
                    _new_sup = {
                        "name":     _sup_name.strip(),
                        "category": _sup_category,
                        "material": _sup_material.strip(),
                        "country":  _sup_country,
                        "spend_cr": _sup_spend,
                        "e_score":  50, "s_score": 50, "g_score": 50,
                        "risk":     "Medium", "engagement": "Active",
                        "audit_date": "", "notes": "",
                        "ghg_cat1_tco2e": 0.0, "ghg_cat4_tco2e": 0.0,
                    }
                    _existing_sups.append(_new_sup)
                    _sup_file.parent.mkdir(parents=True, exist_ok=True)
                    _sup_file.write_text(
                        _json.dumps(_existing_sups, indent=2), encoding="utf-8"
                    )
                    st.toast(f"✅ {_sup_name} added!", icon="✅")
                    st.rerun()

    # ==================================================================
    # STEP 5 — Intensity metrics
    # ==================================================================
    with step5:
        st.markdown("### Disclosure frameworks & reporting requirements")
        st.caption(
            "Select which ESG and GHG frameworks you are required or intending to report against. "
            "sk.lite will tailor SASB metrics, ESG bridge mapping, and checklist items accordingly."
        )

        _FRAMEWORKS = {
            "GHG Protocol": {
                "desc": "Corporate Standard (2004) + Value Chain (2011). Required by most frameworks below.",
                "mandatory": True,
                "category": "GHG",
            },
            "BRSR (SEBI India)": {
                "desc": "Business Responsibility & Sustainability Report — mandatory for top 1000 NSE/BSE companies.",
                "mandatory": False,
                "category": "Regulatory",
            },
            "BRSR Core": {
                "desc": "BRSR Core assurance metrics — mandatory from FY2024-25 for top 150 listed companies.",
                "mandatory": False,
                "category": "Regulatory",
            },
            "CDP Climate": {
                "desc": "Carbon Disclosure Project — voluntary but investor/customer mandated.",
                "mandatory": False,
                "category": "Voluntary",
            },
            "GRI Standards": {
                "desc": "Global Reporting Initiative — universal sustainability reporting standard.",
                "mandatory": False,
                "category": "Voluntary",
            },
            "SASB Standards": {
                "desc": "Sector-specific disclosure — industry-specific materiality map.",
                "mandatory": False,
                "category": "Voluntary",
            },
            "TCFD": {
                "desc": "Task Force on Climate-related Financial Disclosures — physical + transition risk.",
                "mandatory": False,
                "category": "Voluntary",
            },
            "SBTi": {
                "desc": "Science Based Targets initiative — near-term + net-zero target validation.",
                "mandatory": False,
                "category": "Target",
            },
            "EU CSRD / ESRS": {
                "desc": "EU Corporate Sustainability Reporting Directive — mandatory for EU-linked entities.",
                "mandatory": False,
                "category": "Regulatory",
            },
            "ISSB / IFRS S2": {
                "desc": "IFRS Sustainability Disclosure Standards — climate risk disclosure.",
                "mandatory": False,
                "category": "Voluntary",
            },
        }

        _saved_frameworks = profile.get("reporting_frameworks", ["GHG Protocol"])
        _selected = []

        _fw_cats = {}
        for fw, meta in _FRAMEWORKS.items():
            _fw_cats.setdefault(meta["category"], []).append((fw, meta))

        for cat, items in _fw_cats.items():
            _cat_colors = _cat_colors_light if _is_light else _cat_colors_dark
            st.markdown(
                f"<div style='background:{_cat_colors.get(cat, _card_bg)};"
                f"color:{_card_txt};border-radius:6px;padding:4px 10px;"
                f"margin:8px 0 4px;font-size:12px;font-weight:700'>"
                f"{cat}</div>",
                unsafe_allow_html=True,
            )
            for fw, meta in items:
                checked = fw in _saved_frameworks
                if st.checkbox(
                    fw,
                    value=checked,
                    key=f"fw_{fw.replace(' ','_').replace('/','_')}",
                    help=meta["desc"],
                    disabled=meta.get("mandatory", False),
                ):
                    _selected.append(fw)
                elif meta.get("mandatory"):
                    _selected.append(fw)  # always include mandatory

        # Save to profile
        profile["reporting_frameworks"] = _selected
        st.session_state.org_profile["reporting_frameworks"] = _selected

        st.markdown("---")
        if _selected:
            st.success(
                f"Selected **{len(_selected)} framework(s)**: "
                + ", ".join(_selected)
            )
            st.caption(
                "These selections tailor your SASB sector metrics, ESG bridge mapping, "
                "checklist items, and export templates."
            )

        # ── Framework badge strip (dark-mode-aware) ──────────────────────────
        _is_light_s = st.session_state.get("_sk_theme", "light") == "light"
        _ghg_bg   = "#dcfce7" if _is_light_s else "#064e3b"
        _reg_bg   = "#fee2e2" if _is_light_s else "#450a0a"
        _vol_bg   = "#dbeafe" if _is_light_s else "#1e3a5f"
        st.markdown(
            f"<span style='background:{_ghg_bg};border-radius:4px;padding:2px 8px;font-size:0.8rem'>GHG Protocol</span> "
            f"<span style='background:{_reg_bg};border-radius:4px;padding:2px 8px;font-size:0.8rem'>BRSR</span> "
            f"<span style='background:{_vol_bg};border-radius:4px;padding:2px 8px;font-size:0.8rem'>CDP</span>",
            unsafe_allow_html=True,
        )

    with step6:
        st.markdown("### Sites, plants & facilities")
        st.caption(
            "Register your operational sites. "
            "Site data flows to: logistics map (plant markers), "
            "Scope 1 site breakdown, and dashboard geographic analysis."
        )

        import json as _site_json
        from pathlib import Path as _SitePath
        _sites_file = _SitePath(__file__).parents[1] / "data" / "sites.json"
        _existing_sites: list = []
        if _sites_file.exists():
            try:
                _existing_sites = _site_json.loads(_sites_file.read_text(encoding="utf-8"))
            except Exception:
                pass

        # Show existing sites
        if _existing_sites:
            st.markdown(f"**{len(_existing_sites)} site(s) registered:**")
            _site_cols = st.columns(min(3, len(_existing_sites)))
            for _si, _site in enumerate(_existing_sites):
                _sc = _site_cols[_si % 3]
                _sc.markdown(
                    f"<div style='border:1px solid {_border};border-radius:8px;"
                    f"padding:10px;margin:4px 0;background:{_site_bg}'>"
                    f"<b>📍 {_site['name']}</b><br>"
                    f"<span style='font-size:12px;color:{_dim_txt}'>"
                    f"{_site.get('type','—')} · {_site.get('city','—')}, {_site.get('country','IN')}<br>"
                    f"Lat {_site.get('lat',0):.4f} / Lon {_site.get('lon',0):.4f}</span>"
                    f"</div>",
                    unsafe_allow_html=True
                )

        # Add new site form
        _SITE_TYPES = [
            "Manufacturing plant", "Warehouse / DC", "Office / HQ",
            "Data centre", "Research facility", "Retail outlet",
            "Construction site", "Mining / extraction", "Power plant", "Other",
        ]
        _INDIA_CITIES = {
            "Mumbai":    (19.0760, 72.8777), "Delhi":     (28.6139, 77.2090),
            "Bengaluru": (12.9716, 77.5946), "Chennai":   (13.0827, 80.2707),
            "Kolkata":   (22.5726, 88.3639), "Hyderabad": (17.3850, 78.4867),
            "Pune":      (18.5204, 73.8567), "Ahmedabad": (23.0225, 72.5714),
            "Surat":     (21.1702, 72.8311), "Jaipur":    (26.9124, 75.7873),
            "Lucknow":   (26.8467, 80.9462), "Nagpur":    (21.1458, 79.0882),
            "Indore":    (22.7196, 75.8577), "Thane":     (19.2183, 72.9781),
            "Bhopal":    (23.2599, 77.4126), "Visakhapatnam": (17.6868, 83.2185),
            "Pimpri":    (18.6279, 73.7898), "Patna":     (25.5941, 85.1376),
            "Vadodara":  (22.3072, 73.1812), "Ghaziabad": (28.6692, 77.4538),
            "Custom (enter manually)": (0.0, 0.0),
        }

        with st.expander("➕ Add new site", expanded=not _existing_sites):
            with st.form("add_site_form"):
                _sf1, _sf2 = st.columns(2)
                _site_name = _sf1.text_input("Site name *", placeholder="Pune Plant / Chennai DC")
                _site_type = _sf2.selectbox("Site type", _SITE_TYPES)
                _sc1, _sc2, _sc3 = st.columns(3)
                _city_choice = _sc1.selectbox("City (India)", list(_INDIA_CITIES.keys()), key="site_city")
                _site_country = _sc2.selectbox("Country", ["IN","US","GB","DE","AU","CN","JP","OTHER"])
                _site_address = _sc3.text_input("Address / postal code", placeholder="Plot 12, MIDC...")

                # Auto-fill lat/lon from city selection
                _auto_lat, _auto_lon = _INDIA_CITIES.get(_city_choice, (0.0, 0.0))
                _sg1, _sg2 = st.columns(2)
                _site_lat = _sg1.number_input(
                    "Latitude", value=_auto_lat, format="%.4f",
                    help="Auto-filled from city. Adjust for exact plant location."
                )
                _site_lon = _sg2.number_input(
                    "Longitude", value=_auto_lon, format="%.4f",
                )
                _site_area = st.number_input(
                    "Floor area (m²) — optional, for intensity calculations",
                    min_value=0.0, format="%.0f"
                )
                _site_submit = st.form_submit_button("Add site", type="primary")
                if _site_submit and _site_name.strip():
                    _city_name = _city_choice if _city_choice != "Custom (enter manually)" else ""
                    _new_site = {
                        "name":     _site_name.strip(),
                        "type":     _site_type,
                        "city":     _city_name,
                        "country":  _site_country,
                        "address":  _site_address.strip(),
                        "lat":      float(_site_lat),
                        "lon":      float(_site_lon),
                        "area_m2":  float(_site_area),
                    }
                    _existing_sites.append(_new_site)
                    _sites_file.parent.mkdir(parents=True, exist_ok=True)
                    _sites_file.write_text(
                        _site_json.dumps(_existing_sites, indent=2), encoding="utf-8"
                    )
                    # Also persist to org profile for cross-page access
                    st.session_state.org_profile["sites"] = _existing_sites
                    st.toast(f"✅ {_site_name} added!", icon="📍")
                    st.rerun()

        # Delete site
        if _existing_sites:
            _del_site = st.selectbox(
                "Delete a site",
                ["— select to delete —"] + [s["name"] for s in _existing_sites],
                key="delete_site_sel"
            )
            if _del_site != "— select to delete —":
                if st.button(f"🗑️ Delete '{_del_site}'", key="del_site_btn"):
                    _existing_sites = [s for s in _existing_sites if s["name"] != _del_site]
                    _sites_file.write_text(_site_json.dumps(_existing_sites, indent=2), encoding="utf-8")
                    st.session_state.org_profile["sites"] = _existing_sites
                    st.rerun()

    with step7:
        st.markdown("### Intensity denominators _(optional)_")
        st.caption(
            "GHG intensity = total tCO₂e ÷ a business metric. "
            "Used for BRSR P6-E4, CDP C6, and SBTi pathway tracking."
        )

        ic1, ic2, ic3 = st.columns(3)
        revenue_cr = ic1.number_input(
            "Annual revenue (₹ crore)",
            min_value=0.0, value=float(profile.get("revenue_inr_cr", 0.0)),
            format="%.2f",
            key="setup_revenue",
            help="Used for tCO₂e/crore INR intensity (BRSR). 1 crore = 10M INR.",
        )
        employees = ic2.number_input(
            "Total employees (FTE)",
            min_value=0, value=int(profile.get("employees", 0)), step=1,
            key="setup_employees",
            help="Used for tCO₂e/employee intensity.",
        )
        production_unit = ic3.text_input(
            "Production unit label",
            value=profile.get("production_unit", "units") or "units",
            placeholder="e.g. tonnes, vehicles, m²",
            key="setup_prod_unit",
        )
        production_volume = st.number_input(
            f"Annual production volume ({production_unit})",
            min_value=0.0, value=float(profile.get("production_volume", 0.0)),
            format="%.2f",
            help="Used for tCO₂e per unit of output intensity.",
        )
        st.caption(
            "You can leave these blank now and fill them in the "
            "📊 Dashboard → Intensity metrics tab at any time."
        )

    # ==================================================================
    # STEP 6 — Review & Save
    # ==================================================================
    with step8:
        st.markdown("### Review & Save")

        # Read LIVE values from widget session_state keys (what user has typed right now)
        _ss = st.session_state
        _live_org_name   = _ss.get("setup_org_name",    profile.get("org_name",""))
        _live_industry   = _ss.get("setup_industry",    profile.get("industry",""))
        _live_country    = _ss.get("setup_country",     profile.get("primary_country","IN"))
        _live_currency   = _ss.get("setup_currency",    profile.get("currency","INR"))
        _live_rep_year   = _ss.get("setup_rep_year",    profile.get("reporting_year",2024))
        _live_fy         = _ss.get("setup_fiscal_year", profile.get("fiscal_year",""))
        _live_gwp        = _ss.get("setup_gwp_ar",      profile.get("gwp_ar",6))
        _live_boundary   = _ss.get("setup_boundary",    profile.get("boundary","operational_control"))
        _live_org_role   = _ss.get("setup_org_role",    profile.get("org_role","buyer"))
        _live_revenue    = _ss.get("setup_revenue",     profile.get("revenue_inr_cr",0))
        _live_employees  = _ss.get("setup_employees",   profile.get("employees",0))
        _live_prod_unit  = _ss.get("setup_prod_unit",   profile.get("production_unit","units"))
        _live_prod_vol   = _ss.get("setup_prod_vol",    profile.get("production_volume",0))
        _live_last_saved = profile.get("last_updated","Not saved yet")

        # Preview card
        # Show preview if EITHER the widget has a value OR the profile already has one
        _show_preview = bool(_live_org_name or profile.get("org_name"))
        if _show_preview:
            _display_name = _live_org_name or profile.get("org_name","")
            _prev_border  = "#0ea5e9" if _is_light else "#1e6fa8"
            st.markdown(
                f"<div class='sk-card' style='background:{_card_bg};border:1px solid {_prev_border};"
                "border-radius:10px;padding:16px;'>"
                "<h4 style='margin:0 0 10px'>📋 Profile preview</h4>"
                f"<table style='width:100%;border-collapse:collapse;font-size:13px'>"
                f"<tr><td style='padding:4px 8px;color:{_dim_txt}'>Organisation</td>"
                f"<td style='padding:4px 8px;font-weight:600'>{_live_org_name or '—'}</td>"
                f"<td style='padding:4px 8px;color:{_dim_txt}'>Industry</td>"
                f"<td style='padding:4px 8px;font-weight:600'>{_live_industry or '—'}</td></tr>"
                f"<tr><td style='padding:4px 8px;color:{_dim_txt}'>Country</td>"
                f"<td style='padding:4px 8px'>{_live_country}</td>"
                f"<td style='padding:4px 8px;color:{_dim_txt}'>Currency</td>"
                f"<td style='padding:4px 8px'>{_live_currency}</td></tr>"
                f"<tr><td style='padding:4px 8px;color:{_dim_txt}'>Reporting year</td>"
                f"<td style='padding:4px 8px'>{_live_rep_year}</td>"
                f"<td style='padding:4px 8px;color:{_dim_txt}'>Fiscal year</td>"
                f"<td style='padding:4px 8px'>{_live_fy}</td></tr>"
                f"<tr><td style='padding:4px 8px;color:{_dim_txt}'>GWP vintage</td>"
                f"<td style='padding:4px 8px'>AR{_live_gwp}</td>"
                f"<td style='padding:4px 8px;color:{_dim_txt}'>Boundary</td>"
                f"<td style='padding:4px 8px'>{str(_live_boundary).replace('_',' ').title()}</td></tr>"
                f"<tr><td style='padding:4px 8px;color:{_dim_txt}'>Role</td>"
                f"<td style='padding:4px 8px'>{str(_live_org_role).title()}</td>"
                f"<td style='padding:4px 8px;color:{_dim_txt}'>Revenue</td>"
                f"<td style='padding:4px 8px'>₹{_live_revenue or 0:,.1f} Cr</td></tr>"
                f"<tr><td style='padding:4px 8px;color:{_dim_txt}'>Employees</td>"
                f"<td style='padding:4px 8px'>{int(_live_employees or 0):,}</td>"
                f"<td style='padding:4px 8px;color:{_dim_txt}'>Production</td>"
                f"<td style='padding:4px 8px'>{_live_prod_vol or 0:,.0f} {_live_prod_unit}</td></tr>"
                f"</table>"
                f"<p style='margin:10px 0 0;font-size:11px;color:{_dim_txt}'>Last saved: {_live_last_saved}</p>"
                f"<p style='margin:4px 0 0;font-size:11px;color:{_dim_txt}'>"
                f"Frameworks: {', '.join(profile.get('reporting_frameworks', []) or ['GHG Protocol'])}</p>"
                "</div>",
                unsafe_allow_html=True,
            )
        else:
            st.info(
                "⚠️ No organisation name yet. "
                "Go to **1️⃣ Organisation** tab and enter your organisation name, "
                "then return here to save."
            )

        st.markdown("---")

        if st.button("💾 Save profile", type="primary"):
            import uuid as _uuid2
            # Derive org_uuid
            _org_uuid = profile.get("org_uuid") or str(_uuid2.uuid4())

            # Derive SASB sector from industry
            # _SECTOR_TO_SASB alias kept for backward compatibility with older tests
            _SECTOR_TO_SASB = _INDUSTRY_TO_SASB = {
                "Manufacturing": "Resource Transformation",
                "Automotive": "Resource Transformation",
                "Cement": "Infrastructure",
                "Cement / Construction": "Infrastructure",
                "Chemicals": "Resource Transformation",
                "Electronics": "Technology & Communications",
                "FMCG": "Consumer Goods", "Consumer": "Consumer Goods",
                "Retail / Consumer": "Consumer Goods",
                "Metals": "Extractives & Minerals Processing",
                "Pharmaceutical": "Health Care",
                "Healthcare / Pharma": "Health Care",
                "Textiles": "Consumer Goods",
                "Oil": "Extractives & Minerals Processing",
                "Power": "Infrastructure", "Renewable": "Infrastructure",
                "Energy": "Extractives & Minerals Processing",
                "Energy / Utilities": "Infrastructure",
                "Agriculture": "Food & Beverage", "Food": "Food & Beverage",
                "Agriculture / Food": "Food & Beverage",
                "Information": "Technology & Communications",
                "Software": "Technology & Communications",
                "Information Technology": "Technology & Communications",
                "Technology": "Technology & Communications",
                "Financial Services": "Financials",
                "Financial": "Financials", "Banking": "Financials",
                "Insurance": "Financials", "Asset": "Financials",
                "Retail": "Consumer Goods",
                "Healthcare": "Health Care",
                "Logistics": "Transportation", "Transport": "Transportation",
                "Transport / Logistics": "Transportation",
                "Real Estate": "Infrastructure",
                "Hospitality": "Services",
            }
            # Read current widget values from session_state keys (set by each tab's widgets)
            # This is how Streamlit cross-tab reads work — each widget has key="setup_*"
            ss = st.session_state
            _org_name    = ss.get("setup_org_name",     profile.get("org_name", ""))
            _industry    = ss.get("setup_industry",     profile.get("industry", ""))
            _country     = ss.get("setup_country",      profile.get("primary_country", "IN"))
            _currency    = ss.get("setup_currency",     profile.get("currency", "INR"))
            _rep_year    = ss.get("setup_rep_year",     profile.get("reporting_year", 2024))
            _fiscal_year = ss.get("setup_fiscal_year",  profile.get("fiscal_year", "2023-24"))
            _gwp_ar      = ss.get("setup_gwp_ar",       profile.get("gwp_ar", 6))
            _fx          = ss.get("setup_fx",            profile.get("fx_to_usd", 0.012))
            _boundary    = ss.get("setup_boundary",     profile.get("boundary", "operational_control"))
            _org_role    = ss.get("setup_org_role",     profile.get("org_role", "buyer"))
            _revenue     = float(ss.get("setup_revenue",  profile.get("revenue_inr_cr", 0.0)) or 0)
            _employees   = int(ss.get("setup_employees",  profile.get("employees", 0)) or 0)
            _prod_unit   = ss.get("setup_prod_unit",    profile.get("production_unit", "units")) or "units"
            _prod_vol    = float(ss.get("setup_prod_vol", profile.get("production_volume", 0.0)) or 0)

            _sasb_sector = None
            for kw, sec in _INDUSTRY_TO_SASB.items():
                if kw.lower() in _industry.lower():
                    _sasb_sector = sec
                    break

            _s3_mat = [cat for cat, _ in [
                ("Cat 1",""),("Cat 2",""),("Cat 3",""),("Cat 4",""),("Cat 5",""),
                ("Cat 6",""),("Cat 7",""),("Cat 8",""),("Cat 9",""),("Cat 10",""),
                ("Cat 11",""),("Cat 12",""),("Cat 13",""),("Cat 14",""),("Cat 15",""),
            ] if st.session_state.get(f"s3_mat_{cat.replace(' ','')}", True)]

            from datetime import datetime as _dt
            new_profile = {
                "org_name":          _org_name,
                "org_uuid":          _org_uuid,
                "last_updated":      _dt.now().strftime("%Y-%m-%d %H:%M"),
                "org_id":            _org_uuid,
                "industry":          _industry,
                "primary_country":   _country,
                "currency":          _currency,
                "reporting_year":    int(_rep_year),
                "fiscal_year":       str(_fiscal_year),
                "gwp_ar":            int(_gwp_ar),
                "fx_to_usd":         float(_fx),
                "boundary":          _boundary,
                "org_role":          _org_role,
                "s3_material_cats":  _s3_mat,
                "sasb_sector":       _sasb_sector or "",
                "sector":            _sasb_sector or "",  # alias for sasb_sector
                "revenue_inr_cr":    _revenue,
                "employees":         _employees,
                "production_unit":   _prod_unit,
                "production_volume": _prod_vol,
                "sites":             st.session_state.get("_site_list", profile.get("sites", [])),
                "setup_done":        True,
            }
            st.session_state.org_profile.update(new_profile)
            _save_profile_to_disk(_org_uuid, new_profile)

            # Clear derived caches on org change
            st.session_state.pop("sasb_override_sector", None)
            st.session_state.pop("_inv_org_uuid", None)
            # Clear review_queue cache on org change
            st.session_state.pop("review_queue", None)

            # Ensure inventory store is initialised for this org
            from inventory.store import get_store
            inv_path = Path(__file__).parents[1] / "data" / "inventory.sqlite"
            st.session_state.inventory = get_store(
                path=str(inv_path), org_id=_org_uuid
            )
            st.session_state["_setup_just_saved"] = _org_name or "Profile"
            st.rerun()

        # Show balloons on the render AFTER save (session_state persists)
        _just_saved = st.session_state.get("_setup_just_saved")
        if _just_saved:
            del st.session_state["_setup_just_saved"]
            st.balloons()
            st.success(f"✅ **{_just_saved}** saved! All pages now use this profile.")

        if profile.get("setup_done"):
            _last_upd = profile.get("last_updated", "")
            _upd_str  = f" · Last saved: {_last_upd}" if _last_upd else ""
            _is_light_setup = st.session_state.get("_sk_theme", "light") == "light"
            _banner_bg  = "#f0fdf4" if _is_light_setup else "#052e16"
            _banner_txt = "#14532d" if _is_light_setup else "#86efac"
            st.markdown(
                f"<div style='background:{_banner_bg};border-radius:6px;padding:8px 12px;"
                f"color:{_banner_txt};font-weight:600'>✅ Organisation profile saved.</div>",
                unsafe_allow_html=True,
            )
            st.caption(
                f"sk.lite is configured for **{profile.get('org_name','your organisation')}** "
                f"· FY {profile.get('fiscal_year','—')} "
                f"· {profile.get('primary_country','—')}"
                + _upd_str
            )
            _sbadge = profile.get("sasb_sector","")
            if _sbadge:
                st.caption(f"SASB sector auto-detected: **{_sbadge}**")

        st.markdown("---")
        # ── Export profile (for backup / sharing) ─────────────────────
        import json as _json_exp
        if profile.get("setup_done"):
            _exp_profile = {k: v for k, v in profile.items() 
                           if k not in ("setup_done",)}
            st.download_button(
                "⬇️ Export profile (.json)",
                data=_json_exp.dumps(_exp_profile, indent=2),
                file_name=f"sk_lite_profile_{profile.get('org_name','org').replace(' ','_')}.json",
                mime="application/json",
                key="export_profile_btn",
                help="Save your setup profile as a JSON file for backup or transfer.",
            )

        # ── Import profile from file ──────────────────────────────────
        with st.expander("📥 Import profile from file", expanded=False):
            _uploaded_profile = st.file_uploader(
                "Import sk.lite profile JSON",
                type=["json"],
                key="restore_profile_uploader",
                label_visibility="collapsed",
            )
            if _uploaded_profile:
                try:
                    _restored = _json_exp.loads(_uploaded_profile.read().decode("utf-8"))
                    if st.button("✅ Apply restored profile", key="apply_restore_btn"):
                        st.session_state.org_profile.update(_restored)
                        st.session_state.org_profile["setup_done"] = True
                        st.toast("Profile restored!", icon="✅")
                        st.rerun()
                except Exception as _e:
                    st.error(f"Could not read profile: {_e}")
