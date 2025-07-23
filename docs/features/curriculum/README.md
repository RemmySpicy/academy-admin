# Curriculum Management System

## 📚 **Overview**

The Academy Administration System features a comprehensive curriculum management system that allows educational institutions to create, manage, and track structured learning pathways. The system is designed around a curriculum-centric approach where curricula are first-class entities with sophisticated management capabilities.

## 🏗️ **Architecture**

### **Core Concepts**
- **Curricula**: Age-specific or skill-level learning pathways within courses
- **Default Management**: Curricula can be designated as default for specific age groups
- **Program Context**: All curricula are filtered by program assignments
- **Tabbed Interface**: Unified editing experience with Details and Builder tabs

### **Data Structure**
```
Program
└── Course
    └── Curriculum (age-specific, e.g., "Swimming Club: 6-8 years")
        ├── Levels (progression stages with custom titles)
        │   ├── Title: "Level 1: Foundation Skills"
        │   ├── Intro Video URL
        │   ├── Equipment Needed
        │   └── Modules (thematic units with custom titles)
        │       ├── Title: "Module 1: Water Safety"
        │       └── Sections (workout/lesson groups with custom titles)
        │           ├── Title: "Section 1: Pool Entry Techniques"
        │           ├── Warm Up Instructions
        │           ├── Preset Instructions  
        │           ├── Main Set (Lessons - individual content)
        │           ├── Post Set Instructions
        │           └── Cool Down Instructions
        └── Assessment Criteria
```

## 🎯 **Features**

### **✅ Implemented (2025-07-23)**

#### **1. Curriculum-Centric Management**
- **Full-Page Interfaces**: Moved from modal-based to dedicated page workflows
- **Course-Grouped Display**: Curricula organized by course in collapsible sections
- **Default System**: Set curricula as default for specific age groups with conflict resolution
- **Advanced Search**: Filter by course, difficulty, status, age groups, and default status

#### **2. Unified Edit Experience**
- **Tabbed Interface**: Single edit page with Details and Builder tabs
- **Details Tab**: Basic information, age groups, prerequisites, learning objectives
- **Builder Tab**: Advanced curriculum structure builder with workout components
- **Tab Persistence**: URL support for direct tab access (`?tab=builder`)

#### **3. Enhanced Builder with Custom Titles**
- **Level Display**: "Level X: Custom Title" format with collapsible details
- **Level Fields**: Title, intro video URL, equipment needed, description
- **Module Display**: "Module X: Custom Title" format
- **Section Display**: "Section X: Custom Title" format
- **Vertical Layout**: Modules now stack vertically for better content organization

#### **4. Structured Workout Components**
- **Warm Up** (Blue): Text input for warm-up instructions
- **Preset** (Green): Text input for preparation instructions  
- **Main Set** (Purple): Lesson management with create/library access
- **Post Set** (Orange): Text input for post-workout instructions
- **Cool Down** (Cyan): Text input for cool-down instructions
- **Color-Coded Interface**: Visual organization for different workout phases

#### **5. Age Group Management**
- **Flexible Age Ranges**: JSON-based age group configuration
- **Default Conflict Resolution**: Automatic handling when setting new defaults
- **Visual Indicators**: Default badges and age group displays

## 📁 **File Structure**

### **Backend Components**
```
backend/app/features/courses/
├── models/
│   ├── curriculum.py           # Core curriculum model with age ranges
│   └── progression.py          # Progression and assessment models
├── schemas/
│   └── curriculum.py           # Pydantic schemas with search params
├── services/
│   └── curriculum_service.py   # Business logic and default management
├── routes/
│   └── curricula.py           # API endpoints
└── api/
    └── courseApiService.ts     # Frontend API client
```

### **Frontend Components**
```
frontend/src/features/courses/
├── components/
│   ├── CurriculumBuilder.tsx           # Main builder component
│   ├── CurriculumCard.tsx              # Curriculum display card
│   ├── CurriculumForm.tsx              # Create/edit forms
│   ├── CurriculumSearchAndFilter.tsx   # Advanced filtering
│   └── CourseGroupedCurriculaList.tsx  # Course-grouped display
├── hooks/
│   └── useCurricula.ts                 # React Query hooks
└── pages/
    ├── /admin/curricula/               # Main listing page
    ├── /admin/curricula/[id]/          # Detail page
    └── /admin/curricula/[id]/edit/     # Unified edit page
```

## 🔗 **Related Documentation**

### **Technical Specifications**
- **[Curriculum Progression Specification](./CURRICULUM_PROGRESSION_SPECIFICATION.md)** - Detailed technical requirements and implementation details
- **[Database Schema](../../architecture/DATABASE_SCHEMA.md)** - Complete database structure including curriculum tables

