import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ApiError } from '../types';

const TOKEN_KEY = 'academy_auth_token';
const PROGRAM_KEY = 'academy_current_program';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token and program context
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(TOKEN_KEY);
          const programId = await AsyncStorage.getItem(PROGRAM_KEY);

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          if (programId) {
            config.headers['X-Program-Context'] = programId;
          }
        } catch (error) {
          console.warn('Failed to get stored auth data:', error);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearAuthData();
          // You might want to trigger a logout event here
        }

        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status || 0,
          details: error.response?.data,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Auth data management
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, PROGRAM_KEY]);
  }

  async setProgramContext(programId: string): Promise<void> {
    await AsyncStorage.setItem(PROGRAM_KEY, programId);
  }

  async getProgramContext(): Promise<string | null> {
    return AsyncStorage.getItem(PROGRAM_KEY);
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Utility methods
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;