/**
 * Facility management service for API client
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { 
  Facility, 
  FacilityDetail, 
  CreateFacilityRequest, 
  UpdateFacilityRequest,
  FacilitySearchParams,
  FacilityStats,
  FacilityBooking,
  FacilityUtilization,
  Equipment,
  AvailableSlot,
  PaginatedResponse
} from '../../types';

export class FacilityService {
  constructor(private http: HttpClient) {}

  /**
   * Get all facilities (program-filtered automatically)
   */
  async getFacilities(params?: FacilitySearchParams): Promise<ApiResponse<PaginatedResponse<Facility>>> {
    return this.http.get<PaginatedResponse<Facility>>('/facilities', {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Get specific facility by ID
   */
  async getFacility(facilityId: string): Promise<ApiResponse<FacilityDetail>> {
    return this.http.get<FacilityDetail>(`/facilities/${facilityId}`, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Create new facility
   */
  async createFacility(facilityData: CreateFacilityRequest): Promise<ApiResponse<Facility>> {
    return this.http.post<Facility>('/facilities', facilityData);
  }

  /**
   * Update existing facility
   */
  async updateFacility(facilityId: string, updates: UpdateFacilityRequest): Promise<ApiResponse<Facility>> {
    return this.http.put<Facility>(`/facilities/${facilityId}`, updates);
  }

  /**
   * Delete facility
   */
  async deleteFacility(facilityId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/facilities/${facilityId}`);
  }

  /**
   * Get facility statistics
   */
  async getFacilityStats(): Promise<ApiResponse<FacilityStats>> {
    return this.http.get<FacilityStats>('/facilities/stats', {
      useCache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Facility Booking Management

  /**
   * Get facility bookings
   */
  async getFacilityBookings(
    facilityId: string,
    params?: {
      date_from?: string;
      date_to?: string;
      status?: string;
      booked_by?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<FacilityBooking>>> {
    return this.http.get<PaginatedResponse<FacilityBooking>>(`/facilities/${facilityId}/bookings`, {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Create facility booking
   */
  async createBooking(
    facilityId: string,
    bookingData: {
      booking_date: string;
      start_time: string;
      end_time: string;
      purpose: string;
      attendees_count?: number;
      special_requirements?: string;
      recurring_pattern?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        days_of_week?: number[];
        end_date?: string;
        max_occurrences?: number;
      };
    }
  ): Promise<ApiResponse<FacilityBooking>> {
    return this.http.post<FacilityBooking>(`/facilities/${facilityId}/bookings`, bookingData);
  }

  /**
   * Update facility booking
   */
  async updateBooking(bookingId: string, updates: Partial<FacilityBooking>): Promise<ApiResponse<FacilityBooking>> {
    return this.http.patch<FacilityBooking>(`/bookings/${bookingId}`, updates);
  }

  /**
   * Cancel facility booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<void>> {
    return this.http.post<void>(`/bookings/${bookingId}/cancel`, {
      cancellation_reason: reason,
    });
  }

  /**
   * Approve facility booking (Admin roles)
   */
  async approveBooking(bookingId: string): Promise<ApiResponse<FacilityBooking>> {
    return this.http.post<FacilityBooking>(`/bookings/${bookingId}/approve`);
  }

  /**
   * Reject facility booking (Admin roles)
   */
  async rejectBooking(bookingId: string, reason?: string): Promise<ApiResponse<FacilityBooking>> {
    return this.http.post<FacilityBooking>(`/bookings/${bookingId}/reject`, {
      rejection_reason: reason,
    });
  }

  /**
   * Get my bookings
   */
  async getMyBookings(params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<FacilityBooking[]>> {
    return this.http.get<FacilityBooking[]>('/facilities/my-bookings', {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  // Facility Availability

  /**
   * Get facility availability
   */
  async getFacilityAvailability(
    facilityId: string,
    params: {
      date_from: string;
      date_to: string;
      duration_hours?: number;
    }
  ): Promise<ApiResponse<AvailableSlot[]>> {
    return this.http.get<AvailableSlot[]>(`/facilities/${facilityId}/availability`, {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Check if facility is available for specific time
   */
  async checkAvailability(
    facilityId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ApiResponse<{ available: boolean; conflicts?: FacilityBooking[] }>> {
    return this.http.post(`/facilities/${facilityId}/check-availability`, {
      date,
      start_time: startTime,
      end_time: endTime,
    }, {
      useCache: true,
      cacheTTL: 1 * 60 * 1000, // 1 minute
    });
  }

  /**
   * Get facility schedule for date range
   */
  async getFacilitySchedule(
    facilityId: string,
    params: {
      date_from: string;
      date_to: string;
      view?: 'day' | 'week' | 'month';
    }
  ): Promise<ApiResponse<{
    date: string;
    bookings: FacilityBooking[];
    available_slots: AvailableSlot[];
  }[]>> {
    return this.http.get(`/facilities/${facilityId}/schedule`, {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  // Equipment Management

  /**
   * Get facility equipment
   */
  async getFacilityEquipment(facilityId: string): Promise<ApiResponse<Equipment[]>> {
    return this.http.get<Equipment[]>(`/facilities/${facilityId}/equipment`, {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Add equipment to facility
   */
  async addEquipment(facilityId: string, equipment: Omit<Equipment, 'id'>): Promise<ApiResponse<Equipment>> {
    return this.http.post<Equipment>(`/facilities/${facilityId}/equipment`, equipment);
  }

  /**
   * Update equipment
   */
  async updateEquipment(equipmentId: string, updates: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    return this.http.patch<Equipment>(`/equipment/${equipmentId}`, updates);
  }

  /**
   * Remove equipment from facility
   */
  async removeEquipment(equipmentId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/equipment/${equipmentId}`);
  }

  /**
   * Report equipment maintenance
   */
  async reportMaintenance(
    equipmentId: string,
    maintenanceData: {
      maintenance_type: 'routine' | 'repair' | 'upgrade' | 'inspection' | 'cleaning' | 'emergency';
      description: string;
      scheduled_date?: string;
      assigned_to?: string;
      estimated_duration?: number;
    }
  ): Promise<ApiResponse<any>> {
    return this.http.post(`/equipment/${equipmentId}/maintenance`, maintenanceData);
  }

  // Facility Utilization and Analytics

  /**
   * Get facility utilization statistics
   */
  async getFacilityUtilization(
    facilityId: string,
    params?: {
      period?: 'daily' | 'weekly' | 'monthly';
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<FacilityUtilization>> {
    return this.http.get<FacilityUtilization>(`/facilities/${facilityId}/utilization`, {
      params,
      useCache: true,
      cacheTTL: 15 * 60 * 1000, // 15 minutes
    });
  }

  /**
   * Get booking patterns and trends
   */
  async getBookingTrends(
    facilityId?: string,
    params?: {
      period?: 'daily' | 'weekly' | 'monthly';
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<{
    period: string;
    bookings: number;
    utilization_rate: number;
    peak_hours: string[];
  }[]>> {
    const endpoint = facilityId ? `/facilities/${facilityId}/trends` : '/facilities/trends';
    return this.http.get(endpoint, {
      params,
      useCache: true,
      cacheTTL: 15 * 60 * 1000,
    });
  }

  /**
   * Get popular booking times
   */
  async getPopularTimes(facilityId: string): Promise<ApiResponse<{
    hour: number;
    day_of_week: number;
    booking_count: number;
    utilization_rate: number;
  }[]>> {
    return this.http.get(`/facilities/${facilityId}/popular-times`, {
      useCache: true,
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    });
  }

  // Facility Search and Filtering

  /**
   * Search facilities by criteria
   */
  async searchFacilities(params: {
    query?: string;
    facility_type?: string[];
    capacity_min?: number;
    capacity_max?: number;
    equipment?: string[];
    amenities?: string[];
    available_date?: string;
    available_start_time?: string;
    available_end_time?: string;
    sort_by?: 'name' | 'capacity' | 'created_at';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Facility>>> {
    return this.http.post<PaginatedResponse<Facility>>('/facilities/search', params, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get available facilities for specific time slot
   */
  async getAvailableFacilities(params: {
    date: string;
    start_time: string;
    end_time: string;
    facility_type?: string;
    capacity_min?: number;
    equipment?: string[];
  }): Promise<ApiResponse<Facility[]>> {
    return this.http.post<Facility[]>('/facilities/available', params, {
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Get facility recommendations based on usage patterns
   */
  async getFacilityRecommendations(params: {
    purpose?: string;
    attendees_count?: number;
    preferred_time?: string;
    duration_hours?: number;
  }): Promise<ApiResponse<{
    facility: Facility;
    score: number;
    reasons: string[];
  }[]>> {
    return this.http.post('/facilities/recommendations', params, {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }
}