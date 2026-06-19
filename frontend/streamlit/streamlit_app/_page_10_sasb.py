"""
_page_10_sasb.py — SASB Standards disclosure + causal chain explorer.

Shows:
  1. Sector selector (11 SASB sectors, 77 industries)
  2. Auto-filled quantitative metrics from GHG inventory
  3. Supplementary input fields (energy, water, waste, H&S)
  4. Causal chain: Primitive → Metric → Outcome
  5. Download: SASB disclosure text + JSON
"""
import streamlit as st


PRIMITIVE_LABELS = {
    "GE": ("🌡️", "GHG emissions"),
    "EU": ("⚡", "Energy use"),
    "WA": ("💧", "Water withdrawal"),
    "WS": ("♻️", "Waste generated"),
    "HS": ("🦺", "Health & Safety"),
    "CL": ("⚖️", "Compliance / legal"),
    "RG": ("📋", "Regulatory constraint"),
    "SC": ("🔗", "Supply chain risk"),
    "OX": ("💰", "Operating cost"),
    "EP": ("🔋", "Energy price"),
    "RV": ("📈", "Revenue / demand"),
    "CM": ("🪨", "Commodity price"),
    "WF": ("👥", "Workforce"),
    "DT": ("⏸️", "Downtime / continuity"),
    "IR": ("🏦", "Interest rates"),
    "XW": ("🌪️", "Extreme weather"),
    "LT": ("🚚", "Freight / logistics"),
    "CX": ("🏗️", "Capex"),
    "CY": ("🔒", "Cyber security"),
    "FR": ("💹", "Financial risk"),
    "LC": ("🧑‍🏭", "Labour cost"),
    "FX": ("💱", "FX / currency"),
}

OUTCOME_COLOURS = {
    "E": "#EF553B",   # red — financial exposure
    "R": "#636EFA",   # blue — reputational
    "S": "#AB63FA",   # purple — systemic
    "O": "#FFA15A",   # orange — operational
}


