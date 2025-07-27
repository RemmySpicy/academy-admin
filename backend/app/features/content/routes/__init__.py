"""
Content API routes for the academy management system.
"""

from .lessons import router as lessons_router
from .assessments import router as assessments_router
from .content_versions import router as content_versions_router

__all__ = [
    "lessons_router",
    "assessments_router",
    "content_versions_router",
]