from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import records_col
from app.models.record import RecordCreate
from app.deps import require_roles, get_current_user

router = APIRouter(prefix="/records", tags=["records"])


def serialize(r: dict) -> dict:
    r["id"] = str(r["_id"])
    del r["_id"]
    r.pop("file_data_base64", None)  # never send large blobs in list views
    return r


@router.post("", status_code=201)
async def add_record(payload: RecordCreate, user=Depends(require_roles("doctor", "admin"))):
    doc = payload.model_dump()
    doc["uploaded_by"] = user["id"]
    doc["uploaded_by_role"] = user["role"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await records_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.get("/me")
async def my_records(user=Depends(require_roles("patient"))):
    cursor = records_col.find({"patient_id": user["id"]}).sort("created_at", -1)
    return [serialize(r) async for r in cursor]


@router.get("/patient/{patient_id}")
async def patient_records(patient_id: str, user=Depends(require_roles("doctor", "admin"))):
    cursor = records_col.find({"patient_id": patient_id}).sort("created_at", -1)
    return [serialize(r) async for r in cursor]


@router.get("/{record_id}/file")
async def download_file(record_id: str, user=Depends(get_current_user)):
    record = await records_col.find_one({"_id": ObjectId(record_id)})
    if not record:
        raise HTTPException(404, "Record not found")
    if user["role"] == "patient" and record["patient_id"] != user["id"]:
        raise HTTPException(403, "Not your record")
    return {"file_name": record.get("file_name"), "file_data_base64": record.get("file_data_base64")}
