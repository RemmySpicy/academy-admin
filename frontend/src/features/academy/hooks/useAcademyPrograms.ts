/**
 * Academy Programs React Hooks
 * 
 * Custom hooks for managing academy-wide programs using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academyProgramsApi } from '../api';
import type {
  Program,
  ProgramCreate,
  ProgramUpdate,
  SearchParams,
  PaginatedResponse
} from '@/lib/api/types';

// Query Keys
export const ACADEMY_QUERY_KEYS = {
  PROGRAMS: 'academy-programs',
  PROGRAM: 'academy-program',
  PROGRAM_STATS: 'academy-program-stats',
  USERS: 'academy-users',
  USER: 'academy-user',
  USER_STATS: 'academy-user-stats',
  SETTINGS: 'academy-settings',
  SYSTEM_HEALTH: 'academy-system-health',
} as const;

/**
 * Get all academy programs
 */
export const useAcademyPrograms = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.PROGRAMS, params],
    queryFn: async () => {
      const response = await academyProgramsApi.getPrograms(params);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch academy programs');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a specific academy program
 */
export const useAcademyProgram = (id: string) => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.PROGRAM, id],
    queryFn: async () => {
      const response = await academyProgramsApi.getProgram(id);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch academy program');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new academy program
 */
export const useCreateAcademyProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProgramCreate) => {
      const response = await academyProgramsApi.createProgram(data);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create program');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAMS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_STATS] });
      toast.success('Program created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create program: ${error.message}`);
    },
  });
};

/**
 * Update an academy program
 */
export const useUpdateAcademyProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProgramUpdate }) => {
      const response = await academyProgramsApi.updateProgram(id, data);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update program');
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAMS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM, id] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_STATS] });
      toast.success('Program updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update program: ${error.message}`);
    },
  });
};

/**
 * Delete an academy program
 */
export const useDeleteAcademyProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await academyProgramsApi.deleteProgram(id);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to delete program');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAMS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_STATS] });
      toast.success('Program deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete program: ${error.message}`);
    },
  });
};

/**
 * Get academy program statistics
 */
export const useAcademyProgramStats = () => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_STATS],
    queryFn: async () => {
      const response = await academyProgramsApi.getProgramStats();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch program statistics');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
};