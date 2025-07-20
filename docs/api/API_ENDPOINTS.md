# API Endpoints Reference

## Base URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Authentication Endpoints ✅
- `POST /api/v1/auth/login/json` - **PRIMARY**: JSON-based login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user with role and program assignments

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

## Parents Management ✅ (Program Context Filtered)
- `GET /api/v1/parents/` - List parents with family info
- `GET /api/v1/parents/stats` - Parent statistics
- `GET /api/v1/parents/{parent_id}` - Get specific parent
- `GET /api/v1/parents/{parent_id}/family` - Get family structure
- `PUT /api/v1/parents/{parent_id}` - Update parent
- `POST /api/v1/parents/` - Create new parent

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

## Test Data Available
- **5 Programs**: Robotics, AI/ML, Web Dev, Sports, Arts
- **Super Admin**: `admin@academy.com` / `admin123`
- **Program Admin**: `swim.admin@academy.com` / `swim123`