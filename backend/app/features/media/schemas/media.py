"""
Media library schemas for curriculum management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator

from app.features.courses.schemas.common import (
    CurriculumStatusEnum,
    MediaTypeEnum,
    TimestampMixin,
    PaginatedResponse,
)


class MediaLibraryBase(BaseModel):
    """Base media library schema with common fields."""
    
    title: str = Field(..., min_length=1, max_length=200, description="Media title")
    description: Optional[str] = Field(None, description="Media description")
    media_type: MediaTypeEnum = Field(..., description="Type of media")
    file_name: str = Field(..., min_length=1, max_length=255, description="Original file name")
    file_path: str = Field(..., description="File storage path")
    file_size: int = Field(..., ge=0, description="File size in bytes")
    mime_type: str = Field(..., description="MIME type of the file")
    duration_seconds: Optional[int] = Field(None, ge=0, description="Duration for video/audio files")
    resolution: Optional[str] = Field(None, description="Resolution for images/videos (e.g., 1920x1080)")
    tags: Optional[str] = Field(None, description="Comma-separated tags")
    is_public: bool = Field(default=False, description="Whether media is publicly accessible")
    thumbnail_path: Optional[str] = Field(None, description="Thumbnail image path")
    metadata: Optional[str] = Field(None, description="Additional metadata as JSON string")
    accessibility_text: Optional[str] = Field(None, description="Accessibility description")
    copyright_info: Optional[str] = Field(None, description="Copyright information")
    source_url: Optional[str] = Field(None, description="Original source URL if applicable")
    
    @validator('file_size')
    def validate_file_size(cls, v):
        """Validate file size is reasonable."""
        if v < 0:
            raise ValueError('File size cannot be negative')
        # 2GB limit
        if v > 2 * 1024 * 1024 * 1024:
            raise ValueError('File size cannot exceed 2GB')
        return v
    
    @validator('duration_seconds')
    def validate_duration(cls, v):
        """Validate duration is reasonable."""
        if v is not None:
            if v < 0:
                raise ValueError('Duration cannot be negative')
            # 24 hours limit
            if v > 24 * 60 * 60:
                raise ValueError('Duration cannot exceed 24 hours')
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags format."""
        if v is not None:
            # Clean up tags
            tags = [tag.strip() for tag in v.split(',') if tag.strip()]
            if len(tags) > 20:
                raise ValueError('Cannot have more than 20 tags')
            return ', '.join(tags)
        return v


class MediaLibraryCreate(MediaLibraryBase):
    """Schema for creating a new media library entry."""
    
    # All required fields are defined in MediaLibraryBase
    pass


class MediaLibraryUpdate(BaseModel):
    """Schema for updating media library information."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    media_type: Optional[MediaTypeEnum] = Field(None)
    tags: Optional[str] = Field(None)
    is_public: Optional[bool] = Field(None)
    accessibility_text: Optional[str] = Field(None)
    copyright_info: Optional[str] = Field(None)
    source_url: Optional[str] = Field(None)
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags format."""
        if v is not None:
            tags = [tag.strip() for tag in v.split(',') if tag.strip()]
            if len(tags) > 20:
                raise ValueError('Cannot have more than 20 tags')
            return ', '.join(tags)
        return v


