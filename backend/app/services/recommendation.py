from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import StudentProfile
from app.models.career import Career
from app.repositories.profile import ProfileRepository
from app.repositories.career import CareerRepository
from app.schemas.career import CareerRecommendationItem, CareerRecommendationResponse


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)
        self.career_repo = CareerRepository(db)

    def _normalize_tokens(self, string_list: List[str]) -> set:
        tokens = set()
        for item in string_list:
            clean = item.lower().strip()
            tokens.add(clean)
            for part in clean.replace("-", " ").replace("/", " ").split():
                if len(part) > 2:
                    tokens.add(part)
        return tokens

    def _score_career_for_student(self, student: StudentProfile, career: Career) -> Tuple[float, str]:
        score = 0.0
        reasons = []

        # 1. Academic & Stream Compatibility (35 max)
        eligible_streams = [s.lower() for s in (career.eligible_streams or [])]
        student_stream = (student.stream or "general").lower()
        if not eligible_streams or "all" in eligible_streams or student_stream in eligible_streams:
            score += 25.0
            reasons.append(f"Matches your educational stream ({student.stream.replace('_', ' ').title()})")

        education_hierarchy = {
            "10th_pass": 1,
            "12th_pass": 2,
            "iti_diploma": 3,
            "undergraduate": 4,
            "postgraduate": 5
        }
        student_edu_level = education_hierarchy.get(student.education_level, 0)
        career_req_level = education_hierarchy.get(career.entry_qualification, 99)
        if student_edu_level >= career_req_level:
            score += 10.0
            reasons.append(f"Satisfies entry prerequisite ({career.entry_qualification.replace('_', ' ').title()})")

        # 2. Skill Alignment (25 max)
        student_skill_tokens = self._normalize_tokens(student.skills or [])
        career_skill_tokens = self._normalize_tokens(career.key_skills or [])
        if career_skill_tokens:
            skill_overlap = student_skill_tokens.intersection(career_skill_tokens)
            skill_ratio = min(1.0, len(skill_overlap) / max(1, len(career_skill_tokens) * 0.4))
            skill_score = skill_ratio * 25.0
            score += skill_score
            if skill_overlap:
                reasons.append(f"Builds upon your skills in {', '.join(list(skill_overlap)[:3])}")

        # 3. Interest & Aspiration Alignment (25 max)
        student_interest_tokens = self._normalize_tokens((student.interests or []) + (student.career_aspirations or []))
        career_interest_tokens = self._normalize_tokens((career.typical_interests or []) + [career.title, career.sector])
        if career_interest_tokens:
            interest_overlap = student_interest_tokens.intersection(career_interest_tokens)
            interest_ratio = min(1.0, len(interest_overlap) / max(1, len(career_interest_tokens) * 0.3))
            interest_score = interest_ratio * 25.0
            score += interest_score
            if interest_overlap:
                reasons.append(f"Aligns with your interest in {', '.join(list(interest_overlap)[:3])}")

        # 4. Socioeconomic Feasibility (15 max)
        if student.financial_constraint in ["high", "extreme"] or student.annual_family_income <= 180000:
            if career.financial_barrier == "low":
                score += 15.0
                reasons.append("Low training cost barrier with quick pathway to earning")
            elif career.financial_barrier == "moderate":
                score += 9.0
            else:
                score += 4.0
        else:
            score += 10.0

        final_score = round(score, 1)
        combined_rationale = ". ".join(reasons) if reasons else f"Possible option based on the listed entry requirements for {career.title}"
        combined_rationale += "."
        return final_score, combined_rationale

    def _career_is_reachable(self, student: StudentProfile, career: Career) -> bool:
        eligible_streams = [stream.lower() for stream in (career.eligible_streams or [])]
        student_stream = (student.stream or "").lower()
        if eligible_streams and "all" not in eligible_streams and student_stream not in eligible_streams:
            return False

        education_hierarchy = {
            "10th_pass": 1,
            "12th_pass": 2,
            "iti_diploma": 3,
            "undergraduate": 4,
            "postgraduate": 5,
        }
        student_level = education_hierarchy.get(student.education_level, 0)
        required_level = education_hierarchy.get(career.entry_qualification, 99)
        return student_level >= required_level

    def _diversity_group(self, career: Career) -> str:
        if career.category == "vocational_skilled_trades":
            return "vocational"
        description = f"{career.title} {career.sector}".lower()
        stem_terms = ("technology", "technical", "data", "science", "engineering", "manufacturing", "healthcare", "diagnostic", "agriculture", "drone", "renewable")
        return "stem" if any(term in description for term in stem_terms) else "non_stem"

    def recommend_careers(self, student_id: int, limit: int = 5) -> CareerRecommendationResponse:
        student = self.profile_repo.get_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {student_id} not found."
            )

        all_careers = self.career_repo.get_all(limit=100)
        if not all_careers:
            return CareerRecommendationResponse(
                student_id=student_id,
                total_recommendations=0,
                recommendations=[]
            )

        scored_items = []
        for career in all_careers:
            if not self._career_is_reachable(student, career):
                continue
            match_score, rationale = self._score_career_for_student(student, career)
            item = CareerRecommendationItem(
                career_id=career.id,
                title=career.title,
                category=career.category,
                sector=career.sector,
                match_score=match_score,
                rationale=rationale,
                starting_salary_inr=career.starting_salary_inr,
                mid_level_salary_inr=career.mid_level_salary_inr,
                growth_outlook=career.growth_outlook,
                entry_qualification=career.entry_qualification,
                key_skills=career.key_skills or [],
                financial_barrier=career.financial_barrier
            )
            scored_items.append(item)

        # Sort by match score descending
        scored_items.sort(key=lambda item: (-item.match_score, item.title.lower()))

        # Enforce diversity: balance categories so top recommendations aren't monolithic
        selected: List[CareerRecommendationItem] = []
        groups_seen = set()

        # First pass: pick best from diverse categories
        for item in scored_items:
            career = next(career for career in all_careers if career.id == item.career_id)
            group = self._diversity_group(career)
            if group not in groups_seen:
                selected.append(item)
                groups_seen.add(group)
            if len(selected) >= min(limit, 5):
                break

        # Second pass: fill remaining slots with highest remaining scores
        if len(selected) < min(limit, 5):
            for item in scored_items:
                if item not in selected:
                    selected.append(item)
                if len(selected) >= min(limit, 5):
                    break

        selected.sort(key=lambda item: (-item.match_score, item.title.lower()))
        for item in selected:
            alternatives = [
                other.title for other in selected
                if other.career_id != item.career_id and other.category != item.category
            ][:2]
            item.alternative_pathways = alternatives

        return CareerRecommendationResponse(
            student_id=student_id,
            total_recommendations=len(selected),
            recommendations=selected
        )
