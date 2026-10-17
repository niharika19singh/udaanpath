from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.pathway import Pathway, PathwayMilestone


class PathwayRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, pathway_id: int) -> Optional[Pathway]:
        return self.db.query(Pathway).filter(Pathway.id == pathway_id).first()

    def get_by_student_and_career(self, student_id: int, career_id: int) -> Optional[Pathway]:
        return self.db.query(Pathway).filter(
            Pathway.student_id == student_id,
            Pathway.career_id == career_id,
            Pathway.is_active == True
        ).first()

    def get_all_for_student(self, student_id: int) -> List[Pathway]:
        return self.db.query(Pathway).filter(Pathway.student_id == student_id).all()

    def create(self, pathway: Pathway) -> Pathway:
        self.db.add(pathway)
        self.db.commit()
        self.db.refresh(pathway)
        return pathway

    def get_milestone_by_id(self, milestone_id: int) -> Optional[PathwayMilestone]:
        return self.db.query(PathwayMilestone).filter(PathwayMilestone.id == milestone_id).first()

    def update_milestone_status(self, milestone: PathwayMilestone, new_status: str) -> PathwayMilestone:
        milestone.status = new_status
        self.db.commit()
        self.db.refresh(milestone)
        return milestone
