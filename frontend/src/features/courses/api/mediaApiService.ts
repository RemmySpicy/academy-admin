/**
 * Media API Service
 * Handles all media-related API operations with automatic program context
 */

import { httpClient } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/types';

export interface Media {
  id: string;
  title: string;
  description?: string;
  media_type: 'video' | 'audio' | 'image' | 'document' | 'presentation' | 'interactive' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  duration_seconds?: number;
  resolution?: string;
  tags?: string;
  is_public: boolean;
  thumbnail_path?: string;
  metadata?: Record<string, any>;
  accessibility_text?: string;
  copyright_info?: string;
  source_url?: string;
  download_count: number;
  view_count: number;
  usage_count: number;
  file_url: string;
  thumbnail_url?: string;
  file_extension: string;
  is_processed: boolean;
  processing_status: string;
  uploaded_by?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaSearchParams {
  search?: string;
  media_type?: string;
  is_public?: boolean;
  tags?: string;
  file_size_min?: number;
  file_size_max?: number;
  duration_min?: number;
  duration_max?: number;
  mime_type?: string;
  uploaded_by?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface MediaCreateRequest {
  title: string;
  description?: string;
  media_type: 'video' | 'audio' | 'image' | 'document' | 'presentation' | 'interactive' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  duration_seconds?: number;
  resolution?: string;
  tags?: string;
  is_public?: boolean;
  thumbnail_path?: string;
  metadata?: Record<string, any>;
  accessibility_text?: string;
  copyright_info?: string;
  source_url?: string;
}

export interface MediaUpdateRequest {
  title?: string;
  description?: string;
  tags?: string;
  is_public?: boolean;
  accessibility_text?: string;
  copyright_info?: string;
  source_url?: string;
}

export interface MediaStats {
  total_media_items: number;
  media_by_type: Record<string, number>;
  total_storage_used_bytes: number;
  total_storage_used_mb: number;
  total_storage_used_gb: number;
  public_media_count: number;
  private_media_count: number;
  most_downloaded: Array<{
    id: string;
    title: string;
    downloads: number;
  }>;
  most_viewed: Array<{
    id: string;
    title: string;
    views: number;
  }>;
  recent_uploads: Array<{
    id: string;
    title: string;
    media_type: string;
    uploaded_at: string;
  }>;
  processing_queue_count: number;
}

export interface MediaUploadSession {
  upload_id: string;
  upload_url: string;
  max_file_size: number;
  allowed_mime_types: string[];
  expires_at: string;
}

export interface MediaUploadRequest {
  media_type: 'video' | 'audio' | 'image' | 'document' | 'presentation' | 'interactive' | 'other';
  expected_file_size?: number;
  expected_mime_type?: string;
}

export interface MediaUsage {
  media_id: string;
  media_title: string;
  usage_locations: Array<{
    type: string;
    id: string;
    title: string;
    curriculum: string;
  }>;
  total_usage_count: number;
  last_accessed: string;
  access_frequency: number;
}

export interface MediaProcessingStatus {
  media_id: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  estimated_completion?: string;
  error_message?: string;
  processing_steps: Array<{
    step: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    completed_at?: string;
  }>;
}

export interface MediaBulkTagRequest {
  media_ids: string[];
  tags_to_add?: string[];
  tags_to_remove?: string[];
  replace_all_tags?: string[];
}

export interface BulkActionResult {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
  total_processed: number;
  total_successful: number;
  total_failed: number;
}

// API endpoints
const API_ENDPOINTS = {
  media: {
    list: '/api/v1/courses/media',
    create: '/api/v1/courses/media',
    get: (id: string) => `/api/v1/courses/media/${id}`,
    update: (id: string) => `/api/v1/courses/media/${id}`,
    delete: (id: string) => `/api/v1/courses/media/${id}`,
    download: (id: string) => `/api/v1/courses/media/${id}/download`,
    thumbnail: (id: string) => `/api/v1/courses/media/${id}/thumbnail`,
    usage: (id: string) => `/api/v1/courses/media/${id}/usage`,
    processingStatus: (id: string) => `/api/v1/courses/media/${id}/processing-status`,
    stats: '/api/v1/courses/media/stats',
    uploadSession: '/api/v1/courses/media/upload-session',
    upload: (uploadId: string) => `/api/v1/courses/media/upload/${uploadId}`,
    bulkTag: '/api/v1/courses/media/bulk-tag',
  },
};

export const mediaApiService = {
  /**
   * Get list of media items
   * Program context is automatically injected by httpClient
   */
  async getMedia(params: MediaSearchParams = {}): Promise<PaginatedResponse<Media>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const response = await httpClient.get<PaginatedResponse<Media>>(
      `${API_ENDPOINTS.media.list}${queryString ? `?${queryString}` : ''}`
    );
    
    return response.data;
  },

  /**
   * Create new media item
   * Program context is automatically injected by httpClient
   */
  async createMedia(mediaData: MediaCreateRequest): Promise<Media> {
    const response = await httpClient.post<Media>(API_ENDPOINTS.media.create, mediaData);
    return response.data;
  },

  /**
   * Get media item by ID
   * Program context is automatically validated by backend
   */
  async getMediaById(id: string): Promise<Media> {
    const response = await httpClient.get<Media>(API_ENDPOINTS.media.get(id));
    return response.data;
  },

  /**
   * Update media item
   * Program context is automatically validated by backend
   */
  async updateMedia(id: string, mediaData: MediaUpdateRequest): Promise<Media> {
    const response = await httpClient.put<Media>(API_ENDPOINTS.media.update(id), mediaData);
    return response.data;
  },

  /**
   * Delete media item
   * Program context is automatically validated by backend
   */
  async deleteMedia(id: string): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.media.delete(id));
  },

  /**
   * Get media statistics
   * Program context is automatically injected by httpClient
   */
  async getMediaStats(): Promise<MediaStats> {
    const response = await httpClient.get<MediaStats>(API_ENDPOINTS.media.stats);
    return response.data;
  },

  /**
   * Create upload session
   * Program context is automatically injected by httpClient
   */
  async createUploadSession(request: MediaUploadRequest): Promise<MediaUploadSession> {
    const response = await httpClient.post<MediaUploadSession>(
      API_ENDPOINTS.media.uploadSession,
      request
    );
    return response.data;
  },

  /**
   * Upload media file
   * Program context is automatically injected by httpClient
   */
  async uploadMedia(uploadId: string, file: File): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<Media>(
      API_ENDPOINTS.media.upload(uploadId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get media usage information
   * Program context is automatically validated by backend
   */
  async getMediaUsage(id: string): Promise<MediaUsage> {
    const response = await httpClient.get<MediaUsage>(API_ENDPOINTS.media.usage(id));
    return response.data;
  },

  /**
   * Get media processing status
   * Program context is automatically validated by backend
   */
  async getMediaProcessingStatus(id: string): Promise<MediaProcessingStatus> {
    const response = await httpClient.get<MediaProcessingStatus>(
      API_ENDPOINTS.media.processingStatus(id)
    );
    return response.data;
  },

  /**
   * Bulk tag media items
   * Program context is automatically injected by httpClient
   */
  async bulkTagMedia(request: MediaBulkTagRequest): Promise<BulkActionResult> {
    const response = await httpClient.post<BulkActionResult>(
      API_ENDPOINTS.media.bulkTag,
      request
    );
    return response.data;
  },

  /**
   * Get media download URL
   * Program context is automatically validated by backend
   */
  getMediaDownloadUrl(id: string): string {
    return `${httpClient.defaults.baseURL}${API_ENDPOINTS.media.download(id)}`;
  },

  /**
   * Get media thumbnail URL
   * Program context is automatically validated by backend
   */
  getMediaThumbnailUrl(id: string): string {
    return `${httpClient.defaults.baseURL}${API_ENDPOINTS.media.thumbnail(id)}`;
  },
};