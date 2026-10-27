from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.models import ActivityLog
from backend.schemas import ActivityLogResponse
from backend.seed_data import seed_database
from backend.services.audit_logger import log_activity
from backend.config import APP_ENV

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "FairShift Core Platform",
        "version": "1.0.0-hackathon-final",
        "environment": APP_ENV,
        "database": db_status
    }

@router.post("/demo-reset")
def reset_demo_data(
    confirm: bool = Query(True, description="Safety check"),
    db: Session = Depends(get_db)
):
    if not confirm:
        raise HTTPException(status_code=400, detail="Confirmation required to reset demonstration data.")

    result = seed_database(db, reset=True)
    log_activity(
        db=db,
        action_type="DEMO_RESET",
        module="System",
        description="Demo database was restored to baseline benchmark state.",
        actor="Demo Supervisor",
        target_id="SYSTEM"
    )
    return {"status": "success", "message": "FairShift demonstration data successfully restored to original benchmark state."}

@router.get("/activities", response_model=List[ActivityLogResponse])
def get_activities(
    limit: int = Query(25, ge=1, le=100),
    module: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(ActivityLog)
    if module and module.lower() != "all":
        q = q.filter(ActivityLog.module.ilike(f"%{module}%"))
    return q.order_by(ActivityLog.created_at.desc()).limit(limit).all()
