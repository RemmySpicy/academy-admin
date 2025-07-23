"""
Level schemas for curriculum management.
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


class LevelBase(BaseModel):
    """Base level schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Level name")
    title: Optional[str] = Field(None, max_length=255, description="Custom title for the level (displays as 'Level 1: Title Name')")
    description: Optional[str] = Field(None, description="Level description")
    intro_video_url: Optional[str] = Field(None, max_length=500, description="URL link to introductory video for this level")
    equipment_needed: Optional[str] = Field(None, description="Equipment needed for this level")
    curriculum_id: str = Field(..., description="Curriculum ID this level belongs to")
    sequence: int = Field(..., ge=1, description="Sequence order within curriculum")
    entry_criteria: Optional[str] = Field(None, description="Criteria for entering this level")
    exit_criteria: Optional[str] = Field(None, description="Criteria for completing this level")
    estimated_duration_hours: Optional[float] = Field(None, ge=0, description="Estimated duration in hours")
    learning_objectives: Optional[str] = Field(None, description="Learning objectives for this level")
    instructor_notes: Optional[str] = Field(None, description="Notes for instructors")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Level status")
    
    @validator('estimated_duration_hours')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None and v > 1000:  # More than 1000 hours seems unreasonable for a single level
            raise ValueError('Estimated duration cannot exceed 1000 hours')
        return v


class LevelCreate(LevelBase):
    """Schema for creating a new level."""
    
    # All required fields are defined in LevelBase
    pass


class LevelUpdate(BaseModel):
    """Schema for updating level information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    intro_video_url: Optional[str] = Field(None, max_length=500)
    equipment_needed: Optional[str] = Field(None)
    curriculum_id: Optional[str] = Field(None)
    sequence: Optional[int] = Field(None, ge=1)
    entry_criteria: Optional[str] = Field(None)
    exit_criteria: Optional[str] = Field(None)
    estimated_duration_hours: Optional[float] = Field(None, ge=0)
    learning_objectives: Optional[str] = Field(None)
    instructor_notes: Optional[str] = Field(None)
    status: Optional[CurriculumStatusEnum] = Field(None)
    
    @validator('estimated_duration_hours')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None and v > 1000:
            raise ValueError('Estimated duration cannot exceed 1000 hours')
        return v


class LevelResponse(LevelBase, TimestampMixin):
    """Schema for level response."""
    
    id: str = Field(..., description="Level ID (UUID)")
    
    # Curriculum, course, and program information
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    module_count: Optional[int] = Field(None, description="Number of modules in this level")
    total_lesson_count: Optional[int] = Field(None, description="Total lessons across all modules")
    completion_rate: Optional[float] = Field(None, description="Average completion rate for this level")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "level-id-1",
                "name": "Getting Started",
                "description": "Introduction to basic robotics concepts and tools",
                "curriculum_id": "curriculum-id-1",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "sequence": 1,
                "entry_criteria": "None - beginner level",
                "exit_criteria": "Complete all modules and demonstrate basic understanding",
                "estimated_duration_hours": 8.0,
                "learning_objectives": "Understand basic robotics concepts and safety procedures",
                "instructor_notes": "Focus on hands-on exploration and safety",
                "status": "published",
                "module_count": 3,
                "total_lesson_count": 9,
                "completion_rate": 85.5,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class LevelListResponse(PaginatedResponse):
    """Schema for paginated level list response."""
    
    items: List[LevelResponse] = Field(..., description="List of levels")


class LevelSearchParams(BaseModel):
    """Parameters for level search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    duration_hours_min: Optional[float] = Field(None, ge=0, description="Minimum duration hours")
    duration_hours_max: Optional[float] = Field(None, ge=0, description="Maximum duration hours")
    sequence_from: Optional[int] = Field(None, ge=1, description="Sequence range from")
    sequence_to: Optional[int] = Field(None, ge=1, description="Sequence range to")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class LevelStatsResponse(BaseModel):
    """Schema for level statistics response."""
    
    total_levels: int = Field(..., description="Total number of levels")
    levels_by_status: Dict[str, int] = Field(..., description="Levels grouped by status")
    levels_by_curriculum: Dict[str, int] = Field(..., description="Levels grouped by curriculum")
    levels_by_course: Dict[str, int] = Field(..., description="Levels grouped by course")
    levels_by_program: Dict[str, int] = Field(..., description="Levels grouped by program")
    average_modules_per_level: float = Field(..., description="Average number of modules per level")
    average_duration_hours: float = Field(..., description="Average duration in hours")
    completion_rate_stats: Dict[str, float] = Field(..., description="Completion rate statistics")


class LevelTreeResponse(BaseModel):
    """Schema for level tree structure with modules and lessons."""
    
    id: str = Field(..., description="Level ID")
    name: str = Field(..., description="Level name")
    curriculum_id: str = Field(..., description="Curriculum ID")
    sequence: int = Field(..., description="Sequence within curriculum")
    status: CurriculumStatusEnum = Field(..., description="Level status")
    modules: List[Dict[str, Any]] = Field(default=[], description="List of modules with their lessons")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "level-id-1",
                "name": "Getting Started",
                "curriculum_id": "curriculum-id-1",
                "sequence": 1,
                "status": "published",
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
                            },
                            {
                                "id": "lesson-id-2",
                                "title": "Types of Robots",
                                "sequence": 2
                            }
                        ]
                    }
                ]
            }
        }


class LevelReorderRequest(BaseModel):
    """Schema for reordering levels within a curriculum."""
    
    level_orders: List[Dict[str, int]] = Field(
        ..., 
        min_items=1, 
        description="List of level ID and sequence mappings"
    )
    
    @validator('level_orders')
    def validate_level_orders(cls, v):
        """Validate level order mappings."""
        if not v:
            raise ValueError('Level orders cannot be empty')
        
        # Check for duplicate sequences
        sequences = [item.get('sequence') for item in v if 'sequence' in item]
        if len(sequences) != len(set(sequences)):
            raise ValueError('Duplicate sequences are not allowed')
        
        # Check for missing required fields
        for item in v:
            if 'id' not in item or 'sequence' not in item:
                raise ValueError('Each level order must have id and sequence fields')
        
        return v


class LevelBulkStatusUpdateRequest(BaseModel):
    """Schema for bulk status updates."""
    
    level_ids: List[str] = Field(..., min_items=1, description="List of level IDs")
    new_status: CurriculumStatusEnum = Field(..., description="New status to apply")
    update_modules: bool = Field(default=False, description="Whether to update module status as well")


class LevelProgressTrackingResponse(BaseModel):
    """Schema for level progress tracking information."""
    
    level_id: str = Field(..., description="Level ID")
    level_name: str = Field(..., description="Level name")
    total_students: int = Field(..., description="Total students enrolled")
    students_completed: int = Field(..., description="Students who completed this level")
    students_in_progress: int = Field(..., description="Students currently in progress")
    average_completion_time_hours: Optional[float] = Field(None, description="Average completion time")
    success_rate: float = Field(..., description="Success rate percentage")
    common_challenges: List[str] = Field(default=[], description="Common challenges students face")