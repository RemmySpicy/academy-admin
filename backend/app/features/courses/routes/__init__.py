"""
Course API routes for the academy management system.
"""

from .courses import router as courses_router
from .advanced import router as advanced_router

__all__ = [
    "courses_router",
    "advanced_router",
]