# Scheduling System - Implementation Plan

## Overview
This implementation plan details the step-by-step approach to building the scheduling system according to the updated 2025 requirements. The plan prioritizes frontend development first, followed by backend updates, then database setup.

## Implementation Strategy

### **Frontend-First Approach**
1. Build UI components and workflows first
2. Use mock data and existing API endpoints where possible
3. Identify backend gaps during frontend development
4. Update backend services based on frontend needs
5. Setup database and migrations last

### **Integration-Aware Development**
- Reference **Feature Integration Guide** for all integration points
- Update integration documentation when adding new integration patterns
- Ensure program context compliance throughout
- Test integration points continuously

## Phase 1: Frontend Core Implementation

### **1.1 Calendar Library Evaluation**

#### **Evaluate shadcn Calendar Component**
```bash
# Test shadcn calendar capabilities
npm install @shadcn/ui
```

**Evaluation Criteria:**
- Monthly view with clickable dates
- Week selection and navigation
- Custom day rendering
- Event display capabilities
- Mobile responsiveness
- Integration with existing design system

**Fallback Options:**
- React Big Calendar (if shadcn insufficient)
- FullCalendar React (for advanced features)
- Custom calendar component (if specific needs)

#### **Decision Matrix**
| Feature | shadcn | React Big Calendar | FullCalendar |
|---------|---------|-------------------|--------------|
| Monthly View | ✓ | ✓ | ✓ |
| Week Navigation | ? | ✓ | ✓ |
| Design Integration | ✓ | ⚠️ | ⚠️ |
| Customization | ✓ | ✓ | ✓ |
| Bundle Size | ✓ | ⚠️ | ❌ |
| Mobile Support | ✓ | ✓ | ⚠️ |

### **1.2 Core Component Architecture**

#### **Component Hierarchy**
```
SchedulingDashboard
├── SchedulingHeader (title, navigation)
├── ViewToggle (weekly/monthly)
├── WeeklyView (default)
│   ├── WeekNavigation (prev/next week, month selector)
│   ├── DayTabs (Sunday-Saturday)
│   └── SessionCardList (sessions for selected day)
│       └── SessionCard (individual session details)
├── MonthlyView (month overview)
│   ├── MonthNavigation (prev/next month)
│   ├── CalendarGrid (month calendar)
│   └── WeekSelector (click week to navigate)
└── SessionManagement
    ├── CreateSessionForm (full-page)
    ├── EditSessionForm (full-page)
    ├── RecurringSessionManager (full-page)
    └── StudentSelector (custom component)
```

#### **State Management Strategy**
```typescript
// Global scheduling state
interface SchedulingState {
  selectedFacility: string;
  currentView: 'weekly' | 'monthly';
  selectedDate: Date;
  selectedWeek: { start: Date; end: Date };
  selectedMonth: Date;
  sessions: Session[];
  loading: boolean;
  error: string | null;
}

// Use TanStack Query for data management
const useSchedulingSessions = (facilityId: string, dateRange: DateRange) => {
  return useQuery({
    queryKey: ['scheduling', 'sessions', facilityId, dateRange],
    queryFn: () => schedulingApi.getSessions(facilityId, dateRange),
    enabled: !!facilityId,
  });
};
```

### **1.3 Weekly View Implementation**

#### **DayTabs Component**
```typescript
interface DayTabsProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weekStart: Date;
}

// Features:
// - Sunday to Saturday tabs
// - Current day highlighted
// - Session count badges per day
// - Mobile-responsive tabs
```

#### **SessionCard Component**
```typescript
interface SessionCardProps {
  session: Session;
  onEdit: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onAddParticipants: (sessionId: string) => void;
  onViewParticipants: (sessionId: string) => void;
}

// Features:
// - Session type badge (Private/Group/School Group)
// - Time and duration display
// - Instructor information
// - Participant count with capacity
// - Difficulty level indicator
// - Action buttons (context-based)
```

#### **WeekNavigation Component**
```typescript
interface WeekNavigationProps {
  currentWeek: { start: Date; end: Date };
  onWeekChange: (direction: 'prev' | 'next') => void;
  onMonthSelect: () => void;
  onTodayClick: () => void;
}

// Features:
// - Previous/Next week buttons
// - Current week display
// - "Today" quick navigation
// - Month selector trigger
```

### **1.4 Session Creation Forms**

#### **CreateSessionForm Component**
```typescript
interface CreateSessionFormProps {
  facilityId: string;
  initialDate?: Date;
  onSubmit: (sessionData: CreateSessionData) => void;
  onCancel: () => void;
}

// Form Fields:
// - Basic Information (title, description, date, time, duration)
// - Session Type (Private/Group/School Group)
// - Difficulty Level (with "Any" option)
// - Instructor Selection (facility-specific)
// - Initial Participants (optional)
// - Recurring Settings (weekly pattern, end date)
```

