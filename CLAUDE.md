# Academy Admin - Claude AI Instructions

## Project Overview
Academy Management System built with modern full-stack technologies for comprehensive educational institution management.

## Current Implementation Status (Last Updated: 2025-07-16)

### ✅ Completed Features
- **Database Schema**: PostgreSQL with Alembic migrations
  - Core tables: users, students, programs, courses, curricula
  - **NEW**: `user_program_assignments` junction table for many-to-many relationships
  - UUID extension enabled for primary keys
  - Proper foreign key relationships and indexes
  - **NEW**: Updated user role system (super_admin, program_admin, program_coordinator, tutor)

- **Authentication System**: JWT-based authentication with role-based access control
  - **UPDATED**: Role-based user accounts and credentials
  - Default admin credentials: `admin@academy.com` / `admin123` (Super Admin)
  - Program admin credentials: `swim.admin@academy.com` / `swim123` (Program Admin)
  - **NEW**: Role-based authentication flow with automatic redirects
  - **NEW**: Route protection with RouteGuard component
  - **FIXED**: CORS configuration properly working for cross-origin requests
  - **FIXED**: SQLAlchemy model relationships and imports
  - **NEW**: Standardized `useAuth` naming convention throughout codebase
  - Protected API endpoints with middleware

- **Backend API**: FastAPI with comprehensive curriculum endpoints
  - Health checks, authentication routes
  - Curriculum management: programs, courses, curricula
  - **NEW**: User program assignment management
  - **NEW**: Program context middleware for API calls
  - Proper error handling and validation

- **Frontend Foundation**: Next.js 15 with App Router
  - Route groups for auth and dashboard
  - shadcn/ui components integrated
  - React Query for data fetching
  - **NEW**: Complete role-based authentication flow
  - **NEW**: Program context management with Zustand store
  - **NEW**: Simple HTTP client for reliable API communication
  - **FIXED**: Client/server component separation for Next.js 15 compatibility

- **Program-Centric Architecture**: Complete restructuring for multi-program support
  - **NEW**: Program switcher component in header
  - **NEW**: Program context state management
  - **NEW**: Automatic program context injection into API calls
  - **NEW**: Program-based data filtering throughout application

- **Navigation & UI**: Completely reorganized interface
  - **NEW**: Sectioned sidebar navigation (Program Management + Academy Administration)
  - **NEW**: Role-based sidebar filtering
  - **NEW**: Maintained collapse/expand functionality
  - **NEW**: Academy Administration module for super admins

- **User Management**: Multi-role system implementation
  - **NEW**: Team management pages with role-based access
  - **NEW**: Payments management placeholder pages
  - **NEW**: User program assignment system
  - **NEW**: Migrated existing data to Swimming program

- **Curriculum Management**: Enhanced with program context
  - Programs: 5 test programs created (Robotics, AI/ML, Web Dev, Sports, Arts)
  - API endpoints: `/api/v1/curriculum/programs/`
  - Frontend pages: `/admin/curriculum` with tabbed interface
  - **NEW**: Program-scoped curriculum management

### 🚧 Recently Completed (2025-07-16)
- **Authentication & API Fixes**: 
  - Resolved CORS and 500 error issues with login functionality
  - Fixed SQLAlchemy UserProgramAssignment model import errors
  - Created robust HTTP client for reliable API communication
  - Standardized authentication naming (`useAuth` throughout codebase)
- **Program-Centric Architecture**: Complete restructuring with role-based access control
- **Authentication Flow**: Role-based redirects and route protection
- **Program Context Management**: Global state management with Zustand
- **Academy Administration**: Super admin module for system-wide management
- **User Management**: Team and Payment management pages with role-based access

### 📋 Planned Features
- Enhanced students management with program context
- Location management system
- Advanced scheduling system
- Assessment and grading modules
- Enhanced payment processing
- Comprehensive reporting and analytics

## Recent Issue Resolutions & Troubleshooting (2025-07-16)

### 🚨 **Critical Authentication & CORS Issues Fixed**

