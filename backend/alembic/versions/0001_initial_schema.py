"""Initial database schema for UdaanPath platform

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-15 15:30:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Student Profiles
    op.create_table(
        'student_profiles',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('full_name', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(length=20), nullable=False),
        sa.Column('category', sa.String(length=20), nullable=False),
        sa.Column('state', sa.String(length=60), nullable=False),
        sa.Column('district', sa.String(length=60), nullable=False),
        sa.Column('location_tier', sa.String(length=20), nullable=False),
        sa.Column('annual_family_income', sa.Float(), nullable=False),
        sa.Column('financial_constraint', sa.String(length=20), nullable=False),
        sa.Column('education_level', sa.String(length=40), nullable=False),
        sa.Column('stream', sa.String(length=40), nullable=False),
        sa.Column('percentage_marks', sa.Float(), nullable=False),
        sa.Column('skills', sa.JSON(), nullable=False),
        sa.Column('interests', sa.JSON(), nullable=False),
        sa.Column('languages', sa.JSON(), nullable=False),
        sa.Column('career_aspirations', sa.JSON(), nullable=False),
        sa.Column('is_at_risk', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_profiles_id'), 'student_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_student_profiles_email'), 'student_profiles', ['email'], unique=True)
    op.create_index(op.f('ix_student_profiles_state'), 'student_profiles', ['state'], unique=False)
    op.create_index(op.f('ix_student_profiles_education_level'), 'student_profiles', ['education_level'], unique=False)

    # 2. Careers
    op.create_table(
        'careers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('sector', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('entry_qualification', sa.String(length=50), nullable=False),
        sa.Column('eligible_streams', sa.JSON(), nullable=False),
        sa.Column('key_skills', sa.JSON(), nullable=False),
        sa.Column('typical_interests', sa.JSON(), nullable=False),
        sa.Column('starting_salary_inr', sa.Integer(), nullable=False),
        sa.Column('mid_level_salary_inr', sa.Integer(), nullable=False),
        sa.Column('growth_outlook', sa.String(length=50), nullable=False),
        sa.Column('training_duration_months', sa.Integer(), nullable=False),
        sa.Column('financial_barrier', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_careers_id'), 'careers', ['id'], unique=False)
    op.create_index(op.f('ix_careers_slug'), 'careers', ['slug'], unique=True)
    op.create_index(op.f('ix_careers_category'), 'careers', ['category'], unique=False)
    op.create_index(op.f('ix_careers_sector'), 'careers', ['sector'], unique=False)

    # 3. Pathways
    op.create_table(
        'pathways',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('career_id', sa.Integer(), nullable=False),
        sa.Column('career_title', sa.String(length=150), nullable=False),
        sa.Column('total_estimated_duration_months', sa.Integer(), nullable=False),
        sa.Column('total_estimated_cost_inr', sa.Float(), nullable=False),
        sa.Column('free_alternative_available', sa.Boolean(), nullable=False),
        sa.Column('weekly_study_hours', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['career_id'], ['careers.id']),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pathways_id'), 'pathways', ['id'], unique=False)
    op.create_index(op.f('ix_pathways_student_id'), 'pathways', ['student_id'], unique=False)
    op.create_index(op.f('ix_pathways_career_id'), 'pathways', ['career_id'], unique=False)

    # 4. Pathway Milestones
    op.create_table(
        'pathway_milestones',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('pathway_id', sa.Integer(), nullable=False),
        sa.Column('stage', sa.String(length=30), nullable=False),
        sa.Column('step_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('duration_weeks', sa.Integer(), nullable=False),
        sa.Column('skills_to_acquire', sa.JSON(), nullable=False),
        sa.Column('recommended_certification', sa.String(length=200), nullable=True),
        sa.Column('estimated_cost_inr', sa.Float(), nullable=False),
        sa.Column('free_alternative_resource', sa.Text(), nullable=False),
        sa.Column('resource_url', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['pathway_id'], ['pathways.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pathway_milestones_id'), 'pathway_milestones', ['id'], unique=False)
    op.create_index(op.f('ix_pathway_milestones_pathway_id'), 'pathway_milestones', ['pathway_id'], unique=False)

    # 5. Opportunities
    op.create_table(
        'opportunities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=220), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('provider', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('official_portal_url', sa.String(length=255), nullable=False),
        sa.Column('verification_date', sa.String(length=20), nullable=False),
        sa.Column('verified_by', sa.String(length=100), nullable=False),
        sa.Column('deadline', sa.String(length=50), nullable=True),
        sa.Column('financial_benefit_inr', sa.Float(), nullable=False),
        sa.Column('financial_benefit_description', sa.String(length=255), nullable=False),
        sa.Column('income_ceiling', sa.Float(), nullable=True),
        sa.Column('min_age', sa.Integer(), nullable=True),
        sa.Column('max_age', sa.Integer(), nullable=True),
        sa.Column('min_marks_percentage', sa.Float(), nullable=True),
        sa.Column('allowed_genders', sa.JSON(), nullable=False),
        sa.Column('allowed_categories', sa.JSON(), nullable=False),
        sa.Column('domicile_states', sa.JSON(), nullable=False),
        sa.Column('eligible_education_levels', sa.JSON(), nullable=False),
        sa.Column('eligible_streams', sa.JSON(), nullable=False),
        sa.Column('required_documents', sa.JSON(), nullable=False),
        sa.Column('actionable_steps', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_opportunities_id'), 'opportunities', ['id'], unique=False)
    op.create_index(op.f('ix_opportunities_slug'), 'opportunities', ['slug'], unique=True)
    op.create_index(op.f('ix_opportunities_type'), 'opportunities', ['type'], unique=False)

    # 6. Opportunity Applications
    op.create_table(
        'opportunity_applications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('opportunity_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('applied_date', sa.String(length=20), nullable=True),
        sa.Column('application_reference', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id']),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_opportunity_applications_id'), 'opportunity_applications', ['id'], unique=False)
    op.create_index(op.f('ix_opportunity_applications_student_id'), 'opportunity_applications', ['student_id'], unique=False)
    op.create_index(op.f('ix_opportunity_applications_opportunity_id'), 'opportunity_applications', ['opportunity_id'], unique=False)

    # 7. Skill Badges
    op.create_table(
        'skill_badges',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('badge_name', sa.String(length=100), nullable=False),
        sa.Column('badge_category', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('earned_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_badges_id'), 'skill_badges', ['id'], unique=False)
    op.create_index(op.f('ix_skill_badges_student_id'), 'skill_badges', ['student_id'], unique=False)

    # 8. Student Documents
    op.create_table(
        'student_documents',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('document_type', sa.String(length=50), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False),
        sa.Column('document_number_masked', sa.String(length=50), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_documents_id'), 'student_documents', ['id'], unique=False)
    op.create_index(op.f('ix_student_documents_student_id'), 'student_documents', ['student_id'], unique=False)

    # 9. Counselor Interventions
    op.create_table(
        'counselor_interventions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('counselor_name', sa.String(length=120), nullable=False),
        sa.Column('category', sa.String(length=60), nullable=False),
        sa.Column('notes', sa.Text(), nullable=False),
        sa.Column('follow_up_date', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_counselor_interventions_id'), 'counselor_interventions', ['id'], unique=False)
    op.create_index(op.f('ix_counselor_interventions_student_id'), 'counselor_interventions', ['student_id'], unique=False)

    # 10. Student Opportunity Assignments
    op.create_table(
        'student_opportunity_assignments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('opportunity_id', sa.Integer(), nullable=False),
        sa.Column('assigned_by', sa.String(length=120), nullable=False),
        sa.Column('priority', sa.String(length=20), nullable=False),
        sa.Column('assigned_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id']),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_opportunity_assignments_id'), 'student_opportunity_assignments', ['id'], unique=False)
    op.create_index(op.f('ix_student_opportunity_assignments_student_id'), 'student_opportunity_assignments', ['student_id'], unique=False)


def downgrade() -> None:
    op.drop_table('student_opportunity_assignments')
    op.drop_table('counselor_interventions')
    op.drop_table('student_documents')
    op.drop_table('skill_badges')
    op.drop_table('opportunity_applications')
    op.drop_table('opportunities')
    op.drop_table('pathway_milestones')
    op.drop_table('pathways')
    op.drop_table('careers')
    op.drop_table('student_profiles')
