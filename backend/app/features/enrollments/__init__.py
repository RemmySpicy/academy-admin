"""
Enrollment Management Domain

This domain handles all enrollment-related functionality including:
- Course enrollment management
- Student-course assignments
- Facility-based enrollment
- Payment tracking
- Enrollment validation and workflows
"""

from .models.course_enrollment import CourseEnrollment
from .models.program_assignment import ProgramAssignment

# Export key models for easy importing
__all__ = [
    "CourseEnrollment",
    "ProgramAssignment",
]