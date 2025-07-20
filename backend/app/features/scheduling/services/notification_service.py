"""
Notification service for scheduling system changes.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.features.scheduling.models import (
    ScheduledSession,
    SessionParticipant,
    SessionInstructor,
)
from app.features.students.models.student import Student
from app.features.authentication.models.user import User
from app.features.authentication.models.user_relationship import UserRelationship
from app.features.common.models.enums import (
    SessionStatus,
    ParticipantStatus,
    NotificationStatus,
    RelationshipType,
    UserRole,
)


class SchedulingNotificationService:
    """
    Service for managing notifications related to scheduling changes.
    
    Implements original requirement: "(Changing this setting sends a notification to everyone participating)"
    Handles all types of schedule change notifications including:
    - Session creation
    - Session time changes
    - Session cancellations
    - Participant additions/removals
    - Instructor assignments/removals
    """
    
    def __init__(self):
        self.notification_types = {
            'session_created': 'New session scheduled',
            'session_updated': 'Session details updated',
            'time_changed': 'Session time changed',
            'session_cancelled': 'Session cancelled',
            'participants_added': 'New participants added',
            'participants_removed': 'Participants removed',
            'instructors_added': 'Instructors assigned',
            'instructors_removed': 'Instructors removed',
            'bulk_cancelled': 'Multiple sessions cancelled',
            'session_reminder': 'Session reminder',
            'waitlist_promoted': 'Promoted from waitlist',
        }
    
    def send_session_notifications(
        self,
        db: Session,
        session_ids: List[str],
        notification_type: str,
        program_context: str,
        custom_message: Optional[str] = None,
        changed_by_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send notifications for session changes.
        
        Args:
            session_ids: List of session IDs affected
            notification_type: Type of notification (from self.notification_types)
            program_context: Program context for filtering
            custom_message: Optional custom message
            changed_by_user_id: User who made the change
        
        Returns:
            Dictionary with notification results
        """
        results = {
            'notifications_sent': 0,
            'notifications_failed': 0,
            'recipients': [],
            'errors': []
        }
        
        for session_id in session_ids:
            try:
                session = self._get_session_with_program_check(db, session_id, program_context)
                if not session:
                    continue
                
                # Get all participants and instructors for the session
                recipients = self._get_session_recipients(db, session)
                
                # Create notification content
                notification_content = self._create_notification_content(
                    session, notification_type, custom_message
                )
                
                # Send notifications to each recipient
                for recipient in recipients:
                    try:
                        self._send_individual_notification(
                            recipient, notification_content, notification_type
                        )
                        results['notifications_sent'] += 1
                    except Exception as e:
                        results['notifications_failed'] += 1
                        results['errors'].append(f"Failed to notify {recipient['email']}: {str(e)}")
                
                results['recipients'].extend(recipients)
                
                # Update session notification tracking
                session.notification_sent = True
                session.last_notification_time = datetime.utcnow()
                
            except Exception as e:
                results['notifications_failed'] += 1
                results['errors'].append(f"Failed to process session {session_id}: {str(e)}")
        
        db.commit()
        return results
    
    def send_participant_notifications(
        self,
        db: Session,
        session_id: str,
        student_ids: List[str],
        notification_type: str,
        program_context: str,
        custom_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send notifications specific to participant changes.
        
        Args:
            session_id: Session ID
            student_ids: List of affected student IDs
            notification_type: Type of notification
            program_context: Program context
            custom_message: Optional custom message
        """
        results = {
            'notifications_sent': 0,
            'notifications_failed': 0,
            'recipients': [],
            'errors': []
        }
        
        try:
            session = self._get_session_with_program_check(db, session_id, program_context)
            if not session:
                results['errors'].append(f"Session {session_id} not found")
                return results
            
            # Get participants for specific students
            participants = db.query(SessionParticipant).filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.student_id.in_(student_ids)
                )
            ).all()
            
            for participant in participants:
                try:
                    # Get student and parent information
                    student_info = self._get_student_info(db, participant.student_id)
                    if not student_info:
                        continue
                    
                    # Create notification content
                    notification_content = self._create_participant_notification_content(
                        session, participant, notification_type, custom_message
                    )
                    
                    # Send to student (if email available)
                    if student_info.get('email'):
                        self._send_individual_notification(
                            student_info, notification_content, notification_type
                        )
                        results['notifications_sent'] += 1
                    
                    # Send to parents
                    parents = self._get_student_parents(db, participant.student_id)
                    for parent in parents:
                        self._send_individual_notification(
                            parent, notification_content, notification_type
                        )
                        results['notifications_sent'] += 1
                    
                    results['recipients'].extend([student_info] + parents)
                    
                    # Update participant notification tracking
                    participant.parent_notification_sent = True
                    participant.parent_notification_time = datetime.utcnow()
                    
                except Exception as e:
                    results['notifications_failed'] += 1
                    results['errors'].append(f"Failed to notify participant {participant.student_id}: {str(e)}")
            
            db.commit()
            
        except Exception as e:
            results['errors'].append(f"Failed to process participant notifications: {str(e)}")
        
        return results
    
    def send_instructor_notifications(
        self,
        db: Session,
        session_id: str,
        instructor_ids: List[str],
        notification_type: str,
        program_context: str,
        custom_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send notifications specific to instructor changes.
        """
        results = {
            'notifications_sent': 0,
            'notifications_failed': 0,
            'recipients': [],
            'errors': []
        }
        
        try:
            session = self._get_session_with_program_check(db, session_id, program_context)
            if not session:
                results['errors'].append(f"Session {session_id} not found")
                return results
            
            # Get instructor assignments
            assignments = db.query(SessionInstructor).filter(
                and_(
                    SessionInstructor.session_id == session_id,
                    SessionInstructor.instructor_id.in_(instructor_ids),
                    SessionInstructor.removed_at.is_(None)
                )
            ).all()
            
            for assignment in assignments:
                try:
                    # Get instructor information
                    instructor_info = self._get_instructor_info(db, assignment.instructor_id)
                    if not instructor_info:
                        continue
                    
                    # Create notification content
                    notification_content = self._create_instructor_notification_content(
                        session, assignment, notification_type, custom_message
                    )
                    
                    # Send notification
                    self._send_individual_notification(
                        instructor_info, notification_content, notification_type
                    )
                    
                    results['notifications_sent'] += 1
                    results['recipients'].append(instructor_info)
                    
                except Exception as e:
                    results['notifications_failed'] += 1
                    results['errors'].append(f"Failed to notify instructor {assignment.instructor_id}: {str(e)}")
            
        except Exception as e:
            results['errors'].append(f"Failed to process instructor notifications: {str(e)}")
        
        return results
    
    def send_reminder_notifications(
        self,
        db: Session,
        hours_ahead: int = 24,
        program_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send reminder notifications for upcoming sessions.
        """
        from datetime import timedelta
        
        results = {
            'notifications_sent': 0,
            'notifications_failed': 0,
            'sessions_processed': 0,
            'errors': []
        }
        
        # Calculate time window for reminders
        reminder_time = datetime.utcnow() + timedelta(hours=hours_ahead)
        window_start = reminder_time - timedelta(minutes=30)  # 30-minute window
        window_end = reminder_time + timedelta(minutes=30)
        
        # Query sessions in the reminder window
        query = db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.start_time >= window_start,
                ScheduledSession.start_time <= window_end,
                ScheduledSession.status == SessionStatus.SCHEDULED
            )
        )
        
        if program_context:
            query = query.filter(ScheduledSession.program_id == program_context)
        
        upcoming_sessions = query.all()
        
        for session in upcoming_sessions:
            try:
                # Send notifications for this session
                session_results = self.send_session_notifications(
                    db, [session.id], 'session_reminder', session.program_id
                )
                
                results['notifications_sent'] += session_results['notifications_sent']
                results['notifications_failed'] += session_results['notifications_failed']
                results['sessions_processed'] += 1
                results['errors'].extend(session_results['errors'])
                
            except Exception as e:
                results['notifications_failed'] += 1
                results['errors'].append(f"Failed to process reminder for session {session.id}: {str(e)}")
        
        return results
    
    # Private helper methods
    
    def _get_session_with_program_check(
        self,
        db: Session,
        session_id: str,
        program_context: str
    ) -> Optional[ScheduledSession]:
        """Get session with program context validation."""
        return db.query(ScheduledSession).filter(
            and_(
                ScheduledSession.id == session_id,
                ScheduledSession.program_id == program_context
            )
        ).first()
    
    def _get_session_recipients(self, db: Session, session: ScheduledSession) -> List[Dict[str, Any]]:
        """Get all recipients for session notifications."""
        recipients = []
        
        # Get all participants
        participants = db.query(SessionParticipant).filter(
            SessionParticipant.session_id == session.id
        ).all()
        
        for participant in participants:
            # Add student if they have contact info
            student_info = self._get_student_info(db, participant.student_id)
            if student_info and student_info.get('email'):
                recipients.append(student_info)
            
            # Add parents
            parents = self._get_student_parents(db, participant.student_id)
            recipients.extend(parents)
        
        # Get all instructors
        instructors = db.query(SessionInstructor).filter(
            and_(
                SessionInstructor.session_id == session.id,
                SessionInstructor.removed_at.is_(None)
            )
        ).all()
        
        for instructor_assignment in instructors:
            instructor_info = self._get_instructor_info(db, instructor_assignment.instructor_id)
            if instructor_info:
                recipients.append(instructor_info)
        
        return recipients
    
    def _get_student_info(self, db: Session, student_id: str) -> Optional[Dict[str, Any]]:
        """Get student contact information."""
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return None
        
        return {
            'id': student.id,
            'name': f"{student.first_name} {student.last_name}",
            'email': student.email,
            'phone': student.phone,
            'emergency_contact': student.emergency_contact,
            'type': 'student'
        }
    
    def _get_student_parents(self, db: Session, student_id: str) -> List[Dict[str, Any]]:
        """Get parent contact information for a student."""
        # Get student's user record if exists
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return []
        
        parents = []
        
        # Check if student has associated user account
        if student.user_id:
            # Get parent relationships through user relationships
            parent_relationships = db.query(UserRelationship).filter(
                and_(
                    UserRelationship.child_user_id == student.user_id,
                    UserRelationship.relationship_type.in_([
                        RelationshipType.PARENT,
                        RelationshipType.GUARDIAN
                    ])
                )
            ).all()
            
            for relationship in parent_relationships:
                parent_user = db.query(User).filter(
                    User.id == relationship.parent_user_id
                ).first()
                
                if parent_user:
                    parents.append({
                        'id': parent_user.id,
                        'name': f"{parent_user.first_name} {parent_user.last_name}",
                        'email': parent_user.email,
                        'phone': parent_user.phone,
                        'type': 'parent',
                        'relationship': relationship.relationship_type.value,
                        'student_id': student_id
                    })
        
        # Fallback to emergency contact if no parent users found
        if not parents and student.emergency_contact:
            emergency_info = student.emergency_contact
            if isinstance(emergency_info, dict) and emergency_info.get('email'):
                parents.append({
                    'id': f'emergency_{student_id}',
                    'name': emergency_info.get('name', 'Emergency Contact'),
                    'email': emergency_info.get('email'),
                    'phone': emergency_info.get('phone'),
                    'type': 'emergency_contact',
                    'student_id': student_id
                })
        
        return parents
    
    def _get_instructor_info(self, db: Session, instructor_id: str) -> Optional[Dict[str, Any]]:
        """Get instructor contact information."""
        instructor = db.query(User).filter(
            and_(
                User.id == instructor_id,
                or_(
                    User.primary_role == UserRole.INSTRUCTOR,
                    User.roles.contains([UserRole.INSTRUCTOR.value])
                )
            )
        ).first()
        
        if not instructor:
            return None
        
        return {
            'id': instructor.id,
            'name': f"{instructor.first_name} {instructor.last_name}",
            'email': instructor.email,
            'phone': instructor.phone,
            'type': 'instructor',
            'role': instructor.primary_role.value
        }
    
    def _create_notification_content(
        self,
        session: ScheduledSession,
        notification_type: str,
        custom_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create notification content for session changes."""
        base_content = {
            'subject': f"{self.notification_types.get(notification_type, 'Schedule Update')}: {session.title}",
            'session_title': session.title,
            'session_date': session.start_time.strftime('%B %d, %Y'),
            'session_time': f"{session.start_time.strftime('%I:%M %p')} - {session.end_time.strftime('%I:%M %p')}",
            'facility_name': session.facility.name if session.facility else 'TBD',
            'session_type': session.session_type.value.replace('_', ' ').title(),
            'notification_type': notification_type,
            'custom_message': custom_message,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add type-specific content
        if notification_type == 'session_cancelled':
            base_content['cancellation_reason'] = session.cancellation_reason
        elif notification_type == 'time_changed':
            base_content['message'] = "The session time has been updated. Please check your calendar."
        elif notification_type == 'session_reminder':
            base_content['message'] = f"Reminder: You have a session starting in 24 hours."
        
        return base_content
    
    def _create_participant_notification_content(
        self,
        session: ScheduledSession,
        participant: SessionParticipant,
        notification_type: str,
        custom_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create participant-specific notification content."""
        content = self._create_notification_content(session, notification_type, custom_message)
        
        content.update({
            'participant_status': participant.enrollment_status.value,
            'waitlist_position': participant.waitlist_position,
        })
        
        if notification_type == 'participants_added':
            content['message'] = "You have been enrolled in this session."
        elif notification_type == 'participants_removed':
            content['message'] = "You have been removed from this session."
        elif notification_type == 'waitlist_promoted':
            content['message'] = "You have been promoted from the waitlist and are now enrolled!"
        
        return content
    
    def _create_instructor_notification_content(
        self,
        session: ScheduledSession,
        assignment: SessionInstructor,
        notification_type: str,
        custom_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create instructor-specific notification content."""
        content = self._create_notification_content(session, notification_type, custom_message)
        
        content.update({
            'is_primary_instructor': assignment.is_primary,
            'assignment_notes': assignment.assignment_notes,
            'special_instructions': assignment.special_instructions,
        })
        
        if notification_type == 'instructors_added':
            role = "primary instructor" if assignment.is_primary else "assistant instructor"
            content['message'] = f"You have been assigned as {role} for this session."
        elif notification_type == 'instructors_removed':
            content['message'] = "You have been removed from this session."
        
        return content
    
    def _send_individual_notification(
        self,
        recipient: Dict[str, Any],
        content: Dict[str, Any],
        notification_type: str
    ) -> None:
        """
        Send notification to individual recipient.
        
        This is where you would integrate with:
        - Email service (SendGrid, AWS SES, etc.)
        - SMS service (Twilio, etc.)
        - Push notification service
        - In-app notification system
        """
        # For now, this is a placeholder that would integrate with actual notification services
        print(f"NOTIFICATION: Sending {notification_type} to {recipient['email']}")
        print(f"Subject: {content['subject']}")
        print(f"Content: {content}")
        
        # Here you would implement actual sending logic:
        # - Format email template
        # - Send via email service
        # - Store notification record
        # - Handle delivery failures
        pass