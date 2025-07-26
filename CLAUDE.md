# Academy Admin - Claude AI Instructions

## Project Overview
Academy Management System with program-centric architecture, role-based access control, and comprehensive educational institution management.

**📖 For detailed setup instructions, see: [`docs/setup/PROJECT_SETUP.md`](docs/setup/PROJECT_SETUP.md)**

## Current Status (2025-07-26)

### ✅ **Fully Implemented Features**
- **Database Schema**: PostgreSQL with program-centric design ✅ **FIXED (2025-07-21)**
- **Authentication System**: JWT with enhanced multi-profile support (Super Admin, Program Admin, Program Coordinator, Instructor, Student, Parent) ✅ **TESTED**
- **Program Context Architecture**: HTTP header-based filtering with automatic security enforcement
- **Course Management**: Full CRUD with program context integration
- **🆕 Curriculum Management**: Complete curriculum-centric management system ✅ **IMPLEMENTED (2025-07-23)**
- **Facility Management**: Complete facility management system
- **User Management**: Enhanced role-based program assignments with profile types ✅ **VERIFIED**
- **Teams Management**: Program-specific team member management with role-based access control
- **🆕 Organization Management**: Complete partner organization system with multi-tenant support ✅ **IMPLEMENTED (2025-07-26)**
- **🆕 Parent-Child Relationships**: Family structure management with payment responsibility tracking ✅ **IMPLEMENTED (2025-07-26)**
- **🆕 Payment Override System**: Organization-based payment overrides and access control ✅ **IMPLEMENTED (2025-07-26)**
- **🆕 Partner Admin Dashboard**: Dedicated interface for partner organization management ✅ **IMPLEMENTED (2025-07-26)**
- **Quality Assurance**: Automated program context compliance checking
- **Layout Architecture**: Context-based page header system with clean component separation
- **Multi-App Development Infrastructure**: Complete setup for instructor/coordinator and student/parent mobile apps
- **Shared API Client Library**: Unified TypeScript API client for all applications
- **Git Subtree Workflow**: Automated workflow for managing multiple app repositories
- **🆕 Database Migrations**: All migrations completed successfully with enum type fixes
- **🆕 API Endpoints**: All core endpoints tested and working with proper authentication
- **🆕 API Client Migration**: Complete migration from legacy apiClient to httpClient with program context headers
- **🆕 Program Context Compliance**: All pages now use TanStack Query hooks with automatic program context switching

**📖 For architecture details, see: [`docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`](docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md)**

### 🎯 **Quick Access**
- **Default Users**: Super Admin (`admin@academy.com`/`admin123`), Program Admin (`swim.admin@academy.com`/`swim123`) ✅ **WORKING**
- **API Docs**: http://localhost:8000/docs ✅ **ACCESSIBLE**
- **Frontend App**: http://localhost:3000 ✅ **RUNNING**
- **Academy Programs**: 6 programs available (Swimming, Football, Basketball, Music, Robotics Engineering, Test program) ✅ **VERIFIED**

**📖 For complete API reference, see: [`docs/api/API_ENDPOINTS.md`](docs/api/API_ENDPOINTS.md)**  
**📖 For organization management API, see: [`docs/api/ORGANIZATION_ENDPOINTS.md`](docs/api/ORGANIZATION_ENDPOINTS.md)**

### 🔧 **Latest Updates (2025-07-26)**
- **🆕 Organization Management System**: Complete partner organization system with multi-tenant capabilities ✅ **IMPLEMENTED**
- **🆕 Enhanced User Profiles**: Support for full users vs profile-only accounts (children) with proper authentication ✅ **IMPLEMENTED**
- **🆕 Parent-Child Relationships**: Bidirectional family structure management with payment responsibility tracking ✅ **IMPLEMENTED**
- **🆕 Payment Override System**: Organization-based payment calculations and access control overrides ✅ **IMPLEMENTED**
- **🆕 Partner Admin Dashboard**: Dedicated interface for managing sponsored students and organizational settings ✅ **IMPLEMENTED**
- **🆕 Reusable Form Components**: PersonSearchAndSelect, OrganizationSelector, and RelationshipManager components ✅ **IMPLEMENTED**
- **🆕 Atomic Creation Services**: Multi-profile creation with organization inheritance and conflict resolution ✅ **IMPLEMENTED**

