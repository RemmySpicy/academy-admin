"""
Session instructor model for managing instructor assignments to scheduled sessions.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    ForeignKey, String, DateTime, Text, Boolean, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


class SessionInstructor(BaseModel):
    """
    Model for managing instructor assignments to scheduled sessions.
    
    Handles instructor-session relationships including assignment tracking,
    availability validation, and assignment history. Supports multiple 
    instructors per session and tracks assignment changes.
    """
    
    __tablename__ = "session_instructors"
    
    # Core relationships
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("scheduled_sessions.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the scheduled session",
    )
    
    instructor_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the assigned instructor (must be user with tutor role)",
    )
    
    # Assignment details
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="When the instructor was assigned",
    )
    
    assigned_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="User who made the assignment",
    )
    
    # Assignment status
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this is the primary instructor for the session",
    )
    
    is_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether the instructor has confirmed availability",
    )
    
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the instructor confirmed availability",
    )
    
    # Assignment notes
    assignment_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes about the instructor assignment",
    )
    
    special_instructions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special instructions for the instructor",
    )
    
    # Removal tracking
    removed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the instructor was removed from the session",
    )
    
    removed_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="User who removed the instructor",
    )
    
    removal_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for removing the instructor",
    )
    
    # Relationships
    session = relationship("ScheduledSession", back_populates="instructor_assignments")
    instructor = relationship("User", foreign_keys=[instructor_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_user_id])
    removed_by = relationship("User", foreign_keys=[removed_by_user_id])
    
    # Indexes and constraints
    __table_args__ = (
        Index("idx_session_instructors_session", "session_id"),
        Index("idx_session_instructors_instructor", "instructor_id"),
        Index("idx_session_instructors_primary", "is_primary"),
        Index("idx_session_instructors_confirmed", "is_confirmed"),
        Index("idx_session_instructors_active", "removed_at"),
        Index("idx_session_instructors_session_instructor", "session_id", "instructor_id"),
        Index("idx_session_instructors_instructor_time", "instructor_id", "assigned_at"),
    )
    
    def __repr__(self) -> str:
        """String representation of the assignment."""
        return (f"<SessionInstructor("
                f"session_id='{self.session_id}', "
                f"instructor_id='{self.instructor_id}', "
                f"is_primary={self.is_primary})>")
    
    @property
    def is_active(self) -> bool:
        """Check if assignment is currently active."""
        return self.removed_at is None
    
    @property
    def is_removed(self) -> bool:
        """Check if instructor has been removed."""
        return self.removed_at is not None
    
    def confirm_assignment(self) -> None:
        """Confirm the instructor assignment."""
        self.is_confirmed = True
        self.confirmed_at = datetime.utcnow()
    
    def remove_assignment(self, reason: Optional[str] = None, removed_by_user_id: Optional[str] = None) -> None:
        """Remove the instructor from the session."""
        self.removed_at = datetime.utcnow()
        self.removal_reason = reason
        self.removed_by_user_id = removed_by_user_id
    
    def make_primary(self) -> None:
        """Make this instructor the primary instructor."""
        self.is_primary = True
    
    def make_secondary(self) -> None:
        """Make this instructor a secondary instructor."""
        self.is_primary = False