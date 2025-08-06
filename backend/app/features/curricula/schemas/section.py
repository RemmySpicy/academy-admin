"""
Section schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from app.features.courses.schemas.common import (
    CurriculumStatusEnum,
    DifficultyLevelEnum,
    TimestampMixin,
    PaginatedResponse,
)


class SectionBase(BaseModel):
    """Base section schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Section name")
    title: Optional[str] = Field(None, max_length=255, description="Custom title for the section (displays as 'Section 1: Title Name')")
    description: Optional[str] = Field(None, description="Section description")
    module_id: str = Field(..., description="Module ID this section belongs to")
    sequence: int = Field(..., ge=1, description="Sequence order within module")
    estimated_duration_minutes: Optional[int] = Field(None, ge=1, description="Estimated duration in minutes")
    learning_outcomes: Optional[str] = Field(None, description="Expected learning outcomes")
    key_skills: Optional[str] = Field(None, description="Key skills developed in this section")
    safety_considerations: Optional[str] = Field(None, description="Safety considerations and precautions")
    materials_needed: Optional[str] = Field(None, description="Materials and supplies needed")
    preparation_notes: Optional[str] = Field(None, description="Preparation notes for instructors")
    # Workout Components
    warm_up: Optional[str] = Field(None, description="Warm up instructions for this section")
    pre_set: Optional[str] = Field(None, description="Pre set instructions for this section")
    post_set: Optional[str] = Field(None, description="Post set instructions for this section")
    cool_down: Optional[str] = Field(None, description="Cool down instructions for this section")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Section status")
    
    @validator('estimated_duration_minutes')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None:
            if v > 480:  # More than 8 hours seems unreasonable for a single section
                raise ValueError('Estimated duration cannot exceed 480 minutes (8 hours)')
            if v < 1:
                raise ValueError('Estimated duration must be at least 1 minute')
        return v


class SectionCreate(SectionBase):
    """Schema for creating a new section."""
    
    # All required fields are defined in SectionBase
    pass


class SectionUpdate(BaseModel):
    """Schema for updating section information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    module_id: Optional[str] = Field(None)
    sequence: Optional[int] = Field(None, ge=1)
    estimated_duration_minutes: Optional[int] = Field(None, ge=1)
    learning_outcomes: Optional[str] = Field(None)
    key_skills: Optional[str] = Field(None)
    safety_considerations: Optional[str] = Field(None)
    materials_needed: Optional[str] = Field(None)
    preparation_notes: Optional[str] = Field(None)
    # Workout Components
    warm_up: Optional[str] = Field(None)
    pre_set: Optional[str] = Field(None)
    post_set: Optional[str] = Field(None)
    cool_down: Optional[str] = Field(None)
    status: Optional[CurriculumStatusEnum] = Field(None)
    
    @validator('estimated_duration_minutes')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None:
            if v > 480:
                raise ValueError('Estimated duration cannot exceed 480 minutes (8 hours)')
            if v < 1:
                raise ValueError('Estimated duration must be at least 1 minute')
        return v


class SectionResponse(SectionBase, TimestampMixin):
    """Schema for section response."""
    
    id: str = Field(..., description="Section ID (UUID)")
    
    # Module, level, curriculum, course, and program information
    module_name: Optional[str] = Field(None, description="Module name")
    level_name: Optional[str] = Field(None, description="Level name")
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    lesson_count: Optional[int] = Field(None, description="Number of lessons in this section")
    assessment_count: Optional[int] = Field(None, description="Number of assessments")
    equipment_count: Optional[int] = Field(None, description="Number of equipment requirements")
    media_count: Optional[int] = Field(None, description="Number of media items")
    completion_rate: Optional[float] = Field(None, description="Average completion rate for this section")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "section-id-1",
                "name": "Robot Components Overview",
                "description": "Introduction to the main components of a robot",
                "module_id": "module-id-1",
                "module_name": "Introduction to Robotics",
                "level_name": "Getting Started",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "sequence": 1,
                "estimated_duration_minutes": 45,
                "learning_outcomes": "Identify and describe the main components of a robot",
                "key_skills": "Component identification, basic terminology",
                "safety_considerations": "Handle components carefully, avoid sharp edges",
                "materials_needed": "Robot kit components, identification worksheets",
                "preparation_notes": "Prepare component examples for demonstration",
                "status": "published",
                "lesson_count": 2,
                "assessment_count": 1,
                "equipment_count": 1,
                "media_count": 3,
                "completion_rate": 94.7,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class SectionListResponse(PaginatedResponse):
    """Schema for paginated section list response."""
    
    items: List[SectionResponse] = Field(..., description="List of sections")


class SectionSearchParams(BaseModel):
    """Parameters for section search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    module_id: Optional[str] = Field(None, description="Filter by module ID")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    duration_minutes_min: Optional[int] = Field(None, ge=1, description="Minimum duration minutes")
    duration_minutes_max: Optional[int] = Field(None, ge=1, description="Maximum duration minutes")
    sequence_from: Optional[int] = Field(None, ge=1, description="Sequence range from")
    sequence_to: Optional[int] = Field(None, ge=1, description="Sequence range to")
    has_safety_notes: Optional[bool] = Field(None, description="Filter sections with safety considerations")
    has_assessments: Optional[bool] = Field(None, description="Filter sections with assessments")
    has_equipment: Optional[bool] = Field(None, description="Filter sections with equipment requirements")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class SectionStatsResponse(BaseModel):
    """Schema for section statistics response."""
    
    total_sections: int = Field(..., description="Total number of sections")
    sections_by_status: Dict[str, int] = Field(..., description="Sections grouped by status")
    sections_by_module: Dict[str, int] = Field(..., description="Sections grouped by module")
    sections_by_curriculum: Dict[str, int] = Field(..., description="Sections grouped by curriculum")
    sections_by_program: Dict[str, int] = Field(..., description="Sections grouped by program")
    average_lessons_per_section: float = Field(..., description="Average number of lessons per section")
    average_duration_minutes: float = Field(..., description="Average duration in minutes")
    sections_with_safety_notes: int = Field(..., description="Number of sections with safety considerations")
    sections_with_assessments: int = Field(..., description="Number of sections with assessments")
    sections_with_equipment: int = Field(..., description="Number of sections with equipment requirements")
    completion_rate_stats: Dict[str, float] = Field(..., description="Completion rate statistics")


