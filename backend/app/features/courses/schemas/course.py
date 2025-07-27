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


class PricingEntry(BaseModel):
    """Schema for individual pricing matrix entry."""
    
    age_group: str = Field(..., description="Age group (e.g., '6-12', '13-17')")
    location_type: str = Field(..., description="Location type (our-facility, client-location, virtual)")
    session_type: str = Field(..., description="Session type (group, private)")
    price: float = Field(..., ge=0, description="Price in NGN")


class CourseBase(BaseModel):
    """Base course schema with common fields."""
    
    program_id: str = Field(..., description="Program ID this course belongs to")
    name: str = Field(..., min_length=1, max_length=200, description="Course name")
    code: str = Field(..., min_length=1, max_length=50, description="Course code")
    description: Optional[str] = Field(None, description="Course description")
    objectives: Optional[List[str]] = Field(None, description="Course learning objectives")
    prerequisites: Optional[List[str]] = Field(None, description="Course prerequisites")
    duration_weeks: Optional[int] = Field(None, ge=1, description="Course duration in weeks")
    sessions_per_payment: int = Field(8, ge=1, le=100, description="Sessions per payment cycle")
    completion_deadline_weeks: int = Field(6, ge=1, le=52, description="Completion deadline in weeks")
    age_groups: List[str] = Field(..., min_items=1, description="Available age groups")
    location_types: List[str] = Field(..., min_items=1, description="Available location types")
    session_types: List[str] = Field(..., min_items=1, description="Available session types")
    pricing_matrix: List[PricingEntry] = Field(..., min_items=1, description="Pricing matrix")
    instructor_id: Optional[str] = Field(None, description="Assigned instructor ID")
    max_students: Optional[int] = Field(None, ge=1, description="Maximum students per session")
    min_students: Optional[int] = Field(None, ge=1, description="Minimum students per session")
    tags: Optional[List[str]] = Field(None, description="Course tags")
    image_url: Optional[str] = Field(None, description="Course image URL")
    video_url: Optional[str] = Field(None, description="Course video URL")
    sequence: int = Field(1, ge=0, description="Course sequence order")
    difficulty_level: Optional[DifficultyLevelEnum] = Field(None, description="Course difficulty level")
    is_featured: bool = Field(False, description="Whether course is featured")
    is_certification_course: bool = Field(False, description="Whether course offers certification")
    status: CurriculumStatusEnum = Field(CurriculumStatusEnum.DRAFT, description="Course status")


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    
    # All required fields are defined in CourseBase
    pass


class CourseUpdate(BaseModel):
    """Schema for updating course information."""
    
    program_id: Optional[str] = Field(None, description="Program ID this course belongs to")
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Course name")
    code: Optional[str] = Field(None, min_length=1, max_length=50, description="Course code")
    description: Optional[str] = Field(None, description="Course description")
    objectives: Optional[List[str]] = Field(None, description="Course learning objectives")
    prerequisites: Optional[List[str]] = Field(None, description="Course prerequisites")
    duration_weeks: Optional[int] = Field(None, ge=1, description="Course duration in weeks")
    sessions_per_payment: Optional[int] = Field(None, ge=1, le=100, description="Sessions per payment cycle")
    completion_deadline_weeks: Optional[int] = Field(None, ge=1, le=52, description="Completion deadline in weeks")
    age_groups: Optional[List[str]] = Field(None, min_items=1, description="Available age groups")
    location_types: Optional[List[str]] = Field(None, min_items=1, description="Available location types")
    session_types: Optional[List[str]] = Field(None, min_items=1, description="Available session types")
    pricing_matrix: Optional[List[PricingEntry]] = Field(None, min_items=1, description="Pricing matrix")
    instructor_id: Optional[str] = Field(None, description="Assigned instructor ID")
    max_students: Optional[int] = Field(None, ge=1, description="Maximum students per session")
    min_students: Optional[int] = Field(None, ge=1, description="Minimum students per session")
    tags: Optional[List[str]] = Field(None, description="Course tags")
    image_url: Optional[str] = Field(None, description="Course image URL")
    video_url: Optional[str] = Field(None, description="Course video URL")
    sequence: Optional[int] = Field(None, ge=0, description="Course sequence order")
    difficulty_level: Optional[DifficultyLevelEnum] = Field(None, description="Course difficulty level")
    is_featured: Optional[bool] = Field(None, description="Whether course is featured")
    is_certification_course: Optional[bool] = Field(None, description="Whether course offers certification")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Course status")


class CourseResponse(CourseBase, TimestampMixin):
    """Schema for course response."""
    
    id: str = Field(..., description="Course ID (UUID)")
    
    # Program information (nested relationship)
    program: Optional[Dict[str, Any]] = Field(None, description="Program information")
    
    # Instructor information (nested relationship)
    instructor: Optional[Dict[str, Any]] = Field(None, description="Instructor information")
    
    # Curriculum information (nested relationship)
    curricula: Optional[List[Dict[str, Any]]] = Field(None, description="Associated curricula")
    
    # Statistics
    total_curricula: Optional[int] = Field(None, description="Number of curricula in this course")
    total_lessons: Optional[int] = Field(None, description="Total lessons across all curricula")
    total_students: Optional[int] = Field(None, description="Total enrolled students")
    completion_rate: Optional[float] = Field(None, description="Course completion rate")
    average_rating: Optional[float] = Field(None, description="Average course rating")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "course-id-1",
                "program_id": "program-id-1",
                "name": "Introduction to Swimming",
                "code": "SWIM-INTRO",
                "description": "Foundational swimming course for beginners",
                "objectives": ["Learn basic floating", "Learn freestyle stroke", "Build water confidence"],
                "prerequisites": ["Basic water comfort"],
                "duration_weeks": 8,
                "sessions_per_payment": 8,
                "completion_deadline_weeks": 6,
                "age_groups": ["6-12", "13-17"],
                "location_types": ["our-facility", "client-location"],
                "session_types": ["group", "private"],
                "pricing_matrix": [
                    {"age_group": "6-12", "location_type": "our-facility", "session_type": "group", "price": 15000},
                    {"age_group": "6-12", "location_type": "our-facility", "session_type": "private", "price": 25000}
                ],
                "max_students": 12,
                "min_students": 6,
                "tags": ["swimming", "beginner", "water-safety"],
                "sequence": 1,
                "difficulty_level": "beginner",
                "is_featured": True,
                "is_certification_course": False,
                "status": "published",
                "total_curricula": 4,
                "total_lessons": 32,
                "total_students": 45,
                "completion_rate": 85.5,
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
    difficulty_level: Optional[DifficultyLevelEnum] = Field(None, description="Filter by difficulty level")
    is_featured: Optional[bool] = Field(None, description="Filter by featured status")
    is_certification_course: Optional[bool] = Field(None, description="Filter by certification courses")
    age_group: Optional[str] = Field(None, description="Filter by age group")
    location_type: Optional[str] = Field(None, description="Filter by location type")
    session_type: Optional[str] = Field(None, description="Filter by session type")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
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