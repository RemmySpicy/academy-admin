"""Initial tables for students and users

Revision ID: 001
Revises: 
Create Date: 2025-01-08 18:18:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial tables."""
    
    # Create students table
    op.create_table(
        'students',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('student_id', sa.String(20), unique=True, nullable=False),
        sa.Column('salutation', sa.String(10), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('gender', sa.String(10), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('referral_source', sa.String(100), nullable=True),
        sa.Column('enrollment_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('emergency_contact_name', sa.String(200), nullable=True),
        sa.Column('emergency_contact_phone', sa.String(20), nullable=True),
        sa.Column('emergency_contact_relationship', sa.String(50), nullable=True),
        sa.Column('medical_conditions', sa.Text(), nullable=True),
        sa.Column('medications', sa.Text(), nullable=True),
        sa.Column('allergies', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.Column('updated_by', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    
    # Create indexes for students table
    op.create_index('idx_students_email', 'students', ['email'])
    op.create_index('idx_students_student_id', 'students', ['student_id'])
    op.create_index('idx_students_last_name', 'students', ['last_name'])
    op.create_index('idx_students_status', 'students', ['status'])
    op.create_index('idx_students_enrollment_date', 'students', ['enrollment_date'])
    op.create_index('idx_students_full_name', 'students', ['first_name', 'last_name'])
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('username', sa.String(50), unique=True, nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    
    # Create indexes for users table
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])


def downgrade() -> None:
    """Drop all tables."""
    
    # Drop indexes first
    op.drop_index('idx_users_role', 'users')
    op.drop_index('idx_users_email', 'users')
    op.drop_index('idx_users_username', 'users')
    
    op.drop_index('idx_students_full_name', 'students')
    op.drop_index('idx_students_enrollment_date', 'students')
    op.drop_index('idx_students_status', 'students')
    op.drop_index('idx_students_last_name', 'students')
    op.drop_index('idx_students_student_id', 'students')
    op.drop_index('idx_students_email', 'students')
    
    # Drop tables
    op.drop_table('users')
    op.drop_table('students')