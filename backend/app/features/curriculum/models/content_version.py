"""
Content version model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import ContentType


class ContentVersion(BaseModel):
    """
    Content version model for managing version control and change tracking.
    
    Represents version control for all curriculum content, maintaining version 
    history, rollback capability, change tracking, and publication management 
    for draft/published state management.
    
    Relationships:
    - Many-to-one with users (created_by)
    - Generic relationship to any curriculum content type
    """
    
    __tablename__ = "content_versions"
    
    # Content Reference
    content_type: Mapped[ContentType] = mapped_column(
        nullable=False,
        comment="Type of content being versioned",
    )
    
    content_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        comment="ID of the content being versioned",
    )
    
    # Version Information
    version_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Sequential version number",
    )
    
    content_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        comment="Complete content data as JSON",
    )
    
    # User and Change Information
    created_by: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="User who created this version",
    )
    
    change_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes about changes made in this version",
    )
    
    # Publication Status
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this version is published",
    )
    
    # Additional metadata
    change_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Type of change (e.g., creation, update, deletion)",
    )
    
    change_summary: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Brief summary of changes",
    )
    
    rollback_from_version: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Version number this was rolled back from (if applicable)",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # created_by_user = relationship("User", back_populates="content_versions")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_content_versions_content_type", "content_type"),
        Index("idx_content_versions_content_id", "content_id"),
        Index("idx_content_versions_version_number", "version_number"),
        Index("idx_content_versions_created_by", "created_by"),
        Index("idx_content_versions_is_published", "is_published"),
        Index("idx_content_versions_change_type", "change_type"),
        Index("idx_content_versions_content_version", "content_type", "content_id", "version_number"),
        Index("idx_content_versions_content_published", "content_type", "content_id", "is_published"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        return f"{self.content_type.value.title()} v{self.version_number}"
    
    @property
    def full_name(self) -> str:
        """Get full version name including content reference."""
        return f"{self.content_type.value.title()} {self.content_id} v{self.version_number}"
    
    @property
    def status_display(self) -> str:
        """Get formatted status display."""
        return "Published" if self.is_published else "Draft"
    
    @property
    def content_type_display(self) -> str:
        """Get display-friendly content type."""
        return self.content_type.value.replace("_", " ").title()
    
    @property
    def is_rollback(self) -> bool:
        """Check if this version is a rollback."""
        return self.rollback_from_version is not None
    
    def __repr__(self) -> str:
        """String representation of the content version."""
        return f"<ContentVersion(id={self.id}, content_type='{self.content_type}', content_id='{self.content_id}', version={self.version_number})>"