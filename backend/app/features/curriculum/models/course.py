"""
Course model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


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
    
    target_demographic: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Target demographic (e.g., Children 3-12, Adults, Seniors)",
    )
    
    duration_weeks: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Typical course duration in weeks",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Course status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying courses within program",
    )
    
    # Additional metadata
    course_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Course code (e.g., SWIM-CLUB, SWIM-ADULT)",
    )
    
    min_participants: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum number of participants required",
    )
    
    max_participants: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum number of participants allowed",
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
        Index("idx_courses_display_order", "display_order"),
        Index("idx_courses_target_demographic", "target_demographic"),
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
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def full_name(self) -> str:
        """Get full course name including program reference."""
        # This will be updated when Program relationship is established
        return f"Program Course: {self.name}"
    
    def __repr__(self) -> str:
        """String representation of the course."""
        return f"<Course(id={self.id}, name='{self.name}', program_id='{self.program_id}')>"