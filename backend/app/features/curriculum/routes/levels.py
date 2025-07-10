"""
Level API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.curriculum.schemas.level import (
    LevelCreate,
    LevelUpdate,
    LevelResponse,
    LevelListResponse,
    LevelSearchParams,
    LevelStatsResponse,
    LevelTreeResponse,
    LevelReorderRequest,
    LevelBulkStatusUpdateRequest,
    LevelProgressTrackingResponse,
)
from app.features.curriculum.schemas.common import BulkActionResponse
from app.features.curriculum.services.level_service import level_service


router = APIRouter()


@router.post("/", response_model=LevelResponse, status_code=status.HTTP_201_CREATED)
async def create_level(
    level_data: LevelCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new level.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        level = level_service.create_level(db, level_data, current_user["id"])
        return level
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating level: {str(e)}"
        )


@router.get("/", response_model=LevelListResponse)
async def list_levels(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    curriculum_id: Optional[str] = Query(None, description="Filter by curriculum ID"),
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    duration_hours_min: Optional[float] = Query(None, ge=0, description="Minimum duration hours"),
    duration_hours_max: Optional[float] = Query(None, ge=0, description="Maximum duration hours"),
    sequence_from: Optional[int] = Query(None, ge=1, description="Sequence range from"),
    sequence_to: Optional[int] = Query(None, ge=1, description="Sequence range to"),
    sort_by: Optional[str] = Query("sequence", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List levels with optional search and pagination.
    
    Supports filtering by curriculum, course, program, status, duration, sequence and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, curriculum_id, course_id, program_id, status, duration_hours_min, 
                duration_hours_max, sequence_from, sequence_to, sort_by]):
            search_params = LevelSearchParams(
                search=search,
                curriculum_id=curriculum_id,
                course_id=course_id,
                program_id=program_id,
                status=status,
                duration_hours_min=duration_hours_min,
                duration_hours_max=duration_hours_max,
                sequence_from=sequence_from,
                sequence_to=sequence_to,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        levels, total_count = level_service.list_levels(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return LevelListResponse(
            items=levels,
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
            detail=f"Error listing levels: {str(e)}"
        )


@router.get("/stats", response_model=LevelStatsResponse)
async def get_level_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get level statistics.
    
    Returns counts, duration analysis, completion rates, and other statistical information.
    """
    try:
        stats = level_service.get_level_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting level stats: {str(e)}"
        )


@router.get("/{level_id}", response_model=LevelResponse)
async def get_level(
    level_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific level by ID.
    
    Returns detailed level information.
    """
    level = level_service.get_level(db, level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found"
        )
    
    return level


@router.put("/{level_id}", response_model=LevelResponse)
async def update_level(
    level_id: str,
    level_data: LevelUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update level information.
    
    Allows partial updates of level data.
    """
    try:
        level = level_service.update_level(db, level_id, level_data, current_user["id"])
        if not level:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Level not found"
            )
        return level
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating level: {str(e)}"
        )


@router.delete("/{level_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_level(
    level_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a level.
    
    Permanently removes the level from the system.
    Requires admin privileges and no associated modules.
    """
    # Check admin permissions
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete levels"
        )
    
    try:
        success = level_service.delete_level(db, level_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Level not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting level: {str(e)}"
        )


@router.get("/by-curriculum/{curriculum_id}", response_model=LevelListResponse)
async def get_levels_by_curriculum(
    curriculum_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all levels for a specific curriculum.
    
    Returns levels ordered by sequence.
    """
    try:
        levels, total_count = level_service.get_levels_by_curriculum(
            db=db,
            curriculum_id=curriculum_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return LevelListResponse(
            items=levels,
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
            detail=f"Error getting levels by curriculum: {str(e)}"
        )


@router.get("/{level_id}/tree", response_model=LevelTreeResponse)
async def get_level_tree(
    level_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get level with full tree structure of modules and lessons.
    
    Returns hierarchical structure for navigation.
    """
    tree = level_service.get_level_tree(db, level_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found"
        )
    
    return tree


@router.get("/{level_id}/progress", response_model=LevelProgressTrackingResponse)
async def get_level_progress(
    level_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get progress tracking information for a level.
    
    Returns student progress, completion rates, and common challenges.
    """
    try:
        progress = level_service.get_level_progress_tracking(db, level_id)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Level not found"
            )
        return progress
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting level progress: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_levels(
    reorder_data: LevelReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder levels within their curriculum by updating sequence.
    
    All levels must belong to the same curriculum.
    """
    try:
        result = level_service.reorder_levels(
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
            detail=f"Error reordering levels: {str(e)}"
        )


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    status_data: LevelBulkStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update level status.
    
    Updates status for multiple levels at once.
    """
    try:
        result = level_service.bulk_update_status(
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
            detail=f"Error updating level status: {str(e)}"
        )