#### **Form Validation Schema**
```typescript
const createSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date(),
  startTime: z.string(),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
  sessionType: z.enum(['private', 'group', 'school_group']),
  difficultyLevel: z.string(),
  instructorIds: z.array(z.string()).min(1, "At least one instructor required"),
  participantIds: z.array(z.string()).optional(),
  recurring: z.object({
    enabled: z.boolean(),
    pattern: z.enum(['weekly', 'custom']),
    endDate: z.date(),
    customDays: z.array(z.number()).optional(),
  }).optional(),
});
```

### **1.5 Student Selection Component**

#### **StudentSelectorDialog Component**
```typescript
interface StudentSelectorDialogProps {
  facilityId: string;
  sessionType: SessionType;
  difficultyLevel: string;
  onStudentsSelect: (studentIds: string[]) => void;
  onClose: () => void;
}

// Features:
// - Search and filter students
// - Credit visibility per student
// - Course enrollment display
// - Skill level matching indicators
// - Eligibility warnings (no credits)
// - Multi-select with capacity limits
```

#### **StudentCard Component (for selection)**
```typescript
interface StudentCardProps {
  student: Student;
  remainingCredits: number;
  courseInfo: CourseEnrollment;
  skillLevel: string;
  isEligible: boolean;
  isSelected: boolean;
  onToggleSelect: (studentId: string) => void;
}

// Display:
// - Student name and photo
// - Remaining session credits (prominent)
// - Current course and progress
// - Skill level compatibility
// - Eligibility status (clear warning if no credits)
```

## Phase 2: Advanced Frontend Features

### **2.1 Monthly Calendar View**

#### **MonthlyCalendar Component**
```typescript
interface MonthlyCalendarProps {
  selectedMonth: Date;
  sessions: Session[];
  onDateClick: (date: Date) => void;
  onWeekClick: (weekStart: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

// Features:
// - Full month grid view
// - Session indicators on dates (dots/badges)
// - Click date to create session
// - Click week to navigate to weekly view
// - Today highlighting
// - Different colors for session types
```

#### **Calendar Integration**
- Evaluate and implement chosen calendar library
- Custom day cell rendering with session indicators
- Mobile-responsive calendar layout
- Integration with existing design system

### **2.2 Recurring Session Management**

#### **RecurringSessionManager Component**
```typescript
interface RecurringSessionManagerProps {
  recurringSeriesId: string;
  onUpdateSeries: (updates: RecurringSeriesUpdate) => void;
  onCancelSeries: (reason: string) => void;
  onUpdateInstance: (instanceId: string, updates: SessionUpdate) => void;
}

// Features:
// - Series overview with all instances
// - Bulk edit capabilities
// - Individual instance exceptions
// - Cancellation management with refunds
// - End date modification
```

### **2.3 Session Management Actions**

#### **SessionActionMenu Component**
```typescript
interface SessionActionMenuProps {
  session: Session;
  userRole: UserRole;
  onEdit: () => void;
  onCancel: () => void;
  onDuplicate: () => void;
  onAddParticipants: () => void;
  onRemoveParticipants: () => void;
  onSubstituteInstructor: () => void;
}

// Context-based actions based on user role
// Program Admin: All actions
// Program Coordinator: Student-focused actions
// Instructor: Limited to assigned sessions
```

## Phase 3: Backend Service Updates

### **3.1 Service Layer Modifications**

#### **Update SchedulingService**
```python
class SchedulingService:
    def __init__(
        self,
        db: Session,
        student_service: StudentService,
        facility_service: FacilityService,
        notification_service: NotificationService
    ):
        self.db = db
        self.student_service = student_service
        self.facility_service = facility_service
        self.notification_service = notification_service

    async def create_session(
        self,
        session_data: CreateSessionRequest,
        program_context: ProgramContext
    ) -> Session:
        # Validate facility belongs to program
        # Check instructor availability
        # Create session with proper program context
        # Handle initial participant assignment
        # Send notifications
        pass

    async def add_participants(
        self,
        session_id: str,
        student_ids: List[str],
        program_context: ProgramContext
    ) -> None:
        # Check session capacity
        # Validate student credits via StudentService
        # Deduct credits
        # Add participants
        # Send notifications
        pass
```

#### **Integration with StudentService**
```python
class StudentService:
    async def get_session_credits(self, student_id: str) -> int:
        """Get remaining session credits for student"""
        pass

    async def deduct_session_credit(self, student_id: str) -> None:
        """Deduct one session credit"""
        pass

    async def refund_session_credit(self, student_id: str, reason: str) -> None:
        """Refund one session credit"""
        pass

    async def get_student_eligibility(
        self, 
        student_id: str, 
        session_type: SessionType,
        difficulty_level: str
    ) -> StudentEligibility:
        """Check if student is eligible for session"""
        pass
```

