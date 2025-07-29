/**
 * Academy Administration API Service
 * 
 * Handles all API operations related to academy-wide administration including
 * programs, users, and system settings management.
 */

import { httpClient, ApiResponse, API_ENDPOINTS } from '@/lib/api/httpClient';
import type { 
  Program, 
  ProgramCreate, 
  ProgramUpdate,
  User,
  UserCreate,
  UserUpdate,
  SearchParams,
  PaginatedResponse 
} from '@/lib/api/types';

/**
 * Academy Programs API Service
 */
export class AcademyProgramsApiService {

  /**
   * Get all programs (academy-wide, no program filtering)
   */
  static async getPrograms(params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<Program>>> {
    const queryParams = new URLSearchParams();
    
    // Add bypass program filter for academy-wide access
    queryParams.append('bypass_program_filter', 'true');
    
    // Add search parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    return httpClient.get<PaginatedResponse<Program>>(
      `${API_ENDPOINTS.programs.list}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a specific program by ID
   */
  static async getProgram(id: string): Promise<ApiResponse<Program>> {
    return httpClient.get<Program>(`${API_ENDPOINTS.programs.byId(id)}?bypass_program_filter=true`);
  }

  /**
   * Get comprehensive statistics for a specific program
   */
  static async getProgramStatistics(id: string): Promise<ApiResponse<{
    program_id: string;
    program_name: string;
    courses: {
      total: number;
      active: number;
      inactive: number;
    };
    students: {
      total: number;
      active: number;
      inactive: number;
    };
    team: {
      total_members: number;
    };
    facilities: {
      total: number;
    };
    configuration: {
      age_groups: number;
      difficulty_levels: number;
      session_types: number;
      default_duration: number;
    };
  }>> {
    return httpClient.get(`${API_ENDPOINTS.programs.statistics(id)}?bypass_program_filter=true`);
  }

  /**
   * Create a new program
   */
  static async createProgram(data: ProgramCreate): Promise<ApiResponse<Program>> {
    return httpClient.post<Program>(API_ENDPOINTS.programs.create, data);
  }

  /**
   * Update an existing program
   */
  static async updateProgram(id: string, data: ProgramUpdate): Promise<ApiResponse<Program>> {
    return httpClient.put<Program>(API_ENDPOINTS.programs.update(id), data);
  }

  /**
   * Delete a program
   */
  static async deleteProgram(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.programs.delete(id));
  }

  /**
   * Get program statistics
   */
  static async getProgramStats(): Promise<ApiResponse<{
    total_programs: number;
    active_programs: number;
    total_students: number;
    total_courses: number;
  }>> {
    return httpClient.get<{
      total_programs: number;
      active_programs: number;
      total_students: number;
      total_courses: number;
    }>(`${API_ENDPOINTS.programs.stats}?bypass_program_filter=true`);
  }

  /**
   * Get program configuration (age groups, difficulty levels, session types)
   */
  static async getProgramConfiguration(id: string): Promise<ApiResponse<{
    age_groups: Array<{id: string; name: string; from_age: number; to_age: number}>;
    difficulty_levels: Array<{id: string; name: string; weight: number}>;
    session_types: Array<{id: string; name: string; capacity: number}>;
    default_session_duration: number;
  }>> {
    return httpClient.get(`${API_ENDPOINTS.programs.configuration(id)}?bypass_program_filter=true`);
  }

  /**
   * Get program age groups
   */
  static async getProgramAgeGroups(id: string): Promise<ApiResponse<Array<{id: string; name: string; from_age: number; to_age: number}>>> {
    return httpClient.get(`${API_ENDPOINTS.programs.ageGroups(id)}?bypass_program_filter=true`);
  }

  /**
   * Get program difficulty levels
   */
  static async getProgramDifficultyLevels(id: string): Promise<ApiResponse<Array<{id: string; name: string; weight: number}>>> {
    return httpClient.get(`${API_ENDPOINTS.programs.difficultyLevels(id)}?bypass_program_filter=true`);
  }

  /**
   * Get program session types
   */
  static async getProgramSessionTypes(id: string): Promise<ApiResponse<Array<{id: string; name: string; capacity: number}>>> {
    return httpClient.get(`${API_ENDPOINTS.programs.sessionTypes(id)}?bypass_program_filter=true`);
  }
}

/**
 * Academy Users API Service
 */
export class AcademyUsersApiService {

  /**
   * Get all users (academy-wide)
   */
  static async getUsers(params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const queryParams = new URLSearchParams();
    
    // Add bypass program filter for academy-wide access
    queryParams.append('bypass_program_filter', 'true');
    
    // Add search parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    return httpClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.users.list}${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a specific user by ID
   */
  static async getUser(id: string): Promise<ApiResponse<User>> {
    return httpClient.get<User>(API_ENDPOINTS.users.byId(id));
  }

  /**
   * Create a new user
   */
  static async createUser(data: UserCreate): Promise<ApiResponse<User>> {
    return httpClient.post<User>(API_ENDPOINTS.users.create, data);
  }

  /**
   * Update an existing user
   */
  static async updateUser(id: string, data: UserUpdate): Promise<ApiResponse<User>> {
    return httpClient.put<User>(API_ENDPOINTS.users.update(id), data);
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.users.delete(id));
  }

  /**
   * Assign user to program
   */
  static async assignUserToProgram(userId: string, programId: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(API_ENDPOINTS.users.assignToProgram(userId), { program_id: programId });
  }

  /**
   * Remove user from program
   */
  static async removeUserFromProgram(userId: string, programId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.users.removeFromProgram(userId, programId));
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
  }>> {
    return httpClient.get<{
      total_users: number;
      active_users: number;
      users_by_role: Record<string, number>;
    }>(API_ENDPOINTS.users.stats);
  }
}

/**
 * Academy System Settings API Service
 */
export class AcademySettingsApiService {

  /**
   * Get system settings
   */
  static async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return httpClient.get<Record<string, any>>(API_ENDPOINTS.settings.get);
  }

  /**
   * Update system settings
   */
  static async updateSettings(settings: Record<string, any>): Promise<ApiResponse<Record<string, any>>> {
    return httpClient.put<Record<string, any>>(API_ENDPOINTS.settings.update, settings);
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<ApiResponse<{
    status: string;
    uptime: number;
    database: string;
    cache: string;
  }>> {
    return httpClient.get<{
      status: string;
      uptime: number;
      database: string;
      cache: string;
    }>(API_ENDPOINTS.system.health);
  }
}

// Export convenience instances
export const academyProgramsApi = AcademyProgramsApiService;
export const academyUsersApi = AcademyUsersApiService;
export const academySettingsApi = AcademySettingsApiService;

// Program configuration types
export interface ProgramAgeGroup {
  id: string;
  name: string;
  from_age: number;
  to_age: number;
}

export interface ProgramDifficultyLevel {
  id: string;
  name: string;
  weight: number;
}

export interface ProgramSessionType {
  id: string;
  name: string;
  capacity: number;
}

export interface ProgramConfiguration {
  age_groups: ProgramAgeGroup[];
  difficulty_levels: ProgramDifficultyLevel[];
  session_types: ProgramSessionType[];
  default_session_duration: number;
}