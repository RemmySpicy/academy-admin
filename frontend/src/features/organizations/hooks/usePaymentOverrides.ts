/**
 * Payment Override Hooks
 * 
 * React hooks for managing organization payment overrides and access control.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/httpClient';
import { useProgramContext } from '@/hooks/useProgramContext';

// Types
interface PaymentBreakdownItem {
  payer_id: string;
  payer_type: 'student' | 'parent' | 'organization';
  payer_name: string;
  amount: number;
  percentage: number;
  reason: string;
}

interface PaymentCalculationResponse {
  payer_type: string;
  primary_payer_id: string;
  payment_breakdown: PaymentBreakdownItem[];
  total_amount: number;
  discounts_applied: string[];
  override_reason: string;
}

interface StudentPaymentStatus {
  student_id: string;
  student_name: string;
  sponsoring_organizations: Array<{
    organization_id: string;
    organization_name: string;
    membership_type: string;
    payment_responsibility: boolean;
  }>;
  responsible_parents: Array<{
    parent_id: string;
    parent_name: string;
    relationship_type: string;
  }>;
  has_payment_overrides: boolean;
  payment_responsibility_type: string;
}

interface CourseAccessResponse {
  has_access: boolean;
  access_type: 'default' | 'granted' | 'restricted';
  reason: string;
  access_grants: Array<{
    organization_id: string;
    organization_name: string;
    access_type: string;
    reason: string;
  }>;
  access_restrictions: Array<{
    organization_id: string;
    organization_name: string;
    access_type: string;
    reason: string;
  }>;
  organization_memberships: Array<{
    organization_id: string;
    organization_name: string;
    membership_type: string;
  }>;
}

interface OrganizationCourseOverrides {
  organization_id: string;
  organization_name: string;
  granted_courses: Array<{
    course_id: string;
    course_name: string;
    course_code: string;
  }>;
  restricted_courses: Array<{
    course_id: string;
    course_name: string;
    course_code: string;
  }>;
  total_overrides: number;
}

// API Functions
const paymentOverrideApi = {
  calculatePayment: async (data: {
    student_id: string;
    course_id: string;
    base_amount: number;
  }): Promise<PaymentCalculationResponse> => {
    const response = await httpClient.post('/organizations/payment-overrides/calculate-payment', data);
    return response.data;
  },

  applyPaymentOverrides: async (data: {
    student_id: string;
    course_id: string;
    base_amount: number;
  }) => {
    const response = await httpClient.post('/organizations/payment-overrides/apply-payment-overrides', data);
    return response.data;
  },

  getStudentPaymentStatus: async (studentId: string): Promise<StudentPaymentStatus> => {
    const response = await httpClient.get(`/organizations/payment-overrides/student/${studentId}/payment-status`);
    return response.data;
  },

  checkCourseAccess: async (data: {
    student_id: string;
    course_id: string;
  }): Promise<CourseAccessResponse> => {
    const response = await httpClient.post('/organizations/payment-overrides/check-course-access', data);
    return response.data;
  },

  getOrganizationCourseOverrides: async (organizationId: string): Promise<OrganizationCourseOverrides> => {
    const response = await httpClient.get(`/organizations/payment-overrides/organization/${organizationId}/course-overrides`);
    return response.data;
  },

  getStudentsWithPaymentOverrides: async (params?: {
    limit?: number;
    offset?: number;
    organization_id?: string;
  }) => {
    const response = await httpClient.get('/organizations/payment-overrides/students/payment-overrides', {
      params
    });
    return response.data;
  },

  getOrganizationsWithOverrides: async () => {
    const response = await httpClient.get('/organizations/payment-overrides/organizations/with-overrides');
    return response.data;
  }
};

// Hooks

/**
 * Calculate payment responsibility for a student's course enrollment
 */
export const useCalculatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentOverrideApi.calculatePayment,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['payment-overrides'] });
    }
  });
};

/**
 * Apply payment overrides and create payment structure
 */
export const useApplyPaymentOverrides = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentOverrideApi.applyPaymentOverrides,
    onSuccess: () => {
      // Invalidate payment-related queries
      queryClient.invalidateQueries({ queryKey: ['payment-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['student-payment-status'] });
    }
  });
};

/**
 * Get payment status for a specific student
 */
export const useStudentPaymentStatus = (studentId: string, enabled = true) => {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: ['student-payment-status', studentId, currentProgram?.id],
    queryFn: () => paymentOverrideApi.getStudentPaymentStatus(studentId),
    enabled: enabled && !!studentId && !!currentProgram?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Check course access for a student
 */
export const useCheckCourseAccess = () => {
  return useMutation({
    mutationFn: paymentOverrideApi.checkCourseAccess
  });
};

/**
 * Get course overrides for an organization
 */
export const useOrganizationCourseOverrides = (organizationId: string, enabled = true) => {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: ['organization-course-overrides', organizationId, currentProgram?.id],
    queryFn: () => paymentOverrideApi.getOrganizationCourseOverrides(organizationId),
    enabled: enabled && !!organizationId && !!currentProgram?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Get students with payment overrides
 */
export const useStudentsWithPaymentOverrides = (params?: {
  limit?: number;
  offset?: number;
  organization_id?: string;
}) => {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: ['students-with-payment-overrides', currentProgram?.id, params],
    queryFn: () => paymentOverrideApi.getStudentsWithPaymentOverrides(params),
    enabled: !!currentProgram?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Get organizations with payment or access overrides
 */
export const useOrganizationsWithOverrides = () => {
  const { currentProgram } = useProgramContext();

  return useQuery({
    queryKey: ['organizations-with-overrides', currentProgram?.id],
    queryFn: paymentOverrideApi.getOrganizationsWithOverrides,
    enabled: !!currentProgram?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Batch payment calculation for multiple students
 */
export const useBatchPaymentCalculation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calculations: Array<{
      student_id: string;
      course_id: string;
      base_amount: number;
    }>) => {
      const results = await Promise.all(
        calculations.map(calc => paymentOverrideApi.calculatePayment(calc))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-overrides'] });
    }
  });
};

/**
 * Helper hook to determine if a student has any payment overrides
 */
export const useHasPaymentOverrides = (studentId: string) => {
  const { data: paymentStatus, isLoading } = useStudentPaymentStatus(studentId);

  return {
    hasOverrides: paymentStatus?.has_payment_overrides || false,
    isLoading,
    paymentType: paymentStatus?.payment_responsibility_type || 'student',
    sponsoringOrgs: paymentStatus?.sponsoring_organizations || [],
    responsibleParents: paymentStatus?.responsible_parents || []
  };
};

/**
 * Helper hook to check if an organization sponsors students
 */
export const useOrganizationSponsorshipInfo = (organizationId: string) => {
  const { data: studentsData } = useStudentsWithPaymentOverrides({
    organization_id: organizationId
  });

  return {
    sponsoredStudents: studentsData?.data?.students || [],
    totalSponsored: studentsData?.data?.total || 0,
    isSponsoring: (studentsData?.data?.total || 0) > 0
  };
};