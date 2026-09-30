import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.models.entities import AuditEvent, DecisionRecord
from backend.app.schemas.audit import AuditEventResponse


class AuditLogger:
    def __init__(self, db: Session):
        self.db = db

    def log_event(
        self,
        user_id: str,
        user_role: str,
        prescription_id: str,
        patient_id: str,
        decision_id: str,
        action: str,
        decision: str,
        rationale: str,
        rule_ids: Optional[List[str]] = None,
        alternative_id: Optional[str] = None,
        override_requested: bool = False,
        override_reason: Optional[str] = None,
        previous_decision: Optional[str] = None,
        final_decision: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:10].upper()}",
            timestamp=datetime.utcnow(),
            user_id=user_id,
            user_role=user_role,
            prescription_id=prescription_id,
            patient_id=patient_id,
            alternative_id=alternative_id,
            decision_id=decision_id,
            action=action,
            decision=decision,
            rule_ids=json.dumps(rule_ids or []),
            rationale=rationale,
            override_requested=override_requested,
            override_reason=override_reason,
            previous_decision=previous_decision,
            final_decision=final_decision or decision,
            event_metadata=json.dumps(metadata or {})
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_events(
        self,
        decision_id: Optional[str] = None,
        user_id: Optional[str] = None,
        decision: Optional[str] = None,
        action: Optional[str] = None,
        prescription_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = self.db.query(AuditEvent)

        if decision_id:
            query = query.filter(AuditEvent.decision_id == decision_id)
        if user_id:
            query = query.filter(AuditEvent.user_id == user_id)
        if decision:
            query = query.filter(AuditEvent.decision == decision)
        if action:
            query = query.filter(AuditEvent.action == action)
        if prescription_id:
            query = query.filter(AuditEvent.prescription_id == prescription_id)

        # Chronological descending (or ascending per request; user says: "Return audit events in chronological order.")
        # Chronological order by timestamp ascending
        events = query.order_by(AuditEvent.timestamp.asc()).offset(offset).limit(limit).all()
        return [e.to_dict() for e in events]
