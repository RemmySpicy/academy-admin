# Database Schema Overview

## Database Overview

The Academy Management System uses PostgreSQL as the primary database with a comprehensive schema designed to support multi-location academy operations, complex curriculum hierarchies, and advanced scheduling systems.

## Schema Design Principles

- **UUID Primary Keys**: All tables use UUID primary keys for better security and distributed system support
- **Audit Trails**: All major entities include created_at and updated_at timestamps
- **Soft Deletes**: Critical data uses soft delete patterns with is_active flags
- **Referential Integrity**: Foreign key constraints maintain data consistency
- **Performance Optimization**: Strategic indexes for common query patterns
- **Multi-Location Support**: Location-specific data segregation built from the ground up

## Database Schema Organization

### Core Entity Groups

#### 1. Authentication & User Management
- **users** - System users (Super Admin, Program Admin)
- **user_program_assignments** - User-to-program access mappings
- **password_reset_tokens** - Secure password reset functionality
- **auth_audit_log** - Authentication event logging

#### 2. Location Management
- **locations** - Physical academy locations and facilities
- **location_programs** - Program availability per location
- **user_location_assignments** - User access permissions per location

#### 3. Program & Curriculum Hierarchy
- **programs** - Top-level programs (Swimming, Basketball, etc.)
- **courses** - Program subdivisions (Swimming Club, Adult Swimming)
- **curriculums** - Age-group based curriculum structures
- **levels** - Progressive skill levels within curriculums
- **modules** - Learning modules within levels
- **sections** - Detailed sections within modules
- **lessons** - Individual lesson content
- **assessment_rubrics** - 0-3 star rating criteria
- **equipment_requirements** - Level-based equipment needs

#### 4. Student & Family Management
- **students** - Student profiles and academic information
- **parents** - Parent/guardian profiles and contact information
- **student_parent_relationships** - Family relationship mappings
- **student_enrollments** - Course enrollment tracking
- **student_progress** - Academic progress and assessments
- **student_attendance** - Session attendance tracking
- **student_financial_records** - Payment and transaction history

#### 5. Scheduling & Session Management
- **sessions** - Individual and recurring session definitions
- **recurring_patterns** - Recurring session pattern definitions
- **session_bookings** - Student session reservations
- **instructor_availability** - Instructor schedule availability
- **schedule_conflicts** - Conflict tracking and resolution
- **session_waitlists** - Waitlist management for full sessions

#### 6. Instructor Management
- **instructors** - Instructor profiles and qualifications
- **instructor_location_assignments** - Multi-location instructor assignments
- **instructor_specializations** - Program/curriculum specialization tracking

## Entity Relationships Overview

### Core Relationships

```
Users (1:M) → User_Program_Assignments (M:1) → Programs
Users (1:M) → User_Location_Assignments (M:1) → Locations

Programs (1:M) → Courses (1:M) → Curriculums (1:M) → Levels
Levels (1:M) → Modules (1:M) → Sections (1:M) → Lessons
Levels (1:1) → Assessment_Rubrics
Levels (1:M) → Equipment_Requirements

Students (1:M) → Student_Parent_Relationships (M:1) → Parents
Students (1:M) → Student_Enrollments (M:1) → Curriculums
Students (1:M) → Student_Progress (M:1) → Levels
Students (1:M) → Student_Attendance (M:1) → Sessions
Students (1:M) → Student_Financial_Records

Sessions (1:M) → Session_Bookings (M:1) → Students
Sessions (M:1) → Instructors
Sessions (M:1) → Locations
Sessions (1:M) → Recurring_Patterns (optional)

Instructors (1:M) → Instructor_Location_Assignments (M:1) → Locations
Instructors (1:M) → Instructor_Specializations (M:1) → Programs
```

## Database Performance Considerations

### Indexing Strategy

#### Primary Indexes
- All primary keys (UUID) have automatic B-tree indexes
- Foreign key columns have covering indexes
- Composite indexes for common multi-column queries

