"""
User model for authentication and authorization.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


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
    
    # Authorization
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="program_admin",
        comment="User role (super_admin, program_admin, program_coordinator, tutor)",
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
    
    # Relationships
    program_assignments = relationship(
        "UserProgramAssignment",
        foreign_keys="UserProgramAssignment.user_id",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Indexes for performance
    __table_args__ = (
        {"extend_existing": True}  # Allow extending existing table
    )
    
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return self.role == role
    
    def is_super_admin(self) -> bool:
        """Check if user is a super admin."""
        return self.role == "super_admin"
    
    def is_program_admin(self) -> bool:
        """Check if user is a program admin."""
        return self.role == "program_admin"
    
    def is_program_coordinator(self) -> bool:
        """Check if user is a program coordinator."""
        return self.role == "program_coordinator"
    
    def is_tutor(self) -> bool:
        """Check if user is a tutor."""
        return self.role == "tutor"
    
    def has_admin_dashboard_access(self) -> bool:
        """Check if user has access to admin dashboard."""
        return self.role in ["super_admin", "program_admin"]
    
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
            
        # Program coordinators and tutors have limited access (future implementation)
        return False
    
    def __repr__(self) -> str:
        """String representation of the user."""
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"