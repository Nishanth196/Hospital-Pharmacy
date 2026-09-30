import pytest
from pydantic import ValidationError
from backend.app.schemas.decision import (
    PrescriptionPayload,
    AlternativeMedicine,
    RuleEvaluation,
    DecisionOutput,
    RuleStatus,
    RuleSeverity,
    DecisionType,
    RiskLevel,
    PatientInformation,
)
from backend.app.schemas.audit import HumanConfirmationRequest, OverrideRequest


def test_prescription_payload_valid():
    payload = PrescriptionPayload(
        prescription_id="RX-101",
        patient_id="PAT-101",
        medicine_id="MED-001",
        requested_medicine="Amoxicillin 500mg Oral",
        dosage="500mg",
        route="Oral",
        frequency="TID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-01",
    )
    assert payload.prescription_id == "RX-101"
    assert payload.urgency == "ROUTINE"
    assert payload.dispense_as_written is False


def test_rule_evaluation_schema():
    eval_rule = RuleEvaluation(
        rule_id="RULE-001",
        rule_name="Formulary Approval",
        status=RuleStatus.PASS,
        severity=RuleSeverity.LOW,
        explanation="Approved on formulary",
        evidence="Listed in Tier 1"
    )
    assert eval_rule.status == RuleStatus.PASS
    assert eval_rule.severity == RuleSeverity.LOW


def test_override_request_requires_reason():
    with pytest.raises(ValidationError):
        # Min length is 5
        OverrideRequest(
            user_id="DOC-101",
            user_role="Senior Pharmacist",
            override_reason="No",
            final_decision="APPROVED"
        )
