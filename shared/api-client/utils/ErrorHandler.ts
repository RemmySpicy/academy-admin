/**
 * Error handling utility for API requests
 */

import { ApiError, ApiResponse, ApiClientConfig } from '../core/types';

export class ErrorHandler {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * Handle API errors and convert to standardized response
   */
  handleError<T = any>(error: ApiError): ApiResponse<T> {
    const standardizedError = this.standardizeError(error);
    
    if (this.config.enableLogging) {
      this.logError(standardizedError);
    }

    return {
      data: null as any,
      success: false,
      message: standardizedError.message,
      errors: [standardizedError.message],
      meta: {
        timestamp: standardizedError.timestamp,
        request_id: this.generateErrorId(),
      },
    };
  }

  /**
   * Standardize error format
   */
  private standardizeError(error: ApiError | Error | any): ApiError {
    // If it's already a standardized API error
    if (this.isApiError(error)) {
      return error;
    }

    // If it's a network/fetch error
    if (error instanceof TypeError || error.name === 'TypeError') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        status: 0,
        timestamp: new Date().toISOString(),
        path: '',
        details: error.message,
      };
    }

    // If it's a timeout error
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out. Please try again.',
        status: 408,
        timestamp: new Date().toISOString(),
        path: '',
        details: error.message,
      };
    }

    // Generic error fallback
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500,
      timestamp: new Date().toISOString(),
      path: error.path || '',
      details: error,
    };
  }

  /**
   * Check if error is already an API error
   */
  private isApiError(error: any): error is ApiError {
    return error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error &&
      'status' in error;
  }

  /**
   * Log error details
   */
  private logError(error: ApiError): void {
    const errorLevel = this.getErrorLevel(error.status);
    
    const errorInfo = {
      level: errorLevel,
      code: error.code,
      message: error.message,
      status: error.status,
      path: error.path,
      timestamp: error.timestamp,
      details: error.details,
    };

    switch (errorLevel) {
      case 'critical':
        console.error('[CRITICAL ERROR]', errorInfo);
        break;
      case 'error':
        console.error('[ERROR]', errorInfo);
        break;
      case 'warning':
        console.warn('[WARNING]', errorInfo);
        break;
      case 'info':
        console.info('[INFO]', errorInfo);
        break;
    }
  }

  /**
   * Determine error level based on status code
   */
  private getErrorLevel(status: number): 'critical' | 'error' | 'warning' | 'info' {
    if (status >= 500) {
      return 'critical';
    } else if (status >= 400) {
      return 'error';
    } else if (status >= 300) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: ApiError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      
      case 'TIMEOUT_ERROR':
        return 'The request is taking too long. Please try again.';
      
      case 'AUTHENTICATION_ERROR':
        return 'Your session has expired. Please log in again.';
      
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action.';
      
      case 'VALIDATION_ERROR':
        return error.message || 'Please check your input and try again.';
      
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      
      case 'CONFLICT':
        return 'This action conflicts with existing data. Please refresh and try again.';
      
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      
      case 'SERVER_ERROR':
        return 'A server error occurred. Please try again later.';
      
      case 'PROGRAM_CONTEXT_ERROR':
        return 'Unable to access data for the selected program. Please switch programs or contact support.';
      
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: ApiError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR',
      'RATE_LIMIT_EXCEEDED',
    ];
    
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return retryableCodes.includes(error.code) || 
           retryableStatuses.includes(error.status);
  }

  /**
   * Get retry delay for retryable errors
   */
  static getRetryDelay(error: ApiError, attempt: number): number {
    // Base delay with exponential backoff
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    let delay = baseDelay * Math.pow(2, attempt - 1);
    
    // Add jitter to prevent thundering herd
    delay += Math.random() * 1000;
    
    // Special handling for rate limiting
    if (error.status === 429) {
      delay = Math.max(delay, 5000); // Minimum 5 seconds for rate limiting
    }
    
    return Math.min(delay, maxDelay);
  }

  /**
   * Extract validation errors from API response
   */
  static extractValidationErrors(error: ApiError): Record<string, string[]> {
    if (error.code === 'VALIDATION_ERROR' && error.details) {
      // Try to extract field-specific validation errors
      if (Array.isArray(error.details)) {
        const fieldErrors: Record<string, string[]> = {};
        
        error.details.forEach((detail: any) => {
          if (detail.field && detail.message) {
            if (!fieldErrors[detail.field]) {
              fieldErrors[detail.field] = [];
            }
            fieldErrors[detail.field].push(detail.message);
          }
        });
        
        return fieldErrors;
      }
    }
    
    return {};
  }
}