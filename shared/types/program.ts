/**
 * Program management types
 * Derived from backend program models and schemas
 */

import { AuditFields, Status } from './common';

/**
 * Program entity
 */
export interface Program extends AuditFields {
  name: string;
  description: string;
  category?: string;
  code?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  current_enrollment?: number;
  program_type: ProgramType;
  metadata?: Record<string, any>;
}

/**
 * Program types
 */
export type ProgramType = 
  | 'academic'
  | 'sports'
  | 'arts'
  | 'technology'
  | 'language'
  | 'vocational'
  | 'enrichment';

/**
 * Program creation request
 */
export interface CreateProgramRequest {
  name: string;
  description: string;
  category?: string;
  code?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  program_type: ProgramType;
  metadata?: Record<string, any>;
}

/**
 * Program update request
 */
export interface UpdateProgramRequest {
  name?: string;
  description?: string;
  category?: string;
  code?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  program_type?: ProgramType;
  metadata?: Record<string, any>;
}

/**
 * Program search parameters
 */
export interface ProgramSearchParams {
  search?: string;
  category?: string;
  program_type?: ProgramType;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Program statistics
 */
export interface ProgramStats {
  total_programs: number;
  active_programs: number;
  total_students: number;
  total_courses: number;
  programs_by_type: Record<ProgramType, number>;
  enrollment_trends: {
    month: string;
    enrolled: number;
    completed: number;
  }[];
}

/**
 * Program with summary information
 */
export interface ProgramSummary extends Program {
  student_count: number;
  course_count: number;
  facility_count: number;
  staff_count: number;
  recent_activity?: ProgramActivity[];
}

/**
 * Program activity entry
 */
export interface ProgramActivity {
  id: string;
  program_id: string;
  activity_type: 'enrollment' | 'course_created' | 'staff_assigned' | 'facility_booked';
  description: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Program enrollment information
 */
export interface ProgramEnrollment {
  program_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'enrolled' | 'completed' | 'withdrawn' | 'suspended';
  completion_date?: string;
  progress_percentage?: number;
  notes?: string;
}