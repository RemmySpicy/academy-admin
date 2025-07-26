# Organization Management API Endpoints

**Complete API reference for organization management, payment overrides, and partner administration.**

## 📖 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Organization Management](#organization-management)
- [Payment Override System](#payment-override-system)
- [Partner Authentication](#partner-authentication)
- [User Relationships](#user-relationships)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Examples](#examples)

## Overview

The Organization Management API provides endpoints for managing partner organizations, calculating payment overrides, and handling complex family relationships within the Academy Admin system.

### Base URL
```
https://api.academy.com/api/v1
```

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* Response data */ },
  "message": "Operation completed successfully",
  "errors": [] // Only present when success = false
}
```

## Authentication

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Program-Context: <program_id>  // Required for program-specific operations
```

### Program Context
Most organization operations require a program context header to ensure proper data isolation:

```http
X-Program-Context: swimming-program-123
```

### Bypass Program Filter
Super Admins can bypass program filtering for cross-program operations:

```http
X-Bypass-Program-Filter: true
```

## Organization Management

### List Organizations

```http
GET /organizations/
```

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `per_page` (integer, default: 20, max: 100): Items per page
- `search` (string): Search query for organization name or contact
- `status` (string): Filter by status (`active`, `inactive`, `suspended`, `pending`)
- `organization_type` (string): Filter by type (`corporate`, `educational`, `community`, `government`)
- `has_members` (boolean): Filter organizations with/without members
- `sort_by` (string): Sort field (`name`, `created_at`, `member_count`)
- `sort_order` (string): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "org-123",
        "name": "TechCorp Inc.",
        "description": "Corporate partner for employee children",
        "status": "active",
        "contact_name": "Jane Smith",
        "contact_email": "jane.smith@techcorp.com",
        "contact_phone": "+1-555-0123",
        "website": "https://techcorp.com",
        "logo_url": "https://cdn.academy.com/logos/techcorp.png",
        "member_count": 45,
        "active_students": 12,
        "created_at": "2025-07-01T10:00:00Z",
        "updated_at": "2025-07-26T08:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 3,
      "total_count": 52,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Create Organization

```http
POST /organizations/
```

**Request Body:**
```json
{
  "name": "TechCorp Inc.",
  "description": "Corporate partner for employee children",
  "contact_name": "Jane Smith",
  "contact_email": "jane.smith@techcorp.com",
  "contact_phone": "+1-555-0123",
  "address_line1": "123 Tech Street",
  "address_line2": "Suite 456",
  "city": "Silicon Valley",
  "state": "CA",
  "postal_code": "94000",
  "country": "USA",
  "website": "https://techcorp.com",
  "payment_overrides": {
    "stem": {
      "sponsorship_type": "full",
      "description": "Full coverage for STEM programs"
    },
    "global": {
      "sponsorship_type": "partial", 
      "percentage": 70.0,
      "description": "70% coverage for all other programs"
    }
  },
  "notes": "Major corporate partner with 1000+ employees"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-456",
    "name": "TechCorp Inc.",
    "status": "active",
    // ... full organization object
  },
  "message": "Organization created successfully"
}
```

### Get Organization

```http
GET /organizations/{organization_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-123",
    "name": "TechCorp Inc.",
    "description": "Corporate partner for employee children",
    "status": "active",
    "contact_name": "Jane Smith",
    "contact_email": "jane.smith@techcorp.com",
    "contact_phone": "+1-555-0123",
    "address": {
      "line1": "123 Tech Street",
      "line2": "Suite 456", 
      "city": "Silicon Valley",
      "state": "CA",
      "postal_code": "94000",
      "country": "USA"
    },
    "website": "https://techcorp.com",
    "logo_url": "https://cdn.academy.com/logos/techcorp.png",
    "payment_overrides": {
      "stem": {
        "sponsorship_type": "full",
        "description": "Full coverage for STEM programs"
      }
    },
    "program_permissions": {
      "swimming": {
        "access_allowed": true,
        "max_students": 50
      }
    },
    "statistics": {
      "total_members": 45,
      "active_students": 12,
      "monthly_sponsorship": 4250.00,
      "programs_involved": ["Swimming", "Robotics", "Music"]
    },
    "created_at": "2025-07-01T10:00:00Z",
    "updated_at": "2025-07-26T08:30:00Z"
  }
}
```

### Update Organization

```http
PUT /organizations/{organization_id}
```

**Request Body:** (Partial updates supported)
```json
{
  "description": "Updated corporate partner description",
  "contact_email": "new.admin@techcorp.com",
  "payment_overrides": {
    "robotics": {
      "sponsorship_type": "partial",
      "percentage": 80.0,
      "description": "80% coverage for robotics programs"
    }
  }
}
```

### Delete Organization

```http
DELETE /organizations/{organization_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

### Organization Members

#### List Organization Members

```http
GET /organizations/{organization_id}/members
```

**Query Parameters:**
- `page`, `per_page`: Pagination
- `search`: Search by member name or email
- `membership_type`: Filter by membership type (`sponsored`, `affiliate`, `partner`)
- `is_active`: Filter by active status
- `program_id`: Filter by specific program

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "membership-123",
        "user_id": "user-456",
        "user_name": "John Smith",
        "user_email": "john.smith@email.com",
        "membership_type": "sponsored",
        "is_sponsored": true,
        "is_active": true,
        "start_date": "2025-01-15",
        "program_id": "swimming-program",
        "program_name": "Swimming Program",
        "custom_pricing": {
          "swimming-101": {
            "price": 250.00,
            "description": "Discounted rate for beginners"
          }
        },
        "created_at": "2025-01-15T09:00:00Z"
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

#### Add Organization Member

```http
POST /organizations/{organization_id}/members
```

**Request Body:**
```json
{
  "user_id": "user-789",
  "program_id": "swimming-program",
  "membership_type": "sponsored",
  "is_sponsored": true,
  "start_date": "2025-07-26",
  "end_date": null,
  "custom_pricing": {
    "advanced-swimming": {
      "price": 300.00,
      "description": "Premium course pricing"
    }
  },
  "notes": "Employee child - full sponsorship approved"
}
```

#### Remove Organization Member

```http
DELETE /organizations/{organization_id}/members/{user_id}
```

**Query Parameters:**
- `program_id` (required): Specific program membership to remove

### Organization Statistics

```http
GET /organizations/{organization_id}/stats
```

**Query Parameters:**
- `period`: Time period (`current_month`, `last_month`, `current_year`, `last_year`)
- `include_trends`: Include trend data (boolean)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_members": 45,
      "active_students": 12,
      "total_sponsorship": 4250.00,
      "programs_count": 3,
      "avg_cost_per_student": 354.17
    },
    "by_program": {
      "swimming": {
        "students": 8,
        "sponsorship_amount": 2400.00,
        "avg_per_student": 300.00
      },
      "robotics": {
        "students": 3,
        "sponsorship_amount": 1200.00,
        "avg_per_student": 400.00
      },
      "music": {
        "students": 1,
        "sponsorship_amount": 650.00,
        "avg_per_student": 650.00
      }
    },
    "trends": {
      "enrollment_growth": [
        {"month": "2025-05", "count": 8},
        {"month": "2025-06", "count": 10},
        {"month": "2025-07", "count": 12}
      ],
      "spending_trend": [
        {"month": "2025-05", "amount": 3200.00},
        {"month": "2025-06", "amount": 3800.00},
        {"month": "2025-07", "amount": 4250.00}
      ]
    }
  }
}
```

## Payment Override System

### Calculate Payment Responsibility

```http
POST /payment-overrides/calculate-payment
```

**Request Body:**
```json
{
  "student_id": "student-123",
  "course_id": "swimming-101",
  "base_amount": 299.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payer_type": "mixed",
    "primary_payer_id": "org-456",
    "payment_breakdown": [
      {
        "payer_id": "org-456",
        "payer_type": "organization",
        "payer_name": "TechCorp Inc.",
        "amount": 209.99,
        "percentage": 70.0,
        "reason": "Partial corporate sponsorship"
      },
      {
        "payer_id": "parent-789",
        "payer_type": "parent",
        "payer_name": "John Smith",
        "amount": 89.99,
        "percentage": 30.0,
        "reason": "Parent responsibility remainder"
      }
    ],
    "total_amount": 299.99,
    "discounts_applied": ["corporate_partner_discount"],
    "override_reason": "TechCorp Inc. covers 70%; John Smith pays remaining 30%"
  }
}
```

### Apply Payment Overrides

```http
POST /payment-overrides/apply-payment-overrides
```

**Request Body:**
```json
{
  "student_id": "student-123",
  "course_id": "swimming-101", 
  "base_amount": 299.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_structure": {
      "payer_type": "mixed",
      "payment_breakdown": [ /* breakdown array */ ],
      "total_amount": 299.99
    },
    "override_applied": true,
    "payment_id": "payment-456",
    "created_at": "2025-07-26T10:30:00Z",
    "status": "pending"
  },
  "message": "Payment overrides applied successfully"
}
```

### Get Student Payment Status

```http
GET /payment-overrides/student/{student_id}/payment-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": "student-123",
    "student_name": "Emily Johnson",
    "sponsoring_organizations": [
      {
        "organization_id": "org-456",
        "organization_name": "TechCorp Inc.",
        "membership_type": "sponsored",
        "payment_responsibility": true,
        "sponsorship_details": {
          "type": "partial",
          "percentage": 70.0,
          "max_annual": 2000.00
        }
      }
    ],
    "responsible_parents": [
      {
        "parent_id": "parent-789",
        "parent_name": "John Smith",
        "relationship_type": "parent",
        "payment_percentage": 30.0
      }
    ],
    "has_payment_overrides": true,
    "payment_responsibility_type": "mixed",
    "current_year_spending": {
      "organization_covered": 1560.00,
      "parent_covered": 468.00,
      "student_covered": 0.00,
      "total": 2028.00
    }
  }
}
```

### Check Course Access

```http
POST /payment-overrides/check-course-access
```

**Request Body:**
```json
{
  "student_id": "student-123",
  "course_id": "advanced-robotics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "has_access": true,
    "access_type": "granted",
    "reason": "Course access granted through TechCorp Inc. membership",
    "access_grants": [
      {
        "organization_id": "org-456",
        "organization_name": "TechCorp Inc.",
        "access_type": "granted",
        "reason": "STEM program access included in corporate partnership"
      }
    ],
    "access_restrictions": [],
    "organization_memberships": [
      {
        "organization_id": "org-456",
        "organization_name": "TechCorp Inc.",
        "membership_type": "sponsored"
      }
    ]
  }
}
```

### Get Organization Course Overrides

```http
GET /payment-overrides/organization/{organization_id}/course-overrides
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization_id": "org-456",
    "organization_name": "TechCorp Inc.",
    "granted_courses": [
      {
        "course_id": "advanced-robotics",
        "course_name": "Advanced Robotics",
        "course_code": "ROB-301"
      },
      {
        "course_id": "ai-programming",
        "course_name": "AI Programming Fundamentals",
        "course_code": "CS-201"
      }
    ],
    "restricted_courses": [],
    "total_overrides": 2
  }
}
```

### Bulk Operations

#### Students with Payment Overrides

```http
GET /payment-overrides/students/payment-overrides
```

**Query Parameters:**
- `limit`: Maximum results (1-100, default: 50)
- `offset`: Pagination offset (default: 0)
- `organization_id`: Filter by specific organization

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "student_id": "student-123",
        "student_name": "Emily Johnson",
        "sponsoring_organizations": [ /* org details */ ],
        "responsible_parents": [ /* parent details */ ],
        "payment_responsibility_type": "mixed"
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

#### Organizations with Overrides

```http
GET /payment-overrides/organizations/with-overrides
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "organization_id": "org-456",
        "organization_name": "TechCorp Inc.",
        "organization_type": "corporate",
        "sponsored_students": 12,
        "has_payment_overrides": true,
        "has_access_overrides": true,
        "monthly_sponsorship": 4250.00
      }
    ],
    "total": 8
  }
}
```

## Partner Authentication

### Create Partner Admin

```http
POST /partner-auth/create-admin
```

**Request Body:**
```json
{
  "organization_id": "org-456",
  "admin_data": {
    "username": "techcorp.admin",
    "email": "admin@techcorp.com",
    "full_name": "TechCorp Administrator",
    "password": "secure_password123"
  },
  "permissions": [
    "manage_students",
    "view_payments",
    "generate_reports"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-789",
    "username": "techcorp.admin",
    "email": "admin@techcorp.com",
    "full_name": "TechCorp Administrator",
    "organization_id": "org-456",
    "permissions": ["manage_students", "view_payments", "generate_reports"],
    "created_at": "2025-07-26T10:00:00Z"
  },
  "message": "Partner admin created successfully"
}
```

### Partner Admin Login

```http
POST /partner-auth/login
```

**Request Body:**
```json
{
  "username": "techcorp.admin",
  "password": "secure_password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "user-789",
      "username": "techcorp.admin",
      "email": "admin@techcorp.com",
      "full_name": "TechCorp Administrator",
      "organization_id": "org-456",
      "permissions": ["manage_students", "view_payments", "generate_reports"]
    }
  }
}
```

### Get Partner Organizations

```http
GET /partner-auth/organizations
```

**Headers:** `Authorization: Bearer <partner_admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "org-456",
        "name": "TechCorp Inc.",
        "role": "admin",
        "permissions": ["manage_students", "view_payments", "generate_reports"],
        "member_count": 45,
        "active_students": 12
      }
    ]
  }
}
```

## User Relationships

### Create User Relationship

```http
POST /users/relationships
```

**Request Body:**
```json
{
  "parent_user_id": "user-123",
  "child_user_id": "user-456",
  "program_id": "swimming-program",
  "relationship_type": "parent",
  "has_payment_responsibility": true,
  "payment_percentage": 50.0,
  "start_date": "2025-07-26",
  "notes": "Primary guardian with joint custody"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "relationship-789",
    "parent_user_id": "user-123",
    "child_user_id": "user-456",
    "program_id": "swimming-program",
    "relationship_type": "parent",
    "has_payment_responsibility": true,
    "payment_percentage": 50.0,
    "is_active": true,
    "start_date": "2025-07-26",
    "end_date": null,
    "created_at": "2025-07-26T10:00:00Z"
  },
  "message": "User relationship created successfully"
}
```

### Get User Family Structure

```http
GET /users/{user_id}/family
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "full_name": "John Smith",
      "profile_type": "FULL_USER"
    },
    "children": [
      {
        "id": "user-456",
        "full_name": "Emily Smith",
        "profile_type": "PROFILE_ONLY",
        "relationship": {
          "id": "relationship-789",
          "relationship_type": "parent",
          "has_payment_responsibility": true,
          "payment_percentage": 50.0,
          "is_active": true
        }
      }
    ],
    "parents": [],
    "family_structure": {
      "total_children": 1,
      "total_parents": 0,
      "has_payment_responsibilities": true
    }
  }
}
```

### Create Student-Parent Profile

```http
POST /users/student-parent
```

**Request Body:**
```json
{
  "parent_data": {
    "username": "john.smith",
    "email": "john.smith@email.com",
    "full_name": "John Smith",
    "password": "secure_password",
    "phone": "+1-555-0123"
  },
  "child_data": {
    "full_name": "Emily Smith",
    "date_of_birth": "2010-03-15",
    "phone": "+1-555-0123"
  },
  "relationship": {
    "relationship_type": "parent",
    "has_payment_responsibility": true,
    "payment_percentage": 100.0
  },
  "program_id": "swimming-program",
  "course_id": "swimming-101",
  "organization_id": "org-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parent": {
      "id": "user-123",
      "username": "john.smith",
      "email": "john.smith@email.com",
      "full_name": "John Smith",
      "profile_type": "FULL_USER"
    },
    "child": {
      "id": "user-456", 
      "full_name": "Emily Smith",
      "profile_type": "PROFILE_ONLY"
    },
    "relationship": {
      "id": "relationship-789",
      "relationship_type": "parent"
    },
    "organization_membership": {
      "id": "membership-101",
      "organization_name": "TechCorp Inc.",
      "membership_type": "sponsored"
    },
    "course_enrollment": {
      "id": "enrollment-202",
      "course_name": "Swimming 101",
      "enrollment_status": "active"
    }
  },
  "message": "Student-parent profile created successfully"
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Operation failed",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid organization name",
      "field": "name",
      "details": {
        "min_length": 3,
        "max_length": 200
      }
    }
  ]
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication | 401 |
| `AUTHORIZATION_ERROR` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource already exists | 409 |
| `BUDGET_EXCEEDED` | Organization budget limit exceeded | 422 |
| `PROGRAM_CONTEXT_REQUIRED` | Missing program context header | 422 |
| `PAYMENT_CALCULATION_ERROR` | Payment override calculation failed | 422 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Validation Error Examples

#### Organization Validation

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Organization name is required",
      "field": "name"
    },
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid email format",
      "field": "contact_email"
    }
  ]
}
```

#### Payment Calculation Error

```json
{
  "success": false,
  "message": "Payment calculation failed",
  "errors": [
    {
      "code": "PAYMENT_CALCULATION_ERROR",
      "message": "Student not found in specified program",
      "field": "student_id",
      "details": {
        "student_id": "student-123",
        "program_id": "swimming-program"
      }
    }
  ]
}
```

## Rate Limits

### Standard Limits
- **General API**: 1000 requests per hour per user
- **Payment Calculations**: 100 requests per hour per user  
- **Report Generation**: 20 requests per hour per user
- **Bulk Operations**: 50 requests per hour per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1627846261
X-RateLimit-Window: 3600
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Too many requests. Limit: 1000 per hour",
      "retry_after": 1800
    }
  ]
}
```

## Examples

### Complete Organization Setup

```javascript
// 1. Create organization
const org = await fetch('/api/v1/organizations/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Program-Context': 'swimming-program'
  },
  body: JSON.stringify({
    name: 'TechCorp Inc.',
    description: 'Corporate partner',
    contact_email: 'admin@techcorp.com',
    payment_overrides: {
      'global': {
        sponsorship_type: 'partial',
        percentage: 70.0
      }
    }
  })
});

