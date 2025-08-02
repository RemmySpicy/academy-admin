"""
Facility schemas for facility management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum

class FacilityTypeEnum(str, Enum):
    """Facility type enumeration for API."""
    POOL = "pool"
    COURTS = "courts"
    GYM = "gym"
    FIELD = "field"
    CLASSROOM = "classroom"
    EXTERNAL = "external"


class FacilityStatusEnum(str, Enum):
    """Facility status enumeration for API."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class FacilityBase(BaseModel):
    """Base facility schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=255, description="Facility name")
    description: Optional[str] = Field(None, description="Facility description")
    facility_type: FacilityTypeEnum = Field(default=FacilityTypeEnum.GYM, description="Type of facility")
    address: str = Field(..., min_length=1, description="Full address of the facility")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=50, description="State/province")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal/ZIP code")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    capacity: Optional[int] = Field(None, ge=0, description="Maximum occupancy capacity")
    area_sqft: Optional[int] = Field(None, ge=0, description="Facility area in square feet")
    status: FacilityStatusEnum = Field(default=FacilityStatusEnum.ACTIVE, description="Facility status")
    equipment: Optional[Dict[str, Any]] = Field(None, description="Equipment and amenities")
    contact_phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")
    contact_email: Optional[str] = Field(None, max_length=255, description="Contact email address")
    facility_head_name: Optional[str] = Field(None, max_length=255, description="Name of the facility head/manager")
    facility_head_phone: Optional[str] = Field(None, max_length=20, description="Phone number of the facility head/manager")
    access_fee_kids: Optional[int] = Field(None, ge=0, description="Access fee for kids (in Nigerian Naira)")
    access_fee_adults: Optional[int] = Field(None, ge=0, description="Access fee for adults (in Nigerian Naira)")
    specifications: Optional[Dict[str, Any]] = Field(None, description="Activity-specific facility specifications")
    operating_hours: Optional[Dict[str, Any]] = Field(None, description="Operating hours by day")
    program_id: Optional[str] = Field(None, description="Associated program ID")
    facility_code: Optional[str] = Field(None, max_length=20, description="Unique facility code")
    
    @validator('facility_code')
    def validate_facility_code(cls, v):
        """Validate facility code format."""
        if v:
            # Remove any whitespace
            v = v.strip()
            # Check for valid characters (alphanumeric, hyphens, underscores)
            import re
            if not re.match(r'^[A-Za-z0-9_-]+$', v):
                raise ValueError('Facility code can only contain letters, numbers, hyphens, and underscores')
        return v
    
    @validator('contact_email')
    def validate_contact_email(cls, v):
        """Validate contact email format."""
        if v:
            import re
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(pattern, v):
                raise ValueError('Invalid email format')
        return v


class FacilityCreate(FacilityBase):
    """Schema for creating a new facility."""
    
    # All required fields are defined in FacilityBase
    pass


class FacilityUpdate(BaseModel):
    """Schema for updating facility information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    facility_type: Optional[FacilityTypeEnum] = Field(None)
    address: Optional[str] = Field(None, min_length=1)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    capacity: Optional[int] = Field(None, ge=0)
    area_sqft: Optional[int] = Field(None, ge=0)
    status: Optional[FacilityStatusEnum] = Field(None)
    equipment: Optional[Dict[str, Any]] = Field(None)
    contact_phone: Optional[str] = Field(None, max_length=20)
    contact_email: Optional[str] = Field(None, max_length=255)
    facility_head_name: Optional[str] = Field(None, max_length=255)
    facility_head_phone: Optional[str] = Field(None, max_length=20)
    access_fee_kids: Optional[int] = Field(None, ge=0)
    access_fee_adults: Optional[int] = Field(None, ge=0)
    specifications: Optional[Dict[str, Any]] = Field(None)
    operating_hours: Optional[Dict[str, Any]] = Field(None)
    program_id: Optional[str] = Field(None)
    facility_code: Optional[str] = Field(None, max_length=20)
    
    @validator('facility_code')
    def validate_facility_code(cls, v):
        """Validate facility code format."""
        if v:
            v = v.strip()
            import re
            if not re.match(r'^[A-Za-z0-9_-]+$', v):
                raise ValueError('Facility code can only contain letters, numbers, hyphens, and underscores')
        return v
    
    @validator('contact_email')
    def validate_contact_email(cls, v):
        """Validate contact email format."""
        if v:
            import re
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(pattern, v):
                raise ValueError('Invalid email format')
        return v


class FacilityResponse(FacilityBase):
    """Schema for facility responses."""
    
    id: str = Field(..., description="Unique facility ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    created_by: Optional[str] = Field(None, description="User who created the facility")
    updated_by: Optional[str] = Field(None, description="User who last updated the facility")
    
    # Computed properties
    display_name: str = Field(..., description="Display-friendly name")
    is_active: bool = Field(..., description="Whether facility is active")
    full_address: str = Field(..., description="Formatted full address")
    equipment_list: List[str] = Field(default=[], description="List of equipment/amenities")
    
    class Config:
        from_attributes = True


class FacilityListResponse(BaseModel):
    """Schema for paginated facility list responses."""
    
    items: List[FacilityResponse] = Field(..., description="List of facilities")
    total: int = Field(..., description="Total number of facilities")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")


class FacilitySearchParams(BaseModel):
    """Schema for facility search parameters."""
    
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")
    search: Optional[str] = Field(None, description="Search term")
    status: Optional[FacilityStatusEnum] = Field(None, description="Filter by status")
    facility_type: Optional[FacilityTypeEnum] = Field(None, description="Filter by facility type")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    city: Optional[str] = Field(None, description="Filter by city")
    sort_by: Optional[str] = Field(default="name", description="Sort field")
    sort_order: Optional[str] = Field(default="asc", pattern="^(asc|desc)$", description="Sort order")


class FacilityStatsResponse(BaseModel):
    """Schema for facility statistics."""
    
    total_facilities: int = Field(..., description="Total number of facilities")
    active_facilities: int = Field(..., description="Number of active facilities")
    inactive_facilities: int = Field(..., description="Number of inactive facilities")
    facilities_by_type: Dict[str, int] = Field(..., description="Facilities grouped by type")
    facilities_by_status: Dict[str, int] = Field(..., description="Facilities grouped by status")
    facilities_by_program: Dict[str, int] = Field(..., description="Facilities grouped by program")
    total_capacity: int = Field(..., description="Total capacity across all facilities")
    average_capacity: float = Field(..., description="Average capacity per facility")
    total_area: int = Field(..., description="Total area across all facilities")
    average_area: float = Field(..., description="Average area per facility")