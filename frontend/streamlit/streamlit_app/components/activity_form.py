"""
Reusable activity data entry form.
Generates N rows of activity inputs dynamically (pattern from Carbon-Tool/Eolos).
Each row calls engine.calculate() live and shows the result inline.
"""
import streamlit as st
import sqlite3
from typing import Optional

from modules.base import ActivityRecord, EmissionResult
from core.engine import calculate
from streamlit_app.components.calc_trace import calc_trace
from streamlit_app.components.ef_badge import ef_badge


def activity_row(
    key_prefix: str,
    scope: str,
    process: str,
    fuel_options: list[str],
    unit_options: list[str],
    conn: sqlite3.Connection,
    org_profile: dict,
    extra_fields: Optional[dict] = None,
) -> Optional[tuple[ActivityRecord, EmissionResult]]:
    """
    Render one activity data entry row and calculate emissions live.

    Returns (ActivityRecord, EmissionResult) on success, None if inputs incomplete.
    """
    profile = org_profile
    gwp_ar = profile.get("gwp_ar", 6)
    country = profile.get("primary_country", "IN")
    reporting_year = profile.get("reporting_year", 2024)
    fiscal_year = profile.get("fiscal_year", "2023-24")

    c1, c2, c3, c4, c5 = st.columns([2, 1.2, 1, 1.5, 1.8])

    with c1:
        fuel = st.selectbox("Fuel / Item", fuel_options,
                            key=f"{key_prefix}_fuel", label_visibility="collapsed")
    with c2:
        qty = st.number_input("Quantity", min_value=0.0, value=0.0,
                              format="%.4f", key=f"{key_prefix}_qty",
                              label_visibility="collapsed")
    with c3:
        unit = st.selectbox("Unit", unit_options,
                            key=f"{key_prefix}_unit", label_visibility="collapsed")
    with c4:
        country_sel = st.text_input("Country", value=country,
                                    key=f"{key_prefix}_country",
                                    label_visibility="collapsed")
    with c5:
        result_placeholder = st.empty()

    if qty <= 0:
        result_placeholder.caption("Enter quantity →")
        return None

    record = ActivityRecord(
        scope=scope,
        process=process,
        method_variant="",
        country=country_sel or country,
        quantity=qty,
        unit=unit,
        fuel_or_item=fuel,
        reporting_year=reporting_year,
        fiscal_year=fiscal_year,
        gwp_ar=gwp_ar,
        org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
        **(extra_fields or {}),
    )

    try:
        result = calculate(record, conn)
        result_placeholder.metric(
            "tCO₂e",
            f"{result.t_CO2e:.4f}",
            delta=None,
        )
        return record, result
    except Exception as e:
        result_placeholder.error(str(e)[:60])
        return None


def activity_table(
    key_prefix: str,
    scope: str,
    process: str,
    fuel_options: list[str],
    unit_options: list[str],
    conn: sqlite3.Connection,
    org_profile: dict,
    label: str = "Activity",
    show_trace: bool = True,
    extra_fields: Optional[dict] = None,
) -> list[tuple[ActivityRecord, EmissionResult]]:
    """
    Render a dynamic table of N activity rows.
    User controls number of rows with a counter.
    Returns list of (record, result) pairs for all completed rows.
    """
    n_key = f"{key_prefix}_n_rows"
    if n_key not in st.session_state:
        st.session_state[n_key] = 1

    col_n, col_add, col_rem = st.columns([2, 1, 1])
    with col_n:
        st.caption(f"{st.session_state[n_key]} row(s)")
    with col_add:
        if st.button("＋ Add row", key=f"{key_prefix}_add"):
            st.session_state[n_key] += 1
            st.rerun()
    with col_rem:
        if st.button("－ Remove", key=f"{key_prefix}_rem",
                     disabled=st.session_state[n_key] <= 1):
            st.session_state[n_key] -= 1
            st.rerun()

    # Column headers
    h1, h2, h3, h4, h5 = st.columns([2, 1.2, 1, 1.5, 1.8])
    h1.caption("Fuel / Item")
    h2.caption("Quantity")
    h3.caption("Unit")
    h4.caption("Country")
    h5.caption("tCO₂e")
    st.divider()

    completed = []
    for i in range(st.session_state[n_key]):
        pair = activity_row(
            key_prefix=f"{key_prefix}_row{i}",
            scope=scope,
            process=process,
            fuel_options=fuel_options,
            unit_options=unit_options,
            conn=conn,
            org_profile=org_profile,
            extra_fields=extra_fields,
        )
        if pair:
            completed.append(pair)
            if show_trace:
                calc_trace(pair[1], label=f"{label} row {i+1}")

    if completed:
        total = sum(r.t_CO2e for _, r in completed)
        st.metric(f"**{label} subtotal**", f"{total:.4f} tCO₂e")

    return completed


def csv_upload_handler(
    key: str,
    scope: str,
    process: str,
    conn: sqlite3.Connection,
    org_profile: dict,
    required_cols: list[str],
    fuel_col: str = "fuel_or_item",
    qty_col: str = "quantity",
    unit_col: str = "unit",
    country_col: str = "country",
) -> list[tuple[ActivityRecord, EmissionResult]]:
    """
    Handle bulk CSV upload. Validates required columns then batch-calculates.
    Returns list of (record, result) pairs.
    """
    import pandas as pd

    uploaded = st.file_uploader(
        "Upload CSV", type=["csv"], key=f"{key}_upload",
        help=f"Required columns: {', '.join(required_cols)}"
    )
    if not uploaded:
        return []

    try:
        df = pd.read_csv(uploaded)
    except Exception as e:
        st.error(f"Could not read CSV: {e}")
        return []

    # Validate columns
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        st.error(f"Missing columns: {missing}. Found: {list(df.columns)}")
        return []

    st.success(f"✓ {len(df)} rows loaded")
    st.dataframe(df.head(5), use_container_width=True)

    if not st.button("Calculate all rows", key=f"{key}_calc"):
        return []

    profile = org_profile
    results = []
    errors = []
    progress = st.progress(0)

    for i, row in df.iterrows():
        progress.progress((i + 1) / len(df))
        try:
            record = ActivityRecord(
                scope=scope,
                process=process,
                country=str(row.get(country_col, profile.get("primary_country", "IN"))),
                quantity=float(row[qty_col]),
                unit=str(row[unit_col]),
                fuel_or_item=str(row.get(fuel_col, "")),
                reporting_year=int(row.get("reporting_year", profile.get("reporting_year", 2024))),
                fiscal_year=str(row.get("fiscal_year", profile.get("fiscal_year", ""))),
                gwp_ar=profile.get("gwp_ar", 6),
                org_id=profile.get("org_uuid") or profile.get("org_id") or "default",
                source_file=uploaded.name,
                extra={
                    "site":          str(row.get("site", "") or ""),
                    "department":    str(row.get("department", "") or ""),
                    "cost_centre":   str(row.get("cost_centre", "") or ""),
                    "supplier_name": str(row.get("supplier_name", row.get("supplier", "")) or ""),
                },
            )
            result = calculate(record, conn)
            results.append((record, result))
        except Exception as e:
            errors.append({"row": i + 1, "error": str(e)})

    progress.empty()

    if results:
        total = sum(r.t_CO2e for _, r in results)
        st.success(f"✓ {len(results)} rows calculated — **{total:.4f} tCO₂e** total")
    if errors:
        st.warning(f"⚠️ {len(errors)} rows failed")
        st.dataframe(errors)

    return results
