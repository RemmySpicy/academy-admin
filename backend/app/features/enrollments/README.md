# Enrollment Management Domain

## Overview

The Enrollment domain is a dedicated architectural domain that handles all enrollment-related functionality in the Academy Admin system. This domain was created to provide a clear separation of concerns and better organization for enrollment operations.

## Domain Responsibilities

### Core Functionality
- **Course Enrollment Management**: Student course assignments and enrollment lifecycle
- **Facility-Based Enrollment**: Integration with facility selection and location-based pricing
- **Payment Tracking**: Payment status management and session access control
- **Program Assignments**: User-program relationship management
- **Enrollment Validation**: Age eligibility, facility availability, and business rule validation

### Key Features
- Multi-step enrollment workflow with facility selection
- Real-time facility availability validation
- Age-based course eligibility checking
- Payment status tracking with session access control
- Coupon code support and discount calculation
- Comprehensive audit trail for all enrollment operations

## Architecture

### Domain Structure
```
/features/enrollments/
├── models/
│   ├── course_enrollment.py     # Enhanced enrollment model
│   └── program_assignment.py    # User-program relationships
├── services/
│   ├── enrollment_service.py    # Core enrollment operations
│   ├── facility_enrollment_service.py  # Facility validation
│   └── user_search_service.py   # User search for enrollment
├── routes/
│   └── enrollments.py           # API endpoints
├── schemas/
│   └── enrollment.py            # Request/response schemas
└── README.md                    # This file
```

### Model Enhancements

#### CourseEnrollment Model
Enhanced with facility selection and payment tracking:
- **Facility Fields**: `facility_id`, `location_type`, `session_type`, `age_group`
- **Payment Fields**: `payment_status`, `total_amount`, `coupon_code`, `discount_amount`
- **Business Logic**: Payment validation, session access control, pricing calculation

#### ProgramAssignment Model
Manages flexible user-program relationships:
- **Role Management**: Student, parent, or both roles
- **Assignment Tracking**: Date, assigner, notes, active status
- **Audit Trail**: Complete assignment history with deactivation tracking

## API Endpoints

### Core Enrollment Operations
- `POST /api/v1/course-assignments/assign` - Create course enrollment
- `POST /api/v1/course-assignments/bulk-assign` - Bulk enrollment operations
- `DELETE /api/v1/course-assignments/remove/{user_id}/{course_id}` - Remove enrollment

### Validation & Availability
- `GET /api/v1/course-assignments/validate-facility-availability/{course_id}/{facility_id}` - Check availability
- `GET /api/v1/course-assignments/student-age-eligibility/{user_id}/{course_id}` - Age validation
- `GET /api/v1/course-assignments/available-facilities/{course_id}` - Available facilities

### Pricing & Calculation
- `POST /api/v1/course-assignments/calculate-pricing` - Calculate enrollment cost
- `GET /api/v1/course-assignments/student-default-facility/{user_id}` - Default facility

### User Management
- `POST /api/v1/course-assignments/search-users` - Search users for enrollment
- `GET /api/v1/course-assignments/user-assignments/{user_id}` - User's enrollments

## Business Rules

### Enrollment Validation
- Students must fit course age groups to enroll
- Facilities must have pricing configured for the specific course combination
- Age group, location type, and session type must be supported by the course

### Payment Requirements
- **Unpaid**: Can enroll but cannot start sessions
- **Partially Paid** (≥50%): Can start sessions and access course content
- **Fully Paid**: Full access to all features

### Session Access Control
- Session access requires enrollment status to be `active` or `paused`
- Payment status must be `partially_paid` or `fully_paid`
- Combined via `can_start_sessions()` method

## Integration Points

### Cross-Domain Dependencies
- **Students Domain**: Student profiles and management
- **Courses Domain**: Course configuration and availability
- **Facilities Domain**: Facility information and pricing
- **Authentication Domain**: User management and relationships

### Frontend Integration
- Multi-step enrollment wizard with facility selection
- Real-time validation and pricing calculation
- Payment status management interface
- Integration buttons for easy enrollment access

## Migration Notes

This domain was created by migrating enrollment functionality from the Students domain to provide better architectural separation. Key migration details:

### Backward Compatibility
- All existing API endpoints maintain the same paths
- No breaking changes to existing functionality
- Frontend integration remains compatible

### Enhanced Features
- Added facility selection with real-time availability
- Enhanced payment tracking with session access control
- Improved enrollment validation with age and facility checks
- Added coupon support for discount management

## Development Guidelines

### Adding New Features
1. Follow the established domain structure
2. Maintain backward compatibility for API changes
3. Include comprehensive validation and error handling
4. Update both backend services and frontend integration
5. Add appropriate tests and documentation

### Service Dependencies
- All enrollment services require database session injection
- Use program context filtering for multi-tenant security
- Follow established error handling patterns
- Maintain audit trail for all enrollment operations

## Future Enhancements

### Planned Features
- Advanced enrollment workflows (approval processes, waitlists)
- Integration with scheduling system for automatic session creation
- Enhanced reporting and analytics for enrollment patterns
- Advanced coupon management with complex discount rules
- Bulk enrollment operations with CSV import/export

### Integration Opportunities
- Payment processing integration for automated payment handling
- Notification system for enrollment status changes
- Reporting dashboard for enrollment analytics
- Mobile app integration for student/parent self-enrollment

---

**Domain Owner**: Enrollment Management Team  
**Last Updated**: 2025-08-01  
**Version**: 1.0.0