from fastapi import APIRouter
from app.api.v1 import (
    health,
    profiles,
    careers,
    pathways,
    opportunities,
    eligibility,
    progress,
    facilitator
)

api_router = APIRouter()

# Core health routes
api_router.include_router(health.router)

# Student profiles
api_router.include_router(profiles.router)

# Career catalog & recommendations
api_router.include_router(careers.router)

# Learning roadmaps & pathways
api_router.include_router(pathways.router)

# Scholarships, schemes & opportunities
api_router.include_router(opportunities.router)

# Deterministic eligibility engine
api_router.include_router(eligibility.router)

# Progress tracking, applications & badges
api_router.include_router(progress.router)

# Facilitator & Counselor portal
api_router.include_router(facilitator.router)
