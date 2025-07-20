"""
Participant management schemas for scheduling system.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.features.common.models.enums import ParticipantStatus, AttendanceStatus
from app.features.students.schemas.common import PaginatedResponse, TimestampMixin


class ParticipantBase(BaseModel):
    """Base participant schema."""
    
    enrollment_status: ParticipantStatus = Field(
        default=ParticipantStatus.ENROLLED,
        description="Current participation status"
    )
    notes: Optional[str] = Field(None, description="Notes about the participant")
    special_requirements: Optional[str] = Field(None, description="Special requirements")


class ParticipantCreate(ParticipantBase):
    """Schema for adding participant to session."""
    
    session_id: str = Field(..., description="Session ID")
    student_id: str = Field(..., description="Student ID")


class ParticipantUpdate(BaseModel):
    """Schema for updating participant information."""
    
    enrollment_status: Optional[ParticipantStatus] = Field(None)
    attendance_status: Optional[AttendanceStatus] = Field(None) 
    notes: Optional[str] = Field(None)
    special_requirements: Optional[str] = Field(None)


class ParticipantResponse(ParticipantBase, TimestampMixin):
    """Schema for participant response."""
    
    id: str
    session_id: str
    student_id: str
    
    enrolled_at: datetime
    waitlist_position: Optional[int] = None
    attendance_status: Optional[AttendanceStatus] = None
    
    # Student information
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    
    # Session information
    session_title: Optional[str] = None
    session_start_time: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ParticipantListResponse(PaginatedResponse):
    """Schema for paginated participant list response."""
    
    items: List[ParticipantResponse]