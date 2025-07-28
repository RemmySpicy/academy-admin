"""
Unified Profile Creation Routes

API endpoints for creating complex multi-profile scenarios.
"""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.features.common.dependencies.program_context import get_program_context
from .schemas import ProfileCreationRequest, ProfileCreationResponse
from .services import get_unified_profile_service, UnifiedProfileCreationService

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create", response_model=ProfileCreationResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    request: ProfileCreationRequest,
    current_user: Annotated[dict, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
    service: UnifiedProfileCreationService = Depends(get_unified_profile_service)
):
    """
    Create a unified profile (student, parent, with relationships and organizations).
    
    This endpoint handles complex creation scenarios including:
    - Independent students with optional login credentials
    - Students linked to existing parents
    - Organization-sponsored students
    - Students with optional email/password (children vs independent)
    
    The creation_mode and organization_mode determine the specific creation flow.
    """
    try:
        # Validate user permissions
        if not current_user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )
        
        # Validate program access if needed
        program_id = request.program_id
        # TODO: Add program access validation based on user roles
        
        # Create the profile
        result = await service.create_profile(request, current_user["id"])
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error or "Profile creation failed"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_profile endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/creation-options")
async def get_creation_options(
    current_user: Annotated[dict, Depends(get_current_active_user)]
):
    """
    Get available profile creation options based on user permissions.
    
    Returns information about what creation modes and organization modes
    are available to the current user.
    """
    try:
        # For now, return all options
        # TODO: Filter based on user permissions and program assignments
        
        return {
            "success": True,
            "data": {
                "creation_modes": [
                    {
                        "value": "independent_student",
                        "label": "Independent Student",
                        "description": "Create a standalone student profile"
                    },
                    {
                        "value": "student_with_parent",
                        "label": "Student with Parent",
                        "description": "Link student to an existing parent"
                    }
                ],
                "organization_modes": [
                    {
                        "value": "individual",
                        "label": "Individual",
                        "description": "Regular student registration"
                    },
                    {
                        "value": "organization",
                        "label": "Organization Sponsored",
                        "description": "Student sponsored by partner organization"
                    }
                ],
                "required_fields": {
                    "independent_student": {
                        "email": True,
                        "password": True,
                        "salutation": "adult_options"
                    },
                    "student_with_parent": {
                        "email": False,
                        "password": False,
                        "salutation": "child_options"
                    }
                },
                "salutation_options": {
                    "adult_options": ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Chief", "Hon."],
                    "child_options": ["Master", "Miss"]
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting creation options: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving creation options: {str(e)}"
        )