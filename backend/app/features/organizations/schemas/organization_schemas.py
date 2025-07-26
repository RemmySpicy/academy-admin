"""
Pydantic schemas for organization management.
"""

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict

from app.features.common.models.enums import OrganizationStatus, MembershipType, ProfileType


# Base schemas
class AddressData(BaseModel):
    """Address data schema."""
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "NG"


# Organization schemas
class OrganizationBase(BaseModel):
    """Base organization schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    contact_name: Optional[str] = Field(None, max_length=200)
    contact_email: Optional[str] = Field(None, max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=20)
    website: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    """Schema for creating an organization."""
    address_data: Optional[AddressData] = None
    payment_overrides: Optional[Dict[str, Any]] = None
    program_permissions: Optional[Dict[str, Any]] = None


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    contact_name: Optional[str] = Field(None, max_length=200)
    contact_email: Optional[str] = Field(None, max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=20)
    website: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None
    status: Optional[OrganizationStatus] = None
    address_data: Optional[AddressData] = None
    payment_overrides: Optional[Dict[str, Any]] = None
    program_permissions: Optional[Dict[str, Any]] = None


class OrganizationResponse(OrganizationBase):
    """Schema for organization response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    status: OrganizationStatus
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    payment_overrides: Optional[Dict[str, Any]] = None
    program_permissions: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    @property
    def full_address(self) -> str:
        """Get formatted full address."""
        address_parts = []
        
        if self.address_line1:
            address_parts.append(self.address_line1)
        if self.address_line2:
            address_parts.append(self.address_line2)
        if self.city:
            city_part = self.city
            if self.state:
                city_part += f", {self.state}"
            if self.postal_code:
                city_part += f" {self.postal_code}"
            address_parts.append(city_part)
        if self.country:
            address_parts.append(self.country)
            
        return "\n".join(address_parts)


# Organization membership schemas
class OrganizationMembershipBase(BaseModel):
    """Base organization membership schema."""
    membership_type: MembershipType = MembershipType.SPONSORED
    is_sponsored: bool = True
    notes: Optional[str] = Field(None, max_length=500)


class OrganizationMembershipCreate(OrganizationMembershipBase):
    """Schema for creating an organization membership."""
    user_id: str
    organization_id: str
    program_id: str
    custom_pricing: Optional[Dict[str, Any]] = None
    override_permissions: Optional[Dict[str, Any]] = None


class OrganizationMembershipUpdate(BaseModel):
    """Schema for updating an organization membership."""
    membership_type: Optional[MembershipType] = None
    is_sponsored: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=500)
    custom_pricing: Optional[Dict[str, Any]] = None
    override_permissions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    end_date: Optional[date] = None


class UserInfo(BaseModel):
    """Basic user information for membership responses."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: str
    profile_type: ProfileType
    roles: List[str]


class OrganizationMembershipResponse(OrganizationMembershipBase):
    """Schema for organization membership response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    organization_id: str
    program_id: str
    custom_pricing: Optional[Dict[str, Any]] = None
    override_permissions: Optional[Dict[str, Any]] = None
    start_date: date
    end_date: Optional[date] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Related data
    user: Optional[UserInfo] = None


# Search and selection schemas
class OrganizationSearchResult(BaseModel):
    """Schema for organization search results."""
    id: str
    name: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    member_count: int


class OrganizationStats(BaseModel):
    """Schema for organization statistics."""
    total_members: int
    sponsored_members: int
    programs_count: int
    programs: List[str]
    membership_types: Dict[str, int]


# User search schemas (for finding existing users)
class UserSearchResult(BaseModel):
    """Schema for user search results."""
    id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_type: ProfileType
    roles: List[str]


# List response schemas
class OrganizationListResponse(BaseModel):
    """Schema for organization list response."""
    items: List[OrganizationResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class OrganizationMembershipListResponse(BaseModel):
    """Schema for organization membership list response."""
    items: List[OrganizationMembershipResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


# Organization details with members
class OrganizationDetailResponse(OrganizationResponse):
    """Schema for detailed organization response with members."""
    memberships: List[OrganizationMembershipResponse] = []
    stats: OrganizationStats


# API response schemas
class ApiResponse(BaseModel):
    """Standard API response schema."""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None


class OrganizationApiResponse(ApiResponse):
    """Organization API response schema."""
    data: Optional[OrganizationResponse] = None


class OrganizationListApiResponse(ApiResponse):
    """Organization list API response schema."""
    data: Optional[OrganizationListResponse] = None


class OrganizationMembershipApiResponse(ApiResponse):
    """Organization membership API response schema."""
    data: Optional[OrganizationMembershipResponse] = None