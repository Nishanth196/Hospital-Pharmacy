import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
<<<<<<< HEAD
from backend.app.database.connection import Base
from backend.app.models.entities import (
    Medicine, AlternativeMedicineRecord, StockRecord, AllergyRecord, PrescriberRule, Patient as PatientEntity
)
from backend.app.schemas.decision import PrescriptionPayload, PatientInformation, DecisionType, RuleStatus
from backend.app.rules.engine import DeterministicRuleEngine


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Populate basic test entities
    alt1 = AlternativeMedicineRecord(
        alternative_id="ALT-001",
        original_medicine_id="MED-001",
        medicine_name="Ampicillin 500mg Oral",
        active_ingredient="ampicillin",
        strength="500mg",
        dosage_form="Capsule",
        approved=True,
        high_impact=False,
        tier=1
    )
    alt_unapproved = AlternativeMedicineRecord(
        alternative_id="ALT-999",
        original_medicine_id="MED-001",
        medicine_name="Unapproved Compound X",
        active_ingredient="compound-x",
        strength="500mg",
        dosage_form="Tablet",
        approved=False,
        high_impact=False,
        tier=3
    )
    alt_hi = AlternativeMedicineRecord(
        alternative_id="ALT-004",
        original_medicine_id="MED-003",
        medicine_name="Warfarin Generic 5mg",
        active_ingredient="warfarin",
        strength="5mg",
        dosage_form="Tablet",
        approved=True,
        high_impact=True,
        tier=1
    )
    stock1 = StockRecord(
        stock_id="STK-01",
        medicine_id="ALT-001",
        medicine_name="Ampicillin 500mg Oral",
        ward="General Ward A",
        quantity=50,
        in_stock=True
    )
    stock_oos = StockRecord(
        stock_id="STK-02",
        medicine_id="ALT-004",
        medicine_name="Warfarin Generic 5mg",
        ward="Cardiology Ward",
        quantity=0,
        in_stock=False
    )
    allergy1 = AllergyRecord(
        allergy_id="ALL-01",
        patient_id="PAT-1002",
        allergen="penicillin",
        allergen_type="DRUG_CLASS",
        severity="CRITICAL",
        reaction="Anaphylaxis"
    )
    prescriber_rule1 = PrescriberRule(
        rule_id="PR-01",
        prescriber_id="DOC-99",
        medicine_id="MED-001",
        restriction_type="NO_SUBSTITUTION",
        justification="Specialist protocol"
    )

    db.add_all([alt1, alt_unapproved, alt_hi, stock1, stock_oos, allergy1, prescriber_rule1])
    db.commit()

    yield db
    db.close()


