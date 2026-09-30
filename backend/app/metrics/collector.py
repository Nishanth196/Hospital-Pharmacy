import json
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.entities import DecisionRecord, AuditEvent


class MetricsCollector:
    def __init__(self, db: Session):
        self.db = db

    def get_metrics(self) -> Dict[str, Any]:
        total_decisions = self.db.query(func.count(DecisionRecord.id)).scalar() or 0

        approved = self.db.query(func.count(DecisionRecord.id)).filter(DecisionRecord.decision == "APPROVED").scalar() or 0
        blocked = self.db.query(func.count(DecisionRecord.id)).filter(DecisionRecord.decision == "BLOCKED").scalar() or 0
        escalated = self.db.query(func.count(DecisionRecord.id)).filter(DecisionRecord.decision == "ESCALATED").scalar() or 0
        review_required = self.db.query(func.count(DecisionRecord.id)).filter(DecisionRecord.decision == "REVIEW_REQUIRED").scalar() or 0

        avg_latency = self.db.query(func.avg(DecisionRecord.latency_ms)).scalar() or 0.0
        avg_rules = self.db.query(func.avg(DecisionRecord.rules_count)).scalar() or 0.0

        human_reviews_count = self.db.query(func.count(AuditEvent.id)).filter(
            AuditEvent.action == "HUMAN_CONFIRMED"
        ).scalar() or 0

        overrides_count = self.db.query(func.count(AuditEvent.id)).filter(
            AuditEvent.action == "OVERRIDE_APPROVED"
        ).scalar() or 0

        escalation_rate = round((escalated / total_decisions) * 100.0, 2) if total_decisions > 0 else 0.0
        override_rate = round((overrides_count / total_decisions) * 100.0, 2) if total_decisions > 0 else 0.0

        # Read evaluation benchmark if exists to get calibrated benchmark false positive rate
        eval_fp_rate = 0.0
        eval_file = Path(__file__).resolve().parent.parent.parent.parent / "data" / "evaluation_results.json"
        if eval_file.exists():
            try:
                with open(eval_file, "r") as f:
                    eval_data = json.load(f)
                    eval_fp_rate = eval_data.get("false_positive_escalation_rate", 0.0)
            except Exception:
                pass

        # Rule breakdown counts from failed_rules JSON in DecisionRecord
        rule_outcomes: Dict[str, int] = {
            "RULE-001": 0,
            "RULE-002": 0,
            "RULE-003": 0,
            "RULE-004": 0,
            "RULE-005": 0,
            "RULE-006": 0,
            "RULE-007": 0,
            "RULE-008": 0,
            "RULE-009": 0,
        }

        all_records = self.db.query(DecisionRecord.failed_rules, DecisionRecord.decision).all()
        for rec in all_records:
            if rec.decision == "APPROVED":
                rule_outcomes["RULE-009"] += 1
            if rec.failed_rules:
                try:
                    f_rules = json.loads(rec.failed_rules)
                    for fr in f_rules:
                        r_id = fr.get("rule_id")
                        if r_id in rule_outcomes:
                            rule_outcomes[r_id] += 1
                except Exception:
                    pass

        return {
            "total_decisions": total_decisions,
            "approved": approved,
            "blocked": blocked,
            "escalated": escalated,
            "review_required": review_required,
            "average_latency_ms": round(float(avg_latency), 2),
            "average_rules_per_decision": round(float(avg_rules), 2),
            "escalation_rate": escalation_rate,
            "false_positive_escalation_rate": eval_fp_rate,
            "override_rate": override_rate,
            "human_reviews_count": human_reviews_count,
            "overrides_count": overrides_count,
            "decision_distribution": {
                "APPROVED": approved,
                "BLOCKED": blocked,
                "ESCALATED": escalated,
                "REVIEW_REQUIRED": review_required,
            },
            "rule_outcomes": rule_outcomes,
        }
