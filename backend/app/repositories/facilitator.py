from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.facilitator import CounselorIntervention, StudentOpportunityAssignment
from app.schemas.facilitator import CounselorInterventionCreate, StudentOpportunityAssignmentCreate


class FacilitatorRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_intervention(self, data_in: CounselorInterventionCreate) -> CounselorIntervention:
        db_obj = CounselorIntervention(**data_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_interventions_for_student(self, student_id: int) -> List[CounselorIntervention]:
        return self.db.query(CounselorIntervention).filter(
            CounselorIntervention.student_id == student_id
        ).order_by(CounselorIntervention.created_at.desc()).all()

    def count_interventions(self) -> int:
        return self.db.query(CounselorIntervention).count()

    def count_pending_for_student(self, student_id: int) -> int:
        return self.db.query(CounselorIntervention).filter(
            CounselorIntervention.student_id == student_id,
            CounselorIntervention.status == "pending"
        ).count()

    def assign_opportunity(self, data_in: StudentOpportunityAssignmentCreate) -> StudentOpportunityAssignment:
        existing = self.db.query(StudentOpportunityAssignment).filter(
            StudentOpportunityAssignment.student_id == data_in.student_id,
            StudentOpportunityAssignment.opportunity_id == data_in.opportunity_id
        ).first()
        if existing:
            existing.priority = data_in.priority
            existing.assigned_notes = data_in.assigned_notes
            self.db.commit()
            self.db.refresh(existing)
            return existing

        db_obj = StudentOpportunityAssignment(**data_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_assigned_opportunities(self, student_id: int) -> List[StudentOpportunityAssignment]:
        return self.db.query(StudentOpportunityAssignment).filter(
            StudentOpportunityAssignment.student_id == student_id
        ).all()
