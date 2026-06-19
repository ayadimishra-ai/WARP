"""
EF quality badge component.
Shows data quality level as a coloured label in Streamlit.
"""
import streamlit as st

_COLOURS = {
    "supplier":    ("🟢", "green",  "Supplier-specific"),
    "national":    ("🟢", "green",  "National EF"),
    "regional":    ("🟡", "orange", "Regional EF"),
    "continental": ("🟠", "orange", "Continental EF"),
    "global":      ("🔴", "red",    "Global default"),
    "unknown":     ("⚪", "grey",   "Unknown"),
}

def ef_badge(fallback_level: str, factor_id: str = "", source: str = "") -> None:
    """Render a compact EF quality badge with tooltip."""
    icon, colour, label = _COLOURS.get(fallback_level, _COLOURS["unknown"])
    tip = f"{label}"
    if factor_id:
        tip += f" | {factor_id}"
    if source:
        tip += f" | {source}"
    st.markdown(
        f'<span title="{tip}" style="font-size:13px;">{icon} <b>{label}</b></span>',
        unsafe_allow_html=True,
    )


def fallback_warning(n_fallback: int, total: int) -> None:
    """Show a warning if many records used fallback EFs."""
    if n_fallback == 0:
        return
    pct = n_fallback / total * 100 if total else 0
    if pct > 30:
        st.warning(
            f"⚠️ {n_fallback} of {total} records ({pct:.0f}%) used regional or global "
            "fallback emission factors. Seek national or supplier-specific EFs to improve accuracy."
        )
    elif n_fallback > 0:
        st.info(
            f"ℹ️ {n_fallback} record(s) used fallback emission factors. "
            "Review the EF Manager for details."
        )
