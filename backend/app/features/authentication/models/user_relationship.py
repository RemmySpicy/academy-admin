"""
User relationship model for managing parent-child and family connections.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import RelationshipType


class UserRelationship(BaseModel):
    """
    Model for managing relationships between users (parent-child, family connections).
    
    This model enables:
    - Parent-child relationships with specific relationship types
    - Multiple relationship types (Father, Mother, Guardian, etc.)
    - Bidirectional relationships
    - Audit trail for relationship changes
    
    Examples:
    - Parent -> Child relationships
    - Guardian -> Ward relationships
    - Sibling relationships
    - Extended family connections
    """
    
    __tablename__ = "user_relationships"
    
    # Relationship participants
    parent_user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the parent/guardian user",
    )
    
    child_user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID of the child/dependent user",
    )
    
    # Program context (required for multi-tenant security)
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        comment="Program ID this relationship belongs to",
    )
    
    # Relationship details
    relationship_type: Mapped[RelationshipType] = mapped_column(
        nullable=False,
        comment="Type of relationship (father, mother, guardian, etc.)",
    )
    
    # Status and metadata
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this relationship is currently active",
    )
    
    is_primary: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
        comment="Whether this is the primary contact for the child",
    )
    
    # Optional additional information
    notes: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Additional notes about the relationship",
    )
    
    # Emergency contact information
    emergency_contact: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this person can be contacted in emergencies",
    )
    
    can_pick_up: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this person is authorized to pick up the child",
    )
    
    # Relationships to User model
    parent_user = relationship(
        "User",
        foreign_keys=[parent_user_id],
        back_populates="parent_relationships"
    )
    
    child_user = relationship(
        "User",
        foreign_keys=[child_user_id],
        back_populates="child_relationships"
    )
    
    # Relationship to Program model
    program = relationship("Program")
    
    # Parent-child relationship for enhanced functionality
    parent_child_relationship = relationship(
        "ParentChildRelationship",
        uselist=False,
        back_populates="user_relationship",
        cascade="all, delete-orphan"
    )
    
    # Constraints and indexes
    __table_args__ = (
        # Ensure no duplicate relationships within a program
        UniqueConstraint(
            "parent_user_id", 
            "child_user_id", 
            "relationship_type",
            "program_id",
            name="uq_user_relationship_unique"
        ),
        # Indexes for efficient querying
        Index("idx_user_relationships_parent", "parent_user_id"),
        Index("idx_user_relationships_child", "child_user_id"),
        Index("idx_user_relationships_program", "program_id"),
        Index("idx_user_relationships_active", "is_active"),
        Index("idx_user_relationships_primary", "is_primary"),
        Index("idx_user_relationships_type", "relationship_type"),
        # Program context compound indexes
        Index("idx_user_relationships_program_parent", "program_id", "parent_user_id"),
        Index("idx_user_relationships_program_child", "program_id", "child_user_id"),
    )
    
    def __repr__(self) -> str:
        """String representation of the relationship."""
        return (f"<UserRelationship("
                f"parent_id='{self.parent_user_id}', "
                f"child_id='{self.child_user_id}', "
                f"type='{self.relationship_type.value}')>")
    
    @property
    def display_name(self) -> str:
        """Get a display-friendly name for the relationship."""
        return f"{self.relationship_type.value.title()}"
    
    def is_valid_relationship(self) -> bool:
        """Validate that the relationship is valid (no self-relationships)."""
        return self.parent_user_id != self.child_user_id