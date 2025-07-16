from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Academy Admin API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS origins
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """Parse CORS origins from environment variable"""
        if self.CORS_ORIGINS:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return []
    
    # Database
    DATABASE_URL: str = "sqlite:///./academy_admin.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Server
    HOST: str = "localhost"
    PORT: int = 8000
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "noreply@academy.com"
    
    # Feature flags
    ENABLE_DOCS: bool = True
    ENABLE_ADMIN_OVERRIDE: bool = True
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()