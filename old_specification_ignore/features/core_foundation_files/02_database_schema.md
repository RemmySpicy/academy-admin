# Database Schema - Elitesgen Academy Management System

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy with async support
- **Migrations**: Alembic for schema versioning
- **Connection**: psycopg2-binary for PostgreSQL connectivity

### Schema Design Principles
- **Normalized Structure**: Efficient relational design with minimal redundancy
- **Multi-Location Support**: Facility-based data segregation from launch
- **Scalable Hierarchy**: Support for 7-level curriculum structure
- **Audit Trail**: Created/updated timestamps on all entities
- **Soft Deletes**: Logical deletion with `is_active` flags for data integrity
- **Indexing Strategy**: Optimized indexes for frequent query patterns

## Core Entity Relationships

### Primary Entities Overview
```
Organizations → Facilities → Programs → Courses → Curriculums → Levels → Modules → Sections → Lessons
                     ↓
Students ←→ Parents (One-to-Many relationship)
    ↓
Enrollments → Sessions → Attendance
    ↓
Assessments → Progress Tracking
```

## Detailed Schema Definitions

### 1. Authentication & User Management

#### users
- **Purpose**: System authentication for admin users
- **Fields**:
  - `id` (UUID, Primary Key)
  - `email` (String, Unique, Not Null)
  - `password_hash` (String, Not Null)
  - `first_name` (String, Not Null)
  - `last_name` (String, Not Null)
  - `role` (Enum: 'super_admin', 'program_admin')
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### user_program_assignments
- **Purpose**: Many-to-many relationship for Program Admin access
- **Fields**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → users.id)
  - `program_id` (UUID, Foreign Key → programs.id)
  - `created_at` (DateTime, Auto)

### 2. Organizational Structure

#### organizations
- **Purpose**: Top-level academy organization
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Not Null) # "Elitesgen Academy"
  - `description` (Text)
  - `contact_email` (String)
  - `contact_phone` (String)
  - `address` (JSONB) # {country, state, city, full_address}
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### facilities
- **Purpose**: Physical locations/branches
- **Fields**:
  - `id` (UUID, Primary Key)
  - `organization_id` (UUID, Foreign Key → organizations.id)
  - `name` (String, Not Null)
  - `address` (JSONB) # {country, state, city, full_address}
  - `contact_phone` (String)
  - `contact_email` (String)
  - `operating_hours` (JSONB) # Structured schedule data
  - `capacity_settings` (JSONB) # Group/private session limits
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### programs
- **Purpose**: Sports/activity programs (Swimming, Football, etc.)
- **Fields**:
  - `id` (UUID, Primary Key)
  - `organization_id` (UUID, Foreign Key → organizations.id)
  - `name` (String, Not Null)
  - `description` (Text)
  - `color_code` (String) # UI theming
  - `icon` (String) # UI icon identifier
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### facility_programs
- **Purpose**: Many-to-many relationship between facilities and programs
- **Fields**:
  - `id` (UUID, Primary Key)
  - `facility_id` (UUID, Foreign Key → facilities.id)
  - `program_id` (UUID, Foreign Key → programs.id)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)

### 3. Curriculum Structure (7-Level Hierarchy)

#### courses
- **Purpose**: Program offerings (e.g., Swimming Club, Adult Swimming)
- **Fields**:
  - `id` (UUID, Primary Key)
  - `program_id` (UUID, Foreign Key → programs.id)
  - `name` (String, Not Null)
  - `description` (Text)
  - `duration_weeks` (Integer) # Typical course duration
  - `min_age` (Integer)
  - `max_age` (Integer)
  - `prerequisites` (JSONB) # Array of prerequisite course IDs
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### curriculums
- **Purpose**: Age-group specific curriculum versions
- **Fields**:
  - `id` (UUID, Primary Key)
  - `course_id` (UUID, Foreign Key → courses.id)
  - `name` (String, Not Null) # e.g., "Swimming Club: 3-5"
  - `description` (Text)
  - `min_age` (Integer, Not Null)
  - `max_age` (Integer, Not Null)
  - `total_levels` (Integer, Not Null)
  - `estimated_duration_weeks` (Integer)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### levels
