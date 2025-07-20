"""
Instructor availability model for managing instructor scheduling preferences and constraints.
"""

from datetime import datetime, time
from typing import Optional

from sqlalchemy import (
    ForeignKey, String, DateTime, Time, Text, Integer, Boolean, JSON, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


class InstructorAvailability(BaseModel):
    """
    Model for managing instructor availability within facilities and programs.
    
    Tracks when instructors are available for sessions, including regular
    availability patterns and one-time exceptions. Supports facility-specific
    availability and program context filtering.
    """
    
    __tablename__ = "instructor_availability"
    
    # Core relationships
    instructor_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the instructor",
    )
    
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        comment="ID of the program this availability applies to",
    )
    
    facility_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("facilities.id"),
        nullable=True,
        comment="Optional facility-specific availability",
    )
    
    # Availability schedule
    day_of_week: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Day of week (0=Monday, 6=Sunday) for recurring availability",
    )
    
    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
        comment="Start time of availability",
    )
    
    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
        comment="End time of availability",
    )
    
    # Availability type and configuration
    is_recurring: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this is a recurring availability pattern",
    )
    
    specific_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="Specific date for one-time availability (overrides recurring)",
    )
    
    # Capacity and constraints
    max_concurrent_sessions: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Maximum sessions the instructor can handle simultaneously",
    )
    
    preferred_session_types: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON list of preferred session types",
    )
    
    # Availability status
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this availability is currently active",
    )
    
    # Exception handling
    is_exception: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this is an exception to regular availability",
    )
    
    exception_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for availability exception",
    )
    
    # Validity period
    valid_from: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="Start date for this availability pattern",
    )
    
    valid_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="End date for this availability pattern",
    )
    
    # Additional information
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes about availability",
    )
    
    # Tracking fields
    created_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="User who created this availability record",
    )
    
    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    program = relationship("Program")
    facility = relationship("Facility")
    created_by = relationship("User", foreign_keys=[created_by_user_id])
    
    # Indexes and constraints
    __table_args__ = (
        Index("idx_instructor_availability_instructor", "instructor_id"),
        Index("idx_instructor_availability_program", "program_id"),
        Index("idx_instructor_availability_facility", "facility_id"),
        Index("idx_instructor_availability_day", "day_of_week"),
        Index("idx_instructor_availability_active", "is_active"),
        Index("idx_instructor_availability_recurring", "is_recurring"),
        Index("idx_instructor_availability_date", "specific_date"),
        Index("idx_instructor_availability_instructor_program", "instructor_id", "program_id"),
        Index("idx_instructor_availability_instructor_facility", "instructor_id", "facility_id"),
        Index("idx_instructor_availability_time_range", "start_time", "end_time"),
    )
    
    def __repr__(self) -> str:
        """String representation of the availability."""
        day_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][self.day_of_week] if self.day_of_week is not None else "Specific"
        return (f"<InstructorAvailability("
                f"instructor_id='{self.instructor_id}', "
                f"day='{day_name}', "
                f"time='{self.start_time}-{self.end_time}')>")
    
    @property
    def duration_hours(self) -> float:
        """Calculate availability duration in hours."""
        start_seconds = self.start_time.hour * 3600 + self.start_time.minute * 60 + self.start_time.second
        end_seconds = self.end_time.hour * 3600 + self.end_time.minute * 60 + self.end_time.second
        
        # Handle overnight availability
        if end_seconds < start_seconds:
            end_seconds += 24 * 3600
        
        return (end_seconds - start_seconds) / 3600
    
    @property
    def is_valid_now(self) -> bool:
        """Check if availability is valid for current time."""
        now = datetime.utcnow()
        
        if self.valid_from and now < self.valid_from:
            return False
        
        if self.valid_until and now > self.valid_until:
            return False
        
        return self.is_active
    
    def conflicts_with_time(self, start_time: time, end_time: time) -> bool:
        """Check if this availability conflicts with given time range."""
        return (
            self.start_time < end_time and
            self.end_time > start_time
        )
    
    def covers_time_range(self, start_time: time, end_time: time) -> bool:
        """Check if this availability covers the entire time range."""
        return (
            self.start_time <= start_time and
            self.end_time >= end_time
        )
    
    def is_available_on_date(self, target_date: datetime) -> bool:
        """Check if instructor is available on specific date."""
        if not self.is_valid_now:
            return False
        
        if self.specific_date:
            # One-time availability
            return self.specific_date.date() == target_date.date()
        
        if self.is_recurring and self.day_of_week is not None:
            # Recurring availability
            return target_date.weekday() == self.day_of_week
        
        return False
    
    def deactivate(self, reason: Optional[str] = None) -> None:
        """Deactivate this availability."""
        self.is_active = False
        if reason:
            self.notes = reason if not self.notes else f"{self.notes}\nDeactivated: {reason}"
    
    def create_exception(self, date: datetime, reason: str) -> 'InstructorAvailability':
        """Create an exception to this availability for a specific date."""
        return InstructorAvailability(
            instructor_id=self.instructor_id,
            program_id=self.program_id,
            facility_id=self.facility_id,
            start_time=self.start_time,
            end_time=self.end_time,
            is_recurring=False,
            specific_date=date,
            is_active=False,  # Exception means not available
            is_exception=True,
            exception_reason=reason,
            max_concurrent_sessions=0
        )