"""
User Search Service for cross-program user search and assignment capabilities.

This service provides comprehensive search functionality across all users in the system,
with proper permission validation and role-based filtering for the new two-step
student/parent creation and assignment process.
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, text
from fastapi import HTTPException, status
import logging

from app.features.authentication.models.user import User
from app.features.students.models.student import Student
from app.features.students.models.program_assignment import ProgramAssignment
from app.features.students.models.course_enrollment import CourseEnrollment
from app.features.parents.models.parent import Parent
from app.features.parents.models.parent_child_relationship import ParentChildRelationship
from app.features.organizations.models.organization_membership import OrganizationMembership
from app.features.programs.models.program import Program
from app.features.common.models.enums import UserRole, ProgramRole, EnrollmentStatus

logger = logging.getLogger(__name__)


@dataclass
class UserSearchParams:
    """Parameters for user search operations."""
    search_query: Optional[str] = None
    role_filter: Optional[List[str]] = None
    program_filter: Optional[str] = None
    organization_filter: Optional[str] = None
    is_active: Optional[bool] = None
    has_student_profile: Optional[bool] = None
    has_parent_profile: Optional[bool] = None
    exclude_assigned_to_program: Optional[str] = None
    exclude_enrolled_in_course: Optional[str] = None
    page: int = 1
    per_page: int = 20


@dataclass
class UserSearchResult:
    """Result of user search operations."""
    users: List[Dict[str, Any]]
    total_count: int
    page: int
    per_page: int
    total_pages: int


@dataclass
class UserProgramStatus:
    """User's program assignment status."""
    user_id: str
    assigned_programs: List[Dict[str, Any]]
    enrolled_courses: List[Dict[str, Any]]
    roles_in_programs: Dict[str, str]
    can_be_assigned_to_program: bool
    assignment_restrictions: List[str]


