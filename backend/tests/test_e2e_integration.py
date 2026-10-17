"""
End-to-end integration test verifying the complete UdaanPath lifecycle.
"""
import json
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.models.career import Career
from app.models.opportunity import Opportunity


def seed_test_data(db_session: Session):
    data_dir = Path(__file__).parent.parent / "data"

    with open(data_dir / "careers.json", "r", encoding="utf-8") as f:
        careers_data = json.load(f)
    for c in careers_data:
        db_session.add(Career(**c))

    with open(data_dir / "opportunities.json", "r", encoding="utf-8") as f:
        opps_data = json.load(f)
    for o in opps_data:
        db_session.add(Opportunity(**o))

    db_session.commit()


def test_full_student_onboarding_and_pathway_lifecycle(client: TestClient, db_session: Session):
    seed_test_data(db_session)

    # 1. Onboard student
    profile_payload = {
        "full_name": "Priya Sharma",
        "email": "priya.sharma.e2e@example.com",
        "phone": "+919876543299",
        "age": 18,
        "gender": "female",
        "category": "EWS",
        "state": "Rajasthan",
        "district": "Jaipur",
        "location_tier": "tier_2",
        "annual_family_income": 150000.0,
        "financial_constraint": "high",
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 82.5,
        "skills": ["Physics", "Mathematics", "Problem Solving"],
        "interests": ["Clean Energy", "Technology", "Electronics"],
        "languages": ["Hindi", "English"],
        "career_aspirations": ["Renewable Energy Specialist", "Technician"]
    }

    create_res = client.post("/api/v1/profiles/", json=profile_payload)
    assert create_res.status_code == 201
    student = create_res.json()
    student_id = student["id"]
    assert student_id > 0
    assert student["full_name"] == "Priya Sharma"

    # 2. Get diverse career recommendations
    rec_res = client.post("/api/v1/careers/recommend", json={"student_id": student_id, "limit": 5})
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["total_recommendations"] > 0
    top_career = rec_data["recommendations"][0]
    career_id = top_career["career_id"]
    assert top_career["match_score"] > 50.0

    # 3. Generate 4-stage learning roadmap
    pathway_res = client.post(
        "/api/v1/pathways/generate",
        json={"student_id": student_id, "career_id": career_id, "weekly_study_hours": 15}
    )
    assert pathway_res.status_code == 201
    pathway_data = pathway_res.json()
    assert len(pathway_data["milestones"]) == 4
    first_milestone = pathway_data["milestones"][0]
    assert first_milestone["free_alternative_resource"] != ""

    # 4. Progress tracking: update milestone
    milestone_id = first_milestone["id"]
    patch_res = client.patch(
        f"/api/v1/pathways/milestones/{milestone_id}/status",
        json={"status": "completed"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

    # 5. Opportunity matching with deterministic eligibility
    match_res = client.post("/api/v1/opportunities/match", json={"student_id": student_id, "limit": 5})
    assert match_res.status_code == 200
    opp_data = match_res.json()
    assert opp_data["total_matches"] > 0
    matched_titles = [m["opportunity"]["title"] for m in opp_data["opportunities"]]
    assert any("Pragati" in t or "NSP" in t or "Scholarship" in t for t in matched_titles)

    # 6. AI Advisor Consultation
    advisor_res = client.post(
        "/api/v1/ai/advise",
        json={"student_id": student_id, "query": "What free certifications can help me prepare for solar energy?"}
    )
    assert advisor_res.status_code == 200
    advice = advisor_res.json()
    assert advice["narrative_advice"] != ""
    assert len(advice["suggested_action_items"]) > 0

    # 7. Facilitator Caseload Triage
    dashboard_res = client.get("/api/v1/facilitator/dashboard")
    assert dashboard_res.status_code == 200
    dash_data = dashboard_res.json()
    assert dash_data["total_students_monitored"] > 0
