from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.opportunity import Opportunity
from app.repositories.opportunity import OpportunityRepository
from app.repositories.profile import ProfileRepository
from app.schemas.opportunity import (
    OpportunityMatchRequest,
    OpportunityMatchResponse,
    OpportunityMatchItem,
    OpportunityResponse
)


class OpportunityService:
    def __init__(self, db: Session):
        self.db = db
        self.opp_repo = OpportunityRepository(db)
        self.profile_repo = ProfileRepository(db)

    def list_opportunities(
        self,
        skip: int = 0,
        limit: int = 50,
        type: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Opportunity]:
        return self.opp_repo.get_all(skip=skip, limit=limit, type=type, search=search)

    def get_opportunity(self, opp_id: int) -> Opportunity:
        opp = self.opp_repo.get_by_id(opp_id)
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity with id {opp_id} not found."
            )
        return opp

    def match_opportunities(self, req: OpportunityMatchRequest) -> OpportunityMatchResponse:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {req.student_id} not found."
            )

        all_opps = self.opp_repo.get_all(limit=req.limit, type=req.type)
        matched_items: List[OpportunityMatchItem] = []

        for opp in all_opps:
            # Basic quick evaluation for matching score
            score = 100.0
            reasons = []

            # Income Check
            if opp.income_ceiling is not None:
                if student.annual_family_income <= opp.income_ceiling:
                    reasons.append(f"Income within ceiling (₹{opp.income_ceiling:,.0f})")
                else:
                    score -= 40.0
                    reasons.append(f"Income exceeds ceiling of ₹{opp.income_ceiling:,.0f}")

            # Gender Check
            allowed_g = [g.lower() for g in opp.allowed_genders]
            if "all" not in allowed_g and student.gender.lower() not in allowed_g:
                score -= 50.0
                reasons.append(f"Scheme restricted to {', '.join(opp.allowed_genders)}")

            # Category Check
            allowed_c = [c.upper() for c in opp.allowed_categories]
            if "ALL" not in allowed_c and student.category.upper() not in allowed_c:
                score -= 30.0
                reasons.append(f"Scheme targeted for {', '.join(opp.allowed_categories)}")

            # Academic Marks Check
            if opp.min_marks_percentage is not None:
                if student.percentage_marks >= opp.min_marks_percentage:
                    reasons.append(f"Marks ({student.percentage_marks}%) meet minimum ({opp.min_marks_percentage}%)")
                else:
                    score -= 25.0
                    reasons.append(f"Marks below minimum {opp.min_marks_percentage}%")

            # Final status
            if score >= 90.0:
                status_str = "ELIGIBLE"
            elif score >= 50.0:
                status_str = "PARTIALLY_ELIGIBLE"
            else:
                status_str = "INELIGIBLE"

            item = OpportunityMatchItem(
                opportunity=OpportunityResponse.model_validate(opp),
                match_score=max(10.0, score),
                eligibility_status=status_str,
                reasons=reasons
            )
            matched_items.append(item)

        # Sort by match score descending
        matched_items.sort(key=lambda x: x.match_score, reverse=True)

        return OpportunityMatchResponse(
            student_id=req.student_id,
            total_matches=len(matched_items),
            opportunities=matched_items
        )
