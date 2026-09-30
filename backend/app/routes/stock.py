from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter()

@router.get("/", response_model=list[schemas.Stock])
def read_stock(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Stock).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Stock)
def update_or_create_stock(stock_in: schemas.StockCreate, db: Session = Depends(database.get_db)):
    db_stock = db.query(models.Stock).filter(models.Stock.medicine_id == stock_in.medicine_id).first()
    if db_stock:
        db_stock.quantity = stock_in.quantity
        if stock_in.location:
            db_stock.location = stock_in.location
    else:
        db_stock = models.Stock(**stock_in.dict())
        db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock
