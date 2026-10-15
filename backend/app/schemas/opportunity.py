from typing import List, Optional
from pydantic import BaseModel, Field


class OpportunityBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    slug: str
    type: str = Field(..., description="scholarship, government_scheme, apprenticeship")
    provider: str
    description: str
    official_portal_url: str
    verification_date: str
    verified_by: str = "Citi Hackathon Research Verification Team"
    deadline: Optional[str] = None
    financial_benefit_inr: float = 0.0
    financial_benefit_description: str
    income_ceiling: Optional[float] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_marks_percentage: Optional[float] = None
    allowed_genders: List[str] = Field(default_factory=lambda: ["all"])
    allowed_categories: List[str] = Field(default_factory=lambda: ["all"])
    domicile_states: List[str] = Field(default_factory=lambda: ["all"])
    eligible_education_levels: List[str] = Field(default_factory=lambda: ["all"])
    eligible_streams: List[str] = Field(default_factory=lambda: ["all"])
    required_documents: List[str] = Field(default_factory=list)
    actionable_steps: str
    is_active: bool = True


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityResponse(OpportunityBase):
    id: int

    class Config:
        from_attributes = True


class OpportunityMatchRequest(BaseModel):
    student_id: int
    type: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=50)


class OpportunityMatchItem(BaseModel):
    opportunity: OpportunityResponse
    match_score: float
    eligibility_status: str  # ELIGIBLE, INELIGIBLE, PARTIALLY_ELIGIBLE
    reasons: List[str]


class OpportunityMatchResponse(BaseModel):
    student_id: int
    total_matches: int
    opportunities: List[OpportunityMatchItem]
