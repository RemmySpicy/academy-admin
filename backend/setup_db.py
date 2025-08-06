#!/usr/bin/env python3
"""
Setup database with tables and admin user
"""
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from app.core.config import settings
from app.features.common.models.base import Base

# Import all models to ensure proper SQLAlchemy relationships
# Authentication & Users
from app.features.authentication.models.user import User
from app.features.authentication.models.user_relationship import UserRelationship
from app.features.authentication.models.user_program_assignment import UserProgramAssignment

# Core Domain Models
from app.features.programs.models.program import Program
from app.features.students.models.student import Student
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship

# Course & Curriculum Models
from app.features.courses.models.course import Course
from app.features.curricula.models.curriculum import Curriculum
from app.features.curricula.models.level import Level
from app.features.curricula.models.module import Module
from app.features.curricula.models.section import Section

# Enrollment & Assignment Models
from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.enrollments.models.program_assignment import ProgramAssignment

# Organization Models
from app.features.organizations.models.organization import Organization
from app.features.organizations.models.organization_membership import OrganizationMembership

# Facility Models
from app.features.facilities.models.facility import Facility
from app.features.facilities.models.facility_course_pricing import FacilityCoursePricing

# Content Models
from app.features.content.models.lesson import Lesson
from app.features.content.models.assessment import AssessmentRubric, AssessmentCriteria
from app.features.content.models.content_version import ContentVersion

# Media Models
from app.features.media.models.media import MediaLibrary

# Scheduling Models
from app.features.scheduling.models.scheduled_session import ScheduledSession
from app.features.scheduling.models.session_participant import SessionParticipant
from app.features.scheduling.models.session_instructor import SessionInstructor
from app.features.scheduling.models.instructor_availability import InstructorAvailability
from app.features.scheduling.models.facility_schedule_settings import FacilityScheduleSettings

# Equipment & Progression Models
from app.features.equipment.models.equipment import EquipmentRequirement
from app.features.progression.models.progression import (
    CurriculumProgressionSettings, LevelAssessmentCriteria, StudentLessonProgress,
    StudentModuleUnlock, StudentLevelAssessment, ProgressionAnalytics
)

# Create database engine
engine = create_engine(settings.DATABASE_URL)

# Create all tables
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin_user():
    """Create admin user"""
    db = SessionLocal()
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if existing_admin:
        print("Admin user already exists")
        db.close()
        return
    
    # Create password hash
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password_hash = pwd_context.hash("admin123")
    
    # Create admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        username="admin",
        email="admin@academy.com",
        password_hash=password_hash,
        first_name="System",
        last_name="Administrator",
        role="super_admin",
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.close()
    
    print("Admin user created successfully!")
    print("Username: admin")
    print("Email: admin@academy.com")
    print("Password: admin123")

if __name__ == "__main__":
    create_admin_user()