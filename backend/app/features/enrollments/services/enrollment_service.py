"""
Course Assignment Service for handling student/parent course enrollment operations.

This service implements the new two-step creation process where users are first created
as profiles, then assigned to specific courses. It handles both individual and bulk
assignment operations with proper validation and program context filtering.
"""

from typing import Dict, List, Optional, Any, Tuple
from decimal import Decimal
from datetime import date
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status
import logging

from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.enrollments.models.program_assignment import ProgramAssignment
from app.features.students.models.student import Student
from app.features.parents.models.parent import Parent
from app.features.authentication.models.user import User
from app.features.courses.models.course import Course
from app.features.programs.models.program import Program
from app.features.organizations.models.organization_membership import OrganizationMembership
from app.features.common.models.enums import (
    EnrollmentStatus, AssignmentType, ProgramRole, UserRole
)
from app.features.organizations.services.payment_override_service import get_payment_override_service

logger = logging.getLogger(__name__)


class AssignmentEligibility:
    """Class to hold assignment eligibility check results."""
    
    def __init__(self, eligible: bool, reason: str = "", warnings: List[str] = None):
        self.eligible = eligible
        self.reason = reason
        self.warnings = warnings or []


class BulkAssignmentResult:
    """Class to hold bulk assignment operation results."""
    
    def __init__(self):
        self.successful_assignments: List[CourseEnrollment] = []
        self.failed_assignments: List[Dict[str, Any]] = []
        self.total_processed: int = 0
        self.total_successful: int = 0
        self.total_failed: int = 0
    
    def add_success(self, enrollment: CourseEnrollment):
        """Add a successful assignment."""
        self.successful_assignments.append(enrollment)
        self.total_successful += 1
        self.total_processed += 1
    
    def add_failure(self, user_id: str, course_id: str, error: str):
        """Add a failed assignment."""
        self.failed_assignments.append({
            "user_id": user_id,
            "course_id": course_id,
            "error": error
        })
        self.total_failed += 1
        self.total_processed += 1


