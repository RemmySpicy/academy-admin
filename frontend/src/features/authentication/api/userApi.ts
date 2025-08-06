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
  first_name: string;
  last_name: string;
  phone?: string;
  profile_type: 'full_user' | 'profile_only';
  roles: string[];
  primary_role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  roles: string[];
  is_active: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  roles?: string[];
  is_active?: boolean;
}

export interface UserSearchParams {
  search?: string;
  roles?: string[];
  is_active?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  bypass_program_filter?: boolean;
}

export interface UserListResponse {
  items: RealUser[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export class UserApi {

  /**
   * Get all users with search and filtering (admin only)
   */
  static async getUsers(params?: UserSearchParams): Promise<ApiResponse<UserListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.roles?.length) {
      params.roles.forEach(role => queryParams.append('roles', role));
    }
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params?.bypass_program_filter) queryParams.append('bypass_program_filter', params.bypass_program_filter.toString());
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.users.list}?${queryParams.toString()}`
      : API_ENDPOINTS.users.list;
      
    return httpClient.get<UserListResponse>(url);
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<ApiResponse<RealUser>> {
    return httpClient.get<RealUser>(API_ENDPOINTS.users.get(userId));
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: UserCreate): Promise<ApiResponse<RealUser>> {
    return httpClient.post<RealUser>(API_ENDPOINTS.users.create, userData);
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, userData: UserUpdate): Promise<ApiResponse<RealUser>> {
    return httpClient.put<RealUser>(API_ENDPOINTS.users.update(userId), userData);
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.users.delete(userId));
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
    return this.updateUser(userId, { roles: [role] });
  }

  /**
   * Search users for team assignment (filters for assignable roles)
   */
  static async searchUsersForTeamAssignment(query: string): Promise<ApiResponse<UserListResponse>> {
    const assignableRoles = ['program_admin', 'program_coordinator', 'instructor'];
    return this.getUsers({
      search: query,
      roles: assignableRoles,
      is_active: true,
      per_page: 20
    });
  }
}

// Helper functions for common operations
export const userApi = {
  // Get all users
  getAll: async (params?: UserSearchParams) => {
    const response = await UserApi.getUsers(params);
    return response;
  },

  // Search users for team assignment
  searchForTeamAssignment: async (query: string) => {
    const response = await UserApi.searchUsersForTeamAssignment(query);
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