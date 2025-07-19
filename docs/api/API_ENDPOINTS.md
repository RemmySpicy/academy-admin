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