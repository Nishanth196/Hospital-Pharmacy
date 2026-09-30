from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..services.decision_engine import evaluate_substitution
import datetime

router = APIRouter()

@router.post("/substitution/evaluate", response_model=dict)
def evaluate(prescription_id: int, db: Session = Depends(database.get_db)):
    prescription = db.query(models.Prescription).filter(models.Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    result = evaluate_substitution(prescription, db)
    
    # Store or update decision record
    existing = db.query(models.SubstitutionDecision).filter(models.SubstitutionDecision.prescription_id == prescription_id).first()
    rec = result.get("recommended") or (result.get("alternatives")[0] if result.get("alternatives") else None)
    
    sys_dec = rec["decision"] if rec else "UNAVAILABLE"
    risk = rec.get("risk_level", "LOW") if rec else "LOW"
    reasons = ", ".join(rec.get("reasons", [])) if rec else "No alternative available"
    rules = ", ".join(rec.get("triggered_rules", [])) if rec else ""
    alt_name = rec["alternative"] if rec else None

    if existing:
        existing.requested_medicine = prescription.medicine_name
        existing.alternative_medicine = alt_name
        existing.system_decision = sys_dec
        existing.risk_level = risk
        existing.reasons = reasons
        existing.triggered_rules = rules
        existing.human_confirmation_required = rec.get("human_confirmation_required", False) if rec else False
        existing.updated_at = datetime.datetime.utcnow()
        decision_obj = existing
    else:
        decision_obj = models.SubstitutionDecision(
            prescription_id=prescription.id,
            requested_medicine=prescription.medicine_name,
            alternative_medicine=alt_name,
            system_decision=sys_dec,
            risk_level=risk,
            reasons=reasons,
            triggered_rules=rules,
            human_confirmation_required=rec.get("human_confirmation_required", False) if rec else False,
            escalation_level=1 if sys_dec == "ESCALATE" else 0,
        )
        db.add(decision_obj)
    
    db.commit()
    db.refresh(decision_obj)
    result["decision_id"] = decision_obj.id
    return result

@router.get("/decisions", response_model=list[schemas.SubstitutionDecision])
def list_decisions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.SubstitutionDecision).offset(skip).limit(limit).all()

@router.get("/decisions/{decision_id}", response_model=schemas.SubstitutionDecision)
def get_decision(decision_id: int, db: Session = Depends(database.get_db)):
    dec = db.query(models.SubstitutionDecision).filter(models.SubstitutionDecision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    return dec

@router.post("/decisions/{decision_id}/approve", response_model=schemas.SubstitutionDecision)
def approve_decision(decision_id: int, reviewer: str = "Pharmacist", db: Session = Depends(database.get_db)):
    dec = db.query(models.SubstitutionDecision).filter(models.SubstitutionDecision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    dec.human_decision = "APPROVED"
    dec.reviewer = reviewer
    dec.updated_at = datetime.datetime.utcnow()
    
    # Audit log
    audit = models.AuditLog(
        decision_id=dec.id,
        action="APPROVED",
        performed_by=reviewer,
        reason="Human pharmacist confirmed recommended substitution.",
    )
    db.add(audit)
    db.commit()
    db.refresh(dec)
    return dec

@router.post("/decisions/{decision_id}/reject", response_model=schemas.SubstitutionDecision)
def reject_decision(decision_id: int, reviewer: str = "Pharmacist", reason: str = "Pharmacist rejected substitution", db: Session = Depends(database.get_db)):
    dec = db.query(models.SubstitutionDecision).filter(models.SubstitutionDecision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    dec.human_decision = "REJECTED"
    dec.reviewer = reviewer
    dec.updated_at = datetime.datetime.utcnow()
    
    audit = models.AuditLog(
        decision_id=dec.id,
        action="REJECTED",
        performed_by=reviewer,
        reason=reason,
    )
    db.add(audit)
    db.commit()
    db.refresh(dec)
    return dec

@router.post("/decisions/{decision_id}/escalate", response_model=schemas.SubstitutionDecision)
def escalate_decision(decision_id: int, level: int = 2, reviewer: str = "Pharmacist", reason: str = "Escalated for higher clinical review", db: Session = Depends(database.get_db)):
    dec = db.query(models.SubstitutionDecision).filter(models.SubstitutionDecision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    dec.human_decision = "ESCALATED"
    dec.escalation_level = level
    dec.reviewer = reviewer
    dec.updated_at = datetime.datetime.utcnow()
    
    audit = models.AuditLog(
        decision_id=dec.id,
        action=f"ESCALATED_LEVEL_{level}",
        performed_by=reviewer,
        reason=reason,
    )
    db.add(audit)
    db.commit()
    db.refresh(dec)
    return dec

@router.post("/decisions/{decision_id}/override", response_model=schemas.SubstitutionDecision)
def override_decision(
    decision_id: int,
    reviewer: str = "Senior Pharmacist",
    override_reason: str = Body(..., embed=True),
    db: Session = Depends(database.get_db)
):
    if not override_reason or not override_reason.strip():
        raise HTTPException(status_code=400, detail="Override reason is mandatory and cannot be empty.")
    
    dec = db.query(models.SubstitutionDecision).filter(models.SubstitutionDecision.id == decision_id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    dec.human_decision = "OVERRIDDEN"
    dec.override = True
    dec.override_reason = override_reason.strip()
    dec.reviewer = reviewer
    dec.updated_at = datetime.datetime.utcnow()
    
    audit = models.AuditLog(
        decision_id=dec.id,
        action="OVERRIDE",
        performed_by=reviewer,
        reason=f"Override decision: {override_reason.strip()}",
    )
    db.add(audit)
    db.commit()
    db.refresh(dec)
    return dec

@router.get("/escalations")
def get_escalations(db: Session = Depends(database.get_db)):
    # Fetch decisions that are system ESCALATE or human ESCALATED or have escalation_level > 0
    escalations = (
        db.query(models.SubstitutionDecision)
        .filter(
            (models.SubstitutionDecision.system_decision == "ESCALATE") |
            (models.SubstitutionDecision.human_decision == "ESCALATED") |
            (models.SubstitutionDecision.escalation_level > 0)
        )
        .all()
    )
    res = []
    for e in escalations:
        presc = db.query(models.Prescription).filter(models.Prescription.id == e.prescription_id).first()
        res.append({
            "decision_id": e.id,
            "prescription_id": e.prescription_id,
            "prescription_code": presc.prescription_code if presc else "N/A",
            "urgency": presc.urgency if presc else "ROUTINE",
            "requested_medicine": e.requested_medicine,
            "alternative_medicine": e.alternative_medicine,
            "system_decision": e.system_decision,
            "escalation_level": e.escalation_level or 1,
            "reasons": e.reasons,
            "status": e.human_decision or "PENDING",
            "reviewer": e.reviewer or "Unassigned",
            "created_at": e.created_at,
        })
    return res