class MediaLibraryResponse(MediaLibraryBase, TimestampMixin):
    """Schema for media library response."""
    
    id: str = Field(..., description="Media ID (UUID)")
    
    # Additional response fields
    download_count: Optional[int] = Field(None, description="Number of downloads")
    view_count: Optional[int] = Field(None, description="Number of views")
    usage_count: Optional[int] = Field(None, description="Number of curricula using this media")
    file_url: Optional[str] = Field(None, description="Access URL for the file")
    thumbnail_url: Optional[str] = Field(None, description="Access URL for thumbnail")
    
    # File information
    file_extension: Optional[str] = Field(None, description="File extension")
    is_processed: bool = Field(default=True, description="Whether file processing is complete")
    processing_status: Optional[str] = Field(None, description="File processing status")
    
    # Audit information
    uploaded_by: Optional[str] = Field(None, description="Uploaded by user ID")
    created_by: Optional[str] = Field(None, description="Created by user ID")
    updated_by: Optional[str] = Field(None, description="Updated by user ID")
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": "media-id-1",
                "title": "Introduction to Robotics Video",
                "description": "Comprehensive introduction video covering basic robotics concepts",
                "media_type": "video",
                "file_name": "robotics_intro.mp4",
                "file_path": "/media/videos/robotics_intro.mp4",
                "file_size": 157286400,  # ~150MB
                "mime_type": "video/mp4",
                "duration_seconds": 600,  # 10 minutes
                "resolution": "1920x1080",
                "tags": "robotics, introduction, beginner, educational",
                "is_public": False,
                "thumbnail_path": "/media/thumbnails/robotics_intro_thumb.jpg",
                "accessibility_text": "Video showing various types of robots and their applications",
                "copyright_info": "Educational use license",
                "source_url": None,
                "download_count": 23,
                "view_count": 156,
                "usage_count": 3,
                "file_url": "/api/v1/media/media-id-1/download",
                "thumbnail_url": "/api/v1/media/media-id-1/thumbnail",
                "file_extension": "mp4",
                "is_processed": True,
                "processing_status": "complete",
                "uploaded_by": "instructor-id-1",
                "created_at": "2025-01-08T12:00:00Z",
                "updated_at": "2025-01-08T12:00:00Z",
                "created_by": "instructor-id-1",
                "updated_by": "admin-user-id"
            }
        }


class MediaLibraryListResponse(PaginatedResponse):
    """Schema for paginated media library list response."""
    
    items: List[MediaLibraryResponse] = Field(..., description="List of media items")


class MediaSearchParams(BaseModel):
    """Parameters for media search and filtering."""
    
    search: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")
    media_type: Optional[MediaTypeEnum] = Field(None, description="Filter by media type")
    is_public: Optional[bool] = Field(None, description="Filter by public status")
    tags: Optional[str] = Field(None, description="Filter by tags (comma-separated)")
    file_size_min: Optional[int] = Field(None, ge=0, description="Minimum file size in bytes")
    file_size_max: Optional[int] = Field(None, ge=0, description="Maximum file size in bytes")
    duration_min: Optional[int] = Field(None, ge=0, description="Minimum duration in seconds")
    duration_max: Optional[int] = Field(None, ge=0, description="Maximum duration in seconds")
    mime_type: Optional[str] = Field(None, description="Filter by MIME type")
    uploaded_by: Optional[str] = Field(None, description="Filter by uploader")
    date_from: Optional[datetime] = Field(None, description="Filter by upload date from")
    date_to: Optional[datetime] = Field(None, description="Filter by upload date to")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class MediaStatsResponse(BaseModel):
    """Schema for media statistics response."""
    
    total_media_items: int = Field(..., description="Total number of media items")
    media_by_type: Dict[str, int] = Field(..., description="Media grouped by type")
    total_storage_used_bytes: int = Field(..., description="Total storage used in bytes")
    total_storage_used_mb: float = Field(..., description="Total storage used in MB")
    total_storage_used_gb: float = Field(..., description="Total storage used in GB")
    public_media_count: int = Field(..., description="Number of public media items")
    private_media_count: int = Field(..., description="Number of private media items")
    most_downloaded: List[Dict[str, Any]] = Field(..., description="Most downloaded media items")
    most_viewed: List[Dict[str, Any]] = Field(..., description="Most viewed media items")
    recent_uploads: List[Dict[str, Any]] = Field(..., description="Recent uploads")
    processing_queue_count: int = Field(..., description="Number of items in processing queue")


