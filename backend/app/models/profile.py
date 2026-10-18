from sqlalchemy import Column, String, Integer, Float, Boolean, JSON
from app.models.base import BaseModel


class StudentProfile(BaseModel):
    __tablename__ = "student_profiles"

    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)  # male, female, non_binary, other
    category = Column(String(20), nullable=False)  # General, OBC, SC, ST, EWS
    state = Column(String(60), nullable=False, index=True)
    district = Column(String(60), nullable=False)
    location_tier = Column(String(20), nullable=False, default="tier_2")  # tier_1, tier_2, tier_3, rural
    annual_family_income = Column(Float, nullable=False)
    financial_constraint = Column(String(20), nullable=False, default="moderate")  # low, moderate, high, extreme
    education_level = Column(String(40), nullable=False, index=True)  # 10th_pass, 12th_pass, iti_diploma, undergraduate, postgraduate
    stream = Column(String(40), nullable=False, default="general")  # science_pcm, science_pcb, commerce, arts_humanities, vocational, general
    percentage_marks = Column(Float, nullable=False)
    skills = Column(JSON, nullable=False, default=list)  # list of skill strings
    interests = Column(JSON, nullable=False, default=list)  # list of interest strings
    languages = Column(JSON, nullable=False, default=list)  # list of languages
    career_aspirations = Column(JSON, nullable=False, default=list)
    is_at_risk = Column(Boolean, default=False, nullable=False)
    # SHA-256 of the student's access key; the key itself is shown once at
    # creation and never stored. Profiles without one are facilitator-only.
    access_key_hash = Column(String(64), nullable=True)
