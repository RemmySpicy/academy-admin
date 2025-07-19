# Academy Admin - Claude AI Instructions

## Project Overview
Academy Management System with program-centric architecture, role-based access control, and comprehensive educational institution management.

**📖 For detailed setup instructions, see: [`docs/setup/PROJECT_SETUP.md`](docs/setup/PROJECT_SETUP.md)**

## Current Status (2025-07-19)

### ✅ **Fully Implemented Features**
- **Database Schema**: PostgreSQL with program-centric design
- **Authentication System**: JWT with 4-role system (Super Admin, Program Admin, Program Coordinator, Tutor)
- **Program Context Architecture**: HTTP header-based filtering with automatic security enforcement
- **Course Management**: Full CRUD with program context integration
- **Facility Management**: Complete facility management system
- **User Management**: Role-based program assignments
- **Quality Assurance**: Automated program context compliance checking
- **🆕 Multi-App Development Infrastructure**: Complete setup for tutor/coordinator and student/parent mobile apps
- **🆕 Shared API Client Library**: Unified TypeScript API client for all applications
- **🆕 Git Subtree Workflow**: Automated workflow for managing multiple app repositories

**📖 For architecture details, see: [`docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md`](docs/architecture/PROGRAM_CONTEXT_ARCHITECTURE.md)**

### 🎯 **Quick Access**
- **Default Users**: Super Admin (`admin@academy.com`/`admin123`), Program Admin (`swim.admin@academy.com`/`swim123`)
- **API Docs**: http://localhost:8000/docs
- **Test Programs**: 5 programs created (Robotics, AI/ML, Web Dev, Sports, Arts)

**📖 For complete API reference, see: [`docs/api/API_ENDPOINTS.md`](docs/api/API_ENDPOINTS.md)**

## Development Commands

### 🚀 **Quick Start**
```bash
# RECOMMENDED: Full Docker development
docker compose up

# Alternative: Local development 
./start-dev.sh

# 🆕 Multi-app development (all apps)
npm run dev:all

# 🆕 Mobile apps only
npm run mobile:dev
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

## Feature Development Rules

### 🚨 **CRITICAL: Program Context Requirements**
Every new feature MUST include:
1. **Models**: `program_id` foreign key field
2. **Services**: `program_context` parameter in all methods
3. **Routes**: Program context dependency injection
4. **Tests**: Program context filtering tests

**📖 For detailed standards, see: [`docs/development/DEVELOPMENT_STANDARDS.md`](docs/development/DEVELOPMENT_STANDARDS.md)**

### 🎯 **Before Creating Features**
Ask: "Is this Academy Administration (managing programs) or Program Management (within program)?"

### 📋 **Task Management**
- Use TodoWrite tool for complex tasks
- Include quality assurance todos
- Mark tasks completed immediately upon completion

## Technology Stack

### Frontend: Next.js 15 + TypeScript + Tailwind + shadcn/ui
### Backend: FastAPI + PostgreSQL + SQLAlchemy + JWT
### Development: Docker Compose + pytest + comprehensive quality tools

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

## 📱 Multi-App Development Infrastructure (NEW)

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
docker-compose up tutor-mobile
docker-compose up student-mobile
```

### 📁 **Directory Structure** (Updated)

```
academy-admin/                    # Main repository
├── apps/                         # 🆕 Multi-app directory
│   ├── README.md                 # App development guide
│   ├── admin-dashboard/          # Existing admin interface
│   ├── tutor-mobile/            # Tutor/coordinator mobile app
│   └── student-mobile/          # Student/parent mobile app
├── shared/                       # 🆕 Shared resources
│   ├── types/                   # TypeScript type definitions
│   ├── api-client/              # Unified API client library
│   └── utils/                   # Common utilities
├── backend/                      # FastAPI backend (shared)
├── frontend/                     # Next.js admin dashboard
├── scripts/                      # 🆕 Automation scripts
│   └── subtree-commands.sh       # Git subtree management
├── git-subtree-workflow.md       # 🆕 Workflow documentation
├── docker-compose.mobile.yml     # 🆕 Mobile development
└── docker-compose.override.yml   # 🆕 Development overrides
```

### 🔄 **Automated Workflows**

#### **Shared Resource Synchronization**
- **Automatic**: Shared code synced during development
- **Manual**: `npm run subtree:sync` to force sync
- **Real-time**: Docker volumes maintain live sync

#### **Repository Deployment**
- **Tutor App**: `npm run subtree:push:tutor`
- **Student App**: `npm run subtree:push:student`  
- **Both Apps**: `npm run subtree:push`

#### **Quality Assurance Integration**
- **Program Context**: All mobile endpoints follow program filtering rules
- **Security**: Role-based access control enforced
- **Testing**: Automated tests for mobile API endpoints

### 📚 **Documentation References**
- **Git Subtree Workflow**: [`git-subtree-workflow.md`](git-subtree-workflow.md)
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
- Feature specifications: Read `docs/features/[feature-name]/README.md`

**Remember: Documentation is your friend. When in doubt, check the docs first!**