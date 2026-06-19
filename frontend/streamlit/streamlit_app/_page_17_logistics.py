"""
Page 17 — Logistics & Geography Map. Sprint 27 rewrite.

Key improvements:
  - ALL registered suppliers shown on map (blue = no lane, coloured = active lane)
  - Global filters: material, supplier, mode, min tCO2e threshold
  - Lane lines drawn supplier->plant (thickness = tCO2e)
  - Multi-modal recommendations with full leg breakdown
  - Current mode may itself be multi-modal (e.g. Sea + Road)
  - Quick-add lane directly from supplier register
"""
from __future__ import annotations
import json
from pathlib import Path

import streamlit as st

LOGISTICS_FILE = Path(__file__).parents[1] / "data" / "logistics.json"
SUPPLIER_FILE  = Path(__file__).parents[1] / "data" / "suppliers.json"

# Indian city lat/lon and road distance matrix
INDIA_CITIES = {
    "Mumbai": (19.076, 72.878), "Delhi": (28.614, 77.209),
    "Bengaluru": (12.972, 77.595), "Chennai": (13.083, 80.271),
    "Kolkata": (22.573, 88.364), "Hyderabad": (17.385, 78.487),
    "Pune": (18.520, 73.857), "Ahmedabad": (23.023, 72.571),
    "Surat": (21.170, 72.831), "Jaipur": (26.912, 75.787),
    "Lucknow": (26.847, 80.946), "Nagpur": (21.146, 79.088),
    "Indore": (22.720, 75.858), "Bhopal": (23.260, 77.413),
    "Vadodara": (22.307, 73.181), "Visakhapatnam": (17.687, 83.219),
    "Patna": (25.594, 85.138), "Chandigarh": (30.733, 76.779),
    "Kochi": (9.931, 76.267), "Coimbatore": (11.017, 76.956),
    "Bhilai": (21.210, 81.430), "Guwahati": (26.145, 91.736),
    "Shenzhen": (22.543, 114.058), "Custom / Overseas": (0.0, 0.0),
}

CITY_ROAD_KM = {
    ("Mumbai","Delhi"): 1400, ("Mumbai","Bengaluru"): 980,
    ("Mumbai","Chennai"): 1330, ("Mumbai","Kolkata"): 2050,
    ("Mumbai","Hyderabad"): 710, ("Mumbai","Pune"): 150,
    ("Mumbai","Ahmedabad"): 530, ("Mumbai","Surat"): 280,
    ("Mumbai","Nagpur"): 870,
    ("Delhi","Bengaluru"): 2150, ("Delhi","Chennai"): 2180,
    ("Delhi","Kolkata"): 1530, ("Delhi","Hyderabad"): 1570,
    ("Delhi","Jaipur"): 280, ("Delhi","Lucknow"): 550,
    ("Delhi","Chandigarh"): 250, ("Delhi","Ahmedabad"): 950,
    ("Delhi","Indore"): 980, ("Delhi","Bhopal"): 1180,
    ("Bengaluru","Chennai"): 350, ("Bengaluru","Hyderabad"): 570,
    ("Bengaluru","Kochi"): 560, ("Bengaluru","Coimbatore"): 360,
    ("Chennai","Hyderabad"): 630, ("Chennai","Kolkata"): 1650,
    ("Chennai","Visakhapatnam"): 790,
    ("Kolkata","Hyderabad"): 1530, ("Kolkata","Guwahati"): 990,
    ("Kolkata","Patna"): 590,
    ("Hyderabad","Nagpur"): 500, ("Pune","Nagpur"): 720,
    ("Pune","Bengaluru"): 840, ("Ahmedabad","Jaipur"): 670,
    ("Ahmedabad","Indore"): 580, ("Nagpur","Bhilai"): 260,
    ("Nagpur","Bhopal"): 360, ("Bhilai","Kolkata"): 900,
    ("Visakhapatnam","Hyderabad"): 620,
}

def get_road_km(city_a, city_b):
    if city_a == city_b: return 0.0
    k = (city_a, city_b); rk = (city_b, city_a)
    if k in CITY_ROAD_KM: return float(CITY_ROAD_KM[k])
    if rk in CITY_ROAD_KM: return float(CITY_ROAD_KM[rk])
    import math
    la1, lo1 = INDIA_CITIES.get(city_a, (20, 78))
    la2, lo2 = INDIA_CITIES.get(city_b, (20, 78))
    d = 2*6371*math.asin(math.sqrt(
        math.sin(math.radians((la2-la1)/2))**2 +
        math.cos(math.radians(la1))*math.cos(math.radians(la2))*
        math.sin(math.radians((lo2-lo1)/2))**2
    ))
    return round(d * 1.3, 0)

# Major port coordinates for sea route waypointing
_SEA_PORTS = {
    "Mumbai":       (18.93, 72.84),   # JNPT / Nhava Sheva
    "Chennai":      (13.10, 80.30),   # Chennai Port
    "Kolkata":      (22.57, 88.31),   # Kolkata Port
    "Kochi":        ( 9.96, 76.28),   # Kochi Port
    "Visakhapatnam":(17.69, 83.28),   # Vizag Port
    "Shenzhen":     (22.35, 113.86),  # Yantian / Chiwan
    "Shanghai":     (31.22, 121.65),  # Shanghai Port
    "Singapore":    ( 1.26, 103.82),  # Port of Singapore
    "Dubai":        (25.12,  55.18),  # Jebel Ali
    "Rotterdam":    (51.93,   4.14),  # Port of Rotterdam
    "Hamburg":      (53.53,   9.99),  # Port of Hamburg
    "Los Angeles":  (33.74,-118.27),  # Port of LA
}

def _nearest_port(lat, lon, side="india"):
    """Return nearest port lat/lon for routing sea legs."""
    if side == "india":
        # Choose nearest Indian port
        ports = {k: v for k, v in _SEA_PORTS.items()
                 if k in ("Mumbai","Chennai","Kolkata","Kochi","Visakhapatnam")}
    else:
        ports = _SEA_PORTS
    import math
    best, best_dist = "Mumbai", 999
    for name, (plat, plon) in ports.items():
        d = math.sqrt((lat-plat)**2 + (lon-plon)**2)
        if d < best_dist:
            best, best_dist = name, d
    return _SEA_PORTS[best]

def _get_leg_waypoints(lane, leg_i, n_legs, leg_mode):
    """Return (lat0,lon0,lat1,lon1) for this leg with geo-realistic waypoints.
    
    For multi-modal lanes with a Sea leg, road legs at the boundaries connect
    the supplier/plant to the relevant port. Lanes can also explicitly declare
    `origin_port_lat/lon` and `dest_port_lat/lon` to override port lookup.
    """
    s_lat, s_lon = lane["supplier_lat"], lane["supplier_lon"]
    p_lat, p_lon = lane["plant_lat"],    lane["plant_lon"]
    legs = lane.get("legs", [])
    
    # Detect if this lane is multi-modal with a sea leg
    has_sea = any("Sea" in (l.get("mode","")) or "sea" in (l.get("mode",""))
                  for l in legs)
    
    # Resolve origin / destination ports (explicit lane fields take priority)
    if has_sea:
        if lane.get("origin_port_lat") is not None:
            orig_port = (lane["origin_port_lat"], lane["origin_port_lon"])
        else:
            orig_port = _nearest_port(s_lat, s_lon, side="origin")
        if lane.get("dest_port_lat") is not None:
            dest_port = (lane["dest_port_lat"], lane["dest_port_lon"])
        else:
            dest_port = _nearest_port(p_lat, p_lon, side="india")
    else:
        orig_port = (s_lat, s_lon)
        dest_port = (p_lat, p_lon)
    
    # Find first and last sea-leg index (if any)
    sea_idx = [i for i, l in enumerate(legs)
               if "Sea" in (l.get("mode","")) or "sea" in (l.get("mode",""))]
    first_sea = sea_idx[0]  if sea_idx else -1
    last_sea  = sea_idx[-1] if sea_idx else -1
    
    is_sea_leg = ("Sea" in leg_mode or "sea" in leg_mode)
    
    if is_sea_leg:
        # Sea leg: port to port
        return orig_port[0], orig_port[1], dest_port[0], dest_port[1]
    
    if has_sea:
        # Road / rail leg in a multi-modal lane:
        # legs BEFORE first sea leg → supplier → origin_port (split equally if multiple)
        # legs AFTER last sea leg → dest_port → plant (split equally)
        if leg_i < first_sea:
            # Pre-sea segment(s): from supplier toward origin port
            n_pre = first_sea  # number of pre-sea legs
            f0 = leg_i / max(n_pre, 1)
            f1 = (leg_i + 1) / max(n_pre, 1)
            lat0 = s_lat + (orig_port[0] - s_lat) * f0
            lon0 = s_lon + (orig_port[1] - s_lon) * f0
            lat1 = s_lat + (orig_port[0] - s_lat) * f1
            lon1 = s_lon + (orig_port[1] - s_lon) * f1
            return lat0, lon0, lat1, lon1
        elif leg_i > last_sea:
            # Post-sea segment(s): from dest port toward plant
            n_post = n_legs - 1 - last_sea
            offset = leg_i - last_sea - 1
            f0 = offset / max(n_post, 1)
            f1 = (offset + 1) / max(n_post, 1)
            lat0 = dest_port[0] + (p_lat - dest_port[0]) * f0
            lon0 = dest_port[1] + (p_lon - dest_port[1]) * f0
            lat1 = dest_port[0] + (p_lat - dest_port[0]) * f1
            lon1 = dest_port[1] + (p_lon - dest_port[1]) * f1
            return lat0, lon0, lat1, lon1
    
    # Pure-land lane (no sea leg) — interpolate along supplier→plant
    frac_start = leg_i / n_legs
    frac_end   = (leg_i + 1) / n_legs
    if leg_i == 0:
        lat0, lon0 = s_lat, s_lon
        lat1 = s_lat + (p_lat - s_lat) * frac_end
        lon1 = s_lon + (p_lon - s_lon) * frac_end
    elif leg_i == n_legs - 1:
        lat0 = s_lat + (p_lat - s_lat) * frac_start
        lon0 = s_lon + (p_lon - s_lon) * frac_start
        lat1, lon1 = p_lat, p_lon
    else:
        lat0 = s_lat + (p_lat - s_lat) * frac_start
        lon0 = s_lon + (p_lon - s_lon) * frac_start
        lat1 = s_lat + (p_lat - s_lat) * frac_end
        lon1 = s_lon + (p_lon - s_lon) * frac_end
    return lat0, lon0, lat1, lon1



