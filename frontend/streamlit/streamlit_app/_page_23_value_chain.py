"""
Page 23 — Value Chain Mapping.

Full upstream + downstream with map, GHG workflow, lane mgmt, audit log.
"""
from __future__ import annotations
import csv, io, json, uuid
from datetime import datetime, timezone
from pathlib import Path

import streamlit as st

SUPPLIER_FILE  = Path(__file__).parents[1] / "data" / "suppliers.json"
LOGISTICS_FILE = Path(__file__).parents[1] / "data" / "logistics.json"

_TIER_COLORS   = {1: "#1d4ed8", 2: "#d97706", 3: "#dc2626", "ds": "#16a34a"}
_RISK_COLORS   = {"Low": "#16a34a", "Medium": "#d97706", "High": "#dc2626"}
_TIER_LABELS   = {1: "Tier 1 (direct)", 2: "Tier 2 (indirect)", 3: "Tier 3 (deep)"}
_VALID_ENG     = ["Inactive", "Monitoring", "Active", "Needs improvement"]
_DD_THRESHOLDS = {1: 50, 2: 25, 3: 15}

_MODES = [
    "Road (HGV diesel)", "Road (HGV CNG)", "Road (LCV/Van diesel)",
    "Rail (diesel)", "Rail (electric, India)", "Rail (electric, EU)",
    "Sea (container)", "Sea (bulk carrier)", "Sea (coastal)",
    "Air (freight, short haul)", "Air (freight, long haul)",
    "Intermodal (road+rail)", "Intermodal (road+sea)",
]


def _load_sups(org_id):
    if not SUPPLIER_FILE.exists(): return []
    return [s for s in json.loads(SUPPLIER_FILE.read_text()) if s.get("org_id") == org_id]

def _load_lanes(org_id):
    if not LOGISTICS_FILE.exists(): return []
    return [l for l in json.loads(LOGISTICS_FILE.read_text()) if l.get("org_id") == org_id]

def _save_sups(org_id, updated):
    all_sups = json.loads(SUPPLIER_FILE.read_text()) if SUPPLIER_FILE.exists() else []
    others   = [s for s in all_sups if s.get("org_id") != org_id]
    SUPPLIER_FILE.write_text(json.dumps(others + updated, indent=2), encoding="utf-8")

def _save_lanes(org_id, updated):
    all_lanes = json.loads(LOGISTICS_FILE.read_text()) if LOGISTICS_FILE.exists() else []
    others    = [l for l in all_lanes if l.get("org_id") != org_id]
    LOGISTICS_FILE.write_text(json.dumps(others + updated, indent=2), encoding="utf-8")

def _dd_score(s):
    sc = 0
    if s.get("questionnaire_submitted"): sc += 25
    if s.get("audit_date"):             sc += 25
    if s.get("engagement") in ("Active","Monitoring"): sc += 20
    if s.get("iso14001"):               sc += 15
    if (s.get("ghg_scope1_tco2e") or 0) > 0: sc += 15
    return sc

def _composite(s):
    return round(0.4*s.get("e_score",50) + 0.35*s.get("s_score",50) + 0.25*s.get("g_score",50), 1)

def _ghg_template_csv(supplier):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Field","Your value","Unit","Notes"])
    rows = [
        ("Supplier name",     supplier["name"],  "",       "Pre-filled"),
        ("Reporting year",    "",                "YYYY",   "e.g. 2024"),
        ("Scope 1 emissions", "",                "tCO2e",  "Direct combustion"),
        ("Scope 2 emissions", "",                "tCO2e",  "Purchased electricity"),
        ("GHG boundary",      "",                "",       "e.g. Operational control"),
        ("GHG standard",      "",                "",       "e.g. GHG Protocol"),
        ("Third-party verified","",             "Yes/No",  ""),
        ("Reduction target",  "",               "Yes/No",  ""),
        ("Target year",       "",               "YYYY",    ""),
        ("Renewable energy %","",               "%",       "0-100"),
        ("ISO 14001 certified","",              "Yes/No",  ""),
        ("Supplier CoC signed","",              "Yes/No",  ""),
    ]
    for r in rows: w.writerow(r)
    return buf.getvalue().encode("utf-8")

def _new_lane(s, p_lat, p_lon, p_city, org_id, mode, dist, vol):
    return {
        "id": "L"+uuid.uuid4().hex[:6].upper(),
        "material":        s.get("material", s.get("category","?")),
        "supplier":        s["name"],
        "supplier_tier":   s.get("tier",1),
        "supplier_city":   s.get("city",""),
        "supplier_lat":    s.get("lat",20.0),
        "supplier_lon":    s.get("lon",78.0),
        "plant":           "Main Plant",
        "plant_city":      p_city,
        "plant_lat":       p_lat,
        "plant_lon":       p_lon,
        "mode":            mode,
        "distance_km":     dist,
        "volume_tonnes_yr":vol,
        "spend_cr":        s.get("spend_cr",0),
        "lead_time_days":  7,
        "frequency":       "Weekly",
        "legs":            [],
        "org_id":          org_id,
        "criticality":     "Medium",
        "tCO2e_yr":        0.0,
        "created_at":      datetime.now(timezone.utc).isoformat()[:10],
    }


