/**
 * User management types
 * Derived from backend user models and schemas
 */

import { AuditFields, UserRole, Status } from './common';
import { ProgramAssignment } from './auth';

/**
 * Base user information
 */
export interface User extends AuditFields {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  program_assignments: ProgramAssignment[];
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active?: boolean;
  program_ids?: string[];
}

/**
 * User update request
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

/**
 * User profile update (self-service)
 */
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * User search and filter parameters
 */
export interface UserSearchParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  program_id?: string;
  page?: number;
  per_page?: number;
}

/**
 * User statistics for admin dashboard
 */
export interface UserStats {
  total_users: number;
  active_users: number;
  users_by_role: Record<UserRole, number>;
  recent_logins: number;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  user_id: string;
  token_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  last_activity: string;
  is_active: boolean;
}

/**
 * Team member for tutor/coordinator apps
 */
export interface TeamMember {
  id: string;
  user: User;
  role: UserRole;
  program_assignments: ProgramAssignment[];
  contact_info?: {
    phone?: string;
    email: string;
    preferred_contact_method?: 'email' | 'phone' | 'app';
  };
}

/**
 * User role permissions matrix
 */
export interface RolePermissions {
  role: UserRole;
  permissions: {
    // Academy Administration
    manage_programs: boolean;
    manage_users: boolean;
    manage_system_settings: boolean;
    
    // Program Management
    manage_courses: boolean;
    manage_students: boolean;
    manage_facilities: boolean;
    manage_scheduling: boolean;
    manage_team: boolean;
    manage_payments: boolean;
    
    // Student Interaction
    view_student_progress: boolean;
    update_student_progress: boolean;
    communicate_with_students: boolean;
    communicate_with_parents: boolean;
    
    // Content Access
    access_course_content: boolean;
    create_assignments: boolean;
    grade_assignments: boolean;
    generate_reports: boolean;
  };
}