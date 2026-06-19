"""
GHG Emission Calculator — Backend
Uses IPCC EFDB emission factors + Claude AI for intelligent factor selection.

Setup:
    pip install flask flask-cors anthropic

Run:
    export ANTHROPIC_API_KEY=your_key_here
    python app.py
"""

import json
import os
import re
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import anthropic

app = Flask(__name__, static_folder="static")
CORS(app)

# Load emission factors database
EF_DB_PATH = Path(__file__).parent / "data" / "emission_factors.json"
with open(EF_DB_PATH) as f:
    EF_DB = json.load(f)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# ── Unit conversions ──────────────────────────────────────────────────────────

UNIT_TO_KG = {
    "kg": 1,
    "t": 1000,
    "kt": 1_000_000,
    "Mt": 1_000_000_000,
    "g": 0.001,
    "L": None,       # needs density
    "kL": None,
    "m3": None,      # needs density or NCV
    "GJ": None,      # energy unit
    "TJ": None,
    "MWh": None,
    "kWh": None,
}

GJ_PER_MWH = 3.6
GJ_PER_KWH = 0.0036
TJ_PER_GJ  = 0.001

# ── Calculation engine ────────────────────────────────────────────────────────

def calc_stationary_combustion(fuel_key, quantity, unit, country, gwp_version="ar6"):
    """Tier 1 stationary combustion using IPCC 2006 Vol.2 Ch.2."""
    fuels = EF_DB["stationary_combustion"]["factors"]
    if fuel_key not in fuels:
        return None
    f = fuels[fuel_key]
    gwp = EF_DB[f"gwp_{gwp_version}"]

    steps = []
    errors = []

    # Step 1: Convert to TJ
    ncv = f["ncv_tj_per_gg"]  # TJ per Gg (= TJ per 1000 tonnes)
    qty_tj = None

    if unit in ("TJ",):
        qty_tj = quantity
        steps.append({"label": "Energy input", "value": f"{quantity} TJ", "note": "Direct energy unit"})

    elif unit == "GJ":
        qty_tj = quantity * TJ_PER_GJ
        steps.append({"label": "Convert GJ→TJ", "value": f"{quantity} GJ × 0.001 = {qty_tj:.6f} TJ"})

    elif unit == "MWh":
        qty_tj = quantity * GJ_PER_MWH * TJ_PER_GJ
        steps.append({"label": "Convert MWh→TJ", "value": f"{quantity} MWh × 3.6 GJ/MWh × 0.001 = {qty_tj:.6f} TJ"})

    elif unit == "kWh":
        qty_tj = quantity * GJ_PER_KWH * TJ_PER_GJ
        steps.append({"label": "Convert kWh→TJ", "value": f"{quantity} kWh × 0.0036 GJ/kWh × 0.001 = {qty_tj:.6f} TJ"})

    elif unit in ("t", "kg", "kt"):
        qty_kg = quantity * UNIT_TO_KG[unit]
        qty_gg = qty_kg / 1_000_000  # 1 Gg = 1000 t = 1e6 kg
        qty_tj = qty_gg * ncv
        steps.append({"label": f"Convert {unit}→Gg", "value": f"{quantity} {unit} = {qty_kg:.2f} kg = {qty_gg:.6f} Gg"})
        steps.append({"label": "Apply NCV", "value": f"{qty_gg:.6f} Gg × {ncv} TJ/Gg = {qty_tj:.6f} TJ",
                      "note": f"NCV = {ncv} TJ/Gg ({f['source']})"})

    elif unit in ("L", "kL"):
        density = f.get("density_kg_per_litre")
        if not density:
            errors.append(f"No density data for {fuel_key} — cannot convert from {unit}")
            return {"error": errors[0]}
        qty_L = quantity if unit == "L" else quantity * 1000
        qty_kg = qty_L * density
        qty_gg = qty_kg / 1_000_000
        qty_tj = qty_gg * ncv
        steps.append({"label": f"Convert {unit}→kg", "value": f"{qty_L:.2f} L × {density} kg/L = {qty_kg:.2f} kg",
                      "note": f"Density = {density} kg/L"})
        steps.append({"label": "Apply NCV", "value": f"{qty_gg:.6f} Gg × {ncv} TJ/Gg = {qty_tj:.6f} TJ"})
    else:
        errors.append(f"Unit '{unit}' not supported for fuel combustion. Use: TJ, GJ, MWh, kWh, t, kg, L, kL")
        return {"error": errors[0]}

    # Step 2: Apply emission factors
    co2_ef  = f["CO2_kg_per_TJ"]
    ch4_ef  = f["CH4_kg_per_TJ"]
    n2o_ef  = f["N2O_kg_per_TJ"]
    biogenic = f.get("biogenic_CO2", False)

    co2_kg  = qty_tj * co2_ef
    ch4_kg  = qty_tj * ch4_ef
    n2o_kg  = qty_tj * n2o_ef

    steps.append({"label": "CO₂ emissions", "value": f"{qty_tj:.6f} TJ × {co2_ef} kg/TJ = {co2_kg:.2f} kg CO₂",
                  "note": "Biogenic (not counted in total)" if biogenic else ""})
    steps.append({"label": "CH₄ emissions", "value": f"{qty_tj:.6f} TJ × {ch4_ef} kg/TJ = {ch4_kg:.4f} kg CH₄"})
    steps.append({"label": "N₂O emissions", "value": f"{qty_tj:.6f} TJ × {n2o_ef} kg/TJ = {n2o_kg:.4f} kg N₂O"})

    # Step 3: GWP conversion
    gwp_ch4 = gwp["CH4_fossil"]
    gwp_n2o = gwp["N2O"]

    co2_t_co2e  = 0 if biogenic else co2_kg / 1000
    ch4_t_co2e  = (ch4_kg * gwp_ch4) / 1000
    n2o_t_co2e  = (n2o_kg * gwp_n2o) / 1000
    total_t_co2e = co2_t_co2e + ch4_t_co2e + n2o_t_co2e

    steps.append({"label": "CO₂e conversion",
                  "value": f"CO₂: {co2_t_co2e:.4f} + CH₄: {ch4_kg/1000:.4f}×{gwp_ch4} + N₂O: {n2o_kg/1000:.4f}×{gwp_n2o} = {total_t_co2e:.4f} tCO₂e",
                  "note": f"GWP100 from IPCC {gwp_version.upper()}"})

    ef_table = [
        {"ef_id": f.get("efdb_ids", ["—"])[0], "description": f"CO₂ — {f['label']}",
         "value": f"{co2_ef} kg CO₂/TJ", "gas": "CO₂", "region": f.get("region","Global"), "tier": "Tier 1", "source": f["source"]},
        {"ef_id": f.get("efdb_ids", ["—"])[1] if len(f.get("efdb_ids",[])) > 1 else "—",
         "description": f"CH₄ — {f['label']}",
         "value": f"{ch4_ef} kg CH₄/TJ", "gas": "CH₄", "region": f.get("region","Global"), "tier": "Tier 1", "source": f["source"]},
        {"ef_id": f.get("efdb_ids", ["—"])[2] if len(f.get("efdb_ids",[])) > 2 else "—",
         "description": f"N₂O — {f['label']}",
         "value": f"{n2o_ef} kg N₂O/TJ", "gas": "N₂O", "region": f.get("region","Global"), "tier": "Tier 1", "source": f["source"]},
    ]

    return {
        "total_co2e": round(total_t_co2e, 4),
        "unit_qualifier": "tCO₂e",
        "primary_ef_value": co2_ef,
        "primary_ef_unit": "kg CO₂/TJ",
        "primary_ef_id": f.get("efdb_ids", ["—"])[0],
        "primary_ef_source": f["source"],
        "gases": {
            "CO2": round(co2_t_co2e, 4),
            "CH4": round(ch4_t_co2e, 4),
            "N2O": round(n2o_t_co2e, 4),
        },
        "steps": steps,
        "ef_table": ef_table,
        "biogenic_co2_note": f"Biogenic CO₂ ({co2_kg/1000:.4f} tCO₂) reported separately and not included in total." if biogenic else None,
        "assumptions": [
            f"IPCC 2006 Tier 1 default emission factors used",
            f"NCV = {ncv} TJ/Gg from IPCC 2006 Table 1.2",
            f"GWP100 values from IPCC {gwp_version.upper()}: CH₄={gwp_ch4}, N₂O={gwp_n2o}",
        ],
        "methodology": f"Stationary combustion calculation per IPCC 2006 Vol.2 Ch.2. "
                       f"Activity data converted to TJ using net calorific value, then multiplied by "
                       f"gas-specific emission factors. CH₄ and N₂O converted to CO₂e using AR6 GWPs.",
        "confidence": "high",
    }


