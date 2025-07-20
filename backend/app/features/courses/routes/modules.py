"""
Module API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.courses.schemas.module import (
    ModuleCreate,
    ModuleUpdate,
    ModuleResponse,
    ModuleListResponse,
    ModuleSearchParams,
    ModuleStatsResponse,
    ModuleTreeResponse,
    ModuleReorderRequest,
    ModuleBulkStatusUpdateRequest,
    ModuleProgressTrackingResponse,
)
from app.features.courses.schemas.common import BulkActionResponse
from app.features.courses.services.module_service import module_service


router = APIRouter()


@router.post("/", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_module(
    module_data: ModuleCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new module.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        module = module_service.create_module(db, module_data, current_user["id"])
        return module
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating module: {str(e)}"
        )


@router.get("/", response_model=ModuleListResponse)
async def list_modules(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    level_id: Optional[str] = Query(None, description="Filter by level ID"),
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
    List modules with optional search and pagination.
    
    Supports filtering by level, curriculum, course, program, status, duration, sequence and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, level_id, curriculum_id, course_id, program_id, status, 
                duration_hours_min, duration_hours_max, sequence_from, sequence_to, sort_by]):
            search_params = ModuleSearchParams(
                search=search,
                level_id=level_id,
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
        
        modules, total_count = module_service.list_modules(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ModuleListResponse(
            items=modules,
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
            detail=f"Error listing modules: {str(e)}"
        )


@router.get("/stats", response_model=ModuleStatsResponse)
async def get_module_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get module statistics.
    
    Returns counts, duration analysis, completion rates, and other statistical information.
    """
    try:
        stats = module_service.get_module_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting module stats: {str(e)}"
        )


@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(
    module_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific module by ID.
    
    Returns detailed module information.
    """
    module = module_service.get_module(db, module_id)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    return module


@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(
    module_id: str,
    module_data: ModuleUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update module information.
    
    Allows partial updates of module data.
    """
    try:
        module = module_service.update_module(db, module_id, module_data, current_user["id"])
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found"
            )
        return module
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating module: {str(e)}"
        )


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(
    module_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a module.
    
    Permanently removes the module from the system.
    Requires admin privileges and no associated sections.
    """
    # Check admin permissions
    if current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete modules"
        )
    
    try:
        success = module_service.delete_module(db, module_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting module: {str(e)}"
        )


@router.get("/by-level/{level_id}", response_model=ModuleListResponse)
async def get_modules_by_level(
    level_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all modules for a specific level.
    
    Returns modules ordered by sequence.
    """
    try:
        modules, total_count = module_service.get_modules_by_level(
            db=db,
            level_id=level_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ModuleListResponse(
            items=modules,
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
            detail=f"Error getting modules by level: {str(e)}"
        )


@router.get("/{module_id}/tree", response_model=ModuleTreeResponse)
async def get_module_tree(
    module_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get module with full tree structure of sections and lessons.
    
    Returns hierarchical structure for navigation.
    """
    tree = module_service.get_module_tree(db, module_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    return tree


@router.get("/{module_id}/progress", response_model=ModuleProgressTrackingResponse)
async def get_module_progress(
    module_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get progress tracking information for a module.
    
    Returns student progress, completion rates, and common challenges.
    """
    try:
        progress = module_service.get_module_progress_tracking(db, module_id)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found"
            )
        return progress
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting module progress: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_modules(
    reorder_data: ModuleReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder modules within their level by updating sequence.
    
    All modules must belong to the same level.
    """
    try:
        result = module_service.reorder_modules(
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
            detail=f"Error reordering modules: {str(e)}"
        )


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    status_data: ModuleBulkStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update module status.
    
    Updates status for multiple modules at once.
    """
    try:
        result = module_service.bulk_update_status(
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
            detail=f"Error updating module status: {str(e)}"
        )