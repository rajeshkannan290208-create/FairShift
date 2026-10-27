from typing import Tuple, List, Dict, Any

def calculate_wages(
    rate_type: str,
    base_rate: float,
    regular_hours: float,
    overtime_hours: float,
    overtime_multiplier: float,
    recorded_pay: float,
) -> Dict[str, Any]:
    """
    Deterministic wage intelligence calculation for Indian industrial & institutional workers.
    Conforms to standard Factories Act / Minimum Wages demonstration benchmark (overtime standard 2.0x).
    """
    # 1. Determine hourly rate
    if rate_type.upper() == "DAILY":
        # Standard statutory demonstration standard: 8 hours work day
        hourly_rate = round(base_rate / 8.0, 2)
        base_rate_desc = f"₹{base_rate:,.2f}/day (effective ₹{hourly_rate:.2f}/hr assuming 8h day)"
    else:
        hourly_rate = round(base_rate, 2)
        base_rate_desc = f"₹{hourly_rate:,.2f}/hr"

    # 2. Regular and overtime pay computation
    regular_pay = round(regular_hours * hourly_rate, 2)
    overtime_pay = round(overtime_hours * (hourly_rate * overtime_multiplier), 2)
    expected_pay = round(regular_pay + overtime_pay, 2)
    total_hours = round(regular_hours + overtime_hours, 2)
    discrepancy = round(expected_pay - recorded_pay, 2)

    # 3. Status determination
    if abs(discrepancy) <= 1.0:
        status = "LOOKS_CONSISTENT"
    elif discrepancy > 1.0:
        status = "POTENTIAL_DISCREPANCY" # Underpaid
    else:
        status = "NEEDS_REVIEW" # Overpaid / unexpected variance

    # 4. Step-by-step audit lines
    steps = [
        f"1. Rate translation: {base_rate_desc}",
        f"2. Regular hours earnings: {regular_hours:g} hrs × ₹{hourly_rate:,.2f} = ₹{regular_pay:,.2f}",
        f"3. Overtime earnings: {overtime_hours:g} hrs × (₹{hourly_rate:,.2f} × {overtime_multiplier:g}x) = ₹{overtime_pay:,.2f}",
        f"4. Total statutory demonstration entitlement: ₹{regular_pay:,.2f} + ₹{overtime_pay:,.2f} = ₹{expected_pay:,.2f}",
        f"5. Payout comparison: Entitled ₹{expected_pay:,.2f} vs Actual Disbursed ₹{recorded_pay:,.2f} (Delta: ₹{discrepancy:+,.2f})"
    ]

    formula = (
        f"[Regular: {regular_hours:g}h × ₹{hourly_rate:.2f} = ₹{regular_pay:.2f}] + "
        f"[Overtime: {overtime_hours:g}h × (₹{hourly_rate:.2f} × {overtime_multiplier:g}) = ₹{overtime_pay:.2f}] "
        f"= Expected ₹{expected_pay:.2f}"
    )

    # 5. Clear contextual explanation
    if status == "POTENTIAL_DISCREPANCY":
        explanation = (
            f"A potential shortfall of ₹{discrepancy:,.2f} was detected. "
            f"The worker completed {overtime_hours:g} overtime hours (valued at ₹{overtime_pay:,.2f} at {overtime_multiplier:g}x multiplier), "
            f"but actual payout of ₹{recorded_pay:,.2f} reflects only regular or partially uncompensated work."
        )
    elif status == "NEEDS_REVIEW":
        explanation = (
            f"Recorded payout of ₹{recorded_pay:,.2f} exceeds standard formula baseline of ₹{expected_pay:,.2f} "
            f"by ₹{abs(discrepancy):,.2f}. This may reflect hazard pay, travel allowance, or shift incentive. Verification recommended."
        )
    else:
        explanation = (
            f"Recorded payout of ₹{recorded_pay:,.2f} aligns accurately with expected entitlement of ₹{expected_pay:,.2f} "
            f"for {regular_hours:g} regular hours and {overtime_hours:g} overtime hours."
        )

    disclaimer = (
        "Note: Transparent demonstration model based on standard 8-hour shift benchmarks and Indian Factories Act 1948 "
        "(Section 59: Double rate overtime). This computation serves as an internal transparency verification tool and "
        "does not constitute a formal legal declaration."
    )

    return {
        "hourly_rate": hourly_rate,
        "total_hours": total_hours,
        "regular_pay": regular_pay,
        "overtime_pay": overtime_pay,
        "expected_pay": expected_pay,
        "recorded_pay": recorded_pay,
        "discrepancy": discrepancy,
        "status": status,
        "formula": formula,
        "calculation_steps": steps,
        "explanation": explanation,
        "disclaimer": disclaimer,
    }
