/**
 * Facility Course Pricing API Service
 */

import { httpClient, type ApiResponse } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';

// Types
export interface PricingEntry {
  id?: string;
  facility_id: string;
  course_id: string;
  age_group: string;
  location_type: string;
  session_type: string;
  price: number;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  
  // Computed properties
  display_name?: string;
  formatted_price?: string;
  pricing_key?: string;
  
  // Nested relationships
  facility?: {
    id: string;
    name: string;
  };
  course?: {
    id: string;
    name: string;
  };
}

export interface PricingLookupRequest {
  facility_id: string;
  course_id: string;
  age_group: string;
  location_type: string;
  session_type: string;
}

export interface PricingLookupResponse {
  found: boolean;
  price?: number;
  formatted_price?: string;
  pricing_entry?: PricingEntry;
  fallback_range?: {
    age_group: string;
    price_from: number;
    price_to: number;
    formatted_range: string;
  };
}

export interface CoursePricingMatrix {
  facility_id: string;
  facility_name: string;
  courses: Array<{
    course_id: string;
    course_name: string;
    pricing_matrix: Array<{
      age_group: string;
      location_type: string;
      session_type: string;
      price: number;
      formatted_price: string;
      is_active: boolean;
      notes?: string;
    }>;
  }>;
}

export interface PricingStats {
  total_pricing_entries: number;
  active_pricing_entries: number;
  facilities_with_pricing: number;
  courses_with_pricing: number;
  pricing_by_facility: Record<string, number>;
  pricing_by_course: Record<string, number>;
  average_price: number;
  price_range: {
    min: number;
    max: number;
  };
}

export interface BulkCreateRequest {
  entries: Omit<PricingEntry, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[];
  overwrite_existing: boolean;
}

export interface BulkUpdateRequest {
  facility_id: string;
  course_id?: string;
  price_adjustment?: number;
  price_multiplier?: number;
  new_status?: boolean;
}

export interface ImportRequest {
  source_facility_id: string;
  target_facility_id: string;
  overwrite_existing: boolean;
  apply_adjustment?: number;
  course_ids?: string[];
}

class FacilityCoursePricingApiService {
  private baseEndpoint = `${API_ENDPOINTS.FACILITIES}/pricing`;

