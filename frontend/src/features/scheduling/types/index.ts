/**
 * Scheduling types for facility-centric session management
 */

// Enums
export enum SessionStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress", 
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  POSTPONED = "postponed",
}

export enum SessionType {
  PRIVATE = "private",           // Private Lessons (1-2 participants)
  GROUP = "group",               // Group Lessons (3-5 participants)
  SCHOOL_GROUP = "school_group", // School Group Lessons (unlimited participants)
  // Legacy types for backward compatibility
  GROUP_LESSON = "group_lesson",
  PRIVATE_LESSON = "private_lesson",
  ASSESSMENT = "assessment",
  PRACTICE = "practice",
  COMPETITION = "competition",
  WORKSHOP = "workshop", 
  MEETING = "meeting",
}

// Type aliases for easier usage
export type SessionTypeString = 
  | "private" 
  | "group" 
  | "school_group"
  | "group_lesson"
  | "private_lesson"
  | "assessment"
  | "practice"
  | "competition"
  | "workshop"
  | "meeting";

export type SessionStatusString = 
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "postponed";

export enum RecurringPattern {
  NONE = "none",
  DAILY = "daily", 
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

export enum ParticipantStatus {
  ENROLLED = "enrolled",
  WAITLISTED = "waitlisted",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
}

// Core types
export interface Session {
  id: string;
  program_id: string;
  facility_id: string;
  course_id?: string;
  title: string;
  description?: string;
  session_type: SessionTypeString;
  start_time: string;
  end_time: string;
  recurring_pattern: RecurringPattern;
  recurring_config?: Record<string, any>;
  recurring_exceptions?: string[];
  recurring_parent_id?: string;
  is_recurring: boolean;
  status: SessionStatusString;
  max_participants?: number;
  student_type?: string;
  skill_level?: string;
  difficulty_level?: string;        // Added for new requirements
  special_requirements?: string;
  notes?: string;
  enrolled_count: number;
  waitlist_count: number;
  available_spots?: number;
  is_full: boolean;
  notification_sent: boolean;
  last_notification_time?: string;
  cancellation_reason?: string;
  cancelled_by_user_id?: string;
  cancelled_at?: string;
  duration_minutes: number;
  instructor_names: string[];
  facility_name?: string;
  course_name?: string;
  program_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  student_id: string;
  enrollment_status: ParticipantStatus;
  enrolled_at: string;
  waitlist_position?: number;
  attendance_status?: AttendanceStatus;
  notes?: string;
  special_requirements?: string;
  student_name?: string;
  student_email?: string;
  session_title?: string;
  session_start_time?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorAssignment {
  id: string;
  session_id: string;
  instructor_id: string;
  is_primary: boolean;
  assignment_notes?: string;
  special_instructions?: string;
  assigned_at: string;
  is_confirmed: boolean;
  confirmed_at?: string;
  instructor_name?: string;
  instructor_email?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorAvailability {
  id: string;
  instructor_id: string;
  program_id: string;
  facility_id?: string;
  day_of_week?: number; // 0=Monday, 6=Sunday
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  max_concurrent_sessions: number;
  is_active: boolean;
  instructor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityScheduleSettings {
  id: string;
  facility_id: string;
  program_id: string;
  // Operating hours
  monday_open?: string;
  monday_close?: string;
  tuesday_open?: string;
  tuesday_close?: string;
  wednesday_open?: string;
  wednesday_close?: string;
  thursday_open?: string;
  thursday_close?: string;
  friday_open?: string;
  friday_close?: string;
  saturday_open?: string;
  saturday_close?: string;
  sunday_open?: string;
  sunday_close?: string;
  // Booking policies
  booking_advance_days: number;
  booking_cutoff_hours: number;
  cancellation_cutoff_hours: number;
  // Session management
  max_sessions_per_day?: number;
  max_concurrent_sessions: number;
  cleanup_time_minutes: number;
  setup_time_minutes: number;
  // Capacity
  default_max_participants?: number;
  participant_limits_by_type?: Record<string, number>;
  // Notifications
  auto_send_notifications: boolean;
  notification_lead_time_hours: number;
  facility_name?: string;
  created_at: string;
  updated_at: string;
}

// Create/Update types
export interface SessionCreate {
  facility_id: string;
  course_id?: string;
  title: string;
  description?: string;
  session_type: SessionType;
  start_time: string;
  end_time: string;
  recurring_pattern: RecurringPattern;
  recurring_config?: Record<string, any>;
  recurring_exceptions?: string[];
  max_participants?: number;
  student_type?: string;
  skill_level?: string;
  special_requirements?: string;
  notes?: string;
  instructor_ids?: string[];
  student_ids?: string[];
}

export interface SessionUpdate {
  title?: string;
  description?: string;
  session_type?: SessionType;
  start_time?: string;
  end_time?: string;
  recurring_pattern?: RecurringPattern;
  recurring_config?: Record<string, any>;
  recurring_exceptions?: string[];
  max_participants?: number;
  student_type?: string;
  skill_level?: string;
  special_requirements?: string;
  notes?: string;
  status?: SessionStatus;
}

// Search and filter types
export interface SessionSearchParams {
  facility_id?: string;
  course_id?: string;
  instructor_id?: string;
  student_id?: string;
  session_type?: SessionType;
  status?: SessionStatus;
  student_type?: string;
  skill_level?: string;
  start_date?: string;
  end_date?: string;
  recurring_only?: boolean;
  parent_sessions_only?: boolean;
  has_available_spots?: boolean;
  is_full?: boolean;
  search?: string;
}

export interface SessionConflict {
  has_conflicts: boolean;
  facility_conflicts: Session[];
  instructor_conflicts: Record<string, Session[]>;
  suggested_times: Array<{
    start_time: string;
    end_time: string;
  }>;
}

// Response types
export interface SessionListResponse {
  items: Session[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  total_participants: number;
  total_waitlisted: number;
  average_attendance_rate?: number;
  sessions_by_type: Record<string, number>;
  sessions_by_facility: Record<string, number>;
  sessions_by_instructor: Record<string, number>;
  upcoming_sessions_count: number;
  sessions_this_week: number;
  sessions_this_month: number;
  average_session_duration?: number;
  facility_utilization_rate?: number;
}

// Calendar view types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  session: Session;
  color?: string;
  className?: string;
}

export interface CalendarView {
  month: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  selectedEvent?: CalendarEvent;
}

// UI component types
export interface ScheduleFormData {
  facility_id: string;
  title: string;
  session_type: SessionType;
  start_time: string;
  end_time: string;
  student_type?: string;
  skill_level?: string;
  max_participants?: number;
  instructor_ids: string[];
  student_ids: string[];
  recurring_pattern: RecurringPattern;
  notes?: string;
}

export interface ParticipantFormData {
  student_ids: string[];
  notes?: string;
}

export interface InstructorFormData {
  instructor_ids: string[];
  is_primary?: boolean;
  notes?: string;
}

// Student credit management types (from Feature Integration Guide)
export interface StudentCredit {
  student_id: string;
  remaining_credits: number;
  total_credits: number;
  course_enrollment_id?: string;
  course_name?: string;
  course_progress?: string;
  skill_level?: string;
}

export interface StudentEligibility {
  student_id: string;
  is_eligible: boolean;
  has_credits: boolean;
  remaining_credits: number;
  skill_level_match: boolean;
  recommended_difficulty?: string;
  warnings: string[];
}

export interface StudentForScheduling {
  id: string;
  name: string;
  email?: string;
  remaining_credits: number;
  course_enrollment?: {
    course_name: string;
    progress: string;
    skill_level: string;
  };
  eligibility: StudentEligibility;
}