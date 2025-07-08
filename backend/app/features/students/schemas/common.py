"""
Common schemas for student management features.
Shared data structures and validation schemas.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, validator, ConfigDict
from enum import Enum


class CountryEnum(str, Enum):
    """Supported countries"""
    US = "US"
    CA = "CA"
    UK = "UK"
    AU = "AU"
    # Add more as needed


class GenderEnum(str, Enum):
    """Gender options"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class SalutationEnum(str, Enum):
    """Salutation options"""
    MR = "Mr"
    MRS = "Mrs"
    MS = "Ms"
    DR = "Dr"
    PROF = "Prof"


class StatusEnum(str, Enum):
    """General status options"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


class AddressBase(BaseModel):
    """Base address schema"""
    street_address: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: CountryEnum = Field(default=CountryEnum.US)

    @validator('postal_code')
    def validate_postal_code(cls, v, values):
        """Validate postal code format based on country"""
        if 'country' in values:
            country = values['country']
            if country == CountryEnum.US:
                # US ZIP code format (5 digits or 5+4)
                import re
                if not re.match(r'^\d{5}(-\d{4})?$', v):
                    raise ValueError('Invalid US ZIP code format')
            elif country == CountryEnum.CA:
                # Canadian postal code format (A1A 1A1)
                import re
                if not re.match(r'^[A-Z]\d[A-Z] \d[A-Z]\d$', v.upper()):
                    raise ValueError('Invalid Canadian postal code format')
        return v


class AddressCreate(AddressBase):
    """Schema for creating an address"""
    pass


class AddressUpdate(BaseModel):
    """Schema for updating an address"""
    street_address: Optional[str] = Field(None, min_length=1, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[CountryEnum] = None


class AddressResponse(AddressBase):
    """Schema for address response"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactInfoBase(BaseModel):
    """Base contact information schema"""
    email: Optional[EmailStr] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Phone number")
    emergency_phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Emergency contact phone")

    @validator('phone', 'emergency_phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if v is not None:
            import re
            # Remove all non-digit characters
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits_only) > 15:
                raise ValueError('Phone number cannot exceed 15 digits')
        return v


class ContactInfoCreate(ContactInfoBase):
    """Schema for creating contact information"""
    pass


class ContactInfoUpdate(BaseModel):
    """Schema for updating contact information"""
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    emergency_phone: Optional[str] = Field(None, min_length=10, max_length=20)

    @validator('phone', 'emergency_phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if v is not None:
            import re
            # Remove all non-digit characters
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10:
                raise ValueError('Phone number must have at least 10 digits')
            if len(digits_only) > 15:
                raise ValueError('Phone number cannot exceed 15 digits')
        return v


class ContactInfoResponse(ContactInfoBase):
    """Schema for contact information response"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints"""
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for database queries"""
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        """Get limit value for database queries"""
        return self.per_page


class PaginatedResponse(BaseModel):
    """Base paginated response schema"""
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")

    @classmethod
    def create(cls, items: List, total: int, page: int, per_page: int):
        """Create paginated response"""
        total_pages = (total + per_page - 1) // per_page
        return cls(
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )


class AuditInfoResponse(BaseModel):
    """Audit information for entities"""
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields"""
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SearchParams(BaseModel):
    """Search parameters for filtering"""
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    status: Optional[StatusEnum] = Field(None, description="Filter by status")
    facility_id: Optional[int] = Field(None, description="Filter by facility")
    program_id: Optional[int] = Field(None, description="Filter by program")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field(None, pattern="^(asc|desc)$", description="Sort order")


class BulkActionRequest(BaseModel):
    """Schema for bulk actions"""
    ids: List[int] = Field(..., min_items=1, description="List of IDs to perform action on")
    action: str = Field(..., min_length=1, description="Action to perform")
    parameters: Optional[dict] = Field(None, description="Additional parameters for the action")


class BulkActionResponse(BaseModel):
    """Schema for bulk action response"""
    successful: List[int] = Field(..., description="Successfully processed IDs")
    failed: List[dict] = Field(..., description="Failed items with error details")
    total_processed: int = Field(..., description="Total items processed")
    total_successful: int = Field(..., description="Total successful operations")
    total_failed: int = Field(..., description="Total failed operations")