"""
Program model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import Index, String, Text, Boolean
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
    
    # Relationships
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
    
    def __repr__(self) -> str:
        """String representation of the program."""
        return f"<Program(id={self.id}, name='{self.name}', status='{self.status}')>"