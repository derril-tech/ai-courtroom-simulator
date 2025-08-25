from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.core.config import settings
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Courtroom Simulator Orchestrator...")
    yield
    # Shutdown
    print("Shutting down Courtroom Simulator Orchestrator...")


app = FastAPI(
    title="Courtroom Simulator Orchestrator",
    description="AI-powered mock trial orchestration engine",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Courtroom Simulator Orchestrator is running!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "orchestrator"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
