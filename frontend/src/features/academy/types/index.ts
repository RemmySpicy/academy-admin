/**
 * Academy Administration Types
 * 
 * Type definitions specific to academy administration features
 */

// Re-export common types used in academy administration
export type {
  Program,
  ProgramCreate,
  ProgramUpdate,
  User,
  UserCreate,
  UserUpdate,
  SearchParams,
  PaginatedResponse,
} from '@/lib/api/types';

// Academy-specific types
export interface AcademyProgramStats {
  total_programs: number;
  active_programs: number;
  total_students: number;
  total_courses: number;
}

export interface AcademyUserStats {
  total_users: number;
  active_users: number;
  users_by_role: Record<string, number>;
}

export interface AcademySystemHealth {
  status: string;
  uptime: number;
  database: string;
  cache: string;
}

export interface AcademySettings {
  [key: string]: any;
}

// Academy filter types
export interface AcademyProgramFilters {
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AcademyUserFilters {
  role?: string;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}