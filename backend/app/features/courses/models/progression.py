"""
Progression and Assessment models for the star-based curriculum progression system.

This module implements the sophisticated star-based progression system where:
- Students earn 0-3 stars per lesson (instructor graded)
- Modules unlock based on configurable star percentage thresholds
- Level assessments gate progression with instructor oversight
- Cross-level progression allowed while assessments are pending
"""

from typing import List, Optional
from datetime import datetime

from sqlalchemy import ForeignKey, Index, String, Text, Integer, Float, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSON

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import CurriculumStatus


class CurriculumProgressionSettings(BaseModel):
    """
    Curriculum-level progression configuration settings.
    
    Defines unlock thresholds, assessment criteria, and progression rules
    specific to each curriculum. These settings control how students
    progress through the curriculum's levels and modules.
    """
    
    __tablename__ = "curriculum_progression_settings"
    
    # Foreign Key to Curriculum
    curriculum_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("curricula.id"),
        nullable=False,
        unique=True,
        comment="Reference to parent curriculum",
    )
    
    # Module Unlock Settings
    module_unlock_threshold_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=70.0,
        comment="Percentage of total stars needed to unlock next module (e.g., 70.0 = 70%)",
    )
    
    require_minimum_one_star_per_lesson: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether every lesson must have at least 1 star for module unlock",
    )
    
    # Assessment Settings
    allow_cross_level_progression: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether students can start next level while current level assessment is pending",
    )
    
    # Retake and Remediation Settings
    allow_lesson_retakes: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether students can retake lessons to improve their star rating",
    )
    
    # Analytics Settings
    track_time_spent: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether to track time spent on lessons for analytics",
    )
    
    track_attempts: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether to track lesson attempts for analytics",
    )
    
    # Status and Metadata
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Settings status",
    )
    
    # Relationships
    curriculum = relationship("Curriculum", backref="progression_settings")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_progression_settings_curriculum_id", "curriculum_id"),
        Index("idx_progression_settings_status", "status"),
    )
    
    def __repr__(self) -> str:
        return f"<CurriculumProgressionSettings(curriculum_id='{self.curriculum_id}', threshold={self.module_unlock_threshold_percentage}%)>"


class LevelAssessmentCriteria(BaseModel):
    """
    Assessment criteria definitions for level proficiency assessments.
    
    Defines 5-10 key skills that instructors evaluate at the end of each level.
    Each criterion can be weighted equally or have custom weights based on 
    dynamic needs.
    """
    
    __tablename__ = "level_assessment_criteria"
    
    # Foreign Key to Level
    level_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("levels.id"),
        nullable=False,
        comment="Reference to the level being assessed",
    )
    
    # Criteria Definition
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Name of the assessment criteria (e.g., 'Water Safety Knowledge')",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed description of what this criteria assesses",
    )
    
    # Sequence and Weighting
    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Display order of this criteria in assessments",
    )
    
    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
        comment="Weight of this criteria in overall assessment (1.0 = equal weight)",
    )
    
    # Assessment Configuration
    max_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,
        comment="Maximum score for this criteria (typically 0-3 stars)",
    )
    
    min_passing_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Minimum score required to pass this criteria",
    )
    
    # Assessment Guidelines
    assessment_guidelines: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Guidelines for instructors on how to assess this criteria",
    )
    
    score_descriptors: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="JSON object describing what each score level represents",
    )
    
    # Status and Metadata
    status: Mapped[CurriculumStatus] = mapped_column(
        default=CurriculumStatus.ACTIVE,
        nullable=False,
        comment="Criteria status",
    )
    
    # Relationships
    level = relationship("Level", backref="assessment_criteria")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_assessment_criteria_level_id", "level_id"),
        Index("idx_assessment_criteria_sequence", "level_id", "sequence_order"),
        Index("idx_assessment_criteria_status", "status"),
    )
    
    @property
    def weighted_max_score(self) -> float:
        """Calculate the maximum weighted score for this criteria."""
        return self.max_score * self.weight
    
    def __repr__(self) -> str:
        return f"<LevelAssessmentCriteria(level_id='{self.level_id}', name='{self.name}', weight={self.weight})>"


