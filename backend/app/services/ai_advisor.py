from typing import List, Dict, Any, Optional
import json
import httpx
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.logging import logger
from app.models.profile import StudentProfile
from app.models.pathway import Pathway
from app.repositories.profile import ProfileRepository
from app.repositories.pathway import PathwayRepository
from app.repositories.career import CareerRepository
from app.schemas.ai import (
    AINarrativeAdviceRequest,
    AINarrativeAdviceResponse,
    AIRoadmapEnrichmentRequest,
    AIRoadmapEnrichmentResponse
)


class AIAdvisorService:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)
        self.pathway_repo = PathwayRepository(db)
        self.career_repo = CareerRepository(db)

    def _generate_rule_based_advice(self, student: StudentProfile, focus_area: Optional[str] = None) -> Dict[str, Any]:
        """Deterministic rule-based career guidance generation as a guaranteed fallback."""
        name = student.full_name
        stream_name = student.stream.replace('_', ' ').title()
        edu_name = student.education_level.replace('_', ' ').title()
        constraint = student.financial_constraint

        # Dynamic template selection based on socioeconomic and academic context
        if constraint in ["high", "extreme"]:
            narrative = (
                f"Hello {name}, based on your current education ({edu_name} in {stream_name}) and economic background, "
                f"our priority is directing you towards high-return, subsidized pathways. Your profile shows promising aptitude. "
                f"Rather than pursuing expensive unstructured degrees, we strongly recommend combining zero-cost government skilling "
                f"(such as PMKVY 4.0 or NAPS Apprenticeships) with foundational online certifications via SWAYAM. "
                f"Securing a state stipend or post-matric DBT scholarship will ensure financial stability while you build workplace-ready skills."
            )
            takeaways = [
                "Prioritize government-subsidized apprenticeship programs with monthly stipends.",
                "Ensure your Aadhaar is linked to your bank account for Direct Benefit Transfer (DBT).",
                "Utilize free national learning platforms like SWAYAM, NPTEL, and Skill India Digital.",
                "Target vocational trades or entry-level tech roles with under 6 months training turnaround."
            ]
            actions = [
                "Register on the National Scholarship Portal (scholarships.gov.in) before upcoming deadlines.",
                "Gather income certificate from your local Tehsildar or revenue sub-division.",
                "Complete the Foundational stage on your active UdaanPath learning roadmap."
            ]
        else:
            narrative = (
                f"Hello {name}, your background in {stream_name} provides a robust launching pad for high-growth sectors. "
                f"With consistent practice and structured milestones, you can transition smoothly into in-demand technical, "
                f"corporate, or creative specializations. Focus on building practical, verifiable proof-of-work "
                f"rather than passive rote memorization."
            )
            takeaways = [
                "Focus on building 2-3 tangible capstone projects to showcase in interviews.",
                "Pursue recognized industry certifications alongside your primary coursework.",
                "Network with alumni and sector practitioners on professional forums.",
                "Dedicate at least 10-15 hours weekly to milestone skill drills."
            ]
            actions = [
                "Follow the stage-by-stage learning roadmap generated for your chosen career track.",
                "Build a publicly shareable portfolio or digital repository of your assignments.",
                "Practice communication and domain aptitude tests regularly."
            ]

        return {
            "narrative_advice": narrative,
            "key_takeaways": takeaways,
            "suggested_action_items": actions,
            "is_ai_generated": False,
            "provider": "rule_engine_fallback"
        }

    def _call_gemini_api(self, prompt: str) -> Optional[str]:
        """Calls Google Gemini API with timeout protection and returns text output if successful."""
        if not settings.ENABLE_LLM or not settings.GEMINI_API_KEY:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 600
            }
        }

        try:
            with httpx.Client(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
        except Exception as exc:
            logger.warning(f"Gemini API invocation failed: {exc}. Falling back to rule engine.")

        return None

    def get_narrative_advice(self, req: AINarrativeAdviceRequest) -> AINarrativeAdviceResponse:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {req.student_id} not found."
            )

        # Attempt Gemini LLM if enabled
        if settings.ENABLE_LLM and settings.GEMINI_API_KEY:
            prompt = (
                f"You are UdaanPath's senior career counselor for Indian youth. Provide empathetic, highly actionable guidance.\n"
                f"Student Profile:\n"
                f"- Name: {student.full_name}\n"
                f"- Education: {student.education_level}, Stream: {student.stream}, Marks: {student.percentage_marks}%\n"
                f"- Location: {student.district}, {student.state} (Tier: {student.location_tier})\n"
                f"- Annual Family Income: INR {student.annual_family_income}, Financial Constraint: {student.financial_constraint}\n"
                f"- Skills: {', '.join(student.skills or [])}\n"
                f"- Interests: {', '.join(student.interests or [])}\n"
                f"- Focus Area: {req.focus_area or 'General career progression'}\n\n"
                f"Provide: (1) Warm encouraging 3-paragraph counselor narrative, (2) 4 bullet key takeaways, (3) 3 specific immediate action steps. "
                f"Do NOT invent unverified schemes. Ground advice in Indian realities."
            )
            ai_text = self._call_gemini_api(prompt)
            if ai_text:
                return AINarrativeAdviceResponse(
                    student_id=student.id,
                    narrative_advice=ai_text,
                    key_takeaways=[
                        "Actionable insights tailored to your specific academic stream.",
                        "Direct focus on financial feasibility and rapid employability.",
                        "Structured milestones matching your location and background."
                    ],
                    is_ai_generated=True,
                    provider="gemini",
                    suggested_action_items=[
                        "Check your UdaanPath dashboard for matching scholarships.",
                        "Commence the foundational stage of your learning pathway.",
                        "Upload and verify your core documents."
                    ]
                )

        # Fallback to rule engine
        fallback_data = self._generate_rule_based_advice(student, req.focus_area)
        return AINarrativeAdviceResponse(
            student_id=student.id,
            narrative_advice=fallback_data["narrative_advice"],
            key_takeaways=fallback_data["key_takeaways"],
            is_ai_generated=fallback_data["is_ai_generated"],
            provider=fallback_data["provider"],
            suggested_action_items=fallback_data["suggested_action_items"]
        )

    def enrich_roadmap(self, req: AIRoadmapEnrichmentRequest) -> AIRoadmapEnrichmentResponse:
        pathway = self.pathway_repo.get_by_id(req.pathway_id)
        if not pathway:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pathway with id {req.pathway_id} not found."
            )

        tips = [
            f"Stage 1 (Foundational): Dedicate {pathway.weekly_study_hours} hours weekly to master core vocabulary and diagnostic tools.",
            "Stage 2 (Intermediate): Build 2 mini-projects to reinforce applied concepts without spending on costly bootcamps.",
            "Stage 3 (Advanced): Use free SWAYAM/NPTEL question banks to prepare for recognized trade/industry assessments.",
            "Stage 4 (Job-Ready): Register on National Career Service (ncs.gov.in) and NAPS apprenticeship portals."
        ]
        strategy = (
            f"Paced study schedule of {pathway.weekly_study_hours} hrs/week over {pathway.total_estimated_duration_months} months. "
            f"Utilizes 100% free curriculum alternatives to eliminate financial barriers."
        )

        return AIRoadmapEnrichmentResponse(
            pathway_id=pathway.id,
            career_title=pathway.career_title,
            study_strategy=strategy,
            stage_tips=tips,
            is_ai_generated=False,
            provider="rule_engine_fallback"
        )
