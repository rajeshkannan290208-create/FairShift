from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Worker, Site
from backend.schemas import WorkerSchema, SiteSchema

router = APIRouter(prefix="/api", tags=["Workers & Sites"])

@router.get("/sites", response_model=List[SiteSchema])
def list_sites(
    industry: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Site)
    if industry and industry.lower() != "all":
        q = q.filter(Site.industry.ilike(f"%{industry}%"))
    return q.all()

@router.get("/workers", response_model=List[WorkerSchema])
def list_workers(
    industry: Optional[str] = Query(None),
    site_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Worker)
    if industry and industry.lower() != "all":
        q = q.filter(Worker.industry.ilike(f"%{industry}%"))
    if site_id:
        q = q.filter(Worker.site_id == site_id)
    return q.all()
