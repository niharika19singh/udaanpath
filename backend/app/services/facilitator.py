from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import StudentProfile
from app.repositories.facilitator import FacilitatorRepository
from app.repositories.profile import ProfileRepository
from app.repositories.pathway import PathwayRepository
from app.repositories.progress import ProgressRepository
from app.repositories.opportunity import OpportunityRepository
from app.schemas.facilitator import (
    CounselorInterventionCreate,
    CounselorInterventionResponse,
    StudentOpportunityAssignmentCreate,
    StudentOpportunityAssignmentResponse,
    FacilitatorStudentItem,
    FacilitatorDashboardResponse
)


class FacilitatorService:
    def __init__(self, db: Session):
        self.db = db
        self.facilitator_repo = FacilitatorRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.pathway_repo = PathwayRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.opp_repo = OpportunityRepository(db)

    def _calculate_student_vulnerability(self, student: StudentProfile) -> float:
        score = 0.0

        # 1. Financial Risk (40 max)
        if student.financial_constraint == "extreme" or student.annual_family_income <= 120000:
            score += 40.0
        elif student.financial_constraint == "high" or student.annual_family_income <= 200000:
            score += 30.0
        elif student.financial_constraint == "moderate" or student.annual_family_income <= 350000:
            score += 15.0
        else:
            score += 5.0

        # 2. Academic Risk (30 max)
        if student.percentage_marks < 50.0:
            score += 30.0
        elif student.percentage_marks < 60.0:
            score += 20.0
        elif student.percentage_marks < 70.0:
            score += 10.0
        else:
            score += 0.0

        # 3. Milestone Lag Risk (30 max)
        pathways = self.pathway_repo.get_all_for_student(student.id)
        if pathways:
            total_m = sum(len(p.milestones) for p in pathways)
            comp_m = sum(sum(1 for m in p.milestones if m.status == "completed") for p in pathways)
            rate = (comp_m / total_m) if total_m > 0 else 0.0
            if rate < 0.25:
                score += 30.0
            elif rate < 0.50:
                score += 15.0
        else:
            score += 20.0  # Has not initiated any pathway yet

        return min(100.0, round(score, 1))

    def _build_student_item(self, student: StudentProfile) -> FacilitatorStudentItem:
        v_score = self._calculate_student_vulnerability(student)

        # Milestones
        pathways = self.pathway_repo.get_all_for_student(student.id)
        total_m = sum(len(p.milestones) for p in pathways)
        comp_m = sum(sum(1 for m in p.milestones if m.status == "completed") for p in pathways)
        m_rate = round((comp_m / total_m) * 100.0, 1) if total_m > 0 else 0.0

        # Documents
        docs = self.progress_repo.get_documents_for_student(student.id)
        verified_count = sum(1 for d in docs if d.is_verified)
        d_rate = round(min(100.0, (verified_count / 5) * 100.0), 1)

        pending_int = self.facilitator_repo.count_pending_for_student(student.id)

        return FacilitatorStudentItem(
            student_id=student.id,
            full_name=student.full_name,
            email=student.email,
            state=student.state,
            district=student.district,
            education_level=student.education_level,
            stream=student.stream,
            annual_family_income=student.annual_family_income,
            financial_constraint=student.financial_constraint,
            is_at_risk=student.is_at_risk or (v_score >= 60.0),
            vulnerability_score=v_score,
            document_readiness_score=d_rate,
            milestone_completion_rate=m_rate,
            pending_interventions_count=pending_int
        )

    def get_dashboard(self) -> FacilitatorDashboardResponse:
        all_students = self.profile_repo.get_all(limit=500)
        total_students = len(all_students)

        student_items = [self._build_student_item(s) for s in all_students]
        # Sort by vulnerability score descending
        student_items.sort(key=lambda x: x.vulnerability_score, reverse=True)

        at_risk_count = sum(1 for s in student_items if s.is_at_risk)
        high_fin_count = sum(1 for s in all_students if s.financial_constraint in ["high", "extreme"])
        total_interventions = self.facilitator_repo.count_interventions()

        avg_completion = (
            round(sum(s.milestone_completion_rate for s in student_items) / total_students, 1)
            if total_students > 0 else 0.0
        )

        return FacilitatorDashboardResponse(
            total_students_monitored=total_students,
            at_risk_students_count=at_risk_count,
            high_financial_constraint_count=high_fin_count,
            total_applications_tracked=0,
            total_interventions_logged=total_interventions,
            average_milestone_completion_rate=avg_completion,
            top_priority_students=student_items[:10]
        )

    def list_monitored_students(self, is_at_risk: Optional[bool] = None, state: Optional[str] = None) -> List[FacilitatorStudentItem]:
        students = self.profile_repo.get_all(limit=100, state=state)
        items = [self._build_student_item(s) for s in students]
        if is_at_risk is not None:
            items = [s for s in items if s.is_at_risk == is_at_risk]
        items.sort(key=lambda x: x.vulnerability_score, reverse=True)
        return items

    def log_intervention(self, data_in: CounselorInterventionCreate) -> CounselorInterventionResponse:
        student = self.profile_repo.get_by_id(data_in.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with id {data_in.student_id} not found."
            )
        obj = self.facilitator_repo.create_intervention(data_in)
        return CounselorInterventionResponse.model_validate(obj)

    def get_interventions_for_student(self, student_id: int) -> List[CounselorInterventionResponse]:
        items = self.facilitator_repo.get_interventions_for_student(student_id)
        return [CounselorInterventionResponse.model_validate(i) for i in items]

    def assign_opportunity_to_student(self, data_in: StudentOpportunityAssignmentCreate) -> StudentOpportunityAssignmentResponse:
        student = self.profile_repo.get_by_id(data_in.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with id {data_in.student_id} not found."
            )
        opp = self.opp_repo.get_by_id(data_in.opportunity_id)
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity with id {data_in.opportunity_id} not found."
            )

        assigned = self.facilitator_repo.assign_opportunity(data_in)
        resp = StudentOpportunityAssignmentResponse.model_validate(assigned)
        resp.opportunity_title = opp.title
        return resp
