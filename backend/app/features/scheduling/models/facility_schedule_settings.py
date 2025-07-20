"""
Facility schedule settings model for managing per-facility scheduling configuration.
"""

from datetime import time
from typing import Optional

from sqlalchemy import (
    ForeignKey, String, Time, Text, Integer, Boolean, JSON, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


class FacilityScheduleSettings(BaseModel):
    """
    Model for managing facility-specific scheduling settings and configuration.
    
    Each facility can have its own scheduling rules, operating hours,
    booking policies, and capacity constraints. This enables facility-centric
    scheduling with different rules per location.
    """
    
    __tablename__ = "facility_schedule_settings"
    
    # Core relationships
    facility_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("facilities.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="ID of the facility these settings apply to",
    )
    
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        comment="ID of the program managing this facility",
    )
    
    # Operating hours
    monday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Monday opening time",
    )
    
    monday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Monday closing time",
    )
    
    tuesday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Tuesday opening time",
    )
    
    tuesday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Tuesday closing time",
    )
    
    wednesday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Wednesday opening time",
    )
    
    wednesday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Wednesday closing time",
    )
    
    thursday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Thursday opening time",
    )
    
    thursday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Thursday closing time",
    )
    
    friday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Friday opening time",
    )
    
    friday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Friday closing time",
    )
    
    saturday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Saturday opening time",
    )
    
    saturday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Saturday closing time",
    )
    
    sunday_open: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Sunday opening time",
    )
    
    sunday_close: Mapped[Optional[time]] = mapped_column(
        Time,
        nullable=True,
        comment="Sunday closing time",
    )
    
    # Booking and scheduling policies
    booking_advance_days: Mapped[int] = mapped_column(
        Integer,
        default=30,
        nullable=False,
        comment="Maximum days in advance sessions can be booked",
    )
    
    booking_cutoff_hours: Mapped[int] = mapped_column(
        Integer,
        default=24,
        nullable=False,
        comment="Hours before session when booking closes",
    )
    
    cancellation_cutoff_hours: Mapped[int] = mapped_column(
        Integer,
        default=24,
        nullable=False,
        comment="Hours before session when cancellation is allowed",
    )
    
    # Session management
    max_sessions_per_day: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum sessions allowed per day",
    )
    
    max_concurrent_sessions: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Maximum concurrent sessions in the facility",
    )
    
    cleanup_time_minutes: Mapped[int] = mapped_column(
        Integer,
        default=15,
        nullable=False,
        comment="Required cleanup time between sessions (minutes)",
    )
    
    setup_time_minutes: Mapped[int] = mapped_column(
        Integer,
        default=15,
        nullable=False,
        comment="Required setup time before sessions (minutes)",
    )
    
    # Capacity and participant limits
    default_max_participants: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Default maximum participants for sessions",
    )
    
    participant_limits_by_type: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON object with participant limits by session type",
    )
    
    # Notification and communication settings
    auto_send_notifications: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether to automatically send notifications for changes",
    )
    
    notification_lead_time_hours: Mapped[int] = mapped_column(
        Integer,
        default=24,
        nullable=False,
        comment="Hours before session to send reminder notifications",
    )
    
    # Special facility configuration
    requires_equipment_setup: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether sessions require special equipment setup",
    )
    
    equipment_setup_time_minutes: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Additional time needed for equipment setup",
    )
    
    special_requirements: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special requirements or notes for the facility",
    )
    
    # Holiday and closure management
    holiday_schedule: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON object with facility closure dates and holiday schedules",
    )
    
    # Emergency and maintenance
    emergency_contact_info: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Emergency contact information for the facility",
    )
    
    maintenance_schedule: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON object with regular maintenance schedules",
    )
    
    # Settings metadata
    settings_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes about facility scheduling settings",
    )
    
    # Relationships
    facility = relationship("Facility")
    program = relationship("Program")
    
    # Indexes
    __table_args__ = (
        Index("idx_facility_schedule_settings_facility", "facility_id"),
        Index("idx_facility_schedule_settings_program", "program_id"),
    )
    
    def __repr__(self) -> str:
        """String representation of the settings."""
        return (f"<FacilityScheduleSettings("
                f"facility_id='{self.facility_id}', "
                f"max_concurrent={self.max_concurrent_sessions})>")
    
    def get_operating_hours(self, day_of_week: int) -> tuple[Optional[time], Optional[time]]:
        """Get operating hours for a specific day (0=Monday, 6=Sunday)."""
        day_mapping = {
            0: (self.monday_open, self.monday_close),
            1: (self.tuesday_open, self.tuesday_close),
            2: (self.wednesday_open, self.wednesday_close),
            3: (self.thursday_open, self.thursday_close),
            4: (self.friday_open, self.friday_close),
            5: (self.saturday_open, self.saturday_close),
            6: (self.sunday_open, self.sunday_close),
        }
        return day_mapping.get(day_of_week, (None, None))
    
    def is_open_on_day(self, day_of_week: int) -> bool:
        """Check if facility is open on a specific day."""
        open_time, close_time = self.get_operating_hours(day_of_week)
        return open_time is not None and close_time is not None
    
    def get_participant_limit(self, session_type: str) -> Optional[int]:
        """Get participant limit for a specific session type."""
        if self.participant_limits_by_type and session_type in self.participant_limits_by_type:
            return self.participant_limits_by_type[session_type]
        return self.default_max_participants
    
    def is_time_within_operating_hours(self, day_of_week: int, session_time: time) -> bool:
        """Check if a time is within operating hours for a day."""
        open_time, close_time = self.get_operating_hours(day_of_week)
        
        if not open_time or not close_time:
            return False
        
        return open_time <= session_time <= close_time
    
    def get_total_buffer_time_minutes(self) -> int:
        """Get total buffer time needed between sessions."""
        total = self.cleanup_time_minutes + self.setup_time_minutes
        if self.requires_equipment_setup:
            total += self.equipment_setup_time_minutes
        return total
    
    def set_operating_hours_for_day(self, day_of_week: int, open_time: Optional[time], close_time: Optional[time]) -> None:
        """Set operating hours for a specific day."""
        day_mapping = {
            0: ("monday_open", "monday_close"),
            1: ("tuesday_open", "tuesday_close"),
            2: ("wednesday_open", "wednesday_close"),
            3: ("thursday_open", "thursday_close"),
            4: ("friday_open", "friday_close"),
            5: ("saturday_open", "saturday_close"),
            6: ("sunday_open", "sunday_close"),
        }
        
        if day_of_week in day_mapping:
            open_attr, close_attr = day_mapping[day_of_week]
            setattr(self, open_attr, open_time)
            setattr(self, close_attr, close_time)