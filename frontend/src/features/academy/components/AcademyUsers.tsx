'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Settings,
  User as UserIcon,
  Users as UsersIcon
} from 'lucide-react';
import {
  useAcademyUsers,
  useAcademyUserStats,
  useCreateAcademyUser,
  useUpdateAcademyUser,
  useDeleteAcademyUser,
  useAssignUserToProgram,
  useRemoveUserFromProgram
} from '../hooks/useAcademyUsers';
import { User, UserCreate, UserUpdate } from '@/lib/api/types';
import { UserCreateDialog, UserEditDialog, UserViewDialog, ProgramAssignmentDialog } from './dialogs';

type UserRole = 'super_admin' | 'program_admin' | 'program_coordinator' | 'instructor' | 'student' | 'parent';

interface UserSearchParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  program_id?: string;
  page?: number;
  per_page?: number;
}

/**
 * Academy Users Management Component
 * 
 * Provides super admin interface for managing all users across the academy
 */
export function AcademyUsers() {
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 1,
    per_page: 20
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [programAssignmentDialogOpen, setProgramAssignmentDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Queries
  const { data: usersData, isLoading, error } = useAcademyUsers(searchParams);
  const { data: stats } = useAcademyUserStats();

  // Mutations
  const createUserMutation = useCreateAcademyUser();
  const updateUserMutation = useUpdateAcademyUser();
  const deleteUserMutation = useDeleteAcademyUser();
  const assignUserMutation = useAssignUserToProgram();
  const removeUserMutation = useRemoveUserFromProgram();

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleRoleFilter = (role: UserRole | '') => {
    setSearchParams(prev => ({ 
      ...prev, 
      role: role || undefined, 
      page: 1 
    }));
  };

  const handleStatusFilter = (isActive: boolean | '') => {
    setSearchParams(prev => ({ 
      ...prev, 
      is_active: isActive === '' ? undefined : isActive, 
      page: 1 
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (!usersData?.items) return;
    
    setSelectedUsers(
      selectedUsers.length === usersData.items.length 
        ? [] 
        : usersData.items.map(user => user.id)
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };

  // Dialog handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setCreateDialogOpen(true);
  };

  const handleManageUserPrograms = (user: User) => {
    setSelectedUser(user);
    setProgramAssignmentDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    // Refresh users data after successful operations
    // The react-query will automatically refetch
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;
    
    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      // Handle bulk actions (would need to implement in API)
      // For now, handle one by one
      for (const userId of selectedUsers) {
        switch (action) {
          case 'activate':
            await updateUserMutation.mutateAsync({ 
              id: userId, 
              data: { is_active: true } 
            });
            break;
          case 'deactivate':
            await updateUserMutation.mutateAsync({ 
              id: userId, 
              data: { is_active: false } 
            });
            break;
          case 'delete':
            await deleteUserMutation.mutateAsync(userId);
            break;
        }
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const getUserRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'program_admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'program_coordinator':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'instructor':
        return <UserCheck className="h-4 w-4 text-orange-600" />;
      case 'student':
        return <UserIcon className="h-4 w-4 text-purple-600" />;
      case 'parent':
        return <UserPlus className="h-4 w-4 text-indigo-600" />;
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleDisplayName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      program_admin: 'Program Admin',
      program_coordinator: 'Program Coordinator',
      instructor: 'Instructor',
      student: 'Student',
      parent: 'Parent'
    };
    return roleNames[role] || role;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading users</div>
          <div className="text-muted-foreground mb-4">{error.message}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">All system users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(stats?.users_by_role?.super_admin || 0) + (stats?.users_by_role?.program_admin || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Super & Program Admins</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.users_by_role?.instructor || 0}
            </div>
            <p className="text-xs text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.users_by_role?.program_coordinator || 0}
            </div>
            <p className="text-xs text-muted-foreground">Program coordinators</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Manage all system users, roles, and program assignments
              </CardDescription>
            </div>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users by name, email, or username..."
                className="pl-10"
                value={searchParams.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select value={searchParams.role || ''} onValueChange={(value) => handleRoleFilter(value as UserRole | '')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="program_admin">Program Admin</SelectItem>
                <SelectItem value="program_coordinator">Program Coordinator</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={searchParams.is_active === undefined ? '' : searchParams.is_active.toString()} onValueChange={(value) => handleStatusFilter(value === '' ? '' : value === 'true')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Deactivate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Checkbox
                      checked={selectedUsers.length === (usersData?.items?.length || 0) && (usersData?.items?.length || 0) > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Programs</th>
                  <th className="text-left p-3 font-medium">Last Login</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : usersData?.items?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  usersData?.items?.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.first_name[0]}{user.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getUserRoleIcon(user.role)}
                          <span className="text-sm">{getRoleDisplayName(user.role)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.is_active)}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {user.program_assignments && user.program_assignments.length > 0 ? (
                            <div>
                              {user.program_assignments.slice(0, 2).map((assignment, index) => (
                                <div key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mr-1 mb-1">
                                  {assignment.program_name || assignment.program_id}
                                </div>
                              ))}
                              {user.program_assignments.length > 2 && (
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                                  +{user.program_assignments.length - 2}
                                </div>
                              )}
                            </div>
                          ) : user.role === 'super_admin' ? (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              System-wide
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No assignments</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleViewUser(user)}
                            title="View Details"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleManageUserPrograms(user)}
                            title="Manage Program Assignments"
                            className="h-8 w-8 p-0"
                          >
                            <UsersIcon className="h-4 w-4" />
                          </Button>
                          {/* Only show delete for non-super-admin users */}
                          {!user.roles?.includes('super_admin') && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData && usersData.total > usersData.per_page && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((searchParams.page || 1) - 1) * usersData.per_page + 1} to {Math.min((searchParams.page || 1) * usersData.per_page, usersData.total)} of {usersData.total} users
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={(searchParams.page || 1) === 1}
                  onClick={() => handlePageChange((searchParams.page || 1) - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {searchParams.page || 1} of {usersData.pages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={(searchParams.page || 1) === usersData.pages}
                  onClick={() => handlePageChange((searchParams.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleDialogSuccess}
      />
      
      <UserEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onSuccess={handleDialogSuccess}
      />
      
      <UserViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        user={selectedUser}
        onEdit={() => {
          setViewDialogOpen(false);
          setEditDialogOpen(true);
        }}
        onManagePrograms={() => {
          setViewDialogOpen(false);
          handleManageUserPrograms(selectedUser!);
        }}
      />
      
      <ProgramAssignmentDialog
        open={programAssignmentDialogOpen}
        onOpenChange={setProgramAssignmentDialogOpen}
        user={selectedUser}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}