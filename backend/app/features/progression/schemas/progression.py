"""
Pydantic schemas for the star-based curriculum progression system.

This module defines the request/response schemas for the progression system
including progression settings, assessment criteria, student progress tracking,
and analytics data.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum

from .common import TimestampMixin, PaginatedResponse


class AssessmentStatus(str, Enum):
    """Assessment status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    SUSPENDED = "suspended"
    PASSED = "passed"
    FAILED = "failed"


class EntityType(str, Enum):
    """Analytics entity type enumeration."""
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    CURRICULUM = "curriculum"
    LEVEL = "level"
    MODULE = "module"


class PeriodType(str, Enum):
    """Analytics period type enumeration."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


# Curriculum Progression Settings Schemas
class CurriculumProgressionSettingsBase(BaseModel):
    """Base schema for curriculum progression settings."""
    
    module_unlock_threshold_percentage: float = Field(
        default=70.0,
        ge=0.0,
        le=100.0,
        description="Percentage of stars needed to unlock next module"
    )
    require_minimum_one_star_per_lesson: bool = Field(
        default=True,
        description="Require at least 1 star per lesson for module unlock"
    )
    allow_cross_level_progression: bool = Field(
        default=True,
        description="Allow progression to next level while current assessment is pending"
    )
    allow_lesson_retakes: bool = Field(
        default=True,
        description="Allow students to retake lessons for better scores"
    )
    track_time_spent: bool = Field(
        default=True,
        description="Track time spent on lessons for analytics"
    )
    track_attempts: bool = Field(
        default=True,
        description="Track lesson attempts for analytics"
    )


class CurriculumProgressionSettingsCreate(CurriculumProgressionSettingsBase):
    """Schema for creating curriculum progression settings."""
    
    curriculum_id: str = Field(..., description="ID of the curriculum")


class CurriculumProgressionSettingsUpdate(BaseModel):
    """Schema for updating curriculum progression settings."""
    
    module_unlock_threshold_percentage: Optional[float] = Field(
        None, ge=0.0, le=100.0
    )
    require_minimum_one_star_per_lesson: Optional[bool] = None
    allow_cross_level_progression: Optional[bool] = None
    allow_lesson_retakes: Optional[bool] = None
    track_time_spent: Optional[bool] = None
    track_attempts: Optional[bool] = None


class CurriculumProgressionSettingsResponse(CurriculumProgressionSettingsBase, TimestampMixin):
    """Schema for curriculum progression settings response."""
    
    id: str = Field(..., description="Settings ID")
    curriculum_id: str = Field(..., description="Curriculum ID")
    status: str = Field(..., description="Settings status")
    
    class Config:
        from_attributes = True


# Level Assessment Criteria Schemas
class ScoreDescriptor(BaseModel):
    """Score descriptor for assessment criteria."""
    
    score: int = Field(..., ge=0, le=3, description="Score value (0-3)")
    description: str = Field(..., description="Description of what this score represents")


class LevelAssessmentCriteriaBase(BaseModel):
    """Base schema for level assessment criteria."""
    
    name: str = Field(..., min_length=1, max_length=255, description="Criteria name")
    description: Optional[str] = Field(None, description="Criteria description")
    sequence_order: int = Field(..., ge=1, description="Display order")
    weight: float = Field(default=1.0, ge=0.1, le=5.0, description="Criteria weight")
    max_score: int = Field(default=3, ge=1, le=5, description="Maximum score")
    min_passing_score: int = Field(default=1, ge=0, description="Minimum passing score")
    assessment_guidelines: Optional[str] = Field(None, description="Assessment guidelines")
    score_descriptors: Optional[List[ScoreDescriptor]] = Field(
        None, description="Score level descriptions"
    )
    
    @validator('min_passing_score')
    def validate_min_passing_score(cls, v, values):
        """Validate minimum passing score is not greater than max score."""
        max_score = values.get('max_score', 3)
        if v > max_score:
            raise ValueError('Minimum passing score cannot exceed maximum score')
        return v


class LevelAssessmentCriteriaCreate(LevelAssessmentCriteriaBase):
    """Schema for creating level assessment criteria."""
    
    level_id: str = Field(..., description="Level ID")


class LevelAssessmentCriteriaUpdate(BaseModel):
    """Schema for updating level assessment criteria."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    sequence_order: Optional[int] = Field(None, ge=1)
    weight: Optional[float] = Field(None, ge=0.1, le=5.0)
    max_score: Optional[int] = Field(None, ge=1, le=5)
    min_passing_score: Optional[int] = Field(None, ge=0)
    assessment_guidelines: Optional[str] = None
    score_descriptors: Optional[List[ScoreDescriptor]] = None


class LevelAssessmentCriteriaResponse(LevelAssessmentCriteriaBase, TimestampMixin):
    """Schema for level assessment criteria response."""
    
    id: str = Field(..., description="Criteria ID")
    level_id: str = Field(..., description="Level ID")
    status: str = Field(..., description="Criteria status")
    weighted_max_score: float = Field(..., description="Maximum weighted score")
    
    class Config:
        from_attributes = True


