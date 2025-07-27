"""
Level model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


class Level(BaseModel):
    """
    Level model for managing progressive skill levels within curricula.
    
    Represents progressive skill levels within a curriculum (e.g., Level 1, Level 2, Level 3).
    Each level has defined entry and exit criteria, contains equipment requirements and 
    assessment rubrics, and students must complete levels sequentially unless overridden by admin.
    
    Relationships:
    - Many-to-one with curricula
    - One-to-many with modules
    - One-to-many with equipment requirements
    - One-to-many with assessment rubrics
    """
    
    __tablename__ = "levels"
    
    # Foreign Key to Curriculum
    curriculum_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("curricula.id"),
        nullable=False,
        comment="Reference to parent curriculum",
    )
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Level name (e.g., Level 1, Level 2, Beginner Level)",
    )
    
    title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Custom title for the level (displays as 'Level 1: Title Name')",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed level description",
    )
    
    intro_video_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL link to introductory video for this level",
    )
    
    equipment_needed: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Equipment needed for this level",
    )
    
    # Sequencing and Progression
    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Order of this level within the curriculum",
    )
    
    entry_criteria: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Entry criteria and prerequisites for this level",
    )
    
    exit_criteria: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Exit criteria and requirements to complete this level",
    )
    
    # Duration and Time Management
    estimated_duration_hours: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Estimated duration to complete level in hours",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Level status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying levels within curriculum",
    )
    
    # Additional metadata
    level_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Level code (e.g., L1, L2, BEG, INT)",
    )
    
    difficulty_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Difficulty level (e.g., Beginner, Intermediate, Advanced)",
    )
    
    learning_objectives: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Specific learning objectives for this level",
    )
    
    instructor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special notes and guidance for instructors",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    curriculum = relationship("Curriculum", back_populates="levels")
    modules = relationship("Module", back_populates="level", cascade="all, delete-orphan")
    # equipment_requirements = relationship("EquipmentRequirement", back_populates="level", cascade="all, delete-orphan")
    
    # Progression system relationships (temporarily disabled due to circular import)
    # assessment_criteria = relationship(
    #     "LevelAssessmentCriteria", 
    #     back_populates="level", 
    #     cascade="all, delete-orphan",
    #     order_by="LevelAssessmentCriteria.sequence_order"
    # )
    # student_assessments = relationship(
    #     "StudentLevelAssessment",
    #     back_populates="level",
    #     cascade="all, delete-orphan"
    # )
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_levels_curriculum_id", "curriculum_id"),
        Index("idx_levels_name", "name"),
        Index("idx_levels_status", "status"),
        Index("idx_levels_sequence_order", "sequence_order"),
        Index("idx_levels_display_order", "display_order"),
        Index("idx_levels_difficulty", "difficulty_level"),
        Index("idx_levels_curriculum_sequence", "curriculum_id", "sequence_order"),
        Index("idx_levels_curriculum_name", "curriculum_id", "name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.level_code:
            return f"{self.level_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if level is active."""
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def full_name(self) -> str:
        """Get full level name including curriculum reference."""
        # This will be updated when Curriculum relationship is established
        return f"Curriculum Level: {self.name}"
    
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
        """String representation of the level."""
        return f"<Level(id={self.id}, name='{self.name}', curriculum_id='{self.curriculum_id}', sequence={self.sequence_order})>"