"""
Facility API routes for facility management.
"""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.middleware import create_program_filter_dependency
from app.features.facilities.schemas.facility import (
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    FacilityListResponse,
    FacilitySearchParams,
    FacilityStatsResponse,
    FacilityTypeEnum,
)
from app.features.facilities.services.facility_service import facility_service
from app.features.common.models.enums import CurriculumStatus


router = APIRouter()

# Create program filter dependency with authentication integration
get_program_filter = create_program_filter_dependency(get_current_active_user)


@router.post("/", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
async def create_facility(
    facility_data: FacilityCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Create a new facility.
    
    Requires appropriate permissions based on user role.
    """
    try:
        # Set program context if provided
        if program_context and not facility_data.program_id:
            facility_data.program_id = program_context
        
        facility = facility_service.create_facility(
            db=db,
            facility_data=facility_data,
            created_by=current_user.get("id")
        )
        
        return facility
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create facility"
        )


@router.get("/", response_model=FacilityListResponse)
async def list_facilities(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    facility_status: Optional[CurriculumStatus] = Query(None, description="Filter by status"),
    facility_type: Optional[FacilityTypeEnum] = Query(None, description="Filter by facility type"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    city: Optional[str] = Query(None, description="Filter by city"),
    sort_by: Optional[str] = Query("name", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List facilities with optional search and pagination.
    
    Supports filtering by status, facility type, program, city and sorting.
    """
    try:
        # Build search parameters
        search_params = FacilitySearchParams(
            page=page,
            per_page=per_page,
            search=search,
            status=facility_status,
            facility_type=facility_type,
            program_id=program_id,
            city=city,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        facilities = facility_service.get_facilities(
            db=db,
            params=search_params,
            program_context=program_context
        )
        
        return facilities
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve facilities"
        )


@router.get("/stats", response_model=FacilityStatsResponse)
async def get_facility_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Get facility statistics.
    
    Returns aggregated statistics about facilities.
    """
    try:
        stats = facility_service.get_facility_stats(
            db=db,
            program_context=program_context
        )
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve facility statistics"
        )


@router.get("/{facility_id}", response_model=FacilityResponse)
async def get_facility(
    facility_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Get facility by ID.
    
    Returns detailed facility information.
    """
    try:
        facility = facility_service.get_facility(db=db, facility_id=facility_id)
        
        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Facility not found"
            )
        
        # Check program context access
        if program_context and facility.program_id != program_context:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to facility"
            )
        
        return facility
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve facility"
        )


@router.put("/{facility_id}", response_model=FacilityResponse)
async def update_facility(
    facility_id: str,
    facility_data: FacilityUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Update facility by ID.
    
    Requires appropriate permissions based on user role.
    """
    try:
        # Check if facility exists and user has access
        existing_facility = facility_service.get_facility(db=db, facility_id=facility_id)
        
        if not existing_facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Facility not found"
            )
        
        # Check program context access
        if program_context and existing_facility.program_id != program_context:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to facility"
            )
        
        facility = facility_service.update_facility(
            db=db,
            facility_id=facility_id,
            facility_data=facility_data,
            updated_by=current_user.get("id")
        )
        
        return facility
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update facility"
        )


@router.delete("/{facility_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_facility(
    facility_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Delete facility by ID.
    
    Requires appropriate permissions based on user role.
    """
    try:
        # Check if facility exists and user has access
        existing_facility = facility_service.get_facility(db=db, facility_id=facility_id)
        
        if not existing_facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Facility not found"
            )
        
        # Check program context access
        if program_context and existing_facility.program_id != program_context:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to facility"
            )
        
        success = facility_service.delete_facility(db=db, facility_id=facility_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Facility not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete facility"
        )