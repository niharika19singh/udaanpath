from typing import List, Optional
from pydantic import BaseModel, Field


class EligibilityCriterionResult(BaseModel):
    criterion_name: str
    passed: bool
    student_value: str
    required_value: str
    explanation: str
    outcome: str = "unknown"


class EligibilityCheckRequest(BaseModel):
    student_id: int
    opportunity_id: int


class EligibilityCheckResponse(BaseModel):
    student_id: int
    opportunity_id: int
    opportunity_title: str
    opportunity_type: str
    status: str = Field(..., description="ELIGIBLE, INELIGIBLE, PARTIALLY_ELIGIBLE, NEEDS_CONFIRMATION")
    match_score: float = Field(..., ge=0.0, le=100.0)
    passed_criteria: List[EligibilityCriterionResult]
    failed_criteria: List[EligibilityCriterionResult]
    unknown_criteria: List[EligibilityCriterionResult] = Field(default_factory=list)
    required_documents: List[str]
    actionable_remediation: str
    official_portal_url: str
    verification_date: str


class BatchEligibilityCheckRequest(BaseModel):
    student_id: int
    opportunity_ids: Optional[List[int]] = None
    opportunity_type: Optional[str] = None


class BatchEligibilityCheckResponse(BaseModel):
    student_id: int
    total_evaluated: int
    eligible_count: int
    partially_eligible_count: int
    ineligible_count: int
    unknown_count: int = 0
    results: List[EligibilityCheckResponse]
