/**
 * Core HTTP client with authentication and program context
 */

import { ApiClientConfig, RequestConfig, ApiResponse, ApiError, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './types';
import { TokenManager } from '../utils/TokenManager';
import { CacheManager } from '../utils/CacheManager';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ProgramContextManager } from '../utils/ProgramContextManager';

export class HttpClient {
  private config: Required<ApiClientConfig>;
  private tokenManager: TokenManager;
  private cacheManager: CacheManager;
  private errorHandler: ErrorHandler;
  private programContextManager: ProgramContextManager;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      enableOfflineCache: false,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableLogging: false,
      apiVersion: 'v1',
      headers: {},
      ...config,
    };

    this.tokenManager = new TokenManager();
    this.cacheManager = new CacheManager(this.config.enableOfflineCache);
    this.errorHandler = new ErrorHandler(this.config);
    this.programContextManager = new ProgramContextManager();

    this.setupDefaultInterceptors();
  }

  /**
   * Make HTTP request with full feature support
   */
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    const requestConfig = await this.prepareRequest(config);
    
    // Check cache first (GET requests only)
    if (config.method === 'GET' && config.useCache && this.cacheManager.isEnabled()) {
      const cached = await this.cacheManager.get<T>(fullUrl);
      if (cached) {
        this.log('Cache hit:', fullUrl);
        return {
          data: cached,
          success: true,
          meta: {
            timestamp: new Date().toISOString(),
            request_id: this.generateRequestId(),
          },
        };
      }
    }

    try {
      const response = await this.performRequest<T>(fullUrl, requestConfig);
      
      // Cache successful GET responses
      if (config.method === 'GET' && config.useCache && response.success) {
        await this.cacheManager.set(fullUrl, response.data, config.cacheTTL);
      }

      return response;
    } catch (error) {
      return this.handleError(error as ApiError, fullUrl, requestConfig);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET', useCache: true });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', data });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string, refreshToken?: string): void {
    this.tokenManager.setTokens(token, refreshToken);
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.tokenManager.clearTokens();
    this.programContextManager.clearContext();
  }

  /**
   * Set program context
   */
  setProgramContext(programId: string, programName?: string): void {
    this.programContextManager.setContext(programId, programName);
  }

  /**
   * Clear program context
   */
  clearProgramContext(): void {
    this.programContextManager.clearContext();
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Build full URL
   */
  private buildUrl(path: string): string {
    const baseUrl = this.config.baseURL.replace(/\/+$/, '');
    const apiPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}/api/${this.config.apiVersion}${apiPath}`;
  }

  /**
   * Prepare request configuration
   */
  private async prepareRequest(config: RequestConfig): Promise<RequestConfig> {
    let requestConfig = { ...config };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    return requestConfig;
  }

  /**
   * Perform the actual HTTP request
   */
  private async performRequest<T>(url: string, config: RequestConfig): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...config.headers,
    };

    // Add authentication header
    if (!config.skipAuth) {
      const token = await this.tokenManager.getValidToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add program context header
    if (!config.skipProgramContext) {
      const programContext = this.programContextManager.getContext();
      if (programContext) {
        headers['X-Program-Context'] = programContext.programId;
      }
    }

    const requestOptions: RequestInit = {
      method: config.method || 'GET',
      headers,
      signal: AbortSignal.timeout(config.timeout || this.config.timeout),
    };

    // Add body for non-GET requests
    if (config.data && config.method !== 'GET') {
      requestOptions.body = JSON.stringify(config.data);
    }

    // Add query parameters for GET requests
    if (config.params && config.method === 'GET') {
      const searchParams = new URLSearchParams();
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    this.log('Request:', config.method, url);

    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    if (!response.ok) {
      throw {
        code: responseData.code || 'HTTP_ERROR',
        message: responseData.message || response.statusText,
        status: response.status,
        details: responseData.details,
        timestamp: new Date().toISOString(),
        path: url,
      } as ApiError;
    }

    const apiResponse: ApiResponse<T> = {
      data: responseData.data || responseData,
      success: true,
      message: responseData.message,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: this.generateRequestId(),
        ...responseData.meta,
      },
    };

    // Apply response interceptors
    let finalResponse = apiResponse;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }

    return finalResponse;
  }

  /**
   * Handle request errors
   */
  private async handleError<T>(error: ApiError, url: string, config: RequestConfig): Promise<ApiResponse<T>> {
    this.log('Error:', error.message, url);

    // Apply error interceptors
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }

    // Handle authentication errors
    if (processedError.status === 401 && !config.skipAuth) {
      const refreshed = await this.tokenManager.refreshToken();
      if (refreshed) {
        // Retry the request with new token
        return this.request(url.replace(this.config.baseURL, ''), config);
      }
    }

    // Handle retry logic
    if (config.retryOnFailure && this.config.enableRetry) {
      // Implementation would depend on retry tracking
      // For now, we'll use the error handler
    }

    return this.errorHandler.handleError(processedError);
  }

  /**
   * Setup default interceptors
   */
  private setupDefaultInterceptors(): void {
    // Default request interceptor for logging
    this.addRequestInterceptor(async (config) => {
      if (this.config.enableLogging) {
        console.log('API Request:', config);
      }
      return config;
    });

    // Default response interceptor for logging
    this.addResponseInterceptor(async (response) => {
      if (this.config.enableLogging) {
        console.log('API Response:', response);
      }
      return response;
    });

    // Default error interceptor for logging
    this.addErrorInterceptor(async (error) => {
      if (this.config.enableLogging) {
        console.error('API Error:', error);
      }
      return error;
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log messages if logging is enabled
   */
  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[HttpClient]', ...args);
    }
  }
}