#### **Issue 1: CORS Policy Blocking Login Requests**
**Symptoms**: 
```
Access to fetch at 'http://localhost:8000/api/v1/auth/login/json' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Root Cause**: Missing HTTP methods (`POST`, `GET`, etc.) in the API client

**Solution**: Created dedicated HTTP client (`/frontend/src/lib/api/httpClient.ts`) with proper:
- CORS-compatible headers
- Standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- Consistent error handling and response formatting

#### **Issue 2: Backend 500 Internal Server Error**
**Symptoms**: Authentication API returning 500 errors during login attempts

**Root Cause**: SQLAlchemy model relationship error - `UserProgramAssignment` not properly imported

**Solution**: 
- Added `UserProgramAssignment` to `/backend/app/models.py` imports
- Updated `/backend/app/features/authentication/models/__init__.py` exports
- Fixed SQLAlchemy relationship mapping in User model

#### **Issue 3: Frontend Build Errors with JSX**
**Symptoms**: `.ts` files containing JSX causing compilation errors

**Solution**:
- Renamed `programContextInitializer.ts` → `programContextInitializer.tsx`
- Added React import: `import React, { useEffect } from 'react';`
- Created `ClientProviders.tsx` wrapper for proper client/server component separation

#### **Issue 4: Authentication Hook Naming Conflicts**
**Symptoms**: Import conflicts between `useAuth` and `useRealAuth`

**Solution**:
- Standardized to `useAuth` throughout codebase
- Removed `useRealAuth` naming and related exports
- Updated all import statements to use consistent authentication hooks

### 🔧 **Key Files Modified for Fixes**:
- `/backend/app/models.py` - Added UserProgramAssignment imports
- `/frontend/src/lib/api/httpClient.ts` - New HTTP client implementation
- `/frontend/src/features/authentication/api/authApiService.ts` - Updated to use HTTP client
- `/frontend/src/features/authentication/hooks/useAuth.tsx` - Standardized naming
- `/frontend/src/components/providers/ClientProviders.tsx` - Client/server separation

### ✅ **Verification Steps**:
1. **Backend Health**: `curl http://localhost:8000/api/v1/health/`
2. **Authentication Test**: `curl -X POST http://localhost:8000/api/v1/auth/login/json -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`
3. **Frontend Build**: All containers should show "healthy" status
4. **Login Flow**: Should work without CORS or 500 errors

## Technology Stack (Updated 2025)

### Frontend
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Primary UI Library)
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand 4.5.5
- **Data Fetching**: TanStack Query 5.62.4
- **Animations**: Framer Motion 11.13.5
- **Charts**: Recharts
- **Drag & Drop**: DND Kit
- **Date Handling**: Date-fns
- **Icons**: Lucide React + Radix UI Icons

### Backend
- **Framework**: FastAPI 0.115.12
- **Language**: Python 3.12+
- **Database**: SQLAlchemy 2.0.36 (ORM)
- **Validation**: Pydantic 2.10.4
- **Migrations**: Alembic 1.14.0
- **Server**: Uvicorn 0.32.1 (ASGI)
- **Background Tasks**: Celery 5.4.0
- **Testing**: Pytest 8.3.4
- **Authentication**: PyJWT + Passlib

## Development Commands

### Quick Start
- `docker compose up` - **Full Docker**: Start all services in containers (RECOMMENDED)
- `npm run setup:local` - **Local Dev**: Set up PostgreSQL database for local development
- `npm run dev:local` - **Local Dev**: Start local development with PostgreSQL
- `npm run setup:project` - Complete project setup (copies env files, installs deps)
- `npm run setup:dev` - Setup development environment files only
- `npm run setup:prod` - Setup production environment files

### Setup
- `npm run install:all` - Install all dependencies (frontend + backend)
- `npm run install:frontend` - Install frontend dependencies only
- `npm run install:backend` - Install backend dependencies only

#### System Requirements for Backend
For backend development, choose one of these approaches:

**Option 1: Full Docker Setup (Recommended)**
- Docker and Docker Compose installed
- No Python setup required on host machine
- All services (frontend, backend, database) containerized

**Option 2: Local Development with PostgreSQL**
- Python 3.12+ installed
- Docker for PostgreSQL database only
- Virtual environment recommended for Python dependencies

### Development

#### PREFERRED FULL DOCKER DEVELOPMENT SETUP
- `docker compose up` - Start all services (frontend, backend, database)
- `docker compose up backend` - Start backend only
- `docker compose up frontend` - Start frontend only
- `docker compose down` - Stop all services
- `docker compose logs backend` - View backend logs
- `docker compose logs frontend` - View frontend logs
- `docker compose build` - Rebuild all containers
- `docker compose up --build` - Rebuild and start containers

**Benefits:**
- ✅ No dependency conflicts
- ✅ Consistent environment across team
- ✅ Automatic dependency caching
- ✅ PostgreSQL database included
- ✅ Isolated from host system

#### Alternative: Local Development with PostgreSQL
- `./setup-local-db.sh` - **First time**: Set up PostgreSQL database
- `./start-dev.sh` - Start both servers with PostgreSQL database
- Manual start:
  - Database: `docker-compose -f docker-compose.local.yml up -d`
  - Frontend: `cd frontend && npm run dev` (port 3000)
  - Backend: `cd backend && python3 -m uvicorn app.main:app --reload --port 8000`