def calc_electricity(quantity, unit, country, gwp_version="ar6"):
    """Scope 2 market/location-based electricity emissions."""
    factors = EF_DB["electricity"]["factors"]
    country_key = country if country in factors else "global"
    f = factors[country_key]

    ef = f["CO2e_kg_per_kWh"]

    # Convert to kWh
    if unit == "kWh":
        qty_kwh = quantity
    elif unit == "MWh":
        qty_kwh = quantity * 1000
    elif unit == "GJ":
        qty_kwh = quantity * 1000 / 3.6
    elif unit == "TJ":
        qty_kwh = quantity * 1_000_000 / 3.6
    else:
        return {"error": f"Unit '{unit}' not supported for electricity. Use: kWh, MWh, GJ, TJ"}

    total_co2e = (qty_kwh * ef) / 1000  # kg → t

    steps = [
        {"label": "Electricity consumption", "value": f"{qty_kwh:,.2f} kWh", "note": f"Converted from {quantity} {unit}"},
        {"label": "Grid emission factor", "value": f"{ef} kgCO₂e/kWh", "note": f"{f['source']}"},
        {"label": "Total emissions", "value": f"{qty_kwh:,.2f} × {ef} / 1000 = {total_co2e:.4f} tCO₂e"},
    ]

    return {
        "total_co2e": round(total_co2e, 4),
        "unit_qualifier": "tCO₂e",
        "primary_ef_value": ef,
        "primary_ef_unit": "kgCO₂e/kWh",
        "primary_ef_id": "Grid EF",
        "primary_ef_source": f["source"],
        "gases": {"CO2": round(total_co2e, 4), "CH4": None, "N2O": None},
        "steps": steps,
        "ef_table": [{"ef_id": "Grid EF", "description": f["label"], "value": f"{ef} kgCO₂e/kWh",
                      "gas": "CO₂e", "region": country_key, "tier": "Market-based", "source": f["source"]}],
        "assumptions": [
            f"Grid factor for {country_key}: {ef} kgCO₂e/kWh (Year: {f.get('year','N/A')})",
            "Location-based method used",
            "For market-based method, use supplier-specific factor or renewable energy certificate data",
        ],
        "methodology": f"Scope 2 location-based calculation. Grid emission factor from {f['source']}. "
                       f"Multiply electricity consumption (kWh) by grid factor (kgCO₂e/kWh). "
                       f"Note: {f.get('notes','')}",
        "confidence": "medium" if country_key == "global" else "high",
        "alternatives_note": f.get("notes", ""),
    }


