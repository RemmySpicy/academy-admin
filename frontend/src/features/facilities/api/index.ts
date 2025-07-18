/**
 * Facilities API services
 */

import { httpClient } from '@/lib/api/httpClient';
import {
  Facility,
  FacilityCreate,
  FacilityUpdate,
  FacilitySearchParams,
  FacilityListResponse,
  FacilityStatsResponse
} from '../types';

const BASE_PATH = '/api/v1/facilities';

export const facilitiesApi = {
  /**
   * Get all facilities with optional filtering and pagination
   */
  async getFacilities(params?: FacilitySearchParams): Promise<FacilityListResponse> {
    const response = await httpClient.get<FacilityListResponse>(BASE_PATH);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facilities');
    }
    return response.data;
  },

  /**
   * Get facility by ID
   */
  async getFacility(id: string): Promise<Facility> {
    const response = await httpClient.get<Facility>(`${BASE_PATH}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility');
    }
    return response.data;
  },

  /**
   * Create new facility
   */
  async createFacility(facilityData: FacilityCreate): Promise<Facility> {
    const response = await httpClient.post<Facility>(BASE_PATH, facilityData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create facility');
    }
    return response.data;
  },

  /**
   * Update facility
   */
  async updateFacility(id: string, facilityData: FacilityUpdate): Promise<Facility> {
    const response = await httpClient.put<Facility>(`${BASE_PATH}/${id}`, facilityData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update facility');
    }
    return response.data;
  },

  /**
   * Delete facility
   */
  async deleteFacility(id: string): Promise<void> {
    const response = await httpClient.delete<void>(`${BASE_PATH}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete facility');
    }
  },

  /**
   * Get facility statistics
   */
  async getFacilityStats(): Promise<FacilityStatsResponse> {
    const response = await httpClient.get<FacilityStatsResponse>(`${BASE_PATH}/stats`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility statistics');
    }
    return response.data;
  }
};

export default facilitiesApi;