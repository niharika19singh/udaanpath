from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.progress import ProgressService
from app.schemas.progress import (
    OpportunityApplicationCreate,
    OpportunityApplicationUpdate,
    OpportunityApplicationResponse,
    StudentDocumentCreate,
    StudentDocumentResponse,
    StudentProgressOverview
)

router = APIRouter(prefix="/progress", tags=["Student Progress & Application Tracking"])


@router.get("/student/{student_id}", response_model=StudentProgressOverview)
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    """Fetch complete progress overview: milestone completion rate, document readiness score, badges, and applications."""
    service = ProgressService(db)
    return service.get_student_progress_overview(student_id)


@router.post("/applications", response_model=OpportunityApplicationResponse, status_code=status.HTTP_201_CREATED)
def record_application(payload: OpportunityApplicationCreate, db: Session = Depends(get_db)):
    """Save or update an application for a scholarship, scheme, or apprenticeship."""
    service = ProgressService(db)
    return service.record_application(payload)


@router.put("/applications/{app_id}", response_model=OpportunityApplicationResponse)
def update_application(app_id: int, payload: OpportunityApplicationUpdate, db: Session = Depends(get_db)):
    """Update status of an opportunity application (e.g. shortlisted, awarded, rejected)."""
    service = ProgressService(db)
    return service.update_application_status(app_id, payload)


@router.post("/documents", response_model=StudentDocumentResponse, status_code=status.HTTP_201_CREATED)
def register_document(payload: StudentDocumentCreate, db: Session = Depends(get_db)):
    """Register or verify student documentation to boost document readiness score."""
    service = ProgressService(db)
    return service.register_document(payload)
