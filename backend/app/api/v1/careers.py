from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.career import CareerRepository
from app.services.recommendation import RecommendationService
from app.schemas.career import (
    CareerResponse,
    CareerCreate,
    CareerRecommendationRequest,
    CareerRecommendationResponse
)

router = APIRouter(prefix="/careers", tags=["Career Catalog & Recommendations"])


@router.get("/", response_model=List[CareerResponse])
def list_careers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None, description="corporate_tech, vocational_skilled_trades, government_public_sector, creative_emerging"),
    sector: Optional[str] = Query(None, description="Search by industry sector"),
    min_salary: Optional[int] = Query(None, description="Minimum starting salary in INR"),
    db: Session = Depends(get_db)
):
    """Browse career catalog tracks across corporate, vocational, government, and creative domains."""
    repo = CareerRepository(db)
    return repo.get_all(skip=skip, limit=limit, category=category, sector=sector, min_salary=min_salary)


@router.get("/{id}", response_model=CareerResponse)
def get_career(id: int, db: Session = Depends(get_db)):
    """Retrieve in-depth information about a specific career pathway."""
    repo = CareerRepository(db)
    career = repo.get_by_id(id)
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career with id {id} not found."
        )
    return career


@router.post("/recommend", response_model=CareerRecommendationResponse)
def recommend_careers(payload: CareerRecommendationRequest, db: Session = Depends(get_db)):
    """Generate multi-factor, diverse career recommendations tailored to a student's profile."""
    service = RecommendationService(db)
    return service.recommend_careers(student_id=payload.student_id, limit=payload.limit)
