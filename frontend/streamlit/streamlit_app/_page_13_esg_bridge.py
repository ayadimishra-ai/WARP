"""
Page 13 — ESG-GHG Bridge: Materiality Matrix.

Maps ESG reporting topics (ESRS / GRI / BRSR) to GHG Protocol categories,
showing which GHG inventory processes contribute to each ESG disclosure topic.

This is the bridge between quantitative GHG data and qualitative ESG narrative —
the "how does my emissions inventory feed my ESG report" view.
"""
from __future__ import annotations
import streamlit as st

# ── ESG topic → GHG category crossmap ───────────────────────────────────────
# format: {topic_id: {label, framework, pillar, ghg_cats[], description}}
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
        "description": "GRI 302-1/302-3: fuel combustion (S1) + grid electricity (S2) + renewables share. Also in ESRS E1 and BRSR P6.",
        "maturity": ["Disclose", "Efficiency target", "RE100"],
    },
    "E1.3": {
        "label": "Climate transition risk",
        "framework": "TCFD", "pillar": "E",
        "ghg_cats": ["Scope 3 — Cat 11 (use of sold products)",
                     "Scope 3 — Cat 15 (investments)"],
        "description": "TCFD Strategy pillar: high-carbon product revenue and financed emissions drive transition risk. Also covered in ESRS E1 and CDP C11.",
        "maturity": ["Identify", "Quantify", "Scenario analysis"],
    },
    "E2": {
        "label": "Pollution & air quality",
        "framework": "ESRS", "pillar": "E",
        "ghg_cats": ["Scope 1 — Fugitive emissions", "Scope 1 — IPPU"],
        "description": "ESRS E2: HFC/HCFC fugitive releases and IPPU process emissions overlap with local air pollution disclosures.",
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
        "description": "ESRS E4: AFOLU emissions link to land-use and biodiversity impact of agricultural supply chains.",
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
        "description": "ESRS S1: Cat 7 commuting data supports workforce mobility disclosures. Also in GRI 401.",
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
        "description": "ESRS G1: robust GHG accounting across all scopes with third-party assurance is a governance best practice indicator. Also BRSR Principle 1.",
        "maturity": ["Measure", "Assure", "Disclose"],
    },
    "BRSR_P6": {
        "label": "BRSR Principle 6 — Environment",
        "framework": "BRSR", "pillar": "E",
        "ghg_cats": ["Scope 1", "Scope 2", "Scope 3 — Cat 1–15"],
        "description": "Indian listed companies (SEBI): mandatory S1+S2, voluntary S3 disclosure. Intensity metrics required.",
        "maturity": ["Mandatory", "Extended boundary"],
    },
    "CDP_C6": {
        "label": "CDP C6 — Emissions data",
        "framework": "CDP", "pillar": "E",
        "ghg_cats": ["Scope 1", "Scope 2 (location + market)", "Scope 3 Cat 1–15"],
        "description": "Full GHG Protocol inventory required. Market-based S2 disclosure mandatory from 2024. C-score depends on completeness.",
        "maturity": ["C-level", "B-level", "A-level"],
    },
    "GRI_305": {
        "label": "GRI 305 — Emissions",
        "framework": "GRI", "pillar": "E",
        "ghg_cats": ["Scope 1 (305-1)", "Scope 2 (305-2)", "Scope 3 (305-3)"],
        "description": "GRI 305-1/2/3: tCO₂e by scope, GWP source, biogenic CO₂ separately. Qualitative narrative required.",
        "maturity": ["Core", "Comprehensive"],
    },
    "SASB_GHG_1": {
        "label": "Scope 1 GHG emissions (SASB)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 1"],
        "description": "Direct GHG emissions metric. Required across all SASB industry standards. Percentage covered by regulation also required.",
    },
    "SASB_GHG_2": {
        "label": "Scope 2 GHG emissions (SASB)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 2"],
        "description": "Location-based and market-based Scope 2 separately. Energy mix and renewable percentage as context.",
    },
    "SASB_EU": {
        "label": "Energy consumption (SASB EU)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 2", "Scope 1"],
        "description": "Total energy consumed (MWh), renewable vs non-renewable split. Grid mix disclosure.",
    },
    "SASB_SC": {
        "label": "Supply chain emissions Cat 1 (SASB SC)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 3", "Scope 3 — Cat 1 (purchased goods)"],
        "description": "Supplier-linked Scope 3 Cat 1/4 emissions. Percentage of suppliers disclosing emissions.",
    },
    "SASB_FIN": {
        "label": "Financed emissions Cat 15 (SASB / PCAF)",
        "framework": "SASB", "pillar": "E",
        "ghg_cats": ["Scope 3 — Cat 15 (investments)"],
        "description": "For banks, insurers, asset managers. PCAF Standard v3. Attribution factor × borrower/investee emissions.",
    },
    "SASB_HS": {
        "label": "Health & Safety (SASB HS)",
        "framework": "SASB", "pillar": "S",
        "ghg_cats": ["Scope 1 — Stationary combustion", "Scope 1 — Fugitive emissions"],
        "description": "TRIR, LTIR, fatalities. Scope 1 process and fugitive emissions create occupational chemical/air quality hazards.",
    },
}

