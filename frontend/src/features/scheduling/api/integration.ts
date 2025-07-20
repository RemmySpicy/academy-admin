/**
 * API service for scheduling integration with courses and facilities
 */

import { httpClient } from '@/lib/api/httpClient';

const BASE_PATH = '/api/v1/scheduling/integration';

export interface SessionTemplate {
  title: string;
  description?: string;
  session_type?: string;
  start_time: string; // ISO format datetime
  end_time: string;   // ISO format datetime
  max_participants?: number;
  student_type?: string;
  skill_level?: string;
  special_requirements?: string;
  notes?: string;
  recurring_pattern?: string;
  recurring_config?: Record<string, any>;
}

export interface CreateSessionsFromCourseRequest {
  course_id: string;
  facility_id: string;
  session_templates: SessionTemplate[];
  auto_enroll_students?: boolean;
}

export interface SyncCourseEnrollmentRequest {
  course_id: string;
  auto_enroll?: boolean;
  auto_remove?: boolean;
}

export interface StudentScheduleData {
  student_id: string;
  enrollments: any[];
  sessions: any[];
  statistics: {
    total_enrollments: number;
    active_enrollments: number;
    total_sessions: number;
    upcoming_sessions: number;
    completed_sessions: number;
    attendance_rate: number;
    next_session?: any;
    progress_percentage: number;
  };
  upcoming_sessions: any[];
  completed_sessions: any[];
}

export interface FacilityUtilizationReport {
  facility: {
    id: string;
    name: string;
    type: string;
    capacity?: number;
  };
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_sessions: number;
    active_sessions: number;
    completed_sessions: number;
    cancelled_sessions: number;
    total_participants: number;
    average_participants_per_session: number;
    capacity_utilization: number;
  };
  daily_breakdown: Record<string, {
    sessions: number;
    participants: number;
    capacity: number;
    hours_used: number;
  }>;
}

export interface IntegrationOverview {
  program_context: string;
  scheduling: {
    total_sessions: number;
    active_sessions: number;
    sessions_with_courses: number;
    integration_rate: number;
  };
  enrollments: {
    total_enrollments: number;
    active_enrollments: number;
  };
  integration_health: {
    sessions_integrated: boolean;
    enrollments_available: boolean;
    ready_for_sync: boolean;
  };
}

export const schedulingIntegrationApi = {
  /**
   * Create sessions from course enrollment
   */
  async createSessionsFromCourse(data: CreateSessionsFromCourseRequest) {
    const response = await httpClient.post<{
      success: boolean;
      message: string;
      sessions_created: number;
      session_ids: string[];
    }>(`${BASE_PATH}/courses/create-sessions`, data);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create sessions from course');
    }
    
    return response.data;
  },

  /**
   * Get comprehensive student schedule
   */
  async getStudentSchedule(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<StudentScheduleData> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await httpClient.get<StudentScheduleData>(
      `${BASE_PATH}/students/${studentId}/schedule?${params.toString()}`
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get student schedule');
    }
    
    return response.data;
  },

  /**
   * Get facility utilization report
   */
  async getFacilityUtilizationReport(
    facilityId: string,
    startDate: string,
    endDate: string
  ): Promise<FacilityUtilizationReport> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    
    const response = await httpClient.get<FacilityUtilizationReport>(
      `${BASE_PATH}/facilities/${facilityId}/utilization?${params.toString()}`
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get utilization report');
    }
    
    return response.data;
  },

  /**
   * Sync course enrollments with sessions
   */
  async syncCourseEnrollments(data: SyncCourseEnrollmentRequest) {
    const response = await httpClient.post<{
      success: boolean;
      message: string;
      results: {
        enrolled_students: number;
        removed_students: number;
        sessions_updated: number;
        errors: string[];
      };
    }>(`${BASE_PATH}/courses/sync-enrollments`, data);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to sync course enrollments');
    }
    
    return response.data;
  },

  /**
   * Get course sessions
   */
  async getCourseSessions(courseId: string, includeCompleted = false) {
    const params = new URLSearchParams({
      include_completed: includeCompleted.toString(),
    });
    
    const response = await httpClient.get<{
      course_id: string;
      total_sessions: number;
      sessions: any[];
    }>(`${BASE_PATH}/courses/${courseId}/sessions?${params.toString()}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get course sessions');
    }
    
    return response.data;
  },

  /**
   * Get scheduling integration overview
   */
  async getIntegrationOverview(): Promise<IntegrationOverview> {
    const response = await httpClient.get<IntegrationOverview>(
      `${BASE_PATH}/stats/overview`
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get integration overview');
    }
    
    return response.data;
  },
};