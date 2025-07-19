/**
 * Type definitions for Academy Tutor App
 * 
 * This file re-exports shared types from the main repository
 * and defines app-specific types for tutors and coordinators.
 */

// Re-export all shared types from the main repository
export * from '../../../shared/types';

// App-specific types for tutor mobile app
export interface TutorProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'tutor' | 'program_coordinator' | 'program_admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  assignedPrograms: ProgramAssignment[];
}

export interface ProgramAssignment {
  programId: string;
  programName: string;
  role: string;
  assignedAt: string;
  permissions: string[];
}

export interface StudentOverview {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  programId: string;
  programName: string;
  status: string;
  enrollmentDate: string;
  lastActivity?: string;
  overallProgress: number;
  attendanceRate: number;
  recentPerformance: 'excellent' | 'good' | 'average' | 'needs_attention';
}

export interface ClassSchedule {
  id: string;
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonTitle: string;
  startTime: string;
  endTime: string;
  location: string;
  enrolledStudents: number;
  maxCapacity: number;
  students: StudentOverview[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface AttendanceSession {
  id: string;
  classScheduleId: string;
  courseName: string;
  lessonTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  studentAttendance: StudentAttendance[];
  status: 'open' | 'closed' | 'pending_review';
}

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkedInAt?: string;
  notes?: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  currentLevel?: string;
  lastAccessed: string;
  assessmentScores: AssessmentScore[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface AssessmentScore {
  assessmentId: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  completedAt: string;
  feedback?: string;
}

export interface CommunicationMessage {
  id: string;
  type: 'announcement' | 'direct_message' | 'group_message' | 'alert';
  subject: string;
  content: string;
  recipientType: 'student' | 'parent' | 'class' | 'program';
  recipients: MessageRecipient[];
  senderId: string;
  senderName: string;
  sentAt: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'sent' | 'delivered' | 'read';
  courseId?: string;
  programId?: string;
}

export interface MessageRecipient {
  id: string;
  name: string;
  type: 'student' | 'parent';
  deliveryStatus: 'pending' | 'delivered' | 'read' | 'failed';
  readAt?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: 'lesson_prep' | 'grading' | 'communication' | 'admin' | 'follow_up';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  relatedStudentId?: string;
  relatedCourseId?: string;
  estimatedDuration?: number;
  completedAt?: string;
  notes?: string;
}

export interface PerformanceAnalytics {
  studentId: string;
  studentName: string;
  analyticsData: {
    attendanceRate: number;
    averageScore: number;
    progressRate: number;
    engagementLevel: 'high' | 'medium' | 'low';
    lastAssessmentScore: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
  };
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  StudentDetails: { studentId: string };
  ClassDetails: { classId: string };
  AttendanceRecord: { sessionId: string };
  MessageCompose: { recipientType: string; recipientIds?: string[] };
  StudentProgress: { studentId: string };
  Schedule: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Schedule: undefined;
  Messages: undefined;
  Tasks: undefined;
  Analytics: undefined;
};

export type StudentStackParamList = {
  StudentList: undefined;
  StudentDetails: { studentId: string };
  StudentProgress: { studentId: string };
  AttendanceHistory: { studentId: string };
};

// App state types
export interface TutorAppState {
  user: TutorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedProgram: string | null;
}

export interface AuthState {
  token: string | null;
  user: TutorProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface StudentsState {
  students: StudentOverview[];
  selectedStudent: StudentOverview | null;
  isLoading: boolean;
  error: string | null;
  filters: StudentFilters;
}

export interface StudentFilters {
  programId?: string;
  status?: string;
  searchQuery?: string;
  sortBy: 'name' | 'progress' | 'attendance' | 'last_activity';
  sortOrder: 'asc' | 'desc';
}

export interface ScheduleState {
  classes: ClassSchedule[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

export interface MessagesState {
  conversations: CommunicationMessage[];
  selectedConversation: CommunicationMessage | null;
  isLoading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: TaskItem[];
  completedTasks: TaskItem[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export interface TaskFilters {
  type?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}