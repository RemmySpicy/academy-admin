"""
Lesson schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum

from app.features.courses.schemas.common import (
    CurriculumStatusEnum,
    DifficultyLevelEnum,
    TimestampMixin,
    PaginatedResponse,
)


class ContentTypeEnum(str, Enum):
    """Content type enumeration for lessons."""
    TEXT = "text"
    VIDEO = "video"
    INTERACTIVE = "interactive"
    HANDS_ON = "hands_on"
    ASSESSMENT = "assessment"
    DISCUSSION = "discussion"
    PROJECT = "project"
    DEMONSTRATION = "demonstration"


class ResourceLink(BaseModel):
    """Schema for lesson resource links."""
    id: str = Field(..., description="Unique identifier for this resource")
    title: str = Field(..., min_length=1, max_length=200, description="Resource title")
    url: str = Field(..., min_length=1, description="Resource URL")
    type: str = Field(..., description="Resource type: video, document, link, other")


class LessonBase(BaseModel):
    """Base lesson schema with common fields."""
    
    lesson_id: str = Field(..., min_length=1, max_length=50, description="Unique lesson identifier")
    title: str = Field(..., min_length=1, max_length=200, description="Lesson title")
    description: Optional[str] = Field(None, description="Lesson description")
    section_id: str = Field(..., description="Section ID this lesson belongs to")
    sequence: int = Field(..., ge=1, description="Sequence order within section")
    lesson_types: List[str] = Field(default=[], description="Types of lesson content (video, text, interactive, practical)")
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duration in minutes")
    difficulty_level: Optional[str] = Field(None, description="Difficulty level")
    instructor_guide: Optional[str] = Field(None, description="Guide for instructors")
    resource_links: List[ResourceLink] = Field(default=[], description="Resource links for this lesson")
    is_required: bool = Field(default=True, description="Whether this lesson is required")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Lesson status")
    
    # Keep backward compatibility fields
    content: Optional[str] = Field(None, description="Main lesson content")
    content_type: Optional[ContentTypeEnum] = Field(None, description="Type of lesson content")
    estimated_duration_minutes: Optional[int] = Field(None, ge=1, description="Estimated duration in minutes")
    learning_objectives: Optional[str] = Field(None, description="Specific learning objectives")
    instructor_guidelines: Optional[str] = Field(None, description="Guidelines for instructors")
    assessment_criteria: Optional[str] = Field(None, description="Assessment criteria and rubrics")
    materials_needed: Optional[str] = Field(None, description="Materials and supplies needed")
    safety_notes: Optional[str] = Field(None, description="Safety notes and precautions")
    homework_assignments: Optional[str] = Field(None, description="Homework or follow-up assignments")
    additional_resources: Optional[str] = Field(None, description="Additional learning resources")
    
    @validator('lesson_id')
    def validate_lesson_id(cls, v):
        """Validate lesson ID format."""
        if v:
            v = v.strip()
            # Check for valid characters (alphanumeric, hyphens, underscores, periods)
            import re
            if not re.match(r'^[A-Za-z0-9._-]+$', v):
                raise ValueError('Lesson ID can only contain letters, numbers, periods, hyphens, and underscores')
        return v
    
    @validator('estimated_duration_minutes')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None:
            if v > 240:  # More than 4 hours seems unreasonable for a single lesson
                raise ValueError('Estimated duration cannot exceed 240 minutes (4 hours)')
            if v < 1:
                raise ValueError('Estimated duration must be at least 1 minute')
        return v


class LessonCreate(LessonBase):
    """Schema for creating a new lesson."""
    
    # All required fields are defined in LessonBase
    pass


class LessonUpdate(BaseModel):
    """Schema for updating lesson information."""
    
    lesson_id: Optional[str] = Field(None, min_length=1, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None)
    section_id: Optional[str] = Field(None)
    sequence: Optional[int] = Field(None, ge=1)
    content_type: Optional[ContentTypeEnum] = Field(None)
    estimated_duration_minutes: Optional[int] = Field(None, ge=1)
    learning_objectives: Optional[str] = Field(None)
    instructor_guidelines: Optional[str] = Field(None)
    assessment_criteria: Optional[str] = Field(None)
    materials_needed: Optional[str] = Field(None)
    safety_notes: Optional[str] = Field(None)
    homework_assignments: Optional[str] = Field(None)
    additional_resources: Optional[str] = Field(None)
    status: Optional[CurriculumStatusEnum] = Field(None)
    
    @validator('lesson_id')
    def validate_lesson_id(cls, v):
        """Validate lesson ID format."""
        if v is not None:
            v = v.strip()
            import re
            if not re.match(r'^[A-Za-z0-9._-]+$', v):
                raise ValueError('Lesson ID can only contain letters, numbers, periods, hyphens, and underscores')
        return v
    
    @validator('estimated_duration_minutes')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None:
            if v > 240:
                raise ValueError('Estimated duration cannot exceed 240 minutes (4 hours)')
            if v < 1:
                raise ValueError('Estimated duration must be at least 1 minute')
        return v


class LessonResponse(LessonBase, TimestampMixin):
    """Schema for lesson response."""
    
    id: str = Field(..., description="Lesson ID (UUID)")
    
    # Section, module, level, curriculum, course, and program information
    section_name: Optional[str] = Field(None, description="Section name")
    module_name: Optional[str] = Field(None, description="Module name")
    level_name: Optional[str] = Field(None, description="Level name")
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    assessment_count: Optional[int] = Field(None, description="Number of assessments")
    equipment_count: Optional[int] = Field(None, description="Number of equipment requirements")
    media_count: Optional[int] = Field(None, description="Number of media items")
    completion_rate: Optional[float] = Field(None, description="Average completion rate for this lesson")
    average_rating: Optional[float] = Field(None, description="Average student rating")
    
    # Content versioning
    content_version: Optional[int] = Field(None, description="Current content version")
    last_content_update: Optional[datetime] = Field(None, description="Last content update timestamp")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "lesson-uuid-1",
                "lesson_id": "ROBOT-101-L1",
                "title": "What is a Robot?",
                "content": "A robot is a programmable machine that can perform tasks automatically...",
                "section_id": "section-id-1",
                "section_name": "Robot Components Overview",
                "module_name": "Introduction to Robotics",
                "level_name": "Getting Started",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "sequence": 1,
                "content_type": "text",
                "estimated_duration_minutes": 20,
                "learning_objectives": "Define what a robot is and identify key characteristics",
                "instructor_guidelines": "Use visual examples and encourage questions",
                "assessment_criteria": "Student can correctly define a robot and give examples",
                "materials_needed": "Presentation slides, robot examples",
                "safety_notes": "No special safety considerations for this lesson",
                "homework_assignments": "Find 3 examples of robots in your daily life",
                "additional_resources": "Links to robot videos and articles",
                "status": "published",
                "assessment_count": 1,
                "equipment_count": 0,
                "media_count": 2,
                "completion_rate": 96.2,
                "average_rating": 4.3,
                "content_version": 2,
                "last_content_update": "2025-01-07T10:30:00Z",
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class LessonListResponse(PaginatedResponse):
    """Schema for paginated lesson list response."""
    
    items: List[LessonResponse] = Field(..., description="List of lessons")


class LessonSearchParams(BaseModel):
    """Parameters for lesson search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    section_id: Optional[str] = Field(None, description="Filter by section ID")
    module_id: Optional[str] = Field(None, description="Filter by module ID")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    content_type: Optional[ContentTypeEnum] = Field(None, description="Filter by content type")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    duration_minutes_min: Optional[int] = Field(None, ge=1, description="Minimum duration minutes")
    duration_minutes_max: Optional[int] = Field(None, ge=1, description="Maximum duration minutes")
    sequence_from: Optional[int] = Field(None, ge=1, description="Sequence range from")
    sequence_to: Optional[int] = Field(None, ge=1, description="Sequence range to")
    has_assessments: Optional[bool] = Field(None, description="Filter lessons with assessments")
    has_equipment: Optional[bool] = Field(None, description="Filter lessons with equipment requirements")
    has_safety_notes: Optional[bool] = Field(None, description="Filter lessons with safety notes")
    has_homework: Optional[bool] = Field(None, description="Filter lessons with homework assignments")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class LessonStatsResponse(BaseModel):
    """Schema for lesson statistics response."""
    
    total_lessons: int = Field(..., description="Total number of lessons")
    lessons_by_status: Dict[str, int] = Field(..., description="Lessons grouped by status")
    lessons_by_content_type: Dict[str, int] = Field(..., description="Lessons grouped by content type")
    lessons_by_section: Dict[str, int] = Field(..., description="Lessons grouped by section")
    lessons_by_curriculum: Dict[str, int] = Field(..., description="Lessons grouped by curriculum")
    lessons_by_program: Dict[str, int] = Field(..., description="Lessons grouped by program")
    average_duration_minutes: float = Field(..., description="Average duration in minutes")
    lessons_with_assessments: int = Field(..., description="Number of lessons with assessments")
    lessons_with_equipment: int = Field(..., description="Number of lessons with equipment requirements")
    lessons_with_safety_notes: int = Field(..., description="Number of lessons with safety notes")
    lessons_with_homework: int = Field(..., description="Number of lessons with homework assignments")
    completion_rate_stats: Dict[str, float] = Field(..., description="Completion rate statistics")
    average_rating: float = Field(..., description="Average lesson rating")


