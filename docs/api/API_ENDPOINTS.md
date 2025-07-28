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

## Program Management ✅
- `GET /api/v1/programs/` - List programs (role-filtered)
- `POST /api/v1/programs/` - Create program (Super Admin only)
- `GET /api/v1/programs/{id}` - Get specific program
- `PUT /api/v1/programs/{id}` - Update program
- `DELETE /api/v1/programs/{id}` - Delete program (Super Admin only)

## Course Management ✅ (Program Context Filtered)
- `GET /api/v1/courses/` - List courses (program-filtered)
- `POST /api/v1/courses/` - Create course (program context enforced)
- `GET /api/v1/courses/{id}` - Get course (program access validated)
- `PUT /api/v1/courses/{id}` - Update course (program scoped)
- `DELETE /api/v1/courses/{id}` - Delete course (program scoped)

## Facility Management ✅ (Program Context Filtered)
- `GET /api/v1/facilities/` - List facilities (program-filtered)
- `POST /api/v1/facilities/` - Create facility (program context enforced)
- `GET /api/v1/facilities/{id}` - Get facility (program access validated)
- `PUT /api/v1/facilities/{id}` - Update facility (program scoped)
- `DELETE /api/v1/facilities/{id}` - Delete facility (program scoped)

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
### Standard Operations
- `GET /api/v1/students/` - List students with pagination and filtering  
- `GET /api/v1/students/stats` - Student statistics and demographics
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
### Standard Operations
- `GET /api/v1/parents/` - List parents with family info
- `GET /api/v1/parents/stats` - Parent statistics
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
- **Total Endpoints**: 208 registered and accessible
- **Course Assignment System**: 12 endpoints (newly implemented)
- **Student Management**: 19 endpoints (enhanced with two-step workflow)
- **Parent Management**: 5 endpoints (enhanced with assignment-based operations)
- **System Status**: ✅ All services healthy and deployed

## Test Data Available
- **5 Programs**: Robotics, AI/ML, Web Dev, Sports, Arts
- **Super Admin**: `admin@academy.com` / `admin123`
- **Program Admin**: `swim.admin@academy.com` / `swim123`

## System Access
- **Frontend**: http://localhost:3000 ✅ (Next.js 15)
- **Backend API**: http://localhost:8000 ✅ (208 endpoints) 
- **API Documentation**: http://localhost:8000/docs ✅ (Interactive)
- **Database**: PostgreSQL on port 5432 ✅ (Healthy)