# Student Progress Schemas
class StudentLessonProgressBase(BaseModel):
    """Base schema for student lesson progress."""
    
    stars_earned: Optional[int] = Field(
        None, ge=0, le=3, description="Stars earned (0-3, null if not graded)"
    )
    is_completed: bool = Field(default=False, description="Lesson completion status")
    instructor_notes: Optional[str] = Field(None, description="Instructor notes")


class StudentLessonProgressCreate(StudentLessonProgressBase):
    """Schema for creating student lesson progress."""
    
    student_id: str = Field(..., description="Student ID")
    lesson_id: str = Field(..., description="Lesson ID")


class StudentLessonProgressUpdate(BaseModel):
    """Schema for updating student lesson progress."""
    
    stars_earned: Optional[int] = Field(None, ge=0, le=3)
    is_completed: Optional[bool] = None
    instructor_notes: Optional[str] = None
    graded_by_instructor_id: Optional[str] = Field(None, description="Grading instructor ID")


class StudentLessonProgressResponse(StudentLessonProgressBase, TimestampMixin):
    """Schema for student lesson progress response."""
    
    id: str = Field(..., description="Progress ID")
    student_id: str = Field(..., description="Student ID")
    lesson_id: str = Field(..., description="Lesson ID")
    completion_date: Optional[datetime] = Field(None, description="Completion date")
    last_attempt_date: Optional[datetime] = Field(None, description="Last attempt date")
    attempt_count: int = Field(..., description="Number of attempts")
    total_time_spent_minutes: Optional[int] = Field(None, description="Time spent in minutes")
    graded_by_instructor_id: Optional[str] = Field(None, description="Grading instructor ID")
    graded_date: Optional[datetime] = Field(None, description="Grading date")
    
    # Related data
    student_name: Optional[str] = Field(None, description="Student name")
    lesson_title: Optional[str] = Field(None, description="Lesson title")
    instructor_name: Optional[str] = Field(None, description="Instructor name")
    
    class Config:
        from_attributes = True


class BulkLessonGradingRequest(BaseModel):
    """Schema for bulk grading multiple lessons."""
    
    grades: List[Dict[str, Any]] = Field(
        ...,
        description="List of grading data with student_id, lesson_id, stars_earned, notes"
    )
    instructor_id: str = Field(..., description="Instructor performing the grading")
    
    class Config:
        schema_extra = {
            "example": {
                "grades": [
                    {
                        "student_id": "student-1",
                        "lesson_id": "lesson-1",
                        "stars_earned": 3,
                        "notes": "Excellent performance"
                    },
                    {
                        "student_id": "student-2", 
                        "lesson_id": "lesson-1",
                        "stars_earned": 2,
                        "notes": "Good work, needs practice with technique"
                    }
                ],
                "instructor_id": "instructor-1"
            }
        }


# Module Unlock Schemas
class StudentModuleUnlockBase(BaseModel):
    """Base schema for student module unlock."""
    
    is_unlocked: bool = Field(..., description="Module unlock status")
    stars_earned: int = Field(..., ge=0, description="Stars earned in previous module")
    total_possible_stars: int = Field(..., ge=0, description="Total possible stars")
    unlock_percentage: float = Field(..., ge=0, le=100, description="Unlock percentage achieved")
    threshold_met: bool = Field(..., description="Whether threshold was met")


class StudentModuleUnlockResponse(StudentModuleUnlockBase, TimestampMixin):
    """Schema for student module unlock response."""
    
    id: str = Field(..., description="Unlock record ID")
    student_id: str = Field(..., description="Student ID")
    module_id: str = Field(..., description="Module ID")
    unlocked_date: Optional[datetime] = Field(None, description="Unlock date")
    
    # Related data
    student_name: Optional[str] = Field(None, description="Student name")
    module_name: Optional[str] = Field(None, description="Module name")
    
    class Config:
        from_attributes = True


# Level Assessment Schemas
class CriteriaScore(BaseModel):
    """Individual criteria score in an assessment."""
    
    criteria_id: str = Field(..., description="Assessment criteria ID")
    score: int = Field(..., ge=0, le=3, description="Score given (0-3)")
    notes: Optional[str] = Field(None, description="Notes for this criteria")


class StudentLevelAssessmentBase(BaseModel):
    """Base schema for student level assessment."""
    
    criteria_scores: Dict[str, int] = Field(
        default_factory=dict,
        description="Mapping of criteria_id to scores"
    )
    can_continue_next_level: bool = Field(
        default=True,
        description="Whether student can continue to next level"
    )
    progression_suspended: bool = Field(
        default=False,
        description="Whether progression is suspended"
    )
    suspension_reason: Optional[str] = Field(None, description="Reason for suspension")
    instructor_notes: Optional[str] = Field(None, description="Instructor assessment notes")
    remediation_notes: Optional[str] = Field(None, description="Remediation requirements")


