"""GHG Emissions Dashboard — Scope 1 / 2 / 3 summary and drill-down."""
import os

import plotly.graph_objects as go
import streamlit as st

from shared.api_client import get_client

st.set_page_config(page_title="GHG Dashboard", layout="wide", page_icon="🌍")

# ── Auth token from query param (set by parent iframe on load) ──────────────
token = st.query_params.get("token", "")
org_id = st.query_params.get("org_id", "")
year = st.query_params.get("year", "2024")

if not token or not org_id:
    st.error("Missing authentication. Launch this dashboard from the platform.")
    st.stop()

# ── Fetch data ───────────────────────────────────────────────────────────────
@st.cache_data(ttl=300, show_spinner=False)
def fetch_scope_summary(token: str, org_id: str, year: str) -> dict:
    with get_client(token) as client:
        r = client.get("/ops/emissions/scope-summary", params={"organization_id": org_id, "year": year})
        r.raise_for_status()
        return r.json()


try:
    data = fetch_scope_summary(token, org_id, year)
except Exception as e:
    st.error(f"Failed to load emissions data: {e}")
    st.stop()

# ── Layout ───────────────────────────────────────────────────────────────────
st.title("GHG Emissions Dashboard")
st.caption(f"Organisation: {org_id} | Year: {year}")

col1, col2, col3 = st.columns(3)
col1.metric("Scope 1 (tCO₂e)", data.get("scope1", "—"))
col2.metric("Scope 2 (tCO₂e)", data.get("scope2", "—"))
col3.metric("Scope 3 (tCO₂e)", data.get("scope3", "—"))

st.divider()

# Donut chart
fig = go.Figure(go.Pie(
    labels=["Scope 1", "Scope 2", "Scope 3"],
    values=[data.get("scope1", 0), data.get("scope2", 0), data.get("scope3", 0)],
    hole=0.5,
    marker_colors=["#2E7D32", "#1565C0", "#6A1B9A"],
))
fig.update_layout(title="Emission breakdown by scope", height=400)
st.plotly_chart(fig, use_container_width=True)
