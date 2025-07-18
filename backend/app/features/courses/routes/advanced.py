"""
Advanced API routes for curriculum management.
Includes tree navigation, bulk operations, and advanced search.
"""

from typing import Annotated, List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.courses.schemas.advanced import (
    FullCurriculumTreeResponse,
    CurriculumSearchRequest,
    CurriculumSearchResponse,
    BulkCurriculumOperationRequest,
    CurriculumAnalyticsResponse,
    CurriculumPathResponse,
    CurriculumDependencyResponse,
    CurriculumExportRequest,
    CurriculumImportRequest,
    CurriculumTemplateResponse,
)
from app.features.courses.schemas.common import BulkActionResponse
from app.features.courses.services.advanced_service import advanced_service


router = APIRouter()


@router.get("/tree/full", response_model=FullCurriculumTreeResponse)
async def get_full_curriculum_tree(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    include_inactive: bool = Query(False, description="Include inactive items"),
    include_assessments: bool = Query(True, description="Include assessment rubrics"),
    include_equipment: bool = Query(True, description="Include equipment requirements"),
    include_media: bool = Query(True, description="Include media attachments"),
    max_depth: int = Query(10, ge=1, le=20, description="Maximum tree depth")
):
    """
    Get complete curriculum tree with all nested levels.
    
    Returns hierarchical structure from programs down to individual lessons
    with optional filtering and depth control.
    """
    try:
        tree = advanced_service.get_full_curriculum_tree(
            db=db,
            program_id=program_id,
            include_inactive=include_inactive,
            include_assessments=include_assessments,
            include_equipment=include_equipment,
            include_media=include_media,
            max_depth=max_depth
        )
        return tree
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting full curriculum tree: {str(e)}"
        )


@router.post("/search", response_model=CurriculumSearchResponse)
async def advanced_curriculum_search(
    search_request: CurriculumSearchRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Advanced search across all curriculum entities.
    
    Supports cross-entity search with relevance scoring, faceted search,
    and hierarchical result grouping.
    """
    try:
        results = advanced_service.advanced_search(
            db=db,
            search_request=search_request,
            page=page,
            per_page=per_page
        )
        return results
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing advanced search: {str(e)}"
        )


@router.post("/bulk-operations", response_model=BulkActionResponse)
async def bulk_curriculum_operations(
    operation_request: BulkCurriculumOperationRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Perform bulk operations across multiple curriculum entities.
    
    Supports bulk create, update, delete, move, and status changes
    across different entity types.
    """
    try:
        result = advanced_service.bulk_curriculum_operations(
            db=db,
            operation_request=operation_request,
            current_user_id=current_user["id"]
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
            detail=f"Error performing bulk operations: {str(e)}"
        )


@router.get("/analytics", response_model=CurriculumAnalyticsResponse)
async def get_curriculum_analytics(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_id: Optional[str] = Query(None, description="Filter by program ID"),
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    include_student_progress: bool = Query(True, description="Include student progress data"),
    include_usage_stats: bool = Query(True, description="Include usage statistics"),
    include_completion_rates: bool = Query(True, description="Include completion rates")
):
    """
    Get comprehensive curriculum analytics.
    
    Returns detailed analytics including usage patterns, completion rates,
    student progress, and curriculum effectiveness metrics.
    """
    try:
        analytics = advanced_service.get_curriculum_analytics(
            db=db,
            program_id=program_id,
            course_id=course_id,
            date_from=date_from,
            date_to=date_to,
            include_student_progress=include_student_progress,
            include_usage_stats=include_usage_stats,
            include_completion_rates=include_completion_rates
        )
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting curriculum analytics: {str(e)}"
        )


