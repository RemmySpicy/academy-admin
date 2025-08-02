import apiClient from './apiClient';
import { User, AuthState, ApiResponse } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
  confirm_password: string;
  user_type: string;
  parent_email?: string;
  date_of_birth?: string;
  gender?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.data.access_token) {
      await apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  }

  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/auth/register', userData);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server logout fails
      console.warn('Server logout failed:', error);
    } finally {
      await apiClient.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ access_token: string }>('/auth/refresh');
    
    if (response.data.access_token) {
      await apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data.access_token;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return apiClient.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiClient.post('/auth/verify-email', { token });
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/resend-verification', { email });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', userData);
    return response.data;
  }
}

const authService = new AuthService();

export default authService;