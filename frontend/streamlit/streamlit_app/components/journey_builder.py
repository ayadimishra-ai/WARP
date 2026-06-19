"""
Streamlit component: Multi-modal Journey Builder.

Lets users define a single product shipment as multiple legs, each with
a different transport mode. The component:
  1. Accepts N legs (origin → mode → destination → weight → distance/auto)
  2. Calculates tonne-km and CO2e per leg
  3. Sums to a total shipment CO2e
  4. Returns a list of ActivityRecord objects (one per leg, linked by shipment_id)

Usage:
    from streamlit_app.components.journey_builder import journey_builder
    records = journey_builder(conn, profile, category='Cat4')

The returned records can be passed directly to engine.calculate_batch().
Legs share a common shipment_id in their extra{} field so they appear
grouped in the inventory dashboard.
"""
from __future__ import annotations
import math
import uuid
import sqlite3

import streamlit as st

# ── Modal defaults for quick reference ──────────────────────────────────────
_MODE_EF: dict[str, float] = {
    "Truck (HGV, India)":     0.062,
    "Truck (DEFRA 2024, GB)": 0.062,
    "Rail (freight)":         0.022,
    "Container ship":         0.012,
    "Bulk carrier":           0.007,
    "Air freight":            0.602,
    "Intermodal":             0.040,
    "Van / LCV":              0.176,
    "Coastal shipping (IN)":  0.006,
}

_MODE_FUEL: dict[str, str] = {
    "Truck (HGV, India)":     "truck",
    "Truck (DEFRA 2024, GB)": "truck",
    "Rail (freight)":         "rail",
    "Container ship":         "container_ship",
    "Bulk carrier":           "bulk_carrier",
    "Air freight":            "air",
    "Intermodal":             "intermodal",
    "Van / LCV":              "van",
    "Coastal shipping (IN)":  "ship",
}

# Major port/city coordinates for auto-distance (subset — full list in DB)
_CITY_COORDS: dict[str, tuple[float, float]] = {
    "Mumbai":       (18.9500, 72.8333),
    "Delhi":        (28.6139, 77.2090),
    "Bangalore":    (12.9716, 77.5946),
    "Chennai":      (13.0878, 80.2785),
    "Hyderabad":    (17.3850, 78.4867),
    "Kolkata":      (22.5726, 88.3639),
    "Pune":         (18.5204, 73.8567),
    "Ahmedabad":    (23.0225, 72.5714),
    "Surat":        (21.1702, 72.8311),
    "Kochi":        (9.9312, 76.2673),
    "Visakhapatnam":(17.6868, 83.2185),
    "JNPT":         (18.9500, 72.8333),
    "Mundra":       (22.7500, 69.7167),
    "Kandla":       (23.0100, 70.2200),
    "Singapore":    (1.2897, 103.8501),
    "Shanghai":     (31.2304, 121.4737),
    "Rotterdam":    (51.9225, 4.4792),
    "Hamburg":      (53.5753, 9.8689),
    "Antwerp":      (51.2993, 4.4040),
    "Dubai":        (25.2532, 55.3657),
    "London":       (51.4775, -0.4614),
    "Los Angeles":  (33.7395, -118.2621),
    "New York":     (40.6640, -74.0453),
    "Hong Kong":    (22.3193, 114.1694),
    "Busan":        (35.1796, 129.0756),
    "Tokyo":        (35.6762, 139.6503),
    "Sydney":       (-33.8688, 151.2093),
    "Durban":       (-29.8587, 31.0218),
    "Santos":       (-23.9333, -46.3333),
    "Felixstowe":   (51.9546, 1.3510),
}


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great circle distance in km using Haversine formula."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi  = math.radians(lat2 - lat1)
    dlam  = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return 2 * R * math.asin(math.sqrt(a))


def _auto_distance(origin: str, dest: str) -> float | None:
    """
    Estimate great circle distance from city/port names.
    Returns km or None if cities not in lookup table.
    """
    o = origin.strip().title()
    d = dest.strip().title()
    c_o = _CITY_COORDS.get(o)
    c_d = _CITY_COORDS.get(d)
    if c_o and c_d:
        raw = _haversine_km(*c_o, *c_d)
        # Apply detour factor by mode type (road longer than sea/air)
        return raw
    return None


def _lookup_port_from_db(conn: sqlite3.Connection, name: str) -> tuple[float, float] | None:
    """Try to find lat/lon from major_ports table."""
    try:
        row = conn.execute(
            """SELECT lat, lon FROM major_ports
               WHERE LOWER(name) LIKE LOWER(?) OR LOWER(unlocode) = LOWER(?)
               LIMIT 1""",
            (f"%{name}%", name),
        ).fetchone()
        if row:
            return float(row[0]), float(row[1])
    except Exception:
        pass
    return None


