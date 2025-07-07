# API Architecture - Elitesgen Academy Management System

## API Design Principles

### Technology Stack
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Async Support**: Full async/await pattern for high performance
- **Validation**: Pydantic models for request/response validation
- **Authentication**: JWT-based authentication with role-based access
- **Documentation**: Auto-generated interactive API docs
- **Error Handling**: Comprehensive exception handling with standardized responses

### API Design Standards
- **RESTful Architecture**: Standard HTTP methods and status codes
- **Resource-Based URLs**: Clear, hierarchical resource naming
- **JSON Communication**: All data exchange in JSON format
- **Pagination**: Consistent pagination for list endpoints
- **Filtering & Search**: Standardized query parameters
- **Versioning**: API version strategy for future mobile app compatibility

## Authentication & Authorization

### JWT Authentication System
```python
# Token Structure
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "super_admin" | "program_admin",
  "programs": ["program_uuid1", "program_uuid2"],  # For program_admin
  "facilities": ["facility_uuid1", "facility_uuid2"],  # Access scope
  "exp": timestamp,
  "iat": timestamp
}
```

### Authorization Levels
- **Super Admin**: Full system access across all programs and facilities
- **Program Admin**: Access limited to assigned programs and their facilities
- **Future Mobile Roles**: Parent, Student, Instructor (for mobile apps)

### Security Headers
- **Authorization**: `Bearer <jwt_token>`
- **Content-Type**: `application/json`
- **X-Request-ID**: Unique request identifier for tracing

## Core API Structure

### Base URL Pattern
```
/api/v1/{resource}
```