### 🔧 **Previous Updates (2025-07-25)**
- **🆕 Content Management System**: Enhanced lesson and assessment creation with hierarchical assignment system ✅ **IMPLEMENTED**
- **🆕 Separated Content Forms**: Distinct specialized forms for lessons and assessments with multi-location assignment
- **🆕 Database Schema Updates**: Added fields for lesson types, resource links, and assessment items

### 🔧 **Previous Fixes (2025-07-21)**
- **Database Migration Issues**: Fixed PostgreSQL ENUM type mismatches and explicit casting problems
- **SQLAlchemy Relationships**: Resolved circular import issues with CourseEnrollment and UserProgramAssignment models
- **Program Status Enum**: Fixed mismatch between `programstatus` (lowercase) and `curriculumstatus` (uppercase) enum types
- **Authentication Flow**: Verified JWT token generation and API authentication is working properly
- **API Error Resolution**: Resolved 500 Internal Server Error issues on Academy Admin pages
- **Data Initialization**: Successfully created default admin users and academy programs
- **Code Cleanup**: Removed temporary files, Python cache files, and setup scripts
- **API Client Migration**: Migrated all frontend API calls from legacy apiClient to httpClient with program context headers
- **Endpoint Standardization**: Replaced all hardcoded API paths with centralized API_ENDPOINTS constants
- **Response Format Unification**: Standardized all API responses to use `{success, data, error}` format
- **Program Context Standardization**: All pages now auto-refresh on program context switching
- **Nigerian Naira (NGN)**: Standardized all pricing to use NGN currency throughout the system

### 🚨 **Known Issues Resolved**
- ✅ Programs API returning 500 errors → **FIXED**: Enum type mapping corrected
- ✅ Database migration failures → **FIXED**: Explicit casting added for ENUM conversions  
- ✅ Authentication 401 errors → **FIXED**: Proper login credentials and JWT flow verified
- ✅ Missing initial data → **FIXED**: Admin users and programs created successfully
- ✅ API endpoint 404 errors → **FIXED**: Centralized endpoint configuration and httpClient migration
- ✅ Missing program context headers → **FIXED**: All API calls now use httpClient with automatic program context
- ✅ Program context switching not refreshing data → **FIXED**: All pages use TanStack Query hooks with program context

### 📄 **Current Page Status**
**✅ Program Context Compliant Pages** (Auto-refresh on program switching):
- **Courses Page**: Perfect implementation with `useCourses`, `useCurricula` hooks
- **🆕 Curriculum Management**: Complete curriculum-centric system with tabbed interface
- **Facilities Page**: Recently fixed - uses `useFacilities` hook with program context  
- **Students & Parents Page**: Uses `useStudents`, `useParents` hooks with program context
- **Teams, Payments, Scheduling Pages**: Use proper component delegation

**✅ Academy Admin Pages** (Correctly bypass program context):
- **Users Management** (`/admin/users/*`): Super Admin only, uses bypass headers
- **Academy Programs** (`/admin/academy/*`): Super Admin only, cross-program access

### 🎓 **Curriculum Management System (NEW)**
- **Full-Page Workflows**: Moved from modal-based to dedicated page interfaces
- **Course-Grouped Display**: Curricula organized by course in collapsible sections
- **Unified Edit Interface**: Single edit page with Details and Builder tabs
- **Default Management**: Set curricula as default for age groups with automatic conflict resolution
- **Advanced Search**: Filter by course, difficulty, status, age groups, and default status
- **Age Range Configuration**: JSON-based flexible age group management
- **Program Context Security**: All curriculum operations filtered by program assignments

**📖 For complete curriculum documentation, see: [`docs/features/curriculum/README.md`](docs/features/curriculum/README.md)**

### 📝 **Enhanced Content Creation System (2025-07-25)**
- **🆕 Separate Lesson & Assessment Forms**: Distinct creation workflows with specialized fields
- **🆕 Hierarchical Assignment System**: Multi-level assignment with visual breadcrumb navigation
  - **Lessons**: Course → Curriculum → Level → Module → Section
  - **Assessments**: Course → Curriculum → Level
- **🆕 Multi-Location Assignment**: Assign single content to multiple curriculum locations
- **🆕 Enhanced Lesson Fields**:
  - Title-based naming (instead of generic "name")
  - Instructor Guide (replaces Learning Objectives)
  - Multiple resource links (video, document, link, other)
  - Multiple lesson types selection (video, text, interactive, practical)
  - Optional duration field
- **🆕 Enhanced Assessment Fields**:
  - Title-based naming with assessment codes
  - Assessment Guide for instructors
  - Collapsible/reorderable assessment items with drag-and-drop
  - 3-star grading system integration
  - Level-based assignment targeting
