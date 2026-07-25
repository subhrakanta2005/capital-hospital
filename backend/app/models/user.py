from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date

ROLES = ["patient", "doctor", "admin", "reception", "pharmacist"]


class TimeSlotBlock(BaseModel):
    date: str  # YYYY-MM-DD
    time_slots: List[str]  # ["10:00", "10:30", ...]


class PatientRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None


class StaffCreate(BaseModel):
    """Used by admin to create doctor/reception/pharmacist accounts."""
    name: str
    email: EmailStr
    password: str
    role: str  # doctor | reception | pharmacist
    department: Optional[str] = None
    phone_number: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    department: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    specialization: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None


class AvailabilityUpdate(BaseModel):
    availability: List[TimeSlotBlock]


class OtpRequest(BaseModel):
    phone_number: str


class OtpVerify(BaseModel):
    phone_number: str
    otp: str
    name: Optional[str] = None  # used only if this phone has no account yet


class GoogleAuthRequest(BaseModel):
    credential: str  # the ID token returned by Google Identity Services


class PhoneLoginRequest(BaseModel):
    phone_number: str
    password: str
