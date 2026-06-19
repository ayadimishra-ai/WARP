#!/bin/bash
set -e

pip install -r requirements.txt --quiet

python setup.py --check || python setup.py

streamlit run main.py \
  --server.port=8501 \
  --server.address=0.0.0.0 \
  --server.headless=true
