/**
 * Academy Users React Hooks
 * 
 * Custom hooks for managing academy-wide users using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academyUsersApi } from '../api';
import { ACADEMY_QUERY_KEYS } from './useAcademyPrograms';
import type {
  User,
  UserCreate,
  UserUpdate,
  SearchParams,
  PaginatedResponse
} from '@/lib/api/types';

/**
 * Get all academy users
 */
export const useAcademyUsers = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.USERS, params],
    queryFn: async () => {
      const response = await academyUsersApi.getUsers(params);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch academy users');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get a specific academy user
 */
export const useAcademyUser = (id: string) => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.USER, id],
    queryFn: async () => {
      const response = await academyUsersApi.getUser(id);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch academy user');
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new academy user
 */
export const useCreateAcademyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UserCreate) => {
      const response = await academyUsersApi.createUser(data);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to create user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USER_STATS] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
};

/**
 * Update an academy user
 */
export const useUpdateAcademyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserUpdate }) => {
      const response = await academyUsersApi.updateUser(id, data);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to update user');
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USER, id] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USER_STATS] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};

/**
 * Delete an academy user
 */
export const useDeleteAcademyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await academyUsersApi.deleteUser(id);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to delete user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USER_STATS] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
};

/**
 * Assign user to program
 */
export const useAssignUserToProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, programId }: { userId: string; programId: string }) => {
      const response = await academyUsersApi.assignUserToProgram(userId, programId);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to assign user to program');
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USER, userId] });
      toast.success('User assigned to program successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign user to program: ${error.message}`);
    },
  });
};

/**
 * Remove user from program
 */
export const useRemoveUserFromProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, programId }: { userId: string; programId: string }) => {
      const response = await academyUsersApi.removeUserFromProgram(userId, programId);
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to remove user from program');
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [ACADEMY_QUERY_KEYS.USER, userId] });
      toast.success('User removed from program successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove user from program: ${error.message}`);
    },
  });
};

/**
 * Get academy user statistics
 */
export const useAcademyUserStats = () => {
  return useQuery({
    queryKey: [ACADEMY_QUERY_KEYS.USER_STATS],
    queryFn: async () => {
      const response = await academyUsersApi.getUserStats();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch user statistics');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
};