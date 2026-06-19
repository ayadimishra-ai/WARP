"""
sk.lite — Activity Upload Template Generator.

Generates a master Excel workbook with one tab per scope/category.
Each tab has:
  - Colour-coded header row
  - Column definitions row (tooltip-style instructions)
  - Dropdown validation on key columns (unit, fuel/mode, country)
  - Example row pre-filled with a realistic sample
  - Data rows (50 blank rows ready for input)
  - A hidden 'valid_values' sheet for dropdown sources

Usage:
    python templates/activity_upload_master.py
    # Outputs: templates/GHG_Activity_Upload_Template.xlsx

    from templates.activity_upload_master import generate_template
    path = generate_template(output_path="my_template.xlsx")
"""

from __future__ import annotations
from pathlib import Path
import openpyxl
from openpyxl.styles import (
    PatternFill, Font, Alignment, Border, Side, Protection
)
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo

# ---------------------------------------------------------------------------
# Colour palette
# ---------------------------------------------------------------------------
GREEN_DARK   = "1B5E20"
GREEN_MID    = "2E7D32"
GREEN_LIGHT  = "E8F5E9"
GREEN_HEADER = "388E3C"
TEAL         = "00695C"
AMBER        = "F57F17"
AMBER_LIGHT  = "FFF9C4"
BLUE_LIGHT   = "E3F2FD"
GREY_LIGHT   = "F5F5F5"
GREY_MID     = "B0BEC5"
WHITE        = "FFFFFF"
RED_LIGHT    = "FFEBEE"

# ---------------------------------------------------------------------------
# Tab definitions — (tab_name, scope, colour, columns, example_row)
# ---------------------------------------------------------------------------

_COMMON_COLS = [
    # (header, width, description, dropdown_key)
    ("record_id",       14, "Leave blank — auto-generated on import", None),
    ("reporting_year",  14, "Calendar year of the activity (e.g. 2024)", None),
    ("fiscal_year",     12, "Fiscal year label e.g. 2023-24 (for India grid EF)", None),
    ("country",         10, "ISO alpha-2 country code: IN, US, GB, GLOBAL, etc.", "country"),
    ("data_quality",    14, "measured / estimated / default", "data_quality"),
    ("source_file",     18, "Source document / reference for this activity data", None),
    ("notes",           30, "Any additional notes or caveats", None),
]

