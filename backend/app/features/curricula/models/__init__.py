"""
Curricula models for the academy management system.
"""

from .curriculum import Curriculum
from .level import Level
from .module import Module
from .section import Section

__all__ = [
    "Curriculum",
    "Level",
    "Module",
    "Section",
]