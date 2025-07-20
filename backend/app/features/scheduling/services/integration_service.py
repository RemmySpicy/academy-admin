"""
Integration service for connecting scheduling with existing course enrollment and facility systems.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func

from app.features.scheduling.models import ScheduledSession, SessionParticipant
from app.features.students.models.course_enrollment import CourseEnrollment
from app.features.students.models.student import Student
from app.features.facilities.models.facility import Facility
from app.features.courses.models.course import Course
from app.features.common.models.enums import EnrollmentStatus, ParticipantStatus, SessionStatus
from app.features.scheduling.services.scheduling_service import SchedulingService


class SchedulingIntegrationService:
    """
    Service for integrating scheduling system with existing course enrollments and facilities.
    
    Provides seamless integration between:
    - Scheduled sessions and course enrollments
    - Automatic participant enrollment from course enrollments
    - Facility availability and course scheduling
    - Student progress tracking across sessions and courses
    """
    
    def __init__(self):
        self.scheduling_service = SchedulingService()
    
    def create_sessions_from_course_enrollment(
        self, 
        db: Session, 
        course_id: str, 
        facility_id: str,
        program_context: str,
        session_templates: List[Dict[str, Any]],
        auto_enroll_students: bool = True,
        created_by: Optional[str] = None
    ) -> List[ScheduledSession]:
        """
        Create scheduled sessions for a course and optionally auto-enroll students.
        
        Args:
            course_id: Course to create sessions for
            facility_id: Facility where sessions will take place
            program_context: Program context for filtering
            session_templates: List of session template data
            auto_enroll_students: Whether to automatically enroll students from course enrollments
            created_by: User creating the sessions
            
        Returns:
            List of created sessions
        """
        created_sessions = []
        
        # Get course information
        course = db.query(Course).filter(
            and_(
                Course.id == course_id,
                Course.program_id == program_context
            )
        ).first()
        
        if not course:
            raise ValueError("Course not found or access denied")
        
        # Get facility information
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        if not facility:
            raise ValueError("Facility not found")
        
        # Create sessions from templates
        for template in session_templates:
            session_data = {
                'facility_id': facility_id,
                'course_id': course_id,
                'title': template.get('title', f"{course.title} - Session"),
                'description': template.get('description', f"Scheduled session for {course.title}"),
                'session_type': template.get('session_type', 'group_lesson'),
                'start_time': template['start_time'],
                'end_time': template['end_time'],
                'max_participants': template.get('max_participants', facility.capacity),
                'student_type': template.get('student_type'),
                'skill_level': template.get('skill_level'),
                'special_requirements': template.get('special_requirements'),
                'notes': template.get('notes'),
                'recurring_pattern': template.get('recurring_pattern', 'none'),
                'recurring_config': template.get('recurring_config'),
            }
            
            # Create the session
            from app.features.scheduling.schemas.session import SessionCreate
            session_create = SessionCreate(**session_data)
            session = self.scheduling_service.create_session(
                db, session_create, program_context, created_by
            )
            created_sessions.append(session)
            
            # Auto-enroll students if requested
            if auto_enroll_students:
                self._auto_enroll_students_from_course(
                    db, session.id, course_id, program_context
                )
        
        return created_sessions
    
    def _auto_enroll_students_from_course(
        self,
        db: Session,
        session_id: str,
        course_id: str,
        program_context: str
    ) -> List[str]:
        """Auto-enroll students from course enrollments into a session."""
        # Get active course enrollments
        enrollments = db.query(CourseEnrollment).filter(
            and_(
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.program_id == program_context,
                CourseEnrollment.status == EnrollmentStatus.ACTIVE
            )
        ).all()
        
        student_ids = []
        for enrollment in enrollments:
            if enrollment.student_id:
                student_ids.append(enrollment.student_id)
        
        if student_ids:
            return self.scheduling_service.add_participants_to_session(
                db, session_id, student_ids, program_context
            )
        
        return []
    
    def get_student_schedule_from_enrollments(
        self,
        db: Session,
        student_id: str,
        program_context: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive student schedule including sessions and course enrollments.
        
        Returns:
            Dictionary with sessions, enrollments, and progress information
        """
        # Get student's course enrollments
        enrollments = db.query(CourseEnrollment).filter(
            and_(
                CourseEnrollment.student_id == student_id,
                CourseEnrollment.program_id == program_context,
                CourseEnrollment.status.in_([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED])
            )
        ).all()
        
        # Get student's session participations
        query = db.query(ScheduledSession).join(SessionParticipant).filter(
            and_(
                SessionParticipant.student_id == student_id,
                ScheduledSession.program_id == program_context,
                SessionParticipant.enrollment_status.in_([
                    ParticipantStatus.ENROLLED, 
                    ParticipantStatus.WAITLISTED
                ])
            )
        )
        
        # Apply date filters if provided
        if start_date:
            query = query.filter(ScheduledSession.start_time >= start_date)
        if end_date:
            query = query.filter(ScheduledSession.start_time <= end_date)
        
        sessions = query.order_by(ScheduledSession.start_time).all()
        
        # Calculate statistics
        stats = self._calculate_student_schedule_stats(
            db, student_id, sessions, enrollments
        )
        
        return {
            'student_id': student_id,
            'enrollments': [self._enrollment_to_dict(enrollment) for enrollment in enrollments],
            'sessions': [self._session_to_dict(db, session, student_id) for session in sessions],
            'statistics': stats,
            'upcoming_sessions': [
                self._session_to_dict(db, s, student_id) for s in sessions 
                if s.start_time > datetime.now() and s.status in [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS]
            ],
            'completed_sessions': [
                self._session_to_dict(db, s, student_id) for s in sessions 
                if s.status == SessionStatus.COMPLETED
            ]
        }
    
    def get_facility_utilization_report(
        self,
        db: Session,
        facility_id: str,
        program_context: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Generate facility utilization report for a date range."""
        # Get all sessions in date range
        sessions = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.facility_id == facility_id,
                ScheduledSession.program_id == program_context,
                ScheduledSession.start_time >= start_date,
                ScheduledSession.start_time <= end_date
            )
        ).all()
        
        # Get facility information
        facility = db.query(Facility).filter(Facility.id == facility_id).first()
        
        # Calculate utilization metrics
        total_sessions = len(sessions)
        active_sessions = len([s for s in sessions if s.is_active])
        completed_sessions = len([s for s in sessions if s.is_completed])
        cancelled_sessions = len([s for s in sessions if s.is_cancelled])
        
        total_participants = sum(s.enrolled_count for s in sessions)
        total_capacity = sum(s.max_participants or 0 for s in sessions if s.max_participants)
        
        # Calculate daily breakdown
        daily_breakdown = {}
        for session in sessions:
            session_date = session.start_time.date()
            if session_date not in daily_breakdown:
                daily_breakdown[session_date] = {
                    'sessions': 0,
                    'participants': 0,
                    'capacity': 0,
                    'hours_used': 0
                }
            
            daily_breakdown[session_date]['sessions'] += 1
            daily_breakdown[session_date]['participants'] += session.enrolled_count
            daily_breakdown[session_date]['capacity'] += session.max_participants or 0
            daily_breakdown[session_date]['hours_used'] += session.duration_minutes / 60
        
        return {
            'facility': {
                'id': facility.id,
                'name': facility.name,
                'type': facility.facility_type,
                'capacity': facility.capacity
            },
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'days': (end_date - start_date).days + 1
            },
            'summary': {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions,
                'completed_sessions': completed_sessions,
                'cancelled_sessions': cancelled_sessions,
                'total_participants': total_participants,
                'average_participants_per_session': total_participants / total_sessions if total_sessions > 0 else 0,
                'capacity_utilization': (total_participants / total_capacity * 100) if total_capacity > 0 else 0
            },
            'daily_breakdown': daily_breakdown
        }
    
    def sync_course_enrollment_with_sessions(
        self,
        db: Session,
        course_id: str,
        program_context: str,
        auto_enroll: bool = True,
        auto_remove: bool = False
    ) -> Dict[str, Any]:
        """
        Synchronize course enrollments with existing session participants.
        
        Args:
            course_id: Course to synchronize
            program_context: Program context
            auto_enroll: Automatically enroll new course students in sessions
            auto_remove: Automatically remove students who are no longer enrolled in course
        """
        # Get course enrollments
        enrollments = db.query(CourseEnrollment).filter(
            and_(
                CourseEnrollment.course_id == course_id,
                CourseEnrollment.program_id == program_context,
                CourseEnrollment.status == EnrollmentStatus.ACTIVE
            )
        ).all()
        
        enrolled_student_ids = set(e.student_id for e in enrollments if e.student_id)
        
        # Get course sessions
        sessions = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.course_id == course_id,
                ScheduledSession.program_id == program_context,
                ScheduledSession.status.in_([SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS])
            )
        ).all()
        
        sync_results = {
            'enrolled_students': 0,
            'removed_students': 0,
            'sessions_updated': 0,
            'errors': []
        }
        
        for session in sessions:
            try:
                # Get current session participants
                participants = db.query(SessionParticipant).filter(
                    SessionParticipant.session_id == session.id
                ).all()
                
                current_participant_ids = set(p.student_id for p in participants if p.is_enrolled)
                
                # Find students to add
                if auto_enroll:
                    students_to_add = enrolled_student_ids - current_participant_ids
                    if students_to_add:
                        added = self.scheduling_service.add_participants_to_session(
                            db, session.id, list(students_to_add), program_context
                        )
                        sync_results['enrolled_students'] += len(added)
                
                # Find students to remove
                if auto_remove:
                    students_to_remove = current_participant_ids - enrolled_student_ids
                    if students_to_remove:
                        removed = self.scheduling_service.remove_participants_from_session(
                            db, session.id, list(students_to_remove), program_context,
                            reason="No longer enrolled in course"
                        )
                        sync_results['removed_students'] += len(removed)
                
                sync_results['sessions_updated'] += 1
                
            except Exception as e:
                sync_results['errors'].append(f"Session {session.id}: {str(e)}")
        
        return sync_results
    
    # Private helper methods
    
    def _calculate_student_schedule_stats(
        self,
        db: Session,
        student_id: str,
        sessions: List[ScheduledSession],
        enrollments: List[CourseEnrollment]
    ) -> Dict[str, Any]:
        """Calculate student schedule statistics."""
        now = datetime.now()
        
        upcoming_sessions = [s for s in sessions if s.start_time > now and s.is_active]
        completed_sessions = [s for s in sessions if s.is_completed]
        
        return {
            'total_enrollments': len(enrollments),
            'active_enrollments': len([e for e in enrollments if e.status == EnrollmentStatus.ACTIVE]),
            'total_sessions': len(sessions),
            'upcoming_sessions': len(upcoming_sessions),
            'completed_sessions': len(completed_sessions),
            'attendance_rate': self._calculate_attendance_rate(db, student_id, completed_sessions),
            'next_session': upcoming_sessions[0] if upcoming_sessions else None,
            'progress_percentage': self._calculate_overall_progress(enrollments)
        }
    
    def _calculate_attendance_rate(
        self,
        db: Session,
        student_id: str,
        completed_sessions: List[ScheduledSession]
    ) -> float:
        """Calculate student attendance rate for completed sessions."""
        if not completed_sessions:
            return 0.0
        
        attended_sessions = 0
        for session in completed_sessions:
            participant = db.query(SessionParticipant).filter(
                and_(
                    SessionParticipant.session_id == session.id,
                    SessionParticipant.student_id == student_id
                )
            ).first()
            
            if participant and participant.attendance_status == 'present':
                attended_sessions += 1
        
        return (attended_sessions / len(completed_sessions)) * 100
    
    def _calculate_overall_progress(self, enrollments: List[CourseEnrollment]) -> float:
        """Calculate overall progress across all enrollments."""
        if not enrollments:
            return 0.0
        
        total_progress = sum(e.progress_percentage or 0 for e in enrollments)
        return total_progress / len(enrollments)
    
    def _enrollment_to_dict(self, enrollment: CourseEnrollment) -> Dict[str, Any]:
        """Convert course enrollment to dictionary."""
        return {
            'id': enrollment.id,
            'course_id': enrollment.course_id,
            'course_title': enrollment.course.title if enrollment.course else None,
            'enrollment_date': enrollment.enrollment_date,
            'start_date': enrollment.start_date,
            'completion_date': enrollment.completion_date,
            'status': enrollment.status.value,
            'progress_percentage': float(enrollment.progress_percentage or 0)
        }
    
    def _session_to_dict(self, db: Session, session: ScheduledSession, student_id: str) -> Dict[str, Any]:
        """Convert session to dictionary with student-specific information."""
        # Get student's participation info
        participant = db.query(SessionParticipant).filter(
            and_(
                SessionParticipant.session_id == session.id,
                SessionParticipant.student_id == student_id
            )
        ).first()
        
        return {
            'id': session.id,
            'title': session.title,
            'description': session.description,
            'session_type': session.session_type.value,
            'start_time': session.start_time,
            'end_time': session.end_time,
            'status': session.status.value,
            'facility_name': session.facility.name if session.facility else None,
            'course_title': session.course.title if session.course else None,
            'instructor_names': [inst.instructor.full_name for inst in session.instructor_assignments if not inst.removed_at],
            'enrollment_status': participant.enrollment_status.value if participant else None,
            'attendance_status': participant.attendance_status if participant else None,
            'waitlist_position': participant.waitlist_position if participant else None
        }