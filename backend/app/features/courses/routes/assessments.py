"""
Assessment API routes for curriculum management.
"""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.features.courses.schemas.assessment import (
    AssessmentRubricCreate,
    AssessmentRubricUpdate,
    AssessmentRubricResponse,
    AssessmentRubricListResponse,
    AssessmentRubricDetailResponse,
    AssessmentCriteriaCreate,
    AssessmentCriteriaUpdate,
    AssessmentCriteriaResponse,
    AssessmentCriteriaListResponse,
    AssessmentSearchParams,
    AssessmentStatsResponse,
    AssessmentRubricBulkCreateRequest,
    AssessmentRubricCopyRequest,
    AssessmentReorderRequest,
    StudentAssessmentResponse,
)
from app.features.courses.schemas.common import BulkActionResponse
from app.features.courses.services.assessment_service import assessment_service


router = APIRouter()


# Rubric endpoints
@router.post("/rubrics", response_model=AssessmentRubricResponse, status_code=status.HTTP_201_CREATED)
async def create_rubric(
    rubric_data: AssessmentRubricCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create a new assessment rubric.
    
    Requires authentication and appropriate permissions.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        rubric = assessment_service.create_rubric(db, rubric_data, current_user["id"])
        return rubric
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating rubric: {str(e)}"
        )


@router.get("/rubrics", response_model=AssessmentRubricListResponse)
async def list_rubrics(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    lesson_id: Optional[str] = Query(None, description="Filter by lesson ID"),
    section_id: Optional[str] = Query(None, description="Filter by section ID"),
    module_id: Optional[str] = Query(None, description="Filter by module ID"),
    rubric_type: Optional[str] = Query(None, description="Filter by rubric type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    is_required: Optional[bool] = Query(None, description="Filter by required status"),
    sort_by: Optional[str] = Query("sequence", description="Sort field"),
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$", description="Sort order")
):
    """
    List assessment rubrics with optional search and pagination.
    
    Supports filtering by target, type, status, required status and sorting.
    """
    try:
        # Build search parameters
        search_params = None
        if any([search, lesson_id, section_id, module_id, rubric_type, status, is_required, sort_by]):
            search_params = AssessmentSearchParams(
                search=search,
                lesson_id=lesson_id,
                section_id=section_id,
                module_id=module_id,
                rubric_type=rubric_type,
                status=status,
                is_required=is_required,
                sort_by=sort_by,
                sort_order=sort_order
            )
        
        rubrics, total_count = assessment_service.list_rubrics(
            db=db,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return AssessmentRubricListResponse(
            items=rubrics,
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
            detail=f"Error listing rubrics: {str(e)}"
        )


@router.get("/stats", response_model=AssessmentStatsResponse)
async def get_assessment_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get assessment statistics.
    
    Returns counts, types, usage statistics, and other information.
    """
    try:
        stats = assessment_service.get_assessment_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting assessment stats: {str(e)}"
        )


@router.get("/rubrics/{rubric_id}", response_model=AssessmentRubricDetailResponse)
async def get_rubric(
    rubric_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get a specific assessment rubric with all criteria.
    
    Returns detailed rubric information including all criteria.
    """
    rubric = assessment_service.get_rubric_detail(db, rubric_id)
    if not rubric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rubric not found"
        )
    
    return rubric


@router.put("/rubrics/{rubric_id}", response_model=AssessmentRubricResponse)
async def update_rubric(
    rubric_id: str,
    rubric_data: AssessmentRubricUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update assessment rubric information.
    
    Allows partial updates of rubric data.
    """
    try:
        rubric = assessment_service.update_rubric(db, rubric_id, rubric_data, current_user["id"])
        if not rubric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rubric not found"
            )
        return rubric
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating rubric: {str(e)}"
        )


@router.delete("/rubrics/{rubric_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rubric(
    rubric_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete an assessment rubric and all its criteria.
    
    Permanently removes the rubric from the system.
    Requires admin privileges.
    """
    # Check admin permissions
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete rubrics"
        )
    
    try:
        success = assessment_service.delete_rubric(db, rubric_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rubric not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting rubric: {str(e)}"
        )


# Criteria endpoints
@router.post("/criteria", response_model=AssessmentCriteriaResponse, status_code=status.HTTP_201_CREATED)
async def create_criteria(
    criteria_data: AssessmentCriteriaCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Create assessment criteria for a rubric.
    
    Validates star descriptors based on rubric's total possible stars.
    """
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    try:
        criteria = assessment_service.create_criteria(db, criteria_data, current_user["id"])
        return criteria
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating criteria: {str(e)}"
        )


@router.put("/criteria/{criteria_id}", response_model=AssessmentCriteriaResponse)
async def update_criteria(
    criteria_id: str,
    criteria_data: AssessmentCriteriaUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Update assessment criteria.
    
    Allows partial updates of criteria data.
    """
    try:
        criteria = assessment_service.update_criteria(db, criteria_id, criteria_data, current_user["id"])
        if not criteria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Criteria not found"
            )
        return criteria
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating criteria: {str(e)}"
        )


@router.delete("/criteria/{criteria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_criteria(
    criteria_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Delete assessment criteria.
    
    Permanently removes the criteria from the system.
    """
    success = assessment_service.delete_criteria(db, criteria_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Criteria not found"
        )


# Advanced operations
@router.post("/rubrics/{rubric_id}/copy", response_model=AssessmentRubricResponse)
async def copy_rubric(
    rubric_id: str,
    copy_data: AssessmentRubricCopyRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Copy an assessment rubric to a new target.
    
    Creates a duplicate of the rubric with new name and optional target.
    """
    try:
        rubric = assessment_service.copy_rubric(
            db,
            rubric_id,
            copy_data,
            current_user["id"]
        )
        
        return rubric
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error copying rubric: {str(e)}"
        )


@router.post("/rubrics/bulk-create", response_model=BulkActionResponse)
async def bulk_create_rubrics(
    bulk_data: AssessmentRubricBulkCreateRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Bulk create assessment rubrics.
    
    Creates multiple rubrics at once.
    """
    try:
        result = assessment_service.bulk_create_rubrics(
            db,
            bulk_data,
            current_user["id"]
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
            detail=f"Error bulk creating rubrics: {str(e)}"
        )


@router.post("/reorder", response_model=BulkActionResponse)
async def reorder_assessments(
    reorder_data: AssessmentReorderRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Reorder assessments by updating sequence.
    
    Updates the sequence order of assessments.
    """
    try:
        result = assessment_service.reorder_assessments(
            db,
            reorder_data,
            current_user["id"]
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
            detail=f"Error reordering assessments: {str(e)}"
        )


# Student assessment endpoints
@router.get("/student-assessments/{student_id}/{rubric_id}", response_model=StudentAssessmentResponse)
async def get_student_assessment(
    student_id: str,
    rubric_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get student assessment results for a specific rubric.
    
    Returns detailed assessment scores and feedback.
    """
    try:
        assessment = assessment_service.get_student_assessment(db, student_id, rubric_id)
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        return assessment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting student assessment: {str(e)}"
        )