- **Purpose**: Progressive skill levels within curriculum
- **Fields**:
  - `id` (UUID, Primary Key)
  - `curriculum_id` (UUID, Foreign Key → curriculums.id)
  - `level_number` (Integer, Not Null)
  - `name` (String, Not Null) # e.g., "Level 1"
  - `description` (Text)
  - `learning_objectives` (JSONB) # Array of learning objectives
  - `equipment_requirements` (JSONB) # Required equipment list
  - `estimated_sessions` (Integer)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### modules
- **Purpose**: Learning modules within levels
- **Fields**:
  - `id` (UUID, Primary Key)
  - `level_id` (UUID, Foreign Key → levels.id)
  - `module_number` (Integer, Not Null)
  - `name` (String, Not Null) # e.g., "Module 1"
  - `description` (Text)
  - `learning_outcomes` (JSONB) # Expected outcomes
  - `sequence_order` (Integer, Not Null)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### sections
- **Purpose**: Detailed sections within modules
- **Fields**:
  - `id` (UUID, Primary Key)
  - `module_id` (UUID, Foreign Key → modules.id)
  - `section_number` (Integer, Not Null)
  - `name` (String, Not Null) # e.g., "Section 1: Introduction to Frog Kick"
  - `description` (Text)
  - `sequence_order` (Integer, Not Null)
  - `estimated_duration_minutes` (Integer)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### lessons
- **Purpose**: Individual lesson content
- **Fields**:
  - `id` (UUID, Primary Key)
  - `section_id` (UUID, Foreign Key → sections.id)
  - `lesson_id` (String, Not Null) # e.g., "L101"
  - `title` (String, Not Null)
  - `description` (Text)
  - `instructor_guidelines` (Text)
  - `difficulty_level` (Enum: 'beginner', 'intermediate', 'advanced')
  - `content_type` (Enum: 'practical', 'theory', 'assessment')
  - `media_links` (JSONB) # Array of video/document URLs
  - `sequence_order` (Integer, Not Null)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 4. Assessment System

#### assessment_rubrics
- **Purpose**: Assessment criteria packages per level
- **Fields**:
  - `id` (UUID, Primary Key)
  - `level_id` (UUID, Foreign Key → levels.id)
  - `name` (String, Not Null)
  - `description` (Text)
  - `rubric_items` (JSONB) # Array of assessment criteria
  - `passing_criteria` (JSONB) # Requirements for level completion
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### rubric_items
- **Purpose**: Individual assessment criteria
- **Fields**:
  - `id` (UUID, Primary Key)
  - `assessment_rubric_id` (UUID, Foreign Key → assessment_rubrics.id)
  - `name` (String, Not Null)
  - `description` (Text)
  - `skill_category` (String) # e.g., "technique", "safety", "endurance"
  - `assessment_criteria` (JSONB) # 0-3 star criteria definitions
  - `sequence_order` (Integer, Not Null)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 5. Student & Parent Management

#### parents
- **Purpose**: Parent/guardian accounts
- **Fields**:
  - `id` (UUID, Primary Key)
  - `salutation` (String) # Mr., Mrs., Dr., etc.
  - `first_name` (String, Not Null)
  - `last_name` (String, Not Null)
  - `email` (String, Unique, Not Null)
  - `phone` (String, Not Null)
  - `address` (JSONB) # {country, state, city, full_address}
  - `emergency_contact` (JSONB) # Emergency contact information
  - `preferred_communication` (Enum: 'email', 'sms', 'both')
  - `app_access_enabled` (Boolean, Default False)
  - `password_hash` (String) # For parent app access
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### students
- **Purpose**: Student profiles and information
- **Fields**:
  - `id` (UUID, Primary Key)
  - `parent_id` (UUID, Foreign Key → parents.id)
  - `salutation` (String)
  - `first_name` (String, Not Null)
  - `last_name` (String, Not Null)
  - `email` (String) # Optional for older students
  - `phone` (String) # Optional for older students
  - `date_of_birth` (Date, Not Null)
  - `gender` (Enum: 'male', 'female', 'other', 'prefer_not_to_say')
  - `address` (JSONB) # Inherits from parent if not specified
  - `medical_conditions` (Text) # Important medical information
  - `emergency_contact` (JSONB) # Additional emergency contact
  - `referral_source` (String) # How they found the academy
  - `notes` (Text) # Additional notes about the student
  - `app_access_enabled` (Boolean, Default False)
  - `password_hash` (String) # For student app access
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 6. Instructor Management

