"""Add first_name and last_name fields to users table

Revision ID: 20250726_add_first_last_name_to_users
Revises: 20250726_session_types
Create Date: 2025-07-26 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250726_add_name_fields'
down_revision = '20250726_session_types'
branch_labels = None
depends_on = None


def upgrade():
    """Add first_name and last_name fields to users table and migrate existing data."""
    
    # Add new columns as nullable initially
    op.add_column('users', sa.Column('first_name', sa.String(100), nullable=True, comment="User's first name"))
    op.add_column('users', sa.Column('last_name', sa.String(100), nullable=True, comment="User's last name"))
    
    # Migrate existing full_name data to first_name and last_name
    op.execute("""
        UPDATE users SET 
            first_name = CASE 
                WHEN position(' ' in full_name) > 0 
                THEN substring(full_name from 1 for position(' ' in full_name) - 1)
                ELSE full_name
            END,
            last_name = CASE 
                WHEN position(' ' in full_name) > 0 
                THEN substring(full_name from position(' ' in full_name) + 1)
                ELSE ''
            END
        WHERE full_name IS NOT NULL AND first_name IS NULL;
    """)
    
    # Handle edge cases where full_name is null or empty
    op.execute("""
        UPDATE users SET 
            first_name = COALESCE(first_name, ''),
            last_name = COALESCE(last_name, '')
        WHERE first_name IS NULL OR last_name IS NULL;
    """)
    
    # Make fields non-nullable after migration
    op.alter_column('users', 'first_name', nullable=False)
    op.alter_column('users', 'last_name', nullable=False)
    
    # Add indexes for performance
    op.create_index('idx_users_first_name', 'users', ['first_name'])
    op.create_index('idx_users_last_name', 'users', ['last_name'])
    op.create_index('idx_users_full_name_computed', 'users', [sa.text("(first_name || ' ' || last_name)")])


def downgrade():
    """Remove first_name and last_name fields and restore full_name data."""
    
    # Drop indexes
    op.drop_index('idx_users_full_name_computed', 'users')
    op.drop_index('idx_users_last_name', 'users')
    op.drop_index('idx_users_first_name', 'users')
    
    # Restore full_name from first_name and last_name if needed
    op.execute("""
        UPDATE users SET 
            full_name = CASE 
                WHEN last_name != '' 
                THEN first_name || ' ' || last_name
                ELSE first_name
            END
        WHERE full_name IS NULL OR full_name = '';
    """)
    
    # Drop the new columns
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')