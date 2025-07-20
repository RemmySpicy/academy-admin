/**
 * User Relationships React Hooks
 * 
 * Custom hooks for managing parent-child relationships using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
}

interface UpdateRelationshipData {
  relationship_type?: string;
  is_primary?: boolean;
  emergency_contact?: boolean;
  can_pick_up?: boolean;
  notes?: string;
}

const QUERY_KEYS = {
  USER_RELATIONSHIPS: 'userRelationships',
  USER_CHILDREN: 'userChildren',
  USER_PARENTS: 'userParents',
} as const;

// API functions (these would typically be in a separate API service file)
const userRelationshipsApi = {
  getUserRelationships: async (userId: string): Promise<UserRelationship[]> => {
    const response = await fetch(`/api/v1/users/${userId}/family`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user relationships');
    }
    
    const data = await response.json();
    return data.relationships || [];
  },

  createRelationship: async (data: CreateRelationshipData): Promise<UserRelationship> => {
    const response = await fetch('/api/v1/users/relationships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create relationship');
    }
    
    return response.json();
  },

  updateRelationship: async (id: string, data: UpdateRelationshipData): Promise<UserRelationship> => {
    const response = await fetch(`/api/v1/users/relationships/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update relationship');
    }
    
    return response.json();
  },

  deleteRelationship: async (id: string): Promise<void> => {
    const response = await fetch(`/api/v1/users/relationships/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete relationship');
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
      exclude_ids: excludeIds.join(','),
    });
    
    const response = await fetch(`/api/v1/users/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    
    const data = await response.json();
    return data.items || [];
  },
};

/**
 * Get all relationships for a user (both as parent and child)
 */
export const useUserRelationships = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, userId],
    queryFn: () => userRelationshipsApi.getUserRelationships(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get children relationships for a parent user
 */
export const useUserChildren = (parentUserId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_CHILDREN, parentUserId],
    queryFn: async () => {
      const relationships = await userRelationshipsApi.getUserRelationships(parentUserId);
      return relationships.filter(rel => rel.parent_user_id === parentUserId);
    },
    enabled: !!parentUserId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get parent relationships for a child user
 */
export const useUserParents = (childUserId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PARENTS, childUserId],
    queryFn: async () => {
      const relationships = await userRelationshipsApi.getUserRelationships(childUserId);
      return relationships.filter(rel => rel.child_user_id === childUserId);
    },
    enabled: !!childUserId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new parent-child relationship
 */
export const useCreateRelationship = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userRelationshipsApi.createRelationship,
    onSuccess: (newRelationship) => {
      // Invalidate queries for both parent and child
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, newRelationship.parent_user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_RELATIONSHIPS, newRelationship.child_user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_CHILDREN, newRelationship.parent_user_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_PARENTS, newRelationship.child_user_id] 
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

export type { UserRelationship, CreateRelationshipData, UpdateRelationshipData };