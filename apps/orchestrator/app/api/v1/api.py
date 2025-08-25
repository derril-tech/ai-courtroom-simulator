from fastapi import APIRouter
from app.api.v1.endpoints import health, cases

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
