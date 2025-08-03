"""
Session management API routes for scheduling system.
"""

from typing import Annotated, Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status
from sqlalchemy.orm import Session

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.middleware import create_program_filter_dependency
from app.features.scheduling.schemas.session import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionListResponse,
    SessionSearchParams,
    SessionStatsResponse,
    SessionConflictCheck,
    SessionConflictResponse,
    SessionBulkUpdateRequest,
)
from app.features.scheduling.services.scheduling_service import SchedulingService
from app.features.common.models.enums import SessionStatus


router = APIRouter()

# Create program filter dependency with authentication integration
get_program_filter = create_program_filter_dependency(get_current_active_user)

# Initialize service
scheduling_service = SchedulingService()


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: SessionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """
    Create a new scheduled session.
    
    Implements original requirement: "Create a new schedule"
    - Select the day from calendar
    - Select the time (from - to)
    - Select the Students Type (Adult, Children)
    - Select Skill Level (Beginners, Intermediate, Advance)
    - Select the instructor
    - Select the option for one-time or recurring for the day and time
    """
    try:
        session = scheduling_service.create_session(
            db=db,
            session_data=session_data,
            program_context=program_context,
            created_by=current_user["id"]
        )
        return session
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/facility/{facility_id}", response_model=SessionListResponse)
async def get_facility_sessions(
    facility_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)],
    skip: int = Query(0, ge=0, description="Number of sessions to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of sessions to return"),
    session_type: Optional[str] = Query(None, description="Filter by session type"),
    status: Optional[SessionStatus] = Query(None, description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Filter sessions starting after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter sessions starting before this date"),
    search: Optional[str] = Query(None, description="Search in title and description"),
):
    """
    Get sessions for a specific facility.
    
    Implements original requirement: "See a list of all locations"
    and facility-specific scheduling.
    """
    try:
        search_params = SessionSearchParams(
            facility_id=facility_id,
            session_type=session_type,
            status=status,
            start_date=start_date,
            end_date=end_date,
            search=search
        )
        
        sessions = scheduling_service.get_facility_sessions(
            db=db,
            facility_id=facility_id,
            program_context=program_context,
            search_params=search_params,
            skip=skip,
            limit=limit
        )
        return sessions
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """Get a specific session by ID."""
    try:
        session = scheduling_service.get(db, session_id)
        if not session or session.program_id != program_context:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
        return scheduling_service._to_session_response(db, session)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{session_id}/time", response_model=List[SessionResponse])
async def update_session_time(
    session_id: str,
    new_start_time: datetime,
    new_end_time: datetime,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)],
    apply_to_all_recurring: bool = Query(False, description="Apply time change to all recurring sessions")
):
    """
    Update session time - single or all recurring sessions.
    
    Implements original requirement: "Change time (one-time, or for all the recurring)"
    """
    try:
        updated_sessions = scheduling_service.update_session_time(
            db=db,
            session_id=session_id,
            new_start_time=new_start_time,
            new_end_time=new_end_time,
            program_context=program_context,
            apply_to_all_recurring=apply_to_all_recurring,
            user_id=current_user["id"]
        )
        return updated_sessions
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{session_id}/cancel", response_model=List[SessionResponse])
async def cancel_session(
    session_id: str,
    reason: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)],
    cancel_all_recurring: bool = Query(False, description="Cancel all recurring sessions")
):
    """
    Cancel session - single or all recurring sessions.
    
    Implements original requirement: "Cancel schedule (one-time, or for all the recurring)"
    """
    try:
        cancelled_sessions = scheduling_service.cancel_session(
            db=db,
            session_id=session_id,
            program_context=program_context,
            reason=reason,
            cancel_all_recurring=cancel_all_recurring,
            user_id=current_user["id"]
        )
        return cancelled_sessions
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/facility/{facility_id}/cancel-day", response_model=List[SessionResponse])
async def cancel_all_sessions_for_day(
    facility_id: str,
    date: datetime,
    reason: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """
    Cancel all uncompleted sessions for a specific day.
    
    Implements original requirement: "Cancel all uncompleted schedules for the day (input reason)"
    """
    try:
        cancelled_sessions = scheduling_service.cancel_all_sessions_for_day(
            db=db,
            facility_id=facility_id,
            date=date,
            program_context=program_context,
            reason=reason,
            user_id=current_user["id"]
        )
        return cancelled_sessions
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{session_id}/participants", response_model=List[str])
async def add_participants(
    session_id: str,
    student_ids: List[str],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """
    Add participants to a session.
    
    Implements original requirement: "Add/Remove participants"
    """
    try:
        added_participants = scheduling_service.add_participants_to_session(
            db=db,
            session_id=session_id,
            student_ids=student_ids,
            program_context=program_context,
            user_id=current_user["id"]
        )
        return added_participants
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{session_id}/participants", response_model=List[str])
async def remove_participants(
    session_id: str,
    student_ids: List[str],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)],
    reason: Optional[str] = Query(None, description="Reason for removal")
):
    """
    Remove participants from a session.
    
    Implements original requirement: "Add/Remove participants"
    """
    try:
        removed_participants = scheduling_service.remove_participants_from_session(
            db=db,
            session_id=session_id,
            student_ids=student_ids,
            program_context=program_context,
            reason=reason,
            user_id=current_user["id"]
        )
        return removed_participants
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{session_id}/instructors", response_model=List[str])
async def add_instructors(
    session_id: str,
    instructor_ids: List[str],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """
    Add instructors to a session.
    
    Implements original requirement: "Add/remove tutor(s)"
    """
    try:
        added_instructors = scheduling_service.add_instructors_to_session(
            db=db,
            session_id=session_id,
            instructor_ids=instructor_ids,
            program_context=program_context,
            user_id=current_user["id"]
        )
        return added_instructors
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{session_id}/instructors", response_model=List[str])
async def remove_instructors(
    session_id: str,
    instructor_ids: List[str],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)],
    reason: Optional[str] = Query(None, description="Reason for removal")
):
    """
    Remove instructors from a session.
    
    Implements original requirement: "Add/remove tutor(s)"
    """
    try:
        removed_instructors = scheduling_service.remove_instructors_from_session(
            db=db,
            session_id=session_id,
            instructor_ids=instructor_ids,
            program_context=program_context,
            reason=reason,
            user_id=current_user["id"]
        )
        return removed_instructors
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{session_id}/participants")
async def get_session_participants(
    session_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """
    Get list of students signed up for a session.
    
    Implements original requirement: "See list of students signed up for the schedule"
    """
    try:
        participants = scheduling_service.get_session_participants(
            db=db,
            session_id=session_id,
            program_context=program_context
        )
        return participants
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/check-conflicts", response_model=SessionConflictResponse)
async def check_session_conflicts(
    conflict_check: SessionConflictCheck,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    program_context: Annotated[str, Depends(get_program_filter)]
):
    """
    Check for session conflicts (facility and instructor).
    
    Implements conflict detection for scheduling system.
    """
    try:
        conflicts = scheduling_service.check_session_conflicts(
            db=db,
            conflict_check=conflict_check,
            program_context=program_context
        )
        return conflicts
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))