# Database Schema Overview

## Current Implementation (PostgreSQL with Program Context)

### Core Tables

#### **users**
- `id` (UUID, PK)
- `username` (VARCHAR, UNIQUE)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (ENUM: super_admin, program_admin, program_coordinator, tutor)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### **programs**
- `id` (UUID, PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### **user_program_assignments** (Junction Table)
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `program_id` (UUID, FK → programs.id)
- `assigned_at` (TIMESTAMP)
- `assigned_by` (UUID, FK → users.id)

### Program-Scoped Tables

#### **courses**
- `id` (UUID, PK)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `name` (VARCHAR)
- `description` (TEXT)
- `level` (INTEGER)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### **students**
- `id` (UUID, PK)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `student_id` (VARCHAR, UNIQUE) - Generated format: STU-YYYY-NNNN
- `first_name`, `last_name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `date_of_birth` (DATE)
- `enrollment_date` (DATE)
- `status` (ENUM: active, inactive, graduated, withdrawn)
- Address, emergency contact, medical info (JSON fields)
- `created_at`, `updated_at` (TIMESTAMP)

#### **course_enrollments** ✅ **ENHANCED (2025-07-31)**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `course_id` (UUID, FK → courses.id)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `facility_id` (UUID, FK → facilities.id) ⭐ **🆕 Facility Assignment**
- `session_type` (VARCHAR) ⭐ **🆕 Session Configuration**
- `location_type` (VARCHAR) ⭐ **🆕 Location Configuration**
- `age_group` (VARCHAR) ⭐ **🆕 Age Group Classification**
- `status` (ENUM: active, paused, completed, withdrawn)
- `enrollment_date` (DATE)
- `completion_date` (DATE)
- `progress_percentage` (INTEGER)
- `credits_awarded` (INTEGER)
- `assignment_type` (ENUM: direct, parent_assigned, bulk_assigned)
- `assignment_notes` (TEXT)
- `assigned_by` (UUID, FK → users.id)
- `created_at`, `updated_at` (TIMESTAMP)

#### **facilities**
- `id` (UUID, PK)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `name` (VARCHAR)
- `facility_type` (ENUM: pool, court, gym, field, classroom, lab)
- `capacity` (INTEGER)
- `equipment` (JSON) - Array of equipment items
- `amenities` (JSON) - Array of amenities
- `status` (ENUM: active, maintenance, inactive)
- `created_at`, `updated_at` (TIMESTAMP)

#### **facility_course_pricing** ✅ **NEW (2025-07-30)**
- `id` (UUID, PK)
- `facility_id` (UUID, FK → facilities.id)
- `course_id` (UUID, FK → courses.id)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `age_group` (VARCHAR) - Age group classification
- `location_type` (VARCHAR) - Location type (our-facility, client-location, virtual)
- `session_type` (VARCHAR) - Session type (group, private, etc.)
- `price` (DECIMAL) - Actual price in NGN
- `is_active` (BOOLEAN)
- `effective_date` (DATE)
- `end_date` (DATE)
- `created_by` (UUID, FK → users.id)
- `updated_by` (UUID, FK → users.id)
- `created_at`, `updated_at` (TIMESTAMP)
- **UNIQUE INDEX**: `facility_id, course_id, age_group, location_type, session_type, is_active` (where is_active = true)

### Course Hierarchy (Program-Scoped)

#### **curricula**
- `id` (UUID, PK)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `course_id` (UUID, FK → courses.id)
- `name` (VARCHAR)
- `description` (TEXT)
- `sequence_order` (INTEGER)

#### **modules**
- `id` (UUID, PK)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `curriculum_id` (UUID, FK → curricula.id)
- `name` (VARCHAR)
- `description` (TEXT)
- `sequence_order` (INTEGER)

#### **lessons**
- `id` (UUID, PK)
- `program_id` (UUID, FK → programs.id) ⭐ **Program Context**
- `module_id` (UUID, FK → modules.id)
- `name` (VARCHAR)
- `content` (TEXT)
- `duration_minutes` (INTEGER)
- `sequence_order` (INTEGER)

### Database Features

#### **Program Context Enforcement**
- All program-scoped tables include `program_id` foreign key
- Database-level filtering via application middleware
- Index on `program_id` for performance
- Cascade deletes for data integrity

#### **UUID Primary Keys**
- All tables use UUID primary keys for security
- PostgreSQL `uuid-ossp` extension enabled
- Default UUID generation for new records

#### **Audit Fields**
- `created_at`, `updated_at` timestamps on all tables
- Automatic timestamp updates via database triggers
- Soft deletes where appropriate

#### **Indexes**
- Primary keys (automatic)
- `program_id` indexes on all program-scoped tables
- `email` unique indexes
- Performance indexes on commonly queried fields

## Migration Management

### Alembic Configuration
- Migration files in `backend/alembic/versions/`
- Environment-based configuration
- Automatic migrations on Docker startup
- Version control for schema changes

### Current Migrations
- `001_initial_tables.py` - Core user/program tables
- `002_simple_curriculum_tables.py` - Course hierarchy tables
- `003_create_facilities_table_simple.py` - Facility management
- `a6986e2e95a0_add_user_program_assignments_table.py` - Program assignments
- **🆕 2025-07-30**: `facility_course_pricing` table creation
- **🆕 2025-07-31**: `course_enrollments` enhancement with facility assignment fields

## Data Isolation

### Security Features
- Program context filtering at service layer
- Role-based access control
- No cross-program data access (except Super Admin)
- Automatic program context injection via HTTP headers

### Performance Considerations
- Indexed program_id for fast filtering
- Optimized queries with program context
- Connection pooling for concurrent access
- Query optimization for large datasets

## 🏢 **Multi-Facility Course System (2025-07-31)**

### **Enhanced Schema Features**
- **Facility-Specific Enrollments**: Each course enrollment assigned to specific facility
- **Session Configuration Storage**: Session type, location type, age group per enrollment
- **Multi-Facility Support**: Students can enroll in same course at different facilities
- **Pricing Matrix Integration**: Links to facility-specific course pricing

### **Key Relationships**
```sql
-- Course enrollment with facility assignment
course_enrollments.facility_id → facilities.id
course_enrollments.user_id → users.id (students/parents)
course_enrollments.course_id → courses.id

-- Facility-specific pricing
facility_course_pricing.facility_id → facilities.id
facility_course_pricing.course_id → courses.id
facility_course_pricing(age_group, location_type, session_type) matches course_enrollments
```

### **Data Integrity Constraints**
- **Unique Active Pricing**: Only one active price per facility+course+configuration combination
- **Enrollment Validation**: Course enrollment configurations must have corresponding pricing entries
- **Program Context**: All facility and pricing operations scoped by program assignments
- **Assignment Tracking**: Full audit trail for who assigned students to facilities and when