- **🆕 Visual Assignment Management**:
  - Assignment preview cards with location breadcrumbs
  - Easy add/remove functionality
  - Duplicate assignment prevention
  - Clear hierarchical selection workflow
- **🆕 Database Schema Updates**:
  - Added `is_required`, `resource_links`, `lesson_types` to lessons table
  - Added `difficulty_level`, `assessment_type`, `assessment_guide`, `is_required` to assessment_rubrics table
  - New `LessonType` and `AssessmentType` enums
- **🆕 Accessibility Compliance**: Fixed screen reader compatibility with proper DialogTitle/DialogDescription

## Development Commands

### 🚀 **Quick Start**
```bash
# RECOMMENDED: Full Docker development
docker compose up

# 🆕 Auto-restart development (restarts frontend on changes)
npm run dev:auto:watch

# Alternative: Local development 
./start-dev.sh

# 🆕 Multi-app development (all apps)
npm run dev:all

# 🆕 Mobile apps only
npm run mobile:dev

# Manual frontend restart
npm run restart:frontend
```

### 🔄 **Auto-Restart Development (NEW)**
```bash
# Start with file watching (automatically restarts frontend on changes)
npm run dev:auto:watch

# Manual restart options
npm run restart:frontend          # Quick frontend restart
./scripts/restart-frontend.sh     # Direct script access

# Watch-only mode (no automatic restart)
npm run dev:watch

# Auto-restart specific services
npm run dev:auto-restart          # Frontend only
npm run dev:auto-restart:all      # All services
```

**📋 Auto-Restart Features:**
- **Automatic Detection**: Monitors `frontend/src/`, `frontend/public/`, config files, and `shared/`
- **Smart Restart**: Only restarts when necessary changes are detected
- **WSL Optimized**: Special handling for Windows Subsystem for Linux
- **Health Checks**: Waits for services to be ready before reporting success
- **Manual Override**: Quick manual restart commands available

### 🛡️ **Quality Assurance (MANDATORY)**
```bash
# Before any feature development
npm run quality:academy

# Before committing
npm run deploy:check
```

**📖 For complete workflow, see: [`docs/development/DEVELOPMENT_WORKFLOW.md`](docs/development/DEVELOPMENT_WORKFLOW.md)**

## Architecture Overview

### 🏗️ **Program-Centric Design**
Programs are the TOP-LEVEL context. All data is scoped by program assignments.

```
Academy Administration (/admin/academy/) → Manage programs (Super Admin only)
Program Management (/admin/) → Operate within program context (All roles)
```

### 🔐 **Role-Based Access**
- **Super Admin**: All programs + academy administration
- **Program Admin**: Assigned programs, team management
- **Program Coordinator**: Assigned programs, student focus
- **Tutor**: Assigned programs, read-only interaction

### 🔄 **HTTP Headers**
- `X-Program-Context: program-id` - Auto-injected program context
- `X-Bypass-Program-Filter: true` - Super admin bypass

### 🎨 **Layout Architecture (2025-07-20)**
- **PageHeaderContext**: Global state management for page titles/descriptions
- **usePageTitle Hook**: Easy page header management from feature pages  
- **Global Header**: Left-aligned page titles, right-aligned program context
- **Action Button Positioning**: Contextual placement beside relevant section headers
- **Clean Component Separation**: No duplicate layouts or nested components

## Feature Development Rules

### 🚨 **CRITICAL: Program Context Requirements**
Every new feature MUST include:
1. **Models**: `program_id` foreign key field
2. **Services**: `program_context` parameter in all methods
3. **Routes**: Program context dependency injection
4. **Frontend Hooks**: TanStack Query hooks with program context integration
5. **Tests**: Program context filtering tests

**📖 For detailed standards, see: [`docs/development/PROGRAM_CONTEXT_STANDARDS.md`](docs/development/PROGRAM_CONTEXT_STANDARDS.md)**
**📖 For development guidelines, see: [`docs/development/FUTURE_DEVELOPMENT_GUIDELINES.md`](docs/development/FUTURE_DEVELOPMENT_GUIDELINES.md)**

### 🎯 **Before Creating Features**
Ask: "Is this Academy Administration (managing programs) or Program Management (within program)?"

**Program Management** (`/admin/*`): Use `useProgramContext()` + program-aware hooks
**Academy Administration** (`/admin/academy/*`, `/admin/users/*`): Use bypass headers, no program context

