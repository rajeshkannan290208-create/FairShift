from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, Path
from sqlalchemy.orm import Session
import json
from backend.database import get_db
from backend.models import SafetyReport, SafetyReportAudit, Site
from backend.schemas import (
    SafetyReportCreateRequest, SafetyReportResponse, SafetyReportStatusUpdateRequest,
    SafetyReportAuditResponse
)
from backend.services.hazard_prioritizer import evaluate_hazard_priority, generate_report_reference
from backend.services.audit_logger import log_activity

router = APIRouter(prefix="/api/silentshield", tags=["SilentShield"])

def serialize_report(r: SafetyReport) -> Dict[str, Any]:
    reasons = []
    if r.priority_reasons:
        try:
            reasons = json.loads(r.priority_reasons)
        except Exception:
            reasons = [r.priority_reasons]

    audits = []
    for a in r.audits:
        audits.append({
            "id": a.id,
            "old_status": a.old_status,
            "new_status": a.new_status,
            "changed_by": a.changed_by,
            "notes": a.notes,
            "created_at": a.created_at
        })

    return {
        "id": r.id,
        "reference_id": r.reference_id,
        "title": r.title,
        "category": r.category,
        "site_id": r.site_id,
        "site_name": r.site_name,
        "location_description": r.location_description,
        "description": r.description,
        "language": r.language,
        "priority": r.priority,
        "priority_reasons": reasons,
        "recommended_action": r.recommended_action,
        "status": r.status,
        "is_confidential": r.is_confidential,
        "reporter_name": "Confidential Worker" if r.is_confidential else r.reporter_name,
        "reporter_role": r.reporter_role,
        "created_at": r.created_at,
        "updated_at": r.updated_at,
        "audits": audits
    }

@router.post("/reports", response_model=SafetyReportResponse)
def create_safety_report(
    req: SafetyReportCreateRequest,
    db: Session = Depends(get_db)
):
    # Deterministic priority evaluation
    eval_res = evaluate_hazard_priority(
        category=req.category,
        title=req.title,
        description=req.description,
        location=req.location_description or ""
    )

    reference_id = generate_report_reference()

    report = SafetyReport(
        reference_id=reference_id,
        title=req.title,
        category=req.category,
        site_id=req.site_id,
        site_name=req.site_name,
        location_description=req.location_description,
        description=req.description,
        language=req.language,
        priority=eval_res["priority"],
        priority_reasons=json.dumps(eval_res["priority_reasons"]),
        recommended_action=eval_res["recommended_action"],
        status="OPEN",
        is_confidential=req.is_confidential,
        reporter_name=req.reporter_name or "Anonymous Worker",
        reporter_role=req.reporter_role or "Field Worker"
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # Initial audit entry
    initial_audit = SafetyReportAudit(
        report_id=report.id,
        old_status="NONE",
        new_status="OPEN",
        changed_by=f"Worker ({'Confidential' if req.is_confidential else report.reporter_name})",
        notes="Hazard report submitted via SilentShield reporting terminal."
    )
    db.add(initial_audit)
    db.commit()
    db.refresh(report)

    # Activity log
    log_activity(
        db=db,
        action_type="REPORT_FILED",
        module="SilentShield",
        description=f"Safety report {reference_id} created [{report.priority}]: '{report.title}' at {report.site_name}.",
        actor=f"{'Confidential' if req.is_confidential else report.reporter_name}",
        target_id=reference_id
    )

    return serialize_report(report)

@router.get("/reports", response_model=List[SafetyReportResponse])
def list_safety_reports(
    industry: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(SafetyReport)
    if industry and industry.lower() != "all":
        q = q.join(Site, SafetyReport.site_id == Site.id, isouter=True).filter(
            (SafetyReport.site_name.ilike(f"%{industry}%")) |
            (Site.industry.ilike(f"%{industry}%")) |
            (SafetyReport.site_id.in_(db.query(Site.id).filter(Site.industry.ilike(f"%{industry}%"))))
        )
    if status and status.lower() != "all":
        q = q.filter(SafetyReport.status == status.upper())
    if priority and priority.lower() != "all":
        q = q.filter(SafetyReport.priority == priority.upper())
    if category and category.lower() != "all":
        q = q.filter(SafetyReport.category.ilike(f"%{category}%"))

    reports = q.order_by(SafetyReport.created_at.desc()).all()
    return [serialize_report(r) for r in reports]

@router.get("/reports/track/{reference_id}", response_model=SafetyReportResponse)
def track_safety_report(
    reference_id: str = Path(..., description="Report tracking reference (e.g. FS-2026-E4912)"),
    db: Session = Depends(get_db)
):
    report = db.query(SafetyReport).filter(SafetyReport.reference_id == reference_id.strip().upper()).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"No hazard report found for reference '{reference_id}'. Please verify the ID.")
    return serialize_report(report)

@router.patch("/reports/{report_id}/status", response_model=SafetyReportResponse)
def update_report_status(
    report_id: int,
    req: SafetyReportStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Safety report not found")

    valid_statuses = ["OPEN", "ACKNOWLEDGED", "UNDER_INVESTIGATION", "RESOLVED", "ESCALATED"]
    new_status = req.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    old_status = report.status
    report.status = new_status
    db.commit()

    # Append audit entry
    audit = SafetyReportAudit(
        report_id=report.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=req.changed_by,
        notes=req.notes or f"Status transitioned from {old_status} to {new_status}."
    )
    db.add(audit)
    db.commit()
    db.refresh(report)

    # Log activity
    log_activity(
        db=db,
        action_type="STATUS_UPDATED",
        module="SilentShield",
        description=f"Report {report.reference_id} marked as {new_status} by {req.changed_by}.",
        actor=req.changed_by,
        target_id=report.reference_id
    )

    return serialize_report(report)
