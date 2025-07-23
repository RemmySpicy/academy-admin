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
from app.features.courses.models.program import Program
from app.features.courses.models.course import Course
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.level import Level
from app.features.courses.models.module import Module
from app.features.courses.models.section import Section
from app.features.courses.models.lesson import Lesson
from app.features.courses.models.assessment import AssessmentRubric, AssessmentCriteria
from app.features.courses.models.equipment import EquipmentRequirement
from app.features.courses.models.media import MediaLibrary
from app.features.courses.models.content_version import ContentVersion

# Import progression system models
from app.features.courses.models.progression import (
    CurriculumProgressionSettings,
    LevelAssessmentCriteria, 
    StudentLessonProgress,
    StudentModuleUnlock,
    StudentLevelAssessment,
    ProgressionAnalytics
)

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
    "CurriculumProgressionSettings",
    "LevelAssessmentCriteria", 
    "StudentLessonProgress",
    "StudentModuleUnlock",
    "StudentLevelAssessment",
    "ProgressionAnalytics",
]