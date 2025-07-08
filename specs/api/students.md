# Student Management API Specification

## API Overview

The Student Management API provides comprehensive student profile management with parent-child relationships, enrollment workflows, progress tracking, and financial management. This API enables administrators to manage complete student lifecycles from enrollment through graduation, including academic progress, attendance, and family relationships.

## Base URLs and Versioning

- **Base URL**: `https://api.academy-admin.com/api/v1`
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token (required for all endpoints)

## Authentication Requirements

All endpoints require valid JWT token with appropriate role permissions:
```
Authorization: Bearer <jwt_token>
```

**Required Permissions:**
- **Super Admin**: Full access to all student management endpoints
- **Program Admin**: Access limited to assigned programs
- **Parent**: Read-only access to own children's data
- **Student**: Read-only access to own profile data

## Detailed Endpoint Specifications

### Student Management Endpoints

#### GET /students
List students with filtering, searching, and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `program_id` (UUID): Filter by program
- `status` (string): Filter by status (active, inactive, graduated, withdrawn)
- `search` (string): Search by name, email, or student ID
- `enrollment_date_from` (date): Filter by enrollment date range
- `enrollment_date_to` (date): Filter by enrollment date range
- `age_min` (integer): Filter by minimum age
- `age_max` (integer): Filter by maximum age

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "student_id": "STU-2024-0001",
        "first_name": "Emma",
        "last_name": "Johnson",
        "email": "emma.johnson@email.com",
        "phone": "+1234567890",
        "date_of_birth": "2015-03-15",
        "age": 9,
        "gender": "female",
        "status": "active",
        "enrollment_date": "2024-01-15",
        "program_assignments": [
          {
            "program_id": "456e7890-e89b-12d3-a456-426614174001",
            "program_name": "Swimming",
            "enrollment_status": "active"
          }
        ],
        "parent_info": {
          "primary_parent": {
            "id": "789e0123-e89b-12d3-a456-426614174002",
            "name": "Sarah Johnson",
            "email": "sarah.johnson@email.com"
          }
        },
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### POST /students
Create new student profile.

