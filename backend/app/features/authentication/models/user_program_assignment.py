"""
User Program Assignment model for managing user access to programs.
"""

from typing import Optional
from sqlalchemy import Boolean, DateTime, String, ForeignKey, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.features.common.models.database import Base


class UserProgramAssignment(Base):
    """
    User Program Assignment model for managing which programs users have access to.
    
    This model handles the many-to-many relationship between users and programs,
    with additional metadata about the assignment.
    """
    
    __tablename__ = "user_program_assignments"
    
    # Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        server_default=text("gen_random_uuid()::text"),
        nullable=False,
    )
    
    # Foreign Keys
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to user"
    )
    
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to program"
    )
    
    # Assignment metadata
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this is the user's default program"
    )
    
    assigned_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="When the assignment was created"
    )
    
    assigned_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="User who made this assignment"
    )
    
    # Timestamps
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="When the record was created"
    )
    
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="When the record was last updated"
    )
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="user_program_assignments")
    program = relationship("Program", back_populates="user_assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_user_program_assignments_user_id", "user_id"),
        Index("idx_user_program_assignments_program_id", "program_id"),
        Index("idx_user_program_assignments_user_program", "user_id", "program_id", unique=True),
        Index("idx_user_program_assignments_default", "user_id", "is_default"),
    )
    
    def __repr__(self) -> str:
        """String representation of the user program assignment."""
        return f"<UserProgramAssignment(user_id={self.user_id}, program_id={self.program_id}, is_default={self.is_default})>"