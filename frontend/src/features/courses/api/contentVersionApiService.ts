/**
 * Content Version API Service
 * Handles all content version-related API operations with automatic program context
 */

import { httpClient } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/types';

export interface ContentVersion {
  id: string;
  lesson_id: string;
  version_number: number;
  content_type: 'text' | 'video' | 'audio' | 'interactive' | 'assessment' | 'other';
  title: string;
  content_data: Record<string, any>;
  content_text?: string;
  content_html?: string;
  content_markdown?: string;
  content_json?: Record<string, any>;
  is_current: boolean;
  change_summary?: string;
  change_notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentVersionSearchParams {
  search?: string;
  lesson_id?: string;
  section_id?: string;
  module_id?: string;
  level_id?: string;
  curriculum_id?: string;
  course_id?: string;
  program_id?: string;
  content_type?: string;
  is_current?: boolean;
  created_by?: string;
  version_number_min?: number;
  version_number_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ContentVersionCreateRequest {
  lesson_id: string;
  content_type: 'text' | 'video' | 'audio' | 'interactive' | 'assessment' | 'other';
  title: string;
  content_data: Record<string, any>;
  content_text?: string;
  content_html?: string;
  content_markdown?: string;
  content_json?: Record<string, any>;
  change_summary?: string;
  change_notes?: string;
}

export interface ContentVersionUpdateRequest {
  content_type?: 'text' | 'video' | 'audio' | 'interactive' | 'assessment' | 'other';
  title?: string;
  content_data?: Record<string, any>;
  content_text?: string;
  content_html?: string;
  content_markdown?: string;
  content_json?: Record<string, any>;
  change_summary?: string;
  change_notes?: string;
}

export interface ContentVersionStats {
  total_versions: number;
  versions_by_type: Record<string, number>;
  current_versions_count: number;
  draft_versions_count: number;
  versions_by_program: Record<string, number>;
  versions_by_curriculum: Record<string, number>;
  versions_by_course: Record<string, number>;
  recent_versions: Array<{
    id: string;
    title: string;
    version_number: number;
    content_type: string;
    created_at: string;
    created_by: string;
  }>;
  most_versioned_lessons: Array<{
    lesson_id: string;
    lesson_title: string;
    version_count: number;
  }>;
  version_activity_by_month: Record<string, number>;
}

export interface ContentVersionComparison {
  version1: ContentVersion;
  version2: ContentVersion;
  differences: Array<{
    field: string;
    old_value: any;
    new_value: any;
    change_type: 'added' | 'removed' | 'modified';
  }>;
  content_diff?: {
    additions: string[];
    deletions: string[];
    modifications: Array<{
      old_text: string;
      new_text: string;
      position: number;
    }>;
  };
  metadata_diff?: Record<string, {
    old_value: any;
    new_value: any;
  }>;
  summary: {
    total_changes: number;
    content_changes: number;
    metadata_changes: number;
    similarity_percentage: number;
  };
}

export interface ContentVersionRestoreRequest {
  change_summary?: string;
  change_notes?: string;
  make_current?: boolean;
}

// API endpoints
const API_ENDPOINTS = {
  contentVersions: {
    list: '/api/v1/courses/content-versions',
    create: '/api/v1/courses/content-versions',
    get: (id: string) => `/api/v1/courses/content-versions/${id}`,
    update: (id: string) => `/api/v1/courses/content-versions/${id}`,
    delete: (id: string) => `/api/v1/courses/content-versions/${id}`,
    stats: '/api/v1/courses/content-versions/stats',
    byLesson: (lessonId: string) => `/api/v1/courses/content-versions/by-lesson/${lessonId}`,
    compare: (version1Id: string, version2Id: string) => `/api/v1/courses/content-versions/compare/${version1Id}/${version2Id}`,
    restore: (versionId: string) => `/api/v1/courses/content-versions/${versionId}/restore`,
    currentByLesson: (lessonId: string) => `/api/v1/courses/content-versions/current/lesson/${lessonId}`,
    publish: (versionId: string) => `/api/v1/courses/content-versions/publish/${versionId}`,
    history: (lessonId: string) => `/api/v1/courses/content-versions/history/lesson/${lessonId}`,
  },
};

export const contentVersionApiService = {
  /**
   * Get list of content versions
   * Program context is automatically injected by httpClient
   */
  async getContentVersions(params: ContentVersionSearchParams = {}): Promise<PaginatedResponse<ContentVersion>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<ContentVersion>>(
      `${API_ENDPOINTS.contentVersions.list}${queryString ? `?${queryString}` : ''}`
    );
    
    return response.data;
  },

  /**
   * Create new content version
   * Program context is automatically injected by httpClient
   */
  async createContentVersion(versionData: ContentVersionCreateRequest): Promise<ContentVersion> {
    const response = await httpClient.post<ContentVersion>(API_ENDPOINTS.contentVersions.create, versionData);
    return response.data;
  },

  /**
   * Get content version by ID
   * Program context is automatically validated by backend
   */
  async getContentVersionById(id: string): Promise<ContentVersion> {
    const response = await httpClient.get<ContentVersion>(API_ENDPOINTS.contentVersions.get(id));
    return response.data;
  },

  /**
   * Update content version
   * Program context is automatically validated by backend
   */
  async updateContentVersion(id: string, versionData: ContentVersionUpdateRequest): Promise<ContentVersion> {
    const response = await httpClient.put<ContentVersion>(API_ENDPOINTS.contentVersions.update(id), versionData);
    return response.data;
  },

  /**
   * Delete content version
   * Program context is automatically validated by backend
   */
  async deleteContentVersion(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.contentVersions.delete(id));
  },

