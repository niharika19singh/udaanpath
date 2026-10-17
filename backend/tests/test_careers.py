import json
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.career import Career
from app.models.profile import StudentProfile
from app.services.recommendation import RecommendationService

def seed_sample_careers(db_session: Session):
    data_path = Path(__file__).parent.parent / "data" / "careers.json"
    with open(data_path, "r", encoding="utf-8") as f:
        careers_data = json.load(f)
    for c in careers_data:
        career_obj = Career(**c)
        db_session.add(career_obj)
    db_session.commit()


def test_list_and_filter_careers(client: TestClient, db_session: Session):
    seed_sample_careers(db_session)

    res = client.get("/api/v1/careers/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 8

    # Filter by category
    vocational_res = client.get("/api/v1/careers/?category=vocational_skilled_trades")
    assert vocational_res.status_code == 200
    vocational_data = vocational_res.json()
    assert len(vocational_data) >= 2
    for item in vocational_data:
        assert item["category"] == "vocational_skilled_trades"


def test_career_recommendation_engine(client: TestClient, db_session: Session):
    seed_sample_careers(db_session)

    # Create a student with Science PCM and interest in Solar Energy
    student_payload = {
        "full_name": "Rohan Verma",
        "email": "rohan.verma@example.com",
        "age": 18,
        "gender": "male",
        "category": "OBC",
        "state": "Bihar",
        "district": "Patna",
        "location_tier": "tier_3",
        "annual_family_income": 120000.0,
        "financial_constraint": "high",
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 74.0,
        "skills": ["Electrical Wiring", "Basic Physics", "Tools Handling"],
        "interests": ["Solar Energy", "Clean Power", "Electronics"],
        "languages": ["Hindi"],
        "career_aspirations": ["Solar PV Technician"]
    }
    p_res = client.post("/api/v1/profiles/", json=student_payload)
    assert p_res.status_code == 201
    student_id = p_res.json()["id"]

    rec_res = client.post("/api/v1/careers/recommend", json={"student_id": student_id, "limit": 4})
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["student_id"] == student_id
    assert len(rec_data["recommendations"]) > 0

    top_rec = rec_data["recommendations"][0]
    # Solar PV Technician should be top-ranked due to high alignment
    assert "Solar" in top_rec["title"] or top_rec["match_score"] >= 80.0
    assert len(top_rec["rationale"]) > 0
    assert top_rec["starting_salary_inr"] > 0
    assert 3 <= len(rec_data["recommendations"]) <= 5
    assert len({item["category"] for item in rec_data["recommendations"]}) >= 3
    assert all(item["rationale"].strip() for item in rec_data["recommendations"])
    assert any(item["alternative_pathways"] for item in rec_data["recommendations"])


def test_recommendations_exclude_stream_and_qualification_mismatches(client: TestClient, db_session: Session):
    seed_sample_careers(db_session)
    student_payload = {
        "full_name": "Commerce Student",
        "email": "commerce.recommendations@example.com",
        "age": 16,
        "gender": "female",
        "category": "General",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "annual_family_income": 180000.0,
        "education_level": "10th_pass",
        "stream": "commerce",
        "percentage_marks": 80.0,
    }
    student_id = client.post("/api/v1/profiles/", json=student_payload).json()["id"]

    response = client.post("/api/v1/careers/recommend", json={"student_id": student_id, "limit": 20})

    assert response.status_code == 200
    data = response.json()
    assert data["recommendations"] == []
    assert data["total_recommendations"] == 0


def test_recommendations_do_not_raise_low_scores_to_45(client: TestClient, db_session: Session):
    seed_sample_careers(db_session)
    student_payload = {
        "full_name": "Low Alignment Student",
        "email": "low.score.recommendations@example.com",
        "age": 18,
        "gender": "female",
        "category": "General",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "annual_family_income": 100000.0,
        "financial_constraint": "high",
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 70.0,
        "skills": [],
        "interests": [],
        "career_aspirations": [],
    }
    student_id = client.post("/api/v1/profiles/", json=student_payload).json()["id"]
    career = db_session.query(Career).filter(Career.slug == "solar-pv-installation-technician").first()
    career.financial_barrier = "high"
    career.key_skills = []
    career.typical_interests = []
    db_session.flush()

    student = db_session.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    score, rationale = RecommendationService(db_session)._score_career_for_student(student, career)

    assert score == 39.0
    assert rationale.strip()
