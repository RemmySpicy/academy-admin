"""
Equipment API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.curriculum.schemas.equipment import (
    EquipmentRequirementCreate,
    EquipmentRequirementUpdate,
    EquipmentRequirementResponse,
    EquipmentRequirementListResponse,
    EquipmentSearchParams,
    EquipmentStatsResponse,
    EquipmentBulkUpdateRequest,
    EquipmentUsageResponse,
)
from app.features.curriculum.schemas.common import BulkActionResponse
from app.features.curriculum.services.equipment_service import equipment_service


router = APIRouter()


@router.post("/", response_model=EquipmentRequirementResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment_requirement(
    equipment_data: EquipmentRequirementCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new equipment requirement.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        equipment = equipment_service.create_equipment_requirement(db, equipment_data, current_user["id"])
        return equipment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating equipment requirement: {str(e)}"
        )


@router.get("/", response_model=EquipmentRequirementListResponse)
async def list_equipment_requirements(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    lesson_id: Optional[str] = Query(None, description="Filter by lesson ID"),
    section_id: Optional[str] = Query(None, description="Filter by section ID"),
    module_id: Optional[str] = Query(None, description="Filter by module ID"),
    level_id: Optional[str] = Query(None, description="Filter by level ID"),
    curriculum_id: Optional[str] = Query(None, description="Filter by curriculum ID"),
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    equipment_type: Optional[str] = Query(None, description="Filter by equipment type"),
    is_required: Optional[bool] = Query(None, description="Filter by required status"),
    is_consumable: Optional[bool] = Query(None, description="Filter by consumable status"),
    quantity_min: Optional[int] = Query(None, ge=1, description="Minimum quantity"),
    quantity_max: Optional[int] = Query(None, ge=1, description="Maximum quantity"),
    sort_by: Optional[str] = Query("equipment_name", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List equipment requirements with optional search and pagination.
    
    Supports filtering by lesson, section, module, level, curriculum, course, program, type, requirement status, quantity and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, lesson_id, section_id, module_id, level_id, curriculum_id, course_id, program_id, 
                equipment_type, is_required, is_consumable, quantity_min, quantity_max, sort_by]):
            search_params = EquipmentSearchParams(
                search=search,
                lesson_id=lesson_id,
                section_id=section_id,
                module_id=module_id,
                level_id=level_id,
                curriculum_id=curriculum_id,
                course_id=course_id,
                program_id=program_id,
                equipment_type=equipment_type,
                is_required=is_required,
                is_consumable=is_consumable,
                quantity_min=quantity_min,
                quantity_max=quantity_max,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        equipment_requirements, total_count = equipment_service.list_equipment_requirements(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return EquipmentRequirementListResponse(
            items=equipment_requirements,
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
            detail=f"Error listing equipment requirements: {str(e)}"
        )


@router.get("/stats", response_model=EquipmentStatsResponse)
async def get_equipment_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get equipment statistics.
    
    Returns counts, type distribution, usage patterns, and other statistical information.
    """
    try:
        stats = equipment_service.get_equipment_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting equipment stats: {str(e)}"
        )


@router.get("/{equipment_id}", response_model=EquipmentRequirementResponse)
async def get_equipment_requirement(
    equipment_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific equipment requirement by ID.
    
    Returns detailed equipment requirement information.
    """
    equipment = equipment_service.get_equipment_requirement(db, equipment_id)
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment requirement not found"
        )
    
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentRequirementResponse)
async def update_equipment_requirement(
    equipment_id: str,
    equipment_data: EquipmentRequirementUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update equipment requirement information.
    
    Allows partial updates of equipment requirement data.
    """
    try:
        equipment = equipment_service.update_equipment_requirement(db, equipment_id, equipment_data, current_user["id"])
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment requirement not found"
            )
        return equipment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating equipment requirement: {str(e)}"
        )


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment_requirement(
    equipment_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete an equipment requirement.
    
    Permanently removes the equipment requirement from the system.
    """
    try:
        success = equipment_service.delete_equipment_requirement(db, equipment_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipment requirement not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting equipment requirement: {str(e)}"
        )


@router.get("/by-lesson/{lesson_id}", response_model=EquipmentRequirementListResponse)
async def get_equipment_by_lesson(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all equipment requirements for a specific lesson.
    
    Returns equipment requirements ordered by name.
    """
    try:
        equipment_requirements, total_count = equipment_service.get_equipment_by_lesson(
            db=db,
            lesson_id=lesson_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return EquipmentRequirementListResponse(
            items=equipment_requirements,
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
            detail=f"Error getting equipment by lesson: {str(e)}"
        )


@router.get("/usage/{equipment_name}", response_model=EquipmentUsageResponse)
async def get_equipment_usage(
    equipment_name: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get usage information for a specific equipment item.
    
    Returns where the equipment is used across the curriculum.
    """
    try:
        usage = equipment_service.get_equipment_usage(db, equipment_name)
        return usage
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting equipment usage: {str(e)}"
        )


@router.post("/bulk-update", response_model=BulkActionResponse)
async def bulk_update_equipment(
    update_data: EquipmentBulkUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update equipment requirements.
    
    Updates multiple equipment requirements at once.
    """
    try:
        result = equipment_service.bulk_update_equipment(
            db,
            update_data,
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
            detail=f"Error bulk updating equipment: {str(e)}"
        )


@router.get("/inventory/summary", response_model=List[dict])
async def get_equipment_inventory_summary(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get equipment inventory summary.
    
    Returns aggregated equipment needs across all curricula.
    """
    try:
        summary = equipment_service.get_equipment_inventory_summary(db)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting equipment inventory summary: {str(e)}"
        )


@router.get("/requirements/lesson/{lesson_id}", response_model=List[dict])
async def get_lesson_equipment_summary(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get complete equipment requirements for a lesson.
    
    Returns all equipment needed for a specific lesson with quantities.
    """
    try:
        requirements = equipment_service.get_lesson_equipment_summary(db, lesson_id)
        return requirements
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting lesson equipment summary: {str(e)}"
        )