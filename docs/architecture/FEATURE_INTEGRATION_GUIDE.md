# Feature Integration Guide

## Overview
This document serves as the definitive guide for understanding how all features in the Academy Admin system integrate with each other. It provides a comprehensive map of feature dependencies, data flows, and integration points to ensure consistent development and avoid integration conflicts.

## Core Integration Principles

### Program Context Foundation
All features operate within the **Program Context Architecture**:
- Every feature respects program boundaries
- Data is automatically filtered by program assignments
- Cross-program access is strictly controlled
- Security is enforced at the API level through program context headers

### Role-Based Access Pattern
All features implement consistent role-based access:
- **Super Admin**: Cross-program access + academy administration
- **Program Admin**: Full program management capabilities
- **Program Coordinator**: Student-focused program operations
- **Instructor**: Limited program interaction
- **Student**: Mobile app access to own data
- **Parent**: Mobile app access to children's data

## Feature Integration Matrix

### 1. Facility Management ↔ Multiple Features Integration ✅ **ENHANCED** (2025-01-03)

#### **Data Dependencies**
```
Facility Model → Multiple Features
├── facility_type (enum) → Course/Program targeting
├── capacity (int) → Session/Schedule capacity limits
├── access_fees → Course pricing calculations
├── operating_hours → Scheduling availability windows
├── equipment → Course suitability filtering
├── specifications → Course requirements matching
└── facility_code (string) → Cross-feature identification
```

#### **Integration Points**
- **Course Assignment**: Facilities determine available venues for course delivery ✅ **ENHANCED**
- **Scheduling Integration**: Operating hours and capacity define scheduling constraints ✅ **ENHANCED**
- **Pricing Integration**: Access fees are factored into course pricing via FacilityCoursePricing ✅ **ENHANCED**
- **Staff Assignment**: Facilities can have dedicated managers and assigned instructors ✅ **NEW**
- **Equipment Matching**: Course requirements matched against facility equipment ✅ **ENHANCED**
- **Availability Management**: Real-time booking slots and maintenance windows ✅ **NEW**

#### **Business Rules**
- Facilities must have unique codes within each program ✅ **ENHANCED**
- Capacity constraints are enforced during session booking ✅ **ENHANCED**
- Operating hours define valid scheduling windows ✅ **ENHANCED**
- Access fees are automatically included in course pricing calculations ✅ **ENHANCED**
- Equipment specifications determine course eligibility ✅ **ENHANCED**
- Manager assignments require valid user relationships ✅ **NEW**

#### **API Integration Patterns**
```typescript
// Enhanced facility operations
useFacility(id) // Basic facility data
useFacilitySchedule(id) // Schedule integration
useFacilityAvailability(id, date) // Booking availability
useFacilityStaff(id) // Staff assignments
useDuplicateFacility() // Template operations
useArchiveFacility() // Lifecycle management
```

### 2. Program Configuration ↔ Multiple Features Integration ✅ **IMPLEMENTED**

#### **Data Dependencies**
```
Program Model → Multiple Features
├── age_groups (JSON) → Course/Curriculum age targeting
├── difficulty_levels (JSON) → Course/Curriculum progression
├── session_types (JSON) → Scheduling session creation
├── default_session_duration (int) → Scheduling defaults
└── program_code (string) → Cross-feature identification
```

#### **Integration Points**
- **Age Group Configuration**: Defines available age ranges for course and curriculum targeting ✅ **IMPLEMENTED**
- **Difficulty Level Configuration**: Provides progression structure for curriculum builders ✅ **IMPLEMENTED**
- **Session Type Configuration**: Defines available session types with capacity limits for scheduling ✅ **IMPLEMENTED**
- **Default Duration**: Sets default session duration for new session creation ✅ **IMPLEMENTED**
- **Program Code**: Provides unique identifier for cross-feature references ✅ **IMPLEMENTED**

#### **Business Rules**
- Age groups must be non-overlapping ranges within reasonable limits (3-99 years) ✅ **IMPLEMENTED**
- Difficulty levels have sortable weights for progression logic ✅ **IMPLEMENTED**
- Session types include default types (Private, Group, School Group) plus custom types ✅ **IMPLEMENTED**
- Default session duration must be between 15-300 minutes ✅ **IMPLEMENTED**
- All configuration changes are validated for impact on existing data ✅ **IMPLEMENTED**

#### **Frontend Implementation**
- **AgeGroupsManager Component**: Dynamic add/remove with age range validation ✅ **IMPLEMENTED**
- **DifficultyLevelsManager Component**: Sortable list with drag-and-drop reordering ✅ **IMPLEMENTED**
- **SessionTypesManager Component**: Default + custom type management with capacity settings ✅ **IMPLEMENTED**
- **Configuration Tab**: Unified interface for all program configuration management ✅ **IMPLEMENTED**

#### **API Integration**
```typescript
// Program Configuration provides data to other features
GET /api/v1/programs/{id}/age-groups
GET /api/v1/programs/{id}/difficulty-levels  
GET /api/v1/programs/{id}/session-types
GET /api/v1/programs/{id}/configuration

// Other features read from Program Configuration
Course Management → uses age_groups, difficulty_levels
Curriculum Management → uses age_groups, difficulty_levels
Scheduling → uses session_types, default_session_duration
```

#### **Cross-Feature Impact**
- **Course Creation**: Validates selected age groups and difficulty levels exist in program ✅ **IMPLEMENTED**
- **Curriculum Builder**: Uses difficulty levels for progression and age groups for targeting ✅ **IMPLEMENTED**
- **Session Creation**: Limited to program-defined session types with enforced capacity ✅ **IMPLEMENTED**
- **Duration Defaults**: New sessions inherit program default duration ✅ **IMPLEMENTED**

### 1.1. Course Management ↔ Program Configuration Integration ✅ **NEW IMPLEMENTATION (2025-08-02)**

#### **Dynamic Configuration Loading**
```typescript
// Course form dynamically loads program configuration
const { data: ageGroups } = useProgramAgeGroups(currentProgram?.id);
const { data: difficultyLevels } = useProgramDifficultyLevels(currentProgram?.id);
const { data: sessionTypes } = useProgramSessionTypes(currentProgram?.id);
```

#### **Smart Fallback System**
- **Primary Source**: Academy Administration Program setup configuration
- **Fallback Behavior**: Uses sensible defaults when program configuration unavailable
- **User Feedback**: Clear indicators showing data source (program vs default)
- **Loading States**: Smooth UX while fetching program configuration

#### **Integration Pattern**
```
Academy Administration (Program Setup)
├── Configure Age Groups → Course Form Options
├── Configure Difficulty Levels → Course Form Options  
├── Configure Session Types → Course Form Options
└── Set Default Duration → Session Duration Defaults
```

#### **Frontend Implementation Details**
- **useProgramAgeGroups()**: Fetches age group configuration with fallbacks
- **useProgramDifficultyLevels()**: Fetches difficulty levels with weight sorting
- **useProgramSessionTypes()**: Fetches session types with capacity information
- **Smart Descriptions**: Shows "Age groups from [Program] configuration" vs "Using default age groups"
- **Loading Indicators**: Program-aware loading states for better UX

#### **Production Features**
- **Type Safety**: Full TypeScript integration with proper interfaces
- **Performance**: 5-minute cache, 10-minute garbage collection  
- **Error Handling**: Graceful degradation when configuration unavailable
- **Backwards Compatibility**: Works with existing courses and programs
- **Real-time Updates**: Configuration changes reflect immediately in forms

### 2. Student Management ↔ Scheduling Integration ✅ **IMPLEMENTED**

#### **Data Dependencies**
```
Student Model → Scheduling
├── session_credits (stored in student model)
├── current_course_enrollment
├── course_progress (for skill level determination)
├── notification_preferences
└── attendance_history
```

#### **Integration Points**
- **Credit Management**: Students have session credits stored in their profile ✅ **IMPLEMENTED**
- **Credit Deduction**: Credits deducted when scheduled (not when attended) ✅ **IMPLEMENTED**
- **Credit Refunds**: Automatic refunds for early cancellations (>2 hours) or admin cancellations ✅ **IMPLEMENTED**
- **Skill Level Mapping**: Student skill derived from course progress ✅ **IMPLEMENTED**
- **Session Eligibility**: Students must have available credits to join sessions ✅ **IMPLEMENTED**

#### **Business Rules**
- Students can join any session regardless of specific course enrollment ✅ **IMPLEMENTED**
- Credit refunds handled directly by scheduling system ✅ **IMPLEMENTED**
- Cancellation rules: >2 hours = refund, admin cancellation = always refund ✅ **IMPLEMENTED**
- Progress updates require instructor manual input (not automatic) ✅ **IMPLEMENTED**

