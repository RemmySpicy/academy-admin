/**
 * Authentication and authorization types
 * Derived from backend/app/features/authentication/schemas/auth.py
 */

import { UserRole } from './common';

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response with JWT token
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

/**
 * Current user information
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  program_assignments: ProgramAssignment[];
}

/**
 * User program assignment
 */
export interface ProgramAssignment {
  id: string;
  program_id: string;
  program_name: string;
  assigned_at: string;
  assigned_by: string;
}

/**
 * JWT token payload structure
 */
export interface TokenPayload {
  sub: string; // user ID
  username: string;
  role: UserRole;
  program_assignments: string[];
  exp: number;
  iat: number;
}

/**
 * Authentication state for apps
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Login form validation errors
 */
export interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * User registration data (for student/parent registration)
 */
export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  role: 'student' | 'parent';
  program_id?: string;
}

/**
 * Role-based route access configuration
 */
export interface RouteAccess {
  roles: UserRole[];
  requiresProgram?: boolean;
  adminOnly?: boolean;
}