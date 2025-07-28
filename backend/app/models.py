"""
All models import for Alembic migrations.

This module imports all models so that Alembic can detect them
for auto-generating migrations. Models are organized by feature domain
for better maintainability and understanding.
"""

# ============================================================================
# BASE MODELS & INFRASTRUCTURE
# ============================================================================
from app.features.common.models.base import BaseModel, TimestampMixin
from app.features.common.models.database import Base


# ============================================================================
# PROGRAMS (TOP-LEVEL CONTEXT)
# ============================================================================
from app.features.programs.models.program import Program


# ============================================================================
# STUDENTS & PARENTS (CORE PROFILES)  
# ============================================================================
from app.features.students.models.student import Student
from app.features.students.models.course_enrollment import CourseEnrollment
from app.features.students.models.program_assignment import ProgramAssignment
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship


# ============================================================================
# AUTHENTICATION & USER MANAGEMENT
# ============================================================================
from app.features.authentication.models.user import User
from app.features.authentication.models.user_program_assignment import UserProgramAssignment
from app.features.authentication.models.user_relationship import UserRelationship


# ============================================================================
# ORGANIZATION MANAGEMENT
# ============================================================================
from app.features.organizations.models.organization import Organization
from app.features.organizations.models.organization_membership import OrganizationMembership


# ============================================================================
# COURSES & CURRICULUM HIERARCHY
# ============================================================================
from app.features.courses.models.course import Course
from app.features.curricula.models.curriculum import Curriculum
from app.features.curricula.models.level import Level
from app.features.curricula.models.module import Module
from app.features.curricula.models.section import Section


# ============================================================================
# CONTENT MANAGEMENT (LESSONS & ASSESSMENTS)
# ============================================================================
from app.features.content.models.lesson import Lesson
from app.features.content.models.assessment import AssessmentRubric, AssessmentCriteria
from app.features.content.models.content_version import ContentVersion


# ============================================================================
# EQUIPMENT & MEDIA RESOURCES
# ============================================================================
from app.features.equipment.models.equipment import EquipmentRequirement
from app.features.media.models.media import MediaLibrary


# ============================================================================
# FACILITIES & SCHEDULING
# ============================================================================
from app.features.facilities.models.facility import Facility
from app.features.scheduling.models.scheduled_session import ScheduledSession
from app.features.scheduling.models.session_participant import SessionParticipant
from app.features.scheduling.models.session_instructor import SessionInstructor
from app.features.scheduling.models.instructor_availability import InstructorAvailability
from app.features.scheduling.models.facility_schedule_settings import FacilityScheduleSettings


# ============================================================================
# PROGRESSION & ANALYTICS
# ============================================================================
from app.features.progression.models.progression import (
    CurriculumProgressionSettings,
    LevelAssessmentCriteria, 
    StudentLessonProgress,
    StudentModuleUnlock,
    StudentLevelAssessment,
    ProgressionAnalytics
)

# ============================================================================
# EXPORTED MODELS (Organized by Domain)
# ============================================================================

__all__ = [
    # Base Models & Infrastructure
    "Base",
    "BaseModel", 
    "TimestampMixin",
    
    # Authentication & User Management
    "User",
    "UserProgramAssignment",
    "UserRelationship",
    
    # Programs (Top-Level Context)
    "Program",
    
    # Students & Parents (Core Profiles)
    "Student",
    "CourseEnrollment",
    "ProgramAssignment",
    "Parent",
    "ParentChildRelationship",
    
    # Organization Management
    "Organization",
    "OrganizationMembership",
    
    # Courses & Curriculum Hierarchy
    "Course",
    "Curriculum",
    "Level",
    "Module",
    "Section",
    
    # Content Management (Lessons & Assessments)
    "Lesson",
    "AssessmentRubric",
    "AssessmentCriteria",
    "ContentVersion",
    
    # Equipment & Media Resources
    "EquipmentRequirement",
    "MediaLibrary",
    
    # Facilities & Scheduling
    "Facility",
    "ScheduledSession",
    "SessionParticipant",
    "SessionInstructor",
    "InstructorAvailability",
    "FacilityScheduleSettings",
    
    # Progression & Analytics
    "CurriculumProgressionSettings",
    "LevelAssessmentCriteria", 
    "StudentLessonProgress",
    "StudentModuleUnlock",
    "StudentLevelAssessment",
    "ProgressionAnalytics",
]