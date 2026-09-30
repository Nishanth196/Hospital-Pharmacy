from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.app.schemas.decision import (
    PrescriptionPayload,
    PatientInformation,
    DecisionType,
)
from backend.app.rules.engine import DeterministicRuleEngine


def get_fifteen_test_fixtures() -> List[Dict[str, Any]]:
    """
    Returns the 15 canonical test fixtures covering all required clinical scenarios:
    1. Safe substitution
    2. Allergy conflict
    3. Alternative not approved
    4. Alternative out of stock
    5. Prescriber restriction
    6. High-impact medication
    7. Missing critical information
    8. Urgent case
    9. Multiple simultaneous failures
    10. No valid alternative
    11. Multiple valid alternatives
    12. Conflicting constraints
    13. Outpatient case
    14. Ward case
    15. Operating room case
    """
    fixtures = [
        # 1. Safe substitution
        {
            "test_id": "TEST-001",
            "name": "Safe Substitution - Routine Inpatient",
            "category": "Routine Inpatient",
            "description": "Standard oral antibiotic substitution with approved tier-1 generic, full stock, and zero allergies.",
            "payload": {
                "prescription_id": "RX-SAFE-01",
                "patient_id": "PAT-1003",
                "medicine_id": "MED-001",
                "requested_medicine": "Amoxicillin 500mg Oral",
                "dosage": "500mg",
                "route": "Oral",
                "frequency": "TID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-301",
                "prescriber_name": "Dr. Angela Foster",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-001",
                "patient_information": {
                    "patient_id": "PAT-1003",
                    "full_name": "John Williams",
                    "age": 45,
                    "gender": "Male",
                    "ward": "General Ward A",
                    "egfr": 95.0,
                    "weight_kg": 76.0,
                    "pregnancy_status": False,
                    "allergies": ["sulfa"],
                    "conditions": []
                }
            },
            "expected_decision": DecisionType.APPROVED.value,
            "expected_failed_rules": [],
            "human_review_expected": False
        },
        # 2. Allergy conflict
        {
            "test_id": "TEST-002",
            "name": "Allergy Conflict - Penicillin Anaphylaxis",
            "category": "Safety Contraindication",
            "description": "Patient with documented penicillin allergy requested Ampicillin alternative.",
            "payload": {
                "prescription_id": "RX-ALL-01",
                "patient_id": "PAT-1002",
                "medicine_id": "MED-001",
                "requested_medicine": "Amoxicillin 500mg Oral",
                "dosage": "500mg",
                "route": "Oral",
                "frequency": "TID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-306",
                "prescriber_name": "Dr. Nathan Cole",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-001",
                "patient_information": {
                    "patient_id": "PAT-1002",
                    "full_name": "Mary Johnson",
                    "age": 38,
                    "gender": "Female",
                    "ward": "General Ward A",
                    "egfr": 88.0,
                    "weight_kg": 64.0,
                    "pregnancy_status": False,
                    "allergies": ["penicillin"],
                    "conditions": []
                }
            },
            "expected_decision": DecisionType.BLOCKED.value,
            "expected_failed_rules": ["RULE-002"],
            "human_review_expected": False
        },
        # 3. Alternative not approved
        {
            "test_id": "TEST-003",
            "name": "Alternative Not Approved on Formulary",
            "category": "Formulary Compliance",
            "description": "Prescription requests unapproved experimental formulation.",
            "payload": {
                "prescription_id": "RX-NOAPP-01",
                "patient_id": "PAT-1003",
                "medicine_id": "MED-001",
                "requested_medicine": "Amoxicillin 500mg Oral",
                "dosage": "500mg",
                "route": "Oral",
                "frequency": "TID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-309",
                "prescriber_name": "Dr. Victor Vance",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-017",
                "patient_information": {
                    "patient_id": "PAT-1003",
                    "age": 45,
                    "egfr": 90.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.BLOCKED.value,
            "expected_failed_rules": ["RULE-001"],
            "human_review_expected": False
        },
        # 4. Alternative out of stock
        {
            "test_id": "TEST-004",
            "name": "Alternative Out of Stock",
            "category": "Supply Chain & Inventory",
            "description": "Alternative medicine stock count is zero in all hospital dispensaries.",
            "payload": {
                "prescription_id": "RX-OOS-01",
                "patient_id": "PAT-1005",
                "medicine_id": "MED-002",
                "requested_medicine": "Ciprofloxacin 500mg Oral",
                "dosage": "500mg",
                "route": "Oral",
                "frequency": "BID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-310",
                "prescriber_name": "Dr. Emily Watson",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-018",
                "patient_information": {
                    "patient_id": "PAT-1005",
                    "age": 63,
                    "egfr": 75.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.ESCALATED.value,
            "expected_failed_rules": ["RULE-003"],
            "human_review_expected": True
        },
        # 5. Prescriber restriction
        {
            "test_id": "TEST-005",
            "name": "Prescriber Restriction (Dispense As Written)",
            "category": "Prescriber Policy",
            "description": "Prescription explicitly tagged Dispense As Written by attending physician.",
            "payload": {
                "prescription_id": "RX-PR-01",
                "patient_id": "PAT-1007",
                "medicine_id": "MED-003",
                "requested_medicine": "Warfarin 5mg Oral",
                "dosage": "5mg",
                "route": "Oral",
                "frequency": "Daily",
                "ward": "Cardiology Ward",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-201",
                "prescriber_name": "Dr. Robert Vance",
                "dispense_as_written": True,
                "requested_alternative_id": "ALT-004",
                "patient_information": {
                    "patient_id": "PAT-1007",
                    "age": 68,
                    "egfr": 65.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.ESCALATED.value,
            "expected_failed_rules": ["RULE-004"],
            "human_review_expected": True
        },
        # 6. High-impact medication
        {
            "test_id": "TEST-006",
            "name": "High-Impact Medication (Narrow Therapeutic Index)",
            "category": "High-Impact Safety",
            "description": "Tacrolimus immunosuppressant substitution requires mandatory pharmacist review.",
            "payload": {
                "prescription_id": "RX-HI-01",
                "patient_id": "PAT-1009",
                "medicine_id": "MED-006",
                "requested_medicine": "Tacrolimus 1mg Oral",
                "dosage": "1mg",
                "route": "Oral",
                "frequency": "BID",
                "ward": "Oncology Ward",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-312",
                "prescriber_name": "Dr. Simon Pegg",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-007",
                "patient_information": {
                    "patient_id": "PAT-1009",
                    "age": 52,
                    "egfr": 70.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.REVIEW_REQUIRED.value,
            "expected_failed_rules": ["RULE-005"],
            "human_review_expected": True
        },
        # 7. Missing critical information
        {
            "test_id": "TEST-007",
            "name": "Missing Critical Patient Information",
            "category": "Data Completeness",
            "description": "Renally cleared drug (Metformin) prescribed without renal eGFR record.",
            "payload": {
                "prescription_id": "RX-MISS-01",
                "patient_id": "PAT-MISSING",
                "medicine_id": "MED-004",
                "requested_medicine": "Metformin 850mg Oral",
                "dosage": "850mg",
                "route": "Oral",
                "frequency": "BID",
                "ward": "Outpatient Clinic",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-314",
                "prescriber_name": "Dr. Henry Cavill",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-005",
                "patient_information": {
                    "patient_id": "PAT-MISSING",
                    "age": None,
                    "egfr": None,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.ESCALATED.value,
            "expected_failed_rules": ["RULE-006"],
            "human_review_expected": True
        },
        # 8. Urgent case
        {
            "test_id": "TEST-008",
            "name": "Urgent ICU Stat Case with Missing Data",
            "category": "Critical Care",
            "description": "STAT ICU prescription missing baseline renal labs requiring pharmacist escalation.",
            "payload": {
                "prescription_id": "RX-URG-01",
                "patient_id": "PAT-1013",
                "medicine_id": "MED-013",
                "requested_medicine": "Vancomycin 1g IV",
                "dosage": "1g",
                "route": "IV",
                "frequency": "STAT",
                "ward": "ICU",
                "urgency": "STAT",
                "prescriber_id": "DOC-315",
                "prescriber_name": "Dr. Jeremy Renner",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-014",
                "patient_information": {
                    "patient_id": "PAT-1013",
                    "age": 60,
                    "egfr": None,  # renally cleared, missing eGFR -> RULE-006
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.ESCALATED.value,
            "expected_failed_rules": ["RULE-006"],
            "human_review_expected": True
        },
        # 9. Multiple simultaneous failures
        {
            "test_id": "TEST-009",
            "name": "Multiple Simultaneous Failures (Allergy + Unapproved)",
            "category": "Complex Multi-Failure",
            "description": "Prescription triggers both unapproved formulary status and patient allergy conflict.",
            "payload": {
                "prescription_id": "RX-MULTI-01",
                "patient_id": "PAT-1002",
                "medicine_id": "MED-001",
                "requested_medicine": "Amoxicillin 500mg Oral",
                "dosage": "500mg",
                "route": "Oral",
                "frequency": "TID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-306",
                "prescriber_name": "Dr. Nathan Cole",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-017",
                "patient_information": {
                    "patient_id": "PAT-1002",
                    "age": 38,
                    "egfr": 88.0,
                    "allergies": ["penicillin"]
                }
            },
            "expected_decision": DecisionType.BLOCKED.value,
            "expected_failed_rules": ["RULE-001", "RULE-002"],
            "human_review_expected": False
        },
        # 10. No valid alternative remains
        {
            "test_id": "TEST-010",
            "name": "No Valid Alternative Remains",
            "category": "Formulary Exhaustion",
            "description": "Prescription for medication with zero approved or non-conflicting alternatives.",
            "payload": {
                "prescription_id": "RX-NOALT-01",
                "patient_id": "PAT-1008",
                "medicine_id": "MED-NONEXISTENT",
                "requested_medicine": "Experimental Compound Omega",
                "dosage": "100mg",
                "route": "Oral",
                "frequency": "Daily",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-307",
                "prescriber_name": "Dr. Gregory White",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-UNLISTED",
                "requested_alternative_name": "Unapproved Experimental Generic Penicillin-X",
                "patient_information": {
                    "patient_id": "PAT-1008",
                    "age": 42,
                    "egfr": 85.0,
                    "allergies": ["penicillin-x"]
                }
            },
            "expected_decision": DecisionType.BLOCKED.value,  # Allergy & unapproved rule blocks it
            "expected_failed_rules": ["RULE-001", "RULE-002"],
            "human_review_expected": False
        },
        # 11. Multiple valid alternatives
        {
            "test_id": "TEST-011",
            "name": "Multiple Valid Alternatives Available",
            "category": "Optimal Selection",
            "description": "Multiple valid therapeutic options present; engine validates primary tier-1 substitute.",
            "payload": {
                "prescription_id": "RX-MULTIALT-01",
                "patient_id": "PAT-1005",
                "medicine_id": "MED-001",
                "requested_medicine": "Amoxicillin 500mg Oral",
                "dosage": "500mg",
                "route": "Oral",
                "frequency": "TID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-302",
                "prescriber_name": "Dr. Mark Davis",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-001",
                "patient_information": {
                    "patient_id": "PAT-1005",
                    "age": 63,
                    "egfr": 80.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.APPROVED.value,
            "expected_failed_rules": [],
            "human_review_expected": False
        },
        # 12. Conflicting constraints (Renal contraindication)
        {
            "test_id": "TEST-012",
            "name": "Conflicting Clinical Constraints (Renal Impairment)",
            "category": "Clinical Constraints",
            "description": "Patient with severe renal impairment (eGFR 22 mL/min) receiving renally eliminated drug.",
            "payload": {
                "prescription_id": "RX-CONF-01",
                "patient_id": "PAT-1001",
                "medicine_id": "MED-004",
                "requested_medicine": "Metformin 850mg Oral",
                "dosage": "850mg",
                "route": "Oral",
                "frequency": "BID",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-303",
                "prescriber_name": "Dr. Rachel Scott",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-005",
                "patient_information": {
                    "patient_id": "PAT-1001",
                    "full_name": "James Smith",
                    "age": 74,
                    "gender": "Male",
                    "ward": "General Ward A",
                    "egfr": 22.0,  # eGFR < 30 contraindicates Metformin
                    "weight_kg": 68.0,
                    "pregnancy_status": False,
                    "allergies": [],
                    "conditions": ["Severe Chronic Kidney Disease"]
                }
            },
            "expected_decision": DecisionType.REVIEW_REQUIRED.value,
            "expected_failed_rules": ["RULE-007"],
            "human_review_expected": True
        },
        # 13. Outpatient case
        {
            "test_id": "TEST-013",
            "name": "Outpatient Ambulatory Care Substitution",
            "category": "Outpatient Care",
            "description": "Ambulatory lipid clinic switch from Atorvastatin to Rosuvastatin.",
            "payload": {
                "prescription_id": "RX-OUT-01",
                "patient_id": "PAT-1015",
                "medicine_id": "MED-008",
                "requested_medicine": "Atorvastatin 20mg Oral",
                "dosage": "20mg",
                "route": "Oral",
                "frequency": "At Bedtime",
                "ward": "Outpatient Clinic",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-328",
                "prescriber_name": "Dr. Anthony Hopkins",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-009",
                "patient_information": {
                    "patient_id": "PAT-1015",
                    "age": 45,
                    "egfr": 92.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.APPROVED.value,
            "expected_failed_rules": [],
            "human_review_expected": False
        },
        # 14. Ward case
        {
            "test_id": "TEST-014",
            "name": "Routine Ward Inpatient Substitution",
            "category": "Routine Inpatient",
            "description": "General Ward routine PPI interchange to Esomeprazole IV.",
            "payload": {
                "prescription_id": "RX-WARD-01",
                "patient_id": "PAT-1010",
                "medicine_id": "MED-012",
                "requested_medicine": "Pantoprazole 40mg IV",
                "dosage": "40mg",
                "route": "IV",
                "frequency": "Daily",
                "ward": "General Ward A",
                "urgency": "ROUTINE",
                "prescriber_id": "DOC-304",
                "prescriber_name": "Dr. Brian Lee",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-013",
                "patient_information": {
                    "patient_id": "PAT-1010",
                    "age": 52,
                    "egfr": 85.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.APPROVED.value,
            "expected_failed_rules": [],
            "human_review_expected": False
        },
        # 15. Operating room case
        {
            "test_id": "TEST-015",
            "name": "Operating Room High-Risk Opioid Switch",
            "category": "Surgical / OR",
            "description": "Surgical suite IV Morphine to Hydromorphone high-potency substitution.",
            "payload": {
                "prescription_id": "RX-OR-01",
                "patient_id": "PAT-1016",
                "medicine_id": "MED-010",
                "requested_medicine": "Morphine 10mg/mL IV",
                "dosage": "5mg",
                "route": "IV",
                "frequency": "STAT",
                "ward": "Surgery Suite / OR",
                "urgency": "STAT",
                "prescriber_id": "DOC-316",
                "prescriber_name": "Dr. Vanessa Kirby",
                "dispense_as_written": False,
                "requested_alternative_id": "ALT-011",
                "patient_information": {
                    "patient_id": "PAT-1016",
                    "age": 31,
                    "egfr": 105.0,
                    "allergies": []
                }
            },
            "expected_decision": DecisionType.REVIEW_REQUIRED.value,
            "expected_failed_rules": ["RULE-005"],
            "human_review_expected": True
        }
    ]
    return fixtures


def run_evaluation_suite(db: Session, persist_decisions: bool = False) -> Dict[str, Any]:
    """
    Executes all 15 deterministic test fixtures against the rule engine.
    Calculates genuine measured statistics:
    - total_cases
    - correct_decisions
    - incorrect_decisions
    - accuracy
    - approved
    - blocked
    - escalated
    - review_required
    - human_review_count
    - false_positive_escalation_rate
    - false_negative_approval_rate
    """
    engine = DeterministicRuleEngine(db=db)
    fixtures = get_fifteen_test_fixtures()

    total_cases = len(fixtures)
    correct_decisions = 0
    incorrect_decisions = 0

    approved_count = 0
    blocked_count = 0
    escalated_count = 0
    review_required_count = 0
    human_review_count = 0

    false_positive_escalations = 0
    false_negative_approvals = 0

    case_results = []

    for item in fixtures:
        payload_dict = item["payload"]
        payload = PrescriptionPayload(**payload_dict)

        decision_out = engine.evaluate(
            payload=payload,
            user_id="BENCHMARK_EVALUATOR",
            user_role="System Validator",
            persist_audit=persist_decisions
        )

        actual_decision = decision_out.decision.value
        expected_decision = item["expected_decision"]
        is_correct = (actual_decision == expected_decision)

        if is_correct:
            correct_decisions += 1
        else:
            incorrect_decisions += 1

        if actual_decision == DecisionType.APPROVED.value:
            approved_count += 1
        elif actual_decision == DecisionType.BLOCKED.value:
            blocked_count += 1
        elif actual_decision == DecisionType.ESCALATED.value:
            escalated_count += 1
        elif actual_decision == DecisionType.REVIEW_REQUIRED.value:
            review_required_count += 1

        if decision_out.human_confirmation_required:
            human_review_count += 1

        # Track error rates:
        # False Positive Escalation: expected APPROVED, but actual was ESCALATED
        if expected_decision == DecisionType.APPROVED.value and actual_decision == DecisionType.ESCALATED.value:
            false_positive_escalations += 1

        # False Negative Approval: expected BLOCKED or ESCALATED, but actual was APPROVED
        if expected_decision in [DecisionType.BLOCKED.value, DecisionType.ESCALATED.value] and actual_decision == DecisionType.APPROVED.value:
            false_negative_approvals += 1

        case_results.append({
            "test_id": item["test_id"],
            "name": item["name"],
            "category": item["category"],
            "expected_decision": expected_decision,
            "actual_decision": actual_decision,
            "is_correct": is_correct,
            "risk_level": decision_out.risk_level.value,
            "failed_rules": [r.rule_id for r in decision_out.failed_rules],
            "human_confirmation_required": decision_out.human_confirmation_required,
            "latency_ms": decision_out.latency_ms,
            "reasons": decision_out.reasons
        })

    accuracy = round((correct_decisions / total_cases) * 100.0, 2) if total_cases > 0 else 0.0
    fp_escalation_rate = round((false_positive_escalations / total_cases) * 100.0, 2) if total_cases > 0 else 0.0
    fn_approval_rate = round((false_negative_approvals / total_cases) * 100.0, 2) if total_cases > 0 else 0.0

    return {
        "total_cases": total_cases,
        "correct_decisions": correct_decisions,
        "incorrect_decisions": incorrect_decisions,
        "accuracy": accuracy,
        "approved": approved_count,
        "blocked": blocked_count,
        "escalated": escalated_count,
        "review_required": review_required_count,
        "human_review_count": human_review_count,
        "false_positive_escalation_rate": fp_escalation_rate,
        "false_negative_approval_rate": fn_approval_rate,
        "case_results": case_results
    }
