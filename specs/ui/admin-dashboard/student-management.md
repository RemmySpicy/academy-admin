# Student Management UI Specification

## Interface Overview

The student management interface provides comprehensive tools for managing student profiles, parent relationships, enrollment workflows, and tracking student progress. It serves as the central hub for all student-related operations in the Academy Admin system.

## User Flow

### Student Management Flow
1. **Access**: Navigate to Students section from main menu
2. **Browse**: View searchable list of all students
3. **Filter**: Apply filters by status, program, location, age
4. **Details**: Click student to view detailed profile
5. **Actions**: Edit, enroll, transfer, or manage relationships

### Student Profile Flow
1. **Profile Tab**: View/edit basic information
2. **Progress Tab**: Track academic progress and assessments
3. **Attendance Tab**: View attendance history and patterns
4. **Transactions Tab**: Review financial history and payments
5. **Schedule Tab**: Manage current and upcoming sessions

### Enrollment Flow
1. **Student Selection**: Choose student for enrollment
2. **Program Selection**: Select program and course
3. **Instructor Assignment**: Assign qualified instructor
4. **Schedule Creation**: Set session times and dates
5. **Payment Setup**: Configure payment plans
6. **Confirmation**: Review and confirm enrollment

## Layout Specifications

### Student List Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Students                                    [+ Add Student] │
├─────────────────────────────────────────────────────────────┤
│ Search: [____________] | Filters: [Program ▼][Status ▼]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Photo │ Name          │ Age │ Program  │ Status  │ Act  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [👤]  │ Alice Smith   │ 8   │ Swimming │ Active  │ ••• │ │
│ │ [👤]  │ Bob Johnson   │ 12  │ Football │ Active  │ ••• │ │
│ │ [👤]  │ Carol Davis   │ 6   │ Swimming │ Paused  │ ••• │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Pagination Controls]                    │
└─────────────────────────────────────────────────────────────┘
```

### Student Profile Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Students    Alice Smith (8 years old)    [Edit]   │
├─────────────────────────────────────────────────────────────┤
│ [Profile] [Progress] [Attendance] [Transactions] [Schedule] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │     [Photo]     │ │ Basic Information                   │ │
│ │   Alice Smith   │ │ Full Name: Alice Marie Smith        │ │
│ │   STU-2024-001  │ │ Email: alice@parent.com             │ │
│ │                 │ │ Phone: (555) 123-4567               │ │
│ │   [Edit Photo]  │ │ DOB: March 15, 2016                │ │
│ └─────────────────┘ │ Address: 123 Main St...            │ │
│                     │                                     │ │
│ Parent Information  │ Emergency Contact                   │ │
│ Primary: John Smith │ Name: Sarah Smith                   │ │
│ Email: john@...     │ Phone: (555) 987-6543             │ │
│ Phone: (555)...     │ Relation: Aunt                     │ │
│                     └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Specifications

### Student List Component
```typescript
interface StudentListProps {
  students: Student[];
  loading: boolean;
  pagination: PaginationInfo;
  filters: StudentFilters;
  onFilterChange: (filters: StudentFilters) => void;
  onStudentSelect: (student: Student) => void;
  onCreateStudent: () => void;
}

