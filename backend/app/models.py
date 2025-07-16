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
from app.features.authentication.models.user_program_assignment import UserProgramAssignment

# Import curriculum models
from app.features.curriculum.models.program import Program
from app.features.curriculum.models.course import Course
from app.features.curriculum.models.curriculum import Curriculum
from app.features.curriculum.models.level import Level
from app.features.curriculum.models.module import Module
from app.features.curriculum.models.section import Section
from app.features.curriculum.models.lesson import Lesson
from app.features.curriculum.models.assessment import AssessmentRubric, AssessmentCriteria
from app.features.curriculum.models.equipment import EquipmentRequirement
from app.features.curriculum.models.media import MediaLibrary
from app.features.curriculum.models.content_version import ContentVersion

# This ensures all models are imported and available for Alembic
__all__ = [
    "Base",
    "BaseModel", 
    "TimestampMixin",
    "Student",
    "User",
    "UserProgramAssignment",
    "Program",
    "Course",
    "Curriculum",
    "Level",
    "Module",
    "Section",
    "Lesson",
    "AssessmentRubric",
    "AssessmentCriteria",
    "EquipmentRequirement",
    "MediaLibrary",
    "ContentVersion",
]