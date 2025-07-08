# Location Management Database Schema

## Schema Overview

The location management database schema provides comprehensive multi-location support for the Academy Management System. It enables facility-specific operations with consolidated oversight, supporting data segregation by location while maintaining centralized administrative control and cross-location visibility.

## Core Design Principles

### 1. Location Hierarchy
- **Academy Level**: Central organization with multiple locations
- **Location Level**: Individual facilities with specific operations
- **Facility Level**: Specific areas within locations (pools, courts, rooms)

### 2. Data Segregation
- Location-based data partitioning for performance and security
- Cross-location operations with proper authorization controls
- Referential integrity maintained across all locations

### 3. Scalability
- Support for unlimited number of locations
- Efficient cross-location reporting and analytics
- Location-specific business rule configuration

## Core Tables

### 1. Locations Table

Central table for managing all academy locations with comprehensive facility information.

```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (LOC-YYYY-NN)
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- Short code for identification (e.g., 'MAIN', 'EAST', 'WEST')
    
    -- Contact Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Geographic Information
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Operational Information
    capacity_limit INTEGER DEFAULT 50,
    max_concurrent_sessions INTEGER DEFAULT 10,
    operating_hours JSONB, -- Store daily operating hours
    
    -- Facility Details
    total_area_sqft INTEGER,
    parking_spaces INTEGER,
    accessibility_features TEXT[],
    
    -- Business Information
    license_number VARCHAR(50),
    insurance_policy VARCHAR(50),
    safety_certifications TEXT[],
    
    -- Status and Configuration
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'closed', 'renovation')),
    
    -- Custom Settings
    settings JSONB DEFAULT '{}', -- Location-specific configuration
    branding JSONB DEFAULT '{}', -- Location-specific branding
    
    -- Financial Information
    monthly_rent DECIMAL(10,2),
    utility_costs DECIMAL(10,2),
    maintenance_budget DECIMAL(10,2),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### 2. Facilities Table

Individual facilities within locations (pools, courts, classrooms, etc.).

```sql
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    facility_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (FAC-YYYY-NNNN)
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL, -- e.g., 'POOL1', 'COURT2', 'ROOM3'
    
    -- Facility Details
    facility_type VARCHAR(50) NOT NULL, -- pool, court, classroom, gym, field
    description TEXT,
    
    -- Physical Specifications
    length_meters DECIMAL(6,2),
    width_meters DECIMAL(6,2),
    depth_meters DECIMAL(6,2), -- For pools
    area_sqft INTEGER,
    
    -- Capacity Information
    max_capacity INTEGER NOT NULL,
    recommended_capacity INTEGER,
    minimum_supervision_ratio VARCHAR(20), -- e.g., '1:8', '1:5'
    
    -- Equipment and Features
    equipment_list TEXT[],
    safety_equipment TEXT[],
    accessibility_features TEXT[],
    special_features TEXT[],
    
    -- Environmental Controls
    temperature_control BOOLEAN DEFAULT false,
    lighting_type VARCHAR(50),
    sound_system BOOLEAN DEFAULT false,
    
    -- Maintenance Information
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_schedule VARCHAR(100),
    
    -- Safety and Compliance
    safety_certifications TEXT[],
    inspection_date DATE,
    next_inspection_date DATE,
    
    -- Booking Configuration
    booking_buffer_minutes INTEGER DEFAULT 30, -- Time between sessions
    setup_time_minutes INTEGER DEFAULT 15,
    cleanup_time_minutes INTEGER DEFAULT 15,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'closed', 'reserved')),
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_facility_code UNIQUE (location_id, code)
);
```

### 3. Location Programs Table

Manages which programs are offered at each location with location-specific configuration.

```sql
CREATE TABLE location_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Program Configuration at Location
    is_active BOOLEAN DEFAULT true,
    capacity_limit INTEGER,
    pricing_tier VARCHAR(20) DEFAULT 'standard', -- standard, premium, budget
    
    -- Location-Specific Program Details
    local_program_name VARCHAR(255), -- Override program name if needed
    local_description TEXT,
    start_date DATE,
    end_date DATE,
    
    -- Operational Configuration
    min_enrollment INTEGER DEFAULT 3,
    max_enrollment INTEGER,
    waitlist_limit INTEGER DEFAULT 20,
    
    -- Facility Assignments
    primary_facility_id UUID REFERENCES facilities(id),
    backup_facility_ids UUID[], -- Array of backup facility UUIDs
    
    -- Pricing Information
    base_price_override DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Staff Requirements
    min_instructors_required INTEGER DEFAULT 1,
    instructor_qualifications TEXT[],
    
    -- Custom Settings
    settings JSONB DEFAULT '{}', -- Location-specific program settings
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT uk_location_program UNIQUE (location_id, program_id)
);
```

### 4. Student Location History Table

Tracks student transfers between locations with comprehensive audit trail.

```sql
CREATE TABLE student_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated (TRF-YYYY-NNNN)
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_location_id UUID REFERENCES locations(id),
    to_location_id UUID NOT NULL REFERENCES locations(id),
    
    -- Transfer Details
    transfer_reason VARCHAR(100) NOT NULL,
    transfer_type VARCHAR(50) DEFAULT 'standard' CHECK (transfer_type IN ('standard', 'emergency', 'temporary', 'permanent', 'trial')),
    effective_date DATE NOT NULL,
    planned_return_date DATE, -- For temporary transfers
    
    -- Impact Assessment
    affected_enrollments INTEGER DEFAULT 0,
    affected_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    rescheduled_sessions INTEGER DEFAULT 0,
    
    -- Financial Impact
    financial_impact DECIMAL(10,2) DEFAULT 0.00,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    additional_charges DECIMAL(10,2) DEFAULT 0.00,
    
    -- Approval Workflow
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    completion_date DATE,
    
    -- Documentation
    transfer_notes TEXT,
    approval_notes TEXT,
    completion_notes TEXT,
    
    -- Parent Communication
    parent_notified BOOLEAN DEFAULT false,
    parent_notification_date TIMESTAMP,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_transfer_dates CHECK (
        approval_date IS NULL OR approval_date >= request_date
    ),
    CONSTRAINT chk_effective_date CHECK (
        effective_date >= CURRENT_DATE - INTERVAL '30 days'
    )
);
```

### 5. Instructor Location Assignments Table

Manages instructor assignments to multiple locations with availability tracking.

```sql
CREATE TABLE instructor_location_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    
    -- Assignment Details
    is_primary BOOLEAN DEFAULT false,
    assignment_type VARCHAR(20) DEFAULT 'regular' CHECK (assignment_type IN ('regular', 'substitute', 'temporary', 'contractor')),
    
    -- Working Schedule
    max_hours_per_week INTEGER DEFAULT 40,
    preferred_days INTEGER[], -- Array of preferred days (0=Sunday, 1=Monday, etc.)
    preferred_time_slots TIME[][2], -- Array of [start_time, end_time] pairs
    
    -- Travel Information
    travel_time_minutes INTEGER DEFAULT 0, -- Travel time from other locations
    mileage_rate DECIMAL(5,3), -- Per mile reimbursement rate
    
    -- Assignment Status
    assignment_status VARCHAR(20) DEFAULT 'active' CHECK (assignment_status IN ('active', 'inactive', 'on_leave', 'terminated')),
    
    -- Date Information
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE,
    
    -- Performance Tracking
    total_sessions_taught INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    last_session_date DATE,
    
    -- Administrative Information
    assigned_by UUID REFERENCES users(id),
    assignment_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_instructor_location UNIQUE (instructor_id, location_id),
    CONSTRAINT chk_assignment_dates CHECK (
        assignment_end_date IS NULL OR assignment_end_date >= assignment_start_date
    ),
    CONSTRAINT chk_primary_assignment CHECK (
        NOT is_primary OR assignment_status = 'active'
    )
);
```

### 6. User Location Assignments Table

Manages administrative user access to specific locations with permission controls.

```sql
CREATE TABLE user_location_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    
    -- Access Permissions
    can_manage BOOLEAN DEFAULT true,
    can_view_reports BOOLEAN DEFAULT true,
    can_manage_staff BOOLEAN DEFAULT false,
    can_manage_schedules BOOLEAN DEFAULT true,
    can_manage_students BOOLEAN DEFAULT true,
    can_manage_finances BOOLEAN DEFAULT false,
    
    -- Assignment Details
    assignment_level VARCHAR(20) DEFAULT 'standard' CHECK (assignment_level IN ('view_only', 'standard', 'manager', 'director')),
    is_primary_location BOOLEAN DEFAULT false,
    
    -- Date Information
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    last_access_date TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Notes
    assignment_notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_user_location UNIQUE (user_id, location_id)
);
```

### 7. Location Analytics Table

Stores calculated analytics and metrics for each location for performance tracking.

```sql
CREATE TABLE location_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    
    -- Time Period
    analytics_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Student Metrics
    total_students INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,
    new_enrollments INTEGER DEFAULT 0,
    student_retentions INTEGER DEFAULT 0,
    student_transfers_in INTEGER DEFAULT 0,
    student_transfers_out INTEGER DEFAULT 0,
    
    -- Session Metrics
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    session_utilization_percentage DECIMAL(5,2) DEFAULT 0.00,
    average_session_attendance DECIMAL(5,2) DEFAULT 0.00,
    
    -- Financial Metrics
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    session_revenue DECIMAL(12,2) DEFAULT 0.00,
    enrollment_revenue DECIMAL(12,2) DEFAULT 0.00,
    operating_costs DECIMAL(12,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2) DEFAULT 0.00,
    
    -- Facility Metrics
    facility_utilization_percentage DECIMAL(5,2) DEFAULT 0.00,
    peak_usage_hours TIME[],
    maintenance_hours INTEGER DEFAULT 0,
    
    -- Staff Metrics
    total_instructors INTEGER DEFAULT 0,
    active_instructors INTEGER DEFAULT 0,
    instructor_utilization_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Customer Satisfaction
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_feedback_responses INTEGER DEFAULT 0,
    nps_score INTEGER, -- Net Promoter Score
    
    -- Calculated At
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_location_analytics UNIQUE (location_id, analytics_date, period_type)
);
```

### 8. Location Equipment Inventory Table

Manages equipment inventory across all locations with tracking and maintenance.

```sql
CREATE TABLE location_equipment_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    
    -- Equipment Information
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    
    -- Inventory Details
    quantity_total INTEGER NOT NULL DEFAULT 1,
    quantity_available INTEGER NOT NULL DEFAULT 1,
    quantity_in_use INTEGER GENERATED ALWAYS AS (quantity_total - quantity_available) STORED,
    
    -- Condition Information
    condition_status VARCHAR(20) DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'broken')),
    last_inspection_date DATE,
    next_inspection_date DATE,
    
    -- Financial Information
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    depreciation_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Maintenance Information
    maintenance_schedule VARCHAR(100),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_cost_ytd DECIMAL(10,2) DEFAULT 0.00,
    
    -- Usage Tracking
    total_usage_hours INTEGER DEFAULT 0,
    usage_limit_hours INTEGER,
    
    -- Storage Information
    storage_location VARCHAR(255),
    storage_requirements TEXT,
    
    -- Safety and Compliance
    safety_certifications TEXT[],
    compliance_requirements TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    
    -- Notes
    notes TEXT,
    
    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_equipment_quantities CHECK (
        quantity_available >= 0 AND quantity_available <= quantity_total
    )
);
```

## Performance Indexes

### Primary Location Indexes
```sql
-- Location management indexes
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_active ON locations(is_active);
CREATE INDEX idx_locations_status ON locations(status);
CREATE INDEX idx_locations_primary ON locations(is_primary);

