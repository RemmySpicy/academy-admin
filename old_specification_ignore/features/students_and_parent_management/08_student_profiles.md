# Student Profiles - Technical Specification

## Overview & Business Requirements

### Problem Statement
The academy needs a comprehensive student management system that tracks individual student information, progression, attendance, and relationships while supporting multi-facility operations and program assignments. The system must handle detailed student profiles with medical information, emergency contacts, and academic progression tracking.

### User Stories
- **As a Super Admin**, I want to manage all students across all programs and facilities
- **As a Program Admin**, I want to manage students enrolled in my assigned programs
- **As any admin user**, I want to view comprehensive student profiles with all relevant information in one place
- **As any admin user**, I want to track student progression through curriculum levels with detailed assessments
- **As any admin user**, I want to manage student enrollments and facility assignments efficiently
- **As any admin user**, I want to search and filter students by various criteria for operational efficiency

### Business Rules
- **Unique Student Identity**: Each student has a unique profile across the entire academy system
- **Parent Relationship**: Each student must be linked to exactly one parent/guardian account
- **Multi-Program Enrollment**: Students can be enrolled in multiple programs simultaneously
- **Facility Assignment**: Students are assigned to specific facilities based on their enrollments
- **Age-Based Curriculum**: Student age determines appropriate curriculum assignments
- **Medical Information**: Secure storage and access to medical conditions and emergency contacts
- **Progress Tracking**: Detailed tracking of student advancement through curriculum levels

## Technical Architecture

### Database Schema Requirements

#### students table
```sql
-- Core student profile entity
students:
  id: UUID (Primary Key)
  student_number: VARCHAR(20) UNIQUE NOT NULL  -- Academy-generated student ID
  parent_id: UUID (Foreign Key → parents.id) NOT NULL
  
  -- Personal Information
  salutation: VARCHAR(10)  -- Master, Miss, etc.
  first_name: VARCHAR(100) NOT NULL
  last_name: VARCHAR(100) NOT NULL
  preferred_name: VARCHAR(100)  -- Nickname or preferred name
  email: VARCHAR(255)  -- Optional for younger students
  phone: VARCHAR(50)   -- Optional for younger students
  date_of_birth: DATE NOT NULL
  gender: ENUM('male', 'female', 'other', 'prefer_not_to_say')
  
  -- Address Information (can inherit from parent)
  address: JSONB  -- {country, state, city, full_address, postal_code}
  address_same_as_parent: BOOLEAN DEFAULT TRUE
  
  -- Medical and Safety Information
  medical_conditions: TEXT  -- Allergies, conditions, medications
  dietary_restrictions: TEXT  -- Food allergies, dietary preferences
  emergency_contact: JSONB  -- {name, relationship, phone, email}
  doctor_contact: JSONB  -- {name, clinic, phone, emergency_instructions}
  
  -- Academy Information
  referral_source: VARCHAR(100)  -- How they found the academy
  enrollment_date: DATE NOT NULL  -- First enrollment at academy
  primary_facility_id: UUID (Foreign Key → facilities.id)
  
  -- App Access (Future)
  app_access_enabled: BOOLEAN DEFAULT FALSE
  password_hash: VARCHAR(255)  -- For future student app access
  
  -- Profile Photo
  profile_photo_url: VARCHAR(500)
  
  -- Administrative Notes
  notes: TEXT  -- General notes about the student
  special_instructions: TEXT  -- Important instructions for instructors
  
  -- Status and Tracking
  is_active: BOOLEAN DEFAULT TRUE
  graduation_date: DATE  -- When student completed all programs
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### student_medical_history table
```sql
-- Detailed medical history tracking
student_medical_history:
  id: UUID (Primary Key)
  student_id: UUID (Foreign Key → students.id)
  condition_type: ENUM('allergy', 'medical_condition', 'medication', 'injury', 'other')
  condition_name: VARCHAR(255) NOT NULL
  description: TEXT
  severity: ENUM('low', 'medium', 'high', 'critical')
  treatment_required: TEXT
  doctor_notes: TEXT
  effective_date: DATE NOT NULL
  expiry_date: DATE  -- For temporary conditions
  reported_by: UUID (Foreign Key → users.id)
  verified_by_parent: BOOLEAN DEFAULT FALSE
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### student_emergency_contacts table
```sql
-- Multiple emergency contacts per student
student_emergency_contacts:
  id: UUID (Primary Key)
  student_id: UUID (Foreign Key → students.id)
  contact_name: VARCHAR(255) NOT NULL
  relationship: VARCHAR(100) NOT NULL  -- Father, Mother, Guardian, etc.
  phone_primary: VARCHAR(50) NOT NULL
  phone_secondary: VARCHAR(50)
  email: VARCHAR(255)
  address: JSONB
  priority_order: INTEGER NOT NULL  -- Contact order priority
  authorized_pickup: BOOLEAN DEFAULT FALSE  -- Can pick up student
  medical_authority: BOOLEAN DEFAULT FALSE  -- Can make medical decisions
  notes: TEXT
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### student_documents table
```sql
-- Document storage for students
student_documents:
  id: UUID (Primary Key)
  student_id: UUID (Foreign Key → students.id)
  document_type: ENUM('medical_certificate', 'registration_form', 'photo_consent', 
                     'insurance_card', 'identification', 'other')
  document_name: VARCHAR(255) NOT NULL
  file_path: VARCHAR(500) NOT NULL
  file_size: INTEGER
  mime_type: VARCHAR(100)
  uploaded_by: UUID (Foreign Key → users.id)
  expiry_date: DATE  -- For documents that expire
  is_verified: BOOLEAN DEFAULT FALSE
  verification_notes: TEXT
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

