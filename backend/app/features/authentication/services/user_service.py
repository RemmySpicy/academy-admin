"""
Enhanced User service for managing users with multiple roles and family relationships.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, desc, asc

from app.features.authentication.models.user import User
from app.features.authentication.models.user_relationship import UserRelationship
from app.features.authentication.models.user_program_assignment import UserProgramAssignment
from app.features.enrollments.models.course_enrollment import CourseEnrollment
from app.features.students.models.student import Student
from app.features.common.models.enums import UserRole, RelationshipType, EnrollmentStatus
from app.features.courses.services.base_service import BaseService


class UserService(BaseService[User, dict, dict]):
    """Enhanced service for user operations with family relationships and multiple roles."""
    
    def __init__(self):
        super().__init__(User)
    
    def create_user_with_roles(
        self, 
        db: Session,
        user_data: Dict[str, Any],
        roles: List[str],
        created_by: str
    ) -> User:
        """Create a new user with specified roles."""
        from app.features.authentication.utils.password import hash_password
        
        # Extract password and hash it
        password = user_data.pop("password", None)
        if not password:
            raise ValueError("Password is required")
            
        password_hash = hash_password(password)
        
        # Auto-generate full_name from first_name and last_name if not provided
        if "full_name" not in user_data:
            first_name = user_data.get("first_name", "").strip()
            last_name = user_data.get("last_name", "").strip()
            
            # Generate full_name with proper spacing
            if first_name and last_name:
                full_name = f"{first_name} {last_name}"
            elif first_name:
                full_name = first_name
            elif last_name:
                full_name = last_name
            else:
                raise ValueError("Either first_name, last_name, or full_name must be provided")
                
            user_data["full_name"] = full_name
        
        # Set up the user data
        user_dict = {
            **user_data,
            "password_hash": password_hash,
            "roles": roles,
            "primary_role": roles[0] if roles else "student",
            "created_by": created_by,
            "updated_by": created_by
        }
        
        # Create the user
        user = User(**user_dict)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    
    def add_role_to_user(self, db: Session, user_id: str, role: str, updated_by: str) -> User:
        """Add a role to an existing user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        if role not in user.roles:
            user.add_role(role)
            user.updated_by = updated_by
            db.commit()
            db.refresh(user)
        
        return user
    
    def remove_role_from_user(self, db: Session, user_id: str, role: str, updated_by: str) -> User:
        """Remove a role from an existing user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        if role in user.roles:
            user.remove_role(role)
            user.updated_by = updated_by
            db.commit()
            db.refresh(user)
        
        return user
    
    def create_parent_child_relationship(
        self,
        db: Session,
        parent_user_id: str,
        child_user_id: str,
        relationship_type: RelationshipType,
        program_id: str,
        is_primary: bool = False,
        is_emergency_contact: bool = True,
        created_by: str = None
    ) -> UserRelationship:
        """Create a parent-child relationship."""
        # Validate users exist
        parent = db.query(User).filter(User.id == parent_user_id).first()
        child = db.query(User).filter(User.id == child_user_id).first()
        
        if not parent:
            raise ValueError(f"Parent user with id {parent_user_id} not found")
        if not child:
            raise ValueError(f"Child user with id {child_user_id} not found")
        
        # Check if relationship already exists in this program
        existing = db.query(UserRelationship).filter(
            UserRelationship.parent_user_id == parent_user_id,
            UserRelationship.child_user_id == child_user_id,
            UserRelationship.relationship_type == relationship_type,
            UserRelationship.program_id == program_id
        ).first()
        
        if existing:
            raise ValueError("Relationship already exists")
        
        # Create the relationship
        relationship = UserRelationship(
            parent_user_id=parent_user_id,
            child_user_id=child_user_id,
            relationship_type=relationship_type,
            program_id=program_id,
            is_primary=is_primary,
            emergency_contact=is_emergency_contact,
            created_by=created_by,
            updated_by=created_by
        )
        
        db.add(relationship)
        
        # Ensure parent has parent role
        if UserRole.PARENT.value not in parent.roles:
            parent.add_role(UserRole.PARENT.value)
        
        # If child doesn't have student role and is enrolling, they'll get it during enrollment
        # For now, just ensure the relationship is created
        
        db.commit()
        db.refresh(relationship)
        
        return relationship
    
    def get_family_structure(self, db: Session, user_id: str, program_context: Optional[str] = None) -> Dict[str, Any]:
        """Get complete family structure for a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Get children (if user is a parent)
        children_query = db.query(UserRelationship).options(
            joinedload(UserRelationship.child_user)
        ).filter(
            UserRelationship.parent_user_id == user_id,
            UserRelationship.is_active == True
        )
        
        if program_context:
            children_query = children_query.filter(UserRelationship.program_id == program_context)
        
        children_relationships = children_query.all()
        
        # Get parents (if user is a child)
        parent_query = db.query(UserRelationship).options(
            joinedload(UserRelationship.parent_user)
        ).filter(
            UserRelationship.child_user_id == user_id,
            UserRelationship.is_active == True
        )
        
        if program_context:
            parent_query = parent_query.filter(UserRelationship.program_id == program_context)
        
        parent_relationships = parent_query.all()
        
        return {
            "user": user,
            "children": [
                {
                    "user": rel.child_user,
                    "relationship_type": rel.relationship_type.value,
                    "is_primary": rel.is_primary,
                    "relationship_id": rel.id
                }
                for rel in children_relationships
            ],
            "parents": [
                {
                    "user": rel.parent_user,
                    "relationship_type": rel.relationship_type.value,
                    "is_primary": rel.is_primary,
                    "relationship_id": rel.id
                }
                for rel in parent_relationships
            ]
        }
    
    def enroll_user_in_course(
        self,
        db: Session,
        user_id: str,
        course_id: str,
        program_id: str,
        enrollment_data: Dict[str, Any] = None,
        created_by: str = None
    ) -> CourseEnrollment:
        """Enroll a user in a course and create student profile if needed."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Add student role if not present
        if UserRole.STUDENT.value not in user.roles:
            user.add_role(UserRole.STUDENT.value)
        
        # Check if user already has a student profile
        student_profile = db.query(Student).filter(Student.user_id == user_id).first()
        
        # If no student profile exists, create one
        if not student_profile:
            student_profile = self._create_student_profile_from_user(
                db, user, program_id, created_by
            )
        
        # Create the enrollment
        enrollment_dict = {
            "user_id": user_id,
            "student_id": student_profile.id,
            "course_id": course_id,
            "program_id": program_id,
            "status": EnrollmentStatus.ACTIVE,
            "created_by": created_by,
            "updated_by": created_by,
            **(enrollment_data or {})
        }
        
        enrollment = CourseEnrollment(**enrollment_dict)
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        
        return enrollment
    
    def _create_student_profile_from_user(
        self, 
        db: Session, 
        user: User, 
        program_id: str, 
        created_by: str
    ) -> Student:
        """Create a student profile from user data."""
        from app.features.students.services.student_service import StudentService
        
        student_service = StudentService()
        
        # Generate student ID
        student_id = student_service._generate_student_id(db)
        
        # Create student profile with user data
        student_data = {
            "student_id": student_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "date_of_birth": user.date_of_birth.date() if user.date_of_birth else None,
            "program_id": program_id,
            "user_id": user.id,
            "enrollment_date": datetime.now().date(),
            "created_by": created_by,
            "updated_by": created_by
        }
        
        student = Student(**student_data)
        db.add(student)
        db.commit()
        db.refresh(student)
        
        return student
    
    def get_users_by_role(
        self, 
        db: Session, 
        role: str, 
        program_context: str = None,
        include_family: bool = False
    ) -> List[User]:
        """Get all users with a specific role, optionally filtered by program context."""
        query = db.query(User).filter(User.roles.any(role))
        
        if program_context:
            # Filter by program assignments or enrollments
            query = query.join(UserProgramAssignment, User.id == UserProgramAssignment.user_id).filter(
                UserProgramAssignment.program_id == program_context
            )
        
        users = query.all()
        
        if include_family:
            # Load family relationships for each user
            for user in users:
                user._family_structure = self.get_family_structure(db, user.id)
        
        return users
    
    def search_users(
        self,
        db: Session,
        search_params: Dict[str, Any],
        program_context: str = None,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[User], int]:
        """Search users with various filters."""
        query = db.query(User)
        
        # Apply filters
        if search_params.get("search"):
            search_term = f"%{search_params['search']}%"
            query = query.filter(
                or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    func.concat(User.first_name, ' ', User.last_name).ilike(search_term),
                    User.email.ilike(search_term),
                    User.username.ilike(search_term)
                )
            )
        
        if search_params.get("roles"):
            role_filters = search_params["roles"]
            if isinstance(role_filters, str):
                role_filters = [role_filters]
            
            # User must have at least one of the specified roles
            role_conditions = [User.roles.any(role) for role in role_filters]
            query = query.filter(or_(*role_conditions))
        
        if search_params.get("is_active") is not None:
            query = query.filter(User.is_active == search_params["is_active"])
        
        # Program context filtering
        if program_context:
            query = query.join(UserProgramAssignment, User.id == UserProgramAssignment.user_id).filter(
                UserProgramAssignment.program_id == program_context
            )
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        users = query.offset(offset).limit(per_page).all()
        
        return users, total_count
    
    def get_user_stats(self, db: Session, program_context: Optional[str] = None) -> Dict[str, Any]:
        """Get user statistics with optional program context filtering."""
        from datetime import datetime, timedelta
        from app.features.authentication.schemas.user_enhanced import UserStatsResponse
        
        # Base query
        query = db.query(User)
        
        # Apply program context filtering if provided
        if program_context:
            query = query.join(UserProgramAssignment, User.id == UserProgramAssignment.user_id).filter(
                UserProgramAssignment.program_id == program_context
            )
        
        # Total users
        total_users = query.count()
        
        # Active/inactive users
        active_users = query.filter(User.is_active == True).count()
        inactive_users = query.filter(User.is_active == False).count()
        
        # Users by role
        users_by_role = {}
        for role in UserRole:
            role_count = query.filter(User.roles.any(role.value)).count()
            if role_count > 0:
                users_by_role[role.value] = role_count
        
        # Recent registrations (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_registrations = query.filter(User.created_at >= thirty_days_ago).count()
        
        # Program assignment stats
        if program_context:
            # For specific program context
            users_with_assignments = total_users
            users_without_assignments = 0
            total_assignments = total_users
        else:
            # For all users
            users_with_assignments = db.query(User).join(
                UserProgramAssignment, User.id == UserProgramAssignment.user_id
            ).distinct().count()
            
            users_without_assignments = total_users - users_with_assignments
            total_assignments = db.query(UserProgramAssignment).count()
        
        # Average programs per user
        if total_users > 0:
            average_programs_per_user = total_assignments / total_users
        else:
            average_programs_per_user = 0.0
        
        return UserStatsResponse(
            total_users=total_users,
            active_users=active_users,
            inactive_users=inactive_users,
            users_by_role=users_by_role,
            recent_registrations=recent_registrations,
            users_with_program_assignments=users_with_assignments,
            users_without_program_assignments=users_without_assignments,
            total_program_assignments=total_assignments,
            average_programs_per_user=round(average_programs_per_user, 2)
        )


# Create singleton instance
user_service = UserService()