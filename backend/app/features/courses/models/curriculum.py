"""
Curriculum model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


class Curriculum(BaseModel):
    """
    Curriculum model for managing age-specific or skill-level-specific learning pathways.
    
    Represents age-specific or skill-level-specific groupings within courses 
    (e.g., Swimming Club: 3-5, Swimming Club: 6-18). Each curriculum defines a complete 
    learning pathway with specific target age ranges and prerequisites.
    
    Relationships:
    - Many-to-one with courses
    - One-to-many with levels
    """
    
    __tablename__ = "curricula"
    
    # Foreign Key to Course
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.id"),
        nullable=False,
        comment="Reference to parent course",
    )
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Curriculum name (e.g., Swimming Club: 3-5, Swimming Club: 6-18)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed curriculum description",
    )
    
    # Learning Content
    objectives: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Learning objectives for this curriculum",
    )
    
    duration_hours: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Duration in hours for this curriculum",
    )
    
    difficulty_level: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Difficulty level (e.g., beginner, intermediate, advanced)",
    )
    
    prerequisites: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Prerequisites for this curriculum",
    )
    
    # Display and Ordering
    sequence: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Sequence order for displaying curricula within course",
    )
    
    # Additional metadata
    curriculum_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Curriculum code (e.g., SWIM-FUNDAMENTALS-01)",
    )
    
    # Status Management
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Curriculum status",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    course = relationship("Course", back_populates="curricula")
    levels = relationship("Level", back_populates="curriculum", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_curricula_course_id", "course_id"),
        Index("idx_curricula_name", "name"),
        Index("idx_curricula_status", "status"),
        Index("idx_curricula_sequence", "sequence"),
        Index("idx_curricula_difficulty_level", "difficulty_level"),
        Index("idx_curricula_course_name", "course_id", "name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.curriculum_code:
            return f"{self.curriculum_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if curriculum is active."""
        return self.status == "active"
    
    @property
    def full_name(self) -> str:
        """Get full curriculum name including course reference."""
        # This will be updated when Course relationship is established
        return f"Course Curriculum: {self.name}"
    
    def __repr__(self) -> str:
        """String representation of the curriculum."""
        return f"<Curriculum(id={self.id}, name='{self.name}', course_id='{self.course_id}')>"