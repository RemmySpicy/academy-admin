# Authentication API Specification

## API Overview

The Authentication API provides secure access control for the Academy Management System, supporting JWT-based authentication with role-based authorization.

## Base URL

- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://api.academy.com/api/v1`

## Authentication

All endpoints except login and password reset require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication Endpoints

#### User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@academy.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@academy.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "super_admin",
    "programs": [
      {
        "id": "987fcdeb-51a2-43d1-9c2b-123456789abc",
        "name": "Swimming Program",
        "code": "SWIM"
      }
    ]
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}
```

#### User Logout
```http
POST /auth/logout
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### Token Refresh
```http
POST /auth/refresh
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 28800
}
```

#### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "admin@academy.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

#### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_here",
  "new_password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

### User Management Endpoints (Super Admin Only)

#### List Users
```http
GET /users?page=1&limit=20&search=john&role=program_admin
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "admin@academy.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "program_admin",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "programs": [
        {
          "id": "987fcdeb-51a2-43d1-9c2b-123456789abc",
          "name": "Swimming Program"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "email": "newadmin@academy.com",
  "password": "securepassword123",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "program_admin",
  "program_ids": ["987fcdeb-51a2-43d1-9c2b-123456789abc"]
}
```

**Response (201 Created):**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "email": "newadmin@academy.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "program_admin",
  "is_active": true,
  "created_at": "2025-01-08T00:00:00Z"
}
```

#### Get User
```http
GET /users/{user_id}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@academy.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "program_admin",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-08T00:00:00Z",
  "programs": [
    {
      "id": "987fcdeb-51a2-43d1-9c2b-123456789abc",
      "name": "Swimming Program",
      "code": "SWIM"
    }
  ]
}
```

#### Update User
```http
PUT /users/{user_id}
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "role": "program_admin",
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@academy.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "program_admin",
  "is_active": true,
  "updated_at": "2025-01-08T00:00:00Z"
}
```

#### Delete User
```http
DELETE /users/{user_id}
```

**Response (204 No Content)**

#### Assign Programs to User
```http
POST /users/{user_id}/programs
```

**Request Body:**
```json
{
  "program_ids": ["987fcdeb-51a2-43d1-9c2b-123456789abc", "456e7890-e89b-12d3-a456-426614174002"]
}
```

**Response (200 OK):**
```json
{
  "message": "Programs assigned successfully",
  "programs": [
    {
      "id": "987fcdeb-51a2-43d1-9c2b-123456789abc",
      "name": "Swimming Program"
    },
    {
      "id": "456e7890-e89b-12d3-a456-426614174002",
      "name": "Basketball Program"
    }
  ]
}
```

### Profile Management Endpoints

#### Get Current User Profile
```http
GET /auth/profile
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@academy.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "program_admin",
  "programs": [
    {
      "id": "987fcdeb-51a2-43d1-9c2b-123456789abc",
      "name": "Swimming Program"
    }
  ]
}
```

#### Update Current User Profile
```http
PUT /auth/profile
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@academy.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "program_admin",
  "updated_at": "2025-01-08T00:00:00Z"
}
```

#### Change Password
```http
POST /auth/change-password
```

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

## Data Models

### User Model
```json
{
  "id": "string (UUID)",
  "email": "string (email format)",
  "first_name": "string",
  "last_name": "string",
  "role": "string (enum: super_admin, program_admin)",
  "is_active": "boolean",
  "created_at": "string (ISO 8601 datetime)",
  "updated_at": "string (ISO 8601 datetime)",
  "programs": [
    {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    }
  ]
}
```

### Login Request Model
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 characters)"
}
```

### Create User Request Model
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 characters)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "role": "string (required, enum: super_admin, program_admin)",
  "program_ids": ["string (UUID array, optional)"]
}
```

## Error Response Format

All error responses follow this format:

```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "details": {
    "field": "Additional error details (optional)"
  }
}
```

## HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no content to return
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation errors
- **500 Internal Server Error** - Server error

## Rate Limiting

- **Login attempts**: 5 attempts per IP per 15 minutes
- **Password reset**: 3 attempts per email per hour
- **General API**: 100 requests per user per minute

## Security Considerations

- All endpoints use HTTPS in production
- JWT tokens expire after 8 hours
- Password reset tokens expire after 1 hour
- Account lockout after 5 failed login attempts
- All sensitive operations are logged for audit
- CORS policies restrict origin access
- Input validation prevents injection attacks