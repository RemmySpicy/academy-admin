"""
Instructor management schemas for scheduling system.
"""

from datetime import datetime, time
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.features.students.schemas.common import TimestampMixin


class InstructorAssignmentBase(BaseModel):
    """Base instructor assignment schema."""
    
    is_primary: bool = Field(True, description="Whether this is the primary instructor")
    assignment_notes: Optional[str] = Field(None, description="Notes about the assignment")
    special_instructions: Optional[str] = Field(None, description="Special instructions")


class InstructorAssignmentCreate(InstructorAssignmentBase):
    """Schema for creating instructor assignment."""
    
    session_id: str = Field(..., description="Session ID")
    instructor_id: str = Field(..., description="Instructor ID")


class InstructorAssignmentUpdate(BaseModel):
    """Schema for updating instructor assignment."""
    
    is_primary: Optional[bool] = Field(None)
    assignment_notes: Optional[str] = Field(None)
    special_instructions: Optional[str] = Field(None)
    is_confirmed: Optional[bool] = Field(None)


class InstructorAssignmentResponse(InstructorAssignmentBase, TimestampMixin):
    """Schema for instructor assignment response."""
    
    id: str
    session_id: str
    instructor_id: str
    
    assigned_at: datetime
    is_confirmed: bool = False
    confirmed_at: Optional[datetime] = None
    
    # Instructor information
    instructor_name: Optional[str] = None
    instructor_email: Optional[str] = None
    
    class Config:
        from_attributes = True


class AvailabilityBase(BaseModel):
    """Base availability schema."""
    
    day_of_week: Optional[int] = Field(None, description="Day of week (0=Monday)")
    start_time: time = Field(..., description="Start time")
    end_time: time = Field(..., description="End time")
    is_recurring: bool = Field(True, description="Whether this is recurring")
    max_concurrent_sessions: int = Field(1, description="Max concurrent sessions")


class AvailabilityCreate(AvailabilityBase):
    """Schema for creating instructor availability."""
    
    instructor_id: str = Field(..., description="Instructor ID")
    facility_id: Optional[str] = Field(None, description="Facility ID")
    specific_date: Optional[datetime] = Field(None, description="Specific date")


class AvailabilityUpdate(BaseModel):
    """Schema for updating instructor availability."""
    
    start_time: Optional[time] = Field(None)
    end_time: Optional[time] = Field(None)
    is_active: Optional[bool] = Field(None)
    max_concurrent_sessions: Optional[int] = Field(None)


class AvailabilityResponse(AvailabilityBase, TimestampMixin):
    """Schema for availability response."""
    
    id: str
    instructor_id: str
    program_id: str
    facility_id: Optional[str]
    
    specific_date: Optional[datetime] = None
    is_active: bool = True
    
    # Instructor information
    instructor_name: Optional[str] = None
    
    class Config:
        from_attributes = True