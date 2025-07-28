"""
Program model for curriculum management.
"""

from typing import List, Optional, Dict, Any

from sqlalchemy import Index, String, Text, Boolean, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


class Program(BaseModel):
    """
    Program model for managing educational programs.
    
    Represents the top-level categorization of academy offerings (e.g., Swimming, Football, Basketball).
    Programs are location-independent but can be assigned to specific facilities.
    
    Relationships:
    - One-to-many with courses
    - Indirect relationship with all curriculum hierarchy levels
    """
    
    __tablename__ = "programs"
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Program name (e.g., Swimming, Football, Basketball)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed program description",
    )
    
    category: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Program category (e.g., Sports, Arts, Academic)",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Program status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying programs",
    )
    
    # Additional metadata
    program_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        unique=True,
        nullable=True,
        comment="Unique program code (e.g., SWIM, FOOT, BASK)",
    )
    
    # Enhanced Configuration Fields
    age_groups: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Age group configurations for the program",
    )
    
    difficulty_levels: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Difficulty level definitions for the program",
    )
    
    session_types: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Session type configurations for the program",
    )
    
    default_session_duration: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Default session duration in minutes",
    )
    
    # Relationships
    user_assignments = relationship(
        "UserProgramAssignment",
        back_populates="program",
        cascade="all, delete-orphan"
    )
    
    # Note: Other relationships are managed through foreign keys in other models
    # and can be accessed via joins or proper relationship definitions
    
    # Note: Relationship to courses will be defined when course model is created
    # courses = relationship("Course", back_populates="program", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_programs_name", "name"),
        Index("idx_programs_status", "status"),
        Index("idx_programs_category", "category"),
        Index("idx_programs_display_order", "display_order"),
        Index("idx_programs_code", "program_code"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.program_code:
            return f"{self.program_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if program is active."""
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def has_configuration(self) -> bool:
        """Check if program has enhanced configuration."""
        return (
            self.age_groups is not None or
            self.difficulty_levels is not None or
            self.session_types is not None or
            self.default_session_duration is not None
        )
    
    def get_age_group_by_id(self, age_group_id: str) -> Optional[Dict[str, Any]]:
        """Get age group by ID."""
        if not self.age_groups:
            return None
        return next((ag for ag in self.age_groups if ag.get('id') == age_group_id), None)
    
    def get_difficulty_level_by_id(self, level_id: str) -> Optional[Dict[str, Any]]:
        """Get difficulty level by ID."""
        if not self.difficulty_levels:
            return None
        return next((dl for dl in self.difficulty_levels if dl.get('id') == level_id), None)
    
    def get_session_type_by_id(self, session_type_id: str) -> Optional[Dict[str, Any]]:
        """Get session type by ID."""
        if not self.session_types:
            return None
        return next((st for st in self.session_types if st.get('id') == session_type_id), None)
    
    def get_difficulty_levels_sorted(self) -> List[Dict[str, Any]]:
        """Get difficulty levels sorted by weight."""
        if not self.difficulty_levels:
            return []
        return sorted(self.difficulty_levels, key=lambda x: x.get('weight', 0))
    
    def __repr__(self) -> str:
        """String representation of the program."""
        return f"<Program(id={self.id}, name='{self.name}', status='{self.status}')>"