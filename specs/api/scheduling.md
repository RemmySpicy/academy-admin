# Scheduling API Specification

## API Overview

The Scheduling API provides comprehensive session management for the Academy Management System with advanced conflict prevention, instructor assignment, and multi-participant coordination. This API manages all types of sessions (Group, Private, School) with strict capacity controls, recurring and one-time scheduling options, and real-time availability tracking.

## Base URLs and Versioning

- **Base URL**: `https://api.academy-admin.com/api/v1`
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token (required for all endpoints)

## Authentication Requirements

All endpoints require valid JWT token with appropriate role permissions:
```
Authorization: Bearer <jwt_token>
```

**Required Permissions:**
- **Super Admin**: Full access to all scheduling endpoints, can override restrictions
- **Program Admin**: Access limited to assigned programs, cannot override capacity
- **Instructor**: Read-only access to own schedule, can update session status
- **Parent**: Limited access to booking endpoints for own children
- **Student**: Read-only access to own schedule

## Session Types and Business Rules

### Session Types
- **Group Sessions**: Maximum 5 students, 1 instructor
- **Private Sessions**: Maximum 2 students, 1 dedicated instructor
- **School Sessions**: Configurable capacity (10-30 students), multiple instructors possible

### Session Constraints
- All sessions are 1-hour duration
- Operating hours: 6:00 AM to 10:00 PM
- 30-minute buffer between sessions
- No instructor double-booking allowed

## Detailed Endpoint Specifications

### Session Management Endpoints

#### GET /sessions
List sessions with comprehensive filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `program_id` (UUID): Filter by program
- `facility_id` (UUID): Filter by facility
- `instructor_id` (UUID): Filter by instructor
- `session_type` (string): Filter by type (group, private, school)
- `status` (string): Filter by status (scheduled, in_progress, completed, cancelled)
- `date_from` (date): Start date filter (YYYY-MM-DD)
- `date_to` (date): End date filter (YYYY-MM-DD)
- `is_recurring` (boolean): Filter recurring sessions
- `search` (string): Search by title or description

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "program_id": "456e7890-e89b-12d3-a456-426614174001",
        "program_name": "Swimming",
        "course_id": "course-id-1",
        "course_name": "Swimming Club",
        "facility_id": "facility-id-1",
        "facility_name": "Main Pool",
        "instructor_id": "instructor-id-1",
        "instructor_name": "Mike Wilson",
        "session_type": "group",
        "title": "Swimming Club - Level 1",
        "description": "Beginner swimming lesson for ages 3-5",
        "start_time": "2024-01-20T10:00:00Z",
        "end_time": "2024-01-20T11:00:00Z",
        "capacity": 5,
        "enrolled_count": 3,
        "available_spots": 2,
        "status": "scheduled",
        "is_recurring": true,
        "recurring_pattern_id": "pattern-id-1",
        "created_by": "admin-id-1",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### POST /sessions
Create new session with conflict detection.

