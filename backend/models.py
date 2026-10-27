import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    industry = Column(String(80), nullable=False, index=True) # Construction / College Facilities
    location = Column(String(150), nullable=False)
    address = Column(String(250), nullable=True)

    workers = relationship("Worker", back_populates="site")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    employee_code = Column(String(40), unique=True, index=True)
    industry = Column(String(80), nullable=False, index=True)
    role = Column(String(100), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    default_rate = Column(Float, default=500.0)
    rate_type = Column(String(20), default="DAILY") # DAILY or HOURLY
    phone_masked = Column(String(30), default="+91 98**** 1234")

    site = relationship("Site", back_populates="workers")

class WageCheck(Base):
    __tablename__ = "wage_checks"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    worker_name = Column(String(120), nullable=False)
    industry = Column(String(80), nullable=False, index=True)
    site_name = Column(String(120), nullable=True)
    period = Column(String(80), default="Current Week")
    total_hours = Column(Float, nullable=False)
    regular_hours = Column(Float, nullable=False)
    overtime_hours = Column(Float, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    overtime_multiplier = Column(Float, default=2.0)
    recorded_pay = Column(Float, nullable=False)
    expected_pay = Column(Float, nullable=False)
    discrepancy = Column(Float, nullable=False) # expected - recorded (positive = underpaid)
    status = Column(String(40), nullable=False, index=True) # LOOKS_CONSISTENT, NEEDS_REVIEW, POTENTIAL_DISCREPANCY
    formula_steps = Column(Text, nullable=True) # JSON or markdown string of steps
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(40), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(60), nullable=False, index=True) # Electrical, PPE, Machinery, Sanitation, Harassment/Concern, Other
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    site_name = Column(String(150), nullable=False)
    location_description = Column(String(250), nullable=True)
    description = Column(Text, nullable=False)
    language = Column(String(10), default="en") # en, ta
    priority = Column(String(30), nullable=False, index=True) # CRITICAL, HIGH, MEDIUM, LOW
    priority_reasons = Column(Text, nullable=True) # JSON array of string reasons
    recommended_action = Column(Text, nullable=True)
    status = Column(String(30), default="OPEN", index=True) # OPEN, ACKNOWLEDGED, UNDER_INVESTIGATION, RESOLVED, ESCALATED
    is_confidential = Column(Boolean, default=False)
    reporter_name = Column(String(120), nullable=True)
    reporter_role = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    audits = relationship("SafetyReportAudit", back_populates="report", cascade="all, delete-orphan")

class SafetyReportAudit(Base):
    __tablename__ = "safety_report_audits"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id"), nullable=False)
    old_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    changed_by = Column(String(100), default="Supervisor Demo")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("SafetyReport", back_populates="audits")

class ShiftSchedule(Base):
    __tablename__ = "shift_schedules"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    worker_name = Column(String(120), nullable=False)
    industry = Column(String(80), nullable=False, index=True)
    site_name = Column(String(150), nullable=True)
    shift_date = Column(String(30), nullable=False)
    start_time = Column(String(20), nullable=False) # e.g. "08:00"
    end_time = Column(String(20), nullable=False)   # e.g. "20:30"
    break_minutes = Column(Integer, default=60)
    total_hours = Column(Float, nullable=False)
    rest_hours_before = Column(Float, nullable=False)
    consecutive_days = Column(Integer, default=1)
    risk_level = Column(String(30), nullable=False, index=True) # LOW, MODERATE, HIGH, CRITICAL
    triggered_rules = Column(Text, nullable=True) # JSON array of rule triggers
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(60), nullable=False) # WAGE_CHECKED, REPORT_FILED, STATUS_UPDATED, SHIFT_EVALUATED, DEMO_RESET
    module = Column(String(40), nullable=False)      # FairPay, SilentShield, ShiftGuardian, System
    description = Column(Text, nullable=False)
    actor = Column(String(100), default="Demo User")
    target_id = Column(String(60), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
