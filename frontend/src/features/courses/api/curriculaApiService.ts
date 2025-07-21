/**
 * Curricula API Service
 * 
 * Handles API calls for curricula management
 */

import { httpClient } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';
import type { CurriculumStatus, DifficultyLevel } from '@/lib/api/types';

export interface Curriculum {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  prerequisites?: string;
  learning_objectives?: string;
  status: CurriculumStatus;
  display_order?: number;
  curriculum_code?: string;
  estimated_duration_weeks?: number;
  skill_level?: DifficultyLevel;
  created_at: string;
  updated_at: string;
  course?: {
    id: string;
    name: string;
    code?: string;
  };
  level_count?: number;
  lesson_count?: number;
}

export interface CurriculumCreate {
  course_id: string;
  name: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  prerequisites?: string;
  learning_objectives?: string;
  status?: CurriculumStatus;
  display_order?: number;
  curriculum_code?: string;
  estimated_duration_weeks?: number;
  skill_level?: DifficultyLevel;
}

export interface CurriculumUpdate {
  name?: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  prerequisites?: string;
  learning_objectives?: string;
  status?: CurriculumStatus;
  display_order?: number;
  curriculum_code?: string;
  estimated_duration_weeks?: number;
  skill_level?: DifficultyLevel;
}

export interface CurriculumSearchParams {
  page?: number;
  per_page?: number;
  search?: string;
  course_id?: string;
  program_id?: string;
  status?: string;
  skill_level?: string;
  min_age?: number;
  max_age?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedCurriculumResponse {
  items: Curriculum[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CurriculumStatsResponse {
  total_curricula: number;
  active_curricula: number;
  draft_curricula: number;
  published_curricula: number;
  archived_curricula: number;
  skill_level_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  age_range_distribution: {
    min_age: number;
    max_age: number;
    average_age: number;
  };
  average_duration_weeks: number;
  completion_rate: number;
}

export interface CurriculumTreeResponse {
  curriculum: Curriculum;
  levels: Array<{
    id: string;
    name: string;
    sequence_order: number;
    modules: Array<{
      id: string;
      name: string;
      sequence_order: number;
      sections: Array<{
        id: string;
        name: string;
        sequence_order: number;
        lessons: Array<{
          id: string;
          name: string;
          sequence_order: number;
        }>;
      }>;
    }>;
  }>;
}

export interface BulkCurriculumMoveRequest {
  curriculum_ids: string[];
  target_course_id: string;
  preserve_order?: boolean;
}

export interface BulkCurriculumStatusUpdateRequest {
  curriculum_ids: string[];
  status: CurriculumStatus;
}

export interface BulkActionResponse {
  successful: string[];
  failed: string[];
  total_processed: number;
  total_successful: number;
  total_failed: number;
}

/**
 * Curricula API Client
 */
export const curriculaApiService = {
  /**
   * Get all curricula with optional search and pagination
   */
  getCurricula: async (params: CurriculumSearchParams = {}): Promise<PaginatedCurriculumResponse> => {
    const response = await httpClient.get<PaginatedCurriculumResponse>(
      API_ENDPOINTS.courses.curricula.list,
      params
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Get curricula statistics
   */
  getCurriculaStats: async (): Promise<CurriculumStatsResponse> => {
    const response = await httpClient.get<CurriculumStatsResponse>(
      `${API_ENDPOINTS.courses.curricula.list}/stats`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Get a specific curriculum by ID
   */
  getCurriculum: async (id: string): Promise<Curriculum> => {
    const response = await httpClient.get<Curriculum>(
      API_ENDPOINTS.courses.curricula.get(id)
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Create a new curriculum
   */
  createCurriculum: async (data: CurriculumCreate): Promise<Curriculum> => {
    const response = await httpClient.post<Curriculum>(
      API_ENDPOINTS.courses.curricula.create,
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Update curriculum information
   */
  updateCurriculum: async (id: string, data: CurriculumUpdate): Promise<Curriculum> => {
    const response = await httpClient.put<Curriculum>(
      API_ENDPOINTS.courses.curricula.update(id),
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Delete a curriculum
   */
  deleteCurriculum: async (id: string): Promise<void> => {
    const response = await httpClient.delete(
      API_ENDPOINTS.courses.curricula.delete(id)
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Get curricula by course ID
   */
  getCurriculaByCourse: async (courseId: string, params: CurriculumSearchParams = {}): Promise<PaginatedCurriculumResponse> => {
    const response = await httpClient.get<PaginatedCurriculumResponse>(
      `${API_ENDPOINTS.courses.curricula.list}/by-course/${courseId}`,
      params
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Get curriculum with full tree structure
   */
  getCurriculumTree: async (id: string): Promise<CurriculumTreeResponse> => {
    const response = await httpClient.get<CurriculumTreeResponse>(
      `${API_ENDPOINTS.courses.curricula.get(id)}/tree`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Duplicate a curriculum with all its content
   */
  duplicateCurriculum: async (id: string, data: { name: string; course_id?: string }): Promise<Curriculum> => {
    const response = await httpClient.post<Curriculum>(
      `${API_ENDPOINTS.courses.curricula.get(id)}/duplicate`,
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Bulk move curricula to a different course
   */
  bulkMoveCurricula: async (data: BulkCurriculumMoveRequest): Promise<BulkActionResponse> => {
    const response = await httpClient.post<BulkActionResponse>(
      `${API_ENDPOINTS.courses.curricula.list}/bulk-move`,
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Bulk update curriculum status
   */
  bulkUpdateCurriculumStatus: async (data: BulkCurriculumStatusUpdateRequest): Promise<BulkActionResponse> => {
    const response = await httpClient.post<BulkActionResponse>(
      `${API_ENDPOINTS.courses.curricula.list}/bulk-status`,
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Reorder curricula within their course
   */
  reorderCurricula: async (reorderData: Array<{ id: string; sequence: number }>): Promise<BulkActionResponse> => {
    const response = await httpClient.post<BulkActionResponse>(
      `${API_ENDPOINTS.courses.curricula.list}/reorder`,
      reorderData
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },
};

export default curriculaApiService;