from typing import List, Optional
from pydantic import BaseModel


class PatientItem(BaseModel):
    patient_id: str
    full_name: str
    age: Optional[int] = None
    gender: str
    ward: str
    egfr: Optional[float] = None
    weight_kg: Optional[float] = None
    pregnancy_status: bool = False
    conditions: List[str] = []


class PrescriptionItem(BaseModel):
    prescription_id: str
    patient_id: str
    medicine_id: str
    requested_medicine: str
    dosage: str
    route: str
    frequency: str
    ward: str
    urgency: str
    prescriber_id: str
    prescriber_name: str
    dispense_as_written: bool
    clinical_notes: Optional[str] = None


class MedicineItem(BaseModel):
    medicine_id: str
    name: str
    active_ingredient: str
    strength: str
    dosage_form: str
    high_impact: bool
    formulary_status: str


class StockItem(BaseModel):
    stock_id: str
    medicine_id: str
    medicine_name: str
    ward: str
    quantity: int
    in_stock: bool