-- Facility indexes
CREATE INDEX idx_facilities_location_id ON facilities(location_id);
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_facilities_active ON facilities(is_active);

-- Location program indexes
CREATE INDEX idx_location_programs_location_id ON location_programs(location_id);
CREATE INDEX idx_location_programs_program_id ON location_programs(program_id);
CREATE INDEX idx_location_programs_active ON location_programs(is_active);

-- Student location history indexes
CREATE INDEX idx_student_location_history_student_id ON student_location_history(student_id);
CREATE INDEX idx_student_location_history_from_location ON student_location_history(from_location_id);
CREATE INDEX idx_student_location_history_to_location ON student_location_history(to_location_id);
CREATE INDEX idx_student_location_history_effective_date ON student_location_history(effective_date);

-- Instructor assignment indexes
CREATE INDEX idx_instructor_location_assignments_instructor_id ON instructor_location_assignments(instructor_id);
CREATE INDEX idx_instructor_location_assignments_location_id ON instructor_location_assignments(location_id);
CREATE INDEX idx_instructor_location_assignments_primary ON instructor_location_assignments(is_primary);
CREATE INDEX idx_instructor_location_assignments_status ON instructor_location_assignments(assignment_status);

-- User assignment indexes
CREATE INDEX idx_user_location_assignments_user_id ON user_location_assignments(user_id);
CREATE INDEX idx_user_location_assignments_location_id ON user_location_assignments(location_id);
CREATE INDEX idx_user_location_assignments_active ON user_location_assignments(is_active);

