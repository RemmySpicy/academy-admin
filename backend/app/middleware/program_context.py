"""
Program Context Middleware for Academy Admin Backend

This middleware handles:
- Extracting program context from X-Program-Context header
- Validating user program access
- Providing program context dependency injection
- Supporting super admin bypass functionality
"""

from typing import Optional, List
from fastapi import HTTPException, Request, Depends, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.models.user_program_assignment import UserProgramAssignment
from app.features.courses.models.program import Program


class ProgramContextMiddleware:
    """Middleware for handling program context in requests."""
    
    PROGRAM_CONTEXT_HEADER = "X-Program-Context"
    BYPASS_FILTER_HEADER = "X-Bypass-Program-Filter"
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """ASGI middleware callable."""
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Extract program context from headers
            program_id = request.headers.get(self.PROGRAM_CONTEXT_HEADER)
            bypass_filter = request.headers.get(self.BYPASS_FILTER_HEADER, "false").lower() == "true"
            
            # Store in request state for dependency injection
            if not hasattr(request.state, "program_context"):
                request.state.program_context = program_id
            if not hasattr(request.state, "bypass_program_filter"):
                request.state.bypass_program_filter = bypass_filter
        
        await self.app(scope, receive, send)


def get_program_context(request: Request) -> Optional[str]:
    """
    Dependency to get current program context from request.
    
    Returns:
        Program ID from X-Program-Context header, or None if not set
    """
    return getattr(request.state, "program_context", None)


def get_bypass_program_filter(request: Request) -> bool:
    """
    Dependency to check if program filtering should be bypassed.
    
    Returns:
        True if X-Bypass-Program-Filter header is set to 'true', False otherwise
    """
    return getattr(request.state, "bypass_program_filter", False)


async def validate_program_access(
    program_id: str,
    current_user: dict,
    db: Session = Depends(get_db)
) -> bool:
    """
    Validate that current user has access to the specified program.
    
    Args:
        program_id: Program ID to validate access for
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        True if user has access, False otherwise
    """
    # Super admin has access to all programs
    if current_user.get("role") == "super_admin":
        return True
    
    # Check if user has program assignment
    assignment = db.query(UserProgramAssignment).filter(
        UserProgramAssignment.user_id == current_user["id"],
        UserProgramAssignment.program_id == program_id
    ).first()
    
    return assignment is not None


async def get_user_accessible_programs(
    current_user: dict,
    db: Session = Depends(get_db)
) -> List[str]:
    """
    Get list of program IDs that the current user has access to.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of program IDs the user can access
    """
    # Super admin has access to all programs
    if current_user.get("role") == "super_admin":
        programs = db.query(Program.id).all()
        return [p.id for p in programs]
    
    # Get user's program assignments
    assignments = db.query(UserProgramAssignment.program_id).filter(
        UserProgramAssignment.user_id == current_user["id"]
    ).all()
    
    return [assignment.program_id for assignment in assignments]


def require_program_context(
    program_context: Optional[str] = Depends(get_program_context),
    bypass_filter: bool = Depends(get_bypass_program_filter),
    current_user: dict = None  # Will be injected by auth dependency
) -> str:
    """
    Dependency that requires a valid program context.
    
    Args:
        program_context: Program ID from header
        bypass_filter: Whether to bypass program filtering
        current_user: Current authenticated user
    
    Returns:
        Validated program ID
    
    Raises:
        HTTPException: If program context is missing or invalid
    """
    # Super admin can bypass program context requirement
    if bypass_filter and current_user and current_user.get("role") == "super_admin":
        return None  # No program context required
    
    if not program_context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program context is required. Please set X-Program-Context header."
        )
    
    return program_context


async def validate_program_context_access(
    program_context: str = Depends(require_program_context),
    current_user: dict = None,  # Will be injected by auth dependency
    db: Session = Depends(get_db)
) -> str:
    """
    Dependency that validates user has access to the program context.
    
    Args:
        program_context: Program ID from header
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Validated program ID
    
    Raises:
        HTTPException: If user doesn't have access to the program
    """
    if not program_context:  # Super admin bypass case
        return None
    
    # Validate program exists
    program = db.query(Program).filter(Program.id == program_context).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Program with ID '{program_context}' not found"
        )
    
    # Validate user access
    has_access = await validate_program_access(program_context, current_user, db)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have access to program '{program.name}'"
        )
    
    return program_context


# Convenience dependencies for common use cases
async def get_validated_program_context(
    program_context: str = Depends(validate_program_context_access),
    bypass_filter: bool = Depends(get_bypass_program_filter)
) -> Optional[str]:
    """
    Get validated program context, returning None if bypassed.
    
    This is the main dependency that most endpoints should use.
    """
    if bypass_filter:
        return None
    return program_context


def create_program_filter_dependency(current_user_dependency):
    """
    Factory function to create program filter dependency with proper auth integration.
    
    Args:
        current_user_dependency: The current user dependency from auth module
    
    Returns:
        Dependency function that can be used in route handlers
    """
    async def program_filter_dependency(
        program_context: Optional[str] = Depends(get_program_context),
        bypass_filter: bool = Depends(get_bypass_program_filter),
        current_user: dict = Depends(current_user_dependency),
        db: Session = Depends(get_db)
    ) -> Optional[str]:
        """
        Combined dependency for program filtering with authentication.
        
        Returns:
            Program ID to filter by, or None if bypassed
        """
        # Super admin can bypass if header is set
        if bypass_filter and current_user.get("role") == "super_admin":
            return None
        
        # Require program context for non-super-admin users
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required. Please set X-Program-Context header."
            )
        
        # Validate program access
        has_access = await validate_program_access(program_context, current_user, db)
        if not has_access:
            program = db.query(Program).filter(Program.id == program_context).first()
            program_name = program.name if program else program_context
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have access to program '{program_name}'"
            )
        
        return program_context
    
    return program_filter_dependency