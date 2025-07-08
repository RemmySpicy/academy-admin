"""
Common database models and configuration.

This module provides:
- Database session management
- Base model with common fields
- Audit trail functionality
- Common enums and types
"""

from .base import Base, BaseModel, TimestampMixin
from .database import SessionLocal, engine, get_db
from .enums import *

__all__ = [
    "Base",
    "BaseModel", 
    "TimestampMixin",
    "SessionLocal",
    "engine",
    "get_db",
    # Enums
    "StudentStatus",
    "ParentStatus",
    "EnrollmentStatus",
    "AttendanceStatus",
    "TransactionType",
    "PaymentMethod",
    "PaymentStatus",
    "RelationshipType",
    "Gender",
    "CommunicationPreference",
]