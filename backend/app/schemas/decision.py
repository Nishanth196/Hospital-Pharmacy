from datetime import datetime
from typing import List, Optional, Any, Dict
from enum import Enum
from pydantic import BaseModel, Field


class RuleStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class RuleSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DecisionType(str, Enum):
    APPROVED = "APPROVED"
    BLOCKED = "BLOCKED"
    ESCALATED = "ESCALATED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlternativeMedicine(BaseModel):
    alternative_id: str
    medicine_name: str
    active_ingredient: str
    strength: str
    dosage_form: str
    approved: bool = True
    high_impact: bool = False
    tier: int = 1
    notes: Optional[str] = None


class PatientInformation(BaseModel):
    patient_id: Optional[str] = None
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = "Unknown"
    ward: Optional[str] = "General"
    egfr: Optional[float] = None
    weight_kg: Optional[float] = None
    pregnancy_status: Optional[bool] = False
    allergies: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)


class PrescriptionPayload(BaseModel):
    prescription_id: str
    patient_id: str
    medicine_id: str
    requested_medicine: str
    dosage: str
    route: str
    frequency: str
    ward: str
    urgency: str = "ROUTINE"  # ROUTINE, URGENT, STAT
    prescriber_id: str
    prescriber_name: Optional[str] = "Attending Physician"
    dispense_as_written: bool = False
    patient_information: Optional[PatientInformation] = None
    requested_alternative_id: Optional[str] = None
    requested_alternative_name: Optional[str] = None
    clinical_notes: Optional[str] = None


class RuleEvaluation(BaseModel):
    rule_id: str
    rule_name: str
    status: RuleStatus
    severity: RuleSeverity
    explanation: str
    evidence: str


class DecisionOutput(BaseModel):
    decision_id: str
    prescription_id: str
    patient_id: str
    requested_medicine: str
    alternative_id: Optional[str] = None
    alternative_name: Optional[str] = None
    decision: DecisionType
    risk_level: RiskLevel
    reasons: List[str]
    rules_checked: List[RuleEvaluation]
    failed_rules: List[RuleEvaluation]
    valid_alternatives: List[AlternativeMedicine]
    human_confirmation_required: bool
    escalation_required: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    latency_ms: Optional[float] = 0.0
    rules_count: int = 0
    status: Optional[str] = "PENDING_REVIEW"
