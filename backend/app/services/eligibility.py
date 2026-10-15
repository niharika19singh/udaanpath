from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.profile import StudentProfile
from app.models.opportunity import Opportunity
from app.repositories.profile import ProfileRepository
from app.repositories.opportunity import OpportunityRepository
from app.schemas.eligibility import (
    EligibilityCriterionResult,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    BatchEligibilityCheckRequest,
    BatchEligibilityCheckResponse
)


class EligibilityEngine:
    def __init__(self, db: Session):
        self.db = db
        self.profile_repo = ProfileRepository(db)
        self.opp_repo = OpportunityRepository(db)

    def evaluate(self, student: StudentProfile, opportunity: Opportunity) -> EligibilityCheckResponse:
        passed_rules: List[EligibilityCriterionResult] = []
        failed_rules: List[EligibilityCriterionResult] = []

        total_weight = 0.0
        earned_weight = 0.0

        # Rule 1: Family Annual Income Ceiling
        if opportunity.income_ceiling is not None:
            total_weight += 25.0
            req_str = f"<= ₹{opportunity.income_ceiling:,.0f} per annum"
            actual_str = f"₹{student.annual_family_income:,.0f} per annum"
            if student.annual_family_income <= opportunity.income_ceiling:
                earned_weight += 25.0
                passed_rules.append(EligibilityCriterionResult(
                    criterion_name="Income Ceiling",
                    passed=True,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Annual family income ({actual_str}) is within the permissible limit of {req_str}."
                ))
            else:
                failed_rules.append(EligibilityCriterionResult(
                    criterion_name="Income Ceiling",
                    passed=False,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Annual family income ({actual_str}) exceeds the maximum permissible limit of {req_str}."
                ))

        # Rule 2: Age Range
        if opportunity.min_age is not None or opportunity.max_age is not None:
            total_weight += 15.0
            min_a = opportunity.min_age or 0
            max_a = opportunity.max_age or 100
            req_str = f"{min_a} - {max_a} years"
            actual_str = f"{student.age} years"
            if min_a <= student.age <= max_a:
                earned_weight += 15.0
                passed_rules.append(EligibilityCriterionResult(
                    criterion_name="Age Eligibility",
                    passed=True,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Student age ({actual_str}) falls strictly within the eligible range ({req_str})."
                ))
            else:
                failed_rules.append(EligibilityCriterionResult(
                    criterion_name="Age Eligibility",
                    passed=False,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Student age ({actual_str}) does not meet the required age bracket ({req_str})."
                ))

        # Rule 3: Gender Specificity
        allowed_genders = [g.lower() for g in (opportunity.allowed_genders or ["all"])]
        if "all" not in allowed_genders:
            total_weight += 25.0
            req_str = ", ".join(opportunity.allowed_genders)
            actual_str = student.gender.title()
            if student.gender.lower() in allowed_genders:
                earned_weight += 25.0
                passed_rules.append(EligibilityCriterionResult(
                    criterion_name="Gender Criteria",
                    passed=True,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Applicant gender ({actual_str}) matches targeted scheme category ({req_str})."
                ))
            else:
                failed_rules.append(EligibilityCriterionResult(
                    criterion_name="Gender Criteria",
                    passed=False,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Scheme is exclusively reserved for {req_str}. Applicant is {actual_str}."
                ))

        # Rule 4: Caste / Social Category
        allowed_categories = [c.upper() for c in (opportunity.allowed_categories or ["all"])]
        if "ALL" not in allowed_categories:
            total_weight += 15.0
            req_str = ", ".join(opportunity.allowed_categories)
            actual_str = student.category.upper()
            if student.category.upper() in allowed_categories:
                earned_weight += 15.0
                passed_rules.append(EligibilityCriterionResult(
                    criterion_name="Social Category / Caste",
                    passed=True,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Student category ({actual_str}) is explicitly recognized under target beneficiaries ({req_str})."
                ))
            else:
                failed_rules.append(EligibilityCriterionResult(
                    criterion_name="Social Category / Caste",
                    passed=False,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Scheme targets categories: {req_str}. Applicant category is {actual_str}."
                ))

        # Rule 5: Academic Marks Threshold
        if opportunity.min_marks_percentage is not None:
            total_weight += 10.0
            req_str = f">= {opportunity.min_marks_percentage:.1f}%"
            actual_str = f"{student.percentage_marks:.1f}%"
            if student.percentage_marks >= opportunity.min_marks_percentage:
                earned_weight += 10.0
                passed_rules.append(EligibilityCriterionResult(
                    criterion_name="Minimum Academic Marks",
                    passed=True,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Academic score of {actual_str} satisfies minimum benchmark of {req_str}."
                ))
            else:
                failed_rules.append(EligibilityCriterionResult(
                    criterion_name="Minimum Academic Marks",
                    passed=False,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Academic score of {actual_str} is below the required {req_str}."
                ))

        # Rule 6: Education Qualification Level
        allowed_edu = [e.lower() for e in (opportunity.eligible_education_levels or ["all"])]
        if "all" not in allowed_edu:
            total_weight += 10.0
            req_str = ", ".join([e.replace("_", " ").title() for e in opportunity.eligible_education_levels])
            actual_str = student.education_level.replace("_", " ").title()
            if student.education_level.lower() in allowed_edu:
                earned_weight += 10.0
                passed_rules.append(EligibilityCriterionResult(
                    criterion_name="Education Qualification",
                    passed=True,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Current education stage ({actual_str}) matches eligible programs ({req_str})."
                ))
            else:
                failed_rules.append(EligibilityCriterionResult(
                    criterion_name="Education Qualification",
                    passed=False,
                    student_value=actual_str,
                    required_value=req_str,
                    explanation=f"Eligible education levels are {req_str}. Applicant is currently at {actual_str}."
                ))

        # If opportunity had no restrictive rules, default full score
        if total_weight == 0.0:
            match_percentage = 100.0
            final_status = "ELIGIBLE"
        else:
            match_percentage = round((earned_weight / total_weight) * 100.0, 1)

            # Determine deterministic final status
            has_gender_failure = any(r.criterion_name == "Gender Criteria" for r in failed_rules)
            has_category_failure = any(r.criterion_name == "Social Category / Caste" for r in failed_rules)

            if len(failed_rules) == 0:
                final_status = "ELIGIBLE"
            elif has_gender_failure or has_category_failure or match_percentage < 50.0:
                final_status = "INELIGIBLE"
            else:
                final_status = "PARTIALLY_ELIGIBLE"

        # Actionable next steps / remediation
        if final_status == "ELIGIBLE":
            actionable = f"Apply directly via official portal ({opportunity.official_portal_url}). Ensure all required documents are ready for verification."
        elif final_status == "PARTIALLY_ELIGIBLE":
            missing_names = ", ".join([f.criterion_name for f in failed_rules])
            actionable = f"Review criteria ({missing_names}). If eligible under exemptions or updated marksheets/income certificates, proceed with application."
        else:
            actionable = "Criteria not met. Explore alternative schemes or corporate CSR opportunities matched to your profile."

        return EligibilityCheckResponse(
            student_id=student.id,
            opportunity_id=opportunity.id,
            opportunity_title=opportunity.title,
            opportunity_type=opportunity.type,
            status=final_status,
            match_score=match_percentage,
            passed_criteria=passed_rules,
            failed_criteria=failed_rules,
            required_documents=opportunity.required_documents or [],
            actionable_remediation=actionable,
            official_portal_url=opportunity.official_portal_url,
            verification_date=opportunity.verification_date
        )

    def check_single(self, req: EligibilityCheckRequest) -> EligibilityCheckResponse:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {req.student_id} not found."
            )

        opportunity = self.opp_repo.get_by_id(req.opportunity_id)
        if not opportunity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Opportunity with id {req.opportunity_id} not found."
            )

        return self.evaluate(student, opportunity)

    def check_batch(self, req: BatchEligibilityCheckRequest) -> BatchEligibilityCheckResponse:
        student = self.profile_repo.get_by_id(req.student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with id {req.student_id} not found."
            )

        if req.opportunity_ids:
            opportunities = [self.opp_repo.get_by_id(oid) for oid in req.opportunity_ids]
            opportunities = [o for o in opportunities if o is not None]
        else:
            opportunities = self.opp_repo.get_all(limit=100, type=req.opportunity_type)

        results: List[EligibilityCheckResponse] = []
        eligible_count = 0
        partially_eligible_count = 0
        ineligible_count = 0

        for opp in opportunities:
            eval_res = self.evaluate(student, opp)
            if eval_res.status == "ELIGIBLE":
                eligible_count += 1
            elif eval_res.status == "PARTIALLY_ELIGIBLE":
                partially_eligible_count += 1
            else:
                ineligible_count += 1
            results.append(eval_res)

        # Sort results: ELIGIBLE first, then PARTIALLY_ELIGIBLE, then INELIGIBLE
        status_rank = {"ELIGIBLE": 1, "PARTIALLY_ELIGIBLE": 2, "INELIGIBLE": 3}
        results.sort(key=lambda x: (status_rank.get(x.status, 4), -x.match_score))

        return BatchEligibilityCheckResponse(
            student_id=student.id,
            total_evaluated=len(results),
            eligible_count=eligible_count,
            partially_eligible_count=partially_eligible_count,
            ineligible_count=ineligible_count,
            results=results
        )
