"""
Scheduling schemas module.

This module contains all Pydantic schemas for the scheduling system:
- Session management schemas
- Participant management schemas
- Instructor assignment schemas
- Availability management schemas
- Facility settings schemas
"""

from .session import (
    SessionBase,
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionListResponse,
    SessionSearchParams,
    SessionStatsResponse,
)

from .participant import (
    ParticipantBase,
    ParticipantCreate,
    ParticipantUpdate,
    ParticipantResponse,
    ParticipantListResponse,
)

from .instructor import (
    InstructorAssignmentBase,
    InstructorAssignmentCreate,
    InstructorAssignmentUpdate,
    InstructorAssignmentResponse,
    AvailabilityBase,
    AvailabilityCreate,
    AvailabilityUpdate,
    AvailabilityResponse,
)

from .facility_settings import (
    FacilitySettingsBase,
    FacilitySettingsCreate,
    FacilitySettingsUpdate,
    FacilitySettingsResponse,
)

__all__ = [
    # Session schemas
    "SessionBase",
    "SessionCreate",
    "SessionUpdate", 
    "SessionResponse",
    "SessionListResponse",
    "SessionSearchParams",
    "SessionStatsResponse",
    
    # Participant schemas
    "ParticipantBase",
    "ParticipantCreate",
    "ParticipantUpdate",
    "ParticipantResponse",
    "ParticipantListResponse",
    
    # Instructor schemas
    "InstructorAssignmentBase",
    "InstructorAssignmentCreate",
    "InstructorAssignmentUpdate",
    "InstructorAssignmentResponse",
    "AvailabilityBase",
    "AvailabilityCreate",
    "AvailabilityUpdate",
    "AvailabilityResponse",
    
    # Facility settings schemas
    "FacilitySettingsBase",
    "FacilitySettingsCreate",
    "FacilitySettingsUpdate",
    "FacilitySettingsResponse",
]