def test_rule_009_safe_substitution(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-SAFE",
        patient_id="PAT-TEST-1",
        medicine_id="MED-001",
        requested_medicine="Amoxicillin 500mg Oral",
        dosage="500mg",
        route="Oral",
        frequency="TID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-001",
        patient_information=PatientInformation(
            patient_id="PAT-TEST-1",
            age=40,
            egfr=90.0,
            allergies=[]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.APPROVED
    assert len(res.failed_rules) == 0
    assert res.human_confirmation_required is False


def test_rule_001_alternative_not_approved(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-NOAPP",
        patient_id="PAT-TEST-1",
        medicine_id="MED-001",
        requested_medicine="Amoxicillin 500mg Oral",
        dosage="500mg",
        route="Oral",
        frequency="TID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-999",
        patient_information=PatientInformation(
            patient_id="PAT-TEST-1",
            age=40,
            egfr=90.0,
            allergies=[]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.BLOCKED
    assert any(r.rule_id == "RULE-001" for r in res.failed_rules)


def test_rule_002_allergy_conflict(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-ALLERGY",
        patient_id="PAT-1002",
        medicine_id="MED-001",
        requested_medicine="Amoxicillin 500mg Oral",
        dosage="500mg",
        route="Oral",
        frequency="TID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-001",
        patient_information=PatientInformation(
            patient_id="PAT-1002",
            age=40,
            egfr=90.0,
            allergies=["penicillin"]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.BLOCKED
    assert any(r.rule_id == "RULE-002" for r in res.failed_rules)


def test_rule_003_out_of_stock(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    # Warfarin has stock=0 in Cardiology Ward
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-OOS",
        patient_id="PAT-TEST-1",
        medicine_id="MED-003",
        requested_medicine="Warfarin 5mg Oral",
        dosage="5mg",
        route="Oral",
        frequency="Daily",
        ward="Cardiology Ward",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-004",
        patient_information=PatientInformation(
            patient_id="PAT-TEST-1",
            age=50,
            egfr=80.0,
            allergies=[]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.ESCALATED
    assert any(r.rule_id == "RULE-003" for r in res.failed_rules)
    assert res.human_confirmation_required is True


def test_rule_004_prescriber_restriction(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-PR",
        patient_id="PAT-TEST-1",
        medicine_id="MED-001",
        requested_medicine="Amoxicillin 500mg Oral",
        dosage="500mg",
        route="Oral",
        frequency="TID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-99",  # matches PR-01
        requested_alternative_id="ALT-001",
        patient_information=PatientInformation(
            patient_id="PAT-TEST-1",
            age=40,
            egfr=90.0,
            allergies=[]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.ESCALATED
    assert any(r.rule_id == "RULE-004" for r in res.failed_rules)


def test_rule_005_high_impact_medicine(in_memory_db):
    # Set stock quantity positive for Warfarin for this test
    stk = in_memory_db.query(StockRecord).filter(StockRecord.medicine_id == "ALT-004").first()
    stk.quantity = 100
    stk.in_stock = True
    in_memory_db.commit()

    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-HI",
        patient_id="PAT-TEST-1",
        medicine_id="MED-003",
        requested_medicine="Warfarin 5mg Oral",
        dosage="5mg",
        route="Oral",
        frequency="Daily",
        ward="Cardiology Ward",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-004",
        patient_information=PatientInformation(
            patient_id="PAT-TEST-1",
            age=50,
            egfr=80.0,
            allergies=[]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.REVIEW_REQUIRED
    assert any(r.rule_id == "RULE-005" for r in res.failed_rules)
    assert res.human_confirmation_required is True


def test_rule_006_missing_critical_info(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-MISS",
        patient_id="PAT-UNKNOWN",
        medicine_id="MED-004",
        requested_medicine="Metformin 850mg Oral",  # renally cleared
        dosage="850mg",
        route="Oral",
        frequency="BID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-001",
        patient_information=None  # completely missing
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision == DecisionType.ESCALATED
    assert any(r.rule_id == "RULE-006" for r in res.failed_rules)


def test_rule_007_conflicting_constraints(in_memory_db):
    engine = DeterministicRuleEngine(db=in_memory_db)
    payload = PrescriptionPayload(
        prescription_id="RX-TEST-CONF",
        patient_id="PAT-RENAL",
        medicine_id="MED-004",
        requested_medicine="Metformin 850mg Oral",
        dosage="850mg",
        route="Oral",
        frequency="BID",
        ward="General Ward A",
        urgency="ROUTINE",
        prescriber_id="DOC-REGULAR",
        requested_alternative_id="ALT-001",
        patient_information=PatientInformation(
            patient_id="PAT-RENAL",
            age=65,
            egfr=25.0,  # eGFR < 30 contraindication
            allergies=[]
        )
    )
    res = engine.evaluate(payload, persist_audit=False)
    assert res.decision in [DecisionType.REVIEW_REQUIRED, DecisionType.BLOCKED]
    assert any(r.rule_id == "RULE-007" for r in res.failed_rules)
=======
from app.database import Base
from app.models import models
from app.services.decision_engine import evaluate_substitution, check_allergy, check_stock, check_patient_constraints

# Setup in-memory SQLite for fast testing
@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_allergy_block(db_session):
    patient = models.Patient(patient_code="P_TEST1", age=40, gender="M", allergies="Ampicillin")
    alt_medicine = models.Medicine(medicine_code="M_ALT", medicine_name="Ampicillin 500mg", active_ingredient="Ampicillin")
    
    failed, reason = check_allergy(patient, alt_medicine)
    assert failed is True
    assert "conflicts with patient allergy" in reason

def test_stock_unavailable(db_session):
    med = models.Medicine(id=1, medicine_code="M_STK", medicine_name="Test Stock Med")
    db_session.add(med)
    db_session.commit()

    stock = models.Stock(medicine_id=1, quantity=0)
    db_session.add(stock)
    db_session.commit()

    failed, reason = check_stock(med, db_session)
    assert failed is True
    assert "out of stock" in reason

def test_patient_renal_constraint(db_session):
    patient = models.Patient(patient_code="P_RENAL", age=65, gender="F", renal_constraint=True)
    failed, reason = check_patient_constraints(patient)
    assert failed is True
    assert "renal constraint" in reason

def test_end_to_end_decision_evaluation(db_session):
    # Setup test entities
    pat = models.Patient(patient_code="PAT_OK", age=30, gender="M", allergies=None)
    med1 = models.Medicine(medicine_code="MED1", medicine_name="Drug A", active_ingredient="IngA", therapeutic_group="Group1")
    med2 = models.Medicine(medicine_code="MED2", medicine_name="Drug B", active_ingredient="IngB", therapeutic_group="Group1")
    db_session.add_all([pat, med1, med2])
    db_session.commit()

    # Approved alternative
    alt = models.ApprovedAlternative(medicine_id=med1.id, alternative_medicine_id=med2.id, approved=True)
    stock = models.Stock(medicine_id=med2.id, quantity=100)
    presc = models.Prescription(prescription_code="PX_TEST", patient_id=pat.id, medicine_id=med1.id, medicine_name="Drug A", urgency="ROUTINE")
    db_session.add_all([alt, stock, presc])
    db_session.commit()

    result = evaluate_substitution(presc, db_session)
    assert "recommended" in result
    assert result["recommended"]["decision"] == "RECOMMEND"
    assert result["recommended"]["alternative"] == "Drug B"
>>>>>>> 06d7a50b1e9874e1f3c047ce23b8ed89374ee878
