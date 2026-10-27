import json
import datetime
from sqlalchemy.orm import Session
from backend.models import (
    Base, Site, Worker, WageCheck, SafetyReport, SafetyReportAudit,
    ShiftSchedule, ActivityLog
)
from backend.services.wage_calculator import calculate_wages
from backend.services.hazard_prioritizer import evaluate_hazard_priority
from backend.services.shift_guardian import evaluate_shift_risk

def seed_database(db: Session, reset: bool = False):
    """
    Deterministically seeds the FairShift database with realistic samples
    for Construction and College Facilities.
    """
    if reset:
        # Clear existing tables
        db.query(SafetyReportAudit).delete()
        db.query(SafetyReport).delete()
        db.query(WageCheck).delete()
        db.query(ShiftSchedule).delete()
        db.query(ActivityLog).delete()
        db.query(Worker).delete()
        db.query(Site).delete()
        db.commit()

    # Check if already seeded
    if db.query(Site).count() > 0:
        return {"status": "already_seeded"}

    # 1. Create Sites
    sites_data = [
        Site(id=1, name="Apex Heights Metro Tower (Tower B)", industry="Construction", location="Chennai High-Rise Zone, OMR", address="Plot 44, Sholinganallur, Chennai"),
        Site(id=2, name="Coromandel Infrastructure Overpass", industry="Construction", location="Grand Southern Trunk Corridor", address="Pier Section 12-18, Tambaram, Chennai"),
        Site(id=3, name="SRM Tech Park & Engineering Complex", industry="College Facilities", location="Kattankulathur Main Campus", address="Tech Block A & Central Utilities, Kattankulathur"),
        Site(id=4, name="SRM Campus Hostels & Dining Hall 3", industry="College Facilities", location="Residential Sector, Kattankulathur", address="Hostel Block C & Mega Mess, Kattankulathur"),
    ]
    db.add_all(sites_data)
    db.commit()

    # 2. Create Workers
    workers_data = [
        # Construction
        Worker(id=1, name="Raman K.", employee_code="CONST-0104", industry="Construction", role="Mason & Scaffolder", site_id=1, default_rate=750.0, rate_type="DAILY", phone_masked="+91 98401 *****"),
        Worker(id=2, name="Murugan S.", employee_code="CONST-0218", industry="Construction", role="Rebar & Steel Specialist", site_id=1, default_rate=800.0, rate_type="DAILY", phone_masked="+91 97890 *****"),
        Worker(id=3, name="Selvam P.", employee_code="CONST-0342", industry="Construction", role="Licensed Site Electrician", site_id=2, default_rate=95.0, rate_type="HOURLY", phone_masked="+91 94440 *****"),
        Worker(id=4, name="Priya M.", employee_code="CONST-0419", industry="Construction", role="Safety & Inventory Assistant", site_id=1, default_rate=650.0, rate_type="DAILY", phone_masked="+91 98844 *****"),
        # College Facilities
        Worker(id=5, name="Lakshmi N.", employee_code="CAMP-0112", industry="College Facilities", role="Senior Housekeeping Attendant", site_id=4, default_rate=550.0, rate_type="DAILY", phone_masked="+91 98412 *****"),
        Worker(id=6, name="Karthik V.", employee_code="CAMP-0205", industry="College Facilities", role="HVAC & Utilities Technician", site_id=3, default_rate=85.0, rate_type="HOURLY", phone_masked="+91 97908 *****"),
        Worker(id=7, name="Anbu R.", employee_code="CAMP-0388", industry="College Facilities", role="Campus Security Guard", site_id=3, default_rate=600.0, rate_type="DAILY", phone_masked="+91 99620 *****"),
        Worker(id=8, name="Deepa S.", employee_code="CAMP-0491", industry="College Facilities", role="Cafeteria & Hygiene Staff", site_id=4, default_rate=520.0, rate_type="DAILY", phone_masked="+91 98409 *****"),
    ]
    db.add_all(workers_data)
    db.commit()

    # 3. Seed Wage Checks
    # Discrepancy example for Raman K. (Underpaid)
    c1 = calculate_wages("DAILY", 750.0, 48.0, 14.0, 2.0, 5500.0)
    w1 = WageCheck(
        worker_id=1, worker_name="Raman K.", industry="Construction", site_name="Apex Heights Metro Tower (Tower B)",
        period="Oct 12-18, 2026", total_hours=c1["total_hours"], regular_hours=48.0, overtime_hours=14.0,
        hourly_rate=c1["hourly_rate"], overtime_multiplier=2.0, recorded_pay=5500.0, expected_pay=c1["expected_pay"],
        discrepancy=c1["discrepancy"], status=c1["status"], formula_steps=json.dumps(c1["calculation_steps"]),
        explanation=c1["explanation"], created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )

    # Consistent example for Selvam P.
    c2 = calculate_wages("HOURLY", 95.0, 40.0, 6.0, 2.0, 4940.0)
    w2 = WageCheck(
        worker_id=3, worker_name="Selvam P.", industry="Construction", site_name="Coromandel Infrastructure Overpass",
        period="Oct 12-18, 2026", total_hours=c2["total_hours"], regular_hours=40.0, overtime_hours=6.0,
        hourly_rate=c2["hourly_rate"], overtime_multiplier=2.0, recorded_pay=4940.0, expected_pay=c2["expected_pay"],
        discrepancy=c2["discrepancy"], status=c2["status"], formula_steps=json.dumps(c2["calculation_steps"]),
        explanation=c2["explanation"], created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )

    # Discrepancy example for Lakshmi N. (College Housekeeping - Underpaid)
    c3 = calculate_wages("DAILY", 550.0, 48.0, 12.0, 2.0, 3800.0)
    w3 = WageCheck(
        worker_id=5, worker_name="Lakshmi N.", industry="College Facilities", site_name="SRM Campus Hostels & Dining Hall 3",
        period="Oct 12-18, 2026", total_hours=c3["total_hours"], regular_hours=48.0, overtime_hours=12.0,
        hourly_rate=c3["hourly_rate"], overtime_multiplier=2.0, recorded_pay=3800.0, expected_pay=c3["expected_pay"],
        discrepancy=c3["discrepancy"], status=c3["status"], formula_steps=json.dumps(c3["calculation_steps"]),
        explanation=c3["explanation"], created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )

    # Consistent example for Karthik V.
    c4 = calculate_wages("HOURLY", 85.0, 44.0, 4.0, 2.0, 4420.0)
    w4 = WageCheck(
        worker_id=6, worker_name="Karthik V.", industry="College Facilities", site_name="SRM Tech Park & Engineering Complex",
        period="Oct 12-18, 2026", total_hours=c4["total_hours"], regular_hours=44.0, overtime_hours=4.0,
        hourly_rate=c4["hourly_rate"], overtime_multiplier=2.0, recorded_pay=4420.0, expected_pay=c4["expected_pay"],
        discrepancy=c4["discrepancy"], status=c4["status"], formula_steps=json.dumps(c4["calculation_steps"]),
        explanation=c4["explanation"], created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
    )
    db.add_all([w1, w2, w3, w4])
    db.commit()

    # 4. Seed Safety Reports
    r1_p = evaluate_hazard_priority("Electrical", "Exposed live conduit near walkway", "Uninsulated bare wire sparking near the wet 3rd floor scaffolding corridor.", "Tower B Level 3")
    r1 = SafetyReport(
        id=1, reference_id="FS-2026-E4912", title="Exposed live conduit near walkway", category="Electrical",
        site_id=1, site_name="Apex Heights Metro Tower (Tower B)", location_description="Tower B Level 3 corridor",
        description="Workers noticed exposed wiring sparking near temporary pedestrian bridge. Water from rainfall pooling nearby.",
        language="en", priority="CRITICAL", priority_reasons=json.dumps(r1_p["priority_reasons"]),
        recommended_action=r1_p["recommended_action"], status="OPEN", is_confidential=False,
        reporter_name="Raman K.", reporter_role="Mason & Scaffolder",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
    )

    r2_p = evaluate_hazard_priority("PPE", "Missing edge barriers and harnesses at elevation", "Subcontractor crew operating on 7th floor slab edge without safety harnesses or toe boards.", "Tower B Floor 7")
    r2 = SafetyReport(
        id=2, reference_id="FS-2026-P1104", title="Missing edge barriers and harnesses at elevation", category="PPE",
        site_id=1, site_name="Apex Heights Metro Tower (Tower B)", location_description="Tower B Floor 7 South Perimeter",
        description="Workers on 7th floor slab edge have no anchor points installed and missing harnesses.",
        language="en", priority="HIGH", priority_reasons=json.dumps(r2_p["priority_reasons"]),
        recommended_action=r2_p["recommended_action"], status="ACKNOWLEDGED", is_confidential=False,
        reporter_name="Murugan S.", reporter_role="Rebar & Steel Specialist",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=22)
    )
    a2 = SafetyReportAudit(
        report_id=2, old_status="OPEN", new_status="ACKNOWLEDGED", changed_by="Site Safety Officer - Sundar",
        notes="Barricades requested from central warehouse. Physical inspection scheduled.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=18)
    )

    r3_p = evaluate_hazard_priority("Electrical", "Water seepage from chiller onto main switchboard 2", "Continuous water leakage dripping from overhead AC pipes into open electrical distribution breaker box.", "Tech Park Basement Utility Room")
    r3 = SafetyReport(
        id=3, reference_id="FS-2026-W3088", title="Water seepage from chiller onto main switchboard 2", category="Electrical",
        site_id=3, site_name="SRM Tech Park & Engineering Complex", location_description="Basement Substation Room B-04",
        description="Overhead AC condensation pipe cracked, dripping water directly over main switchgear panel 2. Sparking sound heard.",
        language="en", priority="CRITICAL", priority_reasons=json.dumps(r3_p["priority_reasons"]),
        recommended_action=r3_p["recommended_action"], status="UNDER_INVESTIGATION", is_confidential=False,
        reporter_name="Karthik V.", reporter_role="HVAC & Utilities Technician",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
    )
    a3 = SafetyReportAudit(
        report_id=3, old_status="OPEN", new_status="UNDER_INVESTIGATION", changed_by="Chief Engineer Nair",
        notes="Power to Substation 2 partially diverted. Plumber dispatched to seal overhead pipe.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=10)
    )

    r4_p = evaluate_hazard_priority("Machinery", "Industrial floor scrubber smoking and vibrating violently", "Floor polishing machine in Hostel Block C emitting burnt plastic smell and strong motor vibration.", "Hostel Block C 1st Floor")
    r4 = SafetyReport(
        id=4, reference_id="FS-2026-S9120", title="Industrial floor scrubber smoking and vibrating violently", category="Machinery",
        site_id=4, site_name="SRM Campus Hostels & Dining Hall 3", location_description="Hostel Block C Ground Floor Lobby",
        description="Machine motor casing became burning hot and emitted visible smoke during morning cleaning cycle.",
        language="en", priority="HIGH", priority_reasons=json.dumps(r4_p["priority_reasons"]),
        recommended_action=r4_p["recommended_action"], status="RESOLVED", is_confidential=False,
        reporter_name="Lakshmi N.", reporter_role="Senior Housekeeping Attendant",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    a4 = SafetyReportAudit(
        report_id=4, old_status="OPEN", new_status="RESOLVED", changed_by="Hostel Manager Kumar",
        notes="Faulty capacitor replaced by maintenance vendor. Machine tested and cleared.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )

    r5_p = evaluate_hazard_priority("Harassment/Concern", "Unsafe forced consecutive night shifts without break", "Staff repeatedly coerced into double back-to-back shifts under threat of wage deduction.", "Campus Facilities Roster")
    r5 = SafetyReport(
        id=5, reference_id="FS-2026-H5201", title="Unsafe forced consecutive night shifts without break", category="Harassment/Concern",
        site_id=4, site_name="SRM Campus Hostels & Dining Hall 3", location_description="Mess Sanitation Section",
        description="Staff members rostered for 16-hour shifts without advance consent or meal intervals.",
        language="en", priority="HIGH", priority_reasons=json.dumps(r5_p["priority_reasons"]),
        recommended_action=r5_p["recommended_action"], status="OPEN", is_confidential=True,
        reporter_name="Confidential Worker", reporter_role="Housekeeping Crew",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=36)
    )

    db.add_all([r1, r2, r3, r4, r5, a2, a3, a4])
    db.commit()

    # 5. Seed Shift Schedules
    s1_res = evaluate_shift_risk("07:00", "21:30", 60, 7.0, 7)
    s1 = ShiftSchedule(
        id=1, worker_id=2, worker_name="Murugan S.", industry="Construction", site_name="Apex Heights Metro Tower (Tower B)",
        shift_date="2026-10-27", start_time="07:00", end_time="21:30", break_minutes=60,
        total_hours=s1_res["total_hours"], rest_hours_before=7.0, consecutive_days=7,
        risk_level=s1_res["risk_level"], triggered_rules=json.dumps(s1_res["triggered_rules"]),
        recommended_action=s1_res["recommended_action"], created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
    )

    s2_res = evaluate_shift_risk("08:00", "17:00", 60, 14.0, 4)
    s2 = ShiftSchedule(
        id=2, worker_id=3, worker_name="Selvam P.", industry="Construction", site_name="Coromandel Infrastructure Overpass",
        shift_date="2026-10-27", start_time="08:00", end_time="17:00", break_minutes=60,
        total_hours=s2_res["total_hours"], rest_hours_before=14.0, consecutive_days=4,
        risk_level=s2_res["risk_level"], triggered_rules=json.dumps(s2_res["triggered_rules"]),
        recommended_action=s2_res["recommended_action"], created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=8)
    )

    s3_res = evaluate_shift_risk("06:00", "22:00", 60, 6.5, 9)
    s3 = ShiftSchedule(
        id=3, worker_id=7, worker_name="Anbu R.", industry="College Facilities", site_name="SRM Tech Park & Engineering Complex",
        shift_date="2026-10-27", start_time="06:00", end_time="22:00", break_minutes=60,
        total_hours=s3_res["total_hours"], rest_hours_before=6.5, consecutive_days=9,
        risk_level=s3_res["risk_level"], triggered_rules=json.dumps(s3_res["triggered_rules"]),
        recommended_action=s3_res["recommended_action"], created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
    )

    s4_res = evaluate_shift_risk("07:30", "16:30", 60, 15.0, 3)
    s4 = ShiftSchedule(
        id=4, worker_id=8, worker_name="Deepa S.", industry="College Facilities", site_name="SRM Campus Hostels & Dining Hall 3",
        shift_date="2026-10-27", start_time="07:30", end_time="16:30", break_minutes=60,
        total_hours=s4_res["total_hours"], rest_hours_before=15.0, consecutive_days=3,
        risk_level=s4_res["risk_level"], triggered_rules=json.dumps(s4_res["triggered_rules"]),
        recommended_action=s4_res["recommended_action"], created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=12)
    )

    db.add_all([s1, s2, s3, s4])
    db.commit()

    # 6. Seed Activity Logs
    logs = [
        ActivityLog(action_type="DEMO_INITIALIZED", module="System", description="FairShift demonstration environment initialized with standard datasets.", actor="System Auto-Seed"),
        ActivityLog(action_type="WAGE_CHECKED", module="FairPay", description="Discrepancy of ₹1,625.00 flagged for Raman K. (14 overtime hours undercompensated).", actor="Worker Raman K.", target_id="1"),
        ActivityLog(action_type="REPORT_FILED", module="SilentShield", description="CRITICAL hazard report FS-2026-E4912 logged for exposed live conduit at Tower B.", actor="Worker Raman K.", target_id="FS-2026-E4912"),
        ActivityLog(action_type="STATUS_UPDATED", module="SilentShield", description="Report FS-2026-P1104 transitioned from OPEN to ACKNOWLEDGED by Site Safety Officer.", actor="Safety Officer Sundar", target_id="FS-2026-P1104"),
        ActivityLog(action_type="SHIFT_EVALUATED", module="ShiftGuardian", description="CRITICAL schedule risk flagged for Murugan S. (13.5h net shift + 7h rest breach).", actor="Shift Supervisor Demo", target_id="Murugan S."),
    ]
    db.add_all(logs)
    db.commit()

    return {"status": "seeded_successfully"}
