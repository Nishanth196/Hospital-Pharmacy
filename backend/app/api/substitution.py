from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database.connection import get_db
from backend.app.schemas.decision import PrescriptionPayload, DecisionOutput
from backend.app.rules.engine import DeterministicRuleEngine

router = APIRouter(prefix="/api/substitution", tags=["Substitution"])


@router.post("/check", response_model=DecisionOutput)
def check_substitution(
    payload: PrescriptionPayload,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header("PHARMACIST-101", alias="X-User-Id"),
    x_user_role: Optional[str] = Header("Clinical Pharmacist", alias="X-User-Role"),
):
    """
    Evaluates a requested medicine substitution through the deterministic 15-step rule engine.
    Persists decision and audit events automatically.
    """
    engine = DeterministicRuleEngine(db=db)
    result = engine.evaluate(
        payload=payload,
        user_id=x_user_id or "PHARMACIST-101",
        user_role=x_user_role or "Clinical Pharmacist",
        persist_audit=True,
    )
    return result
