/**
 * Facilities types
 */

export type FacilityType = 'POOL' | 'COURTS' | 'GYM' | 'FIELD' | 'CLASSROOM' | 'EXTERNAL';

export type FacilityStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface FacilityContact {
  phone: string;
  email: string;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  facility_type: FacilityType;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  capacity?: number;
  area_sqft?: number;
  contact_phone?: string;
  contact_email?: string;
  facility_head_name?: string;
  facility_head_phone?: string;
  access_fee_kids?: number;
  access_fee_adults?: number;
  specifications?: Record<string, any>;
  operating_hours?: Record<string, any>;
  equipment?: Record<string, any>;
  status: FacilityStatus;
  facility_code?: string;
  notes?: string;
  program_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityCreate {
  name: string;
  description?: string;
  facility_type: FacilityType;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  capacity?: number;
  area_sqft?: number;
  contact_phone?: string;
  contact_email?: string;
  facility_head_name?: string;
  facility_head_phone?: string;
  access_fee_kids?: number;
  access_fee_adults?: number;
  specifications?: Record<string, any>;
  operating_hours?: Record<string, any>;
  equipment?: Record<string, any>;
  status?: FacilityStatus;
  facility_code?: string;
  notes?: string;
  program_id?: string;
}

export interface FacilityUpdate {
  name?: string;
  description?: string;
  facility_type?: FacilityType;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  capacity?: number;
  area_sqft?: number;
  contact_phone?: string;
  contact_email?: string;
  facility_head_name?: string;
  facility_head_phone?: string;
  access_fee_kids?: number;
  access_fee_adults?: number;
  specifications?: Record<string, any>;
  operating_hours?: Record<string, any>;
  equipment?: Record<string, any>;
  status?: FacilityStatus;
  facility_code?: string;
  notes?: string;
  program_id?: string;
}

export interface FacilitySearchParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: FacilityStatus;
  facility_type?: FacilityType;
  program_id?: string;
  city?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FacilityListResponse {
  items: Facility[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface FacilityStatsResponse {
  total_facilities: number;
  active_facilities: number;
  total_capacity: number;
  facilities_by_type: Record<FacilityType, number>;
  facilities_by_status: Record<FacilityStatus, number>;
}