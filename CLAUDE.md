# Academy Admin - Claude AI Instructions

## Project Overview
Academy Management System with program-centric architecture, role-based access control, and comprehensive educational institution management.

**📖 For detailed setup instructions, see: [`docs/setup/PROJECT_SETUP.md`](docs/setup/PROJECT_SETUP.md)**

## Current Status (2025-01-28)

### ✅ **Core System Features**
- **Database Schema**: PostgreSQL with program-centric design ✅ **HEALTHY**
- **Authentication System**: JWT with multi-profile support (Super Admin, Program Admin, Program Coordinator, Instructor, Student, Parent) ✅ **WORKING**
- **Program Context Architecture**: HTTP header-based filtering with automatic security enforcement ✅ **ACTIVE**
- **Quality Assurance**: Automated program context compliance checking ✅ **ENABLED**

### 🚀 **Latest Deployment (2025-01-28)**
- **🆕 Course Assignment System**: Two-step workflow with 12 API endpoints ✅ **DEPLOYED**
- **🆕 Enhanced Student/Parent Management**: Assignment-based operations with 24 endpoints ✅ **DEPLOYED**  
- **🆕 Database Schema**: ProgramAssignment model and enhanced CourseEnrollment ✅ **MIGRATED**
- **🆕 System Health**: All 208 API endpoints verified and accessible ✅ **HEALTHY**

### 🎯 **Quick Access**
- **Default Users**: Super Admin (`admin@academy.com`/`admin123`), Program Admin (`swim.admin@academy.com`/`swim123`) ✅ **WORKING**
- **API Docs**: http://localhost:8000/docs ✅ **ACCESSIBLE** (208 endpoints)
- **Frontend App**: http://localhost:3000 ✅ **RUNNING** (Next.js 15)
- **Academy Programs**: 6 programs available ✅ **VERIFIED**

**📖 For complete API reference, see: [`docs/api/API_ENDPOINTS.md`](docs/api/API_ENDPOINTS.md)**  
**📖 For architecture details, see: [`docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`](docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md)**  
**📖 For cross-feature integration patterns, see: [`docs/architecture/FEATURE_INTEGRATION_GUIDE.md`](docs/architecture/FEATURE_INTEGRATION_GUIDE.md)**

## 📋 **Feature Implementation Status**

### ✅ **Fully Implemented & Deployed**
| Feature | Status | Documentation |
|---------|--------|---------------|
| **Student/Parent Course Assignment System** | ✅ Deployed | [`docs/features/students/IMPLEMENTATION_SUMMARY.md`](docs/features/students/IMPLEMENTATION_SUMMARY.md) |
| **Curriculum Management** | ✅ Complete | [`docs/features/curriculum/README.md`](docs/features/curriculum/README.md) |
| **Scheduling System** | ✅ Complete | [`docs/features/scheduling/IMPLEMENTATION_SUMMARY_2025.md`](docs/features/scheduling/IMPLEMENTATION_SUMMARY_2025.md) |
| **Organization Management** | ✅ Complete | [`docs/features/organizations/README.md`](docs/features/organizations/README.md) |
| **Program Configuration** | ✅ Complete | [`docs/features/programs/README.md`](docs/features/programs/README.md) |
| **Course Management** | ✅ Complete | [`docs/features/courses/README.md`](docs/features/courses/README.md) |
| **Content Management** | ✅ Complete | [`docs/features/courses/CONTENT_MANAGEMENT.md`](docs/features/courses/CONTENT_MANAGEMENT.md) |
| **Form Components** | ✅ Complete | [`docs/features/forms/FORM_COMPONENTS_REFACTOR.md`](docs/features/forms/FORM_COMPONENTS_REFACTOR.md) |
| **Teams Management** | ✅ Complete | [`docs/features/teams/README.md`](docs/features/teams/README.md) |
| **Facility Management** | ✅ Complete | [`docs/features/facilities/README.md`](docs/features/facilities/README.md) |

## Development Commands

### 🚀 **Quick Start**
```bash
# RECOMMENDED: Full Docker development
docker compose up

# Auto-restart development (restarts frontend on changes)
npm run dev:auto:watch

# Multi-app development (all apps)
npm run dev:all

# Manual frontend restart
npm run restart:frontend
```

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

