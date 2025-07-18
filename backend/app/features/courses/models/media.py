"""
Media library model for curriculum management.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, Index, String, Text, BigInteger, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ARRAY

from app.features.common.models.base import BaseModel
from app.features.common.models.enums import MediaType


class MediaLibrary(BaseModel):
    """
    Media library model for managing multimedia resources.
    
    Represents multimedia resources (video, audio, documents, images) associated 
    with lessons. Supports organized storage with metadata tagging, basic file 
    upload functionality, and media organization.
    
    Relationships:
    - Many-to-one with lessons
    """
    
    __tablename__ = "media_library"
    
    # Foreign Key to Lesson
    lesson_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("lessons.id"),
        nullable=True,
        comment="Reference to associated lesson (nullable for general media)",
    )
    
    # File Information
    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="System-generated file name",
    )
    
    original_file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Original file name as uploaded",
    )
    
    file_type: Mapped[MediaType] = mapped_column(
        nullable=False,
        comment="Type of media file",
    )
    
    file_size_bytes: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
        comment="File size in bytes",
    )
    
    file_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        comment="URL or path to the file",
    )
    
    thumbnail_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to thumbnail image",
    )
    
    # Content Information
    title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Display title for the media",
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description of the media content",
    )
    
    # Organization and Tagging
    tags: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        comment="Array of tags for categorization",
    )
    
    category: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Media category (e.g., Instructional, Assessment, Reference)",
    )
    
    # Status and Permissions
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether the media is active and accessible",
    )
    
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether the media is publicly accessible",
    )
    
    # Technical Metadata
    mime_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="MIME type of the file",
    )
    
    duration_seconds: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Duration in seconds (for video/audio)",
    )
    
    resolution: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Resolution (for video/images, e.g., 1920x1080)",
    )
    
    # Additional metadata
    alt_text: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Alternative text for accessibility",
    )
    
    copyright_info: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Copyright and attribution information",
    )
    
    source_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Original source URL if applicable",
    )
    
    # Display and Ordering
    display_order: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        comment="Order for displaying media within lesson",
    )
    
    # Relationships
    # Note: Relationships will be defined when related models are created
    # lesson = relationship("Lesson", back_populates="media_files")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_media_library_lesson_id", "lesson_id"),
        Index("idx_media_library_file_name", "file_name"),
        Index("idx_media_library_file_type", "file_type"),
        Index("idx_media_library_is_active", "is_active"),
        Index("idx_media_library_is_public", "is_public"),
        Index("idx_media_library_category", "category"),
        Index("idx_media_library_display_order", "display_order"),
        Index("idx_media_library_lesson_type", "lesson_id", "file_type"),
        Index("idx_media_library_lesson_order", "lesson_id", "display_order"),
    )
    
    @property
    def display_name(self) -> str:
        """Get display-friendly name."""
        return self.title if self.title else self.original_file_name
    
    @property
    def full_name(self) -> str:
        """Get full media name including lesson reference."""
        # This will be updated when Lesson relationship is established
        return f"Lesson Media: {self.display_name}"
    
    @property
    def file_size_display(self) -> str:
        """Get formatted file size display."""
        if not self.file_size_bytes:
            return "Unknown size"
        
        size = self.file_size_bytes
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        elif size < 1024 * 1024 * 1024:
            return f"{size / (1024 * 1024):.1f} MB"
        else:
            return f"{size / (1024 * 1024 * 1024):.1f} GB"
    
    @property
    def duration_display(self) -> str:
        """Get formatted duration display."""
        if not self.duration_seconds:
            return "Unknown duration"
        
        seconds = self.duration_seconds
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            minutes = seconds // 60
            remaining_seconds = seconds % 60
            return f"{minutes}m {remaining_seconds}s"
        else:
            hours = seconds // 3600
            remaining_seconds = seconds % 3600
            minutes = remaining_seconds // 60
            remaining_seconds = remaining_seconds % 60
            return f"{hours}h {minutes}m {remaining_seconds}s"
    
    @property
    def type_display(self) -> str:
        """Get display-friendly file type."""
        return self.file_type.value.replace("_", " ").title()
    
    @property
    def is_video(self) -> bool:
        """Check if media is video."""
        return self.file_type == MediaType.VIDEO
    
    @property
    def is_audio(self) -> bool:
        """Check if media is audio."""
        return self.file_type == MediaType.AUDIO
    
    @property
    def is_image(self) -> bool:
        """Check if media is image."""
        return self.file_type == MediaType.IMAGE
    
    @property
    def is_document(self) -> bool:
        """Check if media is document."""
        return self.file_type == MediaType.DOCUMENT
    
    def __repr__(self) -> str:
        """String representation of the media library item."""
        return f"<MediaLibrary(id={self.id}, file_name='{self.file_name}', type='{self.file_type}', lesson_id='{self.lesson_id}')>"