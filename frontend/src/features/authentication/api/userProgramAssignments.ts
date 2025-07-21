/**
 * User Program Assignments API Service
 * 
 * Handles API calls related to user-program assignments
 */

import { httpClient } from '@/lib/api/httpClient';
import { API_ENDPOINTS } from '@/lib/constants';
import { UserProgramAssignment } from '@/store/types';

// Temporary mock data until backend APIs are implemented
const mockUserProgramAssignments: UserProgramAssignment[] = [
  {
    id: 'assignment-1',
    userId: '6d39a023-8fd2-4820-9da3-ce71bde8eebb', // Actual admin user ID
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
  },
  {
    id: 'assignment-2',
    userId: '6d39a023-8fd2-4820-9da3-ce71bde8eebb', // Actual admin user ID
    programId: '7a5c3f2e-1b4a-4d6e-8f9a-2c3b4a5d6e7f',
    isDefault: false,
    assignedAt: new Date().toISOString(),
    assignedBy: 'admin-user-id',
    program: {
      id: '7a5c3f2e-1b4a-4d6e-8f9a-2c3b4a5d6e7f',
      name: 'Robotics Engineering',
      code: 'ROBOT',
      description: 'Hands-on robotics programming and engineering',
      category: 'Technology',
      status: 'ACTIVE',
      displayOrder: 2,
      isActive: true,
    }
  },
  {
    id: 'assignment-3',
    userId: '6d39a023-8fd2-4820-9da3-ce71bde8eebb', // Actual admin user ID
    programId: '9e8d7c6b-5a4f-3e2d-1c9b-8a7f6e5d4c3b',
    isDefault: false,
    assignedAt: new Date().toISOString(),
    assignedBy: 'admin-user-id',
    program: {
      id: '9e8d7c6b-5a4f-3e2d-1c9b-8a7f6e5d4c3b',
      name: 'Web Development',
      code: 'WEB',
      description: 'Full-stack web development program',
      category: 'Technology',
      status: 'ACTIVE',
      displayOrder: 3,
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
    // For now, use the programs API and create assignments for super admin
    // TODO: Replace with real user program assignments API when backend is ready
    try {
      const response = await httpClient.get(API_ENDPOINTS.programs.list);
      if (response.success && response.data && response.data.items) {
        // Convert programs to user program assignments
        const assignments: UserProgramAssignment[] = response.data.items.map((program: any, index: number) => ({
          id: `assignment-${program.id}`,
          userId: userId,
          programId: program.id,
          isDefault: index === 0, // First program is default
          assignedAt: new Date().toISOString(),
          assignedBy: 'system',
          program: {
            id: program.id,
            name: program.name,
            code: program.program_code,
            description: program.description,
            category: program.category,
            status: program.status,
            displayOrder: program.display_order,
            isActive: program.status === 'active',
          }
        }));
        return assignments;
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
    
    // Fallback to mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter assignments by user ID
        const userAssignments = mockUserProgramAssignments.filter(assignment => assignment.userId === userId);
        resolve(userAssignments);
      }, 500);
    });
  },

  /**
   * Get current user's program assignments
   */
  getCurrentUserProgramAssignments: async (): Promise<UserProgramAssignment[]> => {
    const response = await httpClient.get(API_ENDPOINTS.auth.programAssignments);
    if (response.success && response.data) {
      return response.data.assignments;
    }
    throw new Error(response.error || 'Failed to get program assignments');
  },

  /**
   * Create a new program assignment for a user
   */
  createUserProgramAssignment: async (data: CreateUserProgramAssignmentData): Promise<UserProgramAssignment> => {
    const response = await httpClient.post(API_ENDPOINTS.auth.userProgramAssignments, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create program assignment');
  },

  /**
   * Update a program assignment
   */
  updateUserProgramAssignment: async (
    assignmentId: string, 
    data: UpdateUserProgramAssignmentData
  ): Promise<UserProgramAssignment> => {
    const response = await httpClient.put(`${API_ENDPOINTS.auth.userProgramAssignments}/${assignmentId}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update program assignment');
  },

  /**
   * Delete a program assignment
   */
  deleteUserProgramAssignment: async (assignmentId: string): Promise<void> => {
    const response = await httpClient.delete(`${API_ENDPOINTS.auth.userProgramAssignments}/${assignmentId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete program assignment');
    }
  },

  /**
   * Set default program for a user
   */
  setDefaultProgram: async (userId: string, programId: string): Promise<void> => {
    const response = await httpClient.post(API_ENDPOINTS.auth.userDefaultProgram(userId), {
      program_id: programId
    });
    if (!response.success) {
      throw new Error(response.error || 'Failed to set default program');
    }
  },

  /**
   * Get user's default program
   */
  getUserDefaultProgram: async (userId: string): Promise<UserProgramAssignment | null> => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.auth.userDefaultProgram(userId));
      if (response.success && response.data) {
        return response.data;
      }
      return null;
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
      const response = await httpClient.get(API_ENDPOINTS.auth.userProgramAccess(userId, programId));
      if (response.success && response.data) {
        return response.data.has_access;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
};

export default userProgramAssignmentsApi;