### Standard Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid",
    "version": "v1"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid",
    "version": "v1"
  }
}
```

## API Endpoints Specification

### 1. Authentication Endpoints

#### POST /api/v1/auth/login
- **Purpose**: User authentication and token generation
- **Request Body**:
  ```json
  {
    "email": "admin@elitesgen.com",
    "password": "secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "token_type": "bearer",
      "expires_in": 3600,
      "user": {
        "id": "uuid",
        "email": "admin@elitesgen.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "super_admin",
        "programs": ["uuid1", "uuid2"],
        "facilities": ["uuid1", "uuid2"]
      }
    }
  }
  ```

#### POST /api/v1/auth/refresh
- **Purpose**: Refresh access token
- **Request Body**:
  ```json
  {
    "refresh_token": "refresh_token"
  }
  ```

#### POST /api/v1/auth/logout
- **Purpose**: Invalidate user session
- **Authentication**: Required

### 2. Organization & Facility Management

#### GET /api/v1/organizations
- **Purpose**: List organizations
- **Authentication**: Required
- **Response**: Array of organization objects

#### GET /api/v1/facilities
- **Purpose**: List facilities (filtered by user access)
- **Query Parameters**:
  - `organization_id`: UUID (optional)
  - `is_active`: boolean (default: true)
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20)

#### POST /api/v1/facilities
- **Purpose**: Create new facility
- **Authentication**: Super Admin only
- **Request Body**:
  ```json
  {
    "organization_id": "uuid",
    "name": "Downtown Branch",
    "address": {
      "country": "USA",
      "state": "CA",
      "city": "Los Angeles",
      "full_address": "123 Main St, Los Angeles, CA 90210"
    },
    "contact_phone": "+1-555-0123",
    "contact_email": "downtown@elitesgen.com",
    "operating_hours": {
      "monday": {"open": "06:00", "close": "22:00"},
      "tuesday": {"open": "06:00", "close": "22:00"}
    },
    "capacity_settings": {
      "group_max": 5,
      "private_max": 2,
      "school_max": 20
    }
  }
  ```

#### PUT /api/v1/facilities/{facility_id}
- **Purpose**: Update facility information
- **Authentication**: Super Admin or assigned Program Admin

#### GET /api/v1/facilities/{facility_id}
- **Purpose**: Get facility details

### 3. Program Management

#### GET /api/v1/programs
- **Purpose**: List programs (filtered by user access)
- **Query Parameters**:
  - `organization_id`: UUID (optional)
  - `facility_id`: UUID (optional)
  - `is_active`: boolean (default: true)

#### POST /api/v1/programs
- **Purpose**: Create new program
- **Authentication**: Super Admin only
- **Request Body**:
  ```json
  {
    "organization_id": "uuid",
    "name": "Swimming",
    "description": "Comprehensive swimming program for all ages",
    "color_code": "#4A90E2",
    "icon": "swimming"
  }
  ```

#### PUT /api/v1/programs/{program_id}
- **Purpose**: Update program information

#### POST /api/v1/programs/{program_id}/facilities
- **Purpose**: Assign program to facilities
- **Request Body**:
  ```json
  {
    "facility_ids": ["uuid1", "uuid2"]
  }
  ```

### 4. User Management

#### GET /api/v1/users
- **Purpose**: List admin users
- **Authentication**: Super Admin only
- **Query Parameters**:
  - `role`: Enum (optional)
  - `is_active`: boolean (default: true)
  - `search`: string (optional) - search by name or email

#### POST /api/v1/users
- **Purpose**: Create new admin user
- **Authentication**: Super Admin only
- **Request Body**:
  ```json
  {
    "email": "admin@elitesgen.com",
    "password": "secure_password",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "program_admin",
    "program_assignments": ["program_uuid1", "program_uuid2"]
  }
  ```

#### PUT /api/v1/users/{user_id}
- **Purpose**: Update user information

#### POST /api/v1/users/{user_id}/program-assignments
- **Purpose**: Update program assignments for Program Admin
- **Request Body**:
  ```json
  {
    "program_ids": ["uuid1", "uuid2"]
  }
  ```

### 5. Curriculum Management

#### GET /api/v1/programs/{program_id}/courses
- **Purpose**: List courses for a program
- **Query Parameters**:
  - `is_active`: boolean (default: true)

#### POST /api/v1/programs/{program_id}/courses
- **Purpose**: Create new course
- **Request Body**:
  ```json
  {
    "name": "Swimming Club",
    "description": "Competitive swimming training program",
    "duration_weeks": 12,
    "min_age": 6,
    "max_age": 18,
    "prerequisites": ["prerequisite_course_uuid"]
  }
  ```

#### GET /api/v1/courses/{course_id}/curriculums
- **Purpose**: List curriculums for a course

#### POST /api/v1/courses/{course_id}/curriculums
- **Purpose**: Create new curriculum
- **Request Body**:
  ```json
  {
    "name": "Swimming Club: 6-12",
    "description": "Age-appropriate swimming curriculum",
    "min_age": 6,
    "max_age": 12,
    "total_levels": 6,
    "estimated_duration_weeks": 24
  }
  ```

#### GET /api/v1/curriculums/{curriculum_id}/levels
- **Purpose**: List levels in curriculum hierarchy

#### POST /api/v1/curriculums/{curriculum_id}/levels
- **Purpose**: Create new level
- **Request Body**:
  ```json
  {
    "level_number": 1,
    "name": "Level 1",
    "description": "Introduction to water safety and basic techniques",
    "learning_objectives": [
      "Water safety awareness",
      "Basic floating techniques",
      "Introduction to breathing"
    ],
    "equipment_requirements": [
      "Kickboard",
      "Pool noodle",
      "Goggles"
    ],
    "estimated_sessions": 8
  }
  ```

#### GET /api/v1/levels/{level_id}/modules
- **Purpose**: List modules in level

#### POST /api/v1/levels/{level_id}/modules
- **Purpose**: Create new module

#### GET /api/v1/modules/{module_id}/sections
- **Purpose**: List sections in module

#### POST /api/v1/modules/{module_id}/sections
- **Purpose**: Create new section

#### GET /api/v1/sections/{section_id}/lessons
- **Purpose**: List lessons in section

#### POST /api/v1/sections/{section_id}/lessons
- **Purpose**: Create new lesson
- **Request Body**:
  ```json
  {
    "lesson_id": "L101",
    "title": "Introduction to Water Entry",
    "description": "Safe water entry techniques and basic water orientation",
    "instructor_guidelines": "Ensure all students are comfortable...",
    "difficulty_level": "beginner",
    "content_type": "practical",
    "media_links": [
      {
        "type": "video",
        "title": "Water Entry Demonstration",
        "url": "https://example.com/video1"
      }
    ],
    "sequence_order": 1
  }
  ```

### 6. Assessment System

#### GET /api/v1/levels/{level_id}/assessment-rubrics
- **Purpose**: List assessment rubrics for level

#### POST /api/v1/levels/{level_id}/assessment-rubrics
- **Purpose**: Create assessment rubric
- **Request Body**:
  ```json
  {
    "name": "Level 1 Swimming Assessment",
    "description": "Comprehensive assessment for Level 1 completion",
    "rubric_items": [
      {
        "name": "Water Entry",
        "description": "Safe water entry techniques",
        "skill_category": "safety",
        "assessment_criteria": {
          "0_stars": "Cannot enter water safely",
          "1_star": "Enters water with significant assistance",
          "2_stars": "Enters water independently with minor guidance",
          "3_stars": "Demonstrates confident, safe water entry"
        }
      }
    ],
    "passing_criteria": {
      "minimum_overall_score": 2.0,
      "required_skills": ["water_entry", "floating"]
    }
  }
  ```

#### GET /api/v1/assessment-rubrics/{rubric_id}/items
- **Purpose**: List rubric items

#### POST /api/v1/assessment-rubrics/{rubric_id}/items
- **Purpose**: Add rubric item

### 7. Student & Parent Management

#### GET /api/v1/students
- **Purpose**: List students (filtered by user facility access)
- **Query Parameters**:
  - `facility_id`: UUID (optional)
  - `program_id`: UUID (optional)
  - `parent_id`: UUID (optional)
  - `search`: string (optional) - search by name or email
  - `age_min`: integer (optional)
  - `age_max`: integer (optional)
  - `is_active`: boolean (default: true)
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20)

#### POST /api/v1/students
- **Purpose**: Create new student
- **Request Body**:
  ```json
  {
    "parent_id": "uuid",
    "salutation": "Miss",
    "first_name": "Emma",
    "last_name": "Johnson",
    "email": "emma@example.com",
    "phone": "+1-555-0124",
    "date_of_birth": "2015-06-15",
    "gender": "female",
    "address": {
      "country": "USA",
      "state": "CA",
      "city": "Los Angeles",
      "full_address": "456 Oak Ave, Los Angeles, CA 90210"
    },
    "medical_conditions": "No known allergies",
    "emergency_contact": {
      "name": "John Johnson",
      "relationship": "Father",
      "phone": "+1-555-0125"
    },
    "referral_source": "Google search"
  }
  ```

#### GET /api/v1/students/{student_id}
- **Purpose**: Get detailed student information
- **Response**: Complete student profile with related data

#### PUT /api/v1/students/{student_id}
- **Purpose**: Update student information

#### GET /api/v1/students/{student_id}/progress
- **Purpose**: Get student progress across all enrollments
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "student_id": "uuid",
      "overall_progress": {
        "total_levels": 6,
        "completed_levels": 2,
        "current_level": 3,
        "overall_score": 2.4
      },
      "enrollments": [
        {
          "enrollment_id": "uuid",
          "course_name": "Swimming Club",
          "curriculum_name": "Swimming Club: 6-12",
          "start_date": "2024-01-15",
          "progress": {
            "current_level": 3,
            "current_module": 1,
            "sessions_attended": 24,
            "sessions_total": 48,
            "latest_assessment": {
              "date": "2024-03-15",
              "overall_score": 2.5,
              "feedback": "Great improvement in technique"
            }
          }
        }
      ]
    }
  }
  ```

