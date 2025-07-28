# Student/Parent Course Assignment System - Comprehensive Requirements

## 📋 **Executive Summary**

This document outlines the complete requirements for implementing a two-step student/parent creation and course assignment system. The new system separates profile creation from course assignment, enabling flexible program membership management and cross-program user assignment capabilities.

## ✅ **Implementation Status (2025-01-28)**

**🎉 IMPLEMENTATION COMPLETED** - All phases have been successfully implemented:

- ✅ **Phase 1**: Requirements analysis and design
- ✅ **Phase 2**: Database layer with ProgramAssignment model and enhanced CourseEnrollment
- ✅ **Phase 3**: Service layer with CourseAssignmentService and UserSearchService
- ✅ **Phase 4**: API layer with comprehensive endpoints for two-step workflow
- ✅ **Phase 5**: Documentation and testing preparation

**Key Components Implemented:**
- **New Models**: `ProgramAssignment`, enhanced `CourseEnrollment`, updated `Student`/`Parent` models
- **Services**: `CourseAssignmentService`, `UserSearchService`, updated `StudentService`/`ParentService`
- **API Endpoints**: 25+ new endpoints for course assignments and user search
- **Migration**: Complete database migration with data preservation
- **Documentation**: Comprehensive API documentation

**📖 API Documentation**: [`docs/api/COURSE_ASSIGNMENT_API.md`](../../api/COURSE_ASSIGNMENT_API.md)

## 🎯 **Core Requirements**

### **Students Tab Requirements**

#### **Current Workflow (To Be Changed)**
```
Create Student → User + Student Profile → Automatic Program Assignment → Visible in Students List
```

#### **New Required Workflow**
```
Step 1: Create Student → User + Student Profile (No Program Assignment)
Step 2: Assign to Course → Course Enrollment → Visible in Students List
Alternative: Search Existing User → Assign to Course → Visible in Students List
```

**Key Features Needed:**
1. **Profile Creation**: Create user + student profile without automatic program assignment
2. **Course Assignment**: Assign students to specific courses within program context
3. **Search & Assign**: Search all users system-wide and assign them to courses
4. **Program Visibility**: Students appear in program's student list only after course assignment
5. **Multiple Course Support**: Students can be assigned to multiple courses within same program
6. **Assignment Metadata**: Track enrollment date, status, credits, progress per course assignment

### **Parents Tab Requirements**

#### **Current Workflow (To Be Changed)**
```
Create Parent → User + Parent Profile → Automatic Program Assignment → Visible in Parents List
```

#### **New Required Workflow**
```
Step 1: Create Parent → User + Parent Profile (No Program Assignment)
Step 2: Assign Children to Courses → Children Course Enrollment → Parent Visible in Parents List
Alternative: Search Existing Parent → Assign Children to Courses → Parent Visible in Parents List
```

**Key Features Needed:**
1. **Profile Creation**: Create user + parent profile without automatic program assignment
2. **Child Course Assignment**: Assign parent's children to courses (creates child profiles if needed)
3. **Parent as Student**: Support parents who are also students (dual roles)
4. **Search & Assign**: Search all parents system-wide and assign their children to courses
5. **Family Visibility**: Parents appear in program's parent list when children are enrolled
6. **Child Profile Creation**: Create child student profiles on-the-fly during assignment process

## 🏗️ **Technical Architecture Requirements**

### **Database Schema Changes**

#### **1. New ProgramAssignment Model**
```python
class ProgramAssignment(BaseModel):
    __tablename__ = "program_assignments"
    
    user_id: str                    # FK to users.id
    program_id: str                 # FK to programs.id  
    assignment_date: date           # When user was assigned to program
    assigned_by: str               # FK to users.id (who made the assignment)
    role_in_program: str           # 'student', 'parent', 'both'
    is_active: bool                # Assignment status
    assignment_notes: str          # Optional notes about assignment
```

#### **2. Enhanced CourseEnrollment Model**
**Existing fields to keep:**
- user_id, student_id, course_id, program_id
- enrollment_date, start_date, completion_date
- status, progress_percentage
- enrollment_fee, amount_paid, outstanding_balance

**New fields to add:**
```python
assignment_date: date              # When assigned (different from enrollment_date)
assignment_type: str               # 'direct', 'parent_assigned', 'bulk_assigned'
credits_awarded: int               # Credits for this course
assignment_notes: str              # Notes about the assignment
assigned_by: str                   # FK to users.id (who made the assignment)
```

