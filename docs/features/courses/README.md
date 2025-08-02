# Course Management Feature

## Overview
Core course management system with program-centric architecture. As of 2025-07-27, the course management has been refactored into a clean, focused feature following domain-driven design principles.

## Current Implementation Status ✅

### **Fully Implemented**
- Clean course management (focused on course metadata and structure)
- Program context filtering for all course operations
- Role-based access control for course management
- RESTful API with automatic program scoping
- Frontend course management interface

### **⚠️ Architecture Change (2025-07-27)**
The course management system has been **comprehensively refactored** to follow clean architecture principles:

- **Courses Feature**: Now focused solely on core course management
- **Curricula Feature**: Separated curriculum hierarchy (curricula → levels → modules → sections)
- **Content Feature**: Separated educational content (lessons, assessments, versioning)
- **Equipment Feature**: Separated equipment requirements and management
- **Media Feature**: Separated media library and resources
- **Progression Feature**: Separated student progression tracking

📖 **For complete architecture details, see**: [`docs/architecture/BACKEND_FEATURE_ARCHITECTURE.md`](../../architecture/BACKEND_FEATURE_ARCHITECTURE.md)

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

### **Program Configuration Integration** ✅ **NEW (2025-08-02)**

#### **Dynamic Configuration Loading**
Course forms now automatically load configuration from Academy Administration Program setup:

```typescript
// Hooks that fetch program-specific configuration
const { data: ageGroups } = useProgramAgeGroups(currentProgram?.id);
const { data: difficultyLevels } = useProgramDifficultyLevels(currentProgram?.id);
const { data: sessionTypes } = useProgramSessionTypes(currentProgram?.id);
```

#### **Smart Fallback System**
- **Primary Source**: Academy Administration → Programs → Configuration tab
- **Fallback**: Sensible defaults when program configuration unavailable
- **User Feedback**: Clear indicators showing data source (program vs default)
- **Real-time**: Configuration changes reflect immediately in course forms

#### **Configuration Sources**
| Field | Program Source | Fallback |
|-------|---------------|----------|
| Age Groups | `program.age_groups` JSON | Default ranges (6-8, 9-12, 13-17, 18+) |
| Difficulty Levels | `program.difficulty_levels` JSON | Default levels (Beginner, Intermediate, Advanced) |
| Session Types | `program.session_types` JSON | Default types (Private, Group, School Group) |

#### **User Experience**
- **Loading States**: "Loading from program..." indicators during configuration fetch
- **Source Transparency**: "Age groups from Swimming Program configuration" vs "Using default age groups"
- **Configuration Guidance**: Links users to Academy Administration for setup
- **Responsive Design**: All configuration elements work across screen sizes

#### **Technical Implementation**
- **Type Safety**: Full TypeScript interfaces for configuration data
- **Performance**: 5-minute cache with 10-minute garbage collection
- **Error Handling**: Graceful degradation when configuration unavailable
- **Backwards Compatibility**: Existing courses continue working without changes

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

## Pricing System

### **Price Ranges Architecture (Updated 2025-07-30)**

The course pricing system has been updated to use **price ranges** instead of detailed pricing matrices. This approach provides potential customers with an idea of cost without revealing exact facility-specific pricing.

#### **Core Concept**
- **Course Definition**: Contains price ranges per age group (e.g., "₦15,000 - ₦25,000")
- **Facility Implementation**: Specific facility pricing is configured separately in the facility management system
- **Customer Display**: Shows ranges on website/mobile app, exact prices determined during booking

#### **Data Structure**
```typescript
interface PricingRange {
  age_group: string;      // e.g., "6-12-years"
  price_from: number;     // Minimum price in NGN
  price_to: number;       // Maximum price in NGN
}

interface Course {
  // ... other fields
  pricing_ranges: PricingRange[];
  location_types: string[];    // Configuration only (our-facility, client-location, virtual)
  session_types: string[];     // Configuration only (group, private)
}
```

