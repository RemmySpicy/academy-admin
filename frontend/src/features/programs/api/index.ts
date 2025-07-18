/**
 * Programs API Service
 * 
 * Handles API calls related to program management
 */

import { apiClient } from '@/lib/api';
import { Program } from '@/store/types';

export interface ProgramsApiResponse {
  programs: Program[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProgramData {
  name: string;
  code: string;
  description?: string;
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
  displayOrder?: number;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {
  id: string;
}

/**
 * Programs API Client
 */
export const programsApi = {
  /**
   * Get all programs with optional filtering
   */
  getPrograms: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ProgramsApiResponse> => {
    const response = await apiClient.get('/programs/', { params });
    return response.data;
  },

  /**
   * Get specific programs by IDs
   */
  getProgramsByIds: async (programIds: string[]): Promise<Program[]> => {
    // Temporary implementation using existing single program API
    const programs = await Promise.all(
      programIds.map(id => programsApi.getProgram(id))
    );
    return programs;
    
    // Future batch API (uncomment when backend supports it):
    // const response = await apiClient.post('/curriculum/programs/batch', {
    //   program_ids: programIds
    // });
    // return response.data.programs;
  },

  /**
   * Get a single program by ID
   */
  getProgram: async (id: string): Promise<Program> => {
    const response = await apiClient.get(`/programs/${id}`);
    return response.data;
  },

  /**
   * Create a new program
   */
  createProgram: async (data: CreateProgramData): Promise<Program> => {
    const response = await apiClient.post('/programs/', data);
    return response.data;
  },

  /**
   * Update an existing program
   */
  updateProgram: async (id: string, data: Partial<CreateProgramData>): Promise<Program> => {
    const response = await apiClient.put(`/programs/${id}`, data);
    return response.data;
  },

  /**
   * Delete a program
   */
  deleteProgram: async (id: string): Promise<void> => {
    await apiClient.delete(`/programs/${id}`);
  },

  /**
   * Track program switch for analytics (optional)
   */
  trackProgramSwitch: async (programId: string): Promise<void> => {
    try {
      await apiClient.post('/analytics/program-switch', {
        program_id: programId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Silently fail for analytics tracking
      console.warn('Failed to track program switch:', error);
    }
  },
};

export default programsApi;