def calc_mobile_combustion(vehicle_key, quantity, unit, gwp_version="ar6"):
    """Mobile combustion using IPCC 2006 Vol.2 Ch.3."""
    factors = EF_DB["mobile_combustion"]["factors"]
    if vehicle_key not in factors:
        return None
    f = factors[vehicle_key]
    gwp = EF_DB[f"gwp_{gwp_version}"]

    steps = []

    # Convert to TJ using fuel consumption
    ncv = f.get("ncv_tj_per_gg", 44.3)

    if unit == "km":
        # Use default fuel efficiency
        eff = f.get("fuel_efficiency_L_per_100km", 8.0)
        density = f.get("density_kg_per_litre", 0.74)
        qty_L = quantity * eff / 100
        qty_kg = qty_L * density
        qty_tj = (qty_kg / 1_000_000) * ncv
        steps.append({"label": "Fuel consumption", "value": f"{quantity:.0f} km × {eff} L/100km = {qty_L:.2f} L",
                      "note": f"Default efficiency. Use actual fuel data if available."})
        steps.append({"label": "Convert to TJ", "value": f"{qty_L:.2f} L × {density} kg/L / 1e6 × {ncv} TJ/Gg = {qty_tj:.6f} TJ"})

    elif unit in ("L", "kL"):
        density = f.get("density_kg_per_litre", 0.845)
        qty_L = quantity if unit == "L" else quantity * 1000
        qty_kg = qty_L * density
        qty_tj = (qty_kg / 1_000_000) * ncv
        steps.append({"label": "Convert L→TJ", "value": f"{qty_L:.2f} L × {density} kg/L / 1e6 × {ncv} TJ/Gg = {qty_tj:.6f} TJ"})

    elif unit in ("t", "kg", "kt"):
        qty_kg = quantity * UNIT_TO_KG[unit]
        qty_tj = (qty_kg / 1_000_000) * ncv
        steps.append({"label": "Convert to TJ", "value": f"{qty_kg:.2f} kg / 1e6 × {ncv} TJ/Gg = {qty_tj:.6f} TJ"})

    elif unit == "TJ":
        qty_tj = quantity
        steps.append({"label": "Energy input", "value": f"{quantity} TJ"})
    elif unit == "GJ":
        qty_tj = quantity * 0.001
        steps.append({"label": "Convert GJ→TJ", "value": f"{quantity} GJ × 0.001 = {qty_tj} TJ"})
    else:
        return {"error": f"Unit '{unit}' not supported for mobile combustion. Use: km, L, kL, t, kg, TJ, GJ"}

    # CO2 from fuel
    co2_kg = qty_tj * f["CO2_kg_per_TJ"]
    steps.append({"label": "CO₂ from combustion", "value": f"{qty_tj:.6f} TJ × {f['CO2_kg_per_TJ']} kg/TJ = {co2_kg:.2f} kg CO₂"})

    # CH4, N2O — may be per-km or per-TJ
    if unit == "km" and "CH4_g_per_km" in f:
        ch4_kg = quantity * f["CH4_g_per_km"] / 1000
        n2o_kg = quantity * f["N2O_g_per_km"] / 1000
        steps.append({"label": "CH₄ (per-km EF)", "value": f"{quantity} km × {f['CH4_g_per_km']} g/km = {ch4_kg*1000:.2f} g CH₄"})
        steps.append({"label": "N₂O (per-km EF)", "value": f"{quantity} km × {f['N2O_g_per_km']} g/km = {n2o_kg*1000:.2f} g N₂O"})
    else:
        ch4_kg = qty_tj * f.get("CH4_kg_per_TJ", 3)
        n2o_kg = qty_tj * f.get("N2O_kg_per_TJ", 0.6)
        steps.append({"label": "CH₄ emissions", "value": f"{qty_tj:.6f} TJ × {f.get('CH4_kg_per_TJ',3)} kg/TJ = {ch4_kg:.4f} kg CH₄"})
        steps.append({"label": "N₂O emissions", "value": f"{qty_tj:.6f} TJ × {f.get('N2O_kg_per_TJ',0.6)} kg/TJ = {n2o_kg:.4f} kg N₂O"})

    co2_t = co2_kg / 1000
    ch4_t_co2e = ch4_kg * gwp["CH4_fossil"] / 1000
    n2o_t_co2e = n2o_kg * gwp["N2O"] / 1000
    total = co2_t + ch4_t_co2e + n2o_t_co2e
    steps.append({"label": "Total CO₂e", "value": f"{co2_t:.4f} + {ch4_t_co2e:.4f} + {n2o_t_co2e:.4f} = {total:.4f} tCO₂e"})

    return {
        "total_co2e": round(total, 4),
        "unit_qualifier": "tCO₂e",
        "primary_ef_value": f["CO2_kg_per_TJ"],
        "primary_ef_unit": "kg CO₂/TJ",
        "primary_ef_id": f.get("efdb_ids", ["—"])[0],
        "primary_ef_source": f["source"],
        "gases": {"CO2": round(co2_t, 4), "CH4": round(ch4_t_co2e, 4), "N2O": round(n2o_t_co2e, 4)},
        "steps": steps,
        "ef_table": [{"ef_id": f.get("efdb_ids",["—"])[0], "description": f["label"],
                      "value": f"{f['CO2_kg_per_TJ']} kg CO₂/TJ", "gas": "CO₂+CH₄+N₂O",
                      "region": "Global", "tier": "Tier 1", "source": f["source"]}],
        "assumptions": [f"IPCC 2006 Vol.2 Ch.3 Tier 1 EFs",
                        f"GWP100 AR6: CH₄={gwp['CH4_fossil']}, N₂O={gwp['N2O']}"],
        "methodology": "Mobile combustion per IPCC 2006 Vol.2 Ch.3. CO₂ calculated from fuel energy content; CH₄ and N₂O from technology-specific per-km or per-TJ factors.",
        "confidence": "medium",
    }


