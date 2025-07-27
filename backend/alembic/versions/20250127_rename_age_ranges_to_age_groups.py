"""Rename age_ranges to age_groups in courses table for consistency

Revision ID: 20250127_rename_age_ranges
Revises: 627afb1a8d93
Create Date: 2025-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250127_rename_age_ranges'
down_revision = '627afb1a8d93'
branch_labels = None
depends_on = None


def upgrade():
    """Rename age_ranges column to age_groups for terminology consistency."""
    # Rename the column from age_ranges to age_groups
    op.alter_column('courses', 'age_ranges', new_column_name='age_groups')
    
    # Update the comment to reflect the new name
    op.alter_column('courses', 'age_groups', 
                   comment='Available age groups for this course (must exist in program age_groups configuration)')


def downgrade():
    """Revert age_groups column back to age_ranges."""
    # Rename the column back from age_groups to age_ranges
    op.alter_column('courses', 'age_groups', new_column_name='age_ranges')
    
    # Update the comment back to the original
    op.alter_column('courses', 'age_ranges',
                   comment='Available age ranges for this course (must exist in program age_groups configuration)')