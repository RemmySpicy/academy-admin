"""
Curriculum schemas for curriculum management.
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


class CurriculumBase(BaseModel):
    """Base curriculum schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Curriculum name")
    description: Optional[str] = Field(None, description="Curriculum description")
    course_id: str = Field(..., description="Course ID this curriculum belongs to")
    difficulty_level: DifficultyLevelEnum = Field(..., description="Difficulty level")
    duration_hours: Optional[int] = Field(None, ge=1, description="Duration in hours for this curriculum")
    age_ranges: List[str] = Field(..., min_items=1, description="Age ranges this curriculum applies to")
    is_default_for_age_groups: List[str] = Field(default=[], description="Age groups for which this curriculum is the default")
    prerequisites: Optional[str] = Field(None, description="Prerequisites for this curriculum")
    learning_objectives: Optional[str] = Field(None, description="Learning objectives")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Curriculum status")
    sequence: Optional[int] = Field(None, description="Sequence order for displaying curricula within course")
    
    @validator('is_default_for_age_groups')
    def validate_default_age_groups(cls, v, values):
        """Validate default age groups are subset of age ranges."""
        if v and 'age_ranges' in values and values['age_ranges']:
            age_ranges_set = set(values['age_ranges'])
            default_set = set(v)
            if not default_set.issubset(age_ranges_set):
                raise ValueError('Default age groups must be a subset of age ranges')
        return v


class CurriculumCreate(CurriculumBase):
    """Schema for creating a new curriculum."""
    
    # All required fields are defined in CurriculumBase
    pass


class CurriculumUpdate(BaseModel):
    """Schema for updating curriculum information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    course_id: Optional[str] = Field(None)
    difficulty_level: Optional[DifficultyLevelEnum] = Field(None)
    duration_hours: Optional[int] = Field(None, ge=1)
    age_ranges: Optional[List[str]] = Field(None, min_items=1)
    is_default_for_age_groups: Optional[List[str]] = Field(None)
    prerequisites: Optional[str] = Field(None)
    learning_objectives: Optional[str] = Field(None)
    status: Optional[CurriculumStatusEnum] = Field(None)
    sequence: Optional[int] = Field(None)
    
    @validator('is_default_for_age_groups')
    def validate_default_age_groups(cls, v, values):
        """Validate default age groups are subset of age ranges."""
        if v and 'age_ranges' in values and values['age_ranges']:
            age_ranges_set = set(values['age_ranges'])
            default_set = set(v)
            if not default_set.issubset(age_ranges_set):
                raise ValueError('Default age groups must be a subset of age ranges')
        return v


class CurriculumResponse(CurriculumBase, TimestampMixin):
    """Schema for curriculum response."""
    
    id: str = Field(..., description="Curriculum ID (UUID)")
    
    # Course and program information
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Computed fields
    is_default: bool = Field(False, description="Whether curriculum is default for any age group")
    
    # Additional response fields
    level_count: Optional[int] = Field(None, description="Number of levels in this curriculum")
    module_count: Optional[int] = Field(None, description="Number of modules in this curriculum")
    total_lesson_count: Optional[int] = Field(None, description="Total lessons across all modules")
    estimated_duration_hours: Optional[float] = Field(None, description="Estimated total duration in hours")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "curriculum-id-1",
                "name": "Basic Robot Building",
                "description": "Introduction to building simple robots using sensors and motors",
                "course_id": "course-id-1",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "difficulty_level": "beginner",
                "duration_hours": 24,
                "age_ranges": ["8-10 years", "11-12 years"],
                "is_default_for_age_groups": ["8-10 years"],
                "is_default": True,
                "prerequisites": "None",
                "learning_objectives": "Students will learn to build and program basic robots",
                "status": "published",
                "sequence": 1,
                "level_count": 3,
                "module_count": 9,
                "total_lesson_count": 27,
                "estimated_duration_hours": 24.0,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class CurriculumListResponse(PaginatedResponse):
    """Schema for paginated curriculum list response."""
    
    items: List[CurriculumResponse] = Field(..., description="List of curricula")


class CurriculumSearchParams(BaseModel):
    """Parameters for curriculum search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    difficulty_level: Optional[DifficultyLevelEnum] = Field(None, description="Filter by difficulty level")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    age_range: Optional[str] = Field(None, description="Filter by specific age range")
    min_age_from: Optional[int] = Field(None, ge=3, description="Minimum age filter from")
    min_age_to: Optional[int] = Field(None, ge=3, description="Minimum age filter to") 
    is_default_only: Optional[bool] = Field(None, description="Filter only default curricula")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class CurriculumStatsResponse(BaseModel):
    """Schema for curriculum statistics response."""
    
    total_curricula: int = Field(..., description="Total number of curricula")
    curricula_by_status: Dict[str, int] = Field(..., description="Curricula grouped by status")
    curricula_by_difficulty: Dict[str, int] = Field(..., description="Curricula grouped by difficulty level")
    curricula_by_course: Dict[str, int] = Field(..., description="Curricula grouped by course")
    curricula_by_program: Dict[str, int] = Field(..., description="Curricula grouped by program")
    average_levels_per_curriculum: float = Field(..., description="Average number of levels per curriculum")
    age_range_distribution: Dict[str, int] = Field(..., description="Age range distribution")


class CurriculumTreeResponse(BaseModel):
    """Schema for curriculum tree structure with levels, modules, and lessons."""
    
    id: str = Field(..., description="Curriculum ID")
    name: str = Field(..., description="Curriculum name")
    course_id: str = Field(..., description="Course ID")
    difficulty_level: DifficultyLevelEnum = Field(..., description="Difficulty level")
    status: CurriculumStatusEnum = Field(..., description="Curriculum status")
    levels: List[Dict[str, Any]] = Field(default=[], description="List of levels with their modules and lessons")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "curriculum-id-1",
                "name": "Basic Robot Building",
                "course_id": "course-id-1",
                "difficulty_level": "beginner",
                "status": "published",
                "levels": [
                    {
                        "id": "level-id-1",
                        "name": "Getting Started",
                        "sequence": 1,
                        "modules": [
                            {
                                "id": "module-id-1",
                                "name": "Introduction to Robotics",
                                "sequence": 1,
                                "lessons": [
                                    {
                                        "id": "lesson-id-1",
                                        "title": "What is a Robot?",
                                        "sequence": 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }


class CurriculumBulkMoveRequest(BaseModel):
    """Schema for bulk moving curricula between courses."""
    
    curriculum_ids: List[str] = Field(..., min_items=1, description="List of curriculum IDs to move")
    target_course_id: str = Field(..., description="Target course ID")
    preserve_order: bool = Field(default=True, description="Whether to preserve display order")


class CurriculumBulkStatusUpdateRequest(BaseModel):
    """Schema for bulk status updates."""
    
    curriculum_ids: List[str] = Field(..., min_items=1, description="List of curriculum IDs")
    new_status: CurriculumStatusEnum = Field(..., description="New status to apply")
    update_levels: bool = Field(default=False, description="Whether to update level status as well")


class CurriculumDuplicateRequest(BaseModel):
    """Schema for duplicating a curriculum."""
    
    new_name: str = Field(..., min_length=1, max_length=200, description="Name for the duplicated curriculum")
    target_course_id: Optional[str] = Field(None, description="Target course ID (defaults to same course)")
    copy_assessments: bool = Field(default=True, description="Whether to copy assessment rubrics")
    copy_equipment: bool = Field(default=True, description="Whether to copy equipment requirements")
    copy_media: bool = Field(default=False, description="Whether to copy media files")