**Benefits:**
- ✅ Consistent PostgreSQL across all environments
- ✅ Local development flexibility
- ✅ Database persistence between sessions
- ✅ Easy debugging and testing

### Production
- `npm run frontend:build` - Build frontend for production
- `npm run build:prod` - Build frontend for production with optimizations
- `npm run frontend:start` - Start frontend in production mode
- `npm run backend:start` - Start backend in production mode
- `npm run backend:prod` - Start backend in production mode with proper host binding

### Docker Development Commands
- `docker compose up -d` - Start services in background
- `docker compose build` - Rebuild containers
- `docker compose build --no-cache` - Force rebuild without cache
- `docker compose exec backend bash` - Access backend container shell
- `docker compose exec frontend sh` - Access frontend container shell

### Docker Troubleshooting
If you encounter issues with Docker setup:

1. **Environment Variables Not Loading**:
   - Use `docker compose --env-file .env.docker up` to explicitly specify env file
   - Verify `.env.docker` exists and contains all required variables

2. **Build Context Too Large**:
   - Ensure `.dockerignore` files exist in both `frontend/` and `backend/` directories
   - `.dockerignore` should exclude `node_modules`, `.next`, `__pycache__`, etc.

3. **Database Connection Issues**:
   - Ensure PostgreSQL is running and accessible
   - Backend should connect to PostgreSQL at `postgresql://admin:password@db:5432/academy_admin`

4. **CORS Errors**:
   - Frontend in Docker accesses backend via `http://localhost:8000` (external)
   - Backend CORS should allow `http://localhost:3000` origin
   - Check browser console for specific CORS error messages

5. **Port Conflicts**:
   - Ensure ports 3000, 8000, 5432 are not in use by other services
   - Use `docker compose down` to clean up before restarting

6. **Container Dependencies**:
   - Database must be healthy before backend starts
   - Backend must be healthy before frontend starts
   - Check logs with `docker compose logs [service]`

### Database Management
- `docker compose exec backend alembic upgrade head` - Run database migrations
- `docker compose exec backend alembic downgrade -1` - Rollback last migration
- `docker compose exec backend alembic revision --autogenerate -m "description"` - Create new migration
- `docker compose exec backend python setup_db.py` - Create default admin user
- Test data already created: 5 curriculum programs in the database
- `npm run db:setup` - Run production database setup script

### Multi-Role User Setup (UPDATED)
✅ **Role-based user accounts are created and ready to use:**

#### **Super Admin Account**
- **Username**: `admin`
- **Email**: `admin@academy.com`
- **Password**: `admin123`
- **Role**: `super_admin`
- **Access**: All programs + Academy Administration

#### **Program Admin Account**
- **Username**: `swim.admin`
- **Email**: `swim.admin@academy.com`
- **Password**: `swim123`
- **Role**: `program_admin`
- **Access**: Swimming program only

#### **Login Process & Role-Based Redirects:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials for desired role
3. **Automatic role-based redirect**:
   - **Super Admin** → `/admin` (main dashboard)
   - **Program Admin** → `/admin` (program dashboard)
   - **Coordinators** → `/admin/students` (student-focused)
   - **Tutors** → `/admin/students` (student interaction)

#### **Testing Different Role Experiences:**
- Login as Super Admin to access Academy Administration
- Login as Program Admin to experience program-scoped interface
- Use the program switcher (Super Admin) to test multi-program access
- Test route protection by accessing unauthorized URLs

⚠️ **Important**: Change all default passwords immediately after first login in production!

### Local PostgreSQL Database
- `npm run db:local:up` - Start PostgreSQL database only
- `npm run db:local:down` - Stop PostgreSQL database
- `npm run db:local:logs` - View PostgreSQL database logs

### Code Quality
- `npm run quality:all` - **Comprehensive quality checks** (linting, type checking, formatting for both frontend and backend)
- `npm run quality:frontend` - Run frontend quality checks (linting, type checking, formatting)
- `npm run quality:backend` - Run backend quality checks (linting, type checking, formatting)
- `npm run quality:fix` - Auto-fix quality issues (linting and formatting)
- `npm run lint:frontend` - Run frontend linting
- `npm run lint:frontend:fix` - Auto-fix frontend linting issues
- `npm run lint:backend` - Run backend linting (flake8)
- `npm run format:frontend` - Format frontend code (Prettier)
- `npm run format:backend` - Format backend code (Black + isort)
- `npm run format:frontend:check` - Check frontend code formatting
- `npm run format:backend:check` - Check backend code formatting
- `npm run type-check:frontend` - Run TypeScript type checking
- `npm run type-check:backend` - Run Python type checking (mypy)
- `npm run type-check:all` - Run type checking for both frontend and backend
- `npm run test:backend` - Run backend tests
- `npm run test:backend:watch` - Run backend tests in watch mode
- `npm run test:backend:coverage` - Run backend tests with coverage report
- `npm run test:frontend` - Run frontend tests
- `npm run test:frontend:watch` - Run frontend tests in watch mode
- `npm run test:frontend:coverage` - Run frontend tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run all tests

