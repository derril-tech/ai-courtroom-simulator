from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "orchestrator",
        "timestamp": "2024-01-01T00:00:00Z"
    }
