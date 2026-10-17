"""Validate the curated data files and print a trust report.

Usage (from repo root):  python backend/scripts/validate_data.py
Exit code is 1 if any record is invalid, so you can run this in CI / before every commit.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from pydantic import ValidationError  # noqa: E402
from app.schemas.knowledge_base import Career, LearningResource, Opportunity, Status  # noqa: E402

DATA_DIR = ROOT / "backend" / "data" / "kb"
FILES = {
    "opportunities.json": Opportunity,
    "careers.json": Career,
    "learning_resources.json": LearningResource,
}


def load_records(path: Path, model, today: date):
    """Returns (valid_records, error_messages)."""
    raw = json.loads(path.read_text(encoding="utf-8"))
    records, errors, seen = [], [], set()
    for i, item in enumerate(raw):
        label = item.get("slug") or f"#{i}"
        try:
            rec = model.model_validate(item)
        except ValidationError as exc:
            for e in exc.errors():
                loc = ".".join(str(p) for p in e["loc"]) or "record"
                errors.append(f"{path.name} [{label}] {loc}: {e['msg']}")
            continue
        if rec.slug in seen:
            errors.append(f"{path.name} [{label}] duplicate slug")
            continue
        seen.add(rec.slug)
        records.append(rec)
    return records, errors


def main(today: date | None = None) -> int:
    today = today or date.today()
    total_errors = 0
    for filename, model in FILES.items():
        path = DATA_DIR / filename
        if not path.exists():
            print(f"-- {filename}: not found, skipping")
            continue
        records, errors = load_records(path, model, today)
        counts = Counter(r.effective_status(today).value for r in records)
        samples = sum(r.is_sample for r in records)
        with_source = sum(r.source_url is not None for r in records)
        print(f"\n== {filename}: {len(records)} valid, {len(errors)} errors")
        print(f"   verified={counts['verified']}  needs_review={counts['needs_review']}  "
              f"expired={counts['expired']}  sample={samples}  with_source_url={with_source}")
        for r in records:
            eff = r.effective_status(today)
            if eff != r.status:
                print(f"   note: {r.slug} stored as '{r.status.value}' but is '{eff.value}' today")
        for msg in errors:
            print(f"   ERROR {msg}")
        total_errors += len(errors)
    print("\nOK" if total_errors == 0 else f"\n{total_errors} problem(s) found")
    return 1 if total_errors else 0


if __name__ == "__main__":
    sys.exit(main())
