"""
Program schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from .common import (
    DifficultyLevelEnum,
    TimestampMixin,
    PaginatedResponse,
)
from app.features.common.models.enums import CurriculumStatus


# Configuration Data Structures
class AgeGroup(BaseModel):
    """Age group configuration schema."""
    
    id: str = Field(..., description="Unique age group identifier")
    name: str = Field(..., description="Display name (e.g., '6-8 years')")
    from_age: int = Field(..., ge=3, le=99, description="Starting age")
    to_age: int = Field(..., ge=3, le=99, description="Ending age")
    
    @validator('to_age')
    def validate_age_range(cls, v, values):
        """Validate that to_age is greater than from_age (except for open-ended ranges)."""
        if 'from_age' in values and v < 99:
            if v <= values['from_age']:
                raise ValueError('To age must be greater than from age')
        return v


class DifficultyLevel(BaseModel):
    """Difficulty level configuration schema."""
    
    id: str = Field(..., description="Unique difficulty level identifier")
    name: str = Field(..., min_length=1, max_length=50, description="Difficulty level name")
    weight: int = Field(..., ge=1, description="Weight for ordering (1 = easiest)")


class SessionType(BaseModel):
    """Session type configuration schema."""
    
    id: str = Field(..., description="Unique session type identifier")
    name: str = Field(..., min_length=1, max_length=50, description="Session type name")
    capacity: int = Field(..., ge=1, le=100, description="Maximum participants")


class TeamAssignment(BaseModel):
    """Team assignment schema for program creation."""
    
    user_id: str = Field(..., description="User ID to assign")
    role: str = Field(..., description="Role to assign (program_admin, program_coordinator, instructor)")


class ProgramBase(BaseModel):
    """Base program schema with common fields."""
    
    # Basic Information
    name: str = Field(..., min_length=1, max_length=200, description="Program name")
    description: Optional[str] = Field(None, description="Program description")
    program_code: str = Field(..., min_length=1, max_length=20, description="Unique program code")
    category: Optional[str] = Field(None, max_length=100, description="Program category")
    status: CurriculumStatus = Field(default=CurriculumStatus.ACTIVE, description="Program status")
    display_order: int = Field(default=0, description="Display order for sorting")
    
    # Enhanced Configuration
    age_groups: List[AgeGroup] = Field(default=[], description="Age group configurations")
    difficulty_levels: List[DifficultyLevel] = Field(default=[], description="Difficulty level definitions")
    session_types: List[SessionType] = Field(default=[], description="Session type configurations")
    default_session_duration: int = Field(default=60, ge=15, le=300, description="Default session duration in minutes")
    
    # Team Assignment (optional for creation)
    team_assignments: Optional[List[TeamAssignment]] = Field(default=None, description="Initial team assignments")
    
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
    
    @validator('age_groups')
    def validate_age_groups(cls, v):
        """Validate age groups configuration."""
        if not v:
            raise ValueError('At least one age group is required')
        if len(v) > 20:
            raise ValueError('Maximum 20 age groups allowed')
        
        # Check for unique IDs
        ids = [ag.id for ag in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Age group IDs must be unique')
        
        return v
    
    @validator('difficulty_levels')
    def validate_difficulty_levels(cls, v):
        """Validate difficulty levels configuration."""
        if not v:
            raise ValueError('At least one difficulty level is required')
        if len(v) > 10:
            raise ValueError('Maximum 10 difficulty levels allowed')
        
        # Check for unique IDs and names
        ids = [dl.id for dl in v]
        names = [dl.name for dl in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Difficulty level IDs must be unique')
        if len(names) != len(set(names)):
            raise ValueError('Difficulty level names must be unique')
        
        return v
    
    @validator('session_types')
    def validate_session_types(cls, v):
        """Validate session types configuration."""
        if not v:
            raise ValueError('At least one session type is required')
        if len(v) > 20:
            raise ValueError('Maximum 20 session types allowed')
        
        # Check for unique IDs and names
        ids = [st.id for st in v]
        names = [st.name for st in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Session type IDs must be unique')
        if len(names) != len(set(names)):
            raise ValueError('Session type names must be unique')
        
        return v


class ProgramCreate(ProgramBase):
    """Schema for creating a new program."""
    
    # All required fields are defined in ProgramBase
    pass


class ProgramUpdate(BaseModel):
    """Schema for updating program information."""
    
    # Basic Information
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    program_code: Optional[str] = Field(None, min_length=1, max_length=20)
    category: Optional[str] = Field(None, max_length=100)
    status: Optional[CurriculumStatus] = Field(None)
    display_order: Optional[int] = Field(None)
    
    # Enhanced Configuration
    age_groups: Optional[List[AgeGroup]] = Field(None, description="Age group configurations")
    difficulty_levels: Optional[List[DifficultyLevel]] = Field(None, description="Difficulty level definitions")
    session_types: Optional[List[SessionType]] = Field(None, description="Session type configurations")
    default_session_duration: Optional[int] = Field(None, ge=15, le=300, description="Default session duration in minutes")
    
    # Team Assignment
    team_assignments: Optional[List[TeamAssignment]] = Field(None, description="Team assignments")
    
    @validator('program_code')
    def validate_program_code(cls, v):
        """Validate program code format."""
        if v is not None:
            v = v.strip()
            import re
            if not re.match(r'^[A-Za-z0-9_-]+$', v):
                raise ValueError('Program code can only contain letters, numbers, hyphens, and underscores')
        return v
    
    @validator('age_groups')
    def validate_age_groups(cls, v):
        """Validate age groups configuration."""
        if v is not None:
            if not v:
                raise ValueError('At least one age group is required')
            if len(v) > 20:
                raise ValueError('Maximum 20 age groups allowed')
            
            # Check for unique IDs
            ids = [ag.id for ag in v]
            if len(ids) != len(set(ids)):
                raise ValueError('Age group IDs must be unique')
        
        return v
    
    @validator('difficulty_levels')
    def validate_difficulty_levels(cls, v):
        """Validate difficulty levels configuration."""
        if v is not None:
            if not v:
                raise ValueError('At least one difficulty level is required')
            if len(v) > 10:
                raise ValueError('Maximum 10 difficulty levels allowed')
            
            # Check for unique IDs and names
            ids = [dl.id for dl in v]
            names = [dl.name for dl in v]
            if len(ids) != len(set(ids)):
                raise ValueError('Difficulty level IDs must be unique')
            if len(names) != len(set(names)):
                raise ValueError('Difficulty level names must be unique')
        
        return v
    
    @validator('session_types')
    def validate_session_types(cls, v):
        """Validate session types configuration."""
        if v is not None:
            if not v:
                raise ValueError('At least one session type is required')
            if len(v) > 20:
                raise ValueError('Maximum 20 session types allowed')
            
            # Check for unique IDs and names
            ids = [st.id for st in v]
            names = [st.name for st in v]
            if len(ids) != len(set(ids)):
                raise ValueError('Session type IDs must be unique')
            if len(names) != len(set(names)):
                raise ValueError('Session type names must be unique')
        
        return v


class ProgramResponse(TimestampMixin):
    """Schema for program response."""
    
    id: str = Field(..., description="Program ID (UUID)")
    
    # Basic Information
    name: str = Field(..., description="Program name")
    description: Optional[str] = Field(None, description="Program description")
    program_code: str = Field(..., description="Unique program code")
    category: Optional[str] = Field(None, description="Program category")
    status: CurriculumStatus = Field(..., description="Program status")
    display_order: int = Field(..., description="Display order for sorting")
    
    # Enhanced Configuration
    age_groups: Optional[List[AgeGroup]] = Field(None, description="Age group configurations")
    difficulty_levels: Optional[List[DifficultyLevel]] = Field(None, description="Difficulty level definitions")
    session_types: Optional[List[SessionType]] = Field(None, description="Session type configurations")
    default_session_duration: Optional[int] = Field(None, description="Default session duration in minutes")
    
    # Additional response fields
    course_count: Optional[int] = Field(None, description="Number of courses in this program")
    total_curriculum_count: Optional[int] = Field(None, description="Total curricula across all courses")
    has_configuration: Optional[bool] = Field(None, description="Whether program has enhanced configuration")
    
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
                "status": "active",
                "display_order": 1,
                "age_groups": [
                    {"id": "6-8", "name": "6-8 years", "from_age": 6, "to_age": 8},
                    {"id": "9-12", "name": "9-12 years", "from_age": 9, "to_age": 12}
                ],
                "difficulty_levels": [
                    {"id": "beginner", "name": "Beginner", "weight": 1},
                    {"id": "intermediate", "name": "Intermediate", "weight": 2}
                ],
                "session_types": [
                    {"id": "private", "name": "Private", "capacity": 2},
                    {"id": "group", "name": "Group", "capacity": 5}
                ],
                "default_session_duration": 60,
                "course_count": 3,
                "total_curriculum_count": 12,
                "has_configuration": True,
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
    status: Optional[CurriculumStatus] = Field(None, description="Filter by status")
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
    status: CurriculumStatus = Field(..., description="Program status")
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