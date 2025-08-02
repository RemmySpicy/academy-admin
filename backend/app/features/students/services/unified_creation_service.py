"""
Unified User Creation Service for Program Administrators

This service provides streamlined workflows for program administrators to create
students and parents with automatic program association in single transactions.
"""

from datetime import date
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from fastapi import HTTPException, status
import logging

from app.features.authentication.models.user import User
from app.features.authentication.services.user_service import user_service
from app.features.students.models.student import Student
from app.features.enrollments.models.program_assignment import ProgramAssignment
from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship
from app.features.programs.models.program import Program
from app.features.courses.models.course import Course
from app.features.common.models.enums import UserRole, ProgramRole, EnrollmentStatus, AssignmentType

logger = logging.getLogger(__name__)


class UnifiedCreationService:
    """
    Service for unified user creation workflows with automatic program association.
    
    This service provides streamlined workflows for program administrators to create
    users (students/parents) with automatic program association and optional course
    enrollment in single atomic transactions.
    """

    @staticmethod
    def create_student_with_program(
        db: Session,
        user_data: Dict[str, Any],
        student_data: Dict[str, Any],
        program_context: str,
        course_id: Optional[str] = None,
        created_by: str = None
    ) -> Dict[str, Any]:
        """
        Create a student with automatic program association and optional course enrollment.
        
        This is a unified workflow that:
        1. Creates user account with student role
        2. Creates student profile
        3. Auto-assigns to program (from admin's program context)
        4. Optionally enrolls in specified course
        
        Args:
            db: Database session
            user_data: User account data (first_name, last_name, email, etc.)
            student_data: Student profile data (address, emergency_contact, etc.)
            program_context: Program ID from admin's context
            course_id: Optional course ID for immediate enrollment
            created_by: ID of admin creating the student
            
        Returns:
            Dict with created user, student, program assignment, and optional enrollment
            
        Raises:
            HTTPException: On validation or creation errors
        """
        try:
            # Start atomic transaction
            db.begin()
            
            # Step 1: Validate program exists
            program = db.query(Program).filter(Program.id == program_context).first()
            if not program:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Program not found"
                )
            
            # Step 2: Validate course if provided
            course = None
            if course_id:
                course = db.query(Course).filter(
                    Course.id == course_id,
                    Course.program_id == program_context
                ).first()
                if not course:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Course not found in specified program"
                    )
            
            # Step 3: Create user account with student role
            user_create_data = {
                **user_data,
                "roles": [UserRole.STUDENT.value],
                "is_active": True
            }
            
            # Ensure password is provided if not present
            if "password" not in user_create_data:
                # Generate default password for student accounts
                user_create_data["password"] = f"student{date.today().year}"
            
            user = user_service.create_user_with_roles(
                db=db,
                user_data=user_create_data,
                roles=[UserRole.STUDENT.value],
                created_by=created_by
            )
            
            # Step 4: Create student profile
            from app.features.students.services.student_service import student_service
            
            # Prepare student data with user reference
            student_create_data = {
                **student_data,
                "user_id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "created_by": created_by
            }
            
            # Create student profile using existing service
            from app.features.students.schemas.student import StudentCreate
            student_create_schema = StudentCreate(**student_create_data)
            
            student_response = student_service.create_student_profile_only(
                db, 
                student_create_schema, 
                created_by
            )
            
            # Get the actual student model for further operations
            student = db.query(Student).filter(Student.id == student_response.id).first()
            
            # Step 5: Auto-assign to program
            program_assignment = ProgramAssignment(
                user_id=user.id,
                program_id=program_context,
                assignment_date=date.today(),
                assigned_by=created_by,
                role_in_program=ProgramRole.STUDENT,
                is_active=True,
                assignment_notes=f"Auto-assigned during unified student creation on {date.today()}"
            )
            
            db.add(program_assignment)
            db.flush()
            
            # Step 6: Optionally enroll in course
            enrollment = None
            if course_id:
                enrollment = CourseEnrollment(
                    user_id=user.id,
                    student_id=student.id,
                    course_id=course_id,
                    program_id=program_context,
                    status=EnrollmentStatus.ACTIVE,
                    assignment_type=AssignmentType.DIRECT,
                    enrollment_date=date.today(),
                    assignment_date=date.today(),
                    assigned_by=created_by,
                    assignment_notes=f"Enrolled during unified student creation on {date.today()}",
                    created_by=created_by
                )
                
                db.add(enrollment)
                db.flush()
            
            # Commit transaction
            db.commit()
            
            logger.info(f"Successfully created student {user.id} with program assignment {program_assignment.id}")
            
            # Prepare response
            response = {
                "success": True,
                "message": "Student created and assigned to program successfully",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone": user.phone,
                    "roles": user.roles,
                    "is_active": user.is_active
                },
                "student": {
                    "id": student_response.id,
                    "student_id": student_response.student_id,
                    "enrollment_date": student_response.enrollment_date.isoformat() if student_response.enrollment_date else None,
                    "status": student_response.status
                },
                "program_assignment": {
                    "id": program_assignment.id,
                    "program_id": program_assignment.program_id,
                    "role_in_program": program_assignment.role_in_program.value,
                    "assignment_date": program_assignment.assignment_date.isoformat(),
                    "is_active": program_assignment.is_active
                }
            }
            
            # Add enrollment info if course was specified
            if enrollment:
                response["course_enrollment"] = {
                    "id": enrollment.id,
                    "course_id": enrollment.course_id,
                    "status": enrollment.status.value,
                    "enrollment_date": enrollment.enrollment_date.isoformat(),
                    "assignment_date": enrollment.assignment_date.isoformat()
                }
            else:
                response["course_enrollment"] = None
            
            return response
            
        except HTTPException:
            db.rollback()
            raise
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error in unified student creation: {str(e)}")
            
            error_msg = "Data integrity violation"
            if "email" in str(e).lower():
                error_msg = "Email address already exists"
            elif "username" in str(e).lower():
                error_msg = "Username already exists"
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error in unified student creation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during student creation"
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error in unified student creation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error during student creation"
            )

    @staticmethod
    def create_parent_with_program(
        db: Session,
        user_data: Dict[str, Any],
        parent_data: Dict[str, Any],
        program_context: str,
        child_student_ids: Optional[List[str]] = None,
        created_by: str = None
    ) -> Dict[str, Any]:
        """
        Create a parent with automatic program association and optional child relationships.
        
        This is a unified workflow that:
        1. Creates user account with parent role
        2. Creates parent profile
        3. Auto-assigns to program (from admin's program context)
        4. Optionally creates parent-child relationships
        
        Args:
            db: Database session
            user_data: User account data (first_name, last_name, email, etc.)
            parent_data: Parent profile data (address, occupation, etc.)
            program_context: Program ID from admin's context
            child_student_ids: Optional list of existing student IDs to link as children
            created_by: ID of admin creating the parent
            
        Returns:
            Dict with created user, parent, program assignment, and child relationships
            
        Raises:
            HTTPException: On validation or creation errors
        """
        try:
            # Start atomic transaction
            db.begin()
            
            # Step 1: Validate program exists
            program = db.query(Program).filter(Program.id == program_context).first()
            if not program:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Program not found"
                )
            
            # Step 2: Validate child students if provided
            child_students = []
            if child_student_ids:
                for student_id in child_student_ids:
                    student = db.query(Student).filter(Student.id == student_id).first()
                    if not student:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Student {student_id} not found"
                        )
                    
                    # Verify student is in the same program
                    student_assignment = db.query(ProgramAssignment).filter(
                        ProgramAssignment.user_id == student.user_id,
                        ProgramAssignment.program_id == program_context,
                        ProgramAssignment.is_active == True
                    ).first()
                    
                    if not student_assignment:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Student {student_id} is not assigned to program {program_context}"
                        )
                    
                    child_students.append(student)
            
            # Step 3: Create user account with parent role
            user_create_data = {
                **user_data,
                "roles": [UserRole.PARENT.value],
                "is_active": True
            }
            
            # Ensure password is provided
            if "password" not in user_create_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password is required for parent accounts"
                )
            
            user = user_service.create_user_with_roles(
                db=db,
                user_data=user_create_data,
                roles=[UserRole.PARENT.value],
                created_by=created_by
            )
            
            # Step 4: Create parent profile
            parent_profile = Parent(
                user_id=user.id,
                program_id=program_context,
                address=parent_data.get("address"),
                emergency_contact_name=parent_data.get("emergency_contact_name"),
                emergency_contact_phone=parent_data.get("emergency_contact_phone"),
                occupation=parent_data.get("occupation"),
                payment_responsibility=parent_data.get("payment_responsibility", True),
                created_by=created_by
            )
            
            db.add(parent_profile)
            db.flush()
            
            # Step 5: Auto-assign to program
            program_assignment = ProgramAssignment(
                user_id=user.id,
                program_id=program_context,
                assignment_date=date.today(),
                assigned_by=created_by,
                role_in_program=ProgramRole.PARENT,
                is_active=True,
                assignment_notes=f"Auto-assigned during unified parent creation on {date.today()}"
            )
            
            db.add(program_assignment)
            db.flush()
            
            # Step 6: Create parent-child relationships if children specified
            child_relationships = []
            for student in child_students:
                # Check if relationship already exists
                existing_relationship = db.query(ParentChildRelationship).filter(
                    ParentChildRelationship.parent_id == parent_profile.id,
                    ParentChildRelationship.student_id == student.id
                ).first()
                
                if not existing_relationship:
                    relationship = ParentChildRelationship(
                        parent_id=parent_profile.id,
                        student_id=student.id,
                        can_pickup=True,
                        is_emergency_contact=True,
                        has_payment_responsibility=parent_profile.payment_responsibility,
                        pickup_notes=None,
                        special_instructions=None,
                        created_by=created_by
                    )
                    
                    db.add(relationship)
                    db.flush()
                    child_relationships.append(relationship)
                else:
                    child_relationships.append(existing_relationship)
            
            # Commit transaction
            db.commit()
            
            logger.info(f"Successfully created parent {user.id} with program assignment and {len(child_relationships)} child relationships")
            
            # Prepare response
            response = {
                "success": True,
                "message": "Parent created and assigned to program successfully",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone": user.phone,
                    "roles": user.roles,
                    "is_active": user.is_active
                },
                "parent": {
                    "id": parent_profile.id,
                    "program_id": parent_profile.program_id,
                    "address": parent_profile.address,
                    "occupation": parent_profile.occupation,
                    "payment_responsibility": parent_profile.payment_responsibility
                },
                "program_assignment": {
                    "id": program_assignment.id,
                    "program_id": program_assignment.program_id,
                    "role_in_program": program_assignment.role_in_program.value,
                    "assignment_date": program_assignment.assignment_date.isoformat(),
                    "is_active": program_assignment.is_active
                },
                "child_relationships": [
                    {
                        "id": rel.id,
                        "student_id": rel.student_id,
                        "can_pickup": rel.can_pickup,
                        "is_emergency_contact": rel.is_emergency_contact,
                        "has_payment_responsibility": rel.has_payment_responsibility
                    }
                    for rel in child_relationships
                ]
            }
            
            return response
            
        except HTTPException:
            db.rollback()
            raise
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error in unified parent creation: {str(e)}")
            
            error_msg = "Data integrity violation"
            if "email" in str(e).lower():
                error_msg = "Email address already exists"
            elif "username" in str(e).lower():
                error_msg = "Username already exists"
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error in unified parent creation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during parent creation"
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error in unified parent creation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error during parent creation"
            )

    @staticmethod
    def validate_program_admin_access(
        db: Session,
        admin_user_id: str,
        program_context: str
    ) -> bool:
        """
        Validate that the admin user has access to create users in the specified program.
        
        Args:
            db: Database session
            admin_user_id: ID of admin user
            program_context: Program ID to validate access for
            
        Returns:
            True if admin has access, False otherwise
        """
        try:
            # Check if user is super admin (can bypass program context)
            admin_user = db.query(User).filter(User.id == admin_user_id).first()
            if not admin_user:
                return False
            
            if UserRole.SUPER_ADMIN.value in admin_user.roles:
                return True
            
            # Check if user has program admin access to this program
            admin_assignment = db.query(ProgramAssignment).filter(
                ProgramAssignment.user_id == admin_user_id,
                ProgramAssignment.program_id == program_context,
                ProgramAssignment.is_active == True,
                ProgramAssignment.role_in_program.in_([
                    ProgramRole.PROGRAM_ADMIN,
                    ProgramRole.PROGRAM_COORDINATOR
                ])
            ).first()
            
            return admin_assignment is not None
            
        except Exception as e:
            logger.error(f"Error validating program admin access: {str(e)}")
            return False


# Singleton instance
unified_creation_service = UnifiedCreationService()