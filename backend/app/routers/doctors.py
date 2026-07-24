from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import users_col
from app.models.user import AvailabilityUpdate
from app.deps import require_roles, get_current_user

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("")
async def list_doctors(department: str | None = None):
    query = {"role": "doctor"}
    if department:
        query["department"] = department
    cursor = users_col.find(query)
    out = []
    async for d in cursor:
        out.append({
            "id": str(d["_id"]),
            "name": d["name"],
            "department": d.get("department"),
            "specialization": d.get("specialization"),
        })
    return out


@router.get("/{doctor_id}/availability")
async def get_availability(doctor_id: str):
    doctor = await users_col.find_one({"_id": ObjectId(doctor_id), "role": "doctor"})
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    return {"availability": doctor.get("availability", [])}


@router.put("/me/availability")
async def update_my_availability(payload: AvailabilityUpdate, user=Depends(require_roles("doctor"))):
    await users_col.update_one(
        {"_id": ObjectId(user["id"])},
        {"$set": {"availability": [a.model_dump() for a in payload.availability]}},
    )
    return {"ok": True}


@router.get("/me/profile")
async def my_doctor_profile(user=Depends(require_roles("doctor"))):
    doc = await users_col.find_one({"_id": ObjectId(user["id"])})
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "department": doc.get("department"),
        "specialization": doc.get("specialization"),
        "availability": doc.get("availability", []),
    }
