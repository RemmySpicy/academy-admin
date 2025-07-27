"""
Module schemas for curriculum management.
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


class ModuleBase(BaseModel):
    """Base module schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Module name")
    title: Optional[str] = Field(None, max_length=255, description="Custom title for the module (displays as 'Module 1: Title Name')")
    description: Optional[str] = Field(None, description="Module description")
    level_id: str = Field(..., description="Level ID this module belongs to")
    sequence: int = Field(..., ge=1, description="Sequence order within level")
    estimated_duration_hours: Optional[float] = Field(None, ge=0, description="Estimated duration in hours")
    key_concepts: Optional[str] = Field(None, description="Key concepts covered in this module")
    learning_outcomes: Optional[str] = Field(None, description="Expected learning outcomes")
    instructor_notes: Optional[str] = Field(None, description="Notes for instructors")
    practical_activities: Optional[str] = Field(None, description="Practical activities and exercises")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Module status")
    
    @validator('estimated_duration_hours')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None and v > 100:  # More than 100 hours seems unreasonable for a single module
            raise ValueError('Estimated duration cannot exceed 100 hours')
        return v


class ModuleCreate(ModuleBase):
    """Schema for creating a new module."""
    
    # All required fields are defined in ModuleBase
    pass


class ModuleUpdate(BaseModel):
    """Schema for updating module information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    level_id: Optional[str] = Field(None)
    sequence: Optional[int] = Field(None, ge=1)
    estimated_duration_hours: Optional[float] = Field(None, ge=0)
    key_concepts: Optional[str] = Field(None)
    learning_outcomes: Optional[str] = Field(None)
    instructor_notes: Optional[str] = Field(None)
    practical_activities: Optional[str] = Field(None)
    status: Optional[CurriculumStatusEnum] = Field(None)
    
    @validator('estimated_duration_hours')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None and v > 100:
            raise ValueError('Estimated duration cannot exceed 100 hours')
        return v


class ModuleResponse(ModuleBase, TimestampMixin):
    """Schema for module response."""
    
    id: str = Field(..., description="Module ID (UUID)")
    
    # Level, curriculum, course, and program information
    level_name: Optional[str] = Field(None, description="Level name")
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    lesson_count: Optional[int] = Field(None, description="Number of lessons in this module")
    assessment_count: Optional[int] = Field(None, description="Number of assessments")
    equipment_count: Optional[int] = Field(None, description="Number of equipment requirements")
    media_count: Optional[int] = Field(None, description="Number of media items")
    completion_rate: Optional[float] = Field(None, description="Average completion rate for this module")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "module-id-1",
                "name": "Introduction to Robotics",
                "description": "Basic concepts and terminology in robotics",
                "level_id": "level-id-1",
                "level_name": "Getting Started",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "sequence": 1,
                "estimated_duration_hours": 3.0,
                "key_concepts": "Robots, sensors, actuators, programming",
                "learning_outcomes": "Understand basic robotics terminology and components",
                "instructor_notes": "Use visual aids and hands-on demonstrations",
                "practical_activities": "Identify robot components, simple programming exercises",
                "status": "published",
                "lesson_count": 3,
                "assessment_count": 1,
                "equipment_count": 2,
                "media_count": 5,
                "completion_rate": 92.3,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class ModuleListResponse(PaginatedResponse):
    """Schema for paginated module list response."""
    
    items: List[ModuleResponse] = Field(..., description="List of modules")


class ModuleSearchParams(BaseModel):
    """Parameters for module search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    duration_hours_min: Optional[float] = Field(None, ge=0, description="Minimum duration hours")
    duration_hours_max: Optional[float] = Field(None, ge=0, description="Maximum duration hours")
    sequence_from: Optional[int] = Field(None, ge=1, description="Sequence range from")
    sequence_to: Optional[int] = Field(None, ge=1, description="Sequence range to")
    has_assessments: Optional[bool] = Field(None, description="Filter modules with assessments")
    has_equipment: Optional[bool] = Field(None, description="Filter modules with equipment requirements")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class ModuleStatsResponse(BaseModel):
    """Schema for module statistics response."""
    
    total_modules: int = Field(..., description="Total number of modules")
    modules_by_status: Dict[str, int] = Field(..., description="Modules grouped by status")
    modules_by_level: Dict[str, int] = Field(..., description="Modules grouped by level")
    modules_by_curriculum: Dict[str, int] = Field(..., description="Modules grouped by curriculum")
    modules_by_program: Dict[str, int] = Field(..., description="Modules grouped by program")
    average_lessons_per_module: float = Field(..., description="Average number of lessons per module")
    average_duration_hours: float = Field(..., description="Average duration in hours")
    modules_with_assessments: int = Field(..., description="Number of modules with assessments")
    modules_with_equipment: int = Field(..., description="Number of modules with equipment requirements")
    completion_rate_stats: Dict[str, float] = Field(..., description="Completion rate statistics")


