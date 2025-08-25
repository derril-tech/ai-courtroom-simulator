from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # NATS
    NATS_URL: str = "nats://localhost:4222"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/courtroom_simulator"
    
    # AWS/S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: str = "courtroom-simulator"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # CrewAI
    CREWAI_VERBOSE: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
