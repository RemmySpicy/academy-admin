"""
Test configuration and fixtures for Academy Admin system tests.

This module provides common test fixtures and configuration for all test modules.
"""

import pytest
from typing import Generator, Any
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import tempfile
import os
from datetime import datetime, date

# Import application components
from app.main import app
from app.core.database import get_db, Base
from app.core.auth import create_access_token
from app.features.users.models.user import User
from app.features.students.models.student import Student
from app.features.courses.models.program import Program
from app.features.organizations.models.organization import Organization


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_academy.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def test_db() -> Generator[Session, None, None]:
    """Create a test database session."""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        # Clean up - drop all tables
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(test_db: Session) -> Generator[Session, None, None]:
    """Create a database session for each test function."""
    
    # Start a transaction
    transaction = test_db.begin()
    
    try:
        yield test_db
    finally:
        # Rollback transaction to clean up
        transaction.rollback()


def override_get_db(test_db: Session):
    """Override the database dependency for testing."""
    def _get_db():
        try:
            yield test_db
        finally:
            pass
    return _get_db


@pytest.fixture(scope="function")
def client(test_db: Session) -> TestClient:
    """Create a test client with database dependency override."""
    
    # Override database dependency
    app.dependency_overrides[get_db] = override_get_db(test_db)
    
    client = TestClient(app)
    
    yield client
    
    # Clean up
    app.dependency_overrides.clear()


