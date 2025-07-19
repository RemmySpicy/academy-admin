# Course Management Feature

## Overview
Comprehensive course management system with program-centric architecture supporting multi-level educational content organization.

## Current Implementation Status ✅

### **Fully Implemented**
- 7-level course hierarchy (Programs → Courses → Curricula → Modules → Lessons → Content → Assessments)
- Program context filtering for all course operations
- Role-based access control for course management
- RESTful API with automatic program scoping
- Frontend course management interface

### **Architecture**

#### **Database Schema**
```sql
programs (academy-wide)
└── courses (program-scoped)
    └── curricula (program-scoped)
        └── modules (program-scoped)
            └── lessons (program-scoped)
                └── content_versions (program-scoped)
                    └── assessments (program-scoped)
```

#### **API Endpoints** (Program Context Filtered)
- `GET /api/v1/courses/` - List courses for current program
- `POST /api/v1/courses/` - Create course in current program  
- `GET /api/v1/courses/{id}` - Get course (program access validated)
- `PUT /api/v1/courses/{id}` - Update course (program scoped)
- `DELETE /api/v1/courses/{id}` - Delete course (program scoped)

All endpoints automatically filter by program context via `X-Program-Context` header.

#### **Role-Based Access**
- **Super Admin**: Full access across all programs + academy administration
- **Program Admin**: Full course management within assigned programs
- **Program Coordinator**: Read/limited edit access within assigned programs  
- **Tutor**: Read-only access within assigned programs

### **Frontend Implementation**

#### **Components**
- **Course Management**: `/admin/courses/` - Main course interface
- **Course Cards**: Visual course representation with program context
- **Course Forms**: Create/edit forms with program context validation
- **Navigation**: Program-aware breadcrumbs and navigation

#### **Features**
- Program context-aware course listing
- Automatic program filtering in UI
- Role-based component rendering
- Real-time program context switching

### **Backend Implementation**

#### **Service Layer** (`backend/app/features/courses/services/`)
- `course_service.py` - Core course management with program context
- `curriculum_service.py` - Course hierarchy management
- `lesson_service.py` - Lesson content management
- `module_service.py` - Module organization
- Program context filtering in all service methods

#### **Models** (`backend/app/features/courses/models/`)
- All models include `program_id` foreign key for context scoping
- Proper relationships and constraints
- UUID primary keys for security

#### **Routes** (`backend/app/features/courses/routes/`)
- Program context dependency injection on all endpoints
- Role-based access decorators
- Automatic program filtering middleware

### **Security Features**
- Program context validation on all course operations
- Cross-program data access prevention
- Role-based endpoint restrictions
- Automatic program scoping for data queries

### **Quality Assurance**
- Comprehensive test suite with program context scenarios
- Role-based access control testing
- Cross-program access prevention validation
- Multi-role course management testing

## Usage Examples

### **Creating a Course (Program Admin)**
```typescript
// Frontend automatically includes program context
const newCourse = await courseApi.createCourse({
  name: "Advanced Swimming Techniques",
  description: "Professional swimming instruction",
  level: 3
});
// Backend automatically scopes to current program
```

### **Listing Courses by Role**
```typescript
// Program Admin sees all courses in their assigned programs
// Tutor sees read-only view of same courses
// Super Admin can bypass program filtering
const courses = await courseApi.getCourses();
```

### **Program Context Switching**
```typescript
// Safe program switching with unsaved changes protection
await programContextStore.switchProgram('new-program-id');
// All course data automatically refreshes for new context
```

## Development Guidelines

### **Adding New Course Features**
1. **Models**: Include `program_id` foreign key
2. **Services**: Accept `program_context` parameter
3. **Routes**: Use program context dependency injection
4. **Frontend**: Use program context store for state management
5. **Tests**: Include program context filtering tests

### **Program Context Requirements**
- All course data must be program-scoped
- Cross-program access only for Super Admin with explicit bypass
- Role-based access validation required
- Program context injection in all API calls

### **Testing Requirements**
- Role-based access control tests
- Program context filtering validation
- Cross-program access prevention tests
- Multi-program course management scenarios

## Future Enhancements
- Advanced assessment builder
- Course versioning system
- Content library with reusable components
- Analytics and progress tracking
- Bulk course operations
- Export/import course functionality