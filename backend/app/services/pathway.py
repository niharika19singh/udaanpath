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
        s1 = skills[0] if len(skills) > 0 else "Core Fundamentals"
        s2 = skills[1] if len(skills) > 1 else "Standard Tools"
        s3 = skills[2] if len(skills) > 2 else "Safety & Quality Protocols"
        s4 = skills[3] if len(skills) > 3 else "Project Delivery"

        # Domain specific customization
        if "solar" in career_title.lower():
            return [
                {
                    "stage": "foundational",
                    "step_number": 1,
                    "title": "Basics of DC Electrical Systems & Solar Irradiance",
                    "description": "Learn fundamentals of voltage, current, power calculations, and solar panel cell mechanics.",
                    "duration_weeks": 4,
                    "skills_to_acquire": [s1, "Ohm's Law", "Multimeter Diagnostics"],
                    "recommended_certification": "Skill India National Solar Mission Primer",
                    "estimated_cost_inr": 0.0,
                    "free_alternative_resource": "SWAYAM / NPTEL Solar Energy Basics & YouTube MNRE playlist",
                    "resource_url": "https://swayam.gov.in"
                },
                {
                    "stage": "intermediate",
                    "step_number": 2,
                    "title": "Inverter Wiring & Rooftop Mounting Standards",
                    "description": "Master grid-tied vs off-grid inverters, battery management systems, and safe mounting structures.",
                    "duration_weeks": 6,
                    "skills_to_acquire": [s2, "Earthing Installation", "Conduit Bending"],
                    "recommended_certification": "Skill Council for Green Jobs (SCGJ) Solar PV Installer Certificate",
                    "estimated_cost_inr": 1500.0,
                    "free_alternative_resource": "NISE (National Institute of Solar Energy) free reading materials & videos",
                    "resource_url": "https://nise.res.in"
                },
                {
                    "stage": "advanced",
                    "step_number": 3,
                    "title": "Grid Interconnection, Testing & Net Metering",
                    "description": "State DISCOM net-metering compliance, electrical safety audits, and commissioning checklists.",
                    "duration_weeks": 6,
                    "skills_to_acquire": [s3, "Net Metering Regulations", "Commissioning Reports"],
                    "recommended_certification": "State DISCOM Authorized Solar Technician Assessment",
                    "estimated_cost_inr": 2000.0,
                    "free_alternative_resource": "Bureau of Energy Efficiency (BEE) Free Handbooks",
                    "resource_url": "https://beeindia.gov.in"
                },
                {
                    "stage": "job_ready",
                    "step_number": 4,
                    "title": "Apprenticeship Placement & EPC Field Experience",
                    "description": "Hands-on installation projects, customer handover, and registration on PM Surya Ghar contractor portal.",
                    "duration_weeks": 8,
                    "skills_to_acquire": [s4, "Customer Handover", "Preventive Maintenance"],
                    "recommended_certification": "NAPS Certified Solar Apprentice Badge",
                    "estimated_cost_inr": 0.0,
                    "free_alternative_resource": "NAPS Apprenticeship Portal Registration & Stipend Program",
                    "resource_url": "https://www.apprenticeshipindia.gov.in"
                }
            ]
        elif "data" in career_title.lower() or category == "corporate_tech":
            return [
                {
                    "stage": "foundational",
                    "step_number": 1,
                    "title": "Data Literacy, Spreadsheets & SQL Fundamentals",
                    "description": "Master tabular data cleaning, advanced Excel formulas, pivot tables, and relational SQL queries.",
                    "duration_weeks": 5,
                    "skills_to_acquire": ["Advanced Excel", "SQL (SELECT, JOIN, GROUP BY)", "Data Cleaning"],
                    "recommended_certification": "Google Data Analytics Certificate (Coursera Financial Aid)",
                    "estimated_cost_inr": 0.0,
                    "free_alternative_resource": "freeCodeCamp Relational Database Curriculum & Khan Academy SQL",
                    "resource_url": "https://www.freecodecamp.org"
                },
                {
                    "stage": "intermediate",
                    "step_number": 2,
                    "title": "Business Intelligence & Interactive Dashboarding",
                    "description": "Design interactive KPI dashboards using Power BI or Tableau with executive metrics.",
                    "duration_weeks": 6,
                    "skills_to_acquire": ["Power BI", "Data Storytelling", "DAX Calculations"],
                    "recommended_certification": "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
                    "estimated_cost_inr": 3500.0,
                    "free_alternative_resource": "Microsoft Learn Power BI Free Path & YouTube 'Chandoo' Tutorials",
                    "resource_url": "https://learn.microsoft.com"
                },
                {
                    "stage": "advanced",
                    "step_number": 3,
                    "title": "Python for Data Analysis & Automation",
                    "description": "Automate data processing workflows using Pandas, NumPy, and Matplotlib/Seaborn.",
                    "duration_weeks": 6,
                    "skills_to_acquire": ["Python", "Pandas", "Automated Reporting"],
                    "recommended_certification": "NPTEL Python for Data Science Certificate",
                    "estimated_cost_inr": 1000.0,
                    "free_alternative_resource": "SWAYAM NPTEL Python Course (Free access to lectures & assignments)",
                    "resource_url": "https://swayam.gov.in"
                },
                {
                    "stage": "job_ready",
                    "step_number": 4,
                    "title": "Real-world Capstone Portfolio & Interview Prep",
                    "description": "Build and publish 3 end-to-end portfolio projects on GitHub with case studies and mock interviews.",
                    "duration_weeks": 6,
                    "skills_to_acquire": ["Portfolio Building", "Case Study Writing", "Technical Interview Prep"],
                    "recommended_certification": "GitHub Portfolio Review by Mentor",
                    "estimated_cost_inr": 0.0,
                    "free_alternative_resource": "Kaggle Community Datasets & LeetCode Free SQL 50",
                    "resource_url": "https://www.kaggle.com"
                }
            ]
        else:
            # Generic 4-stage progression for trades, government, or creative paths
            return [
                {
                    "stage": "foundational",
                    "step_number": 1,
                    "title": f"Core Foundations of {career_title}",
                    "description": f"Master initial principles, core vocabulary, and standard tools required for {career_title}.",
                    "duration_weeks": 4,
                    "skills_to_acquire": [s1, "Domain Concepts", "Basic Safety"],
                    "recommended_certification": "National Skill Development Corporation (NSDC) Level 3 Primer",
                    "estimated_cost_inr": 0.0,
                    "free_alternative_resource": "Skill India Digital Hub Free Micro-courses",
                    "resource_url": "https://www.skillindiadigital.gov.in"
                },
                {
                    "stage": "intermediate",
                    "step_number": 2,
                    "title": f"Applied Practice & Equipment Operation",
                    "description": f"Deep dive into standard operating procedures and industry workflows for {career_title}.",
                    "duration_weeks": 6,
                    "skills_to_acquire": [s2, "Standard Operating Procedures", "Troubleshooting"],
                    "recommended_certification": "Sector Skill Council Recognized Competency Certificate",
                    "estimated_cost_inr": 1500.0,
                    "free_alternative_resource": "Bharat Skills Free ITI E-Books & Question Banks",
                    "resource_url": "https://bharatskills.gov.in"
                },
                {
                    "stage": "advanced",
                    "step_number": 3,
                    "title": "Quality Assurance & Compliance Mastery",
                    "description": "Advanced problem solving, regulatory standards, and quality benchmark metrics.",
                    "duration_weeks": 6,
                    "skills_to_acquire": [s3, "Quality Inspection", "Compliance"],
                    "recommended_certification": "Advanced Trade Assessment Certificate",
                    "estimated_cost_inr": 2000.0,
                    "free_alternative_resource": "SWAYAM Free Vocational Studies Repository",
                    "resource_url": "https://swayam.gov.in"
                },
                {
                    "stage": "job_ready",
                    "step_number": 4,
                    "title": "Apprenticeship, Job Placement & Industry Induction",
                    "description": "Field training, employer interviews, and registration on national employment exchanges.",
                    "duration_weeks": 8,
                    "skills_to_acquire": [s4, "Interview Skills", "Workplace Readiness"],
                    "recommended_certification": "National Apprenticeship Certificate (NAC)",
                    "estimated_cost_inr": 0.0,
                    "free_alternative_resource": "National Career Service (NCS) Portal Placement Drives",
                    "resource_url": "https://www.ncs.gov.in"
                }
            ]

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

        templates = self._build_milestone_templates(career.title, career.category, career.key_skills or [])
        total_weeks = sum(t["duration_weeks"] for t in templates)
        total_months = max(3, round(total_weeks / 4))
        total_cost = sum(t["estimated_cost_inr"] for t in templates)

        pathway = Pathway(
            student_id=req.student_id,
            career_id=req.career_id,
            career_title=career.title,
            total_estimated_duration_months=total_months,
            total_estimated_cost_inr=total_cost,
            free_alternative_available=True,
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
