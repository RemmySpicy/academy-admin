"""
Course Assignment API endpoints for the Student/Parent Course Assignment System.

This module provides RESTful endpoints for course assignment operations including
individual and bulk assignments, user search for assignment, and assignment management.
"""

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.dependencies.program_context import get_program_context
from app.features.students.services.course_assignment_service import (
    course_assignment_service, BulkAssignmentResult, AssignmentEligibility
)
from app.features.students.services.user_search_service import (
    user_search_service, UserSearchParams, UserSearchResult, UserProgramStatus
)
# from app.features.authentication.models.user import User

router = APIRouter(tags=["Course Assignments"])


# Pydantic schemas for request/response models

class CourseAssignmentRequest(BaseModel):
    """Request model for individual course assignment."""
    user_id: str = Field(..., description="ID of user to assign")
    course_id: str = Field(..., description="ID of course to assign to")
    assignment_type: Optional[str] = Field("direct", description="Type of assignment")
    credits_awarded: Optional[int] = Field(0, description="Credits to award")
    assignment_notes: Optional[str] = Field(None, description="Assignment notes")
    referral_source: Optional[str] = Field(None, description="Referral source")
    special_requirements: Optional[str] = Field(None, description="Special requirements")
    notes: Optional[str] = Field(None, description="Additional notes")


class BulkCourseAssignmentRequest(BaseModel):
    """Request model for bulk course assignments."""
    assignments: List[Dict[str, Any]] = Field(..., description="List of assignment operations")


class MultiUserAssignmentRequest(BaseModel):
    """Request model for assigning multiple users to one course."""
    user_ids: List[str] = Field(..., description="List of user IDs to assign")
    course_id: str = Field(..., description="Course ID to assign to")
    assignment_details: Optional[Dict[str, Any]] = Field(None, description="Assignment metadata")


class MultiCourseAssignmentRequest(BaseModel):
    """Request model for assigning one user to multiple courses."""
    user_id: str = Field(..., description="User ID to assign")
    course_ids: List[str] = Field(..., description="List of course IDs to assign to")
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


class BulkAssignmentResponse(BaseModel):
    """Response model for bulk assignment operations."""
    total_processed: int
    total_successful: int
    total_failed: int
    successful_assignments: List[Dict[str, Any]]
    failed_assignments: List[Dict[str, Any]]


# Course Assignment Endpoints

@router.post("/assign", response_model=Dict[str, Any])
async def assign_user_to_course(
    assignment_request: CourseAssignmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_context)
):
    """
    Assign a user to a specific course.
    
    This endpoint handles individual course assignments with comprehensive
    validation and eligibility checking.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not verify_program_access(current_user, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        # Convert request to assignment details dictionary
        assignment_details = {
            'assignment_type': assignment_request.assignment_type,
            'credits_awarded': assignment_request.credits_awarded,
            'assignment_notes': assignment_request.assignment_notes,
            'referral_source': assignment_request.referral_source,
            'special_requirements': assignment_request.special_requirements,
            'notes': assignment_request.notes
        }
        
        # Perform the assignment
        enrollment = course_assignment_service.assign_user_to_course(
            db=db,
            user_id=assignment_request.user_id,
            course_id=assignment_request.course_id,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=assignment_details
        )
        
        return {
            "success": True,
            "message": "Course assignment successful",
            "enrollment": {
                "id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "program_id": enrollment.program_id,
                "status": enrollment.status.value,
                "enrollment_date": enrollment.enrollment_date.isoformat(),
                "assignment_date": enrollment.assignment_date.isoformat(),
                "enrollment_fee": float(enrollment.enrollment_fee),
                "outstanding_balance": float(enrollment.outstanding_balance)
            }
        }
        
    except HTTPException:
        raise
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
    Bulk assign users to courses.
    
    This endpoint handles multiple assignment operations in a single request
    with comprehensive error reporting for failed assignments.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not verify_program_access(current_user, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        # Perform bulk assignments
        result = course_assignment_service.bulk_assign_users_to_courses(
            db=db,
            assignments=bulk_request.assignments,
            program_context=program_context,
            assigned_by=current_user.id
        )
        
        # Format successful assignments for response
        successful_assignments = []
        for enrollment in result.successful_assignments:
            successful_assignments.append({
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "status": enrollment.status.value,
                "assignment_date": enrollment.assignment_date.isoformat()
            })
        
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
    Assign multiple users to a single course.
    
    This endpoint is useful for enrolling a group of users in the same course.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not verify_program_access(current_user, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        # Perform multi-user assignment
        result = course_assignment_service.assign_multiple_users_to_course(
            db=db,
            user_ids=multi_user_request.user_ids,
            course_id=multi_user_request.course_id,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=multi_user_request.assignment_details
        )
        
        # Format successful assignments for response
        successful_assignments = []
        for enrollment in result.successful_assignments:
            successful_assignments.append({
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "status": enrollment.status.value,
                "assignment_date": enrollment.assignment_date.isoformat()
            })
        
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
    Assign a single user to multiple courses.
    
    This endpoint is useful for enrolling a user in multiple courses simultaneously.
    """
    try:
        # Verify user has permission to make assignments in this program
        if not verify_program_access(current_user, program_context):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this program"
            )
        
        # Perform multi-course assignment
        result = course_assignment_service.assign_user_to_multiple_courses(
            db=db,
            user_id=multi_course_request.user_id,
            course_ids=multi_course_request.course_ids,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=multi_course_request.assignment_details
        )
        
        # Format successful assignments for response
        successful_assignments = []
        for enrollment in result.successful_assignments:
            successful_assignments.append({
                "enrollment_id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "status": enrollment.status.value,
                "assignment_date": enrollment.assignment_date.isoformat()
            })
        
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
        if not verify_program_access(current_user, program_context):
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
        
        # Format assignments for response
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
                "assignment_date": assignment.assignment_date.isoformat(),
                "assignment_type": assignment.assignment_type.value,
                "credits_awarded": assignment.credits_awarded,
                "enrollment_fee": float(assignment.enrollment_fee),
                "outstanding_balance": float(assignment.outstanding_balance),
                "progress_percentage": float(assignment.progress_percentage or 0),
                "assignment_notes": assignment.assignment_notes
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
        
        # Format courses for response
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
                "difficulty_level": course.difficulty_level,
                "duration_weeks": course.duration_weeks
            })
        
        return formatted_courses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting assignable courses: {str(e)}"
        )