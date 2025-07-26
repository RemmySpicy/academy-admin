# Scheduling System - Updated Requirements (2025)

## Overview
This document captures the updated scheduling requirements based on detailed business analysis conducted in July 2025. These requirements supersede and refine the original implementation to match actual business needs.

## Key Requirement Changes

### ❌ **Differences from Current Implementation**

The current implementation documented in [`README.md`](./README.md) includes several features that don't match actual business requirements:

1. **Course Integration**: Current system ties sessions to courses, but sessions should be facility-based only
2. **Waitlist System**: Current implementation includes waitlists, but business doesn't need them
3. **Session Types**: Current system uses different session types than required
4. **Credit System**: Not properly integrated with student management
5. **UI Architecture**: Current system uses modals, but full-page forms are required

## ✅ **Updated Business Requirements**

### 1. Session Credit Management

#### **Credit Storage & Management**
- **Location**: Session credits stored in Student model (not separate table)
- **Source**: Credits come from course `number_of_sessions` field
- **Deduction**: Credits deducted when session is scheduled (not attended)
- **Type**: Unified credit system (no private/group credit distinction)
- **Transfer**: Credits are non-transferable between students/courses

#### **Credit Refund Rules**
- **Student Cancellation**: Credit refunded if cancelled >2 hours before session
- **Admin Cancellation**: Credit always refunded when admin/coordinator/instructor cancels
- **Missed Sessions**: No refund for missed sessions without proper cancellation
- **Refund Process**: Scheduling system handles refunds directly

#### **Credit Visibility**
When adding students to sessions, display:
- Remaining session credits
- Current course enrollment
- Course progress (for skill level)
- Student information relevant to session assignment

### 2. Session Types & Capacity

#### **Session Types** (Updated)
- **Private Lessons**: 1-2 participants maximum
- **Group Lessons**: 3-5 participants maximum  
- **School Group Lessons**: Unlimited participants

#### **Capacity Calculation**
- **Base Capacity**: Defined by session type
- **Instructor Multiplier**: Each additional instructor doubles capacity
- **Example**: Group lesson (5 max) + 2 instructors = 10 participants maximum
- **No Minimums**: No minimum participant requirements for any session type

#### **No Waitlist System**
- Remove waitlist functionality from current implementation
- Sessions either have available spots or are full
- Students cannot join full sessions

### 3. Facility-Based Scheduling

#### **Session-Facility Relationship**
- **Primary Context**: Sessions are tied to facilities (not courses)
- **Instructor Pool**: Only instructors assigned to facility can be scheduled
- **Availability**: Instructor availability is facility-specific
- **Multi-Facility**: Instructors can work at multiple facilities with separate availability

#### **Program Context Rules**
- **Session Scope**: Each session serves single program only
- **No Cross-Program**: No participants from different programs in same session
- **Facility Program-Specific**: Each facility serves specific program
- **Instructor Program-Specific**: Instructors work within single program per facility

### 4. Student Selection & Eligibility

