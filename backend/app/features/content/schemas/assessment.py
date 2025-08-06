"""
Assessment schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from app.features.courses.schemas.common import (
    CurriculumStatusEnum,
    RubricTypeEnum,
    TimestampMixin,
    PaginatedResponse,
)


class AssessmentItem(BaseModel):
    """Schema for individual assessment items."""
    id: str = Field(..., description="Unique identifier for this assessment item")
    title: str = Field(..., min_length=1, max_length=200, description="Assessment item title")
    description: str = Field(..., min_length=1, description="Assessment item description")
    order: int = Field(..., ge=1, description="Order of this item within the assessment")


class AssessmentRubricBase(BaseModel):
    """Base assessment rubric schema with common fields."""
    
    title: str = Field(..., min_length=1, max_length=200, description="Assessment title")
    code: str = Field(..., min_length=1, max_length=50, description="Assessment code")
    description: Optional[str] = Field(None, description="Assessment description")
    level_id: str = Field(..., description="Level ID this assessment belongs to")
    assessment_type: Optional[str] = Field(None, description="Type of assessment (quiz, assignment, practical, project)")
    difficulty_level: Optional[str] = Field(None, description="Difficulty level")
    assessment_guide: Optional[str] = Field(None, description="Guide for instructors")
    assessment_items: List[AssessmentItem] = Field(default=[], description="Individual assessment items")
    is_required: bool = Field(default=True, description="Whether this assessment is required")
    status: CurriculumStatusEnum = Field(default=CurriculumStatusEnum.DRAFT, description="Assessment status")
    
    # Keep backward compatibility fields
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Rubric name")
    lesson_id: Optional[str] = Field(None, description="Lesson ID this rubric belongs to")
    section_id: Optional[str] = Field(None, description="Section ID this rubric belongs to")
    module_id: Optional[str] = Field(None, description="Module ID this rubric belongs to")
    rubric_type: Optional[str] = Field(None, description="Type of rubric")
    total_possible_stars: int = Field(default=3, ge=1, le=5, description="Total possible stars (1-5)")
    weight_percentage: Optional[float] = Field(None, ge=0, le=100, description="Weight in overall assessment")
    sequence: int = Field(default=1, ge=1, description="Sequence order in assessment")
    
    @validator('weight_percentage')
    def validate_weight_percentage(cls, v):
        """Validate weight percentage is reasonable."""
        if v is not None and v < 0:
            raise ValueError('Weight percentage cannot be negative')
        if v is not None and v > 100:
            raise ValueError('Weight percentage cannot exceed 100')
        return v
    
    @validator('total_possible_stars')
    def validate_total_possible_stars(cls, v):
        """Validate star count is reasonable."""
        if v < 1:
            raise ValueError('Total possible stars must be at least 1')
        if v > 5:
            raise ValueError('Total possible stars cannot exceed 5')
        return v


class AssessmentRubricCreate(AssessmentRubricBase):
    """Schema for creating a new assessment rubric."""
    
    # All required fields are defined in AssessmentRubricBase
    pass


class AssessmentRubricUpdate(BaseModel):
    """Schema for updating assessment rubric information."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    lesson_id: Optional[str] = Field(None)
    section_id: Optional[str] = Field(None)
    module_id: Optional[str] = Field(None)
    rubric_type: Optional[RubricTypeEnum] = Field(None)
    total_possible_stars: Optional[int] = Field(None, ge=1, le=5)
    weight_percentage: Optional[float] = Field(None, ge=0, le=100)
    sequence: Optional[int] = Field(None, ge=1)
    is_required: Optional[bool] = Field(None)
    status: Optional[CurriculumStatusEnum] = Field(None)
    
    @validator('weight_percentage')
    def validate_weight_percentage(cls, v):
        """Validate weight percentage is reasonable."""
        if v is not None and v < 0:
            raise ValueError('Weight percentage cannot be negative')
        if v is not None and v > 100:
            raise ValueError('Weight percentage cannot exceed 100')
        return v
    
    @validator('total_possible_stars')
    def validate_total_possible_stars(cls, v):
        """Validate star count is reasonable."""
        if v is not None and v < 1:
            raise ValueError('Total possible stars must be at least 1')
        if v is not None and v > 5:
            raise ValueError('Total possible stars cannot exceed 5')
        return v


