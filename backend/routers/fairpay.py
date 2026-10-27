from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import json
from backend.database import get_db
from backend.models import WageCheck
from backend.schemas import WageCalculateRequest, WageCalculateResponse
from backend.services.wage_calculator import calculate_wages
from backend.services.audit_logger import log_activity

router = APIRouter(prefix="/api/fairpay", tags=["FairPay AI"])

@router.post("/calculate", response_model=WageCalculateResponse)
def calculate_wage_endpoint(
    req: WageCalculateRequest,
    db: Session = Depends(get_db)
):
    calc = calculate_wages(
        rate_type=req.rate_type,
        base_rate=req.base_rate,
        regular_hours=req.regular_hours,
        overtime_hours=req.overtime_hours,
        overtime_multiplier=req.overtime_multiplier,
        recorded_pay=req.recorded_pay
    )

    record_id = None
    created_at = None

    if req.save_record:
        record = WageCheck(
            worker_id=req.worker_id,
            worker_name=req.worker_name,
            industry=req.industry,
            site_name=req.site_name,
            period=req.period,
            total_hours=calc["total_hours"],
            regular_hours=req.regular_hours,
            overtime_hours=req.overtime_hours,
            hourly_rate=calc["hourly_rate"],
            overtime_multiplier=req.overtime_multiplier,
            recorded_pay=req.recorded_pay,
            expected_pay=calc["expected_pay"],
            discrepancy=calc["discrepancy"],
            status=calc["status"],
            formula_steps=json.dumps(calc["calculation_steps"]),
            explanation=calc["explanation"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id
        created_at = record.created_at

        # Log activity
        log_activity(
            db=db,
            action_type="WAGE_CHECKED",
            module="FairPay",
            description=f"Wage check run for {req.worker_name} ({req.industry}). Status: {calc['status']}, Delta: ₹{calc['discrepancy']:+,.2f}.",
            actor=f"Worker {req.worker_name}",
            target_id=str(record.id)
        )

    return WageCalculateResponse(
        id=record_id,
        worker_name=req.worker_name,
        industry=req.industry,
        site_name=req.site_name,
        period=req.period,
        regular_hours=req.regular_hours,
        overtime_hours=req.overtime_hours,
        total_hours=calc["total_hours"],
        hourly_rate=calc["hourly_rate"],
        overtime_multiplier=req.overtime_multiplier,
        regular_pay=calc["regular_pay"],
        overtime_pay=calc["overtime_pay"],
        expected_pay=calc["expected_pay"],
        recorded_pay=calc["recorded_pay"],
        discrepancy=calc["discrepancy"],
        status=calc["status"],
        formula=calc["formula"],
        calculation_steps=calc["calculation_steps"],
        explanation=calc["explanation"],
        disclaimer=calc["disclaimer"],
        created_at=created_at
    )

@router.get("/checks")
def list_wage_checks(
    industry: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(WageCheck)
    if industry and industry.lower() != "all":
        q = q.filter(WageCheck.industry.ilike(f"%{industry}%"))
    if status and status.lower() != "all":
        q = q.filter(WageCheck.status == status)

    records = q.order_by(WageCheck.created_at.desc()).all()
    results = []
    for r in records:
        steps = []
        if r.formula_steps:
            try:
                steps = json.loads(r.formula_steps)
            except Exception:
                steps = [r.formula_steps]
        results.append({
            "id": r.id,
            "worker_id": r.worker_id,
            "worker_name": r.worker_name,
            "industry": r.industry,
            "site_name": r.site_name,
            "period": r.period,
            "total_hours": r.total_hours,
            "regular_hours": r.regular_hours,
            "overtime_hours": r.overtime_hours,
            "hourly_rate": r.hourly_rate,
            "overtime_multiplier": r.overtime_multiplier,
            "recorded_pay": r.recorded_pay,
            "expected_pay": r.expected_pay,
            "discrepancy": r.discrepancy,
            "status": r.status,
            "calculation_steps": steps,
            "explanation": r.explanation,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return results

@router.get("/summary")
def get_fairpay_summary(
    industry: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(WageCheck)
    if industry and industry.lower() != "all":
        q = q.filter(WageCheck.industry.ilike(f"%{industry}%"))

    checks = q.all()
    total_checks = len(checks)
    discrepancies = [c for c in checks if c.status == "POTENTIAL_DISCREPANCY"]
    needs_review = [c for c in checks if c.status == "NEEDS_REVIEW"]
    consistent = [c for c in checks if c.status == "LOOKS_CONSISTENT"]
    total_shortfall = sum(c.discrepancy for c in discrepancies if c.discrepancy > 0)

    return {
        "total_checks": total_checks,
        "potential_discrepancies": len(discrepancies),
        "needs_review": len(needs_review),
        "consistent": len(consistent),
        "total_shortfall_inr": round(total_shortfall, 2),
    }