class LessonDetailResponse(LessonResponse):
    """Schema for detailed lesson response with related data."""
    
    assessments: List[Dict[str, Any]] = Field(default=[], description="Assessment rubrics for this lesson")
    equipment: List[Dict[str, Any]] = Field(default=[], description="Equipment requirements")
    media: List[Dict[str, Any]] = Field(default=[], description="Media files and resources")
    content_versions: List[Dict[str, Any]] = Field(default=[], description="Content version history")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "lesson-uuid-1",
                "lesson_id": "ROBOT-101-L1",
                "title": "What is a Robot?",
                "content": "A robot is a programmable machine...",
                "assessments": [
                    {
                        "id": "assessment-id-1",
                        "rubric_type": "technical_skills",
                        "total_possible_stars": 3
                    }
                ],
                "equipment": [
                    {
                        "id": "equipment-id-1",
                        "equipment_type": "technology",
                        "name": "Robot Examples for Display"
                    }
                ],
                "media": [
                    {
                        "id": "media-id-1",
                        "media_type": "video",
                        "title": "Introduction to Robots",
                        "file_url": "/media/robot-intro.mp4"
                    }
                ]
            }
        }


class LessonReorderRequest(BaseModel):
    """Schema for reordering lessons within a section."""
    
    lesson_orders: List[Dict[str, int]] = Field(
        ..., 
        min_items=1, 
        description="List of lesson ID and sequence mappings"
    )
    
    @validator('lesson_orders')
    def validate_lesson_orders(cls, v):
        """Validate lesson order mappings."""
        if not v:
            raise ValueError('Lesson orders cannot be empty')
        
        # Check for duplicate sequences
        sequences = [item.get('sequence') for item in v if 'sequence' in item]
        if len(sequences) != len(set(sequences)):
            raise ValueError('Duplicate sequences are not allowed')
        
        # Check for missing required fields
        for item in v:
            if 'id' not in item or 'sequence' not in item:
                raise ValueError('Each lesson order must have id and sequence fields')
        
        return v


