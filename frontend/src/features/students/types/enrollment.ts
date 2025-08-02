/**
 * TypeScript types for multi-step enrollment workflow
 */

import { User, Student } from '@/shared/types';
import { Course } from '@/features/courses/api/courseApiService';

// Enrollment Step Types
export type EnrollmentStep = 
  | 'person-selection'
  | 'course-selection' 
  | 'facility-selection'
  | 'review-payment'
  | 'confirmation';

// Base enrollment data interface
export interface EnrollmentData {
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
  couponDiscount?: number;
  paymentStatus?: 'unpaid' | 'partially_paid' | 'fully_paid';
  paymentAmount?: number;
  
  // Final enrollment result
  enrollmentId?: string;
  enrollmentResult?: CourseAssignment;
}

// Facility Types
export interface Facility {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  specifications?: FacilitySpecification[];
  availability_status: 'available' | 'not_available' | 'no_pricing';
  course_pricing?: FacilityCoursePricing;
}

export interface FacilitySpecification {
  id: string;
  specification_type: string;
  specification_value: string;
  unit?: string;
  notes?: string;
}

export interface FacilityCoursePricing {
  id: string;
  facility_id: string;
  course_id: string;
  age_group: string;
  session_type: 'private' | 'group' | 'school_group';
  location_type: 'our-facility' | 'client-location' | 'virtual';
  price_per_session: number;
  currency: string;
  is_active: boolean;
  effective_from?: string;
  effective_to?: string;
}

// Student Age Eligibility
export interface StudentAgeEligibility {
  user_id: string;
  course_id: string;
  age: number;
  eligible_age_groups: string[];
  is_eligible: boolean;
  eligibility_details: {
    age_group: string;
    min_age: number;
    max_age: number;
    is_eligible_for_group: boolean;
  }[];
}

// Student Default Facility
export interface StudentDefaultFacility {
  user_id: string;
  default_facility?: Facility;
  enrollment_history: {
    facility_id: string;
    facility_name: string;
    enrollment_count: number;
    last_enrollment_date: string;
  }[];
  recommended_facilities: Facility[];
}

// Available Facilities Response
export interface AvailableFacilitiesResponse {
  course_id: string;
  facilities: Facility[];
  total_facilities: number;
  facilities_with_pricing: number;
  facilities_available: number;
}

// Facility Availability Validation
export interface FacilityAvailabilityValidation {
  course_id: string;
  facility_id: string;
  is_available: boolean;
  availability_status: 'available' | 'not_available' | 'no_pricing';
  pricing_configured: boolean;
  age_groups_available: string[];
  session_types_available: ('private' | 'group' | 'school_group')[];
  location_types_available: ('our-facility' | 'client-location' | 'virtual')[];
  message?: string;
}

// Pricing Calculation
export interface PricingCalculationRequest {
  course_id: string;
  facility_id: string;
  age_group: string;
  session_type: 'private' | 'group' | 'school_group';
  location_type: 'our-facility' | 'client-location' | 'virtual';
  coupon_code?: string;
}

export interface EnrollmentPricing {
  course_id: string;
  facility_id: string;
  age_group: string;
  session_type: 'private' | 'group' | 'school_group';
  location_type: 'our-facility' | 'client-location' | 'virtual';
  
  // Pricing breakdown
  base_price_per_session: number;
  sessions_per_payment: number;
  subtotal: number;
  
  // Coupon discount
  coupon_code?: string;
  coupon_discount_amount?: number;
  coupon_discount_percentage?: number;
  
  // Final pricing
  total_amount: number;
  currency: string;
  
  // Payment thresholds
  minimum_payment_amount: number; // 50% minimum for sessions
  minimum_payment_percentage: number;
  
  // Session access eligibility
  sessions_accessible_with_payment: number;
  sessions_requiring_full_payment: number;
  
  // Pricing details
  pricing_breakdown: {
    description: string;
    amount: number;
    type: 'base' | 'discount' | 'fee' | 'tax';
  }[];
}

// Course Assignment (Enrollment) Result
export interface CourseAssignment {
  id: string;
  user_id: string;
  course_id: string;
  facility_id: string;
  age_group: string;
  session_type: 'private' | 'group' | 'school_group';
  location_type: 'our-facility' | 'client-location' | 'virtual';
  
