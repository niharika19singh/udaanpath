from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


DEV_SECRET_KEY = "dev_secret_key_udaanpath_hackathon_2026_super_secure"


class Settings(BaseSettings):
    APP_NAME: str = "UdaanPath"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    API_V1_PREFIX: str = "/api/v1"
    # Signs facilitator login tokens. Must be overridden in production.
    SECRET_KEY: str = DEV_SECRET_KEY
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./udaanpath.db"

    # Optional AI / LLM
    ENABLE_LLM: bool = False
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_TIMEOUT_SECONDS: int = 15

    # Facilitator accounts are created by an admin (scripts/create_facilitator.py);
    # a login token stays valid for this long.
    FACILITATOR_TOKEN_TTL_MINUTES: int = 480
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @model_validator(mode="after")
    def _production_safety(self):
        """Refuse to start in production with demo secrets or open CORS.
        Messages name the setting, never its value."""
        if self.APP_ENV.lower() != "production":
            return self
        problems = []
        if self.SECRET_KEY == DEV_SECRET_KEY or len(self.SECRET_KEY) < 32:
            problems.append("SECRET_KEY must be set to a random value of at least 32 characters")
        if not self.CORS_ORIGINS or any(not o.startswith("https://") for o in self.CORS_ORIGINS):
            problems.append('CORS_ORIGINS must list only the https:// origin(s) of the frontend, e.g. ["https://example.onrender.com"]')
        if problems:
            raise ValueError("Unsafe production configuration: " + "; ".join(problems))
        return self


settings = Settings()
