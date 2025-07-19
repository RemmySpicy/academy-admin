# Program Context Architecture

## Overview
The Academy Admin system uses program-centric architecture where programs define data context and access control.

## Core Principles

### ✅ **Route Structure** 
```
/admin/academy/programs/        ← Academy Administration (Super Admin)
/admin/courses/                 ← Program-scoped courses
/admin/students/                ← Program-scoped students
/admin/facilities/              ← Program-scoped facilities
```

**CRITICAL**: Programs are TOP-LEVEL CONTEXT, never nested under other features.

### 🎯 **Role-Based Access Control**

#### **Super Admin** (`super_admin`)
- Access: All programs + Academy Administration
- Landing: `/admin` (main dashboard)
- Capabilities: System-wide management, program creation, user assignments

#### **Program Admin** (`program_admin`) 
- Access: Assigned programs only
- Landing: `/admin` (program dashboard)
- Capabilities: Full management within assigned programs

#### **Program Coordinator** (`program_coordinator`)
- Access: Assigned programs only
- Landing: `/admin/students` (student-focused)
- Capabilities: Student management, curriculum access

#### **Tutor** (`tutor`)
- Access: Assigned programs only
- Landing: `/admin/students` (student interaction)
- Capabilities: Student interaction, view curriculum

### 🔄 **HTTP Header Implementation**
- **X-Program-Context**: Current program ID (auto-injected)
- **X-Bypass-Program-Filter**: Super admin bypass flag

### 🔐 **Security Features**
- Automatic program filtering for all API endpoints
- Cross-program access prevention
- Role-based data isolation
- Program assignment validation

## Development Rules

### **Before Adding New Features**
1. **Is this Academy Administration or Program Management?**
2. **What roles should have access?**
3. **Should data be program-scoped or academy-wide?**
4. **Follow correct route structure?**

### **Mandatory Feature Requirements**
- Models: Include `program_id` foreign key
- Services: Accept `program_context` parameter
- Routes: Use program context dependency injection
- Tests: Include program context filtering tests

## Quality Assurance
- `npm run program-context:lint` - Validate program context compliance
- `npm run security:scan` - Security vulnerability scanning
- `npm run quality:academy` - Comprehensive Academy Admin checks