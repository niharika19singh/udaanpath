from fastapi.testclient import TestClient

def sample_profile_payload():
    return {
        "full_name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "phone": "+919876543210",
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
        "skills": ["Basic Python", "Electrical Wiring", "Problem Solving"],
        "interests": ["Solar Energy", "Electronics", "Green Tech"],
        "languages": ["Hindi", "English"],
        "career_aspirations": ["Renewable Energy Technician"]
    }


def test_create_and_get_profile(client: TestClient):
    payload = sample_profile_payload()
    response = client.post("/api/v1/profiles/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == payload["full_name"]
    assert data["email"] == payload["email"]
    assert data["id"] is not None
    assert data["is_at_risk"] is True  # Automatically marked due to high financial constraint

    profile_id = data["id"]
    get_res = client.get(f"/api/v1/profiles/{profile_id}")
    assert get_res.status_code == 200
    assert get_res.json()["email"] == payload["email"]


def test_duplicate_email_rejected(client: TestClient):
    payload = sample_profile_payload()
    payload["email"] = "unique.aarav@example.com"
    res1 = client.post("/api/v1/profiles/", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/profiles/", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_update_profile(client: TestClient):
    payload = sample_profile_payload()
    payload["email"] = "update.test@example.com"
    create_res = client.post("/api/v1/profiles/", json=payload)
    profile_id = create_res.json()["id"]

    update_payload = {
        "percentage_marks": 85.0,
        "skills": ["Basic Python", "Electrical Wiring", "AutoCAD Electrical"]
    }
    update_res = client.put(f"/api/v1/profiles/{profile_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["percentage_marks"] == 85.0
    assert "AutoCAD Electrical" in updated_data["skills"]


def test_list_profiles(client: TestClient):
    res = client.get("/api/v1/profiles/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
