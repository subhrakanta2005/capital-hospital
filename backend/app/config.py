from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "capital_hospital"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    frontend_origins: str = "http://localhost:5173"

    payment_gateway_key: str = ""
    payment_gateway_secret: str = ""

    twilio_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    smtp_host: str = ""
    smtp_port: str = "587"
    smtp_user: str = ""
    smtp_password: str = ""

    admin_email: str = "admin@capitalhospital.local"
    admin_password: str = "ChangeMe123!"

    google_client_id: str = ""
    otp_expire_minutes: int = 10

    class Config:
        env_file = ".env"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


settings = Settings()
