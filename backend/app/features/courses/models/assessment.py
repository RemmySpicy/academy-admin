"""
Assessment models for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, Integer, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus, RubricType, DifficultyLevel, AssessmentType


class AssessmentRubric(BaseModel):
    """
    Assessment rubric model for managing assessment criteria packages.
    
    Represents comprehensive assessment rubrics that contain multiple assessment criteria.
    Each level contains assessment rubrics with 0-3 star rating system supporting 
    both formative and summative assessment approaches.
    
    Relationships:
    - Many-to-one with levels
    - One-to-many with assessment criteria
    """
    
    __tablename__ = "assessment_rubrics"
    
    # Foreign Key to Level
    level_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("levels.id"),
        nullable=False,
        comment="Reference to parent level",
    )
    
    # Basic Information
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Rubric name (e.g., Swimming Skills Assessment, Safety Knowledge Check)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed rubric description",
    )
    
    # Rubric Configuration
    rubric_type: Mapped[RubricType] = mapped_column(
        default=RubricType.FORMATIVE,
        nullable=False,
        comment="Type of assessment rubric",
    )
    
    total_possible_stars: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
        comment="Maximum stars possible (default 3 for 0-3 star system)",
    )
    
    # Status Management
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Rubric status",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying rubrics within level",
    )
    
    # Additional metadata
    rubric_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Rubric code (e.g., SWIM-L1, SAFETY-L2)",
    )
    
    instructions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Instructions for using this rubric",
    )
    
    scoring_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes about scoring and interpretation",
    )
    
    # New fields for frontend form support
    difficulty_level: Mapped[Optional[DifficultyLevel]] = mapped_column(
        nullable=True,
        comment="Difficulty level of this assessment",
    )
    
    assessment_type: Mapped[Optional[AssessmentType]] = mapped_column(
        nullable=True,
        comment="Type of assessment (quiz, assignment, practical, project)",
    )
    
    assessment_guide: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed guide for instructors on how to conduct this assessment",
    )
    
    is_required: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this assessment is required for level completion",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # level = relationship("Level", back_populates="assessment_rubrics")
    # criteria = relationship("AssessmentCriteria", back_populates="rubric", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_assessment_rubrics_level_id", "level_id"),
        Index("idx_assessment_rubrics_name", "name"),
        Index("idx_assessment_rubrics_status", "status"),
        Index("idx_assessment_rubrics_type", "rubric_type"),
        Index("idx_assessment_rubrics_display_order", "display_order"),
        Index("idx_assessment_rubrics_level_name", "level_id", "name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.rubric_code:
            return f"{self.rubric_code}: {self.name}"
        return self.name
    
    @property
    def is_active(self) -> bool:
        """Check if rubric is active."""
        return self.status == CurriculumStatus.ACTIVE
    
    @property
    def full_name(self) -> str:
        """Get full rubric name including level reference."""
        # This will be updated when Level relationship is established
        return f"Level Rubric: {self.name}"
    
    @property
    def star_range_text(self) -> str:
        """Get formatted star range text."""
        return f"0-{self.total_possible_stars} stars"
    
    def __repr__(self) -> str:
        """String representation of the assessment rubric."""
        return f"<AssessmentRubric(id={self.id}, name='{self.name}', level_id='{self.level_id}', type='{self.rubric_type}')>"


class AssessmentCriteria(BaseModel):
    """
    Assessment criteria model for managing individual assessment criteria.
    
    Represents individual assessment criteria within rubrics. Each criterion maps to 
    specific learning objectives with detailed descriptors for each star level 
    (0-3 stars) and supports weighted scoring.
    
    Relationships:
    - Many-to-one with assessment rubrics
    """
    
    __tablename__ = "assessment_criteria"
    
    # Foreign Key to Assessment Rubric
    rubric_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assessment_rubrics.id"),
        nullable=False,
        comment="Reference to parent rubric",
    )
    
    # Basic Information
    criteria_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Criteria name (e.g., Floating Technique, Safety Awareness)",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed criteria description",
    )
    
    # Scoring and Weighting
    weight_percentage: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2),
        default=100.00,
        nullable=True,
        comment="Weight of this criteria as percentage of total score",
    )
    
    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Order of this criteria within the rubric",
    )
    
    # Star Level Descriptors (0-3 star system)
    zero_star_descriptor: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description for 0 stars (not attempted or no evidence)",
    )
    
    one_star_descriptor: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description for 1 star (beginning - minimal understanding)",
    )
    
    two_star_descriptor: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description for 2 stars (developing - good understanding with assistance)",
    )
    
    three_star_descriptor: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description for 3 stars (proficient - complete understanding and independence)",
    )
    
    # Additional metadata
    criteria_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Criteria code (e.g., FLOAT, SAFETY, STROKE)",
    )
    
    learning_objective: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Learning objective this criteria assesses",
    )
    
    assessment_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes for assessors about this criteria",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # rubric = relationship("AssessmentRubric", back_populates="criteria")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_assessment_criteria_rubric_id", "rubric_id"),
        Index("idx_assessment_criteria_name", "criteria_name"),
        Index("idx_assessment_criteria_sequence_order", "sequence_order"),
        Index("idx_assessment_criteria_weight", "weight_percentage"),
        Index("idx_assessment_criteria_rubric_sequence", "rubric_id", "sequence_order"),
        Index("idx_assessment_criteria_rubric_name", "rubric_id", "criteria_name"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        if self.criteria_code:
            return f"{self.criteria_code}: {self.criteria_name}"
        return self.criteria_name
    
    @property
    def full_name(self) -> str:
        """Get full criteria name including rubric reference."""
        # This will be updated when Rubric relationship is established
        return f"Rubric Criteria: {self.criteria_name}"
    
    @property
    def weight_display(self) -> str:
        """Get formatted weight display."""
        if self.weight_percentage:
            return f"{self.weight_percentage}%"
        return "Not weighted"
    
    def get_star_descriptor(self, star_level: int) -> Optional[str]:
        """Get descriptor for specific star level."""
        if star_level == 0:
            return self.zero_star_descriptor
        elif star_level == 1:
            return self.one_star_descriptor
        elif star_level == 2:
            return self.two_star_descriptor
        elif star_level == 3:
            return self.three_star_descriptor
        return None
    
    def __repr__(self) -> str:
        """String representation of the assessment criteria."""
        return f"<AssessmentCriteria(id={self.id}, name='{self.criteria_name}', rubric_id='{self.rubric_id}', sequence={self.sequence_order})>"