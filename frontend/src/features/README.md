# Frontend Features

This directory contains the feature-based organization of the Academy Management System frontend.

## Feature Structure

Each feature follows a consistent structure:

```
feature/
├── index.ts             # Feature exports
├── components/          # Feature-specific components
│   ├── index.ts        # Component exports
│   └── [Component]/    # Individual components
├── hooks/              # Feature-specific hooks
│   ├── index.ts        # Hook exports
│   └── [hookName].ts   # Individual hooks
├── types/              # Feature-specific types
│   ├── index.ts        # Type exports
│   └── [typeName].ts   # Individual type definitions
└── api/                # Feature-specific API client
    ├── index.ts        # API exports
    └── [apiName].ts    # Individual API functions
```

## Features

### Authentication
- **Purpose**: User authentication and authorization
- **Components**: LoginForm, RegisterForm, AuthGuard
- **Hooks**: useAuth, useLogin, useLogout
- **Types**: User, LoginCredentials, AuthState
- **API**: authApi (login, register, refresh, logout)

### Students
- **Purpose**: Student profile and management
- **Components**: StudentList, StudentProfile, StudentForm
- **Hooks**: useStudents, useStudent, useCreateStudent
- **Types**: Student, Parent, StudentFormData
- **API**: studentsApi, parentsApi

### Curriculum
- **Purpose**: Curriculum hierarchy and content management
- **Components**: CurriculumBuilder, ProgramList, CourseForm
- **Hooks**: useCurriculum, usePrograms, useCourses
- **Types**: Program, Course, Curriculum, Assessment
- **API**: curriculumApi, programsApi, assessmentsApi

### Scheduling
- **Purpose**: Session scheduling and booking
- **Components**: ScheduleCalendar, SessionForm, BookingList
- **Hooks**: useSchedule, useSessions, useBookings
- **Types**: Session, Booking, Schedule, TimeSlot
- **API**: schedulingApi, sessionsApi, bookingsApi

### Locations
- **Purpose**: Multi-location facility management
- **Components**: LocationList, LocationForm, FacilityManager
- **Hooks**: useLocations, useLocation, useFacilities
- **Types**: Location, Facility, LocationAssignment
- **API**: locationsApi, facilitiesApi

### Common
- **Purpose**: Shared components and utilities
- **Components**: DataTable, Modal, FormFields, LoadingSpinner
- **Hooks**: useApi, usePagination, useFormValidation
- **Types**: ApiResponse, PaginatedData, FormState
- **Utils**: formatters, validators, api helpers

## App Directory Structure

The Next.js app directory is organized for the admin dashboard:

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Dashboard home
├── auth/               # Authentication pages
│   ├── login/
│   └── register/
└── admin/              # Admin dashboard pages
    ├── students/       # Student management
    ├── curriculum/     # Curriculum management
    ├── scheduling/     # Scheduling interface
    ├── locations/      # Location management
    └── settings/       # System settings
```

## Development Guidelines

### Component Development
- Use TypeScript for all components
- Follow React best practices
- Use consistent naming conventions
- Include proper prop types and documentation

### State Management
- Use React Query for server state
- Use Zustand for client state
- Keep state close to where it's used
- Use context sparingly for global state

### API Integration
- Centralize API calls in feature api modules
- Use consistent error handling
- Implement proper loading states
- Cache responses when appropriate

### Type Safety
- Define interfaces for all data structures
- Use generic types where applicable
- Avoid `any` type usage
- Export types for use across features

## Usage Guidelines

### Adding New Features
1. Create feature directory with standard structure
2. Implement components, hooks, types, and API
3. Add feature exports to index files
4. Create corresponding app routes if needed
5. Update documentation

### Cross-Feature Dependencies
- Import from other features using absolute imports
- Use common utilities for shared functionality
- Maintain clear separation of concerns
- Avoid circular dependencies

### Testing
- Unit tests for components and hooks
- Integration tests for API calls
- E2E tests for user workflows
- Mock external dependencies

## Styling Guidelines

### CSS Organization
- Use Tailwind CSS for styling
- Create component-specific styles when needed
- Use CSS modules for complex components
- Maintain consistent design system

### Responsive Design
- Mobile-first approach
- Consistent breakpoints
- Flexible layouts
- Touch-friendly interactions

### Accessibility
- WCAG 2.1 AA compliance
- Proper semantic HTML
- ARIA labels and descriptions
- Keyboard navigation support

## Performance Considerations

### Bundle Optimization
- Code splitting by feature
- Lazy loading for routes
- Dynamic imports for heavy components
- Tree shaking for unused code

### Runtime Performance
- Memoization for expensive calculations
- Virtualization for large lists
- Debouncing for user inputs
- Image optimization

### SEO Considerations
- Server-side rendering where appropriate
- Proper meta tags and structured data
- Fast loading times
- Mobile-friendly design