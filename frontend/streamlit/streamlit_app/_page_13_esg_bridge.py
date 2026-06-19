"""
Page 13 — ESG Bridge: Cross-Framework Disclosure Intelligence.

Seven views matching the Snowkap IQ crossmap workflow:
  1  Conditionals & Triggers  — scope your obligations first
  2  Canonical Checklist      — deduplicated collection to-do list
  3  Cross-Framework Bridges  — canonical records with multi-fw equivalents
  4  By Topic                 — topic-owner view across all frameworks
  5  By Framework             — work within one framework at a time
  6  All DPs                  — full inventory, sortable / filterable
  7  ESRS-Only (No Crossmap)  — ESRS DPs with no equivalent elsewhere
  +  GHG–ESG Coverage         — existing GHG inventory → ESG obligation link

Data: 251 canonical disclosure points from the ESRS/GRI/BRSR/TCFD crossmap CSV.
Completion status is tracked per org/year in session state (persisted to esg_store
when available).
"""
from __future__ import annotations

import csv
import re
from pathlib import Path

import streamlit as st

# ── Seed CSV path ────────────────────────────────────────────────────────────
_CROSSMAP_CSV = Path(__file__).parents[1] / "esg_store" / "seeds" / "disclosure_points.csv"

# ── Legacy GHG→ESG crossmap (kept for test compatibility + GHG Coverage tab) ─
CROSSMAP = {
    "E1.1": {
        "label": "GHG emissions — all scopes",
        "framework": "ESRS", "pillar": "E",
        "ghg_cats": ["Scope 1", "Scope 2", "Scope 3"],
        "description": "ESRS E1 requires S1+S2+S3. Aligns with GRI 305-1/2/3, CDP C6, BRSR P6, IFRS S2.",
        "maturity": ["Disclose", "Target", "Reduction plan"],
    },
    "E1.2": {
        "label": "Energy consumption & efficiency",
        "framework": "GRI", "pillar": "E",
        "ghg_cats": ["Scope 1 — Stationary combustion", "Scope 2 — Purchased electricity"],
        "description": "GRI 302-1/302-3: fuel combustion (S1) + grid electricity (S2) + renewables share.",
        "maturity": ["Disclose", "Efficiency target", "RE100"],
    },
    "E1.3": {
        "label": "Climate transition risk",
        "framework": "TCFD", "pillar": "E",
        "ghg_cats": ["Scope 3 — Cat 11 (use of sold products)", "Scope 3 — Cat 15 (investments)"],
        "description": "TCFD Strategy pillar: high-carbon product revenue and financed emissions drive transition risk.",
        "maturity": ["Identify", "Quantify", "Scenario analysis"],
    },
    "E2": {
        "label": "Pollution & air quality",
        "framework": "ESRS", "pillar": "E",
        "ghg_cats": ["Scope 1 — Fugitive emissions", "Scope 1 — IPPU"],
        "description": "ESRS E2: HFC/HCFC fugitive releases and IPPU process emissions overlap with air pollution.",
        "maturity": ["Monitor", "Report", "Eliminate"],
    },
    "E3": {
        "label": "Water & marine resources",
        "framework": "ESRS", "pillar": "E",
        "ghg_cats": ["Scope 3 — Cat 5 (waste in operations)"],
        "description": "ESRS E3: wastewater treatment emissions in Cat 5 link to water intensity disclosures.",
        "maturity": ["Monitor", "Report"],
    },
    "E4": {
        "label": "Biodiversity & land use",
        "framework": "ESRS", "pillar": "E",
        "ghg_cats": ["Scope 1 — AFOLU (enteric, manure)", "Scope 3 — Cat 1 (purchased goods)"],
        "description": "ESRS E4: AFOLU emissions link to land-use and biodiversity impact.",
        "maturity": ["Identify", "Disclose"],
    },
    "E5": {
        "label": "Resource use & circular economy",
        "framework": "ESRS", "pillar": "E",
        "ghg_cats": ["Scope 3 — Cat 5 (waste)", "Scope 3 — Cat 12 (end-of-life)"],
        "description": "ESRS E5: waste treatment emissions (Cat 5 + Cat 12) map to circularity KPIs.",
        "maturity": ["Monitor", "Circular model"],
    },
    "S1": {
        "label": "Own workforce",
        "framework": "ESRS", "pillar": "S",
        "ghg_cats": ["Scope 3 — Cat 7 (employee commuting)"],
        "description": "ESRS S1: Cat 7 commuting data supports workforce mobility disclosures.",
        "maturity": ["Disclose", "WFH / EV policy"],
    },
    "S2": {
        "label": "Value chain workers",
        "framework": "ESRS", "pillar": "S",
        "ghg_cats": ["Scope 3 — Cat 1 (purchased goods)", "Scope 3 — Cat 4 (upstream transport)"],
        "description": "ESRS S2: supplier GHG data (Cat 1 + Cat 4) is the evidence base for supply chain due diligence.",
        "maturity": ["Map", "Assess", "Engage"],
    },
    "G1": {
        "label": "Business conduct & governance",
        "framework": "ESRS", "pillar": "G",
        "ghg_cats": ["Scope 1", "Scope 2", "Scope 3"],
        "description": "ESRS G1: robust GHG accounting with third-party assurance is a governance best practice indicator.",
        "maturity": ["Measure", "Assure", "Disclose"],
    },
    "BRSR_P6": {
        "label": "BRSR Principle 6 — Environment",
        "framework": "BRSR", "pillar": "E",
        "ghg_cats": ["Scope 1", "Scope 2", "Scope 3 — Cat 1–15"],
        "description": "Indian listed companies (SEBI): mandatory S1+S2, voluntary S3. Intensity metrics required.",
        "maturity": ["Mandatory", "Extended boundary"],
    },
    "CDP_C6": {
        "label": "CDP C6 — Emissions data",
        "framework": "CDP", "pillar": "E",
        "ghg_cats": ["Scope 1", "Scope 2 (location + market)", "Scope 3 Cat 1–15"],
        "description": "Full GHG Protocol inventory required. Market-based S2 mandatory from 2024. C-score depends on completeness.",
        "maturity": ["C-level", "B-level", "A-level"],
    },
    "GRI_305": {
        "label": "GRI 305 — Emissions",
        "framework": "GRI", "pillar": "E",
        "ghg_cats": ["Scope 1 (305-1)", "Scope 2 (305-2)", "Scope 3 (305-3)"],
        "description": "GRI 305-1/2/3: tCO₂e by scope, GWP source, biogenic CO₂ separately.",
        "maturity": ["Core", "Comprehensive"],
    },
    "SASB_GHG_1": {
        "label": "Scope 1 GHG emissions (SASB)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 1"],
        "description": "Direct GHG emissions metric. Required across all SASB industry standards.",
    },
    "SASB_GHG_2": {
        "label": "Scope 2 GHG emissions (SASB)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 2"],
        "description": "Location-based and market-based Scope 2 separately.",
    },
    "SASB_EU": {
        "label": "Energy consumption (SASB EU)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 2", "Scope 1"],
        "description": "Total energy consumed (MWh), renewable vs non-renewable split.",
    },
    "SASB_SC": {
        "label": "Supply chain emissions Cat 1 (SASB SC)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 3", "Scope 3 — Cat 1 (purchased goods)"],
        "description": "Supplier-linked Scope 3 Cat 1/4 emissions.",
    },
    "SASB_FIN": {
        "label": "Financed emissions Cat 15 (SASB / PCAF)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 3 — Cat 15 (investments)"],
        "description": "For banks, insurers, asset managers. PCAF Standard v3.",
    },
    "SASB_HS": {
        "label": "Health & Safety (SASB HS)",
        "framework": "SASB", "pillar": "S",
        "ghg_cats": ["Scope 1 — Stationary combustion", "Scope 1 — Fugitive emissions"],
        "description": "TRIR, LTIR, fatalities. S1 process and fugitive emissions create occupational hazards.",
    },
}

