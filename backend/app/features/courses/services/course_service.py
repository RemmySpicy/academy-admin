"""
Course service for curriculum management operations.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.courses.models.program import Program
from app.features.courses.models.course import Course
from app.features.courses.models.curriculum import Curriculum
from app.features.courses.models.level import Level
from app.features.courses.models.module import Module
from app.features.courses.models.lesson import Lesson
from app.features.courses.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseSearchParams,
    CourseStatsResponse,
    CourseTreeResponse,
    CourseBulkMoveRequest,
    CourseBulkStatusUpdateRequest
)
from .base_service import BaseService


class CourseService(BaseService[Course, CourseCreate, CourseUpdate]):
    """Service for course operations."""
    
    def __init__(self):
        super().__init__(Course)
    
    def create_course(self, 
                     db: Session, 
                     course_data: CourseCreate, 
                     created_by: Optional[str] = None) -> CourseResponse:
        """Create a new course."""
        # Verify program exists
        program = db.query(Program).filter(Program.id == course_data.program_id).first()
        if not program:
            raise ValueError(f"Program with ID '{course_data.program_id}' not found")
        
        # Create course
        course = self.create(db, course_data, created_by)
        
        return self._to_course_response(db, course)
    
    def get_course(self, db: Session, course_id: str) -> Optional[CourseResponse]:
        """Get course by ID."""
        course = self.get(db, course_id)
        if not course:
            return None
        
        return self._to_course_response(db, course)
    
    def update_course(self, 
                     db: Session, 
                     course_id: str, 
                     course_data: CourseUpdate,
                     updated_by: Optional[str] = None) -> Optional[CourseResponse]:
        """Update course information."""
        course = self.get(db, course_id)
        if not course:
            return None
        
        # Verify new program exists if being updated
        if course_data.program_id and course_data.program_id != course.program_id:
            program = db.query(Program).filter(Program.id == course_data.program_id).first()
            if not program:
                raise ValueError(f"Program with ID '{course_data.program_id}' not found")
        
        # Update course
        updated_course = self.update(db, course, course_data, updated_by)
        
        return self._to_course_response(db, updated_course)
    
    def delete_course(self, db: Session, course_id: str) -> bool:
        """Delete a course."""
        # Check if course has curricula
        curriculum_count = db.query(func.count(Curriculum.id)).filter(
            Curriculum.course_id == course_id
        ).scalar()
        
        if curriculum_count > 0:
            raise ValueError(f"Cannot delete course with {curriculum_count} curricula. Delete curricula first.")
        
        return self.delete(db, course_id)
    
    def list_courses(self, 
                    db: Session,
                    search_params: Optional[CourseSearchParams] = None,
                    page: int = 1,
                    per_page: int = 20) -> Tuple[List[CourseResponse], int]:
        """List courses with optional search and pagination."""
        query = db.query(Course)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Course.name.ilike(search_term),
                        Course.description.ilike(search_term),
                        Course.objectives.ilike(search_term),
                        Course.prerequisites.ilike(search_term),
                        Course.course_code.ilike(search_term)
                    )
                )
            
            if search_params.program_id:
                query = query.filter(Course.program_id == search_params.program_id)
            
            if search_params.status:
                query = query.filter(Course.status == search_params.status)
            
            if search_params.duration_hours_min:
                query = query.filter(Course.duration_hours >= search_params.duration_hours_min)
            
            if search_params.duration_hours_max:
                query = query.filter(Course.duration_hours <= search_params.duration_hours_max)
            
            if search_params.difficulty_level:
                query = query.filter(Course.difficulty_level == search_params.difficulty_level)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(Course, search_params.sort_by, Course.sequence)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(asc(Course.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        courses = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        course_responses = [self._to_course_response(db, course) for course in courses]
        
        return course_responses, total_count
    
    def get_courses_by_program(self, 
                              db: Session, 
                              program_id: str,
                              page: int = 1,
                              per_page: int = 20) -> Tuple[List[CourseResponse], int]:
        """Get all courses for a specific program."""
        query = db.query(Course).filter(Course.program_id == program_id)
        query = query.order_by(asc(Course.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        courses = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        course_responses = [self._to_course_response(db, course) for course in courses]
        
        return course_responses, total_count
    
    def get_course_stats(self, db: Session) -> CourseStatsResponse:
        """Get course statistics."""
        # Total courses
        total_courses = db.query(func.count(Course.id)).scalar()
        
        # Courses by status
        status_stats = db.query(
            Course.status,
            func.count(Course.id)
        ).group_by(Course.status).all()
        courses_by_status = dict(status_stats)
        
        # Courses by program
        program_stats = db.query(
            Program.name,
            func.count(Course.id)
        ).join(Program).group_by(Program.name).all()
        courses_by_program = dict(program_stats)
        
        # Average duration
        avg_duration = db.query(func.avg(Course.duration_hours)).filter(
            Course.duration_hours.isnot(None)
        ).scalar() or 0
        
        # Average curricula per course
        curriculum_counts = db.query(func.count(Curriculum.id)).join(Course).scalar() or 0
        avg_curricula_per_course = curriculum_counts / total_courses if total_courses > 0 else 0
        
        # Duration stats
        min_duration = db.query(func.min(Course.duration_hours)).filter(
            Course.duration_hours.isnot(None)
        ).scalar() or 0
        
        max_duration = db.query(func.max(Course.duration_hours)).filter(
            Course.duration_hours.isnot(None)
        ).scalar() or 0
        
        participant_capacity_stats = {
            "average_duration_hours": avg_duration,
            "min_duration_hours": min_duration,
            "max_duration_hours": max_duration
        }
        
        return CourseStatsResponse(
            total_courses=total_courses,
            courses_by_status=courses_by_status,
            courses_by_program=courses_by_program,
            average_duration_weeks=avg_duration,
            average_curricula_per_course=avg_curricula_per_course,
            participant_capacity_stats=participant_capacity_stats
        )
    
    def get_course_tree(self, db: Session, course_id: str) -> Optional[CourseTreeResponse]:
        """Get course with full tree structure of curricula and levels."""
        course = db.query(Course).options(
            joinedload(Course.curricula).joinedload(Curriculum.levels)
        ).filter(Course.id == course_id).first()
        
        if not course:
            return None
        
        # Build curriculum tree with levels
        curricula = []
        for curriculum in course.curricula:
            curriculum_data = {
                "id": curriculum.id,
                "name": curriculum.name,
                "difficulty_level": curriculum.difficulty_level,
                "status": curriculum.status,
                "sequence": curriculum.sequence,
                "levels": []
            }
            
            for level in curriculum.levels:
                level_data = {
                    "id": level.id,
                    "name": level.name,
                    "sequence": level.sequence,
                    "status": level.status
                }
                curriculum_data["levels"].append(level_data)
            
            # Sort levels by sequence
            curriculum_data["levels"].sort(key=lambda x: x["sequence"])
            curricula.append(curriculum_data)
        
        # Sort curricula by display order
        curricula.sort(key=lambda x: x["sequence"])
        
        return CourseTreeResponse(
            id=course.id,
            name=course.name,
            program_id=course.program_id,
            status=course.status,
            curricula=curricula
        )
    
    def bulk_move_courses(self, 
                         db: Session, 
                         request: CourseBulkMoveRequest,
                         updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk move courses to a different program."""
        # Verify target program exists
        target_program = db.query(Program).filter(Program.id == request.target_program_id).first()
        if not target_program:
            raise ValueError(f"Target program with ID '{request.target_program_id}' not found")
        
        successful = []
        failed = []
        
        for course_id in request.course_ids:
            try:
                course = self.get(db, course_id)
                if course:
                    course.program_id = request.target_program_id
                    
                    # Reset display order if not preserving
                    if not request.preserve_order:
                        # Get max display order in target program
                        max_order = db.query(func.max(Course.sequence)).filter(
                            Course.program_id == request.target_program_id
                        ).scalar() or 0
                        course.sequence = max_order + 1
                    
                    if updated_by and hasattr(course, 'updated_by'):
                        course.updated_by = updated_by
                    
                    db.add(course)
                    successful.append(course_id)
                else:
                    failed.append({"id": course_id, "error": "Course not found"})
                    
            except Exception as e:
                failed.append({"id": course_id, "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.course_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def bulk_update_status(self, 
                          db: Session, 
                          request: CourseBulkStatusUpdateRequest,
                          updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update course status."""
        result = self.bulk_update(
            db, 
            request.course_ids, 
            {"status": request.new_status}, 
            updated_by
        )
        
        # Also update curricula status if requested
        if request.update_curricula:
            curriculum_ids = db.query(Curriculum.id).filter(
                Curriculum.course_id.in_(request.course_ids)
            ).all()
            curriculum_ids = [cid[0] for cid in curriculum_ids]
            
            if curriculum_ids:
                db.query(Curriculum).filter(
                    Curriculum.id.in_(curriculum_ids)
                ).update({"status": request.new_status}, synchronize_session=False)
                db.commit()
        
        return result
    
    def reorder_courses(self, 
                       db: Session, 
                       course_orders: List[Dict[str, int]],
                       updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Reorder courses within their program by updating sequence."""
        successful = []
        failed = []
        
        for order_data in course_orders:
            try:
                course_id = order_data["id"]
                new_order = order_data["sequence"]
                
                course = self.get(db, course_id)
                if course:
                    course.sequence = new_order
                    if updated_by and hasattr(course, 'updated_by'):
                        course.updated_by = updated_by
                    
                    db.add(course)
                    successful.append(course_id)
                else:
                    failed.append({"id": course_id, "error": "Course not found"})
                    
            except Exception as e:
                failed.append({"id": order_data.get("id", "unknown"), "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(course_orders),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def _to_course_response(self, db: Session, course: Course) -> CourseResponse:
        """Convert Course model to CourseResponse."""
        # Get program information (optional - avoid relationship errors)
        program_name = None
        program_code = None
        try:
            program = db.query(Program).filter(Program.id == course.program_id).first()
            if program:
                program_name = program.name
                program_code = getattr(program, 'program_code', None)
        except Exception:
            # Skip program lookup if there are relationship issues
            pass
        
        # Get curriculum count (optional - avoid relationship errors)
        curriculum_count = 0
        try:
            curriculum_count = db.query(func.count(Curriculum.id)).filter(
                Curriculum.course_id == course.id
            ).scalar() or 0
        except Exception:
            # Skip curriculum count if there are relationship issues
            pass
        
        # Get total lesson count (optional - avoid complex joins)
        total_lesson_count = 0
        try:
            total_lesson_count = db.query(func.count(Lesson.id)).join(
                Module, Module.id == Lesson.section_id
            ).join(
                Level, Level.id == Module.level_id
            ).join(
                Curriculum, Curriculum.id == Level.curriculum_id
            ).filter(Curriculum.course_id == course.id).scalar() or 0
        except Exception:
            # Skip lesson count if there are relationship issues
            pass
        
        return CourseResponse(
            id=course.id,
            name=course.name,
            description=course.description,
            program_id=course.program_id,
            program_name=program_name,
            program_code=program_code,
            objectives=course.objectives,
            duration_hours=course.duration_hours,
            difficulty_level=course.difficulty_level,
            prerequisites=course.prerequisites,
            sequence=course.sequence,
            status=course.status,
            curriculum_count=curriculum_count,
            total_lesson_count=total_lesson_count,
            created_by=course.created_by,
            updated_by=course.updated_by,
            created_at=course.created_at,
            updated_at=course.updated_at
        )


# Global instance
course_service = CourseService()