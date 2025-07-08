# Location Management API Specification

## API Overview

The Location Management API provides comprehensive multi-location support for the Academy Management System, enabling facility-specific operations with consolidated oversight. This API allows the academy to manage multiple physical locations with facility-specific data segregation while maintaining centralized administrative control and cross-location visibility.

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
- **Super Admin**: Full access to all location management endpoints
- **Program Admin**: Access limited to assigned locations
- **Instructor**: Read-only access to assigned locations
- **Location Manager**: Full access to specific location data

## Location Context Headers

Many endpoints support location context through headers:
```
X-Location-Context: <location_id>
```

## Detailed Endpoint Specifications

### Location Management Endpoints

#### GET /locations
List all locations with filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `is_active` (boolean): Filter by active status
- `has_program` (UUID): Filter locations offering specific program
- `search` (string): Search by location name, code, or city
- `country` (string): Filter by country
- `state` (string): Filter by state/province

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Main Academy",
        "code": "MAIN",
        "address": {
          "address_line1": "123 Academy Street",
          "address_line2": "Suite 100",
          "city": "Aquatown",
          "state": "California",
          "country": "USA",
          "postal_code": "90210"
        },
        "contact": {
          "phone": "+1-555-0123",
          "email": "main@academy.com"
        },
        "capacity_limit": 50,
        "time_zone": "America/Los_Angeles",
        "is_active": true,
        "programs_count": 3,
        "students_count": 125,
        "instructors_count": 8,
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

#### POST /locations
Create new location (Super Admin only).