def render():
    st.title("🏭 SASB Standards Disclosure")

    profile = st.session_state.org_profile
    if not profile.get("setup_done"):
        st.warning("Complete ⚙️ Setup first.")
        return

    # ── org_id + inventory resolved from auth user (bypasses session timing) ──
    from streamlit_app._org_helper import fix_page
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Please log in to access this page.")
        return
    # Update local profile copy so forms write to the right org
    profile = dict(profile)
    profile["org_uuid"] = org_id
    profile["org_id"]   = org_id

    conn      = st.session_state.ef_conn
    inventory = st.session_state.inventory

    # ── Resolve org_id + inventory directly (bypass session timing) ─────────
    from streamlit_app._org_helper import resolve_org_id, get_inv_store
    _fixed_org = resolve_org_id(profile)
    if _fixed_org and _fixed_org != "default":
        org_id = _fixed_org
        inventory = get_inv_store(_fixed_org)
    
    # ── Check SASB data loaded ────────────────────────────────────────────
    try:
        n_sasb = conn.execute("SELECT COUNT(*) FROM sasb_metrics").fetchone()[0]
    except Exception:
        n_sasb = 0

    if n_sasb == 0:
        st.error(
            "SASB metrics not yet seeded. "
            "Run `python setup.py --force` to load the SASB dataset."
        )
        return

    st.caption(
        f"{n_sasb} SASB metrics across 11 sectors. "
        "Select your sector below — your industry is auto-detected from Setup."
    )

    # ── Sector selector ───────────────────────────────────────────────────
    from outputs.disclosures.sasb_mapper import get_sasb_sectors, PRIMITIVE_LABELS as PL
    sectors = get_sasb_sectors(conn)
    if not sectors:
        st.error("No sectors found in SASB table.")
        return

    # ── Sector: auto-derive from Setup profile, override allowed ─────────
    profile_sasb_sector  = profile.get("sasb_sector", "")
    profile_industry     = profile.get("industry", "")
    _show_override = st.session_state.get("sasb_override_sector", False)

    if profile_sasb_sector and profile_sasb_sector in sectors and not _show_override:
        sector = profile_sasb_sector
        st.success(
            f"📌 SASB sector **{sector}** — auto-selected / auto-detected from your Setup industry "
            f"(**{profile_industry}**). "
        )
        if st.button("Change sector", key="sasb_override_btn"):
            st.session_state["sasb_override_sector"] = True
            st.rerun()
    else:
        default_idx = 0
        # Try best-match suggestion even if exact mapping fails
        _best_guess = ""
        for _kw, _sec in [
            ("Financial","Financials"),("Bank","Financials"),("Insurance","Financials"),
            ("Manufact","Resource Transformation"),("Chemical","Resource Transformation"),
            ("Metal","Extractives & Minerals Processing"),
            ("Tech","Technology & Communications"),("Software","Technology & Communications"),
            ("Food","Food & Beverage"),("Agri","Food & Beverage"),
            ("Transport","Transportation"),("Logistic","Transportation"),
            ("Real Estate","Infrastructure"),("Infra","Infrastructure"),
            ("Retail","Consumer Goods"),("Consumer","Consumer Goods"),
            ("Health","Health Care"),("Pharma","Health Care"),
        ]:
            if _kw.lower() in profile_industry.lower():
                _best_guess = _sec
                break

        if profile_sasb_sector and profile_sasb_sector in sectors:
            default_idx = sectors.index(profile_sasb_sector) + 1
        elif _best_guess and _best_guess in sectors:
            default_idx = sectors.index(_best_guess) + 1

        if not profile_industry:
            st.warning(
                "⚠️ **Industry not set.** Go to ⚙️ Setup → 1️⃣ Organisation, "
                "set your industry, and Save profile. SASB sector will be auto-detected."
            )
        elif not profile_sasb_sector or profile_sasb_sector not in sectors:
            st.info(
                f"📌 **Industry in Setup: {profile_industry}**. "
                + (f"Suggested SASB sector: **{_best_guess}** — confirm or change below." 
                   if _best_guess else "No automatic mapping. Select sector below.")
            )

        sector = st.selectbox(
            "Confirm or change your SASB sector",
            ["— select —"] + sectors,
            index=default_idx,
            key="sasb_sector_select",
            help="This is normally set automatically from your Setup industry. "
                 "This override is only needed if your industry spans multiple SASB sectors."
        )
        if _show_override and st.button(
            f"← Revert to Setup sector ({profile_sasb_sector or 'none set'})",
            key="sasb_reset_btn"
        ):
            st.session_state["sasb_override_sector"] = False
            st.rerun()
        if sector == "— select —":
            _render_primitive_legend()
            return

    inv_year = profile.get("reporting_year", 2024)

    # ── Auto-pull GHG totals from inventory ───────────────────────────────
    _inv_s1 = _inv_s2 = _inv_s3 = _inv_total = 0.0
    _inv_n_records = 0
    try:
        _inv = st.session_state.get("inventory")
        _org_id = org_id if "org_id" in dir() and org_id != "default" else (profile.get("org_uuid") or profile.get("org_uuid") or profile.get("org_id") or "default")
        if _inv:
            _summary = _inv.get_summary(org_id=_org_id, inventory_year=inv_year)
            _inv_s1    = float(_summary.get("scope1_t_co2e", 0) or 0)
            _inv_s2    = float(_summary.get("scope2_t_co2e", 0) or 0)
            _inv_s3    = float(_summary.get("scope3_t_co2e", 0) or 0)
            _inv_total = _inv_s1 + _inv_s2 + _inv_s3
            _inv_n_records = int(_summary.get("n_records", 0) or 0)
    except Exception:
        pass

    if _inv_total > 0:
        st.info(
            f"📊 **GHG inventory auto-loaded:** "
            f"S1 {_inv_s1:,.0f} · S2 {_inv_s2:,.0f} · S3 {_inv_s3:,.0f} "
            f"= **{_inv_total:,.0f} tCO₂e** ({_inv_n_records} records, FY {inv_year}). "
            "Scope 1+2+3 metrics below are pre-filled from this data."
        )

    # ── Supplementary inputs ──────────────────────────────────────────────
    with st.expander("📥 Supplementary operational inputs (optional)", expanded=True):
        st.caption(
            "GHG data is pulled automatically from your inventory. "
            "Add energy, water, waste and H&S data for fuller coverage."
        )
        sa1, sa2, sa3 = st.columns(3)
        energy_mwh  = sa1.number_input("Total energy consumed (MWh)", min_value=0.0,
                                        format="%.1f", key="sasb_energy")
        water_m3    = sa2.number_input("Water withdrawn (m³)", min_value=0.0,
                                        format="%.1f", key="sasb_water")
        waste_t     = sa3.number_input("Total waste generated (t)", min_value=0.0,
                                        format="%.2f", key="sasb_waste")
        sb1, sb2, sb3 = st.columns(3)
        haz_t       = sb1.number_input("Hazardous waste (t)", min_value=0.0,
                                        format="%.2f", key="sasb_haz")
        trir        = sb2.number_input("TRIR (per 200k hrs)", min_value=0.0,
                                        format="%.4f", key="sasb_trir",
                                        help="Total Recordable Incident Rate")
        fatalities  = sb3.number_input("Fatalities (number)", min_value=0,
                                        step=1, key="sasb_fatal")
        revenue_m   = st.number_input("Revenue (USD million)", min_value=0.0,
                                       format="%.2f", key="sasb_rev")

    # ── Generate disclosure ────────────────────────────────────────────────
    from outputs.disclosures.sasb_mapper import generate_sasb_disclosure
    try:
        result = generate_sasb_disclosure(
            inventory=inventory,
            org_profile=profile,
            ef_conn=conn,
            inventory_year=inv_year,
            sector=sector,
            energy_mwh=float(energy_mwh) if energy_mwh else None,
            water_m3=float(water_m3)    if water_m3    else None,
            waste_t=float(waste_t)      if waste_t     else None,
            hazardous_waste_t=float(haz_t) if haz_t    else None,
            trir=float(trir)            if trir        else None,
            fatalities=int(fatalities)  if fatalities  else None,
            revenue_usd_m=float(revenue_m) if revenue_m else None,
        )
    except Exception as e:
        st.error(f"SASB generation failed: {e}")
        return

    # ── Coverage scorecard ────────────────────────────────────────────────
    st.markdown("---")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Applicable metrics", result["applicable_metrics"])
    m2.metric("Quantitative filled",
              f"{result['quant_filled']} / {result['quant_total']}")
    m3.metric("Coverage", f"{result['coverage_pct']}%")
    m4.metric("Sector", sector.split()[0] if sector else "—")

    # ── Tabs: Metrics | Causal chains | Primitives | Downloads ───────────
    tab1, tab2, tab3, tab4 = st.tabs([
        "📋 Filled metrics", "🔗 Causal chains", "🧬 Primitive coverage", "⬇️ Downloads"
    ])

    with tab1:
        _render_metrics_table(result, sector)

    with tab2:
        _render_causal_chains(result, conn)

    with tab3:
        _render_primitive_coverage(result, conn, sector)

    with tab4:
        _render_downloads(result, profile, inv_year)