**Request Body:**
```json
{
  "program_id": "456e7890-e89b-12d3-a456-426614174001",
  "course_id": "course-id-1",
  "facility_id": "facility-id-1",
  "instructor_id": "instructor-id-1",
  "session_type": "group",
  "title": "Swimming Club - Level 1",
  "description": "Beginner swimming lesson for ages 3-5",
  "start_time": "2024-01-20T10:00:00Z",
  "end_time": "2024-01-20T11:00:00Z",
  "capacity": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "program_id": "456e7890-e89b-12d3-a456-426614174001",
    "course_id": "course-id-1",
    "facility_id": "facility-id-1",
    "instructor_id": "instructor-id-1",
    "session_type": "group",
    "title": "Swimming Club - Level 1",
    "description": "Beginner swimming lesson for ages 3-5",
    "start_time": "2024-01-20T10:00:00Z",
    "end_time": "2024-01-20T11:00:00Z",
    "capacity": 5,
    "enrolled_count": 0,
    "status": "scheduled",
    "is_recurring": false,
    "created_by": "admin-id-1",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /sessions/{id}
Get detailed session information including participants.

**Path Parameters:**
- `id` (UUID): Session ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "program_id": "456e7890-e89b-12d3-a456-426614174001",
    "program_name": "Swimming",
    "course_id": "course-id-1",
    "course_name": "Swimming Club",
    "facility_id": "facility-id-1",
    "facility_name": "Main Pool",
    "facility_address": "123 Pool St, Aquatown",
    "instructor_id": "instructor-id-1",
    "instructor_name": "Mike Wilson",
    "instructor_email": "mike.wilson@academy.com",
    "session_type": "group",
    "title": "Swimming Club - Level 1",
    "description": "Beginner swimming lesson for ages 3-5",
    "start_time": "2024-01-20T10:00:00Z",
    "end_time": "2024-01-20T11:00:00Z",
    "capacity": 5,
    "enrolled_count": 3,
    "available_spots": 2,
    "status": "scheduled",
    "is_recurring": true,
    "recurring_pattern": {
      "id": "pattern-id-1",
      "pattern_type": "weekly",
      "days_of_week": [1, 3, 5],
      "end_date": "2024-06-20"
    },
    "participants": [
      {
        "booking_id": "booking-id-1",
        "student_id": "student-id-1",
        "student_name": "Emma Johnson",
        "booking_status": "confirmed",
        "booking_date": "2024-01-15T10:30:00Z"
      }
    ],
    "created_by": "admin-id-1",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /sessions/{id}
Update session details with conflict checking.

**Path Parameters:**
- `id` (UUID): Session ID

**Request Body:**
```json
{
  "title": "Swimming Club - Level 1 (Updated)",
  "start_time": "2024-01-20T11:00:00Z",
  "end_time": "2024-01-20T12:00:00Z",
  "capacity": 6
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Swimming Club - Level 1 (Updated)",
    "start_time": "2024-01-20T11:00:00Z",
    "end_time": "2024-01-20T12:00:00Z",
    "capacity": 6,
    "updated_at": "2024-01-15T14:30:00Z",
    "conflicts_detected": [],
    "affected_bookings": 3
  }
}
```

#### DELETE /sessions/{id}
Cancel session and handle bookings.

**Path Parameters:**
- `id` (UUID): Session ID

**Query Parameters:**
- `cancel_reason` (string): Reason for cancellation
- `notify_participants` (boolean): Send cancellation notifications (default: true)
- `offer_alternatives` (boolean): Offer alternative sessions (default: true)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "cancelled",
    "cancellation_reason": "Instructor unavailable",
    "affected_bookings": 3,
    "notifications_sent": true,
    "alternative_sessions_offered": 2,
    "cancelled_at": "2024-01-15T14:30:00Z"
  }
}
```

#### POST /sessions/recurring
Create recurring session series with pattern.

**Request Body:**
```json
{
  "program_id": "456e7890-e89b-12d3-a456-426614174001",
  "course_id": "course-id-1",
  "facility_id": "facility-id-1",
  "instructor_id": "instructor-id-1",
  "session_type": "group",
  "title": "Swimming Club - Level 1",
  "description": "Weekly swimming lessons",
  "start_time": "10:00:00",
  "end_time": "11:00:00",
  "capacity": 5,
  "recurring_pattern": {
    "pattern_type": "weekly",
    "interval_value": 1,
    "days_of_week": [1, 3, 5],
    "start_date": "2024-01-20",
    "end_date": "2024-06-20"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "recurring_pattern_id": "pattern-id-1",
    "sessions_created": 45,
    "conflicts_detected": 0,
    "start_date": "2024-01-20",
    "end_date": "2024-06-20",
    "pattern_type": "weekly",
    "days_of_week": [1, 3, 5],
    "sessions": [
      {
        "id": "session-id-1",
        "date": "2024-01-20",
        "start_time": "2024-01-20T10:00:00Z",
        "end_time": "2024-01-20T11:00:00Z"
      }
    ]
  }
}
```

### Session Participants Management

#### GET /sessions/{id}/participants
Get session participants with booking details.