### API Endpoints Specification

#### Student Management Endpoints

**GET /api/v1/students**
- **Purpose**: List students with filtering and pagination
- **Authorization**: Role-based access with program/facility filtering
- **Query Parameters**:
  - `facility_id`: UUID (optional) - filter by facility
  - `program_id`: UUID (optional) - filter by enrolled program
  - `parent_id`: UUID (optional) - filter by parent
  - `age_min`: integer (optional) - minimum age filter
  - `age_max`: integer (optional) - maximum age filter
  - `enrollment_status`: enum (optional) - active, completed, withdrawn
  - `search`: string (optional) - search by name, email, student number
  - `sort_by`: enum (optional) - name, age, enrollment_date, last_activity
  - `sort_order`: enum (default: asc) - asc, desc
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20, max: 100)
- **Response**: Paginated student list with summary information

**POST /api/v1/students**
- **Purpose**: Create new student profile
- **Authorization**: Super Admin or Program Admin with facility access
- **Request Body**: Complete student information including personal, medical, and emergency contact details
- **Validation**: Age validation, parent relationship verification, required field validation
- **Business Logic**: Auto-generate student number, validate parent-child relationship

**GET /api/v1/students/{student_id}**
- **Purpose**: Get complete student profile
- **Authorization**: Access check based on program/facility assignments
- **Response**: Full student details with related data (enrollments, progress, medical info)

**PUT /api/v1/students/{student_id}**
- **Purpose**: Update student information
- **Authorization**: Super Admin or Program Admin with student access
- **Request Body**: Updated student fields
- **Validation**: Maintain data integrity, validate changes don't break existing enrollments

**DELETE /api/v1/students/{student_id}**
- **Purpose**: Soft delete student (deactivate)
- **Authorization**: Super Admin only
- **Validation**: Check for active enrollments, handle cascading effects

#### Student Medical Information Endpoints

**GET /api/v1/students/{student_id}/medical**
- **Purpose**: Get student medical information and history
- **Authorization**: Medical information access permission
- **Response**: Complete medical profile with active conditions and history

**POST /api/v1/students/{student_id}/medical**
- **Purpose**: Add medical condition or update medical information
- **Authorization**: Medical information write permission
- **Request Body**: Medical condition details with severity and treatment information
- **Validation**: Medical information format validation, severity assessment

**PUT /api/v1/students/{student_id}/medical/{condition_id}**
- **Purpose**: Update existing medical condition
- **Authorization**: Medical information write permission
- **Request Body**: Updated medical condition details

**DELETE /api/v1/students/{student_id}/medical/{condition_id}**
- **Purpose**: Deactivate medical condition (set is_active = false)
- **Authorization**: Medical information write permission
- **Validation**: Confirm deactivation doesn't remove critical medical information

#### Student Emergency Contacts Endpoints

**GET /api/v1/students/{student_id}/emergency-contacts**
- **Purpose**: List student emergency contacts in priority order
- **Authorization**: Student access permission
- **Response**: Emergency contacts with authorization levels and contact preferences

