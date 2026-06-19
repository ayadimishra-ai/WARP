"""Monthly Activity Data — approval status, data completeness, drill-down by location."""
import pandas as pd
import plotly.express as px
import streamlit as st

from shared.api_client import get_client

st.set_page_config(page_title="Monthly Activity", layout="wide", page_icon="📅")

token = st.query_params.get("token", "")
org_id = st.query_params.get("org_id", "")

if not token or not org_id:
    st.error("Missing authentication.")
    st.stop()


@st.cache_data(ttl=120, show_spinner=False)
def fetch_summary(token: str, org_id: str, year: str, month: str | None) -> dict:
    params = {"organization_id": org_id, "year": year}
    if month:
        params["month"] = month
    with get_client(token) as client:
        r = client.get("/ops/emissions/monthly-activity-summary", params=params)
        r.raise_for_status()
        return r.json()


year = st.sidebar.selectbox("Year", [str(y) for y in range(2020, 2027)], index=4)
month = st.sidebar.selectbox("Month", ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])

try:
    data = fetch_summary(token, org_id, year, None if month == "All" else month)
except Exception as e:
    st.error(f"Failed to load data: {e}")
    st.stop()

st.title("Monthly Activity Summary")

rows = data.get("rows", [])
if rows:
    df = pd.DataFrame(rows)
    st.dataframe(df, use_container_width=True)

    fig = px.bar(df, x="activity", y="value", color="status",
                 title="Activity data by status", barmode="group")
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("No data found for the selected filters.")
