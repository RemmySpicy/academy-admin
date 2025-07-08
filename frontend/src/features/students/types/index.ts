/**
 * Student-related types and interfaces
 */

export interface Student {
  id: string;
  student_id: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  referral_source?: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  medications?: string;
  allergies?: string;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  salutation?: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  referral_source?: string;
  enrollment_date: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medical_info?: {
    conditions?: string;
    medications?: string;
    allergies?: string;
  };
  notes?: string;
}

export interface StudentUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  salutation?: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  referral_source?: string;
  enrollment_date?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medical_info?: {
    conditions?: string;
    medications?: string;
    allergies?: string;
  };
  notes?: string;
}

export interface StudentSearchParams {
  search?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  enrollment_date_from?: string;
  enrollment_date_to?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface StudentListResponse {
  items: Student[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface StudentStats {
  total_students: number;
  active_students: number;
  inactive_students: number;
  pending_students: number;
  suspended_students: number;
  students_by_gender: Record<string, number>;
  students_by_age_group: Record<string, number>;
  recent_enrollments: number;
}

export interface StudentBulkAction {
  student_ids: string[];
  action: string;
  parameters?: Record<string, any>;
}

export interface StudentBulkActionResponse {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
  total_processed: number;
  total_successful: number;
  total_failed: number;
}

// Helper types for forms
export interface StudentFormData extends Omit<StudentCreate, 'date_of_birth' | 'enrollment_date'> {
  date_of_birth: Date;
  enrollment_date: Date;
}

export interface StudentFilters {
  search: string;
  status: string;
  gender: string;
  enrollment_date_from: string;
  enrollment_date_to: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

// Status and gender options for forms
export const STUDENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
] as const;

export const SALUTATION_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' }
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: 'Mother', label: 'Mother' },
  { value: 'Father', label: 'Father' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Grandparent', label: 'Grandparent' },
  { value: 'Other', label: 'Other' }
] as const;