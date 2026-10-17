"""DRAFT ONLY: validate and load the curated JSON files into kb_* tables.

The draft migration must be reviewed and applied before using --apply. Without
--apply, this script validates the source data and makes no database changes.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

from sqlalchemy import MetaData, Table, create_engine, insert, select, update


ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
DATA_DIR = BACKEND_DIR / "data" / "kb"
sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings  # noqa: E402
from app.schemas.knowledge_base import Career, LearningResource, Opportunity  # noqa: E402


SOURCES: List[Tuple[str, Any]] = [
    ("opportunities.json", Opportunity),
    ("careers.json", Career),
    ("learning_resources.json", LearningResource),
]
TABLES = {
    "opportunities.json": "kb_opportunities",
    "careers.json": "kb_careers",
    "learning_resources.json": "kb_learning_resources",
}


def validated_records() -> Dict[str, List[Dict[str, Any]]]:
    result = {}
    for filename, model in SOURCES:
        source_path = DATA_DIR / filename
        raw_records = json.loads(source_path.read_text(encoding="utf-8"))
        result[filename] = [
            model.model_validate(record).model_dump(mode="json")
            for record in raw_records
        ]
    return result


def load_records(connection, table: Table, records: List[Dict[str, Any]]) -> int:
    changed = 0
    for record in records:
        existing = connection.execute(
            select(table.c.id).where(table.c.slug == record["slug"])
        ).first()
        if existing:
            connection.execute(
                update(table).where(table.c.slug == record["slug"]).values(**record)
            )
        else:
            connection.execute(insert(table).values(**record))
        changed += 1
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write to the configured database after the draft migration has been reviewed and applied.",
    )
    args = parser.parse_args()
    records = validated_records()
    print("Validated {} opportunities, {} careers, and {} learning resources.".format(
        len(records["opportunities.json"]),
        len(records["careers.json"]),
        len(records["learning_resources.json"]),
    ))
    if not args.apply:
        print("Dry run only; no database changes were made. Review the draft migration before using --apply.")
        return 0

    engine = create_engine(settings.DATABASE_URL)
    metadata = MetaData()
    with engine.begin() as connection:
        tables = {
            filename: Table(table_name, metadata, autoload_with=connection)
            for filename, table_name in TABLES.items()
        }
        for filename, table in tables.items():
            count = load_records(connection, table, records[filename])
            print("Loaded {} records into {}.".format(count, table.name))
    engine.dispose()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())