from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import medicines_col
from app.models.pharmacy import MedicineCreate, MedicineUpdate, DispenseRequest
from app.deps import require_roles

router = APIRouter(prefix="/pharmacy", tags=["pharmacy"])


def serialize(m: dict) -> dict:
    m["id"] = str(m["_id"])
    del m["_id"]
    return m


@router.post("/medicines", status_code=201)
async def add_medicine(payload: MedicineCreate, user=Depends(require_roles("admin", "pharmacist"))):
    existing = await medicines_col.find_one({"name": payload.name})
    if existing:
        raise HTTPException(400, "Medicine already exists; use update instead")
    result = await medicines_col.insert_one(payload.model_dump())
    doc = payload.model_dump()
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.get("/medicines")
async def list_medicines(user=Depends(require_roles("admin", "pharmacist", "doctor"))):
    cursor = medicines_col.find({})
    return [serialize(m) async for m in cursor]


@router.get("/medicines/low-stock")
async def low_stock(user=Depends(require_roles("admin", "pharmacist"))):
    cursor = medicines_col.find({"$expr": {"$lte": ["$stock_quantity", "$reorder_threshold"]}})
    return [serialize(m) async for m in cursor]


@router.put("/medicines/{medicine_id}")
async def update_medicine(medicine_id: str, payload: MedicineUpdate,
                           user=Depends(require_roles("admin", "pharmacist"))):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await medicines_col.update_one({"_id": ObjectId(medicine_id)}, {"$set": updates})
    return {"ok": True}


@router.post("/dispense")
async def dispense(payload: DispenseRequest, user=Depends(require_roles("pharmacist"))):
    medicine = await medicines_col.find_one({"_id": ObjectId(payload.medicine_id)})
    if not medicine:
        raise HTTPException(404, "Medicine not found")
    if medicine["stock_quantity"] < payload.quantity:
        raise HTTPException(400, "Not enough stock available")
    await medicines_col.update_one(
        {"_id": medicine["_id"]}, {"$inc": {"stock_quantity": -payload.quantity}}
    )
    return {"ok": True, "remaining_stock": medicine["stock_quantity"] - payload.quantity}
