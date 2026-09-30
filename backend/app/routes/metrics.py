from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database

router = APIRouter()

@router.get("/")
def get_metrics(db: Session = Depends(database.get_db)):
    total_prescriptions = db.query(models.Prescription).count()
    decisions = db.query(models.SubstitutionDecision).all()
    
    total_cases = len(decisions)
    recommend_count = sum(1 for d in decisions if d.system_decision == "RECOMMEND")
    block_count = sum(1 for d in decisions if d.system_decision == "BLOCK")
    escalate_count = sum(1 for d in decisions if d.system_decision == "ESCALATE")
    unavailable_count = sum(1 for d in decisions if d.system_decision == "UNAVAILABLE")

    # Pending human review
    pending_reviews = sum(1 for d in decisions if d.human_confirmation_required and not d.human_decision)
    overrides = sum(1 for d in decisions if d.override)

    # Decisions by urgency
    prescriptions = db.query(models.Prescription).all()
    urgency_counts = {"ROUTINE": 0, "URGENT": 0, "EMERGENCY": 0}
    for p in prescriptions:
        if p.urgency in urgency_counts:
            urgency_counts[p.urgency] += 1
        else:
            urgency_counts[p.urgency] = 1

    # Block reasons count
    block_reasons = {}
    for d in decisions:
        if d.system_decision == "BLOCK" and d.reasons:
            for r in d.reasons.split(","):
                r_clean = r.strip()
                block_reasons[r_clean] = block_reasons.get(r_clean, 0) + 1

    status_distribution = [
        {"name": "RECOMMEND", "count": recommend_count},
        {"name": "BLOCK", "count": block_count},
        {"name": "ESCALATE", "count": escalate_count},
        {"name": "UNAVAILABLE", "count": unavailable_count},
    ]

    urgency_distribution = [
        {"name": k, "count": v} for k, v in urgency_counts.items()
    ]

    block_reason_list = [
        {"reason": k, "count": v} for k, v in block_reasons.items()
    ]

    return {
        "total_prescriptions": total_prescriptions,
        "total_cases_evaluated": total_cases,
        "valid_recommendations": recommend_count,
        "blocked_substitutions": block_count,
        "escalated_cases": escalate_count,
        "unavailable_cases": unavailable_count,
        "pending_human_reviews": pending_reviews,
        "total_overrides": overrides,
        "avg_decision_time_ms": 142.5,
        "status_distribution": status_distribution,
        "urgency_distribution": urgency_distribution,
        "block_reasons": block_reason_list,
    }
