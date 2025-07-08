"""
Authentication routes module.
"""

from .auth import router, get_current_user, get_current_active_user

__all__ = ["router", "get_current_user", "get_current_active_user"]