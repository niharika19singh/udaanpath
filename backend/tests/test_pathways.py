import json
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.career import Career

def setup_test_data(client: TestClient, db_session: Session):
    data_path = Path(__file__).parent.parent / "data" / "careers.json"
    with open(data_path, "r", encoding="utf-8") as f:
        careers_data = json.load(f)
    for c in careers_data:
        db_session.add(Career(**c))
    db_session.commit()

    student_payload = {
        "full_name": "Pooja Patel",
        "email": "pooja.patel@example.com",
        "age": 20,
        "gender": "female",
        "category": "General",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "location_tier": "tier_1",
        "annual_family_income": 350000.0,
        "financial_constraint": "moderate",
        "education_level": "undergraduate",
        "stream": "commerce",
        "percentage_marks": 82.0,
        "skills": ["Excel", "Accounting Basics"],
        "interests": ["Data Analysis", "Finance"],
        "languages": ["Gujarati", "Hindi", "English"],
        "career_aspirations": ["Junior Data Analyst"]
    }
    res = client.post("/api/v1/profiles/", json=student_payload)
    student_id = res.json()["id"]

    career = db_session.query(Career).filter(Career.slug == "junior-data-analyst").first()
    return student_id, career.id


def test_generate_and_get_pathway(client: TestClient, db_session: Session):
    student_id, career_id = setup_test_data(client, db_session)

    gen_payload = {
        "student_id": student_id,
        "career_id": career_id,
        "weekly_study_hours": 15
    }
    response = client.post("/api/v1/pathways/generate", json=gen_payload)
    assert response.status_code == 201
    data = response.json()

    assert data["student_id"] == student_id
    assert data["career_id"] == career_id
    assert data["free_alternative_available"] is False
    assert data["total_estimated_cost_is_unknown"] is True
    assert len(data["milestones"]) == 4  # 4-stage progression
    resource_path = Path(__file__).parent.parent / "data" / "kb" / "learning_resources.json"
    with open(resource_path, "r", encoding="utf-8") as resource_file:
        resource_urls = {item["url"] for item in json.load(resource_file)}
    assert all(item["title"].startswith("Suggested learning activity") for item in data["milestones"])
    assert all("Suggestion only" in item["description"] for item in data["milestones"])
    assert all(item["recommended_certification"] is None for item in data["milestones"])
    assert all(item["estimated_cost_inr"] == 0.0 and item["estimated_cost_is_unknown"] for item in data["milestones"])
    assert all(item["duration_is_suggestion"] for item in data["milestones"])
    assert all(item["resource_url"] in resource_urls for item in data["milestones"])
    assert all("cost unknown" in item["free_alternative_resource"] for item in data["milestones"])

    stages = [m["stage"] for m in data["milestones"]]
    assert stages == ["foundational", "intermediate", "advanced", "job_ready"]

    # Verify milestone details
    first_milestone = data["milestones"][0]
    assert first_milestone["duration_weeks"] > 0
    assert len(first_milestone["free_alternative_resource"]) > 0
    assert first_milestone["resource_url"].startswith("http")

    # Verify fetching by ID
    pathway_id = data["id"]
    get_res = client.get(f"/api/v1/pathways/{pathway_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == pathway_id


def test_update_milestone_status(client: TestClient, db_session: Session):
    student_id, career_id = setup_test_data(client, db_session)

    gen_payload = {"student_id": student_id, "career_id": career_id}
    res = client.post("/api/v1/pathways/generate", json=gen_payload)
    milestone_id = res.json()["milestones"][0]["id"]

    # Update to in_progress
    up_res = client.put(f"/api/v1/pathways/milestones/{milestone_id}/status", json={"status": "in_progress"})
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "in_progress"

    # Update to completed
    up_res2 = client.put(f"/api/v1/pathways/milestones/{milestone_id}/status", json={"status": "completed"})
    assert up_res2.status_code == 200
    assert up_res2.json()["status"] == "completed"
