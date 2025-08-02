"""
API routes for scheduling system integration with courses and facilities.
"""

from datetime import date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.features.common.models.database import get_db
from app.features.authentication.routes.auth import get_current_active_user
from app.middleware import create_program_filter_dependency
from app.features.scheduling.services.integration_service import SchedulingIntegrationService


# Pydantic models for request/response
class SessionTemplate(BaseModel):
    title: str
    description: Optional[str] = None
    session_type: str = "group_lesson"
    start_time: str  # ISO format datetime
    end_time: str    # ISO format datetime
    max_participants: Optional[int] = None
    student_type: Optional[str] = None
    skill_level: Optional[str] = None
    special_requirements: Optional[str] = None
    notes: Optional[str] = None
    recurring_pattern: str = "none"
    recurring_config: Optional[Dict[str, Any]] = None


class CreateSessionsFromCourseRequest(BaseModel):
    course_id: str
    facility_id: str
    session_templates: List[SessionTemplate]
    auto_enroll_students: bool = True


class SyncCourseEnrollmentRequest(BaseModel):
    course_id: str
    auto_enroll: bool = True
    auto_remove: bool = False


# Router setup
router = APIRouter(prefix="/integration", tags=["Scheduling Integration"])

# Create program filter dependency with authentication integration
get_program_filter = create_program_filter_dependency(get_current_active_user)


