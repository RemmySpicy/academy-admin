"""
Team management API routes.
"""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.features.authentication.routes.auth import get_current_active_user
from app.features.common.models.database import get_db
from app.middleware import create_program_filter_dependency
from app.features.teams.services.team_service import team_service
from app.features.teams.schemas.team_schemas import (
    TeamMemberResponse,
    TeamMemberListResponse,
    AvailableUserResponse,
    AvailableUserListResponse,
    TeamStatsResponse,
    AddTeamMemberRequest,
    UpdateTeamMemberRequest,
    TeamSearchParams
)

router = APIRouter()

# Create program filter dependency with authentication integration
get_program_filter = create_program_filter_dependency(get_current_active_user)


@router.get("/members", response_model=TeamMemberListResponse)
async def list_team_members(
    current_user: Annotated[object, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: Optional[str] = Query("full_name", description="Sort field"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Sort order")
):
    """
    List team members for the current program.
    
    Returns paginated list of users assigned to the current program context.
    """
    try:
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required"
            )
        
        # Build search parameters
        search_params = TeamSearchParams(
            search=search,
            role=role,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Get team members
        team_members, total_count = team_service.get_team_members(
            db=db,
            program_context=program_context,
            search_params=search_params,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return TeamMemberListResponse(
            items=team_members,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing team members: {str(e)}"
        )


@router.post("/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    request: AddTeamMemberRequest,
    current_user: Annotated[object, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Add a user to the program team.
    
    Assigns a user to the current program with the specified role.
    """
    try:
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required"
            )
        
        team_member = team_service.add_team_member(
            db=db,
            user_id=request.user_id,
            program_id=program_context,
            role=request.role,
            is_default_program=request.is_default_program,
            assigned_by=current_user.id
        )
        
        return team_member
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding team member: {str(e)}"
        )


@router.put("/members/{user_id}", response_model=TeamMemberResponse)
async def update_team_member(
    user_id: str,
    request: UpdateTeamMemberRequest,
    current_user: Annotated[object, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Update a team member's role or settings.
    
    Updates the role or program assignment settings for a team member.
    """
    try:
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required"
            )
        
        team_member = team_service.update_team_member(
            db=db,
            user_id=user_id,
            program_id=program_context,
            role=request.role,
            is_default_program=request.is_default_program,
            updated_by=current_user.id
        )
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found in this program"
            )
        
        return team_member
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating team member: {str(e)}"
        )


@router.delete("/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    user_id: str,
    current_user: Annotated[object, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Remove a user from the program team.
    
    Removes the user's assignment to the current program.
    """
    try:
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required"
            )
        
        success = team_service.remove_team_member(
            db=db,
            user_id=user_id,
            program_id=program_context
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found in this program"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing team member: {str(e)}"
        )


@router.get("/available-users", response_model=AvailableUserListResponse)
async def list_available_users(
    current_user: Annotated[object, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)],
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query")
):
    """
    List users available to be added to the team.
    
    Returns users who are not currently assigned to the program.
    """
    try:
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required"
            )
        
        available_users, total_count = team_service.get_available_users(
            db=db,
            program_context=program_context,
            search=search,
            page=page,
            per_page=per_page
        )
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        return AvailableUserListResponse(
            items=available_users,
            total=total_count,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing available users: {str(e)}"
        )


@router.get("/stats", response_model=TeamStatsResponse)
async def get_team_stats(
    current_user: Annotated[object, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
    program_context: Annotated[Optional[str], Depends(get_program_filter)]
):
    """
    Get team statistics for the current program.
    
    Returns counts, role distribution, and recent activity.
    """
    try:
        if not program_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program context is required"
            )
        
        stats = team_service.get_team_stats(
            db=db,
            program_context=program_context
        )
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting team stats: {str(e)}"
        )