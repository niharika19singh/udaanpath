import json
from datetime import date
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity
from app.models.profile import StudentProfile
from app.repositories.opportunity import OpportunityRepository
from app.repositories.profile import ProfileRepository
from app.schemas.eligibility import (
    BatchEligibilityCheckRequest,
    BatchEligibilityCheckResponse,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    EligibilityCriterionResult,
)


class EligibilityEngine:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)
        self.opp_repo = OpportunityRepository(db)

    def _get_curated_opportunity(self, slug: str) -> Optional[Dict[str, Any]]:
        path = Path(__file__).resolve().parents[2] / "data" / "kb" / "opportunities.json"
        try:
            with path.open("r", encoding="utf-8") as data_file:
                records = json.load(data_file)
        except (OSError, json.JSONDecodeError):
            return None
        return next((item for item in records if item.get("slug") == slug), None)

    def _is_record_trusted(self, record: Optional[Dict[str, Any]]) -> bool:
        return bool(
            record
            and record.get("status") == "verified"
            and record.get("eligibility_confirmed") is True
            and record.get("source_url")
            and record.get("last_verified_on")
            and record.get("verified_by")
        )

    def evaluate(self, student: StudentProfile, opportunity: Opportunity) -> EligibilityCheckResponse:
        passed: List[EligibilityCriterionResult] = []
        failed: List[EligibilityCriterionResult] = []
        unknown: List[EligibilityCriterionResult] = []
        record = self._get_curated_opportunity(opportunity.slug) or {}
        trusted = self._is_record_trusted(record)

        raw_deadline = record.get("deadline")
        try:
            deadline = date.fromisoformat(raw_deadline) if raw_deadline else None
        except (TypeError, ValueError):
            deadline = None
        expired = record.get("status") == "expired" or (deadline is not None and deadline < date.today())

        def add_result(name: str, outcome: str, current: Any, requirement: Any, explanation: str) -> None:
            result = EligibilityCriterionResult(
                criterion_name=name,
                passed=outcome == "met",
                outcome=outcome,
                student_value="unknown" if current is None else str(current),
                required_value="unknown" if requirement is None else str(requirement),
                explanation=explanation,
            )
            if outcome == "met":
                passed.append(result)
            elif outcome == "unmet":
                failed.append(result)
            else:
                unknown.append(result)

        if expired:
            add_result("Record status", "unmet", record.get("status"), "active opportunity", "This opportunity is expired or its confirmed deadline has passed.")
        elif trusted:
            add_result("Record status", "met", record.get("status"), "reviewed record with confirmed eligibility", "The record has been reviewed and its eligibility rules are confirmed.")
        else:
            add_result("Record status", "unknown", record.get("status") or "not found", "reviewed record with confirmed eligibility", "Not enough information to confirm eligibility because this record has not been verified.")

        def evaluate_rule(name: str, current: Any, requirement: Any, compare, display_requirement: str) -> None:
            if requirement is None:
                return
            if not trusted:
                add_result(name, "unknown", current, display_requirement, "Not enough information to confirm eligibility because this rule is not verified against an official source.")
            elif current is None or (isinstance(current, str) and not current.strip()):
                add_result(name, "unknown", None, display_requirement, "Not enough information to confirm eligibility because profile information is missing.")
            elif compare(current, requirement):
                add_result(name, "met", current, display_requirement, "The available profile information matches this confirmed criterion.")
            else:
                add_result(name, "unmet", current, display_requirement, "The available profile information does not match this confirmed criterion.")

        allowed_genders = record.get("allowed_genders", ["all"])
        allowed_categories = record.get("allowed_categories", ["ALL"])
        allowed_education = record.get("eligible_education_levels", ["all"])
        allowed_states = record.get("states", ["all"])
        allowed_streams = record.get("eligible_streams", ["all"])

        evaluate_rule(
            "Income Ceiling", student.annual_family_income, record.get("income_ceiling"),
            lambda value, ceiling: value <= ceiling, "annual income ceiling",
        )

        min_age, max_age = record.get("min_age"), record.get("max_age")
        if min_age is not None or max_age is not None:
            evaluate_rule(
                "Age Eligibility", student.age, (min_age, max_age),
                lambda value, bounds: (bounds[0] is None or value >= bounds[0]) and (bounds[1] is None or value <= bounds[1]),
                "{} to {} years".format(min_age if min_age is not None else "no lower limit", max_age if max_age is not None else "no upper limit"),
            )

        rules = [
            ("Gender Criteria", student.gender, allowed_genders, lambda value, allowed: value.lower() in [item.lower() for item in allowed]),
            ("Social Category / Caste", student.category, allowed_categories, lambda value, allowed: value.upper() in [item.upper() for item in allowed]),
            ("Education Qualification", student.education_level, allowed_education, lambda value, allowed: value.lower() in [item.lower() for item in allowed]),
            ("State / Domicile", student.state, allowed_states, lambda value, allowed: value.lower() in [item.lower() for item in allowed]),
            ("Stream", student.stream, allowed_streams, lambda value, allowed: value.lower() in [item.lower() for item in allowed]),
        ]
        for name, current, allowed, compare in rules:
            if allowed and not all(item.lower() == "all" for item in allowed):
                evaluate_rule(name, current, allowed, compare, ", ".join(allowed))

        evaluate_rule(
            "Minimum Academic Marks", student.percentage_marks, record.get("min_marks_percentage"),
            lambda value, minimum: value >= minimum, "minimum marks percentage",
        )

        if deadline is None:
            add_result("Application Deadline", "unknown", None, record.get("deadline_note") or "confirmed deadline", "Not enough information to confirm the current application deadline.")
        elif expired:
            add_result("Application Deadline", "unmet", date.today().isoformat(), deadline.isoformat(), "The confirmed application deadline has passed.")
        elif trusted:
            add_result("Application Deadline", "met", date.today().isoformat(), deadline.isoformat(), "The confirmed deadline has not passed.")
        else:
            add_result("Application Deadline", "unknown", date.today().isoformat(), deadline.isoformat(), "The deadline cannot be trusted until this opportunity is verified.")

        for criterion in record.get("other_criteria", []):
            add_result("Human confirmation", "unknown", None, criterion, "A person must confirm this requirement on the official source.")

        known_count = len(passed) + len(failed)
        score = round((len(passed) / known_count) * 100.0, 1) if known_count else 0.0
        hard_failures = {
            "Record status", "Application Deadline", "Gender Criteria", "Social Category / Caste",
            "Education Qualification", "State / Domicile", "Stream",
        }
        if expired or any(item.criterion_name in hard_failures for item in failed) or (known_count and score < 50.0):
            final_status = "INELIGIBLE"
        elif failed:
            final_status = "PARTIALLY_ELIGIBLE"
        elif unknown or not trusted:
            final_status = "NEEDS_CONFIRMATION"
        else:
            final_status = "ELIGIBLE"

        if final_status == "ELIGIBLE":
            actionable = "The confirmed criteria match the profile. Check the official portal for current application steps and documents."
        elif final_status == "NEEDS_CONFIRMATION":
            actionable = "Not enough information to confirm eligibility. Review the official source and confirm the unknown criteria before applying."
        elif final_status == "PARTIALLY_ELIGIBLE":
            actionable = "Review the criteria marked unmet and confirm any remaining unknown requirements on the official source."
        else:
            actionable = "At least one confirmed requirement is not met, or the opportunity is expired. Do not treat this as an eligible match."

        return EligibilityCheckResponse(
            student_id=student.id,
            opportunity_id=opportunity.id,
            opportunity_title=opportunity.title,
            opportunity_type=opportunity.type,
            status=final_status,
            match_score=score,
            passed_criteria=passed,
            failed_criteria=failed,
            unknown_criteria=unknown,
            required_documents=opportunity.required_documents or [] if trusted else [],
            actionable_remediation=actionable,
            official_portal_url=opportunity.official_portal_url,
            verification_date=opportunity.verification_date if trusted else "unknown",
        )

    def check_single(self, req: EligibilityCheckRequest) -> EligibilityCheckResponse:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student profile with id {req.student_id} not found.")
        opportunity = self.opp_repo.get_by_id(req.opportunity_id)
        if not opportunity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Opportunity with id {req.opportunity_id} not found.")
        return self.evaluate(student, opportunity)

    def check_batch(self, req: BatchEligibilityCheckRequest) -> BatchEligibilityCheckResponse:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student profile with id {req.student_id} not found.")
        if req.opportunity_ids:
            opportunities = [self.opp_repo.get_by_id(item_id) for item_id in req.opportunity_ids]
            opportunities = [item for item in opportunities if item is not None]
        else:
            opportunities = self.opp_repo.get_all(limit=100, type=req.opportunity_type)

        results = [self.evaluate(student, item) for item in opportunities]
        status_values = {
            "eligible": "ELIGIBLE",
            "partially_eligible": "PARTIALLY_ELIGIBLE",
            "ineligible": "INELIGIBLE",
            "unknown": "NEEDS_CONFIRMATION",
        }
        counts = {name: sum(item.status == value for item in results) for name, value in status_values.items()}
        rank = {"ELIGIBLE": 1, "PARTIALLY_ELIGIBLE": 2, "NEEDS_CONFIRMATION": 3, "INELIGIBLE": 4}
        results.sort(key=lambda item: (rank.get(item.status, 5), -item.match_score))
        return BatchEligibilityCheckResponse(
            student_id=student.id,
            total_evaluated=len(results),
            eligible_count=counts["eligible"],
            partially_eligible_count=counts["partially_eligible"],
            ineligible_count=counts["ineligible"],
            unknown_count=counts["unknown"],
            results=results,
        )