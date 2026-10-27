from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
from backend.database import get_db
from backend.models import Worker, SafetyReport, WageCheck, ShiftSchedule, Site

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(
    industry: Optional[str] = Query(None, description="Filter by industry: 'Construction' or 'College Facilities'"),
    db: Session = Depends(get_db)
):
    # Base queries
    worker_q = db.query(Worker)
    report_q = db.query(SafetyReport)
    wage_q = db.query(WageCheck)
    shift_q = db.query(ShiftSchedule)

    if industry and industry.lower() != "all":
        worker_q = worker_q.filter(Worker.industry.ilike(f"%{industry}%"))
        report_q = report_q.join(Site, SafetyReport.site_id == Site.id, isouter=True).filter(
            (SafetyReport.site_name.ilike(f"%{industry}%")) |
            (Site.industry.ilike(f"%{industry}%")) |
            (SafetyReport.site_id.in_(db.query(Site.id).filter(Site.industry.ilike(f"%{industry}%"))))
        )
        wage_q = wage_q.filter(WageCheck.industry.ilike(f"%{industry}%"))
        shift_q = shift_q.filter(ShiftSchedule.industry.ilike(f"%{industry}%"))

    total_workers = worker_q.count()
    open_reports = report_q.filter(SafetyReport.status.in_(["OPEN", "ACKNOWLEDGED", "UNDER_INVESTIGATION"])).count()
    critical_reports = report_q.filter(
        SafetyReport.priority == "CRITICAL",
        SafetyReport.status.in_(["OPEN", "ACKNOWLEDGED", "UNDER_INVESTIGATION"])
    ).count()

    discrepant_checks = wage_q.filter(WageCheck.status == "POTENTIAL_DISCREPANCY").all()
    wage_discrepancies_count = len(discrepant_checks)
    wage_discrepancy_total_inr = sum(c.discrepancy for c in discrepant_checks if c.discrepancy > 0)

    schedule_risks_count = shift_q.filter(ShiftSchedule.risk_level.in_(["HIGH", "CRITICAL"])).count()

    # Recent items
    recent_reports_raw = report_q.order_by(SafetyReport.created_at.desc()).limit(6).all()
    recent_reports = []
    for r in recent_reports_raw:
        reasons = []
        if r.priority_reasons:
            try:
                reasons = json.loads(r.priority_reasons)
            except Exception:
                reasons = [r.priority_reasons]
        recent_reports.append({
            "id": r.id,
            "reference_id": r.reference_id,
            "title": r.title,
            "category": r.category,
            "site_name": r.site_name,
            "location_description": r.location_description,
            "priority": r.priority,
            "priority_reasons": reasons,
            "recommended_action": r.recommended_action,
            "status": r.status,
            "is_confidential": r.is_confidential,
            "reporter_name": "Confidential Worker" if r.is_confidential else r.reporter_name,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    recent_wage_checks_raw = wage_q.order_by(WageCheck.created_at.desc()).limit(6).all()
    recent_wage_checks = [{
        "id": w.id,
        "worker_name": w.worker_name,
        "industry": w.industry,
        "period": w.period,
        "total_hours": w.total_hours,
        "regular_hours": w.regular_hours,
        "overtime_hours": w.overtime_hours,
        "recorded_pay": w.recorded_pay,
        "expected_pay": w.expected_pay,
        "discrepancy": w.discrepancy,
        "status": w.status,
        "created_at": w.created_at.isoformat() if w.created_at else None
    } for w in recent_wage_checks_raw]

    recent_shifts_raw = shift_q.order_by(ShiftSchedule.created_at.desc()).limit(6).all()
    recent_shifts = [{
        "id": s.id,
        "worker_name": s.worker_name,
        "industry": s.industry,
        "shift_date": s.shift_date,
        "start_time": s.start_time,
        "end_time": s.end_time,
        "total_hours": s.total_hours,
        "rest_hours_before": s.rest_hours_before,
        "consecutive_days": s.consecutive_days,
        "risk_level": s.risk_level,
        "recommended_action": s.recommended_action,
        "created_at": s.created_at.isoformat() if s.created_at else None
    } for s in recent_shifts_raw]

    return {
        "total_workers": total_workers,
        "open_safety_reports": open_reports,
        "critical_safety_reports": critical_reports,
        "wage_discrepancies_count": wage_discrepancies_count,
        "wage_discrepancy_total_inr": round(wage_discrepancy_total_inr, 2),
        "schedule_risks_count": schedule_risks_count,
        "industry_filter": industry if industry else "All",
        "recent_reports": recent_reports,
        "recent_wage_checks": recent_wage_checks,
        "recent_shifts": recent_shifts
    }
