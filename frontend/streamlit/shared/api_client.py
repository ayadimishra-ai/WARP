import os
import httpx

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")


def get_client(token: str) -> httpx.Client:
    return httpx.Client(
        base_url=API_BASE,
        headers={"Authorization": f"Bearer {token}"},
        timeout=30.0,
    )
