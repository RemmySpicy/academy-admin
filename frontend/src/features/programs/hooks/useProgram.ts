/**
 * React hooks for program management using TanStack Query
 */

import { useQuery } from '@tanstack/react-query';
import { programsApi } from '../api';
import { useProgramContext } from '@/hooks/useProgramContext';

// Query Keys
export const PROGRAM_QUERY_KEYS = {
  programs: ['programs'] as const,
  program: (id: string) => [...PROGRAM_QUERY_KEYS.programs, 'detail', id] as const,
  programConfig: (id: string) => [...PROGRAM_QUERY_KEYS.programs, 'config', id] as const,
} as const;

/**
 * Hook to fetch a specific program by ID
 */
export function useProgram(programId: string, enabled = true) {
  return useQuery({
    queryKey: PROGRAM_QUERY_KEYS.program(programId),
    queryFn: () => programsApi.getProgram(programId),
    enabled: enabled && !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch current program configuration
 */
export function useProgramConfiguration(programId?: string) {
  const { currentProgram } = useProgramContext();
  const targetProgramId = programId || currentProgram?.id;

  return useQuery({
    queryKey: PROGRAM_QUERY_KEYS.programConfig(targetProgramId || ''),
    queryFn: () => programsApi.getProgram(targetProgramId!),
    enabled: !!targetProgramId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => ({
      age_groups: data.age_groups || [],
      difficulty_levels: data.difficulty_levels || [],
      session_types: data.session_types || [],
      default_session_duration: data.default_session_duration || 60,
    }),
  });
}

/**
 * Hook to get age groups from current program
 */
export function useProgramAgeGroups(programId?: string) {
  const config = useProgramConfiguration(programId);
  
  return {
    ...config,
    data: config.data?.age_groups || [],
  };
}

/**
 * Hook to get difficulty levels from current program
 */
export function useProgramDifficultyLevels(programId?: string) {
  const config = useProgramConfiguration(programId);
  
  return {
    ...config,
    data: config.data?.difficulty_levels || [],
  };
}

/**
 * Hook to get session types from current program
 */
export function useProgramSessionTypes(programId?: string) {
  const config = useProgramConfiguration(programId);
  
  return {
    ...config,
    data: config.data?.session_types || [],
  };
}