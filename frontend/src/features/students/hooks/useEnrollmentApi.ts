/**
 * TanStack Query hooks for enhanced enrollment API endpoints
 * Provides reactive data management for the multi-step enrollment workflow
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgramContext } from '@/hooks/useProgramContext';
import { enrollmentApi } from '../api/enrollmentApi';
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

// Query Keys
const ENROLLMENT_QUERY_KEYS = {
  all: ['enrollment'] as const,
  ageEligibility: (userId: string, courseId: string) => 
    [...ENROLLMENT_QUERY_KEYS.all, 'age-eligibility', userId, courseId] as const,
  defaultFacility: (userId: string) => 
    [...ENROLLMENT_QUERY_KEYS.all, 'default-facility', userId] as const,
  availableFacilities: (courseId: string) => 
    [...ENROLLMENT_QUERY_KEYS.all, 'available-facilities', courseId] as const,
  facilityAvailability: (courseId: string, facilityId: string) => 
    [...ENROLLMENT_QUERY_KEYS.all, 'facility-availability', courseId, facilityId] as const,
  pricing: (request: PricingCalculationRequest) => 
    [...ENROLLMENT_QUERY_KEYS.all, 'pricing', request] as const,
  couponValidation: (couponCode: string, courseId: string, facilityId: string, subtotal: number) => 
    [...ENROLLMENT_QUERY_KEYS.all, 'coupon', couponCode, courseId, facilityId, subtotal] as const,
} as const;

/**
 * Hook to check student age eligibility for a course
 */
function useStudentAgeEligibility(userId: string, courseId: string, enabled = true) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEYS.ageEligibility(userId, courseId), currentProgram?.id],
    queryFn: () => enrollmentApi.checkAgeEligibility(userId, courseId),
    enabled: enabled && !!userId && !!courseId && !!currentProgram?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get student's default facility based on enrollment history
 */
function useStudentDefaultFacility(userId: string, enabled = true) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEYS.defaultFacility(userId), currentProgram?.id],
    queryFn: () => enrollmentApi.getDefaultFacility(userId),
    enabled: enabled && !!userId && !!currentProgram?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get available facilities for a course
 */
function useAvailableFacilities(courseId: string, enabled = true) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEYS.availableFacilities(courseId), currentProgram?.id],
    queryFn: () => enrollmentApi.getAvailableFacilities(courseId),
    enabled: enabled && !!courseId && !!currentProgram?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to validate facility availability for a course
 */
function useFacilityAvailability(
  courseId: string, 
  facilityId: string, 
  enabled = true
) {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEYS.facilityAvailability(courseId, facilityId), currentProgram?.id],
    queryFn: () => enrollmentApi.validateFacility(courseId, facilityId),
    enabled: enabled && !!courseId && !!facilityId && !!currentProgram?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for real-time pricing calculation
 */
function usePricingCalculation() {
  const queryClient = useQueryClient();
  const { currentProgram } = useProgramContext();

  return useMutation({
    mutationFn: (request: PricingCalculationRequest) => 
      enrollmentApi.calculatePricing(request),
    
    onSuccess: (data, variables) => {
      // Cache the pricing result for potential reuse
      queryClient.setQueryData(
        [...ENROLLMENT_QUERY_KEYS.pricing(variables), currentProgram?.id],
        data
      );
    },
    
    onError: (error) => {
      console.error('Pricing calculation failed:', error);
    },
  });
}

/**
 * Hook for coupon validation with caching
 */
function useCouponValidation() {
  const queryClient = useQueryClient();
  const { currentProgram } = useProgramContext();

  return useMutation({
    mutationFn: ({ 
      couponCode, 
      courseId, 
      facilityId, 
      subtotal 
    }: { 
      couponCode: string;
      courseId: string;
      facilityId: string;
      subtotal: number;
    }) => enrollmentApi.validateCoupon(couponCode, courseId, facilityId, subtotal),
    
    onSuccess: (data, variables) => {
      // Cache valid coupon data
      if (data.is_valid) {
        queryClient.setQueryData(
          [...ENROLLMENT_QUERY_KEYS.couponValidation(
            variables.couponCode,
            variables.courseId,
            variables.facilityId,
            variables.subtotal
          ), currentProgram?.id],
          data
        );
      }
    },
    
    onError: (error) => {
      console.error('Coupon validation failed:', error);
    },
  });
}

/**
 * Hook to create course assignment (enrollment)
 */
function useCreateCourseAssignment() {
  const queryClient = useQueryClient();
  const { currentProgram } = useProgramContext();

  return useMutation({
    mutationFn: (data: CourseAssignmentCreateRequest) => 
      enrollmentApi.createAssignment(data),
    
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['students'] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['course-assignments'] 
      });
      
      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_QUERY_KEYS.defaultFacility(variables.user_id)
      });
      
      // Optionally cache the new assignment
      queryClient.setQueryData(
        ['course-assignment', data.id],
        data
      );
    },
    
    onError: (error) => {
      console.error('Course assignment creation failed:', error);
    },
  });
}

/**
 * Invalidate enrollment-related queries
 */
function useInvalidateEnrollmentQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ 
        queryKey: ENROLLMENT_QUERY_KEYS.all 
      });
    },
    
    invalidateAgeEligibility: (userId: string, courseId: string) => {
      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_QUERY_KEYS.ageEligibility(userId, courseId)
      });
    },
    
    invalidateDefaultFacility: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_QUERY_KEYS.defaultFacility(userId)
      });
    },
    
    invalidateAvailableFacilities: (courseId: string) => {
      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_QUERY_KEYS.availableFacilities(courseId)
      });
    },
    
    invalidateFacilityAvailability: (courseId: string, facilityId: string) => {
      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_QUERY_KEYS.facilityAvailability(courseId, facilityId)
      });
    },
  };
}

/**
 * Prefetch enrollment data for better UX
 */
function usePrefetchEnrollmentData() {
  const queryClient = useQueryClient();
  const { currentProgram } = useProgramContext();

  return {
    prefetchAgeEligibility: (userId: string, courseId: string) => {
      queryClient.prefetchQuery({
        queryKey: [...ENROLLMENT_QUERY_KEYS.ageEligibility(userId, courseId), currentProgram?.id],
        queryFn: () => enrollmentApi.checkAgeEligibility(userId, courseId),
        staleTime: 5 * 60 * 1000,
      });
    },
    
    prefetchDefaultFacility: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: [...ENROLLMENT_QUERY_KEYS.defaultFacility(userId), currentProgram?.id],
        queryFn: () => enrollmentApi.getDefaultFacility(userId),
        staleTime: 10 * 60 * 1000,
      });
    },
    
    prefetchAvailableFacilities: (courseId: string) => {
      queryClient.prefetchQuery({
        queryKey: [...ENROLLMENT_QUERY_KEYS.availableFacilities(courseId), currentProgram?.id],
        queryFn: () => enrollmentApi.getAvailableFacilities(courseId),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}

// Export individual hooks and utilities
export {
  ENROLLMENT_QUERY_KEYS,
  useStudentAgeEligibility,
  useStudentDefaultFacility,
  useAvailableFacilities,
  useFacilityAvailability,
  usePricingCalculation,
  useCouponValidation,
  useCreateCourseAssignment,
  useInvalidateEnrollmentQueries,
  usePrefetchEnrollmentData,
};