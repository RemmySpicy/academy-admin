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

// Enhanced types for new facility operations
export interface FacilityDuplicateRequest {
  name: string;
  facility_code?: string;
  copy_specifications?: boolean;
  copy_equipment?: boolean;
  copy_operating_hours?: boolean;
  copy_pricing?: boolean;
}

export interface FacilityArchiveRequest {
  reason?: string;
  archive_date?: string;
  notify_users?: boolean;
}

export interface FacilityExportData {
  facility: Facility;
  specifications?: Record<string, any>;
  equipment?: Record<string, any>;
  operating_hours?: Record<string, any>;
  pricing_data?: any[];
  staff_assignments?: any[];
  schedule_data?: any[];
  export_date: string;
  export_note?: string;
}

export interface FacilityManagerAssignment {
  user_id: string;
  role: 'manager' | 'assistant_manager' | 'coordinator';
  start_date?: string;
  notes?: string;
}

export interface FacilityStaffAssignment {
  user_id: string;
  facility_id: string;
  role: string;
  permissions: string[];
  active: boolean;
  assigned_date: string;
}

export interface FacilityScheduleSlot {
  id: string;
  facility_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  activity_type?: string;
  instructor_id?: string;
  capacity_override?: number;
  notes?: string;
  recurring: boolean;
  active: boolean;
}

export interface FacilityAvailability {
  id: string;
  facility_id: string;
  date: string;
  available_from: string;
  available_to: string;
  maintenance_window?: {
    start: string;
    end: string;
    reason: string;
  };
  booking_slots: Array<{
    start_time: string;
    end_time: string;
    available_capacity: number;
    booked_capacity: number;
  }>;
}