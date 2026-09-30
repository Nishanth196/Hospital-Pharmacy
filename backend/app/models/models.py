from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base
import datetime

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    allergies = Column(Text)  # comma‑separated list for simplicity
    conditions = Column(Text)
    renal_constraint = Column(Boolean, default=False)
    hepatic_constraint = Column(Boolean, default=False)
    pregnancy_constraint = Column(Boolean, default=False)
    other_constraints = Column(Text)

    prescriptions = relationship("Prescription", back_populates="patient")
    allergy_records = relationship("Allergy", back_populates="patient")

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    medicine_code = Column(String, unique=True, index=True, nullable=False)
    medicine_name = Column(String, nullable=False)
    active_ingredient = Column(String)
    strength = Column(String)
    dosage_form = Column(String)
    route = Column(String)
    therapeutic_group = Column(String)

    alternatives = relationship("ApprovedAlternative", foreign_keys="[ApprovedAlternative.medicine_id]", back_populates="medicine")
    stock = relationship("Stock", uselist=False, back_populates="medicine")

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    prescription_code = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    dose = Column(String)
    route = Column(String)
    frequency = Column(String)
    urgency = Column(String)  # ROUTINE / URGENT / EMERGENCY
    prescriber_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    medicine = relationship("Medicine")
    decision = relationship("SubstitutionDecision", uselist=False, back_populates="prescription")

class ApprovedAlternative(Base):
    __tablename__ = "approved_alternatives"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    alternative_medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    approved = Column(Boolean, default=True)
    clinical_group = Column(String)
    notes = Column(Text)

    medicine = relationship("Medicine", foreign_keys=[medicine_id], back_populates="alternatives")
    alternative = relationship("Medicine", foreign_keys=[alternative_medicine_id])

class Allergy(Base):
    __tablename__ = "allergies"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    allergen = Column(String, nullable=False)
    severity = Column(String)

    patient = relationship("Patient", back_populates="allergy_records")

class Stock(Base):
    __tablename__ = "stock"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, unique=True)
    quantity = Column(Integer, default=0)
    location = Column(String)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    medicine = relationship("Medicine", back_populates="stock")

class PrescriberRule(Base):
    __tablename__ = "prescriber_rules"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    approval_required = Column(Boolean, default=False)
    rule_description = Column(Text)
    urgency_allowed = Column(String)  # e.g., "ROUTINE,URGENT"
    notes = Column(Text)

class SubstitutionDecision(Base):
    __tablename__ = "substitution_decisions"
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, unique=True)
    requested_medicine = Column(String)
    alternative_medicine = Column(String)
    system_decision = Column(String)  # BLOCK / RECOMMEND / ESCALATE / UNAVAILABLE
    risk_level = Column(String)
    reasons = Column(Text)
    triggered_rules = Column(Text)
    human_confirmation_required = Column(Boolean, default=False)
    reviewer = Column(String)
    human_decision = Column(String)
    override = Column(Boolean, default=False)
    override_reason = Column(Text)
    escalation_level = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    prescription = relationship("Prescription", back_populates="decision")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("substitution_decisions.id"), nullable=False)
    action = Column(String)
    performed_by = Column(String)
    reason = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    decision = relationship("SubstitutionDecision")
