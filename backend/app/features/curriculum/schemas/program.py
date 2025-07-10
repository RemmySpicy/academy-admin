"""
Program schemas for curriculum management.
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


class ProgramBase(BaseModel):
    """Base program schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Program name")
    description: Optional[str] = Field(None, description="Program description")
    program_code: str = Field(..., min_length=1, max_length=20, description="Unique program code")
    category: Optional[str] = Field(None, max_length=100, description="Program category")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Program status")
    display_order: int = Field(default=0, description="Display order for sorting")
    
    @validator('program_code')
    def validate_program_code(cls, v):
        """Validate program code format."""
        if v:
            # Remove any whitespace
            v = v.strip()
            # Check for valid characters (alphanumeric, hyphens, underscores)
            import re
            if not re.match(r'^[A-Za-z0-9_-]+$', v):
                raise ValueError('Program code can only contain letters, numbers, hyphens, and underscores')
        return v


class ProgramCreate(ProgramBase):
    """Schema for creating a new program."""
    
    # All required fields are defined in ProgramBase
    pass


class ProgramUpdate(BaseModel):
    """Schema for updating program information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    program_code: Optional[str] = Field(None, min_length=1, max_length=20)
    category: Optional[str] = Field(None, max_length=100)
    status: Optional[CurriculumStatusEnum] = Field(None)
    display_order: Optional[int] = Field(None)
    
    @validator('program_code')
    def validate_program_code(cls, v):
        """Validate program code format."""
        if v is not None:
            v = v.strip()
            import re
            if not re.match(r'^[A-Za-z0-9_-]+$', v):
                raise ValueError('Program code can only contain letters, numbers, hyphens, and underscores')
        return v


class ProgramResponse(ProgramBase, TimestampMixin):
    """Schema for program response."""
    
    id: str = Field(..., description="Program ID (UUID)")
    
    # Additional response fields
    course_count: Optional[int] = Field(None, description="Number of courses in this program")
    total_curriculum_count: Optional[int] = Field(None, description="Total curricula across all courses")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Robotics Engineering",
                "description": "Comprehensive robotics engineering program covering mechanical design, programming, and electronics",
                "program_code": "ROBOT-ENG",
                "category": "Engineering",
                "status": "published",
                "display_order": 1,
                "course_count": 3,
                "total_curriculum_count": 12,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class ProgramListResponse(PaginatedResponse):
    """Schema for paginated program list response."""
    
    items: List[ProgramResponse] = Field(..., description="List of programs")


class ProgramSearchParams(BaseModel):
    """Parameters for program search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    category: Optional[str] = Field(None, description="Filter by category")
    sort_by: Optional[str] = Field("display_order", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class ProgramStatsResponse(BaseModel):
    """Schema for program statistics response."""
    
    total_programs: int = Field(..., description="Total number of programs")
    programs_by_status: Dict[str, int] = Field(..., description="Programs grouped by status")
    programs_by_category: Dict[str, int] = Field(..., description="Programs grouped by category")
    average_courses_per_program: float = Field(..., description="Average number of courses per program")
    most_popular_categories: List[Dict[str, Any]] = Field(..., description="Most popular program categories")


class ProgramTreeResponse(BaseModel):
    """Schema for program tree structure with courses and curricula."""
    
    id: str = Field(..., description="Program ID")
    name: str = Field(..., description="Program name")
    program_code: str = Field(..., description="Program code")
    status: CurriculumStatusEnum = Field(..., description="Program status")
    courses: List[Dict[str, Any]] = Field(default=[], description="List of courses with their curricula")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "status": "published",
                "courses": [
                    {
                        "id": "course-id-1",
                        "name": "Introduction to Robotics",
                        "curricula": [
                            {
                                "id": "curriculum-id-1",
                                "name": "Basic Robot Building",
                                "difficulty_level": "beginner"
                            }
                        ]
                    }
                ]
            }
        }