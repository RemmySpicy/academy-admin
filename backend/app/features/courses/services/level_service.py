"""
Level service for curriculum management operations.
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
from app.features.courses.schemas.level import (
    LevelCreate,
    LevelUpdate,
    LevelResponse,
    LevelSearchParams,
    LevelStatsResponse,
    LevelTreeResponse,
    LevelReorderRequest,
    LevelBulkStatusUpdateRequest,
    LevelProgressTrackingResponse
)
from .base_service import BaseService


class LevelService(BaseService[Level, LevelCreate, LevelUpdate]):
    """Service for level operations."""
    
    def __init__(self):
        super().__init__(Level)
    
    def create_level(self, 
                    db: Session, 
                    level_data: LevelCreate, 
                    created_by: Optional[str] = None) -> LevelResponse:
        """Create a new level."""
        # Verify curriculum exists
        curriculum = db.query(Curriculum).filter(Curriculum.id == level_data.curriculum_id).first()
        if not curriculum:
            raise ValueError(f"Curriculum with ID '{level_data.curriculum_id}' not found")
        
        # Check for duplicate sequence in the same curriculum
        existing_level = db.query(Level).filter(
            and_(
                Level.curriculum_id == level_data.curriculum_id,
                Level.sequence == level_data.sequence
            )
        ).first()
        
        if existing_level:
            raise ValueError(f"Level with sequence {level_data.sequence} already exists in this curriculum")
        
        # Create level
        level = self.create(db, level_data, created_by)
        
        return self._to_level_response(db, level)
    
    def get_level(self, db: Session, level_id: str) -> Optional[LevelResponse]:
        """Get level by ID."""
        level = self.get(db, level_id)
        if not level:
            return None
        
        return self._to_level_response(db, level)
    
    def update_level(self, 
                    db: Session, 
                    level_id: str, 
                    level_data: LevelUpdate,
                    updated_by: Optional[str] = None) -> Optional[LevelResponse]:
        """Update level information."""
        level = self.get(db, level_id)
        if not level:
            return None
        
        # Check for duplicate sequence if being updated
        if level_data.sequence and level_data.sequence != level.sequence:
            existing_level = db.query(Level).filter(
                and_(
                    Level.curriculum_id == level.curriculum_id,
                    Level.sequence == level_data.sequence,
                    Level.id != level_id
                )
            ).first()
            
            if existing_level:
                raise ValueError(f"Level with sequence {level_data.sequence} already exists in this curriculum")
        
        # Verify new curriculum exists if being updated
        if level_data.curriculum_id and level_data.curriculum_id != level.curriculum_id:
            curriculum = db.query(Curriculum).filter(Curriculum.id == level_data.curriculum_id).first()
            if not curriculum:
                raise ValueError(f"Curriculum with ID '{level_data.curriculum_id}' not found")
        
        # Update level
        updated_level = self.update(db, level, level_data, updated_by)
        
        return self._to_level_response(db, updated_level)
    
    def delete_level(self, db: Session, level_id: str) -> bool:
        """Delete a level."""
        # Check if level has modules
        module_count = db.query(func.count(Module.id)).filter(
            Module.level_id == level_id
        ).scalar()
        
        if module_count > 0:
            raise ValueError(f"Cannot delete level with {module_count} modules. Delete modules first.")
        
        return self.delete(db, level_id)
    
    def list_levels(self, 
                   db: Session,
                   search_params: Optional[LevelSearchParams] = None,
                   page: int = 1,
                   per_page: int = 20) -> Tuple[List[LevelResponse], int]:
        """List levels with optional search and pagination."""
        query = db.query(Level).join(Curriculum).join(Course).join(Program)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Level.name.ilike(search_term),
                        Level.description.ilike(search_term),
                        Level.entry_criteria.ilike(search_term),
                        Level.exit_criteria.ilike(search_term),
                        Level.learning_objectives.ilike(search_term),
                        Curriculum.name.ilike(search_term),
                        Course.name.ilike(search_term),
                        Program.name.ilike(search_term)
                    )
                )
            
            if search_params.curriculum_id:
                query = query.filter(Level.curriculum_id == search_params.curriculum_id)
            
            if search_params.course_id:
                query = query.filter(Curriculum.course_id == search_params.course_id)
            
            if search_params.program_id:
                query = query.filter(Course.program_id == search_params.program_id)
            
            if search_params.status:
                query = query.filter(Level.status == search_params.status)
            
            if search_params.duration_hours_min:
                query = query.filter(Level.estimated_duration_hours >= search_params.duration_hours_min)
            
            if search_params.duration_hours_max:
                query = query.filter(Level.estimated_duration_hours <= search_params.duration_hours_max)
            
            if search_params.sequence_from:
                query = query.filter(Level.sequence >= search_params.sequence_from)
            
            if search_params.sequence_to:
                query = query.filter(Level.sequence <= search_params.sequence_to)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(Level, search_params.sort_by, Level.sequence)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(asc(Level.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        levels = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        level_responses = [self._to_level_response(db, level) for level in levels]
        
        return level_responses, total_count
    
    def get_levels_by_curriculum(self, 
                                db: Session, 
                                curriculum_id: str,
                                page: int = 1,
                                per_page: int = 20) -> Tuple[List[LevelResponse], int]:
        """Get all levels for a specific curriculum."""
        query = db.query(Level).filter(Level.curriculum_id == curriculum_id)
        query = query.order_by(asc(Level.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        levels = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        level_responses = [self._to_level_response(db, level) for level in levels]
        
        return level_responses, total_count
    
    def get_level_stats(self, db: Session) -> LevelStatsResponse:
        """Get level statistics."""
        # Total levels
        total_levels = db.query(func.count(Level.id)).scalar()
        
        # Levels by status
        status_stats = db.query(
            Level.status,
            func.count(Level.id)
        ).group_by(Level.status).all()
        levels_by_status = dict(status_stats)
        
        # Levels by curriculum
        curriculum_stats = db.query(
            Curriculum.name,
            func.count(Level.id)
        ).join(Curriculum).group_by(Curriculum.name).all()
        levels_by_curriculum = dict(curriculum_stats)
        
        # Levels by course
        course_stats = db.query(
            Course.name,
            func.count(Level.id)
        ).join(Curriculum).join(Course).group_by(Course.name).all()
        levels_by_course = dict(course_stats)
        
        # Levels by program
        program_stats = db.query(
            Program.name,
            func.count(Level.id)
        ).join(Curriculum).join(Course).join(Program).group_by(Program.name).all()
        levels_by_program = dict(program_stats)
        
        # Average modules per level
        module_counts = db.query(func.count(Module.id)).join(Level).scalar() or 0
        avg_modules_per_level = module_counts / total_levels if total_levels > 0 else 0
        
        # Average duration
        avg_duration = db.query(func.avg(Level.estimated_duration_hours)).filter(
            Level.estimated_duration_hours.isnot(None)
        ).scalar() or 0
        
        # Completion rate stats (placeholder - would need student progress data)
        completion_rate_stats = {
            "average_completion_rate": 85.0,
            "min_completion_rate": 45.0,
            "max_completion_rate": 98.0
        }
        
        return LevelStatsResponse(
            total_levels=total_levels,
            levels_by_status=levels_by_status,
            levels_by_curriculum=levels_by_curriculum,
            levels_by_course=levels_by_course,
            levels_by_program=levels_by_program,
            average_modules_per_level=avg_modules_per_level,
            average_duration_hours=avg_duration,
            completion_rate_stats=completion_rate_stats
        )
    
    def get_level_tree(self, db: Session, level_id: str) -> Optional[LevelTreeResponse]:
        """Get level with full tree structure of modules and lessons."""
        level = db.query(Level).options(
            joinedload(Level.modules)
            .joinedload(Module.sections)
            .joinedload(Section.lessons)
        ).filter(Level.id == level_id).first()
        
        if not level:
            return None
        
        # Build module tree with lessons
        modules = []
        for module in level.modules:
            module_data = {
                "id": module.id,
                "name": module.name,
                "sequence": module.sequence,
                "status": module.status,
                "sections": []
            }
            
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
                module_data["sections"].append(section_data)
            
            # Sort sections by sequence
            module_data["sections"].sort(key=lambda x: x["sequence"])
            modules.append(module_data)
        
        # Sort modules by sequence
        modules.sort(key=lambda x: x["sequence"])
        
        return LevelTreeResponse(
            id=level.id,
            name=level.name,
            curriculum_id=level.curriculum_id,
            sequence=level.sequence,
            status=level.status,
            modules=modules
        )
    
    def reorder_levels(self, 
                      db: Session, 
                      request: LevelReorderRequest,
                      updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Reorder levels within their curriculum by updating sequence."""
        successful = []
        failed = []
        
        # Validate that all levels belong to the same curriculum
        level_ids = [order["id"] for order in request.level_orders]
        levels = db.query(Level).filter(Level.id.in_(level_ids)).all()
        
        if len(levels) != len(level_ids):
            raise ValueError("Some levels not found")
        
        curriculum_ids = set(level.curriculum_id for level in levels)
        if len(curriculum_ids) > 1:
            raise ValueError("All levels must belong to the same curriculum")
        
        # Update sequences
        for order_data in request.level_orders:
            try:
                level_id = order_data["id"]
                new_sequence = order_data["sequence"]
                
                level = next((l for l in levels if l.id == level_id), None)
                if level:
                    level.sequence = new_sequence
                    if updated_by and hasattr(level, 'updated_by'):
                        level.updated_by = updated_by
                    
                    db.add(level)
                    successful.append(level_id)
                else:
                    failed.append({"id": level_id, "error": "Level not found"})
                    
            except Exception as e:
                failed.append({"id": order_data.get("id", "unknown"), "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.level_orders),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def bulk_update_status(self, 
                          db: Session, 
                          request: LevelBulkStatusUpdateRequest,
                          updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update level status."""
        result = self.bulk_update(
            db, 
            request.level_ids, 
            {"status": request.new_status}, 
            updated_by
        )
        
        # Also update modules status if requested
        if request.update_modules:
            module_ids = db.query(Module.id).filter(
                Module.level_id.in_(request.level_ids)
            ).all()
            module_ids = [mid[0] for mid in module_ids]
            
            if module_ids:
                db.query(Module).filter(
                    Module.id.in_(module_ids)
                ).update({"status": request.new_status}, synchronize_session=False)
                db.commit()
        
        return result
    
    def get_level_progress_tracking(self, 
                                   db: Session, 
                                   level_id: str) -> Optional[LevelProgressTrackingResponse]:
        """Get progress tracking information for a level."""
        level = self.get(db, level_id)
        if not level:
            return None
        
        # Placeholder data - would need actual student progress tracking
        return LevelProgressTrackingResponse(
            level_id=level_id,
            level_name=level.name,
            total_students=25,
            students_completed=18,
            students_in_progress=5,
            average_completion_time_hours=12.5,
            success_rate=72.0,
            common_challenges=[
                "Understanding basic concepts",
                "Completing practical exercises",
                "Meeting assessment criteria"
            ]
        )
    
    def _to_level_response(self, db: Session, level: Level) -> LevelResponse:
        """Convert Level model to LevelResponse."""
        # Get curriculum, course, and program information
        curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
        curriculum_name = curriculum.name if curriculum else None
        
        course = None
        course_name = None
        program = None
        program_name = None
        program_code = None
        
        if curriculum:
            course = db.query(Course).filter(Course.id == curriculum.course_id).first()
            course_name = course.name if course else None
            
            if course:
                program = db.query(Program).filter(Program.id == course.program_id).first()
                program_name = program.name if program else None
                program_code = program.program_code if program else None
        
        # Get module count
        module_count = db.query(func.count(Module.id)).filter(
            Module.level_id == level.id
        ).scalar() or 0
        
        # Get total lesson count
        total_lesson_count = db.query(func.count(Lesson.id)).join(
            Section, Section.id == Lesson.section_id
        ).join(
            Module, Module.id == Section.module_id
        ).filter(Module.level_id == level.id).scalar() or 0
        
        # Placeholder completion rate
        completion_rate = 85.5
        
        return LevelResponse(
            id=level.id,
            name=level.name,
            description=level.description,
            curriculum_id=level.curriculum_id,
            curriculum_name=curriculum_name,
            course_name=course_name,
            program_name=program_name,
            program_code=program_code,
            sequence=level.sequence,
            entry_criteria=level.entry_criteria,
            exit_criteria=level.exit_criteria,
            estimated_duration_hours=level.estimated_duration_hours,
            learning_objectives=level.learning_objectives,
            instructor_notes=level.instructor_notes,
            status=level.status,
            module_count=module_count,
            total_lesson_count=total_lesson_count,
            completion_rate=completion_rate,
            created_by=level.created_by,
            updated_by=level.updated_by,
            created_at=level.created_at,
            updated_at=level.updated_at
        )


# Global instance
level_service = LevelService()