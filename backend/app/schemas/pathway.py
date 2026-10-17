from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MilestoneBase(BaseModel):
    stage: str = Field(..., description="foundational, intermediate, advanced, job_ready")
    step_number: int
    title: str
    description: str
    duration_weeks: int
    skills_to_acquire: List[str] = Field(default_factory=list)
    recommended_certification: Optional[str] = None
    estimated_cost_inr: float = 0.0
    free_alternative_resource: str
    resource_url: str
    status: str = Field(default="not_started", description="not_started, in_progress, completed")


class MilestoneResponse(MilestoneBase):
    id: int
    pathway_id: int

    model_config = ConfigDict(from_attributes=True)


class PathwayGenerateRequest(BaseModel):
    student_id: int
    career_id: int
    weekly_study_hours: int = Field(default=12, ge=5, le=40)


class PathwayResponse(BaseModel):
    id: int
    student_id: int
    career_id: int
    career_title: str
    total_estimated_duration_months: int
    total_estimated_cost_inr: float
    free_alternative_available: bool
    weekly_study_hours: int
    is_active: bool
    milestones: List[MilestoneResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MilestoneStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="not_started, in_progress, completed")
