# Enhanced Multi-Step Enrollment Workflow

A comprehensive React component system for handling course enrollments with facility selection, real-time pricing, and payment management.

## Overview

The enrollment workflow consists of 5 steps:
1. **Person Selection** - Choose existing user or create new
2. **Course Selection** - Select course and verify age eligibility  
3. **Facility Selection** - Choose facility, age group, session type with real-time pricing
4. **Review & Payment** - Apply coupons, configure payment status
5. **Confirmation** - Show success and next steps

## Quick Start

### Basic Usage

```tsx
import { EnrollmentWizard } from '@/features/students/components/enrollment';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (assignment) => {
    console.log('Enrollment created:', assignment);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Start Enrollment
      </button>
      
      <EnrollmentWizard
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
```

### Pre-select a Student

```tsx
import { EnrollmentButton } from '@/features/students/components';

function StudentPage({ student }) {
  return (
    <EnrollmentButton
      selectedPerson={student}
      onEnrollmentComplete={(assignment) => {
        // Handle successful enrollment
        console.log('Student enrolled:', assignment);
      }}
    >
      Enroll in Course
    </EnrollmentButton>
  );
}
```

### Quick Integration Components

```tsx
import { 
  StudentEnrollmentButton,
  NewEnrollmentButton,
  BulkEnrollmentButton 
} from '@/features/students/components';

// For student detail pages
<StudentEnrollmentButton
  student={student}
  onEnrollmentComplete={handleComplete}
/>

// For general pages
<NewEnrollmentButton
  onEnrollmentComplete={handleComplete}
/>

// For admin operations
<BulkEnrollmentButton
  onEnrollmentComplete={handleComplete}
/>
```

## API Integration

The system uses TanStack Query hooks for reactive data management:

```tsx
import {
  useStudentAgeEligibility,
  useAvailableFacilities,
  usePricingCalculation,
  useCreateCourseAssignment
} from '@/features/students/hooks';

// Check age eligibility
const { data: eligibility } = useStudentAgeEligibility(userId, courseId);

// Get available facilities
const { data: facilities } = useAvailableFacilities(courseId);

// Calculate pricing in real-time
const pricingMutation = usePricingCalculation();

// Create enrollment
const createAssignment = useCreateCourseAssignment();
```

## Components

### EnrollmentWizard

The main multi-step wizard component.

**Props:**
- `isOpen: boolean` - Controls wizard visibility
- `onClose: () => void` - Called when wizard is closed
- `onComplete: (assignment: CourseAssignment) => void` - Called on successful enrollment
- `initialData?: Partial<EnrollmentData>` - Pre-populate wizard data
- `className?: string` - Additional CSS classes

### EnrollmentButton

A button that opens the enrollment wizard.

**Props:**
- `selectedPerson?: User` - Pre-select a person for enrollment
- `variant?: ButtonVariant` - Button styling variant
- `size?: ButtonSize` - Button size
- `children?: ReactNode` - Button content
- `onEnrollmentComplete?: (assignment) => void` - Success callback
- `initialData?: Partial<EnrollmentData>` - Pre-populate wizard

### Step Components

Individual step components that can be used independently:

- `PersonSelectionStep` - Select or create a person
- `CourseSelectionStep` - Choose course and verify eligibility
- `FacilitySelectionStep` - Select facility and configuration
- `ReviewPaymentStep` - Review details and configure payment
- `ConfirmationStep` - Show success and next steps

## Data Flow

### Enrollment Data Structure

```typescript
interface EnrollmentData {
  // Step 1: Person Selection
  selectedPerson?: User | null;
  personType?: 'existing' | 'new';
  newPersonData?: Partial<User>;
  
  // Step 2: Course Selection
  selectedCourse?: Course | null;
  courseId?: string;
  
  // Step 3: Facility Selection
  selectedFacility?: Facility | null;
  facilityId?: string;
  selectedAgeGroup?: string;
  selectedSessionType?: 'private' | 'group' | 'school_group';
  selectedLocationType?: 'our-facility' | 'client-location' | 'virtual';
  
  // Step 4: Review & Payment
  pricing?: EnrollmentPricing;
  couponCode?: string;
  paymentStatus?: 'unpaid' | 'partially_paid' | 'fully_paid';
  paymentAmount?: number;
  
  // Final result
  enrollmentResult?: CourseAssignment;
}
```