**Path Parameters:**
- `id` (UUID): Session ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "capacity": 5,
    "enrolled_count": 3,
    "available_spots": 2,
    "participants": [
      {
        "booking_id": "booking-id-1",
        "student_id": "student-id-1",
        "student_name": "Emma Johnson",
        "student_age": 9,
        "parent_name": "Sarah Johnson",
        "parent_phone": "+1234567890",
        "booking_status": "confirmed",
        "booking_date": "2024-01-15T10:30:00Z",
        "checked_in": false,
        "session_credits_used": 1
      }
    ],
    "waitlist": [
      {
        "waitlist_id": "waitlist-id-1",
        "student_id": "student-id-2",
        "student_name": "Alex Smith",
        "position": 1,
        "added_at": "2024-01-16T10:00:00Z"
      }
    ]
  }
}
```

#### POST /sessions/{id}/participants
Add participant to session.

**Path Parameters:**
- `id` (UUID): Session ID

**Request Body:**
```json
{
  "student_id": "student-id-1",
  "booking_status": "confirmed",
  "session_credits_used": 1,
  "notes": "Student is ready for Level 1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-id-1",
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "student-id-1",
    "student_name": "Emma Johnson",
    "booking_status": "confirmed",
    "booking_date": "2024-01-15T10:30:00Z",
    "session_credits_used": 1,
    "remaining_capacity": 4
  }
}
```

#### DELETE /sessions/{id}/participants/{student_id}
Remove participant from session.

**Path Parameters:**
- `id` (UUID): Session ID
- `student_id` (UUID): Student ID

**Query Parameters:**
- `cancellation_reason` (string): Reason for removal
- `refund_credits` (boolean): Refund session credits (default: true)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-id-1",
    "student_id": "student-id-1",
    "cancellation_reason": "Schedule conflict",
    "credits_refunded": 1,
    "cancelled_at": "2024-01-15T14:30:00Z",
    "waitlist_promoted": {
      "student_id": "student-id-2",
      "student_name": "Alex Smith"
    }
  }
}
```

### Availability Management Endpoints

#### GET /availability/instructors
Get instructor availability across all instructors.