**POST /api/v1/students/{student_id}/emergency-contacts**
- **Purpose**: Add new emergency contact
- **Authorization**: Student write permission
- **Request Body**: Emergency contact details with authorization levels
- **Validation**: Contact information validation, priority order management

**PUT /api/v1/students/{student_id}/emergency-contacts/{contact_id}**
- **Purpose**: Update emergency contact information
- **Authorization**: Student write permission
- **Request Body**: Updated contact details

**DELETE /api/v1/students/{student_id}/emergency-contacts/{contact_id}**
- **Purpose**: Remove emergency contact
- **Authorization**: Student write permission
- **Validation**: Ensure at least one emergency contact remains

#### Student Documents Endpoints

**GET /api/v1/students/{student_id}/documents**
- **Purpose**: List student documents
- **Authorization**: Student access permission
- **Query Parameters**: document_type, is_verified, expiry_status
- **Response**: Document list with metadata and verification status

**POST /api/v1/students/{student_id}/documents**
- **Purpose**: Upload new document for student
- **Authorization**: Student write permission
- **Request Body**: Multipart form with file and metadata
- **Validation**: File type validation, size limits, virus scanning

**GET /api/v1/students/{student_id}/documents/{document_id}/download**
- **Purpose**: Download student document
- **Authorization**: Document access permission
- **Response**: File stream with appropriate headers

**DELETE /api/v1/students/{student_id}/documents/{document_id}**
- **Purpose**: Remove student document
- **Authorization**: Document write permission
- **Validation**: Confirm document removal doesn't violate requirements

#### Student Search and Analytics Endpoints

**GET /api/v1/students/search**
- **Purpose**: Advanced student search with multiple criteria
- **Authorization**: Student access permission
- **Query Parameters**: Complex search criteria including name, age range, programs, facilities, enrollment status
- **Response**: Filtered student results with relevance scoring

**GET /api/v1/students/analytics**
- **Purpose**: Student analytics and statistics
- **Authorization**: Analytics access permission
- **Query Parameters**: date_range, facility_id, program_id, group_by
- **Response**: Student statistics including enrollment trends, age distribution, program participation

**GET /api/v1/students/{student_id}/timeline**
- **Purpose**: Student activity timeline
- **Authorization**: Student access permission
- **Response**: Chronological view of student activities, enrollments, assessments, transfers

## Backend Implementation Details

### Student Number Generation
```pseudocode
// Auto-generate unique student numbers
FUNCTION generate_student_number():
    year = current_year()
    facility_code = get_primary_facility_code()
    
    // Find next sequential number for this year
    last_number = get_last_student_number_for_year(year)
    next_sequence = extract_sequence(last_number) + 1
    
    // Format: YYYY-FAC-0001
    student_number = f"{year}-{facility_code}-{next_sequence:04d}"
    
    // Ensure uniqueness
    while student_number_exists(student_number):
        next_sequence += 1
        student_number = f"{year}-{facility_code}-{next_sequence:04d}"
    
    return student_number
```

### Student Age Calculation and Validation
```pseudocode
// Calculate student age and validate for programs
FUNCTION calculate_student_age(date_of_birth, reference_date = today()):
    age_years = (reference_date - date_of_birth).years
    age_months = (reference_date - date_of_birth).months
    
    return {
        years: age_years,
        months: age_months,
        total_months: (age_years * 12) + age_months
    }

FUNCTION validate_age_for_curriculum(student_age, curriculum):
    if student_age.years < curriculum.min_age:
        raise AgeValidationError(f"Student too young for curriculum")
    
    if student_age.years > curriculum.max_age:
        raise AgeValidationError(f"Student too old for curriculum")
    
    return True
```

### Medical Information Security
```pseudocode
// Secure medical information access
FUNCTION get_student_medical_info(student_id, requesting_user):
    // Verify permission to access medical information
    if not has_medical_access_permission(requesting_user, student_id):
        raise PermissionDeniedError("No medical information access")
    
    // Log medical information access for audit
    log_medical_access({
        student_id: student_id,
        accessed_by: requesting_user.id,
        access_time: current_timestamp(),
        access_type: "medical_information_view"
    })
    
    return get_medical_conditions(student_id, active_only=True)

// Medical information update validation
FUNCTION update_medical_condition(student_id, condition_data, updating_user):
    validate_medical_condition_format(condition_data)
    
    // Require verification for critical conditions
    if condition_data.severity == "critical":
        condition_data.requires_verification = True
        send_medical_verification_notification(student_id, condition_data)
    
    return save_medical_condition(student_id, condition_data, updating_user)
```

