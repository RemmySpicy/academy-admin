# Scheduling Feature Module

"""
Scheduling and booking feature module.

This module handles:
- Facility-centric session scheduling and booking
- Instructor assignment and availability management
- Schedule conflict prevention and detection
- Recurring and one-time sessions with exceptions
- Participant enrollment and attendance tracking
- Session capacity and waitlist management
- Notification system for schedule changes
- Program context filtering for all operations
"""

from .models import (
    ScheduledSession,
    SessionParticipant,
    SessionInstructor,
    InstructorAvailability,
    FacilityScheduleSettings,
)

__all__ = [
    "ScheduledSession",
    "SessionParticipant",
    "SessionInstructor", 
    "InstructorAvailability",
    "FacilityScheduleSettings",
]