interface StudentFilters {
  search?: string;
  program?: string;
  status?: StudentStatus;
  ageRange?: [number, number];
  location?: string;
  instructor?: string;
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  age: number;
  profilePhoto?: string;
  status: StudentStatus;
  enrollments: Enrollment[];
  parents: ParentRelationship[];
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn' | 'paused';
```

#### Student List Features
1. **Search Functionality**
   - Global search across name, email, ID
   - Real-time search with debouncing
   - Search result highlighting

2. **Advanced Filtering**
   - Program enrollment filter
   - Status-based filtering
   - Age range slider
   - Location filter
   - Date range filters

3. **Sorting Options**
   - Name (A-Z, Z-A)
   - Age (ascending, descending)
   - Enrollment date
   - Last activity

4. **Bulk Actions**
   - Select multiple students
   - Bulk status updates
   - Bulk program transfers
   - Export student data

### Student Profile Component
```typescript
interface StudentProfileProps {
  student: Student;
  onUpdate: (updates: Partial<Student>) => Promise<void>;
  onEnroll: (enrollment: EnrollmentInput) => Promise<void>;
  onTransfer: (transfer: TransferInput) => Promise<void>;
}
```

#### Profile Tab Structure
1. **Basic Information Section**
   - Editable personal details
   - Profile photo upload
   - Contact information
   - Address details

2. **Parent/Guardian Section**
   - Primary parent relationship
   - Secondary guardians
   - Emergency contacts
   - Communication preferences

3. **Medical Information Section**
   - Medical conditions
   - Medications
   - Allergies
   - Special requirements

4. **Academy Information Section**
   - Student ID
   - Enrollment date
   - Referral source
   - Current programs

### Progress Tracking Component
```typescript
interface ProgressTrackingProps {
  student: Student;
  progressData: StudentProgress[];
  assessments: Assessment[];
  onUpdateProgress: (progress: ProgressUpdate) => Promise<void>;
}

interface StudentProgress {
  id: string;
  curriculumLevel: string;
  moduleName: string;
  sectionName: string;
  skillArea: string;
  currentRating: number; // 0-3 stars
  targetRating: number;
  assessmentDate: Date;
  instructorNotes: string;
  achievements: string[];
}
```

#### Progress Tab Features
1. **Current Level Display**
   - Visual level indicator
   - Progress percentage
   - Time in current level
   - Next level requirements

2. **Assessment History**
   - Chronological assessment timeline
   - Star rating displays (0-3 stars)
   - Skill area breakdowns
   - Instructor feedback

3. **Achievement Tracking**
   - Milestone badges
   - Completion certificates
   - Progress charts
   - Skill development graphs

4. **Assessment Input**
   - Quick assessment forms
   - Star rating inputs
   - Notes and feedback
   - Photo/video uploads

### Attendance Component
```typescript
interface AttendanceProps {
  student: Student;
  attendanceRecords: AttendanceRecord[];
  sessions: Session[];
  onMarkAttendance: (record: AttendanceInput) => Promise<void>;
}

interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionDate: Date;
  sessionTitle: string;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  instructorNotes?: string;
  parentNotes?: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
```

#### Attendance Tab Features
1. **Attendance Calendar**
   - Monthly calendar view
   - Color-coded attendance status
   - Session details on hover
   - Quick attendance marking

2. **Attendance Statistics**
   - Overall attendance percentage
   - Monthly attendance trends
   - Consecutive attendance streaks
   - Missed session patterns

3. **Session History**
   - Chronological session list
   - Attendance status indicators
   - Session details and notes
   - Makeup session tracking

### Financial Records Component
```typescript
interface FinancialRecordsProps {
  student: Student;
  transactions: FinancialTransaction[];
  accountSummary: AccountSummary;
  onCreateTransaction: (transaction: TransactionInput) => Promise<void>;
}

interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  dueDate?: Date;
  paidDate?: Date;
  paymentMethod?: string;
  reference?: string;
}

type TransactionType = 'payment' | 'refund' | 'credit' | 'debit' | 'adjustment';
type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
```

#### Transactions Tab Features
1. **Account Summary**
   - Current balance
   - Total paid amount
   - Outstanding balance
   - Payment status

2. **Transaction History**
   - Chronological transaction list
   - Payment status indicators
   - Receipt downloads
   - Payment method details

3. **Payment Management**
   - Quick payment entry
   - Refund processing
   - Credit adjustments
   - Payment plan setup

### Schedule Management Component
```typescript
interface ScheduleManagementProps {
  student: Student;
  upcomingSessions: Session[];
  sessionHistory: Session[];
  onBookSession: (booking: BookingInput) => Promise<void>;
  onCancelSession: (sessionId: string) => Promise<void>;
}
```

#### Schedule Tab Features
1. **Upcoming Sessions**
   - Next 30 days of sessions
   - Session details and instructors
   - Cancellation options
   - Rescheduling tools

2. **Session Calendar**
   - Monthly calendar view
   - Session time blocks
   - Instructor assignments
   - Conflict indicators

3. **Schedule History**
   - Past session records
   - Attendance correlation
   - Schedule changes log
   - Instructor feedback

## Data Table Design

### Student List Table
```typescript
const studentColumns: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "profile",
    header: "Student",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.profilePhoto} />
          <AvatarFallback>
            {row.original.firstName[0]}{row.original.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.studentId}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.age}</span>
    ),
  },
  {
    accessorKey: "programs",
    header: "Programs",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.enrollments.map((enrollment) => (
          <Badge key={enrollment.id} variant="secondary">
            {enrollment.program.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status}>
        {row.original.status}
      </StatusBadge>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.location.name}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => viewStudent(row.original)}>
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editStudent(row.original)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => enrollStudent(row.original)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll in Program
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => transferStudent(row.original)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transfer Location
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updateStatus(row.original)}
            className="text-warning"
          >
            <Pause className="h-4 w-4 mr-2" />
            Update Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
