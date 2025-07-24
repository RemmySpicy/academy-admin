/**
 * React hooks for curricula management using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { curriculaApiService } from '../api/curriculaApiService';
import type {
  Curriculum,
  CurriculumCreate,
  CurriculumUpdate,
  CurriculumSearchParams,
  PaginatedCurriculumResponse,
  CurriculumStatsResponse,
  CurriculumTreeResponse,
  BulkCurriculumMoveRequest,
  BulkCurriculumStatusUpdateRequest,
  BulkActionResponse,
} from '../api/curriculaApiService';

// Query Keys
export const CURRICULA_QUERY_KEYS = {
  CURRICULA: 'curricula',
  CURRICULUM: 'curriculum',
  CURRICULUM_STATS: 'curriculum-stats',
  CURRICULUM_TREE: 'curriculum-tree',
  CURRICULA_BY_COURSE: 'curricula-by-course',
} as const;

// Curricula Hooks
export const useCurricula = (params: CurriculumSearchParams = {}) => {
  return useQuery({
    queryKey: [CURRICULA_QUERY_KEYS.CURRICULA, params],
    queryFn: () => curriculaApiService.getCurricula(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

export const useCurriculaStats = () => {
  return useQuery({
    queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_STATS],
    queryFn: curriculaApiService.getCurriculaStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCurriculum = (id: string) => {
  return useQuery({
    queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM, id],
    queryFn: () => curriculaApiService.getCurriculum(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurriculaByCourse = (courseId: string, params: CurriculumSearchParams = {}) => {
  return useQuery({
    queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE, courseId, params],
    queryFn: () => curriculaApiService.getCurriculaByCourse(courseId, params),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useCurriculumTree = (id: string) => {
  return useQuery({
    queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_TREE, id],
    queryFn: () => curriculaApiService.getCurriculumTree(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CurriculumCreate) => curriculaApiService.createCurriculum(data),
    onSuccess: (newCurriculum) => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_STATS] });
      queryClient.invalidateQueries({ 
        queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE, newCurriculum.course_id] 
      });
      toast.success('Curriculum created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create curriculum: ${error.message}`);
    },
  });
};

export const useUpdateCurriculum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CurriculumUpdate }) => 
      curriculaApiService.updateCurriculum(id, data),
    onSuccess: (updatedCurriculum) => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM, updatedCurriculum.id] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_STATS] });
      queryClient.invalidateQueries({ 
        queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE, updatedCurriculum.course_id] 
      });
      toast.success('Curriculum updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update curriculum: ${error.message}`);
    },
  });
};

export const useDeleteCurriculum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => curriculaApiService.deleteCurriculum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_STATS] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE] });
      toast.success('Curriculum deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete curriculum: ${error.message}`);
    },
  });
};

export const useDuplicateCurriculum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; course_id?: string } }) => 
      curriculaApiService.duplicateCurriculum(id, data),
    onSuccess: (newCurriculum) => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_STATS] });
      queryClient.invalidateQueries({ 
        queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE, newCurriculum.course_id] 
      });
      toast.success('Curriculum duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate curriculum: ${error.message}`);
    },
  });
};

export const useBulkMoveCurricula = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkCurriculumMoveRequest) => 
      curriculaApiService.bulkMoveCurricula(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE] });
      
      if (result.total_successful > 0) {
        toast.success(`${result.total_successful} curricula moved successfully`);
      }
      if (result.total_failed > 0) {
        toast.error(`${result.total_failed} curricula failed to move`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to move curricula: ${error.message}`);
    },
  });
};

export const useBulkUpdateCurriculumStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkCurriculumStatusUpdateRequest) => 
      curriculaApiService.bulkUpdateCurriculumStatus(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_STATS] });
      
      if (result.total_successful > 0) {
        toast.success(`${result.total_successful} curricula updated successfully`);
      }
      if (result.total_failed > 0) {
        toast.error(`${result.total_failed} curricula failed to update`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update curricula status: ${error.message}`);
    },
  });
};

export const useReorderCurricula = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reorderData: Array<{ id: string; sequence: number }>) => 
      curriculaApiService.reorderCurricula(reorderData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE] });
      
      if (result.total_successful > 0) {
        toast.success(`${result.total_successful} curricula reordered successfully`);
      }
      if (result.total_failed > 0) {
        toast.error(`${result.total_failed} curricula failed to reorder`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder curricula: ${error.message}`);
    },
  });
};

// Convenience hooks for common patterns
export const useCurriculaManagement = (params: CurriculumSearchParams = {}) => {
  const curricula = useCurricula(params);
  const stats = useCurriculaStats();
  const createCurriculum = useCreateCurriculum();
  const updateCurriculum = useUpdateCurriculum();
  const deleteCurriculum = useDeleteCurriculum();
  const duplicateCurriculum = useDuplicateCurriculum();
  const bulkMoveCurricula = useBulkMoveCurricula();
  const bulkUpdateStatus = useBulkUpdateCurriculumStatus();
  const reorderCurricula = useReorderCurricula();
  
  return {
    curricula,
    stats,
    createCurriculum,
    updateCurriculum,
    deleteCurriculum,
    duplicateCurriculum,
    bulkMoveCurricula,
    bulkUpdateStatus,
    reorderCurricula,
    
    // Computed values
    isLoading: curricula.isLoading || stats.isLoading,
    hasError: curricula.error || stats.error,
    totalCurricula: curricula.data?.total || 0,
    curriculaItems: curricula.data?.items || [],
    curriculaStats: stats.data,
  };
};

// Default Curriculum Management Hooks
export const useSetDefaultCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ curriculumId, ageGroups }: { curriculumId: string; ageGroups: string[] }) =>
      curriculaApiService.setDefaultCurriculum(curriculumId, ageGroups),
    onSuccess: (data) => {
      // Invalidate and refetch curriculum queries
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM, data.id] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE, data.course_id] });
      
      toast.success('Curriculum set as default successfully');
    },
    onError: (error: Error) => {
      console.error('Error setting default curriculum:', error);
      toast.error('Failed to set curriculum as default');
    },
  });
};

export const useRemoveDefaultCurriculum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ curriculumId, ageGroups }: { curriculumId: string; ageGroups: string[] }) =>
      curriculaApiService.removeDefaultCurriculum(curriculumId, ageGroups),
    onSuccess: (data) => {
      // Invalidate and refetch curriculum queries
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM, data.id] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULA_BY_COURSE, data.course_id] });
      
      toast.success('Default status removed successfully');
    },
    onError: (error: Error) => {
      console.error('Error removing default curriculum:', error);
      toast.error('Failed to remove default status');
    },
  });
};

export const useDefaultCurriculaByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['default-curricula', courseId],
    queryFn: () => curriculaApiService.getDefaultCurriculaByCourse(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Level Management Hooks
export const useLevelsByCurriculum = (curriculumId: string) => {
  return useQuery({
    queryKey: ['levels-by-curriculum', curriculumId],
    queryFn: () => curriculaApiService.getLevelsByCurriculum(curriculumId),
    enabled: !!curriculumId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => curriculaApiService.createLevel(data),
    onSuccess: (newLevel) => {
      queryClient.invalidateQueries({ queryKey: ['levels-by-curriculum', newLevel.curriculum_id] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_TREE, newLevel.curriculum_id] });
      toast.success('Level created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create level: ${error.message}`);
    },
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      curriculaApiService.updateLevel(id, data),
    onSuccess: (updatedLevel) => {
      queryClient.invalidateQueries({ queryKey: ['levels-by-curriculum', updatedLevel.curriculum_id] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_TREE, updatedLevel.curriculum_id] });
      toast.success('Level updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update level: ${error.message}`);
    },
  });
};

export const useDeleteLevel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => curriculaApiService.deleteLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels-by-curriculum'] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_TREE] });
      toast.success('Level deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete level: ${error.message}`);
    },
  });
};

export const useSaveCurriculumStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ curriculumId, structure }: { curriculumId: string; structure: any }) => 
      curriculaApiService.saveCurriculumStructure(curriculumId, structure),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['levels-by-curriculum', variables.curriculumId] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM, variables.curriculumId] });
      queryClient.invalidateQueries({ queryKey: [CURRICULA_QUERY_KEYS.CURRICULUM_TREE, variables.curriculumId] });
      toast.success('Curriculum structure saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save curriculum structure: ${error.message}`);
    },
  });
};