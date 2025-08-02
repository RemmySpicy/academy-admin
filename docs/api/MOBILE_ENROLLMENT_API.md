# Mobile Enrollment API Documentation

## Overview

This document outlines the enrollment API endpoints available for mobile applications (Student/Parent and Instructor apps). The enrollment system supports facility-based course enrollment with real-time validation, pricing calculation, and payment tracking.

## Base URL
```
https://your-academy-api.com/api/v1
```

## Authentication
All requests require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Program Context
All enrollment operations are scoped by program context via the `X-Program-Context` header:
```
X-Program-Context: <program_id>
```

---

## Course Discovery & Information

### Get Available Courses
Get courses available for enrollment in the current program.

**Endpoint:** `GET /course-assignments/assignable-courses`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course-123",
      "name": "Swimming Fundamentals",
      "description": "Learn basic swimming techniques",
      "sequence": 1,
      "status": "active",
      "max_students": 12,
      "age_groups": ["6-8", "9-12", "13-16"],
      "location_types": ["our-facility", "client-location"],
      "session_types": ["group", "private"],
      "difficulty_level": "beginner",
      "duration_weeks": 8,
      "requires_facility": true
    }
  ]
}
```

### Get Course Details
**Endpoint:** `GET /courses/{course_id}`

---

## Enrollment Validation

### Check Age Eligibility
Validate if a student's age makes them eligible for a course.

**Endpoint:** `GET /course-assignments/student-age-eligibility/{user_id}/{course_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "reason": null,
    "student_age": 10,
    "course_age_groups": ["6-8", "9-12"],
    "applicable_age_groups": ["9-12"],
    "recommended_age_group": "9-12"
  }
}
```

### Validate Facility Availability
Check if a course is available at a specific facility with given parameters.

**Endpoint:** `GET /course-assignments/validate-facility-availability/{course_id}/{facility_id}`

**Query Parameters:**
- `age_group` (required): Age group for the student
- `location_type` (required): `our-facility`, `client-location`, or `virtual`
- `session_type` (required): `private`, `group`, or `school_group`

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "facility_name": "Olympic Swimming Pool",
    "reason": null,
    "price": 25000.0,
    "pricing_notes": "Group sessions available",
    "course_name": "Swimming Fundamentals",
    "course_description": "Learn basic swimming techniques",
    "supported_age_groups": ["6-8", "9-12", "13-16"],
    "supported_location_types": ["our-facility"],
    "supported_session_types": ["group", "private"],
    "suggestion": null
  }
}
```

---

## Facility Discovery

### Get Available Facilities for Course
Find all facilities where a course is available with specified parameters.

**Endpoint:** `GET /course-assignments/available-facilities/{course_id}`

**Query Parameters:**
- `age_group` (required): Age group
- `location_type` (required): Location type
- `session_type` (required): Session type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "facility_id": "facility-123",
      "facility_name": "Olympic Swimming Pool",
      "address": "123 Sports Center Ave, Lagos",
      "price": 25000.0,
      "pricing_notes": "Group sessions available weekdays",
      "contact_phone": "+234-xxx-xxx-xxxx",
      "operating_hours": {
        "monday": "6:00-22:00",
        "tuesday": "6:00-22:00",
        "wednesday": "6:00-22:00",
        "thursday": "6:00-22:00",
        "friday": "6:00-22:00",
        "saturday": "8:00-20:00",
        "sunday": "10:00-18:00"
      }
    }
  ]
}
```

### Get Student's Default Facility
Get the most recently used facility for a student.

**Endpoint:** `GET /course-assignments/student-default-facility/{user_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "facility_id": "facility-123",
    "facility_name": "Olympic Swimming Pool",
    "last_used_date": "2025-01-15",
    "location_type": "our-facility",
    "session_type": "group"
  }
}
```

---

## Pricing & Payment

### Calculate Enrollment Pricing
Calculate total pricing including coupon discounts for an enrollment.

**Endpoint:** `POST /course-assignments/calculate-pricing`

**Request Body:**
```json
{
  "facility_id": "facility-123",
  "course_id": "course-123",
  "age_group": "9-12",
  "location_type": "our-facility",
  "session_type": "group",
  "coupon_code": "SAVE10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "base_price": 25000.0,
    "discount_amount": 2500.0,
    "total_amount": 22500.0,
    "coupon_code": "SAVE10",
    "coupon_valid": true,
    "coupon_message": "10% discount applied",
    "payment_thresholds": {
      "minimum_payment": 11250.0,
      "full_payment": 22500.0
    }
  }
}
```

---

## Enrollment Operations

### Create Course Enrollment
Enroll a student in a course with facility selection and payment tracking.

**Endpoint:** `POST /course-assignments/assign`

**Request Body:**
```json
{
  "user_id": "user-123",
  "course_id": "course-123",
  "facility_id": "facility-123",
  "location_type": "our-facility",
  "session_type": "group",
  "age_group": "9-12",
  "coupon_code": "SAVE10",
  "assignment_type": "direct",
  "credits_awarded": 0,
  "assignment_notes": "Parent requested group sessions",
  "referral_source": "Mobile App",
  "special_requirements": "Needs beginner-friendly approach",
  "notes": "First time swimming student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course assignment successful with facility-based enrollment",
  "data": {
    "enrollment": {
      "id": "enrollment-123",
      "user_id": "user-123",
      "course_id": "course-123",
      "program_id": "program-123",
      "status": "active",
      "enrollment_date": "2025-08-01T10:00:00Z",
      "enrollment_fee": 0.0,
      "outstanding_balance": 22500.0,
      "facility_id": "facility-123",
      "facility_name": "Olympic Swimming Pool",
      "location_type": "our-facility",
      "session_type": "group",
      "age_group": "9-12",
      "payment_status": "unpaid",
      "total_amount": 22500.0,
      "amount_paid": 0.0,
      "coupon_code": "SAVE10",
      "discount_amount": 2500.0,
      "can_start_sessions": false,
      "payment_percentage": 0.0
    },
    "pricing_breakdown": {
      "base_price": 25000.0,
      "discount_amount": 2500.0,
      "total_amount": 22500.0,
      "coupon_valid": true,
      "coupon_message": "10% discount applied"
    }
  }
}
```

### Remove Course Enrollment
Remove a student's course enrollment.

**Endpoint:** `DELETE /course-assignments/remove/{user_id}/{course_id}`

**Request Body:**
```json
{
  "reason": "Student no longer interested"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course assignment removed successfully"
}
```

---

## Student Progress & Information

### Get User's Course Assignments
Get all course enrollments for a user in the current program.

**Endpoint:** `GET /course-assignments/user-assignments/{user_id}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "enrollment_id": "enrollment-123",
      "course_id": "course-123",
      "course_name": "Swimming Fundamentals",
      "program_id": "program-123",
      "program_name": "Swimming Program",
      "status": "active",
      "enrollment_date": "2025-08-01T10:00:00Z",
      "enrollment_fee": 0.0,
      "outstanding_balance": 11250.0,
      "progress_percentage": 25.0,
      "facility_id": "facility-123",
      "facility_name": "Olympic Swimming Pool",
      "location_type": "our-facility",
      "session_type": "group",
      "age_group": "9-12",
      "payment_status": "partially_paid",
      "total_amount": 22500.0,
      "amount_paid": 11250.0,
      "coupon_code": "SAVE10",
      "discount_amount": 2500.0,
      "payment_percentage": 50.0,
      "can_start_sessions": true,
      "referral_source": "Mobile App",
      "special_requirements": "Needs beginner-friendly approach",
      "notes": "First time swimming student"
    }
  ]
}
```

---

## Bulk Operations

### Bulk Enrollment
Enroll multiple students in courses simultaneously.

**Endpoint:** `POST /course-assignments/bulk-assign`

**Request Body:**
```json
{
  "assignments": [
    {
      "user_id": "user-123",
      "course_id": "course-123",
      "facility_id": "facility-123",
      "location_type": "our-facility",
      "session_type": "group",
      "age_group": "9-12",
      "coupon_code": "SAVE10"
    },
    {
      "user_id": "user-456",
      "course_id": "course-123",
      "facility_id": "facility-123",
      "location_type": "our-facility",
      "session_type": "group",
      "age_group": "6-8"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_processed": 2,
    "total_successful": 2,
    "total_failed": 0,
    "successful_assignments": [
      {
        "enrollment_id": "enrollment-123",
        "user_id": "user-123",
        "course_id": "course-123",
        "status": "active",
        "enrollment_date": "2025-08-01T10:00:00Z",
        "facility_id": "facility-123",
        "facility_name": "Olympic Swimming Pool",
        "total_amount": 22500.0,
        "can_start_sessions": false
      }
    ],
    "failed_assignments": []
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Student age eligibility failed: Student is too young for this course",
    "details": {
      "field": "age_group",
      "provided": "3-5",
      "required": ["6-8", "9-12", "13-16"]
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AGE_ELIGIBILITY_FAILED`: Student doesn't meet age requirements
- `FACILITY_UNAVAILABLE`: Course not available at selected facility
- `PAYMENT_REQUIRED`: Payment needed before session access
- `ENROLLMENT_EXISTS`: Student already enrolled in course
- `PROGRAM_CONTEXT_MISSING`: Program context header missing
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions

---

## Business Rules

### Payment & Session Access
- **Unpaid (0%)**: Can enroll but cannot start sessions
- **Partially Paid (≥50%)**: Can start sessions and access course content
- **Fully Paid (100%)**: Full access to all features

### Age Group Validation
- Students must fit within course age groups to enroll
- System recommends appropriate age groups based on student age
- Flexible age group matching allows some overlap

### Facility Requirements
- Facilities must have pricing configured for the specific course combination
- Age group, location type, and session type must be supported
- Real-time availability checking prevents enrollment conflicts

### Session Types
- **Private**: One-on-one instruction
- **Group**: Small group sessions (typically 4-8 students)
- **School Group**: Large group sessions for institutional clients

### Location Types
- **Our Facility**: Sessions at academy-owned facilities
- **Client Location**: Sessions at client's preferred location
- **Virtual**: Online/remote sessions

---

## Mobile App Integration Examples

### Parent Enrollment Flow
```typescript
// 1. Get available courses
const courses = await apiClient.courses.getAssignableCourses();

// 2. Check age eligibility
const eligibility = await apiClient.courses.checkAgeEligibility(studentId, courseId);

// 3. Get available facilities
const facilities = await apiClient.courses.getAvailableFacilities({
  course_id: courseId,
  age_group: eligibility.recommended_age_group,
  location_type: 'our-facility',
  session_type: 'group'
});

// 4. Calculate pricing
const pricing = await apiClient.courses.calculateEnrollmentPricing({
  facility_id: selectedFacility.facility_id,
  course_id: courseId,
  age_group: eligibility.recommended_age_group,
  location_type: 'our-facility',
  session_type: 'group',
  coupon_code: userCoupon
});

// 5. Complete enrollment
const enrollment = await apiClient.courses.enrollStudentWithFacility({
  user_id: studentId,
  course_id: courseId,
  facility_id: selectedFacility.facility_id,
  location_type: 'our-facility',
  session_type: 'group',
  age_group: eligibility.recommended_age_group,
  coupon_code: userCoupon,
  referral_source: 'Mobile App'
});
```

### Student Progress Check
```typescript
// Get student's course assignments
const assignments = await apiClient.courses.getUserAssignments(studentId);

// Check payment status and session access
assignments.forEach(assignment => {
  console.log(`Course: ${assignment.course_name}`);
  console.log(`Progress: ${assignment.progress_percentage}%`);
  console.log(`Can start sessions: ${assignment.can_start_sessions}`);
  console.log(`Payment status: ${assignment.payment_status}`);
});
```

---

## Rate Limiting
- **Course Discovery**: 100 requests per minute
- **Enrollment Operations**: 20 requests per minute
- **Validation Endpoints**: 50 requests per minute

## Caching
- Course and facility data is cached for 5 minutes
- User assignments cached for 2 minutes
- Pricing calculations are not cached (real-time)

## Support
For API support and questions, contact the development team or refer to the main API documentation at `/docs`.