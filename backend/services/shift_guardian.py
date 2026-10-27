from datetime import datetime, timedelta
from typing import Dict, Any, List

def parse_time_to_hours(time_str: str) -> float:
    """Parse 'HH:MM' string to decimal hours from midnight (e.g., '08:30' -> 8.5)"""
    parts = time_str.strip().split(":")
    hours = int(parts[0])
    minutes = int(parts[1]) if len(parts) > 1 else 0
    return hours + (minutes / 60.0)

def evaluate_shift_risk(
    start_time: str,
    end_time: str,
    break_minutes: int,
    rest_hours_before: float,
    consecutive_days: int
) -> Dict[str, Any]:
    """
    Deterministic schedule risk evaluation based on occupational health and fatigue science standards.
    """
    start_h = parse_time_to_hours(start_time)
    end_h = parse_time_to_hours(end_time)

    # Handle overnight shift
    if end_h < start_h:
        gross_hours = round((24.0 - start_h) + end_h, 2)
    else:
        gross_hours = round(end_h - start_h, 2)

    break_h = round(break_minutes / 60.0, 2)
    net_hours = round(max(0.0, gross_hours - break_h), 2)

    triggered_rules: List[Dict[str, str]] = []
    severities: List[str] = []

    # Rule 1: Shift Length Check
    if net_hours > 12.0:
        triggered_rules.append({
            "code": "FATIGUE_EXCESSIVE_DURATION",
            "rule_name": "Maximum Shift Ceiling Exceeded (>12 Hours)",
            "severity": "CRITICAL",
            "description": f"Net duty duration of {net_hours:g} hours exceeds safe occupational threshold of 12 hours. Motor reflexes drop by up to 50% after 12 consecutive hours."
        })
        severities.append("CRITICAL")
    elif net_hours > 10.0:
        triggered_rules.append({
            "code": "FATIGUE_LONG_SHIFT",
            "rule_name": "Extended Shift Duration (>10 Hours)",
            "severity": "HIGH",
            "description": f"Shift spans {net_hours:g} net working hours. Extended duty increases vigilance decrement and workplace hazard probability."
        })
        severities.append("HIGH")
    elif net_hours > 8.5:
        triggered_rules.append({
            "code": "FATIGUE_MODERATE_OVERTIME",
            "rule_name": "Standard Overtime Shift (>8.5 Hours)",
            "severity": "MODERATE",
            "description": f"Shift requires {net_hours:g} net hours, exceeding the standard 8-hour shift guideline."
        })
        severities.append("MODERATE")

    # Rule 2: Rest Duration Before Shift Check
    if rest_hours_before < 8.0:
        triggered_rules.append({
            "code": "REST_CRITICAL_DEFICIT",
            "rule_name": "Acute Sleep & Recovery Deficit (<8 Hours Rest)",
            "severity": "CRITICAL",
            "description": f"Only {rest_hours_before:g} hours of rest elapsed since previous shift. Impossible to achieve physiological 7-8 hours of sleep including commute."
        })
        severities.append("CRITICAL")
    elif rest_hours_before < 11.0:
        triggered_rules.append({
            "code": "REST_SUBOPTIMAL",
            "rule_name": "Insufficient Recovery Window (<11 Hours Rest)",
            "severity": "HIGH",
            "description": f"Inter-shift recovery of {rest_hours_before:g} hours falls short of international 11-hour standard recovery recommendation."
        })
        severities.append("HIGH")

    # Rule 3: Consecutive Days Check
    if consecutive_days >= 12:
        triggered_rules.append({
            "code": "DAYS_EXTREME_STRETCH",
            "rule_name": "Extreme Cumulative Stretch (≥12 Consecutive Days)",
            "severity": "CRITICAL",
            "description": f"Worker rostered for {consecutive_days} consecutive days without rest day. Severe chronic fatigue and injury vulnerability."
        })
        severities.append("CRITICAL")
    elif consecutive_days >= 7:
        triggered_rules.append({
            "code": "DAYS_STATUTORY_REST_BREACH",
            "rule_name": "Weekly Rest Day Overdue (≥7 Consecutive Days)",
            "severity": "HIGH",
            "description": f"{consecutive_days} consecutive days worked. Standard labour norms require at least 1 mandatory rest day per 7-day work cycle."
        })
        severities.append("HIGH")
    elif consecutive_days >= 6:
        triggered_rules.append({
            "code": "DAYS_APPROACHING_REST",
            "rule_name": "Approaching Maximum Consecutive Shifts (6 Days)",
            "severity": "MODERATE",
            "description": "Worker has completed 6 consecutive shifts. Next day roster must provide statutory rest."
        })
        severities.append("MODERATE")

    # Rule 4: Compound Quick Return
    if net_hours > 9.5 and rest_hours_before < 10.0:
        triggered_rules.append({
            "code": "FATIGUE_COMPOUND_ROTATION",
            "rule_name": "Compound Quick Turnaround Risk",
            "severity": "CRITICAL",
            "description": "Long work shift preceded by restricted rest (<10h). Risk of microsleeps and machinery accidents multiplies exponentially."
        })
        severities.append("CRITICAL")

    # Overall Risk Level Determination
    if "CRITICAL" in severities:
        risk_level = "CRITICAL"
        action = "REMEDIAL ACTION MANDATORY: Suspend shift assignment. Provide mandatory 12h rest interval and assign standby replacement."
    elif "HIGH" in severities or severities.count("MODERATE") >= 2:
        risk_level = "HIGH"
        action = "SCHEDULE MODIFICATION REQUIRED: Adjust start time or reduce shift length to guarantee adequate recovery window."
    elif "MODERATE" in severities:
        risk_level = "MODERATE"
        action = "MONITORING RECOMMENDED: Ensure mandatory 15-minute ergonomic hydration breaks and avoid rostering overtime tomorrow."
    else:
        risk_level = "LOW"
        action = "SCHEDULE APPROVED: Roster parameters conform to safe occupational fatigue thresholds."

    disclaimer = (
        "Demonstration Fatigue Model based on ILO (International Labour Organization) conventions and "
        "occupational sleep science principles. Operational deployment requires calibration to specific union/site agreements."
    )

    return {
        "gross_hours": gross_hours,
        "total_hours": net_hours,
        "rest_hours_before": rest_hours_before,
        "consecutive_days": consecutive_days,
        "risk_level": risk_level,
        "triggered_rules": triggered_rules,
        "recommended_action": action,
        "disclaimer": disclaimer,
    }
