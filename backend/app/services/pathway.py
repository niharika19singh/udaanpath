import json
from pathlib import Path
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pathway import Pathway, PathwayMilestone
from app.repositories.pathway import PathwayRepository
from app.repositories.profile import ProfileRepository
from app.repositories.career import CareerRepository
from app.schemas.pathway import PathwayGenerateRequest, PathwayResponse


class PathwayService:
    def __init__(self, db: Session):
        self.db = db
        self.pathway_repo = PathwayRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.career_repo = CareerRepository(db)

    def _build_milestone_templates(self, career_title: str, category: str, skills: List[str]) -> List[Dict[str, Any]]:
        stages = ["foundational", "intermediate", "advanced", "job_ready"]
        durations = [4, 6, 6, 8]
        templates = []
        for index, stage in enumerate(stages):
            stage_name = stage.replace("_", " ").title()
            templates.append({
                "stage": stage,
                "step_number": index + 1,
                "title": "Suggested {} practice".format(stage_name),
                "description": "Suggestion only; this is not a verified course, qualification, or job requirement.",
                "duration_weeks": durations[index],
                "skills_to_acquire": skills[index:index + 2],
                "recommended_certification": None,
                "estimated_cost_inr": 0.0,
                "free_alternative_resource": "Resource option (cost unknown)",
                "resource_url": "",
            })
        return templates

    def _prepare_suggested_templates(self, templates: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
        data_path = Path(__file__).resolve().parents[2] / "data" / "kb" / "learning_resources.json"
        with data_path.open("r", encoding="utf-8") as data_file:
            resources = json.load(data_file)
        resource_slug = "skill-india-digital" if category == "vocational_skilled_trades" else "swayam-portal"
        resource = next((item for item in resources if item.get("slug") == resource_slug), None)
        if resource is None:
            raise ValueError(f"Learning resource {resource_slug} is missing from the knowledge base")

        for index, template in enumerate(templates, start=1):
            template["title"] = f"Suggested learning activity {index}"
            template["description"] = "Suggestion only; this is not a verified course, qualification, or job requirement. Check the linked provider for current details."
            template["recommended_certification"] = None
            template["estimated_cost_inr"] = 0.0
            template["free_alternative_resource"] = f"Resource option (cost unknown): {resource['title']}. Check course-specific fees."
            template["resource_url"] = resource["url"]
        return templates

    def generate_pathway(self, req: PathwayGenerateRequest) -> Pathway:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {req.student_id} not found."
            )

        career = self.career_repo.get_by_id(req.career_id)
        if not career:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career with id {req.career_id} not found."
            )

        # Check if active pathway already exists
        existing = self.pathway_repo.get_by_student_and_career(req.student_id, req.career_id)
        if existing:
            return existing

        templates = self._prepare_suggested_templates(
            self._build_milestone_templates(career.title, career.category, career.key_skills or []),
            career.category,
        )
        total_weeks = sum(t["duration_weeks"] for t in templates)
        total_months = max(3, round(total_weeks / 4))
        total_cost = sum(t["estimated_cost_inr"] for t in templates)

        pathway = Pathway(
            student_id=req.student_id,
            career_id=req.career_id,
            career_title=career.title,
            total_estimated_duration_months=total_months,
            total_estimated_cost_inr=total_cost,
            free_alternative_available=False,
            weekly_study_hours=req.weekly_study_hours,
            is_active=True
        )

        for t in templates:
            m = PathwayMilestone(
                stage=t["stage"],
                step_number=t["step_number"],
                title=t["title"],
                description=t["description"],
                duration_weeks=t["duration_weeks"],
                skills_to_acquire=t["skills_to_acquire"],
                recommended_certification=t["recommended_certification"],
                estimated_cost_inr=t["estimated_cost_inr"],
                free_alternative_resource=t["free_alternative_resource"],
                resource_url=t["resource_url"],
                status="not_started"
            )
            pathway.milestones.append(m)

        return self.pathway_repo.create(pathway)

    def get_pathway(self, pathway_id: int) -> Pathway:
        pathway = self.pathway_repo.get_by_id(pathway_id)
        if not pathway:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pathway with id {pathway_id} not found."
            )
        return pathway

    def update_milestone_status(self, milestone_id: int, new_status: str) -> PathwayMilestone:
        valid_statuses = ["not_started", "in_progress", "completed"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Status must be one of {valid_statuses}"
            )
        milestone = self.pathway_repo.get_milestone_by_id(milestone_id)
        if not milestone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Milestone with id {milestone_id} not found."
            )
        return self.pathway_repo.update_milestone_status(milestone, new_status)
