"""
Program API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.programs.schemas.program import (
    ProgramCreate,
    ProgramUpdate,
    ProgramResponse,
    ProgramListResponse,
    ProgramSearchParams,
    ProgramStatsResponse,
    ProgramTreeResponse,
)
from app.features.courses.schemas.common import BulkActionRequest, BulkActionResponse
from app.features.programs.services.program_service import program_service


router = APIRouter()


@router.post("", response_model=ProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_program(
    program_data: ProgramCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new program.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        program = program_service.create_program(db, program_data, current_user["id"])
        return program
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating program: {str(e)}"
        )


@router.get("", response_model=ProgramListResponse)
async def list_programs(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: Optional[str] = Query("display_order", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List programs with optional search and pagination.
    
    Supports filtering by status, category and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, status_filter, category, sort_by]):
            search_params = ProgramSearchParams(
                search=search,
                status=status_filter,
                category=category,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        programs, total_count = program_service.list_programs(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ProgramListResponse(
            items=programs,
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
            detail=f"Error listing programs: {str(e)}"
        )


@router.get("/stats", response_model=ProgramStatsResponse)
async def get_program_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get program statistics.
    
    Returns counts, categories, and other statistical information.
    """
    try:
        stats = program_service.get_program_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting program stats: {str(e)}"
        )


@router.get("/{program_id}", response_model=ProgramResponse)
async def get_program(
    program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific program by ID.
    
    Returns detailed program information.
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    return program


@router.put("/{program_id}", response_model=ProgramResponse)
async def update_program(
    program_id: str,
    program_data: ProgramUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update program information.
    
    Allows partial updates of program data.
    """
    try:
        program = program_service.update_program(db, program_id, program_data, current_user["id"])
        if not program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Program not found"
            )
        return program
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating program: {str(e)}"
        )


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(
    program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a program.
    
    Permanently removes the program from the system.
    Requires admin privileges and no associated courses.
    """
    # Check admin permissions
    if current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super administrators can delete programs"
        )
    
    try:
        success = program_service.delete_program(db, program_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Program not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting program: {str(e)}"
        )


@router.get("/by-code/{program_code}", response_model=ProgramResponse)
async def get_program_by_code(
    program_code: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a program by its program code.
    
    Alternative lookup method using the program code.
    """
    program = program_service.get_program_by_code(db, program_code)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    return program


@router.get("/{program_id}/tree", response_model=ProgramTreeResponse)
async def get_program_tree(
    program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get program with full tree structure of courses and curricula.
    
    Returns hierarchical structure for navigation.
    """
    tree = program_service.get_program_tree(db, program_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    return tree


@router.get("/{program_id}/statistics")
async def get_program_statistics(
    program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get comprehensive statistics for a program.
    
    Returns detailed statistics including courses, students, team members, and facilities.
    """
    statistics = program_service.get_program_statistics(db, program_id)
    if not statistics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    return {"success": True, "data": statistics}


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    action_data: BulkActionRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update program status.
    
    Updates status for multiple programs at once.
    """
    try:
        new_status = action_data.parameters.get("status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status parameter is required"
            )
        
        result = program_service.bulk_update_status(
            db,
            action_data.item_ids,
            new_status,
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
            detail=f"Error performing bulk action: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_programs(
    reorder_data: List[dict],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder programs by updating display order.
    
    Accepts list of {id, sequence} mappings.
    """
    try:
        result = program_service.reorder_programs(
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
            detail=f"Error reordering programs: {str(e)}"
        )


@router.post("/{program_id}/apply-defaults", response_model=ProgramResponse)
async def apply_default_configuration(
    program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Apply default configuration to an existing program.
    
    Fills in missing configuration fields with sensible defaults.
    Useful for upgrading programs created before enhanced configuration was available.
    """
    try:
        program = program_service.apply_default_configuration(db, program_id, current_user["id"])
        if not program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Program not found"
            )
        return program
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying default configuration: {str(e)}"
        )