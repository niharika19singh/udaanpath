import json
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.career import Career
from app.models.profile import StudentProfile

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
