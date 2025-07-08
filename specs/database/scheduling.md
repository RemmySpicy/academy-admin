# Scheduling and Booking Database Schema

## Schema Overview

The scheduling and booking database schema provides comprehensive session management with advanced conflict prevention, instructor assignment, and multi-participant coordination. It supports various session types, recurring patterns, waitlist management, and real-time availability tracking.

## Core Design Principles

### 1. Session Type Management
- **Group Sessions**: Maximum 5 students per session
- **Private Sessions**: Maximum 2 students per session  
- **School Sessions**: Higher capacity (10-30 students, configurable)

### 2. Conflict Prevention
- Real-time availability checking
- Instructor double-booking prevention
- Facility capacity validation
- Student schedule conflict detection

### 3. Flexible Scheduling
- Recurring and one-time sessions
- Complex scheduling patterns
- Instructor availability management
- Waitlist and booking management

## Core Tables

### 1. Sessions Table

Central table for all scheduled sessions with comprehensive metadata.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (SES-YYYY-NNNN)
    
    -- Academic Context
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    curriculum_id UUID REFERENCES curricula(id) ON DELETE SET NULL,
    level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
    
    -- Location and Instructor
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    
    -- Session Configuration
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('group', 'private', 'school')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Scheduling Information
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))/60) STORED,
    
    -- Capacity Management
    capacity INTEGER NOT NULL,
    min_participants INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    available_spots INTEGER GENERATED ALWAYS AS (capacity - current_bookings) STORED,
    
    -- Session Status
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
    
    -- Recurring Information
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern_id UUID REFERENCES recurring_patterns(id) ON DELETE SET NULL,
    parent_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE, -- For recurring series
    
    -- Cancellation Information
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES users(id),
    
    -- Special Considerations
    special_requirements TEXT,
    equipment_needed TEXT[],
    preparation_notes TEXT,
    
    -- Pricing Information
    session_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_session_times CHECK (end_time > start_time),
    CONSTRAINT chk_session_capacity CHECK (capacity > 0 AND capacity <= 50),
    CONSTRAINT chk_session_participants CHECK (min_participants >= 1 AND min_participants <= capacity),
    CONSTRAINT chk_session_bookings CHECK (current_bookings >= 0 AND current_bookings <= capacity)
);
```

### 2. Recurring Patterns Table

Defines recurring session patterns with flexible configuration.

```sql
CREATE TABLE recurring_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pattern Configuration
    pattern_type VARCHAR(20) NOT NULL CHECK (pattern_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
    interval_value INTEGER NOT NULL DEFAULT 1,
    
    -- Day Configuration
    days_of_week INTEGER[] CHECK (
        array_length(days_of_week, 1) > 0 AND
        array_length(days_of_week, 1) <= 7
    ), -- 0=Sunday, 1=Monday, ..., 6=Saturday
    
    -- Date Range
    start_date DATE NOT NULL,
    end_date DATE,
    max_occurrences INTEGER,
    
    -- Time Configuration
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Exception Handling
    skip_holidays BOOLEAN DEFAULT true,
    exception_dates DATE[],
    
    -- Advanced Configuration
    custom_pattern JSONB, -- For complex patterns
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    
    CONSTRAINT chk_recurring_end_time CHECK (end_time > start_time),
    CONSTRAINT chk_recurring_dates CHECK (
        end_date IS NULL OR end_date >= start_date
    ),
    CONSTRAINT chk_recurring_occurrences CHECK (
        max_occurrences IS NULL OR max_occurrences > 0
    )
);
```

### 3. Session Bookings Table

Manages student bookings for sessions with comprehensive status tracking.

```sql
CREATE TABLE session_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (BKG-YYYY-NNNN)
    
    -- Core Relationships
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    
    -- Booking Information
    booking_status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'no_show', 'completed', 'pending')),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_source VARCHAR(50) DEFAULT 'admin', -- admin, parent_portal, mobile_app, phone
    
    -- Cancellation Information
    cancellation_date TIMESTAMP,
    cancellation_reason TEXT,
    cancellation_type VARCHAR(20) CHECK (cancellation_type IN ('student', 'instructor', 'academy', 'emergency')),
    
    -- Attendance Information
    checked_in_at TIMESTAMP,
    checked_out_at TIMESTAMP,
    attendance_status VARCHAR(20) CHECK (attendance_status IN ('present', 'absent', 'late', 'partial')),
    
    -- Session Credits
    session_credits_used INTEGER DEFAULT 1,
    is_makeup_session BOOLEAN DEFAULT false,
    original_session_id UUID REFERENCES sessions(id),
    
    -- Pricing Information
    amount_charged DECIMAL(10,2),
    discount_applied DECIMAL(10,2) DEFAULT 0.00,
    
    -- Special Considerations
    special_requests TEXT,
    medical_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_session_booking UNIQUE (session_id, student_id),
    CONSTRAINT chk_booking_times CHECK (
        checked_out_at IS NULL OR checked_in_at IS NULL OR checked_out_at >= checked_in_at
    ),
    CONSTRAINT chk_cancellation_date CHECK (
        cancellation_date IS NULL OR cancellation_date >= booking_date
    )
);
```

### 4. Instructor Availability Table

Manages instructor availability schedules with flexible time slots.

```sql
CREATE TABLE instructor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    
    -- Availability Configuration
    availability_type VARCHAR(20) NOT NULL CHECK (availability_type IN ('regular', 'temporary', 'exception')),
    
    -- Time Configuration
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Location Context
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    
    -- Date Range
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    -- Specific Date (for exceptions)
    specific_date DATE,
    
    -- Break Configuration
    break_duration_minutes INTEGER DEFAULT 0,
    break_start_time TIME,
    
    -- Capacity Information
    max_concurrent_sessions INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Notes
    notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_availability_times CHECK (end_time > start_time),
    CONSTRAINT chk_availability_dates CHECK (
        effective_until IS NULL OR effective_until >= effective_from
    ),
    CONSTRAINT chk_availability_context CHECK (
        (day_of_week IS NOT NULL AND specific_date IS NULL) OR
        (day_of_week IS NULL AND specific_date IS NOT NULL)
    )
);
```

### 5. Schedule Conflicts Table

Tracks and manages scheduling conflicts with resolution tracking.

```sql
CREATE TABLE schedule_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conflict_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (CON-YYYY-NNNN)
    
    -- Conflict Context
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN ('instructor_double_booking', 'facility_overlap', 'student_conflict', 'capacity_exceeded', 'availability_mismatch')),
    
    -- Affected Entities
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    conflicting_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    
    -- Conflict Details
    conflict_description TEXT NOT NULL,
    conflict_time_start TIMESTAMP,
    conflict_time_end TIMESTAMP,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Resolution Information
    status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'acknowledged', 'resolved', 'ignored')),
    resolution_method VARCHAR(50) CHECK (resolution_method IN ('session_moved', 'instructor_changed', 'capacity_increased', 'booking_cancelled', 'manual_override')),
    resolution_notes TEXT,
    
    -- Impact Assessment
    affected_bookings INTEGER DEFAULT 0,
    financial_impact DECIMAL(10,2) DEFAULT 0.00,
    
    -- Timeline
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Personnel
    detected_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_conflict_resolution CHECK (
        resolved_at IS NULL OR resolved_at >= detected_at
    ),
    CONSTRAINT chk_conflict_acknowledgment CHECK (
        acknowledged_at IS NULL OR acknowledged_at >= detected_at
    )
);
```

### 6. Session Waitlist Table

Manages waitlists for fully booked sessions with priority ordering.

```sql
CREATE TABLE session_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waitlist_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (WLT-YYYY-NNNN)
    
    -- Core Relationships
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    
    -- Waitlist Information
    position INTEGER NOT NULL,
    priority_score INTEGER DEFAULT 0, -- Higher score = higher priority
    
    -- Timeline
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP,
    response_deadline TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Status Management
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'offered', 'accepted', 'declined', 'expired', 'cancelled')),
    
    -- Notifications
    notification_method VARCHAR(20) CHECK (notification_method IN ('email', 'sms', 'app_push', 'phone_call')),
    notification_sent BOOLEAN DEFAULT false,
    
    -- Response Information
    response_received_at TIMESTAMP,
    response_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_session_waitlist UNIQUE (session_id, student_id),
    CONSTRAINT chk_waitlist_position CHECK (position > 0),
    CONSTRAINT chk_waitlist_expiry CHECK (
        expires_at IS NULL OR expires_at > added_at
    )
);
```

### 7. Session Feedback Table

Captures feedback and ratings for completed sessions.

```sql
CREATE TABLE session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    
    -- Feedback Source
    feedback_source VARCHAR(20) NOT NULL CHECK (feedback_source IN ('student', 'parent', 'instructor', 'admin')),
    
    -- Ratings (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    instruction_quality INTEGER CHECK (instruction_quality >= 1 AND instruction_quality <= 5),
    facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
    content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
    
    -- Detailed Feedback
    feedback_text TEXT,
    positive_aspects TEXT,
    areas_for_improvement TEXT,
    
    -- Specific Categories
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    
    -- Follow-up Actions
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    follow_up_completed BOOLEAN DEFAULT false,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_feedback_has_rating CHECK (
        overall_rating IS NOT NULL OR feedback_text IS NOT NULL
    )
);
```

### 8. Session Resources Table

Manages equipment and resource allocation for sessions.

```sql
CREATE TABLE session_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('equipment', 'material', 'facility_feature', 'digital_resource')),
    
    -- Resource Information
    resource_name VARCHAR(255) NOT NULL,
    resource_description TEXT,
    quantity_needed INTEGER DEFAULT 1,
    quantity_allocated INTEGER DEFAULT 0,
    
    -- Allocation Details
    allocation_status VARCHAR(20) DEFAULT 'requested' CHECK (allocation_status IN ('requested', 'allocated', 'unavailable', 'cancelled')),
    allocated_by UUID REFERENCES users(id),
    allocated_at TIMESTAMP,
    
    -- Specifications
    specifications TEXT,
    setup_instructions TEXT,
    cleanup_instructions TEXT,
    
    -- Cost Information
    cost_per_unit DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (cost_per_unit * quantity_needed) STORED,
    
    -- Status
    is_mandatory BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_resource_quantities CHECK (
        quantity_needed > 0 AND quantity_allocated >= 0
    )
);
```

## Performance Indexes

### Primary Performance Indexes
```sql
-- Core session indexes
CREATE INDEX idx_sessions_location_id ON sessions(location_id);
CREATE INDEX idx_sessions_instructor_id ON sessions(instructor_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_session_type ON sessions(session_type);

-- Booking indexes
CREATE INDEX idx_session_bookings_session_id ON session_bookings(session_id);
CREATE INDEX idx_session_bookings_student_id ON session_bookings(student_id);
CREATE INDEX idx_session_bookings_parent_id ON session_bookings(parent_id);
CREATE INDEX idx_session_bookings_status ON session_bookings(booking_status);
CREATE INDEX idx_session_bookings_date ON session_bookings(booking_date);

-- Instructor availability indexes
CREATE INDEX idx_instructor_availability_instructor_id ON instructor_availability(instructor_id);
CREATE INDEX idx_instructor_availability_day ON instructor_availability(day_of_week);
CREATE INDEX idx_instructor_availability_location ON instructor_availability(location_id);
CREATE INDEX idx_instructor_availability_effective ON instructor_availability(effective_from, effective_until);

-- Waitlist indexes
CREATE INDEX idx_session_waitlist_session_id ON session_waitlist(session_id);
CREATE INDEX idx_session_waitlist_student_id ON session_waitlist(student_id);
CREATE INDEX idx_session_waitlist_position ON session_waitlist(position);
CREATE INDEX idx_session_waitlist_status ON session_waitlist(status);

-- Conflict indexes
CREATE INDEX idx_schedule_conflicts_session_id ON schedule_conflicts(session_id);
CREATE INDEX idx_schedule_conflicts_instructor_id ON schedule_conflicts(instructor_id);
CREATE INDEX idx_schedule_conflicts_status ON schedule_conflicts(status);
CREATE INDEX idx_schedule_conflicts_severity ON schedule_conflicts(severity);

-- Recurring pattern indexes
CREATE INDEX idx_recurring_patterns_active ON recurring_patterns(is_active);
CREATE INDEX idx_recurring_patterns_dates ON recurring_patterns(start_date, end_date);
```

### Composite Indexes for Complex Queries
```sql
-- Session availability queries
CREATE INDEX idx_sessions_availability ON sessions(location_id, start_time, status, session_type);
CREATE INDEX idx_sessions_instructor_schedule ON sessions(instructor_id, start_time, status);

-- Booking status queries
CREATE INDEX idx_session_bookings_student_status ON session_bookings(student_id, booking_status);
CREATE INDEX idx_session_bookings_session_status ON session_bookings(session_id, booking_status);

-- Instructor availability queries
CREATE INDEX idx_instructor_availability_schedule ON instructor_availability(instructor_id, day_of_week, start_time);
CREATE INDEX idx_instructor_availability_location_day ON instructor_availability(location_id, day_of_week);

-- Waitlist priority queries
CREATE INDEX idx_session_waitlist_priority ON session_waitlist(session_id, position, status);
CREATE INDEX idx_session_waitlist_student_priority ON session_waitlist(student_id, status, added_at);
```

### Time-Based Partitioning Indexes
```sql
-- Monthly partitioning for sessions
CREATE INDEX idx_sessions_month ON sessions(date_trunc('month', start_time));
CREATE INDEX idx_session_bookings_month ON session_bookings(date_trunc('month', booking_date));

-- Date range queries
CREATE INDEX idx_sessions_date_range ON sessions(start_time, end_time);
CREATE INDEX idx_instructor_availability_date_range ON instructor_availability(effective_from, effective_until);
```

## Data Validation and Constraints

### Business Rule Constraints
```sql
-- Session capacity validation
CREATE OR REPLACE FUNCTION validate_session_capacity() RETURNS TRIGGER AS $$
BEGIN
    -- Check if session type capacity limits are respected
    IF NEW.session_type = 'group' AND NEW.capacity > 5 THEN
        RAISE EXCEPTION 'Group sessions cannot exceed 5 participants';
    END IF;
    
    IF NEW.session_type = 'private' AND NEW.capacity > 2 THEN
        RAISE EXCEPTION 'Private sessions cannot exceed 2 participants';
    END IF;
    
    -- School sessions have configurable limits (up to 50)
    IF NEW.session_type = 'school' AND NEW.capacity > 50 THEN
        RAISE EXCEPTION 'School sessions cannot exceed 50 participants';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_session_capacity
    BEFORE INSERT OR UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION validate_session_capacity();

-- Instructor availability validation
CREATE OR REPLACE FUNCTION validate_instructor_availability() RETURNS TRIGGER AS $$
BEGIN
    -- Check for overlapping availability slots
    IF EXISTS (
        SELECT 1 FROM instructor_availability ia
        WHERE ia.instructor_id = NEW.instructor_id
          AND ia.day_of_week = NEW.day_of_week
          AND ia.id != NEW.id
          AND ia.is_active = true
          AND (
              (NEW.start_time BETWEEN ia.start_time AND ia.end_time) OR
              (NEW.end_time BETWEEN ia.start_time AND ia.end_time) OR
              (NEW.start_time <= ia.start_time AND NEW.end_time >= ia.end_time)
          )
    ) THEN
        RAISE EXCEPTION 'Instructor availability slots cannot overlap';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_instructor_availability
    BEFORE INSERT OR UPDATE ON instructor_availability
    FOR EACH ROW EXECUTE FUNCTION validate_instructor_availability();
```

### Conflict Detection Functions
```sql
-- Automated conflict detection
CREATE OR REPLACE FUNCTION detect_scheduling_conflicts() RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Check for instructor double-booking
    SELECT COUNT(*) INTO conflict_count
    FROM sessions s
    WHERE s.instructor_id = NEW.instructor_id
      AND s.id != NEW.id
      AND s.status IN ('scheduled', 'in_progress')
      AND (
          (NEW.start_time BETWEEN s.start_time AND s.end_time) OR
          (NEW.end_time BETWEEN s.start_time AND s.end_time) OR
          (NEW.start_time <= s.start_time AND NEW.end_time >= s.end_time)
      );
    
    IF conflict_count > 0 THEN
        -- Log the conflict
        INSERT INTO schedule_conflicts (
            conflict_type, session_id, instructor_id, conflict_description, severity
        ) VALUES (
            'instructor_double_booking', NEW.id, NEW.instructor_id,
            'Instructor has overlapping session assignments', 'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_conflicts
    AFTER INSERT OR UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION detect_scheduling_conflicts();
```

### Booking Management Functions
```sql
-- Update session booking counts
CREATE OR REPLACE FUNCTION update_session_bookings() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sessions 
        SET current_bookings = current_bookings + 1
        WHERE id = NEW.session_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.booking_status = 'confirmed' AND NEW.booking_status != 'confirmed' THEN
            UPDATE sessions 
            SET current_bookings = current_bookings - 1
            WHERE id = NEW.session_id;
        ELSIF OLD.booking_status != 'confirmed' AND NEW.booking_status = 'confirmed' THEN
            UPDATE sessions 
            SET current_bookings = current_bookings + 1
            WHERE id = NEW.session_id;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.booking_status = 'confirmed' THEN
            UPDATE sessions 
            SET current_bookings = current_bookings - 1
            WHERE id = OLD.session_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_bookings
    AFTER INSERT OR UPDATE OR DELETE ON session_bookings
    FOR EACH ROW EXECUTE FUNCTION update_session_bookings();
```

## Sample Data Examples

### Sample Session
```sql
INSERT INTO sessions (
    session_id, program_id, course_id, location_id, facility_id, instructor_id,
    session_type, title, start_time, end_time, capacity, status
) VALUES (
    'SES-2025-0001',
    (SELECT id FROM programs WHERE code = 'SWIM'),
    (SELECT id FROM courses WHERE code = 'SWIM-CLUB'),
    (SELECT id FROM locations WHERE code = 'MAIN'),
    (SELECT id FROM facilities WHERE code = 'POOL1'),
    (SELECT id FROM instructors WHERE email = 'john.coach@academy.com'),
    'group', 'Swimming Club - Level 1',
    '2025-01-15 10:00:00', '2025-01-15 11:00:00',
    5, 'scheduled'
);
```

### Sample Recurring Pattern
```sql
INSERT INTO recurring_patterns (
    name, description, pattern_type, interval_value, days_of_week,
    start_date, end_date, start_time, end_time
) VALUES (
    'Weekly Swimming Club', 'Weekly recurring swimming sessions',
    'weekly', 1, ARRAY[1, 3, 5], -- Monday, Wednesday, Friday
    '2025-01-15', '2025-12-31',
    '10:00:00', '11:00:00'
);
```

### Sample Booking
```sql
INSERT INTO session_bookings (
    booking_id, session_id, student_id, parent_id, booking_status,
    booking_source, session_credits_used
) VALUES (
    'BKG-2025-0001',
    (SELECT id FROM sessions WHERE session_id = 'SES-2025-0001'),
    (SELECT id FROM students WHERE student_id = 'STU-2025-0001'),
    (SELECT id FROM parents WHERE parent_id = 'PAR-2025-0001'),
    'confirmed', 'admin', 1
);
```

## Query Performance Optimization

### Efficient Availability Queries
```sql
-- Find available sessions for a specific time range
SELECT s.*, (s.capacity - s.current_bookings) as available_spots
FROM sessions s
WHERE s.location_id = $1
  AND s.start_time BETWEEN $2 AND $3
  AND s.status = 'scheduled'
  AND s.current_bookings < s.capacity
ORDER BY s.start_time;

-- Check instructor availability
SELECT DISTINCT ia.instructor_id
FROM instructor_availability ia
WHERE ia.location_id = $1
  AND ia.day_of_week = $2
  AND ia.start_time <= $3
  AND ia.end_time >= $4
  AND ia.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.instructor_id = ia.instructor_id
      AND s.start_time::time BETWEEN ia.start_time AND ia.end_time
      AND s.status IN ('scheduled', 'in_progress')
  );
```

### Efficient Booking Queries
```sql
-- Get student's upcoming sessions
SELECT s.*, sb.booking_status, sb.booking_date
FROM sessions s
JOIN session_bookings sb ON s.id = sb.session_id
WHERE sb.student_id = $1
  AND s.start_time > NOW()
  AND sb.booking_status = 'confirmed'
ORDER BY s.start_time;

-- Get session participant list
SELECT st.first_name, st.last_name, sb.booking_status, sb.checked_in_at
FROM session_bookings sb
JOIN students st ON sb.student_id = st.id
WHERE sb.session_id = $1
  AND sb.booking_status = 'confirmed'
ORDER BY st.last_name, st.first_name;
```

## Migration and Maintenance

### Schema Evolution
```sql
-- Add new session features
ALTER TABLE sessions ADD COLUMN virtual_meeting_url VARCHAR(500);
ALTER TABLE sessions ADD COLUMN recording_enabled BOOLEAN DEFAULT false;
ALTER TABLE sessions ADD COLUMN max_waitlist_size INTEGER DEFAULT 10;

-- Add new booking features
ALTER TABLE session_bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE session_bookings ADD COLUMN booking_notes TEXT;
```

### Maintenance Procedures
```sql
-- Clean up old cancelled sessions
DELETE FROM sessions 
WHERE status = 'cancelled' 
  AND start_time < NOW() - INTERVAL '1 year';

-- Archive old booking records
INSERT INTO session_bookings_archive 
SELECT * FROM session_bookings 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Update session statistics
UPDATE sessions 
SET current_bookings = (
    SELECT COUNT(*) FROM session_bookings 
    WHERE session_id = sessions.id AND booking_status = 'confirmed'
)
WHERE current_bookings != (
    SELECT COUNT(*) FROM session_bookings 
    WHERE session_id = sessions.id AND booking_status = 'confirmed'
);
```

This comprehensive scheduling and booking schema provides robust session management capabilities with performance optimization, conflict prevention, and comprehensive booking management features.