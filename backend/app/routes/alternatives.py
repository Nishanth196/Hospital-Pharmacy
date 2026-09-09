from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

@router.get("/{medicine_id}", response_model=list[schemas.Alternative])
def get_alternatives(medicine_id: int, db: Session = Depends(database.get_db)):
    alternatives = db.query(models.ApprovedAlternative).filter(models.ApprovedAlternative.medicine_id == medicine_id).all()
    return alternatives

@router.post("/", response_model=schemas.Alternative)
def create_alternative(alt: schemas.AlternativeCreate, db: Session = Depends(database.get_db)):
    # Verify referenced medicines exist
    med = db.query(models.Medicine).filter(models.Medicine.id == alt.medicine_id).first()
    alt_med = db.query(models.Medicine).filter(models.Medicine.id == alt.alternative_medicine_id).first()
    if not med or not alt_med:
        raise HTTPException(status_code=404, detail="Medicine or alternative not found")
    db_alt = models.ApprovedAlternative(**alt.dict())
    db.add(db_alt)
    db.commit()
    db.refresh(db_alt)
    return db_alt
