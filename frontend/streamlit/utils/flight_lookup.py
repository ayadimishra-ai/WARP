"""
sk.lite — Flight Lookup Utility.

Provides two capabilities for Cat 6 business travel:

1. Flight number → route + aircraft type
   Primary: Aviationstack API (free tier: 100 calls/month)
   Fallback: Airline fleet table (seeded locally)

2. ICAO fuel-based calculation
   Method: fuel_kg = fuel_kg_per_km × distance_km
           CO2_kg  = fuel_kg × 3.16 (IPCC 2006 aviation CO2 EF)
   Adjusted for cabin class using ICAO CORSIA seat factors.

Cabin class seat factors (ICAO CORSIA methodology):
  Economy:          1.0 × (baseline)
  Premium Economy:  1.5 ×
  Business:         4.0 × (wide body average)
  First:            6.0 × (wide body average)

CO2 per kg jet fuel = 3.16 (IPCC 2006 Vol.2 Ch.3 Table 3.6.4)

Radiative Forcing Index (RFI):
  CO2 only:      multiplier = 1.0 (GHG Protocol default)
  Total climate: multiplier = 1.9 (IPCC best estimate incl. NOx, contrails)
  Users can override via rf_factor in extra{}

Usage:
    from utils.flight_lookup import (
        lookup_flight, icao_fuel_method, airport_distance_km
    )
    result = lookup_flight('AI101', conn)
    # result = {'airline': 'Air India', 'aircraft': 'B77W', 'dep': 'BOM', 'arr': 'LHR', ...}
"""

from __future__ import annotations
import math
import sqlite3
from typing import Optional

# ── Constants ─────────────────────────────────────────────────────────────
CO2_KG_PER_KG_FUEL = 3.16      # IPCC 2006 Vol.2 Ch.3 Table 3.6.4 (Jet A/A-1)

# ICAO CORSIA cabin class seat-space factors (relative to economy seat)
_CABIN_FACTORS: dict[str, float] = {
    "economy":          1.0,
    "economy_class":    1.0,
    "eco":              1.0,
    "premium_economy":  1.5,
    "premium eco":      1.5,
    "premium":          1.5,
    "business":         4.0,
    "business_class":   4.0,
    "biz":              4.0,
    "first":            6.0,
    "first_class":      6.0,
}

# Airline IATA code → typical long-haul aircraft (fallback when API unavailable)
_AIRLINE_FLEET: dict[str, str] = {
    "AI": "B77W",   # Air India — primary long-haul
    "6E": "A32N",   # IndiGo — narrow body only
    "SG": "B738",   # SpiceJet — 737 mix
    "UK": "A321",   # Vistara — A320 family
    "G8": "B738",   # GoFirst / Go Air
    "IX": "A320",   # Air Asia India
    "9W": "B738",   # Jet Airways (legacy, if reactivated)
    "EK": "B77W",   # Emirates — to India
    "EY": "B789",   # Etihad — to India
    "QR": "B789",   # Qatar Airways — to India
    "BA": "B789",   # British Airways — to India
    "LH": "A333",   # Lufthansa — to India
    "AF": "B77W",   # Air France
    "SQ": "B77W",   # Singapore Airlines
    "TG": "B789",   # Thai Airways
    "MH": "B789",   # Malaysia Airlines
    "CX": "B77W",   # Cathay Pacific
    "NH": "B789",   # ANA
    "JL": "B788",   # Japan Airlines
    "UA": "B789",   # United Airlines
    "AA": "B77W",   # American Airlines
    "DL": "B77W",   # Delta
    "KL": "B789",   # KLM
    "TK": "B789",   # Turkish Airlines
}


# ── Haversine distance ─────────────────────────────────────────────────────

def airport_distance_km(
    dep_iata: str,
    arr_iata: str,
    conn: sqlite3.Connection,
) -> Optional[float]:
    """
    Calculate great circle distance between two airports using seeded coordinates.

    Returns km or None if either airport not in DB.
    """
    try:
        dep_row = conn.execute(
            "SELECT lat, lon FROM airports WHERE UPPER(iata) = UPPER(?) LIMIT 1",
            (dep_iata,)
        ).fetchone()
        arr_row = conn.execute(
            "SELECT lat, lon FROM airports WHERE UPPER(iata) = UPPER(?) LIMIT 1",
            (arr_iata,)
        ).fetchone()
    except Exception:
        return None

    if not dep_row or not arr_row:
        return None

    return _haversine(dep_row[0], dep_row[1], arr_row[0], arr_row[1])


def _haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1) * math.cos(p2) * math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))


# ── Aircraft fuel lookup ───────────────────────────────────────────────────