def journey_builder(
    conn: sqlite3.Connection,
    profile: dict,
    category: str = "Cat4",
    key_prefix: str = "jb",
) -> list:
    """
    Render the multi-modal journey builder widget.

    Args:
        conn:       EF store connection
        profile:    org_profile from session_state
        category:   'Cat4' (upstream) or 'Cat9' (downstream)
        key_prefix: unique key prefix for Streamlit widgets

    Returns:
        list of ActivityRecord objects (one per leg, linked by shipment_id)
    """
    from modules.base import ActivityRecord

    records = []
    org_id   = profile.get("org_uuid") or profile.get("org_id") or "default"
    inv_year = profile.get("reporting_year", 2024)
    country  = profile.get("primary_country", "IN")
    gwp_ar   = profile.get("gwp_ar", 6)

    process_map = {
        "Cat4": "S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
        "Cat9": "S3 Cat 9 \u2014 Downstream transport (distance-based, tonne-km)",
    }
    process = process_map.get(category, process_map["Cat4"])

    st.markdown(f"#### {'Upstream' if category=='Cat4' else 'Downstream'} journey builder")
    st.caption(
        "Define one shipment as multiple legs. Each leg gets its own emission calculation. "
        "All legs are linked under one shipment ID in the inventory."
    )

    # Shipment metadata
    c1, c2, c3 = st.columns(3)
    shipment_desc = c1.text_input("Shipment description",
                                   placeholder="e.g. Steel coils Pune→Rotterdam",
                                   key=f"{key_prefix}_desc")
    cargo_weight  = c2.number_input("Cargo weight", min_value=0.0, value=0.0,
                                     format="%.2f", key=f"{key_prefix}_weight")
    weight_unit   = c3.selectbox("Unit", ["t", "kg", "kt"], key=f"{key_prefix}_wunit")

    if cargo_weight <= 0:
        st.info("Enter cargo weight above to start building journey legs.")
        return []

    # Convert to tonnes
    w_to_t = {"t": 1.0, "kg": 0.001, "kt": 1000.0}
    cargo_t = cargo_weight * w_to_t[weight_unit]

    st.markdown("---")
    st.markdown("**Journey legs**")

    n_legs = st.number_input("Number of legs", min_value=1, max_value=10,
                              value=2, step=1, key=f"{key_prefix}_nlegs")

    shipment_id = f"SHIP_{uuid.uuid4().hex[:8].upper()}"
    leg_results: list[dict] = []
    total_co2e  = 0.0
    all_valid   = True

    for i in range(int(n_legs)):
        leg_num = i + 1
        with st.expander(f"Leg {leg_num}", expanded=True):
            lc1, lc2, lc3 = st.columns(3)

            origin = lc1.text_input("Origin", key=f"{key_prefix}_orig_{i}",
                                     placeholder="e.g. Pune, Mumbai JNPT")
            mode_label = lc2.selectbox("Mode", options=list(_MODE_EF.keys()),
                                        key=f"{key_prefix}_mode_{i}")
            dest   = lc3.text_input("Destination", key=f"{key_prefix}_dest_{i}",
                                     placeholder="e.g. Rotterdam, Singapore")

            # Distance input
            dc1, dc2, dc3 = st.columns(3)
            dist_mode = dc1.radio("Distance",
                                   ["Enter manually", "Auto (from city names)"],
                                   key=f"{key_prefix}_distmode_{i}",
                                   horizontal=True)

            if dist_mode == "Auto (from city names)" and origin and dest:
                auto_km = _auto_distance(origin, dest)
                if auto_km is None:
                    # Try DB
                    c_o = _lookup_port_from_db(conn, origin)
                    c_d = _lookup_port_from_db(conn, dest)
                    if c_o and c_d:
                        auto_km = _haversine_km(*c_o, *c_d)

                if auto_km:
                    dist_km = float(dc2.number_input(
                        "Distance (km) — auto",
                        value=round(auto_km, 0),
                        min_value=0.0, format="%.0f",
                        key=f"{key_prefix}_dist_{i}",
                    ))
                    dc3.caption(f"Great circle: {auto_km:.0f} km")
                else:
                    dc2.warning(f"No coords for '{origin}' or '{dest}'. Enter manually.")
                    dist_km = float(dc2.number_input("Distance (km)", min_value=0.0,
                                                      value=0.0, format="%.0f",
                                                      key=f"{key_prefix}_dist_{i}"))
            else:
                dist_km = float(dc2.number_input("Distance (km)", min_value=0.0,
                                                  value=0.0, format="%.0f",
                                                  key=f"{key_prefix}_dist_{i}"))

            # Load factor for road legs
            fuel_key = _MODE_FUEL[mode_label]
            load_factor = 0.70
            vehicle_make = ""
            vehicle_model = ""
            if "truck" in fuel_key.lower() or "van" in fuel_key.lower():
                veh_c1, veh_c2, veh_c3 = st.columns(3)
                vehicle_make  = veh_c1.text_input("Vehicle make (optional)",
                                                   placeholder="e.g. Tata",
                                                   key=f"{key_prefix}_vmake_{i}")
                vehicle_model = veh_c2.text_input("Model (optional)",
                                                   placeholder="e.g. Prima 4428.S",
                                                   key=f"{key_prefix}_vmodel_{i}")
                load_factor   = veh_c3.slider("Load factor", 0.1, 1.0, 0.60, 0.05,
                                              help="Fraction of max payload. India avg 0.60.",
                                              key=f"{key_prefix}_lf_{i}")

            # Calculate this leg
            if dist_km > 0:
                tkm = cargo_t * dist_km
                modal_ef = _MODE_EF[mode_label]

                # Try vehicle lookup for truck legs
                ef_used = modal_ef
                ef_source = "modal average"
                if vehicle_make and vehicle_model:
                    try:
                        row = conn.execute(
                            """SELECT ef_kgco2e_per_tkm_full_load,
                                      fuel_l_per_100km_laden, fuel_l_per_100km_empty,
                                      payload_t
                               FROM vehicle_specs
                               WHERE LOWER(make) = LOWER(?) AND LOWER(model) = LOWER(?)
                               LIMIT 1""",
                            (vehicle_make, vehicle_model),
                        ).fetchone()
                        if row:
                            r = dict(row)
                            ef_laden = r["ef_kgco2e_per_tkm_full_load"] or modal_ef
                            # Adjust for load factor (GLEC)
                            comb_ef = 2.010   # diesel kgCO2e/L
                            p_t = r["payload_t"] or cargo_t
                            ef_empty_v = ((r["fuel_l_per_100km_empty"] or 0) / 100 / p_t) * comb_ef
                            ef_used = ef_laden * load_factor + ef_empty_v * (1 - load_factor)
                            ef_source = f"{vehicle_make} {vehicle_model} (LF {load_factor:.0%})"
                    except Exception:
                        pass

                leg_co2e = tkm * ef_used / 1000   # tCO2e
                total_co2e += leg_co2e

                leg_results.append({
                    "leg": leg_num,
                    "origin": origin, "dest": dest, "mode": mode_label,
                    "dist_km": dist_km, "tkm": round(tkm, 2),
                    "ef_kgco2e_tkm": round(ef_used, 5), "ef_source": ef_source,
                    "t_co2e": round(leg_co2e, 4),
                    "fuel_key": fuel_key,
                    "vehicle_make": vehicle_make, "vehicle_model": vehicle_model,
                    "load_factor": load_factor,
                })

                st.success(
                    f"Leg {leg_num}: **{origin or '?'} → {dest or '?'}** "
                    f"({mode_label}) | {tkm:,.0f} tonne-km | "
                    f"EF {ef_used:.4f} kgCO₂e/tkm | "
                    f"**{leg_co2e:.4f} tCO₂e** [{ef_source}]"
                )
            else:
                all_valid = False

    # ── Summary ──────────────────────────────────────────────────────────────
    if leg_results:
        st.markdown("---")
        st.markdown("#### Journey summary")

        import pandas as pd
        df = pd.DataFrame(leg_results)[
            ["leg", "origin", "dest", "mode", "dist_km", "tkm", "ef_kgco2e_tkm", "t_co2e"]
        ].rename(columns={
            "leg": "Leg", "origin": "From", "dest": "To", "mode": "Mode",
            "dist_km": "km", "tkm": "tonne-km",
            "ef_kgco2e_tkm": "EF (kgCO₂e/tkm)", "t_co2e": "tCO₂e"
        })
        st.dataframe(df, use_container_width=True, hide_index=True)
        st.metric(
            f"Total shipment CO₂e ({shipment_desc or 'all legs'})",
            f"{total_co2e:.4f} tCO₂e"
        )
        st.caption(f"Shipment ID: `{shipment_id}` | Cargo: {cargo_t:.2f} t")

        # Build ActivityRecords
        for leg in leg_results:
            extra = {
                "shipment_id":   shipment_id,
                "shipment_desc": shipment_desc or "",
                "leg_number":    leg["leg"],
                "origin":        leg["origin"],
                "destination":   leg["dest"],
                "load_factor":   leg["load_factor"],
            }
            if leg["vehicle_make"]:
                extra["vehicle_make"]  = leg["vehicle_make"]
                extra["vehicle_model"] = leg["vehicle_model"]

            records.append(ActivityRecord(
                record_id=str(uuid.uuid4()),
                org_id=org_id,
                scope="Scope 3",
                process=process,
                country=country,
                quantity=float(leg["tkm"]),
                unit="tonne-km",
                fuel_or_item=leg["fuel_key"],
                reporting_year=inv_year,
                gwp_ar=gwp_ar,
                extra=extra,
                source_file=f"Journey builder: {shipment_desc or shipment_id}",
            ))

    return records
