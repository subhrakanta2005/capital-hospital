from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import invoices_col, users_col
from app.models.billing import InvoiceCreate, InvoicePayment
from app.deps import require_roles, get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


def serialize(inv: dict) -> dict:
    inv["id"] = str(inv["_id"])
    del inv["_id"]
    return inv


@router.post("/invoices", status_code=201)
async def create_invoice(payload: InvoiceCreate, user=Depends(require_roles("admin", "reception"))):
    patient = await users_col.find_one({"_id": ObjectId(payload.patient_id), "role": "patient"})
    if not patient:
        raise HTTPException(404, "Patient not found")
    total = sum(item.amount * item.quantity for item in payload.items)
    doc = {
        "patient_id": payload.patient_id,
        "patient_name": patient["name"],
        "appointment_id": payload.appointment_id,
        "items": [i.model_dump() for i in payload.items],
        "total": total,
        "status": "unpaid",
        "notes": payload.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await invoices_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.get("/invoices/me")
async def my_invoices(user=Depends(require_roles("patient"))):
    cursor = invoices_col.find({"patient_id": user["id"]}).sort("created_at", -1)
    return [serialize(i) async for i in cursor]


@router.get("/invoices")
async def all_invoices(user=Depends(require_roles("admin", "reception"))):
    cursor = invoices_col.find({}).sort("created_at", -1)
    return [serialize(i) async for i in cursor]


@router.post("/invoices/{invoice_id}/pay")
async def pay_invoice(invoice_id: str, payload: InvoicePayment,
                       user=Depends(require_roles("admin", "reception", "patient"))):
    # NOTE: This records payment status only. Wiring a real gateway (Razorpay/Stripe)
    # requires PAYMENT_GATEWAY_KEY/SECRET in .env and a charge-creation call here.
    result = await invoices_col.update_one(
        {"_id": ObjectId(invoice_id)},
        {"$set": {
            "status": "paid",
            "payment_method": payload.payment_method,
            "transaction_ref": payload.transaction_ref,
            "paid_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Invoice not found")
    return {"ok": True}
