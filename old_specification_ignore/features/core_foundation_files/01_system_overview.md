# System Overview - Elitesgen Academy Management System

## Project Architecture

### Monolithic Repository Structure
- **Frontend and Backend**: Single repository with clear separation
- **Development Approach**: API-first architecture with simultaneous frontend development
- **Deployment Strategy**: Admin Dashboard → Parent App → Instructor App

### Technology Stack

#### Backend Stack
- **Framework**: FastAPI (modern, fast web framework with automatic API documentation)
- **Server**: Uvicorn (high-performance ASGI server)
- **Database**: PostgreSQL with psycopg2-binary connector
- **ORM**: SQLAlchemy (with async support for high performance)
- **Data Validation**: Pydantic (automatic request/response validation)
- **Migrations**: Alembic (database schema versioning)
- **Authentication**: PyJWT (JSON Web Token implementation)
- **Security**: Passlib (password hashing with bcrypt)
- **Task Queue**: Celery (for background tasks)
- **Caching/Queue**: Redis (Celery backend and caching)
- **HTTP Client**: HTTPX (async HTTP client for external integrations)
- **Templating**: Jinja2 (email templates, notifications)
- **Environment**: Python-dotenv (configuration management)
- **Testing**: Pytest with pytest-asyncio (comprehensive test suite)

#### Frontend Stack
- **Framework**: Next.js 14+ (React framework with App Router)
- **Language**: TypeScript (type safety across entire frontend)
- **Styling**: Tailwind CSS (utility-first responsive design)
- **State Management**: Zustand (lightweight, scalable state management)
- **Forms**: React Hook Form + @hookform/resolvers + Zod (type-safe form validation)
- **Data Fetching**: @tanstack/react-query (server state management with caching)
- **UI Components**: Radix UI (accessible, unstyled UI primitives)
- **Animations**: Framer Motion (smooth, performant animations)
- **Charts**: Recharts (responsive chart library)
- **Drag & Drop**: DnD Kit (accessible drag and drop for curriculum builder)
- **Date Handling**: Date-fns (lightweight date manipulation)
- **Development**: ESLint, PostCSS, Autoprefixer (code quality and CSS processing)

## System Requirements

### Performance Targets
- **Concurrent Users**: 10-20 admin users maximum
- **Student Capacity**: Support for 1,000+ students within first year
- **Response Time**: < 200ms for standard CRUD operations
- **Database**: Optimized for complex relational queries (curriculum hierarchy, scheduling)

### Scalability Considerations
- **Multi-Location Support**: Built-in from launch
- **API Design**: RESTful endpoints ready for mobile app integration
- **Database Design**: Normalized schema with efficient indexing
- **Caching Strategy**: Redis for session management and frequently accessed data

## Business Domain Overview

### Core Entities
1. **Programs**: Swimming, Football, Basketball (expandable)
2. **Locations/Facilities**: Multiple physical locations with independent operations
3. **Students**: Individual learners with progression tracking
4. **Parents/Guardians**: Account holders managing multiple children
5. **Instructors**: Multi-program capable teachers
6. **Curriculum**: 7-level hierarchy with assessment rubrics
7. **Sessions**: Scheduled lessons with attendance and progress tracking

### Key Business Rules
- **Multi-Location Operations**: Facility-specific data with consolidated oversight
- **Parent-Child Relationships**: One parent manages multiple students
- **Instructor Flexibility**: Manual assignment with conflict prevention
- **Assessment System**: 0-3 star rating with detailed rubrics
- **Session Management**: Group (5 max) and private (2 max) lessons
- **Role-Based Access**: Super Admin and Program Admin levels

## Technical Architecture Principles

### Backend Architecture
- **API-First Design**: All functionality exposed via REST APIs
- **Async/Await Pattern**: Non-blocking operations for high performance
- **Dependency Injection**: FastAPI's built-in DI for clean architecture
- **Database Async**: SQLAlchemy async sessions for optimal performance
- **Background Tasks**: Celery for notifications, data sync, and heavy operations
- **Error Handling**: Comprehensive exception handling with user-friendly responses
- **Security**: JWT-based authentication with role-based authorization
- **Validation**: Pydantic models for all API inputs/outputs

### Frontend Architecture
- **Component-Based Design**: Reusable UI components with consistent patterns
- **Type Safety**: End-to-end TypeScript for reduced runtime errors
- **Server-Side Rendering**: Next.js App Router for optimal performance
- **State Management**: Zustand for global state, React Query for server state
- **Form Management**: Controlled forms with real-time validation
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: WCAG compliance through Radix UI primitives
- **Performance**: Code splitting, lazy loading, and optimized bundle sizes

## Development Workflow

### Repository Structure
```
academy-management/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── core/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   ├── public/
│   └── package.json
└── docker-compose.yml
```

### Environment Management
- **Development**: Local PostgreSQL, Redis, and hot reload
- **Testing**: Isolated test databases with pytest fixtures
- **Production**: Containerized deployment with environment-specific configs

## Integration Points

### External Systems
- **Zoho Books API**: Basic payment status synchronization
- **Email Service**: SMTP integration for notifications
- **SMS Service**: Optional SMS notifications for session reminders
- **File Storage**: Local storage with cloud migration path

### API Design Standards
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **JSON Communication**: All data exchange in JSON format
- **Error Responses**: Consistent error formatting with detail codes
- **Authentication**: Bearer token authentication for all protected endpoints
- **Documentation**: Auto-generated OpenAPI docs via FastAPI
- **Versioning**: API version strategy for future mobile app updates

## Security & Compliance

### Authentication & Authorization
- **JWT Tokens**: Short-lived access tokens with refresh mechanism
- **Password Security**: Bcrypt hashing with salt rounds
- **Role-Based Access**: Super Admin, Program Admin, and future mobile roles
- **Session Management**: Redis-backed session storage

### Data Protection
- **Input Validation**: Comprehensive Pydantic validation on all inputs
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **XSS Protection**: React's built-in XSS protection with CSP headers
- **CORS Configuration**: Strict CORS policies for API endpoints

## Development Phases

### Phase 1: Foundation & Admin Dashboard
- Complete backend API development
- Admin dashboard with full CRUD operations
- Authentication and authorization system
- Multi-location and program management

### Phase 2: Parent/Student Mobile App
- Mobile-optimized API endpoints
- Parent enrollment and scheduling interface
- Student progress tracking and assessments

### Phase 3: Instructor Mobile App
- Offline-capable curriculum delivery
- Assessment scoring and submission
- Attendance tracking and reporting

## Success Metrics

### Technical Metrics
- **API Response Time**: < 200ms for 95% of requests
- **Database Query Performance**: < 100ms for complex curriculum queries
- **Frontend Load Time**: < 2 seconds initial page load
- **Test Coverage**: > 90% backend coverage, > 80% frontend coverage

### Business Metrics
- **User Adoption**: 100% admin user adoption within 30 days
- **Operational Efficiency**: 50% reduction in manual administrative tasks
- **Data Accuracy**: 99% accuracy in student progression tracking
- **Mobile Readiness**: API foundation ready for immediate mobile development

This system overview provides the complete technical foundation for building a comprehensive, scalable academy management system that will revolutionize Elitesgen Academy's operations.