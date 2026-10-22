import os
import tempfile
from pathlib import Path

temporary = tempfile.TemporaryDirectory()
os.environ["DATABASE_PATH"] = str(Path(temporary.name) / "test.db")
os.environ["JWT_SECRET"] = "test-secret-for-educational-testing-long-enough"

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

def test_catalog_and_auth():
    with TestClient(app) as client:
        response = client.get("/api/products")
        assert response.status_code == 200 and len(response.json()) == 6
        assert client.get("/api/products/999").status_code == 404
        assert client.get("/api/orders").status_code == 401
        assert client.post("/api/auth/login", json={"username": "demo", "password": "wrong-password"}).status_code == 401
        login = client.post("/api/auth/login", json={"username": "demo", "password": "archive123"})
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        assert client.get("/api/users/me", headers=headers).json()["username"] == "demo"
        created = client.post("/api/orders", headers=headers, json={"items": [{"product_id": 1, "quantity": 2}]})
        assert created.status_code == 201 and created.json()["total"] == 37800
        assert len(client.get("/api/orders", headers=headers).json()) == 1