def get_aircraft_fuel_burn(
    icao_code: str,
    conn: sqlite3.Connection,
) -> Optional[dict]:
    """
    Look up aircraft fuel burn from seeded aircraft_fuel_burn table.

    Returns dict with keys: fuel_kg_per_km, seats_typical, name, category
    or None if not found.
    """
    try:
        row = conn.execute(
            """SELECT fuel_kg_per_km, seats_typical, name, category, iata_code
               FROM aircraft_fuel_burn
               WHERE UPPER(icao_code) = UPPER(?) OR UPPER(iata_code) = UPPER(?)
               LIMIT 1""",
            (icao_code, icao_code),
        ).fetchone()
        if row:
            return dict(row)
    except Exception:
        pass
    return None


# ── Flight number parser ───────────────────────────────────────────────────

def parse_flight_number(flight_number: str) -> tuple[str, str]:
    """
    Parse flight number into (airline_iata_code, flight_digits).

    IATA airline codes are exactly 2 characters and can be:
      - Two letters:        AI, EK, BA
      - Digit then letter:  6E (IndiGo), 9W (Jet Airways), 2W, etc.
      - Letter then digit:  (rare, but possible)

    Examples:
      'AI101'  -> ('AI',  '101')
      'EK526'  -> ('EK',  '526')
      '6E1234' -> ('6E',  '1234')
      '9W 819' -> ('9W',  '819')
    """
    import re
    flight = flight_number.strip().upper().replace(" ", "")

    # Try: exactly 2-char IATA code (letters OR digit+letter OR letter+digit)
    # followed by digits
    m = re.match(r'^([A-Z]{2}|\d[A-Z]|[A-Z]\d)(\d+)$', flight)
    if m:
        return m.group(1), m.group(2)

    # Fallback: scan for where the pure-digit run starts after at least 1 char
    for i in range(1, len(flight)):
        if flight[i:].isdigit():
            return flight[:i], flight[i:]

    return flight, ""


# ── Aviationstack API lookup ───────────────────────────────────────────────

def lookup_flight_api(
    flight_number: str,
    api_key: str,
) -> Optional[dict]:
    """
    Query Aviationstack API for flight details.
    Returns dict with dep_iata, arr_iata, aircraft_icao, airline_name
    or None on failure.

    Rate limit: 100 calls/month (free tier).
    Cache results to avoid repeated calls for the same route.
    """
    try:
        import urllib.request
        import json
        airline_code, flight_digits = parse_flight_number(flight_number)
        url = (
            f"http://api.aviationstack.com/v1/flights"
            f"?access_key={api_key}"
            f"&flight_iata={flight_number}"
            f"&limit=1"
        )
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
        flights = data.get("data", [])
        if not flights:
            return None
        f = flights[0]
        return {
            "airline_name": f.get("airline", {}).get("name", ""),
            "airline_iata": f.get("airline", {}).get("iata", airline_code),
            "dep_iata":     f.get("departure", {}).get("iata", ""),
            "arr_iata":     f.get("arrival", {}).get("iata", ""),
            "aircraft_icao":f.get("aircraft", {}).get("icao", ""),
            "aircraft_iata":f.get("aircraft", {}).get("iata", ""),
            "source":       "Aviationstack API",
        }
    except Exception:
        return None


def lookup_flight(
    flight_number: str,
    conn: sqlite3.Connection,
    api_key: Optional[str] = None,
) -> dict:
    """
    Look up flight details from API (if key provided) or fallback to local data.

    Returns dict:
        airline_iata:  e.g. 'AI'
        dep_iata:      departure airport IATA
        arr_iata:      arrival airport IATA
        aircraft_icao: aircraft ICAO type code
        distance_km:   great circle distance (if airports found)
        source:        data source description
        api_used:      bool
    """
    airline_code, _ = parse_flight_number(flight_number)
    result = {
        "airline_iata":  airline_code,
        "dep_iata":      "",
        "arr_iata":      "",
        "aircraft_icao": "",
        "distance_km":   None,
        "source":        "local fallback",
        "api_used":      False,
    }

    # Try API first if key provided
    if api_key:
        api_result = lookup_flight_api(flight_number, api_key)
        if api_result:
            result.update(api_result)
            result["api_used"] = True
            # Calculate distance
            if result["dep_iata"] and result["arr_iata"]:
                d = airport_distance_km(result["dep_iata"], result["arr_iata"], conn)
                if d:
                    result["distance_km"] = d
            # Get aircraft fuel burn
            if not result.get("aircraft_icao"):
                result["aircraft_icao"] = _AIRLINE_FLEET.get(airline_code, "A320")
            return result

    # Fallback: use airline fleet table
    result["aircraft_icao"] = _AIRLINE_FLEET.get(airline_code, "A320")
    result["source"] = f"Local fleet table (airline {airline_code})"
    return result


