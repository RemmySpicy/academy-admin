'use client';

import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, X, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PersonSearchAndSelect } from '@/components/ui/forms';

interface TeamAssignment {
  user_id: string;
  role: string;
  user_details?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

interface TeamAssignmentTabProps {
  form: UseFormReturn<any>;
}

interface SelectedUser {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  profile_type: 'full_user' | 'profile_only';
  roles: string[];
}

const assignableRoles = [
  { value: 'program_admin', label: 'Program Admin' },
  { value: 'program_coordinator', label: 'Program Coordinator' },
  { value: 'instructor', label: 'Instructor' },
];

export function TeamAssignmentTab({ form }: TeamAssignmentTabProps) {
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [error, setError] = useState<string>('');

  const teamAssignments = form.watch('team_assignments') || [];

  const handleAddTeamMember = () => {
    setError('');

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    // Check if user is already assigned
    if (teamAssignments.some((assignment: TeamAssignment) => assignment.user_id === selectedUser.id)) {
      setError('This user is already assigned to the program');
      return;
    }

    const newAssignment: TeamAssignment = {
      user_id: selectedUser.id,
      role: selectedRole,
      user_details: {
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
      },
    };

    form.setValue('team_assignments', [...teamAssignments, newAssignment]);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleRemoveTeamMember = (userId: string) => {
    const updatedAssignments = teamAssignments.filter(
      (assignment: TeamAssignment) => assignment.user_id !== userId
    );
    form.setValue('team_assignments', updatedAssignments);
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'program_admin':
        return 'bg-red-100 text-red-800';
      case 'program_coordinator':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleConfig = assignableRoles.find(r => r.value === role);
    return roleConfig?.label || role;
  };

  return (
    <div className="space-y-6">
      {/* Current Team Assignments */}
      {teamAssignments.length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assigned Team Members ({teamAssignments.length})
            </h4>
            <p className="text-sm text-muted-foreground">
              These users will be granted access to this program immediately upon creation
            </p>
          </div>
          
          <div className="space-y-3">
            {teamAssignments.map((assignment: TeamAssignment) => (
              <Card key={assignment.user_id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={''} alt="" />
                      <AvatarFallback className="text-xs">
                        {assignment.user_details 
                          ? getUserInitials(assignment.user_details.first_name, assignment.user_details.last_name)
                          : assignment.user_id.substring(0, 2).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {assignment.user_details 
                          ? `${assignment.user_details.first_name} ${assignment.user_details.last_name}`
                          : `User ID: ${assignment.user_id}`
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.user_details?.email && `${assignment.user_details.email} • `}
                        Will be assigned as {getRoleLabel(assignment.role)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(assignment.role)}>
                      {getRoleLabel(assignment.role)}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(assignment.user_id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Team Member */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Team Member</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign users to this program with specific roles. You can also manage teams later in the Teams section.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <PersonSearchAndSelect
                selectedPersons={selectedUser ? [selectedUser] : []}
                onPersonSelect={(person) => setSelectedUser(person)}
                onPersonRemove={() => setSelectedUser(null)}
                onSearchFunction={async (query) => {
                  try {
                    const { userApi } = await import('@/features/authentication/api/userApi');
                    const response = await userApi.searchForTeamAssignment(query);
                    
                    if (response.success && response.data) {
                      // Convert RealUser to UserSearchResult format
                      return response.data.items.map(user => ({
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        phone: user.phone,
                        profile_type: user.profile_type,
                        roles: user.roles
                      }));
                    }
                    return [];
                  } catch (error) {
                    console.error('Error searching users:', error);
                    return [];
                  }
                }}
                placeholder="Search for users by name or email..."
                allowMultiple={false}
                maxSelections={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={handleAddTeamMember}
            disabled={!selectedUser || !selectedRole}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-red-700">Program Admin:</span>
              <span className="text-muted-foreground ml-2">
                Full program management access including courses, curricula, scheduling, and team management
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Program Coordinator:</span>
              <span className="text-muted-foreground ml-2">
                Student-focused operations including enrollment, progress tracking, and basic scheduling
              </span>
            </div>
            <div>
              <span className="font-medium text-green-700">Instructor:</span>
              <span className="text-muted-foreground ml-2">
                Session delivery, attendance tracking, and student interaction capabilities
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Team assignments are optional during program creation</p>
        <p>• You can always add or modify team members later in the Teams section</p>
        <p>• Each user can have different roles across different programs</p>
        <p>• Users will receive immediate access to the program upon creation</p>
      </div>
    </div>
  );
}