class StudentLevelAssessmentCreate(StudentLevelAssessmentBase):
    """Schema for creating student level assessment."""
    
    student_id: str = Field(..., description="Student ID")
    level_id: str = Field(..., description="Level ID")
    assessed_by_instructor_id: str = Field(..., description="Assessing instructor ID")


class StudentLevelAssessmentUpdate(BaseModel):
    """Schema for updating student level assessment."""
    
    criteria_scores: Optional[Dict[str, int]] = None
    status: Optional[AssessmentStatus] = None
    can_continue_next_level: Optional[bool] = None
    progression_suspended: Optional[bool] = None
    suspension_reason: Optional[str] = None
    instructor_notes: Optional[str] = None
    remediation_notes: Optional[str] = None


class StudentLevelAssessmentResponse(StudentLevelAssessmentBase, TimestampMixin):
    """Schema for student level assessment response."""
    
    id: str = Field(..., description="Assessment ID")
    student_id: str = Field(..., description="Student ID")
    level_id: str = Field(..., description="Level ID")
    assessed_by_instructor_id: str = Field(..., description="Assessing instructor ID")
    status: AssessmentStatus = Field(..., description="Assessment status")
    assessment_date: Optional[datetime] = Field(None, description="Assessment completion date")
    overall_score: Optional[float] = Field(None, description="Overall weighted score")
    passed: Optional[bool] = Field(None, description="Whether assessment was passed")
    
    # Related data
    student_name: Optional[str] = Field(None, description="Student name")
    level_name: Optional[str] = Field(None, description="Level name")
    instructor_name: Optional[str] = Field(None, description="Instructor name")
    
    class Config:
        from_attributes = True


# Analytics Schemas
class ProgressionAnalyticsBase(BaseModel):
    """Base schema for progression analytics."""
    
    entity_type: EntityType = Field(..., description="Type of entity being tracked")
    entity_id: str = Field(..., description="ID of the entity")
    period_type: PeriodType = Field(..., description="Analytics period type")
    period_start: datetime = Field(..., description="Period start date")
    period_end: datetime = Field(..., description="Period end date")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Analytics metrics")


class ProgressionAnalyticsCreate(ProgressionAnalyticsBase):
    """Schema for creating progression analytics."""
    pass


class ProgressionAnalyticsResponse(ProgressionAnalyticsBase, TimestampMixin):
    """Schema for progression analytics response."""
    
    id: str = Field(..., description="Analytics record ID")
    
    class Config:
        from_attributes = True


# Student Progress Dashboard Schemas
class StudentProgressSummary(BaseModel):
    """Summary of student progress across curriculum."""
    
    student_id: str = Field(..., description="Student ID")
    student_name: str = Field(..., description="Student name")
    curriculum_id: str = Field(..., description="Curriculum ID")
    curriculum_name: str = Field(..., description="Curriculum name")
    
    # Progress metrics
    total_lessons: int = Field(..., description="Total lessons in curriculum")
    completed_lessons: int = Field(..., description="Completed lessons")
    graded_lessons: int = Field(..., description="Graded lessons")
    average_stars: Optional[float] = Field(None, description="Average star rating")
    
    # Module progress
    total_modules: int = Field(..., description="Total modules in curriculum")
    unlocked_modules: int = Field(..., description="Unlocked modules")
    current_module: Optional[Dict[str, Any]] = Field(None, description="Current module info")
    
    # Level progress
    current_level: Optional[Dict[str, Any]] = Field(None, description="Current level info")
    pending_assessments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Pending level assessments"
    )
    
    # Time tracking
    total_time_spent_minutes: int = Field(..., description="Total time spent")
    last_activity_date: Optional[datetime] = Field(None, description="Last activity date")
    
    class Config:
        from_attributes = True


class InstructorDashboardSummary(BaseModel):
    """Summary for instructor dashboard."""
    
    instructor_id: str = Field(..., description="Instructor ID")
    instructor_name: str = Field(..., description="Instructor name")
    
    # Grading metrics
    students_to_grade: int = Field(..., description="Students with lessons pending grading")
    assessments_to_complete: int = Field(..., description="Level assessments to complete")
    total_students_assigned: int = Field(..., description="Total assigned students")
    
    # Recent activity
    recent_gradings: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Recent grading activity"
    )
    
    pending_assessments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Pending level assessments"
    )
    
    class Config:
        from_attributes = True


# List Response Schemas
class StudentLessonProgressListResponse(PaginatedResponse):
    """Paginated student lesson progress list."""
    items: List[StudentLessonProgressResponse]


class StudentLevelAssessmentListResponse(PaginatedResponse):
    """Paginated student level assessment list."""
    items: List[StudentLevelAssessmentResponse]


class LevelAssessmentCriteriaListResponse(PaginatedResponse):
    """Paginated level assessment criteria list."""
    items: List[LevelAssessmentCriteriaResponse]


class ProgressionAnalyticsListResponse(PaginatedResponse):
    """Paginated progression analytics list."""
    items: List[ProgressionAnalyticsResponse]