### 🎨 **Layout Development Standards**
Every new feature page MUST follow:
1. **Page Headers**: Use `usePageTitle(title, description)` hook for global header
2. **No Duplicate Layouts**: Never wrap pages in `DashboardLayout` - admin layout provides this
3. **Action Button Placement**: Position beside relevant section headers, not in global header
4. **Component Structure**: Return simple `<div className="space-y-6">` containers
5. **Tabs with Actions**: Place action buttons beside secondary section titles within tabs

### 📋 **Task Management**
- Use TodoWrite tool for complex tasks
- Include quality assurance todos
- Mark tasks completed immediately upon completion

## Technology Stack

### Frontend: Next.js 15 + TypeScript + Tailwind + shadcn/ui
### Backend: FastAPI + PostgreSQL + SQLAlchemy + JWT
### Development: Docker Compose + pytest + comprehensive quality tools
### Currency: Nigerian Naira (NGN) - All pricing throughout the academy system

## File Organization

### 📁 **Key Directories**
- `/docs/` - Project documentation (setup, architecture, workflows)
- `/specs/` - Feature specifications and requirements  
- `/tools/` - Quality assurance and development tools
- `/backend/app/features/` - Backend feature modules
- `/frontend/src/features/` - Frontend feature modules

### 📝 **Documentation Structure**
- **[`docs/README.md`](docs/README.md)** - 📚 **DOCUMENTATION INDEX** (Start here!)
- `docs/setup/PROJECT_SETUP.md` - Setup and daily development  
- `docs/architecture/` - System architecture and program context design
- `docs/api/API_ENDPOINTS.md` - Complete API reference
- `docs/development/` - Development workflow and standards
- `docs/features/` - Feature-specific documentation
  - **[`docs/features/curriculum/README.md`](docs/features/curriculum/README.md)** - Complete curriculum management system documentation
  - **[`docs/features/curriculum/CURRICULUM_PROGRESSION_SPECIFICATION.md`](docs/features/curriculum/CURRICULUM_PROGRESSION_SPECIFICATION.md)** - Star-based progression and assessment specification

## Security & Compliance

### 🛡️ **Automated Security**
- Program context filtering enforcement
- Cross-program access prevention
- Role-based data isolation
- Security vulnerability scanning

### 📊 **Quality Tools**
- `npm run program-context:lint` - Validate program context compliance
- `npm run security:scan` - Security vulnerability detection
- `npm run quality:academy` - Comprehensive Academy Admin checks

**⚠️ IMPORTANT**: Always run quality checks before committing. Git hooks enforce compliance.

## Next.js 15 Standards

### Route Organization
```
src/app/(auth)/          # Authentication routes
src/app/(dashboard)/     # Main application routes
```

### Required Files for New Features
- `page.tsx` - Main component
- `loading.tsx` - Loading skeleton
- `error.tsx` - Error boundary

### Component Structure
```
src/features/[feature]/
├── components/          # UI components
├── hooks/              # Custom hooks  
├── api/                # API services
└── types/              # TypeScript types
```

### Layout Architecture (Updated 2025-07-20)
```typescript
// Feature page pattern
export default function FeaturePage() {
  usePageTitle('Page Title', 'Page description for global header');
  
  return (
    <div className="space-y-6">
      {/* For pages with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>...</TabsList>
        <TabsContent>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Section Title</CardTitle>
                  <CardDescription>Section description</CardDescription>
                </div>
                <Button>Action</Button> {/* Action beside section header */}
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* For pages without tabs */}
      <div className="flex justify-end">
        <Button>Main Action</Button> {/* Action at top-right */}
      </div>
    </div>
  );
}
```

## 📱 Multi-App Development Infrastructure (CURRENT)

### 🏗️ **Complete Implementation Status**
✅ **Multi-App Architecture**: Unified development environment for 3 applications
- **Admin Dashboard** (Web): Existing Next.js application for academy management
- **Tutor/Coordinator Mobile App**: React Native/Expo app for staff
- **Student/Parent Mobile App**: React Native/Expo app for students and parents

✅ **Shared Resources System**:
- **TypeScript Types**: Complete type definitions extracted from backend schemas
- **API Client Library**: Unified API client with authentication and program context
- **Common Utilities**: Shared helper functions and constants

✅ **Git Subtree Workflow**: Automated repository management for separate deployments
- **Main Repository**: Central development environment
- **Tutor App Repository**: Independent deployment for app stores
- **Student App Repository**: Independent deployment for app stores

### 🎯 **Quick Start Commands**

