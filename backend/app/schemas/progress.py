from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class OpportunityApplicationCreate(BaseModel):
    student_id: int
    opportunity_id: int
    status: str = Field(default="saved", description="saved, applied, shortlisted, awarded, rejected")
    applied_date: Optional[str] = None
    application_reference: Optional[str] = None
    notes: Optional[str] = None


class OpportunityApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[str] = None
    application_reference: Optional[str] = None
    notes: Optional[str] = None


class OpportunityApplicationResponse(BaseModel):
    id: int
    student_id: int
    opportunity_id: int
    opportunity_title: Optional[str] = None
    status: str
    applied_date: Optional[str]
    application_reference: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SkillBadgeCreate(BaseModel):
    student_id: int
    badge_name: str
    badge_category: str
    description: Optional[str] = None


class SkillBadgeResponse(BaseModel):
    id: int
    student_id: int
    badge_name: str
    badge_category: str
    description: Optional[str]
    earned_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentDocumentCreate(BaseModel):
    student_id: int
    document_type: str = Field(..., description="aadhaar, income_certificate, caste_certificate, marksheet_10, marksheet_12, college_bonafide, bank_passbook")
    is_verified: bool = False
    document_number_masked: Optional[str] = None


class StudentDocumentResponse(BaseModel):
    id: int
    student_id: int
    document_type: str
    is_verified: bool
    document_number_masked: Optional[str]
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentProgressOverview(BaseModel):
    student_id: int
    student_name: str
    completed_milestones_count: int
    total_milestones_count: int
    milestone_completion_rate: float
    document_readiness_score: float
    verified_documents_count: int
    active_pathways_count: int
    applications_count: int
    earned_badges: List[SkillBadgeResponse]
    applications: List[OpportunityApplicationResponse]
    documents: List[StudentDocumentResponse]
