from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import (
    users_col, appointments_col, invoices_col, medicines_col,
    departments_col, visitor_logs_col,
)
from app.deps import require_roles

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def dashboard(user=Depends(require_roles("admin"))):
    total_patients = await users_col.count_documents({"role": "patient"})
    total_doctors = await users_col.count_documents({"role": "doctor"})
    appointments_today = await appointments_col.count_documents(
        {"date": datetime.now(timezone.utc).strftime("%Y-%m-%d")}
    )
    unpaid_total_cursor = invoices_col.aggregate([
        {"$match": {"status": "unpaid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}},
    ])
    unpaid_total = 0
    async for r in unpaid_total_cursor:
        unpaid_total = r["total"]
    low_stock_count = await medicines_col.count_documents(
        {"$expr": {"$lte": ["$stock_quantity", "$reorder_threshold"]}}
    )
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "appointments_today": appointments_today,
        "unpaid_invoice_total": unpaid_total,
        "low_stock_medicines": low_stock_count,
    }


@router.get("/staff")
async def list_staff(user=Depends(require_roles("admin"))):
    cursor = users_col.find({"role": {"$in": ["doctor", "reception", "pharmacist"]}})
    out = []
    async for s in cursor:
        out.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "email": s["email"],
            "role": s["role"],
            "department": s.get("department"),
            "specialization": s.get("specialization"),
        })
    return out


@router.delete("/staff/{staff_id}")
async def remove_staff(staff_id: str, user=Depends(require_roles("admin"))):
    result = await users_col.delete_one(
        {"_id": ObjectId(staff_id), "role": {"$in": ["doctor", "reception", "pharmacist"]}}
    )
    if result.deleted_count == 0:
        raise HTTPException(404, "Staff member not found")
    return {"ok": True}


@router.post("/departments", status_code=201)
async def add_department(name: str, description: str = "", user=Depends(require_roles("admin"))):
    existing = await departments_col.find_one({"name": name})
    if existing:
        raise HTTPException(400, "Department already exists")
    doc = {"name": name, "description": description}
    result = await departments_col.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    del doc["_id"]
    return doc


@router.get("/departments")
async def list_departments():
    cursor = departments_col.find({})
    out = []
    async for d in cursor:
        d["id"] = str(d["_id"])
        del d["_id"]
        out.append(d)
    return out


@router.post("/visitor-logs", status_code=201)
async def log_visitor(visitor_name: str, purpose: str, meeting_patient_id: str | None = None,
                       user=Depends(require_roles("reception", "admin"))):
    doc = {
        "visitor_name": visitor_name,
        "purpose": purpose,
        "meeting_patient_id": meeting_patient_id,
        "logged_at": datetime.now(timezone.utc).isoformat(),
        "logged_by": user["id"],
    }
    result = await visitor_logs_col.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    del doc["_id"]
    return doc


@router.get("/visitor-logs")
async def list_visitor_logs(user=Depends(require_roles("reception", "admin"))):
    cursor = visitor_logs_col.find({}).sort("logged_at", -1)
    out = []
    async for v in cursor:
        v["id"] = str(v["_id"])
        del v["_id"]
        out.append(v)
    return out
