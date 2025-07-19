# Academy Apps

This directory contains mobile applications that use the shared backend API.

## Applications

### 📱 Tutor App (`tutor-app/`)
**Target Users**: Tutors and Program Coordinators
**Technology**: React Native / Expo
**Repository**: Will be managed as git subtree → `academy-tutor-app` repo

**Features**:
- Student progress management
- Lesson planning and content delivery
- Attendance tracking and reporting
- Communication with students and parents
- Course material access
- Assessment and grading tools

### 📱 Student App (`student-app/`)
**Target Users**: Students and Parents/Guardians  
**Technology**: React Native / Expo
**Repository**: Will be managed as git subtree → `academy-student-app` repo

**Features**:
- Course progress viewing
- Assignment submissions and tracking
- Schedule and calendar management
- Communication with tutors
- Resource downloads
- Progress reports and achievements

## Development Workflow

### Setup for Development
```bash
# Start shared backend
docker-compose up backend

# Install dependencies for all apps
npm run install:all:apps

# Start all apps in development
npm run dev:apps
```

### Git Subtree Management
```bash
# Add existing repos as subtrees
git subtree add --prefix=apps/tutor-app tutor-app-remote main --squash
git subtree add --prefix=apps/student-app student-app-remote main --squash

# Push changes to separate repos
git subtree push --prefix=apps/tutor-app tutor-app-remote main
git subtree push --prefix=apps/student-app student-app-remote main

# Pull changes from separate repos
git subtree pull --prefix=apps/tutor-app tutor-app-remote main --squash
git subtree pull --prefix=apps/student-app student-app-remote main --squash
```

## Shared Resources

All apps use shared resources from `/shared/`:
- **Types**: TypeScript definitions from backend schemas
- **API Client**: Unified API client with authentication and program context
- **Utils**: Common utilities and helpers

## Backend Integration

All mobile apps connect to the same FastAPI backend:
- **Base URL**: `http://localhost:8000` (development)
- **Authentication**: JWT tokens with role-based access
- **Program Context**: Automatic program filtering based on user assignments
- **API Documentation**: `http://localhost:8000/docs`

## Role-Based Access

### Tutor App Roles
- **Tutor**: Basic student interaction and progress viewing
- **Program Coordinator**: Enhanced student management and reporting

### Student App Roles  
- **Student**: Course access, assignment submission, progress tracking
- **Parent/Guardian**: Child's progress monitoring, communication with tutors

## Development Guidelines

1. **Use shared API client** - Don't create separate HTTP clients
2. **Follow program context** - All data requests must include program context
3. **Consistent UI patterns** - Use shared design tokens where possible
4. **Error handling** - Use shared error handling patterns
5. **Testing** - Test against shared backend in development