#### instructors
- **Purpose**: Instructor profiles and capabilities
- **Fields**:
  - `id` (UUID, Primary Key)
  - `employee_id` (String, Unique) # Internal employee identifier
  - `first_name` (String, Not Null)
  - `last_name` (String, Not Null)
  - `email` (String, Unique, Not Null)
  - `phone` (String, Not Null)
  - `address` (JSONB)
  - `hire_date` (Date, Not Null)
  - `certifications` (JSONB) # Array of certifications
  - `emergency_contact` (JSONB)
  - `hourly_rate` (Decimal) # Compensation information
  - `app_access_enabled` (Boolean, Default False)
  - `password_hash` (String) # For instructor app access
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### instructor_specializations
- **Purpose**: Programs/courses an instructor can teach
- **Fields**:
  - `id` (UUID, Primary Key)
  - `instructor_id` (UUID, Foreign Key → instructors.id)
  - `program_id` (UUID, Foreign Key → programs.id)
  - `course_id` (UUID, Foreign Key → courses.id, Nullable)
  - `proficiency_level` (Enum: 'beginner', 'intermediate', 'advanced', 'expert')
  - `certification_date` (Date)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### instructor_facility_assignments
- **Purpose**: Facilities where instructor can work
- **Fields**:
  - `id` (UUID, Primary Key)
  - `instructor_id` (UUID, Foreign Key → instructors.id)
  - `facility_id` (UUID, Foreign Key → facilities.id)
  - `is_primary` (Boolean, Default False)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)

### 7. Enrollment & Course Management

#### enrollments
- **Purpose**: Student enrollment in specific courses
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (UUID, Foreign Key → students.id)
  - `course_id` (UUID, Foreign Key → courses.id)
  - `curriculum_id` (UUID, Foreign Key → curriculums.id)
  - `facility_id` (UUID, Foreign Key → facilities.id)
  - `instructor_id` (UUID, Foreign Key → instructors.id, Nullable)
  - `enrollment_date` (Date, Not Null)
  - `start_date` (Date)
  - `expected_end_date` (Date)
  - `actual_end_date` (Date, Nullable)
  - `enrollment_status` (Enum: 'active', 'completed', 'withdrawn', 'suspended')
  - `session_type` (Enum: 'group', 'private', 'semi_private')
  - `sessions_purchased` (Integer, Not Null)
  - `sessions_used` (Integer, Default 0)
  - `sessions_remaining` (Integer, Computed)
  - `payment_status` (Enum: 'pending', 'partial', 'paid', 'overdue')
  - `total_amount` (Decimal)
  - `amount_paid` (Decimal, Default 0)
  - `balance_due` (Decimal, Computed)
  - `notes` (Text)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 8. Scheduling & Session Management

