"""
Enrollment Domain Models

Core models for enrollment management:
- CourseEnrollment: Student course enrollment with facility and payment tracking
- ProgramAssignment: User program assignments and roles
"""

from .course_enrollment import CourseEnrollment
from .program_assignment import ProgramAssignment

__all__ = [
    "CourseEnrollment", 
    "ProgramAssignment",
]