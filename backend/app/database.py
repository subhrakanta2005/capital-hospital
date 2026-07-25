from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.db_name]

# Collections
users_col = db["users"]
appointments_col = db["appointments"]
records_col = db["records"]
invoices_col = db["invoices"]
medicines_col = db["medicines"]
departments_col = db["departments"]
notifications_col = db["notifications"]
visitor_logs_col = db["visitor_logs"]
otps_col = db["otps"]


async def ensure_indexes():
    await users_col.create_index("email", unique=True)
    await users_col.create_index("phone_number", unique=True, sparse=True)
    await appointments_col.create_index([("doctor_id", 1), ("date", 1)])
    await invoices_col.create_index("patient_id")
    await medicines_col.create_index("name", unique=True)
    await otps_col.create_index("phone_number")
