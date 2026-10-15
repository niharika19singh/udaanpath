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


def test_list_and_search_opportunities(client: TestClient, db_session: Session):
    seed_sample_opportunities(db_session)

    res = client.get("/api/v1/opportunities/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 7

    # Filter by type scholarship
    sch_res = client.get("/api/v1/opportunities/?type=scholarship")
    assert sch_res.status_code == 200
    sch_data = sch_res.json()
    assert len(sch_data) >= 3
    for s in sch_data:
        assert s["type"] == "scholarship"
        assert s["official_portal_url"].startswith("http")
        assert len(s["verification_date"]) > 0

    # Search for Citi
    citi_res = client.get("/api/v1/opportunities/?search=Citi")
    assert citi_res.status_code == 200
    citi_data = citi_res.json()
    assert len(citi_data) >= 1
    assert "Citi" in citi_data[0]["title"] or "Citi" in citi_data[0]["provider"]


def test_match_opportunities_for_student(client: TestClient, db_session: Session):
    seed_sample_opportunities(db_session)

    student_payload = {
        "full_name": "Meera Joshi",
        "email": "meera.joshi@example.com",
        "age": 19,
        "gender": "female",
        "category": "OBC",
        "state": "Maharashtra",
        "district": "Pune",
        "location_tier": "tier_2",
        "annual_family_income": 200000.0,
        "financial_constraint": "high",
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 82.0,
        "skills": ["Physics", "Mathematics"],
        "interests": ["Engineering"],
        "languages": ["Marathi", "Hindi"],
        "career_aspirations": ["Engineer"]
    }
    p_res = client.post("/api/v1/profiles/", json=student_payload)
    student_id = p_res.json()["id"]

    match_res = client.post("/api/v1/opportunities/match", json={"student_id": student_id, "limit": 10})
    assert match_res.status_code == 200
    match_data = match_res.json()
    assert match_data["total_matches"] > 0
    assert any(m["eligibility_status"] == "ELIGIBLE" for m in match_data["opportunities"])
