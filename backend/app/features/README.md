# Backend Features

This directory contains the feature-based organization of the Academy Management System backend.

## Feature Structure

Each feature follows a consistent structure:

```
feature/
├── __init__.py           # Feature module initialization
├── models/              # SQLAlchemy models
│   ├── __init__.py
│   └── [model_name].py
├── schemas/             # Pydantic schemas
│   ├── __init__.py
│   └── [schema_name].py
├── services/            # Business logic
│   ├── __init__.py
│   └── [service_name].py
└── routes/              # API routes
    ├── __init__.py
    └── [route_name].py
```

## Features

### Authentication
- **Purpose**: User authentication and authorization
- **Models**: User, Role, Permission
- **Key Services**: AuthService, TokenService
- **Routes**: /auth/login, /auth/register, /auth/refresh

### Students
- **Purpose**: Student profile and management
- **Models**: Student, Parent, StudentParentRelationship
- **Key Services**: StudentService, ParentService
- **Routes**: /students, /parents, /relationships

### Curriculum
- **Purpose**: Curriculum hierarchy and content management
- **Models**: Program, Course, Curriculum, Level, Module, Section, Lesson
- **Key Services**: CurriculumService, AssessmentService
- **Routes**: /programs, /courses, /curricula, /assessments

### Scheduling
- **Purpose**: Session scheduling and booking
- **Models**: Session, Booking, Attendance, Instructor
- **Key Services**: SchedulingService, BookingService
- **Routes**: /sessions, /bookings, /attendance

### Locations
- **Purpose**: Multi-location facility management
- **Models**: Location, Facility, LocationAssignment
- **Key Services**: LocationService, FacilityService
- **Routes**: /locations, /facilities

### Common
- **Purpose**: Shared models, schemas, and utilities
- **Models**: BaseModel, AuditMixin
- **Key Services**: CommonService, ValidationService
- **Utilities**: Database helpers, validation utilities

## Usage Guidelines

### Adding New Features
1. Create feature directory with standard structure
2. Implement models, schemas, services, and routes
3. Add feature to main API router
4. Update documentation in `/docs/implementation/`

### Cross-Feature Dependencies
- Import from other features using absolute imports
- Use common utilities for shared functionality
- Maintain clear separation of concerns

### Database Relationships
- Define relationships in models
- Use foreign keys for data integrity
- Consider performance implications of joins

## Development Standards

### Code Organization
- One model per file
- Group related schemas
- Separate business logic in services
- Keep routes thin (delegate to services)

### Naming Conventions
- Models: PascalCase (e.g., StudentProfile)
- Schemas: PascalCase with suffix (e.g., StudentCreate)
- Services: PascalCase with Service suffix (e.g., StudentService)
- Routes: lowercase with hyphens (e.g., student-profiles)

### Error Handling
- Use custom exceptions
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for development

### Testing
- Unit tests for services
- Integration tests for routes
- Mock external dependencies
- Test database operations