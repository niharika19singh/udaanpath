"""Convert Niharika's original JSON (careers / opportunities) into the new knowledge-base format.

Nothing is carried over as 'verified'. Her old verification dates and 'verified_by' names are
NOT trusted: they are kept only inside `notes` so you can see what was claimed. Every record
comes out as needs_review for you to check against the official site.

Usage (from repo root):
  python backend/scripts/upgrade_legacy_data.py
Reads backend/data/opportunities.json and backend/data/careers.json (the legacy files used by seed.py)
and writes backend/data/kb/opportunities.json and backend/data/kb/careers.json.
It refuses to overwrite existing files, and never touches the legacy files.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "backend" / "data" / "kb"
LEGACY_DIR = ROOT / "backend" / "data"


def upgrade_opportunity(old: dict) -> dict:
    claimed = f"Legacy claim: verified {old.get('verification_date')} by '{old.get('verified_by')}' (NOT independently checked)."
    states = old.get("domicile_states") or ["all"]
    return {
        "slug": old["slug"],
        "title": old["title"],
        "category": old["type"],
        "provider": old["provider"],
        "target_group": None,
        "description": old["description"],
        "official_url": old["official_portal_url"],
        "source_url": None,
        "status": "needs_review",
        "is_sample": False,
        "last_verified_on": None,
        "verified_by": None,
        "min_age": old.get("min_age"),
        "max_age": old.get("max_age"),
        "income_ceiling": old.get("income_ceiling"),
        "min_marks_percentage": old.get("min_marks_percentage"),
        "allowed_genders": old.get("allowed_genders") or ["all"],
        "allowed_categories": old.get("allowed_categories") or ["ALL"],
        "eligible_education_levels": old.get("eligible_education_levels") or ["all"],
        "eligible_streams": old.get("eligible_streams") or ["all"],
        "states": states,
        "other_criteria": [],
        "required_documents": old.get("required_documents", []),
        "eligibility_confirmed": False,
        "deadline": None,
        "deadline_note": f"UNCONFIRMED legacy value: {old.get('deadline')}",
        "benefit_description": old.get("financial_benefit_description"),
        "benefit_amount_inr": old.get("financial_benefit_inr"),
        "actionable_steps": old.get("actionable_steps"),
        "notes": claimed,
    }


def upgrade_career(old: dict) -> dict:
    return {
        "slug": old["slug"],
        "title": old["title"],
        "category": old["category"],
        "sector": old["sector"],
        "description": old["description"],
        "entry_qualification": old["entry_qualification"],
        "eligible_streams": old.get("eligible_streams") or ["all"],
        "key_skills": old.get("key_skills", []),
        "typical_interests": old.get("typical_interests", []),
        "training_duration_months": old.get("training_duration_months"),
        "financial_barrier": old.get("financial_barrier", "moderate"),
        "salary_starting_inr": old.get("starting_salary_inr"),
        "salary_mid_inr": old.get("mid_level_salary_inr"),
        "salary_source_url": None,
        "growth_outlook": old.get("growth_outlook"),
        "status": "needs_review",
        "is_sample": False,
        "source_url": None,
        "last_verified_on": None,
        "verified_by": None,
        "notes": "Legacy record: salary and growth claims have no source yet.",
    }


def convert(src: str, dest_name: str, fn) -> None:
    dest = DATA_DIR / dest_name
    if dest.exists():
        print(f"{dest} already exists - not overwriting")
        return
    old = json.loads(Path(src).read_text(encoding="utf-8"))
    seen, out = set(), []
    for rec in old:  # de-duplicate by slug
        if rec["slug"] not in seen:
            seen.add(rec["slug"])
            out.append(fn(rec))
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {dest} ({len(out)} records)")


if __name__ == "__main__":
    opp_src = sys.argv[1] if len(sys.argv) > 1 else str(LEGACY_DIR / "opportunities.json")
    car_src = sys.argv[2] if len(sys.argv) > 2 else str(LEGACY_DIR / "careers.json")
    convert(opp_src, "opportunities.json", upgrade_opportunity)
    convert(car_src, "careers.json", upgrade_career)
