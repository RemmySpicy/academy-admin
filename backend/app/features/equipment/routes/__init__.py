"""
Equipment API routes for the academy management system.
"""

from .equipment import router as equipment_router

__all__ = [
    "equipment_router",
]