TABS = [
    # ── Scope 1 ──────────────────────────────────────────────────────────
    {
        "name": "S1_Stationary",
        "title": "Scope 1 — Stationary Combustion",
        "scope": "Scope 1",
        "process": "S1 \u2014 Stationary combustion (fuel burn)",
        "colour": "EF553B",
        "description": (
            "Fuel burned in fixed equipment: boilers, furnaces, generators, ovens, kilns.\n"
            "Do NOT include mobile equipment (use S1_Mobile tab)."
        ),
        "columns": [
            ("site_name",      18, "Name of the facility or cost centre", None),
            ("equipment_type", 20, "e.g. Gas boiler, Diesel genset, Coal furnace", None),
            ("fuel_or_item",   20, "Fuel type", "stat_fuels"),
            ("quantity",       12, "Amount of fuel consumed (numeric)", None),
            ("unit",           10, "Unit of quantity", "energy_mass_units"),
        ],
        "example": {
            "site_name": "Mumbai Plant 1",
            "equipment_type": "Gas boiler",
            "fuel_or_item": "natural_gas",
            "quantity": 5000,
            "unit": "GJ",
            "reporting_year": 2024,
            "fiscal_year": "2023-24",
            "country": "IN",
            "data_quality": "measured",
            "source_file": "Gas bills FY2023-24",
        },
    },
    {
        "name": "S1_Mobile",
        "title": "Scope 1 — Mobile Combustion",
        "scope": "Scope 1",
        "process": "S1 \u2014 Mobile combustion (road)",
        "colour": "EF553B",
        "description": (
            "Fuel consumed by company-OWNED vehicles: cars, trucks, buses, forklifts.\n"
            "Third-party/contracted transport goes in S3_Cat4 or S3_Cat9."
        ),
        "columns": [
            ("vehicle_type",   20, "Vehicle category", "mobile_vehicles"),
            ("vehicle_id",     16, "Fleet ID / registration (optional)", None),
            ("fuel_or_item",   20, "Fuel or vehicle type", "mobile_vehicles"),
            ("quantity",       12, "Fuel consumed or distance (numeric)", None),
            ("unit",           10, "Unit: L, km, miles, GJ, kg", "mobile_units"),
        ],
        "example": {
            "vehicle_type": "diesel_cars",
            "vehicle_id": "MH01-AB-1234",
            "fuel_or_item": "diesel_cars",
            "quantity": 2000,
            "unit": "L",
            "reporting_year": 2024,
            "fiscal_year": "2023-24",
            "country": "IN",
            "data_quality": "measured",
            "source_file": "Fleet fuel log",
        },
    },
    {
        "name": "S1_Fugitive",
        "title": "Scope 1 — Fugitive Emissions",
        "scope": "Scope 1",
        "process": "S1 \u2014 Fugitive emissions (energy)",
        "colour": "EF553B",
        "description": (
            "HFC/SF6 refrigerant top-ups or equipment-based charge x leak rate.\n"
            "Oil & gas methane: set sub_type=oil_gas. Coal: sub_type=coal."
        ),
        "columns": [
            ("fuel_or_item",       20, "Refrigerant name: R-410A, HFC-134a, SF6, R-22 etc.", "refrigerants"),
            ("quantity",           12, "kg of refrigerant purchased/topped-up", None),
            ("unit",               10, "kg", None),
            ("method",             16, "top_up (default) or equipment_based", "fugitive_method"),
            ("equipment_type",     20, "For equipment_based: stationary_ac, chillers, etc.", "equip_types"),
            ("total_charge_kg",    16, "For equipment_based: total refrigerant charge (kg)", None),
            ("sub_type",           14, "refrigerant (default), oil_gas, or coal", "fugitive_subtype"),
        ],
        "example": {
            "fuel_or_item": "R-410A",
            "quantity": 5,
            "unit": "kg",
            "method": "top_up",
            "equipment_type": "",
            "total_charge_kg": "",
            "sub_type": "refrigerant",
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "measured",
            "source_file": "AC maintenance log",
        },
    },
    # ── Scope 2 ──────────────────────────────────────────────────────────
    {
        "name": "S2_Electricity",
        "title": "Scope 2 — Purchased Electricity",
        "scope": "Scope 2",
        "process": "S2 \u2014 Purchased electricity (grid)",
        "colour": "FFA15A",
        "description": (
            "Grid electricity consumed at each meter/site.\n"
            "Dual reporting: location-based (required) + market-based (if REC/PPA available)."
        ),
        "columns": [
            ("site_name",       20, "Meter name / facility / cost centre", None),
            ("meter_id",        16, "Electricity meter ID (optional)", None),
            ("quantity",        12, "kWh consumed (from bill)", None),
            ("unit",            10, "kWh / MWh / GJ", "elec_units"),
            ("supplier_ef",     14, "Market-based EF kgCO2e/kWh (leave blank if none)", None),
            ("rec_covered",     12, "TRUE if 100% RECs/renewable PPA", "bool_vals"),
            ("residual_mix_ef", 16, "Residual mix EF kgCO2e/kWh (EU/UK only)", None),
        ],
        "example": {
            "site_name": "Head Office Mumbai",
            "meter_id": "MSEDCL-001",
            "quantity": 500000,
            "unit": "kWh",
            "supplier_ef": "",
            "rec_covered": "FALSE",
            "residual_mix_ef": "",
            "reporting_year": 2024,
            "fiscal_year": "2023-24",
            "country": "IN",
            "data_quality": "measured",
            "source_file": "Electricity bills FY2023-24",
        },
    },
    # ── Scope 3 ──────────────────────────────────────────────────────────
    {
        "name": "S3_Cat1_PurchasedGoods",
        "title": "Scope 3 Cat 1 — Purchased Goods & Services",
        "scope": "Scope 3",
        "process": "S3 Cat 1 \u2014 Purchased goods & services (average-data EF per mass/unit)",
        "colour": "636EFA",
        "description": (
            "Cradle-to-gate emissions from goods/services purchased.\n"
            "Method column controls calculation path: average_data / spend_eeio / supplier_specific."
        ),
        "columns": [
            ("supplier_name",  20, "Supplier company name (optional)", None),
            ("item_description",24,"Description of goods/services", None),
            ("fuel_or_item",   20, "Material/category key for EF lookup", "goods_types"),
            ("quantity",       12, "Mass, units, or spend amount", None),
            ("unit",           10, "kg / t / USD / INR / unit", "goods_units"),
            ("method",         18, "average_data / spend_eeio / supplier_specific", "cat1_method"),
            ("supplier_ef",    16, "Supplier EF kgCO2e/unit (for supplier_specific)", None),
            ("fx_to_usd",      12, "FX rate to USD (for spend_eeio; 1.0 if USD)", None),
        ],
        "example": {
            "supplier_name": "Tata Steel",
            "item_description": "Hot rolled coil",
            "fuel_or_item": "steel",
            "quantity": 500,
            "unit": "t",
            "method": "average_data",
            "supplier_ef": "",
            "fx_to_usd": "",
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "estimated",
            "source_file": "Procurement spend FY2023-24",
        },
    },
    {
        "name": "S3_Cat4_UpstreamTransport",
        "title": "Scope 3 Cat 4 — Upstream Transport",
        "scope": "Scope 3",
        "process": "S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
        "colour": "636EFA",
        "description": (
            "Third-party transport of purchased goods from supplier to your sites.\n"
            "Input either tonne-km directly, OR weight + distance separately."
        ),
        "columns": [
            ("fuel_or_item",   16, "Transport mode: truck / rail / ship / air", "transport_modes"),
            ("quantity",       12, "tonne-km (if unit=tonne-km) or distance", None),
            ("unit",           14, "tonne-km / km / miles", "transport_units"),
            ("weight",         12, "Cargo weight (if distance-based)", None),
            ("weight_unit",    12, "t / kg / lt (for weight column)", "weight_units"),
            ("route",          24, "Route description e.g. Chennai -> Mumbai (optional)", None),
        ],
        "example": {
            "fuel_or_item": "truck",
            "quantity": 50000,
            "unit": "tonne-km",
            "weight": "",
            "weight_unit": "",
            "route": "Supplier -> Mumbai warehouse",
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "estimated",
            "source_file": "Logistics invoices",
        },
    },
    {
        "name": "S3_Cat5_Waste",
        "title": "Scope 3 Cat 5 — Waste in Operations",
        "scope": "Scope 3",
        "process": "S3 Cat 5 \u2014 Waste generated in operations (waste-type-specific)",
        "colour": "636EFA",
        "description": (
            "Waste generated at company sites, treated by third parties.\n"
            "Use treatment key in fuel_or_item: landfill_msw, recycling_paper, incineration_msw etc."
        ),
        "columns": [
            ("waste_description", 24, "Description of waste stream", None),
            ("fuel_or_item",      22, "Treatment type key", "waste_treatments"),
            ("quantity",          12, "Mass of waste", None),
            ("unit",              10, "t / kg / kt", "mass_units"),
            ("waste_contractor",  22, "Name of waste handler (optional)", None),
        ],
        "example": {
            "waste_description": "General office waste to landfill",
            "fuel_or_item": "landfill_msw",
            "quantity": 10,
            "unit": "t",
            "waste_contractor": "ABC Waste Management",
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "estimated",
            "source_file": "Waste manifests FY2023-24",
        },
    },
    {
        "name": "S3_Cat6_BusinessTravel",
        "title": "Scope 3 Cat 6 — Business Travel",
        "scope": "Scope 3",
        "process": "S3 Cat 6 \u2014 Business travel (distance-based passenger-km + hotels)",
        "colour": "636EFA",
        "description": (
            "Employee travel for business purposes.\n"
            "Flights: enter one-way distance in km or total passenger-km.\n"
            "Hotels: quantity = nights, unit = nights."
        ),
        "columns": [
            ("traveller_id",   14, "Employee ID (anonymised, optional)", None),
            ("fuel_or_item",   26, "Travel mode / class", "travel_modes"),
            ("quantity",       12, "Distance km or nights (for hotel)", None),
            ("unit",           16, "km / miles / passenger-km / nights", "travel_units"),
            ("destination",    22, "City/country of destination (optional)", None),
            ("rf_factor",      10, "Radiative forcing multiplier (1.0 = CO2 only)", None),
        ],
        "example": {
            "traveller_id": "EMP001",
            "fuel_or_item": "flight_long_haul_economy",
            "quantity": 8000,
            "unit": "km",
            "destination": "London",
            "rf_factor": 1.0,
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "measured",
            "source_file": "Travel expense claims",
        },
    },
    {
        "name": "S3_Cat7_Commuting",
        "title": "Scope 3 Cat 7 — Employee Commuting",
        "scope": "Scope 3",
        "process": "S3 Cat 7 \u2014 Employee commuting (distance-based)",
        "colour": "636EFA",
        "description": (
            "Emissions from employees commuting to/from work.\n"
            "Distance-based: employee-km per mode from survey data.\n"
            "Average-data: enter employee count, method=average_data."
        ),
        "columns": [
            ("fuel_or_item",    20, "Commute mode", "commute_modes"),
            ("quantity",        14, "Total employee-km OR number of employees", None),
            ("unit",            18, "employee-km / employees", "commute_units"),
            ("method",          18, "distance_based / average_data", "commute_method"),
            ("telework_pct",    14, "% of working days working from home (0-100)", None),
            ("working_days",    14, "Working days per year (default 220)", None),
        ],
        "example": {
            "fuel_or_item": "car_average",
            "quantity": 1000000,
            "unit": "employee-km",
            "method": "distance_based",
            "telework_pct": 20,
            "working_days": 220,
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "estimated",
            "source_file": "Employee commute survey 2024",
        },
    },
    {
        "name": "S3_Cat8_LeasedAssets",
        "title": "Scope 3 Cat 8 — Upstream Leased Assets",
        "scope": "Scope 3",
        "process": "S3 Cat 8 \u2014 Upstream leased assets (buildings, avg EF by floor area)",
        "colour": "636EFA",
        "description": (
            "Buildings/spaces leased by the company where the LESSOR controls energy.\n"
            "Enter floor area in m2 and building type."
        ),
        "columns": [
            ("asset_name",       22, "Name or address of leased asset", None),
            ("fuel_or_item",     18, "Building type", "building_types"),
            ("quantity",         12, "Floor area (m2) or energy (kWh)", None),
            ("unit",             10, "m2 / kWh / MWh", "leased_units"),
            ("time_fraction",    14, "Fraction of year leased (1.0 = full year)", None),
            ("lessor_name",      20, "Landlord/lessor name (optional)", None),
        ],
        "example": {
            "asset_name": "Nariman Point Office",
            "fuel_or_item": "office",
            "quantity": 2000,
            "unit": "m2",
            "time_fraction": 1.0,
            "lessor_name": "XYZ Properties",
            "reporting_year": 2024,
            "country": "IN",
            "data_quality": "estimated",
            "source_file": "Lease agreements",
        },
    },
]

