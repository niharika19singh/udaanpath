"""Access control: student access keys and facilitator accounts

Revision ID: 0002_access_control
Revises: 0001_initial_schema
Create Date: 2026-10-18 12:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '0002_access_control'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Existing profiles get no key, so only facilitators can open them.
    with op.batch_alter_table('student_profiles') as batch_op:
        batch_op.add_column(sa.Column('access_key_hash', sa.String(length=64), nullable=True))

    op.create_table(
        'facilitator_accounts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('full_name', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_facilitator_accounts_id'), 'facilitator_accounts', ['id'], unique=False)
    op.create_index(op.f('ix_facilitator_accounts_email'), 'facilitator_accounts', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_facilitator_accounts_email'), table_name='facilitator_accounts')
    op.drop_index(op.f('ix_facilitator_accounts_id'), table_name='facilitator_accounts')
    op.drop_table('facilitator_accounts')
    with op.batch_alter_table('student_profiles') as batch_op:
        batch_op.drop_column('access_key_hash')
