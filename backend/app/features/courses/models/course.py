"""
Course model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel


class Course(BaseModel):
    """
    Course model for managing courses within programs.
    
    Represents specific offerings within a program (e.g., Swimming Club, Adult Swimming, Survival Swimming).
    Each course targets different demographics or skill focuses and can be active across multiple locations.
    
    Relationships:
    - Many-to-one with programs
    - One-to-many with curricula
    """
    
    __tablename__ = "courses"
    
    # Foreign Key to Program
    program_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("programs.id"),
        nullable=False,
        comment="Reference to parent program",
    )
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Course name (e.g., Swimming Club, Adult Swimming)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed course description",
    )
    
    objectives: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Course learning objectives",
    )
    
    duration_hours: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Typical course duration in hours",
    )
    
    difficulty_level: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Course difficulty level",
    )
    
    prerequisites: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Course prerequisites",
    )
    
    sequence: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Course sequence order",
    )
    
    # Additional metadata
    course_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Course code (e.g., SWIM-CLUB, SWIM-ADULT)",
    )
    
    # Status Management
    status: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Course status",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # program = relationship("Program", back_populates="courses")
    # curricula = relationship("Curriculum", back_populates="course", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_courses_program_id", "program_id"),
        Index("idx_courses_name", "name"),
        Index("idx_courses_status", "status"),
        Index("idx_courses_sequence", "sequence"),
        Index("idx_courses_difficulty_level", "difficulty_level"),
        Index("idx_courses_program_name", "program_id", "name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.course_code:
            return f"{self.course_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if course is active."""
        return self.status == 'active'
    
    @property
    def full_name(self) -> str:
        """Get full course name including program reference."""
        # This will be updated when Program relationship is established
        return f"Program Course: {self.name}"
    
    def __repr__(self) -> str:
        """String representation of the course."""
        return f"<Course(id={self.id}, name='{self.name}', program_id='{self.program_id}')>"