**Request Body:**
```json
{
  "salutation": "Ms.",
  "first_name": "Emma",
  "last_name": "Johnson",
  "email": "emma.johnson@email.com",
  "phone": "+1234567890",
  "date_of_birth": "2015-03-15",
  "gender": "female",
  "address": {
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "Anytown",
    "state": "CA",
    "country": "USA",
    "postal_code": "12345"
  },
  "emergency_contact": {
    "name": "John Johnson",
    "phone": "+1234567891",
    "relationship": "father"
  },
  "medical_info": {
    "conditions": "None",
    "medications": "None",
    "allergies": "Peanuts"
  },
  "referral_source": "Website",
  "parent_id": "789e0123-e89b-12d3-a456-426614174002"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "STU-2024-0001",
    "first_name": "Emma",
    "last_name": "Johnson",
    "email": "emma.johnson@email.com",
    "phone": "+1234567890",
    "date_of_birth": "2015-03-15",
    "age": 9,
    "gender": "female",
    "status": "active",
    "enrollment_date": "2024-01-15",
    "address": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city": "Anytown",
      "state": "CA",
      "country": "USA",
      "postal_code": "12345"
    },
    "emergency_contact": {
      "name": "John Johnson",
      "phone": "+1234567891",
      "relationship": "father"
    },
    "medical_info": {
      "conditions": "None",
      "medications": "None",
      "allergies": "Peanuts"
    },
    "referral_source": "Website",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /students/{id}
Get detailed student profile.

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "STU-2024-0001",
    "salutation": "Ms.",
    "first_name": "Emma",
    "last_name": "Johnson",
    "email": "emma.johnson@email.com",
    "phone": "+1234567890",
    "date_of_birth": "2015-03-15",
    "age": 9,
    "gender": "female",
    "status": "active",
    "enrollment_date": "2024-01-15",
    "address": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city": "Anytown",
      "state": "CA",
      "country": "USA",
      "postal_code": "12345"
    },
    "emergency_contact": {
      "name": "John Johnson",
      "phone": "+1234567891",
      "relationship": "father"
    },
    "medical_info": {
      "conditions": "None",
      "medications": "None",
      "allergies": "Peanuts"
    },
    "referral_source": "Website",
    "parents": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@email.com",
        "relationship_type": "primary",
        "can_pick_up": true,
        "can_authorize_medical": true
      }
    ],
    "enrollments": [
      {
        "id": "enrollment-id-1",
        "program_name": "Swimming",
        "course_name": "Swimming Club",
        "current_level": "Level 1",
        "enrollment_status": "active",
        "start_date": "2024-01-15",
        "total_sessions": 10,
        "completed_sessions": 3,
        "remaining_sessions": 7
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /students/{id}
Update student profile.

**Path Parameters:**
- `id` (UUID): Student ID

**Request Body:**
```json
{
  "phone": "+1234567892",
  "address": {
    "address_line1": "456 Oak St",
    "city": "Newtown",
    "state": "CA",
    "country": "USA",
    "postal_code": "54321"
  },
  "emergency_contact": {
    "name": "John Johnson",
    "phone": "+1234567893",
    "relationship": "father"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "STU-2024-0001",
    "first_name": "Emma",
    "last_name": "Johnson",
    "phone": "+1234567892",
    "address": {
      "address_line1": "456 Oak St",
      "city": "Newtown",
      "state": "CA",
      "country": "USA",
      "postal_code": "54321"
    },
    "emergency_contact": {
      "name": "John Johnson",
      "phone": "+1234567893",
      "relationship": "father"
    },
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

#### DELETE /students/{id}
Delete student profile (soft delete).

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student profile deleted successfully"
}
```

#### GET /students/{id}/summary
Get student summary dashboard.

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student_info": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Emma Johnson",
      "age": 9,
      "enrollment_date": "2024-01-15",
      "status": "active"
    },
    "enrollment_summary": {
      "active_programs": 1,
      "total_sessions": 10,
      "completed_sessions": 3,
      "remaining_sessions": 7,
      "attendance_rate": 0.85
    },
    "progress_summary": {
      "current_level": "Level 1",
      "overall_progress": 0.30,
      "recent_assessments": [
        {
          "skill_area": "Freestyle Stroke",
          "rating": 2,
          "assessment_date": "2024-01-10"
        }
      ]
    },
    "financial_summary": {
      "outstanding_balance": 150.00,
      "total_paid": 300.00,
      "next_payment_due": "2024-02-15"
    },
    "upcoming_sessions": [
      {
        "session_date": "2024-01-20",
        "session_time": "10:00 AM",
        "instructor": "Mike Wilson",
        "program": "Swimming"
      }
    ]
  }
}
```

### Parent Management Endpoints

#### GET /parents
List parents with filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search by name, email, or parent ID
- `account_status` (string): Filter by account status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parents": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "parent_id": "PAR-2024-0001",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah.johnson@email.com",
        "phone": "+1234567890",
        "account_status": "active",
        "children_count": 1,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### POST /parents
Create new parent profile.

**Request Body:**
```json
{
  "salutation": "Mrs.",
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@email.com",
  "phone": "+1234567890",
  "address": {
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "Anytown",
    "state": "CA",
    "country": "USA",
    "postal_code": "12345"
  },
  "preferred_communication": "email"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "parent_id": "PAR-2024-0001",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "+1234567890",
    "address": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city": "Anytown",
      "state": "CA",
      "country": "USA",
      "postal_code": "12345"
    },
    "account_status": "active",
    "preferred_communication": "email",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /parents/{id}
Get parent profile details.

**Path Parameters:**
- `id` (UUID): Parent ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "parent_id": "PAR-2024-0001",
    "salutation": "Mrs.",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "+1234567890",
    "address": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city": "Anytown",
      "state": "CA",
      "country": "USA",
      "postal_code": "12345"
    },
    "account_status": "active",
    "preferred_communication": "email",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /parents/{id}/children
Get all children for a parent.

**Path Parameters:**
- `id` (UUID): Parent ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "children": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "student_id": "STU-2024-0001",
        "name": "Emma Johnson",
        "age": 9,
        "status": "active",
        "relationship_type": "primary",
        "programs": [
          {
            "program_name": "Swimming",
            "enrollment_status": "active"
          }
        ]
      }
    ]
  }
}
```

### Student-Parent Relationship Endpoints

#### POST /students/{student_id}/parents
Link parent to student.

**Path Parameters:**
- `student_id` (UUID): Student ID

**Request Body:**
```json
{
  "parent_id": "789e0123-e89b-12d3-a456-426614174002",
  "relationship_type": "primary",
  "can_pick_up": true,
  "can_authorize_medical": true,
  "receives_communications": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "relationship-id-1",
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "parent_id": "789e0123-e89b-12d3-a456-426614174002",
    "relationship_type": "primary",
    "can_pick_up": true,
    "can_authorize_medical": true,
    "receives_communications": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Enrollment Management Endpoints

#### POST /students/{id}/enroll
Enroll student in course.

**Path Parameters:**
- `id` (UUID): Student ID

**Request Body:**
```json
{
  "program_id": "456e7890-e89b-12d3-a456-426614174001",
  "course_id": "course-id-1",
  "facility_id": "facility-id-1",
  "instructor_id": "instructor-id-1",
  "start_date": "2024-01-15",
  "total_sessions": 10,
  "session_credits": 10
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "enrollment-id-1",
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "program_id": "456e7890-e89b-12d3-a456-426614174001",
    "course_id": "course-id-1",
    "facility_id": "facility-id-1",
    "instructor_id": "instructor-id-1",
    "enrollment_date": "2024-01-15",
    "start_date": "2024-01-15",
    "status": "active",
    "current_level": "Level 1",
    "total_sessions": 10,
    "completed_sessions": 0,
    "remaining_sessions": 10,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /students/{id}/enrollments
Get student enrollments.

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "enrollment-id-1",
        "program_name": "Swimming",
        "course_name": "Swimming Club",
        "facility_name": "Main Pool",
        "instructor_name": "Mike Wilson",
        "enrollment_date": "2024-01-15",
        "start_date": "2024-01-15",
        "status": "active",
        "current_level": "Level 1",
        "current_module": "Module 1",
        "total_sessions": 10,
        "completed_sessions": 3,
        "remaining_sessions": 7
      }
    ]
  }
}
```

### Progress Tracking Endpoints

#### GET /students/{id}/progress
Get student progress summary.

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overall_progress": {
      "current_level": "Level 1",
      "current_module": "Module 2",
      "progress_percentage": 0.35,
      "skill_areas_completed": 5,
      "total_skill_areas": 15
    },
    "skill_progress": [
      {
        "skill_area": "Freestyle Stroke",
        "current_rating": 2,
        "target_rating": 3,
        "progress_percentage": 0.67,
        "last_assessment": "2024-01-10"
      },
      {
        "skill_area": "Backstroke",
        "current_rating": 1,
        "target_rating": 2,
        "progress_percentage": 0.50,
        "last_assessment": "2024-01-08"
      }
    ],
    "recent_assessments": [
      {
        "assessment_date": "2024-01-10",
        "skill_area": "Freestyle Stroke",
        "rating": 2,
        "instructor_notes": "Good improvement in technique",
        "assessed_by": "Mike Wilson"
      }
    ]
  }
}
```

