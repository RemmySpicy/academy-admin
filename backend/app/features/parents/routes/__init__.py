"""
Parent Routes

API routes for parent management and family relationships.
"""

from .parents import router as parents_router
from .relationships import router as relationships_router
from .family_management import router as family_management_router

__all__ = [
    "parents_router",
    "relationships_router", 
    "family_management_router",
]