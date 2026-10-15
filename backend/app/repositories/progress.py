from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.progress import OpportunityApplication, SkillBadge, StudentDocument
from app.schemas.progress import (
    OpportunityApplicationCreate,
    OpportunityApplicationUpdate,
    SkillBadgeCreate,
    StudentDocumentCreate
)


class ProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    # Applications
    def get_application_by_id(self, app_id: int) -> Optional[OpportunityApplication]:
        return self.db.query(OpportunityApplication).filter(OpportunityApplication.id == app_id).first()

    def get_applications_for_student(self, student_id: int) -> List[OpportunityApplication]:
        return self.db.query(OpportunityApplication).filter(OpportunityApplication.student_id == student_id).all()

    def create_application(self, app_in: OpportunityApplicationCreate) -> OpportunityApplication:
        existing = self.db.query(OpportunityApplication).filter(
            OpportunityApplication.student_id == app_in.student_id,
            OpportunityApplication.opportunity_id == app_in.opportunity_id
        ).first()
        if existing:
            existing.status = app_in.status
            if app_in.applied_date:
                existing.applied_date = app_in.applied_date
            if app_in.application_reference:
                existing.application_reference = app_in.application_reference
            if app_in.notes:
                existing.notes = app_in.notes
            self.db.commit()
            self.db.refresh(existing)
            return existing

        db_obj = OpportunityApplication(**app_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update_application(self, db_obj: OpportunityApplication, app_in: OpportunityApplicationUpdate) -> OpportunityApplication:
        for field, val in app_in.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, val)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    # Badges
    def get_badges_for_student(self, student_id: int) -> List[SkillBadge]:
        return self.db.query(SkillBadge).filter(SkillBadge.student_id == student_id).all()

    def award_badge(self, badge_in: SkillBadgeCreate) -> SkillBadge:
        existing = self.db.query(SkillBadge).filter(
            SkillBadge.student_id == badge_in.student_id,
            SkillBadge.badge_name == badge_in.badge_name
        ).first()
        if existing:
            return existing
        db_obj = SkillBadge(**badge_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    # Documents
    def get_documents_for_student(self, student_id: int) -> List[StudentDocument]:
        return self.db.query(StudentDocument).filter(StudentDocument.student_id == student_id).all()

    def add_document(self, doc_in: StudentDocumentCreate) -> StudentDocument:
        existing = self.db.query(StudentDocument).filter(
            StudentDocument.student_id == doc_in.student_id,
            StudentDocument.document_type == doc_in.document_type
        ).first()
        if existing:
            existing.is_verified = doc_in.is_verified
            if doc_in.document_number_masked:
                existing.document_number_masked = doc_in.document_number_masked
            self.db.commit()
            self.db.refresh(existing)
            return existing

        db_obj = StudentDocument(**doc_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
