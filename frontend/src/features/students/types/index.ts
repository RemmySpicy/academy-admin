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
  
  // Computed/derived fields
  age?: number;
  program_name?: string;
  program_id: string;
  user_id?: string;
  
  // New table fields
  facility_name?: string;
  course_name?: string;
  current_level?: number;
  current_module?: number;
  completed_sessions?: number;
  total_sessions?: number;
  payment_status?: 'fully_paid' | 'partially_paid' | 'not_paid';
  
  // For compatibility with existing code
  program?: string; // alias for program_name
}

export interface StudentCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  salutation?: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  program_id: string;
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
  program_id?: string;
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
// Enhanced form data interfaces for unified forms
export interface StudentFormData {
  // Basic info
  username: string;
  email: string;
  password?: string; // Only for create mode
  salutation?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth: string;
  gender?: string;
  
  // Program & enrollment
  program_id: string;
  course_id?: string;
  referral_source?: string;
  enrollment_date: string;
  status: string;
  
  // Address
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Emergency contact
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
  
  // Medical info
  medical_info: {
    conditions: string;
    medications: string;
    allergies: string;
  };
  
  // Additional
  notes: string;
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
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'other', label: 'Other' }
] as const;

// Enhanced types for new functionality
export interface UserRelationship {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  relationship_type: string;
  is_active: boolean;
  is_primary: boolean;
  emergency_contact: boolean;
  can_pick_up: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  student_id?: string;
  course_id: string;
  program_id: string;
  enrollment_date: string;
  start_date?: string;
  completion_date?: string;
  status: 'active' | 'paused' | 'completed' | 'withdrawn' | 'waitlisted';
  progress_percentage?: number;
  enrollment_fee?: number;
  amount_paid?: number;
  outstanding_balance?: number;
  referral_source?: string;
  special_requirements?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  roles: string[];
  primary_role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  
  // Family relationships
  children?: UserRelationship[];
  parents?: UserRelationship[];
  
  // Course enrollments
  active_enrollments?: CourseEnrollment[];
  
  // Student profile (if exists)
  student_profile?: Student;
}

export interface StudentParentCreate {
  // Parent information
  parent_username: string;
  parent_email: string;
  parent_password: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_phone?: string;
  parent_date_of_birth?: string;
  
  // Child information
  child_username: string;
  child_email: string;
  child_password: string;
  child_first_name: string;
  child_last_name: string;
  child_phone?: string;
  child_date_of_birth?: string;
  
  // Relationship
  relationship_type: string;
  
  // Course enrollment (optional)
  course_id?: string;
  program_id: string;
}