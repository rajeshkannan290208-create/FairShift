import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/system/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "FairShift Core Platform"

def test_dashboard_metrics():
    res = client.get("/api/dashboard/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_workers"] >= 8
    assert data["open_safety_reports"] >= 1
    assert "recent_reports" in data
    assert "recent_wage_checks" in data

def test_industry_filter_construction():
    res = client.get("/api/dashboard/metrics?industry=Construction")
    assert res.status_code == 200
    data = res.json()
    assert data["total_workers"] == 4

def test_wage_calculate_api():
    payload = {
        "worker_name": "Test Worker",
        "industry": "Construction",
        "site_name": "Apex Heights",
        "rate_type": "DAILY",
        "base_rate": 800.0,
        "regular_hours": 48.0,
        "overtime_hours": 10.0,
        "overtime_multiplier": 2.0,
        "recorded_pay": 5000.0,
        "save_record": True
    }
    res = client.post("/api/fairpay/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "POTENTIAL_DISCREPANCY"
    assert data["expected_pay"] == 6800.0
    assert data["discrepancy"] == 1800.0
    assert data["id"] is not None

def test_silentshield_create_and_status_update():
    # 1. Create report
    payload = {
        "title": "Exposed high voltage wire in walkway",
        "category": "Electrical",
        "site_name": "Apex Heights Metro Tower (Tower B)",
        "location_description": "Level 2 east stairway",
        "description": "Live bare wire hanging with water puddle on floor",
        "language": "en",
        "is_confidential": False,
        "reporter_name": "Sundar P.",
        "reporter_role": "Scaffolder"
    }
    create_res = client.post("/api/silentshield/reports", json=payload)
    assert create_res.status_code == 200
    report = create_res.json()
    assert report["priority"] == "CRITICAL"
    assert report["reference_id"].startswith("FS-2026-")
    assert report["status"] == "OPEN"
    ref_id = report["reference_id"]
    report_id = report["id"]

    # 2. Track report
    track_res = client.get(f"/api/silentshield/reports/track/{ref_id}")
    assert track_res.status_code == 200
    assert track_res.json()["reference_id"] == ref_id

    # 3. Update status (Supervisor acknowledges)
    patch_res = client.patch(
        f"/api/silentshield/reports/{report_id}/status",
        json={"status": "ACKNOWLEDGED", "changed_by": "Safety Officer Kumar", "notes": "Cordoned area and called electrician."}
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "ACKNOWLEDGED"
    assert len(updated["audits"]) >= 2
