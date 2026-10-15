from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Pathway(BaseModel):
    __tablename__ = "pathways"

    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=False, index=True)
    career_title = Column(String(150), nullable=False)
    total_estimated_duration_months = Column(Integer, nullable=False, default=6)
    total_estimated_cost_inr = Column(Float, nullable=False, default=0.0)
    free_alternative_available = Column(Boolean, nullable=False, default=True)
    weekly_study_hours = Column(Integer, nullable=False, default=10)
    is_active = Column(Boolean, nullable=False, default=True)

    milestones = relationship("PathwayMilestone", back_populates="pathway", cascade="all, delete-orphan", order_by="PathwayMilestone.step_number")


class PathwayMilestone(BaseModel):
    __tablename__ = "pathway_milestones"

    pathway_id = Column(Integer, ForeignKey("pathways.id"), nullable=False, index=True)
    stage = Column(String(30), nullable=False)  # foundational, intermediate, advanced, job_ready
    step_number = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    duration_weeks = Column(Integer, nullable=False, default=4)
    skills_to_acquire = Column(JSON, nullable=False, default=list)
    recommended_certification = Column(String(200), nullable=True)
    estimated_cost_inr = Column(Float, nullable=False, default=0.0)
    free_alternative_resource = Column(Text, nullable=False)
    resource_url = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="not_started")  # not_started, in_progress, completed

    pathway = relationship("Pathway", back_populates="milestones")