  // Payment information
  payment_status: 'unpaid' | 'partially_paid' | 'fully_paid';
  amount_paid: number;
  total_amount_due: number;
  currency: string;
  
  // Coupon information
  coupon_code?: string;
  coupon_discount_amount?: number;
  
  // Access and eligibility
  sessions_accessible: number;
  can_attend_sessions: boolean;
  
  // Metadata
  assigned_by: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
  course?: Course;
  facility?: Facility;
  assigned_by_user?: User;
}

// Validation and Error Types
export interface EnrollmentValidationError {
  step: EnrollmentStep;
  field: string;
  message: string;
  code?: string;
}

export interface EnrollmentStepValidation {
  isValid: boolean;
  errors: EnrollmentValidationError[];
  canProceed: boolean;
}

// Form State Management
export interface EnrollmentFormState {
  currentStep: EnrollmentStep;
  data: EnrollmentData;
  validation: Record<EnrollmentStep, EnrollmentStepValidation>;
  isLoading: boolean;
  isSubmitting: boolean;
  error?: string;
}

// Step Props Interface
export interface EnrollmentStepProps {
  data: EnrollmentData;
  onUpdate: (updates: Partial<EnrollmentData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onValidationChange: (step: EnrollmentStep, validation: EnrollmentStepValidation) => void;
  isLoading?: boolean;
  error?: string;
}

// API Hook Response Types
export interface UseEnrollmentApiHooks {
  // Age eligibility
  useStudentAgeEligibility: (userId: string, courseId: string) => {
    data?: StudentAgeEligibility;
    isLoading: boolean;
    error?: Error;
  };
  
  // Default facility
  useStudentDefaultFacility: (userId: string) => {
    data?: StudentDefaultFacility;
    isLoading: boolean;
    error?: Error;
  };
  
  // Available facilities
  useAvailableFacilities: (courseId: string) => {
    data?: AvailableFacilitiesResponse;
    isLoading: boolean;
    error?: Error;
  };
  
  // Facility availability
  useFacilityAvailability: (courseId: string, facilityId: string) => {
    data?: FacilityAvailabilityValidation;
    isLoading: boolean;
    error?: Error;
  };
  
  // Pricing calculation
  usePricingCalculation: (request: PricingCalculationRequest) => {
    data?: EnrollmentPricing;
    isLoading: boolean;
    error?: Error;
    mutate: (request: PricingCalculationRequest) => void;
  };
  
  // Course assignment creation
  useCreateCourseAssignment: () => {
    mutate: (data: CourseAssignmentCreateRequest) => Promise<CourseAssignment>;
    isLoading: boolean;
    error?: Error;
  };
}

// Course Assignment Creation Request
export interface CourseAssignmentCreateRequest {
  user_id: string;
  course_id: string;
  facility_id: string;
  age_group: string;
  session_type: 'private' | 'group' | 'school_group';
  location_type: 'our-facility' | 'client-location' | 'virtual';
  payment_status: 'unpaid' | 'partially_paid' | 'fully_paid';
  amount_paid?: number;
  coupon_code?: string;
  notes?: string;
}

// Coupon Validation
export interface CouponValidation {
  coupon_code: string;
  is_valid: boolean;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  discount_amount: number;
  minimum_amount?: number;
  maximum_discount?: number;
  expires_at?: string;
  usage_limit?: number;
  usage_count?: number;
  error_message?: string;
}

// Export all types
export type {
  EnrollmentStep,
  EnrollmentData,
  EnrollmentFormState,
  EnrollmentStepProps,
  EnrollmentValidationError,
  EnrollmentStepValidation,
  Facility,
  FacilitySpecification,
  FacilityCoursePricing,
  StudentAgeEligibility,
  StudentDefaultFacility,
  AvailableFacilitiesResponse,
  FacilityAvailabilityValidation,
  PricingCalculationRequest,
  EnrollmentPricing,
  CourseAssignment,
  CourseAssignmentCreateRequest,
  CouponValidation,
  UseEnrollmentApiHooks,
};