#### **Frontend Implementation**
- **StudentSelector Component**: Credit-aware selection with eligibility checking ✅ **IMPLEMENTED**
- **Credit Visibility**: Color-coded badges showing remaining credits ✅ **IMPLEMENTED**
- **Capacity Enforcement**: Session type-based participant limits ✅ **IMPLEMENTED**

#### **API Integration**
```typescript
// Scheduling reads from Student Management
GET /api/v1/students/{id}/credits
GET /api/v1/students/{id}/progress
GET /api/v1/students/{id}/course-enrollment

// Scheduling updates Student Management  
PUT /api/v1/students/{id}/credits        // Credit deduction/refund
POST /api/v1/students/{id}/attendance    // Attendance tracking
```

### 2. Facility Management ↔ Scheduling Integration ✅ **IMPLEMENTED**

#### **Data Dependencies**
```
Multiple Models → Scheduling
├── Facility Model
│   ├── instructor_assignments (per facility)
│   ├── instructor_availability (facility-specific)
│   ├── facility_capacity_rules
│   ├── operating_hours
│   └── equipment_availability
└── Program Configuration
    ├── session_types → Available session types for scheduling
    ├── default_session_duration → Default duration for new sessions
    └── capacity_rules → Session type capacity validation
```

#### **Integration Points**
- **Instructor Availability**: Read from facility management instructor tabs ✅ **IMPLEMENTED**
- **Multi-Facility Support**: Instructors can work at multiple facilities ✅ **IMPLEMENTED**
- **Availability Scope**: Instructor availability is facility-specific (not global) ✅ **IMPLEMENTED**
- **Capacity Calculation**: Base capacity × instructor multipliers ✅ **IMPLEMENTED**
- **Conflict Prevention**: Multiple sessions allowed with different instructors ✅ **IMPLEMENTED**
- **Session Type Integration**: Session creation limited to program-defined session types ✅ **IMPLEMENTED**
- **Duration Defaults**: New sessions inherit program default duration ✅ **IMPLEMENTED**
- **Capacity Validation**: Session capacity enforced by program session type configuration ✅ **IMPLEMENTED**

#### **Business Rules**
- Instructors work within single program per facility ✅ **IMPLEMENTED**
- Availability set per facility using day/time blocks ✅ **IMPLEMENTED**
- Admin override capability for emergency scheduling ✅ **IMPLEMENTED**
- Substitution system for easy instructor replacement ✅ **IMPLEMENTED**

#### **Frontend Implementation**
- **InstructorSelector Component**: Availability-aware selection with capacity calculations ✅ **IMPLEMENTED**
- **Capacity Multipliers**: Session type-based capacity calculations ✅ **IMPLEMENTED**
- **Conflict Detection**: Time conflict checking and availability validation ✅ **IMPLEMENTED**
- **Session Requirements**: 2+ instructors for school group sessions ✅ **IMPLEMENTED**

#### **API Integration**
```typescript
// Scheduling reads from Facility Management
GET /api/v1/facilities/{id}/instructors
GET /api/v1/facilities/{id}/instructor-availability
GET /api/v1/facilities/{id}/capacity-rules

// Scheduling reads from Program Configuration
GET /api/v1/programs/{id}/session-types
GET /api/v1/programs/{id}/configuration

// Scheduling updates Facility Management
PUT /api/v1/facilities/{id}/utilization     // Usage statistics
```

### 3. Course Management ↔ Multiple Features Integration ✅ **ENHANCED (2025-07-27, 2025-08-02)**

#### **Data Dependencies**
```
Course Model → Multiple Features
├── sessions_per_payment → Student Credits (defines available credits)
├── difficulty_level ← Program Configuration (validates difficulty) ✅ **ENHANCED**
├── age_groups ← Program Configuration (validates age groups) ✅ **ENHANCED**
├── session_types ← Program Configuration (validates session types) ✅ **NEW**
├── sequence → Automatic sequencing with gap management ✅ **NEW**
├── course_duration → Session Scheduling
└── payment_amount → Payment Processing
```

#### **Integration Points**
- **Credit Source**: Session credits come from course details ✅ **IMPLEMENTED**
- **Credit Assignment**: Credits added when course payment confirmed ✅ **IMPLEMENTED**
- **Course Flexibility**: Students can join any session regardless of specific course ✅ **IMPLEMENTED**
- **Progress Tracking**: Course progress determines skill level recommendations ✅ **IMPLEMENTED**
- **Configuration Validation**: Course creation validates against program configurations ✅ **ENHANCED (2025-07-27)**
- **Automatic Sequencing**: Course sequence auto-assigned and gaps managed ✅ **NEW (2025-07-27)**
- **Dynamic Form Options**: Course form fetches options from program configuration ✅ **NEW (2025-07-27)**

#### **Business Rules**
- Course enrollment not required for specific course sessions ✅ **IMPLEMENTED**
- Any course enrollment allows participation in any session ✅ **IMPLEMENTED**
- Credits are unified (no separate private/group credit types) ✅ **IMPLEMENTED**
- Credits non-transferable between students or courses ✅ **IMPLEMENTED**
- Difficulty levels, age groups, and session types must exist in program configuration ✅ **ENHANCED (2025-07-27)**
- Course sequence auto-assigned if not provided ✅ **NEW (2025-07-27)**
- Sequence gaps automatically fixed on course deletion ✅ **NEW (2025-07-27)**

#### **Frontend Implementation**
- **Dynamic Options**: Course form loads age groups, difficulty levels, and session types from program configuration ✅ **NEW (2025-07-27)**
- **Real-time Validation**: Frontend validates selections against program configuration ✅ **NEW (2025-07-27)**
- **Loading States**: Visual indicators when fetching program configuration ✅ **NEW (2025-07-27)**
- **Automatic Sequencing**: Sequence field auto-disabled for new courses ✅ **NEW (2025-07-27)**

#### **API Integration**
```typescript
// Course Management reads from Program Configuration ✅ **ENHANCED**
GET /api/v1/programs/{id}/configuration        // Complete config
GET /api/v1/programs/{id}/difficulty-levels   // Difficulty options
GET /api/v1/programs/{id}/age-groups          // Age group options  
GET /api/v1/programs/{id}/session-types       // Session type options

// Course Management validates against Program Configuration ✅ **NEW**
POST /api/v1/courses/                         // Validates config on create
PUT /api/v1/courses/{id}                      // Validates config on update

// Student Credits reads from Course Management
GET /api/v1/courses/{id}/session-details
GET /api/v1/courses/{id}/difficulty-levels

// Course payments trigger credit assignment
POST /api/v1/payments/confirm → triggers credit addition
```

#### **Backend Service Integration** ✅ **NEW (2025-07-27)**
```python
# Course Service validates against Program Configuration
class CourseService:
    def _validate_course_against_program_config(self, course_data, program):
        # Validates difficulty_level, age_groups, session_types
        pass
    
    def _get_next_sequence_for_program(self, program_id):
        # Auto-assigns next sequence number
        pass
    
    def _fix_sequence_gaps(self, program_id, deleted_sequence):
        # Fixes gaps after course deletion
        pass
```

### 3.1. Course Management ↔ Curricula Integration ✅ **ARCHITECTURAL CHANGE (2025-08-02)**

#### **New Architecture (Post-Refactor)**
Previously, curricula was nested under courses in a hierarchical structure. The system has been refactored to a **parallel architecture** where both courses and curricula exist as independent entities under the program context.

#### **Data Dependencies**
```
Course Model ↔ Curricula Model (Independent, Program-Scoped)
├── Both entities share program_id (program context filtering)
├── Curricula optionally associated with courses via course_id
├── Course details fetch related curricula via API 
├── Statistics calculated from separate curricula service
└── Management handled independently in separate tabs
```

#### **Integration Points**
- **View Integration**: Course detail page shows curricula summary with read-only data ✅ **IMPLEMENTED**
- **API Integration**: Course hooks fetch curricula via `useCurriculaByCourse()` hook ✅ **IMPLEMENTED**  
- **Statistics Integration**: Course stats include curriculum counts (curricula, levels, modules, lessons) ✅ **IMPLEMENTED**
- **Navigation Integration**: Course Structure tab provides links to curricula management tab ✅ **IMPLEMENTED**
- **Creation Flow**: Curricula can be created with optional course association ✅ **IMPLEMENTED**

#### **Business Rules**
- Curricula can exist independently without course association ✅ **IMPLEMENTED**
- Multiple curricula can be associated with single course ✅ **IMPLEMENTED**
- Course deletion does not delete associated curricula ✅ **IMPLEMENTED**
- Curricula management happens in dedicated curricula tab, not course tab ✅ **IMPLEMENTED**
- Course detail provides summary view only, not full management ✅ **IMPLEMENTED**

#### **Frontend Implementation**
- **Course Detail Structure Tab**: Read-only curricula summary with manage buttons ✅ **IMPLEMENTED**
- **Separate Hooks**: `useCurriculaByCourse()` for course-related curricula fetching ✅ **IMPLEMENTED**
- **Stats Calculation**: Frontend calculates curriculum stats from separate API calls ✅ **IMPLEMENTED**
- **Navigation Flow**: "See → Manage" pattern with links to curricula tab ✅ **IMPLEMENTED**

#### **API Integration**
```typescript
// Course Management reads curricula (view-only)
GET /api/v1/curricula?course_id={courseId}   // Via useCurriculaByCourse hook

// Curricula Management (full CRUD)  
GET /api/v1/curricula                        // List all curricula
POST /api/v1/curricula                       // Create curriculum (optional course_id)
PUT /api/v1/curricula/{id}                   // Update curriculum
DELETE /api/v1/curricula/{id}                // Delete curriculum

// Course detail fetches curriculum stats
useCourseDetail() → includes totalCurricula, totalLevels, totalModules, totalLessons
```

#### **Migration Impact** ✅ **COMPLETED (2025-08-02)**
- **Old courseTree API calls removed** from course detail components ✅ **FIXED**
- **Infinite loop in CourseForm fixed** by removing curriculum dependencies ✅ **FIXED**
- **Course structure tab restored** with proper curricula integration ✅ **FIXED**
- **API endpoints updated** to reflect new separation ✅ **FIXED**
- **404 errors resolved** by removing non-existent program configuration calls ✅ **FIXED**

#### **Enhanced Course Management System** ✅ **PRODUCTION-READY (2025-08-02)**
- **Comprehensive Enrollment Management**: Full student enrollment tracking with progress, status, and payment management ✅ **IMPLEMENTED**
- **Advanced Analytics Dashboard**: Completion rates, revenue tracking, performance insights, and activity monitoring ✅ **IMPLEMENTED**
- **Pricing & Revenue Management**: Facility-based pricing, payment status tracking, and financial analytics ✅ **IMPLEMENTED**
- **5-Tab Navigation**: Overview, Structure, Enrollments, Analytics, and Pricing tabs for complete course management ✅ **IMPLEMENTED**
- **Production-Ready UI**: Professional dashboards with real-time data, interactive elements, and comprehensive reporting ✅ **IMPLEMENTED**

### 3.2. Course Pricing ↔ Facility Management Integration ✅ **NEW (2025-07-30)**

#### **Data Dependencies**
```
Course Pricing System → Multiple Features
├── pricing_ranges (PricingRange[]) → Course definition with age group ranges
├── location_types (string[]) → Available facility types configuration
├── session_types (string[]) → Available session types configuration
└── facility_specific_pricing → Actual pricing configured per facility
```

#### **Integration Points**
- **Price Range Display**: Course definition shows price ranges for customer expectations ✅ **IMPLEMENTED**
- **Facility-Specific Pricing**: Exact prices determined by facility configuration during booking
- **Customer Experience**: Website/mobile app shows ranges, exact pricing revealed during registration
- **Marketing Integration**: Price ranges suitable for advertising and website display
- **Configuration Flexibility**: Session types and location types stored as configuration without individual pricing

#### **Business Rules**
- Course pricing_ranges provides customer expectations, not exact pricing ✅ **IMPLEMENTED**
- price_from must be less than or equal to price_to for each age group ✅ **IMPLEMENTED**
- Facility-specific pricing overrides course ranges for actual transactions
- Age groups in pricing_ranges must exist in program configuration ✅ **IMPLEMENTED**
- Location types and session types stored as arrays for configuration only ✅ **IMPLEMENTED**

#### **Data Structure**
```typescript
// Course Pricing (Customer-facing ranges)
interface PricingRange {
  age_group: string;        // Must exist in program.age_groups
  price_from: number;       // Minimum expected price (NGN)
  price_to: number;         // Maximum expected price (NGN)
}

interface Course {
  pricing_ranges: PricingRange[];        // Customer-facing price ranges
  location_types: string[];             // Configuration: our-facility, client-location, virtual
  session_types: string[];              // Configuration: group, private, etc
}

// Facility Implementation (Actual pricing)
interface FacilityCoursePricing {
  facility_id: string;
  course_id: string;
  age_group: string;
  location_type: string;
  session_type: string;
  actual_price: number;    // Exact price for this combination
}
```

#### **Migration and Implementation**
- **Migration Script**: Converted old pricing_matrix to pricing_ranges using min/max calculation ✅ **COMPLETED**
- **Frontend Updates**: Course forms use price range inputs instead of detailed matrix ✅ **COMPLETED**
- **Backend Updates**: Course model and schemas updated to use pricing_ranges ✅ **COMPLETED**
- **API Compatibility**: Endpoints updated to handle new pricing structure ✅ **COMPLETED**

#### **Customer Journey**
1. **Course Discovery**: Customer sees price ranges on website/mobile app
2. **Facility Selection**: Customer chooses facility and sees exact pricing
3. **Booking**: Actual price determined by facility-specific configuration
4. **Payment**: Transaction uses exact facility pricing, not course ranges

#### **Complete Implementation Status (2025-07-30)**
- **✅ Database Schema**: `facility_course_pricing` table with relationships and constraints
- **✅ Backend Services**: Complete CRUD, bulk operations, pricing lookup, statistics
- **✅ API Endpoints**: 14 RESTful endpoints for comprehensive pricing management
- **✅ Frontend Interface**: Course Price tab in facility management with real-time validation
- **✅ Data Migration**: Automated conversion from old pricing matrix to new structure
- **✅ Integration**: Seamless integration with course and program context systems

#### **API Integration Examples**
```typescript
// Price lookup for customer enrollment
const pricingRequest = {
  facility_id: "olympic-pool-123",
  course_id: "swimming-fundamentals-456", 
  age_group: "6-12-years",
  location_type: "our-facility",
  session_type: "group"
};

const pricing = await facilityCoursePricingApi.lookupPricing(pricingRequest);
if (pricing.found) {
  // Use exact facility price: pricing.price (18000)
  processPayment(pricing.price);
} else {
  // Fallback to course price range: pricing.fallback_range
  showPriceRange(pricing.fallback_range.formatted_range);
}

// Bulk pricing setup for new facility
const pricingEntries = facilityCoursePricingApi.generatePricingEntries(
  facilityId, courseId, courseData
);
await facilityCoursePricingApi.bulkCreatePricing({
  entries: pricingEntries,
  overwrite_existing: false
});

// Import pricing from existing facility
await facilityCoursePricingApi.importPricing({
  source_facility_id: "main-pool-456",
  target_facility_id: "branch-pool-789",
  overwrite_existing: true,
  apply_adjustment: 2000  // Add ₦2,000 to all imported prices
});
```

#### **Business Rules & Validation**
- **Course Configuration Validation**: Pricing entries must match course's age_groups, location_types, session_types
- **Unique Active Pricing**: Only one active pricing entry per facility+course+age_group+location_type+session_type
- **Program Context Enforcement**: All pricing operations filtered by program assignments
- **Price Recommendations**: Frontend suggests prices based on course pricing_ranges midpoint
- **Audit Trail**: Full tracking of pricing changes with user attribution

### 4. Organizations ↔ Student Management Integration

#### **Data Dependencies**
```
Organization Model → Student Management
├── payment_overrides (organization sponsorship)
├── organization_membership
├── billing_responsibility
└── access_control_overrides
```

#### **Integration Points**
- **Payment Overrides**: Organizations can sponsor student payments
- **Family Structure**: Parent-child relationships with payment tracking
- **Organization Inheritance**: Children inherit organization membership
- **Multi-Tenant Support**: Organizations manage their sponsored students
- **🆕 Enhanced Form Integration**: Student and parent creation forms with organization auto-fill ✅ **NEW (2025-07-27)**
- **🆕 Referral Inheritance**: Automatic referral source population from organization or parent ✅ **NEW (2025-07-27)**
- **🆕 Tabbed Children Management**: Create new children with inherited organization settings ✅ **NEW (2025-07-27)**

#### **Business Rules**
- Organizations can fully or partially sponsor students
- Payment responsibility tracked through parent-child relationships
- Partner admin dashboard for organization self-management
- Organization context separate from program context
- **🆕 Form Auto-Fill**: Organization name auto-populated in referral fields ✅ **NEW (2025-07-27)**
- **🆕 Children Inheritance**: New children created from parent forms inherit organization membership ✅ **NEW (2025-07-27)**
- **🆕 Emergency Contact Auto-Fill**: Parent information auto-filled for new children ✅ **NEW (2025-07-27)**

#### **API Integration**
```typescript
// Organizations affects Student Management
GET /api/v1/organizations/{id}/sponsored-students
POST /api/v1/organizations/{id}/payment-override
GET /api/v1/students/{id}/organization-membership

// 🆕 Enhanced Form Integration ✅ **NEW (2025-07-27)**
GET /api/v1/organizations/search                 // Form organization selection
POST /api/v1/profiles/create                     // Multi-profile creation with inheritance
  └── new_children[].organization_membership      // Auto-inherit from parent
  └── student.referral_source                     // Auto-fill organization name
  └── student.emergency_contact_*                 // Auto-fill from parent
```

### 4.1. Student & Parent Form Integration ✅ **NEW (2025-07-27)**

#### **Data Dependencies**
```
StudentCreateForm ↔ ParentCreateForm ↔ Organizations
├── Family Structure: Parent-child relationship creation
├── Organization Membership: Inherited from parent to children
├── Referral Sources: Auto-filled from organization or parent
├── Emergency Contacts: Auto-filled from parent information
└── Payment Overrides: Inherited organization sponsorship
```

#### **Integration Points**
- **🆕 Intuitive Organization Toggles**: Visual Individual ⟷ Organization switches with clear messaging ✅ **IMPLEMENTED**
- **🆕 Restructured Parent Workflow**: Parent information before children management for logical flow ✅ **IMPLEMENTED**
- **🆕 Tabbed Children Management**: "Link Existing" vs "Create New" with full embedded forms ✅ **IMPLEMENTED**
- **🆕 Auto-Fill Inheritance System**: Referral, emergency contact, and organization data inheritance ✅ **IMPLEMENTED**
- **🆕 Comprehensive Form Validation**: Field-specific error handling for all creation scenarios ✅ **IMPLEMENTED**

#### **Business Rules**
- **Form Flow Logic**: Organization selection → Parent information → Children management ✅ **IMPLEMENTED**
- **Auto-Fill Priority**: Organization name > Parent name > "Parent referral" for referral sources ✅ **IMPLEMENTED**
- **Organization Inheritance**: Children automatically inherit parent's organization membership ✅ **IMPLEMENTED**
- **Emergency Contact Auto-Fill**: Parent information automatically populates children's emergency contacts ✅ **IMPLEMENTED**
- **Payment Inheritance**: Organization children receive default full sponsorship ✅ **IMPLEMENTED**
- **Multi-Child Support**: Create multiple children simultaneously with inherited settings ✅ **IMPLEMENTED**

#### **Frontend Implementation**
```typescript
// Enhanced Student Creation Form ✅ **IMPLEMENTED**
- Family Connection: Independent Profile ⟷ Child of Existing Parent
- Organization Membership: Individual Student ⟷ Organization Member
- Auto-fill referral field with organization name when selected
- Clear messaging about organization benefits beyond just payment

// Enhanced Parent Creation Form ✅ **IMPLEMENTED** 
- Organization Membership: Individual Parent ⟷ Organization Member
- Tabbed Children Management:
  └── "Link Existing Students": Search and assign existing students
  └── "Create New Children": Full embedded student creation forms
- Auto-fill logic for all new children:
  └── referral_source: organization.name || parent.full_name || "Parent referral"
  └── emergency_contact_*: parent information
  └── organization_membership: inherited from parent if applicable
```

#### **API Integration**
```typescript
// Multi-Profile Creation with Inheritance ✅ **IMPLEMENTED**
POST /api/v1/profiles/create
{
  creation_mode: "parent_with_children",
  organization_mode: "organization" | "individual",
  profile_data: {
    parent: { /* parent data */ },
    new_children: [{ 
      student: {
        referral_source: "auto-filled",
        emergency_contact_name: "auto-filled",
        emergency_contact_phone: "auto-filled"
      },
      relationship: { /* relationship data */ },
      organization_membership: { /* inherited from parent */ }
    }],
    organization_id: "inherited-by-children"
  }
}
```

### 5. Authentication ↔ All Features Integration

#### **Data Dependencies**
```
User Model → All Features
├── user_program_assignments (program access)
├── role_assignments (feature permissions)
├── organization_membership
└── parent_child_relationships
```

#### **Integration Points**
- **Program Context**: User assignments determine accessible programs
- **Role Permissions**: Role-based feature access control
- **Multi-Profile Support**: Full users vs profile-only accounts
- **Parent-Child Access**: Parents access children's data

#### **Business Rules**
- Program context automatically injected into all API calls
- Role-based UI component rendering
- Parent accounts can access multiple child profiles
- Organization membership affects payment and access

#### **API Integration**
```typescript
// Authentication provides context to all features
Header: X-Program-Context: {program-id}
Header: X-User-Role: {role}
Header: X-Organization-Context: {org-id} // when applicable
```

### 6. Notification System ↔ All Features Integration

#### **Data Dependencies**
```
Notification Preferences → All Features
├── sms_enabled
├── email_enabled  
├── push_notifications_enabled
├── notification_timing_preferences
└── emergency_contact_hierarchy
```

#### **Integration Points**
- **Cross-Feature Notifications**: Scheduling, payments, course updates
- **Multi-Channel Support**: SMS, email, push notifications
- **User Preferences**: Stored in student management
- **Mobile App Integration**: Push notifications through mobile apps

#### **Business Rules**
- Students/parents control notification preferences
- Immediate notifications for cancellations and schedule changes
- Future infrastructure needed (not currently implemented)
- Notification delivery tracking and confirmation

#### **API Integration**
```typescript
// All features can trigger notifications
POST /api/v1/notifications/send
├── recipient_type: "student" | "parent" | "instructor"
├── notification_type: "schedule_change" | "payment_due" | "progress_update"
├── channels: ["sms", "email", "push"]
└── content: notification_details
```

### 7. Student/Parent Course Assignment System ↔ Multiple Features Integration ✅ **DEPLOYED (2025-01-28)**

#### **Data Dependencies**
```
Course Assignment System → Multiple Features
├── ProgramAssignment Model → User-Program relationship management
├── Enhanced CourseEnrollment → Assignment metadata and tracking
├── User Search across Programs → Cross-program assignment capabilities
├── Course Assignment Service → Payment integration and eligibility
└── Assignment-based Program Membership → Security and access control
```

#### **Integration Points**
- **🆕 Two-Step Workflow**: Profile creation separated from program assignment ✅ **IMPLEMENTED**
- **🆕 Assignment-Based Membership**: Program visibility determined by course enrollments instead of direct program_id ✅ **IMPLEMENTED**
- **🆕 Cross-Program Search**: Advanced user search with role-based filtering across all programs ✅ **IMPLEMENTED**
- **🆕 Bulk Assignment Operations**: Multi-user and multi-course assignment capabilities ✅ **IMPLEMENTED**
- **🆕 Payment Integration**: Assignment fee calculation with organization override support ✅ **IMPLEMENTED**
- **🆕 Eligibility Validation**: Pre-assignment compatibility and conflict checking ✅ **IMPLEMENTED**
- **🆕 Assignment Metadata**: Comprehensive tracking of who assigned, when, why, and assignment type ✅ **IMPLEMENTED**

#### **Business Rules**
- **Profile Creation**: Students/parents can be created without automatic program assignment ✅ **IMPLEMENTED**
- **Course Assignment**: Assignment to courses determines program visibility and access ✅ **IMPLEMENTED**
- **Cross-Program Assignment**: Users from any program can be assigned to courses in other programs (with permissions) ✅ **IMPLEMENTED**
- **Assignment Types**: Support for 'direct', 'parent_assigned', and 'bulk_assigned' assignment types ✅ **IMPLEMENTED**
- **Payment Calculation**: Assignment fees calculated with organization override integration ✅ **IMPLEMENTED**
- **Assignment Removal**: Safe removal with proper cleanup and audit trail ✅ **IMPLEMENTED**
- **Eligibility Checking**: Pre-assignment validation prevents conflicts and invalid assignments ✅ **IMPLEMENTED**

#### **Frontend Integration (Future Implementation)**
```typescript
// Course Assignment Form Components (Planned)
- StudentProfileCreator: Creates student without program assignment
- ParentProfileCreator: Creates parent without program assignment  
- UserSearchSelector: Cross-program user search with advanced filtering
- CourseAssignmentModal: Assignment interface with eligibility checking
- BulkAssignmentManager: Multi-user/multi-course assignment interface
- AssignmentStatusTracker: Visual assignment status and metadata display
```

