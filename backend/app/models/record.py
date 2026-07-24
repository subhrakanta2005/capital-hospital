from pydantic import BaseModel
from typing import Optional


class RecordCreate(BaseModel):
    patient_id: str
    record_type: str  # lab_report | prescription | scan | note | discharge_summary
    title: str
    description: Optional[str] = None
    file_name: Optional[str] = None
    file_data_base64: Optional[str] = None  # small files stored inline; large files should use S3/Cloud storage in production


class RecordOut(BaseModel):
    id: str
    patient_id: str
    record_type: str
    title: str
    description: Optional[str] = None
    file_name: Optional[str] = None
    uploaded_by: str
    uploaded_by_role: str
    created_at: str
