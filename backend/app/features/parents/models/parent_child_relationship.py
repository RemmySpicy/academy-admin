"""
Parent-Child Relationship model providing convenient access to UserRelationship data.
"""

from typing import Optional
from sqlalchemy import String, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import RelationshipType


class ParentChildRelationship(BaseModel):
    """
    Parent-Child Relationship model that provides a convenient interface
    to manage parent-child relationships with additional parent-specific metadata.
    
    This model extends the core UserRelationship functionality with:
    - Parent-specific relationship metadata
    - Enhanced querying capabilities for parent operations
    - Additional permissions and settings
    - Family structure management
    
    Note: This model works in conjunction with UserRelationship for
    the core relationship data, providing a parent-centric view.
    """
    
    __tablename__ = "parent_child_relationships"
    
    # Reference to the core user relationship
    user_relationship_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user_relationships.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="Reference to the core user relationship",
    )
    
    # Parent and child references (for convenient querying)
    parent_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("parents.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to the parent",
    )
    
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to the student",
    )
    
    # Program context (inherited from UserRelationship but duplicated for efficiency)
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id", ondelete="CASCADE"),
        nullable=False,
        comment="Program ID this relationship belongs to",
    )
    
    # Parent-specific permissions and settings
    is_primary_contact: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent is the primary contact for the child",
    )
    
    can_pickup: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent can pick up the child",
    )
    
    emergency_contact: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent is an emergency contact",
    )
    
    # Communication preferences
    receive_notifications: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent should receive notifications about the child",
    )
    
    receive_reports: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent should receive progress reports",
    )
    
    # Payment responsibility (can differ per child)
    payment_responsibility: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        comment="Whether this parent is responsible for payments for this child",
    )
    
    # Additional notes specific to this parent-child relationship
    relationship_notes: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Notes specific to this parent-child relationship",
    )
    
    # Relationships
    user_relationship = relationship(
        "UserRelationship",
        back_populates="parent_child_relationship"
    )
    
    parent = relationship("Parent", back_populates="child_relationships")
    student = relationship("Student", back_populates="parent_relationships")
    program = relationship("Program")
    
    # Indexes for efficient querying
    __table_args__ = (
        Index("idx_parent_child_rel_parent", "parent_id"),
        Index("idx_parent_child_rel_student", "student_id"),
        Index("idx_parent_child_rel_program", "program_id"),
        Index("idx_parent_child_rel_primary", "is_primary_contact"),
        Index("idx_parent_child_rel_emergency", "emergency_contact"),
        Index("idx_parent_child_rel_payment", "payment_responsibility"),
        # Program context compound indexes
        Index("idx_parent_child_rel_program_parent", "program_id", "parent_id"),
        Index("idx_parent_child_rel_program_student", "program_id", "student_id"),
        # Family structure indexes
        Index("idx_parent_child_rel_family", "parent_id", "student_id"),
    )
    
    @property
    def relationship_type(self) -> RelationshipType:
        """Get the relationship type from the core user relationship."""
        return self.user_relationship.relationship_type if self.user_relationship else None
    
    @property
    def is_active(self) -> bool:
        """Check if the relationship is active."""
        return self.user_relationship.is_active if self.user_relationship else False
    
    def __repr__(self) -> str:
        """String representation of the parent-child relationship."""
        return (f"<ParentChildRelationship("
                f"parent_id='{self.parent_id}', "
                f"student_id='{self.student_id}', "
                f"primary={self.is_primary_contact})>")