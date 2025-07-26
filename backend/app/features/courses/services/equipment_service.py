"""
Equipment service layer for curriculum management.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc

from app.features.courses.models.equipment import EquipmentRequirement
from app.features.courses.schemas.equipment import (
    EquipmentRequirementCreate,
    EquipmentRequirementUpdate,
    EquipmentRequirementResponse,
    EquipmentSearchParams,
    EquipmentStatsResponse,
    EquipmentUsageResponse,
    EquipmentBulkUpdateRequest,
    EquipmentInventorySummary,
    LessonEquipmentSummary
)
from .base_service import BaseService

# Import related models for program context filtering
from app.features.courses.models.level import Level
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.course import Course
from app.features.programs.models.program import Program


class EquipmentService(BaseService[EquipmentRequirement, EquipmentRequirementCreate, EquipmentRequirementUpdate]):
    """Service for managing curriculum equipment."""

    def __init__(self):
        super().__init__(EquipmentRequirement)

    def create_equipment_requirement(self, 
                                   db: Session, 
                                   equipment_data: EquipmentRequirementCreate, 
                                   user_id: str,
                                   program_context: Optional[str] = None) -> EquipmentRequirementResponse:
        """Create a new equipment requirement."""
        # Validate level exists and is accessible within program context
        if program_context:
            level_query = db.query(Level).filter(Level.id == equipment_data.level_id)\
                           .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                           .join(Course, Curriculum.course_id == Course.id)\
                           .join(Program, Course.program_id == Program.id)\
                           .filter(Program.id == program_context)
            
            if not level_query.first():
                raise ValueError(f"Level {equipment_data.level_id} not found or not accessible in current program context")
        
        # Create equipment requirement
        equipment_dict = equipment_data.dict()
        equipment_dict['created_by'] = user_id
        
        equipment = EquipmentRequirement(**equipment_dict)
        db.add(equipment)
        db.commit()
        db.refresh(equipment)
        
        return self._to_equipment_response(db, equipment)

    def get_equipment_requirement(self, 
                                db: Session, 
                                equipment_id: str,
                                program_context: Optional[str] = None) -> Optional[EquipmentRequirementResponse]:
        """Get an equipment requirement by ID."""
        query = db.query(EquipmentRequirement).filter(EquipmentRequirement.id == equipment_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.join(Level, EquipmentRequirement.level_id == Level.id)\
                        .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                        .join(Course, Curriculum.course_id == Course.id)\
                        .join(Program, Course.program_id == Program.id)\
                        .filter(Program.id == program_context)
        
        equipment = query.first()
        if not equipment:
            return None
        
        return self._to_equipment_response(db, equipment)

    def list_equipment_requirements(self, 
                                  db: Session, 
                                  search_params: Optional[EquipmentSearchParams] = None,
                                  page: int = 1, 
                                  per_page: int = 20,
                                  program_context: Optional[str] = None) -> Tuple[List[EquipmentRequirementResponse], int]:
        """List equipment requirements with pagination and filtering."""
        query = db.query(EquipmentRequirement)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.join(Level, EquipmentRequirement.level_id == Level.id)\
                        .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                        .join(Course, Curriculum.course_id == Course.id)\
                        .join(Program, Course.program_id == Program.id)\
                        .filter(Program.id == program_context)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        EquipmentRequirement.equipment_name.ilike(search_term),
                        EquipmentRequirement.specifications.ilike(search_term),
                        EquipmentRequirement.equipment_code.ilike(search_term),
                        EquipmentRequirement.brand_preference.ilike(search_term)
                    )
                )
            
            if search_params.equipment_type:
                query = query.filter(EquipmentRequirement.equipment_type == search_params.equipment_type)
            
            if search_params.is_mandatory is not None:
                query = query.filter(EquipmentRequirement.is_mandatory == search_params.is_mandatory)
            
            if search_params.level_id:
                query = query.filter(EquipmentRequirement.level_id == search_params.level_id)
            
            if search_params.curriculum_id:
                query = query.join(Level, EquipmentRequirement.level_id == Level.id)\
                            .filter(Level.curriculum_id == search_params.curriculum_id)
            
            if search_params.course_id:
                query = query.join(Level, EquipmentRequirement.level_id == Level.id)\
                            .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                            .filter(Curriculum.course_id == search_params.course_id)
            
            if search_params.program_id:
                query = query.join(Level, EquipmentRequirement.level_id == Level.id)\
                            .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                            .join(Course, Curriculum.course_id == Course.id)\
                            .filter(Course.program_id == search_params.program_id)
            
            if search_params.quantity_min:
                query = query.filter(EquipmentRequirement.quantity_needed >= search_params.quantity_min)
            
            if search_params.quantity_max:
                query = query.filter(EquipmentRequirement.quantity_needed <= search_params.quantity_max)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(EquipmentRequirement, search_params.sort_by, EquipmentRequirement.equipment_name)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(EquipmentRequirement.equipment_name)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        equipment_items = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        equipment_responses = [self._to_equipment_response(db, equipment) for equipment in equipment_items]
        
        return equipment_responses, total_count

    def update_equipment_requirement(self, 
                                   db: Session, 
                                   equipment_id: str, 
                                   equipment_data: EquipmentRequirementUpdate,
                                   user_id: str,
                                   program_context: Optional[str] = None) -> Optional[EquipmentRequirementResponse]:
        """Update an equipment requirement."""
        # First validate equipment exists and is accessible
        equipment_response = self.get_equipment_requirement(db, equipment_id, program_context)
        if not equipment_response:
            return None
        
        # Get the actual equipment object for updating
        equipment = self.get(db, equipment_id)
        if not equipment:
            return None
        
        # Update equipment
        updated_equipment = self.update(db, equipment, equipment_data, user_id)
        
        return self._to_equipment_response(db, updated_equipment)

    def delete_equipment_requirement(self, 
                                   db: Session, 
                                   equipment_id: str,
                                   program_context: Optional[str] = None) -> bool:
        """Delete an equipment requirement."""
        # First validate equipment exists and user has access via program context
        equipment_response = self.get_equipment_requirement(db, equipment_id, program_context)
        if not equipment_response:
            return False
        
        # Delete the equipment requirement
        return self.delete(db, equipment_id)

    def get_equipment_by_lesson(self, 
                              db: Session, 
                              lesson_id: str, 
                              page: int = 1, 
                              per_page: int = 20,
                              program_context: Optional[str] = None) -> Tuple[List[EquipmentRequirementResponse], int]:
        """Get equipment for a specific lesson."""
        # Equipment is linked to levels, so we need to find the level for this lesson
        from app.features.courses.models.lesson import Lesson
        from app.features.courses.models.section import Section
        from app.features.courses.models.module import Module
        
        query = db.query(EquipmentRequirement)\
                  .join(Level, EquipmentRequirement.level_id == Level.id)\
                  .join(Module, Level.module_id == Module.id)\
                  .join(Section, Module.section_id == Section.id)\
                  .join(Lesson, Section.id == Lesson.section_id)\
                  .filter(Lesson.id == lesson_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.join(Curriculum, Level.curriculum_id == Curriculum.id)\
                        .join(Course, Curriculum.course_id == Course.id)\
                        .join(Program, Course.program_id == Program.id)\
                        .filter(Program.id == program_context)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        equipment_items = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        equipment_responses = [self._to_equipment_response(db, equipment) for equipment in equipment_items]
        
        return equipment_responses, total_count

    def get_equipment_usage(self, 
                          db: Session, 
                          equipment_name: str,
                          program_context: Optional[str] = None) -> Optional[EquipmentUsageResponse]:
        """Get usage information for equipment."""
        base_query = db.query(EquipmentRequirement).filter(
            EquipmentRequirement.equipment_name.ilike(f"%{equipment_name}%")
        )
        
        # Apply program context filtering if provided
        if program_context:
            base_query = base_query.join(Level, EquipmentRequirement.level_id == Level.id)\
                                  .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                                  .join(Course, Curriculum.course_id == Course.id)\
                                  .join(Program, Course.program_id == Program.id)\
                                  .filter(Program.id == program_context)
        
        equipment_items = base_query.all()
        
        if not equipment_items:
            return None
        
        # Calculate usage statistics
        total_usage = len(equipment_items)
        total_quantity = sum(item.quantity_needed for item in equipment_items)
        mandatory_usage = sum(1 for item in equipment_items if item.is_mandatory)
        
        # Get unique levels and courses using this equipment
        levels_using = set()
        courses_using = set()
        
        for item in equipment_items:
            levels_using.add(item.level_id)
            # Get course info through level relationship
            level_query = db.query(Level).filter(Level.id == item.level_id)
            if program_context:
                level_query = level_query.join(Curriculum, Level.curriculum_id == Curriculum.id)\
                                       .join(Course, Curriculum.course_id == Course.id)\
                                       .join(Program, Course.program_id == Program.id)\
                                       .filter(Program.id == program_context)
            
            level = level_query.first()
            if level:
                curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
                if curriculum:
                    courses_using.add(curriculum.course_id)
        
        usage_locations = [
            {
                "type": "level",
                "id": item.level_id,
                "name": f"Level {item.level_id}",
                "quantity": item.quantity_needed,
                "is_mandatory": item.is_mandatory
            }
            for item in equipment_items
        ]
        
        return EquipmentUsageResponse(
            equipment_name=equipment_name,
            total_usage_count=total_usage,
            total_quantity_needed=total_quantity,
            mandatory_usage_count=mandatory_usage,
            optional_usage_count=total_usage - mandatory_usage,
            levels_using_count=len(levels_using),
            courses_using_count=len(courses_using),
            usage_locations=usage_locations
        )

    def bulk_update_equipment(self, 
                            db: Session, 
                            update_data: EquipmentBulkUpdateRequest,
                            user_id: str,
                            program_context: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update equipment."""
        successful = []
        failed = []
        
        for equipment_id in update_data.equipment_ids:
            try:
                # Check if equipment exists and is accessible
                equipment_response = self.get_equipment_requirement(db, equipment_id, program_context)
                if not equipment_response:
                    failed.append({"id": equipment_id, "error": "Equipment not found or not accessible"})
                    continue
                
                equipment = self.get(db, equipment_id)
                if not equipment:
                    failed.append({"id": equipment_id, "error": "Equipment not found"})
                    continue
                
                # Apply bulk updates
                if update_data.is_mandatory is not None:
                    equipment.is_mandatory = update_data.is_mandatory
                
                if update_data.equipment_type is not None:
                    equipment.equipment_type = update_data.equipment_type
                
                if update_data.quantity_adjustment is not None:
                    new_quantity = equipment.quantity_needed + update_data.quantity_adjustment
                    if new_quantity < 0:
                        failed.append({"id": equipment_id, "error": "Quantity cannot be negative"})
                        continue
                    equipment.quantity_needed = new_quantity
                
                if update_data.safety_notes is not None:
                    equipment.safety_notes = update_data.safety_notes
                
                equipment.updated_by = user_id
                db.add(equipment)
                successful.append(equipment_id)
                
            except Exception as e:
                failed.append({"id": equipment_id, "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(update_data.equipment_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }

    def get_equipment_stats(self, 
                          db: Session,
                          program_context: Optional[str] = None) -> EquipmentStatsResponse:
        """Get equipment statistics."""
        base_query = db.query(EquipmentRequirement)
        
        # Apply program context filtering if provided
        if program_context:
            base_query = base_query.join(Level, EquipmentRequirement.level_id == Level.id)\
                                  .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                                  .join(Course, Curriculum.course_id == Course.id)\
                                  .join(Program, Course.program_id == Program.id)\
                                  .filter(Program.id == program_context)
        
        # Total equipment items
        total_equipment_items = base_query.count()
        
        # Equipment by type
        type_stats = base_query.with_entities(
            EquipmentRequirement.equipment_type,
            func.count(EquipmentRequirement.id)
        ).group_by(EquipmentRequirement.equipment_type).all()
        equipment_by_type = {str(eq_type): count for eq_type, count in type_stats}
        
        # Mandatory vs optional
        mandatory_count = base_query.filter(EquipmentRequirement.is_mandatory == True).count()
        optional_count = total_equipment_items - mandatory_count
        
        # Total quantity needed
        total_quantity_needed = base_query.with_entities(func.sum(EquipmentRequirement.quantity_needed)).scalar() or 0
        
        # Most common equipment
        common_equipment = base_query.with_entities(
            EquipmentRequirement.equipment_name,
            func.count(EquipmentRequirement.id).label('usage_count')
        ).group_by(EquipmentRequirement.equipment_name)\
         .order_by(func.count(EquipmentRequirement.id).desc())\
         .limit(5).all()
        
        most_common_equipment = [
            {
                "equipment_name": name,
                "usage_count": count
            }
            for name, count in common_equipment
        ]
        
        # Safety equipment count
        safety_equipment_count = base_query.filter(
            EquipmentRequirement.equipment_type == "safety"
        ).count()
        
        return EquipmentStatsResponse(
            total_equipment_items=total_equipment_items,
            equipment_by_type=equipment_by_type,
            mandatory_equipment_count=mandatory_count,
            optional_equipment_count=optional_count,
            total_quantity_needed=total_quantity_needed,
            safety_equipment_count=safety_equipment_count,
            most_common_equipment=most_common_equipment
        )

    def get_equipment_inventory_summary(self, 
                                      db: Session,
                                      program_context: Optional[str] = None) -> List[EquipmentInventorySummary]:
        """Get equipment inventory summary."""
        base_query = db.query(EquipmentRequirement)
        
        # Apply program context filtering if provided
        if program_context:
            base_query = base_query.join(Level, EquipmentRequirement.level_id == Level.id)\
                                  .join(Curriculum, Level.curriculum_id == Curriculum.id)\
                                  .join(Course, Curriculum.course_id == Course.id)\
                                  .join(Program, Course.program_id == Program.id)\
                                  .filter(Program.id == program_context)
        
        # Group by equipment name and calculate totals
        inventory_data = base_query.with_entities(
            EquipmentRequirement.equipment_name,
            func.sum(EquipmentRequirement.quantity_needed).label('total_quantity'),
            func.count(EquipmentRequirement.id).label('usage_locations'),
            func.sum(func.case([(EquipmentRequirement.is_mandatory == True, 1)], else_=0)).label('mandatory_locations')
        ).group_by(EquipmentRequirement.equipment_name).all()
        
        inventory_summary = []
        for name, total_qty, locations, mandatory_locs in inventory_data:
            inventory_summary.append(EquipmentInventorySummary(
                equipment_name=name,
                total_quantity_needed=total_qty,
                usage_locations_count=locations,
                mandatory_locations_count=mandatory_locs,
                optional_locations_count=locations - mandatory_locs
            ))
        
        return inventory_summary

    def get_lesson_equipment_summary(self, 
                                   db: Session, 
                                   lesson_id: str,
                                   program_context: Optional[str] = None) -> List[LessonEquipmentSummary]:
        """Get equipment summary for a lesson."""
        equipment_items, _ = self.get_equipment_by_lesson(db, lesson_id, page=1, per_page=1000, program_context=program_context)
        
        if not equipment_items:
            return []
        
        # Group by equipment type
        equipment_by_type = {}
        for item in equipment_items:
            eq_type = item.equipment_type
            if eq_type not in equipment_by_type:
                equipment_by_type[eq_type] = []
            equipment_by_type[eq_type].append(item)
        
        summary = []
        for eq_type, items in equipment_by_type.items():
            mandatory_items = [item for item in items if item.is_mandatory]
            optional_items = [item for item in items if not item.is_mandatory]
            total_quantity = sum(item.quantity_needed for item in items)
            
            summary.append(LessonEquipmentSummary(
                equipment_type=eq_type,
                total_items=len(items),
                mandatory_items=len(mandatory_items),
                optional_items=len(optional_items),
                total_quantity_needed=total_quantity,
                equipment_list=[item.equipment_name for item in items]
            ))
        
        return summary

    def _to_equipment_response(self, db: Session, equipment: EquipmentRequirement) -> EquipmentRequirementResponse:
        """Convert EquipmentRequirement model to EquipmentRequirementResponse."""
        return EquipmentRequirementResponse(
            id=equipment.id,
            level_id=equipment.level_id,
            equipment_name=equipment.equipment_name,
            equipment_type=equipment.equipment_type,
            quantity_needed=equipment.quantity_needed,
            is_mandatory=equipment.is_mandatory,
            specifications=equipment.specifications,
            safety_notes=equipment.safety_notes,
            equipment_code=equipment.equipment_code,
            brand_preference=equipment.brand_preference,
            alternative_equipment=equipment.alternative_equipment,
            maintenance_notes=equipment.maintenance_notes,
            storage_requirements=equipment.storage_requirements,
            cost_estimate=equipment.cost_estimate,
            display_order=equipment.display_order,
            created_by=equipment.created_by,
            updated_by=equipment.updated_by,
            created_at=equipment.created_at,
            updated_at=equipment.updated_at
        )


# Global instance
equipment_service = EquipmentService()