"""
Custom exceptions for Academy Admin Backend
"""
from fastapi import HTTPException, status


class AcademyAdminException(Exception):
    """Base exception for Academy Admin application"""
    pass


class AuthenticationError(AcademyAdminException):
    """Authentication related errors"""
    pass


class AuthorizationError(AcademyAdminException):
    """Authorization related errors"""
    pass


class ValidationError(AcademyAdminException):
    """Data validation errors"""
    pass


class NotFoundError(AcademyAdminException):
    """Resource not found errors"""
    pass


class ConflictError(AcademyAdminException):
    """Resource conflict errors"""
    pass


# HTTP Exception helpers
def raise_not_found(message: str = "Resource not found"):
    """Raise HTTP 404 Not Found exception"""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=message
    )


def raise_conflict(message: str = "Resource conflict"):
    """Raise HTTP 409 Conflict exception"""
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=message
    )


def raise_unauthorized(message: str = "Unauthorized"):
    """Raise HTTP 401 Unauthorized exception"""
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def raise_forbidden(message: str = "Forbidden"):
    """Raise HTTP 403 Forbidden exception"""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message
    )


def raise_validation_error(message: str = "Validation error"):
    """Raise HTTP 422 Validation Error exception"""
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=message
    )