### Deployment
- `npm run deploy:check` - Run all quality checks before deployment (quality:all + test:all)
- `npm run deploy:build` - Complete production build with all checks

### Utility Commands
- `npm run clean` - Clean build artifacts and dependencies
- `npm run build:all` - Build all applications for production

## Program-Centric Architecture (NEW)

The Academy Admin system has been completely restructured to support multi-program organizations with role-based access control.

### 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Super Admin   │    │  Program Admin  │    │ Prog. Coord/    │
│                 │    │                 │    │ Tutor           │
│ • All Programs  │    │ • Assigned      │    │ • Assigned      │
│ • Academy Mgmt  │    │   Programs      │    │   Programs      │
│ • User Mgmt     │    │ • Team Mgmt     │    │ • Student Focus │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Program Context │
                    │   Management     │
                    │                 │
                    │ • Auto Context  │
                    │ • API Filtering │
                    │ • State Mgmt    │
                    └─────────────────┘
```

### 🎯 **Role-Based Access Control**

#### **Super Admin** (`super_admin`)
- **Access**: All programs + Academy Administration
- **Landing**: `/admin` (main dashboard)
- **Capabilities**:
  - Manage all programs across the academy
  - Create/edit/delete programs and locations
  - Manage user accounts and assign program access
  - Access Academy Administration section
  - Override program context for system-wide operations

#### **Program Admin** (`program_admin`)
- **Access**: Assigned programs only
- **Landing**: `/admin` (program dashboard)
- **Capabilities**:
  - Full management within assigned programs
  - Team management and user coordination
  - Payment processing for their programs
  - Student and curriculum management
  - Cannot access Academy Administration

#### **Program Coordinator** (`program_coordinator`)
- **Access**: Assigned programs only
- **Landing**: `/admin/students` (student-focused)
- **Capabilities**:
  - Student management and progress tracking
  - Curriculum access and scheduling
  - Limited team visibility
  - Cannot manage payments or administrative functions

#### **Tutor** (`tutor`)
- **Access**: Assigned programs only
- **Landing**: `/admin/students` (student interaction)
- **Capabilities**:
  - Student interaction and basic management
  - View curriculum and schedules
  - Limited access to program information
  - Cannot manage other users or payments

### 🔄 **Program Context Management**

#### **Context Switching**
- **Header Program Switcher**: Users with access to multiple programs can switch context
- **Automatic API Filtering**: All API calls automatically include program context
- **State Persistence**: Program selection persists across browser sessions
- **Real-time Updates**: Context changes immediately affect all data views

#### **Data Scoping**
```typescript
// Automatic program context injection
const students = await studentApi.getStudents(); // Automatically filtered by current program
const payments = await paymentApi.getPayments(); // Program-scoped data only