def render():
    st.title("🔗 Value Chain Mapping")
    st.caption(
        "Full upstream (T1→T2→T3) and downstream value chain. "
        "Enter locations, transport lanes, and GHG data per tier. "
        "Feeds ESRS S2, CSDDD, BRSR P8/P9, CDP C11."
    )

    from streamlit_app._org_helper import fix_page
    profile  = st.session_state.get("org_profile", {})
    org_id, inventory = fix_page(profile, st.session_state.get("inventory"))
    if not org_id:
        st.warning("Complete Setup first."); return

    org_name = profile.get("org_name","Organisation")
    username = st.session_state.get("username","user")
    sites    = profile.get("sites",[])
    p_lat    = float(sites[0].get("lat", sites[0].get("lat_deg",18.52))) if sites else 18.52
    p_lon    = float(sites[0].get("lon", sites[0].get("lon_deg",73.86))) if sites else 73.86
    p_city   = sites[0].get("city", sites[0].get("name","Pune")) if sites else "Pune"

    all_sups  = _load_sups(org_id)
    all_lanes = _load_lanes(org_id)

    upstream   = [s for s in all_sups if not s.get("downstream_customer")]
    downstream = [s for s in all_sups if s.get("downstream_customer")]
    tier1 = [s for s in upstream if s.get("tier",1)==1]
    tier2 = [s for s in upstream if s.get("tier",1)==2]
    tier3 = [s for s in upstream if s.get("tier",1)==3]

    sm1,sm2,sm3,sm4,sm5,sm6 = st.columns(6)
    sm1.metric("Tier 1", len(tier1))
    sm2.metric("Tier 2", len(tier2))
    sm3.metric("Tier 3", len(tier3))
    sm4.metric("Downstream", len(downstream))
    sm5.metric("Lanes mapped", len(all_lanes))
    t1_ok = sum(_dd_score(s) >= _DD_THRESHOLDS[1] for s in tier1)
    t2_ok = sum(_dd_score(s) >= _DD_THRESHOLDS[2] for s in tier2)
    sm6.metric("T1 DD adequate", f"{t1_ok}/{len(tier1)}")
    # Note: sm6 is reused — add sm7 by extending columns
    # Display T2 in caption below to avoid truncation
    st.caption(f"Due diligence adequate: **T1** {t1_ok}/{len(tier1)} (≥50%) · **T2** {t2_ok}/{len(tier2)} (≥25%) · **T3** {sum(_dd_score(s) >= _DD_THRESHOLDS[3] for s in tier3)}/{len(tier3)} (≥15%)")
    st.markdown("---")

    (tab_map, tab_tree, tab_t2,
     tab_add, tab_dd, tab_eng, tab_ghg, tab_buyers) = st.tabs([
        "🗺️ Network map", "🌳 Value chain tree", "🔍 Tier 2+ deep dive",
        "➕ Add supplier", "✅ Due diligence", "📬 Engagement log",
        "📥 GHG data workflow", "🛒 My buyers",
    ])

    # ── MAP ───────────────────────────────────────────────────────────────────
    with tab_map:
        st.markdown("### Value chain network map")
        st.caption(
            "Blue = T1 (direct) · Orange = T2 (indirect) · Red = T3 · Green = Downstream.  "
            "Solid lines = T1→Our plants · Dashed lines = T2→T1 parent.  "
            "Filled circles = has lane mapped · Open circles = no lane.  "
            "Line thickness ∝ tCO₂e/yr."
        )
        try:
            import plotly.graph_objects as go
            fig = go.Figure()

            for lane in all_lanes:
                s_lat  = lane.get("supplier_lat",20)
                s_lon  = lane.get("supplier_lon",78)
                _p_lat = lane.get("plant_lat", p_lat)
                _p_lon = lane.get("plant_lon", p_lon)
                tier_n = lane.get("supplier_tier",1)
                lc     = _TIER_COLORS.get(tier_n,"#94a3b8")
                tco2e  = lane.get("tCO2e_yr",0)
                # T2→T1 lanes use dashed line; T1→plant use solid
                is_t2_lane = lane.get("lane_type") == "upstream_t2"
                _sup_name  = lane.get("supplier","?")
                _mat       = lane.get("material","?")
                _mode      = lane.get("mode","?")
                _dist      = lane.get("distance_km",0)
                _vol       = lane.get("volume_tonnes_yr",0)
                _tier_lbl  = f"T{tier_n}→T{tier_n-1}" if tier_n > 1 else f"T{tier_n}→Plant"
                fig.add_trace(go.Scattergeo(
                    lat=[s_lat, _p_lat], lon=[s_lon, _p_lon],
                    mode="lines",
                    line=dict(
                        width=max(2 if tier_n > 1 else 1, min(6, 1+tco2e/10)),
                        color=lc,
                        dash="dash" if is_t2_lane else "solid",
                    ),
                    opacity=0.75 if is_t2_lane else 0.55,
                    name=f"{_tier_lbl} lane",
                    showlegend=False,
                    hovertemplate=(
                        f"<b>{_sup_name}</b> → {lane.get('plant_city','?')}<br>"
                        f"Mode: {_mode}<br>"
                        f"Distance: {_dist:,}km · Volume: {_vol:,} t/yr<br>"
                        f"tCO₂e/yr: {tco2e:.1f}"
                        "<extra></extra>"
                    ),
                ))

            if sites:
                for site in sites:
                    sl = float(site.get("lat", site.get("lat_deg",p_lat)))
                    slo = float(site.get("lon", site.get("lon_deg",p_lon)))
                    fig.add_trace(go.Scattergeo(
                        lat=[sl], lon=[slo], mode="markers+text",
                        marker=dict(size=22, color="#0f172a", symbol="star",
                                    line=dict(width=2,color="white")),
                        text=[org_name], textposition="top center",
                        name=org_name, showlegend=True,
                    ))

            # Inferred nodes from GHG inventory (utility, waste, freight)
            try:
                from streamlit_app.vc_inference import infer_vc_nodes
                _show_inferred = st.toggle("Show GHG-inferred nodes (utility, waste, carriers)",
                                           value=True, key="vc_show_inferred")
                if _show_inferred and inventory:
                    _country = profile.get("primary_country","IN")
                    _inf_nodes = infer_vc_nodes(inventory, org_id,
                                                profile.get("reporting_year",2024), _country)
                    _inferred_legend_shown = False
                    for _n in _inf_nodes:
                        _nl = _n.get("lat"); _nlo = _n.get("lon")
                        if _nl is None or _nlo is None: continue
                        fig.add_trace(go.Scattergeo(
                            lat=[_nl], lon=[_nlo],
                            mode="markers+text",
                            marker=dict(size=11, color="#f59e0b", symbol="diamond",
                                        line=dict(width=1.5, color="white")),
                            text=[_n["name"][:16]], textposition="bottom center",
                            textfont=dict(size=8, color="#92400e"),
                            name="Inferred (GHG data)",
                            legendgroup="inferred",
                            showlegend=not _inferred_legend_shown,
                            hovertemplate=(
                                f"<b>{_n['name']}</b><br>"
                                f"Category: {_n['category']}<br>"
                                f"Inferred from: {_n.get('_inferred_from','?')}<br>"
                                f"tCO₂e: {_n.get('ghg_all_tco2e',0):,.1f}<br>"
                                f"<i>{_n.get('_double_count_note','')[:100]}</i>"
                                "<extra></extra>"
                            ),
                        ))
                        _inferred_legend_shown = True
            except Exception as _ie:
                pass  # inferred nodes are optional

            legend_added = set()
            for sup in all_sups:
                lat = sup.get("lat"); lon = sup.get("lon")
                if lat is None or lon is None: continue
                tier_n = sup.get("tier",1)
                is_ds  = sup.get("downstream_customer",False)
                color  = _TIER_COLORS["ds"] if is_ds else _TIER_COLORS.get(tier_n,"#6b7280")
                label  = "Downstream" if is_ds else _TIER_LABELS.get(tier_n,"T1")
                dd     = _dd_score(sup)
                rc     = _RISK_COLORS.get(sup.get("risk","Medium"),"#d97706")
                has_ln = any(l.get("supplier")==sup["name"] for l in all_lanes)
                sym    = "circle" if has_ln else "circle-open"
                show_leg = label not in legend_added
                if show_leg: legend_added.add(label)
                fig.add_trace(go.Scattergeo(
                    lat=[lat], lon=[lon],
                    mode="markers+text",
                    marker=dict(size=14, color=color, symbol=sym,
                                line=dict(width=2, color=rc)),
                    text=[sup["name"][:14]], textposition="top center",
                    textfont=dict(size=9),
                    name=label, legendgroup=label, showlegend=show_leg,
                    hovertemplate=(
                        f"<b>{sup['name']}</b><br>T{tier_n} · {sup.get('country','?')}<br>"
                        f"E/S/G: {sup.get('e_score',0)}/{sup.get('s_score',0)}/{sup.get('g_score',0)}<br>"
                        f"Risk: {sup.get('risk','?')} · DD: {dd}%<br>"
                        f"GHG S1+2: {(sup.get('ghg_scope1_tco2e',0) or 0)+(sup.get('ghg_scope2_tco2e',0) or 0):,.0f} tCO₂e"
                        "<extra></extra>"
                    ),
                ))

            # Auto-fit bounds to include all supplier locations AND lane origins
            # Lane supplier_lat/lon = actual origin (e.g. Shenzhen factory)
            # Supplier registry lat/lon = registered address (may differ)
            # Both are needed to ensure overseas suppliers (Delta/Shenzhen) are visible
            all_lats = ([p_lat]
                + [s.get("lat") for s in all_sups if s.get("lat")]
                + [l.get("supplier_lat") for l in all_lanes if l.get("supplier_lat")]
                + [l.get("plant_lat")    for l in all_lanes if l.get("plant_lat")])
            all_lons = ([p_lon]
                + [s.get("lon") for s in all_sups if s.get("lon")]
                + [l.get("supplier_lon") for l in all_lanes if l.get("supplier_lon")]
                + [l.get("plant_lon")    for l in all_lanes if l.get("plant_lon")])
            all_lats = [x for x in all_lats if x is not None]
            all_lons = [x for x in all_lons if x is not None]
            lat_min = min(all_lats) - 5; lat_max = max(all_lats) + 5
            lon_min = min(all_lons) - 5; lon_max = max(all_lons) + 5
            center_lat = (lat_min + lat_max) / 2
            center_lon = (lon_min + lon_max) / 2
            # Scale: wider bbox = smaller scale
            lat_range = lat_max - lat_min; lon_range = lon_max - lon_min
            scale = max(0.5, min(4.0, 60 / max(lat_range, lon_range)))

            fig.update_geos(
                showland=True, landcolor="#f1f5f9",
                showocean=True, oceancolor="#bfdbfe",
                showcoastlines=True, coastlinecolor="#94a3b8",
                showrivers=False, showcountries=True, countrycolor="#cbd5e1",
                center=dict(lat=center_lat, lon=center_lon),
                projection_scale=scale,
            )
            fig.update_layout(
                height=560, margin=dict(t=10,b=10,l=0,r=0),
                legend=dict(orientation="h",y=-0.06,font=dict(size=11)),
            )
            st.plotly_chart(fig, use_container_width=True, key="vc_netmap")
            st.caption(
                "Filled circles = lane mapped · Open circles = no lane yet  \n"
                "🔶 = inferred from GHG inventory (utility, waste handler, freight carrier)"
            )

            # Show boundary / double-count legend
            with st.expander("📐 Boundary & double-count protection guide", expanded=False):
                st.markdown("""
**How this map avoids double-counting:**

| Node | What it represents | Boundary | Overlap with? |
|---|---|---|---|
| Grid utility (S2) | Electricity at your meter | At meter | None |
| Grid T&D operator (Cat 3C) | Losses between generator and meter | On the wire | Auto-derived from S2 kWh — no separate entry needed |
| Fuel supplier to grid (Cat 3B) | Fuel extracted/processed to generate your electricity | Well to power plant gate | None with S2 or 3C |
| Upstream fuel supplier (Cat 3A) | WTT upstream of fuels you burn in S1 | Well to your tank | None with S1 combustion (S1=TTW, 3A=WTT) |
| Waste handler (Cat 5) | Third-party waste treatment | At waste facility | None with S1 (own combustion) or Cat 12 |
| Freight carrier (Cat 4/9) | Transport services | Door to door | None with Cat 1 (the goods) |

**Cat 3C T&D is automatically calculated** from your Scope 2 kWh entries — never enter it manually in the Scope 3 page.
                """)
        except ImportError:
            st.info("Install plotly for the network map.")

    # ── TREE ─────────────────────────────────────────────────────────────────
    with tab_tree:
        st.markdown("### Value chain tree")
        st.caption("All data visible per supplier. Shows linked transport lanes.")

        st.markdown("#### ⬆️ Upstream suppliers")
        for t1 in tier1:
            dd       = _dd_score(t1)
            risk     = t1.get("risk","Medium")
            ri       = {"Low":"🟢","Medium":"🟡","High":"🔴"}.get(risk,"🟡")
            t1_lanes = [l for l in all_lanes if l.get("supplier")==t1["name"]]
            kids     = [s for s in tier2 if s.get("parent_supplier")==t1["name"]]
            with st.expander(
                f"{ri} T1 · **{t1['name']}**  |  {t1.get('material','?')[:22]}  |  "
                f"E/S/G {t1.get('e_score',0)}/{t1.get('s_score',0)}/{t1.get('g_score',0)}  |  "
                f"DD {dd}%  |  {len(t1_lanes)} lane(s)  |  {len(kids)} T2",
                expanded=False,
            ):
                c1,c2,c3,c4 = st.columns(4)
                c1.markdown(f"**City:** {t1.get('city','?')} · {t1.get('country','?')}\n\n"
                            f"**Lat/Lon:** {t1.get('lat','?')}, {t1.get('lon','?')}\n\n"
                            f"**Industry:** {t1.get('industry','?')}")
                c2.markdown(f"**Spend:** ₹{t1.get('spend_cr',0):,.1f} Cr\n\n"
                            f"**GHG S1:** {t1.get('ghg_scope1_tco2e',0) or 0:,.0f} tCO₂e\n\n"
                            f"**GHG S2:** {t1.get('ghg_scope2_tco2e',0) or 0:,.0f} tCO₂e")
                c3.markdown(f"**ISO 14001:** {'✅' if t1.get('iso14001') else '❌'}\n\n"
                            f"**SBTi:** {'✅' if t1.get('sbti') else '❌'}\n\n"
                            f"**Questionnaire:** {'✅' if t1.get('questionnaire_submitted') else '❌'}")
                c4.markdown(f"**Engagement:** {t1.get('engagement','?')}\n\n"
                            f"**Last audit:** {t1.get('audit_date') or '—'}\n\n"
                            f"**Risk:** {ri} {risk}")

                if t1_lanes:
                    st.markdown("**Transport lanes:**")
                    for ln in t1_lanes:
                        legs = ln.get("legs",[])
                        leg_str = " → ".join(
                            f"{lg['mode'].split('(')[0].strip()} {lg['distance_km']}km"
                            for lg in legs
                        ) if legs else f"{ln.get('mode','?')} {ln.get('distance_km',0)}km"
                        st.markdown(
                            f"  `{ln['id']}` {ln.get('material','?')[:20]} — "
                            f"**{leg_str}** — {ln.get('volume_tonnes_yr',0)} t/yr — "
                            f"₹{ln.get('spend_cr',0):.1f}Cr — {ln.get('tCO2e_yr',0):.1f} tCO₂e/yr"
                        )
                else:
                    st.warning("⚠️ No transport lane — add one via ➕ Add supplier or 📥 GHG data workflow")

                if kids:
                    st.markdown(f"**Tier 2 of {t1['name']}:**")
                    for t2 in kids:
                        t2l = [l for l in all_lanes if l.get("supplier")==t2["name"]]
                        dd2 = _dd_score(t2)
                        t3s = [s for s in tier3 if s.get("parent_supplier")==t2["name"]]
                        st.markdown(
                            f"  ↳ **{t2['name']}** · {t2.get('city','?')} · "
                            f"E/S/G {t2.get('e_score',0)}/{t2.get('s_score',0)}/{t2.get('g_score',0)} · "
                            f"DD {dd2}% · {len(t2l)} lane(s)"
                        )
                        for t3 in t3s:
                            st.markdown(f"     ↳↳ {t3['name']} · {t3.get('city','?')}")

        if downstream:
            st.markdown("---\n#### ⬇️ Downstream customers")
            for ds in downstream:
                ds_lanes = [l for l in all_lanes if l.get("supplier")==ds["name"]]
                with st.expander(
                    f"📦 DS · **{ds['name']}**  |  {ds.get('material','?')[:22]}  |  "
                    f"₹{ds.get('spend_cr',0):,.1f}Cr  |  {len(ds_lanes)} lane(s)",
                    expanded=False,
                ):
                    dc1,dc2,dc3 = st.columns(3)
                    dc1.markdown(f"**City:** {ds.get('city','?')} · {ds.get('country','?')}\n\n"
                                 f"**Lat/Lon:** {ds.get('lat','?')}, {ds.get('lon','?')}")
                    dc2.markdown(f"**E/S/G:** {ds.get('e_score',0)}/{ds.get('s_score',0)}/{ds.get('g_score',0)}\n\n"
                                 f"**Engagement:** {ds.get('engagement','?')}")
                    dc3.markdown(f"**Notes:** {ds.get('notes','')[:80]}")

    # ── TIER 2+ DEEP DIVE ────────────────────────────────────────────────────
    with tab_t2:
        st.markdown("### Tier 2 & Tier 3 — location, mode, GHG entry")
        st.caption(
            "Enter location, transport mode, and GHG data for each T2/T3 supplier. "
            "Changes save immediately to suppliers.json and logistics.json."
        )
        if not tier2 and not tier3:
            st.info("No Tier 2/3 suppliers yet. Add them in ➕ Add supplier.")
        else:
            for tier_grp, tier_list in [(2,tier2),(3,tier3)]:
                if not tier_list: continue
                st.markdown(f"#### {_TIER_LABELS[tier_grp]}")
                for s in tier_list:
                    dd = _dd_score(s)
                    t_lanes = [l for l in all_lanes if l.get("supplier")==s["name"]]
                    ri = {"Low":"🟢","Medium":"🟡","High":"🔴"}.get(s.get("risk","Medium"),"🟡")
                    with st.expander(
                        f"{ri} **{s['name']}** (T{tier_grp})  ↳ via {s.get('parent_supplier','?')}  |  "
                        f"DD {dd}%  |  {len(t_lanes)} lane(s)  |  "
                        f"{s.get('city','?')} · {s.get('country','?')}",
                        expanded=False,
                    ):
                        st.markdown("**📍 Location**")
                        l1,l2,l3,l4 = st.columns(4)
                        nc = l1.text_input("City",    value=s.get("city",""),   key=f"t2cy_{s['name']}")
                        nco= l2.text_input("Country", value=s.get("country","IN"), key=f"t2co_{s['name']}")
                        nl = l3.number_input("Lat", value=float(s.get("lat",20.0)), format="%.4f", key=f"t2la_{s['name']}")
                        nlo= l4.number_input("Lon", value=float(s.get("lon",78.0)), format="%.4f", key=f"t2lo_{s['name']}")

                        st.markdown("**🌿 GHG data**")
                        g1,g2,g3,g4 = st.columns(4)
                        ns1 = g1.number_input("Scope 1 (tCO₂e)", min_value=0.0, format="%.1f",
                                              value=float(s.get("ghg_scope1_tco2e") or 0), key=f"t2s1_{s['name']}")
                        ns2 = g2.number_input("Scope 2 (tCO₂e)", min_value=0.0, format="%.1f",
                                              value=float(s.get("ghg_scope2_tco2e") or 0), key=f"t2s2_{s['name']}")
                        niso= g3.toggle("ISO 14001", value=bool(s.get("iso14001")), key=f"t2iso_{s['name']}")
                        nq  = g4.toggle("Questionnaire submitted",
                                        value=bool(s.get("questionnaire_submitted")), key=f"t2q_{s['name']}")

                        st.markdown(f"**🚛 Lane to {s.get('parent_supplier','Tier 1 buyer')}**")
                        m1,m2,m3 = st.columns(3)
                        existing_lane = next((l for l in t_lanes), None)
                        cur_mode = existing_lane["mode"] if existing_lane else _MODES[0]
                        cur_dist = existing_lane["distance_km"] if existing_lane else 100
                        cur_vol  = existing_lane["volume_tonnes_yr"] if existing_lane else 500
                        nm = m1.selectbox("Mode", _MODES,
                                          index=_MODES.index(cur_mode) if cur_mode in _MODES else 0,
                                          key=f"t2m_{s['name']}")
                        nd = m2.number_input("Distance to buyer (km)", min_value=0, value=int(cur_dist),
                                             key=f"t2d_{s['name']}")
                        nv = m3.number_input("Volume (t/yr)", min_value=0, value=int(cur_vol),
                                             key=f"t2v_{s['name']}")

                        if st.button(f"💾 Save", key=f"t2sv_{s['name']}", type="primary",
                                     use_container_width=True):
                            for sup in all_sups:
                                if sup["name"] == s["name"]:
                                    sup.update({"city":nc.strip(),"country":nco.strip().upper(),
                                                "lat":float(nl),"lon":float(nlo),
                                                "ghg_scope1_tco2e":float(ns1),
                                                "ghg_scope2_tco2e":float(ns2),
                                                "iso14001":bool(niso),
                                                "questionnaire_submitted":bool(nq)})
                                    break
                            _save_sups(org_id, all_sups)
                            if existing_lane:
                                existing_lane.update({"mode":nm,"distance_km":int(nd),
                                                      "volume_tonnes_yr":int(nv),
                                                      "supplier_lat":float(nl),
                                                      "supplier_lon":float(nlo),
                                                      "supplier_city":nc.strip()})
                            else:
                                all_lanes.append(_new_lane(s,p_lat,p_lon,p_city,org_id,nm,int(nd),int(nv)))
                            _save_lanes(org_id, all_lanes)
                            st.success(f"✅ {s['name']} saved")
                            st.rerun()

    # ── ADD SUPPLIER ──────────────────────────────────────────────────────────
    with tab_add:
        st.markdown("### Add supplier or downstream customer")
        st.caption("Tier 2+ suppliers: set parent = the Tier 1 supplier they deliver to.")

        is_ds = st.toggle("Downstream customer", key="vc_is_ds")
        a1,a2,a3 = st.columns(3)
        name     = a1.text_input("Name *", key="vc_name")
        material = a2.text_input("Material / product", key="vc_mat")
        industry = a3.text_input("Industry", key="vc_ind")

        b1,b2,b3,b4 = st.columns(4)
        country  = b1.text_input("Country code", value="IN", key="vc_ctry")
        city     = b2.text_input("City", key="vc_city")
        lat      = b3.number_input("Lat", value=20.0, format="%.4f", key="vc_lat")
        lon      = b4.number_input("Lon", value=78.0, format="%.4f", key="vc_lon")

        c1,c2,c3 = st.columns(3)
        tier     = c1.selectbox("Tier", [1,2,3], key="vc_tier", disabled=is_ds)
        spend_cr = c2.number_input("Spend (Rs Cr)", min_value=0.0, format="%.2f", key="vc_sp")
        parent_opts = ["—"] + [s["name"] for s in upstream if s.get("tier",1) < int(tier)]
        parent_sup  = c3.selectbox("Parent supplier", parent_opts, key="vc_parent",
                                    disabled=(int(tier)==1 and not is_ds))
        engagement  = st.selectbox("Initial engagement", _VALID_ENG, key="vc_eng")
        notes       = st.text_input("Notes", key="vc_notes")

        st.markdown("**Add transport lane now (optional):**")
        la1,la2,la3 = st.columns(3)
        add_lane = la1.toggle("Add lane", key="vc_addlane")
        lane_mode= la2.selectbox("Mode", _MODES, key="vc_lmode", disabled=not add_lane)
        lane_dist= la3.number_input("Distance (km)", min_value=0, value=200,
                                     key="vc_ldist", disabled=not add_lane)
        lane_vol = st.number_input("Volume (t/yr)", min_value=0, value=500,
                                   key="vc_lvol", disabled=not add_lane)

        if st.button("💾 Add to value chain", key="vc_save", type="primary",
                     use_container_width=True):
            if not name.strip():
                st.error("Name is required.")
            else:
                ns = {
                    "name":name.strip(), "category":industry.strip() or "Supplier",
                    "material":material.strip(), "spend_cr":float(spend_cr),
                    "country":country.strip().upper(), "industry":industry.strip(),
                    "city":city.strip(), "lat":float(lat), "lon":float(lon),
                    "e_score":50,"s_score":50,"g_score":50,"composite":50.0,
                    "risk":"Medium","engagement":engagement,"audit_date":None,
                    "questionnaire_submitted":False,"cdp_disclosure":False,
                    "sbti":False,"iso14001":False,"ghg_audit":False,
                    "ghg_scope1_tco2e":0.0,"ghg_scope2_tco2e":0.0,
                    "ghg_cat1_tco2e":0.0,"ghg_cat4_tco2e":0.0,
                    "ghg_all_tco2e":0.0,"ghg_n_records":0,
                    "engagement_history":[],"notes":notes.strip(),
                    "org_id":org_id,
                    "tier":1 if is_ds else int(tier),
                    "parent_supplier": None if (int(tier)==1 and not is_ds)
                                       else (parent_sup if parent_sup!="—" else None),
                    "child_suppliers":[],"downstream_customer":bool(is_ds),
                    "created_at":datetime.now(timezone.utc).isoformat()[:10],
                }
                if parent_sup and parent_sup!="—":
                    for s in all_sups:
                        if s["name"]==parent_sup:
                            s.setdefault("child_suppliers",[])
                            if name.strip() not in s["child_suppliers"]:
                                s["child_suppliers"].append(name.strip())
                all_sups.append(ns)
                _save_sups(org_id, all_sups)
                if add_lane:
                    all_lanes.append(_new_lane(ns,p_lat,p_lon,p_city,org_id,
                                               lane_mode,int(lane_dist),int(lane_vol)))
                    _save_lanes(org_id, all_lanes)
                st.success(f"Added: {name}" + (" + lane" if add_lane else ""))
                st.rerun()

    # ── DUE DILIGENCE ────────────────────────────────────────────────────────
    with tab_dd:
        st.markdown("### CSDDD / ESRS S2 Due diligence tracker")
        st.caption(
            "CSDDD thresholds: T1 >= 50% adequate · T2 >= 25% basic. "
            "Score components: questionnaire (25) + audit (25) + engagement (20) + ISO14001 (15) + GHG data (15)."
        )
        try:
            import pandas as pd
            dd_rows = []
            for s in upstream:
                tn = s.get("tier",1)
                th = _DD_THRESHOLDS.get(tn,15)
                dd = _dd_score(s)
                dd_rows.append({
                    "Tier":    f"T{tn}",
                    "Supplier":s["name"],
                    "Via":     s.get("parent_supplier","—") or "—",
                    "Country": s.get("country","?"),
                    "Quest.":  "✅" if s.get("questionnaire_submitted") else "❌",
                    "Audit":   "✅" if s.get("audit_date") else "❌",
                    "Active":  "✅" if s.get("engagement") in ("Active","Monitoring") else "❌",
                    "ISO14001":"✅" if s.get("iso14001") else "❌",
                    "GHG data":"✅" if (s.get("ghg_scope1_tco2e") or 0)>0 else "❌",
                    "DD score":f"{dd}%",
                    "Required":f">={th}%",
                    "Status":  "✅ Adequate" if dd>=th else f"⚠️ Need {th-dd}% more",
                })
            df_dd = pd.DataFrame(dd_rows).sort_values(["Tier","Status"])
            st.dataframe(df_dd, use_container_width=True, hide_index=True)
            st.download_button("⬇️ DD register (.csv)", df_dd.to_csv(index=False),
                               file_name=f"dd_{org_id[:10]}.csv", mime="text/csv")
        except ImportError:
            st.info("Install pandas for DD table.")

    # ── ENGAGEMENT LOG ────────────────────────────────────────────────────────
    with tab_eng:
        st.markdown("### Engagement actions — immutable audit log")
        st.caption("Sorted by priority: spend × (100-composite) × (100-DD) / 10000.")

        rows = sorted(
            [(float(s.get("spend_cr",0) or 0)*(100-_composite(s))*(100-_dd_score(s))/10000, s)
             for s in upstream],
            key=lambda x: -x[0]
        )
        for pri, s in rows:
            hist = s.get("engagement_history",[])
            tn   = s.get("tier",1)
            dd   = _dd_score(s)
            with st.expander(
                f"**{s['name']}** (T{tn})  |  ₹{s.get('spend_cr',0):,.1f}Cr  |  "
                f"DD {dd}%  |  Pri {pri:.0f}  |  {len(hist)} log entries",
                expanded=False,
            ):
                if hist:
                    st.markdown("**History (newest first):**")
                    for e in reversed(hist[-8:]):
                        st.markdown(
                            f"  `{e.get('date','?')}` **{e.get('action','?')}** "
                            f"— {e.get('note','')[:80]} _{e.get('by','?')}_"
                        )
                    st.markdown("---")

                ea1,ea2 = st.columns(2)
                new_eng = ea1.selectbox("Status", _VALID_ENG,
                    index=_VALID_ENG.index(s.get("engagement","Inactive"))
                    if s.get("engagement","Inactive") in _VALID_ENG else 0,
                    key=f"eng_st_{s['name']}")
                new_aud = ea2.text_input("Audit date (YYYY-MM-DD)",
                    value=s.get("audit_date","") or "", key=f"eng_aud_{s['name']}")
                action  = st.selectbox("Log action", [
                    "Send GHG data request","Send questionnaire","Schedule audit",
                    "Conduct audit","Issue corrective action plan (CAP)",
                    "Receive GHG data","Validate/verify emissions",
                    "Escalate to senior management","Close engagement",
                ], key=f"eng_act_{s['name']}")
                note = st.text_input("Note", key=f"eng_note_{s['name']}",
                                     placeholder="e.g. Q3 data received, audit scheduled Nov 2024")
                if st.button("📬 Log action", key=f"eng_log_{s['name']}",
                             use_container_width=True, type="primary"):
                    for sup in all_sups:
                        if sup["name"]==s["name"]:
                            sup["engagement"] = new_eng
                            if new_aud.strip(): sup["audit_date"] = new_aud.strip()
                            sup.setdefault("engagement_history",[]).append({
                                "date":datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                                "action":action,"note":note.strip(),"by":username,
                            })
                            break
                    _save_sups(org_id, all_sups)
                    st.success(f"Logged: {action}")
                    st.rerun()
                missing = [m for cond,m in [
                    (not s.get("questionnaire_submitted"),"Questionnaire not submitted"),
                    (not s.get("audit_date"),"No audit on record"),
                    (not (s.get("ghg_scope1_tco2e") or 0),"No GHG Scope 1 data"),
                ] if cond]
                if missing:
                    st.markdown("**Missing for DD:**")
                    for m in missing: st.markdown(f"  • {m}")

    # ── GHG DATA WORKFLOW ────────────────────────────────────────────────────
    with tab_ghg:
        st.markdown("### GHG data request workflow")
        st.caption(
            "Step 1: Download pre-filled CSV template for any supplier. "
            "Step 2: Email to supplier. "
            "Step 3: Supplier fills in and returns. "
            "Step 4: Upload their completed CSV here."
        )
        sup_opts = [s["name"] for s in upstream]
        if not sup_opts:
            st.info("No suppliers yet.")
        else:
            st.markdown("#### Step 1 — Download data request template")
            req_sel = st.selectbox("Select supplier", sup_opts, key="ghg_req_sel")
            req_sup = next((s for s in upstream if s["name"]==req_sel), None)
            if req_sup:
                sc1,sc2 = st.columns(2)
                sc1.download_button(
                    f"⬇️ Download GHG template — {req_sel[:20]}",
                    data=_ghg_template_csv(req_sup),
                    file_name=f"GHG_request_{req_sel[:20].replace(' ','_')}.csv",
                    mime="text/csv", type="primary",
                )
                sc2.markdown("""
**Template fields:**
- Scope 1 & 2 (tCO₂e)
- GHG boundary & standard
- Third-party verified (Yes/No)
- Renewable energy %
- ISO 14001 & CoC (Yes/No)
                """)
            st.markdown("---")
            st.markdown("#### Step 4 — Upload supplier response")
            up_sel  = st.selectbox("Supplier responding", sup_opts, key="ghg_up_sel")
            up_file = st.file_uploader("Upload completed CSV", type=["csv"], key="ghg_upload")
            if up_file and up_sel:
                try:
                    content = up_file.read().decode("utf-8-sig")
                    rdr = csv.DictReader(io.StringIO(content))
                    parsed = {r["Field"]:r["Your value"] for r in rdr
                              if r.get("Your value","").strip()}
                    st.markdown("**Parsed:**"); st.json(parsed)
                    if st.button("✅ Apply to supplier", key="ghg_apply"):
                        for sup in all_sups:
                            if sup["name"]==up_sel:
                                if parsed.get("Scope 1 emissions"):
                                    try: sup["ghg_scope1_tco2e"]=float(parsed["Scope 1 emissions"])
                                    except: pass
                                if parsed.get("Scope 2 emissions"):
                                    try: sup["ghg_scope2_tco2e"]=float(parsed["Scope 2 emissions"])
                                    except: pass
                                if parsed.get("ISO 14001 certified","").lower()=="yes":
                                    sup["iso14001"]=True
                                if parsed.get("Supplier CoC signed","").lower()=="yes":
                                    sup["questionnaire_submitted"]=True
                                if parsed.get("Third-party verified","").lower()=="yes":
                                    sup["ghg_audit"]=True
                                sup.setdefault("engagement_history",[]).append({
                                    "date":datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                                    "action":"GHG data received via CSV upload",
                                    "note":f"S1={parsed.get('Scope 1 emissions','?')} S2={parsed.get('Scope 2 emissions','?')} tCO2e",
                                    "by":username,
                                })
                                break
                        _save_sups(org_id, all_sups)
                        st.success(f"GHG data applied to {up_sel}")
                        st.rerun()
                except Exception as ex:
                    st.error(f"Parse error: {ex}")

    # ══════════════════════════════════════════════════════════════════════════
    # TAB 7 — MY BUYERS (when this org is also a supplier)
    # ══════════════════════════════════════════════════════════════════════════
    with tab_buyers:
        st.markdown("### 🛒 My buyers — where I am the supplier")
        st.caption(
            "If your organisation also acts as a supplier to other companies, "
            "register your buyers here. This enables your buyers to include your "
            "GHG data in their Scope 3 Cat 1 (purchased goods) inventory. "
            "Downstream customers (distributors, retailers) are also managed here."
        )

        # Show existing downstream / buyer registrations
        _my_buyers = [s for s in all_sups if s.get("downstream_customer")]
        if _my_buyers:
            st.markdown(f"**{len(_my_buyers)} buyer(s) / downstream customer(s) registered:**")
            for b in _my_buyers:
                b_lanes = [l for l in all_lanes if l.get("supplier") == b["name"]]
                with st.expander(
                    f"📦 **{b['name']}**  |  {b.get('material','?')[:25]}  |  "
                    f"₹{b.get('spend_cr',0):,.1f}Cr  |  {len(b_lanes)} lane(s)",
                    expanded=False,
                ):
                    bc1, bc2, bc3 = st.columns(3)
                    bc1.markdown(f"**City:** {b.get('city','?')} · {b.get('country','?')}\n\n"
                                 f"**Lat/Lon:** {b.get('lat','?')}, {b.get('lon','?')}")
                    bc2.markdown(f"**Product:** {b.get('material','?')}\n\n"
                                 f"**Engagement:** {b.get('engagement','?')}")
                    bc3.markdown(f"**My GHG in their S3:**\n"
                                 f"Cat 1 (goods): {b.get('ghg_cat1_tco2e',0) or 0:,.0f} tCO₂e\n"
                                 f"Cat 4 (transport): {b.get('ghg_cat4_tco2e',0) or 0:,.0f} tCO₂e")
                    if b.get("notes"):
                        st.caption(b["notes"])
        else:
            st.info("No buyers registered yet. Add them below.")

        st.markdown("---")
        st.markdown("#### Register a buyer")
        with st.form("add_buyer_form"):
            ba1, ba2, ba3 = st.columns(3)
            buyer_name   = ba1.text_input("Buyer/customer name *")
            buyer_product= ba2.text_input("Product/material you supply to them")
            buyer_spend  = ba3.number_input("Annual transaction value (₹ Cr)", min_value=0.0, format="%.2f")
            bb1, bb2, bb3, bb4 = st.columns(4)
            buyer_city   = bb1.text_input("Buyer city")
            buyer_ctry   = bb2.text_input("Country code", value="IN")
            buyer_lat    = bb3.number_input("Buyer lat", value=20.0, format="%.4f")
            buyer_lon    = bb4.number_input("Buyer lon", value=78.0, format="%.4f")

            # My GHG contribution to their S3
            bc1, bc2 = st.columns(2)
            buyer_cat1 = bc1.number_input("My Scope 3 Cat 1 in their inventory (tCO₂e)",
                                           min_value=0.0, format="%.2f",
                                           help="Emissions from producing goods you sell to them")
            buyer_cat4 = bc2.number_input("Cat 4 transport contribution (tCO₂e)",
                                           min_value=0.0, format="%.2f",
                                           help="Transport emissions getting goods to them")
            buyer_notes = st.text_area("Notes", height=50)
            buyer_save  = st.form_submit_button("💾 Register buyer", type="primary")

            if buyer_save and buyer_name.strip():
                new_buyer = {
                    "name": buyer_name.strip(),
                    "category": "Customer", "material": buyer_product.strip(),
                    "spend_cr": float(buyer_spend),
                    "country": buyer_ctry.strip().upper(), "industry": "Customer",
                    "city": buyer_city.strip(), "lat": float(buyer_lat), "lon": float(buyer_lon),
                    "e_score": 50, "s_score": 50, "g_score": 50, "composite": 50.0,
                    "risk": "Low", "engagement": "Active",
                    "audit_date": None, "questionnaire_submitted": False,
                    "cdp_disclosure": False, "sbti": False, "iso14001": False,
                    "ghg_audit": False,
                    "ghg_scope1_tco2e": 0.0, "ghg_scope2_tco2e": 0.0,
                    "ghg_cat1_tco2e": float(buyer_cat1),
                    "ghg_cat4_tco2e": float(buyer_cat4),
                    "ghg_all_tco2e": float(buyer_cat1) + float(buyer_cat4),
                    "ghg_n_records": 0,
                    "engagement_history": [],
                    "notes": buyer_notes.strip(),
                    "org_id": org_id,
                    "tier": 1, "parent_supplier": None, "child_suppliers": [],
                    "downstream_customer": True,
                    "created_at": datetime.now(timezone.utc).isoformat()[:10],
                }
                all_sups.append(new_buyer)
                _save_sups(org_id, all_sups)
                st.success(f"✅ Buyer registered: {buyer_name}")
                st.rerun()

        st.markdown("---")
        st.markdown("#### What this enables downstream")
        st.markdown("""
When you register your buyers and provide your GHG contribution:

| Capability | Where it flows |
|---|---|
| Your Cat 1 contribution | Appears in buyer's Scope 3 Cat 1 when they import from your portal |
| Transport emissions | Feeds Cat 4 (upstream transport) for your buyer |
| Supplier portal | Your buyer sees you as a registered Tier 1 supplier |
| ESRS S2 / BRSR P8 | Buyer can include your GHG data in their value chain disclosures |
| CDP C11 supplier engagement | Your data improves their supplier engagement score |
        """)
