from fastapi.testclient import TestClient
from app.core.config import settings
from app.services.ai_advisor import AIAdvisorService

def test_ai_narrative_advice_fallback(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_LLM", False)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
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
    assert "Sanjay" not in data["narrative_advice"]
    assert "unknown" in data["narrative_advice"]
    assert any("https://" in item for item in data["suggested_action_items"])
    assert len(data["key_takeaways"]) >= 2
    assert len(data["suggested_action_items"]) >= 2


def test_llm_prompt_contains_only_computed_results(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_LLM", True)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "unit-test-key")
    captured = {}
    monkeypatch.setattr(
        AIAdvisorService,
        "_build_rule_engine_context",
        lambda self, student: {
            "careers": [{"title": "Example career", "score": 70.0, "reason": "Computed match"}],
            "opportunities": [{"title": "Example opportunity", "status": "NEEDS_CONFIRMATION", "source_url": "https://example.gov.in"}],
        },
    )

    def mock_llm(self, prompt):
        captured["prompt"] = prompt
        return "The computed results show an unknown eligibility outcome."

    monkeypatch.setattr(AIAdvisorService, "_call_gemini_api", mock_llm)
    payload = {
        "full_name": "Private Student Name",
        "email": "private.student@example.com",
        "phone": "+919999999999",
        "age": 19,
        "gender": "male",
        "category": "OBC",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "annual_family_income": 110000.0,
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 69.0,
    }
    student_id = client.post("/api/v1/profiles/", json=payload).json()["id"]
    response = client.post("/api/v1/ai/advise", json={
        "student_id": student_id,
        "query": "My private question should not leave this service",
    })

    assert response.status_code == 200
    data = response.json()
    assert data["is_ai_generated"] is True
    assert data["key_takeaways"] == []
    assert data["suggested_action_items"] == []
    assert "Example career" in captured["prompt"]
    assert "Example opportunity" in captured["prompt"]
    for private_value in ("Private Student Name", "private.student@example.com", "+919999999999", "110000", "My private question"):
        assert private_value not in captured["prompt"]


def test_gemini_api_key_is_sent_in_header(monkeypatch, db_session):
    monkeypatch.setattr(settings, "ENABLE_LLM", True)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "unit-test-key")
    captured = {}

    class FakeResponse:
        status_code = 200

        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": "ok"}]}}]}

    class FakeClient:
        def __init__(self, timeout):
            self.timeout = timeout

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def post(self, url, headers, json):
            captured["url"] = url
            captured["headers"] = headers
            return FakeResponse()

    monkeypatch.setattr("app.services.ai_advisor.httpx.Client", FakeClient)
    result = AIAdvisorService(db_session)._call_gemini_api("safe prompt")

    assert result == "ok"
    assert "key=" not in captured["url"]
    assert captured["headers"]["x-goog-api-key"] == "unit-test-key"


def test_llm_is_skipped_when_no_verified_records_exist(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "ENABLE_LLM", True)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "unit-test-key")

    def unexpected_llm_call(self, prompt):
        raise AssertionError("LLM must not receive unverified records")

    monkeypatch.setattr(AIAdvisorService, "_call_gemini_api", unexpected_llm_call)
    payload = {
        "full_name": "Review Only Student",
        "email": "review.only@example.com",
        "age": 19,
        "gender": "female",
        "category": "General",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "annual_family_income": 180000.0,
        "education_level": "12th_pass",
        "stream": "science_pcm",
        "percentage_marks": 80.0,
    }
    student_id = client.post("/api/v1/profiles/", json=payload).json()["id"]

    response = client.post("/api/v1/ai/advise", json={"student_id": student_id})

    assert response.status_code == 200
    assert response.json()["is_ai_generated"] is False
