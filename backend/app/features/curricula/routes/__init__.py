"""
Curricula API routes for the academy management system.
"""

from .curricula import router as curricula_router
from .levels import router as levels_router
from .modules import router as modules_router
from .sections import router as sections_router

__all__ = [
    "curricula_router", 
    "levels_router",
    "modules_router",
    "sections_router",
]