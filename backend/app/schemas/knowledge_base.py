"""Curated knowledge-base schemas for UdaanPath (careers, opportunities, learning resources).

Core rule: a record may only be marked `verified` if a named human checked it against an
official source on a known date. Everything else stays `needs_review`. Sample data is
labelled `is_sample=True` and can never be `verified`.
"""
from __future__ import annotations

from datetime import date, timedelta
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator

STALE_AFTER_DAYS = 90  # a verified record older than this is treated as needs_review

# Names that mean "nobody actually checked this"
PLACEHOLDER_VERIFIERS = {"", "tbd", "n/a", "na", "team", "citi hackathon research verification team"}

EDUCATION_LEVELS = {"all", "10th_pass", "12th_pass", "iti_diploma", "undergraduate", "postgraduate"}
STREAMS = {"all", "science_pcm", "science_pcb", "commerce", "arts_humanities", "vocational", "general"}
GENDERS = {"all", "male", "female", "non_binary", "other"}
SOCIAL_CATEGORIES = {"ALL", "GENERAL", "OBC", "SC", "ST", "EWS"}
OPPORTUNITY_CATEGORIES = {"scholarship", "government_scheme", "apprenticeship", "course", "exam", "internship", "mentorship"}
CAREER_CATEGORIES = {"corporate_tech", "vocational_skilled_trades", "government_public_sector", "creative_emerging"}


class Status(str, Enum):
    verified = "verified"
    needs_review = "needs_review"
    expired = "expired"


def _check_values(values: List[str], allowed: set, field: str, upper: bool = False) -> List[str]:
    cleaned = [(v.strip().upper() if upper else v.strip().lower()) for v in values]
    bad = [v for v in cleaned if v not in allowed]
    if bad:
        raise ValueError(f"{field}: unknown value(s) {bad}. Allowed: {sorted(allowed)}")
    return cleaned


class Verifiable(BaseModel):
    """Fields every record carries so its trustworthiness is always visible."""
    slug: str = Field(..., min_length=3)
    title: str = Field(..., min_length=3)
    status: Status = Status.needs_review
    is_sample: bool = False
    source_url: Optional[HttpUrl] = Field(None, description="Page where the facts were checked")
    last_verified_on: Optional[date] = None
    verified_by: Optional[str] = Field(None, description="Real person who checked it")
    notes: Optional[str] = None

    def _verification_errors(self, today: date) -> List[str]:
        errs: List[str] = []
        if self.status == Status.verified:
            if self.is_sample:
                errs.append("sample records cannot be marked verified")
            if self.source_url is None:
                errs.append("verified record needs source_url")
            if self.last_verified_on is None:
                errs.append("verified record needs last_verified_on")
            elif self.last_verified_on > today:
                errs.append("last_verified_on is in the future")
            if (self.verified_by or "").strip().lower() in PLACEHOLDER_VERIFIERS:
                errs.append("verified record needs verified_by = a real person's name")
        return errs

    @model_validator(mode="after")
    def _verification_rules(self):
        errs = self._verification_errors(date.today())
        if errs:
            raise ValueError("; ".join(errs))
        return self

    def effective_status(self, today: Optional[date] = None) -> Status:
        """Status the app should display, accounting for staleness."""
        today = today or date.today()
        if self.status == Status.expired:
            return Status.expired
        if self.status == Status.verified and self.last_verified_on:
            if today - self.last_verified_on > timedelta(days=STALE_AFTER_DAYS):
                return Status.needs_review
        return self.status


