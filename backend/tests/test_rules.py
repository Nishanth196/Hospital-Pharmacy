import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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
