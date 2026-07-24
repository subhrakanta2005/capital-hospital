import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import appointments_col, users_col, notifications_col
from app.models.appointment import (
    AppointmentCreate, PrescriptionCreate, AppointmentStatusUpdate, APPOINTMENT_STATUSES,
)
from app.deps import require_roles, get_current_user

router = APIRouter(prefix="/appointments", tags=["appointments"])


def serialize(a: dict) -> dict:
    a["id"] = str(a["_id"])
    del a["_id"]
    return a


@router.post("", status_code=201)
async def book_appointment(payload: AppointmentCreate, user=Depends(require_roles("patient"))):
    doctor = await users_col.find_one({"_id": ObjectId(payload.doctor_id), "role": "doctor"})
    if not doctor:
        raise HTTPException(404, "Doctor not found")

    # Verify slot is still available, then remove it atomically
    result = await users_col.update_one(
        {
            "_id": doctor["_id"],
            "availability": {"$elemMatch": {"date": payload.date, "time_slots": payload.time_slot}},
        },
        {"$pull": {"availability.$[elem].time_slots": payload.time_slot}},
        array_filters=[{"elem.date": payload.date}],
    )
    if result.modified_count == 0:
        raise HTTPException(409, "That time slot is no longer available")

    qr_payload = secrets.token_hex(8)
    doc = {
        "patient_id": user["id"],
        "patient_name": user["name"],
        "doctor_id": payload.doctor_id,
        "doctor_name": doctor["name"],
        "department": doctor.get("department"),
        "date": payload.date,
        "time_slot": payload.time_slot,
        "reason": payload.reason,
        "status": "booked",
        "prescription": None,
        "qr_payload": qr_payload,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    inserted = await appointments_col.insert_one(doc)
    doc["_id"] = inserted.inserted_id
    return serialize(doc)


@router.get("/me")
async def my_appointments(user=Depends(get_current_user)):
    field = "patient_id" if user["role"] == "patient" else "doctor_id"
    cursor = appointments_col.find({field: user["id"]}).sort("date", 1)
    return [serialize(a) async for a in cursor]


@router.get("")
async def all_appointments(user=Depends(require_roles("admin", "reception"))):
    cursor = appointments_col.find({}).sort("date", -1)
    return [serialize(a) async for a in cursor]


@router.patch("/{appointment_id}/status")
async def update_status(appointment_id: str, payload: AppointmentStatusUpdate,
                         user=Depends(require_roles("doctor", "admin", "reception"))):
    if payload.status not in APPOINTMENT_STATUSES:
        raise HTTPException(400, f"status must be one of {APPOINTMENT_STATUSES}")
    result = await appointments_col.update_one(
        {"_id": ObjectId(appointment_id)}, {"$set": {"status": payload.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Appointment not found")
    return {"ok": True}


@router.post("/{appointment_id}/prescription")
async def add_prescription(appointment_id: str, payload: PrescriptionCreate,
                            user=Depends(require_roles("doctor"))):
    appt = await appointments_col.find_one({"_id": ObjectId(appointment_id)})
    if not appt:
        raise HTTPException(404, "Appointment not found")
    if appt["doctor_id"] != user["id"]:
        raise HTTPException(403, "Not your appointment")
    await appointments_col.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"prescription": payload.model_dump(), "status": "completed"}},
    )
    return {"ok": True}


@router.post("/checkin/{qr_payload}")
async def checkin_by_qr(qr_payload: str, user=Depends(require_roles("reception"))):
    appt = await appointments_col.find_one({"qr_payload": qr_payload})
    if not appt:
        raise HTTPException(404, "No appointment matches this ticket")
    await appointments_col.update_one({"_id": appt["_id"]}, {"$set": {"status": "confirmed"}})
    return {
        "patient_name": appt["patient_name"],
        "doctor_name": appt["doctor_name"],
        "date": appt["date"],
        "time_slot": appt["time_slot"],
        "status": "confirmed",
    }
