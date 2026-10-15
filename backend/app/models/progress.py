from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime
from app.models.base import BaseModel, utc_now


class OpportunityApplication(BaseModel):
    __tablename__ = "opportunity_applications"

    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="saved")  # saved, applied, shortlisted, awarded, rejected
    applied_date = Column(String(20), nullable=True)
    application_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)


class SkillBadge(BaseModel):
    __tablename__ = "skill_badges"

    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    badge_name = Column(String(100), nullable=False)
    badge_category = Column(String(50), nullable=False)  # technical, soft_skill, milestone, domain
    description = Column(String(255), nullable=True)
    earned_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class StudentDocument(BaseModel):
    __tablename__ = "student_documents"

    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)  # aadhaar, income_certificate, caste_certificate, marksheet_10, marksheet_12, college_bonafide, bank_passbook
    is_verified = Column(Boolean, default=False, nullable=False)
    document_number_masked = Column(String(50), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
