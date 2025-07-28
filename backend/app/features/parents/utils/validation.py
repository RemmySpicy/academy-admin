"""
Parent and Family Validation Utilities

Comprehensive validation functions for parent management and family operations.
Provides business rule validation, data consistency checks, and error handling.
"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import date, datetime, timedelta
import re
from fastapi import HTTPException, status

from app.features.parents.schemas.family_creation import (
    ParentWithChildrenCreate,
    MultiParentFamily,
    EnhancedStudentCreate,
    RelationshipSettings
)


class ParentValidationError(Exception):
    """Custom exception for parent validation errors."""
    pass


class FamilyValidationError(Exception):
    """Custom exception for family validation errors."""
    pass


class ParentValidator:
    """Validator class for parent-related operations."""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        if not email:
            return True  # Email is optional for some profiles
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format."""
        if not phone:
            return True  # Phone is optional
        
        # Remove all non-digit characters
        digits_only = re.sub(r'[^\d]', '', phone)
        
        # Should have 10-15 digits
        return 10 <= len(digits_only) <= 15
    
    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, List[str]]:
        """Validate password strength and return issues."""
        if not password:
            return True, []  # Password is optional for some profiles
        
        issues = []
        
        if len(password) < 8:
            issues.append("Password must be at least 8 characters long")
        
        if not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            issues.append("Password must contain at least one digit")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            issues.append("Password must contain at least one special character")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def validate_date_of_birth(dob: date, profile_type: str = "parent") -> bool:
        """Validate date of birth based on profile type."""
        if not dob:
            return False
        
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        if profile_type == "parent":
            # Parents should be at least 16 years old
            return age >= 16
        elif profile_type == "student":
            # Students should be between 3 and 25 years old
            return 3 <= age <= 25
        
        return True
    
    @staticmethod
    def validate_parent_data(parent_data: Dict[str, Any]) -> List[str]:
        """Validate complete parent data and return list of issues."""
        issues = []
        
        # Required fields
        required_fields = ['first_name', 'last_name', 'email', 'password']
        for field in required_fields:
            if not parent_data.get(field):
                issues.append(f"{field.replace('_', ' ').title()} is required")
        
        # Email validation
        email = parent_data.get('email')
        if email and not ParentValidator.validate_email(email):
            issues.append("Invalid email format")
        
        # Phone validation
        phone = parent_data.get('phone')
        if phone and not ParentValidator.validate_phone(phone):
            issues.append("Invalid phone number format")
        
        # Password validation
        password = parent_data.get('password')
        if password:
            is_valid, password_issues = ParentValidator.validate_password_strength(password)
            if not is_valid:
                issues.extend(password_issues)
        
        # Date of birth validation
        dob = parent_data.get('date_of_birth')
        if dob and not ParentValidator.validate_date_of_birth(dob, "parent"):
            issues.append("Parent must be at least 16 years old")
        
        return issues
    
    @staticmethod
    def validate_student_data(student_data: Dict[str, Any]) -> List[str]:
        """Validate student data and return list of issues."""
        issues = []
        
        # Required fields
        required_fields = ['first_name', 'last_name', 'date_of_birth']
        for field in required_fields:
            if not student_data.get(field):
                issues.append(f"{field.replace('_', ' ').title()} is required")
        
        # Email validation (optional for students)
        email = student_data.get('email')
        if email and not ParentValidator.validate_email(email):
            issues.append("Invalid email format")
        
        # Date of birth validation
        dob = student_data.get('date_of_birth')
        if dob and not ParentValidator.validate_date_of_birth(dob, "student"):
            issues.append("Student must be between 3 and 25 years old")
        
        return issues


