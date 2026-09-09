from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

@router.get("/", response_model=list[schemas.AuditLog])
def get_audit_logs(skip: int = 0, limit: int = 200, db: Session = Depends(database.get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
