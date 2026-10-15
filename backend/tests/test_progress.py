import json
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity
from app.models.career import Career

def setup_student_and_opportunity(client: TestClient, db_session: Session):
    data_path = Path(__file__).parent.parent / "data" / "opportunities.json"
    with open(data_path, "r", encoding="utf-8") as f:
        opps_data = json.load(f)
    opp = Opportunity(**opps_data[0])
    db_session.add(opp)
    db_session.commit()

    student_payload = {
        "full_name": "Karan Kapoor",
        "email": "karan.progress@example.com",
        "age": 21,
        "gender": "male",
        "category": "SC",
        "state": "Punjab",
        "district": "Ludhiana",
        "annual_family_income": 140000.0,
        "financial_constraint": "high",
        "education_level": "12th_pass",
        "stream": "vocational",
        "percentage_marks": 72.0
    }
    p_res = client.post("/api/v1/profiles/", json=student_payload)
    return p_res.json()["id"], opp.id


def test_progress_tracking_and_document_readiness(client: TestClient, db_session: Session):
    student_id, opp_id = setup_student_and_opportunity(client, db_session)

    # Initially, document readiness is 0%
    overview_res = client.get(f"/api/v1/progress/student/{student_id}")
    assert overview_res.status_code == 200
    data = overview_res.json()
    assert data["student_id"] == student_id
    assert data["document_readiness_score"] == 0.0

    # Add verified documents: Aadhaar, Income Certificate, 10th marksheet, 12th marksheet
    for doc in ["aadhaar", "income_certificate", "marksheet_10", "marksheet_12"]:
        d_res = client.post("/api/v1/progress/documents", json={
            "student_id": student_id,
            "document_type": doc,
            "is_verified": True,
            "document_number_masked": "XXXX-XXXX-1234"
        })
        assert d_res.status_code == 201

    # Check updated readiness (4 out of 5 core docs = 80%)
    overview_res2 = client.get(f"/api/v1/progress/student/{student_id}")
    assert overview_res2.status_code == 200
    data2 = overview_res2.json()
    assert data2["document_readiness_score"] == 80.0
    assert any(b["badge_name"] == "Document Ready" for b in data2["earned_badges"])


def test_opportunity_application_lifecycle(client: TestClient, db_session: Session):
    student_id, opp_id = setup_student_and_opportunity(client, db_session)

    # Apply for opportunity
    app_payload = {
        "student_id": student_id,
        "opportunity_id": opp_id,
        "status": "applied",
        "applied_date": "2026-10-15",
        "application_reference": "NSP-2026-998811",
        "notes": "Submitted application with Tehsildar income certificate"
    }
    create_res = client.post("/api/v1/progress/applications", json=app_payload)
    assert create_res.status_code == 201
    app_data = create_res.json()
    assert app_data["status"] == "applied"
    app_id = app_data["id"]

    # Update to shortlisted
    up_res = client.put(f"/api/v1/progress/applications/{app_id}", json={
        "status": "shortlisted",
        "notes": "Verified by District Welfare Officer"
    })
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "shortlisted"

    # Verify overview shows application
    overview_res = client.get(f"/api/v1/progress/student/{student_id}")
    assert overview_res.status_code == 200
    assert len(overview_res.json()["applications"]) >= 1
