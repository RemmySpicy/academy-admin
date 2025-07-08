# Scheduling Feature Specification

## Feature Overview

The scheduling system provides comprehensive session management for the Academy Management System with advanced conflict prevention, instructor assignment, and multi-participant coordination. It manages all types of sessions (Group, Private, School) with strict capacity controls, recurring and one-time scheduling options, and real-time availability tracking.

## User Stories

### Super Admin
- As a Super Admin, I can create and manage schedules for all programs across all locations
- As a Super Admin, I can override capacity restrictions and scheduling conflicts when necessary
- As a Super Admin, I can assign and reassign instructors to sessions with conflict prevention
- As a Super Admin, I can view and manage all scheduling data across all programs and locations
- As a Super Admin, I can create recurring session templates and one-time sessions
- As a Super Admin, I can manage instructor availability and time slots
- As a Super Admin, I can resolve scheduling conflicts and manage session cancellations

### Program Admin
- As a Program Admin, I can create and manage schedules for my assigned programs
- As a Program Admin, I can assign instructors to sessions within my programs
- As a Program Admin, I can manage student enrollments and session bookings
- As a Program Admin, I can view instructor availability and schedule sessions accordingly
- As a Program Admin, I can create both recurring and one-time sessions
- As a Program Admin, I can manage session capacity and participant lists
- As a Program Admin, I cannot override system capacity restrictions

### Instructor
- As an Instructor, I can view my assigned sessions and schedule
- As an Instructor, I can update my availability preferences
- As an Instructor, I can mark sessions as completed or cancelled
- As an Instructor, I can view session details and participant information
- As an Instructor, I cannot modify session assignments or capacity

### Parent
- As a Parent, I can view available time slots for my children
- As a Parent, I can book sessions for my children based on availability
- As a Parent, I can view my children's scheduled sessions
- As a Parent, I can cancel bookings within the allowed timeframe
- As a Parent, I can see session status and instructor assignments
- As a Parent, I can manage recurring session preferences

### Student
- As a Student, I can view my scheduled sessions
- As a Student, I can see session details including instructor and location
- As a Student, I can view my session history and upcoming sessions
- As a Student, I can see session status updates

## Business Rules

### Session Types and Capacity
1. **Group Sessions**
   - Maximum 5 students per session
   - Instructor can be assigned to multiple group sessions if no time conflicts
   - Minimum 1 student required to proceed

2. **Private Sessions**
   - Maximum 2 students per session
   - One-on-one or small group intensive training
   - Instructor dedicated to this session only

3. **School Sessions**
   - Higher capacity allowed (configurable per program)
   - Typically 10-30 students depending on program and facility
   - May require multiple instructors

### Session Duration and Timing
- All sessions are 1-hour duration
- Sessions can be scheduled from 6:00 AM to 10:00 PM
- 30-minute buffer between sessions for setup/cleanup
- No overlapping sessions for same instructor

### Scheduling Options
1. **Recurring Sessions**
   - Weekly, bi-weekly, or monthly patterns
   - End date or number of occurrences specified
   - Bulk creation with conflict checking
   - Individual session modification within series

2. **One-Time Sessions**
   - Single occurrence sessions
   - Makeup sessions for missed recurring sessions
   - Special events or assessments
   - Holiday or program-specific sessions

### Instructor Assignment Rules
- Manual assignment by Program Admins or Super Admins
- Automatic conflict prevention - no double-booking
- Instructor must be qualified for the program/course
- Instructor must be available during session time
- Instructor can be reassigned if no conflicts exist

### Booking and Cancellation Rules
- Students can book sessions up to 4 weeks in advance
- Cancellations allowed up to 24 hours before session
- Late cancellations may forfeit session credits
- No-shows result in session credit deduction
- Makeup sessions available for instructor-initiated cancellations

### Conflict Prevention
- Real-time availability checking
- Instructor double-booking prevention
- Facility capacity validation
- Student schedule conflict detection
- Equipment availability verification

## Technical Requirements

