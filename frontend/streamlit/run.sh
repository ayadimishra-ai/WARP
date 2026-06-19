#!/usr/bin/env bash
# sk.lite — startup script
# Used by Replit (.replit run command) and can be run locally.
# 1. Seeds the database (idempotent — safe to run every time)
# 2. Starts Streamlit

set -e

echo "=== sk.lite startup ==="
echo "Python: $(python3 --version)"

# Create data directory if it doesn't exist
mkdir -p data

# Seed databases (idempotent — skips if already seeded)
echo "[1/2] Seeding databases..."
python3 setup.py --check 2>/dev/null || python3 setup.py

# Start Streamlit
echo "[2/2] Starting Streamlit on port 8501..."
exec streamlit run main.py \
  --server.port=8501 \
  --server.address=0.0.0.0 \
  --server.headless=true \
  --browser.gatherUsageStats=false
