# Facility Management Feature

## Overview
Comprehensive facility management system with program-centric architecture and course pricing integration. Manages physical facilities, equipment, and course-specific pricing configurations.

## Current Implementation Status ✅

### **Fully Implemented & Deployed (2025-07-30)**
- **Physical Facility Management**: Complete CRUD operations for facilities ✅ **PRODUCTION-READY**
- **Equipment & Specifications**: Detailed facility equipment and specifications management ✅ **DEPLOYED**
- **Operating Hours & Contact Management**: Comprehensive facility operational details ✅ **DEPLOYED**
- **🆕 Course Pricing System**: Facility-specific course pricing configuration ✅ **NEW (2025-07-30)**
- **Program Context Filtering**: All facility operations scoped by program assignments ✅ **ACTIVE**
- **Multi-Tab Interface**: Organized facility management with specialized tabs ✅ **ENHANCED**

### **🎯 Latest Feature (2025-07-30): Facility Course Pricing**
Complete implementation of facility-specific course pricing that determines actual customer charges:

- **✅ Database Schema**: `facility_course_pricing` table with full relationships
- **✅ Backend Services**: Complete CRUD, bulk operations, pricing lookup APIs
- **✅ Frontend Interface**: Course Price tab in facility management
- **✅ API Integration**: 14 endpoints for comprehensive pricing management
- **✅ Real-time Validation**: Course configuration awareness and price recommendations

### **Architecture**

#### **🏗️ Facility-Centric Design**
Facilities serve as the physical infrastructure foundation with integrated course pricing:

```
Programs (academy-wide)
└── Facilities (program-scoped)
    ├── Physical Properties (location, capacity, equipment)
    ├── Operational Details (hours, contacts, specifications)
    └── Course Pricing Matrix (actual customer prices)
        └── Per course/age group/location type/session type combinations
```

#### **📊 Two-Tier Pricing System**
```
Course Definition (Marketing Layer)
├── pricing_ranges: Price ranges for customer expectations
└── location_types, session_types: Configuration arrays

Facility Implementation (Transaction Layer)
├── facility_course_pricing: Actual prices customers pay
└── Specific pricing per facility+course+age_group+location+session combination
```

#### **Database Schema**
```sql
# Core Facilities Table
facilities (program-scoped)
├── id (UUID, PK)
├── program_id (UUID, FK → programs.id) ⭐ Program Context
├── name (VARCHAR)
├── facility_type (ENUM: pool, court, gym, field, classroom, lab)
├── capacity (INTEGER)
├── equipment (JSON) - Array of equipment items
├── specifications (JSON) - Activity-specific specifications
├── operating_hours (JSON) - Hours by day of week
├── status (ENUM: active, maintenance, inactive)
└── created_at, updated_at (TIMESTAMP)

# 🆕 Course Pricing Table (NEW 2025-07-30)
facility_course_pricing
├── id (UUID, PK)
├── facility_id (UUID, FK → facilities.id) CASCADE DELETE
├── course_id (UUID, FK → courses.id) CASCADE DELETE
├── age_group (VARCHAR) - Must match course age_groups
├── location_type (VARCHAR) - Must match course location_types  
├── session_type (VARCHAR) - Must match course session_types
├── price (INTEGER) - Actual price in NGN
├── is_active (BOOLEAN) - Active pricing entry
├── notes (TEXT) - Additional pricing notes
├── created_by, updated_by (UUID, FK → users.id)
└── created_at, updated_at (TIMESTAMP)

# Unique constraint: No duplicate active pricing combinations
UNIQUE (facility_id, course_id, age_group, location_type, session_type) 
WHERE is_active = true
```

#### **API Endpoints** (Program Context Filtered)

##### **Core Facility Management**
- `GET /api/v1/facilities/` - List facilities for current program
- `POST /api/v1/facilities/` - Create facility in current program
- `GET /api/v1/facilities/{id}` - Get facility (program access validated)
- `PUT /api/v1/facilities/{id}` - Update facility (program scoped)
- `DELETE /api/v1/facilities/{id}` - Delete facility (program scoped)
- `GET /api/v1/facilities/stats/` - Facility statistics (program filtered)

##### **🆕 Course Pricing Management (NEW 2025-07-30)**
- `GET /api/v1/facilities/pricing/` - List all pricing entries with filtering
- `POST /api/v1/facilities/pricing/` - Create new pricing entry
- `GET /api/v1/facilities/pricing/{id}` - Get specific pricing entry
- `PUT /api/v1/facilities/pricing/{id}` - Update pricing entry
- `DELETE /api/v1/facilities/pricing/{id}` - Delete pricing entry
- `GET /api/v1/facilities/pricing/facility/{id}/pricing` - All pricing for facility
- `GET /api/v1/facilities/pricing/course/{id}/pricing` - All pricing for course
- `POST /api/v1/facilities/pricing/lookup` - Price lookup for enrollment
- `GET /api/v1/facilities/pricing/facility/{id}/matrix` - Complete pricing matrix
- `POST /api/v1/facilities/pricing/bulk-create` - Bulk create pricing entries
- `POST /api/v1/facilities/pricing/bulk-update` - Bulk update pricing entries
- `POST /api/v1/facilities/pricing/import` - Import pricing from other facility
- `GET /api/v1/facilities/pricing/stats` - Pricing statistics and coverage