# ── Snowkap IQ design tokens ──────────────────────────────────────────────────
_SK_ORANGE  = "#DF5900"   # primary accent (CDP, brand CTAs)
_SK_INK     = "#0A2233"   # product navy (ESRS, headings, primary buttons)
_SK_DARK    = "#222222"   # body text
_SK_OFFWHITE = "#FFF4E0"  # secondary warm surface
_SK_MINT    = "#58CFAB"   # success / complete
_SK_AMBER   = "#F5B25C"   # warning / in-progress
_SK_RED     = "#D34B4B"   # danger / anomaly
_SK_SKY     = "#4DA9C9"   # info / selected
_SK_VIOLET  = "#9B8AD8"   # TCFD / chart accent
_SK_FONT    = '"Neue Haas Grotesk Text Pro", "Trebuchet MS", "Open Sans", system-ui, -apple-system, sans-serif'

_PILLAR_COLOR = {"E": "#0A6E54", "S": "#1E5A7A", "G": "#663800"}
_FW_COLOR = {
    "ESRS":   _SK_INK,    "BRSR":   "#0A6E54", "CDP":  _SK_ORANGE,
    "GRI":    "#1E5A7A",  "TCFD":   _SK_VIOLET, "SASB": "#663800",
    "IFRS":   "#14405A",  "IFRS S1": "#14405A", "IFRS S2": "#1a5c9a",
}

_STATUS_COLORS = {
    "Not Started": "#8B8B8B",
    "In Progress": _SK_AMBER,
    "Complete": _SK_MINT,
    "N/A": "#B7B7B7",
}

_STATUS_ICONS = {
    "Not Started": "⭕",
    "In Progress": "🟡",
    "Complete": "✅",
    "N/A": "—",
}


# ── Page CSS (Snowkap IQ design system) ──────────────────────────────────────

def _inject_bridge_css() -> None:
    """Inject ESG Bridge page-scoped CSS using the Snowkap IQ design tokens."""
    st.markdown(f"""
<style>
/* ESG Bridge — Snowkap IQ design system alignment */

/* Global font override for this page */
.stApp [data-testid="stMainBlockContainer"] *,
.stApp [data-testid="stVerticalBlock"] * {{
    font-family: {_SK_FONT} !important;
}}

/* Page header strip */
.sk-bridge-header {{
    background: {_SK_INK};
    color: #ffffff;
    padding: 20px 24px 16px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-family: {_SK_FONT};
}}
.sk-bridge-header h2 {{
    color: #ffffff !important;
    margin: 0 0 4px 0;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.025em;
}}
.sk-bridge-header .sk-sub {{
    color: rgba(255,255,255,0.72);
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
}}
.sk-bridge-header .sk-accent-bar {{
    display: inline-block;
    width: 28px;
    height: 3px;
    background: {_SK_ORANGE};
    border-radius: 2px;
    margin-bottom: 8px;
}}

/* Metric cards — Snowkap style */
.sk-metrics {{
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin: 12px 0 16px;
}}
.sk-metric {{
    background: #ffffff;
    border: 1px solid #ECECEC;
    border-top: 3px solid {_SK_ORANGE};
    border-radius: 4px;
    padding: 10px 14px;
    min-width: 96px;
    flex: 1;
    font-family: {_SK_FONT};
}}
.sk-metric-val {{
    font-size: 24px;
    font-weight: 700;
    color: {_SK_INK};
    line-height: 1;
    margin-bottom: 2px;
}}
.sk-metric-lbl {{
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8B8B8B;
}}

/* Section heading */
.sk-section-label {{
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: {_SK_ORANGE};
    margin: 16px 0 6px;
}}

/* DP row cards */
.sk-dp-row {{
    background: #ffffff;
    border: 1px solid #ECECEC;
    border-left: 3px solid {_SK_INK};
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 6px;
    font-family: {_SK_FONT};
}}
.sk-dp-row.sk-always {{
    border-left-color: {_SK_ORANGE};
}}
.sk-dp-row.sk-phased {{
    border-left-color: {_SK_AMBER};
}}

/* Status pill variant */
.sk-pill {{
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
}}
.sk-pill-complete  {{ background: #E4F7EF; color: #0A6E54; }}
.sk-pill-inprog    {{ background: #FDF1DE; color: #663800; }}
.sk-pill-notstarted {{ background: #ECECEC; color: #5C5C5C; }}
.sk-pill-na        {{ background: #F5F5F5; color: #8B8B8B; }}

/* Framework chip */
.sk-fw-chip {{
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    margin: 1px;
    color: #ffffff;
}}

/* Progress bar */
.sk-progress-bar {{
    height: 6px;
    background: #ECECEC;
    border-radius: 3px;
    overflow: hidden;
    margin: 8px 0;
}}
.sk-progress-fill {{
    height: 100%;
    background: linear-gradient(90deg, {_SK_MINT}, {_SK_ORANGE});
    border-radius: 3px;
    transition: width 0.3s ease;
}}

/* Expander title styling fix */
.streamlit-expanderHeader p {{
    font-family: {_SK_FONT} !important;
    font-size: 14px !important;
}}

/* Tab bar styling */
[data-baseweb="tab-list"] {{
    gap: 0 !important;
    border-bottom: 2px solid #ECECEC !important;
}}
[data-baseweb="tab"] {{
    font-family: {_SK_FONT} !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #5C5C5C !important;
    padding: 8px 14px !important;
}}
[aria-selected="true"][data-baseweb="tab"] {{
    color: {_SK_INK} !important;
    border-bottom: 2px solid {_SK_ORANGE} !important;
}}
</style>
""", unsafe_allow_html=True)