# User and authentication fixtures
@pytest.fixture
def create_test_user(test_db: Session):
    """Create a test user."""
    def _create_user(
        full_name: str = "Test User",
        email: str = "test@example.com",
        role: str = "student",
        profile_type: str = "full_user"
    ) -> User:
        user = User(
            full_name=full_name,
            email=email,
            role=role,
            profile_type=profile_type,
            is_active=True,
            created_at=datetime.utcnow()
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        return user
    
    return _create_user


@pytest.fixture
def super_admin_user(create_test_user) -> User:
    """Create a super admin user."""
    return create_test_user(
        full_name="Super Admin",
        email="admin@academy.com",
        role="super_admin"
    )


@pytest.fixture
def program_admin_user(create_test_user) -> User:
    """Create a program admin user."""
    return create_test_user(
        full_name="Program Admin",
        email="program.admin@academy.com",
        role="program_admin"
    )


@pytest.fixture
def super_admin_token(super_admin_user: User) -> str:
    """Create an access token for super admin."""
    return create_access_token(
        data={"sub": super_admin_user.email, "user_id": super_admin_user.id}
    )


@pytest.fixture
def program_admin_token(program_admin_user: User) -> str:
    """Create an access token for program admin."""
    return create_access_token(
        data={"sub": program_admin_user.email, "user_id": program_admin_user.id}
    )


# Program and organization fixtures
@pytest.fixture
def create_test_program(test_db: Session):
    """Create a test program."""
    def _create_program(
        name: str = "Test Program",
        description: str = "Test program description",
        status: str = "active"
    ) -> Program:
        program = Program(
            name=name,
            description=description,
            status=status,
            created_at=datetime.utcnow()
        )
        test_db.add(program)
        test_db.commit()
        test_db.refresh(program)
        return program
    
    return _create_program


@pytest.fixture
def test_program(create_test_program) -> Program:
    """Create a default test program."""
    return create_test_program()


@pytest.fixture
def create_test_organization(test_db: Session, test_program: Program):
    """Create a test organization."""
    def _create_organization(
        name: str = "Test Organization",
        organization_type: str = "school",
        is_partner: bool = True
    ) -> Organization:
        org = Organization(
            name=name,
            organization_type=organization_type,
            program_id=test_program.id,
            is_partner=is_partner,
            contact_email="test@organization.com",
            created_at=datetime.utcnow()
        )
        test_db.add(org)
        test_db.commit()
        test_db.refresh(org)
        return org
    
    return _create_organization


@pytest.fixture
def test_organization(create_test_organization) -> Organization:
    """Create a default test organization."""
    return create_test_organization()


# Student fixtures
@pytest.fixture
def create_test_student(test_db: Session, test_program: Program):
    """Create a test student."""
    def _create_student(
        user: User,
        enrollment_date: date = None
    ) -> Student:
        if enrollment_date is None:
            enrollment_date = date.today()
            
        student = Student(
            user_id=user.id,
            program_id=test_program.id,
            enrollment_date=enrollment_date,
            status="active"
        )
        test_db.add(student)
        test_db.commit()
        test_db.refresh(student)
        return student
    
    return _create_student


# Mock data fixtures
@pytest.fixture
def mock_student_data():
    """Mock data for student creation."""
    return {
        "profile_type": "independent",
        "organization_type": "individual",
        "basic_info": {
            "full_name": "Mock Student",
            "date_of_birth": "2010-05-15",
            "email": "mock.student@test.com",
            "phone": "+234 801 234 5678"
        },
        "address": {
            "street": "123 Test Street",
            "city": "Lagos",
            "state": "Lagos State",
            "country": "Nigeria"
        },
        "emergency_contact": {
            "name": "Emergency Contact",
            "phone": "+234 802 345 6789",
            "relationship": "Guardian"
        },
        "enrollment_info": {
            "course_ids": [],
            "preferred_schedule": "Weekday evenings",
            "medical_conditions": "None",
            "special_requirements": "None"
        }
    }


@pytest.fixture
def mock_parent_data():
    """Mock data for parent creation."""
    return {
        "basic_info": {
            "full_name": "Mock Parent",
            "email": "mock.parent@test.com",
            "phone": "+234 803 456 7890"
        },
        "address": {
            "street": "456 Parent Avenue",
            "city": "Lagos",
            "state": "Lagos State",
            "country": "Nigeria"
        },
        "children_assignments": [],
        "organization_info": {
            "type": "individual"
        }
    }


@pytest.fixture
def mock_organization_data():
    """Mock data for organization creation."""
    return {
        "basic_info": {
            "name": "Mock Organization",
            "organization_type": "school",
            "description": "Mock organization for testing",
            "website": "https://mock.org",
            "registration_number": "RC123456"
        },
        "contact_info": {
            "contact_email": "contact@mock.org",
            "contact_phone": "+234 804 567 8901",
            "contact_person_name": "Contact Person",
            "contact_person_title": "Director"
        },
        "address": {
            "street": "789 Organization Street",
            "city": "Lagos",
            "state": "Lagos State",
            "postal_code": "100001",
            "country": "Nigeria"
        },
        "partnership_details": {
            "is_partner": True,
            "monthly_budget": 500000,
            "sponsorship_type": "full",
            "max_students": 20,
            "partnership_start_date": "2024-01-01"
        },
        "additional_info": {
            "member_count": 100,
            "additional_notes": "Test organization notes"
        }
    }


# Utility fixtures
@pytest.fixture
def temp_file():
    """Create a temporary file for testing."""
    fd, path = tempfile.mkstemp()
    
    yield path
    
    # Cleanup
    os.close(fd)
    os.unlink(path)


@pytest.fixture
def mock_api_responses():
    """Mock API response data."""
    return {
        "success_response": {
            "success": True,
            "data": {"id": "test-id", "message": "Operation successful"},
            "message": "Request completed successfully"
        },
        "error_response": {
            "success": False,
            "error": "Test error message",
            "details": "Detailed error information"
        },
        "validation_error": {
            "detail": [
                {
                    "loc": ["body", "field_name"],
                    "msg": "field required",
                    "type": "value_error.missing"
                }
            ]
        }
    }


# Database utility functions
def clear_database(db: Session):
    """Clear all data from test database."""
    # Delete in order to respect foreign key constraints
    db.query(Student).delete()
    db.query(Organization).delete()
    db.query(User).delete()
    db.query(Program).delete()
    db.commit()


def create_full_test_data(db: Session) -> dict:
    """Create a complete set of test data."""
    
    # Create program
    program = Program(
        name="Full Test Program",
        description="Complete test program",
        status="active",
        created_at=datetime.utcnow()
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    
    # Create organization
    organization = Organization(
        name="Full Test Organization",
        organization_type="school",
        program_id=program.id,
        is_partner=True,
        contact_email="full.test@org.com",
        created_at=datetime.utcnow()
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    
    # Create users
    admin_user = User(
        full_name="Full Test Admin",
        email="admin@fulltest.com",
        role="super_admin",
        profile_type="full_user",
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    student_user = User(
        full_name="Full Test Student",
        email="student@fulltest.com",
        role="student",
        profile_type="full_user",
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    parent_user = User(
        full_name="Full Test Parent",
        email="parent@fulltest.com",
        role="parent",
        profile_type="full_user",
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add_all([admin_user, student_user, parent_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(student_user)
    db.refresh(parent_user)
    
    # Create student
    student = Student(
        user_id=student_user.id,
        program_id=program.id,
        enrollment_date=date.today(),
        status="active"
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return {
        "program": program,
        "organization": organization,
        "admin_user": admin_user,
        "student_user": student_user,
        "parent_user": parent_user,
        "student": student
    }


# Performance testing utilities
@pytest.fixture
def performance_timer():
    """Timer for performance testing."""
    import time
    
    def timer():
        start_time = time.time()
        return lambda: time.time() - start_time
    
    return timer


# Async test utilities
@pytest.fixture
def async_client(client: TestClient):
    """Async version of test client."""
    return client


# Configuration overrides for testing
@pytest.fixture(autouse=True)
def test_settings():
    """Override settings for testing."""
    import os
    
    # Set test-specific environment variables
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = SQLALCHEMY_DATABASE_URL
    
    yield
    
    # Cleanup
    if "TESTING" in os.environ:
        del os.environ["TESTING"]