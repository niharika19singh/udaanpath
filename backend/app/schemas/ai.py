from typing import List, Optional
from pydantic import BaseModel, Field


class AINarrativeAdviceRequest(BaseModel):
    student_id: int
    focus_area: Optional[str] = Field(None, description="Optional focus area e.g. financial_support, skill_development, career_transition")
    query: Optional[str] = Field(None, description="Optional student question or query")


class AINarrativeAdviceResponse(BaseModel):
    student_id: int
    narrative_advice: str
    key_takeaways: List[str]
    is_ai_generated: bool
    provider: str  # gemini or rule_engine_fallback
    suggested_action_items: List[str]
    topic: str = "general"  # what the question was classified as


class AIRoadmapEnrichmentRequest(BaseModel):
    pathway_id: int


class AIRoadmapEnrichmentResponse(BaseModel):
    pathway_id: int
    career_title: str
    study_strategy: str
    stage_tips: List[str]
    is_ai_generated: bool
    provider: str