# ── AI-assisted calculation ───────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert GHG accounting specialist with deep knowledge of the IPCC Emission Factor Database (EFDB).

You have access to the local EFDB database (emission_factors.json) containing factors for:
- Stationary combustion (all major fuels: natural gas, diesel, petrol, coal, LPG, etc.)
- Mobile combustion (cars, trucks, buses, aviation, marine)
- Grid electricity by country
- Industrial processes (cement, lime, steel, aluminium, HFCs, etc.)
- Agriculture (enteric fermentation, manure, rice, fertiliser)
- Waste (landfill, wastewater, incineration)
- Fugitive emissions

When a user describes an activity:
1. Identify the correct IPCC 2006 category and the right emission factor
2. Show every calculation step with numbers and units
3. State the EFDB ID or IPCC table reference for each factor used
4. Give the final answer in tCO₂e
5. Use IPCC AR6 GWPs: CO₂=1, CH₄(fossil)=27.9, N₂O=273
6. Flag if better country-specific data is available vs IPCC defaults
7. For India: mention CEA grid factor (0.716 kgCO₂e/kWh) for electricity

Be precise with units. Show unit conversions clearly. Be concise but complete."""


def ai_calculate(user_message, history):
    """Call Claude with full conversation history."""
    messages = history + [{"role": "user", "content": user_message}]
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text


def ai_select_and_calculate(params):
    """Use Claude to select the right factor and compute, returning structured JSON."""
    ef_summary = json.dumps({
        "stationary_fuels": list(EF_DB["stationary_combustion"]["factors"].keys()),
        "mobile_vehicles": list(EF_DB["mobile_combustion"]["factors"].keys()),
        "electricity_countries": list(EF_DB["electricity"]["factors"].keys()),
        "industrial_processes": list(EF_DB["industrial_processes"]["factors"].keys()),
        "agriculture": list(EF_DB["agriculture"]["factors"].keys()),
        "waste": list(EF_DB["waste"]["factors"].keys()),
    }, indent=2)

    prompt = f"""Based on the user's inputs below, select the correct emission factor category and key, then compute the GHG emissions step by step.

