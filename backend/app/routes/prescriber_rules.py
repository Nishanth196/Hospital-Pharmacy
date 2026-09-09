from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

@router.get("/", response_model=list[schemas.PrescriberRule])
def read_prescriber_rules(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.PrescriberRule).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.PrescriberRule)
def create_prescriber_rule(rule: schemas.PrescriberRuleCreate, db: Session = Depends(database.get_db)):
    db_rule = models.PrescriberRule(**rule.dict())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule
