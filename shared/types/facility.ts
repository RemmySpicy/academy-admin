/**
 * Facility management types
 * Derived from backend facility models and schemas
 */

import { AuditFields, Status } from './common';

/**
 * Facility entity
 */
export interface Facility extends AuditFields {
  program_id: string;
  name: string;
  facility_type: FacilityType;
  description?: string;
  location?: string;
  capacity: number;
  equipment: string[];
  amenities: string[];
  status: FacilityStatus;
  booking_rules?: BookingRules;
  maintenance_schedule?: MaintenanceSchedule[];
  contact_info?: FacilityContact;
  images?: string[];
  metadata?: Record<string, any>;
}

/**
 * Facility types
 */
export type FacilityType = 
  | 'pool'
  | 'court'
  | 'gym'
  | 'field'
  | 'classroom'
  | 'lab'
  | 'library'
  | 'auditorium'
  | 'workshop'
  | 'outdoor_space';

/**
 * Facility status
 */
export type FacilityStatus = 
  | 'active'
  | 'maintenance'
  | 'inactive'
  | 'renovation'
  | 'closed';

/**
 * Facility booking rules
 */
export interface BookingRules {
  advance_booking_days: number;
  max_booking_duration: number; // in hours
  min_booking_duration: number; // in hours
  booking_slots: TimeSlot[];
  restricted_times?: TimeSlot[];
  requires_supervision: boolean;
  allowed_roles: string[];
  booking_fee?: number;
  cancellation_policy?: string;
}

/**
 * Time slot for bookings
 */
export interface TimeSlot {
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  days_of_week: number[]; // 0-6 (Sunday-Saturday)
}

/**
 * Maintenance schedule entry
 */
export interface MaintenanceSchedule {
  id: string;
  scheduled_date: string;
  duration_hours: number;
  maintenance_type: MaintenanceType;
  description: string;
  assigned_to?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

/**
 * Maintenance types
 */
export type MaintenanceType = 
  | 'routine'
  | 'repair'
  | 'upgrade'
  | 'inspection'
  | 'cleaning'
  | 'emergency';

/**
 * Facility contact information
 */
export interface FacilityContact {
  manager_name?: string;
  manager_phone?: string;
  manager_email?: string;
  emergency_contact?: string;
  operating_hours?: string;
}

/**
 * Facility creation request
 */
export interface CreateFacilityRequest {
  program_id: string;
  name: string;
  facility_type: FacilityType;
  description?: string;
  location?: string;
  capacity: number;
  equipment?: string[];
  amenities?: string[];
  status?: FacilityStatus;
  booking_rules?: BookingRules;
  contact_info?: FacilityContact;
  images?: string[];
}

/**
 * Facility update request
 */
export interface UpdateFacilityRequest {
  name?: string;
  facility_type?: FacilityType;
  description?: string;
  location?: string;
  capacity?: number;
  equipment?: string[];
  amenities?: string[];
  status?: FacilityStatus;
  booking_rules?: BookingRules;
  contact_info?: FacilityContact;
  images?: string[];
}

/**
 * Facility with booking information
 */
export interface FacilityDetail extends Facility {
  current_bookings: FacilityBooking[];
  upcoming_maintenance: MaintenanceSchedule[];
  utilization_stats: FacilityUtilization;
  available_slots: AvailableSlot[];
}

/**
 * Facility booking
 */
export interface FacilityBooking extends AuditFields {
  facility_id: string;
  booked_by: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  attendees_count?: number;
  special_requirements?: string;
  status: BookingStatus;
  approved_by?: string;
  approval_date?: string;
  cancellation_reason?: string;
  recurring_pattern?: RecurringPattern;
}

/**
 * Booking status
 */
export type BookingStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'no_show';

/**
 * Recurring booking pattern
 */
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every N days/weeks/months
  days_of_week?: number[]; // For weekly recurring
  end_date?: string;
  max_occurrences?: number;
}

/**
 * Available time slot
 */
export interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  is_prime_time: boolean;
}

/**
 * Facility utilization statistics
 */
export interface FacilityUtilization {
  utilization_rate: number; // Percentage
  total_bookings_this_month: number;
  average_booking_duration: number;
  peak_hours: TimeSlot[];
  most_common_purposes: {
    purpose: string;
    count: number;
  }[];
  monthly_trends: {
    month: string;
    bookings: number;
    utilization_rate: number;
  }[];
}

/**
 * Facility search parameters
 */
export interface FacilitySearchParams {
  search?: string;
  facility_type?: FacilityType;
  status?: FacilityStatus;
  capacity_min?: number;
  capacity_max?: number;
  equipment?: string[];
  amenities?: string[];
  available_date?: string;
  available_start_time?: string;
  available_end_time?: string;
  page?: number;
  per_page?: number;
}

/**
 * Facility statistics
 */
export interface FacilityStats {
  total_facilities: number;
  active_facilities: number;
  facilities_by_type: Record<FacilityType, number>;
  total_capacity: number;
  average_utilization: number;
  maintenance_due: number;
  booking_trends: {
    month: string;
    bookings: number;
    utilization: number;
  }[];
}

/**
 * Equipment item
 */
export interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_replacement';
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  location?: string;
  notes?: string;
}