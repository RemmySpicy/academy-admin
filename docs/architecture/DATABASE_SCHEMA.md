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