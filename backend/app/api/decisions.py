from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.models.entities import DecisionRecord, AuditEvent
from backend.app.schemas.audit import HumanConfirmationRequest, OverrideRequest
from backend.app.audit.logger import AuditLogger

router = APIRouter(prefix="/api/decisions", tags=["Decisions & Human Review"])


@router.get("/pending")
def get_pending_decisions(
    db: Session = Depends(get_db),
    limit: int = Query(50, le=100)
):
    """Returns decisions that require human review or confirmation."""
    records = db.query(DecisionRecord).filter(
        DecisionRecord.human_confirmation_required == True,
        DecisionRecord.status.in_(["PENDING_REVIEW", "ESCALATED"])
    ).order_by(DecisionRecord.created_at.desc()).limit(limit).all()
    return [r.to_dict() for r in records]


@router.get("/{decision_id}")
def get_decision_by_id(
    decision_id: str,
    db: Session = Depends(get_db)
):
    record = db.query(DecisionRecord).filter(DecisionRecord.decision_id == decision_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found")
    return record.to_dict()


@router.post("/{decision_id}/confirm")
def confirm_decision(
    decision_id: str,
    req: HumanConfirmationRequest,
    db: Session = Depends(get_db)
):
    """
    Clinically confirms a decision flagged for human review.
    Persists HUMAN_CONFIRMED event to the audit ledger.
    """
    record = db.query(DecisionRecord).filter(DecisionRecord.decision_id == decision_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found")

    record.status = "CONFIRMED"
    record.confirmed_by = req.user_id
    record.confirmed_at = datetime.utcnow()
    record.final_decision = record.decision
    db.commit()

    # Append to audit ledger
    audit_logger = AuditLogger(db)
    audit_logger.log_event(
        user_id=req.user_id,
        user_role=req.user_role,
        prescription_id=record.prescription_id,
        patient_id=record.patient_id,
        decision_id=record.decision_id,
        action="HUMAN_CONFIRMED",
        decision=record.decision,
        rationale=req.confirmation_notes or "Clinically confirmed by pharmacist following standard operating protocol.",
        rule_ids=[],
        alternative_id=record.alternative_id,
        override_requested=False,
        final_decision=record.decision,
        metadata={"confirmed_at": datetime.utcnow().isoformat()}
    )

    return {
        "status": "success",
        "message": f"Decision {decision_id} successfully confirmed.",
        "decision": record.to_dict()
    }


@router.post("/{decision_id}/override")
def override_decision(
    decision_id: str,
    req: OverrideRequest,
    db: Session = Depends(get_db)
):
    """
    Executes a formal clinical override.
    Requires mandatory justification (never allows silent override).
    Persists OVERRIDE_APPROVED event to the audit ledger.
    """
    if not req.override_reason or len(req.override_reason.strip()) < 5:
        raise HTTPException(status_code=400, detail="A mandatory, detailed clinical justification is required for all overrides.")

    record = db.query(DecisionRecord).filter(DecisionRecord.decision_id == decision_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found")

    prev_dec = record.decision
    record.status = "OVERRIDDEN"
    record.override_reason = req.override_reason
    record.override_by = req.user_id
    record.previous_decision = prev_dec
    record.final_decision = req.final_decision
    db.commit()

    # Append to audit ledger
    audit_logger = AuditLogger(db)
    audit_logger.log_event(
        user_id=req.user_id,
        user_role=req.user_role,
        prescription_id=record.prescription_id,
        patient_id=record.patient_id,
        decision_id=record.decision_id,
        action="OVERRIDE_APPROVED",
        decision=req.final_decision,
        rationale=f"Pharmacist Override Justification: {req.override_reason}",
        rule_ids=[],
        alternative_id=record.alternative_id,
        override_requested=True,
        override_reason=req.override_reason,
        previous_decision=prev_dec,
        final_decision=req.final_decision,
        metadata={
            "overridden_by": req.user_id,
            "overridden_at": datetime.utcnow().isoformat(),
            "previous_decision": prev_dec
        }
    )

    return {
        "status": "success",
        "message": f"Decision {decision_id} overridden to {req.final_decision}.",
        "decision": record.to_dict()
    }
