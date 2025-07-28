"""
Student service for handling student CRUD operations with PostgreSQL and program context filtering.
"""

from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc

from app.features.students.models.student import Student
from app.features.students.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentSearchParams,
    StudentBulkAction,
    StudentStatsResponse,
)
from app.features.courses.services.base_service import BaseService

# Import related models for program context filtering
from app.features.programs.models.program import Program
from app.features.students.models.program_assignment import ProgramAssignment
from app.features.students.models.course_enrollment import CourseEnrollment
from app.features.authentication.models.user import User
from app.features.common.models.enums import ProgramRole, EnrollmentStatus, AssignmentType


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
        # Verify program exists and is accessible within program context
        program_query = db.query(Program).filter(Program.id == student_data.program_id)
        if program_context:
            program_query = program_query.filter(Program.id == program_context)
        
        program = program_query.first()
        if not program:
            if program_context:
                raise ValueError(f"Program with ID '{student_data.program_id}' not found or not accessible in current program context")
            else:
                raise ValueError(f"Program with ID '{student_data.program_id}' not found")
        
        # Generate student ID
        student_id = self._generate_student_id(db)
        
        # Create student
        student_dict = student_data.model_dump()
        student_dict['student_id'] = student_id
        student_dict['created_by'] = created_by
        
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
                # Keep program_id search param for backward compatibility but program_context takes precedence
                query = query.filter(Student.program_id == search_params.program_id)
            
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
        
        # Get total count
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
        """Get student statistics."""
        # Base query for students
        base_query = db.query(Student)
        
        # Apply program context filtering if provided
        if program_context:
            base_query = base_query.filter(Student.program_id == program_context)
        
        # Total students
        total_students = base_query.count()
        
        # Students by status
        status_stats = base_query.with_entities(
            Student.status,
            func.count(Student.id)
        ).group_by(Student.status).all()
        status_counts = {str(status): count for status, count in status_stats}
        
        # Students by gender
        gender_stats = base_query.with_entities(
            Student.gender,
            func.count(Student.id)
        ).filter(Student.gender.isnot(None)).group_by(Student.gender).all()
        gender_counts = {str(gender): count for gender, count in gender_stats}
        
        # Recent enrollments (last 30 days)
        thirty_days_ago = date.today() - timedelta(days=30)
        recent_enrollments = base_query.filter(
            Student.enrollment_date >= thirty_days_ago
        ).count()
        
        # Students by age group
        students_with_dob = base_query.filter(Student.date_of_birth.isnot(None)).all()
        
        age_groups = {"0-10": 0, "11-15": 0, "16-18": 0, "19+": 0}
        today = date.today()
        
        for student in students_with_dob:
            age = today.year - student.date_of_birth.year - (
                (today.month, today.day) < (student.date_of_birth.month, student.date_of_birth.day)
            )
            
            if age <= 10:
                age_groups["0-10"] += 1
            elif age <= 15:
                age_groups["11-15"] += 1
            elif age <= 18:
                age_groups["16-18"] += 1
            else:
                age_groups["19+"] += 1
        
        return StudentStatsResponse(
            total_students=total_students,
            active_students=status_counts.get("active", 0),
            inactive_students=status_counts.get("inactive", 0),
            pending_students=status_counts.get("pending", 0),
            suspended_students=status_counts.get("suspended", 0),
            students_by_gender=gender_counts,
            students_by_age_group=age_groups,
            recent_enrollments=recent_enrollments
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
        """Convert Student model to StudentResponse."""
        # Get program information (optional - avoid relationship errors)
        program_name = None
        try:
            program = db.query(Program).filter(Program.id == student.program_id).first()
            if program:
                program_name = program.name
        except Exception:
            # Skip program lookup if there are relationship issues
            pass
        
        return StudentResponse(
            id=student.id,
            student_id=student.student_id,
            salutation=student.salutation,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            phone=student.phone,
            date_of_birth=student.date_of_birth,
            gender=student.gender,
            address=student.address,
            program_id=student.program_id,
            program_name=program_name,
            referral_source=student.referral_source,
            enrollment_date=student.enrollment_date,
            status=student.status,
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
            from app.features.students.services.course_assignment_service import course_assignment_service
            
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
        return StudentResponse(
            id=student.id,
            student_id=student.student_id,
            salutation=student.salutation,
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            phone=student.phone,
            date_of_birth=student.date_of_birth,
            gender=student.gender,
            address=student.address,
            program_id=None,  # No program assigned yet
            program_name=None,
            referral_source=student.referral_source,
            enrollment_date=student.enrollment_date,
            status=student.status,
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