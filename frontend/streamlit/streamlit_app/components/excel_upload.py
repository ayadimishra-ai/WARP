"""
Streamlit component: Excel bulk upload.

Renders an expander that accepts the filled GHG_Activity_Upload_Template.xlsx,
shows a preview per category tab, then bulk-calculates and saves to inventory.

Usage (add to top of any scope/category page):
    from streamlit_app.components.excel_upload import excel_bulk_upload
    excel_bulk_upload(conn, inventory, profile)
"""
from __future__ import annotations
import streamlit as st
import sqlite3


def excel_bulk_upload(
    conn: sqlite3.Connection,
    inventory,
    profile: dict,
    label: str = "Bulk upload from Excel template",
) -> int:
    """
    Render the Excel bulk upload expander.

    Returns the number of records successfully saved to inventory.
    Call this at the top of any page that accepts activity data.
    """
    saved_count = 0

    with st.expander(f"📤 {label}", expanded=False):
        st.caption(
            "Upload the filled **GHG_Activity_Upload_Template.xlsx** to process all "
            "categories at once. Download the blank template from the **Export** page."
        )

        col_up, col_info = st.columns([2, 3])
        with col_up:
            uploaded = st.file_uploader(
                "Choose filled template",
                type=["xlsx", "xls"],
                key="excel_bulk_uploader",
                label_visibility="collapsed",
            )
        with col_info:
            st.markdown(
                "**Supported tabs:** S1_Stationary, S1_Mobile, S1_Fugitive, "
                "S2_Electricity, S3_Cat1–8 \n"
                "**Row 5** = example (ignored). **Rows 6–55** = your data."
            )

        if not uploaded:
            return 0

        # Parse the workbook
        try:
            from templates.excel_reader import read_upload_template, build_activity_records
            tab_results = read_upload_template(
                uploaded,
                default_country=profile.get("primary_country", "IN"),
                default_reporting_year=profile.get("reporting_year", 2024),
                default_fiscal_year=profile.get("fiscal_year", "2023-24"),
                default_gwp_ar=profile.get("gwp_ar", 6),
            )
        except Exception as e:
            st.error(f"Could not read template: {e}")
            return 0

        if not tab_results:
            st.warning("No data found in any tab. Fill in at least one category tab.")
            return 0

        # Show summary of what was found
        total_rows = sum(v["n_rows"] for v in tab_results.values())
        st.success(
            f"Found **{total_rows} data rows** across "
            f"**{len(tab_results)} tab(s)**: "
            + ", ".join(f"{k} ({v['n_rows']})" for k, v in tab_results.items())
        )

        # Per-tab preview and error display
        all_errors = []
        for tab_name, result in tab_results.items():
            with st.expander(
                f"📋 {tab_name} — {result['n_rows']} rows | {result['scope']}",
                expanded=False,
            ):
                if result["errors"]:
                    for err in result["errors"]:
                        st.warning(f"⚠️ {err}")
                    all_errors.extend(result["errors"])

                # Show dataframe preview (key columns only)
                df = result["df"]
                cfg = result["config"]
                preview_cols = [
                    c for c in [
                        cfg.get("fuel_col"), cfg.get("qty_col"), cfg.get("unit_col"),
                        cfg.get("country_col", "country"), "reporting_year",
                        "data_quality", "source_file",
                    ] if c and c in df.columns
                ]
                st.dataframe(
                    df[preview_cols].head(10),
                    use_container_width=True,
                    hide_index=True,
                )
                if len(df) > 10:
                    st.caption(f"Showing 10 of {len(df)} rows")

        if all_errors:
            st.error(
                f"{len(all_errors)} validation error(s) found. "
                "Fix them in the template and re-upload."
            )
            return 0

        # Calculate and save
        st.markdown("---")
        col_calc, col_dry = st.columns([1, 1])
        run_calc = col_calc.button(
            f"⚡ Calculate & save all {total_rows} rows",
            type="primary",
            key="excel_bulk_calc",
        )
        dry_run = col_dry.button(
            "🔍 Preview only (no save)",
            key="excel_bulk_dry",
        )

        if not run_calc and not dry_run:
            return 0

        from core.engine import calculate
        from modules.base import ActivityRecord

        org_id = profile.get("org_uuid") or profile.get("org_id") or "default"
        gwp_ar = profile.get("gwp_ar", 6)
        inv_year = profile.get("reporting_year", 2024)

        progress = st.progress(0)
        status_ph = st.empty()

        results_all: list[tuple[ActivityRecord, object]] = []
        errors_all: list[dict] = []
        processed = 0

        for tab_name, result in tab_results.items():
            status_ph.caption(f"Calculating {tab_name}...")
            records = build_activity_records(result, org_id=org_id, gwp_ar=gwp_ar)

            for record in records:
                try:
                    em_result = calculate(record, conn)
                    results_all.append((record, em_result))
                except Exception as e:
                    errors_all.append({
                        "tab": tab_name,
                        "fuel": record.fuel_or_item,
                        "qty": record.quantity,
                        "unit": record.unit,
                        "error": str(e)[:80],
                    })
                processed += 1
                progress.progress(processed / total_rows)

        progress.empty()
        status_ph.empty()

        # Show results summary
        n_ok  = len(results_all)
        n_err = len(errors_all)
        total_t = sum(r.t_CO2e for _, r in results_all)

        if n_ok:
            st.success(
                f"✓ **{n_ok} rows calculated** — "
                f"**{total_t:,.3f} tCO₂e** total"
            )

        if n_err:
            st.warning(f"⚠️ {n_err} rows failed:")
            import pandas as pd
            st.dataframe(pd.DataFrame(errors_all), use_container_width=True)

        # Breakdown by scope
        if results_all:
            import pandas as pd
            breakdown = {}
            for rec, res in results_all:
                scope = rec.scope
                breakdown.setdefault(scope, {"n": 0, "t": 0.0})
                breakdown[scope]["n"] += 1
                breakdown[scope]["t"] += res.t_CO2e

            bd_df = pd.DataFrame([
                {"Scope": s, "Records": v["n"], "tCO₂e": round(v["t"], 4)}
                for s, v in sorted(breakdown.items())
            ])
            st.dataframe(bd_df, use_container_width=True, hide_index=True)

        # Save
        if run_calc and n_ok > 0:
            written = inventory.persist_batch(
                [r for _, r in results_all],
                [rec for rec, _ in results_all],
                inventory_year=inv_year,
            )
            saved_count = written
            st.success(f"💾 **{written} records saved to inventory** for {inv_year}.")

        elif dry_run and n_ok > 0:
            st.info(
                f"Dry run: {n_ok} rows would be saved. "
                "Click 'Calculate & save' to commit."
            )

    return saved_count
