"""
Curriculum API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.middleware import create_program_filter_dependency
from app.features.courses.schemas.curriculum import (
    CurriculumCreate,
    CurriculumUpdate,
    CurriculumResponse,
    CurriculumListResponse,
    CurriculumSearchParams,
    CurriculumStatsResponse,
    CurriculumTreeResponse,
    CurriculumBulkMoveRequest,
    CurriculumBulkStatusUpdateRequest,
    CurriculumDuplicateRequest,
)
from app.features.courses.schemas.common import BulkActionResponse
from app.features.courses.services.curriculum_service import curriculum_service


router = APIRouter()

# Create program filter dependency with authentication integration
get_program_filter = create_program_filter_dependency(get_current_active_user)


@router.post("/", response_model=CurriculumResponse, status_code=status.HTTP_201_CREATED)
async def create_curriculum(
    curriculum_data: CurriculumCreate,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new curriculum.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        curriculum = curriculum_service.create_curriculum(db, curriculum_data, current_user["id"], program_context)
        return curriculum
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating curriculum: {str(e)}"
        )


@router.get("/", response_model=CurriculumListResponse)
async def list_curricula(
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    difficulty_level: Optional[str] = Query(None, description="Filter by difficulty level"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    min_age_from: Optional[int] = Query(None, ge=3, description="Minimum age filter from"),
    min_age_to: Optional[int] = Query(None, ge=3, description="Minimum age filter to"),
    sort_by: Optional[str] = Query("display_order", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List curricula with optional search and pagination.
    
    Supports filtering by course, program, difficulty, age range and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, course_id, program_id, difficulty_level, status_filter, min_age_from, min_age_to, sort_by]):
            search_params = CurriculumSearchParams(
                search=search,
                course_id=course_id,
                program_id=program_id,
                difficulty_level=difficulty_level,
                status=status_filter,
                min_age_from=min_age_from,
                min_age_to=min_age_to,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        curricula, total_count = curriculum_service.list_curricula(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page,
            program_context=program_context
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return CurriculumListResponse(
            items=curricula,
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
            detail=f"Error listing curricula: {str(e)}"
        )


@router.get("/stats", response_model=CurriculumStatsResponse)
async def get_curriculum_stats(
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get curriculum statistics.
    
    Returns counts, difficulty distribution, age ranges, and other statistical information.
    """
    try:
        stats = curriculum_service.get_curriculum_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting curriculum stats: {str(e)}"
        )


@router.get("/{curriculum_id}", response_model=CurriculumResponse)
async def get_curriculum(
    curriculum_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific curriculum by ID.
    
    Returns detailed curriculum information.
    """
    curriculum = curriculum_service.get_curriculum(db, curriculum_id, program_context)
    if not curriculum:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curriculum not found"
        )
    
    return curriculum


@router.put("/{curriculum_id}", response_model=CurriculumResponse)
async def update_curriculum(
    curriculum_id: str,
    curriculum_data: CurriculumUpdate,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update curriculum information.
    
    Allows partial updates of curriculum data.
    """
    try:
        curriculum = curriculum_service.update_curriculum(db, curriculum_id, curriculum_data, current_user["id"], program_context)
        if not curriculum:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curriculum not found"
            )
        return curriculum
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating curriculum: {str(e)}"
        )


@router.delete("/{curriculum_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_curriculum(
    curriculum_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a curriculum.
    
    Permanently removes the curriculum from the system.
    Requires admin privileges and no associated levels.
    """
    # Check admin permissions
    if current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete curricula"
        )
    
    try:
        success = curriculum_service.delete_curriculum(db, curriculum_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curriculum not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting curriculum: {str(e)}"
        )


@router.get("/by-course/{course_id}", response_model=CurriculumListResponse)
async def get_curricula_by_course(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all curricula for a specific course.
    
    Returns curricula ordered by display order.
    """
    try:
        curricula, total_count = curriculum_service.get_curricula_by_course(
            db=db,
            course_id=course_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return CurriculumListResponse(
            items=curricula,
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
            detail=f"Error getting curricula by course: {str(e)}"
        )


@router.get("/{curriculum_id}/tree", response_model=CurriculumTreeResponse)
async def get_curriculum_tree(
    curriculum_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get curriculum with full tree structure of levels, modules, and lessons.
    
    Returns hierarchical structure for navigation.
    """
    tree = curriculum_service.get_curriculum_tree(db, curriculum_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curriculum not found"
        )
    
    return tree


@router.post("/{curriculum_id}/duplicate", response_model=CurriculumResponse)
async def duplicate_curriculum(
    curriculum_id: str,
    duplicate_data: CurriculumDuplicateRequest,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Duplicate a curriculum with all its content.
    
    Creates a copy of the curriculum with new name and optional target course.
    """
    try:
        curriculum = curriculum_service.duplicate_curriculum(
            db,
            curriculum_id,
            duplicate_data,
            current_user["id"]
        )
        
        return curriculum
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error duplicating curriculum: {str(e)}"
        )


@router.post("/bulk-move", response_model=BulkActionResponse)
async def bulk_move_curricula(
    move_data: CurriculumBulkMoveRequest,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk move curricula to a different course.
    
    Moves multiple curricula to a new course.
    """
    try:
        result = curriculum_service.bulk_move_curricula(
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
            detail=f"Error moving curricula: {str(e)}"
        )


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    status_data: CurriculumBulkStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update curriculum status.
    
    Updates status for multiple curricula at once.
    """
    try:
        result = curriculum_service.bulk_update_status(
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
            detail=f"Error updating curriculum status: {str(e)}"
        )


@router.post("/{curriculum_id}/set-default", response_model=CurriculumResponse)
async def set_default_curriculum(
    curriculum_id: str,
    age_groups: List[str],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Set a curriculum as default for specific age groups.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        result = curriculum_service.set_default_curriculum(
            db,
            curriculum_id,
            age_groups,
            program_context
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curriculum not found"
            )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error setting default curriculum: {str(e)}"
        )


@router.delete("/{curriculum_id}/remove-default", response_model=CurriculumResponse)
async def remove_default_curriculum(
    curriculum_id: str,
    age_groups: List[str],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Remove default status from a curriculum for specific age groups.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        result = curriculum_service.remove_default_curriculum(
            db,
            curriculum_id,
            age_groups,
            program_context
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curriculum not found"
            )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing default curriculum: {str(e)}"
        )


@router.get("/courses/{course_id}/defaults")
async def get_default_curricula_by_course(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get default curricula mapping for each age group in a course.
    
    Returns a mapping of age group -> curriculum ID.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        result = curriculum_service.get_default_curricula_by_course(
            db,
            course_id,
            program_context
        )
        
        return {"defaults": result}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting default curricula: {str(e)}"
        )