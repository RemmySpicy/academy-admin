"""
Facility service for facility management operations.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc

from app.features.facilities.models.facility import Facility
from app.features.facilities.schemas.facility import (
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    FacilitySearchParams,
    FacilityStatsResponse,
    FacilityListResponse,
)
from app.features.courses.services.base_service import BaseService


class FacilityService(BaseService[Facility, FacilityCreate, FacilityUpdate]):
    """Service for facility operations."""
    
    def __init__(self):
        super().__init__(Facility)
    
    def create_facility(self, 
                       db: Session, 
                       facility_data: FacilityCreate, 
                       created_by: Optional[str] = None) -> FacilityResponse:
        """Create a new facility."""
        # Check for duplicate facility code if provided
        if facility_data.facility_code:
            existing_facility = db.query(Facility).filter(
                Facility.facility_code == facility_data.facility_code
            ).first()
            
            if existing_facility:
                raise ValueError(f"Facility code '{facility_data.facility_code}' already exists")
        
        # Create facility
        facility = self.create(db, facility_data, created_by)
        
        return self._to_facility_response(db, facility)
    
    def get_facility(self, db: Session, facility_id: str) -> Optional[FacilityResponse]:
        """Get facility by ID."""
        facility = self.get(db, facility_id)
        if not facility:
            return None
        
        return self._to_facility_response(db, facility)
    
    def get_facilities(self, 
                      db: Session, 
                      params: FacilitySearchParams,
                      program_context: Optional[str] = None) -> FacilityListResponse:
        """Get facilities with filtering, sorting, and pagination."""
        
        # Build base query
        query = db.query(Facility)
        
        # Apply program context filtering
        if program_context:
            query = query.filter(Facility.program_id == program_context)
        
        # Apply filters
        if params.search:
            search_term = f"%{params.search}%"
            query = query.filter(
                or_(
                    Facility.name.ilike(search_term),
                    Facility.description.ilike(search_term),
                    Facility.address.ilike(search_term),
                    Facility.city.ilike(search_term),
                    Facility.facility_code.ilike(search_term),
                )
            )
        
        if params.status:
            query = query.filter(Facility.status == params.status)
        
        if params.facility_type:
            query = query.filter(Facility.facility_type == params.facility_type)
        
        if params.program_id:
            query = query.filter(Facility.program_id == params.program_id)
        
        if params.city:
            query = query.filter(Facility.city.ilike(f"%{params.city}%"))
        
        # Apply sorting
        if params.sort_by:
            sort_column = getattr(Facility, params.sort_by, None)
            if sort_column:
                if params.sort_order == "desc":
                    query = query.order_by(desc(sort_column))
                else:
                    query = query.order_by(asc(sort_column))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        skip = (params.page - 1) * params.per_page
        facilities = query.offset(skip).limit(params.per_page).all()
        
        # Convert to response format
        items = [self._to_facility_response(db, facility) for facility in facilities]
        
        # Calculate pagination metadata
        total_pages = (total + params.per_page - 1) // params.per_page
        has_next = params.page < total_pages
        has_prev = params.page > 1
        
        return FacilityListResponse(
            items=items,
            total=total,
            page=params.page,
            limit=params.per_page,
            total_pages=total_pages,
            has_next=has_next,
            has_prev=has_prev
        )
    
    def update_facility(self, 
                       db: Session, 
                       facility_id: str, 
                       facility_data: FacilityUpdate,
                       updated_by: Optional[str] = None) -> Optional[FacilityResponse]:
        """Update facility by ID."""
        facility = self.get(db, facility_id)
        if not facility:
            return None
        
        # Check for duplicate facility code if being updated
        if facility_data.facility_code and facility_data.facility_code != facility.facility_code:
            existing_facility = db.query(Facility).filter(
                Facility.facility_code == facility_data.facility_code,
                Facility.id != facility_id
            ).first()
            
            if existing_facility:
                raise ValueError(f"Facility code '{facility_data.facility_code}' already exists")
        
        # Update facility
        updated_facility = self.update(db, facility, facility_data, updated_by)
        
        return self._to_facility_response(db, updated_facility)
    
    def delete_facility(self, db: Session, facility_id: str) -> bool:
        """Delete facility by ID."""
        facility = self.get(db, facility_id)
        if not facility:
            return False
        
        return self.delete(db, facility_id)
    
    def get_facility_stats(self, 
                          db: Session,
                          program_context: Optional[str] = None) -> FacilityStatsResponse:
        """Get facility statistics."""
        
        # Build base query
        query = db.query(Facility)
        
        # Apply program context filtering
        if program_context:
            query = query.filter(Facility.program_id == program_context)
        
        # Basic counts
        total_facilities = query.count()
        active_facilities = query.filter(Facility.status == "active").count()
        inactive_facilities = total_facilities - active_facilities
        
        # Group by type
        type_stats = db.query(
            Facility.facility_type,
            func.count(Facility.id).label('count')
        )
        if program_context:
            type_stats = type_stats.filter(Facility.program_id == program_context)
        
        facilities_by_type = {
            str(row.facility_type): row.count 
            for row in type_stats.group_by(Facility.facility_type).all()
        }
        
        # Group by status
        status_stats = db.query(
            Facility.status,
            func.count(Facility.id).label('count')
        )
        if program_context:
            status_stats = status_stats.filter(Facility.program_id == program_context)
        
        facilities_by_status = {
            str(row.status): row.count 
            for row in status_stats.group_by(Facility.status).all()
        }
        
        # Group by program
        program_stats = db.query(
            Facility.program_id,
            func.count(Facility.id).label('count')
        )
        if program_context:
            program_stats = program_stats.filter(Facility.program_id == program_context)
        
        facilities_by_program = {
            str(row.program_id) if row.program_id else 'unassigned': row.count 
            for row in program_stats.group_by(Facility.program_id).all()
        }
        
        # Capacity and area statistics
        capacity_stats = db.query(
            func.sum(Facility.capacity).label('total_capacity'),
            func.avg(Facility.capacity).label('avg_capacity'),
            func.sum(Facility.area_sqft).label('total_area'),
            func.avg(Facility.area_sqft).label('avg_area')
        )
        if program_context:
            capacity_stats = capacity_stats.filter(Facility.program_id == program_context)
        
        stats_row = capacity_stats.first()
        
        return FacilityStatsResponse(
            total_facilities=total_facilities,
            active_facilities=active_facilities,
            inactive_facilities=inactive_facilities,
            facilities_by_type=facilities_by_type,
            facilities_by_status=facilities_by_status,
            facilities_by_program=facilities_by_program,
            total_capacity=int(stats_row.total_capacity or 0),
            average_capacity=float(stats_row.avg_capacity or 0),
            total_area=int(stats_row.total_area or 0),
            average_area=float(stats_row.avg_area or 0)
        )
    
    def _to_facility_response(self, db: Session, facility: Facility) -> FacilityResponse:
        """Convert facility model to response format."""
        return FacilityResponse(
            id=facility.id,
            name=facility.name,
            description=facility.description,
            facility_type=facility.facility_type,
            address=facility.address,
            city=facility.city,
            state=facility.state,
            postal_code=facility.postal_code,
            country=facility.country,
            capacity=facility.capacity,
            area_sqft=facility.area_sqft,
            status=facility.status,
            equipment=facility.equipment,
            contact_phone=facility.contact_phone,
            contact_email=facility.contact_email,
            operating_hours=facility.operating_hours,
            program_id=facility.program_id,
            facility_code=facility.facility_code,
            created_at=facility.created_at,
            updated_at=facility.updated_at,
            created_by=facility.created_by,
            updated_by=facility.updated_by,
            display_name=facility.display_name,
            is_active=facility.is_active,
            full_address=facility.full_address,
            equipment_list=facility.equipment_list,
        )


# Create a singleton instance
facility_service = FacilityService()