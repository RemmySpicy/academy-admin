"""
Program service for curriculum management operations.
"""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.programs.models.program import Program
from app.features.courses.models.course import Course
from app.features.curricula.models.curriculum import Curriculum
from app.features.programs.schemas.program import (
    ProgramCreate,
    ProgramUpdate,
    ProgramResponse,
    ProgramSearchParams,
    ProgramStatsResponse,
    ProgramTreeResponse,
    AgeGroup,
    DifficultyLevel,
    SessionType,
    TeamAssignment
)
from app.features.courses.services.base_service import BaseService


class ProgramService(BaseService[Program, ProgramCreate, ProgramUpdate]):
    """Service for program operations."""
    
    def __init__(self):
        super().__init__(Program)
    
    def _get_default_configuration(self) -> Dict[str, Any]:
        """Get default configuration for new programs."""
        return {
            "age_groups": [
                {"id": "6-8", "name": "6-8 years", "from_age": 6, "to_age": 8},
                {"id": "9-12", "name": "9-12 years", "from_age": 9, "to_age": 12},
                {"id": "13-17", "name": "13-17 years", "from_age": 13, "to_age": 17},
                {"id": "18+", "name": "18+ years", "from_age": 18, "to_age": 99}
            ],
            "difficulty_levels": [
                {"id": "beginner", "name": "Beginner", "weight": 1},
                {"id": "intermediate", "name": "Intermediate", "weight": 2},
                {"id": "advanced", "name": "Advanced", "weight": 3}
            ],
            "session_types": [
                {"id": "private", "name": "Private", "capacity": 2},
                {"id": "group", "name": "Group", "capacity": 5},
                {"id": "school-group", "name": "School Group", "capacity": 50}
            ],
            "default_session_duration": 60
        }
    
    def _convert_pydantic_config_to_dict(self, program_data: ProgramCreate | ProgramUpdate) -> Dict[str, Any]:
        """Convert Pydantic configuration objects to dictionary format for database storage."""
        config_dict = {}
        
        if hasattr(program_data, 'age_groups') and program_data.age_groups is not None:
            config_dict['age_groups'] = [ag.dict() for ag in program_data.age_groups]
        
        if hasattr(program_data, 'difficulty_levels') and program_data.difficulty_levels is not None:
            config_dict['difficulty_levels'] = [dl.dict() for dl in program_data.difficulty_levels]
        
        if hasattr(program_data, 'session_types') and program_data.session_types is not None:
            config_dict['session_types'] = [st.dict() for st in program_data.session_types]
        
        if hasattr(program_data, 'default_session_duration') and program_data.default_session_duration is not None:
            config_dict['default_session_duration'] = program_data.default_session_duration
        
        return config_dict
    
    def _validate_configuration_consistency(self, program_data: ProgramCreate | ProgramUpdate) -> None:
        """Validate configuration consistency and business rules."""
        # Age groups validation
        if hasattr(program_data, 'age_groups') and program_data.age_groups:
            age_ranges = []
            for ag in program_data.age_groups:
                if ag.to_age < 99:  # Not open-ended
                    age_ranges.append((ag.from_age, ag.to_age))
            
            # Check for overlapping ranges
            for i, (start1, end1) in enumerate(age_ranges):
                for j, (start2, end2) in enumerate(age_ranges[i+1:], i+1):
                    if not (end1 < start2 or end2 < start1):
                        raise ValueError(f"Age ranges cannot overlap: {start1}-{end1} and {start2}-{end2}")
        
        # Difficulty levels validation
        if hasattr(program_data, 'difficulty_levels') and program_data.difficulty_levels:
            weights = [dl.weight for dl in program_data.difficulty_levels]
            if len(weights) != len(set(weights)):
                raise ValueError("Difficulty level weights must be unique")
        
        # Session types validation
        if hasattr(program_data, 'session_types') and program_data.session_types:
            capacities = [st.capacity for st in program_data.session_types]
            if any(cap <= 0 for cap in capacities):
                raise ValueError("Session type capacities must be positive")
    
    def apply_default_configuration(self, db: Session, program_id: str, updated_by: Optional[str] = None) -> Optional[ProgramResponse]:
        """Apply default configuration to an existing program."""
        program = self.get(db, program_id)
        if not program:
            return None
        
        default_config = self._get_default_configuration()
        
        # Only apply defaults for missing configuration
        if not program.age_groups:
            program.age_groups = default_config["age_groups"]
        if not program.difficulty_levels:
            program.difficulty_levels = default_config["difficulty_levels"]
        if not program.session_types:
            program.session_types = default_config["session_types"]
        if not program.default_session_duration:
            program.default_session_duration = default_config["default_session_duration"]
        
        if updated_by and hasattr(program, 'updated_by'):
            program.updated_by = updated_by
        
        db.add(program)
        db.commit()
        db.refresh(program)
        
        return self._to_program_response(db, program)
    
    def create_program(self, 
                      db: Session, 
                      program_data: ProgramCreate, 
                      created_by: Optional[str] = None) -> ProgramResponse:
        """Create a new program with enhanced configuration."""
        # Check for duplicate program code
        existing_program = db.query(Program).filter(
            Program.program_code == program_data.program_code
        ).first()
        
        if existing_program:
            raise ValueError(f"Program code '{program_data.program_code}' already exists")
        
        # Validate configuration consistency
        self._validate_configuration_consistency(program_data)
        
        # Apply default configuration if not provided
        if not program_data.age_groups:
            default_config = self._get_default_configuration()
            program_data.age_groups = [AgeGroup(**ag) for ag in default_config["age_groups"]]
            program_data.difficulty_levels = [DifficultyLevel(**dl) for dl in default_config["difficulty_levels"]]
            program_data.session_types = [SessionType(**st) for st in default_config["session_types"]]
            program_data.default_session_duration = default_config["default_session_duration"]
        
        # Convert Pydantic objects to dict format for storage
        config_dict = self._convert_pydantic_config_to_dict(program_data)
        
        # Create program with enhanced fields
        program_dict = program_data.dict(exclude={'team_assignments'})
        program_dict.update(config_dict)
        
        program = self.create(db, program_dict, created_by)
        
        # Handle team assignments if provided
        if program_data.team_assignments:
            self._handle_team_assignments(db, program.id, program_data.team_assignments, created_by)
        
        return self._to_program_response(db, program)
    
    def _handle_team_assignments(self, db: Session, program_id: str, team_assignments: List[TeamAssignment], assigned_by: Optional[str] = None) -> None:
        """Handle team assignments for a program."""
        from app.features.authentication.models.user import User
        from app.features.authentication.models.user_program_assignment import UserProgramAssignment
        
        for assignment in team_assignments:
            # Get the user
            user = db.query(User).filter(User.id == assignment.user_id).first()
            if not user:
                raise ValueError(f"User with ID {assignment.user_id} not found")
            
            # Add the role to the user if they don't have it
            if assignment.role not in user.roles:
                user.add_role(assignment.role)
                db.add(user)
            
            # Create or update program assignment
            existing_assignment = db.query(UserProgramAssignment).filter(
                UserProgramAssignment.user_id == assignment.user_id,
                UserProgramAssignment.program_id == program_id
            ).first()
            
            if not existing_assignment:
                # Create new assignment
                new_assignment = UserProgramAssignment(
                    user_id=assignment.user_id,
                    program_id=program_id,
                    assigned_by=assigned_by,
                    is_default=False  # Program admin can set default separately
                )
                db.add(new_assignment)
        
        # Commit the changes
        db.commit()
    
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
    
    def get_program_statistics(self, db: Session, program_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive statistics for a program."""
        from app.features.authentication.models.user_program_assignment import UserProgramAssignment
        from app.features.authentication.models.user import User
        from app.features.courses.models.course import Course
        from app.features.facilities.models.facility import Facility
        from app.features.students.models.student import Student
        
        # Verify program exists
        program = self.get(db, program_id)
        if not program:
            return None
        
        # Count courses in this program
        active_courses = db.query(Course).filter(
            Course.program_id == program_id,
            Course.status == 'active'
        ).count()
        
        total_courses = db.query(Course).filter(
            Course.program_id == program_id
        ).count()
        
        # Count team members (users assigned to this program)
        team_members = db.query(UserProgramAssignment).filter(
            UserProgramAssignment.program_id == program_id
        ).count()
        
        # Count students in this program
        total_students = db.query(Student).filter(
            Student.program_id == program_id
        ).count()
        
        active_students = db.query(Student).filter(
            Student.program_id == program_id,
            Student.status == 'active'
        ).count()
        
        # Count facilities in this program
        total_facilities = db.query(Facility).filter(
            Facility.program_id == program_id
        ).count()
        
        return {
            "program_id": program_id,
            "program_name": program.name,
            "courses": {
                "total": total_courses,
                "active": active_courses,
                "inactive": total_courses - active_courses
            },
            "students": {
                "total": total_students,
                "active": active_students,
                "inactive": total_students - active_students
            },
            "team": {
                "total_members": team_members
            },
            "facilities": {
                "total": total_facilities
            },
            "configuration": {
                "age_groups": len(program.age_groups) if program.age_groups else 0,
                "difficulty_levels": len(program.difficulty_levels) if program.difficulty_levels else 0,
                "session_types": len(program.session_types) if program.session_types else 0,
                "default_duration": program.default_session_duration or 0
            }
        }
    
    def update_program(self, 
                      db: Session, 
                      program_id: str, 
                      program_data: ProgramUpdate,
                      updated_by: Optional[str] = None) -> Optional[ProgramResponse]:
        """Update program information with enhanced configuration."""
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
        
        # Validate configuration consistency if provided
        self._validate_configuration_consistency(program_data)
        
        # Convert Pydantic objects to dict format for storage
        config_dict = self._convert_pydantic_config_to_dict(program_data)
        
        # Prepare update data
        update_dict = program_data.dict(exclude={'team_assignments'}, exclude_unset=True)
        update_dict.update(config_dict)
        
        # Update program
        updated_program = self.update(db, program, update_dict, updated_by)
        
        # Handle team assignments if provided
        if program_data.team_assignments is not None:
            self._handle_team_assignments(db, program_id, program_data.team_assignments, updated_by)
        
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
        
        # Convert configuration data to Pydantic objects
        age_groups = None
        if program.age_groups:
            age_groups = [AgeGroup(**ag) for ag in program.age_groups]
        
        difficulty_levels = None
        if program.difficulty_levels:
            difficulty_levels = [DifficultyLevel(**dl) for dl in program.difficulty_levels]
        
        session_types = None
        if program.session_types:
            session_types = [SessionType(**st) for st in program.session_types]
        
        return ProgramResponse(
            id=program.id,
            name=program.name,
            description=program.description,
            program_code=program.program_code,
            category=program.category,
            status=program.status,
            display_order=program.display_order,
            age_groups=age_groups,
            difficulty_levels=difficulty_levels,
            session_types=session_types,
            default_session_duration=program.default_session_duration,
            course_count=course_count,
            total_curriculum_count=total_curriculum_count,
            has_configuration=program.has_configuration,
            created_by=program.created_by,
            updated_by=program.updated_by,
            created_at=program.created_at,
            updated_at=program.updated_at
        )


# Global instance
program_service = ProgramService()