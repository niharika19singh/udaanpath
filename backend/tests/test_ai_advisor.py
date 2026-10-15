from fastapi.testclient import TestClient

def test_ai_narrative_advice_fallback(client: TestClient):
    student_payload = {
        "full_name": "Sanjay Rao",
        "email": "sanjay.ai@example.com",
        "age": 19,
        "gender": "male",
        "category": "OBC",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "annual_family_income": 110000.0,
        "financial_constraint": "extreme",
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 69.0,
        "skills": ["Electrical Circuits", "Basic Tools"],
        "interests": ["Renewable Energy"]
    }
    p_res = client.post("/api/v1/profiles/", json=student_payload)
    student_id = p_res.json()["id"]

    res = client.post("/api/v1/ai/advice", json={"student_id": student_id})
    assert res.status_code == 200
    data = res.json()
    assert data["student_id"] == student_id
    assert data["is_ai_generated"] is False
    assert data["provider"] == "rule_engine_fallback"
    assert "Sanjay" in data["narrative_advice"]
    assert len(data["key_takeaways"]) >= 3
    assert len(data["suggested_action_items"]) >= 2