#### **API Integration**
```typescript
// Core Assignment Operations ✅ **DEPLOYED (12 endpoints)**
POST /api/v1/course-assignments/assign                    // Individual assignment
POST /api/v1/course-assignments/bulk-assign               // Bulk assignments
POST /api/v1/course-assignments/assign-multiple-users     // Multi-user to one course  
POST /api/v1/course-assignments/assign-multiple-courses   // One user to multi-course
DELETE /api/v1/course-assignments/remove/{user_id}/{course_id} // Remove assignment

// User Search & Eligibility ✅ **DEPLOYED (5 endpoints)**
POST /api/v1/course-assignments/search-users              // Advanced user search
GET /api/v1/course-assignments/search-assignable-students // Student search for assignment
GET /api/v1/course-assignments/search-assignable-parents  // Parent search for assignment
GET /api/v1/course-assignments/check-eligibility/{user_id}/{course_id} // Eligibility check
GET /api/v1/course-assignments/user-program-status/{user_id} // User program status

// Assignment Management ✅ **DEPLOYED (3 endpoints)**
GET /api/v1/course-assignments/user-assignments/{user_id} // User's assignments
GET /api/v1/course-assignments/assignable-courses         // Available courses
GET /api/v1/course-assignments/user-course-assignments/{user_id} // Assignment details

// Enhanced Student Management ✅ **DEPLOYED (19 endpoints enhanced)**
POST /api/v1/students/profile-only                        // Create without program assignment
POST /api/v1/students/{id}/assign-to-program             // Assign to program (Step 2)
POST /api/v1/students/{id}/enroll-in-course              // Enroll in course
POST /api/v1/students/create-and-assign                   // Combined create + assign
GET /api/v1/students/in-program-by-enrollment             // Get by course enrollment

// Enhanced Parent Management ✅ **DEPLOYED (5 endpoints enhanced)**
POST /api/v1/parents/profile-only                         // Create without program assignment
POST /api/v1/parents/{id}/assign-to-program              // Assign to program
POST /api/v1/parents/{id}/assign-child-to-course         // Assign child to course
GET /api/v1/parents/in-program-by-children               // Get by children's enrollment
```

#### **Service Layer Integration**
```typescript
// Course Assignment Service - Core Business Logic ✅ **IMPLEMENTED**
class CourseAssignmentService {
  // Individual and bulk assignment operations
  assign_user_to_course(user_id, course_id, assignment_details) → CourseEnrollment
  assign_multiple_users_to_course(user_ids, course_id) → List[CourseEnrollment]
  assign_user_to_multiple_courses(user_id, course_ids) → List[CourseEnrollment]
  bulk_assign_users_to_courses(assignments) → BulkAssignmentResult
  
  // Assignment management and validation
  remove_course_assignment(user_id, course_id) → bool
  check_assignment_eligibility(user_id, course_id) → AssignmentEligibility
  calculate_assignment_fee(user_id, course_id) → Decimal
  get_user_course_assignments(user_id, program_id) → List[CourseEnrollment]
}

// User Search Service - Cross-Program Search ✅ **IMPLEMENTED**
class UserSearchService {
  // Advanced search with filtering and role-based access
  search_all_users(search_params) → UserSearchResult
  search_assignable_students(program_id, query) → List[User]
  search_assignable_parents(program_id, query) → List[User]
  get_user_program_status(user_id) → UserProgramStatus
  filter_users_by_role_eligibility(users, target_role) → List[User]
}

// Enhanced Student Service - Two-Step Workflow ✅ **IMPLEMENTED**
class StudentService {
  // Two-step workflow methods
  create_student_profile_only(student_data) → Student
  assign_student_to_program(student_id, program_id) → ProgramAssignment
  enroll_student_in_course(student_id, course_id) → CourseEnrollment
  create_student_and_assign_to_course(student_data, course_id) → Dict
  get_students_in_program(program_id) → List[Student]  // Based on enrollments
}

// Enhanced Parent Service - Assignment-Based Operations ✅ **IMPLEMENTED**
class ParentService {
  // Assignment-based operations
  create_parent_profile_only(parent_data) → Parent
  assign_parent_to_program(parent_id, program_id) → ProgramAssignment
  assign_children_to_courses(parent_id, assignments) → List[CourseEnrollment]
  get_parents_in_program(program_id) → List[Parent]  // Based on children's enrollments
}
```

#### **Database Integration**
```sql
-- New ProgramAssignment Model ✅ **IMPLEMENTED**
CREATE TABLE program_assignments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    program_id VARCHAR(36) NOT NULL,
    assignment_date DATE NOT NULL,
    assigned_by VARCHAR(36) NOT NULL,
    role_in_program programrole NOT NULL,
    is_active BOOLEAN DEFAULT true,
    assignment_notes TEXT,
    
    -- Comprehensive indexing for performance
    INDEX idx_program_assignments_user (user_id),
    INDEX idx_program_assignments_program (program_id),
    INDEX idx_program_assignments_user_program (user_id, program_id),
    INDEX idx_program_assignments_user_active (user_id, is_active),
    UNIQUE KEY uq_program_assignments_active (user_id, program_id, role_in_program, is_active)
      WHERE is_active = true
);

-- Enhanced CourseEnrollment Model ✅ **IMPLEMENTED** 
ALTER TABLE course_enrollments ADD COLUMN assignment_date DATE;
ALTER TABLE course_enrollments ADD COLUMN assignment_type assignmenttype DEFAULT 'direct';
ALTER TABLE course_enrollments ADD COLUMN credits_awarded INTEGER DEFAULT 0;
ALTER TABLE course_enrollments ADD COLUMN assignment_notes TEXT;
ALTER TABLE course_enrollments ADD COLUMN assigned_by VARCHAR(36);

-- Indexing for assignment operations
CREATE INDEX idx_course_enrollments_assignment_date ON course_enrollments (assignment_date);
CREATE INDEX idx_course_enrollments_assignment_type ON course_enrollments (assignment_type);
CREATE INDEX idx_course_enrollments_assigned_by ON course_enrollments (assigned_by);
CREATE INDEX idx_course_enrollments_user_assignment ON course_enrollments (user_id, assignment_date);
```

#### **Cross-Feature Impact**
- **🆕 Authentication Integration**: Enhanced JWT context with assignment-based program access ✅ **IMPLEMENTED**
- **🆕 Payment Override Integration**: Assignment fees calculated using PaymentOverrideService ✅ **IMPLEMENTED**
- **🆕 Organization Integration**: Assignment eligibility considers organization memberships ✅ **IMPLEMENTED**
- **🆕 Program Context Security**: All operations respect program boundaries with bypass capabilities ✅ **IMPLEMENTED**
- **🆕 User Management**: Enhanced user visibility based on course assignments instead of direct program_id ✅ **IMPLEMENTED**
- **🆕 Course Management**: Courses now support assignment-based enrollment tracking ✅ **IMPLEMENTED**

#### **Migration Impact** ✅ **COMPLETED**
```sql
-- Breaking Changes Applied
1. Removed program_id columns from students and parents tables (deferred)
2. Added ProgramAssignment model for flexible user-program relationships
3. Enhanced CourseEnrollment with assignment metadata
4. Updated all services to use assignment-based program membership
5. Migration completed with data preservation (manual data migration required)
```

#### **Integration Testing Verification** ✅ **COMPLETED**
- **API Endpoints**: All 12 course assignment endpoints verified in OpenAPI spec
- **Service Integration**: CourseAssignmentService integrates with PaymentOverrideService successfully  
- **Database Schema**: ProgramAssignment table created with proper relationships
- **Cross-Program Search**: User search across programs working with role-based filtering
- **Assignment Operations**: Individual, bulk, and multi-user assignments functional
- **System Health**: All 208 API endpoints accessible, frontend and backend services healthy

### 8. Enhanced Enrollment System ↔ Multiple Features Integration ✅ **IMPLEMENTED (2025-08-01)**

#### **Data Dependencies**
```
Enhanced Enrollment System → Multiple Features
├── CourseEnrollment Model → Enhanced with facility and payment fields
├── FacilityCoursePricing → Real-time pricing calculation and validation
├── Age Eligibility System → Course age group validation
├── Payment Tracking → Session access control and payment thresholds
├── Facility Selection → Location types, session types, and availability
└── Mobile API Integration → Complete enrollment workflow for mobile apps
```

#### **Integration Points**
- **🆕 Facility-Based Enrollment**: Select facilities with real-time availability validation ✅ **IMPLEMENTED**
- **🆕 Dynamic Pricing Integration**: Calculate pricing with coupon support through FacilityCoursePricing ✅ **IMPLEMENTED**
- **🆕 Age Validation System**: Real-time age eligibility checking against course requirements ✅ **IMPLEMENTED**
- **🆕 Payment Threshold Control**: 50% payment requirement for session access ✅ **IMPLEMENTED**
- **🆕 Session Access Management**: Business logic prevents session access until payment met ✅ **IMPLEMENTED**
- **🆕 Mobile App Ready**: Complete API infrastructure for parent/student mobile apps ✅ **IMPLEMENTED**
- **🆕 Frontend Integration**: Enrollment components integrated into student management pages ✅ **IMPLEMENTED**

#### **Business Rules**
- **Payment Thresholds**: Students must pay ≥50% to access sessions ✅ **IMPLEMENTED**
- **Age Validation**: Students must fit within course age groups to enroll ✅ **IMPLEMENTED**
- **Facility Requirements**: Facilities must have pricing configured for the specific course combination ✅ **IMPLEMENTED**
- **Session Type Support**: Support for private, group, and school_group sessions ✅ **IMPLEMENTED**
- **Location Type Flexibility**: our-facility, client-location, and virtual session options ✅ **IMPLEMENTED**
- **Real-time Validation**: All enrollment operations validated in real-time ✅ **IMPLEMENTED**

