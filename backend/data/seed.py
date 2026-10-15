import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.logging import logger
from app.models.career import Career
from app.models.opportunity import Opportunity
from app.models.profile import StudentProfile
from app.models.progress import StudentDocument, SkillBadge, OpportunityApplication
from app.models.pathway import Pathway, PathwayMilestone
from app.services.pathway import PathwayService
from app.schemas.pathway import PathwayGenerateRequest


def seed_database():
    logger.info("Starting database seeding...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        data_dir = Path(__file__).parent

        # 1. Seed Careers
        careers_file = data_dir / "careers.json"
        if careers_file.exists():
            with open(careers_file, "r", encoding="utf-8") as f:
                careers_data = json.load(f)
            for c_data in careers_data:
                existing = db.query(Career).filter(Career.slug == c_data["slug"]).first()
                if not existing:
                    c_obj = Career(**c_data)
                    db.add(c_obj)
            db.commit()
            logger.info(f"Seeded {len(careers_data)} diverse career pathways.")

        # 2. Seed Opportunities
        opps_file = data_dir / "opportunities.json"
        if opps_file.exists():
            with open(opps_file, "r", encoding="utf-8") as f:
                opps_data = json.load(f)
            for o_data in opps_data:
                existing = db.query(Opportunity).filter(Opportunity.slug == o_data["slug"]).first()
                if not existing:
                    o_obj = Opportunity(**o_data)
                    db.add(o_obj)
            db.commit()
            logger.info(f"Seeded {len(opps_data)} verified Indian schemes and scholarships.")

        # 3. Seed Realistic Sample Profiles
        sample_students = [
            {
                "full_name": "Aarav Sharma",
                "email": "aarav.sharma@example.com",
                "phone": "+919876543210",
                "age": 19,
                "gender": "male",
                "category": "OBC",
                "state": "Uttar Pradesh",
                "district": "Varanasi",
                "location_tier": "tier_2",
                "annual_family_income": 180000.0,
                "financial_constraint": "high",
                "education_level": "12th_pass",
                "stream": "science_pcm",
                "percentage_marks": 78.5,
                "skills": ["Basic Python", "Electrical Wiring", "Problem Solving"],
                "interests": ["Solar Energy", "Electronics", "Green Tech"],
                "languages": ["Hindi", "English"],
                "career_aspirations": ["Solar PV Installation & Maintenance Technician"],
                "is_at_risk": True
            },
            {
                "full_name": "Pooja Patel",
                "email": "pooja.patel@example.com",
                "phone": "+919876543211",
                "age": 20,
                "gender": "female",
                "category": "General",
                "state": "Gujarat",
                "district": "Ahmedabad",
                "location_tier": "tier_1",
                "annual_family_income": 380000.0,
                "financial_constraint": "moderate",
                "education_level": "undergraduate",
                "stream": "commerce",
                "percentage_marks": 84.0,
                "skills": ["Excel", "Accounting Basics", "SQL"],
                "interests": ["Data Analysis", "Finance", "Business Strategy"],
                "languages": ["Gujarati", "Hindi", "English"],
                "career_aspirations": ["Junior Data Analyst & Business Intelligence Associate"],
                "is_at_risk": False
            },
            {
                "full_name": "Deepak Kumar",
                "email": "deepak.kumar@example.com",
                "phone": "+919876543212",
                "age": 18,
                "gender": "male",
                "category": "SC",
                "state": "Bihar",
                "district": "Gaya",
                "location_tier": "rural",
                "annual_family_income": 95000.0,
                "financial_constraint": "extreme",
                "education_level": "10th_pass",
                "stream": "general",
                "percentage_marks": 58.0,
                "skills": ["Mechanical Aptitude", "Hand Tools"],
                "interests": ["Manufacturing", "Industrial Machinery"],
                "languages": ["Hindi", "Magahi"],
                "career_aspirations": ["CNC Machine Operator & Precision Machinist"],
                "is_at_risk": True
            }
        ]

        for s_data in sample_students:
            existing_s = db.query(StudentProfile).filter(StudentProfile.email == s_data["email"]).first()
            if not existing_s:
                s_obj = StudentProfile(**s_data)
                db.add(s_obj)
        db.commit()
        logger.info(f"Seeded {len(sample_students)} diverse student profiles.")

        # 4. Seed Verified Documents & Roadmaps for Aarav
        aarav = db.query(StudentProfile).filter(StudentProfile.email == "aarav.sharma@example.com").first()
        solar_career = db.query(Career).filter(Career.slug == "solar-pv-installation-technician").first()
        nsp_opp = db.query(Opportunity).filter(Opportunity.slug == "nsp-post-matric-scholarship").first()

        if aarav and solar_career:
            # Generate roadmap
            pathway_svc = PathwayService(db)
            pathway_svc.generate_pathway(PathwayGenerateRequest(
                student_id=aarav.id,
                career_id=solar_career.id,
                weekly_study_hours=14
            ))

            # Add documents
            for doc_type in ["aadhaar", "income_certificate", "marksheet_10", "marksheet_12"]:
                if not db.query(StudentDocument).filter(StudentDocument.student_id == aarav.id, StudentDocument.document_type == doc_type).first():
                    db.add(StudentDocument(
                        student_id=aarav.id,
                        document_type=doc_type,
                        is_verified=True,
                        document_number_masked="XXXX-XXXX-8822"
                    ))

            # Add application
            if nsp_opp:
                if not db.query(OpportunityApplication).filter(OpportunityApplication.student_id == aarav.id, OpportunityApplication.opportunity_id == nsp_opp.id).first():
                    db.add(OpportunityApplication(
                        student_id=aarav.id,
                        opportunity_id=nsp_opp.id,
                        status="applied",
                        applied_date="2026-10-12",
                        application_reference="NSP-2026-UP-98442",
                        notes="Uploaded Tehsildar income certificate and bank passbook"
                    ))

            # Add badge
            if not db.query(SkillBadge).filter(SkillBadge.student_id == aarav.id, SkillBadge.badge_name == "Clean Energy Pioneer").first():
                db.add(SkillBadge(
                    student_id=aarav.id,
                    badge_name="Clean Energy Pioneer",
                    badge_category="domain",
                    description="Initiated specialized training on solar photovoltaic systems"
                ))

            db.commit()
            logger.info("Generated sample roadmap, documents, and application for Aarav Sharma.")

        logger.info("Database seeding completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
