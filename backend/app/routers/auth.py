from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from app.database import users_col
from app.models.user import PatientRegister, StaffCreate, UserOut, LoginRequest, ROLES
from app.security import hash_password, verify_password, create_access_token
from app.deps import require_roles, get_current_user

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
    user = await users_col.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return serialize_user(user)
