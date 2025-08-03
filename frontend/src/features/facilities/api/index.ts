/**
 * Facilities API services
 */

import { httpClient } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  Facility,
  FacilityCreate,
  FacilityUpdate,
  FacilitySearchParams,
  FacilityListResponse,
  FacilityStatsResponse,
  FacilityDuplicateRequest,
  FacilityArchiveRequest,
  FacilityManagerAssignment,
  FacilityScheduleSlot,
  FacilityAvailability,
  FacilityStaffAssignment
} from '../types';

export const facilitiesApi = {
  /**
   * Get all facilities with optional filtering and pagination
   */
  async getFacilities(params?: FacilitySearchParams): Promise<FacilityListResponse> {
    const response = await httpClient.get<FacilityListResponse>(API_ENDPOINTS.facilities.list, params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facilities');
    }
    return response.data;
  },

  /**
   * Get facility by ID
   */
  async getFacility(id: string): Promise<Facility> {
    const response = await httpClient.get<Facility>(API_ENDPOINTS.facilities.get(id));
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility');
    }
    return response.data;
  },

  /**
   * Create new facility
   */
  async createFacility(facilityData: FacilityCreate): Promise<Facility> {
    const response = await httpClient.post<Facility>(API_ENDPOINTS.facilities.create, facilityData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create facility');
    }
    return response.data;
  },

  /**
   * Update facility
   */
  async updateFacility(id: string, facilityData: FacilityUpdate): Promise<Facility> {
    const response = await httpClient.put<Facility>(API_ENDPOINTS.facilities.update(id), facilityData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update facility');
    }
    return response.data;
  },

  /**
   * Delete facility
   */
  async deleteFacility(id: string): Promise<void> {
    const response = await httpClient.delete<void>(API_ENDPOINTS.facilities.delete(id));
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete facility');
    }
  },

  /**
   * Get facility statistics
   */
  async getFacilityStats(): Promise<FacilityStatsResponse> {
    const response = await httpClient.get<FacilityStatsResponse>(API_ENDPOINTS.facilities.stats);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility statistics');
    }
    return response.data;
  },

  /**
   * Duplicate a facility
   */
  async duplicateFacility(facilityId: string, duplicateData: FacilityDuplicateRequest): Promise<Facility> {
    const response = await httpClient.post<Facility>(`${API_ENDPOINTS.facilities.get(facilityId)}/duplicate`, duplicateData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to duplicate facility');
    }
    return response.data;
  },

  /**
   * Archive a facility
   */
  async archiveFacility(facilityId: string, archiveData: FacilityArchiveRequest): Promise<Facility> {
    const response = await httpClient.post<Facility>(`${API_ENDPOINTS.facilities.get(facilityId)}/archive`, archiveData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to archive facility');
    }
    return response.data;
  },

  /**
   * Assign manager to facility
   */
  async assignManager(facilityId: string, assignment: FacilityManagerAssignment): Promise<Facility> {
    const response = await httpClient.post<Facility>(`${API_ENDPOINTS.facilities.get(facilityId)}/assign-manager`, assignment);
    if (!response.success) {
      throw new Error(response.error || 'Failed to assign manager to facility');
    }
    return response.data;
  },

  /**
   * Get facility schedule
   */
  async getFacilitySchedule(facilityId: string): Promise<FacilityScheduleSlot[]> {
    const response = await httpClient.get<FacilityScheduleSlot[]>(`${API_ENDPOINTS.facilities.get(facilityId)}/schedule`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility schedule');
    }
    return response.data;
  },

  /**
   * Get facility availability
   */
  async getFacilityAvailability(facilityId: string, date?: string): Promise<FacilityAvailability> {
    const params = date ? { date } : undefined;
    const response = await httpClient.get<FacilityAvailability>(`${API_ENDPOINTS.facilities.get(facilityId)}/availability`, params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility availability');
    }
    return response.data;
  },

  /**
   * Get facility staff assignments
   */
  async getFacilityStaff(facilityId: string): Promise<FacilityStaffAssignment[]> {
    const response = await httpClient.get<FacilityStaffAssignment[]>(`${API_ENDPOINTS.facilities.get(facilityId)}/staff`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility staff');
    }
    return response.data;
  }
};

export default facilitiesApi;