### Core Scheduling Engine
- Real-time availability calculation
- Conflict detection and prevention algorithms
- Capacity management with strict enforcement
- Recurring session generation and management
- Session state management (Scheduled, Completed, Cancelled, No-Show)

### Instructor Management
- Availability calendar management
- Qualification-based assignment validation
- Conflict prevention for instructor assignments
- Workload distribution analytics
- Schedule optimization suggestions

### Booking System
- Real-time session availability display
- Instant booking confirmation
- Waitlist management for full sessions
- Session credit tracking and management
- Automatic session reminders

### Multi-Location Support
- Facility-specific scheduling
- Cross-location instructor assignments
- Location-based availability filtering
- Multi-facility program coordination

### Session Status Management
- Scheduled → In Progress → Completed flow
- Cancellation handling with reason tracking
- No-show detection and management
- Makeup session scheduling
- Session modification with audit trail

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('group', 'private', 'school')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern_id UUID REFERENCES recurring_patterns(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_session_times CHECK (end_time > start_time)
);
```

### Recurring Patterns Table
```sql
CREATE TABLE recurring_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_type VARCHAR(20) NOT NULL CHECK (pattern_type IN ('weekly', 'biweekly', 'monthly')),
    interval_value INTEGER NOT NULL DEFAULT 1,
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) > 0),
    start_date DATE NOT NULL,
    end_date DATE,
    max_occurrences INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Session Bookings Table
```sql
CREATE TABLE session_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'no_show', 'completed')),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancellation_date TIMESTAMP,
    cancellation_reason TEXT,
    checked_in_at TIMESTAMP,
    session_credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);
```

### Instructor Availability Table
```sql
CREATE TABLE instructor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_availability_times CHECK (end_time > start_time)
);
```

