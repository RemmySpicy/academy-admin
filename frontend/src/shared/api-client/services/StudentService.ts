/**
 * Student management service for API client
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { 
  Student, 
  StudentDetail, 
  CreateStudentRequest, 
  UpdateStudentRequest,
  StudentSearchParams,
  StudentStats,
  AttendanceRecord,
  AssessmentResult,
  ParentContact,
  CommunicationLog,
  StudentBulkAction,
  StudentExportData,
  PaginatedResponse
} from '../../types';

export class StudentService {
  constructor(private http: HttpClient) {}

  /**
   * Get all students (program-filtered automatically)
   */
  async getStudents(params?: StudentSearchParams): Promise<ApiResponse<PaginatedResponse<Student>>> {
    return this.http.get<PaginatedResponse<Student>>('/students', {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Get specific student by ID
   */
  async getStudent(studentId: string): Promise<ApiResponse<StudentDetail>> {
    return this.http.get<StudentDetail>(`/students/${studentId}`, {
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Create new student
   */
  async createStudent(studentData: CreateStudentRequest): Promise<ApiResponse<Student>> {
    return this.http.post<Student>('/students', studentData);
  }

  /**
   * Update existing student
   */
  async updateStudent(studentId: string, updates: UpdateStudentRequest): Promise<ApiResponse<Student>> {
    return this.http.put<Student>(`/students/${studentId}`, updates);
  }

  /**
   * Delete student
   */
  async deleteStudent(studentId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/students/${studentId}`);
  }

  /**
   * Get student statistics
   */
  async getStudentStats(): Promise<ApiResponse<StudentStats>> {
    return this.http.get<StudentStats>('/students/stats', {
      useCache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }

  /**
   * Get my profile (for student mobile app)
   */
  async getMyProfile(): Promise<ApiResponse<StudentDetail>> {
    return this.http.get<StudentDetail>('/students/me', {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Update my profile (for student mobile app)
   */
  async updateMyProfile(updates: Partial<UpdateStudentRequest>): Promise<ApiResponse<Student>> {
    return this.http.patch<Student>('/students/me', updates);
  }

  /**
   * Get my progress (for student mobile app)
   */
  async getMyProgress(): Promise<ApiResponse<any>> {
    return this.http.get('/students/me/progress', {
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  // Attendance Management

  /**
   * Get attendance records for student
   */
  async getStudentAttendance(
    studentId: string, 
    params?: {
      date_from?: string;
      date_to?: string;
      course_id?: string;
      status?: string;
    }
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.http.get<AttendanceRecord[]>(`/students/${studentId}/attendance`, {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Mark student attendance
   */
  async markAttendance(
    studentId: string, 
    attendanceData: {
      course_id: string;
      lesson_id?: string;
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused' | 'early_departure';
      arrival_time?: string;
      departure_time?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<AttendanceRecord>> {
    return this.http.post<AttendanceRecord>(`/students/${studentId}/attendance`, attendanceData);
  }

  /**
   * Update attendance record
   */
  async updateAttendance(attendanceId: string, updates: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    return this.http.patch<AttendanceRecord>(`/attendance/${attendanceId}`, updates);
  }

  /**
   * Get my attendance (for student mobile app)
   */
  async getMyAttendance(params?: {
    date_from?: string;
    date_to?: string;
    course_id?: string;
  }): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.http.get<AttendanceRecord[]>('/students/me/attendance', {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  // Assessment Results

  /**
   * Get assessment results for student
   */
  async getStudentAssessments(
    studentId: string,
    params?: {
      course_id?: string;
      assessment_type?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<AssessmentResult[]>> {
    return this.http.get<AssessmentResult[]>(`/students/${studentId}/assessments`, {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get my assessment results (for student mobile app)
   */
  async getMyAssessments(params?: {
    course_id?: string;
    assessment_type?: string;
  }): Promise<ApiResponse<AssessmentResult[]>> {
    return this.http.get<AssessmentResult[]>('/students/me/assessments', {
      params,
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  // Parent/Guardian Management

  /**
   * Get parent contacts for student
   */
  async getStudentParents(studentId: string): Promise<ApiResponse<ParentContact[]>> {
    return this.http.get<ParentContact[]>(`/students/${studentId}/parents`, {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  /**
   * Add parent contact for student
   */
  async addParentContact(studentId: string, parentData: Omit<ParentContact, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ParentContact>> {
    return this.http.post<ParentContact>(`/students/${studentId}/parents`, parentData);
  }

  /**
   * Update parent contact
   */
  async updateParentContact(parentId: string, updates: Partial<ParentContact>): Promise<ApiResponse<ParentContact>> {
    return this.http.patch<ParentContact>(`/parents/${parentId}`, updates);
  }

  /**
   * Remove parent contact
   */
  async removeParentContact(parentId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/parents/${parentId}`);
  }

  /**
   * Get my parents (for student mobile app)
   */
  async getMyParents(): Promise<ApiResponse<ParentContact[]>> {
    return this.http.get<ParentContact[]>('/students/me/parents', {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }

  // Communication Management

  /**
   * Get communication log for student
   */
  async getStudentCommunications(
    studentId: string,
    params?: {
      communication_type?: string;
      direction?: 'incoming' | 'outgoing';
      status?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<ApiResponse<CommunicationLog[]>> {
    return this.http.get<CommunicationLog[]>(`/students/${studentId}/communications`, {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Send communication to student/parents
   */
  async sendCommunication(
    studentId: string,
    communicationData: {
      contact_id?: string; // Parent/guardian
      communication_type: 'email' | 'sms' | 'app_notification' | 'phone_call';
      subject: string;
      content: string;
      scheduled_at?: string;
    }
  ): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>(`/students/${studentId}/communications`, communicationData);
  }

  /**
   * Get my communications (for student mobile app)
   */
  async getMyCommunications(params?: {
    communication_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<CommunicationLog[]>> {
    return this.http.get<CommunicationLog[]>('/students/me/communications', {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Mark communication as read (for student mobile app)
   */
  async markCommunicationRead(communicationId: string): Promise<ApiResponse<void>> {
    return this.http.patch<void>(`/communications/${communicationId}/read`);
  }

  // Bulk Operations

  /**
   * Perform bulk action on students
   */
  async bulkAction(action: StudentBulkAction): Promise<ApiResponse<any>> {
    return this.http.post('/students/bulk', action);
  }

  /**
   * Export student data
   */
  async exportStudents(exportConfig: StudentExportData): Promise<ApiResponse<{ download_url: string }>> {
    return this.http.post<{ download_url: string }>('/students/export', exportConfig);
  }

  // Student Search and Filtering

  /**
   * Search students by various criteria
   */
  async searchStudents(params: {
    query: string;
    filters?: {
      status?: string[];
      age_range?: { min: number; max: number };
      enrollment_date_range?: { start: string; end: string };
      courses?: string[];
    };
    sort_by?: 'name' | 'enrollment_date' | 'last_activity';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Student>>> {
    return this.http.post<PaginatedResponse<Student>>('/students/search', params, {
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Get recently active students
   */
  async getRecentlyActiveStudents(limit?: number): Promise<ApiResponse<Student[]>> {
    return this.http.get<Student[]>('/students/recent-activity', {
      params: { limit },
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Get students needing attention (missing assignments, poor attendance, etc.)
   */
  async getStudentsNeedingAttention(): Promise<ApiResponse<{
    student: Student;
    reasons: string[];
    priority: 'high' | 'medium' | 'low';
  }[]>> {
    return this.http.get('/students/attention-needed', {
      useCache: true,
      cacheTTL: 10 * 60 * 1000,
    });
  }
}