"""
User model for authentication and authorization.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, String, text
from sqlalchemy.orm import Mapped, mapped_column

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
        default="user",
        comment="User role (admin, manager, user)",
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
    
    # Indexes for performance
    __table_args__ = (
        {"extend_existing": True}  # Allow extending existing table
    )
    
    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return self.role == role
    
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == "admin"
    
    def is_manager(self) -> bool:
        """Check if user is a manager."""
        return self.role in ["admin", "manager"]
    
    def can_access(self, resource: str) -> bool:
        """Check if user can access a resource based on role."""
        if not self.is_active:
            return False
            
        # Admin can access everything
        if self.is_admin():
            return True
            
        # Manager can access most things
        if self.is_manager():
            return resource not in ["user_management", "system_settings"]
            
        # Regular users have limited access
        return resource in ["dashboard", "profile", "students_view"]
    
    def __repr__(self) -> str:
        """String representation of the user."""
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"