### Schedule Conflicts Table
```sql
CREATE TABLE schedule_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conflict_type VARCHAR(50) NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    conflicting_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    conflict_description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'resolved', 'ignored')),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

### Session Waitlist Table
```sql
CREATE TABLE session_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'accepted', 'declined', 'expired')),
    UNIQUE(session_id, student_id)
);
```

## API Endpoints

### Session Management
- `GET /api/v1/sessions` - List sessions with filters (instructor, facility, program, date range)
- `POST /api/v1/sessions` - Create new session
- `GET /api/v1/sessions/{id}` - Get session details
- `PUT /api/v1/sessions/{id}` - Update session
- `DELETE /api/v1/sessions/{id}` - Cancel session
- `POST /api/v1/sessions/recurring` - Create recurring session series
- `GET /api/v1/sessions/{id}/participants` - Get session participants
- `POST /api/v1/sessions/{id}/participants` - Add participant to session
- `DELETE /api/v1/sessions/{id}/participants/{student_id}` - Remove participant

### Availability Management
- `GET /api/v1/availability/instructors` - Get instructor availability
- `GET /api/v1/availability/instructors/{id}` - Get specific instructor availability
- `POST /api/v1/availability/instructors/{id}` - Set instructor availability
- `GET /api/v1/availability/facilities` - Get facility availability
- `GET /api/v1/availability/time-slots` - Get available time slots for booking

### Booking Management
- `POST /api/v1/bookings` - Create session booking
- `GET /api/v1/bookings` - List bookings with filters
- `GET /api/v1/bookings/{id}` - Get booking details
- `PUT /api/v1/bookings/{id}` - Update booking
- `DELETE /api/v1/bookings/{id}` - Cancel booking
- `POST /api/v1/bookings/{id}/check-in` - Check in student for session
- `GET /api/v1/bookings/student/{student_id}` - Get student's bookings

### Conflict Management
- `GET /api/v1/conflicts` - List schedule conflicts
- `GET /api/v1/conflicts/{id}` - Get conflict details
- `POST /api/v1/conflicts/{id}/resolve` - Resolve conflict
- `POST /api/v1/conflicts/check` - Check for potential conflicts

### Waitlist Management
- `POST /api/v1/waitlist` - Add student to session waitlist
- `GET /api/v1/waitlist/session/{session_id}` - Get session waitlist
- `GET /api/v1/waitlist/student/{student_id}` - Get student's waitlist entries
- `DELETE /api/v1/waitlist/{id}` - Remove from waitlist
- `POST /api/v1/waitlist/{id}/offer` - Offer spot to waitlisted student

### Instructor Assignment
- `POST /api/v1/sessions/{id}/assign-instructor` - Assign instructor to session
- `DELETE /api/v1/sessions/{id}/assign-instructor` - Unassign instructor from session
- `GET /api/v1/instructors/{id}/schedule` - Get instructor's schedule
- `POST /api/v1/instructors/{id}/bulk-assign` - Bulk assign instructor to multiple sessions

## UI/UX Requirements

### Scheduling Dashboard
- Calendar view with monthly, weekly, and daily perspectives
- Session overview with color-coded status indicators
- Quick filters for instructor, facility, program, and session type
- Drag-and-drop session rescheduling with conflict prevention
- Real-time availability indicators
- Session capacity gauges and participant lists

### Session Creation Modal
- Tabbed interface for session details, scheduling, and participants
- Session type selection with capacity auto-population
- Instructor assignment with availability validation
- Recurring session configuration with pattern selection
- Conflict detection with resolution suggestions
- Participant management with search and selection

### Booking Interface
- Available time slot grid with capacity indicators
- Real-time booking confirmation
- Waitlist signup for full sessions
- Session details preview with instructor and facility information
- Booking history and upcoming sessions view
- Cancellation interface with policy information

### Instructor Schedule Management
- Personal schedule calendar view
- Availability setting interface with time blocks
- Session assignment notifications
- Conflict alerts and resolution options
- Workload analytics and scheduling suggestions
- Mobile-responsive design for on-the-go access

### Conflict Resolution Interface
- Conflict detection dashboard with severity indicators
- Automated resolution suggestions
- Manual conflict resolution tools
- Impact analysis for schedule changes
- Notification system for affected parties
- Audit trail for all conflict resolutions

### Multi-Location Scheduling
- Facility-specific scheduling views
- Cross-location instructor assignment
- Location-based availability filtering
- Multi-facility program coordination
- Travel time considerations for instructor assignments

## Testing Requirements

### Unit Tests
- Session creation and validation logic
- Capacity enforcement algorithms
- Conflict detection and prevention
- Recurring session generation
- Availability calculation functions
- Booking confirmation and cancellation logic

### Integration Tests
- Complete session booking workflow
- Instructor assignment and conflict prevention
- Recurring session series creation
- Multi-participant session coordination
- Waitlist management and notifications
- Cross-facility scheduling scenarios

### Performance Tests
- Large-scale session creation and management
- Real-time availability calculations
- Concurrent booking scenarios
- Database query optimization
- Calendar rendering performance
- Bulk operations efficiency

### User Acceptance Tests
- Admin session creation and management workflows
- Instructor schedule management scenarios
- Parent booking and cancellation processes
- Student schedule viewing and interaction
- Conflict resolution workflows
- Multi-location scheduling scenarios

## Implementation Notes

### Performance Considerations
- Database indexing for schedule queries
- Caching strategies for availability calculations
- Real-time update mechanisms for schedule changes
- Efficient conflict detection algorithms
- Optimized calendar rendering
- Background job processing for recurring sessions

### Security Considerations
- Role-based access control for scheduling functions
- Data validation for all schedule modifications
- Audit logging for all scheduling actions
- Protection against concurrent booking conflicts
- Secure handling of session participant data

### Scalability Considerations
- Horizontal scaling for high-volume scheduling
- Database partitioning for large datasets
- Efficient handling of recurring session series
- Optimized notification systems
- Load balancing for real-time operations

### Deployment Considerations
- Database migration scripts for schema updates
- Environment-specific configuration management
- Monitoring and alerting for scheduling failures
- Backup and recovery procedures for schedule data
- Integration testing with existing systems

### Business Intelligence
- Session utilization analytics
- Instructor workload distribution
- Peak time analysis and capacity planning
- Cancellation rate tracking and optimization
- Revenue optimization through schedule analysis
- Predictive scheduling based on historical patterns