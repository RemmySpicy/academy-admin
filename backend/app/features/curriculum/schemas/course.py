"""
Course schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from .common import (
    CurriculumStatusEnum,
    DifficultyLevelEnum,
    TimestampMixin,
    PaginatedResponse,
)


class CourseBase(BaseModel):
    """Base course schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Course name")
    description: Optional[str] = Field(None, description="Course description")
    program_id: str = Field(..., description="Program ID this course belongs to")
    target_demographic: Optional[str] = Field(None, max_length=200, description="Target demographic")
    duration_weeks: Optional[int] = Field(None, ge=1, le=104, description="Course duration in weeks")
    min_participants: Optional[int] = Field(None, ge=1, description="Minimum number of participants")
    max_participants: Optional[int] = Field(None, ge=1, description="Maximum number of participants")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Course status")
    display_order: int = Field(default=0, description="Display order within program")
    
    @validator('max_participants')
    def validate_max_participants(cls, v, values):
        """Validate max participants is greater than min participants."""
        if v is not None and 'min_participants' in values and values['min_participants'] is not None:
            if v < values['min_participants']:
                raise ValueError('Maximum participants must be greater than or equal to minimum participants')
        return v


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    
    # All required fields are defined in CourseBase
    pass


class CourseUpdate(BaseModel):
    """Schema for updating course information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    program_id: Optional[str] = Field(None)
    target_demographic: Optional[str] = Field(None, max_length=200)
    duration_weeks: Optional[int] = Field(None, ge=1, le=104)
    min_participants: Optional[int] = Field(None, ge=1)
    max_participants: Optional[int] = Field(None, ge=1)
    status: Optional[CurriculumStatusEnum] = Field(None)
    display_order: Optional[int] = Field(None)
    
    @validator('max_participants')
    def validate_max_participants(cls, v, values):
        """Validate max participants is greater than min participants."""
        if v is not None and 'min_participants' in values and values['min_participants'] is not None:
            if v < values['min_participants']:
                raise ValueError('Maximum participants must be greater than or equal to minimum participants')
        return v


class CourseResponse(CourseBase, TimestampMixin):
    """Schema for course response."""
    
    id: str = Field(..., description="Course ID (UUID)")
    
    # Program information
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    curriculum_count: Optional[int] = Field(None, description="Number of curricula in this course")
    total_lesson_count: Optional[int] = Field(None, description="Total lessons across all curricula")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "course-id-1",
                "name": "Introduction to Robotics",
                "description": "Foundational course covering basic robotics concepts and hands-on building",
                "program_id": "program-id-1",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "target_demographic": "Ages 8-12",
                "duration_weeks": 8,
                "min_participants": 6,
                "max_participants": 12,
                "status": "published",
                "display_order": 1,
                "curriculum_count": 4,
                "total_lesson_count": 32,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class CourseListResponse(PaginatedResponse):
    """Schema for paginated course list response."""
    
    items: List[CourseResponse] = Field(..., description="List of courses")


class CourseSearchParams(BaseModel):
    """Parameters for course search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    duration_weeks_min: Optional[int] = Field(None, ge=1, description="Minimum duration weeks")
    duration_weeks_max: Optional[int] = Field(None, ge=1, description="Maximum duration weeks")
    min_participants_min: Optional[int] = Field(None, ge=1, description="Minimum participant count")
    max_participants_max: Optional[int] = Field(None, ge=1, description="Maximum participant count")
    sort_by: Optional[str] = Field("display_order", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class CourseStatsResponse(BaseModel):
    """Schema for course statistics response."""
    
    total_courses: int = Field(..., description="Total number of courses")
    courses_by_status: Dict[str, int] = Field(..., description="Courses grouped by status")
    courses_by_program: Dict[str, int] = Field(..., description="Courses grouped by program")
    average_duration_weeks: float = Field(..., description="Average course duration in weeks")
    average_curricula_per_course: float = Field(..., description="Average number of curricula per course")
    participant_capacity_stats: Dict[str, Any] = Field(..., description="Participant capacity statistics")


class CourseTreeResponse(BaseModel):
    """Schema for course tree structure with curricula and levels."""
    
    id: str = Field(..., description="Course ID")
    name: str = Field(..., description="Course name")
    program_id: str = Field(..., description="Program ID")
    status: CurriculumStatusEnum = Field(..., description="Course status")
    curricula: List[Dict[str, Any]] = Field(default=[], description="List of curricula with their levels")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "course-id-1",
                "name": "Introduction to Robotics",
                "program_id": "program-id-1",
                "status": "published",
                "curricula": [
                    {
                        "id": "curriculum-id-1",
                        "name": "Basic Robot Building",
                        "difficulty_level": "beginner",
                        "levels": [
                            {
                                "id": "level-id-1",
                                "name": "Getting Started",
                                "sequence": 1
                            }
                        ]
                    }
                ]
            }
        }


class CourseBulkMoveRequest(BaseModel):
    """Schema for bulk moving courses between programs."""
    
    course_ids: List[str] = Field(..., min_items=1, description="List of course IDs to move")
    target_program_id: str = Field(..., description="Target program ID")
    preserve_order: bool = Field(default=True, description="Whether to preserve display order")


class CourseBulkStatusUpdateRequest(BaseModel):
    """Schema for bulk status updates."""
    
    course_ids: List[str] = Field(..., min_items=1, description="List of course IDs")
    new_status: CurriculumStatusEnum = Field(..., description="New status to apply")
    update_curricula: bool = Field(default=False, description="Whether to update curricula status as well")