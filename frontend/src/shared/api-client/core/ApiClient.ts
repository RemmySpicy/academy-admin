/**
 * Main API client with all service modules
 */

import { HttpClient } from './HttpClient';
import { ApiClientConfig } from './types';
import { AuthService } from '../services/AuthService';
import { ProgramService } from '../services/ProgramService';
import { UserService } from '../services/UserService';
import { CourseService } from '../services/CourseService';
import { StudentService } from '../services/StudentService';
import { FacilityService } from '../services/FacilityService';
import { CommunicationService } from '../services/CommunicationService';

export class ApiClient {
  public readonly http: HttpClient;
  public readonly auth: AuthService;
  public readonly programs: ProgramService;
  public readonly users: UserService;
  public readonly courses: CourseService;
  public readonly students: StudentService;
  public readonly facilities: FacilityService;
  public readonly communications: CommunicationService;

  constructor(config: ApiClientConfig) {
    this.http = new HttpClient(config);
    
    // Initialize all service modules
    this.auth = new AuthService(this.http);
    this.programs = new ProgramService(this.http);
    this.users = new UserService(this.http);
    this.courses = new CourseService(this.http);
    this.students = new StudentService(this.http);
    this.facilities = new FacilityService(this.http);
    this.communications = new CommunicationService(this.http);

    this.setupGlobalErrorHandling();
  }

  /**
   * Initialize client with authentication
   */
  async initialize(token?: string, refreshToken?: string): Promise<void> {
    if (token) {
      this.http.setAuthToken(token, refreshToken);
      
      try {
        // Verify token and get user info
        const userInfo = await this.auth.getCurrentUser();
        
        // Set up program context for non-super-admin users
        if (userInfo.data.role !== 'super_admin' && userInfo.data.program_assignments.length > 0) {
          const firstProgram = userInfo.data.program_assignments[0];
          this.http.setProgramContext(firstProgram.program_id, firstProgram.program_name);
        }
      } catch (error) {
        console.warn('Failed to initialize with provided token:', error);
        this.http.clearAuth();
      }
    }
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await this.auth.login(username, password);
      
      if (response.success && response.data.access_token) {
        this.http.setAuthToken(response.data.access_token, response.data.refresh_token);
        
        // Get user info and set program context
        const userInfo = await this.auth.getCurrentUser();
        if (userInfo.data.role !== 'super_admin' && userInfo.data.program_assignments.length > 0) {
          const firstProgram = userInfo.data.program_assignments[0];
          this.http.setProgramContext(firstProgram.program_id, firstProgram.program_name);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  /**
   * Logout and clear all authentication
   */
  async logout(): Promise<void> {
    try {
      await this.auth.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.http.clearAuth();
    }
  }

  /**
   * Switch program context (for super admin and multi-program users)
   */
  async switchProgram(programId: string): Promise<boolean> {
    try {
      const userInfo = await this.auth.getCurrentUser();
      
      // Check if user has access to the program
      const hasAccess = userInfo.data.role === 'super_admin' || 
        userInfo.data.program_assignments.some(p => p.program_id === programId);
      
      if (!hasAccess) {
        throw new Error('User does not have access to this program');
      }
      
      // Get program details
      const program = await this.programs.getProgram(programId);
      
      if (program.success) {
        this.http.setProgramContext(programId, program.data.name);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to switch program:', error);
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  isAuthenticated(): boolean {
    // This would check token validity
    return true; // Placeholder implementation
  }

  /**
   * Get current program context
   */
  getCurrentProgramContext(): { programId: string; programName?: string } | null {
    // This would return current program context
    return null; // Placeholder implementation
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    this.http.addErrorInterceptor(async (error) => {
      // Handle global errors like network issues, authentication failures, etc.
      switch (error.status) {
        case 401:
          // Authentication failed - trigger logout
          console.warn('Authentication failed, logging out...');
          await this.logout();
          break;
          
        case 403:
          // Access denied - might need program context switch
          console.warn('Access denied - check program context');
          break;
          
        case 500:
          // Server error - log for debugging
          console.error('Server error:', error);
          break;
          
        default:
          // Other errors
          console.error('API error:', error);
      }
      
      return error;
    });
  }
}