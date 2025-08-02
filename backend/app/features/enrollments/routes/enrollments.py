"""
Course Assignment API endpoints for the Student/Parent Course Assignment System.

This module provides RESTful endpoints for course assignment operations including
individual and bulk assignments, user search for assignment, and assignment management.
"""

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from decimal import Decimal

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.dependencies.program_context import get_program_context
from app.features.enrollments.services.enrollment_service import (
    course_assignment_service, BulkAssignmentResult, AssignmentEligibility
)
from app.features.enrollments.services.user_search_service import (
    user_search_service, UserSearchParams, UserSearchResult, UserProgramStatus
)
from app.features.students.services.unified_creation_service import UnifiedCreationService
from app.features.enrollments.services.facility_enrollment_service import FacilityEnrollmentService
from app.core.exceptions import ValidationError
# from app.features.authentication.models.user import User

router = APIRouter(tags=["Course Assignments"])


# Pydantic schemas for request/response models

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


# New schemas for facility-based enrollment validation

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


# New validation endpoints for facility-based enrollment

@router.get("/validate-facility-availability/{course_id}/{facility_id}", response_model=FacilityAvailabilityResponse)
async def validate_facility_availability(
    course_id: str = Path(..., description="Course ID"),
    facility_id: str = Path(..., description="Facility ID"),
    age_group: str = Query(..., description="Age group"),
    location_type: str = Query(..., description="Location type"),
    session_type: str = Query(..., description="Session type"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Check if course is available at facility for given parameters.
    
    This endpoint validates course-facility compatibility and pricing availability.
    """
    try:
        facility_service = FacilityEnrollmentService(db)
        result = facility_service.validate_course_facility_availability(
            course_id=course_id,
            facility_id=facility_id,
            age_group=age_group,
            location_type=location_type,
            session_type=session_type
        )
        
        return FacilityAvailabilityResponse(**result)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating facility availability: {str(e)}"
        )


@router.get("/student-age-eligibility/{user_id}/{course_id}", response_model=StudentAgeEligibilityResponse)
async def check_student_age_eligibility(
    user_id: str = Path(..., description="User ID"),
    course_id: str = Path(..., description="Course ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Check student age eligibility for a course.
    
    This endpoint validates if a student's age makes them eligible for a course.
    """
    try:
        facility_service = FacilityEnrollmentService(db)
        result = facility_service.validate_student_age_eligibility(
            user_id=user_id,
            course_id=course_id
        )
        
        return StudentAgeEligibilityResponse(**result)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking student age eligibility: {str(e)}"
        )


@router.get("/available-facilities/{course_id}", response_model=List[AvailableFacilityResponse])
async def get_available_facilities_for_course(
    course_id: str = Path(..., description="Course ID"),
    age_group: str = Query(..., description="Age group"),
    location_type: str = Query(..., description="Location type"),
    session_type: str = Query(..., description="Session type"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Get facilities where course is available for given parameters.
    
    This endpoint returns all facilities that support the course with the specified parameters.
    """
    try:
        facility_service = FacilityEnrollmentService(db)
        facilities = facility_service.get_available_facilities_for_course(
            course_id=course_id,
            age_group=age_group,
            location_type=location_type,
            session_type=session_type,
            program_id=program_context
        )
        
        return [AvailableFacilityResponse(**facility) for facility in facilities]
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting available facilities: {str(e)}"
        )


@router.post("/calculate-pricing", response_model=PricingCalculationResponse)
async def calculate_enrollment_pricing(
    pricing_request: PricingCalculationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Calculate pricing with discounts for an enrollment.
    
    This endpoint calculates total pricing including coupon discounts.
    """
    try:
        facility_service = FacilityEnrollmentService(db)
        result = facility_service.calculate_enrollment_pricing(
            facility_id=pricing_request.facility_id,
            course_id=pricing_request.course_id,
            age_group=pricing_request.age_group,
            location_type=pricing_request.location_type,
            session_type=pricing_request.session_type,
            coupon_code=pricing_request.coupon_code
        )
        
        return PricingCalculationResponse(**result)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating pricing: {str(e)}"
        )


@router.get("/student-default-facility/{user_id}", response_model=StudentDefaultFacilityResponse)
async def get_student_default_facility(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Get student's default facility based on enrollment history.
    
    This endpoint returns the most recently used facility for a student in the current program.
    """
    try:
        facility_service = FacilityEnrollmentService(db)
        result = facility_service.get_student_default_facility(
            user_id=user_id,
            program_id=program_context
        )
        
        if result:
            return StudentDefaultFacilityResponse(**result)
        else:
            return StudentDefaultFacilityResponse()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting student default facility: {str(e)}"
        )


# Course Assignment Endpoints

@router.post("/assign", response_model=Dict[str, Any])
async def assign_user_to_course(
    assignment_request: CourseAssignmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Assign a user to a specific course with facility-based enrollment support.
    
    This endpoint handles individual course assignments with comprehensive
    validation, eligibility checking, and facility-based pricing.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not UnifiedCreationService.validate_program_admin_access(db, current_user.id, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        facility_service = FacilityEnrollmentService(db)
        
        # Step 1: Validate student age eligibility if we have facility parameters
        if assignment_request.age_group:
            age_eligibility = facility_service.validate_student_age_eligibility(
                user_id=assignment_request.user_id,
                course_id=assignment_request.course_id
            )
            
            if not age_eligibility["eligible"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Student age eligibility failed: {age_eligibility['reason']}"
                )
            
            # Validate the provided age_group is in the applicable list
            if assignment_request.age_group not in age_eligibility["applicable_age_groups"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Age group '{assignment_request.age_group}' not applicable for this student. Applicable: {age_eligibility['applicable_age_groups']}"
                )
        
        # Step 2: Validate facility availability if facility is specified
        pricing_info = None
        if assignment_request.facility_id:
            facility_availability = facility_service.validate_course_facility_availability(
                course_id=assignment_request.course_id,
                facility_id=assignment_request.facility_id,
                age_group=assignment_request.age_group,
                location_type=assignment_request.location_type,
                session_type=assignment_request.session_type
            )
            
            if not facility_availability["available"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Facility availability validation failed: {facility_availability['reason']}"
                )
        
        # Step 3: Calculate pricing
        if assignment_request.facility_id:
            pricing_info = facility_service.calculate_enrollment_pricing(
                facility_id=assignment_request.facility_id,
                course_id=assignment_request.course_id,
                age_group=assignment_request.age_group,
                location_type=assignment_request.location_type,
                session_type=assignment_request.session_type,
                coupon_code=assignment_request.coupon_code
            )
        
        # Step 4: Prepare assignment details with facility information
        assignment_details = {
            'assignment_type': assignment_request.assignment_type,
            'credits_awarded': assignment_request.credits_awarded,
            'assignment_notes': assignment_request.assignment_notes,
            'referral_source': assignment_request.referral_source,
            'special_requirements': assignment_request.special_requirements,
            'notes': assignment_request.notes,
            # Facility-specific parameters
            'facility_id': assignment_request.facility_id,
            'location_type': assignment_request.location_type,
            'session_type': assignment_request.session_type,
            'age_group': assignment_request.age_group,
            'coupon_code': assignment_request.coupon_code,
            # Pricing information
            'pricing_info': pricing_info
        }
        
        # Step 5: Perform the assignment with enhanced details
        enrollment = course_assignment_service.assign_user_to_course(
            db=db,
            user_id=assignment_request.user_id,
            course_id=assignment_request.course_id,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=assignment_details
        )
        
        # Step 6: Build enhanced response with facility and payment information
        response_enrollment = {
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "course_id": enrollment.course_id,
            "program_id": enrollment.program_id,
            "status": enrollment.status.value,
            "enrollment_date": enrollment.enrollment_date.isoformat(),
            "enrollment_fee": float(enrollment.enrollment_fee or 0),
            "outstanding_balance": float(enrollment.outstanding_balance or 0),
            # Facility information
            "facility_id": enrollment.facility_id,
            "facility_name": enrollment.facility_name,
            "location_type": enrollment.location_type,
            "session_type": enrollment.session_type,
            "age_group": enrollment.age_group,
            # Payment information
            "payment_status": enrollment.payment_status.value,
            "total_amount": float(enrollment.total_amount or 0),
            "amount_paid": float(enrollment.amount_paid or 0),
            "coupon_code": enrollment.coupon_code,
            "discount_amount": float(enrollment.discount_amount or 0),
            # Session eligibility
            "can_start_sessions": enrollment.can_start_sessions(),
            "payment_percentage": enrollment.payment_percentage
        }
        
        response_data = {
            "success": True,
            "message": "Course assignment successful with facility-based enrollment",
            "enrollment": response_enrollment
        }
        
        # Add pricing breakdown if calculated
        if pricing_info:
            response_data["pricing_breakdown"] = pricing_info
        
        return response_data
        
    except HTTPException:
        raise
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing course assignment: {str(e)}"
        )


@router.post("/bulk-assign", response_model=BulkAssignmentResponse)
async def bulk_assign_users_to_courses(
    bulk_request: BulkCourseAssignmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Bulk assign users to courses with facility-based enrollment support.
    
    This endpoint handles multiple assignment operations in a single request
    with comprehensive error reporting for failed assignments. Each assignment
    can include facility parameters for enhanced enrollment.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not UnifiedCreationService.validate_program_admin_access(db, current_user.id, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        facility_service = FacilityEnrollmentService(db)
        
        # Pre-process assignments to add facility validation
        enhanced_assignments = []
        validation_errors = []
        
        for i, assignment in enumerate(bulk_request.assignments):
            try:
                # Validate required fields
                if 'user_id' not in assignment or 'course_id' not in assignment:
                    validation_errors.append({
                        "index": i,
                        "assignment": assignment,
                        "error": "Missing required fields: user_id and course_id"
                    })
                    continue
                
                # If facility parameters are provided, validate them
                if assignment.get('facility_id') and assignment.get('age_group'):
                    # Validate student age eligibility
                    age_eligibility = facility_service.validate_student_age_eligibility(
                        user_id=assignment['user_id'],
                        course_id=assignment['course_id']
                    )
                    
                    if not age_eligibility["eligible"]:
                        validation_errors.append({
                            "index": i,
                            "assignment": assignment,
                            "error": f"Age eligibility failed: {age_eligibility['reason']}"
                        })
                        continue
                    
                    # Validate facility availability
                    if assignment.get('location_type') and assignment.get('session_type'):
                        facility_availability = facility_service.validate_course_facility_availability(
                            course_id=assignment['course_id'],
                            facility_id=assignment['facility_id'],
                            age_group=assignment['age_group'],
                            location_type=assignment['location_type'],
                            session_type=assignment['session_type']
                        )
                        
                        if not facility_availability["available"]:
                            validation_errors.append({
                                "index": i,
                                "assignment": assignment,
                                "error": f"Facility availability failed: {facility_availability['reason']}"
                            })
                            continue
                        
                        # Calculate pricing if all parameters are available
                        try:
                            pricing_info = facility_service.calculate_enrollment_pricing(
                                facility_id=assignment['facility_id'],
                                course_id=assignment['course_id'],
                                age_group=assignment['age_group'],
                                location_type=assignment['location_type'],
                                session_type=assignment['session_type'],
                                coupon_code=assignment.get('coupon_code')
                            )
                            assignment['pricing_info'] = pricing_info
                        except Exception as pricing_error:
                            validation_errors.append({
                                "index": i,
                                "assignment": assignment,
                                "error": f"Pricing calculation failed: {str(pricing_error)}"
                            })
                            continue
                
                enhanced_assignments.append(assignment)
                
            except ValidationError as ve:
                validation_errors.append({
                    "index": i,
                    "assignment": assignment,
                    "error": str(ve)
                })
            except Exception as e:
                validation_errors.append({
                    "index": i,
                    "assignment": assignment,
                    "error": f"Validation error: {str(e)}"
                })
        
        # Perform bulk assignments with enhanced data
        result = course_assignment_service.bulk_assign_users_to_courses(
            db=db,
            assignments=enhanced_assignments,
            program_context=program_context,
            assigned_by=current_user.id
        )
        
        # Add validation errors to failed assignments
        all_failed_assignments = result.failed_assignments + validation_errors
        
        # Format successful assignments for response with facility information
        successful_assignments = []
        for enrollment in result.successful_assignments:
            enrollment_data = {
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "status": enrollment.status.value,
                "enrollment_date": enrollment.enrollment_date.isoformat(),
                "facility_id": enrollment.facility_id,
                "facility_name": enrollment.facility_name,
                "location_type": enrollment.location_type,
                "session_type": enrollment.session_type,
                "age_group": enrollment.age_group,
                "payment_status": enrollment.payment_status.value,
                "total_amount": float(enrollment.total_amount or 0),
                "can_start_sessions": enrollment.can_start_sessions()
            }
            successful_assignments.append(enrollment_data)
        
        return BulkAssignmentResponse(
            total_processed=len(bulk_request.assignments),
            total_successful=result.total_successful,
            total_failed=len(all_failed_assignments),
            successful_assignments=successful_assignments,
            failed_assignments=all_failed_assignments
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing bulk assignments: {str(e)}"
        )


@router.post("/assign-multiple-users", response_model=BulkAssignmentResponse)
async def assign_multiple_users_to_course(
    multi_user_request: MultiUserAssignmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Assign multiple users to a single course with facility support.
    
    This endpoint is useful for enrolling a group of users in the same course
    with shared facility parameters.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not UnifiedCreationService.validate_program_admin_access(db, current_user.id, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        facility_service = FacilityEnrollmentService(db)
        
        # Pre-validate facility parameters if provided
        pricing_info = None
        if multi_user_request.facility_id and multi_user_request.location_type and multi_user_request.session_type:
            # Validate each user's age eligibility
            validation_errors = []
            
            for user_id in multi_user_request.user_ids:
                try:
                    # We can't validate age group here as it's not provided per user
                    # This will be handled in the service layer or individual validation
                    pass
                except Exception as e:
                    validation_errors.append({
                        "user_id": user_id,
                        "error": f"Validation failed: {str(e)}"
                    })
            
            if validation_errors:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"User validation errors: {validation_errors}"
                )
        
        # Enhance assignment details with facility information
        enhanced_assignment_details = multi_user_request.assignment_details or {}
        enhanced_assignment_details.update({
            'facility_id': multi_user_request.facility_id,
            'location_type': multi_user_request.location_type,
            'session_type': multi_user_request.session_type
        })
        
        # Perform multi-user assignment
        result = course_assignment_service.assign_multiple_users_to_course(
            db=db,
            user_ids=multi_user_request.user_ids,
            course_id=multi_user_request.course_id,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=enhanced_assignment_details
        )
        
        # Format successful assignments for response with facility information
        successful_assignments = []
        for enrollment in result.successful_assignments:
            enrollment_data = {
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "status": enrollment.status.value,
                "enrollment_date": enrollment.enrollment_date.isoformat(),
                "facility_id": enrollment.facility_id,
                "facility_name": enrollment.facility_name,
                "location_type": enrollment.location_type,
                "session_type": enrollment.session_type,
                "age_group": enrollment.age_group,
                "payment_status": enrollment.payment_status.value,
                "total_amount": float(enrollment.total_amount or 0),
                "can_start_sessions": enrollment.can_start_sessions()
            }
            successful_assignments.append(enrollment_data)
        
        return BulkAssignmentResponse(
            total_processed=result.total_processed,
            total_successful=result.total_successful,
            total_failed=result.total_failed,
            successful_assignments=successful_assignments,
            failed_assignments=result.failed_assignments
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing multi-user assignment: {str(e)}"
        )


@router.post("/assign-multiple-courses", response_model=BulkAssignmentResponse)
async def assign_user_to_multiple_courses(
    multi_course_request: MultiCourseAssignmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Assign a single user to multiple courses with facility support.
    
    This endpoint is useful for enrolling a user in multiple courses simultaneously
    with shared facility parameters.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not UnifiedCreationService.validate_program_admin_access(db, current_user.id, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        facility_service = FacilityEnrollmentService(db)
        
        # Pre-validate facility parameters if provided
        if multi_course_request.facility_id and multi_course_request.age_group:
            # Validate student age eligibility for the user
            for course_id in multi_course_request.course_ids:
                try:
                    age_eligibility = facility_service.validate_student_age_eligibility(
                        user_id=multi_course_request.user_id,
                        course_id=course_id
                    )
                    
                    if not age_eligibility["eligible"]:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Student age eligibility failed for course {course_id}: {age_eligibility['reason']}"
                        )
                    
                    # Validate age group is applicable
                    if multi_course_request.age_group not in age_eligibility["applicable_age_groups"]:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Age group '{multi_course_request.age_group}' not applicable for course {course_id}"
                        )
                    
                    # Validate facility availability for each course
                    facility_availability = facility_service.validate_course_facility_availability(
                        course_id=course_id,
                        facility_id=multi_course_request.facility_id,
                        age_group=multi_course_request.age_group,
                        location_type=multi_course_request.location_type,
                        session_type=multi_course_request.session_type
                    )
                    
                    if not facility_availability["available"]:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Facility availability failed for course {course_id}: {facility_availability['reason']}"
                        )
                        
                except ValidationError as ve:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Validation failed for course {course_id}: {str(ve)}"
                    )
        
        # Enhance assignment details with facility information
        enhanced_assignment_details = multi_course_request.assignment_details or {}
        enhanced_assignment_details.update({
            'facility_id': multi_course_request.facility_id,
            'location_type': multi_course_request.location_type,
            'session_type': multi_course_request.session_type,
            'age_group': multi_course_request.age_group
        })
        
        # Perform multi-course assignment
        result = course_assignment_service.assign_user_to_multiple_courses(
            db=db,
            user_id=multi_course_request.user_id,
            course_ids=multi_course_request.course_ids,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=enhanced_assignment_details
        )
        
        # Format successful assignments for response with facility information
        successful_assignments = []
        for enrollment in result.successful_assignments:
            enrollment_data = {
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "status": enrollment.status.value,
                "enrollment_date": enrollment.enrollment_date.isoformat(),
                "facility_id": enrollment.facility_id,
                "facility_name": enrollment.facility_name,
                "location_type": enrollment.location_type,
                "session_type": enrollment.session_type,
                "age_group": enrollment.age_group,
                "payment_status": enrollment.payment_status.value,
                "total_amount": float(enrollment.total_amount or 0),
                "can_start_sessions": enrollment.can_start_sessions()
            }
            successful_assignments.append(enrollment_data)
        
        return BulkAssignmentResponse(
            total_processed=result.total_processed,
            total_successful=result.total_successful,
            total_failed=result.total_failed,
            successful_assignments=successful_assignments,
            failed_assignments=result.failed_assignments
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing multi-course assignment: {str(e)}"
        )


@router.delete("/remove/{user_id}/{course_id}")
async def remove_course_assignment(
    user_id: str = Path(..., description="User ID"),
    course_id: str = Path(..., description="Course ID"),
    removal_request: AssignmentRemovalRequest = Body(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Remove a user's course assignment.
    
    This endpoint withdraws a user from a course while maintaining audit trail.
    """
    try:
        # Verify user has permission to remove assignments in this program
        if not UnifiedCreationService.validate_program_admin_access(db, current_user.id, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        # Remove the assignment
        success = course_assignment_service.remove_course_assignment(
            db=db,
            user_id=user_id,
            course_id=course_id,
            program_context=program_context,
            removed_by=current_user.id,
            reason=removal_request.reason
        )
        
        if success:
            return {
                "success": True,
                "message": "Course assignment removed successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course assignment not found"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing course assignment: {str(e)}"
        )


# User Search and Eligibility Endpoints

@router.post("/search-users", response_model=UserSearchResult)
async def search_users_for_assignment(
    search_request: UserSearchRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Search for users who can be assigned to courses.
    
    This endpoint provides comprehensive user search with filtering
    for assignment operations.
    """
    try:
        # Create search parameters
        search_params = UserSearchParams(
            search_query=search_request.search_query,
            role_filter=search_request.role_filter,
            program_filter=search_request.program_filter,
            organization_filter=search_request.organization_filter,
            is_active=search_request.is_active,
            exclude_assigned_to_program=search_request.exclude_assigned_to_program,
            exclude_enrolled_in_course=search_request.exclude_enrolled_in_course,
            page=search_request.page,
            per_page=search_request.per_page
        )
        
        # Perform search
        result = user_search_service.search_all_users(
            db=db,
            search_params=search_params,
            searcher_id=current_user.id,
            searcher_program_context=program_context
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching users: {str(e)}"
        )


@router.get("/search-assignable-students", response_model=List[Dict[str, Any]])
async def search_assignable_students(
    search_query: str = Query(..., description="Search query"),
    exclude_enrolled_in_course: Optional[str] = Query(None, description="Course ID to exclude"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Search for students who can be assigned to the current program.
    
    This endpoint is optimized for student assignment workflows.
    """
    try:
        result = user_search_service.search_assignable_students(
            db=db,
            program_id=program_context,
            search_query=search_query,
            searcher_id=current_user.id,
            exclude_enrolled_in_course=exclude_enrolled_in_course
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching assignable students: {str(e)}"
        )


@router.get("/search-assignable-parents", response_model=List[Dict[str, Any]])
async def search_assignable_parents(
    search_query: str = Query(..., description="Search query"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Search for parents who can be assigned to the current program.
    
    This endpoint is optimized for parent assignment workflows.
    """
    try:
        result = user_search_service.search_assignable_parents(
            db=db,
            program_id=program_context,
            search_query=search_query,
            searcher_id=current_user.id
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching assignable parents: {str(e)}"
        )


@router.get("/check-eligibility/{user_id}/{course_id}", response_model=AssignmentEligibilityResponse)
async def check_assignment_eligibility(
    user_id: str = Path(..., description="User ID"),
    course_id: str = Path(..., description="Course ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Check if a user is eligible for course assignment.
    
    This endpoint validates assignment eligibility without performing
    the actual assignment.
    """
    try:
        eligibility = course_assignment_service.check_assignment_eligibility(
            db=db,
            user_id=user_id,
            course_id=course_id,
            program_context=program_context
        )
        
        return AssignmentEligibilityResponse(
            eligible=eligibility.eligible,
            reason=eligibility.reason,
            warnings=eligibility.warnings
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking assignment eligibility: {str(e)}"
        )


@router.get("/user-program-status/{user_id}", response_model=Dict[str, Any])
async def get_user_program_status(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Get comprehensive program status for a user.
    
    This endpoint provides detailed information about a user's
    program assignments and course enrollments.
    """
    try:
        status_info = user_search_service.get_user_program_status(
            db=db,
            user_id=user_id
        )
        
        return {
            "user_id": status_info.user_id,
            "assigned_programs": status_info.assigned_programs,
            "enrolled_courses": status_info.enrolled_courses,
            "roles_in_programs": status_info.roles_in_programs,
            "can_be_assigned_to_program": status_info.can_be_assigned_to_program,
            "assignment_restrictions": status_info.assignment_restrictions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user program status: {str(e)}"
        )


# Assignment Management Endpoints

@router.get("/user-assignments/{user_id}", response_model=List[Dict[str, Any]])
async def get_user_course_assignments(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Get all course assignments for a specific user in current program context.
    
    This endpoint returns detailed enrollment information for a user.
    """
    try:
        assignments = course_assignment_service.get_user_course_assignments(
            db=db,
            user_id=user_id,
            program_context=program_context
        )
        
        # Format assignments for response with facility and payment information
        formatted_assignments = []
        for assignment in assignments:
            formatted_assignments.append({
                "enrollment_id": assignment.id,
                "course_id": assignment.course_id,
                "course_name": assignment.course.name if assignment.course else "Unknown",
                "program_id": assignment.program_id,
                "program_name": assignment.program.name if assignment.program else "Unknown",
                "status": assignment.status.value,
                "enrollment_date": assignment.enrollment_date.isoformat(),
                "enrollment_fee": float(assignment.enrollment_fee or 0),
                "outstanding_balance": float(assignment.outstanding_balance or 0),
                "progress_percentage": float(assignment.progress_percentage or 0),
                # Facility information
                "facility_id": assignment.facility_id,
                "facility_name": assignment.facility_name,
                "location_type": assignment.location_type,
                "session_type": assignment.session_type,
                "age_group": assignment.age_group,
                # Payment information
                "payment_status": assignment.payment_status.value,
                "total_amount": float(assignment.total_amount or 0),
                "amount_paid": float(assignment.amount_paid or 0),
                "coupon_code": assignment.coupon_code,
                "discount_amount": float(assignment.discount_amount or 0),
                "payment_percentage": assignment.payment_percentage,
                "can_start_sessions": assignment.can_start_sessions(),
                # Additional enrollment details
                "referral_source": assignment.referral_source,
                "special_requirements": assignment.special_requirements,
                "notes": assignment.notes
            })
        
        return formatted_assignments
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user course assignments: {str(e)}"
        )


@router.get("/assignable-courses", response_model=List[Dict[str, Any]])
async def get_assignable_courses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Get all courses available for assignment in current program context.
    
    This endpoint returns courses that can be assigned to users.
    """
    try:
        courses = course_assignment_service.get_assignable_courses(
            db=db,
            program_context=program_context
        )
        
        # Format courses for response with facility compatibility information
        formatted_courses = []
        for course in courses:
            formatted_courses.append({
                "id": course.id,
                "name": course.name,
                "description": course.description,
                "sequence": course.sequence,
                "status": course.status,
                "max_students": course.max_students,
                "age_groups": course.age_groups,
                "location_types": course.location_types,
                "session_types": course.session_types,
                "difficulty_level": course.difficulty_level,
                "duration_weeks": course.duration_weeks,
                "requires_facility": bool(course.location_types and 'our-facility' in course.location_types)
            })
        
        return formatted_courses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting assignable courses: {str(e)}"
        )