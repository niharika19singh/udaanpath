from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.opportunity import OpportunityService
from app.schemas.opportunity import (
    OpportunityResponse,
    OpportunityMatchRequest,
    OpportunityMatchResponse
)

router = APIRouter(prefix="/opportunities", tags=["Scholarships, Schemes & Opportunities"])


@router.get("/", response_model=List[OpportunityResponse])
def list_opportunities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[str] = Query(None, description="Filter by type: scholarship, government_scheme, apprenticeship"),
    search: Optional[str] = Query(None, description="Search by title, provider, or description"),
    db: Session = Depends(get_db)
):
    """Browse verified scholarships, government welfare schemes, and apprenticeships."""
    service = OpportunityService(db)
    return service.list_opportunities(skip=skip, limit=limit, type=type, search=search)


@router.get("/{id}", response_model=OpportunityResponse)
def get_opportunity(id: int, db: Session = Depends(get_db)):
    """Retrieve full details of an opportunity including source URLs and verification dates."""
    service = OpportunityService(db)
    return service.get_opportunity(id)


@router.post("/match", response_model=OpportunityMatchResponse)
def match_opportunities(payload: OpportunityMatchRequest, db: Session = Depends(get_db)):
    """Find matched opportunities for a student with preliminary eligibility statuses."""
    service = OpportunityService(db)
    return service.match_opportunities(payload)
