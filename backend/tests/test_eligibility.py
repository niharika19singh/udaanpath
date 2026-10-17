import json
from datetime import date, timedelta
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity
from app.models.profile import StudentProfile
from app.services.eligibility import EligibilityEngine

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
    assert data["status"] == "NEEDS_CONFIRMATION"
    assert data["match_score"] == 0.0
    assert len(data["passed_criteria"]) == 0
    assert len(data["failed_criteria"]) == 0
    assert len(data["unknown_criteria"]) > 0
    assert data["verification_date"] == "unknown"
    assert data["required_documents"] == []
    assert data["official_portal_url"] == "https://scholarships.gov.in"


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
    assert data["status"] == "NEEDS_CONFIRMATION"
    assert not any(f["criterion_name"] == "Gender Criteria" for f in data["failed_criteria"])
    assert any(c["criterion_name"] == "Record status" for c in data["unknown_criteria"])


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
    assert batch_data["eligible_count"] == 0
    assert batch_data["unknown_count"] >= 1
    assert len(batch_data["results"]) == batch_data["total_evaluated"]


def create_test_student(client: TestClient, email: str, state: str = "Uttar Pradesh", stream: str = "science_pcm") -> int:
    payload = {
        "full_name": "Eligibility Test Student",
        "email": email,
        "age": 19,
        "gender": "female",
        "category": "General",
        "state": state,
        "district": "Varanasi",
        "annual_family_income": 180000.0,
        "education_level": "12th_pass",
        "stream": stream,
        "percentage_marks": 80.0,
    }
    response = client.post("/api/v1/profiles/", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def curated_rules(**overrides):
    record = {
        "slug": "nsp-post-matric-scholarship",
        "status": "needs_review",
        "eligibility_confirmed": False,
        "deadline": (date.today() + timedelta(days=10)).isoformat(),
        "deadline_note": None,
        "other_criteria": [],
        "allowed_genders": ["all"],
        "allowed_categories": ["ALL"],
        "eligible_education_levels": ["all"],
        "eligible_streams": ["all"],
        "states": ["all"],
    }
    record.update(overrides)
    return record


def test_expired_deadline_is_ineligible(client: TestClient, db_session: Session, monkeypatch):
    seed_sample_opportunities(db_session)
    student_id = create_test_student(client, "expired.eligibility@example.com")
    student = db_session.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    opportunity = db_session.query(Opportunity).filter(Opportunity.slug == "nsp-post-matric-scholarship").first()
    monkeypatch.setattr(EligibilityEngine, "_get_curated_opportunity", lambda self, slug: curated_rules(
        status="expired", deadline=(date.today() - timedelta(days=1)).isoformat()))

    result = EligibilityEngine(db_session).evaluate(student, opportunity)

    assert result.status == "INELIGIBLE"
    assert any(item.criterion_name == "Application Deadline" and item.outcome == "unmet" for item in result.failed_criteria)


def test_state_and_stream_mismatches_are_unmet(client: TestClient, db_session: Session, monkeypatch):
    seed_sample_opportunities(db_session)
    student_id = create_test_student(client, "mismatch.eligibility@example.com", state="Rajasthan", stream="science_pcm")
    student = db_session.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    opportunity = db_session.query(Opportunity).filter(Opportunity.slug == "nsp-post-matric-scholarship").first()
    record = curated_rules(states=["Uttar Pradesh"], eligible_streams=["commerce"])
    monkeypatch.setattr(EligibilityEngine, "_get_curated_opportunity", lambda self, slug: record)
    monkeypatch.setattr(EligibilityEngine, "_is_record_trusted", lambda self, source: True)

    result = EligibilityEngine(db_session).evaluate(student, opportunity)

    assert result.status == "INELIGIBLE"
    assert any(item.criterion_name == "State / Domicile" and item.outcome == "unmet" for item in result.failed_criteria)
    assert any(item.criterion_name == "Stream" and item.outcome == "unmet" for item in result.failed_criteria)


def test_missing_profile_value_is_unknown(client: TestClient, db_session: Session, monkeypatch):
    seed_sample_opportunities(db_session)
    student_id = create_test_student(client, "missing.eligibility@example.com")
    student = db_session.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    student.state = None
    opportunity = db_session.query(Opportunity).filter(Opportunity.slug == "nsp-post-matric-scholarship").first()
    record = curated_rules(states=["Uttar Pradesh"])
    monkeypatch.setattr(EligibilityEngine, "_get_curated_opportunity", lambda self, slug: record)
    monkeypatch.setattr(EligibilityEngine, "_is_record_trusted", lambda self, source: True)

    result = EligibilityEngine(db_session).evaluate(student, opportunity)

    assert result.status == "NEEDS_CONFIRMATION"
    assert any(item.criterion_name == "State / Domicile" and item.outcome == "unknown" for item in result.unknown_criteria)


def test_human_confirmation_criterion_remains_unknown(client: TestClient, db_session: Session):
    seed_sample_opportunities(db_session)
    student_id = create_test_student(client, "human.eligibility@example.com")
    opportunity = db_session.query(Opportunity).filter(Opportunity.slug == "nsp-post-matric-scholarship").first()
    response = client.post("/api/v1/eligibility/check", json={"student_id": student_id, "opportunity_id": opportunity.id})

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NEEDS_CONFIRMATION"
    assert any(item["criterion_name"] == "Human confirmation" and item["outcome"] == "unknown" for item in data["unknown_criteria"])