// Academy Administration bypass
const allPrograms = await programApi.getPrograms({ bypassProgramFilter: true }); // Super admin only
```

### 🗂️ **Navigation Structure**

#### **Program Management Section**
Available to all roles (data scoped by program):
- **Students**: Student management and progress tracking
- **Curriculum**: Program-specific curriculum management
- **Scheduling**: Program scheduling and calendar
- **Team**: Team member management (admin roles only)
- **Payments**: Payment processing (admin roles only)

#### **Academy Administration Section**
Available to Super Admin only:
- **Programs**: Create/manage academy programs
- **Locations**: Manage academy locations and facilities
- **Users**: User account management and program assignments
- **Settings**: System-wide configuration and settings

### 🔐 **Security Implementation**

#### **Route Protection**
- **RouteGuard Component**: Protects all admin routes
- **Role Validation**: Checks user permissions for each route
- **Program Requirements**: Validates program access for non-super-admin users
- **Automatic Redirects**: Redirects unauthorized users to appropriate pages

#### **API Security**
- **Program Context Middleware**: Automatically scopes API requests
- **Role-Based Endpoints**: Different access levels per endpoint
- **Data Isolation**: Users only see data for their assigned programs
- **Super Admin Override**: Bypass program filtering for system operations

### 📊 **User Experience**

#### **Seamless Context Switching**
- Users with multiple program access can switch seamlessly
- All data views update automatically with context changes
- Persistent program selection across sessions
- Clear visual indicators of current program context

#### **Role-Appropriate Landing**
- **Super Admin**: Full dashboard with academy overview
- **Program Admin**: Program-focused dashboard with management tools
- **Coordinators**: Student-centric view with program context
- **Tutors**: Simple interface focused on student interaction

#### **Progressive Access Control**
- Features progressively available based on role hierarchy
- Graceful degradation for insufficient permissions
- Clear feedback for access-denied scenarios
- Contextual help and navigation guidance

## API Endpoints

### Base URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health/
- **Database**: PostgreSQL on localhost:5432 (consistent across all environments)

### Working API Endpoints

✅ **Authentication** (Enhanced with role-based features - **VERIFIED WORKING**):
- `POST /api/v1/auth/login` - OAuth2 form-based login
- `POST /api/v1/auth/login/json` - **PRIMARY**: JSON-based login (used by frontend)
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user with role and program assignments

✅ **Program Management** (NEW - Program Context):
- `GET /api/v1/programs/` - List all programs (Super Admin) or assigned programs
- `POST /api/v1/programs/` - Create program (Super Admin only)
- `GET /api/v1/programs/{id}` - Get specific program
- `PUT /api/v1/programs/{id}` - Update program (Admin roles)
- `DELETE /api/v1/programs/{id}` - Delete program (Super Admin only)
- `GET /api/v1/programs/{id}/users` - Get program users (Admin roles)
- `POST /api/v1/programs/{id}/users` - Assign user to program (Super Admin)

✅ **User Program Assignments** (NEW):
- `GET /api/v1/users/{user_id}/programs` - Get user's program assignments
- `POST /api/v1/users/{user_id}/programs` - Assign user to program (Super Admin)
- `DELETE /api/v1/users/{user_id}/programs/{program_id}` - Remove program assignment

✅ **Curriculum Management** (Enhanced with program context):
- `GET /api/v1/curriculum/programs/` - List programs (automatically program-scoped)
- `POST /api/v1/curriculum/programs/` - Create program (requires auth)
- `GET /api/v1/curriculum/programs/{id}` - Get specific program
- `PUT /api/v1/curriculum/programs/{id}` - Update program
- `DELETE /api/v1/curriculum/programs/{id}` - Delete program

✅ **Health & Status**:
- `GET /api/v1/health/` - API health check (no auth required)

### Program Context API Behavior

All API endpoints now support program context parameters:

```typescript
// Automatic program context (for non-super-admin users)
GET /api/v1/students/ → Returns students for current program only

// Manual program context
GET /api/v1/students/?program_id=123 → Returns students for specific program

// Bypass program filtering (Super Admin only)
GET /api/v1/students/?bypass_program_filter=true → Returns all students across programs
```

### Role-Based API Access
- **Super Admin**: Full access to all endpoints, can bypass program filtering
- **Program Admin**: Access to endpoints within assigned programs
- **Program Coordinator**: Limited access within assigned programs
- **Tutor**: Read-only access within assigned programs

### Test Data Available ✅ **VERIFIED WORKING**
- **5 Programs**: Robotics Engineering, AI & Machine Learning, Web Development, Sports Training, Arts & Creative
- **User Accounts** (Login tested and functional): 
  - **Super Admin**: `admin@academy.com` / `admin123` → Full access + Academy Administration
  - **Program Admin**: `swim.admin@academy.com` / `swim123` → Swimming program access only
- **Program Assignments**: Existing data migrated to Swimming program
- **Authentication Flow**: CORS and 500 errors resolved, login working properly

## shadcn/ui Configuration
The project uses shadcn/ui as the primary UI component library:

### Setup Status
- ✅ **components.json** - Configuration file created
- ✅ **src/lib/utils.ts** - Utility functions with `cn()` helper
- ✅ **Core Components Installed**: Button, Card, Dialog, Dropdown Menu, Select, Tabs, Toast

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

### Component Usage
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
```

### Available Components
- **Button** - All variants (default, destructive, outline, secondary, ghost, link)
- **Card** - Complete card system with header, content, footer
- **Dialog** - Modal dialogs with overlay
- **Dropdown Menu** - Context menus and dropdowns  
- **Select** - Styled select inputs
- **Tabs** - Tab navigation components
- **Toast** - Notification system with useToast hook

## Code Quality & Testing Configuration