class AssessmentRubricResponse(AssessmentRubricBase, TimestampMixin):
    """Schema for assessment rubric response."""
    
    id: str = Field(..., description="Rubric ID (UUID)")
    
    # Related entity information
    lesson_title: Optional[str] = Field(None, description="Lesson title")
    section_name: Optional[str] = Field(None, description="Section name")
    module_name: Optional[str] = Field(None, description="Module name")
    level_name: Optional[str] = Field(None, description="Level name")
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Additional response fields
    criteria_count: Optional[int] = Field(None, description="Number of assessment criteria")
    usage_count: Optional[int] = Field(None, description="Number of times this rubric has been used")
    average_score: Optional[float] = Field(None, description="Average score achieved")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "rubric-id-1",
                "name": "Robot Building Technical Skills",
                "description": "Assessment of technical skills in robot building",
                "lesson_id": "lesson-id-1",
                "lesson_title": "What is a Robot?",
                "section_name": "Robot Components Overview",
                "module_name": "Introduction to Robotics",
                "level_name": "Getting Started",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "rubric_type": "technical_skills",
                "total_possible_stars": 3,
                "weight_percentage": 40.0,
                "sequence": 1,
                "is_required": True,
                "status": "published",
                "criteria_count": 4,
                "usage_count": 127,
                "average_score": 2.3,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class AssessmentCriteriaBase(BaseModel):
    """Base assessment criteria schema with common fields."""
    
    rubric_id: str = Field(..., description="Rubric ID this criteria belongs to")
    criterion_name: str = Field(..., min_length=1, max_length=200, description="Criterion name")
    star_0_descriptor: str = Field(..., description="Description for 0 stars")
    star_1_descriptor: Optional[str] = Field(None, description="Description for 1 star")
    star_2_descriptor: Optional[str] = Field(None, description="Description for 2 stars")
    star_3_descriptor: Optional[str] = Field(None, description="Description for 3 stars")
    star_4_descriptor: Optional[str] = Field(None, description="Description for 4 stars")
    star_5_descriptor: Optional[str] = Field(None, description="Description for 5 stars")
    weight_percentage: Optional[float] = Field(None, ge=0, le=100, description="Weight within this rubric")
    sequence: int = Field(default=1, ge=1, description="Sequence order within rubric")
    
    @validator('weight_percentage')
    def validate_weight_percentage(cls, v):
        """Validate weight percentage is reasonable."""
        if v is not None and v < 0:
            raise ValueError('Weight percentage cannot be negative')
        if v is not None and v > 100:
            raise ValueError('Weight percentage cannot exceed 100')
        return v


class AssessmentCriteriaCreate(AssessmentCriteriaBase):
    """Schema for creating new assessment criteria."""
    
    # All required fields are defined in AssessmentCriteriaBase
    pass


class AssessmentCriteriaUpdate(BaseModel):
    """Schema for updating assessment criteria information."""
    
    rubric_id: Optional[str] = Field(None)
    criterion_name: Optional[str] = Field(None, min_length=1, max_length=200)
    star_0_descriptor: Optional[str] = Field(None)
    star_1_descriptor: Optional[str] = Field(None)
    star_2_descriptor: Optional[str] = Field(None)
    star_3_descriptor: Optional[str] = Field(None)
    star_4_descriptor: Optional[str] = Field(None)
    star_5_descriptor: Optional[str] = Field(None)
    weight_percentage: Optional[float] = Field(None, ge=0, le=100)
    sequence: Optional[int] = Field(None, ge=1)
    
    @validator('weight_percentage')
    def validate_weight_percentage(cls, v):
        """Validate weight percentage is reasonable."""
        if v is not None and v < 0:
            raise ValueError('Weight percentage cannot be negative')
        if v is not None and v > 100:
            raise ValueError('Weight percentage cannot exceed 100')
        return v


