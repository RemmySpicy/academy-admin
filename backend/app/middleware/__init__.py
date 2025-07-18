"""
Middleware package for Academy Admin Backend
"""

from .program_context import (
    ProgramContextMiddleware,
    get_program_context,
    get_bypass_program_filter,
    require_program_context,
    validate_program_context_access,
    get_validated_program_context,
    create_program_filter_dependency,
    validate_program_access,
    get_user_accessible_programs,
)
from .security import SecurityHeadersMiddleware, RateLimitMiddleware, LoggingMiddleware

__all__ = [
    # Program context middleware
    "ProgramContextMiddleware",
    "get_program_context", 
    "get_bypass_program_filter",
    "require_program_context",
    "validate_program_context_access",
    "get_validated_program_context",
    "create_program_filter_dependency",
    "validate_program_access",
    "get_user_accessible_programs",
    
    # Security middleware
    "SecurityHeadersMiddleware",
    "RateLimitMiddleware", 
    "LoggingMiddleware",
]