### Frontend Testing (Jest)
- **Configuration**: `frontend/jest.config.js`
- **Test Setup**: `frontend/src/tests/setup.ts`
- **Environment**: jsdom with Next.js integration
- **Coverage Threshold**: 70% for branches, functions, lines, statements
- **Test Patterns**: `**/__tests__/**/*.(ts|tsx|js|jsx)`, `**/*.(test|spec).(ts|tsx|js|jsx)`

### Backend Testing (Pytest)
- **Configuration**: `backend/pytest.ini` and `backend/pyproject.toml`
- **Test Database**: PostgreSQL test database (`academy_admin_test`)
- **Coverage Threshold**: 70% with HTML/XML reports
- **Test Markers**: 
  - `unit` - Unit tests
  - `integration` - Integration tests
  - `auth` - Authentication tests
  - `database` - Database tests
  - `api` - API tests
  - `student`, `curriculum`, `location`, `scheduling` - Feature-specific tests

### Code Formatting & Linting

#### Frontend ESLint Configuration
- **File**: `frontend/.eslintrc.js`
- **Extends**: Next.js core web vitals, TypeScript rules
- **Features**: Import ordering, accessibility rules, testing library integration
- **Auto-fix**: `npm run lint:frontend:fix`

#### Backend Code Quality Tools
- **Black**: Code formatting with 88-character line length
- **isort**: Import sorting with Black profile
- **flake8**: Code linting with complexity checks
- **mypy**: Static type checking with strict configuration
- **Configuration**: `backend/pyproject.toml`

### Running Quality Checks
```bash
# Run all quality checks (recommended before commits)
npm run quality:all

# Run frontend-specific checks
npm run quality:frontend

# Run backend-specific checks  
npm run quality:backend

# Auto-fix quality issues
npm run quality:fix
```

## Development Best Practices

### Quick Start for New Development Sessions
1. `./start-dev.sh` - Start both servers (if dependencies already installed)
2. If first time: `./install-backend-deps.sh` then `./start-dev.sh`

### Code Quality Commands
Always run these before committing:
- `npm run quality:all` - **Recommended**: Run all quality checks
- `npm run test:all` - Run all tests
- `npm run deploy:check` - Full deployment readiness check

## Security Configuration

### Security Headers Middleware
The backend now includes comprehensive security headers:

- **Content Security Policy (CSP)**: Restricts resource loading
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS in production
- **X-Frame-Options**: Prevents clickjacking (DENY)
- **X-Content-Type-Options**: Prevents MIME type sniffing (nosniff)
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Rate Limiting Middleware
- **Default Limits**: 100 requests per 60 seconds per IP
- **Temporary Blocking**: 5-minute block after rate limit exceeded
- **Excluded Paths**: `/health`, `/docs`, `/openapi.json`
- **Configuration**: Customizable in `backend/app/middleware/security.py`

### Request Logging Middleware
- **Request Logging**: Method, path, client IP, user agent
- **Response Logging**: Status code, processing time
- **Performance Headers**: X-Process-Time header added to responses
- **Security Events**: Rate limit violations and blocked IPs logged

### Security Implementation
```python
# Security middleware is automatically applied in main.py
from app.middleware.security import SecurityHeadersMiddleware, RateLimitMiddleware, LoggingMiddleware

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(LoggingMiddleware)
```

### Component Development
- Use shadcn/ui components as the foundation
- Follow the established pattern in `src/components/ui/`
- Utilize the `cn()` utility for conditional classes
- Prefer composition over customization

## Feature Specifications Location
Feature specifications are stored in the `specs/` directory. Reference these files when implementing new features:

- `specs/features/` - Individual feature specifications
- `specs/api/` - API endpoint specifications
- `specs/database/` - Database schema specifications
- `specs/ui/` - UI/UX specifications

## Deployment Strategy

### Architecture Overview
The Academy Admin system is designed for **separate deployment** of frontend, backend, and database components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │────│   (Railway)     │────│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Static Site   │    │ • API Service   │    │ • PostgreSQL    │
│ • Global CDN    │    │ • Auto Deploy   │    │ • Managed       │
│ • Auto Scale    │    │ • Health Checks │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Options

