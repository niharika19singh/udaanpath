from fastapi import APIRouter
from app.api.v1 import health, profiles, careers, pathways

api_router = APIRouter()

# Core health routes
api_router.include_router(health.router)

# Student profiles
api_router.include_router(profiles.router)

# Career catalog & recommendations
api_router.include_router(careers.router)

# Learning roadmaps & pathways
api_router.include_router(pathways.router)
