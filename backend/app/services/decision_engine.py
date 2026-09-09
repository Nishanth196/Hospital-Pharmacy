from sqlalchemy.orm import Session
from .. import models
from typing import List, Dict, Tuple

# Rule identifiers for traceability
RULE_ALLERGY = "R001"
RULE_APPROVED_ALTERNATIVE = "R002"
RULE_STOCK = "R003"
RULE_PATIENT_CONSTRAINT = "R004"
RULE_PRESCRIBER = "R005"
RULE_CLINICAL_AMBIGUITY = "R006"
RULE_ALL_PASS = "R007"

def check_allergy(patient: models.Patient, alt_medicine: models.Medicine) -> Tuple[bool, str]:
    """Return (failed, reason) if patient has allergy to alternative active ingredient."""
    if not alt_medicine.active_ingredient:
        return False, ""
    patient_allergies = (patient.allergies or "").split(",")
    # simple check: if active ingredient appears in allergy list (case‑insensitive)
    for allergen in patient_allergies:
        if allergen.strip().lower() == alt_medicine.active_ingredient.lower():
            return True, f"Active ingredient '{alt_medicine.active_ingredient}' conflicts with patient allergy."
    return False, ""

def check_approved_alternative(medicine_id: int, alt_id: int, db: Session) -> Tuple[bool, str]:
    alt = (
        db.query(models.ApprovedAlternative)
        .filter(
            models.ApprovedAlternative.medicine_id == medicine_id,
            models.ApprovedAlternative.alternative_medicine_id == alt_id,
        )
        .first()
    )
    if not alt or not alt.approved:
        return True, "Alternative not listed as an approved substitution."
    return False, ""

def check_stock(alt_medicine: models.Medicine, db: Session) -> Tuple[bool, str]:
    stock = db.query(models.Stock).filter(models.Stock.medicine_id == alt_medicine.id).first()
    if not stock or stock.quantity <= 0:
        return True, "Alternative out of stock."
    return False, ""

def check_patient_constraints(patient: models.Patient) -> Tuple[bool, str]:
    # For demo we just look at boolean flags.
    if patient.renal_constraint:
        return True, "Patient has renal constraint that blocks this substitution."
    if patient.hepatic_constraint:
        return True, "Patient has hepatic constraint that blocks this substitution."
    if patient.pregnancy_constraint:
        return True, "Patient is pregnant; substitution not allowed."
    return False, ""

def check_prescriber_rule(prescriber_rule: models.PrescriberRule, urgency: str) -> Tuple[bool, str, bool]:
    """Return (requires_escalation, reason, human_confirmation_required)."""
    if prescriber_rule.approval_required:
        # Allow only if urgency is permitted
        allowed = prescriber_rule.urgency_allowed.split(",") if prescriber_rule.urgency_allowed else []
        if urgency not in allowed:
            return True, "Prescriber approval required for this medicine and urgency.", True
        else:
            return True, "Prescriber approval required (allowed urgency).", True
    return False, "", False

def check_clinical_ambiguity(medicine: models.Medicine, alt_medicine: models.Medicine) -> Tuple[bool, str]:
    # In a real system we would have a clinical equivalence matrix.
    # For demo, treat missing therapeutic_group match as ambiguous.
    if medicine.therapeutic_group != alt_medicine.therapeutic_group:
        return True, "Clinical equivalence cannot be established between medicines."
    return False, ""

def evaluate_substitution(prescription: models.Prescription, db: Session) -> Dict:
    """Runs all rules for each approved alternative and returns the best recommendation.
    Returns a dict matching the API response format.
    """
    patient = db.query(models.Patient).filter(models.Patient.id == prescription.patient_id).first()
    medicine = db.query(models.Medicine).filter(models.Medicine.id == prescription.medicine_id).first()

    alternatives = (
        db.query(models.ApprovedAlternative)
        .filter(models.ApprovedAlternative.medicine_id == medicine.id)
        .all()
    )
    results = []
    for alt_rel in alternatives:
        alt_medicine = db.query(models.Medicine).filter(models.Medicine.id == alt_rel.alternative_medicine_id).first()
        # Run rules sequentially, collecting failures
        triggered = []
        # Rule 1: Allergy
        fail, reason = check_allergy(patient, alt_medicine)
        if fail:
            results.append({
                "alternative": alt_medicine.medicine_name,
                "decision": "BLOCK",
                "risk_level": "HIGH",
                "reasons": [reason],
                "triggered_rules": [RULE_ALLERGY],
                "human_confirmation_required": True,
                "escalation_required": False,
            })
            continue
        # Rule 2: Approved alternative already satisfied by query (we only fetched approved ones)
        # Still verify in case of data inconsistency
        fail, reason = check_approved_alternative(medicine.id, alt_medicine.id, db)
        if fail:
            results.append({
                "alternative": alt_medicine.medicine_name,
                "decision": "BLOCK",
                "risk_level": "MEDIUM",
                "reasons": [reason],
                "triggered_rules": [RULE_APPROVED_ALTERNATIVE],
                "human_confirmation_required": True,
                "escalation_required": False,
            })
            continue
        # Rule 3: Stock
        fail, reason = check_stock(alt_medicine, db)
        if fail:
            # Mark as unavailable but keep evaluating others
            results.append({
                "alternative": alt_medicine.medicine_name,
                "decision": "UNAVAILABLE",
                "risk_level": None,
                "reasons": [reason],
                "triggered_rules": [RULE_STOCK],
                "human_confirmation_required": False,
                "escalation_required": False,
            })
            continue
        # Rule 4: Patient constraints
        fail, reason = check_patient_constraints(patient)
        if fail:
            results.append({
                "alternative": alt_medicine.medicine_name,
                "decision": "BLOCK",
                "risk_level": "HIGH",
                "reasons": [reason],
                "triggered_rules": [RULE_PATIENT_CONSTRAINT],
                "human_confirmation_required": True,
                "escalation_required": False,
            })
            continue
        # Rule 5: Prescriber rule
        pres_rule = db.query(models.PrescriberRule).filter(models.PrescriberRule.medicine_id == alt_medicine.id).first()
        if pres_rule:
            esc, reason, human_conf = check_prescriber_rule(pres_rule, prescription.urgency)
            if esc:
                results.append({
                    "alternative": alt_medicine.medicine_name,
                    "decision": "ESCALATE",
                    "risk_level": "MEDIUM",
                    "reasons": [reason],
                    "triggered_rules": [RULE_PRESCRIBER],
                    "human_confirmation_required": human_conf,
                    "escalation_required": True,
                })
                continue
        # Rule 6: Clinical ambiguity
        fail, reason = check_clinical_ambiguity(medicine, alt_medicine)
        if fail:
            results.append({
                "alternative": alt_medicine.medicine_name,
                "decision": "ESCALATE",
                "risk_level": "MEDIUM",
                "reasons": [reason],
                "triggered_rules": [RULE_CLINICAL_AMBIGUITY],
                "human_confirmation_required": True,
                "escalation_required": True,
            })
            continue
        # All checks passed – recommend
        results.append({
            "alternative": alt_medicine.medicine_name,
            "decision": "RECOMMEND",
            "risk_level": "LOW",
            "reasons": ["All checks passed"],
            "triggered_rules": [RULE_ALL_PASS],
            "human_confirmation_required": True,
            "escalation_required": False,
        })
    # Choose best recommendation if any RECOMMEND present
    recommend = next((r for r in results if r["decision"] == "RECOMMEND"), None)
    response = {
        "prescription_id": prescription.id,
        "requested_medicine": medicine.medicine_name,
        "alternatives": results,
        "recommended": recommend,
    }
    return response
