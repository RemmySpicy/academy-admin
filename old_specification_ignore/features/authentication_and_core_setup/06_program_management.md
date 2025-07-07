# Program Management - Technical Specification

## Overview & Business Requirements

### Problem Statement
The academy needs a flexible program management system that supports multiple sports/activities (Swimming, Football, Basketball, etc.) with proper organizational hierarchy and context switching for admin users. The system must handle multi-program assignments for Program Admins while maintaining data isolation and security.

### User Stories
- **As a Super Admin**, I want to create and manage all programs across the organization
- **As a Super Admin**, I want to assign Program Admins to specific programs and control their access
- **As a Program Admin**, I want to switch between my assigned programs and see only relevant data
- **As any admin user**, I want clear visual indication of which program context I'm currently working in
- **As a Super Admin**, I want to see consolidated views across all programs when needed

### Business Rules
- **Program Hierarchy**: Programs belong to the organization and can be assigned to multiple facilities
- **Access Control**: Program Admins can only access their assigned programs
- **Context Switching**: Clear program context for all administrative operations
- **Data Isolation**: Program-specific data remains separated and secure
- **Visual Distinction**: Each program has unique branding (colors, icons) for easy identification

## Technical Architecture

### Database Schema Requirements

#### programs table
```sql
-- Core program entity
programs:
  id: UUID (Primary Key)
  organization_id: UUID (Foreign Key → organizations.id)
  name: VARCHAR(100) NOT NULL  -- "Swimming", "Football", "Basketball"
  description: TEXT
  slug: VARCHAR(50) UNIQUE NOT NULL  -- URL-friendly identifier
  color_code: VARCHAR(7) NOT NULL  -- Hex color for UI theming "#4A90E2"
  icon: VARCHAR(50) NOT NULL  -- Icon identifier for UI
  settings: JSONB  -- Program-specific configuration
  is_active: BOOLEAN DEFAULT TRUE
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### facility_programs table
```sql
-- Many-to-many relationship between facilities and programs
facility_programs:
  id: UUID (Primary Key)
  facility_id: UUID (Foreign Key → facilities.id)
  program_id: UUID (Foreign Key → programs.id)
  is_active: BOOLEAN DEFAULT TRUE
  capacity_settings: JSONB  -- Program-specific capacity overrides
  schedule_settings: JSONB  -- Program-specific scheduling rules
  assigned_by: UUID (Foreign Key → users.id)
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

#### user_program_assignments table (from authentication)
```sql
-- Program Admin access control
user_program_assignments:
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key → users.id)
  program_id: UUID (Foreign Key → programs.id)
  assigned_by: UUID (Foreign Key → users.id)
  access_level: ENUM('read', 'write', 'admin') DEFAULT 'admin'
  created_at: TIMESTAMP AUTO
  updated_at: TIMESTAMP AUTO
```

### API Endpoints Specification

#### Program Management Endpoints

**GET /api/v1/programs**
- **Purpose**: List programs accessible to current user
- **Authorization**: Super Admin (all programs), Program Admin (assigned programs only)
- **Query Parameters**: 
  - `organization_id`: UUID (optional, Super Admin only)
  - `facility_id`: UUID (optional) - programs available at specific facility
  - `is_active`: boolean (default: true)
  - `include_stats`: boolean (default: false) - include enrollment/session counts
- **Response**: Array of program objects with access-filtered data

**POST /api/v1/programs**
- **Purpose**: Create new program
- **Authorization**: Super Admin only
- **Request Body**: Program details including name, description, branding
- **Validation**: Unique name per organization, valid color codes, icon validation

**GET /api/v1/programs/{program_id}**
- **Purpose**: Get detailed program information
- **Authorization**: Access check for program visibility
- **Response**: Complete program details with associated facilities and statistics

**PUT /api/v1/programs/{program_id}**
- **Purpose**: Update program information
- **Authorization**: Super Admin only
- **Request Body**: Updated program details
- **Validation**: Maintain referential integrity, validate branding elements

**DELETE /api/v1/programs/{program_id}**
- **Purpose**: Soft delete program (set is_active = false)
- **Authorization**: Super Admin only
- **Validation**: Check for active enrollments, handle cascading effects

#### Program Assignment Endpoints

**GET /api/v1/programs/{program_id}/admins**
- **Purpose**: List Program Admins assigned to program
- **Authorization**: Super Admin only
- **Response**: Array of admin users with assignment details

