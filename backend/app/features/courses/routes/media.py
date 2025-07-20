"""
Media API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import os
from datetime import datetime

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.middleware import create_program_filter_dependency
from app.features.courses.schemas.media import (
    MediaLibraryCreate,
    MediaLibraryUpdate,
    MediaLibraryResponse,
    MediaLibraryListResponse,
    MediaSearchParams,
    MediaStatsResponse,
    MediaUploadRequest,
    MediaUploadResponse,
    MediaBulkTagRequest,
    MediaUsageResponse,
    MediaProcessingStatusResponse,
)
from app.features.courses.schemas.common import BulkActionResponse
from app.features.courses.services.media_service import media_service


router = APIRouter()
get_program_filter = create_program_filter_dependency(get_current_active_user)


@router.post("/upload-session", response_model=MediaUploadResponse)
async def create_upload_session(
    upload_request: MediaUploadRequest,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create an upload session for media files.
    
    Returns upload URL and parameters for file upload.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        upload_session = media_service.create_upload_session(
            db, upload_request, current_user["id"], program_context
        )
        return upload_session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating upload session: {str(e)}"
        )


@router.post("/upload/{upload_id}", response_model=MediaLibraryResponse)
async def upload_media_file(
    upload_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    file: UploadFile = File(...)
):
    """
    Upload media file using upload session.
    
    Processes the uploaded file and creates media library entry.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        # Save uploaded file
        upload_dir = f"/app/media/uploads/{upload_id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create media library entry
        media_data = MediaLibraryCreate(
            title=file.filename,
            description=f"Uploaded file: {file.filename}",
            media_type="other",  # Will be determined by MIME type
            file_name=file.filename,
            file_path=file_path,
            file_size=len(content),
            mime_type=file.content_type or "application/octet-stream"
        )
        
        media = media_service.create_media(db, media_data, current_user["id"], program_context)
        return media
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.get("/", response_model=MediaLibraryListResponse)
async def list_media(
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    media_type: Optional[str] = Query(None, description="Filter by media type"),
    is_public: Optional[bool] = Query(None, description="Filter by public status"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    file_size_min: Optional[int] = Query(None, ge=0, description="Minimum file size in bytes"),
    file_size_max: Optional[int] = Query(None, ge=0, description="Maximum file size in bytes"),
    sort_by: Optional[str] = Query("created_at", description="Sort field"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List media items with optional search and pagination.
    
    Supports filtering by type, public status, tags, file size and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, media_type, is_public, tags, file_size_min, file_size_max, sort_by]):
            search_params = MediaSearchParams(
                search=search,
                media_type=media_type,
                is_public=is_public,
                tags=tags,
                file_size_min=file_size_min,
                file_size_max=file_size_max,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        media_items, total_count = media_service.list_media(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page,
            program_context=program_context
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return MediaLibraryListResponse(
            items=media_items,
            total=total_count,
            page=page,
            limit=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing media: {str(e)}"
        )


@router.get("/stats", response_model=MediaStatsResponse)
async def get_media_stats(
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get media library statistics.
    
    Returns counts, storage usage, and other statistical information.
    """
    try:
        stats = media_service.get_media_stats(db, program_context)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting media stats: {str(e)}"
        )


@router.get("/{media_id}", response_model=MediaLibraryResponse)
async def get_media(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific media item by ID.
    
    Returns detailed media information.
    """
    media = media_service.get_media(db, media_id, program_context)
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    return media


@router.put("/{media_id}", response_model=MediaLibraryResponse)
async def update_media(
    media_id: str,
    media_data: MediaLibraryUpdate,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update media information.
    
    Allows partial updates of media metadata.
    """
    try:
        media = media_service.update_media(db, media_id, media_data, current_user["id"], program_context)
        if not media:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media not found"
            )
        return media
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating media: {str(e)}"
        )


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a media item and associated files.
    
    Permanently removes the media from the system.
    Requires admin privileges.
    """
    # Check admin permissions
    if current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete media"
        )
    
    try:
        success = media_service.delete_media(db, media_id, program_context)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting media: {str(e)}"
        )


@router.get("/{media_id}/download")
async def download_media(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Download media file.
    
    Returns the media file for download.
    """
    media = media_service.get_media(db, media_id, program_context)
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    # Check if file exists
    file_path = media.file_path
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    # Check access permissions
    if not media.is_public and current_user.get("role") not in ["super_admin", "program_admin", "instructor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return FileResponse(
        path=file_path,
        filename=media.file_name,
        media_type=media.mime_type
    )


@router.get("/{media_id}/thumbnail")
async def get_media_thumbnail(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get media thumbnail.
    
    Returns thumbnail image for the media.
    """
    media = media_service.get_media(db, media_id, program_context)
    if not media or not media.thumbnail_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thumbnail not found"
        )
    
    # Check if thumbnail exists
    if not os.path.exists(media.thumbnail_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thumbnail file not found on disk"
        )
    
    return FileResponse(
        path=media.thumbnail_path,
        media_type="image/jpeg"
    )


@router.get("/{media_id}/usage", response_model=MediaUsageResponse)
async def get_media_usage(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get media usage information.
    
    Returns where the media is used across the curriculum.
    """
    try:
        usage = media_service.get_media_usage(db, media_id, program_context)
        if not usage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media not found"
            )
        return usage
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting media usage: {str(e)}"
        )


@router.get("/{media_id}/processing-status", response_model=MediaProcessingStatusResponse)
async def get_processing_status(
    media_id: str,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get media processing status.
    
    Returns current processing status and progress.
    """
    try:
        status_info = media_service.get_processing_status(db, media_id, program_context)
        if not status_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media not found"
            )
        return status_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting processing status: {str(e)}"
        )


@router.post("/bulk-tag", response_model=BulkActionResponse)
async def bulk_tag_media(
    tag_data: MediaBulkTagRequest,
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk update tags for media items.
    
    Add, remove, or replace tags for multiple media items.
    """
    try:
        result = media_service.bulk_tag_media(
            db,
            tag_data,
            current_user["id"],
            program_context
        )
        
        return BulkActionResponse(
            successful=result["successful"],
            failed=result["failed"],
            total_processed=result["total_processed"],
            total_successful=result["total_successful"],
            total_failed=result["total_failed"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error bulk tagging media: {str(e)}"
        )