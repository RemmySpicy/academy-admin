"""
Program context dependency for FastAPI routes.
"""

from typing import Optional
from fastapi import Header


def get_program_context(
    x_program_context: Optional[str] = Header(None, alias="X-Program-Context")
) -> Optional[str]:
    """
    Extract program context from X-Program-Context header.
    
    Returns the program ID if provided, None otherwise.
    """
    return x_program_context