class UserSearchService:
    """
    Service for cross-program user search and assignment operations.
    
    This service enables searching for users across all programs and provides
    the necessary information for assignment decisions while respecting
    program context and security boundaries.
    """

    @staticmethod
    def search_all_users(
        db: Session,
        search_params: UserSearchParams,
        searcher_id: str,
        searcher_program_context: Optional[str] = None
    ) -> UserSearchResult:
        """
        Search all users in the system with advanced filtering.
        
        Args:
            db: Database session
            search_params: Search parameters and filters
            searcher_id: ID of user performing the search
            searcher_program_context: Program context of searcher
            
        Returns:
            UserSearchResult with paginated user data
        """
        try:
            # Validate searcher permissions
            searcher = db.query(User).filter(User.id == searcher_id).first()
            if not searcher:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid searcher credentials"
                )
            
            # Build base query
            query = db.query(User).options(
                joinedload(User.program_assignments),
                joinedload(User.course_enrollments)
            )
            
            # Apply search query filter
            if search_params.search_query:
                search_term = f"%{search_params.search_query}%"
                query = query.filter(
                    or_(
                        User.first_name.ilike(search_term),
                        User.last_name.ilike(search_term),
                        User.email.ilike(search_term),
                        func.concat(User.first_name, ' ', User.last_name).ilike(search_term)
                    )
                )
            
            # Apply role filter
            if search_params.role_filter:
                role_conditions = []
                for role in search_params.role_filter:
                    role_conditions.append(
                        func.json_extract(User.roles, '$').like(f'%"{role}"%')
                    )
                query = query.filter(or_(*role_conditions))
            
            # Apply active status filter
            if search_params.is_active is not None:
                query = query.filter(User.is_active == search_params.is_active)
            
            # Apply program assignment filter
            if search_params.program_filter:
                query = query.join(ProgramAssignment).filter(
                    ProgramAssignment.program_id == search_params.program_filter,
                    ProgramAssignment.is_active == True
                )
            
            # Apply organization membership filter
            if search_params.organization_filter:
                query = query.join(OrganizationMembership).filter(
                    OrganizationMembership.organization_id == search_params.organization_filter
                )
            
            # Apply exclusion filters
            if search_params.exclude_assigned_to_program:
                # Exclude users already assigned to specific program
                assigned_user_ids = db.query(ProgramAssignment.user_id).filter(
                    ProgramAssignment.program_id == search_params.exclude_assigned_to_program,
                    ProgramAssignment.is_active == True
                ).subquery()
                query = query.filter(~User.id.in_(assigned_user_ids))
            
            if search_params.exclude_enrolled_in_course:
                # Exclude users already enrolled in specific course
                enrolled_user_ids = db.query(CourseEnrollment.user_id).filter(
                    CourseEnrollment.course_id == search_params.exclude_enrolled_in_course,
                    CourseEnrollment.status.in_([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED])
                ).subquery()
                query = query.filter(~User.id.in_(enrolled_user_ids))
            
            # Get total count before pagination
            total_count = query.count()
            
            # Apply pagination
            offset = (search_params.page - 1) * search_params.per_page
            users = query.offset(offset).limit(search_params.per_page).all()
            
            # Process user data
            user_data = []
            for user in users:
                user_info = UserSearchService._build_user_search_result(db, user, searcher_program_context)
                user_data.append(user_info)
            
            total_pages = (total_count + search_params.per_page - 1) // search_params.per_page
            
            return UserSearchResult(
                users=user_data,
                total_count=total_count,
                page=search_params.page,
                per_page=search_params.per_page,
                total_pages=total_pages
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error searching users: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error performing user search"
            )

    @staticmethod
    def search_assignable_students(
        db: Session,
        program_id: str,
        search_query: str,
        searcher_id: str,
        exclude_enrolled_in_course: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for users who can be assigned as students to a program.
        
        Args:
            db: Database session
            program_id: Target program ID
            search_query: Search query string
            searcher_id: ID of user performing search  
            exclude_enrolled_in_course: Optional course ID to exclude
            
        Returns:
            List of assignable student user data
        """
        search_params = UserSearchParams(
            search_query=search_query,
            role_filter=[UserRole.STUDENT.value],
            exclude_assigned_to_program=program_id,
            exclude_enrolled_in_course=exclude_enrolled_in_course,
            is_active=True
        )
        
        result = UserSearchService.search_all_users(db, search_params, searcher_id, program_id)
        return result.users

    @staticmethod
    def search_assignable_parents(
        db: Session,
        program_id: str,
        search_query: str,
        searcher_id: str
    ) -> List[Dict[str, Any]]:
        """
        Search for users who can be assigned as parents to a program.
        
        Args:
            db: Database session
            program_id: Target program ID
            search_query: Search query string
            searcher_id: ID of user performing search
            
        Returns:
            List of assignable parent user data
        """
        search_params = UserSearchParams(
            search_query=search_query,
            role_filter=[UserRole.PARENT.value],
            exclude_assigned_to_program=program_id,
            is_active=True
        )
        
        result = UserSearchService.search_all_users(db, search_params, searcher_id, program_id)
        return result.users

    @staticmethod
    def get_user_program_status(
        db: Session,
        user_id: str
    ) -> UserProgramStatus:
        """
        Get comprehensive program status for a user.
        
        Args:
            db: Database session
            user_id: User ID to check
            
        Returns:
            UserProgramStatus with assignment details
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Get program assignments
            assignments = db.query(ProgramAssignment).options(
                joinedload(ProgramAssignment.program)
            ).filter(
                ProgramAssignment.user_id == user_id,
                ProgramAssignment.is_active == True
            ).all()
            
            assigned_programs = []
            roles_in_programs = {}
            for assignment in assignments:
                program_data = {
                    "program_id": assignment.program_id,
                    "program_name": assignment.program.name if assignment.program else "Unknown",
                    "role": assignment.role_in_program.value,
                    "assignment_date": assignment.assignment_date.isoformat(),
                    "assigned_by": assignment.assigned_by
                }
                assigned_programs.append(program_data)
                roles_in_programs[assignment.program_id] = assignment.role_in_program.value
            
            # Get course enrollments
            enrollments = db.query(CourseEnrollment).options(
                joinedload(CourseEnrollment.course),
                joinedload(CourseEnrollment.program)
            ).filter(
                CourseEnrollment.user_id == user_id,
                CourseEnrollment.status.in_([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED])
            ).all()
            
            enrolled_courses = []
            for enrollment in enrollments:
                course_data = {
                    "course_id": enrollment.course_id,
                    "course_name": enrollment.course.name if enrollment.course else "Unknown",
                    "program_id": enrollment.program_id,
                    "program_name": enrollment.program.name if enrollment.program else "Unknown",
                    "enrollment_date": enrollment.enrollment_date.isoformat(),
                    "status": enrollment.status.value,
                    "progress": float(enrollment.progress_percentage or 0)
                }
                enrolled_courses.append(course_data)
            
            # Check assignment restrictions
            assignment_restrictions = []
            if not user.is_active:
                assignment_restrictions.append("User account is inactive")
            
            # Check if user has required roles for assignment
            can_be_assigned = user.is_active and len(assignment_restrictions) == 0
            
            return UserProgramStatus(
                user_id=user_id,
                assigned_programs=assigned_programs,
                enrolled_courses=enrolled_courses,
                roles_in_programs=roles_in_programs,
                can_be_assigned_to_program=can_be_assigned,
                assignment_restrictions=assignment_restrictions
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting user program status: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error retrieving user program status"
            )

    @staticmethod
    def filter_users_by_role_eligibility(
        db: Session,
        users: List[User],
        target_role: str
    ) -> List[User]:
        """
        Filter users by their eligibility for a specific role.
        
        Args:
            db: Database session
            users: List of users to filter
            target_role: Target role to filter for
            
        Returns:
            Filtered list of users
        """
        eligible_users = []
        
        for user in users:
            if target_role in user.roles:
                # Additional role-specific eligibility checks
                if target_role == UserRole.STUDENT.value:
                    # Students should be active
                    if user.is_active:
                        eligible_users.append(user)
                
                elif target_role == UserRole.PARENT.value:
                    # Parents should be active
                    if user.is_active:
                        eligible_users.append(user)
                
                else:
                    # For other roles, basic active check
                    if user.is_active:
                        eligible_users.append(user)
        
        return eligible_users

    @staticmethod
    def check_cross_program_permissions(
        db: Session,
        assigner_id: str,
        target_user_id: str,
        target_program_id: str
    ) -> bool:
        """
        Check if an assigner has permission to assign a user to a program.
        
        Args:
            db: Database session
            assigner_id: ID of user making the assignment
            target_user_id: ID of user being assigned
            target_program_id: ID of target program
            
        Returns:
            True if assignment is permitted
        """
        try:
            # Get assigner information
            assigner = db.query(User).filter(User.id == assigner_id).first()
            if not assigner:
                return False
            
            # Super admins can assign anyone to any program
            if UserRole.SUPER_ADMIN.value in assigner.roles:
                return True
            
            # Program admins can assign users to their own programs
            if UserRole.PROGRAM_ADMIN.value in assigner.roles:
                # Check if assigner has access to target program
                assigner_programs = db.query(ProgramAssignment.program_id).filter(
                    ProgramAssignment.user_id == assigner_id,
                    ProgramAssignment.is_active == True
                ).all()
                assigner_program_ids = [p[0] for p in assigner_programs]
                
                if target_program_id in assigner_program_ids:
                    return True
            
            # Program coordinators can assign users to their own programs (limited)
            if UserRole.PROGRAM_COORDINATOR.value in assigner.roles:
                # Check if assigner has access to target program
                assigner_programs = db.query(ProgramAssignment.program_id).filter(
                    ProgramAssignment.user_id == assigner_id,
                    ProgramAssignment.is_active == True
                ).all()
                assigner_program_ids = [p[0] for p in assigner_programs]
                
                if target_program_id in assigner_program_ids:
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking cross-program permissions: {str(e)}")
            return False

    @staticmethod
    def _build_user_search_result(
        db: Session,
        user: User,
        searcher_program_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Build comprehensive user search result data.
        
        Args:
            db: Database session
            user: User instance
            searcher_program_context: Program context of searcher
            
        Returns:
            Dictionary with user search result data
        """
        # Get program assignments
        program_assignments = []
        for assignment in user.program_assignments:
            if assignment.is_active:
                program_assignments.append({
                    "program_id": assignment.program_id,
                    "role": assignment.role_in_program.value,
                    "assignment_date": assignment.assignment_date.isoformat()
                })
        
        # Get course enrollments
        active_enrollments = []
        for enrollment in user.course_enrollments:
            if enrollment.status in [EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]:
                active_enrollments.append({
                    "course_id": enrollment.course_id,
                    "program_id": enrollment.program_id,
                    "status": enrollment.status.value,
                    "enrollment_date": enrollment.enrollment_date.isoformat()
                })
        
        # Get student profile info (if applicable)
        student_profile = None
        if UserRole.STUDENT.value in user.roles:
            student = db.query(Student).filter(Student.user_id == user.id).first()
            if student:
                student_profile = {
                    "student_id": student.student_id,
                    "program_id": student.program_id,
                    "status": student.status,
                    "enrollment_date": student.enrollment_date.isoformat() if student.enrollment_date else None
                }
        
        # Get parent profile info (if applicable)
        parent_profile = None
        children_count = 0
        if UserRole.PARENT.value in user.roles:
            parent = db.query(Parent).filter(Parent.user_id == user.id).first()
            if parent:
                parent_profile = {
                    "program_id": parent.program_id,
                    "payment_responsibility": parent.payment_responsibility
                }
                # Count children
                children_count = db.query(func.count(ParentChildRelationship.id)).filter(
                    ParentChildRelationship.parent_id == parent.id
                ).scalar() or 0
        
        # Get organization membership
        organization_membership = None
        if searcher_program_context:
            org_membership = db.query(OrganizationMembership).options(
                joinedload(OrganizationMembership.organization)
            ).filter(
                OrganizationMembership.user_id == user.id,
                OrganizationMembership.program_id == searcher_program_context
            ).first()
            
            if org_membership:
                organization_membership = {
                    "organization_id": org_membership.organization_id,
                    "organization_name": org_membership.organization.name if org_membership.organization else "Unknown",
                    "membership_type": org_membership.membership_type.value if org_membership.membership_type else None
                }
        
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone": user.phone,
            "roles": user.roles,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
            "program_assignments": program_assignments,
            "active_enrollments": active_enrollments,
            "student_profile": student_profile,
            "parent_profile": parent_profile,
            "children_count": children_count,
            "organization_membership": organization_membership,
            "assignment_eligibility": {
                "can_be_student": UserRole.STUDENT.value in user.roles and user.is_active,
                "can_be_parent": UserRole.PARENT.value in user.roles and user.is_active,
                "has_restrictions": not user.is_active
            }
        }


# Singleton instance
user_search_service = UserSearchService()