# ── Data loading ──────────────────────────────────────────────────────────────

_CROSSMAP_CACHE: list[dict] | None = None

def _load_crossmap() -> list[dict]:
    """Load full disclosure crossmap from CSV (module-level cache)."""
    global _CROSSMAP_CACHE
    if _CROSSMAP_CACHE is None:
        if not _CROSSMAP_CSV.exists():
            _CROSSMAP_CACHE = []
        else:
            with open(_CROSSMAP_CSV, encoding="utf-8-sig") as f:
                _CROSSMAP_CACHE = [dict(r) for r in csv.DictReader(f)]
    return _CROSSMAP_CACHE


def _get_status(dp_id: str, org_key: str) -> str:
    """Get completion status for a DP from session state."""
    return st.session_state.get(f"_bridge_st_{org_key}_{dp_id}", "Not Started")


def _set_status(dp_id: str, org_key: str, status: str) -> None:
    """Persist completion status in session state."""
    st.session_state[f"_bridge_st_{org_key}_{dp_id}"] = status


def _topic_covered(topic: dict, covered_cats: set, covered_scopes: set) -> tuple[bool, list, list]:
    """Return (fully_covered, covered_cats_list, gap_cats_list) for a GHG-ESG topic."""
    tc, tg = [], []
    for cat in topic["ghg_cats"]:
        cat_lower = cat.lower()
        matched = any(
            ck.lower() in cat_lower or cat_lower in ck.lower()
            for ck in covered_cats | covered_scopes
        )
        (tc if matched else tg).append(cat)
    return (len(tg) == 0, tc, tg)


# ── Colour helpers ────────────────────────────────────────────────────────────

def _fw_badge(fw: str, is_light: bool = True) -> str:
    color = _FW_COLOR.get(fw, "#5C5C5C")
    return (
        f"<span class='sk-fw-chip' style='background:{color}'>{fw}</span>"
    )


def _pillar_badge(pillar: str) -> str:
    mapping = {
        "Environmental": ("E", "#0A6E54", "#D8F1E5"),
        "Social":        ("S", "#1E5A7A", "#E6F1F6"),
        "Governance":    ("G", "#663800", "#FDF1DE"),
        "Cross-cutting": ("✕", _SK_VIOLET, "#ECE7F8"),
    }
    code, fg, bg = mapping.get(pillar, ("?", "#5C5C5C", "#ECECEC"))
    return (
        f"<span style='background:{bg};color:{fg};padding:2px 8px;"
        f"border-radius:999px;font-size:11px;font-weight:700'>{code}</span>"
    )


def _status_badge(status: str) -> str:
    css_class = {
        "Complete":    "sk-pill sk-pill-complete",
        "In Progress": "sk-pill sk-pill-inprog",
        "Not Started": "sk-pill sk-pill-notstarted",
        "N/A":         "sk-pill sk-pill-na",
    }.get(status, "sk-pill sk-pill-notstarted")
    icon = _STATUS_ICONS.get(status, "?")
    return f"<span class='{css_class}'>{icon} {status}</span>"


# ── DP detail expander ────────────────────────────────────────────────────────

