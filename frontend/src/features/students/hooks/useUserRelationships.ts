/**
 * User Relationships React Hooks
 * 
 * Custom hooks for managing parent-child relationships using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { httpClient } from '@/lib/api/httpClient';

interface UserRelationship {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  relationship_type: string;
  is_active: boolean;
  is_primary: boolean;
  emergency_contact: boolean;
  can_pick_up: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  parent_user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    phone?: string;
    is_active: boolean;
  };
  child_user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    date_of_birth?: string;
    phone?: string;
    is_active: boolean;
  };
}

interface CreateRelationshipData {
  parent_user_id: string;
  child_user_id: string;
  relationship_type: string;
  is_primary?: boolean;
  emergency_contact?: boolean;
  can_pick_up?: boolean;
  notes?: string;
  program_id?: string;
}

interface UpdateRelationshipData {
  relationship_type?: string;
  is_primary?: boolean;
  emergency_contact?: boolean;
  can_pick_up?: boolean;
  notes?: string;
}

interface FamilyStructureResponse {
  user: UserRelationship['parent_user'] | UserRelationship['child_user'];
  children: Array<{
    user: NonNullable<UserRelationship['child_user']>;
    relationship_type: string;
    is_primary: boolean;
    relationship_id: string;
  }>;
  parents: Array<{
    user: NonNullable<UserRelationship['parent_user']>;
    relationship_type: string;
    is_primary: boolean;
    relationship_id: string;
  }>;
  relationships: UserRelationship[];
}

const QUERY_KEYS = {
  USER_RELATIONSHIPS: 'userRelationships',
  USER_CHILDREN: 'userChildren',
  USER_PARENTS: 'userParents',
} as const;

// API functions using centralized HTTP client with program context support
const userRelationshipsApi = {
  getUserRelationships: async (userId: string): Promise<UserRelationship[]> => {
    const response = await httpClient.get<FamilyStructureResponse>(
      API_ENDPOINTS.users.family(userId)
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user relationships');
    }
    
    return response.data.relationships || [];
  },

  createRelationship: async (data: CreateRelationshipData): Promise<UserRelationship> => {
    const response = await httpClient.post<UserRelationship>(
      API_ENDPOINTS.users.createRelationship, 
      data
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create relationship');
    }
    
    return response.data;
  },

  updateRelationship: async (id: string, data: UpdateRelationshipData): Promise<UserRelationship> => {
    const response = await httpClient.put<UserRelationship>(
      API_ENDPOINTS.users.updateRelationship(id), 
      data
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update relationship');
    }
    
    return response.data;
  },

  deleteRelationship: async (id: string): Promise<void> => {
    const response = await httpClient.delete<void>(
      API_ENDPOINTS.users.deleteRelationship(id)
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete relationship');
    }
  },

  searchUsers: async (query: string, excludeIds: string[] = []): Promise<Array<{
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
  }>> => {
    const params = new URLSearchParams({
      search: query,
      ...(excludeIds.length > 0 && { exclude_ids: excludeIds.join(',') }),
    });
    
    const response = await httpClient.get<{
      items: Array<{
        id: string;
        username: string;
        email: string;
        full_name: string;
        role: string;
      }>;
    }>(`${API_ENDPOINTS.users.search}?${params}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to search users');
    }
    
    return response.data.items || [];
  },
};

/**
 * Get all relationships for a user (both as parent and child)
 * Optimized cache configuration for family data
 */
export const useUserRelationships = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, userId],
    queryFn: () => userRelationshipsApi.getUserRelationships(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - family relationships rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnReconnect: 'always', // Refetch when network reconnects
  });
};

/**
 * Get children relationships for a parent user
 * Optimized to use cached family data instead of separate API call
 */
export const useUserChildren = (parentUserId: string) => {
  const { data: allRelationships, ...queryInfo } = useUserRelationships(parentUserId);
  
  return {
    ...queryInfo,
    data: allRelationships?.filter(rel => rel.parent_user_id === parentUserId) || [],
  };
};

/**
 * Get parent relationships for a child user
 * Optimized to use cached family data instead of separate API call
 */
export const useUserParents = (childUserId: string) => {
  const { data: allRelationships, ...queryInfo } = useUserRelationships(childUserId);
  
  return {
    ...queryInfo,
    data: allRelationships?.filter(rel => rel.child_user_id === childUserId) || [],
  };
};

/**
 * Create a new parent-child relationship
 */
export const useCreateRelationship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userRelationshipsApi.createRelationship,
    onSuccess: (newRelationship) => {
      // Optimized cache updates - update data directly instead of invalidating
      queryClient.setQueryData(
        [QUERY_KEYS.USER_CHILDREN, newRelationship.parent_user_id],
        (oldData: UserRelationship[] | undefined) => {
          return oldData ? [...oldData, newRelationship] : [newRelationship];
        }
      );
      
      queryClient.setQueryData(
        [QUERY_KEYS.USER_PARENTS, newRelationship.child_user_id],
        (oldData: UserRelationship[] | undefined) => {
          return oldData ? [...oldData, newRelationship] : [newRelationship];
        }
      );
      
      // Only invalidate the broader relationships if direct update fails
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, newRelationship.parent_user_id],
        refetchType: 'none' // Don't refetch immediately
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, newRelationship.child_user_id],
        refetchType: 'none'
      });
      
      toast.success('Family relationship created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create relationship: ${error.message}`);
    },
  });
};

/**
 * Update an existing relationship
 */
export const useUpdateRelationship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRelationshipData }) =>
      userRelationshipsApi.updateRelationship(id, data),
    onSuccess: (updatedRelationship) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, updatedRelationship.parent_user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, updatedRelationship.child_user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_CHILDREN, updatedRelationship.parent_user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_PARENTS, updatedRelationship.child_user_id] 
      });
      
      toast.success('Relationship updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update relationship: ${error.message}`);
    },
  });
};

/**
 * Delete a relationship
 */
export const useDeleteRelationship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userRelationshipsApi.deleteRelationship,
    onSuccess: () => {
      // Invalidate all relationship queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_RELATIONSHIPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_CHILDREN] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PARENTS] });
      
      toast.success('Relationship deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete relationship: ${error.message}`);
    },
  });
};

/**
 * Search for users to create relationships with
 */
export const useSearchUsers = (query: string, excludeIds: string[] = []) => {
  return useQuery({
    queryKey: ['searchUsers', query, excludeIds],
    queryFn: () => userRelationshipsApi.searchUsers(query, excludeIds),
    enabled: query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });
};

export type { 
  UserRelationship, 
  CreateRelationshipData, 
  UpdateRelationshipData, 
  FamilyStructureResponse 
};