from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, Boolean
from app.models.base import BaseModel, utc_now


class CounselorIntervention(BaseModel):
    __tablename__ = "counselor_interventions"

    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    counselor_name = Column(String(120), nullable=False)
    category = Column(String(60), nullable=False)  # financial_aid, academic_guidance, career_mentorship, document_verification, psychosocial_support
    notes = Column(Text, nullable=False)
    follow_up_date = Column(String(20), nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending, completed


class StudentOpportunityAssignment(BaseModel):
    __tablename__ = "student_opportunity_assignments"

    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    assigned_by = Column(String(120), nullable=False)
    priority = Column(String(20), nullable=False, default="high")  # high, medium, low
    assigned_notes = Column(Text, nullable=True)


class FacilitatorAccount(BaseModel):
    """Counselor/educator login, created by an admin via scripts/create_facilitator.py."""
    __tablename__ = "facilitator_accounts"

    email = Column(String(120), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