-- Analytics indexes
CREATE INDEX idx_location_analytics_location_id ON location_analytics(location_id);
CREATE INDEX idx_location_analytics_date ON location_analytics(analytics_date);
CREATE INDEX idx_location_analytics_period ON location_analytics(period_type);

-- Equipment inventory indexes
CREATE INDEX idx_location_equipment_location_id ON location_equipment_inventory(location_id);
CREATE INDEX idx_location_equipment_facility_id ON location_equipment_inventory(facility_id);
CREATE INDEX idx_location_equipment_type ON location_equipment_inventory(equipment_type);
CREATE INDEX idx_location_equipment_status ON location_equipment_inventory(condition_status);
```

### Composite Indexes for Complex Queries
```sql
-- Multi-column indexes for efficient queries
CREATE INDEX idx_locations_active_status ON locations(is_active, status);
CREATE INDEX idx_facilities_location_active ON facilities(location_id, is_active);
CREATE INDEX idx_location_programs_location_active ON location_programs(location_id, is_active);
CREATE INDEX idx_student_transfers_status_date ON student_location_history(status, effective_date);
CREATE INDEX idx_instructor_assignments_location_status ON instructor_location_assignments(location_id, assignment_status);
CREATE INDEX idx_user_assignments_location_active ON user_location_assignments(location_id, is_active);
```

### Geographic and Search Indexes
```sql
-- Geographic indexes for location-based queries
CREATE INDEX idx_locations_geographic ON locations(latitude, longitude);

