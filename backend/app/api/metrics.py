from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.metrics.collector import MetricsCollector
from backend.app.schemas.metrics import MetricsResponse

router = APIRouter(prefix="/api/metrics", tags=["System Metrics"])


@router.get("", response_model=MetricsResponse)
def get_system_metrics(db: Session = Depends(get_db)):
    """
    Returns actual measured operational metrics calculated from live database records.
    Never hardcoded.
    """
    collector = MetricsCollector(db)
    metrics = collector.get_metrics()
    return metrics
