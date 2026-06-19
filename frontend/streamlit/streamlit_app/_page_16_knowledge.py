"""
Page 16 — Knowledge Base.

Reference material for GHG accounting and ESG reporting:
  - Emission factor source citations with confidence grades
  - ESRS–GHG Protocol crossmap (which ESRS datapoint needs which GHG data)
  - Calculation methodology notes per process
  - Glossary of GHG / ESG terms
  - External links to authoritative sources
"""
from __future__ import annotations
import streamlit as st

# ── EF source registry ────────────────────────────────────────────────────────
EF_SOURCES = [
    {
        "id":      "CEA_v20",
        "name":    "Central Electricity Authority (CEA) v20 — India Grid Emission Factors",
        "year":    "FY 2013-14 to FY 2023-24",
        "scope":   "Scope 2 — Grid electricity (India)",
        "quality": "A",
        "note":    "National EF published by MoP India. CO₂ only (CH4/N2O negligible for grid). "
                   "State/regional DISCOMs not disaggregated in v20.",
        "url":     "https://cea.nic.in/",
    },
    {
        "id":      "IPCC_2006",
        "name":    "IPCC 2006 Guidelines for National GHG Inventories",
        "year":    "2006 (updated 2019)",
        "scope":   "Scope 1 — Stationary/mobile combustion, IPPU, AFOLU",
        "quality": "B",
        "note":    "Global default Tier 1 EFs. Uncertainty ±1–5% for combustion, "
                   "±15–50% for fugitive and AFOLU. Use national EFs where available.",
        "url":     "https://www.ipcc-nggip.iges.or.jp/public/2006gl/",
    },
    {
        "id":      "IPCC_EFDB",
        "name":    "IPCC Emission Factor Database (EFDB) — India-specific",
        "year":    "2023 update",
        "scope":   "Scope 1 — Fuel combustion, Indian fuels",
        "quality": "B+",
        "note":    "78 India-specific EFs extracted. Net Calorific Values from MoPNG/BEE. "
                   "Covers coal varieties (lignite, sub-bituminous, bituminous).",
        "url":     "https://www.ipcc-nggip.iges.or.jp/EFDB/",
    },
    {
        "id":      "DEFRA_2024",
        "name":    "DEFRA / BEIS GHG Conversion Factors 2024",
        "year":    "2024",
        "scope":   "Scope 1/3 — Transport, waste, WTT upstream",
        "quality": "B",
        "note":    "UK government factors. Used for non-India transport where India EFs "
                   "not available. Well-to-tank (WTT) upstream factors included.",
        "url":     "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    },
    {
        "id":      "USEEIO_v2",
        "name":    "US EPA USEEIO v2 — Environmentally Extended Input-Output Model",
        "year":    "2021",
        "scope":   "Scope 3 Cat 1 — Purchased goods (spend-based)",
        "quality": "C",
        "note":    "220 industry sectors. High uncertainty (±50–300%). Use only where "
                   "primary supplier data unavailable. Multi-currency FX applied.",
        "url":     "https://www.epa.gov/land-research/us-environmentally-extended-input-output-useeio-technical-content",
    },
    {
        "id":      "MoPNG_2022",
        "name":    "Ministry of Petroleum and Natural Gas (India) — Upstream EFs",
        "year":    "2022",
        "scope":   "Scope 3 Cat 3A — Well-to-tank upstream for natural gas",
        "quality": "B",
        "note":    "10.2 kgCO₂e/GJ WTT factor for India natural gas. "
                   "Includes extraction, processing, and transmission losses.",
        "url":     "https://mopng.gov.in/",
    },
    {
        "id":      "IPCC_AR6",
        "name":    "IPCC AR6 GWP100 (2021)",
        "year":    "2021",
        "scope":   "All scopes — GWP conversion factors",
        "quality": "A",
        "note":    "CH4=29.8 (fossil), CH4=27.9 (biogenic), N2O=273. "
                   "AR4 (CH4=25, N2O=298) and AR5 (CH4=28, N2O=265) also supported.",
        "url":     "https://www.ipcc.ch/report/ar6/wg1/",
    },
]

# ── Glossary ─────────────────────────────────────────────────────────────────
GLOSSARY = {
    "tCO₂e": "Tonnes of CO₂ equivalent. All GHGs converted using GWP100 factors.",
    "GWP100": "Global Warming Potential over 100 years. Converts CH4, N2O, HFCs etc. to CO2-equivalent.",
    "Scope 1": "Direct emissions from owned/controlled sources (combustion, process, fugitive).",
    "Scope 2": "Indirect emissions from purchased electricity, steam, heating, or cooling.",
    "Scope 3": "All other indirect emissions in a company's value chain (15 categories).",
    "Location-based S2": "Scope 2 using average grid emission factor for the region.",
    "Market-based S2": "Scope 2 using supplier-specific or contractual (REC/GO) emission factor.",
    "EF": "Emission factor — amount of GHG emitted per unit of activity (e.g. kgCO₂/GJ).",
    "WTT": "Well-to-tank — upstream emissions from fuel extraction and processing (Cat 3A).",
    "PCAF": "Partnership for Carbon Accounting Financials — standard for Cat 15 financed emissions.",
    "ESRS": "European Sustainability Reporting Standards — mandatory for EU CSRD-in-scope companies.",
    "BRSR": "Business Responsibility and Sustainability Report — mandatory for NSE/BSE top 1000 companies.",
    "CDP": "Carbon Disclosure Project — voluntary ESG questionnaire used by investors.",
    "GRI": "Global Reporting Initiative — most widely used voluntary ESG reporting standard.",
    "TCFD": "Task Force on Climate-related Financial Disclosures — climate risk framework.",
    "SASB": "Sustainability Accounting Standards Board — industry-specific material ESG metrics.",
    "SBTi": "Science Based Targets initiative — sets corporate emissions reduction targets aligned with 1.5°C.",
    "CEA": "Central Electricity Authority — India's national electricity grid regulator and EF publisher.",
    "DQ grade": "Data quality grade A–E based on % fallback EFs used (A=all national, E=mostly global defaults).",
    "Fallback EF": "A global/continental default EF used when a national or supplier-specific EF is unavailable.",
    "Biogenic CO₂": "CO₂ from combustion of biomass (wood, biogas). Reported separately, excluded from totals.",
    "AFOLU": "Agriculture, Forestry and Other Land Use — IPCC category for agricultural emissions.",
    "IPPU": "Industrial Processes and Product Use — cement, steel, glass, chemicals process emissions.",
    "Cat 15": "Scope 3 Category 15 — financed emissions (investments, loans, underwriting).",
    "Assurance": "Third-party independent verification of a GHG inventory. Reasonable or limited level.",
}

# ── Methodology notes ─────────────────────────────────────────────────────────
METHODOLOGY = [
    ("Stationary combustion",
     "IPCC 2006 Tier 1. Activity data × NCV × EF_CO2 + EF_CH4 × GWP100(CH4) + EF_N2O × GWP100(N2O). "
     "NCV priority: India-specific EFDB → IPCC default. CH4/N2O from IPCC Table 2.2."),
    ("Grid electricity (India)",
     "CEA v20 FY 2023-24: 0.727 kgCO₂/kWh (CO₂ only). Verified: 70,000 MWh × 0.727 = 50,890 tCO₂e. "
     "Historical years FY 2013-24 available. Market-based uses REC/GO certificate offset."),
    ("S3 Cat 1 — Purchased goods (spend-based)",
     "USEEIO v2 sector EF × spend (INR) × FX rate (INR→USD). "
     "High uncertainty (±50–300%). Use primary supplier data where possible."),
    ("S3 Cat 15 — Financed emissions",
     "PCAF Standard Approach 1–5. Approach 1 (listed equity/debt): outstanding amount / EVIC × Scope 1+2. "
     "PCAF score 1=best data, 5=estimated. Weighted average PCAF score reported in BRSR/CDP."),
    ("AFOLU — Enteric fermentation",
     "IPCC 2006 Tier 1. EF × head count. EF by livestock type: dairy cattle 56 kgCH4/head/yr (India). "
     "CH4 converted at GWP100 AR6: 29.8."),
    ("Fugitive emissions",
     "Leakage rate × gas volume × GWP. Refrigerants: use IPCC AR6 GWP values. "
     "Natural gas: MoPNG 2022 leakage factors for India distribution network."),
]


# ---------------------------------------------------------------------------
# SASB primitives reference
# ---------------------------------------------------------------------------

_PRIMITIVE_LABELS = {
    "GE": ("🌡️", "GHG emissions",          "Direct Scope 1+2+3 emissions — the core GHG disclosure"),
    "EU": ("⚡", "Energy use",              "Total energy consumed (fuel + electricity)"),
    "WA": ("💧", "Water withdrawal",        "Volume of water drawn from any source"),
    "WS": ("♻️", "Waste generated",         "Total waste: hazardous + non-hazardous"),
    "HS": ("🦺", "Health & Safety",         "TRIR, LTIR, fatalities — worker safety metrics"),
    "CL": ("⚖️", "Compliance / legal",      "Regulatory non-conformances, fines, violations"),
    "RG": ("📋", "Regulatory constraint",   "Exposure to regulations (carbon tax, ETS, EIA)"),
    "SC": ("🔗", "Supply chain risk",       "Supplier ESG, concentration, geographic risk"),
    "OX": ("💰", "Operating cost",          "Energy, water, waste handling costs"),
    "EP": ("🔋", "Energy price",            "Sensitivity to electricity/fuel price volatility"),
    "RV": ("📈", "Revenue / demand",        "Market demand risk from low-carbon transition"),
    "CM": ("🪨", "Commodity price",         "Raw material price volatility"),
    "WF": ("👥", "Workforce",               "Labour availability, skills, turnover"),
    "DT": ("⏸️", "Downtime / continuity",  "Operational disruption, business continuity"),
    "IR": ("🏦", "Interest rates",          "Financing cost sensitivity"),
    "XW": ("🌪️", "Extreme weather",        "Physical climate risk (flood, heat, drought)"),
    "LT": ("🚚", "Freight / logistics",     "Transport cost and availability risk"),
    "CX": ("🏗️", "Capex",                  "Capital expenditure requirements"),
    "CY": ("🔒", "Cyber security",          "Data breach, system outage risk"),
    "FR": ("💹", "Financial risk",          "Credit, liquidity, market risk"),
    "LC": ("🧑‍🏭", "Labour cost",           "Wage inflation, minimum wage changes"),
    "FX": ("💱", "FX / currency",           "Foreign exchange rate exposure"),
}

_OUTCOME_TYPES = {
    "E": ("💸", "Financial exposure",   "#EF553B", "Direct financial loss — fines, write-downs, stranded assets"),
    "R": ("📰", "Reputational",         "#636EFA", "Brand damage, investor concern, media risk"),
    "S": ("🌐", "Systemic",             "#AB63FA", "Macro / market-wide risk — not unique to company"),
    "O": ("🏭", "Operational",          "#FFA15A", "Process disruption, supply chain breakdown"),
}


def _sasb_primitives_section(card_bg: str, site_bg: str, card_txt: str, dim_txt: str, border: str) -> None:
    """SASB primitives legend in Knowledge Base."""
    import streamlit as st

    st.markdown("#### 🏭 SASB ESG Primitives — Reference")
    st.caption(
        "SASB uses 22 'primitives' (abbreviated codes) as the building blocks of ESG metrics. "
        "Each metric in every SASB standard is derived from one or more primitives. "
        "Understanding primitives explains **why** a metric matters to your sector."
    )

    # Outcome types
    st.markdown("**Outcome types:**")
    oc_cols = st.columns(4)
    for ci, (code, (icon, label, color, desc)) in enumerate(_OUTCOME_TYPES.items()):
        oc_cols[ci].markdown(
            f"<div style='border-left:4px solid {color};padding:6px 10px;"
            f"border-radius:4px;background:{site_bg};margin:4px 0'>"
            f"<b>{icon} {code} — {label}</b><br>"
            f"<small style='color:{dim_txt}'>{desc}</small></div>",
            unsafe_allow_html=True,
        )

    st.markdown("---")
    st.markdown("**All 22 primitives:**")

    # Search filter
    search = st.text_input("Search primitives", placeholder="e.g. GHG, energy, water",
                           key="kb_prim_search")

    # Display as cards
    for code, (icon, label, desc) in _PRIMITIVE_LABELS.items():
        if search and search.lower() not in label.lower() and search.lower() not in code.lower()                    and search.lower() not in desc.lower():
            continue
        # Check if this primitive is in use by org's SASB sector
        _in_use = False
        try:
            _prof = st.session_state.get("org_profile", {})
            if _prof.get("sasb_sector"):
                from outputs.disclosures.sasb_mapper import get_sasb_metrics_for_sector
                _metrics = get_sasb_metrics_for_sector(
                    st.session_state.get("ef_conn"),
                    _prof["sasb_sector"]
                )
                _in_use = any(code in (m.get("primitives") or []) for m in _metrics)
        except Exception:
            pass

        badge = (
            "<span style='background:#3b82f6;color:white;padding:1px 6px;"
            "border-radius:4px;font-size:10px;margin-left:6px'>✓ In your sector</span>"
            if _in_use else ""
        )
        with st.expander(f"{icon} **{code}** — {label}" + (" 🔵" if _in_use else ""), expanded=False):
            st.markdown(desc + ("" if not badge else "  " + badge), unsafe_allow_html=bool(badge))
            st.caption(
                f"**Code:** `{code}` · **Full name:** {label} · "
                f"**GHG link:** " + {
                    "GE": "Direct input to Scope 1+2+3 calculation",
                    "EU": "Drives Scope 2 (electricity) and Scope 3 Cat 3 (WTT)",
                    "WA": "Water use intensity — indirect emissions in water treatment",
                    "WS": "Scope 3 Cat 5 waste + effluent treatment emissions",
                    "SC": "Scope 3 Cat 1/4 supplier emissions",
                    "XW": "Physical climate risk to Scope 1/2 assets",
                }.get(code, "Qualitative ESG factor — not directly in GHG calculation")
            )

    st.markdown("---")
    st.markdown(
        "**Source:** SASB Standards (ISSB/IFRS Foundation). "
        "[Full standards library →](https://sasb.ifrs.org/standards/)"
    )


def render() -> None:
    # ── Theme colour tokens ───────────────────────────────────────────────
    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _card_bg  = "#f0f9ff" if _is_light else "#1a2235"
    _card_txt = "#1f2937" if _is_light else "#e2e8f0"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"
    _border   = "#e2e8f0" if _is_light else "#334155"
    _inuse_bg = "#eff6ff" if _is_light else "#1e3a5f"
    _site_bg  = "#f9fafb" if _is_light else "#151d2e"

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

    st.title("📚 Knowledge Base")
    st.caption(
        "Reference material for GHG accounting methodology, emission factor sources, "
        "and ESG reporting standards used in this calculator."
    )

    kb1, kb2, kb3, kb4, kb5 = st.tabs([
        "📊 EF sources",
        "📖 Methodology",
        "🔤 Glossary",
        "🏭 SASB primitives",
        "🔗 External links",
    ])

    # ── Tab 1: EF sources ────────────────────────────────────────────────
    with kb1:
        st.markdown("#### Emission factor sources")
        st.caption(
            "Quality grades: **A** = national/verified (±<10%) · "
            "**B** = IPCC Tier 1 / government (±10–30%) · "
            "**C** = spend-based EEIO (±50–300%)"
        )

        # Check which EF sources are in use by this org
        _in_use_sources: set = set()
        try:
            _inv = st.session_state.get("inventory")
            _prof = st.session_state.get("org_profile", {})
            if _inv and _prof.get("org_id"):
                _rows = _inv.get_all_records(
                    org_id=_prof.get("org_uuid") or _prof.get("org_id") or "default",
                    inventory_year=_prof.get("reporting_year", 2024)
                )
                for _r in _rows:
                    _src = (_r.get("ef_source") or "").split(" ")[0]
                    if _src:
                        _in_use_sources.add(_src)
        except Exception:
            pass

        col_filter, col_usage = st.columns(2)
        quality_filter = col_filter.multiselect(
            "Filter by quality", ["A", "B", "B+", "C"],
            default=["A", "B", "B+", "C"], key="kb_quality"
        )
        show_in_use = col_usage.toggle(
            "Show only sources in my inventory",
            value=False, key="kb_in_use_toggle",
            help="Filters to EF sources actually used in your recorded emissions"
        )

        for src in EF_SOURCES:
            if src["quality"] not in quality_filter:
                continue
            if show_in_use and src["id"] not in _in_use_sources:
                continue

            in_use = src["id"] in _in_use_sources
            q_color = {"A": "#16a34a", "B": "#d97706", "B+": "#d97706", "C": "#dc2626"}.get(src["quality"], "#6b7280")
            q_emoji = {"A": "🟢", "B": "🟡", "B+": "🟡", "C": "🔴"}.get(src["quality"], "⚪")

            # Card-style display — single markdown call avoids Streamlit white-line gaps
            _badge = (
                " &nbsp;<span style='background:#3b82f6;color:white;"
                "padding:1px 6px;border-radius:4px;font-size:11px'>✓ In use</span>"
                if in_use else ""
            )
            _src_link = f"<a href='{src['url']}' target='_blank' style='font-size:12px'>↗ Source</a>" if src.get("url") else ""
            _uncertainty = {"A":"±5–10%","B":"±10–30%","B+":"±10–25%","C":"±50–300%"}.get(src["quality"],"—")
            _inuse_border = "#3b82f6" if in_use else _border
            st.markdown(
                f"<div class='sk-card' style='border:1px solid {_inuse_border};"
                f"border-radius:8px;padding:12px 16px;margin:6px 0;"
                f"background:{_inuse_bg if in_use else _card_bg};'>"
                f"<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:6px'>"
                f"<span style='font-weight:600'>{q_emoji} <code>{src['id']}</code> — {src['name']}{_badge}</span>"
                f"<span>"
                f"<span style='background:{q_color};color:white;padding:2px 8px;"
                f"border-radius:99px;font-size:11px;font-weight:700;margin-right:8px'>{src['quality']}</span>"
                f"{_src_link}</span>"
                f"</div>"
                f"<div style='font-size:12px;color:{_card_txt}'>"
                f"<b>Coverage:</b> {src['scope']} &nbsp;|&nbsp; "
                f"<b>Year:</b> {src['year']} &nbsp;|&nbsp; "
                f"<b>Uncertainty:</b> {_uncertainty}"
                f"</div>"
                f"<div style='font-size:12px;color:{_dim_txt};margin-top:4px'>{src['note']}</div>"
                f"</div>",
                unsafe_allow_html=True,
            )

    # ── Tab 2: Methodology ───────────────────────────────────────────────
    with kb2:
        st.markdown("#### Calculation methodology notes")
        for process, note in METHODOLOGY:
            with st.expander(f"**{process}**", expanded=False):
                st.markdown(note)

        st.markdown("---")
        st.markdown("**GWP factors used (IPCC AR6 GWP100)**")
        try:
            import pandas as pd
            df = pd.DataFrame([
                {"Gas": "CO₂",  "GWP100 (AR6)": 1,    "GWP100 (AR5)": 1,    "GWP100 (AR4)": 1},
                {"Gas": "CH4 (fossil)", "GWP100 (AR6)": 29.8, "GWP100 (AR5)": 28.0,  "GWP100 (AR4)": 25.0},
                {"Gas": "CH4 (biogenic)","GWP100 (AR6)": 27.9,"GWP100 (AR5)": 28.0, "GWP100 (AR4)": 25.0},
                {"Gas": "N₂O",  "GWP100 (AR6)": 273,  "GWP100 (AR5)": 265,  "GWP100 (AR4)": 298},
                {"Gas": "HFC-134a","GWP100 (AR6)":1526,"GWP100 (AR5)":1430, "GWP100 (AR4)":1430},
                {"Gas": "SF₆",  "GWP100 (AR6)": 25200,"GWP100 (AR5)": 23500,"GWP100 (AR4)": 22800},
            ])
            st.dataframe(df, use_container_width=True, hide_index=True)
        except ImportError:
            st.info("Install pandas to view GWP table.")

    # ── Tab 3: Glossary ──────────────────────────────────────────────────
    with kb3:
        st.markdown("#### Glossary of GHG and ESG terms")
        search_term = st.text_input("Search glossary", placeholder="e.g. Scope 3",
                                    key="kb_gloss_search")
        for term, definition in sorted(GLOSSARY.items()):
            if search_term and search_term.lower() not in term.lower() \
               and search_term.lower() not in definition.lower():
                continue
            st.markdown(f"**{term}** — {definition}")

    # ── Tab 4: External links ────────────────────────────────────────────
    with kb4:
        _sasb_primitives_section(_card_bg, _site_bg, _card_txt, _dim_txt, _border)

    with kb5:
        st.markdown("#### Authoritative external sources")
        links = [
            ("🌐 GHG Protocol",
             "https://ghgprotocol.org/",
             "Corporate Accounting and Reporting Standard — the methodology this tool implements."),
            ("🌐 IPCC EFDB",
             "https://www.ipcc-nggip.iges.or.jp/EFDB/",
             "IPCC Emission Factor Database — national and global EFs."),
            ("🌐 CEA India",
             "https://cea.nic.in/",
             "India national grid emission factors — annual updates."),
            ("🌐 DEFRA Conversion Factors",
             "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
             "UK DEFRA/BEIS annual GHG conversion factors (transport, waste, WTT)."),
            ("🌐 SBTi",
             "https://sciencebasedtargets.org/",
             "Science Based Targets initiative — near-term and net-zero target validation."),
            ("🌐 SEBI BRSR",
             "https://www.sebi.gov.in/",
             "SEBI Business Responsibility and Sustainability Reporting circular."),
            ("🌐 CDP",
             "https://www.cdp.net/",
             "Carbon Disclosure Project — investor questionnaire platform."),
            ("🌐 GRI Standards",
             "https://www.globalreporting.org/standards/",
             "Global Reporting Initiative sustainability reporting standards."),
            ("🌐 ESRS (EFRAG)",
             "https://www.efrag.org/activities/2303191/esrs-set-1-standards",
             "European Sustainability Reporting Standards — mandatory for CSRD scope."),
            ("🌐 PCAF",
             "https://carbonaccountingfinancials.com/",
             "Partnership for Carbon Accounting Financials — Cat 15 financed emissions."),
            ("🌐 USEEIO v2",
             "https://www.epa.gov/land-research/us-environmentally-extended-input-output-useeio-technical-content",
             "US EPA spend-based EEIO emission factors."),
        ]
        for label, url, desc in links:
            st.markdown(f"[{label}]({url}) — {desc}")
