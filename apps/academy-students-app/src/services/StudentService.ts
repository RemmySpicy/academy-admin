/**
 * Student Service for Academy Students App
 * 
 * This service demonstrates how to use the shared API client
 * for student-specific operations in the mobile app.
 */

import { apiClient } from '@shared/api-client';
import type {
  StudentProfile,
  StudentProgress,
  AttendanceRecord,
  Assessment,
  Communication,
  ParentProfile,
} from '../types';

export class StudentService {
  /**
   * Get current student's profile
   */
  static async getMyProfile(): Promise<StudentProfile> {
    try {
      const response = await apiClient.students.getMyProfile();
      return response.data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  /**
   * Get current student's progress summary
   */
  static async getMyProgress(): Promise<StudentProgress> {
    try {
      const response = await apiClient.students.getMyProgress();
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  /**
   * Get current student's attendance records
   */
  static async getMyAttendance(
    dateFrom?: string,
    dateTo?: string,
    courseId?: string
  ): Promise<AttendanceRecord[]> {
    try {
      const response = await apiClient.students.getMyAttendance({
        date_from: dateFrom,
        date_to: dateTo,
        course_id: courseId,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  }

  /**
   * Get current student's assessments
   */
  static async getMyAssessments(
    courseId?: string,
    assessmentType?: string
  ): Promise<Assessment[]> {
    try {
      const response = await apiClient.students.getMyAssessments({
        course_id: courseId,
        assessment_type: assessmentType,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }

  /**
   * Get current student's communications
   */
  static async getMyCommunications(
    type?: string,
    status?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<Communication[]> {
    try {
      const response = await apiClient.students.getMyCommunications({
        communication_type: type,
        status,
        date_from: dateFrom,
        date_to: dateTo,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching communications:', error);
      throw error;
    }
  }

  /**
   * Get current student's parent/guardian contacts
   */
  static async getMyParents(): Promise<ParentProfile[]> {
    try {
      const response = await apiClient.students.getMyParents();
      return response.data;
    } catch (error) {
      console.error('Error fetching parent contacts:', error);
      throw error;
    }
  }

  /**
   * Update student profile
   */
  static async updateProfile(profileData: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await apiClient.students.updateMyProfile(profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  /**
   * Mark communication as read
   */
  static async markCommunicationAsRead(communicationId: string): Promise<void> {
    try {
      await apiClient.communications.markAsRead(communicationId);
    } catch (error) {
      console.error('Error marking communication as read:', error);
      throw error;
    }
  }
}

export default StudentService;