class MediaUploadRequest(BaseModel):
    """Schema for media upload request."""
    
    title: str = Field(..., min_length=1, max_length=200, description="Media title")
    description: Optional[str] = Field(None, description="Media description")
    media_type: MediaTypeEnum = Field(..., description="Type of media")
    tags: Optional[str] = Field(None, description="Comma-separated tags")
    is_public: bool = Field(default=False, description="Whether media is publicly accessible")
    accessibility_text: Optional[str] = Field(None, description="Accessibility description")
    copyright_info: Optional[str] = Field(None, description="Copyright information")
    source_url: Optional[str] = Field(None, description="Original source URL if applicable")
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags format."""
        if v is not None:
            tags = [tag.strip() for tag in v.split(',') if tag.strip()]
            if len(tags) > 20:
                raise ValueError('Cannot have more than 20 tags')
            return ', '.join(tags)
        return v


class MediaUploadResponse(BaseModel):
    """Schema for media upload response."""
    
    upload_id: str = Field(..., description="Upload session ID")
    upload_url: str = Field(..., description="URL for file upload")
    max_file_size: int = Field(..., description="Maximum allowed file size")
    allowed_mime_types: List[str] = Field(..., description="Allowed MIME types")
    expires_at: datetime = Field(..., description="Upload URL expiration time")
    
    class Config:
        schema_extra = {
            "example": {
                "upload_id": "upload-session-123",
                "upload_url": "/api/v1/media/upload/upload-session-123",
                "max_file_size": 2147483648,  # 2GB
                "allowed_mime_types": ["video/mp4", "image/jpeg", "image/png", "audio/mpeg"],
                "expires_at": "2025-01-08T13:00:00Z"
            }
        }


class MediaBulkTagRequest(BaseModel):
    """Schema for bulk tagging media items."""
    
    media_ids: List[str] = Field(..., min_items=1, description="List of media IDs")
    tags_to_add: Optional[List[str]] = Field(None, description="Tags to add")
    tags_to_remove: Optional[List[str]] = Field(None, description="Tags to remove")
    replace_all_tags: Optional[List[str]] = Field(None, description="Replace all tags with these")
    
    @validator('tags_to_add', 'tags_to_remove', 'replace_all_tags')
    def validate_tag_lists(cls, v):
        """Validate tag lists."""
        if v is not None:
            if len(v) > 20:
                raise ValueError('Cannot have more than 20 tags')
            # Clean up tags
            cleaned_tags = [tag.strip() for tag in v if tag.strip()]
            return cleaned_tags
        return v


class MediaUsageResponse(BaseModel):
    """Schema for media usage information."""
    
    media_id: str = Field(..., description="Media ID")
    media_title: str = Field(..., description="Media title")
    usage_locations: List[Dict[str, Any]] = Field(..., description="Where this media is used")
    total_usage_count: int = Field(..., description="Total number of places where media is used")
    last_accessed: Optional[datetime] = Field(None, description="Last access timestamp")
    access_frequency: float = Field(..., description="Access frequency (uses per day)")
    
    class Config:
        schema_extra = {
            "example": {
                "media_id": "media-id-1",
                "media_title": "Introduction to Robotics Video",
                "usage_locations": [
                    {
                        "type": "lesson",
                        "id": "lesson-id-1",
                        "title": "What is a Robot?",
                        "curriculum": "Basic Robot Building"
                    },
                    {
                        "type": "section",
                        "id": "section-id-1", 
                        "title": "Robot Components Overview",
                        "curriculum": "Basic Robot Building"
                    }
                ],
                "total_usage_count": 2,
                "last_accessed": "2025-01-08T10:30:00Z",
                "access_frequency": 3.2
            }
        }


class MediaProcessingStatusResponse(BaseModel):
    """Schema for media processing status."""
    
    media_id: str = Field(..., description="Media ID")
    processing_status: str = Field(..., description="Processing status")
    progress_percentage: float = Field(..., description="Processing progress percentage")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    error_message: Optional[str] = Field(None, description="Error message if processing failed")
    processing_steps: List[Dict[str, Any]] = Field(..., description="Processing steps and their status")
    
    class Config:
        schema_extra = {
            "example": {
                "media_id": "media-id-1",
                "processing_status": "processing",
                "progress_percentage": 75.5,
                "estimated_completion": "2025-01-08T12:15:00Z",
                "error_message": None,
                "processing_steps": [
                    {
                        "step": "upload",
                        "status": "completed",
                        "completed_at": "2025-01-08T12:00:00Z"
                    },
                    {
                        "step": "thumbnail_generation",
                        "status": "in_progress",
                        "progress": 75.5
                    },
                    {
                        "step": "metadata_extraction",
                        "status": "pending"
                    }
                ]
            }
        }