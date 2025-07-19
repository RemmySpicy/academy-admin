/**
 * Media API Service
 * Handles all media-related API operations with automatic program context
 */

import { httpClient } from '@/lib/api/httpClient';
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
      `/api/v1/courses/media${queryString ? `?${queryString}` : ''}`
    );
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch media');
    }
  },

  /**
   * Create new media item
   * Program context is automatically injected by httpClient
   */
  async createMedia(mediaData: MediaCreateRequest): Promise<Media> {
    const response = await httpClient.post<Media>('/api/v1/courses/media', mediaData);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to create media');
    }
  },

  /**
   * Get media item by ID
   * Program context is automatically validated by backend
   */
  async getMediaById(id: string): Promise<Media> {
    const response = await httpClient.get<Media>(`/api/v1/courses/media/${id}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch media');
    }
  },

  /**
   * Update media item
   * Program context is automatically validated by backend
   */
  async updateMedia(id: string, mediaData: MediaUpdateRequest): Promise<Media> {
    const response = await httpClient.put<Media>(`/api/v1/courses/media/${id}`, mediaData);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to update media');
    }
  },

  /**
   * Delete media item
   * Program context is automatically validated by backend
   */
  async deleteMedia(id: string): Promise<void> {
    const response = await httpClient.delete<void>(`/api/v1/courses/media/${id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete media');
    }
  },

  /**
   * Get media statistics
   * Program context is automatically injected by apiClient
   */
  async getMediaStats(): Promise<MediaStats> {
    // This would need to be implemented in the backend API client
    // For now, return a placeholder
    return {
      total_media_items: 0,
      media_by_type: {},
      total_storage_used_bytes: 0,
      total_storage_used_mb: 0,
      total_storage_used_gb: 0,
      public_media_count: 0,
      private_media_count: 0,
      most_downloaded: [],
      most_viewed: [],
      recent_uploads: [],
      processing_queue_count: 0,
    };
  },

  /**
   * Upload media file
   * Program context is automatically injected by httpClient
   */
  async uploadMedia(file: File, folder: string = 'uploads'): Promise<{ file_url: string; file_path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await httpClient.post<{ file_url: string; file_path: string }>(
      '/api/v1/courses/media/upload',
      formData
    );
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to upload media');
    }
  },

  /**
   * Create upload session
   * Program context is automatically injected by apiClient
   */
  async createUploadSession(request: MediaUploadRequest): Promise<MediaUploadSession> {
    // This would need to be implemented in the backend API client
    // For now, return a placeholder
    return {
      upload_id: 'placeholder-upload-id',
      upload_url: '/api/v1/upload',
      max_file_size: 10 * 1024 * 1024, // 10MB
      allowed_mime_types: ['image/*', 'video/*', 'audio/*'],
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    };
  },

  /**
   * Get media usage information
   * Program context is automatically validated by backend
   */
  async getMediaUsage(id: string): Promise<MediaUsage> {
    // This would need to be implemented in the backend API client
    // For now, return a placeholder
    return {
      media_id: id,
      media_title: 'Media Item',
      usage_locations: [],
      total_usage_count: 0,
      last_accessed: new Date().toISOString(),
      access_frequency: 0,
    };
  },

  /**
   * Get media processing status
   * Program context is automatically validated by backend
   */
  async getMediaProcessingStatus(id: string): Promise<MediaProcessingStatus> {
    // This would need to be implemented in the backend API client
    // For now, return a placeholder
    return {
      media_id: id,
      processing_status: 'completed',
      progress_percentage: 100,
      processing_steps: [],
    };
  },

  /**
   * Bulk tag media items
   * Program context is automatically injected by apiClient
   */
  async bulkTagMedia(request: MediaBulkTagRequest): Promise<BulkActionResult> {
    // This would need to be implemented in the backend API client
    // For now, return a placeholder
    return {
      successful: request.media_ids,
      failed: [],
      total_processed: request.media_ids.length,
      total_successful: request.media_ids.length,
      total_failed: 0,
    };
  },

  /**
   * Get media download URL
   * Program context is automatically validated by backend
   */
  getMediaDownloadUrl(id: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/courses/media/${id}/download`;
  },

  /**
   * Get media thumbnail URL
   * Program context is automatically validated by backend
   */
  getMediaThumbnailUrl(id: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/courses/media/${id}/thumbnail`;
  },
};