#### sessions
- **Purpose**: Individual lesson sessions
- **Fields**:
  - `id` (UUID, Primary Key)
  - `facility_id` (UUID, Foreign Key → facilities.id)
  - `program_id` (UUID, Foreign Key → programs.id)
  - `course_id` (UUID, Foreign Key → courses.id)
  - `instructor_id` (UUID, Foreign Key → instructors.id)
  - `session_date` (Date, Not Null)
  - `start_time` (Time, Not Null)
  - `end_time` (Time, Not Null)
  - `session_type` (Enum: 'group', 'private', 'semi_private', 'school')
  - `max_capacity` (Integer, Not Null)
  - `current_enrollment` (Integer, Default 0)
  - `session_status` (Enum: 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')
  - `curriculum_content` (JSONB) # Planned lesson content
  - `actual_content_delivered` (JSONB) # What was actually taught
  - `cancellation_reason` (Text, Nullable)
  - `notes` (Text)
  - `recurring_session_id` (UUID, Nullable) # Links to recurring session pattern
  - `is_makeup_session` (Boolean, Default False)
  - `original_session_id` (UUID, Nullable) # Reference to original if makeup
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### session_enrollments
- **Purpose**: Students enrolled in specific sessions
- **Fields**:
  - `id` (UUID, Primary Key)
  - `session_id` (UUID, Foreign Key → sessions.id)
  - `enrollment_id` (UUID, Foreign Key → enrollments.id)
  - `student_id` (UUID, Foreign Key → students.id)
  - `enrollment_status` (Enum: 'enrolled', 'attended', 'absent', 'cancelled')
  - `attendance_marked_at` (DateTime, Nullable)
  - `attendance_marked_by` (UUID, Foreign Key → users.id, Nullable)
  - `notes` (Text)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### recurring_sessions
- **Purpose**: Templates for recurring session patterns
- **Fields**:
  - `id` (UUID, Primary Key)
  - `facility_id` (UUID, Foreign Key → facilities.id)
  - `instructor_id` (UUID, Foreign Key → instructors.id)
  - `program_id` (UUID, Foreign Key → programs.id)
  - `course_id` (UUID, Foreign Key → courses.id)
  - `name` (String, Not Null) # e.g., "Monday Swimming Group"
  - `session_type` (Enum: 'group', 'private', 'semi_private')
  - `max_capacity` (Integer, Not Null)
  - `day_of_week` (Integer, Not Null) # 0=Monday, 6=Sunday
  - `start_time` (Time, Not Null)
  - `end_time` (Time, Not Null)
  - `start_date` (Date, Not Null)
  - `end_date` (Date, Nullable)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 9. Progress & Assessment Tracking

#### student_progress
- **Purpose**: Student progression through curriculum
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (UUID, Foreign Key → students.id)
  - `enrollment_id` (UUID, Foreign Key → enrollments.id)
  - `level_id` (UUID, Foreign Key → levels.id)
  - `module_id` (UUID, Foreign Key → modules.id, Nullable)
  - `section_id` (UUID, Foreign Key → sections.id, Nullable)
  - `progress_status` (Enum: 'not_started', 'in_progress', 'completed', 'mastered')
  - `start_date` (Date)
  - `completion_date` (Date, Nullable)
  - `attempts` (Integer, Default 0)
  - `best_score` (Decimal, Nullable) # 0-3 star rating
  - `instructor_notes` (Text)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### assessments
- **Purpose**: Individual assessment records
- **Fields**:
  - `id` (UUID, Primary Key)
  - `student_id` (UUID, Foreign Key → students.id)
  - `instructor_id` (UUID, Foreign Key → instructors.id)
  - `session_id` (UUID, Foreign Key → sessions.id)
  - `assessment_rubric_id` (UUID, Foreign Key → assessment_rubrics.id)
  - `level_id` (UUID, Foreign Key → levels.id)
  - `assessment_date` (Date, Not Null)
  - `overall_score` (Decimal, Not Null) # 0-3 star rating
  - `assessment_type` (Enum: 'formative', 'summative', 'diagnostic')
  - `assessment_results` (JSONB) # Detailed rubric item scores
  - `instructor_feedback` (Text)
  - `recommendations` (Text)
  - `next_steps` (Text)
  - `is_final` (Boolean, Default False) # Final assessment for level completion
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 10. Financial Integration

#### transactions
- **Purpose**: Payment transactions and Zoho Books integration
- **Fields**:
  - `id` (UUID, Primary Key)
  - `enrollment_id` (UUID, Foreign Key → enrollments.id)
  - `parent_id` (UUID, Foreign Key → parents.id)
  - `zoho_books_invoice_id` (String, Nullable) # External reference
  - `zoho_books_payment_id` (String, Nullable) # External reference
  - `transaction_date` (Date, Not Null)
  - `transaction_type` (Enum: 'payment', 'refund', 'credit', 'adjustment')
  - `amount` (Decimal, Not Null)
  - `currency` (String, Default 'USD')
  - `payment_method` (Enum: 'cash', 'card', 'bank_transfer', 'online', 'check')
  - `payment_status` (Enum: 'pending', 'paid', 'failed', 'refunded')
  - `reference_number` (String) # Receipt or reference number
  - `description` (Text)
  - `notes` (Text)
  - `processed_by` (UUID, Foreign Key → users.id, Nullable)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### session_credits
- **Purpose**: Track remaining session credits per enrollment
- **Fields**:
  - `id` (UUID, Primary Key)
  - `enrollment_id` (UUID, Foreign Key → enrollments.id)
  - `student_id` (UUID, Foreign Key → students.id)
  - `credit_type` (Enum: 'regular', 'makeup', 'bonus', 'refund')
  - `credits_purchased` (Integer, Not Null)
  - `credits_used` (Integer, Default 0)
  - `credits_remaining` (Integer, Computed)
  - `expiry_date` (Date, Nullable)
  - `purchase_date` (Date, Not Null)
  - `notes` (Text)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 11. Notification & Communication System

#### notifications
- **Purpose**: System notifications and reminders
- **Fields**:
  - `id` (UUID, Primary Key)
  - `recipient_id` (UUID, Not Null) # Parent, Student, or Instructor ID
  - `recipient_type` (Enum: 'parent', 'student', 'instructor', 'admin')
  - `notification_type` (Enum: 'session_reminder', 'payment_due', 'assessment_result', 'schedule_change', 'general')
  - `title` (String, Not Null)
  - `message` (Text, Not Null)
  - `delivery_channels` (JSONB) # Array: ['email', 'sms', 'push', 'in_app']
  - `priority` (Enum: 'low', 'medium', 'high', 'urgent')
  - `scheduled_for` (DateTime, Not Null)
  - `sent_at` (DateTime, Nullable)
  - `delivery_status` (JSONB) # Status per channel
  - `related_entity_type` (String, Nullable) # e.g., 'session', 'enrollment'
  - `related_entity_id` (UUID, Nullable)
  - `template_id` (UUID, Nullable) # Reference to message template
  - `personalization_data` (JSONB) # Data for template rendering
  - `is_read` (Boolean, Default False)
  - `read_at` (DateTime, Nullable)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### notification_templates
- **Purpose**: Reusable notification templates
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Not Null)
  - `description` (Text)
  - `template_type` (Enum: 'session_reminder', 'payment_due', 'assessment_result', 'schedule_change')
  - `subject_template` (String, Not Null) # Jinja2 template for subject
  - `email_template` (Text) # HTML email template
  - `sms_template` (Text) # SMS message template
  - `push_template` (Text) # Push notification template
  - `default_channels` (JSONB) # Default delivery channels
  - `timing_rules` (JSONB) # When to send (e.g., 1 day before)
  - `is_active` (Boolean, Default True)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

