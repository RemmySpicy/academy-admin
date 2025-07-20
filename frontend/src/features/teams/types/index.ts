/**
 * Teams Feature Types
 */

// Re-export API types for consistency
export type {
  TeamMember,
  AvailableUser,
  TeamStats,
  TeamMemberListResponse,
  AvailableUserListResponse,
  AddTeamMemberRequest,
  UpdateTeamMemberRequest,
  TeamSearchParams,
  AvailableUsersParams
} from '../api/teamApi';

// Team assignment types
export interface TeamAssignment {
  id: string;
  memberId: string;
  assignmentType: 'class' | 'student_group' | 'activity';
  assignmentId: string;
  assignmentName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface TeamAssignmentCreate {
  memberId: string;
  assignmentType: 'class' | 'student_group' | 'activity';
  assignmentId: string;
  startDate: string;
  endDate?: string;
}

// Team role permissions
export interface RolePermissions {
  role: string;
  permissions: string[];
  description: string;
}

// Team statistics
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  membersByRole: Record<string, number>;
  recentActivity: number;
}