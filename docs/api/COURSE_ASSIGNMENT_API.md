# Student/Parent Course Assignment System API Reference

## Overview

The Student/Parent Course Assignment System implements a two-step workflow that separates profile creation from program/course assignment. This provides flexibility for cross-program operations and better assignment management.

### Key Concepts

- **Two-Step Workflow**: Profile creation → Course assignment → Program visibility
- **Assignment-Based Membership**: Program membership determined by course enrollments
- **Cross-Program Operations**: Search and assign users across different programs
- **Assignment Metadata**: Track who assigned, when, why, and assignment types

## Base URL

All endpoints are prefixed with: `http://localhost:8000/api/v1`

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Program Context

Most student/parent operations require a program context header:
```
X-Program-Context: <program_id>
```

---

## Course Assignment Endpoints

### 1. Individual Course Assignment

**Assign a user to a specific course**

```http
POST /course-assignments/assign
Content-Type: application/json
X-Program-Context: <program_id>

{
  "user_id": "user-uuid",
  "course_id": "course-uuid",
  "assignment_type": "direct",
  "credits_awarded": 5,
  "assignment_notes": "Initial enrollment",
  "referral_source": "Online registration",
  "special_requirements": "Beginner level",
  "notes": "Student is excited to start"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course assignment successful",
  "enrollment": {
    "id": "enrollment-uuid",
    "user_id": "user-uuid",
    "course_id": "course-uuid",
    "program_id": "program-uuid",
    "status": "active",
    "enrollment_date": "2025-01-28",
    "assignment_date": "2025-01-28",
    "enrollment_fee": 25000.00,
    "outstanding_balance": 25000.00
  }
}
```

### 2. Bulk Course Assignments

**Assign multiple users to multiple courses**

```http
POST /course-assignments/bulk-assign
Content-Type: application/json
X-Program-Context: <program_id>

{
  "assignments": [
    {
      "user_id": "user1-uuid",
      "course_id": "course1-uuid",
      "assignment_details": {
        "assignment_type": "bulk_assigned",
        "credits_awarded": 3
      }
    },
    {
      "user_id": "user2-uuid", 
      "course_id": "course1-uuid",
      "assignment_details": {
        "assignment_type": "bulk_assigned",
        "credits_awarded": 3
      }
    }
  ]
}
```

**Response:**
```json
{
  "total_processed": 2,
  "total_successful": 2,
  "total_failed": 0,
  "successful_assignments": [
    {
      "enrollment_id": "enrollment1-uuid",
      "user_id": "user1-uuid",
      "course_id": "course1-uuid",
      "status": "active",
      "assignment_date": "2025-01-28"
    }
  ],
  "failed_assignments": []
}
```

### 3. Multi-User Assignment

**Assign multiple users to one course**

```http
POST /course-assignments/assign-multiple-users
Content-Type: application/json
X-Program-Context: <program_id>

{
  "user_ids": ["user1-uuid", "user2-uuid", "user3-uuid"],
  "course_id": "course-uuid",
  "assignment_details": {
    "assignment_type": "direct",
    "credits_awarded": 5,
    "assignment_notes": "Group enrollment"
  }
}
```

### 4. Multi-Course Assignment

**Assign one user to multiple courses**

```http
POST /course-assignments/assign-multiple-courses
Content-Type: application/json
X-Program-Context: <program_id>

{
  "user_id": "user-uuid",
  "course_ids": ["course1-uuid", "course2-uuid"],
  "assignment_details": {
    "assignment_type": "direct",
    "credits_awarded": 10
  }
}
```

### 5. Remove Course Assignment

**Remove a user from a course**

```http
DELETE /course-assignments/remove/{user_id}/{course_id}
Content-Type: application/json
X-Program-Context: <program_id>

{
  "reason": "Student requested withdrawal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course assignment removed successfully"
}
```

### 6. Check Assignment Eligibility

**Validate if a user can be assigned to a course**

```http
GET /course-assignments/check-eligibility/{user_id}/{course_id}
X-Program-Context: <program_id>
```

**Response:**
```json
{
  "eligible": true,
  "reason": "Eligible for assignment",
  "warnings": ["Course is nearly at capacity"]
}
```

### 7. Get User Course Assignments

**Get all course assignments for a user**

```http
GET /course-assignments/user-assignments/{user_id}
X-Program-Context: <program_id>
```

**Response:**
```json
[
  {
    "enrollment_id": "enrollment-uuid",
    "course_id": "course-uuid",
    "course_name": "Swimming Basics",
    "program_id": "program-uuid",
    "program_name": "Swimming Program",
    "status": "active",
    "enrollment_date": "2025-01-28",
    "assignment_date": "2025-01-28",
    "assignment_type": "direct",
    "credits_awarded": 5,
    "enrollment_fee": 25000.00,
    "outstanding_balance": 15000.00,
    "progress_percentage": 65.0,
    "assignment_notes": "Initial enrollment"
  }
]
```

---

## User Search Endpoints

### 1. General User Search

**Search for users with advanced filtering**

```http
POST /course-assignments/search-users
Content-Type: application/json
X-Program-Context: <program_id>

{
  "search_query": "John Doe",
  "role_filter": ["student", "parent"],
  "is_active": true,
  "exclude_assigned_to_program": "program-uuid",
  "exclude_enrolled_in_course": "course-uuid",
  "page": 1,
  "per_page": 20
}
```

