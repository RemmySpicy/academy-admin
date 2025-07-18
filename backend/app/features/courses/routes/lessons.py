"""
Lesson API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.courses.schemas.lesson import (
    LessonCreate,
    LessonUpdate,
    LessonResponse,
    LessonListResponse,
    LessonSearchParams,
    LessonStatsResponse,
    LessonDetailResponse,
    LessonReorderRequest,
    LessonBulkStatusUpdateRequest,
    LessonProgressTrackingResponse,
    LessonDuplicateRequest,
)
from app.features.courses.schemas.common import BulkActionResponse
from app.features.courses.services.lesson_service import lesson_service


router = APIRouter()


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_data: LessonCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new lesson.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        lesson = lesson_service.create_lesson(db, lesson_data, current_user["id"])
        return lesson
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating lesson: {str(e)}"
        )


@router.get("/", response_model=LessonListResponse)
async def list_lessons(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    section_id: Optional[str] = Query(None, description="Filter by section ID"),
    module_id: Optional[str] = Query(None, description="Filter by module ID"),
    level_id: Optional[str] = Query(None, description="Filter by level ID"),
    curriculum_id: Optional[str] = Query(None, description="Filter by curriculum ID"),
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    lesson_type: Optional[str] = Query(None, description="Filter by lesson type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    duration_minutes_min: Optional[int] = Query(None, ge=1, description="Minimum duration minutes"),
    duration_minutes_max: Optional[int] = Query(None, ge=1, description="Maximum duration minutes"),
    sequence_from: Optional[int] = Query(None, ge=1, description="Sequence range from"),
    sequence_to: Optional[int] = Query(None, ge=1, description="Sequence range to"),
    sort_by: Optional[str] = Query("sequence", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List lessons with optional search and pagination.
    
    Supports filtering by section, module, level, curriculum, course, program, type, status, duration, sequence and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, section_id, module_id, level_id, curriculum_id, course_id, program_id, 
                lesson_type, status, duration_minutes_min, duration_minutes_max, sequence_from, sequence_to, sort_by]):
            search_params = LessonSearchParams(
                search=search,
                section_id=section_id,
                module_id=module_id,
                level_id=level_id,
                curriculum_id=curriculum_id,
                course_id=course_id,
                program_id=program_id,
                lesson_type=lesson_type,
                status=status,
                duration_minutes_min=duration_minutes_min,
                duration_minutes_max=duration_minutes_max,
                sequence_from=sequence_from,
                sequence_to=sequence_to,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        lessons, total_count = lesson_service.list_lessons(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return LessonListResponse(
            items=lessons,
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
            detail=f"Error listing lessons: {str(e)}"
        )


@router.get("/stats", response_model=LessonStatsResponse)
async def get_lesson_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get lesson statistics.
    
    Returns counts, type distribution, duration analysis, and other statistical information.
    """
    try:
        stats = lesson_service.get_lesson_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting lesson stats: {str(e)}"
        )


@router.get("/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific lesson by ID with full details.
    
    Returns detailed lesson information including content, media, and assessments.
    """
    lesson = lesson_service.get_lesson_detail(db, lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: str,
    lesson_data: LessonUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update lesson information.
    
    Allows partial updates of lesson data.
    """
    try:
        lesson = lesson_service.update_lesson(db, lesson_id, lesson_data, current_user["id"])
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        return lesson
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lesson: {str(e)}"
        )


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a lesson.
    
    Permanently removes the lesson from the system.
    Requires admin privileges.
    """
    # Check admin permissions
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete lessons"
        )
    
    try:
        success = lesson_service.delete_lesson(db, lesson_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting lesson: {str(e)}"
        )


@router.get("/by-section/{section_id}", response_model=LessonListResponse)
async def get_lessons_by_section(
    section_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all lessons for a specific section.
    
    Returns lessons ordered by sequence.
    """
    try:
        lessons, total_count = lesson_service.get_lessons_by_section(
            db=db,
            section_id=section_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return LessonListResponse(
            items=lessons,
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
            detail=f"Error getting lessons by section: {str(e)}"
        )


@router.get("/{lesson_id}/progress", response_model=LessonProgressTrackingResponse)
async def get_lesson_progress(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get progress tracking information for a lesson.
    
    Returns student progress, completion rates, and assessment results.
    """
    try:
        progress = lesson_service.get_lesson_progress_tracking(db, lesson_id)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        return progress
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting lesson progress: {str(e)}"
        )


@router.post("/{lesson_id}/duplicate", response_model=LessonResponse)
async def duplicate_lesson(
    lesson_id: str,
    duplicate_data: LessonDuplicateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Duplicate a lesson with all its content.
    
    Creates a copy of the lesson with new name and optional target section.
    """
    try:
        lesson = lesson_service.duplicate_lesson(
            db,
            lesson_id,
            duplicate_data,
            current_user["id"]
        )
        
        return lesson
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error duplicating lesson: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_lessons(
    reorder_data: LessonReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder lessons within their section by updating sequence.
    
    All lessons must belong to the same section.
    """
    try:
        result = lesson_service.reorder_lessons(
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
            detail=f"Error reordering lessons: {str(e)}"
        )


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    status_data: LessonBulkStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update lesson status.
    
    Updates status for multiple lessons at once.
    """
    try:
        result = lesson_service.bulk_update_status(
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
            detail=f"Error updating lesson status: {str(e)}"
        )