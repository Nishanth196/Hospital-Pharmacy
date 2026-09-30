from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HumanConfirmationRequest(BaseModel):
    user_id: str = Field(..., description="ID of the clinician or pharmacist confirming")
    user_role: str = Field("Clinical Pharmacist", description="Role of the user")
    confirmation_notes: Optional[str] = Field("Clinically confirmed by pharmacist.", description="Clinical rationale note")


class OverrideRequest(BaseModel):
    user_id: str = Field(..., description="ID of the pharmacist requesting/approving override")
    user_role: str = Field("Senior Pharmacist", description="Role of the user")
    override_reason: str = Field(..., min_length=5, description="Mandatory detailed clinical justification")
    final_decision: str = Field("APPROVED", description="Target overridden decision")


class AuditEventResponse(BaseModel):
    event_id: str
    timestamp: Optional[str] = None
    user_id: str
    user_role: str
    prescription_id: str
    patient_id: str
    alternative_id: Optional[str] = None
    decision_id: str
    action: str
    decision: str
    rule_ids: List[str] = Field(default_factory=list)
    rationale: str
    override_requested: bool = False
    override_reason: Optional[str] = None
    previous_decision: Optional[str] = None
    final_decision: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
