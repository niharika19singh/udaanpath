from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_advisor import AIAdvisorService
from app.schemas.ai import (
    AINarrativeAdviceRequest,
    AINarrativeAdviceResponse,
    AIRoadmapEnrichmentRequest,
    AIRoadmapEnrichmentResponse
)

router = APIRouter(prefix="/ai", tags=["AI Career Narrative & Guidance (Optional / Fallback)"])


@router.post("/advice", response_model=AINarrativeAdviceResponse)
def get_career_advice(payload: AINarrativeAdviceRequest, db: Session = Depends(get_db)):
    """Generate personalized career counseling narrative. Uses Gemini if enabled, with rule-based fallback."""
    service = AIAdvisorService(db)
    return service.get_narrative_advice(payload)


@router.post("/enrich-roadmap", response_model=AIRoadmapEnrichmentResponse)
def enrich_roadmap(payload: AIRoadmapEnrichmentRequest, db: Session = Depends(get_db)):
    """Enrich milestone learning roadmaps with stage-by-stage study pacing tips."""
    service = AIAdvisorService(db)
    return service.enrich_roadmap(payload)
