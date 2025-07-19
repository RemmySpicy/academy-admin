/**
 * Program management service for API client
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { 
  Program, 
  ProgramSummary, 
  CreateProgramRequest, 
  UpdateProgramRequest,
  ProgramSearchParams,
  ProgramStats,
  ProgramActivity,
  ProgramEnrollment,
  PaginatedResponse
} from '../../types';

export class ProgramService {
  constructor(private http: HttpClient) {}

  /**
   * Get all programs (access based on user role)
   */
  async getPrograms(params?: ProgramSearchParams): Promise<ApiResponse<PaginatedResponse<Program>>> {
    return this.http.get<PaginatedResponse<Program>>('/programs', {
      params,
      skipProgramContext: true, // Programs are academy-wide
      useCache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }

  /**
   * Get specific program by ID
   */
  async getProgram(programId: string): Promise<ApiResponse<ProgramSummary>> {
    return this.http.get<ProgramSummary>(`/programs/${programId}`, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Create new program (Super Admin only)
   */
  async createProgram(programData: CreateProgramRequest): Promise<ApiResponse<Program>> {
    return this.http.post<Program>('/programs', programData, {
      skipProgramContext: true,
    });
  }

  /**
   * Update existing program
   */
  async updateProgram(programId: string, updates: UpdateProgramRequest): Promise<ApiResponse<Program>> {
    return this.http.put<Program>(`/programs/${programId}`, updates, {
      skipProgramContext: true,
    });
  }

  /**
   * Delete program (Super Admin only)
   */
  async deleteProgram(programId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/programs/${programId}`, {
      skipProgramContext: true,
    });
  }

  /**
   * Get program statistics
   */
  async getProgramStats(programId?: string): Promise<ApiResponse<ProgramStats>> {
    const endpoint = programId ? `/programs/${programId}/stats` : '/programs/stats';
    return this.http.get<ProgramStats>(endpoint, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 15 * 60 * 1000, // 15 minutes
    });
  }

  /**
   * Get programs assigned to current user
   */
  async getMyPrograms(): Promise<ApiResponse<Program[]>> {
    return this.http.get<Program[]>('/programs/my-programs', {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Get program summary with counts and recent activity
   */
  async getProgramSummary(programId: string): Promise<ApiResponse<ProgramSummary>> {
    return this.http.get<ProgramSummary>(`/programs/${programId}/summary`, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  // Program Activity

  /**
   * Get recent activity for program
   */
  async getProgramActivity(
    programId: string,
    params?: {
      activity_type?: string;
      limit?: number;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<ProgramActivity[]>> {
    return this.http.get<ProgramActivity[]>(`/programs/${programId}/activity`, {
      params,
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Log program activity
   */
  async logActivity(
    programId: string,
    activity: {
      activity_type: 'enrollment' | 'course_created' | 'staff_assigned' | 'facility_booked';
      description: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<ProgramActivity>> {
    return this.http.post<ProgramActivity>(`/programs/${programId}/activity`, activity, {
      skipProgramContext: true,
    });
  }

  // Program Enrollment

  /**
   * Get program enrollments
   */
  async getProgramEnrollments(
    programId: string,
    params?: {
      status?: string;
      date_from?: string;
      date_to?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<ProgramEnrollment>>> {
    return this.http.get<PaginatedResponse<ProgramEnrollment>>(`/programs/${programId}/enrollments`, {
      params,
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Enroll student in program
   */
  async enrollStudent(
    programId: string,
    studentId: string,
    enrollmentData?: {
      notes?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<ProgramEnrollment>> {
    return this.http.post<ProgramEnrollment>(`/programs/${programId}/enrollments`, {
      student_id: studentId,
      ...enrollmentData,
    }, {
      skipProgramContext: true,
    });
  }

  /**
   * Update program enrollment
   */
  async updateEnrollment(
    programId: string,
    enrollmentId: string,
    updates: {
      status?: 'enrolled' | 'completed' | 'withdrawn' | 'suspended';
      completion_date?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<ProgramEnrollment>> {
    return this.http.patch<ProgramEnrollment>(`/programs/${programId}/enrollments/${enrollmentId}`, updates, {
      skipProgramContext: true,
    });
  }

  // Program Users/Staff

  /**
   * Get users assigned to program
   */
  async getProgramUsers(
    programId: string,
    params?: {
      role?: string;
      is_active?: boolean;
      page?: number;
      per_page?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    return this.http.get(`/programs/${programId}/users`, {
      params,
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Assign user to program
   */
  async assignUser(
    programId: string,
    userId: string,
    assignmentData?: {
      role?: string;
      permissions?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<any>> {
    return this.http.post(`/programs/${programId}/users`, {
      user_id: userId,
      ...assignmentData,
    }, {
      skipProgramContext: true,
    });
  }

  /**
   * Remove user from program
   */
  async removeUser(programId: string, userId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/programs/${programId}/users/${userId}`, {
      skipProgramContext: true,
    });
  }

  /**
   * Update user assignment in program
   */
  async updateUserAssignment(
    programId: string,
    userId: string,
    updates: {
      role?: string;
      permissions?: string[];
      is_active?: boolean;
    }
  ): Promise<ApiResponse<any>> {
    return this.http.patch(`/programs/${programId}/users/${userId}`, updates, {
      skipProgramContext: true,
    });
  }

  // Program Search and Discovery

  /**
   * Search programs by various criteria
   */
  async searchPrograms(params: {
    query: string;
    filters?: {
      program_type?: string[];
      is_active?: boolean;
      has_capacity?: boolean;
      date_range?: { start: string; end: string };
    };
    sort_by?: 'name' | 'created_at' | 'enrollment_count';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Program>>> {
    return this.http.post<PaginatedResponse<Program>>('/programs/search', params, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get featured/recommended programs
   */
  async getFeaturedPrograms(limit?: number): Promise<ApiResponse<Program[]>> {
    return this.http.get<Program[]>('/programs/featured', {
      params: { limit },
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    });
  }

  /**
   * Get program enrollment trends
   */
  async getEnrollmentTrends(
    programId: string,
    params?: {
      period?: 'daily' | 'weekly' | 'monthly';
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<{
    period: string;
    enrollments: number;
    completions: number;
    withdrawals: number;
  }[]>> {
    return this.http.get(`/programs/${programId}/trends`, {
      params,
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 15 * 60 * 1000,
    });
  }

  /**
   * Get program comparison data
   */
  async comparePrograms(programIds: string[]): Promise<ApiResponse<{
    program_id: string;
    name: string;
    metrics: {
      total_students: number;
      total_courses: number;
      completion_rate: number;
      satisfaction_score?: number;
    };
  }[]>> {
    return this.http.post('/programs/compare', {
      program_ids: programIds,
    }, {
      skipProgramContext: true,
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }
}