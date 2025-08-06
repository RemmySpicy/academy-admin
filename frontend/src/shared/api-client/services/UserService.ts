/**
 * User management service for API client
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { API_ENDPOINTS } from '../constants';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  UpdateProfileRequest,
  UserSearchParams,
  UserStats,
  UserActivity,
  UserSession,
  TeamMember,
  RolePermissions,
  PaginatedResponse
} from '../../types';

export class UserService {
  constructor(private http: HttpClient) {}

  /**
   * Get all users (Super Admin only)
   */
  async getUsers(params?: UserSearchParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.http.get<PaginatedResponse<User>>('/users', {
      params,
      skipProgramContext: true, // User management is academy-wide
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get specific user by ID
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.http.get<User>(`/users/${userId}`, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Create new user (Admin roles only)
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.http.post<User>('/users', userData, {
      skipProgramContext: true,
    });
  }

  /**
   * Update existing user (Admin roles only)
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.http.put<User>(`/users/${userId}`, updates, {
      skipProgramContext: true,
    });
  }

  /**
   * Delete user (Super Admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/users/${userId}`, {
      skipProgramContext: true,
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.http.get<UserStats>(API_ENDPOINTS.USERS.STATS, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Update user profile (self-service)
   */
  async updateProfile(updates: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return this.http.patch<User>('/users/profile', updates, {
      skipProgramContext: true,
    });
  }

  // Program Assignments

  /**
   * Get user's program assignments
   */
  async getUserPrograms(userId: string): Promise<ApiResponse<any[]>> {
    return this.http.get(`/users/${userId}/programs`, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Assign user to program
   */
  async assignUserToProgram(
    userId: string,
    programId: string,
    assignmentData?: {
      role?: string;
      permissions?: string[];
    }
  ): Promise<ApiResponse<any>> {
    return this.http.post(`/users/${userId}/programs`, {
      program_id: programId,
      ...assignmentData,
    }, {
      skipProgramContext: true,
    });
  }

  /**
   * Remove user from program
   */
  async removeUserFromProgram(userId: string, programId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/users/${userId}/programs/${programId}`, {
      skipProgramContext: true,
    });
  }

  /**
   * Update user's program assignment
   */
  async updateProgramAssignment(
    userId: string,
    programId: string,
    updates: {
      role?: string;
      permissions?: string[];
      is_active?: boolean;
    }
  ): Promise<ApiResponse<any>> {
    return this.http.patch(`/users/${userId}/programs/${programId}`, updates, {
      skipProgramContext: true,
    });
  }

  // Team Management (for tutor apps)

  /**
   * Get team members for current program
   */
  async getTeamMembers(): Promise<ApiResponse<TeamMember[]>> {
    return this.http.get<TeamMember[]>('/users/team', {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get team member details
   */
  async getTeamMember(userId: string): Promise<ApiResponse<TeamMember>> {
    return this.http.get<TeamMember>(`/users/team/${userId}`, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Update team member contact info
   */
  async updateTeamMemberContact(
    userId: string,
    contactInfo: {
      phone?: string;
      email?: string;
      preferred_contact_method?: 'email' | 'phone' | 'app';
    }
  ): Promise<ApiResponse<TeamMember>> {
    return this.http.patch<TeamMember>(`/users/team/${userId}/contact`, contactInfo);
  }

  // User Activity and Sessions

  /**
   * Get user activity log
   */
  async getUserActivity(
    userId: string,
    params?: {
      action?: string;
      date_from?: string;
      date_to?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<UserActivity>>> {
    return this.http.get<PaginatedResponse<UserActivity>>(`/users/${userId}/activity`, {
      params,
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<ApiResponse<UserSession[]>> {
    return this.http.get<UserSession[]>(`/users/${userId}/sessions`, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 1 * 60 * 1000,
    });
  }

  /**
   * Revoke user session
   */
  async revokeUserSession(userId: string, sessionId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/users/${userId}/sessions/${sessionId}`, {
      skipProgramContext: true,
    });
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllUserSessions(userId: string): Promise<ApiResponse<void>> {
    return this.http.post<void>(`/users/${userId}/sessions/revoke-all`, {}, {
      skipProgramContext: true,
    });
  }

  // Role and Permissions

  /**
   * Get role permissions matrix
   */
  async getRolePermissions(role?: string): Promise<ApiResponse<RolePermissions[]>> {
    return this.http.get<RolePermissions[]>('/users/roles/permissions', {
      params: { role },
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    });
  }

  /**
   * Check user permissions
   */
  async checkUserPermissions(
    userId: string,
    permissions: string[]
  ): Promise<ApiResponse<{ [permission: string]: boolean }>> {
    return this.http.post(`/users/${userId}/permissions/check`, {
      permissions,
    }, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  // User Search and Management

  /**
   * Search users by various criteria
   */
  async searchUsers(params: {
    query: string;
    filters?: {
      role?: string[];
      is_active?: boolean;
      program_id?: string;
      last_login_range?: { start: string; end: string };
    };
    sort_by?: 'name' | 'created_at' | 'last_login';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.http.post<PaginatedResponse<User>>('/users/search', params, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Get recently active users
   */
  async getRecentlyActiveUsers(limit?: number): Promise<ApiResponse<User[]>> {
    return this.http.get<User[]>('/users/recent-activity', {
      params: { limit },
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: {
      is_active?: boolean;
      role?: string;
      program_assignments?: string[];
    }
  ): Promise<ApiResponse<{ updated: number; failed: number }>> {
    return this.http.post('/users/bulk-update', {
      user_ids: userIds,
      updates,
    }, {
      skipProgramContext: true,
    });
  }

  /**
   * Export users data
   */
  async exportUsers(params?: {
    format: 'csv' | 'excel' | 'pdf';
    filters?: UserSearchParams;
    fields?: string[];
  }): Promise<ApiResponse<{ download_url: string }>> {
    return this.http.post<{ download_url: string }>('/users/export', params, {
      skipProgramContext: true,
    });
  }

  // Password Management

  /**
   * Reset user password (Admin only)
   */
  async resetUserPassword(userId: string): Promise<ApiResponse<{ temporary_password: string }>> {
    return this.http.post<{ temporary_password: string }>(`/users/${userId}/reset-password`, {}, {
      skipProgramContext: true,
    });
  }

  /**
   * Force password change for user
   */
  async forcePasswordChange(userId: string): Promise<ApiResponse<void>> {
    return this.http.post<void>(`/users/${userId}/force-password-change`, {}, {
      skipProgramContext: true,
    });
  }

  /**
   * Unlock user account
   */
  async unlockUser(userId: string): Promise<ApiResponse<void>> {
    return this.http.post<void>(`/users/${userId}/unlock`, {}, {
      skipProgramContext: true,
    });
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string, reason?: string): Promise<ApiResponse<void>> {
    return this.http.post<void>(`/users/${userId}/deactivate`, {
      reason,
    }, {
      skipProgramContext: true,
    });
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<ApiResponse<void>> {
    return this.http.post<void>(`/users/${userId}/reactivate`, {}, {
      skipProgramContext: true,
    });
  }
}