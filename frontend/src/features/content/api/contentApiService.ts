/**
 * Unified Content API Service - Centralized management for lessons and assessments
 */

import { httpClient, type ApiResponse } from '@/lib/api/httpClient';
import { programContextApi } from '@/lib/api/programContextSync';
import { API_ENDPOINTS } from '@/lib/constants';
import type { 
  PaginatedResponse, 
  TimestampMixin,
  CurriculumStatus,
  DifficultyLevel,
  ContentType,
  AssessmentType
} from '@/lib/api/types';

// Enhanced Content Types with Usage Information
export interface CurriculumReference {
  id: string;
  name: string;
  course_name: string;
  usage_sequence?: number;
  custom_title?: string;
  custom_instructions?: string;
}

export interface ContentUsageInfo {
  usage_count: number;
  curricula: CurriculumReference[];
  last_used_at?: string;
  is_orphaned: boolean; // Not used in any curriculum
}

export interface BaseContent extends TimestampMixin {
  id: string;
  program_id: string;
  name: string;
  code: string;
  description?: string;
  objectives?: string;
  status: CurriculumStatus;
  difficulty_level?: DifficultyLevel;
  sequence: number;
  duration_minutes?: number;
  is_required: boolean;
  created_by?: string;
  updated_by?: string;
  // Usage information
  usage_info?: ContentUsageInfo;
  // Version information
  version_number?: string;
  has_newer_version?: boolean;
  is_locked?: boolean; // Being edited by another user
}

export interface Lesson extends BaseContent {
  content_type: ContentType;
  content_data: any; // Flexible content structure
  media_urls?: string[];
  resource_links?: string[];
  is_interactive: boolean;
  assessment_count?: number;
  completion_criteria?: any;
}

export interface Assessment extends BaseContent {
  assessment_type: AssessmentType;
  assessment_data: any; // Questions, criteria, etc.
  max_score: number;
  passing_score?: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  allow_retake: boolean;
  criteria_count?: number;
}

export type ContentItem = Lesson | Assessment;

export interface ContentSearchParams {
  search?: string;
  content_type?: 'lesson' | 'assessment' | 'all';
  status?: CurriculumStatus;
  difficulty_level?: DifficultyLevel;
  usage_status?: 'used' | 'unused' | 'orphaned' | 'all';
  curriculum_id?: string; // Filter by specific curriculum usage
  created_by?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'usage_count' | 'sequence';
  sort_order?: 'asc' | 'desc';
}

export interface ContentCreateData {
  name: string;
  code: string;
  description?: string;
  objectives?: string;
  content_type: 'lesson' | 'assessment';
  difficulty_level?: DifficultyLevel;
  duration_minutes?: number;
  is_required?: boolean;
  // Lesson-specific
  lesson_content_type?: ContentType;
  lesson_data?: any;
  is_interactive?: boolean;
  // Assessment-specific
  assessment_type?: AssessmentType;
  assessment_data?: any;
  max_score?: number;
  passing_score?: number;
  // Optional curriculum assignment
  assign_to_curriculum?: string;
  assign_to_section?: string;
}

export interface ContentUpdateData {
  name?: string;
  code?: string;
  description?: string;
  objectives?: string;
  status?: CurriculumStatus;
  difficulty_level?: DifficultyLevel;
  duration_minutes?: number;
  is_required?: boolean;
  // Lesson-specific
  lesson_data?: any;
  is_interactive?: boolean;
  // Assessment-specific
  assessment_data?: any;
  max_score?: number;
  passing_score?: number;
}

export interface ContentVersionData {
  version_strategy: 'immediate' | 'new_version';
  change_summary?: string;
  notify_curricula?: boolean;
}

export interface CurriculumAssignmentData {
  curriculum_id: string;
  section_id?: string;
  sequence?: number;
  custom_title?: string;
  custom_instructions?: string;
  is_required?: boolean;
}

export interface BulkContentAction {
  action: 'delete' | 'status_change' | 'export' | 'assign_to_curriculum';
  content_ids: string[];
  parameters?: {
    new_status?: CurriculumStatus;
    curriculum_id?: string;
    export_format?: 'json' | 'csv' | 'pdf';
  };
}

class ContentApiService {
  private baseUrl = '/api/v1/content'; // Note: This is a unified endpoint concept - actual routing happens per method