def _render_dp_card(row: dict, org_key: str, show_status: bool = True) -> None:
    """Render one disclosure point as an expander with full detail."""
    dp_id   = row.get("DP ID", "")
    dp_name = row.get("DP Name", dp_id)
    src_fw  = row.get("Source Framework", "")
    pillar  = row.get("ESG Pillar", "")
    topic   = row.get("Topic", "")
    status  = _get_status(dp_id, org_key)
    icon    = _STATUS_ICONS.get(status, "⭕")
    mapped  = row.get("Mapped Frameworks", "")
    is_can  = row.get("Is Canonical", "").lower() in ("yes", "y", "true", "1")

    canon_tag = " 🔑" if is_can else ""
    title = f"{icon} **{dp_name[:80]}** · `{dp_id}`{canon_tag}"

    with st.expander(title, expanded=False):
        c1, c2 = st.columns([3, 1])

        with c1:
            # Identity
            badges_html = (
                _fw_badge(src_fw, True) + " " +
                _pillar_badge(pillar) + " " +
                _status_badge(status)
            )
            st.markdown(badges_html, unsafe_allow_html=True)
            st.caption(f"**Topic:** {topic}  ·  **Sub-topic:** {row.get('Sub-Topic Tag', '—')}")

            # Trigger & format
            trigger = row.get("Trigger Condition", "").strip()
            if trigger:
                st.markdown(f"**Trigger:** {trigger}")

            response_fmt = row.get("Response Format", "")
            schema = row.get("Schema / Unit", "").strip()
            if schema:
                st.info(f"**Schema / Unit:** {schema}")

            # Tonality
            tonality = row.get("Tonality Requirement", "").strip()
            if tonality:
                with st.expander("✍️ Tonality guidance", expanded=False):
                    st.write(tonality)

            # Cross-framework bridge
            bridge = row.get("Cross-Framework Bridge", "").strip()
            if bridge:
                with st.expander("🔗 Cross-framework bridge", expanded=False):
                    st.write(bridge)

            # Dedup notes
            dedup = row.get("De-duplication Notes", "").strip()
            if dedup:
                with st.expander("📐 Deduplication notes (what differs per framework)", expanded=False):
                    st.write(dedup)

            # Framework-specific references
            fw_refs = {
                "BRSR Core": row.get("BRSR Core Reference", ""),
                "CDP": row.get("CDP Reference", ""),
                "GRI": row.get("GRI Reference", ""),
                "IFRS S1": row.get("IFRS S1 Reference", ""),
                "IFRS S2": row.get("IFRS S2 Reference", ""),
                "TCFD": row.get("TCFD Reference", ""),
            }
            present_refs = {k: v for k, v in fw_refs.items() if v.strip()}
            if present_refs:
                st.markdown("**Framework references:**")
                for fw_name, ref in present_refs.items():
                    st.write(f"  · **{fw_name}:** {ref[:120]}")

        with c2:
            # Metadata
            st.markdown(f"**Standard:** {row.get('Standard Reference', '—')[:80]}")
            always = row.get("Always Disclose", "").lower() in ("yes", "y")
            material_req = row.get("Materiality Required", "").lower() in ("yes", "y")
            phased = row.get("Phased-in", "").lower() in ("yes", "y")
            comp_req = row.get("Comparative Period Required", "").lower() in ("yes", "y")
            assurance = row.get("Assurance Level", "—")

            flags = []
            if always:
                flags.append("🔴 Always disclose")
            if material_req:
                flags.append("📊 Materiality required")
            if phased:
                flags.append("⏳ Phased-in")
            if comp_req:
                flags.append("📅 Comparative required")
            for f in flags:
                st.write(f)

            if phased and row.get("Phased-in Details", "").strip():
                st.caption(row["Phased-in Details"][:200])

            st.caption(f"Assurance: {assurance}")
            st.caption(f"Data type: {row.get('Data Type', '—')}")
            st.caption(f"Response: {row.get('Response Format', '—')}")

            # Mapped frameworks
            if mapped.strip():
                st.markdown("**Also in:**")
                for fw in mapped.split(","):
                    fw = fw.strip()
                    if fw:
                        st.markdown(_fw_badge(fw, True), unsafe_allow_html=True)

            # Status update
            if show_status:
                st.markdown("---")
                new_status = st.selectbox(
                    "Completion",
                    ["Not Started", "In Progress", "Complete", "N/A"],
                    index=["Not Started", "In Progress", "Complete", "N/A"].index(
                        _get_status(dp_id, org_key)
                    ),
                    key=f"_st_sel_{dp_id}_{org_key}",
                    label_visibility="collapsed",
                )
                if new_status != status:
                    _set_status(dp_id, org_key, new_status)
                    st.rerun()


# ── Summary bar ───────────────────────────────────────────────────────────────

def _render_summary(rows: list[dict], org_key: str) -> None:
    """Show status distribution using Snowkap IQ metric cards."""
    total = len(rows)
    statuses = [_get_status(r["DP ID"], org_key) for r in rows if r.get("DP ID")]
    complete    = statuses.count("Complete")
    in_prog     = statuses.count("In Progress")
    not_started = statuses.count("Not Started")
    na_count    = statuses.count("N/A")
    pct = int(complete / max(total, 1) * 100)

    bar_w = pct
    st.markdown(f"""
<div class="sk-metrics">
  <div class="sk-metric">
    <div class="sk-metric-val">{total}</div>
    <div class="sk-metric-lbl">Total DPs</div>
  </div>
  <div class="sk-metric" style="border-top-color:{_SK_MINT}">
    <div class="sk-metric-val" style="color:{_SK_MINT}">{complete}</div>
    <div class="sk-metric-lbl">Complete</div>
  </div>
  <div class="sk-metric" style="border-top-color:{_SK_AMBER}">
    <div class="sk-metric-val" style="color:{_SK_AMBER}">{in_prog}</div>
    <div class="sk-metric-lbl">In Progress</div>
  </div>
  <div class="sk-metric">
    <div class="sk-metric-val">{not_started}</div>
    <div class="sk-metric-lbl">Not Started</div>
  </div>
  <div class="sk-metric">
    <div class="sk-metric-val">{na_count}</div>
    <div class="sk-metric-lbl">N/A</div>
  </div>
  <div class="sk-metric" style="border-top-color:{_SK_ORANGE}">
    <div class="sk-metric-val" style="color:{_SK_ORANGE}">{pct}%</div>
    <div class="sk-metric-lbl">Coverage</div>
  </div>
</div>
<div class="sk-progress-bar">
  <div class="sk-progress-fill" style="width:{bar_w}%"></div>
</div>
""", unsafe_allow_html=True)


# ── Shared sidebar filters ────────────────────────────────────────────────────

