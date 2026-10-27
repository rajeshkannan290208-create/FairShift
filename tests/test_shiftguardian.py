import pytest
from backend.services.shift_guardian import evaluate_shift_risk, parse_time_to_hours

def test_parse_time():
    assert parse_time_to_hours("08:00") == 8.0
    assert parse_time_to_hours("08:30") == 8.5
    assert parse_time_to_hours("14:45") == 14.75

def test_excessive_shift_duration():
    # 07:00 to 21:30 = 14.5 gross, 60m break = 13.5 net (>12h) -> CRITICAL
    res = evaluate_shift_risk("07:00", "21:30", 60, 12.0, 3)
    assert res["total_hours"] == 13.5
    assert res["risk_level"] == "CRITICAL"
    assert any(r["code"] == "FATIGUE_EXCESSIVE_DURATION" for r in res["triggered_rules"])

def test_insufficient_rest_hours():
    # 8h work, but only 6.5h rest prior -> CRITICAL
    res = evaluate_shift_risk("08:00", "17:00", 60, 6.5, 2)
    assert res["risk_level"] == "CRITICAL"
    assert any(r["code"] == "REST_CRITICAL_DEFICIT" for r in res["triggered_rules"])

def test_consecutive_days_breach():
    # 8h work, 12h rest, but 8 consecutive days -> HIGH
    res = evaluate_shift_risk("08:00", "17:00", 60, 12.0, 8)
    assert res["risk_level"] == "HIGH"
    assert any(r["code"] == "DAYS_STATUTORY_REST_BREACH" for r in res["triggered_rules"])

def test_safe_shift():
    # 8h work, 14h rest, 3 days -> LOW
    res = evaluate_shift_risk("08:00", "17:00", 60, 14.0, 3)
    assert res["risk_level"] == "LOW"
    assert len(res["triggered_rules"]) == 0
