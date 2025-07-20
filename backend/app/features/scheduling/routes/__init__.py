"""
Scheduling routes module.

This module contains all API routes for the scheduling system:
- Sessions: Session management and scheduling
- Participants: Participant enrollment and management
- Instructors: Instructor assignment and availability
- Facilities: Facility scheduling and settings
- Integration: Course enrollment and facility integration
"""

from .sessions import router as sessions_router
from .integration import router as integration_router

__all__ = [
    "sessions_router",
    "integration_router",
]