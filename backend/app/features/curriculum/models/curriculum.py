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
    
    # Age and Prerequisites
    min_age: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum age requirement in years",
    )
    
    max_age: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum age requirement in years",
    )
    
    prerequisites: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Prerequisites for this curriculum",
    )
    
    learning_objectives: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Overall learning objectives for this curriculum",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Curriculum status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying curricula within course",
    )
    
    # Additional metadata
    curriculum_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Curriculum code (e.g., SWIM-CLUB-3-5)",
    )
    
    estimated_duration_weeks: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Estimated duration to complete curriculum in weeks",
    )
    
    skill_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Target skill level (e.g., Beginner, Intermediate, Advanced)",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # course = relationship("Course", back_populates="curricula")
    # levels = relationship("Level", back_populates="curriculum", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_curricula_course_id", "course_id"),
        Index("idx_curricula_name", "name"),
        Index("idx_curricula_status", "status"),
        Index("idx_curricula_display_order", "display_order"),
        Index("idx_curricula_age_range", "min_age", "max_age"),
        Index("idx_curricula_skill_level", "skill_level"),
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
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def age_range_text(self) -> str:
        """Get formatted age range text."""
        if self.min_age and self.max_age:
            return f"{self.min_age}-{self.max_age} years"
        elif self.min_age:
            return f"{self.min_age}+ years"
        elif self.max_age:
            return f"Up to {self.max_age} years"
        return "All ages"
    
    @property
    def full_name(self) -> str:
        """Get full curriculum name including course reference."""
        # This will be updated when Course relationship is established
        return f"Course Curriculum: {self.name}"
    
    def __repr__(self) -> str:
        """String representation of the curriculum."""
        return f"<Curriculum(id={self.id}, name='{self.name}', course_id='{self.course_id}')>"