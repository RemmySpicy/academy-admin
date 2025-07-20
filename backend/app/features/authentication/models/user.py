"""
User model for authentication and authorization.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import Boolean, Column, DateTime, String, text, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import UserRole


class User(BaseModel):
    """
    User model for authentication and authorization.
    
    Represents a user of the Academy Admin system with:
    - Basic authentication information (username, email, password)
    - Role-based access control
    - Activity status tracking
    - Audit trail for all changes
    """
    
    __tablename__ = "users"
    
    # Authentication fields
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        comment="Unique username for login",
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        comment="User's email address (unique)",
    )
    
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password",
    )
    
    # Profile information
    full_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="User's full name",
    )
    
    # Authorization - Support multiple roles
    roles: Mapped[List[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=["program_admin"],
        comment="User roles array (can have multiple: super_admin, program_admin, program_coordinator, tutor, student, parent)",
    )
    
    # Keep legacy role field for backward compatibility
    primary_role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="program_admin",
        comment="Primary user role for backward compatibility",
    )
    
    # Status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether the user account is active",
    )
    
    # Optional profile fields
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last login timestamp",
    )
    
    # Additional profile fields for students/parents
    phone: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="User's phone number",
    )
    
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="User's date of birth",
    )
    
    profile_photo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to user's profile photo",
    )
    
    # Relationships
    program_assignments = relationship(
        "UserProgramAssignment",
        foreign_keys="UserProgramAssignment.user_id",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Parent-child relationships
    parent_relationships = relationship(
        "UserRelationship",
        foreign_keys="UserRelationship.parent_user_id",
        back_populates="parent_user",
        cascade="all, delete-orphan"
    )
    
    child_relationships = relationship(
        "UserRelationship",
        foreign_keys="UserRelationship.child_user_id",
        back_populates="child_user",
        cascade="all, delete-orphan"
    )
    
    # Course enrollments
    course_enrollments = relationship(
        "CourseEnrollment",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Student profile (if user is a student)
    student_profile = relationship(
        "Student",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Indexes for performance
    __table_args__ = (
        {"extend_existing": True}  # Allow extending existing table
    )
    
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return role in self.roles
    
    def add_role(self, role: str) -> None:
        """Add a role to the user."""
        if role not in self.roles:
            self.roles = self.roles + [role]
            # Update primary role if this is the first role
            if len(self.roles) == 1:
                self.primary_role = role
    
    def remove_role(self, role: str) -> None:
        """Remove a role from the user."""
        if role in self.roles:
            self.roles = [r for r in self.roles if r != role]
            # Update primary role if we removed it
            if self.primary_role == role and self.roles:
                self.primary_role = self.roles[0]
    
    def is_super_admin(self) -> bool:
        """Check if user is a super admin."""
        return UserRole.SUPER_ADMIN.value in self.roles
    
    def is_program_admin(self) -> bool:
        """Check if user is a program admin."""
        return UserRole.PROGRAM_ADMIN.value in self.roles
    
    def is_program_coordinator(self) -> bool:
        """Check if user is a program coordinator."""
        return UserRole.PROGRAM_COORDINATOR.value in self.roles
    
    def is_tutor(self) -> bool:
        """Check if user is a tutor."""
        return UserRole.TUTOR.value in self.roles
    
    def is_student(self) -> bool:
        """Check if user is a student."""
        return UserRole.STUDENT.value in self.roles
    
    def is_parent(self) -> bool:
        """Check if user is a parent/guardian."""
        return UserRole.PARENT.value in self.roles
    
    def has_admin_dashboard_access(self) -> bool:
        """Check if user has access to admin dashboard."""
        admin_roles = [UserRole.SUPER_ADMIN.value, UserRole.PROGRAM_ADMIN.value, 
                      UserRole.PROGRAM_COORDINATOR.value, UserRole.TUTOR.value]
        return any(role in self.roles for role in admin_roles)
    
    def has_mobile_app_access(self) -> bool:
        """Check if user has access to mobile applications."""
        mobile_roles = [UserRole.TUTOR.value, UserRole.PROGRAM_COORDINATOR.value, 
                       UserRole.STUDENT.value, UserRole.PARENT.value]
        return any(role in self.roles for role in mobile_roles)
    
    def get_children(self) -> List['User']:
        """Get all children for this user (if they are a parent)."""
        return [rel.child_user for rel in self.parent_relationships if rel.is_active]
    
    def get_parents(self) -> List['User']:
        """Get all parents for this user (if they are a child)."""
        return [rel.parent_user for rel in self.child_relationships if rel.is_active]
    
    def get_active_enrollments(self) -> List['CourseEnrollment']:
        """Get all active course enrollments for this user."""
        from app.features.common.models.enums import EnrollmentStatus
        return [enrollment for enrollment in self.course_enrollments 
                if enrollment.status == EnrollmentStatus.ACTIVE]
    
    def can_access(self, resource: str) -> bool:
        """Check if user can access a resource based on role."""
        if not self.is_active:
            return False
            
        # Super admin can access everything
        if self.is_super_admin():
            return True
            
        # Program admin can access program-specific resources
        if self.is_program_admin():
            return resource not in ["system_management", "programs_management"]
            
        # Program coordinators and tutors have limited dashboard access
        if self.is_program_coordinator() or self.is_tutor():
            return resource in ["student_management", "course_management", "communication"]
            
        # Students can only access their own data
        if self.is_student():
            return resource in ["student_profile", "student_progress", "student_communications"]
            
        # Parents can access their children's data
        if self.is_parent():
            return resource in ["children_progress", "parent_communications", "parent_conferences"]
            
        return False
    
    def __repr__(self) -> str:
        """String representation of the user."""
        roles_str = ', '.join(self.roles)
        return f"<User(id={self.id}, username='{self.username}', roles=[{roles_str}])>"