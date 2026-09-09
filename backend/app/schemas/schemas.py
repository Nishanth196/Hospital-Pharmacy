from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

class PatientBase(BaseModel):
    patient_code: str = Field(..., description="Unique patient identifier")
    age: int
    gender: str
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    renal_constraint: bool = False
    hepatic_constraint: bool = False
    pregnancy_constraint: bool = False
    other_constraints: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int

    class Config:
        orm_mode = True

class MedicineBase(BaseModel):
    medicine_code: str
    medicine_name: str
    active_ingredient: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    route: Optional[str] = None
    therapeutic_group: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class Medicine(MedicineBase):
    id: int

    class Config:
        orm_mode = True

class PrescriptionBase(BaseModel):
    prescription_code: str
    patient_id: int
    medicine_id: int
    medicine_name: str
    dose: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    urgency: str = Field(..., description="ROUTINE, URGENT, or EMERGENCY")
    prescriber_name: Optional[str] = None
    created_at: Optional[datetime.datetime] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class Prescription(PrescriptionBase):
    id: int

    class Config:
        orm_mode = True

class AlternativeBase(BaseModel):
    medicine_id: int
    alternative_medicine_id: int
    approved: bool = True
    clinical_group: Optional[str] = None
    notes: Optional[str] = None

class AlternativeCreate(AlternativeBase):
    pass

class Alternative(AlternativeBase):
    id: int

    class Config:
        orm_mode = True

class StockBase(BaseModel):
    medicine_id: int
    quantity: int
    location: Optional[str] = None

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    last_updated: datetime.datetime

    class Config:
        orm_mode = True

class PrescriberRuleBase(BaseModel):
    medicine_id: int
    approval_required: bool = False
    rule_description: Optional[str] = None
    urgency_allowed: Optional[str] = None
    notes: Optional[str] = None

class PrescriberRuleCreate(PrescriberRuleBase):
    pass

class PrescriberRule(PrescriberRuleBase):
    id: int

    class Config:
        orm_mode = True

class SubstitutionDecisionBase(BaseModel):
    prescription_id: int
    requested_medicine: Optional[str] = None
    alternative_medicine: Optional[str] = None
    system_decision: str
    risk_level: Optional[str] = None
    reasons: Optional[str] = None
    triggered_rules: Optional[str] = None
    human_confirmation_required: bool = False
    reviewer: Optional[str] = None
    human_decision: Optional[str] = None
    override: bool = False
    override_reason: Optional[str] = None
    escalation_level: Optional[int] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

class SubstitutionDecisionCreate(SubstitutionDecisionBase):
    pass

class SubstitutionDecision(SubstitutionDecisionBase):
    id: int

    class Config:
        orm_mode = True

class AuditLogBase(BaseModel):
    decision_id: int
    action: str
    performed_by: str
    reason: Optional[str] = None
    timestamp: Optional[datetime.datetime] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int

    class Config:
        orm_mode = True