**Query Parameters:**
- `date_from` (date): Start date for availability check
- `date_to` (date): End date for availability check
- `facility_id` (UUID): Filter by facility
- `program_id` (UUID): Filter by program qualification

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "instructors": [
      {
        "instructor_id": "instructor-id-1",
        "instructor_name": "Mike Wilson",
        "qualifications": ["Swimming", "Water Safety"],
        "availability": [
          {
            "date": "2024-01-20",
            "time_slots": [
              {
                "start_time": "09:00:00",
                "end_time": "10:00:00",
                "is_available": true,
                "facility_id": "facility-id-1"
              },
              {
                "start_time": "10:00:00",
                "end_time": "11:00:00",
                "is_available": false,
                "conflicting_session_id": "session-id-1"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### GET /availability/instructors/{id}
Get specific instructor availability and schedule.

**Path Parameters:**
- `id` (UUID): Instructor ID

**Query Parameters:**
- `date_from` (date): Start date for availability
- `date_to` (date): End date for availability
- `facility_id` (UUID): Filter by facility

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "instructor_id": "instructor-id-1",
    "instructor_name": "Mike Wilson",
    "email": "mike.wilson@academy.com",
    "qualifications": ["Swimming", "Water Safety"],
    "weekly_availability": [
      {
        "day_of_week": 1,
        "day_name": "Monday",
        "time_blocks": [
          {
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "facility_id": "facility-id-1",
            "is_active": true
          }
        ]
      }
    ],
    "schedule": [
      {
        "date": "2024-01-20",
        "sessions": [
          {
            "session_id": "session-id-1",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "title": "Swimming Club - Level 1",
            "participants_count": 3
          }
        ]
      }
    ]
  }
}
```

#### POST /availability/instructors/{id}
Set instructor availability schedule.

**Path Parameters:**
- `id` (UUID): Instructor ID

**Request Body:**
```json
{
  "availability_schedule": [
    {
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "facility_id": "facility-id-1",
      "effective_from": "2024-01-20",
      "effective_until": "2024-06-20"
    },
    {
      "day_of_week": 3,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "facility_id": "facility-id-1",
      "effective_from": "2024-01-20",
      "effective_until": "2024-06-20"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "instructor_id": "instructor-id-1",
    "availability_schedule": [
      {
        "id": "availability-id-1",
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "facility_id": "facility-id-1",
        "effective_from": "2024-01-20",
        "effective_until": "2024-06-20",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "conflicts_detected": 0
  }
}
```

#### GET /availability/time-slots
Get available time slots for booking.

**Query Parameters:**
- `program_id` (UUID, required): Program for session
- `session_type` (string, required): Type of session (group, private, school)
- `date_from` (date, required): Start date for search
- `date_to` (date, required): End date for search
- `facility_id` (UUID): Specific facility filter
- `instructor_id` (UUID): Specific instructor filter
- `capacity_needed` (integer): Number of spots needed (default: 1)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "available_slots": [
      {
        "date": "2024-01-20",
        "time_slot": {
          "start_time": "09:00:00",
          "end_time": "10:00:00"
        },
        "facility": {
          "id": "facility-id-1",
          "name": "Main Pool",
          "address": "123 Pool St"
        },
        "instructor": {
          "id": "instructor-id-1",
          "name": "Mike Wilson"
        },
        "available_capacity": 5,
        "session_type": "group"
      }
    ],
    "search_criteria": {
      "program_id": "456e7890-e89b-12d3-a456-426614174001",
      "session_type": "group",
      "date_from": "2024-01-20",
      "date_to": "2024-01-27",
      "capacity_needed": 1
    }
  }
}
```

### Booking Management Endpoints

#### POST /bookings
Create session booking for student.

**Request Body:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "student_id": "student-id-1",
  "booking_notes": "Student is excited for first lesson",
  "session_credits_to_use": 1,
  "emergency_contact_override": {
    "name": "John Johnson",
    "phone": "+1234567891"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-id-1",
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "student-id-1",
    "student_name": "Emma Johnson",
    "session_details": {
      "title": "Swimming Club - Level 1",
      "date": "2024-01-20",
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "facility_name": "Main Pool",
      "instructor_name": "Mike Wilson"
    },
    "booking_status": "confirmed",
    "session_credits_used": 1,
    "remaining_credits": 9,
    "booking_date": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /bookings
List bookings with filtering.

**Query Parameters:**
- `student_id` (UUID): Filter by student
- `session_id` (UUID): Filter by session
- `parent_id` (UUID): Filter by parent (shows all children's bookings)
- `booking_status` (string): Filter by status (confirmed, cancelled, no_show, completed)
- `date_from` (date): Start date filter
- `date_to` (date): End date filter
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "booking_id": "booking-id-1",
        "session_id": "session-id-1",
        "student_id": "student-id-1",
        "student_name": "Emma Johnson",
        "session_details": {
          "title": "Swimming Club - Level 1",
          "date": "2024-01-20",
          "start_time": "10:00:00",
          "end_time": "11:00:00",
          "facility_name": "Main Pool",
          "instructor_name": "Mike Wilson"
        },
        "booking_status": "confirmed",
        "booking_date": "2024-01-15T10:30:00Z",
        "session_credits_used": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### GET /bookings/{id}
Get booking details.

**Path Parameters:**
- `id` (UUID): Booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-id-1",
    "session_id": "session-id-1",
    "student_id": "student-id-1",
    "student_name": "Emma Johnson",
    "parent_name": "Sarah Johnson",
    "parent_phone": "+1234567890",
    "session_details": {
      "title": "Swimming Club - Level 1",
      "description": "Beginner swimming lesson",
      "date": "2024-01-20",
      "start_time": "10:00:00",
      "end_time": "11:00:00",
      "facility": {
        "name": "Main Pool",
        "address": "123 Pool St, Aquatown"
      },
      "instructor": {
        "name": "Mike Wilson",
        "email": "mike.wilson@academy.com",
        "phone": "+1234567892"
      }
    },
    "booking_status": "confirmed",
    "booking_date": "2024-01-15T10:30:00Z",
    "session_credits_used": 1,
    "booking_notes": "Student is excited for first lesson",
    "emergency_contact": {
      "name": "John Johnson",
      "phone": "+1234567891"
    }
  }
}
```

#### DELETE /bookings/{id}
Cancel booking.

**Path Parameters:**
- `id` (UUID): Booking ID

**Request Body:**
```json
{
  "cancellation_reason": "Schedule conflict",
  "refund_credits": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-id-1",
    "student_id": "student-id-1",
    "session_id": "session-id-1",
    "cancellation_reason": "Schedule conflict",
    "credits_refunded": 1,
    "cancellation_date": "2024-01-15T14:30:00Z",
    "cancellation_policy_applied": "24_hour_notice",
    "penalty_applied": false
  }
}
```

#### POST /bookings/{id}/check-in
Check in student for session.

**Path Parameters:**
- `id` (UUID): Booking ID

**Request Body:**
```json
{
  "check_in_time": "2024-01-20T09:55:00Z",
  "notes": "Student arrived on time and ready"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "booking-id-1",
    "student_id": "student-id-1",
    "student_name": "Emma Johnson",
    "session_id": "session-id-1",
    "check_in_time": "2024-01-20T09:55:00Z",
    "session_start_time": "2024-01-20T10:00:00Z",
    "on_time": true,
    "instructor_notified": true
  }
}
```

### Conflict Management Endpoints

#### GET /conflicts
List schedule conflicts.

**Query Parameters:**
- `severity` (string): Filter by severity (low, medium, high, critical)
- `status` (string): Filter by status (detected, resolved, ignored)
- `conflict_type` (string): Filter by conflict type
- `date_from` (date): Start date filter
- `date_to` (date): End date filter

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conflicts": [
      {
        "id": "conflict-id-1",
        "conflict_type": "instructor_double_booking",
        "session_id": "session-id-1",
        "conflicting_session_id": "session-id-2",
        "instructor_id": "instructor-id-1",
        "instructor_name": "Mike Wilson",
        "conflict_description": "Instructor assigned to overlapping sessions",
        "severity": "critical",
        "status": "detected",
        "detected_at": "2024-01-15T10:30:00Z",
        "sessions_affected": [
          {
            "session_id": "session-id-1",
            "title": "Swimming Club - Level 1",
            "start_time": "2024-01-20T10:00:00Z"
          },
          {
            "session_id": "session-id-2",
            "title": "Private Swimming Lesson",
            "start_time": "2024-01-20T10:30:00Z"
          }
        ]
      }
    ]
  }
}
```

#### POST /conflicts/check
Check for potential conflicts before creating/updating sessions.

**Request Body:**
```json
{
  "session_data": {
    "instructor_id": "instructor-id-1",
    "facility_id": "facility-id-1",
    "start_time": "2024-01-20T10:00:00Z",
    "end_time": "2024-01-20T11:00:00Z"
  },
  "exclude_session_id": "session-id-1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conflicts_detected": false,
    "checked_at": "2024-01-15T10:30:00Z",
    "validation_results": {
      "instructor_availability": "available",
      "facility_availability": "available",
      "capacity_validation": "passed",
      "time_validation": "passed"
    }
  }
}
```

#### POST /conflicts/{id}/resolve
Resolve schedule conflict.

**Path Parameters:**
- `id` (UUID): Conflict ID

**Request Body:**
```json
{
  "resolution_method": "reassign_instructor",
  "new_instructor_id": "instructor-id-2",
  "resolution_notes": "Reassigned to available instructor",
  "notify_affected_parties": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conflict_id": "conflict-id-1",
    "resolution_method": "reassign_instructor",
    "resolution_details": {
      "old_instructor_id": "instructor-id-1",
      "new_instructor_id": "instructor-id-2",
      "sessions_updated": 1,
      "notifications_sent": 3
    },
    "status": "resolved",
    "resolved_at": "2024-01-15T14:30:00Z",
    "resolved_by": "admin-id-1"
  }
}
```

### Waitlist Management Endpoints

#### POST /waitlist
Add student to session waitlist.

**Request Body:**
```json
{
  "session_id": "session-id-1",
  "student_id": "student-id-2",
  "priority_notes": "Student has been waiting for this time slot"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "waitlist_id": "waitlist-id-1",
    "session_id": "session-id-1",
    "student_id": "student-id-2",
    "student_name": "Alex Smith",
    "position": 1,
    "estimated_wait_time": "1-2 weeks",
    "added_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-02-15T10:30:00Z"
  }
}
```

#### GET /waitlist/session/{session_id}
Get waitlist for specific session.

**Path Parameters:**
- `session_id` (UUID): Session ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "session-id-1",
    "session_title": "Swimming Club - Level 1",
    "session_date": "2024-01-20",
    "capacity": 5,
    "enrolled_count": 5,
    "waitlist": [
      {
        "waitlist_id": "waitlist-id-1",
        "student_id": "student-id-2",
        "student_name": "Alex Smith",
        "parent_name": "Jennifer Smith",
        "position": 1,
        "added_at": "2024-01-15T10:30:00Z",
        "status": "waiting"
      }
    ]
  }
}
```

#### POST /waitlist/{id}/offer
Offer spot to waitlisted student.

**Path Parameters:**
- `id` (UUID): Waitlist ID

**Request Body:**
```json
{
  "offer_expires_at": "2024-01-16T10:30:00Z",
  "notification_message": "A spot has opened up in your requested session!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "waitlist_id": "waitlist-id-1",
    "student_id": "student-id-2",
    "student_name": "Alex Smith",
    "session_id": "session-id-1",
    "status": "offered",
    "offer_expires_at": "2024-01-16T10:30:00Z",
    "notification_sent": true,
    "parent_email": "jennifer.smith@email.com"
  }
}
```

### Instructor Assignment Endpoints

#### POST /sessions/{id}/assign-instructor
Assign instructor to session.

**Path Parameters:**
- `id` (UUID): Session ID

**Request Body:**
```json
{
  "instructor_id": "instructor-id-1",
  "check_conflicts": true,
  "notify_instructor": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "session-id-1",
    "instructor_id": "instructor-id-1",
    "instructor_name": "Mike Wilson",
    "assignment_date": "2024-01-15T10:30:00Z",
    "conflicts_detected": false,
    "instructor_notified": true
  }
}
```

#### GET /instructors/{id}/schedule
Get instructor's complete schedule.

**Path Parameters:**
- `id` (UUID): Instructor ID

**Query Parameters:**
- `date_from` (date): Start date for schedule
- `date_to` (date): End date for schedule
- `include_cancelled` (boolean): Include cancelled sessions

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "instructor_id": "instructor-id-1",
    "instructor_name": "Mike Wilson",
    "schedule_period": {
      "start_date": "2024-01-20",
      "end_date": "2024-01-27"
    },
    "total_sessions": 12,
    "total_hours": 12,
    "daily_schedule": [
      {
        "date": "2024-01-20",
        "sessions": [
          {
            "session_id": "session-id-1",
            "title": "Swimming Club - Level 1",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "facility_name": "Main Pool",
            "participants_count": 3,
            "session_status": "scheduled"
          }
        ],
        "total_hours": 1
      }
    ]
  }
}
```

## Data Models and Schemas

### Session Model
```json
{
  "id": "UUID",
  "program_id": "UUID (required)",
  "course_id": "UUID (required)",
  "facility_id": "UUID (required)",
  "instructor_id": "UUID",
  "session_type": "string (enum: group, private, school)",
  "title": "string (required)",
  "description": "string",
  "start_time": "ISO 8601 datetime (required)",
  "end_time": "ISO 8601 datetime (required)",
  "capacity": "integer (required)",
  "status": "string (enum: scheduled, in_progress, completed, cancelled, no_show)",
  "is_recurring": "boolean",
  "recurring_pattern_id": "UUID",
  "created_by": "UUID (required)",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Booking Model
```json
{
  "id": "UUID",
  "session_id": "UUID (required)",
  "student_id": "UUID (required)",
  "booking_status": "string (enum: confirmed, cancelled, no_show, completed)",
  "booking_date": "ISO 8601 datetime",
  "cancellation_date": "ISO 8601 datetime",
  "cancellation_reason": "string",
  "checked_in_at": "ISO 8601 datetime",
  "session_credits_used": "integer",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Recurring Pattern Model
```json
{
  "id": "UUID",
  "pattern_type": "string (enum: weekly, biweekly, monthly)",
  "interval_value": "integer",
  "days_of_week": "array of integers (0-6)",
  "start_date": "date",
  "end_date": "date",
  "max_occurrences": "integer",
  "created_at": "ISO 8601 datetime"
}
```

## Error Response Formats

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Conflict Error Response
```json
{
  "success": false,
  "error": {
    "code": "SCHEDULING_CONFLICT",
    "message": "Scheduling conflict detected",
    "details": {
      "conflict_type": "instructor_double_booking",
      "conflicting_sessions": [
        {
          "session_id": "session-id-1",
          "title": "Existing Session",
          "start_time": "2024-01-20T10:00:00Z"
        }
      ]
    }
  }
}
```

## Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied - insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Scheduling conflict detected
- **422 Unprocessable Entity**: Validation errors
- **423 Locked**: Resource locked (e.g., session full)
- **500 Internal Server Error**: Server error

## Rate Limiting

### General API Endpoints
- **Limit**: 1000 requests per hour per authenticated user
- **Burst**: 100 requests per minute

### Real-time Operations
- **Booking Endpoints**: 60 requests per minute
- **Availability Checks**: 300 requests per minute

## Security Considerations

### Access Control
- Role-based access control enforced
- Program-specific access for Program Admins
- Instructor access limited to own schedule
- Parent access limited to own children's bookings

### Data Protection
- Session participant information secured
- Booking history audit trail maintained
- Payment information handling secured
- Real-time conflict prevention

### Business Logic Security
- Capacity limits strictly enforced
- Double-booking prevention
- Session time validation
- Instructor qualification validation

## Example Usage

### Complete Booking Flow
```javascript
// 1. Check availability
const availabilityResponse = await fetch('/api/v1/availability/time-slots?' + 
  new URLSearchParams({
    program_id: 'swimming-program-id',
    session_type: 'group',
    date_from: '2024-01-20',
    date_to: '2024-01-27',
    capacity_needed: '1'
  }), {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 2. Create session if needed
const sessionResponse = await fetch('/api/v1/sessions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    program_id: 'swimming-program-id',
    course_id: 'swimming-course-id',
    facility_id: 'main-pool-id',
    instructor_id: 'instructor-id-1',
    session_type: 'group',
    title: 'Swimming Club - Level 1',
    start_time: '2024-01-20T10:00:00Z',
    end_time: '2024-01-20T11:00:00Z',
    capacity: 5
  })
});

// 3. Book student into session
const bookingResponse = await fetch('/api/v1/bookings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    session_id: session.data.id,
    student_id: 'student-id-1',
    session_credits_to_use: 1
  })
});
```

## Testing Endpoints

### Check Instructor Availability
```bash
curl -X GET "https://api.academy-admin.com/api/v1/availability/instructors/instructor-id-1?date_from=2024-01-20&date_to=2024-01-27" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Recurring Sessions
```bash
curl -X POST "https://api.academy-admin.com/api/v1/sessions/recurring" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "program_id": "program-id",
    "session_type": "group",
    "title": "Weekly Swimming",
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "capacity": 5,
    "recurring_pattern": {
      "pattern_type": "weekly",
      "days_of_week": [1,3,5],
      "start_date": "2024-01-20",
      "end_date": "2024-06-20"
    }
  }'
```

### Check for Conflicts
```bash
curl -X POST "https://api.academy-admin.com/api/v1/conflicts/check" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_data": {
      "instructor_id": "instructor-id-1",
      "start_time": "2024-01-20T10:00:00Z",
      "end_time": "2024-01-20T11:00:00Z"
    }
  }'
```