### Real-time Pricing

The system calculates pricing as users make selections:

```typescript
interface EnrollmentPricing {
  course_id: string;
  facility_id: string;
  age_group: string;
  session_type: string;
  location_type: string;
  
  base_price_per_session: number;
  sessions_per_payment: number;
  subtotal: number;
  
  coupon_discount_amount?: number;
  total_amount: number;
  
  minimum_payment_amount: number;
  sessions_accessible_with_payment: number;
}
```

## Validation

Each step includes comprehensive validation:

```typescript
interface EnrollmentStepValidation {
  isValid: boolean;
  errors: EnrollmentValidationError[];
  canProceed: boolean;
}
```

Validation is performed in real-time and prevents progression until requirements are met.

## Features

### ✅ Implemented Features

- **Multi-step wizard interface** with progress indicators
- **Person selection** with search and new user creation
- **Course selection** with age eligibility validation
- **Facility selection** with availability checking
- **Real-time pricing calculation** as selections change
- **Coupon validation and application**
- **Payment status configuration** with thresholds
- **Comprehensive validation** at each step
- **Responsive design** with mobile support
- **Accessibility** with ARIA labels and keyboard navigation
- **Integration hooks** for existing pages

### 🔄 Real-time Updates

- Age eligibility checking when course is selected
- Facility availability validation
- Pricing calculation as options change
- Coupon discount application
- Session access calculation based on payment

### 🎯 User Experience

- **Progressive disclosure** - only show relevant options
- **Loading states** for API calls
- **Clear error messages** and validation feedback
- **Step-by-step guidance** with descriptions
- **Confirmation screen** with next steps

## Integration Examples

See `EnrollmentIntegrationExample.tsx` for comprehensive examples of:

- Student detail page integration
- Students list page with bulk enrollment
- Dashboard widgets with quick enrollment
- Success handling and state management

## API Endpoints

The system integrates with these enhanced API endpoints:

- `GET /api/v1/course-assignments/student-age-eligibility/{user_id}/{course_id}`
- `GET /api/v1/course-assignments/student-default-facility/{user_id}`
- `GET /api/v1/course-assignments/available-facilities/{course_id}`
- `GET /api/v1/course-assignments/validate-facility-availability/{course_id}/{facility_id}`
- `POST /api/v1/course-assignments/calculate-pricing`
- `POST /api/v1/course-assignments/assign`
- `POST /api/v1/course-assignments/validate-coupon`

## Styling

The components use Tailwind CSS and shadcn/ui components for consistent styling with the rest of the application. All components are fully themed and responsive.

## Error Handling

- Comprehensive error boundaries
- User-friendly error messages
- Graceful degradation for API failures
- Retry mechanisms for transient errors

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and descriptions
- High contrast support
- Focus management

## Performance

- Lazy loading of step components
- Debounced search inputs
- Optimized API calls with caching
- Efficient re-rendering with React.memo
- Query invalidation for data freshness

## Development

### Adding New Steps

1. Create step component in `steps/` directory
2. Add step to `STEPS` array in `EnrollmentWizard.tsx`
3. Update `EnrollmentStep` type union
4. Add validation logic
5. Update `EnrollmentData` interface if needed

### Customizing Validation

Each step component implements validation through the `onValidationChange` callback:

```typescript
onValidationChange('step-name', {
  isValid: boolean,
  errors: ValidationError[],
  canProceed: boolean,
});
```

### Extending API Integration

Add new hooks in `hooks/useEnrollmentApi.ts` following the existing patterns:

```typescript
export function useNewFeature(params) {
  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEYS.all, 'new-feature', params],
    queryFn: () => enrollmentApi.newFeature(params),
    // ... options
  });
}
```