/**
 * Tutor Service for Academy Tutor App
 * 
 * This service demonstrates how to use the shared API client
 * for instructor-specific operations in the mobile app.
 */

import { apiClient } from '@shared/api-client';
import type {
  TutorProfile,
  StudentOverview,
  ClassSchedule,
  AttendanceSession,
  StudentAttendance,
  StudentProgress,
  CommunicationMessage,
  TaskItem,
  PerformanceAnalytics,
} from '../types';

export class TutorService {
  /**
   * Get current instructor's profile
   */
  static async getMyProfile(): Promise<TutorProfile> {
    try {
      const response = await apiClient.auth.getCurrentUser();
      return response.data;
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      throw error;
    }
  }

  /**
   * Get assigned students
   */
  static async getMyStudents(
    programId?: string,
    search?: string,
    status?: string
  ): Promise<StudentOverview[]> {
    try {
      const response = await apiClient.students.list({
        program_id: programId,
        search,
        status,
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  /**
   * Get student details
   */
  static async getStudentDetails(studentId: string): Promise<StudentOverview> {
    try {
      const response = await apiClient.students.getById(studentId);
      return response.data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw error;
    }
  }

  /**
   * Get student progress
   */
  static async getStudentProgress(studentId: string): Promise<StudentProgress> {
    try {
      const response = await apiClient.students.getProgress(studentId);
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  /**
   * Get class schedule
   */
  static async getMySchedule(
    date?: string,
    programId?: string
  ): Promise<ClassSchedule[]> {
    try {
      const response = await apiClient.courses.getSchedule({
        date,
        program_id: programId,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  /**
   * Record attendance for a class session
   */
  static async recordAttendance(
    sessionId: string,
    attendanceData: StudentAttendance[]
  ): Promise<AttendanceSession> {
    try {
      const response = await apiClient.attendance.recordSession(sessionId, {
        student_attendance: attendanceData,
      });
      return response.data;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance session
   */
  static async getAttendanceSession(sessionId: string): Promise<AttendanceSession> {
    try {
      const response = await apiClient.attendance.getSession(sessionId);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance session:', error);
      throw error;
    }
  }

  /**
   * Send communication/message
   */
  static async sendMessage(messageData: {
    subject: string;
    content: string;
    recipientType: string;
    recipientIds: string[];
    priority?: string;
    courseId?: string;
  }): Promise<CommunicationMessage> {
    try {
      const response = await apiClient.communications.send(messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get communications/messages
   */
  static async getMessages(
    type?: string,
    status?: string
  ): Promise<CommunicationMessage[]> {
    try {
      const response = await apiClient.communications.list({
        type,
        status,
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Get tasks
   */
  static async getMyTasks(
    type?: string,
    priority?: string,
    status?: string
  ): Promise<TaskItem[]> {
    try {
      const response = await apiClient.tasks.list({
        type,
        priority,
        status,
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  static async updateTask(
    taskId: string,
    updates: Partial<TaskItem>
  ): Promise<TaskItem> {
    try {
      const response = await apiClient.tasks.update(taskId, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Get performance analytics for students
   */
  static async getStudentAnalytics(
    studentIds: string[],
    programId?: string
  ): Promise<PerformanceAnalytics[]> {
    try {
      const response = await apiClient.analytics.getStudentPerformance({
        student_ids: studentIds,
        program_id: programId,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Create or update assessment
   */
  static async recordAssessment(assessmentData: {
    studentId: string;
    courseId: string;
    assessmentType: string;
    title: string;
    score: number;
    maxScore: number;
    feedback?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.assessments.create(assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error recording assessment:', error);
      throw error;
    }
  }
}

export default TutorService;