### Student Search Implementation
```pseudocode
// Advanced student search with relevance scoring
FUNCTION search_students(search_criteria, user_access):
    base_query = build_student_base_query()
    
    // Apply access filtering
    base_query = apply_access_filters(base_query, user_access)
    
    // Apply search filters
    if search_criteria.name_search:
        base_query = add_name_search(base_query, search_criteria.name_search)
    
    if search_criteria.age_range:
        base_query = add_age_filter(base_query, search_criteria.age_range)
    
    if search_criteria.program_ids:
        base_query = add_program_filter(base_query, search_criteria.program_ids)
    
    if search_criteria.facility_ids:
        base_query = add_facility_filter(base_query, search_criteria.facility_ids)
    
    // Apply relevance scoring
    base_query = add_relevance_scoring(base_query, search_criteria)
    
    // Execute with pagination
    return execute_paginated_query(base_query, search_criteria.pagination)
```

## Frontend Implementation Details

### Student State Management (Zustand)
```pseudocode
// Student management store
StudentStore = {
    students: Student[],
    currentStudent: Student | null,
    studentDetails: StudentDetails | null,
    searchFilters: SearchFilters,
    pagination: PaginationState,
    isLoading: boolean,
    
    // Actions
    loadStudents: (filters, pagination) => Promise<void>,
    searchStudents: (searchTerm) => Promise<Student[]>,
    getStudent: (studentId) => Promise<Student>,
    createStudent: (studentData) => Promise<Student>,
    updateStudent: (studentId, updates) => Promise<Student>,
    deleteStudent: (studentId) => Promise<void>,
    
    // Medical information
    getMedicalInfo: (studentId) => Promise<MedicalInfo>,
    updateMedicalInfo: (studentId, medicalData) => Promise<void>,
    
    // Emergency contacts
    getEmergencyContacts: (studentId) => Promise<EmergencyContact[]>,
    updateEmergencyContacts: (studentId, contacts) => Promise<void>,
    
    // Documents
    getDocuments: (studentId) => Promise<Document[]>,
    uploadDocument: (studentId, file, metadata) => Promise<Document>
}
```

### Student Profile Component Structure
```pseudocode
// Main student profile component
StudentProfile = {
    component_structure: {
        header: "Student name, photo, student number, status",
        navigation_tabs: "Profile, Progress, Attendance, Transactions, Schedule",
        content_area: "Tab-specific content with edit capabilities"
    },
    
    tab_content: {
        profile: "Personal info, contact details, medical information",
        progress: "Curriculum progression, assessment scores, achievements",
        attendance: "Session attendance history with patterns",
        transactions: "Payment history, session credits, financial status",
        schedule: "Current and upcoming sessions, schedule changes"
    }
}

// Student profile form component
StudentProfileForm = {
    form_sections: {
        personal_information: "Name, age, contact details",
        address_information: "Student address with parent inheritance option",
        medical_information: "Medical conditions, allergies, medications",
        emergency_contacts: "Multiple contacts with priority and authorization",
        academy_information: "Referral source, notes, special instructions"
    },
    
    validation_rules: {
        required_fields: "Name, date of birth, parent relationship",
        age_validation: "Age appropriate for selected programs",
        contact_validation: "At least one emergency contact required",
        medical_validation: "Medical condition format and severity"
    }
}
```

### Student List and Search Interface
```pseudocode
// Student list with advanced filtering
StudentList = {
    features: {
        data_table: "Sortable columns with student info",
        search_bar: "Real-time search with autocomplete",
        filter_panel: "Age, program, facility, status filters",
        bulk_actions: "Multi-select operations",
        export_options: "Export filtered student data"
    },
    
    table_columns: {
        student_info: "Photo, name, student number",
        contact_info: "Age, parent name, phone",
        academy_info: "Programs, facility, enrollment date",
        status_info: "Active enrollments, recent activity",
        actions: "View, edit, transfer, deactivate"
    }
}
```

## UI/UX Requirements

### Student Profile Interface (shadcn/ui)
- **Profile Header**: Student photo, name, student number, age, status badges
- **Tab Navigation**: Profile, Progress, Attendance, Transactions, Schedule
- **Profile Tab**: Personal information form with medical and emergency contact sections
- **Medical Section**: Secure display of medical conditions with severity indicators
- **Emergency Contacts**: Prioritized contact list with authorization levels
- **Document Management**: File upload and download with verification status

