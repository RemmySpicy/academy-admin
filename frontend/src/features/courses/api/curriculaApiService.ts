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
  curriculum_code?: string;
  duration_hours?: number;
  age_ranges: string[];
  is_default_for_age_groups: string[];
  is_default: boolean;
  prerequisites?: string;
  learning_objectives?: string;
  status: CurriculumStatus;
  sequence?: number;
  difficulty_level: DifficultyLevel;
  created_at: string;
  updated_at: string;
  course_name?: string;
  program_name?: string;
  program_code?: string;
  level_count?: number;
  module_count?: number;
  total_lesson_count?: number;
  estimated_duration_hours?: number;
}

export interface CurriculumCreate {
  course_id: string;
  name: string;
  description?: string;
  curriculum_code?: string;
  duration_hours?: number;
  age_ranges: string[];
  is_default_for_age_groups?: string[];
  prerequisites?: string;
  learning_objectives?: string;
  status?: CurriculumStatus;
  sequence?: number;
  difficulty_level: DifficultyLevel;
}

export interface CurriculumUpdate {
  name?: string;
  description?: string;
  curriculum_code?: string;
  duration_hours?: number;
  age_ranges?: string[];
  is_default_for_age_groups?: string[];
  prerequisites?: string;
  learning_objectives?: string;
  status?: CurriculumStatus;
  sequence?: number;
  difficulty_level?: DifficultyLevel;
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

  /**
   * Set a curriculum as default for specific age groups
   */
  setDefaultCurriculum: async (curriculumId: string, ageGroups: string[]): Promise<Curriculum> => {
    const response = await httpClient.post<Curriculum>(
      `${API_ENDPOINTS.courses.curricula.list}/${curriculumId}/set-default`,
      ageGroups
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Remove default status from a curriculum for specific age groups
   */
  removeDefaultCurriculum: async (curriculumId: string, ageGroups: string[]): Promise<Curriculum> => {
    const response = await httpClient.delete<Curriculum>(
      `${API_ENDPOINTS.courses.curricula.list}/${curriculumId}/remove-default`,
      ageGroups
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Get default curricula mapping for each age group in a course
   */
  getDefaultCurriculaByCourse: async (courseId: string): Promise<{ defaults: Record<string, string> }> => {
    const response = await httpClient.get<{ defaults: Record<string, string> }>(
      `${API_ENDPOINTS.courses.curricula.list}/courses/${courseId}/defaults`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Level Management Methods
   */

  /**
   * Get levels for a curriculum
   */
  getLevelsByCurriculum: async (curriculumId: string): Promise<any[]> => {
    const response = await httpClient.get<any>(
      `${API_ENDPOINTS.courses.levels.list}/by-curriculum/${curriculumId}`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data?.items || [];
  },

  /**
   * Create a new level
   */
  createLevel: async (data: any): Promise<any> => {
    const response = await httpClient.post<any>(
      API_ENDPOINTS.courses.levels.create,
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Update level information
   */
  updateLevel: async (id: string, data: any): Promise<any> => {
    const response = await httpClient.put<any>(
      API_ENDPOINTS.courses.levels.update(id),
      data
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  /**
   * Delete a level
   */
  deleteLevel: async (id: string): Promise<void> => {
    const response = await httpClient.delete(
      API_ENDPOINTS.courses.levels.delete(id)
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Bulk save curriculum structure (levels, modules, sections, lessons)
   */
  saveCurriculumStructure: async (curriculumId: string, structure: {
    levels: any[];
    progressionSettings: any;
  }): Promise<any> => {
    // For now, we'll save levels individually
    // TODO: Implement bulk structure save endpoint
    const savedLevels = [];
    
    for (const level of structure.levels) {
      try {
        let savedLevel;
        if (level.id && level.id.startsWith('level-')) {
          // This is a new level (has temporary ID)
          const levelData = {
            curriculum_id: curriculumId,
            name: level.name,
            title: level.title,
            description: level.description,
            sequence_order: level.sequence_order,
            equipment_needed: level.equipment_needed,
            learning_objectives: level.learning_objectives,
            intro_video_url: level.intro_video_url,
          };
          savedLevel = await curriculaApiService.createLevel(levelData);
        } else if (level.id) {
          // This is an existing level - update it
          const levelData = {
            name: level.name,
            title: level.title,
            description: level.description,
            sequence_order: level.sequence_order,
            equipment_needed: level.equipment_needed,
            learning_objectives: level.learning_objectives,
            intro_video_url: level.intro_video_url,
          };
          savedLevel = await curriculaApiService.updateLevel(level.id, levelData);
        }
        
        if (savedLevel) {
          savedLevels.push(savedLevel);
        }
      } catch (error) {
        console.error('Error saving level:', level.name, error);
        throw error;
      }
    }
    
    return { levels: savedLevels };
  },
};

export default curriculaApiService;