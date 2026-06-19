"""
sk.lite — legacy entry point.

The correct entry point is the ROOT main.py:
    cd ghg_calculator
    streamlit run main.py

If you run THIS file (streamlit run streamlit_app/main.py), it will
forward to the root main.py using exec() with UTF-8 encoding.

NOTE: The page modules live in streamlit_app/_pages/ (underscore prefix).
This prevents Streamlit from auto-discovering them as native multi-page
app pages regardless of which entry point is used.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

# Forward to root main.py — always read with UTF-8 to handle emoji
exec(open(str(ROOT / "main.py"), encoding="utf-8").read())
