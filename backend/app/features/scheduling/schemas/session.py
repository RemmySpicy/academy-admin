"""
Session management schemas for scheduling system.
"""

from datetime import datetime, time
from typing import Optional, List, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, Field, validator

from app.features.common.models.enums import (
    SessionStatus, SessionType, RecurringPattern
)
from app.features.students.schemas.common import PaginatedResponse, TimestampMixin


class SessionBase(BaseModel):
    """Base session schema with common fields."""
    
    title: str = Field(..., description="Session title/name", max_length=255)
    description: Optional[str] = Field(None, description="Detailed session description")
    session_type: SessionType = Field(
        default=SessionType.GROUP,
        description="Type of session (private: 1-2, group: 3-5, school_group: unlimited)"
    )
    
    # Scheduling details
    start_time: datetime = Field(..., description="Session start date and time")
    end_time: datetime = Field(..., description="Session end date and time")
    
    # Recurring configuration
    recurring_pattern: RecurringPattern = Field(
        default=RecurringPattern.NONE,
        description="Recurring pattern for the session"
    )
    recurring_config: Optional[Dict[str, Any]] = Field(
        None,
        description="Configuration for recurring pattern"
    )
    recurring_exceptions: Optional[List[datetime]] = Field(
        None,
        description="List of exception dates for recurring sessions"
    )
    
    # Participant management
    max_participants: Optional[int] = Field(
        None,
        description="Maximum number of participants allowed",
        ge=1
    )
    
    # Student type and skill level (from original requirements)
    student_type: Optional[str] = Field(
        None,
        description="Target student type (Adult, Children)",
        max_length=50
    )
    skill_level: Optional[str] = Field(
        None,
        description="Required skill level (Beginner, Intermediate, Advanced)",
        max_length=50
    )
    
    # Additional details
    special_requirements: Optional[str] = Field(
        None,
        description="Special requirements or accommodations needed"
    )
    notes: Optional[str] = Field(
        None,
        description="Additional notes about the session"
    )
    
    @validator('end_time')
    def validate_end_time(cls, v, values):
        """Ensure end time is after start time."""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v
    
    @validator('recurring_config')
    def validate_recurring_config(cls, v, values):
        """Validate recurring configuration based on pattern."""
        if 'recurring_pattern' in values and values['recurring_pattern'] != RecurringPattern.NONE:
            if not v:
                raise ValueError('Recurring configuration required for recurring sessions')
        return v
    
    @validator('max_participants')
    def validate_max_participants(cls, v, values):
        """Validate max participants based on session type."""
        if 'session_type' in values and v is not None:
            session_type = values['session_type']
            
            if session_type == SessionType.PRIVATE and v > 2:
                raise ValueError('Private sessions can have maximum 2 participants')
            elif session_type == SessionType.GROUP and (v < 3 or v > 5):
                raise ValueError('Group sessions must have 3-5 participants')
            elif session_type == SessionType.SCHOOL_GROUP and v < 1:
                raise ValueError('School group sessions must have at least 1 participant')
                
        return v


class SessionCreate(SessionBase):
    """Schema for creating a new session."""
    
    facility_id: str = Field(..., description="ID of the facility where session takes place")
    course_id: Optional[str] = Field(None, description="Optional course this session is part of")
    
    # Instructor assignments can be added separately
    instructor_ids: Optional[List[str]] = Field(
        None,
        description="List of instructor IDs to assign to the session"
    )
    
    # Participant enrollment can be added separately  
    student_ids: Optional[List[str]] = Field(
        None,
        description="List of student IDs to enroll in the session"
    )


class SessionUpdate(BaseModel):
    """Schema for updating session information."""
    
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    session_type: Optional[SessionType] = Field(None)
    
    start_time: Optional[datetime] = Field(None)
    end_time: Optional[datetime] = Field(None)
    
    recurring_pattern: Optional[RecurringPattern] = Field(None)
    recurring_config: Optional[Dict[str, Any]] = Field(None)
    recurring_exceptions: Optional[List[datetime]] = Field(None)
    
    max_participants: Optional[int] = Field(None, ge=1)
    student_type: Optional[str] = Field(None, max_length=50)
    skill_level: Optional[str] = Field(None, max_length=50)
    
    special_requirements: Optional[str] = Field(None)
    notes: Optional[str] = Field(None)
    status: Optional[SessionStatus] = Field(None)
    
    @validator('end_time')
    def validate_end_time(cls, v, values):
        """Ensure end time is after start time if both are provided."""
        if v and 'start_time' in values and values['start_time'] and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v


