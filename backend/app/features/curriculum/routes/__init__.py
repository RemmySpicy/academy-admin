"""
Curriculum API routes for the academy management system.
"""

from .programs import router as programs_router
from .courses import router as courses_router
from .curricula import router as curricula_router
from .levels import router as levels_router
from .modules import router as modules_router
from .sections import router as sections_router
from .lessons import router as lessons_router
from .assessments import router as assessments_router
from .equipment import router as equipment_router
from .media import router as media_router
from .content_versions import router as content_versions_router
from .advanced import router as advanced_router

__all__ = [
    "programs_router",
    "courses_router",
    "curricula_router", 
    "levels_router",
    "modules_router",
    "sections_router",
    "lessons_router",
    "assessments_router",
    "equipment_router",
    "media_router",
    "content_versions_router",
    "advanced_router",
]