**Request Body:**
```json
{
  "name": "Downtown Branch",
  "code": "DOWN",
  "address": {
    "address_line1": "456 Downtown Ave",
    "address_line2": "Floor 2",
    "city": "Metropolitan",
    "state": "California",
    "country": "USA",
    "postal_code": "90211"
  },
  "contact": {
    "phone": "+1-555-0124",
    "email": "downtown@academy.com"
  },
  "capacity_limit": 75,
  "time_zone": "America/Los_Angeles",
  "settings": {
    "booking_window_days": 30,
    "cancellation_window_hours": 24,
    "auto_waitlist": true
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "name": "Downtown Branch",
    "code": "DOWN",
    "address": {
      "address_line1": "456 Downtown Ave",
      "address_line2": "Floor 2",
      "city": "Metropolitan",
      "state": "California",
      "country": "USA",
      "postal_code": "90211"
    },
    "contact": {
      "phone": "+1-555-0124",
      "email": "downtown@academy.com"
    },
    "capacity_limit": 75,
    "time_zone": "America/Los_Angeles",
    "is_active": true,
    "settings": {
      "booking_window_days": 30,
      "cancellation_window_hours": 24,
      "auto_waitlist": true
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /locations/{id}
Get detailed location information.

**Path Parameters:**
- `id` (UUID): Location ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Main Academy",
    "code": "MAIN",
    "address": {
      "address_line1": "123 Academy Street",
      "address_line2": "Suite 100",
      "city": "Aquatown",
      "state": "California",
      "country": "USA",
      "postal_code": "90210"
    },
    "contact": {
      "phone": "+1-555-0123",
      "email": "main@academy.com"
    },
    "capacity_limit": 50,
    "time_zone": "America/Los_Angeles",
    "is_active": true,
    "settings": {
      "booking_window_days": 28,
      "cancellation_window_hours": 24,
      "auto_waitlist": true,
      "require_medical_forms": true,
      "allow_parent_booking": true
    },
    "statistics": {
      "total_students": 125,
      "active_students": 118,
      "total_instructors": 8,
      "active_programs": 3,
      "monthly_sessions": 240,
      "capacity_utilization": 0.78
    },
    "programs": [
      {
        "program_id": "program-id-1",
        "program_name": "Swimming",
        "is_active": true,
        "capacity_limit": 30,
        "current_enrollment": 85
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /locations/{id}
Update location information (Super Admin only).

**Path Parameters:**
- `id` (UUID): Location ID

**Request Body:**
```json
{
  "name": "Main Academy - Updated",
  "contact": {
    "phone": "+1-555-0125",
    "email": "main-updated@academy.com"
  },
  "capacity_limit": 60,
  "settings": {
    "booking_window_days": 30,
    "cancellation_window_hours": 24,
    "auto_waitlist": true,
    "require_medical_forms": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Main Academy - Updated",
    "contact": {
      "phone": "+1-555-0125",
      "email": "main-updated@academy.com"
    },
    "capacity_limit": 60,
    "settings": {
      "booking_window_days": 30,
      "cancellation_window_hours": 24,
      "auto_waitlist": true,
      "require_medical_forms": true
    },
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

#### DELETE /locations/{id}
Deactivate location (Super Admin only).

**Path Parameters:**
- `id` (UUID): Location ID

**Query Parameters:**
- `transfer_students_to` (UUID): Target location for student transfers
- `transfer_instructors_to` (UUID): Target location for instructor transfers
- `cancel_future_sessions` (boolean): Cancel all future sessions (default: true)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "deactivated_at": "2024-01-15T14:30:00Z",
    "transfer_summary": {
      "students_transferred": 125,
      "instructors_transferred": 8,
      "sessions_cancelled": 45,
      "target_location": {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "name": "Downtown Branch"
      }
    }
  }
}
```

### Location Program Management

#### GET /locations/{id}/programs
Get programs offered at a specific location.

**Path Parameters:**
- `id` (UUID): Location ID

**Query Parameters:**
- `is_active` (boolean): Filter by program active status
- `include_enrollment_stats` (boolean): Include enrollment statistics

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_name": "Main Academy",
    "programs": [
      {
        "id": "location-program-id-1",
        "program_id": "program-id-1",
        "program_name": "Swimming",
        "program_category": "Aquatics",
        "is_active": true,
        "capacity_limit": 30,
        "settings": {
          "min_age": 3,
          "max_age": 18,
          "requires_assessment": true
        },
        "enrollment_stats": {
          "current_enrollment": 85,
          "capacity_utilization": 0.85,
          "waitlist_count": 12,
          "active_courses": 3
        },
        "assigned_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /locations/{id}/programs
Assign program to location.

**Path Parameters:**
- `id` (UUID): Location ID

**Request Body:**
```json
{
  "program_id": "program-id-2",
  "is_active": true,
  "capacity_limit": 25,
  "settings": {
    "min_age": 6,
    "max_age": 16,
    "requires_assessment": false,
    "equipment_included": true
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "location-program-id-2",
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "program_id": "program-id-2",
    "program_name": "Football",
    "is_active": true,
    "capacity_limit": 25,
    "settings": {
      "min_age": 6,
      "max_age": 16,
      "requires_assessment": false,
      "equipment_included": true
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE /locations/{id}/programs/{program_id}
Remove program from location.

**Path Parameters:**
- `id` (UUID): Location ID
- `program_id` (UUID): Program ID

**Query Parameters:**
- `transfer_students_to_location` (UUID): Transfer students to another location
- `cancel_future_sessions` (boolean): Cancel future sessions (default: true)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "program_id": "program-id-2",
    "removed_at": "2024-01-15T14:30:00Z",
    "impact_summary": {
      "students_affected": 15,
      "students_transferred": 12,
      "students_withdrawn": 3,
      "sessions_cancelled": 8,
      "instructors_reassigned": 2
    }
  }
}
```

### Location-Specific Operations

#### GET /locations/{id}/students
Get students at specific location.

**Path Parameters:**
- `id` (UUID): Location ID

**Query Parameters:**
- `program_id` (UUID): Filter by program
- `status` (string): Filter by student status
- `enrollment_date_from` (date): Filter by enrollment date
- `enrollment_date_to` (date): Filter by enrollment date
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_name": "Main Academy",
    "students": [
      {
        "id": "student-id-1",
        "student_id": "STU-2024-0001",
        "name": "Emma Johnson",
        "age": 9,
        "status": "active",
        "enrollment_date": "2024-01-15",
        "programs": [
          {
            "program_name": "Swimming",
            "enrollment_status": "active",
            "current_level": "Level 1"
          }
        ],
        "parent_contact": {
          "name": "Sarah Johnson",
          "email": "sarah.johnson@email.com",
          "phone": "+1234567890"
        }
      }
    ],
    "summary": {
      "total_students": 125,
      "active_students": 118,
      "by_program": {
        "Swimming": 85,
        "Football": 30,
        "Basketball": 10
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 125,
      "total_pages": 7
    }
  }
}
```

#### GET /locations/{id}/instructors
Get instructors at specific location.

**Path Parameters:**
- `id` (UUID): Location ID

**Query Parameters:**
- `program_id` (UUID): Filter by program qualification
- `is_active` (boolean): Filter by active status
- `include_schedule` (boolean): Include current schedule information

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_name": "Main Academy",
    "instructors": [
      {
        "id": "instructor-id-1",
        "instructor_id": "INS-2024-0001",
        "name": "Mike Wilson",
        "email": "mike.wilson@academy.com",
        "phone": "+1234567892",
        "qualifications": ["Swimming", "Water Safety"],
        "assignment_type": "primary",
        "is_active": true,
        "weekly_hours": 25,
        "programs": [
          {
            "program_name": "Swimming",
            "active_students": 45,
            "weekly_sessions": 12
          }
        ],
        "schedule_summary": {
          "this_week_sessions": 12,
          "next_week_sessions": 10,
          "availability_rating": "high"
        },
        "assigned_at": "2024-01-01T00:00:00Z"
      }
    ],
    "summary": {
      "total_instructors": 8,
      "active_instructors": 7,
      "by_program": {
        "Swimming": 4,
        "Football": 3,
        "Basketball": 1
      }
    }
  }
}
```

#### GET /locations/{id}/schedules
Get schedules for specific location.

**Path Parameters:**
- `id` (UUID): Location ID

**Query Parameters:**
- `date_from` (date): Start date filter
- `date_to` (date): End date filter
- `program_id` (UUID): Filter by program
- `instructor_id` (UUID): Filter by instructor
- `session_type` (string): Filter by session type
- `status` (string): Filter by session status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_name": "Main Academy",
    "schedule_period": {
      "start_date": "2024-01-20",
      "end_date": "2024-01-27"
    },
    "sessions": [
      {
        "id": "session-id-1",
        "title": "Swimming Club - Level 1",
        "program_name": "Swimming",
        "instructor_name": "Mike Wilson",
        "session_type": "group",
        "start_time": "2024-01-20T10:00:00Z",
        "end_time": "2024-01-20T11:00:00Z",
        "capacity": 5,
        "enrolled_count": 3,
        "status": "scheduled"
      }
    ],
    "summary": {
      "total_sessions": 45,
      "by_status": {
        "scheduled": 40,
        "completed": 3,
        "cancelled": 2
      },
      "capacity_utilization": 0.78,
      "peak_hours": ["10:00-11:00", "15:00-16:00", "17:00-18:00"]
    }
  }
}
```