#### **Migration from Pricing Matrix**
A migration script converted the old detailed pricing matrix to price ranges:
- **Old**: Specific prices per (age_group + location_type + session_type) combination
- **New**: Price ranges per age_group, with min/max calculated from old matrix

#### **Frontend Implementation**
The course creation form now displays:
- Age group selection (generates pricing ranges automatically)
- Price range inputs (from/to) for each age group
- Session types and location types as configuration (no individual pricing)
- Real-time range preview with formatting

#### **Benefits**
1. **Customer Experience**: Gives price expectations without sticker shock
2. **Flexibility**: Facilities can set exact prices based on local market conditions
3. **Simplicity**: Easier course setup and management
4. **Marketing**: Better for website display and mobile app integration

#### **Facility-Specific Pricing System (Updated 2025-07-30)**

Building on the course price ranges, each facility can now configure **actual customer prices** through the Facility Course Pricing system.

##### **Two-Tier Pricing Architecture**
```
Course Definition (Marketing Layer)
├── price_ranges: [{ age_group, price_from, price_to }]  // Customer expectations
└── location_types: [...], session_types: [...]         // Configuration only

Facility Implementation (Transaction Layer)  
├── facility_course_pricing table                       // Actual customer prices
└── Specific price per (facility + course + age_group + location_type + session_type)
```

##### **Database Schema**
```sql
-- Course price ranges (customer expectations)
courses.pricing_ranges: [
  { "age_group": "6-12-years", "price_from": 15000, "price_to": 25000 }
]

-- Facility actual pricing (customer transactions)
facility_course_pricing:
├── facility_id + course_id + age_group + location_type + session_type
├── price (actual amount charged)
├── is_active, notes
└── Unique constraint on active combinations
```

##### **Frontend Integration**
- **Course Forms**: Set price ranges for marketing display
- **Facility Management**: Configure actual prices via "Course Price" tab
- **Pricing Lookup**: API endpoint for enrollment systems to get exact prices

##### **API Endpoints**
```typescript
// Course price ranges (marketing)
GET /api/v1/courses/{id}                    // Returns pricing_ranges
POST /api/v1/courses/                       // Create with pricing_ranges

// Facility actual pricing (transactions)
GET /api/v1/facilities/pricing/facility/{id}/pricing    // All pricing for facility
POST /api/v1/facilities/pricing/                        // Create pricing entry
POST /api/v1/facilities/pricing/lookup                  // Price lookup for enrollment
GET /api/v1/facilities/pricing/facility/{id}/matrix     // Complete pricing matrix
```

##### **Enrollment Integration**
```typescript
// Customer enrollment flow
1. Customer sees course price ranges on website
2. Customer selects facility 
3. System calls pricing lookup API
4. Customer sees exact price and enrolls
5. Payment uses facility-specific price

// Pricing lookup example
const pricingLookup = {
  facility_id: "olympic-pool-123",
  course_id: "swimming-fundamentals-456", 
  age_group: "6-12-years",
  location_type: "our-facility",
  session_type: "group"
};

const result = await facilityCoursePricingApi.lookupPricing(pricingLookup);
// Returns: { found: true, price: 18000, formatted_price: "₦18,000" }
```

### **Usage Examples**

#### **Creating Course with Price Ranges**
```typescript
const courseData = {
  name: "Swimming Fundamentals",
  age_groups: ["6-12-years", "13-17-years"],
  location_types: ["our-facility", "client-location"],
  session_types: ["group", "private"],
  pricing_ranges: [
    { age_group: "6-12-years", price_from: 15000, price_to: 25000 },
    { age_group: "13-17-years", price_from: 18000, price_to: 30000 }
  ]
};
```

#### **Displaying to Customers**
```typescript
// Website/Mobile App
course.pricing_ranges.map(range => (
  `${range.age_group}: ₦${formatCurrency(range.price_from)} - ₦${formatCurrency(range.price_to)}`
));
// Output: "6-12 years: ₦15,000 - ₦25,000"
```

## Future Enhancements
- Advanced assessment builder
- Course versioning system
- Content library with reusable components
- Analytics and progress tracking
- Bulk course operations
- Export/import course functionality