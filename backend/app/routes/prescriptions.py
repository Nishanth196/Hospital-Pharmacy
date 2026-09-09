from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

@router.get("/", response_model=list[schemas.Prescription])
def read_prescriptions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Prescription).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Prescription)
def create_prescription(prescription: schemas.PrescriptionCreate, db: Session = Depends(database.get_db)):
    # Ensure patient and medicine exist
    patient = db.query(models.Patient).filter(models.Patient.id == prescription.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    medicine = db.query(models.Medicine).filter(models.Medicine.id == prescription.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db_pres = models.Prescription(**prescription.dict())
    db.add(db_pres)
    db.commit()
    db.refresh(db_pres)
    return db_pres

@router.get("/{prescription_id}", response_model=schemas.Prescription)
def get_prescription(prescription_id: int, db: Session = Depends(database.get_db)):
    presc = db.query(models.Prescription).filter(models.Prescription.id == prescription_id).first()
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return presc
