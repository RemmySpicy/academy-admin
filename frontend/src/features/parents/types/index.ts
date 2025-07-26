/**
 * Parent-specific types and interfaces
 */

import type { User } from '@/lib/api/types';

export interface Parent extends User {
  children_count: number;
  has_children: boolean;
  outstanding_balance?: number;
  last_contact_at?: string;
}

export interface ParentRelationship {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  relationship_type: RelationshipType;
  program_id: string;
  is_active: boolean;
  is_primary: boolean;
  emergency_contact: boolean;
  can_pick_up: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ChildConnection {
  user: User;
  relationship_type: string;
  is_primary: boolean;
  relationship_id: string;
  emergency_contact: boolean;
  can_pick_up: boolean;
  notes?: string;
}

export interface ParentFamilyStructure {
  user: User;
  children: ChildConnection[];
  relationships: ParentRelationship[];
}

export type RelationshipType = 
  | 'father'
  | 'mother' 
  | 'guardian'
  | 'grandparent'
  | 'sibling'
  | 'spouse'
  | 'other';

// Enhanced parent form data with separate name fields and improved structure
export interface ParentFormData {
  // Basic info
  username: string;
  email: string;
  password?: string; // Only for create mode
  first_name: string;
  last_name: string;
  full_name?: string; // Computed from first + last names
  phone?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  
  // Emergency contact
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
  
  // Communication preferences
  communication_preferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    preferred_time: string;
    newsletter: boolean;
    progress_reports: boolean;
    event_notifications: boolean;
  };
  
  // Address
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Financial preferences
  financial_info: {
    billing_contact_same: boolean;
    billing_address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    payment_method_type: string;
    auto_pay_enabled: boolean;
  };
  
  // Additional preferences
  preferences: {
    pickup_authorized: boolean;
    photo_consent: boolean;
    marketing_consent: boolean;
    data_sharing_consent: boolean;
  };
  
  // Notes
  notes: string;
}

export interface ParentUpdateFormData {
  username?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  profile_photo_url?: string;
  is_active?: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  communication_preferences?: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    preferred_time?: string;
  };
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface ParentSearchFilters {
  search?: string;
  is_active?: boolean;
  has_children?: boolean;
  program_id?: string;
  relationship_type?: RelationshipType;
  sort_by?: 'full_name' | 'email' | 'created_at' | 'children_count';
  sort_order?: 'asc' | 'desc';
}

export interface ParentCommunication {
  id: string;
  parent_id: string;
  type: 'email' | 'sms' | 'phone' | 'meeting' | 'note';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  created_by: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ParentFinancialSummary {
  parent_id: string;
  total_fees: number;
  total_paid: number;
  outstanding_balance: number;
  overdue_amount: number;
  children_breakdown: Array<{
    child_id: string;
    child_name: string;
    total_fees: number;
    amount_paid: number;
    outstanding_balance: number;
    last_payment_date?: string;
    next_due_date?: string;
  }>;
  payment_history: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string;
    child_id?: string;
    description: string;
  }>;
  payment_methods: Array<{
    id: string;
    type: 'credit_card' | 'bank_account' | 'paypal';
    last_four: string;
    is_default: boolean;
    expires?: string;
  }>;
}

export interface ParentEnrollmentSummary {
  parent_id: string;
  children_enrollments: Array<{
    child_id: string;
    child_name: string;
    enrollments: Array<{
      id: string;
      program_name: string;
      course_name: string;
      level: string;
      instructor: string;
      status: 'active' | 'paused' | 'completed' | 'withdrawn';
      start_date: string;
      end_date?: string;
      schedule: string;
      progress_percentage: number;
    }>;
  }>;
  family_schedule: Array<{
    day: string;
    sessions: Array<{
      time: string;
      child_name: string;
      program: string;
      course: string;
      instructor: string;
      location: string;
    }>;
  }>;
}

export interface ParentStats {
  total_parents: number;
  active_parents: number;
  inactive_parents: number;
  parents_with_children: number;
  parents_without_children: number;
  total_children_connections: number;
  parents_with_multiple_children: number;
  average_children_per_parent: number;
}

export interface ParentActionMenuItem {
  key: string;
  label: string;
  icon: React.ComponentType;
  action: (parent: Parent) => void;
  disabled?: (parent: Parent) => boolean;
  variant?: 'default' | 'destructive';
}

// Form options and constants
export const COMMUNICATION_TIME_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: 'morning', label: 'Morning (8AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
  { value: 'evening', label: 'Evening (6PM - 9PM)' },
  { value: 'weekends', label: 'Weekends only' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'other', label: 'Other' },
] as const;

// Re-export commonly used types
export type { User } from '@/lib/api/types';