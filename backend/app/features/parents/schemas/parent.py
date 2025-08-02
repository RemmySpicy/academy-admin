"""
Parent-specific schemas for API requests and responses.
"""

from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator

from app.features.common.models.enums import Gender
from app.features.students.schemas.common import (
    PaginatedResponse,
    TimestampMixin,
)


class ParentBase(BaseModel):
    """Base parent schema with common fields."""
    
    first_name: str = Field(..., min_length=1, max_length=100, description="Parent's first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Parent's last name")
    email: EmailStr = Field(..., description="Parent's email address (required)")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Parent's phone number")
    date_of_birth: Optional[date] = Field(None, description="Parent's date of birth")
    gender: Optional[Gender] = Field(None, description="Parent's gender")
    salutation: Optional[str] = Field(None, max_length=10, description="Parent's salutation")
    
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
        if v is not None:
            from datetime import date
            if v > date.today():
                raise ValueError('Date of birth cannot be in the future')
        return v


class ParentAddressBase(BaseModel):
    """Parent address information."""
    
    line1: Optional[str] = Field(None, max_length=255, description="Address line 1")
    line2: Optional[str] = Field(None, max_length=255, description="Address line 2")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State/Province")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    country: Optional[str] = Field(None, max_length=100, description="Country")


class ParentEmergencyContact(BaseModel):
    """Emergency contact information for parent."""
    
    name: Optional[str] = Field(None, max_length=200, description="Emergency contact name")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Emergency contact phone")
    relationship: Optional[str] = Field(None, max_length=50, description="Relationship to parent")
    
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


class ParentCreate(ParentBase):
    """Schema for creating a new parent."""
    
    # Academy information
    program_id: str = Field(..., description="Program ID this parent belongs to")
    referral_source: Optional[str] = Field(None, max_length=100, description="How parent heard about academy")
    enrollment_date: Optional[date] = Field(None, description="Date of enrollment (defaults to today)")
    
    # Address information
    address: Optional[ParentAddressBase] = Field(None, description="Parent address")
    
    # Emergency contact
    emergency_contact: Optional[ParentEmergencyContact] = Field(None, description="Emergency contact info")
    
    # Additional information
    notes: Optional[str] = Field(None, description="Additional notes about parent")
    occupation: Optional[str] = Field(None, max_length=100, description="Parent's occupation")
    employer: Optional[str] = Field(None, max_length=100, description="Parent's employer")
    
    # Payment responsibility
    is_primary_payer: bool = Field(default=True, description="Whether parent is responsible for payments")
    
    # Authentication credentials (required for parents)
    password: str = Field(..., min_length=6, description="Password for login (required)")
    
    @validator('enrollment_date')
    def validate_enrollment_date(cls, v):
        """Set default enrollment date to today if not provided."""
        if v is None:
            from datetime import date
            return date.today()
        if v > date.today():
            raise ValueError('Enrollment date cannot be in the future')
        return v


class ParentUpdate(BaseModel):
    """Schema for updating parent information."""
    
    # Personal information
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    date_of_birth: Optional[date] = Field(None)
    gender: Optional[Gender] = Field(None)
    salutation: Optional[str] = Field(None, max_length=10)
    
    # Academy information
    referral_source: Optional[str] = Field(None, max_length=100)
    enrollment_date: Optional[date] = Field(None)
    
    # Address information
    address: Optional[ParentAddressBase] = Field(None)
    
    # Emergency contact
    emergency_contact: Optional[ParentEmergencyContact] = Field(None)
    
    # Additional information
    notes: Optional[str] = Field(None)
    occupation: Optional[str] = Field(None, max_length=100)
    employer: Optional[str] = Field(None, max_length=100)
    
    # Payment responsibility
    is_primary_payer: Optional[bool] = Field(None)
    
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


