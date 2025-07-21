/**
 * Student API service functions
 */

import { httpClient, ApiResponse } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  Student,
  StudentCreate,
  StudentUpdate,
  StudentListResponse,
  StudentStats,
  StudentSearchParams,
  StudentBulkAction,
  StudentBulkActionResponse,
} from '../types';

export class StudentApi {

  /**
   * Get paginated list of students
   */
  static async getStudents(
    page: number = 1,
    per_page: number = 20,
    searchParams?: StudentSearchParams
  ): Promise<ApiResponse<StudentListResponse>> {
    const params = {
      page,
      per_page,
      ...searchParams,
    };

    return httpClient.get<StudentListResponse>(API_ENDPOINTS.students.list, params);
  }

  /**
   * Get student by ID
   */
  static async getStudent(id: string): Promise<ApiResponse<Student>> {
    return httpClient.get<Student>(API_ENDPOINTS.students.get(id));
  }

  /**
   * Get student by student ID (STU-YYYY-NNNN)
   */
  static async getStudentByStudentId(studentId: string): Promise<ApiResponse<Student>> {
    return httpClient.get<Student>(`${API_ENDPOINTS.students.list}/by-student-id/${studentId}`);
  }

  /**
   * Create new student
   */
  static async createStudent(studentData: StudentCreate): Promise<ApiResponse<Student>> {
    return httpClient.post<Student>(API_ENDPOINTS.students.create, studentData);
  }

  /**
   * Update student
   */
  static async updateStudent(id: string, studentData: StudentUpdate): Promise<ApiResponse<Student>> {
    return httpClient.put<Student>(API_ENDPOINTS.students.update(id), studentData);
  }

  /**
   * Delete student
   */
  static async deleteStudent(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.students.delete(id));
  }

  /**
   * Get student statistics
   */
  static async getStudentStats(): Promise<ApiResponse<StudentStats>> {
    return httpClient.get<StudentStats>(API_ENDPOINTS.students.stats);
  }

  /**
   * Perform bulk action on students
   */
  static async bulkAction(actionData: StudentBulkAction): Promise<ApiResponse<StudentBulkActionResponse>> {
    return httpClient.post<StudentBulkActionResponse>(`${API_ENDPOINTS.students.list}/bulk-action`, actionData);
  }

  /**
   * Search students
   */
  static async searchStudents(
    query: string,
    page: number = 1,
    per_page: number = 20
  ): Promise<ApiResponse<StudentListResponse>> {
    const params = {
      page,
      per_page,
      search: query,
    };

    return httpClient.get<StudentListResponse>(API_ENDPOINTS.students.list, params);
  }

  /**
   * Get students by status
   */
  static async getStudentsByStatus(
    status: string,
    page: number = 1,
    per_page: number = 20
  ): Promise<ApiResponse<StudentListResponse>> {
    const params = {
      page,
      per_page,
      status,
    };

    return httpClient.get<StudentListResponse>(API_ENDPOINTS.students.list, params);
  }

  /**
   * Update student status
   */
  static async updateStudentStatus(id: string, status: string): Promise<ApiResponse<Student>> {
    return httpClient.put<Student>(API_ENDPOINTS.students.update(id), { status });
  }

  /**
   * Bulk update student status
   */
  static async bulkUpdateStatus(
    studentIds: string[],
    status: string
  ): Promise<ApiResponse<StudentBulkActionResponse>> {
    const actionData: StudentBulkAction = {
      student_ids: studentIds,
      action: 'update_status',
      parameters: { status },
    };

    return this.bulkAction(actionData);
  }
}

// Helper functions for common operations
export const studentApi = {
  // Get all students with optional filters
  getAll: async (filters?: StudentSearchParams, page?: number, per_page?: number) => {
    const response = await StudentApi.getStudents(page, per_page, filters);
    return response;
  },

  // Get single student
  getById: async (id: string) => {
    const response = await StudentApi.getStudent(id);
    return response;
  },

  // Create student
  create: async (data: StudentCreate) => {
    const response = await StudentApi.createStudent(data);
    return response;
  },

  // Update student
  update: async (id: string, data: StudentUpdate) => {
    const response = await StudentApi.updateStudent(id, data);
    return response;
  },

  // Delete student
  delete: async (id: string) => {
    const response = await StudentApi.deleteStudent(id);
    return response;
  },

  // Get statistics
  getStats: async () => {
    const response = await StudentApi.getStudentStats();
    return response;
  },

  // Search students
  search: async (query: string, page?: number, per_page?: number) => {
    const response = await StudentApi.searchStudents(query, page, per_page);
    return response;
  },

  // Bulk operations
  bulkUpdateStatus: async (studentIds: string[], status: string) => {
    const response = await StudentApi.bulkUpdateStatus(studentIds, status);
    return response;
  },
};

// Export default
export default StudentApi;