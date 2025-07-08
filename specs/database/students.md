# Student Management Database Schema

## Schema Overview

The student management database schema supports comprehensive student lifecycle management with family relationships, enrollment tracking, progress monitoring, and financial management. The design emphasizes data integrity, scalability, and multi-location support.

## Core Tables

### 1. Students Table

The primary table for student information with comprehensive profile data.

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (STU-YYYY-NNNN)
    salutation VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Location Assignment
    location_id UUID NOT NULL REFERENCES locations(id),
    previous_location_id UUID REFERENCES locations(id),
    
    -- Academy Information
    referral_source VARCHAR(100),
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn')),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Medical Information
    medical_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### 2. Parents Table

Parent/guardian information with contact details and account management.

```sql
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (PAR-YYYY-NNNN)
    salutation VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Account Information
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
    preferred_communication VARCHAR(20) DEFAULT 'email' CHECK (preferred_communication IN ('email', 'phone', 'sms')),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### 3. Student-Parent Relationships Table

Manages complex family relationships with permission controls.

```sql
CREATE TABLE student_parent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('primary', 'secondary', 'emergency')),
    can_pick_up BOOLEAN DEFAULT true,
    can_authorize_medical BOOLEAN DEFAULT false,
    receives_communications BOOLEAN DEFAULT true,
    is_financial_responsible BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_student_parent UNIQUE(student_id, parent_id),
    CONSTRAINT chk_primary_parent CHECK (
        NOT (relationship_type = 'primary' AND can_authorize_medical = false)
    )
);
```

### 4. Student Enrollments Table

Tracks student course enrollments with academic progress information.

```sql
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    
    -- Enrollment Details
    enrollment_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'withdrawn')),
    
    -- Academic Information
    current_level VARCHAR(50),
    current_module VARCHAR(50),
    current_section VARCHAR(50),
    
    -- Session Information
    total_sessions_allocated INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    remaining_sessions INTEGER DEFAULT 0,
    
    -- Financial Information
    enrollment_fee DECIMAL(10,2) DEFAULT 0.00,
    session_rate DECIMAL(10,2) DEFAULT 0.00,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_enrollment_dates CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    ),
    CONSTRAINT chk_session_counts CHECK (
        total_sessions_allocated >= 0 AND 
        completed_sessions >= 0 AND 
        remaining_sessions >= 0 AND
        completed_sessions <= total_sessions_allocated
    )
);
```

### 5. Student Progress Table

Detailed progress tracking with assessment results and milestones.

```sql
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    curriculum_level VARCHAR(50) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    
    -- Assessment Results
    skill_area VARCHAR(100) NOT NULL,
    current_rating INTEGER CHECK (current_rating >= 0 AND current_rating <= 3),
    target_rating INTEGER CHECK (target_rating >= 0 AND target_rating <= 3),
    previous_rating INTEGER CHECK (previous_rating >= 0 AND previous_rating <= 3),
    
    -- Progress Details
    assessment_date DATE,
    instructor_notes TEXT,
    student_notes TEXT,
    parent_notes TEXT,
    achievement_milestones TEXT[],
    
    -- Goals and Objectives
    learning_objectives TEXT[],
    next_goals TEXT[],
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assessed_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_progress_ratings CHECK (
        current_rating IS NULL OR target_rating IS NULL OR current_rating <= target_rating
    )
);
```

### 6. Student Attendance Table

Comprehensive attendance tracking with detailed session information.

```sql
CREATE TABLE student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    
    -- Attendance Details
    attendance_status VARCHAR(20) NOT NULL CHECK (attendance_status IN ('present', 'absent', 'late', 'excused', 'partial')),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    
    -- Session Information
    session_date DATE NOT NULL,
    session_duration_minutes INTEGER DEFAULT 60,
    actual_duration_minutes INTEGER,
    
    -- Late/Early Information
    minutes_late INTEGER DEFAULT 0,
    minutes_early_departure INTEGER DEFAULT 0,
    
    -- Notes and Feedback
    instructor_notes TEXT,
    parent_notes TEXT,
    behavioral_notes TEXT,
    
    -- Make-up Session Information
    is_makeup_session BOOLEAN DEFAULT false,
    original_session_id UUID REFERENCES sessions(id),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_attendance_times CHECK (
        check_out_time IS NULL OR check_in_time IS NULL OR check_out_time >= check_in_time
    ),
    CONSTRAINT chk_duration_consistency CHECK (
        actual_duration_minutes IS NULL OR 
        (actual_duration_minutes >= 0 AND actual_duration_minutes <= session_duration_minutes + 60)
    )
);
```

### 7. Student Financial Records Table

Comprehensive financial tracking with parent consolidation support.

```sql
CREATE TABLE student_financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE SET NULL,
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('enrollment_fee', 'session_fee', 'makeup_fee', 'material_fee', 'late_fee', 'refund', 'credit', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment Information
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'online', 'check', 'credit_note')),
    transaction_reference VARCHAR(100),
    external_transaction_id VARCHAR(100), -- For payment gateway integration
    zoho_books_id VARCHAR(100), -- Integration reference
    
    -- Status Information
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded', 'disputed')),
    due_date DATE,
    paid_date DATE,
    
    -- Description and Notes
    description TEXT NOT NULL,
    notes TEXT,
    internal_notes TEXT,
    
    -- Credit/Session Information
    sessions_purchased INTEGER DEFAULT 0,
    sessions_used INTEGER DEFAULT 0,
    sessions_remaining INTEGER DEFAULT 0,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_financial_amount CHECK (amount != 0),
    CONSTRAINT chk_payment_status CHECK (
        (status = 'paid' AND paid_date IS NOT NULL) OR 
        (status != 'paid' AND paid_date IS NULL)
    )
);
```

### 8. Student Location History Table

Tracks student transfers between locations with audit trail.

```sql
CREATE TABLE student_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_location_id UUID REFERENCES locations(id),
    to_location_id UUID NOT NULL REFERENCES locations(id),
    
    -- Transfer Details
    transfer_reason VARCHAR(100) NOT NULL,
    transfer_type VARCHAR(50) DEFAULT 'standard' CHECK (transfer_type IN ('standard', 'emergency', 'temporary', 'permanent')),
    effective_date DATE NOT NULL,
    
    -- Impact Assessment
    affected_enrollments INTEGER DEFAULT 0,
    affected_sessions INTEGER DEFAULT 0,
    financial_impact DECIMAL(10,2) DEFAULT 0.00,
    
    -- Approval Information
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    
    -- Notes
    transfer_notes TEXT,
    approval_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_transfer_dates CHECK (
        approval_date IS NULL OR approval_date >= request_date
    )
);
```

## Indexes for Performance

### Primary Performance Indexes
```sql
-- Students table indexes
CREATE INDEX idx_students_location_id ON students(location_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_name ON students(last_name, first_name);

-- Parents table indexes
CREATE INDEX idx_parents_email ON parents(email);
CREATE INDEX idx_parents_parent_id ON parents(parent_id);
CREATE INDEX idx_parents_name ON parents(last_name, first_name);

-- Relationship indexes
CREATE INDEX idx_student_parent_student_id ON student_parent_relationships(student_id);
CREATE INDEX idx_student_parent_parent_id ON student_parent_relationships(parent_id);
CREATE INDEX idx_student_parent_relationship_type ON student_parent_relationships(relationship_type);

-- Enrollment indexes
CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_program_id ON student_enrollments(program_id);
CREATE INDEX idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX idx_student_enrollments_status ON student_enrollments(status);
CREATE INDEX idx_student_enrollments_instructor_id ON student_enrollments(instructor_id);

-- Progress indexes
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_enrollment_id ON student_progress(enrollment_id);
CREATE INDEX idx_student_progress_assessment_date ON student_progress(assessment_date);
CREATE INDEX idx_student_progress_skill_area ON student_progress(skill_area);

-- Attendance indexes
CREATE INDEX idx_student_attendance_student_id ON student_attendance(student_id);
CREATE INDEX idx_student_attendance_session_id ON student_attendance(session_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(session_date);
CREATE INDEX idx_student_attendance_status ON student_attendance(attendance_status);

-- Financial indexes
CREATE INDEX idx_student_financial_student_id ON student_financial_records(student_id);
CREATE INDEX idx_student_financial_parent_id ON student_financial_records(parent_id);
CREATE INDEX idx_student_financial_status ON student_financial_records(status);
CREATE INDEX idx_student_financial_due_date ON student_financial_records(due_date);
```

### Composite Indexes for Complex Queries
```sql
-- Multi-column indexes for common query patterns
CREATE INDEX idx_students_location_status ON students(location_id, status);
CREATE INDEX idx_students_location_enrollment_date ON students(location_id, enrollment_date);
CREATE INDEX idx_student_enrollments_student_status ON student_enrollments(student_id, status);
CREATE INDEX idx_student_progress_student_skill ON student_progress(student_id, skill_area);
CREATE INDEX idx_student_attendance_student_date ON student_attendance(student_id, session_date);
CREATE INDEX idx_student_financial_parent_status ON student_financial_records(parent_id, status);
```

### Full-Text Search Indexes
```sql
-- Full-text search capabilities
CREATE INDEX idx_students_fulltext ON students USING gin(to_tsvector('english', 
    first_name || ' ' || last_name || ' ' || email || ' ' || COALESCE(phone, '')
));

CREATE INDEX idx_parents_fulltext ON parents USING gin(to_tsvector('english', 
    first_name || ' ' || last_name || ' ' || email || ' ' || phone
));
```

## Data Validation Rules

### Business Rule Constraints
```sql
-- Students must have at least one primary parent
CREATE OR REPLACE FUNCTION check_student_primary_parent() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM student_parent_relationships 
        WHERE student_id = NEW.student_id 
        AND relationship_type = 'primary'
    ) THEN
        RAISE EXCEPTION 'Student must have at least one primary parent relationship';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_student_primary_parent
    AFTER INSERT OR UPDATE ON student_parent_relationships
    FOR EACH ROW EXECUTE FUNCTION check_student_primary_parent();

-- Only one primary parent per student
CREATE UNIQUE INDEX idx_unique_primary_parent ON student_parent_relationships(student_id) 
    WHERE relationship_type = 'primary';

-- Enrollment dates must be logical
ALTER TABLE student_enrollments ADD CONSTRAINT chk_enrollment_date_logical 
    CHECK (enrollment_date <= CURRENT_DATE);

-- Progress ratings must be valid
ALTER TABLE student_progress ADD CONSTRAINT chk_progress_rating_sequence 
    CHECK (
        (previous_rating IS NULL) OR 
        (current_rating IS NULL) OR 
        (current_rating >= previous_rating)
    );
```

### Data Integrity Triggers
```sql
-- Update student session counts when attendance is recorded
CREATE OR REPLACE FUNCTION update_student_session_counts() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.attendance_status = 'present' THEN
        UPDATE student_enrollments 
        SET completed_sessions = completed_sessions + 1,
            remaining_sessions = remaining_sessions - 1
        WHERE id = NEW.enrollment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_counts
    AFTER INSERT ON student_attendance
    FOR EACH ROW EXECUTE FUNCTION update_student_session_counts();

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_student_enrollments_updated_at BEFORE UPDATE ON student_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data Examples

### Sample Student Record
```sql
INSERT INTO students (
    student_id, first_name, last_name, email, phone, date_of_birth, gender,
    address_line1, city, state, country, postal_code, location_id,
    referral_source, enrollment_date, status,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
) VALUES (
    'STU-2025-0001', 'Emma', 'Johnson', 'emma.johnson@email.com', '555-0123', '2015-03-15', 'Female',
    '123 Main Street', 'Springfield', 'IL', 'USA', '62701', 
    (SELECT id FROM locations WHERE code = 'MAIN'),
    'Word of mouth', '2025-01-15', 'active',
    'Sarah Johnson', '555-0124', 'Mother'
);
```

### Sample Parent Record
```sql
INSERT INTO parents (
    parent_id, first_name, last_name, email, phone,
    address_line1, city, state, country, postal_code,
    account_status, preferred_communication
) VALUES (
    'PAR-2025-0001', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '555-0124',
    '123 Main Street', 'Springfield', 'IL', 'USA', '62701',
    'active', 'email'
);
```

### Sample Enrollment Record
```sql
INSERT INTO student_enrollments (
    student_id, program_id, course_id, curriculum_id, facility_id,
    enrollment_date, start_date, status,
    current_level, total_sessions_allocated, remaining_sessions,
    enrollment_fee, session_rate
) VALUES (
    (SELECT id FROM students WHERE student_id = 'STU-2025-0001'),
    (SELECT id FROM programs WHERE name = 'Swimming'),
    (SELECT id FROM courses WHERE name = 'Swimming Club'),
    (SELECT id FROM curricula WHERE name = 'Swimming Club: 6-18'),
    (SELECT id FROM facilities WHERE code = 'POOL1'),
    '2025-01-15', '2025-01-22', 'active',
    'Level 1', 24, 24,
    150.00, 45.00
);
```

## Performance Optimization

### Query Optimization Examples
```sql
-- Efficient student search with pagination
SELECT s.*, p.first_name as parent_first_name, p.last_name as parent_last_name
FROM students s
LEFT JOIN student_parent_relationships spr ON s.id = spr.student_id AND spr.relationship_type = 'primary'
LEFT JOIN parents p ON spr.parent_id = p.id
WHERE s.location_id = $1
  AND s.status = 'active'
  AND (s.first_name ILIKE $2 OR s.last_name ILIKE $2)
ORDER BY s.last_name, s.first_name
LIMIT 20 OFFSET $3;

-- Efficient progress tracking query
SELECT sp.*, se.current_level, se.current_module
FROM student_progress sp
JOIN student_enrollments se ON sp.enrollment_id = se.id
WHERE sp.student_id = $1
  AND sp.assessment_date >= $2
ORDER BY sp.assessment_date DESC, sp.skill_area;

-- Efficient attendance summary
SELECT 
    DATE_TRUNC('month', sa.session_date) as month,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN sa.attendance_status = 'present' THEN 1 END) as present_sessions,
    COUNT(CASE WHEN sa.attendance_status = 'absent' THEN 1 END) as absent_sessions,
    ROUND(COUNT(CASE WHEN sa.attendance_status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
FROM student_attendance sa
WHERE sa.student_id = $1
  AND sa.session_date >= $2
GROUP BY DATE_TRUNC('month', sa.session_date)
ORDER BY month;
```

## Migration Considerations

### Adding New Fields
```sql
-- Safe migration for adding optional fields
ALTER TABLE students ADD COLUMN preferred_name VARCHAR(50);
ALTER TABLE students ADD COLUMN dietary_restrictions TEXT;
ALTER TABLE students ADD COLUMN special_needs TEXT;

-- Update existing records with defaults
UPDATE students SET preferred_name = first_name WHERE preferred_name IS NULL;
```

### Data Migration Scripts
```sql
-- Script to migrate legacy student data
WITH legacy_students AS (
    SELECT * FROM legacy_student_table
)
INSERT INTO students (
    student_id, first_name, last_name, email, phone, date_of_birth,
    location_id, enrollment_date, status, created_at
)
SELECT 
    'STU-2025-' || LPAD(ROW_NUMBER() OVER (ORDER BY legacy_id)::TEXT, 4, '0'),
    first_name, last_name, email, phone, birth_date,
    (SELECT id FROM locations WHERE code = 'MAIN'),
    enrollment_date, 'active', NOW()
FROM legacy_students;
```

## Backup and Recovery

### Critical Data Backup
```sql
-- Student data backup
COPY students TO '/backup/students.csv' WITH CSV HEADER;
COPY parents TO '/backup/parents.csv' WITH CSV HEADER;
COPY student_parent_relationships TO '/backup/relationships.csv' WITH CSV HEADER;

-- Financial data backup
COPY student_financial_records TO '/backup/financial_records.csv' WITH CSV HEADER;
```

### Recovery Procedures
```sql
-- Restore student data
COPY students FROM '/backup/students.csv' WITH CSV HEADER;

-- Verify data integrity after restore
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM student_parent_relationships;
SELECT COUNT(*) FROM student_enrollments;
```