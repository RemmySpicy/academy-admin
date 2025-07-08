"""
All models import for Alembic migrations.

This module imports all models so that Alembic can detect them
for auto-generating migrations.
"""

# Import base models
from app.features.common.models.base import BaseModel, TimestampMixin
from app.features.common.models.database import Base

# Import all model classes
from app.features.students.models.student import Student
from app.features.authentication.models.user import User

# This ensures all models are imported and available for Alembic
__all__ = [
    "Base",
    "BaseModel", 
    "TimestampMixin",
    "Student",
    "User",
]