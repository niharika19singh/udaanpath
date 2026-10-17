"""DRAFT ONLY: create separate tables for curated knowledge-base records.

This file is intentionally outside backend/alembic/versions and is not applied.
Niharika must review the table names, column types, and migration chain first.
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_knowledge_base_tables_draft"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def _common_columns():
    return [
        sa.Column("slug", sa.String(length=220), nullable=False, unique=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="needs_review"),
        sa.Column("is_sample", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("last_verified_on", sa.Date(), nullable=True),
        sa.Column("verified_by", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    ]


def upgrade():
    op.create_table(
        "kb_opportunities",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        *_common_columns(),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("provider", sa.String(length=255), nullable=False),
        sa.Column("target_group", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("official_url", sa.String(length=500), nullable=False),
        sa.Column("min_age", sa.Integer(), nullable=True),
        sa.Column("max_age", sa.Integer(), nullable=True),
        sa.Column("income_ceiling", sa.Float(), nullable=True),
        sa.Column("min_marks_percentage", sa.Float(), nullable=True),
        sa.Column("allowed_genders", sa.JSON(), nullable=False),
        sa.Column("allowed_categories", sa.JSON(), nullable=False),
        sa.Column("eligible_education_levels", sa.JSON(), nullable=False),
        sa.Column("eligible_streams", sa.JSON(), nullable=False),
        sa.Column("states", sa.JSON(), nullable=False),
        sa.Column("other_criteria", sa.JSON(), nullable=False),
        sa.Column("required_documents", sa.JSON(), nullable=False),
        sa.Column("eligibility_confirmed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("deadline_note", sa.Text(), nullable=True),
        sa.Column("benefit_description", sa.Text(), nullable=True),
        sa.Column("benefit_amount_inr", sa.Float(), nullable=True),
        sa.Column("actionable_steps", sa.Text(), nullable=True),
    )
    op.create_table(
        "kb_careers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        *_common_columns(),
        sa.Column("category", sa.String(length=60), nullable=False),
        sa.Column("sector", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("entry_qualification", sa.String(length=40), nullable=False),
        sa.Column("eligible_streams", sa.JSON(), nullable=False),
        sa.Column("key_skills", sa.JSON(), nullable=False),
        sa.Column("typical_interests", sa.JSON(), nullable=False),
        sa.Column("training_duration_months", sa.Integer(), nullable=True),
        sa.Column("financial_barrier", sa.String(length=20), nullable=False),
        sa.Column("salary_starting_inr", sa.Integer(), nullable=True),
        sa.Column("salary_mid_inr", sa.Integer(), nullable=True),
        sa.Column("salary_source_url", sa.String(length=500), nullable=True),
        sa.Column("growth_outlook", sa.Text(), nullable=True),
    )
    op.create_table(
        "kb_learning_resources",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        *_common_columns(),
        sa.Column("provider", sa.String(length=255), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("level", sa.String(length=255), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("language", sa.JSON(), nullable=False),
        sa.Column("cost", sa.String(length=20), nullable=False),
    )


def downgrade():
    op.drop_table("kb_learning_resources")
    op.drop_table("kb_careers")
    op.drop_table("kb_opportunities")