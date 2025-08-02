"""
Facility Course Pricing API routes.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.authentication.models.user import User
from app.features.facilities.services.facility_course_pricing_service import facility_course_pricing_service
from app.features.facilities.schemas.facility_course_pricing import (
    FacilityCoursePricingCreate,
    FacilityCoursePricingUpdate,
    FacilityCoursePricingResponse,
    FacilityCoursePricingListResponse,
    FacilityCoursePricingSearchParams,
    FacilityCoursePricingLookupRequest,
    FacilityCoursePricingLookupResponse,
    FacilityCoursePricingStatsResponse,
    FacilityCoursePricingBulkCreateRequest,
    FacilityCoursePricingBulkUpdateRequest,
    FacilityCoursePricingImportRequest,
    CoursePricingMatrixResponse
)

router = APIRouter(prefix="/facility-course-pricing", tags=["Facility Course Pricing"])


@router.post("/", response_model=FacilityCoursePricingResponse)
async def create_pricing_entry(
    pricing_data: FacilityCoursePricingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new facility course pricing entry."""
    try:
        pricing_entry = facility_course_pricing_service.create_pricing_entry(
            db=db,
            pricing_data=pricing_data,
            user_id=current_user.id
        )
        return FacilityCoursePricingResponse.from_orm(pricing_entry)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create pricing entry")


@router.get("/", response_model=FacilityCoursePricingListResponse)
async def list_pricing_entries(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    facility_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    age_group: Optional[str] = Query(None),
    location_type: Optional[str] = Query(None),
    session_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List facility course pricing entries with filtering and pagination."""
    
    search_params = FacilityCoursePricingSearchParams(
        page=page,
        per_page=per_page,
        facility_id=facility_id,
        course_id=course_id,
        age_group=age_group,
        location_type=location_type,
        session_type=session_type,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    try:
        result = facility_course_pricing_service.list(db=db, search_params=search_params)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve pricing entries")


@router.get("/{pricing_id}", response_model=FacilityCoursePricingResponse)
async def get_pricing_entry(
    pricing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific facility course pricing entry."""
    try:
        pricing_entry = facility_course_pricing_service.get_by_id(db=db, id=pricing_id)
        if not pricing_entry:
            raise HTTPException(status_code=404, detail="Pricing entry not found")
        return FacilityCoursePricingResponse.from_orm(pricing_entry)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve pricing entry")


@router.put("/{pricing_id}", response_model=FacilityCoursePricingResponse)
async def update_pricing_entry(
    pricing_id: str,
    pricing_data: FacilityCoursePricingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a facility course pricing entry."""
    try:
        pricing_entry = facility_course_pricing_service.update(
            db=db,
            id=pricing_id,
            update_data=pricing_data,
            updated_by=current_user.id
        )
        if not pricing_entry:
            raise HTTPException(status_code=404, detail="Pricing entry not found")
        return FacilityCoursePricingResponse.from_orm(pricing_entry)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update pricing entry")


@router.delete("/{pricing_id}")
async def delete_pricing_entry(
    pricing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a facility course pricing entry."""
    try:
        success = facility_course_pricing_service.delete(db=db, id=pricing_id)
        if not success:
            raise HTTPException(status_code=404, detail="Pricing entry not found")
        return {"message": "Pricing entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete pricing entry")


@router.get("/facility/{facility_id}/pricing", response_model=List[FacilityCoursePricingResponse])
async def get_facility_pricing(
    facility_id: str,
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all pricing entries for a specific facility."""
    try:
        pricing_entries = facility_course_pricing_service.get_pricing_for_facility(
            db=db,
            facility_id=facility_id,
            include_inactive=include_inactive
        )
        return [FacilityCoursePricingResponse.from_orm(entry) for entry in pricing_entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve facility pricing")


@router.get("/course/{course_id}/pricing", response_model=List[FacilityCoursePricingResponse])
async def get_course_pricing(
    course_id: str,
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all pricing entries for a specific course across all facilities."""
    try:
        pricing_entries = facility_course_pricing_service.get_pricing_for_course(
            db=db,
            course_id=course_id,
            include_inactive=include_inactive
        )
        return [FacilityCoursePricingResponse.from_orm(entry) for entry in pricing_entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve course pricing")


@router.post("/lookup", response_model=FacilityCoursePricingLookupResponse)
async def lookup_pricing(
    lookup_request: FacilityCoursePricingLookupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Look up specific pricing for a facility-course combination."""
    try:
        result = facility_course_pricing_service.lookup_pricing(db=db, lookup_request=lookup_request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to lookup pricing")


@router.get("/facility/{facility_id}/matrix", response_model=CoursePricingMatrixResponse)
async def get_pricing_matrix(
    facility_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get complete pricing matrix for all courses at a facility."""
    try:
        result = facility_course_pricing_service.get_course_pricing_matrix(db=db, facility_id=facility_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve pricing matrix")


@router.post("/bulk-create", response_model=List[FacilityCoursePricingResponse])
async def bulk_create_pricing(
    bulk_request: FacilityCoursePricingBulkCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bulk create pricing entries."""
    try:
        created_entries = facility_course_pricing_service.bulk_create_pricing(
            db=db,
            bulk_request=bulk_request,
            user_id=current_user.id
        )
        return [FacilityCoursePricingResponse.from_orm(entry) for entry in created_entries]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to bulk create pricing entries")


@router.post("/bulk-update", response_model=List[FacilityCoursePricingResponse])
async def bulk_update_pricing(
    bulk_request: FacilityCoursePricingBulkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Bulk update pricing entries."""
    try:
        updated_entries = facility_course_pricing_service.bulk_update_pricing(
            db=db,
            bulk_request=bulk_request,
            user_id=current_user.id
        )
        return [FacilityCoursePricingResponse.from_orm(entry) for entry in updated_entries]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to bulk update pricing entries")


@router.post("/import", response_model=List[FacilityCoursePricingResponse])
async def import_pricing(
    import_request: FacilityCoursePricingImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Import pricing from another facility."""
    try:
        imported_entries = facility_course_pricing_service.import_pricing_from_facility(
            db=db,
            import_request=import_request,
            user_id=current_user.id
        )
        return [FacilityCoursePricingResponse.from_orm(entry) for entry in imported_entries]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to import pricing")


@router.get("/stats", response_model=FacilityCoursePricingStatsResponse)
async def get_pricing_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get facility course pricing statistics."""
    try:
        stats = facility_course_pricing_service.get_pricing_statistics(db=db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve pricing statistics")