**POST /api/v1/programs/{program_id}/admins**
- **Purpose**: Assign Program Admin to program
- **Authorization**: Super Admin only
- **Request Body**: User ID and access level
- **Validation**: Verify user exists and has program_admin role

**DELETE /api/v1/programs/{program_id}/admins/{user_id}**
- **Purpose**: Remove Program Admin assignment
- **Authorization**: Super Admin only
- **Validation**: Ensure user retains access to at least one program

#### Facility-Program Association Endpoints

**GET /api/v1/programs/{program_id}/facilities**
- **Purpose**: List facilities offering this program
- **Authorization**: Program access check
- **Response**: Array of facilities with program-specific settings

**POST /api/v1/programs/{program_id}/facilities**
- **Purpose**: Assign program to facilities
- **Authorization**: Super Admin only
- **Request Body**: Array of facility IDs with optional settings
- **Validation**: Verify facility existence and authorization

**PUT /api/v1/programs/{program_id}/facilities/{facility_id}**
- **Purpose**: Update program settings for specific facility
- **Authorization**: Super Admin or assigned Program Admin
- **Request Body**: Facility-specific program configuration

#### Context Management Endpoints

**GET /api/v1/context/programs**
- **Purpose**: Get user's accessible programs for context switching
- **Authorization**: Any authenticated user
- **Response**: Simplified program list for context selection

**POST /api/v1/context/set-program**
- **Purpose**: Set current program context for user session
- **Authorization**: User must have access to specified program
- **Request Body**: Program ID for context switch
- **Response**: Updated context information

**GET /api/v1/context/current**
- **Purpose**: Get current program context and permissions
- **Authorization**: Any authenticated user
- **Response**: Current program details and user permissions within context

## Backend Implementation Details

### Program Context Management
```pseudocode
// Program context middleware
FUNCTION program_context_middleware(request):
    user = get_current_user(request)
    
    // Check for program context in request
    program_id = get_program_context(request)
    
    if program_id:
        // Verify user has access to this program
        if not user_has_program_access(user, program_id):
            raise UnauthorizedError("No access to program")
        
        // Set program context for request
        request.program_context = get_program(program_id)
    
    return proceed_to_handler(request)

// Program access validation
FUNCTION user_has_program_access(user, program_id):
    if user.role == "super_admin":
        return True
    
    assigned_programs = get_user_program_assignments(user.id)
    return program_id in assigned_programs
```

### Program-Specific Data Filtering
```pseudocode
// Filter queries by program context
FUNCTION apply_program_filter(query, user, program_context):
    if user.role == "super_admin" and not program_context:
        // Super admin without context sees all data
        return query
    
    if program_context:
        // Filter by specific program
        return query.filter(program_id = program_context.id)
    
    if user.role == "program_admin":
        // Filter by user's assigned programs
        assigned_programs = get_user_program_assignments(user.id)
        return query.filter(program_id.in(assigned_programs))
    
    return query
```

### Program Statistics Calculation
```pseudocode
// Calculate program statistics
FUNCTION calculate_program_stats(program_id):
    stats = {
        total_students: count_active_students(program_id),
        active_enrollments: count_active_enrollments(program_id),
        total_instructors: count_program_instructors(program_id),
        facilities_count: count_program_facilities(program_id),
        sessions_this_month: count_sessions_current_month(program_id),
        revenue_this_month: calculate_revenue_current_month(program_id)
    }
    return stats
```

## Frontend Implementation Details

### Program Context State Management (Zustand)
```pseudocode
// Program context store
ProgramContextStore = {
    availablePrograms: Program[],
    currentProgram: Program | null,
    isLoading: boolean,
    
    // Actions
    loadAvailablePrograms: () => Promise<void>,
    setCurrentProgram: (programId) => Promise<void>,
    getCurrentContext: () => Promise<ProgramContext>,
    clearContext: () => void
}

// Integration with auth store
FUNCTION syncProgramContextWithAuth():
    auth = useAuthStore()
    programContext = useProgramContextStore()
    
    // Load available programs when user authenticates
    when(auth.isAuthenticated):
        programContext.loadAvailablePrograms()
```

