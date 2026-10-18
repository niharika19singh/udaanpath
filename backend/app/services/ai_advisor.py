from typing import List, Dict, Any, Optional
from pathlib import Path
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
from app.schemas.opportunity import OpportunityMatchRequest
from app.services.opportunity import OpportunityService
from app.services.recommendation import RecommendationService
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

    def _load_kb_records(self, filename: str) -> List[Dict[str, Any]]:
        path = Path(__file__).resolve().parents[2] / "data" / "kb" / filename
        try:
            with path.open("r", encoding="utf-8") as data_file:
                return json.load(data_file)
        except (OSError, json.JSONDecodeError):
            return []

    def _verified_records(self, filename: str, eligibility_required: bool = False) -> Dict[str, Dict[str, Any]]:
        records = self._load_kb_records(filename)
        return {
            item["slug"]: item
            for item in records
            if item.get("status") == "verified"
            and not item.get("is_sample", False)
            and item.get("source_url")
            and item.get("last_verified_on")
            and item.get("verified_by")
            and (not eligibility_required or item.get("eligibility_confirmed") is True)
        }

    def _build_rule_engine_context(self, student: StudentProfile) -> Dict[str, Any]:
        verified_careers = self._verified_records("careers.json")
        verified_opportunities = self._verified_records("opportunities.json", eligibility_required=True)
        career_results = []
        opportunity_results = []

        if verified_careers:
            recommendations = RecommendationService(self.db).recommend_careers(student.id, limit=5)
            for result in recommendations.recommendations:
                career = self.career_repo.get_by_id(result.career_id)
                if career and career.slug in verified_careers:
                    career_results.append({"title": result.title, "score": result.match_score})

        if verified_opportunities:
            matches = OpportunityService(self.db).match_opportunities(
                OpportunityMatchRequest(student_id=student.id, limit=10)
            )
            for result in matches.opportunities:
                slug = result.opportunity.slug
                if slug in verified_opportunities:
                    opportunity_results.append({
                        "title": result.opportunity.title,
                        "status": result.eligibility_status,
                        "score": result.match_score,
                        "source_url": str(verified_opportunities[slug]["source_url"]),
                    })

        return {"careers": career_results, "opportunities": opportunity_results}

    def _generate_rule_based_advice(self, student: StudentProfile, focus_area: Optional[str] = None) -> Dict[str, Any]:
        sources = [
            item for item in self._load_kb_records("opportunities.json")
            if not item.get("is_sample") and item.get("official_url")
        ]
        actions = [
            "Check the official details for {}: {}".format(item["title"], item["official_url"])
            for item in sources[:3]
        ]
        if not actions:
            actions = ["Check the opportunity provider's official page for current eligibility, dates, and costs."]
        return {
            "narrative_advice": "Eligibility, benefits, deadlines, and course costs are unknown until confirmed on official provider pages. Career matches and roadmap activities are suggestions, not a guarantee of admission, funding, or employment.",
            "key_takeaways": [
                "Unknown eligibility details must be checked on the official programme page.",
                "This guidance does not guarantee an award, admission, or job.",
            ],
            "suggested_action_items": actions,
            "is_ai_generated": False,
            "provider": "rule_engine_fallback",
        }

    def _call_gemini_api(self, prompt: str) -> Optional[str]:
        """Calls Google Gemini API with timeout protection and returns text output if successful."""
        if not settings.ENABLE_LLM or not settings.GEMINI_API_KEY:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent"
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
                res = client.post(url, headers={"x-goog-api-key": settings.GEMINI_API_KEY}, json=payload)
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

        context = self._build_rule_engine_context(student) if settings.ENABLE_LLM and settings.GEMINI_API_KEY else {"careers": [], "opportunities": []}
        if context["careers"] or context["opportunities"]:
            prompt = (
                "Explain only the results below, which were computed by UdaanPath's rule engines from verified knowledge-base records. "
                "Do not add eligibility, deadline, salary, benefit, or certification claims. Say unknown when a result does not include a fact. "
                "Do not ask for or infer personal information.\n"
                "Computed results:\n" + json.dumps(context, ensure_ascii=True)
            )
            ai_text = self._call_gemini_api(prompt)
            if ai_text:
                return AINarrativeAdviceResponse(
                    student_id=student.id,
                    narrative_advice=ai_text,
                    key_takeaways=[],
                    is_ai_generated=True,
                    provider="gemini",
                    suggested_action_items=[],
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
            "Suggestion only for {}: use the listed resource as a starting point; course requirements and costs are unknown.".format(milestone.stage)
            for milestone in pathway.milestones
        ]
        strategy = "Suggested pace: {} hours per week over about {} months. This is a planning estimate; course costs and requirements are unknown.".format(
            pathway.weekly_study_hours, pathway.total_estimated_duration_months,
        )

        return AIRoadmapEnrichmentResponse(
            pathway_id=pathway.id,
            career_title=pathway.career_title,
            study_strategy=strategy,
            stage_tips=tips,
            is_ai_generated=False,
            provider="rule_engine_fallback"
        )