@router.post("/courses/create-sessions")
async def create_sessions_from_course(
    request: CreateSessionsFromCourseRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_filter)
):
    """
    Create scheduled sessions for a course and optionally auto-enroll students.
    
    This endpoint allows you to:
    - Create multiple sessions for a course at once
    - Automatically enroll students from course enrollments
    - Set up recurring sessions with templates
    """
    try:
        service = SchedulingIntegrationService()
        
        # Convert session templates to dictionaries
        session_templates = []
        for template in request.session_templates:
            template_dict = template.dict()
            # Convert datetime strings to datetime objects
            from datetime import datetime
            template_dict['start_time'] = datetime.fromisoformat(template.start_time.replace('Z', '+00:00'))
            template_dict['end_time'] = datetime.fromisoformat(template.end_time.replace('Z', '+00:00'))
            session_templates.append(template_dict)
        
        sessions = service.create_sessions_from_course_enrollment(
            db=db,
            course_id=request.course_id,
            facility_id=request.facility_id,
            program_context=program_context,
            session_templates=session_templates,
            auto_enroll_students=request.auto_enroll_students,
            created_by=current_user.id
        )
        
        return {
            "success": True,
            "message": f"Created {len(sessions)} sessions for course",
            "sessions_created": len(sessions),
            "session_ids": [session.id for session in sessions]
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create sessions: {str(e)}")


@router.get("/students/{student_id}/schedule")
async def get_student_comprehensive_schedule(
    student_id: str,
    start_date: Optional[date] = Query(None, description="Start date for schedule (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for schedule (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_filter)
):
    """
    Get comprehensive student schedule including sessions and course enrollments.
    
    Returns:
    - Student's course enrollments
    - Scheduled sessions (upcoming and completed)
    - Attendance and progress statistics
    - Next upcoming session
    """
    try:
        service = SchedulingIntegrationService()
        
        schedule_data = service.get_student_schedule_from_enrollments(
            db=db,
            student_id=student_id,
            program_context=program_context,
            start_date=start_date,
            end_date=end_date
        )
        
        return schedule_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get student schedule: {str(e)}")


@router.get("/facilities/{facility_id}/utilization")
async def get_facility_utilization_report(
    facility_id: str,
    start_date: date = Query(..., description="Start date for report (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date for report (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_filter)
):
    """
    Generate facility utilization report for a date range.
    
    Returns:
    - Session counts and types
    - Participant statistics
    - Capacity utilization metrics
    - Daily breakdown of usage
    """
    try:
        service = SchedulingIntegrationService()
        
        report = service.get_facility_utilization_report(
            db=db,
            facility_id=facility_id,
            program_context=program_context,
            start_date=start_date,
            end_date=end_date
        )
        
        return report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate utilization report: {str(e)}")


@router.post("/courses/sync-enrollments")
async def sync_course_enrollment_with_sessions(
    request: SyncCourseEnrollmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_filter)
):
    """
    Synchronize course enrollments with existing session participants.
    
    This endpoint:
    - Automatically enrolls new course students in sessions (if auto_enroll=True)
    - Removes students from sessions who are no longer enrolled in course (if auto_remove=True)
    - Updates all sessions associated with the course
    """
    try:
        service = SchedulingIntegrationService()
        
        sync_results = service.sync_course_enrollment_with_sessions(
            db=db,
            course_id=request.course_id,
            program_context=program_context,
            auto_enroll=request.auto_enroll,
            auto_remove=request.auto_remove
        )
        
        return {
            "success": True,
            "message": "Course enrollment synchronization completed",
            "results": sync_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync enrollments: {str(e)}")


@router.get("/courses/{course_id}/sessions")
async def get_course_sessions(
    course_id: str,
    include_completed: bool = Query(False, description="Include completed sessions"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_filter)
):
    """Get all sessions associated with a specific course."""
    try:
        from app.features.scheduling.models import ScheduledSession
        from app.features.common.models.enums import SessionStatus
        from sqlalchemy import and_
        
        query = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.course_id == course_id,
                ScheduledSession.program_id == program_context
            )
        )
        
        if not include_completed:
            query = query.filter(
                ScheduledSession.status.in_([
                    SessionStatus.SCHEDULED, 
                    SessionStatus.IN_PROGRESS
                ])
            )
        
        sessions = query.order_by(ScheduledSession.start_time).all()
        
        # Convert to response format
        service = SchedulingIntegrationService()
        session_data = []
        
        for session in sessions:
            session_dict = {
                'id': session.id,
                'title': session.title,
                'description': session.description,
                'session_type': session.session_type.value,
                'start_time': session.start_time,
                'end_time': session.end_time,
                'status': session.status.value,
                'facility_name': session.facility.name if session.facility else None,
                'enrolled_count': session.enrolled_count,
                'max_participants': session.max_participants,
                'is_recurring': session.is_recurring,
                'created_at': session.created_at
            }
            session_data.append(session_dict)
        
        return {
            'course_id': course_id,
            'total_sessions': len(sessions),
            'sessions': session_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get course sessions: {str(e)}")


@router.get("/stats/overview")
async def get_scheduling_integration_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    program_context: str = Depends(get_program_filter)
):
    """Get overview statistics for scheduling integration."""
    try:
        from app.features.scheduling.models import ScheduledSession
        from app.features.enrollments.models.course_enrollment import CourseEnrollment
        from app.features.common.models.enums import SessionStatus, EnrollmentStatus
        from sqlalchemy import and_, func
        
        # Get scheduling statistics
        total_sessions = db.query(func.count(ScheduledSession.id)).filter(
            ScheduledSession.program_id == program_context
        ).scalar()
        
        active_sessions = db.query(func.count(ScheduledSession.id)).filter(
            and_(
                ScheduledSession.program_id == program_context,
                ScheduledSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS])
            )
        ).scalar()
        
        sessions_with_courses = db.query(func.count(ScheduledSession.id)).filter(
            and_(
                ScheduledSession.program_id == program_context,
                ScheduledSession.course_id.isnot(None)
            )
        ).scalar()
        
        # Get enrollment statistics
        total_enrollments = db.query(func.count(CourseEnrollment.id)).filter(
            CourseEnrollment.program_id == program_context
        ).scalar()
        
        active_enrollments = db.query(func.count(CourseEnrollment.id)).filter(
            and_(
                CourseEnrollment.program_id == program_context,
                CourseEnrollment.status == EnrollmentStatus.ACTIVE
            )
        ).scalar()
        
        return {
            'program_context': program_context,
            'scheduling': {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions,
                'sessions_with_courses': sessions_with_courses,
                'integration_rate': (sessions_with_courses / total_sessions * 100) if total_sessions > 0 else 0
            },
            'enrollments': {
                'total_enrollments': total_enrollments,
                'active_enrollments': active_enrollments
            },
            'integration_health': {
                'sessions_integrated': sessions_with_courses > 0,
                'enrollments_available': active_enrollments > 0,
                'ready_for_sync': sessions_with_courses > 0 and active_enrollments > 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get overview: {str(e)}")