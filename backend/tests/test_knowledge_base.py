import json
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest
from pydantic import ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from app.schemas.knowledge_base import Opportunity, Status  # noqa: E402
import validate_data  # noqa: E402
import upgrade_legacy_data as upgrade  # noqa: E402


def base(**over):
    rec = {
        "slug": "test-scheme", "title": "Test Scheme", "category": "scholarship",
        "provider": "Test Ministry", "description": "A test scheme.",
        "official_url": "https://example.gov.in", "status": "needs_review",
    }
    rec.update(over)
    return rec


def verified(**over):
    defaults = dict(
        status="verified", source_url="https://example.gov.in/scheme",
        last_verified_on=(date.today() - timedelta(days=5)).isoformat(),
        verified_by="Anupriya", eligibility_confirmed=True,
        target_group="Girl students", deadline_note="Rolling")
    defaults.update(over)
    return base(**defaults)


def test_valid_needs_review_record():
    assert Opportunity.model_validate(base()).status == Status.needs_review


def test_valid_verified_record():
    assert Opportunity.model_validate(verified()).effective_status() == Status.verified


@pytest.mark.parametrize("missing", ["source_url", "last_verified_on", "verified_by"])
def test_verified_requires_evidence(missing):
    rec = verified()
    rec.pop(missing)
    with pytest.raises(ValidationError):
        Opportunity.model_validate(rec)


def test_placeholder_verifier_rejected():
    with pytest.raises(ValidationError):
        Opportunity.model_validate(verified(verified_by="Citi Hackathon Research Verification Team"))


def test_sample_cannot_be_verified():
    with pytest.raises(ValidationError):
        Opportunity.model_validate(verified(is_sample=True))


def test_verified_requires_confirmed_eligibility():
    with pytest.raises(ValidationError):
        Opportunity.model_validate(verified(eligibility_confirmed=False))


def test_deadline_not_allowed_on_unverified_record():
    with pytest.raises(ValidationError):
        Opportunity.model_validate(base(deadline="2027-01-01"))


def test_past_deadline_is_expired():
    rec = Opportunity.model_validate(verified(deadline=(date.today() - timedelta(days=1)).isoformat(), deadline_note=None))
    assert rec.effective_status() == Status.expired


def test_stale_verification_downgrades_to_needs_review():
    old = (date.today() - timedelta(days=200)).isoformat()
    rec = Opportunity.model_validate(verified(last_verified_on=old))
    assert rec.effective_status() == Status.needs_review


def test_unknown_education_level_rejected():
    with pytest.raises(ValidationError):
        Opportunity.model_validate(base(eligible_education_levels=["grade_12"]))


def test_age_range_must_be_sane():
    with pytest.raises(ValidationError):
        Opportunity.model_validate(base(min_age=30, max_age=20))


def test_learning_resource_accepts_unknown_cost():
    from app.schemas.knowledge_base import LearningResource

    record = {
        "slug": "unknown-cost-resource", "title": "Unknown Cost Resource",
        "provider": "Provider", "url": "https://example.gov.in",
        "cost": "unknown", "status": "needs_review",
    }
    assert LearningResource.model_validate(record).cost == "unknown"


def test_upgrade_never_marks_verified_and_dedupes(tmp_path, monkeypatch):
    legacy = {
        "title": "Old Scheme", "slug": "old-scheme", "type": "scholarship", "provider": "X",
        "description": "d", "official_portal_url": "https://scholarships.gov.in",
        "verification_date": "2026-03-15", "verified_by": "Somebody", "deadline": "2026-11-30",
        "financial_benefit_inr": 1.0, "financial_benefit_description": "b", "income_ceiling": 250000.0,
        "min_age": 16, "max_age": 30, "min_marks_percentage": 50.0, "allowed_genders": ["all"],
        "allowed_categories": ["SC", "ST"], "domicile_states": ["all"],
        "eligible_education_levels": ["12th_pass"], "eligible_streams": ["all"],
        "required_documents": [], "actionable_steps": "a",
    }
    src = tmp_path / "old.json"
    src.write_text(json.dumps([legacy, legacy]))
    monkeypatch.setattr(upgrade, "DATA_DIR", tmp_path / "out")
    upgrade.convert(str(src), "opportunities.json", upgrade.upgrade_opportunity)
    out = json.loads((tmp_path / "out" / "opportunities.json").read_text())
    assert len(out) == 1
    rec = Opportunity.model_validate(out[0])
    assert rec.status == Status.needs_review and rec.deadline is None
    assert "UNCONFIRMED" in rec.deadline_note


def test_validator_reports_duplicates_and_errors(tmp_path):
    f = tmp_path / "opps.json"
    f.write_text(json.dumps([base(), base(), base(slug="bad-one", category="nonsense")]))
    records, errors = validate_data.load_records(f, Opportunity, date.today())
    assert len(records) == 1
    assert any("duplicate slug" in e for e in errors)
    assert any("category" in e for e in errors)
