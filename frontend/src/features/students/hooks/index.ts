/**
 * Students hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgramContext } from '@/store/programContext';
import { StudentApi } from '../api/studentApi';
import {
  StudentCreate,
  StudentUpdate,
  StudentSearchParams,
  StudentBulkAction
} from '../types';

// Export enrollment hooks
export * from './useEnrollmentApi';

// Query keys
export const STUDENT_QUERY_KEYS = {
  all: ['students'] as const,
  lists: () => [...STUDENT_QUERY_KEYS.all, 'list'] as const,
  list: (params: StudentSearchParams & { page: number; per_page: number }) => [...STUDENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...STUDENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...STUDENT_QUERY_KEYS.details(), id] as const,
  stats: () => [...STUDENT_QUERY_KEYS.all, 'stats'] as const,
  family: (id: string) => [...STUDENT_QUERY_KEYS.all, 'family', id] as const,
};

/**
 * Hook to fetch students with optional filtering and pagination
 */
export function useStudents(
  page: number = 1,
  per_page: number = 20,
  searchParams?: StudentSearchParams
) {
  const { currentProgram } = useProgramContext();
  
  const params = { page, per_page, ...searchParams };
  
  return useQuery({
    queryKey: [...STUDENT_QUERY_KEYS.list(params), currentProgram?.id],
    queryFn: async () => {
      const response = await StudentApi.getStudents(page, per_page, searchParams);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch students');
      }
      return response.data;
    },
    enabled: !!currentProgram, // Only fetch when we have a program context
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific student by ID
 */
export function useStudent(id: string) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...STUDENT_QUERY_KEYS.detail(id), currentProgram?.id],
    queryFn: async () => {
      const response = await StudentApi.getStudent(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch student');
      }
      return response.data;
    },
    enabled: !!id && !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch student statistics
 */
export function useStudentStats() {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...STUDENT_QUERY_KEYS.stats(), currentProgram?.id],
    queryFn: async () => {
      const response = await StudentApi.getStudentStats();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch student statistics');
      }
      return response.data;
    },
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch student family information
 */
export function useStudentFamily(studentId: string) {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...STUDENT_QUERY_KEYS.family(studentId), currentProgram?.id],
    queryFn: async () => {
      const response = await StudentApi.getStudentFamily(studentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch student family');
      }
      return response.data;
    },
    enabled: !!studentId && !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: StudentCreate) => {
      const response = await StudentApi.createStudent(studentData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create student');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch student queries
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update a student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, studentData }: { id: string; studentData: StudentUpdate }) => {
      const response = await StudentApi.updateStudent(id, studentData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update student');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific student in the cache
      queryClient.setQueryData(STUDENT_QUERY_KEYS.detail(variables.id), data);
      // Invalidate student lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to delete a student
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await StudentApi.deleteStudent(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete student');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      // Remove the student from cache
      queryClient.removeQueries({ queryKey: STUDENT_QUERY_KEYS.detail(id) });
      // Invalidate student lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.stats() });
    },
  });
}

/**
 * Hook to perform bulk actions on students
 */
export function useStudentBulkAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: StudentBulkAction) => {
      const response = await StudentApi.bulkAction(action);
      if (!response.success) {
        throw new Error(response.error || 'Failed to perform bulk action');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all student queries to ensure consistency after bulk changes
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to export students
 */
export function useExportStudents() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'excel' = 'csv') => {
      const response = await StudentApi.exportStudents(format);
      if (!response.success) {
        throw new Error(response.error || 'Failed to export students');
      }
      return response.data;
    },
  });
}