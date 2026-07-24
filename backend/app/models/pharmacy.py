from pydantic import BaseModel
from typing import Optional


class MedicineCreate(BaseModel):
    name: str
    category: Optional[str] = None
    stock_quantity: int
    unit_price: float
    reorder_threshold: int = 20
    expiry_date: Optional[str] = None


class MedicineUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    reorder_threshold: Optional[int] = None
    expiry_date: Optional[str] = None


class DispenseRequest(BaseModel):
    medicine_id: str
    quantity: int
    appointment_id: Optional[str] = None
