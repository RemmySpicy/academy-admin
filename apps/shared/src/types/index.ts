// Core Academy Types

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  profile_type: 'student' | 'parent' | 'tutor' | 'coordinator' | 'program_admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  currentProgram: Program | null;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Form Types
export interface FormFieldProps {
  name: string;
  control?: any;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Program Context Types
export interface ProgramContextValue {
  currentProgram: Program | null;
  availablePrograms: Program[];
  switchProgram: (programId: string) => Promise<void>;
  isLoading: boolean;
}

// Course Types
export interface Course {
  id: string;
  name: string;
  description?: string;
  program_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
}

export type { User as AuthUser };
export type { Program as AcademyProgram };
export type { Course as AcademyCourse };
export type { Enrollment as CourseEnrollment };