class LessonBulkStatusUpdateRequest(BaseModel):
    """Schema for bulk status updates."""
    
    lesson_ids: List[str] = Field(..., min_items=1, description="List of lesson IDs")
    new_status: CurriculumStatusEnum = Field(..., description="New status to apply")


class LessonProgressTrackingResponse(BaseModel):
    """Schema for lesson progress tracking information."""
    
    lesson_id: str = Field(..., description="Lesson ID")
    lesson_title: str = Field(..., description="Lesson title")
    total_students: int = Field(..., description="Total students enrolled")
    students_completed: int = Field(..., description="Students who completed this lesson")
    students_in_progress: int = Field(..., description="Students currently in progress")
    average_completion_time_minutes: Optional[float] = Field(None, description="Average completion time")
    success_rate: float = Field(..., description="Success rate percentage")
    average_assessment_score: Optional[float] = Field(None, description="Average assessment score")
    average_rating: float = Field(..., description="Average student rating")
    common_feedback: List[str] = Field(default=[], description="Common student feedback themes")


class LessonDuplicateRequest(BaseModel):
    """Schema for duplicating a lesson."""
    
    new_lesson_id: str = Field(..., min_length=1, max_length=50, description="New lesson ID")
    new_title: str = Field(..., min_length=1, max_length=200, description="Title for the duplicated lesson")
    target_section_id: Optional[str] = Field(None, description="Target section ID (defaults to same section)")
    copy_content: bool = Field(default=True, description="Whether to copy lesson content")
    copy_assessments: bool = Field(default=True, description="Whether to copy assessment rubrics")
    copy_equipment: bool = Field(default=True, description="Whether to copy equipment requirements")
    copy_media: bool = Field(default=False, description="Whether to copy media files")


class LessonContentVersionRequest(BaseModel):
    """Schema for creating a new content version."""
    
    content: str = Field(..., description="New lesson content")
    version_notes: Optional[str] = Field(None, description="Notes about this version")
    publish_immediately: bool = Field(default=False, description="Whether to publish immediately")