```

### Progress Assessment Table
```typescript
const progressColumns: ColumnDef<StudentProgress>[] = [
  {
    accessorKey: "assessmentDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm">
        {format(row.original.assessmentDate, "MMM dd, yyyy")}
      </span>
    ),
  },
  {
    accessorKey: "skillArea",
    header: "Skill Area",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.skillArea}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.curriculumLevel} - {row.original.moduleName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "currentRating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <StarRating 
          rating={row.original.currentRating} 
          maxRating={3}
          readonly
        />
        <span className="text-sm text-muted-foreground">
          {row.original.currentRating}/3
        </span>
      </div>
    ),
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = (row.original.currentRating / row.original.targetRating) * 100;
      return (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}% to target
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "instructorNotes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-xs">
        <p className="text-sm truncate" title={row.original.instructorNotes}>
          {row.original.instructorNotes}
        </p>
      </div>
    ),
  },
];
```

## Modal Window Designs

### Create/Edit Student Modal
```typescript
interface StudentModalProps {
  student?: Student;
  programs: Program[];
  locations: Location[];
  onSave: (student: StudentInput) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}
```

#### Modal Structure
1. **Header**
   - Title: "Add New Student" or "Edit Student"
   - Close button
   - Progress indicator for multi-step form

2. **Body - Tabbed Interface**
   - **Personal Info Tab**: Basic details and contact
   - **Parent Info Tab**: Parent/guardian relationships
   - **Medical Info Tab**: Health and safety information
   - **Academy Info Tab**: Programs and settings

3. **Footer**
   - Cancel button
   - Save button (with loading state)
   - Validation error summary

### Enrollment Modal
```typescript
interface EnrollmentModalProps {
  student: Student;
  programs: Program[];
  instructors: Instructor[];
  onEnroll: (enrollment: EnrollmentInput) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}
```

#### Enrollment Steps
1. **Program Selection**
   - Available programs list
   - Prerequisites checking
   - Capacity validation

2. **Course Selection**
   - Courses within selected program
   - Age group compatibility
   - Skill level assessment

3. **Instructor Assignment**
   - Available instructors
   - Qualification matching
   - Schedule availability

4. **Schedule Setup**
   - Session time selection
   - Recurring schedule options
   - Conflict detection

5. **Payment Configuration**
   - Session package selection
   - Payment plan options
   - Discount applications

### Progress Assessment Modal
```typescript
interface AssessmentModalProps {
  student: Student;
  enrollment: Enrollment;
  currentLevel: CurriculumLevel;
  onSubmit: (assessment: AssessmentInput) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}
