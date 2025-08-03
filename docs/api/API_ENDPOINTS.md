# API Endpoints Reference

## Base URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Currency Standard
**All monetary values in the API are denominated in Nigerian Naira (NGN)**
- Facility access fees, course prices, and all financial data use NGN
- Frontend should display amounts with proper NGN formatting

## Authentication Endpoints ✅
- `POST /api/v1/auth/login/json` - **PRIMARY**: JSON-based login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user with role and program assignments

## 🆕 Unified User Creation Workflows ✅ (DEPLOYED - 2025-01-29)
**Streamlined workflows for program administrators - 2 new endpoints**

### Unified Student Creation
- `POST /api/v1/students/create-with-program` - **NEW**: Create student with automatic program association and optional course enrollment

### Unified Parent Creation  
- `POST /api/v1/parents/create-with-program` - **NEW**: Create parent with automatic program association and optional child relationships

**Key Features:**
- Single atomic transaction for complete user setup
- Automatic program assignment from admin's context
- Proper error handling and rollback on failures
- Validation of admin permissions
- Optional immediate course enrollment for students
- Optional child relationship creation for parents
- **✅ Auto-Generated Full Name**: System automatically generates `full_name` from `first_name + " " + last_name`
- **🔐 Program Admin Access**: Program admins can create student/parent users within their assigned programs

## 🆕 Course Assignment System ✅ (DEPLOYED - 2025-01-28)
**Two-step workflow for student/parent creation and course assignment - 12 endpoints**

### Core Assignment Operations (4 endpoints)
- `POST /api/v1/course-assignments/assign` - Individual course assignment
- `POST /api/v1/course-assignments/bulk-assign` - Bulk course assignments
- `POST /api/v1/course-assignments/assign-multiple-users` - Assign multiple users to one course
- `POST /api/v1/course-assignments/assign-multiple-courses` - Assign one user to multiple courses
- `DELETE /api/v1/course-assignments/remove/{user_id}/{course_id}` - Remove assignment

### User Search & Eligibility (5 endpoints)
- `POST /api/v1/course-assignments/search-users` - Advanced user search with filtering
- `GET /api/v1/course-assignments/search-assignable-students` - Search students for assignment
- `GET /api/v1/course-assignments/search-assignable-parents` - Search parents for assignment  
- `GET /api/v1/course-assignments/check-eligibility/{user_id}/{course_id}` - Check assignment eligibility
- `GET /api/v1/course-assignments/user-program-status/{user_id}` - Get user program status

### Assignment Management (3 endpoints)
- `GET /api/v1/course-assignments/user-assignments/{user_id}` - Get user's course assignments
- `GET /api/v1/course-assignments/assignable-courses` - Get courses available for assignment
- `GET /api/v1/course-assignments/user-course-assignments/{user_id}` - Get user course assignment details

**📖 Complete Documentation**: [`docs/api/COURSE_ASSIGNMENT_API.md`](COURSE_ASSIGNMENT_API.md)  
**🔧 Deployment Status**: ✅ All endpoints deployed and accessible via `/docs`

## Program Management ✅ **ENHANCED (2025-08-02)**

### Core Program Operations
- `GET /api/v1/programs` - List programs (role-filtered)
- `POST /api/v1/programs` - Create program (Super Admin only)
- `GET /api/v1/programs/{id}` - **ENHANCED**: Get specific program with configuration data
- `PUT /api/v1/programs/{id}` - Update program (includes configuration fields)
- `DELETE /api/v1/programs/{id}` - Delete program (Super Admin only)

### 🆕 Configuration Integration ✅ **NEW (2025-08-02)**
Program responses now include configuration fields for cross-feature integration:

```json
{
  "id": "program-uuid",
  "name": "Swimming Program",
  "program_code": "SWIM", 
  "age_groups": [
    {"id": "6-8", "name": "6-8 years", "from_age": 6, "to_age": 8},
    {"id": "9-12", "name": "9-12 years", "from_age": 9, "to_age": 12}
  ],
  "difficulty_levels": [
    {"id": "beginner", "name": "Beginner", "weight": 1},
    {"id": "intermediate", "name": "Intermediate", "weight": 2}
  ],
  "session_types": [
    {"id": "private", "name": "Private", "capacity": 1},
    {"id": "group", "name": "Group", "capacity": 6}
  ],
  "default_session_duration": 45
}
```

**Configuration Fields**:
- `age_groups`: Age range definitions for course/curriculum targeting
- `difficulty_levels`: Progression structure with sortable weights  
- `session_types`: Available session types with capacity limits
- `default_session_duration`: Default duration for new sessions (15-300 minutes)

