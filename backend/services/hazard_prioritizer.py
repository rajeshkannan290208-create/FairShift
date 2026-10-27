import re
import random
import string
from typing import Dict, Any, List

ELECTRICAL_HIGH_RISK = [
    "spark", "sparking", "shock", "exposed", "high voltage", "short circuit",
    "electrocution", "switchboard", "bare wire", "loose wire", "current",
    "தீப்பொறி", "மின்சாரம்", "அதிர்ச்சி", "கம்பி"
]

WATER_HAZARDS = [
    "water", "leak", "leakage", "wet", "puddle", "flood", "seeping", "தண்ணீர்", "கசிவு"
]

FALL_HEIGHT_RISKS = [
    "fall", "scaffold", "scaffolding", "height", "harness", "balcony", "roof", "edge",
    "விழுதல்", "உயரம்"
]

MACHINERY_RISKS = [
    "blade", "press", "roller", "crush", "gear", "belt", "hydraulic", "unguarded", "jammed",
    "இயந்திரம்", "வெட்டு"
]

HARASSMENT_RISKS = [
    "threat", "abuse", "forced", "withheld", "lock", "harass", "coercion", "retaliation",
    "மிரட்டல்", "துன்புறுத்தல்"
]

def generate_report_reference() -> str:
    """Generate a clean, professional reference code like FS-2026-H8492"""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"FS-2026-{suffix}"

def evaluate_hazard_priority(
    category: str,
    title: str,
    description: str,
    location: str = ""
) -> Dict[str, Any]:
    """
    Deterministic explainable hazard prioritization engine.
    Detects compound hazards (e.g. Electrical + Water) and assigns transparent priority with rationale.
    """
    text = f"{title} {description} {location}".lower()
    reasons: List[str] = []
    category_norm = category.strip().title()

    is_electrical = any(k in text for k in ELECTRICAL_HIGH_RISK) or "electric" in category_norm.lower()
    has_water = any(k in text for k in WATER_HAZARDS)
    has_fall = any(k in text for k in FALL_HEIGHT_RISKS)
    has_machinery = any(k in text for k in MACHINERY_RISKS)
    has_harassment = any(k in text for k in HARASSMENT_RISKS)

    priority = "MEDIUM"
    action = "Log report and assign to shift supervisor for standard inspection."

    # Compound risk 1: Electrical + Water (Highest electrocution/explosion danger)
    if is_electrical and has_water:
        priority = "CRITICAL"
        reasons.append("Compound Hazard: Electrical equipment in direct contact or proximity to water leakage.")
        reasons.append("Extreme electrocution and flash fire risk detected under OSHA / Indian Electricity Rules.")
        action = "IMMEDIATE ACTION: Isolate circuit breaker/power supply immediately and cordon off area within 15 minutes."

    # Compound risk 2: Height / Scaffolding + Missing PPE or Fall Risk
    elif has_fall and ("ppe" in category_norm.lower() or "missing" in text or "no harness" in text):
        priority = "HIGH"
        reasons.append("Elevated Fall Hazard: Work at height identified without confirmed safety harness or edge barriers.")
        reasons.append("Falls from elevation represent leading cause of fatal workplace incidents.")
        action = "Halt operations on affected scaffolding/riser until safety harness and guard rails are verified."

    # Electrical hazard alone
    elif is_electrical:
        if any(urgent in text for urgent in ["exposed", "spark", "bare wire", "shock", "high voltage"]):
            priority = "HIGH"
            reasons.append("Active Electrical Danger: Exposed live conductors or sparking reported.")
            reasons.append("Direct contact hazard requires prompt de-energization by licensed technician.")
            action = "Dispatch certified electrician and place warning barricades around switchgear/panel."
        else:
            priority = "MEDIUM"
            reasons.append("Electrical equipment concern logged for preventative maintenance.")
            action = "Schedule electrical inspection during next maintenance window within 24 hours."

    # Machinery hazard
    elif "machin" in category_norm.lower() or has_machinery:
        if any(k in text for k in ["crush", "blade", "unguarded", "jammed"]):
            priority = "HIGH"
            reasons.append("Mechanical Hazard: Rotating or unshielded machinery presenting entrapment/crush risk.")
            action = "Lockout/Tagout (LOTO) machinery immediately until physical guard is repaired."
        else:
            priority = "MEDIUM"
            reasons.append("Machinery maintenance notice logged.")
            action = "Inspect equipment and record tool inventory log."

    # Harassment / Human concern
    elif "harass" in category_norm.lower() or "concern" in category_norm.lower() or has_harassment:
        priority = "HIGH"
        reasons.append("Worker Welfare Flag: Sensitive interpersonal safety or working condition dispute.")
        reasons.append("Mandatory confidential human HR / safety committee escalation protocol triggered.")
        action = "Escalate to designated internal grievances officer or site ombudsman for confidential hearing."

    # Sanitation / Health
    elif "sanit" in category_norm.lower():
        if has_water or "contamination" in text:
            priority = "MEDIUM"
            reasons.append("Hygiene & Sanitation Risk: Water supply or facilities impairment detected.")
            action = "Notify facility housekeeping supervisor to disinfect and restore clean utilities."
        else:
            priority = "LOW"
            reasons.append("Routine sanitation inquiry or consumables restock.")
            action = "Assign to next custodial service round."

    # PPE General
    elif "ppe" in category_norm.lower():
        priority = "MEDIUM"
        reasons.append("Personal Protective Equipment discrepancy reported.")
        action = "Issue required replacement protective gear from site safety inventory."

    else:
        # Default category handling
        priority = "LOW"
        reasons.append(f"Standard priority baseline applied for '{category_norm}' category report.")
        action = "Review during periodic safety walkthrough."

    if not reasons:
        reasons.append("Standard heuristic review completed based on workplace safety protocol guidelines.")

    return {
        "priority": priority,
        "priority_reasons": reasons,
        "recommended_action": action
    }
