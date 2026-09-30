from datetime import datetime
import json
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text
)
from backend.app.database.connection import Base


def _safe_json_loads(val, default):
    if not val:
        return default
    try:
        return json.loads(val)
    except Exception:
        return default


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    user_id = Column(String(64), nullable=False, index=True)
    user_role = Column(String(64), nullable=False)
    prescription_id = Column(String(64), nullable=False, index=True)
    patient_id = Column(String(64), nullable=False, index=True)
    alternative_id = Column(String(64), nullable=True)
    decision_id = Column(String(64), nullable=False, index=True)
    action = Column(String(64), nullable=False, index=True)  # DECISION_CREATED, HUMAN_CONFIRMED, DECISION_ESCALATED, OVERRIDE_REQUESTED, OVERRIDE_APPROVED
    decision = Column(String(32), nullable=False, index=True)  # APPROVED, BLOCKED, ESCALATED, REVIEW_REQUIRED
    rule_ids = Column(Text, nullable=False, default="[]")  # JSON list
    rationale = Column(Text, nullable=False)
    override_requested = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    previous_decision = Column(String(32), nullable=True)
    final_decision = Column(String(32), nullable=True)
    event_metadata = Column(Text, nullable=True, default="{}")  # JSON dict

    def to_dict(self):
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "user_id": self.user_id,
            "user_role": self.user_role,
            "prescription_id": self.prescription_id,
            "patient_id": self.patient_id,
            "alternative_id": self.alternative_id,
            "decision_id": self.decision_id,
            "action": self.action,
            "decision": self.decision,
            "rule_ids": _safe_json_loads(self.rule_ids, []),
            "rationale": self.rationale,
            "override_requested": self.override_requested,
            "override_reason": self.override_reason,
            "previous_decision": self.previous_decision,
            "final_decision": self.final_decision,
            "metadata": _safe_json_loads(self.event_metadata, {})
        }


class DecisionRecord(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(String(64), unique=True, index=True, nullable=False)
    prescription_id = Column(String(64), nullable=False, index=True)
    patient_id = Column(String(64), nullable=False, index=True)
    requested_medicine = Column(String(128), nullable=False)
    alternative_id = Column(String(64), nullable=True)
    decision = Column(String(32), nullable=False, index=True)
    risk_level = Column(String(32), nullable=False)
    reasons = Column(Text, nullable=False, default="[]")  # JSON list
    rules_checked = Column(Text, nullable=False, default="[]")  # JSON list
    failed_rules = Column(Text, nullable=False, default="[]")  # JSON list
    valid_alternatives = Column(Text, nullable=False, default="[]")  # JSON list
    human_confirmation_required = Column(Boolean, default=False)
    escalation_required = Column(Boolean, default=False)
    status = Column(String(32), default="PENDING_REVIEW")  # PENDING_REVIEW, CONFIRMED, OVERRIDDEN, CLOSED
    latency_ms = Column(Float, default=0.0)
    rules_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    confirmed_by = Column(String(64), nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    override_reason = Column(Text, nullable=True)
    override_by = Column(String(64), nullable=True)
    previous_decision = Column(String(32), nullable=True)
    final_decision = Column(String(32), nullable=True)

    def to_dict(self):
        return {
            "decision_id": self.decision_id,
            "prescription_id": self.prescription_id,
            "patient_id": self.patient_id,
            "requested_medicine": self.requested_medicine,
            "alternative_id": self.alternative_id,
            "decision": self.decision,
            "risk_level": self.risk_level,
            "reasons": _safe_json_loads(self.reasons, []),
            "rules_checked": _safe_json_loads(self.rules_checked, []),
            "failed_rules": _safe_json_loads(self.failed_rules, []),
            "valid_alternatives": _safe_json_loads(self.valid_alternatives, []),
            "human_confirmation_required": self.human_confirmation_required,
            "escalation_required": self.escalation_required,
            "status": self.status,
            "latency_ms": self.latency_ms,
            "rules_count": self.rules_count,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "confirmed_by": self.confirmed_by,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
            "override_reason": self.override_reason,
            "override_by": self.override_by,
            "previous_decision": self.previous_decision,
            "final_decision": self.final_decision
        }


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(16), nullable=False)
    ward = Column(String(64), nullable=False)
    egfr = Column(Float, nullable=True)  # mL/min/1.73m^2
    weight_kg = Column(Float, nullable=True)
    pregnancy_status = Column(Boolean, default=False)
    conditions = Column(Text, default="[]")  # JSON list

    def to_dict(self):
        return {
            "patient_id": self.patient_id,
            "full_name": self.full_name,
            "age": self.age,
            "gender": self.gender,
            "ward": self.ward,
            "egfr": self.egfr,
            "weight_kg": self.weight_kg,
            "pregnancy_status": self.pregnancy_status,
            "conditions": json.loads(self.conditions) if self.conditions else []
        }


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prescription_id = Column(String(64), unique=True, index=True, nullable=False)
    patient_id = Column(String(64), nullable=False, index=True)
    medicine_id = Column(String(64), nullable=False)
    requested_medicine = Column(String(128), nullable=False)
    dosage = Column(String(64), nullable=False)
    route = Column(String(32), nullable=False)
    frequency = Column(String(32), nullable=False)
    ward = Column(String(64), nullable=False)
    urgency = Column(String(32), default="ROUTINE")  # ROUTINE, URGENT, STAT
    prescriber_id = Column(String(64), nullable=False)
    prescriber_name = Column(String(128), nullable=False)
    dispense_as_written = Column(Boolean, default=False)
    clinical_notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "prescription_id": self.prescription_id,
            "patient_id": self.patient_id,
            "medicine_id": self.medicine_id,
            "requested_medicine": self.requested_medicine,
            "dosage": self.dosage,
            "route": self.route,
            "frequency": self.frequency,
            "ward": self.ward,
            "urgency": self.urgency,
            "prescriber_id": self.prescriber_id,
            "prescriber_name": self.prescriber_name,
            "dispense_as_written": self.dispense_as_written,
            "clinical_notes": self.clinical_notes
        }


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    medicine_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    active_ingredient = Column(String(128), nullable=False)
    strength = Column(String(64), nullable=False)
    dosage_form = Column(String(64), nullable=False)
    high_impact = Column(Boolean, default=False)
    formulary_status = Column(String(32), default="FORMULARY")

    def to_dict(self):
        return {
            "medicine_id": self.medicine_id,
            "name": self.name,
            "active_ingredient": self.active_ingredient,
            "strength": self.strength,
            "dosage_form": self.dosage_form,
            "high_impact": self.high_impact,
            "formulary_status": self.formulary_status
        }