### 🎨 **Layout Architecture**
- **PageHeaderContext**: Global state management for page titles/descriptions
- **usePageTitle Hook**: Easy page header management from feature pages  
- **Global Header**: Left-aligned page titles, right-aligned program context
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

### 🔗 **FEATURE INTEGRATION REQUIREMENTS**
**📖 ALWAYS READ FIRST: [`docs/architecture/FEATURE_INTEGRATION_GUIDE.md`](docs/architecture/FEATURE_INTEGRATION_GUIDE.md)**

Before implementing any feature that interacts with existing systems:
1. **Check Integration Patterns**: Review existing feature relationships and data flows
2. **Follow Established APIs**: Use documented integration points for student credits, user relationships, etc.
3. **Update Integration Guide**: Add your feature's integration points for future developers
4. **Mock Data Compliance**: Ensure mock data demonstrates real integration patterns

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

- **Frontend**: Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy + JWT
- **Development**: Docker Compose + pytest + comprehensive quality tools
- **Currency**: Nigerian Naira (NGN) - All pricing throughout the academy system

## File Organization

### 📁 **Key Directories**
- `/docs/` - Project documentation (setup, architecture, workflows)
- `/specs/` - Feature specifications and requirements  
- `/tools/` - Quality assurance and development tools
- `/backend/app/features/` - Backend feature modules
- `/frontend/src/features/` - Frontend feature modules

### 🏗️ **Frontend Feature Architecture**
```
/frontend/src/features/
├── courses/           # Course management
├── curricula/         # Curriculum design & management
├── content/           # Content library (lessons & assessments)
├── students/          # Student management
├── parents/           # Parent management
├── scheduling/        # Scheduling system
├── organizations/     # Organization management
└── [other features]   # Teams, facilities, payments, etc.
```

Each feature follows consistent structure: `api/`, `components/`, `hooks/`, `types/`, `index.ts`

### 📝 **Documentation Structure**
- **[`docs/README.md`](docs/README.md)** - 📚 **DOCUMENTATION INDEX** (Start here!)
- `docs/setup/PROJECT_SETUP.md` - Setup and daily development  
- `docs/architecture/` - System architecture and program context design
- `docs/api/API_ENDPOINTS.md` - Complete API reference
- `docs/development/` - Development workflow and standards
- `docs/features/` - Feature-specific documentation

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
├── types/              # TypeScript types
└── index.ts            # Feature exports
```

### Layout Architecture
```typescript
// Feature page pattern
export default function FeaturePage() {
  usePageTitle('Page Title', 'Page description for global header');
  
  return (
    <div className="space-y-6">
      {/* Page content with proper component structure */}
    </div>
  );
}
```

## 📱 Multi-App Development Infrastructure

### 🏗️ **Complete Implementation Status**
✅ **Multi-App Architecture**: Unified development environment for 3 applications
- **Admin Dashboard** (Web): Next.js application for academy management
- **Tutor/Coordinator Mobile App**: React Native/Expo app for staff
- **Student/Parent Mobile App**: React Native/Expo app for students and parents

### 🎯 **Quick Start Commands**
```bash
# Multi-app development (all apps)
npm run dev:all

# Mobile apps only
npm run mobile:dev

# Git subtree management
npm run subtree:sync     # Sync shared resources
npm run subtree:push     # Deploy to mobile repositories
```

**📖 For complete multi-app guide, see: [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md)**

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
- **Feature Integration**: Read `docs/architecture/FEATURE_INTEGRATION_GUIDE.md` for cross-feature development patterns
- Feature-specific work: Read `docs/features/[feature-name]/README.md`

**Remember: Documentation is your friend. When in doubt, check the docs first!**

## 🧹 **Project Status & Cleanup**

### ✅ **Current Clean Structure**
- **Main Repository**: `RemmySpicy/academy-admin` (development)
- **Mobile Repositories**: `RemmySpicy/academy-instructors-app`, `RemmySpicy/academy-students-app` (deployment)
- **Shared Resources**: Unified across all applications
- **Documentation**: Consolidated, organized, and up-to-date with proper feature separation
- **System Health**: All 208 API endpoints verified and accessible

### 📊 **System Summary**
- **Total API Endpoints**: 208 registered and accessible
- **Course Assignment System**: 12 endpoints (newly implemented)
- **Student Management**: 19 endpoints (enhanced with two-step workflow)
- **Parent Management**: 5 endpoints (enhanced with assignment operations)
- **System Status**: ✅ All services healthy and deployed

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.