# ── ICAO fuel-based calculation ────────────────────────────────────────────

def icao_fuel_method(
    distance_km: float,
    aircraft_icao: str,
    cabin_class: str = "economy",
    n_passengers: int = 1,
    rf_factor: float = 1.0,
    conn: Optional[sqlite3.Connection] = None,
) -> dict:
    """
    Calculate CO2e per passenger using ICAO fuel-based method.

    Method:
        total_fuel_kg = fuel_kg_per_km × distance_km
        co2_total     = total_fuel_kg × 3.16
        co2_per_seat  = co2_total / seats_typical
        cabin_factor  = ICAO CORSIA class weight
        co2_passenger = co2_per_seat × cabin_factor
        co2e          = co2_passenger × rf_factor

    Args:
        distance_km:   great circle distance
        aircraft_icao: ICAO aircraft type code (e.g. 'B77W', 'A32N')
        cabin_class:   'economy', 'premium_economy', 'business', 'first'
        n_passengers:  number of passengers (multiplier)
        rf_factor:     radiative forcing multiplier (1.0=CO2 only, 1.9=full)
        conn:          EF store connection for fuel burn lookup

    Returns dict with full audit trail.
    """
    # Get aircraft fuel burn
    fuel_data = None
    if conn:
        fuel_data = get_aircraft_fuel_burn(aircraft_icao, conn)

    if fuel_data:
        fuel_kg_per_km = fuel_data["fuel_kg_per_km"]
        seats          = fuel_data["seats_typical"] or 150
        aircraft_name  = fuel_data["name"]
        ef_source      = f"aircraft_fuel_burn.csv — {aircraft_name}"
    else:
        # Hardcoded fallbacks by category
        _FALLBACK: dict[str, tuple[float, int]] = {
            "B77W": (6.20, 360), "B789": (5.30, 296), "B788": (4.80, 242),
            "B738": (2.60, 162), "A32N": (2.30, 165), "A320": (2.50, 150),
            "A321": (2.80, 180), "A333": (6.80, 295), "A359": (5.80, 320),
        }
        fb = _FALLBACK.get(aircraft_icao, (2.50, 150))   # default A320
        fuel_kg_per_km = fb[0]
        seats          = fb[1]
        aircraft_name  = aircraft_icao
        ef_source      = "hardcoded fallback (aircraft_fuel_burn.csv not in DB)"

    # Cabin class factor
    cabin_key    = cabin_class.lower().replace(" ", "_")
    cabin_factor = _CABIN_FACTORS.get(cabin_key, 1.0)

    # Calculation
    total_fuel_kg     = fuel_kg_per_km * distance_km
    co2_total_kg      = total_fuel_kg * CO2_KG_PER_KG_FUEL
    co2_per_seat_kg   = co2_total_kg / seats
    co2_passenger_kg  = co2_per_seat_kg * cabin_factor
    co2e_passenger_kg = co2_passenger_kg * rf_factor
    total_co2e_kg     = co2e_passenger_kg * n_passengers

    return {
        "kg_CO2e":            round(total_co2e_kg, 4),
        "t_CO2e":             round(total_co2e_kg / 1000, 6),
        "methodology":        "ICAO fuel-based method",
        "aircraft_icao":      aircraft_icao,
        "aircraft_name":      aircraft_name,
        "distance_km":        distance_km,
        "fuel_kg_per_km":     fuel_kg_per_km,
        "total_fuel_kg":      round(total_fuel_kg, 2),
        "seats":              seats,
        "co2_total_kg":       round(co2_total_kg, 2),
        "co2_per_seat_kg":    round(co2_per_seat_kg, 4),
        "cabin_class":        cabin_class,
        "cabin_factor":       cabin_factor,
        "co2_passenger_kg":   round(co2_passenger_kg, 4),
        "rf_factor":          rf_factor,
        "co2e_passenger_kg":  round(co2e_passenger_kg, 4),
        "n_passengers":       n_passengers,
        "ef_source":          ef_source,
        "co2_per_kg_fuel":    CO2_KG_PER_KG_FUEL,
        "note": (
            f"ICAO fuel-based: {distance_km:.0f} km × {fuel_kg_per_km} kg/km = "
            f"{total_fuel_kg:.0f} kg fuel → {co2_total_kg:.0f} kg CO₂ / {seats} seats "
            f"× cabin factor {cabin_factor} × RF {rf_factor} = {co2e_passenger_kg:.2f} kgCO₂e/pax"
        ),
    }
