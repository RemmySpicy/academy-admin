/**
 * Type definitions for Academy Students App
 * 
 * This file re-exports shared types from the main repository
 * and defines app-specific types for students and parents.
 */

// Re-export all shared types from the main repository
export * from '../../../shared/types';

// App-specific types for students mobile app
export interface StudentProfile {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender?: string;
  address?: any;
  programId: string;
  programName?: string;
  enrollmentDate: string;
  status: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  notes?: string;
}

export interface ParentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  relationship: string;
  isPrimary: boolean;
  canPickup: boolean;
  emergencyContact: boolean;
}

export interface StudentProgress {
  studentId: string;
  overallProgress: number;
  currentCourses: CourseProgress[];
  completedCourses: CourseProgress[];
  recentAssessments: Assessment[];
  attendanceSummary: AttendanceSummary;
  upcomingAssignments: Assignment[];
  achievements: Achievement[];
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  currentLevel?: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  courseName: string;
  assessmentType: string;
  title: string;
  score?: number;
  maxScore: number;
  completedAt?: string;
  feedback?: string;
}

export interface AttendanceSummary {
  presentDays: number;
  totalDays: number;
  attendanceRate: number;
  recentAttendance: AttendanceRecord[];
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  courseId?: string;
  courseName?: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  earnedAt: string;
  courseId?: string;
  courseName?: string;
}

export interface Communication {
  id: string;
  type: 'announcement' | 'message' | 'alert' | 'reminder';
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  sentAt: string;
  readAt?: string;
  priority: 'low' | 'medium' | 'high';
  courseId?: string;
  courseName?: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  Progress: undefined;
  Attendance: undefined;
  Assignments: undefined;
  Communications: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Progress: undefined;
  Attendance: undefined;
  Communications: undefined;
  Profile: undefined;
};

// App state types
export interface AppState {
  user: StudentProfile | ParentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  token: string | null;
  user: StudentProfile | ParentProfile | null;
  isLoading: boolean;
  error: string | null;
}