```bash
# Multi-app development (all apps)
npm run dev:all

# Mobile apps only
npm run mobile:dev

# Git subtree management
npm run subtree:setup    # One-time setup
npm run subtree:sync     # Sync shared resources
npm run subtree:push     # Deploy to mobile repositories
```

### 🔧 **Development Workflow**

#### **Day-to-Day Development**
1. **Start Development**: `npm run dev:all` (starts all apps + backend)
2. **Make Changes**: Edit code in main repository
3. **Sync Shared Resources**: `npm run subtree:sync` (after shared changes)
4. **Deploy Mobile Apps**: `npm run mobile:deploy` (when ready)

#### **Repository Management**
- **Main Development**: Work in `/academy-admin/` repository
- **Mobile Deployment**: Use subtree commands to push to separate repositories
- **Shared Code**: Automatically synchronized across all apps

### 🎨 **Application Architecture**

#### **Role-Based Access Control** (Enhanced)
- **Super Admin**: Full access + Academy Administration
- **Program Admin**: Program management + team coordination
- **Program Coordinator**: Student management + limited admin access
- **Tutor**: Student interaction + basic management
- **🆕 Student**: Mobile app access to own profile, progress, communications
- **🆕 Parent**: Mobile app access to children's data and communications

#### **API Endpoints** (Enhanced with Mobile Support)
```
✅ Mobile-Specific Endpoints Added:
/api/v1/students/me                    # Student profile (mobile)
/api/v1/students/me/progress           # Student progress (mobile)
/api/v1/students/me/attendance         # Student attendance (mobile)
/api/v1/students/me/assessments        # Student assessments (mobile)
/api/v1/students/me/communications     # Student messages (mobile)
/api/v1/students/me/parents           # Parent contacts (mobile)
```

#### **Docker Development** (Enhanced)
```bash
# Full development (recommended)
docker-compose up

# Mobile-specific development
docker-compose -f docker-compose.yml -f docker-compose.mobile.yml up

# Individual services
docker-compose up instructor-mobile
docker-compose up student-mobile
```

### 📁 **Directory Structure** (Updated)

```
academy-admin/                    # Main repository
├── apps/                         # 🆕 Multi-app directory
│   ├── README.md                 # App development guide
│   ├── academy-instructors-app/  # Instructor/coordinator mobile app
│   └── academy-students-app/     # Student/parent mobile app
├── shared/                       # 🆕 Shared resources
│   ├── types/                   # TypeScript type definitions
│   ├── api-client/              # Unified API client library
│   └── utils/                   # Common utilities
├── backend/                      # FastAPI backend (shared)
├── frontend/                     # Next.js admin dashboard
├── scripts/                      # 🆕 Automation scripts
│   └── subtree-commands.sh       # Git subtree management
├── PROJECT_STRUCTURE.md          # 🆕 Complete architecture guide
├── docker-compose.mobile.yml     # 🆕 Mobile development
└── docker-compose.override.yml   # 🆕 Development overrides
```

### 🔄 **Automated Workflows**

#### **Shared Resource Synchronization**
- **Automatic**: Shared code synced during development
- **Manual**: `npm run subtree:sync` to force sync
- **Real-time**: Docker volumes maintain live sync

#### **Repository Deployment**
- **Instructor App**: `npm run subtree:push:instructor`
- **Student App**: `npm run subtree:push:student`  
- **Both Apps**: `npm run subtree:push`

#### **Quality Assurance Integration**
- **Program Context**: All mobile endpoints follow program filtering rules
- **Security**: Role-based access control enforced
- **Testing**: Automated tests for mobile API endpoints

### 📚 **Documentation References**
- **Project Structure**: [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) - Complete multi-app architecture guide
- **Shared API Client**: [`shared/api-client/README.md`](shared/api-client/README.md)
- **Multi-App Guide**: [`apps/README.md`](apps/README.md)

## Notes for Claude

### 🎯 **Always Reference Documentation**
- Read relevant docs before implementation
- Update documentation when adding features
- Use existing patterns and conventions

### 🔍 **Quality First**
- Run `npm run quality:academy` before major changes
- Use TodoWrite for complex task tracking
- Follow program context architecture strictly

