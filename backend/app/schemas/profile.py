from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ProfileBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = None
    age: int = Field(..., ge=12, le=60)
    gender: str = Field(..., description="male, female, non_binary, other")
    category: str = Field(..., description="General, OBC, SC, ST, EWS")
    state: str = Field(..., min_length=2, max_length=60)
    district: str = Field(..., min_length=2, max_length=60)
    location_tier: str = Field(default="tier_2", description="tier_1, tier_2, tier_3, rural")
    annual_family_income: float = Field(..., ge=0)
    financial_constraint: str = Field(default="moderate", description="low, moderate, high, extreme")
    education_level: str = Field(..., description="10th_pass, 12th_pass, iti_diploma, undergraduate, postgraduate")
    stream: str = Field(default="general", description="science_pcm, science_pcb, commerce, arts_humanities, vocational, general")
    percentage_marks: float = Field(..., ge=0.0, le=100.0)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    career_aspirations: List[str] = Field(default_factory=list)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=12, le=60)
    gender: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    location_tier: Optional[str] = None
    annual_family_income: Optional[float] = Field(None, ge=0)
    financial_constraint: Optional[str] = None
    education_level: Optional[str] = None
    stream: Optional[str] = None
    percentage_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    career_aspirations: Optional[List[str]] = None
    is_at_risk: Optional[bool] = None


class ProfileResponse(ProfileBase):
    id: int
    is_at_risk: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
