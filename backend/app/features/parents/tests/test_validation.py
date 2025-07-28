"""
Tests for parent and family validation utilities.

Comprehensive test suite for validation functions, business rules,
and error handling in parent and family management.
"""

import pytest
from datetime import date, datetime
from fastapi import HTTPException

from app.features.parents.utils.validation import (
    ParentValidator,
    FamilyValidator,
    ValidationUtils,
    ParentValidationError,
    FamilyValidationError
)
from app.features.parents.schemas.family_creation import (
    ParentWithChildrenCreate,
    MultiParentFamily,
    RelationshipSettings,
    EnhancedStudentCreate,
    FamilyCreationType
)
from app.features.parents.schemas.parent import ParentCreate


class TestParentValidator:
    """Test class for ParentValidator functionality."""
    
    def test_validate_email_valid(self):
        """Test email validation with valid emails."""
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.org",
            "123@numbers.com",
            None,  # None should be valid (optional)
            ""     # Empty string should be valid (optional)
        ]
        
        for email in valid_emails:
            assert ParentValidator.validate_email(email) is True
    
    def test_validate_email_invalid(self):
        """Test email validation with invalid emails."""
        invalid_emails = [
            "invalid-email",
            "test@",
            "@domain.com",
            "test..email@domain.com",
            "test@domain",
            "test@.com",
            "test email@domain.com"
        ]
        
        for email in invalid_emails:
            assert ParentValidator.validate_email(email) is False
    
    def test_validate_phone_valid(self):
        """Test phone validation with valid phone numbers."""
        valid_phones = [
            "+1234567890",
            "123-456-7890",
            "(123) 456-7890",
            "123.456.7890",
            "1234567890",
            "+44 20 7946 0958",
            None,  # None should be valid (optional)
            ""     # Empty string should be valid (optional)
        ]
        
        for phone in valid_phones:
            assert ParentValidator.validate_phone(phone) is True
    
    def test_validate_phone_invalid(self):
        """Test phone validation with invalid phone numbers."""
        invalid_phones = [
            "123",          # Too short
            "12345678901234567890",  # Too long
            "abcdefghij",   # No digits
            "123-45",       # Too short with formatting
        ]
        
        for phone in invalid_phones:
            assert ParentValidator.validate_phone(phone) is False
    
    def test_validate_password_strength_valid(self):
        """Test password strength validation with strong passwords."""
        strong_passwords = [
            "StrongPass123!",
            "MySecure@Pass456",
            "Complex#Password789",
            None,  # None should be valid (optional)
            ""     # Empty string should be valid (optional)
        ]
        
        for password in strong_passwords[:3]:  # Skip None and empty
            is_valid, issues = ParentValidator.validate_password_strength(password)
            assert is_valid is True
            assert len(issues) == 0
        
        # Test None and empty separately
        is_valid, issues = ParentValidator.validate_password_strength(None)
        assert is_valid is True
        assert len(issues) == 0
        
        is_valid, issues = ParentValidator.validate_password_strength("")
        assert is_valid is True
        assert len(issues) == 0
    
    def test_validate_password_strength_weak(self):
        """Test password strength validation with weak passwords."""
        weak_passwords = [
            ("weak", ["Password must be at least 8 characters long", 
                     "Password must contain at least one uppercase letter",
                     "Password must contain at least one digit",
                     "Password must contain at least one special character"]),
            ("nouppercase123!", ["Password must contain at least one uppercase letter"]),
            ("NOLOWERCASE123!", ["Password must contain at least one lowercase letter"]),
            ("NoDigitsHere!", ["Password must contain at least one digit"]),
            ("NoSpecialChars123", ["Password must contain at least one special character"])
        ]
        
        for password, expected_issues in weak_passwords:
            is_valid, issues = ParentValidator.validate_password_strength(password)
            assert is_valid is False
            for expected_issue in expected_issues:
                assert expected_issue in issues
    
    def test_validate_date_of_birth_parent(self):
        """Test date of birth validation for parents."""
        today = date.today()
        
        # Valid parent ages (16+)
        valid_dates = [
            date(today.year - 16, today.month, today.day),  # Exactly 16
            date(today.year - 25, today.month, today.day),  # 25 years old
            date(today.year - 45, today.month, today.day),  # 45 years old
        ]
        
        for dob in valid_dates:
            assert ParentValidator.validate_date_of_birth(dob, "parent") is True
        
        # Invalid parent ages (under 16)
        invalid_dates = [
            date(today.year - 15, today.month, today.day),  # 15 years old
            date(today.year - 10, today.month, today.day),  # 10 years old
            date(today.year + 1, today.month, today.day),   # Future date
        ]
        
        for dob in invalid_dates:
            assert ParentValidator.validate_date_of_birth(dob, "parent") is False
    
    def test_validate_date_of_birth_student(self):
        """Test date of birth validation for students."""
        today = date.today()
        
        # Valid student ages (3-25)
        valid_dates = [
            date(today.year - 3, today.month, today.day),   # 3 years old
            date(today.year - 10, today.month, today.day),  # 10 years old
            date(today.year - 25, today.month, today.day),  # 25 years old
        ]
        
        for dob in valid_dates:
            assert ParentValidator.validate_date_of_birth(dob, "student") is True
        
        # Invalid student ages (outside 3-25 range)
        invalid_dates = [
            date(today.year - 2, today.month, today.day),   # 2 years old
            date(today.year - 26, today.month, today.day),  # 26 years old
            date(today.year + 1, today.month, today.day),   # Future date
        ]
        
        for dob in invalid_dates:
            assert ParentValidator.validate_date_of_birth(dob, "student") is False
    
    def test_validate_parent_data_complete(self):
        """Test parent data validation with complete, valid data."""
        valid_parent_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "SecurePass123!",
            "phone": "+1234567890",
            "date_of_birth": date(1985, 5, 15)
        }
        
        issues = ParentValidator.validate_parent_data(valid_parent_data)
        assert len(issues) == 0
    
    def test_validate_parent_data_missing_required(self):
        """Test parent data validation with missing required fields."""
        incomplete_parent_data = {
            "first_name": "",  # Missing
            "last_name": "Doe",
            "email": "",       # Missing
            "password": ""     # Missing
        }
        
        issues = ParentValidator.validate_parent_data(incomplete_parent_data)
        
        expected_issues = [
            "First Name is required",
            "Email is required", 
            "Password is required"
        ]
        
        for expected_issue in expected_issues:
            assert any(expected_issue in issue for issue in issues)
    
    def test_validate_student_data_complete(self):
        """Test student data validation with complete, valid data."""
        valid_student_data = {
            "first_name": "Emma",
            "last_name": "Johnson",
            "date_of_birth": date(2015, 3, 15),
            "email": "emma@example.com",
            "medical_conditions": "None",
            "dietary_restrictions": "Vegetarian"
        }
        
        issues = ParentValidator.validate_student_data(valid_student_data)
        assert len(issues) == 0
    
    def test_validate_student_data_missing_required(self):
        """Test student data validation with missing required fields."""
        incomplete_student_data = {
            "first_name": "",  # Missing
            "last_name": "",   # Missing
            "date_of_birth": None  # Missing
        }
        
        issues = ParentValidator.validate_student_data(incomplete_student_data)
        
        expected_issues = [
            "First Name is required",
            "Last Name is required",
            "Date Of Birth is required"
        ]
        
        for expected_issue in expected_issues:
            assert any(expected_issue in issue for issue in issues)