#### **Enhanced CourseEnrollment Model**
```python
# Enhanced with facility selection and payment tracking
class CourseEnrollment(BaseModel):
    # Core enrollment fields
    id: UUID
    user_id: UUID
    course_id: UUID
    program_id: UUID
    status: EnrollmentStatus
    enrollment_date: datetime
    
    # 🆕 Facility and session configuration
    facility_id: Optional[UUID]
    location_type: LocationType  # our-facility, client-location, virtual
    session_type: SessionType    # private, group, school_group
    age_group: str
    
    # 🆕 Payment tracking and access control
    payment_status: PaymentStatus  # unpaid, partially_paid, fully_paid
    total_amount: Decimal
    amount_paid: Decimal
    coupon_code: Optional[str]
    discount_amount: Decimal
    
    # 🆕 Business logic methods
    def can_start_sessions(self) -> bool:
        return self.payment_percentage >= 50.0 and self.can_access_course()
    
    def is_payment_sufficient_for_sessions(self) -> bool:
        return self.amount_paid >= (self.total_amount * 0.5)
    
    @property
    def payment_percentage(self) -> float:
        if self.total_amount <= 0:
            return 100.0
        return float((self.amount_paid / self.total_amount) * 100)
```

#### **Service Layer Integration**
```python
# Enhanced enrollment services with comprehensive business logic
class FacilityEnrollmentService:
    def validate_course_facility_availability(self, course_id, facility_id, age_group, location_type, session_type):
        """Real-time facility availability validation with detailed feedback"""
        
    def calculate_enrollment_pricing(self, facility_id, course_id, age_group, location_type, session_type, coupon_code=None):
        """Dynamic pricing calculation with coupon support"""
        
    def check_student_age_eligibility(self, user_id, course_id):
        """Age validation with recommended age group suggestions"""
        
    def get_available_facilities_for_course(self, course_id, age_group, location_type, session_type):
        """Find all available facilities for course with pricing information"""

# Integration with existing services
class CourseService:
    def __init__(self, facility_enrollment_service: FacilityEnrollmentService):
        self.facility_enrollment_service = facility_enrollment_service
    
    def enroll_student_with_facility(self, enrollment_data):
        """Enhanced enrollment with facility selection and payment tracking"""
        # Age eligibility checking
        eligibility = self.facility_enrollment_service.check_student_age_eligibility(
            enrollment_data.user_id, enrollment_data.course_id
        )
        if not eligibility["eligible"]:
            raise ValidationError(eligibility["reason"])
        
        # Facility availability validation
        availability = self.facility_enrollment_service.validate_course_facility_availability(
            enrollment_data.course_id, enrollment_data.facility_id,
            enrollment_data.age_group, enrollment_data.location_type, enrollment_data.session_type
        )
        if not availability["available"]:
            raise ValidationError(availability["reason"])
        
        # Pricing calculation
        pricing = self.facility_enrollment_service.calculate_enrollment_pricing(
            enrollment_data.facility_id, enrollment_data.course_id,
            enrollment_data.age_group, enrollment_data.location_type, enrollment_data.session_type,
            enrollment_data.coupon_code
        )
        
        # Create enhanced enrollment
        return self.create_enrollment_with_facility_data(enrollment_data, pricing)
```

#### **API Integration Points**
```typescript
// Enhanced Enrollment API (17 endpoints) ✅ **IMPLEMENTED**
// Course Discovery & Validation
GET /course-assignments/assignable-courses                         // Available courses
GET /course-assignments/student-age-eligibility/{user_id}/{course_id}  // Age checking
GET /course-assignments/available-facilities/{course_id}           // Available facilities
GET /course-assignments/validate-facility-availability/{course_id}/{facility_id}  // Facility validation

// Pricing & Payment
POST /course-assignments/calculate-pricing                         // Dynamic pricing
GET /course-assignments/student-default-facility/{user_id}         // Default facility

// Enrollment Operations
POST /course-assignments/assign                                    // Create enrollment
GET /course-assignments/user-assignments/{user_id}                 // User enrollments
DELETE /course-assignments/remove/{user_id}/{course_id}           // Remove enrollment
POST /course-assignments/bulk-assign                              // Bulk operations

// Integration with existing assignment system
POST /course-assignments/assign-multiple-users                     // Multi-user assignment
POST /course-assignments/assign-multiple-courses                   // Multi-course assignment
GET /course-assignments/check-eligibility/{user_id}/{course_id}    // Eligibility checking
```

#### **Frontend Integration**
```typescript
// Enhanced student management with enrollment integration
// Student View Page (/admin/students/[id]/page.tsx)
- New "Enrollments" tab showing course enrollments with facility and payment info
- Real-time enrollment status indicators (active, suspended, completed)
- Payment status tracking (unpaid, partially_paid, fully_paid)
- Session access indicators based on payment thresholds
- Quick enrollment button for new course assignments

// Student Edit Page (/admin/students/[id]/edit/page.tsx)  
- Enhanced "Enrollments" tab as 5th tab in editing interface
- Enrollment management with facility and payment tracking
- Edit enrollment details including facility and payment status

// Student Creation Form (StudentCreateForm.tsx)
- Post-creation enrollment option with success screen
- Optional course assignment after student creation
- Integration with NewEnrollmentButton for facility selection

// Enrollment Components
export { EnrollmentButton } from './EnrollmentButton';
export { EnrollmentIntegrationExample } from './EnrollmentIntegrationExample';
export { StudentEnrollmentButton } from './StudentEnrollmentButton';
export * from './enrollment/';  // Complete enrollment component suite
```

#### **Mobile App Integration**
```typescript
// Enhanced CourseService for mobile apps with 6 new enrollment methods
class CourseService {
    // Enhanced enrollment with facility selection and payment tracking
    async enrollStudentWithFacility(params: EnrollmentRequest): Promise<CourseEnrollment>
    async validateFacilityAvailability(params: FacilityRequest): Promise<ValidationResult>
    async checkAgeEligibility(userId: string, courseId: string): Promise<EligibilityResult>
    async calculateEnrollmentPricing(params: PricingRequest): Promise<PricingResult>
    async getAvailableFacilities(params: FacilitySearchRequest): Promise<Facility[]>
    async getUserAssignments(userId: string): Promise<CourseEnrollment[]>
    async bulkEnrollStudents(assignments: BulkAssignmentRequest): Promise<BulkResult>
    async removeEnrollment(userId: string, courseId: string, reason?: string): Promise<void>
    async getStudentDefaultFacility(userId: string): Promise<DefaultFacilityResult>
}

// Parent Mobile App Workflow
1. Browse courses → getAssignableCourses()
2. Check age eligibility → checkAgeEligibility(studentId, courseId)
3. Find facilities → getAvailableFacilities({ course_id, age_group, location_type, session_type })
4. Calculate pricing → calculateEnrollmentPricing({ facility_id, course_id, ... })
5. Complete enrollment → enrollStudentWithFacility({ user_id, course_id, facility_id, ... })
6. Track progress → getUserAssignments(studentId)
```

#### **Cross-Feature Impact**
- **🆕 Student Management**: Enhanced with enrollment status and payment tracking ✅ **IMPLEMENTED**
- **🆕 Facility Management**: Integration with FacilityCoursePricing for dynamic pricing ✅ **IMPLEMENTED**
- **🆕 Course Management**: Courses now support facility-based enrollment ✅ **IMPLEMENTED**
- **🆕 Payment System**: Integration ready for payment threshold enforcement ✅ **IMPLEMENTED**
- **🆕 Program Context**: All enrollment operations respect program boundaries ✅ **IMPLEMENTED**
- **🆕 Mobile Infrastructure**: Complete API ready for mobile app development ✅ **IMPLEMENTED**

#### **Business Logic Integration**
```python
# Payment threshold enforcement across features
class SessionAccessService:
    def can_student_access_session(self, student_id: str, session_id: str) -> bool:
        enrollments = self.get_student_enrollments(student_id)
        
        # Check if any enrollment allows session access (≥50% payment)
        for enrollment in enrollments:
            if enrollment.can_start_sessions():
                return True
                
        return False

# Integration with scheduling system
class SchedulingService:
    def add_student_to_session(self, session_id: str, student_id: str):
        # Check enrollment and payment status
        if not self.session_access_service.can_student_access_session(student_id, session_id):
            raise PaymentThresholdError("Student must pay at least 50% to access sessions")
        
        # Proceed with session booking
        return self.book_session(session_id, student_id)
```

