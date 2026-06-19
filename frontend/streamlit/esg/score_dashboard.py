"""ESG Score Dashboard — form scores, section breakdown, trend over time."""
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from shared.api_client import get_client

st.set_page_config(page_title="ESG Score Dashboard", layout="wide", page_icon="📊")

token = st.query_params.get("token", "")
company_id = st.query_params.get("company_id", "")
form_id = st.query_params.get("form_id", "")

if not token or not company_id:
    st.error("Missing authentication. Launch this dashboard from the platform.")
    st.stop()


@st.cache_data(ttl=300, show_spinner=False)
def fetch_scores(token: str, company_id: str, form_id: str) -> dict:
    with get_client(token) as client:
        r = client.get("/warp/calculate-score/summary", params={"company_id": company_id, "form_id": form_id})
        r.raise_for_status()
        return r.json()


try:
    scores = fetch_scores(token, company_id, form_id)
except Exception as e:
    st.error(f"Failed to load score data: {e}")
    st.stop()

st.title("ESG Assessment Score")
st.caption(f"Company: {company_id}")

overall = scores.get("overall_score", 0)
st.metric("Overall ESG Score", f"{overall:.1f} / 100")

sections = scores.get("section_scores", {})
if sections:
    fig = px.bar(
        x=list(sections.keys()),
        y=list(sections.values()),
        labels={"x": "Section", "y": "Score"},
        title="Score by Section",
        color=list(sections.values()),
        color_continuous_scale="RdYlGn",
        range_color=[0, 100],
    )
    st.plotly_chart(fig, use_container_width=True)