# ---------------------------------------------------------------------------
# Tab: Metrics table
# ---------------------------------------------------------------------------

def _render_metrics_table(result: dict, sector: str):
    st.markdown(f"#### {sector} — SASB metrics ({result['applicable_metrics']} total)")

    filled = result["filled_metrics"]
    unfilled = result["unfilled_metrics"]

    if filled:
        st.markdown(f"**✅ Filled ({len(filled)})**")
        try:
            import pandas as pd
            rows = []
            for m in filled:
                prims_str = " | ".join(
                    f"{PRIMITIVE_LABELS.get(p, (p,''))[0]} {p}" for p in m["primitives"]
                )
                outcomes_str = ", ".join(m["outcomes"])
                rows.append({
                    "Metric ID":   m["metric_id"],
                    "Topic":       m["topic"][:35],
                    "Metric":      m["metric_name"][:55],
                    "Value":       f"{m['value']} {m['value_unit']}" if m["value"] else "—",
                    "Primitives":  prims_str,
                    "Outcomes":    outcomes_str[:50],
                })
            df = pd.DataFrame(rows)
            st.dataframe(df, use_container_width=True, hide_index=True)
        except ImportError:
            for m in filled:
                st.write(f"**{m['metric_id']}** — {m['metric_name'][:60]} → "
                         f"{m['value']} {m['value_unit']}")
    else:
        st.info("No metrics filled yet. Add data in Scope 1/2/3 pages or enter "
                "supplementary inputs above.")

    with st.expander(f"○ All sector metrics — {len(unfilled)} not yet filled (add data in Scope 1/2/3)", expanded=True):
        for m in unfilled:
            prims_str = " | ".join(
                f"{PRIMITIVE_LABELS.get(p, (p,''))[0]} {p}" for p in m["primitives"]
            )
            st.caption(
                f"**{m['metric_id']}** · {m['topic'][:30]} · "
                f"{m['metric_name'][:50]} · *needs: {prims_str}*"
            )


