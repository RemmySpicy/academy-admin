/**
 * Scheduling API services for facility-centric session management
 */

import { httpClient } from '@/lib/api/httpClient';

// Re-export integration API
export { schedulingIntegrationApi } from './integration';
import type {
  Session,
  SessionCreate,
  SessionUpdate,
  SessionListResponse,
  SessionSearchParams,
  SessionStats,
  SessionConflict,
  SessionParticipant,
  InstructorAssignment,
  InstructorAvailability,
  FacilityScheduleSettings,
} from '../types';

const BASE_PATH = '/api/v1/scheduling';

export const schedulingApi = {
  /**
   * Create a new scheduled session.
   * Implements original requirement: "Create a new schedule"
   */
  async createSession(sessionData: SessionCreate): Promise<Session> {
    const response = await httpClient.post<Session>(`${BASE_PATH}/sessions/`, sessionData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create session');
    }
    return response.data;
  },

  /**
   * Get sessions for a specific facility.
   * Implements original requirement: "See a list of all locations"
   */
  async getFacilitySessions(
    facilityId: string,
    params?: SessionSearchParams & {
      skip?: number;
      limit?: number;
    }
  ): Promise<SessionListResponse> {
    const response = await httpClient.get<SessionListResponse>(
      `${BASE_PATH}/sessions/facility/${facilityId}`,
      { params }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility sessions');
    }
    return response.data;
  },

  /**
   * Get a specific session by ID.
   */
  async getSession(sessionId: string): Promise<Session> {
    const response = await httpClient.get<Session>(`${BASE_PATH}/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch session');
    }
    return response.data;
  },

  /**
   * Update session time - single or all recurring sessions.
   * Implements original requirement: "Change time (one-time, or for all the recurring)"
   */
  async updateSessionTime(
    sessionId: string,
    newStartTime: string,
    newEndTime: string,
    applyToAllRecurring = false
  ): Promise<Session[]> {
    const response = await httpClient.put<Session[]>(
      `${BASE_PATH}/sessions/${sessionId}/time`,
      null,
      {
        params: {
          new_start_time: newStartTime,
          new_end_time: newEndTime,
          apply_to_all_recurring: applyToAllRecurring,
        },
      }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update session time');
    }
    return response.data;
  },

  /**
   * Cancel session - single or all recurring sessions.
   * Implements original requirement: "Cancel schedule (one-time, or for all the recurring)"
   */
  async cancelSession(
    sessionId: string,
    reason: string,
    cancelAllRecurring = false
  ): Promise<Session[]> {
    const response = await httpClient.put<Session[]>(
      `${BASE_PATH}/sessions/${sessionId}/cancel`,
      null,
      {
        params: {
          reason,
          cancel_all_recurring: cancelAllRecurring,
        },
      }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel session');
    }
    return response.data;
  },

  /**
   * Cancel all uncompleted sessions for a specific day.
   * Implements original requirement: "Cancel all uncompleted schedules for the day (input reason)"
   */
  async cancelAllSessionsForDay(
    facilityId: string,
    date: string,
    reason: string
  ): Promise<Session[]> {
    const response = await httpClient.put<Session[]>(
      `${BASE_PATH}/sessions/facility/${facilityId}/cancel-day`,
      null,
      {
        params: {
          date,
          reason,
        },
      }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel sessions for day');
    }
    return response.data;
  },

  /**
   * Add participants to a session.
   * Implements original requirement: "Add/Remove participants"
   */
  async addParticipants(sessionId: string, studentIds: string[]): Promise<string[]> {
    const response = await httpClient.post<string[]>(
      `${BASE_PATH}/sessions/${sessionId}/participants`,
      studentIds
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to add participants');
    }
    return response.data;
  },

  /**
   * Remove participants from a session.
   * Implements original requirement: "Add/Remove participants"
   */
  async removeParticipants(
    sessionId: string,
    studentIds: string[],
    reason?: string
  ): Promise<string[]> {
    const response = await httpClient.delete<string[]>(
      `${BASE_PATH}/sessions/${sessionId}/participants`,
      {
        data: studentIds,
        params: { reason },
      }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove participants');
    }
    return response.data;
  },

  /**
   * Add instructors to a session.
   * Implements original requirement: "Add/remove tutor(s)"
   */
  async addInstructors(sessionId: string, instructorIds: string[]): Promise<string[]> {
    const response = await httpClient.post<string[]>(
      `${BASE_PATH}/sessions/${sessionId}/instructors`,
      instructorIds
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to add instructors');
    }
    return response.data;
  },

  /**
   * Remove instructors from a session.
   * Implements original requirement: "Add/remove tutor(s)"
   */
  async removeInstructors(
    sessionId: string,
    instructorIds: string[],
    reason?: string
  ): Promise<string[]> {
    const response = await httpClient.delete<string[]>(
      `${BASE_PATH}/sessions/${sessionId}/instructors`,
      {
        data: instructorIds,
        params: { reason },
      }
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove instructors');
    }
    return response.data;
  },

  /**
   * Get list of students signed up for a session.
   * Implements original requirement: "See list of students signed up for the schedule"
   */
  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    const response = await httpClient.get<SessionParticipant[]>(
      `${BASE_PATH}/sessions/${sessionId}/participants`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch session participants');
    }
    return response.data;
  },

  /**
   * Check for session conflicts (facility and instructor).
   * Implements conflict detection for scheduling system.
   */
  async checkConflicts(conflictCheck: {
    facility_id: string;
    start_time: string;
    end_time: string;
    instructor_ids?: string[];
    exclude_session_id?: string;
  }): Promise<SessionConflict> {
    const response = await httpClient.post<SessionConflict>(
      `${BASE_PATH}/sessions/check-conflicts`,
      conflictCheck
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to check conflicts');
    }
    return response.data;
  },

  /**
   * Update session information.
   */
  async updateSession(sessionId: string, updates: SessionUpdate): Promise<Session> {
    const response = await httpClient.put<Session>(`${BASE_PATH}/sessions/${sessionId}`, updates);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update session');
    }
    return response.data;
  },

  /**
   * Delete a session.
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await httpClient.delete<void>(`${BASE_PATH}/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete session');
    }
  },

  /**
   * Get session statistics.
   */
  async getSessionStats(facilityId?: string): Promise<SessionStats> {
    const response = await httpClient.get<SessionStats>(`${BASE_PATH}/sessions/stats`, {
      params: { facility_id: facilityId },
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch session statistics');
    }
    return response.data;
  },

  // Instructor availability methods
  async getInstructorAvailability(instructorId: string): Promise<InstructorAvailability[]> {
    const response = await httpClient.get<InstructorAvailability[]>(
      `${BASE_PATH}/instructors/${instructorId}/availability`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch instructor availability');
    }
    return response.data;
  },

  async createInstructorAvailability(
    availability: Omit<InstructorAvailability, 'id' | 'created_at' | 'updated_at'>
  ): Promise<InstructorAvailability> {
    const response = await httpClient.post<InstructorAvailability>(
      `${BASE_PATH}/instructors/availability`,
      availability
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to create instructor availability');
    }
    return response.data;
  },

  async updateInstructorAvailability(
    availabilityId: string,
    updates: Partial<InstructorAvailability>
  ): Promise<InstructorAvailability> {
    const response = await httpClient.put<InstructorAvailability>(
      `${BASE_PATH}/instructors/availability/${availabilityId}`,
      updates
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update instructor availability');
    }
    return response.data;
  },

  async deleteInstructorAvailability(availabilityId: string): Promise<void> {
    const response = await httpClient.delete<void>(`${BASE_PATH}/instructors/availability/${availabilityId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete instructor availability');
    }
  },

  // Facility settings methods
  async getFacilitySettings(facilityId: string): Promise<FacilityScheduleSettings> {
    const response = await httpClient.get<FacilityScheduleSettings>(
      `${BASE_PATH}/facilities/${facilityId}/settings`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch facility settings');
    }
    return response.data;
  },

  async updateFacilitySettings(
    facilityId: string,
    settings: Partial<FacilityScheduleSettings>
  ): Promise<FacilityScheduleSettings> {
    const response = await httpClient.put<FacilityScheduleSettings>(
      `${BASE_PATH}/facilities/${facilityId}/settings`,
      settings
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update facility settings');
    }
    return response.data;
  }
};

// Export default for backwards compatibility
export default schedulingApi;