// 2. Create partner admin
const admin = await fetch('/api/v1/partner-auth/create-admin', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    organization_id: org.data.id,
    admin_data: {
      username: 'techcorp.admin',
      email: 'admin@techcorp.com',
      full_name: 'TechCorp Administrator',
      password: 'secure_password'
    }
  })
});

// 3. Add sponsored student
const membership = await fetch(`/api/v1/organizations/${org.data.id}/members`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Program-Context': 'swimming-program'
  },
  body: JSON.stringify({
    user_id: 'student-123',
    program_id: 'swimming-program',
    membership_type: 'sponsored',
    is_sponsored: true
  })
});
```

### Payment Calculation Workflow

```javascript
// 1. Calculate payment responsibility
const payment = await fetch('/api/v1/payment-overrides/calculate-payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Program-Context': 'swimming-program'
  },
  body: JSON.stringify({
    student_id: 'student-123',
    course_id: 'swimming-101',
    base_amount: 299.99
  })
});

// 2. Apply payment overrides
const applied = await fetch('/api/v1/payment-overrides/apply-payment-overrides', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Program-Context': 'swimming-program'
  },
  body: JSON.stringify({
    student_id: 'student-123',
    course_id: 'swimming-101',
    base_amount: 299.99
  })
});

// 3. Get payment status
const status = await fetch('/api/v1/payment-overrides/student/student-123/payment-status', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Program-Context': 'swimming-program'
  }
});
```

---

**📋 Last Updated**: 2025-07-26  
**🔧 Version**: 1.0.0  
**👥 Maintainer**: Academy Admin Development Team