class ParentResponse(ParentBase, TimestampMixin):
    """Schema for parent response."""
    
    id: str = Field(..., description="Parent ID (UUID)")
    
    # Academy information
    program_id: str = Field(..., description="Program ID this parent belongs to")
    program_name: Optional[str] = Field(None, description="Program name")
    user_id: str = Field(..., description="User account ID")
    referral_source: Optional[str] = Field(None, description="How parent heard about academy")
    enrollment_date: date = Field(..., description="Date of enrollment")
    
    # Address information
    address: Optional[Dict[str, Any]] = Field(None, description="Parent address")
    
    # Emergency contact information
    emergency_contact_name: Optional[str] = Field(None, description="Emergency contact name")
    emergency_contact_phone: Optional[str] = Field(None, description="Emergency contact phone")
    emergency_contact_relationship: Optional[str] = Field(None, description="Emergency contact relationship")
    
    # Additional information
    notes: Optional[str] = Field(None, description="Additional notes")
    occupation: Optional[str] = Field(None, description="Parent's occupation")
    employer: Optional[str] = Field(None, description="Parent's employer")
    
    # Payment responsibility
    is_primary_payer: bool = Field(..., description="Whether parent is responsible for payments")
    
    # Children information (computed)
    children_count: int = Field(default=0, description="Number of children")
    primary_children_count: int = Field(default=0, description="Number of children where this is primary contact")
    
    # Financial information (computed from children's enrollments)
    outstanding_balance: Optional[float] = Field(default=0.0, description="Total outstanding balance from children's enrollments")
    status: Optional[str] = Field(default="Inactive", description="Parent status based on children's enrollment activity")
    last_payment_date: Optional[str] = Field(default="Never", description="Last payment date from children's enrollments")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane.doe@example.com",
                "phone": "555-123-4567",
                "date_of_birth": "1985-05-15",
                "gender": "female",
                "salutation": "Mrs.",
                "referral_source": "Website",
                "enrollment_date": "2025-01-01",
                "address": {
                    "line1": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "postal_code": "12345",
                    "country": "US"
                },
                "emergency_contact_name": "John Doe",
                "emergency_contact_phone": "555-987-6543",
                "emergency_contact_relationship": "Spouse",
                "notes": "Active parent volunteer",
                "occupation": "Teacher",
                "employer": "Local School District",
                "is_primary_payer": True,
                "children_count": 2,
                "primary_children_count": 2,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z"
            }
        }
    
    @property
    def full_name(self) -> str:
        """Get parent's full name."""
        if self.salutation:
            return f"{self.salutation} {self.first_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def display_name(self) -> str:
        """Get parent's display name."""
        return f"{self.first_name} {self.last_name[0]}." if self.last_name else self.first_name
    
    @property
    def age(self) -> Optional[int]:
        """Calculate parent's current age."""
        if not self.date_of_birth:
            return None
        
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class ParentListResponse(PaginatedResponse):
    """Schema for paginated parent list response."""
    
    items: List[ParentResponse] = Field(..., description="List of parents")


class ParentSearchParams(BaseModel):
    """Parameters for parent search."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    enrollment_date_from: Optional[date] = Field(None, description="Filter by enrollment date from")
    enrollment_date_to: Optional[date] = Field(None, description="Filter by enrollment date to")
    has_children: Optional[bool] = Field(None, description="Filter parents with/without children")
    is_primary_payer: Optional[bool] = Field(None, description="Filter by payment responsibility")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class ParentStatsResponse(BaseModel):
    """Schema for parent statistics response - updated for assignment-based architecture."""
    
    total_parents: int = Field(..., description="Total number of parent profiles")
    parents_with_relationships: int = Field(..., description="Number of parents with child relationships")  
    students_with_parents: int = Field(..., description="Number of students who have parent relationships")
    total_parent_child_relationships: int = Field(..., description="Total parent-child relationships")
    primary_payers: int = Field(..., description="Number of parents who are primary payers")
    parents_by_gender: Dict[str, int] = Field(..., description="Parents grouped by gender")
    parents_by_children_count: Dict[str, int] = Field(..., description="Parents grouped by number of children")
    recent_parent_profiles: int = Field(..., description="Parent profiles created in last 30 days")
    active_course_enrollments: int = Field(..., description="Active course enrollments in system")
    average_relationships_per_parent: float = Field(..., description="Average parent-child relationships per parent")
    
    # Additional fields for frontend compatibility
    active_parents: int = Field(..., description="Number of active parents (with children)")
    inactive_parents: int = Field(..., description="Number of inactive parents (without children)")
    parents_with_children: int = Field(..., description="Number of parents with children (mapped field)")
    avg_children_per_parent: float = Field(..., description="Average children per parent (mapped field)")