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


# Keywords (English and common Hindi) that route a question to a topic.
# Dict order breaks ties.
QUERY_TOPICS: Dict[str, tuple] = {
    "funding": ("scholarship", "scheme", "fund", "money", "fee", "loan", "financial", "stipend", "grant",
                "छात्रवृत्ति", "योजना", "पैसे", "फीस"),
    "eligibility": ("eligib", "qualify", "deadline", "apply", "document", "पात्र", "आवेदन"),
    "courses": ("course", "certif", "learn", "skill", "training", "study", "swayam", "nptel", "online",
                "कोर्स", "कौशल", "प्रशिक्षण", "सीख"),
    "careers": ("career", "job", "salary", "pay", "work", "prospect", "after 10th", "after 12th",
                "technician", "vocational", "करियर", "नौकरी", "वेतन"),
}

TOPIC_LABELS: Dict[str, str] = {
    "funding": "scholarships and funding",
    "eligibility": "eligibility and applying",
    "courses": "courses and skills",
    "careers": "careers and jobs",
    "general": "general guidance",
}


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

    @staticmethod
    def classify_query(query: Optional[str]) -> str:
        """Maps a free-text question to a topic. The raw question never leaves
        this service; only the topic may be passed to the external model."""
        text = (query or "").lower()
        scores = {
            topic: sum(1 for keyword in keywords if keyword in text)
            for topic, keywords in QUERY_TOPICS.items()
        }
        best = max(scores, key=lambda topic: scores[topic])  # ties: dict order
        return best if scores[best] > 0 else "general"

    def _top_careers(self, student: StudentProfile, limit: int = 3) -> List[Any]:
        try:
            return RecommendationService(self.db).recommend_careers(student.id, limit=limit).recommendations
        except Exception as exc:
            logger.warning(f"Advisor could not load career matches: {exc}")
            return []

    def _top_opportunities(self, student: StudentProfile, limit: int = 3) -> List[Any]:
        try:
            return OpportunityService(self.db).match_opportunities(
                OpportunityMatchRequest(student_id=student.id, limit=limit)
            ).opportunities
        except Exception as exc:
            logger.warning(f"Advisor could not load opportunity matches: {exc}")
            return []

    def _kb_official_links(self) -> List[str]:
        sources = [
            item for item in self._load_kb_records("opportunities.json")
            if not item.get("is_sample") and item.get("official_url")
        ]
        return [
            "Check the official details for {}: {}".format(item["title"], item["official_url"])
            for item in sources[:3]
        ]

    def _generate_rule_based_advice(self, student: StudentProfile, topic: str = "general") -> Dict[str, Any]:
        """Answers the question's topic from UdaanPath's own computed results.
        Nothing here is AI-generated, and the response says so."""
        caution = (
            "Eligibility, benefits, deadlines, and course costs are unknown until confirmed on "
            "official provider pages. Career matches and roadmap activities are suggestions, not a "
            "guarantee of admission, funding, or employment."
        )
        intro = "You asked about {}. This answer was put together by UdaanPath's matching rules from your profile, not by an AI model.".format(
            TOPIC_LABELS[topic]
        )
        takeaways: List[str] = []
        actions: List[str] = []
        body = ""

        if topic == "careers":
            careers = self._top_careers(student)
            if careers:
                body = "Your strongest rule-based career matches are: {}.".format(
                    ", ".join(c.title for c in careers)
                )
                takeaways = [
                    "{}: {}/100 rule-based match. {}".format(c.title, round(c.match_score), c.rationale)
                    for c in careers
                ]
                actions = [
                    "Open Career Discovery to compare training time, skills and catalogue pay estimates for {}.".format(careers[0].title),
                    "Generate a learning roadmap for {} from Career Discovery.".format(careers[0].title),
                ]

        elif topic in ("funding", "eligibility"):
            opportunities = self._top_opportunities(student)
            if opportunities:
                body = "These programmes were checked against your profile by UdaanPath's eligibility rules: {}.".format(
                    ", ".join(o.opportunity.title for o in opportunities)
                )
                takeaways = [
                    "{}: {}".format(o.opportunity.title, o.eligibility_status.replace("_", " ").lower())
                    for o in opportunities
                ]
                actions = [
                    "Confirm eligibility, amounts and current dates for {} on the official page: {}".format(
                        o.opportunity.title, o.opportunity.official_portal_url
                    )
                    for o in opportunities
                ]

        elif topic == "courses":
            resources = [
                item for item in self._load_kb_records("learning_resources.json")
                if not item.get("is_sample") and item.get("url")
            ]
            careers = self._top_careers(student, limit=1)
            if careers:
                career = self.career_repo.get_by_id(careers[0].career_id)
                skills = (career.key_skills or [])[:4] if career else []
                if skills:
                    body = "For your top career match, {}, useful skills include {}.".format(
                        careers[0].title, ", ".join(skills)
                    )
                    takeaways.append("Skills to build for {}: {}.".format(careers[0].title, ", ".join(skills)))
            takeaways += ["{} is a public learning portal.".format(item["title"]) for item in resources[:3]]
            actions = [
                "Look for free courses on {}: {}".format(item["title"], item["url"])
                for item in resources[:3]
            ]

        if not body:
            # General question, or no computed results for the topic.
            careers = self._top_careers(student, limit=1)
            if careers:
                body = "Your strongest rule-based career match is {} ({}/100).".format(
                    careers[0].title, round(careers[0].match_score)
                )

        takeaways += [
            "Unknown eligibility details must be checked on the official programme page.",
            "This guidance does not guarantee an award, admission, or job.",
        ]
        actions = actions or self._kb_official_links()
        if not actions:
            actions = ["Check the opportunity provider's official page for current eligibility, dates, and costs."]

        return {
            "narrative_advice": " ".join(part for part in (intro, body, caution) if part),
            "key_takeaways": takeaways,
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

        topic = self.classify_query(req.query)

        context = self._build_rule_engine_context(student) if settings.ENABLE_LLM and settings.GEMINI_API_KEY else {"careers": [], "opportunities": []}
        if context["careers"] or context["opportunities"]:
            # Only the topic is shared, never the student's own words.
            prompt = (
                "Explain only the results below, which were computed by UdaanPath's rule engines from verified knowledge-base records. "
                "Do not add eligibility, deadline, salary, benefit, or certification claims. Say unknown when a result does not include a fact. "
                "Do not ask for or infer personal information.\n"
                "The student's question is about: " + TOPIC_LABELS[topic] + ". Focus the explanation on that topic.\n"
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
                    topic=topic,
                )

        # Not configured, no trustworthy context, or the model call failed:
        # answer from the rule engines and say so.
        fallback_data = self._generate_rule_based_advice(student, topic)
        return AINarrativeAdviceResponse(
            student_id=student.id,
            narrative_advice=fallback_data["narrative_advice"],
            key_takeaways=fallback_data["key_takeaways"],
            is_ai_generated=fallback_data["is_ai_generated"],
            provider=fallback_data["provider"],
            suggested_action_items=fallback_data["suggested_action_items"],
            topic=topic,
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
