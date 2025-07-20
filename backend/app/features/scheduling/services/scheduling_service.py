"""
Main scheduling service for facility-centric session management.
"""

from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc

from app.features.courses.services.base_service import BaseService
from app.features.scheduling.models import (
    ScheduledSession,
    SessionParticipant,
    SessionInstructor,
    InstructorAvailability,
    FacilityScheduleSettings,
)
from app.features.scheduling.schemas.session import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionListResponse,
    SessionSearchParams,
    SessionStatsResponse,
    SessionConflictCheck,
    SessionConflictResponse,
)
from app.features.common.models.enums import (
    SessionStatus,
    ParticipantStatus,
    RecurringPattern,
)
from .notification_service import SchedulingNotificationService


class SchedulingService(BaseService[ScheduledSession, SessionCreate, SessionUpdate]):
    """
    Main scheduling service handling facility-centric session management.
    
    Implements all original requirements:
    - Facility-specific scheduling
    - Session CRUD operations
    - Participant management (add/remove)
    - Instructor assignment (add/remove)
    - Time management (single/recurring changes)
    - Bulk cancellation operations
    - Conflict detection
    - Notification system integration
    """
    
    def __init__(self):
        super().__init__(ScheduledSession)
        self.notification_service = SchedulingNotificationService()
    
    def create_session(
        self,
        db: Session,
        session_data: SessionCreate,
        program_context: str,
        created_by: Optional[str] = None
    ) -> SessionResponse:
        """
        Create a new scheduled session.
        
        Implements original requirement: "Create a new schedule"
        """
        # Add program context
        session_dict = session_data.dict(exclude={'instructor_ids', 'student_ids'})
        session_dict['program_id'] = program_context
        
        # Check for conflicts
        conflict_check = SessionConflictCheck(
            facility_id=session_data.facility_id,
            start_time=session_data.start_time,
            end_time=session_data.end_time,
            instructor_ids=session_data.instructor_ids
        )
        conflicts = self.check_session_conflicts(db, conflict_check, program_context)
        
        if conflicts.has_conflicts:
            raise ValueError("Session conflicts detected")
        
        # Create the session
        session = self.create(db, type('obj', (), session_dict)(), created_by)
        
        # Add instructor assignments if provided
        if session_data.instructor_ids:
            self.add_instructors_to_session(
                db, session.id, session_data.instructor_ids, program_context
            )
        
        # Add student enrollments if provided
        if session_data.student_ids:
            self.add_participants_to_session(
                db, session.id, session_data.student_ids, program_context
            )
        
        # Create recurring sessions if needed
        if session_data.recurring_pattern != RecurringPattern.NONE:
            self._create_recurring_sessions(db, session, session_data.recurring_config or {})
        
        # Send creation notifications
        self.notification_service.send_session_notifications(
            db, [session.id], 'session_created', program_context,
            custom_message="A new session has been scheduled for you.",
            changed_by_user_id=created_by
        )
        
        return self._to_session_response(db, session)
    
    def get_facility_sessions(
        self,
        db: Session,
        facility_id: str,
        program_context: str,
        search_params: Optional[SessionSearchParams] = None,
        skip: int = 0,
        limit: int = 100
    ) -> SessionListResponse:
        """
        Get sessions for a specific facility.
        
        Implements original requirement: "See a list of all locations"
        and facility-specific scheduling.
        """
        query = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.facility_id == facility_id,
                ScheduledSession.program_id == program_context
            )
        )
        
        # Apply search filters
        if search_params:
            query = self._apply_session_filters(query, search_params)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        sessions = query.offset(skip).limit(limit).all()
        
        # Convert to responses
        items = [self._to_session_response(db, session) for session in sessions]
        
        return SessionListResponse(
            items=items,
            total=total,
            page=skip // limit + 1,
            per_page=limit,
            pages=(total + limit - 1) // limit
        )
    
    def update_session_time(
        self,
        db: Session,
        session_id: str,
        new_start_time: datetime,
        new_end_time: datetime,
        program_context: str,
        apply_to_all_recurring: bool = False,
        user_id: Optional[str] = None
    ) -> List[SessionResponse]:
        """
        Update session time - single or all recurring sessions.
        
        Implements original requirement: "Change time (one-time, or for all the recurring)"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        # Check for conflicts with new time
        conflict_check = SessionConflictCheck(
            facility_id=session.facility_id,
            start_time=new_start_time,
            end_time=new_end_time,
            exclude_session_id=session_id
        )
        conflicts = self.check_session_conflicts(db, conflict_check, program_context)
        
        if conflicts.has_conflicts:
            raise ValueError("Time change would create conflicts")
        
        updated_sessions = []
        
        if apply_to_all_recurring and session.is_recurring:
            # Update all recurring sessions
            recurring_sessions = self._get_recurring_sessions(db, session, program_context)
            for recurring_session in recurring_sessions:
                time_diff = new_start_time - session.start_time
                recurring_session.start_time += time_diff
                recurring_session.end_time += time_diff
                updated_sessions.append(self._to_session_response(db, recurring_session))
        else:
            # Update only this session
            session.start_time = new_start_time
            session.end_time = new_end_time
            updated_sessions.append(self._to_session_response(db, session))
        
        db.commit()
        
        # Send notifications
        self.notification_service.send_session_notifications(
            db, [s.id for s in updated_sessions], 'time_changed', program_context,
            custom_message="Session time has been updated. Please check your calendar.",
            changed_by_user_id=user_id
        )
        
        return updated_sessions
    
    def cancel_session(
        self,
        db: Session,
        session_id: str,
        program_context: str,
        reason: str,
        cancel_all_recurring: bool = False,
        user_id: Optional[str] = None
    ) -> List[SessionResponse]:
        """
        Cancel session - single or all recurring sessions.
        
        Implements original requirement: "Cancel schedule (one-time, or for all the recurring)"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        cancelled_sessions = []
        
        if cancel_all_recurring and session.is_recurring:
            # Cancel all recurring sessions
            recurring_sessions = self._get_recurring_sessions(db, session, program_context)
            for recurring_session in recurring_sessions:
                if recurring_session.status != SessionStatus.CANCELLED:
                    self._cancel_single_session(recurring_session, reason, user_id)
                    cancelled_sessions.append(self._to_session_response(db, recurring_session))
        else:
            # Cancel only this session
            self._cancel_single_session(session, reason, user_id)
            cancelled_sessions.append(self._to_session_response(db, session))
        
        db.commit()
        
        # Send notifications
        self.notification_service.send_session_notifications(
            db, [s.id for s in cancelled_sessions], 'session_cancelled', program_context,
            custom_message=f"Session cancelled. Reason: {reason}",
            changed_by_user_id=user_id
        )
        
        return cancelled_sessions
    
    def cancel_all_sessions_for_day(
        self,
        db: Session,
        facility_id: str,
        date: datetime,
        program_context: str,
        reason: str,
        user_id: Optional[str] = None
    ) -> List[SessionResponse]:
        """
        Cancel all uncompleted sessions for a specific day.
        
        Implements original requirement: "Cancel all uncompleted schedules for the day (input reason)"
        """
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        sessions_to_cancel = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.facility_id == facility_id,
                ScheduledSession.program_id == program_context,
                ScheduledSession.start_time >= start_of_day,
                ScheduledSession.start_time < end_of_day,
                ScheduledSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS])
            )
        ).all()
        
        cancelled_sessions = []
        for session in sessions_to_cancel:
            self._cancel_single_session(session, f"Bulk cancellation: {reason}", user_id)
            cancelled_sessions.append(self._to_session_response(db, session))
        
        db.commit()
        
        # Send notifications
        self.notification_service.send_session_notifications(
            db, [s.id for s in cancelled_sessions], 'bulk_cancelled', program_context,
            custom_message=f"All sessions for this day have been cancelled. Reason: {reason}",
            changed_by_user_id=user_id
        )
        
        return cancelled_sessions
    
    def add_participants_to_session(
        self,
        db: Session,
        session_id: str,
        student_ids: List[str],
        program_context: str,
        user_id: Optional[str] = None
    ) -> List[str]:
        """
        Add participants to a session.
        
        Implements original requirement: "Add/Remove participants"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        added_participants = []
        for student_id in student_ids:
            # Check if already enrolled
            existing = db.query(SessionParticipant).filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.student_id == student_id
                )
            ).first()
            
            if existing:
                continue
            
            # Determine enrollment status based on capacity
            enrollment_status = ParticipantStatus.ENROLLED
            if session.is_full:
                enrollment_status = ParticipantStatus.WAITLISTED
            
            participant = SessionParticipant(
                session_id=session_id,
                student_id=student_id,
                enrollment_status=enrollment_status,
                enrolled_by_user_id=user_id
            )
            
            db.add(participant)
            added_participants.append(student_id)
        
        db.commit()
        
        # Send notifications
        self.notification_service.send_participant_notifications(
            db, session_id, added_participants, 'participants_added', program_context,
            custom_message="You have been enrolled in this session."
        )
        
        return added_participants
    
    def remove_participants_from_session(
        self,
        db: Session,
        session_id: str,
        student_ids: List[str],
        program_context: str,
        reason: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[str]:
        """
        Remove participants from a session.
        
        Implements original requirement: "Add/Remove participants"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        removed_participants = []
        for student_id in student_ids:
            participant = db.query(SessionParticipant).filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.student_id == student_id
                )
            ).first()
            
            if participant:
                participant.cancel_participation(reason, user_id)
                removed_participants.append(student_id)
        
        db.commit()
        
        # Promote waitlisted participants if spots available
        self._promote_waitlisted_participants(db, session_id)
        
        # Send notifications
        self.notification_service.send_participant_notifications(
            db, session_id, removed_participants, 'participants_removed', program_context,
            custom_message="You have been removed from this session."
        )
        
        return removed_participants
    
    def add_instructors_to_session(
        self,
        db: Session,
        session_id: str,
        instructor_ids: List[str],
        program_context: str,
        user_id: Optional[str] = None
    ) -> List[str]:
        """
        Add instructors to a session.
        
        Implements original requirement: "Add/remove tutor(s)"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        added_instructors = []
        for i, instructor_id in enumerate(instructor_ids):
            # Check availability
            if not self._check_instructor_availability(db, instructor_id, session, program_context):
                continue
            
            # Check if already assigned
            existing = db.query(SessionInstructor).filter(
                and_(
                    SessionInstructor.session_id == session_id,
                    SessionInstructor.instructor_id == instructor_id,
                    SessionInstructor.removed_at.is_(None)
                )
            ).first()
            
            if existing:
                continue
            
            assignment = SessionInstructor(
                session_id=session_id,
                instructor_id=instructor_id,
                is_primary=(i == 0),  # First instructor is primary
                assigned_by_user_id=user_id
            )
            
            db.add(assignment)
            added_instructors.append(instructor_id)
        
        db.commit()
        
        # Send notifications
        self.notification_service.send_instructor_notifications(
            db, session_id, added_instructors, 'instructors_added', program_context,
            custom_message="You have been assigned to this session."
        )
        
        return added_instructors
    
    def remove_instructors_from_session(
        self,
        db: Session,
        session_id: str,
        instructor_ids: List[str],
        program_context: str,
        reason: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[str]:
        """
        Remove instructors from a session.
        
        Implements original requirement: "Add/remove tutor(s)"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        removed_instructors = []
        for instructor_id in instructor_ids:
            assignment = db.query(SessionInstructor).filter(
                and_(
                    SessionInstructor.session_id == session_id,
                    SessionInstructor.instructor_id == instructor_id,
                    SessionInstructor.removed_at.is_(None)
                )
            ).first()
            
            if assignment:
                assignment.remove_assignment(reason, user_id)
                removed_instructors.append(instructor_id)
        
        db.commit()
        
        # Send notifications
        self.notification_service.send_instructor_notifications(
            db, session_id, removed_instructors, 'instructors_removed', program_context,
            custom_message="You have been removed from this session."
        )
        
        return removed_instructors
    
    def check_session_conflicts(
        self,
        db: Session,
        conflict_check: SessionConflictCheck,
        program_context: str
    ) -> SessionConflictResponse:
        """
        Check for session conflicts (facility and instructor).
        
        Implements conflict detection for scheduling system.
        """
        facility_conflicts = []
        instructor_conflicts = {}
        
        # Check facility conflicts
        facility_sessions = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.facility_id == conflict_check.facility_id,
                ScheduledSession.program_id == program_context,
                ScheduledSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]),
                ScheduledSession.start_time < conflict_check.end_time,
                ScheduledSession.end_time > conflict_check.start_time
            )
        )
        
        if conflict_check.exclude_session_id:
            facility_sessions = facility_sessions.filter(
                ScheduledSession.id != conflict_check.exclude_session_id
            )
        
        facility_conflicts = [
            self._to_session_response(db, session) 
            for session in facility_sessions.all()
        ]
        
        # Check instructor conflicts
        if conflict_check.instructor_ids:
            for instructor_id in conflict_check.instructor_ids:
                instructor_sessions = db.query(ScheduledSession).join(
                    SessionInstructor
                ).filter(
                    and_(
                        SessionInstructor.instructor_id == instructor_id,
                        SessionInstructor.removed_at.is_(None),
                        ScheduledSession.program_id == program_context,
                        ScheduledSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]),
                        ScheduledSession.start_time < conflict_check.end_time,
                        ScheduledSession.end_time > conflict_check.start_time
                    )
                )
                
                if conflict_check.exclude_session_id:
                    instructor_sessions = instructor_sessions.filter(
                        ScheduledSession.id != conflict_check.exclude_session_id
                    )
                
                conflicts = [
                    self._to_session_response(db, session)
                    for session in instructor_sessions.all()
                ]
                
                if conflicts:
                    instructor_conflicts[instructor_id] = conflicts
        
        has_conflicts = bool(facility_conflicts or instructor_conflicts)
        
        return SessionConflictResponse(
            has_conflicts=has_conflicts,
            facility_conflicts=facility_conflicts,
            instructor_conflicts=instructor_conflicts,
            suggested_times=self._generate_suggested_times(db, conflict_check, program_context) if has_conflicts else []
        )
    
    def get_session_participants(
        self,
        db: Session,
        session_id: str,
        program_context: str
    ) -> List[SessionParticipant]:
        """
        Get list of students signed up for a session.
        
        Implements original requirement: "See list of students signed up for the schedule"
        """
        session = self._get_session_with_program_check(db, session_id, program_context)
        
        return db.query(SessionParticipant).filter(
            SessionParticipant.session_id == session_id
        ).all()
    
    # Private helper methods
    
    def _get_session_with_program_check(
        self,
        db: Session,
        session_id: str,
        program_context: str
    ) -> ScheduledSession:
        """Get session with program context validation."""
        session = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.id == session_id,
                ScheduledSession.program_id == program_context
            )
        ).first()
        
        if not session:
            raise ValueError("Session not found or access denied")
        
        return session
    
    def _cancel_single_session(
        self,
        session: ScheduledSession,
        reason: str,
        user_id: Optional[str]
    ) -> None:
        """Cancel a single session."""
        session.status = SessionStatus.CANCELLED
        session.cancellation_reason = reason
        session.cancelled_by_user_id = user_id
        session.cancelled_at = datetime.utcnow()
    
    def _promote_waitlisted_participants(self, db: Session, session_id: str) -> None:
        """
        Promote waitlisted participants when spots become available.
        """
        session = db.query(ScheduledSession).get(session_id)
        if not session or session.is_full:
            return
        
        # Get waitlisted participants in order
        waitlisted = db.query(SessionParticipant).filter(
            and_(
                SessionParticipant.session_id == session_id,
                SessionParticipant.enrollment_status == ParticipantStatus.WAITLISTED
            )
        ).order_by(SessionParticipant.waitlist_position).all()
        
        available_spots = session.available_spots
        promoted_participants = []
        
        for participant in waitlisted[:available_spots]:
            participant.enrollment_status = ParticipantStatus.ENROLLED
            participant.waitlist_position = None
            promoted_participants.append(participant.student_id)
        
        if promoted_participants:
            # Send promotion notifications
            self.notification_service.send_participant_notifications(
                db, session_id, promoted_participants, 'waitlist_promoted', session.program_id,
                custom_message="You have been promoted from the waitlist and are now enrolled!"
            )
        
        db.commit()
    
    def _to_session_response(self, db: Session, session: ScheduledSession) -> SessionResponse:
        """Convert session model to response schema."""
        # Get participant counts
        participants = db.query(SessionParticipant).filter(
            SessionParticipant.session_id == session.id
        ).all()
        
        enrolled_count = len([p for p in participants if p.is_enrolled])
        waitlist_count = len([p for p in participants if p.is_waitlisted])
        
        # Get instructor names
        instructor_assignments = db.query(SessionInstructor).filter(
            and_(
                SessionInstructor.session_id == session.id,
                SessionInstructor.removed_at.is_(None)
            )
        ).all()
        instructor_names = [assignment.instructor.full_name for assignment in instructor_assignments]
        
        return SessionResponse(
            id=session.id,
            program_id=session.program_id,
            facility_id=session.facility_id,
            course_id=session.course_id,
            title=session.title,
            description=session.description,
            session_type=session.session_type,
            start_time=session.start_time,
            end_time=session.end_time,
            recurring_pattern=session.recurring_pattern,
            recurring_config=session.recurring_config,
            recurring_exceptions=session.recurring_exceptions,
            recurring_parent_id=session.recurring_parent_id,
            is_recurring=session.is_recurring,
            status=session.status,
            max_participants=session.max_participants,
            student_type=session.student_type,
            skill_level=session.skill_level,
            special_requirements=session.special_requirements,
            notes=session.notes,
            enrolled_count=enrolled_count,
            waitlist_count=waitlist_count,
            available_spots=session.available_spots,
            is_full=session.is_full,
            notification_sent=session.notification_sent,
            last_notification_time=session.last_notification_time,
            cancellation_reason=session.cancellation_reason,
            cancelled_by_user_id=session.cancelled_by_user_id,
            cancelled_at=session.cancelled_at,
            duration_minutes=session.duration_minutes,
            instructor_names=instructor_names,
            created_at=session.created_at,
            updated_at=session.updated_at,
        )
    
    def _create_recurring_sessions(
        self, 
        db: Session, 
        parent_session: ScheduledSession, 
        config: Dict[str, Any]
    ) -> List[ScheduledSession]:
        """Create recurring sessions based on configuration."""
        from datetime import timedelta
        
        created_sessions = []
        
        # Get configuration parameters
        end_date = config.get('end_date')
        max_occurrences = config.get('max_occurrences', 52)  # Default to 1 year weekly
        interval = config.get('interval', 1)
        
        if not end_date:
            # Default to 6 months from start date
            end_date = parent_session.start_time + timedelta(days=180)
        
        current_date = parent_session.start_time
        occurrence_count = 0
        
        while current_date <= end_date and occurrence_count < max_occurrences:
            # Calculate next occurrence based on pattern
            if parent_session.recurring_pattern == RecurringPattern.DAILY:
                current_date += timedelta(days=interval)
            elif parent_session.recurring_pattern == RecurringPattern.WEEKLY:
                current_date += timedelta(weeks=interval)
            elif parent_session.recurring_pattern == RecurringPattern.MONTHLY:
                current_date += timedelta(days=30 * interval)  # Simplified monthly
            else:
                break
            
            if current_date > end_date:
                break
            
            # Create recurring session
            duration = parent_session.end_time - parent_session.start_time
            recurring_session = ScheduledSession(
                program_id=parent_session.program_id,
                facility_id=parent_session.facility_id,
                course_id=parent_session.course_id,
                title=parent_session.title,
                description=parent_session.description,
                session_type=parent_session.session_type,
                start_time=current_date,
                end_time=current_date + duration,
                recurring_pattern=parent_session.recurring_pattern,
                recurring_config=parent_session.recurring_config,
                recurring_parent_id=parent_session.id,
                is_recurring=True,
                max_participants=parent_session.max_participants,
                student_type=parent_session.student_type,
                skill_level=parent_session.skill_level,
                special_requirements=parent_session.special_requirements,
                notes=parent_session.notes,
                created_by_user_id=parent_session.created_by_user_id
            )
            
            db.add(recurring_session)
            created_sessions.append(recurring_session)
            occurrence_count += 1
        
        return created_sessions
    
    def _get_recurring_sessions(
        self, 
        db: Session, 
        session: ScheduledSession, 
        program_context: str
    ) -> List[ScheduledSession]:
        """Get all sessions in a recurring series."""
        if session.recurring_parent_id:
            # This is a child session, get all siblings
            parent_id = session.recurring_parent_id
        else:
            # This is the parent session
            parent_id = session.id
        
        return db.query(ScheduledSession).filter(
            and_(
                or_(
                    ScheduledSession.id == parent_id,
                    ScheduledSession.recurring_parent_id == parent_id
                ),
                ScheduledSession.program_id == program_context
            )
        ).all()
    
    def _check_instructor_availability(
        self, 
        db: Session, 
        instructor_id: str, 
        session: ScheduledSession, 
        program_context: str
    ) -> bool:
        """Check if instructor is available for the session time."""
        # Check for conflicting sessions
        conflicting_sessions = db.query(ScheduledSession).join(
            SessionInstructor
        ).filter(
            and_(
                SessionInstructor.instructor_id == instructor_id,
                SessionInstructor.removed_at.is_(None),
                ScheduledSession.program_id == program_context,
                ScheduledSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]),
                ScheduledSession.start_time < session.end_time,
                ScheduledSession.end_time > session.start_time,
                ScheduledSession.id != session.id
            )
        ).first()
        
        return conflicting_sessions is None
    
    def _apply_session_filters(
        self, 
        query, 
        search_params: SessionSearchParams
    ):
        """Apply search filters to session query."""
        if search_params.search:
            search_term = f"%{search_params.search}%"
            query = query.filter(
                or_(
                    ScheduledSession.title.ilike(search_term),
                    ScheduledSession.description.ilike(search_term)
                )
            )
        
        if search_params.session_type:
            query = query.filter(ScheduledSession.session_type == search_params.session_type)
        
        if search_params.status:
            query = query.filter(ScheduledSession.status == search_params.status)
        
        if search_params.start_date:
            query = query.filter(ScheduledSession.start_time >= search_params.start_date)
        
        if search_params.end_date:
            query = query.filter(ScheduledSession.start_time <= search_params.end_date)
        
        if search_params.instructor_id:
            query = query.join(SessionInstructor).filter(
                and_(
                    SessionInstructor.instructor_id == search_params.instructor_id,
                    SessionInstructor.removed_at.is_(None)
                )
            )
        
        return query.order_by(desc(ScheduledSession.start_time))
    
    def _generate_suggested_times(
        self, 
        db: Session, 
        conflict_check: SessionConflictCheck, 
        program_context: str
    ) -> List[Dict[str, Any]]:
        """Generate suggested alternative times when conflicts exist."""
        suggestions = []
        
        # Simple implementation: suggest next available hours
        base_time = conflict_check.start_time
        duration = conflict_check.end_time - conflict_check.start_time
        
        for hours_offset in [1, 2, 3, 24, 48]:  # 1-3 hours later, next day, day after
            suggested_start = base_time + timedelta(hours=hours_offset)
            suggested_end = suggested_start + duration
            
            # Check if this time has conflicts
            test_conflict = SessionConflictCheck(
                facility_id=conflict_check.facility_id,
                start_time=suggested_start,
                end_time=suggested_end,
                instructor_ids=conflict_check.instructor_ids,
                exclude_session_id=conflict_check.exclude_session_id
            )
            
            conflicts = self.check_session_conflicts(db, test_conflict, program_context)
            
            if not conflicts.has_conflicts:
                suggestions.append({
                    'start_time': suggested_start,
                    'end_time': suggested_end,
                    'reason': f'Available {hours_offset} hour(s) later'
                })
            
            # Limit suggestions
            if len(suggestions) >= 3:
                break
        
        return suggestions