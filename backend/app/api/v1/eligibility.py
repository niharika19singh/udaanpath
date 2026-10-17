from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.eligibility import EligibilityEngine
from app.schemas.eligibility import (
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    BatchEligibilityCheckRequest,
    BatchEligibilityCheckResponse
)

router = APIRouter(prefix="/eligibility", tags=["Deterministic Eligibility Engine"])


@router.post("/check", response_model=EligibilityCheckResponse)
def check_single_eligibility(payload: EligibilityCheckRequest, db: Session = Depends(get_db)):
    """Evaluate deterministic eligibility of a student against a specific opportunity with rule breakdown."""
    engine = EligibilityEngine(db)
    return engine.check_single(payload)


@router.post("/batch-check", response_model=BatchEligibilityCheckResponse)
def check_batch_eligibility(payload: BatchEligibilityCheckRequest, db: Session = Depends(get_db)):
    """Evaluate a student's eligibility across all or selected opportunities, returning auditable pass/fail criteria."""
    engine = EligibilityEngine(db)
    return engine.check_batch(payload)