# Mode EFs kgCO2e per tonne-km — DEFRA 2024 / GHG Protocol
MODE_EF = {
    "Road (HGV diesel)":      0.0962,
    "Road (HGV CNG)":         0.0712,
    "Road (LCV diesel)":      0.2400,
    "Rail (diesel)":          0.0289,
    "Rail (electric)":        0.0054,
    "Sea (container)":        0.0116,
    "Sea (bulk)":             0.0078,
    "Sea + Road (multi-modal)":0.0150,
    "Air (freight)":          0.6026,
    "Inland waterway":        0.0311,
    "Digital (cloud delivery)":0.00001,  # nominal; SaaS lanes are spend-based, not tonne-km
}

# Rough country centroids for suppliers without lat/lon
# Mode → colour for map + filter (consistent across all charts)
MODE_COLORS = {
    "Road (HGV diesel)":          "#dc2626",   # red
    "Road (HGV CNG)":             "#f97316",   # orange
    "Road (LCV diesel)":          "#ea580c",   # dark orange
    "Rail (diesel)":              "#3b82f6",   # blue
    "Rail (electric)":            "#0ea5e9",   # sky blue
    "Sea (container)":            "#0891b2",   # teal
    "Sea (bulk)":                 "#06b6d4",   # cyan
    "Sea + Road (multi-modal)":   "#0e7490",   # dark teal
    "Air (freight)":              "#9333ea",   # purple
    "Inland waterway":            "#10b981",   # green
    "Digital (cloud delivery)":   "#94a3b8",   # slate (digital/SaaS)
}

# Plant registry (separate from lanes)
PLANT_REGISTRY = {
    "Pune Plant":    {"lat": 18.52, "lon": 73.86, "city": "Pune"},
    "Chennai Plant": {"lat": 13.08, "lon": 80.27, "city": "Chennai"},
    "Delhi DC":      {"lat": 28.61, "lon": 77.20, "city": "Delhi"},
}

def _load_plant_registry():
    registry = dict(PLANT_REGISTRY)
    try:
        import json as _pj
        from pathlib import Path as _PP
        _sf = _PP(__file__).parents[1] / "data" / "sites.json"
        if _sf.exists():
            for site in _pj.loads(_sf.read_text(encoding="utf-8")):
                if site.get("lat") and site.get("lon"):
                    registry[site["name"]] = {
                        "lat": float(site["lat"]),
                        "lon": float(site["lon"]),
                        "city": site.get("city", site["name"]),
                    }
    except Exception:
        pass
    return registry


_COUNTRY_CENTROIDS = {
    "IN": (20.6, 78.9),  "CN": (35.9, 104.2), "US": (37.1, -95.7),
    "DE": (51.2, 10.5),  "GB": (54.0, -2.1),   "JP": (36.2, 138.3),
    "VN": (16.1, 107.8), "BD": (23.7, 90.4),   "TR": (39.0, 35.2),
    "KR": (36.5, 127.9), "TW": (23.7, 121.0),  "TH": (15.9, 100.9),
}

_DEFAULT_LANES = [
    # ── Plant A: Pune Manufacturing ──────────────────────────────────────
    {"id":"L001","material":"Steel billets","supplier":"Alpha Metals Ltd",
     "supplier_city":"Bhilai","supplier_lat":21.21,"supplier_lon":81.43,
     "plant":"Pune Plant","plant_city":"Pune","plant_lat":18.52,"plant_lon":73.86,
     "mode":"Road (HGV diesel)","distance_km":1180,"volume_tonnes_yr":4800,
     "spend_cr":3.2,"lead_time_days":4,"frequency":"Weekly",
     "legs":[{"mode":"Road (HGV diesel)","distance_km":1180}]},
    {"id":"L002","material":"Industrial solvents","supplier":"Nova Chemicals",
     "supplier_city":"Surat","supplier_lat":21.17,"supplier_lon":72.83,
     "plant":"Pune Plant","plant_city":"Pune","plant_lat":18.52,"plant_lon":73.86,
     "mode":"Road (HGV CNG)","distance_km":310,"volume_tonnes_yr":620,
     "spend_cr":2.1,"lead_time_days":1,"frequency":"Bi-weekly",
     "legs":[{"mode":"Road (HGV CNG)","distance_km":310}]},
    {"id":"L003","material":"Bio-based packaging","supplier":"GreenEarth Inputs",
     "supplier_city":"Nagpur","supplier_lat":21.14,"supplier_lon":79.09,
     "plant":"Pune Plant","plant_city":"Pune","plant_lat":18.52,"plant_lon":73.86,
     "mode":"Rail (diesel)","distance_km":1130,"volume_tonnes_yr":290,
     "spend_cr":1.8,"lead_time_days":6,"frequency":"Monthly",
     "legs":[{"mode":"Rail (diesel)","distance_km":1070},
             {"mode":"Road (HGV diesel)","distance_km":60}]},
    {"id":"L004","material":"PCB assemblies","supplier":"Delta Components",
     "supplier_city":"Shenzhen","supplier_lat":22.54,"supplier_lon":114.06,
     "plant":"Pune Plant","plant_city":"Pune","plant_lat":18.52,"plant_lon":73.86,
     "mode":"Sea (container)","distance_km":7400,"volume_tonnes_yr":85,
     "spend_cr":2.8,"lead_time_days":22,"frequency":"Monthly",
     "legs":[{"mode":"Sea (container)","distance_km":7200},
             {"mode":"Road (HGV diesel)","distance_km":200}]},
    {"id":"L005","material":"Packaging films","supplier":"Zen Polymers",
     "supplier_city":"Mumbai","supplier_lat":19.08,"supplier_lon":72.88,
     "plant":"Pune Plant","plant_city":"Pune","plant_lat":18.52,"plant_lon":73.86,
     "mode":"Road (HGV diesel)","distance_km":150,"volume_tonnes_yr":380,
     "spend_cr":0.9,"lead_time_days":1,"frequency":"Weekly",
     "legs":[{"mode":"Road (HGV diesel)","distance_km":150}]},
    # ── Plant B: Chennai Assembly ─────────────────────────────────────────
    {"id":"L006","material":"Electronic components","supplier":"Delta Components",
     "supplier_city":"Shenzhen","supplier_lat":22.54,"supplier_lon":114.06,
     "plant":"Chennai Plant","plant_city":"Chennai","plant_lat":13.08,"plant_lon":80.27,
     "mode":"Sea (container)","distance_km":5200,"volume_tonnes_yr":120,
     "spend_cr":4.1,"lead_time_days":18,"frequency":"Monthly",
     "legs":[{"mode":"Sea (container)","distance_km":5000},
             {"mode":"Road (HGV diesel)","distance_km":200}]},
    {"id":"L007","material":"Specialty chemicals","supplier":"Nova Chemicals",
     "supplier_city":"Surat","supplier_lat":21.17,"supplier_lon":72.83,
     "plant":"Chennai Plant","plant_city":"Chennai","plant_lat":13.08,"plant_lon":80.27,
     "mode":"Rail (electric)","distance_km":1420,"volume_tonnes_yr":200,
     "spend_cr":1.4,"lead_time_days":8,"frequency":"Bi-weekly",
     "legs":[{"mode":"Rail (electric)","distance_km":1350},
             {"mode":"Road (HGV diesel)","distance_km":70}]},
    {"id":"L008","material":"Textile inputs","supplier":"Bangalore Fabrics",
     "supplier_city":"Bengaluru","supplier_lat":12.97,"supplier_lon":77.59,
     "plant":"Chennai Plant","plant_city":"Chennai","plant_lat":13.08,"plant_lon":80.27,
     "mode":"Road (HGV diesel)","distance_km":350,"volume_tonnes_yr":450,
     "spend_cr":1.1,"lead_time_days":2,"frequency":"Weekly",
     "legs":[{"mode":"Road (HGV diesel)","distance_km":350}]},
    # ── Plant C: Delhi Warehouse ──────────────────────────────────────────
    {"id":"L009","material":"Agricultural commodities","supplier":"GreenEarth Inputs",
     "supplier_city":"Nagpur","supplier_lat":21.14,"supplier_lon":79.09,
     "plant":"Delhi DC","plant_city":"Delhi","plant_lat":28.61,"plant_lon":77.20,
     "mode":"Rail (diesel)","distance_km":1090,"volume_tonnes_yr":800,
     "spend_cr":2.6,"lead_time_days":5,"frequency":"Weekly",
     "legs":[{"mode":"Rail (diesel)","distance_km":1020},
             {"mode":"Road (HGV diesel)","distance_km":70}]},
    {"id":"L010","material":"Urgent spare parts","supplier":"Alpha Metals Ltd",
     "supplier_city":"Bhilai","supplier_lat":21.21,"supplier_lon":81.43,
     "plant":"Delhi DC","plant_city":"Delhi","plant_lat":28.61,"plant_lon":77.20,
     "mode":"Air (freight)","distance_km":1200,"volume_tonnes_yr":8,
     "spend_cr":0.5,"lead_time_days":1,"frequency":"Quarterly",
     "legs":[{"mode":"Air (freight)","distance_km":1200}]},
]