_PILLAR_COLOR = {"E": "#16a34a", "S": "#2563eb", "G": "#f59e0b"}
_FW_COLOR = {
    "ESRS": "#7c3aed", "BRSR": "#059669", "CDP": "#0284c7",
    "GRI": "#0891b2", "TCFD": "#6366f1", "SASB": "#f59e0b", "IFRS": "#0f4c81",
}


def render() -> None:
    st.title("🌉 ESG–GHG Bridge")
    st.caption(
        "How your GHG inventory feeds your ESG disclosures. "
        "Each row shows an ESG topic and the GHG Protocol categories that provide its evidence base."
    )

    _is_light = st.session_state.get("_sk_theme", "light") == "light"
    _dim_txt  = "#6b7280" if _is_light else "#94a3b8"
    _card_bg  = "#f0f9ff" if _is_light else "#1a2235"
    _card_txt = "#1f2937" if _is_light else "#e2e8f0"
    _border   = "#e2e8f0" if _is_light else "#334155"

    profile   = st.session_state.get("org_profile", {})

    # ── org_id + inventory resolved from profile (handles "View as" correctly) ──
    from streamlit_app._org_helper import fix_page, safe_get_summary, safe_get_all_records
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Please log in to access this page.")
        return
    # Update local profile copy so forms write to the right org
    profile = dict(profile)
    profile["org_uuid"] = org_id
    profile["org_id"]   = org_id
    inv_year  = profile.get("reporting_year", 2024)

    # Pull live inventory for granular gap assessment
    covered_processes: set[str] = set()   # process strings actually in inventory
    covered_scopes:    set[str] = set()   # top-level scope coverage
    covered_cats:      set[str] = set()   # "Cat 1", "Cat 4", etc.
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
                    # Extract Cat N from process string
                    import re as _re
                    cat_m = _re.search(r"cat\s*(\d+)", proc)
                    if cat_m:
                        covered_cats.add("Cat " + cat_m.group(1))
                    if "stationary" in proc: covered_cats.add("Stationary")
                    if "mobile" in proc:     covered_cats.add("Mobile")
                    if "fugitive" in proc:   covered_cats.add("Fugitive")
                    if "ippu" in proc:       covered_cats.add("IPPU")
                    if "electricity" in proc:covered_cats.add("Electricity")
                sc_key = sc if sc else "Unknown"
                scope_tco2e[sc_key] = scope_tco2e.get(sc_key, 0) + t
        except Exception:
            pass

    def _topic_covered(topic: dict) -> tuple[bool, list[str], list[str]]:
        """Return (fully_covered, covered_cats_list, gap_cats_list) for a topic."""
        topic_covered_cats = []
        topic_gap_cats     = []
        for cat in topic["ghg_cats"]:
            # Check if any covered keyword matches this cat string
            cat_lower = cat.lower()
            matched = any(
                ck.lower() in cat_lower or cat_lower in ck.lower()
                for ck in covered_cats | covered_scopes
            )
            if matched:
                topic_covered_cats.append(cat)
            else:
                topic_gap_cats.append(cat)
        return (len(topic_gap_cats) == 0, topic_covered_cats, topic_gap_cats)

    # ── Top summary ───────────────────────────────────────────────────────
    total_topics = len(CROSSMAP)
    _topic_results = {tid: _topic_covered(t) for tid, t in CROSSMAP.items()}
    covered_topics = sum(1 for fc, _, _ in _topic_results.values() if fc)
    partial_topics = sum(1 for fc, cc, gc in _topic_results.values() if cc and gc)
    gap_topics     = sum(1 for fc, cc, gc in _topic_results.values() if not cc)
    coverage_pct = int(covered_topics / total_topics * 100) if total_topics else 0

    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("ESG topics mapped",      total_topics)
    m2.metric("✅ Fully covered",       covered_topics)
    m3.metric("🟡 Partial coverage",   partial_topics)
    m4.metric("⭕ No data (gap)",       gap_topics)
    m5.metric("Inventory records",      n_records)

    if gap_topics > 0:
        st.error(
            f"⭕ **{gap_topics} ESG topics have no GHG data at all.** "
            "These are disclosure gaps that must be addressed before ESG reporting."
        )
    if partial_topics > 0:
        st.warning(
            f"🟡 **{partial_topics} topics have partial coverage.** "
            "Some required GHG categories are still missing — expand data entry."
        )
    if covered_topics == total_topics:
        st.success("✅ All ESG topics have GHG data coverage.")
    
    # Scope-level tCO2e context
    if scope_tco2e:
        st.caption(
            "Inventory: "
            + " · ".join(f"**{sc}** {t:,.0f} tCO₂e" for sc, t in scope_tco2e.items() if t > 0)
        )

    st.markdown("---")

    # ── Filters ──────────────────────────────────────────────────────────
    f1, f2, f3 = st.columns(3)
    fw_options = ["All"] + sorted({t["framework"] for t in CROSSMAP.values()})
    pillar_opt = f1.selectbox("Pillar", ["All", "E", "S", "G"], key="bridge_pillar")
    fw_opt     = f2.selectbox("Framework", fw_options, key="bridge_fw")
    gap_only   = f3.toggle("Show gaps only (no GHG data)", key="bridge_gap")

    topics = CROSSMAP.items()
    if pillar_opt != "All":
        topics = [(k, v) for k, v in topics if v["pillar"] == pillar_opt]
    if fw_opt != "All":
        topics = [(k, v) for k, v in topics if fw_opt in v["framework"]]
    if gap_only:
        topics = [(k, v) for k, v in topics
                  if not _topic_results.get(k, (False, [], []))[0]]

    st.markdown(f"**{len(list(topics))} topics**")

    # ── Topic cards ───────────────────────────────────────────────────────
    topics = list(topics)  # consume iterator once
    for tid, topic in topics:
        pillar = topic["pillar"]
        p_color = _PILLAR_COLOR.get(pillar, "#6b7280")
        fw_color = _FW_COLOR.get(topic["framework"], "#6b7280")
        _fully, _cov_cats, _gap_cats = _topic_results.get(tid, (False, [], topic["ghg_cats"]))
        if _fully:
            status_icon = "✅"
        elif _cov_cats:
            status_icon = "🟡"
        else:
            status_icon = "⭕"

        with st.expander(
            f"{status_icon} **{topic['label']}**  ·  `{tid}`",
            expanded=(not _fully),
        ):
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
                    st.error(
                        f"**Action required:** Enter data for: "
                        + ", ".join(_gap_cats)
                    )
            with tc2:
                fw = topic["framework"]
                st.markdown(
                    f"<span style='background:{fw_color};color:white;"
                    f"padding:4px 10px;border-radius:99px;font-size:12px;"
                    f"font-weight:700'>{fw}</span>",
                    unsafe_allow_html=True,
                )
                st.markdown(
                    f"<span style='background:{p_color};color:white;"
                    f"padding:4px 10px;border-radius:99px;font-size:12px;"
                    f"font-weight:700'>Pillar {pillar}</span>",
                    unsafe_allow_html=True,
                )
                st.markdown("**Maturity steps:**")
                for i, step in enumerate(topic.get("maturity", []), 1):
                    st.write(f"  {i}. {step}")

    # ── Framework coverage matrix ─────────────────────────────────────────
    st.markdown("---")
    st.markdown("#### Framework × GHG scope coverage matrix")
    st.caption("✅ = GHG data present in inventory · ⭕ = data missing")

    fw_list = ["ESRS", "BRSR", "CDP", "GRI", "TCFD"]
    scope_list = ["Scope 1", "Scope 2", "Scope 3"]

    try:
        import pandas as pd

        matrix = {}
        for fw in fw_list:
            row = {}
            for scope in scope_list:
                # Does any topic in this framework require this scope,
                # and do we have that scope's data?
                needs = any(
                    any(scope in cat for cat in t["ghg_cats"])
                    for t in CROSSMAP.values() if fw in t["framework"]
                )
                has = scope in covered_scopes
                if not needs:
                    row[scope] = "—"
                elif has:
                    row[scope] = "✅"
                else:
                    row[scope] = "⭕"
            matrix[fw] = row
        df = pd.DataFrame(matrix).T
        st.dataframe(df, use_container_width=True)
    except ImportError:
        st.info("Install pandas for the coverage matrix.")

    # ── Action recommendations ────────────────────────────────────────────
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