# ---------------------------------------------------------------------------
# Dropdown value lists
# ---------------------------------------------------------------------------

DROPDOWNS = {
    "country": [
        "IN", "US", "GB", "DE", "AU", "JP", "BR", "ZA", "ID", "CA", "FR",
        "CN", "AE", "SG", "MY", "TH", "PH", "VN", "BD", "LK", "GLOBAL",
    ],
    "data_quality": ["measured", "estimated", "default"],
    "bool_vals":    ["TRUE", "FALSE"],
    "energy_mass_units": [
        "GJ", "TJ", "MWh", "kWh", "t", "kg", "kt", "L", "kL", "m3",
    ],
    "elec_units":   ["kWh", "MWh", "GWh", "GJ", "TJ"],
    "stat_fuels": [
        "natural_gas", "diesel", "diesel_oil", "petrol", "motor_gasoline",
        "coal", "coal_bituminous", "coking_coal", "non_coking_coal",
        "sub_bituminous_coal", "lignite", "fuel_oil", "lpg", "kerosene",
        "wood", "biodiesel", "biogas", "peat",
    ],
    "mobile_vehicles": [
        "petrol_cars", "diesel_cars", "diesel_trucks_heavy", "diesel_buses",
        "jet_fuel_aviation", "marine_fuel_oil", "natural_gas_vehicles",
        "2w", "3w", "mcv", "hcv", "lcv",
    ],
    "mobile_units": ["L", "kL", "km", "miles", "GJ", "TJ", "kg", "t"],
    "refrigerants": [
        "R-410A", "R-32", "HFC-134a", "R-22", "R-404A", "R-407C",
        "R-507A", "SF6", "HFC-23", "R-600a", "R-717", "R-744", "R-1234yf",
    ],
    "fugitive_method":  ["top_up", "equipment_based"],
    "equip_types": [
        "stationary_ac", "chillers", "industrial_refrigeration",
        "commercial_refrigeration", "residential_ac", "heat_pump",
        "transport_refrigeration", "fire_suppression", "sf6_switchgear",
    ],
    "fugitive_subtype": ["refrigerant", "oil_gas", "coal"],
    "goods_types": [
        "steel", "steel_recycled", "aluminium", "aluminium_recycled",
        "copper", "plastic_general", "plastic_pet", "glass", "paper",
        "cardboard", "cement", "electronics", "food_average",
        "chemicals_general", "wood", "cotton", "it_services", "software",
        "consulting", "logistics", "general",
    ],
    "goods_units":  ["kg", "t", "kt", "unit", "USD", "INR", "EUR", "GBP"],
    "cat1_method":  ["average_data", "spend_eeio", "supplier_specific", "hybrid"],
    "transport_modes": [
        "truck", "rail", "ship", "air", "intermodal", "van", "container_ship",
        "bulk_carrier", "airfreight",
    ],
    "transport_units": ["tonne-km", "km", "miles"],
    "weight_units": ["t", "kg", "kt"],
    "waste_treatments": [
        "landfill_msw", "landfill_food", "landfill_paper", "landfill_plastic",
        "incineration_msw", "incineration_hazardous", "composting",
        "anaerobic_digestion", "recycling_paper", "recycling_plastic",
        "recycling_metal", "recycling_mixed", "open_dump", "india_average_mix",
    ],
    "mass_units":   ["t", "kg", "kt"],
    "travel_modes": [
        "flight_domestic", "flight_short_haul_economy", "flight_short_haul_business",
        "flight_long_haul_economy", "flight_long_haul_premium_economy",
        "flight_long_haul_business", "flight_long_haul_first",
        "rail", "car_average", "car_petrol", "car_diesel", "taxi", "bus",
        "electric_car", "hotel", "hotel_uk", "hotel_europe",
        "hotel_north_america", "hotel_asia",
    ],
    "travel_units": ["km", "miles", "passenger-km", "nights"],
    "commute_modes": [
        "car_average", "car_petrol", "car_diesel", "rail", "metro",
        "bus", "motorcycle", "electric_car", "bicycle", "walk",
    ],
    "commute_units":  ["employee-km", "employees"],
    "commute_method": ["distance_based", "average_data", "fuel_based"],
    "building_types": [
        "office", "warehouse", "retail", "data_center",
        "manufacturing", "hotel", "laboratory", "average",
    ],
    "leased_units": ["m2", "m\u00b2", "kWh", "MWh"],
}


