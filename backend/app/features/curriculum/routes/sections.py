"""
Section API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.curriculum.schemas.section import (
    SectionCreate,
    SectionUpdate,
    SectionResponse,
    SectionListResponse,
    SectionSearchParams,
    SectionStatsResponse,
    SectionTreeResponse,
    SectionReorderRequest,
    SectionBulkStatusUpdateRequest,
    SectionProgressTrackingResponse,
)
from app.features.curriculum.schemas.common import BulkActionResponse
from app.features.curriculum.services.section_service import section_service


router = APIRouter()


@router.post("/", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    section_data: SectionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new section.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        section = section_service.create_section(db, section_data, current_user["id"])
        return section
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating section: {str(e)}"
        )


@router.get("/", response_model=SectionListResponse)
async def list_sections(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    module_id: Optional[str] = Query(None, description="Filter by module ID"),
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
    List sections with optional search and pagination.
    
    Supports filtering by module, level, curriculum, course, program, status, duration, sequence and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, module_id, level_id, curriculum_id, course_id, program_id, status, 
                duration_hours_min, duration_hours_max, sequence_from, sequence_to, sort_by]):
            search_params = SectionSearchParams(
                search=search,
                module_id=module_id,
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
        
        sections, total_count = section_service.list_sections(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return SectionListResponse(
            items=sections,
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
            detail=f"Error listing sections: {str(e)}"
        )


@router.get("/stats", response_model=SectionStatsResponse)
async def get_section_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get section statistics.
    
    Returns counts, duration analysis, completion rates, and other statistical information.
    """
    try:
        stats = section_service.get_section_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting section stats: {str(e)}"
        )


@router.get("/{section_id}", response_model=SectionResponse)
async def get_section(
    section_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific section by ID.
    
    Returns detailed section information.
    """
    section = section_service.get_section(db, section_id)
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    return section


@router.put("/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: str,
    section_data: SectionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update section information.
    
    Allows partial updates of section data.
    """
    try:
        section = section_service.update_section(db, section_id, section_data, current_user["id"])
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found"
            )
        return section
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating section: {str(e)}"
        )


@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a section.
    
    Permanently removes the section from the system.
    Requires admin privileges and no associated lessons.
    """
    # Check admin permissions
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete sections"
        )
    
    try:
        success = section_service.delete_section(db, section_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting section: {str(e)}"
        )


@router.get("/by-module/{module_id}", response_model=SectionListResponse)
async def get_sections_by_module(
    module_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all sections for a specific module.
    
    Returns sections ordered by sequence.
    """
    try:
        sections, total_count = section_service.get_sections_by_module(
            db=db,
            module_id=module_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return SectionListResponse(
            items=sections,
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
            detail=f"Error getting sections by module: {str(e)}"
        )


@router.get("/{section_id}/tree", response_model=SectionTreeResponse)
async def get_section_tree(
    section_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get section with full tree structure of lessons.
    
    Returns hierarchical structure for navigation.
    """
    tree = section_service.get_section_tree(db, section_id)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    return tree


@router.get("/{section_id}/progress", response_model=SectionProgressTrackingResponse)
async def get_section_progress(
    section_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get progress tracking information for a section.
    
    Returns student progress, completion rates, and common challenges.
    """
    try:
        progress = section_service.get_section_progress_tracking(db, section_id)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section not found"
            )
        return progress
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting section progress: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_sections(
    reorder_data: SectionReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder sections within their module by updating sequence.
    
    All sections must belong to the same module.
    """
    try:
        result = section_service.reorder_sections(
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
            detail=f"Error reordering sections: {str(e)}"
        )


@router.post("/bulk-status", response_model=BulkActionResponse)
async def bulk_update_status(
    status_data: SectionBulkStatusUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update section status.
    
    Updates status for multiple sections at once.
    """
    try:
        result = section_service.bulk_update_status(
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
            detail=f"Error updating section status: {str(e)}"
        )