class StudentLessonProgress(BaseModel):
    """
    Individual student progress tracking for lessons.
    
    Tracks star ratings (0-3), completion status, time spent, and attempts
    for each student on each lesson. Supports retakes and progress analytics.
    """
    
    __tablename__ = "student_lesson_progress"
    
    # Foreign Keys
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="Reference to the student",
    )
    
    lesson_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("lessons.id"),
        nullable=False,
        comment="Reference to the lesson",
    )
    
    # Progress Tracking
    stars_earned: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Stars earned by student (0-3), null if not yet graded",
    )
    
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether the lesson has been completed by the student",
    )
    
    completion_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the lesson was first completed",
    )
    
    last_attempt_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="Date of the most recent attempt",
    )
    
    # Analytics Data
    attempt_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of times student has attempted this lesson",
    )
    
    total_time_spent_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Total time spent on this lesson across all attempts",
    )
    
    # Grading Information
    graded_by_instructor_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
        comment="Instructor who graded this lesson",
    )
    
    graded_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the lesson was graded",
    )
    
    instructor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes from the instructor about student performance",
    )
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id], backref="lesson_progress")
    lesson = relationship("Lesson", backref="student_progress")
    graded_by = relationship("User", foreign_keys=[graded_by_instructor_id])
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_lesson_progress_student_id", "student_id"),
        Index("idx_lesson_progress_lesson_id", "lesson_id"),
        Index("idx_lesson_progress_student_lesson", "student_id", "lesson_id"),
        Index("idx_lesson_progress_completion", "is_completed"),
        Index("idx_lesson_progress_stars", "stars_earned"),
        Index("idx_lesson_progress_graded_by", "graded_by_instructor_id"),
    )
    
    def __repr__(self) -> str:
        return f"<StudentLessonProgress(student_id='{self.student_id}', lesson_id='{self.lesson_id}', stars={self.stars_earned})>"


class StudentModuleUnlock(BaseModel):
    """
    Module unlock status tracking for students.
    
    Tracks which modules each student has unlocked based on their lesson
    progress and the curriculum's unlock thresholds.
    """
    
    __tablename__ = "student_module_unlocks"
    
    # Foreign Keys
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="Reference to the student",
    )
    
    module_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("modules.id"),
        nullable=False,
        comment="Reference to the module",
    )
    
    # Unlock Status
    is_unlocked: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this module is unlocked for the student",
    )
    
    unlocked_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the module was unlocked",
    )
    
    # Unlock Calculation Data
    stars_earned: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Total stars earned in the previous module",
    )
    
    total_possible_stars: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Total possible stars in the previous module",
    )
    
    unlock_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="Percentage achieved for unlock calculation",
    )
    
    threshold_met: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether the unlock threshold was met",
    )
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id], backref="module_unlocks")
    module = relationship("Module", backref="student_unlocks")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_module_unlocks_student_id", "student_id"),
        Index("idx_module_unlocks_module_id", "module_id"),
        Index("idx_module_unlocks_student_module", "student_id", "module_id"),
        Index("idx_module_unlocks_is_unlocked", "is_unlocked"),
        Index("idx_module_unlocks_threshold_met", "threshold_met"),
    )
    
    def __repr__(self) -> str:
        return f"<StudentModuleUnlock(student_id='{self.student_id}', module_id='{self.module_id}', unlocked={self.is_unlocked})>"


