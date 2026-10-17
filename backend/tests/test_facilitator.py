import json
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity

def setup_facilitator_data(client: TestClient, db_session: Session):
    data_path = Path(__file__).parent.parent / "data" / "opportunities.json"
    with open(data_path, "r", encoding="utf-8") as f:
        opps_data = json.load(f)
    opp = Opportunity(**opps_data[0])
    db_session.add(opp)
    db_session.commit()

    student_payload = {
        "full_name": "Deepak Kumar",
        "email": "deepak.counselor@example.com",
        "age": 18,
        "gender": "male",
        "category": "SC",
        "state": "Bihar",
        "district": "Gaya",
        "location_tier": "rural",
        "annual_family_income": 90000.0,
        "financial_constraint": "extreme",
        "education_level": "10th_pass",
        "stream": "general",
        "percentage_marks": 58.0
    }
    p_res = client.post("/api/v1/profiles/", json=student_payload)
    return p_res.json()["id"], opp.id


def test_facilitator_dashboard_and_vulnerability_scoring(client: TestClient, db_session: Session):
    student_id, opp_id = setup_facilitator_data(client, db_session)

    dash_res = client.get("/api/v1/facilitator/dashboard")
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert data["total_students_monitored"] >= 1
    assert data["at_risk_students_count"] >= 1
    assert len(data["top_priority_students"]) >= 1

    # Deepak has extreme financial constraint + low marks, vulnerability score should be high (>= 60)
    top_student = data["top_priority_students"][0]
    assert top_student["vulnerability_score"] >= 60.0
    assert top_student["is_at_risk"] is True


def test_log_intervention_and_assign_opportunity(client: TestClient, db_session: Session):
    student_id, opp_id = setup_facilitator_data(client, db_session)

    # Log counselor intervention
    int_payload = {
        "student_id": student_id,
        "counselor_name": "Sunita Rao (NGO Counselor)",
        "category": "financial_aid",
        "notes": "Connected student to local CSC center for free digital Aadhaar and income certificate verification.",
        "follow_up_date": "2026-10-28"
    }
    int_res = client.post("/api/v1/facilitator/interventions", json=int_payload)
    assert int_res.status_code == 201
    int_data = int_res.json()
    assert int_data["student_id"] == student_id
    assert int_data["counselor_name"] == int_payload["counselor_name"]

    # Verify retrieval of interventions
    get_res = client.get(f"/api/v1/facilitator/interventions/{student_id}")
    assert get_res.status_code == 200
    assert len(get_res.json()) >= 1

    # Assign opportunity to student
    assign_payload = {
        "student_id": student_id,
        "opportunity_id": opp_id,
        "assigned_by": "Sunita Rao",
        "priority": "high",
        "assigned_notes": "Urgent scholarship deadline next month"
    }
    assign_res = client.post("/api/v1/facilitator/assign-opportunity", json=assign_payload)
    assert assign_res.status_code == 201
    assign_data = assign_res.json()
    assert assign_data["student_id"] == student_id
    assert assign_data["opportunity_id"] == opp_id
    assert assign_data["priority"] == "high"
