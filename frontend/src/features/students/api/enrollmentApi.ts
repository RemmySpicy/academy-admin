/**
 * Enhanced Enrollment API Service
 * Integrates with the new facility-based enrollment API endpoints
 */

import { httpClient, type ApiResponse } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  StudentAgeEligibility,
  StudentDefaultFacility,
  AvailableFacilitiesResponse,
  FacilityAvailabilityValidation,
  PricingCalculationRequest,
  EnrollmentPricing,
  CourseAssignment,
  CourseAssignmentCreateRequest,
  CouponValidation,
} from '../types/enrollment';

// Helper function to check API response success
const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } => {
  return response.success;
};

// Extended API endpoints for course assignments
const COURSE_ASSIGNMENT_ENDPOINTS = {
  studentAgeEligibility: (userId: string, courseId: string) => 
    `/api/v1/course-assignments/student-age-eligibility/${userId}/${courseId}`,
  studentDefaultFacility: (userId: string) => 
    `/api/v1/course-assignments/student-default-facility/${userId}`,
  availableFacilities: (courseId: string) => 
    `/api/v1/course-assignments/available-facilities/${courseId}`,
  validateFacilityAvailability: (courseId: string, facilityId: string) => 
    `/api/v1/course-assignments/validate-facility-availability/${courseId}/${facilityId}`,
  calculatePricing: '/api/v1/course-assignments/calculate-pricing',
  assign: '/api/v1/course-assignments/assign',
  validateCoupon: '/api/v1/course-assignments/validate-coupon',
} as const;

export class EnrollmentApiService {
  
  /**
   * Validate student age eligibility for a course
   */
  static async getStudentAgeEligibility(
    userId: string, 
    courseId: string
  ): Promise<StudentAgeEligibility> {
    const response = await httpClient.get<StudentAgeEligibility>(
      COURSE_ASSIGNMENT_ENDPOINTS.studentAgeEligibility(userId, courseId)
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch student age eligibility');
  }

  /**
   * Get student's default facility based on enrollment history
   */
  static async getStudentDefaultFacility(userId: string): Promise<StudentDefaultFacility> {
    const response = await httpClient.get<StudentDefaultFacility>(
      COURSE_ASSIGNMENT_ENDPOINTS.studentDefaultFacility(userId)
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch student default facility');
  }

  /**
   * Get available facilities for a course
   */
  static async getAvailableFacilities(courseId: string): Promise<AvailableFacilitiesResponse> {
    const response = await httpClient.get<AvailableFacilitiesResponse>(
      COURSE_ASSIGNMENT_ENDPOINTS.availableFacilities(courseId)
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch available facilities');
  }

  /**
   * Validate facility availability for a course
   */
  static async validateFacilityAvailability(
    courseId: string, 
    facilityId: string
  ): Promise<FacilityAvailabilityValidation> {
    const response = await httpClient.get<FacilityAvailabilityValidation>(
      COURSE_ASSIGNMENT_ENDPOINTS.validateFacilityAvailability(courseId, facilityId)
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to validate facility availability');
  }

  /**
   * Calculate pricing for enrollment configuration
   */
  static async calculatePricing(
    request: PricingCalculationRequest
  ): Promise<EnrollmentPricing> {
    const response = await httpClient.post<EnrollmentPricing>(
      COURSE_ASSIGNMENT_ENDPOINTS.calculatePricing,
      request
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to calculate pricing');
  }

  /**
   * Create course assignment (enrollment)
   */
  static async createCourseAssignment(
    data: CourseAssignmentCreateRequest
  ): Promise<CourseAssignment> {
    const response = await httpClient.post<CourseAssignment>(
      COURSE_ASSIGNMENT_ENDPOINTS.assign,
      data
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create course assignment');
  }

  /**
   * Validate coupon code
   */
  static async validateCoupon(
    couponCode: string,
    courseId: string,
    facilityId: string,
    subtotal: number
  ): Promise<CouponValidation> {
    const response = await httpClient.post<CouponValidation>(
      COURSE_ASSIGNMENT_ENDPOINTS.validateCoupon,
      {
        coupon_code: couponCode,
        course_id: courseId,
        facility_id: facilityId,
        subtotal,
      }
    );
    
    if (isApiSuccess(response)) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to validate coupon');
  }
}

// Helper functions for common operations
export const enrollmentApi = {
  // Age eligibility check
  checkAgeEligibility: async (userId: string, courseId: string) => {
    return EnrollmentApiService.getStudentAgeEligibility(userId, courseId);
  },

  // Default facility lookup
  getDefaultFacility: async (userId: string) => {
    return EnrollmentApiService.getStudentDefaultFacility(userId);
  },

  // Available facilities for course
  getAvailableFacilities: async (courseId: string) => {
    return EnrollmentApiService.getAvailableFacilities(courseId);
  },

  // Facility availability validation
  validateFacility: async (courseId: string, facilityId: string) => {
    return EnrollmentApiService.validateFacilityAvailability(courseId, facilityId);
  },

  // Pricing calculation
  calculatePricing: async (request: PricingCalculationRequest) => {
    return EnrollmentApiService.calculatePricing(request);
  },

  // Course assignment creation
  createAssignment: async (data: CourseAssignmentCreateRequest) => {
    return EnrollmentApiService.createCourseAssignment(data);
  },

  // Coupon validation
  validateCoupon: async (
    couponCode: string,
    courseId: string,
    facilityId: string,
    subtotal: number
  ) => {
    return EnrollmentApiService.validateCoupon(couponCode, courseId, facilityId, subtotal);
  },
};

// Export default
export default EnrollmentApiService;