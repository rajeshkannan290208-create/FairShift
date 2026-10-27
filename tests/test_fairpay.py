import pytest
from backend.services.wage_calculator import calculate_wages

def test_daily_rate_with_overtime_underpayment():
    # Raman K.: ₹750/day (effective ₹93.75/hr), 48 regular hrs, 14 OT hrs at 2.0x
    # Regular: 48 * 93.75 = 4500.00
    # Overtime: 14 * (93.75 * 2.0) = 2625.00
    # Expected: 7125.00
    # Recorded: 5500.00 -> Discrepancy = 1625.00 (POTENTIAL_DISCREPANCY)
    res = calculate_wages(
        rate_type="DAILY",
        base_rate=750.0,
        regular_hours=48.0,
        overtime_hours=14.0,
        overtime_multiplier=2.0,
        recorded_pay=5500.0
    )
    assert res["hourly_rate"] == 93.75
    assert res["regular_pay"] == 4500.00
    assert res["overtime_pay"] == 2625.00
    assert res["expected_pay"] == 7125.00
    assert res["discrepancy"] == 1625.00
    assert res["status"] == "POTENTIAL_DISCREPANCY"
    assert "potential shortfall of ₹1,625.00" in res["explanation"]
    assert len(res["calculation_steps"]) == 5

def test_hourly_rate_consistent_payment():
    # Selvam P.: ₹95/hr, 40 regular hrs, 6 OT hrs at 2.0x
    # Regular: 40 * 95 = 3800.00
    # Overtime: 6 * (95 * 2) = 1140.00
    # Expected: 4940.00, Recorded: 4940.00 -> LOOKS_CONSISTENT
    res = calculate_wages(
        rate_type="HOURLY",
        base_rate=95.0,
        regular_hours=40.0,
        overtime_hours=6.0,
        overtime_multiplier=2.0,
        recorded_pay=4940.0
    )
    assert res["hourly_rate"] == 95.0
    assert res["expected_pay"] == 4940.0
    assert res["discrepancy"] == 0.0
    assert res["status"] == "LOOKS_CONSISTENT"
    assert "aligns accurately" in res["explanation"]

def test_overpayment_needs_review():
    res = calculate_wages(
        rate_type="HOURLY",
        base_rate=100.0,
        regular_hours=40.0,
        overtime_hours=0.0,
        overtime_multiplier=2.0,
        recorded_pay=4500.0
    )
    assert res["status"] == "NEEDS_REVIEW"
    assert res["discrepancy"] == -500.0
