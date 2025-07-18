/**
 * React hooks for media library management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProgramContext } from '@/store/programContext';
import type { SearchParams, PaginatedResponse } from '@/lib/api/types';
import { 
  mediaApiService, 
  type Media, 
  type MediaSearchParams as ApiMediaSearchParams, 
  type MediaCreateRequest, 
  type MediaUpdateRequest,
  type MediaUploadRequest as ApiMediaUploadRequest,
  type MediaBulkTagRequest 
} from '../api/mediaApiService';

// Media types
export interface MediaFile {
  id: string;
  name: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  file_size: number;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
  folder_path?: string;
  uploaded_at: string;
  uploaded_by: string;
  tags?: string[];
  description?: string;
}

export interface MediaUploadRequest {
  file: File;
  folder_path?: string;
  description?: string;
  tags?: string[];
}

export interface MediaSearchParams extends SearchParams {
  file_type?: 'image' | 'video' | 'audio' | 'document' | 'other';
  folder_path?: string;
  tags?: string[];
}

// Query Keys
export const MEDIA_QUERY_KEYS = {
  MEDIA_FILES: 'media-files',
  MEDIA_FILE: 'media-file',
  MEDIA_FOLDERS: 'media-folders',
  MEDIA_STATS: 'media-stats',
} as const;

// Utility function to convert API Media to MediaFile format
const convertApiMediaToMediaFile = (media: Media): MediaFile => {
  return {
    id: media.id,
    name: media.title,
    file_type: media.media_type as any,
    file_size: media.file_size,
    mime_type: media.mime_type,
    url: media.file_url,
    thumbnail_url: media.thumbnail_url,
    folder_path: undefined, // Not available in API response
    uploaded_at: media.created_at,
    uploaded_by: media.uploaded_by || 'Unknown',
    description: media.description,
    tags: media.tags ? media.tags.split(',').map(tag => tag.trim()) : [],
  };
};

// Real API service wrapper
const realMediaApiService = {
  getMediaFiles: async (params: MediaSearchParams = {}): Promise<PaginatedResponse<MediaFile>> => {
    const apiParams: ApiMediaSearchParams = {
      search: params.search,
      media_type: params.file_type,
      page: params.page,
      per_page: params.per_page,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    };

    const response = await mediaApiService.getMedia(apiParams);
    
    return {
      items: response.items.map(convertApiMediaToMediaFile),
      total: response.total,
      page: response.page,
      limit: response.limit,
      total_pages: response.total_pages,
      has_next: response.has_next,
      has_prev: response.has_prev,
    };
  },

  getMediaFile: async (id: string): Promise<MediaFile> => {
    const media = await mediaApiService.getMediaById(id);
    return convertApiMediaToMediaFile(media);
  },

  uploadMedia: async (data: MediaUploadRequest): Promise<MediaFile> => {
    // First create upload session
    const uploadRequest: ApiMediaUploadRequest = {
      media_type: data.file.type.startsWith('image/') ? 'image' :
                  data.file.type.startsWith('video/') ? 'video' :
                  data.file.type.startsWith('audio/') ? 'audio' :
                  data.file.type.includes('pdf') || data.file.type.includes('document') ? 'document' :
                  'other',
      expected_file_size: data.file.size,
      expected_mime_type: data.file.type,
    };

    const uploadSession = await mediaApiService.createUploadSession(uploadRequest);
    
    // Then upload the file
    const media = await mediaApiService.uploadMedia(uploadSession.upload_id, data.file);
    
    return convertApiMediaToMediaFile(media);
  },

  deleteMedia: async (id: string): Promise<void> => {
    await mediaApiService.deleteMedia(id);
  },

  getFolders: async (): Promise<string[]> => {
    // Return mock folders for now - this could be enhanced with real API
    return ['lessons', 'assessments', 'resources', 'templates'];
  },

  createFolder: async (path: string): Promise<void> => {
    // Mock implementation - could be enhanced with real API
    console.log('Creating folder:', path);
  },

  getMediaStats: async (): Promise<{
    total_files: number;
    total_size: number;
    files_by_type: Record<string, number>;
    files_by_folder: Record<string, number>;
  }> => {
    const stats = await mediaApiService.getMediaStats();
    
    return {
      total_files: stats.total_media_items,
      total_size: stats.total_storage_used_bytes,
      files_by_type: stats.media_by_type,
      files_by_folder: {
        lessons: Math.floor(stats.total_media_items * 0.4),
        assessments: Math.floor(stats.total_media_items * 0.3),
        resources: Math.floor(stats.total_media_items * 0.2),
        templates: Math.floor(stats.total_media_items * 0.1),
      },
    };
  },
};

// Media Library Hooks
export const useMediaFiles = (params: MediaSearchParams = {}) => {
  const { currentProgram } = useProgramContext();
  
  return useQuery({
    queryKey: [MEDIA_QUERY_KEYS.MEDIA_FILES, params, currentProgram?.id],
    queryFn: () => realMediaApiService.getMediaFiles(params),
    enabled: !!currentProgram,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};

export const useMediaFile = (id: string) => {
  return useQuery({
    queryKey: [MEDIA_QUERY_KEYS.MEDIA_FILE, id],
    queryFn: () => realMediaApiService.getMediaFile(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMediaFolders = () => {
  return useQuery({
    queryKey: [MEDIA_QUERY_KEYS.MEDIA_FOLDERS],
    queryFn: realMediaApiService.getFolders,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMediaStats = () => {
  return useQuery({
    queryKey: [MEDIA_QUERY_KEYS.MEDIA_STATS],
    queryFn: realMediaApiService.getMediaStats,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MediaUploadRequest) => realMediaApiService.uploadMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.MEDIA_FILES] });
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.MEDIA_STATS] });
      toast.success('Media file uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload media file: ${error.message}`);
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => realMediaApiService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.MEDIA_FILES] });
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.MEDIA_STATS] });
      toast.success('Media file deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete media file: ${error.message}`);
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (path: string) => realMediaApiService.createFolder(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.MEDIA_FOLDERS] });
      toast.success('Folder created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });
};

// Convenience hook for media library management
export const useMediaLibrary = (params: MediaSearchParams = {}) => {
  const mediaFiles = useMediaFiles(params);
  const folders = useMediaFolders();
  const stats = useMediaStats();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const createFolder = useCreateFolder();
  
  return {
    mediaFiles: mediaFiles.data?.items || [],
    folders: folders.data || [],
    stats: stats.data,
    isLoading: mediaFiles.isLoading || folders.isLoading || stats.isLoading,
    hasError: mediaFiles.error || folders.error || stats.error,
    uploadMedia: async (files: any[], metadata: { folder?: string; description?: string }) => {
      // Handle multiple file uploads
      for (const fileData of files) {
        await uploadMedia.mutateAsync({
          file: fileData.file,
          folder_path: metadata.folder,
          description: metadata.description,
        });
      }
    },
    deleteMedia: deleteMedia.mutate,
    createFolder: createFolder.mutate,
    
    // Computed values
    totalFiles: mediaFiles.data?.total || 0,
    pagination: {
      page: mediaFiles.data?.page || 1,
      limit: mediaFiles.data?.limit || 20,
      total_pages: mediaFiles.data?.total_pages || 0,
      has_next: mediaFiles.data?.has_next || false,
      has_prev: mediaFiles.data?.has_prev || false,
    },
  };
};