def _apply_filters(rows: list[dict], prefix: str) -> list[dict]:
    """Apply sidebar-style inline filters to a list of DP rows."""
    all_pillars = sorted({r.get("ESG Pillar", "") for r in rows if r.get("ESG Pillar")})
    all_topics  = sorted({r.get("Topic", "") for r in rows if r.get("Topic")})
    all_fws     = sorted({r.get("Source Framework", "") for r in rows if r.get("Source Framework")})
    all_statuses = ["Not Started", "In Progress", "Complete", "N/A"]

    fc1, fc2, fc3 = st.columns(3)
    pillar_f = fc1.selectbox("Pillar", ["All"] + all_pillars, key=f"{prefix}_pillar")
    topic_f  = fc2.selectbox("Topic",  ["All"] + all_topics,  key=f"{prefix}_topic")
    fw_f     = fc3.selectbox("Source framework", ["All"] + all_fws, key=f"{prefix}_fw")

    out = rows
    if pillar_f != "All":
        out = [r for r in out if r.get("ESG Pillar") == pillar_f]
    if topic_f != "All":
        out = [r for r in out if r.get("Topic") == topic_f]
    if fw_f != "All":
        out = [r for r in out if r.get("Source Framework") == fw_f]
    return out


# ── Main render ───────────────────────────────────────────────────────────────

