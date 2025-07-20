# Shared API Client Library

## Overview
Unified API client library for Academy Admin ecosystem, supporting the admin dashboard, tutor/coordinator mobile app, and student/parent mobile app.

## Features
- **Unified Interface**: Consistent API calls across all applications
- **Authentication Management**: Automatic token handling and refresh
- **Program Context**: Automatic program context injection for role-based access
- **Type Safety**: Full TypeScript support with shared types
- **Error Handling**: Comprehensive error handling and retry logic
- **Offline Support**: Cache management for mobile apps
- **Request Interceptors**: Automatic headers and validation

## Architecture

```typescript
// Core HTTP client with authentication and program context
BaseHttpClient
├── AuthService          // Authentication and token management
├── ProgramService       // Program context and switching
├── UserService          // User management
├── CourseService        // Course and curriculum operations
├── StudentService       // Student management
├── FacilityService      // Facility booking and management
└── CommunicationService // Parent-student-tutor communication
```

## Usage Examples

### Admin Dashboard
```typescript
import { ApiClient } from '@shared/api-client';

const client = new ApiClient({
  baseURL: 'http://localhost:8000/api/v1',
  role: 'super_admin'
});

// Automatic program context management
const courses = await client.courses.getCourses();
const students = await client.students.getStudents();
```

### Tutor Mobile App
```typescript
import { ApiClient } from '@shared/api-client';

const client = new ApiClient({
  baseURL: process.env.API_BASE_URL,
  role: 'tutor',
  enableOfflineCache: true
});

// Tutor-specific operations
const myClasses = await client.courses.getAssignedCourses();
const studentProgress = await client.students.getStudentProgress(studentId);
```

### Student Mobile App
```typescript
import { ApiClient } from '@shared/api-client';

const client = new ApiClient({
  baseURL: process.env.API_BASE_URL,
  role: 'student',
  enableOfflineCache: true
});

// Student-specific operations
const myCourses = await client.courses.getEnrolledCourses();
const myProgress = await client.students.getMyProgress();
```

## Configuration
- **Environment-specific**: Different base URLs for development/production
- **Role-based**: Different permissions and available endpoints
- **Offline-first**: Mobile apps support offline operations
- **Real-time**: WebSocket support for live updates

## Error Handling
- Network errors with retry logic
- Authentication failures with automatic refresh
- Program context errors with user guidance
- Validation errors with detailed messages