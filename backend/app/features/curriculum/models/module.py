"""
Module model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


class Module(BaseModel):
    """
    Module model for managing thematic groupings within levels.
    
    Represents thematic groupings of related skills or concepts within a level
    (e.g., Module 1, Module 2). Each module focuses on specific learning objectives
    and can be taught in sequence or parallel based on curriculum design.
    
    Relationships:
    - Many-to-one with levels
    - One-to-many with sections
    """
    
    __tablename__ = "modules"
    
    # Foreign Key to Level
    level_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("levels.id"),
        nullable=False,
        comment="Reference to parent level",
    )
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Module name (e.g., Module 1, Floating Techniques, Safety Skills)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed module description",
    )
    
    # Sequencing and Progression
    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Order of this module within the level",
    )
    
    learning_objectives: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Specific learning objectives for this module",
    )
    
    # Duration and Time Management
    estimated_duration_hours: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Estimated duration to complete module in hours",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Module status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying modules within level",
    )
    
    # Additional metadata
    module_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Module code (e.g., M1, M2, FLOAT, SAFETY)",
    )
    
    difficulty_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Difficulty level (e.g., Beginner, Intermediate, Advanced)",
    )
    
    prerequisites: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Prerequisites for this module",
    )
    
    instructor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special notes and guidance for instructors",
    )
    
    key_concepts: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Key concepts covered in this module",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # level = relationship("Level", back_populates="modules")
    # sections = relationship("Section", back_populates="module", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_modules_level_id", "level_id"),
        Index("idx_modules_name", "name"),
        Index("idx_modules_status", "status"),
        Index("idx_modules_sequence_order", "sequence_order"),
        Index("idx_modules_display_order", "display_order"),
        Index("idx_modules_difficulty", "difficulty_level"),
        Index("idx_modules_level_sequence", "level_id", "sequence_order"),
        Index("idx_modules_level_name", "level_id", "name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.module_code:
            return f"{self.module_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if module is active."""
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def full_name(self) -> str:
        """Get full module name including level reference."""
        # This will be updated when Level relationship is established
        return f"Level Module: {self.name}"
    
    @property
    def duration_text(self) -> str:
        """Get formatted duration text."""
        if self.estimated_duration_hours:
            hours = self.estimated_duration_hours
            if hours >= 8:
                days = hours // 8
                remaining_hours = hours % 8
                if remaining_hours > 0:
                    return f"{days} days, {remaining_hours} hours"
                return f"{days} days"
            return f"{hours} hours"
        return "Duration not specified"
    
    def __repr__(self) -> str:
        """String representation of the module."""
        return f"<Module(id={self.id}, name='{self.name}', level_id='{self.level_id}', sequence={self.sequence_order})>"