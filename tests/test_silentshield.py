import pytest
from backend.services.hazard_prioritizer import evaluate_hazard_priority, generate_report_reference

def test_reference_format():
    ref = generate_report_reference()
    assert ref.startswith("FS-2026-")
    assert len(ref) == 13

def test_compound_hazard_electrical_and_water():
    res = evaluate_hazard_priority(
        category="Electrical",
        title="AC condensation leak over power panel",
        description="Water dripping from ceiling onto exposed live cables in basement",
        location="Basement Switchroom"
    )
    assert res["priority"] == "CRITICAL"
    assert any("Compound Hazard" in r for r in res["priority_reasons"])
    assert "Isolate circuit breaker" in res["recommended_action"]

def test_fall_hazard_with_ppe():
    res = evaluate_hazard_priority(
        category="PPE",
        title="Missing safety harnesses",
        description="Workers on 7th floor scaffolding without safety harness",
        location="Tower B"
    )
    assert res["priority"] == "HIGH"
    assert any("Elevated Fall Hazard" in r for r in res["priority_reasons"])

def test_harassment_priority():
    res = evaluate_hazard_priority(
        category="Harassment/Concern",
        title="Unsafe forced shifts",
        description="Workers coerced to work 16 hours under threat",
        location="Facility"
    )
    assert res["priority"] == "HIGH"
    assert any("Worker Welfare Flag" in r for r in res["priority_reasons"])

def test_tamil_keyword_electrical():
    res = evaluate_hazard_priority(
        category="Electrical",
        title="மின்சார கம்பி தீப்பொறி",
        description="தண்ணீர் தேங்கிய இடத்தில் மின் கம்பி அறுந்து விழுந்துள்ளது",
        location="கட்டட தளம்"
    )
    assert res["priority"] == "CRITICAL"
