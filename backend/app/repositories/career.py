from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.career import Career
from app.schemas.career import CareerCreate


class CareerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, career_id: int) -> Optional[Career]:
        return self.db.query(Career).filter(Career.id == career_id).first()

    def get_by_slug(self, slug: str) -> Optional[Career]:
        return self.db.query(Career).filter(Career.slug == slug).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        min_salary: Optional[int] = None,
        is_active: bool = True
    ) -> List[Career]:
        query = self.db.query(Career).filter(Career.is_active == is_active)
        if category:
            query = query.filter(Career.category == category)
        if sector:
            query = query.filter(Career.sector.ilike(f"%{sector}%"))
        if min_salary:
            query = query.filter(Career.starting_salary_inr >= min_salary)
        return query.offset(skip).limit(limit).all()

    def create(self, career_in: CareerCreate) -> Career:
        db_obj = Career(**career_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def count(self) -> int:
        return self.db.query(Career).count()
