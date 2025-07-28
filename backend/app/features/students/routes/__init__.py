"""
Student routes module.
"""

from .students import router as students_router
from .course_assignments import router as course_assignments_router

__all__ = ["students_router", "course_assignments_router"]