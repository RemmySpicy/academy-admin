"""
Facility Course Pricing service for managing actual course prices at facilities.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.facilities.models.facility_course_pricing import FacilityCoursePricing
from app.features.facilities.models.facility import Facility
from app.features.courses.models.course import Course
from app.features.facilities.schemas.facility_course_pricing import (
    FacilityCoursePricingCreate,
    FacilityCoursePricingUpdate,
    FacilityCoursePricingResponse,
    FacilityCoursePricingSearchParams,
    FacilityCoursePricingLookupRequest,
    FacilityCoursePricingLookupResponse,
    FacilityCoursePricingStatsResponse,
    FacilityCoursePricingBulkCreateRequest,
    FacilityCoursePricingBulkUpdateRequest,
    FacilityCoursePricingImportRequest,
    CoursePricingMatrixResponse
)
from app.features.common.services.base_service import BaseService


class FacilityCoursePricingService(BaseService[FacilityCoursePricing, FacilityCoursePricingCreate, FacilityCoursePricingUpdate]):
    """Service for facility course pricing operations."""
    
    def __init__(self):
        super().__init__(FacilityCoursePricing)
    
    def create_pricing_entry(
        self, 
        db: Session, 
        pricing_data: FacilityCoursePricingCreate,
        user_id: Optional[str] = None
    ) -> FacilityCoursePricing:
        """Create a new facility course pricing entry."""
        
        # Validate that facility and course exist
        facility = db.query(Facility).filter(Facility.id == pricing_data.facility_id).first()
        if not facility:
            raise ValueError(f"Facility with ID {pricing_data.facility_id} not found")
        
        course = db.query(Course).filter(Course.id == pricing_data.course_id).first()
        if not course:
            raise ValueError(f"Course with ID {pricing_data.course_id} not found")
        
        # Validate that the pricing configuration matches the course configuration
        if pricing_data.age_group not in course.age_groups:
            raise ValueError(f"Age group '{pricing_data.age_group}' not available for course '{course.name}'")
        
        if pricing_data.location_type not in course.location_types:
            raise ValueError(f"Location type '{pricing_data.location_type}' not available for course '{course.name}'")
        
        if pricing_data.session_type not in course.session_types:
            raise ValueError(f"Session type '{pricing_data.session_type}' not available for course '{course.name}'")
        
        # Check for existing active pricing entry with same configuration
        existing = db.query(FacilityCoursePricing).filter(
            and_(
                FacilityCoursePricing.facility_id == pricing_data.facility_id,
                FacilityCoursePricing.course_id == pricing_data.course_id,
                FacilityCoursePricing.age_group == pricing_data.age_group,
                FacilityCoursePricing.location_type == pricing_data.location_type,
                FacilityCoursePricing.session_type == pricing_data.session_type,
                FacilityCoursePricing.is_active == True
            )
        ).first()
        
        if existing:
            raise ValueError(f"Active pricing entry already exists for this configuration")
        
        # Create the pricing entry
        pricing_entry = FacilityCoursePricing(
            facility_id=pricing_data.facility_id,
            course_id=pricing_data.course_id,
            age_group=pricing_data.age_group,
            location_type=pricing_data.location_type,
            session_type=pricing_data.session_type,
            price=pricing_data.price,
            is_active=pricing_data.is_active,
            notes=pricing_data.notes,
            created_by=user_id,
            updated_by=user_id
        )
        
        db.add(pricing_entry)
        db.commit()
        db.refresh(pricing_entry)
        
        return pricing_entry
    
    def get_pricing_for_facility(
        self, 
        db: Session, 
        facility_id: str,
        include_inactive: bool = False
    ) -> List[FacilityCoursePricing]:
        """Get all pricing entries for a specific facility."""
        
        query = db.query(FacilityCoursePricing).options(
            joinedload(FacilityCoursePricing.facility),
            joinedload(FacilityCoursePricing.course)
        ).filter(FacilityCoursePricing.facility_id == facility_id)
        
        if not include_inactive:
            query = query.filter(FacilityCoursePricing.is_active == True)
        
        return query.order_by(
            FacilityCoursePricing.course_id,
            FacilityCoursePricing.age_group,
            FacilityCoursePricing.location_type,
            FacilityCoursePricing.session_type
        ).all()
    
    def get_pricing_for_course(
        self, 
        db: Session, 
        course_id: str,
        include_inactive: bool = False
    ) -> List[FacilityCoursePricing]:
        """Get all pricing entries for a specific course across all facilities."""
        
        query = db.query(FacilityCoursePricing).options(
            joinedload(FacilityCoursePricing.facility),
            joinedload(FacilityCoursePricing.course)
        ).filter(FacilityCoursePricing.course_id == course_id)
        
        if not include_inactive:
            query = query.filter(FacilityCoursePricing.is_active == True)
        
        return query.order_by(
            FacilityCoursePricing.facility_id,
            FacilityCoursePricing.age_group,
            FacilityCoursePricing.location_type,
            FacilityCoursePricing.session_type
        ).all()
    
    def lookup_pricing(
        self, 
        db: Session, 
        lookup_request: FacilityCoursePricingLookupRequest
    ) -> FacilityCoursePricingLookupResponse:
        """Look up specific pricing for a facility-course combination."""
        
        pricing_entry = db.query(FacilityCoursePricing).filter(
            and_(
                FacilityCoursePricing.facility_id == lookup_request.facility_id,
                FacilityCoursePricing.course_id == lookup_request.course_id,
                FacilityCoursePricing.age_group == lookup_request.age_group,
                FacilityCoursePricing.location_type == lookup_request.location_type,
                FacilityCoursePricing.session_type == lookup_request.session_type,
                FacilityCoursePricing.is_active == True
            )
        ).first()
        
        if pricing_entry:
            return FacilityCoursePricingLookupResponse(
                found=True,
                price=pricing_entry.price,
                formatted_price=pricing_entry.formatted_price,
                pricing_entry=FacilityCoursePricingResponse.from_orm(pricing_entry)
            )
        
        # If no specific pricing found, get course price range as fallback
        course = db.query(Course).filter(Course.id == lookup_request.course_id).first()
        fallback_range = None
        
        if course and course.pricing_ranges:
            for range_data in course.pricing_ranges:
                if range_data.get('age_group') == lookup_request.age_group:
                    fallback_range = {
                        'age_group': range_data.get('age_group'),
                        'price_from': range_data.get('price_from'),
                        'price_to': range_data.get('price_to'),
                        'formatted_range': f"₦{range_data.get('price_from'):,} - ₦{range_data.get('price_to'):,}"
                    }
                    break
        
        return FacilityCoursePricingLookupResponse(
            found=False,
            fallback_range=fallback_range
        )
    
    def get_course_pricing_matrix(
        self, 
        db: Session, 
        facility_id: str
    ) -> CoursePricingMatrixResponse:
        """Get complete pricing matrix for all courses at a facility."""
        
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError(f"Facility with ID {facility_id} not found")
        
        # Get all pricing entries for this facility
        pricing_entries = self.get_pricing_for_facility(db, facility_id, include_inactive=False)
        
        # Group by course
        courses_dict = {}
        for entry in pricing_entries:
            course_id = entry.course_id
            if course_id not in courses_dict:
                courses_dict[course_id] = {
                    'course_id': course_id,
                    'course_name': entry.course.name if entry.course else 'Unknown Course',
                    'pricing_matrix': []
                }
            
            courses_dict[course_id]['pricing_matrix'].append({
                'age_group': entry.age_group,
                'location_type': entry.location_type,
                'session_type': entry.session_type,
                'price': entry.price,
                'formatted_price': entry.formatted_price,
                'is_active': entry.is_active,
                'notes': entry.notes
            })
        
        return CoursePricingMatrixResponse(
            facility_id=facility_id,
            facility_name=facility.name,
            courses=list(courses_dict.values())
        )
    
    def bulk_create_pricing(
        self, 
        db: Session, 
        bulk_request: FacilityCoursePricingBulkCreateRequest,
        user_id: Optional[str] = None
    ) -> List[FacilityCoursePricing]:
        """Bulk create pricing entries."""
        
        created_entries = []
        errors = []
        
        for entry_data in bulk_request.entries:
            try:
                # If overwrite is enabled, deactivate existing entries
                if bulk_request.overwrite_existing:
                    existing = db.query(FacilityCoursePricing).filter(
                        and_(
                            FacilityCoursePricing.facility_id == entry_data.facility_id,
                            FacilityCoursePricing.course_id == entry_data.course_id,
                            FacilityCoursePricing.age_group == entry_data.age_group,
                            FacilityCoursePricing.location_type == entry_data.location_type,
                            FacilityCoursePricing.session_type == entry_data.session_type,
                            FacilityCoursePricing.is_active == True
                        )
                    ).first()
                    
                    if existing:
                        existing.is_active = False
                        existing.updated_by = user_id
                
                # Create new entry
                entry = self.create_pricing_entry(db, entry_data, user_id)
                created_entries.append(entry)
                
            except Exception as e:
                errors.append(f"Error creating pricing for {entry_data.age_group}-{entry_data.location_type}-{entry_data.session_type}: {str(e)}")
        
        if errors and not created_entries:
            raise ValueError(f"All pricing entries failed: {'; '.join(errors)}")
        
        return created_entries
    
    def bulk_update_pricing(
        self, 
        db: Session, 
        bulk_request: FacilityCoursePricingBulkUpdateRequest,
        user_id: Optional[str] = None
    ) -> List[FacilityCoursePricing]:
        """Bulk update pricing entries."""
        
        query = db.query(FacilityCoursePricing).filter(
            FacilityCoursePricing.facility_id == bulk_request.facility_id
        )
        
        if bulk_request.course_id:
            query = query.filter(FacilityCoursePricing.course_id == bulk_request.course_id)
        
        entries = query.all()
        
        for entry in entries:
            if bulk_request.price_adjustment is not None:
                entry.price = max(0, entry.price + bulk_request.price_adjustment)
            
            if bulk_request.price_multiplier is not None:
                entry.price = int(entry.price * bulk_request.price_multiplier)
            
            if bulk_request.new_status is not None:
                entry.is_active = bulk_request.new_status
            
            entry.updated_by = user_id
        
        db.commit()
        return entries
    
    def import_pricing_from_facility(
        self, 
        db: Session, 
        import_request: FacilityCoursePricingImportRequest,
        user_id: Optional[str] = None
    ) -> List[FacilityCoursePricing]:
        """Import pricing from another facility."""
        
        # Get source pricing entries
        source_query = db.query(FacilityCoursePricing).filter(
            and_(
                FacilityCoursePricing.facility_id == import_request.source_facility_id,
                FacilityCoursePricing.is_active == True
            )
        )
        
        if import_request.course_ids:
            source_query = source_query.filter(
                FacilityCoursePricing.course_id.in_(import_request.course_ids)
            )
        
        source_entries = source_query.all()
        
        if not source_entries:
            raise ValueError("No pricing entries found to import")
        
        # Create pricing entries for target facility
        created_entries = []
        
        for source_entry in source_entries:
            try:
                # Calculate adjusted price
                adjusted_price = source_entry.price
                if import_request.apply_adjustment:
                    adjusted_price = max(0, adjusted_price + import_request.apply_adjustment)
                
                # Create pricing data
                pricing_data = FacilityCoursePricingCreate(
                    facility_id=import_request.target_facility_id,
                    course_id=source_entry.course_id,
                    age_group=source_entry.age_group,
                    location_type=source_entry.location_type,
                    session_type=source_entry.session_type,
                    price=adjusted_price,
                    is_active=True,
                    notes=f"Imported from facility {import_request.source_facility_id}" + 
                          (f" with adjustment {import_request.apply_adjustment}" if import_request.apply_adjustment else "")
                )
                
                # Handle overwrite if needed
                if import_request.overwrite_existing:
                    existing = db.query(FacilityCoursePricing).filter(
                        and_(
                            FacilityCoursePricing.facility_id == import_request.target_facility_id,
                            FacilityCoursePricing.course_id == source_entry.course_id,
                            FacilityCoursePricing.age_group == source_entry.age_group,
                            FacilityCoursePricing.location_type == source_entry.location_type,
                            FacilityCoursePricing.session_type == source_entry.session_type,
                            FacilityCoursePricing.is_active == True
                        )
                    ).first()
                    
                    if existing:
                        existing.is_active = False
                        existing.updated_by = user_id
                
                # Create new entry
                entry = self.create_pricing_entry(db, pricing_data, user_id)
                created_entries.append(entry)
                
            except Exception as e:
                print(f"Warning: Failed to import pricing entry: {e}")
                continue
        
        return created_entries
    
    def get_pricing_statistics(self, db: Session) -> FacilityCoursePricingStatsResponse:
        """Get facility course pricing statistics."""
        
        # Basic counts
        total_entries = db.query(FacilityCoursePricing).count()
        active_entries = db.query(FacilityCoursePricing).filter(FacilityCoursePricing.is_active == True).count()
        
        facilities_with_pricing = db.query(FacilityCoursePricing.facility_id).distinct().count()
        courses_with_pricing = db.query(FacilityCoursePricing.course_id).distinct().count()
        
        # Price statistics
        price_stats = db.query(
            func.avg(FacilityCoursePricing.price),
            func.min(FacilityCoursePricing.price),
            func.max(FacilityCoursePricing.price)
        ).filter(FacilityCoursePricing.is_active == True).first()
        
        avg_price = price_stats[0] or 0
        min_price = price_stats[1] or 0
        max_price = price_stats[2] or 0
        
        # Grouping statistics
        pricing_by_facility = {}
        facility_counts = db.query(
            FacilityCoursePricing.facility_id,
            func.count(FacilityCoursePricing.id)
        ).filter(FacilityCoursePricing.is_active == True).group_by(FacilityCoursePricing.facility_id).all()
        
        for facility_id, count in facility_counts:
            pricing_by_facility[facility_id] = count
        
        pricing_by_course = {}
        course_counts = db.query(
            FacilityCoursePricing.course_id,
            func.count(FacilityCoursePricing.id)
        ).filter(FacilityCoursePricing.is_active == True).group_by(FacilityCoursePricing.course_id).all()
        
        for course_id, count in course_counts:
            pricing_by_course[course_id] = count
        
        return FacilityCoursePricingStatsResponse(
            total_pricing_entries=total_entries,
            active_pricing_entries=active_entries,
            facilities_with_pricing=facilities_with_pricing,
            courses_with_pricing=courses_with_pricing,
            pricing_by_facility=pricing_by_facility,
            pricing_by_course=pricing_by_course,
            average_price=float(avg_price),
            price_range={'min': int(min_price), 'max': int(max_price)}
        )


# Create global instance
facility_course_pricing_service = FacilityCoursePricingService()