-- Full-text search indexes
CREATE INDEX idx_locations_search ON locations USING gin(to_tsvector('english', 
    name || ' ' || COALESCE(city, '') || ' ' || COALESCE(state, '')
));

CREATE INDEX idx_facilities_search ON facilities USING gin(to_tsvector('english', 
    name || ' ' || facility_type || ' ' || COALESCE(description, '')
));
```

## Data Validation and Business Rules

### Location Validation
```sql
-- Ensure primary location uniqueness
CREATE UNIQUE INDEX idx_unique_primary_location ON locations(is_primary) 
WHERE is_primary = true;

-- Validate geographic coordinates
ALTER TABLE locations ADD CONSTRAINT chk_location_latitude 
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE locations ADD CONSTRAINT chk_location_longitude 
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Validate capacity limits
ALTER TABLE locations ADD CONSTRAINT chk_location_capacity 
    CHECK (capacity_limit > 0 AND capacity_limit <= 1000);

ALTER TABLE facilities ADD CONSTRAINT chk_facility_capacity 
    CHECK (max_capacity > 0 AND recommended_capacity <= max_capacity);
```

### Transfer Validation
```sql
-- Validate student transfers
CREATE OR REPLACE FUNCTION validate_student_transfer() RETURNS TRIGGER AS $$
BEGIN
    -- Prevent transfer to same location
    IF NEW.from_location_id = NEW.to_location_id THEN
        RAISE EXCEPTION 'Cannot transfer student to the same location';
    END IF;
    
    -- Ensure from_location matches student's current location
    IF NEW.from_location_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM students 
        WHERE id = NEW.student_id AND location_id = NEW.from_location_id
    ) THEN
        RAISE EXCEPTION 'Student is not currently at the specified from_location';
    END IF;
    
    -- Validate effective date
    IF NEW.effective_date < CURRENT_DATE - INTERVAL '30 days' THEN
        RAISE EXCEPTION 'Transfer effective date cannot be more than 30 days in the past';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_student_transfer
    BEFORE INSERT OR UPDATE ON student_location_history
    FOR EACH ROW EXECUTE FUNCTION validate_student_transfer();
