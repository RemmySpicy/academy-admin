"""
Parent API routes for CRUD operations.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status
from sqlalchemy.orm import Session
import logging

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.features.common.dependencies.program_context import get_program_context
from app.features.parents.schemas.parent import (
    ParentCreate,
    ParentUpdate,
    ParentResponse,
    ParentListResponse,
    ParentSearchParams,
    ParentStatsResponse,
)
from app.features.students.schemas.unified_creation import (
    UnifiedParentCreateRequest,
    UnifiedParentCreateResponse,
    UnifiedCreationErrorResponse,
)

from app.features.parents.services.parent_service import parent_service
from app.features.parents.services.relationship_service import relationship_service
from app.features.parents.services.atomic_creation_service import atomic_creation_service
from app.features.students.services.unified_creation_service import unified_creation_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(
    parent_data: ParentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Create a new parent.
    
    Requires authentication and appropriate permissions.
    Creates both User account and Parent profile atomically.
    """
    # Check permissions
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        # For parent creation, we'll use the atomic creation service
        # This creates both user account and parent profile
        result = atomic_creation_service.create_parent_with_children(
            db=db,
            parent_data=parent_data,
            children_data=[],  # No children in simple parent creation
            program_context=program_context,
            created_by=current_user.id
        )
        
        parent_profile = result["parent"]["profile"]
        parent_user = result["parent"]["user"]
        
        return ParentResponse(
            id=str(parent_profile.id),
            user_id=str(parent_user.id),
            username=parent_user.username,
            email=parent_user.email,
            first_name=parent_user.first_name,
            last_name=parent_user.last_name,
            salutation=parent_user.salutation,
            phone=parent_user.phone,
            date_of_birth=parent_user.date_of_birth.isoformat() if parent_user.date_of_birth else None,
            referral_source=parent_user.referral_source,
            profile_photo_url=parent_user.profile_photo_url,
            address=parent_profile.address,
            emergency_contact_name=parent_profile.emergency_contact_name,
            emergency_contact_phone=parent_profile.emergency_contact_phone,
            occupation=parent_profile.occupation,
            is_primary_payer=parent_profile.is_primary_payer,
            is_active=parent_user.is_active,
            program_id=program_context or "unknown",
            enrollment_date=parent_profile.enrollment_date.isoformat() if parent_profile.enrollment_date else None,
            created_at=parent_profile.created_at.isoformat(),
            updated_at=parent_profile.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating parent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating parent"
        )


