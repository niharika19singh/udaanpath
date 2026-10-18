from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import authorize_student, bearer_token
from app.services.eligibility import EligibilityEngine
from app.schemas.eligibility import (
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    BatchEligibilityCheckRequest,
    BatchEligibilityCheckResponse
)

router = APIRouter(prefix="/eligibility", tags=["Deterministic Eligibility Engine"])


@router.post("/check", response_model=EligibilityCheckResponse)
def check_single_eligibility(payload: EligibilityCheckRequest, db: Session = Depends(get_db), token: Optional[str] = Depends(bearer_token)):
    """Evaluate deterministic eligibility of a student against a specific opportunity with rule breakdown."""
    authorize_student(db, payload.student_id, token)
    engine = EligibilityEngine(db)
    return engine.check_single(payload)


@router.post("/batch-check", response_model=BatchEligibilityCheckResponse)
def check_batch_eligibility(payload: BatchEligibilityCheckRequest, db: Session = Depends(get_db), token: Optional[str] = Depends(bearer_token)):
    """Evaluate a student's eligibility across all or selected opportunities, returning auditable pass/fail criteria."""
    authorize_student(db, payload.student_id, token)
    engine = EligibilityEngine(db)
    return engine.check_batch(payload)
