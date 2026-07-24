from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import users_col, appointments_col, invoices_col, records_col
from app.models.user import ProfileUpdate, UserOut
from app.deps import require_roles, get_current_user

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/me/summary")
async def my_summary(user=Depends(require_roles("patient"))):
    pid = user["id"]
    upcoming = await appointments_col.count_documents(
        {"patient_id": pid, "status": {"$in": ["booked", "confirmed"]}}
    )
    unpaid_invoices = await invoices_col.count_documents({"patient_id": pid, "status": "unpaid"})
    records_count = await records_col.count_documents({"patient_id": pid})
    return {
        "upcoming_appointments": upcoming,
        "unpaid_invoices": unpaid_invoices,
        "records_count": records_count,
    }


@router.put("/me/profile", response_model=UserOut)
async def update_profile(payload: ProfileUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await users_col.update_one({"_id": ObjectId(user["id"])}, {"$set": updates})
    updated = await users_col.find_one({"_id": ObjectId(user["id"])})
    return {
        "id": str(updated["_id"]),
        "name": updated["name"],
        "email": updated["email"],
        "role": updated["role"],
        "department": updated.get("department"),
        "phone_number": updated.get("phone_number"),
        "blood_group": updated.get("blood_group"),
        "specialization": updated.get("specialization"),
    }


@router.get("/{patient_id}", response_model=UserOut)
async def get_patient(patient_id: str, user=Depends(require_roles("doctor", "admin", "reception"))):
    patient = await users_col.find_one({"_id": ObjectId(patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(404, "Patient not found")
    return {
        "id": str(patient["_id"]),
        "name": patient["name"],
        "email": patient["email"],
        "role": patient["role"],
        "phone_number": patient.get("phone_number"),
        "blood_group": patient.get("blood_group"),
    }


@router.get("")
async def list_patients(user=Depends(require_roles("admin", "reception", "doctor"))):
    cursor = users_col.find({"role": "patient"})
    out = []
    async for p in cursor:
        out.append({
            "id": str(p["_id"]),
            "name": p["name"],
            "email": p["email"],
            "phone_number": p.get("phone_number"),
            "blood_group": p.get("blood_group"),
        })
    return out