### 📖 **When to Read External Docs**
- **Documentation Index**: Read [`docs/README.md`](docs/README.md) - **START HERE!**
- New features: Read `docs/development/DEVELOPMENT_WORKFLOW.md`
- API changes: Read `docs/api/API_ENDPOINTS.md`  
- Architecture questions: Read `docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`
- Setup issues: Read `docs/setup/PROJECT_SETUP.md`
- **Curriculum work**: Read `docs/features/curriculum/README.md` for complete curriculum system documentation
- **Progression systems**: Read `docs/features/curriculum/CURRICULUM_PROGRESSION_SPECIFICATION.md` for star-based assessment details
- **Content Management**: Read `docs/features/courses/CONTENT_MANAGEMENT.md` for lesson/assessment creation and assignment system
- Feature specifications: Read `docs/features/[feature-name]/README.md`

**Remember: Documentation is your friend. When in doubt, check the docs first!**

## 🧹 **Project Status & Cleanup (2025-07-23)**

### ✅ **Recently Completed (2025-07-23)**
- **🆕 Curriculum System Restructuring**: Complete migration from course-centric to curriculum-centric management
- **🆕 Documentation Organization**: Moved curriculum docs to proper `docs/features/curriculum/` structure
- **🆕 Component Architecture**: Renamed `EnhancedCurriculumBuilder` to `CurriculumBuilder` with proper integration
- **🆕 Tabbed Interface Implementation**: Unified Details + Builder tabs in edit workflows
- **🆕 Default Management System**: Age group-based curriculum defaults with conflict resolution

### ✅ **Previous Cleanup (2025-07-19)**
- **Removed temporary files**: `backend.log`, `frontend.log`, build caches
- **Consolidated documentation**: Merged `git-subtree-workflow.md` into `PROJECT_STRUCTURE.md`
- **Removed backup files**: `CLAUDE_BACKUP.md` no longer needed
- **Updated repository structure**: All repositories now use `main` branch
- **Corrected app paths**: `apps/academy-instructors-app/` and `apps/academy-students-app/`

### 📁 **Current Clean Structure**
- **Main Repository**: `RemmySpicy/academy-admin` (development)
- **Mobile Repositories**: `RemmySpicy/academy-instructors-app`, `RemmySpicy/academy-students-app` (deployment)
- **Shared Resources**: Unified across all applications
- **Documentation**: Consolidated, organized, and up-to-date with proper feature separation

## 🏢 **Organization Management System (NEW)**

### 📋 **Complete Documentation**
- **🆕 Organization Management Overview**: [`docs/features/organizations/README.md`](docs/features/organizations/README.md) - Complete system documentation with architecture, features, and usage examples
- **🆕 Payment Override Specification**: [`docs/features/organizations/PAYMENT_OVERRIDE_SPECIFICATION.md`](docs/features/organizations/PAYMENT_OVERRIDE_SPECIFICATION.md) - Detailed payment calculation rules and override logic
- **🆕 Partner Admin Guide**: [`docs/features/organizations/PARTNER_ADMIN_GUIDE.md`](docs/features/organizations/PARTNER_ADMIN_GUIDE.md) - Complete guide for partner organization administrators
- **🆕 Organization API Reference**: [`docs/api/ORGANIZATION_ENDPOINTS.md`](docs/api/ORGANIZATION_ENDPOINTS.md) - Comprehensive API documentation for organization endpoints

### 🎯 **Key Features Implemented**
- **Partner Organization Management**: Complete CRUD operations with multi-tenant support
- **Payment Override System**: Flexible payment calculations with organization sponsorship
- **Family Structure Management**: Parent-child relationships with payment responsibility tracking
- **Partner Admin Dashboard**: Dedicated interface for organization administrators
- **Enhanced User Profiles**: Support for full users vs profile-only accounts (children)
- **Atomic Creation Services**: Multi-profile creation with organization inheritance
- **Reusable Form Components**: PersonSearchAndSelect, OrganizationSelector, RelationshipManager

### 🔧 **Technical Implementation**
- **Database Schema**: Organizations, OrganizationMembership, and UserRelationship tables with proper constraints
- **Service Layer**: PaymentOverrideService, PartnerAdminService, and AtomicCreationService
- **API Endpoints**: Complete REST API with authentication and program context integration
- **Frontend Components**: Enhanced creation forms and partner management interface
- **Authentication**: Extended JWT system with organization context and partner admin roles

### 📊 **Business Value**
- **Multi-tenant Capabilities**: Organizations can manage their own sponsored students
- **Flexible Payment Models**: Support for full, partial, and custom sponsorship arrangements
- **Family Management**: Complete parent-child relationship tracking with payment responsibilities
- **Partner Autonomy**: Organizations can self-manage their academy engagement
- **Program Context Security**: All operations respect program boundaries and access control