"""
Base model classes with common functionality.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from .database import Base


class TimestampMixin:
    """
    Mixin class that adds created_at and updated_at timestamps.
    """
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=datetime.utcnow,
        nullable=False,
    )


class BaseModel(Base, TimestampMixin):
    """
    Base model class with common fields and functionality.
    
    Provides:
    - UUID primary key with auto-generation
    - Created/updated timestamps
    - Common utility methods
    """
    
    __abstract__ = True
    
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        server_default=text("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        nullable=False,
    )
    
    # Audit fields
    created_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True,
        # Will be linked to users table when authentication is implemented
        comment="User who created this record",
    )
    
    updated_by: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True,
        # Will be linked to users table when authentication is implemented
        comment="User who last updated this record",
    )
    
    def __repr__(self) -> str:
        """String representation of the model."""
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def to_dict(self) -> dict:
        """Convert model to dictionary representation."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }