/**
 * Program context management utility
 */

import { ProgramContext } from '../core/types';
import { UserRole } from '../../types';

export class ProgramContextManager {
  private static readonly PROGRAM_CONTEXT_KEY = 'academy_program_context';
  
  private currentContext: ProgramContext | null = null;

  constructor() {
    this.loadContextFromStorage();
  }

  /**
   * Set current program context
   */
  setContext(programId: string, programName?: string, userRole?: UserRole, permissions?: string[]): void {
    this.currentContext = {
      programId,
      programName: programName || '',
      userRole: userRole || 'tutor',
      permissions: permissions || [],
    };
    
    this.saveContextToStorage();
  }

  /**
   * Get current program context
   */
  getContext(): ProgramContext | null {
    return this.currentContext;
  }

  /**
   * Get current program ID
   */
  getProgramId(): string | null {
    return this.currentContext?.programId || null;
  }

  /**
   * Get current program name
   */
  getProgramName(): string | null {
    return this.currentContext?.programName || null;
  }

  /**
   * Get current user role in program
   */
  getUserRole(): UserRole | null {
    return this.currentContext?.userRole || null;
  }

  /**
   * Get user permissions in current program
   */
  getPermissions(): string[] {
    return this.currentContext?.permissions || [];
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return this.currentContext?.permissions.includes(permission) || false;
  }

  /**
   * Check if context is set
   */
  hasContext(): boolean {
    return Boolean(this.currentContext?.programId);
  }

  /**
   * Clear program context
   */
  clearContext(): void {
    this.currentContext = null;
    this.removeContextFromStorage();
  }

  /**
   * Update context with new information
   */
  updateContext(updates: Partial<ProgramContext>): void {
    if (this.currentContext) {
      this.currentContext = { ...this.currentContext, ...updates };
      this.saveContextToStorage();
    }
  }

  /**
   * Validate if user can access a program
   */
  canAccessProgram(programId: string, userAssignments: any[]): boolean {
    // Super admin can access any program
    if (this.currentContext?.userRole === 'super_admin') {
      return true;
    }

    // Check if user is assigned to the program
    return userAssignments.some(assignment => assignment.program_id === programId);
  }

  /**
   * Get program context header value for API requests
   */
  getContextHeader(): string | null {
    return this.currentContext?.programId || null;
  }

  /**
   * Switch to different program context
   */
  switchContext(newProgramId: string, programName?: string): void {
    if (this.currentContext) {
      this.setContext(
        newProgramId,
        programName,
        this.currentContext.userRole,
        this.currentContext.permissions
      );
    } else {
      this.setContext(newProgramId, programName);
    }
  }

  /**
   * Load context from storage
   */
  private loadContextFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        const stored = localStorage.getItem(ProgramContextManager.PROGRAM_CONTEXT_KEY);
        if (stored) {
          this.currentContext = JSON.parse(stored);
        }
      } else {
        // Mobile environment - would use AsyncStorage
        console.log('Mobile context storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to load program context from storage:', error);
      this.currentContext = null;
    }
  }

  /**
   * Save context to storage
   */
  private saveContextToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        if (this.currentContext) {
          localStorage.setItem(
            ProgramContextManager.PROGRAM_CONTEXT_KEY,
            JSON.stringify(this.currentContext)
          );
        }
      } else {
        // Mobile environment
        console.log('Mobile context storage not implemented yet');
      }
    } catch (error) {
      console.error('Failed to save program context to storage:', error);
    }
  }

  /**
   * Remove context from storage
   */
  private removeContextFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Web environment
        localStorage.removeItem(ProgramContextManager.PROGRAM_CONTEXT_KEY);
      } else {
        // Mobile environment
        console.log('Mobile context storage cleanup not implemented yet');
      }
    } catch (error) {
      console.error('Failed to remove program context from storage:', error);
    }
  }
}