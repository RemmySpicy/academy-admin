"""
Enhanced user schemas for family relationships and multi-role management.
"""

from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator

from app.features.common.models.enums import UserRole, RelationshipType, EnrollmentStatus


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    date_of_birth: Optional[datetime] = Field(None)
    roles: List[str] = Field(default=["student"])
    is_active: bool = Field(default=True)
    
    @validator('roles')
    def validate_roles(cls, v):
        """Validate that all roles are valid."""
        valid_roles = [role.value for role in UserRole]
        for role in v:
            if role not in valid_roles:
                raise ValueError(f"Invalid role: {role}")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(None)
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    date_of_birth: Optional[datetime] = Field(None)
    profile_photo_url: Optional[str] = Field(None)
    is_active: Optional[bool] = Field(None)


class UserRelationshipCreate(BaseModel):
    """Schema for creating parent-child relationships."""
    
    parent_user_id: str = Field(...)
    child_user_id: str = Field(...)
    relationship_type: RelationshipType = Field(...)
    program_id: str = Field(..., description="Program ID this relationship belongs to")
    is_primary: bool = Field(default=False)
    emergency_contact: bool = Field(default=True)
    can_pick_up: bool = Field(default=True)
    notes: Optional[str] = Field(None, max_length=500)


class UserRelationshipResponse(BaseModel):
    """Schema for user relationship response."""
    
    id: str
    parent_user_id: str
    child_user_id: str
    relationship_type: RelationshipType
    program_id: str
    is_active: bool
    is_primary: bool
    emergency_contact: bool
    can_pick_up: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Related user information
    parent_user: Optional[Dict[str, Any]] = None
    child_user: Optional[Dict[str, Any]] = None
    program: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class CourseEnrollmentCreate(BaseModel):
    """Schema for creating course enrollments."""
    
    user_id: str = Field(...)
    course_id: str = Field(...)
    program_id: str = Field(...)
    enrollment_fee: Optional[float] = Field(None, ge=0)
    referral_source: Optional[str] = Field(None, max_length=100)
    special_requirements: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)


class CourseEnrollmentResponse(BaseModel):
    """Schema for course enrollment response."""
    
    id: str
    user_id: str
    student_id: Optional[str]
    course_id: str
    program_id: str
    enrollment_date: date
    start_date: Optional[date]
    completion_date: Optional[date]
    status: EnrollmentStatus
    progress_percentage: Optional[float]
    enrollment_fee: Optional[float]
    amount_paid: Optional[float]
    outstanding_balance: Optional[float]
    referral_source: Optional[str]
    special_requirements: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Related information
    user: Optional[Dict[str, Any]] = None
    course: Optional[Dict[str, Any]] = None
    program: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """Enhanced schema for user response with family relationships."""
    
    id: str
    username: str
    email: str
    full_name: str
    phone: Optional[str]
    date_of_birth: Optional[datetime]
    profile_photo_url: Optional[str]
    roles: List[str]
    primary_role: str
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Family relationships
    children: List[Dict[str, Any]] = Field(default=[])
    parents: List[Dict[str, Any]] = Field(default=[])
    
    # Course enrollments
    active_enrollments: List[CourseEnrollmentResponse] = Field(default=[])
    
    # Student profile (if exists)
    student_profile: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True
    
    @property
    def display_roles(self) -> str:
        """Get comma-separated display of roles."""
        return ", ".join([role.replace("_", " ").title() for role in self.roles])
    
    @property
    def is_parent(self) -> bool:
        """Check if user is a parent."""
        return UserRole.PARENT.value in self.roles
    
    @property
    def is_student(self) -> bool:
        """Check if user is a student."""
        return UserRole.STUDENT.value in self.roles


class FamilyStructureResponse(BaseModel):
    """Schema for complete family structure."""
    
    user: UserResponse
    children: List[Dict[str, Any]] = Field(default=[])
    parents: List[Dict[str, Any]] = Field(default=[])
    relationships: List[UserRelationshipResponse] = Field(default=[])


class StudentParentCreate(BaseModel):
    """Schema for creating a parent with associated child (student)."""
    
    # Parent information
    parent_username: str = Field(..., min_length=3, max_length=50)
    parent_email: EmailStr = Field(...)
    parent_password: str = Field(..., min_length=8)
    parent_full_name: str = Field(..., min_length=1, max_length=200)
    parent_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    parent_date_of_birth: Optional[datetime] = Field(None)
    
    # Child information
    child_username: str = Field(..., min_length=3, max_length=50)
    child_email: EmailStr = Field(...)
    child_password: str = Field(..., min_length=8)
    child_full_name: str = Field(..., min_length=1, max_length=200)
    child_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    child_date_of_birth: Optional[datetime] = Field(None)
    
    # Relationship
    relationship_type: RelationshipType = Field(default=RelationshipType.GUARDIAN)
    
    # Course enrollment (optional)
    course_id: Optional[str] = Field(None)
    program_id: str = Field(...)


class UserSearchParams(BaseModel):
    """Parameters for user search."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255)
    roles: Optional[List[str]] = Field(None)
    is_active: Optional[bool] = Field(None)
    has_children: Optional[bool] = Field(None)
    has_parents: Optional[bool] = Field(None)
    program_id: Optional[str] = Field(None)
    sort_by: Optional[str] = Field(None)
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$")


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""
    
    items: List[UserResponse] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_prev: bool = Field(..., description="Whether there is a previous page")


class ParentStatsResponse(BaseModel):
    """Schema for parent statistics response."""
    
    total_parents: int = Field(..., description="Total number of parents")
    active_parents: int = Field(..., description="Number of active parents")
    inactive_parents: int = Field(..., description="Number of inactive parents")
    parents_with_children: int = Field(..., description="Number of parents with children")
    parents_without_children: int = Field(..., description="Number of parents without children")
    total_children_connections: int = Field(..., description="Total number of parent-child relationships")
    parents_with_multiple_children: int = Field(..., description="Number of parents with multiple children")
    average_children_per_parent: float = Field(..., description="Average number of children per parent")