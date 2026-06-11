from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "PulseIQ"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-min-32-chars"

    DATABASE_URL: str
    DATABASE_URL_SYNC: str

    AI_PROVIDER: str = "mock"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    CLERK_SECRET_KEY: Optional[str] = None
    CLERK_PUBLISHABLE_KEY: Optional[str] = None

    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"

    # Email
    RESEND_API_KEY: Optional[str] = None
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"

    # Frontend URL (used in email links)
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()