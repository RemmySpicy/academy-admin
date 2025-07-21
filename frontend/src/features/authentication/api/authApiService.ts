/**
 * Real authentication API service
 */

import { httpClient, ApiResponse } from '@/lib/api/httpClient';
import { AUTH_STORAGE_KEY, API_ENDPOINTS } from '@/lib/constants';

// Types for authentication
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    last_login?: string;
    created_at: string;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

// Token storage keys
const TOKEN_KEY = AUTH_STORAGE_KEY;
const USER_KEY = 'academy_user';

export class AuthApiService {

  /**
   * Login with username and password
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Set up the API client without token for login
    const response = await httpClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );

    // If login successful, store token and user data
    if (response.success) {
      const { access_token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Store in cookies for middleware access
      document.cookie = `${TOKEN_KEY}=${access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      
      // Set token for future requests
      httpClient.setToken(access_token);
    }

    return response;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<{ detail: string }>> {
    const response = await httpClient.post<{ detail: string }>(API_ENDPOINTS.auth.logout);
    
    // Clear local storage and cookies regardless of API response
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    httpClient.setToken(null);

    return response;
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpClient.get<User>(API_ENDPOINTS.auth.me);
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    return httpClient.post<User>(API_ENDPOINTS.auth.createUser, userData);
  }

  /**
   * Update user information
   */
  static async updateUser(userId: string, userData: UserUpdate): Promise<ApiResponse<User>> {
    return httpClient.put<User>(API_ENDPOINTS.auth.updateUser(userId), userData);
  }

  /**
   * Change password
   */
  static async changePassword(passwordData: PasswordChangeRequest): Promise<ApiResponse<{ detail: string }>> {
    return httpClient.post<{ detail: string }>(API_ENDPOINTS.auth.changePassword, passwordData);
  }

  /**
   * Initialize authentication from stored token
   */
  static initializeAuth(): User | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (!token || !userStr) {
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Check if token is expired (simple check)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          this.clearAuth();
          return null;
        }
      } catch {
        // If token parsing fails, clear auth
        this.clearAuth();
        return null;
      }

      // Set token for API client
      httpClient.setToken(token);
      
      // Ensure cookie is set (in case it was cleared)
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      
      return user;
    } catch {
      this.clearAuth();
      return null;
    }
  }

  /**
   * Clear authentication data
   */
  static clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    httpClient.setToken(null);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (!token || !userStr) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        this.clearAuth();
        return false;
      }
      
      return true;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get stored token
   */
  static getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}

// Helper functions for common operations
export const authApiService = {
  // Login
  login: async (username: string, password: string) => {
    const response = await AuthApiService.login({ username, password });
    return response;
  },

  // Logout
  logout: async () => {
    const response = await AuthApiService.logout();
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await AuthApiService.getCurrentUser();
    return response;
  },

  // Initialize auth from storage
  initializeAuth: () => {
    return AuthApiService.initializeAuth();
  },

  // Check authentication status
  isAuthenticated: () => {
    return AuthApiService.isAuthenticated();
  },

  // Get stored user
  getStoredUser: () => {
    return AuthApiService.getStoredUser();
  },

  // Clear auth
  clearAuth: () => {
    AuthApiService.clearAuth();
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await AuthApiService.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response;
  },

  // Create user (admin only)
  createUser: async (userData: UserCreate) => {
    const response = await AuthApiService.createUser(userData);
    return response;
  },

  // Update user
  updateUser: async (userId: string, userData: UserUpdate) => {
    const response = await AuthApiService.updateUser(userId, userData);
    return response;
  },
};

export default AuthApiService;