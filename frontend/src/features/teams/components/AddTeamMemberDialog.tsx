'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Loader2 } from 'lucide-react';
import { teamApi, AvailableUser } from '@/features/teams/api';
import { isApiSuccess, getApiErrorMessage } from '@/lib/api';

interface AddTeamMemberDialogProps {
  onTeamMemberAdded: () => void;
  trigger?: React.ReactNode;
}

export function AddTeamMemberDialog({ onTeamMemberAdded, trigger }: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isDefaultProgram, setIsDefaultProgram] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available users when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    }
  }, [open, searchTerm]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await teamApi.getAvailableUsers({
        search: searchTerm || undefined,
        per_page: 50
      });

      if (isApiSuccess(response)) {
        setAvailableUsers(response.data.items);
      } else {
        setError(getApiErrorMessage(response));
      }
    } catch (err) {
      console.error('Error loading available users:', err);
      setError('Failed to load available users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedRole) {
      setError('Please select a user and role');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await teamApi.addTeamMember({
        user_id: selectedUserId,
        role: selectedRole,
        is_default_program: isDefaultProgram
      });

      if (isApiSuccess(response)) {
        // Reset form
        setSelectedUserId('');
        setSelectedRole('');
        setIsDefaultProgram(false);
        setSearchTerm('');
        setOpen(false);
        
        // Notify parent component
        onTeamMemberAdded();
      } else {
        setError(getApiErrorMessage(response));
      }
    } catch (err) {
      console.error('Error adding team member:', err);
      setError('Failed to add team member');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId('');
    setSelectedRole('');
    setIsDefaultProgram(false);
    setSearchTerm('');
    setError(null);
  };

  const selectedUser = availableUsers.find(user => user.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add an existing user to your program team with the appropriate role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading users...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email} • {user.username}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {availableUsers.length === 0 && !loading && (
                    <SelectItem value="_none" disabled>
                      No available users found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="font-medium">{selectedUser.full_name}</div>
                <div className="text-muted-foreground">{selectedUser.email}</div>
                <div className="text-xs mt-1">
                  Current roles: {selectedUser.roles.join(', ')}
                  {selectedUser.already_assigned && (
                    <span className="text-amber-600 ml-2">• Already assigned to other programs</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role in Program</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="program_admin">Program Admin</SelectItem>
                <SelectItem value="program_coordinator">Program Coordinator</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default Program Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default"
              checked={isDefaultProgram}
              onCheckedChange={(checked) => setIsDefaultProgram(checked as boolean)}
            />
            <Label htmlFor="default" className="text-sm">
              Set as user's default program
            </Label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedUserId || !selectedRole}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Team Member'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}