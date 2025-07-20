/**
 * Common types used across all applications
 */

/**
 * API Response wrapper for paginated results
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

/**
 * Standard API error response
 */
export interface ApiError {
  detail: string;
  error_code?: string;
  field_errors?: Record<string, string[]>;
}

/**
 * Base audit fields present on all models
 */
export interface AuditFields {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * HTTP methods for API requests
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  programContext?: string;
  bypassProgramFilter?: boolean;
}

/**
 * Program context for data filtering
 */
export interface ProgramContext {
  programId: string;
  programName: string;
  userRole: UserRole;
}

/**
 * User roles in the system
 */
export type UserRole = 
  | 'super_admin'
  | 'program_admin' 
  | 'program_coordinator'
  | 'instructor'
  | 'student'
  | 'parent';

/**
 * Status types used across different entities
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Loading states for UI components
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort order for data queries
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Date range filter
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Search and filter parameters for API queries
 */
export interface SearchParams {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: SortOrder;
  filters?: Record<string, any>;
  date_range?: DateRange;
}