### **Development Guidelines**
- **[Program Context Standards](../../development/PROGRAM_CONTEXT_STANDARDS.md)** - Program filtering requirements
- **[Development Workflow](../../development/DEVELOPMENT_WORKFLOW.md)** - Feature development process

### **API Documentation**
- **[API Endpoints](../../api/API_ENDPOINTS.md)** - Complete curriculum API reference

## 🚀 **Quick Start**

### **Accessing Curriculum Management**
1. **Login**: Use Super Admin (`admin@academy.com`) or Program Admin credentials
2. **Navigation**: Go to Courses page → Curricula tab
3. **Create**: Click "Create Curriculum" → Fill Details → Use Builder tab for structure
4. **Manage**: Set defaults, search/filter, and organize by course

### **Key Workflows**
```
📋 Creating Curriculum:
Courses → Curricula → Create → Details Tab → Builder Tab → Save

✏️ Editing Curriculum:
Curriculum Detail → Edit → [Details|Builder] Tabs → Save

⭐ Setting Defaults:
Curriculum Card → Set Default → Select Age Groups → Confirm

🔍 Advanced Search:
Curricula Tab → Filters → Course/Difficulty/Age Groups/Default Status
```

## 🏊 **Workout Structure System**

The curriculum builder features a comprehensive workout structure designed for sports and physical education curricula, particularly swimming programs.

### **Section Components**

Each section within a module is organized into five distinct workout phases:

#### **1. Warm Up** (Blue Theme)
- **Purpose**: Preparation and activation exercises
- **Interface**: Collapsible text input with blue color coding
- **Usage**: Instructions for getting students ready for main activities
- **Example**: "5 minutes light jogging, arm circles, dynamic stretching"

#### **2. Preset** (Green Theme)  
- **Purpose**: Specific preparation for main set activities
- **Interface**: Collapsible text input with green color coding
- **Usage**: Technical preparation or equipment setup instructions
- **Example**: "Check goggles, review technique cues, 2x25m easy freestyle"

#### **3. Main Set** (Purple Theme)
- **Purpose**: Core learning content and skill development
- **Interface**: Collapsible section with lesson management
- **Features**: 
  - Create new lessons directly
  - Access lesson library for existing content
  - Drag-and-drop lesson ordering
  - Individual lesson duration tracking
- **Example**: Primary swimming technique lessons, skill drills

#### **4. Post Set** (Orange Theme)
- **Purpose**: Follow-up activities after main content
- **Interface**: Collapsible text input with orange color coding  
- **Usage**: Reinforcement exercises or skill consolidation
- **Example**: "Practice starts from blocks, technique review"

#### **5. Cool Down** (Cyan Theme)
- **Purpose**: Recovery and session closure
- **Interface**: Collapsible text input with cyan color coding
- **Usage**: Recovery activities and session wrap-up
- **Example**: "Easy swimming, stretching, equipment collection"

### **Visual Organization**
- **Color-Coded Interface**: Each component has distinct colors for quick identification
- **Collapsible Design**: Reduces visual clutter while maintaining full functionality
- **Vertical Layout**: Sections stack vertically for better content flow
- **Integrated Workflow**: Lesson library access built into Main Set component

## 📊 **Current Status**

### **✅ Completed Features**
- ✅ Course-grouped curriculum display with collapsible sections
- ✅ Unified tabbed edit interface (Details + Builder)
- ✅ Default curriculum management with conflict resolution
- ✅ Advanced search and filtering system
- ✅ Custom title system for Levels, Modules, and Sections
- ✅ Structured workout components (Warm Up, Preset, Main Set, Post Set, Cool Down)
- ✅ Level details with intro video URL and equipment needed fields
- ✅ Vertical module layout for improved content organization
- ✅ Color-coded collapsible workout interface
- ✅ Age range-based curriculum configuration
- ✅ Program context security filtering
- ✅ Full-page workflow (no more modals)

### **🔄 Future Enhancements**
- Content Library integration for lesson management
- Assessment criteria builder with scoring rubrics
- Curriculum templates and duplication workflows
- Progress tracking and analytics integration
- Advanced lesson sequencing and prerequisites

## 🎨 **UX Improvements Made**

### **Before → After**
- **Modal-based creation** → **Full-page workflows**
- **Separate Edit + Builder pages** → **Unified tabbed interface**
- **Course-centric view** → **Curriculum-centric management**
- **Basic search** → **Comprehensive filtering with age groups**
- **Manual organization** → **Course-grouped collapsible display**

This creates a significantly more intuitive and professional curriculum management experience that follows modern web application patterns! 🎉