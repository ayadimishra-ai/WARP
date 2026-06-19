"""
sk.lite — Excel Template Reader.

Reads the multi-sheet GHG_Activity_Upload_Template.xlsx (or any compatible
workbook) and returns validated DataFrames per category tab.

Tab → process name mapping is defined here so the reader knows which
engine process to call for each sheet.

Usage:
    from templates.excel_reader import read_upload_template, TemplateReadError
    result = read_upload_template("path/to/filled_template.xlsx")
    # result: dict[tab_name -> {"df": DataFrame, "process": str, "scope": str, "errors": list}]
"""
from __future__ import annotations
from pathlib import Path
from typing import Optional
import io

try:
    import pandas as pd
    _PANDAS = True
except ImportError:
    _PANDAS = False

try:
    import openpyxl
    _OPENPYXL = True
except ImportError:
    _OPENPYXL = False


class TemplateReadError(Exception):
    pass


# ---------------------------------------------------------------------------
# Tab → engine process mapping
# Must match template tab names and engine registry exactly.
# ---------------------------------------------------------------------------

TAB_CONFIG: dict[str, dict] = {
    "S1_Stationary": {
        "scope":   "Scope 1",
        "process": "S1 \u2014 Stationary combustion (fuel burn)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["equipment_type", "supplier_name", "site_name", "department", "cost_centre"],
    },
    "S1_Mobile": {
        "scope":   "Scope 1",
        "process": "S1 \u2014 Mobile combustion (road)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["vehicle_type", "vehicle_id", "supplier_name", "site_name", "department", "cost_centre"],
    },
    "S1_Fugitive": {
        "scope":   "Scope 1",
        "process": "S1 \u2014 Fugitive emissions (energy)",
        "required": ["fuel_or_item", "quantity"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["method", "equipment_type", "total_charge_kg", "sub_type"],
    },
    "S2_Electricity": {
        "scope":   "Scope 2",
        "process": "S2 \u2014 Purchased electricity (grid)",
        "required": ["quantity", "unit"],
        "fuel_col": None,
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["supplier_ef", "rec_covered", "residual_mix_ef", "meter_id", "supplier_name", "site_name", "department", "cost_centre"],
    },
    "S3_Cat1_PurchasedGoods": {
        "scope":   "Scope 3",
        "process": "S3 Cat 1 \u2014 Purchased goods & services (average-data EF per mass/unit)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["method", "supplier_ef", "fx_to_usd", "item_description", "supplier_name", "site_name", "department", "cost_centre"],
        # method column overrides default process name
        "method_process_map": {
            "average_data":      "S3 Cat 1 \u2014 Purchased goods & services (average-data EF per mass/unit)",
            "spend_eeio":        "S3 Cat 1 \u2014 Purchased goods & services (spend-based EEIO)",
            "supplier_specific": "S3 Cat 1 \u2014 Purchased goods & services (supplier-specific EF)",
            "hybrid":            "S3 Cat 1 \u2014 Purchased goods & services (hybrid: supplier S1+S2 + materials + transport + waste)",
        },
    },
    "S3_Cat4_UpstreamTransport": {
        "scope":   "Scope 3",
        "process": "S3 Cat 4 \u2014 Upstream transport (distance-based tonne-km)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["weight", "weight_unit", "route", "vehicle_type", "supplier_name", "site_name", "department", "cost_centre"],
    },
    "S3_Cat5_Waste": {
        "scope":   "Scope 3",
        "process": "S3 Cat 5 \u2014 Waste generated in operations (waste-type-specific)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["waste_treatment", "supplier_name", "site_name", "department", "cost_centre"],
    },
    "S3_Cat6_BusinessTravel": {
        "scope":   "Scope 3",
        "process": "S3 Cat 6 \u2014 Business travel (distance-based passenger-km + hotels)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["rf_factor", "trip_purpose", "supplier_name", "department", "cost_centre"],
    },
    "S3_Cat7_Commuting": {
        "scope":   "Scope 3",
        "process": "S3 Cat 7 \u2014 Employee commuting (distance-based)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["method", "telework_pct", "working_days", "transport_mode", "department", "cost_centre"],
        "method_process_map": {
            "distance_based": "S3 Cat 7 \u2014 Employee commuting (distance-based)",
            "average_data":   "S3 Cat 7 \u2014 Employee commuting (average-data)",
            "fuel_based":     "S3 Cat 7 \u2014 Employee commuting (fuel-based)",
        },
    },
    "S3_Cat8_LeasedAssets": {
        "scope":   "Scope 3",
        "process": "S3 Cat 8 \u2014 Upstream leased assets (buildings, avg EF by floor area)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["time_fraction", "supplier_name", "site_name", "department", "cost_centre"],
    },
    # ── Additional S3 categories ─────────────────────────────────────────
    "S3_Cat3_UpstreamEnergy": {
        "scope":   "Scope 3",
        "process": "S3 Cat 3 \u2014 WTT upstream of fuel (scope 3 Cat 3A)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["supplier_name", "site_name", "department", "cost_centre"],
    },
    "S3_Cat9_DownstreamTransport": {
        "scope":   "Scope 3",
        "process": "S3 Cat 9 \u2014 Downstream transport (distance-based tonne-km)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["weight", "weight_unit", "route", "supplier_name", "department", "cost_centre"],
    },
    "S3_Cat11_UsedProducts": {
        "scope":   "Scope 3",
        "process": "S3 Cat 11 \u2014 Use of sold products (direct, fuels & feedstocks combustion)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["product_name", "annual_units_sold", "supplier_name", "department", "cost_centre"],
    },
    "S3_Cat15_Investments": {
        "scope":   "Scope 3",
        "process": "S3 Cat 15 \u2014 Financed emissions (PCAF approach 1 — listed equity & debt)",
        "required": ["fuel_or_item", "quantity", "unit"],
        "fuel_col": "fuel_or_item",
        "qty_col":  "quantity",
        "unit_col": "unit",
        "country_col": "country",
        "extra_cols": ["company_name", "outstanding_amount", "evic", "pcaf_score",
                       "supplier_name", "department", "cost_centre"],
    },
}

# Sheets to always skip
_SKIP_SHEETS = {"INSTRUCTIONS", "__dropdowns__"}

# Row offset: template has 4 header rows (title, desc, col headers, col desc)
# Data starts at row 5 (index 4 in pandas 0-based, but we read with header=2)
_HEADER_ROW   = 2   # 0-indexed row of column names (row 3 in Excel)
_DATA_START   = 4   # 0-indexed first data row (row 5 in Excel = example)
_EXAMPLE_ROW  = 4   # 0-indexed — skip this row (it's the amber example)


def read_upload_template(
    file_path: str | Path | io.BytesIO,
    default_country: str = "IN",
    default_reporting_year: int = 2024,
    default_fiscal_year: str = "2023-24",
    default_gwp_ar: int = 6,
    skip_example_row: bool = True,
) -> dict[str, dict]:
    """
    Read a filled GHG activity upload template (.xlsx).

    Args:
        file_path:            path to .xlsx file OR BytesIO object (from Streamlit uploader)
        default_country:      fallback country if column empty
        default_reporting_year: fallback year
        default_fiscal_year:  fallback fiscal year
        default_gwp_ar:       GWP AR vintage to use

    Returns:
        dict keyed by tab name:
        {
            "tab_name": {
                "scope":   str,
                "process": str,
                "df":      DataFrame (cleaned, non-empty rows only),
                "config":  dict (TAB_CONFIG entry),
                "errors":  list[str],
                "n_rows":  int,
            }
        }

    Only tabs with data rows (quantity > 0) are returned.
    """
    if not _PANDAS:
        raise TemplateReadError("pandas is required: pip install pandas")
    if not _OPENPYXL:
        raise TemplateReadError("openpyxl is required: pip install openpyxl")

    # Load workbook
    try:
        if isinstance(file_path, (str, Path)):
            wb = openpyxl.load_workbook(str(file_path), read_only=True, data_only=True)
        else:
            wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    except Exception as e:
        raise TemplateReadError(f"Cannot open file: {e}")

    sheet_names = [s for s in wb.sheetnames if s not in _SKIP_SHEETS]

    results: dict[str, dict] = {}

    for sheet_name in sheet_names:
        cfg = TAB_CONFIG.get(sheet_name)
        if cfg is None:
            continue   # unknown tab — skip silently

        ws = wb[sheet_name]
        errors: list[str] = []

        # Read into DataFrame using openpyxl row iteration
        # Row 3 (index 2) = column headers
        # Row 5+ (index 4+) = data (row 5 is example, rows 6-55 are blank/data)
        rows = list(ws.iter_rows(values_only=True))
        if len(rows) < _HEADER_ROW + 1:
            continue

        headers = [str(h).strip() if h is not None else f"col_{i}"
                   for i, h in enumerate(rows[_HEADER_ROW])]

        # Data rows: skip example row (index 4), take rows 5+
        data_rows = rows[_DATA_START + 1:]   # +1 to skip example

        if not data_rows:
            continue

        df = pd.DataFrame(data_rows, columns=headers)

        # Drop completely empty rows
        df = df.dropna(how="all")

        # Normalise qty column
        qty_col = cfg["qty_col"]
        if qty_col not in df.columns:
            errors.append(f"Missing required column '{qty_col}'")
            continue

        df[qty_col] = pd.to_numeric(df[qty_col], errors="coerce")
        df = df[df[qty_col].notna() & (df[qty_col] > 0)]

        if df.empty:
            continue   # no data in this tab

        # Fill defaults for missing columns
        country_col = cfg.get("country_col", "country")
        if country_col in df.columns:
            df[country_col] = df[country_col].fillna(default_country).replace("", default_country)
        else:
            df[country_col] = default_country

        if "reporting_year" in df.columns:
            df["reporting_year"] = pd.to_numeric(
                df["reporting_year"], errors="coerce"
            ).fillna(default_reporting_year).astype(int)
        else:
            df["reporting_year"] = default_reporting_year

        if "fiscal_year" in df.columns:
            df["fiscal_year"] = df["fiscal_year"].fillna(default_fiscal_year).replace("", default_fiscal_year)
        else:
            df["fiscal_year"] = default_fiscal_year

        # Unit defaults
        unit_col = cfg.get("unit_col", "unit")
        if unit_col not in df.columns:
            df[unit_col] = "t"   # safe default for mass-based categories
        else:
            df[unit_col] = df[unit_col].fillna("kg").replace("", "kg")

        # fuel_or_item
        fuel_col = cfg.get("fuel_col")
        if fuel_col and fuel_col in df.columns:
            df[fuel_col] = df[fuel_col].fillna("").astype(str).str.strip()

        # Validate required columns
        for req in cfg["required"]:
            if req not in df.columns:
                errors.append(f"Required column '{req}' is missing from tab '{sheet_name}'")

        results[sheet_name] = {
            "scope":   cfg["scope"],
            "process": cfg["process"],
            "config":  cfg,
            "df":      df.reset_index(drop=True),
            "errors":  errors,
            "n_rows":  len(df),
        }

    wb.close()
    return results


def build_activity_records(
    tab_result: dict,
    org_id: str = "default",
    gwp_ar: int = 6,
) -> list:
    """
    Convert a tab result dict into a list of ActivityRecord objects.

    Args:
        tab_result: single entry from read_upload_template() output
        org_id:     organisation identifier
        gwp_ar:     GWP AR vintage

    Returns:
        list of ActivityRecord objects ready for engine.calculate()
    """
    import uuid
    from modules.base import ActivityRecord

    cfg     = tab_result["config"]
    df      = tab_result["df"]
    scope   = tab_result["scope"]
    default_process = tab_result["process"]
    method_map = cfg.get("method_process_map", {})

    records = []
    for _, row in df.iterrows():
        # Determine process (may be overridden by method column)
        process = default_process
        if method_map and "method" in df.columns:
            m = str(row.get("method", "")).strip().lower()
            process = method_map.get(m, default_process)

        # Build extra dict from extra_cols
        extra: dict = {}
        for extra_col in cfg.get("extra_cols", []):
            val = row.get(extra_col)
            if val is not None and str(val).strip() not in ("", "nan", "None"):
                # Type coercions
                if extra_col in ("telework_pct", "working_days", "time_fraction",
                                  "rf_factor", "fx_to_usd", "total_charge_kg"):
                    try:
                        extra[extra_col] = float(val)
                    except (ValueError, TypeError):
                        pass
                elif extra_col == "rec_covered":
                    extra[extra_col] = str(val).upper() == "TRUE"
                elif extra_col == "weight":
                    try:
                        extra["weight"] = float(val)
                    except (ValueError, TypeError):
                        pass
                elif extra_col == "weight_unit":
                    extra["weight_unit"] = str(val).strip()
                elif extra_col == "residual_mix_ef":
                    try:
                        extra["residual_mix_ef"] = float(val)
                    except (ValueError, TypeError):
                        pass
                else:
                    extra[extra_col] = str(val).strip()

        # Alias: site_name column → 'site' key (schema column name)
        if "site_name" in extra and "site" not in extra:
            extra["site"] = extra.pop("site_name")
        elif "site_name" in extra:
            extra.pop("site_name")

        fuel_col = cfg.get("fuel_col")
        fuel_val = str(row.get(fuel_col, "")).strip() if fuel_col else None

        # supplier_ef (for Cat1 supplier_specific and S2 market-based)
        sup_ef = None
        if "supplier_ef" in df.columns:
            try:
                v = row.get("supplier_ef")
                if v is not None and str(v).strip() not in ("", "nan"):
                    sup_ef = float(v)
            except (ValueError, TypeError):
                pass

        country_col = cfg.get("country_col", "country")
        record = ActivityRecord(
            record_id=str(uuid.uuid4()),
            org_id=org_id,
            scope=scope,
            process=process,
            country=str(row.get(country_col, "IN")).strip() or "IN",
            quantity=float(row[cfg["qty_col"]]),
            unit=str(row.get(cfg["unit_col"], "t")).strip(),
            fuel_or_item=fuel_val if fuel_val else None,
            reporting_year=int(row.get("reporting_year", 2024)),
            fiscal_year=str(row.get("fiscal_year", "2023-24")).strip(),
            gwp_ar=gwp_ar,
            supplier_ef_value=sup_ef,
            data_quality=str(row.get("data_quality", "estimated")).strip(),
            source_file=str(row.get("source_file", "")).strip() or None,
            extra=extra,
        )
        records.append(record)

    return records
