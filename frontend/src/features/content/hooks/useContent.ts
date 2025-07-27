/**
 * Content Management Hooks - TanStack Query hooks for unified content management
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProgramContext } from '@/store/programContext';
import { 
  contentApiService, 
  type ContentItem, 
  type ContentSearchParams, 
  type ContentCreateData, 
  type ContentUpdateData,
  type ContentVersionData,
  type CurriculumAssignmentData,
  type BulkContentAction,
  type ContentUsageInfo
} from '../api/contentApiService';
import { toast } from 'sonner';

// Legacy imports for compatibility
import { httpClient } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  Lesson,
  LessonCreate,
  LessonUpdate,
  Assessment,
  AssessmentCreate,
  AssessmentUpdate,
  AssessmentCriteria,
  AssessmentCriteriaCreate,
  AssessmentCriteriaUpdate,
  SearchParams,
  PaginatedResponse,
  ContentType,
  AssessmentType,
} from '@/lib/api/types';

// New Unified Query Keys
export const contentQueryKeys = {
  all: ['content'] as const,
  lists: () => [...contentQueryKeys.all, 'list'] as const,
  list: (params: ContentSearchParams) => [...contentQueryKeys.lists(), params] as const,
  details: () => [...contentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contentQueryKeys.details(), id] as const,
  usage: (id: string) => [...contentQueryKeys.all, 'usage', id] as const,
  lockStatus: (id: string) => [...contentQueryKeys.all, 'lock', id] as const,
};

// Legacy Query Keys (for backward compatibility)
export const CONTENT_QUERY_KEYS = {
  LESSONS: 'lessons',
  LESSON: 'lesson',
  ASSESSMENTS: 'assessments',
  ASSESSMENT: 'assessment',
  ASSESSMENT_CRITERIA: 'assessment-criteria',
  ALL_CONTENT: 'all-content',
  CONTENT_STATS: 'content-stats',
} as const;

// Combined content response type
export interface ContentItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  objectives?: string;
  sequence: number;
  status: string;
  difficulty_level?: string;
  created_at: string;
  updated_at: string;
  type: 'lesson' | 'assessment';
  content_type?: ContentType;
  assessment_type?: AssessmentType;
  duration_minutes?: number;
  is_interactive?: boolean;
  is_required?: boolean;
  max_score?: number;
  passing_score?: number;
  curriculum_name?: string;
  course_name?: string;
  hierarchy_path?: string;
}

export interface ContentSearchParams extends SearchParams {
  content_type?: 'lesson' | 'assessment' | 'all';
  status?: string;
  difficulty_level?: string;
  course_id?: string;
  curriculum_id?: string;
}

// Content Stats Response
export interface ContentStatsResponse {
  total_lessons: number;
  total_assessments: number;
  total_content: number;
  content_by_type: {
    lessons: number;
    assessments: number;
  };
  content_by_status: {
    draft: number;
    published: number;
    archived: number;
  };
  content_by_difficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  average_lesson_duration: number;
  average_assessment_duration: number;
}

// Mock implementation for now - will be replaced with real API calls
const mockContentApiService = {
  getAllContent: async (params: ContentSearchParams = {}): Promise<PaginatedResponse<ContentItem>> => {
    // This would normally be a real API call
    // For now, return mock data structure
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.per_page || 20,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    };
  },

  getContentStats: async (): Promise<ContentStatsResponse> => {
    return {
      total_lessons: 0,
      total_assessments: 0,
      total_content: 0,
      content_by_type: {
        lessons: 0,
        assessments: 0,
      },
      content_by_status: {
        draft: 0,
        published: 0,
        archived: 0,
      },
      content_by_difficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
      },
      average_lesson_duration: 0,
      average_assessment_duration: 0,
    };
  },

  getLessons: async (params: SearchParams = {}): Promise<PaginatedResponse<Lesson>> => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, value.toString()])
    ).toString();
    
    const response = await httpClient.get<PaginatedResponse<Lesson>>(
      `${API_ENDPOINTS.content.lessons.list}${queryString ? `?${queryString}` : ''}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch lessons');
  },

  getLesson: async (id: string): Promise<Lesson> => {
    const response = await httpClient.get<Lesson>(API_ENDPOINTS.content.lessons.get(id));
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch lesson');
  },

  createLesson: async (data: LessonCreate): Promise<Lesson> => {
    const response = await httpClient.post<Lesson>(API_ENDPOINTS.content.lessons.create, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create lesson');
  },

  updateLesson: async (id: string, data: LessonUpdate): Promise<Lesson> => {
    const response = await httpClient.put<Lesson>(API_ENDPOINTS.content.lessons.update(id), data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update lesson');
  },

  deleteLesson: async (id: string): Promise<void> => {
    const response = await httpClient.delete(API_ENDPOINTS.content.lessons.delete(id));
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete lesson');
    }
  },

  getAssessments: async (params: SearchParams = {}): Promise<PaginatedResponse<Assessment>> => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, value.toString()])
    ).toString();
    
    const response = await httpClient.get<PaginatedResponse<Assessment>>(
      `${API_ENDPOINTS.content.assessments.list}${queryString ? `?${queryString}` : ''}`
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch assessments');
  },

  getAssessment: async (id: string): Promise<Assessment> => {
    const response = await httpClient.get<Assessment>(API_ENDPOINTS.content.assessments.get(id));
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch assessment');
  },

  createAssessment: async (data: AssessmentCreate): Promise<Assessment> => {
    const response = await httpClient.post<Assessment>(API_ENDPOINTS.content.assessments.create, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create assessment');
  },

  updateAssessment: async (id: string, data: AssessmentUpdate): Promise<Assessment> => {
    const response = await httpClient.put<Assessment>(API_ENDPOINTS.content.assessments.update(id), data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update assessment');
  },

  deleteAssessment: async (id: string): Promise<void> => {
    const response = await httpClient.delete(API_ENDPOINTS.content.assessments.delete(id));
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete assessment');
    }
  },

  getAssessmentCriteria: async (assessmentId: string): Promise<AssessmentCriteria[]> => {
    const response = await httpClient.get<AssessmentCriteria[]>(API_ENDPOINTS.content.assessments.criteria.list(assessmentId));
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch assessment criteria');
  },

  createAssessmentCriteria: async (data: AssessmentCriteriaCreate): Promise<AssessmentCriteria> => {
    const response = await httpClient.post<AssessmentCriteria>(API_ENDPOINTS.content.assessments.criteria.create(data.assessment_id), data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create assessment criteria');
  },

  updateAssessmentCriteria: async (id: string, data: AssessmentCriteriaUpdate): Promise<AssessmentCriteria> => {
    const response = await httpClient.put<AssessmentCriteria>(API_ENDPOINTS.content.assessments.criteria.update(id), data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update assessment criteria');
  },

  deleteAssessmentCriteria: async (id: string): Promise<void> => {
    const response = await httpClient.delete(API_ENDPOINTS.content.assessments.criteria.delete(id));
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete assessment criteria');
    }
  },

  reorderAssessmentCriteria: async (assessmentId: string, reorderData: Array<{ id: string; sequence: number }>): Promise<void> => {
    const response = await httpClient.post(API_ENDPOINTS.content.assessments.criteria.reorder(assessmentId), reorderData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reorder assessment criteria');
    }
  },
};

// Content Hooks
export const useAllContent = (params: ContentSearchParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT, params],
    queryFn: () => mockContentApiService.getAllContent(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

export const useContentStats = () => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS],
    queryFn: mockContentApiService.getContentStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLessons = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.LESSONS, params],
    queryFn: () => mockContentApiService.getLessons(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useLesson = (id: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.LESSON, id],
    queryFn: () => mockContentApiService.getLesson(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LessonCreate) => mockContentApiService.createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.LESSONS] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS] });
      toast.success('Lesson created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create lesson: ${error.message}`);
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonUpdate }) => 
      mockContentApiService.updateLesson(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.LESSONS] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.LESSON, id] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS] });
      toast.success('Lesson updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update lesson: ${error.message}`);
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockContentApiService.deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.LESSONS] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS] });
      toast.success('Lesson deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete lesson: ${error.message}`);
    },
  });
};

export const useAssessments = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.ASSESSMENTS, params],
    queryFn: () => mockContentApiService.getAssessments(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useAssessment = (id: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT, id],
    queryFn: () => mockContentApiService.getAssessment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AssessmentCreate) => mockContentApiService.createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENTS] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS] });
      toast.success('Assessment created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create assessment: ${error.message}`);
    },
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssessmentUpdate }) => 
      mockContentApiService.updateAssessment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENTS] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT, id] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS] });
      toast.success('Assessment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update assessment: ${error.message}`);
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockContentApiService.deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENTS] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ALL_CONTENT] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.CONTENT_STATS] });
      toast.success('Assessment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete assessment: ${error.message}`);
    },
  });
};

export const useAssessmentCriteria = (assessmentId: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT_CRITERIA, assessmentId],
    queryFn: () => mockContentApiService.getAssessmentCriteria(assessmentId),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAssessmentCriteria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AssessmentCriteriaCreate) => mockContentApiService.createAssessmentCriteria(data),
    onSuccess: (_, { assessment_id }) => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT_CRITERIA, assessment_id] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT, assessment_id] });
      toast.success('Assessment criteria created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create assessment criteria: ${error.message}`);
    },
  });
};

export const useUpdateAssessmentCriteria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssessmentCriteriaUpdate }) => 
      mockContentApiService.updateAssessmentCriteria(id, data),
    onSuccess: (criteria) => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT_CRITERIA, criteria.assessment_id] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT, criteria.assessment_id] });
      toast.success('Assessment criteria updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update assessment criteria: ${error.message}`);
    },
  });
};

export const useDeleteAssessmentCriteria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockContentApiService.deleteAssessmentCriteria(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT_CRITERIA] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT] });
      toast.success('Assessment criteria deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete assessment criteria: ${error.message}`);
    },
  });
};

export const useReorderAssessmentCriteria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assessmentId, reorderData }: { assessmentId: string; reorderData: Array<{ id: string; sequence: number }> }) => 
      mockContentApiService.reorderAssessmentCriteria(assessmentId, reorderData),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT_CRITERIA, assessmentId] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_QUERY_KEYS.ASSESSMENT, assessmentId] });
      toast.success('Assessment criteria reordered successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder assessment criteria: ${error.message}`);
    },
  });
};

// Convenience hook for content management
export const useContentManagement = (params: ContentSearchParams = {}) => {
  const allContent = useAllContent(params);
  const contentStats = useContentStats();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();
  const deleteAssessment = useDeleteAssessment();
  const createAssessmentCriteria = useCreateAssessmentCriteria();
  const updateAssessmentCriteria = useUpdateAssessmentCriteria();
  const deleteAssessmentCriteria = useDeleteAssessmentCriteria();
  const reorderAssessmentCriteria = useReorderAssessmentCriteria();
  
  return {
    allContent,
    contentStats,
    createLesson,
    updateLesson,
    deleteLesson,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    createAssessmentCriteria,
    updateAssessmentCriteria,
    deleteAssessmentCriteria,
    reorderAssessmentCriteria,
    
    // Computed values
    isLoading: allContent.isLoading || contentStats.isLoading,
    hasError: allContent.error || contentStats.error,
    totalContent: allContent.data?.total || 0,
    contentItems: allContent.data?.items || [],
    stats: contentStats.data,
  };
};

// =============================================================================
// NEW UNIFIED CONTENT HOOKS
// =============================================================================

// Hook for fetching content list with search/filter
export function useContent(params: ContentSearchParams = {}) {
  const { currentProgram } = useProgramContext();
  const currentProgramId = currentProgram?.id;
  
  return useQuery({
    queryKey: contentQueryKeys.list({ ...params, program_id: currentProgramId }),
    queryFn: async () => {
      const response = await contentApiService.getContent(params);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch content');
      }
      return response.data;
    },
    enabled: !!currentProgramId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

// Hook for fetching single content item
export function useContentDetail(id: string) {
  return useQuery({
    queryKey: contentQueryKeys.detail(id),
    queryFn: async () => {
      const response = await contentApiService.getContentById(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch content details');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 30000,
  });
}

// Hook for content usage information
export function useContentUsage(id: string) {
  return useQuery({
    queryKey: contentQueryKeys.usage(id),
    queryFn: async () => {
      const response = await contentApiService.getContentUsage(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch usage information');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute - usage info changes less frequently
  });
}

// Hook for content edit lock status
export function useContentLockStatus(id: string) {
  return useQuery({
    queryKey: contentQueryKeys.lockStatus(id),
    queryFn: async () => {
      const response = await contentApiService.checkEditLock(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to check lock status');
      }
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 0, // Always fresh for lock status
  });
}

// Content mutation hooks
export function useContentMutations() {
  const queryClient = useQueryClient();
  const { currentProgram } = useProgramContext();
  const currentProgramId = currentProgram?.id;

  const createContent = useMutation({
    mutationFn: async (data: ContentCreateData) => {
      const response = await contentApiService.createContent(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create content');
      }
      return response.data;
    },
    onSuccess: (newContent) => {
      // Invalidate content lists
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(
        contentQueryKeys.detail(newContent.id), 
        newContent
      );
      
      toast.success('Content created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      versionData 
    }: { 
      id: string; 
      data: ContentUpdateData; 
      versionData?: ContentVersionData;
    }) => {
      const response = await contentApiService.updateContent(id, data, versionData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update content');
      }
      return response.data;
    },
    onSuccess: (updatedContent, { id, versionData }) => {
      // Update content detail cache
      queryClient.setQueryData(
        contentQueryKeys.detail(id), 
        updatedContent
      );
      
      // Invalidate content lists to reflect changes
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lists() });
      
      // If creating new version, invalidate usage queries for affected curricula
      if (versionData?.version_strategy === 'new_version') {
        queryClient.invalidateQueries({ queryKey: contentQueryKeys.usage(id) });
      }
      
      toast.success(
        versionData?.version_strategy === 'new_version' 
          ? 'New version created successfully' 
          : 'Content updated successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteContent = useMutation({
    mutationFn: async ({ id, force }: { id: string; force?: boolean }) => {
      const response = await contentApiService.deleteContent(id, force);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete content');
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contentQueryKeys.detail(id) });
      queryClient.removeQueries({ queryKey: contentQueryKeys.usage(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lists() });
      
      toast.success('Content deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const duplicateContent = useMutation({
    mutationFn: async ({ 
      id, 
      options 
    }: { 
      id: string; 
      options?: { 
        new_name?: string; 
        copy_usage?: boolean; 
        assign_to_curriculum?: string;
      };
    }) => {
      const response = await contentApiService.duplicateContent(id, options);
      if (!response.success) {
        throw new Error(response.error || 'Failed to duplicate content');
      }
      return response.data;
    },
    onSuccess: (duplicatedContent) => {
      // Add to cache
      queryClient.setQueryData(
        contentQueryKeys.detail(duplicatedContent.id), 
        duplicatedContent
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lists() });
      
      toast.success('Content duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const assignToCurriculum = useMutation({
    mutationFn: async ({ 
      contentId, 
      assignmentData 
    }: { 
      contentId: string; 
      assignmentData: CurriculumAssignmentData;
    }) => {
      const response = await contentApiService.assignToCurriculum(contentId, assignmentData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to assign content to curriculum');
      }
      return response.data;
    },
    onSuccess: (_, { contentId }) => {
      // Invalidate usage info and content lists
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.usage(contentId) });
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lists() });
      
      toast.success('Content assigned to curriculum successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeFromCurriculum = useMutation({
    mutationFn: async ({ 
      contentId, 
      curriculumId 
    }: { 
      contentId: string; 
      curriculumId: string;
    }) => {
      const response = await contentApiService.removeFromCurriculum(contentId, curriculumId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove content from curriculum');
      }
      return response.data;
    },
    onSuccess: (_, { contentId }) => {
      // Invalidate usage info and content lists
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.usage(contentId) });
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lists() });
      
      toast.success('Content removed from curriculum successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkAction = useMutation({
    mutationFn: async (actionData: BulkContentAction) => {
      const response = await contentApiService.bulkAction(actionData);
      if (!response.success) {
        throw new Error(response.error || 'Bulk action failed');
      }
      return response.data;
    },
    onSuccess: (result, actionData) => {
      // Invalidate all content queries
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.all });
      
      toast.success(
        `Bulk action completed. ${result.success_count} items processed successfully.`
      );
      
      if (result.error_count > 0) {
        toast.warning(`${result.error_count} items failed to process.`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const exportContent = useMutation({
    mutationFn: async ({ 
      content_ids, 
      format 
    }: { 
      content_ids: string[]; 
      format?: 'json' | 'csv' | 'pdf';
    }) => {
      const response = await contentApiService.exportContent(content_ids, format);
      if (!response.success) {
        throw new Error(response.error || 'Export failed');
      }
      return response.data;
    },
    onSuccess: (result) => {
      // Open download URL
      if (result.download_url) {
        window.open(result.download_url, '_blank');
      }
      toast.success('Export completed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Edit lock mutations
  const acquireEditLock = useMutation({
    mutationFn: async (id: string) => {
      const response = await contentApiService.acquireEditLock(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to acquire edit lock');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lockStatus(id) });
    },
  });

  const releaseEditLock = useMutation({
    mutationFn: async (id: string) => {
      const response = await contentApiService.releaseEditLock(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to release edit lock');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.lockStatus(id) });
    },
  });

  return {
    createContent,
    updateContent,
    deleteContent,
    duplicateContent,
    assignToCurriculum,
    removeFromCurriculum,
    bulkAction,
    exportContent,
    acquireEditLock,
    releaseEditLock,
  };
}

// Convenience hooks
export function useContentSearch(initialParams: ContentSearchParams = {}) {
  const [params, setParams] = useState<ContentSearchParams>(initialParams);
  const contentQuery = useContent(params);
  
  return {
    ...contentQuery,
    searchParams: params,
    updateSearch: setParams,
  };
}