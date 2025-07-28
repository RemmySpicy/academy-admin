/**
 * React hooks for content versioning
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { httpClient } from '@/lib/api/httpClient';
import type { SearchParams } from '@/lib/api/types';

// Content versioning types
export interface ContentVersion {
  id: string;
  content_id: string;
  content_type: 'lesson' | 'assessment';
  version_number: string;
  title: string;
  description?: string;
  content_data: any; // Full content object
  change_summary: string;
  created_by: string;
  created_at: string;
  is_current: boolean;
  is_published: boolean;
  tags?: string[];
  file_size: number;
  checksum: string;
}

export interface VersionComparison {
  version_a: ContentVersion;
  version_b: ContentVersion;
  differences: {
    field: string;
    old_value: any;
    new_value: any;
    change_type: 'added' | 'removed' | 'modified';
  }[];
}

export interface VersionCreate {
  content_id: string;
  content_type: 'lesson' | 'assessment';
  title: string;
  description?: string;
  change_summary: string;
  content_data: any;
  tags?: string[];
}

export interface VersionSearchParams extends SearchParams {
  content_id?: string;
  content_type?: 'lesson' | 'assessment';
  is_published?: boolean;
}

// Query Keys
export const VERSIONING_QUERY_KEYS = {
  VERSIONS: 'content-versions',
  VERSION: 'content-version',
  COMPARISON: 'version-comparison',
  VERSION_STATS: 'version-stats',
} as const;

// Mock implementation for now - will be replaced with real API calls
const mockVersioningApiService = {
  getVersions: async (params: VersionSearchParams = {}): Promise<ContentVersion[]> => {
    // Return mock version data
    const mockVersions: ContentVersion[] = [
      {
        id: '1',
        content_id: params.content_id || 'lesson-1',
        content_type: params.content_type || 'lesson',
        version_number: '3.0',
        title: 'Added interactive elements',
        description: 'Enhanced lesson with interactive components and updated examples',
        content_data: {
          name: 'Introduction to Programming',
          description: 'Learn the basics of programming with interactive examples',
          objectives: ['Understand variables', 'Learn functions', 'Practice loops'],
          interactive_elements: ['code_sandbox', 'quiz', 'video'],
        },
        change_summary: 'Added interactive code sandbox and quiz sections',
        created_by: 'admin',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        is_current: true,
        is_published: true,
        tags: ['interactive', 'enhanced'],
        file_size: 15420,
        checksum: 'abc123def456',
      },
      {
        id: '2',
        content_id: params.content_id || 'lesson-1',
        content_type: params.content_type || 'lesson',
        version_number: '2.1',
        title: 'Updated content structure',
        description: 'Reorganized content for better flow and readability',
        content_data: {
          name: 'Introduction to Programming',
          description: 'Learn the basics of programming',
          objectives: ['Understand variables', 'Learn functions', 'Practice loops'],
        },
        change_summary: 'Restructured content sections and improved descriptions',
        created_by: 'admin',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        is_current: false,
        is_published: true,
        tags: ['restructure'],
        file_size: 12340,
        checksum: 'def456ghi789',
      },
      {
        id: '3',
        content_id: params.content_id || 'lesson-1',
        content_type: params.content_type || 'lesson',
        version_number: '2.0',
        title: 'Initial published version',
        description: 'First published version of the lesson',
        content_data: {
          name: 'Introduction to Programming',
          description: 'Basic programming concepts',
          objectives: ['Variables', 'Functions'],
        },
        change_summary: 'Initial version published',
        created_by: 'admin',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        is_current: false,
        is_published: true,
        tags: ['initial'],
        file_size: 8920,
        checksum: 'ghi789jkl012',
      },
    ];

    return mockVersions.filter(version => {
      if (params.content_id && version.content_id !== params.content_id) return false;
      if (params.content_type && version.content_type !== params.content_type) return false;
      if (params.is_published !== undefined && version.is_published !== params.is_published) return false;
      return true;
    });
  },

  getVersion: async (id: string): Promise<ContentVersion> => {
    const response = await httpClient.get<ContentVersion>(`/api/v1/content/versions/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch version');
  },

  createVersion: async (data: VersionCreate): Promise<ContentVersion> => {
    const response = await httpClient.post<ContentVersion>('/api/v1/content/versions', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create version');
  },

  restoreVersion: async (versionId: string): Promise<ContentVersion> => {
    const response = await httpClient.post<ContentVersion>(`/api/v1/content/versions/${versionId}/restore`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to restore version');
  },

  compareVersions: async (versionAId: string, versionBId: string): Promise<VersionComparison> => {
    // Mock comparison data
    const mockComparison: VersionComparison = {
      version_a: {
        id: versionAId,
        content_id: 'lesson-1',
        content_type: 'lesson',
        version_number: '3.0',
        title: 'Added interactive elements',
        description: 'Enhanced lesson with interactive components',
        content_data: {},
        change_summary: 'Added interactive elements',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        is_current: true,
        is_published: true,
        file_size: 15420,
        checksum: 'abc123',
      },
      version_b: {
        id: versionBId,
        content_id: 'lesson-1',
        content_type: 'lesson',
        version_number: '2.1',
        title: 'Updated content structure',
        description: 'Reorganized content for better flow',
        content_data: {},
        change_summary: 'Restructured content',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        is_current: false,
        is_published: true,
        file_size: 12340,
        checksum: 'def456',
      },
      differences: [
        {
          field: 'description',
          old_value: 'Learn the basics of programming',
          new_value: 'Learn the basics of programming with interactive examples',
          change_type: 'modified',
        },
        {
          field: 'interactive_elements',
          old_value: null,
          new_value: ['code_sandbox', 'quiz', 'video'],
          change_type: 'added',
        },
        {
          field: 'objectives',
          old_value: ['Understand variables', 'Learn functions'],
          new_value: ['Understand variables', 'Learn functions', 'Practice loops'],
          change_type: 'modified',
        },
      ],
    };

    return mockComparison;
  },

  deleteVersion: async (id: string): Promise<void> => {
    const response = await httpClient.delete(`/api/v1/content/versions/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete version');
    }
  },

  getVersionStats: async (contentId: string): Promise<{
    total_versions: number;
    published_versions: number;
    current_version: string;
    total_size: number;
    created_by_stats: Record<string, number>;
  }> => {
    return {
      total_versions: 3,
      published_versions: 3,
      current_version: '3.0',
      total_size: 36680,
      created_by_stats: {
        'admin': 3,
      },
    };
  },
};

// Content Versioning Hooks
export const useContentVersions = (params: VersionSearchParams = {}) => {
  return useQuery({
    queryKey: [VERSIONING_QUERY_KEYS.VERSIONS, params],
    queryFn: () => mockVersioningApiService.getVersions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
    enabled: !!params.content_id,
  });
};

export const useContentVersion = (id: string) => {
  return useQuery({
    queryKey: [VERSIONING_QUERY_KEYS.VERSION, id],
    queryFn: () => mockVersioningApiService.getVersion(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVersionComparison = () => {
  return useQuery({
    queryKey: [VERSIONING_QUERY_KEYS.COMPARISON],
    queryFn: () => null, // Will be set by mutation
    enabled: false,
  });
};

export const useVersionStats = (contentId: string) => {
  return useQuery({
    queryKey: [VERSIONING_QUERY_KEYS.VERSION_STATS, contentId],
    queryFn: () => mockVersioningApiService.getVersionStats(contentId),
    enabled: !!contentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VersionCreate) => mockVersioningApiService.createVersion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [VERSIONING_QUERY_KEYS.VERSIONS, { content_id: variables.content_id }] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [VERSIONING_QUERY_KEYS.VERSION_STATS, variables.content_id] 
      });
      toast.success('Version created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create version: ${error.message}`);
    },
  });
};

export const useRestoreVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (versionId: string) => mockVersioningApiService.restoreVersion(versionId),
    onSuccess: (restoredVersion) => {
      queryClient.invalidateQueries({ 
        queryKey: [VERSIONING_QUERY_KEYS.VERSIONS, { content_id: restoredVersion.content_id }] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [VERSIONING_QUERY_KEYS.VERSION_STATS, restoredVersion.content_id] 
      });
      toast.success('Version restored successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore version: ${error.message}`);
    },
  });
};

export const useCompareVersions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ version_a_id, version_b_id }: { version_a_id: string; version_b_id: string }) => 
      mockVersioningApiService.compareVersions(version_a_id, version_b_id),
    onSuccess: (comparison) => {
      queryClient.setQueryData([VERSIONING_QUERY_KEYS.COMPARISON], comparison);
    },
    onError: (error: Error) => {
      toast.error(`Failed to compare versions: ${error.message}`);
    },
  });
};

export const useDeleteVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockVersioningApiService.deleteVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VERSIONING_QUERY_KEYS.VERSIONS] });
      toast.success('Version deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete version: ${error.message}`);
    },
  });
};

// Convenience hook for content versioning
export const useContentVersioning = (params: VersionSearchParams = {}) => {
  const versions = useContentVersions(params);
  const comparison = useVersionComparison();
  const stats = useVersionStats(params.content_id || '');
  const createVersion = useCreateVersion();
  const restoreVersion = useRestoreVersion();
  const compareVersions = useCompareVersions();
  const deleteVersion = useDeleteVersion();
  
  return {
    versions: versions.data || [],
    comparison: comparison.data,
    stats: stats.data,
    isLoading: versions.isLoading || stats.isLoading,
    hasError: versions.error || stats.error,
    createVersion,
    restoreVersion,
    compareVersions,
    deleteVersion,
    
    // Computed values
    totalVersions: versions.data?.length || 0,
    currentVersion: versions.data?.find(v => v.is_current),
    publishedVersions: versions.data?.filter(v => v.is_published).length || 0,
    latestVersion: versions.data?.[0], // Assuming sorted by creation date desc
  };
};