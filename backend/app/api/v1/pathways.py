from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.pathway import PathwayService
from app.schemas.pathway import (
    PathwayGenerateRequest,
    PathwayResponse,
    MilestoneResponse,
    MilestoneStatusUpdateRequest
)

router = APIRouter(prefix="/pathways", tags=["Learning Roadmaps & Pathways"])


@router.post("/generate", response_model=PathwayResponse, status_code=status.HTTP_201_CREATED)
def generate_pathway(payload: PathwayGenerateRequest, db: Session = Depends(get_db)):
    """Generate an actionable 4-stage milestone learning roadmap for a student towards a selected career."""
    service = PathwayService(db)
    return service.generate_pathway(payload)


@router.get("/{id}", response_model=PathwayResponse)
def get_pathway(id: int, db: Session = Depends(get_db)):
    """Retrieve full roadmap details with milestone breakdown and resource links."""
    service = PathwayService(db)
    return service.get_pathway(id)


@router.put("/milestones/{id}/status", response_model=MilestoneResponse)
def update_milestone_status(
    id: int,
    payload: MilestoneStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update milestone progress status (not_started, in_progress, completed)."""
    service = PathwayService(db)
    return service.update_milestone_status(id, payload.status)
