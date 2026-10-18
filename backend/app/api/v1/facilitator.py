from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_facilitator_token, require_facilitator, verify_password
from app.models.facilitator import FacilitatorAccount
from app.services.facilitator import FacilitatorService
from app.schemas.facilitator import (
    FacilitatorDashboardResponse,
    FacilitatorStudentItem,
    CounselorInterventionCreate,
    CounselorInterventionResponse,
    StudentOpportunityAssignmentCreate,
    StudentOpportunityAssignmentResponse,
    FacilitatorLoginRequest,
    FacilitatorTokenResponse,
)

router = APIRouter(prefix="/facilitator", tags=["Facilitator & Counselor Portal"])
# Everything except /login needs a signed-in facilitator.
protected = APIRouter(dependencies=[Depends(require_facilitator)])


@router.post("/login", response_model=FacilitatorTokenResponse)
def login(payload: FacilitatorLoginRequest, db: Session = Depends(get_db)):
    """Exchange a facilitator's email and password for a short-lived access token."""
    account = db.query(FacilitatorAccount).filter(FacilitatorAccount.email == payload.email.lower()).first()
    if not account or not account.is_active or not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    token, expires_in = create_facilitator_token(account.id)
    return FacilitatorTokenResponse(access_token=token, expires_in=expires_in)


@protected.get("/dashboard", response_model=FacilitatorDashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Fetch facilitator caseload overview: total students, at-risk count, and priority vulnerable students."""
    service = FacilitatorService(db)
    return service.get_dashboard()


@protected.get("/students", response_model=List[FacilitatorStudentItem])
def list_monitored_students(
    is_at_risk: Optional[bool] = Query(None, description="Filter for students with high vulnerability score"),
    state: Optional[str] = Query(None, description="Filter by Indian State/UT"),
    db: Session = Depends(get_db)
):
    """List students monitored by counselors with their computed vulnerability indices."""
    service = FacilitatorService(db)
    return service.list_monitored_students(is_at_risk=is_at_risk, state=state)


@protected.post("/interventions", response_model=CounselorInterventionResponse, status_code=status.HTTP_201_CREATED)
def log_intervention(payload: CounselorInterventionCreate, db: Session = Depends(get_db)):
    """Log counselor guidance or intervention note for a student (e.g. scholarship document guidance)."""
    service = FacilitatorService(db)
    return service.log_intervention(payload)


@protected.get("/interventions/{student_id}", response_model=List[CounselorInterventionResponse])
def get_student_interventions(student_id: int, db: Session = Depends(get_db)):
    """Retrieve all logged counselor interventions and follow-up notes for a specific student."""
    service = FacilitatorService(db)
    return service.get_interventions_for_student(student_id)


@protected.post("/assign-opportunity", response_model=StudentOpportunityAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_opportunity_to_student(payload: StudentOpportunityAssignmentCreate, db: Session = Depends(get_db)):
    """Directly assign or recommend a curated scholarship or scheme to a student from the counselor portal."""
    service = FacilitatorService(db)
    return service.assign_opportunity_to_student(payload)


router.include_router(protected)