```

#### Assessment Form Sections
1. **Student Context**
   - Student name and photo
   - Current level and module
   - Assessment date

2. **Skill Assessment Grid**
   - Matrix of skills and ratings
   - 0-3 star rating system
   - Previous rating comparison

3. **Notes and Feedback**
   - Instructor observations
   - Student strengths
   - Areas for improvement
   - Achievement notes

4. **Recommendations**
   - Level advancement suggestion
   - Additional practice areas
   - Next session focus

## Tabbed Interface Specifications

### Student Profile Tabs
```typescript
const profileTabs = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    component: ProfileTab
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    component: ProgressTab
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Calendar,
    component: AttendanceTab
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: CreditCard,
    component: TransactionsTab
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Clock,
    component: ScheduleTab
  }
];
```

#### Tab Interaction
- **Active Tab**: Highlighted with accent color
- **Tab Navigation**: Keyboard arrow key navigation
- **Tab Content**: Lazy loading for performance
- **URL Sync**: Browser history for direct tab links

### Parent Profile Tabs
```typescript
const parentTabs = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    component: ParentProfileTab
  },
  {
    id: 'children',
    label: 'Children',
    icon: Users,
    badge: parent.children.length,
    component: ChildrenTab
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: CreditCard,
    component: ParentTransactionsTab
  },
  {
    id: 'schedules',
    label: 'Schedules',
    icon: Calendar,
    component: FamilySchedulesTab
  }
];
```

## Form Designs with Validation

### Student Creation Form
```typescript
const studentSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "Date of birth is required"
  }),
  gender: z.enum(['male', 'female', 'other']).optional(),
  
  // Address Information
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  
  // Medical Information
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  
  // Academy Information
  referralSource: z.string().optional(),
  locationId: z.string().uuid("Location is required")
});
```

### Form Layout
```typescript
const StudentForm = ({ student, onSubmit }: StudentFormProps) => {
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: student || {
      firstName: '',
      lastName: '',
      email: '',
      // ... other default values
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Address Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Address Information</h3>
          {/* Address form fields */}
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {student ? 'Update Student' : 'Create Student'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
```

## Status Indicators & Color Coding

### Student Status System
```typescript
const studentStatusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Student is currently enrolled and attending'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800',
    icon: Pause,
    description: 'Student is not currently attending sessions'
  },
  paused: {
    label: 'Paused',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Enrollment temporarily paused'
  },
  graduated: {
    label: 'Graduated',
    color: 'bg-blue-100 text-blue-800',
    icon: GraduationCap,
    description: 'Student has completed the program'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Student has withdrawn from the program'
  }
};
```

### Progress Rating System
```typescript
const ratingConfig = {
  0: {
    label: 'Not Attempted',
    color: 'text-gray-400',
    icon: '☆☆☆',
    description: 'Skill not yet attempted or assessed'
  },
  1: {
    label: 'Beginning',
    color: 'text-red-500',
    icon: '★☆☆',
    description: 'Shows minimal understanding or skill'
  },
  2: {
    label: 'Developing',
    color: 'text-yellow-500',
    icon: '★★☆',
    description: 'Shows good understanding, some assistance needed'
  },
  3: {
    label: 'Proficient',
    color: 'text-green-500',
    icon: '★★★',
    description: 'Shows complete understanding and independent skill'
  }
};
```

### Attendance Status
```typescript
const attendanceStatusConfig = {
  present: {
    label: 'Present',
    color: 'bg-green-100 text-green-800',
    icon: Check
  },
  absent: {
    label: 'Absent',
    color: 'bg-red-100 text-red-800',
    icon: X
  },
  late: {
    label: 'Late',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  excused: {
    label: 'Excused',
    color: 'bg-blue-100 text-blue-800',
    icon: Info
  }
};
```

## Responsive Behavior

### Desktop (≥1024px)
- **Student List**: Full table with all columns visible
- **Profile View**: Side-by-side layout with photo and details
- **Modals**: Standard modal dialogs (max-width 800px)
- **Tabs**: Horizontal tab navigation

### Tablet (768px - 1023px)
- **Student List**: Hide less critical columns, show on expand
- **Profile View**: Stacked layout with full-width sections
- **Modals**: Full-width modals with padding
- **Tabs**: Scrollable horizontal tabs

### Mobile (<768px)
- **Student List**: Card-based layout instead of table
- **Profile View**: Single column layout
- **Modals**: Full-screen modals
- **Tabs**: Scrollable tabs or accordion sections

### Student Card Layout (Mobile)
```typescript
const StudentCard = ({ student }: { student: Student }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={student.profilePhoto} />
          <AvatarFallback>
            {student.firstName[0]}{student.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {student.studentId} • Age {student.age}
          </p>
        </div>
      </div>
      <StatusBadge status={student.status} />
    </div>
    
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Programs:</span>
        <span>{student.enrollments.length}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Location:</span>
        <span>{student.location.name}</span>
      </div>
    </div>
    
    <div className="mt-4 flex gap-2">
      <Button size="sm" variant="outline" className="flex-1">
        View
      </Button>
      <Button size="sm" className="flex-1">
        Edit
      </Button>
    </div>
  </Card>
);
```

## Accessibility Requirements

### Keyboard Navigation
- **Table Navigation**: Arrow keys for cell navigation
- **Tab Focus**: Logical tab order through interactive elements
- **Modal Focus**: Focus trap within modal dialogs
- **Form Navigation**: Tab through form fields in logical order

### Screen Reader Support
```typescript
// Table accessibility
<table role="table" aria-label="Students list">
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort="none">
        <button aria-label="Sort by student name">
          Name
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr role="row" aria-rowindex={index + 1}>
      <td role="gridcell" aria-describedby="student-name-desc">
        {student.name}
      </td>
    </tr>
  </tbody>
</table>

// Form accessibility
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel htmlFor="firstName">First Name</FormLabel>
      <FormControl>
        <Input
          id="firstName"
          aria-describedby="firstName-description firstName-error"
          aria-invalid={!!errors.firstName}
          {...field}
        />
      </FormControl>
      <FormDescription id="firstName-description">
        Enter the student's first name
      </FormDescription>
      <FormMessage id="firstName-error" role="alert" />
    </FormItem>
  )}
/>
```

### Color and Contrast
- **Status Indicators**: Use icons + text, not just color
- **Progress Ratings**: Use star symbols + color
- **Error States**: High contrast red with icons
- **Focus Indicators**: Visible focus outlines

## Performance Considerations

### Virtual Scrolling
```typescript
// Large student lists
const VirtualizedStudentList = ({ students }: { students: Student[] }) => {
  const { width, height } = useWindowSize();
  
  return (
    <FixedSizeList
      height={height - 200}
      width={width}
      itemCount={students.length}
      itemSize={80}
      itemData={students}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <StudentCard student={data[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

### Image Optimization
```typescript
// Profile photo optimization
const ProfilePhoto = ({ src, alt, size = 40 }: ProfilePhotoProps) => (
  <div className={`relative w-${size} h-${size} rounded-full overflow-hidden`}>
    <Image
      src={src}
      alt={alt}
      fill
      sizes={`${size * 4}px`}
      className="object-cover"
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  </div>
);
```

### Data Fetching
```typescript
// Optimized data fetching with pagination
const useStudents = (filters: StudentFilters, page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['students', filters, page, pageSize],
    queryFn: () => fetchStudents({ filters, page, pageSize }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Prefetch next page
const { prefetchQuery } = useQueryClient();
useEffect(() => {
  if (hasNextPage) {
    prefetchQuery({
      queryKey: ['students', filters, page + 1, pageSize],
      queryFn: () => fetchStudents({ filters, page: page + 1, pageSize }),
    });
  }
}, [page, hasNextPage, filters]);
```

## Testing Requirements

### Unit Tests
- **Component Rendering**: All components render correctly
- **Form Validation**: Schema validation rules
- **User Interactions**: Click handlers and form submissions
- **Data Transformations**: Student data processing

### Integration Tests
- **Student Creation**: Complete student creation workflow
- **Enrollment Process**: End-to-end enrollment flow
- **Profile Updates**: Profile modification and saving
- **Search and Filtering**: Advanced search functionality

### Accessibility Tests
- **Keyboard Navigation**: Tab order and keyboard controls
- **Screen Reader**: ARIA labels and descriptions
- **Color Contrast**: Automated contrast testing
- **Focus Management**: Proper focus handling

### Performance Tests
- **Large Dataset Loading**: Test with 10,000+ students
- **Search Performance**: Real-time search responsiveness
- **Image Loading**: Profile photo optimization
- **Memory Usage**: Monitor for memory leaks