### Student List Interface
- **Data Table**: shadcn/ui Table with sorting, filtering, and pagination
- **Search Interface**: Real-time search with advanced filter options
- **Action Buttons**: Quick actions for view, edit, enroll, transfer operations
- **Bulk Operations**: Multi-select functionality for batch operations
- **Export Options**: CSV/PDF export of filtered student data

### Student Form Interface
- **Multi-Step Form**: Organized sections with progress indication
- **Address Inheritance**: Toggle for using parent address
- **Medical Information**: Secure input with severity selection
- **Emergency Contacts**: Dynamic contact addition with priority ordering
- **Photo Upload**: Profile photo upload with preview and cropping

### Mobile Responsiveness
- **Student Cards**: Card-based layout for mobile student browsing
- **Quick Actions**: Mobile-optimized student management shortcuts
- **Search Interface**: Mobile-friendly search and filter interface
- **Profile Tabs**: Collapsible tab interface for mobile profile viewing

## Security and Privacy Considerations

### Medical Information Security
- **Access Control**: Strict permission requirements for medical data access
- **Audit Logging**: Complete audit trail for medical information access
- **Data Encryption**: Encryption of sensitive medical information at rest
- **HIPAA Considerations**: Medical data handling best practices

### Emergency Contact Security
- **Contact Verification**: Process for verifying emergency contact information
- **Authorization Levels**: Clear authorization for pickup and medical decisions
- **Contact Privacy**: Secure storage and limited access to contact information

### Document Security
- **File Storage**: Secure file storage with access controls
- **Document Verification**: Process for verifying document authenticity
- **Retention Policies**: Document retention and deletion policies
- **Access Logging**: Audit trail for document access and modifications

## Integration Points

### Parent Management Integration
- **Parent-Child Relationships**: Seamless parent-student association
- **Shared Information**: Address and contact information inheritance
- **Consolidated Billing**: Financial integration with parent accounts
- **Communication Preferences**: Coordinated notification settings

### Enrollment System Integration
- **Age Validation**: Automatic age validation for program enrollment
- **Facility Assignment**: Student facility assignment based on enrollments
- **Program Eligibility**: Age and medical condition-based program eligibility
- **Transfer Process**: Student facility transfer with enrollment updates

### Assessment System Integration
- **Progress Tracking**: Student progression through curriculum levels
- **Assessment History**: Complete assessment and scoring history
- **Achievement Milestones**: Recognition of student achievements
- **Instructor Feedback**: Integration of instructor notes and recommendations

## Implementation Steps

### Phase 1: Core Student Management
1. Create student database schema with relationships
2. Implement basic CRUD operations for students
3. Create student search and filtering functionality
4. Build student profile interface with basic information

### Phase 2: Medical and Emergency Information
1. Implement medical information management system
2. Create emergency contact management functionality
3. Add document upload and management system
4. Implement security and access controls for sensitive data

### Phase 3: Advanced Features
1. Add advanced search and analytics functionality
2. Implement student timeline and activity tracking
3. Create bulk operations and data export features
4. Add integration with enrollment and assessment systems

### Phase 4: Mobile and Performance Optimization
1. Optimize for mobile device usage
2. Implement performance optimizations for large student datasets
3. Add real-time search and filtering capabilities
4. Create comprehensive reporting and analytics features

## Testing Requirements

### Functional Testing
- **Student CRUD**: Verify student creation, updates, and deletion
- **Search Functionality**: Test search and filtering capabilities
- **Medical Information**: Validate medical data management and security
- **Emergency Contacts**: Test contact management and authorization

### Security Testing
- **Access Control**: Verify student access restrictions
- **Medical Data Security**: Test medical information protection
- **Document Security**: Validate document access and storage security
- **Audit Logging**: Verify comprehensive audit trail functionality

### Integration Testing
- **Parent Integration**: Test parent-student relationship management
- **Enrollment Integration**: Verify student-enrollment associations
- **Assessment Integration**: Test progress tracking integration
- **Transfer Process**: Validate student facility transfer functionality

### Performance Testing
- **Large Datasets**: Test performance with thousands of students
- **Search Performance**: Optimize search and filtering response times
- **File Upload**: Test document upload performance and limits
- **Mobile Performance**: Ensure responsive performance on mobile devices

This comprehensive student profile management system provides detailed student information tracking while maintaining security, privacy, and operational efficiency for academy management.