### 🆕 Program Statistics ✅ **NEW (2025-08-02)**
- `GET /api/v1/programs/{id}/statistics` - **NEW**: Get comprehensive program statistics

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "program_id": "8482438e-34b1-42fa-8653-7688866a012b",
    "program_name": "Swimming",
    "courses": {
      "total": 7,
      "active": 4,
      "inactive": 3
    },
    "students": {
      "total": 7,
      "active": 3,
      "inactive": 4
    },
    "team": {
      "total_members": 14
    },
    "facilities": {
      "total": 3
    },
    "configuration": {
      "age_groups": 2,
      "difficulty_levels": 3,
      "session_types": 2,
      "default_duration": 45
    }
  }
}
```

**Statistics Breakdown**:
- **Courses**: Total count and breakdown by status (`published` = active, `draft` = inactive)
- **Students**: Total enrollment and status breakdown (`active`, `inactive`, `graduated`, `suspended`)
- **Team**: Count of users assigned to the program via `user_program_assignments`
- **Facilities**: Total facilities associated with the program
- **Configuration**: Counts of configured program elements (age groups, difficulty levels, etc.)

**Use Cases**:
- Academy administration dashboard overviews
- Program performance monitoring
- Resource allocation planning
- Cross-program comparison analytics

## Course Management ✅ (Program Context Filtered)
- `GET /api/v1/courses` - List courses (program-filtered)
- `POST /api/v1/courses` - Create course (program context enforced)
- `GET /api/v1/courses/{id}` - Get course (program access validated)
- `PUT /api/v1/courses/{id}` - Update course (program scoped)
- `DELETE /api/v1/courses/{id}` - Delete course (program scoped)

**🔄 Updated Pricing Model (2025-07-30)**: Courses now use `pricing_ranges` instead of fixed pricing matrix
- **Price Ranges**: Each age group has price_from and price_to for customer expectations
- **Facility Integration**: Actual customer prices configured per facility in facility course pricing system
- **Marketing Focus**: Course prices serve as ranges for website/app display, not transaction amounts

## Facility Management ✅ (Program Context Filtered)
### Core Facility Operations
- `GET /api/v1/facilities` - List facilities (program-filtered)
- `POST /api/v1/facilities` - Create facility (program context enforced)
- `GET /api/v1/facilities/{id}` - Get facility (program access validated)
- `PUT /api/v1/facilities/{id}` - Update facility (program scoped)
- `DELETE /api/v1/facilities/{id}` - Delete facility (program scoped)
- `GET /api/v1/facilities/stats` - Facility statistics (program filtered)

### 🆕 Facility Course Pricing System ✅ (NEW - 2025-07-30)
**Complete facility-specific course pricing that determines actual customer charges - 14 endpoints**

#### Pricing Management (6 endpoints)
- `GET /api/v1/facility-course-pricing` - List pricing entries with filtering & pagination
- `POST /api/v1/facility-course-pricing` - Create new pricing entry
- `GET /api/v1/facility-course-pricing/{id}` - Get specific pricing entry
- `PUT /api/v1/facility-course-pricing/{id}` - Update pricing entry
- `DELETE /api/v1/facility-course-pricing/{id}` - Delete pricing entry
- `GET /api/v1/facility-course-pricing/stats` - Pricing statistics and coverage

#### Facility & Course Pricing Queries (4 endpoints)
- `GET /api/v1/facility-course-pricing/facility/{facility_id}/pricing` - All pricing for facility
- `GET /api/v1/facility-course-pricing/course/{course_id}/pricing` - All pricing for course
- `POST /api/v1/facility-course-pricing/lookup` - Price lookup for enrollment
- `GET /api/v1/facility-course-pricing/facility/{facility_id}/matrix` - Complete pricing matrix

#### Bulk Operations (4 endpoints)
- `POST /api/v1/facility-course-pricing/bulk-create` - Bulk create pricing entries
- `POST /api/v1/facility-course-pricing/bulk-update` - Bulk update pricing entries
- `POST /api/v1/facility-course-pricing/import` - Import pricing from other facility
- `GET /api/v1/facility-course-pricing/stats` - Pricing statistics and coverage

**Key Features:**
- **Two-Tier Pricing**: Course price ranges (marketing) + facility actual prices (transactions)
- **Configuration Validation**: Ensures pricing matches course age_groups, location_types, session_types
- **Real-time Price Lookup**: Instant pricing for customer enrollment workflows
- **Bulk Management**: Import/export pricing between facilities for operational efficiency
- **Program Context Filtering**: All pricing operations scoped by program assignments
- **Comprehensive Coverage**: Statistics and matrix views for pricing management

## Scheduling System ✅ (Program Context Filtered)
### Session Management
- `POST /api/v1/scheduling/sessions/` - Create new session
- `GET /api/v1/scheduling/sessions/facility/{facility_id}` - Get facility sessions
- `GET /api/v1/scheduling/sessions/{session_id}` - Get specific session
- `PUT /api/v1/scheduling/sessions/{session_id}/time` - Update session time
- `PUT /api/v1/scheduling/sessions/{session_id}/cancel` - Cancel session
- `PUT /api/v1/scheduling/sessions/facility/{facility_id}/cancel-day` - Cancel all sessions for day

### Session Participants & Instructors
- `POST /api/v1/scheduling/sessions/{session_id}/participants` - Add participants
- `DELETE /api/v1/scheduling/sessions/{session_id}/participants` - Remove participants
- `POST /api/v1/scheduling/sessions/{session_id}/instructors` - Add instructors
- `DELETE /api/v1/scheduling/sessions/{session_id}/instructors` - Remove instructors
- `GET /api/v1/scheduling/sessions/{session_id}/participants` - List session participants

### Integration & Utilities
- `POST /api/v1/scheduling/sessions/check-conflicts` - Check scheduling conflicts
- `POST /api/v1/scheduling/integration/courses/create-sessions` - Create sessions from course
- `GET /api/v1/scheduling/integration/students/{student_id}/schedule` - Student schedule
- `GET /api/v1/scheduling/integration/facilities/{facility_id}/utilization` - Facility reports

## Students Management ✅ (Program Context Filtered - 19 endpoints)
**🔧 Fixed (2025-01-29)**: Multiple critical fixes applied
- **Schema Fix**: Auto-generation of `full_name` from `first_name + last_name` in user creation
- **Permission Fix**: Program admins can now create student/parent users within their programs
- **Service Layer Fix**: Updated to use subquery-based course enrollment filtering (resolves PostgreSQL DISTINCT issues)
- **Method Name Fix**: Corrected service method calls in parent routes (eliminates 500 errors)
- **Enum Alignment**: Database enums now match Python enum values for consistency
### Standard Operations
- `GET /api/v1/students` - List students with pagination and filtering  
- `GET /api/v1/students/stats` - **UPDATED**: Student statistics (assignment-based architecture) 
  - Total student profiles and active enrollments
  - Course enrollment counts (active/paused)  
  - Parent-child relationship statistics
  - Age/gender distribution and recent trends
- `GET /api/v1/students/{student_id}` - Get specific student by ID
- `PUT /api/v1/students/{student_id}` - Update student information
- `DELETE /api/v1/students/{student_id}` - Delete student (Super Admin only)
- `POST /api/v1/students/` - Create new student (legacy method)
- `GET /api/v1/students/by-student-id/{student_id}` - Get student by formatted ID (STU-YYYY-NNNN)
- `POST /api/v1/students/bulk-action` - Bulk operations (status updates, etc.)

### 🆕 Two-Step Workflow (NEW - 2025-01-28)
- `POST /api/v1/students/profile-only` - Create student profile without program assignment
- `POST /api/v1/students/{student_id}/assign-to-program` - Assign student to program
- `POST /api/v1/students/{student_id}/enroll-in-course` - Enroll student in course
- `POST /api/v1/students/create-and-assign` - Create student and immediately assign to course
- `GET /api/v1/students/in-program-by-enrollment` - Get students visible via course enrollments

### Mobile App Endpoints (Student Access)
- `GET /api/v1/students/me` - Get current student's profile
- `PATCH /api/v1/students/me` - Update current student's profile (limited fields)
- `GET /api/v1/students/me/progress` - Get student's progress across courses
- `GET /api/v1/students/me/attendance` - Get student's attendance records
- `GET /api/v1/students/me/assessments` - Get student's assessment results
- `GET /api/v1/students/me/communications` - Get student's communications
- `GET /api/v1/students/me/parents` - Get student's parent/guardian contacts

## Parents Management ✅ (Program Context Filtered - 5 endpoints)
**🔧 Fixed (2025-01-29)**: Service method name corrections and permission updates
### Standard Operations
- `GET /api/v1/parents` - List parents with family info
- `GET /api/v1/parents/stats` - **UPDATED**: Parent statistics (relationship-focused architecture)
  - Total parent profiles and relationship counts
  - Parent-child relationship statistics  
  - Payment responsibility and family size distribution
  - Gender distribution and recent profile trends
- `GET /api/v1/parents/{parent_id}` - Get specific parent
- `PUT /api/v1/parents/{parent_id}` - Update parent
- `DELETE /api/v1/parents/{parent_id}` - Delete parent (Super Admin only)
- `POST /api/v1/parents/` - Create new parent
- `GET /api/v1/parents/{parent_id}/children` - Get parent's children

### 🆕 Two-Step Workflow (NEW - 2025-01-28)
- `POST /api/v1/parents/profile-only` - Create parent profile without program assignment
- `POST /api/v1/parents/{parent_id}/assign-to-program` - Assign parent to program
- `POST /api/v1/parents/{parent_id}/assign-child-to-course` - Parent assigns child to course
- `GET /api/v1/parents/in-program-by-children` - Get parents visible via children's enrollments

## Teams Management ✅ (Program Context Filtered)
### Team Members
- `GET /api/v1/teams/members` - List program team members (program-filtered)
- `POST /api/v1/teams/members` - Add user to program team
- `PUT /api/v1/teams/members/{user_id}` - Update team member role/settings
- `DELETE /api/v1/teams/members/{user_id}` - Remove team member from program

### Team Utilities
- `GET /api/v1/teams/available-users` - List users available to add to team
- `GET /api/v1/teams/stats` - Team statistics and member counts by role

## User Program Assignments ✅
- `GET /api/v1/users/{user_id}/programs` - Get user's program assignments
- `POST /api/v1/users/{user_id}/programs` - Assign user to program (Super Admin)
- `DELETE /api/v1/users/{user_id}/programs/{program_id}` - Remove assignment

## HTTP Headers for Program Context
- **X-Program-Context**: `program-id` - Current program context
- **X-Bypass-Program-Filter**: `true` - Super admin bypass

## API Summary
- **Total Endpoints**: 222 registered and accessible
- **🆕 Facility Course Pricing**: 14 endpoints (newly implemented 2025-07-30)
- **Course Assignment System**: 12 endpoints (newly implemented)
- **Student Management**: 19 endpoints (enhanced with two-step workflow + critical fixes)
- **Parent Management**: 5 endpoints (enhanced with assignment-based operations + method fixes)
- **System Status**: ✅ All services healthy and deployed
- **Recent Fixes**: ✅ User creation schema, program admin permissions, service methods, enum alignment
- **🆕 Latest Updates (2025-07-31)**: ✅ Updated statistics architecture for assignment-based system + facility-course enrollment system
- **Latest Feature**: ✅ Multi-facility course availability system with assignment-based enrollments

## 🏢 **Facility-Course Assignment System** ✅ **NEW (2025-07-31)**
Course enrollments now include facility assignments for multi-facility course availability:

### **Enhanced Course Enrollment Fields**
- `facility_id`: Assigned facility for enrollment
- `session_type`: Type of session (group, private, etc.)
- `location_type`: Location type (our-facility, client-location, virtual)
- `age_group`: Age group classification

### **Multi-Facility Course Availability**
Different facilities can offer different courses based on their capabilities:
- **Olympic Swimming Pool**: All courses available
- **Community Pool Center**: Basic courses only  
- **Aqua Sport Complex**: Premium/advanced courses

### **Student Assignment Distribution**
- **5 Students** with **8 Active Enrollments** across **3 Facilities**
- Students can enroll in courses at multiple facilities
- Each enrollment specifies facility, session type, and location type

### **API Integration**
```json
// Enhanced course enrollment with facility assignment
{
  "student_id": "STU-2025-001",
  "course_id": "swimming-fundamentals",
  "facility_id": "olympic-pool-123",
  "session_type": "group",
  "location_type": "our-facility",
  "age_group": "6-12-years",
  "status": "active"
}
```

## Test Data Available
- **5 Programs**: Robotics, AI/ML, Web Dev, Sports, Arts
- **Super Admin**: `admin@academy.com` / `admin123`
- **Program Admin**: `swim.admin@academy.com` / `swim123`

## System Access
- **Frontend**: http://localhost:3000 ✅ (Next.js 15)
- **Backend API**: http://localhost:8000 ✅ (208 endpoints) 
- **API Documentation**: http://localhost:8000/docs ✅ (Interactive)
- **Database**: PostgreSQL on port 5432 ✅ (Healthy)