# ---------------------------------------------------------------------------
# Style helpers
# ---------------------------------------------------------------------------

def _fill(hex_color: str) -> PatternFill:
    return PatternFill("solid", fgColor=hex_color)

def _font(bold=False, colour="000000", size=10) -> Font:
    return Font(bold=bold, color=colour, size=size, name="Calibri")

def _border_thin() -> Border:
    s = Side(style="thin", color=GREY_MID)
    return Border(left=s, right=s, top=s, bottom=s)

def _center() -> Alignment:
    return Alignment(horizontal="center", vertical="center", wrap_text=True)

def _left() -> Alignment:
    return Alignment(horizontal="left", vertical="center", wrap_text=True)


# ---------------------------------------------------------------------------
# Build workbook
# ---------------------------------------------------------------------------

def generate_template(output_path: str | None = None) -> Path:
    """
    Generate the master activity upload Excel template.

    Returns the path to the generated file.
    """
    if output_path is None:
        output_path = Path(__file__).parent / "GHG_Activity_Upload_Template.xlsx"
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    wb = openpyxl.Workbook()
    wb.remove(wb.active)   # remove default sheet

    # ── Build dropdown validation sheet (hidden) ─────────────────────────
    dv_sheet = wb.create_sheet("__dropdowns__")
    dv_sheet.sheet_state = "hidden"
    dv_col_map: dict[str, str] = {}    # key -> "Sheet!$A$2:$A$99"

    for col_idx, (key, values) in enumerate(DROPDOWNS.items(), start=1):
        col_letter = get_column_letter(col_idx)
        dv_sheet.cell(1, col_idx, key)
        dv_col_map[key] = (
            f"'__dropdowns__'!${col_letter}$2:${col_letter}${len(values)+1}"
        )
        for row_idx, val in enumerate(values, start=2):
            dv_sheet.cell(row_idx, col_idx, val)

    # ── Build Instructions sheet ─────────────────────────────────────────
    inst = wb.create_sheet("INSTRUCTIONS", 0)
    inst.sheet_view.showGridLines = False
    inst.column_dimensions["A"].width = 18
    inst.column_dimensions["B"].width = 80

    _write_instructions(inst)

    # ── Build one tab per category ────────────────────────────────────────
    for tab_def in TABS:
        _build_tab(wb, tab_def, dv_col_map)

    wb.save(str(output_path))
    print(f"[OK] Template written: {output_path}")
    return output_path


