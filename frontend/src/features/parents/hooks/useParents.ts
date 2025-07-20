/**
 * React hooks for parent management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentApi, type ParentSearchParams, type ParentStats, type EnhancedParent } from '../api/parentApi';
import type { User, UserCreate, UserUpdate, FamilyStructure } from '@/lib/api/types';

// Query keys for React Query
export const parentKeys = {
  all: ['parents'] as const,
  lists: () => [...parentKeys.all, 'list'] as const,
  list: (params: ParentSearchParams) => [...parentKeys.lists(), params] as const,
  details: () => [...parentKeys.all, 'detail'] as const,
  detail: (id: string) => [...parentKeys.details(), id] as const,
  stats: () => [...parentKeys.all, 'stats'] as const,
  family: (id: string) => [...parentKeys.detail(id), 'family'] as const,
  children: (id: string) => [...parentKeys.detail(id), 'children'] as const,
};

/**
 * Hook to get paginated list of parents
 */
export function useParents(
  searchParams: ParentSearchParams = {},
  page: number = 1,
  per_page: number = 20
) {
  return useQuery({
    queryKey: parentKeys.list({ ...searchParams, page, per_page }),
    queryFn: () => parentApi.getAll(searchParams, page, per_page),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get parent statistics
 */
export function useParentStats() {
  return useQuery({
    queryKey: parentKeys.stats(),
    queryFn: () => parentApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get specific parent by ID
 */
export function useParent(parentId: string) {
  return useQuery({
    queryKey: parentKeys.detail(parentId),
    queryFn: () => parentApi.getById(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get parent's family structure
 */
export function useParentFamily(parentId: string) {
  return useQuery({
    queryKey: parentKeys.family(parentId),
    queryFn: () => parentApi.getFamilyStructure(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get children for a parent
 */
export function useParentChildren(parentId: string) {
  return useQuery({
    queryKey: parentKeys.children(parentId),
    queryFn: () => parentApi.getChildrenForParent(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new parent
 */
export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (parentData: UserCreate) => parentApi.create(parentData),
    onSuccess: () => {
      // Invalidate all parent queries to refresh data
      queryClient.invalidateQueries({ queryKey: parentKeys.all });
    },
  });
}

/**
 * Hook to update parent information
 */
export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: UserUpdate }) =>
      parentApi.update(parentId, data),
    onSuccess: (_, { parentId }) => {
      // Invalidate specific parent and lists
      queryClient.invalidateQueries({ queryKey: parentKeys.detail(parentId) });
      queryClient.invalidateQueries({ queryKey: parentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: parentKeys.stats() });
    },
  });
}

/**
 * Hook to delete a parent
 */
export function useDeleteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (parentId: string) => parentApi.delete(parentId),
    onSuccess: () => {
      // Invalidate all parent queries
      queryClient.invalidateQueries({ queryKey: parentKeys.all });
    },
  });
}

/**
 * Hook for bulk parent operations
 */
export function useBulkParentActions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentIds,
      action,
      data,
    }: {
      parentIds: string[];
      action: 'activate' | 'deactivate' | 'delete';
      data?: Record<string, any>;
    }) => parentApi.bulkUpdate(parentIds, action, data),
    onSuccess: () => {
      // Invalidate all parent queries
      queryClient.invalidateQueries({ queryKey: parentKeys.all });
    },
  });
}

/**
 * Hook to search parents with debounced search
 */
export function useParentSearch(searchParams: ParentSearchParams, debounceMs: number = 300) {
  return useQuery({
    queryKey: parentKeys.list(searchParams),
    queryFn: () => parentApi.search(searchParams),
    enabled: !!searchParams.search || Object.keys(searchParams).length > 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get parents for a specific child
 */
export function useParentsForChild(childId: string) {
  return useQuery({
    queryKey: ['students', childId, 'parents'],
    queryFn: () => parentApi.getParentsForChild(childId),
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Custom hook for parent export functionality
 */
export function useParentExport() {
  return useMutation({
    mutationFn: ({
      format,
      filters,
    }: {
      format: 'csv' | 'xlsx';
      filters?: ParentSearchParams;
    }) => parentApi.export(format, filters),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `parents-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    },
  });
}

/**
 * Hook to manage parent list state with caching
 */
export function useParentListState(initialParams: ParentSearchParams = {}) {
  const queryClient = useQueryClient();

  const refreshParents = () => {
    queryClient.invalidateQueries({ queryKey: parentKeys.lists() });
  };

  const refreshParentStats = () => {
    queryClient.invalidateQueries({ queryKey: parentKeys.stats() });
  };

  const refreshParent = (parentId: string) => {
    queryClient.invalidateQueries({ queryKey: parentKeys.detail(parentId) });
  };

  const prefetchParent = (parentId: string) => {
    queryClient.prefetchQuery({
      queryKey: parentKeys.detail(parentId),
      queryFn: () => parentApi.getById(parentId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    refreshParents,
    refreshParentStats,
    refreshParent,
    prefetchParent,
  };
}