All endpoints automatically filter by program context via `X-Program-Context` header.

#### **Role-Based Access**
- **Super Admin**: Full access across all programs + academy administration
- **Program Admin**: Full facility management within assigned programs
- **Program Coordinator**: Limited facility access within assigned programs
- **Tutor**: Read-only facility access within assigned programs

### **Frontend Implementation**

#### **Pages**
- **Facility List**: `/admin/facilities/` - Main facility management interface
- **Facility Detail**: `/admin/facilities/[id]/` - Individual facility view
- **Facility Edit**: `/admin/facilities/[id]/edit/` - Edit facility details
- **New Facility**: `/admin/facilities/new/` - Create new facility

#### **Components**
- **Facility Cards**: Visual facility representation with type-specific icons
- **Facility Forms**: Create/edit forms with equipment/amenities management
- **Status Management**: Active/maintenance/inactive status controls
- **Equipment Tracking**: Dynamic equipment list management

#### **Features**
- Program context-aware facility listing
- Facility type filtering (pools, courts, gyms, etc.)
- Equipment and amenities management
- Capacity and availability tracking
- Real-time program context switching

### **Backend Implementation**

#### **Service Layer** (`backend/app/features/facilities/services/`)
- `facility_service.py` - Core facility management with program context
- Program context filtering in all service methods
- Equipment and amenities management
- Facility statistics and reporting

#### **Models** (`backend/app/features/facilities/models/`)
- `facility.py` - Main facility model with program context
- Equipment and amenities as JSON fields
- Facility type enumeration
- Status management with audit trail

#### **Routes** (`backend/app/features/facilities/routes/`)
- Program context dependency injection on all endpoints
- Role-based access decorators
- Automatic program filtering middleware
- Facility statistics endpoints

### **Facility Types Supported**

#### **Aquatic Facilities**
- **Pools**: Swimming pools with lane configurations
- **Equipment**: Lane ropes, starting blocks, timing systems
- **Amenities**: Locker rooms, showers, pool decks

#### **Sports Courts**
- **Basketball Courts**: Indoor/outdoor courts
- **Tennis Courts**: Surface types and lighting
- **Volleyball Courts**: Net systems and court markings

#### **Fitness Areas**
- **Gyms**: Weight rooms and fitness centers
- **Equipment**: Cardio machines, weight equipment, mats
- **Amenities**: Sound systems, mirrors, storage

#### **Outdoor Facilities**
- **Fields**: Soccer, football, baseball fields
- **Equipment**: Goals, bases, field marking equipment
- **Amenities**: Bleachers, dugouts, storage sheds

#### **Educational Spaces**
- **Classrooms**: Traditional learning spaces
- **Labs**: Specialized equipment and safety features
- **Equipment**: Projectors, computers, lab equipment

### **Security Features**
- Program context validation on all facility operations
- Cross-program facility access prevention
- Role-based facility management restrictions
- Automatic program scoping for facility queries

### **Quality Assurance**
- Comprehensive test suite with program context scenarios
- Role-based access control testing
- Cross-program access prevention validation
- Multi-role facility management testing

## Usage Examples

### **Creating a Pool Facility (Program Admin)**
```typescript
// Frontend automatically includes program context
const newPool = await facilityApi.createFacility({
  name: "Olympic Training Pool",
  facility_type: "pool",
  capacity: 50,
  equipment: ["Lane ropes", "Starting blocks", "Timing system"],
  amenities: ["Locker rooms", "Showers", "Pool deck"],
  status: "active"
});
// Backend automatically scopes to current program
```

### **Listing Facilities by Type**
```typescript
// Get all pools in current program
const pools = await facilityApi.getFacilities({ type: "pool" });

// Get facility statistics
const stats = await facilityApi.getFacilityStats();
```

### **Managing Equipment and Amenities**
```typescript
// Update facility equipment
await facilityApi.updateFacility(facilityId, {
  equipment: [...existingEquipment, "New lane timer"],
  amenities: [...existingAmenities, "Updated locker rooms"]
});
```

## Development Guidelines

### **Adding New Facility Features**
1. **Models**: Ensure `program_id` foreign key exists
2. **Services**: Accept `program_context` parameter in all methods
3. **Routes**: Use program context dependency injection
4. **Frontend**: Use program context store for state management
5. **Tests**: Include program context filtering tests

### **Program Context Requirements**
- All facility data must be program-scoped
- Cross-program access only for Super Admin with explicit bypass
- Role-based access validation required
- Program context injection in all API calls

### **Testing Requirements**
- Role-based access control tests
- Program context filtering validation
- Cross-program access prevention tests
- Multi-program facility management scenarios
- Equipment and amenities management tests

## Integration Points

### **Course Integration**
- Facilities can be associated with courses
- Equipment requirements linked to lesson plans
- Capacity planning for course scheduling

### **Scheduling Integration**
- Facility availability for class scheduling
- Equipment booking and reservation
- Maintenance scheduling integration

### **Student Management Integration**
- Facility access permissions by student level
- Safety requirements and certifications
- Usage tracking and analytics

## Future Enhancements
- Facility booking and reservation system
- Maintenance scheduling and tracking
- Equipment lifecycle management
- Facility utilization analytics
- Virtual facility tours
- QR code facility information
- IoT integration for real-time facility monitoring