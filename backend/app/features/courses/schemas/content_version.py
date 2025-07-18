"""
Content version schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum

from .common import (
    CurriculumStatusEnum,
    TimestampMixin,
    PaginatedResponse,
)


class PublicationStatusEnum(str, Enum):
    """Publication status for content versions."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ContentVersionBase(BaseModel):
    """Base content version schema with common fields."""
    
    lesson_id: str = Field(..., description="Lesson ID this version belongs to")
    version_number: int = Field(..., ge=1, description="Version number")
    content_data: str = Field(..., description="Content data as JSON string")
    version_notes: Optional[str] = Field(None, description="Notes about this version")
    publication_status: PublicationStatusEnum = Field(
        default=PublicationStatusEnum.DRAFT, 
        description="Publication status"
    )
    published_at: Optional[datetime] = Field(None, description="Publication timestamp")
    content_hash: Optional[str] = Field(None, description="Content hash for integrity checking")
    
    @validator('content_data')
    def validate_content_data(cls, v):
        """Validate content data is valid JSON."""
        if v:
            try:
                import json
                json.loads(v)
            except json.JSONDecodeError:
                raise ValueError('Content data must be valid JSON')
        return v
    
    @validator('version_number')
    def validate_version_number(cls, v):
        """Validate version number is reasonable."""
        if v < 1:
            raise ValueError('Version number must be at least 1')
        if v > 10000:  # Arbitrary upper limit
            raise ValueError('Version number cannot exceed 10000')
        return v


class ContentVersionCreate(ContentVersionBase):
    """Schema for creating a new content version."""
    
    # All required fields are defined in ContentVersionBase
    pass


class ContentVersionUpdate(BaseModel):
    """Schema for updating content version information."""
    
    content_data: Optional[str] = Field(None, description="Content data as JSON string")
    version_notes: Optional[str] = Field(None, description="Notes about this version")
    publication_status: Optional[PublicationStatusEnum] = Field(None, description="Publication status")
    published_at: Optional[datetime] = Field(None, description="Publication timestamp")
    
    @validator('content_data')
    def validate_content_data(cls, v):
        """Validate content data is valid JSON."""
        if v is not None:
            try:
                import json
                json.loads(v)
            except json.JSONDecodeError:
                raise ValueError('Content data must be valid JSON')
        return v


class ContentVersionResponse(ContentVersionBase, TimestampMixin):
    """Schema for content version response."""
    
    id: str = Field(..., description="Content version ID (UUID)")
    
    # Lesson information
    lesson_title: Optional[str] = Field(None, description="Lesson title")
    lesson_id_code: Optional[str] = Field(None, description="Lesson ID code")
    section_name: Optional[str] = Field(None, description="Section name")
    module_name: Optional[str] = Field(None, description="Module name")
    level_name: Optional[str] = Field(None, description="Level name")
    curriculum_name: Optional[str] = Field(None, description="Curriculum name")
    course_name: Optional[str] = Field(None, description="Course name")
    program_name: Optional[str] = Field(None, description="Program name")
    program_code: Optional[str] = Field(None, description="Program code")
    
    # Version information
    is_current_version: bool = Field(default=False, description="Whether this is the current published version")
    size_bytes: Optional[int] = Field(None, description="Content size in bytes")
    change_summary: Optional[str] = Field(None, description="Summary of changes from previous version")
    
    # Audit information
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    published_by: Optional[str] = Field(None, description="Published by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "version-id-1",
                "lesson_id": "lesson-id-1",
                "lesson_title": "What is a Robot?",
                "lesson_id_code": "ROBOT-101-L1",
                "section_name": "Robot Components Overview",
                "module_name": "Introduction to Robotics",
                "level_name": "Getting Started",
                "curriculum_name": "Basic Robot Building",
                "course_name": "Introduction to Robotics",
                "program_name": "Robotics Engineering",
                "program_code": "ROBOT-ENG",
                "version_number": 2,
                "content_data": "{\"title\": \"What is a Robot?\", \"content\": \"A robot is...\", \"activities\": [...]}",
                "version_notes": "Updated learning objectives and added interactive quiz",
                "publication_status": "published",
                "published_at": "2025-01-08T12:30:00Z",
                "content_hash": "sha256:abc123...",
                "is_current_version": True,
                "size_bytes": 2048,
                "change_summary": "Added interactive elements and updated content structure",
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:30:00Z",
                "created_by": "instructor-id-1",
                "updated_by": "instructor-id-1",
                "published_by": "admin-user-id"
            }
        }


class ContentVersionListResponse(PaginatedResponse):
    """Schema for paginated content version list response."""
    
    items: List[ContentVersionResponse] = Field(..., description="List of content versions")


