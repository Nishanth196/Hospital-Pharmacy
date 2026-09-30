from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database.connection import get_db
from backend.app.models.entities import (
    Patient,
    Prescription,
    Medicine,
    AlternativeMedicineRecord,
    StockRecord,
)

router = APIRouter(prefix="/api", tags=["Inventory & Clinical Records"])


@router.get("/prescriptions")
def get_prescriptions(
    db: Session = Depends(get_db),
    ward: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    query = db.query(Prescription)
    if ward:
        query = query.filter(Prescription.ward == ward)
    records = query.limit(limit).all()
    return [r.to_dict() for r in records]


@router.get("/patients")
def get_patients(
    db: Session = Depends(get_db),
    ward: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    query = db.query(Patient)
    if ward:
        query = query.filter(Patient.ward == ward)
    records = query.limit(limit).all()
    return [r.to_dict() for r in records]


@router.get("/medicines")
def get_medicines(
    db: Session = Depends(get_db),
    limit: int = Query(50, le=100)
):
    records = db.query(Medicine).limit(limit).all()
    return [r.to_dict() for r in records]


@router.get("/alternatives")
def get_alternatives(
    db: Session = Depends(get_db),
    medicine_id: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    query = db.query(AlternativeMedicineRecord)
    if medicine_id:
        query = query.filter(AlternativeMedicineRecord.original_medicine_id == medicine_id)
    records = query.limit(limit).all()
    return [r.to_dict() for r in records]


@router.get("/stock")
def get_stock(
    db: Session = Depends(get_db),
    ward: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    query = db.query(StockRecord)
    if ward:
        query = query.filter(StockRecord.ward == ward)
    records = query.limit(limit).all()
    return [r.to_dict() for r in records]
