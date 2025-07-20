import { httpClient } from '@/lib/httpClient';
import { ApiResponse } from '@/lib/api';

// Types
export interface TeamMember {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  primary_role: string;
  is_active: boolean;
  phone?: string;
  profile_photo_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  program_id: string;
  program_name?: string;
  is_default_program: boolean;
  assigned_at: string;
  assigned_by?: string;
}

export interface AvailableUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  primary_role: string;
  is_active: boolean;
  phone?: string;
  profile_photo_url?: string;
  already_assigned: boolean;
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  by_role: Record<string, number>;
  recent_additions: TeamMember[];
}

export interface TeamMemberListResponse {
  items: TeamMember[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AvailableUserListResponse {
  items: AvailableUser[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AddTeamMemberRequest {
  user_id: string;
  role: string;
  is_default_program?: boolean;
}

export interface UpdateTeamMemberRequest {
  role?: string;
  is_default_program?: boolean;
}

export interface TeamSearchParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AvailableUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

class TeamApi {
  private readonly basePath = '/teams';

  /**
   * Get team members for the current program
   */
  async getTeamMembers(params?: TeamSearchParams): Promise<ApiResponse<TeamMemberListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

    const url = `${this.basePath}/members${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return httpClient.get<TeamMemberListResponse>(url);
  }

  /**
   * Add a new team member to the program
   */
  async addTeamMember(request: AddTeamMemberRequest): Promise<ApiResponse<TeamMember>> {
    return httpClient.post<TeamMember>(`${this.basePath}/members`, request);
  }

  /**
   * Update a team member's role or settings
   */
  async updateTeamMember(userId: string, request: UpdateTeamMemberRequest): Promise<ApiResponse<TeamMember>> {
    return httpClient.put<TeamMember>(`${this.basePath}/members/${userId}`, request);
  }

  /**
   * Remove a team member from the program
   */
  async removeTeamMember(userId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.basePath}/members/${userId}`);
  }

  /**
   * Get users available to be added to the team
   */
  async getAvailableUsers(params?: AvailableUsersParams): Promise<ApiResponse<AvailableUserListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.search) searchParams.append('search', params.search);

    const url = `${this.basePath}/available-users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return httpClient.get<AvailableUserListResponse>(url);
  }

  /**
   * Get team statistics for the current program
   */
  async getTeamStats(): Promise<ApiResponse<TeamStats>> {
    return httpClient.get<TeamStats>(`${this.basePath}/stats`);
  }
}

export const teamApi = new TeamApi();