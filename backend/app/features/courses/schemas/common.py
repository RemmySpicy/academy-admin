"""
Common schemas and enums for curriculum management.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

from app.features.common.models.enums import (
    CurriculumStatus,
    DifficultyLevel,
    EquipmentType,
    RubricType,
    MediaType,
)


# Export enums for API usage
class CurriculumStatusEnum(str, Enum):
    """Curriculum status enumeration."""
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class DifficultyLevelEnum(str, Enum):
    """Difficulty level enumeration."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class EquipmentTypeEnum(str, Enum):
    """Equipment type enumeration."""
    SAFETY = "safety"
    TOOL = "tool"
    MATERIAL = "material"
    TECHNOLOGY = "technology"
    FURNITURE = "furniture"
    OTHER = "other"


class RubricTypeEnum(str, Enum):
    """Assessment rubric type enumeration."""
    TECHNICAL_SKILLS = "technical_skills"
    SAFETY_COMPLIANCE = "safety_compliance"
    CREATIVITY = "creativity"
    TEAMWORK = "teamwork"
    PROBLEM_SOLVING = "problem_solving"
    COMMUNICATION = "communication"
    PROJECT_COMPLETION = "project_completion"
    OTHER = "other"


class MediaTypeEnum(str, Enum):
    """Media type enumeration."""
    VIDEO = "video"
    AUDIO = "audio"
    IMAGE = "image"
    DOCUMENT = "document"
    PRESENTATION = "presentation"
    INTERACTIVE = "interactive"
    OTHER = "other"


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""
    
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class PaginatedResponse(BaseModel):
    """Base schema for paginated responses."""
    
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there is a next page")
    has_prev: bool = Field(..., description="Whether there is a previous page")


class TreeNode(BaseModel):
    """Base schema for tree navigation nodes."""
    
    id: str = Field(..., description="Node ID")
    title: str = Field(..., description="Node title")
    type: str = Field(..., description="Node type")
    children: Optional[List["TreeNode"]] = Field(None, description="Child nodes")
    metadata: Optional[dict] = Field(None, description="Additional node metadata")


class BulkActionRequest(BaseModel):
    """Schema for bulk actions."""
    
    item_ids: List[str] = Field(..., min_items=1, description="List of item IDs")
    action: str = Field(..., description="Action to perform")
    parameters: Optional[dict] = Field(None, description="Additional parameters")


class BulkActionResponse(BaseModel):
    """Schema for bulk action responses."""
    
    successful: List[str] = Field(..., description="Successfully processed IDs")
    failed: List[dict] = Field(..., description="Failed items with error details")
    total_processed: int = Field(..., description="Total items processed")
    total_successful: int = Field(..., description="Total successful operations")
    total_failed: int = Field(..., description="Total failed operations")


# Update TreeNode to allow forward references
TreeNode.model_rebuild()