"""
Lesson service layer for curriculum management.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.programs.models.program import Program
from app.features.courses.models.course import Course
from app.features.curricula.models.curriculum import Curriculum
from app.features.curricula.models.level import Level
from app.features.curricula.models.module import Module
from app.features.curricula.models.section import Section
from app.features.content.models.lesson import Lesson
from app.features.content.schemas.lesson import (
    LessonCreate,
    LessonUpdate,
    LessonResponse,
    LessonDetailResponse,
    LessonSearchParams,
    LessonStatsResponse,
    LessonProgressTrackingResponse,
    LessonDuplicateRequest,
    LessonReorderRequest,
    LessonBulkStatusUpdateRequest,
)
from .base_service import BaseService


class LessonService(BaseService[Lesson, LessonCreate, LessonUpdate]):
    """Service for managing curriculum lessons."""
    
    def __init__(self):
        super().__init__(Lesson)

    def create_lesson(self, 
                     db: Session, 
                     lesson_data: LessonCreate, 
                     created_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> LessonResponse:
        """Create a new lesson."""
        # Verify section exists and program access
        section_query = db.query(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
            Section.id == lesson_data.section_id
        )
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            section_query = section_query.filter(Course.program_id == program_context)
        
        section = section_query.first()
        if not section:
            raise ValueError(f"Section with ID '{lesson_data.section_id}' not found or access denied")
        
        # 🔒 PROGRAM CONTEXT VALIDATION
        if program_context:
            module = db.query(Module).filter(Module.id == section.module_id).first()
            if module:
                level = db.query(Level).filter(Level.id == module.level_id).first()
                if level:
                    curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
                    if curriculum:
                        course = db.query(Course).filter(Course.id == curriculum.course_id).first()
                        if course and course.program_id != program_context:
                            raise PermissionError(f"Cannot create lesson for section in different program context")
        
        # Check for duplicate sequence in the same section
        existing_lesson = db.query(Lesson).filter(
            and_(
                Lesson.section_id == lesson_data.section_id,
                Lesson.sequence == lesson_data.sequence
            )
        ).first()
        
        if existing_lesson:
            raise ValueError(f"Lesson with sequence {lesson_data.sequence} already exists in this section")
        
        # Create lesson
        lesson = self.create(db, lesson_data, created_by)
        
        return self._to_lesson_response(db, lesson)

    def get_lesson(self, db: Session, lesson_id: str, program_context: Optional[str] = None) -> Optional[LessonResponse]:
        """Get a lesson by ID."""
        # Build query with program context filtering
        query = db.query(Lesson).filter(Lesson.id == lesson_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        lesson = query.first()
        if not lesson:
            return None
        
        return self._to_lesson_response(db, lesson)

    def get_lesson_detail(self, db: Session, lesson_id: str, program_context: Optional[str] = None) -> Optional[LessonDetailResponse]:
        """Get lesson with full details."""
        # Build query with program context filtering
        query = db.query(Lesson).filter(Lesson.id == lesson_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        lesson = query.first()
        if not lesson:
            return None
        
        return self._to_lesson_detail_response(db, lesson)

    def list_lessons(self, 
                    db: Session, 
                    search_params: Optional[LessonSearchParams] = None, 
                    page: int = 1, 
                    per_page: int = 20,
                    program_context: Optional[str] = None) -> Tuple[List[LessonResponse], int]:
        """List lessons with pagination and filtering."""
        query = db.query(Lesson).join(Section).join(Module).join(Level).join(Curriculum).join(Course).join(Program)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.filter(Course.program_id == program_context)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Lesson.title.ilike(search_term),
                        Lesson.content.ilike(search_term),
                        Lesson.objectives.ilike(search_term),
                        Lesson.materials.ilike(search_term),
                        Section.name.ilike(search_term),
                        Module.name.ilike(search_term),
                        Level.name.ilike(search_term),
                        Curriculum.name.ilike(search_term),
                        Course.name.ilike(search_term),
                        Program.name.ilike(search_term)
                    )
                )
            
            if search_params.section_id:
                query = query.filter(Lesson.section_id == search_params.section_id)
            
            if search_params.module_id:
                query = query.filter(Section.module_id == search_params.module_id)
            
            if search_params.level_id:
                query = query.filter(Module.level_id == search_params.level_id)
            
            if search_params.curriculum_id:
                query = query.filter(Level.curriculum_id == search_params.curriculum_id)
            
            if search_params.course_id:
                query = query.filter(Curriculum.course_id == search_params.course_id)
            
            if search_params.program_id:
                query = query.filter(Course.program_id == search_params.program_id)
            
            if search_params.content_type:
                query = query.filter(Lesson.content_type == search_params.content_type)
            
            if search_params.status:
                query = query.filter(Lesson.status == search_params.status)
            
            if search_params.duration_minutes_min:
                query = query.filter(Lesson.duration_minutes >= search_params.duration_minutes_min)
            
            if search_params.duration_minutes_max:
                query = query.filter(Lesson.duration_minutes <= search_params.duration_minutes_max)
            
            if search_params.sequence_from:
                query = query.filter(Lesson.sequence >= search_params.sequence_from)
            
            if search_params.sequence_to:
                query = query.filter(Lesson.sequence <= search_params.sequence_to)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(Lesson, search_params.sort_by, Lesson.sequence)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(asc(Lesson.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        lessons = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        lesson_responses = [self._to_lesson_response(db, lesson) for lesson in lessons]
        
        return lesson_responses, total_count

    def update_lesson(self, 
                     db: Session, 
                     lesson_id: str, 
                     lesson_data: LessonUpdate, 
                     updated_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> Optional[LessonResponse]:
        """Update a lesson."""
        # Get lesson with program context filtering
        query = db.query(Lesson).filter(Lesson.id == lesson_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        lesson = query.first()
        if not lesson:
            return None
        
        # Check for duplicate sequence if being updated
        if lesson_data.sequence and lesson_data.sequence != lesson.sequence:
            existing_lesson = db.query(Lesson).filter(
                and_(
                    Lesson.section_id == lesson.section_id,
                    Lesson.sequence == lesson_data.sequence,
                    Lesson.id != lesson_id
                )
            ).first()
            
            if existing_lesson:
                raise ValueError(f"Lesson with sequence {lesson_data.sequence} already exists in this section")
        
        # Verify new section exists and program access if being updated
        if lesson_data.section_id and lesson_data.section_id != lesson.section_id:
            section_query = db.query(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Section.id == lesson_data.section_id
            )
            
            # 🔒 PROGRAM CONTEXT FILTERING
            if program_context:
                section_query = section_query.filter(Course.program_id == program_context)
            
            section = section_query.first()
            if not section:
                raise ValueError(f"Section with ID '{lesson_data.section_id}' not found or access denied")
            
            # 🔒 PROGRAM CONTEXT VALIDATION
            if program_context:
                module = db.query(Module).filter(Module.id == section.module_id).first()
                if module:
                    level = db.query(Level).filter(Level.id == module.level_id).first()
                    if level:
                        curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
                        if curriculum:
                            course = db.query(Course).filter(Course.id == curriculum.course_id).first()
                            if course and course.program_id != program_context:
                                raise PermissionError(f"Cannot move lesson to section in different program context")
        
        # Update lesson
        updated_lesson = self.update(db, lesson, lesson_data, updated_by)
        
        return self._to_lesson_response(db, updated_lesson)

    def delete_lesson(self, db: Session, lesson_id: str, program_context: Optional[str] = None) -> bool:
        """Delete a lesson."""
        # Verify lesson exists and program access
        lesson_query = db.query(Lesson).filter(Lesson.id == lesson_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            lesson_query = lesson_query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        lesson = lesson_query.first()
        if not lesson:
            return False
        
        # Delete the lesson using the validated instance
        db.delete(lesson)
        db.commit()
        return True

    def get_lessons_by_section(self, 
                              db: Session, 
                              section_id: str, 
                              page: int = 1, 
                              per_page: int = 20,
                              program_context: Optional[str] = None) -> Tuple[List[LessonResponse], int]:
        """Get lessons for a specific section."""
        # Verify section access first
        section_query = db.query(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
            Section.id == section_id
        )
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            section_query = section_query.filter(Course.program_id == program_context)
        
        section = section_query.first()
        if not section:
            return [], 0
        
        query = db.query(Lesson).filter(Lesson.section_id == section_id)
        query = query.order_by(asc(Lesson.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        lessons = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        lesson_responses = [self._to_lesson_response(db, lesson) for lesson in lessons]
        
        return lesson_responses, total_count

    def get_lesson_progress_tracking(self, 
                                    db: Session, 
                                    lesson_id: str,
                                    program_context: Optional[str] = None) -> Optional[LessonProgressTrackingResponse]:
        """Get progress tracking for a lesson."""
        # Verify lesson access with program context
        query = db.query(Lesson).filter(Lesson.id == lesson_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            query = query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        lesson = query.first()
        if not lesson:
            return None
        
        # Placeholder data - would need actual student progress tracking
        return LessonProgressTrackingResponse(
            lesson_id=lesson_id,
            lesson_title=lesson.title,
            total_students=28,
            students_completed=21,
            students_in_progress=4,
            average_completion_time_minutes=lesson.duration_minutes * 1.2 if lesson.duration_minutes else 45.0,
            success_rate=75.0,
            engagement_metrics={
                "video_completion_rate": 88.5,
                "quiz_attempts": 2.3,
                "discussion_participation": 65.0
            },
            common_difficulties=[
                "Understanding key concepts",
                "Completing practical exercises",
                "Applying knowledge to examples"
            ]
        )

    def duplicate_lesson(self, 
                        db: Session, 
                        lesson_id: str, 
                        duplicate_data: LessonDuplicateRequest, 
                        created_by: Optional[str] = None,
                        program_context: Optional[str] = None) -> LessonResponse:
        """Duplicate a lesson."""
        # Get original lesson with program context filtering
        original_query = db.query(Lesson).filter(Lesson.id == lesson_id)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            original_query = original_query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        original = original_query.first()
        if not original:
            raise ValueError(f"Lesson with ID '{lesson_id}' not found or access denied")
        
        # Determine target section with program context validation
        target_section_id = duplicate_data.target_section_id or original.section_id
        target_section_query = db.query(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
            Section.id == target_section_id
        )
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            target_section_query = target_section_query.filter(Course.program_id == program_context)
        
        target_section = target_section_query.first()
        if not target_section:
            raise ValueError(f"Target section with ID '{target_section_id}' not found or access denied")
        
        # 🔒 PROGRAM CONTEXT VALIDATION
        if program_context:
            module = db.query(Module).filter(Module.id == target_section.module_id).first()
            if module:
                level = db.query(Level).filter(Level.id == module.level_id).first()
                if level:
                    curriculum = db.query(Curriculum).filter(Curriculum.id == level.curriculum_id).first()
                    if curriculum:
                        course = db.query(Course).filter(Course.id == curriculum.course_id).first()
                        if course and course.program_id != program_context:
                            raise PermissionError(f"Cannot duplicate lesson to section in different program context")
        
        # Create new lesson
        new_lesson_data = {
            "title": duplicate_data.new_title,
            "content": original.content,
            "section_id": target_section_id,
            "content_type": original.content_type,
            "duration_minutes": original.duration_minutes,
            "objectives": original.objectives,
            "materials": original.materials,
            "instructions": original.instructions,
            "assessment_criteria": original.assessment_criteria,
            "status": "draft",  # Always start as draft
            "sequence": 0  # Will be set to max + 1
        }
        
        # Set sequence
        max_sequence = db.query(func.max(Lesson.sequence)).filter(
            Lesson.section_id == target_section_id
        ).scalar() or 0
        new_lesson_data["sequence"] = max_sequence + 1
        
        new_lesson = Lesson(**new_lesson_data)
        if created_by:
            new_lesson.created_by = created_by
        
        db.add(new_lesson)
        db.commit()
        db.refresh(new_lesson)
        
        return self._to_lesson_response(db, new_lesson)

    def reorder_lessons(self, 
                       db: Session, 
                       reorder_data: LessonReorderRequest, 
                       updated_by: Optional[str] = None,
                       program_context: Optional[str] = None) -> Dict[str, Any]:
        """Reorder lessons."""
        # Validate that all lessons belong to the same section and program context
        lesson_ids = [order["id"] for order in reorder_data.lesson_orders]
        lessons_query = db.query(Lesson).filter(Lesson.id.in_(lesson_ids))
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            lessons_query = lessons_query.join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                Course.program_id == program_context
            )
        
        lessons = lessons_query.all()
        
        if len(lessons) != len(lesson_ids):
            raise ValueError("Some lessons not found or access denied")
        
        section_ids = set(lesson.section_id for lesson in lessons)
        if len(section_ids) > 1:
            raise ValueError("All lessons must belong to the same section")
        
        successful = []
        failed = []
        
        # Update sequences
        for order_data in reorder_data.lesson_orders:
            try:
                lesson_id = order_data["id"]
                new_sequence = order_data["sequence"]
                
                lesson = next((l for l in lessons if l.id == lesson_id), None)
                if lesson:
                    lesson.sequence = new_sequence
                    if updated_by and hasattr(lesson, 'updated_by'):
                        lesson.updated_by = updated_by
                    
                    db.add(lesson)
                    successful.append(lesson_id)
                else:
                    failed.append({"id": lesson_id, "error": "Lesson not found"})
                    
            except Exception as e:
                failed.append({"id": order_data.get("id", "unknown"), "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(reorder_data.lesson_orders),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }

    def bulk_update_status(self, 
                          db: Session, 
                          status_data: LessonBulkStatusUpdateRequest, 
                          updated_by: Optional[str] = None,
                          program_context: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update lesson status."""
        # Validate all lessons are accessible in current program context
        if program_context:
            accessible_lessons = db.query(Lesson.id).join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
                and_(
                    Lesson.id.in_(status_data.lesson_ids),
                    Course.program_id == program_context
                )
            ).all()
            
            accessible_ids = [l[0] for l in accessible_lessons]
            inaccessible_ids = set(status_data.lesson_ids) - set(accessible_ids)
            
            if inaccessible_ids:
                raise PermissionError(f"Access denied for lessons: {list(inaccessible_ids)}")
        
        result = self.bulk_update(
            db, 
            status_data.lesson_ids, 
            {"status": status_data.new_status}, 
            updated_by
        )
        
        return result

    def get_lesson_stats(self, db: Session, program_context: Optional[str] = None) -> LessonStatsResponse:
        """Get lesson statistics."""
        # Base query with program context filtering
        base_query = db.query(Lesson).join(Section).join(Module).join(Level).join(Curriculum).join(Course)
        
        # 🔒 PROGRAM CONTEXT FILTERING
        if program_context:
            base_query = base_query.filter(Course.program_id == program_context)
        
        # Total lessons
        total_lessons = base_query.count()
        
        # Lessons by status
        status_query = db.query(
            Lesson.status,
            func.count(Lesson.id)
        ).join(Section).join(Module).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            status_query = status_query.filter(Course.program_id == program_context)
        
        status_stats = status_query.group_by(Lesson.status).all()
        lessons_by_status = dict(status_stats)
        
        # Lessons by content type
        content_type_query = db.query(
            Lesson.content_type,
            func.count(Lesson.id)
        ).join(Section).join(Module).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            content_type_query = content_type_query.filter(Course.program_id == program_context)
        
        content_type_stats = content_type_query.group_by(Lesson.content_type).all()
        lessons_by_content_type = dict(content_type_stats)
        
        # Lessons by section
        section_query = db.query(
            Section.name,
            func.count(Lesson.id)
        ).join(Section).join(Module).join(Level).join(Curriculum).join(Course)
        
        if program_context:
            section_query = section_query.filter(Course.program_id == program_context)
        
        section_stats = section_query.group_by(Section.name).all()
        lessons_by_section = dict(section_stats)
        
        # Lessons by program
        program_query = db.query(
            Program.name,
            func.count(Lesson.id)
        ).join(Section).join(Module).join(Level).join(Curriculum).join(Course).join(Program)
        
        if program_context:
            program_query = program_query.filter(Course.program_id == program_context)
        
        program_stats = program_query.group_by(Program.name).all()
        lessons_by_program = dict(program_stats)
        
        # Average duration
        duration_query = db.query(func.avg(Lesson.duration_minutes)).join(Section).join(Module).join(Level).join(Curriculum).join(Course).filter(
            Lesson.duration_minutes.isnot(None)
        )
        
        if program_context:
            duration_query = duration_query.filter(Course.program_id == program_context)
        
        avg_duration = duration_query.scalar() or 0
        
        # Completion rate stats (placeholder - would need student progress data)
        completion_rate_stats = {
            "average_completion_rate": 82.3,
            "min_completion_rate": 45.0,
            "max_completion_rate": 97.5
        }
        
        # Engagement metrics (placeholder)
        engagement_metrics = {
            "average_video_completion": 78.5,
            "average_quiz_score": 85.2,
            "discussion_participation_rate": 68.0
        }
        
        return LessonStatsResponse(
            total_lessons=total_lessons,
            lessons_by_status=lessons_by_status,
            lessons_by_content_type=lessons_by_content_type,
            lessons_by_section=lessons_by_section,
            lessons_by_program=lessons_by_program,
            average_duration_minutes=avg_duration,
            completion_rate_stats=completion_rate_stats,
            engagement_metrics=engagement_metrics
        )
    
    def _to_lesson_response(self, db: Session, lesson: Lesson) -> LessonResponse:
        """Convert Lesson model to LessonResponse."""
        # Get section, module, level, curriculum, course, and program information
        section = db.query(Section).filter(Section.id == lesson.section_id).first()
        section_name = section.name if section else None
        
        module = None
        module_name = None
        level = None
        level_name = None
        curriculum = None
        curriculum_name = None
        course = None
        course_name = None
        program = None
        program_name = None
        program_code = None
        
        if section:
            module = db.query(Module).filter(Module.id == section.module_id).first()
            module_name = module.name if module else None
            
            if module:
                level = db.query(Level).filter(Level.id == module.level_id).first()
                level_name = level.name if level else None
                
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
        
        # Placeholder completion rate
        completion_rate = 82.3
        
        return LessonResponse(
            id=lesson.id,
            title=lesson.title,
            section_id=lesson.section_id,
            section_name=section_name,
            module_name=module_name,
            level_name=level_name,
            curriculum_name=curriculum_name,
            course_name=course_name,
            program_name=program_name,
            program_code=program_code,
            sequence=lesson.sequence,
            content_type=lesson.content_type,
            duration_minutes=lesson.duration_minutes,
            status=lesson.status,
            completion_rate=completion_rate,
            created_by=lesson.created_by,
            updated_by=lesson.updated_by,
            created_at=lesson.created_at,
            updated_at=lesson.updated_at
        )
    
    def _to_lesson_detail_response(self, db: Session, lesson: Lesson) -> LessonDetailResponse:
        """Convert Lesson model to LessonDetailResponse."""
        # Get basic lesson response first
        lesson_response = self._to_lesson_response(db, lesson)
        
        return LessonDetailResponse(
            **lesson_response.dict(),
            content=lesson.content,
            objectives=lesson.objectives,
            materials=lesson.materials,
            instructions=lesson.instructions,
            assessment_criteria=lesson.assessment_criteria,
            media_attachments=[],  # Placeholder - would need media relationship
            prerequisites=[],  # Placeholder - would need prerequisites relationship
            related_lessons=[]  # Placeholder - would need related lessons logic
        )


lesson_service = LessonService()