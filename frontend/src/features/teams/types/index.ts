/**
 * Teams Feature Types
 */

// Team member types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'program_admin' | 'program_coordinator' | 'tutor';
  status: 'active' | 'inactive' | 'pending';
  phone?: string;
  joinDate: string;
  programId: string;
}

export interface TeamMemberCreate {
  name: string;
  email: string;
  role: 'program_admin' | 'program_coordinator' | 'tutor';
  phone?: string;
  programId: string;
}

export interface TeamMemberUpdate {
  name?: string;
  email?: string;
  role?: 'program_admin' | 'program_coordinator' | 'tutor';
  status?: 'active' | 'inactive' | 'pending';
  phone?: string;
}

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