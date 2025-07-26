# Enhanced Program Setup Specification

## Overview
This document specifies the enhanced program setup system that provides comprehensive program configuration capabilities, moving from a modal-based creation to a full-page tabbed interface with extensive configuration options.

## Current State Analysis

### ✅ Existing Implementation
- **Modal-based creation**: Simple dialog with basic fields
- **Basic fields**: name, program_code, description, category, status, display_order
- **Card-based program display** with view/edit/delete actions
- **Search and filtering** capabilities
- **Statistics dashboard** with program metrics
- **Complete backend API** with CRUD operations

### 🎯 Enhancement Requirements
- **Full-page creation/editing**: Replace modal with dedicated routes
- **Enhanced configuration**: Add age groups, difficulty levels, session types
- **Team assignment**: Optional program team member assignment
- **Feature integration**: Support curriculum builder, course creation, scheduling
- **Migration support**: Update existing programs with default configurations

## Feature Specification

### 🏗️ Architecture Changes

#### **Route Structure**
```
/admin/academy/programs/
├── /                              # Programs list page
├── /new                          # Full-page creation
├── /[id]                         # Program details view
├── /[id]/edit                    # Full-page editing
└── /[id]/settings                # Advanced settings (future)
```

#### **Component Structure**
```
features/academy/components/
├── programs/
│   ├── ProgramCreatePage.tsx     # New full-page creation
│   ├── ProgramEditPage.tsx       # New full-page editing
│   ├── ProgramDetailsPage.tsx    # Enhanced details view
│   ├── forms/
│   │   ├── BasicInformationTab.tsx
│   │   ├── ConfigurationTab.tsx
│   │   └── TeamAssignmentTab.tsx
│   └── configuration/
│       ├── AgeGroupsManager.tsx
│       ├── DifficultyLevelsManager.tsx
│       └── SessionTypesManager.tsx
```

### 📊 Data Models

#### **Enhanced Program Model**
```typescript
interface Program {
  // Existing fields
  id: string;
  name: string;
  program_code?: string;
  description?: string;
  category?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  display_order?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;

  // New configuration fields
  age_groups: AgeGroup[];
  difficulty_levels: DifficultyLevel[];
  session_types: SessionType[];
  default_session_duration: number; // minutes
}
```

#### **Configuration Data Structures**
```typescript
interface AgeGroup {
  id: string;
  name: string; // e.g., "6-8 years"
  from_age: number; // e.g., 6
  to_age: number;   // e.g., 8
}

interface DifficultyLevel {
  id: string;
  name: string; // e.g., "Beginner"
  weight: number; // 1, 2, 3... for ordering
}

interface SessionType {
  id: string;
  name: string; // e.g., "Private"
  capacity: number; // e.g., 2
}
```

### 🎨 User Interface Specification

#### **Tabbed Interface Structure**
1. **Basic Information Tab**
   - Program name (required)
   - Program code (auto-generated, editable)
   - Description (optional)
   - Category (dropdown)
   - Status (dropdown)
   - Display order (auto-calculated)

2. **Configuration Tab**
   - Age Groups Manager (dynamic add/remove)
   - Difficulty Levels Manager (dynamic add/remove, sortable)
   - Session Types Manager (default + custom)
   - Default Session Duration (number input)

3. **Team Assignment Tab** (Optional)
   - Role-based user search and selection
   - Immediate assignment (no pending invitations)
   - Integration with existing user management patterns

#### **Configuration Managers**

##### **Age Groups Manager**
- **Input Fields**: From Age (number), To Age (number)
- **Display Format**: Auto-generates "6-8 years" format
- **Validation**: From age < To age, reasonable ranges (3-99 years)
- **UI Pattern**: Add/remove cards with age range inputs

##### **Difficulty Levels Manager**
- **Input Fields**: Name (text), Weight (auto-assigned, sortable)
- **Constraints**: Max 10 levels per program, unique names
- **UI Pattern**: Sortable list with drag-and-drop reordering
- **Default Suggestions**: Beginner, Intermediate, Advanced

##### **Session Types Manager**
- **Default Types**: Private (2), Group (5), School Group (unlimited/50)
- **Custom Types**: Name + Capacity configuration
- **Validation**: Unique names within program, reasonable capacity (1-100)
- **UI Pattern**: Cards with inline editing

### 🔄 Integration Specifications

#### **Course Creation Integration**
- **Difficulty Level Selection**: Dropdown populated from program configuration
- **Age Group Targeting**: Multi-select from program age groups
- **Validation**: Ensure selected values exist in program configuration

#### **Curriculum Builder Integration**
- **Level Difficulty Assignment**: Each curriculum level can have assigned difficulty
- **Age Group Targeting**: Curriculum age ranges validated against program groups
- **Progression Logic**: Difficulty levels inform curriculum progression

#### **Scheduling Integration**
- **Session Type Availability**: Session creation limited to program-defined types
- **Capacity Validation**: Session capacity enforced based on type configuration
- **Duration Defaults**: New sessions default to program session duration

#### **Team Management Integration**
- **Assignment Sync**: Team assignments sync with program team tab
- **Role Validation**: Ensure assigned roles have appropriate program permissions
- **Access Control**: Team members gain program context access

