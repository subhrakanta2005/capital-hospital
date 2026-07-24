from pydantic import BaseModel
from typing import Optional, List

APPOINTMENT_STATUSES = ["booked", "confirmed", "completed", "cancelled", "no_show"]


class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str  # YYYY-MM-DD
    time_slot: str  # "10:00"
    reason: Optional[str] = None


class AppointmentOut(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    department: Optional[str] = None
    date: str
    time_slot: str
    status: str
    reason: Optional[str] = None
    prescription: Optional[dict] = None
    qr_payload: Optional[str] = None


class PrescriptionItem(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str


class PrescriptionCreate(BaseModel):
    diagnosis: str
    notes: Optional[str] = None
    items: List[PrescriptionItem] = []


class AppointmentStatusUpdate(BaseModel):
    status: str
