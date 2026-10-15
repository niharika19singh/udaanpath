import json
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity

def seed_sample_opportunities(db_session: Session):
    data_path = Path(__file__).parent.parent / "data" / "opportunities.json"
    with open(data_path, "r", encoding="utf-8") as f:
        opps_data = json.load(f)
    for o in opps_data:
        db_session.add(Opportunity(**o))
    db_session.commit()


def test_deterministic_eligibility_positive(client: TestClient, db_session: Session):
    seed_sample_opportunities(db_session)

    # Aarav Sharma: Male, OBC, 19 yrs old, Income ₹1,80,000, 78.5% marks, 12th pass
    aarav_payload = {
        "full_name": "Aarav Sharma",
        "email": "aarav.eligibility@example.com",
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
        "skills": ["Physics", "Mathematics"],
        "interests": ["Engineering"],
        "languages": ["Hindi", "English"],
        "career_aspirations": ["Technician"]
    }
    p_res = client.post("/api/v1/profiles/", json=aarav_payload)
    student_id = p_res.json()["id"]

    nsp_opp = db_session.query(Opportunity).filter(Opportunity.slug == "nsp-post-matric-scholarship").first()

    check_res = client.post("/api/v1/eligibility/check", json={
        "student_id": student_id,
        "opportunity_id": nsp_opp.id
    })
    assert check_res.status_code == 200
    data = check_res.json()
    assert data["status"] == "ELIGIBLE"
    assert data["match_score"] == 100.0
    assert len(data["passed_criteria"]) >= 4
    assert len(data["failed_criteria"]) == 0
    assert len(data["required_documents"]) > 0
    assert data["official_portal_url"] == "https://scholarships.gov.in"
    assert data["verification_date"] == "2026-03-15"


def test_deterministic_eligibility_gender_failure(client: TestClient, db_session: Session):
    seed_sample_opportunities(db_session)

    # Aarav is Male, AICTE Pragati is Female only
    aarav_payload = {
        "full_name": "Aarav Gender Test",
        "email": "aarav.gender@example.com",
        "age": 19,
        "gender": "male",
        "category": "OBC",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "annual_family_income": 180000.0,
        "education_level": "undergraduate",
        "stream": "science_pcm",
        "percentage_marks": 78.5
    }
    p_res = client.post("/api/v1/profiles/", json=aarav_payload)
    student_id = p_res.json()["id"]

    pragati_opp = db_session.query(Opportunity).filter(Opportunity.slug == "aicte-pragati-scholarship-girls").first()

    check_res = client.post("/api/v1/eligibility/check", json={
        "student_id": student_id,
        "opportunity_id": pragati_opp.id
    })
    assert check_res.status_code == 200
    data = check_res.json()
    assert data["status"] == "INELIGIBLE"
    assert any(f["criterion_name"] == "Gender Criteria" for f in data["failed_criteria"])


def test_batch_eligibility_check(client: TestClient, db_session: Session):
    seed_sample_opportunities(db_session)

    student_payload = {
        "full_name": "Batch Test Student",
        "email": "batch.test@example.com",
        "age": 20,
        "gender": "female",
        "category": "General",
        "state": "Delhi",
        "district": "Central Delhi",
        "annual_family_income": 400000.0,
        "education_level": "undergraduate",
        "stream": "commerce",
        "percentage_marks": 85.0
    }
    p_res = client.post("/api/v1/profiles/", json=student_payload)
    student_id = p_res.json()["id"]

    batch_res = client.post("/api/v1/eligibility/batch-check", json={"student_id": student_id})
    assert batch_res.status_code == 200
    batch_data = batch_res.json()
    assert batch_data["total_evaluated"] >= 7
    assert batch_data["eligible_count"] >= 1
    assert len(batch_data["results"]) == batch_data["total_evaluated"]
