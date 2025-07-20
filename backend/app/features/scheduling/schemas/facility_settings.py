"""
Facility schedule settings schemas.
"""

from datetime import time
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from app.features.students.schemas.common import TimestampMixin


class FacilitySettingsBase(BaseModel):
    """Base facility settings schema."""
    
    # Operating hours
    monday_open: Optional[time] = Field(None, description="Monday opening time")
    monday_close: Optional[time] = Field(None, description="Monday closing time")
    tuesday_open: Optional[time] = Field(None, description="Tuesday opening time")
    tuesday_close: Optional[time] = Field(None, description="Tuesday closing time")
    wednesday_open: Optional[time] = Field(None, description="Wednesday opening time")
    wednesday_close: Optional[time] = Field(None, description="Wednesday closing time")
    thursday_open: Optional[time] = Field(None, description="Thursday opening time")
    thursday_close: Optional[time] = Field(None, description="Thursday closing time")
    friday_open: Optional[time] = Field(None, description="Friday opening time")
    friday_close: Optional[time] = Field(None, description="Friday closing time")
    saturday_open: Optional[time] = Field(None, description="Saturday opening time")
    saturday_close: Optional[time] = Field(None, description="Saturday closing time")
    sunday_open: Optional[time] = Field(None, description="Sunday opening time")
    sunday_close: Optional[time] = Field(None, description="Sunday closing time")
    
    # Booking policies
    booking_advance_days: int = Field(30, description="Max days in advance for booking")
    booking_cutoff_hours: int = Field(24, description="Hours before session when booking closes")
    cancellation_cutoff_hours: int = Field(24, description="Hours before session when cancellation allowed")
    
    # Session management
    max_sessions_per_day: Optional[int] = Field(None, description="Max sessions per day")
    max_concurrent_sessions: int = Field(1, description="Max concurrent sessions")
    cleanup_time_minutes: int = Field(15, description="Cleanup time between sessions")
    setup_time_minutes: int = Field(15, description="Setup time before sessions")
    
    # Capacity
    default_max_participants: Optional[int] = Field(None, description="Default max participants")
    participant_limits_by_type: Optional[Dict[str, int]] = Field(None, description="Participant limits by session type")
    
    # Notifications
    auto_send_notifications: bool = Field(True, description="Auto send notifications")
    notification_lead_time_hours: int = Field(24, description="Hours before session for reminders")


class FacilitySettingsCreate(FacilitySettingsBase):
    """Schema for creating facility settings."""
    
    facility_id: str = Field(..., description="Facility ID")


class FacilitySettingsUpdate(BaseModel):
    """Schema for updating facility settings."""
    
    # All fields optional for updates
    booking_advance_days: Optional[int] = Field(None)
    booking_cutoff_hours: Optional[int] = Field(None)
    max_concurrent_sessions: Optional[int] = Field(None)
    cleanup_time_minutes: Optional[int] = Field(None)
    default_max_participants: Optional[int] = Field(None)
    auto_send_notifications: Optional[bool] = Field(None)


class FacilitySettingsResponse(FacilitySettingsBase, TimestampMixin):
    """Schema for facility settings response."""
    
    id: str
    facility_id: str
    program_id: str
    
    # Facility information
    facility_name: Optional[str] = None
    
    class Config:
        from_attributes = True