### 12. System Configuration & Settings

#### system_settings
- **Purpose**: Global system configuration
- **Fields**:
  - `id` (UUID, Primary Key)
  - `setting_category` (String, Not Null) # e.g., 'scheduling', 'notifications', 'billing'
  - `setting_key` (String, Not Null)
  - `setting_value` (JSONB, Not Null)
  - `setting_type` (Enum: 'string', 'integer', 'boolean', 'json', 'decimal')
  - `description` (Text)
  - `is_user_configurable` (Boolean, Default False)
  - `requires_restart` (Boolean, Default False)
  - `updated_by` (UUID, Foreign Key → users.id, Nullable)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

#### facility_settings
- **Purpose**: Facility-specific configuration overrides
- **Fields**:
  - `id` (UUID, Primary Key)
  - `facility_id` (UUID, Foreign Key → facilities.id)
  - `setting_key` (String, Not Null)
  - `setting_value` (JSONB, Not Null)
  - `overrides_global` (Boolean, Default True)
  - `updated_by` (UUID, Foreign Key → users.id, Nullable)
  - `created_at` (DateTime, Auto)
  - `updated_at` (DateTime, Auto)

## Database Indexes & Performance Optimization

### Primary Indexes
- **users**: `email` (unique), `role`, `is_active`
- **students**: `parent_id`, `email`, `date_of_birth`, `is_active`
- **parents**: `email` (unique), `phone`, `is_active`
- **instructors**: `email` (unique), `employee_id` (unique), `is_active`
- **sessions**: `facility_id`, `instructor_id`, `session_date`, `start_time`, `session_status`
- **enrollments**: `student_id`, `course_id`, `facility_id`, `enrollment_status`, `is_active`
- **assessments**: `student_id`, `instructor_id`, `session_id`, `assessment_date`
- **transactions**: `enrollment_id`, `parent_id`, `transaction_date`, `payment_status`

