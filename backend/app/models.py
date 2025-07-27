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

# Import program models  
from app.features.programs.models.program import Program

# Import separated models
from app.features.courses.models.course import Course
from app.features.curricula.models.curriculum import Curriculum
from app.features.curricula.models.level import Level
from app.features.curricula.models.module import Module
from app.features.curricula.models.section import Section
from app.features.content.models.lesson import Lesson
from app.features.content.models.assessment import AssessmentRubric, AssessmentCriteria
from app.features.equipment.models.equipment import EquipmentRequirement
from app.features.media.models.media import MediaLibrary
from app.features.content.models.content_version import ContentVersion

# Import progression system models
from app.features.progression.models.progression import (
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