class ModuleTreeResponse(BaseModel):
    """Schema for module tree structure with lessons."""
    
    id: str = Field(..., description="Module ID")
    name: str = Field(..., description="Module name")
    level_id: str = Field(..., description="Level ID")
    sequence: int = Field(..., description="Sequence within level")
    status: CurriculumStatusEnum = Field(..., description="Module status")
    lessons: List[Dict[str, Any]] = Field(default=[], description="List of lessons in this module")
    assessments: List[Dict[str, Any]] = Field(default=[], description="Assessment rubrics for this module")
    equipment: List[Dict[str, Any]] = Field(default=[], description="Equipment requirements")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "module-id-1",
                "name": "Introduction to Robotics",
                "level_id": "level-id-1",
                "sequence": 1,
                "status": "published",
                "lessons": [
                    {
                        "id": "lesson-id-1",
                        "title": "What is a Robot?",
                        "sequence": 1,
                        "estimated_duration_minutes": 45
                    },
                    {
                        "id": "lesson-id-2",
                        "title": "Types of Robots",
                        "sequence": 2,
                        "estimated_duration_minutes": 60
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
                        "name": "Basic Robot Kit"
                    }
                ]
            }
        }


class ModuleReorderRequest(BaseModel):
    """Schema for reordering modules within a level."""
    
    module_orders: List[Dict[str, int]] = Field(
        ..., 
        min_items=1, 
        description="List of module ID and sequence mappings"
    )
    
    @validator('module_orders')
    def validate_module_orders(cls, v):
        """Validate module order mappings."""
        if not v:
            raise ValueError('Module orders cannot be empty')
        
        # Check for duplicate sequences
        sequences = [item.get('sequence') for item in v if 'sequence' in item]
        if len(sequences) != len(set(sequences)):
            raise ValueError('Duplicate sequences are not allowed')
        
        # Check for missing required fields
        for item in v:
            if 'id' not in item or 'sequence' not in item:
                raise ValueError('Each module order must have id and sequence fields')
        
        return v


class ModuleBulkStatusUpdateRequest(BaseModel):
    """Schema for bulk status updates."""
    
    module_ids: List[str] = Field(..., min_items=1, description="List of module IDs")
    new_status: CurriculumStatusEnum = Field(..., description="New status to apply")
    update_lessons: bool = Field(default=False, description="Whether to update lesson status as well")


class ModuleProgressTrackingResponse(BaseModel):
    """Schema for module progress tracking information."""
    
    module_id: str = Field(..., description="Module ID")
    module_name: str = Field(..., description="Module name")
    total_students: int = Field(..., description="Total students enrolled")
    students_completed: int = Field(..., description="Students who completed this module")
    students_in_progress: int = Field(..., description="Students currently in progress")
    average_completion_time_hours: Optional[float] = Field(None, description="Average completion time")
    success_rate: float = Field(..., description="Success rate percentage")
    average_assessment_score: Optional[float] = Field(None, description="Average assessment score")
    lesson_completion_rates: Dict[str, float] = Field(..., description="Completion rates by lesson")


class ModuleDuplicateRequest(BaseModel):
    """Schema for duplicating a module."""
    
    new_name: str = Field(..., min_length=1, max_length=200, description="Name for the duplicated module")
    target_level_id: Optional[str] = Field(None, description="Target level ID (defaults to same level)")
    copy_lessons: bool = Field(default=True, description="Whether to copy lessons")
    copy_assessments: bool = Field(default=True, description="Whether to copy assessment rubrics")
    copy_equipment: bool = Field(default=True, description="Whether to copy equipment requirements")
    copy_media: bool = Field(default=False, description="Whether to copy media files")