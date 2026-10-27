from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import json
from backend.database import get_db
from backend.models import ShiftSchedule
from backend.schemas import ShiftEvaluateRequest, ShiftEvaluateResponse, TriggeredRule
from backend.services.shift_guardian import evaluate_shift_risk
from backend.services.audit_logger import log_activity

router = APIRouter(prefix="/api/shiftguardian", tags=["ShiftGuardian"])

@router.post("/evaluate", response_model=ShiftEvaluateResponse)
def evaluate_shift_endpoint(
    req: ShiftEvaluateRequest,
    db: Session = Depends(get_db)
):
    eval_res = evaluate_shift_risk(
        start_time=req.start_time,
        end_time=req.end_time,
        break_minutes=req.break_minutes,
        rest_hours_before=req.rest_hours_before,
        consecutive_days=req.consecutive_days
    )

    record_id = None
    created_at = None

    if req.save_record:
        record = ShiftSchedule(
            worker_id=req.worker_id,
            worker_name=req.worker_name,
            industry=req.industry,
            site_name=req.site_name,
            shift_date=req.shift_date,
            start_time=req.start_time,
            end_time=req.end_time,
            break_minutes=req.break_minutes,
            total_hours=eval_res["total_hours"],
            rest_hours_before=req.rest_hours_before,
            consecutive_days=req.consecutive_days,
            risk_level=eval_res["risk_level"],
            triggered_rules=json.dumps(eval_res["triggered_rules"]),
            recommended_action=eval_res["recommended_action"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id
        created_at = record.created_at

        # Log activity
        log_activity(
            db=db,
            action_type="SHIFT_EVALUATED",
            module="ShiftGuardian",
            description=f"Shift evaluated for {req.worker_name} ({req.shift_date}). Risk: {eval_res['risk_level']} ({eval_res['total_hours']}h work, {req.rest_hours_before}h rest).",
            actor=f"Supervisor Demo",
            target_id=str(record.id)
        )

    return ShiftEvaluateResponse(
        id=record_id,
        worker_name=req.worker_name,
        industry=req.industry,
        site_name=req.site_name,
        shift_date=req.shift_date,
        start_time=req.start_time,
        end_time=req.end_time,
        break_minutes=req.break_minutes,
        gross_hours=eval_res["gross_hours"],
        total_hours=eval_res["total_hours"],
        rest_hours_before=req.rest_hours_before,
        consecutive_days=req.consecutive_days,
        risk_level=eval_res["risk_level"],
        triggered_rules=[TriggeredRule(**r) for r in eval_res["triggered_rules"]],
        recommended_action=eval_res["recommended_action"],
        disclaimer=eval_res["disclaimer"],
        created_at=created_at
    )

@router.get("/schedules")
def list_shift_schedules(
    industry: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(ShiftSchedule)
    if industry and industry.lower() != "all":
        q = q.filter(ShiftSchedule.industry.ilike(f"%{industry}%"))
    if risk_level and risk_level.lower() != "all":
        q = q.filter(ShiftSchedule.risk_level == risk_level.upper())

    records = q.order_by(ShiftSchedule.created_at.desc()).all()
    results = []
    for s in records:
        rules = []
        if s.triggered_rules:
            try:
                rules = json.loads(s.triggered_rules)
            except Exception:
                rules = []
        results.append({
            "id": s.id,
            "worker_id": s.worker_id,
            "worker_name": s.worker_name,
            "industry": s.industry,
            "site_name": s.site_name,
            "shift_date": s.shift_date,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "break_minutes": s.break_minutes,
            "total_hours": s.total_hours,
            "rest_hours_before": s.rest_hours_before,
            "consecutive_days": s.consecutive_days,
            "risk_level": s.risk_level,
            "triggered_rules": rules,
            "recommended_action": s.recommended_action,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })
    return results