class AlternativeMedicineRecord(Base):
    __tablename__ = "alternatives"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alternative_id = Column(String(64), unique=True, index=True, nullable=False)
    original_medicine_id = Column(String(64), nullable=False, index=True)
    medicine_name = Column(String(128), nullable=False)
    active_ingredient = Column(String(128), nullable=False)
    strength = Column(String(64), nullable=False)
    dosage_form = Column(String(64), nullable=False)
    approved = Column(Boolean, default=True)
    high_impact = Column(Boolean, default=False)
    tier = Column(Integer, default=1)
    notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "alternative_id": self.alternative_id,
            "original_medicine_id": self.original_medicine_id,
            "medicine_name": self.medicine_name,
            "active_ingredient": self.active_ingredient,
            "strength": self.strength,
            "dosage_form": self.dosage_form,
            "approved": self.approved,
            "high_impact": self.high_impact,
            "tier": self.tier,
            "notes": self.notes
        }


class StockRecord(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_id = Column(String(64), unique=True, index=True, nullable=False)
    medicine_id = Column(String(64), nullable=False, index=True)
    medicine_name = Column(String(128), nullable=False)
    ward = Column(String(64), nullable=False)
    quantity = Column(Integer, default=0)
    in_stock = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "stock_id": self.stock_id,
            "medicine_id": self.medicine_id,
            "medicine_name": self.medicine_name,
            "ward": self.ward,
            "quantity": self.quantity,
            "in_stock": self.in_stock
        }


class AllergyRecord(Base):
    __tablename__ = "allergies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    allergy_id = Column(String(64), unique=True, index=True, nullable=False)
    patient_id = Column(String(64), nullable=False, index=True)
    allergen = Column(String(128), nullable=False)
    allergen_type = Column(String(64), default="ACTIVE_INGREDIENT")
    severity = Column(String(32), default="HIGH")  # MILD, MODERATE, HIGH, CRITICAL
    reaction = Column(String(128), nullable=False)

    def to_dict(self):
        return {
            "allergy_id": self.allergy_id,
            "patient_id": self.patient_id,
            "allergen": self.allergen,
            "allergen_type": self.allergen_type,
            "severity": self.severity,
            "reaction": self.reaction
        }


class PrescriberRule(Base):
    __tablename__ = "prescriber_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(String(64), unique=True, index=True, nullable=False)
    prescriber_id = Column(String(64), nullable=False, index=True)
    medicine_id = Column(String(64), nullable=False)
    restriction_type = Column(String(64), nullable=False)  # NO_SUBSTITUTION, RESTRICTED_TO_TIER_1, SENIOR_APPROVAL_REQUIRED
    justification = Column(Text, nullable=False)

    def to_dict(self):
        return {
            "rule_id": self.rule_id,
            "prescriber_id": self.prescriber_id,
            "medicine_id": self.medicine_id,
            "restriction_type": self.restriction_type,
            "justification": self.justification
        }
