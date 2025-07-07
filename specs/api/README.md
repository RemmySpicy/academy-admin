# API Specifications

This directory contains detailed API specifications for each domain of the Academy Management System.

## API Design Principles

- **RESTful Design**: Follow REST conventions for resource endpoints
- **Consistent Response Format**: Standardized JSON responses with proper HTTP status codes
- **Authentication**: JWT-based authentication with role-based access control
- **Error Handling**: Consistent error response format across all endpoints
- **Documentation**: Auto-generated OpenAPI/Swagger documentation

## API Structure

### Authentication & Authorization
- Role-based access control (Super Admin, Program Admin, Instructor, Parent)
- JWT token-based authentication
- Resource-level permissions

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "metadata": {
    "pagination": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## API Domains

- **authentication.md** - Authentication and user management endpoints
- **students.md** - Student profile and management endpoints
- **curriculum.md** - Curriculum hierarchy and content management
- **scheduling.md** - Session scheduling and booking endpoints
- **locations.md** - Location and facility management endpoints