#### Recommended Stack (PaaS)
- **Frontend**: [Vercel](https://vercel.com) - Optimized for Next.js
- **Backend**: [Railway](https://railway.app) - Simple FastAPI deployment
- **Database**: [Supabase](https://supabase.com) - Managed PostgreSQL

#### Alternative Options
- **Frontend**: Netlify, Cloudflare Pages, AWS Amplify
- **Backend**: Render, Heroku, Fly.io, DigitalOcean App Platform
- **Database**: AWS RDS, Google Cloud SQL, PlanetScale

### Environment Configuration

#### Development vs Production
- **Development**: Uses Docker Compose for local development
- **Production**: Uses managed cloud services for scalability

#### Database Folder Usage
- **Development**: `database/init/` scripts initialize local PostgreSQL
- **Production**: Run `python database/production_setup.py` once on managed database
- **Ongoing**: Backend uses Alembic migrations for schema changes

### Deployment Commands
```bash
# Setup production environment
npm run setup:prod

# Database setup (run once)
npm run db:setup --database-url "your-production-database-url"

# Production build and deployment checks
npm run deploy:build
```

### Quick Deployment Guide
1. **Database**: Create Supabase project and run initialization script
2. **Backend**: Deploy to Railway with environment variables
3. **Frontend**: Deploy to Vercel with API URL configuration
4. **Configuration**: Update CORS origins and environment variables

For detailed deployment instructions, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## New Feature Development

### Adding New Features
When adding features not currently in the specs:

#### Quick Feature Creation
```bash
# Create a new feature specification
npm run create:feature "Feature Name" --description "Brief description" --priority high

# Example:
npm run create:feature "Payment Management" --description "Handle payments and billing" --priority high
```

This automatically creates:
- Feature specification: `specs/features/feature-name/README.md`
- API specification: `specs/api/feature-name.md`
- Database schema: `specs/database/feature-name.md`
- UI specification: `specs/ui/admin-dashboard/feature-name.md`

#### Manual Process
1. **Create Specifications**: Follow the established template in `specs/features/`
2. **Database Schema**: Add to `specs/database/`
3. **API Endpoints**: Document in `specs/api/`
4. **UI/UX Design**: Specify in `specs/ui/`

### Feature Specification Template
```
specs/features/[feature-name]/
├── README.md                 # Main feature specification
├── user-stories.md          # Detailed user stories (optional)
├── business-rules.md        # Complex business logic (optional)
└── technical-requirements.md # Detailed technical specs (optional)
```

### Sub-Agent Usage
Claude will automatically spawn sub-agents for:
- **Research Tasks**: Analyzing codebases, finding files, understanding patterns
- **Feature Analysis**: Reviewing specifications, identifying dependencies
- **Code Generation**: Creating consistent code following project patterns
- **Documentation**: Writing comprehensive documentation and guides

### Development Workflow
1. **Specification**: Create detailed specs following project template
2. **Database**: Design schema and migrations
3. **Backend**: Implement API endpoints and business logic
4. **Frontend**: Build UI components and integration
5. **Testing**: Write comprehensive tests for all layers
6. **Documentation**: Update API docs and user guides

## Version Information (Last Updated: 2025-07-16)
This project is configured with the latest stable versions as of July 2025. Key framework versions:
- Next.js 15.3.5 (latest stable)
- React 18.3.1 
- TypeScript 5.7.2
- Tailwind CSS 3.4.17
- FastAPI 0.115.12

### Recent Updates (2025-07-16)
- ✅ **Critical Bug Fixes**: Resolved authentication CORS and 500 errors
- ✅ **HTTP Client**: New reliable API communication layer
- ✅ **Model Relationships**: Fixed SQLAlchemy UserProgramAssignment imports
- ✅ **Authentication Standardization**: Unified `useAuth` naming convention
- ✅ **Client/Server Separation**: Proper Next.js 15 component architecture
- ✅ **Production Ready**: All containers healthy and login functional
- ✅ **Deployment Optimization**: Separate deployment strategy implemented
- ✅ **Environment Configuration**: Production-ready environment setup
- ✅ **Database Strategy**: Managed database service integration
- ✅ **Production Scripts**: Comprehensive build and deployment automation
- ✅ **Docker Support**: Optional containerized deployment configurations
- ✅ **Next.js 15 Structure**: Route groups and loading/error boundaries implemented

## Next.js 15 Folder Structure Standards

### Route Organization (2025 Best Practices)
Our frontend follows Next.js 15 App Router with optimized structure:

#### Route Groups Pattern
```
src/app/
├── (auth)/                    # Auth route group
│   ├── login/page.tsx         # Route: /login
│   ├── register/page.tsx      # Route: /register
│   ├── loading.tsx            # Loading UI for auth routes
│   └── error.tsx              # Error UI for auth routes
├── (dashboard)/               # Dashboard route group  
│   ├── page.tsx               # Route: /admin (dashboard home)
│   ├── students/              # Route: /admin/students
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   ├── [id]/edit/page.tsx
│   │   ├── new/page.tsx
│   │   ├── loading.tsx        # Loading UI for students
│   │   └── error.tsx          # Error UI for students
│   ├── curriculum/            # Route: /admin/curriculum
│   ├── locations/             # Route: /admin/locations
│   ├── scheduling/            # Route: /admin/scheduling
│   ├── settings/              # Route: /admin/settings
│   ├── users/                 # Route: /admin/users
│   ├── loading.tsx            # Loading UI for dashboard
│   └── error.tsx              # Error UI for dashboard
├── layout.tsx                 # Root layout
├── page.tsx                   # Route: / (home/landing)
└── globals.css
```

#### Benefits of Route Groups
- **Logical Organization**: Groups related routes without affecting URLs
- **Shared Layouts**: Each group can have its own layout
- **Better UX**: Specific loading/error states per route group
- **Maintainability**: Clear separation between auth and dashboard flows

### Loading & Error Boundaries Standard

#### Required Files for New Features
When adding new routes/features, **ALWAYS** include:

1. **loading.tsx** - Loading skeleton UI
2. **error.tsx** - Error boundary with recovery options
3. **page.tsx** - Main route component

#### Loading UI Standards
```typescript
// loading.tsx template
export default function FeatureLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        {/* Feature-specific skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### Error UI Standards  
```typescript
// error.tsx template
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeatureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Feature error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">
              Feature Error
            </CardTitle>
            <CardDescription>
              Something went wrong loading this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              {error.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin'} 
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### New Feature Development Rules

#### 1. Route Structure for New Features
```bash
# For dashboard features, always use:
src/app/(dashboard)/[feature-name]/
├── page.tsx           # Main feature page
├── loading.tsx        # Feature loading UI
├── error.tsx          # Feature error UI  
├── [id]/page.tsx      # Detail view
├── [id]/edit/page.tsx # Edit view
└── new/page.tsx       # Create view
```

#### 2. Component Structure for New Features  
```bash
# Feature components follow this pattern:
src/features/[feature-name]/
├── components/
│   ├── FeatureList.tsx
│   ├── FeatureForm.tsx
│   ├── FeatureCard.tsx
│   └── index.ts
├── hooks/
│   ├── useFeature.tsx
│   ├── useFeatureList.tsx
│   └── index.ts
├── api/
│   ├── featureApiService.ts
│   └── index.ts
├── types/
│   ├── feature.types.ts
│   └── index.ts
└── index.ts
```

#### 3. Mandatory Implementation Checklist
For every new feature page:
- ✅ Route group placement: `(dashboard)` or `(auth)`
- ✅ Loading state: Custom `loading.tsx` with skeleton UI
- ✅ Error handling: Custom `error.tsx` with recovery actions
- ✅ TypeScript types: Proper type definitions in feature types
- ✅ API integration: Consistent API service pattern
- ✅ Form validation: React Hook Form + Zod validation
- ✅ shadcn/ui components: Use project UI library consistently
- ✅ Responsive design: Mobile-first Tailwind CSS classes

# CRITICAL DEVELOPMENT SETUP INSTRUCTIONS

## Database Strategy

### Unified PostgreSQL Approach
**All environments use PostgreSQL for consistency:**

```
Development (Docker): PostgreSQL in container
Development (Local): PostgreSQL via Docker + local apps
Production: Managed PostgreSQL (Supabase/RDS)
```

### Alembic Configuration
- **Database URL**: Configured via `DATABASE_URL` environment variable
- **Migration Files**: Located in `backend/alembic/versions/`
- **Configuration**: `backend/alembic.ini` uses environment variables (no hardcoded SQLite)
- **Auto-migrations**: Run automatically on Docker container startup
- **Manual migrations**: Use `npm run db:migrate` or `npm run db:migrate:create`

### Setup Options

#### Option 1: Full Docker (Recommended)
```bash
# Start everything in Docker
docker-compose up

# Uses .env.docker for configuration
# All services containerized
```

#### Option 2: Local Development with PostgreSQL
```bash
# First time setup
./setup-local-db.sh

# Daily development
./start-dev.sh

# Uses .env.local for configuration
# PostgreSQL in Docker, apps run locally
```

### Environment Files
- **`.env.docker`** - Full Docker development
- **`.env.local`** - Local development with PostgreSQL
- **`.env.production`** - Production deployment
- **`.env.*.example`** - Template files for each environment

### Benefits of Unified PostgreSQL
- ✅ **Consistency**: Same database across all environments
- ✅ **Features**: Full PostgreSQL features in development
- ✅ **Production Parity**: Matches production database
- ✅ **Team Collaboration**: Consistent setup across team members
- ✅ **Data Integrity**: Proper constraints and relationships