  // Get all content with usage information
  async getContent(params: ContentSearchParams = {}): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    try {
      // For now, we'll create a mock response since we need a unified content endpoint
      // In a real implementation, this would either be a backend endpoint that combines lessons and assessments
      // or we'd fetch from both endpoints and combine the results
      
      const mockResponse: PaginatedResponse<ContentItem> = {
        items: [],
        total: 0,
        page: params.page || 1,
        limit: params.per_page || 20,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      };

      return {
        success: true,
        data: mockResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch content',
      };
    }
  }

  // Get specific content item with detailed usage
  async getContentById(id: string): Promise<ApiResponse<ContentItem>> {
    return programContextApi.get<ContentItem>(`${this.baseUrl}/${id}`);
  }

  // Get content usage details
  async getContentUsage(id: string): Promise<ApiResponse<ContentUsageInfo>> {
    return programContextApi.get<ContentUsageInfo>(`${this.baseUrl}/${id}/usage`);
  }

  // Create new content
  async createContent(data: ContentCreateData): Promise<ApiResponse<ContentItem>> {
    // Route to the appropriate endpoint based on content type
    const isAssessment = data.assessment_type !== undefined;
    const endpoint = isAssessment ? API_ENDPOINTS.courses.assessments.create : API_ENDPOINTS.courses.lessons.create;
    
    // Transform data for the specific endpoint
    const transformedData = isAssessment 
      ? {
          name: data.name,
          code: data.code,
          description: data.description,
          objectives: data.objectives,
          assessment_type: data.assessment_type,
          max_score: data.max_score,
          passing_score: data.passing_score,
          difficulty_level: data.difficulty_level,
          duration_minutes: data.duration_minutes,
          is_required: data.is_required,
          status: data.status,
        }
      : {
          name: data.name,
          code: data.code,
          description: data.description,
          objectives: data.objectives,
          content_type: data.content_type,
          difficulty_level: data.difficulty_level,
          duration_minutes: data.duration_minutes,
          is_required: data.is_required,
          status: data.status,
        };
    
    return programContextApi.post<ContentItem>(endpoint, transformedData);
  }

  // Update content with version strategy
  async updateContent(
    id: string, 
    data: ContentUpdateData, 
    versionData?: ContentVersionData
  ): Promise<ApiResponse<ContentItem>> {
    const payload = {
      ...data,
      ...versionData
    };
    return programContextApi.put<ContentItem>(`${this.baseUrl}/${id}`, payload);
  }

  // Delete content (with usage validation)
  async deleteContent(id: string, force: boolean = false): Promise<ApiResponse<void>> {
    return programContextApi.delete<void>(`${this.baseUrl}/${id}?force=${force}`);
  }

  // Assign content to curriculum
  async assignToCurriculum(
    contentId: string, 
    assignmentData: CurriculumAssignmentData
  ): Promise<ApiResponse<void>> {
    return programContextApi.post<void>(
      `${this.baseUrl}/${contentId}/assign`, 
      assignmentData
    );
  }

  // Remove content from curriculum
  async removeFromCurriculum(
    contentId: string, 
    curriculumId: string
  ): Promise<ApiResponse<void>> {
    return programContextApi.delete<void>(
      `${this.baseUrl}/${contentId}/curricula/${curriculumId}`
    );
  }

  // Bulk operations
  async bulkAction(actionData: BulkContentAction): Promise<ApiResponse<{
    success_count: number;
    error_count: number;
    errors: string[];
  }>> {
    return programContextApi.post<{
      success_count: number;
      error_count: number;
      errors: string[];
    }>(`${this.baseUrl}/bulk`, actionData);
  }

  // Export content
  async exportContent(
    content_ids: string[], 
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<ApiResponse<{ download_url: string }>> {
    return programContextApi.post<{ download_url: string }>(
      `${this.baseUrl}/export`, 
      { content_ids, format }
    );
  }

  // Duplicate content
  async duplicateContent(
    id: string, 
    options: { 
      new_name?: string; 
      copy_usage?: boolean; 
      assign_to_curriculum?: string;
    } = {}
  ): Promise<ApiResponse<ContentItem>> {
    return programContextApi.post<ContentItem>(
      `${this.baseUrl}/${id}/duplicate`, 
      options
    );
  }

  // Check content edit conflicts
  async checkEditLock(id: string): Promise<ApiResponse<{ 
    is_locked: boolean; 
    locked_by?: string; 
    locked_at?: string; 
  }>> {
    return programContextApi.get<{ 
      is_locked: boolean; 
      locked_by?: string; 
      locked_at?: string; 
    }>(`${this.baseUrl}/${id}/lock-status`);
  }

  // Acquire edit lock
  async acquireEditLock(id: string): Promise<ApiResponse<void>> {
    return programContextApi.post<void>(`${this.baseUrl}/${id}/lock`, {});
  }

  // Release edit lock
  async releaseEditLock(id: string): Promise<ApiResponse<void>> {
    return programContextApi.delete<void>(`${this.baseUrl}/${id}/lock`);
  }
}

export const contentApiService = new ContentApiService();