#### Query-Specific Indexes
- **Student searches**: (location_id, program_id, last_name)
- **Schedule queries**: (session_date, location_id, instructor_id)
- **Attendance tracking**: (student_id, session_date)
- **Financial records**: (student_id, transaction_date, status)
- **Parent lookups**: (email, phone, location_id)

#### Full-Text Search Indexes
- Student names and contact information
- Lesson content and descriptions
- Program and curriculum names

### Query Optimization

#### Partitioning Strategy
- **session_bookings**: Partitioned by session_date (monthly)
- **student_attendance**: Partitioned by attendance_date (monthly)
- **auth_audit_log**: Partitioned by created_at (monthly)

#### Materialized Views
- **student_progress_summary**: Current progress across all students
- **location_capacity_summary**: Real-time capacity tracking
- **instructor_schedule_summary**: Weekly instructor availability

## Data Migration Strategy

### Migration Phases

#### Phase 1: Core Schema
1. Authentication and user management tables
2. Location and program structure
3. Basic student and parent entities

#### Phase 2: Curriculum Hierarchy
1. Program and course definitions
2. 7-level curriculum structure
3. Assessment rubric system

#### Phase 3: Scheduling System
1. Session and booking tables
2. Instructor availability system
3. Conflict resolution tables

#### Phase 4: Advanced Features
1. Financial tracking integration
2. Attendance and progress systems
3. Reporting and analytics views

### Data Seeding Strategy

#### Initial Data Requirements
- **Super Admin User**: System administrator account
- **Sample Programs**: Swimming, Basketball, Football
- **Sample Locations**: Primary academy locations
- **Base Curriculum**: Foundational curriculum structure
- **Equipment Library**: Common equipment definitions

## Security Considerations

### Row-Level Security (RLS)
- **Program-specific access**: Users can only access assigned programs
- **Location-specific access**: Data segregation by location
- **Parent-child access**: Parents can only access their children's data

### Data Encryption
- **Sensitive fields**: Email, phone numbers, addresses
- **Financial data**: Transaction amounts and payment information
- **Authentication data**: Password hashes and reset tokens

### Audit Logging
- **Authentication events**: Login attempts, password changes
- **Data modifications**: Create, update, delete operations on critical entities
- **Administrative actions**: User management, program assignments

## Backup and Recovery

### Backup Strategy
- **Daily full backups**: Complete database backup
- **Hourly incremental backups**: Transaction log backups
- **Weekly backup validation**: Restore testing procedures

### Recovery Procedures
- **Point-in-time recovery**: Restore to specific transaction
- **Partial recovery**: Location or program-specific data recovery
- **Disaster recovery**: Multi-region backup replication

## Database Monitoring

### Performance Metrics
- **Query performance**: Slow query identification and optimization
- **Connection monitoring**: Connection pool utilization
- **Lock monitoring**: Deadlock detection and resolution
- **Storage monitoring**: Table and index size tracking

### Alerting Thresholds
- **Connection limits**: > 80% of max connections
- **Query performance**: Queries > 1 second execution time
- **Storage capacity**: > 85% disk utilization
- **Replication lag**: > 5 minutes behind primary

## Scalability Considerations

### Horizontal Scaling
- **Read replicas**: Multiple read-only database instances
- **Connection pooling**: PgBouncer for connection management
- **Caching layer**: Redis for frequently accessed data

### Vertical Scaling
- **Memory optimization**: Shared buffers and work memory tuning
- **CPU optimization**: Query parallelization settings
- **Storage optimization**: SSD storage with appropriate IOPS

## Development and Testing

### Database Environments
- **Local Development**: Docker PostgreSQL containers
- **Testing Environment**: Isolated test database with sample data
- **Staging Environment**: Production-like environment for integration testing
- **Production Environment**: High-availability PostgreSQL cluster

### Testing Data
- **Sample Students**: 100+ realistic student profiles
- **Sample Schedules**: 6 months of realistic session data
- **Sample Progress**: Realistic assessment and attendance data
- **Load Testing**: 1000+ concurrent user simulation data