def render() -> None:
    _inject_bridge_css()
    _is_light = st.session_state.get("_sk_theme", "light") == "light"

    st.markdown("""
<div class="sk-bridge-header">
  <div class="sk-accent-bar"></div>
  <h2>ESG Bridge — Cross-Framework Disclosure Intelligence</h2>
  <p class="sk-sub">
    251 canonical disclosure points mapped across ESRS · GRI · BRSR · TCFD · IFRS S1/S2 · CDP.
    Start with <strong>Conditionals &amp; Triggers</strong> to scope your obligations,
    then use the <strong>Canonical Checklist</strong> as your collection to-do list.
  </p>
</div>
""", unsafe_allow_html=True)

    profile  = st.session_state.get("org_profile", {})
    org_id   = profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year = profile.get("reporting_year", 2024)
    org_key  = f"{org_id}_{inv_year}"

    # Load crossmap
    all_dps = _load_crossmap()
    if not all_dps:
        st.warning(
            "⚠️ Disclosure crossmap not found. Run `python setup.py` to initialise the database."
        )
        return

    # ── Tabs ─────────────────────────────────────────────────────────────────
    tabs = st.tabs([
        "⚡ Conditionals & Triggers",
        "✅ Collection Checklist",
        "🔗 Cross-Framework Bridges",
        "📂 By Topic",
        "🏛️ By Framework",
        "📋 All DPs",
        "🔍 ESRS-Only",
        "📊 GHG–ESG Coverage",
    ])

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 0: Conditionals & Triggers
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[0]:
        st.markdown('<div class="sk-section-label">Step 1 of 3 — Scope your obligations</div>', unsafe_allow_html=True)
        st.markdown(
            "Use the trigger condition and phasing columns to determine "
            "which disclosure points apply to your company — based on sector, size, and "
            "materiality. For BRSR, distinguish Essential vs Leadership Indicators. "
            "For ESRS, identify phased-in deferrals available to you."
        )

        f1, f2, f3, f4 = st.columns(4)
        always_only = f1.toggle("Always disclose only", key="ct_always")
        show_phased = f2.toggle("Show phased-in only", key="ct_phased")
        matl_gate   = f3.toggle("Materiality-gated only", key="ct_matl")
        pillar_ct   = f4.selectbox(
            "Pillar", ["All", "Environmental", "Social", "Governance", "Cross-cutting"],
            key="ct_pillar"
        )

        ct_rows = all_dps
        if always_only:
            ct_rows = [r for r in ct_rows if r.get("Always Disclose", "").lower() in ("yes", "y")]
        if show_phased:
            ct_rows = [r for r in ct_rows if r.get("Phased-in", "").lower() in ("yes", "y")]
        if matl_gate:
            ct_rows = [r for r in ct_rows if r.get("Materiality Required", "").lower() in ("yes", "y")]
        if pillar_ct != "All":
            ct_rows = [r for r in ct_rows if r.get("ESG Pillar", "") == pillar_ct]

        st.markdown(f"**{len(ct_rows)} disclosure points match**")
        _render_summary(ct_rows, org_key)
        st.markdown("---")

        for row in ct_rows:
            always = row.get("Always Disclose", "").lower() in ("yes", "y")
            phased = row.get("Phased-in", "").lower() in ("yes", "y")
            matl   = row.get("Materiality Required", "").lower() in ("yes", "y")
            trigger = row.get("Trigger Condition", "").strip()
            status = _get_status(row["DP ID"], org_key)
            icon = _STATUS_ICONS.get(status, "⭕")
            tags = []
            if always: tags.append("🔴 Always")
            if phased: tags.append("⏳ Phased")
            if matl:   tags.append("📊 Materiality")
            tag_str = "  ·  ".join(tags) if tags else ""

            title = f"{icon} `{row['DP ID']}` — {row.get('DP Name','')[:70]}  {tag_str}"
            with st.expander(title, expanded=False):
                st.markdown(f"**Trigger:** {trigger or 'See standard reference.'}")
                if phased and row.get("Phased-in Details", "").strip():
                    st.info(f"**Phased-in details:** {row['Phased-in Details'][:400]}")
                fw_ref_display = " · ".join(filter(None, [
                    row.get("GRI Reference", ""),
                    row.get("BRSR Core Reference", ""),
                    row.get("CDP Reference", ""),
                ]))
                if fw_ref_display:
                    st.caption(f"Cross-refs: {fw_ref_display[:200]}")
                new_st = st.selectbox(
                    "Status", ["Not Started", "In Progress", "Complete", "N/A"],
                    index=["Not Started", "In Progress", "Complete", "N/A"].index(status),
                    key=f"ct_sel_{row['DP ID']}",
                )
                if new_st != status:
                    _set_status(row["DP ID"], org_key, new_st)
                    st.rerun()

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 1: Canonical Collection Checklist
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[1]:
        st.markdown('<div class="sk-section-label">Step 2 of 3 — Collect data (deduplicated)</div>', unsafe_allow_html=True)
        st.markdown(
            "Each row here represents one data collection exercise. Tick Completion Status as you go. "
            "Collecting the canonical version satisfies all mapped frameworks."
        )

        canonical_rows = [r for r in all_dps if r.get("Is Canonical", "").lower() in ("yes", "y", "true", "1")]
        status_filter = st.multiselect(
            "Filter by status",
            ["Not Started", "In Progress", "Complete", "N/A"],
            default=["Not Started", "In Progress"],
            key="checklist_status",
        )

        cl_rows = _apply_filters(canonical_rows, "cl")
        if status_filter:
            cl_rows = [r for r in cl_rows if _get_status(r["DP ID"], org_key) in status_filter]

        st.markdown(f"**{len(cl_rows)} canonical DPs** (of {len(canonical_rows)} total canonical)")
        _render_summary(canonical_rows, org_key)
        st.markdown("---")

        for row in cl_rows:
            _render_dp_card(row, org_key, show_status=True)

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 2: Cross-Framework Bridges
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[2]:
        st.markdown('<div class="sk-section-label">Step 3 of 3 — Reformat for each framework</div>', unsafe_allow_html=True)
        st.markdown(
            "Each row maps one data collection exercise to the frameworks that use it. "
            "Collect once → reformat for each framework in the *Mapped Frameworks* column."
        )

        bridge_rows = _apply_filters(all_dps, "br")
        # Only show rows with multiple frameworks mapped
        bridge_rows = [r for r in bridge_rows if len(r.get("Mapped Frameworks", "").split(",")) > 1]

        # Framework pair filter
        all_mapped_fws = sorted({
            fw.strip() for r in bridge_rows
            for fw in r.get("Mapped Frameworks", "").split(",") if fw.strip()
        })
        sel_fw = st.selectbox("Show DPs mapped to framework", ["All"] + all_mapped_fws, key="br_fw_filter")
        if sel_fw != "All":
            bridge_rows = [
                r for r in bridge_rows
                if sel_fw in [fw.strip() for fw in r.get("Mapped Frameworks", "").split(",")]
            ]

        st.markdown(f"**{len(bridge_rows)} cross-framework DPs**")

        for row in bridge_rows:
            mapped_fws = [fw.strip() for fw in row.get("Mapped Frameworks", "").split(",") if fw.strip()]
            badges = " ".join(_fw_badge(fw, _is_light) for fw in mapped_fws)
            status = _get_status(row["DP ID"], org_key)
            icon = _STATUS_ICONS.get(status, "⭕")
            title = f"{icon} `{row['DP ID']}` — {row.get('DP Name','')[:65]}"

            with st.expander(title, expanded=False):
                st.markdown(f"**Mapped to:** {badges}", unsafe_allow_html=True)
                bridge = row.get("Cross-Framework Bridge", "").strip()
                if bridge:
                    st.write(bridge[:600] + ("..." if len(bridge) > 600 else ""))
                dedup = row.get("De-duplication Notes", "").strip()
                if dedup:
                    st.caption(f"**Delta:** {dedup[:300]}")
                # Per-framework refs
                refs = {
                    "BRSR": row.get("BRSR Core Reference", ""),
                    "CDP": row.get("CDP Reference", ""),
                    "GRI": row.get("GRI Reference", ""),
                    "IFRS S1": row.get("IFRS S1 Reference", ""),
                    "IFRS S2": row.get("IFRS S2 Reference", ""),
                    "TCFD": row.get("TCFD Reference", ""),
                }
                present = [(k, v) for k, v in refs.items() if v.strip()]
                if present:
                    ref_md = "  ·  ".join(f"**{k}:** {v[:80]}" for k, v in present)
                    st.caption(ref_md)

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 3: By Topic (Cross-Framework)
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[3]:
        st.markdown(
            "**Topic-owner view.** All disclosure points relevant to a topic area, "
            "regardless of source framework. Use when a sustainability function owner "
            "wants to see everything relevant to their area across all frameworks."
        )

        topics_list = sorted({r.get("Topic", "") for r in all_dps if r.get("Topic")})
        sel_topic = st.selectbox("Select topic", topics_list, key="bytopic_sel")
        pillar_f = st.selectbox(
            "Pillar filter",
            ["All", "Environmental", "Social", "Governance", "Cross-cutting"],
            key="bytopic_pillar"
        )

        topic_rows = [r for r in all_dps if r.get("Topic") == sel_topic]
        if pillar_f != "All":
            topic_rows = [r for r in topic_rows if r.get("ESG Pillar") == pillar_f]

        # Group by framework
        by_fw: dict[str, list] = {}
        for r in topic_rows:
            fw = r.get("Source Framework", "Other")
            by_fw.setdefault(fw, []).append(r)

        all_mapped_in_topic = sorted({
            fw.strip() for r in topic_rows
            for fw in r.get("Mapped Frameworks", "").split(",") if fw.strip()
        })

        st.markdown(f"**{len(topic_rows)} DPs** in **{sel_topic}** · Mapped to: "
                    + " ".join(_fw_badge(fw, _is_light) for fw in all_mapped_in_topic),
                    unsafe_allow_html=True)
        _render_summary(topic_rows, org_key)
        st.markdown("---")

        for fw, fw_rows in by_fw.items():
            st.markdown(f"#### {_fw_badge(fw, _is_light)} {fw}", unsafe_allow_html=True)
            for row in fw_rows:
                _render_dp_card(row, org_key, show_status=True)
            st.markdown("")

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 4: By Framework
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[4]:
        st.markdown(
            "**Work within one framework at a time.** "
            "Shows DPs grouped by source framework → module → topic."
        )

        src_fws = sorted({r.get("Source Framework", "") for r in all_dps if r.get("Source Framework")})
        sel_fw = st.selectbox("Framework", src_fws, key="bfw_sel")

        bfw_rows = [r for r in all_dps if r.get("Source Framework") == sel_fw]
        modules = sorted({r.get("Module / Section", "") for r in bfw_rows if r.get("Module / Section")})
        sel_module = st.selectbox("Module / Section", ["All"] + modules, key="bfw_module")
        if sel_module != "All":
            bfw_rows = [r for r in bfw_rows if r.get("Module / Section") == sel_module]

        # Group by module then topic
        by_module: dict[str, list] = {}
        for r in bfw_rows:
            mod = r.get("Module / Section", "General")
            by_module.setdefault(mod, []).append(r)

        st.markdown(f"**{len(bfw_rows)} DPs** for **{sel_fw}**")
        _render_summary(bfw_rows, org_key)
        st.markdown("---")

        for mod, mod_rows in sorted(by_module.items()):
            st.markdown(f"#### {mod}")
            for row in mod_rows:
                _render_dp_card(row, org_key, show_status=True)
            st.markdown("")

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 5: All DPs
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[5]:
        st.markdown("**Full disclosure point inventory.** Sort by any column.")

        all_filtered = _apply_filters(all_dps, "all")

        # Build a displayable dataframe
        try:
            import pandas as pd
            df_data = []
            for r in all_filtered:
                status = _get_status(r["DP ID"], org_key)
                df_data.append({
                    "DP ID": r.get("DP ID", ""),
                    "DP Name": r.get("DP Name", "")[:80],
                    "Source FW": r.get("Source Framework", ""),
                    "Module": r.get("Module / Section", ""),
                    "Pillar": r.get("ESG Pillar", ""),
                    "Topic": r.get("Topic", ""),
                    "Always": r.get("Always Disclose", ""),
                    "Materiality": r.get("Materiality Required", ""),
                    "Canonical": r.get("Is Canonical", ""),
                    "Phased-in": r.get("Phased-in", ""),
                    "Format": r.get("Response Format", ""),
                    "Mapped Frameworks": r.get("Mapped Frameworks", ""),
                    "Status": status,
                })
            df = pd.DataFrame(df_data)
            st.dataframe(df, use_container_width=True, height=500)
            st.caption(f"{len(df)} rows")
        except ImportError:
            for row in all_filtered:
                st.write(f"`{row['DP ID']}` — {row.get('DP Name','')[:80]}")

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 6: ESRS-Only (No Crossmap)
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[6]:
        st.markdown(
            "**ESRS-specific requirements with no equivalent in other frameworks.** "
            "These need standalone data collection — no existing GRI, BRSR, or TCFD "
            "data will satisfy them."
        )

        esrs_rows = [r for r in all_dps if r.get("Source Framework") == "ESRS"]
        # No crossmap = mapped frameworks is empty or only ESRS
        esrs_only_rows = [
            r for r in esrs_rows
            if not any(
                fw.strip() and fw.strip() not in ("ESRS", "Other")
                for fw in r.get("Mapped Frameworks", "").split(",")
            )
        ]

        pillar_eo = st.selectbox(
            "Pillar",
            ["All", "Environmental", "Social", "Governance", "Cross-cutting"],
            key="esrsonly_pillar"
        )
        if pillar_eo != "All":
            esrs_only_rows = [r for r in esrs_only_rows if r.get("ESG Pillar") == pillar_eo]

        st.markdown(f"**{len(esrs_only_rows)} ESRS-only DPs** (no cross-framework equivalent)")
        _render_summary(esrs_only_rows, org_key)
        st.markdown("---")

        for row in esrs_only_rows:
            _render_dp_card(row, org_key, show_status=True)

    # ─────────────────────────────────────────────────────────────────────────
    # Tab 7: GHG–ESG Coverage
    # ─────────────────────────────────────────────────────────────────────────
    with tabs[7]:
        st.markdown(
            "**How your GHG inventory feeds your ESG disclosures.** "
            "Each row shows an ESG topic and the GHG categories that provide its evidence."
        )
        _render_ghg_esg_coverage(org_id, inv_year, _is_light)


