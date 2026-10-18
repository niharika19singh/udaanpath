from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import authorize_student, bearer_token
from app.repositories.pathway import PathwayRepository
from app.services.ai_advisor import AIAdvisorService
from app.schemas.ai import (
    AINarrativeAdviceRequest,
    AINarrativeAdviceResponse,
    AIRoadmapEnrichmentRequest,
    AIRoadmapEnrichmentResponse
)

router = APIRouter(prefix="/ai", tags=["AI Career Narrative & Guidance (Optional / Fallback)"])


@router.post("/advice", response_model=AINarrativeAdviceResponse)
@router.post("/advise", response_model=AINarrativeAdviceResponse)
def get_career_advice(payload: AINarrativeAdviceRequest, db: Session = Depends(get_db), token: Optional[str] = Depends(bearer_token)):
    """Generate personalized career counseling narrative. Uses Gemini if enabled, with rule-based fallback."""
    authorize_student(db, payload.student_id, token)
    service = AIAdvisorService(db)
    return service.get_narrative_advice(payload)


@router.post("/enrich-roadmap", response_model=AIRoadmapEnrichmentResponse)
def enrich_roadmap(payload: AIRoadmapEnrichmentRequest, db: Session = Depends(get_db), token: Optional[str] = Depends(bearer_token)):
    """Enrich milestone learning roadmaps with stage-by-stage study pacing tips."""
    pathway = PathwayRepository(db).get_by_id(payload.pathway_id)
    authorize_student(db, pathway.student_id if pathway else None, token)
    service = AIAdvisorService(db)
    return service.enrich_roadmap(payload)