```

### Assignment Validation
```sql
-- Validate instructor assignments
CREATE OR REPLACE FUNCTION validate_instructor_assignment() RETURNS TRIGGER AS $$
BEGIN
    -- Ensure only one primary location per instructor
    IF NEW.is_primary = true AND EXISTS (
        SELECT 1 FROM instructor_location_assignments 
        WHERE instructor_id = NEW.instructor_id 
          AND is_primary = true 
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND assignment_status = 'active'
    ) THEN
        RAISE EXCEPTION 'Instructor can only have one primary location assignment';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_instructor_assignment
    BEFORE INSERT OR UPDATE ON instructor_location_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_instructor_assignment();
```

## Sample Data Examples

### Sample Location
```sql
INSERT INTO locations (
    location_id, name, code, address_line1, city, state, country, postal_code,
    phone, email, capacity_limit, max_concurrent_sessions, is_active, is_primary
) VALUES (
    'LOC-2025-01', 'Main Campus', 'MAIN', '123 Academy Drive',
    'Springfield', 'IL', 'USA', '62701',
    '555-ACADEMY', 'main@academy.com', 100, 15, true, true
);
```

### Sample Facility
```sql
INSERT INTO facilities (
    facility_id, location_id, name, code, facility_type, max_capacity,
    length_meters, width_meters, equipment_list, is_active
) VALUES (
    'FAC-2025-0001',
    (SELECT id FROM locations WHERE code = 'MAIN'),
    'Olympic Pool', 'POOL1', 'pool', 8,
    50.0, 25.0, 
    ARRAY['lane_ropes', 'starting_blocks', 'pool_noodles', 'kickboards'],
    true
);
```

### Sample Location Program
```sql
INSERT INTO location_programs (
    location_id, program_id, is_active, capacity_limit,
    primary_facility_id, min_enrollment, max_enrollment
) VALUES (
    (SELECT id FROM locations WHERE code = 'MAIN'),
    (SELECT id FROM programs WHERE code = 'SWIM'),
    true, 50,
    (SELECT id FROM facilities WHERE code = 'POOL1'),
    3, 40
);
```

### Sample Student Transfer
```sql
INSERT INTO student_location_history (
    transfer_id, student_id, from_location_id, to_location_id,
    transfer_reason, transfer_type, effective_date, requested_by
) VALUES (
    'TRF-2025-0001',
    (SELECT id FROM students WHERE student_id = 'STU-2025-0001'),
    (SELECT id FROM locations WHERE code = 'MAIN'),
    (SELECT id FROM locations WHERE code = 'EAST'),
    'Family relocation', 'permanent', '2025-02-01',
    (SELECT id FROM users WHERE email = 'admin@academy.com')
);
```

## Cross-Location Reporting Queries

### Location Performance Comparison
```sql
-- Compare performance across locations
SELECT 
    l.name,
    l.code,
    la.total_students,
    la.session_utilization_percentage,
    la.total_revenue,
    la.profit_margin,
    la.average_rating
