/**
 * Student management types
 * Derived from backend student models and schemas
 */

import { AuditFields, Status } from './common';
import { CourseEnrollment, StudentCourseProgress } from './course';

/**
 * Student entity
 */
export interface Student extends AuditFields {
  program_id: string;
  student_id: string; // Generated ID like STU-2025-0001
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender?: Gender;
  salutation?: string;
  referral_source?: string;
  enrollment_date: string;
  status: StudentStatus;
  address?: StudentAddress;
  emergency_contact?: EmergencyContact;
  medical_info?: MedicalInfo;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Gender options
 */
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/**
 * Student status
 */
export type StudentStatus = 
  | 'active'
  | 'inactive' 
  | 'graduated'
  | 'withdrawn'
  | 'suspended'
  | 'on_hold';

/**
 * Student address information
 */
export interface StudentAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: StudentAddress;
}

/**
 * Medical information
 */
export interface MedicalInfo {
  conditions?: string;
  medications?: string;
  allergies?: string;
  emergency_procedures?: string;
  physician_name?: string;
  physician_phone?: string;
  insurance_info?: string;
}

/**
 * Student creation request
 */
export interface CreateStudentRequest {
  program_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender?: Gender;
  salutation?: string;
  referral_source?: string;
  enrollment_date: string;
  status?: StudentStatus;
  address?: StudentAddress;
  emergency_contact?: EmergencyContact;
  medical_info?: MedicalInfo;
  notes?: string;
}

/**
 * Student update request
 */
export interface UpdateStudentRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  salutation?: string;
  referral_source?: string;
  status?: StudentStatus;
  address?: StudentAddress;
  emergency_contact?: EmergencyContact;
  medical_info?: MedicalInfo;
  notes?: string;
}

/**
 * Student with detailed information
 */
export interface StudentDetail extends Student {
  age: number;
  enrollments: CourseEnrollment[];
  progress: StudentCourseProgress[];
  attendance_records: AttendanceRecord[];
  assessment_results: AssessmentResult[];
  parent_contacts: ParentContact[];
  communication_log: CommunicationLog[];
}

/**
 * Student search parameters
 */
export interface StudentSearchParams {
  search?: string;
  status?: StudentStatus;
  program_id?: string;
  enrollment_date_from?: string;
  enrollment_date_to?: string;
  age_from?: number;
  age_to?: number;
  gender?: Gender;
  page?: number;
  per_page?: number;
}

/**
 * Student statistics
 */
export interface StudentStats {
  total_students: number;
  active_students: number;
  students_by_status: Record<StudentStatus, number>;
  students_by_gender: Record<Gender, number>;
  students_by_age_group: Record<string, number>;
  enrollment_trends: {
    month: string;
    enrolled: number;
    graduated: number;
    withdrawn: number;
  }[];
  average_age: number;
}

/**
 * Attendance record
 */
export interface AttendanceRecord extends AuditFields {
  student_id: string;
  course_id: string;
  lesson_id?: string;
  date: string;
  status: AttendanceStatus;
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
  marked_by: string;
}

/**
 * Attendance status
 */
export type AttendanceStatus = 
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'early_departure';

/**
 * Assessment result
 */
export interface AssessmentResult extends AuditFields {
  student_id: string;
  assessment_id: string;
  course_id: string;
  score: number;
  max_score: number;
  percentage: number;
  grade?: string;
  submitted_at?: string;
  graded_at?: string;
  graded_by?: string;
  feedback?: string;
  rubric_scores?: Record<string, number>;
}

/**
 * Parent/Guardian contact
 */
export interface ParentContact extends AuditFields {
  student_id: string;
  name: string;
  relationship: ParentRelationship;
  email: string;
  phone?: string;
  is_primary: boolean;
  is_emergency_contact: boolean;
  can_pickup: boolean;
  communication_preferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    app_notifications: boolean;
  };
  address?: StudentAddress;
}

/**
 * Parent relationship types
 */
export type ParentRelationship = 
  | 'mother'
  | 'father'
  | 'guardian'
  | 'grandparent'
  | 'stepparent'
  | 'other';

/**
 * Communication log entry
 */
export interface CommunicationLog extends AuditFields {
  student_id: string;
  contact_id?: string; // Parent/guardian
  staff_id: string;
  communication_type: CommunicationType;
  subject: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  metadata?: Record<string, any>;
}

/**
 * Communication types
 */
export type CommunicationType = 
  | 'email'
  | 'sms'
  | 'phone_call'
  | 'in_person'
  | 'app_notification'
  | 'parent_conference'
  | 'progress_report';

/**
 * Student bulk action request
 */
export interface StudentBulkAction {
  student_ids: string[];
  action: 'update_status' | 'send_communication' | 'export_data' | 'enroll_course';
  parameters: Record<string, any>;
}

/**
 * Student export data format
 */
export interface StudentExportData {
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
  filters?: StudentSearchParams;
  include_progress?: boolean;
  include_attendance?: boolean;
  include_assessments?: boolean;
}