### Composite Indexes
- **session_enrollments**: `(session_id, student_id)` (unique), `(student_id, session_id)`
- **student_progress**: `(student_id, level_id)`, `(enrollment_id, level_id)`
- **instructor_specializations**: `(instructor_id, program_id)`, `(program_id, instructor_id)`
- **user_program_assignments**: `(user_id, program_id)` (unique)
- **facility_programs**: `(facility_id, program_id)` (unique)

### Full-Text Search Indexes
- **students**: `first_name`, `last_name`, `email`
- **parents**: `first_name`, `last_name`, `email`
- **instructors**: `first_name`, `last_name`, `email`
- **lessons**: `title`, `description`

## Data Integrity Constraints

### Business Logic Constraints
- **Age Validation**: Student age must be within curriculum age range
- **Session Capacity**: Current enrollment cannot exceed max capacity
- **Schedule Conflicts**: Instructor cannot have overlapping sessions
- **Credit Balance**: Sessions used cannot exceed sessions purchased
- **Assessment Scores**: Must be between 0 and 3 (star rating system)
- **Parent-Child Limit**: One student can have only one parent
- **Facility Program**: Programs must be available at the facility

### Foreign Key Relationships
- **Cascade Deletes**: None (use soft deletes with `is_active` flag)
- **Restrict Deletes**: All foreign key relationships restrict deletion
- **Orphan Prevention**: All child records must have valid parent references

## Migration Strategy

### Initial Schema Creation
- **Phase 1**: Core entities (organizations, facilities, programs, users)
- **Phase 2**: Curriculum hierarchy (courses → lessons)
- **Phase 3**: Student/parent management and enrollments
- **Phase 4**: Scheduling and session management
- **Phase 5**: Assessment and progress tracking
- **Phase 6**: Financial integration and notifications

### Data Seeding Requirements
- **Default Organization**: Elitesgen Academy
- **Initial Facilities**: Current physical locations
- **Base Programs**: Swimming, Football, Basketball
- **Admin Users**: Super Admin and initial Program Admins
- **System Settings**: Default configuration values
- **Notification Templates**: Standard message templates

## Performance Considerations

### Query Optimization
- **Connection Pooling**: SQLAlchemy async connection pools
- **Query Caching**: Redis caching for frequently accessed data
- **Lazy Loading**: Relationship loading strategies for optimal performance
- **Batch Operations**: Bulk insert/update operations for large datasets

### Scaling Strategies
- **Read Replicas**: For reporting and analytics queries
- **Partitioning**: Session and transaction tables by date ranges
- **Archiving**: Historical data archival for completed enrollments
- **Monitoring**: Query performance monitoring and optimization

### Data Security
- **Encryption**: Sensitive data encryption at rest and in transit
- **Access Control**: Row-level security for multi-facility data
- **Audit Trail**: Comprehensive audit logging for all data changes
- **Backup Strategy**: Automated daily backups with point-in-time recovery

This comprehensive database schema provides the foundation for a scalable, efficient academy management system that supports complex curriculum hierarchies, multi-location operations, and detailed progress tracking while maintaining data integrity and performance.