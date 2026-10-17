from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CareerBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    slug: str
    category: str = Field(..., description="corporate_tech, vocational_skilled_trades, government_public_sector, creative_emerging")
    sector: str
    description: str
    entry_qualification: str
    eligible_streams: List[str] = Field(default_factory=list)
    key_skills: List[str] = Field(default_factory=list)
    typical_interests: List[str] = Field(default_factory=list)
    starting_salary_inr: int
    mid_level_salary_inr: int
    growth_outlook: str
    training_duration_months: int
    financial_barrier: str = Field(default="moderate", description="low, moderate, high")
    is_active: bool = True


class CareerCreate(CareerBase):
    pass


class CareerResponse(CareerBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CareerRecommendationItem(BaseModel):
    career_id: int
    title: str
    category: str
    sector: str
    match_score: float = Field(..., ge=0.0, le=100.0)
    rationale: str
    starting_salary_inr: int
    mid_level_salary_inr: int
    growth_outlook: str
    entry_qualification: str
    key_skills: List[str]
    financial_barrier: str


class CareerRecommendationRequest(BaseModel):
    student_id: int
    limit: int = Field(default=5, ge=1, le=20)


class CareerRecommendationResponse(BaseModel):
    student_id: int
    total_recommendations: int
    recommendations: List[CareerRecommendationItem]