Available emission factor keys in local database:
{ef_summary}

USER INPUTS:
{json.dumps(params, indent=2)}

Return ONLY a JSON object (no markdown, no preamble) with this exact structure:
{{
  "category": "<stationary_combustion|mobile_combustion|electricity|industrial_processes|agriculture|waste|fugitive>",
  "factor_key": "<exact key from the lists above, or null if not in database>",
  "total_co2e": <number in tCO2e>,
  "unit_qualifier": "<per year / per month / total>",
  "primary_ef_value": <number>,
  "primary_ef_unit": "<string>",
  "primary_ef_id": "<EFDB ID or IPCC table>",
  "primary_ef_source": "<full source citation>",
  "gases": {{"CO2": <t or null>, "CH4": <tCO2e or null>, "N2O": <tCO2e or null>}},
  "steps": [
    {{"label": "<step>", "value": "<value with unit>", "note": "<explanation>"}}
  ],
  "ef_table": [
    {{"ef_id": "<id>", "description": "<desc>", "value": "<val unit>", "gas": "<gas>", "region": "<region>", "tier": "<tier>", "source": "<source>"}}
  ],
  "assumptions": ["<assumption>"],
  "methodology": "<explanation>",
  "confidence": "<high|medium|low>",
  "alternatives_note": "<if better data exists>"
}}"""

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        system="You are a GHG accounting expert. Return only valid JSON, no preamble, no markdown fences.",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.content[0].text.strip()
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"```$", "", text).strip()
    return json.loads(text)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    """Main calculation endpoint — tries local engine first, falls back to AI."""
    data = request.json
    fuel = data.get("fuel", "")
    scope = data.get("scope", "")
    quantity = float(data.get("quantity", 0))
    unit = data.get("unit", "t")
    country = data.get("country", "global")
    context = data.get("context", "")
    gwp = data.get("gwp_version", "ar6")

    result = None

    # Try local deterministic engine first
    if scope == "scope2" or fuel == "electricity":
        result = calc_electricity(quantity, unit, country, gwp)

    elif fuel in EF_DB["stationary_combustion"]["factors"]:
        result = calc_stationary_combustion(fuel, quantity, unit, country, gwp)

    elif fuel in EF_DB["mobile_combustion"]["factors"]:
        result = calc_mobile_combustion(fuel, quantity, unit, gwp)

    # If local engine didn't handle it, use AI
    if result is None or "error" in (result or {}):
        try:
            result = ai_select_and_calculate(data)
            result["_engine"] = "ai"
        except Exception as e:
            return jsonify({"error": f"AI calculation failed: {str(e)}"}), 500
    else:
        result["_engine"] = "local"

    return jsonify(result)


@app.route("/api/chat", methods=["POST"])
def chat():
    """Free-text chat endpoint."""
    data = request.json
    message = data.get("message", "")
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        reply = ai_calculate(message, history)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ef_db")
def get_ef_db():
    """Return the full emission factor database."""
    return jsonify(EF_DB)


@app.route("/api/factors/<category>")
def get_factors(category):
    """Return factors for a specific category."""
    if category in EF_DB:
        return jsonify(EF_DB[category])
    return jsonify({"error": "Category not found"}), 404


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "ef_categories": list(EF_DB.keys())})


if __name__ == "__main__":
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("WARNING: ANTHROPIC_API_KEY not set. AI features will fail.")
        print("Set it with: export ANTHROPIC_API_KEY=your_key_here")
    print("Starting sk.lite on http://localhost:5000")
    app.run(debug=True, port=5000)
