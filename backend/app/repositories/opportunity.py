from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity
from app.schemas.opportunity import OpportunityCreate


class OpportunityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, opportunity_id: int) -> Optional[Opportunity]:
        return self.db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()

    def get_by_slug(self, slug: str) -> Optional[Opportunity]:
        return self.db.query(Opportunity).filter(Opportunity.slug == slug).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        type: Optional[str] = None,
        search: Optional[str] = None,
        is_active: bool = True
    ) -> List[Opportunity]:
        query = self.db.query(Opportunity).filter(Opportunity.is_active == is_active)
        if type:
            query = query.filter(Opportunity.type == type)
        if search:
            query = query.filter(
                (Opportunity.title.ilike(f"%{search}%")) |
                (Opportunity.provider.ilike(f"%{search}%")) |
                (Opportunity.description.ilike(f"%{search}%"))
            )
        return query.offset(skip).limit(limit).all()

    def create(self, opp_in: OpportunityCreate) -> Opportunity:
        db_obj = Opportunity(**opp_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def count(self) -> int:
        return self.db.query(Opportunity).count()