@router.get("/path/{lesson_id}", response_model=CurriculumPathResponse)
async def get_curriculum_path(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get the complete curriculum path for a lesson.
    
    Returns the hierarchical path from program down to the specific lesson
    including all parent entities and their relationships.
    """
    try:
        path = advanced_service.get_curriculum_path(db, lesson_id)
        if not path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found or path could not be determined"
            )
        return path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting curriculum path: {str(e)}"
        )


@router.get("/dependencies/{entity_type}/{entity_id}", response_model=CurriculumDependencyResponse)
async def get_curriculum_dependencies(
    entity_type: str,
    entity_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get dependency information for a curriculum entity.
    
    Returns all entities that depend on or are dependencies of the specified entity.
    Useful for understanding impact before making changes.
    """
    try:
        dependencies = advanced_service.get_curriculum_dependencies(
            db, entity_type, entity_id
        )
        return dependencies
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting curriculum dependencies: {str(e)}"
        )


@router.post("/export", response_model=Dict[str, Any])
async def export_curriculum(
    export_request: CurriculumExportRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Export curriculum data in various formats.
    
    Supports exporting programs, courses, or curricula with all nested content
    in JSON, CSV, or custom formats.
    """
    try:
        export_data = advanced_service.export_curriculum(
            db=db,
            export_request=export_request,
            current_user_id=current_user["id"]
        )
        return export_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting curriculum: {str(e)}"
        )


@router.post("/import", response_model=BulkActionResponse)
async def import_curriculum(
    import_request: CurriculumImportRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Import curriculum data from external sources.
    
    Supports importing curriculum structures from JSON, CSV, or other formats
    with validation and conflict resolution.
    """
    try:
        result = advanced_service.import_curriculum(
            db=db,
            import_request=import_request,
            current_user_id=current_user["id"]
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
            detail=f"Error importing curriculum: {str(e)}"
        )


@router.get("/templates", response_model=List[CurriculumTemplateResponse])
async def get_curriculum_templates(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    template_type: Optional[str] = Query(None, description="Filter by template type"),
    is_public: Optional[bool] = Query(None, description="Filter by public status")
):
    """
    Get available curriculum templates.
    
    Returns predefined curriculum templates that can be used as starting points
    for creating new curricula.
    """
    try:
        templates = advanced_service.get_curriculum_templates(
            db=db,
            template_type=template_type,
            is_public=is_public
        )
        return templates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting curriculum templates: {str(e)}"
        )


@router.post("/templates/{template_id}/apply", response_model=BulkActionResponse)
async def apply_curriculum_template(
    template_id: str,
    target_program_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Apply a curriculum template to create new curriculum structure.
    
    Creates a new curriculum structure based on the selected template
    within the specified program.
    """
    try:
        result = advanced_service.apply_curriculum_template(
            db=db,
            template_id=template_id,
            target_program_id=target_program_id,
            current_user_id=current_user["id"]
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
            detail=f"Error applying curriculum template: {str(e)}"
        )


@router.get("/validation/curriculum/{curriculum_id}", response_model=Dict[str, Any])
async def validate_curriculum_structure(
    curriculum_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Validate curriculum structure and identify issues.
    
    Checks for missing dependencies, broken relationships, incomplete content,
    and other structural issues in the curriculum.
    """
    try:
        validation_result = advanced_service.validate_curriculum_structure(
            db, curriculum_id
        )
        return validation_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating curriculum structure: {str(e)}"
        )


@router.get("/recommendations/lesson/{lesson_id}", response_model=Dict[str, Any])
async def get_lesson_recommendations(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get AI-powered recommendations for lesson improvement.
    
    Analyzes lesson content, student performance, and curriculum structure
    to provide suggestions for improvement.
    """
    try:
        recommendations = advanced_service.get_lesson_recommendations(
            db, lesson_id
        )
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting lesson recommendations: {str(e)}"
        )


@router.post("/optimize/curriculum/{curriculum_id}", response_model=Dict[str, Any])
async def optimize_curriculum_structure(
    curriculum_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Optimize curriculum structure for better learning outcomes.
    
    Analyzes curriculum flow, difficulty progression, and student performance
    to suggest structural improvements.
    """
    try:
        optimization_result = advanced_service.optimize_curriculum_structure(
            db, curriculum_id, current_user["id"]
        )
        return optimization_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error optimizing curriculum structure: {str(e)}"
        )