"""
Pydantic schemas for enrollment operations.

This module contains all request/response schemas for enrollment management
including course assignments, program assignments, and enrollment validation.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import date

class CourseAssignmentRequest(BaseModel):
    """Request model for individual course assignment with facility support."""
    user_id: str = Field(..., description="ID of user to assign")
    course_id: str = Field(..., description="ID of course to assign to")
    
    # Facility-based enrollment parameters
    facility_id: Optional[str] = Field(None, description="ID of facility (optional for non-facility courses)")
    location_type: str = Field(..., description="Location type (our-facility, client-location, virtual)")
    session_type: str = Field(..., description="Session type (private, group, school_group)")
    age_group: str = Field(..., description="Age group for the student")
    coupon_code: Optional[str] = Field(None, description="Optional coupon code for discounts")
    
    # Original assignment parameters
    assignment_type: Optional[str] = Field("direct", description="Type of assignment")
    credits_awarded: Optional[int] = Field(0, description="Credits to award")
    assignment_notes: Optional[str] = Field(None, description="Assignment notes")
    referral_source: Optional[str] = Field(None, description="Referral source")
    special_requirements: Optional[str] = Field(None, description="Special requirements")
    notes: Optional[str] = Field(None, description="Additional notes")


class BulkCourseAssignmentRequest(BaseModel):
    """Request model for bulk course assignments with facility support."""
    assignments: List[Dict[str, Any]] = Field(
        ..., 
        description="List of assignment operations with facility parameters",
        examples=[
            {
                "user_id": "user-123",
                "course_id": "course-456",
                "facility_id": "facility-789",
                "location_type": "our-facility",
                "session_type": "group",
                "age_group": "6-8",
                "coupon_code": "SAVE10"
            }
        ]
    )


class MultiUserAssignmentRequest(BaseModel):
    """Request model for assigning multiple users to one course with facility support."""
    user_ids: List[str] = Field(..., description="List of user IDs to assign")
    course_id: str = Field(..., description="Course ID to assign to")
    
    # Facility parameters (shared for all users)
    facility_id: Optional[str] = Field(None, description="ID of facility (optional)")
    location_type: str = Field(..., description="Location type for all assignments")
    session_type: str = Field(..., description="Session type for all assignments")
    
    assignment_details: Optional[Dict[str, Any]] = Field(None, description="Assignment metadata")


class MultiCourseAssignmentRequest(BaseModel):
    """Request model for assigning one user to multiple courses with facility support."""
    user_id: str = Field(..., description="User ID to assign")
    course_ids: List[str] = Field(..., description="List of course IDs to assign to")
    
    # Facility parameters (shared for all courses)
    facility_id: Optional[str] = Field(None, description="ID of facility (optional)")
    location_type: str = Field(..., description="Location type for all assignments")
    session_type: str = Field(..., description="Session type for all assignments")
    age_group: str = Field(..., description="Age group for the student")
    
    assignment_details: Optional[Dict[str, Any]] = Field(None, description="Assignment metadata")


class AssignmentRemovalRequest(BaseModel):
    """Request model for removing course assignments."""
    reason: Optional[str] = Field(None, description="Reason for removal")


class UserSearchRequest(BaseModel):
    """Request model for user search operations."""
    search_query: Optional[str] = None
    role_filter: Optional[List[str]] = None
    program_filter: Optional[str] = None
    organization_filter: Optional[str] = None
    is_active: Optional[bool] = None
    exclude_assigned_to_program: Optional[str] = None
    exclude_enrolled_in_course: Optional[str] = None
    page: int = 1
    per_page: int = 20


class AssignmentEligibilityResponse(BaseModel):
    """Response model for assignment eligibility checks."""
    eligible: bool
    reason: str
    warnings: List[str] = []


class FacilityAvailabilityResponse(BaseModel):
    """Response model for facility availability validation."""
    available: bool
    facility_name: str
    reason: Optional[str] = None
    price: Optional[float] = None
    pricing_notes: Optional[str] = None
    course_name: Optional[str] = None
    course_description: Optional[str] = None
    supported_age_groups: Optional[List[str]] = None
    supported_location_types: Optional[List[str]] = None
    supported_session_types: Optional[List[str]] = None
    suggestion: Optional[str] = None


class StudentAgeEligibilityResponse(BaseModel):
    """Response model for student age eligibility validation."""
    eligible: bool
    reason: Optional[str] = None
    student_age: Optional[int] = None
    course_age_groups: Optional[List[str]] = None
    applicable_age_groups: List[str] = []
    recommended_age_group: Optional[str] = None


class AvailableFacilityResponse(BaseModel):
    """Response model for available facilities."""
    facility_id: str
    facility_name: str
    address: Optional[str] = None
    price: float
    pricing_notes: Optional[str] = None
    contact_phone: Optional[str] = None
    operating_hours: Optional[Dict[str, Any]] = None


class PricingCalculationRequest(BaseModel):
    """Request model for pricing calculation."""
    facility_id: str = Field(..., description="ID of the facility")
    course_id: str = Field(..., description="ID of the course")
    age_group: str = Field(..., description="Age group")
    location_type: str = Field(..., description="Location type")
    session_type: str = Field(..., description="Session type")
    coupon_code: Optional[str] = Field(None, description="Optional coupon code")


class PricingCalculationResponse(BaseModel):
    """Response model for pricing calculation."""
    base_price: float
    discount_amount: float
    total_amount: float
    coupon_code: Optional[str] = None
    coupon_valid: bool = False
    coupon_message: str = ""
    payment_thresholds: Dict[str, float]


class StudentDefaultFacilityResponse(BaseModel):
    """Response model for student's default facility."""
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None
    last_used_date: Optional[str] = None
    location_type: Optional[str] = None
    session_type: Optional[str] = None


class BulkAssignmentResponse(BaseModel):
    """Response model for bulk assignment operations with facility information."""
    total_processed: int
    total_successful: int
    total_failed: int
    successful_assignments: List[Dict[str, Any]]
    failed_assignments: List[Dict[str, Any]]


class CourseEnrollmentResponse(BaseModel):
    """Response model for course enrollment information."""
    id: str
    user_id: str
    course_id: str
    program_id: str
    status: str
    enrollment_date: str
    enrollment_fee: float
    outstanding_balance: float
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None
    location_type: Optional[str] = None
    session_type: Optional[str] = None
    age_group: Optional[str] = None
    payment_status: Optional[str] = None
    total_amount: Optional[float] = None
    amount_paid: Optional[float] = None
    coupon_code: Optional[str] = None
    discount_amount: Optional[float] = None
    can_start_sessions: Optional[bool] = None
    payment_percentage: Optional[float] = None


class ProgramAssignmentResponse(BaseModel):
    """Response model for program assignment information."""
    id: str
    user_id: str
    program_id: str
    assignment_date: str
    role_in_program: str
    is_active: bool
    assignment_notes: Optional[str] = None