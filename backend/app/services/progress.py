from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import StudentProfile
from app.repositories.progress import ProgressRepository
from app.repositories.profile import ProfileRepository
from app.repositories.pathway import PathwayRepository
from app.repositories.opportunity import OpportunityRepository
from app.schemas.progress import (
    OpportunityApplicationCreate,
    OpportunityApplicationUpdate,
    OpportunityApplicationResponse,
    SkillBadgeCreate,
    SkillBadgeResponse,
    StudentDocumentCreate,
    StudentDocumentResponse,
    StudentProgressOverview
)


class ProgressService:
    CORE_DOCUMENTS = ["aadhaar", "income_certificate", "marksheet_10", "marksheet_12", "bank_passbook"]

    def __init__(self, db: Session):
        self.db = db
        self.progress_repo = ProgressRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.pathway_repo = PathwayRepository(db)
        self.opp_repo = OpportunityRepository(db)

    def record_application(self, app_in: OpportunityApplicationCreate) -> OpportunityApplicationResponse:
        student = self.profile_repo.get_by_id(app_in.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with id {app_in.student_id} not found."
            )
        opp = self.opp_repo.get_by_id(app_in.opportunity_id)
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity with id {app_in.opportunity_id} not found."
            )

        app_obj = self.progress_repo.create_application(app_in)
        resp = OpportunityApplicationResponse.model_validate(app_obj)
        resp.opportunity_title = opp.title

        # Check badge for active applicant
        if app_in.status == "applied":
            self.progress_repo.award_badge(SkillBadgeCreate(
                student_id=student.id,
                badge_name="Opportunity Trailblazer",
                badge_category="milestone",
                description="Submitted an official application for a verified opportunity"
            ))

        return resp

    def update_application_status(self, app_id: int, app_in: OpportunityApplicationUpdate) -> OpportunityApplicationResponse:
        app_obj = self.progress_repo.get_application_by_id(app_id)
        if not app_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application with id {app_id} not found."
            )
        updated = self.progress_repo.update_application(app_obj, app_in)
        opp = self.opp_repo.get_by_id(updated.opportunity_id)
        resp = OpportunityApplicationResponse.model_validate(updated)
        resp.opportunity_title = opp.title if opp else None
        return resp

    def register_document(self, doc_in: StudentDocumentCreate) -> StudentDocumentResponse:
        student = self.profile_repo.get_by_id(doc_in.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with id {doc_in.student_id} not found."
            )
        doc = self.progress_repo.add_document(doc_in)
        return StudentDocumentResponse.model_validate(doc)

    def get_student_progress_overview(self, student_id: int) -> StudentProgressOverview:
        student = self.profile_repo.get_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with id {student_id} not found."
            )

        # Milestones calculation
        pathways = self.pathway_repo.get_all_for_student(student_id)
        total_milestones = 0
        completed_milestones = 0
        for p in pathways:
            for m in p.milestones:
                total_milestones += 1
                if m.status == "completed":
                    completed_milestones += 1

        completion_rate = (
            round((completed_milestones / total_milestones) * 100.0, 1)
            if total_milestones > 0 else 0.0
        )

        # Document readiness score
        docs = self.progress_repo.get_documents_for_student(student_id)
        verified_types = {d.document_type for d in docs if d.is_verified}
        verified_count = len(verified_types)
        doc_readiness = round(min(100.0, (verified_count / len(self.CORE_DOCUMENTS)) * 100.0), 1)

        # Award badge if document ready
        if doc_readiness >= 80.0:
            self.progress_repo.award_badge(SkillBadgeCreate(
                student_id=student_id,
                badge_name="Document Ready",
                badge_category="milestone",
                description="80%+ essential verification documents prepared and authenticated"
            ))

        # Award badge if milestones completed
        if completed_milestones >= 1:
            self.progress_repo.award_badge(SkillBadgeCreate(
                student_id=student_id,
                badge_name="First Milestone Achieved",
                badge_category="milestone",
                description="Completed first milestone on the career pathway"
            ))

        badges = self.progress_repo.get_badges_for_student(student_id)
        apps = self.progress_repo.get_applications_for_student(student_id)

        app_responses = []
        for a in apps:
            opp = self.opp_repo.get_by_id(a.opportunity_id)
            r = OpportunityApplicationResponse.model_validate(a)
            r.opportunity_title = opp.title if opp else None
            app_responses.append(r)

        return StudentProgressOverview(
            student_id=student.id,
            student_name=student.full_name,
            completed_milestones_count=completed_milestones,
            total_milestones_count=total_milestones,
            milestone_completion_rate=completion_rate,
            document_readiness_score=doc_readiness,
            verified_documents_count=verified_count,
            active_pathways_count=len(pathways),
            applications_count=len(apps),
            earned_badges=[SkillBadgeResponse.model_validate(b) for b in badges],
            applications=app_responses,
            documents=[StudentDocumentResponse.model_validate(d) for d in docs]
        )