#### **3. Student Model Changes**
**Remove:** `program_id` field (breaking change)
**Add:** Dynamic program membership via relationships
```python
# New relationships
program_assignments = relationship("ProgramAssignment", foreign_keys="ProgramAssignment.user_id")
course_enrollments = relationship("CourseEnrollment", foreign_keys="CourseEnrollment.user_id")

# New properties
@property
def assigned_programs(self) -> List[str]:
    return [pa.program_id for pa in self.program_assignments if pa.is_active]

@property  
def enrolled_courses(self) -> List[CourseEnrollment]:
    return [ce for ce in self.course_enrollments if ce.status == 'ACTIVE']
```

#### **4. Parent Model Changes**
**Remove:** `program_id` field (breaking change)
**Add:** Dynamic program membership via children's enrollments
```python
# New properties
@property
def programs_via_children(self) -> List[str]:
    # Get programs where children are enrolled
    child_programs = set()
    for child in self.children:
        child_programs.update(child.assigned_programs)
    return list(child_programs)

@property
def is_visible_in_program(self, program_id: str) -> bool:
    # Parent is visible if they have children enrolled in program OR are students themselves
    return (program_id in self.programs_via_children or 
            program_id in self.assigned_programs)
```

### **Service Layer Architecture**

#### **1. CourseAssignmentService**
```python
class CourseAssignmentService:
    def assign_user_to_course(self, user_id: str, course_id: str, assignment_details: Dict) -> CourseEnrollment
    def assign_multiple_users_to_course(self, user_ids: List[str], course_id: str) -> List[CourseEnrollment]  
    def assign_user_to_multiple_courses(self, user_id: str, course_ids: List[str]) -> List[CourseEnrollment]
    def bulk_assign_users_to_courses(self, assignments: List[Dict]) -> BulkAssignmentResult
    def remove_course_assignment(self, user_id: str, course_id: str) -> bool
    def get_user_course_assignments(self, user_id: str, program_id: str) -> List[CourseEnrollment]
    def get_assignable_courses(self, program_id: str) -> List[Course]
    def check_assignment_eligibility(self, user_id: str, course_id: str) -> AssignmentEligibility
    def calculate_assignment_fee(self, user_id: str, course_id: str) -> Decimal
```

#### **2. UserSearchService**
```python
class UserSearchService:
    def search_all_users(self, search_params: UserSearchParams) -> UserSearchResult
    def search_assignable_students(self, program_id: str, search_query: str) -> List[User]
    def search_assignable_parents(self, program_id: str, search_query: str) -> List[User]
    def get_user_program_status(self, user_id: str) -> UserProgramStatus
    def filter_users_by_role_eligibility(self, users: List[User], target_role: str) -> List[User]
    def check_cross_program_permissions(self, assigner_id: str, target_user_id: str) -> bool
```

#### **3. Enhanced StudentService**
```python
class StudentService:
    def create_student_profile_only(self, student_data: StudentCreate, created_by: str) -> Student
    def assign_student_to_program(self, student_id: str, program_id: str, assigned_by: str) -> ProgramAssignment
    def enroll_student_in_course(self, student_id: str, course_id: str, enrollment_details: Dict) -> CourseEnrollment
    def get_students_in_program(self, program_id: str) -> List[Student]  # Based on course enrollments
    def create_student_and_assign_to_course(self, student_data: StudentCreate, course_id: str) -> Dict
```

#### **4. Enhanced ParentService**  
```python
class ParentService:
    def create_parent_profile_only(self, parent_data: ParentCreate, created_by: str) -> Parent
    def assign_parent_to_program(self, parent_id: str, program_id: str, assigned_by: str) -> ProgramAssignment
    def assign_children_to_courses(self, parent_id: str, child_course_assignments: List[Dict]) -> List[CourseEnrollment]
    def create_child_and_assign_to_course(self, parent_id: str, child_data: StudentCreate, course_id: str) -> Dict
    def get_parents_in_program(self, program_id: str) -> List[Parent]  # Based on children's enrollments
    def handle_parent_as_student(self, parent_id: str, course_id: str) -> CourseEnrollment
```

### **API Endpoint Architecture**

#### **1. Student Management Endpoints**
```
POST   /api/v1/students/                           # Create student profile only
POST   /api/v1/students/assign-to-course          # Assign student to course
POST   /api/v1/students/bulk-assign               # Bulk assign students to courses
GET    /api/v1/students/search-assignable         # Search users for student assignment
GET    /api/v1/students/                          # List students (enrolled in program courses)
GET    /api/v1/students/{id}/assignments          # Get student's course assignments
DELETE /api/v1/students/{id}/assignments/{course_id} # Remove course assignment
```

