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
  // Programs
  PROGRAMS: 'academy-programs',                    // List of programs
  PROGRAM: 'academy-program',                      // Single program
  PROGRAM_OVERVIEW_STATS: 'academy-program-overview-stats',  // Academy-wide stats
  PROGRAM_DETAILED_STATS: 'academy-program-detailed-stats',  // Individual program stats
  
  // Users  
  USERS: 'academy-users',                          // List of users
  USER: 'academy-user',                            // Single user
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
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_OVERVIEW_STATS] });
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
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_OVERVIEW_STATS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_DETAILED_STATS, id] });
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
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_OVERVIEW_STATS] });
      // Note: Individual program stats will be automatically cleaned up since the program no longer exists
      toast.success('Program deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete program: ${error.message}`);
    },
  });
};

/**
 * Get academy-wide program overview statistics
 * Returns overall stats across all programs (total programs, active programs, etc.)
 */
export const useAcademyProgramStats = () => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_OVERVIEW_STATS],
    queryFn: async () => {
      const response = await academyProgramsApi.getProgramStats();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch academy program overview statistics');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Get detailed statistics for a specific program
 * Returns comprehensive stats for individual program (courses, students, team, facilities, etc.)
 */
export const useAcademyProgramStatistics = (id: string) => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.PROGRAM_DETAILED_STATS, id],
    queryFn: async () => {
      const response = await academyProgramsApi.getProgramStatistics(id);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch detailed program statistics');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};