#### GET /api/v1/students/{student_id}/assessments
- **Purpose**: List student assessments
- **Query Parameters**:
  - `level_id`: UUID (optional)
  - `date_from`: date (optional)
  - `date_to`: date (optional)

#### GET /api/v1/students/{student_id}/attendance
- **Purpose**: Get student attendance history
- **Query Parameters**:
  - `enrollment_id`: UUID (optional)
  - `date_from`: date (optional)
  - `date_to`: date (optional)

#### GET /api/v1/parents
- **Purpose**: List parents/guardians
- **Query Parameters**: Similar to students

#### POST /api/v1/parents
- **Purpose**: Create new parent/guardian
- **Request Body**:
  ```json
  {
    "salutation": "Mr.",
    "first_name": "Michael",
    "last_name": "Johnson",
    "email": "michael.johnson@example.com",
    "phone": "+1-555-0123",
    "address": {
      "country": "USA",
      "state": "CA",
      "city": "Los Angeles",
      "full_address": "456 Oak Ave, Los Angeles, CA 90210"
    },
    "emergency_contact": {
      "name": "Sarah Johnson",
      "relationship": "Spouse",
      "phone": "+1-555-0126"
    },
    "preferred_communication": "email"
  }
  ```

#### GET /api/v1/parents/{parent_id}
- **Purpose**: Get parent details with children information

