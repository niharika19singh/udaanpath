from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CounselorInterventionCreate(BaseModel):
    student_id: int
    counselor_name: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., description="financial_aid, academic_guidance, career_mentorship, document_verification, psychosocial_support")
    notes: str = Field(..., min_length=5)
    follow_up_date: Optional[str] = None
    status: str = Field(default="pending", description="pending, completed")


class CounselorInterventionResponse(BaseModel):
    id: int
    student_id: int
    counselor_name: str
    category: str
    notes: str
    follow_up_date: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentOpportunityAssignmentCreate(BaseModel):
    student_id: int
    opportunity_id: int
    assigned_by: str = Field(..., min_length=2, max_length=120)
    priority: str = Field(default="high", description="high, medium, low")
    assigned_notes: Optional[str] = None


class StudentOpportunityAssignmentResponse(BaseModel):
    id: int
    student_id: int
    opportunity_id: int
    opportunity_title: Optional[str] = None
    assigned_by: str
    priority: str
    assigned_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FacilitatorStudentItem(BaseModel):
    student_id: int
    full_name: str
    email: str
    state: str
    district: str
    education_level: str
    stream: str
    annual_family_income: float
    financial_constraint: str
    is_at_risk: bool
    vulnerability_score: float = Field(..., ge=0.0, le=100.0)
    document_readiness_score: float
    milestone_completion_rate: float
    pending_interventions_count: int


class FacilitatorDashboardResponse(BaseModel):
    total_students_monitored: int
    at_risk_students_count: int
    high_financial_constraint_count: int
    total_applications_tracked: int
    total_interventions_logged: int
    average_milestone_completion_rate: float
    top_priority_students: List[FacilitatorStudentItem]
