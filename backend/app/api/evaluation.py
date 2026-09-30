from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.database.connection import get_db
from backend.app.services.evaluation_service import (
    get_fifteen_test_fixtures,
    run_evaluation_suite,
)
from backend.app.schemas.metrics import EvaluationMetricSummary

router = APIRouter(prefix="/api", tags=["Evaluation & Test Cases"])


@router.get("/test-cases")
def list_test_cases():
    """Returns the 15 explicit test fixture definitions."""
    return get_fifteen_test_fixtures()


@router.post("/evaluate", response_model=EvaluationMetricSummary)
def execute_evaluation(db: Session = Depends(get_db)):
    """
    Executes all 15 deterministic test cases in the live environment.
    Calculates genuine measured accuracy, false positive, and false negative rates.
    """
    results = run_evaluation_suite(db=db, persist_decisions=True)
    return results