def _write_instructions(ws):
    """Write the INSTRUCTIONS sheet."""
    ws.merge_cells("A1:B1")
    cell = ws["A1"]
    cell.value = "GHG Emissions Calculator — Activity Data Upload Template"
    cell.font = Font(bold=True, size=16, color=GREEN_DARK, name="Calibri")
    cell.fill = _fill(GREEN_LIGHT)
    cell.alignment = _left()
    ws.row_dimensions[1].height = 32

    instructions = [
        ("How to use this template", ""),
        ("Step 1", "Go to the tab for the scope/category you want to enter data for (e.g. S1_Stationary, S3_Cat6_BusinessTravel)."),
        ("Step 2", "Fill in your activity data starting from row 5 (below the example row in grey). Do not modify rows 1-4."),
        ("Step 3", "The 'fuel_or_item' and 'unit' columns have dropdown lists — use these to ensure consistent values."),
        ("Step 4", "Save this file and upload it via the sk.lite app (Scope 1/2/3 pages > CSV Upload tab)."),
        ("Step 5", "The app will calculate emissions for each row and save them to the inventory."),
        ("", ""),
        ("Column colour coding", ""),
        ("Green header",    "Required column — must be filled for calculation to succeed."),
        ("Amber header",    "Optional but recommended — improves data quality rating."),
        ("Grey header",     "Optional — for reference/audit trail only."),
        ("", ""),
        ("Notes", ""),
        ("Fuel keys",       "Fuel/material values must match exactly. Use the dropdown list. Full list: natural_gas, diesel_oil, motor_gasoline, coal_bituminous, lpg, etc."),
        ("Units",           "Enter quantities in the unit you have them in. The app converts automatically using IPCC 2019 NCV/density values."),
        ("Country codes",   "Use ISO alpha-2 codes: IN=India, US=USA, GB=UK, DE=Germany, GLOBAL=global average."),
        ("Data quality",    "measured=direct meter/bill data. estimated=calculated from proxies. default=industry average."),
        ("Fiscal year",     "Required for India electricity (Scope 2). Format: YYYY-YY e.g. 2023-24."),
    ]

    for r_idx, (label, text) in enumerate(instructions, start=2):
        ws.row_dimensions[r_idx].height = 28 if text else 10
        a = ws.cell(r_idx, 1, label)
        b = ws.cell(r_idx, 2, text)
        if label and not text:
            a.font = Font(bold=True, color=GREEN_DARK, size=11, name="Calibri")
            a.fill = _fill(GREEN_LIGHT)
        else:
            a.font = _font(bold=True, colour=GREY_MID)
            b.font = _font()
            b.alignment = _left()