class TestFamilyValidator:
    """Test class for FamilyValidator functionality."""
    
    @pytest.fixture
    def valid_parent_data(self):
        """Valid parent data for testing."""
        return ParentCreate(
            username="test.parent",
            email="test@example.com",
            password="SecurePass123!",
            first_name="Test",
            last_name="Parent",
            salutation="Mr.",
            phone="+1234567890",
            date_of_birth=date(1985, 1, 1)
        )
    
    @pytest.fixture
    def valid_student_data(self):
        """Valid student data for testing."""
        return EnhancedStudentCreate(
            first_name="Test",
            last_name="Student",
            date_of_birth=date(2015, 1, 1),
            relationship_settings=RelationshipSettings()
        )
    
    def test_validate_parent_with_children_create_valid(self, valid_parent_data, valid_student_data):
        """Test validation of valid parent with children data."""
        family_data = ParentWithChildrenCreate(
            parent_data=valid_parent_data,
            children_data=[valid_student_data]
        )
        
        issues = FamilyValidator.validate_parent_with_children_create(family_data)
        assert len(issues) == 0
    
    def test_validate_parent_with_children_create_no_children(self, valid_parent_data):
        """Test validation of parent without children (should be valid)."""
        family_data = ParentWithChildrenCreate(
            parent_data=valid_parent_data,
            children_data=[]
        )
        
        issues = FamilyValidator.validate_parent_with_children_create(family_data)
        assert len(issues) == 0
    
    def test_validate_parent_with_children_create_too_many_children(self, valid_parent_data, valid_student_data):
        """Test validation with too many children."""
        # Create 11 children (over the limit of 10)
        children_data = [valid_student_data] * 11
        
        family_data = ParentWithChildrenCreate(
            parent_data=valid_parent_data,
            children_data=children_data
        )
        
        issues = FamilyValidator.validate_parent_with_children_create(family_data)
        assert any("Cannot create more than 10 children at once" in issue for issue in issues)
    
    def test_validate_parent_with_children_create_organization_sponsored_missing_id(self, valid_parent_data, valid_student_data):
        """Test validation of organization sponsored family without organization ID."""
        family_data = ParentWithChildrenCreate(
            creation_type=FamilyCreationType.ORGANIZATION_SPONSORED,
            parent_data=valid_parent_data,
            children_data=[valid_student_data],
            organization_id=None  # Missing required organization ID
        )
        
        issues = FamilyValidator.validate_parent_with_children_create(family_data)
        assert any("Organization ID is required for organization sponsored families" in issue for issue in issues)
    
    def test_validate_multi_parent_family_valid(self):
        """Test validation of valid multi-parent family."""
        parent1 = ParentCreate(
            username="parent1", email="parent1@test.com", password="Pass123!",
            first_name="Parent", last_name="One", date_of_birth=date(1980, 1, 1)
        )
        parent2 = ParentCreate(
            username="parent2", email="parent2@test.com", password="Pass123!",
            first_name="Parent", last_name="Two", date_of_birth=date(1982, 1, 1)
        )
        child = EnhancedStudentCreate(
            first_name="Child", last_name="Test", date_of_birth=date(2015, 1, 1)
        )
        
        multi_parent_data = MultiParentFamily(
            parents_data=[parent1, parent2],
            children_data=[child],
            parent_child_mappings=[
                {"parent_index": 0, "child_index": 0},
                {"parent_index": 1, "child_index": 0}
            ]
        )
        
        issues = FamilyValidator.validate_multi_parent_family(multi_parent_data)
        assert len(issues) == 0
    
    def test_validate_multi_parent_family_too_few_parents(self, valid_student_data):
        """Test validation of multi-parent family with too few parents."""
        parent1 = ParentCreate(
            username="parent1", email="parent1@test.com", password="Pass123!",
            first_name="Parent", last_name="One", date_of_birth=date(1980, 1, 1)
        )
        
        multi_parent_data = MultiParentFamily(
            parents_data=[parent1],  # Only one parent
            children_data=[valid_student_data],
            parent_child_mappings=[{"parent_index": 0, "child_index": 0}]
        )
        
        issues = FamilyValidator.validate_multi_parent_family(multi_parent_data)
        assert any("Multi-parent family must have at least 2 parents" in issue for issue in issues)
    
    def test_validate_multi_parent_family_invalid_mappings(self, valid_student_data):
        """Test validation of multi-parent family with invalid parent-child mappings."""
        parent1 = ParentCreate(
            username="parent1", email="parent1@test.com", password="Pass123!",
            first_name="Parent", last_name="One", date_of_birth=date(1980, 1, 1)
        )
        parent2 = ParentCreate(
            username="parent2", email="parent2@test.com", password="Pass123!",
            first_name="Parent", last_name="Two", date_of_birth=date(1982, 1, 1)
        )
        
        multi_parent_data = MultiParentFamily(
            parents_data=[parent1, parent2],
            children_data=[valid_student_data],
            parent_child_mappings=[
                {"parent_index": 5, "child_index": 0},  # Invalid parent index
                {"parent_index": 0, "child_index": 5}   # Invalid child index
            ]
        )
        
        issues = FamilyValidator.validate_multi_parent_family(multi_parent_data)
        assert any("parent_index 5 is out of range" in issue for issue in issues)
        assert any("child_index 5 is out of range" in issue for issue in issues)
    
    def test_validate_multi_parent_family_unmapped_child(self, valid_student_data):
        """Test validation of multi-parent family with unmapped child."""
        parent1 = ParentCreate(
            username="parent1", email="parent1@test.com", password="Pass123!",
            first_name="Parent", last_name="One", date_of_birth=date(1980, 1, 1)
        )
        parent2 = ParentCreate(
            username="parent2", email="parent2@test.com", password="Pass123!",
            first_name="Parent", last_name="Two", date_of_birth=date(1982, 1, 1)
        )
        
        multi_parent_data = MultiParentFamily(
            parents_data=[parent1, parent2],
            children_data=[valid_student_data],
            parent_child_mappings=[]  # No mappings - child has no parents
        )
        
        issues = FamilyValidator.validate_multi_parent_family(multi_parent_data)
        assert any("Child 1 has no parent relationships defined" in issue for issue in issues)
    
    def test_validate_relationship_settings_valid(self):
        """Test validation of valid relationship settings."""
        settings = RelationshipSettings(
            can_pickup=True,
            is_emergency_contact=True,
            has_payment_responsibility=True,
            pickup_notes="Some notes",
            special_instructions="Some instructions"
        )
        
        issues = FamilyValidator.validate_relationship_settings(settings)
        assert len(issues) == 0
    
    def test_validate_relationship_settings_warning(self):
        """Test validation of relationship settings that generate warnings."""
        settings = RelationshipSettings(
            can_pickup=True,
            is_emergency_contact=False,      # Not emergency contact
            has_payment_responsibility=True, # But has payment responsibility
            pickup_notes="Some notes",
            special_instructions="Some instructions"
        )
        
        issues = FamilyValidator.validate_relationship_settings(settings)
        assert any("Non-emergency contacts typically should not have payment responsibility" in issue for issue in issues)
    
    def test_validate_relationship_settings_too_long_notes(self):
        """Test validation of relationship settings with notes that are too long."""
        settings = RelationshipSettings(
            pickup_notes="x" * 501,  # Over 500 character limit
            special_instructions="x" * 1001  # Over 1000 character limit
        )
        
        issues = FamilyValidator.validate_relationship_settings(settings)
        assert any("Pickup notes cannot exceed 500 characters" in issue for issue in issues)
        assert any("Special instructions cannot exceed 1000 characters" in issue for issue in issues)
    
    def test_validate_family_member_uniqueness_valid(self):
        """Test validation of family with unique member information."""
        family_data = {
            "parent_data": {
                "email": "parent@test.com",
                "username": "parent_user"
            },
            "children_data": [
                {
                    "email": "child1@test.com",
                    "username": "child1_user"
                },
                {
                    "email": "child2@test.com",
                    "username": "child2_user"
                }
            ]
        }
        
        issues = FamilyValidator.validate_family_member_uniqueness(family_data)
        assert len(issues) == 0
    
    def test_validate_family_member_uniqueness_duplicate_email(self):
        """Test validation of family with duplicate emails."""
        family_data = {
            "parent_data": {
                "email": "duplicate@test.com",
                "username": "parent_user"
            },
            "children_data": [
                {
                    "email": "duplicate@test.com",  # Duplicate email
                    "username": "child1_user"
                }
            ]
        }
        
        issues = FamilyValidator.validate_family_member_uniqueness(family_data)
        assert any("Duplicate email found: duplicate@test.com" in issue for issue in issues)
    
    def test_validate_family_member_uniqueness_duplicate_username(self):
        """Test validation of family with duplicate usernames."""
        family_data = {
            "parents_data": [
                {
                    "email": "parent1@test.com",
                    "username": "duplicate_user"
                },
                {
                    "email": "parent2@test.com",
                    "username": "duplicate_user"  # Duplicate username
                }
            ]
        }
        
        issues = FamilyValidator.validate_family_member_uniqueness(family_data)
        assert any("Duplicate username found: duplicate_user" in issue for issue in issues)


