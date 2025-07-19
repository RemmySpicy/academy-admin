/**
 * Core API client types and interfaces
 */

import { UserRole } from '../../types';

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  role?: UserRole;
  timeout?: number;
  enableOfflineCache?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  apiVersion?: string;
  headers?: Record<string, string>;
}

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  skipAuth?: boolean;
  skipProgramContext?: boolean;
  useCache?: boolean;
  cacheTTL?: number;
  retryOnFailure?: boolean;
}

/**
 * Standardized API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
    timestamp: string;
    request_id: string;
  };
}

/**
 * Error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status: number;
  timestamp: string;
  path: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  programContext: string | null;
  expiresAt: number | null;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

/**
 * Request interceptor function
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor = (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

/**
 * Program context information
 */
export interface ProgramContext {
  programId: string;
  programName: string;
  userRole: UserRole;
  permissions: string[];
}

/**
 * Offline queue entry
 */
export interface OfflineQueueEntry {
  id: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Network status
 */
export interface NetworkStatus {
  isOnline: boolean;
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  effectiveType?: '2g' | '3g' | '4g' | '5g';
}