@router.get("", response_model=ParentListResponse)
async def list_parents(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    has_children: Optional[bool] = Query(None, description="Filter parents with/without children"),
    is_primary_payer: Optional[bool] = Query(None, description="Filter by payment responsibility"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """
    List parents with optional search and pagination.
    
    Supports filtering by various criteria and sorting.
    """
    try:
        parents, total_count = parent_service.get_parents_list(
            db=db,
            program_context=program_context,
            page=page,
            per_page=per_page,
            search=search,
            has_children=has_children
        )
        
        # Build response with parent data using the service method
        parent_items = []
        for parent in parents:
            parent_data = parent_service._to_parent_response(db, parent)
            parent_items.append(parent_data)
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ParentListResponse(
            items=parent_items,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        logger.error(f"Error listing parents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving parents list"
        )


@router.get("/stats", response_model=ParentStatsResponse)
async def get_parent_stats(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Get parent statistics.
    
    Returns counts, demographics, and other statistical information.
    """
    try:
        stats = parent_service.get_parent_stats(
            db=db,
            program_context=program_context
        )
        
        return ParentStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error getting parent stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving parent statistics"
        )


@router.get("/in-program-by-children", response_model=ParentListResponse)
async def get_parents_in_program_by_children(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get parents in program based on their children's course enrollments (new assignment-based approach).
    
    This endpoint returns parents who are visible in the program based on their children's
    course enrollments rather than direct program assignment. This supports the new
    assignment-based workflow where parent program membership is determined by children's enrollments.
    """
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for this operation"
        )
    
    try:
        parents, total_count = parent_service.get_parents_in_program_by_children_enrollment(
            db=db,
            program_id=program_context,
            page=page,
            per_page=per_page
        )
        
        # Build response with parent data using the service method
        parent_items = []
        for parent in parents:
            parent_data = parent_service._to_parent_response(db, parent)
            parent_items.append(parent_data)
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ParentListResponse(
            items=parent_items,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        logger.error(f"Error listing parents by children enrollment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving parents list by children enrollment"
        )


@router.get("/{parent_id}", response_model=ParentResponse)
async def get_parent(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Get a specific parent by ID.
    
    Returns detailed parent information including children relationships.
    """
    try:
        # Get parent with program context filtering
        parent = parent_service.get_parent_by_id(
            db=db,
            parent_id=parent_id,
            program_context=program_context
        )
        
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found or not accessible in current program context"
            )
        
        # Build parent response with user information
        return ParentResponse(
            id=str(parent.id),
            user_id=str(parent.user.id),
            username=parent.user.username,
            email=parent.user.email,
            first_name=parent.user.first_name,
            last_name=parent.user.last_name,
            salutation=parent.user.salutation,
            phone=parent.user.phone,
            date_of_birth=parent.user.date_of_birth.isoformat() if parent.user.date_of_birth else None,
            referral_source=parent.user.referral_source,
            profile_photo_url=parent.user.profile_photo_url,
            address=parent.address,
            emergency_contact_name=parent.emergency_contact_name,
            emergency_contact_phone=parent.emergency_contact_phone,
            occupation=parent.occupation,
            payment_responsibility=parent.is_primary_payer,
            is_active=parent.user.is_active,
            program_id=program_context or "unknown",
            enrollment_date=parent.enrollment_date.isoformat() if parent.enrollment_date else None,
            created_at=parent.created_at.isoformat(),
            updated_at=parent.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving parent {parent_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving parent information"
        )


@router.put("/{parent_id}", response_model=ParentResponse)
async def update_parent(
    parent_id: str,
    parent_data: ParentUpdate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Update parent information.
    
    Allows partial updates of parent data and updates linked User account.
    """
    # Check permissions
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        # First verify parent exists and is accessible
        existing_parent = parent_service.get_parent_by_id(
            db=db,
            parent_id=parent_id,
            program_context=program_context
        )
        
        if not existing_parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found or not accessible in current program context"
            )
        
        # Update parent using the service
        updated_parent = parent_service.update_parent_profile(
            db=db,
            parent_id=parent_id,
            parent_update=parent_data,
            updated_by=current_user.id,
            program_context=program_context
        )
        
        if not updated_parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found after update"
            )
        
        # Build response with updated information
        return ParentResponse(
            id=str(updated_parent.id),
            user_id=str(updated_parent.user.id),
            username=updated_parent.user.username,
            email=updated_parent.user.email,
            first_name=updated_parent.user.first_name,
            last_name=updated_parent.user.last_name,
            salutation=updated_parent.user.salutation,
            phone=updated_parent.user.phone,
            date_of_birth=updated_parent.user.date_of_birth.isoformat() if updated_parent.user.date_of_birth else None,
            referral_source=updated_parent.user.referral_source,
            profile_photo_url=updated_parent.user.profile_photo_url,
            address=updated_parent.address,
            emergency_contact_name=updated_parent.emergency_contact_name,
            emergency_contact_phone=updated_parent.emergency_contact_phone,
            occupation=updated_parent.occupation,
            is_primary_payer=updated_parent.is_primary_payer,
            is_active=updated_parent.user.is_active,
            program_id=program_context or "unknown",
            enrollment_date=updated_parent.enrollment_date.isoformat() if updated_parent.enrollment_date else None,
            created_at=updated_parent.created_at.isoformat(),
            updated_at=updated_parent.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating parent {parent_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating parent information"
        )


@router.delete("/{parent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parent(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Delete a parent.
    
    Permanently removes the parent from the system.
    Requires admin privileges and handles family relationship cleanup.
    """
    # Check admin permissions
    if not current_user.get("roles") or "super_admin" not in current_user["roles"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete parents"
        )
    
    try:
        # First verify parent exists and is accessible
        existing_parent = parent_service.get_parent_by_id(
            db=db,
            parent_id=parent_id,
            program_context=program_context
        )
        
        if not existing_parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found or not accessible in current program context"
            )
        
        # Check for existing child relationships before deletion
        children = parent_service.get_parent_children(
            db=db,
            parent_id=parent_id,
            program_context=program_context
        )
        
        if children:
            # For safety, we'll require explicit handling of children first
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete parent with {len(children)} active child relationships. Please remove child relationships first."
            )
        
        # Perform deletion using the service
        success = parent_service.delete_parent_profile(
            db=db,
            parent_id=parent_id,
            deleted_by=current_user.id,
            program_context=program_context
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found for deletion"
            )
        
        # Return 204 No Content on successful deletion
        logger.info(f"Parent {parent_id} deleted successfully by {current_user['id']}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting parent {parent_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting parent"
        )


@router.get("/{parent_id}/children", response_model=List[dict])
async def get_parent_children(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Get all children for a specific parent.
    
    Returns list of students linked to this parent with relationship details.
    """
    try:
        children = parent_service.get_parent_children(
            db=db,
            parent_id=parent_id,
            program_context=program_context
        )
        
        # Convert to response format
        children_response = []
        for child_data in children:
            student = child_data["student"]
            user = student.user
            relationship = child_data["relationship"]
            
            child_info = {
                "student_id": str(student.id),
                "user_id": str(user.id),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
                "is_active": user.is_active,
                "relationship": {
                    "can_pickup": relationship["can_pickup"],
                    "is_emergency_contact": relationship["is_emergency_contact"],
                    "has_payment_responsibility": relationship["has_payment_responsibility"],
                    "pickup_notes": relationship["pickup_notes"],
                    "special_instructions": relationship["special_instructions"]
                },
                "created_at": student.created_at.isoformat(),
                "updated_at": student.updated_at.isoformat()
            }
            children_response.append(child_info)
        
        return children_response
        
    except Exception as e:
        logger.error(f"Error getting parent children: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving parent's children"
        )


# New Two-Step Workflow Endpoints for Parents

@router.post("/profile-only", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_parent_profile_only(
    parent_data: ParentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Create a parent profile without automatic program assignment (Step 1 of two-step workflow).
    
    This endpoint creates a parent profile that can later be assigned to programs via
    child course enrollments. It separates profile creation from program assignment.
    """
    # Check permissions
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        # Create parent profile without program context for flexible assignment
        result = atomic_creation_service.create_parent_with_children(
            db=db,
            parent_data=parent_data,
            children_data=[],  # No children in profile-only creation
            program_context=None,  # No automatic program assignment
            created_by=current_user.id
        )
        
        parent_profile = result["parent"]["profile"]
        parent_user = result["parent"]["user"]
        
        return ParentResponse(
            id=str(parent_profile.id),
            user_id=str(parent_user.id),
            username=parent_user.username,
            email=parent_user.email,
            first_name=parent_user.first_name,
            last_name=parent_user.last_name,
            salutation=parent_user.salutation,
            phone=parent_user.phone,
            date_of_birth=parent_user.date_of_birth.isoformat() if parent_user.date_of_birth else None,
            referral_source=parent_user.referral_source,
            profile_photo_url=parent_user.profile_photo_url,
            address=parent_profile.address,
            emergency_contact_name=parent_profile.emergency_contact_name,
            emergency_contact_phone=parent_profile.emergency_contact_phone,
            occupation=parent_profile.occupation,
            is_primary_payer=parent_profile.is_primary_payer,
            is_active=parent_user.is_active,
            program_id=program_context or "unknown",
            enrollment_date=parent_profile.enrollment_date.isoformat() if parent_profile.enrollment_date else None,
            created_at=parent_profile.created_at.isoformat(),
            updated_at=parent_profile.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating parent profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating parent profile"
        )


@router.post("/{parent_id}/assign-to-program")
async def assign_parent_to_program(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_id: str = Query(..., description="Program ID to assign to"),
    assignment_notes: Optional[str] = Query(None, description="Assignment notes")
):
    """
    Assign a parent to a program (Step 2 of two-step workflow).
    
    This endpoint assigns an existing parent profile to a specific program,
    typically done when their children are enrolled in courses within that program.
    """
    # Check permissions
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        # Get parent to get user_id
        parent = parent_service.get_parent_by_id(db, parent_id, program_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        # Use the course assignment service to create program assignment
        from app.features.enrollments.services.enrollment_service import course_assignment_service
        
        assignment = course_assignment_service._ensure_program_assignment(
            db, parent.user_id, program_id, current_user.id
        )
        
        return {
            "success": True,
            "message": "Parent assigned to program successfully",
            "assignment": {
                "id": assignment.id,
                "user_id": assignment.user_id,
                "program_id": assignment.program_id,
                "role_in_program": assignment.role_in_program.value,
                "assignment_date": assignment.assignment_date.isoformat(),
                "is_active": assignment.is_active
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning parent to program: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error assigning parent to program"
        )


@router.post("/{parent_id}/assign-child-to-course")
async def assign_parent_child_to_course(
    parent_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context),
    child_user_id: str = Query(..., description="Child user ID to assign"),
    course_id: str = Query(..., description="Course ID to assign to"),
    assignment_type: Optional[str] = Query("parent_assigned", description="Assignment type"),
    credits_awarded: Optional[int] = Query(0, description="Credits to award"),
    assignment_notes: Optional[str] = Query(None, description="Assignment notes"),
    referral_source: Optional[str] = Query(None, description="Referral source")
):
    """
    Assign a parent's child to a course (parent-initiated assignment).
    
    This endpoint allows parents to enroll their children in courses, which also
    makes the parent visible in the program through the parent-child relationship.
    """
    # Check permissions
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for this operation"
        )
    
    try:
        # Verify parent exists and has relationship with child
        parent = parent_service.get_parent_by_id(db, parent_id, program_context)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
        
        # Check if parent-child relationship exists
        has_relationship = relationship_service.has_parent_child_relationship(
            db, parent_id, child_user_id, program_context
        )
        if not has_relationship:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent-child relationship not found"
            )
        
        # Enroll child in course using course assignment service
        from app.features.enrollments.services.enrollment_service import course_assignment_service
        
        assignment_details = {
            'assignment_type': assignment_type,
            'credits_awarded': credits_awarded,
            'assignment_notes': assignment_notes,
            'referral_source': referral_source,
            'notes': f"Assigned by parent {parent.user.first_name} {parent.user.last_name}"
        }
        
        enrollment = course_assignment_service.assign_user_to_course(
            db=db,
            user_id=child_user_id,
            course_id=course_id,
            program_context=program_context,
            assigned_by=current_user.id,
            assignment_details=assignment_details
        )
        
        # Also ensure parent is assigned to the program
        course_assignment_service._ensure_program_assignment(
            db, parent.user_id, program_context, current_user.id
        )
        
        return {
            "success": True,
            "message": "Child enrolled in course successfully by parent",
            "enrollment": {
                "id": enrollment.id,
                "user_id": enrollment.user_id,
                "course_id": enrollment.course_id,
                "program_id": enrollment.program_id,
                "status": enrollment.status.value,
                "enrollment_date": enrollment.enrollment_date.isoformat(),
                "assignment_date": enrollment.assignment_date.isoformat(),
                "assignment_type": enrollment.assignment_type.value,
                "assigned_by_parent": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning child to course: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error assigning child to course"
        )


# Unified Creation Workflows

@router.post("/create-with-program",
    response_model=UnifiedParentCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create parent with automatic program association",
    description="""
    Create a parent with automatic program association and optional child relationships.
    
    This unified workflow:
    1. Creates user account with parent role
    2. Creates parent profile
    3. Auto-assigns to program (from admin's program context) 
    4. Optionally creates parent-child relationships
    
    Designed for program administrators to streamline parent creation.
    """
)
async def create_parent_with_program(
    request: UnifiedParentCreateRequest,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    program_context: Optional[str] = Depends(get_program_context)
):
    """
    Create a parent with automatic program association and optional child relationships.
    
    This is a unified workflow for program administrators that combines user creation,
    parent profile creation, program assignment, and optional child relationships in
    a single atomic transaction.
    """
    # Validate program context is available
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required for unified parent creation"
        )
    
    # Validate admin has access to create users in this program
    has_access = unified_creation_service.validate_program_admin_access(
        db, current_user.id, program_context
    )
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create parents in this program"
        )
    
    try:
        # Prepare user data
        user_data = request.user_data.model_dump()
        user_data["password"] = request.password
        
        # Prepare parent data
        parent_data = request.parent_data.model_dump()
        
        # Call unified creation service
        result = unified_creation_service.create_parent_with_program(
            db=db,
            user_data=user_data,
            parent_data=parent_data,
            program_context=program_context,
            child_student_ids=request.child_student_ids,
            created_by=current_user.id
        )
        
        return UnifiedParentCreateResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in unified parent creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error during parent creation"
        )