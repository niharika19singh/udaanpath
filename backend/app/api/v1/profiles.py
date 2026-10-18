from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.profile import ProfileService
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/profiles", tags=["Student Profiles"])


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(profile_in: ProfileCreate, db: Session = Depends(get_db)):
    """Create a new student profile capturing academic, demographic, and socioeconomic parameters."""
    service = ProfileService(db)
    return service.create_profile(profile_in)


@router.get("/{id}", response_model=ProfileResponse)
def get_profile(id: int, db: Session = Depends(get_db)):
    """Retrieve an existing student profile by ID."""
    service = ProfileService(db)
    return service.get_profile(id)


@router.put("/{id}", response_model=ProfileResponse)
def update_profile(id: int, profile_in: ProfileUpdate, db: Session = Depends(get_db)):
    """Update profile attributes such as acquired skills, interests, or financial status."""
    service = ProfileService(db)
    return service.update_profile(id, profile_in)


@router.get("/", response_model=List[ProfileResponse])
def list_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    state: Optional[str] = Query(None, description="Filter by Indian State/UT"),
    education_level: Optional[str] = Query(None, description="Filter by education qualification"),
    is_at_risk: Optional[bool] = Query(None, description="Filter by high vulnerability status"),
    db: Session = Depends(get_db)
):
    """List student profiles with optional filtering and pagination."""
    service = ProfileService(db)
    return service.list_profiles(skip=skip, limit=limit, state=state, education_level=education_level, is_at_risk=is_at_risk)
