"""Add missing fields for lesson and assessment forms

Revision ID: add_lesson_assessment_fields
Revises: 32a29d4d228c
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250115_lesson_assess'
down_revision = '20250123_rename_preset'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing fields to lessons table
    op.add_column('lessons', sa.Column('is_required', sa.Boolean(), nullable=True, default=True))
    op.add_column('lessons', sa.Column('resource_links', postgresql.JSON(astext_type=sa.Text()), nullable=True, default='[]'))
    op.add_column('lessons', sa.Column('lesson_types', postgresql.JSON(astext_type=sa.Text()), nullable=True, default='[]'))
    
    # Add missing fields to assessment_rubrics table
    op.add_column('assessment_rubrics', sa.Column('difficulty_level', sa.String(length=50), nullable=True))
    op.add_column('assessment_rubrics', sa.Column('assessment_type', sa.String(length=50), nullable=True))
    op.add_column('assessment_rubrics', sa.Column('assessment_guide', sa.Text(), nullable=True))
    op.add_column('assessment_rubrics', sa.Column('is_required', sa.Boolean(), nullable=True, default=True))
    
    # Set default values for existing records
    op.execute("UPDATE lessons SET is_required = true WHERE is_required IS NULL")
    op.execute("UPDATE lessons SET resource_links = '[]' WHERE resource_links IS NULL")
    op.execute("UPDATE lessons SET lesson_types = '[]' WHERE lesson_types IS NULL")
    op.execute("UPDATE assessment_rubrics SET is_required = true WHERE is_required IS NULL")
    
    # Make is_required not nullable
    op.alter_column('lessons', 'is_required', nullable=False)
    op.alter_column('assessment_rubrics', 'is_required', nullable=False)


def downgrade():
    # Remove added columns
    op.drop_column('assessment_rubrics', 'is_required')
    op.drop_column('assessment_rubrics', 'assessment_guide')
    op.drop_column('assessment_rubrics', 'assessment_type')
    op.drop_column('assessment_rubrics', 'difficulty_level')
    op.drop_column('lessons', 'lesson_types')
    op.drop_column('lessons', 'resource_links')
    op.drop_column('lessons', 'is_required')