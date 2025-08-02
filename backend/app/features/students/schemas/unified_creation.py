"""
Unified Creation Schemas for streamlined user creation workflows.

These schemas support the unified creation endpoints for program administrators
to create students and parents with automatic program association.
"""

from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator


class UnifiedUserCreateData(BaseModel):
    """Base user data for unified creation workflows."""
    
    first_name: str = Field(..., min_length=1, max_length=100, description="User's first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="User's last name")
    email: Optional[EmailStr] = Field(None, description="User's email address")
    phone: Optional[str] = Field(None, max_length=20, description="User's phone number")
    date_of_birth: Optional[date] = Field(None, description="User's date of birth")
    referral_source: Optional[str] = Field(None, max_length=255, description="How they found the program")
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }


class UnifiedStudentProfileData(BaseModel):
    """Student profile data for unified creation."""
    
    address: Optional[str] = Field(None, max_length=500, description="Student's address")
    gender: Optional[str] = Field(None, max_length=20, description="Student's gender")
    
    # Emergency contact information
    emergency_contact_name: Optional[str] = Field(None, max_length=200, description="Emergency contact name")
    emergency_contact_phone: Optional[str] = Field(None, max_length=20, description="Emergency contact phone")
    emergency_contact_relationship: Optional[str] = Field(None, max_length=100, description="Relationship to student")
    
    # Medical information
    medical_conditions: Optional[str] = Field(None, description="Medical conditions")
    medications: Optional[str] = Field(None, description="Current medications")
    allergies: Optional[str] = Field(None, description="Known allergies")
    
    # Additional information
    notes: Optional[str] = Field(None, description="Additional notes about the student")
    enrollment_date: Optional[date] = Field(default_factory=date.today, description="Student enrollment date")
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }


class UnifiedParentProfileData(BaseModel):
    """Parent profile data for unified creation."""
    
    address: Optional[str] = Field(None, max_length=500, description="Parent's address")
    occupation: Optional[str] = Field(None, max_length=200, description="Parent's occupation")
    
    # Emergency contact information
    emergency_contact_name: Optional[str] = Field(None, max_length=200, description="Emergency contact name")
    emergency_contact_phone: Optional[str] = Field(None, max_length=20, description="Emergency contact phone")
    
    # Payment responsibility
    payment_responsibility: bool = Field(default=True, description="Whether parent has payment responsibility")


class UnifiedStudentCreateRequest(BaseModel):
    """Request schema for unified student creation."""
    
    user_data: UnifiedUserCreateData = Field(..., description="User account data")
    student_data: UnifiedStudentProfileData = Field(..., description="Student profile data")
    course_id: Optional[str] = Field(None, description="Optional course ID for immediate enrollment")
    password: Optional[str] = Field(None, min_length=6, description="Optional password (auto-generated if not provided)")
    
    @validator('password')
    def validate_password(cls, v):
        if v and len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


class UnifiedParentCreateRequest(BaseModel):
    """Request schema for unified parent creation."""
    
    user_data: UnifiedUserCreateData = Field(..., description="User account data")
    parent_data: UnifiedParentProfileData = Field(..., description="Parent profile data")
    child_student_ids: Optional[List[str]] = Field(None, description="Optional list of existing student IDs to link as children")
    password: str = Field(..., min_length=6, description="Password for parent account")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @validator('child_student_ids')
    def validate_child_student_ids(cls, v):
        if v and len(v) > 10:  # Reasonable limit
            raise ValueError('Cannot link more than 10 children at once')
        return v


class UserResponseData(BaseModel):
    """Response data for created user."""
    
    id: str
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    roles: List[str]
    is_active: bool


class StudentResponseData(BaseModel):
    """Response data for created student."""
    
    id: str
    student_id: str
    enrollment_date: Optional[str]
    status: str


class ParentResponseData(BaseModel):
    """Response data for created parent."""
    
    id: str
    program_id: str
    address: Optional[str]
    occupation: Optional[str]
    payment_responsibility: bool


class ProgramAssignmentResponseData(BaseModel):
    """Response data for program assignment."""
    
    id: str
    program_id: str
    role_in_program: str
    assignment_date: str
    is_active: bool


class CourseEnrollmentResponseData(BaseModel):
    """Response data for course enrollment."""
    
    id: str
    course_id: str
    status: str
    enrollment_date: str
    assignment_date: str


class ChildRelationshipResponseData(BaseModel):
    """Response data for parent-child relationship."""
    
    id: str
    student_id: str
    can_pickup: bool
    is_emergency_contact: bool
    has_payment_responsibility: bool


class UnifiedStudentCreateResponse(BaseModel):
    """Response schema for unified student creation."""
    
    success: bool
    message: str
    user: UserResponseData
    student: StudentResponseData
    program_assignment: ProgramAssignmentResponseData
    course_enrollment: Optional[CourseEnrollmentResponseData]


class UnifiedParentCreateResponse(BaseModel):
    """Response schema for unified parent creation."""
    
    success: bool
    message: str
    user: UserResponseData
    parent: ParentResponseData
    program_assignment: ProgramAssignmentResponseData
    child_relationships: List[ChildRelationshipResponseData]


class UnifiedCreationErrorResponse(BaseModel):
    """Error response schema for unified creation endpoints."""
    
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None
    validation_errors: Optional[Dict[str, List[str]]] = None