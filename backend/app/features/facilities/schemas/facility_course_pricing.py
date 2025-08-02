"""
Facility Course Pricing schemas for API operations.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator


class FacilityCoursePricingBase(BaseModel):
    """Base facility course pricing schema with common fields."""
    
    facility_id: str = Field(..., description="Facility ID")
    course_id: str = Field(..., description="Course ID")
    age_group: str = Field(..., description="Age group (must match course age groups)")
    location_type: str = Field(..., description="Location type (our-facility, client-location, virtual)")
    session_type: str = Field(..., description="Session type (group, private, etc.)")
    price: int = Field(..., ge=0, description="Price in NGN")
    is_active: bool = Field(True, description="Whether this pricing entry is active")
    notes: Optional[str] = Field(None, description="Additional notes about this pricing")


class FacilityCoursePricingCreate(FacilityCoursePricingBase):
    """Schema for creating a new facility course pricing entry."""
    pass


class FacilityCoursePricingUpdate(BaseModel):
    """Schema for updating facility course pricing."""
    
    price: Optional[int] = Field(None, ge=0, description="Price in NGN")
    is_active: Optional[bool] = Field(None, description="Whether this pricing entry is active")
    notes: Optional[str] = Field(None, description="Additional notes about this pricing")


class FacilityCoursePricingResponse(FacilityCoursePricingBase):
    """Schema for facility course pricing response."""
    
    id: str = Field(..., description="Pricing entry ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    # Nested relationship data
    facility: Optional[Dict[str, Any]] = Field(None, description="Facility information")
    course: Optional[Dict[str, Any]] = Field(None, description="Course information")
    
    # Computed properties
    display_name: str = Field(..., description="Display-friendly name")
    formatted_price: str = Field(..., description="Formatted price string")
    pricing_key: str = Field(..., description="Unique pricing key")
    
    class Config:
        from_attributes = True


class FacilityCoursePricingListResponse(BaseModel):
    """Schema for paginated facility course pricing list response."""
    
    items: List[FacilityCoursePricingResponse] = Field(..., description="List of pricing entries")
    total: int = Field(..., description="Total number of pricing entries")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")


class FacilityCoursePricingSearchParams(BaseModel):
    """Parameters for facility course pricing search and filtering."""
    
    page: int = Field(default=1, ge=1, description="Page number")
    per_page: int = Field(default=20, ge=1, le=100, description="Items per page")
    facility_id: Optional[str] = Field(None, description="Filter by facility ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    age_group: Optional[str] = Field(None, description="Filter by age group")
    location_type: Optional[str] = Field(None, description="Filter by location type")
    session_type: Optional[str] = Field(None, description="Filter by session type")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class FacilityCoursePricingLookupRequest(BaseModel):
    """Schema for looking up specific pricing."""
    
    facility_id: str = Field(..., description="Facility ID")
    course_id: str = Field(..., description="Course ID")
    age_group: str = Field(..., description="Age group")
    location_type: str = Field(..., description="Location type")
    session_type: str = Field(..., description="Session type")


class FacilityCoursePricingLookupResponse(BaseModel):
    """Schema for pricing lookup response."""
    
    found: bool = Field(..., description="Whether pricing was found")
    price: Optional[int] = Field(None, description="Price if found")
    formatted_price: Optional[str] = Field(None, description="Formatted price string if found")
    pricing_entry: Optional[FacilityCoursePricingResponse] = Field(None, description="Full pricing entry if found")
    fallback_range: Optional[Dict[str, Any]] = Field(None, description="Course price range fallback if no specific pricing")


class FacilityCoursePricingStatsResponse(BaseModel):
    """Schema for facility course pricing statistics."""
    
    total_pricing_entries: int = Field(..., description="Total number of pricing entries")
    active_pricing_entries: int = Field(..., description="Number of active pricing entries")
    facilities_with_pricing: int = Field(..., description="Number of facilities with pricing")
    courses_with_pricing: int = Field(..., description="Number of courses with pricing")
    pricing_by_facility: Dict[str, int] = Field(..., description="Pricing entries grouped by facility")
    pricing_by_course: Dict[str, int] = Field(..., description="Pricing entries grouped by course")
    average_price: float = Field(..., description="Average price across all entries")
    price_range: Dict[str, int] = Field(..., description="Min and max prices")


class FacilityCoursePricingBulkCreateRequest(BaseModel):
    """Schema for bulk creating facility course pricing entries."""
    
    entries: List[FacilityCoursePricingCreate] = Field(..., min_items=1, description="Pricing entries to create")
    overwrite_existing: bool = Field(False, description="Whether to overwrite existing pricing entries")


class FacilityCoursePricingBulkUpdateRequest(BaseModel):
    """Schema for bulk updating facility course pricing entries."""
    
    facility_id: str = Field(..., description="Facility ID to update pricing for")
    course_id: Optional[str] = Field(None, description="Course ID to update pricing for (optional)")
    price_adjustment: Optional[int] = Field(None, description="Price adjustment amount (positive or negative)")
    price_multiplier: Optional[float] = Field(None, gt=0, description="Price multiplier (e.g., 1.1 for 10% increase)")
    new_status: Optional[bool] = Field(None, description="New active status for all matching entries")


class FacilityCoursePricingImportRequest(BaseModel):
    """Schema for importing pricing from another facility."""
    
    source_facility_id: str = Field(..., description="Source facility ID to copy pricing from")
    target_facility_id: str = Field(..., description="Target facility ID to copy pricing to")
    overwrite_existing: bool = Field(False, description="Whether to overwrite existing pricing entries")
    apply_adjustment: Optional[int] = Field(None, description="Price adjustment to apply during import")
    course_ids: Optional[List[str]] = Field(None, description="Specific course IDs to import (optional)")


class CoursePricingMatrixResponse(BaseModel):
    """Schema for complete course pricing matrix for a facility."""
    
    facility_id: str = Field(..., description="Facility ID")
    facility_name: str = Field(..., description="Facility name")
    courses: List[Dict[str, Any]] = Field(..., description="Courses with their pricing matrices")
    
    class Config:
        schema_extra = {
            "example": {
                "facility_id": "facility-123",
                "facility_name": "Olympic Swimming Pool",
                "courses": [
                    {
                        "course_id": "course-456",
                        "course_name": "Swimming Fundamentals",
                        "pricing_matrix": [
                            {
                                "age_group": "6-12-years",
                                "location_type": "our-facility",
                                "session_type": "group",
                                "price": 15000,
                                "formatted_price": "₦15,000"
                            }
                        ]
                    }
                ]
            }
        }