class ContentVersionSearchParams(BaseModel):
    """Parameters for content version search and filtering."""
    
    lesson_id: Optional[str] = Field(None, description="Filter by lesson ID")
    section_id: Optional[str] = Field(None, description="Filter by section ID")
    module_id: Optional[str] = Field(None, description="Filter by module ID")
    level_id: Optional[str] = Field(None, description="Filter by level ID")
    curriculum_id: Optional[str] = Field(None, description="Filter by curriculum ID")
    course_id: Optional[str] = Field(None, description="Filter by course ID")
    program_id: Optional[str] = Field(None, description="Filter by program ID")
    publication_status: Optional[PublicationStatusEnum] = Field(None, description="Filter by publication status")
    version_from: Optional[int] = Field(None, ge=1, description="Version number from")
    version_to: Optional[int] = Field(None, ge=1, description="Version number to")
    published_from: Optional[datetime] = Field(None, description="Published date from")
    published_to: Optional[datetime] = Field(None, description="Published date to")
    created_by: Optional[str] = Field(None, description="Filter by creator")
    is_current_version: Optional[bool] = Field(None, description="Filter by current version status")
    sort_by: Optional[str] = Field("version_number", description="Sort field")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class ContentVersionStatsResponse(BaseModel):
    """Schema for content version statistics response."""
    
    total_versions: int = Field(..., description="Total number of content versions")
    versions_by_status: Dict[str, int] = Field(..., description="Versions grouped by publication status")
    versions_by_lesson: Dict[str, int] = Field(..., description="Versions grouped by lesson")
    versions_by_curriculum: Dict[str, int] = Field(..., description="Versions grouped by curriculum")
    versions_by_program: Dict[str, int] = Field(..., description="Versions grouped by program")
    average_versions_per_lesson: float = Field(..., description="Average versions per lesson")
    most_versioned_lessons: List[Dict[str, Any]] = Field(..., description="Lessons with most versions")
    recent_publications: List[Dict[str, Any]] = Field(..., description="Recent publications")
    total_storage_used_bytes: int = Field(..., description="Total storage used by versions")


class ContentVersionDetailResponse(ContentVersionResponse):
    """Schema for detailed content version response with parsed content."""
    
    parsed_content: Dict[str, Any] = Field(..., description="Parsed content data")
    content_diff: Optional[Dict[str, Any]] = Field(None, description="Differences from previous version")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "version-id-1",
                "lesson_id": "lesson-id-1",
                "version_number": 2,
                "parsed_content": {
                    "title": "What is a Robot?",
                    "content": "A robot is a programmable machine...",
                    "learning_objectives": ["Define robot", "Identify components"],
                    "activities": [
                        {
                            "type": "quiz",
                            "questions": [...]
                        }
                    ]
                },
                "content_diff": {
                    "added": ["activities.quiz"],
                    "modified": ["learning_objectives"],
                    "removed": []
                }
            }
        }


class ContentVersionPublishRequest(BaseModel):
    """Schema for publishing a content version."""
    
    publication_notes: Optional[str] = Field(None, description="Notes about publication")
    notify_instructors: bool = Field(default=True, description="Whether to notify instructors")
    effective_date: Optional[datetime] = Field(None, description="When this version becomes effective")


class ContentVersionRollbackRequest(BaseModel):
    """Schema for rolling back to a previous version."""
    
    target_version_id: str = Field(..., description="Version ID to rollback to")
    rollback_reason: str = Field(..., description="Reason for rollback")
    create_backup: bool = Field(default=True, description="Whether to create backup of current version")


class ContentVersionCompareRequest(BaseModel):
    """Schema for comparing content versions."""
    
    version_1_id: str = Field(..., description="First version ID for comparison")
    version_2_id: str = Field(..., description="Second version ID for comparison")
    comparison_type: str = Field(default="text", description="Type of comparison (text, structure, etc.)")


class ContentVersionCompareResponse(BaseModel):
    """Schema for content version comparison response."""
    
    version_1: ContentVersionResponse = Field(..., description="First version details")
    version_2: ContentVersionResponse = Field(..., description="Second version details")
    differences: Dict[str, Any] = Field(..., description="Detailed differences")
    similarity_score: float = Field(..., description="Similarity score (0-100)")
    change_summary: List[str] = Field(..., description="Summary of changes")
    
    class Config:
        schema_extra = {
            "example": {
                "version_1": {
                    "id": "version-id-1",
                    "version_number": 1,
                    "created_at": "2025-01-07T12:00:00Z"
                },
                "version_2": {
                    "id": "version-id-2",
                    "version_number": 2,
                    "created_at": "2025-01-08T12:00:00Z"
                },
                "differences": {
                    "content_changes": [
                        {
                            "field": "learning_objectives",
                            "type": "addition",
                            "value": "Identify robot sensors"
                        }
                    ],
                    "structural_changes": [
                        {
                            "type": "added_section",
                            "section": "activities.quiz"
                        }
                    ]
                },
                "similarity_score": 87.5,
                "change_summary": [
                    "Added new learning objective",
                    "Inserted interactive quiz section",
                    "Updated content formatting"
                ]
            }
        }


class ContentVersionBulkActionRequest(BaseModel):
    """Schema for bulk actions on content versions."""
    
    version_ids: List[str] = Field(..., min_items=1, description="List of version IDs")
    action: str = Field(..., description="Action to perform")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Action parameters")
    
    @validator('action')
    def validate_action(cls, v):
        """Validate action type."""
        allowed_actions = {
            'archive', 'restore', 'publish', 'delete'
        }
        if v not in allowed_actions:
            raise ValueError(f'Action must be one of: {", ".join(allowed_actions)}')
        return v


class ContentVersionRestoreRequest(BaseModel):
    """Schema for restoring a content version."""
    
    restore_as_new: bool = Field(default=True, description="Whether to restore as a new version")
    new_version_notes: Optional[str] = Field(None, description="Notes for the restored version")
    preserve_metadata: bool = Field(default=True, description="Whether to preserve original metadata")