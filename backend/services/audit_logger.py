from sqlalchemy.orm import Session
from backend.models import ActivityLog

def log_activity(
    db: Session,
    action_type: str,
    module: str,
    description: str,
    actor: str = "Demo User",
    target_id: str = None
) -> ActivityLog:
    entry = ActivityLog(
        action_type=action_type,
        module=module,
        description=description,
        actor=actor,
        target_id=str(target_id) if target_id else None
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