class FamilyValidator:
    """Validator class for family creation and management operations."""
    
    @staticmethod
    def validate_parent_with_children_create(family_data: ParentWithChildrenCreate) -> List[str]:
        """Validate parent with children creation data."""
        issues = []
        
        # Validate parent data
        parent_issues = ParentValidator.validate_parent_data(
            family_data.parent_data.model_dump()
        )
        issues.extend([f"Parent: {issue}" for issue in parent_issues])
        
        # Validate children data
        if not family_data.children_data:
            # Parent without children is valid
            pass
        else:
            for i, child_data in enumerate(family_data.children_data):
                child_issues = ParentValidator.validate_student_data(
                    child_data.model_dump(exclude={'relationship_settings', 'inherit_from_parent'})
                )
                issues.extend([f"Child {i+1}: {issue}" for issue in child_issues])
                
                # Validate relationship settings
                if child_data.relationship_settings:
                    relationship_issues = FamilyValidator.validate_relationship_settings(
                        child_data.relationship_settings
                    )
                    issues.extend([f"Child {i+1} relationship: {issue}" for issue in relationship_issues])
        
        # Business rule validations
        if len(family_data.children_data) > 10:
            issues.append("Cannot create more than 10 children at once")
        
        # Organization validation
        if family_data.creation_type.value == "organization_sponsored" and not family_data.organization_id:
            issues.append("Organization ID is required for organization sponsored families")
        
        return issues
    
    @staticmethod
    def validate_multi_parent_family(family_data: MultiParentFamily) -> List[str]:
        """Validate multi-parent family creation data."""
        issues = []
        
        # Validate each parent
        for i, parent_data in enumerate(family_data.parents_data):
            parent_issues = ParentValidator.validate_parent_data(
                parent_data.model_dump()
            )
            issues.extend([f"Parent {i+1}: {issue}" for issue in parent_issues])
        
        # Validate each child
        for i, child_data in enumerate(family_data.children_data):
            child_issues = ParentValidator.validate_student_data(
                child_data.model_dump(exclude={'relationship_settings', 'inherit_from_parent'})
            )
            issues.extend([f"Child {i+1}: {issue}" for issue in child_issues])
        
        # Validate parent-child mappings
        parents_count = len(family_data.parents_data)
        children_count = len(family_data.children_data)
        
        for i, mapping in enumerate(family_data.parent_child_mappings):
            parent_index = mapping.get('parent_index')
            child_index = mapping.get('child_index')
            
            if parent_index is None or child_index is None:
                issues.append(f"Mapping {i+1}: Both parent_index and child_index are required")
                continue
            
            if parent_index < 0 or parent_index >= parents_count:
                issues.append(f"Mapping {i+1}: parent_index {parent_index} is out of range")
            
            if child_index < 0 or child_index >= children_count:
                issues.append(f"Mapping {i+1}: child_index {child_index} is out of range")
        
        # Check that each child has at least one parent relationship
        mapped_children = set()
        for mapping in family_data.parent_child_mappings:
            child_index = mapping.get('child_index')
            if child_index is not None:
                mapped_children.add(child_index)
        
        for i in range(children_count):
            if i not in mapped_children:
                issues.append(f"Child {i+1} has no parent relationships defined")
        
        # Business rule validations
        if len(family_data.parents_data) < 2:
            issues.append("Multi-parent family must have at least 2 parents")
        
        if len(family_data.parents_data) > 4:
            issues.append("Multi-parent family cannot have more than 4 parents")
        
        return issues
    
    @staticmethod
    def validate_relationship_settings(settings: RelationshipSettings) -> List[str]:
        """Validate relationship settings."""
        issues = []
        
        # Business rule: If not emergency contact, probably shouldn't have payment responsibility
        if not settings.is_emergency_contact and settings.has_payment_responsibility:
            issues.append("Non-emergency contacts typically should not have payment responsibility")
        
        # Validate pickup notes length
        if settings.pickup_notes and len(settings.pickup_notes) > 500:
            issues.append("Pickup notes cannot exceed 500 characters")
        
        # Validate special instructions length
        if settings.special_instructions and len(settings.special_instructions) > 1000:
            issues.append("Special instructions cannot exceed 1000 characters")
        
        return issues
    
    @staticmethod
    def validate_family_member_uniqueness(family_data: Dict[str, Any]) -> List[str]:
        """Validate that family members don't have duplicate emails/usernames."""
        issues = []
        emails = []
        usernames = []
        
        # Check parent emails and usernames
        if 'parent_data' in family_data:
            parent = family_data['parent_data']
            if parent.get('email'):
                emails.append(parent['email'])
            if parent.get('username'):
                usernames.append(parent['username'])
        
        if 'parents_data' in family_data:
            for i, parent in enumerate(family_data['parents_data']):
                if parent.get('email'):
                    if parent['email'] in emails:
                        issues.append(f"Duplicate email found: {parent['email']}")
                    emails.append(parent['email'])
                
                if parent.get('username'):
                    if parent['username'] in usernames:
                        issues.append(f"Duplicate username found: {parent['username']}")
                    usernames.append(parent['username'])
        
        # Check children emails and usernames
        if 'children_data' in family_data:
            for i, child in enumerate(family_data['children_data']):
                if child.get('email'):
                    if child['email'] in emails:
                        issues.append(f"Duplicate email found: {child['email']}")
                    emails.append(child['email'])
                
                if child.get('username'):
                    if child['username'] in usernames:
                        issues.append(f"Duplicate username found: {child['username']}")
                    usernames.append(child['username'])
        
        return issues


class ValidationUtils:
    """Utility functions for validation operations."""
    
    @staticmethod
    def raise_validation_error(issues: List[str], operation: str = "operation"):
        """Raise HTTPException with validation issues."""
        if issues:
            error_message = f"Validation failed for {operation}:\n" + "\n".join(f"- {issue}" for issue in issues)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Sanitize text input to prevent common issues."""
        if not text:
            return ""
        
        # Strip whitespace
        text = text.strip()
        
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        return text
    
    @staticmethod
    def validate_program_context(program_context: str) -> bool:
        """Validate program context format."""
        if not program_context:
            return False
        
        # Basic UUID format check
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return bool(re.match(uuid_pattern, program_context, re.IGNORECASE))
    
    @staticmethod
    def format_validation_summary(issues: List[str]) -> Dict[str, Any]:
        """Format validation issues into a structured response."""
        return {
            "is_valid": len(issues) == 0,
            "issue_count": len(issues),
            "issues": issues,
            "severity": "error" if issues else "none"
        }