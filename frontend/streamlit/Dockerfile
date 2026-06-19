FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Create data directory for SQLite databases
RUN mkdir -p /app/data && chmod 777 /app/data

# Streamlit config
COPY .streamlit/config.toml .streamlit/config.toml

EXPOSE 8501

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8501/_stcore/health || exit 1

# Run setup.py to seed databases, then start Streamlit
CMD ["sh", "-c", "python setup.py --force && streamlit run main.py --server.port=8501 --server.address=0.0.0.0"]
