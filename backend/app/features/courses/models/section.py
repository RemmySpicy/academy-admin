"""
Section model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


class Section(BaseModel):
    """
    Section model for managing specific skill areas within modules.
    
    Represents specific skill areas or topics within a module 
    (e.g., Section 1: Introduction to Frog Kick). Each section contains multiple 
    related lessons and defines specific learning outcomes.
    
    Relationships:
    - Many-to-one with modules
    - One-to-many with lessons
    """
    
    __tablename__ = "sections"
    
    # Foreign Key to Module
    module_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("modules.id"),
        nullable=False,
        comment="Reference to parent module",
    )
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Section name (e.g., Introduction to Frog Kick, Water Safety Basics)",
    )
    
    title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Custom title for the section (displays as 'Section 1: Title Name')",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed section description",
    )
    
    # Workout Components
    warm_up: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Warm up instructions for this section",
    )
    
    pre_set: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Pre set instructions for this section",
    )
    
    post_set: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Post set instructions for this section",
    )
    
    cool_down: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Cool down instructions for this section",
    )
    
    # Sequencing and Progression
    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Order of this section within the module",
    )
    
    learning_outcomes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Specific learning outcomes for this section",
    )
    
    # Duration and Time Management
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Estimated duration to complete section in minutes",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Section status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying sections within module",
    )
    
    # Additional metadata
    section_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Section code (e.g., S1, S2, INTRO, BASIC)",
    )
    
    difficulty_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Difficulty level (e.g., Beginner, Intermediate, Advanced)",
    )
    
    prerequisites: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Prerequisites for this section",
    )
    
    instructor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special notes and guidance for instructors",
    )
    
    key_skills: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Key skills developed in this section",
    )
    
    safety_considerations: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Safety considerations specific to this section",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    module = relationship("Module", back_populates="sections")
    lessons = relationship("Lesson", back_populates="section", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_sections_module_id", "module_id"),
        Index("idx_sections_name", "name"),
        Index("idx_sections_status", "status"),
        Index("idx_sections_sequence_order", "sequence_order"),
        Index("idx_sections_display_order", "display_order"),
        Index("idx_sections_difficulty", "difficulty_level"),
        Index("idx_sections_module_sequence", "module_id", "sequence_order"),
        Index("idx_sections_module_name", "module_id", "name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.section_code:
            return f"{self.section_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if section is active."""
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def full_name(self) -> str:
        """Get full section name including module reference."""
        # This will be updated when Module relationship is established
        return f"Module Section: {self.name}"
    
    @property
    def duration_text(self) -> str:
        """Get formatted duration text."""
        if self.estimated_duration_minutes:
            minutes = self.estimated_duration_minutes
            if minutes >= 60:
                hours = minutes // 60
                remaining_minutes = minutes % 60
                if remaining_minutes > 0:
                    return f"{hours}h {remaining_minutes}m"
                return f"{hours}h"
            return f"{minutes}m"
        return "Duration not specified"
    
    def __repr__(self) -> str:
        """String representation of the section."""
        return f"<Section(id={self.id}, name='{self.name}', module_id='{self.module_id}', sequence={self.sequence_order})>"