#### GET /locations/{id}/capacity
Get location capacity information and utilization.

**Path Parameters:**
- `id` (UUID): Location ID

**Query Parameters:**
- `date` (date): Specific date for capacity check (default: today)
- `include_projections` (boolean): Include future capacity projections

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_name": "Main Academy",
    "capacity_overview": {
      "total_capacity": 50,
      "current_utilization": 39,
      "utilization_percentage": 0.78,
      "available_spots": 11
    },
    "by_program": {
      "Swimming": {
        "capacity_limit": 30,
        "current_enrollment": 25,
        "utilization_percentage": 0.83
      },
      "Football": {
        "capacity_limit": 15,
        "current_enrollment": 10,
        "utilization_percentage": 0.67
      },
      "Basketball": {
        "capacity_limit": 5,
        "current_enrollment": 4,
        "utilization_percentage": 0.80
      }
    },
    "daily_utilization": [
      {
        "date": "2024-01-20",
        "sessions": 8,
        "total_participants": 32,
        "peak_hour": "15:00-16:00",
        "utilization_percentage": 0.64
      }
    ],
    "projections": {
      "next_week": {
        "expected_utilization": 0.82,
        "bottleneck_hours": ["15:00-16:00", "17:00-18:00"]
      },
      "next_month": {
        "expected_utilization": 0.85,
        "capacity_recommendations": "Consider expanding swimming program capacity"
      }
    }
  }
}
```

#### GET /locations/{id}/dashboard
Get location dashboard summary.

**Path Parameters:**
- `id` (UUID): Location ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "location_id": "123e4567-e89b-12d3-a456-426614174000",
    "location_name": "Main Academy",
    "dashboard_date": "2024-01-20",
    "overview": {
      "total_students": 125,
      "active_students": 118,
      "total_instructors": 8,
      "active_programs": 3
    },
    "todays_activity": {
      "scheduled_sessions": 8,
      "completed_sessions": 3,
      "cancelled_sessions": 0,
      "students_checked_in": 18,
      "capacity_utilization": 0.72
    },
    "recent_enrollments": [
      {
        "student_name": "New Student",
        "program_name": "Swimming",
        "enrollment_date": "2024-01-19"
      }
    ],
    "upcoming_sessions": [
      {
        "session_id": "session-id-1",
        "title": "Swimming Club - Level 1",
        "start_time": "15:00",
        "instructor_name": "Mike Wilson",
        "participants_count": 3,
        "capacity": 5
      }
    ],
    "alerts": [
      {
        "type": "capacity_warning",
        "message": "Swimming program approaching capacity limit",
        "severity": "medium",
        "action_required": "Consider adding more sessions"
      }
    ],
    "performance_metrics": {
      "this_month": {
        "sessions_completed": 124,
        "attendance_rate": 0.87,
        "revenue": 15750.00,
        "growth_rate": 0.12
      },
      "comparison_to_last_month": {
        "sessions_change": "+15",
        "attendance_change": "+3.2%",
        "revenue_change": "+$1,250"
      }
    }
  }
}
```

