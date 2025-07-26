"""
Pydantic schemas for partner admin authentication and management.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict

from app.features.common.models.enums import ProfileType


# Authentication schemas
class PartnerAdminLogin(BaseModel):
    """Schema for partner admin login."""
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class PartnerAdminCreate(BaseModel):
    """Schema for creating a partner admin."""
    organization_id: str = Field(..., description="Organization ID this admin will manage")
    programs: List[str] = Field(..., min_items=1, description="Program IDs this admin can manage")
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    profile_photo_url: Optional[str] = Field(None, max_length=500)


class PartnerAdminUpdate(BaseModel):
    """Schema for updating partner admin."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    profile_photo_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class PartnerAdminResponse(BaseModel):
    """Schema for partner admin response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    username: str
    email: Optional[str] = None
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_photo_url: Optional[str] = None
    profile_type: ProfileType
    roles: List[str]
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class OrganizationContext(BaseModel):
    """Organization context for partner admin."""
    organization_id: str
    organization_name: str
    program_id: str
    membership_id: str


class PartnerAdminLoginResponse(BaseModel):
    """Response schema for partner admin login."""
    access_token: str
    token_type: str
    user: PartnerAdminResponse
    organizations: List[OrganizationContext]


# Permissions schemas
class PartnerPermissionsResponse(BaseModel):
    """Schema for partner admin permissions."""
    has_access: bool
    organization_id: str
    organization_name: str
    program_id: str
    can_view_students: bool
    can_manage_students: bool
    can_view_enrollments: bool
    can_manage_enrollments: bool
    can_view_payments: bool
    can_manage_payments: bool
    can_view_reports: bool
    can_export_data: bool
    can_manage_organization_settings: bool
    custom_permissions: Dict[str, Any]


# Student management schemas
class StudentMembershipInfo(BaseModel):
    """Student organization membership info."""
    id: str
    membership_type: str
    is_sponsored: bool
    start_date: str
    end_date: Optional[str] = None
    is_active: bool
    custom_pricing: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PartnerStudentInfo(BaseModel):
    """Student information for partner admin."""
    user_id: str
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: str
    phone: Optional[str] = None
    profile_type: str
    roles: List[str]
    is_active: bool
    membership: StudentMembershipInfo


class PartnerStudentsResponse(BaseModel):
    """Response schema for partner students."""
    students: List[PartnerStudentInfo]
    total_count: int


# Statistics schemas
class OrganizationInfo(BaseModel):
    """Organization information."""
    id: str
    name: str
    status: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None


class PartnerStatistics(BaseModel):
    """Partner organization statistics."""
    total_members: int
    active_members: int
    sponsored_members: int
    recent_enrollments: int
    sponsorship_rate: float


class PartnerStatsResponse(BaseModel):
    """Response schema for partner statistics."""
    organization: OrganizationInfo
    program_id: str
    statistics: PartnerStatistics


# List response schemas
class PartnerAdminListItem(BaseModel):
    """Partner admin list item."""
    user: Dict[str, Any]
    organization: Dict[str, Any]
    membership: Dict[str, Any]


class PartnerAdminListResponse(BaseModel):
    """Response schema for partner admin list."""
    admins: List[PartnerAdminListItem]
    total_count: int


# API response schemas
class ApiResponse(BaseModel):
    """Standard API response schema."""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None