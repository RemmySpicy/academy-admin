"""
Lesson model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus, DifficultyLevel


class Lesson(BaseModel):
    """
    Lesson model for managing individual teaching units.
    
    Represents individual teaching units with specific objectives, detailed instructor 
    guidelines, content, multimedia resources, and assessment criteria.
    
    Relationships:
    - Many-to-one with sections
    - One-to-many with media library items
    """
    
    __tablename__ = "lessons"
    
    # Foreign Key to Section
    section_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sections.id"),
        nullable=False,
        comment="Reference to parent section",
    )
    
    # Lesson Identification
    lesson_id: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Unique lesson identifier (e.g., L101, L102)",
    )
    
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Lesson title",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed lesson description",
    )
    
    # Sequencing and Progression
    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Order of this lesson within the section",
    )
    
    # Content and Instruction
    lesson_content: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Main lesson content and materials",
    )
    
    instructor_guidelines: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed guidelines for instructors",
    )
    
    learning_objectives: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Specific learning objectives for this lesson",
    )
    
    # Duration and Difficulty
    duration_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Lesson duration in minutes",
    )
    
    difficulty_level: Mapped[Optional[DifficultyLevel]] = mapped_column(
        nullable=True,
        comment="Difficulty level of this lesson",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Lesson status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying lessons within section",
    )
    
    # Additional metadata
    prerequisites: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Prerequisites for this lesson",
    )
    
    key_concepts: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Key concepts covered in this lesson",
    )
    
    assessment_criteria: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Assessment criteria for this lesson",
    )
    
    materials_needed: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Materials and equipment needed for this lesson",
    )
    
    safety_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Safety considerations for this lesson",
    )
    
    homework_activities: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Homework or practice activities",
    )
    
    instructor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Special notes and tips for instructors",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # section = relationship("Section", back_populates="lessons")
    # media_files = relationship("MediaLibrary", back_populates="lesson", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_lessons_section_id", "section_id"),
        Index("idx_lessons_lesson_id", "lesson_id"),
        Index("idx_lessons_title", "title"),
        Index("idx_lessons_status", "status"),
        Index("idx_lessons_sequence_order", "sequence_order"),
        Index("idx_lessons_display_order", "display_order"),
        Index("idx_lessons_difficulty", "difficulty_level"),
        Index("idx_lessons_section_sequence", "section_id", "sequence_order"),
        Index("idx_lessons_section_lesson_id", "section_id", "lesson_id"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        return f"{self.lesson_id}: {self.title}"
    
    @property
    def is_active(self) -> bool:
        """Check if lesson is active."""
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def full_name(self) -> str:
        """Get full lesson name including section reference."""
        # This will be updated when Section relationship is established
        return f"Section Lesson: {self.title}"
    
    @property
    def duration_text(self) -> str:
        """Get formatted duration text."""
        if self.duration_minutes:
            minutes = self.duration_minutes
            if minutes >= 60:
                hours = minutes // 60
                remaining_minutes = minutes % 60
                if remaining_minutes > 0:
                    return f"{hours}h {remaining_minutes}m"
                return f"{hours}h"
            return f"{minutes}m"
        return "Duration not specified"
    
    @property
    def difficulty_display(self) -> str:
        """Get display-friendly difficulty level."""
        if self.difficulty_level:
            return self.difficulty_level.value.title()
        return "Not specified"
    
    def __repr__(self) -> str:
        """String representation of the lesson."""
        return f"<Lesson(id={self.id}, lesson_id='{self.lesson_id}', title='{self.title}', section_id='{self.section_id}')>"