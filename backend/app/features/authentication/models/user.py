"""
User model for authentication and authorization.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import Boolean, Column, DateTime, String, text, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import UserRole, ProfileType


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
    
    # Authentication fields (nullable for child profiles)
    username: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        nullable=True,
        comment="Unique username for login (null for child profiles)",
    )
    
    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
        comment="User's email address (null for child profiles)",
    )
    
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Bcrypt hashed password (null for child profiles)",
    )
    
    # Profile type to distinguish between full users and child profiles
    profile_type: Mapped[ProfileType] = mapped_column(
        nullable=False,
        default=ProfileType.FULL_USER,
        comment="Type of profile (full_user or profile_only)",
    )
    
    # Profile information
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="User's first name",
    )
    
    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="User's last name",
    )
    
    @property
    def full_name(self) -> str:
        """Get user's full name by combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()
    
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
    salutation: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
        comment="User's salutation (Mr., Ms., Dr., etc.)",
    )
    
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
    
    referral_source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="How the user heard about the academy",
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
    
    # Organization memberships
    organization_memberships = relationship(
        "OrganizationMembership",
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
    
    def is_instructor(self) -> bool:
        """Check if user is an instructor."""
        return UserRole.INSTRUCTOR.value in self.roles
    
    def is_student(self) -> bool:
        """Check if user is a student."""
        return UserRole.STUDENT.value in self.roles
    
    def is_parent(self) -> bool:
        """Check if user is a parent/guardian."""
        return UserRole.PARENT.value in self.roles
    
    def has_admin_dashboard_access(self) -> bool:
        """Check if user has access to admin dashboard."""
        admin_roles = [UserRole.SUPER_ADMIN.value, UserRole.PROGRAM_ADMIN.value, 
                      UserRole.PROGRAM_COORDINATOR.value, UserRole.INSTRUCTOR.value]
        return any(role in self.roles for role in admin_roles)
    
    def has_mobile_app_access(self) -> bool:
        """Check if user has access to mobile applications."""
        mobile_roles = [UserRole.INSTRUCTOR.value, UserRole.PROGRAM_COORDINATOR.value, 
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
            
        # Program coordinators and instructors have limited dashboard access
        if self.is_program_coordinator() or self.is_instructor():
            return resource in ["student_management", "course_management", "communication"]
            
        # Students can only access their own data
        if self.is_student():
            return resource in ["student_profile", "student_progress", "student_communications"]
            
        # Parents can access their children's data
        if self.is_parent():
            return resource in ["children_progress", "parent_communications", "parent_conferences"]
            
        return False
    
    # Profile Type Methods
    
    def is_full_user(self) -> bool:
        """Check if this is a full user account with login credentials."""
        return self.profile_type == ProfileType.FULL_USER
    
    def is_profile_only(self) -> bool:
        """Check if this is a profile-only account (child profile)."""
        return self.profile_type == ProfileType.PROFILE_ONLY
    
    def can_login(self) -> bool:
        """Check if user can log in (has credentials)."""
        return (self.is_full_user() and 
                self.username is not None and 
                self.email is not None and 
                self.password_hash is not None)
    
    def upgrade_to_full_user(self, username: str, email: str, password_hash: str) -> None:
        """Upgrade a profile-only account to a full user account."""
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.profile_type = ProfileType.FULL_USER
    
    # Organization Methods
    
    def get_active_organization_memberships(self) -> List['OrganizationMembership']:
        """Get all active organization memberships."""
        return [membership for membership in self.organization_memberships 
                if membership.is_active and membership.is_current()]
    
    def get_organization_membership(self, organization_id: str, program_id: str) -> Optional['OrganizationMembership']:
        """Get specific organization membership."""
        for membership in self.organization_memberships:
            if (membership.organization_id == organization_id and 
                membership.program_id == program_id and 
                membership.is_active):
                return membership
        return None
    
    def is_organization_member(self, organization_id: str, program_id: Optional[str] = None) -> bool:
        """Check if user is a member of an organization."""
        for membership in self.get_active_organization_memberships():
            if membership.organization_id == organization_id:
                if program_id is None or membership.program_id == program_id:
                    return True
        return False
    
    def is_sponsored_student(self, program_id: Optional[str] = None) -> bool:
        """Check if user has sponsored membership in any or specific program."""
        for membership in self.get_active_organization_memberships():
            if membership.is_sponsored:
                if program_id is None or membership.program_id == program_id:
                    return True
        return False
    
    def get_sponsor_organizations(self, program_id: Optional[str] = None) -> List['Organization']:
        """Get organizations that sponsor this user."""
        organizations = []
        for membership in self.get_active_organization_memberships():
            if membership.is_sponsored:
                if program_id is None or membership.program_id == program_id:
                    organizations.append(membership.organization)
        return organizations
    
    def has_payment_bypass(self, program_id: str, course_id: Optional[str] = None) -> bool:
        """Check if user has payment bypass through organization membership."""
        for membership in self.get_active_organization_memberships():
            if (membership.program_id == program_id and 
                membership.has_payment_bypass(course_id)):
                return True
        return False
    
    def get_custom_pricing(self, program_id: str, course_id: Optional[str] = None) -> Optional[float]:
        """Get custom pricing through organization membership."""
        for membership in self.get_active_organization_memberships():
            if membership.program_id == program_id:
                custom_price = membership.get_custom_price(course_id)
                if custom_price is not None:
                    return custom_price
        return None
    
    def __repr__(self) -> str:
        """String representation of the user."""
        roles_str = ', '.join(self.roles)
        username_display = self.username or self.email or f"{self.first_name} {self.last_name}"
        return f"<User(id={self.id}, username='{username_display}', roles=[{roles_str}], profile_type='{self.profile_type.value}')>"