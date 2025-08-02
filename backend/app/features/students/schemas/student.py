"""
Student-specific schemas for API requests and responses.
"""

from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator

from app.features.students.schemas.common import (
    GenderEnum,
    SalutationEnum,
    PaginatedResponse,
    TimestampMixin,
)
from app.features.common.models.enums import StudentStatus


class StudentBase(BaseModel):
    """Base student schema with common fields."""
    
    first_name: str = Field(..., min_length=1, max_length=100, description="Student's first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Student's last name")
    email: Optional[EmailStr] = Field(None, description="Student's email address (optional for children)")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Student's phone number")
    date_of_birth: date = Field(..., description="Student's date of birth")
    gender: Optional[GenderEnum] = Field(None, description="Student's gender")
    salutation: Optional[SalutationEnum] = Field(None, description="Student's salutation")
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format."""
        if v is not None:
            import re
            # Remove all non-digit characters
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits_only) > 15:
                raise ValueError('Phone number cannot exceed 15 digits')
        return v
    
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        """Validate date of birth is not in the future."""
        from datetime import date
        if v > date.today():
            raise ValueError('Date of birth cannot be in the future')
        return v


class StudentAddressBase(BaseModel):
    """Student address information."""
    
    line1: Optional[str] = Field(None, max_length=255, description="Address line 1")
    line2: Optional[str] = Field(None, max_length=255, description="Address line 2")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State/Province")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    country: Optional[str] = Field(None, max_length=100, description="Country")


class StudentEmergencyContact(BaseModel):
    """Emergency contact information."""
    
    name: Optional[str] = Field(None, max_length=200, description="Emergency contact name")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Emergency contact phone")
    relationship: Optional[str] = Field(None, max_length=50, description="Relationship to student")
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format."""
        if v is not None:
            import re
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits_only) > 15:
                raise ValueError('Phone number cannot exceed 15 digits')
        return v


class StudentMedicalInfo(BaseModel):
    """Medical information for student."""
    
    conditions: Optional[str] = Field(None, description="Medical conditions")
    medications: Optional[str] = Field(None, description="Current medications")
    allergies: Optional[str] = Field(None, description="Known allergies")


class StudentCreate(StudentBase):
    """Schema for creating a new student."""
    
    # Academy information
    program_id: str = Field(..., description="Program ID this student belongs to")
    referral_source: Optional[str] = Field(None, max_length=100, description="How student heard about academy")
    enrollment_date: date = Field(..., description="Date of enrollment")
    status: str = Field(default="active", description="Student status")
    
    # Address information
    address: Optional[StudentAddressBase] = Field(None, description="Student address")
    
    # Emergency contact
    emergency_contact: Optional[StudentEmergencyContact] = Field(None, description="Emergency contact info")
    
    # Medical information
    medical_info: Optional[StudentMedicalInfo] = Field(None, description="Medical information")
    
    # Additional notes
    notes: Optional[str] = Field(None, description="Additional notes about student")
    
    @validator('enrollment_date')
    def validate_enrollment_date(cls, v):
        """Validate enrollment date is not in the future."""
        from datetime import date
        if v > date.today():
            raise ValueError('Enrollment date cannot be in the future')
        return v


