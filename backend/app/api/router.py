from fastapi import APIRouter
from app.api.v1 import health, profiles

api_router = APIRouter()

# Core health routes
api_router.include_router(health.router)

# Student profiles
api_router.include_router(profiles.router)
