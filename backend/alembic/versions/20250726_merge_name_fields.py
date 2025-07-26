"""Merge migration heads for name fields and program config

Revision ID: 20250726_merge_name_fields
Revises: 20250726_add_first_last_name_to_users, 20250726_program_config
Create Date: 2025-07-26 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250726_merge_name_fields'
down_revision = ('20250726_add_name_fields', '20250726_program_config')
branch_labels = None
depends_on = None


def upgrade():
    """Merge migration - no changes needed."""
    pass


def downgrade():
    """Merge migration - no changes needed."""
    pass