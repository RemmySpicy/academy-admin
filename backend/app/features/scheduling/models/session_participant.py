"""
Session participant model for managing student enrollment in scheduled sessions.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    ForeignKey, String, DateTime, Text, Integer, Boolean, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import (
    ParticipantStatus, AttendanceStatus
)


class SessionParticipant(BaseModel):
    """
    Model for managing student participation in scheduled sessions.
    
    Handles participant enrollment, waitlist management, and attendance tracking.
    Supports all original requirements for participant management including
    add/remove operations and notification preferences.
    """
    
    __tablename__ = "session_participants"
    
    # Core relationships
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("scheduled_sessions.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the scheduled session",
    )
    
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the participating student",
    )
    
    # Enrollment details
    enrollment_status: Mapped[ParticipantStatus] = mapped_column(
        default=ParticipantStatus.ENROLLED,
        nullable=False,
        comment="Current participation status",
    )
    
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        comment="When the student was enrolled in the session",
    )
    
    enrolled_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="User who enrolled the student",
    )
    
    # Waitlist management
    waitlist_position: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Position in waitlist if applicable",
    )
    
    waitlisted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the student was added to waitlist",
    )
    
    # Attendance tracking
    attendance_status: Mapped[Optional[AttendanceStatus]] = mapped_column(
        nullable=True,
        comment="Attendance status for completed sessions",
    )
    
    check_in_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the student checked in",
    )
    
    check_out_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the student checked out",
    )
    
    # Participant notes and communication
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes about the participant for this session",
    )
    
    special_requirements: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special requirements for this participant",
    )
    
    # Notification preferences and tracking
    parent_notification_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether parent notification has been sent",
    )
    
    parent_notification_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When parent notification was sent",
    )
    
    # Cancellation tracking
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When participation was cancelled",
    )
    
    cancelled_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="User who cancelled the participation",
    )
    
    cancellation_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for cancellation",
    )
    
    # Relationships
    session = relationship("ScheduledSession", back_populates="participants")
    student = relationship("Student")
    enrolled_by = relationship("User", foreign_keys=[enrolled_by_user_id])
    cancelled_by = relationship("User", foreign_keys=[cancelled_by_user_id])
    
    # Indexes and constraints
    __table_args__ = (
        Index("idx_session_participants_session", "session_id"),
        Index("idx_session_participants_student", "student_id"),
        Index("idx_session_participants_status", "enrollment_status"),
        Index("idx_session_participants_waitlist", "waitlist_position"),
        Index("idx_session_participants_attendance", "attendance_status"),
        Index("idx_session_participants_session_student", "session_id", "student_id", unique=True),
        Index("idx_session_participants_enrolled", "enrollment_status", "enrolled_at"),
    )
    
    def __repr__(self) -> str:
        """String representation of the participant."""
        return (f"<SessionParticipant("
                f"session_id='{self.session_id}', "
                f"student_id='{self.student_id}', "
                f"status='{self.enrollment_status.value}')>")
    
    @property
    def is_enrolled(self) -> bool:
        """Check if participant is enrolled."""
        return self.enrollment_status in [
            ParticipantStatus.ENROLLED, 
            ParticipantStatus.CONFIRMED
        ]
    
    @property
    def is_waitlisted(self) -> bool:
        """Check if participant is on waitlist."""
        return self.enrollment_status == ParticipantStatus.WAITLISTED
    
    @property
    def is_cancelled(self) -> bool:
        """Check if participation is cancelled."""
        return self.enrollment_status == ParticipantStatus.CANCELLED
    
    @property
    def is_present(self) -> bool:
        """Check if participant was present."""
        return self.attendance_status == AttendanceStatus.PRESENT
    
    @property
    def is_absent(self) -> bool:
        """Check if participant was absent."""
        return self.attendance_status == AttendanceStatus.ABSENT
    
    @property
    def is_no_show(self) -> bool:
        """Check if participant was a no-show."""
        return self.enrollment_status == ParticipantStatus.NO_SHOW
    
    @property
    def session_duration_minutes(self) -> Optional[int]:
        """Calculate actual attendance duration if checked in/out."""
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            return int(delta.total_seconds() / 60)
        return None
    
    def can_be_promoted_from_waitlist(self) -> bool:
        """Check if participant can be promoted from waitlist."""
        return (
            self.is_waitlisted and 
            self.session and 
            self.session.can_enroll_participant()
        )
    
    def promote_from_waitlist(self) -> bool:
        """Promote participant from waitlist to enrolled."""
        if self.can_be_promoted_from_waitlist():
            self.enrollment_status = ParticipantStatus.ENROLLED
            self.waitlist_position = None
            self.waitlisted_at = None
            return True
        return False
    
    def mark_attendance(self, status: AttendanceStatus, notes: Optional[str] = None) -> None:
        """Mark attendance for the participant."""
        self.attendance_status = status
        if notes:
            self.notes = notes if not self.notes else f"{self.notes}\n{notes}"
    
    def check_in(self) -> None:
        """Check in the participant."""
        self.check_in_time = datetime.utcnow()
        if self.enrollment_status == ParticipantStatus.ENROLLED:
            self.enrollment_status = ParticipantStatus.CONFIRMED
    
    def check_out(self) -> None:
        """Check out the participant."""
        self.check_out_time = datetime.utcnow()
        if not self.attendance_status:
            self.attendance_status = AttendanceStatus.PRESENT
    
    def cancel_participation(self, reason: Optional[str] = None, cancelled_by_user_id: Optional[str] = None) -> None:
        """Cancel participant's enrollment."""
        self.enrollment_status = ParticipantStatus.CANCELLED
        self.cancelled_at = datetime.utcnow()
        self.cancellation_reason = reason
        self.cancelled_by_user_id = cancelled_by_user_id