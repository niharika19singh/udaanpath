from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, Text, Date
from app.models.base import BaseModel


class Opportunity(BaseModel):
    __tablename__ = "opportunities"

    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(220), unique=True, index=True, nullable=False)
    type = Column(String(50), nullable=False, index=True)  # scholarship, government_scheme, apprenticeship
    provider = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    official_portal_url = Column(String(255), nullable=False)
    verification_date = Column(String(20), nullable=False)  # ISO Date YYYY-MM-DD
    verified_by = Column(String(100), nullable=False, default="Citi Hackathon Research Verification Team")
    deadline = Column(String(50), nullable=True)  # Rolling / specific date
    financial_benefit_inr = Column(Float, nullable=False, default=0.0)
    financial_benefit_description = Column(String(255), nullable=False)

    # Deterministic Eligibility Rules
    income_ceiling = Column(Float, nullable=True)  # Max annual family income (None = no limit)
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    min_marks_percentage = Column(Float, nullable=True)
    allowed_genders = Column(JSON, nullable=False, default=list)  # ["all"] or ["female"], etc.
    allowed_categories = Column(JSON, nullable=False, default=list)  # ["all"] or ["SC", "ST", "OBC", "EWS"]
    domicile_states = Column(JSON, nullable=False, default=list)  # ["all"] or specific states
    eligible_education_levels = Column(JSON, nullable=False, default=list)  # ["10th_pass", "12th_pass", etc.]
    eligible_streams = Column(JSON, nullable=False, default=list)  # ["all"] or specific streams
    required_documents = Column(JSON, nullable=False, default=list)
    actionable_steps = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
