"""
_page_20_value_chain.py — Value Chain Map (separate from Logistics map)

The Logistics map shows transport lanes & modes. The Value Chain map shows
WHO is in the chain — Tier 1/2/3 supplier hierarchy, inferred suppliers
discovered from GHG records, downstream buyers, and coverage gaps.

Data sources:
  • data/suppliers.json    registered Tier 1/2/3 suppliers (org-isolated)
  • data/logistics.json    transport lanes (used for geo coords)
  • data/inventory.sqlite  supplier_name / buyer_name in emission_results
"""
from __future__ import annotations
import json
import sqlite3
from pathlib import Path
import streamlit as st

_DATA_DIR = Path(__file__).parents[1] / "data"
_SUP_FILE = _DATA_DIR / "suppliers.json"
_LOG_FILE = _DATA_DIR / "logistics.json"
_INV_DB   = _DATA_DIR / "inventory.sqlite"


# ── Data helpers ───────────────────────────────────────────────────────────────

def _load_suppliers(org_id: str) -> list:
    if not _SUP_FILE.exists():
        return []
    try:
        all_sup = json.loads(_SUP_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []
    return [s for s in all_sup
            if s.get("org_uuid", "demo-acme-mfg-001") == org_id]


def _load_lanes(org_id: str) -> list:
    if not _LOG_FILE.exists():
        return []
    try:
        all_lanes = json.loads(_LOG_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []
    return [l for l in all_lanes
            if l.get("org_uuid", "demo-acme-mfg-001") == org_id]


def _inferred_suppliers(org_id: str, inv_year: int) -> list:
    cn = sqlite3.connect(str(_INV_DB), timeout=30.0)
    try:
        cn.execute("PRAGMA busy_timeout=30000")
    except Exception:
        pass
    rows = cn.execute("""
        SELECT supplier_name,
               COUNT(*)                AS n,
               COALESCE(SUM(t_CO2e),0) AS t,
               GROUP_CONCAT(DISTINCT category)  AS cats,
               GROUP_CONCAT(DISTINCT scope)     AS scopes
          FROM emission_results
         WHERE org_id=? AND inventory_year=?
           AND supplier_name IS NOT NULL AND supplier_name <> ''
      GROUP BY supplier_name
      ORDER BY t DESC
    """, (org_id, inv_year)).fetchall()
    cn.close()
    return [
        {"name": r[0], "n_records": r[1], "total_t": round(r[2], 1),
         "cats": r[3] or "", "scopes": r[4] or ""}
        for r in rows
    ]


def _inferred_buyers(org_id: str, inv_year: int) -> list:
    cn = sqlite3.connect(str(_INV_DB), timeout=30.0)
    try:
        cn.execute("PRAGMA busy_timeout=30000")
    except Exception:
        pass
    rows = cn.execute("""
        SELECT buyer_name,
               COUNT(*)                AS n,
               COALESCE(SUM(t_CO2e),0) AS t,
               GROUP_CONCAT(DISTINCT category) AS cats
          FROM emission_results
         WHERE org_id=? AND inventory_year=?
           AND buyer_name IS NOT NULL AND buyer_name <> ''
      GROUP BY buyer_name
      ORDER BY t DESC
    """, (org_id, inv_year)).fetchall()
    cn.close()
    return [
        {"name": r[0], "n_records": r[1], "total_t": round(r[2], 1),
         "cats": r[3] or ""}
        for r in rows
    ]


# ── Render ─────────────────────────────────────────────────────────────────────

def render() -> None:
    st.title("🌐 Value Chain Map")
    st.caption(
        "Tier 1 / 2 / 3 supplier hierarchy, inferred suppliers from GHG records, "
        "downstream buyers, and coverage gaps. Distinct from the **🗺️ Logistics map** "
        "which shows transport lanes and modes."
    )

    profile = st.session_state.org_profile
    if not profile.get("setup_done"):
        st.warning("Complete ⚙️ Setup first.")
        return
    from streamlit_app._org_helper import fix_page
    org_id, _inv = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Please log in to access this page.")
        return
    inv_year = profile.get("reporting_year", 2024)
    org_name = profile.get("org_name", "your organisation")
    st.markdown(
        f"**Organisation:** {org_name}  ·  **Reporting year:** {inv_year}  ·  "
        f"`{org_id[:8]}…`"
    )

    with st.expander("📖 What does this page show? (methodology)", expanded=False):
        st.markdown("""
**This page complements the Logistics map.** Where the Logistics map answers
*"how do my goods move?"*, the Value Chain map answers *"who is in my value chain?"*

**Four lenses:**

1. **🌍 Map view** — World map of registered suppliers (Tier 1), inferred-only
   suppliers (yellow triangles, mentioned in GHG records but not registered),
   downstream buyers (Cat 11 customers), and your own sites.

2. **🏗️ Tier hierarchy** — Tier 1 (direct suppliers), Tier 2 (suppliers'
   suppliers), Tier 3 (raw material providers). Each card shows ESG composite,
   spend, risk, engagement status, and disclosure badges.

3. **🔍 Inferred & undeclared** — Names found in `supplier_name` / `buyer_name`
   columns of emission records that are NOT yet in your supplier registry.
   Usually informal upstream parties — register them to enable ESG scoring.

4. **⚠️ Coverage gaps** — Two-sided gap analysis: registered suppliers with
   NO matching GHG record, and names in GHG but not in registry.

**Data sources:**
- `data/suppliers.json` — Tier 1/2/3 supplier registry (org-isolated by `org_uuid`)
- `data/logistics.json` — geo coordinates (only for suppliers that also appear as transport lanes)
- `data/inventory.sqlite emission_results.supplier_name / buyer_name` — actual usage in records
""")

    suppliers   = _load_suppliers(org_id)
    lanes       = _load_lanes(org_id)
    inf_sups    = _inferred_suppliers(org_id, inv_year)
    inf_buyers  = _inferred_buyers(org_id, inv_year)

    if not suppliers and not lanes and not inf_sups and not inf_buyers:
        st.warning(
            "No value chain data yet for this organisation.\n\n"
            "• Add suppliers in **🏢 Supplier & ESG**\n"
            "• Add transport lanes in **🗺️ Logistics map**\n"
            "• Tag your Scope 3 records with `supplier_name` / `buyer_name` "
            "in the Scope 3 entry page"
        )
        return

    sup_names_lc = {s["name"].strip().lower() for s in suppliers}
    inf_sup_names_lc = {i["name"].strip().lower() for i in inf_sups}

    inferred_only      = [s for s in inf_sups
                          if s["name"].strip().lower() not in sup_names_lc]
    registered_w_data  = [s for s in suppliers
                          if s["name"].strip().lower() in inf_sup_names_lc]
    registered_no_data = [s for s in suppliers
                          if s["name"].strip().lower() not in inf_sup_names_lc]

    mc = st.columns(5)
    mc[0].metric("Registered suppliers", len(suppliers),
                 help="From data/suppliers.json (Tier 1/2/3 combined).")
    mc[1].metric("With GHG data", len(registered_w_data),
                 help="Registered suppliers with at least one emission record.")
    mc[2].metric("Registered, no GHG", len(registered_no_data),
                 delta=f"-{len(registered_no_data)}" if registered_no_data else None,
                 delta_color="inverse",
                 help="Coverage gap — supplier profile exists but no records reference them.")
    mc[3].metric("Inferred-only", len(inferred_only),
                 delta=f"-{len(inferred_only)}" if inferred_only else None,
                 delta_color="inverse",
                 help="In GHG records but NOT registered.")
    mc[4].metric("Downstream buyers", len(inf_buyers),
                 help="Distinct buyer_name values in Cat 11 records.")

    if suppliers:
        cov_pct = len(registered_w_data) / len(suppliers) * 100
        st.progress(cov_pct / 100,
                    text=f"GHG coverage: {cov_pct:.0f}% of registered suppliers have matched GHG records")

    st.markdown("---")

    tab_map, tab_tier, tab_inf, tab_gap = st.tabs([
        "🌍 Map view",
        "🏗️ Tier hierarchy",
        "🔍 Inferred & undeclared",
        "⚠️ Coverage gaps",
    ])

    # ── TAB 1 ──
    with tab_map:
        st.markdown("#### Geographic value chain")
        st.caption(
            "🟦 Blue stars = your sites · 🟧 Orange circles = registered suppliers · "
            "🟨 Yellow triangles = inferred-only · 🟩 Green diamonds = buyers · "
            "Lines connect each party to your operations."
        )
        try:
            import plotly.graph_objects as go
            import math

            fig = go.Figure()
            all_lats = []
            all_lons = []

            sites = profile.get("sites", []) or []
            if sites:
                site_lats = [s.get("lat", 0) for s in sites]
                site_lons = [s.get("lon", 0) for s in sites]
                all_lats += site_lats
                all_lons += site_lons
                fig.add_trace(go.Scattergeo(
                    lat=site_lats, lon=site_lons,
                    mode="markers+text",
                    marker=dict(size=22, color="#1d4ed8", symbol="star",
                                line=dict(width=1.5, color="white")),
                    text=[s.get("name", "?") for s in sites],
                    textposition="top center",
                    textfont=dict(size=11, family="Arial Black", color="#1e3a8a"),
                    name=f"Your sites ({len(sites)})",
                    legendgroup="company",
                    hovertemplate=(
                        "<b>%{text}</b><br>"
                        "Type: %{customdata[0]}<br>"
                        "%{customdata[1]}, %{customdata[2]}<extra></extra>"
                    ),
                    customdata=[[s.get("type", "?"), s.get("city", "?"), s.get("country", "?")]
                                for s in sites],
                ))

            sup_geo = []
            sup_geo_names = set()
            for l in lanes:
                if l.get("direction") == "downstream":
                    continue
                if l.get("supplier_lat") is None:
                    continue
                if l.get("supplier") in sup_geo_names:
                    continue
                sup_geo_names.add(l["supplier"])
                meta = next((s for s in suppliers if s.get("name") == l.get("supplier")), {})
                sup_geo.append({
                    "name":     l.get("supplier", "?"),
                    "lat":      l["supplier_lat"], "lon": l["supplier_lon"],
                    "country":  meta.get("country", l.get("supplier_country", "?")),
                    "city":     l.get("supplier_city", "?"),
                    "spend":    meta.get("spend_cr", l.get("spend_cr", 0)),
                    "risk":     meta.get("risk", "—"),
                    "tier":     meta.get("tier", 1),
                    "material": l.get("material", "—"),
                })
            if sup_geo:
                all_lats += [s["lat"] for s in sup_geo]
                all_lons += [s["lon"] for s in sup_geo]
                fig.add_trace(go.Scattergeo(
                    lat=[s["lat"] for s in sup_geo],
                    lon=[s["lon"] for s in sup_geo],
                    mode="markers+text",
                    marker=dict(size=15, color="#f97316", symbol="circle",
                                line=dict(width=1.5, color="white")),
                    text=[s["name"][:18] for s in sup_geo],
                    textposition="bottom center",
                    textfont=dict(size=10, color="#9a3412"),
                    name=f"Tier-1 suppliers ({len(sup_geo)})",
                    legendgroup="suppliers",
                    hovertemplate=(
                        "<b>%{text}</b><br>"
                        "Tier %{customdata[0]} · %{customdata[1]}, %{customdata[2]}<br>"
                        "Spend: ₹%{customdata[3]:.1f} Cr · Risk: %{customdata[4]}<br>"
                        "%{customdata[5]}<extra></extra>"
                    ),
                    customdata=[[s["tier"], s["city"], s["country"], s["spend"],
                                 s["risk"], s["material"]] for s in sup_geo],
                ))

            if inferred_only:
                centre_lat, centre_lon = 23.0, 80.0
                radius = 4.5
                inf_lats = [centre_lat + radius * math.cos(2 * math.pi * i / max(len(inferred_only), 1))
                            for i in range(len(inferred_only))]
                inf_lons = [centre_lon + radius * math.sin(2 * math.pi * i / max(len(inferred_only), 1))
                            for i in range(len(inferred_only))]
                all_lats += inf_lats
                all_lons += inf_lons
                fig.add_trace(go.Scattergeo(
                    lat=inf_lats, lon=inf_lons,
                    mode="markers+text",
                    marker=dict(size=13, color="#facc15", symbol="triangle-up",
                                line=dict(width=1.5, color="#854d0e")),
                    text=[s["name"][:22] for s in inferred_only],
                    textposition="top right",
                    textfont=dict(size=9, color="#713f12"),
                    name=f"Inferred-only ({len(inferred_only)})",
                    legendgroup="inferred",
                    hovertemplate=(
                        "<b>%{text}</b><br>"
                        "⚠️ Mentioned in GHG records but NOT registered<br>"
                        "%{customdata[0]} records · %{customdata[1]:.1f} tCO₂e<br>"
                        "Categories: %{customdata[2]}<extra></extra>"
                    ),
                    customdata=[[s["n_records"], s["total_t"], s["cats"]]
                                for s in inferred_only],
                ))

            buyer_lanes = [l for l in lanes if l.get("direction") == "downstream"]
            if buyer_lanes:
                all_lats += [l["plant_lat"] for l in buyer_lanes]
                all_lons += [l["plant_lon"] for l in buyer_lanes]
                fig.add_trace(go.Scattergeo(
                    lat=[l["plant_lat"] for l in buyer_lanes],
                    lon=[l["plant_lon"] for l in buyer_lanes],
                    mode="markers+text",
                    marker=dict(size=18, color="#16a34a", symbol="diamond",
                                line=dict(width=1.5, color="white")),
                    text=[l.get("buyer_name", l.get("plant", "?"))[:20] for l in buyer_lanes],
                    textposition="bottom center",
                    textfont=dict(size=10, color="#15803d"),
                    name=f"Buyers ({len(buyer_lanes)})",
                    legendgroup="buyers",
                    hovertemplate=(
                        "<b>%{text}</b><br>"
                        "Downstream Cat 11 customer<br>"
                        "Mode: %{customdata[0]}<br>"
                        "Spend: ₹%{customdata[1]:.1f} Cr<extra></extra>"
                    ),
                    customdata=[[l.get("mode", "?"), l.get("spend_cr", 0)] for l in buyer_lanes],
                ))

            for l in lanes:
                if l.get("supplier_lat") is None or l.get("plant_lat") is None:
                    continue
                col = "#16a34a" if l.get("direction") == "downstream" else "#94a3b8"
                fig.add_trace(go.Scattergeo(
                    lat=[l["supplier_lat"], l["plant_lat"]],
                    lon=[l["supplier_lon"], l["plant_lon"]],
                    mode="lines",
                    line=dict(width=1, color=col, dash="dot"),
                    showlegend=False, hoverinfo="skip",
                ))

            if all_lats and all_lons:
                lat_min, lat_max = min(all_lats), max(all_lats)
                lon_min, lon_max = min(all_lons), max(all_lons)
                pad_lat = max((lat_max - lat_min) * 0.25, 5)
                pad_lon = max((lon_max - lon_min) * 0.25, 5)
                geo_kwargs = dict(
                    lataxis=dict(range=[lat_min - pad_lat, lat_max + pad_lat]),
                    lonaxis=dict(range=[lon_min - pad_lon, lon_max + pad_lon]),
                )
            else:
                geo_kwargs = dict(
                    lataxis=dict(range=[-10, 60]),
                    lonaxis=dict(range=[40, 140]),
                )

            fig.update_layout(
                geo=dict(
                    scope="world",
                    showland=True, landcolor="#f1f5f9",
                    showocean=True, oceancolor="#dbeafe",
                    showcountries=True, countrycolor="#cbd5e1",
                    countrywidth=0.5,
                    showframe=False,
                    coastlinecolor="#94a3b8",
                    projection_type="natural earth",
                    **geo_kwargs,
                ),
                height=620,
                margin=dict(l=0, r=0, t=10, b=10),
                legend=dict(
                    orientation="h", y=-0.05,
                    bgcolor="rgba(255,255,255,0.92)",
                    bordercolor="#cbd5e1", borderwidth=1,
                    font=dict(size=11),
                ),
                paper_bgcolor="rgba(0,0,0,0)",
            )
            st.plotly_chart(fig, use_container_width=True, key="vc_map_main")

            st.markdown("##### Map summary")
            c1, c2, c3 = st.columns(3)
            c1.markdown(
                f"**🟧 Tier-1 suppliers on map: {len(sup_geo)}**\n\n"
                "Tier-1 suppliers that have a transport lane in `data/logistics.json`, "
                "so we know their location."
            )
            c2.markdown(
                f"**🟨 Inferred-only suppliers: {len(inferred_only)}**\n\n"
                "Names in your emission records but not registered. Without a profile, "
                "we cannot track their ESG performance, certifications, or risk."
            )
            c3.markdown(
                f"**🟩 Buyers (downstream): {len(buyer_lanes) if buyer_lanes else 0}**\n\n"
                "Cat 11 (Use of Sold Products) customers — pulled from `buyer_name` "
                "of your downstream emission records."
            )

        except ImportError:
            st.info("Install plotly to view the map.")

    # ── TAB 2 ──
    with tab_tier:
        st.markdown("#### Supplier tier hierarchy")
        st.caption(
            "**Tier 1** = direct suppliers (you transact with them). "
            "**Tier 2** = suppliers' suppliers (raw inputs to your Tier 1). "
            "**Tier 3** = upstream extractors / refiners."
        )

        by_tier = {1: [], 2: [], 3: []}
        for s in suppliers:
            t = s.get("tier", 1)
            try:
                t = int(t)
            except Exception:
                t = 1
            by_tier.setdefault(t, []).append(s)

        if not any(by_tier.values()):
            st.info("No registered suppliers yet for this organisation.")
        else:
            tm = st.columns(3)
            for col, tier in zip(tm, [1, 2, 3]):
                sups = by_tier.get(tier, [])
                spend = sum(s.get("spend_cr", 0) for s in sups)
                avg_esg = sum(s.get("composite", 0) for s in sups) / len(sups) if sups else 0
                col.metric(
                    f"Tier {tier} suppliers",
                    f"{len(sups)}",
                    delta=f"₹{spend:,.1f} Cr · ESG {avg_esg:.1f}" if sups else None,
                    delta_color="off",
                )

            for tier in [1, 2, 3]:
                sups = by_tier.get(tier, [])
                if not sups:
                    continue
                st.markdown(f"##### Tier {tier} ({len(sups)} suppliers)")
                sups_sorted = sorted(sups, key=lambda x: x.get("spend_cr", 0), reverse=True)
                for s in sups_sorted:
                    nm    = s.get("name", "?")
                    cn_   = s.get("country", "?")
                    cy    = s.get("city", "?")
                    spend = s.get("spend_cr", 0)
                    risk  = s.get("risk", "—")
                    eng   = s.get("engagement", "—")
                    parent = s.get("parent_supplier")
                    parent_str = f" · feeds {parent}" if parent else ""
                    composite = s.get("composite", 0)
                    badges = []
                    if s.get("cdp_disclosure"): badges.append("📊 CDP")
                    if s.get("iso14001"):       badges.append("🌿 ISO 14001")
                    if s.get("sbti"):           badges.append("🎯 SBTi")
                    if s.get("ghg_audit"):      badges.append("✅ GHG audited")
                    badge_str = "  ·  ".join(badges) if badges else "*(no disclosures)*"

                    with st.expander(
                        f"**{nm}** · {cy}, {cn_} · ₹{spend:,.1f} Cr · "
                        f"ESG {composite:.1f} · {risk} risk{parent_str}",
                        expanded=False
                    ):
                        c = st.columns(5)
                        c[0].metric("ESG composite", f"{composite:.1f}")
                        c[1].metric("E", s.get("e_score", 0))
                        c[2].metric("S", s.get("s_score", 0))
                        c[3].metric("G", s.get("g_score", 0))
                        c[4].metric("Spend", f"₹{spend:,.1f} Cr")
                        st.markdown(f"**Disclosures:** {badge_str}")
                        ind = s.get("industry", "—")
                        mat = s.get("material", "—")
                        st.caption(f"Industry: {ind}  ·  Material: {mat}  ·  Engagement: {eng}")
                        if s.get("ghg_all_tco2e", 0):
                            ghg_s1 = s.get("ghg_scope1_tco2e", 0)
                            ghg_s2 = s.get("ghg_scope2_tco2e", 0)
                            ghg_all = s.get("ghg_all_tco2e", 0)
                            st.caption(
                                f"GHG audit reports: {ghg_s1:,.0f} S1 + {ghg_s2:,.0f} S2 = "
                                f"**{ghg_all:,.0f} tCO₂e total**"
                            )
                        if s.get("notes"):
                            st.info(s["notes"])

    # ── TAB 3 ──
    with tab_inf:
        st.markdown("#### Suppliers inferred from GHG records")
        st.caption(
            "Names in `supplier_name` that are NOT in suppliers.json. "
            "Usually informal upstream parties — once registered they appear in the "
            "Supplier & ESG dashboard with full ESG scoring."
        )
        if not inferred_only:
            st.success("✅ All suppliers mentioned in GHG records are properly registered.")
        else:
            try:
                import pandas as pd
                df = pd.DataFrame([
                    {"Supplier name": s["name"],
                     "GHG records":   s["n_records"],
                     "Total tCO₂e":   s["total_t"],
                     "Categories":    s["cats"],
                     "Scopes":        s["scopes"]}
                    for s in inferred_only
                ])
                st.dataframe(df, use_container_width=True, hide_index=True)
                st.warning(
                    f"⚠️ {len(inferred_only)} supplier(s) are mentioned in GHG records "
                    "but not registered. Register them in **🏢 Supplier & ESG** to enable "
                    "ESG scoring, risk analysis, and engagement tracking."
                )
            except ImportError:
                for s in inferred_only:
                    st.write(f"• **{s['name']}** — {s['n_records']} records, {s['total_t']} tCO₂e")

        st.markdown("---")
        st.markdown("#### Buyers from GHG records (Cat 11 customers)")
        st.caption(
            "Names in `buyer_name` field of emission records. These are your "
            "downstream customers for *Use of Sold Products* (Cat 11)."
        )
        if not inf_buyers:
            st.info(
                "No buyer-tagged Cat 11 records yet. Tag your downstream Cat 11 records "
                "with `buyer_name` in the Scope 3 entry page."
            )
        else:
            try:
                import pandas as pd
                dfb = pd.DataFrame([
                    {"Buyer":           b["name"],
                     "Records":         b["n_records"],
                     "tCO₂e (Cat 11)":  b["total_t"],
                     "Categories":      b["cats"]}
                    for b in inf_buyers
                ])
                st.dataframe(dfb, use_container_width=True, hide_index=True)
                total_cat11 = sum(b["total_t"] for b in inf_buyers)
                st.success(
                    f"✅ {len(inf_buyers)} buyer(s) tracked, total Cat 11 emissions: "
                    f"{total_cat11:,.1f} tCO₂e/yr"
                )
            except ImportError:
                for b in inf_buyers:
                    st.write(f"• **{b['name']}** — {b['total_t']} tCO₂e")

    # ── TAB 4 ──
    with tab_gap:
        st.markdown("#### Coverage gap analysis")
        st.caption(
            "Two-sided check between **registered suppliers** (data/suppliers.json) "
            "and **GHG-mentioned suppliers** (emission_results.supplier_name)."
        )

        c1, c2 = st.columns(2)
        with c1:
            st.markdown(f"##### ⚠️ Registered, no GHG records ({len(registered_no_data)})")
            st.caption(
                "Profile exists, but no emission record references this supplier. "
                "Either tag your records with `supplier_name` or remove the registration."
            )
            if not registered_no_data:
                st.success("✅ All registered suppliers have at least one matched GHG record.")
            else:
                for s in registered_no_data:
                    nm = s.get("name", "?")
                    sp = s.get("spend_cr", 0)
                    tr = s.get("tier", 1)
                    mat = s.get("material", "—")
                    st.write(f"• **{nm}** · ₹{sp:,.1f} Cr · Tier {tr} · {mat}")
        with c2:
            st.markdown(f"##### ⚠️ Mentioned in GHG, not registered ({len(inferred_only)})")
            st.caption(
                "Emission record exists, but no supplier profile. "
                "Register them to enable ESG scoring + risk analysis."
            )
            if not inferred_only:
                st.success("✅ All GHG-mentioned suppliers are registered.")
            else:
                for s in inferred_only:
                    st.write(f"• **{s['name']}** · {s['n_records']} records · {s['total_t']} tCO₂e")

        st.markdown("---")
        if registered_no_data or inferred_only:
            st.markdown("##### 💡 Recommendations")
            actions = []
            if registered_no_data:
                actions.append(
                    f"**Tag {len(registered_no_data)} record(s)**: in 🔗 Scope 3 page, "
                    "add the `supplier_name` to existing Cat 1 or Cat 4 entries."
                )
            if inferred_only:
                actions.append(
                    f"**Register {len(inferred_only)} supplier(s)**: open 🏢 Supplier "
                    "& ESG and add profiles for the inferred names."
                )
            for a in actions:
                st.write("• " + a)
        else:
            st.success("✅ Perfect coverage — no gaps detected.")
