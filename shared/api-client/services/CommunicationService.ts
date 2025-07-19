/**
 * Communication service for parent-student-tutor interactions
 */

import { HttpClient } from '../core/HttpClient';
import { ApiResponse } from '../core/types';
import { 
  CommunicationLog,
  PaginatedResponse
} from '../../types';

export class CommunicationService {
  constructor(private http: HttpClient) {}

  /**
   * Get all communications (filtered by role and program)
   */
  async getCommunications(params?: {
    student_id?: string;
    contact_id?: string;
    communication_type?: string;
    direction?: 'incoming' | 'outgoing';
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<CommunicationLog>>> {
    return this.http.get<PaginatedResponse<CommunicationLog>>('/communications', {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
    });
  }

  /**
   * Get specific communication by ID
   */
  async getCommunication(communicationId: string): Promise<ApiResponse<CommunicationLog>> {
    return this.http.get<CommunicationLog>(`/communications/${communicationId}`, {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Send communication message
   */
  async sendMessage(messageData: {
    student_id?: string;
    contact_id?: string; // Parent/guardian ID
    recipient_type: 'student' | 'parent' | 'tutor' | 'coordinator';
    recipient_ids: string[];
    communication_type: 'email' | 'sms' | 'app_notification' | 'phone_call' | 'in_person';
    subject: string;
    content: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduled_at?: string;
    attachments?: {
      filename: string;
      content_type: string;
      data: string; // base64 encoded
    }[];
  }): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>('/communications/send', messageData);
  }

  /**
   * Reply to a communication
   */
  async replyToMessage(
    communicationId: string,
    replyData: {
      content: string;
      communication_type?: 'email' | 'sms' | 'app_notification';
      attachments?: {
        filename: string;
        content_type: string;
        data: string;
      }[];
    }
  ): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>(`/communications/${communicationId}/reply`, replyData);
  }

  /**
   * Mark communication as read
   */
  async markAsRead(communicationId: string): Promise<ApiResponse<void>> {
    return this.http.patch<void>(`/communications/${communicationId}/read`);
  }

  /**
   * Mark multiple communications as read
   */
  async markMultipleAsRead(communicationIds: string[]): Promise<ApiResponse<void>> {
    return this.http.post<void>('/communications/mark-read', {
      communication_ids: communicationIds,
    });
  }

  /**
   * Archive communication
   */
  async archiveCommunication(communicationId: string): Promise<ApiResponse<void>> {
    return this.http.patch<void>(`/communications/${communicationId}/archive`);
  }

  /**
   * Delete communication
   */
  async deleteCommunication(communicationId: string): Promise<ApiResponse<void>> {
    return this.http.delete<void>(`/communications/${communicationId}`);
  }

  // Student-specific communications (for student mobile app)

  /**
   * Get my communications (for student mobile app)
   */
  async getMyCommunications(params?: {
    communication_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<CommunicationLog>>> {
    return this.http.get<PaginatedResponse<CommunicationLog>>('/communications/my-messages', {
      params,
      useCache: true,
      cacheTTL: 1 * 60 * 1000, // 1 minute
    });
  }

  /**
   * Send message to my tutors/coordinators (for student mobile app)
   */
  async messageMyTutors(messageData: {
    subject: string;
    content: string;
    communication_type?: 'email' | 'app_notification';
    course_id?: string; // Optional: specific to a course
    priority?: 'low' | 'normal' | 'high';
  }): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>('/communications/message-tutors', messageData);
  }

  /**
   * Get unread message count (for mobile app badges)
   */
  async getUnreadCount(): Promise<ApiResponse<{ 
    total: number; 
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
  }>> {
    return this.http.get('/communications/unread-count', {
      useCache: true,
      cacheTTL: 30 * 1000, // 30 seconds
    });
  }

  // Parent-specific communications (for parent mobile app)

  /**
   * Get communications about my children
   */
  async getMyChildrenCommunications(params?: {
    student_id?: string;
    communication_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<CommunicationLog>>> {
    return this.http.get<PaginatedResponse<CommunicationLog>>('/communications/my-children', {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Send message to child's tutors/coordinators (for parent mobile app)
   */
  async messageChildTutors(
    studentId: string,
    messageData: {
      subject: string;
      content: string;
      communication_type?: 'email' | 'app_notification';
      course_id?: string;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>(`/communications/message-child-tutors/${studentId}`, messageData);
  }

  // Tutor-specific communications (for tutor mobile app)

  /**
   * Get communications for my students
   */
  async getMyStudentsCommunications(params?: {
    student_id?: string;
    course_id?: string;
    communication_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<CommunicationLog>>> {
    return this.http.get<PaginatedResponse<CommunicationLog>>('/communications/my-students', {
      params,
      useCache: true,
      cacheTTL: 2 * 60 * 1000,
    });
  }

  /**
   * Send progress update to parents
   */
  async sendProgressUpdate(
    studentId: string,
    updateData: {
      subject: string;
      content: string;
      course_id?: string;
      progress_data?: {
        current_grade?: number;
        attendance_rate?: number;
        completed_assignments?: number;
        total_assignments?: number;
        behavioral_notes?: string;
      };
      send_to_parents?: boolean;
      send_to_student?: boolean;
    }
  ): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>(`/communications/progress-update/${studentId}`, updateData);
  }

  /**
   * Send absence notification to parents
   */
  async sendAbsenceNotification(
    studentId: string,
    absenceData: {
      date: string;
      course_id: string;
      absence_type: 'absent' | 'late' | 'early_departure';
      notes?: string;
      auto_notify_parents?: boolean;
    }
  ): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>(`/communications/absence-notification/${studentId}`, absenceData);
  }

  // Communication Templates and Automation

  /**
   * Get communication templates
   */
  async getTemplates(params?: {
    template_type?: 'progress_report' | 'absence_notification' | 'assignment_reminder' | 'general';
    role?: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    template_type: string;
    subject_template: string;
    content_template: string;
    variables: string[];
  }[]>> {
    return this.http.get('/communications/templates', {
      params,
      useCache: true,
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    });
  }

  /**
   * Create communication from template
   */
  async createFromTemplate(
    templateId: string,
    data: {
      student_id?: string;
      recipient_ids: string[];
      template_variables: Record<string, string>;
      communication_type?: 'email' | 'sms' | 'app_notification';
      scheduled_at?: string;
    }
  ): Promise<ApiResponse<CommunicationLog>> {
    return this.http.post<CommunicationLog>(`/communications/from-template/${templateId}`, data);
  }

  /**
   * Schedule bulk communication
   */
  async scheduleBulkCommunication(data: {
    recipient_type: 'students' | 'parents' | 'tutors';
    recipient_filters?: {
      program_id?: string;
      course_id?: string;
      student_status?: string;
      grade_range?: { min: number; max: number };
    };
    communication_type: 'email' | 'sms' | 'app_notification';
    subject: string;
    content: string;
    scheduled_at?: string;
    send_individually?: boolean; // vs batch
  }): Promise<ApiResponse<{
    scheduled_count: number;
    estimated_delivery: string;
    batch_id: string;
  }>> {
    return this.http.post('/communications/bulk-schedule', data);
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(params?: {
    date_from?: string;
    date_to?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    total_sent: number;
    total_delivered: number;
    total_read: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    response_rate: number;
    trends: {
      period: string;
      sent: number;
      delivered: number;
      read: number;
    }[];
  }>> {
    return this.http.get('/communications/stats', {
      params,
      useCache: true,
      cacheTTL: 15 * 60 * 1000,
    });
  }
}