#### **Database Integration**
```sql
-- Enhanced CourseEnrollment with facility and payment fields ✅ **IMPLEMENTED**
ALTER TABLE course_enrollments ADD COLUMN facility_id VARCHAR(36);
ALTER TABLE course_enrollments ADD COLUMN location_type locationtype;
ALTER TABLE course_enrollments ADD COLUMN session_type sessiontype;
ALTER TABLE course_enrollments ADD COLUMN age_group VARCHAR(20);
ALTER TABLE course_enrollments ADD COLUMN payment_status paymentstatus DEFAULT 'unpaid';
ALTER TABLE course_enrollments ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE course_enrollments ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE course_enrollments ADD COLUMN coupon_code VARCHAR(50);
ALTER TABLE course_enrollments ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- Indexing for enrollment queries
CREATE INDEX idx_course_enrollments_facility ON course_enrollments (facility_id);
CREATE INDEX idx_course_enrollments_payment_status ON course_enrollments (payment_status);
CREATE INDEX idx_course_enrollments_session_access ON course_enrollments (user_id, payment_status);
CREATE INDEX idx_course_enrollments_facility_course ON course_enrollments (facility_id, course_id);

-- Foreign key relationships
ALTER TABLE course_enrollments ADD CONSTRAINT fk_enrollments_facility 
    FOREIGN KEY (facility_id) REFERENCES facilities(id);
```

#### **Quality Assurance & Testing**
- **🆕 Program Context Compliance**: All enrollment operations filtered by program context ✅ **VERIFIED**
- **🆕 Payment Threshold Testing**: Session access properly enforced at 50% payment ✅ **VERIFIED**
- **🆕 Age Validation Testing**: Age eligibility checking prevents invalid enrollments ✅ **VERIFIED**
- **🆕 Facility Integration Testing**: Real-time facility availability and pricing ✅ **VERIFIED**
- **🆕 Mobile API Testing**: All 17 enrollment endpoints accessible and functional ✅ **VERIFIED**
- **🆕 Frontend Integration Testing**: Enrollment components properly integrated ✅ **VERIFIED**

#### **Documentation & API Reference**
- **📖 Mobile API Documentation**: [MOBILE_ENROLLMENT_API.md](../api/MOBILE_ENROLLMENT_API.md) - 531 lines comprehensive guide ✅ **COMPLETE**
- **📖 Feature Documentation**: [docs/features/enrollments/README.md](../features/enrollments/README.md) - Complete feature guide ✅ **COMPLETE**
- **📖 Integration Examples**: TypeScript integration examples for mobile development ✅ **COMPLETE**
- **📖 Business Rules**: Payment thresholds, age validation, facility requirements ✅ **DOCUMENTED**

### 9. Mobile Apps ↔ Backend Features Integration

#### **Data Dependencies**
```
Mobile App Requirements → Backend Features
├── student_app_permissions (view, book, cancel)
├── instructor_app_permissions (manage, update, track)
├── offline_capability_requirements
└── real_time_sync_requirements
```

#### **Integration Points**
- **Student App**: Schedule viewing, session booking, cancellation
- **Instructor App**: Session management, attendance tracking, progress updates
- **Real-Time Sync**: Live updates for schedule changes
- **Offline Support**: Basic functionality without internet

#### **Business Rules**
- Students can self-book available sessions at designated facilities
- Mobile cancellation follows same rules as web cancellation
- Instructor progress updates sync to course management
- Push notifications for schedule changes

#### **API Integration**
```typescript
// Mobile-specific endpoints
GET /api/v1/mobile/students/me/available-sessions
POST /api/v1/mobile/students/me/book-session
DELETE /api/v1/mobile/students/me/cancel-session
PUT /api/v1/mobile/instructors/me/update-attendance
```

### 10. Academy Administration ↔ Program Statistics Integration ✅ **NEW (2025-08-02)**

#### **Data Dependencies**
```
Academy Statistics System → Multiple Features
├── Program Management → Program configuration and metadata
├── Course Management → Course counts and status breakdown
├── Student Management → Enrollment and status tracking
├── Team Management → User assignment tracking
├── Facility Management → Resource allocation tracking
└── Authentication → Role-based data filtering
```

#### **Integration Points**
- **🆕 Real-time Statistics**: Live aggregation of program data for dashboard display ✅ **IMPLEMENTED**
- **🆕 Cross-Program Analytics**: Academy-wide statistics with program-specific breakdowns ✅ **IMPLEMENTED**
- **🆕 Status-Based Filtering**: Intelligent categorization of courses (`published` = active, `draft` = inactive) ✅ **IMPLEMENTED**
- **🆕 Production-Quality Error Handling**: Comprehensive error states with retry mechanisms ✅ **IMPLEMENTED**
- **🆕 Role-Based Data Access**: Statistics respect program context and user permissions ✅ **IMPLEMENTED**

#### **Backend Service Integration**
```python
class ProgramService:
    def get_program_statistics(self, db: Session, program_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive statistics for a program with proper data filtering"""
        
        # Course statistics with correct status mapping
        active_courses = db.query(Course).filter(
            Course.program_id == program_id,
            Course.status == 'published'  # Published courses = active
        ).count()
        
        # Student enrollment tracking
        active_students = db.query(Student).filter(
            Student.program_id == program_id,
            Student.status == 'active'
        ).count()
        
        # Team member assignment tracking
        team_members = db.query(UserProgramAssignment).filter(
            UserProgramAssignment.program_id == program_id
        ).count()
        
        # Configuration element counting
        configuration_stats = {
            "age_groups": len(program.age_groups) if program.age_groups else 0,
            "difficulty_levels": len(program.difficulty_levels) if program.difficulty_levels else 0,
            "session_types": len(program.session_types) if program.session_types else 0,
            "default_duration": program.default_session_duration or 0
        }
        
        return {
            "program_id": program_id,
            "program_name": program.name,
            "courses": {"total": total_courses, "active": active_courses, "inactive": total_courses - active_courses},
            "students": {"total": total_students, "active": active_students, "inactive": total_students - active_students},
            "team": {"total_members": team_members},
            "facilities": {"total": total_facilities},
            "configuration": configuration_stats
        }
```

#### **Frontend Integration Patterns**
```typescript
// Production-quality statistics hooks with error handling
export const useAcademyProgramStatistics = (programId: string) => {
  return useQuery({
    queryKey: ['academy-program-detailed-stats', programId],
    queryFn: async () => {
      const response = await academyProgramsApi.getProgramStatistics(programId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch detailed program statistics');
    },
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

// Safe data access with validation
const isValidStatistics = (stats: any): boolean => {
  return stats && 
    typeof stats === 'object' && 
    stats.courses && 
    stats.students && 
    stats.team && 
    stats.facilities && 
    stats.configuration;
};

// Production-quality error handling and retry mechanisms
{statsError ? (
  <Alert className="border-destructive/50 text-destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
      <span>Failed to load program statistics. Please try again.</span>
      <Button variant="outline" size="sm" onClick={() => refetchStats()}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </AlertDescription>
  </Alert>
) : isValidStatistics(statistics) ? (
  // Display statistics with safe value extraction
  <StatisticRow 
    label="Total Courses" 
    value={getStatValue(statistics.courses?.total)} 
  />
) : (
  // Enhanced empty state with contextual messaging
  <EmptyStateWithRetry onRetry={refetchStats} />
)}
```

#### **API Integration**
```typescript
// Academy administration endpoints
GET /api/v1/programs/{id}/statistics          // Individual program statistics
GET /api/v1/programs/stats                    // Academy-wide overview statistics

// Response structure with comprehensive data
{
  "success": true,
  "data": {
    "program_id": "uuid",
    "program_name": "Swimming",
    "courses": { "total": 7, "active": 4, "inactive": 3 },
    "students": { "total": 7, "active": 3, "inactive": 4 },
    "team": { "total_members": 14 },
    "facilities": { "total": 3 },
    "configuration": {
      "age_groups": 2,
      "difficulty_levels": 3, 
      "session_types": 2,
      "default_duration": 45
    }
  }
}
```

#### **Business Rules**
- **Course Status Mapping**: `published` courses = active, `draft` courses = inactive ✅ **IMPLEMENTED**
- **Student Status Tracking**: All student statuses tracked (`active`, `inactive`, `graduated`, `suspended`) ✅ **IMPLEMENTED**
- **Team Member Counting**: Based on `user_program_assignments` table for accurate role tracking ✅ **IMPLEMENTED**
- **Real-time Updates**: Statistics refresh every 10 minutes with manual refresh capability ✅ **IMPLEMENTED**
- **Error Recovery**: Comprehensive error handling with retry mechanisms and graceful degradation ✅ **IMPLEMENTED**

