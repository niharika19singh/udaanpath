from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import authorize_student, bearer_token
from app.repositories.pathway import PathwayRepository
from app.services.pathway import PathwayService
from app.schemas.pathway import (
    PathwayGenerateRequest,
    PathwayResponse,
    MilestoneResponse,
    MilestoneStatusUpdateRequest
)

router = APIRouter(prefix="/pathways", tags=["Learning Roadmaps & Pathways"])


@router.post("/generate", response_model=PathwayResponse, status_code=status.HTTP_201_CREATED)
def generate_pathway(payload: PathwayGenerateRequest, db: Session = Depends(get_db), token: Optional[str] = Depends(bearer_token)):
    """Generate an actionable 4-stage milestone learning roadmap for a student towards a selected career."""
    authorize_student(db, payload.student_id, token)
    service = PathwayService(db)
    return service.generate_pathway(payload)


@router.get("/{id}", response_model=PathwayResponse)
def get_pathway(id: int, db: Session = Depends(get_db), token: Optional[str] = Depends(bearer_token)):
    """Retrieve full roadmap details with milestone breakdown and resource links."""
    pathway = PathwayRepository(db).get_by_id(id)
    authorize_student(db, pathway.student_id if pathway else None, token)
    service = PathwayService(db)
    return service.get_pathway(id)


@router.put("/milestones/{id}/status", response_model=MilestoneResponse)
@router.patch("/milestones/{id}/status", response_model=MilestoneResponse)
def update_milestone_status(
    id: int,
    payload: MilestoneStatusUpdateRequest,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(bearer_token),
):
    """Update milestone progress status (not_started, in_progress, completed)."""
    repo = PathwayRepository(db)
    milestone = repo.get_milestone_by_id(id)
    pathway = repo.get_by_id(milestone.pathway_id) if milestone else None
    authorize_student(db, pathway.student_id if pathway else None, token)
    service = PathwayService(db)
    return service.update_milestone_status(id, payload.status)