#### PUT /api/v1/parents/{parent_id}
- **Purpose**: Update parent information

#### GET /api/v1/parents/{parent_id}/children
- **Purpose**: List parent's children

#### GET /api/v1/parents/{parent_id}/financial-summary
- **Purpose**: Consolidated financial overview for all children
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "parent_id": "uuid",
      "total_balance_due": 850.00,
      "total_credits": 120.00,
      "children_summary": [
        {
          "student_id": "uuid",
          "student_name": "Emma Johnson",
          "balance_due": 450.00,
          "credits_remaining": 60.00,
          "active_enrollments": 1
        }
      ],
      "recent_transactions": [
        {
          "transaction_id": "uuid",
          "date": "2024-03-01",
          "amount": 300.00,
          "type": "payment",
          "description": "Monthly swimming lessons"
        }
      ]
    }
  }
  ```

### 8. Instructor Management

#### GET /api/v1/instructors
- **Purpose**: List instructors (filtered by facility access)
- **Query Parameters**:
  - `facility_id`: UUID (optional)
  - `program_id`: UUID (optional)
  - `is_active`: boolean (default: true)
  - `specialization`: string (optional)

#### POST /api/v1/instructors
- **Purpose**: Create new instructor
- **Request Body**:
  ```json
  {
    "employee_id": "EMP001",
    "first_name": "Sarah",
    "last_name": "Williams",
    "email": "sarah.williams@elitesgen.com",
    "phone": "+1-555-0127",
    "address": {
      "country": "USA",
      "state": "CA",
      "city": "Los Angeles",
      "full_address": "789 Pine St, Los Angeles, CA 90210"
    },
    "hire_date": "2024-01-15",
    "certifications": [
      {
        "name": "Water Safety Instructor",
        "issuing_body": "Red Cross",
        "issue_date": "2023-06-01",
        "expiry_date": "2025-06-01"
      }
    ],
    "hourly_rate": 45.00,
    "facility_assignments": [
      {
        "facility_id": "uuid",
        "is_primary": true
      }
    ],
    "specializations": [
      {
        "program_id": "swimming_uuid",
        "course_id": "swimming_club_uuid",
        "proficiency_level": "expert"
      }
    ]
  }
  ```

#### GET /api/v1/instructors/{instructor_id}
- **Purpose**: Get instructor details

#### PUT /api/v1/instructors/{instructor_id}
- **Purpose**: Update instructor information

#### GET /api/v1/instructors/{instructor_id}/schedule
- **Purpose**: Get instructor's schedule
- **Query Parameters**:
  - `date_from`: date (required)
  - `date_to`: date (required)
  - `include_availability`: boolean (default: false)

#### GET /api/v1/instructors/{instructor_id}/availability
- **Purpose**: Check instructor availability for scheduling
- **Query Parameters**:
  - `date`: date (required)
  - `start_time`: time (required)
  - `end_time`: time (required)

### 9. Enrollment Management

#### GET /api/v1/enrollments
- **Purpose**: List enrollments (filtered by access)
- **Query Parameters**:
  - `student_id`: UUID (optional)
  - `course_id`: UUID (optional)
  - `facility_id`: UUID (optional)
  - `instructor_id`: UUID (optional)
  - `enrollment_status`: Enum (optional)
  - `payment_status`: Enum (optional)

#### POST /api/v1/enrollments
- **Purpose**: Create new enrollment
- **Request Body**:
  ```json
  {
    "student_id": "uuid",
    "course_id": "uuid",
    "curriculum_id": "uuid",
    "facility_id": "uuid",
    "instructor_id": "uuid",
    "enrollment_date": "2024-03-01",
    "start_date": "2024-03-15",
    "session_type": "group",
    "sessions_purchased": 24,
    "total_amount": 600.00,
    "payment_status": "pending"
  }
  ```

#### GET /api/v1/enrollments/{enrollment_id}
- **Purpose**: Get enrollment details

#### PUT /api/v1/enrollments/{enrollment_id}
- **Purpose**: Update enrollment information

#### POST /api/v1/enrollments/{enrollment_id}/assign-instructor
- **Purpose**: Assign or change instructor
- **Request Body**:
  ```json
  {
    "instructor_id": "uuid",
    "effective_date": "2024-03-20"
  }
  ```

### 10. Session & Schedule Management

#### GET /api/v1/sessions
- **Purpose**: List sessions (filtered by access and date range)
- **Query Parameters**:
  - `facility_id`: UUID (optional)
  - `instructor_id`: UUID (optional)
  - `program_id`: UUID (optional)
  - `course_id`: UUID (optional)
  - `date_from`: date (required)
  - `date_to`: date (required)
  - `session_status`: Enum (optional)
  - `session_type`: Enum (optional)

#### POST /api/v1/sessions
- **Purpose**: Create new session
- **Request Body**: Session creation with facility, instructor, date/time, capacity, and type
- **Response**: Created session with enrollment capacity tracking

#### GET /api/v1/sessions/{session_id}
- **Purpose**: Get session details with enrollment information

#### PUT /api/v1/sessions/{session_id}
- **Purpose**: Update session information (time, instructor, status)

#### DELETE /api/v1/sessions/{session_id}
- **Purpose**: Cancel session with reason tracking

#### GET /api/v1/sessions/{session_id}/enrollments
- **Purpose**: List students enrolled in session

#### POST /api/v1/sessions/{session_id}/enrollments
- **Purpose**: Enroll student in session
- **Request Body**: Student enrollment with enrollment_id reference

#### DELETE /api/v1/sessions/{session_id}/enrollments/{enrollment_id}
- **Purpose**: Remove student from session

#### POST /api/v1/sessions/{session_id}/attendance
- **Purpose**: Mark attendance for session
- **Request Body**: Attendance records for all enrolled students

#### GET /api/v1/recurring-sessions
- **Purpose**: List recurring session templates

#### POST /api/v1/recurring-sessions
- **Purpose**: Create recurring session pattern
- **Request Body**: Template for automatic session generation

#### POST /api/v1/recurring-sessions/{recurring_id}/generate
- **Purpose**: Generate sessions from recurring template
- **Request Body**: Date range for session generation

### 11. Assessment & Progress Tracking

#### GET /api/v1/assessments
- **Purpose**: List assessments (filtered by access)
- **Query Parameters**: student_id, instructor_id, level_id, date ranges

#### POST /api/v1/assessments
- **Purpose**: Create new assessment
- **Request Body**: Assessment with rubric scores, feedback, and recommendations

#### GET /api/v1/assessments/{assessment_id}
- **Purpose**: Get detailed assessment information

#### PUT /api/v1/assessments/{assessment_id}
- **Purpose**: Update assessment (before finalization)

#### POST /api/v1/assessments/{assessment_id}/finalize
- **Purpose**: Finalize assessment (makes it immutable)

#### GET /api/v1/students/{student_id}/progress-summary
- **Purpose**: Comprehensive progress overview across all enrollments

#### POST /api/v1/students/{student_id}/progress
- **Purpose**: Update student progress manually
- **Request Body**: Progress updates for specific levels/modules

### 12. Financial Integration

#### GET /api/v1/transactions
- **Purpose**: List transactions (filtered by access)
- **Query Parameters**: parent_id, enrollment_id, transaction_type, date ranges

#### POST /api/v1/transactions
- **Purpose**: Record new transaction
- **Request Body**: Transaction details with Zoho Books integration

#### GET /api/v1/transactions/{transaction_id}
- **Purpose**: Get transaction details

#### PUT /api/v1/transactions/{transaction_id}
- **Purpose**: Update transaction information

#### POST /api/v1/transactions/sync-zoho
- **Purpose**: Synchronize payment data from Zoho Books
- **Request Body**: Optional date range for sync

#### GET /api/v1/parents/{parent_id}/payment-history
- **Purpose**: Complete payment history for parent account

#### GET /api/v1/enrollments/{enrollment_id}/financial-summary
- **Purpose**: Financial overview for specific enrollment

#### POST /api/v1/session-credits
- **Purpose**: Add session credits to enrollment
- **Request Body**: Credit type, amount, expiry date

#### GET /api/v1/session-credits
- **Purpose**: List session credits (filtered by access)

### 13. Notification System

#### GET /api/v1/notifications
- **Purpose**: List notifications for current user
- **Query Parameters**: notification_type, priority, read status, date ranges

#### POST /api/v1/notifications
- **Purpose**: Create new notification
- **Request Body**: Notification content, recipients, delivery channels, scheduling

#### PUT /api/v1/notifications/{notification_id}/read
- **Purpose**: Mark notification as read

#### GET /api/v1/notification-templates
- **Purpose**: List available notification templates

#### POST /api/v1/notification-templates
- **Purpose**: Create new notification template
- **Request Body**: Template content for multiple channels, timing rules

#### POST /api/v1/notifications/bulk-send
- **Purpose**: Send bulk notifications
- **Request Body**: Template selection, recipient criteria, personalization data

### 14. System Administration

#### GET /api/v1/system/health
- **Purpose**: System health check
- **Authentication**: Not required
- **Response**: Database connectivity, Redis status, external integrations

#### GET /api/v1/system/settings
- **Purpose**: Get system configuration
- **Authentication**: Super Admin only

#### PUT /api/v1/system/settings
- **Purpose**: Update system configuration
- **Authentication**: Super Admin only

#### GET /api/v1/facilities/{facility_id}/settings
- **Purpose**: Get facility-specific settings

#### PUT /api/v1/facilities/{facility_id}/settings
- **Purpose**: Update facility-specific settings

#### GET /api/v1/system/audit-log
- **Purpose**: System audit trail
- **Authentication**: Super Admin only
- **Query Parameters**: entity_type, action_type, user_id, date ranges

### 15. Search & Filtering

#### GET /api/v1/search/global
- **Purpose**: Global search across students, parents, instructors
- **Query Parameters**: query string, entity types, facility filters

#### GET /api/v1/search/students
- **Purpose**: Advanced student search
- **Query Parameters**: name, email, age range, program, enrollment status

#### GET /api/v1/search/availability
- **Purpose**: Search for available session slots
- **Query Parameters**: facility, program, date range, session type, capacity requirements

## API Response Patterns

### Pagination Standard
- **Request Parameters**: page (default: 1), limit (default: 20, max: 100)
- **Response Metadata**: total_count, page, limit, total_pages, has_next, has_previous

### Error Handling
- **400 Bad Request**: Invalid input data, validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Business rule violations, scheduling conflicts
- **422 Unprocessable Entity**: Valid format but business logic errors
- **500 Internal Server Error**: Unexpected server errors

### Rate Limiting
- **Authenticated Requests**: 1000 requests per hour per user
- **Public Endpoints**: 100 requests per hour per IP
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## Mobile App API Considerations

### Parent/Student App APIs
- **Enrollment Management**: Simplified enrollment flows
- **Schedule Viewing**: Read-only schedule access with filtering
- **Progress Tracking**: Student progress visualization
- **Payment Integration**: View payment status, make payments
- **Notifications**: Push notification registration and management

### Instructor App APIs
- **Session Management**: Session details, attendance marking
- **Assessment Recording**: Mobile-optimized assessment forms
- **Curriculum Access**: Offline-capable content delivery
- **Student Lookup**: Quick access to student information
- **Progress Submission**: Submit assessments and progress updates

### Offline Support Strategy
- **Critical Data Caching**: Session details, student lists, curriculum content
- **Sync Endpoints**: Bulk data sync for offline operation
- **Conflict Resolution**: Merge strategies for offline changes
- **Queue Management**: Background sync of pending operations

## Integration Specifications

### Zoho Books Integration
- **Authentication**: OAuth 2.0 or API key authentication
- **Sync Frequency**: Real-time for payments, daily for invoices
- **Data Mapping**: Academy transactions to Zoho Books entities
- **Error Handling**: Graceful fallback for integration failures

### External Notification Services
- **Email Service**: SMTP integration with template support
- **SMS Service**: Third-party SMS provider integration
- **Push Notifications**: Firebase Cloud Messaging for mobile apps

## Performance & Caching

### Caching Strategy
- **Redis Caching**: Frequently accessed data (30-minute TTL)
- **Database Query Caching**: Complex curriculum hierarchy queries
- **API Response Caching**: Static data with appropriate cache headers
- **Session Caching**: User session data and permissions

### Performance Optimization
- **Database Indexing**: Optimized indexes for frequent query patterns
- **Query Optimization**: Efficient joins for complex relationships
- **Pagination**: Consistent pagination for large datasets
- **Async Processing**: Background tasks for heavy operations

### Monitoring & Logging
- **Request Logging**: Comprehensive API request/response logging
- **Performance Monitoring**: Response time tracking and alerting
- **Error Tracking**: Detailed error logging with context
- **Business Metrics**: Enrollment, attendance, and progress tracking

This comprehensive API architecture provides a solid foundation for the admin dashboard while preparing for seamless mobile app integration, ensuring scalable, maintainable, and performant academy management operations.