#### POST /students/{id}/progress
Record progress assessment.

**Path Parameters:**
- `id` (UUID): Student ID

**Request Body:**
```json
{
  "enrollment_id": "enrollment-id-1",
  "curriculum_level": "Level 1",
  "module_name": "Module 1",
  "section_name": "Freestyle Basics",
  "skill_area": "Freestyle Stroke",
  "current_rating": 2,
  "target_rating": 3,
  "assessment_date": "2024-01-10",
  "instructor_notes": "Good improvement in technique",
  "achievement_milestones": ["Completed first 25m freestyle"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "progress-id-1",
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "enrollment_id": "enrollment-id-1",
    "curriculum_level": "Level 1",
    "module_name": "Module 1",
    "section_name": "Freestyle Basics",
    "skill_area": "Freestyle Stroke",
    "current_rating": 2,
    "target_rating": 3,
    "assessment_date": "2024-01-10",
    "instructor_notes": "Good improvement in technique",
    "achievement_milestones": ["Completed first 25m freestyle"],
    "created_at": "2024-01-10T15:30:00Z"
  }
}
```

### Attendance Management Endpoints

#### GET /students/{id}/attendance
Get student attendance records.

**Path Parameters:**
- `id` (UUID): Student ID

**Query Parameters:**
- `date_from` (date): Start date for attendance records
- `date_to` (date): End date for attendance records
- `session_type` (string): Filter by session type

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attendance_summary": {
      "total_sessions": 10,
      "attended_sessions": 8,
      "missed_sessions": 2,
      "attendance_rate": 0.80,
      "late_sessions": 1
    },
    "attendance_records": [
      {
        "id": "attendance-id-1",
        "session_date": "2024-01-15",
        "session_time": "10:00 AM",
        "program": "Swimming",
        "instructor": "Mike Wilson",
        "attendance_status": "present",
        "check_in_time": "09:55 AM",
        "check_out_time": "10:55 AM",
        "instructor_notes": "Great participation today"
      }
    ]
  }
}
```

#### POST /students/{id}/attendance
Record student attendance.

**Path Parameters:**
- `id` (UUID): Student ID

**Request Body:**
```json
{
  "session_id": "session-id-1",
  "attendance_status": "present",
  "check_in_time": "2024-01-15T09:55:00Z",
  "check_out_time": "2024-01-15T10:55:00Z",
  "instructor_notes": "Great participation today"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "attendance-id-1",
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "session_id": "session-id-1",
    "attendance_status": "present",
    "check_in_time": "2024-01-15T09:55:00Z",
    "check_out_time": "2024-01-15T10:55:00Z",
    "session_date": "2024-01-15",
    "instructor_notes": "Great participation today",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Financial Management Endpoints

#### GET /students/{id}/financial
Get student financial records.

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "financial_summary": {
      "total_charges": 500.00,
      "total_paid": 350.00,
      "outstanding_balance": 150.00,
      "credit_balance": 0.00,
      "next_payment_due": "2024-02-15"
    },
    "transactions": [
      {
        "id": "transaction-id-1",
        "transaction_type": "payment",
        "amount": 150.00,
        "currency": "USD",
        "payment_method": "credit_card",
        "status": "paid",
        "transaction_date": "2024-01-15",
        "description": "Monthly swimming lessons",
        "transaction_reference": "TXN-2024-001"
      }
    ]
  }
}
```

#### POST /students/{id}/financial
Create financial transaction.

**Path Parameters:**
- `id` (UUID): Student ID

**Request Body:**
```json
{
  "transaction_type": "payment",
  "amount": 150.00,
  "currency": "USD",
  "payment_method": "credit_card",
  "description": "Monthly swimming lessons",
  "due_date": "2024-02-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "transaction-id-1",
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "transaction_type": "payment",
    "amount": 150.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "status": "pending",
    "description": "Monthly swimming lessons",
    "due_date": "2024-02-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Data Models and Schemas

### Student Model
```json
{
  "id": "UUID",
  "student_id": "string (auto-generated)",
  "salutation": "string",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "email": "string (required, unique)",
  "phone": "string",
  "date_of_birth": "date (required)",
  "age": "integer (calculated)",
  "gender": "string",
  "status": "string (enum: active, inactive, graduated, withdrawn)",
  "enrollment_date": "date (required)",
  "address": {
    "address_line1": "string",
    "address_line2": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postal_code": "string"
  },
  "emergency_contact": {
    "name": "string",
    "phone": "string",
    "relationship": "string"
  },
  "medical_info": {
    "conditions": "string",
    "medications": "string",
    "allergies": "string"
  },
  "referral_source": "string",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Parent Model
```json
{
  "id": "UUID",
  "parent_id": "string (auto-generated)",
  "salutation": "string",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (required)",
  "address": {
    "address_line1": "string",
    "address_line2": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postal_code": "string"
  },
  "account_status": "string (enum: active, inactive, suspended)",
  "preferred_communication": "string (enum: email, phone, sms)",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

## Error Response Formats

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": ["Error message 1", "Error message 2"]
    }
  }
}
```

## Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied - insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

## Rate Limiting

### General API Endpoints
- **Limit**: 1000 requests per hour per authenticated user
- **Burst**: 100 requests per minute
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Security Considerations

### Data Protection
- Student data encrypted at rest
- PII (Personally Identifiable Information) access logged
- GDPR compliance for data handling
- Secure handling of medical information

### Access Control
- Role-based access control enforced
- Program-specific data access for Program Admins
- Parent access limited to own children
- Student access limited to own profile

### Audit Logging
- All profile modifications logged
- Financial transaction audit trail
- Enrollment changes tracked
- Data access logging for compliance

## Example Usage

### Create Student with Parent Relationship
```javascript
// 1. Create parent first
const parentResponse = await fetch('/api/v1/parents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1234567890'
  })
});

const parent = await parentResponse.json();

// 2. Create student
const studentResponse = await fetch('/api/v1/students', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    first_name: 'Emma',
    last_name: 'Johnson',
    email: 'emma.johnson@email.com',
    date_of_birth: '2015-03-15',
    parent_id: parent.data.id
  })
});

const student = await studentResponse.json();

// 3. Enroll student in program
const enrollmentResponse = await fetch(`/api/v1/students/${student.data.id}/enroll`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    program_id: 'swimming-program-id',
    course_id: 'swimming-course-id',
    facility_id: 'main-facility-id',
    total_sessions: 10
  })
});
```

## Testing Endpoints

### Student Search
```bash
curl -X GET "https://api.academy-admin.com/api/v1/students?search=emma&program_id=swimming-program-id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Record Attendance
```bash
curl -X POST "https://api.academy-admin.com/api/v1/students/student-id/attendance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"session-id","attendance_status":"present"}'
```

### Get Student Progress
```bash
curl -X GET "https://api.academy-admin.com/api/v1/students/student-id/progress" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```