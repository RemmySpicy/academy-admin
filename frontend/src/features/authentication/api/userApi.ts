/**
 * User management API service
 */

import { httpClient, ApiResponse } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';

// Types for user management
export interface RealUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface UserListResponse {
  users: RealUser[];
  total: number;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export class UserApi {

  /**
   * Get all users (admin only)
   */
  static async getUsers(): Promise<ApiResponse<RealUser[]>> {
    return httpClient.get<RealUser[]>(API_ENDPOINTS.auth.users);
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<ApiResponse<RealUser>> {
    return httpClient.get<RealUser>(API_ENDPOINTS.auth.getUser(userId));
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: UserCreate): Promise<ApiResponse<RealUser>> {
    return httpClient.post<RealUser>(API_ENDPOINTS.auth.createUser, userData);
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, userData: UserUpdate): Promise<ApiResponse<RealUser>> {
    return httpClient.put<RealUser>(API_ENDPOINTS.auth.updateUser(userId), userData);
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.auth.deleteUser(userId));
  }

  /**
   * Change password
   */
  static async changePassword(passwordData: PasswordChangeRequest): Promise<ApiResponse<{ detail: string }>> {
    return httpClient.post<{ detail: string }>(API_ENDPOINTS.auth.changePassword, passwordData);
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<RealUser>> {
    return this.updateUser(userId, { is_active: isActive });
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId: string, role: string): Promise<ApiResponse<RealUser>> {
    return this.updateUser(userId, { role });
  }
}

// Helper functions for common operations
export const userApi = {
  // Get all users
  getAll: async () => {
    const response = await UserApi.getUsers();
    return response;
  },

  // Get user by ID
  getById: async (userId: string) => {
    const response = await UserApi.getUser(userId);
    return response;
  },

  // Create user
  create: async (userData: UserCreate) => {
    const response = await UserApi.createUser(userData);
    return response;
  },

  // Update user
  update: async (userId: string, userData: UserUpdate) => {
    const response = await UserApi.updateUser(userId, userData);
    return response;
  },

  // Delete user
  delete: async (userId: string) => {
    const response = await UserApi.deleteUser(userId);
    return response;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await UserApi.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response;
  },

  // Toggle user status
  toggleStatus: async (userId: string, isActive: boolean) => {
    const response = await UserApi.toggleUserStatus(userId, isActive);
    return response;
  },

  // Update user role
  updateRole: async (userId: string, role: string) => {
    const response = await UserApi.updateUserRole(userId, role);
    return response;
  },
};

export default UserApi;