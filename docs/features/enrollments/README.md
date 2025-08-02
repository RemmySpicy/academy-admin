# Enrollment Feature Documentation

## Overview

The enrollment system provides comprehensive course enrollment functionality with facility selection, payment tracking, and real-time validation. This feature enables seamless course registration for students with enhanced business logic including age eligibility, facility availability, and payment-based session access control.

## Key Features

### 🎯 **Enhanced Course Enrollment**
- **Facility Selection**: Choose from available facilities with location types (our-facility, client-location, virtual)
- **Session Types**: Support for private, group, and school_group sessions
- **Age Validation**: Real-time age eligibility checking against course requirements
- **Dynamic Pricing**: Real-time pricing calculation with coupon support
- **Payment Tracking**: Payment status monitoring with session access control

### 💳 **Payment & Access Control**
- **Payment Thresholds**: 50% minimum payment required for session access
- **Payment Status Tracking**: unpaid, partially_paid, fully_paid
- **Session Access Control**: Business logic prevents session access until payment threshold met
- **Coupon Support**: Discount code validation and pricing calculation

### 🏗️ **Architecture Integration**
- **Domain Separation**: Enrollment as dedicated domain with proper service boundaries
- **Program Context**: Full program context compliance and filtering
- **Database Integration**: Enhanced CourseEnrollment model with facility and payment fields
- **API Endpoints**: 17 comprehensive endpoints for all enrollment operations

## Domain Architecture

### Model Structure
```python
# Enhanced CourseEnrollment Model
class CourseEnrollment(BaseModel):
    # Core enrollment fields
    id: UUID
    user_id: UUID
    course_id: UUID
    program_id: UUID
    status: EnrollmentStatus
    enrollment_date: datetime
    
    # Facility and session configuration
    facility_id: Optional[UUID]
    location_type: LocationType  # our-facility, client-location, virtual
    session_type: SessionType    # private, group, school_group
    age_group: str
    
    # Payment tracking
    payment_status: PaymentStatus  # unpaid, partially_paid, fully_paid
    total_amount: Decimal
    amount_paid: Decimal
    coupon_code: Optional[str]
    discount_amount: Decimal
    
    # Business logic methods
    def can_start_sessions(self) -> bool:
        return self.payment_percentage >= 50.0
    
    def is_payment_sufficient_for_sessions(self) -> bool:
        return self.amount_paid >= (self.total_amount * 0.5)
```

### Service Architecture
```python
# Facility Enrollment Service
class FacilityEnrollmentService:
    def validate_course_facility_availability(
        self, course_id: str, facility_id: str, 
        age_group: str, location_type: str, session_type: str
    ) -> Dict[str, Any]:
        """Real-time facility availability validation"""
    
    def calculate_enrollment_pricing(
        self, facility_id: str, course_id: str, 
        age_group: str, location_type: str, session_type: str,
        coupon_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """Dynamic pricing calculation with coupon support"""
    
    def check_student_age_eligibility(
        self, user_id: str, course_id: str
    ) -> Dict[str, Any]:
        """Age validation against course requirements"""
```

## API Endpoints

### Course Discovery & Validation
- `GET /course-assignments/assignable-courses` - Get available courses
- `GET /course-assignments/student-age-eligibility/{user_id}/{course_id}` - Check age eligibility
- `GET /course-assignments/available-facilities/{course_id}` - Get available facilities
- `GET /course-assignments/validate-facility-availability/{course_id}/{facility_id}` - Validate facility

### Pricing & Payment
- `POST /course-assignments/calculate-pricing` - Calculate enrollment pricing
- `GET /course-assignments/student-default-facility/{user_id}` - Get default facility

### Enrollment Operations
- `POST /course-assignments/assign` - Create enrollment with facility selection
- `GET /course-assignments/user-assignments/{user_id}` - Get user's enrollments
- `DELETE /course-assignments/remove/{user_id}/{course_id}` - Remove enrollment
- `POST /course-assignments/bulk-assign` - Bulk enrollment operations

## Frontend Integration

### Admin Dashboard
The enrollment system is integrated into the student management interface:

#### Student View Page (`/admin/students/[id]/page.tsx`)
- **Enrollments Tab**: New tab showing student's course enrollments
- **Enrollment Status**: Real-time enrollment status with payment indicators
- **Progress Tracking**: Course progress with facility and session information
- **Quick Enrollment**: One-click enrollment button for new course assignments

#### Student Edit Page (`/admin/students/[id]/edit/page.tsx`)
- **Enrollments Management**: 5th tab in student editing interface
- **Enrollment History**: View and manage existing enrollments
- **Payment Status**: Track payment status and session access

#### Student Creation Form (`StudentCreateForm.tsx`)
- **Post-Creation Enrollment**: Optional enrollment step after student creation
- **Success Screen**: Enrollment option with success confirmation
- **Integration Flow**: Seamless transition from student creation to course enrollment

### Component Architecture
```typescript
// Enrollment Components
export { EnrollmentButton } from './EnrollmentButton';
export { EnrollmentIntegrationExample } from './EnrollmentIntegrationExample';
export { StudentEnrollmentButton } from './StudentEnrollmentButton';
export * from './enrollment/';  // Complete enrollment component suite
```