**Response:**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+234-xxx-xxx",
      "roles": ["student"],
      "is_active": true,
      "program_assignments": [],
      "active_enrollments": [],
      "assignment_eligibility": {
        "can_be_student": true,
        "can_be_parent": false,
        "has_restrictions": false
      }
    }
  ],
  "total_count": 1,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

### 2. Search Assignable Students

**Search for students who can be assigned to current program**

```http
GET /course-assignments/search-assignable-students?search_query=john&exclude_enrolled_in_course=course-uuid
X-Program-Context: <program_id>
```

### 3. Search Assignable Parents

**Search for parents who can be assigned to current program**

```http
GET /course-assignments/search-assignable-parents?search_query=jane
X-Program-Context: <program_id>
```

### 4. Get User Program Status  

**Get comprehensive program status for a user**

```http
GET /course-assignments/user-program-status/{user_id}
```

**Response:**
```json
{
  "user_id": "user-uuid",
  "assigned_programs": [
    {
      "program_id": "program-uuid",
      "program_name": "Swimming Program",
      "role": "student",
      "assignment_date": "2025-01-28",
      "assigned_by": "admin-uuid"
    }
  ],
  "enrolled_courses": [
    {
      "course_id": "course-uuid",
      "course_name": "Swimming Basics",
      "program_id": "program-uuid",
      "enrollment_date": "2025-01-28",
      "status": "active",
      "progress": 65.0
    }
  ],
  "roles_in_programs": {
    "program-uuid": "student"
  },
  "can_be_assigned_to_program": true,
  "assignment_restrictions": []
}
```

---

## Student Endpoints (Enhanced)

### 1. Profile-Only Creation

**Create student profile without program assignment (Step 1)**

```http
POST /students/profile-only
Content-Type: application/json

{
  "salutation": "Mr.",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@email.com",
  "phone": "+234-xxx-xxx",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "address": "123 Main St, Lagos",
  "referral_source": "Online",
  "emergency_contact": {
    "name": "Jane Doe",
    "phone": "+234-xxx-xxx",
    "relationship": "mother"
  },
  "medical_info": {
    "conditions": "None",
    "medications": "None",
    "allergies": "None"
  },
  "notes": "New student profile"
}
```

### 2. Assign Student to Program

**Assign existing student to a program (Step 2)**

```http
POST /students/{student_id}/assign-to-program?program_id=program-uuid&assignment_notes=Initial assignment
```

### 3. Enroll Student in Course

**Enroll student in specific course**

```http
POST /students/{student_id}/enroll-in-course?course_id=course-uuid&assignment_type=direct&credits_awarded=5
X-Program-Context: <program_id>
```

### 4. Combined Create and Assign

**Create student and immediately assign to course**

```http
POST /students/create-and-assign?course_id=course-uuid
Content-Type: application/json
X-Program-Context: <program_id>

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@email.com",
  // ... other student fields
}
```

### 5. Get Students by Enrollment

**Get students in program based on course enrollments**

```http
GET /students/in-program-by-enrollment?page=1&per_page=20
X-Program-Context: <program_id>
```

---

## Parent Endpoints (Enhanced) 

### 1. Profile-Only Creation

**Create parent profile without program assignment (Step 1)**

```http
POST /parents/profile-only
Content-Type: application/json

{
  "salutation": "Mrs.",
  "first_name": "Jane",
  "last_name": "Doe", 
  "email": "jane.doe@email.com",
  "phone": "+234-xxx-xxx",
  "address": "123 Main St, Lagos",
  "emergency_contact_name": "John Doe Sr.",
  "emergency_contact_phone": "+234-xxx-xxx",
  "occupation": "Teacher",
  "payment_responsibility": true
}
```

### 2. Assign Parent to Program

**Assign existing parent to a program (Step 2)**

```http
POST /parents/{parent_id}/assign-to-program?program_id=program-uuid&assignment_notes=Parent assignment
```

### 3. Assign Child to Course

**Parent assigns their child to a course**

```http
POST /parents/{parent_id}/assign-child-to-course?child_user_id=child-uuid&course_id=course-uuid&assignment_type=parent_assigned
X-Program-Context: <program_id>
```

### 4. Get Parents by Children Enrollment

**Get parents visible in program through children's enrollments**

```http
GET /parents/in-program-by-children?page=1&per_page=20
X-Program-Context: <program_id>
```

### 5. Get/Update/Delete Parent

**Standard CRUD operations**

```http
GET /parents/{parent_id}
PUT /parents/{parent_id}
DELETE /parents/{parent_id}
```

### 6. Get Parent's Children

**Get all children for a specific parent**

```http
GET /parents/{parent_id}/children
X-Program-Context: <program_id>
```

---

## Assignment Types

- **`direct`** - Direct assignment by admin/coordinator
- **`parent_assigned`** - Assigned by parent
- **`bulk_assigned`** - Part of bulk assignment operation

## Program Roles

- **`student`** - User assigned as student
- **`parent`** - User assigned as parent  
- **`both`** - User has both student and parent roles

## Enrollment Status

- **`active`** - Currently enrolled
- **`paused`** - Temporarily paused
- **`completed`** - Successfully completed
- **`withdrawn`** - Withdrawn from course
- **`cancelled`** - Course was cancelled

## Error Responses

All endpoints return consistent error format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, business rule violations)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate assignment, etc.)
- `500` - Internal Server Error

## Rate Limiting

- Standard endpoints: 100 requests per minute per user
- Bulk operations: 10 requests per minute per user
- Search endpoints: 60 requests per minute per user

## Pagination

List endpoints support pagination:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "total": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8,
  "has_next": true,
  "has_prev": false
}
```