from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database.connection import Base
from backend.app.models.entities import DecisionRecord, AuditEvent
from backend.app.metrics.collector import MetricsCollector


def test_metrics_collector():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Add 4 decisions: 2 APPROVED, 1 BLOCKED, 1 ESCALATED
    dec1 = DecisionRecord(
        decision_id="DEC-01", prescription_id="RX-1", patient_id="P-1", requested_medicine="Med1",
        decision="APPROVED", risk_level="LOW", latency_ms=10.0, rules_count=9
    )
    dec2 = DecisionRecord(
        decision_id="DEC-02", prescription_id="RX-2", patient_id="P-2", requested_medicine="Med2",
        decision="APPROVED", risk_level="LOW", latency_ms=14.0, rules_count=9
    )
    dec3 = DecisionRecord(
        decision_id="DEC-03", prescription_id="RX-3", patient_id="P-3", requested_medicine="Med3",
        decision="BLOCKED", risk_level="CRITICAL", latency_ms=8.0, rules_count=5, failed_rules='[{"rule_id": "RULE-002"}]'
    )
    dec4 = DecisionRecord(
        decision_id="DEC-04", prescription_id="RX-4", patient_id="P-4", requested_medicine="Med4",
        decision="ESCALATED", risk_level="HIGH", latency_ms=12.0, rules_count=8, failed_rules='[{"rule_id": "RULE-003"}]'
    )
    db.add_all([dec1, dec2, dec3, dec4])
    db.commit()

    collector = MetricsCollector(db)
    metrics = collector.get_metrics()

    assert metrics["total_decisions"] == 4
    assert metrics["approved"] == 2
    assert metrics["blocked"] == 1
    assert metrics["escalated"] == 1
    assert metrics["review_required"] == 0
    assert metrics["average_latency_ms"] == 11.0
    assert metrics["average_rules_per_decision"] == 7.75
    assert metrics["escalation_rate"] == 25.0
    assert metrics["rule_outcomes"]["RULE-002"] == 1
    assert metrics["rule_outcomes"]["RULE-003"] == 1
    assert metrics["rule_outcomes"]["RULE-009"] == 2

    db.close()
