"""
Student API routes for CRUD operations.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.features.authentication.routes.auth import get_current_active_user
from app.features.students.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentListResponse,
    StudentSearchParams,
    StudentBulkAction,
    StudentBulkActionResponse,
    StudentStatsResponse,
)
from app.features.students.services.student_service import student_service


router = APIRouter()


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    student_data: StudentCreate,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new student.
    
    Requires authentication and appropriate permissions.
    """
    # Check permissions
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        student = student_service.create_student(student_data, current_user["id"])
        return student
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating student: {str(e)}"
        )


@router.get("/", response_model=StudentListResponse)
async def list_students(
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    enrollment_date_from: Optional[str] = Query(None, description="Filter by enrollment date from (YYYY-MM-DD)"),
    enrollment_date_to: Optional[str] = Query(None, description="Filter by enrollment date to (YYYY-MM-DD)"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """
    List students with optional search and pagination.
    
    Supports filtering by various criteria and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, status, enrollment_date_from, enrollment_date_to, gender, sort_by]):
            from datetime import date
            
            search_params = StudentSearchParams(
                search=search,
                status=status,
                enrollment_date_from=date.fromisoformat(enrollment_date_from) if enrollment_date_from else None,
                enrollment_date_to=date.fromisoformat(enrollment_date_to) if enrollment_date_to else None,
                gender=gender,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        students, total_count = student_service.list_students(
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return StudentListResponse(
            items=students,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing students: {str(e)}"
        )


@router.get("/stats", response_model=StudentStatsResponse)
async def get_student_stats(
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get student statistics.
    
    Returns counts, demographics, and other statistical information.
    """
    try:
        stats = student_service.get_student_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting student stats: {str(e)}"
        )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific student by ID.
    
    Returns detailed student information.
    """
    student = student_service.get_student(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: str,
    student_data: StudentUpdate,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update student information.
    
    Allows partial updates of student data.
    """
    try:
        student = student_service.update_student(student_id, student_data, current_user["id"])
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        return student
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating student: {str(e)}"
        )


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a student.
    
    Permanently removes the student from the system.
    Requires admin privileges.
    """
    # Check admin permissions
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete students"
        )
    
    success = student_service.delete_student(student_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )


@router.post("/bulk-action", response_model=StudentBulkActionResponse)
async def bulk_student_action(
    action_data: StudentBulkAction,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Perform bulk actions on students.
    
    Supports operations like bulk status updates.
    """
    try:
        if action_data.action == "update_status":
            new_status = action_data.parameters.get("status")
            if not new_status:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Status parameter is required for update_status action"
                )
            
            result = student_service.bulk_update_status(
                action_data.student_ids,
                new_status,
                current_user["id"]
            )
            
            return StudentBulkActionResponse(
                successful=result["successful"],
                failed=result["failed"],
                total_processed=result["total_processed"],
                total_successful=result["total_successful"],
                total_failed=result["total_failed"]
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported action: {action_data.action}"
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing bulk action: {str(e)}"
        )


@router.get("/by-student-id/{student_id}", response_model=StudentResponse)
async def get_student_by_student_id(
    student_id: str,
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a student by their student ID (STU-YYYY-NNNN).
    
    Alternative lookup method using the formatted student ID.
    """
    student = student_service.get_student_by_student_id(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    return student