class Opportunity(Verifiable):
    category: str
    provider: str
    target_group: Optional[str] = Field(None, description="Who this is for, in plain words")
    description: str
    official_url: HttpUrl

    # Machine-checkable criteria. None / ["all"] means "no restriction published".
    min_age: Optional[int] = Field(None, ge=0)
    max_age: Optional[int] = Field(None, ge=0)
    income_ceiling: Optional[float] = Field(None, ge=0)
    min_marks_percentage: Optional[float] = Field(None, ge=0, le=100)
    allowed_genders: List[str] = Field(default_factory=lambda: ["all"])
    allowed_categories: List[str] = Field(default_factory=lambda: ["ALL"])
    eligible_education_levels: List[str] = Field(default_factory=lambda: ["all"])
    eligible_streams: List[str] = Field(default_factory=lambda: ["all"])
    states: List[str] = Field(default_factory=lambda: ["all"], description="Domicile/region; ['all'] = nationwide")

    # Criteria a human must confirm (cannot be decided from the profile)
    other_criteria: List[str] = Field(default_factory=list, description="e.g. 'Admission to AICTE-approved college'")
    required_documents: List[str] = Field(default_factory=list)
    eligibility_confirmed: bool = Field(False, description="True only after comparing criteria with the official page")

    # Dates: put a real date in `deadline` ONLY when confirmed. Otherwise use deadline_note.
    deadline: Optional[date] = None
    deadline_note: Optional[str] = Field(None, description="e.g. 'Rolling', or an unconfirmed legacy date")

    benefit_description: Optional[str] = None
    benefit_amount_inr: Optional[float] = Field(None, ge=0)
    actionable_steps: Optional[str] = None

    @field_validator("category")
    @classmethod
    def _cat(cls, v):
        v = v.strip().lower()
        if v not in OPPORTUNITY_CATEGORIES:
            raise ValueError(f"category must be one of {sorted(OPPORTUNITY_CATEGORIES)}")
        return v

    @field_validator("allowed_genders")
    @classmethod
    def _g(cls, v): return _check_values(v, GENDERS, "allowed_genders")

    @field_validator("allowed_categories")
    @classmethod
    def _c(cls, v): return _check_values(v, SOCIAL_CATEGORIES, "allowed_categories", upper=True)

    @field_validator("eligible_education_levels")
    @classmethod
    def _e(cls, v): return _check_values(v, EDUCATION_LEVELS, "eligible_education_levels")

    @field_validator("eligible_streams")
    @classmethod
    def _s(cls, v): return _check_values(v, STREAMS, "eligible_streams")

    @model_validator(mode="after")
    def _opportunity_rules(self):
        errs: List[str] = []
        if self.min_age is not None and self.max_age is not None and self.min_age > self.max_age:
            errs.append("min_age > max_age")
        if self.deadline is not None and self.status == Status.needs_review:
            errs.append("deadline set on an unverified record; put unconfirmed dates in deadline_note")
        if self.status == Status.verified:
            if not self.eligibility_confirmed:
                errs.append("verified record needs eligibility_confirmed=true")
            if not (self.target_group or "").strip():
                errs.append("verified record needs target_group")
            if self.deadline is None and not (self.deadline_note or "").strip():
                errs.append("verified record needs a deadline or a deadline_note such as 'Rolling'")
        if errs:
            raise ValueError("; ".join(errs))
        return self

    def effective_status(self, today: Optional[date] = None) -> Status:
        today = today or date.today()
        if self.deadline is not None and self.deadline < today:
            return Status.expired
        return super().effective_status(today)


class Career(Verifiable):
    category: str
    sector: str
    description: str
    entry_qualification: str
    eligible_streams: List[str] = Field(default_factory=lambda: ["all"])
    key_skills: List[str] = Field(default_factory=list)
    typical_interests: List[str] = Field(default_factory=list)
    training_duration_months: Optional[int] = Field(None, ge=0)
    financial_barrier: str = "moderate"
    salary_starting_inr: Optional[int] = Field(None, ge=0)
    salary_mid_inr: Optional[int] = Field(None, ge=0)
    salary_source_url: Optional[HttpUrl] = None
    growth_outlook: Optional[str] = Field(None, description="Only claims you can source")

    @field_validator("category")
    @classmethod
    def _cat(cls, v):
        v = v.strip().lower()
        if v not in CAREER_CATEGORIES:
            raise ValueError(f"category must be one of {sorted(CAREER_CATEGORIES)}")
        return v

    @field_validator("entry_qualification")
    @classmethod
    def _eq(cls, v):
        v = v.strip().lower()
        if v not in EDUCATION_LEVELS - {"all"}:
            raise ValueError(f"entry_qualification must be one of {sorted(EDUCATION_LEVELS - {'all'})}")
        return v

    @field_validator("eligible_streams")
    @classmethod
    def _s(cls, v): return _check_values(v, STREAMS, "eligible_streams")

    @field_validator("financial_barrier")
    @classmethod
    def _fb(cls, v):
        v = v.strip().lower()
        if v not in {"low", "moderate", "high"}:
            raise ValueError("financial_barrier must be low, moderate or high")
        return v

    @model_validator(mode="after")
    def _career_rules(self):
        if self.status == Status.verified:
            has_salary = self.salary_starting_inr is not None or self.salary_mid_inr is not None
            if has_salary and self.salary_source_url is None:
                raise ValueError("verified career with salary figures needs salary_source_url")
        return self


class LearningResource(Verifiable):
    provider: str
    url: HttpUrl
    level: Optional[str] = None
    subject: Optional[str] = None
    language: List[str] = Field(default_factory=lambda: ["English"])
    cost: str = "free"

    @field_validator("cost")
    @classmethod
    def _cost(cls, v):
        v = v.strip().lower()
        if v not in {"free", "paid", "freemium", "unknown"}:
            raise ValueError("cost must be free, paid, freemium or unknown")
        return v