def _load_lanes(org_id: str = "") -> list:
    """Load lanes filtered by org_uuid. Empty org_id returns all lanes (legacy)."""
    if LOGISTICS_FILE.exists():
        try:
            all_lanes = json.loads(LOGISTICS_FILE.read_text(encoding="utf-8"))
        except Exception:
            all_lanes = list(_DEFAULT_LANES)
    else:
        LOGISTICS_FILE.parent.mkdir(parents=True, exist_ok=True)
        LOGISTICS_FILE.write_text(json.dumps(_DEFAULT_LANES, indent=2), encoding="utf-8")
        all_lanes = list(_DEFAULT_LANES)
    if not org_id:
        return all_lanes
    # Filter by org_uuid; legacy lanes without org_uuid default to Acme
    return [l for l in all_lanes
            if l.get("org_uuid", "demo-acme-mfg-001") == org_id]


def _save_lanes(lanes: list, org_id: str = "") -> None:
    """Save lanes for org_id. Preserves lanes from OTHER orgs (org-isolated write)."""
    if not org_id:
        # Legacy: full overwrite
        LOGISTICS_FILE.write_text(json.dumps(lanes, indent=2), encoding="utf-8")
        return
    # Read existing, replace only this org's entries
    existing = []
    if LOGISTICS_FILE.exists():
        try:
            existing = json.loads(LOGISTICS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    # Keep lanes from OTHER orgs
    other_org_lanes = [l for l in existing
                       if l.get("org_uuid", "demo-acme-mfg-001") != org_id]
    # Tag new lanes with this org
    for l in lanes:
        if "org_uuid" not in l:
            l["org_uuid"] = org_id
    LOGISTICS_FILE.write_text(
        json.dumps(other_org_lanes + lanes, indent=2), encoding="utf-8"
    )


def _load_registered_suppliers(org_id: str = "") -> dict:
    """Load suppliers filtered by org_uuid."""
    if not SUPPLIER_FILE.exists():
        return {}
    try:
        all_sup = json.loads(SUPPLIER_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}
    if org_id:
        all_sup = [s for s in all_sup
                   if s.get("org_uuid", "demo-acme-mfg-001") == org_id]
    return {s["name"]: s for s in all_sup}


def _calc_emissions(lane: dict) -> float:
    ef = MODE_EF.get(lane.get("mode", "Road (HGV diesel)"), 0.0962)
    return round(lane.get("distance_km", 0) * lane.get("volume_tonnes_yr", 0) * ef / 1000, 2)


def _calc_multimodal(legs: list) -> float:
    total = 0.0
    for leg in legs:
        ef = MODE_EF.get(leg.get("mode", "Road (HGV diesel)"), 0.0962)
        total += leg.get("distance_km", 0) * leg.get("volume_tonnes_yr", 0) * ef / 1000
    return round(total, 2)


def _criticality(lane: dict) -> float:
    t = _calc_emissions(lane)
    s = lane.get("spend_cr", 0)
    return round(min((t / 50 * 50) + (s / 5 * 50), 100), 1)


def _multimodal_recommendations(lane: dict) -> list:
    """
    Full multi-leg alternatives for a lane.
    Current mode may itself be multi-modal (e.g. Sea + Road last mile).
    Returns list of alternatives sorted by tCO2e_yr, each with legs breakdown.
    """
    vol          = lane.get("volume_tonnes_yr", 1)
    dist         = lane.get("distance_km", 0)
    current_mode = lane.get("mode", "Road (HGV diesel)")
    s_lon        = lane.get("supplier_lon", 78)
    is_intl      = s_lon > 100 or dist > 4000

    alts = []

    if is_intl:
        sea_dist  = int(dist * 0.88)
        road_last = 200

        for sea_m in ["Sea (container)", "Sea (bulk)"]:
            for last_m in ["Road (HGV diesel)", "Road (HGV CNG)"]:
                legs = [
                    {"mode": sea_m,   "distance_km": sea_dist,  "volume_tonnes_yr": vol},
                    {"mode": last_m,  "distance_km": road_last, "volume_tonnes_yr": vol},
                ]
                alts.append({
                    "label":            sea_m + " + " + last_m + " last " + str(road_last) + " km",
                    "legs":             legs,
                    "tCO2e_yr":         _calc_multimodal(legs),
                    "lead_time_factor": 5.0,
                    "feasible":         True,
                    "note":             "Standard international. Road leg = port to plant.",
                })

        # Sea + rail inland + road siding
        rail_inland = max(100, int(dist * 0.04))
        road_siding = 60
        for sea_m in ["Sea (container)"]:
            for rail_m in ["Rail (diesel)", "Rail (electric)"]:
                legs = [
                    {"mode": sea_m,              "distance_km": sea_dist,    "volume_tonnes_yr": vol},
                    {"mode": rail_m,              "distance_km": rail_inland, "volume_tonnes_yr": vol},
                    {"mode": "Road (HGV diesel)", "distance_km": road_siding, "volume_tonnes_yr": vol},
                ]
                alts.append({
                    "label":            sea_m + " + " + rail_m + " + Road " + str(road_siding) + " km",
                    "legs":             legs,
                    "tCO2e_yr":         _calc_multimodal(legs),
                    "lead_time_factor": 5.5,
                    "feasible":         False,
                    "note":             "Needs rail siding at destination. Lower last-mile emissions.",
                })

        # Air + road (emergency only)
        legs_air = [
            {"mode": "Air (freight)",       "distance_km": int(dist * 0.7), "volume_tonnes_yr": vol},
            {"mode": "Road (HGV diesel)",   "distance_km": 80,              "volume_tonnes_yr": vol},
        ]
        alts.append({
            "label":            "Air (freight) + Road 80 km",
            "legs":             legs_air,
            "tCO2e_yr":         _calc_multimodal(legs_air),
            "lead_time_factor": 0.15,
            "feasible":         vol < 30,
            "note":             "Emergency / high-value only. ~6x higher than sea. Viable only <30 t/yr.",
        })

    else:
        # Pure road options
        for mode in ["Road (HGV diesel)", "Road (HGV CNG)"]:
            legs = [{"mode": mode, "distance_km": dist, "volume_tonnes_yr": vol}]
            alts.append({
                "label":            mode,
                "legs":             legs,
                "tCO2e_yr":         _calc_multimodal(legs),
                "lead_time_factor": 1.0,
                "feasible":         True,
                "note":             "Direct road. Flexible scheduling. No trans-shipment.",
            })

        if dist > 200:
            road_last = min(80, int(dist * 0.07))
            rail_dist = dist - road_last
            for rail_m in ["Rail (diesel)", "Rail (electric)"]:
                legs = [
                    {"mode": rail_m,              "distance_km": rail_dist, "volume_tonnes_yr": vol},
                    {"mode": "Road (HGV diesel)", "distance_km": road_last, "volume_tonnes_yr": vol},
                ]
                alts.append({
                    "label":            rail_m + " + Road " + str(road_last) + " km last mile",
                    "legs":             legs,
                    "tCO2e_yr":         _calc_multimodal(legs),
                    "lead_time_factor": 1.3,
                    "feasible":         True,
                    "note":             "Last-mile road needed unless plant has rail siding.",
                })
            # Rail direct (siding required)
            for rail_m in ["Rail (diesel)", "Rail (electric)"]:
                legs = [{"mode": rail_m, "distance_km": dist, "volume_tonnes_yr": vol}]
                alts.append({
                    "label":            rail_m + " direct (siding required)",
                    "legs":             legs,
                    "tCO2e_yr":         _calc_multimodal(legs),
                    "lead_time_factor": 1.4,
                    "feasible":         False,
                    "note":             "Needs loading siding at both ends.",
                })

        if dist > 500:
            ww_dist   = int(dist * 1.1)
            road_port = 60
            legs = [
                {"mode": "Inland waterway",   "distance_km": ww_dist,   "volume_tonnes_yr": vol},
                {"mode": "Road (HGV diesel)", "distance_km": road_port, "volume_tonnes_yr": vol},
            ]
            alts.append({
                "label":            "Inland waterway + Road " + str(road_port) + " km",
                "legs":             legs,
                "tCO2e_yr":         _calc_multimodal(legs),
                "lead_time_factor": 1.8,
                "feasible":         True,
                "note":             "Lowest-emission domestic option for bulk near rivers/canals.",
            })

    current_t = _calc_emissions(lane)
    for a in alts:
        a["saving_tco2e"] = round(current_t - a["tCO2e_yr"], 2)
        a["saving_pct"]   = round((current_t - a["tCO2e_yr"]) / current_t * 100, 1) if current_t else 0
        a["is_current"]   = (
            len(a["legs"]) == 1 and a["legs"][0]["mode"] == current_mode
        )

    return sorted(alts, key=lambda x: x["tCO2e_yr"])


def render() -> None:
    st.title("Logistics & Geography")
    st.caption(
        "Maps raw material flows from supplier locations to your plant. "
        "Shows ALL registered suppliers — blue dots have no lane yet."
    )

    # ── Theme colour tokens ───────────────────────────────────────────────
    _is_light  = st.session_state.get("_sk_theme", "light") == "light"
    _lbl_color = "#1f2937" if _is_light else "#e2e8f0"
    _map_land  = "#f0f4f8" if _is_light else "#1e293b"
    _map_ocean = "#dbeafe" if _is_light else "#0f172a"
    _dim_txt   = "#6b7280" if _is_light else "#94a3b8"

    # ── Resolve current org (Snowkap "View as" support) ───────────────────
    profile = st.session_state.get("org_profile", {})
    if not profile.get("setup_done"):
        st.warning("Complete ⚙️ Setup first.")
        return
    from streamlit_app._org_helper import resolve_org_id
    _current_org = resolve_org_id(profile)
    if not _current_org:
        st.warning("Please log in to view logistics.")
        return
    _org_label = profile.get("org_name", _current_org)
    st.caption(f"Showing logistics for: **{_org_label}**  (`{_current_org[:8]}…`)")

    lanes           = _load_lanes(_current_org)
    reg_sups        = _load_registered_suppliers(_current_org)
    lanes_sup_names = set(l["supplier"] for l in lanes)
    if not lanes and not reg_sups:
        st.info(
            f"No lanes or suppliers registered yet for **{_org_label}**. "
            "Add suppliers in 🏢 Supplier & ESG and lanes in the **Manage lanes** tab."
        )
        return

    # ── Global filters ────────────────────────────────────────────────────
    with st.expander("Filters", expanded=True):
        all_mats  = sorted(set(l["material"] for l in lanes))
        all_sups  = sorted(set(l["supplier"] for l in lanes))
        all_modes = sorted(set(l["mode"]     for l in lanes))

        fc1, fc2, fc3, fc4 = st.columns(4)
        f_mat  = fc1.multiselect("Material",    all_mats,  default=all_mats,  key="log_f_mat")
        f_sup  = fc2.multiselect("Supplier",    all_sups,  default=all_sups,  key="log_f_sup")
        f_mode = fc3.multiselect("Mode",        all_modes, default=all_modes, key="log_f_mode")
        f_min  = fc4.number_input("Min tCO2e/yr", min_value=0.0, value=0.0,
                                   step=1.0, key="log_f_min")

    filtered = [
        l for l in lanes
        if l["material"] in f_mat
        and l["supplier"] in f_sup
        and l["mode"]     in f_mode
        and _calc_emissions(l) >= f_min
    ]
    if not filtered:
        filtered = lanes
        st.warning("No lanes matched filters — showing all lanes.")

    # ── KPIs ─────────────────────────────────────────────────────────────
    total_t     = sum(_calc_emissions(l) for l in filtered)
    total_spend = sum(l.get("spend_cr", 0) for l in filtered)
    n_no_lane   = len([n for n in reg_sups if n not in lanes_sup_names])

    k1, k2, k3, k4, k5 = st.columns(5)
    k1.metric("Transport tCO2e/yr",  str(round(total_t, 1)))
    k2.metric("Spend proxy",          "Rs " + str(round(total_spend, 1)) + " Cr")
    k3.metric("Active lanes",         str(len(filtered)))
    k4.metric("Registered suppliers", str(len(reg_sups)))
    k5.metric("No lane yet",          str(n_no_lane))

    st.markdown("---")

    tab1, tab2, tab3, tab4 = st.tabs([
        "Lane map & suppliers",
        "Emission hotspots",
        "⚖️ Modal shift (multi-leg)",
        "Manage lanes",
    ])

    # ── Tab 1 ─────────────────────────────────────────────────────────────
    with tab1:
        st.markdown("#### Supply chain geography")

        # ── Mode colour filter ─────────────────────────────────────────────
        _all_leg_modes = sorted(set(
            lg["mode"]
            for l in filtered
            for lg in l.get("legs", [{"mode": l["mode"]}])
        ))
        f_modes_map = st.multiselect(
            "Filter by transport mode (coloured lines)",
            _all_leg_modes, default=_all_leg_modes, key="log_map_modes",
        )

        # ── Colour legend — transport mode colours ─────────────────────────
        st.markdown("**Colour legend — transport modes (line colour = mode):**")
        _lcols = st.columns(min(8, len(MODE_COLORS)))
        for _ci, (_mode, _color) in enumerate(MODE_COLORS.items()):
            _lcols[_ci % len(_lcols)].markdown(
                "<span style='background:" + _color + ";color:white;padding:2px 7px;"
                "border-radius:4px;font-size:10px'>"
                + _mode.split("(")[0].strip() + "</span>",
                unsafe_allow_html=True,
            )

        # ── Legend row 2: supplier bubble criticality ──────────────────────
        st.markdown("**Supplier bubble colour = criticality · Bubble size = tCO₂e/yr:**")
        _bleg_cols = st.columns(4)
        _bleg_cols[0].markdown(
            "<span style='background:#dc2626;color:white;padding:2px 8px;"
            "border-radius:4px;font-size:10px'>🔴 High &gt;70</span>",
            unsafe_allow_html=True,
        )
        _bleg_cols[1].markdown(
            "<span style='background:#d97706;color:white;padding:2px 8px;"
            "border-radius:4px;font-size:10px'>🟡 Medium 40–70</span>",
            unsafe_allow_html=True,
        )
        _bleg_cols[2].markdown(
            "<span style='background:#16a34a;color:white;padding:2px 8px;"
            "border-radius:4px;font-size:10px'>🟢 Low &lt;40</span>",
            unsafe_allow_html=True,
        )
        _bleg_cols[3].markdown(
            "<span style='background:#3b82f6;color:white;padding:2px 8px;"
            "border-radius:4px;font-size:10px'>🔵 No lane yet</span>",
            unsafe_allow_html=True,
        )
        st.caption(
            "Line thickness ∝ tCO₂e/yr per leg.  "
            "Bubble size ∝ total lane tCO₂e/yr (larger bubble = more emissions).  "
            "Multi-modal lanes drawn as separate coloured segments per leg.  "
            "★ = your plant(s). Hover any element for full details."
        )

        try:
            import plotly.graph_objects as go

            fig = go.Figure()
            max_t = max((_calc_emissions(l) for l in filtered), default=1.0) or 1.0

            # Draw each lane as separate leg segments with mode colours
            for lane in filtered:
                vol  = lane["volume_tonnes_yr"]
                legs = lane.get("legs", [{"mode": lane["mode"],
                                           "distance_km": lane["distance_km"]}])
                s_lat, s_lon = lane["supplier_lat"], lane["supplier_lon"]
                p_lat, p_lon = lane["plant_lat"],    lane["plant_lon"]
                n_legs = len(legs)

                for leg_i, leg in enumerate(legs):
                    if leg["mode"] not in f_modes_map:
                        continue
                    color = MODE_COLORS.get(leg["mode"], "#6b7280")
                    # Interpolate lat/lon for this leg segment
                    frac_start = leg_i / n_legs
                    frac_end   = (leg_i + 1) / n_legs
                    lat0, lon0, lat1, lon1 = _get_leg_waypoints(
                        lane, leg_i, n_legs, leg["mode"]
                    )
                    leg_t = leg["distance_km"] * vol * MODE_EF.get(leg["mode"], 0.0962) / 1000
                    width = max(1, int(leg_t / max(max_t, 1e-9) * 6)) if max_t > 0 else 2
                    fig.add_trace(go.Scattergeo(
                        lat=[lat0, lat1], lon=[lon0, lon1],
                        mode="lines",
                        line=dict(width=width, color=color),
                        opacity=0.75,
                        showlegend=False,
                        hovertemplate=(
                            "<b>" + lane["supplier"] + " \u2192 " + lane["plant"] + "</b><br>"
                            "Leg: " + leg["mode"] + "<br>"
                            + str(leg["distance_km"]) + " km<br>"
                            "~" + str(round(leg_t, 1)) + " tCO\u2082e/yr"
                            "<extra></extra>"
                        ),
                    ))

                # Supplier bubble (sized by total lane tCO2e, coloured by criticality)
                lane_t = _calc_emissions(lane)
                crit   = _criticality(lane)
                bcolor = "#dc2626" if crit > 70 else ("#d97706" if crit > 40 else "#16a34a")
                size   = max(10, int(lane_t / max(max_t, 1e-9) * 36))
                fig.add_trace(go.Scattergeo(
                    lat=[s_lat], lon=[s_lon],
                    mode="markers+text",
                    marker=dict(size=size, color=bcolor, opacity=0.85,
                                line=dict(width=1, color="white")),
                    text=[lane["supplier"]], textposition="top center",
                    textfont=dict(size=9, color=_lbl_color),
                    showlegend=False,
                    hovertemplate=(
                        "<b>" + lane["supplier"] + "</b><br>"
                        + lane["material"] + "<br>"
                        "To: " + lane["plant_city"] + "<br>"
                        "Total: " + str(lane_t) + " tCO\u2082e/yr<br>"
                        "Spend: \u20b9" + str(lane.get("spend_cr", 0)) + " Cr<br>"
                        "Lead: " + str(lane.get("lead_time_days", "?")) + " days<br>"
                        "Criticality: " + str(round(crit)) + "/100"
                        "<extra></extra>"
                    ),
                ))

            # Registered suppliers with no lane (blue dots)
            no_lane_list = [
                (n, d) for n, d in reg_sups.items()
                if n not in lanes_sup_names
            ]
            for name, sup_data in no_lane_list:
                country = sup_data.get("country", "IN")
                clat, clon = _COUNTRY_CENTROIDS.get(country, (20.0, 78.0))
                fig.add_trace(go.Scattergeo(
                    lat=[clat], lon=[clon], mode="markers",
                    marker=dict(size=12, color="#3b82f6", opacity=0.7,
                                line=dict(width=1, color="white")),
                    showlegend=False,
                    hovertemplate=(
                        "<b>" + name + "</b> (no lane yet)<br>"
                        "Material: " + str(sup_data.get("material", "—")) + "<br>"
                        "Country: " + country + "<br>"
                        "Spend: \u20b9" + str(sup_data.get("spend_cr", 0)) + " Cr"
                        "<extra></extra>"
                    ),
                ))

            # Plant markers — single trace with all unique plants in one legend entry
            _plants_shown: dict = {}
            for lane in filtered:
                # only show OWN plants (upstream destination, NOT buyer destinations)
                if lane.get("direction") == "downstream":
                    continue  # skip — buyer markers handled separately below
                pk = lane["plant"]
                if pk not in _plants_shown:
                    _plants_shown[pk] = (lane["plant_lat"], lane["plant_lon"], lane["plant_city"])
            if _plants_shown:
                fig.add_trace(go.Scattergeo(
                    lat=[v[0] for v in _plants_shown.values()],
                    lon=[v[1] for v in _plants_shown.values()],
                    mode="markers+text",
                    marker=dict(size=20, color="#1d4ed8", symbol="star",
                                line=dict(width=1, color="white")),
                    text=[v[2] for v in _plants_shown.values()],
                    textposition="top center",
                    textfont=dict(size=10, color=_lbl_color, family="Arial Black"),
                    name="Company plants",
                    legendgroup="company",
                    showlegend=True,
                    hovertemplate="<b>%{text}</b><br>Acme plant<extra></extra>",
                ))

            # Buyer markers (downstream) — single trace, distinct symbol & colour
            _buyers_shown: dict = {}
            for lane in filtered:
                if lane.get("direction") != "downstream":
                    continue
                bk = lane.get("buyer_name") or lane["plant"]
                if bk not in _buyers_shown:
                    _buyers_shown[bk] = (lane["plant_lat"], lane["plant_lon"],
                                         lane["plant_city"], bk)
            if _buyers_shown:
                fig.add_trace(go.Scattergeo(
                    lat=[v[0] for v in _buyers_shown.values()],
                    lon=[v[1] for v in _buyers_shown.values()],
                    mode="markers+text",
                    marker=dict(size=18, color="#16a34a", symbol="diamond",
                                line=dict(width=1, color="white")),
                    text=[v[3] for v in _buyers_shown.values()],
                    textposition="bottom center",
                    textfont=dict(size=9, color="#15803d", family="Arial"),
                    name="Buyers (downstream)",
                    legendgroup="buyers",
                    showlegend=True,
                    hovertemplate="<b>%{text}</b><br>Buyer (downstream)<extra></extra>",
                ))

            # Mode colour legend: one invisible trace per mode (so Plotly legend shows them)
            _modes_in_map = set()
            for lane in filtered:
                for _leg in lane.get("legs", [{"mode": lane["mode"]}]):
                    if _leg["mode"] in f_modes_map:
                        _modes_in_map.add(_leg["mode"])
            for _mode_name in sorted(_modes_in_map):
                _mc = MODE_COLORS.get(_mode_name, "#6b7280")
                fig.add_trace(go.Scattergeo(
                    lat=[None], lon=[None],
                    mode="lines",
                    line=dict(width=4, color=_mc),
                    name=_mode_name,
                    showlegend=True,
                ))

            fig.update_geos(
                showland=True, landcolor=_map_land,
                showocean=True, oceancolor=_map_ocean,
                showcoastlines=True, coastlinecolor="#94a3b8",
                showcountries=True, countrycolor="#cbd5e1",
                showrivers=True, rivercolor="#93c5fd",
                center=dict(lat=22, lon=85), projection_scale=2.2,
            )
            fig.update_layout(
                height=580, margin=dict(t=30, b=10),
                legend=dict(orientation="h", y=-0.06),
                title=dict(
                    text="Red=high criticality \u00b7 Amber=medium \u00b7 Green=low"
                         " \u00b7 Blue=no lane \u00b7 \u2605=plant",
                    font=dict(size=10, color=_dim_txt), x=0.5,
                ),
            )
            st.plotly_chart(fig, use_container_width=True, key="log_plotly_1")

            # Emission calculation verification table
            with st.expander("Verify emission calculations", expanded=False):
                st.caption(
                    "Formula: tCO\u2082e/yr = distance_km \u00d7 volume_t/yr "
                    "\u00d7 EF_kgCO\u2082e/t\u00b7km / 1000 (per leg)"
                )
                try:
                    import pandas as pd
                    vrows = []
                    for l in filtered:
                        legs = l.get("legs", [{"mode": l["mode"],
                                                "distance_km": l["distance_km"]}])
                        for leg in legs:
                            ef    = MODE_EF.get(leg["mode"], 0.0962)
                            leg_t = round(leg["distance_km"] * l["volume_tonnes_yr"] * ef / 1000, 3)
                            vrows.append({
                                "Lane ID":      l["id"],
                                "Supplier":     l["supplier"],
                                "Leg mode":     leg["mode"],
                                "EF kg/t\u00b7km": ef,
                                "Dist km":      leg["distance_km"],
                                "Vol t/yr":     l["volume_tonnes_yr"],
                                "Leg tCO\u2082e": leg_t,
                                "Calculation":  (
                                    str(leg["distance_km"]) + " \u00d7 "
                                    + str(l["volume_tonnes_yr"]) + " \u00d7 "
                                    + str(ef) + " / 1000"
                                ),
                            })
                    st.dataframe(pd.DataFrame(vrows), use_container_width=True, hide_index=True)
                except ImportError:
                    pass

            # No-lane suppliers callout
            if no_lane_list:
                st.markdown(
                    "**" + str(len(no_lane_list)) +
                    " registered suppliers with no lane (blue on map):**"
                )
                _card_c = st.columns(min(3, len(no_lane_list)))
                for _ci2, (name2, sup_data2) in enumerate(no_lane_list):
                    _card_c[_ci2 % 3].info(
                        "**" + name2 + "**\n\n"
                        + str(sup_data2.get("material", "—")) + " | "
                        + str(sup_data2.get("country", "—")) + "\n\n"
                        "\u20b9" + str(round(sup_data2.get("spend_cr", 0), 1)) + " Cr spend"
                    )

        except ImportError:
            st.info("Install plotly for the map.")

        # Lane table
        try:
            import pandas as pd
            rows = [{
                "Supplier":    l["supplier"], "Material": l["material"],
                "Route":       l["supplier_city"] + " \u2192 " + l["plant_city"],
                "Plant":       l["plant"],
                "Mode(s)":     " + ".join(sorted(set(
                    lg["mode"].split("(")[0].strip()
                    for lg in l.get("legs", [{"mode": l["mode"]}])
                ))),
                "Dist km":     l["distance_km"],
                "Vol t/yr":    l["volume_tonnes_yr"],
                "tCO\u2082e":  _calc_emissions(l),
                "Lead days":   l.get("lead_time_days", "—"),
                "Criticality": _criticality(l),
            } for l in filtered]
            st.dataframe(
                pd.DataFrame(rows).sort_values("tCO\u2082e", ascending=False),
                use_container_width=True, hide_index=True,
            )
        except ImportError:
            pass


    with tab2:
        st.markdown("#### Transport emission hotspots")
        try:
            import pandas as pd
            import plotly.graph_objects as go

            # Short lane code for axis labels (e.g. "L001"); full detail goes in hover
            df_hot = pd.DataFrame([{
                "ID":       l.get("id", "?"),
                "Lane":     l["supplier"][:18] + " → " + l["plant_city"][:14],
                "Material": l["material"],
                "From":     l["supplier_city"] + " (" + l.get("country", l.get("supplier_country","?")) + ")",
                "To":       l["plant_city"],
                "Supplier": l["supplier"],
                "tCO2e/yr": _calc_emissions(l),
                "Spend":    l.get("spend_cr", 0),
                "Mode":     l["mode"],
                "Crit":     _criticality(l),
                "Volume":   l.get("volume_tonnes_yr", 0),
                "Distance": l.get("distance_km", 0),
            } for l in filtered]).sort_values("tCO2e/yr", ascending=False)

            df_hot["Cum %"] = (
                df_hot["tCO2e/yr"].cumsum() / df_hot["tCO2e/yr"].sum() * 100
            ).round(1)

            # ── Top metrics ───────────────────────────────────────────────────
            mhc = st.columns(4)
            mhc[0].metric("Total transport emissions", f"{df_hot['tCO2e/yr'].sum():,.1f} tCO\u2082e/yr")
            top_lane = df_hot.iloc[0] if len(df_hot) else None
            if top_lane is not None:
                _tot = float(df_hot["tCO2e/yr"].sum())
                _pct = (top_lane["tCO2e/yr"] / _tot * 100) if _tot > 0 else 0
                mhc[1].metric("Top lane (% of total)", f"{_pct:.0f}%",
                              delta=top_lane["Lane"], delta_color="off")
            n_top80 = (df_hot["Cum %"] <= 80).sum() + 1
            mhc[2].metric("Lanes covering 80%", f"{min(n_top80, len(df_hot))} of {len(df_hot)}",
                          help="Pareto: focus reduction on the fewest lanes that contain 80% of emissions.")
            mhc[3].metric("Avg distance (weighted)",
                          f"{(df_hot['Distance']*df_hot['Volume']).sum() / max(df_hot['Volume'].sum(),1):,.0f} km")

            st.markdown("---")

            # ── Chart 1: Bar by lane ID, hover shows full details ────────────
            c1, c2 = st.columns(2)
            with c1:
                # Compact x-axis: lane ID only. Full route + details in hover tooltip.
                fig1 = go.Figure()
                _mode_color_map = {
                    "Road (HGV diesel)":   "#dc2626", "Road (HGV CNG)": "#f97316",
                    "Rail (diesel)":       "#3b82f6", "Rail (electric)": "#0ea5e9",
                    "Sea (container)":     "#0891b2", "Sea (bulk)":      "#06b6d4",
                    "Air (freight)":       "#9333ea", "Inland waterway": "#10b981",
                    "Digital (cloud delivery)": "#94a3b8",
                }
                # Single-trace bar coloured by mode (one bar per lane, no grouping = no
                # axis label collisions). Legend lists modes via separate marker traces.
                _bar_colors = [_mode_color_map.get(m, "#64748b") for m in df_hot["Mode"]]
                fig1.add_trace(go.Bar(
                    x=df_hot["ID"],
                    y=df_hot["tCO2e/yr"],
                    marker_color=_bar_colors,
                    marker_line_color="white",
                    marker_line_width=0.5,
                    text=[f"{v:,.0f}" for v in df_hot["tCO2e/yr"]],
                    textposition="outside",
                    textfont=dict(size=10),
                    showlegend=False,
                    customdata=list(zip(df_hot["Supplier"], df_hot["Material"],
                                        df_hot["From"], df_hot["To"], df_hot["Mode"],
                                        df_hot["Distance"], df_hot["Volume"],
                                        df_hot["Spend"], df_hot["Crit"])),
                    hovertemplate=(
                        "<b>%{x}</b><br>"
                        "<b>%{customdata[0]}</b><br>"
                        "%{customdata[1]}<br>"
                        "%{customdata[2]} → %{customdata[3]}<br>"
                        "Mode: %{customdata[4]}<br>"
                        "%{customdata[5]:,.0f} km · %{customdata[6]:,.0f} t/yr<br>"
                        "Spend: ₹%{customdata[7]:.1f} Cr · Crit: %{customdata[8]:.0f}<br>"
                        "Emissions: <b>%{y:,.1f} tCO\u2082e/yr</b><extra></extra>"
                    ),
                ))
                # Faux-legend traces (one per mode actually present) so user sees colour key
                for mode in df_hot["Mode"].unique():
                    fig1.add_trace(go.Bar(
                        x=[None], y=[None],
                        name=mode,
                        marker_color=_mode_color_map.get(mode, "#64748b"),
                        showlegend=True,
                        hoverinfo="skip",
                    ))
                fig1.update_layout(
                    title=dict(text="Emissions by lane (hover any bar for full details)",
                               font=dict(size=13)),
                    xaxis=dict(
                        title="Lane ID",
                        tickfont=dict(size=10),
                        tickangle=0,
                        type="category",       # discrete categorical (no continuous line)
                        showgrid=False,
                        showline=True,
                        linecolor="#cbd5e1",
                        ticks="outside",
                        ticklen=4,
                    ),
                    yaxis=dict(
                        title="tCO\u2082e/yr",
                        tickfont=dict(size=10),
                        showgrid=True,
                        gridcolor="#e2e8f0",
                    ),
                    height=380, margin=dict(t=50, b=60, l=50, r=10),
                    legend=dict(orientation="h", y=-0.22, font=dict(size=10)),
                    plot_bgcolor="rgba(0,0,0,0)",
                    hoverlabel=dict(bgcolor="white", bordercolor="#94a3b8",
                                    font=dict(size=12)),
                )
                st.plotly_chart(fig1, use_container_width=True, key="log_plotly_2")

            with c2:
                # Spend vs emissions scatter
                fig2 = go.Figure()
                for mode in df_hot["Mode"].unique():
                    sub = df_hot[df_hot["Mode"] == mode]
                    fig2.add_trace(go.Scatter(
                        x=sub["Spend"], y=sub["tCO2e/yr"],
                        mode="markers+text",
                        marker=dict(
                            size=sub["Crit"].clip(lower=8, upper=40),
                            color=_mode_color_map.get(mode, "#64748b"),
                            line=dict(width=1, color="white"),
                        ),
                        text=sub["ID"], textposition="top center",
                        textfont=dict(size=9),
                        name=mode,
                        customdata=list(zip(sub["Supplier"], sub["Material"], sub["Crit"])),
                        hovertemplate=(
                            "<b>%{customdata[0]}</b><br>"
                            "%{customdata[1]}<br>"
                            "Spend: ₹%{x:.1f} Cr · Emissions: %{y:,.1f} tCO\u2082e/yr<br>"
                            "Criticality: %{customdata[2]:.0f}"
                            "<extra>" + mode + "</extra>"
                        ),
                    ))
                fig2.update_layout(
                    title=dict(text="Spend vs emissions (bubble = criticality)", font=dict(size=14)),
                    xaxis_title="Spend (₹ Cr)",
                    yaxis_title="tCO\u2082e/yr",
                    height=380, margin=dict(t=50, b=20, l=10, r=10),
                    legend=dict(orientation="h", y=-0.18),
                    plot_bgcolor="rgba(0,0,0,0)",
                )
                st.plotly_chart(fig2, use_container_width=True, key="log_plotly_3")

            st.markdown("---")
            st.markdown("**Lane detail table** — full metadata for download / audit")
            st.dataframe(
                df_hot[["ID", "Supplier", "Material", "From", "To", "Mode",
                        "Distance", "Volume", "Spend", "tCO2e/yr", "Cum %", "Crit"]],
                use_container_width=True, hide_index=True,
                column_config={
                    "Distance": st.column_config.NumberColumn("Distance (km)", format="%.0f"),
                    "Volume":   st.column_config.NumberColumn("Volume (t/yr)", format="%.0f"),
                    "Spend":    st.column_config.NumberColumn("Spend (₹ Cr)",  format="%.1f"),
                    "tCO2e/yr": st.column_config.NumberColumn("tCO\u2082e/yr", format="%.1f"),
                    "Cum %":    st.column_config.NumberColumn("Cum %",         format="%.1f"),
                    "Crit":     st.column_config.NumberColumn("Criticality",   format="%.0f"),
                },
            )

        except ImportError:
            st.info("Install plotly and pandas.")

    # ── Tab 3: Multi-modal shift ──────────────────────────────────────────
    with tab3:
        st.markdown("#### Modal shift analysis (multi-leg routes)")

        # ── Quick city-to-city route calculator ─────────────────────────
        st.markdown("**🗺️ Route distance calculator — Point A to Point B**")
        st.caption("Auto-calculates road km from our Indian city database. Enter volume and mode for instant emission estimate.")
        _city_list = sorted(INDIA_CITIES.keys())
        rc1, rc2, rc3 = st.columns(3)
        _from_city = rc1.selectbox("From (origin)", _city_list, key="route_from",
                                   index=_city_list.index("Mumbai") if "Mumbai" in _city_list else 0)
        _to_city   = rc2.selectbox("To (destination)", _city_list, key="route_to",
                                   index=_city_list.index("Delhi") if "Delhi" in _city_list else 1)
        _route_vol = rc3.number_input("Volume (tonnes/yr)", min_value=0.0, value=100.0, key="route_vol")

        _route_km = get_road_km(_from_city, _to_city)
        if _from_city != _to_city and _route_km > 0:
            st.success(
                f"**{_from_city} → {_to_city}: ~{_route_km:,.0f} km (road)**  "
                f"({round(_route_km*1.15):,.0f} km via rail, estimated)"
            )
            # Show emissions by mode
            _route_modes = {
                "Road (HGV diesel)":  _route_km * _route_vol * 0.0962 / 1000,
                "Road (HGV CNG)":     _route_km * _route_vol * 0.0712 / 1000,
                "Rail (diesel)":      _route_km * 1.15 * _route_vol * 0.0289 / 1000,
                "Rail (electric)":    _route_km * 1.15 * _route_vol * 0.0054 / 1000,
            }
            try:
                import pandas as pd
                _df_route = pd.DataFrame([
                    {"Mode": k, "Distance km": int(_route_km if "Road" in k else _route_km*1.15),
                     "tCO2e/yr": round(v, 2),
                     "Saving vs road diesel": f"{((list(_route_modes.values())[0]-v)/list(_route_modes.values())[0]*100):.0f}%"}
                    for k, v in _route_modes.items()
                ])
                st.dataframe(_df_route, use_container_width=True, hide_index=True)
            except ImportError:
                for m, v in _route_modes.items():
                    st.write(f"{m}: {v:.2f} tCO2e/yr")

            if st.button("Add as new lane", key="add_route_lane"):
                import uuid as _uuid_r
                _new_lane = {
                    "id": "L" + _uuid_r.uuid4().hex[:3].upper(),
                    "material": "Custom",
                    "supplier": _from_city + " (supplier)",
                    "supplier_city": _from_city,
                    "supplier_lat": INDIA_CITIES.get(_from_city, (20,78))[0],
                    "supplier_lon": INDIA_CITIES.get(_from_city, (20,78))[1],
                    "plant": _to_city + " (plant)",
                    "plant_city": _to_city,
                    "plant_lat": INDIA_CITIES.get(_to_city, (28,77))[0],
                    "plant_lon": INDIA_CITIES.get(_to_city, (28,77))[1],
                    "mode": "Road (HGV diesel)",
                    "distance_km": int(_route_km),
                    "volume_tonnes_yr": float(_route_vol),
                    "spend_cr": 0.0, "lead_time_days": max(1, int(_route_km/500)),
                    "frequency": "Weekly",
                    "legs": [{"mode": "Road (HGV diesel)", "distance_km": int(_route_km)}],
                }
                lanes.append(_new_lane)
                _save_lanes(lanes, _current_org)
                st.toast(f"Lane added: {_from_city} → {_to_city}", icon="✅")
                st.rerun()
        elif _from_city == _to_city:
            st.info("Select different origin and destination cities.")

        st.markdown("---")
        st.caption(
            "Existing lanes with modal shift alternatives — "
            "alternatives show full leg breakdown and infrastructure requirements."
        )

        if not filtered:
            st.info("No lanes available.")
        else:
            lane_opts = [
                l["id"] + " — " + l["material"] +
                " (" + l["supplier_city"] + " to " + l["plant_city"] + ")"
                for l in filtered
            ]
            sel = st.selectbox("Select lane", lane_opts, key="modal_sel")
            lane_id = sel.split(" — ")[0]
            lane    = next((l for l in filtered if l["id"] == lane_id), filtered[0])

            current_t    = _calc_emissions(lane)
            current_mode = lane["mode"]
            is_intl      = lane.get("supplier_lon", 78) > 100 or lane.get("distance_km", 0) > 4000

            st.markdown(
                "**Current:** " + current_mode +
                " | " + str(lane["distance_km"]) + " km" +
                " | " + str(lane["volume_tonnes_yr"]) + " t/yr" +
                " | " + str(current_t) + " tCO2e/yr" +
                " | Lead: " + str(lane.get("lead_time_days", "?")) + " days"
            )
            if is_intl:
                st.info("International route detected. Sea-based alternatives shown. "
                        "Air presented for reference only (emergency/high-value).")

            alts = _multimodal_recommendations(lane)

            try:
                import pandas as pd
                rows = []
                for a in alts:
                    legs_str = " + ".join(
                        lg["mode"].split("(")[0].strip() +
                        " " + str(int(lg["distance_km"])) + " km"
                        for lg in a["legs"]
                    )
                    lead_est = "—"
                    if lane.get("lead_time_days"):
                        lead_est = str(round(lane["lead_time_days"] * a["lead_time_factor"])) + " days"
                    rows.append({
                        "Alternative":     a["label"],
                        "Legs":            legs_str,
                        "tCO2e/yr":        round(a["tCO2e_yr"], 1),
                        "Saving tCO2e/yr": round(a["saving_tco2e"], 1),
                        "Saving %":        str(a["saving_pct"]) + "%",
                        "Lead time":       lead_est,
                        "Feasible":        "Yes" if a.get("feasible", True) else "Needs infra",
                        "Current":         "Current" if a["is_current"] else "",
                        "Note":            a.get("note", ""),
                    })
                st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            except ImportError:
                for a in alts:
                    st.write(a["label"], round(a["tCO2e_yr"], 1), "tCO2e/yr")

            # Best recommendation
            best_list = [a for a in alts
                         if a.get("feasible", True) and not a["is_current"]
                         and a["saving_tco2e"] > 0]
            if best_list:
                best = best_list[0]
                legs_readable = " then ".join(
                    lg["mode"] + " for " + str(int(lg["distance_km"])) + " km"
                    for lg in best["legs"]
                )
                st.success(
                    "Best feasible: **" + best["label"] + "**\n\n"
                    "Route: " + legs_readable + "\n\n"
                    "Saves **" + str(best["saving_tco2e"]) + " tCO2e/yr** "
                    "(" + str(best["saving_pct"]) + "%) vs current mode."
                )
                if len(best["legs"]) > 1:
                    st.info(
                        "Multi-modal note (" + str(len(best["legs"])) + " legs): "
                        "Last-mile road is typically unavoidable unless both ends have "
                        "rail sidings or port access. "
                        "Add 1-2 days for trans-shipment and factor in extra handling cost."
                    )
            else:
                st.info("Current mode is already optimal for this lane.")

            # Portfolio savings across all filtered lanes
            st.markdown("---")
            st.markdown("**Portfolio: best saving per lane**")
            try:
                import pandas as pd
                sum_rows = []
                for l in filtered:
                    l_alts = _multimodal_recommendations(l)
                    good   = [a for a in l_alts
                              if a.get("feasible", True) and not a["is_current"]
                              and a["saving_tco2e"] > 0]
                    if good:
                        b = good[0]
                        sum_rows.append({
                            "Supplier":        l["supplier"],
                            "Material":        l["material"],
                            "Current mode":    l["mode"],
                            "Best alternative":b["label"],
                            "Saving tCO2e/yr": round(b["saving_tco2e"], 1),
                            "Saving %":        str(b["saving_pct"]) + "%",
                        })
                if sum_rows:
                    df_sum = pd.DataFrame(sum_rows).sort_values(
                        "Saving tCO2e/yr", ascending=False)
                    total_sav = df_sum["Saving tCO2e/yr"].sum()
                    st.dataframe(df_sum, use_container_width=True, hide_index=True)
                    st.metric("Total achievable saving (all filtered lanes)",
                              str(round(total_sav, 1)) + " tCO2e/yr")
                else:
                    st.info("All lanes already on optimal modes.")
            except ImportError:
                pass

    # ── Tab 4: Manage lanes ───────────────────────────────────────────────
    with tab4:
        from streamlit_app.auth import can
        if not can("can_enter_data"):
            st.warning("Contributor or Admin role required.")
            return

        # Quick-add from supplier register
        no_lane_names = [n for n in reg_sups if n not in lanes_sup_names]
        if no_lane_names:
            st.markdown("**Quick-add lane from a registered supplier (no lane yet):**")
            q_sel = st.selectbox("Supplier", ["— select —"] + no_lane_names, key="quick_add_sup")
            if q_sel and q_sel != "— select —":
                if st.button("Add lane for " + q_sel, key="quick_add_btn"):
                    import uuid as _uuid
                    s    = reg_sups[q_sel]
                    c    = s.get("country", "IN")
                    clat, clon = _COUNTRY_CENTROIDS.get(c, (20.0, 78.0))
                    pl   = lanes[0] if lanes else {"plant_lat": 18.52, "plant_lon": 73.86,
                                                    "plant_city": "Pune", "plant": "Main Plant"}
                    lanes.append({
                        "id":             "L" + str(_uuid.uuid4())[:6].upper(),
                        "material":       s.get("material", "—"),
                        "supplier":       q_sel,
                        "supplier_city":  c,
                        "supplier_lat":   clat,
                        "supplier_lon":   clon,
                        "plant":          pl.get("plant", "Main Plant"),
                        "plant_city":     pl.get("plant_city", "Pune"),
                        "plant_lat":      pl.get("plant_lat", 18.52),
                        "plant_lon":      pl.get("plant_lon", 73.86),
                        "mode":           "Road (HGV diesel)",
                        "distance_km":    500,
                        "volume_tonnes_yr": 100,
                        "spend_cr":       s.get("spend_cr", 0),
                        "lead_time_days": 3,
                        "frequency":      "Weekly",
                    })
                    _save_lanes(lanes, _current_org)
                    st.success("Lane added for " + q_sel + ". Edit lat/lon and distance below.")
                    st.rerun()

        st.markdown("---")
        with st.expander("Add new lane manually", expanded=False):
            with st.form("add_lane_form"):
                la1, la2 = st.columns(2)
                mat  = la1.text_input("Material *")
                sup  = la2.text_input("Supplier name *")
                lb1, lb2, lb3 = st.columns(3)
                sup_city = lb1.text_input("Supplier city *")
                new_lat  = lb2.number_input("Supplier lat", value=20.0, step=0.01, format="%.4f")
                new_lon  = lb3.number_input("Supplier lon", value=78.0, step=0.01, format="%.4f")
                lc1, lc2 = st.columns(2)
                plant      = lc1.text_input("Plant name", value="Main Plant")
                plant_city = lc2.text_input("Plant city", value="Pune")
                ld1, ld2, ld3 = st.columns(3)
                mode    = ld1.selectbox("Mode", list(MODE_EF.keys()))
                dist_km = ld2.number_input("Distance km", min_value=1, step=1, value=500)
                vol_t   = ld3.number_input("Volume t/yr", min_value=1, step=1, value=100)
                le1, le2, le3 = st.columns(3)
                spend   = le1.number_input("Spend Rs Cr", min_value=0.0, step=0.1)
                lead_t  = le2.number_input("Lead days",   min_value=0, step=1, value=3)
                freq    = le3.selectbox("Frequency",
                           ["Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly"])
                add_btn = st.form_submit_button("Add lane", type="primary")
                if add_btn and mat and sup and sup_city:
                    import uuid as _uuid
                    pl = lanes[0] if lanes else {"plant_lat": 18.52, "plant_lon": 73.86,
                                                  "plant_city": plant_city, "plant": plant}
                    lanes.append({
                        "id":             "L" + str(_uuid.uuid4())[:6].upper(),
                        "material":       mat, "supplier": sup,
                        "supplier_city":  sup_city,
                        "supplier_lat":   new_lat, "supplier_lon": new_lon,
                        "plant":          plant, "plant_city": plant_city,
                        "plant_lat":      pl.get("plant_lat", 18.52),
                        "plant_lon":      pl.get("plant_lon", 73.86),
                        "mode":           mode, "distance_km": dist_km,
                        "volume_tonnes_yr": vol_t, "spend_cr": spend,
                        "lead_time_days": lead_t, "frequency": freq,
                    })
                    _save_lanes(lanes, _current_org)
                    st.success("Lane added: " + mat + " from " + sup_city)
                    st.rerun()

        st.markdown("**Edit / delete lane:**")
        edit_opts = [
            l["id"] + " — " + l["material"] + " (" + l["supplier_city"] + ")"
            for l in lanes
        ]
        if not edit_opts:
            st.info("No lanes yet.")
            return
        edit_sel = st.selectbox("Select lane", edit_opts, key="edit_lane_sel")
        eid      = edit_sel.split(" — ")[0]
        elane    = next((l for l in lanes if l["id"] == eid), None)
        if elane:
            with st.form("edit_lane_form"):
                em1, em2, em3 = st.columns(3)
                upd_mode  = em1.selectbox("Mode", list(MODE_EF.keys()),
                    index=list(MODE_EF.keys()).index(elane["mode"])
                    if elane["mode"] in MODE_EF else 0)
                upd_vol   = em2.number_input("Volume t/yr", min_value=1,
                    value=int(elane["volume_tonnes_yr"]))
                upd_dist  = em3.number_input("Distance km", min_value=1,
                    value=int(elane["distance_km"]))
                en1, en2, en3 = st.columns(3)
                upd_spend = en1.number_input("Spend Rs Cr", min_value=0.0, step=0.1,
                    value=float(elane.get("spend_cr", 0)))
                upd_lat   = en2.number_input("Supplier lat", step=0.001, format="%.4f",
                    value=float(elane.get("supplier_lat", 20.0)))
                upd_lon   = en3.number_input("Supplier lon", step=0.001, format="%.4f",
                    value=float(elane.get("supplier_lon", 78.0)))
                e_save = st.form_submit_button("Save", type="primary")
                e_del  = st.form_submit_button("Delete")
                if e_save:
                    elane.update({
                        "mode": upd_mode, "volume_tonnes_yr": upd_vol,
                        "distance_km": upd_dist, "spend_cr": upd_spend,
                        "supplier_lat": upd_lat, "supplier_lon": upd_lon,
                    })
                    _save_lanes(lanes, _current_org)
                    st.success("Updated.")
                    st.rerun()
                if e_del:
                    _save_lanes([l for l in lanes if l["id"] != eid], _current_org)
                    st.rerun()