### Program Switcher Component
```pseudocode
// Program switcher dropdown component
ProgramSwitcher = {
    component_structure: {
        trigger: "Current program button with icon and name",
        dropdown: "List of available programs with quick switch",
        all_programs_option: "Super Admin only - view all programs"
    },
    
    features: {
        visual_indicators: "Program colors and icons",
        search_functionality: "Filter programs by name",
        context_persistence: "Remember selected program",
        loading_states: "Smooth transitions between contexts"
    }
}
```

### Program Branding Integration
```pseudocode
// Dynamic theming based on program
FUNCTION applyProgramTheme(program):
    css_variables = {
        '--program-primary': program.color_code,
        '--program-primary-dark': darken(program.color_code, 10%),
        '--program-primary-light': lighten(program.color_code, 10%)
    }
    
    apply_css_variables(css_variables)
    update_favicon(program.icon)
    update_page_title(program.name)
```

## UI/UX Requirements

### Program Switcher Design (shadcn/ui)
- **Location**: Top of sidebar, below user profile
- **Component**: shadcn/ui Select or DropdownMenu
- **Visual Elements**: Program icon, name, color accent
- **States**: Loading, selected, available options
- **Super Admin Feature**: "All Programs" option for system-wide view

### Program Visual Identity
- **Color System**: Each program has distinct primary color
- **Icon System**: Consistent icon library (Lucide React)
- **Branding Application**: Subtle program theming throughout interface
- **Context Indicators**: Clear visual cues for current program context

### Navigation Integration
- **Sidebar Theming**: Subtle program color integration
- **Page Headers**: Program context indication in page titles
- **Breadcrumbs**: Program context in navigation breadcrumbs
- **Data Tables**: Program-specific data filtering indicators

### Responsive Considerations
- **Mobile Adaptation**: Program switcher in mobile navigation
- **Tablet Layout**: Condensed program switcher for smaller screens
- **Desktop Optimization**: Full program branding and visual identity

## Integration Points

### Authentication System Integration
- **JWT Token Enhancement**: Include program assignments in user token
- **Permission System**: Program-specific permission calculation
- **Session Management**: Store program context in user session

### Data Access Layer Integration
- **Query Filtering**: Automatic program-based data filtering
- **Permission Checks**: Program access validation middleware
- **Audit Logging**: Program context in all audit entries

### Future Mobile App Preparation
- **API Structure**: Program context endpoints ready for mobile
- **Permission Model**: Consistent program access across platforms
- **Branding System**: Program theming structure for mobile apps

## Security Considerations

### Access Control
- **Program Isolation**: Strict data isolation between programs
- **Context Validation**: Verify program access on every request
- **Assignment Tracking**: Audit trail for program admin assignments
- **Session Security**: Secure program context storage

### Data Protection
- **Cross-Program Access**: Prevent unauthorized cross-program data access
- **Role Validation**: Verify role permissions for program operations
- **Assignment Limits**: Prevent privilege escalation through assignments

## Implementation Steps

### Phase 1: Core Program Structure
1. Create programs database schema and relationships
2. Implement basic CRUD operations for programs
3. Set up facility-program associations
4. Create program admin assignment system

### Phase 2: Context Management
1. Build program context middleware and validation
2. Implement program-based data filtering
3. Create context switching API endpoints
4. Add program context to JWT tokens

### Phase 3: Frontend Integration
1. Create program context state management
2. Build program switcher component
3. Implement program branding system
4. Add context indicators throughout UI

### Phase 4: Advanced Features
1. Add program statistics and analytics
2. Implement program-specific settings
3. Create bulk program operations
4. Optimize performance for multi-program queries

## Testing Requirements

### Functional Testing
- **Program CRUD**: Verify program creation, updates, and deletion
- **Access Control**: Test program admin assignment and access
- **Context Switching**: Validate program context management
- **Data Filtering**: Ensure proper program-based data isolation

### Security Testing
- **Authorization**: Verify program access restrictions
- **Context Validation**: Test program context security
- **Cross-Program Access**: Ensure data isolation between programs
- **Role Permissions**: Validate Super Admin vs Program Admin access

### Integration Testing
- **Authentication Integration**: Test program context with auth system
- **Database Relationships**: Verify facility-program associations
- **Frontend Integration**: End-to-end program switching functionality

### Performance Testing
- **Multi-Program Queries**: Test performance with multiple programs
- **Context Switching**: Measure context change response times
- **Data Filtering**: Optimize program-filtered query performance

This comprehensive program management system provides the foundation for multi-program academy operations while maintaining security, performance, and user experience standards.