### **3.2 API Endpoint Updates**

#### **New Endpoints Needed**
```python
# Session credit management
GET /api/v1/students/{student_id}/credits
PUT /api/v1/students/{student_id}/credits/deduct
PUT /api/v1/students/{student_id}/credits/refund

# Student selection for scheduling
GET /api/v1/scheduling/students/eligible
POST /api/v1/scheduling/students/search

# Facility instructor availability
GET /api/v1/facilities/{facility_id}/instructor-availability
GET /api/v1/facilities/{facility_id}/instructors/available

# Session management with credit integration
POST /api/v1/scheduling/sessions/  # Updated with credit handling
PUT /api/v1/scheduling/sessions/{session_id}/participants  # With credit logic
```

### **3.3 Notification Service Integration**

#### **Notification Events**
```python
class NotificationEvents:
    SESSION_SCHEDULED = "session_scheduled"
    SESSION_CANCELLED = "session_cancelled" 
    SESSION_MODIFIED = "session_modified"
    PARTICIPANT_ADDED = "participant_added"
    PARTICIPANT_REMOVED = "participant_removed"
    CREDITS_REFUNDED = "credits_refunded"
    INSTRUCTOR_ASSIGNED = "instructor_assigned"
```

## Phase 4: Database Setup and Migrations

### **4.1 Database Schema Verification**

#### **Check Existing Tables**
```sql
-- Verify scheduling tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%session%';

-- Check for missing foreign keys
SELECT * FROM scheduled_sessions WHERE id IS NOT NULL LIMIT 1;
```

#### **Create Missing Migrations**
```python
# Migration: Add session_credits to students table
def upgrade():
    op.add_column('students', sa.Column('session_credits', sa.Integer(), default=0))
    
# Migration: Update scheduled_sessions for new requirements
def upgrade():
    op.add_column('scheduled_sessions', sa.Column('difficulty_level', sa.String()))
    op.add_column('scheduled_sessions', sa.Column('session_type', sa.Enum('private', 'group', 'school_group')))
```

### **4.2 Data Migration Scripts**

#### **Migrate Existing Data**
```python
# Migrate existing sessions to new format
def migrate_session_types():
    # Convert existing session types to new enum values
    # Update capacity rules based on new session types
    # Ensure program context compliance
    pass

# Initialize student credits from course enrollments
def initialize_student_credits():
    # Get all course enrollments
    # Add session credits based on course number_of_sessions
    # Handle existing students who haven't used credits
    pass
```

## Implementation Timeline

### **Week 1: Frontend Core**
- Day 1-2: Calendar library evaluation and selection
- Day 3-4: Weekly view implementation (DayTabs, SessionCard, WeekNavigation)
- Day 5-6: Session creation form (basic version)
- Day 7: Student selection component (basic version)

### **Week 2: Advanced Frontend**
- Day 1-2: Monthly calendar view
- Day 3-4: Recurring session management
- Day 5-6: Enhanced session management actions
- Day 7: Mobile responsiveness and polish

### **Week 3: Backend Integration**
- Day 1-2: Service layer updates
- Day 3-4: API endpoint modifications
- Day 5-6: Integration testing
- Day 7: Database setup and migrations

### **Week 4: Testing and Polish**
- Day 1-2: End-to-end testing
- Day 3-4: Performance optimization
- Day 5-6: Bug fixes and refinements
- Day 7: Documentation updates

## Success Metrics

### **User Experience Metrics**
- Session creation time < 2 minutes
- Calendar navigation feels smooth and responsive
- Student selection workflow is intuitive
- Mobile interface is usable (even if not optimized)

### **Technical Metrics**
- All API responses < 500ms
- No program context violations
- Credit deduction/refund accuracy 100%
- Real-time UI updates when data changes

### **Business Metrics**
- Proper credit management (no lost credits)
- Facility utilization tracking accuracy
- Instructor availability integration working
- Notification delivery (when infrastructure built)

## Risk Mitigation

### **Technical Risks**
- **Calendar Library Issues**: Have fallback options ready
- **Integration Complexity**: Build incrementally with testing
- **Performance Problems**: Monitor and optimize early

### **Business Risks**
- **Requirement Changes**: Maintain flexible architecture
- **User Adoption**: Focus on intuitive workflows
- **Data Migration**: Backup data before migrations

### **Implementation Risks**
- **Timeline Pressure**: Prioritize core functionality first
- **Scope Creep**: Stick to defined requirements
- **Team Coordination**: Regular communication and updates

---

*This implementation plan will be updated as development progresses. All changes to integration patterns must be reflected in the Feature Integration Guide.*