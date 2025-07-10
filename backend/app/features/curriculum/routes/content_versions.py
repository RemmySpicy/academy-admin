"""
Content Version API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.curriculum.schemas.content_version import (
    ContentVersionCreate,
    ContentVersionUpdate,
    ContentVersionResponse,
    ContentVersionListResponse,
    ContentVersionSearchParams,
    ContentVersionStatsResponse,
    ContentVersionCompareResponse,
    ContentVersionRestoreRequest,
)
from app.features.curriculum.schemas.common import BulkActionResponse
from app.features.curriculum.services.content_version_service import content_version_service


router = APIRouter()


@router.post("/", response_model=ContentVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_content_version(
    version_data: ContentVersionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new content version.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        version = content_version_service.create_content_version(db, version_data, current_user["id"])
        return version
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating content version: {str(e)}"
        )


@router.get("/", response_model=ContentVersionListResponse)
async def list_content_versions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    lesson_id: Optional[str] = Query(None, description="Filter by lesson ID"),
    section_id: Optional[str] = Query(None, description="Filter by section ID"),
    module_id: Optional[str] = Query(None, description="Filter by module ID"),
    level_id: Optional[str] = Query(None, description="Filter by level ID"),
    curriculum_id: Optional[str] = Query(None, description="Filter by curriculum ID"),
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    content_type: Optional[str] = Query(None, description="Filter by content type"),
    is_current: Optional[bool] = Query(None, description="Filter by current version status"),
    created_by: Optional[str] = Query(None, description="Filter by creator"),
    version_number_min: Optional[int] = Query(None, ge=1, description="Minimum version number"),
    version_number_max: Optional[int] = Query(None, ge=1, description="Maximum version number"),
    sort_by: Optional[str] = Query("version_number", description="Sort field"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List content versions with optional search and pagination.
    
    Supports filtering by lesson, section, module, level, curriculum, course, program, content type, current status, creator, version number and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, lesson_id, section_id, module_id, level_id, curriculum_id, course_id, program_id, 
                content_type, is_current, created_by, version_number_min, version_number_max, sort_by]):
            search_params = ContentVersionSearchParams(
                search=search,
                lesson_id=lesson_id,
                section_id=section_id,
                module_id=module_id,
                level_id=level_id,
                curriculum_id=curriculum_id,
                course_id=course_id,
                program_id=program_id,
                content_type=content_type,
                is_current=is_current,
                created_by=created_by,
                version_number_min=version_number_min,
                version_number_max=version_number_max,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        versions, total_count = content_version_service.list_content_versions(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ContentVersionListResponse(
            items=versions,
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
            detail=f"Error listing content versions: {str(e)}"
        )


@router.get("/stats", response_model=ContentVersionStatsResponse)
async def get_content_version_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get content version statistics.
    
    Returns counts, type distribution, version patterns, and other statistical information.
    """
    try:
        stats = content_version_service.get_content_version_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting content version stats: {str(e)}"
        )


@router.get("/{version_id}", response_model=ContentVersionResponse)
async def get_content_version(
    version_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific content version by ID.
    
    Returns detailed content version information.
    """
    version = content_version_service.get_content_version(db, version_id)
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content version not found"
        )
    
    return version


@router.put("/{version_id}", response_model=ContentVersionResponse)
async def update_content_version(
    version_id: str,
    version_data: ContentVersionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update content version information.
    
    Allows partial updates of content version data.
    """
    try:
        version = content_version_service.update_content_version(db, version_id, version_data, current_user["id"])
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content version not found"
            )
        return version
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating content version: {str(e)}"
        )


@router.delete("/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content_version(
    version_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete a content version.
    
    Permanently removes the content version from the system.
    Cannot delete current versions.
    """
    try:
        success = content_version_service.delete_content_version(db, version_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content version not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting content version: {str(e)}"
        )


@router.get("/by-lesson/{lesson_id}", response_model=ContentVersionListResponse)
async def get_versions_by_lesson(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all content versions for a specific lesson.
    
    Returns versions ordered by version number (newest first).
    """
    try:
        versions, total_count = content_version_service.get_versions_by_lesson(
            db=db,
            lesson_id=lesson_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ContentVersionListResponse(
            items=versions,
            total=total_count,
            page=page,
            limit=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting versions by lesson: {str(e)}"
        )


@router.get("/compare/{version1_id}/{version2_id}", response_model=ContentVersionCompareResponse)
async def compare_content_versions(
    version1_id: str,
    version2_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Compare two content versions.
    
    Returns detailed comparison showing differences between versions.
    """
    try:
        comparison = content_version_service.compare_content_versions(db, version1_id, version2_id)
        if not comparison:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or both content versions not found"
            )
        return comparison
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error comparing content versions: {str(e)}"
        )


@router.post("/{version_id}/restore", response_model=ContentVersionResponse)
async def restore_content_version(
    version_id: str,
    restore_data: ContentVersionRestoreRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Restore a content version as the current version.
    
    Creates a new version based on the selected historical version.
    """
    try:
        version = content_version_service.restore_content_version(
            db,
            version_id,
            restore_data,
            current_user["id"]
        )
        
        return version
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error restoring content version: {str(e)}"
        )


@router.get("/current/lesson/{lesson_id}", response_model=ContentVersionResponse)
async def get_current_version_for_lesson(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get the current content version for a specific lesson.
    
    Returns the active version of the lesson content.
    """
    try:
        version = content_version_service.get_current_version_for_lesson(db, lesson_id)
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No current version found for lesson"
            )
        return version
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting current version for lesson: {str(e)}"
        )


@router.post("/publish/{version_id}", response_model=ContentVersionResponse)
async def publish_content_version(
    version_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Publish a content version as the current version.
    
    Sets the specified version as the current active version.
    """
    try:
        version = content_version_service.publish_content_version(
            db,
            version_id,
            current_user["id"]
        )
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content version not found"
            )
        
        return version
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error publishing content version: {str(e)}"
        )


@router.get("/history/lesson/{lesson_id}", response_model=ContentVersionListResponse)
async def get_lesson_version_history(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get version history for a specific lesson.
    
    Returns all versions for the lesson ordered by version number (newest first).
    """
    try:
        versions, total_count = content_version_service.get_lesson_version_history(
            db=db,
            lesson_id=lesson_id,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return ContentVersionListResponse(
            items=versions,
            total=total_count,
            page=page,
            limit=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting lesson version history: {str(e)}"
        )