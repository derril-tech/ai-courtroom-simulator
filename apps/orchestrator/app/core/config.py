from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Courtroom Simulator Orchestrator"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/courtroom_simulator"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # NATS
    NATS_URL: str = "nats://localhost:4222"
    
    # AWS/S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: str = "courtroom-simulator"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CrewAI
    CREWAI_VERBOSE: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
