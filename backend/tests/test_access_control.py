import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core import security
from app.core.config import Settings, DEV_SECRET_KEY
from app.core.security import create_facilitator_token, hash_password, verify_password
from app.models.career import Career
from app.models.facilitator import FacilitatorAccount
from app.models.opportunity import Opportunity

DATA = Path(__file__).parent.parent / "data"


def _seed(db_session, filename: str, model) -> None:
    for row in json.loads((DATA / filename).read_text(encoding="utf-8")):
        db_session.add(model(**row))
    db_session.commit()


def _profile(email: str) -> dict:
    return {
        "full_name": "Access Test",
        "email": email,
        "age": 18,
        "gender": "female",
        "category": "General",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "annual_family_income": 200000.0,
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 80.0,
        "skills": ["Basic Computers"],
        "interests": ["Technology"],
    }


def _student(anon_client: TestClient, email: str):
    res = anon_client.post("/api/v1/profiles/", json=_profile(email))
    assert res.status_code == 201
    data = res.json()
    return data["id"], {"Authorization": f"Bearer {data['access_key']}"}


def test_create_returns_key_once_and_never_the_hash(anon_client: TestClient):
    res = anon_client.post("/api/v1/profiles/", json=_profile("key.once@example.com"))
    data = res.json()
    assert len(data["access_key"]) >= 32
    assert "access_key_hash" not in data
    got = anon_client.get(f"/api/v1/profiles/{data['id']}", headers={"Authorization": f"Bearer {data['access_key']}"})
    assert got.status_code == 200
    assert "access_key" not in got.json() and "access_key_hash" not in got.json()


def test_student_can_use_only_their_own_key(anon_client: TestClient):
    a_id, a_auth = _student(anon_client, "student.a@example.com")
    b_id, _ = _student(anon_client, "student.b@example.com")

    assert anon_client.get(f"/api/v1/profiles/{a_id}").status_code == 401
    assert anon_client.get(f"/api/v1/profiles/{a_id}", headers={"Authorization": "Bearer wrong-key"}).status_code == 403
    assert anon_client.get(f"/api/v1/profiles/{b_id}", headers=a_auth).status_code == 403
    # A missing id looks the same as someone else's: no existence oracle.
    assert anon_client.get("/api/v1/profiles/999999", headers=a_auth).status_code == 403
    assert anon_client.put(f"/api/v1/profiles/{b_id}", json={"district": "X"}, headers=a_auth).status_code == 403
    assert anon_client.put(f"/api/v1/profiles/{a_id}", json={"district": "Prayagraj"}, headers=a_auth).status_code == 200


def test_student_journey_works_with_key_and_is_scoped(anon_client: TestClient, db_session):
    _seed(db_session, "careers.json", Career)
    a_id, a_auth = _student(anon_client, "journey.a@example.com")
    b_id, b_auth = _student(anon_client, "journey.b@example.com")

    recs = anon_client.post("/api/v1/careers/recommend", json={"student_id": a_id, "limit": 3}, headers=a_auth)
    assert recs.status_code == 200
    assert anon_client.post("/api/v1/careers/recommend", json={"student_id": b_id}, headers=a_auth).status_code == 403
    assert anon_client.post("/api/v1/opportunities/match", json={"student_id": a_id}, headers=a_auth).status_code == 200
    assert anon_client.post("/api/v1/opportunities/match", json={"student_id": b_id}, headers=a_auth).status_code == 403
    assert anon_client.post("/api/v1/ai/advise", json={"student_id": a_id, "query": "jobs"}, headers=a_auth).status_code == 200
    assert anon_client.post("/api/v1/ai/advise", json={"student_id": b_id, "query": "jobs"}, headers=a_auth).status_code == 403

    career_id = recs.json()["recommendations"][0]["career_id"]
    pathway = anon_client.post("/api/v1/pathways/generate", json={"student_id": a_id, "career_id": career_id}, headers=a_auth)
    assert pathway.status_code == 201
    pathway_id = pathway.json()["id"]
    milestone_id = pathway.json()["milestones"][0]["id"]

    # Owner can read and update; another student cannot, even by guessing ids.
    assert anon_client.get(f"/api/v1/pathways/{pathway_id}", headers=a_auth).status_code == 200
    assert anon_client.get(f"/api/v1/pathways/{pathway_id}", headers=b_auth).status_code == 403
    done = {"status": "completed"}
    assert anon_client.patch(f"/api/v1/pathways/milestones/{milestone_id}/status", json=done, headers=b_auth).status_code == 403
    assert anon_client.patch(f"/api/v1/pathways/milestones/{milestone_id}/status", json=done, headers=a_auth).status_code == 200
    assert anon_client.post("/api/v1/ai/enrich-roadmap", json={"pathway_id": pathway_id}, headers=b_auth).status_code == 403