# ---------------------------------------------------------------------------
# Tab: Causal chains
# ---------------------------------------------------------------------------

def _render_causal_chains(result: dict, conn):
    st.markdown("#### Causal chain: Primitive → Metric → Outcome")
    st.caption(
        "Each filled metric is driven by one or more primitives and propagates "
        "to financial or reputational outcome nodes."
    )

    chains = result.get("causal_chains", [])
    if not chains:
        st.info("No causal chains — fill metrics first.")
        return

    try:
        import plotly.graph_objects as go
        import pandas as pd

        # Build Sankey: primitives → topics → outcome domains
        from collections import defaultdict
        prim_counts  = defaultdict(float)
        topic_counts = defaultdict(float)
        out_counts   = defaultdict(float)
        prim_topic   = defaultdict(float)
        topic_out    = defaultdict(float)

        for c in chains:
            p = c["primitive_code"]
            t = c["topic"][:30]
            o = c["outcome_code"].split(":")[0] if ":" in c["outcome_code"] else "O"
            weight = abs(c.get("value") or 1.0)
            prim_counts[p]   += weight
            topic_counts[t]  += weight
            out_counts[o]    += weight
            prim_topic[(p,t)] += weight
            topic_out[(t,o)]  += weight

        # Node list
        prims  = sorted(prim_counts)
        topics = sorted(topic_counts)
        outs   = sorted(out_counts)
        nodes  = prims + topics + outs
        ni     = {n: i for i, n in enumerate(nodes)}

        src, tgt, val, lbl = [], [], [], []
        for (p, t), w in prim_topic.items():
            src.append(ni[p]); tgt.append(ni[t]); val.append(w)
            lbl.append(f"{p}→{t[:20]}")
        for (t, o), w in topic_out.items():
            src.append(ni[t]); tgt.append(ni[o]); val.append(w)
            lbl.append(f"{t[:20]}→{o}")

        # Colours
        node_colours = []
        for n in nodes:
            if n in PRIMITIVE_LABELS:
                node_colours.append("#636EFA")
            elif len(n) <= 2 and n in OUTCOME_COLOURS:
                node_colours.append(OUTCOME_COLOURS[n])
            else:
                node_colours.append("#EF553B")

        node_labels = [
            f"{PRIMITIVE_LABELS.get(n,(n,''))[0]} {n}" if n in PRIMITIVE_LABELS
            else n
            for n in nodes
        ]

        fig = go.Figure(go.Sankey(
            node=dict(label=node_labels, color=node_colours, pad=12, thickness=20),
            link=dict(source=src, target=tgt, value=val, label=lbl),
        ))
        fig.update_layout(title="Primitive → Topic → Outcome flow",
                          height=500, margin=dict(t=40, b=10))
        st.plotly_chart(fig, use_container_width=True, key="p10sasb_plt_1")

    except ImportError:
        # Fallback: text-only causal chain
        st.caption("Install plotly for Sankey diagram: pip install plotly")
        seen = set()
        for c in chains[:30]:
            key = (c["primitive_code"], c["topic"], c["outcome_code"])
            if key not in seen:
                seen.add(key)
                icon = PRIMITIVE_LABELS.get(c["primitive_code"], ("●", ""))[0]
                st.write(
                    f"{icon} **{c['primitive_label']}** → "
                    f"{c['topic'][:35]} → "
                    f"_{c['outcome_label']}_"
                )


# ---------------------------------------------------------------------------
# Tab: Primitive coverage
# ---------------------------------------------------------------------------

