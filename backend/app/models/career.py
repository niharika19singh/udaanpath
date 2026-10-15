from sqlalchemy import Column, String, Integer, Boolean, JSON, Text
from app.models.base import BaseModel


class Career(BaseModel):
    __tablename__ = "careers"

    title = Column(String(150), nullable=False, index=True)
    slug = Column(String(160), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # corporate_tech, vocational_skilled_trades, government_public_sector, creative_emerging
    sector = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    entry_qualification = Column(String(50), nullable=False)  # 10th_pass, 12th_pass, iti_diploma, undergraduate, postgraduate
    eligible_streams = Column(JSON, nullable=False, default=list)  # science_pcm, science_pcb, commerce, arts_humanities, vocational, general
    key_skills = Column(JSON, nullable=False, default=list)
    typical_interests = Column(JSON, nullable=False, default=list)
    starting_salary_inr = Column(Integer, nullable=False)
    mid_level_salary_inr = Column(Integer, nullable=False)
    growth_outlook = Column(String(50), nullable=False, default="High")
    training_duration_months = Column(Integer, nullable=False, default=6)
    financial_barrier = Column(String(20), nullable=False, default="moderate")  # low, moderate, high
    is_active = Column(Boolean, default=True, nullable=False)
