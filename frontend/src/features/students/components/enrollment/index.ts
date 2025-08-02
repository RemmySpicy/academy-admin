/**
 * Enrollment Components
 * Export all enrollment-related components
 */

export { EnrollmentWizard } from './EnrollmentWizard';
export * from './steps';

// Re-export types for convenience
export type {
  EnrollmentStep,
  EnrollmentData,
  EnrollmentFormState,
  EnrollmentStepProps,
  Facility,
  StudentAgeEligibility,
  StudentDefaultFacility,
  AvailableFacilitiesResponse,
  FacilityAvailabilityValidation,
  PricingCalculationRequest,
  EnrollmentPricing,
  CourseAssignment,
  CourseAssignmentCreateRequest,
  CouponValidation,
} from '../../types/enrollment';