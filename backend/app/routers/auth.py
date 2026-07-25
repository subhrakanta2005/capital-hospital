import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from app.database import users_col, otps_col
from app.models.user import (
    PatientRegister, StaffCreate, UserOut, LoginRequest, ROLES,
    OtpRequest, OtpVerify, GoogleAuthRequest, PhoneLoginRequest,
)
from app.security import hash_password, verify_password, create_access_token
from app.deps import require_roles, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "name": u["name"],
        "email": u["email"],
        "role": u["role"],
        "department": u.get("department"),
        "phone_number": u.get("phone_number"),
        "blood_group": u.get("blood_group"),
        "specialization": u.get("specialization"),
    }


@router.post("/register-patient", response_model=UserOut, status_code=201)
async def register_patient(payload: PatientRegister):
    existing = await users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(400, "An account with this email already exists")
    doc = payload.model_dump()
    doc["password_hash"] = hash_password(doc.pop("password"))
    doc["role"] = "patient"
    result = await users_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_user(doc)


@router.post("/create-staff", response_model=UserOut, status_code=201)
async def create_staff(payload: StaffCreate, admin=Depends(require_roles("admin"))):
    if payload.role not in ("doctor", "reception", "pharmacist"):
        raise HTTPException(400, "role must be doctor, reception, or pharmacist")
    existing = await users_col.find_one({"email": payload.email})
    if existing:
        raise HTTPException(400, "An account with this email already exists")
    doc = payload.model_dump()
    doc["password_hash"] = hash_password(doc.pop("password"))
    if payload.role == "doctor":
        doc["availability"] = []
    result = await users_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_user(doc)


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # username field may hold an email or a phone number
    user = await users_col.find_one({
        "$or": [{"email": form_data.username}, {"phone_number": form_data.username}]
    })
    if not user or not user.get("password_hash") or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password",
        )
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/request-otp")
async def request_otp(payload: OtpRequest):
    otp = f"{random.randint(0, 999999):06d}"
    await otps_col.update_one(
        {"phone_number": payload.phone_number},
        {"$set": {
            "phone_number": payload.phone_number,
            "otp_hash": hash_password(otp),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes)).isoformat(),
        }},
        upsert=True,
    )

    # NOTE: no SMS provider is wired in. In production, send `otp` via Twilio here
    # using settings.twilio_sid / twilio_auth_token / twilio_from_number instead of
    # returning it in the response.
    if settings.twilio_sid and settings.twilio_auth_token:
        # Placeholder for real Twilio send — left for you to wire up with your
        # Twilio account: client.messages.create(to=phone_number, from_=..., body=...)
        pass

    response = {"ok": True, "message": f"OTP sent to {payload.phone_number}"}
    if not (settings.twilio_sid and settings.twilio_auth_token):
        # Dev/test convenience only — remove this field once a real SMS provider is wired in
        response["dev_otp"] = otp
    return response


@router.post("/verify-otp")
async def verify_otp(payload: OtpVerify):
    record = await otps_col.find_one({"phone_number": payload.phone_number})
    if not record:
        raise HTTPException(400, "No OTP requested for this number")
    if datetime.fromisoformat(record["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP expired, request a new one")
    if not verify_password(payload.otp, record["otp_hash"]):
        raise HTTPException(400, "Incorrect OTP")

    await otps_col.delete_one({"_id": record["_id"]})

    user = await users_col.find_one({"phone_number": payload.phone_number})
    if not user:
        # First-time phone login creates a patient account on the spot
        doc = {
            "name": payload.name or "Patient",
            "email": f"{payload.phone_number}@phone.capitalhospital.local",
            "phone_number": payload.phone_number,
            "role": "patient",
            "password_hash": None,
        }
        result = await users_col.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}


@router.post("/google")
async def google_auth(payload: GoogleAuthRequest):
    if not settings.google_client_id:
        raise HTTPException(500, "Google sign-in is not configured on this server")
    try:
        idinfo = google_id_token.verify_oauth2_token(
            payload.credential, google_requests.Request(), settings.google_client_id,
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google credential")

    email = idinfo.get("email")
    name = idinfo.get("name", "Patient")
    if not email:
        raise HTTPException(400, "Google account has no email")

    user = await users_col.find_one({"email": email})
    if not user:
        doc = {
            "name": name,
            "email": email,
            "role": "patient",
            "password_hash": None,
            "google_linked": True,
        }
        result = await users_col.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}


@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return serialize_user(user)
