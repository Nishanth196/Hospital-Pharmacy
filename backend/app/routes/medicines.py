from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

@router.get("/", response_model=list[schemas.Medicine])
def read_medicines(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    medicines = db.query(models.Medicine).offset(skip).limit(limit).all()
    return medicines

@router.post("/", response_model=schemas.Medicine)
def create_medicine(medicine: schemas.MedicineCreate, db: Session = Depends(database.get_db)):
    db_medicine = models.Medicine(**medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

@router.get("/{medicine_id}", response_model=schemas.Medicine)
def get_medicine(medicine_id: int, db: Session = Depends(database.get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med