FROM locations l
LEFT JOIN location_analytics la ON l.id = la.location_id
WHERE la.period_type = 'monthly'
  AND la.analytics_date = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND l.is_active = true
ORDER BY la.total_revenue DESC;
```

### Student Distribution Report
```sql
-- Student distribution across locations
SELECT 
    l.name as location_name,
    COUNT(s.id) as total_students,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_students,
    COUNT(CASE WHEN s.enrollment_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_students_30_days
FROM locations l
LEFT JOIN students s ON l.id = s.location_id
WHERE l.is_active = true
GROUP BY l.id, l.name
ORDER BY total_students DESC;
```

### Cross-Location Instructor Utilization
```sql
-- Instructor utilization across multiple locations
SELECT 
    i.first_name || ' ' || i.last_name as instructor_name,
    COUNT(DISTINCT ila.location_id) as locations_assigned,
    l.name as primary_location,
    SUM(ila.total_sessions_taught) as total_sessions,
    AVG(ila.average_rating) as overall_rating
FROM instructors i
JOIN instructor_location_assignments ila ON i.id = ila.instructor_id
LEFT JOIN locations l ON ila.location_id = l.id AND ila.is_primary = true
WHERE ila.assignment_status = 'active'
GROUP BY i.id, i.first_name, i.last_name, l.name
HAVING COUNT(DISTINCT ila.location_id) > 1
ORDER BY total_sessions DESC;
```

## Maintenance and Analytics Procedures

### Daily Analytics Calculation
```sql
-- Calculate daily analytics for all locations
CREATE OR REPLACE FUNCTION calculate_daily_location_analytics(target_date DATE DEFAULT CURRENT_DATE) 
RETURNS VOID AS $$
DECLARE
    loc_record RECORD;
BEGIN
    FOR loc_record IN SELECT id FROM locations WHERE is_active = true LOOP
        INSERT INTO location_analytics (
            location_id, analytics_date, period_type,
            total_students, active_students, total_sessions, completed_sessions
        ) VALUES (
            loc_record.id, target_date, 'daily',
            (SELECT COUNT(*) FROM students WHERE location_id = loc_record.id),
            (SELECT COUNT(*) FROM students WHERE location_id = loc_record.id AND status = 'active'),
            (SELECT COUNT(*) FROM sessions WHERE location_id = loc_record.id AND DATE(start_time) = target_date),
            (SELECT COUNT(*) FROM sessions WHERE location_id = loc_record.id AND DATE(start_time) = target_date AND status = 'completed')
        )
        ON CONFLICT (location_id, analytics_date, period_type) 
        DO UPDATE SET
            total_students = EXCLUDED.total_students,
            active_students = EXCLUDED.active_students,
            total_sessions = EXCLUDED.total_sessions,
            completed_sessions = EXCLUDED.completed_sessions,
            calculated_at = CURRENT_TIMESTAMP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Location Cleanup Procedures
```sql
-- Archive old transfer records
CREATE OR REPLACE FUNCTION archive_old_transfers() RETURNS VOID AS $$
BEGIN
    -- Move transfers older than 3 years to archive table
    INSERT INTO student_location_history_archive 
    SELECT * FROM student_location_history 
    WHERE effective_date < CURRENT_DATE - INTERVAL '3 years';
    
    -- Delete archived records from main table
    DELETE FROM student_location_history 
    WHERE effective_date < CURRENT_DATE - INTERVAL '3 years';
    
    -- Log the archival
    INSERT INTO system_logs (log_type, message, created_at)
    VALUES ('data_archival', 'Archived student location history records older than 3 years', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;
```

This comprehensive location management schema provides robust multi-location support with performance optimization, data integrity, and comprehensive reporting capabilities for the Academy Management System.