class TestValidationUtils:
    """Test class for ValidationUtils functionality."""
    
    def test_raise_validation_error_with_issues(self):
        """Test raising validation error when issues exist."""
        issues = ["Issue 1", "Issue 2", "Issue 3"]
        
        with pytest.raises(HTTPException) as exc_info:
            ValidationUtils.raise_validation_error(issues, "test operation")
        
        assert exc_info.value.status_code == 400
        assert "Validation failed for test operation" in str(exc_info.value.detail)
        assert "Issue 1" in str(exc_info.value.detail)
        assert "Issue 2" in str(exc_info.value.detail)
        assert "Issue 3" in str(exc_info.value.detail)
    
    def test_raise_validation_error_no_issues(self):
        """Test not raising validation error when no issues exist."""
        issues = []
        
        # Should not raise an exception
        ValidationUtils.raise_validation_error(issues, "test operation")
    
    def test_sanitize_input_valid(self):
        """Test input sanitization with various inputs."""
        test_cases = [
            ("  hello world  ", "hello world"),
            ("multiple   spaces", "multiple spaces"),
            ("normal text", "normal text"),
            ("", ""),
            (None, "")
        ]
        
        for input_text, expected_output in test_cases:
            result = ValidationUtils.sanitize_input(input_text)
            assert result == expected_output
    
    def test_validate_program_context_valid(self):
        """Test program context validation with valid UUIDs."""
        valid_contexts = [
            "123e4567-e89b-12d3-a456-426614174000",
            "550e8400-e29b-41d4-a716-446655440000",
            "00000000-0000-0000-0000-000000000000"
        ]
        
        for context in valid_contexts:
            assert ValidationUtils.validate_program_context(context) is True
    
    def test_validate_program_context_invalid(self):
        """Test program context validation with invalid inputs."""
        invalid_contexts = [
            "not-a-uuid",
            "123e4567-e89b-12d3-a456",  # Too short
            "123e4567-e89b-12d3-a456-426614174000-extra",  # Too long
            "",
            None
        ]
        
        for context in invalid_contexts:
            assert ValidationUtils.validate_program_context(context) is False
    
    def test_format_validation_summary_valid(self):
        """Test formatting validation summary with no issues."""
        issues = []
        
        summary = ValidationUtils.format_validation_summary(issues)
        
        assert summary["is_valid"] is True
        assert summary["issue_count"] == 0
        assert summary["issues"] == []
        assert summary["severity"] == "none"
    
    def test_format_validation_summary_invalid(self):
        """Test formatting validation summary with issues."""
        issues = ["Issue 1", "Issue 2"]
        
        summary = ValidationUtils.format_validation_summary(issues)
        
        assert summary["is_valid"] is False
        assert summary["issue_count"] == 2
        assert summary["issues"] == issues
        assert summary["severity"] == "error"