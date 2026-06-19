"""
Expandable calculation audit trace component.
Renders the full audit_trace dict from EmissionResult in a readable Streamlit expander.
"""
import streamlit as st
from modules.base import EmissionResult


def calc_trace(result: EmissionResult, label: str = "Calculation trace") -> None:
    """
    Render the full audit trail for one EmissionResult in a Streamlit expander.
    """
    with st.expander(f"🔍 {label} — {result.t_CO2e:.4f} tCO₂e", expanded=False):
        trace = result.audit_trace
        if not trace:
            st.caption("No audit trace available.")
            return

        # ── Inputs ──────────────────────────────────────────────────────
        st.markdown("**Inputs**")
        inputs = trace.get("inputs", {})
        cols = st.columns(3)
        items = list(inputs.items())
        for i, (k, v) in enumerate(items):
            cols[i % 3].metric(k.replace("_", " ").title(), str(v))

        # ── Unit conversions ─────────────────────────────────────────────
        conversions = trace.get("conversions", [])
        if conversions:
            st.markdown("**Unit conversions**")
            for step in conversions:
                note = f" _{step.get('note', '')}_" if step.get("note") else ""
                st.markdown(f"- **{step['label']}**: `{step['value']}`{note}")

        # ── EF lookup ────────────────────────────────────────────────────
        ef_lookup = trace.get("ef_lookup", {})
        if ef_lookup:
            st.markdown("**Emission factors used**")
            for gas, info in ef_lookup.items():
                if isinstance(info, dict) and info.get("factor_id"):
                    fl = info.get("fallback", "")
                    st.markdown(
                        f"- **{gas}**: `{info.get('value', '')}` "
                        f"— `{info['factor_id']}` "
                        f"{'_(fallback: ' + fl + ')_' if fl else ''}"
                    )

        # ── Calculation steps ─────────────────────────────────────────────
        calc_steps = trace.get("calculation", [])
        if calc_steps:
            st.markdown("**Calculation steps**")
            for step in calc_steps:
                note = f" _{step.get('note', '')}_" if step.get("note") else ""
                st.markdown(f"- **{step['label']}**: `{step['value']}`{note}")

        # ── GWP ─────────────────────────────────────────────────────────
        gwp = trace.get("gwp", {})
        if gwp:
            st.markdown(
                f"**GWP** (IPCC AR{gwp.get('ar','?')}): "
                f"CH₄={gwp.get('CH4_fossil','?')}, N₂O={gwp.get('N2O','?')}"
            )

        # ── Result ───────────────────────────────────────────────────────
        res = trace.get("result", {})
        if res:
            st.markdown("**Result**")
            rc = st.columns(4)
            rc[0].metric("CO₂ (kg)", f"{res.get('kg_CO2', res.get('kg_CO2_fossil', 0)):.2f}")
            rc[1].metric("CH₄ (kg)", f"{res.get('kg_CH4', 0):.4f}")
            rc[2].metric("N₂O (kg)", f"{res.get('kg_N2O', 0):.4f}")
            rc[3].metric("tCO₂e", f"{res.get('t_CO2e', res.get('kg_CO2e', 0)/1000):.4f}")

        # ── Biogenic note ────────────────────────────────────────────────
        bio = trace.get("biogenic_note")
        if bio:
            st.info(f"🌿 {bio}")

        # ── Dual reporting (S2) ──────────────────────────────────────────
        dual = trace.get("dual_reporting", {})
        if dual:
            st.markdown("**Dual reporting (Scope 2)**")
            d1, d2 = st.columns(2)
            d1.metric("Location-based (tCO₂e)",
                      f"{(dual.get('location_based_t_co2e') or 0):.4f}")
            mb = dual.get("market_based_t_co2e")
            d2.metric("Market-based (tCO₂e)",
                      f"{mb:.4f}" if mb is not None else "Not provided")
            if dual.get("market_based_note"):
                st.caption(dual["market_based_note"])

        # ── Methodology footnote ─────────────────────────────────────────
        method = trace.get("methodology", "")
        if method:
            st.caption(f"📖 {method}")


# Alias for backwards compatibility and descriptive naming
render_calc_trace = calc_trace