class StudentLevelAssessment(BaseModel):
    """
    Level proficiency assessment results for students.
    
    Records instructor assessments of student proficiency on level criteria.
    Includes suspension/continuation decisions and progression control.
    """
    
    __tablename__ = "student_level_assessments"
    
    # Foreign Keys
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="Reference to the student being assessed",
    )
    
    level_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("levels.id"),
        nullable=False,
        comment="Reference to the level being assessed",
    )
    
    assessed_by_instructor_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id"),
        nullable=False,
        comment="Instructor who performed the assessment",
    )
    
    # Assessment Status
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default='pending',
        comment="Assessment status: pending, completed, suspended, passed, failed",
    )
    
    assessment_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
        comment="When the assessment was completed",
    )
    
    # Assessment Results
    criteria_scores: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
        comment="JSON object mapping criteria_id to scores",
    )
    
    overall_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Calculated overall weighted score",
    )
    
    passed: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True,
        comment="Whether the student passed the level assessment",
    )
    
    # Progression Control
    can_continue_next_level: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether student can continue to next level",
    )
    
    progression_suspended: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether progression has been suspended by instructor",
    )
    
    suspension_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for progression suspension",
    )
    
    # Assessment Notes
    instructor_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Instructor notes about the assessment",
    )
    
    remediation_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes about required remediation before progression",
    )
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id], backref="level_assessments")
    level = relationship("Level", backref="student_assessments")
    assessed_by = relationship("User", foreign_keys=[assessed_by_instructor_id])
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_level_assessments_student_id", "student_id"),
        Index("idx_level_assessments_level_id", "level_id"),
        Index("idx_level_assessments_student_level", "student_id", "level_id"),
        Index("idx_level_assessments_status", "status"),
        Index("idx_level_assessments_passed", "passed"),
        Index("idx_level_assessments_suspended", "progression_suspended"),
        Index("idx_level_assessments_instructor", "assessed_by_instructor_id"),
    )
    
    def calculate_overall_score(self, criteria_list: List['LevelAssessmentCriteria']) -> float:
        """Calculate the overall weighted score based on criteria scores."""
        if not self.criteria_scores or not criteria_list:
            return 0.0
            
        total_weighted_score = 0.0
        total_possible_weighted = 0.0
        
        for criteria in criteria_list:
            score = self.criteria_scores.get(criteria.id, 0)
            weighted_score = score * criteria.weight
            max_weighted_score = criteria.max_score * criteria.weight
            
            total_weighted_score += weighted_score
            total_possible_weighted += max_weighted_score
        
        if total_possible_weighted == 0:
            return 0.0
            
        return (total_weighted_score / total_possible_weighted) * 100.0
    
    def __repr__(self) -> str:
        return f"<StudentLevelAssessment(student_id='{self.student_id}', level_id='{self.level_id}', status='{self.status}')>"


class ProgressionAnalytics(BaseModel):
    """
    Analytics data for curriculum progression tracking.
    
    Stores aggregated analytics data for identifying struggling students,
    instructor efficiency, and curriculum effectiveness.
    """
    
    __tablename__ = "progression_analytics"
    
    # Foreign Keys (flexible - can be student, instructor, curriculum, etc.)
    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Type of entity: student, instructor, curriculum, level, module",
    )
    
    entity_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        comment="ID of the entity being tracked",
    )
    
    # Time Period
    period_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Analytics period: daily, weekly, monthly, quarterly",
    )
    
    period_start: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        comment="Start of the analytics period",
    )
    
    period_end: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        comment="End of the analytics period",
    )
    
    # Analytics Data
    metrics: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
        comment="JSON object containing various analytics metrics",
    )
    
    # Common Metrics Structure Example:
    # For students: {
    #   "lessons_completed": 15,
    #   "average_stars": 2.3,
    #   "modules_unlocked": 3,
    #   "time_spent_minutes": 420,
    #   "struggling_indicators": ["low_stars", "high_attempts"]
    # }
    # For instructors: {
    #   "students_graded": 25,
    #   "average_grading_time": 5.2,
    #   "grade_distribution": {"0": 2, "1": 8, "2": 10, "3": 5}
    # }
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_analytics_entity_type", "entity_type"),
        Index("idx_analytics_entity_id", "entity_id"),
        Index("idx_analytics_period", "period_type", "period_start"),
        Index("idx_analytics_entity_period", "entity_type", "entity_id", "period_start"),
    )
    
    def __repr__(self) -> str:
        return f"<ProgressionAnalytics(entity_type='{self.entity_type}', entity_id='{self.entity_id}', period='{self.period_type}')>"