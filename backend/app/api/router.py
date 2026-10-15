from fastapi import APIRouter
from app.api.v1 import health

api_router = APIRouter()

# Core health routes
api_router.include_router(health.router)