class StudentUpdate(BaseModel):
    """Schema for updating student information."""
    
    # Personal information
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    date_of_birth: Optional[date] = Field(None)
    gender: Optional[GenderEnum] = Field(None)
    salutation: Optional[SalutationEnum] = Field(None)
    
    # Academy information
    referral_source: Optional[str] = Field(None, max_length=100)
    enrollment_date: Optional[date] = Field(None)
    status: Optional[StudentStatus] = Field(None)
    
    # Address information
    address: Optional[StudentAddressBase] = Field(None)
    
    # Emergency contact
    emergency_contact: Optional[StudentEmergencyContact] = Field(None)
    
    # Medical information
    medical_info: Optional[StudentMedicalInfo] = Field(None)
    
    # Additional notes
    notes: Optional[str] = Field(None)
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format."""
        if v is not None:
            import re
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits_only) > 15:
                raise ValueError('Phone number cannot exceed 15 digits')
        return v
    
    @validator('date_of_birth')
    def validate_date_of_birth(cls, v):
        """Validate date of birth is not in the future."""
        if v is not None:
            from datetime import date
            if v > date.today():
                raise ValueError('Date of birth cannot be in the future')
        return v
    
    @validator('enrollment_date')
    def validate_enrollment_date(cls, v):
        """Validate enrollment date is not in the future."""
        if v is not None:
            from datetime import date
            if v > date.today():
                raise ValueError('Enrollment date cannot be in the future')
        return v


class StudentResponse(StudentBase, TimestampMixin):
    """Schema for student response."""
    
    id: str = Field(..., description="Student ID (UUID)")
    student_id: str = Field(..., description="Student ID (STU-YYYY-NNNN)")
    
    # Academy information
    program_id: str = Field(..., description="Program ID this student belongs to")
    program_name: Optional[str] = Field(None, description="Program name")
    referral_source: Optional[str] = Field(None, description="How student heard about academy")
    enrollment_date: date = Field(..., description="Date of enrollment")
    status: str = Field(..., description="Student status")
    
    # Address information
    address: Optional[Dict[str, Any]] = Field(None, description="Student address")
    
    # Emergency contact information
    emergency_contact_name: Optional[str] = Field(None, description="Emergency contact name")
    emergency_contact_phone: Optional[str] = Field(None, description="Emergency contact phone")
    emergency_contact_relationship: Optional[str] = Field(None, description="Emergency contact relationship")
    
    # Medical information
    medical_conditions: Optional[str] = Field(None, description="Medical conditions")
    medications: Optional[str] = Field(None, description="Current medications")
    allergies: Optional[str] = Field(None, description="Known allergies")
    
    # Additional information
    notes: Optional[str] = Field(None, description="Additional notes")
    
    # Enrollment information (populated from course_enrollments)
    facility_name: Optional[str] = Field(None, description="Facility name where student is enrolled")
    course_name: Optional[str] = Field(None, description="Course name student is enrolled in")
    current_level: Optional[int] = Field(None, description="Current level/stage in course")
    current_module: Optional[int] = Field(None, description="Current module within level")
    completed_sessions: Optional[int] = Field(None, description="Number of completed sessions")
    total_sessions: Optional[int] = Field(None, description="Total sessions in course")
    payment_status: Optional[str] = Field(None, description="Payment status (fully_paid, partially_paid, not_paid)")
    progress_percentage: Optional[float] = Field(None, description="Course progress percentage")
    outstanding_balance: Optional[float] = Field(None, description="Outstanding balance for course")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "student_id": "STU-2025-0001",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com",
                "phone": "555-123-4567",
                "date_of_birth": "2010-05-15",
                "gender": "male",
                "salutation": "Mr",
                "referral_source": "Website",
                "enrollment_date": "2025-01-01",
                "status": "active",
                "address": {
                    "line1": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "postal_code": "12345",
                    "country": "US"
                },
                "emergency_contact_name": "Jane Doe",
                "emergency_contact_phone": "555-987-6543",
                "emergency_contact_relationship": "Mother",
                "medical_conditions": "None",
                "medications": "None",
                "allergies": "None",
                "notes": "Great student",
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z"
            }
        }
    
    @property
    def full_name(self) -> str:
        """Get student's full name."""
        if self.salutation:
            return f"{self.salutation} {self.first_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> Optional[int]:
        """Calculate student's current age."""
        if not self.date_of_birth:
            return None
        
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class StudentListResponse(PaginatedResponse):
    """Schema for paginated student list response."""
    
    items: List[StudentResponse] = Field(..., description="List of students")


class StudentSearchParams(BaseModel):
    """Parameters for student search."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    status: Optional[StudentStatus] = Field(None, description="Filter by status")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    enrollment_date_from: Optional[date] = Field(None, description="Filter by enrollment date from")
    enrollment_date_to: Optional[date] = Field(None, description="Filter by enrollment date to")
    age_from: Optional[int] = Field(None, ge=0, le=120, description="Filter by age from")
    age_to: Optional[int] = Field(None, ge=0, le=120, description="Filter by age to")
    gender: Optional[GenderEnum] = Field(None, description="Filter by gender")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class StudentBulkAction(BaseModel):
    """Schema for bulk student actions."""
    
    student_ids: List[str] = Field(..., min_items=1, description="List of student IDs")
    action: str = Field(..., description="Action to perform")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Additional parameters")


class StudentBulkActionResponse(BaseModel):
    """Schema for bulk student action response."""
    
    successful: List[str] = Field(..., description="Successfully processed student IDs")
    failed: List[Dict[str, Any]] = Field(..., description="Failed items with error details")
    total_processed: int = Field(..., description="Total students processed")
    total_successful: int = Field(..., description="Total successful operations")
    total_failed: int = Field(..., description="Total failed operations")


class StudentStatsResponse(BaseModel):
    """Schema for student statistics response - updated for assignment-based architecture."""
    
    total_students: int = Field(..., description="Total number of student profiles")
    students_with_enrollments: int = Field(..., description="Number of students with active course enrollments")
    active_course_enrollments: int = Field(..., description="Total active course enrollments in system")
    paused_course_enrollments: int = Field(..., description="Total paused course enrollments in system")
    recent_student_profiles: int = Field(..., description="Student profiles created in last 30 days")
    
    # Individual status counts for frontend compatibility
    active_students: int = Field(0, description="Number of active students")
    pending_students: int = Field(0, description="Number of pending students")
    inactive_students: int = Field(0, description="Number of inactive students")
    suspended_students: int = Field(0, description="Number of suspended students")
    
    # Detailed breakdowns
    students_by_status: Dict[str, int] = Field(..., description="Students grouped by status")
    students_by_gender: Dict[str, int] = Field(..., description="Students grouped by gender")
    students_by_age_group: Dict[str, int] = Field(..., description="Students grouped by age ranges")
    students_with_parent_relationships: int = Field(..., description="Number of students who have parent relationships")
    total_parent_child_relationships: int = Field(..., description="Total parent-child relationships")
    average_enrollments_per_student: float = Field(..., description="Average course enrollments per student")