### Student Location Management

#### POST /students/{id}/transfer
Transfer student to different location.

**Path Parameters:**
- `id` (UUID): Student ID

**Request Body:**
```json
{
  "to_location_id": "789e0123-e89b-12d3-a456-426614174002",
  "transfer_reason": "Family moved to new area",
  "effective_date": "2024-02-01",
  "transfer_enrollments": true,
  "transfer_credits": true,
  "notify_parties": true,
  "notes": "Student requested transfer to downtown location"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transfer_id": "transfer-id-1",
    "student_id": "student-id-1",
    "student_name": "Emma Johnson",
    "from_location": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Main Academy"
    },
    "to_location": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Downtown Branch"
    },
    "transfer_reason": "Family moved to new area",
    "effective_date": "2024-02-01",
    "transfer_summary": {
      "enrollments_transferred": 1,
      "credits_transferred": 8,
      "sessions_cancelled": 3,
      "sessions_rescheduled": 2
    },
    "notifications_sent": {
      "parent": true,
      "old_instructor": true,
      "new_instructor": true,
      "admin": true
    },
    "transferred_at": "2024-01-20T10:30:00Z",
    "transferred_by": "admin-id-1"
  }
}
```

#### GET /students/{id}/location-history
Get student location transfer history.

**Path Parameters:**
- `id` (UUID): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student_id": "student-id-1",
    "student_name": "Emma Johnson",
    "current_location": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Downtown Branch"
    },
    "transfer_history": [
      {
        "id": "transfer-id-1",
        "from_location": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Main Academy"
        },
        "to_location": {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "name": "Downtown Branch"
        },
        "transfer_reason": "Family moved to new area",
        "transfer_date": "2024-02-01",
        "transferred_by": "admin-id-1",
        "notes": "Student requested transfer to downtown location"
      }
    ],
    "total_transfers": 1
  }
}
```

### Instructor Location Management

#### POST /instructors/{id}/locations
Assign instructor to location.

**Path Parameters:**
- `id` (UUID): Instructor ID

**Request Body:**
```json
{
  "location_id": "789e0123-e89b-12d3-a456-426614174002",
  "is_primary": false,
  "effective_from": "2024-02-01",
  "weekly_hours_limit": 20,
  "programs": ["Swimming", "Water Safety"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "assignment_id": "assignment-id-1",
    "instructor_id": "instructor-id-1",
    "instructor_name": "Mike Wilson",
    "location_id": "789e0123-e89b-12d3-a456-426614174002",
    "location_name": "Downtown Branch",
    "is_primary": false,
    "effective_from": "2024-02-01",
    "weekly_hours_limit": 20,
    "programs": ["Swimming", "Water Safety"],
    "assigned_at": "2024-01-20T10:30:00Z",
    "assigned_by": "admin-id-1"
  }
}
```

#### GET /instructors/{id}/locations
Get instructor location assignments.

**Path Parameters:**
- `id` (UUID): Instructor ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "instructor_id": "instructor-id-1",
    "instructor_name": "Mike Wilson",
    "location_assignments": [
      {
        "assignment_id": "assignment-id-1",
        "location_id": "123e4567-e89b-12d3-a456-426614174000",
        "location_name": "Main Academy",
        "is_primary": true,
        "weekly_hours_limit": 30,
        "current_weekly_hours": 25,
        "programs": ["Swimming", "Water Safety"],
        "assigned_at": "2024-01-01T00:00:00Z"
      },
      {
        "assignment_id": "assignment-id-2",
        "location_id": "789e0123-e89b-12d3-a456-426614174002",
        "location_name": "Downtown Branch",
        "is_primary": false,
        "weekly_hours_limit": 20,
        "current_weekly_hours": 8,
        "programs": ["Swimming"],
        "assigned_at": "2024-02-01T00:00:00Z"
      }
    ],
    "summary": {
      "total_locations": 2,
      "primary_location": "Main Academy",
      "total_weekly_hours": 33,
      "max_weekly_hours": 50
    }
  }
}
```