# ── GHG–ESG Coverage (existing functionality, extracted) ─────────────────────

def _render_ghg_esg_coverage(org_id: str, inv_year: int, _is_light: bool) -> None:
    """Render the legacy GHG inventory → ESG obligation crossmap."""
    from streamlit_app._org_helper import fix_page, safe_get_summary, safe_get_all_records

    profile   = st.session_state.get("org_profile", {})
    _, inventory = fix_page(profile, st.session_state.get("inventory"))

    covered_processes: set[str] = set()
    covered_scopes:    set[str] = set()
    covered_cats:      set[str] = set()
    n_records = 0
    scope_tco2e: dict = {}

    if inventory:
        try:
            s = safe_get_summary(inventory, org_id, inv_year)
            n_records = s.get("n_records", 0)
            all_rows  = safe_get_all_records(inventory, org_id, inv_year)
            for r in all_rows:
                t = float(r.get("t_CO2e") or 0)
                sc = r.get("scope", "")
                if t > 0:
                    covered_scopes.add(sc)
                    proc = (r.get("process") or "").lower()
                    covered_processes.add(proc)
                    cat_m = re.search(r"cat\s*(\d+)", proc)
                    if cat_m:
                        covered_cats.add("Cat " + cat_m.group(1))
                    if "stationary" in proc: covered_cats.add("Stationary")
                    if "mobile" in proc:     covered_cats.add("Mobile")
                    if "fugitive" in proc:   covered_cats.add("Fugitive")
                    if "ippu" in proc:       covered_cats.add("IPPU")
                    if "electricity" in proc: covered_cats.add("Electricity")
                sc_key = sc if sc else "Unknown"
                scope_tco2e[sc_key] = scope_tco2e.get(sc_key, 0) + t
        except Exception:
            pass

    total_topics = len(CROSSMAP)
    _topic_results = {
        tid: _topic_covered(t, covered_cats, covered_scopes)
        for tid, t in CROSSMAP.items()
    }
    covered_topics = sum(1 for fc, _, _ in _topic_results.values() if fc)
    partial_topics = sum(1 for fc, cc, gc in _topic_results.values() if cc and gc)
    gap_topics     = sum(1 for fc, cc, gc in _topic_results.values() if not cc)

    # m1, m2, m3, m4, m5 — five metric columns (Snowkap IQ card layout below)
    st.markdown(f"""
<div class="sk-metrics">
  <div class="sk-metric">
    <div class="sk-metric-val">{total_topics}</div>
    <div class="sk-metric-lbl">ESG Topics Mapped</div>
  </div>
  <div class="sk-metric" style="border-top-color:{_SK_MINT}">
    <div class="sk-metric-val" style="color:{_SK_MINT}">{covered_topics}</div>
    <div class="sk-metric-lbl">Fully Covered</div>
  </div>
  <div class="sk-metric" style="border-top-color:{_SK_AMBER}">
    <div class="sk-metric-val" style="color:{_SK_AMBER}">{partial_topics}</div>
    <div class="sk-metric-lbl">Partial Coverage</div>
  </div>
  <div class="sk-metric" style="border-top-color:{_SK_RED}">
    <div class="sk-metric-val" style="color:{_SK_RED}">{gap_topics}</div>
    <div class="sk-metric-lbl">No Data (Gap)</div>
  </div>
  <div class="sk-metric">
    <div class="sk-metric-val">{n_records}</div>
    <div class="sk-metric-lbl">Inventory Records</div>
  </div>
</div>
""", unsafe_allow_html=True)

    if gap_topics > 0:
        st.error(f"⭕ **{gap_topics} ESG topics have no GHG data.** Enter missing inventory data.")
    if partial_topics > 0:
        st.warning(f"🟡 **{partial_topics} topics have partial coverage.** Expand data entry.")
    if covered_topics == total_topics:
        st.success("✅ All ESG topics have GHG data coverage.")
    if scope_tco2e:
        st.caption(
            "Inventory: "
            + " · ".join(f"**{sc}** {t:,.0f} tCO₂e" for sc, t in scope_tco2e.items() if t > 0)
        )

    st.markdown("---")

    f1, f2, f3 = st.columns(3)
    fw_options = ["All"] + sorted({t["framework"] for t in CROSSMAP.values()})
    pillar_opt = f1.selectbox("Pillar", ["All", "E", "S", "G"], key="ghg_bridge_pillar")
    fw_opt     = f2.selectbox("Framework", fw_options, key="ghg_bridge_fw")
    gap_only   = f3.toggle("Show gaps only", key="ghg_bridge_gap")

    topics_iter = list(CROSSMAP.items())
    if pillar_opt != "All":
        topics_iter = [(k, v) for k, v in topics_iter if v["pillar"] == pillar_opt]
    if fw_opt != "All":
        topics_iter = [(k, v) for k, v in topics_iter if fw_opt in v["framework"]]
    if gap_only:
        topics_iter = [(k, v) for k, v in topics_iter
                       if not _topic_results.get(k, (False, [], []))[0]]

    for tid, topic in topics_iter:
        pillar = topic["pillar"]
        p_color  = _PILLAR_COLOR.get(pillar, "#6b7280")
        fw_color = _FW_COLOR.get(topic["framework"], "#6b7280")
        _fully, _cov_cats, _gap_cats = _topic_results.get(tid, (False, [], topic["ghg_cats"]))
        status_icon = "✅" if _fully else ("🟡" if _cov_cats else "⭕")

        with st.expander(f"{status_icon} **{topic['label']}**  ·  `{tid}`", expanded=(not _fully)):
            tc1, tc2 = st.columns([3, 1])
            with tc1:
                st.markdown(topic["description"])
                st.markdown("**GHG categories required:**")
                for cat in topic["ghg_cats"]:
                    if cat in _cov_cats:
                        st.write(f"  ✅ {cat} — data present")
                    else:
                        st.write(f"  ⭕ **{cat}** — **GAP: no data entered yet**")
                if _gap_cats:
                    st.error("**Action required:** Enter data for: " + ", ".join(_gap_cats))
            with tc2:
                st.markdown(
                    f"<span style='background:{fw_color};color:white;"
                    f"padding:4px 10px;border-radius:99px;font-size:12px;"
                    f"font-weight:700'>{topic['framework']}</span>",
                    unsafe_allow_html=True,
                )
                st.markdown(
                    f"<span style='background:{p_color};color:white;"
                    f"padding:4px 10px;border-radius:99px;font-size:12px;"
                    f"font-weight:700'>Pillar {pillar}</span>",
                    unsafe_allow_html=True,
                )
                if topic.get("maturity"):
                    st.markdown("**Maturity steps:**")
                    for i, step in enumerate(topic["maturity"], 1):
                        st.write(f"  {i}. {step}")

    # Framework × GHG scope coverage matrix
    st.markdown("---")
    st.markdown("#### Framework × GHG scope coverage matrix")
    try:
        import pandas as pd
        fw_list    = ["ESRS", "BRSR", "CDP", "GRI", "TCFD"]
        scope_list = ["Scope 1", "Scope 2", "Scope 3"]
        matrix = {}
        for fw in fw_list:
            row = {}
            for scope in scope_list:
                needs = any(
                    any(scope in cat for cat in t["ghg_cats"])
                    for t in CROSSMAP.values() if fw in t["framework"]
                )
                has = scope in covered_scopes
                row[scope] = "—" if not needs else ("✅" if has else "⭕")
            matrix[fw] = row
        df = pd.DataFrame(matrix).T
        st.dataframe(df, use_container_width=True)
    except ImportError:
        pass

    st.markdown("---")
    st.markdown("#### Recommended next actions")
    if "Scope 1" not in covered_scopes:
        st.error("⭕ Enter Scope 1 data — required for ESRS E1, BRSR P6, CDP C6, GRI 305-1.")
    if "Scope 2" not in covered_scopes:
        st.error("⭕ Enter Scope 2 data — required for all major frameworks.")
    if "Scope 3" not in covered_scopes:
        st.warning("⭕ Enter Scope 3 data — required for ESRS E1, CDP C6 A-level, TCFD.")
    if covered_scopes == {"Scope 1", "Scope 2", "Scope 3"}:
        st.success(
            "✅ All three scopes have data. "
            "Go to 📤 Export to generate BRSR / CDP / TCFD / GRI disclosures."
        )