## Mobile App Integration

### Parent/Student App Features
- **Course Browser**: Browse available courses with age eligibility checking
- **Facility Selection**: Choose preferred facilities with real-time availability
- **Pricing Calculator**: Dynamic pricing with coupon code support
- **Enrollment Process**: Complete enrollment with payment tracking
- **Progress Monitoring**: Track enrollment status and session access

### API Client Integration
The shared API client (`CourseService.ts`) includes comprehensive enrollment methods:

```typescript
// Enhanced enrollment methods
enrollStudentWithFacility(params): Promise<CourseEnrollment>
validateFacilityAvailability(params): Promise<ValidationResult>
checkAgeEligibility(userId, courseId): Promise<EligibilityResult>
calculateEnrollmentPricing(params): Promise<PricingResult>
getAvailableFacilities(params): Promise<Facility[]>
getUserAssignments(userId): Promise<CourseEnrollment[]>
bulkEnrollStudents(assignments): Promise<BulkResult>
```

## Business Rules

### Payment & Session Access
- **Unpaid (0%)**: Can enroll but cannot start sessions
- **Partially Paid (≥50%)**: Can start sessions and access course content
- **Fully Paid (100%)**: Full access to all features

### Age Group Validation
- Students must fit within course age groups to enroll
- System recommends appropriate age groups based on student age
- Flexible age group matching allows some overlap

### Facility Requirements
- Facilities must have pricing configured for the specific course combination
- Age group, location type, and session type must be supported
- Real-time availability checking prevents enrollment conflicts

### Session Types
- **Private**: One-on-one instruction with premium pricing
- **Group**: Small group sessions (typically 4-8 students)
- **School Group**: Large group sessions for institutional clients

### Location Types
- **Our Facility**: Sessions at academy-owned facilities
- **Client Location**: Sessions at client's preferred location (additional fees may apply)
- **Virtual**: Online/remote sessions with digital resources

## Testing & Quality Assurance

### Test Coverage
- **Model Tests**: CourseEnrollment business logic and validation
- **Service Tests**: Facility validation, pricing calculation, age eligibility
- **API Tests**: All 17 enrollment endpoints with comprehensive scenarios
- **Integration Tests**: Frontend-backend integration with real enrollment flows

### Quality Assurance
- **Program Context Compliance**: All operations properly filtered by program context
- **Security Validation**: Role-based access control and data isolation
- **Error Handling**: Comprehensive error responses with user-friendly messages
- **Performance**: Optimized queries with proper indexing and caching

## Development Workflow

### Adding New Enrollment Features
1. **Model Updates**: Extend CourseEnrollment model with new fields
2. **Service Logic**: Add business logic to FacilityEnrollmentService
3. **API Endpoints**: Create new routes with program context compliance
4. **Frontend Integration**: Update enrollment components and hooks
5. **Mobile API**: Extend shared API client with new methods
6. **Documentation**: Update API documentation and integration guides

### Testing Checklist
- [ ] Model validation and business rules
- [ ] Service method functionality
- [ ] API endpoint accessibility and responses
- [ ] Frontend component integration
- [ ] Mobile API client methods
- [ ] Program context filtering
- [ ] Payment threshold enforcement
- [ ] Age eligibility validation
- [ ] Facility availability checking

## Future Enhancements

### Phase 1: Enhanced Features
- **Waitlist Management**: Handle enrollment when facilities are full
- **Recurring Enrollments**: Support for recurring course sessions
- **Family Discounts**: Multi-child enrollment discounts
- **Payment Plans**: Installment payment options

### Phase 2: Advanced Integration
- **Calendar Integration**: Automatic session scheduling
- **Notification System**: Enrollment status and payment reminders
- **Analytics Dashboard**: Enrollment trends and facility utilization
- **Mobile Wallet**: Digital payment integration

### Phase 3: AI & Automation
- **Smart Recommendations**: AI-powered course and facility suggestions
- **Predictive Pricing**: Dynamic pricing based on demand and availability
- **Automatic Scheduling**: AI-optimized facility and instructor scheduling
- **Fraud Detection**: Payment and enrollment fraud prevention

## Support & Documentation

### Additional Resources
- **API Documentation**: [MOBILE_ENROLLMENT_API.md](../../api/MOBILE_ENROLLMENT_API.md)
- **Integration Guide**: [FEATURE_INTEGRATION_GUIDE.md](../../architecture/FEATURE_INTEGRATION_GUIDE.md)
- **Mobile Features**: [MOBILE_APP_PROGRESSION_FEATURES.md](../../../MOBILE_APP_PROGRESSION_FEATURES.md)
- **Database Schema**: [DATABASE_SCHEMA.md](../../architecture/DATABASE_SCHEMA.md)

### Development Support
For questions about enrollment feature development:
1. Review this documentation and related guides
2. Check API endpoint documentation for usage examples
3. Examine existing enrollment components for implementation patterns
4. Run quality assurance tools to ensure compliance

The enrollment system provides a robust foundation for course registration with comprehensive business logic, payment tracking, and facility management capabilities.