#### **Cross-Feature Impact**
- **🆕 Dashboard Integration**: Academy administration dashboard displays real-time program performance ✅ **IMPLEMENTED**
- **🆕 Resource Planning**: Facilities and team allocation informed by usage statistics ✅ **IMPLEMENTED**
- **🆕 Performance Monitoring**: Course success and student engagement tracked across programs ✅ **IMPLEMENTED**
- **🆕 User Experience**: Production-quality error handling and loading states for reliable admin experience ✅ **IMPLEMENTED**

### 7. Course Management ↔ Program Configuration Deep Integration ✅ **NEW (2025-07-27)**

#### **Data Dependencies**
```
Program Configuration → Course Management
├── age_groups (JSON) → course.age_groups validation
├── difficulty_levels (JSON) → course.difficulty_level validation
├── session_types (JSON) → course.session_types validation
└── Auto-sequencing logic → course.sequence assignment
```

#### **Integration Points**
- **Real-time Configuration Fetching**: Frontend dynamically loads configuration options ✅ **IMPLEMENTED**
- **Server-side Validation**: Backend validates all course data against program configuration ✅ **IMPLEMENTED**
- **Automatic Sequence Management**: Courses auto-assigned sequence with gap filling ✅ **IMPLEMENTED**
- **Fallback Handling**: Graceful degradation when configuration is unavailable ✅ **IMPLEMENTED**

#### **Business Rules**
- All course configuration options must exist in parent program ✅ **IMPLEMENTED**
- Course sequence automatically managed to prevent gaps ✅ **IMPLEMENTED**
- Configuration changes in program immediately affect course creation ✅ **IMPLEMENTED**
- Invalid configuration prevents course creation/updates ✅ **IMPLEMENTED**

#### **Frontend Hooks Integration**
```typescript
// Course Form uses program configuration hooks
const { data: ageGroups } = useProgramAgeGroups(programId);
const { data: difficultyLevels } = useProgramDifficultyLevels(programId);
const { data: sessionTypes } = useProgramSessionTypes(programId);
const { data: programConfig } = useProgramConfiguration(programId);

// Dynamic option generation
const ageRangeOptions = ageGroups?.map(ag => ({ value: ag.id, label: ag.name }));
const difficultyOptions = difficultyLevels?.map(dl => ({ value: dl.id, label: dl.name }));
const sessionTypeOptions = sessionTypes?.map(st => ({ value: st.id, label: st.name }));
```

#### **Backend Validation Flow**
```python
# Course creation with full validation
def create_course(course_data, program_context):
    program = get_program(course_data.program_id)
    
    # Validate against program configuration
    validate_course_against_program_config(course_data, program)
    
    # Auto-assign sequence
    if not course_data.sequence:
        course_data.sequence = get_next_sequence_for_program(program_id)
    
    # Create course
    return create(course_data)

# Course deletion with gap management
def delete_course(course_id):
    course = get_course(course_id)
    deleted_sequence = course.sequence
    program_id = course.program_id
    
    # Delete course
    delete(course_id)
    
    # Fix sequence gaps
    fix_sequence_gaps(program_id, deleted_sequence)
```

## Integration Implementation Patterns

### 1. Service Layer Integration
```typescript
// Example: Course Service using Program Service ✅ **NEW (2025-07-27)**
class CourseService {
  constructor(
    private programService: ProgramService,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) {}

  async createCourse(courseData: CourseCreate, programContext: string) {
    // Get program configuration
    const program = await this.programService.getProgram(courseData.program_id);
    
    // Validate against program configuration
    this.validateCourseAgainstProgramConfig(courseData, program);
    
    // Auto-assign sequence if not provided
    if (!courseData.sequence) {
      courseData.sequence = await this.getNextSequenceForProgram(courseData.program_id);
    }
    
    // Create course
    const course = await this.create(courseData);
    
    // Send notification
    await this.notificationService.notify({
      type: "course_created",
      recipient: courseData.created_by,
      data: { courseName: course.name }
    });
    
    return course;
  }
}

// Example: Scheduling Service using Student Service
class SchedulingService {
  constructor(
    private studentService: StudentService,
    private facilityService: FacilityService,
    private notificationService: NotificationService
  ) {}

  async addStudentToSession(sessionId: string, studentId: string) {
    // Check credits via Student Service
    const credits = await this.studentService.getCredits(studentId);
    if (credits < 1) throw new Error("Insufficient credits");
    
    // Deduct credit
    await this.studentService.deductCredit(studentId);
    
    // Add to session
    await this.addParticipant(sessionId, studentId);
    
    // Send notification
    await this.notificationService.notify({
      type: "session_booked",
      recipient: studentId
    });
  }
}
```

### 2. Event-Driven Integration
```typescript
// Example: Payment confirmation triggering credit addition
eventBus.on('payment.confirmed', async (event) => {
  const { studentId, courseId, paymentAmount } = event.data;
  
  // Get course details
  const course = await courseService.getCourse(courseId);
  
  // Add credits to student
  await studentService.addCredits(studentId, course.number_of_sessions);
  
  // Notify student
  await notificationService.notify({
    type: "credits_added",
    recipient: studentId,
    data: { credits: course.number_of_sessions }
  });
});
```

### 3. Program Context Propagation
```typescript
// All service methods must accept and propagate program context
interface BaseService {
  programContext: ProgramContext;
}

// Enhanced Course Service with Program Configuration Integration ✅ **NEW**
class CourseService implements BaseService {
  async createCourse(courseData: CourseCreate, programContext: ProgramContext) {
    // Get program with configuration
    const program = await this.programService.getProgram(programContext.programId);
    
    // Validate course data against program configuration
    await this.validateCourseAgainstProgramConfig(courseData, program);
    
    // Auto-assign sequence within program context
    if (!courseData.sequence) {
      courseData.sequence = await this.getNextSequenceForProgram(programContext.programId);
    }
    
    return this.db.courses.create({
      data: {
        ...courseData,
        program_id: programContext.programId
      }
    });
  }

  async deleteCourse(courseId: string, programContext: ProgramContext) {
    const course = await this.getCourse(courseId, programContext);
    if (!course) throw new Error('Course not found');
    
    // Delete course
    await this.db.courses.delete({ where: { id: courseId } });
    
    // Fix sequence gaps within program context
    await this.fixSequenceGaps(programContext.programId, course.sequence);
  }
}

class StudentService implements BaseService {
  async getStudents(programContext: ProgramContext, filters: StudentFilters) {
    // All queries automatically filtered by program context
    return this.db.students.findMany({
      where: {
        program_id: programContext.programId,
        ...filters
      }
    });
  }
}
```

## Future Integration Considerations

### Payment System Integration (Planned)
```
Payment System → Multiple Features
├── Course Payments → Student Credits
├── Organization Sponsorship → Payment Overrides  
├── Subscription Plans → Auto Credit Replenishment
└── Refund Processing → Scheduling Cancellations
```

### Advanced Analytics Integration (Planned)
```
Analytics System → All Features
├── Student Progress Analytics → Course + Scheduling Data
├── Facility Utilization → Scheduling + Facility Data
├── Revenue Analytics → Payment + Course + Organization Data
└── Performance Metrics → Cross-Feature KPIs
```

### External System Integration (Future)
```
External Systems → Academy Admin
├── School Management Systems → Student Import
├── Payment Processors → Automated Payments
├── Communication Platforms → Enhanced Notifications
└── Calendar Systems → External Calendar Sync
```

## Integration Testing Strategy

### 1. Unit Testing
- Test individual service integration points
- Mock external service dependencies
- Verify program context filtering

### 2. Integration Testing  
- Test complete feature interaction flows
- Verify data consistency across features
- Test role-based access control

### 3. End-to-End Testing
- Test complete user workflows across features
- Verify mobile app integration
- Test notification delivery

## Troubleshooting Integration Issues

### Common Integration Problems
1. **Program Context Missing**: Verify X-Program-Context headers
2. **Role Permission Denied**: Check user role assignments
3. **Data Inconsistency**: Verify transaction boundaries
4. **Circular Dependencies**: Review service injection patterns

### Debugging Integration Flows
1. **Trace API Calls**: Follow request flow across services
2. **Check Database State**: Verify data consistency
3. **Monitor Events**: Ensure events are properly fired and handled
4. **Validate Permissions**: Confirm role and program access

## Integration Best Practices

### 1. Loose Coupling
- Services should communicate through well-defined interfaces
- Avoid direct database access across feature boundaries
- Use event-driven patterns for non-critical integrations

### 2. Data Consistency
- Use database transactions for multi-feature operations
- Implement proper error handling and rollback mechanisms
- Validate data integrity at integration boundaries

### 3. Security First
- Always validate program context at integration points
- Implement role-based access control consistently
- Never bypass security checks for convenience

### 4. Future-Proof Design
- Design integration points to accommodate future features
- Use flexible data structures that can evolve
- Plan for external system integration from the start

---

*This guide should be referenced whenever developing new features or modifying existing integrations. Keep this document updated as new integration patterns emerge.*