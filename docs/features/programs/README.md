# Program Configuration System

**Comprehensive program setup and configuration management providing foundational settings for all program-specific features.**

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Configuration Components](#configuration-components)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Integration Points](#integration-points)
- [Usage Examples](#usage-examples)
- [Development Guide](#development-guide)

## Overview

The Program Configuration System serves as the foundational layer for all program-specific operations in the Academy Admin platform. It provides:

- **Age Group Management**: Defines target age ranges for course and curriculum creation
- **Difficulty Level Configuration**: Establishes progression structures for curriculum builders
- **Session Type Configuration**: Sets available session types with capacity limits for scheduling
- **Program Metadata**: Manages basic program information and organizational structure

### Key Benefits

- **Centralized Configuration**: Single source of truth for all program-specific settings
- **Cross-Feature Consistency**: Ensures all features use consistent program configurations
- **Validation Layer**: Prevents creation of invalid courses, curricula, or sessions
- **Flexible Setup**: Supports custom configurations per program while maintaining defaults
- **Integration Foundation**: Provides essential data for dependent features

## Architecture

### Core Components

```
Program Configuration System
├── Database Models
│   └── Program (enhanced with configuration fields)
│       ├── age_groups (JSON) → Age range definitions
│       ├── difficulty_levels (JSON) → Progression structure
│       ├── session_types (JSON) → Session type definitions
│       └── default_session_duration (int) → Duration defaults
├── Services
│   ├── Program Service (enhanced configuration management)
│   ├── Configuration Validation Service
│   └── Default Configuration Service
├── API Endpoints
│   ├── /api/v1/programs/ (CRUD with configuration)
│   ├── /api/v1/programs/{id}/age-groups
│   ├── /api/v1/programs/{id}/difficulty-levels
│   └── /api/v1/programs/{id}/session-types
└── Frontend Components
    ├── Configuration Management Interface
    ├── AgeGroupsManager Component
    ├── DifficultyLevelsManager Component
    └── SessionTypesManager Component
```

### Program Context Integration

The Program Configuration System operates at the **Academy Administration** level (`/admin/academy/programs/`), making it accessible only to Super Admins who can manage cross-program configurations.

**Security Model**:
- **Super Admin Only**: Configuration management restricted to highest privilege level
- **Program Context Bypass**: Uses `X-Bypass-Program-Filter: true` headers
- **Cross-Program Impact**: Configuration changes affect all program operations
- **Validation Enforcement**: Prevents breaking changes to existing data

## Core Features

### 1. Age Group Management ✅ **IMPLEMENTED**

**Purpose**: Define target age ranges for course creation and curriculum targeting.

**Features**:
- Dynamic add/remove age ranges
- Non-overlapping validation (3-99 years)
- Auto-generated display names (e.g., "6-8 years")
- Integration with course and curriculum creation

**Default Configuration**:
```json
[
  { "id": "6-8", "name": "6-8 years", "from_age": 6, "to_age": 8 },
  { "id": "9-12", "name": "9-12 years", "from_age": 9, "to_age": 12 },
  { "id": "13-17", "name": "13-17 years", "from_age": 13, "to_age": 17 },
  { "id": "18+", "name": "18+ years", "from_age": 18, "to_age": 99 }
]
```

### 2. Difficulty Level Configuration ✅ **IMPLEMENTED**

**Purpose**: Establish progression structures for curriculum builders and course assignment.

**Features**:
- Sortable list with drag-and-drop reordering
- Weight-based progression logic
- Maximum 10 levels per program
- Unique names within program

**Default Configuration**:
```json
[
  { "id": "beginner", "name": "Beginner", "weight": 1 },
  { "id": "intermediate", "name": "Intermediate", "weight": 2 },
  { "id": "advanced", "name": "Advanced", "weight": 3 }
]
```

### 3. Session Type Configuration ✅ **IMPLEMENTED**

**Purpose**: Define available session types with capacity limits for scheduling system.

**Features**:
- Default session types (Private, Group, School Group)
- Custom session type creation
- Capacity validation (1-100 participants)
- Integration with scheduling system

**Default Configuration**:
```json
[
  { "id": "private", "name": "Private", "capacity": 2 },
  { "id": "group", "name": "Group", "capacity": 5 },
  { "id": "school-group", "name": "School Group", "capacity": 50 }
]
```

### 4. Program Metadata Management ✅ **IMPLEMENTED**

**Purpose**: Manage basic program information and organizational structure.

**Features**:
- Program name and description
- Unique program codes (auto-generated from name)
- Category classification
- Status management (active, inactive, draft, archived)
- Display order for organization

## Configuration Components

### Frontend Configuration Managers

#### AgeGroupsManager Component
- **Location**: `frontend/src/features/academy/components/programs/configuration/AgeGroupsManager.tsx`
- **Purpose**: Dynamic age range management with validation
- **Features**: Add/remove cards, age range inputs, overlap validation

#### DifficultyLevelsManager Component  
- **Location**: `frontend/src/features/academy/components/programs/configuration/DifficultyLevelsManager.tsx`
- **Purpose**: Sortable difficulty level management
- **Features**: Drag-and-drop reordering, weight assignment, unique name validation

#### SessionTypesManager Component
- **Location**: `frontend/src/features/academy/components/programs/configuration/SessionTypesManager.tsx`
- **Purpose**: Session type configuration with capacity management
- **Features**: Default type preservation, custom type creation, capacity validation

#### ConfigurationTab Component
- **Location**: `frontend/src/features/academy/components/programs/forms/ConfigurationTab.tsx`
- **Purpose**: Unified configuration interface
- **Features**: Tabbed interface, form validation, integration with all managers

## Database Schema

### Enhanced Program Model

```python
class Program(BaseModel):
    # Basic Information
    name: str                                    # Program name
    program_code: Optional[str]                  # Unique identifier
    description: Optional[str]                   # Program description
    category: Optional[str]                      # Category classification
    status: CurriculumStatus                     # Program status
    display_order: Optional[int]                 # Display ordering
    
    # Configuration Fields
    age_groups: Optional[List[Dict[str, Any]]]           # Age range definitions
    difficulty_levels: Optional[List[Dict[str, Any]]]    # Progression structure
    session_types: Optional[List[Dict[str, Any]]]        # Session type definitions
    default_session_duration: Optional[int]             # Default duration (minutes)
```

### Configuration Data Structures

```typescript
interface AgeGroup {
  id: string;           // Unique identifier
  name: string;         // Display name (e.g., "6-8 years")
  from_age: number;     // Minimum age
  to_age: number;       // Maximum age
}

interface DifficultyLevel {
  id: string;           // Unique identifier
  name: string;         // Display name (e.g., "Beginner")
  weight: number;       // Sort order for progression
}

interface SessionType {
  id: string;           // Unique identifier
  name: string;         // Display name (e.g., "Private")
  capacity: number;     // Maximum participants
}
```

## API Endpoints

### Program CRUD with Configuration

```typescript
// Complete program management
GET    /api/v1/programs/                    # List all programs
POST   /api/v1/programs/                    # Create program with configuration
GET    /api/v1/programs/{id}                # Get program details
PUT    /api/v1/programs/{id}                # Update program and configuration
DELETE /api/v1/programs/{id}                # Delete program

// Configuration-specific endpoints
GET    /api/v1/programs/{id}/age-groups     # Get age group configuration
GET    /api/v1/programs/{id}/difficulty-levels  # Get difficulty levels
GET    /api/v1/programs/{id}/session-types  # Get session type configuration
GET    /api/v1/programs/{id}/configuration  # Get complete configuration
```

### Authentication & Headers

```typescript
// Required headers for Academy Administration
Headers: {
  "Authorization": "Bearer {jwt-token}",
  "X-Bypass-Program-Filter": "true",        // Super Admin bypass
  "Content-Type": "application/json"
}
```

## Frontend Components

### Page Structure

```typescript
// Route Structure
/admin/academy/programs/
├── /                    # Programs list with search/filter
├── /new                 # Full-page creation with configuration tabs
├── /{id}               # Program details view
└── /{id}/edit          # Full-page editing with configuration tabs

// Component Hierarchy
ProgramManagement
├── ProgramCreatePage
│   ├── BasicInformationTab
│   ├── ConfigurationTab
│   │   ├── AgeGroupsManager
│   │   ├── DifficultyLevelsManager
│   │   └── SessionTypesManager
│   └── TeamAssignmentTab
└── ProgramEditPage (same tab structure)
```

## Integration Points

### Course Management Integration ✅ **IMPLEMENTED**

**Integration Pattern**: Course creation validates against program configuration

```typescript
// Course creation reads program configuration
const programConfig = await programService.getConfiguration(programId);

// Validate course difficulty levels
if (!programConfig.difficulty_levels.includes(course.difficulty_level)) {
  throw new ValidationError("Invalid difficulty level for program");
}

// Validate course age groups  
const validAgeGroups = course.target_age_groups.every(
  ageGroup => programConfig.age_groups.includes(ageGroup)
);
```

### Curriculum Management Integration ✅ **IMPLEMENTED**

**Integration Pattern**: Curriculum builder uses program difficulty levels and age groups

```typescript
// Curriculum builder loads program configuration
const difficultyLevels = await programService.getDifficultyLevels(programId);
const ageGroups = await programService.getAgeGroups(programId);

// Curriculum levels assigned program difficulty levels
curriculum.levels.forEach(level => {
  level.difficulty_level = difficultyLevels.find(dl => dl.id === level.difficulty_id);
});
```

### Scheduling Integration ✅ **IMPLEMENTED**

**Integration Pattern**: Session creation limited to program-defined session types

```typescript
// Session creation loads session types
const sessionTypes = await programService.getSessionTypes(programId);
const defaultDuration = await programService.getDefaultDuration(programId);

// Session validation
if (!sessionTypes.find(st => st.id === session.session_type_id)) {
  throw new ValidationError("Invalid session type for program");
}

// Apply default duration
session.duration = session.duration || defaultDuration;
```

## Usage Examples

### Creating Program with Configuration

```typescript
// Complete program setup
const programData = {
  name: "Swimming Academy",
  program_code: "SWIM",
  description: "Comprehensive swimming program for all ages",
  category: "Sports",
  status: "active",
  age_groups: [
    { id: "kids", name: "6-12 years", from_age: 6, to_age: 12 },
    { id: "teens", name: "13-17 years", from_age: 13, to_age: 17 },
    { id: "adults", name: "18+ years", from_age: 18, to_age: 99 }
  ],
  difficulty_levels: [
    { id: "beginner", name: "Beginner", weight: 1 },
    { id: "intermediate", name: "Intermediate", weight: 2 },
    { id: "advanced", name: "Advanced", weight: 3 },
    { id: "competitive", name: "Competitive", weight: 4 }
  ],
  session_types: [
    { id: "private", name: "Private Lesson", capacity: 1 },
    { id: "semi-private", name: "Semi-Private", capacity: 2 },
    { id: "group", name: "Group Lesson", capacity: 6 },
    { id: "squad", name: "Swimming Squad", capacity: 12 }
  ],
  default_session_duration: 45
};

const program = await programService.create(programData);
```

### Accessing Configuration in Other Features

```typescript
// Course creation using program configuration
const createCourse = async (courseData, programId) => {
  // Load program configuration
  const config = await programService.getConfiguration(programId);
  
  // Validate course data against configuration
  validateCourseAgeGroups(courseData.target_age_groups, config.age_groups);
  validateCourseDifficulty(courseData.difficulty_level, config.difficulty_levels);
  
  // Create course with validated data
  return await courseService.create(courseData);
};

// Session creation using session types
const createSession = async (sessionData, programId) => {
  // Load session configuration
  const sessionTypes = await programService.getSessionTypes(programId);
  const defaultDuration = await programService.getDefaultDuration(programId);
  
  // Apply configuration
  sessionData.duration = sessionData.duration || defaultDuration;
  
  // Validate session type
  const sessionType = sessionTypes.find(st => st.id === sessionData.session_type_id);
  if (!sessionType) {
    throw new Error("Invalid session type");
  }
  
  return await sessionService.create(sessionData);
};
```

## Development Guide

### Adding New Configuration Types

1. **Update Program Model**: Add new JSON field to database model
2. **Create Manager Component**: Build UI component following existing patterns
3. **Update Configuration Tab**: Integrate new manager into tabbed interface
4. **Add API Endpoints**: Create specific endpoints for new configuration type
5. **Update Validation**: Add business rules and validation logic
6. **Document Integration**: Update Feature Integration Guide with new integration points

### Configuration Migration

```typescript
// Default configuration for new programs
const DEFAULT_PROGRAM_CONFIG = {
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

### Testing Configuration Integration

```typescript
// Test configuration validation
describe('Program Configuration Integration', () => {
  test('course creation validates against program age groups', async () => {
    const program = await createProgramWithConfig();
    const invalidCourse = { target_age_groups: ['invalid-age-group'] };
    
    await expect(courseService.create(invalidCourse, program.id))
      .rejects.toThrow('Invalid age group');
  });
  
  test('session creation uses program session types', async () => {
    const program = await createProgramWithConfig();
    const session = await sessionService.create({
      session_type_id: 'private'
    }, program.id);
    
    expect(session.capacity).toBe(2); // From program configuration
  });
});
```

---

**📖 Related Documentation**:
- [Enhanced Program Setup Specification](./ENHANCED_PROGRAM_SETUP_SPECIFICATION.md) - Detailed implementation specifications
- [Backend Implementation Summary](./BACKEND_IMPLEMENTATION_SUMMARY.md) - Backend architecture details
- [Feature Integration Guide](../../architecture/FEATURE_INTEGRATION_GUIDE.md) - Cross-feature integration patterns
- [API Endpoints Reference](../../api/API_ENDPOINTS.md) - Complete API documentation

*This documentation serves as the definitive guide for understanding and extending the Program Configuration System. Keep this document updated as new configuration types and integration patterns are added.*