def _build_tab(wb, tab_def: dict, dv_col_map: dict):
    """Build one category tab."""
    ws = wb.create_sheet(tab_def["name"])
    ws.sheet_view.showGridLines = False

    tab_colour = tab_def["colour"]
    ws.sheet_properties.tabColor = tab_colour

    # All columns = category-specific + common columns
    all_cols = tab_def["columns"] + _COMMON_COLS
    n_cols = len(all_cols)

    # ── Row 1: Title bar ─────────────────────────────────────────────────
    ws.merge_cells(f"A1:{get_column_letter(n_cols)}1")
    title_cell = ws["A1"]
    title_cell.value = tab_def["title"]
    title_cell.font = Font(bold=True, size=13, color=WHITE, name="Calibri")
    title_cell.fill = _fill(tab_colour)
    title_cell.alignment = _left()
    ws.row_dimensions[1].height = 26

    # ── Row 2: Process name and description ──────────────────────────────
    ws.merge_cells(f"A2:{get_column_letter(n_cols)}2")
    desc_cell = ws["A2"]
    desc_cell.value = tab_def["description"]
    desc_cell.font = _font(colour="555555", size=9)
    desc_cell.fill = _fill(GREY_LIGHT)
    desc_cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws.row_dimensions[2].height = 36

    # ── Row 3: Column headers ─────────────────────────────────────────────
    REQUIRED_COLS = {"fuel_or_item", "quantity", "unit", "reporting_year"}
    for c_idx, (col_name, col_width, col_desc, col_dv) in enumerate(all_cols, start=1):
        cell = ws.cell(3, c_idx, col_name)
        is_req = col_name in REQUIRED_COLS
        cell.font = Font(bold=True, size=10, color=WHITE, name="Calibri")
        cell.fill = _fill(GREEN_HEADER if is_req else TEAL)
        cell.alignment = _center()
        cell.border = _border_thin()
        ws.column_dimensions[get_column_letter(c_idx)].width = col_width
    ws.row_dimensions[3].height = 22

    # ── Row 4: Column descriptions ────────────────────────────────────────
    for c_idx, (col_name, col_width, col_desc, col_dv) in enumerate(all_cols, start=1):
        cell = ws.cell(4, c_idx, col_desc)
        cell.font = _font(colour="666666", size=8)
        cell.fill = _fill(BLUE_LIGHT)
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        cell.border = _border_thin()
    ws.row_dimensions[4].height = 36

    # ── Row 5: Example row ────────────────────────────────────────────────
    example = tab_def.get("example", {})
    for c_idx, (col_name, _, _, _) in enumerate(all_cols, start=1):
        val = example.get(col_name, "")
        cell = ws.cell(5, c_idx, val)
        cell.font = _font(colour="555555", size=9)
        cell.fill = _fill(AMBER_LIGHT)
        cell.alignment = _left()
        cell.border = _border_thin()
    # Mark example row
    ws.cell(5, 1).value = ("← EXAMPLE (delete before uploading) — "
                           + str(example.get(all_cols[0][0], "")))
    ws.row_dimensions[5].height = 18

    # ── Rows 6-55: Blank data rows ────────────────────────────────────────
    for row_idx in range(6, 56):
        alt = row_idx % 2 == 0
        for c_idx in range(1, n_cols + 1):
            cell = ws.cell(row_idx, c_idx)
            cell.fill = _fill(GREY_LIGHT if alt else WHITE)
            cell.border = _border_thin()
            cell.alignment = _left()
            cell.font = _font(size=10)
        ws.row_dimensions[row_idx].height = 18

    # ── Dropdown validations ──────────────────────────────────────────────
    for c_idx, (col_name, _, _, dv_key) in enumerate(all_cols, start=1):
        if not dv_key or dv_key not in dv_col_map:
            continue
        col_letter = get_column_letter(c_idx)
        dv = DataValidation(
            type="list",
            formula1=dv_col_map[dv_key],
            allow_blank=True,
            showErrorMessage=True,
            errorTitle="Invalid value",
            error=f"Use the dropdown list for column '{col_name}'.",
        )
        dv.sqref = f"{col_letter}5:{col_letter}55"
        ws.add_data_validation(dv)

    # ── Freeze panes ──────────────────────────────────────────────────────
    ws.freeze_panes = "A6"   # freeze title + headers, scroll data rows


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    path_arg = sys.argv[1] if len(sys.argv) > 1 else None
    out = generate_template(output_path=path_arg)
    print(f"Template generated: {out}")
    print(f"Tabs: {len(TABS)} category tabs + INSTRUCTIONS")
    print(f"Dropdown lists: {len(DROPDOWNS)} validated fields")