class SessionResponse(SessionBase, TimestampMixin):
    """Schema for session response."""
    
    id: str
    program_id: str
    facility_id: str
    course_id: Optional[str]
    status: SessionStatus
    
    # Recurring session information
    recurring_parent_id: Optional[str]
    is_recurring: bool = False
    
    # Capacity and enrollment information
    enrolled_count: int = 0
    waitlist_count: int = 0
    available_spots: Optional[int] = None
    is_full: bool = False
    
    # Notification tracking
    notification_sent: bool = False
    last_notification_time: Optional[datetime] = None
    
    # Cancellation information
    cancellation_reason: Optional[str] = None
    cancelled_by_user_id: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    
    # Computed properties
    duration_minutes: int = 0
    instructor_names: List[str] = []
    
    # Related data
    facility_name: Optional[str] = None
    course_name: Optional[str] = None
    program_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class SessionListResponse(PaginatedResponse):
    """Schema for paginated session list response."""
    
    items: List[SessionResponse]


class SessionSearchParams(BaseModel):
    """Parameters for session search and filtering."""
    
    facility_id: Optional[str] = Field(None, description="Filter by facility")
    course_id: Optional[str] = Field(None, description="Filter by course")
    instructor_id: Optional[str] = Field(None, description="Filter by instructor")
    student_id: Optional[str] = Field(None, description="Filter by enrolled student")
    
    session_type: Optional[SessionType] = Field(None, description="Filter by session type")
    status: Optional[SessionStatus] = Field(None, description="Filter by status")
    student_type: Optional[str] = Field(None, description="Filter by student type")
    skill_level: Optional[str] = Field(None, description="Filter by skill level")
    
    # Date filtering
    start_date: Optional[datetime] = Field(None, description="Filter sessions starting after this date")
    end_date: Optional[datetime] = Field(None, description="Filter sessions starting before this date")
    
    # Recurring session filtering
    recurring_only: Optional[bool] = Field(None, description="Filter only recurring sessions")
    parent_sessions_only: Optional[bool] = Field(None, description="Filter only parent recurring sessions")
    
    # Capacity filtering
    has_available_spots: Optional[bool] = Field(None, description="Filter sessions with available spots")
    is_full: Optional[bool] = Field(None, description="Filter full sessions")
    
    # Search
    search: Optional[str] = Field(None, description="Search in title and description")
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        """Ensure end date is after start date."""
        if v and 'start_date' in values and values['start_date'] and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v


class SessionStatsResponse(BaseModel):
    """Schema for session statistics response."""
    
    total_sessions: int = 0
    active_sessions: int = 0
    completed_sessions: int = 0
    cancelled_sessions: int = 0
    
    total_participants: int = 0
    total_waitlisted: int = 0
    average_attendance_rate: Optional[Decimal] = None
    
    sessions_by_type: Dict[str, int] = {}
    sessions_by_facility: Dict[str, int] = {}
    sessions_by_instructor: Dict[str, int] = {}
    
    upcoming_sessions_count: int = 0
    sessions_this_week: int = 0
    sessions_this_month: int = 0
    
    average_session_duration: Optional[int] = None
    facility_utilization_rate: Optional[Decimal] = None


class SessionBulkUpdateRequest(BaseModel):
    """Schema for bulk session operations."""
    
    session_ids: List[str] = Field(..., description="List of session IDs to update")
    updates: SessionUpdate = Field(..., description="Updates to apply to all sessions")
    
    # Specific bulk operations
    cancel_all: bool = Field(False, description="Cancel all selected sessions")
    cancellation_reason: Optional[str] = Field(None, description="Reason for bulk cancellation")
    
    # Notification options
    send_notifications: bool = Field(True, description="Send notifications for changes")
    notification_message: Optional[str] = Field(None, description="Custom notification message")


class SessionConflictCheck(BaseModel):
    """Schema for checking session conflicts."""
    
    facility_id: str
    start_time: datetime
    end_time: datetime
    instructor_ids: Optional[List[str]] = None
    exclude_session_id: Optional[str] = None
    
    
class SessionConflictResponse(BaseModel):
    """Schema for session conflict check response."""
    
    has_conflicts: bool = False
    facility_conflicts: List[SessionResponse] = []
    instructor_conflicts: Dict[str, List[SessionResponse]] = {}
    suggested_times: List[Dict[str, datetime]] = []