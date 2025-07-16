/**
 * User Program Assignments API Service
 * 
 * Handles API calls related to user-program assignments
 */

import { apiClient } from '@/lib/api';
import { UserProgramAssignment } from '@/store/types';

// Temporary mock data until backend APIs are implemented
const mockUserProgramAssignments: UserProgramAssignment[] = [
  {
    id: 'assignment-1',
    userId: 'user-1',
    programId: '8482438e-34b1-42fa-8653-7688866a012b',
    isDefault: true,
    assignedAt: new Date().toISOString(),
    assignedBy: 'admin-user-id',
    program: {
      id: '8482438e-34b1-42fa-8653-7688866a012b',
      name: 'Swimming',
      code: 'SWIM',
      description: 'Swimming program for all skill levels',
      category: 'Sports',
      status: 'ACTIVE',
      displayOrder: 1,
      isActive: true,
    }
  }
];

export interface CreateUserProgramAssignmentData {
  userId: string;
  programId: string;
  isDefault?: boolean;
}

export interface UpdateUserProgramAssignmentData {
  isDefault?: boolean;
}

/**
 * User Program Assignments API Client
 */
export const userProgramAssignmentsApi = {
  /**
   * Get all program assignments for a user
   */
  getUserProgramAssignments: async (userId: string): Promise<UserProgramAssignment[]> => {
    // Temporary mock implementation - replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUserProgramAssignments);
      }, 500);
    });
    
    // Real API call (uncomment when backend is ready):
    // const response = await apiClient.get(`/auth/users/${userId}/program-assignments`);
    // return response.data.assignments;
  },

  /**
   * Get current user's program assignments
   */
  getCurrentUserProgramAssignments: async (): Promise<UserProgramAssignment[]> => {
    const response = await apiClient.get('/auth/me/program-assignments');
    return response.data.assignments;
  },

  /**
   * Create a new program assignment for a user
   */
  createUserProgramAssignment: async (data: CreateUserProgramAssignmentData): Promise<UserProgramAssignment> => {
    const response = await apiClient.post('/auth/user-program-assignments', data);
    return response.data;
  },

  /**
   * Update a program assignment
   */
  updateUserProgramAssignment: async (
    assignmentId: string, 
    data: UpdateUserProgramAssignmentData
  ): Promise<UserProgramAssignment> => {
    const response = await apiClient.put(`/auth/user-program-assignments/${assignmentId}`, data);
    return response.data;
  },

  /**
   * Delete a program assignment
   */
  deleteUserProgramAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/auth/user-program-assignments/${assignmentId}`);
  },

  /**
   * Set default program for a user
   */
  setDefaultProgram: async (userId: string, programId: string): Promise<void> => {
    await apiClient.post(`/auth/users/${userId}/default-program`, {
      program_id: programId
    });
  },

  /**
   * Get user's default program
   */
  getUserDefaultProgram: async (userId: string): Promise<UserProgramAssignment | null> => {
    try {
      const response = await apiClient.get(`/auth/users/${userId}/default-program`);
      return response.data;
    } catch (error) {
      // Return null if no default program is set
      return null;
    }
  },

  /**
   * Check if user has access to a program
   */
  checkProgramAccess: async (userId: string, programId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/auth/users/${userId}/program-access/${programId}`);
      return response.data.has_access;
    } catch (error) {
      return false;
    }
  },
};

export default userProgramAssignmentsApi;