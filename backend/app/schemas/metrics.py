from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class MetricsResponse(BaseModel):
    total_decisions: int = 0
    approved: int = 0
    blocked: int = 0
    escalated: int = 0
    review_required: int = 0
    average_latency_ms: float = 0.0
    average_rules_per_decision: float = 0.0
    escalation_rate: float = 0.0
    false_positive_escalation_rate: float = 0.0
    override_rate: float = 0.0
    human_reviews_count: int = 0
    overrides_count: int = 0
    decision_distribution: Dict[str, int] = Field(default_factory=dict)
    rule_outcomes: Dict[str, int] = Field(default_factory=dict)


class EvaluationMetricSummary(BaseModel):
    total_cases: int
    correct_decisions: int
    incorrect_decisions: int
    accuracy: float
    approved: int
    blocked: int
    escalated: int
    review_required: int
    human_review_count: int
    false_positive_escalation_rate: float
    false_negative_approval_rate: float
    case_results: Optional[List[Dict[str, Any]]] = None
