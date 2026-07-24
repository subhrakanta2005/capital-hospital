from pydantic import BaseModel
from typing import List, Optional


class InvoiceLineItem(BaseModel):
    description: str
    amount: float
    quantity: int = 1


class InvoiceCreate(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    items: List[InvoiceLineItem]
    notes: Optional[str] = None


class InvoiceOut(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    appointment_id: Optional[str] = None
    items: List[InvoiceLineItem]
    total: float
    status: str  # unpaid | paid
    created_at: str
    notes: Optional[str] = None


class InvoicePayment(BaseModel):
    payment_method: str = "cash"  # cash | card | upi | insurance
    transaction_ref: Optional[str] = None
