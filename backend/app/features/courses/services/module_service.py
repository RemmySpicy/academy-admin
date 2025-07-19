"""
Module service layer for curriculum management.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.courses.models.program import Program
from app.features.courses.models.course import Course
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.level import Level
from app.features.courses.models.module import Module
from app.features.courses.models.section import Section
from app.features.courses.models.lesson import Lesson
from app.features.courses.schemas.module import (
    ModuleCreate,
    ModuleUpdate,
    ModuleResponse,
    ModuleSearchParams,
    ModuleStatsResponse,
    ModuleTreeResponse,
    ModuleReorderRequest,
    ModuleBulkStatusUpdateRequest,
    ModuleProgressTrackingResponse,
)
from .base_service import BaseService


class ModuleService(BaseService[Module, ModuleCreate, ModuleUpdate]):
    """Service for managing curriculum modules."""
    
    def __init__(self):
        super().__init__(Module)

    def create_module(self, 
                     db: Session, 
                     module_data: ModuleCreate, 
                     created_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> ModuleResponse:
        """Create a new module."""
        # Verify level exists and program access
        level_query = db.query(Level).join(Curriculum).join(Course).filter(Level.id == module_data.level_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            level_query = level_query.filter(Course.program_id == program_context)
        
        level = level_query.first()
        if not level:
            raise ValueError(f"Level with ID '{module_data.level_id}' not found or access denied")
        
        # 🔒 PROGRAM CONTEXT VALIDATION
        if program_context:
            curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
            if curriculum:
                course = db.query(Course).filter(Course.id == curriculum.course_id).first()
                if course and course.program_id != program_context:
                    raise PermissionError(f"Cannot create module for level in different program context")
        
        # Check for duplicate sequence in the same level
        existing_module = db.query(Module).filter(
            and_(
                Module.level_id == module_data.level_id,
                Module.sequence == module_data.sequence
            )
        ).first()
        
        if existing_module:
            raise ValueError(f"Module with sequence {module_data.sequence} already exists in this level")
        
        # Create module
        module = self.create(db, module_data, created_by)
        
        return self._to_module_response(db, module)

    def get_module(self, db: Session, module_id: str, program_context: Optional[str] = None) -> Optional[ModuleResponse]:
        """Get a module by ID."""
        # Build query with program context filtering
        query = db.query(Module).filter(Module.id == module_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Level).join(Curriculum).join(Course).filter(Course.program_id == program_context)
        
        module = query.first()
        if not module:
            return None
        
        return self._to_module_response(db, module)

    def list_modules(
        self, db: Session, search_params: Optional[ModuleSearchParams] = None,
        page: int = 1, per_page: int = 20, program_context: Optional[str] = None
    ) -> Tuple[List[ModuleResponse], int]:
        """List modules with pagination and filtering."""
        query = db.query(Module).join(Level).join(Curriculum).join(Course).join(Program)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter(Course.program_id == program_context)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Module.name.ilike(search_term),
                        Module.description.ilike(search_term),
                        Module.learning_objectives.ilike(search_term),
                        Level.name.ilike(search_term),
                        Curriculum.name.ilike(search_term),
                        Course.name.ilike(search_term),
                        Program.name.ilike(search_term)
                    )
                )
            
            if search_params.level_id:
                query = query.filter(Module.level_id == search_params.level_id)
            
            if search_params.curriculum_id:
                query = query.filter(Level.curriculum_id == search_params.curriculum_id)
            
            if search_params.course_id:
                query = query.filter(Curriculum.course_id == search_params.course_id)
            
            if search_params.program_id:
                query = query.filter(Course.program_id == search_params.program_id)
            
            if search_params.status:
                query = query.filter(Module.status == search_params.status)
            
            if search_params.duration_hours_min:
                query = query.filter(Module.estimated_duration_hours >= search_params.duration_hours_min)
            
            if search_params.duration_hours_max:
                query = query.filter(Module.estimated_duration_hours <= search_params.duration_hours_max)
            
            if search_params.sequence_from:
                query = query.filter(Module.sequence >= search_params.sequence_from)
            
            if search_params.sequence_to:
                query = query.filter(Module.sequence <= search_params.sequence_to)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(Module, search_params.sort_by, Module.sequence)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(asc(Module.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        modules = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        module_responses = [self._to_module_response(db, module) for module in modules]
        
        return module_responses, total_count

    def update_module(
        self, db: Session, module_id: str, module_data: ModuleUpdate, 
        updated_by: Optional[str] = None, program_context: Optional[str] = None
    ) -> Optional[ModuleResponse]:
        """Update a module."""
        # Get module with program context filtering
        query = db.query(Module).filter(Module.id == module_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Level).join(Curriculum).join(Course).filter(Course.program_id == program_context)
        
        module = query.first()
        if not module:
            return None
        
        # Check for duplicate sequence if being updated
        if module_data.sequence and module_data.sequence != module.sequence:
            existing_module = db.query(Module).filter(
                and_(
                    Module.level_id == module.level_id,
                    Module.sequence == module_data.sequence,
                    Module.id != module_id
                )
            ).first()
            
            if existing_module:
                raise ValueError(f"Module with sequence {module_data.sequence} already exists in this level")
        
        # Verify new level exists and program access if being updated
        if module_data.level_id and module_data.level_id != module.level_id:
            level_query = db.query(Level).join(Curriculum).join(Course).filter(Level.id == module_data.level_id)
            
            # 🔒 PROGRAM CONTEXT FILTERING
            if program_context:
                level_query = level_query.filter(Course.program_id == program_context)
            
            level = level_query.first()
            if not level:
                raise ValueError(f"Level with ID '{module_data.level_id}' not found or access denied")
            
            # 🔒 PROGRAM CONTEXT VALIDATION
            if program_context:
                curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
                if curriculum:
                    course = db.query(Course).filter(Course.id == curriculum.course_id).first()
                    if course and course.program_id != program_context:
                        raise PermissionError(f"Cannot move module to level in different program context")
        
        # Update module
        updated_module = self.update(db, module, module_data, updated_by)
        
        return self._to_module_response(db, updated_module)

    def delete_module(self, db: Session, module_id: str, program_context: Optional[str] = None) -> bool:
        """Delete a module."""
        # Verify module exists and program access
        module_query = db.query(Module).filter(Module.id == module_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            module_query = module_query.join(Level).join(Curriculum).join(Course).filter(Course.program_id == program_context)
        
        module = module_query.first()
        if not module:
            return False
        
        # Check if module has sections
        section_count = db.query(func.count(Section.id)).filter(
            Section.module_id == module_id
        ).scalar()
        
        if section_count > 0:
            raise ValueError(f"Cannot delete module with {section_count} sections. Delete sections first.")
        
        # Delete the module using the validated instance
        db.delete(module)
        db.commit()
        return True

    def get_modules_by_level(
        self, db: Session, level_id: str, page: int = 1, per_page: int = 20,
        program_context: Optional[str] = None
    ) -> Tuple[List[ModuleResponse], int]:
        """Get modules for a specific level."""
        # Verify level access first
        level_query = db.query(Level).join(Curriculum).join(Course).filter(Level.id == level_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            level_query = level_query.filter(Course.program_id == program_context)
        
        level = level_query.first()
        if not level:
            return [], 0
        
        query = db.query(Module).filter(Module.level_id == level_id)
        query = query.order_by(asc(Module.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        modules = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        module_responses = [self._to_module_response(db, module) for module in modules]
        
        return module_responses, total_count

    def get_module_tree(self, db: Session, module_id: str, program_context: Optional[str] = None) -> Optional[ModuleTreeResponse]:
        """Get module tree structure."""
        query = db.query(Module).options(
            joinedload(Module.sections)
            .joinedload(Section.lessons)
        ).filter(Module.id == module_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Level).join(Curriculum).join(Course).filter(Course.program_id == program_context)
        
        module = query.first()
        if not module:
            return None
        
        # Build section tree with lessons
        sections = []
        for section in module.sections:
            section_data = {
                "id": section.id,
                "name": section.name,
                "sequence": section.sequence,
                "lessons": []
            }
            
            for lesson in section.lessons:
                lesson_data = {
                    "id": lesson.id,
                    "title": lesson.title,
                    "sequence": lesson.sequence,
                    "content_type": lesson.content_type
                }
                section_data["lessons"].append(lesson_data)
            
            # Sort lessons by sequence
            section_data["lessons"].sort(key=lambda x: x["sequence"])
            sections.append(section_data)
        
        # Sort sections by sequence
        sections.sort(key=lambda x: x["sequence"])
        
        return ModuleTreeResponse(
            id=module.id,
            name=module.name,
            level_id=module.level_id,
            sequence=module.sequence,
            status=module.status,
            sections=sections
        )

    def get_module_progress_tracking(
        self, db: Session, module_id: str, program_context: Optional[str] = None
    ) -> Optional[ModuleProgressTrackingResponse]:
        """Get progress tracking for a module."""
        # Verify module access with program context
        query = db.query(Module).filter(Module.id == module_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Level).join(Curriculum).join(Course).filter(Course.program_id == program_context)
        
        module = query.first()
        if not module:
            return None
        
        # Placeholder data - would need actual student progress tracking
        return ModuleProgressTrackingResponse(
            module_id=module_id,
            module_name=module.name,
            total_students=30,
            students_completed=22,
            students_in_progress=6,
            average_completion_time_hours=8.5,
            success_rate=73.3,
            common_challenges=[
                "Understanding core concepts",
                "Completing hands-on exercises",
                "Meeting assessment requirements"
            ]
        )

    def reorder_modules(
        self, db: Session, reorder_data: ModuleReorderRequest, 
        updated_by: Optional[str] = None, program_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Reorder modules."""
        # Validate that all modules belong to the same level and program context
        module_ids = [order["id"] for order in reorder_data.module_orders]
        modules_query = db.query(Module).filter(Module.id.in_(module_ids))
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            modules_query = modules_query.join(Level).join(Curriculum).join(Course).filter(Course.program_id == program_context)
        
        modules = modules_query.all()
        
        if len(modules) != len(module_ids):
            raise ValueError("Some modules not found or access denied")
        
        level_ids = set(module.level_id for module in modules)
        if len(level_ids) > 1:
            raise ValueError("All modules must belong to the same level")
        
        successful = []
        failed = []
        
        # Update sequences
        for order_data in reorder_data.module_orders:
            try:
                module_id = order_data["id"]
                new_sequence = order_data["sequence"]
                
                module = next((m for m in modules if m.id == module_id), None)
                if module:
                    module.sequence = new_sequence
                    if updated_by and hasattr(module, 'updated_by'):
                        module.updated_by = updated_by
                    
                    db.add(module)
                    successful.append(module_id)
                else:
                    failed.append({"id": module_id, "error": "Module not found"})
                    
            except Exception as e:
                failed.append({"id": order_data.get("id", "unknown"), "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(reorder_data.module_orders),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }

    def bulk_update_status(
        self, db: Session, status_data: ModuleBulkStatusUpdateRequest, 
        updated_by: Optional[str] = None, program_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Bulk update module status."""
        # Validate all modules are accessible in current program context
        if program_context:
            accessible_modules = db.query(Module.id).join(Level).join(Curriculum).join(Course).filter(
                and_(
                    Module.id.in_(status_data.module_ids),
                    Course.program_id == program_context
                )
            ).all()
            
            accessible_ids = [m[0] for m in accessible_modules]
            inaccessible_ids = set(status_data.module_ids) - set(accessible_ids)
            
            if inaccessible_ids:
                raise PermissionError(f"Access denied for modules: {list(inaccessible_ids)}")
        
        result = self.bulk_update(
            db, 
            status_data.module_ids, 
            {"status": status_data.new_status}, 
            updated_by
        )
        
        # Also update sections status if requested
        if status_data.update_sections:
            section_ids = db.query(Section.id).filter(
                Section.module_id.in_(status_data.module_ids)
            ).all()
            section_ids = [sid[0] for sid in section_ids]
            
            if section_ids:
                db.query(Section).filter(
                    Section.id.in_(section_ids)
                ).update({"status": status_data.new_status}, synchronize_session=False)
                db.commit()
        
        return result

    def get_module_stats(self, db: Session, program_context: Optional[str] = None) -> ModuleStatsResponse:
        """Get module statistics."""
        # Base query with program context filtering
        base_query = db.query(Module).join(Level).join(Curriculum).join(Course)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            base_query = base_query.filter(Course.program_id == program_context)
        
        # Total modules
        total_modules = base_query.count()
        
        # Modules by status
        status_query = db.query(
            Module.status,
            func.count(Module.id)
        ).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            status_query = status_query.filter(Course.program_id == program_context)
        
        status_stats = status_query.group_by(Module.status).all()
        modules_by_status = dict(status_stats)
        
        # Modules by level
        level_query = db.query(
            Level.name,
            func.count(Module.id)
        ).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            level_query = level_query.filter(Course.program_id == program_context)
        
        level_stats = level_query.group_by(Level.name).all()
        modules_by_level = dict(level_stats)
        
        # Modules by curriculum
        curriculum_query = db.query(
            Curriculum.name,
            func.count(Module.id)
        ).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            curriculum_query = curriculum_query.filter(Course.program_id == program_context)
        
        curriculum_stats = curriculum_query.group_by(Curriculum.name).all()
        modules_by_curriculum = dict(curriculum_stats)
        
        # Modules by program
        program_query = db.query(
            Program.name,
            func.count(Module.id)
        ).join(Level).join(Curriculum).join(Course).join(Program)
        
        if program_context:
            program_query = program_query.filter(Course.program_id == program_context)
        
        program_stats = program_query.group_by(Program.name).all()
        modules_by_program = dict(program_stats)
        
        # Average sections per module
        section_query = db.query(func.count(Section.id)).join(Module).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            section_query = section_query.filter(Course.program_id == program_context)
        
        section_counts = section_query.scalar() or 0
        avg_sections_per_module = section_counts / total_modules if total_modules > 0 else 0
        
        # Average duration
        duration_query = db.query(func.avg(Module.estimated_duration_hours)).join(Level).join(Curriculum).join(Course).filter(
            Module.estimated_duration_hours.isnot(None)
        )
        
        if program_context:
            duration_query = duration_query.filter(Course.program_id == program_context)
        
        avg_duration = duration_query.scalar() or 0
        
        # Completion rate stats (placeholder - would need student progress data)
        completion_rate_stats = {
            "average_completion_rate": 78.5,
            "min_completion_rate": 42.0,
            "max_completion_rate": 95.0
        }
        
        return ModuleStatsResponse(
            total_modules=total_modules,
            modules_by_status=modules_by_status,
            modules_by_level=modules_by_level,
            modules_by_curriculum=modules_by_curriculum,
            modules_by_program=modules_by_program,
            average_sections_per_module=avg_sections_per_module,
            average_duration_hours=avg_duration,
            completion_rate_stats=completion_rate_stats
        )
    
    def _to_module_response(self, db: Session, module: Module) -> ModuleResponse:
        """Convert Module model to ModuleResponse."""
        # Get level, curriculum, course, and program information
        level = db.query(Level).filter(Level.id == module.level_id).first()
        level_name = level.name if level else None
        
        curriculum = None
        curriculum_name = None
        course = None
        course_name = None
        program = None
        program_name = None
        program_code = None
        
        if level:
            curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
            curriculum_name = curriculum.name if curriculum else None
            
            if curriculum:
                course = db.query(Course).filter(Course.id == curriculum.course_id).first()
                course_name = course.name if course else None
                
                if course:
                    program = db.query(Program).filter(Program.id == course.program_id).first()
                    program_name = program.name if program else None
                    program_code = program.program_code if program else None
        
        # Get section count
        section_count = db.query(func.count(Section.id)).filter(
            Section.module_id == module.id
        ).scalar() or 0
        
        # Get total lesson count
        total_lesson_count = db.query(func.count(Lesson.id)).join(
            Section, Section.id == Lesson.section_id
        ).filter(Section.module_id == module.id).scalar() or 0
        
        # Placeholder completion rate
        completion_rate = 78.5
        
        return ModuleResponse(
            id=module.id,
            name=module.name,
            description=module.description,
            level_id=module.level_id,
            level_name=level_name,
            curriculum_name=curriculum_name,
            course_name=course_name,
            program_name=program_name,
            program_code=program_code,
            sequence=module.sequence,
            estimated_duration_hours=module.estimated_duration_hours,
            learning_objectives=module.learning_objectives,
            instructor_notes=module.instructor_notes,
            status=module.status,
            section_count=section_count,
            total_lesson_count=total_lesson_count,
            completion_rate=completion_rate,
            created_by=module.created_by,
            updated_by=module.updated_by,
            created_at=module.created_at,
            updated_at=module.updated_at
        )


# Create service instance
module_service = ModuleService()