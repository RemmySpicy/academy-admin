"""
Program service for curriculum management operations.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.curriculum.models.program import Program
from app.features.curriculum.models.course import Course
from app.features.curriculum.models.curriculum import Curriculum
from app.features.curriculum.schemas.program import (
    ProgramCreate,
    ProgramUpdate,
    ProgramResponse,
    ProgramSearchParams,
    ProgramStatsResponse,
    ProgramTreeResponse
)
from .base_service import BaseService


class ProgramService(BaseService[Program, ProgramCreate, ProgramUpdate]):
    """Service for program operations."""
    
    def __init__(self):
        super().__init__(Program)
    
    def create_program(self, 
                      db: Session, 
                      program_data: ProgramCreate, 
                      created_by: Optional[str] = None) -> ProgramResponse:
        """Create a new program."""
        # Check for duplicate program code
        existing_program = db.query(Program).filter(
            Program.program_code == program_data.program_code
        ).first()
        
        if existing_program:
            raise ValueError(f"Program code '{program_data.program_code}' already exists")
        
        # Create program
        program = self.create(db, program_data, created_by)
        
        return self._to_program_response(db, program)
    
    def get_program(self, db: Session, program_id: str) -> Optional[ProgramResponse]:
        """Get program by ID."""
        program = self.get(db, program_id)
        if not program:
            return None
        
        return self._to_program_response(db, program)
    
    def get_program_by_code(self, db: Session, program_code: str) -> Optional[ProgramResponse]:
        """Get program by program code."""
        program = db.query(Program).filter(
            Program.program_code == program_code
        ).first()
        
        if not program:
            return None
        
        return self._to_program_response(db, program)
    
    def update_program(self, 
                      db: Session, 
                      program_id: str, 
                      program_data: ProgramUpdate,
                      updated_by: Optional[str] = None) -> Optional[ProgramResponse]:
        """Update program information."""
        program = self.get(db, program_id)
        if not program:
            return None
        
        # Check for duplicate program code if being updated
        if program_data.program_code and program_data.program_code != program.program_code:
            existing_program = db.query(Program).filter(
                and_(
                    Program.program_code == program_data.program_code,
                    Program.id != program_id
                )
            ).first()
            
            if existing_program:
                raise ValueError(f"Program code '{program_data.program_code}' already exists")
        
        # Update program
        updated_program = self.update(db, program, program_data, updated_by)
        
        return self._to_program_response(db, updated_program)
    
    def delete_program(self, db: Session, program_id: str) -> bool:
        """Delete a program."""
        # Check if program has courses
        course_count = db.query(func.count(Course.id)).filter(
            Course.program_id == program_id
        ).scalar()
        
        if course_count > 0:
            raise ValueError(f"Cannot delete program with {course_count} courses. Delete courses first.")
        
        return self.delete(db, program_id)
    
    def list_programs(self, 
                     db: Session,
                     search_params: Optional[ProgramSearchParams] = None,
                     page: int = 1,
                     per_page: int = 20) -> Tuple[List[ProgramResponse], int]:
        """List programs with optional search and pagination."""
        query = db.query(Program)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Program.name.ilike(search_term),
                        Program.description.ilike(search_term),
                        Program.program_code.ilike(search_term),
                        Program.category.ilike(search_term)
                    )
                )
            
            if search_params.status:
                query = query.filter(Program.status == search_params.status)
            
            if search_params.category:
                query = query.filter(Program.category == search_params.category)
        
        # Apply sorting
        sort_field = getattr(Program, search_params.sort_by) if search_params and search_params.sort_by else Program.display_order
        sort_order_func = desc if search_params and search_params.sort_order == "desc" else asc
        query = query.order_by(sort_order_func(sort_field))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        programs = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        program_responses = [self._to_program_response(db, program) for program in programs]
        
        return program_responses, total_count
    
    def get_program_stats(self, db: Session) -> ProgramStatsResponse:
        """Get program statistics."""
        # Total programs
        total_programs = db.query(func.count(Program.id)).scalar()
        
        # Programs by status
        status_stats = db.query(
            Program.status,
            func.count(Program.id)
        ).group_by(Program.status).all()
        programs_by_status = dict(status_stats)
        
        # Programs by category
        category_stats = db.query(
            Program.category,
            func.count(Program.id)
        ).filter(Program.category.isnot(None)).group_by(Program.category).all()
        programs_by_category = dict(category_stats)
        
        # Average courses per program
        course_counts = db.query(
            func.count(Course.id)
        ).join(Program).scalar() or 0
        avg_courses_per_program = course_counts / total_programs if total_programs > 0 else 0
        
        # Most popular categories (top 5)
        popular_categories = db.query(
            Program.category,
            func.count(Program.id).label('count')
        ).filter(Program.category.isnot(None)).group_by(
            Program.category
        ).order_by(desc('count')).limit(5).all()
        
        most_popular_categories = [
            {"category": cat, "count": count} 
            for cat, count in popular_categories
        ]
        
        return ProgramStatsResponse(
            total_programs=total_programs,
            programs_by_status=programs_by_status,
            programs_by_category=programs_by_category,
            average_courses_per_program=avg_courses_per_program,
            most_popular_categories=most_popular_categories
        )
    
    def get_program_tree(self, db: Session, program_id: str) -> Optional[ProgramTreeResponse]:
        """Get program with full tree structure of courses and curricula."""
        program = db.query(Program).options(
            joinedload(Program.courses).joinedload(Course.curricula)
        ).filter(Program.id == program_id).first()
        
        if not program:
            return None
        
        # Build course tree with curricula
        courses = []
        for course in program.courses:
            course_data = {
                "id": course.id,
                "name": course.name,
                "status": course.status,
                "display_order": course.display_order,
                "curricula": []
            }
            
            for curriculum in course.curricula:
                curriculum_data = {
                    "id": curriculum.id,
                    "name": curriculum.name,
                    "difficulty_level": curriculum.difficulty_level,
                    "status": curriculum.status,
                    "display_order": curriculum.display_order
                }
                course_data["curricula"].append(curriculum_data)
            
            # Sort curricula by display order
            course_data["curricula"].sort(key=lambda x: x["display_order"])
            courses.append(course_data)
        
        # Sort courses by display order
        courses.sort(key=lambda x: x["display_order"])
        
        return ProgramTreeResponse(
            id=program.id,
            name=program.name,
            program_code=program.program_code,
            status=program.status,
            courses=courses
        )
    
    def bulk_update_status(self, 
                          db: Session, 
                          program_ids: List[str], 
                          new_status: str,
                          updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update program status."""
        return self.bulk_update(
            db, 
            program_ids, 
            {"status": new_status}, 
            updated_by
        )
    
    def reorder_programs(self, 
                        db: Session, 
                        program_orders: List[Dict[str, int]],
                        updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Reorder programs by updating display_order."""
        successful = []
        failed = []
        
        for order_data in program_orders:
            try:
                program_id = order_data["id"]
                new_order = order_data["sequence"]
                
                program = self.get(db, program_id)
                if program:
                    program.display_order = new_order
                    if updated_by and hasattr(program, 'updated_by'):
                        program.updated_by = updated_by
                    
                    db.add(program)
                    successful.append(program_id)
                else:
                    failed.append({"id": program_id, "error": "Program not found"})
                    
            except Exception as e:
                failed.append({"id": order_data.get("id", "unknown"), "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(program_orders),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def _to_program_response(self, db: Session, program: Program) -> ProgramResponse:
        """Convert Program model to ProgramResponse."""
        # Get course count
        course_count = db.query(func.count(Course.id)).filter(
            Course.program_id == program.id
        ).scalar() or 0
        
        # Get total curriculum count across all courses
        total_curriculum_count = db.query(func.count(Curriculum.id)).join(
            Course, Course.id == Curriculum.course_id
        ).filter(Course.program_id == program.id).scalar() or 0
        
        return ProgramResponse(
            id=program.id,
            name=program.name,
            description=program.description,
            program_code=program.program_code,
            category=program.category,
            status=program.status,
            display_order=program.display_order,
            course_count=course_count,
            total_curriculum_count=total_curriculum_count,
            created_by=program.created_by,
            updated_by=program.updated_by,
            created_at=program.created_at,
            updated_at=program.updated_at
        )


# Global instance
program_service = ProgramService()