class AssessmentCriteriaResponse(AssessmentCriteriaBase, TimestampMixin):
    """Schema for assessment criteria response."""
    
    id: str = Field(..., description="Criteria ID (UUID)")
    
    # Rubric information
    rubric_name: Optional[str] = Field(None, description="Rubric name")
    rubric_type: Optional[RubricTypeEnum] = Field(None, description="Rubric type")
    
    # Additional response fields
    usage_count: Optional[int] = Field(None, description="Number of times this criteria has been assessed")
    average_score: Optional[float] = Field(None, description="Average score for this criteria")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "criteria-id-1",
                "rubric_id": "rubric-id-1",
                "rubric_name": "Robot Building Technical Skills",
                "rubric_type": "technical_skills",
                "criterion_name": "Component Identification",
                "star_0_descriptor": "Cannot identify any robot components",
                "star_1_descriptor": "Identifies 1-2 basic components with assistance",
                "star_2_descriptor": "Identifies most basic components independently",
                "star_3_descriptor": "Identifies all components and explains their functions",
                "star_4_descriptor": None,
                "star_5_descriptor": None,
                "weight_percentage": 25.0,
                "sequence": 1,
                "usage_count": 127,
                "average_score": 2.1,
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "admin-user-id",
                "updated_by": "admin-user-id"
            }
        }


class AssessmentRubricListResponse(PaginatedResponse):
    """Schema for paginated assessment rubric list response."""
    
    items: List[AssessmentRubricResponse] = Field(..., description="List of assessment rubrics")


class AssessmentCriteriaListResponse(PaginatedResponse):
    """Schema for paginated assessment criteria list response."""
    
    items: List[AssessmentCriteriaResponse] = Field(..., description="List of assessment criteria")