class SectionTreeResponse(BaseModel):
    """Schema for section tree structure with lessons."""
    
    id: str = Field(..., description="Section ID")
    name: str = Field(..., description="Section name")
    module_id: str = Field(..., description="Module ID")
    sequence: int = Field(..., description="Sequence within module")
    status: CurriculumStatusEnum = Field(..., description="Section status")
    lessons: List[Dict[str, Any]] = Field(default=[], description="List of lessons in this section")
    assessments: List[Dict[str, Any]] = Field(default=[], description="Assessment rubrics for this section")
    equipment: List[Dict[str, Any]] = Field(default=[], description="Equipment requirements")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "section-id-1",
                "name": "Robot Components Overview",
                "module_id": "module-id-1",
                "sequence": 1,
                "status": "published",
                "lessons": [
                    {
                        "id": "lesson-id-1",
                        "title": "Sensors and Actuators",
                        "sequence": 1,
                        "estimated_duration_minutes": 20
                    },
                    {
                        "id": "lesson-id-2",
                        "title": "Control Systems",
                        "sequence": 2,
                        "estimated_duration_minutes": 25
                    }
                ],
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
                        "name": "Robot Component Set"
                    }
                ]
            }
        }


class SectionReorderRequest(BaseModel):
    """Schema for reordering sections within a module."""
    
    section_orders: List[Dict[str, int]] = Field(
        ..., 
        min_items=1, 
        description="List of section ID and sequence mappings"
    )
    
    @validator('section_orders')
    def validate_section_orders(cls, v):
        """Validate section order mappings."""
        if not v:
            raise ValueError('Section orders cannot be empty')
        
        # Check for duplicate sequences
        sequences = [item.get('sequence') for item in v if 'sequence' in item]
        if len(sequences) != len(set(sequences)):
            raise ValueError('Duplicate sequences are not allowed')
        
        # Check for missing required fields
        for item in v:
            if 'id' not in item or 'sequence' not in item:
                raise ValueError('Each section order must have id and sequence fields')
        
        return v


class SectionBulkStatusUpdateRequest(BaseModel):
    """Schema for bulk status updates."""
    
    section_ids: List[str] = Field(..., min_items=1, description="List of section IDs")
    new_status: CurriculumStatusEnum = Field(..., description="New status to apply")
    update_lessons: bool = Field(default=False, description="Whether to update lesson status as well")


class SectionProgressTrackingResponse(BaseModel):
    """Schema for section progress tracking information."""
    
    section_id: str = Field(..., description="Section ID")
    section_name: str = Field(..., description="Section name")
    total_students: int = Field(..., description="Total students enrolled")
    students_completed: int = Field(..., description="Students who completed this section")
    students_in_progress: int = Field(..., description="Students currently in progress")
    average_completion_time_minutes: Optional[float] = Field(None, description="Average completion time")
    success_rate: float = Field(..., description="Success rate percentage")
    average_assessment_score: Optional[float] = Field(None, description="Average assessment score")
    lesson_completion_rates: Dict[str, float] = Field(..., description="Completion rates by lesson")
    safety_incident_count: int = Field(default=0, description="Number of safety incidents reported")


class SectionDuplicateRequest(BaseModel):
    """Schema for duplicating a section."""
    
    new_name: str = Field(..., min_length=1, max_length=200, description="Name for the duplicated section")
    target_module_id: Optional[str] = Field(None, description="Target module ID (defaults to same module)")
    copy_lessons: bool = Field(default=True, description="Whether to copy lessons")
    copy_assessments: bool = Field(default=True, description="Whether to copy assessment rubrics")
    copy_equipment: bool = Field(default=True, description="Whether to copy equipment requirements")
    copy_media: bool = Field(default=False, description="Whether to copy media files")