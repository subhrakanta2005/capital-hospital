from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import ensure_indexes, users_col
from app.security import hash_password
from app.routers import auth, patients, doctors, appointments, billing, pharmacy, records, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    # Bootstrap a default admin account on first run so there's always a way in
    existing_admin = await users_col.find_one({"role": "admin"})
    if not existing_admin:
        await users_col.insert_one({
            "name": "Hospital Administrator",
            "email": settings.admin_email,
            "password_hash": hash_password(settings.admin_password),
            "role": "admin",
        })
        print(f"[bootstrap] Created default admin account: {settings.admin_email}")
    yield


app = FastAPI(title="Capital Hospital API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(billing.router)
app.include_router(pharmacy.router)
app.include_router(records.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
