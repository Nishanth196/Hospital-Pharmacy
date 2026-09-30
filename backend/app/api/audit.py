from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.audit.logger import AuditLogger
from backend.app.schemas.audit import AuditEventResponse

router = APIRouter(prefix="/api/audit", tags=["Audit Ledger"])


@router.get("", response_model=List[AuditEventResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    decision_id: Optional[str] = Query(None, description="Filter by decision ID"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    decision: Optional[str] = Query(None, description="Filter by decision type"),
    action: Optional[str] = Query(None, description="Filter by audit action"),
    prescription_id: Optional[str] = Query(None, description="Filter by prescription ID"),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    """
    Returns audit events from the immutable persistent ledger in chronological order.
    Supports filtering by user_id, decision, action, and prescription_id.
    """
    logger = AuditLogger(db)
    events = logger.get_events(
        decision_id=decision_id,
        user_id=user_id,
        decision=decision,
        action=action,
        prescription_id=prescription_id,
        limit=limit,
        offset=offset
    )
    return events


@router.get("/{decision_id}", response_model=List[AuditEventResponse])
def get_audit_by_decision(
    decision_id: str,
    db: Session = Depends(get_db),
):
    """Returns chronological audit trail specifically for a given decision ID."""
    logger = AuditLogger(db)
    events = logger.get_events(decision_id=decision_id, limit=50)
    return events