class AssessmentSearchParams(BaseModel):
    """Parameters for assessment search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    lesson_id: Optional[str] = Field(None, description="Filter by lesson ID")
    section_id: Optional[str] = Field(None, description="Filter by section ID")
    module_id: Optional[str] = Field(None, description="Filter by module ID")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    rubric_type: Optional[RubricTypeEnum] = Field(None, description="Filter by rubric type")
    status: Optional[CurriculumStatusEnum] = Field(None, description="Filter by status")
    is_required: Optional[bool] = Field(None, description="Filter by required status")
    total_stars_min: Optional[int] = Field(None, ge=1, description="Minimum total stars")
    total_stars_max: Optional[int] = Field(None, ge=1, description="Maximum total stars")
    sort_by: Optional[str] = Field("sequence", description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")


class AssessmentStatsResponse(BaseModel):
    """Schema for assessment statistics response."""
    
    total_rubrics: int = Field(..., description="Total number of assessment rubrics")
    total_criteria: int = Field(..., description="Total number of assessment criteria")
    rubrics_by_type: Dict[str, int] = Field(..., description="Rubrics grouped by type")
    rubrics_by_status: Dict[str, int] = Field(..., description="Rubrics grouped by status")
    rubrics_by_curriculum: Dict[str, int] = Field(..., description="Rubrics grouped by curriculum")
    rubrics_by_program: Dict[str, int] = Field(..., description="Rubrics grouped by program")
    average_criteria_per_rubric: float = Field(..., description="Average criteria per rubric")
    average_total_stars: float = Field(..., description="Average total possible stars")
    required_rubrics_count: int = Field(..., description="Number of required rubrics")
    usage_stats: Dict[str, Any] = Field(..., description="Usage statistics")


class AssessmentRubricDetailResponse(AssessmentRubricResponse):
    """Schema for detailed assessment rubric response with criteria."""
    
    criteria: List[AssessmentCriteriaResponse] = Field(default=[], description="Assessment criteria for this rubric")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "rubric-id-1",
                "name": "Robot Building Technical Skills",
                "rubric_type": "technical_skills",
                "total_possible_stars": 3,
                "criteria": [
                    {
                        "id": "criteria-id-1",
                        "criterion_name": "Component Identification",
                        "star_0_descriptor": "Cannot identify any robot components",
                        "star_1_descriptor": "Identifies 1-2 basic components with assistance",
                        "star_2_descriptor": "Identifies most basic components independently",
                        "star_3_descriptor": "Identifies all components and explains their functions"
                    }
                ]
            }
        }


class AssessmentRubricBulkCreateRequest(BaseModel):
    """Schema for bulk creating assessment rubrics with criteria."""
    
    rubrics: List[Dict[str, Any]] = Field(..., min_items=1, description="List of rubrics to create")
    
    @validator('rubrics')
    def validate_rubrics(cls, v):
        """Validate rubric data structure."""
        for rubric in v:
            if 'name' not in rubric:
                raise ValueError('Each rubric must have a name')
            if 'rubric_type' not in rubric:
                raise ValueError('Each rubric must have a rubric_type')
            if 'total_possible_stars' not in rubric:
                raise ValueError('Each rubric must have total_possible_stars')
        return v


class AssessmentRubricCopyRequest(BaseModel):
    """Schema for copying an assessment rubric."""
    
    new_name: str = Field(..., min_length=1, max_length=200, description="Name for the copied rubric")
    target_lesson_id: Optional[str] = Field(None, description="Target lesson ID")
    target_section_id: Optional[str] = Field(None, description="Target section ID")
    target_module_id: Optional[str] = Field(None, description="Target module ID")
    copy_criteria: bool = Field(default=True, description="Whether to copy all criteria")
    adjust_for_target: bool = Field(default=False, description="Whether to adjust criteria for target context")


class AssessmentReorderRequest(BaseModel):
    """Schema for reordering assessments."""
    
    assessment_orders: List[Dict[str, int]] = Field(
        ..., 
        min_items=1, 
        description="List of assessment ID and sequence mappings"
    )
    
    @validator('assessment_orders')
    def validate_assessment_orders(cls, v):
        """Validate assessment order mappings."""
        if not v:
            raise ValueError('Assessment orders cannot be empty')
        
        # Check for duplicate sequences
        sequences = [item.get('sequence') for item in v if 'sequence' in item]
        if len(sequences) != len(set(sequences)):
            raise ValueError('Duplicate sequences are not allowed')
        
        # Check for missing required fields
        for item in v:
            if 'id' not in item or 'sequence' not in item:
                raise ValueError('Each assessment order must have id and sequence fields')
        
        return v


class StudentAssessmentResponse(BaseModel):
    """Schema for student assessment results."""
    
    student_id: str = Field(..., description="Student ID")
    student_name: str = Field(..., description="Student name")
    rubric_id: str = Field(..., description="Assessment rubric ID")
    rubric_name: str = Field(..., description="Assessment rubric name")
    total_score: float = Field(..., description="Total score achieved")
    max_possible_score: float = Field(..., description="Maximum possible score")
    percentage: float = Field(..., description="Percentage score")
    criteria_scores: List[Dict[str, Any]] = Field(..., description="Individual criteria scores")
    assessed_by: Optional[str] = Field(None, description="Assessed by user ID")
    assessed_at: datetime = Field(..., description="Assessment timestamp")
    notes: Optional[str] = Field(None, description="Assessment notes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "student-id-1",
                "student_name": "John Doe",
                "rubric_id": "rubric-id-1",
                "rubric_name": "Robot Building Technical Skills",
                "total_score": 7.5,
                "max_possible_score": 9.0,
                "percentage": 83.33,
                "criteria_scores": [
                    {
                        "criteria_id": "criteria-id-1",
                        "criterion_name": "Component Identification",
                        "score": 2.5,
                        "max_score": 3.0
                    }
                ],
                "assessed_by": "instructor-id-1",
                "assessed_at": "2025-01-08T14:30:00Z",
                "notes": "Good understanding of basic components"
            }
        }