### Cross-Location Operations

#### GET /reports/cross-location
Generate cross-location reports.

**Query Parameters:**
- `report_type` (string): Type of report (enrollment, revenue, utilization, performance)
- `date_from` (date): Start date for report
- `date_to` (date): End date for report
- `location_ids` (array): Specific locations to include
- `program_id` (UUID): Filter by program
- `format` (string): Response format (json, csv, pdf)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "report_type": "enrollment",
    "report_period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "locations": [
      {
        "location_id": "123e4567-e89b-12d3-a456-426614174000",
        "location_name": "Main Academy",
        "enrollment_stats": {
          "total_students": 125,
          "new_enrollments": 15,
          "withdrawals": 3,
          "net_growth": 12,
          "growth_rate": 0.106
        },
        "by_program": {
          "Swimming": {
            "total_students": 85,
            "new_enrollments": 10,
            "growth_rate": 0.133
          },
          "Football": {
            "total_students": 30,
            "new_enrollments": 4,
            "growth_rate": 0.154
          }
        }
      }
    ],
    "totals": {
      "total_students_all_locations": 200,
      "total_new_enrollments": 25,
      "average_growth_rate": 0.125
    },
    "comparisons": {
      "best_performing_location": "Main Academy",
      "highest_growth_rate": 0.106,
      "most_popular_program": "Swimming"
    }
  }
}
```

#### GET /analytics/locations
Get location analytics and performance data.

**Query Parameters:**
- `metric` (string): Specific metric (enrollment, revenue, utilization, satisfaction)
- `period` (string): Time period (day, week, month, quarter, year)
- `compare_to` (string): Comparison period (previous_period, same_period_last_year)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analytics_period": "month",
    "report_date": "2024-01-31",
    "locations": [
      {
        "location_id": "123e4567-e89b-12d3-a456-426614174000",
        "location_name": "Main Academy",
        "metrics": {
          "enrollment": {
            "current": 125,
            "previous": 113,
            "change": 12,
            "change_percentage": 0.106
          },
          "revenue": {
            "current": 18750.00,
            "previous": 16950.00,
            "change": 1800.00,
            "change_percentage": 0.106
          },
          "utilization": {
            "current": 0.78,
            "previous": 0.72,
            "change": 0.06,
            "change_percentage": 0.083
          },
          "satisfaction": {
            "current": 4.6,
            "previous": 4.4,
            "change": 0.2,
            "change_percentage": 0.045
          }
        },
        "trends": {
          "enrollment_trend": "increasing",
          "revenue_trend": "increasing",
          "utilization_trend": "increasing",
          "satisfaction_trend": "stable"
        }
      }
    ],
    "insights": [
      {
        "type": "opportunity",
        "message": "Main Academy showing strong growth, consider capacity expansion",
        "priority": "high"
      },
      {
        "type": "warning",
        "message": "Downtown Branch utilization below target, review programming",
        "priority": "medium"
      }
    ]
  }
}
```

