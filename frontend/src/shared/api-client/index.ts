/**
 * Shared API Client Library
 * Unified API client for Academy Admin ecosystem
 */

// Core client and configuration
export { ApiClient } from './core/ApiClient';
export { HttpClient } from './core/HttpClient';
export type { ApiClientConfig, RequestConfig, ApiResponse } from './core/types';

// Service modules
export { AuthService } from './services/AuthService';
export { ProgramService } from './services/ProgramService';
export { UserService } from './services/UserService';
export { CourseService } from './services/CourseService';
export { StudentService } from './services/StudentService';
export { FacilityService } from './services/FacilityService';
export { CommunicationService } from './services/CommunicationService';

// Utilities
export { TokenManager } from './utils/TokenManager';
export { CacheManager } from './utils/CacheManager';
export { ErrorHandler } from './utils/ErrorHandler';
export { ProgramContextManager } from './utils/ProgramContextManager';

// Constants and helpers
export * from './constants';
export * from './utils/helpers';