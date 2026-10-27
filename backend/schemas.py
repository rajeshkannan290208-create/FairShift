from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# Site & Worker Schemas
class SiteSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    industry: str
    location: str
    address: Optional[str] = None

class WorkerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    employee_code: str
    industry: str
    role: str
    site_id: Optional[int] = None
    default_rate: float
    rate_type: str
    phone_masked: str

# FairPay AI Schemas
class WageCalculateRequest(BaseModel):
    worker_id: Optional[int] = None
    worker_name: str = Field(..., min_length=2)
    industry: str = "Construction"
    site_name: Optional[str] = "Apex Heights Metro Tower"
    period: str = "Oct 20-26, 2026"
    rate_type: str = "HOURLY" # HOURLY or DAILY
    base_rate: float = Field(..., gt=0)
    regular_hours: float = Field(..., ge=0)
    overtime_hours: float = Field(0.0, ge=0)
    overtime_multiplier: float = Field(2.0, ge=1.0)
    recorded_pay: float = Field(..., ge=0)
    save_record: bool = False

class WageCalculateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    worker_name: str
    industry: str
    site_name: Optional[str] = None
    period: str
    regular_hours: float
    overtime_hours: float
    total_hours: float
    hourly_rate: float
    overtime_multiplier: float
    regular_pay: float
    overtime_pay: float
    expected_pay: float
    recorded_pay: float
    discrepancy: float
    status: str
    formula: str
    calculation_steps: List[str]
    explanation: str
    disclaimer: str
    created_at: Optional[datetime] = None

# SilentShield Schemas
class SafetyReportCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    category: str = Field(..., description="Electrical, PPE, Machinery, Sanitation, Harassment/Concern, Other")
    site_id: Optional[int] = None
    site_name: str = Field(..., min_length=2)
    location_description: Optional[str] = None
    description: str = Field(..., min_length=5)
    language: str = "en"
    is_confidential: bool = False
    reporter_name: Optional[str] = None
    reporter_role: Optional[str] = None

class SafetyReportAuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    old_status: str
    new_status: str
    changed_by: str
    notes: Optional[str]
    created_at: datetime

class SafetyReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reference_id: str
    title: str
    category: str
    site_id: Optional[int] = None
    site_name: str
    location_description: Optional[str] = None
    description: str
    language: str
    priority: str
    priority_reasons: List[str]
    recommended_action: Optional[str] = None
    status: str
    is_confidential: bool
    reporter_name: Optional[str] = None
    reporter_role: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    audits: List[SafetyReportAuditResponse] = []

class SafetyReportStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="OPEN, ACKNOWLEDGED, UNDER_INVESTIGATION, RESOLVED, ESCALATED")
    changed_by: str = "Supervisor Demo"
    notes: Optional[str] = None

# ShiftGuardian Schemas
class ShiftEvaluateRequest(BaseModel):
    worker_id: Optional[int] = None
    worker_name: str = Field(..., min_length=2)
    industry: str = "Construction"
    site_name: Optional[str] = None
    shift_date: str = "2026-10-27"
    start_time: str = "08:00"
    end_time: str = "20:00"
    break_minutes: int = Field(60, ge=0)
    rest_hours_before: float = Field(..., ge=0)
    consecutive_days: int = Field(1, ge=1)
    save_record: bool = False

class TriggeredRule(BaseModel):
    code: str
    rule_name: str
    severity: str
    description: str

class ShiftEvaluateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    worker_name: str
    industry: str
    site_name: Optional[str] = None
    shift_date: str
    start_time: str
    end_time: str
    break_minutes: int
    gross_hours: float
    total_hours: float
    rest_hours_before: float
    consecutive_days: int
    risk_level: str
    triggered_rules: List[TriggeredRule]
    recommended_action: str
    disclaimer: str
    created_at: Optional[datetime] = None

# Dashboard Metrics
class DashboardMetricsResponse(BaseModel):
    total_workers: int
    open_safety_reports: int
    critical_safety_reports: int
    wage_discrepancies_count: int
    wage_discrepancy_total_inr: float
    schedule_risks_count: int
    industry_filter: str
    recent_reports: List[Any]
    recent_wage_checks: List[Any]
    recent_shifts: List[Any]

# Activity Log
class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    action_type: str
    module: str
    description: str
    actor: str
    target_id: Optional[str]
    created_at: datetime
