import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "sqlite_connected"


def test_substitution_check_api():
    payload = {
        "prescription_id": "RX-API-01",
        "patient_id": "PAT-1003",
        "medicine_id": "MED-001",
        "requested_medicine": "Amoxicillin 500mg Oral",
        "dosage": "500mg",
        "route": "Oral",
        "frequency": "TID",
        "ward": "General Ward A",
        "urgency": "ROUTINE",
        "prescriber_id": "DOC-301",
        "requested_alternative_id": "ALT-001",
        "patient_information": {
            "patient_id": "PAT-1003",
            "age": 45,
            "egfr": 90.0,
            "allergies": []
        }
    }
    response = client.post("/api/substitution/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] in ["APPROVED", "BLOCKED", "ESCALATED", "REVIEW_REQUIRED"]
    assert "decision_id" in data
    assert "rules_checked" in data
    assert len(data["rules_checked"]) > 0


def test_inventory_endpoints():
    r_presc = client.get("/api/prescriptions?limit=5")
    assert r_presc.status_code == 200
    assert isinstance(r_presc.json(), list)

    r_pat = client.get("/api/patients?limit=5")
    assert r_pat.status_code == 200
    assert isinstance(r_pat.json(), list)

    r_alt = client.get("/api/alternatives?limit=5")
    assert r_alt.status_code == 200
    assert isinstance(r_alt.json(), list)

    r_stock = client.get("/api/stock?limit=5")
    assert r_stock.status_code == 200
    assert isinstance(r_stock.json(), list)


def test_metrics_endpoint():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    for key in ["total_decisions", "approved", "blocked", "escalated", "review_required", "average_latency_ms", "escalation_rate"]:
        assert key in data


def test_audit_endpoints():
    response = client.get("/api/audit?limit=10")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    if events:
        dec_id = events[0]["decision_id"]
        r_single = client.get(f"/api/audit/{dec_id}")
        assert r_single.status_code == 200


def test_test_cases_and_evaluate_endpoints():
    r_cases = client.get("/api/test-cases")
    assert r_cases.status_code == 200
    cases = r_cases.json()
    assert len(cases) == 15

    r_eval = client.post("/api/evaluate")
    assert r_eval.status_code == 200
    summary = r_eval.json()
    assert summary["total_cases"] == 15
    assert summary["accuracy"] >= 90.0