#### **Custom Student Selection Component**
Build scheduling-specific student selection (don't reuse from other features):
- **Credit Visibility**: Show remaining session credits
- **Progress Display**: Show current course and progress
- **Skill Level**: Display student skill level derived from course progress
- **Eligibility Check**: Clear indication if student can join (has credits)

#### **Enrollment Flexibility**
- **Any Course**: Students can join sessions regardless of specific course enrollment
- **Credit Requirement**: Students need available session credits to join
- **Skill Matching**: Visual recommendations for skill level appropriateness
- **Admin Override**: Admins can override recommendations

### 5. Difficulty Levels & Skill Mapping

#### **Difficulty System**
- **Source**: Get difficulty levels from Program setup (feature incomplete)
- **Placeholder**: Use placeholder levels until program setup complete
- **Any Level**: Include "Any" difficulty option for flexible scheduling
- **Skill Derivation**: Student skill level derived from course progress

#### **Skill Level Integration**
- **No Automatic Mapping**: Don't map curriculum levels to difficulty levels
- **Progress-Based**: Use student course progress to determine skill appropriateness
- **Instructor Control**: Instructors update progress manually (not automatic)
- **Flexible Assignment**: Admins can assign students to any difficulty level

### 6. User Interface Requirements

#### **Primary Interface Design**
- **Weekly View**: Default interface with Sunday-Saturday tabs
- **Current Day**: Current day tab selected by default
- **Current Week**: Display current week of current month
- **Session Cards**: Detailed session information in list format for selected day

#### **Navigation Requirements**
- **Week Navigation**: Previous/Next week buttons
- **Month Navigation**: Previous/Next month buttons  
- **Month Selector**: Button to view full month and select specific week
- **Day Tabs**: Easy switching between daily views

#### **Monthly Calendar**
- **Overview Purpose**: View entire month at a glance
- **Click-to-Create**: Simple click interaction for session creation
- **Week Selection**: Navigate to specific week from monthly view
- **Calendar Library**: Evaluate shadcn calendar first, fallback to dedicated library

#### **Form Architecture**
- **Full-Page Forms**: Use full-page forms for session creation/editing (not modals)
- **Form Types**: Separate forms for create vs edit vs recurring session management
- **Rich Interactions**: Support for all session configuration options

### 7. Recurring Session Management

#### **Recurring Patterns**
- **Primary**: Weekly recurring sessions
- **Custom Intervals**: Support for configurable recurring patterns
- **End Conditions**: End by date or manual termination
- **No Automatic End**: No "after X sessions" end condition

#### **Exception Handling**
- **Individual Cancellation**: Cancel single instance of recurring session
- **Credit Refund**: Cancelled instances refund student credits
- **Holiday Handling**: Manual cancellation for holidays/breaks
- **Instructor Unavailable**: Handle through cancellation with refund

### 8. Instructor & Availability Integration

#### **Current Implementation Status**
- **Partial Implementation**: Some availability features exist in facility management
- **Needs Completion**: Instructor availability system needs finishing
- **Integration Required**: Scheduling must read from facility instructor availability

#### **Availability Rules**
- **Granularity**: Day/time blocks (not minute-level precision)
- **Facility-Specific**: Separate availability per facility
- **Override Capability**: Admins can schedule outside normal availability
- **Substitution Support**: Easy instructor substitution for existing sessions

#### **Multi-Facility Support**
- **Instructor Assignment**: Instructors can work at multiple facilities
- **Separate Availability**: Different availability schedule per facility
- **Program Context**: Single program per instructor per facility

### 9. Cancellation & Notification System

#### **Cancellation Authority**
- **Students/Parents**: Can cancel through mobile apps with time restrictions
- **Program Admins**: Can cancel anytime
- **Program Coordinators**: Can cancel anytime
- **Instructors**: Can cancel sessions they're assigned to
- **Reason Required**: All cancellations must include reason

#### **Notification Infrastructure** (To Be Built)
- **Current State**: No notification infrastructure exists
- **Required Services**: SMS, email, and push notification services needed
- **Mobile Integration**: Push notifications through mobile apps
- **Immediate Delivery**: Notifications sent immediately unless scheduled

#### **Notification Preferences**
- **User Control**: Students/parents set preferences in Student Management
- **Multi-Channel**: SMS, email, push notifications
- **Event-Based**: Schedule changes, cancellations, credit updates

### 10. Time Management

#### **Session Timing**
- **Flexible Timing**: No predefined time slots (completely flexible)
- **Default Duration**: 1 hour default, customizable per session
- **No Buffer Time**: No required buffer time between sessions
- **Override Support**: Admin can modify any session timing

#### **Conflict Management**
- **Facility Conflicts**: Multiple sessions allowed with different instructors
- **Instructor Conflicts**: Prevent same instructor double-booking
- **Student Conflicts**: Allow students to book overlapping sessions (their choice)

### 11. Mobile App Integration

#### **Student Mobile App**
- **Session Browsing**: View available sessions at designated facility
- **Self-Booking**: Add themselves to appropriate sessions
- **Credit Visibility**: See remaining credits before booking
- **Session Viewing**: View their booked sessions with details
- **Cancellation**: Cancel sessions with reason input and time restrictions

#### **Instructor/Coordinator Mobile App**
- **Session Management**: View and manage assigned sessions
- **Attendance Tracking**: Mark attendance (doesn't auto-update progress)
- **Progress Updates**: Manual student progress updates
- **Schedule Modifications**: Modify session details and participant lists

#### **Mobile Information Display**
- Session title and description
- Date, time, and duration
- Difficulty level information
- Session type (Private/Group/School Group)
- Other participants (with appropriate privacy)
- Instructor information
- Facility details and location

### 12. Integration Requirements

#### **Student Management Integration**
- **Credit Storage**: Session credits in Student model
- **Progress Reading**: Read course progress for skill level
- **Notification Settings**: Read notification preferences
- **Attendance History**: Update attendance records

#### **Facility Management Integration**
- **Instructor Availability**: Read availability from facility instructor tabs
- **Capacity Rules**: Read facility-specific capacity settings
- **Equipment Access**: Access facility equipment information
- **Utilization Tracking**: Update facility usage statistics

#### **Course Management Integration**
- **Credit Source**: Read number_of_sessions from course details
- **Progress Tracking**: Read student course progress
- **Difficulty Levels**: Read from program setup (when complete)
- **Flexible Enrollment**: Any course enrollment allows session participation

## Implementation Priority

### Phase 1: Frontend Core
1. **Weekly Interface**: Tab-based daily view with session cards
2. **Session Creation**: Full-page forms for all session types
3. **Student Selection**: Custom component with credit/progress display
4. **Basic Management**: View, edit, cancel session functionality

### Phase 2: Advanced Features
1. **Recurring Sessions**: Weekly patterns with exception handling
2. **Monthly Calendar**: Full month view with navigation
3. **Instructor Management**: Assignment and substitution interfaces
4. **Credit Integration**: Real-time credit management

### Phase 3: System Integration
1. **Backend Alignment**: Update services to match requirements
2. **Database Updates**: Ensure proper schema and relationships
3. **Mobile APIs**: Endpoints for mobile app integration
4. **Notification System**: Build notification infrastructure

## Success Criteria

### User Experience
- Intuitive weekly view with easy day navigation
- Clear credit visibility and management
- Smooth session creation and editing workflow
- Mobile-friendly interface for future use

### Business Requirements
- Proper credit deduction and refund handling
- Facility-based scheduling with instructor availability
- Program context security and isolation
- Flexible session management for different types

### Technical Quality
- Integration with existing student and facility management
- Proper program context compliance
- Scalable architecture for mobile app integration
- Performance optimization for real-time usage

---

*This document represents the authoritative requirements for scheduling system development. All implementation should align with these requirements rather than the original technical documentation.*