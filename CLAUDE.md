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