def _render_primitive_coverage(result: dict, conn, sector: str):
    st.markdown("#### Primitive binding coverage")
    st.caption(
        "Each row shows how many SASB metrics for this sector depend on a primitive. "
        "Green = you have data; grey = data missing."
    )

    # Count metrics per primitive in sector
    try:
        rows = conn.execute("""
            SELECT primitive_bindings, COUNT(*) as n
            FROM sasb_metrics
            WHERE LOWER(sector) = LOWER(?)
            GROUP BY primitive_bindings
        """, (sector,)).fetchall()
    except Exception:
        rows = []

    from collections import Counter
    prim_counts: Counter = Counter()
    for r in rows:
        for p in [c.strip() for c in (r[0] or "").split(",") if c.strip()]:
            prim_counts[p] += r[1]

    filled_prims = {c["primitive_code"] for c in result.get("causal_chains", [])}

    try:
        import pandas as pd
        table_rows = []
        for code, count in sorted(prim_counts.items(), key=lambda x: -x[1]):
            icon, label = PRIMITIVE_LABELS.get(code, ("●", code))
            status = "✅ Data available" if code in filled_prims else "○ No data yet"
            table_rows.append({
                "Code": code,
                "Primitive": f"{icon} {label}",
                "Metrics affected": count,
                "Status": status,
            })
        df = pd.DataFrame(table_rows)
        st.dataframe(df, use_container_width=True, hide_index=True)
    except ImportError:
        for code, count in sorted(prim_counts.items(), key=lambda x: -x[1]):
            icon, label = PRIMITIVE_LABELS.get(code, ("●", code))
            status = "✅" if code in filled_prims else "○"
            st.write(f"{status} {icon} **{code}** — {label}: {count} metrics")


# ---------------------------------------------------------------------------
# Tab: Downloads
# ---------------------------------------------------------------------------

def _render_downloads(result: dict, profile: dict, inv_year: int):
    import json
    org_slug = (profile.get("org_name","org")[:15].replace(" ","_")).lower()
    sector   = (result.get("sector") or "all").replace(" ","_").replace("&","and")[:20]

    st.markdown("#### Download SASB disclosure")
    d1, d2 = st.columns(2)
    d1.download_button(
        "⬇️ SASB Disclosure (.txt)",
        data=result["text"],
        file_name=f"SASB_{sector}_{org_slug}_{inv_year}.txt",
        mime="text/plain",
        use_container_width=True,
    )
    d2.download_button(
        "⬇️ SASB Data (.json)",
        data=json.dumps(result["json"], indent=2, default=str),
        file_name=f"SASB_{sector}_{org_slug}_{inv_year}.json",
        mime="application/json",
        use_container_width=True,
    )

    st.markdown("---")
    st.markdown("#### Causal chain export")
    if result.get("causal_chains"):
        import csv, io
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=[
            "primitive_code","primitive_label","metric_id",
            "metric_name","topic","outcome_code","outcome_label",
            "value","value_unit"
        ])
        writer.writeheader()
        writer.writerows(result["causal_chains"])
        st.download_button(
            "⬇️ Causal chains (.csv)",
            data=buf.getvalue(),
            file_name=f"SASB_causal_chains_{sector}_{inv_year}.csv",
            mime="text/csv",
            use_container_width=True,
        )

    # Unfilled metrics as action list
    if result.get("unfilled_metrics"):
        lines = [f"SASB Unfilled Metrics — {result.get('sector')} — {inv_year}",
                 f"Total: {len(result['unfilled_metrics'])}",
                 ""]
        for m in result["unfilled_metrics"]:
            lines.append(
                f"{m['metric_id']} | {m['topic'][:40]} | {m['metric_name'][:60]} "
                f"| needs: {', '.join(m['primitives'])}"
            )
        st.download_button(
            "⬇️ Data gaps action list (.txt)",
            data="\n".join(lines),
            file_name=f"SASB_gaps_{sector}_{inv_year}.txt",
            mime="text/plain",
            use_container_width=True,
        )


# ---------------------------------------------------------------------------
# Primitive legend (shown before sector is selected)
# ---------------------------------------------------------------------------

def _render_primitive_legend():
    st.markdown("---")
    st.markdown("#### Primitive bindings — what they mean")
    st.caption(
        "Every SASB metric is bound to one or more *primitives* — the "
        "underlying drivers that causally propagate to business outcomes."
    )
    cols = st.columns(3)
    items = list(PRIMITIVE_LABELS.items())
    per_col = (len(items) + 2) // 3
    for i, col in enumerate(cols):
        for code, (icon, label) in items[i*per_col:(i+1)*per_col]:
            col.caption(f"**{code}** {icon} — {label}")
