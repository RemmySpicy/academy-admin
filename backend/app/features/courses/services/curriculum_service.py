"""
Curriculum service for curriculum management operations.
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
from app.features.courses.schemas.curriculum import (
    CurriculumCreate,
    CurriculumUpdate,
    CurriculumResponse,
    CurriculumSearchParams,
    CurriculumStatsResponse,
    CurriculumTreeResponse,
    CurriculumBulkMoveRequest,
    CurriculumBulkStatusUpdateRequest,
    CurriculumDuplicateRequest
)
from .base_service import BaseService


class CurriculumService(BaseService[Curriculum, CurriculumCreate, CurriculumUpdate]):
    """Service for curriculum operations."""
    
    def __init__(self):
        super().__init__(Curriculum)
    
    def create_curriculum(self, 
                         db: Session, 
                         curriculum_data: CurriculumCreate, 
                         created_by: Optional[str] = None) -> CurriculumResponse:
        """Create a new curriculum."""
        # Verify course exists
        course = db.query(Course).filter(Course.id == curriculum_data.course_id).first()
        if not course:
            raise ValueError(f"Course with ID '{curriculum_data.course_id}' not found")
        
        # Create curriculum
        curriculum = self.create(db, curriculum_data, created_by)
        
        return self._to_curriculum_response(db, curriculum)
    
    def get_curriculum(self, db: Session, curriculum_id: str) -> Optional[CurriculumResponse]:
        """Get curriculum by ID."""
        curriculum = self.get(db, curriculum_id)
        if not curriculum:
            return None
        
        return self._to_curriculum_response(db, curriculum)
    
    def update_curriculum(self, 
                         db: Session, 
                         curriculum_id: str, 
                         curriculum_data: CurriculumUpdate,
                         updated_by: Optional[str] = None) -> Optional[CurriculumResponse]:
        """Update curriculum information."""
        curriculum = self.get(db, curriculum_id)
        if not curriculum:
            return None
        
        # Verify new course exists if being updated
        if curriculum_data.course_id and curriculum_data.course_id != curriculum.course_id:
            course = db.query(Course).filter(Course.id == curriculum_data.course_id).first()
            if not course:
                raise ValueError(f"Course with ID '{curriculum_data.course_id}' not found")
        
        # Update curriculum
        updated_curriculum = self.update(db, curriculum, curriculum_data, updated_by)
        
        return self._to_curriculum_response(db, updated_curriculum)
    
    def delete_curriculum(self, db: Session, curriculum_id: str) -> bool:
        """Delete a curriculum."""
        # Check if curriculum has levels
        level_count = db.query(func.count(Level.id)).filter(
            Level.curriculum_id == curriculum_id
        ).scalar()
        
        if level_count > 0:
            raise ValueError(f"Cannot delete curriculum with {level_count} levels. Delete levels first.")
        
        return self.delete(db, curriculum_id)
    
    def list_curricula(self, 
                      db: Session,
                      search_params: Optional[CurriculumSearchParams] = None,
                      page: int = 1,
                      per_page: int = 20) -> Tuple[List[CurriculumResponse], int]:
        """List curricula with optional search and pagination."""
        query = db.query(Curriculum).join(Course).join(Program)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Curriculum.name.ilike(search_term),
                        Curriculum.description.ilike(search_term),
                        Curriculum.prerequisites.ilike(search_term),
                        Curriculum.learning_objectives.ilike(search_term),
                        Course.name.ilike(search_term),
                        Program.name.ilike(search_term)
                    )
                )
            
            if search_params.course_id:
                query = query.filter(Curriculum.course_id == search_params.course_id)
            
            if search_params.program_id:
                query = query.filter(Course.program_id == search_params.program_id)
            
            if search_params.difficulty_level:
                query = query.filter(Curriculum.difficulty_level == search_params.difficulty_level)
            
            if search_params.status:
                query = query.filter(Curriculum.status == search_params.status)
            
            if search_params.min_age_from:
                query = query.filter(Curriculum.min_age >= search_params.min_age_from)
            
            if search_params.min_age_to:
                query = query.filter(Curriculum.min_age <= search_params.min_age_to)
            
            if search_params.max_age_from:
                query = query.filter(Curriculum.max_age >= search_params.max_age_from)
            
            if search_params.max_age_to:
                query = query.filter(Curriculum.max_age <= search_params.max_age_to)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(Curriculum, search_params.sort_by, Curriculum.sequence)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(asc(Curriculum.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        curricula = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        curriculum_responses = [self._to_curriculum_response(db, curriculum) for curriculum in curricula]
        
        return curriculum_responses, total_count
    
    def get_curricula_by_course(self, 
                               db: Session, 
                               course_id: str,
                               page: int = 1,
                               per_page: int = 20) -> Tuple[List[CurriculumResponse], int]:
        """Get all curricula for a specific course."""
        query = db.query(Curriculum).filter(Curriculum.course_id == course_id)
        query = query.order_by(asc(Curriculum.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        curricula = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        curriculum_responses = [self._to_curriculum_response(db, curriculum) for curriculum in curricula]
        
        return curriculum_responses, total_count
    
    def get_curriculum_stats(self, db: Session) -> CurriculumStatsResponse:
        """Get curriculum statistics."""
        # Total curricula
        total_curricula = db.query(func.count(Curriculum.id)).scalar()
        
        # Curricula by status
        status_stats = db.query(
            Curriculum.status,
            func.count(Curriculum.id)
        ).group_by(Curriculum.status).all()
        curricula_by_status = dict(status_stats)
        
        # Curricula by difficulty
        difficulty_stats = db.query(
            Curriculum.difficulty_level,
            func.count(Curriculum.id)
        ).group_by(Curriculum.difficulty_level).all()
        curricula_by_difficulty = dict(difficulty_stats)
        
        # Curricula by course
        course_stats = db.query(
            Course.name,
            func.count(Curriculum.id)
        ).join(Course).group_by(Course.name).all()
        curricula_by_course = dict(course_stats)
        
        # Curricula by program
        program_stats = db.query(
            Program.name,
            func.count(Curriculum.id)
        ).join(Course).join(Program).group_by(Program.name).all()
        curricula_by_program = dict(program_stats)
        
        # Average levels per curriculum
        level_counts = db.query(func.count(Level.id)).join(Curriculum).scalar() or 0
        avg_levels_per_curriculum = level_counts / total_curricula if total_curricula > 0 else 0
        
        # Age range distribution
        age_ranges = {
            "3-6": 0, "7-10": 0, "11-14": 0, "15-18": 0, "Adult": 0
        }
        
        curricula_with_age = db.query(Curriculum.min_age, Curriculum.max_age).filter(
            and_(Curriculum.min_age.isnot(None), Curriculum.max_age.isnot(None))
        ).all()
        
        for min_age, max_age in curricula_with_age:
            if max_age <= 6:
                age_ranges["3-6"] += 1
            elif max_age <= 10:
                age_ranges["7-10"] += 1
            elif max_age <= 14:
                age_ranges["11-14"] += 1
            elif max_age <= 18:
                age_ranges["15-18"] += 1
            else:
                age_ranges["Adult"] += 1
        
        return CurriculumStatsResponse(
            total_curricula=total_curricula,
            curricula_by_status=curricula_by_status,
            curricula_by_difficulty=curricula_by_difficulty,
            curricula_by_course=curricula_by_course,
            curricula_by_program=curricula_by_program,
            average_levels_per_curriculum=avg_levels_per_curriculum,
            age_range_distribution=age_ranges
        )
    
    def get_curriculum_tree(self, db: Session, curriculum_id: str) -> Optional[CurriculumTreeResponse]:
        """Get curriculum with full tree structure of levels, modules, and lessons."""
        curriculum = db.query(Curriculum).options(
            joinedload(Curriculum.levels)
            .joinedload(Level.modules)
            .joinedload(Module.sections)
            .joinedload(Section.lessons)
        ).filter(Curriculum.id == curriculum_id).first()
        
        if not curriculum:
            return None
        
        # Build level tree with modules and lessons
        levels = []
        for level in curriculum.levels:
            level_data = {
                "id": level.id,
                "name": level.name,
                "sequence": level.sequence,
                "status": level.status,
                "modules": []
            }
            
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
                level_data["modules"].append(module_data)
            
            # Sort modules by sequence
            level_data["modules"].sort(key=lambda x: x["sequence"])
            levels.append(level_data)
        
        # Sort levels by sequence
        levels.sort(key=lambda x: x["sequence"])
        
        return CurriculumTreeResponse(
            id=curriculum.id,
            name=curriculum.name,
            course_id=curriculum.course_id,
            difficulty_level=curriculum.difficulty_level,
            status=curriculum.status,
            levels=levels
        )
    
    def duplicate_curriculum(self, 
                            db: Session, 
                            curriculum_id: str,
                            request: CurriculumDuplicateRequest,
                            created_by: Optional[str] = None) -> CurriculumResponse:
        """Duplicate a curriculum with all its content."""
        # Get original curriculum
        original = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
        if not original:
            raise ValueError(f"Curriculum with ID '{curriculum_id}' not found")
        
        # Determine target course
        target_course_id = request.target_course_id or original.course_id
        target_course = db.query(Course).filter(Course.id == target_course_id).first()
        if not target_course:
            raise ValueError(f"Target course with ID '{target_course_id}' not found")
        
        # Create new curriculum
        new_curriculum_data = {
            "name": request.new_name,
            "description": original.description,
            "course_id": target_course_id,
            "difficulty_level": original.difficulty_level,
            "min_age": original.min_age,
            "max_age": original.max_age,
            "prerequisites": original.prerequisites,
            "learning_objectives": original.learning_objectives,
            "status": "draft",  # Always start as draft
            "sequence": 0  # Will be set to max + 1
        }
        
        # Set display order
        max_order = db.query(func.max(Curriculum.sequence)).filter(
            Curriculum.course_id == target_course_id
        ).scalar() or 0
        new_curriculum_data["sequence"] = max_order + 1
        
        new_curriculum = Curriculum(**new_curriculum_data)
        if created_by:
            new_curriculum.created_by = created_by
        
        db.add(new_curriculum)
        db.flush()  # Get the ID without committing
        
        # TODO: Duplicate levels, modules, sections, lessons, assessments, equipment, media
        # This would be a complex operation requiring recursive duplication
        # For now, just create the curriculum structure
        
        db.commit()
        db.refresh(new_curriculum)
        
        return self._to_curriculum_response(db, new_curriculum)
    
    def bulk_move_curricula(self, 
                           db: Session, 
                           request: CurriculumBulkMoveRequest,
                           updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk move curricula to a different course."""
        # Verify target course exists
        target_course = db.query(Course).filter(Course.id == request.target_course_id).first()
        if not target_course:
            raise ValueError(f"Target course with ID '{request.target_course_id}' not found")
        
        successful = []
        failed = []
        
        for curriculum_id in request.curriculum_ids:
            try:
                curriculum = self.get(db, curriculum_id)
                if curriculum:
                    curriculum.course_id = request.target_course_id
                    
                    # Reset display order if not preserving
                    if not request.preserve_order:
                        max_order = db.query(func.max(Curriculum.sequence)).filter(
                            Curriculum.course_id == request.target_course_id
                        ).scalar() or 0
                        curriculum.sequence = max_order + 1
                    
                    if updated_by and hasattr(curriculum, 'updated_by'):
                        curriculum.updated_by = updated_by
                    
                    db.add(curriculum)
                    successful.append(curriculum_id)
                else:
                    failed.append({"id": curriculum_id, "error": "Curriculum not found"})
                    
            except Exception as e:
                failed.append({"id": curriculum_id, "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.curriculum_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def bulk_update_status(self, 
                          db: Session, 
                          request: CurriculumBulkStatusUpdateRequest,
                          updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update curriculum status."""
        result = self.bulk_update(
            db, 
            request.curriculum_ids, 
            {"status": request.new_status}, 
            updated_by
        )
        
        # Also update levels status if requested
        if request.update_levels:
            level_ids = db.query(Level.id).filter(
                Level.curriculum_id.in_(request.curriculum_ids)
            ).all()
            level_ids = [lid[0] for lid in level_ids]
            
            if level_ids:
                db.query(Level).filter(
                    Level.id.in_(level_ids)
                ).update({"status": request.new_status}, synchronize_session=False)
                db.commit()
        
        return result
    
    def _to_curriculum_response(self, db: Session, curriculum: Curriculum) -> CurriculumResponse:
        """Convert Curriculum model to CurriculumResponse."""
        # Get course and program information
        course = db.query(Course).filter(Course.id == curriculum.course_id).first()
        course_name = course.name if course else None
        
        program = None
        program_name = None
        program_code = None
        if course:
            program = db.query(Program).filter(Program.id == course.program_id).first()
            program_name = program.name if program else None
            program_code = program.program_code if program else None
        
        # Get level count
        level_count = db.query(func.count(Level.id)).filter(
            Level.curriculum_id == curriculum.id
        ).scalar() or 0
        
        # Get total module count
        total_module_count = db.query(func.count(Module.id)).join(
            Level, Level.id == Module.level_id
        ).filter(Level.curriculum_id == curriculum.id).scalar() or 0
        
        # Get total lesson count
        total_lesson_count = db.query(func.count(Lesson.id)).join(
            Section, Section.id == Lesson.section_id
        ).join(
            Module, Module.id == Section.module_id
        ).join(
            Level, Level.id == Module.level_id
        ).filter(Level.curriculum_id == curriculum.id).scalar() or 0
        
        # Calculate estimated duration (placeholder calculation)
        estimated_duration_hours = level_count * 8.0  # Rough estimate
        
        return CurriculumResponse(
            id=curriculum.id,
            name=curriculum.name,
            description=curriculum.description,
            course_id=curriculum.course_id,
            course_name=course_name,
            program_name=program_name,
            program_code=program_code,
            difficulty_level=curriculum.difficulty_level,
            min_age=curriculum.min_age,
            max_age=curriculum.max_age,
            prerequisites=curriculum.prerequisites,
            learning_objectives=curriculum.learning_objectives,
            status=curriculum.status,
            sequence=curriculum.sequence,
            level_count=level_count,
            total_module_count=total_module_count,
            total_lesson_count=total_lesson_count,
            estimated_duration_hours=estimated_duration_hours,
            created_by=curriculum.created_by,
            updated_by=curriculum.updated_by,
            created_at=curriculum.created_at,
            updated_at=curriculum.updated_at
        )


# Global instance
curriculum_service = CurriculumService()