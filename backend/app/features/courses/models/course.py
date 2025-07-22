"""
Course model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer, Boolean, JSON
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
        String(200),
        nullable=False,
        comment="Course name (e.g., Swimming Club, Adult Swimming)",
    )
    
    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Course code (e.g., SWIM-CLUB, SWIM-ADULT)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed course description",
    )
    
    objectives: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Course learning objectives as array",
    )
    
    prerequisites: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Course prerequisites as array",
    )
    
    # Duration and Session Configuration
    duration_weeks: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Course duration in weeks",
    )
    
    sessions_per_payment: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=8,
        comment="Number of sessions included in each payment",
    )
    
    completion_deadline_weeks: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=6,
        comment="Time limit to complete paid sessions",
    )
    
    # Availability Configuration
    age_ranges: Mapped[List[str]] = mapped_column(
        JSON,
        nullable=False,
        comment="Available age ranges for this course",
    )
    
    location_types: Mapped[List[str]] = mapped_column(
        JSON,
        nullable=False,
        comment="Available location types (our-facility, client-location, virtual)",
    )
    
    session_types: Mapped[List[str]] = mapped_column(
        JSON,
        nullable=False,
        comment="Available session types (group, private)",
    )
    
    # Pricing Configuration
    pricing_matrix: Mapped[List[dict]] = mapped_column(
        JSON,
        nullable=False,
        comment="Pricing matrix with age_range, location_type, session_type, price",
    )
    
    # Enrollment Configuration
    max_students: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum number of students per session",
    )
    
    min_students: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum number of students per session",
    )
    
    instructor_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True,
        comment="Assigned instructor ID",
    )
    
    # Media and Resources
    image_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Course thumbnail image URL",
    )
    
    video_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Course preview video URL",
    )
    
    # Course Properties
    sequence: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Course sequence order in program",
    )
    
    difficulty_level: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Course difficulty level",
    )
    
    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this course is featured",
    )
    
    is_certification_course: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this course offers certification",
    )
    
    tags: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Course tags for categorization",
    )
    
    # Status Management
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default='draft',
        comment="Course status (draft, published, archived, under_review)",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # program = relationship("Program", back_populates="courses")
    curricula = relationship("Curriculum", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_courses_program_id", "program_id"),
        Index("idx_courses_name", "name"),
        Index("idx_courses_code", "code"),
        Index("idx_courses_status", "status"),
        Index("idx_courses_sequence", "sequence"),
        Index("idx_courses_difficulty_level", "difficulty_level"),
        Index("idx_courses_is_featured", "is_featured"),
        Index("idx_courses_is_certification", "is_certification_course"),
        Index("idx_courses_program_name", "program_id", "name"),
        Index("idx_courses_program_code", "program_id", "code"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        return f"{self.code}: {self.name}"
    
    @property
    def is_active(self) -> bool:
        """Check if course is active."""
        return self.status == 'published'
    
    @property
    def total_pricing_options(self) -> int:
        """Get total number of pricing options."""
        return len(self.pricing_matrix) if self.pricing_matrix else 0
    
    @property
    def full_name(self) -> str:
        """Get full course name including program reference."""
        # This will be updated when Program relationship is established
        return f"Program Course: {self.name}"
    
    def __repr__(self) -> str:
        """String representation of the course."""
        return f"<Course(id={self.id}, name='{self.name}', program_id='{self.program_id}')>"