import json
import pytest
from pydantic import ValidationError
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database.connection import Base
from backend.app.models.entities import DecisionRecord, AuditEvent
from backend.app.audit.logger import AuditLogger
from backend.app.api.decisions import confirm_decision, override_decision
from backend.app.schemas.audit import HumanConfirmationRequest, OverrideRequest


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Create dummy decision
    dec = DecisionRecord(
        decision_id="DEC-TEST-99",
        prescription_id="RX-99",
        patient_id="PAT-99",
        requested_medicine="Tacrolimus 1mg",
        alternative_id="ALT-007",
        decision="REVIEW_REQUIRED",
        risk_level="HIGH",
        reasons=json.dumps(["Narrow therapeutic index"]),
        rules_checked="[]",
        failed_rules="[]",
        valid_alternatives="[]",
        human_confirmation_required=True,
        escalation_required=False,
        status="PENDING_REVIEW",
        latency_ms=12.5,
        rules_count=10
    )
    db.add(dec)
    db.commit()

    yield db
    db.close()


def test_audit_logger_persistence(test_db):
    logger = AuditLogger(test_db)
    evt = logger.log_event(
        user_id="PHARM-01",
        user_role="Clinical Pharmacist",
        prescription_id="RX-101",
        patient_id="PAT-101",
        decision_id="DEC-TEST-99",
        action="DECISION_CREATED",
        decision="REVIEW_REQUIRED",
        rationale="Initial algorithmic evaluation",
        rule_ids=["RULE-005"]
    )
    assert evt.id is not None
    assert evt.action == "DECISION_CREATED"

    events = logger.get_events(decision_id="DEC-TEST-99")
    assert len(events) >= 1
    assert events[0]["action"] == "DECISION_CREATED"


def test_human_confirmation_workflow(test_db):
    req = HumanConfirmationRequest(
        user_id="PHARM-01",
        user_role="Clinical Pharmacist",
        confirmation_notes="Pharmacist verified serum drug concentration history."
    )
    res = confirm_decision("DEC-TEST-99", req, test_db)
    assert res["status"] == "success"

    record = test_db.query(DecisionRecord).filter(DecisionRecord.decision_id == "DEC-TEST-99").first()
    assert record.status == "CONFIRMED"
    assert record.confirmed_by == "PHARM-01"

    # Check that audit log has HUMAN_CONFIRMED
    audit_evt = test_db.query(AuditEvent).filter(
        AuditEvent.decision_id == "DEC-TEST-99",
        AuditEvent.action == "HUMAN_CONFIRMED"
    ).first()
    assert audit_evt is not None
    assert "serum drug concentration" in audit_evt.rationale


def test_override_workflow_and_silent_rejection(test_db):
    # Empty or short reason should fail validation
    with pytest.raises((HTTPException, ValidationError)):
        override_decision("DEC-TEST-99", OverrideRequest(
            user_id="PHARM-CHIEF",
            user_role="Chief of Pharmacy",
            override_reason="   ",
            final_decision="APPROVED"
        ), test_db)

    # Valid override
    req = OverrideRequest(
        user_id="PHARM-CHIEF",
        user_role="Chief of Pharmacy",
        override_reason="Attending physician confirmed patient has previously tolerated this formulation without adverse events.",
        final_decision="APPROVED"
    )
    res = override_decision("DEC-TEST-99", req, test_db)
    assert res["status"] == "success"

    record = test_db.query(DecisionRecord).filter(DecisionRecord.decision_id == "DEC-TEST-99").first()
    assert record.status == "OVERRIDDEN"
    assert record.final_decision == "APPROVED"
    assert record.override_by == "PHARM-CHIEF"

    # Check audit log
    audit_evt = test_db.query(AuditEvent).filter(
        AuditEvent.decision_id == "DEC-TEST-99",
        AuditEvent.action == "OVERRIDE_APPROVED"
    ).first()
    assert audit_evt is not None
    assert audit_evt.override_requested is True
    assert audit_evt.final_decision == "APPROVED"