def test_application_access_follows_its_owner(anon_client: TestClient, db_session):
    _seed(db_session, "opportunities.json", Opportunity)
    a_id, a_auth = _student(anon_client, "apps.a@example.com")
    _, b_auth = _student(anon_client, "apps.b@example.com")
    opportunity_id = anon_client.get("/api/v1/opportunities/").json()[0]["id"]

    created = anon_client.post("/api/v1/progress/applications", json={"student_id": a_id, "opportunity_id": opportunity_id}, headers=a_auth)
    assert created.status_code == 201
    app_id = created.json()["id"]
    assert anon_client.put(f"/api/v1/progress/applications/{app_id}", json={"status": "applied"}, headers=b_auth).status_code == 403
    assert anon_client.get(f"/api/v1/progress/student/{a_id}", headers=b_auth).status_code == 403
    assert anon_client.get(f"/api/v1/progress/student/{a_id}", headers=a_auth).status_code == 200


def test_listing_students_needs_a_facilitator(anon_client: TestClient, facilitator_token: str):
    _, a_auth = _student(anon_client, "list.a@example.com")
    for path in ("/api/v1/profiles/", "/api/v1/facilitator/students", "/api/v1/facilitator/dashboard"):
        assert anon_client.get(path).status_code == 401
        assert anon_client.get(path, headers=a_auth).status_code == 403
        assert anon_client.get(path, headers={"Authorization": f"Bearer {facilitator_token}"}).status_code == 200


def test_public_catalogues_stay_open(anon_client: TestClient):
    assert anon_client.get("/api/v1/careers/").status_code == 200
    assert anon_client.get("/api/v1/opportunities/").status_code == 200
    assert anon_client.get("/api/v1/health").status_code == 200


def test_facilitator_login(anon_client: TestClient, db_session):
    db_session.add(FacilitatorAccount(
        email="login.check@example.org", full_name="Login Check",
        password_hash=hash_password("correct horse battery"),
    ))
    db_session.commit()

    bad = anon_client.post("/api/v1/facilitator/login", json={"email": "login.check@example.org", "password": "nope"})
    assert bad.status_code == 401
    unknown = anon_client.post("/api/v1/facilitator/login", json={"email": "nobody@example.org", "password": "nope"})
    assert unknown.status_code == 401

    ok = anon_client.post("/api/v1/facilitator/login", json={"email": "LOGIN.check@example.org", "password": "correct horse battery"})
    assert ok.status_code == 200
    token = ok.json()["access_token"]
    assert anon_client.get("/api/v1/facilitator/dashboard", headers={"Authorization": f"Bearer {token}"}).status_code == 200

    # A tampered token is rejected.
    assert anon_client.get("/api/v1/facilitator/dashboard", headers={"Authorization": f"Bearer {token[:-2]}xx"}).status_code == 401


def test_expired_and_deactivated_facilitators_are_refused(anon_client: TestClient, db_session, monkeypatch):
    account = FacilitatorAccount(email="expiry@example.org", full_name="Expiry", password_hash=hash_password("x" * 12))
    db_session.add(account)
    db_session.commit()

    monkeypatch.setattr(security.settings, "FACILITATOR_TOKEN_TTL_MINUTES", -1)
    expired, _ = create_facilitator_token(account.id)
    assert anon_client.get("/api/v1/facilitator/dashboard", headers={"Authorization": f"Bearer {expired}"}).status_code == 401

    monkeypatch.setattr(security.settings, "FACILITATOR_TOKEN_TTL_MINUTES", 60)
    token, _ = create_facilitator_token(account.id)
    account.is_active = False
    db_session.commit()
    assert anon_client.get("/api/v1/facilitator/dashboard", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_password_hashing_round_trip():
    stored = hash_password("a long enough password")
    assert stored.startswith("scrypt$") and "a long enough password" not in stored
    assert verify_password("a long enough password", stored)
    assert not verify_password("wrong", stored)
    assert not verify_password("anything", "not-a-hash")


def test_production_refuses_demo_secret_and_open_cors():
    with pytest.raises(ValidationError) as err:
        Settings(APP_ENV="production", SECRET_KEY=DEV_SECRET_KEY, CORS_ORIGINS=["*"], _env_file=None)
    message = str(err.value)
    assert "SECRET_KEY" in message and "CORS_ORIGINS" in message
    assert DEV_SECRET_KEY not in message  # never echo the secret

    with pytest.raises(ValidationError):
        Settings(APP_ENV="production", SECRET_KEY="s" * 40, CORS_ORIGINS=["http://localhost:5173"], _env_file=None)

    ok = Settings(APP_ENV="production", SECRET_KEY="s" * 40, CORS_ORIGINS=["https://udaanpath-web.example"], _env_file=None)
    assert ok.CORS_ORIGINS == ["https://udaanpath-web.example"]
    # Development keeps working with the defaults.
    assert Settings(APP_ENV="development", _env_file=None).SECRET_KEY == DEV_SECRET_KEY