### User Location Assignments

#### GET /users/{id}/locations
Get user location assignments.

**Path Parameters:**
- `id` (UUID): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "user-id-1",
    "user_name": "Jane Admin",
    "role": "program_admin",
    "location_assignments": [
      {
        "assignment_id": "user-location-id-1",
        "location_id": "123e4567-e89b-12d3-a456-426614174000",
        "location_name": "Main Academy",
        "can_manage": true,
        "assigned_at": "2024-01-01T00:00:00Z",
        "assigned_by": "super-admin-id"
      }
    ],
    "permissions": {
      "can_view_all_locations": false,
      "can_create_locations": false,
      "can_transfer_students": true,
      "can_manage_schedules": true
    }
  }
}
```

#### POST /users/{id}/locations
Assign user to location.

**Path Parameters:**
- `id` (UUID): User ID

**Request Body:**
```json
{
  "location_id": "789e0123-e89b-12d3-a456-426614174002",
  "can_manage": true,
  "permissions": {
    "manage_students": true,
    "manage_schedules": true,
    "view_reports": true,
    "manage_instructors": false
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "assignment_id": "user-location-id-2",
    "user_id": "user-id-1",
    "location_id": "789e0123-e89b-12d3-a456-426614174002",
    "location_name": "Downtown Branch",
    "can_manage": true,
    "permissions": {
      "manage_students": true,
      "manage_schedules": true,
      "view_reports": true,
      "manage_instructors": false
    },
    "assigned_at": "2024-01-20T10:30:00Z",
    "assigned_by": "super-admin-id"
  }
}
```

## Data Models and Schemas

### Location Model
```json
{
  "id": "UUID",
  "name": "string (required)",
  "code": "string (required, unique)",
  "address": {
    "address_line1": "string",
    "address_line2": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postal_code": "string"
  },
  "contact": {
    "phone": "string",
    "email": "string"
  },
  "capacity_limit": "integer",
  "time_zone": "string",
  "is_active": "boolean",
  "settings": "object",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Location Program Assignment Model
```json
{
  "id": "UUID",
  "location_id": "UUID (required)",
  "program_id": "UUID (required)",
  "is_active": "boolean",
  "capacity_limit": "integer",
  "settings": "object",
  "created_at": "ISO 8601 datetime"
}
```

### Student Transfer Model
```json
{
  "id": "UUID",
  "student_id": "UUID (required)",
  "from_location_id": "UUID",
  "to_location_id": "UUID (required)",
  "transfer_reason": "string",
  "transfer_date": "ISO 8601 datetime",
  "transferred_by": "UUID",
  "notes": "string"
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

### Location Transfer Error
```json
{
  "success": false,
  "error": {
    "code": "TRANSFER_CONFLICT",
    "message": "Cannot transfer student due to conflicts",
    "details": {
      "conflicts": [
        {
          "type": "program_not_available",
          "message": "Swimming program not offered at target location"
        },
        {
          "type": "capacity_exceeded",
          "message": "Target location at capacity for this program"
        }
      ]
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
- **409 Conflict**: Location conflict (e.g., code already exists)
- **422 Unprocessable Entity**: Validation errors
- **423 Locked**: Resource locked during transfer
- **500 Internal Server Error**: Server error

## Rate Limiting

### General API Endpoints
- **Limit**: 1000 requests per hour per authenticated user
- **Burst**: 100 requests per minute

### Transfer Operations
- **Student Transfers**: 10 transfers per hour per user
- **Bulk Operations**: 5 operations per hour per user

## Security Considerations

### Access Control
- Location-based access control strictly enforced
- Super Admin required for location creation/deletion
- Program Admin access limited to assigned locations
- Transfer permissions validated

### Data Protection
- Location-specific data isolation
- Cross-location operation audit logging
- Secure handling of student transfer data
- Location context validation

### Business Logic Security
- Capacity limits enforced during transfers
- Program availability validation
- Schedule conflict prevention
- Financial settlement during transfers

## Example Usage

### Complete Student Transfer Flow
```javascript
// 1. Check target location capacity
const capacityResponse = await fetch('/api/v1/locations/target-location-id/capacity', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 2. Verify program availability at target location
const programsResponse = await fetch('/api/v1/locations/target-location-id/programs', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 3. Initiate student transfer
const transferResponse = await fetch('/api/v1/students/student-id/transfer', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to_location_id: 'target-location-id',
    transfer_reason: 'Family relocated',
    effective_date: '2024-02-01',
    transfer_enrollments: true,
    transfer_credits: true,
    notify_parties: true
  })
});

// 4. Monitor transfer status
const historyResponse = await fetch('/api/v1/students/student-id/location-history', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### Multi-Location Dashboard Setup
```javascript
// 1. Get user's assigned locations
const userLocationsResponse = await fetch('/api/v1/users/current-user-id/locations', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 2. Get dashboard data for each location
const dashboardPromises = userLocations.map(location => 
  fetch(`/api/v1/locations/${location.location_id}/dashboard`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
);

const dashboards = await Promise.all(dashboardPromises);

// 3. Generate cross-location analytics
const analyticsResponse = await fetch('/api/v1/analytics/locations?metric=enrollment&period=month', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

## Testing Endpoints

### Get Location Details
```bash
curl -X GET "https://api.academy-admin.com/api/v1/locations/location-id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Transfer Student
```bash
curl -X POST "https://api.academy-admin.com/api/v1/students/student-id/transfer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_location_id": "target-location-id",
    "transfer_reason": "Family moved",
    "effective_date": "2024-02-01",
    "transfer_enrollments": true
  }'
```

### Get Cross-Location Report
```bash
curl -X GET "https://api.academy-admin.com/api/v1/reports/cross-location?report_type=enrollment&date_from=2024-01-01&date_to=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Assign Program to Location
```bash
curl -X POST "https://api.academy-admin.com/api/v1/locations/location-id/programs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "program_id": "program-id",
    "capacity_limit": 30,
    "is_active": true
  }'
```