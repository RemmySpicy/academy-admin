/**
 * Teams hooks with program context integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgramContext } from '@/store/programContext';
import { teamApi } from '../api/teamApi';
import type { TeamMember, AvailableUser, TeamStats } from '../api/teamApi';

// Query keys
export const TEAM_QUERY_KEYS = {
  all: ['teams'] as const,
  members: () => [...TEAM_QUERY_KEYS.all, 'members'] as const,
  availableUsers: () => [...TEAM_QUERY_KEYS.all, 'available-users'] as const,
  stats: () => [...TEAM_QUERY_KEYS.all, 'stats'] as const,
};

/**
 * Hook to fetch team members with program context
 */
export function useTeamMembers() {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...TEAM_QUERY_KEYS.members(), currentProgram?.id],
    queryFn: async () => {
      const response = await teamApi.getTeamMembers();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch team members');
      }
      return response.data;
    },
    enabled: !!currentProgram, // Only fetch when we have a program context
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch available users for team assignment
 */
export function useAvailableUsers() {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...TEAM_QUERY_KEYS.availableUsers(), currentProgram?.id],
    queryFn: async () => {
      const response = await teamApi.getAvailableUsers();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch available users');
      }
      return response.data;
    },
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch team statistics
 */
export function useTeamStats() {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [...TEAM_QUERY_KEYS.stats(), currentProgram?.id],
    queryFn: async () => {
      const response = await teamApi.getTeamStats();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch team statistics');
      }
      return response.data;
    },
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to add a team member
 */
export function useAddTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const response = await teamApi.addTeamMember(data.userId, data.role);
      if (!response.success) {
        throw new Error(response.error || 'Failed to add team member');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch team queries
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update a team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; role?: string; isActive?: boolean }) => {
      const response = await teamApi.updateTeamMember(data.userId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update team member');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate team queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to remove a team member
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await teamApi.removeTeamMember(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove team member');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate team queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
    },
  });
}