  /**
   * Create a new facility course pricing entry
   */
  async createPricingEntry(pricingData: Omit<PricingEntry, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<PricingEntry> {
    const response = await httpClient.post<PricingEntry>(this.baseEndpoint, pricingData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create pricing entry');
    }
    
    return response.data;
  }

  /**
   * Get all pricing entries with filtering
   */
  async getPricingEntries(params?: {
    page?: number;
    per_page?: number;
    facility_id?: string;
    course_id?: string;
    age_group?: string;
    location_type?: string;
    session_type?: string;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    items: PricingEntry[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  }> {
    const response = await httpClient.get<{
      items: PricingEntry[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    }>(this.baseEndpoint, { params });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get pricing entries');
    }
    
    return response.data;
  }

  /**
   * Get a specific pricing entry
   */
  async getPricingEntry(pricingId: string): Promise<PricingEntry> {
    const response = await httpClient.get<PricingEntry>(`${this.baseEndpoint}/${pricingId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get pricing entry');
    }
    
    return response.data;
  }

  /**
   * Update a pricing entry
   */
  async updatePricingEntry(pricingId: string, pricingData: Partial<Pick<PricingEntry, 'price' | 'is_active' | 'notes'>>): Promise<PricingEntry> {
    const response = await httpClient.put<PricingEntry>(`${this.baseEndpoint}/${pricingId}`, pricingData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update pricing entry');
    }
    
    return response.data;
  }

  /**
   * Delete a pricing entry
   */
  async deletePricingEntry(pricingId: string): Promise<void> {
    const response = await httpClient.delete(`${this.baseEndpoint}/${pricingId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete pricing entry');
    }
  }

  /**
   * Get all pricing entries for a specific facility
   */
  async getFacilityPricing(facilityId: string, includeInactive = false): Promise<PricingEntry[]> {
    const response = await httpClient.get<PricingEntry[]>(
      `${this.baseEndpoint}/facility/${facilityId}/pricing`,
      { params: { include_inactive: includeInactive } }
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get facility pricing');
    }
    
    return response.data;
  }

  /**
   * Get all pricing entries for a specific course
   */
  async getCoursePricing(courseId: string, includeInactive = false): Promise<PricingEntry[]> {
    const response = await httpClient.get<PricingEntry[]>(
      `${this.baseEndpoint}/course/${courseId}/pricing`,
      { params: { include_inactive: includeInactive } }
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get course pricing');
    }
    
    return response.data;
  }

  /**
   * Look up specific pricing
   */
  async lookupPricing(lookupRequest: PricingLookupRequest): Promise<PricingLookupResponse> {
    const response = await httpClient.post<PricingLookupResponse>(`${this.baseEndpoint}/lookup`, lookupRequest);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to lookup pricing');
    }
    
    return response.data;
  }

  /**
   * Get complete pricing matrix for a facility
   */
  async getPricingMatrix(facilityId: string): Promise<CoursePricingMatrix> {
    const response = await httpClient.get<CoursePricingMatrix>(`${this.baseEndpoint}/facility/${facilityId}/matrix`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get pricing matrix');
    }
    
    return response.data;
  }

  /**
   * Bulk create pricing entries
   */
  async bulkCreatePricing(bulkRequest: BulkCreateRequest): Promise<PricingEntry[]> {
    const response = await httpClient.post<PricingEntry[]>(`${this.baseEndpoint}/bulk-create`, bulkRequest);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk create pricing entries');
    }
    
    return response.data;
  }

  /**
   * Bulk update pricing entries
   */
  async bulkUpdatePricing(bulkRequest: BulkUpdateRequest): Promise<PricingEntry[]> {
    const response = await httpClient.post<PricingEntry[]>(`${this.baseEndpoint}/bulk-update`, bulkRequest);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to bulk update pricing entries');
    }
    
    return response.data;
  }

  /**
   * Import pricing from another facility
   */
  async importPricing(importRequest: ImportRequest): Promise<PricingEntry[]> {
    const response = await httpClient.post<PricingEntry[]>(`${this.baseEndpoint}/import`, importRequest);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to import pricing');
    }
    
    return response.data;
  }

  /**
   * Get pricing statistics
   */
  async getPricingStats(): Promise<PricingStats> {
    const response = await httpClient.get<PricingStats>(`${this.baseEndpoint}/stats`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get pricing statistics');
    }
    
    return response.data;
  }

  /**
   * Helper method to format price as currency
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price).replace('NGN', '₦');
  }

  /**
   * Helper method to generate pricing entry combinations for a course
   */
  generatePricingEntries(
    facilityId: string,
    courseId: string,
    course: {
      age_groups: string[];
      location_types: string[];
      session_types: string[];
      pricing_ranges: Array<{
        age_group: string;
        price_from: number;
        price_to: number;
      }>;
    }
  ): Omit<PricingEntry, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[] {
    const entries: Omit<PricingEntry, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[] = [];

    for (const ageGroup of course.age_groups) {
      // Find the price range for this age group
      const priceRange = course.pricing_ranges.find(range => range.age_group === ageGroup);
      const defaultPrice = priceRange ? Math.round((priceRange.price_from + priceRange.price_to) / 2) : 0;

      for (const locationType of course.location_types) {
        for (const sessionType of course.session_types) {
          entries.push({
            facility_id: facilityId,
            course_id: courseId,
            age_group: ageGroup,
            location_type: locationType,
            session_type: sessionType,
            price: defaultPrice,
            is_active: true,
            notes: priceRange ? `Auto-generated from course pricing range (₦${priceRange.price_from.toLocaleString()} - ₦${priceRange.price_to.toLocaleString()})` : undefined
          });
        }
      }
    }

    return entries;
  }
}

// Create and export the API service instance
export const facilityCoursePricingApi = new FacilityCoursePricingApiService();