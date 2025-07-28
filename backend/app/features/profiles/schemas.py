"""
Unified Profile Creation Schemas

Schemas for creating complex multi-profile scenarios including students with parents,
organization memberships, and relationships.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import date


class StudentProfileData(BaseModel):
    """Student profile data for unified creation."""
    
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    salutation: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None)  # Optional for children
    password: Optional[str] = Field(None, min_length=6)  # Optional for children
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    date_of_birth: Optional[str] = Field(None)  # ISO date string
    referral_source: Optional[str] = Field(None, max_length=100)
    emergency_contact_name: Optional[str] = Field(None, max_length=200)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    medical_notes: Optional[str] = Field(None)
    additional_notes: Optional[str] = Field(None)


class ParentRelationshipData(BaseModel):
    """Parent relationship data."""
    
    parent_id: str = Field(..., description="ID of existing parent")
    relationship_type: str = Field(..., regex="^(father|mother|guardian|stepfather|stepmother|grandparent|other)$")
    is_primary_contact: bool = Field(default=True)
    can_pickup: bool = Field(default=True)
    emergency_contact: bool = Field(default=True)


class OrganizationSponsorshipData(BaseModel):
    """Organization sponsorship data."""
    
    organization_id: str = Field(..., description="ID of sponsoring organization")
    payment_override: Optional[Dict[str, Any]] = Field(None, description="Payment override settings")


class ProfileCreationRequest(BaseModel):
    """Unified profile creation request."""
    
    creation_mode: str = Field(..., regex="^(independent_student|student_with_parent)$")
    organization_mode: str = Field(..., regex="^(individual|organization)$")
    program_id: str = Field(..., description="Target program ID")
    
    profile_data: Dict[str, Any] = Field(..., description="Profile data based on creation mode")
    
    @validator('profile_data')
    def validate_profile_data(cls, v, values):
        """Validate profile data structure based on creation mode."""
        creation_mode = values.get('creation_mode')
        organization_mode = values.get('organization_mode')
        
        # Validate student data exists
        if 'student' not in v:
            raise ValueError('Student data is required')
        
        # Validate parent relationship for student_with_parent mode
        if creation_mode == 'student_with_parent':
            if 'parent_relationship' not in v:
                raise ValueError('Parent relationship data is required for student_with_parent mode')
        
        # Validate organization data for organization mode
        if organization_mode == 'organization':
            if 'organization_id' not in v:
                raise ValueError('Organization ID is required for organization mode')
        
        # Validate email/password for independent students
        student_data = v.get('student', {})
        create_login = v.get('create_login_credentials', False)
        
        if creation_mode == 'independent_student' and create_login:
            if not student_data.get('email'):
                raise ValueError('Email is required for independent students with login credentials')
            if not student_data.get('password'):
                raise ValueError('Password is required for independent students with login credentials')
        
        return v


class ProfileCreationResponse(BaseModel):
    """Response for profile creation."""
    
    success: bool = Field(..., description="Whether creation was successful")
    data: Optional[Dict[str, Any]] = Field(None, description="Created profile data")
    error: Optional[str] = Field(None, description="Error message if creation failed")
    
    student_id: Optional[str] = Field(None, description="Created student ID")
    user_id: Optional[str] = Field(None, description="Created user ID")
    relationships: Optional[List[str]] = Field(None, description="Created relationship IDs")
    memberships: Optional[List[str]] = Field(None, description="Created membership IDs")