/**
 * Authentication service for API client
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { LoginRequest, UserInfo, AuthResponse } from '../../types';

export class AuthService {
  constructor(private http: HttpClient) {}

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const loginData: LoginRequest = { username, password };
    
    return this.http.post<AuthResponse>('/auth/login/json', loginData, {
      skipAuth: true,
      skipProgramContext: true,
    });
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.http.post<void>('/auth/logout', {}, {
      skipProgramContext: true,
    });
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return this.http.get<UserInfo>('/auth/me', {
      skipProgramContext: true,
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.http.post<AuthResponse>('/auth/refresh', 
      { refresh_token: refreshToken },
      {
        skipAuth: true,
        skipProgramContext: true,
      }
    );
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.http.post<void>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }, {
      skipProgramContext: true,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return this.http.post<void>('/auth/password-reset', 
      { email },
      {
        skipAuth: true,
        skipProgramContext: true,
      }
    );
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.http.post<void>('/auth/password-reset/confirm', 
      { 
        token,
        new_password: newPassword,
      },
      {
        skipAuth: true,
        skipProgramContext: true,
      }
    );
  }

  /**
   * Verify authentication token
   */
  async verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return this.http.get<{ valid: boolean }>('/auth/verify', {
      skipProgramContext: true,
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    full_name?: string;
    email?: string;
  }): Promise<ApiResponse<UserInfo>> {
    return this.http.patch<UserInfo>('/auth/profile', updates, {
      skipProgramContext: true,
    });
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<ApiResponse<any[]>> {
    return this.http.get<any[]>('/auth/sessions', {
      skipProgramContext: true,
    });
  }

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/auth/sessions/${sessionId}`, {
      skipProgramContext: true,
    });
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(): Promise<ApiResponse<void>> {
    return this.http.post<void>('/auth/sessions/revoke-all', {}, {
      skipProgramContext: true,
    });
  }
}