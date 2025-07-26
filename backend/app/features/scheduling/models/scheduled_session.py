"""
Scheduled session model for managing facility-based scheduling.
"""

from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal

from sqlalchemy import (
    ForeignKey, String, DateTime, Date, Text, Integer, 
    Numeric, Boolean, JSON, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import (
    SessionStatus, SessionType, RecurringPattern
)


class ScheduledSession(BaseModel):
    """
    Model for managing scheduled sessions within facilities.
    
    Facility-centric scheduling where each session is tied to a specific facility
    and program context. Supports all original requirements including participant
    management, recurring sessions, and notification systems.
    
    Key features:
    - Facility-specific scheduling
    - Program context filtering
    - Recurring session support with exceptions
    - Participant enrollment and waitlist management
    - Instructor assignment with availability checking
    - Comprehensive notification system
    - Bulk operations support
    """
    
    __tablename__ = "scheduled_sessions"
    
    # Core relationships
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        comment="ID of the program this session belongs to",
    )
    
    facility_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("facilities.id"),
        nullable=False,
        comment="ID of the facility where session takes place",
    )
    
    course_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("courses.id"),
        nullable=True,
        comment="Optional course this session is part of",
    )
    
    # Session information
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Session title/name",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed session description",
    )
    
    session_type: Mapped[SessionType] = mapped_column(
        default=SessionType.GROUP,
        nullable=False,
        comment="Type of session (private: 1-2, group: 3-5, school_group: unlimited)",
    )
    
    # Scheduling details
    start_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        comment="Session start date and time",
    )
    
    end_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        comment="Session end date and time",
    )
    
    # Recurring session support
    recurring_pattern: Mapped[RecurringPattern] = mapped_column(
        default=RecurringPattern.NONE,
        nullable=False,
        comment="Recurring pattern for the session",
    )
    
    recurring_config: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON configuration for recurring pattern (days, intervals, etc.)",
    )
    
    recurring_parent_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("scheduled_sessions.id"),
        nullable=True,
        comment="Parent session ID for recurring sessions",
    )
    
    recurring_exceptions: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON list of exception dates for recurring sessions",
    )
    
    # Session status and management
    status: Mapped[SessionStatus] = mapped_column(
        default=SessionStatus.SCHEDULED,
        nullable=False,
        comment="Current session status",
    )
    
    # Participant management
    max_participants: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum number of participants allowed",
    )
    
    # Student type and skill level (from original requirements)
    student_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Target student type (Adult, Children)",
    )
    
    skill_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Required skill level (Beginner, Intermediate, Advanced)",
    )
    
    # Additional session details
    special_requirements: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special requirements or accommodations needed",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes about the session",
    )
    
    # Notification tracking
    notification_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether notifications have been sent for this session",
    )
    
    last_notification_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="Last time notifications were sent",
    )
    
    # Cancellation information
    cancellation_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for cancellation if applicable",
    )
    
    cancelled_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="User who cancelled the session",
    )
    
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the session was cancelled",
    )
    
    # Relationships
    program = relationship("Program")
    facility = relationship("Facility")
    course = relationship("Course")
    cancelled_by = relationship("User", foreign_keys=[cancelled_by_user_id])
    
    # Self-referencing relationship for recurring sessions
    recurring_parent = relationship(
        "ScheduledSession", 
        remote_side="ScheduledSession.id",
        back_populates="recurring_children"
    )
    recurring_children = relationship(
        "ScheduledSession",
        back_populates="recurring_parent"
    )
    
    # Related models
    participants = relationship("SessionParticipant", back_populates="session")
    instructor_assignments = relationship("SessionInstructor", back_populates="session")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_scheduled_sessions_program", "program_id"),
        Index("idx_scheduled_sessions_facility", "facility_id"),
        Index("idx_scheduled_sessions_course", "course_id"),
        Index("idx_scheduled_sessions_start_time", "start_time"),
        Index("idx_scheduled_sessions_status", "status"),
        Index("idx_scheduled_sessions_recurring_parent", "recurring_parent_id"),
        Index("idx_scheduled_sessions_facility_time", "facility_id", "start_time"),
        Index("idx_scheduled_sessions_program_facility", "program_id", "facility_id"),
        Index("idx_scheduled_sessions_active", "status", "start_time"),
    )
    
    def __repr__(self) -> str:
        """String representation of the session."""
        return (f"<ScheduledSession("
                f"title='{self.title}', "
                f"facility_id='{self.facility_id}', "
                f"start_time='{self.start_time}', "
                f"status='{self.status.value}')>")
    
    @property
    def is_recurring(self) -> bool:
        """Check if this is a recurring session."""
        return self.recurring_pattern != RecurringPattern.NONE
    
    @property
    def is_active(self) -> bool:
        """Check if the session is currently active."""
        return self.status in [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]
    
    @property
    def is_completed(self) -> bool:
        """Check if the session has been completed."""
        return self.status == SessionStatus.COMPLETED
    
    @property
    def is_cancelled(self) -> bool:
        """Check if the session has been cancelled."""
        return self.status == SessionStatus.CANCELLED
    
    @property
    def duration_minutes(self) -> int:
        """Calculate session duration in minutes."""
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return 0
    
    @property
    def enrolled_count(self) -> int:
        """Get count of enrolled participants."""
        return len([p for p in self.participants if p.is_enrolled])
    
    @property
    def waitlist_count(self) -> int:
        """Get count of waitlisted participants."""
        return len([p for p in self.participants if p.is_waitlisted])
    
    @property
    def available_spots(self) -> Optional[int]:
        """Calculate available spots if max_participants is set."""
        if self.max_participants is not None:
            return max(0, self.max_participants - self.enrolled_count)
        return None
    
    @property
    def is_full(self) -> bool:
        """Check if session is at capacity."""
        if self.max_participants is not None:
            return self.enrolled_count >= self.max_participants
        return False
    
    def can_enroll_participant(self) -> bool:
        """Check if new participants can be enrolled."""
        return (
            self.is_active and 
            not self.is_full and 
            self.start_time > datetime.utcnow()
        )
    
    def get_instructor_names(self) -> List[str]:
        """Get list of assigned instructor names."""
        return [assignment.instructor.full_name for assignment in self.instructor_assignments]
    
    def has_conflicts_with(self, other_session: 'ScheduledSession') -> bool:
        """Check if this session conflicts with another session."""
        if self.facility_id != other_session.facility_id:
            return False
        
        # Check time overlap
        return (
            self.start_time < other_session.end_time and
            self.end_time > other_session.start_time
        )