  /**
   * Get content version statistics
   * Program context is automatically injected by httpClient
   */
  async getContentVersionStats(): Promise<ContentVersionStats> {
    const response = await httpClient.get<ContentVersionStats>(API_ENDPOINTS.contentVersions.stats);
    return response.data;
  },

  /**
   * Get content versions by lesson
   * Program context is automatically validated by backend
   */
  async getContentVersionsByLesson(lessonId: string, params: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<ContentVersion>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<ContentVersion>>(
      `${API_ENDPOINTS.contentVersions.byLesson(lessonId)}${queryString ? `?${queryString}` : ''}`
    );
    
    return response.data;
  },

  /**
   * Compare two content versions
   * Program context is automatically validated by backend
   */
  async compareContentVersions(version1Id: string, version2Id: string): Promise<ContentVersionComparison> {
    const response = await httpClient.get<ContentVersionComparison>(
      API_ENDPOINTS.contentVersions.compare(version1Id, version2Id)
    );
    return response.data;
  },

  /**
   * Restore content version
   * Program context is automatically validated by backend
   */
  async restoreContentVersion(versionId: string, request: ContentVersionRestoreRequest): Promise<ContentVersion> {
    const response = await httpClient.post<ContentVersion>(
      API_ENDPOINTS.contentVersions.restore(versionId),
      request
    );
    return response.data;
  },

  /**
   * Get current content version for lesson
   * Program context is automatically validated by backend
   */
  async getCurrentVersionForLesson(lessonId: string): Promise<ContentVersion> {
    const response = await httpClient.get<ContentVersion>(
      API_ENDPOINTS.contentVersions.currentByLesson(lessonId)
    );
    return response.data;
  },

  /**
   * Publish content version
   * Program context is automatically validated by backend
   */
  async publishContentVersion(versionId: string): Promise<ContentVersion> {
    const response = await httpClient.post<ContentVersion>(
      API_ENDPOINTS.contentVersions.publish(versionId)
    );
    return response.data;
  },

  /**
   * Get lesson version history
   * Program context is automatically validated by backend
   */
  async getLessonVersionHistory(lessonId: string, params: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<ContentVersion>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<ContentVersion>>(
      `${API_ENDPOINTS.contentVersions.history(lessonId)}${queryString ? `?${queryString}` : ''}`
    );
    
    return response.data;
  },
};