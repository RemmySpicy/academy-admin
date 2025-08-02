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
- **🆕 Enhanced (2025-01-29)**: Can create student/parent users within assigned programs

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

## Current Implementation (Updated 2025-07-31)

### **Program-User Relationships**
The system has evolved from direct `program_id` fields to a more flexible assignment-based model:

#### **ProgramAssignment Model**
- **Purpose**: Links users to programs with specific roles
- **Key Fields**: `user_id`, `program_id`, `role_in_program`, `is_active`
- **Benefits**: Supports multiple program memberships and cross-program operations

#### **Course Enrollment Filtering with Facility Assignments**
For models like `Student` and `Parent`:
- **Program Context**: Determined by course enrollments (`CourseEnrollment.program_id`)
- **Facility Context**: Enhanced with facility assignments (`CourseEnrollment.facility_id`)
- **Filtering Method**: JOIN with `CourseEnrollment` table including facility information
- **Query Pattern**: `JOIN CourseEnrollment ON Student.id = CourseEnrollment.user_id WHERE CourseEnrollment.program_id = program_context`

#### **🏢 Multi-Facility Course Assignments (NEW 2025-07-31)**
Enhanced course enrollment system supports facility-specific assignments:
- **Facility Assignment**: Each course enrollment includes specific facility assignment
- **Session Configuration**: Session type, location type, and age group stored per enrollment
- **Multi-Facility Support**: Students can enroll in same course at different facilities
- **Capability-Based Availability**: Different facilities offer different course subsets

#### **Service Layer Implementation**
```python
# Recommended approach: Direct model filtering (Student model has program_id)
if program_context:
    query = query.filter(Student.program_id == program_context)

# Previous approach: Subquery-based filtering (now replaced)
# if program_context:
#     student_ids_subquery = db.query(CourseEnrollment.user_id)\
#                              .filter(CourseEnrollment.program_id == program_context)\
#                              .distinct()\
#                              .subquery()
#     query = query.filter(Student.id.in_(
#         db.query(student_ids_subquery.c.user_id)
#     ))

# Enhanced facility-aware enrollment filtering
def get_student_facility_enrollments(db: Session, student_id: str, program_context: str):
    return db.query(CourseEnrollment)\
             .filter(CourseEnrollment.user_id == student_id)\
             .filter(CourseEnrollment.program_id == program_context)\
             .join(Facility, CourseEnrollment.facility_id == Facility.id)\
             .all()
```

## Development Rules

### **Before Adding New Features**
1. **Is this Academy Administration or Program Management?**
2. **What roles should have access?**
3. **Should data be program-scoped or academy-wide?**
4. **Follow correct route structure?**

### **Mandatory Feature Requirements**
- **Models**: User-program relationships with direct `program_id` fields for students, flexible assignments for other models
- **Services**: Accept `program_context` parameter with appropriate filtering method (direct or enrollment-based)
- **Routes**: Use program context dependency injection
- **Tests**: Include program context filtering tests
- **🆕 Facility Integration**: Support facility-specific operations within program context

## Quality Assurance
- `npm run program-context:lint` - Validate program context compliance
- `npm run security:scan` - Security vulnerability scanning
- `npm run quality:academy` - Comprehensive Academy Admin checks