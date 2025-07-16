export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  full_name: string;
  role: 'super_admin' | 'program_admin' | 'program_coordinator' | 'tutor';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  programs?: Program[];
}

export interface Program {
  id: string;
  name: string;
  code: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'program_admin' | 'program_coordinator' | 'tutor';
  programIds?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: 'super_admin' | 'program_admin' | 'program_coordinator' | 'tutor';
  isActive?: boolean;
}