#### **2. Parent Management Endpoints**
```
POST   /api/v1/parents/                           # Create parent profile only  
POST   /api/v1/parents/assign-children-to-courses # Assign parent's children to courses
POST   /api/v1/parents/create-child-and-assign    # Create child + assign to course
GET    /api/v1/parents/search-assignable          # Search users for parent assignment
GET    /api/v1/parents/                          # List parents (with children in program)
GET    /api/v1/parents/{id}/children-assignments  # Get parent's children assignments
```

#### **3. Course Assignment Endpoints**
```
POST   /api/v1/course-assignments/assign          # General assignment endpoint
GET    /api/v1/course-assignments/assignable-courses # Available courses for assignment
GET    /api/v1/course-assignments/assignable-users   # Available users for assignment
PUT    /api/v1/course-assignments/{id}            # Update assignment details
DELETE /api/v1/course-assignments/{id}            # Remove assignment
GET    /api/v1/course-assignments/bulk-template   # Get template for bulk assignments
POST   /api/v1/course-assignments/bulk-assign     # Bulk assignment operation
```

## 📊 **Data Migration Requirements**

### **Migration Strategy**

#### **Phase 1: Schema Preparation**
1. Create new ProgramAssignment table
2. Add new fields to CourseEnrollment table
3. Create temporary columns in Student/Parent tables for migration tracking

#### **Phase 2: Data Migration**
```sql
-- Step 1: Create ProgramAssignment records for existing students
INSERT INTO program_assignments (user_id, program_id, assignment_date, assigned_by, role_in_program)
SELECT s.user_id, s.program_id, s.enrollment_date, s.created_by, 'student'
FROM students s WHERE s.program_id IS NOT NULL AND s.user_id IS NOT NULL;

-- Step 2: Create CourseEnrollment records for existing students
INSERT INTO course_enrollments (user_id, student_id, course_id, program_id, enrollment_date, assignment_date, status, assigned_by)
SELECT s.user_id, s.id, 'default-course-for-migration', s.program_id, s.enrollment_date, s.enrollment_date, 'ASSIGNED', s.created_by
FROM students s WHERE s.program_id IS NOT NULL;

-- Step 3: Handle parents with program_id
INSERT INTO program_assignments (user_id, program_id, assignment_date, assigned_by, role_in_program)  
SELECT p.user_id, p.program_id, p.created_at, p.created_by, 'parent'
FROM parents p WHERE p.program_id IS NOT NULL AND p.user_id IS NOT NULL;

-- Step 4: Create parent-child course assignments
-- This requires complex logic to assign children to appropriate courses
```

#### **Phase 3: Schema Cleanup**
1. Remove program_id columns from students and parents tables
2. Update all queries to use assignment-based filtering
3. Remove temporary migration tracking columns

### **Rollback Strategy**
```sql
-- Emergency rollback: Add program_id back to students/parents
ALTER TABLE students ADD COLUMN program_id VARCHAR(36);
ALTER TABLE parents ADD COLUMN program_id VARCHAR(36);

-- Populate from assignments
UPDATE students s SET program_id = (
    SELECT pa.program_id FROM program_assignments pa 
    WHERE pa.user_id = s.user_id AND pa.role_in_program IN ('student', 'both')
    LIMIT 1
);
```

## 🔐 **Security & Permission Requirements**

### **Permission Matrix**
```
Role                | Create Profiles | Assign to Courses | Search All Users | Cross-Program Assignment
--------------------|-----------------|-------------------|------------------|------------------------
Super Admin         | ✅ All         | ✅ All           | ✅ All          | ✅ All Programs
Program Admin       | ✅ In Program  | ✅ In Program    | ✅ All          | ✅ To Own Program
Program Coordinator | ✅ In Program  | ✅ In Program    | ✅ All          | ❌ No
Instructor          | ❌ No          | ❌ No            | ✅ View Only    | ❌ No
```

### **Program Context Security**
- **Students List**: Show only users with active CourseEnrollment in program
- **Parents List**: Show only users with children enrolled in program courses OR self-enrolled
- **Cross-Program Search**: Show all users with program status indicators
- **Assignment Validation**: Verify assigner has permission to assign users to their program

