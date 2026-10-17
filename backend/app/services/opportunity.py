from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.opportunity import Opportunity
from app.repositories.opportunity import OpportunityRepository
from app.repositories.profile import ProfileRepository
from app.services.eligibility import EligibilityEngine
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

        all_opps = self.opp_repo.get_all(limit=max(self.opp_repo.count(), 1), type=req.type)
        matched_items: List[OpportunityMatchItem] = []
        eligibility_engine = EligibilityEngine(self.db)

        for opp in all_opps:
            result = eligibility_engine.evaluate(student, opp)
            criteria = result.passed_criteria + result.failed_criteria + result.unknown_criteria
            reasons = [f"{item.criterion_name}: {item.explanation}" for item in criteria]

            item = OpportunityMatchItem(
                opportunity=OpportunityResponse.model_validate(opp),
                match_score=result.match_score,
                eligibility_status=result.status,
                reasons=reasons
            )
            matched_items.append(item)

        matched_items.sort(key=lambda item: (-item.match_score, item.opportunity.title.lower()))
        matched_items = matched_items[:req.limit]

        return OpportunityMatchResponse(
            student_id=req.student_id,
            total_matches=len(matched_items),
            opportunities=matched_items
        )
