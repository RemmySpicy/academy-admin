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

### 1. Student Management ↔ Scheduling Integration ✅ **IMPLEMENTED**

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
Facility Model → Scheduling
├── instructor_assignments (per facility)
├── instructor_availability (facility-specific)
├── facility_capacity_rules
├── operating_hours
└── equipment_availability
```

#### **Integration Points**
- **Instructor Availability**: Read from facility management instructor tabs ✅ **IMPLEMENTED**
- **Multi-Facility Support**: Instructors can work at multiple facilities ✅ **IMPLEMENTED**
- **Availability Scope**: Instructor availability is facility-specific (not global) ✅ **IMPLEMENTED**
- **Capacity Calculation**: Base capacity × instructor multipliers ✅ **IMPLEMENTED**
- **Conflict Prevention**: Multiple sessions allowed with different instructors ✅ **IMPLEMENTED**

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

// Scheduling updates Facility Management
PUT /api/v1/facilities/{id}/utilization     // Usage statistics
```

### 3. Course Management ↔ Student Credits Integration

#### **Data Dependencies**
```
Course Model → Student Credits
├── number_of_sessions (defines available credits)
├── course_difficulty_levels  
├── course_duration
└── payment_amount
```

#### **Integration Points**
- **Credit Source**: Session credits come from course details
- **Credit Assignment**: Credits added when course payment confirmed
- **Course Flexibility**: Students can join any session regardless of specific course
- **Progress Tracking**: Course progress determines skill level recommendations

#### **Business Rules**
- Course enrollment not required for specific course sessions
- Any course enrollment allows participation in any session
- Credits are unified (no separate private/group credit types)
- Credits non-transferable between students or courses

#### **API Integration**
```typescript
// Student Credits reads from Course Management
GET /api/v1/courses/{id}/session-details
GET /api/v1/courses/{id}/difficulty-levels

// Course payments trigger credit assignment
POST /api/v1/payments/confirm → triggers credit addition
```

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

#### **Business Rules**
- Organizations can fully or partially sponsor students
- Payment responsibility tracked through parent-child relationships
- Partner admin dashboard for organization self-management
- Organization context separate from program context

#### **API Integration**
```typescript
// Organizations affects Student Management
GET /api/v1/organizations/{id}/sponsored-students
POST /api/v1/organizations/{id}/payment-override
GET /api/v1/students/{id}/organization-membership
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

### 7. Mobile Apps ↔ Backend Features Integration

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

## Integration Implementation Patterns

### 1. Service Layer Integration
```typescript
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