## 🎨 **Frontend Integration Requirements**

### **Students Tab UI Changes**
```
[Create Student Profile] [Assign Existing User to Course]

After Profile Creation:
┌─────────────────────────────────────┐
│ Student Created Successfully!        │
│ ┌─────────────────────────────────┐ │
│ │ Assign to Course (Optional)     │ │ 
│ │ [Select Course ▼] [Assign]      │ │
│ └─────────────────────────────────┘ │
│ [Skip Course Assignment] [Continue] │
└─────────────────────────────────────┘

Assign Existing User:
┌─────────────────────────────────────┐
│ Search Users                        │
│ [Search Box with filters]           │
│ Results:                           │
│ ☐ John Doe (Programs: Swimming)    │
│ ☐ Jane Smith (No programs)         │
│ [Bulk Select] [Assign to Course]   │
└─────────────────────────────────────┘
```

### **Parents Tab UI Changes**
```
[Create Parent Profile] [Assign Existing Parent]

After Parent Creation:
┌─────────────────────────────────────┐
│ Parent Created Successfully!         │
│ ┌─────────────────────────────────┐ │
│ │ Manage Children & Course        │ │
│ │ Assignment                      │ │
│ │                                │ │
│ │ [Create New Child] [Link       │ │
│ │  Existing Child]               │ │  
│ │                                │ │
│ │ For each child:                │ │
│ │ Child Name: [Input]            │ │
│ │ Assign to Course: [Select ▼]   │ │
│ │ [Add Another Child]            │ │
│ └─────────────────────────────────┘ │
│ [Skip Assignment] [Save & Assign]   │
└─────────────────────────────────────┘
```

## 🧪 **Testing Requirements**

### **Unit Tests Required**
1. **CourseAssignmentService Tests**
   - Single user to single course assignment
   - Bulk assignment operations
   - Assignment eligibility validation
   - Fee calculation logic
   - Assignment removal

2. **UserSearchService Tests**
   - Cross-program user search
   - Role-based filtering
   - Permission validation
   - Program status indicators

3. **Migration Tests**
   - Data integrity during migration
   - Rollback functionality
   - Performance with large datasets

### **Integration Tests Required**
1. **End-to-End Workflows**
   - Student creation → course assignment → program visibility
   - Parent creation → child assignment → family visibility
   - Cross-program user assignment workflows

2. **Security Tests**
   - Permission boundary enforcement
   - Cross-program assignment restrictions
   - Program context filtering validation

### **Performance Tests Required**
1. **Query Performance**
   - Students list with assignment-based filtering
   - Parents list with children enrollment filtering  
   - Cross-program user search with large datasets

2. **Bulk Operations**
   - Bulk user assignment performance
   - Migration performance with realistic data volumes

## 📋 **Acceptance Criteria**

### **Students Tab Success Criteria**
- ✅ Can create student profile without automatic program assignment
- ✅ Can assign created student to multiple courses within program
- ✅ Can search all users and assign them to courses
- ✅ Students appear in program list only after course assignment
- ✅ Assignment metadata is properly tracked and displayed

### **Parents Tab Success Criteria** 
- ✅ Can create parent profile without automatic program assignment
- ✅ Can create children and assign them to courses during parent creation
- ✅ Can assign existing children to courses
- ✅ Parents appear in program list when children are enrolled
- ✅ Support for parents who are also students (dual roles)

### **System Integration Success Criteria**
- ✅ Existing parent management system continues to work
- ✅ Program context filtering works with new assignment system
- ✅ Data migration completes without data loss
- ✅ Performance meets current system standards
- ✅ All security requirements are enforced

## 🎯 **Implementation Priority**

### **High Priority (Must Have)**
1. Database schema changes and migration
2. CourseAssignmentService with basic assignment functionality
3. Updated StudentService/ParentService for new workflows
4. Core API endpoints for student/parent creation and assignment
5. Program context filtering updates

### **Medium Priority (Should Have)**
1. Advanced search functionality with cross-program capabilities
2. Bulk assignment operations
3. Comprehensive assignment metadata tracking
4. Parent as student dual role handling
5. Advanced permission matrix implementation

### **Low Priority (Nice to Have)**
1. Advanced reporting on assignments
2. Assignment history and audit trails
3. Automated assignment recommendations
4. Integration with external systems
5. Advanced bulk operations with CSV import/export

---

**Document Version**: 1.0  
**Last Updated**: January 28, 2025  
**Review Status**: Approved for Implementation