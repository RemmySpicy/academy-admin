"""
Media service for curriculum management operations.
"""

import os
import hashlib
import mimetypes
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc
from datetime import datetime, timedelta

from app.features.curriculum.models.media import MediaLibrary
from app.features.curriculum.schemas.media import (
    MediaLibraryCreate,
    MediaLibraryUpdate,
    MediaLibraryResponse,
    MediaSearchParams,
    MediaStatsResponse,
    MediaUploadRequest,
    MediaUploadResponse,
    MediaBulkTagRequest,
    MediaUsageResponse,
    MediaProcessingStatusResponse
)
from .base_service import BaseService


class MediaService(BaseService[MediaLibrary, MediaLibraryCreate, MediaLibraryUpdate]):
    """Service for media library operations."""
    
    def __init__(self, upload_path: str = "/app/media"):
        super().__init__(MediaLibrary)
        self.upload_path = upload_path
        self.max_file_size = 2 * 1024 * 1024 * 1024  # 2GB
        self.allowed_mime_types = {
            "video": ["video/mp4", "video/avi", "video/mov", "video/wmv"],
            "audio": ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
            "image": ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"],
            "document": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
            "presentation": ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
            "interactive": ["application/zip", "application/x-zip-compressed"],
            "other": ["text/plain", "application/json", "application/xml"]
        }
    
    def create_upload_session(self, 
                             db: Session, 
                             upload_request: MediaUploadRequest,
                             uploaded_by: Optional[str] = None) -> MediaUploadResponse:
        """Create an upload session for media files."""
        # Generate upload session ID
        upload_id = hashlib.md5(f"{uploaded_by}-{datetime.now().isoformat()}".encode()).hexdigest()
        
        # Get allowed MIME types for the media type
        allowed_types = self.allowed_mime_types.get(upload_request.media_type, [])
        if upload_request.media_type == "other":
            # Allow all types for "other" category
            allowed_types = [mime_type for type_list in self.allowed_mime_types.values() for mime_type in type_list]
        
        # Create upload URL
        upload_url = f"/api/v1/media/upload/{upload_id}"
        
        # Set expiration (1 hour from now)
        expires_at = datetime.now() + timedelta(hours=1)
        
        return MediaUploadResponse(
            upload_id=upload_id,
            upload_url=upload_url,
            max_file_size=self.max_file_size,
            allowed_mime_types=allowed_types,
            expires_at=expires_at
        )
    
    def create_media(self, 
                    db: Session, 
                    media_data: MediaLibraryCreate, 
                    uploaded_by: Optional[str] = None) -> MediaLibraryResponse:
        """Create a new media library entry."""
        # Validate file exists
        if not os.path.exists(media_data.file_path):
            raise ValueError(f"File not found at path: {media_data.file_path}")
        
        # Validate MIME type
        allowed_types = self.allowed_mime_types.get(media_data.media_type, [])
        if media_data.mime_type not in allowed_types and media_data.media_type != "other":
            raise ValueError(f"MIME type '{media_data.mime_type}' not allowed for media type '{media_data.media_type}'")
        
        # Create media entry
        media_dict = media_data.dict()
        if uploaded_by:
            media_dict['uploaded_by'] = uploaded_by
            media_dict['created_by'] = uploaded_by
        
        media = MediaLibrary(**media_dict)
        db.add(media)
        db.commit()
        db.refresh(media)
        
        # Start background processing if needed
        self._process_media_file(db, media)
        
        return self._to_media_response(db, media)
    
    def get_media(self, db: Session, media_id: str) -> Optional[MediaLibraryResponse]:
        """Get media by ID."""
        media = self.get(db, media_id)
        if not media:
            return None
        
        return self._to_media_response(db, media)
    
    def update_media(self, 
                    db: Session, 
                    media_id: str, 
                    media_data: MediaLibraryUpdate,
                    updated_by: Optional[str] = None) -> Optional[MediaLibraryResponse]:
        """Update media information."""
        media = self.get(db, media_id)
        if not media:
            return None
        
        # Update media
        updated_media = self.update(db, media, media_data, updated_by)
        
        return self._to_media_response(db, updated_media)
    
    def delete_media(self, db: Session, media_id: str) -> bool:
        """Delete media and associated files."""
        media = self.get(db, media_id)
        if not media:
            return False
        
        # Delete physical files
        try:
            if os.path.exists(media.file_path):
                os.remove(media.file_path)
            
            if media.thumbnail_path and os.path.exists(media.thumbnail_path):
                os.remove(media.thumbnail_path)
        except Exception as e:
            # Log error but continue with database deletion
            print(f"Error deleting files for media {media_id}: {e}")
        
        # Delete database record
        return self.delete(db, media_id)
    
    def list_media(self, 
                  db: Session,
                  search_params: Optional[MediaSearchParams] = None,
                  page: int = 1,
                  per_page: int = 20) -> Tuple[List[MediaLibraryResponse], int]:
        """List media with optional search and pagination."""
        query = db.query(MediaLibrary)
        
        # Apply filters
        if search_params:
            if search_params.search:
                search_term = f"%{search_params.search}%"
                query = query.filter(
                    or_(
                        MediaLibrary.title.ilike(search_term),
                        MediaLibrary.description.ilike(search_term),
                        MediaLibrary.tags.ilike(search_term),
                        MediaLibrary.file_name.ilike(search_term)
                    )
                )
            
            if search_params.media_type:
                query = query.filter(MediaLibrary.media_type == search_params.media_type)
            
            if search_params.is_public is not None:
                query = query.filter(MediaLibrary.is_public == search_params.is_public)
            
            if search_params.tags:
                # Filter by tags (assuming comma-separated)
                tag_filters = []
                for tag in search_params.tags.split(','):
                    tag = tag.strip()
                    if tag:
                        tag_filters.append(MediaLibrary.tags.ilike(f"%{tag}%"))
                
                if tag_filters:
                    query = query.filter(or_(*tag_filters))
            
            if search_params.file_size_min:
                query = query.filter(MediaLibrary.file_size >= search_params.file_size_min)
            
            if search_params.file_size_max:
                query = query.filter(MediaLibrary.file_size <= search_params.file_size_max)
            
            if search_params.duration_min:
                query = query.filter(MediaLibrary.duration_seconds >= search_params.duration_min)
            
            if search_params.duration_max:
                query = query.filter(MediaLibrary.duration_seconds <= search_params.duration_max)
            
            if search_params.mime_type:
                query = query.filter(MediaLibrary.mime_type == search_params.mime_type)
            
            if search_params.uploaded_by:
                query = query.filter(MediaLibrary.uploaded_by == search_params.uploaded_by)
            
            if search_params.date_from:
                query = query.filter(MediaLibrary.created_at >= search_params.date_from)
            
            if search_params.date_to:
                query = query.filter(MediaLibrary.created_at <= search_params.date_to)
        
        # Apply sorting
        if search_params and search_params.sort_by:
            sort_field = getattr(MediaLibrary, search_params.sort_by, MediaLibrary.created_at)
            sort_order_func = desc if search_params.sort_order == "desc" else asc
            query = query.order_by(sort_order_func(sort_field))
        else:
            query = query.order_by(desc(MediaLibrary.created_at))
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        media_items = query.offset(offset).limit(per_page).all()
        
        # Convert to response objects
        media_responses = [self._to_media_response(db, media) for media in media_items]
        
        return media_responses, total_count
    
    def get_media_stats(self, db: Session) -> MediaStatsResponse:
        """Get media library statistics."""
        # Total media items
        total_media_items = db.query(func.count(MediaLibrary.id)).scalar()
        
        # Media by type
        type_stats = db.query(
            MediaLibrary.media_type,
            func.count(MediaLibrary.id)
        ).group_by(MediaLibrary.media_type).all()
        media_by_type = dict(type_stats)
        
        # Storage usage
        total_storage_bytes = db.query(func.sum(MediaLibrary.file_size)).scalar() or 0
        total_storage_mb = total_storage_bytes / (1024 * 1024)
        total_storage_gb = total_storage_mb / 1024
        
        # Public vs private
        public_count = db.query(func.count(MediaLibrary.id)).filter(
            MediaLibrary.is_public == True
        ).scalar()
        private_count = total_media_items - public_count
        
        # Most downloaded (placeholder)
        most_downloaded = [
            {"id": "media-1", "title": "Introduction Video", "downloads": 150},
            {"id": "media-2", "title": "Safety Guidelines", "downloads": 120},
        ]
        
        # Most viewed (placeholder)
        most_viewed = [
            {"id": "media-1", "title": "Introduction Video", "views": 450},
            {"id": "media-3", "title": "Robot Assembly Guide", "views": 380},
        ]
        
        # Recent uploads
        recent_uploads = db.query(MediaLibrary).order_by(
            desc(MediaLibrary.created_at)
        ).limit(5).all()
        
        recent_uploads_data = [
            {
                "id": media.id,
                "title": media.title,
                "media_type": media.media_type,
                "uploaded_at": media.created_at.isoformat()
            }
            for media in recent_uploads
        ]
        
        # Processing queue count (placeholder)
        processing_queue_count = 0
        
        return MediaStatsResponse(
            total_media_items=total_media_items,
            media_by_type=media_by_type,
            total_storage_used_bytes=total_storage_bytes,
            total_storage_used_mb=total_storage_mb,
            total_storage_used_gb=total_storage_gb,
            public_media_count=public_count,
            private_media_count=private_count,
            most_downloaded=most_downloaded,
            most_viewed=most_viewed,
            recent_uploads=recent_uploads_data,
            processing_queue_count=processing_queue_count
        )
    
    def bulk_tag_media(self, 
                      db: Session, 
                      request: MediaBulkTagRequest,
                      updated_by: Optional[str] = None) -> Dict[str, Any]:
        """Bulk update tags for media items."""
        successful = []
        failed = []
        
        for media_id in request.media_ids:
            try:
                media = self.get(db, media_id)
                if not media:
                    failed.append({"id": media_id, "error": "Media not found"})
                    continue
                
                # Get current tags
                current_tags = set()
                if media.tags:
                    current_tags = set(tag.strip() for tag in media.tags.split(',') if tag.strip())
                
                # Apply tag operations
                if request.replace_all_tags is not None:
                    # Replace all tags
                    new_tags = set(request.replace_all_tags)
                else:
                    new_tags = current_tags.copy()
                    
                    # Add tags
                    if request.tags_to_add:
                        new_tags.update(request.tags_to_add)
                    
                    # Remove tags
                    if request.tags_to_remove:
                        new_tags.difference_update(request.tags_to_remove)
                
                # Update media tags
                media.tags = ', '.join(sorted(new_tags)) if new_tags else None
                if updated_by:
                    media.updated_by = updated_by
                
                db.add(media)
                successful.append(media_id)
                
            except Exception as e:
                failed.append({"id": media_id, "error": str(e)})
        
        db.commit()
        
        return {
            "successful": successful,
            "failed": failed,
            "total_processed": len(request.media_ids),
            "total_successful": len(successful),
            "total_failed": len(failed)
        }
    
    def get_media_usage(self, db: Session, media_id: str) -> Optional[MediaUsageResponse]:
        """Get usage information for a media item."""
        media = self.get(db, media_id)
        if not media:
            return None
        
        # This would typically query lesson_media, section_media, module_media tables
        # For now, return placeholder data
        usage_locations = [
            {
                "type": "lesson",
                "id": "lesson-id-1",
                "title": "Introduction to Robotics",
                "curriculum": "Basic Robot Building"
            },
            {
                "type": "section",
                "id": "section-id-1",
                "title": "Robot Components",
                "curriculum": "Basic Robot Building"
            }
        ]
        
        return MediaUsageResponse(
            media_id=media_id,
            media_title=media.title,
            usage_locations=usage_locations,
            total_usage_count=len(usage_locations),
            last_accessed=datetime.now() - timedelta(hours=2),
            access_frequency=3.2
        )
    
    def get_processing_status(self, db: Session, media_id: str) -> Optional[MediaProcessingStatusResponse]:
        """Get processing status for a media item."""
        media = self.get(db, media_id)
        if not media:
            return None
        
        # This would track actual processing status
        # For now, return placeholder data
        processing_steps = [
            {
                "step": "upload",
                "status": "completed",
                "completed_at": "2025-01-08T12:00:00Z"
            },
            {
                "step": "thumbnail_generation",
                "status": "completed",
                "completed_at": "2025-01-08T12:01:00Z"
            },
            {
                "step": "metadata_extraction",
                "status": "completed",
                "completed_at": "2025-01-08T12:02:00Z"
            }
        ]
        
        return MediaProcessingStatusResponse(
            media_id=media_id,
            processing_status="completed",
            progress_percentage=100.0,
            estimated_completion=None,
            error_message=None,
            processing_steps=processing_steps
        )
    
    def _process_media_file(self, db: Session, media: MediaLibrary):
        """Process media file (generate thumbnails, extract metadata, etc.)."""
        # This would be implemented as background tasks
        # For now, just mark as processed
        media.is_processed = True
        media.processing_status = "completed"
        db.add(media)
        db.commit()
    
    def _to_media_response(self, db: Session, media: MediaLibrary) -> MediaLibraryResponse:
        """Convert MediaLibrary model to MediaLibraryResponse."""
        # Extract file extension
        file_extension = os.path.splitext(media.file_name)[1].lstrip('.')
        
        # Generate URLs
        file_url = f"/api/v1/media/{media.id}/download"
        thumbnail_url = f"/api/v1/media/{media.id}/thumbnail" if media.thumbnail_path else None
        
        # Placeholder usage data
        download_count = 23
        view_count = 156
        usage_count = 3
        
        return MediaLibraryResponse(
            id=media.id,
            title=media.title,
            description=media.description,
            media_type=media.media_type,
            file_name=media.file_name,
            file_path=media.file_path,
            file_size=media.file_size,
            mime_type=media.mime_type,
            duration_seconds=media.duration_seconds,
            resolution=media.resolution,
            tags=media.tags,
            is_public=media.is_public,
            thumbnail_path=media.thumbnail_path,
            metadata=media.metadata,
            accessibility_text=media.accessibility_text,
            copyright_info=media.copyright_info,
            source_url=media.source_url,
            download_count=download_count,
            view_count=view_count,
            usage_count=usage_count,
            file_url=file_url,
            thumbnail_url=thumbnail_url,
            file_extension=file_extension,
            is_processed=media.is_processed,
            processing_status=media.processing_status,
            uploaded_by=media.uploaded_by,
            created_by=media.created_by,
            updated_by=media.updated_by,
            created_at=media.created_at,
            updated_at=media.updated_at
        )


# Global instance
media_service = MediaService()