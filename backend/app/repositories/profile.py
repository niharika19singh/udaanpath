from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.profile import StudentProfile
from app.schemas.profile import ProfileCreate, ProfileUpdate


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, profile_id: int) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()

    def get_by_email(self, email: str) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.email == email).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        state: Optional[str] = None,
        education_level: Optional[str] = None,
        is_at_risk: Optional[bool] = None
    ) -> List[StudentProfile]:
        query = self.db.query(StudentProfile)
        if state:
            query = query.filter(StudentProfile.state.ilike(f"%{state}%"))
        if education_level:
            query = query.filter(StudentProfile.education_level == education_level)
        if is_at_risk is not None:
            query = query.filter(StudentProfile.is_at_risk == is_at_risk)
        return query.offset(skip).limit(limit).all()

    def create(self, profile_in: ProfileCreate) -> StudentProfile:
        db_obj = StudentProfile(**profile_in.model_dump())
        # Automatically mark at-risk if extreme financial constraint or low income
        if db_obj.financial_constraint in ["high", "extreme"] or db_obj.annual_family_income <= 150000:
            db_obj.is_at_risk = True
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: StudentProfile, profile_in: ProfileUpdate) -> StudentProfile:
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        if "financial_constraint" in update_data or "annual_family_income" in update_data:
            if db_obj.financial_constraint in ["high", "extreme"] or db_obj.annual_family_income <= 150000:
                db_obj.is_at_risk = True
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, profile_id: int) -> bool:
        db_obj = self.get_by_id(profile_id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
