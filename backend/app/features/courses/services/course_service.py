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
                     created_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> CourseResponse:
        """Create a new course."""
        # Verify program exists and is accessible within program context
        program_query = db.query(Program).filter(Program.id == course_data.program_id)
        if program_context:
            program_query = program_query.filter(Program.id == program_context)
        
        program = program_query.first()
        if not program:
            if program_context:
                raise ValueError(f"Program with ID '{course_data.program_id}' not found or not accessible in current program context")
            else:
                raise ValueError(f"Program with ID '{course_data.program_id}' not found")
        
        # Create course
        course = self.create(db, course_data, created_by)
        
        return self._to_course_response(db, course)
    
    def get_course(self, db: Session, course_id: str, program_context: Optional[str] = None) -> Optional[CourseResponse]:
        """Get course by ID."""
        query = db.query(Course).filter(Course.id == course_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Course.program_id == program_context)
        
        course = query.first()
        if not course:
            return None
        
        return self._to_course_response(db, course)
    
    def update_course(self, 
                     db: Session, 
                     course_id: str, 
                     course_data: CourseUpdate,
                     updated_by: Optional[str] = None,
                     program_context: Optional[str] = None) -> Optional[CourseResponse]:
        """Update course information."""
        # First validate course exists and is accessible via program context
        course_response = self.get_course(db, course_id, program_context)
        if not course_response:
            return None
        
        # Get the actual course object for updating
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
    
    def delete_course(self, db: Session, course_id: str, program_context: Optional[str] = None) -> bool:
        """Delete a course."""
        # First validate course exists and is accessible via program context
        course_response = self.get_course(db, course_id, program_context)
        if not course_response:
            return False
        
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
                    per_page: int = 20,
                    program_context: Optional[str] = None) -> Tuple[List[CourseResponse], int]:
        """List courses with optional search and pagination."""
        query = db.query(Course)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Course.program_id == program_context)
        
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
                        Course.code.ilike(search_term)
                    )
                )
            
            # Keep program_id search param for backward compatibility but program_context takes precedence
            if search_params.program_id and not program_context:
                query = query.filter(Course.program_id == search_params.program_id)
            
            if search_params.status:
                query = query.filter(Course.status == search_params.status)
            
            if search_params.duration_weeks_min:
                query = query.filter(Course.duration_weeks >= search_params.duration_weeks_min)
            
            if search_params.duration_weeks_max:
                query = query.filter(Course.duration_weeks <= search_params.duration_weeks_max)
            
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
                              per_page: int = 20,
                              program_context: Optional[str] = None) -> Tuple[List[CourseResponse], int]:
        """Get all courses for a specific program."""
        query = db.query(Course).filter(Course.program_id == program_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Course.program_id == program_context)
        
        query = query.order_by(asc(Course.sequence))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        courses = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        course_responses = [self._to_course_response(db, course) for course in courses]
        
        return course_responses, total_count
    
    def get_course_stats(self, db: Session, program_context: Optional[str] = None) -> CourseStatsResponse:
        """Get course statistics."""
        # Base query for courses
        base_query = db.query(Course)
        
        # Apply program context filtering if provided
        if program_context:
            base_query = base_query.filter(Course.program_id == program_context)
        
        # Total courses
        total_courses = base_query.count()
        
        # Courses by status
        status_stats = base_query.with_entities(
            Course.status,
            func.count(Course.id)
        ).group_by(Course.status).all()
        courses_by_status = dict(status_stats)
        
        # Courses by program
        program_stats = base_query.with_entities(
            Program.name,
            func.count(Course.id)
        ).join(Program).group_by(Program.name).all()
        courses_by_program = dict(program_stats)
        
        # Average duration
        avg_duration = base_query.with_entities(func.avg(Course.duration_weeks)).filter(
            Course.duration_weeks.isnot(None)
        ).scalar() or 0
        
        # Average curricula per course
        curriculum_counts = db.query(func.count(Curriculum.id)).join(Course)
        if program_context:
            curriculum_counts = curriculum_counts.filter(Course.program_id == program_context)
        curriculum_counts = curriculum_counts.scalar() or 0
        avg_curricula_per_course = curriculum_counts / total_courses if total_courses > 0 else 0
        
        # Duration stats
        min_duration = base_query.with_entities(func.min(Course.duration_weeks)).filter(
            Course.duration_weeks.isnot(None)
        ).scalar() or 0
        
        max_duration = base_query.with_entities(func.max(Course.duration_weeks)).filter(
            Course.duration_weeks.isnot(None)
        ).scalar() or 0
        
        participant_capacity_stats = {
            "average_duration_weeks": avg_duration,
            "min_duration_weeks": min_duration,
            "max_duration_weeks": max_duration
        }
        
        return CourseStatsResponse(
            total_courses=total_courses,
            courses_by_status=courses_by_status,
            courses_by_program=courses_by_program,
            average_duration_weeks=avg_duration,
            average_curricula_per_course=avg_curricula_per_course,
            participant_capacity_stats=participant_capacity_stats
        )
    
    def get_course_tree(self, db: Session, course_id: str, program_context: Optional[str] = None) -> Optional[CourseTreeResponse]:
        """Get course with full tree structure of curricula and levels."""
        query = db.query(Course).options(
            joinedload(Course.curricula).joinedload(Curriculum.levels)
        ).filter(Course.id == course_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Course.program_id == program_context)
        
        course = query.first()
        
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
                         updated_by: Optional[str] = None,
                         program_context: Optional[str] = None) -> Dict[str, Any]:
        """Bulk move courses to a different program."""
        # Verify target program exists
        target_program = db.query(Program).filter(Program.id == request.target_program_id).first()
        if not target_program:
            raise ValueError(f"Target program with ID '{request.target_program_id}' not found")
        
        successful = []
        failed = []
        
        for course_id in request.course_ids:
            try:
                # First validate course exists and is accessible via program context
                course_response = self.get_course(db, course_id, program_context)
                if not course_response:
                    failed.append({"id": course_id, "error": "Course not found or not accessible"})
                    continue
                
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
                          updated_by: Optional[str] = None,
                          program_context: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update course status."""
        # First validate all courses exist and are accessible via program context
        successful = []
        failed = []
        
        for course_id in request.course_ids:
            try:
                course_response = self.get_course(db, course_id, program_context)
                if not course_response:
                    failed.append({"id": course_id, "error": "Course not found or not accessible"})
                    continue
                
                course = self.get(db, course_id)
                if course:
                    course.status = request.new_status
                    if updated_by and hasattr(course, 'updated_by'):
                        course.updated_by = updated_by
                    db.add(course)
                    successful.append(course_id)
                else:
                    failed.append({"id": course_id, "error": "Course not found"})
                    
            except Exception as e:
                failed.append({"id": course_id, "error": str(e)})
        
        db.commit()
        
        result = {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.course_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
        
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
                       updated_by: Optional[str] = None,
                       program_context: Optional[str] = None) -> Dict[str, Any]:
        """Reorder courses within their program by updating sequence."""
        successful = []
        failed = []
        
        for order_data in course_orders:
            try:
                course_id = order_data["id"]
                new_order = order_data["sequence"]
                
                # First validate course exists and is accessible via program context
                course_response = self.get_course(db, course_id, program_context)
                if not course_response:
                    failed.append({"id": course_id, "error": "Course not found or not accessible"})
                    continue
                
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
        
        # Handle objectives and prerequisites safely
        objectives = course.objectives
        if objectives is None or objectives == 'null' or (isinstance(objectives, str) and objectives.strip() == ''):
            objectives = []
        elif isinstance(objectives, str):
            try:
                import json
                objectives = json.loads(objectives)
            except:
                objectives = []
        
        prerequisites = course.prerequisites  
        if prerequisites is None or prerequisites == 'null' or (isinstance(prerequisites, str) and prerequisites.strip() == ''):
            prerequisites = []
        elif isinstance(prerequisites, str):
            try:
                import json
                prerequisites = json.loads(prerequisites)
            except:
                prerequisites = []
        
        return CourseResponse(
            id=course.id,
            name=course.name,
            code=course.code,
            description=course.description,
            program_id=course.program_id,
            objectives=objectives,
            prerequisites=prerequisites,
            duration_weeks=course.duration_weeks,
            sessions_per_payment=course.sessions_per_payment,
            completion_deadline_weeks=course.completion_deadline_weeks,
            age_ranges=course.age_ranges or [],
            location_types=course.location_types or [],
            session_types=course.session_types or [],
            pricing_matrix=course.pricing_matrix or [],
            instructor_id=course.instructor_id,
            max_students=course.max_students,
            min_students=course.min_students,
            tags=course.tags or [],
            image_url=course.image_url,
            video_url=course.video_url,
            sequence=course.sequence,
            difficulty_level=course.difficulty_level,
            is_featured=course.is_featured,
            is_certification_course=course.is_certification_course,
            status=course.status,
            total_curricula=curriculum_count,
            total_lessons=total_lesson_count,
            created_by=course.created_by,
            updated_by=course.updated_by,
            created_at=course.created_at,
            updated_at=course.updated_at
        )


# Global instance
course_service = CourseService()