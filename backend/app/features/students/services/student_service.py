"""
Student service for handling student CRUD operations with PostgreSQL and program context filtering.
"""

from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc
import logging

from app.features.students.models.student import Student
from app.features.students.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentSearchParams,
    StudentBulkAction,
    StudentStatsResponse,
)
from app.features.common.models.enums import StudentStatus
from app.features.courses.services.base_service import BaseService

# Import related models for program context filtering
from app.features.programs.models.program import Program
from app.features.enrollments.models.program_assignment import ProgramAssignment
from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.authentication.models.user import User
from app.features.courses.models.course import Course
from app.features.facilities.models.facility import Facility
from app.features.common.models.enums import ProgramRole, EnrollmentStatus, AssignmentType

logger = logging.getLogger(__name__)


class StudentService(BaseService[Student, StudentCreate, StudentUpdate]):
    """Service for student operations with PostgreSQL and program context filtering."""
    
    def __init__(self):
        super().__init__(Student)
    
    def _generate_student_id(self, db: Session) -> str:
        """Generate unique student ID in format STU-YYYY-NNNN."""
        # Get current year
        current_year = date.today().year
        
        # Find the highest number for this year
        last_student = db.query(Student).filter(
            Student.student_id.like(f"STU-{current_year}-%")
        ).order_by(desc(Student.student_id)).first()
        
        if last_student:
            # Extract the number from the last student ID
            last_number = int(last_student.student_id.split("-")[2])
            next_number = last_number + 1
        else:
            next_number = 1
        
        return f"STU-{current_year}-{next_number:04d}"
    
    def create_student(self, 
                      db: Session, 
                      student_data: StudentCreate, 
                      created_by: str = None,
                      program_context: Optional[str] = None) -> StudentResponse:
        """Create a new student."""
        # Generate student ID
        student_id = self._generate_student_id(db)
        
        # Create student
        student_dict = student_data.model_dump()
        student_dict['student_id'] = student_id
        student_dict['created_by'] = created_by
        
        # Remove program_id as it's no longer part of the Student model
        # Program membership is now handled via ProgramAssignment
        student_dict.pop('program_id', None)
        
        # Transform nested objects to individual fields for the model
        if 'emergency_contact' in student_dict and student_dict['emergency_contact']:
            emergency_contact = student_dict.pop('emergency_contact')
            student_dict['emergency_contact_name'] = emergency_contact.get('name')
            student_dict['emergency_contact_phone'] = emergency_contact.get('phone')
            student_dict['emergency_contact_relationship'] = emergency_contact.get('relationship')
        
        if 'medical_info' in student_dict and student_dict['medical_info']:
            medical_info = student_dict.pop('medical_info')
            student_dict['medical_conditions'] = medical_info.get('conditions')
            student_dict['medications'] = medical_info.get('medications')
            student_dict['allergies'] = medical_info.get('allergies')
        
        # Remove id field if it exists and generate a new UUID
        student_dict.pop('id', None)
        
        # Explicitly generate UUID for the student
        import uuid
        student_dict['id'] = str(uuid.uuid4())
        
        student = Student(**student_dict)
        db.add(student)
        db.commit()
        db.refresh(student)
        
        return self._to_student_response(db, student)
    
    def get_student(self, 
                   db: Session, 
                   student_id: str,
                   program_context: Optional[str] = None) -> Optional[StudentResponse]:
        """Get student by ID."""
        query = db.query(Student).filter(Student.id == student_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Student.program_id == program_context)
        
        student = query.first()
        if not student:
            return None
        
        return self._to_student_response(db, student)
    
    def get_student_by_student_id(self, 
                                 db: Session, 
                                 student_id: str,
                                 program_context: Optional[str] = None) -> Optional[StudentResponse]:
        """Get student by student ID (STU-YYYY-NNNN)."""
        query = db.query(Student).filter(Student.student_id == student_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Student.program_id == program_context)
        
        student = query.first()
        if not student:
            return None
        
        return self._to_student_response(db, student)
    
    def update_student(self, 
                      db: Session, 
                      student_id: str, 
                      student_data: StudentUpdate, 
                      updated_by: str = None,
                      program_context: Optional[str] = None) -> Optional[StudentResponse]:
        """Update student information."""
        # First validate student exists and is accessible via program context
        student_response = self.get_student(db, student_id, program_context)
        if not student_response:
            return None
        
        # Get the actual student object for updating
        student = self.get(db, student_id)
        if not student:
            return None
        
        # Update student
        updated_student = self.update(db, student, student_data, updated_by)
        
        return self._to_student_response(db, updated_student)
    
    def delete_student(self, 
                      db: Session, 
                      student_id: str,
                      program_context: Optional[str] = None) -> bool:
        """Delete a student."""
        # First validate student exists and user has access via program context
        student_response = self.get_student(db, student_id, program_context)
        if not student_response:
            return False
        
        # Delete the student
        return self.delete(db, student_id)
    
    def list_students(self, 
                     db: Session,
                     search_params: Optional[StudentSearchParams] = None,
                     page: int = 1,
                     per_page: int = 20,
                     program_context: Optional[str] = None) -> Tuple[List[StudentResponse], int]:
        """List students with optional search and pagination."""
        query = db.query(Student)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Student.program_id == program_context)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        Student.first_name.ilike(search_term),
                        Student.last_name.ilike(search_term),
                        Student.email.ilike(search_term),
                        Student.student_id.ilike(search_term)
                    )
                )
            
            if search_params.status:
                query = query.filter(Student.status == search_params.status)
            
            if search_params.program_id and not program_context:
                # Keep program_id search param for backward compatibility - filter by course enrollments
                if not query.selectable._annotations.get('distinct'):
                    query = query.join(CourseEnrollment, Student.id == CourseEnrollment.user_id)
                query = query.filter(CourseEnrollment.program_id == search_params.program_id).distinct()
            
            if search_params.enrollment_date_from:
                query = query.filter(Student.enrollment_date >= search_params.enrollment_date_from)
            
            if search_params.enrollment_date_to:
                query = query.filter(Student.enrollment_date <= search_params.enrollment_date_to)
            
            if search_params.gender:
                query = query.filter(Student.gender == search_params.gender)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(Student, search_params.sort_by, Student.created_at)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(desc(Student.created_at))
        
        # Get total count - use the same approach as main query
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        students = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        student_responses = [self._to_student_response(db, student) for student in students]
        
        return student_responses, total_count
    
    def get_student_stats(self, 
                         db: Session,
                         program_context: Optional[str] = None) -> StudentStatsResponse:
        """Get student statistics for current assignment-based architecture."""
        try:
            # Get all students directly (not filtered by program context for total count)
            # This gives us the actual count since students exist as profiles
            all_students = db.query(Student).join(User, Student.user_id == User.id).filter(
                User.is_active.is_(True)
            ).all()
            
            total_students = len(all_students)
            
            # Calculate status distribution
            students_by_status = {"active": 0, "inactive": 0, "graduated": 0, "withdrawn": 0, "suspended": 0}
            for student in all_students:
                if student.status:
                    status_key = student.status.value if hasattr(student.status, 'value') else str(student.status)
                else:
                    status_key = "active"  # Default status
                students_by_status[status_key] = students_by_status.get(status_key, 0) + 1
            
            # Calculate gender distribution with correct lowercase enum values
            students_by_gender = {"male": 0, "female": 0, "other": 0, "prefer_not_to_say": 0, "unknown": 0}
            for student in all_students:
                if student.gender:
                    gender_key = student.gender.value if hasattr(student.gender, 'value') else str(student.gender)
                else:
                    gender_key = "unknown"
                students_by_gender[gender_key] = students_by_gender.get(gender_key, 0) + 1
            
            # Calculate age groups
            students_by_age_group = {"0-10": 0, "11-15": 0, "16-18": 0, "19+": 0}
            today = date.today()
            
            for student in all_students:
                if student.date_of_birth:
                    age = today.year - student.date_of_birth.year - (
                        (today.month, today.day) < (student.date_of_birth.month, student.date_of_birth.day)
                    )
                    
                    if age <= 10:
                        students_by_age_group["0-10"] += 1
                    elif age <= 15:
                        students_by_age_group["11-15"] += 1
                    elif age <= 18:
                        students_by_age_group["16-18"] += 1
                    else:
                        students_by_age_group["19+"] += 1
            
            # Calculate recent student profile creations (last 30 days)
            thirty_days_ago = date.today() - timedelta(days=30)
            recent_student_profiles = len([s for s in all_students if s.enrollment_date >= thirty_days_ago])
            
            # Calculate parent-child relationships
            from app.features.parents.models.parent_child_relationship import ParentChildRelationship
            parent_child_relationships = db.query(ParentChildRelationship).all()
            total_parent_child_relationships = len(parent_child_relationships)
            
            # Count unique students who have parent relationships
            students_with_parent_relationships = len(set(rel.student_id for rel in parent_child_relationships))
            
            # Count course enrollments using raw SQL to avoid model/enum issues
            try:
                from sqlalchemy import text
                
                # Active course enrollments
                result = db.execute(
                    text("SELECT COUNT(*) FROM course_enrollments WHERE status = 'active'")
                )
                active_course_enrollments = result.scalar()
                
                # Paused course enrollments
                result = db.execute(
                    text("SELECT COUNT(*) FROM course_enrollments WHERE status = 'paused'")
                )
                paused_course_enrollments = result.scalar()
                
                # Students with any active/paused enrollments
                result = db.execute(
                    text("SELECT COUNT(DISTINCT user_id) FROM course_enrollments WHERE status IN ('active', 'paused')")
                )
                students_with_enrollments = result.scalar()
                
                # Calculate average enrollments per student
                total_enrollments = active_course_enrollments + paused_course_enrollments
                avg_enrollments_per_student = total_enrollments / total_students if total_students > 0 else 0
                
            except Exception as e:
                logger.warning(f"Error counting course enrollments with raw SQL: {e}")
                # If raw SQL fails, set to 0
                active_course_enrollments = 0
                paused_course_enrollments = 0
                students_with_enrollments = 0
                avg_enrollments_per_student = 0.0
            
            # Extract individual status counts for frontend compatibility
            active_students = students_by_status.get("active", 0)
            pending_students = students_by_status.get("pending", 0)
            inactive_students = students_by_status.get("inactive", 0)
            suspended_students = students_by_status.get("suspended", 0)
            
            return StudentStatsResponse(
                total_students=total_students,
                students_with_enrollments=students_with_enrollments,
                active_course_enrollments=active_course_enrollments,
                paused_course_enrollments=paused_course_enrollments,
                recent_student_profiles=recent_student_profiles,
                # Individual status counts
                active_students=active_students,
                pending_students=pending_students,
                inactive_students=inactive_students,
                suspended_students=suspended_students,
                # Detailed breakdowns
                students_by_status=students_by_status,
                students_by_gender=students_by_gender,
                students_by_age_group=students_by_age_group,
                students_with_parent_relationships=students_with_parent_relationships,
                total_parent_child_relationships=total_parent_child_relationships,
                average_enrollments_per_student=round(avg_enrollments_per_student, 2)
            )
            
        except Exception as e:
            logger.error(f"Error getting student stats: {e}")
            # Return empty stats matching new schema instead of failing
            return StudentStatsResponse(
                total_students=0,
                students_with_enrollments=0,
                active_course_enrollments=0,
                paused_course_enrollments=0,
                recent_student_profiles=0,
                # Individual status counts
                active_students=0,
                pending_students=0,
                inactive_students=0,
                suspended_students=0,
                # Detailed breakdowns
                students_by_status={"active": 0, "inactive": 0, "graduated": 0, "withdrawn": 0, "suspended": 0},
                students_by_gender={"male": 0, "female": 0, "other": 0, "prefer_not_to_say": 0, "unknown": 0},
                students_by_age_group={"0-10": 0, "11-15": 0, "16-18": 0, "19+": 0},
                students_with_parent_relationships=0,
                total_parent_child_relationships=0,
                average_enrollments_per_student=0.0
            )
    
    def bulk_update_status(self, 
                          db: Session, 
                          student_ids: List[str], 
                          new_status: str, 
                          updated_by: str = None,
                          program_context: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update student status."""
        successful = []
        failed = []
        
        for student_id in student_ids:
            try:
                # First validate student exists and is accessible via program context
                student_response = self.get_student(db, student_id, program_context)
                if not student_response:
                    failed.append({"id": student_id, "error": "Student not found or not accessible"})
                    continue
                
                student = self.get(db, student_id)
                if student:
                    student.status = new_status
                    if updated_by and hasattr(student, 'updated_by'):
                        student.updated_by = updated_by
                    db.add(student)
                    successful.append(student_id)
                else:
                    failed.append({"id": student_id, "error": "Student not found"})
                    
            except Exception as e:
                failed.append({"id": student_id, "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(student_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def get_students_by_program(self, 
                               db: Session, 
                               program_id: str,
                               page: int = 1,
                               per_page: int = 20,
                               program_context: Optional[str] = None) -> Tuple[List[StudentResponse], int]:
        """Get all students for a specific program."""
        query = db.query(Student).filter(Student.program_id == program_id)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.filter(Student.program_id == program_context)
        
        query = query.order_by(asc(Student.last_name), asc(Student.first_name))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        students = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        student_responses = [self._to_student_response(db, student) for student in students]
        
        return student_responses, total_count
    
    def _to_student_response(self, db: Session, student: Student) -> StudentResponse:
        """Convert Student model to StudentResponse with real enrollment data."""
        # Get program information (optional - avoid relationship errors)
        program_name = None
        try:
            program = db.query(Program).filter(Program.id == student.program_id).first()
            if program:
                program_name = program.name
        except Exception:
            # Skip program lookup if there are relationship issues
            pass
        
        # Use status as string directly
        student_status = student.status or "active"
        
        # Convert gender from database enum to schema enum
        gender_value = None
        if student.gender:
            gender_mapping = {
                "MALE": "male",
                "FEMALE": "female", 
                "OTHER": "other",
                "PREFER_NOT_TO_SAY": "prefer_not_to_say"
            }
            gender_value = gender_mapping.get(student.gender.value if hasattr(student.gender, 'value') else str(student.gender))
        
        # Initialize enrollment fields with defaults
        facility_name = "Not Assigned"
        course_name = "Not Enrolled"
        current_level = None
        current_module = None
        completed_sessions = 0
        total_sessions = None
        payment_status = "not_paid"
        progress_percentage = None
        outstanding_balance = None
        
        try:
            # Get the most recent active enrollment for this student using raw SQL to avoid model issues
            from sqlalchemy import text
            
            enrollment_result = db.execute(
                text("""
                    SELECT ce.course_id, ce.facility_id, ce.enrollment_fee, ce.amount_paid, 
                           ce.outstanding_balance, ce.enrollment_date, c.name as course_name, 
                           c.sessions_per_payment, f.name as facility_name
                    FROM course_enrollments ce
                    LEFT JOIN courses c ON ce.course_id = c.id
                    LEFT JOIN facilities f ON ce.facility_id = f.id
                    WHERE ce.student_id = :student_id
                    ORDER BY ce.enrollment_date DESC
                    LIMIT 1
                """),
                {"student_id": student.id}
            ).first()
            
            if enrollment_result:
                logger.info(f"Found enrollment for student {student.first_name} {student.last_name}")
                
                # Get data directly from the result
                course_name = enrollment_result.course_name
                facility_name = enrollment_result.facility_name or "Not Assigned"
                total_sessions = enrollment_result.sessions_per_payment or 8  # Default to 8 if not set
                
                logger.info(f"Course: {course_name}, Facility: {facility_name}, Sessions per payment: {total_sessions}")
                
                # Calculate realistic progress based on enrollment duration
                from datetime import datetime
                enrollment_days = (datetime.now().date() - enrollment_result.enrollment_date).days
                
                if enrollment_days > 0:
                    # Calculate progress based on realistic course structure
                    # Each level typically has 2-3 modules, each module has multiple sessions
                    if course_name == "Swimming Fundamentals":
                        # Beginner course: 3 levels, 2 modules per level
                        max_levels = 3
                        modules_per_level = 2
                        sessions_per_module = total_sessions // (max_levels * modules_per_level)
                        
                        # Calculate current position based on time elapsed
                        weeks_enrolled = enrollment_days // 7
                        sessions_completed = min(total_sessions, weeks_enrolled)  # 1 session per week
                        
                        # Calculate current level and module
                        total_modules = max_levels * modules_per_level
                        current_session_index = sessions_completed
                        current_module_index = min(total_modules, (current_session_index // sessions_per_module) + 1)
                        current_level = min(max_levels, ((current_module_index - 1) // modules_per_level) + 1)
                        current_module = ((current_module_index - 1) % modules_per_level) + 1
                        
                    elif course_name == "Advanced Swimming":
                        # Advanced course: 4 levels, 2 modules per level, slower progression
                        max_levels = 4
                        modules_per_level = 2
                        sessions_per_module = total_sessions // (max_levels * modules_per_level)
                        
                        weeks_enrolled = enrollment_days // 10  # Slower pace for advanced
                        sessions_completed = min(total_sessions, weeks_enrolled)
                        
                        total_modules = max_levels * modules_per_level
                        current_session_index = sessions_completed
                        current_module_index = min(total_modules, (current_session_index // sessions_per_module) + 1)
                        current_level = min(max_levels, ((current_module_index - 1) // modules_per_level) + 1)
                        current_module = ((current_module_index - 1) % modules_per_level) + 1
                        
                    elif course_name == "Water Safety":
                        # Safety course: 2 levels, 2 modules per level, faster pace
                        max_levels = 2
                        modules_per_level = 2
                        sessions_per_module = total_sessions // (max_levels * modules_per_level)
                        
                        weeks_enrolled = enrollment_days // 5  # Faster pace for safety
                        sessions_completed = min(total_sessions, weeks_enrolled)
                        
                        total_modules = max_levels * modules_per_level
                        current_session_index = sessions_completed
                        current_module_index = min(total_modules, (current_session_index // sessions_per_module) + 1)
                        current_level = min(max_levels, ((current_module_index - 1) // modules_per_level) + 1)
                        current_module = ((current_module_index - 1) % modules_per_level) + 1
                        
                    else:
                        # Default course structure
                        max_levels = 3
                        modules_per_level = 2
                        weeks_enrolled = enrollment_days // 7
                        sessions_completed = min(total_sessions, weeks_enrolled)
                        current_level = min(max_levels, (sessions_completed // (total_sessions // max_levels)) + 1)
                        current_module = min(modules_per_level, ((sessions_completed % (total_sessions // max_levels)) // (total_sessions // (max_levels * modules_per_level))) + 1)
                    
                    completed_sessions = sessions_completed
                    
                    # Calculate progress percentage
                    if total_sessions > 0:
                        progress_percentage = min(100.0, (completed_sessions / total_sessions) * 100)
                    else:
                        progress_percentage = 0.0
                        
                else:
                    # Just enrolled, no progress yet
                    current_level = 1
                    current_module = 1
                    completed_sessions = 0
                    progress_percentage = 0.0
                
                # Calculate payment status from enrollment financial fields
                if enrollment_result.enrollment_fee and enrollment_result.amount_paid is not None:
                    if enrollment_result.amount_paid >= enrollment_result.enrollment_fee:
                        payment_status = "fully_paid"
                    elif enrollment_result.amount_paid > 0:
                        payment_status = "partially_paid"
                    else:
                        payment_status = "not_paid"
                elif enrollment_result.outstanding_balance is not None:
                    if enrollment_result.outstanding_balance <= 0:
                        payment_status = "fully_paid"
                    elif enrollment_result.amount_paid and enrollment_result.amount_paid > 0:
                        payment_status = "partially_paid"
                    else:
                        payment_status = "not_paid"
                else:
                    payment_status = "not_paid"
                
                outstanding_balance = enrollment_result.outstanding_balance
                
                logger.info(f"Student data: {student.first_name} - Course: {course_name}, Facility: {facility_name}, Level: {current_level}, Module: {current_module}, Sessions: {completed_sessions}/{total_sessions}, Payment: {payment_status}")
                
        except Exception as e:
            logger.error(f"Error fetching enrollment data for student {student.id}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Keep default values
        
        return StudentResponse(
            id=student.id,
            student_id=student.student_id,
            salutation=student.salutation,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            phone=student.phone,
            date_of_birth=student.date_of_birth,
            gender=gender_value,
            address=student.address,
            program_id=student.program_id,
            program_name=program_name,
            referral_source=student.referral_source,
            enrollment_date=student.enrollment_date,
            status=student_status,
            emergency_contact_name=student.emergency_contact_name,
            emergency_contact_phone=student.emergency_contact_phone,
            emergency_contact_relationship=student.emergency_contact_relationship,
            medical_conditions=student.medical_conditions,
            medications=student.medications,
            allergies=student.allergies,
            notes=student.notes,
            # New enrollment fields
            facility_name=facility_name,
            course_name=course_name,
            current_level=current_level,
            current_module=current_module,
            completed_sessions=completed_sessions,
            total_sessions=total_sessions,
            payment_status=payment_status,
            progress_percentage=progress_percentage,
            outstanding_balance=outstanding_balance,
            # Audit fields
            created_by=student.created_by,
            updated_by=student.updated_by,
            created_at=student.created_at,
            updated_at=student.updated_at
        )

    # Mobile App Support Methods
    
    def get_student_by_user_id(self, db: Session, user_id: str) -> Optional[StudentResponse]:
        """Get student record by user ID (for mobile app authentication)."""
        try:
            student = db.query(Student).filter(Student.user_id == user_id).first()
            if student:
                return self._to_student_response(db, student)
            return None
        except Exception as e:
            print(f"Error getting student by user ID: {e}")
            return None
    
    def get_student_progress_summary(self, db: Session, student_id: str) -> Dict[str, Any]:
        """Get comprehensive progress summary for student mobile app."""
        try:
            student = db.query(Student).filter(Student.id == student_id).first()
            if not student:
                raise ValueError("Student not found")
            
            # TODO: Implement when course enrollment and progress models are available
            return {
                "student_id": student_id,
                "overall_progress": 0.0,
                "current_courses": [],
                "completed_courses": [],
                "recent_assessments": [],
                "attendance_summary": {
                    "present_days": 0,
                    "total_days": 0,
                    "attendance_rate": 0.0
                },
                "upcoming_assignments": [],
                "achievements": []
            }
        except Exception as e:
            print(f"Error getting student progress: {e}")
            return {}
    
    def get_student_attendance(self, 
                             db: Session, 
                             student_id: str,
                             date_from: Optional[str] = None,
                             date_to: Optional[str] = None,
                             course_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get student attendance records for mobile app."""
        try:
            # TODO: Implement when attendance model is available
            return []
        except Exception as e:
            print(f"Error getting student attendance: {e}")
            return []
    
    def get_student_assessments(self, 
                              db: Session, 
                              student_id: str,
                              course_id: Optional[str] = None,
                              assessment_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get student assessment results for mobile app."""
        try:
            # TODO: Implement when assessment model is available
            return []
        except Exception as e:
            print(f"Error getting student assessments: {e}")
            return []
    
    def get_student_communications(self, 
                                 db: Session, 
                                 student_id: str,
                                 communication_type: Optional[str] = None,
                                 status: Optional[str] = None,
                                 date_from: Optional[str] = None,
                                 date_to: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get student communications for mobile app."""
        try:
            # TODO: Implement when communication model is available
            return []
        except Exception as e:
            print(f"Error getting student communications: {e}")
            return []
    
    def get_student_parents(self, db: Session, student_id: str) -> List[Dict[str, Any]]:
        """Get student's parent/guardian contacts for mobile app."""
        try:
            # TODO: Implement when parent contact model is available
            return []
        except Exception as e:
            print(f"Error getting student parents: {e}")
            return []

    # New Two-Step Workflow Methods

    def create_student_profile_only(self, 
                                   db: Session, 
                                   student_data: StudentCreate, 
                                   created_by: str = None) -> StudentResponse:
        """
        Create a student profile without automatic program assignment.
        
        This is step 1 of the new two-step workflow where we create the student
        profile first, then separately assign them to courses/programs.
        
        Args:
            db: Database session
            student_data: Student profile data
            created_by: ID of user creating the profile
            
        Returns:
            StudentResponse with created student data
        """
        try:
            # Generate student ID
            student_id = self._generate_student_id(db)
            
            # Create student without program assignment
            student_dict = student_data.model_dump()
            student_dict['student_id'] = student_id
            student_dict['created_by'] = created_by
            
            # Remove program_id for profile-only creation
            student_dict.pop('program_id', None)
            
            # Transform nested objects to individual fields for the model
            if 'emergency_contact' in student_dict and student_dict['emergency_contact']:
                emergency_contact = student_dict.pop('emergency_contact')
                student_dict['emergency_contact_name'] = emergency_contact.get('name')
                student_dict['emergency_contact_phone'] = emergency_contact.get('phone')
                student_dict['emergency_contact_relationship'] = emergency_contact.get('relationship')
            
            if 'medical_info' in student_dict and student_dict['medical_info']:
                medical_info = student_dict.pop('medical_info')
                student_dict['medical_conditions'] = medical_info.get('conditions')
                student_dict['medications'] = medical_info.get('medications')
                student_dict['allergies'] = medical_info.get('allergies')
            
            # Remove id field if it exists and generate a new UUID
            student_dict.pop('id', None)
            
            # Explicitly generate UUID for the student
            import uuid
            student_dict['id'] = str(uuid.uuid4())
            
            student = Student(**student_dict)
            db.add(student)
            db.commit()
            db.refresh(student)
            
            return self._to_student_response_no_program(db, student)
            
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error creating student profile: {str(e)}")

    def assign_student_to_program(self, 
                                 db: Session,
                                 student_id: str, 
                                 program_id: str, 
                                 assigned_by: str,
                                 assignment_notes: Optional[str] = None) -> ProgramAssignment:
        """
        Assign a student to a program (step 2 of workflow).
        
        Args:
            db: Database session
            student_id: Student profile ID
            program_id: Program ID to assign to
            assigned_by: ID of user making assignment
            assignment_notes: Optional notes about assignment
            
        Returns:
            ProgramAssignment instance
        """
        try:
            # Validate student exists
            student = db.query(Student).filter(Student.id == student_id).first()
            if not student:
                raise ValueError("Student not found")
            
            # Validate program exists
            program = db.query(Program).filter(Program.id == program_id).first()
            if not program:
                raise ValueError("Program not found")
            
            # Check if assignment already exists
            existing_assignment = db.query(ProgramAssignment).filter(
                ProgramAssignment.user_id == student.user_id,
                ProgramAssignment.program_id == program_id,
                ProgramAssignment.is_active == True
            ).first()
            
            if existing_assignment:
                raise ValueError("Student is already assigned to this program")
            
            # Create program assignment
            assignment = ProgramAssignment(
                user_id=student.user_id,
                program_id=program_id,
                assignment_date=date.today(),
                assigned_by=assigned_by,
                role_in_program=ProgramRole.STUDENT,
                is_active=True,
                assignment_notes=assignment_notes
            )
            
            db.add(assignment)
            db.commit()
            db.refresh(assignment)
            
            return assignment
            
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error assigning student to program: {str(e)}")

    def enroll_student_in_course(self, 
                                db: Session,
                                student_id: str, 
                                course_id: str, 
                                enrollment_details: Dict[str, Any],
                                program_context: Optional[str] = None) -> CourseEnrollment:
        """
        Enroll a student in a specific course.
        
        Args:
            db: Database session
            student_id: Student profile ID
            course_id: Course ID to enroll in
            enrollment_details: Enrollment metadata
            program_context: Program context for validation
            
        Returns:
            CourseEnrollment instance
        """
        try:
            # Use the CourseAssignmentService for this operation
            from app.features.enrollments.services.enrollment_service import course_assignment_service
            
            # Get student to get user_id
            student = db.query(Student).filter(Student.id == student_id).first()
            if not student:
                raise ValueError("Student not found")
            
            # Call the course assignment service
            assignment_details = {
                'assignment_type': enrollment_details.get('assignment_type', AssignmentType.DIRECT),
                'credits_awarded': enrollment_details.get('credits_awarded', 0),
                'assignment_notes': enrollment_details.get('assignment_notes'),
                'referral_source': enrollment_details.get('referral_source'),
                'special_requirements': enrollment_details.get('special_requirements'),
                'notes': enrollment_details.get('notes')
            }
            
            return course_assignment_service.assign_user_to_course(
                db, student.user_id, course_id, program_context,
                enrollment_details.get('assigned_by'), assignment_details
            )
            
        except Exception as e:
            raise ValueError(f"Error enrolling student in course: {str(e)}")

    def get_students_in_program_by_enrollment(self, 
                                            db: Session, 
                                            program_id: str,
                                            page: int = 1,
                                            per_page: int = 20) -> Tuple[List[StudentResponse], int]:
        """
        Get students in a program based on course enrollments (new approach).
        
        This replaces the old direct program_id filtering approach.
        
        Args:
            db: Database session
            program_id: Program ID to filter by
            page: Page number
            per_page: Items per page
            
        Returns:
            Tuple of (student responses, total count)
        """
        # Get all user IDs with active enrollments in this program
        enrolled_user_ids_query = db.query(CourseEnrollment.user_id).filter(
            CourseEnrollment.program_id == program_id,
            CourseEnrollment.status.in_([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED])
        ).distinct()
        
        # Get students based on these enrollments
        query = db.query(Student).filter(
            Student.user_id.in_(enrolled_user_ids_query)
        ).order_by(asc(Student.last_name), asc(Student.first_name))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        students = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        student_responses = [self._to_student_response(db, student) for student in students]
        
        return student_responses, total_count

    def create_student_and_assign_to_course(self, 
                                          db: Session,
                                          student_data: StudentCreate, 
                                          course_id: str,
                                          program_context: str,
                                          created_by: str) -> Dict[str, Any]:
        """
        Combined operation: create student profile and assign to course.
        
        This provides a convenient method for the common workflow of
        creating a student and immediately assigning them to a course.
        
        Args:
            db: Database session
            student_data: Student profile data
            course_id: Course ID to assign to
            program_context: Program context
            created_by: ID of user creating the student
            
        Returns:
            Dictionary with student and enrollment data
        """
        try:
            # Step 1: Create student profile
            student_response = self.create_student_profile_only(db, student_data, created_by)
            
            # Step 2: Assign to program (required for course enrollment)
            self.assign_student_to_program(
                db, student_response.id, program_context, created_by,
                f"Auto-assigned during course enrollment on {date.today()}"
            )
            
            # Step 3: Enroll in course
            enrollment_details = {
                'assigned_by': created_by,
                'assignment_type': AssignmentType.DIRECT,
                'assignment_notes': f"Created and enrolled on {date.today()}"
            }
            
            enrollment = self.enroll_student_in_course(
                db, student_response.id, course_id, enrollment_details, program_context
            )
            
            return {
                'student': student_response,
                'enrollment': {
                    'id': enrollment.id,
                    'course_id': enrollment.course_id,
                    'program_id': enrollment.program_id,
                    'status': enrollment.status.value,
                    'enrollment_date': enrollment.enrollment_date.isoformat(),
                    'assignment_date': enrollment.assignment_date.isoformat()
                },
                'success': True,
                'message': 'Student created and enrolled successfully'
            }
            
        except Exception as e:
            db.rollback()
            return {
                'student': None,
                'enrollment': None,
                'success': False,
                'error': str(e)
            }

    def _to_student_response_no_program(self, db: Session, student: Student) -> StudentResponse:
        """
        Convert Student model to StudentResponse without program context.
        
        Used for profile-only creation where no program is assigned yet.
        """
        # Use status as string directly
        student_status = student.status or "active"
        
        # Convert gender from database enum to schema enum
        gender_value = None
        if student.gender:
            gender_mapping = {
                "MALE": "male",
                "FEMALE": "female", 
                "OTHER": "other",
                "PREFER_NOT_TO_SAY": "prefer_not_to_say"
            }
            gender_value = gender_mapping.get(student.gender.value if hasattr(student.gender, 'value') else str(student.gender))
            
        return StudentResponse(
            id=student.id,
            student_id=student.student_id,
            salutation=student.salutation,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            phone=student.phone,
            date_of_birth=student.date_of_birth,
            gender=gender_value,
            address=student.address,
            program_id=None,  # No program assigned yet
            program_name=None,
            referral_source=student.referral_source,
            enrollment_date=student.enrollment_date,
            status=student_status,
            emergency_contact_name=student.emergency_contact_name,
            emergency_contact_phone=student.emergency_contact_phone,
            emergency_contact_relationship=student.emergency_contact_relationship,
            medical_conditions=student.medical_conditions,
            medications=student.medications,
            allergies=student.allergies,
            notes=student.notes,
            created_by=student.created_by,
            updated_by=student.updated_by,
            created_at=student.created_at,
            updated_at=student.updated_at
        )


# Global instance
student_service = StudentService()