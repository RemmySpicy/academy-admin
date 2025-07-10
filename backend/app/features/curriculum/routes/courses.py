"""
Course API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.curriculum.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseListResponse,
    CourseSearchParams,
    CourseStatsResponse,
    CourseTreeResponse,
    CourseBulkMoveRequest,
    CourseBulkStatusUpdateRequest,
)
from app.features.curriculum.schemas.common import BulkActionResponse
from app.features.curriculum.services.course_service import course_service


router = APIRouter()


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new course.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        course = course_service.create_course(db, course_data, current_user["id"])
        return course
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating course: {str(e)}"
        )


@router.get("/", response_model=CourseListResponse)
async def list_courses(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    duration_weeks_min: Optional[int] = Query(None, ge=1, description="Minimum duration weeks"),
    duration_weeks_max: Optional[int] = Query(None, ge=1, description="Maximum duration weeks"),
    sort_by: Optional[str] = Query("display_order", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List courses with optional search and pagination.
    
    Supports filtering by program, status, duration and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, program_id, status, duration_weeks_min, duration_weeks_max, sort_by]):
            search_params = CourseSearchParams(
                search=search,
                program_id=program_id,
                status=status,
                duration_weeks_min=duration_weeks_min,
                duration_weeks_max=duration_weeks_max,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        courses, total_count = course_service.list_courses(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return CourseListResponse(
            items=courses,
            total=total_count,
            page=page,
            limit=per_page,
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
            detail=f"Error listing courses: {str(e)}"
        )


@router.get("/stats", response_model=CourseStatsResponse)
async def get_course_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get course statistics.
    
    Returns counts, duration analysis, and other statistical information.
    """
    try:
        stats = course_service.get_course_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting course stats: {str(e)}"
        )


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific course by ID.
    
    Returns detailed course information.
    """
    course = course_service.get_course(db, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return course


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update course information.
    
    Allows partial updates of course data.
    """
    try:
        course = course_service.update_course(db, course_id, course_data, current_user["id"])
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        return course
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating course: {str(e)}"
        )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a course.
    
    Permanently removes the course from the system.
    Requires admin privileges and no associated curricula.
    """
    # Check admin permissions
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete courses"
        )
    
    try:
        success = course_service.delete_course(db, course_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting course: {str(e)}"
        )


@router.get("/by-program/{program_id}", response_model=CourseListResponse)
async def get_courses_by_program(
    program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all courses for a specific program.
    
    Returns courses ordered by display order.
    """
    try:
        courses, total_count = course_service.get_courses_by_program(
            db=db,
            program_id=program_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return CourseListResponse(
            items=courses,
            total=total_count,
            page=page,
            limit=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting courses by program: {str(e)}"
        )


@router.get("/{course_id}/tree", response_model=CourseTreeResponse)
async def get_course_tree(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get course with full tree structure of curricula and levels.
    
    Returns hierarchical structure for navigation.
    """
    tree = course_service.get_course_tree(db, course_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return tree


@router.post("/bulk-move", response_model=BulkActionResponse)
async def bulk_move_courses(
    move_data: CourseBulkMoveRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk move courses to a different program.
    
    Moves multiple courses to a new program.
    """
    try:
        result = course_service.bulk_move_courses(
            db,
            move_data,
            current_user["id"]
        )
        
        return BulkActionResponse(
            successful=result["successful"],
            failed=result["failed"],
            total_processed=result["total_processed"],
            total_successful=result["total_successful"],
            total_failed=result["total_failed"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error moving courses: {str(e)}"
        )


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    status_data: CourseBulkStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update course status.
    
    Updates status for multiple courses at once.
    """
    try:
        result = course_service.bulk_update_status(
            db,
            status_data,
            current_user["id"]
        )
        
        return BulkActionResponse(
            successful=result["successful"],
            failed=result["failed"],
            total_processed=result["total_processed"],
            total_successful=result["total_successful"],
            total_failed=result["total_failed"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating course status: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_courses(
    reorder_data: List[dict],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder courses within their program by updating display order.
    
    Accepts list of {id, sequence} mappings.
    """
    try:
        result = course_service.reorder_courses(
            db,
            reorder_data,
            current_user["id"]
        )
        
        return BulkActionResponse(
            successful=result["successful"],
            failed=result["failed"],
            total_processed=result["total_processed"],
            total_successful=result["total_successful"],
            total_failed=result["total_failed"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reordering courses: {str(e)}"
        )