### 🛡️ Validation Rules

#### **Business Rules**
1. **Program Code**: Unique across all programs, auto-generated from name
2. **Age Groups**: Non-overlapping ranges, minimum 1 year span
3. **Difficulty Levels**: Minimum 1 level, maximum 10 levels, unique names
4. **Session Types**: Minimum 1 type, unique names, capacity > 0
5. **Team Assignment**: Valid user IDs, appropriate role permissions

#### **Data Validation**
```typescript
const programValidationSchema = z.object({
  name: z.string().min(1).max(200),
  program_code: z.string().regex(/^[A-Za-z0-9_-]+$/).max(20),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  display_order: z.number().min(0),
  age_groups: z.array(z.object({
    id: z.string(),
    name: z.string(),
    from_age: z.number().min(3).max(99),
    to_age: z.number().min(3).max(99)
  })).min(1).max(20),
  difficulty_levels: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(50),
    weight: z.number().min(1)
  })).min(1).max(10),
  session_types: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(50),
    capacity: z.number().min(1).max(100)
  })).min(1).max(20),
  default_session_duration: z.number().min(15).max(300)
});
```

### 📦 Migration Strategy

#### **Default Configuration Values**
```typescript
const DEFAULT_CONFIGURATION = {
  age_groups: [
    { id: "6-8", name: "6-8 years", from_age: 6, to_age: 8 },
    { id: "9-12", name: "9-12 years", from_age: 9, to_age: 12 },
    { id: "13-17", name: "13-17 years", from_age: 13, to_age: 17 },
    { id: "18+", name: "18+ years", from_age: 18, to_age: 99 }
  ],
  difficulty_levels: [
    { id: "beginner", name: "Beginner", weight: 1 },
    { id: "intermediate", name: "Intermediate", weight: 2 },
    { id: "advanced", name: "Advanced", weight: 3 }
  ],
  session_types: [
    { id: "private", name: "Private", capacity: 2 },
    { id: "group", name: "Group", capacity: 5 },
    { id: "school-group", name: "School Group", capacity: 50 }
  ],
  default_session_duration: 60
};
```

#### **Migration Process**
1. **Database Migration**: Add new JSON columns to programs table
2. **Data Population**: Apply default configurations to existing programs
3. **API Updates**: Extend program endpoints to include new fields
4. **Frontend Migration**: Remove modal components, add full-page routes
5. **Integration Updates**: Update dependent features to use new configurations

### 🎯 User Workflows

#### **Program Creation Workflow**
1. **Navigation**: Click "Create Program" → Navigate to `/admin/academy/programs/new`
2. **Basic Information**: Fill required fields (name, code, category, status)
3. **Configuration**: Configure age groups, difficulty levels, session types
4. **Team Assignment**: Optionally assign program team members
5. **Review & Create**: Validate and create program
6. **Redirect**: Return to programs list with success notification

#### **Program Editing Workflow**
1. **Navigation**: Click "Edit" on program card → Navigate to `/admin/academy/programs/[id]/edit`
2. **Load Current Data**: Pre-populate all tabs with existing configuration
3. **Modify Configuration**: Update any tab as needed
4. **Validation**: Ensure changes don't break existing integrations
5. **Save & Update**: Apply changes with impact validation
6. **Redirect**: Return to programs list with update notification

#### **Configuration Management Workflow**
1. **Age Groups**: Add ranges, validate non-overlap, auto-generate names
2. **Difficulty Levels**: Add levels, drag to reorder, auto-assign weights
3. **Session Types**: Keep defaults, add custom types, set capacities
4. **Integration Check**: Warn if changes affect existing courses/curricula

### ⚡ Performance Considerations

#### **Data Loading**
- **Lazy Load**: Configuration tabs load data on demand
- **Caching**: Cache program configurations for dependent features
- **Pagination**: Handle large programs list efficiently

#### **Validation Performance**
- **Client-side**: Immediate feedback for form validation
- **Server-side**: Comprehensive validation on submission
- **Async Validation**: Check program code uniqueness asynchronously

### 🧪 Testing Strategy

#### **Unit Testing**
- Configuration data structure validation
- Form field validation and error handling
- Component state management
- Integration with backend APIs

#### **Integration Testing**
- Full program creation/editing workflows
- Team assignment functionality
- Cross-feature integration (courses, curricula, scheduling)
- Migration script validation

#### **User Acceptance Testing**
- Super admin program management workflows
- Configuration impact on dependent features
- Performance with realistic data volumes
- Error handling and edge cases

## Implementation Priority

### Phase 1: Core Implementation
1. Database migration and model updates
2. Backend API enhancements
3. Basic full-page creation/editing UI
4. Configuration managers (age groups, difficulty levels, session types)

### Phase 2: Integration
1. Team assignment functionality
2. Course creation integration
3. Curriculum builder integration
4. Scheduling integration

### Phase 3: Enhancement
1. Advanced validation and error handling
2. Performance optimizations
3. Enhanced user experience features
4. Comprehensive testing and documentation

---

*This specification serves as the definitive guide for implementing the enhanced program setup system. All implementation should follow these specifications to ensure consistency and completeness.*