class CourseAssignmentService:
    """
    Service for handling course assignment operations.
    
    This service implements the core functionality for the new two-step
    student/parent creation process, separating profile creation from
    course assignment.
    """

    @staticmethod
    def assign_user_to_course(
        db: Session,
        user_id: str,
        course_id: str,
        program_context: str,
        assigned_by: str,
        assignment_details: Optional[Dict[str, Any]] = None
    ) -> CourseEnrollment:
        """
        Assign a user to a specific course.
        
        Args:
            db: Database session
            user_id: ID of user to assign
            course_id: ID of course to assign to
            program_context: Program context for security
            assigned_by: ID of user making the assignment
            assignment_details: Optional assignment metadata
            
        Returns:
            CourseEnrollment instance
        """
        try:
            # Validate user exists
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Validate course exists and belongs to program context
            course = db.query(Course).filter(
                Course.id == course_id,
                Course.program_id == program_context
            ).first()
            if not course:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Course not found or not accessible in current program context"
                )
            
            # Check if user is already enrolled in this course
            existing_enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == user_id,
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.status.in_([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED])
            ).first()
            
            if existing_enrollment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User is already enrolled in this course"
                )
            
            # Check assignment eligibility
            eligibility = CourseAssignmentService.check_assignment_eligibility(
                db, user_id, course_id, program_context
            )
            if not eligibility.eligible:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Assignment not eligible: {eligibility.reason}"
                )
            
            # Get or create student profile if user has student role
            student_id = None
            if UserRole.STUDENT.value in user.roles:
                student = CourseAssignmentService._get_or_create_student_profile(
                    db, user_id, program_context, assigned_by
                )
                student_id = student.id
            
            # Ensure user has program assignment
            CourseAssignmentService._ensure_program_assignment(
                db, user_id, program_context, assigned_by
            )
            
            # Calculate enrollment fee
            enrollment_fee = CourseAssignmentService.calculate_assignment_fee(
                db, user_id, course_id, program_context
            )
            
            # Create course enrollment
            assignment_details = assignment_details or {}
            enrollment = CourseEnrollment(
                user_id=user_id,
                student_id=student_id,
                course_id=course_id,
                program_id=program_context,
                enrollment_date=date.today(),
                assignment_date=date.today(),
                assignment_type=assignment_details.get('assignment_type', AssignmentType.DIRECT),
                credits_awarded=assignment_details.get('credits_awarded', 0),
                assignment_notes=assignment_details.get('assignment_notes'),
                assigned_by=assigned_by,
                status=EnrollmentStatus.ACTIVE,
                enrollment_fee=enrollment_fee,
                amount_paid=assignment_details.get('amount_paid', Decimal('0.00')),
                outstanding_balance=enrollment_fee,
                referral_source=assignment_details.get('referral_source'),
                special_requirements=assignment_details.get('special_requirements'),
                notes=assignment_details.get('notes')
            )
            
            db.add(enrollment)
            db.commit()
            db.refresh(enrollment)
            
            logger.info(f"Successfully assigned user {user_id} to course {course_id}")
            return enrollment
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error assigning user to course: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing course assignment"
            )

    @staticmethod
    def assign_multiple_users_to_course(
        db: Session,
        user_ids: List[str],
        course_id: str,
        program_context: str,
        assigned_by: str,
        assignment_details: Optional[Dict[str, Any]] = None
    ) -> BulkAssignmentResult:
        """
        Assign multiple users to a single course.
        
        Args:
            db: Database session
            user_ids: List of user IDs to assign
            course_id: ID of course to assign to
            program_context: Program context for security
            assigned_by: ID of user making the assignment
            assignment_details: Optional assignment metadata
            
        Returns:
            BulkAssignmentResult with success/failure details
        """
        result = BulkAssignmentResult()
        
        for user_id in user_ids:
            try:
                enrollment = CourseAssignmentService.assign_user_to_course(
                    db, user_id, course_id, program_context, assigned_by, assignment_details
                )
                result.add_success(enrollment)
                
            except HTTPException as e:
                result.add_failure(user_id, course_id, str(e.detail))
                continue
            except Exception as e:
                result.add_failure(user_id, course_id, str(e))
                continue
        
        logger.info(f"Bulk assignment completed: {result.total_successful} successful, {result.total_failed} failed")
        return result

    @staticmethod
    def assign_user_to_multiple_courses(
        db: Session,
        user_id: str,
        course_ids: List[str],
        program_context: str,
        assigned_by: str,
        assignment_details: Optional[Dict[str, Any]] = None
    ) -> BulkAssignmentResult:
        """
        Assign a single user to multiple courses.
        
        Args:
            db: Database session
            user_id: ID of user to assign
            course_ids: List of course IDs to assign to
            program_context: Program context for security
            assigned_by: ID of user making the assignment
            assignment_details: Optional assignment metadata
            
        Returns:
            BulkAssignmentResult with success/failure details
        """
        result = BulkAssignmentResult()
        
        for course_id in course_ids:
            try:
                enrollment = CourseAssignmentService.assign_user_to_course(
                    db, user_id, course_id, program_context, assigned_by, assignment_details
                )
                result.add_success(enrollment)
                
            except HTTPException as e:
                result.add_failure(user_id, course_id, str(e.detail))
                continue
            except Exception as e:
                result.add_failure(user_id, course_id, str(e))
                continue
        
        logger.info(f"Multi-course assignment completed: {result.total_successful} successful, {result.total_failed} failed")
        return result

    @staticmethod
    def bulk_assign_users_to_courses(
        db: Session,
        assignments: List[Dict[str, Any]],
        program_context: str,
        assigned_by: str
    ) -> BulkAssignmentResult:
        """
        Bulk assign users to courses from a list of assignments.
        
        Args:
            db: Database session
            assignments: List of assignment dictionaries with user_id, course_id, and details
            program_context: Program context for security
            assigned_by: ID of user making the assignment
            
        Returns:
            BulkAssignmentResult with success/failure details
        """
        result = BulkAssignmentResult()
        
        for assignment in assignments:
            try:
                user_id = assignment.get('user_id')
                course_id = assignment.get('course_id')
                details = assignment.get('assignment_details', {})
                
                if not user_id or not course_id:
                    result.add_failure(
                        user_id or "unknown", 
                        course_id or "unknown", 
                        "Missing user_id or course_id"
                    )
                    continue
                
                enrollment = CourseAssignmentService.assign_user_to_course(
                    db, user_id, course_id, program_context, assigned_by, details
                )
                result.add_success(enrollment)
                
            except HTTPException as e:
                result.add_failure(
                    assignment.get('user_id', 'unknown'),
                    assignment.get('course_id', 'unknown'),
                    str(e.detail)
                )
                continue
            except Exception as e:
                result.add_failure(
                    assignment.get('user_id', 'unknown'),
                    assignment.get('course_id', 'unknown'),
                    str(e)
                )
                continue
        
        logger.info(f"Bulk assignment completed: {result.total_successful} successful, {result.total_failed} failed")
        return result

    @staticmethod
    def remove_course_assignment(
        db: Session,
        user_id: str,
        course_id: str,
        program_context: str,
        removed_by: str,
        reason: Optional[str] = None
    ) -> bool:
        """
        Remove a user's course assignment.
        
        Args:
            db: Database session
            user_id: ID of user to remove
            course_id: ID of course to remove from
            program_context: Program context for security
            removed_by: ID of user making the removal
            reason: Optional reason for removal
            
        Returns:
            True if successful
        """
        try:
            # Find the enrollment
            enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == user_id,
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.program_id == program_context
            ).first()
            
            if not enrollment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Course enrollment not found"
                )
            
            # Update enrollment status instead of deleting for audit trail
            enrollment.status = EnrollmentStatus.WITHDRAWN
            enrollment.completion_date = date.today()
            enrollment.notes = f"{enrollment.notes or ''}\nWithdrawn on {date.today()} by {removed_by}. Reason: {reason or 'Not specified'}"
            
            db.commit()
            
            logger.info(f"Successfully removed user {user_id} from course {course_id}")
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error removing course assignment: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error removing course assignment"
            )

    @staticmethod
    def get_user_course_assignments(
        db: Session,
        user_id: str,
        program_context: str
    ) -> List[CourseEnrollment]:
        """
        Get all course assignments for a user in program context.
        
        Args:
            db: Database session
            user_id: ID of user
            program_context: Program context for security
            
        Returns:
            List of CourseEnrollment instances
        """
        return db.query(CourseEnrollment).options(
            joinedload(CourseEnrollment.course),
            joinedload(CourseEnrollment.program)
        ).filter(
            CourseEnrollment.user_id == user_id,
            CourseEnrollment.program_id == program_context
        ).all()

    @staticmethod
    def get_assignable_courses(
        db: Session,
        program_context: str
    ) -> List[Course]:
        """
        Get all courses available for assignment in program context.
        
        Args:
            db: Database session
            program_context: Program context for security
            
        Returns:
            List of Course instances
        """
        return db.query(Course).filter(
            Course.program_id == program_context,
            Course.status == "active"
        ).order_by(Course.sequence).all()

    @staticmethod
    def check_assignment_eligibility(
        db: Session,
        user_id: str,
        course_id: str,
        program_context: Optional[str] = None
    ) -> AssignmentEligibility:
        """
        Check if a user is eligible for course assignment.
        
        Args:
            db: Database session
            user_id: ID of user to check
            course_id: ID of course to check
            program_context: Optional program context
            
        Returns:
            AssignmentEligibility instance
        """
        try:
            warnings = []
            
            # Check if user exists
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return AssignmentEligibility(False, "User not found")
            
            # Check if user is active
            if not user.is_active:
                return AssignmentEligibility(False, "User account is inactive")
            
            # Check if course exists
            course_query = db.query(Course).filter(Course.id == course_id)
            if program_context:
                course_query = course_query.filter(Course.program_id == program_context)
            
            course = course_query.first()
            if not course:
                return AssignmentEligibility(False, "Course not found or not accessible")
            
            # Check if course is active
            if course.status != "active":
                return AssignmentEligibility(False, f"Course is not active (status: {course.status})")
            
            # Check if user is already enrolled
            existing_enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.user_id == user_id,
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.status.in_([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED])
            ).first()
            
            if existing_enrollment:
                return AssignmentEligibility(False, "User is already enrolled in this course")
            
            # Check course capacity (if applicable)
            if course.max_students:
                current_enrollments = db.query(func.count(CourseEnrollment.id)).filter(
                    CourseEnrollment.course_id == course_id,
                    CourseEnrollment.status == EnrollmentStatus.ACTIVE
                ).scalar() or 0
                
                if current_enrollments >= course.max_students:
                    return AssignmentEligibility(False, "Course is at maximum capacity")
                elif current_enrollments >= course.max_students * 0.9:  # 90% capacity warning
                    warnings.append("Course is nearly at capacity")
            
            # Check age requirements (if user has student profile)
            student = db.query(Student).filter(Student.user_id == user_id).first()
            if student and student.date_of_birth and course.age_groups:
                user_age = (date.today() - student.date_of_birth).days // 365
                # This would need to be enhanced with actual age group validation
                # For now, we'll just add a warning
                warnings.append("Age compatibility should be verified")
            
            return AssignmentEligibility(True, "Eligible for assignment", warnings)
            
        except Exception as e:
            logger.error(f"Error checking assignment eligibility: {str(e)}")
            return AssignmentEligibility(False, "Error checking eligibility")

    @staticmethod
    def calculate_assignment_fee(
        db: Session,
        user_id: str,
        course_id: str,
        program_context: Optional[str] = None
    ) -> Decimal:
        """
        Calculate the enrollment fee for a course assignment.
        
        Args:
            db: Database session
            user_id: ID of user
            course_id: ID of course
            program_context: Optional program context
            
        Returns:
            Calculated fee as Decimal
        """
        try:
            # Get course
            course = db.query(Course).filter(Course.id == course_id).first()
            if not course:
                raise ValueError("Course not found")
            
            # Get base fee from course (this would need to be enhanced based on pricing matrix)
            base_fee = Decimal('0.00')  # Default fee
            
            # Check for organization membership and payment overrides
            organization_membership = db.query(OrganizationMembership).filter(
                OrganizationMembership.user_id == user_id,
                OrganizationMembership.program_id == program_context or course.program_id
            ).first()
            
            if organization_membership:
                # Use payment override service to calculate discounted fee
                try:
                    payment_service = get_payment_override_service(db)
                    override_result = payment_service.calculate_payment_responsibility(
                        user_id, course_id, base_fee, program_context or course.program_id
                    )
                    # Use the total amount from payment responsibility calculation
                    return override_result.get('total_amount', base_fee)
                except Exception as e:
                    logger.warning(f"Error calculating payment override: {str(e)}")
            
            return base_fee
            
        except Exception as e:
            logger.error(f"Error calculating assignment fee: {str(e)}")
            return Decimal('0.00')

    @staticmethod
    def _get_or_create_student_profile(
        db: Session,
        user_id: str,
        program_context: str,
        created_by: str
    ) -> Student:
        """
        Get existing student profile or create a new one.
        
        Args:
            db: Database session
            user_id: User ID
            program_context: Program context
            created_by: ID of user creating the profile
            
        Returns:
            Student profile instance
        """
        # Check if student profile already exists
        student = db.query(Student).filter(
            Student.user_id == user_id,
            Student.program_id == program_context
        ).first()
        
        if student:
            return student
        
        # Get user details
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Create minimal student profile
        from app.features.students.services.student_service import student_service
        
        # Create a minimal student data structure
        class MinimalStudentData:
            def __init__(self, user: User, program_id: str):
                self.first_name = user.first_name
                self.last_name = user.last_name
                self.email = user.email
                self.phone = user.phone
                self.program_id = program_id
                self.enrollment_date = date.today()
                self.status = "active"
                
            def model_dump(self):
                return {
                    'first_name': self.first_name,
                    'last_name': self.last_name,
                    'email': self.email,
                    'phone': self.phone,
                    'program_id': self.program_id,
                    'enrollment_date': self.enrollment_date,
                    'status': self.status
                }
        
        student_data = MinimalStudentData(user, program_context)
        student_response = student_service.create_student(
            db, student_data, created_by, program_context
        )
        
        # Return the actual student model
        return db.query(Student).filter(Student.id == student_response.id).first()

    @staticmethod
    def _ensure_program_assignment(
        db: Session,
        user_id: str,
        program_context: str,
        assigned_by: str
    ) -> ProgramAssignment:
        """
        Ensure user has program assignment, create if needed.
        
        Args:
            db: Database session
            user_id: User ID
            program_context: Program context
            assigned_by: ID of user making the assignment
            
        Returns:
            ProgramAssignment instance
        """
        # Check if program assignment already exists
        assignment = db.query(ProgramAssignment).filter(
            ProgramAssignment.user_id == user_id,
            ProgramAssignment.program_id == program_context,
            ProgramAssignment.is_active == True
        ).first()
        
        if assignment:
            return assignment
        
        # Get user to determine role
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Determine program role based on user roles
        program_role = ProgramRole.STUDENT
        if UserRole.PARENT.value in user.roles and UserRole.STUDENT.value in user.roles:
            program_role = ProgramRole.BOTH
        elif UserRole.PARENT.value in user.roles:
            program_role = ProgramRole.PARENT
        
        # Create program assignment
        assignment = ProgramAssignment(
            user_id=user_id,
            program_id=program_context,
            assignment_date=date.today(),
            assigned_by=assigned_by,
            role_in_program=program_role,
            is_active=True,
            assignment_notes=f"Auto-assigned during course enrollment on {date.today()}"
        )
        
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        
        return assignment


# Singleton instance
course_assignment_service = CourseAssignmentService()